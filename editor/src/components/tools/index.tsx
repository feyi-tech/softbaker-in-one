import { URL_BASE, TEMP_TOOL_FORM_ID, Tool } from '@/app-config'
import AppPageBody from '@/components/pages/AppPageBody'
import DataView from "../shipment";
import Loading from "../widgets/Loading"
import { timestampToDate } from "../../utils/time"
import { Timestamp } from "firebase/firestore"
import { Message } from "../shipview/types"
import { PublishTexts, UseDataHandlerResult, UseDataSourceResult, UseHistoryResult } from '../shipment/types';
import LoadingView from '../widgets/LoadingView';


const getItemTime = (toolForm: Message) => {
  if(toolForm.id == TEMP_TOOL_FORM_ID) {
    return "NEW"

  } else {
    const time = timestampToDate(toolForm.updatedAt as Timestamp)
    if(time?.toDateString) {
      return time.toDateString()

    } else {
      //console.log("Time::", time, shipment.updatedAt)
      return <Loading type={Loading.TYPES.threeDots} width="1rem" height="1rem" color="grey" />
    }
  }
}

interface ToolViewProps {
  tool?: Tool | null,
  form: any,
  historyProps: UseHistoryResult,
  dataSourceProps: UseDataSourceResult,
  dataHandlerProps: UseDataHandlerResult,
  publishTexts: PublishTexts,
  getItemName: (data: Message) => any,
  getItemBadge: (data: Message) => any,
  getItemDescription: (data: Message) => any,
  onOverWriteCopiedData: (data: Message) => Message
}
const ToolView = ({
  historyProps, dataSourceProps, dataHandlerProps, 
  tool, form,
  publishTexts, getItemName, getItemBadge, getItemDescription, onOverWriteCopiedData
}: ToolViewProps) => {

  const {
    savingData, setSavingData, handleUpdateData, handlePublishData
  } = dataHandlerProps

  if(!tool) {
    return <LoadingView title="Loading tool..." />
  }

  return (
    <AppPageBody title={tool.name} description={tool.description} image={`${URL_BASE}/logo.png`} bareBoneOnly>
      <DataView 
        tool={tool} 
        form={form} 
        publishTexts={publishTexts}
        historyProps={historyProps} 
        dataSourceProps={dataSourceProps}
        savingData={savingData} 
        setSavingData={setSavingData}
        handleUpdateData={handleUpdateData} 
        handlePublishData={handlePublishData} 
        getItemBadge={getItemBadge}
        getItemDescription={getItemDescription}
        getItemTime={getItemTime}
        getItemName={getItemName}
        onOverWriteCopiedData={onOverWriteCopiedData}
      />
    </AppPageBody>
  )
  
};

export default ToolView;