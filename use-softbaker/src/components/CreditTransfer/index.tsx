import React, { useEffect, useState } from "react"
import { VStack } from "@chakra-ui/react"
import { IS_TEST, MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS, PROMISE_ID, SDK_NAME, STORAGE_KEYS } from "../../utils/c"
import ModalPop from "../widgets/ModalPop"
import InputBox, { TYPES } from "../widgets/InputBox"
import AppButton from "../widgets/AppButton"
import { FaTicketAlt } from "react-icons/fa"
import { consoleLog, getColor, isEthAddress, isValidEmail, rejectPromise, resolvePromise } from "../../utils/f"
import useFirebase from "../Firebase"
import { EmailAuthProvider, User } from "firebase/auth"
import AccessTokenDoor from "../Firebase/AccessTokenDoor"
import CustomError from "../../utils/CustomError"
import Swal from "sweetalert2"
import { Config } from "../../theme.type"

interface CreditTransfer {
    usdBalance: number,
    config: Config,
    transferCredit: (recipientEmail: string, amount: number, user?: User | null) => Promise<void>,
    onClose: () => void,
    isDarkMode?: boolean
}

const CreditTransfer: React.FC<CreditTransfer> = ({ 
    usdBalance, transferCredit, onClose, isDarkMode, config
}) => {

    const { auth, user } = useFirebase(config);

    const [ recipientEmail, setRecipientEmail ] = useState<string>()
    const [ amount, setAmount ] = useState<number>()
    const [ recipientEmailError, setRecipientEmailError ] = useState<string>()
    const [ amountError, setAmountError ] = useState<string>()
    const [ sendingCredit, setSendingCredit ] = useState<boolean>(false)
    const [ showAccessDoor, setShowAccessDoor ] = useState<boolean>(false)

    const showError = (error: string) => {
        Swal.fire({
            icon: "error",
            title: "An error occurred",
            text: error
        })
    }

    const afterRecentAuth = (r: string, a: number, user?: User | null) => {
        transferCredit(r, a, user)
        .then(() => {
            Swal.fire({
                icon: "success",
                title: "Transfer successful",
                text: `$${a} was successfully transfered to ${r}`
            })
            onClose()
            //resolvePromise(PROMISE_ID.creditTransfer, null)

        })
        .catch((e: CustomError) => {
            if(e.code == "expired_auth") {
                setShowAccessDoor(true)
                consoleLog("afterRecentAuth:expired_auth ", e)

            } else {
                consoleLog("afterRecentAuth:!expired_auth ", e)
                showError(e?.message || "An error occured. Please try again later.")
                setSendingCredit(false)
            }
        })
    }
    const handleSubmit = () => {
        setRecipientEmailError("")
        setAmountError("")
        var hasErrors = false
        if(!recipientEmail) {
            setRecipientEmailError("Please enter the recipient email address.")
            hasErrors = true

        } else if(!isValidEmail(recipientEmail)) {
            setRecipientEmailError("Please enter a valid recipient email address.")
            hasErrors = true
        }

        if(!amount) {
            setAmountError("Please enter the amount of credits to send.")
            hasErrors = true

        } else if(amount < 1) {
            setAmountError("The minimum amount you can send is $1.")
            hasErrors = true

        } else if(amount > usdBalance) {
            setAmountError("Insufficient balance. Fund your wallet and try again.")
            hasErrors = true
        }
        
        if(!hasErrors) {
            setSendingCredit(true)
            var recentLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_MILLI) || 0
            try {
                recentLogin = Number(recentLogin)

            } catch(e) { recentLogin = 0 }
            if((Date.now() - recentLogin) / 1000 > MAX_RISKY_OPERATION_LOGIN_AGE_IN_SECONDS) {
                setShowAccessDoor(true)

            } else {
                afterRecentAuth(recipientEmail as string, amount as number, user)
            }
            
        }
    }

    if(showAccessDoor) {
        return (
            <AccessTokenDoor config={config} isDarkMode={isDarkMode} show={true} 
                onSuccess={(token: string, user: User) => {
                consoleLog("CreditTransfer.AccessTokenDoor:token", token, " | user: ", user)
                afterRecentAuth(recipientEmail as string, amount as number, user)
                setShowAccessDoor(false)
            }} onError={(error: any) => {
                setSendingCredit(false)
                showError(error?.message || "An error occured. Please try again later.")
                setShowAccessDoor(false)
          }} />
        )
    }

    return (
        <ModalPop bg={getColor(isDarkMode, "cardBg")} title={"Transfer Credit"} isOpen={true} onClose={() => {
            onClose()
            //rejectPromise(PROMISE_ID.creditTransfer, new Error(""))
        }}>
            <VStack p="1rem !important" w="100%" h="68vh" justifyContent="flex-start" alignItems="center">
                <InputBox zIndex="10"
                    id={`${SDK_NAME}_addr`}
                    key={`${SDK_NAME}_addr`}
                    name="addr"
                    title="Recipient Email Address" 
                    helperText={`Enter the email address of the user you want to transfer your credits to.`} 
                    value={recipientEmail} type={TYPES.text} 
                    mb={4} 
                    onChange={(email) => {
                        setRecipientEmail((email || "").trim())
                    }} 
                    errorMessage={recipientEmailError}
                />
                
                <InputBox zIndex="10"
                    id={`${SDK_NAME}_amount`}
                    key={`${SDK_NAME}_amount`}
                    name="amount"
                    title="Transfer Amount" 
                    helperText={`Enter the amount to transfer. The minimum amount you can transfer is $1`}
                    value={amount} type={TYPES.number} 
                    numberDecimals={0}
                    numberUnit={`$`} 
                    mb={4} 
                    onChange={(a) => {
                        setAmount(a)
                    }} 
                    errorMessage={amountError}
                />

                <AppButton alignSelf="flex-start" onClick={handleSubmit} rightIcon={<FaTicketAlt />} 
                disabled={sendingCredit} fontStyle={sendingCredit? "italic" : "normal"}>
                    {sendingCredit? "Please wait..." : "Send Credit"}
                </AppButton>
            </VStack>
        </ModalPop>
    )
}


export default CreditTransfer
