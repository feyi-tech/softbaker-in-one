import axios, { AxiosRequestConfig, AxiosResponse } from "axios"

interface NetCacheOptions {
    maxAge?: number,
    skipCache?: boolean
}
interface Cache {
    maxAge: number,
    data: any,
    saveTime: number
}
const ALL_CACHES_KEY = "MEET_OFFLINE_NOW_NET_CACHE"
class Net {
    private config
    private netCacheOptions
    static instances: {[x: string]: Net} = {}
    constructor(config?: AxiosRequestConfig<any> | null, netCacheOptions?: NetCacheOptions | null) {
        if(config) this.config = config
        if(netCacheOptions) this.netCacheOptions = netCacheOptions
    }

    
    static urlToDomain = (url: string): string => {
        const u = new URL(url)
        return u.hostname
    }

    static urlToId = (url: string): string => {
        return url
    }

    static getAllCaches = () => {
        const allCacheString = window.localStorage.getItem(ALL_CACHES_KEY)
        let allCaches: {[x: string]: any}
        if(allCacheString) {
            try {
                allCaches = JSON.parse(allCacheString)
            } catch {
                allCaches = { }
            }

        } else {
            allCaches = { }
        }

        return allCaches
    }

    static getCacheDataById = (id: string, method: string): AxiosResponse<any, any> | null => {
        var cache: Cache | null = null
        const allCacheString = window.localStorage.getItem(ALL_CACHES_KEY)
        let allCaches: {[x: string]: any} = Net.getAllCaches()
        if(allCaches[id] && allCaches[id][method]) {
            cache = allCaches[id][method]
        }

        //console.log("Net.get:cacheString", allCacheString)
        //console.log("Net.get:cacheParsed", cache)
        if(cache) {
            if(Date.now() - cache.saveTime > cache.maxAge) {
                window.localStorage.removeItem(id)
                delete allCaches[id][method]
                try {
                    window.localStorage.setItem(ALL_CACHES_KEY, JSON.stringify(allCaches))

                } catch(e) {
                    window.localStorage.clear()
                    window.localStorage.setItem(ALL_CACHES_KEY, JSON.stringify(allCaches))
                }
                //console.log("Net.get:cacheExpired", `Elapsed: ${Date.now() - cache.saveTime} : TTL: ${cache.maxAge}`)
                return null

            } else {
                //console.log("Net.get:cacheData", cache.data)
                return cache.data
            }

        } else {
            return null
        }
    }

    static saveCacheDataToId = (id: string, method: string, data: any, netCacheOptions?: NetCacheOptions | null): void => {
        
        //console.log("Net.get:saveCacheDataToId")
        if(netCacheOptions?.maxAge && netCacheOptions.maxAge > 0) {
            const cache: Cache = {
                maxAge: netCacheOptions.maxAge,
                saveTime: Date.now(),
                data: data
            }
            
            let allCaches: {[x: string]: any} = Net.getAllCaches()
            allCaches[id] = { ...({ ...allCaches[id], [method]: cache } || { [method]: cache }) }
            try {
                window.localStorage.setItem(ALL_CACHES_KEY, JSON.stringify(allCaches))

            } catch(e) {
                window.localStorage.clear()
                window.localStorage.setItem(ALL_CACHES_KEY, JSON.stringify(allCaches))
            }
        }
    }

    static get = (url: string, netCacheOptions?: NetCacheOptions | null, config?: AxiosRequestConfig<any> | null): Promise<AxiosResponse<any, any>> => {
        return new Promise((resolve, reject) => {
            const domain = Net.urlToDomain(url)
            var instance: Net = Net.instances[domain]
            if(!instance) {
                instance = new Net(config, netCacheOptions)
                Net.instances[domain] = instance
            }

            const requestId = Net.urlToId(url)
            if(!netCacheOptions?.skipCache) {
                //get cache data from local storage
                const data = Net.getCacheDataById(requestId, "GET")
                
                //console.log("Net.get.instance.cacheData", data)
                if(data) {
                    resolve(data)
                    return
                }
            }

            //console.log("Net.get:willGet")
            axios.get(url, config || instance.config)
            .then(result => {
                if(result.status == 200) {
                    this.saveCacheDataToId(requestId, "GET", result, netCacheOptions || instance.netCacheOptions)
                    //console.log("Net.get:status", result.status)
                }
                resolve(result)
            })
            .catch(e => {
                reject(e)
            })
        })

    }
}

export default Net