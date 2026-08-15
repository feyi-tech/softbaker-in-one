import { Text } from "@chakra-ui/react"

interface Bar {
    children: any,
    [x: string]: any
}
const Bar: React.FC<Bar> = ({children, ...props}) => {

    return (
        <Text w="100%" bg="#00adfe" color="#fff" textTransform="uppercase" 
        fontWeight="bold" fontSize={{base: "1.2rem", lg: "1.8rem"}} my="1rem !important" display="block"
        p="0.5rem" {...props}>
        {children}
        </Text>
    )
}

export default Bar