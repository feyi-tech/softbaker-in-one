import { Box, Text } from "@chakra-ui/react"
import { FaInfoCircle } from "react-icons/fa"
import useColorValue from "../../hooks/useColorValue"

interface TextError {
    as?: any,
    children?: any
}
const TextError: React.FC<TextError> = ({as, children}) => {

    return (
        <Text as="div" display="flex" flexDirection="row"
        bg={useColorValue("errorColorBg.light", "errorColorBg.dark")} 
        borderColor={useColorValue("errorColor.light", "errorColor.dark")}
        borderLeft="2px" p="5px" w="100%" justifyContent="flex-start" alignItems="flex-start">
            <Box mr="5px">
                <FaInfoCircle />
            </Box>
            {children}
        </Text>
    )
}

export default TextError