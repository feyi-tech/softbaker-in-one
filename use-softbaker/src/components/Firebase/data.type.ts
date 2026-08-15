import { Auth as A, User as U } from "firebase/auth"
import { Firestore } from "firebase/firestore"

export interface AdminInfo {
    uid: string,
    permissions: string[]
}
export interface User extends U {
    metadata: {
        [x: string]: any
    },
    [x: string]: any
}

export interface Auth extends A {
    [x: string]: any
}

export interface AuthResource {
    uploadFile: (file: Blob | Uint8Array | ArrayBuffer, pathToFile: string) => Promise<string>,
    auth: Auth | null | undefined,
    user?: User | null | undefined,
    adminInfo?: AdminInfo | null,
    authLoading?: boolean,
    db?: Firestore | null,
}