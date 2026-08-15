import { Flex } from "@chakra-ui/react"
import useColorValue from "../../hooks/useColorValue"

interface MobileColDeskRowProps {
    children: any,
    [x: string]: any
}
const MobileColDeskRow: React.FC<MobileColDeskRowProps> = ({children, ...props}) => {

    return (
        <Flex w="100%" 
        flexDir={{base: "column", md: "row"}} 
        justifyContent={{base: "flex-start", md: "space-between"}} 
        alignItems={{base: "flex-start"}} {...props}>
            {children}
        </Flex>
    )
}

export default MobileColDeskRow