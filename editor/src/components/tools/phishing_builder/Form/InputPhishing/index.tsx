import { Box, HStack, VStack } from "@chakra-ui/react"
import { Data } from "../../types"
import InputBox from "@/root/src/components/widgets/InputBox"
import { FaGlobe } from "react-icons/fa"
import { useEffect, useMemo, useRef, useState } from "react"
import CuteButton from "@/root/src/components/widgets/CuteButton"
import SiteWebView, { UseWebView } from "../SiteWebView"
import useWebView from "../SiteWebView/use-webview"
import Swal from "sweetalert2"
import LoadingView from "@/root/src/components/widgets/LoadingView"


interface InputPhishing {
    data: Data,
    onUpdateData?: ((data: Data) => void) | null,
    [x: string]: any
}
const proxyBaseUrl = "http://localhost:3001/load"
const InputPhishing: React.FC<InputPhishing> = ({ data, onUpdateData, ...props }) => {
    const [ siteUrlError, setSiteUrlError ] = useState<string | null>()
    const { ref, loadPage, loading } = useWebView()
    const sessionId = "DxId09"

    useEffect(() => {
        console.log('Page Is Loading: ', loading);
    }, [ loading ])

    const handleLoad = () => {
        console.log('Page loaded');
    };
    
    const handleError = (error: Error) => {
        console.error('Error loading page:', error);
    };

    const handleButtonClick = () => {
        setSiteUrlError(null)
        if(!data.websiteLink) {
            setSiteUrlError("Please enter the website address")
            return
        }
        console.log('siteWebView:', ref, " :: ", loadPage);
        if (loadPage) {
            // Trigger a new page load
            loadPage(data.websiteLink);

        } else {
            Swal.fire({
                icon:"error",
                title: "WebView error",
                text: "WebView not ready. Please try again."
            })
        }
    };

    const LoadingElement = useMemo(() => {
        return (
            <LoadingView w="100%"
                h={{
                    base: "350px",
                    md: "450px"
                }} 
                justifyContent="flex-start"
                message={`Loading the page at ${data.websiteLink}. Please wait...`}
            />
        )
    }, [ data.websiteLink ])

    return (
        <VStack {...props}>
            <Box w="100%" mb={4}>
                <InputBox w="100%" mb={2}
                    id={`Form_${data.id}_name`}
                    key={`Form_${data.id}_name`}
                    title="Website Address"
                    placeholder="https://example.com"
                    helperText="Enter the address of the website."
                    info="This is where you enter the address of the website you want to clone/create a phishing website for."
                    type={InputBox.TYPES.text}
                    value={data.websiteLink} 
                    onChange={(value) => {
                        if(onUpdateData) {
                            onUpdateData({
                                id: data.id,
                                websiteLink: value
                            } as Data)
                        }
                    }}
                    iconLeft={<FaGlobe />}
                    errorMessage={siteUrlError}
                />
                <CuteButton onClick={handleButtonClick} status={loading? "loading" : "warning"} disabled={loading}>
                    { loading? "Please wait..." : "Load"}
                </CuteButton>
            </Box>

            <SiteWebView 
                ref={ref} 
                proxyBaseUrl={proxyBaseUrl} 
                sessionId={sessionId} 
                onPageLoaded={handleLoad} 
                onPageLoadError={handleError} 
                loadingView={LoadingElement}
                w="100%"
                h={{
                    base: "350px",
                    md: "450px"
                }}
                onPageTitle={(title: string) => {
                    console.log("Site.Title: ", title, data)
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            websiteTitle: title
                        } as Data)
                    }
                }}
                onPageDescription={(description: string) => {
                    console.log("Site.Description: ", description, data)
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            websiteDescription: description
                        } as Data)
                    }
                }}
            />
        </VStack>
    )
}

export default InputPhishing