import { Text, VStack } from "@chakra-ui/react"
import MessageView from "./MessageView"
import GridLoadingView from "./GridLoadingView"
import useColorValue from "../../hooks/useColorValue"

interface RequestStateViewProps {
  children?: any, 
  loadingMsg?: string | any, errorMsg?: string | any, emptyMsg?: string | any, 
  fontSize?: string,
  [x: string]: any
}

const RequestStateView: React.FC<RequestStateViewProps> = ({
  children, loadingMsg, errorMsg, emptyMsg, fontSize, ...props}) => {

    if(!loadingMsg && !errorMsg && !emptyMsg) {
      return children

    } else {
      return (
        <VStack w="100%" justifyContent="flex-start" alignItems="center" {...props}>
          <GridLoadingView 
            isLoading={loadingMsg} 
            msg={loadingMsg as string} 
            animColor={useColorValue("colorAccent.light", "colorAccent.dark")} 
          />
          <MessageView msg={!loadingMsg && errorMsg} asError fontSize={fontSize || "inherit"} onReload={null} />
          <MessageView msg={!loadingMsg && !errorMsg && emptyMsg} fontSize={fontSize || "inherit"} onReload={null} asError={false} />
        </VStack>
      )
    }
}

export default RequestStateView