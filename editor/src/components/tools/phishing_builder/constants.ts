import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Account",
    noDataError: "No Account selected",
    newTitle: "Phishing Website Type",
    updateTitle: "Update Cost",
    updateMessage: "The update will cost you {PRICE}.",
    freeTitle: "Test Phishing Website(Free).",
    freeMessage: 'The phishing website dashboard will have "fake phishing website" warning.',
    paidTitle: "Clean Phishing Website({PRICE})",
    paidMessage: 'The phishing website will look real with no "fake phishing website" warning.',
    signInMessage: "Please sign in to save your phishing website.",
    signUpMessage: "Please sign up to save your phishing website.",
    createButtonText: "Create Phishing Website",
    noChatToListMessage: "Your phishing websites will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved phishing website?"
}

export const PROFILE_PHOTO_MAX_SIZE_KB = 100
export const ALLOWED_PROFILE_PHOTO_TYPES = ["JPG", "PNG", "JPEG"]