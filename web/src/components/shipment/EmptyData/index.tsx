import React, { useMemo, useState } from 'react';
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
  MenuList, MenuItem as MI,
  HStack
} from '@chakra-ui/react';
import { EmptyData as EmptyDataProps } from '../types';
import { FaPlus } from 'react-icons/fa';
import useColorValue from '@/root/src/hooks/useColorValue';


const EmptyData: React.FC<EmptyDataProps> = ({ title, description, icon, onActionButtonClicked }) => {
    const isMobile = useBreakpointValue({ base: true, md: false });

    const ActionButton = useMemo(() => {
      if(!onActionButtonClicked) return null
      return (
        <Button 
          size="lg"
          borderRadius="full"
          colorScheme="teal"
          zIndex="sticky"
          onClick={() => {
            onActionButtonClicked()
          }}
        >
          <Icon as={FaPlus} mr={2} />
          <Text as="div" mb="0 !important">Create Now</Text>
        </Button>
      );
    }, [onActionButtonClicked]);
    
    return (
      <VStack w="100%" h="100%" px={2} 
      bg={useColorValue("cardBg.light", "cardBg.dark")}
      p={4}
      flex={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxShadow={isMobile ? 'lg' : 'none'}
      rounded={isMobile ? 'md' : 'none'}>
        <Box w={{base: "5rem", md: "10rem"}}>
          {icon}
        </Box>
        <Text as="div" fontSize={"3rem"}>{title}</Text>
        <Text as="div" textAlign="center" maxW="600px">{description}</Text>
        {ActionButton}
      </VStack>
    );
};

export default EmptyData;