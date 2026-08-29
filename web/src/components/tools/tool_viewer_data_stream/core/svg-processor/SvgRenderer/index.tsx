import Loading from "@/root/src/components/widgets/Loading"
import useColorValue from "@/root/src/hooks/useColorValue"
import { Box, HStack, Text, VStack, useBreakpointValue } from "@chakra-ui/react"
import { FaExclamationTriangle } from "react-icons/fa"
import { useEffect, useRef, useState } from "react"
import DocContainer from "@/root/src/components/widgets/ToolsElements/DocContainer"
import { FieldsData, FileMap, FilterArgs, FontsMap, MaskMap, Template, TemplateData, base64ToFile, getFileFieldFile, getImageDimension, getSvg as renderSvg, setR2Host, rotateTransformValue } from "softbaker-svg"
import { User } from "firebase/auth"
import axios from "axios"
import { resizeImage } from "@/root/src/utils/imageHelperTs"
import jsPDF from "jspdf"
import { FIREBASE_FUNCTION_API_BASE_URL, R2_DOMAIN } from "@/root/src/app-config"


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

const getCorsSafeTemplateAssetUrl = (storageHostname: string, url?: string | null) => {
    if (!url || url.startsWith("data:") || url.startsWith("/") || !url.startsWith("http")) return url;
    try {
        const parsedUrl = new URL(setR2Host(url, storageHostname));
        parsedUrl.searchParams.set("r2_cors", "1");
        return parsedUrl.toString();
    } catch {
        return url;
    }
}

const getCorsSafeTemplateData = (storageHostname: string, templateData: TemplateData): TemplateData => {
    const images: FileMap = {};
    Object.entries(templateData.images || {}).forEach(([key, value]) => {
        images[key] = getCorsSafeTemplateAssetUrl(storageHostname, value) || "";
    });
    const template = ((templateData as TemplateData & { template?: Partial<Template> }).template || {});

    return {
        ...templateData,
        template: {
            ...template,
            logo: getCorsSafeTemplateAssetUrl(storageHostname, template.logo),
        },
        images,
    };
};

const getSvg = (
    storageHostname: string,
    data: FieldsData,
    templateData: TemplateData,
    fonts?: FontsMap | null,
    showWatermark?: boolean | null,
    width?: number | "max" | null,
    tempMask?: MaskMap | null
) => renderSvg(storageHostname, data, getCorsSafeTemplateData(storageHostname, templateData), fonts, showWatermark, width, tempMask);

const jpgToPDF = async (image: string, filename: string, resolve: (result: string) => void, reject: (result: Error) => void) => {
    // Create a new jsPDF instance
    const size = await getImageDimension(image)
    const pdfDoc = new jsPDF({
      unit: 'px',
      format: [size.width, size.height], // Set PDF dimensions to match the image
    });
  
    // Add the image to the PDF
    pdfDoc.addImage(image, 'JPEG', 0, 0, size.width, size.height);
  
    pdfDoc.save(filename);
    resolve(image)
}

function convertBase64JpegToPng(base64Jpeg: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // needed if the image is from a different origin
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
  
        if (!ctx) {
          return reject(new Error("Failed to get canvas context"));
        }
  
        ctx.drawImage(img, 0, 0);
        const pngBase64 = canvas.toDataURL("image/png");
        resolve(pngBase64);
      };
  
      img.onerror = (err) => {
        reject(new Error("Failed to load JPEG image"));
      };
  
      img.src = base64Jpeg;
    });
}  

const getFilesMap = async (collectionName: string, id: string, data: FieldsData) => {
  const filesMap: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && /\.(faceshot|upload|sign)$/.test(value)) {
      const base64 = getFileFieldFile(collectionName, id, key);
      if (base64) {
        filesMap[key] = (await resizeImage(base64ToFile(key, base64) as File, 1024 * 200)).base64;
      }
    }
  }

  return filesMap;
};

const downloadSvgResultFromServer = (
    user: User,
    data: FieldsData,
    format: string,
    collectionName: string,
    fileName: string,
    selectedSide?: string | null,
    width?: number | null
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const files = await getFilesMap(collectionName, data.id, data);
        console.log("downloadSvgResultFromServer:", data, width, files);

        user.getIdToken().then((authToken) => {
            const host = FIREBASE_FUNCTION_API_BASE_URL; //"http://localhost:4001"; //

            axios.post(`${host}/download_svg_result`, {
                id: data.id,
                selectedSide,
                user_uploads: files
            }, {
                headers: {
                    Authorization: authToken,
                },
                responseType: 'arraybuffer' // <- critical to receive binary data
            })
            .then(async (response) => {
                const contentType = response.headers['content-type'] || 'image/jpeg';
                const base64 = btoa(
                    new Uint8Array(response.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                let base64DataUrl = `data:${contentType};base64,${base64}`;

                const fileFullname = selectedSide
                    ? `${selectedSide.toUpperCase()}_${fileName}.${format}`
                    : `${fileName}.${format}`;

                if (format === 'pdf') {
                    jpgToPDF(base64DataUrl, fileFullname, resolve, reject);

                } else {
                    if(format == "png") {
                        base64DataUrl = await convertBase64JpegToPng(base64DataUrl)
                    }

                    const downloadLink = document.createElement('a');
                    downloadLink.href = base64DataUrl;
                    downloadLink.download = fileFullname;
                    downloadLink.click();
                    resolve(base64DataUrl);
                }
                //console.log("Result:", base64DataUrl)
            })
            .catch((error: any) => {
                console.log("downloadSvgResultFromServer.post.error:", error?.message, error?.response?.data);
                reject(error?.response?.data || { error: error?.message });
            });
        });
    });
};


interface SvgRenderer { 
    fonts?: FontsMap | null,
    isLoading?: boolean | null
    data?: FieldsData | null
    templateData?: TemplateData | null
    showWatermark?: boolean | null
    width?: any
    onFiltersUpdated?: (filters: MaskMap | null) => void | null
    filterEnabled?: boolean
}

const SvgRenderer: React.FC<SvgRenderer> 
& {
    getSvg: (
        storageHostname: string,
        data: FieldsData, templateData: TemplateData, fonts?: FontsMap | null, showWatermark?: boolean | null, 
        width?: number | null, 
        tempMask?: MaskMap | null
    ) => Promise<string>,
    downloadSvgResultFromServer: (
        user: User, data: FieldsData, format: string, collectionName: string,
        fileName: string, selectedSide?: string | null, 
        width?: number | null
    ) => Promise<string>
} 
= ({ fonts, isLoading, data, templateData, showWatermark, width, onFiltersUpdated, filterEnabled }) => {
    const svgRef = useRef<HTMLDivElement>(null);

    const docWidth = useBreakpointValue(width || { base: 0 });

    const [svgString, setSvgString] = useState<string>();
    const [assetsLoading, setAssetsLoading] = useState<boolean>();
    const [assetsError, setAssetsError] = useState<string>();

    const [tempMask, setTempMask] = useState<MaskMap | null>(null);
    
    useEffect(() => {
        //console.log("fonts!!/svg ", svgString)
    }, [svgString])


    useEffect(() => {
        //console.info("fonts!!/data ", data)
        //console.info("fonts!!/data ", data, templateData)
        if (data && templateData) {
            setAssetsLoading(true);
            setAssetsError(undefined);
            try {
                getSvg(R2_DOMAIN, data, templateData, fonts, showWatermark, docWidth, tempMask)
                .then(svg => {
                    setAssetsLoading(false);
                    setSvgString(svg);
                })
                .catch((e: any) => {
                    setAssetsLoading(false);
                    setAssetsError(e.message);
                });
            } catch (e: any) {
                setAssetsLoading(false);
                setAssetsError(e.message);
            }

        } else if(!templateData) {
            setAssetsLoading(true)
            setSvgString("");
        }
    }, [data, templateData, showWatermark, docWidth, tempMask, fonts]);
    
    return (
        <DocContainer disableDrag={tempMask != null}
            width="100%" message="Drag around to view the whole tool"
            height={{ base: 500, md: 728, lg: 1024 }}>
            <Box id="AirlineDocWrapper" pos="relative" w="100%">
                {
                    !svgString ? null :
                        <Box ref={svgRef} w="100%" h="100%" dangerouslySetInnerHTML={{
                            __html: svgString
                        }} />
                }
                {
                    tempMask? null :
                    <>
                        <HStack pos="absolute" top="0" left="0" right="0" bottom="0" zIndex="1"
                            bg="#dfdfdf" opacity="0.7" justifyContent="flex-start"
                            pl={{ base: "0px", md: "0px" }} alignItems="center"
                            display={assetsLoading || isLoading ? "flex" : "none"}
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
                            display={assetsError ? "flex" : "none"}
                            w="100%" h="100%">
                            {
                                assetsError ? <ErrorView>{parseError(assetsError)}</ErrorView> : null
                            }
                        </VStack>
                    </>
                }
            </Box>
        </DocContainer>
    );
}

SvgRenderer.getSvg = getSvg
SvgRenderer.downloadSvgResultFromServer = downloadSvgResultFromServer

export default SvgRenderer
