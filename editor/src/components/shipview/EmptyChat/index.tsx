import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  IconButton,
  Icon,
  Heading,
  Text,
  Button,
  Divider,
  StackDivider,
  useBreakpointValue,
  Image,
  Menu,
  MenuButton,
  MenuList, MenuItem as MI
} from '@chakra-ui/react';
import { FaChevronLeft, FaEllipsisV, FaPlus } from 'react-icons/fa';


const EmptyChat = () => {
    const isMobile = useBreakpointValue({ base: true, md: false });
    

  return (
    <Flex w="100%" h="100%" px={2} 
        bg={isMobile ? 'white' : 'gray.50'}
        p={4}
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow={isMobile ? 'lg' : 'none'}
        rounded={isMobile ? 'md' : 'none'}>
      <Text as="div">Select a message to view</Text>
    </Flex>
  );
};

export default EmptyChat;