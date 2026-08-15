import { Box } from "@chakra-ui/react"

interface ScanRadar {
    show?: boolean,
    display?: any,
    fillDeviceDimension?: boolean,
    radarBackgroundColor: string,
    radarHandColor: string,
    radarCircleLineColor: string,
    radarCircleGapColor: string,
    [x: string]: any
}
const ScanRadar: React.FC<ScanRadar> = ({ 
    show, 
    display, 
    fillDeviceDimension, 
    radarBackgroundColor,
    radarHandColor,
    radarCircleLineColor,
    radarCircleGapColor,
    ...props 
}) => {

    return (
        <Box w="100%" h="100%" {...props} display={!show? "none" : display || "block"} pos="relative">
            <Box className="radar-box-area" w="100%" h="100%">
                <Box className="radar-box">
                    <Box className="radar"></Box>
                    <Box className="gps-signal"></Box>
                    <Box className="gps-signal"></Box>
                    <Box className="gps-signal"></Box>
                    <Box className="gps-signal"></Box>
                </Box>
            </Box>
            <style jsx global>
            {`
            .radar-box-area {
                position: absolute;
                top: 0;left: 0;right: 0;bottom: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .radar-box {
                position: relative;
                border-radius: 50%;
                overflow: hidden;
                background: ${radarBackgroundColor};
                background-image: radial-gradient(circle,
                    ${radarCircleGapColor} 5%, ${radarCircleLineColor}, ${radarCircleGapColor} 6%, ${radarCircleGapColor} 10%, ${radarCircleLineColor}, ${radarCircleGapColor} 11%,
                    ${radarCircleGapColor} 15%, ${radarCircleLineColor}, ${radarCircleGapColor} 16%, ${radarCircleGapColor} 20%, ${radarCircleLineColor}, ${radarCircleGapColor} 21%,
                    ${radarCircleGapColor} 25%, ${radarCircleLineColor}, ${radarCircleGapColor} 26%, ${radarCircleGapColor} 30%, ${radarCircleLineColor}, ${radarCircleGapColor} 31%,
                    ${radarCircleGapColor} 35%, ${radarCircleLineColor}, ${radarCircleGapColor} 36%, ${radarCircleGapColor} 40%, ${radarCircleLineColor}, ${radarCircleGapColor} 41%,
                    ${radarCircleGapColor} 45%, ${radarCircleLineColor}, ${radarCircleGapColor} 46%, ${radarCircleGapColor} 50%, ${radarCircleLineColor}, ${radarCircleGapColor} 51%,
                    ${radarCircleGapColor} 55%, ${radarCircleLineColor}, ${radarCircleGapColor} 56%, ${radarCircleGapColor} 60%, ${radarCircleLineColor}, ${radarCircleGapColor} 61%,
                    ${radarCircleGapColor} 65%, ${radarCircleLineColor}, ${radarCircleGapColor} 66%, ${radarCircleGapColor} 70%, ${radarCircleLineColor}, ${radarCircleGapColor} 71%,
                    ${radarCircleGapColor} 75%, ${radarCircleLineColor}, ${radarCircleGapColor} 76%, ${radarCircleGapColor} 80%, ${radarCircleLineColor}, ${radarCircleGapColor} 81%
                );
            }
            ${
                fillDeviceDimension?
                `@media all and (orientation:portrait) {
                    .radar-box {
                        width: calc(100vw - 50px);
                        height: calc(100vw - 50px);
                    }
                }
                @media all and (orientation:landscape) {
                    .radar-box {
                        width: calc(100vh - 50px);
                        height: calc(100vh - 50px);
                    }
                }` : `.radar-box {
                        width: 100%;
                        height: 100%;
                    }`
            }
            .radar {
                position: absolute;
                width: 50%;
                height: 40%;
                top: 50%;
                left: 50%;
                transform: translateY(-100%);
                border-bottom: 2px solid ${radarHandColor};
                background: linear-gradient(325deg, ${radarHandColor}, transparent, transparent);
                animation: 5s radarAnim;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
                transform-origin: left bottom;
            }
            @keyframes radarAnim {
                from {
                    transform: translateY(-100%) rotate(0deg);
                }
                to {
                    transform: translateY(-100%) rotate(360deg);
                }
            }
            
            .gps-signal {
                position: absolute;
                top: 25%;
                left: 25%;
                width: 25px;
                height: 7px;
                border-radius: 5px;
                background: rgb(245,127,38);
                transform: rotate(45deg);
                visibility: hidden;
                animation: 10s gps-signal;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
            }
            @keyframes gps-signal {
                0% {
                    visibility: hidden;
                }
                5% {
                    visibility: hidden;
                }
                100% {
                    visibility: visible;
                }
            }
            .gps-signal:before, .gps-signal:after {
                position: absolute;
                content: "";
                left: 50%;
                margin-left: -5px;
                width: 10px;
                height: 15px;
                border: 2px solid rgb(245,127,38);
            }
            .gps-signal:before {
                top: 100%;
            }
            .gps-signal:after {
                bottom: 100%;
            }
            .gps-signal:nth-child(2) {
                top: 25%;
                left: 50%;
                animation-timing-function: steps(2)
            }
            .gps-signal:nth-child(3) {
                top: 50%;
                left: 25%;
                animation-timing-function: steps(4)
            }
            .gps-signal:nth-child(4) {
                top: 60%;
                left: 75%;
                animation-timing-function: steps(6)
            }
            `}
            </style>
        </Box>
    )
}

export default ScanRadar