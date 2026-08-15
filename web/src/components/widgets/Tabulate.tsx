import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from '@chakra-ui/react'

interface Data {
    key: string,
    value: any
}
interface Tabulate {
    variant: 'simple' | 'striped' | 'unstyled' | undefined,
    fontSize: any,
    list: Data[],
    [x: string]: any,
    onKey?: (key: string) => any,
    onValue?: (value: string) => any
}
const Tabulate: React.FC<Tabulate> = ({list, variant, fontSize, onKey, onValue, ...props}) => {

    return (
        <TableContainer>
            <Table variant={variant}>
                <Tbody>
                    {
                        (list || []).map(({key, value}, index) => (
                            <Tr key={index}>
                                <Td fontWeight="bold" fontSize={fontSize}>{onKey? onKey(key) : key}</Td>
                                <Td fontSize={fontSize}>{onValue? onValue(value) : value}</Td>
                            </Tr>
                        ))
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default Tabulate