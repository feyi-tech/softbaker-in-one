import { Box } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, Ref } from 'react';

export interface UseWebView { 
    loadPage: (url: string) => void;
    loading?: boolean;
}

export interface SiteWebViewProps {
  proxyBaseUrl: string;
  sessionId: string; // Session ID for tracking
  onPageLoaded?: () => void; // Callback for when the page is loaded
  onPageLoadError?: (error: Error) => void; // Callback for when there's an error loading the page
  onPageTitle?: (title: string) => void; // Callback for the page title
  onPageDescription?: (description: string) => void; // Callback for the page description
  loadingView?: any;
  [x: string]: any;
}

const SiteWebView = forwardRef(function({
    proxyBaseUrl,
    sessionId,
    onPageLoaded,
    onPageLoadError,
    onPageTitle,
    onPageDescription,
    loadingView,
    ...props
  }: SiteWebViewProps, ref?: Ref<UseWebView>) {
    const [iframeSrcDoc, setIframeSrcDoc] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const loadPage = (url: string) => {
        setLoading(true);
        fetch(`${proxyBaseUrl}?url=${encodeURIComponent(url)}&sessionId=${sessionId}`)
        .then(response => response.text())
        .then(data => {
            setLoading(false);
            const html = (data as any).html
            setIframeSrcDoc(html);
            // Create a temporary DOM to parse the fetched HTML content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract and pass the title
            const title = doc.querySelector('title')?.innerText || '';
            if (onPageTitle) onPageTitle(title);
            
            // Extract and pass the description
            const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            if (onPageDescription) onPageDescription(description);
            if (onPageLoaded) onPageLoaded();
        })
        .catch(error => {
            setLoading(false);
            console.error('Error fetching the page:', error.message);
            if (onPageLoadError) onPageLoadError(error);
        });
    };

    // Expose the loadPage method to parent components
    useImperativeHandle(ref, () => ({
        loadPage, loading
    } as UseWebView), [loading]);

    return (
        <>
        {
            loading? loadingView
            :
            <Box as="iframe"
                {...props}
                ref={ref as Ref<HTMLIFrameElement>}
                srcDoc={iframeSrcDoc}
                onLoad={() => { if (onPageLoaded) onPageLoaded(); }}
                onError={(error: any) => { if (onPageLoadError) onPageLoadError(error as Error); }}
            />
        }
        </>
    );
});

export default SiteWebView;