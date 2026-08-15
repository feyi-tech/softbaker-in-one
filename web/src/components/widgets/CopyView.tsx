import React, { useEffect, useState } from 'react';
import { Box, useToast, useClipboard, Text } from '@chakra-ui/react'
import { FaCopy } from "react-icons/fa"

interface TypesInf {
    text?: number,
    address?: number,
    refCode?: number,
    link?: number,
    shillText?: number,
    refLink?: number,
    phone?: number
}
const Types = {
    text: 0,
    address: 1,
    refCode: 2,
    link: 3,
    shillText: 4,
    refLink: 5,
    phone: 6
}

const copyOk = (type: any) => {
    let key
    switch(type) {
        case Types.address:
            key = "Address copied"
            break;
        case Types.refCode:
            key = "Referral code copy copied"
            break;
        case Types.refLink:
            key = "Referral link copied"
            break;
        case Types.shillText:
            key = "Promotion text copied"
            break;
        case Types.phone:
            key = "Phone number copied copied"
            break;
        default:
            key = "Text copied"
    }
    return key
}

interface CopyViewProps {
    as?: any, textToCopy?: string, children?: any, type?: number, copyType?: number, 
    maxChars?: number, onCopyMessage?: string,
    [x: string]: any
}
const CopyView: React.FC<CopyViewProps> & {Types: TypesInf} = ({
    as, textToCopy, children, type, copyType, maxChars, onCopyMessage,
    ...props
}) => {
    type = copyType || type
    const toast = useToast()

    const [value, setValue] = useState('Hello world')
    const { hasCopied, onCopy } = useClipboard(textToCopy || children || "")

    const max = (text: string, maxLength: number) => {
        if(!maxLength || text.length <= maxLength) return text
        var half = Math.round(maxLength / 2)
        return <Text as="span">{text.substring(0, half)}&hellip;{text.slice((maxLength - half) * -1)}</Text>
    }

    useEffect(() => {
        if(hasCopied) {
            toast({
                description: onCopyMessage? onCopyMessage : copyOk(type),
                duration: 3000,
                status: "success",
                isClosable: true
            })
        }
    }, [hasCopied])

    return (
        <Box as={as || "span"} cursor="pointer" onClick={onCopy} {...props}>
            {max(children || "", maxChars || 0)}
            {" "}
            {
                !children || children.length == 0? null : 
                <Box as="span">
                    <Box as={FaCopy} display="inline-block"  />
                </Box>
            }
        </Box>
    )
}

CopyView.Types = Types

export default CopyView