import { extendTheme } from "@chakra-ui/react"
// Extend the theme to include custom colors, fonts, etc
export const colors = {
  errorColor: {
    light: "rgb(246, 70, 93)",
    dark: "rgb(246, 70, 93)"
  },
  pageBg: {
    light: "#EEF0F8",
    dark: "rgb(4, 6, 12)"
  },
  dropDownBg: {
    light: "#EEF0F8",
    dark: "rgb(4, 6, 12)"
  },
  colorPrimary: {
    light: "#676B79",
    dark: "#dcdcdc"
  },
  colorTitle: {
    light: "#333",
    dark: "#fff"
  },
  colorAccent: {
    light: "rgb(254,127,38)",
    dark: "rgb(254,127,38)"
  },
  switchBg: {
    light: "#EEF0F8",
    dark: "rgb(4, 6, 12)"
  },
  appNameColor: {
    light: "#FE7E26",
    dark: "#FE7E26"
  },
  navbarShadow: {
    light: "0px 5px 21px -5px #CDD1E1",
    dark: "0px 5px 21px -5px #0D1121"
  },
  navbarBg: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(24, 26, 32)"
  },
  cardBg: {
    light: "rgb(255, 255, 255)",
    dark: "rgb(24, 26, 32)"
  },
  cardBgHover: {
    light: "rgb(245, 245, 245)",
    dark: "rgb(34, 36, 42)"
  },
  dividerColor: {
    light: "gray.200",
    dark: "gray.800"
  },
  loadingColor: {
    light: "#1A202C",
    dark: "#E2E8F0"
  },
  navbarColor: {
    light: "#676B79",
    dark: "#dcdcdc"
  },
  navbarColorHover: {
    light: "rgb(254,127,38)",
    dark: "rgb(254,127,38)"
  },
  sidebarShadow: {
    light: "none",
    dark: "none"
  },
  sidebarBg: {
    light: "#011b33",
    dark: "rgb(24, 26, 32)"
  },
  sidebarColor: {
    light: "#fff",
    dark: "#fff"
  },
  sidebarColorHover: {
    light: "#fff",
    dark: "#fff"
  },
  error: {
    light: "#800",
    dark: "#800"
  },
  homeBg: {
    light: "linear-gradient(139.73deg, rgb(230, 253, 255) 0%, rgb(243, 239, 255) 100%)",
    dark: "radial-gradient(103.12% 50% at 50% 50%, rgb(33, 25, 58) 0%, rgb(25, 19, 38) 100%)"
  },
  homeBg2: {
    light: "linear-gradient(rgb(255, 255, 255) 22%, rgb(215, 202, 236) 100%)",
    dark: "linear-gradient(rgb(9, 7, 12) 22%, rgb(32, 19, 53) 100%)"
  },
}

// Add your color mode config
const config = {
  initialColorMode: "system",
  useSystemColorMode: true,
}
// extend the theme
const theme = extendTheme({ 
  colors, config
})
export default theme