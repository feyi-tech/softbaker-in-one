import { Tool, USE_SOFTBAKER_CONFIG } from '@/app-config'
import ToolView from '../components/tools';
import Form from '../components/tools/letter/Form';
import { getDefaultData } from '../components/tools/letter/func';
import { Data } from '../components/tools/letter/types';
import { useEffect, useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/letter/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { Message } from '../components/shipview/types';
import { trucText } from '../utils/f';
import { useTools } from 'use-softbaker';
import { FaEnvelopeOpenText } from 'react-icons/fa';

const Letter = () => {
  const toolId = "LOclCHl7ZxLTi5s0Z42e"
  const collectionName = "letters"
  const historySize = 20
  const dataSize = 50
  
  const { toolsById, getTool } = useTools(USE_SOFTBAKER_CONFIG)
  
  const [ tool, setTool ] = useState<Tool | null>()

 
  useEffect(() => {
    if(toolsById) {
      const tool = getTool(toolId)
      if(tool) {
        setTool({
          ...(tool as any),
          icon: <FaEnvelopeOpenText size="100%" />,
          collectionRuleName: collectionName,
        })

      } else {
        setTool(null)
      }

    } else {
      setTool(null)
    }
  }, [toolsById])

  const historyProps = useHistory(historySize)
  const {
    getCurrentTimelineData
  } = historyProps;

  const fileFields = ["signatures", "logo"]
  
  const updatableFields: string[] = [ "is_freemium" ]
  const dataSourceProps = useDataSource(dataSize, getDefaultData, updatableFields, fileFields, 
    undefined, undefined, 
    collectionName
  )
  const { 
    selectedIsNew, selectedData
  } = dataSourceProps;

  const dataHandlerProps = useDataHandler({
    collectionName, fileFields,
    toolId,
    historyProps, dataSourceProps,
    publishTexts, updatableFields
  })

  const {
    savingData, setSavingData, handleUpdateData, handlePublishData
  } = dataHandlerProps

  const FormMemo = useMemo(() => {
    return (
      <Form 
          tool={tool}
          collectionName={collectionName}
          isNew={selectedIsNew()}
          data={selectedData as Data} 
          saving={savingData}
          setSaving={setSavingData}
          hasPendingSave={getCurrentTimelineData(selectedData?.id || "none").totalUpdates > 1 || selectedIsNew()}
          onUpdateData={handleUpdateData} 
          onPublishData={handlePublishData as () => Promise<Data>} 
      />
    );
  }, [
    tool, collectionName, selectedData, savingData, /*setSavingData, selectedIsNew,  
    getCurrentTimelineData, handleUpdateData, handlePublishData*/
  ]);
  
  return (
    <ToolView 
      tool={tool} 
      form={FormMemo}
      historyProps={historyProps} 
      dataSourceProps={dataSourceProps}
      dataHandlerProps={dataHandlerProps}
      publishTexts={publishTexts} 
      getItemName={(data: Message) => {
        const d = data as Data
    
        return (d.companyName || "No Company Name") as string
      }}
      getItemBadge={(data: Message) => {
        const d = data as Data
    
        return trucText((d.title || "No Title"), 12) as string
      }}
      getItemDescription={(data: Message) => {
        const ssn = data as Data
        return ssn.date as string
      }}
      onOverWriteCopiedData={(data: Message) => {
        const flight = data as Data
        return {
          ...data,
          signatoryNames: [],
          signatoryTiles: [],
          signatures: [],
          logo: null,
          is_freemium: true
        }
      }}
    />
  )
  
};

export default Letter;