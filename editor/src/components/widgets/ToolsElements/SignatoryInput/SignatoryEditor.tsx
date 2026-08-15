import { useState } from "react";
import { InputRule, Signatory } from "../../../tools/index.types";
import InputBox from "../../InputBox";
import ModalPop from "../../ModalPop";
import SignatureInput from "../SignatureInput";
import CuteButton from "../../CuteButton";
import { nullOrEmpty } from "@/root/src/utils/f";
import { cropImage, isBlankImage } from "@/root/src/utils/imageHelper";
import Swal from "sweetalert2";
import { Box } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";

interface SignatoryEditorProps extends Signatory {
    submitButtonText: string,
    onClose: () => void,
    onChange: (signatory: Signatory | null) => void,
    nameRule: InputRule,
    titleRule: InputRule,
    base64ImageRule: InputRule,
    allowDelete?: boolean
}
const SignatoryEditor: React.FC<SignatoryEditorProps> = ({ 
    submitButtonText,
    name, title, base64Url, onClose, onChange,
    nameRule, titleRule, base64ImageRule, allowDelete
}) => {

    const [newName, setNewName] = useState<string | null | undefined>(name)
    const [nameError, setNameError] = useState<string>()

    const [newTitle, setNewTitle] = useState<string | null | undefined>(title)
    const [titleError, setTitleError] = useState<string>()

    const [newBase64, setNewBase64] = useState<string | null | undefined>(base64Url)
    const [base64Error, setBase64Error] = useState<string>()
    const [ processingSignature, setProcessingSignature ] = useState<boolean>(false)
    
    const [ buttonError, setButtonError ] = useState<string>()

    const onSignature = (image: string) => {
        setBase64Error(undefined)
        setProcessingSignature(true)
        
        isBlankImage(image)
        .then(isBlankImage => {
            //console.log("isBlank:image ", isBlankImage, image)
            if(isBlankImage) {
                setBase64Error(`The provided ${base64ImageRule.title} is blank.`) //if cropped is the original, then it's a blank signature
                setProcessingSignature(false)

            } else {
                cropImage(image)
                .then(cropped => {
                    setNewBase64(cropped)
                    setProcessingSignature(false)
                })
                .catch((e: any) => {
                    setBase64Error(e.message)
                    setProcessingSignature(false)
                })
            }
        })
        .catch((e: any) => {
            setBase64Error(e.message)
            setProcessingSignature(false)
        })
    }

    const handleSubmit = () => {
        if(processingSignature) {
            setButtonError(`Currently processing ${base64ImageRule.title}. Please try again after the process.`)
            return;
        }
        setNameError(undefined)
        setTitleError(undefined)
        setBase64Error(undefined)
        setButtonError(undefined)

        var hasError = false
        if(nameRule.required) {
            if(!newName || nullOrEmpty(newName)) {
                //hasError = true
                //setNameError(`Please enter ${nameRule.title}`)

            } else if(newName.length < nameRule.minSize) {
                //hasError = true
                //setNameError(`${nameRule.title} cannot be less than ${nameRule.minSize} characters`)

            } else if(newName.length > nameRule.maxSize) {
                hasError = true
                setNameError(`${nameRule.title} cannot be greater than ${nameRule.maxSize} characters`)
            }
        }

        if(titleRule.required) {
            if(!newTitle || nullOrEmpty(newTitle)) {
                //hasError = true
                //setTitleError(`Please enter ${titleRule.title}`)

            } else if(newTitle.length < titleRule.minSize) {
                //hasError = true
                //setTitleError(`${titleRule.title} cannot be less than ${titleRule.minSize} characters`)

            } else if(newTitle.length > titleRule.maxSize) {
                hasError = true
                setTitleError(`${titleRule.title} cannot be greater than ${titleRule.maxSize} characters`)
            }
        }

        if(base64ImageRule.required) {
            if(!newBase64) {
                hasError = true
                setBase64Error(`Please provide ${base64ImageRule.title}`)
            }
        }

        if(!hasError) {
            onChange({
                name: newName,
                title: newTitle,
                base64Url: newBase64
            })
        }
    }

    const handleDelete = () => {
        Swal.fire({
            text: "Are you sure you want to delete this signatory?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes", cancelButtonText: "No"
        })
        .then(result => {
            if(result.isConfirmed) {
                onChange(null)
            }
        })
    }

    return (
        <ModalPop title={
            allowDelete? <CuteButton rightIcon={<FaTrash />} status="error" onClick={handleDelete}>Delete</CuteButton> : null
        } isOpen={true} onClose={onClose} height="95vh">
            <InputBox w="100%"
                id={`signatory_editor_name`}
                key={`signatory_editor_name`}
                title={`${nameRule.title}${!nameRule.required? "(optional)" : ""}`} mb={4}
                placeholder="Jenifer Lopez"
                helperText="The name of the person to sign"
                info="This is the name of the person to sign."
                type={InputBox.TYPES.text}
                value={newName} 
                onChange={setNewName}
                errorMessage={nameError}
            />
            <InputBox w="100%"
                id={`signatory_editor_title`}
                key={`signatory_editor_title`}
                title={`${titleRule.title}${!titleRule.required? "(optional)" : ""}`} mb={4}
                placeholder="Miss"
                helperText="The title of the person to sign"
                info="This is the title of the person to sign."
                type={InputBox.TYPES.text}
                value={newTitle} 
                onChange={setNewTitle}
                errorMessage={titleError}
            />
            <SignatureInput w="100%"
                id={`signatory_editor_image`}
                key={`signatory_editor_image`}
                title={`${base64ImageRule.title}${!base64ImageRule.required? "(optional)" : ""}`} mb={4}
                helperText={processingSignature? "Processing..." : `Provide ${base64ImageRule.title} here`}
                info="This is where you provide a signature sign."
                thumbnail={newBase64}
                onChange={(image) => {
                    if(image) onSignature(image)
                }}
                errorMessage={base64Error}
            />

            <Box mb="1rem">
                <CuteButton status="warning" mb="1rem" onClick={handleSubmit}>
                    {submitButtonText}
                </CuteButton>
                <InputBox type={InputBox.TYPES.none} errorMessage={buttonError} />
            </Box>
        </ModalPop>
    )
}

export default SignatoryEditor