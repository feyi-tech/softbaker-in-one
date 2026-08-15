import { HStack, Table, Thead, Tbody, Tr, Th, Td, Text, VStack, TableCellProps } from "@chakra-ui/react"
import { useEffect, useState } from "react"

interface Tx {
    type: "credit" | "debit",
    amount: number,
    description: string,
    timestamp: number
}

interface Transactions {
    credits: string[], // format: ["amount,description,timestamp"]
    debits: string[], // format: ["amount,description,timestamp"]
    currencySymbol: string,
}

// Function to parse the item
const parseItem = (item: string): { amount: string, description: string, timestamp: string } => {
    const parts = item.split(',');
    const amount = parts[0].trim();
    const timestamp = parts[parts.length - 1].trim();

    // Join the middle parts for description
    const description = parts.slice(1, -1).join(',').trim();

    return { amount, description, timestamp };
}

const Transactions: React.FC<Transactions> = ({ credits, debits, currencySymbol }): JSX.Element => {
    const [transactions, setTransactions] = useState<Tx[]>([])

    useEffect(() => {
        //console.log("transax: ", transactions)
    }, [transactions])

    useEffect(() => {
        // Parse credits
        const parsedCredits: Tx[] = credits.map(item => {
            const { amount, description, timestamp } = parseItem(item)
            return {
                type: "credit",
                amount: parseFloat(amount),
                description,
                timestamp: parseInt(timestamp)
            }
        })

        //console.log("transax:cred ", parsedCredits)

        // Parse debits
        const parsedDebits: Tx[] = debits.map(item => {
            const { amount, description, timestamp } = parseItem(item)
            return {
                type: "debit",
                amount: parseFloat(amount),
                description,
                timestamp: parseInt(timestamp)
            }
        })

        //console.log("transax:deb ", parsedDebits)

        // Merge and sort by timestamp in descending order
        const mergedTransactions = [...parsedCredits, ...parsedDebits].sort((a, b) => b.timestamp - a.timestamp)
        setTransactions(mergedTransactions)
    }, [credits, debits])

    return (
        <>
            {transactions.length === 0 ? (
                <Text textAlign="center" w="100%">No transaction yet</Text>
            ) : (
                <Table variant="simple" size="sm" w="100%" overflow="auto">
                    <Thead>
                        <Tr>
                            <Th>S/N</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Description</Th>
                            <Th>Time</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {transactions.map((tx, index) => (
                            <Tr key={index}>
                                <Td>{index + 1}</Td>
                                <Td isNumeric color={tx.type === "debit" ? "red.500" : "green.500"}>
                                    {tx.type === "debit" ? `- ${currencySymbol}${tx.amount.toFixed(2)}` : `${currencySymbol}${tx.amount.toFixed(2)}`}
                                </Td>
                                <Td>{tx.description}</Td>
                                <Td>{new Date(tx.timestamp).toISOString().slice(0, 16).replace("T", " ")}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </>
    )
}

export default Transactions