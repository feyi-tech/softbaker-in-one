
//import { StaticI18nLink } from "../../i18n-browser";
import { useColorModeValue, Text, Box, ResponsiveValue } from "@chakra-ui/react"
import L from 'next/link'
import router from "next/router";
import { useRouter } from 'next/router'
import { FaExternalLinkAlt, FaLink } from 'react-icons/fa';

interface LinkProps {
    forNav?: any, 
    href?: string, 
    isExternal?: boolean, 
    disableExternalIcon?: boolean, 
    showIcon?: any, 
    children?: any, 
    target?: string, 
    _hover?: ResponsiveValue<any>, 
    color?: ResponsiveValue<any>,
    disabled?: boolean,
    [x: string]: any
}
const Link: React.FC<LinkProps> & {localise: (href: string, lang: string) => string} = ({
    forNav, href, isExternal, disableExternalIcon, showIcon, children, target, 
    _hover, color, disabled,
    ...props
}) => {
    const lang = null//{ lang } = useTranslation()
    const router = useRouter()

    let link = href;/*
    if(isExternal) {
        link = href
        
    } else if (!lang) {
        link = href || router.asPath

    } else {
        link = href? 
            `/${lang}${href.replace(`/${lang}`, '')}`
            : 
            router.pathname.replace("[locale]", lang)
            
    }*/
    return (
        <Text as={L} href={link || "#"} 
        cursor="pointer"
        {...props}
        color={color || forNav? "inherit" : useColorModeValue("colorAccent.light", "colorAccent.dark")}
        target={target || (isExternal? "_blank" : "_self")}
        _hover={{
            color: forNav? useColorModeValue("colorAccent.light", "colorAccent.dark") : "inherit",
            ..._hover
        }}>
            {children} {!disableExternalIcon && (target == "_blank" || isExternal)? <Box as={FaExternalLinkAlt} mx="2px" display="inline" /> : showIcon? <Box as={FaLink} mx="2px" display="inline" /> : null}
        </Text>
    )
    /*
    return (
        <Text as={L} href={link || "#"}>
            <Text as={"a"} 
            cursor="pointer"
            href={link || "#"}
            {...props}
            color={color || forNav? "inherit" : useColorModeValue("colorAccent.light", "colorAccent.dark")}
            target={target || (isExternal? "_blank" : "_self")}
            _hover={{
                color: forNav? useColorModeValue("colorAccent.light", "colorAccent.dark") : "inherit",
                ..._hover
            }}
            >
                {children} {!disableExternalIcon && (target == "_blank" || isExternal)? <Box as={FaExternalLinkAlt} mx="2px" display="inline" /> : showIcon? <Box as={FaLink} mx="2px" display="inline" /> : null}
            </Text>
        </Text>
    )*/
}

Link.localise = (href, lang) => {
    if (!lang) {
      return href

    } else {
      return `/${lang}${href}`
    }
}
/*
export const buildLink = (href, options) => {
    if(!options?.isContractAddress) return href
    if(isProduction()) {
        return BLOCK_CHAIN_ADDRESS_SCAN_PREFIX.main + href

    } else {
        return BLOCK_CHAIN_ADDRESS_SCAN_PREFIX.test + href
    }
}*/

export default Link