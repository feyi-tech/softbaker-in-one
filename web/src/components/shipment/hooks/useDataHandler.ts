import { useEffect, useState } from "react"
import { Message } from "../../shipview/types"
import { PublishTexts, UseDataHandlerResult, UseDataSourceResult, UseHistoryResult } from "../types"
import { TEMP_TOOL_FORM_ID } from "@/root/src/app-config"
import { useSoftBaker } from "use-softbaker"
import Swal from "sweetalert2"
import { User } from "firebase/auth"
import { actionsStorageKey, deleteDataWithKeyPrefix, fileDocStorageKey, fileFieldStorageKey, getReject, getResolve, promiseResolvePending, rejectPromise, saveFileFieldFile, savePromise } from "@/root/src/utils/f"
import { getCollectionName } from "./func"

interface UseDataSourceProps {
  toolId: string,
  collectionName?: string | null,
  dynamicToolId?: string | null,
  historyProps: UseHistoryResult, 
  dataSourceProps: UseDataSourceResult,
  publishTexts: PublishTexts,
  fileFields?: string[],
  updatableFields?: string[],
  actionOnlyFields?: string[]
}
const useDataHandler = ({
  toolId,
  collectionName, dynamicToolId,
  historyProps, 
  dataSourceProps,
  publishTexts,
  fileFields = [],
  updatableFields = [],
  actionOnlyFields = []
}: UseDataSourceProps): UseDataHandlerResult => {
  const { 
    user, signIn, showWallet, balanceInUsd, 
    unconfirmedDepositsCount, balancePendingInUsd,
    getDownloadType, deposit
  } = useSoftBaker();
  const [savingData, setSavingData] = useState<boolean>()

  const {
    addHistory, clearHistory
  } = historyProps;
  
  const { 
    selectedIsNew, selectedData, setSelectedData,
    createData, editData 
  } = dataSourceProps;

  const publish = (
    isFreemium: boolean, user: User, resolve: (docData: Message) => void, reject: (error: any) => void, 
    renewSubscription: boolean = false, serverOnlySaveData?: Message | null,
    otherData?: Message | null
  ) => {
    //console.log("SolveIt:1", isFreemium, user)
    setSavingData(true)
    if(selectedIsNew() && selectedData) {
      //console.log("SolveIt:12", selectedData)
      createData({...selectedData, ...(otherData || {}), is_freemium: isFreemium}, user)
      .then(shipment => {
        //console.log("SolveIt:15", shipment)
        clearHistory(TEMP_TOOL_FORM_ID)
        addHistory(shipment.id, shipment)
        resolve(shipment)
      })
      .catch(e => {
        //console.log("SolveIt:16", e.message)
        reject(e)
      })

    } else if(selectedData) {
      //console.log("SolveIt:13", selectedData)
      editData(
        {...selectedData, ...(otherData || {}), is_freemium: isFreemium, renewSubscription: renewSubscription === true},
        serverOnlySaveData
      )
      .then(shipment => {
        clearHistory(shipment.id)
        addHistory(shipment.id, shipment)
        setSelectedData(shipment)
        resolve(shipment)
      })
      .catch(e => {
        reject(e)
      })

    } else {
      //console.log("SolveIt:14")
      reject(new Error(publishTexts.noDataError))
    }
  }

  const getType = (
    user: User, resolve: (docData: Message) => void, reject: (error: any) => void, 
    renewSubscription?: boolean, serverOnlySaveData?: Message | null, 
    otherData?: Message | null
  ) => {
    const isNew = selectedIsNew()
    //console.log("getType: ", renewSubscription)
    //console.info("parsedSvg:templatesUrl.handler.isNew", isNew)
    getDownloadType({
      renewSubscription: renewSubscription,
      toolId: toolId,
      title: isNew || selectedData?.is_freemium? publishTexts.newTitle : publishTexts.updateTitle,
      removeFreemiumBeforeUpdate: (!isNew && selectedData?.is_freemium === true && serverOnlySaveData?.is_freemium === false) as boolean,
      updateMessage: isNew? undefined : publishTexts.updateMessage,
      freeTitle: publishTexts.freeTitle,
      freeMessage: publishTexts.freeMessage,
      paidTitle: publishTexts.paidTitle,
      paidMessage: publishTexts.paidMessage,
      isFreemium: selectedData?.is_freemium as boolean
    })
    .then(result => {
        //console.info("parsedSvg:templatesUrl.handler.1", result)
        //Making sure premium is not turned back to freemium
        //const alreadyPremium = !isNew && !selectedData?.is_freemium
        const isFreemium = isNew? result.is_freemium : selectedData?.is_freemium || false//alreadyPremium? false :  result.is_freemium
        //console.log("getDownloadType", (!isNew || selectedData?.is_freemium), result.cost, balanceInUsd, result, "---", selectedData)
        if(result.cost > balanceInUsd) {
            setSavingData(false)
            if(unconfirmedDepositsCount > 0) {
                Swal.fire({
                    icon: "info",
                    title: "Payment Error",
                    text: `Your ${unconfirmedDepositsCount > 1? "deposits" : "deposit"} of approximately $${balancePendingInUsd} is currently undergoing confirmations. Please try again later in 5 - 10 minutes after your ${unconfirmedDepositsCount > 1? "deposits have" : "deposit has"} been confirmed.`,
                    confirmButtonText: "OK",
                })
                .then(() => {
                  showWallet(10)
                })
                return reject(new Error(""))
            }
            Swal.fire({
                icon: "error",
                title: "Payment Error",
                text: `You have insufficient balance! $${result.cost} is needed. Fund your wallet with at least $${result.cost}.`,
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: "Fund Wallet",
                cancelButtonText: "Cancel"
            })
            .then(r => {
              if(r.isConfirmed) {
                deposit(result.cost, publishTexts.signInMessage, publishTexts.signUpMessage)
                .then(() => {
                  Swal.fire({
                    icon: "success",
                    title: "Payment Successfull",
                    text: `Your deposit was detected and will be confirmed soon.`,
                    showConfirmButton: true,
                    confirmButtonText: "OK"
                  })
                  reject(new Error(""))
                })
                .catch(e => {
                  Swal.fire({
                    icon: "error",
                    title: "Payment Error",
                    text: e.message
                  })
                  reject(new Error(""))
                })
              }
            })
        } else {
          publish(isFreemium, user, resolve, reject, renewSubscription, serverOnlySaveData, otherData)
        }
    })
    .catch((e: any) => {
  
      reject(e)
    })
  }

  useEffect(() => {
    if(user && promiseResolvePending("getType")) {
      let options, otherData
      try {
        options = getResolve("getSaveOptions")()
      } catch(e) {}
      try {
        otherData = getResolve("otherData")()
      } catch(e) {}

      getType(user, getResolve("getType"), getReject("getType"), options?.renewSubscription, options?.serverOnlySaveData, otherData)
    } 
  }, [user])
  
  //Data Form handlers
  const handleUpdateData = (updatedField: Message) => {
    //Save file fields values into the local storage
    for (const field of Object.keys(updatedField)) {
      if(fileFields.includes(field) && updatedField[field]) {
        if(Array.isArray(updatedField[field])) {
          //Delete all images for new past unsaved new creation for this field array of images
          deleteDataWithKeyPrefix(fileFieldStorageKey(getCollectionName(collectionName), TEMP_TOOL_FORM_ID, `${field}_`))

          const fields = []
          for(var i = 0; i < updatedField[field].length; i++) {
            if(updatedField[field][i].length > 0) {
              saveFileFieldFile(getCollectionName(collectionName), updatedField.id, `${field}_${i}`, updatedField[field][i])
              fields.push(field)

            } else {
              fields.push("")
            }
          }
          //For non-updatableFields, only files can be update because they might be deleted from the user's browser.
          //The field database value must not be allowed to change in the client side
          if(updatableFields.includes(field) || (selectedData || {}).id == TEMP_TOOL_FORM_ID) {
            updatedField[field] = fields

          } else if(selectedData) {
            //Return it to the previous data
            updatedField[field] = selectedData[field]
          }

        } else {
          if(updatedField[field]) {
            saveFileFieldFile(getCollectionName(collectionName), updatedField.id, field, updatedField[field])
            //For non-updatableFields, only files can be update because they might be deleted from the user's browser.
            //The field database value must not be allowed to change in the client side
            if(updatableFields.includes(field) || (selectedData || {}).id == TEMP_TOOL_FORM_ID) {
              updatedField[field] = field

            } else if(selectedData) {
              //Return it to the previous data
              updatedField[field] = selectedData[field]
            }

          } else {
            //For non-updatableFields, only files can be update because they might be deleted from the user's browser.
            //The field database value must not be allowed to change in the client side
            if(updatableFields.includes(field) || (selectedData || {}).id == TEMP_TOOL_FORM_ID) {
              updatedField[field] = ""

            } else if(selectedData) {
              //Return it to the previous data
              updatedField[field] = selectedData[field]
            }
          }
          
        }
        
      } else if(!updatableFields.includes(field) && updatedField[field] && selectedData && (selectedData || {}).id != TEMP_TOOL_FORM_ID) {
        //Return it to the previous data
        updatedField[field] = selectedData[field]
      }
    }

    //Start of the process to localstorage-save fields that only triggers an action such as a subscription renewal
    const actions = []
    const keys = Object.keys(updatedField)
    for (const field of keys) {
      if(actionOnlyFields.includes(field)) {
        actions.push(field)
        delete updatedField[field as any];
      }
    }
    
    try {
      localStorage.setItem(actionsStorageKey(getCollectionName(collectionName), TEMP_TOOL_FORM_ID), JSON.stringify({
        data: actions,
        expiry: Date.now() + 1000//expires in 1000 milliseconds
      }))

    } catch(e) {
      localStorage.clear()
      localStorage.setItem(actionsStorageKey(getCollectionName(collectionName), TEMP_TOOL_FORM_ID), JSON.stringify({
        data: actions,
        expiry: Date.now() + 1000//expires in 1000 milliseconds
      }))
    }
    //End of the process to localstorage-save fields that only triggers an action such as a subscription renewal

    const update = {
      ...(selectedData || {}),
      ...updatedField
    }
    //console.log("yyy:handleUpdateData", update)
    addHistory(update.id, update)
    setSelectedData(update)
  }
  
  const handlePublishData = (renewSubscription?: boolean, serverOnlySaveData?: Message | null, otherData?: Message | null): Promise<Message> => {
    return new Promise((resolve, reject) => {
      if(!user) {
        savePromise("getType", resolve, reject)
        //Save if it's a renewal request
        savePromise("getSaveOptions", () => ({
          renewSubscription, serverOnlySaveData
        }), () => {})
        //Other data that should be added after submit is clicked
        savePromise("otherData", () => (otherData), () => {})

        signIn(publishTexts.signInMessage, publishTexts.signUpMessage)
        .then(() => {
        })
        .catch(e => {
          rejectPromise("getType", e)
          reject(e)
        })

      } else {
        getType(user, resolve, reject, renewSubscription, serverOnlySaveData, otherData)
      }
      
    })
  }

  return {
    savingData, setSavingData,
    handleUpdateData, handlePublishData
  }

}


export default useDataHandler