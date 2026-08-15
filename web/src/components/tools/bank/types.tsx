import { Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms, ServerFileField } from "../index.types";

export interface TxDetails {
    type: "local" | "wire",
    name: string,
    bankName: string,
    swiftBIC?: string | null,
    accountNumber: number,
    rNumber?: string | null,
    accountNumber1?: string | null,
    amount: number,
    memo?: string | null,
    skipTxCheck?: boolean,
    completeStatus: "Successful" | "Failed",
    processingDuration: "immediately" | string
}

export interface Data extends Message {
    profilePhoto?: ServerFileField | string | null,
    fullname?: string | null,
    email?: string | null,
    phone?: string | null,
    accountType?: string | null,
    gender?: string | null,
    maritalStatus?: string | null,
    dob?: string | null,
    accountNumber_username?: number | null,// 9909273601
    occupation?: string | null,// KNK INTERIORDECOR AND BUSINESS
    address?: string | null,// 365 w grand view ave, sierra Madre, CA 91024
    password?: string | null,
    pin?: number | null,
    currencySymbol?: string | null
    accountBalance?: number | null,
    disableAccount?: boolean | null,
    autoRenewSubscription?: boolean | null,
    subscription_expiry_date?: Timestamp | null,//Server privided field
    renewSubscription?: boolean | null//Server action trigger field
    totalCredits?: number | null | undefined,
    totalDebits?: number | null | undefined
    credits?: string[] | null | undefined
    debits?: string[] | null | undefined,
    disableAccountError?: string | null,
    noTxGeneration?: boolean | null,
    txProcessingDuration?: string | null,
    isInActive?: boolean | null,
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null) => Promise<Data>) | null
}