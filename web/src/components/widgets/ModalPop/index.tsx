import { 
    Box, HStack, 
    Modal, ModalBody, ModalContent, ModalFooter, 
    ModalHeader, ModalOverlay, Text, useDisclosure 
} from "@chakra-ui/react"
import { FaTimes } from "react-icons/fa"
import ThemeSwitch from "../../PageBody/ThemeSwitch"
import useColorValue from "@/root/src/hooks/useColorValue"


interface ModalPop {
    bg?: any, 
    color?: any, 
    w?: any, width?: any, maxW?: any, maxWidth?: any,
    h?: any, height?: any, maxH?: any, maxHeight?: any,
    children: any, 
    placement?: any, 
    onClose?: () => void, 
    isOpen: boolean, 
    isClosable?: boolean,
    title?: any, 
    footer?: any,
    hideModeSwitch?: boolean,
    noHeader?: boolean
    dontCloseOnOverlayClick?: boolean | null
    [x: string]: any
}
const ModalPop: React.FC<ModalPop> = ({
    bg, 
    color, 
    children, 
    placement, 
    onClose, 
    isOpen, 
    isClosable,
    title, 
    footer, hideModeSwitch, noHeader,
    w, width, maxW, maxWidth,
    h, height, maxH, maxHeight, dontCloseOnOverlayClick,
    ...props
}) => {


    return (
        <Modal closeOnOverlayClick={!dontCloseOnOverlayClick} onClose={onClose? onClose : () => {}} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent bg={bg || useColorValue("cardBg.light", "cardBg.dark")} color={color} 
                minH={h || height || "50vh"} 
                maxH={maxH || maxHeight || "70vh"} 
                w={w || width || {base: "95%", md: "650px"}}
                maxW={maxW || maxWidth}
                borderRadius="16px !important">
                {
                    noHeader? null : 
                    <ModalHeader borderBottomWidth='1px' w="100%" display="flex" 
                        justifyContent={"space-between"} alignItems="center">
                        <Text as="div" fontSize={{base: "1.1rem", md: "1.3rem"}} textTransform="capitalize">
                            {title}
                        </Text>
                        <HStack>
                            {/*
                                !hideModeSwitch?
                                <ThemeSwitch /> : null*/
                            }
                            {
                                onClose && (isClosable || isClosable === undefined)?
                                <Box onClick={onClose} cursor="pointer" 
                                display={"block"}>
                                    <FaTimes size="24px" />
                                </Box>
                                :
                                null
                            }
                        </HStack>
                        
                    </ModalHeader>
                }

                <ModalBody {...props}>
                    {children}
                </ModalBody>
                
                {
                    footer?
                    <ModalFooter>
                        {footer}
                    </ModalFooter>
                    : null
                }
            </ModalContent>
        </Modal>
    )
}

export default ModalPop