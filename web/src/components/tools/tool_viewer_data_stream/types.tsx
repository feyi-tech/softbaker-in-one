import { FieldValue, Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms, Doc } from "../index.types";


export interface Data extends Message {
    name?: string | null;
    description?: string | null;
    icon?: string | null;
    youtube?: string | null;
    allow_freemium: boolean;
    create_price?: number | null;
    update_price?: number | null;
    templates_url?: string | null;
    isHidden?: boolean | null;
    editables?: string | null;
    message?: string | null;
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null, otherData?: Message | null) => Promise<Data>) | null
}