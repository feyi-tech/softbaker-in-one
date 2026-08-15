import { Box, useColorModeValue } from "@chakra-ui/react"

interface Taping {
    curveValue?: any,
    fill?: any,
    color?: any,
    children?: any,
    [x: string]: any
}
export const HomeTaping: React.FC<Taping> = ({...props}) => {

    return (
        <Box as="svg" viewBox="0 0 1660 339" width="100%" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M804 167.023C520.5 167.023 267.5 290.522 0 304.5V339H1660V0.5C1358.83 0.5 1104 167.023 804 167.023Z" 
            fill={useColorModeValue("url(#paint0_linear_light)", "url(#paint0_linear_dark)")}>
            </path>
            <defs>
                <linearGradient id="paint0_linear_light" x1="830" y1="84" x2="830" y2="339" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0.48"></stop>
                    <stop offset="0.566389" stopColor="white" stopOpacity="0.35"></stop>
                    <stop offset="1" stopColor="white"></stop>
                </linearGradient>
                <linearGradient id="paint0_linear_dark" x1="830" y1="83.5" x2="830" y2="338.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#08060B" stopOpacity="0.2"></stop>
                    <stop offset="0.545554" stopColor="#08060B" stopOpacity="0.5"></stop>
                    <stop offset="1" stopColor="#08060B"></stop>
                </linearGradient>
            </defs>
        </Box>
    )
}

export const HomeTaping2: React.FC<Taping> = ({...props}) => {

    return (
        <Box as={"svg"} viewBox="0 0 1660 48" preserveAspectRatio="none" width="20px" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M1660 48C1139.02 46.1887 336.256 15.2453 0 0H1660V48Z"></path>
        </Box>
    )
}

export const HomeTaping3: React.FC<Taping> = ({...props}) => {

    return (
        <Box as={"svg"} viewBox="0 0 1660 48" preserveAspectRatio="none" width="20px" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M-346 48C174.985 46.1887 977.744 15.2453 1314 0H-346V48Z"></path>
        </Box>
    )
}

export const HomeAnimatedCurve: React.FC<Taping> = ({curveValue, fill, color, children, ...props}) => {

    return (
        <>
            <Box as="div" className="page-curve-svg-container">
                <Box as={"svg"} viewBox="0 0 800 400" className="svg" xmlns="http://www.w3.org/2000/svg">
                    <path id="curve" fill={fill || "rgb(254,127,38"} d={`M 800 300 Q 400 ${curveValue} 0 300 L 0 0 L 800 0 L 800 300 Z`}>
                    </path>
                </Box>
                <style jsx global>{`
                    .cd__main{
                    position: relative;
                    display: block !important;
                    }
                    .page-curve-svg-container {
                    position: absolute;
                    top: 0;
                    right: 0;
                    left: 0;
                    z-index: 1;
                    }
                    
                    .page-curve-svg-container > svg path {
                    transition: 0.1s;
                    }
                    .page-curve-svg-container > svg:hover path {
                    d: path("M 800 300 Q 400 250 0 300 L 0 0 L 800 0 L 800 300 Z");
                    }
                    
                    .curved-header{
                        color: ${color};
                        padding-top: 10vw;
                        padding-bottom: 20vw;
                        text-align: center;
                        position: relative;
                        z-index: 2;
                    }
                    
                    .page-main {
                        padding: 2vh 0 2vh;
                        position: relative;
                        text-align: center;
                        overflow: hidden;
                    }
                    .page-main::after {
                    content: "";
                    position: absolute;
                    top: calc(10vh + 1.618em);
                    bottom: 0;
                    left: 50%;
                    width: 2px;
                    height: 100%;
                    }
                `}
                </style>
            </Box>
            {children}
        </>
    )
}