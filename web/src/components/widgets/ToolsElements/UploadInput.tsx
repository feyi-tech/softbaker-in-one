import { Box, FormControl, FormLabel, HStack, Image, ResponsiveValue, Text, useBreakpointValue } from "@chakra-ui/react"
import { useState } from "react"
import { FaList, FaPenAlt, FaUpload } from "react-icons/fa"
import { cropImage, isBlankImage } from "@/root/src/utils/imageHelper"
import InputBox from "../InputBox"
import UploadImage from "./UploadImage"
import InfoLabel from "../InfoLabel"
import AppButton from "../AppButton"
import CuteButton from "../CuteButton"
import { nullOrEmpty } from "@/root/src/utils/f"
import { ImageCropArg } from "./types"
import ImageCropper from "./ImageCropper"
import ImageBackgroundRemover from "./ImageBackgroundRemover"
import { resizeImage } from "@/root/src/utils/imageHelperTs"
import { base64UrlToFile } from "@/root/src/utils/base64Image"
import useLogger, { LOGGER_LOG_TYPES } from "../../tools/tool_viewer_data_stream/core/svg-processor/hooks/useLogger"


export interface UploadInput {
    title: string,
    galleryKey?: string,
    accept?: string | null,
    thumbnail?: string | null,
    onThumb?: (file?: File, base64Image?: string | null) => Promise<string | null>,
    onChange: (file?: File | null, base64Image?: string | null, thumbnail?: string | null, error?: Error | null) => void,
    disableCrop?: boolean,
    disabled?: boolean,
    info?: any,
    helperText?: string | null,
    errorMessage?: any | null, 
    message: string,
    hoverMessage: string,
    ruleMessage: string,
    useImageText: string,
    maxFileSize?: number,
    isOtherFiles?: boolean | null,
    showAsButton?: boolean | null,
    textTransform?: ResponsiveValue<any>, 
    labelEndIcon?: any,
    imageCropArg?: ImageCropArg,
    removeBackground?: boolean,
    format?: string | null,
    quality?: number | null,
    [x: string]: any
}
const UploadInput: React.FC<UploadInput> = ({ onThumb, accept, galleryKey,
    title, thumbnail, onChange, disableCrop, disabled, info, helperText, errorMessage, 
    message, hoverMessage, ruleMessage, useImageText, maxFileSize, isOtherFiles, showAsButton,
    textTransform, labelEndIcon, imageCropArg, removeBackground, format, quality,
    ...props 
}) => {
    
    const [ showSelector, setShowSelector ] = useState<boolean>(false)
    const [ showCropper, setShowCropper ] = useState<boolean>(false)
    const [ showBgRemover, setShowBgRemover ] = useState<boolean>(false)
    const [ processingSignature, setProcessingSignature ] = useState<boolean>(false)

    const [ imageFile, setImageFile ] = useState<File>()
    const [ imageData, setImageData ] = useState<string>()
    const [ imageThumb, setImageThumb ] = useState<string>()

    const { logger } = useLogger()
    
    const handleOnChange = (file?: File | null, image?: string | null, thumbnail?: string | null, error?: Error | null) => {
        //console.log("handleOnChange: ", "file: ", file, "image: ", image, "isOtherFiles: ", isOtherFiles)
        if(!image || !imageFile || isOtherFiles) {
            logger(`UploadInput.handleOnChange.empty`, LOGGER_LOG_TYPES.info)
            onChange(file, image, thumbnail, error)

        } else {
            setProcessingSignature(true)
            const fl = file? file : base64UrlToFile(image, imageFile.name, imageFile.type)
            resizeImage(fl, maxFileSize || fl.size, removeBackground? "image/png" : format, quality)
            .then(resizedImage => {
                setImageFile(resizedImage.file)
                setImageData(resizedImage.base64)
                onChange(resizedImage.file, resizedImage.base64, thumbnail)
                setProcessingSignature(false)
            })
            .catch((e: any) => {
                logger(`UploadInput.resizeImage.error:${e?.message}`, LOGGER_LOG_TYPES.error)
                onChange(null, null, null, e)
                setProcessingSignature(false)
            })
        }
    }
    const onImage = (file: File, image: string, thumbnail: string, error?: Error | null) => {
        setShowSelector(false)
        if(disableCrop || isOtherFiles) {
            handleOnChange(file, image, thumbnail)

        } else {
            setProcessingSignature(true)
        
            if(imageCropArg) {
                setImageFile(file)
                setImageData(image)
                setImageThumb(thumbnail)
                setShowCropper(true)

            } else if(removeBackground) {
                setImageFile(file)
                setImageData(image)
                setImageThumb(thumbnail)
                setShowBgRemover(true)

            } else {
                cropImage(image)
                .then(cropped => {
                    //console.log("onSignature:image ", image)
                    //console.log("onSignature:cropped ", cropped)
                    handleOnChange(file, cropped, thumbnail) //if cropped is the original, then it's a blank signature
                    setProcessingSignature(false)
                })
                .catch((e: any) => {
                    //console.log("onSignature:error ", e.message)
                    logger(`UploadInput.cropImage.error:${e?.message}`, LOGGER_LOG_TYPES.error)
                    setProcessingSignature(false)
                })
            }
        }
    }
    

    return (
      <Box {...props}>
        {
            showAsButton?
            <CuteButton status="success" onClick={(e: any) => { 
                e.preventDefault(); 
                if(!disabled && !processingSignature) {
                    setShowSelector(true)
                } 
            }}>
                { title }
            </CuteButton>
            :
            <>
                <FormControl opacity={processingSignature || disabled? 0.4 : 1} cursor={processingSignature || disabled? "not-allowed" : "pointer"}>
                    <HStack w="100%" justifyContent="space-between" alignItems="center">
                        {
                            !title || nullOrEmpty(info) || disabled?
                            <FormLabel textTransform={textTransform || "capitalize"} mb="0px">{title}</FormLabel>
                            :
                            <InfoLabel as={FormLabel} 
                                info={info} textTransform={textTransform || "capitalize"}>
                                {title}
                            </InfoLabel>
                        }
                        {
                            labelEndIcon? labelEndIcon : null
                        }
                    </HStack>
                    <HStack className="image-selector-button" onClick={(e: any) => { 
                        e.preventDefault(); 
                        if(!disabled && !processingSignature) {
                            setShowSelector(true)
                        } 
                    }}>
                        <Box width="auto" height="40px" bg="#dfdfdf">
                            {
                                !processingSignature && thumbnail? <Image src={thumbnail} width="auto" h="40px" objectFit="cover" /> : null
                            }
                        </Box>
                        <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" 
                        fontStyle={processingSignature? "italic" : "normal"}>
                            {processingSignature? "Please wait..." : thumbnail? "Click to change" : "Click to upload"}
                        </Text>
                    </HStack>
                </FormControl>
                <InputBox type={InputBox.TYPES.none} helperText={helperText} errorMessage={errorMessage} />
            </>
        }
        {
            showSelector?
            <UploadImage 
                galleryKey={galleryKey}
                title={title}
                message={message}
                onThumb={onThumb}
                hoverMessage={hoverMessage}
                ruleMessage={ruleMessage}
                useImageText={useImageText}
                maxFileSize={maxFileSize}
                onImage={(imageFile?: File | null, imageString?: string | null, thumbnail?: string | null, error?: Error | null) => {
                    onImage(imageFile as File, imageString as string, thumbnail as string, error)
                }} 
                onClose={() => {
                    setShowSelector(false)
                }} 
                isOtherFiles={isOtherFiles}
                accept={accept}
            />
            : null
        }

        {
            showCropper && imageData && imageCropArg?
            <ImageCropper
                image={imageData}
                imageFile={imageFile}
                imageCropArg={imageCropArg}
                onThumb={onThumb}
                onImage={(imageFile: File | null, imageString: string | null, thumbnail?: string | null, error?: Error | null) => {
                    if(imageFile) setImageFile(imageFile)
                    if(imageString) setImageData(imageString)
                    if(thumbnail) setImageThumb(thumbnail)
                    if(removeBackground && imageString) {
                        setShowCropper(false)
                        setShowBgRemover(true)

                    } else {
                        setProcessingSignature(false)
                        setShowCropper(false)
                        if(imageString) {
                            handleOnChange(imageFile as File, imageString as string, thumbnail as string)

                        } else if(error) {
                            handleOnChange(null, null, null, error)
                        }
                    }
                }}
            />
            : null
        }

        {
            showBgRemover && imageData && removeBackground?
            <ImageBackgroundRemover
                image={imageData}
                imageFile={imageFile}
                onThumb={onThumb}
                onImage={(imageFile?: File | null, imageString?: string | null, thumbnail?: string | null, error?: Error | null) => {
                    if(imageFile) setImageFile(imageFile)
                    if(imageString) setImageData(imageString)
                    if(thumbnail) setImageThumb(thumbnail)

                    setProcessingSignature(false)
                    setShowBgRemover(false)
                    if(imageString) {
                        handleOnChange(imageFile as File, imageString as string, thumbnail as string)

                    } else if(error) {
                        handleOnChange(null, null, null, error)
                    }
                }}
            />
            : null
        }

        <style jsx global>{
            `
            .image-selector-button {
                width: 100%;
                min-width: 0px;
                outline: 2px solid transparent;
                outline-offset: 2px;
                position: relative;
                -webkit-appearance: none;
                -moz-appearance: none;
                -ms-appearance: none;
                appearance: none;
                transition-property: var(--chakra-transition-property-common);
                transition-duration: var(--chakra-transition-duration-normal);
                font-size: var(--chakra-fontSizes-md);
                -webkit-padding-start: var(--chakra-space-4);
                padding-inline-start: var(--chakra-space-4);
                -webkit-padding-end: var(--chakra-space-10);
                padding-inline-end: var(--chakra-space-10);
                height: var(--chakra-sizes-10);
                border-radius: var(--chakra-radii-md);
                border: 1px solid;
                border-color: inherit;
                background: inherit;
            }`
        }</style>
      </Box>
    )
}

export default UploadInput
