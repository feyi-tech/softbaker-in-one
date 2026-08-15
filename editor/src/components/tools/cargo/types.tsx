import { Timestamp } from "firebase/firestore";
import { Message } from "../../shipview/types";
import { AllForms } from "../index.types";

export interface SHIPMENT_STATUS {
    processing: 'processing',
    inTransit: 'inTransit',
    delivered: 'delivered',
    errorMessage: 'errorMessage'
}
export interface SHIPMENT_STATUS_NAME {
    processing: 'Processing',
    inTransit: 'In transit',
    delivered: 'Delivered',
    errorMessage: 'Error Message'
}

export const SHIPMENT_STATUS: SHIPMENT_STATUS = {
    processing: 'processing',
    inTransit: 'inTransit',
    delivered: 'delivered',
    errorMessage: 'errorMessage'
}

export const SHIPMENT_STATUS_NAME = {
    processing: 'Processing',
    inTransit: 'In transit',
    delivered: 'Delivered',
    errorMessage: 'Error Message'
}

export interface Data extends Message {
    trackingNumber?: string | null;
    shippingStatus?: 'processing' | 'inTransit' | 'delivered' | 'errorMessage'
    errorMessage?: string | null;
    shipmentDate?: Date | Timestamp,
    expectedArrivalDate?: Date | Timestamp,

    senderName?: string | null,
    senderEmail?: string | null,

    packageRecipientName?: string | null,
    packageDestinationEmail?: string | null,
    packageDestinationPhone?: string | null,
    packageDestinationAddress?: string | null,
    packageContent?: string | null,
    packageWeight?: string | null,

    invoiceNumber?: string | null,
    shipmentFee?: string | null,
    costCurrency?: string | null
}
export interface FormType extends AllForms {
    data?: Data | null,
    onUpdateData?: ((data: Data) => void) | null,
    onPublishData?: ((isSubscriptionRenewal?: boolean | null, serverOnlySaveData?: Message | null) => Promise<Data>) | null
}