import { useEffect, useState } from "react";
import axios from "axios";
import { DynamicTool, ToolsData } from "./types";
import { arrayToMap, rmUpdates } from "./utils";
import { Config } from "../../../../theme.type";
import { consoleLog, isBrowser } from "../../../../utils/f";

declare global {
    interface Window {
        toolsFetchPromise: Promise<ToolsData | null> | null;
        toolsCache: ToolsData | null;
    }
}

export interface UseToolsResult extends ToolsData {
    loading: boolean;
    error: string | null;
}

const MAX_RETRIES = 5;
const CACHE_KEY = "tools-cache-metadata";
const DEFAULT_CACHE_VERSION = "2.4.1";
const CACHE_VERSION_QUERY_KEY = "sb_cache_version";

interface ToolsCacheMetadata {
    version?: string;
    etag?: string;
    lastModified?: string;
    cachedData?: ToolsData | null;
}

// let toolsCache: ToolsData | null = null;
// let toolsFetchPromise: Promise<ToolsData | null> | null = null;

const setR2Host = (url: string, r2Domain: string) => {
    if(!url) return url
    if (url.startsWith('/')) {
      return `https://${r2Domain}${url}`;
    }
  
    try {
      const parsedUrl = new URL(url);
      parsedUrl.host = r2Domain;
      parsedUrl.protocol = 'https:'; // force https
      return parsedUrl.toString();
    } catch (err) {
      console.error('Invalid URL:', url);
      return url; // fallback
    }
};

const getCacheVersion = (config: Config): string => `${config.metadataCacheVersion || DEFAULT_CACHE_VERSION}`;

const getVersionedUrl = (url: string, cacheVersion: string) => {
    try {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set(CACHE_VERSION_QUERY_KEY, cacheVersion);
        return parsedUrl.toString();
    } catch (err) {
        return url;
    }
};

const readCacheMetadata = (cacheVersion: string): ToolsCacheMetadata | null => {
    try {
        const cachedMetadata = localStorage.getItem(CACHE_KEY);
        if (!cachedMetadata) return null;

        const parsed = JSON.parse(cachedMetadata) as ToolsCacheMetadata;
        if (parsed.version !== cacheVersion) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsed;
    } catch (err) {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }
};

const useTools = (config: Config): UseToolsResult => {
    const [data, setData] = useState<ToolsData | null>(isBrowser()? window.toolsCache : null);
    const [loading, setLoading] = useState<boolean>(!isBrowser() || !window.toolsCache);
    const [error, setError] = useState<string | null>(null);

    const [toolsById, setToolsById] = useState<{ [x: string]: DynamicTool } | null>(null);
    const [toolsByTemplatesUrl, setToolsByTemplatesUrl] = useState<{ [x: string]: DynamicTool } | null>(null);

    useEffect(() => {
        if(!config?.r2Domain) return
        if (window.toolsCache) {
            setData(window.toolsCache);
            setLoading(false);
            consoleLog("useTools.returns as toolsCache already exist: ", window.toolsCache)
        }

        if (!window.toolsFetchPromise) {
            window.toolsFetchPromise = (async () => {
                let attempts = 0;
                let headers: Record<string, string> = {};
                let cachedData: ToolsData | null = window.toolsCache || null;
                const cacheVersion = getCacheVersion(config);

                // Retrieve cached metadata
                const cachedMetadata = readCacheMetadata(cacheVersion);
                if (cachedMetadata) {
                    const { etag, lastModified } = cachedMetadata;
                    if (cachedMetadata.cachedData) {
                        cachedData = cachedMetadata.cachedData;
                        window.toolsCache = cachedMetadata.cachedData;
                        setData(cachedMetadata.cachedData);
                        setLoading(false);
                        //setLoading(false);
                        //return cachedData;
                    }
                    if (etag) headers["If-None-Match"] = etag;
                    if (lastModified) headers["If-Modified-Since"] = lastModified;
                }

                consoleLog("useTools.headers: ", headers)
                

                while (attempts < MAX_RETRIES) {
                    try {
                        const response = await axios.get(getVersionedUrl(`https://${config.r2Domain}/templates/tools.json`, cacheVersion), {
                            headers,
                            validateStatus: (status) => status < 500, // Accept 304 Not Modified
                        });

                        if (response.status === 304) {
                            setLoading(false);
                            consoleLog("useTools.notModied: ", response.status)
                            return cachedData;
                        }

                        if (response.status === 404) {
                            if (cachedData) return cachedData;
                            setError("Resource not found (404)");
                            break;
                        }

                        if (response.status >= 400) {
                            throw new Error(`Failed to fetch tools metadata (${response.status})`);
                        }

                        window.toolsCache = response.data;
                        setData(response.data);
                        setError(null);
                        setLoading(false);

                        // Save cache metadata
                        localStorage.setItem(
                            CACHE_KEY,
                            JSON.stringify({
                                version: cacheVersion,
                                etag: response.headers["etag"],
                                lastModified: response.headers["last-modified"],
                                cachedData: response.data,
                            })
                        );

                        consoleLog("useTools.refreshed: ", response.data, ` at ${response.headers["last-modified"]}, with etag, ${response.headers["etag"]}`)
                        return response.data;
                    } catch (err: any) {
                        if (err.response?.status === 404) {
                            if (cachedData) return cachedData;
                            setError("Resource not found (404)");
                            break;
                        }
                        attempts++;
                        if (attempts === MAX_RETRIES) {
                            if (cachedData) return cachedData;
                            setError("Failed to fetch data after multiple attempts");
                        }
                    }
                }
                setLoading(false);
                return cachedData;
            })();
        }

        window.toolsFetchPromise.then((result) => {
            if (result) setData(result);
            setLoading(false);
        });
    }, [config?.r2Domain, config?.metadataCacheVersion]);

    useEffect(() => {
        if (data?.tools && !loading && !error) {
            setToolsById(arrayToMap("id", data.tools || []) as any);
            setToolsByTemplatesUrl(arrayToMap("templates_url", data.tools || [], (url) => rmUpdates(setR2Host(url, config.r2Domain))) as any);
        }
    }, [data, loading, error]);

    const getTool = (toolId: string) => {
        if (!toolsById) return null;
        if (toolId === "other_tools") {
            return {
                id: toolId,
                name: "Tool Editor",
                description: "Create tools for other users",
                isActive: true,
                isHidden: true,
                siteLogoUrl: "",
                siteUrl: "/tool-editor",
                allow_freemium: true,
                create_price: 0,
                update_price: 0,
                desktopVideoUrl: "",
                mobileVideoUrl: "",
            } as any;
        }
        return toolsById[toolId];
    };

    return {
        loading,
        error,
        totalUpdates: data?.totalUpdates,
        lastUpdatedOn: data?.lastUpdatedOn,
        previouslyUpdatedOn: data?.previouslyUpdatedOn,
        tools: data?.tools,
        toolsById,
        toolsByTemplatesUrl,
        getTool,
    };
};

export default useTools;
