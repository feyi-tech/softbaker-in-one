import { Box, useColorModeValue } from "@chakra-ui/react"


interface CardProps {
    as?: any,
    children?: any,
    [x: string]:any
}
const Card: React.FC<CardProps> = ({as, children, ...props}) => {

    return (
        <Box pos="relative" w="100%" bg={useColorModeValue("cardBg.light", "cardBg.dark")} 
        borderRadius="20px" 
        boxShadow={"0 0.5rem 1rem rgb(0 0 0 / 15%) !important"} p="1rem" 
        {...props}>
            {children}
        </Box>
    )
}

export default Card