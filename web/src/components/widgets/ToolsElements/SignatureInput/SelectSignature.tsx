import { Box, HStack, Image, Text } from "@chakra-ui/react"
import ModalPop from "../../ModalPop"
import { SIGNATURES } from "@/root/src/app-config"
import useColorValue from "@/root/src/hooks/useColorValue"
import { useState } from "react"
import { ImageInputStrategy } from "../types"
import CuteButton from "../../CuteButton"
import InputBox from "../../InputBox"
import { fileOrUrlToBase64 } from "@/root/src/hooks/useImageLoader"


interface SelectorOption {
    image: string | null,
    selected: boolean,
    onClick: () => void,
    [x: string]: any
}

const SelectorOption: React.FC<SelectorOption> = ({ image, selected, onClick, ...props }) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [loadError, setLoadError ] = useState<string>()
    
    return (
        <>
            {
                loading?
                <Text as="div" textAlign="center"
                    cursor="pointer" fontStyle="italic" fontSize="12px"
                    display="flex" justifyContent="center" alignItems="center"
                    w="100px" height="50px" mr="5px" mb="5px" 
                    border={`4px dashed ${!loadError? "#dd6b20" : "rgb(246, 70, 93)"}`} 
                >
                    {loadError || "Loading Signature..."}
                </Text> : null
            }
            <Image 
                onClick={onClick}
                cursor="pointer" bg={"#cfcfcf"} src={image as string}
                display={loading? "none" : "block"} 
                w="100px" h="auto"
                mr="5px" mb="5px" 
                border={selected? "4px ridge #dd6b20" : "2px dashed #dd6b20"} 
                _hover={{
                    border: "4px ridge #dd6b20"
                }}
                onLoad={() => {
                    setLoading(false)
                    setLoadError(undefined)
                }}
                onError={() => {
                    setLoading(false)
                    setLoadError("Failed to load signature")
                }}
            />
        </>
    )
}

const SelectSignature: React.FC<ImageInputStrategy> = ({ onClose, onImage }) => {
    const [signatureLink, setSignatureLink] = useState<string>()
    const [signatureError, setSignatureError] = useState<string>()
    const [loadingBase64, setLoadingBase64] = useState<boolean>()

    const handleUseSignature = () => {
        setSignatureError("")
        if(!signatureLink) {
            setSignatureError("Please select a signature to use above.")
            return
        }
        setLoadingBase64(true)
        fileOrUrlToBase64(signatureLink)
        .then(base64 => {
            onImage(null, base64 as string)
        })
        .catch((e: any) => {
            setSignatureError(e.message)
            setLoadingBase64(false)
        })
    };

    return (
        <ModalPop title={"Select Signature"} isOpen={true} onClose={onClose}>
            <HStack maxHeight="320px" justifyContent="flex-start" alignItems="flex-end" mb={2} flexWrap="wrap" pos="relative" overflowY="auto">
                {
                    SIGNATURES.map((option, index) => (
                        <SelectorOption key={index} image={option} selected={option == signatureLink} onClick={() => {
                            if(!loadingBase64) setSignatureLink(option)
                        }} />
                    ))
                }
            </HStack>
            <InputBox type={InputBox.TYPES.none} errorMessage={signatureError} mb={1} />

            <CuteButton status={loadingBase64? "loading" : "warning"} mb="1rem" onClick={handleUseSignature}>
                {loadingBase64? "Please wait..." : "Use Signature"}
            </CuteButton>
        </ModalPop>
    )
}

export default SelectSignature