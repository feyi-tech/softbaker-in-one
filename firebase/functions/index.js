//const path = require('path');
//const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
//console.log("dotenv", dotenv)
const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const cors = require('cors');
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const Web3 = require("web3").default;
const serviceAccount = require("./serviceAccountKey.json");
const WalletFactory = require('./WalletFactory');
const { COINS, PRICE_DATA_TTL_MINUTES, REF_PCT, MAX_BIG_INT_STRING_DIGITS, MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS, DOLLAR_MARKET_PRICE_SHIFT_FILL, MAX_IMAGES_UPLOAD_SIZE } = require('./utils/c');
const { isEthAddress } = require('./utils/f');
const { defineString } = require('firebase-functions/params');
const { splitFunds } = require('./split-funds');
const { getCoinsPrices, getCoinBalanceKey } = require('./utils');
const { Timestamp } = require('firebase-admin/firestore');
const { updateToolsStaticFile } = require('./static');
const { deleteFilesFromR2 } = require('./storage');
const { getFontFamiliesFromSVG, generateFontMap, getSvg, arrayToMap, downloadSvgAsImage } = require('softbaker-svg');
const { default: axios } = require('axios');
const { FILE_FIELD_TYPES_DEFUALT_FILES } = require('./utils/defaultFiles');
const geoMiddleware = require('./geoMiddleware');


// Load environment variables from Firebase config
// Define some parameters
const ENV_G_RECAPTCHA_SECRET = defineString('ENV_G_RECAPTCHA_SECRET');//{value: () => process.env.ENV_G_RECAPTCHA_SECRET}// 
const ENV_CLOUDFLARE_TOKEN = defineString('ENV_CLOUDFLARE_TOKEN');//{value: () => process.env.ENV_CLOUDFLARE_TOKEN}// 
const ENV_R2_S3_ACCESS_KEY_ID = defineString('ENV_R2_S3_ACCESS_KEY_ID');//{value: () => process.env.ENV_R2_S3_ACCESS_KEY_ID}// 
const ENV_R2_S3_SECRET_ACCESS_KEY = defineString('ENV_R2_S3_SECRET_ACCESS_KEY');//{value: () => process.env.ENV_R2_S3_SECRET_ACCESS_KEY}// 
const ENV_R2_S3_ENDPOINT = defineString('ENV_R2_S3_ENDPOINT');//{value: () => process.env.ENV_R2_S3_ENDPOINT}// 
const ENV_R2_BUCKET = defineString('ENV_R2_BUCKET');//{value: () => process.env.ENV_R2_BUCKET}//
const ENV_R2_CUSTOM_DOMAIN = defineString('ENV_R2_CUSTOM_DOMAIN');//{value: () => process.env.ENV_R2_CUSTOM_DOMAIN}//
const PASS = defineString('PASS');//{value: () => process.env.PASS}//

const nullOrEmpty = (data) => {
  !data || data.length == 0
}

//console.log = () => { }
const getFirebaseTimestamp = (value) => {
  try {
    return new admin.firestore.Timestamp(value.seconds, value.nanoseconds)

  } catch(e) {
    console.log("getFirebaseTimestamp: ", e.message, "value: ", value)
    return null
  }
}

const readServerCoinBalance = (coin, balanceDoc) => {
  var balance = balanceDoc[getCoinBalanceKey(coin, "balance")];
  if (!balance) balance =  BigInt("0");
  return BigInt(balance);
}

const readServerCoinBalanceInCoin = (coin, balanceDoc) => {
  var balance = balanceDoc[getCoinBalanceKey(coin, "balance_in_coin")];
  if (!balance) balance = 0;
  return balance;
}

const initAdminFinal = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const initAdmin = () => {
  try {
    if(!admin.app()) {
      initAdminFinal()
    }

  } catch(e) {
    initAdminFinal()
  }
}

const closeAdmin = () => {
  try {
    if(admin.app()) {
      admin.app().delete()
      .then(() => {
        //console.log('Firebase Admin SDK instance has been deleted.');
      })
      .catch((error) => {
        //console.error('Error deleting Firebase Admin SDK instance:', error);
      });
    }

  } catch(e) {
    
  }
}

const userExists = async (uid) => {
  if (!uid) {
    return false;
  }

  const userRecord = await admin.auth().getUser(uid);
  if (userRecord) {
    return true;
  } else {
    return false;
  }
}

function padNumberWithZeros(number, width, check) {
  if (typeof width !== 'number') {
    throw new Error('Both arguments must be numbers');
  }

  if (!Number.isInteger(width) || width < 0) {
    throw new Error('Width must be a non-negative integer');
  }

  const paddedNumberString = number.toString().padStart(width, '0');
  return paddedNumberString;
}

/*Example fieldsMap
{
  counter1: {value: BigInt(1), maxNumberOfDigits: 15}
}
*/

//This functions get the string representations of BigInt fields in a document referenced by docRef
//It then go through the fieldsMap to increments these fields with the corresponding values in the fieldsMap,
//Then pad the result with the maxNumberOfDigits of each fields.
//The padding allows the BigInt to be represented in string, while allowing < and > filtering to be done on the 
// fields as if they're numbers.
const incrementBigInts = async (docRef, fieldsMap) => {
  // Retrieve the current value from Firestore
  const doc = await docRef.get();
  const docData = doc.exists? doc.data() : { }
  const fieldsUpdate = {}
  for(const [key, fieldMap] of Object.entries(fieldsMap)) {
    let currentValue = BigInt(docData[key] || 0);
    currentValue += BigInt(fieldMap.value);
    fieldsUpdate[key] = padNumberWithZeros(currentValue, fieldMap.maxNumberOfDigits)
  }
  
  return fieldsUpdate
}

const walletUpdatePaused = async () => {
  //Fetch the site stats doc to check if balance update is not currently disabled for users' wallet payout update
  /*TODO: uncomment inporduction
  const switchesDocRef = admin.firestore().doc(`admin/switches`);
  const switchesSnapshot = await switchesDocRef.get()
  return !switchesSnapshot.exists? false : switchesSnapshot.data().pause_wallet_update_by_users === true? true : false
  */
  return false;
}
const toggleWalletUpdate = async (pause) => {
  const switchesDocRef = admin.firestore().doc(`admin/switches`);
  await switchesDocRef.set({
    pause_wallet_update_by_users: pause
  }, { merge: true })
  return true
}
const pauseWalletUpdate = async () => {
  return await toggleWalletUpdate(true)
}
const playWalletUpdate = async () => {
  return await toggleWalletUpdate(false)
}

const calculateHighDepositBonus = (totalDeposit) => {
  return 0;
  if(totalDeposit < 50) {
    return 0;

  } else if(totalDeposit >= 50 && totalDeposit < 100) {
    return (totalDeposit * 10) / 100

  } else if(totalDeposit >= 100 && totalDeposit < 200) {
    return (totalDeposit * 15) / 100

  } else if(totalDeposit >= 200 && totalDeposit < 500) {
    return (totalDeposit * 20) / 100
      
  } else if(totalDeposit >= 500 && totalDeposit < 1000) {
    return (totalDeposit * 30) / 100
      
  } else if(totalDeposit >= 1000) {
    return (totalDeposit * 40) / 100
  }
}


const updateBalance = async (directUid, coins, referralId, recipientEmail, geo) => {

  try {

    if (await walletUpdatePaused()) {
      closeAdmin();
      throw { error: "Balance update currently disabled. Please try again later" };
    }

    let uid;

    if (recipientEmail) {
      try {
        const recipientSnapshot = await admin.auth().getUserByEmail(recipientEmail);
        if (!recipientSnapshot) {
          closeAdmin();
          throw {
            error: "The recipient does not exist on the platform yet. Tell the recipient to register on the platform first.",
            code: "recipient_not_found"
          };
        }
        uid = recipientSnapshot.uid;

      } catch (e) {
        const errorMessage =
          (e?.message || "").includes("no user record")
            ? "The recipient does not exist on the platform yet. Tell the recipient to register on the platform first."
            : (e?.message || "No error message");

        closeAdmin();
        throw { error: errorMessage, code: "recipient_not_found" };
      }

    } else {
      uid = directUid;
    }

    const walletDocRef = admin.firestore().doc(`wallets/${uid}`);
    const statsDocRef = admin.firestore().doc(`admin/stats`);
    const batchWriter = admin.firestore().batch();

    const balanceDocSnapshot = await walletDocRef.get();

    let balanceDoc = {};
    let refId = null;
    let referralDocRef = null;

    if (balanceDocSnapshot.exists) {
      balanceDoc = balanceDocSnapshot.data();
      refId = balanceDoc.referred_by;
    }

    if (referralId && referralId !== uid && await userExists(referralId)) {
      refId = referralId;
    }

    if (refId) {
      referralDocRef = admin.firestore().doc(`wallets/${refId}`);
    }

    const priceData = await getCoinsPrices(admin);

    const processed = [];
    const promises = [];

    for (const coin of coins) {

      if (processed.includes(coin)) continue;
      processed.push(coin);

      promises.push((async () => {

        const coinData = COINS[coin];
        if (!coinData) return { error: "Invalid coin", coin };
        if (coinData.disabled) return { error: "Coin disabled", coin };

        const factory = new WalletFactory(
          coinData.abiData.address,
          coinData.abiData.abi,
          coinData.abiData.rpcUrl,
          coin
        );

        try {

          const confirmations = await factory.getConfirmations(uid, coinData.requiredConfirmations);
          const confirmationsInfo = factory.getConfirmationsInfo(confirmations, coinData.decimals);

          if (confirmationsInfo.error) {
            return { error: confirmationsInfo.error, coin };
          }

          if (confirmationsInfo.confirmedDepositsBalance <= readServerCoinBalance(coin, balanceDoc)) {
            return null;
          }

          const coinPrice = priceData[`${coinData.coingecko_price_key}_usd`];

          const balanceDiffInCoin = confirmationsInfo.confirmedDepositsBalanceInCoin - readServerCoinBalanceInCoin(coin, balanceDoc);

          const priceDiffInUsd = balanceDiffInCoin * coinPrice;

          let discountBalanceDiff = priceDiffInUsd;

          const bonus = calculateHighDepositBonus(
            discountBalanceDiff + DOLLAR_MARKET_PRICE_SHIFT_FILL
          );

          if (refId) {
            discountBalanceDiff += (discountBalanceDiff * REF_PCT) / 100;
          }

          discountBalanceDiff += bonus;

          const walletUpdateData = {
            salt: confirmationsInfo.salt,
            [getCoinBalanceKey(coin, "balance")]: confirmationsInfo.confirmedDepositsBalance.toString(),
            [getCoinBalanceKey(coin, "balance_in_coin")]: confirmationsInfo.confirmedDepositsBalanceInCoin,
            [getCoinBalanceKey(coin, "balance_in_usd")]: admin.firestore.FieldValue.increment(discountBalanceDiff),
            [getCoinBalanceKey(coin, "contract_created")]: confirmationsInfo.walletCreated,
            usd_balance: admin.firestore.FieldValue.increment(discountBalanceDiff),
            deposit_counts: admin.firestore.FieldValue.increment(1),
            last_updated: admin.firestore.FieldValue.serverTimestamp()
          };

          const depositAmountInSatoshi = BigInt(confirmationsInfo.confirmedDepositsBalance - readServerCoinBalance(coin, balanceDoc));

          let referralEarnings = 0n;
          let siteEarnings = depositAmountInSatoshi;

          let statsData = {
            [getCoinBalanceKey(coin, "users_balance_in_coin")]: admin.firestore.FieldValue.increment(balanceDiffInCoin),
            [getCoinBalanceKey(coin, "users_usd_balance")]: admin.firestore.FieldValue.increment(priceDiffInUsd),
            users_usd_balance: admin.firestore.FieldValue.increment(priceDiffInUsd),
            [getCoinBalanceKey(coin, "users_usd_referral_discount_balance")]: admin.firestore.FieldValue.increment(discountBalanceDiff),
            users_usd_referral_discount_balance: admin.firestore.FieldValue.increment(discountBalanceDiff),
            users_deposit_counts: admin.firestore.FieldValue.increment(1),
            update_counts: admin.firestore.FieldValue.increment(1),
            last_updated: admin.firestore.FieldValue.serverTimestamp()
          };

          if (refId) {

            referralEarnings =
              (depositAmountInSatoshi * BigInt(REF_PCT)) / BigInt(100);

            siteEarnings = depositAmountInSatoshi - referralEarnings;

            const bigIntIncrements = await incrementBigInts(referralDocRef, {
              [getCoinBalanceKey(coin, "referral_earnings")]: {
                value: referralEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              }
            });

            const refWalletUpdateData = {
              ...bigIntIncrements,
              [getCoinBalanceKey(coin, "referral_earnings_counts")]: admin.firestore.FieldValue.increment(1),
              referral_earnings_counts: admin.firestore.FieldValue.increment(1),
              last_updated: admin.firestore.FieldValue.serverTimestamp()
            };

            if (!balanceDocSnapshot.exists) {
              refWalletUpdateData.total_referrals = admin.firestore.FieldValue.increment(1);
              walletUpdateData.referred_by = refId;
            }

            batchWriter.set(referralDocRef, refWalletUpdateData, { merge: true });

            const statsBigIntIncrements = await incrementBigInts(statsDocRef, {
              [getCoinBalanceKey(coin, "users_referral_earnings")]: {
                value: referralEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              },
              [getCoinBalanceKey(coin, "all_time_users_referral_earnings")]: {
                value: referralEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              },
              [getCoinBalanceKey(coin, "site_earnings")]: {
                value: siteEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              },
              [getCoinBalanceKey(coin, "all_time_site_earnings")]: {
                value: siteEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              }
            });

            statsData = { ...statsData, ...statsBigIntIncrements };

          } else {

            const statsBigIntIncrements = await incrementBigInts(statsDocRef, {
              [getCoinBalanceKey(coin, "site_earnings")]: {
                value: siteEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              },
              [getCoinBalanceKey(coin, "all_time_site_earnings")]: {
                value: siteEarnings,
                maxNumberOfDigits: MAX_BIG_INT_STRING_DIGITS
              }
            });

            statsData = { ...statsData, ...statsBigIntIncrements };
          }

          if (!balanceDocSnapshot.exists) {
            statsData[refId
              ? "total_paying_referred_users"
              : "total_paying_direct_users"] =
              admin.firestore.FieldValue.increment(1);

            statsData.total_paying_users =
              admin.firestore.FieldValue.increment(1);

            walletUpdateData[getCoinBalanceKey(coin, "create_hash_salt")] = '';
          }

          batchWriter.set(walletDocRef, walletUpdateData, { merge: true });
          batchWriter.set(statsDocRef, statsData, { merge: true });

          const transactionRef =
            admin.firestore().collection('deposit_txs').doc();

          const txData = {
            id: transactionRef.id,
            from: confirmationsInfo.wallet,
            to: uid,
            status: "completed",
            type: `${getCoinBalanceKey(coin, "deposit")}`,
            [getCoinBalanceKey(coin, "balance")]: confirmationsInfo.confirmedDepositsBalance.toString(),
            [getCoinBalanceKey(coin, "balance_in_coin")]: confirmationsInfo.confirmedDepositsBalanceInCoin,
            
            
            [getCoinBalanceKey(coin, "deposit")]: depositAmountInSatoshi.toString(),
            [getCoinBalanceKey(coin, "deposit_in_coin")]: balanceDiffInCoin,

            [getCoinBalanceKey(coin, "deposit_in_usd")]: discountBalanceDiff,
            [getCoinBalanceKey(coin, "contract_created")]: confirmationsInfo.walletCreated,
            usd_deposit: discountBalanceDiff,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            geo
          };

          batchWriter.set(transactionRef, txData);

          return null;

        } catch (e) {
          return { error: e.message, coin };
        }

      })());
    }

    const results = await Promise.all(promises);
    await batchWriter.commit();

    const errorCoins = results.filter(r => r != null);

    console.log("deposit_txs.commit", {
      updatedCounts: coins.length - errorCoins.length,
      errorCoins
    });

    closeAdmin();

    return {
      updatedCounts: coins.length - errorCoins.length,
      errorCoins
    };

  } catch (error) {
    closeAdmin();
    throw error;
  }
};

const createWallets = async (minPendingWallets, maxPendingWallets, coinKey, secrets) => {
  // Get a reference to the "wallets" collection
  const walletsCollection = admin.firestore().collection('wallets');

  if(await pauseWalletUpdate()) return res.status(500).json({ error: "Failed to pause wallet update by users." });
  try {
    // Query for documents where "wallet_created" is false with a limit of 10
    const querySnapshot = await walletsCollection
    .where(`${coinKey}_contract_created`, '==', false)
    .limit(maxPendingWallets)
    .get();

    if(querySnapshot.size < minPendingWallets) {
      return res.status(500).json({ error: `A total of ${querySnapshot.size} is less than the minimum of ${minPendingWallets}` });
    }

    const batchWriter = admin.firestore().batch();
    const paddedSalts = []
    const web3 = new Web3(COINS[coinKey].abiData.rpcUrl);
    const contract = new web3.eth.Contract(COINS[coinKey].abiData.abi, COINS[coinKey].abiData.address);
    querySnapshot.forEach((doc) => {
      const paddedSalt = web3.utils.rightPad(
        web3.utils.asciiToHex(doc.data().salt.toLowerCase()),
        64
      );
      paddedSalts.push(paddedSalt)
      batchWriter.set(doc(`wallets/${doc.id}`), {[`${coinKey}_contract_created`]: true}, { merge: true })
    });

    const disburseThreshold = 0
    const gasFeeReturnTest = 100
    const senderAddress = secrets.contractModAddress
    const senderPrivateKey = secrets.contractModPrivateKey
    const contractAddress = COINS[coinKey].abiData.address

    // Build the transaction
    var transactionObject = contract.methods.createWallets(paddedSalts, disburseThreshold, gasFeeReturnTest);

    // Estimate gas limit for the transaction
    const gasLimit = await transactionObject.estimateGas({ from: senderAddress });

    // Estimate gas price (you can customize this based on current network conditions)
    const gasPrice = await web3.eth.getGasPrice();

    // Calculate the gas fee in Wei
    const gasFee = gasLimit * gasPrice;

    // Convert the gas fee to Ether
    const gasFeeEther = web3.utils.fromWei(gasFee.toString(), 'ether');
    transactionObject = contract.methods.createWallets(paddedSalts, disburseThreshold, gasFeeEther);

    // Build the raw transaction
    const rawTransaction = {
      from: senderAddress,
      to: contractAddress,
      gas: gasLimit,
      data: transactionObject.encodeABI(),
      nonce: await web3.eth.getTransactionCount(senderAddress),
      gasPrice: gasPrice, // Add gasPrice to the raw transaction
    };

    // Sign the transaction
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, senderPrivateKey);

    // Send the signed transaction
    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .on('transactionHash', (hash) => {
        console.log('Transaction Hash:', hash);
      })
      .on('receipt', (receipt) => {
        console.log('Transaction Receipt:', receipt);
        console.log('Gas Fee (Ether):', gasFeeEther);
        // Do something on success
      })
      .on('error', (error) => {
        console.error('Transaction Error:', error.message);
        // Handle the error
      });
    
    
    contract.methods
    .createWallets(paddedSalts, disburseThreshold, gasFeeReturn)
    .call({}, blockNumber || 'latest')
    .then((result) => {
        //Do something on success
    })
    .catch((error) => {
        reject(error);
    });

  } catch(e) {
    res.status(400).json(error);

  } finally {
    closeAdmin()
  }
}

const X_COLUMN_DATA = {
  key: (columns) => {
    return columns[0]
  },
  name: (columns) => {
    return columns[0]
  },
  type: (columns) => {
    return columns[1]
  },
  min: (columns) => {
    return parseInt(columns[2])
  },
  max: (columns) => {
    return parseInt(columns[3])
  },
  editable: (columns) => {
    return columns[4].toLowerCase() === "true"
  },
  requiredForCreate: (columns) => {
    return columns[5].toLowerCase() === "true"
  },
  requiredForUpdate: (columns) => {
    return columns[6].toLowerCase() === "true"
  }
}

const getNextRenewalDate = () => {
  // Get the current date
  const currentDate = new Date();

  // Calculate the date one month from now
  const expiryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

  // Convert JavaScript Date to Firestore Timestamp
  return admin.firestore.Timestamp.fromDate(expiryDate);
}

const splitSvgElementId = (id) => {
  const [ name, typeAndSelectIndex ] = id.split(".")

  if(!typeAndSelectIndex) return { name }

  const [ type, selectIndex ] = typeAndSelectIndex.split("_")

  return { name, type, selectIndex, typeAndSelectIndex }
}
const ruleDocToRule = (ruleDoc, doc, isEdit, uid, dynamicToolId) => {
  const rule = {
    allow_freemium: ruleDoc.allow_freemium == true,
    create_price: ruleDoc.create_price,
    update_price: ruleDoc.update_price,
    x: {}
  }

  //START of fake website authentication billing setup
  if(ruleDoc.create_price_is_monthly) {
    
    const expiryTimestamp = getNextRenewalDate()
    rule.subscription_expiry_date_create = expiryTimestamp

    //Subscription renewal attribute
    if(doc.renewSubscription) {
      rule.subscription_expiry_date_update = expiryTimestamp
      rule.update_price = rule.create_price
    }

  }

  //If the tool is a dynamic tool
  if(dynamicToolId) {
    //Create an x for it.
    const x = {}
    //define editable fields
    const updatableFields = [...(ruleDoc?.editables || "").split(",").map((edt) => edt.trim()), "is_freemium"]

    if(!doc.template_id && !isEdit) throw Error(`Template ID not provided.`)

    x.updatedAt = admin.firestore.Timestamp.now()
    if(!isEdit) {
      x.createdAt = admin.firestore.Timestamp.now()
      x.authorId = uid
    }
    
    var maxDataSize = 1024 * 16//16kb
    var maxNumberSize = 999999999999999
    var maxArrayLength = 10
    var totalDataSize = 0
    var nameDirectiveFound = false
    var descDirectiveFound = false
    for(const [key, value] of Object.entries(doc)) {
      let time
      if(isEdit && !updatableFields.includes(key)) throw Error(`${splitSvgElementId(key).name} cannot be updated.`)
      if(!x[key]) {
        //Validate arbitary values
        if(typeof value === "string") {
          if(value.length + totalDataSize > maxDataSize) throw Error(`${splitSvgElementId(key).name} is too long.`)
          totalDataSize += value.length

        } else if(typeof value === "number") {
          if(value > maxNumberSize) throw Error(`${splitSvgElementId(key).name} is too big.`)
          totalDataSize += `${value}`.length

        } else if(getFirebaseTimestamp(value)) {
          totalDataSize += 1
          time = getFirebaseTimestamp(value)

        } else if(Array.isArray(value)) {
          //If it's an array of primitives
          if(value.length > maxArrayLength && ["string", "number", "boolean"].includes(typeof value[0])) {
            throw Error(`${splitSvgElementId(key).name} cannot be greater than ${10} members.`)

          } //If it's an array of objects
          else if(typeof value[0] === "object") {
            //Saving array of objects
            const arrayAsObject = { }
            value.forEach((item, index) => {
              if (typeof item !== "object" || item === null) {
                throw new Error(`${splitSvgElementId(key).name} array element at index ${index} is not an object.`);
              }

              arrayAsObject[index] = item
            });
            x[key] = arrayAsObject
          }
          if(JSON.stringify(value).length + totalDataSize > maxDataSize) throw Error(`${splitSvgElementId(key).name} is too large.`)
          totalDataSize += JSON.stringify(value).length

        } else if(typeof value === "boolean") {
          totalDataSize += `${value}`.length

        } else {
          throw new Error(`${splitSvgElementId(key).name} data type is not supported.`);

        }

        if(key.includes("@name")) {
          nameDirectiveFound = true

        } else if(key.includes("@desc")) {
          descDirectiveFound = true

        }
        if(!x[key]) x[key] = time? time : value
      }
    }
    
    if(!isEdit) {
      if(!nameDirectiveFound || !descDirectiveFound) throw Error(`Compulsory fields not provided.`)
      x.toolId = dynamicToolId
    }

    rule.x = x

  } else {
    //END of fake website authentication billing setup
    for (const x of ruleDoc.x) {
      const colums = x.split(",")
      const column = {
        key: X_COLUMN_DATA.key(colums),
        name: X_COLUMN_DATA.name(colums),
        type: X_COLUMN_DATA.type(colums),
        min: X_COLUMN_DATA.min(colums),
        max: X_COLUMN_DATA.max(colums),
        editable: X_COLUMN_DATA.editable(colums),
        requiredForCreate: X_COLUMN_DATA.requiredForCreate(colums),
        requiredForUpdate: X_COLUMN_DATA.requiredForUpdate(colums)
      }

      if(doc[column.key] == undefined && ((!isEdit && column.requiredForCreate) || (isEdit && column.requiredForUpdate))) throw Error(`${column.name} cannot be empty.`)
      if(doc[column.key] && isEdit && !column.editable) throw Error(`${column.name} cannot be updated.`)

      if(column.type == "uid" && doc[column.key] !== undefined && doc[column.key] !== null) {
        if(doc[column.key] != "uid") throw Error(`${column.name} value must be "uid".`)
        if(!uid) throw Error(`uid not available for ${column.name}.`)
        rule.x[column.key] = uid

      } else if(column.type == "string" && doc[column.key] !== undefined && doc[column.key] !== null) {
        if(typeof doc[column.key] != "string") throw Error(`${column.name} must be string.`)
        if(doc[column.key].length < column.min) throw Error(`${column.name} total characters cannot be less than ${column.min}.`)
        if(doc[column.key].length > column.max) throw Error(`${column.name} total characters cannot be greater than ${column.max}.`)
        if(doc[column.key].length > column.max) throw Error(`${column.name} total characters cannot be greater than ${column.max}.`)
        rule.x[column.key] = doc[column.key]

      } else if(column.type == "number" && doc[column.key] !== undefined && doc[column.key] !== null) {
        if(typeof doc[column.key] != "number") throw Error(`${column.name} must be a number.`)
        if(doc[column.key] < column.min) throw Error(`${column.name} cannot be less than ${column.min}.`)
        if(doc[column.key] > column.max) throw Error(`${column.name} cannot be greater than ${column.max}.`)
        rule.x[column.key] = doc[column.key]

      } else if(column.type == "boolean" && [true, false].includes(doc[column.key])) {
        if(typeof doc[column.key] != "boolean") throw Error(`${column.name} must be a boolean.`)
        rule.x[column.key] = doc[column.key]

      } else if(column.type == "time" && doc[column.key] !== undefined && doc[column.key] !== null) {
        const firebaseTimestamp = getFirebaseTimestamp(doc[column.key])
        if(!firebaseTimestamp) throw Error(`${column.name} must be a timestamp.`)
        rule.x[column.key] = firebaseTimestamp

      } else if(column.type == "current_time" && doc[column.key] !== undefined && doc[column.key] !== null) {
        if(doc[column.key] != "current_time") throw Error(`${column.name} value must be "current_time".`)
        rule.x[column.key] = admin.firestore.Timestamp.now()

      } else if(column.type.startsWith("array:") && doc[column.key] !== undefined && doc[column.key] !== null) {
        if(!Array.isArray(doc[column.key])) throw Error(`${column.name} must be an array.`)
        if(doc[column.key].length < column.min) throw Error(`${column.name} cannot be less than ${column.min} members.`)
        if(doc[column.key].length > column.max) throw Error(`${column.name} cannot be greater than ${column.max} members.`)

        const typeInfo = column.type.split(":")//["array", "string", minLength, maxLength]
        const memberType = typeInfo[1]
        const memberMinSize = parseInt(typeInfo[2])
        const memberMaxSize = parseInt(typeInfo[3])

        const getSize = (data) => {
          if(memberType == "number") return data
          return `${data}`.length
        }
        for(const member of doc[column.key]) {
          if(typeof member !== memberType) throw Error(`${column.name}'s all members must be ${memberType}s.`)

          if(memberType === "string" || memberType === "number") {
            const size = getSize(member)
            if(size < memberMinSize) throw Error(`Each ${column.name} member size cannot be less than ${memberMinSize}.`)
            if(size > memberMaxSize) throw Error(`Each ${column.name} member size cannot be greater than ${memberMaxSize}.`)

          } else if(memberType !== "boolean") {
            throw Error(`Array members can only be strings, numbers, or booleans. Check the rule for ${column.name} field.`)
          }
        }
        rule.x[column.key] = doc[column.key]

      }//items,object_array:{description@string_2_32|quantity@number_1_1000000000000000|price@number_1_1000000000000000},1,10,false,true,false 
      else if(column.type.startsWith("object_array:") && doc[column.key] !== undefined && doc[column.key] !== null) {
        if(!Array.isArray(doc[column.key])) throw Error(`${column.name} must be an array of objects.`)
        if(doc[column.key].length < column.min) throw Error(`${column.name} cannot be less than ${column.min} objects.`)
        if(doc[column.key].length > column.max) throw Error(`${column.name} cannot be greater than ${column.max} objects.`)

        const typeInfo = column.type.split(":")
        const rulesString = typeInfo[1];
        const rules = rulesString.substring(1, rulesString.length - 1).split("|");

        let validationRules = {};

        // Parse validation rules
        rules.forEach(rule => {
            let [key, typeAndRange] = rule.trim().split("@");
            let [type, min, max] = typeAndRange.split("_");
            validationRules[key] = { type, min: parseInt(min), max: parseInt(max) };
        });

        // Function to validate each field in an object
        function validateField(value, rule, fieldName) {

          if (rule.type === "string") {
              if (typeof value !== "string") {
                  throw new Error(`${column.name}.${fieldName} must be a string.`);
              }
              if (value.length < rule.min || value.length > rule.max) {
                  throw new Error(`${column.name}.${fieldName} length must be between ${rule.min} and ${rule.max} characters.`);
              }
          } else if (rule.type === "number") {
              if (typeof value !== "number") {
                  throw new Error(`${column.name}.${fieldName} must be a number.`);
              }
              if (value < rule.min || value > rule.max) {
                  throw new Error(`${column.name}.${fieldName} must be between ${rule.min} and ${rule.max}.`);
              }
          } else {
              throw new Error(`Unsupported field type for ${column.name}.${fieldName}: ${rule.type}`);
          }
        }
        
        const arrayAsObject = { }
        doc[column.key].forEach((item, index) => {
          if (typeof item !== "object" || item === null) {
              throw new Error(`${column.name} array element at index ${index} is not an object.`);
          }

          for (const [field, rule] of Object.entries(validationRules)) {
            if (!item.hasOwnProperty(field)) {
                throw new Error(`${column.name} object at index ${index} is missing field: ${field}.`);
            }

            try {
                validateField(item[field], rule, field);
            } catch (error) {
                throw new Error(`Validation error in ${column.name} object at index ${index} for field "${field}": ${error.message}`);
            }
            //arrayAsObject[index] = item
          }
          arrayAsObject[index] = item
        });
        
        rule.x[column.key] = arrayAsObject
      }
    }
  }

  if(doc.is_freemium === true) {
    rule.x.is_freemium = true
    rule.update_price = 0//No update price in freemium mode so users can test extensively.

  } else if(doc.is_freemium === false) {
    rule.x.is_freemium = false
  }

  return rule

}
const saveDoc = (uid, collection, dynamicToolId, docId, doc, isEdit) => {
  return new Promise((resolve, reject) => {
    // Get the rule file for the collection
    const collectionRuleDocRef = admin.firestore().doc(
      collection? `collection_rule/${collection}` : `other_tools/${dynamicToolId}`
    );

    // Fetch the rule document
    collectionRuleDocRef.get()
      .then(async (docSnapshot) => {

        if(!docSnapshot.exists) {
          return reject({error: collection? "Invalid collection" : "Invalid Tool ID"})
        }

        const collectionRule =  ruleDocToRule(docSnapshot.data(), doc, isEdit, uid, dynamicToolId)

        const walletDocRef = admin.firestore().doc(`wallets/${uid}`);
        const docRef = admin.firestore().doc(`${collection? collection : "other_tools_data"}/${docId}`);
        var chargeAmount = 0
        
        
        if(!isEdit && collectionRule.create_price > 0) {
          // Fetch the current balance document
          const docSnapshot = await walletDocRef.get()
          if((!docSnapshot.exists || docSnapshot.data().usd_balance < collectionRule.create_price) && (!collectionRule.allow_freemium || !doc.is_freemium)) {
            return reject({error: `You have low balance. $${collectionRule.create_price} is needed. Please fund your wallet and try gain.`})

          } else if(!doc.is_freemium) {
            chargeAmount = collectionRule.create_price
            if(collectionRule.subscription_expiry_date_create) {
              collectionRule.x.subscription_expiry_date = collectionRule.subscription_expiry_date_create
              collectionRule.x.subscription_renewed_on = FieldValue.serverTimestamp()
            }
          }

        } else if(isEdit && (collectionRule.update_price > 0 || (collectionRule.create_price > 0 && !doc.is_freemium))) {
          // Fetch the current balance document
          const docSnapshot = await walletDocRef.get()
          //If the user wants to change from freemium to paid
          if(!doc.is_freemium) {
            // get the doc from server
            const dataSnapshot = await docRef.get()
            if(dataSnapshot.exists && dataSnapshot.data()?.is_freemium) {//If previously freemium and not premium
              if(!docSnapshot.exists || docSnapshot.data().usd_balance < collectionRule.create_price) {
                return reject({error: `You have low balance. $${collectionRule.create_price} is needed. Please fund your wallet and try gain.`})
    
              } else {
                chargeAmount = collectionRule.create_price
                if(collectionRule.subscription_expiry_date_create) {
                  collectionRule.x.subscription_expiry_date = collectionRule.subscription_expiry_date_create
                  collectionRule.x.subscription_renewed_on = FieldValue.serverTimestamp()
                }
              }

            } else if(!docSnapshot.exists || docSnapshot.data().usd_balance < collectionRule.update_price) {
              return reject({error: `You have low balance. $${collectionRule.update_price} is needed. Please fund your wallet and try gain.`})
  
            } else {
              chargeAmount = collectionRule.update_price
              if(collectionRule.subscription_expiry_date_update) {
                collectionRule.x.subscription_expiry_date = collectionRule.subscription_expiry_date_update
                collectionRule.x.subscription_renewed_on = FieldValue.serverTimestamp()
              }
            }

          } else {
            if(!docSnapshot.exists || docSnapshot.data().usd_balance < collectionRule.update_price) {
              return reject({error: `You have low balance. $${collectionRule.update_price} is needed. Please fund your wallet and try gain.`})
  
            } else {
              chargeAmount = collectionRule.update_price
              if(collectionRule.subscription_expiry_date_update) {
                collectionRule.x.subscription_expiry_date = collectionRule.subscription_expiry_date_update
                collectionRule.x.subscription_renewed_on = FieldValue.serverTimestamp()
              }
            }
          }
          
        }
        // Reference to a firebase batch writer
        const batchWriter = admin.firestore().batch();
        if(chargeAmount > 0) {
          batchWriter.set(walletDocRef, {
            usd_balance: FieldValue.increment(chargeAmount * -1),
            last_updated: FieldValue.serverTimestamp()
          }, { merge: true });
        }

        const filesToDelete = []
        let userUploads;
        if(isEdit) {
          //If the user replaced some images or make a new upload
          userUploads = getMatchedData(collectionRule.x, `https?://r2.softbaker.com/users/${uid}`)
          if(Object.keys(userUploads).length > 0) {
            //Get the doc before update
            const prevUserData = await docRef.get()
            if (prevUserData.exists) {
              const prevUserUploads = getMatchedData(prevUserData.data(), `https?://r2.softbaker.com/users/${uid}`)
              const userUploadsKeys = Object.keys(userUploads)
              for(const [key, value] of Object.entries(prevUserUploads)) {
                if(userUploadsKeys.includes(key) && userUploads[key] != value) {
                  filesToDelete.push(value)
                }
              }
            }
          }

          //If it's a static created tool
          if(collection) {
            //Update normally
            batchWriter.update(docRef, collectionRule.x);

          } // If it's a dynamic tool; that is a tool created with the tool editor
          else {
            //Update with the set method to prevent dots in data keys from being converted to objects
            //e.g if update is used on {Name.textarea: "John Doe"}, it will be converted to {Name: {textarea: "John Doe"}}

            //TODO: Might need to check to make sure the doc already exist to prevent people from using update to create
            // documents at the update's price instead of the create's price.
            // The check is not needed if only a few parts of the document can be updated, making the document created using 
            // update useless.
            batchWriter.set(docRef, collectionRule.x, {merge: true});
          }
          

        } else {
          batchWriter.create(docRef, collectionRule.x);
        }

        // Commit the batch to update the document
        batchWriter.commit()
        .then(async () => {
          if(filesToDelete.length > 0) {
            try {
              await deleteUserUploads(filesToDelete, 3)
              resolve({ docId: docId, totalFieldsUpdated: Object.keys(collectionRule.x).length})

            } catch(e) {
              resolve({ docId: docId, totalFieldsUpdated: Object.keys(collectionRule.x).length})
            }

          } else {
            resolve({ docId: docId, totalFieldsUpdated: Object.keys(collectionRule.x).length})
          }

        })
        .catch((error) => {
          if(error.message.toLowerCase().includes("document already exists")) {
            reject({ error: "Document already exists" });

          } else if(error.message.toLowerCase().includes("no document to update")) {
            reject({ error: "Document does not exist" });

          } else {
            reject({ error: error.message });
          }
        });

      })
      .catch(async (error) => {
        const userUploads = getMatchedData(doc, `https?://r2.softbaker.com/users/${uid}`)
        if(Object.keys(userUploads).length > 0) {
          try {
            await deleteUserUploads(Object.values(userUploads), 3)
            reject({ error: error.message });
  
          } catch(e) {
            reject({ error: error.message });
          }

        } else {
          reject({ error: error.message });
        }
        
      })
      .finally(() => {
        closeAdmin()
      });
  });
}

const app = express();
const port = 4001;

//app.use(express.json({ limit: '10mb' })); // Ensure the body parser can handle file payloads

app.use(cors({
  origin: "*",//origins,
  methods: 'POST',
}));
// Handle preflight requests
app.options('*', cors({
  origin: "*",//origins,
  methods: 'POST',
}));

/*
app.use(bodyParser.json({
  limit: "2mb"
}));
*/

app.use((req, res, next) => {
  if (req.method !== "GET" && !req.is("application/json")) {
    return res.status(415).json({ error: "JSON only" });
  }
  next();
});

app.use(express.json({
  limit: "2mb",
  strict: true
}));


// Middleware to authenticate Firebase user
const authenticateFirebaseUser = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    initAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add user UID to the request object
    req.uid = decodedToken.uid;

    // Calculate login age in seconds and add it to the request object
    const loginAgeInSeconds = Math.floor((Date.now() / 1000) - decodedToken.auth_time);
    req.loginAgeInSeconds = loginAgeInSeconds;

    next();
  } catch (error) {
    closeAdmin();
    const e = "Unauthorized. Please sign in again."//`Unauthorized: Invalid token(${token}) => ` + error.message
    return res.status(401).json({ error: e });
  }
};

// Middleware to authenticate by api key
const authenticateApiKey = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    initAdmin();
    const secretDocRef = admin.firestore().doc(`admin/secrets`);
    const secretsSnapshot = await secretDocRef.get()
    if (!secretsSnapshot.exists) {
      return res.status(401).json({ error: 'Unauthorized: Do Not found' });
    }
    req.secrets = secretsSnapshot.data()

    next();
  } catch (error) {
    closeAdmin();
    const e = "Unauthorized. Please sign in again."//`Unauthorized: Invalid token(${token}) => ` + error.message
    return res.status(401).json({ error: e });
  }
};

// Middleware for google recaptcha validation
const validateRecaptcha = async (req, res, next) => {
  const response = req.body.recaptchaResponse;

  next()/*
  if (!response) {
    return res.status(401).json({ error: "Unauthorized: Bot check data not provided." });
  }
  
  const body = `secret=${ENV_G_RECAPTCHA_SECRET.value()}&response=${response}`
  axios.post("https://www.google.com/recaptcha/api/siteverify", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  })
  .then(verification => {
    if(verification.data.success === true) {
      next();

    } else {
      res.status(401).json({ 
        error: "Unauthorized: Could not prove that you're human." 
        //+ JSON.stringify(verification.data) + (ENV_G_RECAPTCHA_SECRET.value() || "NONE") 
      });
    }

  })
  .catch(error => {
    const e = "Unauthorized. Error while proving that you're human."//`Unauthorized: Invalid token(${token}) => ` + error.message
    res.status(401).json({ error: e });
  })*/
};

// Called to renew a subscription automatically
const renewSubscription = (res, collection, id, docData) => {

  return new Promise((resolve, reject) => {
    const collectionRuleDocRef = admin.firestore().doc(`collection_rule/${collection}`);
    // Fetch the current balance document
    collectionRuleDocRef.get()
    .then(async (docSnapshot) => {
      if(!docSnapshot.exists) {
        return reject({code: 400, data: { error: "logins_finished", info: `Invalid collection while renewing: ${collection}` }})
      }

      const walletDocRef = admin.firestore().doc(`wallets/${docData.authorId}`);
      const walletSnapshot = await walletDocRef.get()
      const docRef = admin.firestore().doc(`${collection}/${id}`);
      if((!walletSnapshot.exists || walletSnapshot.data().usd_balance < docSnapshot.data().create_price)) {
        
        //If the date the auto renwal failed due to low balance has not been set, set the date to now
        if(!docData.subscription_balance_failed_on || docData.subscription_balance_failed_on < docData.subscription_expiry_date) {
          docRef.update({
            subscription_balance_failed_on: FieldValue.serverTimestamp(),
            last_updated: FieldValue.serverTimestamp()
          })
          .then(() => {}).catch(() => {})
          .finally(() => {
            return reject({code: 400, data: { error: "logins_finished", info: `You have low balance. $${docSnapshot.data().create_price} is needed for account renewal. Please fund your wallet and try gain.` }})
          })
          return

        } else {
          return reject({code: 400, data: { error: "logins_finished", info: `You have low balance. $${docSnapshot.data().create_price} is needed for account renewal. Please fund your wallet and try gain.` }});
        }
        
      }

      const batchWriter = admin.firestore().batch();
      batchWriter.set(walletDocRef, {
        usd_balance: FieldValue.increment(docSnapshot.data().create_price * -1),
        last_updated: FieldValue.serverTimestamp()
      }, { merge: true });
      
      batchWriter.set(docRef, {
        subscription_expiry_date: getNextRenewalDate(),
        subscription_renewed_on: FieldValue.serverTimestamp(),
        last_updated: FieldValue.serverTimestamp()
      }, { merge: true });

      // Commit the batch to update the document
      batchWriter.commit()
      .then(() => {
        return resolve({
          code: 200, 
          data: { 
            data: { id, ...docData }
          }
        })

      })
      .catch((e) => {
        return reject({code: 400, data: { error: "logins_finished", info: `error while commiting renewel batch: ${e.message}` }});
      });

    })
    .catch(e => {
      return reject({code: 400, data: { error: "logins_finished", info: `error while renewing: ${e.message}` }});
    })
  })
}

app.post('/update_balance', authenticateFirebaseUser, geoMiddleware, async (req, res) => {
  const { uid, geo } = req;
  const { coins, referralId, recipientEmail } = req.body;
  if(!coins || coins.length == 0) return res.status(400).json({error: "Empty Coins"});
  if(coins.length > 5) return res.status(400).json({error: "Too Many Coins args"});

  updateBalance(uid, coins, referralId, recipientEmail, geo)
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    res.status(400).json(error);
  })
});

app.get('/update_balance', async (req, res) => {
  const { uid, pass } = req.query;
  if(!uid || pass != PASS.value()) return res.status(400).json({error: "Permission denied"});
  const coins = ["bnb"];
  initAdmin();
  updateBalance(uid, coins, null, null, {ip: "DEV_SYNC"})
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    res.status(400).json(error);
  })
});


function getMatchedData(data, regex) {
  var result = {};

  for (var key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      typeof data[key] === "string" &&
      (new RegExp(regex, 'i')).test(data[key])
    ) {
      result[key] = data[key];
    }
  }

  return result;
}

async function deleteUserUploads(userUploads, retriesRemaining = 3) {
  const bucket = ENV_R2_BUCKET.value();
  const accessKeyId = ENV_R2_S3_ACCESS_KEY_ID.value();
  const secretAccessKey = ENV_R2_S3_SECRET_ACCESS_KEY.value();
  const endpoint = ENV_R2_S3_ENDPOINT.value();

  const failedDeletes = await deleteFilesFromR2(
    userUploads, bucket, accessKeyId, secretAccessKey, endpoint
  );

  if (failedDeletes.length > 0 && retriesRemaining > 0) {
    return deleteUserUploads(failedDeletes, retriesRemaining - 1);
  }

  return failedDeletes; // return final state (empty if successful)
}

app.post('/create_doc', authenticateFirebaseUser, async (req, res) => {
  const { uid } = req;
  const { collection, docId, doc, dynamicToolId } = req.body;
  if((!collection || typeof collection != "string") && (!dynamicToolId || typeof dynamicToolId != "string")) return res.status(400).json({error: "No data source specified"});
  if(!docId || typeof docId != "string") return res.status(400).json({error: "Empty document id"});
  if(!doc || !(Object.prototype.toString.call(doc) === '[object Object]') || Object.keys(doc).length == 0) return res.status(400).json({error: "Empty document"});

  saveDoc(uid, collection, dynamicToolId, docId, doc, false)
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    res.status(400).json(error);
  })
});

app.post('/update_doc', authenticateFirebaseUser, async (req, res) => {
  const { uid } = req;
  const { collection, docId, doc, dynamicToolId } = req.body;
  if((!collection || typeof collection != "string") && (!dynamicToolId || typeof dynamicToolId != "string")) return res.status(400).json({error: "No data source specified"});
  if(!docId || typeof docId != "string") return res.status(400).json({error: "Empty document id"});
  if(!doc || !(Object.prototype.toString.call(doc) === '[object Object]') || Object.keys(doc).length == 0) return res.status(400).json({error: "Empty document"});


  saveDoc(uid, collection, dynamicToolId, docId, doc, true)
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    res.status(400).json(error);
  })
});

app.post('/update_payment_address', authenticateFirebaseUser, async (req, res) => {
  const { uid, loginAgeInSeconds } = req;
  const { address, coinKey } = req.body;
  const addr = isEthAddress(`${address || ""}`)
  if(!address || typeof address != "string" || !addr) return res.status(400).json({error: "Empty or Invalid payment address provided.", code: "invalid_address"});
  if(!coinKey || typeof coinKey != "string" || !COINS[coinKey]) return res.status(400).json({error: "Empty or Invalid coin type provided.", code: "invalid_coin"});
  if(loginAgeInSeconds > MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS) return res.status(400).json({error: "Login expired for this operation. Login and try again", code: "expired_auth"});
  
  walletUpdatePaused()
  .then(paused => {
    if(paused) {
      res.status(500).json({ error: "Payment address can't be updated now. Please try again in a few minutes." });

    } else {
      const walletDocRef = admin.firestore().doc(`wallets/${uid}`);
      walletDocRef.set({
        [`${coinKey}_payment_address`]: addr,
        [`${coinKey}_payment_address_added`]: true
      }, { merge: true })
      .then(result => {
        res.status(200).json(result);
      })
      .catch(error => {
        res.status(400).json(error);
      })
      .finally(() => {
        closeAdmin()
      })
    }
  })
  .catch(error => {
    res.status(400).json(error);
  })
  .finally(() => {
    closeAdmin()
  })
  
});

app.post('/transfer_credit', authenticateFirebaseUser, async (req, res) => {
  const { uid, loginAgeInSeconds } = req;
  const { recipientEmail, amount } = req.body;

  if ([
    "Bb9cg9ZAEKdS8zpzBY26pfbkqSn1",
    "mLdXDQ7T7jZuwPoHSDP5ZZcOZT93",
    "bjibAHMk3dfJ1aIVQ3pxHBzszQj1"
  ].includes(uid)) {
    return res.status(500).json({ error: "You can't transfer now. Please try again in a few minutes." });
  }

  if (!recipientEmail || typeof recipientEmail !== "string") 
    return res.status(400).json({ error: "Empty or invalid recipient email address.", code: "invalid_address" });
  
  if (!amount || typeof amount !== "number") 
    return res.status(400).json({ error: "Enter a valid amount.", code: "invalid_amount" });
  
  if (amount < 1) 
    return res.status(400).json({ error: "Minimum amount you can transfer is $1.", code: "invalid_amount" });
  
  if (loginAgeInSeconds > MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS) 
    return res.status(400).json({ error: "Login expired for this operation. Login and try again.", code: "expired_auth" });
  
  try {
    // Pause wallet updates
    const paused = await walletUpdatePaused();
    if (paused) {
      return res.status(500).json({ error: "You can't transfer now. Please try again in a few minutes." });
    }

    // Check if recipient exists
    let recipientUid;
    try {
      const recipientSnapshot = await admin.auth().getUserByEmail(recipientEmail);
      if (!recipientSnapshot) {
        return res.status(400).json({ error: "The recipient does not exist on the platform yet. Tell the recipient to register on the platform first.", code: "recipient_not_found" });
      }
      recipientUid = recipientSnapshot.uid;

    } catch(e) {
      const errorMessage = (e?.message || "").includes("no user record")? "The recipient does not exist on the platform yet. Tell the recipient to register on the platform first." : (e?.message || "No error message")
      closeAdmin();
      return res.status(400).json({ error: errorMessage, code: "recipient_not_found" });
    }

    // Fetch sender's wallet balance
    const senderWalletDocRef = admin.firestore().doc(`wallets/${uid}`);
    const senderWalletSnapshot = await senderWalletDocRef.get();

    if (!senderWalletSnapshot.exists || senderWalletSnapshot.data().usd_balance < amount) {
      return res.status(400).json({ error: "Insufficient balance.", code: "insufficient_balance" });
    }

    // Transaction
    const batch = admin.firestore().batch();

    // Reduce sender's balance
    batch.update(senderWalletDocRef, {
      [`usd_balance`]: FieldValue.increment(-amount),
      [`last_updated`]: FieldValue.serverTimestamp(),
    });

    // Update recipient's wallet
    const recipientWalletDocRef = admin.firestore().doc(`wallets/${recipientUid}`);
    batch.set(recipientWalletDocRef, {
      salt: recipientUid,
      usd_balance: FieldValue.increment(amount),
      last_updated: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Create transaction history record
    const transactionRef = admin.firestore().collection('transactions').doc(); // auto ID
    batch.set(transactionRef, {
      id: transactionRef.id,
      from: uid,
      to: recipientUid,
      amount: amount,
      currency: "USD",
      status: "completed",
      type: "transfer",
      created_at: FieldValue.serverTimestamp(),
    });

    // Commit the transaction
    await batch.commit();

    return res.status(200).json({ message: "Transfer successful!" });

  } catch (error) {
    return res.status(500).json({ error: error.message || "An error occurred", code: "transfer_error" });
  } finally {
    closeAdmin();
  }
});

const canUpload = async (uid, dir, fileName) => {
  // Prefixes
  const folder = dir.startsWith("/")? dir : `/${dir}`
  const otherDirsPrefixes = ["/longeyes", "/web-mailer"];
  const adminsDirsPrefixes = ["/fonts", "/templates"];

  // Check if dir starts with any of the prefixes in otherDirsPrefixes
  if (otherDirsPrefixes.some(prefix => folder.startsWith(prefix))) {
    return true;
  }

  // Check if dir starts with "/users/{uid}"
  if (folder == "/users" && fileName && fileName.startsWith(uid.toLowerCase())) {
    return true;
  }

  // Check if dir starts with any of the prefixes in adminsDirsPrefixes
  if (adminsDirsPrefixes.some(prefix => folder.startsWith(prefix))) {
    // Fetch the Firestore document located at "admins/{uid}"
    const docRef = admin.firestore().doc(`admins/${uid}`);
    const adminDoc = await docRef.get();

    // If the document does not exist, return false
    if (!adminDoc.exists) {
      return false;
    }

    // Check if permissions array contains "can_create_tools"
    const { permissions } = adminDoc.data();
    return permissions && permissions.includes("can_create_tools");
  }

  // Default case: if none of the above conditions match
  return false;
};

app.post('/get-presigned-url', authenticateFirebaseUser, async (req, res) => {
    const { uid } = req;
    const { id, fileName, fileType, dir } = req.body;

    const canUploadFile = await canUpload(uid, dir, fileName)
    if(!canUploadFile) {
      return res.status(403).json({error: `You don't have permission to upload files.`});
    }

    const bucketName = ENV_R2_BUCKET.value();
    // Initialize S3 client for Cloudflare R2
    const s3Client = new S3Client({
        region: 'auto', // R2 uses 'auto' as region
        endpoint: ENV_R2_S3_ENDPOINT.value(),
        credentials: {
            accessKeyId: ENV_R2_S3_ACCESS_KEY_ID.value(),
            secretAccessKey: ENV_R2_S3_SECRET_ACCESS_KEY.value(),
        },
    });

    const params = {
        Bucket: bucketName,
        Key: `${dir}${dir.endsWith("/")? "" : "/"}${fileName}`,
        ContentType: fileType,
        ACL: 'public-read', // Optional, adjust as needed for your use case
    };

    // Create the command to get the signed URL
    const command = new PutObjectCommand(params);
    
    // Generate the presigned URL
    getSignedUrl(s3Client, command, { expiresIn: 300 })// URL expires in 5 minutes
    .then(presignedUrl => {
        res.json({ id, presignedUrl });
    })
    .catch(error => {
        res.status(500).json({ error: 'Error generating presigned URL', details: error.message });
    })
    .finally(() => {
      closeAdmin()
    });
});

app.post('/create_wallets', authenticateApiKey, async (req, res) => {
  const { secrets } = req;
  const { minPendingWallets, maxPendingWallets, coinKey } = req.body;
  if(!minPendingWallets || typeof minPendingWallets != "number") return res.status(400).json({error: "minPendingWallets must be greater than zero.", code: "minPendingWallets"});
  if(!maxPendingWallets || typeof maxPendingWallets != "number" || maxPendingWallets < minPendingWallets) return res.status(400).json({error: "maxPendingWallets must be greater than zero and minPendingWallets.", code: "maxPendingWallets"});
  if(!coinKey || typeof coinKey != "string" || !COINS[coinKey]) return res.status(400).json({error: "Empty or Invalid coin type provided.", code: "invalid_coin"});

  createWallets(minPendingWallets, maxPendingWallets, coinKey, secrets)
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    res.status(400).json(error);
  })
});


app.get('/doc', async (req, res) => {
  const { 
    collection, doc_id, 
  } = req.query;

  if(!collection || typeof collection != "string") return res.status(400).json({error: "No data source specified"});
  if(!doc_id || typeof doc_id != "string") return res.status(400).json({error: "Empty document id"});

  try {
    initAdmin()
    const docRef = admin.firestore().doc(`${collection}/${doc_id}`);
    const dataSnapshot = await docRef.get()
    if(!dataSnapshot.exists) {
      closeAdmin()
      return res.status(400).json({error: `Invalid ${collection}`});

    } else {
      closeAdmin()
      return res.status(200).json({data: dataSnapshot.data()})
    }
  } catch (error) {
    closeAdmin()
    return res.status(401).json({ error: `  Admin Init failed with` + error.message});
  }
});
app.post('/doc', validateRecaptcha, async (req, res) => {
  const { 
      collection, doc_id, 
      user_key, pass_key, 
      user_value, pass_value 
  } = req.body;

  if (!collection || typeof collection !== "string" || collection.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!user_key || typeof user_key !== "string" || user_key.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!pass_key || typeof pass_key !== "string" || pass_key.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!user_value || `${user_value}`.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!pass_value || `${pass_value}`.length > 64) return res.status(400).json({ error: "No data source specified" });

  try {
      initAdmin();

      // Check if user_key and pass_key are provided
      if (user_key && pass_key) {
        // Authenticate the request using the provided keys
        if (!user_key.endsWith("username") || !pass_key.endsWith("password")) {
            closeAdmin();
            return res.status(401).json({ error: "Wrong username or password." });
        }

        // If user authentication is successful, fetch the document using user and pass
        const querySnapshot = await admin.firestore().collection(collection)
            .where(user_key, "==", user_value)
            .where(pass_key, "==", pass_value)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
          closeAdmin();
          return res.status(400).json({ error: "Wrong username or password." });

        } else {
          const docData = querySnapshot.docs[0].data();
          if(docData.is_freemium) {
            closeAdmin();
            res.status(200).json({ data: {
              id: querySnapshot.docs[0].id,
              ...docData
            }});

          } else if(docData.isInActive) {
            res.status(400).json({ error: "account_disabled" });

          } else if(docData.subscription_expiry_date < admin.firestore.Timestamp.now()) {
            if(docData.autoRenewSubscription) {
              renewSubscription(res, collection, querySnapshot.docs[0].id, docData)
              .then(result => {
                closeAdmin();
                return res.status(result.code).json(result.data);
              })
              .catch(eInfo => {
                closeAdmin();
                return res.status(eInfo.code).json(eInfo.data);
              })

            } else {
              closeAdmin();
              return res.status(400).json({ error: "logins_finished" });

            }

          } else {
            closeAdmin();
            return res.status(200).json({ data: {
              id: querySnapshot.docs[0].id,
              ...docData
            }});
          }
        }

      } else {
        // If user_key and pass_key are not provided, fetch the document by doc_id directly
        if (!doc_id || typeof doc_id !== "string") return res.status(400).json({ error: "Empty document id" });

        const docRef = admin.firestore().doc(`${collection}/${doc_id}`);
        const dataSnapshot = await docRef.get();

        if (!dataSnapshot.exists) {
            closeAdmin();
            return res.status(400).json({ error: `Invalid ${collection}` });
        } else {
            closeAdmin();
            const dataString = JSON.stringify(dataSnapshot.data())
            //If fetch method is only through username and password
            if(dataString.includes('username":') || dataString.includes('password":')) {
              return res.status(401).json({ error: "Please provide username and password" });
            }
            return res.status(200).json({ data: dataSnapshot.data() });
        }
      }
  } catch (error) {
      closeAdmin();
      return res.status(500).json({ error: `Admin Init failed with: ${error.message}` });
  }
});

const createDebit = (res, collection, id, data, txDetails) => {
  const { amount, memo, completeStatus, processingDuration } = txDetails

  if(data.disableAccount) {
    closeAdmin()
    return res.status(400).json({ 
      error: "account_disabled", 
      data: { 
        debits: data.debits || [], 
        credits: data.credits || [],
        totalDebits: data.totalDebits || 0,
        totalCredits: data.totalCredits || 0
      } 
    })
  }
  
  const accountBalance = (((data.accountBalance || 0) + (data.totalCredits || 0)) - (data.totalDebits || 0)) - amount
  if(accountBalance < 0) {
    closeAdmin()
    return res.status(400).json({ 
      error: "low_balance", 
      data: {
        debits: data.debits || [], 
        credits: data.credits || [],
        totalDebits: data.totalDebits || 0,
        totalCredits: data.totalCredits || 0
      } 
    })
  }

  const debits = data.debits? JSON.parse(JSON.stringify(data.debits)) : []

  //If the total debits has exceeded the maximum, evict the oldest debit
  if(debits.length == 10) debits.shift()
  debits.push(`v2,${amount},${memo},${Date.now()},${(processingDuration || "immediately")},${(completeStatus || "Successful")}`)

  const updateTxBalance = (completeStatus || "Successful") == "Successful";
  const collectionRef = admin.firestore().doc(`${collection}/${id}`);
  collectionRef.update({ debits, totalDebits: FieldValue.increment(updateTxBalance? amount : 0) }, { merge: true })
  .then(() => {
    closeAdmin()
    res.status(200).json({
      data: {
        debits, 
        credits: data.credits || [],
        totalDebits: (data.totalDebits || 0) + updateTxBalance? amount : 0,
        totalCredits: data.totalCredits || 0
      } 
    })
  })
  .catch(e => {
    res.status(200).json({
      error: "An error occurred while try to send funds. Please try again later.",
      data: {
        debits: data.debits || [], 
        credits: data.credits || [],
        totalDebits: data.totalDebits || 0,
        totalCredits: data.totalCredits || 0
      } 
    })
  })
}

app.post('/debit', validateRecaptcha, async (req, res) => {
  const { 
    collection, 
    user_key, pass_key, 
    user_value, pass_value, 
    
    amount, memo, 
    completeStatus, 
    processingDuration
  } = req.body;

  if (!collection || typeof collection !== "string" || collection.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!user_key || typeof user_key !== "string" || user_key.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!pass_key || typeof pass_key !== "string" || pass_key.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!user_value || `${user_value}`.length > 64) return res.status(400).json({ error: "No data source specified" });
  if (!pass_value || `${pass_value}`.length > 64) return res.status(400).json({ error: "No data source specified" });

  if (!amount || typeof amount !== "number" || `${amount}`.length > 16) return res.status(400).json({ error: "Invalid amount." });
  if (memo && (typeof memo !== "string" || memo.length > 64)) return res.status(400).json({ error: "Memo too long." });

  if (completeStatus && (typeof completeStatus !== "string" || completeStatus.length > 64)) return res.status(400).json({ error: "Invalid Complete status." });
  if (processingDuration && (typeof memo !== "string" || processingDuration.length > 64)) return res.status(400).json({ error: "Invalid Duration." });

  try {
    initAdmin();

    // Check if user_key and pass_key are provided
    // Authenticate the request using the provided keys
    if (!user_key.endsWith("username") || !pass_key.endsWith("password")) {
        closeAdmin();
        return res.status(401).json({ error: "logins_expired." });
    }

    // If user authentication is successful, fetch the document using user and pass
    const querySnapshot = await admin.firestore().collection(collection)
        .where(user_key, "==", user_value)
        .where(pass_key, "==", pass_value)
        .limit(1)
        .get();

    if (querySnapshot.empty) {
      closeAdmin();
      return res.status(400).json({ error: "logins_expired." });

    } else {
      const docData = querySnapshot.docs[0].data();
      const id = querySnapshot.docs[0].id
      if(docData.is_freemium) {
        createDebit(res, collection, id, docData, { amount, memo, completeStatus, processingDuration })

      } else if(docData.subscription_expiry_date < admin.firestore.Timestamp.now()) {
        if(docData.autoRenewSubscription) {
          renewSubscription(res, collection, querySnapshot.docs[0].id, docData)
          .then(result => {
            createDebit(res, collection, id, docData, { amount, memo, completeStatus, processingDuration })
          })
          .catch(eInfo => {
            closeAdmin();
            res.status(eInfo.code).json(eInfo.data);
          })

        } else {
          closeAdmin();
          return res.status(400).json({ error: "logins_finished" });

        }

      } else {
        createDebit(res, collection, id, docData, { amount, memo, completeStatus, processingDuration });
      }
    }
  } catch (error) {
    closeAdmin();
    return res.status(500).json({ error: `Admin Init failed with: ${error.message}` });
  }
});

app.post('/download_svg_result', authenticateFirebaseUser, async (req, res) => {
  const { uid } = req;
  const { id, user_uploads, selectedSide } = req.body;

  if (!id || !user_uploads || (typeof user_uploads !== "object")) {
    closeAdmin();
    return res.status(400).json({
      error: "Missing or invalid required fields: 'id'."
    });
  }

  if (user_uploads && typeof user_uploads !== "object") {
    closeAdmin();
    return res.status(400).json({
      error: "Invalid 'user_uploads'."
    });
  }

  let svg

  try {
    
    const docRef = admin.firestore().doc(`other_tools_data/${id}`);
    const docSnapshot = await docRef.get();

    if(!docSnapshot.exists) {
      closeAdmin();
      return res.status(404).json({
        error: "The document does not exist."
      })
    }

    const data = docSnapshot.data()

    if(data.authorId != uid) {
      closeAdmin();
      return res.status(403).json({
        error: "You don't have the permission to download this document. Make sure you're signed in."
      })
    }

    var tools = (await axios.get(`https://${ENV_R2_CUSTOM_DOMAIN.value()}/templates/tools.json`)).data?.tools;
    tools = arrayToMap("id", tools || [])

    if(!tools[data.toolId]) {
      closeAdmin();
      return res.status(400).json({
        error: "Invalid tools. Please report to the admin."
      })
    }

    const templatesMap = arrayToMap("id", tools[data.toolId]?.templates || [])
    const template = templatesMap[data.template_id]

    if(!tools[data.toolId]) {
      closeAdmin();
      return res.status(400).json({
        error: "Invalid template. Please report to the admin."
      })
    }

    const templateData = (await axios.get(template.data_url)).data;

    if(!tools[data.toolId]) {
      closeAdmin();
      return res.status(500).json({
        error: "Failed to get the template data. Please report to the admin."
      })
    }

    var totalSize = 0
    for (const [fieldKey, resized] of Object.entries(user_uploads)) {
      data[fieldKey] = resized
      totalSize += resized.length
      console.log("base64Uploads:", fieldKey, resized.slice(0, 30), 
      `resizedSize: ${resized.length}`)
    }

    if(totalSize > MAX_IMAGES_UPLOAD_SIZE) {
      closeAdmin();
      return res.status(400).json({
        error: "Too large image(s) uploaded."
      })
    }

    const fontsFamily = await getFontFamiliesFromSVG(templateData.svg)
    const fonts = await generateFontMap(ENV_R2_CUSTOM_DOMAIN.value(), fontsFamily)
    
    const splits = (template?.split_on_download || template?.split_on_download_hr) === true
    var highQuality = false
    highQuality = highQuality && !data.is_freemium
    const size = highQuality? (splits? 2048 : 1024) : splits? 1024 : 728
    
    svg = await getSvg(ENV_R2_CUSTOM_DOMAIN.value(), data, templateData, fonts, data.is_freemium, size, null, FILE_FIELD_TYPES_DEFUALT_FILES)
    
    if(!svg) {
      closeAdmin();
      return res.status(500).json({
        error: "Failed to generate document base from template. Please report to the admin."
      })
    }

    const side = splits && selectedSide ? selectedSide : template.split_on_download? "front" : template.split_on_download_hr? "front_hr" : undefined
    //const side = (template?.split_on_download || template?.split_on_download_hr) && selectedSide? selectedSide : undefined

    let image = await downloadSvgAsImage(
      svg, "jpeg", 
      "download",
      side)

      // Extract base64 data after the comma
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", "inline; filename=result.jpg");
    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error("Error handling /download_svg_result:", error);
    return res.status(500).json({ error: "Failed to process uploads", details: error.message });

  } finally {
    closeAdmin();
  }
});

/*
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
*/

// Replace app.listen() with exports.api = functions.https.onRequest(app);
//exports.api = functions.https.onRequest(app);
exports.api = functions
.runWith({ memory: "1GB", timeoutSeconds: 540, minInstances: 1 }).https.onRequest(app);

// Scheduled function to run every 10 minutes
exports.splitFundsJobV2 = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
  initAdmin(); // Ensure initAdmin completes if it's async
  splitFunds(admin, "bnb")
  .then((r) => {
      console.log("splitFunds completed successfully.", r);
  })
  .catch((error) => {
      console.error("splitFunds failed:", error.message);
  })
  .finally(() => {
      closeAdmin(); // Ensure cleanup happens regardless of success/failure
  })
});

// Scheduled function to run every 10 minutes
exports.updateToolsFile = functions
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .pubsub.schedule('every 60 minutes').onRun(async (context) => {
  initAdmin(); // Ensure initAdmin completes if it's async
  updateToolsStaticFile(admin)
  .then((tools) => {
      console.log("Tools.Data: ", "tools");
  })
  .catch((error) => {
      console.error("Tools.Error: ", error?.message);
  })
  .finally(() => {
      closeAdmin(); // Ensure cleanup happens regardless of success/failure
  })
});

exports.updateToolsFileOnCollectionUpdate = functions
  .runWith({ memory: "1GB", timeoutSeconds: 540 })
  .firestore
  .document('other_tools/{docId}')
  .onWrite((change, context) => {
    initAdmin(); // Ensure initAdmin completes if it's async
    return updateToolsStaticFile(admin)
      .then((tools) => {
        console.log("OtherTools.Data: ", "tools");
      })
      .catch((error) => {
        console.error("OtherTools.Error: ", error?.message);
      })
      .finally(() => {
        closeAdmin(); // Ensure cleanup happens regardless of success/failure
      });
});