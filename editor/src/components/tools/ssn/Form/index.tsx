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
import { Data, FormType } from '../types';
import Card from '../../../widgets/Card';
import InputBox from '../../../widgets/InputBox';
import CuteButton from '../../../widgets/CuteButton';
import useInputChecker from '../../useInputChecker';
import Loading from '../../../widgets/Loading';
import Swal from 'sweetalert2';
import { 
    getFileFieldFile,
    nullOrEmpty 
} from '@/root/src/utils/f';
import CopyView from '../../../widgets/CopyView';
import { FaFileDownload, FaInfoCircle, FaAddressCard, FaEraser } from 'react-icons/fa';
import Doc, { ResponsiveValue } from './Doc';
import { SHADER_URL, SSN, SSN_FREEMIUM, TABLE } from './doc-data';
import { TEMP_TOOL_FORM_ID } from '@/root/src/app-config';
import useColorValue from '@/root/src/hooks/useColorValue';
import FormContainer from '../../FormContainer';
import { downloadSvgAsImage } from '@/root/src/utils/getSvg';
import Quote from '../../../widgets/Quote';
import SignatureInput from '../../../widgets/ToolsElements/SignatureInput';
import ImageSelector from '../../../widgets/ToolsElements/ImageSelector';
import DocContainer from '../../../widgets/ToolsElements/DocContainer';
import { useFileFieldUrl } from '../../../shipment/hooks/useFieldGetter';
import HowToPay from '../../HowToPay';


const LIMITS = {
    name: {
        min: 2, max: 100
    },
    number: {
        min: 9, max: 9
    },
    date: {
        min: 0, max: 16
    },
    scene: {
        min: 0, max: 32
    }
}

const Form: React.FC<FormType> = ({tool,
  data, isNew, onUpdateData, onPublishData,
  saving, setSaving, hasPendingSave, collectionName
}) => {
  if (!data) return null;
  const toast = useToast()
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ hasDownloaded, setHasDownloaded ] = useState<boolean>(false)
  const [ signatureUrl, resetSignatureUrl ] = useFileFieldUrl(collectionName, data.id, "signature", data.signature)


  //First name check
  const { nameError, nameChecker } = useInputChecker((value: any) => {
    if(nullOrEmpty(value) && nullOrEmpty(data.fullname)) return `Enter your full name.`
    if(!nullOrEmpty(value) && value.length < LIMITS.name.min) return `The name is too short. It must be up to ${LIMITS.name.min} characters.`
    if(value.length > LIMITS.name.max) return `The name is too long. It must not be greater than ${LIMITS.name.max} characters.`

    return null
  }, "nameError", "nameChecker")

  //SSN number check
  const { numberError, numberChecker } = useInputChecker((value: any) => {
    if(nullOrEmpty(value)) return `Enter SSN number.`
    if(!nullOrEmpty(value) && value.length < LIMITS.number.min) return `The SSN number is too short. It must be up to ${LIMITS.number.min} digits.`
    if(value.length > LIMITS.number.max) return `The SSN number is too long. It must not be greater than ${LIMITS.number.max} digits.`

    return null
  }, "numberError", "numberChecker")

  //SSN date check
  const { dateError, dateChecker } = useInputChecker((value: any) => {
    if(nullOrEmpty(value)) return `Enter SSN date.`
    if(!nullOrEmpty(value) && value.length < LIMITS.date.min) return `The SSN date is too short. It must be up to ${LIMITS.date.min} characters.`
    if(value.length > LIMITS.date.max) return `The SSN date is too long. It must not be greater than ${LIMITS.date.max} characters.`

    return null
  }, "dateError", "dateChecker")

  //Scene check
  const { sceneError, sceneChecker } = useInputChecker((value: any) => {
    if(nullOrEmpty(value)) return "Select a scene background."
    if(value.length < LIMITS.scene.min) return `Invalid ticket scene background. It must be up to ${LIMITS.scene.min} characters.`
    if(value.length > LIMITS.scene.max) return `Invalid ticket scene background. It must not be greater than ${LIMITS.scene.max} characters.`

    return null
  }, "sceneError", "sceneChecker")

  //SSN date check
  const { signatureError, signatureChecker } = useInputChecker((value: any, optionalData?: {[x: string]: any}) => {
    if(nullOrEmpty(value)) return `Provide SSN Signature.`
    if(value != "signature") return "Invalid SSN Signature"
    if(!getFileFieldFile(collectionName, (optionalData || data).id, value)) return "Your SSN Signature was not found on this browser. Please provide the signature again."

    return null
  }, "signatureError", "signatureChecker")
  

  const download = async (data: Data) => {
        if(isLoading) return

        //Check if the files still exists
        const errorPromises = [
            signatureChecker().checker(data.signature, data)
        ]
        if((await Promise.all(errorPromises)).includes(false)) {
            Swal.fire({
                title: "Download Error",
                text: "Check your upload fields to fix some missing files affecting your download.",
                icon: "error"
            })
            resetSignatureUrl()
            return
        }

        setIsLoading(true)

        const width = 1024
        const height = 672
        Doc.downloadSvg({
            width, height, fullname: data.fullname as string, number: data.number as string, date: data.date as string, 
            shaderUrl: SHADER_URL.downloadImage,
            ssnUrl: data.is_freemium? SSN_FREEMIUM.downloadImage :  SSN.downloadImage, 
            tableUrl: TABLE[data.scene].downloadImage,
            signatureUrl: {
                base64Url: getFileFieldFile(collectionName, data.id, "signature") as string,
                width: 0,
                height: 0
            }
        })
        .then(svg => {
            //console.log("SVG: ", svg)
            toast({
                description: "Your ticket will download shortly.",
                status: "info",
                duration: 4000,
                isClosable: true
            })
            downloadSvgAsImage(svg, "jpeg", `${data.fullname}-${(new Date()).toISOString()}-ssn`)
            .then(base64ImageUrl => {
                resetSignatureUrl()
                setIsLoading(false)
                setHasDownloaded(true)
                setTimeout(() => {
                    setHasDownloaded(false)
                }, 8000);                
                //console.log("downloadSvgAsImage: ", base64ImageUrl)
            })
            .catch(e => {
                resetSignatureUrl()
                setIsLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: "Download Error",
                    text: e.message
                })
            })
        })
        .catch(e => {
            resetSignatureUrl()
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
                "SSN successfully updated."
            })
            setIsWatermarkRemoval(false)
        })
        .catch((error: any) => {
            setSaving(false)
            setIsWatermarkRemoval(false)

            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? "SSN Creation Error" : "SSN Update Error",
                    text: error.message
                })
            }
        })
    }
  
    const handleSubmit = async () => {
        if(!onPublishData) return
        setSaving(true)
        
        const errorPromises = [
            nameChecker().checker(data.fullname),
            numberChecker().checker(data.number),
            dateChecker().checker(data.date),
            sceneChecker().checker(data.scene),
            signatureChecker().checker(data.signature)
        ]

        if((await Promise.all(errorPromises)).includes(false)) {
            setSaving(false)
            resetSignatureUrl()
            Swal.fire({
                title: "Form Error",
                icon: "error",
                text: "You have some errors in your form. Please check the error message(s) at the input(s) and try again."
            })

        } else {
            onPublishData()
            .then((data: Data) => {
                resetSignatureUrl()
                setSaving(false)
                toast({
                    description: isNew? "New SSN successfully saved." : "SSN successfully updated.",
                    status: "success",
                    duration: 4000,
                    isClosable: true
                })
                
                download(data)
            })
            .catch((error: any) => {
                resetSignatureUrl()
                setSaving(false)
                if((error?.message || "").length > 0) {
                    Swal.fire({
                        icon: "error",
                        title: isNew? "SSN Creation Error" : "SSN Update Error",
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
                        <FaAddressCard />{" "}
                        <Text as="div" m="0px !important" mr={1}>
                            New SSN
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
                                    <InputBox disabled={!isNew} w="100%"
                                        id={`ShippingForm_${data.id}_name`}
                                        key={`ShippingForm_${data.id}_name`}
                                        title="Full name" mb={4}
                                        placeholder="Selena Gomez"
                                        info="The full name of the SSN Owner."
                                        type={InputBox.TYPES.text}
                                        value={data.fullname} 
                                        onChange={(value) => {
                                            if(onUpdateData) {
                                                onUpdateData({
                                                    id: data.id,
                                                    fullname: value
                                                } as Data)
                                            }
                                        }}
                                        onCheckInfo={nameChecker} 
                                        errorMessage={nameError}
                                    />
                                    <InputBox disabled={!isNew} w="100%"
                                        id={`ShippingForm_${data.id}_num`}
                                        key={`ShippingForm_${data.id}_num`}
                                        title="SSN number" mb={4}
                                        placeholder="123456789"
                                        info="The SSN number."
                                        type={InputBox.TYPES.text}
                                        value={data.number} 
                                        onChange={(value) => {
                                            if(onUpdateData) {
                                                onUpdateData({
                                                    id: data.id,
                                                    number: value
                                                } as Data)
                                            }
                                        }}
                                        onCheckInfo={numberChecker}
                                        errorMessage={numberError}
                                    />
                                    <InputBox disabled={!isNew} w="100%"
                                        id={`ShippingForm_${data.id}_date`}
                                        key={`ShippingForm_${data.id}_date`}
                                        title="SSN date" mb={4}
                                        placeholder="MM/DD/YYYY"
                                        info="The SSN issue date."
                                        type={InputBox.TYPES.text}
                                        value={data.date} 
                                        onChange={(value) => {
                                            if(onUpdateData) {
                                                onUpdateData({
                                                    id: data.id,
                                                    date: value
                                                } as Data)
                                            }
                                        }}
                                        onCheckInfo={dateChecker}
                                        errorMessage={dateError}
                                    />

                                    <ImageSelector mb={4} disabled={!isNew}
                                        title="Scene background"
                                        id={`ShippingForm_${data.id}_scene`}
                                        key={`ShippingForm_${data.id}_scene`}
                                        options={Object.values(TABLE)} 
                                        thumbnail={TABLE[data.scene]?.thumbnail}
                                        image={TABLE[data.scene]?.image}
                                        imageTitle={TABLE[data.scene]?.title} 
                                        onChange={(value) => {
                                            if(onUpdateData) {
                                                onUpdateData({
                                                    id: data.id,
                                                    scene: value.id,
                                                } as Data)
                                            }
                                        }}
                                    />
                                    
                                    <SignatureInput 
                                        disabled={!isNew && signatureUrl != null} w="100%"
                                        id={`ShippingForm_${data.id}_sign`}
                                        key={`ShippingForm_${data.id}_sign`}
                                        title={`SSN signature`} mb={4}
                                        info="The SSN signature."
                                        thumbnail={signatureUrl}
                                        onChange={(value) => {
                                            if(onUpdateData) {
                                                onUpdateData({
                                                    id: data.id,
                                                    signature: value
                                                } as Data)
                                                resetSignatureUrl()
                                            }
                                        }}
                                        onCheckInfo={signatureChecker} 
                                        errorMessage={signatureError}
                                    />

                                    <HowToPay my={2} />
                                </TabPanel>
                                <TabPanel bg="#dcdcdc" p="0px">
                                    <DocContainer message="Drag around to view the whole SSN card"
                                        pos="relative" 
                                        overflowX="auto"
                                        overflowY="hidden">
                                            <Doc isLoading={isLoading}
                                            width={{base: 457, md: 609, lg: 648}} 
                                            height={{base: 300, md: 400, lg: 425}} 
                                            fullname={data.fullname as string}
                                            number={data.number as string} 
                                            date={data.date as string}
                                            shaderUrl={SHADER_URL.image}
                                            ssnUrl={!data.is_freemium? SSN.image : SSN_FREEMIUM.image} 
                                            tableUrl={TABLE[data?.scene || "curly-pattern"]?.image} 
                                            signatureUrl={{
                                                base64Url: signatureUrl as string,
                                                width: 0,
                                                height: 0
                                            }}
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
                                    {saving && !isWatermarkRemoval? "Please wait..." : `Create SSN`}
                                </CuteButton>
                            }
                            <CuteButton status={saving? "loading" : "warning"} outlined
                            fontStyle={saving? "italic" : "normal"} disabled={saving}
                            w="100%" maxW="400px" h="70px" fontSize="lg" onClick={() => {
                                if(isNew) {
                                    Swal.fire({
                                        icon: "error",
                                        title: "Download error",
                                        text: "You're yet to create the ticket. Create SSN first, then download."
                                    })
                                } else {
                                    download(data)
                                }
                            }} 
                            rightIcon={<FaFileDownload />}>
                                {saving? "Please wait..." : "Download SSN"}
                            </CuteButton>
                            {
                                hasDownloaded?
                                <Quote status="success">
                                    Check your download folder for the downloaded ticket.
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