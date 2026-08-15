import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { FormType, Data, SHIPMENT_STATUS, SHIPMENT_STATUS_NAME } from '../types';
import Card from '../../../widgets/Card';
import Bar from './Bar';
import InputBox from '../../../widgets/InputBox';
import CuteButton from '../../../widgets/CuteButton';
import useInputChecker from '../../useInputChecker';
import Loading from '../../../widgets/Loading';
import Swal from 'sweetalert2';
import { amountFormatDefault, getRandomPctValue, isValidEmail, isValidPhone, nullOrEmpty } from '@/root/src/utils/f';
import { dateToTimestamp, timestampToDate } from '@/root/src/utils/time';
import CopyView from '../../../widgets/CopyView';
import { getStatusColor } from '../../../shipview/utils';
import { FaEraser, FaExternalLinkAlt, FaFileDownload, FaInfoCircle, FaLink, FaSearch, FaShippingFast } from 'react-icons/fa';
import getSvg, { downloadSvgAsImage } from '@/root/src/utils/getSvg';
import { useSoftBaker } from 'use-softbaker';
import { TEMP_TOOL_FORM_ID } from '@/root/src/app-config';
import FormContainer from '../../FormContainer';
import Quote from '../../../widgets/Quote';
import { getDefaultData } from '../func';
import { publishTexts } from '../constants';
import HowToPay from '../../HowToPay';
import AppButton from '../../../widgets/AppButton';
const allCurrency = require('country-currency-list')()



const LIMITS = {
    senderName: {
        min: 2, max: 100
    },
    errorMsg: {
        min: 1, max: 500
    },
    senderEmail: {
        min: 1, max: 100
    },

    recipientName: {
        min: 1, max: 100
    },
    recipientAddress: {
        min: 1, max: 100
    },
    recipientEmail: {
        min: 1, max: 100
    },
    recipientPhone: {
        min: 1, max: 100
    },
    packageContent: {
        min: 1, max: 100
    },
    packageWeight: {
        min: 1, max: 100
    },

    invoiceNumber: {
        min: 1, max: 100
    },
    fee: {
        min: 1, max: 16
    },
    costCurrency: {
        min: 1, max: 100
    },
}
const Form: React.FC<FormType> = ({tool,
  data, isNew, onUpdateData, onPublishData,
  saving, setSaving, hasPendingSave
}) => {
  if (!data) return null;
  const toast = useToast()
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ hasDownloaded, setHasDownloaded ] = useState<boolean>(false)
  
  /** SENDER INFO */
  //Sender name check
  const { errorMsgError, errorMsgChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the error message to show on the tracking page."
    if(value.length < LIMITS.errorMsg.min) return `The error message is too short. It must be up to ${LIMITS.errorMsg.min} characters.`
    if(value.length > LIMITS.errorMsg.max) return `The error message is too long. It must not be greater than ${LIMITS.errorMsg.max} characters.`

    return null
  }, "errorMsgError", "errorMsgChecker")

  const { senderNameError, senderNameChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the sender's name."
    if(value.length < LIMITS.senderName.min) return `The sender name is too short. It must be up to ${LIMITS.senderName.min} characters.`
    if(value.length > LIMITS.senderName.max) return `The sender name is too long. It must not be greater than ${LIMITS.senderName.max} characters.`

    return null
  }, "senderNameError", "senderNameChecker")

  //Sender email check
  const { senderEmailError, senderEmailChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the sender's email."
    if(value.length < LIMITS.senderEmail.min) return `The sender email is too short. It must be up to ${LIMITS.senderEmail.min} characters.`
    if(value.length > LIMITS.senderEmail.max) return `The sender email is too long. It must not be greater than ${LIMITS.senderEmail.max} characters.`
    if(!isValidEmail(value)) return "Invalid email address."

    return null
  }, "senderEmailError", "senderEmailChecker")

  /** SHIPPING INFO */
  //Recipient name check
  const { recipientNameError, recipientNameChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the recipient's name."
    if(value.length < LIMITS.recipientName.min) return `The recipient name is too short. It must be up to ${LIMITS.recipientName.min} characters.`
    if(value.length > LIMITS.recipientName.max) return `The recipient name is too long. It must not be greater than ${LIMITS.recipientName.max} characters.`

    return null
  }, "recipientNameError", "recipientNameChecker")

  //Recipient email check
  const { recipientAddressError, recipientAddressChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the recipient's address."
    if(value.length < LIMITS.recipientAddress.min) return `The recipient address is too short. It must be up to ${LIMITS.recipientAddress.min} characters.`
    if(value.length > LIMITS.recipientAddress.max) return `The recipient address is too long. It must not be greater than ${LIMITS.recipientAddress.max} characters.`

    return null
  }, "recipientAddressError", "recipientAddressChecker")

  //Recipient email check
  const { recipientEmailError, recipientEmailChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the recipient's email."
    if(value.length < LIMITS.recipientEmail.min) return `The recipient email is too short. It must be up to ${LIMITS.recipientEmail.min} characters.`
    if(value.length > LIMITS.recipientEmail.max) return `The recipient email is too long. It must not be greater than ${LIMITS.recipientEmail.max} characters.`
    if(!isValidEmail(value)) return "Invalid email address."

    return null
  }, "recipientEmailError", "recipientEmailChecker")

  //Recipient phone check
  const { recipientPhoneError, recipientPhoneChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the recipient's phone number."
    if(value.length < LIMITS.recipientPhone.min) return `The recipient phone number is too short. It must be up to ${LIMITS.recipientPhone.min} characters.`
    if(value.length > LIMITS.recipientPhone.max) return `The recipient phone number is too long. It must not be greater than ${LIMITS.recipientPhone.max} characters.`
    if(!isValidPhone(value)) return "Invalid phone number."

    return null
  }, "recipientPhoneError", "recipientPhoneChecker")

  //Package content check
  const { packageContentError, packageContentChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the package content."
    if(value.length < LIMITS.packageContent.min) return `The package content is too short. It must be up to ${LIMITS.packageContent.min} characters.`
    if(value.length > LIMITS.packageContent.max) return `The package content is too long. It must not be greater than ${LIMITS.packageContent.max} characters.`

    return null
  }, "packageContentError", "packageContentChecker")

  //Package weight check
  const { packageWeightError, packageWeightChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the package weight."
    if(value.length < LIMITS.packageWeight.min) return `The package weight is too short. It must be up to ${LIMITS.packageWeight.min} characters.`
    if(value.length > LIMITS.packageWeight.max) return `The package weight is too long. It must not be greater than ${LIMITS.packageWeight.max} characters.`

    return null
  }, "packageWeightError", "packageWeightChecker")

  //Invoice number check
  const { invoiceError, invoiceChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Enter the invoice number."
    if(value.length < LIMITS.invoiceNumber.min) return `The invoice number is too short. It must be up to ${LIMITS.invoiceNumber.min} characters.`
    if(value.length > LIMITS.invoiceNumber.max) return `The invoice number is too long. It must not be greater than ${LIMITS.invoiceNumber.max} characters.`

    return null
  }, "invoiceError", "invoiceChecker")

  //Fee checker check
  const { feeError, feeChecker } = useInputChecker((value: any) => {
    //console.log("FeeChecker:1 ", value)
    if(!value || value.length == 0) return "Enter the shipping fee."
    if(value.length < LIMITS.fee.min) return `The shipping fee is too short. It must be up to ${LIMITS.fee.min} characters.`
    if(value.length > LIMITS.fee.max) return `The shipping fee is too long. It must not be greater than ${LIMITS.fee.max} characters.`

    return null
  }, "feeError", "feeChecker")

  const { costCurrencyError, costCurrencyChecker } = useInputChecker((value: any) => {
    if(nullOrEmpty(value)) return null
    if(value.length < LIMITS.costCurrency.min) return `The shipping fee's currency is too short. It must be up to ${LIMITS.costCurrency.min} characters.`
    if(value.length > LIMITS.costCurrency.max) return `The shipping fee's currency is too long. It must not be greater than ${LIMITS.costCurrency.max} characters.`

    return null
  }, "costCurrencyError", "costCurrencyChecker")

    const download = (data: Data) => {
        if(isLoading) return
        setIsLoading(true)
        const shippingFeeTotal = Number((data.shipmentFee || "0").replace(/[^\d.]+/g, '').trim())
        const tax = getRandomPctValue(10, 15, shippingFeeTotal)
        const shippingFee = shippingFeeTotal - tax
        //console.log("Download.x => (", data.shipmentFee, ") shippingFeeTotal: ", shippingFeeTotal, "tax: ", tax, "shippingFee: ", shippingFee)
        //console.log("download", shippingFeeTotal, tax, shippingFee, data.shipmentDate, timestampToDate(data.shipmentDate))
        const feeCurrency = data.costCurrency? data.costCurrency.split("_")[2] : "$"
        const svg = getSvg({
            trackingId: data.id || "",
            invoiceNumber: data.invoiceNumber || "",
            senderName: data.senderName || "",
            senderEmail: (data.senderEmail || "").toLowerCase(),
            recipientName: data.packageRecipientName || "",
            recipientEmail: (data.packageDestinationEmail || "").toLowerCase(),
            recipientAddress: data.packageDestinationAddress || "",
            shipmentDate: (timestampToDate(data.shipmentDate) || new Date()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit', // 'numeric' would return the month without leading zeros
                day: '2-digit',
            }),
            packageContent: data.packageContent || "",
            packageWeight: data.packageWeight || "",
            shippingFee: `${feeCurrency}${amountFormatDefault(shippingFee)}`,
            tax: `${feeCurrency}${amountFormatDefault(tax)}`,
            shippingFeeTotal: `${feeCurrency}${amountFormatDefault(shippingFeeTotal)}`,
            hasNoWatermark: !data.is_freemium as boolean,
        })
        toast({
            description: "Your shipment invoice will download shortly.",
            status: "info",
            duration: 4000,
            isClosable: true
        })
        downloadSvgAsImage(svg, "jpeg", `${(data.packageContent || "").replaceAll(" ", "").toLowerCase()}-${(new Date()).toISOString()}-shipping-invoice`)
        .then(base64ImageUrl => {
            setIsLoading(false)
            setHasDownloaded(true)
            setTimeout(() => {
                setHasDownloaded(false)
            }, 8000);
            //console.log("downloadSvgAsImage: ", base64ImageUrl)
        })
        .catch(e => {
            setIsLoading(false)
            Swal.fire({
                icon: 'error',
                title: "Download Error",
                text: e.message
            })
        })
    }
    
    const [ isWatermarkRemoval, setIsWatermarkRemoval ] = useState<boolean>(false)
    const dataOnlySubmit = (data: Data) => {
        if(!onPublishData) return
        setSaving(true)

        var onlyData = data? JSON.parse(JSON.stringify(data)) : { }
        if(onlyData.id) delete onlyData.id
        if(!data.is_freemium && Object.keys(onlyData).length == 1) setIsWatermarkRemoval(true)
        const isWaRemoval = !data.is_freemium && Object.keys(onlyData).length == 1

        onPublishData(false, data)
        .then((data: Data) => {
            setSaving(false)

            Swal.fire({
                icon: "success",
                title: "Success",
                text: isWaRemoval? 
                "Watermark successfully removed." 
                : 
                "Shipping successfully updated."
            })
            setIsWatermarkRemoval(false)
        })
        .catch((error: any) => {
            setSaving(false)
            setIsWatermarkRemoval(false)

            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? "Shipping Creation Error" : "Shipping Update Error",
                    text: error.message
                })
            }
        })
    }

  const handleSubmit = async () => {
    if(!onPublishData || saving) return
    setSaving(true)
    
    const errorPromises = [
        senderNameChecker().checker(data.senderName),
        senderEmailChecker().checker(data.senderEmail),
        recipientNameChecker().checker(data.packageRecipientName),
        recipientAddressChecker().checker(data.packageDestinationAddress),
        recipientEmailChecker().checker(data.packageDestinationEmail),
        recipientPhoneChecker().checker(data.packageDestinationPhone),
        packageContentChecker().checker(data.packageContent),
        packageWeightChecker().checker(data.packageWeight),
        invoiceChecker().checker(data.invoiceNumber),
        costCurrencyChecker().checker(data.costCurrency),
        feeChecker().checker(data.shipmentFee)
    ]

    if((await Promise.all(errorPromises)).includes(false)) {
        setSaving(false)
        Swal.fire({
            text: "You have some errors in your form. Please check the error message(s) at the input(s) and try again."
        })

    } else {
        setSaving(false)
        onPublishData()
        .then((data: Data) => {
            setSaving(false)
            toast({
                description: isNew? "New Shipping successfully saved." : "Shipping successfully updated.",
                status: "success",
                duration: 4000,
                isClosable: true
            })

            if(isNew) download(data)
        })
        .catch((error: any) => {
            setSaving(false)
            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? "Shipping Creation Error" : "Shipping Update Error",
                    text: error.message
                })
            }
        })
    }
  }

  if(data.id == TEMP_TOOL_FORM_ID) {
    return (
        <FormContainer tool={tool} maxHeaderWidth="700px" hideContents>
            <Card w="100%" h="auto" mb="0.5rem" mx="auto">
                <Text mb={4}>
                    This tool has been upgraded and migrated. Click the button below to go to the upgraded version.
                </Text>
                <AppButton w="auto" as="a" href="/tool-viewer/?id=0QZLQQKVTRV3Q6SFAIEA" bg={getStatusColor("warning")}>
                    Use Upgraded Version
                </AppButton>
            </Card>
        </FormContainer>
    )
  }
  
  
  return (
    <FormContainer tool={tool} maxHeaderWidth="700px">
        <Card w="100%" maxWidth="700px" h="auto" mx="auto">
            {
                data.id != TEMP_TOOL_FORM_ID?
                <VStack>
                    <HStack flexWrap="wrap" justifyContent="space-between" width="100%">
                        <HStack flexWrap="wrap">
                            <Text m="0px !important" mr={1}>
                                Tracking ID:{" "}
                            </Text>
                            <CopyView fontWeight="bold" m="0px !important" mr={2} onCopyMessage="Tracking ID copied.">{data.id}</CopyView>
                        </HStack>
                        <CuteButton as="a" href="https://mycargolane.com" target="_blank" bg={getStatusColor("warning")} rightIcon={<FaExternalLinkAlt />}>
                            Visit MyCargoLane.com
                        </CuteButton>
                    </HStack>
                    <Text as="div" fontSize="13px">
                        Tell the person you're pranking to use the tracking ID above to track this shipment on the <Text as="a" color={getStatusColor("warning")} href="https://mycargolane.com" target="_blank" fontWeight="bold" textDecoration="underline">mycargolane.com</Text> website.
                    </Text>
                </VStack>
                :
                <VStack alignItems="flex-start">
                    <HStack flexWrap="wrap" justifyContent="flex-start" alignItems="center">
                        <FaShippingFast />{" "}
                        <Text m="0px !important" mr={1}>
                            { publishTexts.newData }
                        </Text>
                    </HStack>
                    <Text as="div" fontSize="13px">
                        Click the info icon(<FaInfoCircle style={{display: "inline"}} />) beside each form fields for help on what to enter.
                    </Text>
                </VStack>
            }
            {/**--Tracking Info */}
            <Bar>Enter Tracking Info</Bar>
            <InputBox w="100%" mb={4}
                id={`ShippingForm_${data.id}_status`}
                key={`ShippingForm_${data.id}_status`}
                title="Shipping Status"
                helperText={data.id != TEMP_TOOL_FORM_ID? `Only the shipping status can be edited.` : ""}
                info={`
                    This is the status you want to show on the checking page. 
                    "Processing" means the package is currently being checked.
                    "In transit" means the package is currently being shipped to the recipient's address.
                    "Delivered" means the package has been delivered.
                    "Error Message" means the package delivery has encountered an error. You will be able to provide an error message to show for this status type.
                `}
                type={InputBox.TYPES.select}
                value={data.shippingStatus} 
                options={Object.keys(SHIPMENT_STATUS)} 
                onOptionValue={(key: string) => key}
                onOptionName={(key: 'processing' | 'inTransit' | 'delivered' | 'errorMessage') => {
                    return SHIPMENT_STATUS_NAME[key] 
                }}
                onChange={(value: 'processing' | 'inTransit' | 'delivered' | 'errorMessage') => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            shippingStatus: value
                        } as Data)
                    }
                }}
            />
            
            <InputBox w="100%" display={data.shippingStatus === "errorMessage"? "block" : "none"}
                id={`ShippingForm_${data.id}_emsg`}
                key={`ShippingForm_${data.id}_emsg`}
                title="Error Message" mb={4}
                placeholder="Enter the error message you want to show here."
                info="This is where you enter the error message you want people to see when they track this shipment invoice."
                helperText={"Enter the error message you want people to see when they track this shipment invoice."}
                type={InputBox.TYPES.textarea}
                value={data.errorMessage} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            errorMessage: value
                        } as Data)
                    }
                }}
                errorMessage={errorMsgError}
                onCheckInfo={errorMsgChecker}
            />

            {/**Data date and arrival date */}
            <HStack w="100%" flexWrap="wrap" mb={{base: 0, lg: 4}} p="0px !important">
                <Box w={{base: "100%", lg: "100%",}} mb={{base: 4, lg: 0}} 
                pr="5px !important" mx="0px !important" width="100%">
                    <InputBox disabled={!isNew} w="100%"
                        id={`ShippingForm_${data.id}_sdate`}
                        key={`ShippingForm_${data.id}_sdate`}
                        title="Shipment Date"
                        info={`This is the date that the package was dropped for shipping.`}
                        type={InputBox.TYPES.date}
                        value={timestampToDate(data.shipmentDate)} 
                        onChange={(value) => {
                            //console.log("shipmentDate:value ", value)
                            if(onUpdateData) {
                                onUpdateData({
                                    id: data.id,
                                    shipmentDate: dateToTimestamp(value)
                                } as Data)
                            }
                        }}
                    />
                </Box>
                <Box w={{base: "100%", lg: "100%"}} mb={{base: 4, lg: 0}} 
                pr="5px !important" mx="0px !important" width="100%">
                    <InputBox w="100%" mb={{base: 4, lg: 0}}  p="0px !important"
                        id={`ShippingForm_${data.id}_adate`}
                        key={`ShippingForm_${data.id}_adate`}
                        title="Expected Arrival Date"
                        info={`This is the date the package is expected to arrive at the recipient's address.`}
                        type={InputBox.TYPES.date}
                        value={timestampToDate(data.expectedArrivalDate)} 
                        onChange={(value) => {
                            if(onUpdateData) {
                                onUpdateData({
                                    id: data.id,
                                    expectedArrivalDate: dateToTimestamp(value)
                                } as Data)
                            }
                        }}
                    />
                </Box>
            </HStack>

            {/**--Sender info */}
            <Bar>Enter Sender Info</Bar>
            {/**Sender name */}
            <InputBox disabled={!isNew} w="100%"
                id={`ShippingForm_${data.id}_sname`}
                key={`ShippingForm_${data.id}_sname`}
                title="Sender Name" mb={4}
                placeholder="Enter sender's name"
                info="The full name of the individual sending the package; that is you."
                type={InputBox.TYPES.text}
                value={data.senderName} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            senderName: value
                        } as Data)
                    }
                }}
                errorMessage={senderNameError}
                onCheckInfo={senderNameChecker}
            />
            {/**Sender email */}
            <InputBox disabled={!isNew} w="100%"
                id={`ShippingForm_${data.id}_smail`}
                key={`ShippingForm_${data.id}_smail`}
                title="Sender Email Address"
                placeholder="Enter sender's email address"
                info="The email address of the individual sending the package; that is yours."
                type={InputBox.TYPES.email}
                value={data.senderEmail} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            senderEmail: value
                        } as Data)
                    }
                }}
                errorMessage={senderEmailError}
                onCheckInfo={senderEmailChecker}
            />

            {/**--Shipping info */}
            <Bar>Enter Shipping Info</Bar>
            {/**Recipient name */}
            <InputBox disabled={!isNew} w="100%"
                id={`ShippingForm_${data.id}_rname`}
                key={`ShippingForm_${data.id}_rname`}
                title="Recipient Name" mb={4}
                placeholder="Enter recipient's name"
                info="The full name of the individual the package is being sent to."
                type={InputBox.TYPES.text}
                value={data.packageRecipientName} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            packageRecipientName: value
                        } as Data)
                    }
                }}
                errorMessage={recipientNameError}
                onCheckInfo={recipientNameChecker}
            />
            {/**Recipient Address */}
            <InputBox disabled={!isNew} w="100%" mb={4}
                id={`ShippingForm_${data.id}_raddr`}
                key={`ShippingForm_${data.id}_raddr`}
                title="Recipient Address"
                placeholder="Enter recipient's address"
                info="The home address of the individual the package is being sent to."
                type={InputBox.TYPES.text}
                value={data.packageDestinationAddress} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            packageDestinationAddress: value
                        } as Data)
                    }
                }}
                errorMessage={recipientAddressError}
                onCheckInfo={recipientAddressChecker}
            />
            {/**Recipient email */}
            <InputBox disabled={!isNew} w="100%" mb={4}
                id={`ShippingForm_${data.id}_rmail`}
                key={`ShippingForm_${data.id}_rmail`}
                title="Recipient Email Address"
                placeholder="Enter recipient's email address"
                info="The email address of the individual the package is being sent to."
                type={InputBox.TYPES.email}
                value={data.packageDestinationEmail} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            packageDestinationEmail: value
                        } as Data)
                    }
                }}
                errorMessage={recipientEmailError}
                onCheckInfo={recipientEmailChecker}
            />
            {/**Recipient number */}
            <InputBox disabled={!isNew} w="100%" mb={4}
                id={`ShippingForm_${data.id}_rnum`}
                key={`ShippingForm_${data.id}_rnum`}
                title="Recipient Phone"
                placeholder="Enter recipient's phone number"
                info="The phone number of the individual the package is being sent to."
                type={InputBox.TYPES.text}
                value={data.packageDestinationPhone} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            packageDestinationPhone: value
                        } as Data)
                    }
                }}
                errorMessage={recipientPhoneError}
                onCheckInfo={recipientPhoneChecker}
            />
            {/**Package content */}
            <InputBox disabled={!isNew} w="100%" mb={4}
                id={`ShippingForm_${data.id}_content`}
                key={`ShippingForm_${data.id}_content`}
                title="Package Content"
                placeholder="Enter content"
                info="The content in the package you're shipping."
                type={InputBox.TYPES.text}
                value={data.packageContent} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            packageContent: value
                        } as Data)
                    }
                }}
                errorMessage={packageContentError}
                onCheckInfo={packageContentChecker}
            />
            {/**Package weight */}
            <InputBox disabled={!isNew} w="100%"
                id={`ShippingForm_${data.id}_weight`}
                key={`ShippingForm_${data.id}_weight`}
                title="Package weight"
                placeholder="Enter weight"
                info="The weight of the package you're shipping."
                type={InputBox.TYPES.text}
                value={data.packageWeight} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            packageWeight: value
                        } as Data)
                    }
                }}
                errorMessage={packageWeightError}
                onCheckInfo={packageContentChecker}
            />

            {/**--Invoice info */}
            <Bar>Enter Invoice Info</Bar>
            {/**Invoice Number */}
            <InputBox disabled={!isNew} w="100%"
                id={`ShippingForm_${data.id}_inv`}
                key={`ShippingForm_${data.id}_inv`}
                title="Invoice Number" mb={4}
                placeholder="Enter Invoice number"
                info="This is the shipment invoice number you want to give to the package."
                type={InputBox.TYPES.text}
                value={data.invoiceNumber} 
                onChange={(value) => {
                    if(onUpdateData) {
                        onUpdateData({
                            id: data.id,
                            invoiceNumber: value
                        } as Data)
                    }
                }}
                errorMessage={invoiceError}
                onCheckInfo={invoiceChecker}
            />
            {/**Shipment Fee */}
            <HStack w="100%" mb={{base: 0, md: 4}} p="0px !important" gap="0px !important" flexWrap="wrap" 
            justifyContent="flex-start" alignItems="flex-start">
                <Box w={{base: "100%", md: "35%"}} mb={{base: 0}} 
                pr="5px !important" mx="0px !important">
                    <InputBox disabled={!isNew} w="100%"
                        id={`ShippingForm_${data.id}_currency`}
                        key={`ShippingForm_${data.id}_currency`}
                        title="Fee Currency"
                        info="This is the currency of the amount you want to show as the cost of the shipping."
                        type={InputBox.TYPES.select}
                        value={data.costCurrency? data.costCurrency : getDefaultData().costCurrency} 
                        options={allCurrency || []}
                        onOptionName={({countryName, symbol}) => `${countryName} (${symbol})`}
                        onOptionValue={({iso_code, currency, symbol}) => `${iso_code}_${currency}_${symbol}`}
                        placeholder=""
                        onCheckInfo={costCurrencyChecker}
                        onChange={(value) => {
                            if(onUpdateData) {
                                onUpdateData({
                                    id: data.id,
                                    costCurrency: value
                                } as Data)
                            }
                        }}
                        errorMessage={costCurrencyError}
                    />
                </Box>
                <Box w={{base: "100%", md: "65%"}} mb={{base: 4, md: 0}} 
                pr="5px !important" mx="0px !important">
                    <InputBox disabled={!isNew} w="100%" 
                        id={`ShippingForm_${data.id}_fee`}
                        key={`ShippingForm_${data.id}_fee`}
                        title="Shipment Fee"
                        placeholder="Enter shipping fee"
                        info="This is the amount you want to show as the cost of the shipping. E.g 2500"
                        type={InputBox.TYPES.text}
                        numberDecimals={0}
                        value={data.shipmentFee} 
                        onChange={(value) => {
                            if(onUpdateData) {
                                onUpdateData({
                                    id: data.id,
                                    shipmentFee: value
                                } as Data)
                            }
                        }}
                        errorMessage={feeError}
                        onCheckInfo={feeChecker}
                    />
                </Box>
            </HStack>

            <HowToPay my={2} />

            <VStack w="100%" justifyContent="flex-start" alignItems="center" my={8}>
                <CuteButton status={saving && !isWatermarkRemoval? "loading" : "warning"} 
                fontStyle={saving && !isWatermarkRemoval? "italic" : "normal"} 
                disabled={saving || !hasPendingSave}
                w="100%" maxW="400px" h="70px" fontSize="lg" onClick={handleSubmit} 
                rightIcon={saving && !isWatermarkRemoval? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                    {saving && !isWatermarkRemoval? "Please wait..." : isNew? `Create Invoice` : "Update Invoice"}
                </CuteButton>

                <CuteButton status={saving? "loading" : "warning"} outlined
                fontStyle={saving? "italic" : "normal"} disabled={saving}
                w="100%" maxW="400px" h="70px" fontSize="lg" onClick={() => {
                    if(isNew) {
                        Swal.fire({
                            icon: "error",
                            title: "Download error",
                            text: "You're yet to create the shipment invoice. Create invoice first, then download."
                        })
                    } else {
                        download(data)
                    }
                }} 
                rightIcon={<FaFileDownload />}>
                    {saving? "Please wait..." : "Download Invoice"}
                </CuteButton>
                
                {
                    hasDownloaded?
                    <Quote status="success">
                        Check your download folder for the downloaded shipment invoice.
                    </Quote> : null
                }

                {
                    data.is_freemium && !isNew?
                    <CuteButton status={saving && isWatermarkRemoval? "loading" : "error"} 
                    fontStyle={saving && isWatermarkRemoval? "italic" : "normal"} 
                    disabled={saving}
                    w="100%" maxW="400px" h="70px" fontSize="lg" onClick={() => {
                        dataOnlySubmit({
                            id: data.id,
                            is_freemium: false
                        } as Data)
                    }} 
                    rightIcon={
                        saving && isWatermarkRemoval? 
                        <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> 
                        : 
                        <FaEraser />
                    }>
                        {saving && isWatermarkRemoval? "Please wait..." : "Remove Watermark"}
                    </CuteButton>
                    : null
                }
            </VStack>
        </Card>
    </FormContainer>
  );
};

export default Form;