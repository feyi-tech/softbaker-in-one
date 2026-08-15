import { Tool, USE_SOFTBAKER_CONFIG } from '@/app-config'
import ToolView from '../components/tools';
import Form from '../components/tools/ssn/Form';
import { getDefaultData } from '../components/tools/ssn/func';
import { Data } from '../components/tools/ssn/types';
import { useEffect, useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/ssn/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { Message } from '../components/shipview/types';
import { FaAddressCard } from 'react-icons/fa';
import { useTools } from 'use-softbaker';

const SSN = () => { 
  const toolId = "iBi6f9HorLsLiBfI8xFe"
  const collectionName = "ssns"
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
          icon: <FaAddressCard size="100%" />,
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

  const fileFields = ["signature"]
  
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
    collectionName, selectedData, savingData,  tool, /*setSavingData, selectedIsNew, 
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
        const ssn = data as Data
    
        return (ssn.fullname || "No Name") as string
      }}
      getItemBadge={(data: Message) => {
        var ssn = data as Data
        
        var number = ssn.number
        if(!number) {
          number = ""
        }

        if(number.length < 8 || (number.length == 8 && !number.startsWith("0"))) number = '0'.repeat(9 - number.length) + number

        return number.replace(/^(\d{3})(\d{2})(\d{4})$/, '$1-$2-$3')
      }}
      getItemDescription={(data: Message) => {
        const ssn = data as Data
        return ssn.date as string
      }}
      onOverWriteCopiedData={(data: Message) => {
        const flight = data as Data
        return {
          ...data,
          number: '',
          signature: '',
          is_freemium: true
        }
      }}
    />
  )
  
};

export default SSN;