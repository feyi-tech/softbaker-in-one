import { useRef } from "react";
import { SiteWebViewProps, UseWebView } from ".";



const useWebView = () => {
    const webViewRef = useRef<UseWebView>(null);
    
    return { 
        ref: webViewRef, 
        siteWebView: webViewRef.current, 
        loading: webViewRef.current?.loading,
        loadPage: webViewRef.current?.loadPage
    };

}

export default useWebView