
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

export function removeUpdateQueryString(url: string): string {
    return removeQueryString(url, 'updates')
}

export const rmUpdates = (url: string) => {
    if(!url) return null as any
    try {
        return removeUpdateQueryString(url)

    } catch(e) {
        return null as any
    }
}