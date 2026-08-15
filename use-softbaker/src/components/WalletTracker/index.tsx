import React, { useEffect, useState } from 'react'
import { Box, Divider, HStack, Text, VStack, Image, Button } from "@chakra-ui/react"
import { AllCoinsBalanceInfo, SaltBalanceConfirmation } from '../PayFlow/types'
import ModalPop from '../widgets/ModalPop'
import useFirebase from '../Firebase'
import { COINS, REF_PCT } from '../../utils/c'
import { getColor } from '../../utils/f'
import CopyView from '../widgets/CopyView'
import Swal from 'sweetalert2'
import { FaExchangeAlt, FaMoneyBill, FaPiggyBank } from 'react-icons/fa'
import { Config } from '../../theme.type'

interface WalletTracker {
    affPct?: number,
    walletListenerResult: AllCoinsBalanceInfo,
    defaultDepositAmount: number,
    balanceUpdating: boolean, referralEarnings: number,
    config: Config,
    requestPayment: () => Promise<void>, currentPaymentAddress?: string | null,
    onClose: () => void,
    deposit: (amount: number, signInTitle?: string | null, signUpTitle?: string | null) => Promise<SaltBalanceConfirmation>,
    sell: (signInTitle?: string | null, signUpTitle?: string | null) => void,
    isDarkMode?: boolean
}


interface UnconfirmedDeposit {
    deposit: SaltBalanceConfirmation
}
const UnconfirmedDeposit: React.FC<UnconfirmedDeposit> = ({ deposit }) => {
    return (
        <VStack w="100%" justifyContent="flex-start" alignItems="center" mb="0.5rem">
            <HStack w="100%" justifyContent="space-between" alignItems="flex-start">
                <HStack justifyContent="flex-start" alignItems="center">
                    <Image src={COINS[deposit.coin].logo} w="25px" h="25px" />
                    <Text as="div">{COINS[deposit.coin].symbol}</Text>
                </HStack>

                <VStack justifyContent="flex-start" alignItems="center" gap="0rem !important">
                    <Text as="div" lineHeight="50%" mb="0px !important">{deposit.depositedAmountInCoin}</Text>
                    {
                        deposit.depositedAmountInUsd > 0?
                        <Text as="div" mb="0px !important">~ ${(Math.floor(deposit.depositedAmountInUsd * 100) / 100).toFixed(2)}</Text> : null
                    }
                </VStack>
            </HStack>

            <Text as="div" fontStyle="italic" fontSize="11px">{deposit.remainingConfirmations} of {deposit.requiredConfirmations} confirmations remaining.</Text>

            <Box w="90%">
                <Divider />
            </Box>
        </VStack>
    )
}
const WalletTracker: React.FC<WalletTracker> = ({ 
    affPct,
    walletListenerResult, defaultDepositAmount, 
    balanceUpdating, referralEarnings,
    onClose, deposit, sell, isDarkMode, requestPayment, currentPaymentAddress, config 
}) => {
    const { user } = useFirebase(config)

    const { 
        hasErrorBnbTest,
        confirmedDepositsBalanceBnbTest,
        confirmedDepositsBalanceInCoinBnbTest,
        unconfirmedDepositsBalanceBnbTest,
        unconfirmedDepositsBalanceInCoinBnbTest,
        unconfirmedDepositsBnbTest,
        latestDepositBnbTest,
        saltBnbTest,
        paddedSaltBnbTest,
        walletBnbTest, walletCreatedBnbTest,

        hasErrorBnb,
        confirmedDepositsBalanceBnb,
        confirmedDepositsBalanceInCoinBnb,
        unconfirmedDepositsBalanceBnb,
        unconfirmedDepositsBalanceInCoinBnb,
        unconfirmedDepositsBnb,
        latestDepositBnb,
        saltBnb,
        paddedSaltBnb,
        walletBnb, 
        walletCreatedBnb,

        hasErrorEth,
        confirmedDepositsBalanceEth,
        confirmedDepositsBalanceInCoinEth,
        unconfirmedDepositsBalanceEth,
        unconfirmedDepositsBalanceInCoinEth,
        unconfirmedDepositsEth,
        latestDepositEth,
        saltEth,
        paddedSaltEth,
        walletEth, 
        walletCreatedEth,
    
        balanceInUsd, balancePendingInUsd
    } = walletListenerResult

    const [totalUnconfirmedDeposits, setTotalUnconfirmedDeposits] = useState<number>(0)
    useEffect(() => {
        setTotalUnconfirmedDeposits(unconfirmedDepositsBnbTest.length + unconfirmedDepositsBnb.length + unconfirmedDepositsEth.length)
    }, [unconfirmedDepositsBnbTest, unconfirmedDepositsBnb, unconfirmedDepositsEth])

    if(defaultDepositAmount == 0) return null
    return (
        <ModalPop bg={getColor(isDarkMode, "cardBg")} onClose={onClose} isOpen={true} 
        title="Softbaker Wallet" subtitle={user?.email}>
            <Box w="100%" display="flex" justifyContent="space-between" alignItems="flex-end" pt="8px" px={{base: "8px", md: "32px"}} 
            borderBottom="">
                <VStack justifyContent="center" alignItems="flex-start">
                    <Box fontSize="11px">Deposits</Box>
                    <Box fontSize="1rem" fontWeight="bold" color="green.500" mt="0px !important">
                        ${(Math.floor(balanceInUsd * 100) / 100).toFixed(2)}
                    </Box>
                </VStack>
                <Box display="flex" justifyContent="flex-start" alignItems="flex-end">
                    <Button bg="red.500" mr="0.5rem" size="sm" color="#fff"
                    _hover={{
                        bg: "green.500 !important",
                        color: "#fff !important",
                        opacity: {base: "1", lg: "0.7"}
                    }} 
                    _active={{
                        bg: "green.500 !important",
                        color: "#fff !important"
                    }} onClick={() => {
                        sell("Sign In to transfer your credits.", "Sign Up to transfer your credits.")
                    }}>
                        Transfer
                    </Button>
                    <Button bg="green.500" size="sm" color="#fff" 
                    _hover={{
                        bg: "green.500 !important",
                        color: "#fff !important",
                        opacity: {base: "1", lg: "0.7"}
                    }} 
                    _active={{
                        bg: "green.500 !important",
                        color: "#fff !important"
                    }} onClick={() => {
                        deposit(defaultDepositAmount, "Sign In to fund your wallet.", "Sign Up to fund your wallet.")
                        .then(() => {})
                        .catch(e => {})
                    }}>
                        Fund Wallet
                    </Button>
                </Box>
            </Box>
            <Box w="100%" display="flex" justifyContent="space-between" alignItems="flex-end" pt="8px" px={{base: "8px", md: "32px"}} 
            borderBottom="">
                <VStack justifyContent="center" alignItems="flex-start">
                    {
                        user?
                        <Box fontSize="11px">Referral Earnings</Box>
                        : null
                    }
                    <Box fontSize="1rem" fontWeight="bold" color="orange.500" mt="0px !important" fontStyle={referralEarnings < 0? 'italic' : "normal"}>
                        {referralEarnings < 0? "Loading..." : `$${(Math.floor(referralEarnings * 100) / 100).toFixed(2)}`}
                    </Box>
                </VStack>
                <Button bg="orange.500" size="sm" color="#fff" 
                _hover={{
                    bg: "orange.500 !important",
                    color: "#fff !important",
                    opacity: {base: "1", lg: "0.7"}
                }} 
                _active={{
                    bg: "orange.500 !important",
                    color: "#fff !important"
                }} onClick={() => {
                    requestPayment()
                    .then(() => {
                        Swal.fire({
                            title: "Payment Address Submitted",
                            icon: "success",
                            text: "Your payment address has been successfully submitted. Payments will be processed on the 7th, 17th, and 27th of each month, provided that your referral earnings have reached or exceeded the minimum payment threshold of $20 on the respective payout days."
                        })
                    })
                    .catch((e: any) => {
                        if(e.message.length > 0) {
                            Swal.fire({
                                title: "Payment Error",
                                icon: "error",
                                text: e.message
                            })
                        }
                    })
                }}>
                    {currentPaymentAddress? "Edit Payment Address" : "Request Payment"}
                </Button>
            </Box>
            <Divider mx="0px !important" my={2} />
            {
                totalUnconfirmedDeposits > 0?
                <VStack w="100%">
                    <HStack w="100%" justifyContent="center" alignItems="flex-start">
                    {
                        balancePendingInUsd > 0?
                        <Text as="div" fontSize="14px" textAlign="center">
                            You have <Text as="span" fontWeight="bold">${(Math.floor(balancePendingInUsd * 100) / 100).toFixed(2)} worth of {totalUnconfirmedDeposits} crypto {totalUnconfirmedDeposits > 1? "deposits" : "deposit"}</Text> awaiting confirmations.
                        </Text>
                        :
                        <Text as="div" fontSize="14px" textAlign="center">
                            You have <Text as="span" fontWeight="bold">{totalUnconfirmedDeposits} {totalUnconfirmedDeposits > 1? "deposits" : "deposit"}</Text> awaiting confirmations.
                        </Text>
                    }
                    </HStack>
                    <Box w="100%" h="250px" overflow="auto" p="0.5rem">
                    {
                        unconfirmedDepositsBnbTest.map((deposit, index) => (
                            <UnconfirmedDeposit deposit={deposit} key={index} />
                        ))
                    }
                    {
                        unconfirmedDepositsBnb.map((deposit, index) => (
                            <UnconfirmedDeposit deposit={deposit} key={index} />
                        ))
                    }
                    {
                        unconfirmedDepositsEth.map((deposit, index) => (
                            <UnconfirmedDeposit deposit={deposit} key={index} />
                        ))
                    }
                    </Box>
                </VStack>
                :
                balanceUpdating?
                <VStack w="100%">
                    <HStack w="100%" justifyContent="center" alignItems="flex-start">
                        <Text as="div" fontSize="14px" fontWeight="500" textAlign="center" fontStyle="italic">
                            Updating your balance with confirmed deposits...
                        </Text>
                    </HStack>
                </VStack>
                :
                <>
                {
                    affPct === null || affPct === undefined?
                    <VStack w="100%">
                        <HStack w="100%" justifyContent="center" alignItems="flex-start">
                            <Text as="div" fontSize="14px" fontWeight="500" textAlign="center" fontStyle="italic">
                                Checking affiliate info...
                            </Text>
                        </HStack>
                    </VStack>
                    :
                    affPct > 0 && config.refEnabled?
                    <VStack w="100%" justifyContent="flex-start" alignItems="center">
                        <Text as="div" m="0px !important" fontSize="14px">Your referral link is: </Text>
                        <CopyView fontSize="11px" fontWeight="500" color="orange.500" textDecoration="underline" textAlign="center" as="div" m="0px !important" mb="0.5rem" textToCopy={`https://${config.appDomain}/?ref=${user?.uid}`} onCopyMessage="Referral link copied.">
                            https://{config.appDomain}/?ref={user?.uid}
                        </CopyView>
                        <Text as="div" fontSize="12px" fontWeight="500" textAlign="center">
                            Click your unique referral link to conveniently copy it, and begin sharing it with your friends, fans, and audience. Earn a {affPct || "???"}% reward each time they make a deposit. They also enjoy a {affPct || "???"}% bonus added to their balance on each deposit for signing up with your referral link.
                        </Text>
                        <Text as="div" fontSize="12px" fontWeight="500" textAlign="center">
                            Your earnings will be paid on the 7th, 17th, and 27th of each month.
                        </Text>
                    </VStack>
                    : null
                }
                </>
            }
        </ModalPop>
    )
}

export default WalletTracker