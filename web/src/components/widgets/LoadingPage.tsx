import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react"
import Loading from "./Loading"
import Section from "./Section"
import PageTitle from "../PageBody/PageTitle"

interface LoadingPage {
    appName?: any, appNameColor?: any, appLogo?: any,
    link?: any, title?: any, description?: any, image?: any, type?: any, updatedTime?: any, 
    bg?: any, color?: any
}
const LoadingPage: React.FC<LoadingPage> = ({
    /*App name, children and meta props props*/
    appName, appNameColor, appLogo,
    link, title, description, image, type, updatedTime, 
    bg, color
}) => {

    return (
        <Box w="100%" h="100vh" bg={bg || "#fff"}>
            <PageTitle link={link} title={title} description={description} image={image} type={type} updatedTime={updatedTime} />
            <Section display="flex" justifyContent="center" alignItems="center" h="50vh">
                <VStack>
                    <Loading
                        style={{display: "inline !important"}}
                        width={"70px"}
                        height={"70px"}
                        color={color}
                        type={Loading.TYPES.threeDots} />

                    <Text as="div" mt="0.5rem" fontStyle="italic">
                        Loading tools. Please wait...
                    </Text>
                </VStack>
            </Section>
        </Box>
    )
}

export default LoadingPage