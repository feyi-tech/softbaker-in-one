import React, { useEffect, useMemo, useState } from 'react';
import {
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
    nullOrEmpty
} from '@/root/src/utils/f';
import CopyView from '../../../widgets/CopyView';
import { FaInfoCircle, FaFileInvoiceDollar, FaEye, FaEyeSlash, FaCog, FaFonticons } from 'react-icons/fa';
import { TEMP_TOOL_FORM_ID } from '@/root/src/app-config';
import useColorValue from '@/root/src/hooks/useColorValue';
import FormContainer from '../../FormContainer';
import UploadInput from '../../../widgets/ToolsElements/UploadInput';
import FieldsInput from './svg-processor/FieldsInput';
import IconSelector from '../../../widgets/ToolsElements/IconSelector';
import { useFrontbacked } from 'use-frontbacked';
import useTemplates from './svg-processor/hooks/use-templates';
import TemplateSelector from '../../../widgets/ToolsElements/TemplateSelector';
import SvgRenderer from './svg-processor/SvgRenderer';
import LoadingView from '../../../widgets/LoadingView';
import useFonts from './svg-processor/hooks/use-fonts';
import FontsInput from './svg-processor/FontsInput';
import useDefaultFieldsValue from './svg-processor/hooks/use-default-fields-value';
import Link from '../../../widgets/Link';
import HowToPay from '../../HowToPay';
import { FieldsData } from 'frontbacked-svg';


const LIMITS = {
    name: {
        min: 2, max: 64, required: true
    },
    description: {
        min: 2, max: 256, required: true
    },
    icon: {
        min: 2, max: 64, required: true
    },
    youtube: {
        min: 2, max: 64, required: false
    },
    editable: {
        min: 1, max: 256, required: false
    },
    message: {
        min: 1, max: 256, required: false
    },
    createPrice: {
        min: 1, max: 1000000000000000, required: true
    },
    updatePrice: {
        min: 0.1, max: 1000000000000000, required: true
    }
}


interface SectionSeparator {
    icon: any
    [x: string]: any
}

const SectionSeparator: React.FC<SectionSeparator> = ({ icon, ...props }) => {
    return (
        <HStack justifyContent="space-between" alignItems="center" {...props}>
            <Box border="1px dashed" width="45%" height="1px"></Box>
            { icon }
            <Box border="1px dashed" width="45%" height="1px"></Box>
        </HStack>
    )
}

const Form: React.FC<FormType> = ({tool,
  data, isNew, onUpdateData, onPublishData,
  saving, setSaving, hasPendingSave, collectionName
}) => {
    if (!data) return null;
    const toast = useToast()
    const { user } = useFrontbacked()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ hasDownloaded, setHasDownloaded ] = useState<boolean>(false)
    const [logoUrl, setSvgUrl ] = useState<string>()

    //Tool name check
    const { nameError, nameChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.name.required) return `Enter the tool name.`
        if(!nullOrEmpty(value) && value.length < LIMITS.name.min) return `The tool name is too short. It must be up to ${LIMITS.name.min} characters.`
        if(value.length > LIMITS.name.max) return `The tool name is too long. It must not be greater than ${LIMITS.name.max} characters.`

        return null
    }, "nameError", "nameChecker")

    //Tool name check
    const { descriptionError, descriptionChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.description.required) return `Enter the tool description.`
        if(!nullOrEmpty(value) && value.length < LIMITS.description.min) return `The tool description is too short. It must be up to ${LIMITS.description.min} characters.`
        if(value.length > LIMITS.description.max) return `The tool description is too long. It must not be greater than ${LIMITS.description.max} characters.`

        return null
    }, "descriptionError", "descriptionChecker")

    //Tool icon check
    const { iconError, iconChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.icon.required) return `Select the tool icon.`

        return null
    }, "iconError", "iconChecker")

    //Tool youtube check
    const { youtubeError, youtubeChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.youtube.required) return `Enter the tool youtube guide link.`
        if(!nullOrEmpty(value) && value.length < LIMITS.youtube.min) return `The tool youtube guide link is too short. It must be up to ${LIMITS.youtube.min} characters.`
        if(!nullOrEmpty(value) && value.length > LIMITS.youtube.max) return `The tool youtube guide link is too long. It must not be greater than ${LIMITS.youtube.max} characters.`

        return null
    }, "youtubeError", "youtubeChecker");

    //Tool create cost check
    const { createPriceError, createPriceChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.createPrice.required) return `Enter the tool create cost.`
        if(!nullOrEmpty(value) && parseFloat(value) < LIMITS.createPrice.min) return `The tool create cost is too small. It must be up to ${LIMITS.createPrice.min}.`
        if(parseFloat(value) > LIMITS.createPrice.max) return `The tool create cost is too much. It must not be greater than ${LIMITS.createPrice.max}.`

        return null
    }, "createPriceError", "createPriceChecker")

    //Tool update cost check
    const { updatePriceError, updatePriceChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.updatePrice.required) return `Enter the tool create cost.`
        if(!nullOrEmpty(value) && parseFloat(value) < LIMITS.updatePrice.min) return `The tool create cost is too small. It must be up to ${LIMITS.updatePrice.min}.`
        if(parseFloat(value) > LIMITS.updatePrice.max) return `The tool create cost is too much. It must not be greater than ${LIMITS.updatePrice.max}.`

        return null
    }, "updatePriceError", "updatePriceChecker")

    //Tool update cost check
    const { editableError, editableChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.updatePrice.required) return `Enter the tool editables.`
        if(!nullOrEmpty(value) && value.length < LIMITS.editable.min) return `The tool create cost is too short. It must be up to ${LIMITS.editable.min} characters.`
        if(value.length > LIMITS.editable.max) return `The tool create cost is too long. It must not be greater than ${LIMITS.editable.max} characters.`

        return null
    }, "editableError", "editableChecker")

    //Tool update cost check
    const { messageError, messageChecker } = useInputChecker((value: any) => {
        if(nullOrEmpty(value) && LIMITS.message.required) return `Enter the tool after-creation message.`
        if(!nullOrEmpty(value) && value.length < LIMITS.message.min) return `The tool after-creation message is too short. It must be up to ${LIMITS.message.min} characters.`
        if(value.length > LIMITS.message.max) return `The tool after-creation message is too long. It must not be greater than ${LIMITS.message.max} characters.`

        return null
    }, "messageError", "messageChecker")
    
    
    const [ showDownloadFormatOptions, setShowDownloadFormatOptions ] = useState<boolean>()

  
    const [ isWatermarkRemoval, setIsWatermarkRemoval ] = useState<boolean>(false)

    const {
        templatesLoading, templatesError,
        selectedTemplateLoading, selectedTemplateError,
        parsingTemplate,
        templates,
        selectedTemplate,
        selectedTemplateData,
        workingTemplate,
        workingTemplateData, 
        setAsDefaulTemplate,
        setWorkingTemplate, 
        setWorkingTemplateData,
        selectTemplate,
        parseTemplateSvg,
        saveTemplate,
        deleteTemplate,
        currentTemplateId
    } = useTemplates(data.templates_url)
    
    const [ fieldsData, setFieldsData ] = useState<FieldsData>({} as FieldsData)
    useDefaultFieldsValue(fieldsData, setFieldsData, workingTemplateData?.fields, currentTemplateId)

    useEffect(() => {
        //console.log("fieldsData:", fieldsData)
    }, [fieldsData])

    const [ errors, setErrors ] = useState<{ [x: string]: string | null | undefined }>({})
    const [ showErrors, setShowErrors ] = useState<boolean>(false)
    const [ created, setCreated ] = useState<boolean>(false)

    const [ showToolsSettings, setShowToolsSettings ] = useState<boolean>(false)
    const [ toolsSettingsToggled, setToolsSettingsToggled ] = useState<boolean>(false)

    useEffect(() => {
        if(!toolsSettingsToggled) {
            if(Object.keys(templates).length == 0) {
                setShowToolsSettings(true)
    
            } else {
                setShowToolsSettings(false)
            }
        }
    }, [templates])

    const { loadingFonts, error, fonts, setFonts, uploadFonts } = useFonts(workingTemplateData?.svg)

    const [ templateUploadProgressStatus, setTemplateUploadProgressStatus ] = useState<string | null>()

    const handleTemplateUploadStatus = (message: string, pct?: number | null) => {
        setTemplateUploadProgressStatus(message)
    }

    useEffect(() => {
        //console.info("fonts!! ", fonts)
    }, [fonts])

    const handleSubmit = async () => {
        if(!onPublishData) return
        setSaving(true)
        
        const errorPromises = [
            nameChecker().checker(data.name),
            iconChecker().checker(data.icon),
            youtubeChecker().checker(data.youtube),
            createPriceChecker().checker(data.create_price),
            updatePriceChecker().checker(data.update_price),
            editableChecker().checker(data.update_price),
            messageChecker().checker(data.update_price)
        ]

        if((await Promise.all(errorPromises)).includes(false)) {
            setSaving(false)
            Swal.fire({
                title: "Form Error",
                icon: "error",
                text: "You have some errors in your form. Please check the error message(s) at the input(s) and try again."
            })

        } else {
            uploadFonts(handleTemplateUploadStatus)
            .then(() => {
                saveTemplate(handleTemplateUploadStatus)
                .then((templatesUrl) => {
                    if(!templatesUrl) {
                        setSaving(false)
                        return null
                    }

                    var otherData: any = null
                    if(onUpdateData && templatesUrl) {
                        onUpdateData({
                            id: data.id,
                            templates_url: templatesUrl
                        } as Data)
                        otherData = {templates_url: templatesUrl}
                    }

                    setSaving(false)
                    //if(!otherData) return
                    onPublishData(false, null, otherData)
                    .then((data: Data) => {
                        setSaving(false)
                        toast({
                            description: isNew? "New Tool successfully saved." : "Tool successfully updated.",
                            status: "success",
                            duration: 4000,
                            isClosable: true
                        })

                        setShowDownloadFormatOptions(true)
                        //download(data)
                    })
                    .catch((error: any) => {
                        setSaving(false)
                        if((error?.message || "").length > 0) {
                            Swal.fire({
                                icon: "error",
                                title: isNew? "Tool Creation Error" : "Tool Update Error",
                                text: error.message
                            })
                        }
                    })
                })
                .catch((error: any) => {
                    setSaving(false)
                    if((error?.message || "").length > 0) {
                        Swal.fire({
                            icon: "error",
                            title: isNew? "Tool Creation Error" : "Tool Update Error",
                            text: error.message
                        })
                    }
                })
            })
            .catch((error: any) => {
                setSaving(false)
                if((error?.message || "").length > 0) {
                    Swal.fire({
                        icon: "error",
                        title: isNew? "Tool Creation Error" : "Tool Update Error",
                        text: error.message
                    })
                }
            })
        }
    }

    const [ filterEnabled, setFilterEnabled ] = useState<boolean>(false)

    const Fields = useMemo(() => {
        if(!workingTemplateData || templatesLoading) return null
        return (
            <>
                <FieldsInput 
                    isFieldsEditMode
                    created={created}
                    showFieldsErrors={showErrors}
                    fields={workingTemplateData.fields}
                    images={workingTemplateData.images}
                    masks={workingTemplateData.masks}
                    data={fieldsData}
                    isDragable={true}
                    onDragged={(fields, masks) => {
                        setWorkingTemplateData({
                            ...workingTemplateData,
                            fields,
                            ...(masks? { masks } : {}) 
                        })
                    }}
                    onAllFieldsDataChange={setFieldsData}
                    onFieldDataChange={(field, value) => {
                        setFieldsData({
                            ...fieldsData,
                            [field]: value
                        })
                    }}
                    fieldDataErrorMessage={errors}
                    onSetFieldDataErrorMessage={setErrors}
                />
            </>
        )
    }, [ workingTemplateData, created, fieldsData, errors, templatesLoading ])

    const TemplateFonts = useMemo(() => {
        return (
            <>
                {
                    fonts && Object.keys(fonts).length > 0?
                    <SectionSeparator icon={<FaFonticons />} mb={4} />
                    :null
                }
                <FontsInput 
                    isLoading={loadingFonts}
                    fonts={fonts} 
                    onFontsChanged={(fontsUpdate) => {
                        setFonts(fontsUpdate)
                    }} 
                    cssActions={workingTemplateData?.cssActions}
                    onCssActionsChanged={cssActions => {
                        if(workingTemplateData) {
                            setWorkingTemplateData({
                                ...workingTemplateData,
                                cssActions
                            })
                        }
                    }}
                />
            </>
        )
    }, [ fonts, workingTemplateData?.cssActions ])

    useEffect(() => {
        //console.log("setTemplatesLoading.templatesLoading", templatesLoading)
        //console.log("setTemplatesLoading.selectedTemplate", selectedTemplate)
        //console.log("setTemplatesLoading.selectedTemplateLoading", selectedTemplateLoading)
    }, [templatesLoading, selectedTemplate, selectedTemplateLoading])


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
                                New Tool
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
                        <Box bg={useColorValue("cardBg.light", "cardBg.dark")} minH="80vh" w="100%" p={{base: "1rem"}} borderRadius="24px">
                            <Tabs isFitted variant='enclosed'>
                                <TabList mb='1em'>
                                    <Tab>Edit Mode</Tab>
                                    <Tab>View Mode</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        <HStack w="100%" justifyContent="space-between" alignItems="flex-end" borderBottom={showToolsSettings? "none" : "2px solid"} borderBottomLeftRadius="5px" mb={4}>
                                            <CuteButton status="success" leftIcon={showToolsSettings? <FaEye /> : <FaEyeSlash />} onClick={() => {
                                                setToolsSettingsToggled(true)
                                                setShowToolsSettings(!showToolsSettings)
                                            }}>
                                                Tool Settings
                                            </CuteButton>
                                            {
                                                isNew? null : <Link href={`/tool-viewer?id=${data.id}`} isExternal mb={4}>View Tool</Link>
                                            }
                                        </HStack>
                                        {
                                            showToolsSettings?
                                            <>
                                                <SectionSeparator icon={<FaCog />} mt={4} />
                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_name`}
                                                    key={`Form_${data.id}_name`}
                                                    title="Tool name" mb={4}
                                                    placeholder="Enter the name of the tool"
                                                    info="This is what will be shown to the users as the name of the tool. It must be a name that let the user knows what the tool does."
                                                    helperText="Enter the name of the tool. It must be a name that let the user knows what the tool does."
                                                    type={InputBox.TYPES.text}
                                                    value={data.name} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                name: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={nameChecker} 
                                                    errorMessage={nameError}
                                                />

                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_description`}
                                                    key={`Form_${data.id}_description`}
                                                    title="Tool Description" mb={4}
                                                    placeholder="Enter the description of the tool"
                                                    info="This is what will be shown to the users as the description of the tool. It must be a description that doesn't encourage crime."
                                                    helperText="Enter the description of the tool. It must be a description that doesn't encourage crime."
                                                    type={InputBox.TYPES.textarea}
                                                    value={data.description} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                description: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={descriptionChecker} 
                                                    errorMessage={descriptionError}
                                                />

                                                <IconSelector w="100%"
                                                    id={`Form_${data.id}_icon`}
                                                    key={`Form_${data.id}_icon`}
                                                    title="Tool Icon" mb={4}
                                                    placeholder="Select an Icon for the tool"
                                                    info="This is where you select an icon that best represents the tool."
                                                    helperText="Select an icon that best represents the tool."
                                                    type={InputBox.TYPES.text}
                                                    value={data.icon} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                icon: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={iconChecker} 
                                                    errorMessage={iconError}
                                                />

                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_youtube`}
                                                    key={`Form_${data.id}_youtube`}
                                                    title="Tool Youtube(Optional)" mb={4}
                                                    placeholder="Enter the youtube link of the tool"
                                                    info="This is where you enter the youtube video guide link for the tool."
                                                    helperText="Enter the youtube video guide link for the tool."
                                                    type={InputBox.TYPES.text}
                                                    value={data.youtube} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                youtube: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={youtubeChecker} 
                                                    errorMessage={youtubeError}
                                                />

                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_create_price`}
                                                    key={`Form_${data.id}_create_price`}
                                                    title="Create Price($)" mb={4}
                                                    placeholder="Enter the cost of creating a job"
                                                    info="This is where you enter the cost of the tool usage per job."
                                                    helperText="Enter the cost of the tool usage per job."
                                                    type={InputBox.TYPES.number}
                                                    numberDecimals={0}
                                                    value={data.create_price} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                create_price: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={createPriceChecker} 
                                                    errorMessage={createPriceError}
                                                />

                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_update_price`}
                                                    key={`Form_${data.id}_update_price`}
                                                    title="Update Price($)" mb={4}
                                                    placeholder="Enter the cost of updating a job"
                                                    info="This is where you enter the cost of updating a job done with the tool."
                                                    helperText="Enter the cost of updating a job done with the tool."
                                                    type={InputBox.TYPES.number}
                                                    numberDecimals={1}
                                                    value={data.update_price} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                update_price: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={updatePriceChecker} 
                                                    errorMessage={updatePriceError}
                                                />

                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_editables`}
                                                    key={`Form_${data.id}_editables`}
                                                    title="Editable fields" mb={4}
                                                    placeholder="Enter editable fields."
                                                    info="This is where you separate editable fields with commas."
                                                    helperText="Separate editable fields with commas."
                                                    type={InputBox.TYPES.textarea}
                                                    value={data.editables} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                editables: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={editableChecker} 
                                                    errorMessage={editableError}
                                                />

                                                <InputBox w="100%"
                                                    id={`Form_${data.id}_message`}
                                                    key={`Form_${data.id}_message`}
                                                    title="After creation message" mb={1}
                                                    placeholder="Enter after creation message."
                                                    info="This is where you enter the message you want to show after the document is created."
                                                    helperText="Enter the message you want to show after the document is created."
                                                    type={InputBox.TYPES.textarea}
                                                    value={data.message} 
                                                    onChange={(value) => {
                                                        if(onUpdateData) {
                                                            onUpdateData({
                                                                id: data.id,
                                                                message: value
                                                            } as Data)
                                                        }
                                                    }}
                                                    onCheckInfo={messageChecker} 
                                                    errorMessage={messageError}
                                                />
                                            
                                            <SectionSeparator icon={<FaCog />} mb={4} />
                                            </>
                                            : null
                                        }
                                        

                                        <TemplateSelector w="100%"
                                            id={`Form_${data.id}_select_template`}
                                            key={`Form_${data.id}_select_template`}
                                            title="Select Template" mb={4}
                                            helperText="Select a template to edit or add."
                                            info="This is where you select a template to edit or a new template to add"
                                            templates={{
                                                ...templates,
                                                ...(workingTemplate? {[workingTemplate.id]: workingTemplate} : {})
                                            }}
                                            createdTemplatesKeys={Object.keys(templates)}
                                            value={workingTemplate}
                                            onChange={(value) => {
                                                if(value) selectTemplate(value.id)
                                            }}
                                            onDelete={deleteTemplate}
                                            onNewTemplateSvgUploaded={(file, value) => {
                                                if(value) {
                                                    parseTemplateSvg(value, true)
                                                    .then(result => {
                                                        console.log("parsedSvg:parseTemplateSvg", result)
                                                    })
                                                    .catch(e => {
                                                        console.log("parsedSvg:parseTemplateSvg.error", e)
                                                        Swal.fire({
                                                            icon: "error",
                                                            title: "SVG template build error",
                                                            text: e.message
                                                        })
                                                    })
                                                }
                                            }}
                                            onCheckInfo={() => null} 
                                            errorMessage={null}
                                        />

                                        {
                                            !workingTemplate? null 
                                            :
                                            <>
                                                <Box border="1px dashed" p="1rem" borderRadius="5px" mb={4}>
                                                    <InputBox w="100%"
                                                        id={`Form_${data.id}_tmp_name`}
                                                        key={`Form_${data.id}_tmp_name`}
                                                        title="Template Name" mb={4}
                                                        placeholder="Enter the template name"
                                                        info="This is where you enter a name for the template."
                                                        helperText="Enter a name for the template."
                                                        type={InputBox.TYPES.text}
                                                        numberDecimals={1}
                                                        value={workingTemplate.name || ""} 
                                                        onChange={(value) => {
                                                            setWorkingTemplate({
                                                                ...workingTemplate,
                                                                name: value
                                                            })
                                                        }}
                                                        onCheckInfo={updatePriceChecker} 
                                                        errorMessage={updatePriceError}
                                                    />

                                                    <UploadInput 
                                                        isOtherFiles  w="100%" mb={4}
                                                        id={`Form_${data.id}_tmp_logo`}
                                                        key={`Form_${data.id}_tmp_logo`}
                                                        title={`Template Logo`}
                                                        info="This is where you upload a logo for the template."
                                                        helperText="Select a logo for the template."
                                                        thumbnail={workingTemplate.logo}
                                                        message="Drag and Drop image here"
                                                        hoverMessage="Drop the file here"
                                                        ruleMessage="Make sure you're uploading a 70x70 image."
                                                        useImageText="Use Image"
                                                        maxFileSize={1024 * 3}
                                                        onChange={(file, value) => {
                                                            setWorkingTemplate({
                                                                ...workingTemplate,
                                                                logo: value as string
                                                            })
                                                        }}
                                                        onCheckInfo={() => null} 
                                                        errorMessage={null}
                                                    />

                                                    <InputBox w="100%" mb={4}
                                                        id={`Form_${data.id}_tmp_default`}
                                                        key={`Form_${data.id}_tmp_default`}
                                                        title="Set as Default"
                                                        helperText="Enabling this set the template as the default template selected for the user."
                                                        info="This is where you decide if you want this template to be set as the default template selected for the user."
                                                        type={InputBox.TYPES.checkbox}
                                                        value={workingTemplate.is_default || false} 
                                                        onChange={(value) => {
                                                            setAsDefaulTemplate(value)
                                                        }}
                                                        errorMessage={null}
                                                    />

                                                    <InputBox w="100%" mb={4}
                                                        id={`Form_${data.id}_split`}
                                                        key={`Form_${data.id}_split`}
                                                        title="Vertically( | ) Split Document On Download"
                                                        helperText="Enabling this splits the document into 2 equal parts(left and right) when downloading. Great for a front and back document."
                                                        info="This is where you decide if you want the document to split into 2 equal parts(left and right) when downloading. Great for a front and back document."
                                                        type={InputBox.TYPES.checkbox}
                                                        value={workingTemplate.split_on_download || false} 
                                                        onChange={(value: boolean) => {
                                                            setWorkingTemplate({
                                                                ...workingTemplate,
                                                                split_on_download: value
                                                            })
                                                        }}
                                                        errorMessage={null}
                                                    />

                                                    <InputBox w="100%" mb={4}
                                                        id={`Form_${data.id}_split_hr`}
                                                        key={`Form_${data.id}_split_hr`}
                                                        title="Horizontally( --- ) Split Document On Download"
                                                        helperText="Enabling this splits the document into 2 equal parts(up and down) when downloading. Great for a front and back document."
                                                        info="This is where you decide if you want the document to split into 2 equal parts(up and down) when downloading. Great for a front and back document."
                                                        type={InputBox.TYPES.checkbox}
                                                        value={workingTemplate.split_on_download_hr || false} 
                                                        onChange={(value: boolean) => {
                                                            setWorkingTemplate({
                                                                ...workingTemplate,
                                                                split_on_download_hr: value
                                                            })
                                                        }}
                                                        errorMessage={null}
                                                    />
                                                    {TemplateFonts}
                                                </Box>
                                                
                                                {
                                                    templatesLoading || !workingTemplate || selectedTemplateLoading? 
                                                    <LoadingView message={"Loading template assets. Please wait..."} minH="100px" /> 
                                                    :
                                                    <>
                                                    {
                                                        Fields
                                                    }
                                                    </>
                                                }
                                            </>
                                        }

                                        <HowToPay my={2} />
                                    </TabPanel>
                                    <TabPanel p="0px">
                                        <HStack w="100%" justifyContent="flex-end">
                                            <InputBox
                                                id="toggleFilter"
                                                key="toggleFilter"
                                                title="Enable Show Filter on Preview Click" mb={4}
                                                info="This is where you decide if you want filter to show up when the svg preview is clicked."
                                                helperText="Tick this box if you want to show filter when SVG preview is clicked."
                                                type={InputBox.TYPES.checkbox}
                                                value={filterEnabled} 
                                                onChange={enable => {
                                                    setFilterEnabled(enable)
                                                }}
                                            />
                                        </HStack>

                                        <Box bg="#dcdcdc">
                                            <SvgRenderer fonts={fonts} isLoading={isLoading}
                                                width={{base: 512, md: 728/*, lg: 1024*/}} 
                                                data={fieldsData} 
                                                templateData={workingTemplateData}
                                                showWatermark={false} 
                                                onFiltersUpdated={(filters) => {
                                                    //console.log("parsedSvg.maskUpdate: ", filters)
                                                    if(workingTemplateData) {
                                                        setWorkingTemplateData({
                                                            ...workingTemplateData,
                                                            masks: filters
                                                        })
                                                    }
                                                }}
                                                filterEnabled={filterEnabled}
                                            />
                                        </Box>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>

                            <InputBox
                                id="draft"
                                key={`data_${data.id}`}
                                title="Set as Draft" mb={4}
                                info="Setting as draft hides the tool from the user."
                                helperText="Tick this box if you want to hide the tool from the user."
                                type={InputBox.TYPES.checkbox}
                                value={data.isHidden} 
                                onChange={(value) => {
                                    if(onUpdateData) {
                                        onUpdateData({
                                            id: data.id,
                                            isHidden: value
                                        } as Data)
                                    }
                                }}
                            /> 
                            
                            <VStack w="100%" justifyContent="flex-start" alignItems="center" my={8}>
                                {
                                    templateUploadProgressStatus?
                                    <Text as="div" mb={2} fontStyle="italic">{templateUploadProgressStatus}</Text>
                                    : null
                                }

                                <CuteButton status={saving && !isWatermarkRemoval? "loading" : "warning"} 
                                    fontStyle={saving && !isWatermarkRemoval? "italic" : "normal"} 
                                    disabled={saving /*|| !hasPendingSave*/}
                                    w="100%" maxW="400px" h="70px" fontSize="lg" onClick={handleSubmit} 
                                    rightIcon={saving && !isWatermarkRemoval? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                                        {saving && !isWatermarkRemoval? "Please wait..." : isNew? `Create Tool` : `Update Tool`}
                                </CuteButton>
                            </VStack>
                        </Box>
                    </Box>
                </Flex>
            </Card>
        </FormContainer>
    );
};

export default Form;