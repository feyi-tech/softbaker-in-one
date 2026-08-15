
export const GALLERY_KEYS = {
    faceshot: "SOFTBAKER_FACESHOT"
}

export const gallerySave = (key: string, imageBase64: string) => {
    try {
        localStorage.setItem(key, imageBase64)

    } catch(e: any) {
        try {
            localStorage.clear()
            localStorage.setItem(key, imageBase64)
        } catch(e: any) {
        }
    }
}
export const galleryGet = (key: string) => {
    return localStorage.getItem(key)
}

export const gallerySaveFaceshot = (imageBase64: string) => {
    gallerySave(GALLERY_KEYS.faceshot, imageBase64)
}

export const galleryGetFaceshot = () => {
    return galleryGet(GALLERY_KEYS.faceshot)
}