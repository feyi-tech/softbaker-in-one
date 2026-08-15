import { FieldValue, Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms } from "../index.types";


export interface Data extends Message {
    companyName?: string | null;
    title?: string | null,
    senderInfo?: string | null,
    recipientInfo?: string | null,
    body?: string | null,
    logo?: string | null,
    waterMarkWithLogo: boolean,
    grayScaleWaterMark: boolean,
    stampApprove: boolean,
    stampLogo: boolean,
    hasPaperTexture: boolean,
    signatoryNames?: string[] | null,
    signatoryTitles?: string[] | null,
    signatures?: string[] | null,
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null) => Promise<Data>) | null
}