import { PublishTexts } from "../../shipment/types";

export const publishTexts: PublishTexts = {
    newData: "New Tool",
    noDataError: "No Tool selected",
    newTitle: "Tool Type",
    updateTitle: "Update Cost",
    updateMessage: "The update will cost you {PRICE}.",
    freeTitle: "Test Tool(Free).",
    freeMessage: "The downloaded Tool will have watermark.",
    paidTitle: "Clean Tool({PRICE})",
    paidMessage: "The downloaded Tool will be clean with no watermark.",
    signInMessage: "Please sign in to save your Tool.",
    signUpMessage: "Please sign up to save your Tool.",
    createButtonText: "Create Tool",
    noChatToListMessage: "Your Tool will show here",
    deleteWarning: "Are you sure you want to permanently delete this already saved tool?"
}

export const FIELD_TYPES = ["text", "textarea", "text_select", "gen", "defgen", "checkbox", "date"]
export const NON_EDITABLE_FIELD_TYPES = ["image_select", "faceshot", "qrcode"]
export const ALL_FIELD_TYPES = [...FIELD_TYPES, ...NON_EDITABLE_FIELD_TYPES]

export const DIRECTIVES = ["@name", "@desc", "@small"]