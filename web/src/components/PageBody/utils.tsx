
import {
    Menu as ChakraMenu,
    MenuButton,
    MenuList,
    MenuItem as ChakraMenuItem,

    Box, HStack, Text
} from "@chakra-ui/react"
import { SubMenu, MenuItem } from 'react-pro-sidebar';
import Link from "@/components/widgets/Link";
import { Menu as MenuType } from "./index.types";
import { FaChevronDown } from "react-icons/fa";
import { useRouter } from "next/router";

const defaultTranlator = (key?: string) => {
    return key
}

interface SideBarLinkMenuItem {
    href: string,
    children: any,
    icon?: any,
    [x: string]: any
}
const SideBarLinkMenuItem: React.FC<SideBarLinkMenuItem> = ( { children, href, icon, ...props }) => {
    const router = useRouter()
    return (
        <Link as={MenuItem} icon={icon} href={href} onClick={(e: any) => {
            e.preventDefault()
            router.push(href)
        }} {...props}>
            {children}
        </Link>
    )
}
export const createMenuOption = (
    { children, title, onIcon, onTitle, onClick, forceMobileDisplay, href }: MenuType, 
    i: number, router?: any, 
    pageState?: any, color?: any, colorHover?: any, 
    isSideBar?: boolean, navAsSideBar?: boolean, 
    isChild?: boolean
): any => {
   
    const titleText = onTitle? onTitle(title, pageState) : title

    if(Array.isArray(children)) {
        
        if(isSideBar) {
            return (
                <Box textTransform="capitalize" as={SubMenu} 
                display={{
                    base: "block", 
                    lg: navAsSideBar? "none" : "block"
                }} label={titleText}key={i} 
                icon={onIcon? onIcon(pageState) : null}>
                    {
                        children.map((v, j) => {
                            return createMenuOption(
                                v, j, 
                                router,
                                pageState, color, colorHover, isSideBar, navAsSideBar, true
                            )
                        })
                    }
                </Box>
            )

        } else {
            return (
                <ChakraMenu>
                    <MenuButton display={{base: "none", lg: "inline-flex"}} cursor="pointer">
                        <HStack mr={{base: "0.5rem !important", lg: "2rem !important"}}
                        justifyContent="center" alignItems="center" whiteSpace="nowrap" 
                        textOverflow="ellipsis" overflow="hidden">
                            <HStack justifyContent="flex-start" alignItems="center">
                                {
                                    onIcon?
                                    <Box mr="5px">
                                        {onIcon(pageState)}
                                    </Box>
                                    :
                                    null
                                }
                                <Box textTransform="capitalize" as="span" 
                                aria-label={onTitle? onTitle(title, pageState) : title}
                                display="inline-flex">
                                    {onTitle? onTitle(title, pageState) : title}
                                </Box>
                            </HStack>
                            <Box as={FaChevronDown} />
                        </HStack>
                    </MenuButton>
                    <MenuList zIndex={100} display="flex" flexDirection="column"
                        justifyContent="flex-start" alignItems="flex-start">
                        {
                            children.map((v, j) => {
                                return createMenuOption(
                                    v, j, router, 
                                    pageState, color, colorHover, isSideBar, navAsSideBar, true
                                )
                            })
                        }
                    </MenuList>
                </ChakraMenu>
            )
        }
    }
    
    const handleMenuClick = (e: any) => {
        if(onClick) onClick(e, pageState)
    }

    if(isSideBar) {
        //return <Text>H1</Text>
        if(onClick) {
            return (
                <Box 
                    display={{
                        base: navAsSideBar && forceMobileDisplay? "none" : "block", 
                        lg: navAsSideBar? "none" : "block"
                    }} 
                    cursor="pointer" 
                    as={MenuItem} 
                    key={i} 
                    onClick={handleMenuClick} 
                    color={color} 
                    _hover={{color: colorHover}}
                    icon={onIcon? onIcon(pageState) : null}
                    textTransform="capitalize"
                > 
                    {titleText}
                </Box>
            )
    
        } else {//return <Text>H1</Text>
            return (
                <SideBarLinkMenuItem display={{
                    base: navAsSideBar && forceMobileDisplay? "none" : "block", 
                    lg: navAsSideBar? "none" : "block"
                }}
                key={i} href={href || "#"} 
                color={color} _hover={{color: colorHover}}
                icon={onIcon? onIcon(pageState) : null}
                textTransform="capitalize"
                > 
                    {titleText}
                </SideBarLinkMenuItem>
            )
        }

    } else {
        if(onClick) {
            if(isChild) {
                return (
                    <Box as={ChakraMenuItem} key={i} className="dropdown-item" p="7px" 
                    cursor="pointer" onClick={(e) => {
                        onClick(e, pageState)
                    }} 
                    color={color} _hover={{color: colorHover}} 
                    display="flex" justifyContent="flex-start" alignItems="center">
                        <Box mr={titleText? "5px" : "0px"}>
                            {onIcon? onIcon(pageState) : null}
                        </Box>
                        {
                            titleText?
                            <Box textTransform="capitalize">
                                {titleText}
                            </Box>
                            : null
                        }
                    </Box>
                )

            } else {
                return (
                    <Box key={i} 
                    display={{base: forceMobileDisplay? "flex" : "none", lg: "flex"}} 
                    justifyContent="flex-start" alignItems="center"
                    mr={{base: "0.5rem !important", lg: "2rem !important"}} 
                    cursor="pointer" onClick={(e) => {
                        onClick(e, pageState)
                    }} 
                    color={color} _hover={{color: colorHover}}>
                        <Box mr={titleText? "5px" : "0px"}>
                            {onIcon? onIcon(pageState) : null}
                        </Box>
                        {
                            titleText?
                            <Box textTransform="capitalize">
                                {titleText}
                            </Box>
                            : null
                        }
                    </Box>
                )
            }
    
        } else {
            if(isChild) {
                return (
                    <Link as={ChakraMenuItem} key={i} className="dropdown-item" 
                    p="7px !important" 
                    href={href || "#"} color={color} _hover={{color: colorHover}} 
                    display="flex" justifyContent="flex-start" alignItems="center">
                        <Box mr={titleText? "5px" : "0px"}>
                            {onIcon? onIcon(pageState) : null}
                        </Box>
                        {
                            titleText?
                            <Box textTransform="capitalize">
                                {titleText}
                            </Box>
                            : null
                        }
                    </Link>
                )

            } else {
                return (
                    <Link key={i} 
                    display={{base: forceMobileDisplay? "flex" : "none", lg: "flex"}} 
                    mr={{base: "0.5rem !important", lg: "2rem !important"}} href={href || "#"} 
                    justifyContent="flex-start" alignItems="center"
                    color={color} _hover={{color: colorHover}}>
                        <Box mr={titleText? "5px" : "0px"}>
                            {onIcon? onIcon(pageState) : null}
                        </Box>
                        {
                            titleText?
                            <Box textTransform="capitalize">
                                {titleText}
                            </Box>
                            : null
                        }
                    </Link>
                )
            }
        }
    }
    
}