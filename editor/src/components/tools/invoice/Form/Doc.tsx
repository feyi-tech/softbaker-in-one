import useColorValue from "@/root/src/hooks/useColorValue"
import { numFormatDefault } from "@/root/src/utils/f"
import { 
    fileOrUrlToBase64, getValidImageUrl, useBase64ImageLoader, useImageColor, 
    useImageStamp, useResponsiveValue 
} from "@/root/src/hooks/useImageLoader"
import { Box, HStack, Text, useBreakpointValue, VStack } from "@chakra-ui/react"
import { FaExclamationTriangle } from "react-icons/fa"
import Loading from "../../../widgets/Loading"
import { getImageColor } from "@/root/src/utils/imageHelper"
import { getResponsiveX, getResponsiveY, translate, scale, pxToVw } from "../../toolsFunc"
import { 
    USE_DOMINANT_COLOR, NEW_LINE, 
    BASE_TEMPLATE_WIDTH, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS,
} from "./settings"
import { Timestamp } from "firebase/firestore"
import { joinTimeSegments, timestampToDate } from "@/root/src/utils/time"
import { InvoiceItem } from "../types"
import { getItemSum } from "./useItemSum"
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

//items,array:{description@string_2_32|qty@number_1_10000000000|price@number_1_10000000000},1,16,false,true,false

interface Doc {
    width: any,
    height: any,
    id?: string,
    companyName?: string | null, 
    companyAddress?: string | null,
    customerName?: string | null,
    customerAddress?: string | null,

    invoiceNumber?: string | null, 
    currency?: string | null, 
    vat?: number | null,
    items?: InvoiceItem[] | null, 
    date?: Timestamp | Date | null, 
    paymentDetails?: string | null,
    
    logoColor?: string | null, 
    logoUrl?: string | null, 
    waterMarkUrl?: ResponsiveValue | string | null,
    watermarkWithLogo: boolean,
    grayScaleWaterMark: boolean,
    isLoading?: boolean | null,
    [x: string]: any
}

const responsiveDY = (value: number, height: number) => {
    return value//getResponsiveY(value, height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)
}

function formatText(text: string, maxCharsPerLine: number): string[] {
    const paragraphs = text.split("\n\n"); // Split text into paragraphs

    const formattedLines: string[] = [];

    paragraphs.forEach((paragraph, index) => {
        const lines = paragraph.split(/\n+/); // Split paragraph into lines

        lines.forEach((line) => {
            let currentLine = '';
            const words = line.split(' ');

            words.forEach((word, wordIndex) => {
                // If the word exceeds the maxCharsPerLine, break it into chunks
                if (word.length > maxCharsPerLine) {
                    for (let i = 0; i < word.length; i += maxCharsPerLine) {
                        const chunk = word.substring(i, i + maxCharsPerLine);
                        formattedLines.push(currentLine + (currentLine ? ' ' : '') + chunk);
                        currentLine = '';
                    }
                } else {
                    // Calculate the combined length of current line and next word
                    const combinedLength = currentLine.length + word.length + (currentLine ? 1 : 0);

                    // If combined length exceeds maxCharsPerLine, start a new line
                    if (combinedLength > maxCharsPerLine) {
                        formattedLines.push(currentLine);
                        currentLine = '';
                    }

                    // Add word to current line
                    currentLine += (currentLine ? ' ' : '') + word;
                }
            });

            // Add the remaining line
            if (currentLine) {
                formattedLines.push(currentLine);
            }
        });

        // Add empty string to denote paragraph separation (except for the last paragraph)
        if (index < paragraphs.length - 1) {
            formattedLines.push("");
        }
    });

    return formattedLines;
}

const parseBody = (body: string, width: number, height: number, maxChars: number) => {
    const lines: string[] = formatText(body, maxChars)

    return lines.map((line, index) => {
      return line === ''
        ? ''
        : `<tspan x="0" dy="${index === 0 ? 0 : responsiveDY(lines[index - 1] === '' ? 84.7931 : 55.567, height)}">${line}</tspan>`;
    }).join('');
};


const responsiveText = (size: number, width: number, height: number) => {
    return `${size}px`//pxToVw(size, width, FRACTION_DIGITS)//getResponsiveY(pxToVw(size, width, FRACTION_DIGITS), height, BASE_TEMPLATE_HEIGHT, FRACTION_DIGITS)
}

const renderDescription = (item: InvoiceItem, index: number, maxChars: number) => {
    const description = item.description.trim();
    let firstPart, secondPart;
  
    if (description.length <= maxChars) {
      firstPart = description;
      secondPart = '';
    } else {
      // Split the description into words
      const words = description.split(' ');
      firstPart = '';
      secondPart = '';
  
      // Try to fit as many words into the first part as possible without exceeding 32 characters
      for (let word of words) {
        if ((firstPart + word).length <= maxChars) {
          firstPart += (firstPart ? ' ' : '') + word;
        } else {
          secondPart += (secondPart ? ' ' : '') + word;
        }
      }
    }
  
    // Ensure there is no second line if all words fit within the first 32 characters
    secondPart = secondPart.trim() ? secondPart : '';
  
    return `
      <text x="70" y="${430 + (index * 70) - 3}" font-size="15" font-family="Arial" fill="#333">
        ${escapeHtmlEntities(firstPart)}
      </text>
      ${secondPart ? `<text x="70" y="${430 + (index * 70) + 15}" font-size="15" font-family="Arial" fill="#333">
        ${escapeHtmlEntities(secondPart)}
      </text>` : ''}
    `;
};
  
  

const getCurrencySymbol = (currency?: string | null) => {
    return currency? currency.split("_")[2] : "$"
}
const getSvg = ({ 
    width, height,
    companyName, companyAddress, customerName, customerAddress,
    invoiceNumber, currency, vat, items, date, paymentDetails,
    logoColor, logoUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark
}: Doc): string => {

    const {
        calculatedSubTotal,
        calculatedVatValue,
        calculatedTotal
    } = getItemSum(items, vat)

    //width: 820, height: 1250
    return `<svg width="${BASE_TEMPLATE_WIDTH}" height="${BASE_TEMPLATE_HEIGHT}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style>
        .logo-watermark {
            opacity: 0.15;
            ${grayScaleWaterMark? "filter: grayscale(100%);" : ""}
        }
        .watermark {
            opacity: 0.5;
        }
        .text-end {
            text-anchor: end;
        }
        .bold { font-weight: 600; }
        .upper { text-transform: uppercase; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#ffffff" />
    ${
        waterMarkUrl?
        `<image id="watermark" width="${width}" height="${height}" class="watermark" xlink:href="${waterMarkUrl}"/>`
        : ""
    }

  <!-- Padding for Invoice Content -->
  <g transform="translate(20, 20)"> <!-- Adds 20px padding around the main content -->
    <!-- Header with Logo -->
    ${
        logoUrl?
        `<image id="logo" x="0" y="0" width="100" height="100" xlink:href="${logoUrl}"/> <!-- Placeholder for the logo -->` 
        : ""
    }
    <text x="120" y="60" font-size="24" class="bold upper" font-family="Arial" fill="#333">${escapeHtmlEntities(companyName) || "Enter Company Name"}</text>
    <text x="120" y="90" font-size="14" font-family="Arial" fill="#666">${escapeHtmlEntities(companyAddress) || "Enter Company Address"}</text>

    <!-- Yellow Horizontal Line -->
    <line x1="0" y1="130" x2="780" y2="130" stroke="${logoColor || "#ccc"}" stroke-width="5"/>

    <!-- Invoice Info -->
    <text x="580" y="30" font-size="24" font-family="Arial" fill="#333" class="bold upper">Invoice</text>
    <text x="580" y="60" font-size="18" font-family="Arial" fill="#666">${escapeHtmlEntities(invoiceNumber) || "#00000"}</text>
    <text x="580" y="90" font-size="18" font-family="Arial" fill="#666">Date: ${date? joinTimeSegments(timestampToDate(date), [{ year: 'numeric' }, { month: '2-digit' }, { day: '2-digit' }], "-") : "Set Invoice Date"}</text>

    <!-- Client Info -->
    <text x="0" y="180" font-size="20" font-family="Arial" fill="#333" class="bold upper">Bill To:</text>
    <text x="0" y="205" font-size="20" font-family="Arial" fill="#666">${escapeHtmlEntities(customerName) || "Enter Customer Name"}</text>
    <text x="0" y="225" font-size="14" font-family="Arial" fill="#666">${escapeHtmlEntities(customerAddress) || "Enter Customer Address"}</text>

    <!-- Table Header with Updated Colors -->
    <rect x="0" y="330" width="780" height="50" fill="${logoColor || "#ccc"}" /> <!-- table header -->
    <text x="20" y="360" font-size="18" font-family="Arial" fill="#fff">S/N</text>
    <text x="70" y="360" font-size="18" font-family="Arial" fill="#fff">Description</text>
    <text x="370" y="360" font-size="18" font-family="Arial" fill="#fff">Quantity</text>
    <text x="470" y="360" font-size="18" font-family="Arial" fill="#fff">Unit Price</text>
    <text x="630" y="360" font-size="18" font-family="Arial" fill="#fff">Total</text>
    <line x1="0" y1="380" x2="780" y2="380" stroke="#fff" />

    <!-- Table Rows -->
    ${
        (items && items.length > 0)
        ? `
        ${items.map((item: InvoiceItem, index: number) => {
            return `
            <text x="20" y="${430 + (index * 70)}" font-size="18" font-family="Arial" fill="#333">${index + 1}</text>
            ${renderDescription(item, index, 45)}
            <text x="390" y="${430 + (index * 70)}" font-size="18" font-family="Arial" fill="#333">${item.quantity}</text>
            <text x="470" y="${430 + (index * 70)}" font-size="18" font-family="Arial" fill="#333">${getCurrencySymbol(currency)}${numFormatDefault(item.price || 0, 2, 2)}</text>
            <text x="630" y="${430 + (index * 70)}" font-size="18" font-family="Arial" fill="#333">${getCurrencySymbol(currency)}${numFormatDefault((item.price || 0) * (item.quantity || 0), 2, 2)}</text>
            <line x1="0" y1="${460 + (index * 70)}" x2="780" y2="${460 + (index * 70)}" stroke="#ccc" />`;
        }).join('')}`
        : ''
    }

    <!-- Sub-Total, VAT, and Total -->
    <text x="520" y="${430 + ((items || []).length * 70) + 10}" font-size="18" font-family="Arial" fill="#333">Sub-Total:</text>
    <text class="text-end" x="740" y="${430 + ((items || []).length * 70) + 10}" font-size="18" font-family="Arial" fill="#333">${getCurrencySymbol(currency)}${numFormatDefault(calculatedSubTotal, 2, 2)}</text> <!-- Update as needed -->
    <line x1="520" y1="${460 + ((items || []).length * 70) + 10}" x2="780" y2="${460 + ((items || []).length * 70) + 10}" stroke="#ccc" />

    <text x="520" y="${460 + ((items || []).length * 70) + 10 + 30}" font-size="18" font-family="Arial" fill="#333">VAT (${vat || 0}%):</text>
    <text class="text-end" x="740" y="${460 + ((items || []).length * 70) + 10 + 30}" font-size="18" font-family="Arial" fill="#333">${getCurrencySymbol(currency)}${numFormatDefault(calculatedVatValue, 2, 2)}</text> <!-- Update as needed -->
    <line x1="520" y1="${460 + ((items || []).length * 70) + 10 + 50}" x2="780" y2="${460 + ((items || []).length * 70) + 10 + 50}" stroke="#ccc" />

    <text x="520" y="${460 + ((items || []).length * 70) + 10 + 80}" font-size="18" font-family="Arial" fill="#333">Total:</text>
    <text class="text-end" x="740" y="${460 + ((items || []).length * 70) + 10 + 80}" font-size="18" font-family="Arial" fill="#333">${getCurrencySymbol(currency)}${numFormatDefault(calculatedTotal, 2, 2)}</text> <!-- Update as needed -->
    <line x1="520" y1="${460 + ((items || []).length * 70) + 10 + 100}" x2="780" y2="${460 + ((items || []).length * 70) + 10 + 100}" stroke="#333" />

    <!-- Payment Details with Table-Matching Border and Balanced Padding -->
    ${
        (paymentDetails && paymentDetails.length > 0)
        ? `
        <text x="20" y="${460 + ((items || []).length * 70) + 10 + 100 + 62}" font-size="20" font-family="Arial" fill="#333" class="bold upper">Payment details below:</text>
        <rect x="0" y="${460 + ((items || []).length * 70) + 10 + 100 + 70}" width="780" height="${(paymentDetails.split(NEW_LINE).length * 30) + 20}" fill="none" stroke="${logoColor || "#ccc"}" stroke-width="2" /> <!-- Border matching table color and extending to full width -->
        ${paymentDetails.split(NEW_LINE).map((detail: string, index: number) => {
            return `<text x="20" y="${(460 + ((items || []).length * 70) + 10 + 100 + 100) + (30 * index)}" font-size="18" font-family="Arial" fill="#666">
            ${escapeHtmlEntities(detail)}
            </text>`;
        }).join('')}`
        : ''
    }
  </g>

  <!-- Watermark Logo in Center with Greyscale and Opacity -->
  ${logoUrl && watermarkWithLogo?
    `<g transform="translate(210, 450)"> <!-- Adjusted position for centering -->
        <image id="logo-watermark" width="400" height="400" class="logo-watermark" xlink:href="${logoUrl}"/>
    </g>` : ""
  }
</svg>
  `
}

const downloadSvg = ({ 
    width, height,
    companyName, companyAddress, customerName, customerAddress,
    invoiceNumber, currency, vat, items, date, paymentDetails,
    logoUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark
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
        if(waterMarkUrl) {
            try {
                waterMarkUrl = (await fileOrUrlToBase64(getValidImageUrl(waterMarkUrl as string) as string)) as string
            } catch (e) {
                return reject(e)
            }
        }
        
        resolve(getSvg({
            width, height,
            companyName, companyAddress, customerName, customerAddress,
            invoiceNumber, currency, vat, items, date, paymentDetails,
            logoColor: logoColor && logoColor.length > 2? `rgb(${logoColor[0]}, ${logoColor[1]}, ${logoColor[2]})` : null, 
            logoUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark
        }))
    })
}

const Doc: React.FC<Doc> 
    & {
        downloadSvg: (doc: Doc) => Promise<string>
    } 
    = ({ isLoading,
    id, width, height,
    companyName, companyAddress, customerName, customerAddress,
    invoiceNumber, paymentDetails, date, 
    logoUrl, waterMarkUrl, watermarkWithLogo, grayScaleWaterMark, currency, vat, items,
}) => {
    
    const docWidth = useBreakpointValue(width) as any
    const docHeight = useBreakpointValue(height) as any

    const logoColor = useImageColor(USE_DOMINANT_COLOR, logoUrl)
    
    const waterMark = useBase64ImageLoader(useResponsiveValue(waterMarkUrl).value)
    //console.log("waterMarkUrl: ", waterMarkUrl, waterMark)
    
    return (
        <Box id="AirlineDocWrapper" pos="relative" w="100%">
            <Box w="100%" h="100%" dangerouslySetInnerHTML={{ 
                __html: getSvg({ 
                    width: docWidth, height: docHeight, 
                    companyName, companyAddress, customerName, customerAddress, 
                    invoiceNumber, paymentDetails, date,
                    logoColor: logoColor.color && logoColor.color.length > 2? `rgb(${logoColor.color[0]}, ${logoColor.color[1]}, ${logoColor.color[2]})` : null, 
                    logoUrl, 
                    currency, vat, items,
                    waterMarkUrl: waterMark?.base64Url,
                    watermarkWithLogo, 
                    grayScaleWaterMark
                }) 
            }} />
            <HStack pos="absolute" top="0" left="0" right="0" bottom="0" zIndex="${getResponsiveX(1, width, BASE_TEMPLATE_WIDTH, FRACTION_DIGITS)}"
            bg="#dfdfdf" opacity="0.7" justifyContent="flex-start" 
            pl={{base: "0px", md: "0px"}} alignItems="center"
            display={
                (isLoading || logoColor.loading || waterMark.loading)?
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
                logoColor.error || waterMark.error?
                "flex" : "none"
            }
                w="100%" h="100%">
                    {
                        logoColor.error? 
                        <ErrorView>{parseError(logoColor.error)}</ErrorView> 
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