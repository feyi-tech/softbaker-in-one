
import { Doc, Field, Fields, FieldsData, FileMap, MapWithName, MaskMap, TemplateData } from "./types.ts";
import { mergeImages, removeUpdateQueryString } from "./images-processor.ts";
import { textGenCodeParser } from "./textGenCodeParser.ts";
import { getCanvas } from "./imageHelper.ts";
import { normalizeMimeType } from "./mime.ts";

const isNode = typeof window === 'undefined';

export const isVoid = (value: any) => {
    return value === undefined || value === null
}
export const nullOrEmpty = (value: any) => {
    return isVoid(value) || value.length == 0
}

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
export function genId(length: number): string {
   const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
   let result = '';

   for (let i = 0; i < length; i++) {
       const randomIndex = Math.floor(Math.random() * characters.length);
       result += characters.charAt(randomIndex);
   }

   return result;
}

/**
 * Converts a Base64 string to a File (Browser) or Buffer (Node.js).
 * @param base64String - The Base64 encoded string.
 * @param fileName - The name of the output file.
 * @returns File (Browser) or Buffer (Node.js)
 */
export function base64ToFile(id: string, base64String: string): File | Buffer {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid Base64 string: ' + base64String? base64String.substring(0, base64String.length > 10? 9 : base64String.length - 1) : "NO base64String");
    }

    const mimeType = normalizeMimeType(matches[1]); // Extract MIME type
    const buffer = Buffer.from(matches[2], 'base64');

    if (typeof window !== 'undefined') {
        // Browser: Create a File object
        // Create File object from Blob
        const fileName = `${cleanFilename(id)}.${mimeType.split('/')[1]}`;
        return new File([buffer], fileName, { type: mimeType });
    } else {
        // Node.js: Return Buffer
        return buffer;
    }
}

/**
 * Converts an array of objects to a map using a specified attribute as the key.
 *
 * @param {Array<Object>} arr - The array of objects to be converted.
 * @param {string} attr - The attribute to use as the key for the mapping.
 * @returns {Object} - An object mapping each unique attribute value to its corresponding item.
 */
export function arrayToMap(attr: string, arr: {[x: string]: any}[], keyParser?: (key: string) => string): {[x: string]: {[x: string]: any}} {
    return arr.reduce((map, item) => {
      var key = item[attr];
      if(keyParser) key = keyParser(key)
      if (key !== undefined) {
        map[key] = item;
      }
      return map;
    }, {});
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

// Function to order an object with Field values
export function orderOptions(obj: { [x: string]: Field }): { [x: string]: Field } {
    // Convert object to an array of [key, value] pairs
    const entries = Object.entries(obj);

    // Sort the entries array based on the 'index' property of the values
    entries.sort(([, a], [, b]) => {
        const indexAStr = (a.index || "").toString();
        const indexBStr = (b.index || "").toString();
        return indexAStr.localeCompare(indexBStr);
    });

    // Convert the sorted entries back to an object
    const sortedObj: { [x: string]: Field } = {};
    for (const [key, value] of entries) {
        sortedObj[key] = value;
    }

    return sortedObj;
}

export const orderByName = (dataMap: MapWithName): MapWithName => {
    // Convert the map into an array of key-value pairs
    const entries = Object.entries(dataMap);
  
    // Sort the array by the `name` attribute of the values
    entries.sort((a, b) => {
      const nameA = a[1].name.toUpperCase(); // Ignore case while sorting
      const nameB = b[1].name.toUpperCase(); // Ignore case while sorting
  
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0; // Names must be equal
    });
  
    // Convert the sorted array back into an object
    const sortedDataMap: MapWithName = {};
    entries.forEach(([key, value]) => {
      sortedDataMap[key] = value;
    });
  
    return sortedDataMap;
}

/**
 * Updates the query string in a URL, adding or incrementing the 'updates' parameter.
 * @param {string} url - The URL to update.
 * @returns {string} - The updated URL.
 */
export function isTheSameUrl(url?: string, url2?: string): boolean {
    if(!url || !url2) return false
    return isUploadedFileUrl(url) && removeUpdateQueryString(url).toLowerCase() === removeUpdateQueryString(url2).toLowerCase()
}

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

export const mergeTemplateData = (storageHost: string, newTemplateData: TemplateData, oldTemplateData?: TemplateData | null): Promise<TemplateData> => {
    return new Promise(async (resolve, reject) => {
        //If this is not an update to an existing template. Such as in a new template upload.
        if(!oldTemplateData) return resolve(newTemplateData)

        const data: TemplateData = { } as TemplateData
        data.svg = newTemplateData.svg

        const errors: string[] = []

        //Checking for fields merge errors
        for(const [id, field] of Object.entries(oldTemplateData.fields)) {
            const newField = newTemplateData.fields[id]
            //Error when a field is missing in the new template
            if(!newField) {
                errors.push(`The ${field.type.split("_").join(" ")} field, "${field.name}" is missing in the new template.`)

            } //Error when a field type has changed in the new template
            else if(newField.type != field.type) {
                errors.push(`The ${field.type.split("_").join(" ")} field, "${field.name}" is misrepresented as "${newField.type.split("_").join(" ")}" in the new template.`)

            } //Error when a field is a select field, but it's missing options in the new template
            else if(field.options && !newField?.options) {
                errors.push(`The ${field.type.split("_").join(" ")} field, "${field.name}" is missing options in the new template.`)

            } //Validating each option in the new template
            else if(field.options && newField.options) {
                for(const option of Object.values(field.options)) {
                    //Error when an option is missing in the new template
                    if(!newField.options[option.id]) {
                        errors.push(`The ${field.type.split("_").join(" ")} ${field.name} option, "${option.name}" is missing in the new template.`)
        
                    } //Error when a option type has changed in the new template
                    else if(newField.options[option.id].type != option.type) {
                        errors.push(`The ${field.type.split("_").join(" ")} ${field.name} option, "${option.name}" is misrepresented as "${newField.options[option.id].type.split("_").join(" ")}" in the new template.`)
        
                    }
                }
                
            }
        }

        //Checking for images merge errors
        if(Object.keys(oldTemplateData.images || {}).length > 0 && Object.keys(newTemplateData.images || {}).length == 0) {
            errors.push(`Images are missing in missing in the new template.`)

        } else if(Object.keys(oldTemplateData.images || {}).length > 0) {
            for(const id of Object.keys(oldTemplateData.images)) {
                //Error when a an image is missing in the new template, and the is of the missing image is not a select option,
                //since a new image might have been added from the user interface without its existence in the svg
                if(!newTemplateData.images[id] && !id.includes(".select")) {
                    errors.push(`The image with the id, ${id} is missing in the new template.`)
                }
            }

        }

        //merge the fields
        data.fields = { ...oldTemplateData.fields, ...newTemplateData.fields }
        //Iterate the merged fields to order each select fields' options by name
        for(const [id, field] of Object.entries(data.fields)) {
            if(field.options) {
                data.fields[id].options = orderOptions(field.options)
            }
        }

        //merge the images
        data.images = await mergeImages(storageHost, oldTemplateData.images, { ...oldTemplateData.images, ...newTemplateData.images })


        if(errors.length > 0) {
            return reject(new Error(errors.join("\n")))
        }
        
        resolve(data)
    })
}

export const isUploadedFileUrl = ( url: string ) => {
    return url.startsWith("http")
}

export const isImageDataUrl = ( url: string ) => {
    return url.startsWith("data:image") || url.startsWith("data:img")
}

export const getImage = (id: string, images: FileMap, suffix?: string | null) => {
    //suffix examples "_thumbnail", "_728", "_512"
    //console.log("parsedSvg.geImage: ", id, images, suffix)
    if(!id) return ""
    var image = images[id]
    
    if(id.includes(".")) {
        //console.log("parsedSvg.randImages:1", id, suffix, image)
    }
    //If the image value is a reference to another image
    if(image && !isUploadedFileUrl(image) && !isImageDataUrl(image)) {
        //set the image as the value of the referenced image
        image = images[`${images[id]}${suffix || ""}`]
        if(id.includes(".")) {
            //console.log("parsedSvg.randImages:2", id, suffix, image)
        }

    } else if(image) {
        image = images[`${id}${suffix || ""}`]
        if(id.includes(".")) {
            //console.log("parsedSvg.randImages:3", id, suffix, `${id}${suffix || ""}`, !image? "--" : image.substring(0, 10))
        }
    }

    //set the image as the fallback image if the specified resolution does not exist
    if(!image && suffix) {
        const idDeviceNumberSplit = id.split("_")
        const idNumber = idDeviceNumberSplit[idDeviceNumberSplit.length - 1]
        //Only fallback if the id is not a reference to a resolution
        //This is done by checking the number at the end of the id
        //If there's no number, then the id is not a resolution image
        //It it is, it might be the id of a duplicated image. where the number stands for 
        // the duplication number instead of the resolution size
        if(isNaN(Number(idNumber.trim())) || Number(idNumber.trim()) < 512) image = images[id]
    }
    if(id.includes(".")) {
        //console.log("parsedSvg.randImages:4", id, suffix, image)
    }

    return image
}

export const getImageMask = (id: string, masks?: MaskMap | null) => {
    if(!masks) return null
    //suffix examples "_thumbnail", "_728", "_512"
    var mask = masks[id]
    //If the image value is a reference to another image mask
    if(mask && typeof mask === "string") {
        //set the image as the value of the referenced image mask
        mask = masks[mask]
    }

    return mask
}

export function cleanFilename(text: string) {
    // Remove or replace characters not safe for filenames
    return text
      .trim()                                  // Remove whitespace from the beginning and end
      .replace(/[/\\?%*:|"<>]/g, '')           // Remove invalid characters for filenames
      .replace(/\s+/g, '-');                   // Replace spaces (or whitespace) with underscores
}

/**
* Converts a map of base64 images, converting PNG images to JPG format.
*
* @param {Map<string, string>} base64Map - A map where the key is a string and the value is a base64 image.
* @returns {Promise<Map<string, string>>} - A new map with PNG images converted to JPG.
*/
export async function convertPngBase64ImagesToJpeg(base64Map: {[x: string]: string}): Promise<{[x: string]: string}> {
   const updatedMap: {[x: string]: string} = {};

   for (const [key, base64Image] of Object.entries(base64Map)) {
       if (base64Image.startsWith("data:image/png") || base64Image.startsWith("data:img/png")) {
            const jpgBase64 = await convertPngToJpg(base64Image);
            updatedMap[key] = jpgBase64;
       } else {
            updatedMap[key] = base64Image;
       }
   }

   return updatedMap;
}

export async function convertPngBase64ImagesWithUPNG(base64Map: {[x: string]: string}): Promise<{[x: string]: string}> {
    const updatedMap: {[x: string]: string} = {};
 
    for (const [key, base64Image] of Object.entries(base64Map)) {
        if (base64Image.startsWith("data:image/png") || base64Image.startsWith("data:img/png")) {
             const jpgBase64 = await convertPngWithUPNG(base64Image);
             updatedMap[key] = jpgBase64;
        } else {
             updatedMap[key] = base64Image;
        }
    }
 
    return updatedMap;
}

/**
 * Converts a base64 PNG image to a base64 JPG image.
 *
 * @param {string} base64Png - The base64 string of the PNG image.
 * @returns {Promise<string>} - A promise resolving to the base64 string of the converted JPG image.
 */
function convertPngToJpg(base64Png: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = getCanvas(img.width, img.height);
            const ctx = canvas.getContext("2d") as any;
            canvas.width = img.width;
            canvas.height = img.height;

            if(!ctx) return reject(new Error("No canvas context"))

            // Fill canvas with a white background to avoid transparency.
            //ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the PNG image onto the canvas.
            ctx.drawImage(img, 0, 0);

            // Convert the canvas content to JPG base64.
            const jpgBase64 = canvas.toDataURL("image/jpeg", 0.8); // 0.8 for quality adjustment.
            resolve(jpgBase64);
        };
        img.onerror = reject;
        img.src = base64Png;
    });
}

function convertPngWithUPNG(base64Png: string): Promise<string> {
    return new Promise((resolve, reject) => {
        reject(new Error(""))/*
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;

            if (!ctx) return reject(new Error("No canvas context"));

            // Draw the PNG image onto the canvas.
            ctx.drawImage(img, 0, 0);

            // Extract raw image data from the canvas.
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const rgbaData = imageData.data;

            // Encode the raw image data to PNG using UPNG.
            const pngArrayBuffer = UPNG.encode([new Uint8Array(rgbaData.buffer)], canvas.width, canvas.height, 0);
            const pngBase64 = `data:image/png;base64,${btoa(Array.from(new Uint8Array(pngArrayBuffer)).map(byte => String.fromCharCode(byte)).join(""))}`;

            resolve(pngBase64);
        };
        img.onerror = reject;
        img.src = base64Png;*/
    });
}

export const buildImageSelectName = (fieldName: string, name: string) => {
    if(!name) return name
    var optionName = name.substring(`${fieldName} `.length)
    if (isNaN(Number(optionName))) {
        return `${optionName}, ${fieldName}`;
    }
    var lastDigitPos = optionName.substring(optionName.length - 1)
    switch (lastDigitPos) {
        case "1":
            return `${optionName}st ${fieldName}`
        case "2":
            return `${optionName}nd ${fieldName}`
        case "3":
            return `${optionName}rd ${fieldName}`
        default:
            return `${optionName}th ${fieldName}`
    }
}

export const buildImageSelectNameReverse = (fieldName: string, formattedName: string) => {
    if (!formattedName) return formattedName;


    // Handle the case with ", fieldName"
    if (formattedName.endsWith(`, ${fieldName}`)) {
        const index = formattedName.lastIndexOf(`, ${fieldName}`)
        return `${fieldName} ${formattedName.substring(0, index)}`;
    }

    // Check if the formattedName ends with the fieldName
    if (formattedName.endsWith(` ${fieldName}`)) {
        const withoutFieldName = formattedName.substring(0, formattedName.length - fieldName.length - 1);
        
        // Check for ordinal suffix
        const ordinalMatch = withoutFieldName.match(/(\d+)(st|nd|rd|th)$/);
        if (ordinalMatch) {
            return `${fieldName} ${ordinalMatch[1]}`;
        }

        // Handle the default case without ordinal suffix
        return `${fieldName} ${withoutFieldName}`;
    }


    // If no match, return null or undefined as it doesn't fit the expected format
    return formattedName;
};

// Utility function to determine input type based on the layer name
export const breakName = (name: string) => {
    return name.replace(/_/g, " ").split("@")[0]
}

export const showField = (field: Field, fields: Fields, data: Doc) => {
    const visibilityCode = field?.visibility_code;
    if (visibilityCode && visibilityCode.length > 0 && (visibilityCode.includes("==") || visibilityCode.includes("!="))) {
        let codeAndTarget = visibilityCode.split("==");
        let isNot;
        if(visibilityCode.includes("==")) {
            codeAndTarget = visibilityCode.split("==");
            isNot = false;

        } else {
            codeAndTarget = visibilityCode.split("!=");
            isNot = true
        }

        const code = codeAndTarget[0].trim();
        const targetExpression = codeAndTarget[1].trim();

        // Helper function to parse code result
        const parseCodeResult = (parser: (dataKey: string, dataAsKey: string) => string) => {
            return textGenCodeParser(code, data, useDataForRandSeed, parser);
        };

        const codeResultForTextSelectName = parseCodeResult((dataKey, dataAsKey) => {
            if (fields[dataKey]?.type === "text_select" && fields[dataKey]?.selections?.[dataAsKey]) {
                return (fields[dataKey].selections[dataAsKey]?.name || "").trim();

            }
            return dataAsKey;
        });

        const codeResultForTextSelectValue = parseCodeResult((dataKey, dataAsKey) => {
            if (fields[dataKey]?.type === "text_select" && fields[dataKey]?.selections?.[dataAsKey]) {
                return (fields[dataKey].selections[dataAsKey]?.value || "").trim();

            } else if (fields[dataKey]?.type === "image_select") {
                const optionName = (fields[dataKey]?.options || {})[dataAsKey]?.name || ""
                //console.log("showField", dataKey, "::", dataAsKey, "-1-", optionName)
                return optionName;
            }
            return dataAsKey;
        });

        const codeResultForImageSelectTransformed = parseCodeResult((dataKey, dataAsKey) => {
            if (fields[dataKey]?.type === "image_select") {
                const transformed = buildImageSelectName(fields[dataKey].name, (fields[dataKey]?.options || {})[dataAsKey]?.name || "")
                //console.log("showField", dataKey, "::", dataAsKey, "-2-", transformed)
                return transformed;
            }
            return dataAsKey;
        });

        const codeResult = [codeResultForTextSelectName, codeResultForTextSelectValue, codeResultForImageSelectTransformed];

        // Evaluate the target expression with logical operators
        const evaluateExpression = (expression: string): boolean => {
            const operands = expression.split(/\s*(\|\||&&)\s*/); // Split by `||` and `&&`

            if(expression.includes("5th")) {
                //console.log("showField", expression, "-1-", operands)
            }
            
            let result = checkOperand(operands[0]);

            for (let i = 2; i < operands.length; i++) {
                const currentOperand = checkOperand(operands[i]);
                const operator = operands[i - 1];
                if (operator === "||") {
                    result = result || currentOperand;
                } else if (operator === "&&") {
                    result = result && currentOperand;
                }
            }

            return result;
        };

        const checkOperand = (operand: string): boolean => {
            const trimmedOperand = operand.trim();
            
            if(!isNot) {
                //return codeResult.some(result => result === trimmedOperand);
                return codeResult.some(result => result.toLowerCase() === trimmedOperand.toLowerCase());

            } else {
                //return codeResult.some(result => result !== trimmedOperand);
                //console.log("checkOperand", codeResult, `${codeResult[0].toLowerCase()} !== ${trimmedOperand.toLowerCase()}`, codeResult[0].toLowerCase() !== trimmedOperand.toLowerCase())
                return codeResult.some(result => result.toLowerCase() !== trimmedOperand.toLowerCase());
            }
        };

        return evaluateExpression(targetExpression);
    }

    return true;
};

export const splitSvgElementId = (id: string) => {
    const [ name, typeAndSelectIndex ] = id.split(".", 2)

    if(!typeAndSelectIndex) return { name }

    const [ type, selectIndex ] = [
        typeAndSelectIndex.split("_")[0], 
        typeAndSelectIndex.split("_").slice(1).join(" ")
    ]

    return { name, type, selectIndex, typeAndSelectIndex }
}

export const useDataForRandSeed = (key: string): boolean => {
    const { type } = splitSvgElementId(key)
    return type && ["text", "textarea"].includes(type)? true : false
}

export const valueOfParseValue = (key: string, value: string, data?: FieldsData, fields?: Fields) => {
    if(fields && data && ["gen", "date"].includes(fields[key]?.type)) {
        value = textGenCodeParser(fields[key].code, data, useDataForRandSeed, (dataKey, dataAsKey) => {
            if(fields[dataKey]?.type == "text_select") {
                return ((fields[dataKey].selections || {})[dataAsKey]?.value || "").trim()

            }
            return dataAsKey
        })
    }

    //console.log("formatDate.value:", key, value, data, fields)

    return value
}

export const actionsStorageKey = (collectionName: string, id: string) => {
    return `/${collectionName}/${id}`.toLowerCase()
}
export const fileFieldStorageKey = (collectionName: string, id: string, fieldName: string) => {
    return `/${collectionName}/${id}/${fieldName}`.toLowerCase()
}
export const fileDocStorageKey = (collectionName: string, id: string) => {
    return `/${collectionName}/${id}`.toLowerCase()
}
export const fileCollectionStorageKey = (collectionName: string) => {
    return `/${collectionName}`.toLowerCase()
}

export const isBrowser = () => {
    return typeof window !== "undefined"
}

export const saveFileFieldFile = (collectionName: string, id: string, fieldName: string, value: string) => {
    if(!isBrowser() || !window?.localStorage) return

    try {
        window?.localStorage.setItem(fileFieldStorageKey(collectionName, id, fieldName), value)

    } catch(e) {
        window?.localStorage.clear()
        window?.localStorage.setItem(fileFieldStorageKey(collectionName, id, fieldName), value)
    }
}

export interface FileFieldsFiles {
    [x: string]: string
}

export const getFileFieldFile = (collectionName: string, id: string, fieldName: string, fileFieldTypesDefaultFiles?: FileFieldsFiles): string | null => {
    if(!isBrowser() || !window?.localStorage) {
        const { type, name } = splitSvgElementId(fieldName)
        if(!type || !fileFieldTypesDefaultFiles) return null

        if(type == "upload" && name.toLowerCase().split(" ").includes("logo")) return fileFieldTypesDefaultFiles.logo
        return fileFieldTypesDefaultFiles[`${type}`]

    }
    return window?.localStorage.getItem(fileFieldStorageKey(collectionName, id, fieldName))
}

export const moveFileFieldFile = (collectionName: string, oldId: string, newId: string, fieldName: string, fileFieldTypesDefaultFiles?: FileFieldsFiles): Promise<void> => {
    return new Promise((resolve, reject) => {
        if(!isBrowser() || !window?.localStorage) return resolve()
        const file = getFileFieldFile(collectionName, oldId, fieldName, fileFieldTypesDefaultFiles)
        if(file) {
            saveFileFieldFile(collectionName, newId, fieldName, file)
            window?.localStorage.removeItem(fileFieldStorageKey(collectionName, oldId, fieldName))
            resolve()

        } else {
            reject(new Error("No file at old ID"))
        }
    })
}

export const deleteFileFieldFile = (collectionName: string, id: string, fieldName: string, fileFieldTypesDefaultFiles?: FileFieldsFiles): Promise<void> => {
    return new Promise((resolve, reject) => {
        if(!isBrowser() || !window?.localStorage) return resolve()
        const file = getFileFieldFile(collectionName, id, fieldName, fileFieldTypesDefaultFiles)
        if(file) {
            window?.localStorage.removeItem(fileFieldStorageKey(collectionName, id, fieldName))
            resolve()

        } else {
            resolve()
        }
    })
}

export const deleteDataWithKeyPrefix = (keyPrefix: string) => {
    if(!isBrowser() || !window?.localStorage) return
    for (let key in window?.localStorage) {
        if (key.startsWith(keyPrefix)) {
            window?.localStorage.removeItem(key);
        }
    }
}

export const setR2Host = (url: string, r2Domain: string) => {
    if(!url) return url
    if (url.startsWith('/')) {
      return `https://${r2Domain}${url}`;
    }
  
    try {
      const parsedUrl = new URL(url);
      parsedUrl.host = r2Domain;
      parsedUrl.protocol = 'https:'; // force https
      return parsedUrl.toString();
    } catch (err) {
      console.error('Invalid URL:', url);
      return url; // fallback
    }
};
