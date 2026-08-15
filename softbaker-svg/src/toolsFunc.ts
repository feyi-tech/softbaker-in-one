import { Doc } from "./types.ts"

export const getResponsiveX = (value: number, ticketWidth: number, baseTemplateWidth: number, fractionDigits?: number) => {
    if(value == 0) return 0
    value = (value * ticketWidth) / baseTemplateWidth
    if(fractionDigits) {
        //console.log("scaleSvg.getResponsiveX: ", value, ticketWidth, baseTemplateWidth, value.toFixed(fractionDigits))
        return parseFloat(value.toFixed(fractionDigits))
    }
    return Math.ceil(value)
}
/*
scaleSvg.getResponsiveX:  248.0178020590345 512 2047.853 248.018
toolsFunc.ts:17 scaleSvg.getResponsiveY:  198.01421293422914 341.3332499940181 1365.235 198.014
toolsFunc.ts:7 scaleSvg.getResponsiveX:  867.3122533697486 512 2047.853 867.312
toolsFunc.ts:17 scaleSvg.getResponsiveY:  511.0366808555106 341.3332499940181 1365.235 511.037
toolsFunc.ts:7 scaleSvg.getResponsiveX:  128.50922405074974 512 2047.853 128.509
toolsFunc.ts:17 scaleSvg.getResponsiveY:  158.76139547125698 341.3332499940181 1365.235 158.761
toolsFunc.ts:7 scaleSvg.getResponsiveX:  96.75694495649834 512 2047.853 96.757
toolsFunc.ts:17 scaleSvg.getResponsiveY:  426.28059728896557 341.3332499940181 1365.235 426.281*/

export const getResponsiveY = (value: number, ticketHeight: number, baseTemplateHeight: number, fractionDigits?: number) => {
    if(value == 0) return 0
    value = (value * ticketHeight) / baseTemplateHeight
    if(fractionDigits) {
        //console.log("scaleSvg.getResponsiveY: ", value, ticketHeight, baseTemplateHeight, value.toFixed(fractionDigits))
        return parseFloat(value.toFixed(fractionDigits))
    }
    return Math.ceil(value)
}

export const translate = (x: number, y: number, ticketWidth: number, baseTemplateWidth: number, ticketHeight: number, baseTemplateHeight: number) => {
    return `translate(${getResponsiveX(x, ticketWidth, baseTemplateWidth, 3)} ${getResponsiveY(y, ticketHeight, baseTemplateHeight, 3)}) `
}

export const scale = (x: number, y: number, ticketWidth: number, baseTemplateWidth: number, ticketHeight: number, baseTemplateHeight: number) => {
    return `scale(${getResponsiveX(x, ticketWidth, baseTemplateWidth, 3)} ${getResponsiveY(y, ticketHeight, baseTemplateHeight, 3)}) `
}

export const pxToVw = (value: number, parentWidth: number, fractionDigits?: number) => {
    if (value === 0) return 0;
    const vwValue = (value * 100) / parentWidth;
    if (fractionDigits) {
        return parseFloat(vwValue.toFixed(fractionDigits));
    }
    return Math.ceil(vwValue);
};

function convertToArrayOfObjects(inputObject: Doc) {
    const resultArray: Doc[] = [];

    // Get the keys and sort them numerically
    const sortedKeys = Object.keys(inputObject).sort((a, b) => parseInt(`${a}`) - parseInt(`${b}`));

    // Iterate over the sorted keys and push the corresponding values to the array
    sortedKeys.forEach(key => {
        resultArray.push(inputObject[key]);
    });

    return resultArray;
}
export const arrayAsObjectToArray = (arrayAsObject?: {[x: number]: Doc} | Doc[] | null) => {
    if(!arrayAsObject) return []
    if(Array.isArray(arrayAsObject)) {
        return arrayAsObject

    } else if(typeof arrayAsObject == "object") {
        return convertToArrayOfObjects(arrayAsObject)

    } else {
        return []
    }
}

export const parseContactLink = (contactLink: string, message?: string) => {
   if(!message) return contactLink
   var msg = `${message.replace(/\n/g, "%0A")}`.replace(/[ ]/g, "%20")
   return contactLink.split("?")[0] + `?text=${msg}`
}