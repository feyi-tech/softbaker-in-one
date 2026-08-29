import { 
    FileImage, FileMap, Template, TemplateData,
    cleanFilename, isImageDataUrl, isUploadedFileUrl,
    compareBase64, fetchImageForBase64, removeUpdateQueryString, incrementUpdateQueryString,
    getImage
} from "frontbacked-svg";
import { FileObject, UploadResult, getNameExt, sleep, uploadFilesToR2 } from "@/root/src/utils/cloudflare";
import { User } from "firebase/auth";
import { nullOrEmpty } from "@/root/src/utils/f";
import { R2_DOMAIN } from "@/root/src/app-config";
import { normalizeMimeType } from "@/root/src/utils/r2";
//import UPNG from "upng-js"

/**
 * Converts a Base64-encoded SVG string to a plain SVG string using modern APIs.
 *
 * @param {string} base64String - The Base64-encoded SVG string.
 * @returns {string} The decoded SVG string.
 */
export function base64ToSvg(base64String: string): string {
    // Check if the base64 string starts with the SVG data URI scheme
    const svgPrefix = 'data:image/svg+xml;base64,';
    if (base64String.startsWith(svgPrefix)) {
        base64String = base64String.slice(svgPrefix.length);
    }

    // Decode the base64 string to a byte array
    const byteCharacters = atobLegacy(base64String);

    // Convert the byte array to a typed array
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Convert the byte array to a string using TextDecoder
    const decoder = new TextDecoder('utf-8');
    const svgString = decoder.decode(byteArray);

    return svgString;
}

/**
 * Legacy atob function to convert Base64-encoded string to binary string.
 * This is used for compatibility with older browsers.
 *
 * @param {string} base64String - The Base64-encoded string.
 * @returns {string} The binary string.
 */
function atobLegacy(base64String: string): string {
    if (typeof Buffer !== 'undefined') {
        // Node.js environment
        return Buffer.from(base64String, 'base64').toString('binary');
    } else if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        // Browser environment
        return window.atob(base64String);
    } else {
        throw new Error('Base64 decoding not supported in this environment');
    }
}

/**
* Generates a random alphanumeric string of the specified length.
*
* @param {number} length - The desired length of the generated string.
* @returns {string} A random alphanumeric string of the specified length.
*/

export function expandImagesMap(
    imagesMap: FileMap,
    onFile: (id: string, image: string) => Promise<FileMap | null>
  ): Promise<FileMap> {
    return new Promise(async (resolve, reject) => {
        try {
            const expandedMap: FileMap = { ...imagesMap }; // Start with a copy of the original map
  
            for (const [id, image] of Object.entries(imagesMap)) {
                if (image && isImageDataUrl(image)) {
                    const newFiles = await onFile(id, image);
                    if (newFiles) {
                        Object.assign(expandedMap, newFiles);
                    }
                }
            }
        
            resolve(expandedMap)
        } catch(e) {
            reject(e)
        }
    })
}


export function base64ToFile(id: string, dataUrl: string): FileImage {
  
    // Split the base64 string into content type and actual base64 content
    const [contentTypeInfo, base64Data] = dataUrl.split(',');
    const contentTypeMatch = contentTypeInfo.match(/data:(.*?);base64/);
    if (!contentTypeMatch) {
      throw new Error('Invalid base64 data format');
    }
    const contentType = normalizeMimeType(contentTypeMatch[1]);
  
    // Decode base64 string to binary data
    const binaryString = atob(base64Data);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
  
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
  
    // Convert binary data to Blob
    const blob = new Blob([uint8Array], { type: contentType });
  
    // Create File object from Blob
    const fileName = `${cleanFilename(id)}.${contentType.split('/')[1]}`;
    const file = new File([blob], fileName, { type: contentType });
  
    return { id, image: file };
}

/**
 * Converts a JSON object into a File object.
 * 
 * @param jsonObject - The JSON object to convert.
 * @param fileName - The desired name for the File. Defaults to 'data.json'.
 * @returns The File object containing the JSON data.
 */
function jsonToFile(jsonObject: object, fileName: string = 'data.json'): File {
    // Convert JSON object to string
    const jsonString: string = JSON.stringify(jsonObject, null, 2);
  
    // Create a Blob with the JSON string
    const blob: Blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a File from the Blob
    const file: File = new File([blob], fileName, { type: 'application/json' });
  
    return file;
}

/**
 * Updates the query string in a URL, adding or incrementing the 'updates' parameter.
 * @param {string} url - The URL to update.
 * @returns {string} - The updated URL.
 */
function isTheSameUrl(url?: string, url2?: string): boolean {
    if(!url || !url2) return false
    return isUploadedFileUrl(url) && removeUpdateQueryString(url).toLowerCase() === removeUpdateQueryString(url2).toLowerCase()
}

export const uploadWithRetry = async (
    user: User, 
    files: FileObject[], 
    uploadedResults: UploadResult[], retryOnce: boolean,
    onStatus?: (message: string, id?: string, isUploadError?: boolean) => void
): Promise<UploadResult[]> => {
    const results = await uploadFilesToR2(user, files, `https://${R2_DOMAIN}/`)
    const uploadedR = [...uploadedResults]
    const uploadedIdList: string[] = []
    const failedResults: UploadResult[] = []
    const failedList: FileObject[] = []
    results.forEach((upload) => {
        if(!nullOrEmpty(upload.error)) {
            if(onStatus) onStatus(`Failed to upload file with error, ${upload.error || ""}. Would be retried later.`, upload.id, true)
            failedResults.push(upload)

        } else {
            uploadedR.push(upload)
            uploadedIdList.push(upload.id)
        }
    })

    files.forEach((file) => {
        if(!uploadedIdList.includes(file.id)) {
            failedList.push(file)
        }
    })

    if(failedList.length > 0) {
        if(retryOnce) {
            if(onStatus) onStatus(`Failed files upload retry stopped for ${failedList.length} files.`)
            return [...uploadedR, ...failedResults];
        }

        if(onStatus) onStatus(`Sleeping for 5 seconds to retry ${failedList.length} failed file uploads. Make sure you're connected to the internet....`)
        await sleep(5000)
        if(onStatus) onStatus(`Resuming program to retry the ${failedList.length} failed file uploads. Make sure you're connected to the internet...`)
        return uploadWithRetry(user, failedList, uploadedR, failedList.length == files.length, onStatus)

    } else {
        return uploadedR
    }
}

export const uploadTemplates = (
    user: User, 
    toolId: string, 
    templates: {[x: string]: Template}, 
    template: Template, 
    templateData: TemplateData, 
    oldTemplate?: Template | null, 
    oldTemplateData?: TemplateData | null,
    oldTemplatesUrl?: string | null,
    onTemplateUpdate?: (template: Template, templateData: TemplateData) => void,
    onSetProgressStatus?: (message: string, pct?: number | null) => void
): Promise<string | null> => {

    console.log(
        "uploadTemplates: ", 
        "toolId", toolId, "templates", templates, "template", template, 
        "templateData", templateData, "oldTemplate", oldTemplate, 
        "oldTemplateData", oldTemplateData, "oldTemplatesUrl", oldTemplatesUrl
    )
    
    const updateStatus = (message: string, pct?: number | null) => {
        if(onSetProgressStatus) {
            onSetProgressStatus(message, pct)
        }
    }

    const onStatusUpdate = (message: string) => {
        updateStatus(message, 0)
    }

    return new Promise(async (resolve, reject) => {
        try {
            //return reject(new Error("testing"))
            updateStatus("Template assets upload started...")
            //console.log("uploadTemplates: ", templateData)
            //const link = "https://r2.softbaker.com/templates/templates-tbf0c35e-holg6j4q-logo.png?updates=5"
            //const link = "https://r2.softbaker.com/templates/templates-tbf0c35e-holg6j4q-logo.png?updates=4"
            //const fetchedOldImageBase64 = await fetchImageForBase64(link, true);
            //console.log("parsedSvg:LINK.base64 ", fetchedOldImageBase64? fetchedOldImageBase64.substring(0, 32) : "NULL")
            //console.log("parsedSvg:LINK ", link)

            //return resolve(null)

            const errors: string[] = []
            if(!template.id) errors.push(`ID is missing in the template`)
            if(!template.name) errors.push(`Please provide the template's name`)
            if(!template.logo) errors.push(`Please provide the template's logo`)
            
            //reject errors if exist
            if(errors.length > 0) return reject(new Error(errors.join("\n")))
            
            const templateId = template.id
            
            // Check if old logo is a URL and new logo is base64
            if (oldTemplate?.logo && isUploadedFileUrl(oldTemplate.logo) && isImageDataUrl(template.logo)) {
                const link = oldTemplate.logo//"https://r2.softbaker.com/templates/templates-tbf0c35e-holg6j4q-logo.png?updates=7"//oldTemplate.logo
                const fetchedOldImageBase64 = await fetchImageForBase64(R2_DOMAIN, link, true);

                //If the image at the old image's url is the same as the new image, that is no change
                if (fetchedOldImageBase64 && compareBase64(fetchedOldImageBase64, template.logo)) {
                    //Replace the new image's base64 url with the old image's http url to 
                    // prevent unneccessary reupload of the image
                    template.logo = oldTemplate.logo;
                }
            }

            //return resolve(null)

            updateStatus("Stacking template images and logo to upload...")
            //const images = base64ImagesToFiles(templateData.images)
            const images: FileObject[] = []
            for (const [ key, value ] of Object.entries(templateData.images)) {
                if(isImageDataUrl(value)) {
                    const { image } = base64ToFile(key, value)
                    images.push({
                        id: key, 
                        file: image,
                        fileName: `templates-${toolId}-${ templateId }-${cleanFilename(key)}-image.${getNameExt(image.name).ext}`,
                        dir: "templates",
                    })
                }
            }
            

            const logoId = `templates-${toolId}-${ templateId }-logo`
            if(isImageDataUrl(template.logo)) {
                const logo = base64ToFile(logoId, template.logo)
                images.push({
                    id: logoId, 
                    file: logo.image,
                    fileName: `${logoId}.${getNameExt(logo.image.name).ext}`,
                    dir: "templates",
                })
            }
        
            updateStatus("Uploading template images and logo...")
            //Upload the template data images and the template logo
            const imagesUploadResults = await uploadWithRetry(user, images, [], false, onStatusUpdate)
            //const imagesUploadResults = await uploadFilesToR2(user, images, "https://r2.softbaker.com/");

            //console.log("parsedSvg:imagesUploadResults", imagesUploadResults, images)

            const uploadedImagesMap: FileMap = { }//Check when determining changes
            var uploadedLogo = null//Check when determining changes
            var error = null
            updateStatus("Linking template images IDs and logo to the uploaded images...")
            imagesUploadResults.forEach((upload) => {
                if(!nullOrEmpty(upload.error)) {
                    error = new Error(upload.error)
                    updateStatus(`The image, "${upload.id}" failed to upload. Please make sure you're connected to the internet.`)

                } else if(upload.id != logoId) {
                    uploadedImagesMap[upload.id] = upload.url

                } else {
                    uploadedLogo = upload.url
                }
            })
            
            //Check the uploaded images and increment the upload counts
            for(const [id, url] of Object.entries(uploadedImagesMap)) {
                //If there's a version of the image already uploaded previously
                if(oldTemplateData && getImage(id, oldTemplateData.images) && isTheSameUrl(getImage(id, oldTemplateData.images), url)) {
                    //Just increase the image url update query string so browser could avoid the cached old version, and 
                    // instead hit the server for the latest version
                    templateData.images[id] = incrementUpdateQueryString(getImage(id, oldTemplateData.images))

                } else {
                    templateData.images[id] = url
                }
            }
            
            if(uploadedLogo) {
                //If there's a version of the image already uploaded previously
                if(oldTemplate?.logo && isTheSameUrl(oldTemplate.logo, uploadedLogo)) {
                    //Just increase the image url update query string so browser could avoid the cached old version, and 
                    // instead hit the server for the latest version
                    template.logo = incrementUpdateQueryString(oldTemplate.logo)

                } else {
                    template.logo = uploadedLogo
                }
            }

            if(onTemplateUpdate) onTemplateUpdate(template, templateData)
            if(error) {
                return reject(error)
            }
           
            var uploadedData: UploadResult[] | null = null

            updateStatus("Checking if any changes need to be written to the template data file...")
            //Check if anything has changed in the template data to warrant upload
            if(
                templateData.svg != oldTemplateData?.svg || 
                JSON.stringify(templateData.fields || {}) != JSON.stringify(oldTemplateData?.fields || {}) || 
                JSON.stringify(templateData.images || {}) != JSON.stringify(oldTemplateData?.images || {}) || 
                JSON.stringify(templateData.masks || {}) != JSON.stringify(oldTemplateData?.masks || {}) || 
                JSON.stringify(templateData.cssActions || {}) != JSON.stringify(oldTemplateData?.cssActions || {})
            ) {
                updateStatus("Uploading the template data file with the changes made...")
                const dataFile = jsonToFile(templateData)
                const dataId = `templates-${toolId}-${ templateId }-data`
                uploadedData = await uploadWithRetry(user, [
                    {
                        id: dataId,
                        file: dataFile,
                        fileName: `${dataId}.${getNameExt(dataFile.name).ext}`,
                        dir: "templates",
                    }
                ], [], false, onStatusUpdate);

                //console.log("parsedSvg:uploadedData", uploadedData)

                if(!nullOrEmpty(uploadedData[0].error)) {
                    return reject(new Error(uploadedData[0].error))
                }
            }

            var uploadedTemplates: UploadResult[] | null = null
            //Check if the template or its data was updated
            if(
                template.name !== oldTemplate?.name || 
                template.logo !== oldTemplate?.logo || 
                template.is_default !== oldTemplate?.is_default ||  
                template.split_on_download !== oldTemplate?.split_on_download || 
                template.split_on_download_hr !== oldTemplate?.split_on_download_hr || 
                uploadedData
            ) {
                //Update the template data url if the template data was uploaded/updated
                if(uploadedData) {
                    //If there's a version of the template data already uploaded previously
                    if(oldTemplate?.data_url && isTheSameUrl(oldTemplate.data_url, uploadedData[0].url)) {
                        //Just increase the template data url update query string so browser could avoid the cached old version, 
                        // and instead hit the server for the latest version
                        template.data_url = incrementUpdateQueryString(oldTemplate.data_url)

                    } else {
                        template.data_url = uploadedData[0].url
                    }
                    if(onTemplateUpdate) onTemplateUpdate(template, templateData)
                }

                updateStatus("Updating the the tool's template list data file with the new template's data...")
                //Upload the templates versions
                const templatesFile = jsonToFile({...templates, [templateId]: template})
                const templatesFileId = `templates-${toolId}`

                uploadedTemplates = await uploadWithRetry(user, [
                    {
                        id: templatesFileId,
                        file: templatesFile,
                        fileName: `${templatesFileId}.${getNameExt(templatesFile.name).ext}`,
                        dir: "templates",
                    }
                ], [], false, onStatusUpdate);

                //console.log("parsedSvg:uploadedTemplates", uploadedTemplates[0].url, uploadedTemplates)

                if(!nullOrEmpty(uploadedTemplates[0].error)) {
                    return reject(new Error(uploadedTemplates[0].error))
                }
            }

            var templatesUrl = uploadedTemplates? uploadedTemplates[0].url : null
            //If there's a version of the template data already uploaded previously
            if(oldTemplatesUrl && templatesUrl && isTheSameUrl(oldTemplatesUrl, templatesUrl)) {
                //Just increase the template url update query string so browser could avoid the cached old version, 
                // and instead hit the server for the latest version
                templatesUrl = incrementUpdateQueryString(oldTemplatesUrl)
                updateStatus("Template updated with no error ✔✔")
                resolve(templatesUrl)

            } else if(!oldTemplatesUrl) {
                updateStatus("Template created with no error ✔✔")
                resolve(templatesUrl)

            } else {
                updateStatus("No changes found in the template.")
                resolve(null)
            }

        } catch(e) {
            reject(e)
        }

    })
}
