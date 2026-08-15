import React, { useEffect, useMemo, useState } from 'react';
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
import { FormType } from '../types';
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
import { FaFileDownload, FaInfoCircle, FaEnvelopeOpenText, FaEraser, FaFileInvoiceDollar, FaEye, FaEyeSlash, FaCog, FaFileImage, FaExternalLinkAlt } from 'react-icons/fa';
import { R2_DOMAIN, TEMP_TOOL_FORM_ID } from '@/root/src/app-config';
import useColorValue from '@/root/src/hooks/useColorValue';
import FormContainer from '../../FormContainer';
import Quote from '../../../widgets/Quote';
import DocContainer from '../../../widgets/ToolsElements/DocContainer';
import { parseContactLink } from '../../toolsFunc';
import { useSoftBaker } from 'use-softbaker';
import TemplateSelector from '../../../widgets/ToolsElements/TemplateSelector';
import LoadingView from '../../../widgets/LoadingView';
import FieldsInput from '../../tool_viewer_data_stream/core/svg-processor/FieldsInput';
import SvgRenderer from '../../tool_viewer_data_stream/core/svg-processor/SvgRenderer';
import ICONS from '../../../widgets/ToolsElements/IconSelector/icons';
import DownloadFormatButton from '../../../widgets/ToolsElements/DownloadFormatButton';
import useFonts from '../../tool_viewer_data_stream/core/svg-processor/hooks/use-fonts';
import useDefaultFieldsValue from '../../tool_viewer_data_stream/core/svg-processor/hooks/use-default-fields-value';
import HowToPay from '../../HowToPay';
import { getStatusColor } from '../../../shipview/utils';
import { 
    Fields, FieldsData, TemplatesResults, downloadSvgAsImage, splitElementNameWithDirective, splitSvgElementId, valueOfParseValue 
} from 'softbaker-svg';


const getDirectivesValues = (data?: FieldsData | null, fields?: Fields): string[] => {
    if(!data) return []
    const directivesValues = []

    for(const [key, value] of Object.entries(data)) {
      const { name, type } = splitSvgElementId(key)
      const { directive } = splitElementNameWithDirective(name || "")
      if(directive) directivesValues.push(valueOfParseValue(key, value, data, fields))
    }

    return directivesValues
}

function parseTextToObject(inputText: string) {
    const lines: string[] = inputText.split('\n'); // Split the input by lines
    const result: {[x: string]: any} = {};
    const tempResult: {[x: string]: string} = {}; // Temporary object to hold intermediate values

    lines.forEach(line => {
        const [key, value] = line.split(' == '); // Split each line by ' == '
        if (key === 'CONTENT') {
            // For the CONTENT key, defer processing until all keys are resolved
            tempResult[key] = value;
        } else {
            result[key] = value;
        }
    });

    // Process CONTENT after all other keys are resolved
    if (tempResult.CONTENT) {
        const parsedValue = tempResult.CONTENT.replace('{LINK}', result.LINK);
        result.CONTENT = () => (
            <Text as="div" fontSize="13px">
                {parsedValue.split(result.LINK).map((chunk, index, arr) => (
                    <>
                        {chunk}
                        {index < arr.length - 1 && (
                            <Text
                                as="a"
                                color={getStatusColor("warning")}
                                href={`${!result.LINK.startsWith("https://") && !result.LINK.startsWith("http://")? "https://" : ""}${result.LINK}`}
                                target="_blank"
                                fontWeight="bold"
                                textDecoration="underline"
                            >
                                { result.LINK }
                            </Text>
                        )}
                    </>
                ))}
            </Text>
        );
    }

    return result;
}

const Form: React.FC<FormType> = ({
    tool, templatesResults,
    data, isNew, onUpdateData, onPublishData,
    saving, setSaving, hasPendingSave, collectionName, publishTexts, initData
}) => {
    if (!data) return null;
    const toast = useToast()
    const { user, sdkConfig } = useSoftBaker()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ hasDownloaded, setHasDownloaded ] = useState<boolean>(false)

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
        getDefaultTemplateId,
        currentTemplateId
    } = templatesResults || {} as TemplatesResults

    const { error, fonts, setFonts, uploadFonts } = useFonts(selectedTemplateData?.svg)
    
    const [ errors, setErrors ] = useState<{ [x: string]: string | null | undefined }>({})
    const [ showErrors, setShowErrors ] = useState<boolean>(true)
    const [ created, setCreated ] = useState<boolean>(false)
    const [ showDownloadFormatOptions, setShowDownloadFormatOptions ] = useState<boolean>()
    const [ showFrontOrBackOptions, setShowFrontOrBackOptions ] = useState<boolean>()
    const [ selectedSide, setSelectedSide ] = useState<"front" | "back" | "front_hr" | "back_hr">()

    useEffect(() => {
        if(selectedTemplate?.split_on_download && !selectedSide) {
            setSelectedSide("front")

        } else if(selectedTemplate?.split_on_download_hr && !selectedSide) {
            setSelectedSide("front_hr")
        }

    }, [selectedTemplate?.split_on_download, selectedTemplate?.split_on_download_hr])
    
    const onSetDefault = (fieldsData: FieldsData) => {
        if(isNew && initData) {
            initData(fieldsData)
        }
    }
    useDefaultFieldsValue(data, onSetDefault, selectedTemplateData?.fields, currentTemplateId)

    useEffect(() => {

        //console.log("textGenCodeParser.data:", data)

    }, [data])

    const imageName = (imageKey: string) => {
        return imageKey.includes("faceshot")? `passport photograph.` : imageKey.includes("sign")? `signature` : `image`
    }
    const checkLocalImage = (key: string, value: string, dataId: string): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            if(!value) {
                const error = `${key}:Invalid ${imageName(key)}`
                resolve(error)

            } else if(!getFileFieldFile("other_tools_data", dataId, key)) {
                const name = imageName(key)
                const error = `${key}:The ${name} was not found on this browser. Please provide the ${name} again.`
                resolve(error)

            } else {
                setErrors({
                    ...errors,
                    [key]: ""
                })
                resolve(null)
            }
        })
    }

    const download = async (data: FieldsData, format: string, highQuality: boolean) => {
        //console.info("parsedSvg.SVGG1: ")
        if(isLoading || !selectedTemplateData) return
        //console.info("parsedSvg.SVGG2: ")

        if(!user) return
        
        //Check if the files still exists
        const errorPromises = [
        ]

        for(const imageKey of Object.keys(data)) {
            if(imageKey.endsWith(".sign") || imageKey.endsWith(".faceshot")) {
                //console.log("imageKey:", imageKey)
                errorPromises.push(
                    checkLocalImage(imageKey, data[imageKey], data.id)
                )
            }
        }

        const errorsCheck = (await Promise.all(errorPromises)).filter(result => result != null)
        //console.log("imageKey:errorsCheck", errorsCheck)
        if(errorsCheck.length > 0) {
            const errs: {[x: string]: string} = {}
            for(const err of errorsCheck) {
                const errSplit = err.split(":")
                errs[errSplit[0]] = errSplit[1]
            }
            setErrors({
                ...errors,
                ...errs
            })
            Swal.fire({
                title: "Download Error",
                text: "Check your upload fields to fix some missing files affecting your download.",
                icon: "error"
            })
            return
        }

        setIsLoading(true)
        
        const splits = (selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) === true
        highQuality = highQuality && !data.is_freemium
        const size = highQuality? (splits? 2048 : 1024) : splits? 1024 : 728
        //const size = highQuality? ((selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) === true && !data.is_freemium? 2048 : 1024) : 728
        //console.log("Size: ", size, selectedTemplate?.split_on_download === true, !data.is_freemium)
        
        SvgRenderer.getSvg(R2_DOMAIN, data, selectedTemplateData, fonts, data.is_freemium, size)
        .then(svg => {
            //console.log("formatDate.SVG2: ", svg, tool)
            toast({
                description: `Your ${tool?.name || "item"} will download shortly.`,
                status: "info",
                duration: 4000,
                isClosable: true
            })
            //console.log("formatDate.SVG2:1")
            downloadSvgAsImage(
                svg, format, 
                `${textToFilename(`${tool?.name || "item"}-${getDirectivesValues(data, selectedTemplateData?.fields).join("_")}`)}-${(new Date()).toISOString()}`,
                (selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) && selectedSide? selectedSide : undefined
            )
            .then(base64ImageUrl => {
                //console.log("formatDate.SVG2:2")
                //console.log("parsedSvg.SVGG3: ")
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
        })
        .catch(e => {
            //If we got here, it means the internet connection of the browser might not be string enough to get the file
            //So we fallback to generating on the server
            SvgRenderer.downloadSvgResultFromServer(
                user, data, format, "other_tools_data", 
                `${textToFilename(`${tool?.name || "item"}-${getDirectivesValues(data, selectedTemplateData?.fields).join("_")}`)}-${(new Date()).toISOString()}`,
                (selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) && selectedSide? selectedSide : undefined, 
                size
            )
            .then(result => {
                toast({
                    description: `Your ${tool?.name || "item"} will download shortly.`,
                    status: "info",
                    duration: 4000,
                    isClosable: true
                })
                setIsLoading(false)
                setHasDownloaded(true)
                setTimeout(() => {
                    setHasDownloaded(false)
                }, 8000);                
    
            })
            .catch(e => {
                setIsLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: "Download Error",
                    text: e.message
                })
            })
        })
    }
  
    const [ isWatermarkRemoval, setIsWatermarkRemoval ] = useState<boolean>(false)
    const dataOnlySubmit = (data: FieldsData) => {
        if(!onPublishData) return
        setSaving(true)

        var onlyData = data? JSON.parse(JSON.stringify(data)) : { }
        if(onlyData.id) delete onlyData.id
        if(!data.is_freemium && Object.keys(onlyData).length == 1) setIsWatermarkRemoval(true)
        const isWaRemoval = !data.is_freemium && Object.keys(onlyData).length == 1

        onPublishData(false, data as any)
        .then((data: FieldsData) => {
            setSaving(false)

            Swal.fire({
                icon: "success",
                title: "Success",
                text: isWaRemoval? 
                "Watermark successfully removed." 
                : 
                `${tool?.name || "Item"} successfully updated.`
            })
            setIsWatermarkRemoval(false)
        })
        .catch((error: any) => {
            setSaving(false)
            setIsWatermarkRemoval(false)

            if((error?.message || "").length > 0) {
                Swal.fire({
                    icon: "error",
                    title: isNew? `${tool?.name || "Item"} Creation Error` : `${tool?.name || "Item"} Update Error`,
                    text: error.message
                })
            }
        })
    }

    useEffect(() => {
        if(selectedTemplate && onUpdateData) {/*
            onUpdateData({
                id: data.id,
                template_id: selectedTemplate.id
            } as FieldsData)*/
        }
    }, [selectedTemplate])

    useEffect(() => {
        if(!isNew && data && templates && selectedTemplate?.id != data.template_id) {
            selectTemplate(data.template_id)

        } else if(isNew && templates && !selectedTemplate) {
            selectTemplate(getDefaultTemplateId(templates))
        }
    }, [templates, data, isNew])
    
    const getErrors = () => {
        setErrors({})
        if(!selectedTemplateData?.fields) {
            return {
                all: [],
                compulsory: []
            }

        } else {
            const errors: { [x: string]: string | null | undefined } = {}
            const errorNames: string[] = []
            const compulsory: string[] = []
            const typeActions: { [x: string]: string } = {text: "provided", sign: "provided", image_upload: "uploaded", faceshot: "uploaded"}
            for(const field of Object.values(selectedTemplateData.fields)) {
                //console.log("parsedSvg:hasErrors: ", field.id, " | ", field.type, " | ", data[field.id])
                if(!data[field.id] && !["qrcode", "gen", "checkbox"].includes(field.type)) {
                    errors[field.id] = `No ${field.name} ${typeActions[field.type] || "provided"}.`
                    errorNames.push(field.name)
                    if(compulsory.length < 2) {
                        const { name, type } = splitSvgElementId(field.id)
                        const { directive } = splitElementNameWithDirective(name || "")
                        if(["name", "desc"].includes(directive)) {
                            compulsory.push(field.name)
                        }
                    }
                }
            }
            setErrors(errors)
            return {
                all: errorNames,
                compulsory
            }
        }
    }
    const handleSubmit = async () => {
        if(!onPublishData || !selectedTemplate) return
        setSaving(true)
        
        const errors = getErrors()

        if(errors.compulsory.length > 0) {
            setSaving(false)
            Swal.fire({
                title: "Form Entry Error",
                icon: "error",
                text: 
                errors.compulsory.length == 1?
                `${errors.compulsory[0]} cannot be empty!`
                :
                `${errors.compulsory.join(", ")} cannot be empty.`
            })

        } else if(errors.all.length > 0) {
            setSaving(false)
            Swal.fire({
                title: "Some fields are not provided",
                icon: "warning",
                text: 
                errors.all.length == 1?
                `No ${errors.all[0]} provided! Are you sure you want to create the ${tool?.name || "item"} without it?`
                :
                `Are you sure you want to create the ${tool?.name || "item"} without providing them? The affected fields are ${errors.all.join(", ")}.`,
                showCancelButton: true,
                confirmButtonText: "Yes, Contine",
                cancelButtonText: "No"
            })
            .then(result => {
                if(result.isConfirmed) {
                    setSaving(true)
                    finalSubmit()
                }
            })

        } else {
            finalSubmit()
        }
    }

    const finalSubmit = () => {
        if(onPublishData) {
            const others = !data.template_id? { template_id: selectedTemplate?.id } as FieldsData : undefined
            onPublishData(false, null, others as any)
            .then((data: FieldsData) => {
                setSaving(false)
                toast({
                    description: isNew? publishTexts?.saveSuccess || "New Item successfully saved." : publishTexts?.updateSuccess || "Item successfully updated.",
                    status: "success",
                    duration: 4000,
                    isClosable: true
                })

                //console.log("finalSubmit", selectedTemplate, selectedTemplate?.split_on_download === true)
                if((selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) === true) {
                    setShowFrontOrBackOptions(true)

                } else {
                    setShowDownloadFormatOptions(true)
                }
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

        } else {
            setSaving(false)
        }
    }

    const Fields = useMemo(() => {
        if(!selectedTemplateData) return null
        return <FieldsInput 
            isFieldsEditMode={false}
            created={!isNew}
            editableFields={((tool?.editables as any) as string || "").split(",").map((edt: string) => edt.trim())}
            showFieldsErrors={showErrors}
            fields={selectedTemplateData.fields}
            images={selectedTemplateData.images}
            masks={selectedTemplateData.masks}
            data={data}
            isDragable={false}
            onAllFieldsDataChange={(allData) => {
                //console.log("useFieldsData.onAllFieldsDataChange", allData, "data", data)
                if(onUpdateData) {
                    onUpdateData({
                        //id: data.id,
                        //...(data || {}),
                        ...(allData || {})
                    } as FieldsData)
                }
            }}
            onFieldDataChange={(field, value) => {
                console.log("onSettingsUpdated.3.onFieldDataChange", field, value)
                if(onUpdateData) {
                    onUpdateData({
                        id: data.id,
                        //...(data || {}),
                        [field]: value
                    } as any)
                }
            }}
            fieldDataErrorMessage={errors}
            onSetFieldDataErrorMessage={setErrors}
        />
    }, [ selectedTemplateData, isNew, showErrors, data, onUpdateData ])

    const afterCreateInfo = useMemo(() => {
        if(tool?.message && data.id != TEMP_TOOL_FORM_ID) {
            const textToObject = parseTextToObject(tool?.message)

            return (
                <VStack>
                    <HStack flexWrap="wrap" justifyContent="space-between" width="100%">
                        {
                            textToObject.ID_TITLE?
                            <HStack flexWrap="wrap">
                                <Text as="div" m="0px !important" mr={1}>
                                    { textToObject.ID_TITLE }:{" "}
                                </Text>
                                <CopyView fontWeight="bold" m="0px !important" mr={2} onCopyMessage={`${textToObject.ID_TITLE} copied.`}>{data.id}</CopyView>
                            </HStack>
                            :
                            <Box></Box>
                        }
                        {
                            textToObject.LINK?
                            <CuteButton as="a" href={`${!textToObject.LINK.startsWith("https://") && !textToObject.LINK.startsWith("http://")? "https://" : ""}${ textToObject.LINK }`} target="_blank" bg={getStatusColor("warning")} rightIcon={<FaExternalLinkAlt />}>
                                Visit { textToObject.LINK }
                            </CuteButton>
                            :
                            <Box></Box>
                        }
                        
                    </HStack>
                    {
                        textToObject.CONTENT? textToObject.CONTENT() : null
                    }
                </VStack>
            )

        } else {
            return null
        }
    }, [ tool, data ])

    return (
        <FormContainer tool={tool} maxHeaderWidth="100%">
            <Card w="100%" maxW="100%" h="auto">
                {
                    data.id != TEMP_TOOL_FORM_ID?
                    <>
                        { afterCreateInfo }
                    </>
                    :
                    <VStack alignItems="flex-start">
                        <HStack flexWrap="wrap" justifyContent="flex-start" alignItems="center">
                            {tool?.icon? ICONS[tool?.icon].element({}) : <FaFileImage />}{" "}
                            <Text as="div" m="0px !important" mr={1}>
                                { `New ${tool?.name || "Document"}` }
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
                                        {
                                            isNew && templates && !templatesLoading && selectedTemplate && !selectedTemplateLoading/*&& Object.keys(templates).length > 1*/?
                                            <TemplateSelector w="100%"
                                                id={`Form_${data.id}_select_template`}
                                                key={`Form_${data.id}_select_template`}
                                                title={`${tool?.name || "Document"} Type`} mb={4}
                                                helperText={`Select the type of ${tool?.name || "Document"} you want.`}
                                                info={`This is where you select the type of ${tool?.name || "Document"} you want.`}
                                                templates={templates}
                                                createdTemplatesKeys={Object.keys(templates)}
                                                value={workingTemplate}
                                                onChange={(value) => {
                                                    if(value) selectTemplate(value.id)
                                                }}
                                                onCheckInfo={() => null} 
                                                errorMessage={null}
                                                contactLink={
                                                    sdkConfig?.contact_link?
                                                    parseContactLink(sdkConfig?.contact_link, `Hello. I can't find the type of ${tool?.name || "Document"} I want on softbaker.`)
                                                    : null
                                                }
                                            />
                                            : null
                                        }

                                        {
                                            templatesLoading || !selectedTemplate || selectedTemplateLoading? 
                                            <LoadingView message={"Loading template assets. Please wait..."} minH="100px" /> 
                                            :
                                            <>
                                            {
                                                Fields
                                            }
                                            </>
                                        }

                                        <HowToPay my={2} />
                                    </TabPanel>
                                    <TabPanel bg="#dcdcdc" p="0px">
                                        <DocContainer 
                                        width="100%" message="Drag around to view the whole tool" 
                                        height={{base: 500, md: 728, lg: 1024}} 
                                            pos="relative" 
                                            overflowX="hidden"
                                            overflowY="hidden">
                                                <SvgRenderer fonts={fonts} isLoading={isLoading}
                                                    width={{base: 512, md: 728/*, lg: 1024*/}} 
                                                    data={data} 
                                                    templateData={workingTemplateData}
                                                    showWatermark={!data.is_freemium? false : true} 
                                                />
                                        </DocContainer>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>

                            <VStack w="100%" justifyContent="flex-start" alignItems="center" my={8}>
                                {
                                    !isNew && (tool?.editables || "").length == 0? null :
                                    <CuteButton status={saving && !isWatermarkRemoval? "loading" : "warning"} 
                                        fontStyle={saving && !isWatermarkRemoval? "italic" : "normal"} 
                                        disabled={saving || !hasPendingSave || (templatesLoading || !selectedTemplate || selectedTemplateLoading)}
                                        w="100%" maxW="400px" h="70px" fontSize="lg" onClick={handleSubmit} 
                                        rightIcon={saving && !isWatermarkRemoval? <Loading size="1rem" color="#fff" type={Loading.TYPES.threeDots} /> : null}>
                                            {saving && !isWatermarkRemoval? "Please wait..." : isNew? `Create ${tool?.name || "Item"}` : `Update ${tool?.name || "Item"}`}
                                    </CuteButton>
                                }

                                {
                                    !((selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) === true)? null
                                    :
                                    <DownloadFormatButton title="Select Side"
                                    showDownloadFormatOptions={showFrontOrBackOptions} 
                                    setShowDownloadFormatOptions={setShowFrontOrBackOptions}
                                    status={isLoading || saving? "loading" : "warning"} outlined
                                    fontStyle={isLoading || saving? "italic" : "normal"} disabled={isLoading || saving || (templatesLoading || !selectedTemplate || selectedTemplateLoading)}
                                    w="100%" maxW="400px" h="70px" fontSize="lg" 
                                    downloadFormats={[
                                        {title: "Front Side", format: selectedTemplate?.split_on_download? "front" : "front_hr"},
                                        {title: "Back Side", format: selectedTemplate?.split_on_download? "back" : "back_hr"}
                                    ]}
                                    onDownloadButtonClick={() => {
                                        if(isNew) {
                                            Swal.fire({
                                                icon: "error",
                                                title: "Download error",
                                                text: `You're yet to create the ${tool?.name || "Item"}. Create the ${tool?.name || "Item"} first, then download.`
                                            })
                                            return false
                                        } else {
                                            return true
                                        }
                                    }} 
                                    onFormatSelected={(side) => {
                                        setSelectedSide((side.format as any) as ("front" | "back" | "front_hr" | "back_hr"))
                                        setShowDownloadFormatOptions(true)
                                    }}
                                    rightIcon={<FaFileDownload />}>
                                        {isLoading || saving? "Please wait..." : `Download ${tool?.name || "Item"}`}
                                    </DownloadFormatButton>
                                }

                                <DownloadFormatButton key="formats" hideButton={(selectedTemplate?.split_on_download || selectedTemplate?.split_on_download_hr) === true}
                                showDownloadFormatOptions={showDownloadFormatOptions} 
                                setShowDownloadFormatOptions={setShowDownloadFormatOptions}
                                status={isLoading || saving? "loading" : "warning"} outlined
                                fontStyle={isLoading || saving? "italic" : "normal"} disabled={isLoading || saving || (templatesLoading || !selectedTemplate || selectedTemplateLoading)}
                                w="100%" maxW="400px" h="70px" fontSize="lg" 
                                downloadFormats={[
                                    {title: "Download as JPEG image", format: "jpeg"},
                                    {title: "Download as PNG image", format: "png"},
                                    {title: "Download as PDF", format: "pdf"},
                                ]}
                                onDownloadButtonClick={() => {
                                    if(isNew) {
                                        Swal.fire({
                                            icon: "error",
                                            title: "Download error",
                                            text: `You're yet to create the ${tool?.name || "Item"}. Create the ${tool?.name || "Item"} first, then download.`
                                        })
                                        return false
                                    } else {
                                        return true
                                    }
                                }} 
                                onFormatSelected={(format) => {
                                    Swal.fire({
                                        icon: "info",
                                        title: "Choose Download Quality",
                                        text: `Select "High Quality" if your internet connection is fast and stable. Select "Medium Quality" if your internet connection is slow or unstable`,
                                        showCancelButton: true,
                                        confirmButtonText: "High Quality",
                                        cancelButtonText: "Medium Quality"
                                    })
                                    .then(result => {
                                        if(result.isConfirmed) {
                                            download(data, format.format, true)

                                        } else {
                                            download(data, format.format, false)
                                        }
                                        
                                    })
                                }}
                                rightIcon={<FaFileDownload />}>
                                    {isLoading || saving? "Please wait..." : `Download ${tool?.name || "Item"}`}
                                </DownloadFormatButton>

                                {
                                    hasDownloaded?
                                    <Quote status="success">
                                        Check your download folder for the downloaded {tool?.name || "Item"}.
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
                                        } as any)
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