import React, { useEffect, useState } from 'react'
import useCoinListener from './useCoinListener'
import { COINS, IS_TEST } from '../../../utils/c'
import { AllCoinsBalanceInfo, PriceData } from '../types'
import { Config } from '../../../theme.type'


const useWalletListener = (serverTotalBalanceInUsd: number, priceData: PriceData, config: Config, disableBlockchainPoll?: boolean): AllCoinsBalanceInfo => {
    const TAG = "useDepositListener"
    const [
        hasErrorBnbTest,
        confirmedDepositsBalanceBnbTest,
        confirmedDepositsBalanceInCoinBnbTest,
        unconfirmedDepositsBalanceBnbTest,
        unconfirmedDepositsBalanceInCoinBnbTest,
        unconfirmedDepositsBnbTest,
        latestDepositBnbTest,
        saltBnbTest,
        paddedSaltBnbTest,
        walletBnbTest,
        walletCreatedBnbTest,
        confirmedDepositsBalanceInUsdBnbTest,
        unconfirmedDepositsBalanceInUsdBnbTest,
    ] = useCoinListener(COINS.bnb_testnet.key, COINS.bnb_testnet.decimals, COINS.bnb_testnet.requiredConfirmations, priceData, config, disableBlockchainPoll)

    const [
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
        confirmedDepositsBalanceInUsdBnb,
        unconfirmedDepositsBalanceInUsdBnb,
    ] = useCoinListener(COINS.bnb.key, COINS.bnb.decimals, COINS.bnb.requiredConfirmations, priceData, config, disableBlockchainPoll)

    const [
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
        confirmedDepositsBalanceInUsdEth,
        unconfirmedDepositsBalanceInUsdEth,
    ] = useCoinListener(COINS.ethereum.key, COINS.ethereum.decimals, COINS.ethereum.requiredConfirmations, priceData, config, disableBlockchainPoll)
    
    const [balancePendingInUsd, setBalancePendingInUsd] = useState<number>(0)

    useEffect(() => {
        if(IS_TEST) {
            setBalancePendingInUsd(
                unconfirmedDepositsBalanceInUsdBnbTest
            )

        } else {
            setBalancePendingInUsd(
                unconfirmedDepositsBalanceInUsdBnb + unconfirmedDepositsBalanceInUsdEth
            )
        }
    }, [unconfirmedDepositsBalanceInUsdBnbTest, unconfirmedDepositsBalanceInUsdBnb, unconfirmedDepositsBalanceInUsdEth])

    return {
        hasErrorBnbTest,
        confirmedDepositsBalanceBnbTest,
        confirmedDepositsBalanceInCoinBnbTest,
        unconfirmedDepositsBalanceBnbTest,
        unconfirmedDepositsBalanceInCoinBnbTest,
        unconfirmedDepositsBnbTest,
        latestDepositBnbTest,
        saltBnbTest,
        paddedSaltBnbTest,
        walletBnbTest, 
        walletCreatedBnbTest,
        confirmedDepositsBalanceInUsdBnbTest,
        unconfirmedDepositsBalanceInUsdBnbTest,

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
        confirmedDepositsBalanceInUsdBnb,
        unconfirmedDepositsBalanceInUsdBnb,

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
        confirmedDepositsBalanceInUsdEth,
        unconfirmedDepositsBalanceInUsdEth,


        balanceInUsd: serverTotalBalanceInUsd, 
        balancePendingInUsd,
    }
}


export default useWalletListener