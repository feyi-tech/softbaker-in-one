import React from 'react';
import {
  Box,
  Text
} from '@chakra-ui/react';
import { Message } from '../types';
import useColorValue from '@/root/src/hooks/useColorValue';


const ChatItem: React.FC<Message> = ({id, sender, content, selected, onClick}) => {

  return (
    <Box
      key={id}
      p={2}
      bg={selected ? useColorValue("cardBg.light", "cardBg.dark") : 'transparent'}
      _hover={{ bg: useColorValue("cardBg.light", "cardBg.dark"), cursor: 'pointer' }}
      onClick={onClick}
    >
      <Text as="div" fontWeight={selected ? 'bold' : 'normal'}>
        {sender}
      </Text>
      <Text as="div" color="gray.500">{content}</Text>
    </Box>
  );
};

export default ChatItem;
