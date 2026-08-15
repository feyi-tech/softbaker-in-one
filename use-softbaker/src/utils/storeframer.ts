import { 
    IS_TEST, 
    STORE_FRAME_ID 
} from "./c";
import { USE_SOFT_BAKER_REJECT_PREFIX, USE_SOFT_BAKER_RESOLVE_PREFIX, savePromise } from "./f";

const randTransactionKey = () => {
    return `${Math.round(Math.random() * 10000000000000)}`
}
const saveToStoreFrame = (key: string, value: string, storageType: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Get reference to the iframe
        const iframe = document.getElementById(STORE_FRAME_ID) as HTMLIFrameElement | null;
        if(iframe) {
            const transactionKey = randTransactionKey()
            savePromise(transactionKey, resolve, reject)
            // Send a message to the iframe to save to cookies
            iframe.contentWindow?.postMessage({
                key, value, storageType, transactionKey
            }, IS_TEST? "test.com" : "live.com");

        } else {
            reject(new Error("StoreFrame not found!"))
        }
    })
}
const getFromStoreFrame = (key: string, storageType: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Get reference to the iframe
        const iframe = document.getElementById(STORE_FRAME_ID) as HTMLIFrameElement | null;
        if(iframe) {
            const transactionKey = randTransactionKey()
            savePromise(transactionKey, resolve, reject)
            // Send a message to the iframe to save to cookies
            iframe.contentWindow?.postMessage({
                key, storageType, transactionKey
            }, IS_TEST? "test.com" : "live.com");

        } else {
            reject(new Error("StoreFrame not found!"))
        }
    })
}

export const saveToStoreFrameCookie = (key: string, value: string): Promise<void> => {
    return saveToStoreFrame(key, value, "cookie")
}
export const saveToStoreFrameLocalStorage = (key: string, value: string): Promise<void> => {
    return saveToStoreFrame(key, value, "localStorage")
}
export const saveToStoreFrameSessionStorage = (key: string, value: string): Promise<void> => {
    return saveToStoreFrame(key, value, "sessionStorage")
}

export const getFromStoreFrameCookie = (key: string): Promise<any> => {
    return getFromStoreFrame(key, "cookie")
}
export const getFromStoreFrameLocalStorage = (key: string): Promise<any> => {
    return getFromStoreFrame(key, "localStorage")
}
export const getFromStoreFrameSessionStorage = (key: string): Promise<any> => {
    return getFromStoreFrame(key, "sessionStorage")
}

export const attachStoreFrame = () => {
    const iframe = document.getElementById(STORE_FRAME_ID) as HTMLIFrameElement | null;

    if (!iframe) {
        // Create an iframe element
        const newIframe = document.createElement('iframe');
        newIframe.id = STORE_FRAME_ID;
        const origin = IS_TEST ? "test.com" : "live.com";
        newIframe.src = `${origin}/storeframe`;
        newIframe.style.display = 'none !important';

        // Create a script element
        const script = document.createElement('script');
        script.textContent = `
            // Define resolvePromise and rejectPromise outside the event listener
            const resolvePromise = (promiseId, data) => {
                if (window["${USE_SOFT_BAKER_RESOLVE_PREFIX}" + promiseId]) {
                    window["${USE_SOFT_BAKER_RESOLVE_PREFIX}" + promiseId](data);
                    delete window["${USE_SOFT_BAKER_RESOLVE_PREFIX}" + promiseId];
                    delete window["${USE_SOFT_BAKER_REJECT_PREFIX}" + promiseId];
                }
            };

            const rejectPromise = (promiseId, error) => {
                if (window["${USE_SOFT_BAKER_REJECT_PREFIX}" + promiseId]) {
                    window["${USE_SOFT_BAKER_REJECT_PREFIX}" + promiseId](error);
                    delete window["${USE_SOFT_BAKER_RESOLVE_PREFIX}" + promiseId];
                    delete window["${USE_SOFT_BAKER_REJECT_PREFIX}" + promiseId];
                }
            };

            // Listen for messages from the iframe
            window.addEventListener('message', (event) => {
                // Verify the origin of the message for security
                if (event.origin !== '${origin}') {
                    return;
                }

                const { transactionKey, key, value, errorMessage, storageType, type } = event.data;
                if (type === "write" || type === "remove") {
                    resolvePromise(transactionKey, null);
                } else if (type === "read") {
                    resolvePromise(transactionKey, value);
                } else if (type === "error") {
                    rejectPromise(transactionKey, new Error(errorMessage));
                }
            });
        `;

        // Append the iframe and script elements to the document body
        document.body.appendChild(newIframe);
        document.body.appendChild(script);
    }
};