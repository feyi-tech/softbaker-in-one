import { useEffect, useState } from "react"
import { Box, HStack, ResponsiveValue, Text } from "@chakra-ui/react"
import useColorValue from "../../hooks/useColorValue"

interface CuteButtonProps {
  as?: any,
  outlined?: boolean,
  children?: any, 
  onClick?: (e: any) => void, 
  isActive?: boolean, 
  leftIcon?: any, rightIcon?: any, 
  disabled?: boolean,
  textAlign?: ResponsiveValue<any>,
  textTransform?: ResponsiveValue<any>,
  status?: "success" | "info" | "error" | "warning" | "loading" | "disabled",
  [s: string]: any
}
const CuteButton: React.FC<CuteButtonProps> = ({
  outlined, as,
  children, onClick, isActive, leftIcon, rightIcon, disabled, textAlign, textTransform, status, ...props
}) => {
    
    const inActiveColor = useColorValue("pageBg.light", "pageBg.dark")
    const activeColor = useColorValue("colorAccent.light", "colorAccent.dark")

    const [ statusColor, setStatusColor ] = useState<string>()
    useEffect(() => {
        switch(status) {
            case "error":
                setStatusColor("#e53e3e")
                break;
            case "info":
                setStatusColor("#3182ce")
                break;
            case "warning":
                setStatusColor("#dd6b20")
                break;
            case "disabled":
                setStatusColor("#dfdfdf")//TODO: animated border for the loading
                break;
            case "success":
            case "loading":
                setStatusColor("#38a169")
                break;
            default:
                setStatusColor("#dfdfdf")
        }
    }, [status])

    const getCursor = () => {
      if(disabled) return "not-allowed"
      switch(status) {
        case "disabled":
            return "not-allowed"
        case "loading":
            return "wait"
        default:
            return "pointer"
      }
    }

    return (
      <Box as={as || "button"} borderRadius="5px" p="5px"
      bg={outlined? "transparent" : statusColor? statusColor : isActive? activeColor : inActiveColor} 
      borderColor={`${statusColor? statusColor : isActive? activeColor : inActiveColor} !important`}
      border={outlined? "1px" : "none"}
      color={outlined? `${statusColor? statusColor : isActive? activeColor : inActiveColor} !important` : statusColor? "#fff" : "inherit"}
      cursor={getCursor()} minH="30px" minW="60px" 
      display="flex" justifyContent="center" 
      alignItems="center" onClick={disabled || status == "loading"? () => {} : onClick} 
      _hover={{
        opacity: getCursor() == "pointer"? "0.7" : "0.4"
      }}
      fontStyle={status == "loading"? "italic" : "normal"}
      opacity={getCursor() == "pointer"? "1" : "0.4"} {...props}>
        <HStack justifyContent="center" alignItems="center" w="100%">
          <Box mx="2px !important">{leftIcon}</Box>
          <Text as="div" w="100%" textAlign={textAlign || "center"} 
            textTransform={textTransform || "capitalize"}>{children}</Text>
          <Box mx="2px !important">{rightIcon}</Box>
        </HStack>
      </Box>
    )
}

export default CuteButton