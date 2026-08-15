import React, { useEffect, useState } from "react";
import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from "react-beautiful-dnd";
import UploadInput from "@/components/widgets/ToolsElements/UploadInput";
import ImageSelector from "@/components/widgets/ToolsElements/ImageSelector";
import SignatureInput from "@/components/widgets/ToolsElements/SignatureInput";
import InputBox, { InputBoxProps } from "@/components/widgets/InputBox";
import { FaArrowDown, FaArrowUp, FaPlus } from "react-icons/fa";
import { capitalize, getFileFieldFile } from "@/root/src/utils/f";
import LoadingView from "@/root/src/components/widgets/LoadingView";
import FieldSettingsMenu from "./FieldSettingsMenu";
import { 
    Doc, Field, Fields, FieldsData, FileMap, MaskMap,
    buildImageSelectName, getImage, isImageDataUrl, showField, useDataForRandSeed 
} from "softbaker-svg";
import { entitiesToCharacters } from "@/root/src/utils/getSvg";
import { textGenCodeParser } from "@/root/src/utils/textGenCodeParser";
import { GALLERY_KEYS, gallerySaveFaceshot } from "@/root/src/utils/gallery";
import { SignatureDrawerInput } from "@/root/src/components/widgets/ToolsElements/types";
import FieldAdder from "./FieldAdder";
import Swal from "sweetalert2";
import { DIRECTIVES } from "../../../constants";
import { dateToTimestamp, timestampToDate } from "@/root/src/utils/time";
import useLogger, { LOGGER_LOG_TYPES } from "../hooks/useLogger";

interface FieldsInputProps extends InputBoxProps, SignatureDrawerInput {
    created: boolean; showFieldsErrors: boolean;
    fields: Fields;
    images: FileMap;
    data: Doc;
    masks?: MaskMap | null,
    isFieldsEditMode: boolean;
    isDragable: boolean;
    editableFields?: string[];
    onDragged?: (fields: Fields, masks?: MaskMap | null) => void;
    onAllFieldsDataChange: (data: FieldsData) => void;
    onFieldDataChange: (field: string, value: any) => void;
    fieldDataErrorMessage: { [x: string]: string | null | undefined  };
    onSetFieldDataErrorMessage: (error: { [x: string]: string | null | undefined }) => void
}


const idToDirective = (id: string, directive: string) => {
    if (DIRECTIVES.includes(directive)) {
        const parts = id.split(".");
        if (parts.length > 2) {
            // Extract the current directive part (if any) and the base id
            const baseParts = parts[0].split("@");
            const baseId = baseParts[0]; // The portion before any directive
            const newId = directive ? `${baseId}${directive}.${parts.slice(1).join(".")}` : id;
            id = newId;
        }
    }
    //console.log("onSettingsUpdated.2", id)
    return id; // Return the original id if directive is invalid
}

const FieldsInput: React.FC<FieldsInputProps> = ({
    created, showFieldsErrors,
    fields,
    images,
    masks,
    data,
    isFieldsEditMode,
    isDragable,
    onDragged,
    onFieldDataChange,
    onAllFieldsDataChange,
    fieldDataErrorMessage,
    onSetFieldDataErrorMessage, minSignatureWidth, maxSignatureWidth,
    editableFields
}) => {

    const { logger } = useLogger()

    const [orderedFields, setOrderedFields] = useState<Field[]>(
        Object.values(fields)
    );

    const [fieldsInitialised, setFieldsInitialsed] = useState<boolean>(false)

    useEffect(() => {
        setOrderedFields(Object.values(fields))
        const dataCopy = { ...data } as FieldsData
        for(const field of Object.values(fields)) {
            //Set the first image as the default in the selection
            if(field.type == "image_select" && field.options && !dataCopy[field.id]) {
                dataCopy[field.id] = Object.keys(field.options)[0]
            }
        }
        //console.info("parsedSvg:dataCopy ", fields, data, dataCopy)
        if(Object.keys(dataCopy).length > 0 && JSON.stringify(dataCopy) != JSON.stringify(data)) onAllFieldsDataChange(dataCopy)
    }, [fields, data])

    // Define the handleDragEnd function with TypeScript types
    const handleDragEnd = (result: DropResult): void => {
        if (!result.destination || !onDragged) return;

        const newOrder: Field[] = Array.from(orderedFields);
        const [movedField] = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, movedField);

        //setOrderedFields(newOrder);

        const updatedFields: Fields = newOrder.reduce<Fields>((acc, field, index) => {
            acc[field.id] = { ...field, index };
            return acc;
        }, {});

        console.info("parsedSvg:updatedFields", updatedFields)

        onDragged(updatedFields);
    };
    
    const onFieldDataCheckInfo = (field: Field, value: any) => {
        let error = null
        if(field.maxChars) {
            if(`${value}`.length > field.maxChars) {
                error =  `${field.name} should not be greater than ${field.maxChars} characters.`
            }
        } 
        onSetFieldDataErrorMessage({...fieldDataErrorMessage, [field.id]: error})
        return error
    }

    const renderInputField = (field: Field) => {
        const commonProps = {
            key: field.id,
            id: field.id,
            disabled: created && !(editableFields || []).includes(field.id),
            title: `${field.name || ""}${field.optional? "(Optional)" : ""}`,
            helperText: field.helperText || '',
            info: field.info || '',
            placeholder: entitiesToCharacters((field.placeholder || field.name || "") as string),
            onChange: (value: any) => {
                //console.log("onSettingsUpdated.3", "field.id", field.id, "value", value)
                onFieldDataCheckInfo(field, value)
                onFieldDataChange(field.id, value)
            },
            errorMessage: showFieldsErrors? fieldDataErrorMessage[field.id] : null,
            labelEndIcon: isFieldsEditMode? <FieldSettingsMenu 
            fields={fields} field={field} images={images} 
            onDelete={() => {
                Swal.fire({
                    icon: "warning",
                    title: "Delete field",
                    text: "Are you sure you want to delete this field?",
                    showCancelButton: true,
                    showConfirmButton: true,
                    confirmButtonText: "Yes, Delete",
                    cancelButtonText: "No!"
                })
                .then(result => {
                    if(result.isConfirmed) {
                        const updated = {
                            ...fields
                        }
                        delete updated[field.id]
                        if(!onDragged) return
                        const newOrder: Field[] = Object.values(updated);

                        const updatedFields: Fields = newOrder.reduce<Fields>((acc, field, index) => {
                            acc[field.id] = { ...field, index };
                            return acc;
                        }, {});

                        //console.info("parsedSvg:updatedFields", updatedFields)

                        onDragged(updatedFields);

                    }
                })
            }}
            onSettingsUpdated={(settings, updatedMasks) => {
                const updated = {
                    ...fields,
                    [settings.id]: { ...field, ...settings }
                }
                const mergedMasks = updatedMasks? {
                    ...(masks || {}),
                    ...updatedMasks
                } : null
                if(onDragged) onDragged(updated, mergedMasks)
                console.info("onSettingsUpdated.updated", updated, mergedMasks)

            }} /> : null,
            message: "Drag and Drop image here",
            hoverMessage: "Drop the image here",
            ruleMessage: field.ruleMessage || "Make sure you're uploading an image file.",
            useImageText: "Use Image"
        };

        if(!showField(field, fields, data)) {
            if(isFieldsEditMode) {
                return (
                    <InputBox width="100%"
                        {...commonProps}
                        value={data[field.id] || ""}
                        type={InputBox.TYPES.none}
                    />
                )

            } else {
                return null
            }
        }

        switch (field.type) {
            case "image_upload":
            case "faceshot":
                return <UploadInput galleryKey={field.type == "faceshot"? GALLERY_KEYS.faceshot : undefined}
                width="100%" {...commonProps} disabled={false}
                thumbnail={data[field.id] && !isImageDataUrl(data[field.id])? getFileFieldFile("other_tools_data", data.id, field.id) : data[field.id] && isImageDataUrl(data[field.id])? data[field.id] : undefined}
                maxFileSize={1024 * 1024}
                removeBackground={field.type == "faceshot"}
                imageCropArg={
                    field.type == "faceshot"?
                    {
                        message: "Make sure the image is cropped from the top of the head to above the chests with the shoulders visible as shown in the sample image.",
                        sampleImage: "/res/sample-image-crop.png"
                    } : undefined
                }
                onChange={(file, base64String) => {
                    if(base64String) {
                        try {
                            logger(`faceshot.base64String.size: ${base64String.length}`, LOGGER_LOG_TYPES.info)

                            if(field.type == "faceshot") {
                                try {
                                    gallerySaveFaceshot(base64String)
                                    logger("faceshot.saved.ok", LOGGER_LOG_TYPES.info)

                                } catch(e: any) {
                                    logger(`faceshot.save.error: ${e?.message}`, LOGGER_LOG_TYPES.error)
                                }
                            }

                            try {
                                onFieldDataCheckInfo(field, base64String)
                                logger("faceshot.onFieldDataCheckInfo.ok", LOGGER_LOG_TYPES.info)

                            } catch(e: any) {
                                logger(`faceshot.onFieldDataCheckInfo.error: ${e?.message}`, LOGGER_LOG_TYPES.error)
                            }
                            
                            try {
                                onFieldDataChange(field.id, base64String)
                                logger("faceshot.onFieldDataChange.ok", LOGGER_LOG_TYPES.info)
                                
                            } catch(e: any) {
                                logger(`faceshot.onFieldDataChange.error: ${e?.message}`, LOGGER_LOG_TYPES.error)
                            }

                        } catch(e: any) {
                            logger(`faceshot.x.error: ${e?.message}`, LOGGER_LOG_TYPES.error)
                                    
                        }

                    } else {
                        logger("faceshot.base64String.empty", LOGGER_LOG_TYPES.warning)
                    }
                }}
                />;
            case "sign":
                return <SignatureInput 
                            width="100%" {...commonProps} disabled={false}
                            minSignatureWidth={minSignatureWidth || 1} maxSignatureWidth={maxSignatureWidth || 1}
                            thumbnail={data[field.id] && !isImageDataUrl(data[field.id])? getFileFieldFile("other_tools_data", data.id, field.id) : data[field.id] && isImageDataUrl(data[field.id])? data[field.id] : undefined}
                        />
            case "image_select":
                const options = Object.values((field.options || {})).map(option => ({
                    id: option.id,
                    title: buildImageSelectName(field.name, option.name as string),
                    thumbnail: getImage(option.id, images, `_thumbnail`) as string,
                    image: {
                        base: getImage(option.id, images, `_512`) as string,
                        md: getImage(option.id, images, `_728`) as string,
                        lg: getImage(option.id, images) as string,
                    }
                })) || [];
                return <ImageSelector 
                    width="100%" {...commonProps} 
                    thumbnail={getImage(data[field.id], images, `_thumbnail`)}
                    imageTitle={buildImageSelectName(field.name, field.options? field.options[data[field.id]]?.name : "")}
                    onChange={(value: any) => {
                        const v = value as Field
                        onFieldDataCheckInfo(field, v.id)
                        onFieldDataChange(field.id, v.id)
                    }}
                    options={options}
                />;
            case "text":
            case "textarea":
                return (
                    <InputBox width="100%"
                        {...commonProps}
                        value={data[field.id] || ""}
                        type={field.type} 
                        maxTextLimit={field.maxChars? field.maxChars : undefined}
                    />
                );
            case "date":
                return (
                    <InputBox width="100%"
                        {...commonProps}
                        value={timestampToDate(data[field.id] as any)}
                        title={isFieldsEditMode? `${commonProps.title} (${entitiesToCharacters(field.placeholder as string || "")})` : commonProps.title}
                        type={field.type}
                        onChange={(value: any) => {
                            onFieldDataCheckInfo(field, dateToTimestamp(value))
                            onFieldDataChange(field.id, dateToTimestamp(value))
                        }}
                    />
                );
            case "text_select":
                return (
                    <InputBox w="100%"
                        {...commonProps}
                        placeholder={`-- Select ${capitalize(field.name || "")} --`}
                        value={data[field.id] || ""} 
                        type={InputBox.TYPES.select}
                        options={Object.keys(field.selections || {})} 
                        onOptionValue={(key: any) => key}
                        onOptionName={(key: any) => {
                            const name = (((field.selections || {})[key] || "")?.name || "").trim()
                            const value = (((field.selections || {})[key] || "")?.value || "").trim()
                            var valuePart = isFieldsEditMode && name != value? `(${value})` : ""
                            return `${name}${valuePart}`
                        }}
                    />
                );
            case "defgen":
                return (
                    <InputBox width="100%"
                        {...commonProps}
                        type={InputBox.TYPES.text}
                        value={data[field.id] || ""}
                    />
                );
            case "gen":
                if(!isFieldsEditMode) return null
                return (
                    <InputBox width="100%"
                        {...commonProps}
                        type={InputBox.TYPES.viewonly}
                        placeholder={""}
                        helperText={entitiesToCharacters(field.placeholder as string || "")}
                        value={textGenCodeParser(field.code, data, useDataForRandSeed, (dataKey, dataAsKey) => {
                            if(fields[dataKey]?.type == "text_select") {
                                return ((fields[dataKey].selections || {})[dataAsKey]?.value || "").trim()

                            }
                            return dataAsKey
                        })}
                    />
                );
            case "checkbox":
                return (
                    <InputBox
                        {...commonProps}
                        type={field.type}
                        value={data[field.id] || false}
                    />
                );
            case "qrcode":
                if(!isFieldsEditMode) return null
                return (
                    <Box w="100%" h="40px" border="1px solid #dfdfdf">
                        QR CODE | { commonProps.title }
                    </Box>
                );
            default:
                return null;
        }
    }

    if(!orderedFields || orderedFields.length == 0) {
        return (
            <LoadingView message={"Loading template assets..."} minH="100px" />
        )
    }
    return (
        <Box as={DragDropContext} onDragEnd={handleDragEnd} p="0px !important">
            {
                !isFieldsEditMode? null : 
                <FieldAdder my={4} onAdd={field => {
                    if(fields[field.id]) {
                        Swal.fire({
                            icon: "error",
                            title: "Field Error",
                            text: "Duplicate field error!"
                        })

                    } else {
                        if(!onDragged) return
                        const newOrder: Field[] = [field, ...orderedFields];

                        const updatedFields: Fields = newOrder.reduce<Fields>((acc, field, index) => {
                            acc[field.id] = { ...field, index };
                            return acc;
                        }, {});

                        console.info("parsedSvg:updatedFields", updatedFields)

                        onDragged(updatedFields);
                    }
                }} />
            }
            <Droppable droppableId="fields">
                {(provided) => (
                    <VStack
                        w="100%"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {orderedFields.map((field, index) => (
                            <Draggable
                                key={field.id}
                                draggableId={field.id}
                                index={index}
                                isDragDisabled={!isDragable}
                            >
                                {(provided: DraggableProvided) => {
                                    const fieldEl = renderInputField(field);
                                    if (!fieldEl) {
                                        // Return an empty div if fieldEl is null or undefined
                                        return (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ display: 'none' }}
                                            >
                                                {/* You can add a placeholder here */}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                width: "100%"
                                            }}
                                        >
                                            <HStack w="100%" justifyContent="center" alignItems={field.helperText || (["gen"].includes(field.type) && field.placeholder)? "center" : "flex-end"} mb={4}>
                                                <Box width={{ base: "100%", md: isDragable ? "90%" : "100%" }}>
                                                    {fieldEl}
                                                </Box>
                                                <Flex
                                                    display={{ base: "none", md: isDragable ? "flex" : "none" }}
                                                    w="40px" h="40px" border="1px dashed"
                                                    pos="relative"
                                                    justifyContent="center" alignItems="center"
                                                >
                                                    <Box as={FaArrowUp} position="absolute" mb="25px" size="10px" />
                                                    <Box as={FaArrowDown} position="absolute" mt="25px" size="10px" />
                                                </Flex>
                                            </HStack>
                                        </div>
                                    );
                                }}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </VStack>
                )}
            </Droppable>
        </Box>
    );
};

export default FieldsInput;