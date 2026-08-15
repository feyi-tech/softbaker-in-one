import { useEffect, useState } from "react"
import { Fields, FieldsData, getDefaultFieldsValue } from "softbaker-svg"


const useDefaultFieldsValue = (
    fieldsData?: FieldsData, 
    setFieldsData?: ((data: FieldsData) => void) | null,
    fields?: Fields | null,
    templateId?: string | null
): void => {

    const [ fieldString, setFieldString ] = useState<string>()
    const [ currentTemplateId, setCurrentTemplateId ] = useState<string>()

    useEffect(() => {
        const { newFieldString, newCurrentTemplateId, defaultFieldsData } = getDefaultFieldsValue(
            fieldsData, fields, templateId, fieldString, currentTemplateId
        )
        
        if(newFieldString) setFieldString(newFieldString)
        if(newCurrentTemplateId) setCurrentTemplateId(newCurrentTemplateId)
        if(defaultFieldsData && setFieldsData) setFieldsData(defaultFieldsData)

    }, [fields, fieldsData, setFieldsData, templateId])

    //return {  }
}

export default useDefaultFieldsValue