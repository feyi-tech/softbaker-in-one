const FieldValue = require('firebase-admin').firestore.FieldValue;
const Web3 = require("web3").default;
const { getCoinsPrices, getCoinBalanceKey } = require('./utils');
const { COINS, PRECISION } = require('./utils/c');
const { weiToEther, callWeb3Func } = require('./utils/f');
const { defineString } = require('firebase-functions/params');
const WalletFactory = require('./WalletFactory');


const senderAddress = defineString('WALLET_CREATOR_PK'); // {value: () => process.env.WALLET_CREATOR_PK}// // Replace with the actual sender address
const senderPrivateKey = defineString('WALLET_CREATOR_SK'); // {value: () => process.env.WALLET_CREATOR_SK}// Replace with the private key of the sender wallet

var lastWeb3

const getNewWallets = (admin, coin) => {
    const walletsInfo = [];
    const web3 = new Web3(COINS[coin].abiData.web3);
    const db = admin.firestore();

    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await db.collection('wallets')
            .where(getCoinBalanceKey(coin, "contract_created"), '==', false)
            .where(getCoinBalanceKey(coin, "create_hash_salt"), '==', '')
            .get();
            
            if (snapshot.empty) {
                //console.log('No matching documents.');
                resolve([]); // Resolve with an empty array if no documents are found
                return;
            }

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const paddedSalt = web3.utils.rightPad(
                    web3.utils.asciiToHex(data.salt.toLowerCase()),
                    64
                );
                walletsInfo.push({
                    docId: doc.id,
                    [getCoinBalanceKey(coin)]: BigInt(data[getCoinBalanceKey(coin)]),
                    paddedSalt,
                    salt: data.salt
                });
            });

            // Sort walletsInfo by bnb_balance in descending order
            walletsInfo.sort((a, b) => (a[getCoinBalanceKey(coin)] > b[getCoinBalanceKey(coin)] ? -1 : 1));

            resolve(
                //Some wallets might have been created but db the update to indicate it might have failed
                await excludeCreatedWallets(admin, coin, walletsInfo)
            );
        } catch (error) {
            console.error("Error fetching wallets:", error);
            reject(error);
        }
    });
};

//This function needs to return only wallet that has not been created on the blockchain.
//And indicates the ones that has been created by writing to the db.
const excludeCreatedWallets = (admin, coin, walletsInfo) => {
    const walletsInfoUpdate = [];
    const db = admin.firestore();
    const factory = new WalletFactory(COINS[coin].abiData.address, COINS[coin].abiData.abi, COINS[coin].abiData.web3, coin);

    return new Promise(async (resolve, reject) => {
        const batch = db.batch();
        let create_hash_salt;

        try {
            // Run all balance checks in parallel
            const balancePromises = walletsInfo.map(async walletInfo => {
                const balanceInfo = await factory.getSaltBalance(walletInfo.salt);
                if (balanceInfo.isCreated) {
                    if (!create_hash_salt) create_hash_salt = walletInfo.salt;
                    const docRef = db.collection('wallets').doc(walletInfo.docId);
                    batch.update(docRef, { [getCoinBalanceKey(coin, "create_hash_salt")]: create_hash_salt });
                } else {
                    walletsInfoUpdate.push(walletInfo);
                }
            });

            // Wait for all balance checks to complete
            await Promise.all(balancePromises);

            if (!create_hash_salt) {
                return resolve(walletsInfo); // No created wallets, return original list
            } else {
                const colDocRef = db.collection('wallets_create_hash').doc();
                const wallets_create_hash_doc = {
                    hash: "check-block-chain",
                    coin,
                    create_hash_salt,
                    confirmed: true,
                    created_on: FieldValue.serverTimestamp()
                };
                batch.create(colDocRef, wallets_create_hash_doc);

                // Commit the batch
                const dbCommitResult = await commitRetry(batch, 3);
                console.log('excludeCreatedWallets.db.commits:', "attempts:", dbCommitResult.attempts);
                resolve(walletsInfoUpdate);
            }
        } catch (e) {
            console.error('excludeCreatedWallets.db.commitsError:', e);
            reject(e);
        }
    });
};

const txConfirmationResult = async (coin, hash) => {
    try {
        // Initialize Web3 for the given coin
        //const web3 = new Web3(COINS[coin].abiData.web3);

        // Fetch transaction details
        //const transaction = await web3.eth.getTransaction(hash);
        const [web3, transaction] = await callWeb3Func(coin, lastWeb3, web3 => {
            return web3.eth.getTransaction(hash)
        });
        lastWeb3 = web3

        // If transaction does not exist, return `ok: false`
        if (!transaction) {
            return { ok: false };
        }

        // If the transaction is still pending, return `null`
        if (transaction.blockNumber === null) {
            return null;
        }

        // Get the latest block number to calculate confirmations
        const latestBlockNumber = await web3.eth.getBlockNumber()

        const confirmations = latestBlockNumber - transaction.blockNumber;

        console.log("confirmations:", confirmations)

        // If confirmed 5 or more times, return `ok: true`; otherwise, return `null`
        return confirmations >= COINS[coin].requiredConfirmations ? { ok: true } : null;

    } catch (error) {
        console.error("Error fetching transaction confirmation:", error);
        return { ok: false };
    }
};

const checkPendingWalletCreateTx = (admin, coin) => {

    return new Promise(async (resolve, reject) => {
        try {
            const db = admin.firestore();

            const snapshot = await db.collection('wallets_create_hash')
            .where('coin', '==', coin)
            .where('confirmed', '==', false)
            .orderBy('created_on', 'asc')
            .limit(1)
            .get();
            
            if (snapshot.empty) {
                //console.log('No matching documents.');
                return resolve();
            }

            const doc = snapshot.docs[0]

            const data = doc.data();
            console.log("data:", data)
            const hash = data.hash;
            var result = await txConfirmationResult(coin, hash)
            console.log("result:::", result)
            //result = null
            if(result) {
                const batch = db.batch();
                const docRef = db.collection('wallets_create_hash').doc(doc.id); 
                
                if(result.ok) {
                    batch.update(docRef, {
                        confirmed: true,
                        confirmed_on: FieldValue.serverTimestamp()
                    });

                } else {
                    batch.delete(docRef);

                    const snaps = await db.collection('wallets')
                    .where(getCoinBalanceKey(coin, "contract_created"), '==', false)
                    .where(getCoinBalanceKey(coin, "create_hash_salt"), '==', data.create_hash_salt)
                    .get();

                    snaps.docs.forEach(doc => {
                        const sRef = db.collection('wallets').doc(doc.id);
                        batch.update(sRef, {
                            [getCoinBalanceKey(coin, "create_hash_salt")]: '',
                        })
                    });
                }
                try {
                    await batch.commit();
                } catch(e) {
                    return reject(e)
                }
            }
            resolve()

        } catch(error) {
            reject(error)
        }
    })
}

const getCoinPrice = (admin, coin) => {

    return new Promise(async (resolve, reject) => {
        try {
            const priceData = await getCoinsPrices(admin)
            let coinPrice = priceData[`${COINS[coin].coingecko_price_key}_usd`]
            resolve(coinPrice)

        } catch(e) {
            reject(e)
        }
    })
}

const commitRetry = async (batch, retryTimes) => {
    let attempt = 0;
    while (attempt < retryTimes) {
        try {
            // Attempt to commit the batch
            const result = await batch.commit();
            console.log('Batch committed successfully on attempt:', attempt + 1);
            return {result, attempts: attempt + 1}; // Exit the function if successful
        } catch (error) {
            attempt++;
            console.error(`Batch commit attempt ${attempt} failed:`, error);

            if (attempt >= retryTimes) {
                // Throw the error if the maximum number of retries is reached
                throw new Error(`Batch commit failed after ${retryTimes} attempts: ${error.message}`);
            }

            // Optionally, add a delay before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
    }
};

const transferToStakeHolders = (admin, coin, minBalance, remainderForNextTxGasFeeInUsd) => {
    const stakeHolders = [
        {
            bnb_addr: "0x096b0b0cDCE725ed6A9853be686f5f838e2b48f6",
            eth_addr: "0x096b0b0cDCE725ed6A9853be686f5f838e2b48f6",
            pct: 50
        },
        {
            bnb_addr: "0x4991F8FDcc9DD71fddc3Ea79F92c47C8FB2BC54F",
            eth_addr: "0x4991F8FDcc9DD71fddc3Ea79F92c47C8FB2BC54F",
            pct: 50
        }
    ];

    return new Promise(async (resolve, reject) => {
        try {

            //const web3 = new Web3(COINS[coin].coinDistributorAbiData.web3);
            const contractAddress = COINS[coin].coinDistributorAbiData.address;
            
            const coinPrice = await getCoinPrice(admin, coin);


            const [web3, sBalance] = await callWeb3Func(coin, lastWeb3, web3 => {
                return web3.eth.getBalance(senderAddress.value())
            });
            lastWeb3 = web3

            const contract = new web3.eth.Contract(COINS[coin].coinDistributorAbiData.abi, contractAddress);

            const senderBalance = BigInt(sBalance);

            // Convert balance to Ether and then to USD
            const senderBalanceInEth = weiToEther(senderBalance, COINS[coin].decimals, PRECISION);
            const senderBalanceInUsd = senderBalanceInEth * coinPrice;

            // Minimum balance check
            if (senderBalanceInUsd < minBalance) {
                return reject(new Error("Insufficient balance to distribute to stakeholders."));
            }

            // Calculate amount to transfer, leaving 5 USD in the sender's wallet
            const amountToTransferUsd = senderBalanceInUsd - remainderForNextTxGasFeeInUsd;

            // Prepare lists for recipients and amounts
            const recipients = [];
            const initialAmounts = [];
            for (const stakeholder of stakeHolders) {
                const stakeholderShareUsd = amountToTransferUsd * (stakeholder.pct / 100);
                const stakeholderShareEth = stakeholderShareUsd / coinPrice;
                const stakeholderAddress = stakeholder[getCoinBalanceKey(coin, "addr")];

                //console.log("stakeholderShareUsd", stakeholderShareUsd)
                //console.log("stakeholderShareEth", stakeholderShareEth)
                //console.log("stakeholderAddress", stakeholderAddress)
                
                // Convert share to Wei and populate arrays
                const stakeholderShareInWei = BigInt(web3.utils.toWei(stakeholderShareEth.toString(), 'ether'));
                recipients.push(stakeholderAddress);
                initialAmounts.push(stakeholderShareInWei);
            }

            const totalInitialAmount = initialAmounts.reduce((sum, amount) => sum + amount, BigInt(0));

            const transactionObject = contract.methods.distribute(recipients, initialAmounts);

            // Estimate gas for the distribute transaction
            const gasEstimate = BigInt(await transactionObject.estimateGas({
                from: senderAddress.value(),
                value: totalInitialAmount
            }));

            // Get current gas price
            const gasPrice = BigInt(await web3.eth.getGasPrice());
            const totalGasFeeInWei = gasEstimate * gasPrice;

            // Calculate the total amount in Wei that can be distributed after accounting for gas
            const totalAvailableForDistribution = senderBalance - totalGasFeeInWei - BigInt(web3.utils.toWei((remainderForNextTxGasFeeInUsd / coinPrice).toString(), 'ether'));

            // Calculate adjustment factor to scale down each amount proportionally

            const scale = 10n ** 18n; // Large enough scale factor for precision
            const adjustmentFactor = (totalAvailableForDistribution * scale) / totalInitialAmount;

            // Adjust each stakeholder's amount
            const adjustedAmounts = initialAmounts.map(amount => (amount * adjustmentFactor) / scale);


            // Execute the distribution with the adjusted amounts
            const adjustedAmountsTotal = adjustedAmounts.reduce((sum, amount) => sum + amount, BigInt(0));
            
            // Build the final transaction
            const rawTransaction = {
                from: senderAddress.value(),
                to: contractAddress,
                gas: Number(gasEstimate),
                data: contract.methods.distribute(recipients, adjustedAmounts).encodeABI(),
                value: adjustedAmountsTotal,
                nonce: await web3.eth.getTransactionCount(senderAddress.value()),
                gasPrice: gasPrice.toString(),
            };

            // Sign and send the transaction
            const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, senderPrivateKey.value());

            const db = admin.firestore()

            try {
                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                .on('transactionHash', (hash) => {
                    console.log('Distribution.TransactionHash:', hash);
                    
                    // Create a result object with transaction hash and distributed amounts
                    const result = {
                        transactionHash: hash,
                        coin,
                        distributions: recipients.map((recipient, index) => ({
                            address: recipient,
                            amount_in_units: adjustedAmounts[index].toString(),
                            amount_in_coin: weiToEther(adjustedAmounts[index], COINS[coin].decimals, PRECISION)
                        }))
                    };
                    console.log('Distribution.dbLog:', result);

                    // Prepare a batch to perform multiple writes
                    const batch = db.batch();

                    // Reference to the document to create
                    const distributionsDocRef = db.collection('owners_distributions').doc();
                    const distributionsStatDocRef = db.doc('admin/owners_distributions_stats');

                    batch.create(distributionsDocRef, {
                        ...result,
                        distributed_on: FieldValue.serverTimestamp()
                    });

                    const distributedAmount = weiToEther(adjustedAmountsTotal, COINS[coin].decimals, PRECISION);

                    const dbStats = {
                        [getCoinBalanceKey(coin, "last_distribution_hash")]: result.transactionHash,
                        [getCoinBalanceKey(coin, "last_distribution_doc_id")]: distributionsDocRef.id,
                        [getCoinBalanceKey(coin, "last_distributed_amount")]: distributedAmount,
                        [getCoinBalanceKey(coin, "all_time_distributions_amounts")]: FieldValue.increment(distributedAmount),
                        [getCoinBalanceKey(coin, "all_time_distributions_counts")]: FieldValue.increment(1),
                        [getCoinBalanceKey(coin, "last_distributed_on")]: FieldValue.serverTimestamp(),
                    };

                    batch.set(distributionsStatDocRef, dbStats, { merge: true });

                    console.log('Distribution.dbStats:', dbStats);

                    commitRetry(batch, 3)
                    .then(dbCommitResult => {
                        console.log('Distribution.db.commits:', [result, dbStats], "attempts:", dbCommitResult.attempts);
                        resolve(result);
                    })
                    .catch(e => {
                        console.error('Distribution.db.commitsError:', e, [result, dbStats]);
                        reject(e);
                    })
                })
                .on('error', (error) => {
                    console.error('Transaction Error:', error.message);
                    reject(new Error(`Transaction failed: ${error.message}`));
                });


            } catch(e) {
                return reject(new Error(`contract.methods.distribute: ${e.message}`))
            }

        } catch (e) {
            reject(e);
        }
    });
};

const getDistributionSettings = async (admin) => {
    // Reference to the firestore document at cache/owners_distribution_settings
    const distributionSettingsDocRef = admin.firestore().doc('cache/owners_distribution_settings');
    // Attempt to fetch the price data from the cache
    const distributionSettingsSnapshot = await distributionSettingsDocRef.get();

    if (distributionSettingsSnapshot.exists) {
        return distributionSettingsSnapshot.data();

    } else {
        return {
            distribution_balance_threshold_usd: 4000,
            next_distribution_gas_fee_usd: 20,
            wallets_balance_threshold_usd: 2000
        }
    }
}

const splitFunds = (admin, coin) => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = admin.firestore();

            // Initialize Web3 for the given coin
            //const web3 = new Web3(COINS[coin].abiData.web3);
            await checkPendingWalletCreateTx(admin, coin);
            const walletsInfo = await getNewWallets(admin, coin);
            if (walletsInfo.length === 0) {
                const {
                    distribution_balance_threshold_usd,
                    next_distribution_gas_fee_usd
                } = await getDistributionSettings(admin);

                try {
                    const result = await transferToStakeHolders(
                        admin, coin, distribution_balance_threshold_usd, next_distribution_gas_fee_usd
                    );

                    return resolve(result);

                } catch(e) {
                    return resolve({message: "No wallets found to create/ " + e.message});
                }

            }
    
            const contractAddress = COINS[coin].abiData.address;
            
            // Calculate return amount to ensure balance consistency
            let returnCoinAmount
    
            // Sort salts by balance descending, and map to padded salts array
            let paddedSalts = walletsInfo.map(walletInfo => walletInfo.paddedSalt);
            
            const totalWalletsAmount = walletsInfo.reduce((sum, walletInfo) => sum + walletInfo[getCoinBalanceKey(coin)], BigInt(0));
            
            const totalWalletsAmountInEth = weiToEther(totalWalletsAmount, COINS[coin].decimals, PRECISION);
            const coinPrice = await getCoinPrice(admin, coin);
            const totalWalletsAmountInUsd = totalWalletsAmountInEth * coinPrice;
            
            const {
                wallets_balance_threshold_usd,
                distribution_balance_threshold_usd,
                next_distribution_gas_fee_usd
            } = await getDistributionSettings(admin);

            //If the total amounts in all the wallets to create is less than the minimum 
            // they have to be before they can be created, just try to disburse to the owners and skip creating 
            // to allow the users deposits more before creating them
            if(totalWalletsAmountInUsd < wallets_balance_threshold_usd) {

                try {
                    const result = await transferToStakeHolders(
                        admin, coin, distribution_balance_threshold_usd, next_distribution_gas_fee_usd
                    );

                    return resolve(result);

                } catch(e) {
                    return resolve({message: "wallets balance creation threshold not reached/ " + e.message});
                }
            }
            //console.log("getDistributionSettings.bal", totalWalletsAmountInUsd, ":", wallets_balance_threshold_usd)
            
            let gasLimit;
            let gasPrice = 0;
            let gasFee = 0;

            const [web3, sBalance] = await callWeb3Func(coin, lastWeb3, web3 => {
                return web3.eth.getBalance(senderAddress.value())
            });
            lastWeb3 = web3
            const contract = new web3.eth.Contract(COINS[coin].abiData.abi, contractAddress);

            const senderBalance = BigInt(sBalance);
            
            // Binary search variables
            let left = 0;
            let right = paddedSalts.length;
            let bestLength = paddedSalts.length;
    
            const gasEnough = async (currentSalts) => {
                // Calculate return amount to ensure balance consistency
                const contractBalance = BigInt(await web3.eth.getBalance(contractAddress));
                let rCoinAmount = contractBalance + walletsInfo.slice(0, currentSalts.length).reduce((total, walletInfo) => total + walletInfo[getCoinBalanceKey(coin)], BigInt(0));
                rCoinAmount -= BigInt(1); // Subtract a small amount to make sure the returnCoinAmount is less thnan the contract balance

                const transactionObject = contract.methods.createWallets(currentSalts, rCoinAmount);
                const gasL = BigInt(await transactionObject.estimateGas({ from: senderAddress.value() }));
                const gasP = BigInt(await web3.eth.getGasPrice())
                const gasF = gasL * gasP;
    
                //console.log("Steps>>", currentSalts.length, gasL, gasP, gasF, senderBalance, gasF <= senderBalance);
                const enough = gasF <= senderBalance;
                if(enough) {
                    gasLimit = gasL;
                    gasPrice = gasP;
                    gasFee = gasF;
                    returnCoinAmount = rCoinAmount;
                }

                return enough
            }
            
            if(!(await gasEnough(paddedSalts))) {
                bestLength = 0;
    
                // Binary search to find the max salts we can afford within sender balance
                while (left <= right) {
                    const mid = Math.floor((left + right) / 2);
                    const currentSalts = paddedSalts.slice(0, mid);
    
                    try {
                        // Estimate gas for the current length of salts
                        if (await gasEnough(currentSalts)) {
                            // If within balance, try more salts
                            bestLength = mid;
                            left = mid + 1;
                            
                        } else {
                            // If over balance, try fewer salts
                            right = mid - 1;
                        }
                    } catch (error) {
                        console.error("Gas estimation failed:", error.message);
                        // Adjust search if estimation fails
                        right = mid - 1;
                    }
                }
            }

            // Check if we have salts that fit the balance constraints
            if (bestLength > 0) {
                const optimalSalts = paddedSalts.slice(0, bestLength);
                const transactionObject = contract.methods.createWallets(optimalSalts, returnCoinAmount);
    
                // Build the final transaction
                const rawTransaction = {
                    from: senderAddress.value(),
                    to: contractAddress,
                    gas: Number(gasLimit),
                    data: transactionObject.encodeABI(),
                    nonce: await web3.eth.getTransactionCount(senderAddress.value()),
                    gasPrice: gasPrice.toString(),
                };
    
                //console.log(`Processing transaction with ${optimalSalts.length} salts out of ${walletsInfo.length}`);
                //console.log("Steps2>>", optimalSalts.length, gasLimit, gasPrice, gasFee, senderBalance, gasFee <= senderBalance);
                //console.log("rawTransaction", rawTransaction);
    
                // Sign and send the transaction
                const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, senderPrivateKey.value());
                //console.log("signedTransaction", signedTransaction);
                
                //return resolve()

                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                .on('transactionHash', (hash) => {
                    console.log('Transaction Hash:', hash);
                    // Prepare a batch to perform multiple writes
                    const batch = db.batch();
        
                    const colDocRef = db.collection('wallets_create_hash').doc(); 

                    const optimalWalletsInfo = walletsInfo.slice(0, bestLength);

                    //Use the first salt in the tx as the create_hash_salt
                    const create_hash_salt = optimalWalletsInfo[0].salt

                    const wallets_create_hash_doc = {
                        hash,
                        coin,
                        create_hash_salt,
                        confirmed: false,
                        created_on: FieldValue.serverTimestamp()
                    }
                    batch.create(colDocRef, wallets_create_hash_doc);
                    
                    optimalWalletsInfo.forEach(walletInfo => {
                        const docRef = db.collection('wallets').doc(walletInfo.docId);
                        batch.update(docRef, { [getCoinBalanceKey(coin, "create_hash_salt")]: create_hash_salt });
                    });
                    
                    commitRetry(batch, 3)
                    .then(dbCommitResult => {
                        console.log('CreateContracts.db.commits:', "attempts:", dbCommitResult.attempts);
                        resolve();
                    })
                    .catch(e => {
                        console.error('CreateContracts.db.commitsError:', e);
                        reject(e);
                    })
                })
                .on('error', (error) => {
                    console.error('CreateContracts.Transactio.Error:', error.message);
                });
                
            } else {
                reject(new Error("Insufficient balance to cover gas fees for even a single wallet creation."));
            }
    
        } catch (error) {
            //console.error("splitFunds failed:", error.message);
            reject(error)
        }
    })
};

module.exports = {
    splitFunds
}