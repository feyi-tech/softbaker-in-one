import useColorValue from "@/root/src/hooks/useColorValue"
import { fileOrUrlToBase64, getValidImageUrl, useBase64ImageLoader, useImageDimension } from "@/root/src/hooks/useImageLoader"
import { Box, HStack, Text, useBreakpointValue, VStack } from "@chakra-ui/react"
import { FaExclamationTriangle } from "react-icons/fa"
import Loading from "../../../widgets/Loading"
import Quote from "../../../widgets/Quote"
import { UserImage } from "../../index.types"
import { getImageDimension } from "@/root/src/utils/imageHelper"
import { OCRB10Regular } from "./fonts"
import { escapeHtmlEntities } from "@/root/src/utils/getSvg"

interface ErrorView {
    children: any
}
const ErrorView: React.FC<ErrorView> = ({ children }) => {
    
    return (
        <HStack justifyContent="flex-start" alignItems="center" m="0px !important" mb="1rem !important">
            <FaExclamationTriangle color="#e53e3e" />&nbsp;
            <Text as="div" color="#e53e3e">{children}</Text>
        </HStack>
    )
}

const parseError = (error: any) => {
    if(error?.message) return error.message
    return error
}

export interface ResponsiveValue {
    base?: string,
    md?: string,
    lg?: string,
    xl?: string
}

const getResponsiveX = (value: number, ticketWidth: number, baseTemplateWidth: number, fractionDigits?: number) => {
    value = (value * ticketWidth) / baseTemplateWidth
    if(fractionDigits) {
        return parseFloat(value.toFixed(fractionDigits))
    }
    return Math.ceil(value)
}

const getResponsiveY = (value: number, ticketHeight: number, baseTemplateHeight: number, fractionDigits?: number) => {
    value = (value * ticketHeight) / baseTemplateHeight
    if(fractionDigits) {
        return parseFloat(value.toFixed(fractionDigits))
    }
    return Math.ceil(value)
}

const translate = (x: number, y: number, ticketWidth: number, baseTemplateWidth: number, ticketHeight: number, baseTemplateHeight: number) => {
    return `translate(${getResponsiveX(x, ticketWidth, baseTemplateWidth, 3)} ${getResponsiveY(y, ticketHeight, baseTemplateHeight, 3)}) `
}

const scale = (x: number, y: number, ticketWidth: number, baseTemplateWidth: number, ticketHeight: number, baseTemplateHeight: number) => {
    return `scale(${getResponsiveX(x, ticketWidth, baseTemplateWidth, 3)} ${getResponsiveY(y, ticketHeight, baseTemplateHeight, 3)}) `
}

export interface DocTexts {
    fullname: string, 
    number: string, date: string
}
interface Doc extends DocTexts{
    width: any,
    height: any,
    id?: string,
    shaderUrl?: ResponsiveValue | string | null,
    ssnUrl?: ResponsiveValue | string | null,
    tableUrl?: ResponsiveValue | string | null,
    signatureUrl?: UserImage
    isLoading?: boolean | null,
    [x: string]: any
}

const baseTemplateWidth = 1024
const baseTemplateHeight = 672
const sinatureOriginalWidth = 280
const sinatureOriginalHeight = 61
//Template signature data: x="398" y="461" width="280" height="61"
// CenterX = 398 + (280 / 2)
const signatureCenterX = 398 + (sinatureOriginalWidth / 2) 
// CenterY = 461 + (61 / 2)
const signatureCenterY = 461 + (sinatureOriginalHeight / 2)
// Bottom = 461 + 61
const signatureBottom = 461 + sinatureOriginalHeight

const getSvg = ({ 
    width, height, fullname, number, date, 
    shaderUrl,
    ssnUrl,
    tableUrl,
    signatureUrl
}: Doc): string => {
    if(!number) number = ""
    if(number.length < 8 || (number.length == 8 && !number.startsWith("0"))) number = '0'.repeat(9 - number.length) + number
    number = number.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3')

    return `<svg id="Text" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
    width="${width}" height="${height}" 
    viewBox="0 0 ${width} ${height}">
    <defs>
      <style>
        @font-face {
            font-family: "ocrb10";
            letter-spacing: 0.01;
            src: url("${OCRB10Regular}")
        }

        .cls-1, .cls-2, .cls-3 {
          font-size: 40px;
          font-family: ocrb10;
        }
  
        .cls-1, .cls-2 {
          text-anchor: middle;
        }
  
        .cls-1 {
          text-transform: uppercase;
        }
  
        .cls-3 {
          text-anchor: end;
        }
  
        .cls-4 {
          opacity: 0.85;
        }
      </style>
    </defs>
    ${
        shaderUrl?
        `<image id="Background0/Shader" 
            width="${width}" 
            height="${height}"
            xlink:href="${shaderUrl}" 
        />`
        : ""
    }
    ${
        ssnUrl?
        `<image id="SSN" 
            width="${width}" 
            height="${height}" 
            xlink:href="${ssnUrl}" 
        />`
        : ""
    }
    ${
        tableUrl?
        `<image id="Table" 
            width="${width}" 
            height="${height}" 
            xlink:href="${tableUrl}" 
        />`
        : ""
    }
    <text id="fullname" data-name="fullname" class="cls-1" transform="${translate(539.148, 402.214, width, baseTemplateWidth, height, baseTemplateHeight)} ${scale(0.798, 0.797, width, baseTemplateWidth, height, baseTemplateHeight)}"><tspan x="0">${escapeHtmlEntities(fullname) || "NO NAME"}</tspan></text>
    <text id="number" data-name="number" class="cls-2" transform="${translate(542.575, 324.003, width, baseTemplateWidth, height, baseTemplateHeight)} ${scale(0.798, 0.797, width, baseTemplateWidth, height, baseTemplateHeight)}"><tspan x="0">${number}</tspan></text>
    <text id="date" data-name="date" class="cls-3" 
    transform="matrix(${getResponsiveX(0.797, width, baseTemplateWidth, 3)}, 0.018, -0.018, ${getResponsiveY(0.797, height, baseTemplateHeight, 3)}, ${getResponsiveX(861.196, width, baseTemplateWidth, 3)}, ${getResponsiveY(564.038, height, baseTemplateHeight, 3)})"><tspan x="0">${escapeHtmlEntities(date) || "MM/DD/YYYY"}</tspan></text>
    ${
        signatureUrl && signatureUrl.base64Url && signatureUrl.width > 0 && signatureUrl.height > 0? 
        `<image id="Table"    
            width="${getResponsiveX(280, width, baseTemplateWidth, 3)}"  
            height="${getResponsiveY(120, height, baseTemplateHeight, 3)}"
            x="${getResponsiveX(398, width, baseTemplateWidth, 3)}" 
            y="${getResponsiveY(435, height, baseTemplateHeight, 3)}"
            xlink:href="${signatureUrl.base64Url}" 
        />`
        : ""
    }
</svg>`
}

const downloadSvg = ({ 
    width, height, fullname, number, date, 
    shaderUrl,
    ssnUrl,
    tableUrl,
    signatureUrl
}: Doc): Promise<string> => {

    return new Promise(async (resolve, reject) => {
        try {
            shaderUrl = (await fileOrUrlToBase64(getValidImageUrl(shaderUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        try {
            ssnUrl = (await fileOrUrlToBase64(getValidImageUrl(ssnUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        try {
            tableUrl = (await fileOrUrlToBase64(getValidImageUrl(tableUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        if(signatureUrl && (signatureUrl.width == 0 || signatureUrl.height == 0)) {
            try {
                const signatureDimension = await getImageDimension(signatureUrl?.base64Url)
                signatureUrl.width = signatureDimension.width
                signatureUrl.height = signatureDimension.height
            } catch (e) {
                return reject(e)
            }
        }
        
        resolve(getSvg({
            width, height, fullname, number, date,
            shaderUrl, ssnUrl, tableUrl, signatureUrl
        }))
    })
}

const Doc: React.FC<Doc> 
    & {
        downloadSvg: (doc: Doc) => Promise<string>
    } 
    = ({ isLoading,
    id, width, height, fullname, number, date, 
    shaderUrl,
    ssnUrl,
    tableUrl,
    signatureUrl
}) => {
    
    const docWidth = useBreakpointValue(width) as any
    const docHeight = useBreakpointValue(height) as any

    const getResponsiveValue = (value: any) => {
        return typeof value === "object"? useBreakpointValue(value) : value
    }

    const shaderBase64Url = useBase64ImageLoader(getResponsiveValue(shaderUrl))
    const ssnBase64Url = useBase64ImageLoader(getResponsiveValue(ssnUrl))
    const tableBase64Url = useBase64ImageLoader(getResponsiveValue(tableUrl))

    const signatureDimension = useImageDimension(signatureUrl?.base64Url)
    
    return (
        <Box id="AirlineDocWrapper" pos="relative" w="100%">
            <Box w="100%" h="100%" dangerouslySetInnerHTML={{ 
                __html: getSvg({ 
                    width: docWidth, height: docHeight, fullname, number, date, 
                    shaderUrl: shaderBase64Url.base64Url,
                    ssnUrl: ssnBase64Url.base64Url,
                    tableUrl: tableBase64Url.base64Url,
                    signatureUrl: signatureDimension.userImage
                }) 
            }} />
            <HStack pos="absolute" top="0" left="0" right="0" bottom="0" zIndex="1"
            bg="#dfdfdf" opacity="0.7" justifyContent="flex-start" 
            pl={{base: "0px", md: "0px"}} alignItems="center"
            display={
                (isLoading || shaderBase64Url.loading || ssnBase64Url.loading || 
                tableBase64Url.loading)?
                "flex" : "none"
            }
                w="100%" h="100%">
                    <Loading 
                        type={Loading.TYPES.grid} 
                        color={useColorValue("colorAccent.light", "colorAccent.dark")} 
                        size="70px"
                    />
            </HStack>
            <VStack pos="absolute" top="0" left="0" right="0" bottom="0" zIndex="1"
            bg="#fff" opacity="0.7" justifyContent="center" 
            pl="1rem" 
            alignItems="flex-start"
            display={
                shaderBase64Url.error || ssnBase64Url.error || 
                tableBase64Url.error?
                "flex" : "none"
            }
                w="100%" h="100%">
                    {
                        shaderBase64Url.error? 
                        <ErrorView>{parseError(shaderBase64Url.error)}</ErrorView> 
                        : null
                    }
                    {
                        ssnBase64Url.error? 
                        <ErrorView>{parseError(ssnBase64Url.error)}</ErrorView> 
                        : null
                    }
                    {
                        tableBase64Url.error? 
                        <ErrorView>{parseError(tableBase64Url.error)}</ErrorView> 
                        : null
                    }
            </VStack>
        </Box>
    )
}

Doc.downloadSvg = downloadSvg

export default Doc