import HText from "./HText";

export default function HText4({children, ...props}) {

    return (
        <HText mb=".5rem" fontSize="1rem" lineHeight="1.5" fontWeight="600" {...props}>
            {children}
        </HText>
    )
}