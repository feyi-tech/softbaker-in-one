import { useDisclosure } from "@chakra-ui/react";
import { createContext, useContext, useState } from "react";
import ToolsSelector from "../components/widgets/ToolsGrid/ToolsSelector";
import Tutorial from "../components/widgets/Tutorial";

const ToolsSelectorContext = createContext({})

interface ToolsSelectorResult {
    showTools: (toolId?: string | null, templateId?: string | null) => void,
    showTutorial: (toolId: string) => void
}
interface ToolsSelectorProvider {
    children: any,
    [x: string]: any
}
export const ToolsSelectorProvider: React.FC<ToolsSelectorProvider> = ({children, ...props}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ toolId, setToolId ] = useState<string|null>(null)
    const [ templateId, setTemplateId ] = useState<string|null>(null)

    const [ show, setShow ] = useState<boolean>(false)

    const showTools = (toolId?: string | null, templateId?: string | null) => {
        if(toolId) setToolId(toolId)
        if(templateId) setTemplateId(templateId)
        onOpen()
    }

    const showTutorial = (toolId: string) => {
        if(toolId) setToolId(toolId)
        setShow(true)
    }

    const returnValue = {
        showTools, showTutorial
    }

    return (
        <ToolsSelectorContext.Provider value={returnValue} {...props}>
            {children}
            <ToolsSelector toolId={toolId} templateId={templateId} isOpen={isOpen} onClose={onClose} />
            <Tutorial show={show} currentToolId={toolId} onClose={() => {
                setShow(false)
            }} />
        </ToolsSelectorContext.Provider>
    )
}

export default function useToolsSelector(): ToolsSelectorResult {
    return useContext(ToolsSelectorContext) as ToolsSelectorResult
}