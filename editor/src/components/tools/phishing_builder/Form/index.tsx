import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { Data, FormType } from '../types';
import Card from '../../../widgets/Card';
import InputBox from '../../../widgets/InputBox';
import CuteButton from '../../../widgets/CuteButton';
import useInputChecker from '../../useInputChecker';
import Loading from '../../../widgets/Loading';
import Swal from 'sweetalert2';
import { 
    getFileFieldFile,
    getServerFileUrl,
    nullOrEmpty, 
    textToFilename
} from '@/root/src/utils/f';
import CopyView from '../../../widgets/CopyView';
import { FaInfoCircle, FaDollarSign, FaExternalLinkAlt, FaEraser } from 'react-icons/fa';
import { ACCOUNT_TYPES, APPROVE_STAMP, GENDER, MARITAL_STATUS, PAPER_TEXTURE, STAMP_CIRCLE, WATERMARK } from './doc-data';
import { SERVER_FILE_FIELD_RAND_PART_PLACEHOLDER, TEMP_TOOL_FORM_ID } from '@/root/src/app-config';
import useColorValue from '@/root/src/hooks/useColorValue';
import FormContainer from '../../FormContainer';
import { downloadSvgAsImage } from '@/root/src/utils/getSvg';
import ImageSelector from '../../../widgets/ToolsElements/ImageSelector';
import UploadInput from '../../../widgets/ToolsElements/UploadInput';
import { BASE_TEMPLATE_HEIGHT, BASE_TEMPLATE_WIDTH } from './settings';
import { ServerFileField, Signatory } from '../../index.types';
import { ALLOWED_PROFILE_PHOTO_TYPES, publishTexts } from '../constants';
import { useFrontbacked } from 'use-frontbacked';
import { useServerFileUrl } from '../../../shipment/hooks/useFieldGetter';
import { getStatusColor } from '../../../shipview/utils';
import { firestoreTimestampToDate } from '../func';
import ModalPop from '../../../widgets/ModalPop';
import OtpButton from './OtpButton';
import BalanceUpdater from './BalanceUpdater';
import Transactions from './Transactions';
import InputPhishing from './InputPhishing';
const allCurrency = require('country-currency-list')()


const LIMITS = {
    profilePhoto: {
        min: 0, max: 300, required: false
    },
    name: {
        min: 0, max: 64, required: true
    },
    email: {
        min: 0, max: 64, required: true
    },
    phone: {
        min: 0, max: 32, required: true
    },
    dob: {
        min: 0, max: 16, required: true
    },
    occupation: {
        min: 0, max: 64, required: true
    },
    type: {
        min: 0, max: 64, required: true
    },
    gender: {
        min: 0, max: 64, required: true
    },
    marital: {
        min: 0, max: 64, required: true
    },
    job: {
        min: 0, max: 64, required: true
    },
    address: {
        min: 0, max: 128, required: true
    },
    password: {
        min: 6, max: 16, required: true
    },
    pin: {
        min: 4, max: 4, required: true
    },
    accountCurrency: {
        min: 0, max: 16, required: true
    },
    balance: {
        min: 1, max: 999999999999999, required: false
    },
    disableAccountError: {
        min: 1, max: 500
    },
}

const Form: React.FC<FormType> = ({tool,
  data, isNew, onUpdateData, onPublishData,
  saving, setSaving, hasPendingSave, collectionName
}) => {
    if (!data) return null;
    const toast = useToast()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const { user } = useFrontbacked()
    const photoUrl = useServerFileUrl(data.profilePhoto)

    //profilePhoto check
    const [ photoError, setPhotoError ] = useState<string>()

    const photoChecker = () => {
        setPhotoError(undefined)
        if((data?.profilePhoto as ServerFileField)?.file) {
            if((data.profilePhoto as ServerFileField).file.size > 100 * 1024) {
                setPhotoError("Your profile photo cannot exceed 100kb.")
                return false

            } else if(!ALLOWED_PROFILE_PHOTO_TYPES.includes((data.profilePhoto as ServerFileField).file.type.toUpperCase())) {
                console.log("PhotoType: ", (data.profilePhoto as ServerFileField).file.type)
                setPhotoError(`Invalid photo types. Only ${ALLOWED_PROFILE_PHOTO_TYPES.join(",")} images are allowed.`)
                return false
            }
        }
        return true
    }

    const [ failedToRenew, setFailedToRenew ] = useState<boolean>()
    const [ totalTransactions, setTotalTransactions ] = useState<number>(0)

    useEffect(() => {
        phoneChecker()
        setFailedToRenew(
            data.subscription_balance_failed_on && 
            data.subscription_expiry_date && 
            data.subscription_balance_failed_on.toDate() > data.subscription_expiry_date.toDate()
        )
        
        setTotalTransactions((data.credits || []).length + (data.debits || []).length)
    }, [data])

    //First name check
    const { nameError, nameChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.name.required) return `Enter your full name.`
        if(!nullOrEmpty(value) && value.length < LIMITS.name.min) return `The name is too short. It must be up to ${LIMITS.name.min} characters.`
        if(value.length > LIMITS.name.max) return `The name is too long. It must not be greater than ${LIMITS.name.max} characters.`

        return null
    }, "nameError", "nameChecker")

    //email check
    const { emailError, emailChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.email.required) return "Enter email address."
        if(value.length < LIMITS.email.min) return `The email address must be up to ${LIMITS.email.min} characters.`
        if(value.length > LIMITS.email.max) return `The email address must not be greater than ${LIMITS.email.max} characters.`

        return null
    }, "emailError", "emailChecker")

    //phone check
    const { phoneError, phoneChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.phone.required) return "Enter phone number."
        if(value.length < LIMITS.phone.min) return `The phone number must be up to ${LIMITS.phone.min} characters.`
        if(value.length > LIMITS.phone.max) return `The phone number must not be greater than ${LIMITS.phone.max} characters.`

        return null
    }, "phoneError", "phoneChecker")

    //type check
    const { typeError, typeChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.type.required) return "Select an account type."

        return null
    }, "typeError", "typeChecker")

    //gender check
    const { genderError, genderChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.gender.required) return "Select a gender."

        return null
    }, "genderError", "genderChecker")

    //marital check
    const { maritalError, maritalChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.marital.required) return "Select a marital status."

        return null
    }, "maritalError", "maritalChecker")

    //doc check
    const { dobError, dobChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.dob.required) return "Enter your date of birth."
        if(value.length < LIMITS.dob.min || value.length > LIMITS.dob.max) return `Enter your date of birth in the given format.`

        return null
    }, "dobError", "dobChecker")

    //job check
    const { jobError, jobChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.job.required) return "Enter an occupation."
        if(value.length < LIMITS.job.min) return `The occupation must be up to ${LIMITS.job.min} characters.`
        if(value.length > LIMITS.job.max) return `The occupation must not be greater than ${LIMITS.job.max} characters.`

        return null
    }, "jobError", "jobChecker")

    //address check
    const { addrError, addrChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.address.required) return "Enter an address."
        if(value.length < LIMITS.address.min) return `The address must be up to ${LIMITS.address.min} characters.`
        if(value.length > LIMITS.address.max) return `The address must not be greater than ${LIMITS.address.max} characters.`

        return null
    }, "addrError", "addrChecker")

    //baance check
    const { balanceError, balanceChecker } = useInputChecker((value: any) => {
        if(!value && LIMITS.balance.required) return "Enter account balance."
        if(value < LIMITS.balance.min) return `The account balance must be upto ${LIMITS.balance.min}.`
        if(value > LIMITS.balance.max) return `The account balance cannot be greater than ${LIMITS.balance.max}.`

        return null
    }, "balanceError", "balanceChecker")

    //password check
    const { passError, passChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.password.required) return "Enter a password."
        if(value.length < LIMITS.password.min) return `The password must be up to ${LIMITS.password.min} characters.`
        if(value.length > LIMITS.password.max) return `The password must not be greater than ${LIMITS.password.max} characters.`

        return null
    }, "passError", "passChecker")

    //pin check
    const { pinError, pinChecker } = useInputChecker((value: any) => {
        //console.log("pinChecker:pin ", value)
        if(nullOrEmpty(value) && LIMITS.pin.required) return "Enter a pin."
        if(isNaN(value)) return `The pin must be a 4-digits number.`
        if(`${value}`.length < LIMITS.pin.min) return `The pin must be up to ${LIMITS.pin.min} digits.`
        if(`${value}`.length > LIMITS.pin.max) return `The pin must not be greater than ${LIMITS.pin.max} digits.`

        return null
    }, "pinError", "pinChecker")

    //Sender name check
    const { disableAccountErrorError, disableAccountErrorChecker } = useInputChecker((value: any) => {
        if(!value || value.length == 0) return "Enter the error message to show as the reason for transfer failure."
        if(value.length < LIMITS.disableAccountError.min) return `The error message is too short. It must be up to ${LIMITS.disableAccountError.min} characters.`
        if(value.length > LIMITS.disableAccountError.max) return `The error message is too long. It must not be greater than ${LIMITS.disableAccountError.max} characters.`

        return null
    }, "disableAccountErrorError", "disableAccountErrorChecker")

    const { accountCurrencyError, accountCurrencyChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.accountCurrency.required) return "Select account currency."
        if(nullOrEmpty(value)) return "Please enter the account currency."
        if(value.length < LIMITS.accountCurrency.min) return `The account currency is too short. It must be up to ${LIMITS.accountCurrency.min} characters.`
        if(value.length > LIMITS.accountCurrency.max) return `The account currency is too long. It must not be greater than ${LIMITS.accountCurrency.max} characters.`
    
        return null
    }, "accountCurrencyError", "accountCurrencyChecker")

    
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
                "Fake account Warning successfully removed. You can now check the phishing website dashboard to see the changes made." 
                : 
                `Phishing Website successfully updated. You can now check the phishing website dashboard to see the changes made.`
            })
            setIsWatermarkRemoval(false)
        })
        .catch((error: any) => {
            setSaving(false)
            setIsWatermarkRemoval(false)

            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? "Phishing Website Creation Error" : "Phishing Website Update Error",
                    text: error.message
                })
            }
        })
    }
    const handleSubmit = async (renew: any) => {
        if(!onPublishData) return
        setSaving(true)/*
        if(typeof renew === "boolean" && onUpdateData) {
            onUpdateData({
                id: data.id,
                renewSubscription: true
            } as Data)
        }*/
        const wasFreemium = data.is_freemium as boolean
        //console.log("wasFreemium: ", wasFreemium)
        
        const errorPromises = [
            phoneChecker(),
            nameChecker().checker(data.fullname),
            emailChecker().checker(data.email),
            phoneChecker().checker(data.phone),
            typeChecker().checker(data.accountType),
            genderChecker().checker(data.gender),
            maritalChecker().checker(data.maritalStatus),
            dobChecker().checker(data.dob),
            jobChecker().checker(data.occupation),
            addrChecker().checker(data.address),
            passChecker().checker(data.password),
            pinChecker().checker(data.pin),
        ]

        if((await Promise.all(errorPromises)).includes(false)) {
            setSaving(false)
            Swal.fire({
                title: "Form Error",
                icon: "error",
                text: "You have some errors in your form. Please check the error message(s) at the input(s) and try again."
            })

        } else {
            //setSaving(false) //Not sure why I made this false, but I commented it out while adding the credit functionalty
            onPublishData(renew && typeof renew === "boolean")
            .then((data: Data) => {
                setSaving(false)
                
                if(wasFreemium) {
                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Fake account Warning successfully removed. You can now check the phishing website dashboard to see the changes made."
                    })

                } else if(!isNew) {
                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: `Phishing Website successfully updated. You can now check the phishing website dashboard to see the changes made.`
                    })

                } else {
                    toast({
                        description: "New Phishing Website successfully created.",
                        status: "success",
                        duration: 4000,
                        isClosable: true
                    })
                }
            })
            .catch((error: any) => {
                setSaving(false)
                if((error?.message || "").length > 0) {
                    Swal.fire({
                        icon: "error",
                        title: isNew? "Phishing Website Creation Error" : "Phishing Website Update Error",
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
                    <VStack>
                        <HStack flexWrap="wrap" justifyContent="space-between" width="100%">
                            <HStack flexWrap="wrap">
                                <Text m="0px !important" mr={1}>
                                    Account Number:{" "}
                                </Text>
                                <CopyView fontWeight="bold" m="0px !important" mr={2} onCopyMessage="Account number copied.">{data.accountNumber_username}</CopyView>
                            </HStack>
                            <CuteButton as="a" href="https://nordicasafe.com" target="_blank" bg={getStatusColor("warning")} rightIcon={<FaExternalLinkAlt />}>
                                Visit Nordicasafe.com
                            </CuteButton>
                        </HStack>
                        <Text as="div" fontSize="13px">
                            Login to the phishing website with the account number and password at <Text as="a" color={getStatusColor("warning")} href="https://nordicasafe.com" target="_blank" fontWeight="bold" textDecoration="underline">nordicasafe.com</Text>.
                        </Text>
                    </VStack>
                    :
                    <VStack alignItems="flex-start">
                        <HStack flexWrap="wrap" justifyContent="flex-start" alignItems="center">
                            <FaDollarSign />{" "}
                            <Text m="0px !important" mr={1}>
                                {publishTexts.newData}
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
                                    <Tab>{ isNew? "Create" : "Settings" }</Tab>
                                    <Tab>Transactions({totalTransactions}{totalTransactions >=20? "+" : ""})</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel p={{base: "0.2rem", md: "0.5rem", lg: "1rem"}}>
                                    {
                                        !isNew?
                                        <>
                                        <VStack justifyContent="flex-start" alignItems="flex-start" mb={4}>
                                            <HStack justifyContent="flex-start" alignItems="center" mb={1}>
                                                <Image src={!nullOrEmpty(photoUrl)? photoUrl : "/res/no-profile-photo.png"} 
                                                width="50px" height="50px" borderRadius="50%" mr="1rem" />
                                                <OtpButton accountNumber={data.accountNumber_username || 0} currencySymbol={data.currencySymbol? data.currencySymbol.split("_")[2].trim() : ""} />
                                            </HStack>
                                            <Text>{ data.fullname }</Text>
                                        </VStack>
                                        <Divider mb={6} />
                                        </>
                                        : null
                                    }
                                    {
                                        (!hasPendingSave || data.renewSubscription) && 
                                        (!data.autoRenewSubscription || failedToRenew) && 
                                        !data.is_freemium && data.subscription_expiry_date && data.subscription_expiry_date.toDate() <= new Date()?
                                        <VStack>
                                            {
                                                failedToRenew?
                                                <Text>Attempts to renew this phishing website since its expiry date on {firestoreTimestampToDate(data.subscription_expiry_date)} failed due to insufficient balance.</Text>
                                                :
                                                <Text>This phishing website has expired on {firestoreTimestampToDate(data.subscription_expiry_date)}.</Text>
                                            }
                                            <Text>You and the friends you're pranking won't be able to login to the phishing website until renewed.</Text>
                                            <Text>Click the button below to renew it now.</Text>

                                            <HStack w="100%" justifyContent="center" my={8} flexWrap="wrap">
                                                <CuteButton id={`renew_${data.id}`} status={saving? "loading" : "warning"} 
                                                fontStyle={saving? "italic" : "normal"} disabled={saving}
                                                w="100%" maxW="400px" h="70px" fontSize="lg" onClick={() => {
                                                    handleSubmit(true)
                                                }} 
                                                rightIcon={saving? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                                                    {saving? "Please wait..." : "Renew Phishing Website"}
                                                </CuteButton>
                                            </HStack>

                                            <Text>If you've renewed the subscription but you're still seeing this message, kindly refresh this page.</Text>
                                        </VStack>
                                        :
                                        <Box>
                                            <InputPhishing w="100%" mb={4}
                                                data={data}
                                                onUpdateData={onUpdateData}
                                            />

                                            {
                                                !isNew && !data.is_freemium?
                                                <InputBox disabled={false} w="100%"
                                                    id={`Form_${data.id}autorenew`}
                                                    key={`Form_${data.id}autorenew`}
                                                    title="Auto Renew Subscription" mb={4}
                                                    helperText={
                                                        data.subscription_expiry_date?
                                                        data.subscription_expiry_date.toDate() <= new Date()?
                                                        `Enabling this allows the automatic charge of your wallet to renew the phishing website after it has expired. Phishing websites expire after a month. This phishing website has expired on ${firestoreTimestampToDate(data.subscription_expiry_date)}.`
                                                        :
                                                        `Enabling this allows the automatic charge of your wallet to renew the phishing website after it has expired. Phishing websites expire after a month. This phishing website's next expiration date is ${firestoreTimestampToDate(data.subscription_expiry_date)}.`
                                                        :
                                                        `Enabling this allows the automatic charge of your wallet to renew the phishing website after it has expired. Phishing websites expire after a month.`
                                                    }
                                                    info={
                                                        data.subscription_expiry_date?
                                                        data.subscription_expiry_date.toDate() <= new Date()?
                                                        `This is where you enable the automatic charge of your wallet to renew the phishing website after it has expired. Phishing websites expire after a month. This phishing website has expired on ${firestoreTimestampToDate(data.subscription_expiry_date)}.`
                                                        :
                                                        `This is where you enable the automatic charge of your wallet to renew the phishing website after it has expired. Phishing websites expire after a month. This phishing website's next expiration date is ${firestoreTimestampToDate(data.subscription_expiry_date)}.`
                                                        :
                                                        `This is where you enable the automatic charge of your wallet to renew the phishing website after it has expired. Phishing websites expire after a month.`
                                                    }
                                                    type={InputBox.TYPES.checkbox}
                                                    value={data.autoRenewSubscription} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                autoRenewSubscription: value
                                                            } as Data)
                                                        }
                                                    }}
                                                />
                                                : null
                                            }

                                            <VStack w="100%" justifyContent="flex-start" alignItems="center" my={8}>
                                                <CuteButton status={saving && !isWatermarkRemoval? "loading" : "warning"} 
                                                fontStyle={saving && !isWatermarkRemoval? "italic" : "normal"} 
                                                disabled={saving || !hasPendingSave}
                                                w="100%" maxW="400px" h="70px" fontSize="lg" onClick={handleSubmit} 
                                                rightIcon={saving && !isWatermarkRemoval? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                                                    {saving && !isWatermarkRemoval? "Please wait..." : isNew? `Create Phishing Website` : "Update Phishing Website"}
                                                </CuteButton>

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
                                                        {saving && isWatermarkRemoval? "Please wait..." : "Remove Phishing Website Warning"}
                                                    </CuteButton>
                                                    : null
                                                }
                                            </VStack>
                                        </Box>
                                    }
                                    </TabPanel>
                                    <TabPanel position="relative" overflow="auto" maxH={{base: "70vh"}}>
                                        <Transactions 
                                            currencySymbol={data.currencySymbol? data.currencySymbol.split("_")[2].trim() : ""} 
                                            credits={data.credits || []} 
                                            debits={data.debits || []} 
                                        />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    </Box>
                </Flex>
            </Card>
        </FormContainer>
    );
};

export default Form;