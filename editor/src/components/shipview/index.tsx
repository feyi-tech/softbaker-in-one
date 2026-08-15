import { useEffect, useState } from 'react';
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
  HStack,
} from '@chakra-ui/react';
import { Messenger as MessengerProps } from './types';
import ChatItem from './ChatItem';
import Header from './Header';
import EmptyChat from './EmptyChat';
import Loading from '../widgets/Loading';
import useColorValue from '../../hooks/useColorValue';


export interface MenuItem {
    title: string,
    link?: string,
    linkIsExternal?: boolean,
    icon?: any | null,
    showIfRoom?: boolean,
    showAlways?: boolean,
    onClick?: () => void;
}

const Messenger: React.FC<MessengerProps> = ({ 
    title, subTitle, chats, isLoadingChats,
    logoUrl,
    menu, singleChatMenu, onMenuItemClicked,
    noChatSelectedContent, children,
    headerBg, headerColor, headerHeight,
    mobileActionButton,
    noChatToListView,
    onChatTitle, renderChatItem, onMenuOptionState, onMenuOptionBadge,
    selectedMessage, setSelectedMessage
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const borderColor = useColorValue("dividerColor.light", "dividerColor.dark")
  const bgColor = useColorValue("cardBgHover.light", "cardBgHover.dark")
  const loadingColor = useColorValue("loadingColor.light", "loadingColor.dark")

  return (
    <Flex h="100vh" maxH="100vh" overflowY="hidden" w="100%" position="absolute" top="0" left="0" right="0" bottom="0">
        {/* Sidebar */}
        {/* 
            If the screen is not a mobile size(e.g PC), or it is, but no message is currently selected, 
            then show the sidebar.
        */}
        {(!isMobile || !selectedMessage)? (
            <Box    
                overflowY="hidden"
                display="flex !important" flexDirection="column" width={{base: "100%", md: "300px"}}
                borderRightWidth={{base: "0px", md: "1px"}}
                boxShadow="lg"
                borderColor={borderColor}
                bg={bgColor}
                >
                {/* Header Bar */}
                <Header
                    w="100%" height={headerHeight || "50px"}
                    borderRight="1px" borderColor={borderColor}
                    title={title} subTitle={subTitle} logoUrl={logoUrl} menu={menu} 
                    bg={headerBg || undefined} color={headerColor || undefined} 
                    onMenuItemClicked={onMenuItemClicked} onMenuOptionState={onMenuOptionState} 
                    onMenuOptionBadge={onMenuOptionBadge}
                />

                {/* Chats */}
                <Box px={2}
                pt={"0.5rem"} w="100%" h={`calc(100% - ${headerHeight || "50px"})`} pos="relative" overflowY="auto">
                    {
                        chats.length == 0? noChatToListView :
                        <>
                            {
                                chats.map((message) => {
                                    if(renderChatItem) {
                                        return (
                                            <Box key={message.id}>
                                                { renderChatItem(message) }
                                                <Box bg={borderColor} height="1px" width="100%"></Box>
                                            </Box>
                                        )
            
                                    } else {
                                        return (
                                            <>
                                                <ChatItem key={message.id} {...message} selected={selectedMessage?.id === message.id} onClick={() => setSelectedMessage(message)} />
                                                <Box bg={borderColor} height="1px" width="100%"></Box>
                                            </>
                                        )
                                    }
                                })
                            }
                            <Box h="80px"></Box>
                        </>
                    }
                    {
                        isLoadingChats? 
                        (
                            <HStack w="100%" p="15px" justifyContent="center" alignItems="center">
                                <Text fontWeight="bold" color="#080" as="div" display="none !important">V6&nbsp;</Text><Loading type={Loading.TYPES.threeDots} width="2rem" height="2rem" color={loadingColor} />
                            </HStack>
                        ) : null
                    }
                </Box>
            </Box>
        ) : null}
        

        {/* Main */}
        {/* 
            If the screen is not a mobile size(e.g PC), or it is, but a message is currently selected, 
            then show the main panel.
        */}
        {(!isMobile || selectedMessage)? (
            <Box pos="relative" width={{base: "100%", md: "calc(100% - 300px)"}}>
                {
                    selectedMessage?
                    <Header 
                        title={onChatTitle && selectedMessage? onChatTitle(selectedMessage) : null} 
                        subTitle={isMobile? subTitle : null}
                        onBackClicked={() => {
                            setSelectedMessage(null)
                        }} menu={singleChatMenu} 
                        bg={headerBg || undefined} color={headerColor || undefined} w="100%" height={headerHeight || "50px"} 
                        onMenuItemClicked={onMenuItemClicked} onMenuOptionState={onMenuOptionState} 
                        onMenuOptionBadge={onMenuOptionBadge} 
                        titleStyle={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: {base: "130px", md: "250px", lg: "300px"}
                        }}
                    /> : null
                }

                {/* Chat content */}
                <Box w="100%" h={`calc(100% - ${selectedMessage? headerHeight || "50px" : "0px"})`} overflow="hidden">
                    {selectedMessage ? children : noChatSelectedContent? noChatSelectedContent : <EmptyChat />}
                </Box>
            </Box>
        ) : null}
        

        {/* Mobile only: New message button */}
        {!selectedMessage && isMobile && mobileActionButton? mobileActionButton : null }
    </Flex>
  );
};

export default Messenger;
