
import { useEffect, useState } from "react"
import { Doc, FontsMap, cleanFilename, generateFontMap, getFontFamiliesFromSVG, nullOrEmpty } from "frontbacked-svg"
import { uploadFilesToR2 } from "@/root/src/utils/cloudflare"
import { useFrontbacked } from "use-frontbacked"
import { R2_DOMAIN } from "@/root/src/app-config"



const useFonts = (svg?: string | null) => {
    const [ error, setError ] = useState<string>()
    const [ fonts, setFonts ] = useState<FontsMap>()
    const [ fontFamilies, setFontFamilies ] = useState<string[]>()
    const { user } = useFrontbacked()
    const [ loadingFonts, setLoadingFonts ] = useState<boolean>(true)

    const uploadFonts = (handlFontsUploadStatus?: (message: string, pct?: number | null) => void): Promise<FontsMap | null> => {
        return new Promise(async (resolve, reject) => {
            if(!fonts) {
                if(handlFontsUploadStatus) handlFontsUploadStatus("No fonts to upload...")
                resolve(null)

            } else {
                if(handlFontsUploadStatus) handlFontsUploadStatus("Preparing fonts for upload...")
                const uploadRquestsData = []
                for (const font of Object.values(fonts)) {
                    //If the fonthas not been uploaded before,and the font fileis present
                    if(!font.url && font.file) {
                        uploadRquestsData.push({
                            id: font.id,
                            file: font.file,
                            fileName: `${cleanFilename(font.id)}.${font.ext}`,
                            dir: "fonts"
                        })
                    }
                }

                if(uploadRquestsData.length > 0) {
                    //Upload the template fonts
                    if(!user) {
                        if(handlFontsUploadStatus) handlFontsUploadStatus("Sign In Requred...")
                        return reject(new Error("Please sign in"))
                    }
                    if(handlFontsUploadStatus) handlFontsUploadStatus("Uploading fonts...")
                    uploadFilesToR2(user, uploadRquestsData, `https://${R2_DOMAIN}/`)
                    .then(imagesUploadResults => {
                        const fontsUploaded = { ...fonts }
                        const errors: Doc = {}
                        imagesUploadResults.forEach((upload) => {
                            if(!nullOrEmpty(upload.error)) {
                                const error = new Error(upload.error)
                                fontsUploaded[upload.id].readError = error.message
                                errors[upload.id] = error.message

                            } else {
                                fontsUploaded[upload.id].url = upload.url
                            }
                        })

                        if(Object.keys(errors).length == uploadRquestsData.length) {
                            if(handlFontsUploadStatus) handlFontsUploadStatus(`Fonts upload failed with the error, "${JSON.stringify(errors)}"...`)
                            reject(new Error(`The font(s) failed to upload: ${JSON.stringify(errors)}`))

                        } else if(Object.keys(errors).length > 0) {
                            setFonts(fontsUploaded)
                            if(handlFontsUploadStatus) handlFontsUploadStatus(`Fonts upload failed with the error, "${JSON.stringify(errors)}"...`)
                            reject(new Error(`Some or all fonts failed to upload: ${JSON.stringify(errors)}`))

                        } else {
                            setFonts(fontsUploaded)
                            if(handlFontsUploadStatus) handlFontsUploadStatus("Fonts uploaded...")
                            resolve(fonts)
                        }
                    })
                    .catch(e =>{
                        if(handlFontsUploadStatus) handlFontsUploadStatus(`Fonts upload failed with the error, "${e.message}"...`)
                        reject(e)
                    })

                } else {
                    if(handlFontsUploadStatus) handlFontsUploadStatus("No font to Prepare for upload...")
                    resolve({})
                }
            }
        })
    }

    useEffect(() => {
        if(svg) {
            getFontFamiliesFromSVG(svg)
            .then(async families => {
                setFontFamilies(families)
                
            })
            .catch(e => {
                setError(e.message)
            })
        }
    }, [svg])
    
    useEffect(() => {
        if(fontFamilies) {
            generateFontMap(R2_DOMAIN, fontFamilies, ["ttf", "otf", "woff", "woff2", "eot", "svg"])
            .then(fontsMap => {
                setFonts({...fonts, ...fontsMap})
                setLoadingFonts(false)
            })
            .catch(e => {
                setError(e.message)
                setLoadingFonts(false)
            })
        }
    }, [fontFamilies])

    return {
        loadingFonts,
        error,
        fonts,
        setFonts,
        uploadFonts
    }
}

export default useFonts