
import { Box } from "@chakra-ui/react";

interface SwitchButtonProps {
  onToggleKnobProps?: (isOn?: boolean) => any, 
  toggleButtonColor?: any, 
  offIcon?: any, onIcon?: any, 
  isOn?: boolean, 
  bg?: any, background?: any, backgroundColor?: any, 
  onToggle?: (isOn?: any) => void, 
  [x: string]: any
}
const SwitchButton: React.FC<SwitchButtonProps> = ({
  onToggleKnobProps, toggleButtonColor, offIcon, onIcon, 
  isOn, bg, background, backgroundColor, onToggle, ...props
}) => {
  
    return (
      <Box bg={bg || background || backgroundColor} w="56px" h="32px" 
      transition="background-color 200ms ease 0s" 
      display="inline-flex" alignItems="center" boxShadow="rgba(74, 74, 104, 0.1) 0px 2px 2px -1px inset" cursor="pointer" 
      pos="relative" borderRadius="24px"
      {...props} onClick={onToggle}>

        <Box bg={isOn || !toggleButtonColor? "rgb(255, 255, 255)" : "rgb(39, 38, 44)"} cursor="pointer" 
        borderRadius="50%" w="26px" h="26px" 
        pos="absolute" transition="left 200ms ease-in 0s" zIndex="1" 
        left={isOn? "3px" : "calc(100% - 30px)"} 
        {...(onToggleKnobProps? onToggleKnobProps(isOn) : {})}>
          <Box display="flex" justifyContent="center" alignItems="center" h="100%" 
          verticalAlign="baseline">
            {isOn? onIcon : offIcon}
          </Box>
        </Box>
        
        <Box display="flex" w="100%" h="100%" justifyContent="space-around" 
        alignItems="center" border="0px" m="0px" p="0px">
          {onIcon}{offIcon}
        </Box>
      </Box>
    )
}

export default SwitchButton