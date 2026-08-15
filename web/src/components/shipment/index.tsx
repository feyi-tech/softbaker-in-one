import React, { useEffect, useMemo } from 'react';
import {
  Icon,
  Text,
  Button, useToast, VStack, HStack, useColorMode
} from '@chakra-ui/react';
import { 
  FaBoxOpen, FaFolderPlus, FaMoon, FaPaintBrush, FaPiggyBank, FaPlus, FaRedo, FaSave, 
  FaSignInAlt, FaSun, FaToolbox, FaTools, FaUndo, FaVideo, FaWhatsapp, 
  FaCopy, FaEnvelope, FaHome, FaSignOutAlt, FaTrash, FaWallet,
  FaFileImage,
  FaSync
} from 'react-icons/fa';
import Messenger from '../shipview';
import { MenuItem, MenuOptionBadge, Message } from '../shipview/types';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { DEFAULT_DEPOSIT_AMOUNT, TEMP_TOOL_FORM_ID, Tool, USE_SOFTBAKER_CONFIG } from '../../app-config';
import EmptyData from '../shipment/EmptyData';
import DataItem from './DataItem';
import { UseHistoryResult, UseDataSourceResult, PublishTexts } from './types';
import { amountFormatDefault } from '../../utils/f';
import { useSoftBaker, useTools } from 'use-softbaker'
import useColorValue from '../../hooks/useColorValue';
import ICONS from '../widgets/ToolsElements/IconSelector/icons';
import syncUserBalance from './syncUserBalance';
import useToolsSelector from '../../hooks/useToolsSelector';
import CuteButton from '../widgets/CuteButton';
import { getStatusColor } from '../shipview/utils';


const MENU_ITEM_ID = {
  newData: 1,
  myBalance: 2,
  home: 3,
  contactUs: 4,
  tutorial: 5,
  signOut: 6,
  copyData: 7,
  deleteData: 8,
  undo: 9,
  redo: 10,
  saveUpdate: 11,
  signIn: 12,
  allTools: 13,
  lightMode: 14,
  darkMode: 15,
  joinGroup: 16,
  deposit: 17,
  closeChat: 19,
  syncUserBalance: 20
}

const menu: MenuItem[] = [
  {
    id: MENU_ITEM_ID.newData,
    title: "Create New",
    icon: <FaPlus />,
    showAlways: true,
    onlyDesktop: true
  },
  {
    id: MENU_ITEM_ID.myBalance,
    title: "Track/Fund Wallet",
    icon: <FaWallet />,
    showAlways: true
  },
  {
    id: MENU_ITEM_ID.home,
    title: "Softbaker Home",
    icon: <FaHome />
  },
  {
    id: MENU_ITEM_ID.tutorial,
    title: "Tutorial",
    icon: <FaVideo />
  },
  {
    id: MENU_ITEM_ID.allTools,
    title: "Softbaker Tools",
    icon: <FaTools />
  },
  {
    id: MENU_ITEM_ID.contactUs,
    title: "Contact US",
    icon: <FaEnvelope />
  },
  {
    id: MENU_ITEM_ID.joinGroup,
    title: "Join Whatsapp Group",
    icon: <FaWhatsapp />
  },
  {
    id: MENU_ITEM_ID.signIn,
    title: "Sign In",
    icon: <FaSignInAlt />
  },
  {
    id: MENU_ITEM_ID.signOut,
    title: "Sign Out",
    icon: <FaSignOutAlt />
  },
  {
    id: MENU_ITEM_ID.lightMode,
    title: "Switch Theme",
    icon: <FaMoon />
  },
  {
    id: MENU_ITEM_ID.darkMode,
    title: "Switch Theme",
    icon: <FaSun />
  }
]

const singleChatMenu: MenuItem[] = [
  {
    id: MENU_ITEM_ID.deposit,
    title: "Fund Wallet",
    icon: <FaPiggyBank />,
    showAlways: false,
  },
  {
    id: MENU_ITEM_ID.saveUpdate,
    title: "Save Update",
    icon: <FaSave />,
    showAlways: true
  },
  {
    id: MENU_ITEM_ID.undo,
    title: "Undo",
    icon: <FaUndo />,
    showAlways: true
  },
  {
    id: MENU_ITEM_ID.redo,
    title: "Redo",
    icon: <FaRedo />,
    showAlways: true
  },
  {
    id: MENU_ITEM_ID.copyData,
    title: "Copy as New",
    icon: <FaCopy />,
    showAlways: false
  },
  {
    id: MENU_ITEM_ID.deleteData,
    title: "Delete",
    icon: <FaTrash />,
    showAlways: false,
  }
]

interface DataView {
  tool: Tool,
  form: any, 
  historyProps: UseHistoryResult, 
  dataSourceProps: UseDataSourceResult,
  savingData?: boolean, setSavingData: (saving: boolean) => void,
  publishTexts: PublishTexts,
  handleUpdateData: (updatedField: Message) => void, 
  handlePublishData: (renewSubscription?: boolean, serverOnlySaveData?: Message | null) => Promise<Message>,
  getItemName: (data: Message) => any, 
  getItemTime: (data: Message) => any, 
  getItemDescription: (data: Message) => string | null | undefined, 
  getItemBadge: (data: Message) => string | null | undefined,
  onOverWriteCopiedData: (data: Message) => Message
}

const DataView: React.FC<DataView> = ({ 
  tool, form, 
  historyProps, 
  dataSourceProps,
  savingData, setSavingData, 
  publishTexts,
  handlePublishData, 
  getItemName, getItemTime, getItemDescription, getItemBadge, onOverWriteCopiedData
}) => {
  const toast = useToast()
  const router = useRouter()
  const { colorMode, toggleColorMode } = useColorMode()
  
  const { 
    auth, user, authLoading, signIn, signOut, showWallet, deposit,
    balanceInUsd, contact_link, group_link
  } = useSoftBaker();

  const { showTools, showTutorial } = useToolsSelector()
  const { getTool } = useTools(USE_SOFTBAKER_CONFIG)
  
  const {
    addHistory, clearHistory, clearAllHistory,
    undo,
    redo,
    getCurrentTimeline, getCurrentTimelineData
  } = historyProps;

  const { 
    dataList, newData, selectedIsNew, setNewData,
    loadingData, dataError,
    selectedData, setSelectedData,
    initData, updateNewData, deleteData
  } = dataSourceProps;
  
  useEffect(() => {
    if(dataError) {
      toast({
          description: dataError,
          status: "error",
          duration: 4000,
          isClosable: true
      })
    }
  }, [dataError])

  const handleSignOut = () => {
    if(!auth) return
    Swal.fire({
      icon: "warning",
      text: "Are you sure you want to sign out?",
      confirmButtonText: "Yes", cancelButtonText: "No", showCancelButton: true
    })
    .then(r => {
      if(r.isConfirmed) {
        signOut()
        .then(() => {
          clearAllHistory()
          setNewData(null);
          setSelectedData(null);
          toast({
            description: "You're now signed out",
            status: "success",
            duration: 4000,
            isClosable: true
          })
        })
        .catch(() => {
          toast({
            description: "Failed to signout",
            status: "error",
            duration: 4000,
            isClosable: true
          })
        })
      }
    })
  }

  const handleSyncUserBalance = async () => {
    syncUserBalance(user)
    .then(r => {

    })
    .catch(e => {

    })
  }

  const openAuth = () => {
    signIn(publishTexts.signInMessage, publishTexts.signUpMessage)
    .then(user => {})
    .catch((e: any) => {
      if((e?.message || "").length > 0) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: e.message
        })
      }
    })
  }

  const handleCreateData = () => {
    initData()
    .then(shipment => {
      setSelectedData(null)
      //console.log("handleCreateData: ", shipment)
      setSelectedData(shipment)

    })
    .catch((error: Error) => {
      Swal.fire({
        icon: "error",
        text: error.message
      })
    })
  }
  
  const handleMenuItemClicked = (menuId: number) => {
    if(menuId == MENU_ITEM_ID.syncUserBalance) {
      handleSyncUserBalance()
      return
    }
    if(menuId == MENU_ITEM_ID.newData) {
      handleCreateData()
      return
    }
    if(menuId == MENU_ITEM_ID.myBalance) {
      showWallet(DEFAULT_DEPOSIT_AMOUNT)
      return
    }
    if(menuId == MENU_ITEM_ID.deposit) {
      deposit(DEFAULT_DEPOSIT_AMOUNT, null, null)
      return
    }
    if(menuId == MENU_ITEM_ID.home) {
      router.push("/")
      return
    }
    if(menuId == MENU_ITEM_ID.allTools) {
      showTools(tool.id)
      return
    }
    if(menuId == MENU_ITEM_ID.tutorial) {
      const toolInfo = getTool(tool.id)
      if(toolInfo?.youtube || (toolInfo as any)?.mobileVideoUrl || (toolInfo as any)?.desktopVideoUrl) {
        showTutorial(tool.id)

      } else {
        Swal.fire({
          icon: "info",
          title: "No Tutorial Yet",
          text: `No tutorial has been uploaded yet for this tool. This tool is easy to use though. Just try it out.`
        })
      }
        
      return
    }
    if(menuId == MENU_ITEM_ID.contactUs) {
      if(contact_link) location.href = contact_link
      return
    }
    if(menuId == MENU_ITEM_ID.joinGroup) {
      if(group_link) location.href = group_link
      return
    }
    if(menuId == MENU_ITEM_ID.signIn) {
      openAuth()
      return
    }
    if(menuId == MENU_ITEM_ID.signOut) {
      handleSignOut()
      return
    }
    if(menuId == MENU_ITEM_ID.lightMode || menuId == MENU_ITEM_ID.darkMode) {
      toggleColorMode()
      return
    }
    
    if(menuId == MENU_ITEM_ID.copyData && selectedData) {
      const copiedData = onOverWriteCopiedData({ ...selectedData })
      updateNewData(copiedData)
      .then(shipment => {
        setSelectedData(shipment)
        const currentTimeline = getCurrentTimeline(TEMP_TOOL_FORM_ID)
        //Get the current document timeline if exist
        if(!currentTimeline) {
          shipment.id = TEMP_TOOL_FORM_ID
          addHistory(shipment.id, shipment)
        }
  
      })
      .catch((error: Error) => {
        Swal.fire({
          icon: "error",
          text: error.message
        })
      })
      
    }
    
    /**Selected Data menu options */
    if(menuId == MENU_ITEM_ID.saveUpdate) {
      handlePublishData()
      .then(() => {
        setSavingData(false)
        toast({
          description: "Successfully saved.",
          status: "success",
          duration: 4000,
          isClosable: true
        })
      })
      .catch(error => {
        setSavingData(false)
        if((error?.message || "").length > 0) {
            Swal.fire({
                icon: "error",
                title: "Failed to save. Try again later.",
                text: error.message
            })
        }
      })
    }

    if(menuId == MENU_ITEM_ID.undo && selectedData) {
      const history = undo(selectedData.id)
      setSelectedData(history)
    }

    if(menuId == MENU_ITEM_ID.redo && selectedData) {
      const history = redo(selectedData.id)
      setSelectedData(history)
    }

    if(menuId == MENU_ITEM_ID.deleteData) {
      if(!selectedData) return
      if(selectedIsNew()) {
        clearHistory(selectedData.id)
        deleteData(selectedData)
        .catch((error: Error) => {
          Swal.fire({
            icon: "error",
            text: error.message
          })
        })

      } else {
        Swal.fire({
          icon: "warning",
          text: publishTexts.deleteWarning,
          cancelButtonText: "No",
          confirmButtonText: "Yes",
          showCancelButton: true
        })
        .then(result => {
          if(result.isConfirmed) {
            clearHistory(selectedData.id)
            deleteData(selectedData)
            .then(() => {
              setSelectedData(null)
            })
            .catch((error: Error) => {
              Swal.fire({
                icon: "error",
                text: error.message
              })
            })
          }
        })
      }
    }

  }

  const onChatTitle = (data: Message) => {
    let name
    try {
      name = getItemName(data)//trucText(getItemName(data), 16)

    } catch(e) {}
    if(selectedIsNew() && !name) return "New..."
    return name
  }

  const renderChatItem = (data: Message) => {
    
    return (
      <DataItem
        {...(selectedData && selectedData.id == data.id? selectedData : data)} 
        selected={selectedData?.id == data.id}
        onClick={() => {
          const currentTimeline = getCurrentTimeline(data.id)
          //Get the current document timeline if exist
          if(currentTimeline) {
            setSelectedData(currentTimeline)

          } else {
            setSelectedData(data)
            addHistory(data.id, data)
          }
          
        }} 
        itemBadge={getItemBadge(data)}
        itemDescription={getItemDescription(data)}
        itemName={getItemName(data)}
        itemTime={getItemTime(data)}
      />
    )
  }

  const onMenuOptionState = (id: number): "show" | "hide" | "disable" | "loading" => {
    if(id == MENU_ITEM_ID.copyData) {
      if(selectedIsNew()) {
        return "hide"
      }
    }

    const currentTimelineData = getCurrentTimelineData(selectedData?.id || "none")
    if(id == MENU_ITEM_ID.saveUpdate) {
      if(selectedIsNew()) return "hide"
      if(savingData) return "loading"
      if(currentTimelineData.totalUpdates < 2 || savingData) return "disable"
    }

    if(id == MENU_ITEM_ID.undo && !currentTimelineData.hasUndo) {
      return "disable"
    }

    if(id == MENU_ITEM_ID.redo && !currentTimelineData.hasRedo) {
      return "disable"
    }

    if(id == MENU_ITEM_ID.signIn && user) {
      return "hide"
    }
    if(id == MENU_ITEM_ID.signOut && !user) {
      return "hide"
    }
    if(id == MENU_ITEM_ID.contactUs && !contact_link) {
      return "hide"
    }
    if(id == MENU_ITEM_ID.joinGroup && !group_link) {
      return "hide"
    }
    if(id == MENU_ITEM_ID.myBalance && !user) {
      return "hide"
    }
    if(id == MENU_ITEM_ID.deposit && !user) {
      return "hide"
    }
    if(id == MENU_ITEM_ID.lightMode && colorMode === 'dark') {
      return "hide"
    }
    if(id == MENU_ITEM_ID.darkMode && colorMode === 'light') {
      return "hide"
    }
    
    return "show"
  }

  const onMenuOptionBadge = (id: number) => {
    const currentTimelineData = getCurrentTimelineData(selectedData?.id || "none")
    if(!selectedIsNew() && id == MENU_ITEM_ID.saveUpdate && currentTimelineData.totalUpdates > 1) {
      const badge: MenuOptionBadge = {
        counts: currentTimelineData.totalUpdates - 1,
        status: "info"
      }
      return badge
    }

    return null
  }

  const MobileActionButton = useMemo(() => {
    return (
      <Button 
        pos="fixed"
        bottom={4}
        right={4}
        size="lg"
        borderRadius="full"
        colorScheme="teal"
        zIndex="sticky"
        onClick={() => {
          handleCreateData()
        }}
      >
        <Icon as={FaPlus} mr={2} />
        <Text as="div" mb="0 !important">{publishTexts.createButtonText}</Text>
      </Button>
    );
  }, [handleCreateData]);

  const noChatColor = useColorValue("cardBg.light", "cardBg.dark")
  const NoChatToShowView = useMemo(() => {
    return (
      <VStack>
        <VStack w="100%" h="auto" px={2} 
        bg={noChatColor}
        p={4}
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center">
          <HStack w={{base: "5rem", md: "10rem"}} justifyContent="center" alignItems="flex-start">
            <FaBoxOpen size={"3rem"} />
          </HStack>
          <Text as="div" textAlign="center">{publishTexts.noChatToListMessage}</Text>
        </VStack>
        {
          !user && !authLoading?
          <VStack justifyContent="flex-start" alignItems="center" mt={4}>
            <Text as="div" textAlign="center" mb={2}>
              You've not signed in yet.
            </Text>
            <HStack justifyContent="center" alignItems="flex-start">
              <CuteButton bg={getStatusColor("warning")} onClick={() => {
                signIn(publishTexts.signInMessage, publishTexts.signUpMessage)
              }}>
                Sign In / Sign Up
              </CuteButton>
            </HStack>
          </VStack>
          : null
        }
      </VStack>
    );
  }, [handleCreateData, noChatColor]);

  return (
    <>
      <Messenger 
        isLoadingChats={loadingData}
        title={tool.name} logoUrl={`/logo.png`} 
        subTitle={
          !user? null : 
          <Text as="div" p="0px !important" m="0px !important" fontWeight="bold">Balance: <Text as="div" color="green.500" p="0px !important" m="0px !important" display="inline">${amountFormatDefault(balanceInUsd)}</Text></Text>
        }
        headerBg={useColorValue("navbarBg.light", "navbarBg.dark")} 
        headerHeight={"55px"}
        menu={menu} singleChatMenu={singleChatMenu} 
        onMenuItemClicked={handleMenuItemClicked}
        noChatToListView={NoChatToShowView}
        noChatSelectedContent={
          <EmptyData 
            title={tool.name} 
            description={tool.description || ""}
            icon={tool.icon && typeof tool.icon === "string"? ICONS[tool.icon]? ICONS[tool.icon].element({size: "100%"}) : <FaFileImage size="100%" /> : tool.icon}
            dataSize={dataList.length} isLoading={loadingData} 
            onActionButtonClicked={handleCreateData}
          />
        }
        onChatTitle={onChatTitle} 
        renderChatItem={renderChatItem}
        onMenuOptionState={onMenuOptionState}
        onMenuOptionBadge={onMenuOptionBadge}
        chats={[...(newData? [newData] : []), ...dataList]} 
        selectedMessage={selectedData}
        setSelectedMessage={(data: Message | null | undefined) => {
          setSelectedData(data)
        }}
        mobileActionButton={MobileActionButton}
      >
        {form}
      </Messenger>
    </>
  )
}

export default DataView;