import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { UrlProvider } from '@/hooks/useUrlQuery';
import { PageLoadStateProvider } from '@/hooks/usePageLoadState';
import theme from '@/theme'

// pages/_app.js
import { ChakraProvider} from '@chakra-ui/react'
import AfterStyleProvider from '../AfterStyleProvider';
import { ToolsSelectorProvider } from '../hooks/useToolsSelector';
import { useEffect, useState } from 'react';

/*
console.error = (message) => {
  alert(message)
}*/

// Disable console.log in production
if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
  const hasDebugParam = typeof window !== 'undefined' && (window.location.search.includes('debug=true') || localStorage.getItem('eruda_debug'));
  if(!hasDebugParam) {
    const disableDevtool = require('disable-devtool');
    disableDevtool();
    console.log = () => {};
  }
}

const addGlobalErrorListeners = () => {
  const onError = (msg: string | Event, url?: string, lineNo?: number, columnNo?: number, error?: Error) => {
    console.error(`JS Error: ${msg}\nAt: ${url}:${lineNo}:${columnNo}`);
    return false;
  };

  const onUnhandledRejection = (e: PromiseRejectionEvent) => {
    console.error(`Unhandled Promise Rejection:\n${e.reason}`);
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
};

function MyApp({ Component, pageProps }: AppProps) {
  const [polyfilled, setPolyfilled] = useState(false);
  
  useEffect(() => {
    const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=true');
    const hasDisableDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=false');

    /*
    const loadPolyfills = async () => {
      if (isOldSafari()) {
        await import("core-js/stable");
        await import('regenerator-runtime/runtime');
        if (typeof globalThis === 'undefined') {
          (window as any).globalThis = window;
        }
        setPolyfilled(true);
      }
    };

    loadPolyfills();*/
  
    if (hasDisableDebugParam) {
      try {
        localStorage.removeItem('eruda_debug');
      } catch (e) {}
    }
  
    if (hasDebugParam || localStorage.getItem('eruda_debug')) {
      if (!localStorage.getItem('eruda_debug')) localStorage.setItem('eruda_debug', 'true');
  
      //const cleanup = addGlobalErrorListeners();
  
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda';
      script.onload = () => {
        window.eruda && window.eruda.init();
      };
      document.body.appendChild(script);
  
      //return cleanup;
    }
  }, []);
  
  
  return (
    <PageLoadStateProvider>
        <UrlProvider>
          <ChakraProvider theme={theme}>
            <ToolsSelectorProvider>
              <AfterStyleProvider>
                <Component {...pageProps} />
              </AfterStyleProvider>
            </ToolsSelectorProvider>
          </ChakraProvider>
        </UrlProvider>
    </PageLoadStateProvider>
  )
}

export default MyApp