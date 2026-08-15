import { FieldValue, Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms } from "../index.types";


export interface Data extends Message {
    trackingNumber?: string | null;
    fullname?: string | null,
    date?: string | null,
    number?: string | null,
    scene: string,
    signature?: string | null
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null) => Promise<Data>) | null
}