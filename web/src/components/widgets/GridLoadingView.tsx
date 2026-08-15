import { Text, VStack } from "@chakra-ui/react"
import Loading from "./Loading"

interface GridLoadingView {
  isLoading?: boolean, 
  msg?: string, 
  animColor?: any
}

const GridLoadingView: React.FC<GridLoadingView> = ({isLoading, msg, animColor}) => {

    return (
      <VStack width="100%" h="200px" borderRadius="15px" border="1px solid #fff" 
      justifyContent="center" alignItems="center" display={isLoading? 'flex' : 'none'}>
        {
            msg?
            <Text as="div" fontStyle="italic" fontSize="14px">
                {msg}
            </Text>
            : null
        }
        <Loading
        style={{display: "inline !important"}}
        width={"50px"}
        height={"50px"}
        color={animColor}
        type={Loading.TYPES.grid} />
      </VStack>
    )
}

export default GridLoadingView