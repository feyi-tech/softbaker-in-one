import { AspectRatio, Box, Divider, Flex, HStack, Link, Text, useBreakpoint, useDisclosure } from "@chakra-ui/react"
import React from "react"
import { FaLightbulb, FaTimes } from "react-icons/fa"
import DrawerPop from "../widgets/DrawerPop"


interface HowToPay {
    isBank?: boolean,
    [x: string]: any
}
const HowToPay: React.FC<HowToPay> = ({ isBank, ...props }) => {
    const breakpoint = useBreakpoint();
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <HStack cursor="pointer" fontSize="13px" color="orange" {...props} onClick={onOpen}>
            <Text as="span" textDecoration="underline"><FaLightbulb style={{display: "inline-flex"}} />{ isBank? " How to Remove Fake Bank Warning" : " How to Remove Watermark" }</Text>
            <Text as="div" fontSize="16px"> | </Text>
            <Text as="span" textDecoration="underline"><FaLightbulb style={{display: "inline-flex"}} /> How to Pay in Naira</Text>

            {
                !isOpen? null
                :
                <DrawerPop title="How to Pay In Local Currency" isOpen={isOpen} placement="bottom" h="90%" onClose={onClose} 
                justifyContent="flex-start" alignItems="center">
                    <Text as="div" p="0.5rem" textAlign="center">
                        If the video does not load in time, <Link href="https://youtu.be/yIIjPPeCkkw" target="_blank" cursor="pointer" color="orange" isExternal>click here to watch on youtube.</Link>
                    </Text>

                    {breakpoint === 'base' ? (
                        <AspectRatio bg="#000"
                        w="360px"
                        maxW="360px"
                        maxH="65vh"
                        ratio={9 / 16} // Narrower aspect ratio for mobile
                        >
                        <Box
                            as="iframe"
                            src={`https://www.youtube.com/embed/yIIjPPeCkkw?rel=0&enablejsapi=1`}
                            borderRadius="15px"
                            allow="accelerometer; gyroscope; picture-in-picture; fullscreen;"
                        />
                        </AspectRatio>
                    ) : (
                        <AspectRatio bg="#000"
                        w="600px"
                        maxW="560px"
                        maxH="70vh"
                        ratio={16 / 9} // Standard desktop aspect ratio
                        >
                        <Box
                            as="iframe"
                            src={`https://www.youtube.com/embed/yIIjPPeCkkw?rel=0&enablejsapi=1`}
                            borderRadius="25px"
                            allow="accelerometer; gyroscope; picture-in-picture; fullscreen;"
                        />
                        </AspectRatio>
                    )}
                </DrawerPop>
            }
        </HStack>
    )
}

export default HowToPay