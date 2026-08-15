import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const PageLoadContext = createContext({})

interface PageLoadStateProvider {
    [x: string]: any
}
export const PageLoadStateProvider: React.FC<PageLoadStateProvider> = ({...props}) => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const onRouteChangeStart = useCallback(() => {
        setLoading(true);
    }, []);

    const onRouteChangeDone = useCallback(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        router.events.on('routeChangeStart', onRouteChangeStart);
        router.events.on('routeChangeComplete', onRouteChangeDone);
        router.events.on('routeChangeError', onRouteChangeDone);

        return () => {
            router.events.off('routeChangeStart', onRouteChangeStart);
            router.events.off('routeChangeComplete', onRouteChangeDone);
            router.events.off('routeChangeError', onRouteChangeDone);
        };
    }, [onRouteChangeDone, onRouteChangeStart, router.events]);

    return <PageLoadContext.Provider value={loading} {...props} />;
}

export default function usePageLoadState(): boolean {
    return useContext(PageLoadContext) as boolean
}