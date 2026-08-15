import { HStack, Text, useBreakpointValue, useDisclosure } from "@chakra-ui/react"
import ToolsGrid from "."
import DrawerPop from "../DrawerPop"
import { FaTools } from "react-icons/fa"


interface ToolsSelector {
    toolId?: string | null, 
    templateId?: string | null,
    isOpen: boolean,
    onClose?: () => void
}
const ToolsSelector: React.FC<ToolsSelector> = ({ toolId, templateId, isOpen, onClose }) => {
    console.log("ToolsSelector:", toolId, templateId)

    const h = useBreakpointValue({base: "70vh", md: "95vh"})

    const defaultTitle = (
        <HStack justifyContent="flex-start" alignItems="center">
            <FaTools />{" "}
            <Text as="div">Select Tool</Text>
        </HStack>
    )
    return (
        <DrawerPop title={ defaultTitle } isOpen={isOpen} onClose={onClose} placement="bottom" height={h}>
            <HStack w="100%" justifyContent="center" borderRadius="8px" p="0!important">
                <ToolsGrid toolId={toolId} templateId={templateId} />
            </HStack>
        </DrawerPop>
    )
}

export default ToolsSelector