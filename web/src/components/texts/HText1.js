import HText from "./HText";

export default function HText1({children, ...props}) {

    return (
        <HText fontSize={{base: "calc(1.2875rem + .45vw)", xl: "1.625rem"}} fontFamily="house-on-mars" {...props}>
            {children}
        </HText>
    )
}