import { Box } from "@chakra-ui/react";

interface Hero {
    [x: string]: any
}
const HeroBox: React.FC<Hero> & {
    First: (data: Hero) => any, Second: (data: Hero) => any
} = ({children, reverse, mobileReverse, ...props}) => {


    return (
        <Box className="hero-box" flexDirection={
            {base: "column-reverse", md: !reverse? "row" : "row-reverse"}
        } {...props}>
            {children}
        </Box>
    )
}

HeroBox.First = ({as, children, ...props}) => {

    return (
        <Box as={as || "div"} d="flex" flex="1 1 0%" flexDirection="column" pt={{base: "0px", md: "44px"}} {...props}>
            {children}
        </Box>
    )
}
HeroBox.Second = ({as, children, ...props}) => {

    return (
        <Box as={as || "div"} className="hero-box-right" {...props}>
            <Box w="100%">
                {children}
            </Box>
        </Box>
    )
}

export default HeroBox