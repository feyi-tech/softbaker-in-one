import ToolView from '../components/tools';
import Form from '../components/tools/bank/Form';
import { getDefaultData } from '../components/tools/bank/func';
import { Data } from '../components/tools/bank/types';
import { useEffect, useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/bank/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { Message } from '../components/shipview/types';
import { genAccountNumber } from '../utils/f';
import { useTools } from 'use-softbaker';
import { Tool, USE_SOFTBAKER_CONFIG } from '../app-config';
import { FaDollarSign } from 'react-icons/fa';

const Bank = () => {
  const toolId = "U8SL1BvlIb1nxj4JNCNX"
  const collectionName = "banks"
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

  const fileFields: string[] = []
  const serverFileFields = ["profilePhoto"]
  
  const updatableFields: string[] = [ "profilePhoto",
    "password", "pin", "disableAccount", "autoRenewSubscription", "isInActive", 
    "credits", "totalCredits", "debits", "totalDebits",
    "fullname", "email", "phone", "accountType", "gender", "maritalStatus",
    "dob", "occupation", "address", "currencySymbol", "accountBalance",
    "disableAccountError", "txProcessingDuration",
    "is_freemium"
  ]
  const actionOnlyFields: string[] = []

  const dataSourceProps = useDataSource(
    dataSize, getDefaultData, updatableFields, fileFields, serverFileFields, actionOnlyFields,
    collectionName
  )
  const { 
    selectedIsNew, selectedData
  } = dataSourceProps;

  const dataHandlerProps = useDataHandler({
    collectionName, fileFields, toolId,
    historyProps, dataSourceProps,
    publishTexts, updatableFields, actionOnlyFields
  })

  const {
    savingData, setSavingData, handleUpdateData, handlePublishData
  } = dataHandlerProps

  const FormMemo = useMemo(() => {
    return (
      <Form tool={tool}
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
    collectionName, tool, selectedData, savingData, /*setSavingData, 
    getCurrentTimelineData, handleUpdateData, handlePublishData, selectedIsNew*/
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
    
        return (d.fullname || "No Name") as string
      }}
      getItemBadge={(data: Message) => {
        const d = data as Data
    
        return  d.accountNumber_username? `${d.accountNumber_username}` : "0000000000"
      }}
      getItemDescription={(data: Message) => {
        const ssn = data as Data
        return ssn.date as string
      }}
      onOverWriteCopiedData={(data: Message) => {
        return {
          ...data,
          profilePhoto: null,
          password: null,
          pin: null,
          accountNumber_username: genAccountNumber(),
          disableAccount: false,
          autoRenewSubscription: false,
          isInActive: false,
          totalCredits: 0,
          totalDebits: 0,
          credits: [],
          debits: []
        }
      }}
    />
  )
  
};

export default Bank;