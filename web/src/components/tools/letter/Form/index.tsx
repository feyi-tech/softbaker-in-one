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
    nullOrEmpty, 
    textToFilename
} from '@/root/src/utils/f';
import CopyView from '../../../widgets/CopyView';
import { FaFileDownload, FaInfoCircle, FaEnvelopeOpenText, FaEraser } from 'react-icons/fa';
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
import HowToPay from '../../HowToPay';


const LIMITS = {
    name: {
        min: 0, max: 64, required: true
    },
    title: {
        min: 0, max: 64, required: true
    },
    senderInfo: {
        min: 0, max: 200, required: true
    },
    recipientInfo: {
        min: 0, max: 400, required: false
    },
    body: {
        min: 0, max: 1400, required: false
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
    const [logoUrl, resetLogoUrl ] = useFileFieldUrl(collectionName, data.id, "logo", data.logo)

    //First name check
    const { nameError, nameChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.name.required) return `Enter your company name.`
        if(!nullOrEmpty(value) && value.length < LIMITS.name.min) return `The name is too short. It must be up to ${LIMITS.name.min} characters.`
        if(value.length > LIMITS.name.max) return `The name is too long. It must not be greater than ${LIMITS.name.max} characters.`

        return null
    }, "nameError", "nameChecker")

    //Title check
    const { titleError, titleChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.title.required) return "Enter the letter title."
        if(value.length < LIMITS.title.min) return `The title must be up to ${LIMITS.title.min} characters.`
        if(value.length > LIMITS.title.max) return `The title must not be greater than ${LIMITS.title.max} characters.`

        return null
    }, "titleError", "titleChecker")

    //sender check
    const { senderInfoError, senderInfoChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.senderInfo.required) return "Enter your company info."
        if(value.length < LIMITS.senderInfo.min) return `Company info must be up to ${LIMITS.senderInfo.min} characters.`
        if(value.length > LIMITS.senderInfo.max) return `Company info must not be greater than ${LIMITS.senderInfo.max} characters.`

        return null
    }, "senderInfoError", "senderInfoChecker")

    //recipient check
    const { recipientInfoError, recipientInfoChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.recipientInfo.required) return "Enter recipient info."
        if(value.length < LIMITS.recipientInfo.min) return `Recipient info must be up to ${LIMITS.recipientInfo.min} characters.`
        if(value.length > LIMITS.recipientInfo.max) return `Recipient info must not be greater than ${LIMITS.recipientInfo.max} characters.`

        return null
    }, "recipientInfoChecker", "recipientInfoChecker")

    //Body check
    const { bodyError, bodyChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.body.required) return "Enter the letter body."
        if(value.length < LIMITS.body.min) return `The body must be up to ${LIMITS.body.min} characters.`
        if(value.length > LIMITS.body.max) return `The body must not be greater than ${LIMITS.body.max} characters.`

        return null
    }, "bodyError", "bodyChecker")

    //Logo check
    const { logoError, logoChecker } = useInputChecker((value: any, optionalData?: {[x: string]: any}) => {
        //if(nullOrEmpty(value)) return `Provide Company logo.`
        if(value && value != "logo") return "Invalid Company logo"
        if(value && !getFileFieldFile(collectionName, (optionalData || data).id, value)) return "Your Company logo was not found on this browser. Please provide the logo again."

        return null
    }, "logoError", "logoChecker")

    const [ signatories, setSignatories ] = useState<Signatory[]>([])
    const [ showDownloadFormatOptions, setShowDownloadFormatOptions ] = useState<boolean>()

    const [ signatureErrors, setSignatureErrors ] = useState<string[]>([])

    const checkSignatoryErrors = (data: Data) => {
        const signatures = data.signatures || []
        const signatureErrors: string[] = []
        var hasError = false
        for(var i = 0; i < signatures.length; i++) {
            if(signatures[i].length > 0 && !getFileFieldFile(collectionName, data.id, `signatures_${i}`)) {
                hasError = true
                signatureErrors.push(
                    data.signatoryNames && data.signatoryNames[i]?
                    `Signature for ${data.signatoryNames[i]} was not found on this browser. Please provide it again.`
                    :
                    "Signature was not found on this browser. Please provide it again."
                )

            } else {
                //signatureErrors.push(null)
            }
        }
        setSignatureErrors(signatureErrors)
        return {
            hasError: hasError,
            signatureErrors
        }
    }

    useEffect(() => {
        if(data) {
            const signatoryNames = data.signatoryNames || []
            const signatoryTitles = data.signatoryTitles || []
            const signatures = data.signatures || []
            const signatories: Signatory[] = []
            for(var i = 0; i < signatoryNames.length; i++) {
                signatories.push({
                    name: signatoryNames[i],
                    title: signatoryTitles[i],
                    base64Url: signatures[i].length > 0? getFileFieldFile(collectionName, data.id, `signatures_${i}`) : null
                })
            }
            setSignatories(signatories)
            setSignatureErrors(checkSignatoryErrors(data).signatureErrors)
        }
    }, [data])

    const updateSignatories = (newSignatories: Signatory[]) => {
    setSignatories(newSignatories)
    if(onUpdateData) {
        const signatoryNames = []
        const signatoryTitles = []
        const signatures = []
        for(const signatory of newSignatories) {
            signatoryNames.push(signatory.name? signatory.name : "")
            signatoryTitles.push(signatory.title? signatory.title : "")
            signatures.push(signatory.base64Url? signatory.base64Url : "")
        }
        onUpdateData({
            id: data.id,
            signatoryNames: signatoryNames,
            signatoryTitles: signatoryTitles,
            signatures: signatures
        } as Data)
    }
    }

    const download = async (data: Data, format: string) => {
        if(isLoading) return

        //Check if the files still exists
        const errorPromises = [
            logoChecker().checker(data.logo, data)
        ]

        const errorsCheck = (await Promise.all(errorPromises))
        const signatureErrors = checkSignatoryErrors(data)
        if(errorsCheck.includes(false) || signatureErrors.hasError) {
            resetLogoUrl()
            Swal.fire({
                title: "Download Error",
                text: "Check your upload fields to fix some missing files affecting your download.",
                icon: "error"
            })
            return
        }

        setIsLoading(true)
        
        Doc.downloadSvg({
            width: BASE_TEMPLATE_WIDTH, height: BASE_TEMPLATE_HEIGHT, 
            companyName: data.companyName,
            title: data.title,
            senderInfo: data.senderInfo, 
            recipientInfo: data.recipientInfo,
            signatories: signatories,
            body: data.body, 
            logoUrl: getFileFieldFile(collectionName, data.id, "logo"),
            watermarkWithLogo: data.waterMarkWithLogo,
            grayScaleWaterMark: data.grayScaleWaterMark,
            stampCircleUrl: STAMP_CIRCLE.downloadImage,
            approvedStampUrl: APPROVE_STAMP.downloadImage,
            paperTextureUrl: PAPER_TEXTURE.downloadImage,
            stampLogo: data.stampLogo,
            stampApprove: data.stampApprove,
            hasPaperTexture: data.hasPaperTexture,
            waterMarkUrl: !data.is_freemium? null : WATERMARK.downloadImage
        })
        .then(svg => {
            //console.log("SVG: ", svg)
            toast({
                description: "Your letter will download shortly.",
                status: "info",
                duration: 4000,
                isClosable: true
            })
            downloadSvgAsImage(svg, format, `${textToFilename(data.title || data.companyName || "")}-${(new Date()).toISOString()}-letter`)
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
                "Letter successfully updated."
            })
            setIsWatermarkRemoval(false)
        })
        .catch((error: any) => {
            setSaving(false)
            setIsWatermarkRemoval(false)

            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? "Letter Creation Error" : "Letter Update Error",
                    text: error.message
                })
            }
        })
    }

    const handleSubmit = async () => {
        if(!onPublishData) return
        setSaving(true)
        
        const errorPromises = [
            nameChecker().checker(data.companyName),
            titleChecker().checker(data.title),
            senderInfoChecker().checker(data.senderInfo),
            recipientInfoChecker().checker(data.recipientInfo),
            logoChecker().checker(data.logo)
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
                    description: isNew? "New Letter successfully saved." : "Letter successfully updated.",
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
                        title: isNew? "Letter Creation Error" : "Letter Update Error",
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
                            <FaEnvelopeOpenText />{" "}
                            <Text as="div" m="0px !important" mr={1}>
                                New Letter
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
                                            disabled={!isNew && logoUrl != null}/*
                                            removeBackground={true}
                                            imageCropArg={{
                                                message: "Make sure the image is cropped as shown in the sample image",
                                                dimension: {
                                                    width: 120,
                                                    height: 120,
                                                },
                                                restrictPosition: true,
                                                showGrid: true
                                            }}*/
                                            w="100%"
                                            id={`Form_${data.id}logo`}
                                            key={`Form_${data.id}logo`}
                                            title={`Your company logo`} mb={4}
                                            info="The logo of your company."
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
                                            id={`Form_${data.id}_name`}
                                            key={`Form_${data.id}_name`}
                                            title="Your company name" mb={4}
                                            placeholder="Amazon Inc"
                                            info="This is the registered name of your company."
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
                                            id={`Form_${data.id}_sender`}
                                            key={`Form_${data.id}_sender`}
                                            title="Your company info" mb={4}
                                            placeholder=""
                                            info="This is your company information such as address, email, phone number. Use the enter or send key/button to enter each info in a new line."
                                            helperText="Your company address, email, phone number,... Hit enter key to enter new line."
                                            type={InputBox.TYPES.textarea}
                                            value={data.senderInfo} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        senderInfo: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={senderInfoChecker}
                                            errorMessage={senderInfoError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" minH="110px"
                                            id={`Form_${data.id}_recipient`}
                                            key={`Form_${data.id}_recipient`}
                                            title="Recipient info" mb={4}
                                            placeholder=""
                                            info="This is the information of the entity you're writing to; such as customer or company name, address, email, phone number. Use the enter or send key/button to enter each info in a new line."
                                            helperText="The information of the entity you're writing to. Hit enter key to enter new line."
                                            type={InputBox.TYPES.textarea}
                                            value={data.recipientInfo} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        recipientInfo: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={recipientInfoChecker}
                                            errorMessage={recipientInfoError}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}_title`}
                                            key={`Form_${data.id}_title`}
                                            title="Letter Title" mb={4}
                                            placeholder="123456789"
                                            info="This is the title of the letter you're writing."
                                            type={InputBox.TYPES.text}
                                            value={data.title} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        title: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={titleChecker}
                                            errorMessage={titleError}
                                        />

                                        <InputBox disabled={!isNew} w="100%" minH="150px"
                                            id={`Form_${data.id}body`}
                                            key={`Form_${data.id}body`}
                                            title="Letter body" mb={4}
                                            info="The body of the letter. Hit enter/send key to enter a new line."
                                            type={InputBox.TYPES.textarea}
                                            value={data.body} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        body: value
                                                    } as Data)
                                                }
                                            }}
                                            onCheckInfo={bodyChecker}
                                            errorMessage={bodyError}
                                        />

                                        <SignatoryInput disabled={!isNew && signatureErrors.length == 0} w="100%"
                                            id={`Form_${data.id}signatories`}
                                            key={`Form_${data.id}signatories`}
                                            title="Signatories" mb={4}
                                            helperText="Provide the person or people to sign the letter."
                                            info="This is where you provide the name(s), title(s), and signature(s) to put on the letter."
                                            type={InputBox.TYPES.textarea}
                                            submitButtonText={`Submit Signatory`}
                                            maxSize={3}
                                            nameRule={{
                                                title: "signatory name",
                                                required: true,
                                                minSize: 0,
                                                maxSize: 64
                                            }}
                                            titleRule={{
                                                title: "signatory title",
                                                required: false,
                                                minSize: 0,
                                                maxSize: 64
                                            }}
                                            base64ImageRule={{
                                                title: "signature",
                                                required: false,
                                                minSize: 0,
                                                maxSize: 64
                                            }}
                                            value={signatories} 
                                            onChange={(value) => {
                                                updateSignatories(value)
                                            }}
                                            onCheckInfo={bodyChecker}
                                            errorMessage={signatureErrors.join(", ")}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}hasPaperTexture`}
                                            key={`Form_${data.id}hasPaperTexture`}
                                            title="Creased paper effect" mb={4}
                                            info="Enabling this makes the letter look like a crumpled paper."
                                            type={InputBox.TYPES.checkbox}
                                            value={data.hasPaperTexture} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        hasPaperTexture: value
                                                    } as Data)
                                                }
                                            }}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}waterMarkWithLogo`}
                                            key={`Form_${data.id}waterMarkWithLogo`}
                                            title="Watermark your logo" mb={4}
                                            info="Enabling this adds your logo as a watermark to the letter background."
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

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}stampLogo`}
                                            key={`Form_${data.id}stampLogo`}
                                            title="Stamp your logo" mb={4}
                                            info="Enabling this adds a stamp with your logo in it."
                                            type={InputBox.TYPES.checkbox}
                                            value={data.stampLogo} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        stampLogo: value
                                                    } as Data)
                                                }
                                            }}
                                        />

                                        <InputBox disabled={!isNew} w="100%"
                                            id={`Form_${data.id}stampApprove`}
                                            key={`Form_${data.id}stampApprove`}
                                            title="Add approve Stamp" mb={4}
                                            info="Enabling this adds an approval stamp to your letter."
                                            type={InputBox.TYPES.checkbox}
                                            value={data.stampApprove} 
                                            onChange={(value) => {
                                                if(onUpdateData) {
                                                    onUpdateData({
                                                        id: data.id,
                                                        stampApprove: value
                                                    } as Data)
                                                }
                                            }}
                                        />

                                        <HowToPay my={2} />
                                    </TabPanel>
                                    <TabPanel bg="#dcdcdc" p="0px">
                                        <DocContainer 
                                        width="100%" message="Drag around to view the whole letter"
                                        height={{base: 500, md: 728, lg: 1024}} 
                                            pos="relative" 
                                            overflowX="hidden"
                                            overflowY="hidden">
                                                <Doc isLoading={isLoading}
                                                    width={{base: 728, lg: 1024}} 
                                                    height={{base: 1031, lg: 1448}} 
                                                    companyName={data.companyName}
                                                    title={data.title}
                                                    senderInfo={data.senderInfo} 
                                                    recipientInfo={data.recipientInfo}
                                                    signatories={signatories}
                                                    body={data.body} 
                                                    logoUrl={logoUrl}
                                                    watermarkWithLogo={data.waterMarkWithLogo}
                                                    grayScaleWaterMark={data.grayScaleWaterMark}
                                                    stampCircleUrl={STAMP_CIRCLE.image}
                                                    approvedStampUrl={APPROVE_STAMP.image}
                                                    paperTextureUrl={PAPER_TEXTURE.image}
                                                    waterMarkUrl={!data.is_freemium? null : WATERMARK.image} 
                                                    stampLogo={data.stampLogo}
                                                    stampApprove={data.stampApprove}
                                                    hasPaperTexture={data.hasPaperTexture}
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
                                        {saving && !isWatermarkRemoval? "Please wait..." : `Create Letter`}
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
                                            text: "You're yet to create the Letter. Create Letter first, then download."
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
                                    {saving? "Please wait..." : "Download Letter"}
                                </DownloadFormatButton>
                                {
                                    hasDownloaded?
                                    <Quote status="success">
                                        Check your download folder for the downloaded Letter.
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