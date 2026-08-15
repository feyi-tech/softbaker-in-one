const admin = require("firebase-admin");
const { default: axios } = require('axios');


const serviceAccount = require("./serviceAccountKey.json");

function initFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

/**
 * Get all users sorted by last login in descending order,
 * run a callback for each, and return the UID of the first
 * that matches the given string.
 *
 * @param {Function} asyncCallback - async function(userId) => string
 * @param {string} matchString - String to match against callback output
 * @returns {Promise<string|null>} - The UID of the matching user or null
 */
async function findUserByCallback(asyncCallback, matchString) {
  let users = [];
  let nextPageToken;

  // Fetch all users from Firebase Auth
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    users = users.concat(result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  // Sort users by last login time descending
  users.sort((a, b) => {
    const aTime = a.metadata.lastSignInTime ? new Date(a.metadata.lastSignInTime).getTime() : 0;
    const bTime = b.metadata.lastSignInTime ? new Date(b.metadata.lastSignInTime).getTime() : 0;
    return bTime - aTime;
  });

  // Iterate and check with callback
  for (const user of users) {
    const output = await asyncCallback(user.uid);
    if (output === matchString) {
      return user.uid;
    }
  }

  return null;
}

/**
 * Query wallets where:
 *  - bnb_contract_created == false
 *  - bnb_balance_in_usd > minUsd
 *
 * For each document found:
 *  - Calls asyncCallback(docId)
 *  - Callback must return: { balance: "bigint_string_in_bnb_units" }
 *
 * Then:
 *  - Sums all balances (BigInt safe)
 *  - Converts to USD using provided bnbRate
 *
 * @param {number} minUsd - Minimum USD threshold
 * @param {number} bnbRate - Current BNB price in USD
 * @param {Function} asyncCallback - async function(docId) => { balance: string }
 *
 * @returns {Promise<{ totalBnb: string, totalUsd: number }>}
 */
async function sumEligibleBnb(minUsd, bnbRate, asyncCallback) {
  const db = admin.firestore();

  const snapshot = await db
    .collection("wallets")
    .where("bnb_contract_created", "==", false)
    .where("bnb_balance_in_usd", ">", minUsd)
    .get();

  let totalBnb = 0n; // BigInt accumulator

  const balances = []

   // Convert from wei (assuming 18 decimals)
  const decimals = 18n;
  const divisor = 10n ** decimals;
  let counts = 0;

  for (const doc of snapshot.docs) {
    //if(Object.keys(doc.data()).includes("bnb_create_hash_salt")) continue;
    const result = await asyncCallback(doc.id);

    if (!result || !result.balance) continue;

    try {
      const balanceBigInt = BigInt(result.balance);
      totalBnb += balanceBigInt;
      const bnb = Number(balanceBigInt) / Number(divisor);
      balances.push({
        salt: doc.id,
        wallet: result.wallet,
        balance_in_units: result.balance,
        balance_in_bnb: bnb,
        balance_in_usd: bnb * bnbRate,
        bnb_create_hash_salt: doc.data().bnb_create_hash_salt
      })
      counts++;
    } catch (err) {
      console.error(`Invalid BigInt balance for ${doc.id}`, err);
    }
  }

  const totalBnbFloat = Number(totalBnb) / Number(divisor);

  const totalUsd = totalBnbFloat * bnbRate;

  return {
    balance: {
      totalBnb: totalBnb.toString(), // keep precision safe
      totalUsd,
      totalWallets: counts
    },
    balances
  };
}

async function bnbRate() {
  try {
      const priceData = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum&vs_currencies=usd'
    );

    return priceData.data.binancecoin.usd;
  } catch(e) {
    console.log("bnbRate.error", e.message);
    return 0;
  }
}

module.exports = { initFirebase, findUserByCallback, sumEligibleBnb, bnbRate };