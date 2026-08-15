import { Tool } from "../../app-config"
import { PublishTexts } from "../shipment/types"
import { Message } from "../shipview/types"

export interface Doc {
    [x: string]: any
}

export interface AllForms {
    tool?: Tool | null,
    initData?: (defaultData?: Doc) => Promise<Message>,
    collectionName: string,
    isNew: boolean,
    setSaving: (isSaving: boolean) => void,
    saving?: boolean,
    hasPendingSave?: boolean,
    publishTexts?: PublishTexts
}

export interface UserImage {
    base64Url?: string,
    width: number, height: number
}
export interface Dimension {
    width: number, height: number
}
export interface Signatory {
    base64Url?: string | null,
    name?: string | null,
    title?: string | null
}
export interface InputRule {
    title: string,
    required: boolean,
    minSize: number,
    maxSize: number
}
export interface ServerFileField {
    file: File,
    base64Url: string,
    pathFormatNoExt: string
}