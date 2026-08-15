import { Fields, FieldsData } from "./types.ts"
import { textGenCodeParser } from "./textGenCodeParser.ts"
import { useDataForRandSeed } from "./utils.ts"
import { dateToTimestamp } from "./time.ts"


const getDefaultFieldsValue = (fieldsData?: FieldsData, fields?: Fields | null, templateId?: string | null, fieldString?: string | null, currentTemplateId?: string | null) => {
    const newFieldString = fields? JSON.stringify(fields) : undefined
    let defaultFieldsData
    let newCurrentTemplateId
    if(fieldsData && fields && fieldString != newFieldString) {
        if(templateId) newCurrentTemplateId = templateId
        const def: FieldsData = {} as FieldsData
        for(const field of Object.values(fields)) {
            
            if(field.type == "checkbox") {
                def[field.id] = true

            } else if(field.type == "date") {
                def[field.id] = dateToTimestamp(new Date())

            } else if(field.type == "defgen" && field.code) {
                if(fieldsData) {
                    def[field.id] = textGenCodeParser(field.code, fieldsData, useDataForRandSeed)
                }

            } else if(field.type == "image_select") {
                if(fieldsData && field?.options) {
                    def[field.id] = Object.values(field?.options)[0]?.id
                }

            } else if(field.type == "text_select") {
                if(fieldsData && field?.selections) {
                    def[field.id] = Object.values(field?.selections)[0]?.value
                }

            } else if(!["image_upload", "faceshot", "sign"].includes(field.type) && field.placeholder && typeof field.placeholder === "string" && field.placeholder.length > 0) {
                def[field.id] = field.placeholder
            }
        }
        
        if(Object.keys(def).length > 0) {
            defaultFieldsData = {
                ...def,
                is_freemium: true,
                template_id: templateId || ""
            }
        }
        
    } else if(currentTemplateId != templateId) {
        if(templateId) newCurrentTemplateId = templateId
        defaultFieldsData = {
            ...(fieldsData || {} as FieldsData),
            is_freemium: true,
            template_id: templateId || ""
        }
    }

    return {
        newFieldString, newCurrentTemplateId, defaultFieldsData
    }
}

export default getDefaultFieldsValue