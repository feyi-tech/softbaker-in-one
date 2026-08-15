const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;
const Web3 = require("web3").default;
const serviceAccount = require("./serviceAccountKey.json");
const WalletFactory = require('./WalletFactory');
const { COINS, PRICE_DATA_TTL_MINUTES, REF_PCT, MAX_BIG_INT_STRING_DIGITS, MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS } = require('./utils/c');
const { default: axios } = require('axios');
const path = require('path');
const { isEthAddress, weiToEther } = require('./utils/f');
const { writeFileSync } = require('fs');

const initAdmin = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
};

function padNumberWithZeros(number, width) {
  if (typeof width !== 'number') {
    throw new Error('Both arguments must be numbers');
  }

  if (!Number.isInteger(width) || width < 0) {
    throw new Error('Width must be a non-negative integer');
  }

  return number.toString().padStart(width, '0');
}

const closeAdmin = () => {
  admin.app().delete().catch(() => {});
};

const coinKey = "bnb";
const rpcUrl = "https://bsc-rpc.publicnode.com" //COINS[coinKey].abiData.rpcUrl
const web3 = new Web3(rpcUrl);

/** 🔹 Create contract instance using same RPC URL */

const walletFactory = new web3.eth.Contract(
  COINS[coinKey].abiData.abi,
  COINS[coinKey].abiData.address
);


const wallets = [
  {
    email: "adenikeoreofe14@gmail.com",
    salt: "mLdXDQ7T7jZuwPoHSDP5ZZcOZT93",
    wei: "35570780000000000"
  },
  {
    email: "h28385549@gmail.com",
    salt: "bjibAHMk3dfJ1aIVQ3pxHBzszQj1",
    wei: "35570780000000000"
  },
  {
    email: "phillipsoyebola@yahoo.com",
    salt: "Bb9cg9ZAEKdS8zpzBY26pfbkqSn1",
    wei: "35570780000000000"
  },
  {
    email: "adefarayoladammy17@gmail.com",
    salt: "E0PWQQixX2VmdFGnOZc6VZ2jXDN2",
    wei: "35570780000000000"
  },
  {
    email: "kellychristiana100@gmail.com",
    salt: "VUsCug2GJxNL5aaE9J8F4Y9SE8m1",
    wei: "35570780000000000"
  },
  {
    email: "",
    salt: "aoA3dBRQfvVbGztZorPw8t1zr2q2",
    wei: "0"
  }
];

async function run() {
  let total = BigInt("0");
  const salts = [];
  const derivedAddresses = [];

  for (const wallet of wallets) {
    const paddedSalt = web3.utils.rightPad(
      web3.utils.asciiToHex(wallet.salt.toLowerCase()),
      64
    );

    total += BigInt(wallet.wei);
    salts.push(paddedSalt);

    /** 🔹 Read contract function: getSaltAddress */
    const result = await walletFactory.methods.getSaltBalance(paddedSalt).call();
    result.salt = wallet.salt;
    result.paddedSalt = paddedSalt;
    result.email = wallet.email;
    derivedAddresses.push(result);

    console.log(wallet.salt, ":", paddedSalt, "→", result);
  }

  const bnbPrice = 561.71;
  const coinVal = weiToEther(total, 18, 6);
  const usdVal = coinVal * bnbPrice;

  const bnbInWei = Web3.utils.toWei(1, "ether");

  const returnAmountInDolls = 5;
  const returnAmountInWei =
    (BigInt(bnbInWei) * BigInt(returnAmountInDolls)) /
    BigInt(Math.round(bnbPrice));

  console.log(
    "Total:",
    total,
    padNumberWithZeros(total.toString(), MAX_BIG_INT_STRING_DIGITS),
    coinVal,
    usdVal
  );

  console.log("Salts:", salts.join(","));
  console.log(
    "Derived addresses:", 
      JSON.stringify(derivedAddresses, (_, value) =>
      typeof value === "bigint" ? value.toString() : value)
  );
  console.log(`${returnAmountInDolls} Usd Amount is ${returnAmountInWei.toString()}`);

  writeFileSync(
    "./w-salts.json", 
    JSON.stringify(derivedAddresses, (_, value) =>
    typeof value === "bigint" ? value.toString() : value, 
    "\t")
  );
}

run().catch(console.error);