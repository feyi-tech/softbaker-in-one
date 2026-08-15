import React, { useEffect, useState } from 'react';
import { 
    Box, Button, Flex, HStack, Text
} from '@chakra-ui/react';
import { whatsappLink } from '../../../utils/f';
import PleaseWaitForX from '../../widgets/PleaseWaitForX';
import { Vendor } from '../types';
import CopyView from '../../widgets/CopyView';
import { FaExclamationTriangle } from 'react-icons/fa';
import { VendorsWarining } from '../AmountEditor';

interface WhatsappDeposit {
    contactLink?: string | null,
    vendors?: Vendor[] | null,
    coinAmount: number,
    coinSymbol: string,
    wallet: string | null | undefined,
    usdAmount: number,
    fiatSymbol: string,
    fiatName: string,
    fiatLogo: any,
    minVendorCoinAmount: number,
    minVendorUSDAmount: number,
    isDarkMode?: boolean
}
const WhatsappDeposit: React.FC<WhatsappDeposit> = ({ contactLink,
    vendors, coinAmount, coinSymbol, wallet, usdAmount, fiatSymbol, fiatName, fiatLogo,
    minVendorCoinAmount, minVendorUSDAmount
}) => {
    const [vendorPhone, setVendorPhone] = useState<string>()
    const [coinAmountState, setCoinAmount] = useState<number>(0)
    const [usdAmountState, setUsdAmount] = useState<number>(0)

    const [msg, setMsg] = useState<string>("")

    useEffect(() => {
        if(coinAmountState && coinSymbol && wallet) {
            setMsg(`Hello. I want to buy ${coinAmountState} ${coinSymbol}.\n\nSend the BNB to this Binance Smart Chain wallet address: \n\n${wallet}`)
        }
        
    }, [coinAmountState, coinSymbol, wallet])

    const randVendor = (cryproVendors: Vendor[]) => {
        const vendors = []
        for(const vendor of cryproVendors) {
            var freq = 0
            while(freq < vendor.freq) {
                vendors.push(vendor)
                freq++
            }
        }
        return vendors[Math.floor(Math.random() * vendors.length)]

    }

    useEffect(() => {
        if(vendors && vendors.length > 0) setVendorPhone(randVendor(vendors).number) 
    }, [vendors])
    
    /*
    useEffect(() => {
        if(usdAmount < minVendorUSDAmount) {
            setCoinAmount(minVendorCoinAmount)
            setUsdAmount(minVendorUSDAmount)

        } else {
            setCoinAmount(coinAmount)
            setUsdAmount(usdAmount)
        }
    }, [usdAmount, minVendorUSDAmount])*/

    useEffect(() => {
        setCoinAmount(coinAmount)
        setUsdAmount(usdAmount)
    }, [usdAmount])
    
  return (
    <Flex direction="column" alignItems="center" justifyContent="flex-start" w="100%" 
        h={{base: "auto", md: "100%"}} px="1rem" py="2rem" overflowY="auto">

        {
            wallet && vendorPhone?
            <>
                <VendorsWarining vendors={vendors} />
                <Text as="div" mt="1rem" textAlign="center" fontSize="1rem" display="nones">
                    Buy {coinAmountState} {coinSymbol} to deposit approximately <Text as="span" fontSize="1.5rem" fontWeight="bold">${usdAmountState}</Text>
                </Text>

                <Text as="div" mb="1rem" textAlign="center" fontSize="12px" display="nones">
                    Note that after buying {coinSymbol}, the amount credited to your wallet can be a little less or greater than <Text as="span" fontWeight="bold">${usdAmountState}</Text> depending on the current price of {coinSymbol} at the time of payment.
                </Text>

                <Button bg="green.500" color="#fff" mb="0.5rem" 
                _hover={{
                    bg: "green.500 !important",
                    color: "#fff !important",
                    opacity: {base: "1", lg: "0.7"}
                }} 
                _active={{
                    bg: "green.500 !important",
                    color: "#fff !important"
                }} as="a" href={whatsappLink(vendorPhone, msg)}>
                    {fiatLogo}Pay In {fiatName}
                </Button>

                <Box display="none">
                    <Text as="div" mb="1rem" textAlign="center" fontSize="1rem">
                        Click a Fund button below to automatically send a message to any of your crypto vendors on whatsapp to fund your wallet. Or click the "Copy Message" button to copy a message you can send to any of your crypto vendors on any platform to fund your wallet.
                    </Text>

                    <Button bg="green.500" color="#fff" mb="0.5rem" 
                    _hover={{
                        bg: "green.500 !important",
                        color: "#fff !important",
                        opacity: {base: "1", lg: "0.7"}
                    }} 
                    _active={{
                        bg: "green.500 !important",
                        color: "#fff !important"
                    }} as="a" href={whatsappLink(null, msg)} target="_blank">
                        Whatsapp Fund
                    </Button>

                    <Button bg="green.500" color="#fff" mb="0.5rem" 
                    _hover={{
                        bg: "green.500 !important",
                        color: "#fff !important",
                        opacity: {base: "1", lg: "0.7"}
                    }} 
                    _active={{
                        bg: "green.500 !important",
                        color: "#fff !important"
                    }} as="a" href={whatsappLink(null, msg, true)} target="_blank">
                        Whatsapp Web Fund
                    </Button>
                    <CopyView as={Button} fontWeight="bold" m="0px !important" mr="0.5" textToCopy={msg} onCopyMessage="Wallet Funding Message Copied.">Copy Message</CopyView>
                </Box>

                {
                    contactLink?
                    <Text as="div" mt={4} fontSize="12px" textAlign="center">
                        Do you want to apply as a softbaker BNB vendor? <a href={contactLink}>Click here to contact us.</a>
                    </Text>
                    : null
                }

                {
                    usdAmount < minVendorUSDAmount?
                    <Text as="div" fontSize="12px" textAlign="center" display="none">
                        The minimum amount that can be deposited by coin purchase via Cash/Fiat is ${minVendorUSDAmount}
                    </Text> : null
                }
            </>
            :
            <PleaseWaitForX />
        }
    </Flex>
  )
}

interface FiatDeposit extends WhatsappDeposit {
    [x: string]: any
}
const FiatDeposit: React.FC<FiatDeposit> = ({ 
    vendors, coinAmount, coinSymbol, usdAmount, fiatName, fiatSymbol, fiatLogo, wallet,
    minVendorCoinAmount, minVendorUSDAmount, 
    ...props 
}) => {

  return (
    <Box h="100%" {...props}>
      <WhatsappDeposit 
        vendors={vendors}
        minVendorCoinAmount={minVendorCoinAmount} 
        minVendorUSDAmount={minVendorUSDAmount}
        coinAmount={coinAmount}
        coinSymbol={coinSymbol}
        usdAmount={usdAmount}
        fiatName={fiatName}
        fiatSymbol={fiatSymbol}
        fiatLogo={fiatLogo}
        wallet={wallet}
      />
    </Box>
  );
};

export default FiatDeposit;