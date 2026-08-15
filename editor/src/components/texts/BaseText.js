import { Text } from "@chakra-ui/layout";

export default function BaseText({children, ...props}) {
    
    return (
        <Text as="div" {...props}>
            {children}
        </Text>
    )
}