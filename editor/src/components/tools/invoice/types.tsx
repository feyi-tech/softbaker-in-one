import { FieldValue, Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms, Doc } from "../index.types";

export interface InvoiceItem extends Doc {
    description: string,
    quantity: number,
    price: number
}

export interface Data extends Message {
    companyName?: string | null;
    title?: string | null,
    companyAddress?: string | null,
    customerName?: string | null,
    customerAddress?: string | null,
    invoiceNumber?: string | null,
    date: Date | Timestamp,
    paymentDetails?: string | null,
    currency?: string | null,
    vat?: number | null,
    items?: InvoiceItem[] | null,
    logo?: string | null,
    waterMarkWithLogo: boolean,
    grayScaleWaterMark: boolean,
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null) => Promise<Data>) | null
}