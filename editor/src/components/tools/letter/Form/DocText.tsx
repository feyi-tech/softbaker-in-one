import { Text } from "@chakra-ui/react"

interface DocText {
    children: any,
    fontSize: string,
    top: number, left: number,
    canvasWidth: number, canvasHeight: number,
    originalCanvasWidth: number, originalCanvasHeight: number,
    [x: string]: any
}
const DocText: React.FC<DocText> = ({ 
  children, fontSize, top, left, 
  canvasWidth, canvasHeight,
  originalCanvasWidth, originalCanvasHeight,
  ...props 
}) => {

  const getTop = (v: number): string => {
    return `${ (v * canvasHeight) / originalCanvasHeight }`
  }

  const getLeft = (v: number): string => {
    return `${ (v * canvasWidth) / originalCanvasWidth }`
  }

  return (
    <Text as="div" textTransform="uppercase" fontSize={getTop(parseFloat(fontSize || `12`))}
      pos="absolute" filter="blur(0.3px)"
      top={getTop(top - parseFloat(getTop(parseFloat(fontSize || `12`))))} left={getLeft(left)} fontWeight="300" color="#141414" 
      fontFamily="arial heveltica sans-seriff"
      {...props}>
      {children}
    </Text>
  )
}

export default DocText