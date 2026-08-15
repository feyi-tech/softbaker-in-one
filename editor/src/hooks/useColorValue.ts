import { useColorModeValue } from "@chakra-ui/react"
import theme from "../theme"

const useColorValue = (light: string, dark: string) => {
    const lightList = light.split(".")
    try {
        if(lightList.length > 1) {
            light = theme.colors[lightList[0]][lightList[1]]
    
        } else {
            light = theme.colors[lightList[0]]
        }

    } catch (e) {}

    const darkList = dark.split(".")
    try {
        if(darkList.length > 1) {
            dark = theme.colors[darkList[0]][darkList[1]]
    
        } else {
            dark = theme.colors[darkList[0]]
        }

    } catch (e) {}

    return useColorModeValue(light, dark)
}

export default useColorValue