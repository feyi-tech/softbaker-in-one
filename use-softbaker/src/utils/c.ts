import { Coins } from "../components/PayFlow/types";
import { LIB_LOGO, BNB_LOGO, ETH_LOGO,  } from "./base64Images"

import WalletFactoryTestnet from '../abis/WalletFactoryTestnet.json'
import WalletFactoryBsc from '../abis/WalletFactoryBsc.json'
import WalletFactoryEth from '../abis/WalletFactoryEth.json'
import WalletFactoryGoerli from '../abis/WalletFactoryGoerli.json'

export const FIREBASE_CONFIG: {[x: string]: any} = {
    apiKey: "AIzaSyBykIOPWfKmDrAC6jly4p1Hl_NsaRSntFo",
    authDomain: "my-project-223a2.firebaseapp.com",
    projectId: "my-project-223a2",
    storageBucket: "my-project-223a2.appspot.com",
    messagingSenderId: "121945247533",
    appId: "1:121945247533:web:408269d255291ea70b8da4",
    measurementId: "G-2L4CPV9S32"
}

export const PROMISE_ID = {
    signIn: "signIn",
    getAccessToken: "getAccessToken",
    deposit: "deposit",
    downloadType: "downloadType",
    requestPayment: "requestPayment",
    creditTransfer: "creditTransfer"
}

export const IS_TEST = false
//export const SERVER_BASE_URL_TEST = "https://server.softbaker.com"//"http://localhost:3001"
//export const SERVER_BASE_URL_LIVE = "https://server.softbaker.com"
export const PRECISION = 5
export const SDK_RETRY_INTERVAL_MINS = 0.2
export const PRICE_FETCH_INTERVAL_MINS = 10
export const MIN_BLOCK_CHECK_INTERVAL_SECONDS = 5;
export const MIN_REFERAAL_WITHDRAWAL = 20;
export const CHAINS_RPC_LISTS: {[x: string]: string[]} = {
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
export const COINS: Coins = {
    bnb: {
        coingecko_price_key: "binancecoin",
        disabled: IS_TEST,
        decimals: 18,
        requiredConfirmations: 20,
        priority: 1,
        key: "bnb",
        symbol: "BNB",
        name: "BNB(Binance smart chain)",
        depositWarning: `Please make sure you send only BNB coin to the wallet address shown.`,
        secondsPerBlock: 3,
        logo: BNB_LOGO,
        abiData: WalletFactoryBsc
    },
    bnb_testnet: {
        coingecko_price_key: "binancecoin",
        disabled: !IS_TEST,
        decimals: 18,
        requiredConfirmations: 12,
        priority: 1,
        key: "bnb_testnet",
        name: "BNB(Binance smart chain)",//"BNB(Binance testnet)",
        symbol: "tBNB",
        depositWarning: `Please make sure you send only BNB coin to the wallet address shown.`,
        secondsPerBlock: 3,
        logo: BNB_LOGO,
        abiData: WalletFactoryTestnet
    },
    ethereum: {
        coingecko_price_key: "ethereum",
        disabled: true,
        decimals: 18,
        requiredConfirmations: 12,
        priority: 2,
        key: "ethereum",
        symbol: "ETH",
        name: "Ethereum(Ethereum block chain)",
        depositWarning: `Please make sure you send only Ethereum coin to the wallet address shown.`,
        secondsPerBlock: 12,
        logo: ETH_LOGO,
        abiData: WalletFactoryEth
    },
    ethereum_testnet: {
        coingecko_price_key: "ethereum",
        disabled: true,
        decimals: 18,
        requiredConfirmations: 12,
        priority: 2,
        key: "ethereum_testnet",
        symbol: "tETH",
        name: "Ethereum(Goerli network)",
        depositWarning: `Please make sure you send only Test Ethereum coin to the wallet address shown.`,
        secondsPerBlock: 12,
        logo: ETH_LOGO,
        abiData: WalletFactoryGoerli
    }
}


export const SDK_NAME = "SoftbakerPay"
export const SDK_SITE = "https://softbaker.com"
export const STORE_FRAME_ID = `${SDK_NAME}_storeframe`

export const STORAGE_KEYS = {
    ENABLED_LOG: `${SDK_NAME}_ENABLED_LOG`,
    SDK_CONFIG: `${SDK_NAME}_SDK_CONFIG`,
    DOC_RULES: `${SDK_NAME}_DOC_RULES`,
    LAST_DEPOSIT_BLOCK_NUMBER: `${SDK_NAME}_LAST_DEPOSIT_BLOCK_NUMBER`,
    LAST_LOGIN_MILLI: `${SDK_NAME}_LAST_LOGIN_MILLI`,
    LAST_USD_BALANCE: `${SDK_NAME}_LAST_USD_BALANCE`,
    USER: `${SDK_NAME}_USER`
}
export const LOGO_PATH = LIB_LOGO
export const MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS = 300
export const REF_PCT = 20
export const ERROR_X = "An error occurred. Please try again later."