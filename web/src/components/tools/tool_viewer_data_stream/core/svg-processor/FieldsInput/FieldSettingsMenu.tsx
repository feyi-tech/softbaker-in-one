import ModalPop from "@/root/src/components/widgets/ModalPop"
import { Box, HStack, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaCogs, FaTrash } from "react-icons/fa"
import { Doc, Field, Fields, FileMap, MaskMap, TextSelectSettings } from "softbaker-svg"
import CuteButton from "@/root/src/components/widgets/CuteButton"
import InputBox from "@/root/src/components/widgets/InputBox"
import { entitiesToCharacters } from "@/root/src/utils/getSvg"
import InputWithSuggestion from "@/root/src/components/widgets/ToolsElements/InputWithSuggestion"
import { ALL_FIELD_TYPES } from "../../../constants"
import Swal from "sweetalert2"

interface FieldSettingsMenus {
    fields: Fields,
    field: Field,
    images: FileMap,
    submitButtonText?: string | null, 
    onSettingsUpdated: (settings: Field, masks?: MaskMap | null) => void,
    onDelete: () => void
}

const FIELDS_SETTINGS = "FIELDS_SETTINGS"

interface SavedSettings {
    [fieldId: string]: {
        [fieldAttr: string]: {

        }
    }
}

const getSavedSettings = () => {
    const fieldsSavedSettingsRaw = localStorage.getItem(FIELDS_SETTINGS)
    let fieldsSavedSettings: SavedSettings = {}

    try {
        if(fieldsSavedSettingsRaw) fieldsSavedSettings = JSON.parse(fieldsSavedSettingsRaw)
    } catch(e) {}

    return fieldsSavedSettings
}


const FieldSettingsMenu: React.FC<FieldSettingsMenus> = ({ fields, field, images, submitButtonText, onSettingsUpdated, onDelete }) => {
    const [ settings, setSettings ] = useState<Field>({} as Field)
    const [ settingsErrors, setSettingsErrors ] = useState<Doc>({} as Doc)
    const [ originalImage, setOriginalImage ] = useState<string | null>(null)
    const [ processing, setProcessing ] = useState<boolean>(false)

    useEffect(() => {
        if(field) {
            const currentSettings = { ...field }
            
            let fieldsSavedSettings = getSavedSettings()
            
            if(!currentSettings.helperText && fieldsSavedSettings[field.id]?.helperText) {
                currentSettings.helperText = fieldsSavedSettings[field.id].helperText
            }
            if(!currentSettings.info && fieldsSavedSettings[field.id]?.info) {
                currentSettings.info = fieldsSavedSettings[field.id].info as string
            }
            if(!currentSettings.ruleMessage && fieldsSavedSettings[field.id]?.ruleMessage) {
                currentSettings.ruleMessage = fieldsSavedSettings[field.id].ruleMessage as string
            }
            if(!currentSettings.placeholder && fieldsSavedSettings[field.id]?.placeholder) {
                currentSettings.placeholder = fieldsSavedSettings[field.id].placeholder as string
            }
            if(!currentSettings.name && fieldsSavedSettings[field.id]?.name) {
                currentSettings.name = fieldsSavedSettings[field.id].name as string
            }
            if(!currentSettings.optional && fieldsSavedSettings[field.id]?.optional) {
                currentSettings.optional = fieldsSavedSettings[field.id].optional as boolean
            }
            setSettings(currentSettings)
        }
    }, [field])

    useEffect(() => {
        //console.info("pasrsedSvg:settings", settings)
    }, [settings])

    const [ showFieldSettings, setShowFieldSettings ] = useState<boolean>(false)
    const handleSettings = () => {
        setShowFieldSettings(true)
    }

    const updateSettings = (data: {[x: string]: string | boolean | TextSelectSettings}) => {
        if(field.id) {
            if(Object.values(data).length > 0) {
                const value = Object.values(data)[0]
                const isEmpty = typeof value === "string" && value.length == 0
                if(!isEmpty) {
                    let fieldsSavedSettings = getSavedSettings()
                    fieldsSavedSettings[field.id] = {
                        ...(fieldsSavedSettings[field.id] || {}),
                        ...data
                    }
                    localStorage.setItem(FIELDS_SETTINGS, JSON.stringify(fieldsSavedSettings))
                }
            }
            setSettings({
                ...settings,
                ...data
            })
        }
    }

    const handleSubmit = () => {
        if(processing) return
        if(settings?.type != field?.type) {
            Swal.fire({
                icon: "warning",
                title: "Field Change Warning!!",
                text: `You're about to change this field type from ${field?.type} to ${settings?.type}! Changing field type without properly understanding how it affects the users can cause a bad user experience and might require deleting the tool and then re-uploading disruptively to fix.`,
                confirmButtonText: "I Understand, Continue", cancelButtonText: "Cancel",
                showConfirmButton: true, showCancelButton: true
            })
            .then(result => {
                setShowFieldSettings(false)
                if(result.isConfirmed) {
                    onSettingsUpdated(settings, null)
                } else {
                    onSettingsUpdated({
                        ...settings,
                        type: field?.type
                    }, null)
                }
            })

        } else {
            setShowFieldSettings(false)
            onSettingsUpdated(settings, null)
        }
    }
    
    const mapifyList = (listText: string) => {
        const map: { [key: string]: { name: string; value: string } } = {};
        const list: string[] = listText.split(",");
    
        for (const item of list) {
            const trimmedItem = item;
            const [keyPart, valuePart] = trimmedItem.split(":").map((part) => part);
            console.log("mapifyList:0", item, keyPart, valuePart)
    
            if (valuePart != undefined) {
                // If a colon and value are present
                const key = keyPart.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
                map[key] = { name: keyPart, value: valuePart };

            } else {
                // If no colon or value is present
                const key = keyPart.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
                map[key] = { name: keyPart, value: keyPart };
            }
        }
    
        console.log("mapifyList", map)
        return map;
    };
    const mapifyListReverse = (map: { [key: string]: { name: string; value: string } }) => {
        const items: string[] = [];
    
        for (const key in map) {
            const { name, value } = map[key];
            if (name === value) {
                items.push(name); // No colon if name and value are the same
            } else {
                items.push(`${name}:${value}`); // Include colon if name and value differ
            }
        }
    
        return items.join(",");
    };

    return (
        <>
            <HStack>
                <Box onClick={handleSettings} cursor="pointer" mr={4}>
                    <FaCogs size="1.5rem" color={["gen", "defgen", "date"].includes(field.type)? "#dd6b20" : field.type == "text_select"? "#3182ce" : "#38a169" } />
                </Box>
                <Box onClick={onDelete} cursor="pointer" justifyContent="flex-start" alignItems="center">
                    <FaTrash size="1.2rem" color="#e53e3e" />
                </Box>
            </HStack>
            {
              showFieldSettings?
                <ModalPop title={`${field.name || ""} settings`} isOpen={true} onClose={() => { setShowFieldSettings(false) }} 
                dontCloseOnOverlayClick={processing}>
                    <Box height="50vh" pos="relative" overflowY="auto" overflowX="hidden" px="0.5rem">
                        <Text as="div" display="none">{field.type}</Text>
                        <InputBox w="100%" mb={4}
                            title="Field Type"
                            placeholder="Select Field Type"
                            helperText="Select the type you want for this field."
                            value={settings?.type} 
                            type={InputBox.TYPES.select}
                            options={ALL_FIELD_TYPES} 
                            onOptionValue={(key: string) => key}
                            onOptionName={(key: any) => {
                                return key
                            }}
                            onChange={(value: string) => {
                                if(value) {
                                    setSettings({
                                        ...settings, 
                                        type: value
                                    })
                                }
                            }}
                            errorMessage={ settingsErrors["type"] }
                        />
                        {
                            ["gen", "defgen", "date"].includes(settings?.type)?
                                <InputWithSuggestion w="100%" 
                                    textAreaData={{
                                        id: "gen",
                                        key: "gen",
                                        title: "Text Generation Code",
                                        helperText: `${entitiesToCharacters(field.placeholder as string || "")}.`,
                                        info: `This is where you enter the code for the text generation: ${entitiesToCharacters(field.placeholder as string || "")}.`,
                                        type: InputBox.TYPES.textarea,
                                        value: settings?.code,
                                        onChange: (value: string) => {
                                            if(value) {
                                                setSettings({
                                                    ...settings, 
                                                    code: value
                                                })
                                            }
                                        },
                                        errorMessage: settingsErrors["code"]
                                    }}
                                    mb={4}
                                    
                                    delimiter={"{"}
                                    suggestions={Object.keys(fields)}
                                    onSuggestionSelected={(suggestion, position, newValue) => {
                                        if(newValue) {
                                            setSettings({
                                                ...settings, 
                                                code: newValue
                                            })
                                        }
                                    }}
                                />
                            : null
                        }
                        {
                            ["text_select"].includes(settings?.type)?
                                <InputBox w="100%"
                                id={`selections`}
                                key={`selections`}
                                title={`Options`}
                                mb={4}
                                helperText={"Separate the options you want to list with commas. Exaple: 'Blue:BLU, Green'"}
                                info={"This is where you list the options you want to show by separating them with commas."}
                                type={InputBox.TYPES.textarea}
                                value={mapifyListReverse(settings?.selections || {})}
                                onChange={(value) => {
                                    if(value) {
                                        updateSettings({
                                            selections: mapifyList(value)
                                        })
                                    }
                                }}
                                errorMessage={ settingsErrors["selections"] }
                            />
                            : null
                        }
                        {
                            ["image_upload", "faceshot"].includes(settings?.type)?
                                <InputBox w="100%"
                                    id={`upload`}
                                    key={`upload`}
                                    title={`File Rule`}
                                    mb={4}
                                    helperText={`Enter the rule of the file. e.g "For best result, upload a 300x300 image."`}
                                    info={`This is where you enter the rule of the file. e.g "For best result, upload a 300x300 image."`}
                                    type={InputBox.TYPES.text}
                                    value={settings?.ruleMessage}
                                    onChange={(value) => {
                                        if(value) {
                                            updateSettings({
                                                ruleMessage: value
                                            })
                                        }
                                    }}
                                    errorMessage={ settingsErrors["ruleMessage"] }
                                />
                            : null
                        }
                        <InputBox w="100%"
                            id={`name`}
                            key={`name`}
                            title={`Name`}
                            mb={4}
                            helperText={"Enter the text that will show as the name of the field."}
                            info={"This is where you enter the text that will show as the name of the field."}
                            type={InputBox.TYPES.text}
                            value={settings?.name}
                            onChange={(value) => {
                                if(value) {
                                    if(settings.type != "image_select") {
                                        updateSettings({
                                            name: value
                                        })

                                    } else {
                                        const options: {[x: string]: any} = settings.options || {}
                                        const newOptions: {[x: string]: any} = {}
                                        for (const [key, option] of Object.entries(options)) {
                                            newOptions[key] = {
                                                ...option,
                                                name: (option?.name || "").replace(settings.name, value)
                                            }
                                        }
                                        updateSettings({
                                            name: value,
                                            options: newOptions
                                        })
                                    }
                                    
                                }
                            }}
                            errorMessage={ settingsErrors["name"] }
                        />
                        {
                            ["text", "textarea", "defgen", "text_select", "date"].includes(settings?.type)?
                                <InputBox w="100%"
                                id={`placeholder`}
                                key={`placeholder`}
                                title={`Placeholder`}
                                mb={4}
                                helperText={"Enter the text that will show behind the text field as an example input."}
                                info={"This is where you enter the text that will show behind the text field as an example input."}
                                type={InputBox.TYPES.textarea}
                                value={settings?.placeholder}
                                onChange={(value) => {
                                    if(value) {
                                        updateSettings({
                                            placeholder: value
                                        })
                                    }
                                }}
                                errorMessage={ settingsErrors["placeholder"] }
                            />
                            : null
                        }
                        {
                            settings?.type == "textarea"?
                            <>
                                <InputBox w="100%"
                                    id={`maxCharsPerLine`}
                                    key={`maxCharsPerLine`}
                                    title={`Max Chars Per Line`}
                                    mb={4}
                                    helperText={"Enter the maximum number of characters per line."}
                                    info={"This is where you enter the maximum number of characters per line."}
                                    type={InputBox.TYPES.number}
                                    value={settings?.maxCharsPerLine}
                                    onChange={(value) => {
                                        if(value) {
                                            updateSettings({
                                                maxCharsPerLine: value
                                            })
                                        }
                                    }}
                                    errorMessage={ settingsErrors["maxCharsPerLine"] }
                                    numberDecimals={0}
                                />
                                <InputBox w="100%"
                                    id={`maxChars`}
                                    key={`maxChars`}
                                    title={`Max Chars`}
                                    mb={4}
                                    helperText={"Enter the maximum number of total characters."}
                                    info={"This is where you enter the maximum number of total characters per line."}
                                    type={InputBox.TYPES.number}
                                    value={settings?.maxChars}
                                    onChange={(value) => {
                                        if(value) {
                                            updateSettings({
                                                maxChars: value
                                            })
                                        }
                                    }}
                                    errorMessage={ settingsErrors["maxChars"] }
                                    numberDecimals={0}
                                />
                            </>
                            : null
                        }
                        {
                            ["text", "textarea", "defgen"].includes(settings?.type)?
                            <InputBox w="100%"
                                id={`maxCharsBeforeScale`}
                                key={`maxCharsBeforeScale`}
                                title={`Font Scale-Down Max Chars`}
                                mb={4}
                                helperText={"Enter the maximum number of total characters before the font size is scaled down."}
                                info={"This is where you enter the maximum number of total characters the font size is scaled down."}
                                type={InputBox.TYPES.number}
                                value={settings?.maxTextBeforeScaleDown}
                                onChange={(value) => {
                                    if(value) {
                                        updateSettings({
                                            maxTextBeforeScaleDown: value
                                        })
                                    }
                                }}
                                errorMessage={ settingsErrors["maxTextBeforeScaleDown"] }
                                numberDecimals={0}
                            />
                            : null
                        }
                        {
                            settings?.type !== "gen"?
                            <InputBox w="100%"
                                id={`helper_text`}
                                key={`helper_text`}
                                title={`Helper Text`}
                                mb={4}
                                helperText={"Enter the text that will show below this field just like this."}
                                info={"This is where you enter the text that will show below this field."}
                                type={InputBox.TYPES.text}
                                value={settings?.helperText}
                                onChange={(value) => {
                                    if(value) {
                                        updateSettings({
                                            helperText: value
                                        })
                                    }
                                }}
                                errorMessage={ settingsErrors["helperText"] }
                            />
                            : null
                        }

                        {
                            !["qrcode", "checkbox", "gen"].includes(settings?.type)?
                            <>
                                <InputBox w="100%"
                                    id={`info`}
                                    key={`info`}
                                    title={`Info Text`}
                                    mb={4}
                                    helperText={"Enter the text that will show when the user clicks the info icon on this field."}
                                    info={"This is where you enter the text that will show when the user clicks the info icon on this field just like this."}
                                    type={InputBox.TYPES.textarea}
                                    value={settings?.info}
                                    onChange={(value) => {
                                        if(value) {
                                            updateSettings({
                                                info: value
                                            })
                                        }
                                    }}
                                    errorMessage={ settingsErrors["info"] }
                                />
                                <InputBox w="100%"
                                    id={`optional`}
                                    key={`optional`}
                                    title={`Make Optional`}
                                    mb={4}
                                    helperText={"Enable this if you want this field to be optional."}
                                    type={InputBox.TYPES.checkbox}
                                    value={settings?.optional}
                                    onChange={(value) => {
                                        updateSettings({
                                            optional: value
                                        })
                                    }}
                                    errorMessage={ settingsErrors["optional"] }
                                />
                            </>
                            : null
                        }

                        <InputWithSuggestion w="100%" 
                            textAreaData={{
                                id: "visibility",
                                key: "visibility",
                                title: <Text as="div">Visibility Anchor<br />(CompareCodeResult == ToThis)</Text>,
                                helperText: "Enter the field comparison conditional visibility code",
                                info: `This is where you enter the field comparison conditional visibility code.`,
                                type: InputBox.TYPES.textarea,
                                value: settings?.visibility_code,
                                onChange: (value: string) => {
                                    if(value) {
                                        setSettings({
                                            ...settings, 
                                            visibility_code: value
                                        })
                                    }
                                },
                                errorMessage: settingsErrors["code"]
                            }}
                            mb={4}
                            
                            delimiter={"{"}
                            suggestions={Object.keys(fields)}
                            onSuggestionSelected={(suggestion, position, newValue) => {
                                if(newValue) {
                                    setSettings({
                                        ...settings, 
                                        visibility_code: newValue
                                    })
                                }
                            }}
                        />
                    </Box>
                    <Box mb="1rem">
                        <CuteButton status="warning" mb="1rem" onClick={handleSubmit} disabled={processing}>
                            { processing? "Please wait..." : (submitButtonText || "Submit Settings") }
                        </CuteButton>
                    </Box>
                </ModalPop>
                : null
            }
        </>
    )
    
}

export default FieldSettingsMenu