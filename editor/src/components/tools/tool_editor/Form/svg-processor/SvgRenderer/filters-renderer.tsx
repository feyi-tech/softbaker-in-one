import InputBox from "@/root/src/components/widgets/InputBox";
import { Box, Checkbox, HStack, Image as ImageProp, Spinner, Text, VStack } from "@chakra-ui/react";
import { Filter, FilterArgs, Mask, FILTERS } from "frontbacked-svg";
import ModalPop from "@/root/src/components/widgets/ModalPop";
import React, { useEffect, useState } from "react";
import AppButton from "@/root/src/components/widgets/AppButton";
import CuteButton from "@/root/src/components/widgets/CuteButton";
//import FILTERS from "./filters";

/*
export interface Filters {
    [x: string]: {
        id: string,
        filter: (base64ImageString: string, args?: FilterArgs | null) => Promise<string>;
        isAutomatic?: boolean,
        render?: React.FC<{ filterArgs?: FilterArgs | null; setFilterArgs: (newFilterArgs: FilterArgs) => void, filterImage?: string | null, onShowSvgArgsInput?: () => void }> | null;
    };
}
*/
export interface FiltersRenderer {
    [x: string]: {
        id: string,
        render?: React.FC<{ filterArgs?: FilterArgs | null; setFilterArgs: (newFilterArgs: FilterArgs) => void, filterImage?: string | null, onShowSvgArgsInput?: () => void }> | null;
    };
}

const BLUR_RADII = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7",/* "0.8", "0.9", "1"*/]
// Define the FILTERS object with filter functions and corresponding React components
const FILTERS_RENDERER: FiltersRenderer = {
    Whitescale: {
        id: "Whitescale"
    },
    Blackscale: {
        id: "Blackscale"
    },
    Greyscale: {
        id: "Greyscale"
    },
    Redscale: {
        id: "Redscale"
    },
    Greenscale: {
        id: "Greenscale"
    },
    Bluescale: {
        id: "Bluescale"
    },
    Sepia: {
        id: "Sepia"
    },
    Guassianblur: {
        id: "Guassianblur",
        render: ({ filterArgs, setFilterArgs }) => {
            
            return (
                <Box w="100%">
                    <InputBox w="100%"
                        id={`filter_arg`}
                        key={`filter_arg`}
                        title={`Blur radius`}
                        mb={4}
                        helperText={"Select the blur radius."}
                        info={"This is where you select the blur radius."}
                        type={InputBox.TYPES.select}
                        value={filterArgs?.radius}
                        options={BLUR_RADII} 
                        onOptionValue={(key: string) => BLUR_RADII.includes(key)? key : BLUR_RADII[0]}
                        onOptionName={(key: string) => BLUR_RADII.includes(key)? key : BLUR_RADII[0]}
                        onChange={(value) => {
                            setFilterArgs({ ...filterArgs, radius: !isNaN(value)? value : value })
                        }}
                    />
                </Box>
            );
        }
    },/*
    Rotate: {
        id: "Rotate",
        filter: (base64ImageString, args) => new Promise((resolve, reject) => {
            resolve(base64ImageString)
        }),
        render: null
    },*/
    ImageTransform: {
        id: "ImageTransform",
        render: ({ filterArgs, setFilterArgs, onShowSvgArgsInput }) => {
            
            return (
                <Box w="100%">
                    <CuteButton status="warning" onClick={() => {
                        if(onShowSvgArgsInput) onShowSvgArgsInput()
                    }}>
                        Edit Rotation
                    </CuteButton>
                </Box>
            );
        }
    },
}

interface FiltersItem {
    filterElementId: string,
    id: string,
    value: FilterSelectItem,
    onChange: (vaue: FilterSelectItem) => void,
    onShowSvgArgsInput?: (elementId: string, mask: Mask) => void,
    onRender?: React.FC<{ filterArgs?: FilterArgs | null; setFilterArgs: (newFilterArgs: FilterArgs) => void, filterImage?: string | null, onShowSvgArgsInput?: () => void }> | null,
    [x: string]: any
}
interface FiltersInput {
    filterElementId: string,
    title: string,
    filters: Filter,
    isOpen: boolean,
    onClose: () => void,
    onComplete: (filters: Filter) => void,
    onShowSvgArgsInput?: (elementId: string, mask: Mask) => void
}

interface FilterSelectItem {
    id: string,
    selected: boolean,
    mask: Mask,
    onShowSvgArgsInput?: (elementId: string, mask: Mask) => void,
    render?: React.FC<{ filterArgs?: FilterArgs | null; setFilterArgs: (newFilterArgs: FilterArgs) => void, filterImage?: string | null, onShowSvgArgsInput?: () => void }> | null
}

interface FilterSelect {
    [filterId: string]: FilterSelectItem
}

const FiltersItem: React.FC<FiltersItem> = ({ filterElementId, id, value, onRender, onChange, onShowSvgArgsInput, ...props }) => {
    
    const onFilterArgsUpdate = (newFilterArgs: FilterArgs) => {
        onChange({
            ...value,
            mask: { 
                ...value.mask,
                args: { ...(value.mask.args || { }), ...newFilterArgs}
            }
        })
    }

    return (
        <VStack w="100%" justifyContent="flex-start" alignItems="flex-start" border="1px" p="0.5rem" borderRadius="3px" 
        {...props}>
            <Checkbox id={id} isChecked={value.selected}
            onChange={(e) => {
                onChange({
                    ...value,
                    selected: e.target?.checked
                })
            }}
            >
            { id }
            </Checkbox>
            {
                onRender?
                <Box mb={2} w="100%">
                    { 
                        onRender({
                            filterArgs: value.mask?.args, 
                            setFilterArgs: onFilterArgsUpdate,
                            onShowSvgArgsInput: () => {
                                if(onShowSvgArgsInput) {
                                    onShowSvgArgsInput(filterElementId, value.mask)
                                }
                            }
                        })
                    }
                </Box>
                : null
            }
        </VStack>
    )
}

const buildFilterSelect = (filters: Filter) => {
    const result:FilterSelect = { }
    const set = Object.values(FILTERS)//.filter(filter => !filter.isAutomatic)
    for(const filter of set) {
        result[filter.id] = {
            id: filter.id,
            selected: filters[filter.id] != null && filters[filter.id] != undefined,
            mask: filters[filter.id] || {
                filter_id: filter.id
            },
            render: FILTERS_RENDERER[`${filter.id}`].render
        }
    }

    return result
}

export const FiltersInput: React.FC<FiltersInput> = ({ filterElementId, title, filters, isOpen, onComplete, onClose, onShowSvgArgsInput }) => {

    const [ filterSelect, setFilterSelect ] = useState<FilterSelect>()

    useEffect(() => {
        if(!filterSelect) {
            setFilterSelect(
                buildFilterSelect(filters || {})
            )
        }
    }, [filters])

    useEffect(() => {
        //console.log("filterSelect: ", filterSelect)
    }, [filterSelect])

    const handleSubmit = () => {
        if(!filterSelect) {
            onClose()

        } else {
            const newFilters: Filter = { }
            const automaticFilters = Object.values(FILTERS).filter(f => f.isAutomatic)

            for( const f of automaticFilters) {
                if(filters[f.id]) {
                    newFilters[f.id] = filters[f.id]
                }
            }

            const selected = Object.values(filterSelect).filter(f => f.selected)
            for( const f of selected) {
                newFilters[f.id] = f.mask
            }

            onComplete(newFilters)
            onClose()
        }
    }

    return (
        <ModalPop title={title} isOpen={isOpen} onClose={onClose}
        dontCloseOnOverlayClick={true} w="100%" h="90vh">
            <VStack justifyContent="flex-start" alignItems="flex-start" w="100%" height="60vh" pos="relative" overflowY="auto" px="0.5rem">
            {
                !filterSelect?
                <HStack w="100%" justifyContent="center">
                    <Spinner size="xl" />
                </HStack>
                :
                Object.values(filterSelect).sort((a, b) => (a.id || "").localeCompare(b.id || "")).map((filter, index) => (
                    <FiltersItem 
                        key={index} 
                        id={filter.id}
                        value={filterSelect[filter.id]}
                        onRender={FILTERS_RENDERER[`${filter.id}`].render} 
                        filterElementId={filterElementId}
                        onShowSvgArgsInput={onShowSvgArgsInput}
                        onChange={(filterSelectItem: FilterSelectItem) => {
                            setFilterSelect({
                                ...filterSelect,
                                [filter.id]: filterSelectItem
                            })
                        }}
                        mb={4}
                    />
                ))
            }
            </VStack>
            <AppButton onClick={handleSubmit}>
                Submit Filters
            </AppButton>
        </ModalPop>
    )
}


export interface OccludedImage {
    id: string,
    image?: string | null
}

interface OccludedImagesInput {
    images: OccludedImage[],
    onSelected: (occludedImage: OccludedImage) => void,
    onClose: () => void
}

export interface OccludedImagesItem extends OccludedImage {
    onClick: () => void,
    [x: string]:any
}

const OccludedImagesItem: React.FC<OccludedImagesItem> = ({ id, image, onClick, ...props }) => {
    

    return (
        <HStack w="100%" justifyContent="flex-start" alignItems="flex-end" border="1px" p="0.5rem" borderRadius="3px" 
        {...props} onClick={onClick} cursor="pointer">
            <ImageProp src={image || ""} w="60px" h="60px" />
            <Text as="div">{id}</Text>
        </HStack>
    )
}

export const OccludedImagesInput: React.FC<OccludedImagesInput> = ({ images, onSelected, onClose }) => {


    return (
        <ModalPop title={"Select Image"} isOpen={true} onClose={onClose}
        dontCloseOnOverlayClick={true} w="100%" h="90vh">
            <VStack justifyContent="flex-start" alignItems="flex-start" w="100%" height="60vh" pos="relative" overflowY="auto" px="0.5rem">
            {
                images.length == 0?
                <HStack w="100%" justifyContent="center">
                    <Spinner size="xl" />
                </HStack>
                :
                images.map((image) => (
                    <OccludedImagesItem 
                        key={image.id}
                        id={image.id}
                        image={image.image}
                        onClick={() => {
                            onSelected(image)
                        }}
                        mb={4}
                    />
                ))
            }
            </VStack>
        </ModalPop>
    )

}