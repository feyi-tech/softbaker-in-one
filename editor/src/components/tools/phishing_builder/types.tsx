import { Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms, ServerFileField } from "../index.types";

export interface TxDetails {
    type: "local" | "wire",
    name: string,
    bankName: string,
    swiftBIC?: string | null,
    accountNumber: number,
    amount: number,
    memo?: string | null
}

export interface Data extends Message {
    websiteLink?: string | null,
    websiteTitle?: string | null,
    websiteDescription?: string | null,
    queryId?: string | null,
    autoRenewSubscription?: boolean | null,
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null) => Promise<Data>) | null
}