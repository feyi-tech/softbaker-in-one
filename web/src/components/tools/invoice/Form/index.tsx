import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { Data, FormType, InvoiceItem } from '../types';
import Card from '../../../widgets/Card';
import InputBox from '../../../widgets/InputBox';
import CuteButton from '../../../widgets/CuteButton';
import useInputChecker from '../../useInputChecker';
import Loading from '../../../widgets/Loading';
import Swal from 'sweetalert2';
import { 
    getFileFieldFile,
    nullOrEmpty, 
    textToFilename
} from '@/root/src/utils/f';
import CopyView from '../../../widgets/CopyView';
import { FaFileDownload, FaInfoCircle, FaEnvelopeOpenText, FaEraser, FaFileInvoiceDollar } from 'react-icons/fa';
import Doc from './Doc';
import { APPROVE_STAMP, PAPER_TEXTURE, STAMP_CIRCLE, WATERMARK } from './doc-data';
import { TEMP_TOOL_FORM_ID } from '@/root/src/app-config';
import useColorValue from '@/root/src/hooks/useColorValue';
import FormContainer from '../../FormContainer';
import { downloadSvgAsImage } from '@/root/src/utils/getSvg';
import Quote from '../../../widgets/Quote';
import UploadInput from '../../../widgets/ToolsElements/UploadInput';
import { BASE_TEMPLATE_HEIGHT, BASE_TEMPLATE_WIDTH } from './settings';
import SignatoryInput from '../../../widgets/ToolsElements/SignatoryInput';
import { Signatory } from '../../index.types';
import DownloadFormatButton from '../../../widgets/ToolsElements/DownloadFormatButton';
import DocContainer from '../../../widgets/ToolsElements/DocContainer';
import { useFileFieldUrl } from '../../../shipment/hooks/useFieldGetter';
import { dateToTimestamp, timestampToDate } from '@/root/src/utils/time';
import { Timestamp } from 'firebase/firestore';
import TableInput from '../../../widgets/ToolsElements/TableInput';
import ItemsSum from './ItemsSum';
import { arrayAsObjectToArray } from '../../toolsFunc';
import HowToPay from '../../HowToPay';
const allCurrency = require('country-currency-list')()


const LIMITS = {
    name: {
        min: 2, max: 64, required: true
    },
    companyAddress: {
        min: 2, max: 64, required: true
    },
    customerName: {
        min: 2, max: 64, required: true
    },
    customerAddress: {
        min: 2, max: 64, required: true
    },
    invoiceNumber: {
        min: 2, max: 16, required: true
    },
    currency: {
        min: 1, max: 8, required: true
    },
    vat: {
        min: 0, max: 99, required: false
    },
    items: {
        min: 1, max: 6, required: true
    },
    paymentDetails: {
        min: 0, max: 256, required: false
    },
}

const Form: React.FC<FormType> = ({tool,
  data, isNew, onUpdateData, onPublishData,
  saving, setSaving, hasPendingSave, collectionName
}) => {
    if (!data) return null;
    const toast = useToast()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ hasDownloaded, setHasDownloaded ] = useState<boolean>(false)
    const [logoUrl, resetLogoUrl ] = useFileFieldUrl(collectionName, data.id, "logo", data.logo)

    //Company name check
    const { nameError, nameChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.name.required) return `Enter the company name.`
        if(!nullOrEmpty(value) && value.length < LIMITS.name.min) return `The company name is too short. It must be up to ${LIMITS.name.min} characters.`
        if(value.length > LIMITS.name.max) return `The company name is too long. It must not be greater than ${LIMITS.name.max} characters.`

        return null
    }, "nameError", "nameChecker")

    //Company Address check
    const { companyAddressError, companyAddressChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.companyAddress.required) return "Enter the company address."
        if(value.length < LIMITS.companyAddress.min) return `The company address must be up to ${LIMITS.companyAddress.min} characters.`
        if(value.length > LIMITS.companyAddress.max) return `The company address must not be greater than ${LIMITS.companyAddress.max} characters.`

        return null
    }, "companyAddressError", "companyAddressChecker")

    //Customer name check
    const { customerNameError, customerNameChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.customerName.required) return "Enter the customer name."
        if(value.length < LIMITS.customerName.min) return `The customer name must be up to ${LIMITS.customerName.min} characters.`
        if(value.length > LIMITS.customerName.max) return `The customer name not be greater than ${LIMITS.customerName.max} characters.`

        return null
    }, "customerNameChecker", "customerNameChecker")

    //Customer address
    const { customerAddressError, customerAddressChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.customerName.required) return "Enter the customer address."
        if(value.length < LIMITS.customerAddress.min) return `The customer address must be up to ${LIMITS.customerAddress.min} characters.`
        if(value.length > LIMITS.customerAddress.max) return `The customer address must not be greater than ${LIMITS.customerAddress.max} characters.`

        return null
    }, "customerAddressError", "customerAddressChecker")

    //Invoice number check
    const { invoiceNumberError, invoiceNumberChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.customerName.required) return "Enter the invoice number."
        if(value.length < LIMITS.invoiceNumber.min) return `The invoice number must be up to ${LIMITS.invoiceNumber.min} characters.`
        if(value.length > LIMITS.invoiceNumber.max) return `The invoice number not be greater than ${LIMITS.invoiceNumber.max} characters.`

        return null
    }, "invoiceNumberChecker", "invoiceNumberChecker")

    //Cat check
    const { vatError, vatChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) || isNaN(value) && parseFloat(value) < 1) return "Enter the invoice's vat."
        if(parseFloat(value) < LIMITS.vat.min) return `The invoice's vat is too small. It must be up to ${LIMITS.vat.min} characters.`
        if(parseFloat(value) > LIMITS.vat.max) return `The invoice's vat is too much. It must not be greater than ${LIMITS.vat.max} characters.`
    
        return null
      }, "vatError", "vatChecker")

    //Items check
    const { itemsError, itemsChecker } = useInputChecker((value: any) => {
    if(!value || value.length == 0) return "Add the invoice's items."
    if(value.length < LIMITS.items.min) return `The invoice's items must be up to ${LIMITS.items.min}.`
    if(value.length > LIMITS.items.max) return `The invoice's items must not be greater than ${LIMITS.items.max}.`

    return null
    }, "itemsError", "itemsChecker")

    //Payment details check
    const { paymentDetailsError, paymentDetailsChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.paymentDetails.required) return "Enter the payment details."
        if(value.length < LIMITS.paymentDetails.min) return `The payment details must be up to ${LIMITS.paymentDetails.min} characters.`
        if(value.length > LIMITS.paymentDetails.max) return `The payment details must not be greater than ${LIMITS.paymentDetails.max} characters.`

        return null
    }, "paymentDetailsError", "paymentDetailsChecker")

    const { currencyError, currencyChecker } = useInputChecker((value: any) => {
        if(data.priceDisabled) return null
        if(nullOrEmpty(value)) return "Please enter the invoice's cost currency."
        if(value.length < LIMITS.currency.min) return `The invoice's cost currency is too short. It must be up to ${LIMITS.currency.min} characters.`
        if(value.length > LIMITS.currency.max) return `The invoice's cost currency is too long. It must not be greater than ${LIMITS.currency.max} characters.`
    
        return null
      }, "currencyError", "currencyChecker")

    //Logo check
    const { logoError, logoChecker } = useInputChecker((value: any, optionalData?: {[x: string]: any}) => {
        //if(nullOrEmpty(value)) return `Provide Company logo.`
        if(value && value != "logo") return "Invalid Company logo"
        if(value && !getFileFieldFile(collectionName, (optionalData || data).id, value)) return "Your Company logo was not found on this browser. Please provide the logo again."

        return null
    }, "logoError", "logoChecker")

    //Date check
    const { dateError, dateChecker } = useInputChecker((value: Timestamp) => {
        if(!value) return "Please select the invoice issue date."

        //if(timestampToDate(value).getTime() < Date.now()) return "Deparure date cannot be in the past."
        //console.log("dateChecker: ", timestampToDate(value))

        return null
    }, "dateError", "dateChecker")
    
    const [ showDownloadFormatOptions, setShowDownloadFormatOptions ] = useState<boolean>()


    const download = async (data: Data, format: string) => {
        if(isLoading) return

        //Check if the files still exists
        const errorPromises = [
            logoChecker().checker(data.logo, data)
        ]

        const errorsCheck = (await Promise.all(errorPromises))
        //console.log("download:errorsCheck => ", errorsCheck)
        if(errorsCheck.includes(false)) {
            resetLogoUrl()
            Swal.fire({
                title: "Download Error",
                text: "The company logo is missing on this browser. Please re-upload and try again.",
                icon: "error"
            })
            return
        }

        setIsLoading(true)
        
        Doc.downloadSvg({
            width: BASE_TEMPLATE_WIDTH, height: BASE_TEMPLATE_HEIGHT, 
            companyName: data.companyName,
            companyAddress: data.companyAddress, 
            customerName: data.customerName,
            customerAddress: data.customerAddress,
            date: data.date,
            invoiceNumber: data.invoiceNumber,
            currency: data.currency,
            items: arrayAsObjectToArray(data.items) as InvoiceItem[],
            vat: data.vat,
            paymentDetails: data.paymentDetails,
            logoUrl: getFileFieldFile(collectionName, data.id, "logo"),
            watermarkWithLogo: data.waterMarkWithLogo,
            grayScaleWaterMark: data.grayScaleWaterMark,
            waterMarkUrl: !data.is_freemium? null : WATERMARK.downloadImage
        })
        .then(svg => {
            //console.log("SVG: ", svg)
            toast({
                description: "Your invoice will download shortly.",
                status: "info",
                duration: 4000,
                isClosable: true
            })
            downloadSvgAsImage(svg, format, `${textToFilename(`${data.companyName}_${data.customerName}`)}-${(new Date()).toISOString()}-invoice-${data.invoiceNumber}`)
            .then(base64ImageUrl => {
                setIsLoading(false)
                setHasDownloaded(true)
                resetLogoUrl()
                setTimeout(() => {
                    setHasDownloaded(false)
                }, 8000);                
                //console.log("downloadSvgAsImage: ", base64ImageUrl)
            })
            .catch(e => {
                setIsLoading(false)
                resetLogoUrl()
                Swal.fire({
                    icon: 'error',
                    title: "Download Error",
                    text: e.message
                })
            })
        })
        .catch(e => {
            setIsLoading(false)
            resetLogoUrl()
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
                "Invoice successfully updated."
            })
            setIsWatermarkRemoval(false)
        })
        .catch((error: any) => {
            setSaving(false)
            setIsWatermarkRemoval(false)

            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? "Invoice Creation Error" : "Invoice Update Error",
                    text: error.message
                })
            }
        })
    }

    const handleSubmit = async () => {
        if(!onPublishData) return
        setSaving(true)
        
        const errorPromises = [
            logoChecker().checker(data.logo),
            nameChecker().checker(data.companyName),
            companyAddressChecker().checker(data.companyAddress),
            customerNameChecker().checker(data.customerName),
            customerAddressChecker().checker(data.customerAddress),
            invoiceNumberChecker().checker(data.invoiceNumber),
            dateChecker().checker(data.date),
            paymentDetailsChecker().checker(data.paymentDetails),
            vatChecker().checker(data.vat),
            itemsChecker().checker(data.items)
        ]

        if((await Promise.all(errorPromises)).includes(false)) {
            setSaving(false)
            resetLogoUrl()
            Swal.fire({
                title: "Form Error",
                icon: "error",
                text: "You have some errors in your form. Please check the error message(s) at the input(s) and try again."
            })

        } else {
            setSaving(false)
            onPublishData()
            .then((data: Data) => {
                setSaving(false)
                resetLogoUrl()
                toast({
                    description: isNew? "New Invoice successfully saved." : "Invoice successfully updated.",
                    status: "success",
                    duration: 4000,
                    isClosable: true
                })

                setShowDownloadFormatOptions(true)
                //download(data)
            })
            .catch((error: any) => {
                setSaving(false)
                resetLogoUrl()
                if((error?.message || "").length > 0) {
                    Swal.fire({
                        icon: "error",
                        title: isNew? "Invoice Creation Error" : "Invoice Update Error",
                        text: error.message
                    })
                }
            })
        }
    }

    return (
        <FormContainer tool={tool} maxHeaderWidth="100%">
            <Card w="100%" maxW="100%" h="auto">
                {
                    data.id != TEMP_TOOL_FORM_ID?
                    <HStack flexWrap="wrap" justifyContent="space-between">
                        <HStack flexWrap="wrap">
                            <Text as="div" m="0px !important" mr={1} display="none">
                                Tracking No:{" "}
                            </Text>
                            <CopyView display="none" fontWeight="bold" m="0px !important" mr={2}>{data.id}</CopyView>
                        </HStack>
                    </HStack>
                    :
                    <VStack alignItems="flex-start">
                        <HStack flexWrap="wrap" justifyContent="flex-start" alignItems="center">
                            <FaFileInvoiceDollar />{" "}
                            <Text as="div" m="0px !important" mr={1}>
                                New Invoice
                            </Text>
                        </HStack>
                        <Text as="div" fontSize="13px">
                            Click the info icon(<FaInfoCircle style={{display: "inline"}} />) beside each form fields for help on what to enter.
                        </Text>
                    </VStack>
                }
                {/**--Tracking Info */}
                <Flex w="100%" flexWrap="wrap" m="15px auto">
                    <Box w={{base: "100%"}} bg="#dd6b20" p="1rem">
                        <Box bg={useColorValue("cardBg.light", "cardBg.dark")} minH="80vh" w="100%" p={{base: "0.4rem", md: "0.5rem", lg: "1rem"}} borderRadius="24px">
                            <Tabs isFitted variant='enclosed'>
                                <TabList mb='1em'>
                                    <Tab>Edit Mode</Tab>
                                    <Tab>View Mode</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel p={{base: "0.2rem", md: "0.5rem", lg: "1rem"}}>
                                        <UploadInput 
                                            disabled={!isNew && logoUrl != null} w="100%"
                                            id={`Form_${data.id}logo`}
                                            key={`Form_${data.id}logo`}
                                            title={`Company logo`} mb={4}
                                            info="The logo of the company issuing the invoice."
                                            helperText="Select the logo of the company issuing the invoice."
                                            thumbnail={logoUrl}
                                            message="Drag and Drop logo here"
                                            hoverMessage="Drop the logo here"
                                            ruleMessage="Upload 512 by 512 transparent PNG image for the best result."
                                            useImageText="Use Logo"
                                            maxFileSize={1024 * 1024}
                                            onChange={(file, value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        logo: value
                                                    } as Data)
                                                    resetLogoUrl()
                                                }
                                            }}
                                            onCheckInfo={logoChecker} 
                                            errorMessage={logoError}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}_cmp_name`}
                                            key={`Form_${data.id}_cmp_name`}
                                            title="Company name" mb={4}
                                            placeholder="Parkroad International Motors"
                                            info="The name of the company issuing the invoice."
                                            helperText="Enter the name of the company issuing the invoice."
                                            type={InputBox.TYPES.text}
                                            value={data.companyName} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        companyName: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={nameChecker} 
                                            errorMessage={nameError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" minH="110px"
                                            id={`Form_${data.id}_cmp_address`}
                                            key={`Form_${data.id}_cmp_address`}
                                            title="Company address" mb={4}
                                            placeholder=""
                                            info="The address of the company."
                                            helperText="This is the address of the company."
                                            type={InputBox.TYPES.text}
                                            value={data.companyAddress} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        companyAddress: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={companyAddressChecker}
                                            errorMessage={companyAddressError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" minH="110px"
                                            id={`Form_${data.id}_customer_name`}
                                            key={`Form_${data.id}_customer_name`}
                                            title="Customer name" mb={4}
                                            placeholder=""
                                            helperText="Enter the name of the customer."
                                            info="This is the name of the customer the invoice will be issued to."
                                            type={InputBox.TYPES.text}
                                            value={data.customerName} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        customerName: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={customerNameChecker}
                                            errorMessage={customerNameError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" minH="110px"
                                            id={`Form_${data.id}_customer_addr`}
                                            key={`Form_${data.id}_customer_addr`}
                                            title="Customer address or email" mb={4}
                                            placeholder=""
                                            helperText="Enter the address of the customer or the email."
                                            info="This is where you enter the home address of the customer or the email address."
                                            type={InputBox.TYPES.text}
                                            value={data.customerAddress} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        customerAddress: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={customerAddressChecker}
                                            errorMessage={customerAddressError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" minH="110px"
                                            id={`Form_${data.id}_inv_num`}
                                            key={`Form_${data.id}_inv_num`}
                                            title="Invoice Number" mb={4}
                                            placeholder=""
                                            helperText="Enter the invoice number."
                                            info="This is where you enter the invoice number."
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
                                            onCheckInfo={invoiceNumberChecker}
                                            errorMessage={invoiceNumberError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" mb={4}
                                            id={`ShippingForm_${data.id}_date`}
                                            key={`ShippingForm_${data.id}_date`}
                                            title="Invoice Date"
                                            helperText={`Select the invoice issue date.`}
                                            info={`This is the invoice issue date.`}
                                            type={InputBox.TYPES.date}
                                            value={timestampToDate(data.date)}
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        date: dateToTimestamp(value)
                                                    } as Data)
                                                }
                                            }}
                                            errorMessage={dateError}
                                            onCheckInfo={dateChecker}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`ShippingForm_${data.id}_currency`}
                                            key={`ShippingForm_${data.id}_currency`}
                                            title="Currency" mb={4}
                                            helperText={`Select the currency for the cost of the items being purchased.`}
                                            info={`This is where you select the currency for the cost of the items being purchased.`}
                                            type={InputBox.TYPES.select}
                                            value={data.currency} 
                                            options={allCurrency || []}
                                            onOptionName={({countryName, symbol}) => `${countryName} (${symbol})`}
                                            onOptionValue={({iso_code, currency, symbol}) => `${iso_code}_${currency}_${symbol}`}
                                            placeholder=""
                                            onCheckInfo={currencyChecker}
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        currency: value
                                                    } as Data)
                                                }
                                            }}
                                            errorMessage={currencyError}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}_vat`}
                                            key={`Form_${data.id}_vat`}
                                            title="VAT(%)" mb={4}
                                            placeholder=""
                                            info="This is the VAT in percentage you want to add to the total items cost."
                                            helperText="Enter the VAT in percentage that you want to add to the total items cost."
                                            type={InputBox.TYPES.number}
                                            value={data.vat} 
                                            numberDecimals={0}
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        vat: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={vatChecker}
                                            errorMessage={vatError}
                                        />

                                        <TableInput disabled={!isNew} w="100%"
                                            id={`Form_${data.id}_items`}
                                            key={`Form_${data.id}_items`}
                                            title="Items Purchased" mb={4}
                                            placeholder=""
                                            helperText="Provide the items that are being purchased."
                                            info="This is where you provide the items that are being purchased."
                                            type={InputBox.TYPES.number}
                                            value={arrayAsObjectToArray(data.items)} 
                                            submitButtonText={`Submit Item`}
                                            addSingular={`Add Item`}
                                            addPlural={`Add another Item`}
                                            maxSize={6}
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        items: value
                                                    } as Data)
                                                }
                                            }}
                                            header={[
                                                {
                                                    key: "sn", title: "S/N", 
                                                    valueFunc: (row, index, totalItems) => index + 1, 
                                                    isReadOnly: true 
                                                },
                                                {
                                                    key: "description", title: "Description",
                                                    helperText: "Enter the description or name of the item.",
                                                    getValidationError: (value: any) => {
                                                        if(!value) return `Please enter the item description or name.`
                                                        if(value.length > 90) return `The item description cannot be greater than ${90} characters.`
                                                        return null
                                                    }
                                                },
                                                {
                                                    key: "quantity", title: "Quantity",
                                                    helperText: "Enter the total number of this item being purchased.", 
                                                    inputType: InputBox.TYPES.number,
                                                    otherInputProps: { numberDecimals: 0 },
                                                    getValidationError: (value: any) => {
                                                        if(!value) return `Please enter the item quantity.`
                                                        if(value < 1) return `The item quantity cannot be less than ${1}.`
                                                        if(value > 1000000000000000) return `The item quantity cannot be greater than ${1000000000000000}`
                                                        return null
                                                    }
                                                },
                                                {
                                                    key: "price", title: `Unit Price(${data.currency? data.currency.split("_")[2] : "$"})`,
                                                    helperText: "Enter the price of a single item.",
                                                    inputType: InputBox.TYPES.number,
                                                    otherInputProps: { numberDecimals: 0 },
                                                    getValidationError: (value: any) => {
                                                        if(!value) return `Please enter the item price.`
                                                        if(value < 1) return `The item price cannot be less than ${1}.`
                                                        if(value > 1000000000000000) return `The item price cannot be greater than ${1000000000000000}`
                                                        return null
                                                    }
                                                },
                                                {
                                                    key: "total", title: "Total", 
                                                    valueFunc: (row, index, totalItems) => `${data.currency? data.currency.split("_")[2] : "$"}${row.quantity * row.price}`, 
                                                    isReadOnly: true 
                                                }
                                            ]}
                                            onFooter={(items, col) => {
                                                if(col.key != "total") return null
                                                return (
                                                    <ItemsSum items={items as InvoiceItem[]} col={col} vat={data.vat || 0} currency={data.currency} />
                                                )
                                            }}
                                            onCheckInfo={itemsChecker}
                                            errorMessage={itemsError}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}_payment`}
                                            key={`Form_${data.id}_payment`}
                                            title="Payment Details(Optional)" mb={4}
                                            helperText="Enter the payment details information here. Hit enter key to enter new line."
                                            info="This is where you enter the payment details for the invoice; Bank, Account Name, Account Number, or any other info you want."
                                            type={InputBox.TYPES.textarea}
                                            value={data.paymentDetails} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        paymentDetails: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={paymentDetailsChecker}
                                            errorMessage={paymentDetailsError}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}waterMarkWithLogo`}
                                            key={`Form_${data.id}waterMarkWithLogo`}
                                            title="Watermark with logo" mb={4}
                                            info="Enabling this adds your logo as a watermark to the invoice background."
                                            type={InputBox.TYPES.checkbox}
                                            value={data.waterMarkWithLogo} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        waterMarkWithLogo: value
                                                    } as Data)
                                                }
                                            }}
                                        />

                                        {
                                            data.waterMarkWithLogo?
                                            <InputBox disabled={!isNew} w="100%"
                                                id={`Form_${data.id}grayScaleWaterMark`}
                                                key={`Form_${data.id}grayScaleWaterMark`}
                                                title="Grayscale watermark" mb={4}
                                                info="Enabling this makes your logo watermark looks gray instead of colorful."
                                                type={InputBox.TYPES.checkbox}
                                                value={data.grayScaleWaterMark} 
                                                onChange={(value) => {
                                                    if(onUpdateData) {
                                                        onUpdateData({
                                                            id: data.id,
                                                            grayScaleWaterMark: value
                                                        } as Data)
                                                    }
                                                }}
                                            /> : null
                                        }

                                        <HowToPay my={2} />
                                    </TabPanel>
                                    <TabPanel bg="#dcdcdc" p="0px">
                                        <DocContainer 
                                        width="100%" message="Drag around to view the whole invoice"
                                        height={{base: 500, md: 728, lg: 1024}} 
                                            pos="relative" 
                                            overflowX="hidden"
                                            overflowY="hidden">
                                                <Doc isLoading={isLoading}
                                                    width={{base: 728, lg: 1024}} 
                                                    height={{base: 1031, lg: 1448}} 
                                                    companyName={data.companyName}
                                                    companyAddress={data.companyAddress} 
                                                    customerName={data.customerName}
                                                    customerAddress={data.customerAddress}
                                                    date={data.date}
                                                    invoiceNumber={data.invoiceNumber}
                                                    currency={data.currency}
                                                    items={arrayAsObjectToArray(data.items) as InvoiceItem[]}
                                                    vat={data.vat}
                                                    paymentDetails={data.paymentDetails}
                                                    logoUrl={logoUrl}
                                                    watermarkWithLogo={data.waterMarkWithLogo}
                                                    grayScaleWaterMark={data.grayScaleWaterMark}
                                                    waterMarkUrl={!data.is_freemium? null : WATERMARK.image} 
                                                />
                                        </DocContainer>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                            <VStack w="100%" justifyContent="flex-start" alignItems="center" my={8}>
                                {
                                    !isNew? null :
                                    <CuteButton status={saving && !isWatermarkRemoval? "loading" : "warning"} 
                                    fontStyle={saving && !isWatermarkRemoval? "italic" : "normal"} 
                                    disabled={saving || !hasPendingSave}
                                    w="100%" maxW="400px" h="70px" fontSize="lg" onClick={handleSubmit} 
                                    rightIcon={saving && !isWatermarkRemoval? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                                        {saving && !isWatermarkRemoval? "Please wait..." : `Create Invoice`}
                                    </CuteButton>
                                }

                                <DownloadFormatButton 
                                showDownloadFormatOptions={showDownloadFormatOptions} 
                                setShowDownloadFormatOptions={setShowDownloadFormatOptions}
                                status={saving? "loading" : "warning"} outlined
                                fontStyle={saving? "italic" : "normal"} disabled={saving}
                                w="100%" maxW="400px" h="70px" fontSize="lg" 
                                downloadFormats={[
                                    {title: "Download as PDF", format: "pdf"},
                                    {title: "Download as JPEG", format: "jpeg"},
                                    {title: "Download as PNG", format: "png"}
                                ]}
                                onDownloadButtonClick={() => {
                                    if(isNew) {
                                        Swal.fire({
                                            icon: "error",
                                            title: "Download error",
                                            text: "You're yet to create the Invoice. Create Invoice first, then download."
                                        })
                                        return false
                                    } else {
                                        return true
                                    }
                                }} 
                                onFormatSelected={(format) => {
                                    download(data, format.format)
                                }}
                                rightIcon={<FaFileDownload />}>
                                    {saving? "Please wait..." : "Download Invoice"}
                                </DownloadFormatButton>
                                {
                                    hasDownloaded?
                                    <Quote status="success">
                                        Check your download folder for the downloaded Invoice.
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
                        </Box>
                    </Box>
                </Flex>
            </Card>
        </FormContainer>
    );
};

export default Form;