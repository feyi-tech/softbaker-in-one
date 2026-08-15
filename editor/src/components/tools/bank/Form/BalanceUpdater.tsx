import { HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import ModalPop from "../../../widgets/ModalPop"
import CuteButton from "../../../widgets/CuteButton"
import InputBox from "../../../widgets/InputBox"
import { useEffect, useState } from "react"
import { TxDetails } from "../types"
import DrawerPop from "../../../widgets/DrawerPop"
import { getOtp } from "../func"
import Swal from "sweetalert2"
import { copyFromText, numFormatDefault } from "@/root/src/utils/f"
import Loading from "../../../widgets/Loading"
import { COMPLETE_STATUS, PROCESSING_DURATION } from "./doc-data"
import { timestampToGmt } from "@/root/src/utils/time"


interface Update {
    accountBalance?: number | null,
    totalCredits?: number | null,
    totalDebits?: number | null
    credits?: string[] | null,
    debits?: string[] | null,
}
interface TxTypeInfo {
    formTitle: string,

    amountPlaceholder: string,
    amountHelperText: string,
    amountInfo: string,

    memoPlaceholder: string,
    memoHelperText: string,
    memoInfo: string,
}
interface BalanceUpdater {
    credits: string[],
    debits: string[],
    balance: number,
    totalCredits: number,
    totalDebits: number,
    currencySymbol: string,
    onChange: (update: Update) => void,
    saving: boolean
}

interface FundTx extends TxDetails {
    date: Date
}
const BalanceUpdater: React.FC<BalanceUpdater> = ({ 
    credits, debits, balance, totalCredits, totalDebits, currencySymbol, onChange, saving
}): JSX.Element => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [ txDetails, setTxDetails ] = useState<FundTx>({
        date: new Date()
    } as FundTx)
    const [ balanceError, setBalanceError ] = useState<string | undefined | null>()
    const [ memoError, setMemoError ] = useState<string | undefined | null>()

    const [ savingForm, setSavingForm ]  = useState<boolean>(false)
    const [ debiting, setDebiting ]  = useState<boolean>(false)
    const [ clearingFunds, setClearingFunds ]  = useState<boolean>(false)
    useEffect(() => {
        if(!saving) {
            setSavingForm(false)
            setDebiting(false)
            setClearingFunds(false)
        }
    }, [saving])

    const [ showSaving, setShowSaving ]  = useState<boolean>()
    const [ showDebiting, setShowDebiting ]  = useState<boolean>(false)
    const [ showClearingFunds, setShowClearingFunds ]  = useState<boolean>()
    useEffect(() => {
        setShowSaving(saving && savingForm)
        setShowDebiting(saving && debiting)
        setShowClearingFunds(saving && clearingFunds)

    }, [saving, savingForm, debiting, clearingFunds])

    const [ totalBalance, setTotalBalance ] = useState<number>(0)
    useEffect(() => {
        setTotalBalance((balance + totalCredits) - totalDebits)

    }, [balance, totalCredits, totalDebits])

    const clearFunds = () => {
        Swal.fire({
            icon: "warning",
            title: "Transactions Warning",
            text: "Are you sure you want to clear transactions from your account? Clearing transactions will delete all your credits and debits transactions while also resetting your account balance to zero.",
            showCancelButton: true,
            confirmButtonText: "Yes, Clear",
            cancelButtonText: "No"
        })
        .then(result => {
            if(result.isConfirmed) {
                setClearingFunds(true)
                onChange({
                    accountBalance: 0,
                    totalCredits: 0,
                    totalDebits: 0,
                    credits: [],
                    debits: [],
                })
            }
        })
    }

    const [ txType, setTxType ] = useState<"credit" | "debit" | null | undefined>()
    const getTxTypeInfo = ( type: "credit" | "debit" ): TxTypeInfo => {
        if(type == "credit") {
            return {
                formTitle: "Enter Credit Info",

                amountPlaceholder: "Enter the amount to deposit.",
                amountHelperText: "Enter the amount to deposit into the bank account here.",
                amountInfo: "This is where you enter the amount to credit the bank account.",

                memoPlaceholder: "Enter memo.",
                memoHelperText: "Enter the transaction description here.",
                memoInfo: "This is where you enter the transaction description.",
            }

        } else {
            return {
                formTitle: "Enter Debit Info",

                amountPlaceholder: "Enter the amount to deduct.",
                amountHelperText: "Enter the amount to deduct from the bank account here.",
                amountInfo: "This is where you enter the amount to deduct from the bank account.",

                memoPlaceholder: "Enter memo.",
                memoHelperText: "Enter the transaction description here.",
                memoInfo: "This is where you enter the transaction description.",
            }
        }
        
    }
    const handleSend = () => {
        setBalanceError(null)
        setMemoError(null)

        var error = null
        
        if(!txDetails.amount || parseInt(`${txDetails.amount}`) == 0) {
            error = "Please enter the amount."

        } else if(isNaN(txDetails.amount)) {
            error = "Please enter a valid amount."

        } else if(`${txDetails.amount}`.length > 18) {
            error = "The amount is too large."

        } else if(txType == "debit") {
            const newBalance = totalBalance - txDetails.amount
            if(newBalance < 0) {
                error = "You have insufficient balance. Credit your account first."
            }
        }
        if(error) setBalanceError(error)

        var mError = null
        if(txDetails.memo && txDetails.memo.length > 64) {
            mError = "The memo cannot be greater than 64 characters."
        }

        if(mError) setMemoError(mError)

        if(!error && !mError) {
            const updateTotalTxAmounts = (txDetails.completeStatus || "Successful") == "Successful"
            if(txType == "credit") {
                setSavingForm(true)
                const newCredit = credits.concat([
                    `v2,${txDetails.amount},${txDetails.memo || ""},${(txDetails.date || new Date()).getTime()},${(txDetails.processingDuration || "immediately")},${(txDetails.completeStatus || "Successful")}`
                ])
                onChange({
                    credits: newCredit.length > 10? newCredit.splice(newCredit.length - 10) : newCredit,
                    totalCredits: totalCredits + (updateTotalTxAmounts? parseInt(`${txDetails.amount}`) : 0)
                })

            } else {
                setDebiting(true)
                const newDebit = debits.concat([
                    `v2,${txDetails.amount},${txDetails.memo || ""},${(txDetails.date || new Date()).getTime()},${(txDetails.processingDuration || "immediately")},${(txDetails.completeStatus || "Successful")}`
                ])
                onChange({
                    debits: newDebit.length > 10? newDebit.splice(newDebit.length - 10) : newDebit,
                    totalDebits: totalDebits + (updateTotalTxAmounts? parseInt(`${txDetails.amount}`) : 0)
                })
            }
            setTxType(null)
        }
    }
    

    return (
        <>
            <VStack justifyContent="flex-start" alignItems="flex-start" mb={4}>
                <HStack justifyContent="flex-start" alignItems="flex-end" flexWrap="wrap" gap="0px !important" mb={2}>
                    <Text as="div" display="block" mb="2px" fontWeight="700" mr={2}>Account Balance:</Text>
                    <Text as="div" display="block" mb="2px" fontWeight="700" color="#38a169">{currencySymbol}{numFormatDefault(totalBalance, 2, 2)}</Text>
                </HStack>

                <HStack flexWrap="wrap">

                    <CuteButton onClick={() => {
                        setTxType("credit")
                    }} h="40px" mb={1}
                    status={showSaving? "loading" : "success"} 
                    fontStyle={showSaving? "italic" : "normal"} 
                    disabled={saving} 
                    rightIcon={showSaving? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                        { showSaving? "Crediting..." : "Credit Account"}
                    </CuteButton>

                    <CuteButton onClick={() => {
                        setTxType("debit")
                    }} h="40px" mb={1}
                    status={showDebiting? "loading" : "success"} 
                    fontStyle={showDebiting? "italic" : "normal"} 
                    disabled={saving} 
                    rightIcon={showDebiting? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                        { showDebiting? "Debiting..." : "Debit Account"}
                    </CuteButton>

                    <CuteButton onClick={clearFunds} h="40px" mb={1}
                    status={showClearingFunds? "loading" : "error"} 
                    fontStyle={showClearingFunds? "italic" : "normal"} 
                    disabled={saving} 
                    rightIcon={showClearingFunds? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                        { showClearingFunds? "Clearing..." : "Clear Transactions"}
                    </CuteButton>
                </HStack>
            </VStack>
            
            {
                txType?
                <DrawerPop title={getTxTypeInfo(txType).formTitle} isOpen={true} onClose={() => {
                    setTxType(null)
                }} height={{base: "95%", md: "100%"}} 
                placement={{ base: "bottom", md: "left" }}>
                    {/* Content for Local Transfer */}
                    <InputBox w="100%"
                        id={`amount`}
                        key={`amount`}
                        title={`Amount(${currencySymbol})`} mb={2}
                        placeholder={getTxTypeInfo(txType).amountPlaceholder}
                        helperText={getTxTypeInfo(txType).amountHelperText}
                        info={getTxTypeInfo(txType).amountInfo}
                        type={InputBox.TYPES.text}
                        value={txDetails.amount} 
                        errorMessage={balanceError || ""}
                        onChange={(value) => {
                            setTxDetails({
                                ...txDetails,
                                amount: value
                            })
                        }}
                    />
                    <InputBox w="100%"
                        id={`memo`}
                        key={`memo`}
                        title={`Memo(Optional)`} mb={4}
                        placeholder={getTxTypeInfo(txType).memoPlaceholder}
                        helperText={getTxTypeInfo(txType).memoHelperText}
                        info={getTxTypeInfo(txType).memoInfo}
                        type={InputBox.TYPES.textarea}
                        value={txDetails.memo || ""} 
                        errorMessage={memoError || ""}
                        onChange={(value) => {
                            setTxDetails({
                                ...txDetails,
                                memo: value
                            })
                        }}
                    />
                    <InputBox w="100%"
                        id={`date`}
                        key={`date`}
                        title={`Transaction Date(Optional)`} mb={4}
                        helperText={"Select the transaction date."}
                        info={"This is where you select the transaction date."}
                        type={InputBox.TYPES.date}
                        value={txDetails.date || ""} 
                        errorMessage={memoError || ""}
                        onChange={(value) => {
                            setTxDetails({
                                ...txDetails,
                                date: value
                            })
                        }}
                    />

                    <InputBox w="100%"
                        id={`completeStatus`}
                        key={`completeStatus`}
                        title={`Transaction Status`} mb={4}
                        helperText={"Select the transaction status you want for the transaction."}
                        info={"This is where you select the transaction status you want for the transaction."}
                        type={InputBox.TYPES.select}
                        options={Object.keys(COMPLETE_STATUS)} 
                        onOptionValue={(key: string) => key}
                        onOptionName={(key: string) => COMPLETE_STATUS[key]}
                        value={txDetails.completeStatus}
                        onChange={(value) => {
                            setTxDetails({
                                ...txDetails,
                                completeStatus: value
                            })
                        }}
                    />

                    <InputBox w="100%"
                        id={`statusTime`}
                        key={`statusTime`}
                        title="Transaction Processing Time" mb={4}
                        helperText="Select the duration you want the transaction to take before it changes from pending to complete (success or failure)"
                        info="This is where you select the duration you want the transaction to take before it changes from pending to complete (success or failure). This is useful if you don't want a transaction to complete immediately."
                        type={InputBox.TYPES.select}
                        options={Object.keys(PROCESSING_DURATION)} 
                        onOptionValue={(key: string) => key}
                        onOptionName={(key: string) => PROCESSING_DURATION[key]}
                        value={txDetails.processingDuration}
                        onChange={(value: any) => {
                            setTxDetails({
                                ...txDetails,
                                processingDuration: value
                            })
                        }}
                    />

                    <CuteButton id="createLocal" h="50px" onClick={handleSend} status="success">
                        Send
                    </CuteButton>
                </DrawerPop>
                : null
            }
        </>
    )
}

export default BalanceUpdater