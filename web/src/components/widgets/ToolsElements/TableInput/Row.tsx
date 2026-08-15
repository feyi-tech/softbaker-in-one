import { Td, Tr } from "@chakra-ui/react";
import { Doc } from "../../../tools/index.types";
import { Col } from "./types";

interface RowProps {
    data: Doc;
    rowIndex: number; 
    totalItems: number;
    header: Col[];
    onClick: () => void;
}

const Row: React.FC<RowProps> = ({ data, rowIndex, totalItems, header, onClick }) => {
    return (
        <Tr onClick={onClick} cursor="pointer">
            {header.map((col, index) => (
                <Td key={index}>
                    {col.valueFunc ? col.valueFunc(data, rowIndex, totalItems) : (data[col.key] || '')}
                </Td>
            ))}
        </Tr>
    );
};

export default Row;