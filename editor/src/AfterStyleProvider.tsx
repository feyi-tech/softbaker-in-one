import { useColorMode } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { ProSidebarProvider } from "react-pro-sidebar"
import { FrontbackedProvider } from "use-frontbacked"
import { USE_FRONTBACKED_CONFIG } from "./app-config"

interface AfterStyleProvider {
    children: any
}

const AfterStyleProvider: React.FC<AfterStyleProvider> = ({ children }) => {
    const router = useRouter()
    const { colorMode } = useColorMode()
    
    return (
        <ProSidebarProvider>
            <FrontbackedProvider isDarkMode={colorMode === "dark"} disableBlockchainPoll={true}
            enableLog={true} config={USE_FRONTBACKED_CONFIG}>
                {children}
            </FrontbackedProvider>
        </ProSidebarProvider>
    )
}

export default AfterStyleProvider