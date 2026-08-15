import { Box, Text, Image, HStack, FormControl, FormLabel, useBreakpointValue, ResponsiveValue, FormHelperText } from "@chakra-ui/react"
import { useState } from "react"
import ModalPop from "../ModalPop"
import { nullOrEmpty } from "@/root/src/utils/f"
import InfoLabel from "../InfoLabel"

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
    thumbnail: string,
    image: {
        base?: string,
        md?: string,
        lg?: string,
        xl?: string
    },
    title: string,
    id: string,
    [x: string]: any
}

const SelectorOption: React.FC<SelectorOption> = ({ id, link, downloadImage, title, image, thumbnail,  ...props }) => {
    return (
        <HStack cursor="pointer" justifyContent="flex-start" alignItems="flex-end" mb={4} {...props}>
            <Box as="image" w="40px" h="40px"
                backgroundColor="#dfdfdf"
                style={{
                    backgroundImage: `url(${thumbnail})`
                }}
                backgroundRepeat="no-repeat" 
                backgroundSize="cover"
            />
            <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{title}</Text>
        </HStack>
    )
}

interface ImageSelector {
    title: string,
    options: SelectorOption[],
    thumbnail: string,
    image?: {
        base?: string,
        md?: string,
        lg?: string,
        xl?: string
    },
    imageTitle?: string,
    onChange: (option: SelectorOption) => void,
    disabled?: boolean,
    helperText?: any, 
    info?: any, 
    textTransform?: ResponsiveValue<any>, 
    labelEndIcon?: any,
    [x: string]: any
}
const ImageSelector: React.FC<ImageSelector> = ({ title, helperText, info, textTransform, labelEndIcon, image, thumbnail, imageTitle, options, onChange, disabled, ...props }) => {
    
    const [ showSelector, setShowSelector ] = useState<boolean>(false)

    return (
      <Box {...props}>
        <FormControl opacity={disabled? 0.4 : 1} cursor={disabled? "not-allowed" : "pointer"}>
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
                if(!disabled) setShowSelector(true) 
            }}>
                <Box width="auto" height="40px" maxWidth="50px" bg="#dfdfdf">
                    {thumbnail? <Image src={thumbnail} width="auto" h="40px" objectFit="cover" /> : null}
                </Box>
                <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {imageTitle}
                </Text>
            </HStack>
            {
                nullOrEmpty(helperText) || disabled? null : 
                <FormHelperText>{helperText}</FormHelperText>
            }
        </FormControl>
        <ModalPop title={title} isOpen={showSelector} onClose={() => { setShowSelector(false) }} overflowY="auto">
            {
                (options || []).map((option, index) => (
                    <SelectorOption key={index} {...option} onClick={() => {
                        onChange(option)
                        setShowSelector(false)
                    }} />
                ))
            }
        </ModalPop>
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

export default ImageSelector