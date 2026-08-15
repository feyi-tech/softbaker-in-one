import { 
    VStack, HStack, Text,
    Modal, ModalBody, Box, ModalContent, ModalHeader, ModalOverlay
} from '@chakra-ui/react'
import { FaTimes } from 'react-icons/fa'
import Loading from './Loading'

const InputLoading = ({isLoading, msg}) => {
    return (
      <HStack width="100%" 
      justifyContent="center" alignItems="center" display={isLoading? 'flex' : 'none'}>
        <Text as="div" fontStyle="italic" fontSize="14px">
          {msg || ""}
        </Text>
        <Loading
        style={{display: "block !important"}}
        width={"25px"}
        height={"25px"}
        type={Loading.TYPES.threeDots} />
      </HStack>
    )
}

const AppAlert = ({isOpen, onClose, msg, isClosable, allowOutsideClick, ...props}) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={allowOutsideClick} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="32px" w={{base: "95%", md: "650px"}}>
                {
                    isClosable?
                    <ModalHeader w="100%" d="flex" justifyContent={"flex-end"}>
                        <Box as={FaTimes} onClick={onClose} cursor="pointer" 
                        display={"block"}>
                            Cancel
                        </Box>
                    </ModalHeader>
                    : null
                }
                <ModalBody {...props}>
                    <VStack minH="100px" width="100%" justifyContent="center" alignItems="center">
                        <InputLoading isLoading={true} msg={msg} />
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default AppAlert