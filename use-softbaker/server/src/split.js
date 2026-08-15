const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const Web3 = require("web3").default;
const WalletFactory = require('./WalletFactory');
const { COINS } = require('./utils/c');
const { weiToEther } = require('./utils/f');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Reference to Firestore
const db = admin.firestore();

const getCoinBalanceKey = (coin, suffix) => {
    //example return: bnb_balance_in_coin or bnb_balances
    return `${coin}${suffix? `_${suffix}` : "_balance"}`.toLowerCase();
}

const coinKey = "bnb";
const senderAddress = process.env.WALLET_CREATOR_PK; // Replace with the actual sender address
const senderPrivateKey = process.env.WALLET_CREATOR_SK; // Replace with the private key of the sender wallet

const getNewWallets = (coin) => {
    const walletsInfo = [];
    const web3 = new Web3(COINS[coin].abiData.rpcUrl);

    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await db.collection('wallets')
            .where(getCoinBalanceKey(coin, "contract_created"), '==', false)
            .where(getCoinBalanceKey(coin, "create_hash_salt"), '==', '')
            .get();
            
            if (snapshot.empty) {
                console.log('No matching documents.');
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

            resolve(walletsInfo);
        } catch (error) {
            console.error("Error fetching wallets:", error);
            reject(error);
        }
    });
};

const txConfirmationResult = async (coin, hash) => {
    try {
        // Initialize Web3 for the given coin
        const web3 = new Web3(COINS[coin].abiData.rpcUrl);

        // Fetch transaction details
        const transaction = await web3.eth.getTransaction(hash);

        // If transaction does not exist, return `ok: false`
        if (!transaction) {
            return { ok: false };
        }

        // If the transaction is still pending, return `null`
        if (transaction.blockNumber === null) {
            return null;
        }

        // Get the latest block number to calculate confirmations
        const latestBlockNumber = await web3.eth.getBlockNumber();
        const confirmations = latestBlockNumber - transaction.blockNumber;

        console.log("confirmations:", confirmations)

        // If confirmed 5 or more times, return `ok: true`; otherwise, return `null`
        return confirmations >= COINS[coin].requiredConfirmations ? { ok: true } : null;

    } catch (error) {
        console.error("Error fetching transaction confirmation:", error);
        return { ok: false };
    }
};

const checkPendingWalletCreateTx = (coin) => {

    return new Promise(async (resolve, reject) => {
        try {
            const snapshot = await db.collection('wallets_create_hash')
            .where('coin', '==', coin)
            .where('confirmed', '==', false)
            .orderBy('created_on', 'asc')
            .limit(1)
            .get();
            
            if (snapshot.empty) {
                console.log('No matching documents.');
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
                await batch.commit();
            }
            resolve()

        } catch(error) {
            reject(error)
        }
    })
}

const splitFunds = (coin) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Initialize Web3 for the given coin
            const web3 = new Web3(COINS[coin].abiData.rpcUrl);
            await checkPendingWalletCreateTx(coin);
            const walletsInfo = await getNewWallets(coin);
            if (walletsInfo.length === 0) {
                console.log("No wallets found for disbursement.");
                return;
            }
            console.log("returnCoinAmount: 1")
    
            const contractAddress = COINS[coin].abiData.address;
            const contract = new web3.eth.Contract(COINS[coin].abiData.abi, contractAddress);
            
            // Calculate return amount to ensure balance consistency
            let returnCoinAmount
    
            // Sort salts by balance descending, and map to padded salts array
            let paddedSalts = walletsInfo.map(walletInfo => walletInfo.paddedSalt);
            
            let gasLimit;
            let gasPrice = 0;
            let gasFee = 0;
            const senderBalance = BigInt(await web3.eth.getBalance(senderAddress));
            console.log("returnCoinAmount: 2")
            
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
                const gasL = BigInt(await transactionObject.estimateGas({ from: senderAddress }));
                const gasP = BigInt(await web3.eth.getGasPrice())
                const gasF = gasL * gasP;
    
                console.log("Steps>>", currentSalts.length, gasL, gasP, gasF, senderBalance, gasF <= senderBalance);
                const enough = gasF <= senderBalance;
                if(enough) {
                    gasLimit = gasL;
                    gasPrice = gasP;
                    gasFee = gasF;
                    returnCoinAmount = rCoinAmount;
                    console.log("returnCoinAmount: ", returnCoinAmount)
                }

                return enough
            }
            console.log("returnCoinAmount: 3")
            
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
                    from: senderAddress,
                    to: contractAddress,
                    gas: Number(gasLimit),
                    data: transactionObject.encodeABI(),
                    nonce: await web3.eth.getTransactionCount(senderAddress),
                    gasPrice: gasPrice.toString(),
                };
    
                console.log(`Processing transaction with ${optimalSalts.length} salts out of ${walletsInfo.length}`);
                console.log("Steps2>>", optimalSalts.length, gasLimit, gasPrice, gasFee, senderBalance, gasFee <= senderBalance);
                console.log("rawTransaction", rawTransaction);
    
                // Sign and send the transaction
                const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, senderPrivateKey);
                console.log("signedTransaction", signedTransaction);
                
                //return resolve()

                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                .on('transactionHash', async (hash) => {
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

                    await batch.commit();
                    resolve()
                })
                .on('receipt', (receipt) => {
                    console.log('Transaction Receipt:', receipt);
                    console.log('Gas Fee (Ether):', weiToEther((gasLimit * gasPrice).toString(), 18, 6));
                })
                .on('error', (error) => {
                    console.error('Transaction Error:', error.message);
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

// Example usage
splitFunds(coinKey)
.then(() => {
    console.log("splitFunds completed successfully.");
})
.catch(error => {
    console.error("splitFunds failed:", error.message);
});
