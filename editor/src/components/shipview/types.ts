// types.ts

import { FieldValue } from "firebase/firestore";

export interface MenuItem {
    id: number;
    title: string;
    link?: string;
    linkIsExternal?: boolean;
    icon?: any | null;
    showIfRoom?: boolean;
    showAlways?: boolean;
    onlyDesktop?: boolean;
    onlyMobile?: boolean;
    onClick?: () => void;
  }
  
  export interface MenuOptionBadge {
    counts: number;
    status: "loading" | "success" | "info" | "warning" | "error" | null | undefined;
  }
  
  export interface Message {
    id: string,
    authorId: string | "uid", 
    sender?: string | null;
    content?: string | null;
    selected?: boolean | null;
    onClick?: (e: any) => void,
    itemName?: string | null, itemTime?: string | null, itemDescription?: string | null, itemBadge?: string | null,
    createdAt?: Date | FieldValue | null,
    updatedAt?: Date | FieldValue | null | "current_time",
    is_freemium?: boolean | null | undefined,
    [key: string]: any;
  }
  
  export interface Messenger {
    title?: string | null;
    subTitle?: any;
    chats: Message[];
    isLoadingChats: boolean;
    logoUrl?: string | null;
    menu: MenuItem[];
    singleChatMenu: MenuItem[];
    onMenuItemClicked: (menuId: number) => void;
    noChatSelectedContent: React.ReactNode;
    children: React.ReactNode;
    headerBg?: string | null;
    headerColor?: string | null;
    headerHeight?: string | null;
    mobileActionButton: React.ReactNode;
    noChatToListView: React.ReactNode;
    onChatTitle?: (message: Message) => string | null;
    renderChatItem: (message: Message) => React.ReactNode;
    onMenuOptionState: (id: number) => "show" | "hide" | "disable" | "loading";
    onMenuOptionBadge: (id: number) => MenuOptionBadge | null;
    selectedMessage: Message | null | undefined;
    setSelectedMessage: (message: Message | null | undefined) => void;
  }
  
  export interface Header {
    title?: string | null;
    subTitle?: any;
    logoUrl?: string | null;
    onBackClicked?: (() => void) | null;
    onMenuItemClicked?: (menuId: number) => void;
    onMenuOptionState?: (id: number) => "show" | "hide" | "disable" | "loading";
    onMenuOptionBadge?: (id: number) => MenuOptionBadge | null;
    menu: MenuItem[];
    bg?: any;
    background?: any;
    color?: any;
    height?: string | null;
    titleStyle?: {[x: string]: any}
    [x: string]: any
  }
  
  export interface Shipment {
    id: string;
    trackingNumber: string;
  }
  
  export interface ShippingFormProps {
    isNew: boolean;
    shipment: Shipment | null;
    saving: boolean | undefined;
    setSaving: (saving: boolean | undefined) => void;
    hasPendingSave: boolean;
    onUpdateShipment: (updatedField: Shipment) => void;
    onPublishShipment: () => Promise<Shipment>;
  }
  