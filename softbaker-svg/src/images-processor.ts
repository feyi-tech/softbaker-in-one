import axios from "axios";
import { getCanvas } from "./imageHelper.ts";
import { FileMap, MaskMap } from "./types.ts";
import { getCorsSafeR2Url, isUploadedFileUrl } from "./utils.ts";
import { normalizeMimeType } from "./mime.ts";

const isNode = typeof window === 'undefined';

/**
 * Fetches the image from a URL and converts it to a base64 string.
 * @param {string} url - The URL of the image to fetch.
 * @returns {Promise<string|null>} - A promise that resolves to the base64 string of the image or null if an error occurs.
 */
export const fetchImageForBase64 = async (
  storageHost: string,
  url: string,
  alwaysResolve = false
): Promise<string | null> => {
  if (!isUploadedFileUrl(url)) return url;

  try {
    const response = await axios.get(getCorsSafeR2Url(url, storageHost), {
      responseType: "arraybuffer", // Fetch raw bytes
    });

    const buffer = Buffer.from(response.data); // works in both browser & Node.js
    const mimeType = normalizeMimeType(response.headers["content-type"]);
    const base64String = buffer.toString("base64");

    return `data:${mimeType};base64,${base64String}`;
  } catch (error: any) {
    console.info("fetchImageForBase64 error:", error.message);
    if (alwaysResolve) return null;
    throw error;
  }
};

  
/**
 * Compares two base64 strings to check if they are identical.
 * @param {string} base64A - The first base64 string.
 * @param {string} base64B - The second base64 string.
 * @returns {boolean} - Returns true if the base64 strings are identical, otherwise false.
 */
export function compareBase64(base64A: string, base64B: string): boolean {
    //base64A is fetched from URL. Sampl:  iVBORw0KGgoAAAANSUhEUgAAAGYAAABg...
    //base64B is the uploaded file base64 string. Sample:  data:image/png;base64,iVBORw0KGg...
    console.info("parsedSvg:base64A: ", base64A.substring(0, 32))
    console.info("parsedSvg:base64B: ", base64B.substring(0, 32))
    return base64A === base64B.split(',')[1];
}

/**
 * Removes a specific query string parameter from a URL.
 * @param {string} url - The original URL.
 * @param {string} queryString - The query string parameter to remove.
 * @returns {string} - The updated URL without the specified query string parameter.
 */
export function removeQueryString(url: string, queryString: string): string {
    try {
        // Create a URL object
        const urlObj = new URL(url);

        // Remove the specified query string parameter
        urlObj.searchParams.delete(queryString);

        // Return the updated URL as a string
        return urlObj.toString();
    } catch (error) {
        console.error('Invalid URL:', error, url);
        return url; // Return the original URL if there's an error
    }
}

/**
 * Updates the query string in a URL, adding or incrementing the 'updates' parameter.
 * @param {string} url - The URL to update.
 * @returns {string} - The updated URL.
 */
export function removeUpdateQueryString(url: string): string {
    return removeQueryString(url, 'updates')
}
  
/**
 * Updates the query string in a URL, adding or incrementing the 'updates' parameter.
 * @param {string} url - The URL to update.
 * @returns {string} - The updated URL.
 */
export function incrementUpdateQueryString(url: string): string {
    const urlObj = new URL(url);
    const updates = urlObj.searchParams.get('updates');
    const newUpdates = `${updates ? parseInt(updates, 10) + 1 : 1}`;
    urlObj.searchParams.set('updates', newUpdates);
    return urlObj.toString();
}

/**
 * Updates the query string in a URL, adding or incrementing the 'updates' parameter.
 * @param {string} url - The URL to update.
 * @returns {string} - The updated URL.
 */
export function getUrlUpdatesCount(url: string): number {
    const urlObj = new URL(url);
    const updates = urlObj.searchParams.get('updates');
    return updates ? parseInt(updates, 10) : 1;
}
  
/**
 * Processes the old and new images, comparing the content and updating the new images if they are identical.
 * @param {{[x: string]: string}} oldImages - The map of old images with keys and URLs or base64 strings.
 * @param {{[x: string]: string}} newImages - The map of new images with keys and base64 strings.
 * @returns {Promise<{[x: string]: string}>} - Returns a promise that resolves to the updated map of new images.
 */
export function mergeImages(storageHost: string, oldImages: FileMap, newImages: FileMap): Promise<FileMap> {
    return new Promise(async (resolve, reject) => {
        try {
            for (const key in oldImages) {
                if (oldImages.hasOwnProperty(key) && newImages.hasOwnProperty(key)) {
                    const oldImage = oldImages[key];
                    const newImage = newImages[key];

                    // Check if oldImage is a URL and newImage is base64
                    if (oldImage.startsWith('http') && newImage.startsWith('data:image')) {
                        const fetchedOldImageBase64 = await fetchImageForBase64(storageHost, oldImage, true);

                        //If the image at the old image's url is the same as the new image,
                        //that is no change
                        if (fetchedOldImageBase64 && compareBase64(fetchedOldImageBase64, newImage)) {
                            //Replace the new image's base64 url with the old image's http url to 
                            // prevent unneccessary reupload of the image
                            newImages[key] = oldImage;
                        }
                    }
                }
            }
            resolve(newImages);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generates a new image of specified width and height by repeating the given image with a specified opacity.
 *
 * @param {string} imageUrl - The URL or base64 string of the original image.
 * @param {number} width - The width of the new image.
 * @param {number} height - The height of the new image.
 * @param {number} opacity - The opacity of the watermark image (0 to 1).
 * @returns {Promise<string>} - A promise that resolves to a base64 string of the new image.
 */
export function generateWatermark(imageUrl: string, width: number, height: number, opacity = 1): Promise<string> {
    return new Promise((resolve, reject) => {
        const originalImage = new Image();

        originalImage.onload = () => {
            const canvas = getCanvas(width, height);
            const ctx = canvas.getContext('2d') as any;

            if (!ctx) return reject("No canvas context");

            canvas.width = width;
            canvas.height = height;

            ctx.globalAlpha = opacity;

            for (let y = 0; y < height; y += originalImage.height) {
                for (let x = 0; x < width; x += originalImage.width) {
                    ctx.drawImage(originalImage, x, y, originalImage.width, originalImage.height);
                }
            }

            resolve(canvas.toDataURL());
        };

        originalImage.onerror = reject;
        originalImage.src = imageUrl;
    });
}
