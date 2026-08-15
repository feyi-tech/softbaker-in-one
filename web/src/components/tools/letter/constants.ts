import { CURRENCY_SYMBOL } from "@/root/src/app-config";
import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Letter",
    noDataError: "No Letter selected",
    newTitle: "Letter Type",
    updateTitle: "Update Cost",
    updateMessage: `The update will cost you ${CURRENCY_SYMBOL}{PRICE}.`,
    freeTitle: "Test Letter(Free).",
    freeMessage: "The downloaded Letter will have watermark.",
    paidTitle: `Clean Letter(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: "The downloaded Letter will be clean with no watermark.",
    signInMessage: "Please sign in to save your Letter.",
    signUpMessage: "Please sign up to save your Letter.",
    createButtonText: "Create Letter",
    noChatToListMessage: "Your Letters will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved letter?"
}