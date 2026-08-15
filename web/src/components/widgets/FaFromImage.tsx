
import { Image } from "@chakra-ui/react";

interface FaFromImage {
    src: string, 
    size?: any, 
    w?: any, 
    h?: any, 
    width?: any, 
    height?: any,
    [x: string]: any
}
const FaFromImage: React.FC<FaFromImage> = ({src, size, w, h, width, height, ...props}) => {

    return (
        <Image src={src} w={w || width || size || "35px"} h={h || height || size || "35px"} {...props} />
    )
}

export default FaFromImage