import { Text } from "@chakra-ui/react"

interface MultilineTextProps {
    as?: any,
    children?: string,
    newLine?: string
}

const MultilineText: React.FC<MultilineTextProps> = ({as, children, newLine}) => {


    return (
        <Text as={as || "div"}>
            {
                children && children.includes(newLine || "\n")?
                children.split(newLine || "\n").map((text: string, index: number) => (
                    <>
                        <Text as="div" key={index}>
                            {text}
                        </Text>
                    </>
                ))
                :
                children
            }
        </Text>
    )
}

export default MultilineText