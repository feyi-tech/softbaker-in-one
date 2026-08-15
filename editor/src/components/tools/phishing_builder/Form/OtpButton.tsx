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


interface OtpButton {
    accountNumber: number,
    currencySymbol: string,
    otpDuration?: number | null,
}
const OtpButton: React.FC<OtpButton> = ({ accountNumber, otpDuration, currencySymbol }): JSX.Element => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const [ txDetails, setTxDetails ] = useState<TxDetails>({type: "local"} as TxDetails)
    const [ txDetailsWire, setTxDetailsWire ] = useState<TxDetails>({type: "wire"} as TxDetails)

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

        getOtp(accountNumber, txDetails, otpDuration)
        .then(otp => {
            showOtp(otp, "local")
        })
        .catch(e => {
            Swal.fire({
                icon: "error",
                title: "Error while generating OTP",
                text: e.message
            })
        })
        
    }

    const createWire = () => {
        if (!txDetailsWire.name || !txDetailsWire.bankName || !txDetailsWire.swiftBIC || !txDetailsWire.accountNumber || !txDetailsWire.amount) {
            Swal.fire({
                icon: "error",
                title: "Transfer Error",
                text: "Please enter all non-optional fields."
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

        getOtp(accountNumber, txDetailsWire, otpDuration)
        .then(otp => {
            showOtp(otp, "wire")
        })
        .catch(e => {
            Swal.fire({
                icon: "error",
                title: "Error while generating OTP",
                text: e.message
            })
        })
    }

    return (
        <>
            <CuteButton status="success" h="50px" onClick={onOpen}>
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

                                <CuteButton id="createLocal" status="success" h="50px" onClick={createLocal}>
                                    Generate OTP
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
                                    id={`swiftWire`}
                                    key={`swiftWire`}
                                    title="Swift/BIC" mb={2}
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
                                    title="IBAN" mb={2}
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
                                <CuteButton id="createWire" status="success" h="50px" onClick={createWire}>
                                    Generate OTP
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