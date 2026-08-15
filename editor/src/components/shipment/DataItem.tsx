import React from 'react';
import {
  Badge,
  Box,
  HStack,
  Text
} from '@chakra-ui/react';
import { Message } from '../shipview/types';
import useColorValue from '../../hooks/useColorValue';


const DataItem: React.FC<Message> = ({
  selected, onClick, 
  itemName, itemTime, itemDescription, itemBadge
}) => {
  
  //gray.200 : white
  return (
    <Box
      w="100%" overflow="hidden"
      p={2}
      bg={selected ? useColorValue("cardBg.light", "cardBg.dark") : 'transparent'}
      _hover={{ bg: useColorValue("cardBg.light", "cardBg.dark"), cursor: 'pointer' }}
      display="flex" flexDirection="column"
      onClick={onClick} 
    >
      <Text as="div" mb="0px !important" fontWeight={selected ? 'bold' : 'normal'}>
        {itemName}
      </Text>
      <Box>
        <Text as="div" mb="0px !important" color="gray.500" noOfLines={{base: 1, md: 2}}>{itemDescription}</Text>
        <HStack justifyContent="space-between">
          <Badge>{itemBadge}</Badge>
          <Text as="div" mb="0px !important" color="gray.500" fontStyle="italic">{itemTime}</Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default DataItem;