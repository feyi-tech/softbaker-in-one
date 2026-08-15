import { Box, FormControl, HStack, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import { useState } from "react";
import InfoLabel from "../../InfoLabel";
import CuteButton from "../../CuteButton";
import { FaPlus } from "react-icons/fa";
import InputBox from "../../InputBox";
import { Doc } from "../../../tools/index.types";
import Row from "./Row";
import RowEditor from "./RowEditor";
import { Col } from "./types";


interface TableInputProps<T> {
    header: Col[]
    title?: string | null;
    value?: Doc[] | null;
    maxSize: number;
    submitButtonText?: string | null;
    addSingular?: string | null;
    addPlural?: string | null;
    onChange: (rows: T[]) => void;
    disabled?: boolean;
    helperText?: any;
    info?: any;
    errorMessage?: any;
    onFooter?: ((rows: Doc[], col: Col) => any) | null;
    [x: string]: any;
}

const TableInput: React.FC<TableInputProps<Doc>> = ({ 
    header, title, value, maxSize, submitButtonText, onChange,
    disabled, helperText, info, errorMessage, addSingular, addPlural,
    onFooter,
    ...props 
}) => {
    const [showRow, setShowRow] = useState<number | null>(null);

    const handleAddRow = () => {
        if (!disabled && ((value? value.length : 0) < maxSize)) {
            setShowRow((value? value.length : 0) + 1);
        }
    };

    const handleEditRow = (index: number) => {
        if (!disabled) {
            setShowRow(index + 1);
        }
    };

    return (
        <Box {...props}>
            <FormControl opacity={disabled ? 0.5 : 1} cursor={disabled ? "not-allowed" : "pointer"}>
                <InfoLabel textTransform={"capitalize"} info={info}>{title}</InfoLabel>
                <Box className="input-container">
                    {(value && value.length > 0) && (
                        <>
                            <HStack w="100%" justifyContent="center">
                                <Text as="div" textTransform="capitalize">Click an item to edit or delete it.</Text>
                            </HStack>
                            <TableContainer>
                                <Table variant='simple'>
                                    <Thead>
                                        <Tr>
                                            {
                                                (header || []).map((col, index) => (
                                                    <Th>{col.title}</Th>
                                                ))
                                            }
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {value.map((v, index) => (
                                            <Row key={index} 
                                                data={v} 
                                                rowIndex={index}
                                                totalItems={value.length}
                                                header={header} 
                                                onClick={() => handleEditRow(index)} 
                                            />
                                        ))}
                                    </Tbody>
                                    {
                                        onFooter?
                                        <Tfoot>
                                            <Tr>
                                                {
                                                    (header || []).map((col, index) => (
                                                        <Th>
                                                            {
                                                                onFooter(value, col)
                                                            }
                                                        </Th>
                                                    ))
                                                }
                                            </Tr>
                                        </Tfoot>
                                        : null
                                    }
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {((value? value.length : 0) < maxSize && !disabled) && (
                        <CuteButton iconRight={<FaPlus />} my="0.5rem" status="warning" onClick={handleAddRow}>
                            {value && value.length > 0 ? (addPlural || `Add more ${title}`) : (addSingular || `Add ${title}`)}
                        </CuteButton>
                    )}
                </Box>
                <InputBox type={InputBox.TYPES.none} helperText={!disabled ? helperText : null} errorMessage={errorMessage} />
            </FormControl>

            {showRow? (
                <RowEditor 
                    header={header}
                    allowDelete={value && showRow <= value.length}
                    data={!value || showRow > value.length? null : value[showRow - 1]}
                    submitButtonText={submitButtonText}
                    onClose={() => {
                        setShowRow(0)
                    }}
                    onChange={(row) => {
                        //If it's a new row entry
                        if(!value || showRow > value.length) {
                            if(row) {
                                const rows = [...(value || []), row]
                                onChange(rows)
                            }

                        } //If it's an existing row edit/delete
                        else {
                            const rows = [...value]
                            //If row is null, then that's a delete.
                            if(row == null) {
                                //remove the row at the index of the row to delete
                                rows.splice(showRow - 1, 1);

                            } //If row is not null, then that's an edit.
                            else {
                                rows[showRow - 1] = row
                            }
                            onChange(rows)
                        }
                        setShowRow(0)
                    }}
                />
            ) : null}

            <style jsx global>{`
                .image-selector-button {
                    width: 100%;
                    min-width: 0px;
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    position: relative;
                    appearance: none;
                    transition: all 0.3s;
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
                    appearance: none;
                    transition: all 0.3s;
                    border-radius: var(--chakra-radii-md);
                    border: 1px solid;
                    border-color: inherit;
                    background: inherit;
                }
            `}</style>
        </Box>
    );
};

export default TableInput;
