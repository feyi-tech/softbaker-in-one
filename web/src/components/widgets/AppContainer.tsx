import { Box } from "@chakra-ui/react";

interface AppContainerProps {
    as?: any,
    children?: any,
    neigbours?: any,
    [x: string]: any
}
const AppContainer: React.FC<AppContainerProps> & {getBreakPointKey: (size: number) => "base" | "sm" | "md" | "lg" | "xl" } = ({as, children, neigbours, ...props}) => {

    return (
        <Box as={as || ""} pos="relative" mx="auto !important" w="100%" 
        display="flex" flexDirection="column"
        justifyContent="flex-start" alignItems="center" 
        
        /*px="15px" py={{base: "16px", md: "48px"}}*/
        p={{base: "15px", md: "2.375rem 2.375rem"}}

        mt="0px !important" 
        maxW={{base: "100%", sm: `${576 / (!neigbours? 1 : neigbours + 1)}px`, md: `${768 / (!neigbours? 1 : neigbours + 1)}px`, lg: `${992 / (!neigbours? 1 : neigbours + 1)}px`, xl: `${1200 / (!neigbours? 1 : neigbours + 1)}px`}} {...props}>
            {children}
        </Box>
    )
}

AppContainer.getBreakPointKey = (size: number): "base" | "sm" | "md" | "lg" | "xl" => {
    if(size < 576) {
        return "base"

    } else if(size > 576 && size < 768) {
        return "sm"

    } else if(size > 768 && size < 992) {
        return "md"
        
    } else if(size > 992 && size < 1200) {
        return "lg"
        
    } else {
        return "xl"
        
    }
}

export default AppContainer