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

// let sdkConfigCache: SdkConfig | null = null;
// let fetchPromise: Promise<SdkConfig | null> | null = null;

const useSdkConfig = (appConfig: Config): SdkConfig | null | undefined => {
    const [sdkConfig, setSdkConfig] = useState<SdkConfig | null | undefined>(isBrowser()? window.sdkConfigCache : null);

    function parseVendors(vendorsAsTexts: string[]): Vendor[] {
        return vendorsAsTexts.map((text) => {
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
            return;
        }

        if (!window.fetchPromise) {
            window.fetchPromise = (async () => {
                let attempts = 0;
                let headers: Record<string, string> = {};

                // Retrieve cached metadata
                const cachedMetadata = localStorage.getItem(CACHE_KEY);
                if (cachedMetadata) {
                    const { etag, lastModified, cachedData } = JSON.parse(cachedMetadata);
                    if (cachedData) {
                        window.sdkConfigCache = cachedData;
                        setSdkConfig(cachedData);
                        //return cachedData;
                    }
                    if (etag) headers["If-None-Match"] = etag;
                    if (lastModified) headers["If-Modified-Since"] = lastModified;
                }

                consoleLog("useSdkConfig.headers: ", headers)

                while (attempts < MAX_RETRIES) {
                    try {
                        const response = await axios.get(`https://${appConfig.r2Domain}/sdk_config.json`, {
                            headers,
                            validateStatus: (status) => status < 500 // Accept 304 Not Modified
                        });

                        if (response.status === 304) {
                            consoleLog("useSdkConfig.notModied: ", response.status)
                            return window.sdkConfigCache;
                        }

                        const config: SdkConfig = response.data as SdkConfig;
                        config.vendors = parseVendors(response.data.vendors);
                        window.sdkConfigCache = config;
                        setSdkConfig(config);

                        // Save cache metadata
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            etag: response.headers["etag"],
                            lastModified: response.headers["last-modified"],
                            cachedData: config
                        }));

                        consoleLog("useSdkConfig.refreshed: ", response.data, ` at ${response.headers["last-modified"]}, with etag, ${response.headers["etag"]}`)

                        return config;
                    } catch (err: any) {
                        if (err.response?.status === 404) {
                            consoleLog("Error fetching SDK config: Resource not found (404): ", err);
                            break;
                        }
                        attempts++;
                        if (attempts === MAX_RETRIES) {
                            consoleLog("Error fetching SDK config: ", err);
                        }
                    }
                }
                return null;
            })();
        }

        window.fetchPromise.then((config) => {
            if (config) setSdkConfig(config);
        });
    }, [appConfig?.r2Domain]);

    return sdkConfig;
};

export default useSdkConfig;