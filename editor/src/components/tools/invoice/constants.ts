import { CURRENCY_SYMBOL } from "@/root/src/app-config";
import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Invoice",
    noDataError: "No Invoice selected",
    newTitle: "Invoice Type",
    updateTitle: "Update Cost",
    updateMessage: `The update will cost you ${CURRENCY_SYMBOL}{PRICE}.`,
    freeTitle: "Test Invoice(Free).",
    freeMessage: "The downloaded Invoice will have watermark.",
    paidTitle: `Clean Invoice(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: "The downloaded Invoice will be clean with no watermark.",
    signInMessage: "Please sign in to save your Invoice.",
    signUpMessage: "Please sign up to save your Invoice.",
    createButtonText: "Create Invoice",
    noChatToListMessage: "Your Invoice will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved invoice?"
}