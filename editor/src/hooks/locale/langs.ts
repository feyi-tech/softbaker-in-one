import { Lang } from "./types";

const LANGS: { [code: string]: Lang } = {
    en: {
        code: "en",
        name: "English",
        isRTL: false,
        countryCode: "us"
    },/*
    ha: {
        code: "ha",
        name: "Hausa",
        isRTL: false,
        countryCode: "ng"
    },
    ig: {
        code: "ig",
        name: "Igbo",
        isRTL: false,
        countryCode: "ng"
    },
    yo: {
        code: "yo",
        name: "Yorùbá",
        isRTL: false,
        countryCode: "ng"
    },*/
    "zh-CN": {
        code: "zh-CN",
        name: "中文",
        isRTL: false,
        countryCode: "cn"
    },
    id: {
        code: "id",
        name: "Bahasa Indonesia",
        isRTL: false,
        countryCode: "id"
    },
    ar: {
        code: "ar",
        name: "العربية",
        isRTL: true,
        countryCode: "sa"
    },
    fr: {
        code: "fr",
        name: "Français",
        isRTL: false,
        countryCode: "fr"
    },
    pt: {
        code: "pt",
        name: "Português",
        isRTL: false,
        countryCode: "pt"
    },
    es: {
        code: "es",
        name: "Español",
        isRTL: false,
        countryCode: "es"
    },
    ru: {
        code: "ru",
        name: "Русский",
        isRTL: false,
        countryCode: "ru"
    },
    it: {
        code: "it",
        name: "Italiano",
        isRTL: false,
        countryCode: "it"
    },
    nl: {
        code: "nl",
        name: "Nederlands",
        isRTL: false,
        countryCode: "nl"
    },
    de: {
        code: "de",
        name: "Deutsch",
        isRTL: false,
        countryCode: "de"
    },
    ja: {
        code: "ja",
        name: "日本語",
        isRTL: false,
        countryCode: "jp"
    },
    hi: {
        code: "hi",
        name: "हिन्दी",
        isRTL: false,
        countryCode: "in"
    },
    "zh-TW": {
        code: "zh-TW",
        name: "中文(台灣)",
        isRTL: false,
        countryCode: "tw"
    },
    ms: {
        code: "ms",
        name: "Bahasa Malaysia",
        isRTL: false,
        countryCode: "my"
    },
    vi: {
        code: "vi",
        name: "Tiếng Việt",
        isRTL: false,
        countryCode: "vn"
    },
    uk: {
        code: "uk",
        name: "Українська",
        isRTL: false,
        countryCode: "ua"
    },
    iw: {
        code: "iw",
        name: "עִבְרִית",
        isRTL: true,
        countryCode: "il"
    },
    ko: {
        code: "ko",
        name: "한국어",
        isRTL: false,
        countryCode: "kr"
    },
};
export const DEFAULT_LANG = "en"
export const DEFAULT_LANG_TRANSLATION_COMPLETE_TEXT = "This is good."

export default LANGS