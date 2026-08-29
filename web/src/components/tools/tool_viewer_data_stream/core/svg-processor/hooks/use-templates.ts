import { useEffect, useState } from 'react';
import { 
    MapWithName, Template, TemplateData, Templates, TemplatesResults, genId, mergeTemplateData, orderByName,
    buildTemplateDataFromSvg, 
    arrayToMap,
    removeUpdateQueryString,
    setR2Host
} from 'softbaker-svg';
import axios from 'axios';
import { nullOrEmpty } from '@/root/src/utils/f';
import { useSoftBaker, useTools, rmUpdates } from 'use-softbaker';
import useUrlQuery from '@/root/src/hooks/useUrlQuery';
import { R2_DOMAIN, USE_SOFTBAKER_CONFIG } from '@/root/src/app-config';


const useTemplates = (templates_url?: string | null, disableDefaultPreload?: boolean): TemplatesResults => {
    const { user } = useSoftBaker()
    const { toolsByTemplatesUrl } = useTools(USE_SOFTBAKER_CONFIG);
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
            //console.log("toolsByTemplatesUrl.GotHere", toolsByTemplatesUrl, rmUpdates(templates_url), toolsByTemplatesUrl[rmUpdates(templates_url)])
            const templates = toolsByTemplatesUrl[rmUpdates(setR2Host(templates_url, R2_DOMAIN))]?.templates || []
            resolve(templates)
        })
    }

    const getTemplateDataUrl = (url: string) => {
        try {
            const parsedUrl = new URL(setR2Host(url, R2_DOMAIN));
            parsedUrl.searchParams.set("r2_cors", "1");
            return parsedUrl.toString();
        } catch (err) {
            return url;
        }
    }

    useEffect(() => {
        if(toolsByTemplatesUrl) {
            //console.log("toolsByTemplatesUrl", toolsByTemplatesUrl)
            const id = getToolIdFromTemplatesUrl(templates_url)
            //console.log("parsedSvg.url: ", templates_url, id)
            if(templates_url && templates_url != templatesUrl && id) {
                
                setTemplatesUrl(templates_url)
                setTemplatesLoading(true)
                setTemplatesError(null)
                
                setToolTd(null)
                setTemplates({})
                setSelectedTemplate(null)
                setSelectedTemplateData(null)
                setWorkingTemplate(null)
                setWorkingTemplateData(null)

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

        axios.get(getTemplateDataUrl(selectedTemplate.data_url))
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
        getDefaultTemplateId,
        currentTemplateId
    }
}

export default useTemplates
