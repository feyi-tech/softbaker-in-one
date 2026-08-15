const { initFirebase, findUserByCallback, sumEligibleBnb, bnbRate } = require("./processes-with-callback");
const admin = require('firebase-admin');
const Web3 = require("web3").default;
const serviceAccount = require("./serviceAccountKey.json");
const { COINS } = require('./utils/c');
const { writeFileSync } = require("fs");

const coinKey = "bnb";
const abi = COINS[coinKey].abiData.abi;
const rpcUrl = "https://bsc-rpc.publicnode.com" //COINS[coinKey].abiData.rpcUrl
//const rpcUrl = COINS[coinKey].abiData.rpcUrl;
const contractAddress = COINS[coinKey].abiData.address; // make sure this is set in your COINS object

const web3 = new Web3(rpcUrl);
const contract = new web3.eth.Contract(abi, contractAddress);


async function callback(uid) {
  // Create a padded salt from UID
  const paddedSalt = web3.utils.rightPad(
    web3.utils.asciiToHex(uid.toLowerCase()),
    64
  );

  // Call the contract's getSaltAddress function
  try {
    const result = await contract.methods.getSaltBalance(paddedSalt).call();
    const walletAddress = result.wallet; // result is { wallet: "...", isCreated: true/false }

    console.log(`UID: ${uid}, Salt: ${paddedSalt}, Wallet: ${walletAddress}, Balance: ${result.balance}`);

    // Return the wallet address so findUserByCallback can compare
    return result;
  } catch (err) {
    console.error(`Error fetching wallet for UID ${uid}:`, err.message);
    return null;
  }
}

(async () => {
  initFirebase(serviceAccount);

  const rate = await bnbRate();
  if(!rate) {
    console.log(`BNB Rate Error!`);
    return;
  }

  const result = await sumEligibleBnb(1, rate, callback);

  writeFileSync(
    "./process-sum.json", 
    JSON.stringify(result, (_, value) =>
    typeof value === "bigint" ? value.toString() : value, 
    "\t")
  );
  console.log(`BNB Rate: ${rate} | `, "TotalBalance:", result.balance);
})();