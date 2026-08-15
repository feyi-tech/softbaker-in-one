import { Image, Text, HStack, VStack } from "@chakra-ui/react"
import { FaBtc, FaMoneyBill, FaSteam, FaWallet } from "react-icons/fa"


interface SPView {
    [x: string]: any
}

const SPView = ({ ...props }) => {
    return null;/*
    
    return (
        <>
            <HStack w={{base: "100%", md: "100%"}} h={{base: "auto", md: "auto"}} 
                className="sp-views" {...props} as="a" target="_blank" href="https://azacity.com"
                bg="#3a3b40" justifySelf="flex-start" alignItems={{base: "flex-start", md: "center"}} p="0.5rem">
                <Image src="/res/azacity-logo.png" w={{base: "70px", md:"100px"}} />
                <VStack w="100%" justifySelf="center" alignItems="flex-start" gap="0px">
                    <Text as="h1" fontSize={{base: "1rem", md: "1.3rem"}} mb={2} color="#00d094">Click me to get the Best Rates at AzaCity(https://azacity.com)</Text>
                    <HStack justifyContent="flex-start" alignItems="flex-start">
                        <FaWallet />
                        <Text fontSize={{base: "0.8rem", md: "1rem"}} mb={0.5} color="#86bcea">All AZA available for fast cashout.</Text>
                    </HStack>
                    <HStack justifyContent="flex-start" alignItems="flex-start">
                        <FaBtc />
                        <Text fontSize={{base: "0.8rem", md: "1rem"}} mb={0.5} color="#f7d600">Buying BTC, ETH, USDT, and all other cryptocurrency.</Text>
                    </HStack>
                    <HStack justifyContent="flex-start" alignItems="flex-start">
                        <FaSteam />
                        <Text fontSize={{base: "0.8rem", md: "1rem"}} mb={0.5} color="#00c92f">Buying all Gift Cards at the best rates.</Text>
                    </HStack>
                    <HStack justifyContent="flex-start" alignItems="flex-start">
                        <FaMoneyBill />
                        <Text fontSize={{base: "0.8rem", md: "1rem"}} mb={0.5} color="#f75e00">
                            Get up to 10 million Naira loan with low interest rates as a loyal AzaCity customer.
                        </Text>
                    </HStack>
                </VStack>
            </HStack>
        </>
    )*/
}

export default SPView