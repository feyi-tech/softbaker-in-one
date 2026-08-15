import { Box, Text, Image, HStack, FormControl, FormLabel, useBreakpointValue, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import ModalPop from "../../ModalPop"
import { InputRule, Signatory as SignatoryPropsInport } from "../../../tools/index.types"
import CuteButton from "../../CuteButton"
import { FaPlus } from "react-icons/fa"
import SignatoryEditor from "./SignatoryEditor"
import InputBox from "../../InputBox"
import InfoLabel from "../../InfoLabel"


interface SignatoryInput {
    maxSize: number,
    title: string,
    value: SignatoryPropsInport[],
    onChange: (signatories: SignatoryPropsInport[]) => void,

    submitButtonText: string,
    nameRule: InputRule,
    titleRule: InputRule,
    base64ImageRule: InputRule,
    helperText?: any, 
    info?: any,
    errorMessage?: any,

    disabled?: boolean,
    [x: string]: any
}

interface SignatoryProps extends SignatoryPropsInport {
    onClick: () => void
}


const Signatory: React.FC<SignatoryProps> = ({ name, title, base64Url, onClick }) => {

    return (
        <HStack border="1px dashed #dfdfdf" borderRadius="4px" p="4px" onClick={onClick}>
            <Box width="auto" height="35px" bg="#dfdfdf">
                {
                    base64Url? <Image src={base64Url} width="auto" height="35px" objectFit="cover" /> : null
                }
            </Box>
            <VStack justifyContent="flex-start" alignItems="flex-start" gap="0 !important">
                <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" 
                fontSize="14px"
                mb="0px !important"
                fontStyle={"normal"}>
                    {name}{title && title.length > 0? `(${title})` : ''}
                </Text>
                <HStack w="100%" justifyContent="center">
                    <Text as="div" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" 
                    textAlign="center" fontSize="12px"
                    fontStyle={"normal"}>
                        { "Click to edit" }
                    </Text>
                </HStack>
            </VStack>
        </HStack>
    )
}
const SignatoryInput: React.FC<SignatoryInput> = ({ 
    maxSize, title, value, onChange, disabled, 

    submitButtonText,
    nameRule, titleRule, base64ImageRule,

    helperText, info,
    errorMessage,

    ...props 
}) => {

    const [ showSignatory, setShowSignatory ] = useState<number>(0)

    return (
      <Box {...props}>
        <FormControl opacity={disabled? 0.5 : 1} cursor={disabled? "not-allowed" : "pointer"}>
            
            <InfoLabel textTransform={"capitalize"} info={info}>{title}</InfoLabel>
            <Box className="input-container">
                {
                    (value && value.length > 0)?
                    <HStack className="image-selector-button" h="auto !important" p="0.5rem"
                    justifyContent="flex-start" alignItems="flex-start" flexWrap="wrap">
                        {
                            value.map((v, index) => (
                                <Signatory name={v.name} title={v.title} base64Url={v.base64Url} onClick={() => {
                                    //Edit the current signatures
                                    if(!disabled) setShowSignatory(index + 1)
                                }} />
                            ))
                        }
                    </HStack>
                    : 
                    null
                }
                
                {
                    (value || []).length < maxSize && !disabled?
                    <CuteButton iconRight={<FaPlus />} my="0.5rem" status="warning" onClick={(e: any) => { 
                        e.preventDefault(); 
                        //Initiate adding new signatory
                        if(!disabled) setShowSignatory((value || []).length + 1) 
                    }}>
                        {value && value.length > 0? `Click to add more ${title}` : `Click to add ${title}`}
                    </CuteButton>
                    : null
                }
            </Box>
            <InputBox type={InputBox.TYPES.none} helperText={!disabled? helperText : null} errorMessage={errorMessage} />
        </FormControl>
        {
            showSignatory?
            <SignatoryEditor 
                //Allow delete if it's an edit
                allowDelete={value && showSignatory <= value.length}
                title={!value || showSignatory > value.length? null : value[showSignatory - 1].title}
                name={!value || showSignatory > value.length? null : value[showSignatory - 1].name}
                base64Url={!value || showSignatory > value.length? null : value[showSignatory - 1].base64Url}

                submitButtonText={submitButtonText}
                onClose={() => {
                    setShowSignatory(0)
                }}
                onChange={(signatory) => {
                    //If it's a new signatory entry
                    if(!value || showSignatory > value.length) {
                        if(signatory) {
                            const signatories = [...(value || []), signatory]
                            onChange(signatories)
                        }

                    } //If it's an existing signatory edit/delete
                    else {
                        const signatories = [...value]
                        //If signatory is null, then that's a delete.
                        if(signatory == null) {
                            //remove the signatory at the index of the signatory to delete
                            signatories.splice(showSignatory - 1, 1);

                        } //If signatory is not null, then that's an edit.
                        else {
                            signatories[showSignatory - 1] = signatory
                        }
                        onChange(signatories)
                    }
                    setShowSignatory(0)
                }}
                nameRule={nameRule}
                titleRule={titleRule}
                base64ImageRule={base64ImageRule}
            />
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
                border-radius: var(--chakra-radii-md);
                border: 1px solid;
                border-color: inherit;
                background: inherit;
            }

            .input-container {
                padding: 0.5rem;
                width: 100%;
                min-width: 0px;
                position: relative;
                -webkit-appearance: none;
                -moz-appearance: none;
                -ms-appearance: none;
                appearance: none;
                transition-property: var(--chakra-transition-property-common);
                transition-duration: var(--chakra-transition-duration-normal);
                border-radius: var(--chakra-radii-md);
                border: 1px solid;
                border-color: inherit;
                background: inherit;
            }`
        }</style>
      </Box>
    )
}

export default SignatoryInput