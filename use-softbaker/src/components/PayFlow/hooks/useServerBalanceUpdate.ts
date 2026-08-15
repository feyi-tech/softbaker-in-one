import { useState, useEffect } from "react"
import { Balance, BalanceDoc, PriceData, UseBalanceUpdateResult } from "../types"
import useFirebase from "../../Firebase"
import { doc, onSnapshot, collection } from "firebase/firestore"
import axios from "axios"
import { COINS, ERROR_X, IS_TEST, PRECISION, REF_PCT, STORAGE_KEYS } from "../../../utils/c"
import { consoleLog, getError, weiToEther } from "../../../utils/f"
import useReferralId from "./useReferralId"
import Swal from "sweetalert2"
import { User } from "firebase/auth"
import { Config } from "../../../theme.type"

interface CustomWindow extends Window {
    unsubscribeBalance?: () => void;
}
const customWindow = typeof window !== 'undefined' ? (window as CustomWindow) : null;

const UPDATE_RETRIES_WAIT = [
    5000,
    10000,
    20000,
    30000,
    120000
]

const DEFAULT_BALANCE_DOC = {
    usd_balance: 0,
    referral_earnings: 0,
    bnb_payment_address: null,
    bnb_testnet_payment_address: null,
    referred_by: null
}

const useServerBalanceUpdate = (config: Config, priceData: PriceData = {}): UseBalanceUpdateResult => {
    const { user, db } = useFirebase(config)
    
    const { referralId, getReferralId } = useReferralId();

    const [ balanceFirstLoadDone, setBalanceFirstLoadDone ] = useState<boolean>(false)
    const [balanceDoc, setBalanceDoc] = useState<BalanceDoc>(DEFAULT_BALANCE_DOC)

    const getCoinBalanceKey = (coin: string) => {
        return `${coin}_balance`.toLowerCase()
    }

    const readServerCoinBalance = (coin: string): BigInt => {
        var balance = balanceDoc[getCoinBalanceKey(coin)]
        if (!balance) balance = "0"
        return BigInt(balance)
    }

    const [updatingCoins, setUpdatingCoins] = useState<string[]>([])
    const [balanceUpdating, setBalanceUpdating] = useState<boolean>(false)
    const syncConfirmedBalance = (coinsInfo: {[x: string]: BigInt}, lastWaitRetryIndex: number = -1) => {
        if(!balanceFirstLoadDone) return
        const coins = []
        const updating = []
        
        for(const coin of Object.keys(coinsInfo)) {
            if ((coinsInfo[coin] as any) > readServerCoinBalance(coin)) {
                coins.push(coin)
                updating.push(`${coin}:${coinsInfo[coin].toString()}`)
            }
        }
        if(coins.length > 0) {
            setBalanceUpdating(true)
            //Keep track of the coins being synced with the values being synced tp avoid multiple sync request
            setUpdatingCoins(updating)
            //Send sync request for the coins that needs syncing
            updateBalanceDoc(coins)
            .then(() => {
                //setBalanceUpdating(false) will be called inside the snapshot when the new balance has been fetched
            })
            .catch(e => {
                setBalanceUpdating(false)
                //errorCoins contain the coins that failed during balance update
                var errorCoins = e?.response?.data?.errorCoins
                if(errorCoins) {
                    const coinsOnly = errorCoins.map((coinData: {error: string, coin: string}) => coinData.coin)
                    errorCoins = coinsOnly
                } else {
                    errorCoins = Object.keys(coinsInfo)
                }
                //Get the current track of coins being synced. Might have changed by another call of "syncConfirmedBalance" 
                var updatingState = [...updatingCoins]
                //Loop through the coins being synced
                for(const coin of errorCoins) {
                    //Get the coin/balance being synced
                    const coinState = `${coin}:${coinsInfo[coin].toString()}`
                    //If the state still exist
                    if (updatingState.includes(coinState)) {
                        //Remove it so it can be available for syncing again
                        updatingState.splice(updatingState.indexOf(coinState), 1)
                    }
                }
                setUpdatingCoins(updatingState)

                //This line keeps retrying the balance update because the error is more likely to be 
                // max file write per second error or balance update disabled error due to payout ongoing
                var retryIndex = lastWaitRetryIndex + 1
                if(retryIndex >= UPDATE_RETRIES_WAIT.length) retryIndex = 0
                setTimeout(() => {
                    syncConfirmedBalance(coinsInfo, retryIndex)
                }, UPDATE_RETRIES_WAIT[retryIndex])//Retry after 10 seconds in case it's 
            })

        }
    }

    const updateBalanceDoc = (coins: string[], userEmail?: string) => {
        return new Promise((resolve, reject) => {
            if(!user) {
                reject({error: "No User"})

            } else {
                user.getIdToken().then((authToken) => {
                    axios.post(`${IS_TEST? config?.serverBaseUrlTest : config?.serverBaseUrlLive}/update_balance`, {
                        coins, referralId: getReferralId(), userEmail
                    },
                    {
                      headers: {
                        Authorization: authToken,
                      },
                    })
                    .then(result => {
                        consoleLog("updateBalanceDoc:result ", result)
                        resolve(null)
                    })
                    .catch((error: Error) => {
                        consoleLog("updateBalanceDoc:error ", error)
                        reject(getError(error, ERROR_X))
                    })
                });
            }
        })
    }

    const updatePaymentAddress = (address: string, coinKey: string, user?: User | null): Promise<void> => {
        return new Promise((resolve, reject) => {
            if(!user) {
                reject({error: "No User"})

            } else {
                user.getIdToken().then((authToken: string) => {
                    axios.post(`${IS_TEST? config?.serverBaseUrlTest : config?.serverBaseUrlLive}/update_payment_address`, {
                        address, coinKey
                    },
                    {
                      headers: {
                        Authorization: authToken,
                      },
                    })
                    .then(result => {
                        consoleLog("updatePaymentAddress:result ", result)
                        resolve()
                    })
                    .catch((error: Error) => {
                        consoleLog("updatePaymentAddress:error ", error)
                        reject(getError(error, ERROR_X))
                    })
                });
            }
        })
    }

    const transferCredit = (recipientEmail: string, amount: number, user?: User | null): Promise<void> => {
        return new Promise((resolve, reject) => {
            if(!user) {
                reject({error: "No User"})

            } else if(amount > balanceDoc.usd_balance) {
                reject({error: "Insufficient balance. Fund your wallet and try again."})
                
            } else {
                user.getIdToken().then((authToken: string) => {
                    axios.post(`${IS_TEST? config?.serverBaseUrlTest : config?.serverBaseUrlLive}/transfer_credit`, {
                        recipientEmail, amount
                    },
                    {
                      headers: {
                        Authorization: authToken,
                      },
                    })
                    .then(result => {
                        consoleLog("transferCredit:result ", result)
                        resolve()
                    })
                    .catch((error: Error) => {
                        consoleLog("transferCredit:error ", error)
                        reject(getError(error, ERROR_X))
                    })
                });
            }
        })
    }

    const updateBalanceWithEarnings = (balanceInfo: BalanceDoc) => {
        if(!user) {
            setBalanceDoc(DEFAULT_BALANCE_DOC);
            return
        }

        var referralEarnings = 0
        if(IS_TEST) {
            referralEarnings = weiToEther(BigInt(balanceInfo["bnb_testnet_referral_earnings"] || "0"), COINS.bnb_testnet.decimals, PRECISION)
            referralEarnings *= priceData[`${COINS.bnb_testnet.coingecko_price_key}_usd`] || -1;

            var referralEarnings2 = weiToEther(BigInt(balanceInfo["ethereum_testnet_referral_earnings"] || "0"), COINS.ethereum_testnet.decimals, PRECISION)
            referralEarnings2 *= priceData[`${COINS.ethereum_testnet.coingecko_price_key}_usd`] || -1;

            referralEarnings += referralEarnings2

        } else {
            referralEarnings = weiToEther(BigInt(balanceInfo["bnb_referral_earnings"] || "0"), COINS.bnb.decimals, PRECISION)
            referralEarnings *= priceData[`${COINS.bnb.coingecko_price_key}_usd`] || -1;

            var referralEarnings2 = weiToEther(BigInt(balanceInfo["ethereum_referral_earnings"] || "0"), COINS.ethereum.decimals, PRECISION)
            referralEarnings2 *= priceData[`${COINS.ethereum.coingecko_price_key}_usd`] || -1;

            referralEarnings += referralEarnings2
        }

        var prevUsdBalanceString = localStorage.getItem(`${STORAGE_KEYS.LAST_USD_BALANCE}_${user.uid}`)
        var prevUsdBalance = 0
        try {
            prevUsdBalance = Number(prevUsdBalanceString)
        } catch(e) {}
        localStorage.setItem(`${STORAGE_KEYS.LAST_USD_BALANCE}_${user.uid}`, `${balanceInfo.usd_balance}`)

        var balanceIncrease = balanceInfo.usd_balance - prevUsdBalance
        setBalanceDoc({
            ...balanceInfo,
            referral_earnings: referralEarnings
        });

        consoleLog("updateBalanceWithEarnings:", balanceIncrease, balanceInfo.referred_by)
        if(balanceIncrease > 0 && balanceInfo.referred_by && balanceInfo.referred_by.length > 0) {
            const discount = (balanceIncrease * REF_PCT) / 100
            Swal.fire({
                icon: "info",
                title: "Friend Reward",
                text: `Congratulations! You've just received a ${REF_PCT}% deposit friend reward, totaling $${discount.toFixed(2)}, as a token of appreciation for signing up through your friend's referral link. Enjoy this reward on SoftBaker Tools and make the most of your experience!`
            })
        }
    }

    useEffect(() => {
        updateBalanceWithEarnings(balanceDoc)
    }, [priceData])

    useEffect(() => {
        if (!user || !db) {
            setBalanceFirstLoadDone(false)
            setBalanceDoc({
                usd_balance: 0,
                referral_earnings: 0,
                bnb_payment_address: null,
                bnb_testnet_payment_address: null,
                referred_by: null,
            });
            if (customWindow && customWindow.unsubscribeBalance) {
                try {
                    customWindow.unsubscribeBalance();
                } catch (e) {}
            }
            return;
        }

        const unsubscribe = onSnapshot(doc(collection(db, "wallets"), user.uid), (snapshot) => {
            setBalanceFirstLoadDone(true)
            if (snapshot.exists()) {
                const balanceInfo = {
                    usd_balance: 0,
                    referral_earnings: 0,
                    bnb_payment_address: null,
                    bnb_testnet_payment_address: null,
                    referred_by: null,
                    ...snapshot.data()
                } as BalanceDoc
                
                updateBalanceWithEarnings(balanceInfo)
                setBalanceUpdating(false);

            } else {
                updateBalanceWithEarnings(DEFAULT_BALANCE_DOC)
                setBalanceUpdating(false);
            }
        }, (error) => {
            consoleLog("userServerBaanceUpdate: Error listening to user wallet:", error);
            updateBalanceWithEarnings(DEFAULT_BALANCE_DOC)
            setBalanceUpdating(false);
        });

        if (customWindow) {
            customWindow.unsubscribeBalance = unsubscribe;
        }

        return () => unsubscribe();
    }, [user, db])

    return {
        usdBalance: balanceDoc.usd_balance,
        referralEarnings: balanceDoc.referral_earnings,
        bnbPaymentAddress: balanceDoc.bnb_payment_address,
        bnbTestnetPaymentAddress: balanceDoc.bnb_testnet_payment_address,
        balanceUpdating,
        syncConfirmedBalance, updatePaymentAddress, transferCredit
    }
}

export default useServerBalanceUpdate
