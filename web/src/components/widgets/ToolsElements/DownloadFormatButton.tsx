import { FaFileDownload } from "react-icons/fa"
import CuteButton from "../CuteButton"
import { useState } from "react"
import ModalPop from "../ModalPop"
import { VStack } from "@chakra-ui/react"
import AppButton from "../AppButton"

interface DownloadFormat {
    title: string,
    format: string
}
interface DownloadFormatButton {
    title?: string,
    onDownloadButtonClick: () => boolean,
    children: any,
    downloadFormats: DownloadFormat[],
    onFormatSelected: (format: DownloadFormat) => void,
    showDownloadFormatOptions: boolean | undefined,
    setShowDownloadFormatOptions: (show: boolean) => void,
    hideButton?: boolean,
    [x: string]: any
}
const DownloadFormatButton: React.FC<DownloadFormatButton> = ({ title, 
    children, onDownloadButtonClick, downloadFormats, onFormatSelected,
    showDownloadFormatOptions, setShowDownloadFormatOptions, hideButton, ...props
}) => {

    return (
        <>
            {
                hideButton? null
                :
                <CuteButton rightIcon={<FaFileDownload />}  {...props} onClick={() => {
                    if(downloadFormats.length == 1) {
                        onFormatSelected(downloadFormats[0])
    
                    } else if(onDownloadButtonClick()) {
                        setShowDownloadFormatOptions(true)
                    }
                }}>
                    {children}
                </CuteButton>
            }
            {
                showDownloadFormatOptions?
                <ModalPop justifyContent="flex-start" alignItems="center" 
                title={title || "Select Format"} isOpen={true} 
                onClose={() => { setShowDownloadFormatOptions(false) }}>
                    <VStack w="100%" justifyContent="flex-start" alignItems="center">
                    {
                        downloadFormats.map((format, index) => (
                            <AppButton w="100%" key={index} mb={2} status="warning" onClick={() => {
                                onFormatSelected(format)
                                setShowDownloadFormatOptions(false)
                            }}>{format.title}</AppButton>
                        ))
                    }
                    </VStack>
                </ModalPop>
                : null
            }
        </>
    )
}

export default DownloadFormatButton