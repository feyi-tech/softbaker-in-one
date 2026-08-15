import { useEffect, useState } from "react"
import { Text } from "@chakra-ui/react"

interface Quote {
    children?: any,
    status?: "success" | "info" | "error" | "warning" | "loading",
    [x: string]: any
}

const Quote: React.FC<Quote> = ({ children, status, ...props }) => {

    const [ statusColor, setStatusColor ] = useState<string>()
    useEffect(() => {
        switch(status) {
            case "error":
                setStatusColor("#e53e3e")
                break;
            case "info":
                setStatusColor("#3182ce")
                break;
            case "warning":
                setStatusColor("#dd6b20")
                break;
            case "loading":
                setStatusColor("#dfdfdf")//TODO: animated border for the loading
                break;
            case "success":
                setStatusColor("#38a169")
                break;
            default:
                setStatusColor("#dfdfdf")
        }
    }, [status])
    return (
        <Text as="div" 
            borderLeft={status != "loading"? `4px solid ${statusColor}` : "none"} 
            borderTop={status != "loading"? `1px solid ${statusColor}` : "none"}
            borderBottom={status != "loading"? `1px solid ${statusColor}` : "none"}
            borderRight={status != "loading"? `1px solid ${statusColor}` : "none"}
            px="0.5rem" py="1rem"
            {...props}>
            {children}
        </Text>
    )
}

export default Quote