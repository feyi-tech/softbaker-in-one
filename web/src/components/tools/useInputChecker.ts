import { useState } from "react"

interface CheckHandler {
    waitTime: number,
    checker: (currentValue: string) => Promise<boolean>
}
interface InputChecker { 
    error?: string | null,
    checkHandler: (v: any) => CheckHandler,
    [x: string]: any
}
const useInputChecker = (onCheck: (value: any, optionalData?: {[x: string]: any}) => string | null, errorKey?: string | null, checkHandlerKey?: string | null): InputChecker => {
    const [error, setError] = useState<string | undefined | null>()

    const checkHandler = (v: any) => {
        return {
          waitTime: 0,
          checker: (currentValue: string, optionalData?: {[x: string]: any}): Promise<boolean> => new Promise((resolve, reject) => {
            const error = onCheck(currentValue, optionalData)
            if(!error) {
                setError("")
                resolve(true)

            } else {
                setError(error)
                resolve(false)
            }/*
            if(currentValue && currentValue.length > 0) {
              setError("")
              resolve(true)
    
            } else {
                setError("Please enter the landing airport.")
                resolve(false)
            }*/
          })
        }
    }

    const result: InputChecker = {
        error, checkHandler
    }
    if(errorKey) result[errorKey] = error
    if(checkHandlerKey) result[checkHandlerKey] = checkHandler

    return result
}

export default useInputChecker