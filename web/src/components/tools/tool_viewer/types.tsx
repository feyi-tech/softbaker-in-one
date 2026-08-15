import { FieldValue, Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms, Doc } from "../index.types";
import { FieldsData, TemplatesResults } from "softbaker-svg";

export interface FormType extends AllForms {
    templatesResults?: TemplatesResults | null,
    data?: FieldsData | null,
    onUpdateData?: ((data: FieldsData) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null, otherData?: Message | null) => Promise<FieldsData>) | null
}