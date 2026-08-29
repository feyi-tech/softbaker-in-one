import { useEffect, useState } from 'react';
import axios from 'axios';
import { SdkConfig, Vendor } from '../types';
import { consoleLog, isBrowser } from '../../../utils/f';
import { Config } from '../../../theme.type';

declare global {
    interface Window {
        fetchPromise: Promise<SdkConfig | null> | null;
        sdkConfigCache: SdkConfig | null;
    }
}

const MAX_RETRIES = 5;
const CACHE_KEY = "sdk_config-metadata";
const DEFAULT_CACHE_VERSION = "2.4.1";
const CACHE_VERSION_QUERY_KEY = "sb_cache_version";

interface SdkConfigCacheMetadata {
    version?: string;
    etag?: string;
    lastModified?: string;
    cachedData?: SdkConfig | null;
}

// let sdkConfigCache: SdkConfig | null = null;
// let fetchPromise: Promise<SdkConfig | null> | null = null;

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

const readCacheMetadata = (cacheVersion: string): SdkConfigCacheMetadata | null => {
    try {
        const cachedMetadata = localStorage.getItem(CACHE_KEY);
        if (!cachedMetadata) return null;

        const parsed = JSON.parse(cachedMetadata) as SdkConfigCacheMetadata;
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

const useSdkConfig = (appConfig: Config): SdkConfig | null | undefined => {
    const [sdkConfig, setSdkConfig] = useState<SdkConfig | null | undefined>(isBrowser()? window.sdkConfigCache : null);

    function parseVendors(vendorsAsTexts: (string | Vendor)[] = []): Vendor[] {
        return vendorsAsTexts.map((text) => {
            if (typeof text !== "string") return text;
            const [name, number, freq] = text.split(',');
            return {
                name,
                number,
                freq: parseInt(freq),
            } as Vendor;
        });
    }

    useEffect(() => {
        if(!appConfig?.r2Domain) return
        if (window.sdkConfigCache) {
            setSdkConfig(window.sdkConfigCache);
        }

        if (!window.fetchPromise) {
            window.fetchPromise = (async () => {
                let attempts = 0;
                let headers: Record<string, string> = {};
                let cachedData: SdkConfig | null = window.sdkConfigCache || null;
                const cacheVersion = getCacheVersion(appConfig);

                // Retrieve cached metadata
                const cachedMetadata = readCacheMetadata(cacheVersion);
                if (cachedMetadata) {
                    const { etag, lastModified } = cachedMetadata;
                    if (cachedMetadata.cachedData) {
                        cachedData = cachedMetadata.cachedData;
                        window.sdkConfigCache = cachedMetadata.cachedData;
                        setSdkConfig(cachedMetadata.cachedData);
                        //return cachedData;
                    }
                    if (etag) headers["If-None-Match"] = etag;
                    if (lastModified) headers["If-Modified-Since"] = lastModified;
                }

                consoleLog("useSdkConfig.headers: ", headers)

                while (attempts < MAX_RETRIES) {
                    try {
                        const response = await axios.get(getVersionedUrl(`https://${appConfig.r2Domain}/sdk_config.json`, cacheVersion), {
                            headers,
                            validateStatus: (status) => status < 500 // Accept 304 Not Modified
                        });

                        if (response.status === 304) {
                            consoleLog("useSdkConfig.notModied: ", response.status)
                            return cachedData;
                        }

                        if (response.status === 404) {
                            consoleLog("Error fetching SDK config: Resource not found (404)");
                            return cachedData;
                        }

                        if (response.status >= 400) {
                            throw new Error(`Failed to fetch SDK config (${response.status})`);
                        }

                        const config: SdkConfig = response.data as SdkConfig;
                        config.vendors = parseVendors(response.data.vendors);
                        window.sdkConfigCache = config;
                        setSdkConfig(config);

                        // Save cache metadata
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            version: cacheVersion,
                            etag: response.headers["etag"],
                            lastModified: response.headers["last-modified"],
                            cachedData: config
                        }));

                        consoleLog("useSdkConfig.refreshed: ", response.data, ` at ${response.headers["last-modified"]}, with etag, ${response.headers["etag"]}`)

                        return config;
                    } catch (err: any) {
                        if (err.response?.status === 404) {
                            consoleLog("Error fetching SDK config: Resource not found (404): ", err);
                            return cachedData;
                        }
                        attempts++;
                        if (attempts === MAX_RETRIES) {
                            if (cachedData) return cachedData;
                            consoleLog("Error fetching SDK config: ", err);
                        }
                    }
                }
                return cachedData;
            })();
        }

        window.fetchPromise.then((config) => {
            if (config) setSdkConfig(config);
        });
    }, [appConfig?.r2Domain, appConfig?.metadataCacheVersion]);

    return sdkConfig;
};

export default useSdkConfig;
