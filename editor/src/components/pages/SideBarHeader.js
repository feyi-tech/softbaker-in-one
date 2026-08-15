import { Box, HStack, Image, Text } from "@chakra-ui/react"

const SideBarHeader = () => {
    return (
        <HStack w="100%" borderBottom="1px solid rgba(255,255,255,.2)" 
            px="15px" pt="15px" pb="1rem" justifyContent="flex-start" alignItems="center">
            <Image bg="#fff" src="/images/company-enterprise-icon.png" 
            w="40px" h="40px" 
            borderRadius="20px" />
            <Box flexGrow="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                <Text as="div" textTransform="uppercase" fontSize="11px">p/example.com</Text>
                <Text as="div" textTransform="lowercase" fontSize="11px">yyy@gmail.com</Text>
            </Box>
        </HStack>
    )
}

export default SideBarHeader