export interface Theme {
    [x: string]: {
        light: string,
        dark: string
    },
}

export interface Config {
    serverBaseUrlLive: string, 
    serverBaseUrlTest: string,
    appName: string,
    appDomain: string,
    bnbContractAddress: string,
    r2Domain: string,
    metadataCacheVersion?: string | number,
    refEnabled: boolean,
    minRefWithdrawal: number,
    firebaseConfig: {[x: string]: any}
}
