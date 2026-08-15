import { useRouter } from "next/router";
import { useEffect } from "react";

const MAX_LOG_SIZE = 1024 * 20; // 10KB
const LOG_DOWNLOAD_ROUTE = "/status/download-debug";

interface LogTypes {
    error: "ERROR",
    info: "INFO",
    warning: "WARNING",
    warn: "WARNING"
}

export const LOGGER_LOG_TYPES: LogTypes = {
    error: "ERROR",
    info: "INFO",
    warning: "WARNING",
    warn: "WARNING"
};


const save = (logString: string) => {
    try {
        localStorage.setItem("APP_LOGS", logString);
        return true
    } catch (e) {
        if (e instanceof DOMException && e.name === "QuotaExceededError") {
            console.error("LocalStorage quota exceeded.");
            return false
        } else {
            console.error("Failed to save logs to localStorage", e);
            return true
        }
    }
}

const useLogger = () => {
    const { pathname } = useRouter()

    const logger = (data: string, type: "ERROR" | "INFO" | "WARNING") => {
        console.log(
            `${new Date().toISOString()} => [${type}] ${data}`, 
            window.localStorage? "window.localStorage.available" : "window.localStorage.NOTavailable", 
            localStorage? "localStorage.available" : "localStorage.NOTavailable"
        )
        if (window.localStorage) {
            let logs = [];
            try {
                logs = JSON.parse(localStorage.getItem("APP_LOGS") || "[]");
            } catch (e) {
                console.error("Failed to parse logs from localStorage", e);
            }

            logs.push(`${new Date().toISOString()} => [${type}] ${data}`);

            // Ensure log size does not exceed MAX_LOG_SIZE
            let logString = JSON.stringify(logs);
            while (new Blob([logString]).size > MAX_LOG_SIZE) {
                logs.shift(); // Remove the earliest log
                logString = JSON.stringify(logs);
            }

            var saved = save(logString)
            while (!saved) {
                logString = JSON.stringify(JSON.parse(logString).shift()); // Remove the earliest log
                saved = save(logString)
            }
        }
    };

    const downloadLogs = () => {
        if (window.localStorage) {
            try {
                const logs = JSON.parse(localStorage.getItem("APP_LOGS") || "[]");
                
                // Check if Blob is supported
                if (typeof Blob !== "undefined") {
                    // Create a Blob from the logs, ensuring it's a JSON file
                    const logBlob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
                    const logURL = URL.createObjectURL(logBlob);
                    const a = document.createElement("a");
                    a.href = logURL;
                    a.download = "APP_LOGS_FILE.json";
                    a.click();
                    URL.revokeObjectURL(logURL);
                } else {
                    // Fallback: Use a data URI with the logs as a JSON string
                    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
                    const a = document.createElement("a");
                    a.href = dataUri;
                    a.download = "APP_LOGS_FILE.json";
                    a.click();
                }
            } catch (e) {
                console.error("Failed to download logs", e);
            }
        }
    };    

    useEffect(() => {
        console.log("path", pathname)
        // Check if current path matches the download route and trigger log download
        if(pathname === LOG_DOWNLOAD_ROUTE) downloadLogs();
    }, [pathname])

    return {
        logger,
        downloadLogs
    };
};

export default useLogger;
