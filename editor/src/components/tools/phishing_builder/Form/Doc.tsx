import useColorValue from "@/root/src/hooks/useColorValue"
import { 
    fileOrUrlToBase64, getValidImageUrl, useBase64ImageLoader, useImageColor, 
    useImageStamp, useResponsiveValue 
} from "@/root/src/hooks/useImageLoader"
import { Box, HStack, Text, useBreakpointValue, VStack } from "@chakra-ui/react"
import { FaExclamationTriangle } from "react-icons/fa"
import Loading from "../../../widgets/Loading"
import { Signatory } from "../../index.types"
import { getImageColor, imageToStamp } from "@/root/src/utils/imageHelper"
import { getResponsiveX, getResponsiveY, translate, scale, pxToVw } from "../../toolsFunc"
import { 
    LOGO_STAMP_COLOR, LOGO_STAMP_HOLES_PCT, USE_DOMINANT_COLOR, NEW_LINE, 
    BASE_TEMPLATE_WIDTH, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS,
    SIGNATORY_MARGIN_BOTTOM,
    RECIPIENT_INFO_MARGIN_TOP,
    RECIPIENT_INFO_LINE_HEIGHT,
    RECIPIENT_INFO_MARGIN_BOTTOM,
    TITLE_MARGIN_BOTTOM, 
    BODY_MARGIN_BOTTOM
} from "./settings"

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

interface Doc {
    width: any,
    height: any,
    id?: string,
    signatories?: Signatory[] | null,
    companyName?: string | null, 
    title?: string | null, 
    senderInfo?: string | null, 
    recipientInfo?: string | null, 
    body?: string | null, 
    logoColor?: string | null, 
    logoUrl?: string | null, 
    stampLogoUrl?: string | null, 
    stampCircleUrl?: ResponsiveValue | string | null,
    paperTextureUrl?: ResponsiveValue | string | null, 
    approvedStampUrl?: ResponsiveValue | string | null, 
    waterMarkUrl?: ResponsiveValue | string | null,
    watermarkWithLogo: boolean,
    grayScaleWaterMark: boolean,
    stampLogo: boolean,
    stampApprove: boolean,
    hasPaperTexture: boolean,
    isLoading?: boolean | null,
    [x: string]: any
}

const responsiveDY = (value: number, height: number) => {
    return value//getResponsiveY(value, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)
}
const parseBody = (body: string, width: number, height: number) => {
    const lines = body.split("\n");
    return lines.map((line, index) => {
      return line === ''
        ? ''
        : `<tspan x="0" dy="${index === 0 ? 0 : responsiveDY(lines[index - 1] === '' ? 121.133 : 60.567, height)}">${line}</tspan>`;
    }).join('');
};  

const responsiveText = (size: number, width: number, height: number) => {
    return `${size}px`//pxToVw(size, width, FRACTION_DIGITS)//getResponsiveY(pxToVw(size, width, FRACTION_DIGITS), height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)
}

const getSvg = ({ 
    width, height, signatories,
    companyName, title, senderInfo, recipientInfo, body, 
    logoColor, logoUrl, stampLogoUrl, stampCircleUrl,
    paperTextureUrl, approvedStampUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark,
    stampLogo, stampApprove, hasPaperTexture
}: Doc): string => {

    const recipientInfoSize = () => (recipientInfo || "").split(NEW_LINE).length
    /*555.566*/
    const titleMarginTop = () => RECIPIENT_INFO_MARGIN_TOP + (recipientInfoSize() * RECIPIENT_INFO_LINE_HEIGHT) + RECIPIENT_INFO_MARGIN_BOTTOM
    
    const bodyY = titleMarginTop() + TITLE_MARGIN_BOTTOM
    const signatoryY = bodyY + BODY_MARGIN_BOTTOM

    return `<svg id="PAPER" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 1024 1448">
    <defs>
      <style>
        .cls-1, .cls-2, .cls-4, .cls-5 {
          mix-blend-mode: multiply;
        }
  
        .cls-2 {
            opacity: 0.15;
            ${grayScaleWaterMark? "filter: grayscale(100%);" : ""}
        }
  
        .cls-3 {
          font-size: ${responsiveText(41.667, width, height)};
          fill: #676767;
        }
  
        .cls-3, .cls-9 {
          text-anchor: middle;
        }
  
        .cls-11, .cls-12, .cls-13, .cls-14, .cls-15, .cls-3, .cls-6, .cls-8, .cls-9 {
          font-family: Arial;
        }
  
        .cls-4 {
          fill: ${logoColor || "rgb(127, 127, 127)"};
        }
  
        .cls-4, .cls-7 {
          fill-rule: evenodd;
        }
  
        .cls-5 {
          opacity: 0.8;
        }
  
        .cls-6 {
          font-size: ${responsiveText(50.594, width, height)};
        }
  
        .cls-11, .cls-12, .cls-13, .cls-14, .cls-15, .cls-6, .cls-8, .cls-9 {
          fill: #030303;
        }
  
        .cls-7 {
          fill: #6d6d6d;
          stroke: #000;
          stroke-width: 1.72px;
        }
  
        .cls-10, .cls-12, .cls-8 {
          font-size: ${responsiveText(50.472, width, height)};
        }
  
        .cls-9 {
          font-size: ${responsiveText(66.667, width, height)};
        }
  
        .cls-12, .cls-13, .cls-15, .cls-9 {
          font-weight: 700;
        }
        .cls-11 {
            font-weight: 500;
          }
  
        .cls-15, .cls-9 {
          text-decoration: underline;
        }
  
        .cls-12, .cls-13, .cls-9 {
          text-transform: uppercase;
        }
  
        .cls-14 {
          font-size: ${responsiveText(61.041, width, height)};
        }
  
        .cls-14, .cls-15 {
          text-anchor: end;
        }
  
        .cls-15 {
          font-size: ${responsiveText(32.949, width, height)};
        }
        .paper {
            fill: #fff;
        }
        .watermark {
            opacity: 0.5;
        }
      </style>
    </defs>
    <rect id="Background" width="${width}" height="${height}" class="paper"/>
    ${
        paperTextureUrl && hasPaperTexture?
        `<image id="Paper_Texture" data-name="Paper Texture" class="cls-1" width="${width}" height="${height}" xlink:href="${paperTextureUrl}"/>`
        : ""
    }
    ${
        waterMarkUrl?
        `<image id="watermark" width="${width}" height="${height}" class="watermark" xlink:href="${waterMarkUrl}"/>`
        : ""
    }
    ${
        watermarkWithLogo && logoUrl?
        `<image id="logo_WaterMark" data-name="logo WaterMark" class="cls-2" 
            x="${getResponsiveX(266, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" y="${getResponsiveY(517, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" width="${getResponsiveX(505, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" height="${getResponsiveY(471, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" xlink:href="${logoUrl}"/>`
        : ""
    }
    ${
        logoUrl?
        `<image id="logo" class="cls-5" x="${getResponsiveX(69, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" y="${getResponsiveY(40, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" width="${getResponsiveX(116, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" height="${getResponsiveY(108, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" xlink:href="${logoUrl}"/>`
        : ""
    }
    <text id="SAMPLE_COMPAY_NAME" data-name="SAMPLE COMPAY NAME" class="cls-3" transform="${translate(511.839, 1403.89, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)} ${scale(0.413, 0.413, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}"><tspan x="${getResponsiveX(0, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}">${companyName}</tspan></text>
    ${
        senderInfo && senderInfo.length > 0
        ? `<text id="senderInfo" data-name="senderInfo" class="cls-14" transform="${translate(
            954.112,
            116.139,
            width,
            BASE_TEMPLATE_WIDTH,
            height,
            BASE_TEMPLATE_HEIGHT
        )} ${scale(0.342, 0.341, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}">
            ${senderInfo.split(NEW_LINE).map((info: string, index: number) => {
                return `<tspan id="sender_info_${index}" x="${getResponsiveX(
                    0,
                    width,
                    BASE_TEMPLATE_WIDTH,
                    FRACTION_DIGITS
                )}" dy="${index == 0 ? '0' : responsiveDY(73.249, height)}">${info}</tspan>`;
            }).join('')}
        </text>`
        : ''
    }
    <path class="cls-4" d="M0,${getResponsiveY(1371.22, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}H${getResponsiveX(1024, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}v${getResponsiveY(7.02, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}H0v${getResponsiveY(-7.02, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}Z" />
    ${
        recipientInfo && recipientInfo.length > 0
        ? `<text id="recipientInfo" data-name="recipientInfo" class="cls-10" transform="${translate(
            71.344,
            RECIPIENT_INFO_MARGIN_TOP,
            width,
            BASE_TEMPLATE_WIDTH,
            height,
            BASE_TEMPLATE_HEIGHT
        )} ${scale(0.413, 0.413, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}">
            ${recipientInfo.split(NEW_LINE).map((info: string, index: number) => {
                return `<tspan id="recipient_info_${index}" class="cls-11" x="${getResponsiveX(
                    0,
                    width,
                    BASE_TEMPLATE_WIDTH,
                    FRACTION_DIGITS
                )}" dy="${index == 0 ? '0' : responsiveDY(60.567, height)}">${info}</tspan>`;
            }).join('')}
        </text>`
        : ''
    }
    <text id="TITTLE" class="cls-9" 
        transform="${translate(507.355, titleMarginTop(), width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)} ${scale(0.413, 0.413, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}">
        <tspan x="${getResponsiveX(0, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}">${title}</tspan>
    </text>
    <text id="BODY-2" data-name="BODY" class="cls-8" transform="${translate(70.274, bodyY/*629.243*/, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)} ${scale(0.413, 0.413, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}">
        ${body? parseBody(body, width, height) : ""}
    </text>
    ${
        signatories && signatories.length > 0?
        `${signatories.map((signatory, index) => {
            return `
            ${signatory.base64Url? `<image id="image" 
            x="${getResponsiveX(71, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" 
            y="${getResponsiveY(signatoryY/*1004*/ + (index * SIGNATORY_MARGIN_BOTTOM), height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" 
            width="${getResponsiveX(200, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" 
            height="${getResponsiveY(100, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" xlink:href="${signatory.base64Url}" />` : ''}
            
            
            <path id="signatory_${index}_line" data-name="signatory_${index}_line" class="cls-7" 
            d="M${getResponsiveX(71.806, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)},${getResponsiveY(signatoryY + 69.62/*1073.62*/ + (index * SIGNATORY_MARGIN_BOTTOM), height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}H${getResponsiveY(359.639, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}"/>

            <g id="signatory_${index}">
                <text id="signatory_${index}_title" data-name="signatory_${index}_title" class="cls-6" 
                transform="${translate(70.606, signatoryY + 100.081/*1104.081*/ + (index * SIGNATORY_MARGIN_BOTTOM), width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)} ${scale(0.413, 0.412, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}">
                    ${signatory.name}${signatory.title && signatory.title.length > 0 ? `(${signatory.title})` : ''}
                </text>
            </g>`;
        }).join('')}`
        : ''
    }
    ${
        stampCircleUrl && stampLogoUrl && stampLogo?
        `<g id="Stamp-2" data-name="Stamp">
            <image id="circle" class="cls-1" width="${width}" height="${height}" xlink:href="${stampCircleUrl}"/>
            <image id="logo_copy_2" data-name="logo copy 2" class="cls-5" 
            x="${getResponsiveX(598, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" 
            y="${getResponsiveY(1191, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" 
            width="${getResponsiveX(66, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}" 
            height="${getResponsiveY(61, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}" xlink:href="${stampLogoUrl}"/>
        </g>`
        : ""
    }
    ${
        approvedStampUrl && stampApprove?
        `<image id="Approved" class="cls-1" width="${width}" height="${height}" xlink:href="${approvedStampUrl}"/>`
        : ""
    }
    <path class="cls-4" d="M0,${getResponsiveY(184.921, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}H${getResponsiveX(1024, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}v${getResponsiveY(15.273, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}H0V${getResponsiveY(184.921, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)}Z"/>
    <text id="COMPAY_NAME" data-name="COMPAY NAME" class="cls-15" transform="${translate(955.163, 70.309, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)} ${scale(1.157, 1.148, width, BASE_TEMPLATE_WIDTH, height, BASE_TEMPLATE_HEIGHT)}">
        <tspan x="${getResponsiveX(0, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}">${companyName}</tspan>
    </text>
  </svg>
  `
}

const downloadSvg = ({ 
    width, height, signatories,
    companyName, title, senderInfo, recipientInfo, body, 
    logoUrl, stampLogoUrl, stampCircleUrl,
    paperTextureUrl, approvedStampUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark,
    stampLogo,
    stampApprove,
    hasPaperTexture,
}: Doc): Promise<string> => {

    return new Promise(async (resolve, reject) => {
        var logoColor
        try {
            logoColor = (await getImageColor(logoUrl, USE_DOMINANT_COLOR))
        } catch (e) {
            return reject(e)
        }
        try {
            logoUrl = (await fileOrUrlToBase64(getValidImageUrl(logoUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        try {
            stampLogoUrl = (await imageToStamp(logoUrl, LOGO_STAMP_COLOR, LOGO_STAMP_HOLES_PCT)) as string
        } catch (e) {
            return reject(e)
        }
        try {
            stampCircleUrl = (await fileOrUrlToBase64(getValidImageUrl(stampCircleUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        try {
            paperTextureUrl = (await fileOrUrlToBase64(getValidImageUrl(paperTextureUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        try {
            approvedStampUrl = (await fileOrUrlToBase64(getValidImageUrl(approvedStampUrl as string) as string)) as string
        } catch (e) {
            return reject(e)
        }
        if(waterMarkUrl) {
            try {
                waterMarkUrl = (await fileOrUrlToBase64(getValidImageUrl(waterMarkUrl as string) as string)) as string
            } catch (e) {
                return reject(e)
            }
        }
        
        resolve(getSvg({
            width, height, signatories,
            companyName, title, senderInfo, recipientInfo, body, 
            logoColor: logoColor && logoColor.length > 2? `rgb(${logoColor[0]}, ${logoColor[1]}, ${logoColor[2]})` : null, 
            logoUrl, stampLogoUrl, stampCircleUrl,
            paperTextureUrl, approvedStampUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark,
            stampLogo,
            stampApprove,
            hasPaperTexture
        }))
    })
}

const Doc: React.FC<Doc> 
    & {
        downloadSvg: (doc: Doc) => Promise<string>
    } 
    = ({ isLoading,
    id, width, height, signatories,
    companyName, title, senderInfo, recipientInfo, body, 
    logoUrl, stampCircleUrl,
    paperTextureUrl, approvedStampUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark,
    stampLogo,
    stampApprove,
    hasPaperTexture
}) => {
    
    const docWidth = useBreakpointValue(width) as any
    const docHeight = useBreakpointValue(height) as any

    const logoColor = useImageColor(USE_DOMINANT_COLOR, logoUrl)
    const stampLogoUrl = useImageStamp(LOGO_STAMP_COLOR, LOGO_STAMP_HOLES_PCT, logoUrl)

    const stampCircle = useBase64ImageLoader(useResponsiveValue(stampCircleUrl).value)
    const paperTexture = useBase64ImageLoader(useResponsiveValue(paperTextureUrl).value)
    const approvedStamp = useBase64ImageLoader(useResponsiveValue(approvedStampUrl).value)
    const waterMark = useBase64ImageLoader(useResponsiveValue(waterMarkUrl).value)
    
    return (
        <Box id="AirlineDocWrapper" pos="relative" w="100%">
            <Box w="100%" h="100%" dangerouslySetInnerHTML={{ 
                __html: getSvg({ 
                    width: docWidth, height: docHeight, 
                    signatories,
                    companyName, title, senderInfo, recipientInfo, body, 
                    logoColor: logoColor.color && logoColor.color.length > 2? `rgb(${logoColor.color[0]}, ${logoColor.color[1]}, ${logoColor.color[2]})` : null, 
                    logoUrl, stampLogoUrl: stampLogoUrl.stamp, 
                    stampCircleUrl: stampCircle.base64Url,
                    paperTextureUrl: paperTexture.base64Url, 
                    approvedStampUrl: approvedStamp.base64Url, 
                    waterMarkUrl: waterMark.base64Url,
                    watermarkWithLogo, 
                    grayScaleWaterMark,
                    stampLogo,
                    stampApprove,
                    hasPaperTexture,
                }) 
            }} />
            <HStack pos="absolute" top="0" left="0" right="0" bottom="0" zIndex="${getResponsiveX(1, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}"
            bg="#dfdfdf" opacity="0.7" justifyContent="flex-start" 
            pl={{base: "0px", md: "0px"}} alignItems="center"
            display={
                (isLoading || logoColor.loading || stampLogoUrl.loading || 
                stampCircle.loading || paperTexture.loading || approvedStamp.loading || waterMark.loading)?
                "flex" : "none"
            }
                w="100%" h="100%">
                    <Loading 
                        type={Loading.TYPES.grid} 
                        color={useColorValue("colorAccent.light", "colorAccent.dark")} 
                        size="70px"
                    />
            </HStack>
            <VStack pos="absolute" top="0" left="0" right="0" bottom="0" zIndex="${getResponsiveX(1, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}"
            bg="#fff" opacity="0.7" justifyContent="center" 
            pl="1rem" 
            alignItems="flex-start"
            display={
                logoColor.error || stampLogoUrl.error || 
                stampCircle.error || paperTexture.error || approvedStamp.error || waterMark.error?
                "flex" : "none"
            }
                w="100%" h="100%">
                    {
                        logoColor.error? 
                        <ErrorView>{parseError(logoColor.error)}</ErrorView> 
                        : null
                    }
                    {
                        stampLogoUrl.error? 
                        <ErrorView>{parseError(stampLogoUrl.error)}</ErrorView> 
                        : null
                    }
                    {
                        stampCircle.error? 
                        <ErrorView>{parseError(stampCircle.error)}</ErrorView> 
                        : null
                    }
                    {
                        paperTexture.error? 
                        <ErrorView>{parseError(paperTexture.error)}</ErrorView> 
                        : null
                    }
                    {
                        approvedStamp.error? 
                        <ErrorView>{parseError(approvedStamp.error)}</ErrorView> 
                        : null
                    }
                    {
                        waterMark.error? 
                        <ErrorView>{parseError(waterMark.error)}</ErrorView> 
                        : null
                    }
            </VStack>
        </Box>
    )
}

Doc.downloadSvg = downloadSvg

export default Doc