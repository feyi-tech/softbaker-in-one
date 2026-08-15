import { dateToTimestamp } from "@/root/src/utils/time";
import { 
    collection, deleteDoc, doc, Firestore, limit, onSnapshot, orderBy, query, Timestamp, where 
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useFrontbacked } from "use-frontbacked"
import { Doc } from "../types";
import { SERVER_FILE_FIELD_RAND_PART_PLACEHOLDER, TEMP_TOOL_FORM_ID } from "@/root/src/app-config";
import { Message } from "../../shipview/types";
import { User } from "firebase/auth";
import { actionsStorageKey, deleteDataWithKeyPrefix, deleteFileFieldFile, fileDocStorageKey, generateUniqueId, moveFileFieldFile } from "@/root/src/utils/f";
//import { randomUUID } from "crypto";
import { getCollectionName } from "./func";
import { base64ToFile, uploadWithRetry } from "../../tools/tool_editor/Form/svg-processor/utils";
import { FileObject } from "@/root/src/utils/cloudflare";
import useLogger, { LOGGER_LOG_TYPES } from "../../tools/tool_editor/Form/svg-processor/hooks/useLogger";

interface IDMap {
    [id: string]: number
}


const useDataSource = (
    maxDataList: number, 
    getDefaultData: () => Doc,
    updatableFields: string[] = [],
    fileFields: string[] = [],
    serverFileFields: string[] = [],
    actionOnlyFields: string[] = [],
    collectionName?: string | null, 
    dynamicToolId?: string | null
) => {
    const { logger } = useLogger()
  const { user, authLoading, db, auth, createDoc, updateDoc, uploadFile } = useFrontbacked();

  const [newData, setNewData] = useState<Message | null>();
  const [dataList, setDataList] = useState<Message[]>([]);
  const [dataListIdMap, setDataListIdMap] = useState<IDMap>({});
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string>("");

  const [selectedData, setSelectedData] = useState<Message | undefined | null>();

  const [previousUpdatedData, setPreviousUpdatedData] = useState<Message>({} as Message);

  const selectedIsNew = useCallback(() => {
    return selectedData?.id == TEMP_TOOL_FORM_ID
  }, [selectedData])

  useEffect(() => {
    if(selectedIsNew()) setNewData(selectedData)
    if(selectedData && !previousUpdatedData) setPreviousUpdatedData(selectedData)
  }, [selectedData])

  useEffect(() => {
    //console.log(!newData? "NewDataIsNull:" : "NewDataExists:", newData)
  }, [newData])

  const setError = (error: any) => {
    if(error.message) {
        setDataError(error.message)

    } else {
        setDataError("An error occurred. Please try again later or contact support.")
    }
  }

  useEffect(() => {
    logger(
        `useDataSource => noDB: ${!db} | invalidDb: ${!(db instanceof Firestore)} | 
        userNotSet: ${!user} | otherDataNotSet: ${(!user || (!collectionName && !dynamicToolId))} | collectionName: ${collectionName} | dynamicToolId: ${dynamicToolId} | 
        `, 
        LOGGER_LOG_TYPES.info
    );
    // Check if db is null before subscribing to dataList
    if (!db) {
        //setLoadingData(false)
        //console.log("useError: ", 'db is not initialized.', db);
        return;
    }
    if (!(db instanceof Firestore)) {
        //setLoadingData(false)
        //console.log("useError: ", 'db is not a valid Firestore instance.', db);
        return;
    }
    if (!collectionName && !dynamicToolId) {
        return;
    }
    if (!user) {
        if(!authLoading) {
            setDataList([]);
            setDataListIdMap({})
            setLoadingData(false)
            if((window as any).unsubscribeDocs) (window as any).unsubscribeDocs()
        }
        return;
    }

    setLoadingData(true)

    const dataListRef = collection(db, collectionName? collectionName : "other_tools_data")
    //console.log("useError: ", "dataListRef2:", dataListRef);

    const uid = user.uid //"2WECTfBFiTeOMjSEUNMyGZj5bdD3"//
    // Subscribe to the latest 50 dataList and order them by creation timestamp
    const fetchQuery = collectionName? 
    collectionName == "other_tools"?//
    query(
        dataListRef,
        where('authorId', '==', uid), //Might be removed later to have all the tools listed regardless of the editor
        where('is_static', '==', false), //Might be removed later to have all the tools listed regardless of the editor
        orderBy('updatedAt', 'desc'), limit(maxDataList)
    ) : 
    query(
        dataListRef,
        where('authorId', '==', uid),
        orderBy('updatedAt', 'desc'), limit(maxDataList)
    ) ://For listing dynamic tools data
    
    query(
        dataListRef,
        where('authorId', '==', uid),
        where('toolId', '==', dynamicToolId),
        orderBy('updatedAt', 'desc'), limit(maxDataList)
    )

    
    logger(
        `useDataSource.fetchQuery => ${JSON.stringify(fetchQuery)}`, 
        LOGGER_LOG_TYPES.info
    );
    
    const unsubscribe = onSnapshot(
        fetchQuery,
        (snapshot) => {
            const updatedDataList: Message[] = [];
            const idMap: IDMap = {};
            var index = 0;
            snapshot.forEach((doc) => {
                const dataData: Message = {
                    ...doc.data(),
                    id: doc.id
                } as Message;
                
                updatedDataList.push(dataData);
                idMap[dataData.id] = index;
                index++
                //console.log("SHIP:dataData ", dataData)
            });
            setDataList(updatedDataList);
            setDataListIdMap(idMap)
            setLoadingData(false)
            //console.log("SHIPPP: ", snapshot)
            logger(
                `useDataSource.onSnapshot.snapshot => ${JSON.stringify(updatedDataList)}`, 
                LOGGER_LOG_TYPES.info
            );
        },
        (error: any) => {
            setError(error)
            setLoadingData(false)
            logger(
                `useDataSource.onSnapshot.error => ${JSON.stringify(error?.message || error)}`, 
                LOGGER_LOG_TYPES.info
            );
        }
    );

    (window as any).unsubscribeDocs = unsubscribe

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [db, user, auth, authLoading, collectionName, dynamicToolId]);

  useEffect(() => {
    if(newData && Object.keys(dataListIdMap).includes(newData.id)) {
        if(selectedIsNew()) {
            setSelectedData(dataList[dataListIdMap[newData.id]])
        }
        setNewData(null)
        

    } else if(selectedData && Object.keys(dataListIdMap).includes(selectedData.id)) {
        setSelectedData(dataList[dataListIdMap[selectedData.id]])
    }
  }, [dataListIdMap, newData])

  const initData = (defaultData?: Doc): Promise<Message> => {
    if(defaultData) {
        //console.log("useFieldsData.initData", defaultData)
    }
    //Delete all images for new past unsaved new creation
    deleteDataWithKeyPrefix(fileDocStorageKey(getCollectionName(collectionName), TEMP_TOOL_FORM_ID))
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject(new Error("Storage awaiting initialization")); // Exit early if db is null
        }
        let newPackage: Message;
        if(!newData || defaultData) {
            newPackage = {
                ...(defaultData || getDefaultData()),
                id: TEMP_TOOL_FORM_ID
            } as Message
            
            setNewData(newPackage);

        } else {
            newPackage = {...newData}
        }

        if(defaultData) {
            setSelectedData(null)
            setSelectedData(newPackage)
        }
        resolve(newPackage)
        
    })
  }

  const updateNewData = (dataUpdate: Message): Promise<Message> => {
    return new Promise((resolve, reject) => {

        if(newData) {
            let update: Message = {...newData, ...dataUpdate};
            setNewData(update);
            resolve(update)

        } else {
            initData()
            .then(newData => {
                let update: Message = {...newData, ...dataUpdate, id: newData.id};
                setNewData(update);
                resolve(update)
            })
            .catch((error: any) => {
                reject(error)
            })
        }
        
        
    })
  }

  const setFieldServerFileUrls = async (data: {[x:string]: any}, user: User): Promise<{[x:string]: string}> => {
    return new Promise((resolve, reject) => {
        if(serverFileFields.length == 0) {
            resolve(data)

        } else {
            //const fileUploadPromises = []
            const uploadRquestsData: FileObject[] = []
            for (let index = 0; index < serverFileFields.length; index++) {
                const field = data[serverFileFields[index]];
                console.log("imagesUploadResults:uploadRquestsData:", serverFileFields[index], field)
                if(!field || !field.file || !field.pathFormatNoExt) {
                    uploadRquestsData.push({
                        id: serverFileFields[index]
                    } as FileObject)

                } else {
                    var fileExtArray = field.file.name.split(".")
                    var fileExt = fileExtArray[fileExtArray.length - 1]
                    const filenameId = `${user.uid}-${field.pathFormatNoExt.replace(SERVER_FILE_FIELD_RAND_PART_PLACEHOLDER, generateUniqueId(8))}`.toLowerCase()

                    const imageFile = base64ToFile(filenameId, field.base64Url)
                    uploadRquestsData.push({
                        id: serverFileFields[index], 
                        file: imageFile.image,
                        fileName: `${filenameId}.${fileExt}`,
                        dir: `users`,
                    })
                }
            }

            if(uploadRquestsData.length > 0) {
                //Upload the files
                if(!user) {
                    return reject(new Error("Please sign in"))
                }
                uploadWithRetry(user, uploadRquestsData, [], false)
                .then(imagesUploadResults => {
                    console.log("imagesUploadResults:", imagesUploadResults, uploadRquestsData)
                    for (var i = 0; i < imagesUploadResults.length; i++) {
                        if(imagesUploadResults[i].url && imagesUploadResults[i].url.length > 0) {
                            data[imagesUploadResults[i].id] = imagesUploadResults[i].url
                        }
                    }
                    resolve(data)
                })
                .catch(e =>{
                    reject(e)
                })

            }
        }
    })
  }

  const createData = (newData: Message, user?: User | null): Promise<Message> => {
    //console.log("SolveIt:2", newData, user)
    return new Promise(async (resolve, reject) => {
        // Check if db is null before creating a new data
        if (!db) {
            return reject(new Error("Storage awaiting initialization"))
        }

        if (!user) {
            return reject(new Error("Please sign in first."))
        }
    
        if (!newData) {
            return reject(new Error("No new data to submit"))
        }

        if(!collectionName && !dynamicToolId) return reject(new Error("No collection name and dynamic tool id too."))
        // Create a reference to the collection in Firestore
        
        const folderName = collectionName? collectionName : "other_tools_data"
        const id = doc(collection(db, folderName)).id.toUpperCase()
    
        // Add the new data to the collection in Firestore with server timestamp
        const data: {[x:string]: any} = {
            ...newData,
            authorId: "uid",
            is_freemium: newData.is_freemium === undefined? false : newData.is_freemium,
            createdAt: "current_time", // Set server timestamp,
            updatedAt: "current_time", // Set server timestamp
        }
        
        delete data.id

        const dataWithFieldUrls = await setFieldServerFileUrls(data, user)

        //delete data.createdAt
        createDoc(id, dataWithFieldUrls, user, collectionName, dynamicToolId)
        .then(() => {
            // Set the new data with the generated ID
            const savedData = {
                ...dataWithFieldUrls,
                id: id,
                authorId: user.uid,
                createdAt: new Date(), // Set local timestamp for immediate display,
                updatedAt: new Date(), // Set local timestamp for immediate display
            }
            
            if(selectedIsNew()) setSelectedData(savedData)
            //setNewData(null);
            setNewData(savedData)

            if(fileFields.length > 0) {
                //Save file fields values into the local storage
                const promises = []
                for (const field of fileFields) {
                    if(Array.isArray(data[field])) {
                        for(var i = 0; i < data[field].length; i++) {
                            if(data[field][i] && data[field][i].length > 0) {
                                promises.push(moveFileFieldFile(getCollectionName(collectionName), TEMP_TOOL_FORM_ID, id, `${field}_${i}`))
                            }
                        }
              
                    } else {
                        if(data[field] && data[field].length > 0) {
                            promises.push(moveFileFieldFile(getCollectionName(collectionName), TEMP_TOOL_FORM_ID, id, field))
                        }
                    }
                }

                Promise.all(promises)
                .then(() => {
                    resolve(savedData)
                })
                .catch(e => {
                    resolve(savedData)
                })

            } else {
                resolve(savedData)
            }
        })
        .catch((error: any) => {
            console.error("Error creating data:", error);
            //setError(error.error)
            reject(new Error(error.error || error.message))
        });
    })
      
  }

  const notEmptyOverwrite = (prevDataValue: any, updateDataValue: any) => {
    return true
    return !(
        typeof prevDataValue === "string" && typeof updateDataValue === "string" && prevDataValue.length > 0 && updateDataValue.length == 0
    )
  }
  const GENERAL_UPDATABLE_FIELDS = ["subscription_type"]
  const editData = (updatedData: Message, serverOnlySaveData?: Message | null): Promise<Message> => {
    const data = updatedData as Doc

    console.log("editData:updatedData", updatedData, " | serverOnlySaveData: ", serverOnlySaveData, " | updatableFields:", updatableFields, " | previousUpdatedData: ", previousUpdatedData)
    
    return new Promise(async (resolve, reject) => {
        // Check if db is null before editing the data
        if (!db) {
            return reject(new Error("Storage awaiting initialization"))
        }

        if (!user) {
            return reject(new Error("Please sign in first."))
        }
    
        // Update the specified data in the collection in 
        const update: Doc = { }
        
        for (const field of updatableFields) {
            //console.log("updatableFields => Field: ", field, ", Value: ", data[field])
            //Making sure only the updatable data fields with changed values are included in the request body
            
            if(field == "subscription_type") {
                // console.log("editData.checkUpdatable:", previousUpdatedData[field], data[field], previousUpdatedData[field] != data[field])
            }
            if((previousUpdatedData[field] != data[field] && notEmptyOverwrite(previousUpdatedData[field], data[field])) || GENERAL_UPDATABLE_FIELDS.includes(field)) update[field] = data[field]
        }

        console.log("editData:update", update)

        //Start of the process to add fields that only triggers an action such as a subscription renewal
        const actionsInfo = localStorage.getItem(actionsStorageKey(getCollectionName(collectionName), TEMP_TOOL_FORM_ID))
        var actions = []
        if(actionsInfo) {
            const actionsInfoJson = JSON.parse(actionsInfo)
            //If the actions logged has not expired. Expiry can occur if the browser closes/crashes before the request is sent to the server.
            if(actionsInfoJson.expiry >= Date.now()) {
                actions = actionsInfoJson.data
            }
            localStorage.removeItem(actionsStorageKey(getCollectionName(collectionName), TEMP_TOOL_FORM_ID))
        }
        for (const field of actions) {
            update[field] = true
        }
        console.log("editData:update.2", update)
        //Adding subscription renewal to the request body if requested
        if(data.renewSubscription) update.renewSubscription = true
        //End of the process to add fields that only triggers an action such as a subscription renewal

        if(Object.keys(update).length == 0 && !serverOnlySaveData) {
            return resolve(updatedData)
        }

        update.is_freemium = updatedData.is_freemium
        if(collectionName) {
            update.updatedAt = "current_time"

        } else {
            delete update.id
            if(serverOnlySaveData?.id) {
                delete (serverOnlySaveData as Doc).id
            }
        }

        setPreviousUpdatedData(updatedData)

        const dataWithFieldUrls = await setFieldServerFileUrls(update, user)
        //console.log("TheUpdate:", update, dataWithFieldUrls)

        console.log("editData:dataWithFieldUrls", dataWithFieldUrls)
        
        //console.log("updateDoc: ", update, " | ", serverOnlySaveData, " | ", { ...update, ...(serverOnlySaveData || {})})
        updateDoc(updatedData.id, { ...dataWithFieldUrls, ...(serverOnlySaveData || {})}, collectionName, dynamicToolId)
        .then(() => {
            //console.log("Data updated successfully");
            resolve({
                ...updatedData,
                ...(serverOnlySaveData || {}),
                updatedAt: new Date()
            })
        })
        .catch((error: any) => {
            //console.error("Error updating data:", error);
            //setError(error)
            reject(new Error(error.error || error.message))
        });
    })
      
  };

  const deleteLocalFiles = (data: Message) => {
    if(fileFields.length > 0) {
        //Save file fields values into the local storage
        const promises = []
        for (const field of fileFields) {
            if(Array.isArray(data[field])) {
                for(var i = 0; i < data[field].length; i++) {
                    if(data[field][i] && data[field][i].length > 0) {
                        promises.push(deleteFileFieldFile(getCollectionName(collectionName), data.id || TEMP_TOOL_FORM_ID, `${field}_${i}`))
                    }
                }
      
            } else {
                if(data[field] && data[field].length > 0) {
                    promises.push(deleteFileFieldFile(getCollectionName(collectionName), data.id || TEMP_TOOL_FORM_ID, field))
                }
            }
        }

    }
  }

  const deleteServerFiles = (data: Message): Promise<void> => {
    return new Promise((resolve, reject) => {
        resolve()
    })
  }
  const deleteDocFiles = (data: Message): Promise<void> => {
    return new Promise(async (resolve, reject) => {

        try {
            deleteLocalFiles(data)
            await deleteServerFiles(data)
            resolve()
        } catch(e) {
            reject(e)
        }
    })
  }

  const deleteData = (data: Message): Promise<void> => {
    return new Promise((resolve, reject) => {
        if(data.id == newData?.id) {
            setNewData(null);
            setSelectedData(null)
            return resolve()
        }

        // Check if db is null before editing the data
        if (!db) {
            return reject(new Error("Storage awaiting initialization"))
        }

        // Create a reference to the collection in Firestore
        const dataRef = doc(db, `${collectionName? collectionName : "other_tools_data"}/${data.id}`);
        
        //Delete all saved file fields and possibly server files
        deleteDocFiles(data)
        .then(() => {
            deleteDoc(dataRef)
            .then(() => {
                resolve()
            })
            .catch((error: any) => {
                console.error("Error updating data:", error);
                setError(error)
                reject(error)
            });
        })
        .catch((error: any) => {
            console.error("Error updating data:", error);
            setError(error)
            reject(error)
        });
        
    })
  }

  return {
    dataList, newData, setNewData, selectedIsNew,
    loadingData, dataError,
    selectedData, setSelectedData,
    initData, updateNewData, createData,
    editData, deleteData
  };
};

export default useDataSource;