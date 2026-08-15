export interface Doc {[x: string]: any}
export interface FileMap {[x: string]: string}
export interface FileImage {
    id: string;
    image: File;
}

export interface FilterArgs {
    [x: string]: any
}

export interface Filters {
    [x: string]: {
        id: string,
        filter: (base64ImageString: string, args?: FilterArgs | null) => Promise<string>;
        isAutomatic?: boolean,
        render?: any//React.FC<{ filterArgs?: FilterArgs | null; setFilterArgs: (newFilterArgs: FilterArgs) => void, filterImage?: string | null, onShowSvgArgsInput?: () => void }> | null;
    };
}

export interface Declaration {
    property: string,
    value: string
}

export interface CssDeclarations {
    declarations: Declaration[],
    shouldReplace?: boolean
}

export interface CssAction {
    [identifier: string]: CssDeclarations
}

export interface CssActions {
    if_selector?: CssAction | null,
    if_property?: CssAction | null,
    if_property_and_value?: CssAction | null
}

export interface Mask { filter_id: string, args?: FilterArgs | null }
export interface Filter { [filterId: string]: Mask | null }

export interface TextSelectSettings {
    [x: string]: {name: string, value: string}
}

//Example
/**
 * {
        Profile_Picture.upload: {
            Blur: {...}
            ImageTranform: {...}
        },
        Signature.sign: {
            Blur: {...}
            ImageTranform: {...}
        }
 *  }
 */
export interface MaskMap {
    [fieldId: string]: Filter | null
}

export interface MapWithName {
    [x: string]: { 
        name: string, 
        [x: string]: any 
    }
}

export interface FieldsData {
    is_freemium: boolean
    template_id: string
    [x: string]: any
}

export interface Fields extends MapWithName {
    [x: string]: Field
}
/*
export interface Field extends InputBoxProps {
    id: string
    name: string
    info?: string | null
    helperText?: string | null
    placeholder?: string | null
    type: string
    isEditable?: boolean
    index?: number | string | null
    options?: { [x: string]: Field }
    message?: string | null, 
    hoverMessage?: string | null, 
    ruleMessage?: string | null, 
    useImageText?: string | null
}*/
export interface Field {
    id: string
    name: string
    type: string
    isEditable?: boolean
    index?: number | string | null
    options?: { [x: string]: Field }
    selections?: { 
        [x: string]: {
            name: string,
            value: string
        } 
    }
    useImageText?: string | null
    optional?: boolean | null,
    [x: string]: any
}

export interface Template {
    id: string,
    name: string,
    logo: string,
    is_default: boolean,
    data_url: string,
    split_on_download?: boolean,
    split_on_download_hr?: boolean,
    [x: string]: any
}

export interface TemplateData {
    svg: string,
    fields: Fields,
    images: FileMap,
    masks?: MaskMap | null,
    cssActions?: CssActions | null
}

export interface Templates extends MapWithName {
    [x: string]: Template
}

export interface TemplatesResults {
    templatesLoading: boolean, templatesError?: string | null,
    selectedTemplateLoading: boolean, selectedTemplateError?: string | null,
    parsingTemplate: boolean,
    templates: Templates,
    selectedTemplate?: Template | null,
    selectedTemplateData?: TemplateData | null,
    workingTemplate?: Template | null,
    workingTemplateData?: TemplateData | null, 
    setAsDefaulTemplate: ( is_default: boolean ) => void,
    setWorkingTemplate: (template: Template | null | undefined) => void, 
    setWorkingTemplateData: (template: TemplateData | null | undefined) => void,
    selectTemplate: (selectedTemplateId: string) => void,
    parseTemplateSvg: (svg: string, isNew: boolean) => Promise<{template: Template, templateData: TemplateData} | null>,
    saveTemplate: (onSetProgressStatus?: (message: string, pct?: number | null) => void) => Promise<string | null>,
    deleteTemplate: (id: string) => void,
    getDefaultTemplateId: (templates: Templates) => string,
    currentTemplateId?: string | null
}

export interface Font {
    name: string,
    id: string,
    file?: File | null,
    ext?: string | null,
    url?: string | null,
    dataUrl?: string | null,
    readError?: string | null,
    writeError?: string | null
}

export interface FontsMap {
    [x: string]: Font
}

export interface ImageUploadMaskInfo {
    imageId: string,
    filterId: string,
    mask: Mask
}