import HText from "./HText";

export default function BigText({children, ...props}) {
    
    return (
        <HText mt="0" mb="1rem" fontSize={{base: "35px", md: "50px"}} lineHeight="1em" fontWeight="300" fontFamily="house-on-mars" {...props}>
            {children}
        </HText>
    )
}