const WalletFactoryTestnet = require('../abis/WalletFactoryTestnet.json');
const WalletFactoryBsc = require('../abis/WalletFactoryBsc.json');
const WalletFactoryEth = require('../abis/WalletFactoryEth.json');
const WalletFactoryGoerli = require('../abis/WalletFactoryGoerli.json');

const CoinDistributorWithLockerBsc = require('../abis/CoinDistributorWithLockerBsc.json');
const CoinDistributorWithLockerEth = require('../abis/CoinDistributorWithLockerEth.json');

const MAX_IMAGES_UPLOAD_SIZE = 1024 * 1024

const DOLLAR_MARKET_PRICE_SHIFT_FILL = 0.2
const PRECISION = 5
const PRICE_DATA_TTL_MINUTES = 5
const REF_PCT = 0;//10
const REF_PAYOUT_TRESH_IN_USD = 20
const REF_PAYOUT_DAY_INTERVAL = 7
const MAX_BIG_INT_STRING_DIGITS = 26//10 million(7) ether(18 decimals) =? 7 zeros + 18 zeros + 1 digit = 26
const MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS = 300
const PAY_OUT_DAYS = [7, 17, 27]
const IS_TEST = false
const CHAINS_RPC_LISTS = {
    bnb: [
        "https://bsc-dataseed1.bnbchain.org",
        "https://bsc-dataseed2.bnbchain.org",
        "https://bsc-dataseed3.bnbchain.org",
        "https://bsc-dataseed4.bnbchain.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-dataseed2.defibit.io",
        "https://bsc-dataseed3.defibit.io",
        "https://bsc-dataseed.binance.org",
        "https://bsc-dataseed1.binance.org",
    ],
    bnb_testnet: [
        "https://bsc-dataseed.binance.org",
    ],
    ethereum: [
        "https://bsc-dataseed.binance.org",
    ],
    ethereum_testnet: [
        "https://bsc-dataseed.binance.org",
    ]
}
const COINS = {
    bnb: {
        coingecko_price_key: "binancecoin",
        disabled: IS_TEST,
        decimals: 18,
        requiredConfirmations: 20,
        priority: 1,
        key: "bnb",
        abiData: WalletFactoryBsc,
        coinDistributorAbiData: CoinDistributorWithLockerBsc
    },
    bnb_testnet: {
        coingecko_price_key: "binancecoin",
        disabled: !IS_TEST,
        decimals: 18,
        requiredConfirmations: 12,
        priority: 1,
        key: "bnb_testnet",
        abiData: WalletFactoryTestnet,
        coinDistributorAbiData: CoinDistributorWithLockerBsc
    },
    ethereum: {
        coingecko_price_key: "ethereum",
        disabled: true,
        decimals: 18,
        requiredConfirmations: 12,
        priority: 2,
        key: "ethereum",
        abiData: WalletFactoryEth,
        coinDistributorAbiData: CoinDistributorWithLockerEth
    },
    ethereum_testnet: {
        coingecko_price_key: "ethereum",
        disabled: true,
        decimals: 18,
        requiredConfirmations: 12,
        priority: 2,
        key: "ethereum_testnet",
        abiData: WalletFactoryGoerli,
        coinDistributorAbiData: CoinDistributorWithLockerBsc
    }
}

module.exports = {
    PRECISION,
    PRICE_DATA_TTL_MINUTES,
    COINS,
    REF_PCT,
    REF_PAYOUT_TRESH_IN_USD,
    REF_PAYOUT_DAY_INTERVAL,
    MAX_BIG_INT_STRING_DIGITS,
    MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS,
    PAY_OUT_DAYS,
    DOLLAR_MARKET_PRICE_SHIFT_FILL,
    CHAINS_RPC_LISTS,
    MAX_IMAGES_UPLOAD_SIZE
}