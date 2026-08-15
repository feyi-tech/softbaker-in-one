import { useEffect, useState } from "react"
import { useFrontbacked } from "use-frontbacked"
import { AdminInfoPermission } from "./type"

const ADMIN_PERMISSIONS = {
    canCreateTools: "can_create_tools",
    canEditTools: "can_edit_tools"
}

const defaultAdminInfoPermissions = {
    uid: null,
    isAdmin: false,
    isToolsEditor: false,
    canCreateTools: false,
    canEditTools: false
}

const useAdminInfoPermission = () => {
    const { adminInfo, user } = useFrontbacked()
    const [ permission, setPermission ] = useState<AdminInfoPermission>(JSON.parse(JSON.stringify(defaultAdminInfoPermissions)))

    useEffect(() => {
        if(!adminInfo?.permissions) {
            setPermission({} as AdminInfoPermission)

        } else {
            const perms: AdminInfoPermission = JSON.parse(JSON.stringify(defaultAdminInfoPermissions))
            perms.uid = adminInfo.uid
            perms.isAdmin = true
            perms.canCreateTools = adminInfo.permissions.includes(ADMIN_PERMISSIONS.canCreateTools)
            perms.canEditTools = adminInfo.permissions.includes(ADMIN_PERMISSIONS.canEditTools)
            perms.isToolsEditor = perms.canCreateTools || perms.canEditTools

            setPermission(perms)
        }
    }, [ adminInfo ])

    return permission

}

export default useAdminInfoPermission