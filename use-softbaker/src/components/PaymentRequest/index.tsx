import React, { useEffect, useState } from "react"
import { VStack } from "@chakra-ui/react"
import { IS_TEST, MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS, PROMISE_ID, SDK_NAME, STORAGE_KEYS } from "../../utils/c"
import ModalPop from "../widgets/ModalPop"
import InputBox, { TYPES } from "../widgets/InputBox"
import AppButton from "../widgets/AppButton"
import { FaTicketAlt } from "react-icons/fa"
import { consoleLog, getColor, isEthAddress, rejectPromise, resolvePromise } from "../../utils/f"
import useFirebase from "../Firebase"
import { EmailAuthProvider, User } from "firebase/auth"
import AccessTokenDoor from "../Firebase/AccessTokenDoor"
import CustomError from "../../utils/CustomError"
import { Config } from "../../theme.type"

interface PaymentRequest {
    currentPaymentAddress: string | null,
    config: Config,
    updatePaymentAddress: (address: string, chainCoin: string, user?: User | null) => Promise<void>,
    onClose: () => void,
    isDarkMode?: boolean
}

const PaymentRequest: React.FC<PaymentRequest> = ({ 
    currentPaymentAddress, updatePaymentAddress, onClose, isDarkMode, config
}) => {

    const { auth, user } = useFirebase(config);

    const [ payAddr, setPayAddr ] = useState<string>()
    const [ e, setE ] = useState<string>()
    const [ updatingAddr, setUpdatingAddr ] = useState<boolean>(false)
    const [ showAccessDoor, setShowAccessDoor ] = useState<boolean>(false)

    useEffect(() => {
        if(currentPaymentAddress) setPayAddr(currentPaymentAddress)
    }, [currentPaymentAddress])

    const afterRecentAuth = (addr: string, user?: User | null) => {
        updatePaymentAddress(addr, IS_TEST? "bnb_testnet" : "bnb", user)
        .then(() => {
            onClose()
            resolvePromise(PROMISE_ID.requestPayment, null)

        })
        .catch((e: CustomError) => {
            if(e.code == "expired_auth") {
                setShowAccessDoor(true)
                consoleLog("afterRecentAuth:expired_auth ", e)

            } else {
                setE(e?.message || "An error occured. Please try again later.")
                setUpdatingAddr(false)
            }
        })
    }
    const handleSubmit = () => {
        setE("")
        if(!payAddr) {
            setE("Please enter your payment address")

        } else if(payAddr.toLocaleLowerCase() == (currentPaymentAddress || "").toLocaleLowerCase()) {
            setE("The same wallet address entered. Note that once you submitted a payment wallet address, you don't need to resubmit the same wallet address to initiate payment.")

        } else if(!isEthAddress(payAddr)) {
            setE("Your wallet address is invalid. Please check to make sure it's correct.")

        } else {
            setUpdatingAddr(true)
            var recentLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_MILLI) || 0
            try {
                recentLogin = Number(recentLogin)

            } catch(e) { recentLogin = 0 }
            if((Date.now() - recentLogin) / 1000 > MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS) {
                setShowAccessDoor(true)

            } else {
                afterRecentAuth(payAddr, user)
            }
            
        }
    }

    if(showAccessDoor) {
        return (
            <AccessTokenDoor config={config} isDarkMode={isDarkMode} show={true} onSuccess={(token: string, user: User) => {
                consoleLog("PaymentRequest.AccessTokenDoor:token", token, " | user: ", user)
                afterRecentAuth(payAddr as string, user)
                setShowAccessDoor(false)
            }} onError={(error: any) => {
                setUpdatingAddr(false)
                setE(error?.message || "An error occured. Please try again later.")
                setShowAccessDoor(false)
          }} />
        )
    }

    return (
        <ModalPop bg={getColor(isDarkMode, "cardBg")} title={"Payment Address"} isOpen={true} onClose={() => {
            onClose()
            rejectPromise(PROMISE_ID.requestPayment, new Error(""))
        }}>
            <VStack p="1rem !important" w="100%" h="68vh" justifyContent="flex-start" alignItems="center">
                <InputBox zIndex="10"
                    id={`${SDK_NAME}_payaddr`}
                    key={`${SDK_NAME}_payaddr`}
                    name="payAddr"
                    title="Payment Address" 
                    helperText={`Enter your BNB(Binance smart chain) wallet address to receive your payments.`} 
                    value={payAddr} type={TYPES.text} 
                    mb={4} 
                    onChange={(addr) => {
                        setPayAddr((addr || "").trim())
                    }} 
                    errorMessage={e}
                />
                <AppButton alignSelf="flex-start" onClick={handleSubmit} rightIcon={<FaTicketAlt />} 
                disabled={updatingAddr} fontStyle={updatingAddr? "italic" : "normal"}>
                    {updatingAddr? "Please wait..." : "Submit Payment Address"}
                </AppButton>
            </VStack>
        </ModalPop>
    )
}


export default PaymentRequest
