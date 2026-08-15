import { Doc } from "../../../tools/index.types";

export interface Col { 
    key: string, title: string,
    valueFunc?: (row: Doc, index: number, totalItems: number) => any
    getValidationError?: (value: any) => string | null,
    isReadOnly?: boolean,
    isOptional?: boolean,
    helperText?: string | null,
    info?: string | null
    inputType?: string | null
    otherInputProps?: Doc
}