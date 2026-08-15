import { GoogleLanguage } from "use-google-translate";

export interface Lang extends GoogleLanguage {
    code: string, name: string, countryCode: string, isRTL: boolean
}