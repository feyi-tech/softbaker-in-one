import CuteButton from "@/root/src/components/widgets/CuteButton"
import InputBox from "@/root/src/components/widgets/InputBox"
import ModalPop from "@/root/src/components/widgets/ModalPop"
import { Box, HStack, useDisclosure } from "@chakra-ui/react"
import React, { useState } from "react"
import { FaPlus } from "react-icons/fa"
import { Field } from "frontbacked-svg"
import { FIELD_TYPES } from "../../../constants"


interface FieldAdder {
    onAdd: (field: Field) => void,
    [x: string]: any
}

const textToId = (text: string) => {
    
    return text.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");
}

const FieldAdder: React.FC<FieldAdder> = ({ onAdd, ...props }) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [type, setType] = useState<string>()
    const [name, setName] = useState<string>()

    const [typeError, setTypeError] = useState<string>()
    const [nameError, setNameError] = useState<string>()

    const handleSubmit = () => {
        setTypeError("")
        setNameError("")
        var hasError = false
        if(!type) {
            hasError = true
            setTypeError("Please select a field type.")

        } else if(!FIELD_TYPES.includes(type)) {
            hasError = true
            setTypeError("Invalid field type.")

        }

        if(!name || name.length == 0) {
            hasError = true
            setNameError("Please enter the field name.")
        }

        if(!hasError) {
            onClose()
            onAdd({
                type: type as string,
                name: name as string,
                id: `${textToId(name as string)}.${type}`
            })
        }
    }

    return (
        <>
            <HStack justifyContent="flex-end" alignItems="center" { ...props }>
                <CuteButton leftIcon={<FaPlus />} status="warning" onClick={onOpen}>
                    Add Field
                </CuteButton>
            </HStack>
            {
              isOpen?
                <ModalPop title={`Ad Field`} isOpen={true} onClose={onClose}>
                    <Box height="50vh" pos="relative" overflowY="auto" overflowX="hidden" px="0.5rem">
                        <InputBox w="100%" mb={4}
                            name="Field Type"
                            placeholder="Select Field Type"
                            helperText="Select the type of the field to add."
                            value={type} 
                            type={InputBox.TYPES.select}
                            options={FIELD_TYPES} 
                            onOptionValue={(key: string) => key}
                            onOptionName={(key: any) => {
                                return key
                            }}
                            onChange={setType}
                            errorMessage={ typeError }
                        />
                        <InputBox w="100%"
                            id={`name`}
                            key={`name`}
                            title={`Field Name`}
                            mb={4}
                            helperText={"Enter the text that will show as the name of the field."}
                            info={"This is where you enter the text that will show as the name of the field."}
                            type={InputBox.TYPES.text}
                            value={name}
                            onChange={setName}
                            errorMessage={ nameError }
                        />
                    </Box>
                    <Box mb="1rem">
                        <CuteButton status="warning" mb="1rem" onClick={handleSubmit}>
                            Submit Field
                        </CuteButton>
                    </Box>
                </ModalPop>
                : null
            }
        </>
    )

}

export default FieldAdder