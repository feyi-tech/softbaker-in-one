import { Timestamp } from "firebase/firestore"

export interface StaticTool {
    id: string,
    siteUrl: string,
    mobileVideoUrl?: string | null,
    is_static: true,
    desktopVideoUrl?: string | null,
    name: string,
    isActive: boolean,
    isHidden: boolean,
    create_price: number,
    create_price_discount: number,
    update_price: number,
    allow_freemium: boolean,
    create_price_is_monthly: boolean,
    yearly_price?: number,
    quarterly_price?: number,
    rank: number,
    siteLogoUrl?: string | null,
    icon?: string,
}

export interface DynamicTool {
    id: string,
    authorId: string,
    createdAt: Timestamp,
    icon: string,
    allow_freemium: boolean,
    update_price: number,
    is_static: boolean,
    isActive: boolean,
    is_freemium: boolean,
    name: string,
    description: string,
    create_price: number,
    isHidden: boolean,
    youtube: string,
    templates_url: string,
    updatedAt: Timestamp,
    templates: DynamicTemplate[]
}

export interface DynamicTemplate {
    id: string,
    name: string,
    logo: string,
    data_url: string,
    is_default?: boolean,
    split_on_download?: boolean,
    thumbnail: string
}

export interface ToolsData {
    totalUpdates?: number,
    lastUpdatedOn?: string,
    previouslyUpdatedOn?: string,
    tools?: (StaticTool | DynamicTool)[],
    toolsById?: {[x: string]: DynamicTool} | null,
    toolsByTemplatesUrl?: {[x: string]: DynamicTool} | null,
    getTool: (toolId: string) => DynamicTool | null
}