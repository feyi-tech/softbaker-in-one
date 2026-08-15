import { useEffect, useState } from 'react'
import { 
    FaBell, FaBookmark, FaCogs, FaEnvelope, FaHistory, FaMoon, FaPlus, FaRegSave, FaSave, 
    FaSignOutAlt, FaStore, FaStoreAlt, FaSun, FaUser, FaUserAlt 
} from "react-icons/fa"
import { useBreakpointValue, useColorMode, useToast } from "@chakra-ui/react"

import PageBody from "@/components/PageBody/"
import useColorValue from "../../hooks/useColorValue"
import { LOGO_PATH } from "@/app-config";
import { useFrontbacked } from 'use-frontbacked';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';


interface AppPageBodyProps {
    bareBoneOnly?: boolean,
    pageLoading?: boolean, requiresAuth?: boolean,
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
    sidebarHeader?: any, mobileShowSideBarAsBottomNav?: boolean, showGoToUp?: string,
    [x: string]: any
}
const AppPageBody: React.FC<AppPageBodyProps> = ({appName,
    bareBoneOnly,
    pageLoading, requiresAuth,
    /* Props passed to the menu click callback so that auth related actions 
        can be performed within the menu option / menu file
    */
    pageState,
    /*App name, children and meta props props*/
    children, link, title, description, image, type, updatedTime, 

    /*Locale/Translation props*/
    translator, language,
    /* NavBar props */
    disableStickyNav,

    /*Nav and sidebar menu*/
    navMenu, sideBarMenu,

    /* Sidebar header*/
    sidebarHeader, mobileShowSideBarAsBottomNav, showGoToUp,

    ...props
}) => {

    const appNameColor = useColorValue('appNameColor.light', 'appNameColor.dark')
    //const { colorMode, toggleColorMode } = useColorMode()
    const colorMode = "light";
    const toggleColorMode = undefined;
    
    const colorModeLightIconActive = <FaSun color="rgb(255, 178, 55)" />
    const colorModeLightIconInActive = <FaSun />
    const colorModeDarkIconActive = <FaMoon color="rgb(154, 106, 255)" />
    const colorModeDarkIconInActive = <FaMoon />
    const colorModeBg = useColorValue("switchBg.light", "switchBg.dark")

    const navShadow = useColorValue('navbarShadow.light', 'navbarShadow.dark')
    const navBg = useColorValue('navbarBg.light', 'navbarBg.dark')
    const navColor = useColorValue('navbarColor.light', 'navbarColor.dark')
    const navColorHover = useColorValue('navbarColorHover.light', 'navbarColorHover.dark')
    const navHeight = "60px"

    const colorAccent = useColorValue("colorAccent.light", "colorAccent.dark")
    const sideBarShadow = useColorValue('sidebarShadow.light', 'sidebarShadow.dark')
    const sideBarBg = useColorValue("sidebarBg.light", "sidebarBg.dark")
    const sideBarColor = useColorValue('sidebarColor.light', 'sidebarColor.dark')
    const sideBarColorHover = useColorValue('sidebarColorHover.light', 'sidebarColorHover.dark')
    const sideBarWidth = "200px"
    const sideBarWidthCollapsed = "65px"

    const bg = useColorValue("pageBg.light", "pageBg.dark")
    const color = useColorValue("colorPrimary.light", "colorPrimary.dark")
    const loadingColor = useColorValue("colorAccent.light", "colorAccent.dark")

    const locale = {
        default: language,/*
        localesMap: locales,
        onLocaleName: (locale) => {
            return translator(`common:locale-name-${locale}`)
        },*/
        onLocaleIcon: null/*(locale) => {
        return <Box />
        }*/
    }

    const { user, authLoading } = useFrontbacked()
    const router = useRouter()
    const toast = useToast()
    useEffect(() => {
    if(!authLoading && !user && requiresAuth) {
      router.push("/login")

    }
  }, [user, authLoading])

    const [meetViewEnabled, enableMeetView] = useState<boolean>(false)
    const showMeetView = () => {
        enableMeetView(true)
    }

    const [profileMenuEnabled, enableProfileMenu] = useState<boolean>(false)
    const showProfileMenu = () => {
        enableProfileMenu(true)
    }

    const handleLogOut = () => {
        Swal.fire({
            text: "Are you sure you want to sign out?",
            confirmButtonText: "Yes", cancelButtonText: "No", showCancelButton: true
        })
        .then(r => {
            if(r.isConfirmed) {
                //Logout here
                pageState.auth.signOut()
                .then(() => {
                    toast({
                        description: "You're now signed out",
                        status: "success",
                        duration: 4000,
                        isClosable: true
                    })
                })
                .catch(() => {
                    toast({
                        description: "Failed to signout",
                        status: "success",
                        duration: 4000,
                        isClosable: true
                    })
                })
            }
        })
    }

    const placement = useBreakpointValue({base: "bottom", md: "left"}, {fallback: "bottom"})


    return (
        <PageBody pageLoading={pageLoading || (requiresAuth && authLoading)}
        pageState={{...(pageState || {}), router, showMeetView, showProfileMenu}}
        /*App name, children and meta props props*/
        appName={appName} appNameColor={appNameColor} appLogo={LOGO_PATH}
        link={link} title={title} description={description} 
        image={image} type={type} updatedTime={updatedTime} 

        /*Locale/Translation props*/
        translator={translator} locale={locale} 

        /*Theme props*/
        colorModeBg={colorModeBg} colorMode={colorMode} onToggleColorMode={toggleColorMode}
        colorModeLightIconActive={colorModeLightIconActive} 
        colorModeLightIconInActive={colorModeLightIconInActive}
        colorModeDarkIconActive={colorModeDarkIconActive} 
        colorModeDarkIconInActive={colorModeDarkIconInActive}
        
        /* NavBar props */
        disableStickyNav={disableStickyNav}
        navBg={navBg} navColor={navColor} navColorHover={navColorHover} 
        navShadow={navShadow} navHeight={navHeight}

        /* SideBar props */
        sideBarBg={{base: sideBarBg, md: sideBarBg}} sideBarColor={sideBarColor} 
        sideBarColorHover={sideBarColorHover} sideBarShadow={sideBarShadow} 
        sideBarBarWidth={sideBarWidth} sideBarBarCollapsedWidth={sideBarWidthCollapsed}

        /* Page colors and loading view color */
        bg={bg} color={color} loadingColor={loadingColor}

        /*Nav and sidebar menu*/
        navMenu={navMenu} sideBarMenu={sideBarMenu} 
        sidebarHeader={null} 
        mobileShowSideBarAsBottomNav={
            mobileShowSideBarAsBottomNav === undefined || mobileShowSideBarAsBottomNav === null? 
            true : mobileShowSideBarAsBottomNav
        } bareBoneOnly={bareBoneOnly} showGoToUp={showGoToUp} {...props}>
            {children}
        </PageBody>
    )
}

export default AppPageBody