import ToolView from '../components/tools';
import Form from '../components/tools/tool_editor/Form';
import { getDefaultData } from '../components/tools/tool_editor/func';
import { Data } from '../components/tools/tool_editor/types';
import { useMemo, useState } from 'react';
import { publishTexts } from '../components/tools/tool_editor/constants';
import useHistory from '../components/shipment/hooks/useHistory';
import useDataSource from '../components/shipment/hooks/useDataSource';
import useDataHandler from '../components/shipment/hooks/useDataHandler';
import { Message } from '../components/shipview/types';
import { numFormatDefault } from '../utils/f';
import { Box, HStack, Text } from '@chakra-ui/react';
import { IconFromId } from '../components/widgets/ToolsElements/IconSelector';
import { Tool } from '../app-config';
import { FaTools } from 'react-icons/fa';

const ToolEditor = () => {
  const toolId = "other_tools"
  const collectionName = "other_tools"
  const historySize = 20
  const dataSize = 50
  
  const [ tool, setTool ] = useState<Tool>({
    id: toolId,
    name: "Tool Editor",
    description: "Create tools for other users",
    icon: <FaTools size="100%" />,
    isActive: true,
    isHidden: true, siteLogoUrl: "", siteUrl: "/tool-editor",
    allow_freemium: true, create_price: 0, update_price: 0,
    desktopVideoUrl: "", mobileVideoUrl: "",
    collectionRuleName: collectionName,
  })

  const historyProps = useHistory(historySize)
  const {
    getCurrentTimelineData
  } = historyProps;

  const fileFields: string[] = []
  
  const updatableFields: string[] = [ 
    "is_freemium", "name", "description", "icon", "youtube", 
    "create_price", "update_price", "templates_url", "isHidden", "editables", "message"
  ]
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
    selectedData, savingData, tool, collectionName,/* setSavingData, selectedIsNew, 
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
    
        return (
          <HStack>
            <Box>
              <IconFromId id={d.icon} />
            </Box>
            <Text as="div">
              { (d.name || "No Tool Name") }
            </Text>
          </HStack>
        )
      }}
      getItemDescription={(data: Message) => {
        const tool_editor = data as Data
        return tool_editor.description as string
      }}
      getItemBadge={(data: Message) => {
        const d = data as Data
    
        return `$${numFormatDefault(d.create_price, 2, 2)} - $${numFormatDefault(d.update_price, 2, 2)}` as string
      }}
      onOverWriteCopiedData={(data: Message) => {
        return {
          ...data,
          templates_url: null,
          is_freemium: true
        }
      }}
    />
  )
  
};

export default ToolEditor;