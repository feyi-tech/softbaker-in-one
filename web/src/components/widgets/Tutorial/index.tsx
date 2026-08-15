import React, { useEffect, useState } from 'react';
import { AspectRatio, useBreakpoint } from '@chakra-ui/react';
import { Box, Divider, Flex, HStack, Text } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import PleaseWaitForX from './PleaseWaitForX';
import { useTools, DynamicTool, StaticTool } from 'use-softbaker';
import Card from '../Card';
import { USE_SOFTBAKER_CONFIG } from '@/root/src/app-config';


interface Tutorial {
  show: boolean | null;
  currentToolId?: string | null;
  onClose: () => void;
  isDarkMode?: boolean
}

function getYouTubeEmbedUrl(input?: string | null): string {
  if(!input) return ""
  const youtubeEmbedBaseUrl = "https://www.youtube.com/embed/";
  const youtubeWatchUrlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([\w-]{11})([&\w-]*)?$/;
  const youtubeShortUrlPattern = /^(https?:\/\/)?(www\.)?youtu\.be\/([\w-]{11})$/;
  const youtubeEmbedUrlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([\w-]{11})$/;
  const youtubeVideoIdPattern = /^[\w-]{11}$/;

  let videoId: string | null = null;

  if (youtubeWatchUrlPattern.test(input)) {
      const match = input.match(youtubeWatchUrlPattern);
      if (match) {
          videoId = match[3];
      }
  } else if (youtubeShortUrlPattern.test(input)) {
      const match = input.match(youtubeShortUrlPattern);
      if (match) {
          videoId = match[3];
      }
  } else if (youtubeEmbedUrlPattern.test(input)) {
      const match = input.match(youtubeEmbedUrlPattern);
      if (match) {
          videoId = match[3];
      }
  } else if (youtubeVideoIdPattern.test(input)) {
      videoId = input;
  }

  if (videoId) {
      return `${youtubeEmbedBaseUrl}${videoId}`;
  } else {
      return ""
  }
}

const Tutorial: React.FC<Tutorial> = ({ show, currentToolId, onClose }) => {
  const breakpoint = useBreakpoint();
  const { toolsById } = useTools(USE_SOFTBAKER_CONFIG)

  const [ currentTool, setCurrentTool ] = useState<DynamicTool | StaticTool>()

  useEffect(() => {
    if(toolsById && show && currentToolId) {
      setCurrentTool(toolsById[currentToolId])
    }
  }, [ show, currentToolId, toolsById ])

  if (!show) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      w="100%"
      h="100%"
      zIndex="1500"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Card as={Flex}
        flexDir="column"
        pos="relative"
        w={{ base: "95%", md: "700px" }} // Use responsive width
        maxW="700px"
        maxH={{ base: "90vh", md: "auto" }} // Limit max height to 90% of viewport for small devices
        borderRadius={{ base: "8px", md: "12px" }}
        boxShadow={{ base: "none", md: `0px 0px 10px rgba(0,0,0,0.5)` }}
        p="0"
        overflow="hidden"
      >
        <HStack
          w="100%"
          py="0.5rem"
          px="1rem"
          justifyContent="space-between"
          alignItems="center"
          borderBottom={`1px solid`} // Optional divider
          position="sticky"
          top="0"
          zIndex="10" // Ensure header is always on top
        >
          {currentTool ? (
            <Text as="div" m="0px !important" py="0px !important" fontSize="1.2rem" fontWeight="500">
              {currentTool.name} Video
            </Text>
          ) : (
            <Box></Box>
          )}
          <Box
            p="0.5rem"
            cursor="pointer"
            border="1px solid #e2e8f0"
            _hover={{ opacity: 0.7 }}
            borderRadius="50%"
            onClick={onClose}
          >
            <FaTimes size="14px" />
          </Box>
        </HStack>

        <Divider mx="0px !important" m="0 !important" borderBottom="1px solid #bfbfbf" />

        {currentTool ? (
          <Flex
            id="container"
            flexDir="column"
            pos="relative"
            w="100%"
            justifyContent="center"
            alignItems="center" minH={{base: "300px", md: "400px"}}
            p="1rem"
            pt="0.5rem" // Reduce top padding to make space for the header
          >
            <Flex
              flexDir="column"
              pos="absolute"
              w="100%"
              h="100%"
              justifyContent="center"
              alignItems="center"
              p="1rem"
            >
              <PleaseWaitForX />
            </Flex>
            <Flex
              id="videoview"
              flexDir="column"
              pos="absolute"
              w="100%"
              justifyContent="center"
              alignItems="center"
            >
              {breakpoint === 'base' ? (
                <AspectRatio
                  w="100%"
                  maxW="360px"
                  maxH="65vh"
                  ratio={9 / 16} // Narrower aspect ratio for mobile
                >
                  <Box
                    as="iframe"
                    src={`${getYouTubeEmbedUrl((currentTool as any)?.mobileVideoUrl || (currentTool as any)?.youtube)}?rel=0&enablejsapi=1`}
                    borderRadius="15px"
                    allow="accelerometer; gyroscope; picture-in-picture; fullscreen;"
                  />
                </AspectRatio>
              ) : (
                <AspectRatio
                  w="100%"
                  maxW="560px"
                  maxH="70vh"
                  ratio={16 / 9} // Standard desktop aspect ratio
                >
                  <Box
                    as="iframe"
                    src={`${getYouTubeEmbedUrl((currentTool as any)?.desktopVideoUrl || (currentTool as any)?.youtube)}?rel=0&enablejsapi=1`}
                    borderRadius="25px"
                    allow="accelerometer; gyroscope; picture-in-picture; fullscreen;"
                  />
                </AspectRatio>
              )}
            </Flex>
          </Flex>
        ) : (
          <Flex
            flexDir="column"
            pos="relative"
            w="100%"
            h="100%"
            justifyContent="center"
            alignItems="center"
            p="1rem"
          >
            <PleaseWaitForX />
          </Flex>
        )}
      </Card>
    </Box>
  );
};

export default Tutorial;

/**
 * 
 */