
export interface AdminInfoPermission {
    uid: string | null
    isAdmin: boolean
    isToolsEditor: boolean
    canCreateTools: boolean
    canEditTools: boolean
}