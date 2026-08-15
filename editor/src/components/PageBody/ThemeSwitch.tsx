import { FaMoon, FaSun } from "react-icons/fa";
import SwitchButton from "./SwitchButton"

interface ThemeSwitch {
    colorModeBg?: any,
    colorMode?: any, onToggleColorMode?: () => void, 
    colorModeLightIconActive?: any, colorModeLightIconInActive?: any,
    colorModeDarkIconActive?: any, colorModeDarkIconInActive?: any,
    [x: string]: any
}
const ThemeSwitch: React.FC<ThemeSwitch> = ({
    colorModeBg,
    colorMode, onToggleColorMode, 
    colorModeLightIconActive, colorModeLightIconInActive,
    colorModeDarkIconActive, colorModeDarkIconInActive,
    ...props
}) => {
  
    return <SwitchButton toggleButtonColor 
    isOn={colorMode === 'light'} 
    onIcon={
        colorMode === 'light'? colorModeLightIconActive || <FaSun color="rgb(255, 178, 55)" /> 
        : colorModeLightIconInActive || <FaSun />
    } 
    offIcon={
        colorMode === 'dark'? colorModeDarkIconActive || <FaMoon color="rgb(154, 106, 255)" /> 
        : colorModeDarkIconInActive || <FaMoon />
    } 
    bg={colorModeBg || "rgb(189, 194, 196)"}
    onToggle={onToggleColorMode} {...props} />
}

export default ThemeSwitch