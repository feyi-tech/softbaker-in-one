import { Text } from '@chakra-ui/layout'
import { useEffect, useState } from 'react'

interface NumberViewOption {
    locale?: string, 
    minFD?: number, maxFD?: number, 
    prefix?: string, suffix?: string,
    [x: string]: any
}
interface NumberViewProps {
    children: string | number, as?: any, locale?: string, 
    minFD?: number, maxFD?: number, 
    prefix?: string, suffix?: string,
    [x: string]: any
}
const NumberView: React.FC<NumberViewProps> & {
    format: (children: number, options: NumberViewOption ) => void
    } = ({
    as, children, locale, minFD, maxFD, prefix, suffix, ...props
}) => {
    if(!locale) locale = "en"

    const [num, setNum] = useState<number | string>(children)
    useEffect(() => {
        setNum(isNaN(children as number)? 0 : parseFloat(`${children}`).toLocaleString(locale, {
            minimumFractionDigits: minFD || 0, 
            maximumFractionDigits: maxFD || 0
        }))
    }, [children, locale, minFD, maxFD])
    
    return (
        <Text as={as || 'div'} {...props}>
            {prefix || ''}{num}{suffix || ''}
        </Text>
    )
}

NumberView.format = (children, options) => {
    if(!options) options = {}
    const locale = options?.locale || "en"
    const minFD = options?.minFD || 0
    const maxFD = options?.maxFD || 0
    const prefix = options?.prefix || ''
    const suffix = options?.suffix || ''

    var num = isNaN(children)? 0 : parseFloat(`${children}`).toLocaleString(locale, {
        minimumFractionDigits: minFD, 
        maximumFractionDigits: maxFD
    })

    return `${prefix}${num}${suffix}`
}

//NumberView.format = ({as, children, locale, minFD, maxFD, prefix, suffix})

export default NumberView