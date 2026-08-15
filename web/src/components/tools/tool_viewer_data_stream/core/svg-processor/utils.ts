import { 
    FileImage, FileMap, Template, TemplateData,
    cleanFilename, isImageDataUrl, isUploadedFileUrl,
    compareBase64, fetchImageForBase64, removeUpdateQueryString, incrementUpdateQueryString,
    getImage
} from "softbaker-svg";
import { FileObject, UploadResult, getNameExt, sleep, uploadFilesToR2 } from "@/root/src/utils/cloudflare";
import { User } from "firebase/auth";
import { nullOrEmpty } from "@/root/src/utils/f";
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
    const contentType = contentTypeMatch[1];
  
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
    const results = await uploadFilesToR2(user, files, "https://r2.softbaker.com/")
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