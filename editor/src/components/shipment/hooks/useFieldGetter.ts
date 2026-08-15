import { useEffect, useState } from "react";
import { ServerFileField } from "../../tools/index.types";
import { getFileFieldFile, getServerFileUrl } from "@/root/src/utils/f";

export const useServerFileUrl = (field?: ServerFileField | string | null) => {
    const [ url, setUrl ] = useState<string>()

    useEffect(() => {
        setUrl(getServerFileUrl(field))
    }, [ field ])

    return url
}

export const useFileFieldUrl = (collectionName: string, dataId: string, fieldkey: string, data: any): [
    string | null | undefined,
    () => void
] => {
    const [ url, setUrl ] = useState<string | null>()

    const reset = () => {
        setUrl(getFileFieldFile(collectionName, dataId, fieldkey))
    }

    useEffect(() => {
        reset()
    }, [ collectionName, dataId, fieldkey, data ])

    

    return [ url, reset ]
}