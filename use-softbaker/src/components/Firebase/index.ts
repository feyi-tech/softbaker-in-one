import { useEffect, useState } from 'react';
// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
//Analytics for web
import { Analytics, getAnalytics } from "firebase/analytics";
//Authentication for Web
import { getAuth, onAuthStateChanged } from "firebase/auth";
//Cloud Firestore for Web
import { Firestore, getFirestore, doc, onSnapshot, collection } from "firebase/firestore"; // Updated import
import { 
    getStorage, FirebaseStorage,
    getDownloadURL,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";
import { AdminInfo, Auth, User } from './data.type';
import { consoleLog } from '../../utils/f';
import { Config } from '../../theme.type';

const useFirebase = (config: Config) => {
    const [app, setApp] = useState<FirebaseApp | null | undefined>();
    const [analytics, setAnalytics] = useState<Analytics | null | undefined>();
    const [auth, setAuth] = useState<Auth | null | undefined>();
    const [db, setDb] = useState<Firestore | null | undefined>();
    const [user, setUser] = useState<User | null | undefined>();
    const [adminInfo, setAdminInfo] = useState<AdminInfo | null | undefined>();
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [storage, setStorage] = useState<FirebaseStorage | null | undefined>(); // Add storage state

    useEffect(() => {
        if(!config?.firebaseConfig) return
        // Initialize Firebase
        const theApp = initializeApp(config.firebaseConfig);
        const theDb = getFirestore(theApp);
        const theAuth = getAuth(theApp);
        const theAnalytics = getAnalytics(theApp);
        const theStorage = getStorage(theApp);

        setApp(theApp);
        setDb(theDb);
        setAuth(theAuth);
        setAnalytics(theAnalytics);
        setStorage(theStorage);

        setUser(null);
        const unsubscribe = onAuthStateChanged(theAuth, (user) => {
            setUser(user);
            setAuthLoading(false);
        });
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [config?.firebaseConfig]);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (user && db) {
            consoleLog("Firebase.AdminInfo: will listen to admin doc");
            // Listen to document changes at admins/{user.uid}
            unsubscribe = onSnapshot(doc(collection(db, "admins"), user.uid), (docSnapshot) => {
                try {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data() as AdminInfo;
                        setAdminInfo(data);
                        consoleLog("Firebase.AdminInfo: admin ", data);
                        
                    } else {
                        setAdminInfo(null); // Clear adminInfo if the document does not exist
                        consoleLog("Firebase.AdminInfo: noAdmin ");
                    }

                } catch(e) {
                    consoleLog("Firebase.AdminInfo: Error listening to admin document:1 ", e);
                    setAdminInfo(null); // Clear adminInfo on error
                }
            }, (error) => {
                consoleLog("Firebase.AdminInfo: Error listening to admin document:2 ", error);
                setAdminInfo(null); // Clear adminInfo on error
            });

        } else {
            setAdminInfo(null); // Clear adminInfo if user is not authenticated
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, db]);

    const uploadFile = (file: Blob | Uint8Array | ArrayBuffer, pathToFile: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!storage) {
                reject("File storage not initialized yet.");
            } else if (!file) {
                reject("Please provide the file to upload.");
            } else if (!pathToFile) {
                reject("Please provide the location to upload the file to.");
            } else {
                const fileRef = storageRef(storage, pathToFile);
                uploadBytes(fileRef, file)
                    .then((snapshot) => {
                        getDownloadURL(snapshot.ref)
                            .then((url) => {
                                resolve(url);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    };

    return {
        auth,
        db,
        user,
        setUser,
        adminInfo,
        authLoading,
        uploadFile,
    };
};

export default useFirebase;