const { initFirebase, findUserByCallback } = require("./processes-with-callback");
const admin = require('firebase-admin');
const Web3 = require("web3").default;
const serviceAccount = require("./serviceAccountKey.json");
const { COINS } = require('./utils/c');

const coinKey = "bnb";
const abi = COINS[coinKey].abiData.abi;
const rpcUrl = "https://bsc-rpc.publicnode.com" //COINS[coinKey].abiData.rpcUrl
//const rpcUrl = COINS[coinKey].abiData.rpcUrl;
const contractAddress = COINS[coinKey].abiData.address; // make sure this is set in your COINS object

const web3 = new Web3(rpcUrl);
const contract = new web3.eth.Contract(abi, contractAddress);

const addressToMatch = "0xD06a44c440064e03512829110C65642A433aa363";
// UID: YrSSikpSmeSwBthIIb0A4Tt3d7X2, 
// Salt: 0x79727373696b70736d6573776274686969623061347474336437783200000000, 
// Wallet: 0xD06a44c440064e03512829110C65642A433aa363
// Matching UID: YrSSikpSmeSwBthIIb0A4Tt3d7X2


async function callback(uid) {
  // Create a padded salt from UID
  const paddedSalt = web3.utils.rightPad(
    web3.utils.asciiToHex(uid.toLowerCase()),
    64
  );

  // Call the contract's getSaltAddress function
  try {
    const result = await contract.methods.getSaltAddress(paddedSalt).call();
    const walletAddress = result.wallet; // result is { wallet: "...", isCreated: true/false }

    console.log(`UID: ${uid}, Salt: ${paddedSalt}, Wallet: ${walletAddress}`);

    // Return the wallet address so findUserByCallback can compare
    return walletAddress;
  } catch (err) {
    console.error(`Error fetching wallet for UID ${uid}:`, err.message);
    return null;
  }
}

(async () => {
  initFirebase(serviceAccount);

  const result = await findUserByCallback(callback, addressToMatch);

  console.log("Matching UID:", result);
})();