import { useColorMode } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { ProSidebarProvider } from "react-pro-sidebar"
import { SoftBakerProvider } from "use-softbaker"
import { USE_SOFTBAKER_CONFIG } from "./app-config"

interface AfterStyleProvider {
    children: any
}
const AfterStyleProvider: React.FC<AfterStyleProvider> = ({ children }) => {
    const router = useRouter()
    const { colorMode } = useColorMode()
    
    return (
        <ProSidebarProvider>
            <SoftBakerProvider isDarkMode={colorMode === "dark"}
            enableLog={false} config={USE_SOFTBAKER_CONFIG} disableBlockchainPoll={false}>
                {children}
            </SoftBakerProvider>
        </ProSidebarProvider>
    )
}

export default AfterStyleProvider