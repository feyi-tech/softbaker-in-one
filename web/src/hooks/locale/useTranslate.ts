
import LANGS, { DEFAULT_LANG, DEFAULT_LANG_TRANSLATION_COMPLETE_TEXT } from './langs'
import useGoogleTranslate, { FutureText, GoogleLanguage } from 'use-google-translate'


const useTranslate = (futureTexts: (FutureText | string)[]) => {
    return useGoogleTranslate(LANGS, DEFAULT_LANG, DEFAULT_LANG_TRANSLATION_COMPLETE_TEXT, futureTexts, false, 5000)
}

export default useTranslate