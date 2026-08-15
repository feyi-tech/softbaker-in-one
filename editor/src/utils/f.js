export const stringifyAny = (data) => {
    if(!data) return ""
    try {
        return JSON.stringify(data)

    } catch(e) {
        return `${data}`
    }
}

export function trucEnds(text, firstCharsLength, lastCharsLength) {
    if (text.length <= firstCharsLength + lastCharsLength) {
      return text; // No need to separate if the string length is less than or equal to x + y
    }
    
    const start = text.slice(0, firstCharsLength);
    const end = text.slice(-lastCharsLength);
    
    return `${start}...${end}`;
}

export function trucText(text, maxLength) {
    if (text.length <= maxLength) {
      return text; // No need to separate if the string length is less than or equal to x + y
    }
    
    const start = text.slice(0, maxLength);
    
    return `${start}...`;
}

export function textToFilename(text) {
    return text.trim().replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

export const getRandomItem = (items) => {
    return items[Math.floor(Math.random()*items.length)]
}
export const getRandomItemRange = (items, min, max) => {
    return items[getRandomInt(min, max)]
}

export const isNumber = (value) => {
    return !isVoid(value) && !isNaN(value)
}

export const isVoid = value => {
    return value === undefined || value === null
}
export const nullOrEmpty = value => {
    return isVoid(value) || value.length == 0
}
export const nullOrEmptyOrList = (values) => {

    for(var i = 0; i < values.length; i++) {
        if(!values[i] || values[i].length == 0) {
            return true
        }
    }
    return false
}
export const nullOrEmptyAndList = (values) => {

    for(var i = 0; i < values.length; i++) {
        if(values[i] && values[i].length > 0) {
            return false
        }
    }

    return true
}

export const objEmpty = obj => {
    return Object.keys(obj).length == 0
}

export const pathToQuery = path => {
    
    return {}
}

export const copyText = e => {
    if(e) {
        var target = e.target
        var text = target.getAttribute("data-copy")
        copyFromText(text, () => {
            target.setAttribute("data-copy-msg", target.getAttribute("data-copy-ok") || "Text Copied.")
        }, 
        err => {
            target.setAttribute("data-copy-msg", target.getAttribute("data-copy-failed") || "Text Copy failed.")
        })
    }
}

export const copyFromTextFallBack = (text, onCopy, onError) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        //console.log('Fallback: Copying text command was ' + msg);
        if(onCopy) onCopy()
    } catch (e) {
        console.error('Fallback: Oops, unable to copy', e);
        if(onError) onError(e)
    }
    
    document.body.removeChild(textArea);
}

export const copyFromText = (text, onCopy, onError) => {
    if (!navigator.clipboard) {
        copyFromTextFallBack(text, onCopy, onError);
        return;
    }
    navigator.clipboard.writeText(text)
    .then( () => {
        //console.log('Async: Copying to clipboard was successful!')
        if(onCopy) onCopy()
    })
    .catch(e => {
        //console.error('Async: Could not copy text: ', e)
        if(onError) onError(e)
    })
}

export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getRandomPctValue = (min, max, value) => {
    const pct = getRandomInt(min, max)
    return (pct * value) / 100
}

/**
 * Algo source:
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * 
 * The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * 
 * Here's a JavaScript implementation of the Durstenfeld shuffle, an optimized version of Fisher-Yates:
 * http://en.wikipedia.org/wiki/Fisher-Yates_shuffle#The_modern_algorithm
 */
export const shuffleArray = (array) => {
    const returnArray = [ ...array ]
    for (let i = returnArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [returnArray[i], returnArray[j]] = [returnArray[j], returnArray[i]];
    }
    return returnArray
}

export const isValidEmail = (email) => {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}

export const isValidPhone = phone => {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)
}

export const isNetworkError = e => {
    let errorString
    try {
        errorString = JSON.stringify(e)

    } catch(e) {
        errorString = `${e}`
    }
    return errorString.toLowerCase().includes("network")
}

export const emptyNumber = n => {
    return isNaN(n) || n == 0
}

export const genRandText = (email, price) => {
    const parts = email.split(".")
    return (parts[0] + "_" + parts[1] + `_${price}`).toUpperCase()
}

export const nameToKey = (v) => {
    return v.replace(/[_-\s]+/g, "_").trim().toLowerCase()
}

/**
 * Courtesy: https://stackoverflow.com/a/7592235/12710718
 * 
 * Capitalizes first letters of words in string.
 * @param {string} str String to be modified
 * @param {boolean=false} lower Whether all other letters should be lowercased
 * @return {string}
 * @usage
 *   capitalize('fix this string');     // -> 'Fix This String'
 *   capitalize('javaSCrIPT');          // -> 'JavaSCrIPT'
 *   capitalize('javaSCrIPT', true);    // -> 'Javascript'
 */
export const capitalize = (str, lower = false) => {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}

export const reduceByPercentage = (val, pct) => {
    return val - (
        (val * pct) / 100
    )
}
export const increaseByPercentage = (val, pct) => {
    return val + (
        (val * pct) / 100
    )
}

export const millisElapsed = (millis) => {
    return (Date.now() - millis)
}

export const fiatToCoin = (amount, priceInFiat) => {
    return amount / priceInFiat
}
export const coinToFiat = (amount, priceInFiat) => {
    return amount * priceInFiat
}
export const getUniquePaymentTemplateField = (fields, fallback) => {
    var result = fallback
    for (const f of fields) {
        if(f.is_unique) {
            result = f
            break
        }
    }
    return result
}
export const getPaymentTemplateNameField = (fields, fallback) => {
    var result = fallback
    for (const f of fields) {
        if(f.name == "Account name" || f.name == "Email") {
            result = f
            break
        }
    }
    return result
}

export const priceInFiatToCryptoDecimals = (price, defaultDecimals) => {
    var decimals = (Math.floor(Math.log10(1 / price)) * - 1) - 1
    if(isNaN(decimals) || decimals < defaultDecimals) decimals = defaultDecimals
    console.log("useOrderPrice.priceInFiatToCryptoDecimals", decimals, price)
    return decimals
}

export const pct = (value, percentage) => (value * percentage) / 100

export const numFormatDefault = (v, minFD, maxFD) => {
    return parseFloat(`${v}`).toLocaleString("en", {minimumFractionDigits: emptyNumber(minFD)? 0 : minFD, maximumFractionDigits: emptyNumber(maxFD)? 0 : maxFD})
}

export const amountFormatDefault = (v, minFD, maxFD) => {
    if (isNaN(v)) return "0.00";

    let factor = Math.pow(10, emptyNumber(maxFD) ? 2 : maxFD);
    let roundedValue = Math.floor(parseFloat(v) * factor) / factor;

    return roundedValue.toLocaleString("en", {
        minimumFractionDigits: emptyNumber(minFD) ? 2 : minFD,
        maximumFractionDigits: emptyNumber(maxFD) ? 2 : maxFD
    });
};

export const amountFormatNoDecimals = (v) => {
    if (isNaN(v)) return "0";

    return v.toLocaleString("en", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};


export function extractNumberFromString(text) {
    if(!text) return null
    text = `${text}`
    // Define a regular expression to match numbers with decimals and optional commas as thousands separators
    const numberRegex = /\D+/g;
    const numParts = text.split(".")
    const mantissa = numParts[0].replace(numberRegex, '')
    const decimals = numParts.length > 1? numParts[1].replace(numberRegex, '') : null
    if(mantissa && mantissa.length > 0) {
      var result = mantissa
      if(decimals) result += `.${decimals}`
      return Number(result)
    }
    return null
}

export const SOFT_BAKER_APP_RESOLVE_PREFIX = "SOFT_BAKER_APP_RESOLVE_"
export const SOFT_BAKER_APP_REJECT_PREFIX = "SOFT_BAKER_APP_REJECT_"

export const promiseResolvePending = (promiseId) => {
    return window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`] != undefined
}
export const promiseRejectPending = (promiseId) => {
    return window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`] != undefined
}

export const savePromise = (promiseId, resolve, reject) => {
    window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`] = resolve;
    window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`] = reject;
}

export const resolvePromise = (promiseId, data) => {
    if(window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`]) {
        window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`](data)
        delete window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`]
        delete window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`]
    }
}

export const rejectPromise = (promiseId, error) => {
    if(window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`]) {
        window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`](error)
        delete window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`]
        delete window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`]
    }
}

export const getResolve = (promiseId) => {
    return window[`${SOFT_BAKER_APP_RESOLVE_PREFIX}${promiseId}`]
}

export const getReject = (promiseId) => {
    return window[`${SOFT_BAKER_APP_REJECT_PREFIX}${promiseId}`]
}

export const actionsStorageKey = (collectionName, id) => {
    return `/${collectionName}/${id}`.toLowerCase()
}
export const fileFieldStorageKey = (collectionName, id, fieldName) => {
    return `/${collectionName}/${id}/${fieldName}`.toLowerCase()
}
export const fileDocStorageKey = (collectionName, id) => {
    return `/${collectionName}/${id}`.toLowerCase()
}
export const fileCollectionStorageKey = (collectionName) => {
    return `/${collectionName}`.toLowerCase()
}

export const saveFileFieldFile = (collectionName, id, fieldName, value) => {
    try {
        localStorage.setItem(fileFieldStorageKey(collectionName, id, fieldName), value)

    } catch(e) {
        localStorage.clear()
        localStorage.setItem(fileFieldStorageKey(collectionName, id, fieldName), value)
    }
}

export const getFileFieldFile = (collectionName, id, fieldName) => {
    return localStorage.getItem(fileFieldStorageKey(collectionName, id, fieldName))
}

export const moveFileFieldFile = (collectionName, oldId, newId, fieldName) => {
    return new Promise((resolve, reject) => {
        const file = getFileFieldFile(collectionName, oldId, fieldName)
        if(file) {
            saveFileFieldFile(collectionName, newId, fieldName, file)
            localStorage.removeItem(fileFieldStorageKey(collectionName, oldId, fieldName))
            resolve()

        } else {
            reject(new Error("No file at old ID"))
        }
    })
}

export const deleteFileFieldFile = (collectionName, id, fieldName) => {
    return new Promise((resolve, reject) => {
        const file = getFileFieldFile(collectionName, id, fieldName)
        if(file) {
            localStorage.removeItem(fileFieldStorageKey(collectionName, id, fieldName))
            resolve()

        } else {
            resolve()
        }
    })
}

export const deleteDataWithKeyPrefix = (keyPrefix) => {
    for (let key in localStorage) {
        if (key.startsWith(keyPrefix)) {
            localStorage.removeItem(key);
        }
    }
}

export const getServerFileUrl = (field) => {
    if(!field) {
        //console.log("yyy:getServerFileUrl1: ", null)
        return null
    }
    //console.log("yyy:getServerFileUrl2: ", field)
    if(typeof field === 'string') return field
    //console.log("yyy:getServerFileUrl3: ", field.base64Url)
    return field.base64Url
}

export function generateUniqueId(length=6) {
    // Generate a timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
  
    // Generate a random string (you can adjust the length as needed)
    const randomString = Math.random().toString(36).substring(2, 2 + length);
  
    // Combine timestamp and random string to create a unique ID
    const uniqueId = `${timestamp}_${randomString}`;
  
    return uniqueId;
}

export const genAccountNumber = () => {
    const randomNumber = Math.floor(Math.random() * 900000000) + 100000000;
    return parseInt(`9${randomNumber.toString()}`);
}

export function generateIban(countryCode, bankIdentifier, accountNumberLength, startingDigits, checkDigits = null) {
    // Ensure the starting digits are not longer than the total account number length
    if (startingDigits.length > accountNumberLength) {
        throw new Error("Starting digits length cannot exceed the total account number length.");
    }

    // Generate the random part of the account number
    const randomPartLength = accountNumberLength - `${startingDigits}`.length;
    const randomPart = Array.from({ length: randomPartLength }, () => Math.floor(Math.random() * 10)).join('');
    
    // Form the complete account number
    const accountNumber = `${startingDigits}` + randomPart;
    
    // Form the initial IBAN without check digits
    const initialIban = bankIdentifier + accountNumber;
    
    // If check digits are not provided, calculate them
    if (!checkDigits) {
        // Rearrange for check digit calculation (countryCode + '00' goes to the end)
        const rearrangedIban = initialIban + countryCode + '00';

        // Convert letters to numbers (A=10, B=11, ..., Z=35)
        const numericIban = rearrangedIban.split('').map(ch => {
            if (isNaN(ch)) {
                return ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
            } else {
                return ch;
            }
        }).join('');

        // Calculate check digits using modulo 97
        const remainder = BigInt(numericIban) % 97n;
        checkDigits = String(98n - remainder).padStart(2, '0');
    }

    // Assemble the final IBAN
    const finalIban = `${countryCode}${checkDigits}${initialIban}`;

    return finalIban;
}

// Helper function to generate a random ID
export function generateRandomId(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
  
    for (let i = 0; i < length; i++) {
      randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return randomId;
}

export function isOldSafari() {
    if (typeof window === 'undefined') return false;
  
    const ua = window.navigator.userAgent;
  
    // Detect iOS Safari 13.x (iPhone 7 runs iOS 13)
    const isOldiOS = /iPhone OS 13_[0-9_]* like Mac OS X/.test(ua) ||
                     /iPad.* OS 13_[0-9_]* like Mac OS X/.test(ua);
  
    return isOldiOS;
}  

export function pretifyNumber(number, chunkSize = 3, separator = ',') {
  const str = String(number);
  const chunks = [];
  let i = 0;

  while (i < str.length) {
    const remaining = str.length - i;

    if (remaining <= chunkSize && chunks.length > 0) {
      // Join the remaining small part to the previous chunk
      chunks[chunks.length - 1] += str.slice(i);
      break;
    } else {
      chunks.push(str.slice(i, i + chunkSize));
      i += chunkSize;
    }
  }

  return chunks.join(separator);
}