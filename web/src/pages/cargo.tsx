import { TEMP_TOOL_FORM_ID, Tool, USE_SOFTBAKER_CONFIG } from '@/app-config'
import ToolView from '../components/tools';
import Form from '../components/tools/cargo/Form';
import { getDefaultData } from '../components/tools/cargo/func';
import { Data, SHIPMENT_STATUS_NAME } from '../components/tools/cargo/types';
import { useEffect, useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/cargo/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { useTools } from 'use-softbaker';
import { FaShippingFast } from 'react-icons/fa';


const Cargo = () => {
  const toolId = "qDs4yENnChIKjVG6oMcK"
  const collectionName = "shipments"
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
          icon: <FaShippingFast size="100%" />,
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
  
  const updatableFields = ["shippingStatus", "errorMessage", "expectedArrivalDate", "is_freemium"]
  const dataSourceProps = useDataSource(
    dataSize, getDefaultData, updatableFields, 
    undefined, undefined, undefined, 
    collectionName
  )
  const { 
    selectedIsNew, selectedData
  } = dataSourceProps;

  const dataHandlerProps = useDataHandler({
    collectionName: collectionName, toolId,
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
        data={selectedData} 
        saving={savingData}
        setSaving={setSavingData}
        hasPendingSave={getCurrentTimelineData(selectedData?.id || "none").totalUpdates > 1 || selectedIsNew()}
        onUpdateData={handleUpdateData} 
        onPublishData={handlePublishData as () => Promise<Data>} 
      />
    );
  }, [
    tool, selectedData, savingData, collectionName, /*setSavingData,  selectedIsNew,
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
      getItemName={(shipment: Data) => {
        var name = ""
        if(shipment.packageContent) {
          name += shipment.packageContent
    
        } else if(shipment.id == TEMP_TOOL_FORM_ID) {
          name += "New Invoice..."
        }
    
        if(shipment.invoiceNumber) {
          name += " - " + shipment.invoiceNumber
        }
    
        return name
      }}
      getItemBadge={(data: Data) => {

        return data?.shippingStatus? SHIPMENT_STATUS_NAME[data.shippingStatus] : null
      }}
      getItemDescription={(data: Data) => {
        return data?.packageDestinationAddress? data?.packageDestinationAddress : null
      }}
      onOverWriteCopiedData={(data: Data) => {
        return data
      }}
    />
  )
  
};

export default Cargo;