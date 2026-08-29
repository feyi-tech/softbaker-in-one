import { Box, Flex, FormControl, HStack, Image, Text } from "@chakra-ui/react";
import InfoLabel from "../../InfoLabel";
import InputBox from "../../InputBox";
import React, { useEffect, useState } from "react";
import ModalPop from "../../ModalPop";
import UploadInput from "../UploadInput";
import { Template as TemplateProps, Templates } from "softbaker-svg";
import { FaTrash } from "react-icons/fa";
import { getCorsSafeR2ImageUrl, getR2ImageCrossOrigin } from "@/root/src/utils/r2";


const Template: React.FC<TemplateProps> = ({ id, name, logo, onDelete, ...props }) => {
    
    return (
        <HStack cursor="pointer" justifyContent="space-between" alignItems="flex-end" mb={1} mx="0.5rem" {...props}>
            <HStack justifyContent="flex-start" alignItems="flex-end">
                <Image src={getCorsSafeR2ImageUrl(logo) || "/res/svg-icon.png"} w="35px" h="35px" borderRadius="5px" border="1px solid #dfdfdf" crossOrigin={getR2ImageCrossOrigin(logo)} />
                <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{ name || "No name yet" }</Text>
            </HStack>
            {
                onDelete?
                <Box p="0.5rem" onClick={() => {
                    onDelete(id)
                }}>
                    <FaTrash color="#e53e3e" />
                </Box>
                : null
            }
        </HStack>
    )
}

interface TemplateSelector {
    id: string,
    title: string,
    templates: Templates,
    createdTemplatesKeys?: string[] | null,
    value?: TemplateProps | null,
    onChange: (template: TemplateProps | null) => void,
    onNewTemplateSvgUploaded?: (file: File, base64SvgString: string | null) => void,
    disabled?: boolean,
    info?: string,
    helperText?: string,
    errorMessage?: any,
    onDelete?: (id: string) => void,
    contactLink?: string | null,
    [x: string]: any
}

const TemplateSelector: React.FC<TemplateSelector> = ({ 
    id, title, templates, createdTemplatesKeys, value, onChange, onNewTemplateSvgUploaded, disabled, errorMessage, 
    info, helperText, onDelete, contactLink,
    ...props 
 }) => {

    const [ showTemplates, setShowTemplates ] = useState<boolean>(false)
    const [ template, setTemplate ] = useState<TemplateProps | null>()
    const [ templateKeys, setTemplateKeys ] = useState<string[]>([])

    useEffect(() => {
        if(value) {
            setTemplate(value)
        }
    }, [value])
    
    return (
        <Box {...props}>
          <FormControl opacity={disabled? 0.4 : 1} cursor={disabled? "not-allowed" : "pointer"}>
              <InfoLabel textTransform={"capitalize"} info={info}>{title}</InfoLabel>
              <HStack className="image-selector-button" onClick={(e: any) => { 
                  e.preventDefault(); 
                  if(!disabled) {
                      setShowTemplates(true)
                  } 
              }}>
                  { template? <Image src={getCorsSafeR2ImageUrl(template.logo) || "/res/svg-icon.png"} w="35px" h="35px" borderRadius="5px" border="1px solid #dfdfdf" crossOrigin={getR2ImageCrossOrigin(template.logo)} /> : null }
                  <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                      { template? template.name || "No name yet" : "Select Template" }
                  </Text>
              </HStack>
          </FormControl>
          <InputBox type={InputBox.TYPES.none} helperText={helperText} errorMessage={errorMessage} />
          {
              showTemplates?
              <ModalPop title={title} isOpen={true} onClose={() => { setShowTemplates(false) }}>
                {
                    onNewTemplateSvgUploaded?
                    <HStack>
                        <UploadInput showAsButton
                            isOtherFiles  w="100%"
                            id={`Form_${id}logo`}
                            key={`Form_${id}logo`}
                            title={`Add Template`} mb={4}
                            info="This is where you upload your SVG file to generate a template from."
                            helperText="Click to select upload an SVG file to use as a template."
                            message="Drag and Drop file here"
                            hoverMessage="Drop the file here"
                            ruleMessage="Make sure you're uploading a .svg file."
                            useImageText="Use File"
                            onChange={(file, value) => {
                                setShowTemplates(false)
                                onNewTemplateSvgUploaded(file as File, value as string)
                            }}
                        />
                    </HStack>
                    : null
                }
                  
                <Box height="50vh" pos="relative" overflowY="auto">
                {
                    Object.values(templates).map((template, index) => (
                        <Template key={index} {...template} onClick={() => {
                                setShowTemplates(false)
                                onChange(template)
                            }} 
                            border={ value && value.id === template?.id ? "1px dashed" : "none" } 
                            borderRadius={ value && value.id === template?.id ? "5px" : "0px" }
                            _hover={ 
                                {
                                    opacity: "0.4"
                                }
                                }
                            onDelete={createdTemplatesKeys && createdTemplatesKeys.length > 0 && !createdTemplatesKeys.includes(template.id)? onDelete : null}
                        />
                    ))
                }
                {
                    !onNewTemplateSvgUploaded && contactLink?
                    <Box w="100%" textAlign="center" fontSize="14px" pb="0.5rem">
                        <Text as="div">Can't find the type you want?</Text>
                        <Text as="a" href={contactLink} target="_blank" color="#38a169" textDecoration="underline">Click here to tell us what you want.</Text>
                    </Box>
                    : null
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

export default TemplateSelector
