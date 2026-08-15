import { User } from "firebase/auth";
import { Message } from "../shipview/types";

export interface SHIPMENT_STATUS {
    processing: 'processing',
    inTransit: 'inTransit',
    delivered: 'delivered'
}
export interface SHIPMENT_STATUS_NAME {
    processing: 'Processing',
    inTransit: 'In transit',
    delivered: 'Delivered'
}

export const SHIPMENT_STATUS: SHIPMENT_STATUS = {
    processing: 'processing',
    inTransit: 'inTransit',
    delivered: 'delivered'
}

export const SHIPMENT_STATUS_NAME = {
    processing: 'Processing',
    inTransit: 'In transit',
    delivered: 'Delivered'
}

export interface Doc {
    [x: string]: any
}

export interface CurrentTimelineData {
    hasUndo: boolean,
    hasRedo: boolean,
    totalUpdates: number
}
export interface UseHistoryResult {
    addHistory: (documentId: string, shipment: Message) => void, 
    clearHistory: (documentId: string) => void,
    clearAllHistory: () => void,
    undo: (documentId: string) => Message | undefined,
    redo: (documentId: string) => Message | undefined,
    getCurrentTimeline: (documentId: string) => Message | undefined, 
    getCurrentTimelineData: (documentId: string) => CurrentTimelineData
}

export interface UseDataSourceResult {
    dataList: Message[], 
    newData?: Message | null,
    selectedData?: Message | null, 
    setNewData: (data: Message | null) => void, 
    selectedIsNew: () => boolean,
    loadingData: boolean, 
    dataError?: string | null, 
    setSelectedData: (data?: Message | null) => void,
    initData: () => Promise<Message>, 
    updateNewData: (data: Message) => Promise<Message>, 
    createData: (data: Message, user?: User | null) => Promise<Message>,
    editData: (data: Message, serverOnlySaveData?: Message | null) => Promise<Message>, 
    deleteData: (data: Message) => Promise<void>
}

export interface UseDataHandlerResult {
    savingData?: boolean, setSavingData: (savingData: boolean) => void,
    handleUpdateData: (updatedField: Message) => void, 
    handlePublishData: (isSubscriptionRenewal?: boolean, serverOnlySaveData?: Message | null) => Promise<Message>
}

export interface EmptyData {
    title: string, description: string, icon: any,
    dataSize: number,
    isLoading?: boolean,
    onActionButtonClicked?: () => void
}

export interface PublishTexts {
    noDataError: string,
    newTitle: string,
    updateTitle: string,
    updateMessage: string,
    freeTitle: string,
    freeMessage: string,
    paidTitle: string,
    paidMessage: string,
    newData: string,
    signInMessage: string,
    signUpMessage: string,
    createButtonText: string,
    noChatToListMessage: string,
    deleteWarning: string,
    saveSuccess?: string,
    updateSuccess?: string
}