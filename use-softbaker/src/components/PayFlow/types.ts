import { User } from "firebase/auth"

export interface Doc {
    [x: string]: any
}
export interface Router {
    push: (url: string) => void
}
export interface DownloadTypeProps {
    toolVersionCode?: number,
    title?: string,
    removeFreemiumBeforeUpdate?: boolean,
    toolId?: string, 
    //docCollection?: string, 
    //docCollectionRuleTtlInMinutes?: number, 
    freeTitle?: string, 
    freeMessage?: string, 
    paidTitle?: string, 
    paidMessage?: string,
    updateMessage?: string,
    renewSubscription?: boolean,
    isFreemium?: boolean
}
export interface DocRules {
    allow_freemium: boolean,
    create_price: number,
    update_price: number,
    create_price_is_monthly?: boolean,
    yearly_price?: number,
    quarterly_price?: number,
    x?: string[]
}

export interface SubscriptionType {
    monthly: "monthly",
    quarterly: "quarterly",
    yearly: "yearly"
}

export const SUSCRIPTION_TYPES: SubscriptionType = {
    monthly: "monthly",
    quarterly: "quarterly",
    yearly: "yearly"
}
export interface DownloadTypeResult extends DocRules {
    is_freemium: boolean,
    is_create: boolean,
    subscription_type?: "monthly" | "quarterly" | "yearly",
    cost: number 
}
export interface Tool extends DocRules {
    id: string
    //name: string,
    isActive: boolean
    isHidden: boolean
    siteLogoUrl: string
    siteUrl: string
    desktopVideoUrl: string | null
    mobileVideoUrl: string | null

    is_static?: boolean | null

    allowFreemium?: boolean | null
    createPrice?: number | null
    description?: string | null
    icon?: string | null
    name: string
    templates_url?: string | null
    updatePrice?: number | null
    youtube?: string | null
}
export interface Vendor {
    name: string,
    number: string,
    freq: number
}
export interface SdkConfig {
    app_version_code: number,
    ttl_days: number,
    valid_till: number,
    min_deposit: number,
    min_vendor_deposit: number,
    parent_site_home: string,
    contact_link: string,
    group_link: string,
    group_links: string[],
    aff_pct: number,
    tools: Tool[],
    vendors: Vendor[]
}

export interface Coins {
    [x: string]: {
        coingecko_price_key: string,
        disabled: boolean,
        key: string,
        symbol: string,
        decimals: number,
        requiredConfirmations: number,
        priority: number,
        name: string,
        depositWarning: string,
        secondsPerBlock: number,
        logo: string,
        abiData: {
            rpcUrl: string,
            chainId: number,
            address: string,
            abi: {}[]
            [x: string]: any
        }
    }
}

export interface UseBalanceUpdateResult {
    usdBalance: number,
    balanceUpdating: boolean,
    referralEarnings: number,
    bnbPaymentAddress: string | null,
    bnbTestnetPaymentAddress: string | null,
    updatePaymentAddress: (address: string, chainCoin: string, user?: User | null) => Promise<void>,
    syncConfirmedBalance: (coinsInfo: {[x: string]: BigInt}) => void,
    transferCredit: (recipientEmail: string, amount: number, user?: User | null) => Promise<void>
}

export interface BalanceDoc {
    usd_balance: number,
    referral_earnings: number,
    bnb_payment_address: string | null,
    bnb_testnet_payment_address: string | null,
    referred_by: string | null,
    [coinXReferralEarnings: string]: any
}

export interface PriceData {
    [coinPrice: string]: number
}

export interface Balance { 
    loading: boolean,
    ethWallet: string | null | undefined, ethWalletContracted: boolean,
    bnbWallet: string | null | undefined, bnbWalletContracted: boolean,
    ethBalance: number, ethBalanceInUsd: number
    bnbBalance: number, bnbBalanceInUsd: number
    ethBalancePending: number, ethBalancePendingInUsd: number
    bnbBalancePending: number, bnbBalancePendingInUsd: number,
    balanceInUsd: number, balancePendingInUsd: number
}

export interface SaltBalanceInfo {
    salt: string,
    paddedSalt: string,
    wallet: string,
    isCreated: boolean,
    balance: BigInt,
    blockNumber: number | string
}
export interface SaltBalanceConfirmation extends SaltBalanceInfo {
    depositedAmount: BigInt,
    depositedAmountInCoin: number,
    remainingConfirmations: number,
    requiredConfirmations: number,
    coin: string,
    depositedAmountInUsd: number,
}
export interface BalanceInfo {
    hasError: boolean,
    confirmedDepositsBalance: BigInt,
    confirmedDepositsBalanceInCoin: number,
    unconfirmedDepositsBalance: BigInt,
    unconfirmedDepositsBalanceInCoin: number,
    unconfirmedDeposits: SaltBalanceConfirmation[],
    latestDeposit: SaltBalanceConfirmation | null | undefined,
    salt: string | null | undefined,
    paddedSalt: string | null | undefined,
    wallet: string | null | undefined,
    walletCreated: boolean,
    confirmedDepositsBalanceInUsd: number,
    unconfirmedDepositsBalanceInUsd: number,
}

export interface AllCoinsBalanceInfo {
    hasErrorBnbTest: boolean,
    confirmedDepositsBalanceBnbTest: BigInt,
    confirmedDepositsBalanceInCoinBnbTest: number,
    unconfirmedDepositsBalanceBnbTest: BigInt,
    unconfirmedDepositsBalanceInCoinBnbTest: number,
    unconfirmedDepositsBnbTest: SaltBalanceConfirmation[],
    latestDepositBnbTest: SaltBalanceConfirmation | null | undefined,
    saltBnbTest: string | null | undefined,
    paddedSaltBnbTest: string | null | undefined,
    walletBnbTest: string | null | undefined,
    walletCreatedBnbTest: boolean,
    confirmedDepositsBalanceInUsdBnbTest: number,
    unconfirmedDepositsBalanceInUsdBnbTest: number,

    hasErrorBnb: boolean,
    confirmedDepositsBalanceBnb: BigInt,
    confirmedDepositsBalanceInCoinBnb: number,
    unconfirmedDepositsBalanceBnb: BigInt,
    unconfirmedDepositsBalanceInCoinBnb: number,
    unconfirmedDepositsBnb: SaltBalanceConfirmation[],
    latestDepositBnb: SaltBalanceConfirmation | null | undefined,
    saltBnb: string | null | undefined,
    paddedSaltBnb: string | null | undefined,
    walletBnb: string | null | undefined,
    walletCreatedBnb: boolean,
    confirmedDepositsBalanceInUsdBnb: number,
    unconfirmedDepositsBalanceInUsdBnb: number,

    hasErrorEth: boolean,
    confirmedDepositsBalanceEth: BigInt,
    confirmedDepositsBalanceInCoinEth: number,
    unconfirmedDepositsBalanceEth: BigInt,
    unconfirmedDepositsBalanceInCoinEth: number,
    unconfirmedDepositsEth: SaltBalanceConfirmation[],
    latestDepositEth: SaltBalanceConfirmation | null | undefined,
    saltEth: string | null | undefined,
    paddedSaltEth: string | null | undefined,
    walletEth: string | null | undefined,
    walletCreatedEth: boolean,
    confirmedDepositsBalanceInUsdEth: number,
    unconfirmedDepositsBalanceInUsdEth: number,


    balanceInUsd: number, balancePendingInUsd: number
}