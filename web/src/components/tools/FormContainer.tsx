import { Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react"
import Card from "../widgets/Card"
import CuteButton from "../widgets/CuteButton"
import { getStatusColor } from "../shipview/utils"
import { FaMoneyBill, FaVideo, FaWhatsapp } from "react-icons/fa"
import { useSoftBaker } from "use-softbaker"
import { Tool } from "../../app-config"
import LoadingView from "../widgets/LoadingView"
import useHideForScreenshot from "../../hooks/useHideForScreenshot"
import SPView from "./SPView"
import useToolsSelector from "../../hooks/useToolsSelector"


interface FormContainer {
    tool?: Tool | null,
    maxHeaderWidth: any,
    children: any,
    hideContents?: boolean
}
const FormContainer: React.FC<FormContainer> = ({ tool, maxHeaderWidth, hideContents, children }) => {
    const bg = useColorModeValue('/res/images/patterns/herringbone.png', '/res/images/patterns/herringbone-dark.png')
    const { 
        group_link, balancePendingInUsd,
    } = useSoftBaker();
    const { showTutorial } = useToolsSelector()

    useHideForScreenshot(".sp-view")

    if(!tool) return <LoadingView title="Loading form..." />
    return (
        <Flex
            id="form-container"
            w="100%"
            height="100%"
            overflowY="auto"
            justifyContent="center"
            mt="0px !important"
            backgroundImage={`url(${bg})`}
            bgRepeat="repeat"
            bgSize="auto"
            bgPosition="center"
            position="relative"
        >
            <Flex w="100%" pos="absolute" justifyContent="center" h="auto" flexDirection="column"
            px={{ base: "1rem", md: "2.375rem" }}
            pt={{ base: "2rem", md: "2.375rem" }}
            pb="15rem !important">
                {
                    !hideContents?
                    <Card w="100%" maxW={maxHeaderWidth} h="auto" mb="0.5rem" mx="auto">
                        <HStack flexWrap="wrap" justifyContent="space-between">
                            {
                                tool.mobileVideoUrl || tool.desktopVideoUrl || tool.youtube?
                                <CuteButton onClick={() => {
                                    showTutorial(tool.id)
                                }} bg={getStatusColor("info")} rightIcon={<FaVideo />}>
                                    Tutorial
                                </CuteButton>
                                : null
                            }
                            <CuteButton as="a" href={group_link} target="_blank" bg={"#075E54"} rightIcon={<FaWhatsapp />}>
                                Join Group
                            </CuteButton>
                        </HStack>
                        {
                            balancePendingInUsd > 0?
                            <Text color="green.500" mt="0.5rem" as="div" fontSize="12px" alignSelf="flex-start" fontStyle="italic" fontWeight="bold">
                                <FaMoneyBill style={{display: "inline"}} />&nbsp;Your recent deposit of around ${(Math.floor(balancePendingInUsd || 25.2323 * 100) / 100).toFixed(2)} worth of BNB is currently being confirmed, and will be credited to your balance within 2 minutes.
                            </Text>
                            : null
                        }
                    </Card>
                    : null
                }
                <SPView my={4} mx="auto" />
                {children}
                <SPView my={4} mx="auto" />
            </Flex>
        </Flex>
    )
}

export default FormContainer