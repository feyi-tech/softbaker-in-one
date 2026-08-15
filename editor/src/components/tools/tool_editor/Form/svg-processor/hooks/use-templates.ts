import { useEffect, useState } from 'react';
import { 
    MapWithName, Template, TemplateData, Templates, TemplatesResults, genId, mergeTemplateData, orderByName,
    buildTemplateDataFromSvg, 
    arrayToMap,
    removeUpdateQueryString,
    setR2Host
} from 'frontbacked-svg';
import axios from 'axios';
import { uploadTemplates } from '../utils';
import { nullOrEmpty } from '@/root/src/utils/f';
import { useFrontbacked, useTools, rmUpdates } from 'use-frontbacked';
import useUrlQuery from '@/root/src/hooks/useUrlQuery';
import { R2_DOMAIN, USE_FRONTBACKED_CONFIG } from '@/root/src/app-config';


const useTemplates = (templates_url?: string | null, disableDefaultPreload?: boolean): TemplatesResults => {
    const { user } = useFrontbacked()
    const { toolsByTemplatesUrl } = useTools(USE_FRONTBACKED_CONFIG);
    const query = useUrlQuery()
    const [ templatesUrl, setTemplatesUrl ] = useState<string | null>()
    const [ toolId, setToolTd ] = useState<string | null>()
    const [ templates, setTemplates ] = useState<Templates>({})
    const [ templatesLoading, setTemplatesLoading ] = useState<boolean>(false)
    const [ selectedTemplateLoading, setSelectedTemplateLoading ] = useState<boolean>(false)
    const [ parsingTemplate, setParsingTemplate ] = useState<boolean>(false)

    const [ templatesError, setTemplatesError ] = useState<string | null>()
    const [ selectedTemplateError, setSelectedTemplateError ] = useState<string | null>()
    
    const [ selectedTemplate, setSelectedTemplate ] = useState<Template | null>()
    const [ selectedTemplateData, setSelectedTemplateData ] = useState<TemplateData | null>()

    
    const [ workingTemplate, setWorkingTemplate ] = useState<Template | null>()
    const [ workingTemplateData, setWorkingTemplateData ] = useState<TemplateData | null>()

    const [ currentTemplateId, setCurrentTemplateId ] = useState<string>()

    useEffect(() => {
        //console.log("parsedSvg.workingTemplateData: ", workingTemplateData)

    }, [ workingTemplateData ])

    //const toolId = genId(8)
    //uploadTemplates(user, toolId, templates, selectedTemplate, selectedTemplateData)
    //.then((templatesUrl) => {

    const getToolIdFromTemplatesUrl = (url?: string | null) => {
        if(!url) return null
        var afterDash = url.split("-")[1]
        if(afterDash) {
            return afterDash.split(".")[0].trim()
        }
        return null
    }

    const getDefaultTemplateId = (templates: Templates): string => {
        if(Object.keys(templates).length == 1) {
            return Object.keys(templates)[0]

        } else if(query?.tp) {
            return query.tp as string

        } else {
            for(const template of Object.values(templates)) {
                if(template.is_default) return template.id
            }
            return Object.keys(templates)[0]
        }
    }

    const getTemplates = (templates_url: string) => {
        return new Promise((resolve, reject) => {
            if(!toolsByTemplatesUrl)  return resolve([])
            const templates = toolsByTemplatesUrl[rmUpdates(setR2Host(templates_url, R2_DOMAIN))]?.templates || []
            console.log("getTemplates.templates:", templates)
            resolve(templates)
        })
    }

    useEffect(() => {
        if(toolsByTemplatesUrl) {
            //console.log("toolsByTemplatesUrl", toolsByTemplatesUrl)
            const id = getToolIdFromTemplatesUrl(templates_url)
            //console.log("parsedSvg.url: ", templates_url, id)
            if(templates_url && templates_url != templatesUrl && id) {
                /*
                console.log("setTemplatesLoading.1 ", 
                    "templates_url && templates_url != templatesUrl && id", 
                    `${templates_url} && ${templates_url != templatesUrl} && ${id}: ${templatesUrl}`
                )*/
                setTemplatesUrl(templates_url)
                setTemplatesLoading(true)
                setTemplatesError(null)
                
                setToolTd(null)
                setTemplates({})
                setSelectedTemplate(null)
                setSelectedTemplateData(null)
                setWorkingTemplate(null)
                setWorkingTemplateData(null)

                /*
                axios.get(templates_url)
                .then((templates: any) => {
                    setToolTd(id)
                    setTemplates(orderByName(templates.data as MapWithName) as Templates)
                    setTemplatesLoading(false)
                })
                .catch(e => {
                    setTemplatesError(e.message)
                    setTemplatesLoading(false)
                })*/

                getTemplates(templates_url)
                .then((templates: any) => {
                    const templatesMap = arrayToMap("id", templates || [])
                    //console.log("Templates:", templates, templatesMap)
                    setToolTd(id)
                    setTemplates(orderByName(templatesMap as MapWithName) as Templates)
                    setTemplatesLoading(false)
                })
                .catch(e => {
                    setTemplatesError(e.message)
                    setTemplatesLoading(false)
                })

            } else if(!templates_url) {
                setTemplatesUrl(null)
                setTemplatesLoading(false)
                setTemplatesError(null)
                setToolTd(null)
                setTemplates({})
                setSelectedTemplate(null)
                setSelectedTemplateData(null)
                setWorkingTemplate(null)
                setWorkingTemplateData(null)
            }
        }
    }, [templates_url, toolsByTemplatesUrl])

    useEffect(() => {
        if(!disableDefaultPreload && templates && Object.keys(templates).length > 0 && (!selectedTemplate/* || !selectedTemplateData*/)) {
            selectTemplate(getDefaultTemplateId(templates))
            //console.log("setTemplatesLoading.[templates].if")

        } else {
            //console.log("setTemplatesLoading.[templates].else", disableDefaultPreload, Object.keys(templates || {}).length, selectedTemplate)
        }
    }, [templates])

    const MAX_RETRIES = 3;
    const fetchTemplate = (selectedTemplate: Template, retries?: number) => {
        axios.get(setR2Host(selectedTemplate.data_url, R2_DOMAIN))
        .then((selectedTemplateData: any) => {
            setWorkingTemplate({...selectedTemplate})
            setWorkingTemplateData({...selectedTemplateData.data})

            setSelectedTemplate({...selectedTemplate})
            setSelectedTemplateData({...selectedTemplateData.data})
            setSelectedTemplateLoading(false)
        })
        .catch(e => {
            if(!retries || (retries || 0) < MAX_RETRIES) {
                fetchTemplate(selectedTemplate, (retries || 0) + 1)

            } else {
                setSelectedTemplateError(e.message)
                setSelectedTemplateLoading(false)
            }
        })
    }

    const selectTemplate = (selectedTemplateId: string, retries?: number) => {
        if(retries && retries)
        setCurrentTemplateId(selectedTemplateId)
        const selectedTemplate = templates[selectedTemplateId]
        if(selectedTemplate && !nullOrEmpty(selectedTemplate.data_url)) {
            setSelectedTemplateLoading(true)
            setSelectedTemplateError(null)

            fetchTemplate(selectedTemplate)
        }
    }

    const setAsDefaulTemplate = ( is_default: boolean ): void => {
        if(workingTemplate) {
            setWorkingTemplate({
                ...workingTemplate,
                is_default: is_default
            })
            //if(templates[workingTemplate.id]) templates[workingTemplate.id].is_default = is_default

            //Set all the other templates's is_default to false to prevent having more than 1 template set as the default
            if(is_default && Object.keys(templates).length > 1) {
                for(const id of Object.keys(templates)) {
                    if(id != workingTemplate.id) templates[id].is_default = false
                }
                setTemplates(templates)
            }
        }

    }

    const deleteTemplate = (id: string) => {
        if(!Object.keys(templates).includes(id) && workingTemplate?.id == id) {
            selectTemplate(getDefaultTemplateId(templates))
        }
    }

    const parseTemplateSvg = (svg: string, isNew: boolean): Promise<{template: Template, templateData: TemplateData} | null> => {
        setParsingTemplate(true)
        return new Promise((resolve, reject) => {
            buildTemplateDataFromSvg(svg)
            .then(result => {
                
                //console.log("parsedSvg2:result.ok!!!: ", result)
                if(result) {
                    var selected = selectedTemplate
                    var selectedData = selectedTemplateData
                    if(isNew) {
                        selected = null
                        selectedData = null
                    }
                    mergeTemplateData(R2_DOMAIN, result, selectedData)
                    .then(mergedTemplateData => {
                        const mergedTemplate = {
                            id: selected?.id || genId(8),
                            name: selected?.name || "",
                            logo: selected?.logo || "",
                            data_url: selected?.data_url || "",
                            is_default: selected?.is_default || false,
                            split_on_download: selected?.split_on_download || false,
                            split_on_download_hr: selected?.split_on_download_hr || false
                        }

                        setWorkingTemplate(mergedTemplate)
                        setWorkingTemplateData(mergedTemplateData)

                        //setSelectedTemplate(mergedTemplate)
                        //setSelectedTemplateData(mergedTemplateData)

                        setParsingTemplate(false)
                        resolve({
                            template: mergedTemplate,
                            templateData: mergedTemplateData
                        })

                    })
                    .catch(e => {
                        setParsingTemplate(false)
                        reject(e)
                    })
                    
                } else {
                    setParsingTemplate(false)
                    resolve(null)
                }
            })
            .catch(e => {
                //console.info("parsedSvg:result.error!!!: ", e)
                setParsingTemplate(false)
                reject(e)
            })
        })
    }

    const onTemplateUpdate = (template: Template, templateData: TemplateData) => {
        setWorkingTemplate(template)
        setWorkingTemplateData(templateData)
    }
    const saveTemplate = (onSetProgressStatus?: (message: string, pct?: number | null) => void): Promise<string | null> => {
        return new Promise((resolve, reject) => { 
            if(!user) return reject(new Error("Please sign in"))
            if(!workingTemplate || !workingTemplateData) return reject(new Error("No template provided yet."))
            uploadTemplates(
                user, 
                toolId || genId(8), 
                templates, 
                workingTemplate, 
                workingTemplateData, 
                selectedTemplate, 
                selectedTemplateData,
                templatesUrl,
                onTemplateUpdate,
                onSetProgressStatus
            )
            .then(url => {
                if(url) {
                    setTemplatesUrl(url)
                    const id = getToolIdFromTemplatesUrl(url)
                    setToolTd(id)
                    setTemplates({...templates, [workingTemplate.id]: workingTemplate})
                    setSelectedTemplate(workingTemplate)
                    setSelectedTemplateData(workingTemplateData)//
                    setWorkingTemplate(workingTemplate)//
                    setWorkingTemplateData(workingTemplateData)
                }
                resolve(url)
            })
            .catch(reject)
        })
        
        
    }

    return {
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
        getDefaultTemplateId,
        currentTemplateId
    }
}

export default useTemplates