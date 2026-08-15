import { Box } from "@chakra-ui/react";

interface SectionProps {
    as?: any, 
    children?: any, 
    [x: string]: any
}

const Section: React.FC<SectionProps> = ({as, children, ...props}) => {

    return (
        <Box as={as || "div"} w="100%" pos="relative" mb="0px !important"
        display="block" 
        bgSize="cover !important" bgRepeat="no-repeat !important"
        {...props}>
            {children}
        </Box>
    )
}

export default Section