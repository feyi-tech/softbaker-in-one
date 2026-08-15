import Web3 from "web3";
import theme from "../theme";
import { COINS, ERROR_X, STORAGE_KEYS } from "./c";
import CustomError from "./CustomError";

const Decimal = require('decimal.js');

export function isEthAddress(address: string) {
    try {
        return Web3.utils.toChecksumAddress(address)
    } catch(e) { 
        return false
    }
}
export function weiToEther(bigIntValue: BigInt, decimalPlaces: number, precision: number) {
    const bigDecimalValue = new Decimal(bigIntValue.toString());
    return Number(bigDecimalValue.div(new Decimal(10).pow(decimalPlaces)).toNumber().toPrecision(precision));
}
export function bigIntToBigDecimal(bigIntValue: BigInt) {
    return new Decimal(bigIntValue.toString());
}

export const nullOrEmpty = (d: any) => {
    return !d || d.length == 0
}
export const isVoid = (value: any) => {
    return value === undefined || value === null
}
export const isValidEmail = (email: string) => {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}

export const isValidPhone = (phone: string) => {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone)
}

export const USE_SOFT_BAKER_RESOLVE_PREFIX: string = "USE_SOFT_BAKER_RESOLVE_"
export const USE_SOFT_BAKER_REJECT_PREFIX: string = "USE_SOFT_BAKER_REJECT_"

export const promiseResolvePending = (promiseId: string): boolean => {
    return (window as any)[`${USE_SOFT_BAKER_RESOLVE_PREFIX}${promiseId}`] != undefined
}
export const promiseRejectPending = (promiseId: string): boolean => {
    return (window as any)[`${USE_SOFT_BAKER_REJECT_PREFIX}${promiseId}`] != undefined
}

export const savePromise = (promiseId: string, resolve: (x: any) => void, reject: (y: any) => any, pollInterval: number = 200): void => {
    (window as any)[`${USE_SOFT_BAKER_RESOLVE_PREFIX}${promiseId}`] = resolve;
    (window as any)[`${USE_SOFT_BAKER_REJECT_PREFIX}${promiseId}`] = reject;
}

export const resolvePromise = (promiseId: string, data: any): void => {
    if((window as any)[`${USE_SOFT_BAKER_RESOLVE_PREFIX}${promiseId}`]) {
        (window as any)[`${USE_SOFT_BAKER_RESOLVE_PREFIX}${promiseId}`](data)
        delete (window as any)[`${USE_SOFT_BAKER_RESOLVE_PREFIX}${promiseId}`]
        delete (window as any)[`${USE_SOFT_BAKER_REJECT_PREFIX}${promiseId}`]
    }
}

export const rejectPromise = (promiseId: string, error: any): void => {
    if((window as any)[`${USE_SOFT_BAKER_REJECT_PREFIX}${promiseId}`]) {
        (window as any)[`${USE_SOFT_BAKER_REJECT_PREFIX}${promiseId}`](error)
        delete (window as any)[`${USE_SOFT_BAKER_RESOLVE_PREFIX}${promiseId}`]
        delete (window as any)[`${USE_SOFT_BAKER_REJECT_PREFIX}${promiseId}`]
    }
}

export const updateLogSettings = (enableLog?: boolean | null) => {
    if(enableLog) {
        localStorage.setItem(STORAGE_KEYS.ENABLED_LOG, "true")

    } else {
        localStorage.setItem(STORAGE_KEYS.ENABLED_LOG, "false")
    }
}
export const consoleLog = (...args: any[]) => {
  // Check if the environment is not Windows
  if(typeof window === 'undefined') {
    console.log(...args);
    return
  }

  // Check if logging has been disabled
  const isEnabled = localStorage.getItem(STORAGE_KEYS.ENABLED_LOG) === "true";

  // If not disabled and not in a Windows environment, call the normal console.log
  if (isEnabled) {
    console.log(...args);
  }
}

export const whatsappLink = (phoneNumber?: string | null, message?: string, isWeb?: boolean): string => {
    if(message) {
        //message = `?text=${message.replaceAll("\n", "%0A")}`.replaceAll(" ", "%20")/*
        try {
            message = `${message.replace(/\n/g, "%0A")}`.replace(/[ ]/g, "%20")

        } catch(e: any) {}
    }
    
    return isWeb? `https://web.whatsapp.com/send/?phone=${phoneNumber || ""}&text=${message || ""}&type=phone_number&app_absent=0` 
    : 
    `https://wa.me/${phoneNumber || ""}?text=${message || ""}`
}

export const getDefaultCoin = (): string => {
    var defaultCoin = "bnb"
    var lastPriority = -1
    for(const coin of Object.keys(COINS)) {
        if(!COINS[coin].disabled && (lastPriority < 0 || COINS[coin].priority < lastPriority)) {
            defaultCoin = coin
            lastPriority = COINS[coin].priority
        }
    }
    return defaultCoin
}

export const downloadSvgAsImage = (svgString: string, format: 'png' | 'jpeg' = 'png', fileName = 'downloadedImage'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
    
      const img = new Image();
    
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
    
        if (context) {
          context.drawImage(img, 0, 0);
    
          const dataUrl = canvas.toDataURL(`image/${format}`);
          const imageBlob = dataURLToBlob(dataUrl);
    
          if (isiPhone()) {
            // Workaround for iPhone browsers
            const binaryData: Blob[] = [imageBlob];
            const iphoneBlob = new Blob(binaryData, { type: `image/${format}` });
            const iphoneUrl = URL.createObjectURL(iphoneBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = iphoneUrl;
            downloadLink.download = `${fileName}.${format}`;
            downloadLink.click();
            URL.revokeObjectURL(iphoneUrl);
            resolve(iphoneUrl)
          } else {
            // For other browsers
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `${fileName}.${format}`;
            downloadLink.click();
            resolve(dataUrl)
          }
  
        } else {
          reject(new Error("Unsupported Browser. Please try to download from another browser."))
        }
      };
    
      img.src = svgUrl;
    })
}
    
function dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    var n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

function isiPhone(): boolean {
    return /iPhone/i.test(navigator.userAgent);
}
export function extractNumberFromString(text: string) {
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

export const getColor = (isDarkMode: boolean | undefined, colorName: string) => {
    const color = theme[colorName]
    if(color) {
        return isDarkMode === true? color.dark : color.light

    } else {
        return ""
    }
}

export const decimalsText = (d: number): string => {
    // Check if the input is a non-negative integer
    if (Number.isInteger(d) && d >= 0) {
        // Use string concatenation to create the string representation
        return '1' + '0'.repeat(d);
    } else {
        // Handle invalid input, you might want to throw an error or handle it differently
        throw new Error('Input must be a non-negative integer.');
    }
};

export const getError = (error: any, defaultMessage?: string | null) => {
    var message = defaultMessage, code = "none"
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message = error.response?.data?.error || defaultMessage || ERROR_X
        code = error.response.data.code || "none"

    } else if (error.request) {
        // The request was made but no response was received
        message = "No response received from the server. Try again later"

    } else if(error.message) {
        // Something happened in setting up the request that triggered an Error
        message = error.message
    }
    return message? new CustomError(message, code) : null
}

export const emptyNumber = (n: any) => {
    return isNaN(n) || n == 0
}

export const amountFormatDefault = (
    v: number,
    minFD?: number,
    maxFD?: number,
    noZeroDecimals?: boolean
): string => {
    if (isNaN(v)) return "0.00";

    const resolvedMaxFD = maxFD ?? 2;
    const resolvedMinFD = noZeroDecimals ? 0 : (minFD ?? 2);

    const factor = Math.pow(10, resolvedMaxFD);
    const roundedValue = Math.floor(v * factor) / factor;

    // Format first
    let formatted = roundedValue.toLocaleString("en", {
        minimumFractionDigits: resolvedMinFD,
        maximumFractionDigits: resolvedMaxFD
    });

    // Remove trailing `.0`, `.00`, etc. if noZeroDecimals is true
    if (noZeroDecimals) {
        if (formatted.includes('.')) {
            // Remove only if all decimal digits are zero
            const [intPart, decimalPart] = formatted.split('.');
            if (/^0+$/.test(decimalPart)) {
                formatted = intPart;
            }
        }
    }

    return formatted;
};

export const isBrowser = () => {
    return typeof window !== "undefined"
}