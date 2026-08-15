const { VStack } = require("@chakra-ui/react")
import Card from '@/components/widgets/Card'


interface CurvePageContainerProps {
    children?: any,
    [x: string]: any
}
const CurvePageContainer: React.FC<CurvePageContainerProps> = ({ children, ...props}) => {
    
    return (
        <VStack p="0px !important" as={Card} w="97%" minH="100vh" 
            mt={{base: "15px", md: "15px"}} mx="auto"
            borderTopLeftRadius="32px !important" borderTopRightRadius="32px !important" 
            borderBottomLeftRadius="0px !important" borderBottomRightRadius="0px !important" 
            pos="relative" {...props}>
            {children}
        </VStack>
    )
}

export default CurvePageContainer