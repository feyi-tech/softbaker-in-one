import { Text, useColorModeValue, Image } from '@chakra-ui/react'
import Link from '@/components/widgets/Link'


const Logo = ({name, color, logo, logoSize, onClick, ...props}) => {

    return (
        <Link href="/" onClick={onClick}
            color={color || "#009"} 
            fontSize="32px" fontWeight="bold"
            textDecoration="none!important"
            _hover={{
                textDecoration: "none!important"
            }} 
            display="flex" justifyContent="flex-start" alignItems="center">
            {
                logo?
                <Image src={logo} w={"auto"} h={logoSize} mr="0.5rem" {...props} /> : null
            }
            {
                name?
                <Text display={{base: "none", md: "flex"}} 
                fontSize="1.2rem" fontWeight="bold">
                    {name}
                </Text> : null
            }
        </Link>
    )
}

export default Logo