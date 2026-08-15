import { Box, Flex, FormControl, HStack, Text } from "@chakra-ui/react";
import InfoLabel from "../../InfoLabel";
import InputBox from "../../InputBox";
import React, { useEffect, useState } from "react";
import ModalPop from "../../ModalPop";
import ICONS, { Icon as IconProps } from "./icons";


const Icon: React.FC<IconProps> = ({ id, name, element, ...props }) => {
    
    return (
        <HStack cursor="pointer" justifyContent="flex-start" alignItems="flex-end" mb={1} {...props}>
            <HStack w="35px" h="35px" justifyContent="center" alignItems="center" borderRadius="5px" border="1px solid #dfdfdf">
                { element() }
            </HStack>
            <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{ name }</Text>
        </HStack>
    )
}

export const IconFromId: React.FC<{ id?: string | null }> = ({ id }) => {
    const [ icon, setIcon ] = useState<IconProps | null>()

    useEffect(() => {
        if(id && ICONS[id]) {
            setIcon(ICONS[id])
        }
    }, [id])

    return icon?.element()
}

interface IconSelector {
    title: string,
    value?: string | null,
    onChange: (icon: string | null) => void,
    disabled?: boolean,
    info?: string,
    helperText?: string,
    errorMessage?: string | any[] | undefined,
    [x: string]: any
}

const IconSelector: React.FC<IconSelector> = ({ 
    title, value, onChange, disabled, errorMessage, 
    info, helperText,
    ...props 
 }) => {

    const [ showIcons, setShowIcons ] = useState<boolean>(false)
    const [ icon, setIcon ] = useState<IconProps | null>()

    const [ icons, setIcons ] = useState<IconProps[]>([])

    useEffect(() => {
        const ics = Object.values(ICONS).sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        setIcon(ics[0])
        setIcons(ics)
    }, [])

    useEffect(() => {
        //console.log("Icon: ", value, ICONS[value || ""]?.id, ICONS[value || ""]?.name, ICONS[value || ""]?.element)
        if(value && ICONS[value]) {
            setIcon(ICONS[value])
        }
    }, [value])

    return (
        <Box {...props}>
          <FormControl opacity={disabled? 0.4 : 1} cursor={disabled? "not-allowed" : "pointer"}>
              <InfoLabel textTransform={"capitalize"} info={info}>{title}</InfoLabel>
              <HStack className="image-selector-button" onClick={(e: any) => { 
                  e.preventDefault(); 
                  if(!disabled) {
                    setShowIcons(true)
                  } 
              }}>
                  <Flex width="25px" height="25px" justifyContent="center" alignItems="center" p="0px !important">
                      {
                          icon? <>{ icon.element() }</> : null
                      }
                  </Flex>
                  <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                      { icon? icon.name : "Select Icon" }
                  </Text>
              </HStack>
          </FormControl>
          <InputBox type={InputBox.TYPES.none} helperText={helperText} errorMessage={errorMessage} />
          {
              showIcons?
              <ModalPop title={title} isOpen={true} onClose={() => { setShowIcons(false) }}>
                  <Text as="div" mb="1rem">Select an Icon.</Text>
                  <Box height="50vh" pos="relative" overflowY="auto" px="0.5rem">
                    {
                        icons.map((icon, index) => (
                            <Icon key={index} {...icon} onClick={() => {
                                    onChange(icon.id)
                                    setShowIcons(false)
                                }} 
                                border={ value === icon.id ? "1px dashed" : "none" } 
                                borderRadius={ value === icon.id ? "5px" : "0px" } 
                                _hover={ 
                                    {
                                        opacity: "0.4"
                                    }
                                 }
                            />
                        ))
                    }
                  </Box>
              </ModalPop>
              : null
          }
  
          <style jsx global>{
              `
              .image-selector-button {
                  width: 100%;
                  min-width: 0px;
                  outline: 2px solid transparent;
                  outline-offset: 2px;
                  position: relative;
                  -webkit-appearance: none;
                  -moz-appearance: none;
                  -ms-appearance: none;
                  appearance: none;
                  transition-property: var(--chakra-transition-property-common);
                  transition-duration: var(--chakra-transition-duration-normal);
                  font-size: var(--chakra-fontSizes-md);
                  -webkit-padding-start: var(--chakra-space-4);
                  padding-inline-start: var(--chakra-space-4);
                  -webkit-padding-end: var(--chakra-space-10);
                  padding-inline-end: var(--chakra-space-10);
                  height: var(--chakra-sizes-10);
                  border-radius: var(--chakra-radii-md);
                  border: 1px solid;
                  border-color: inherit;
                  background: inherit;
              }`
          }</style>
        </Box>
    ) 
}

export default IconSelector