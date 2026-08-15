import { Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure, useToast } from "@chakra-ui/react"
import ModalPop from "../../../widgets/ModalPop"
import CuteButton from "../../../widgets/CuteButton"
import InputBox from "../../../widgets/InputBox"
import { useState } from "react"
import { TxDetails } from "../types"
import DrawerPop from "../../../widgets/DrawerPop"
import { getOtp } from "../func"
import Swal from "sweetalert2"
import { copyFromText } from "@/root/src/utils/f"
import { COMPLETE_STATUS } from "./doc-data"


interface OtpButton {
    accountNumber: number,
    currencySymbol: string,
    otpDuration?: number | null,
    [x: string]: any
}
const OtpButton: React.FC<OtpButton> = ({ accountNumber, otpDuration, currencySymbol, ...props }): JSX.Element => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [ txDetails, setTxDetails ] = useState<TxDetails>({type: "local"} as TxDetails)
    const [ txDetailsWire, setTxDetailsWire ] = useState<TxDetails>({type: "wire"} as TxDetails)

    const [ generatingOtp, setGeneratingOtp ] = useState<boolean>(false)

    const showOtp = (otp: string, type: "local" | "wire") => {
        Swal.fire({
            icon: "success",
            title: "OTP",
            text: type === "local"? `The OTP for the local transfer entered is ${otp}` : `The OTP for the wire transfer entered is ${otp}`,
            confirmButtonText: "Copy OTP"
        })
        .then((result) => {
            //onClose()
            if(result.isConfirmed) {
                copyFromText(otp, () => {
                    toast({
                        description: "OTP copied.",
                        status: "success",
                        duration: 4000,
                        isClosable: true
                    })
                }, () => {
                    Swal.fire({
                        icon: "success",
                        title: "Copy Error",
                        text: `Failed to copy the otp. Copy it manually: ${otp}`
                    })
                })
            }
        })
    }

    const formatOtp = (otp: string, txDetails: TxDetails): string => {
        const n2_9 = Math.floor(Math.random() * 8) + 2 // random number from 2 to 9
        return `${otp.substring(0, otp.length - 2)}${txDetails.skipTxCheck? 1 : n2_9}${txDetails.completeStatus == "Failed"? 1 : 0}`
    }

    const createLocal = () => {
        if (!txDetails.name || !txDetails.name || !txDetails.name) {
            Swal.fire({
                icon: "error",
                title: "Transfer Error",
                text: "Please enter all non-optional fields."
            });
            return;
        }

        if (isNaN(txDetails.amount) || txDetails.amount < 1) {
            Swal.fire({
                icon: "error",
                title: "Transfer Error",
                text: "Invalid amount."
            });
            return;
        }

        setGeneratingOtp(true)
        getOtp(accountNumber, txDetails, otpDuration)
        .then(otp => {
            setGeneratingOtp(false)
            otp = formatOtp(otp, txDetails)
            showOtp(otp, "local")
        })
        .catch(e => {
            setGeneratingOtp(false)
            Swal.fire({
                icon: "error",
                title: "Error while generating OTP",
                text: e.message
            })
        })
        
    }

    const createWire = () => {
        var emptyAcc = (
            (!txDetailsWire.swiftBIC || !txDetailsWire.accountNumber) && 
            (!txDetailsWire.rNumber || !txDetailsWire.accountNumber1)
        )
        if (!txDetailsWire.name || !txDetailsWire.bankName || emptyAcc || !txDetailsWire.amount) {
            
            var detailedError = emptyAcc? "If you're sending to a recipient in USA or Canada, make sure you provide the routing number and the account number. If you're sending to a recipient in Europe or any country using the IBAN system, make sure you provide the Swift/BIC and the IBAN." : ""
            Swal.fire({
                icon: "error",
                title: "Transfer Error",
                text: `Please enter all non-optional fields. ${detailedError}`
            });
            return;
        }

        if (isNaN(txDetailsWire.amount) || txDetailsWire.amount < 1) {
            Swal.fire({
                icon: "error",
                title: "Transfer Error",
                text: "Invalid amount."
            });
            return;
        }

        setGeneratingOtp(true)
        getOtp(accountNumber, txDetailsWire, otpDuration)
        .then(otp => {
            setGeneratingOtp(false)
            otp = formatOtp(otp, txDetails)
            showOtp(otp, "wire")
        })
        .catch(e => {
            setGeneratingOtp(false)
            Swal.fire({
                icon: "error",
                title: "Error while generating OTP",
                text: e.message
            })
        })
    }

    return (
        <>
            <CuteButton status="success" h="50px" onClick={onOpen} {...props}>
                Generate Transfer OTP
            </CuteButton>
            {
                isOpen?
                <DrawerPop title={"Enter Transfer Info"} isOpen={true} onClose={onClose} height={{base: "95%", md: "100%"}} 
                placement={{ base: "bottom", md: "left" }}>
                    <Tabs isFitted variant='enclosed'>
                        <TabList>
                            <Tab>Local Transfer</Tab>
                            <Tab>Wire Transfer</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                {/* Content for Local Transfer */}
                                <InputBox w="100%"
                                    id={`name`}
                                    key={`name`}
                                    title="Recipient Name" mb={2}
                                    placeholder="Enter recipient fullname"
                                    type={InputBox.TYPES.text}
                                    value={txDetails.name || ""} 
                                    onChange={(value) => {
                                        setTxDetails({
                                            ...txDetails,
                                            name: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`accountNumber`}
                                    key={`accountNumber`}
                                    title="Recipient account number" mb={2}
                                    placeholder="Enter the account number"
                                    type={InputBox.TYPES.text}
                                    value={txDetails.accountNumber || ""} 
                                    onChange={(value) => {
                                        setTxDetails({
                                            ...txDetails,
                                            accountNumber: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`amount`}
                                    key={`amount`}
                                    title={`Amount(${currencySymbol})`} mb={2}
                                    placeholder="Enter amount"
                                    type={InputBox.TYPES.text}
                                    value={txDetails.amount || ""} 
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
                                    placeholder="Enter memo"
                                    type={InputBox.TYPES.textarea}
                                    value={txDetails.memo || ""} 
                                    onChange={(value) => {
                                        setTxDetails({
                                            ...txDetails,
                                            memo: value
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
                                    id={`skipTxCheck`}
                                    key={`skipTxCheck`}
                                    title={`Allow Wrong Transfer Info`} mb={4}
                                    helperText={"Check this box if you want the otp to work even when the person intentionally or mistakenly enter a wrong transfer info."}
                                    type={InputBox.TYPES.checkbox}
                                    value={txDetails.skipTxCheck}
                                    onChange={(value) => {
                                        setTxDetails({
                                            ...txDetails,
                                            skipTxCheck: value
                                        })
                                    }}
                                />

                                <CuteButton id="createLocal" status="success" h="50px" onClick={createLocal} disabled={generatingOtp}>
                                    { generatingOtp? "Please wait..." : "Generate OTP" }
                                </CuteButton>

                            </TabPanel>
                            <TabPanel>
                                {/* Content for Wire Transfer */}
                                <InputBox w="100%"
                                    id={`nameWire`}
                                    key={`nameWire`}
                                    title="Recipient Name" mb={2}
                                    placeholder="Enter recipient fullname"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.name || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            name: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`bankWire`}
                                    key={`bankWire`}
                                    title="Bank name" mb={2}
                                    placeholder="Enter recipient bank name"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.bankName || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            bankName: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`rNumber`}
                                    key={`rNumber`}
                                    title={<>Routing Number<br />(Only For USA and Canada recipients)</>} mb={2}
                                    placeholder="Enter the routing number"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.rNumber || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            rNumber: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`accountNumberWire1`}
                                    key={`accountNumberWire1`}
                                    title={<>Account Number<br />(Only For USA and Canada recipients)</>} mb={2}
                                    placeholder="Enter the account number"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.accountNumber1 || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            accountNumber1: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`swiftWire`}
                                    key={`swiftWire`}
                                    title={<>Swift/BIC<br />(Only For European recipients)</>} mb={2}
                                    placeholder="Enter Swift/BIC"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.swiftBIC || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            swiftBIC: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`accountNumberWire`}
                                    key={`accountNumberWire`}
                                    title={<>IBAN<br />(Only For European recipients)</>} mb={2}
                                    placeholder="Enter the international bank account number"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.accountNumber || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            accountNumber: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`amountWire`}
                                    key={`amountWire`}
                                    title={`Amount(${currencySymbol})`} mb={2}
                                    placeholder="Enter amount"
                                    type={InputBox.TYPES.text}
                                    value={txDetailsWire.amount || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            amount: value
                                        })
                                    }}
                                />
                                <InputBox w="100%"
                                    id={`memoWire`}
                                    key={`memoWire`}
                                    title={`Memo(Optional)`} mb={4}
                                    placeholder="Enter memo"
                                    type={InputBox.TYPES.textarea}
                                    value={txDetailsWire.memo || ""} 
                                    onChange={(value) => {
                                        setTxDetailsWire({
                                            ...txDetailsWire,
                                            memo: value
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
                                    id={`skipTxCheck`}
                                    key={`skipTxCheck`}
                                    title={`Allow Wrong Transfer Info`} mb={4}
                                    helperText={"Check this box if you want the otp to work even when the person intentionally or mistakenly enter a wrong transfer info."}
                                    type={InputBox.TYPES.checkbox}
                                    value={txDetails.skipTxCheck}
                                    onChange={(value) => {
                                        setTxDetails({
                                            ...txDetails,
                                            skipTxCheck: value
                                        })
                                    }}
                                />

                                <CuteButton id="createWire" status="success" h="50px" onClick={createWire} disabled={generatingOtp}>
                                    { generatingOtp? "Please wait..." : "Generate OTP" }
                                </CuteButton>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </DrawerPop>
                : null
            }
        </>
    )
}

export default OtpButton