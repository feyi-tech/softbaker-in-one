
export interface ImageInputStrategy {
    maxFileSize?: number | null,
    galleryKey?: string,
    onClose: () => void;
    onImage: (file?: File | null, base64Image?: string | null, thumbnail?: string | null, error?: Error | null) => void;
    minSignatureWidth?: number | null, 
    maxSignatureWidth?: number | null
}

export interface SignatureDrawerInput {
    minSignatureWidth?: number | null, 
    maxSignatureWidth?: number | null
}

export interface UploadStrategy extends ImageInputStrategy {
    title: string,
    message: string,
    hoverMessage: string,
    ruleMessage: string,
    useImageText: string,
    isOtherFiles?: boolean | null,
    accept?: string | null,
    onThumb?: (file?: File, base64Image?: string | null) => Promise<string | null>,
}

export interface Dimension {
    width: number,
    height: number
}

export interface ImageCropArg {
    message?: string | null,
    sampleImage?: string | null
}