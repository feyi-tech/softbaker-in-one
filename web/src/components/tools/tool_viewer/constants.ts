import { CURRENCY_SYMBOL } from "@/root/src/app-config";
import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Tool",
    noDataError: "No Tool selected",
    newTitle: "Tool Type",
    updateTitle: "Update Cost",
    updateMessage: `The update will cost you ${CURRENCY_SYMBOL}{PRICE}.`,
    freeTitle: "Test Tool(Free).",
    freeMessage: "The downloaded Tool will have watermark.",
    paidTitle: `Clean Tool(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: "The downloaded Tool will be clean with no watermark.",
    signInMessage: "Please sign in to save your Tool.",
    signUpMessage: "Please sign up to save your Tool.",
    createButtonText: "Create Tool",
    noChatToListMessage: "Your Tool will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved tool?",
    saveSuccess: "New Tool successfully saved.",
    updateSuccess: "Tool successfully updated."
}