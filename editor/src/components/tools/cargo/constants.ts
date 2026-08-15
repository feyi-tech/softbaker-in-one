import { CURRENCY_SYMBOL } from "@/root/src/app-config";
import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Shipment",
    noDataError: "No Shipment selected",
    newTitle: "Shipment Type",
    updateTitle: "Update Cost",
    updateMessage: `The update will cost you ${CURRENCY_SYMBOL}{PRICE}.`,
    freeTitle: "Test Shipment(Free).",
    freeMessage: "The downloaded shipping invoice will have watermark. The shipping tracking website page will also have watermark.",
    paidTitle: `Clean Shipment(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: "The downloaded shipping invoice will be clean with no watermark. The shipping tracking website page will also be clean with no watermark.",
    signInMessage: "Please sign in to save your shipment.",
    signUpMessage: "Please sign up to save your shipment.",
    createButtonText: "Create Invoice",
    noChatToListMessage: "Your invoices will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved shipment?"
}