import React, { useEffect, useState } from 'react';
import {
  Flex,
  VStack,
  IconButton,
  Icon,
  Heading,
  Text,
  useBreakpointValue, Menu, MenuButton,
  MenuList, MenuItem as MI, Image, Badge, Box, HStack, useDisclosure
} from '@chakra-ui/react';
import { FaChevronLeft, FaEllipsisV, FaPlus, FaTimes } from 'react-icons/fa';
import { Header as HeaderProps, MenuItem } from '../types';
import { getStatusColor } from '../utils';
import Loading from '../../widgets/Loading';
import Link from '../../widgets/Link';
import useColorValue from '@/root/src/hooks/useColorValue';


const MENU_OPTION_DISABLED_OPACITY = 0.2
const Header: React.FC<HeaderProps> = ({ 
  title, subTitle, logoUrl, onBackClicked, onMenuItemClicked, onMenuOptionState, onMenuOptionBadge,
  menu, bg, background, color, height, 
  titleStyle,
  ...props 
}) => {
  //If menu menu items that will show beside the dropdown menu
  const [outsideMenu, setOutsideMenu] = useState<MenuItem[]>([]);

  //If menu menu items that will show inside the dropdown menu
  const [insideMenu, setInsideMenu] = useState<MenuItem[]>([]);

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const cardBg = useColorValue("cardBg.light", "cardBg.dark")
  const cardBgHover = useColorValue("cardBgHover.light", "cardBgHover.dark")

  useEffect(() => {
    const outMenu: MenuItem[] = []
    const inMenu: MenuItem[] = []

    if(menu && menu.length > 0) {
      for(var i = 0; i < menu.length; i++) {
        const menuItem = menu[i]
        if(isMobile && menuItem.onlyDesktop || (!isMobile && menuItem.onlyMobile)) continue;
        if(showOutSideMenu(menuItem, menu.length, i)) {
          outMenu.push(menuItem)

        } else {
          inMenu.push(menuItem)
        }
      }
      setOutsideMenu(outMenu)
      setInsideMenu(inMenu)
    }
  }, [menu, isMobile])

  /*
  const [href, setHref] = useState("/")
  useEffect(() => {
    setHref(window.location.href)
    const handlePopState = (event: any) => {
      if (onBackClicked) {
        event.preventDefault();
        window.history.replaceState(null, '', href);
        onBackClicked()
        console.log("handlePopState:2", event, onBackClicked)
      }
    };
  
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBackClicked]);*/
  
  

  const showOutSideMenu = (item: MenuItem, menuSize: number, index: number) => {
    return item.showAlways || (item.showIfRoom && index !== menuSize - 1)
  }
  

  return (
    <Flex display="flex !important" h={height || "40px"} px={2} {...props} justify="space-between" align="center" mb={0} bg={bg || background || "transparent"}>
      <Flex align="center" display="flex !important">
        {
          onBackClicked?
          <IconButton
          aria-label="Toggle Sidebar"
          icon={<Icon as={FaChevronLeft} />}
          onClick={onBackClicked}
          variant="ghost"
          size="sm"
          mr={2}
          /> : null
        }
        {
          logoUrl? 
          <Link as={menu && menu.length > 0? Box : Link} href="/" onClick={onToggle}>
            <Image src={logoUrl} alt={title || ""} width="21px" height="21px" mr={2} />
          </Link> : null
        }
        <VStack justifyContent="flex-start" alignItems="flex-start" gap="0 !important"
        onClick={onToggle} cursor="pointer">
          <Heading size="sm" color={color} mb="0px !important" {...(titleStyle || {})}>{title}</Heading>
          {subTitle? <Text as="div" fontSize="11px" fontWeight="600" color={color} m="0px !important">{subTitle}</Text> : null}
        </VStack>
      </Flex>

      {
        menu && menu.length > 0?
        <Flex align="center" display="flex !important">
          {
            outsideMenu.map((item, index) => onMenuOptionState && onMenuOptionState(item.id) != "hide"?  (
              <Box key={`menu_item_${item.id}`} position="relative" display="inline-block !important" 
              opacity={['disable', 'loading'].includes(onMenuOptionState(item.id)) ? `${MENU_OPTION_DISABLED_OPACITY} !important` : 1}
              className={['disable', 'loading'].includes(onMenuOptionState(item.id))? "cursor-not-allowed-deep" : ""}
              onClick={() => {
                if (onMenuItemClicked && !['disable', 'loading'].includes(onMenuOptionState(item.id))) onMenuItemClicked(item.id);
              }}>
                <Box pos="relative" ml={2}>
                  <IconButton
                    key={item.id}
                    title={item.title}
                    aria-label={item.title}
                    icon={item.icon}
                    colorScheme={color}
                    variant="ghost"
                    size="sm"
                  />
                  {
                    onMenuOptionState(item.id) == "loading"?
                    (
                      <HStack justifyContent="center" alignItems="center" w="100%" h="100%"
                          opacity="1"
                          fontSize="xs"
                          position="absolute"
                          top="0" left="0" 
                          m="0px !important" p="0px !important"
                        >
                        <Loading type={Loading.TYPES.tailSpin} color={getStatusColor(onMenuOptionBadge? onMenuOptionBadge(item.id)?.status : null)} 
                        width="1.3rem" height="1.3rem" />
                      </HStack>
                    )
                    : null
                  }
                </Box>
                {
                  onMenuOptionBadge && (onMenuOptionBadge(item.id)?.counts || 0) > 0? (
                  <Badge rounded="7px" 
                    background={`${getStatusColor(onMenuOptionBadge(item.id)?.status)} !important`}
                    color="#fff"
                    fontSize="xs"
                    position="absolute"
                    top="5px"
                    right="5px"
                    transform="translate(50%, -50%)"
                  >
                    {onMenuOptionBadge(item.id)?.counts || 0}
                  </Badge>
                ) : null}
              </Box>
            ) : null
          )}
          
          {
            
            insideMenu.length > 0?
            <Menu isOpen={isOpen} onClose={onClose}>
              <MenuButton
                onClick={onToggle}
                as={IconButton}
                color={color}
                aria-label="Menu"
                icon={<Icon as={isOpen? FaTimes : FaEllipsisV} />}
                variant="ghost"
                size="sm"
              />

              <MenuList bg={cardBg} id="header" zIndex="10">
                {
                  insideMenu.map((item, index) => onMenuOptionState && onMenuOptionState(item.id) != "hide"?  (
                    <MI key={item.id} title={item.title} aria-label={item.title} 
                    opacity={['disable', 'loading'].includes(onMenuOptionState(item.id))? `${MENU_OPTION_DISABLED_OPACITY} !important` : 1}
                    className={['disable', 'loading'].includes(onMenuOptionState(item.id))? "cursor-not-allowed-deep" : ""} 
                    bg={cardBg}
                    _hover={{
                      bg: cardBgHover
                    }}
                    onClick={() => {
                      if(onMenuItemClicked && onMenuOptionState(item.id) != "disable") onMenuItemClicked(item.id)
                    }}>
                      <HStack justifyContent="space-between" alignItems="center" w="100%">
                        <HStack justifyContent="flex-start" alignItems="center">
                          {item.icon? (
                            <IconButton as="div"
                              aria-label={item.title}
                              icon={item.icon}
                              variant="ghost"
                              size="sm"
                            />
                          ) : null}
                          <Text as="div" mb="0 !important" ml={item.icon ? 2 : 0} color={color}>{item.title}</Text>
                          {
                            onMenuOptionBadge && (onMenuOptionBadge(item.id)?.counts || 0) > 0? (
                              <Badge rounded="7px" 
                                background={`${getStatusColor(onMenuOptionBadge(item.id)?.status)} !important`}
                                color="#fff"
                                fontSize="xs"
                                transform="translate(50%, -50%)"
                              >
                                {onMenuOptionBadge(item.id)?.counts || 0}
                              </Badge>
                            ) : null
                          }
                        </HStack>
                        {
                          onMenuOptionState(item.id) == "loading"?
                          (
                            <HStack justifyContent="center" alignItems="center" justifySelf="flex-end"
                                opacity="1"
                                cursor={'not-allowed !important'}
                                fontSize="xs"
                                m="0px !important" p="0px !important"
                              >
                              <Loading type={Loading.TYPES.tailSpin} color={getStatusColor(onMenuOptionBadge? onMenuOptionBadge(item.id)?.status : null)} 
                              width="1.3rem" height="1.3rem" />
                            </HStack>
                          )
                          : null
                        }
                      </HStack>
                    </MI>
                  ) : null
                )}
              </MenuList>
            </Menu> : null
          }
          <style jsx>
            {
              `
              .cursor-not-allowed-deep {
                cursor: not-allowed
              }
              .cursor-not-allowed-deep * {
                cursor: not-allowed
              }`
            }
          </style>
        </Flex> : null
      }
    </Flex>
  );
};

export default Header;
