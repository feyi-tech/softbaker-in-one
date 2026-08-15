import { AspectRatio, Box, Divider, Flex, HStack, Link, Text, useBreakpoint, useDisclosure } from "@chakra-ui/react"
import React, { useState } from "react"
import { FaLightbulb, FaTimes } from "react-icons/fa"
import DrawerPop from "../widgets/DrawerPop"


interface HowToPay {
    isBank?: boolean,
    [x: string]: any
}

interface Video {
    id: string,
    title: string
}

const bankingTutorials: Video[] = [
    {
        id: "/cSEDutaqmKo",
        title: "How to Login to your created bank account."
    },
    {
        id: "SOXp-6VymTw",
        title: "How to Add Balance to your Bank Account."
    },
    {
        id: "2V-5yEtYils",
        title: "How to Reply Customer Messages as a Customer Support Agent."
    },
    {
        id: "QTV2oiLXQUA",
        title: "How to Make Transfer and Generate Transfer OTP."
    },
    {
        id: "5sN7GFgH9tw",
        title: "How To Disable Transfer With an Error Message."
    },
    {
        id: "J_vASZHkrog",
        title: "How To Create a Bank Account."
    },
    {
        id: "/cSEDutaqmKo",
        title: "Where is my online banking website link?"
    },
]

const HowToPay: React.FC<HowToPay> = ({ isBank, ...props }) => {
    const breakpoint = useBreakpoint();
    const [ video, setVideo ] = useState<Video>()

    const onClose = () => {
        setVideo(undefined)
    }


    const bankTuts = () => {
        return bankingTutorials.map((v, i) => (
            <>
                <Text as="div" fontSize="16px"> | </Text>
                <Text as="span" textDecoration="underline" onClick={() => {
                    setVideo({
                        id: v.id,
                        title: v.title
                    })
                }}>
                    <FaLightbulb style={{display: "inline-flex"}} /> { v.title } 
                </Text>
            </>
        ))
    }

    return (
        <HStack cursor="pointer" fontSize="13px" color="orange" wrap="wrap" {...props}>
            <Text as="span" textDecoration="underline" onClick={() => {
                setVideo({
                    id: "DGUSQNLOMSw",
                    title: isBank? " How to Remove Fake Bank Warning" : " How to Remove Watermark"
                })
            }}><FaLightbulb style={{display: "inline-flex"}} />{ isBank? " How to Remove Fake Bank Warning" : " How to Remove Watermark" }</Text>
            <Text as="div" fontSize="16px"> | </Text>
            <Text as="span" textDecoration="underline" onClick={() => {
                setVideo({
                    id: "vLq61TUAw2s",
                    title: "How to Fund My Frontbacked Wallet"
                })
            }}><FaLightbulb style={{display: "inline-flex"}} /> How to Fund My Frontbacked Wallet </Text>

            {
                isBank?
                bankTuts() : null
            }

            {
                !(video != undefined)? null
                :
                <DrawerPop title={video.title} isOpen={(video != undefined)} placement="bottom" h="90%" onClose={onClose} 
                justifyContent="flex-start" alignItems="center">
                    <Text as="div" p="0.5rem" textAlign="center">
                        If the video does not load on time, <Link href={`https://youtu.be/${video.id}`} target="_blank" cursor="pointer" color="orange" isExternal>click here to watch on youtube.</Link>
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
                            src={`https://www.youtube.com/embed/${video.id}?rel=0&enablejsapi=1`}
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
                            src={`https://www.youtube.com/embed/${video.id}?rel=0&enablejsapi=1`}
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