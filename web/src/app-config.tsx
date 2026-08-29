import { Tool as ToolProps } from "use-softbaker/dist/components/PayFlow/types"

export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBykIOPWfKmDrAC6jly4p1Hl_NsaRSntFo",
    authDomain: "my-project-223a2.firebaseapp.com",
    projectId: "my-project-223a2",
    storageBucket: "my-project-223a2.appspot.com",
    messagingSenderId: "121945247533",
    appId: "1:121945247533:web:408269d255291ea70b8da4",
    measurementId: "G-2L4CPV9S32"
}

export const ALPHABETS = "abcdefghjkmnpqrstvwxyz".split("")
export const IPFS_VIDEO_FOLDER = "https://cloudflare-ipfs.com/ipfs/QmcYwiCg8dNBWBjA6ciPVBCMBRzjTpfsWCs94PuJXhN3tu/"
export const IPFS_VIDEO_FILES = {
    ad: "FlightTicketAd.mp4",
    desktopGuide: "FlightTicketGuideDesktop.mp4",
    mobileGuide: "	FlightTicketGuideMobile.mp4"
}

export const APP_DOMAIN = "softbaker.com"
export const R2_DOMAIN = "r2.softbaker.com"
export const SITE_ID = "cargo"
export const URL_BASE = "https://softbaker.com"

export const APP_NAME = "SoftBaker"
export const APP_DESCRIPTION = "AI Image and Document Editor."
export const TITLE_SEPARATOR = " - "
export const LOGO_PATH = "/logo.png"
export interface Tool extends ToolProps {
    icon?: any,
    collectionRuleName: string,
    editables?: string | null,
    message?: string | null,
}
export const CURRENCY_SYMBOL = "$";
export const TEMP_TOOL_FORM_ID = "TEMP_TOOL_FORM_ID";
export const SERVER_FILE_FIELD_RAND_PART_PLACEHOLDER = "{{RAND_PART}}"

export const FIREBASE_FUNCTION_API_BASE_URL = "https://us-central1-my-project-223a2.cloudfunctions.net/api"

export const IMGLY_BG_REMOVAL_ASSETS_PATH = "https://r2.softbaker.com/assets/imgly-background-removal/"

export const USE_SOFTBAKER_CONFIG = {
    serverBaseUrlLive: FIREBASE_FUNCTION_API_BASE_URL,
    serverBaseUrlTest: FIREBASE_FUNCTION_API_BASE_URL,
    appName: APP_NAME,
    appDomain: APP_DOMAIN,
    bnbContractAddress: "",
    r2Domain: R2_DOMAIN,
    metadataCacheVersion: "2026-08-29-r2-cors-cache",
    refEnabled: true,
    minRefWithdrawal: 20,
    firebaseConfig: FIREBASE_CONFIG
}

export const SIGNATURES = [
    "/res/images/signatures/sign1.png?v=1",
    "/res/images/signatures/sign2.png?v=1",
    "/res/images/signatures/sign3.png?v=1",
    "/res/images/signatures/sign4.png?v=1",
    "/res/images/signatures/sign5.png?v=1",
    "/res/images/signatures/sign6.png?v=1",
    "/res/images/signatures/sign7.png?v=1",
    "/res/images/signatures/sign8.png?v=1",
    "/res/images/signatures/sign9.png?v=1"
]

export const DEFAULT_DEPOSIT_AMOUNT = 10
export const RETURN_LINK_NAME="return_to"
export const STORE_KEYS = {
    refId: "REF_ID"
}
export const TYPE_WAIT_MILLIS_BEFORE_SEARCH = 2000
export const LIMITS = {
    MIN_USER_AGE: 18,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    MIN_BIO_LENGTH: 1,
    MAX_BIO_LENGTH: 150,
    MIN_FIRSTNAME_LENGTH: 1,
    MAX_FIRSTNAME_LENGTH: 25,
    MIN_LASTNAME_LENGTH: 1,
    MAX_LASTNAME_LENGTH: 25,
    MIN_CAPTION_LENGTH: 1,
    MAX_CAPTION_LENGTH: 2200
}
export const MIN_CURRENCY_DECIMALS = 2
export const MAX_CURRENCY_DECIMALS = 2
export const DEFAULT_2_DIGITS_COUNTRY_CODE = "NG"
export const DAY_FORMAT = "YYYY-MM-DD"
export const TIME_FORMAT = "HH:mm:ss"
export const DAY_WITH_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss"

export const MAX_SERVICE_PER_USER = 15
interface CATEGORY {
    name: string,
    subcat: {[x: string]: string}
}

export const STORAGE_KEYS = {
    TOTAL_FREE_TICKETS_DOWNLOADS: "TOTAL_FREE_TICKETS_DOWNLOADS"
}
export const MAX_FREE_DOWNLOADS = 3

export const SETTINGS_MESSAGES = {
    profileAndServiceProvision: 'Complete your "profile settings" and "service provision settings" to start earning as a service provider.',
    serviceProvision: 'Complete your "service provision settings" to start earning as a service provider.',
    profileAndStore: 'Complete your "profile settings" and "store settings" to start selling your products.',
    store: 'Complete your "store settings" to start selling your products.',
    profileAndBank: 'Complete your "profile settings" and "payment settings" to enable payment withdrawal.',
    bank: 'Complete your "payment settings" to enable payment withdrawal.'
}

export const CATEGORY_PARENT_CHILD_SEPARATOR = ":"
export const ENDPOINTS = {
    getProfileSummary: `https://us-central1-meetofflinenow.cloudfunctions.net/getProfileSummary`,
    servicesCategories: `${URL_BASE}/data/service-cat-map.json`,
    productsCategories: `${URL_BASE}/data/product-cat-map.json`
    //servicesCategories: "https://firebasestorage.googleapis.com/v0/b/meetofflinenow.appspot.com/o/service-cat-map.json?alt=media&token=30325785-fe65-4cff-8442-ea94ab886f85",
    //productsCategories: "https://firebasestorage.googleapis.com/v0/b/meetofflinenow.appspot.com/o/product-cat-map.json?alt=media&token=7b985100-0d77-4c92-ad3b-6896d138e883"
}
