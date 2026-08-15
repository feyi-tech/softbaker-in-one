import ToolView from '../components/tools';
import Form from '../components/tools/invoice/Form';
import { getDefaultData } from '../components/tools/invoice/func';
import { Data } from '../components/tools/invoice/types';
import { useEffect, useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/invoice/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { Message } from '../components/shipview/types';
import { trucText } from '../utils/f';
import { arrayAsObjectToArray } from '../components/tools/toolsFunc';
import { Tool, USE_SOFTBAKER_CONFIG } from '../app-config';
import { FaDollarSign } from 'react-icons/fa';
import { useTools } from 'use-softbaker';

const Invoice = () => {
  const toolId = "5vCsgJJVsFYhV4dZYQdI"
  const collectionName = "invoices"
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
          icon: <FaDollarSign size="100%" />,
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

  const fileFields = ["logo"]
  
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
    selectedData, savingData, tool, collectionName, /*selectedIsNew, 
    getCurrentTimelineData, handleUpdateData, handlePublishData, setSavingData,*/
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
      getItemDescription={(data: Message) => {
        const invoice = data as Data
        return invoice.customerName as string
      }}
      getItemBadge={(data: Message) => {
        const d = data as Data
    
        return trucText((d.invoiceNumber || "..."), 12) as string
      }}
      onOverWriteCopiedData={(data: Message) => {
        return {
          ...data,
          logo: null,
          invoiceNumber: `#${Math.round(Math.random() * 10000000)}`,
          items: arrayAsObjectToArray(data.items),
          is_freemium: true
        }
      }}
    />
  )
  
};

export default Invoice;