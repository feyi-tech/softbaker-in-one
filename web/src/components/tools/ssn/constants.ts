import { CURRENCY_SYMBOL } from "@/root/src/app-config";
import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New SSN card",
    noDataError: "No SSN card selected",
    newTitle: "SSN Type",
    updateTitle: "Update Cost",
    updateMessage: `The update will cost you ${CURRENCY_SYMBOL}{PRICE}.`,
    freeTitle: "Test SSN card(Free).",
    freeMessage: "The downloaded SSN card will have watermark.",
    paidTitle: `Clean SSN card(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: "The downloaded SSN card will be clean with no watermark.",
    signInMessage: "Please sign in to save your SSN card.",
    signUpMessage: "Please sign up to save your SSN card.",
    createButtonText: "Create SSN",
    noChatToListMessage: "Your SSN cards will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved SSN card?"
}