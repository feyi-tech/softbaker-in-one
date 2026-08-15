import { Box, useColorModeValue } from "@chakra-ui/react";
import Loading from "./Loading";
import theme from "@/root/src/theme"


interface LoadingOrViewProps {
    as?: any, 
    isLoading?: boolean, 
    loadingType?: string, 
    loadingW?: string, 
    loadingH?: string, 
    loadingColor?: string, 
    children?: any,
    [x: string]: any
}
const LoadingOrView: React.FC<LoadingOrViewProps> = ({
    as, isLoading, loadingType, loadingW, loadingH, loadingColor, children, ...props
}) => {
    
    const loadingC = useColorModeValue(theme?.colors?.colorAccent?.light, theme?.colors?.colorAccent?.dark)

    return (
        <Box as={as || "div"} m="0px !important" display={!isLoading && !children? "none !important" : "block"} {...props}>
            {
                isLoading?
                <Loading
                style={{display: "inline !important"}}
                width={loadingW || "30px"}
                height={loadingH || "30px"}
                color={loadingColor || loadingC}
                type={loadingType || Loading.TYPES.threeDots} />
                :
                <>{children}</>
            }
        </Box>
    )
}

export default LoadingOrView