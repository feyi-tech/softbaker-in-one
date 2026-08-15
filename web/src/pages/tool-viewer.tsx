import { CURRENCY_SYMBOL, Tool, USE_SOFTBAKER_CONFIG } from '@/app-config'
import ToolView from '../components/tools';
import Form from '../components/tools/tool_viewer/Form';
import { getDefaultData } from '../components/tools/tool_viewer/func';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/tool_viewer/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { Message } from '../components/shipview/types';
import useTemplates from '../components/tools/tool_viewer_data_stream/core/svg-processor/hooks/use-templates';
import useUrlQuery from '../hooks/useUrlQuery';
import LoadingView from '../components/widgets/LoadingView';
import { 
  splitElementNameWithDirective, splitSvgElementId, Fields, FieldsData, valueOfParseValue,
  isBrowser
} from 'softbaker-svg';
import { useTools } from 'use-softbaker';
import useLogger, { LOGGER_LOG_TYPES } from '../components/tools/tool_viewer_data_stream/core/svg-processor/hooks/useLogger';


const alt = (msg: any) => {/*
  if(isBrowser()) {
    window.alert(msg)
  }*/
}

const ToolViewer = () => {
  const collectionName = "other_tools_data"
  const historySize = 20
  const dataSize = 50

  alt("1")

  const { logger } = useLogger()

  alt("2")

  const query = useUrlQuery()
  alt("3")
  const { toolsById, getTool, loading, error } = useTools(USE_SOFTBAKER_CONFIG)
  alt("4")

  const [ dynamicToolsId, setDynamicToolId ] = useState<string | null>()
  const [ tool, setTool ] = useState<Tool | null>({} as Tool)

  const [ fileFields, setFileFields ] = useState<string[]>([])
  alt("5")
  const templates = useTemplates(tool?.templates_url, true)
  alt("6")

  const [ fields, setFields ] = useState<Fields>()
  
  //logger(`/tool-viewer => url: ${window.location.href}`, LOGGER_LOG_TYPES.info)
  alt("7")
  
  useEffect(() => {
    if(templates.selectedTemplateData?.fields) {
      setFields(templates.selectedTemplateData.fields)
      const fields = []
      for(const field of Object.values(templates.selectedTemplateData.fields)) {
        if(["image_upload", "sign", "faceshot"].includes(field.type)) {
          fields.push(field.id)
        }
      }
      setFileFields(fields)
    }
  }, [ templates.selectedTemplate ])

  useEffect(() => {
    logger(`/tool-viewer => url: ${window.location.href} | query: ${JSON.stringify(query || {})}`, LOGGER_LOG_TYPES.info)
  }, [])

  useEffect(() => {
    alt(query? query.id : "No Query")
    alt(query?.id)
    if(query?.id) {
      setDynamicToolId(query?.id as string)
    }
    logger(`/tool-viewer => query: ${JSON.stringify(query)}`, LOGGER_LOG_TYPES.info)
  }, [query])

  useEffect(() => {
    if(toolsById && !loading /*&& !error*/ && dynamicToolsId) {
      const tool = getTool(dynamicToolsId)
      if(tool) {
        setTool({
          ...(tool as any),
          collectionRuleName: collectionName,
        })

      } else {
        //setTool(null)
        logger(`/tool-viewer => No tool found with the dynamicToolsId, ${dynamicToolsId || ""}`, LOGGER_LOG_TYPES.error)
      }

    } else {
      //setTool(null)
    }

    const tool = getTool(dynamicToolsId || "")
    logger(`/tool-viewer => hasToolsById: ${toolsById? "yes" : "no"} | toolName: ${(toolsById || {})[dynamicToolsId || ""]?.name} | toolsLoading: ${loading} | toolsLoadError: ${error} | dynamicToolsId: ${dynamicToolsId}} | getTool: ${JSON.stringify(tool || {})} | collectionName: ${collectionName}`, LOGGER_LOG_TYPES.info)
  }, [toolsById, loading, error, dynamicToolsId])

  useEffect(() => {
    logger(`/tool-viewer => tool:: ${tool? JSON.stringify(tool) : "Null"}`, LOGGER_LOG_TYPES.info)
  }, [tool])

  const historyProps = useHistory(historySize)
  const {
    getCurrentTimelineData
  } = historyProps;

  const getDefault = useCallback(getDefaultData, [])
  
  const [ updatableFields, setUpdatableFields ] = useState<string[]>(["is_freemium"])

  useEffect(() => {
    if(tool?.editables && tool.editables.length > 0) {
      const fields = ["is_freemium"]
      const editables = (tool?.editables || "").split(",").map((edt: string) => edt.trim())
      for(const editable of editables) {
        fields.push(editable)
      }
      setUpdatableFields(fields)
    }
  }, [ tool?.editables ])

  const dataSourceProps = useDataSource(
    dataSize, getDefault, updatableFields, fileFields,
    undefined, undefined,
    null, dynamicToolsId
  )
  const { 
    selectedIsNew, selectedData, initData
  } = dataSourceProps;

  const texts = {
    ...publishTexts,
    newData: `New ${tool?.name || "item"}`,
    noDataError: `No ${tool?.name || "item"} selected`,
    newTitle: `${tool?.name || "Item"} Type`,
    freeTitle: `Test ${tool?.name || "Item"}(Free).`,
    freeMessage: (tool as any)?.freemiumDownloadMessage || `The downloaded ${tool?.name || "Item"} will have watermark.`,
    paidTitle: (tool as any)?.premiumDownloadMessage || `Clean ${tool?.name || "Item"}(${CURRENCY_SYMBOL}{PRICE})`,
    paidMessage: `The downloaded ${tool?.name || "Item"} will be clean with no watermark.`,
    signInMessage: `Please sign in to save your ${tool?.name || "Item"}.`,
    signUpMessage: `Please sign up to save your ${tool?.name || "Item"}.`,
    createButtonText: `Create ${tool?.name || "Item"}`,
    noChatToListMessage: `Your list of ${tool?.name || "Item"} will show here`,
    deleteWarning:  `Are you sure you want to permanently delete this already saved ${tool?.name || "Item"}?`,
    saveSuccess: `New ${tool?.name || "Item"} successfully saved.`,
    updateSuccess: `${tool?.name || "Item"} successfully updated.`
  }
  const dataHandlerProps = useDataHandler({
    collectionName, fileFields,
    toolId: dynamicToolsId as string,
    historyProps, dataSourceProps,
    publishTexts: texts, updatableFields
  })

  const {
    savingData, setSavingData, handleUpdateData, handlePublishData
  } = dataHandlerProps

  const FormMemo = useMemo(() => {
    return (
      <Form 
          tool={tool}
          initData={initData}
          templatesResults={templates}
          publishTexts={texts} 
          collectionName={collectionName}
          isNew={selectedIsNew()}
          data={selectedData as any} 
          saving={savingData}
          setSaving={setSavingData}
          hasPendingSave={getCurrentTimelineData(selectedData?.id || "none").totalUpdates > 1 || selectedIsNew()}
          onUpdateData={(data: any) => {
            handleUpdateData(data)
          }} 
          onPublishData={handlePublishData as () => Promise<any>} 
      />
    );
  }, [tool, texts, collectionName, selectedData, savingData, initData, templates, /*
    selectedIsNew, selectedData, savingData, setSavingData, 
    getCurrentTimelineData, handleUpdateData, handlePublishData, collectionName,*/
  ]);

  const getItemSummaries = (data: FieldsData) => {
    var title, desc, small
    for(const [id, value] of Object.entries(data)) {
      const { name, type } = splitSvgElementId(id)
      const { directive } = splitElementNameWithDirective(name || "")

      if(type && ["text", "textarea", "text_select"].includes(type) && directive, directive) {
        const val = valueOfParseValue(id, value, data, fields)//value instanceof Timestamp? timestampToDate(value).toUTCString() : value
        const v = `${(val || "")}`.trim().replace(/_/g, " ")
        switch (directive) {
          case "name":
            title = v
            break;
          case "desc":
            desc = v
            break;
          case "small":
            small = v
            break;
        
          default:
            break;
        }
      }
    }

    return { title, desc, small }
  }

  // Memoize getItemSummaries to respond to template changes
  const getItemName = useCallback(
    (data: Message) => {
      //Flight ticket fix
      if(tool?.id == "PE2U7P6L77EALVDK69OE") return `${data["passenger_given_name.text"] || ""} ${data["passenger_first_name.text"] || ""}`
      return getItemSummaries(data as any).title || ""
    },
    [tool, fields, selectedData, templates.selectedTemplateData] // Depend on fields and selectedTemplate
  );

  // Memoize getItemSummaries to respond to template changes
  const getItemDescription = useCallback(
    (data: Message) => {
      //Flight ticket fix
      if(tool?.id == "PE2U7P6L77EALVDK69OE") return data["Class.text"] || ""
      return getItemSummaries(data as any).desc || ""
    },
    [tool, fields, selectedData, templates.selectedTemplateData] // Depend on fields and selectedTemplate
  );

  // Memoize getItemSummaries to respond to template changes
  const getItemBadge = useCallback(
    (data: Message) => {
      //Flight ticket fix
      if(tool?.id == "PE2U7P6L77EALVDK69OE") return data["Total_Amount.text"] || ""
      return getItemSummaries(data as any).small || ""
    },
    [tool, fields, selectedData, templates.selectedTemplateData] // Depend on fields and selectedTemplate
  );

  const copyData = (data: FieldsData) => {
    const copiedData: FieldsData = { } as FieldsData
    for(const [id, value] of Object.entries(data)) {
      const { name, type } = splitSvgElementId(id)
      const { directive } = splitElementNameWithDirective(name || "")

      //Make sure uploaded images and directive fields are not copied.
      if((!type || !["upload"].includes(type)) && !directive) {
        copiedData[id] = value
      }
    }

    return { ...copiedData, is_freemium: true }
  }
  
  
  if(!tool) {
    return <LoadingView title="Loading tool..." />
  }
  return (
    <ToolView 
      tool={tool} 
      form={FormMemo}
      historyProps={historyProps} 
      dataSourceProps={dataSourceProps}
      dataHandlerProps={dataHandlerProps}
      publishTexts={texts} 
      getItemName={getItemName}
      getItemDescription={getItemDescription}
      getItemBadge={getItemBadge}
      onOverWriteCopiedData={(data: Message) => {
        return copyData(data as any) as any
      }}
    />
  )
  
};

export default ToolViewer;