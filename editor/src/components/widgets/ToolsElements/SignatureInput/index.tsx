import { Box, FormControl, FormLabel, HStack, Image, ResponsiveValue, Text, useBreakpointValue } from "@chakra-ui/react"
import { useState } from "react"
import ModalPop from "../../ModalPop"
import { FaList, FaPen, FaPenAlt, FaUpload } from "react-icons/fa"
import SelectSignature from "./SelectSignature"
import DrawSignature from "./DrawSignature"
import UploadImage from "../UploadImage"
import InputBox from "../../InputBox"
import { cropImage, isBlankImage } from "@/root/src/utils/imageHelper"
import InfoLabel from "../../InfoLabel"
import { nullOrEmpty } from "@/root/src/utils/f"
import { SignatureDrawerInput } from "../types"


export interface SelectorOptions {
    [x: string]: {
        id: string,
        title: string,
        downloadImage: string,
        thumbnail: string,
        image: {
            base?: string,
            md?: string,
            lg?: string,
            xl?: string
        },
        [x: string]: any,
        link?: string
    }
}
interface SelectorOption {
    icon: any,
    title: string,
    name?: string | null,
    [x: string]: any
}

const SelectorOption: React.FC<SelectorOption> = ({ icon, title, ...props }) => {
    
    return (
        <HStack cursor="pointer" justifyContent="flex-start" alignItems="flex-end" mb={4} {...props}>
            <HStack w="35px" h="35px" justifyContent="center" alignItems="center" borderRadius="5px" border="1px solid #dfdfdf">
                {icon}
            </HStack>
            <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{title}</Text>
        </HStack>
    )
}

interface SignatureInput extends SignatureDrawerInput {
    title: string,
    thumbnail?: string | null,
    onChange: (base64Image: string | null) => void,
    disabled?: boolean,
    info?: any,
    helperText?: string,
    errorMessage?: any,
    textTransform?: ResponsiveValue<any>, 
    labelEndIcon?: any,
    [x: string]: any
}
const SignatureInput: React.FC<SignatureInput> = ({ 
    title, thumbnail, onChange, disabled, errorMessage, 
    info, helperText, textTransform, labelEndIcon, 
    minSignatureWidth, maxSignatureWidth, 
    ...props 
}) => {
    
    const [ showSelector, setShowSelector ] = useState<boolean>(false)
    const [ processingSignature, setProcessingSignature ] = useState<boolean>(false)
    const [ option, setOption ] = useState<string | null>(null)
    const options = [
        {
            icon: <FaList />, title: "Select Signature", name: "select"
        },
        {
            icon: <FaPenAlt />, title: "Draw Signature", name: "draw"
        },
        {
            icon: <FaUpload />, title: "Upload Signature", name: "upload"
        }
    ]

    const onSignature = (image: string) => {
        setProcessingSignature(true)
        setShowSelector(false)
        setOption(null)
        
        isBlankImage(image)
        .then(isBlankImage => {
            //console.log("isBlank:image ", isBlankImage, image)
            if(isBlankImage) {
                onChange(null) //if cropped is the original, then it's a blank signature
                setProcessingSignature(false)

            } else {
                cropImage(image)
                .then(cropped => {
                    //console.log("onSignature:image ", image)
                    //console.log("onSignature:cropped ", cropped)
                    onChange(cropped) //if cropped is the original, then it's a blank signature
                    setProcessingSignature(false)
                })
                .catch((e: any) => {
                    //console.log("onSignature:error ", e.message)
                    setProcessingSignature(false)
                })
            }
        })
        .catch((e: any) => {
            //console.log("onSignature:error ", e.message)
            setProcessingSignature(false)
        })
    }

    return (
      <Box {...props}>
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
                    setOption(null)
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
                    {processingSignature? "Please wait..." : thumbnail? "Click to change" : "Click to sign"}
                </Text>
            </HStack>
        </FormControl>
        <InputBox type={InputBox.TYPES.none} helperText={helperText} errorMessage={errorMessage} />
        {
            !option?
            <ModalPop title={title} isOpen={showSelector} onClose={() => { setShowSelector(false) }}>
                <Text as="div" mb="1rem">Click one of the below signature options to provide a signature.</Text>
                {
                    (options || []).map((option, index) => (
                        <SelectorOption key={index} {...option} onClick={() => {
                            if(option.name) setOption(option.name)
                        }} />
                    ))
                }
            </ModalPop>
            :
            option == "select"?
            <SelectSignature onImage={(file, signature) => {
                onSignature(signature as string)
            }} onClose={() => {
                setOption(null)
            }} /> 
            :
            option == "draw"?
            <DrawSignature minSignatureWidth={minSignatureWidth} maxSignatureWidth={maxSignatureWidth}
            onImage={(file, signature) => {
                onSignature(signature as string)
            }} onClose={() => {
                setOption(null)
            }} /> 
            : 
            <UploadImage 
                title="Upload Signature"
                message="Drag and Drop Signature here"
                hoverMessage="Drop the Signature here"
                ruleMessage="Upload only transparent PNG image"
                useImageText="Use Signature"
                maxFileSize={1024 * 1024}
                onImage={(file, signature) => {
                    onSignature(signature as string)
                }} onClose={() => {
                    setOption(null)
                }} 
            />
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

export default SignatureInput