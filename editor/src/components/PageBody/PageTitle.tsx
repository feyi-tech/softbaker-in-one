import Head from "next/head";
import { TITLE_SEPARATOR, URL_BASE, APP_NAME } from "@/app-config";

interface PageTitle {
    link?: string, title?: string, description?: string, image?: string, type?: string, updatedTime?: any
}
const PageTitle: React.FC<PageTitle> = ({link, title, description, image, type, updatedTime}) => {
    
    return (
        <Head>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta property="og:site_name" content={APP_NAME} />
            <meta property="og:updated_time" content={updatedTime || ""} />
            {
                <>
                    <link rel="canonical" href={`${URL_BASE}`} />
                    <meta property="og:url" content={`${URL_BASE}`} />
                </>
            }
            {
                title? 
                <>
                    <title>{`${APP_NAME}${TITLE_SEPARATOR}${title}`}</title>
                    <meta property="og:title" content={`${APP_NAME}${TITLE_SEPARATOR}${title}`} />
                </> : null
            }
            {
                description? 
                <>
                    <meta name="description" content={description} />
                    <meta property="og:description" content={description} />
                </> : null
            }
            {
                type? 
                <meta property="og:type" content={type} />
                :
                <meta property="og:type" content="website" />
            }
            {/*
                Object.keys(locales).map((l, index) => {
                    return (
                        <link key={index} rel="alternate" href={`${URL_BASE}/${l}${link}`} hrefLang={l} />
                    )
                })*/
            }
            {
                /*
                <link rel="alternate" href={`${URL_BASE}/${defaultLocale}${link}`} hrefLang="x-default" />
                */
            }
        </Head>
    )
    
}

export default PageTitle