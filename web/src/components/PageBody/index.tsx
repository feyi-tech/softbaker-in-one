import {
    Box, HStack, VStack
} from "@chakra-ui/react"
import { Sidebar, Menu, useProSidebar } from 'react-pro-sidebar';
import Logo from './Logo'
import LoadingPage from "@/components/widgets/LoadingPage";
import { FaBars, FaChevronUp } from 'react-icons/fa';
import LocaleSwitch from './LocaleSwitch';
import ThemeSwitch from './ThemeSwitch';
import PageTitle from './PageTitle';
import { useEffect, useState } from 'react';
import { createMenuOption } from "./utils";
import usePageLoadState from "../../hooks/usePageLoadState";
import { Menu as MenuType } from "./index.types";
import Loading from "../widgets/Loading";
import Section from "../widgets/Section";
import useColorValue from "../../hooks/useColorValue";

interface PageBodyProps {
    pageLoading?: boolean, bareBoneOnly?: boolean,
    /* Props passed to the menu click callback so that auth related actions 
        can be performed within the menu option / menu file
    */
    pageState?: any,
    /*App name, children and meta props props*/
    children?: any, link?: string, title?: any, description?: any, image?: string, type?: string, updatedTime?: any, 

    /*Locale/Translation props*/
    translator?: any, language?: string,
    /* NavBar props */
    disableStickyNav?: boolean,

    /*Nav and sidebar menu*/
    navMenu?: any, sideBarMenu?: any,

    /* Sidebar header*/
    sidebarHeader?: any, mobileShowSideBarAsBottomNav?: boolean, hideSideMenu?: boolean, showGoToUp?: string,
    [x: string]: any
}

interface AnyMap {
    [x: string]: any
}

interface LocaleMap {
    [x: string]: { [x: string]: any }
}

const PageBody: React.FC<PageBodyProps> = ({
    pageLoading, bareBoneOnly,
    /* Props passed to the menu click callback so that auth related actions 
        can be performed within the menu option / menu file
    */
    pageState={},
    /*App name, children and meta props props*/
    appName, appNameColor, appLogo,
    children, link, title, description, image, type, updatedTime, 

    /*Locale/Translation props*/
    translator=null, locale=null, 

    /*Theme props*/
    colorModeBg, colorMode, onToggleColorMode,
    colorModeLightIconActive, colorModeLightIconInActive,
    colorModeDarkIconActive, colorModeDarkIconInActive,
    
    /* NavBar props */
    disableStickyNav,
    navBg, navBackground, navColor, navColorHover, navShadow, navHeight,

    /* SideBar props */
    sideBarBg, sideBarBackground, sideBarColor, sideBarColorHover, sideBarShadow, 
    sideBarBarWidth, sideBarBarCollapsedWidth,

    //* Page colors and loading view color */
    bg, color, loadingColor,

    /*Nav and sidebar menu*/
    navMenu, sideBarMenu, 
    
    /*SideBar Header*/
    sidebarHeader, mobileShowSideBarAsBottomNav, hideSideMenu, showGoToUp,

    ...props
}) => {
    const [router, setRouter] = useState<{}>({})//useRouter()
    const isPageLoading = usePageLoadState()
    const [lang, setLang] = useState<string>()
    const [localesMap, setLocalesMap] = useState<AnyMap>()
    const colorAcent = useColorValue("colorAccent.light", "colorAccent.dark")
    useEffect(() => {
        setLang(locale?.default)
        setLocalesMap(locale?.localesMap)

    }, [locale])
    
    const handleJump = () => {
        console.log("target:called", showGoToUp);
        if (showGoToUp) {
            console.log("target:willRun", showGoToUp);
            const target = document.getElementById(showGoToUp);
            console.log("target:", target);
            if (target) {
                console.log("target:willCallScroll", target.offsetTop);
                
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };    

    const defaultNavBg = "#fff"
    const defaultNavColor = "#000"
    const defaultNavColorHover = "#000"
    const defaultNavShadow = "0px 5px 21px -5px #CDD1E1"
    const defaultNavHeight = "60px"

    const defaultSideBarBg = '#011b33'
    const defaultSideBarColor = '#fff'
    const defaultSideBarColorHover = "#000"
    const defaultSideBarShadow = "0px 5px 21px -5px #CDD1E1"
    const defaultSideBarBarWidth = "250px"
    const defaultSideBarBarCollapsedWidth = "70px"

    const defaultBg = "#dfdfdf"
    const defaultColor = "#333"
    const defaultLoadingColor = "#FE7E26"


    const { collapseSidebar, toggleSidebar, collapsed, toggled, broken, rtl } = useProSidebar();

    //(localesMap || {})[lang || "en-US"]?.isRTL
    const [isRTL, setIsRTL] = useState<boolean>(false)

    useEffect(() => {
        //setIsRTL(rtl)
        
    }, [rtl])

    const getDimesion = (size?: any, onNumberPart?: any) => {
        if(!onNumberPart) return size
        let numberPart; let unitPart;
        if(size.toLowerCase().endsWith('px')) {
            numberPart = size.split('px')[0]
            unitPart = 'px'

        } else if(size.toLowerCase().endsWith('%')) {
            numberPart = size.split('%')[0]
            unitPart = '%'

        } else if(size.toLowerCase().endsWith('rem')) {
            numberPart = size.split('rem')[0]
            unitPart = 'rem'

        } else if(size.toLowerCase().endsWith('em')) {
            numberPart = size.split('em')[0]
            unitPart = 'em'

        } else if(!isNaN(size)) {
            numberPart = size
            unitPart = 'px'

        } else {
            numberPart = size
            unitPart = ''
        }

        return `${onNumberPart(numberPart)}${unitPart}`
    }

    
    if(isPageLoading || pageLoading) {

        return (
            <LoadingPage
                link={link} title={title} description={description} 
                bg={bg || defaultBg} color={loadingColor || defaultLoadingColor}
            />
        )
    }

    if(bareBoneOnly) {
        return (
            <>
                <PageTitle link={link} title={title} description={description} image={image} type={type} updatedTime={updatedTime} />
                {children}
            </>
        )
    }
    
    
    return (
        <Box w="100%" h="100vh" dir={isRTL? 'rtl' : 'ltr'} overflow="hidden">
            <PageTitle link={link} title={title} description={description} image={image} type={type} updatedTime={updatedTime} />
            
            <Box display="flex" h="100%" overflow="hidden" 
            flexDirection={{base: mobileShowSideBarAsBottomNav? "column-reverse" : "row", md: "row"}} 
            >

                {hideSideMenu || !sideBarMenu? null :
                <VStack h="100%" as={Sidebar}
                backgroundColor={sideBarBg || sideBarBackground || defaultSideBarBg} 
                color={sideBarColor || defaultSideBarColor} 
                border="0px !important"
                display={{
                    base: toggled || mobileShowSideBarAsBottomNav? "flex" : "none", 
                    md: sideBarMenu.length > 0? "flex" : "none"
                }} 
                flexDirection={{base: mobileShowSideBarAsBottomNav? "row" : "column", md: "row"}}
                justifyContent="flex-start" alignItems="center">
                        
                    <Box display={{base: mobileShowSideBarAsBottomNav? "none" : "block", md: "block"}} 
                    px="20px">
                        {sidebarHeader}
                    </Box>
                    
                    <Menu>
                        {
                            (sideBarMenu || []).map((value: MenuType , index: number) => {
                                return createMenuOption(
                                    value, index, 
                                    router,
                                    pageState,
                                    sideBarColor || defaultSideBarColor,
                                    sideBarColorHover || defaultSideBarColorHover,
                                    true
                                )
                            })
                        }
                        {//Put the navbar on the sidebar for mobile devices but hide it on desktop
                            (navMenu || []).map((value: MenuType , index: number) => {
                                return createMenuOption(
                                    value, index, 
                                    router, 
                                    pageState,
                                    sideBarColor || defaultSideBarColor,
                                    sideBarColorHover || defaultSideBarColorHover,
                                    true, true
                                )
                            })
                        }
                    </Menu>
                    
                    
                    <style>
                        {`
                            aside {
                                border: 0px !important;
                                width: ${sideBarBarWidth || defaultSideBarBarWidth}!important;
                                min-width: ${sideBarBarWidth || defaultSideBarBarWidth}!important;
                            }
                            aside.ps-collapsed {
                                width: ${sideBarBarCollapsedWidth || defaultSideBarBarCollapsedWidth}!important;
                                min-width: ${sideBarBarCollapsedWidth || defaultSideBarBarCollapsedWidth}!important;
                            }
                            ${
                                mobileShowSideBarAsBottomNav?
                                `@media (max-width: 576px) { 
                                    aside.ps-sidebar-root {
                                        position: fixed !important;
                                        bottom: 0px !important;
                                        left: 0px !important;
                                        right: 0px !important;
                                        z-index: 1000;
                                        border-top-left-radius: 0.5rem;
                                        border-top-right-radius: 0.5rem;
                                    }
                                    aside, aside.ps-collapsed {
                                        width: 100%!important;
                                        min-width: 100%!important;
                                        overflow-x: hidden;
                                        overflow-y: hidden;
                                        bottom: 0!important;
                                        position: absolute!important;
                                        height: 55px!important;
                                        max-height: 55px!important;
                                        padding-top: 0px!important;
                                        padding-bottom: 0px!important;
                                    }
                                    .ps-menu-root ul {
                                        display: flex;
                                        flex-direction: row;
                                        justify-content: space-between
                                    }
                                    .ps-menu-button {
                                        display: flex;
                                        flex-direction: column;
                                        padding-right: 5px !important;
                                        padding-left: 5px !important;
                                    }
                                    .ps-menu-icon {
                                        margin-right: 0!important;
                                        width: 35px!important;
                                        min-width: 35px!important;
                                        height: 35px!important;
                                        line-height: 35px!important;
                                        border-radius: 0px!important;
                                    }
                                    .ps-menu-label {
                                        font-size: 11px
                                    }
                                    .toggle-button {
                                        display: none !important;
                                    }
                                }`
                                :
                                ""
                            }
                            
                            .ps-menu-button:hover {
                                background: rgba(255,255,255,.03) !important;
                            }
                            .ps-submenu-content {
                                background: rgba(255,255,255,.05) !important;
                            }
                            .ps-sidebar-container { width: 100% !important; background: transparent !important;}
                        `}
                    </style>
                </VStack>
                }
                
                <Box as="main" w="100%" pos="relative" overflowX="hidden" h="100vh" overflow="hidden">
                    { !navMenu? null :
                    <HStack 
                    color={navColor || defaultNavColor}
                    bgColor={navBg || navBackground || defaultNavBg} 
                    boxShadow={navShadow || defaultNavShadow} 
                    pos={!disableStickyNav? "sticky" : "relative"}
                    top={{base: "0", md: 0}} zIndex="100"
                    w="100%" h={navHeight || defaultNavHeight} 
                    px={{base: "0.1rem", md: "1rem"}} py="1rem" 
                    justifyContent="space-between" alignItems="center">
                        
                        <HStack justifyContent="flex-start" alignItems="center">
                            {/*Desktop button*/}
                            <Box className="toggle-button" 
                            display={{base: "none", md: sideBarMenu.length > 0? "block" : "none"}} 
                            cursor="pointer" 
                            onClick={() => collapseSidebar()}>
                                <FaBars />
                            </Box> 
                            {/*Mobile button*/}
                            <Box className="toggle-button" mr="0rem"
                            display={{
                                base: sideBarMenu.length > 0 || JSON.stringify(navMenu || []).includes("forceMobileDisplay")? "block" : "none", 
                                md: "none"
                            }} 
                            cursor="pointer" p="0.3rem"
                            onClick={() => toggleSidebar()}>
                                <FaBars size="22px" />
                            </Box>
                            <Logo name={appName} color={appNameColor} logo={appLogo} maxWidth="none !important" 
                            onClick={(e: any) => {
                                e.preventDefault()
                                toggleSidebar()
                            }}
                                //set the logo size as 80% of the nav height 
                                logoSize={21} 
                            />
                        </HStack>

                        <HStack justifyContent="flex-end" alignItems="center" w="100%">

                            <HStack display="flex" mr="1rem" maxWidth="80%" overflow="hidden"
                            justifyContent="flex-start" alignItems="center">
                            {
                                navMenu.map((value: MenuType , index: number) => {
                                    return createMenuOption(
                                        value, index, 
                                        router, 
                                        pageState,
                                        navColor || defaultNavColor,
                                        navColorHover || defaultNavColorHover,
                                        false
                                    )
                                })
                            }
                            </HStack>

                            {
                                onToggleColorMode?
                                <ThemeSwitch colorModeBg={colorModeBg} colorMode={colorMode} onToggleColorMode={onToggleColorMode} 
                                colorModeLightIconActive={colorModeLightIconActive} 
                                colorModeLightIconInActive={colorModeLightIconInActive}
                                colorModeDarkIconActive={colorModeDarkIconActive}
                                colorModeDarkIconInActive={colorModeDarkIconInActive}
                                marginInlineStart={!isRTL? "0px !important" : {base: "7px !important", md: "12px !important"}}  
                                marginInlineEnd={!isRTL? {base: "7px !important", md: "12px !important"} : "0px !important"} />
                                :
                                null
                            }
                        </HStack>
                        
                    </HStack>
                    }
                    <Box w="100%" h={navMenu? "calc(100vh - 60px)" : "100vh"} position="relative" bg={bg || defaultBg}
                    overflowX="hidden" overflowY="auto" 
                    pb={{base: "120px"}} color={color || defaultColor} {...props}>
                        {children}
                        {
                            showGoToUp?
                            <HStack /*cursor="pointer" onClick={handleJump}*/ as="a" href={`#${showGoToUp}`} borderRadius="50%" justifyContent="center" alignItems="center"
                            pos="fixed" 
                            right={{base: "20px", md: "40px"}} 
                            bottom="25px" 
                            zIndex="50" 
                            w={{base: "40px", md: "60px"}} 
                            h={{base: "40px", md: "60px"}}
                            bg={colorAcent} color="white" 
                            boxShadow="0 4px 29px 0 rgba(0, 0, 0, 0.3)" 
                            transition="background-color 200ms ease">
                                <FaChevronUp />
                            </HStack>
                            : null
                        }
                    </Box>
                    {
                        !sideBarMenu? null : 
                        <Box bg="rgba(0,0,0,.5)" pos="absolute" top="0" left="0" right="0" bottom="0" 
                        zIndex="100"
                        onClick={() => toggleSidebar()}
                        display={{base: mobileShowSideBarAsBottomNav? "none" : toggled? "block" : "none", md: "none"}} />
                    }
                </Box>
            </Box>
            <style>
                {`
                    body {
                        overflow-y: hidden;
                        max-height: 100vh;
                    }
                `}
            </style>
            {
                isPageLoading || pageLoading?
                <Box w="100%" h="100vh" bg={bg || "#fff"} opacity="0.5">
                    <Section display="flex" justifyContent="center" alignItems="center" h="50vh">
                        <Loading
                            style={{display: "inline !important"}}
                            width={"70px"}
                            height={"70px"}
                            color={color}
                            type={Loading.TYPES.threeDots} />
                    </Section>
                </Box>
                : null
            }
        </Box>
    )
}

export default PageBody