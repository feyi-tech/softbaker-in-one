import { useState } from "react";
import { Doc, InputRule, Signatory } from "../../../tools/index.types";
import InputBox from "../../InputBox";
import ModalPop from "../../ModalPop";
import SignatureInput from "../SignatureInput";
import CuteButton from "../../CuteButton";
import { nullOrEmpty } from "@/root/src/utils/f";
import { cropImage, isBlankImage } from "@/root/src/utils/imageHelper";
import Swal from "sweetalert2";
import { Box } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { Col } from "./types";

interface RowEditorProps {
    data?: Doc | null,
    header: Col[],
    submitButtonText?: string | null;
    onClose: () => void;
    onChange: (signatory: Doc | null) => void;
    allowDelete?: boolean | null;
}


const RowEditor: React.FC<RowEditorProps> = ({ 
    data, header, submitButtonText, onClose, onChange, allowDelete 
}) => {
    const [latestData, setLatestData] = useState<Doc | null | undefined>(data);
    const [showErrors, setShowErrors] = useState<boolean>(false);

    const getError = (col: Col, showError: boolean) => {
        return showError && col.getValidationError? col.getValidationError(latestData? latestData[col.key] : null) : null
    }

    const handleSubmit = () => {
        setShowErrors(true);

        let hasError = false;

        for(const col of header) {
            if(getError(col, true)) {
                hasError = true
                break
            }
        }

        if (!hasError) {
            onChange( latestData || {} );
        }
    };

    const handleDelete = () => {
        Swal.fire({
            text: "Are you sure you want to delete this row?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        }).then(result => {
            if (result.isConfirmed) {
                onChange(null);
            }
        });
    };

    return (
        <ModalPop title={
            allowDelete ? <CuteButton rightIcon={<FaTrash />} status="error" onClick={handleDelete}>Delete</CuteButton> : null
        } isOpen={true} onClose={onClose} height="95vh">
            {header.map((col, index) => {
                if(col.isReadOnly) return null
                return (
                    <InputBox w="100%"
                        id={`col_editor_${col.key}`}
                        key={`col_editor_${col.key}`}
                        title={`${col.title}${col.isOptional? "(Optional)" : ""}`}
                        mb={4}
                        helperText={col.helperText || undefined}
                        info={col.info || undefined}
                        type={col.inputType || InputBox.TYPES.text}
                        value={latestData? latestData[col.key] : null}
                        onChange={(value) => {
                            setLatestData({
                                ...latestData, 
                                [col.key]: value
                            })
                        }}
                        errorMessage={ getError(col, showErrors) as string }
                        {...(col.otherInputProps? col.otherInputProps : {})}
                    />
                )
            })}
            <Box mb="1rem">
                <CuteButton status="warning" mb="1rem" onClick={handleSubmit}>
                    {submitButtonText || "Submit Row"}
                </CuteButton>
            </Box>
        </ModalPop>
    );
};

export default RowEditor;