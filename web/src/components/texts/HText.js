import BaseText from "./BaseText";

export default function HText({children, mb, fontSize, lineHeight, fontWeight, ...props}) {

    return (
        <BaseText mb={mb || ".5rem"} fontSize={fontSize || "1rem"} lineHeight={lineHeight || "1.5"} 
        fontWeight={fontWeight || "600"} {...props}>
            {children}
        </BaseText>
    )
}