import { CURRENCY_SYMBOL } from "@/root/src/app-config";
import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Account",
    noDataError: "No Account selected",
    newTitle: "Bank Account Type",
    updateTitle: "Update Cost",
    updateMessage: `The update will cost you ${CURRENCY_SYMBOL}{PRICE}.`,
    freeTitle: "Test Bank Account(Free).",
    freeMessage: 'The bank account dashboard will have "fake bank account" warning.',
    paidTitle: `Clean Bank Account(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: 'The bank account will look real with no "fake bank account" warning.',
    signInMessage: "Please sign in to save your bank account.",
    signUpMessage: "Please sign up to save your bank account.",
    createButtonText: "Create Bank Account",
    noChatToListMessage: "Your bank accounts will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved bank account?"
}

export const PROFILE_PHOTO_MAX_SIZE_KB = 100
export const ALLOWED_PROFILE_PHOTO_TYPES = ["JPG", "PNG", "JPEG"]