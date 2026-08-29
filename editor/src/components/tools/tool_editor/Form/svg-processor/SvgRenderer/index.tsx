import Loading from "@/root/src/components/widgets/Loading"
import useColorValue from "@/root/src/hooks/useColorValue"
import { Box, HStack, Text, VStack, useBreakpointValue } from "@chakra-ui/react"
import { FaExclamationTriangle } from "react-icons/fa"
import { useEffect, useRef, useState } from "react"
import { FiltersInput, OccludedImage, OccludedImagesInput } from "./filters-renderer"
import DocContainer from "@/root/src/components/widgets/ToolsElements/DocContainer"
import { FieldsData, FileMap, FilterArgs, FontsMap, MaskMap, TemplateData, base64ToFile, getFileFieldFile, getImageDimension, getSvg as renderSvg, rotateTransformValue, setR2Host } from "frontbacked-svg"
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

const getCorsSafeR2AssetUrl = (storageHostname: string, url: string) => {
    if (!url || url.startsWith("data:") || url.startsWith("/")) return url;

    try {
        const parsedUrl = new URL(setR2Host(url, storageHostname));
        if (parsedUrl.hostname !== storageHostname) return url;

        parsedUrl.searchParams.set("r2_cors", "1");
        return parsedUrl.toString();
    } catch {
        return url;
    }
}

const getCorsSafeTemplateData = (storageHostname: string, templateData: TemplateData): TemplateData => {
    const images = Object.entries(templateData.images || {}).reduce<FileMap>((result, [key, url]) => {
        result[key] = getCorsSafeR2AssetUrl(storageHostname, url);
        return result;
    }, {});

    return {
        ...templateData,
        images
    };
}

const getSvg = (
    storageHostname: string,
    data: FieldsData,
    templateData: TemplateData,
    fonts?: FontsMap | null,
    showWatermark?: boolean | null,
    width?: number | null,
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
            getSvg(R2_DOMAIN, data, templateData, fonts, showWatermark, docWidth, tempMask)
            .then(svg => {
                setAssetsLoading(false);
                setSvgString(svg);
            })
            .catch((e: any) => {
                setAssetsLoading(false);
                setAssetsError(e.message);
            });

        } else if(!templateData) {
            setAssetsLoading(true)
            setSvgString("");
        }
    }, [data, templateData, showWatermark, docWidth, tempMask, fonts]);
    
    const [filterElementId, setFilterElementId] = useState<string | null>();
    const [filterImage, setFilterImage] = useState<string | null>();
    const [filter, setFilter] = useState<string | null>();
    const [filterArgs, setFilterArgs] = useState<FilterArgs | null>();

    const [occludedElements, setOccludedElements] = useState<OccludedImage[]>();

    const handleSvgElementClick = (id: any, image?: string | null) => {
        if(filterEnabled) {
            if(!id.includes(",")) {
                setFilterElementId(id);
                setFilterImage(image);
                if (id && templateData && templateData.masks && templateData.masks[id] && templateData.masks[id].args) {
                    setFilterArgs(templateData.masks[id].args);
                }

            } else {
                const occludedImagesIdList = id.split(",")
                const occludedImages = []
                for(var i = 0; i < occludedImagesIdList.length; i++) {
                    const occludedImageId = occludedImagesIdList[i]
                    if(i == 0) {
                        occludedImages.push({
                            id: occludedImageId,
                            image
                        })

                    } else {
                        const occludedImageEl = document.getElementById(occludedImageId);
                        if(occludedImageEl) {
                            const fieldImage = occludedImageEl.getAttribute('xlink:href');
                            occludedImages.push({
                                id: occludedImageId,
                                image: fieldImage
                            })
                        }
                    }
                }
                setOccludedElements(occludedImages)
            }
        }
    };

    const close = (reset: boolean) => {
        setFilterElementId(null);
        setFilter(null);
        setFilterArgs(null);
        setFilterImage(null);
    };

    const handleClick = (event: any) => {
        const target = event.target;
        if (target) {
            if (target.hasAttribute('data-click-element-id') && !tempMask) {
                const id = target.getAttribute('data-click-element-id');
                const fieldImage = target.getAttribute('xlink:href');

                handleSvgElementClick(id, fieldImage);

            } else if (["softbaker-button-background", "softbaker-button-text"].includes(target.getAttribute("id"))) {
                if (onFiltersUpdated && tempMask) {
                    const image: SVGRectElement | null = document.querySelector(`[data-svg-id='${Object.keys(tempMask)[0]}']`) as (SVGRectElement | null)
                    if(!image) return
                    
                    const degreeText = image.getAttribute("data-degree")

                    if(degreeText != undefined) {
                        const degree = Number(degreeText)
                        const elementFilters = ((templateData?.masks || {})[Object.keys(tempMask)[0]] || {})
                        const newMasks = {
                            ...elementFilters,
                            ImageTransform: {
                                filter_id: elementFilters?.ImageTransform?.filter_id || "",
                                args: {
                                    ...(elementFilters?.ImageTransform?.args || {}),
                                    rotationAngle: degree
                                }
                            } 
                        };
                        onFiltersUpdated({
                            ...(templateData?.masks || {}),
                            [Object.keys(tempMask)[0]]: newMasks
                        })
                    }
                    setTempMask(null);
                }

            } else if (["softbaker-cancel-background", "softbaker-cancel-text"].includes(target.getAttribute("id"))) {
                setTempMask(null);
            }

        }
    };

    const handleMouseDown = (event: any) => {
        const target = event.target;
        if (target.getAttribute("id") === "softbaker-slider-handle") {
            target.setAttribute("data-rotating", "1")
        }
    };

    const handleMouseUp = () => {
        const target = document.getElementById("softbaker-slider-handle")
        if(target) target.setAttribute("data-rotating", "0")
    };

    const handleMouseMove = (event: any) => {
        const sliderTrack: SVGRectElement | null = document.getElementById("softbaker-slider-track") as (SVGRectElement | null);
        if (sliderTrack && tempMask && event.target.getAttribute("id") === "softbaker-slider-handle") {
            const rotateValue = event.target.getAttribute("data-rotating")
            const isRotatingImage = rotateValue === "1"? true : false
            if(!isRotatingImage) return

            const rect = sliderTrack.getBoundingClientRect();
            const svgRect = sliderTrack.getBBox();
            const newX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
            event.target.setAttribute("cx", `${svgRect.x + newX}`);

            
            const degree = (newX / rect.width) * 360;
            //console.info("parsedSvg.degree", degree, Object.keys(tempMask)[0])
            if(Object.keys(tempMask)[0]) {
                const image: SVGRectElement | null = document.querySelector(`[data-svg-id='${Object.keys(tempMask)[0]}']`) as (SVGRectElement | null)
                //console.info("parsedSvg.degree.2", image)
                if(!image) return
                const x = parseFloat(image.getAttribute("x") as any || 0);
                const y = parseFloat(image.getAttribute("y") as any || 0);
                const width = parseFloat(image.getAttribute("width") as any || 0);
                const height = parseFloat(image.getAttribute("height") as any || 0);
                //console.info("parsedSvg.degree.4", x, y, width, height)

                const transformValue = rotateTransformValue(
                    degree,
                    x, y, width, height
                )
                image.setAttribute('transform', transformValue)
                image.setAttribute("data-degree", `${degree}`)
            }
        }
    };

    useEffect(() => {
        const svgElement = svgRef.current;
        if (svgElement) {
            svgElement.addEventListener('click', handleClick);
            svgElement.addEventListener('mousedown', handleMouseDown);
            svgElement.addEventListener('mouseup', handleMouseUp);
            svgElement.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (svgElement) {
                svgElement.removeEventListener('click', handleClick);
                svgElement.removeEventListener('mousedown', handleMouseDown);
                svgElement.removeEventListener('mouseup', handleMouseUp);
                svgElement.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [svgString, templateData, data, tempMask, filterEnabled]);

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
                {
                    occludedElements?
                    <OccludedImagesInput images={occludedElements} 
                    onClose={() => {
                        setOccludedElements(undefined)
                    }} 
                    onSelected={(occludedImage: OccludedImage) => {
                        setFilterElementId(occludedImage.id);
                        setFilterImage(occludedImage.image);
                        if (occludedImage.id && templateData?.masks && templateData?.masks[occludedImage.id]) {
                            //setFilterArgs(templateData.masks[occludedImage.id].args);
                        }
                        setOccludedElements(undefined)
                    }} />
                    :
                    filterElementId && onFiltersUpdated ?
                    <FiltersInput 
                        filterElementId={filterElementId}
                        title={`${filterElementId || ""} filter`} 
                        filters={(templateData?.masks || {})[filterElementId] || {}} 
                        isOpen={true} 
                        onClose={() => {
                            close(true)
                        }}
                        onComplete={newFilters => {
                            onFiltersUpdated({
                                ...(templateData?.masks || {}),
                                [filterElementId]: newFilters
                            })
                        }}
                        onShowSvgArgsInput={(elementId, mask) => {
                            setTempMask({
                                [elementId]: {
                                    [mask.filter_id]: mask
                                }
                            })
                            close(true)
                        }}
                    />
                    : null
                }
            </Box>
        </DocContainer>
    );
}

SvgRenderer.getSvg = getSvg
SvgRenderer.downloadSvgResultFromServer = downloadSvgResultFromServer

export default SvgRenderer
