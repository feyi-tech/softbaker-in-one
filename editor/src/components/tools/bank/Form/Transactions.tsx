import { HStack, Table, Thead, Tbody, Tr, Th, Td, Text, VStack, TableCellProps } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { gmtTimestampToLocal, timestampToGmt } from "@/root/src/utils/time";
import useTime from "@/root/src/hooks/useTime";

interface Tx {
    type: "credit" | "debit",
    amount: number,
    description: string,
    timestamp: number,
    completeStatus: "Successful" | "Failed",
    processingDuration: "immediately" | string,
}

interface Transactions {
    credits: string[], // format: ["amount,description,timestamp"]
    debits: string[], // format: ["amount,description,timestamp"]
    currencySymbol: string,
}

// Function to parse the item
const parseItem = (item: string): { 
    amount: string, 
    description: string, 
    timestamp: string, 
    processingDuration: "immediately" | string, 
    completeStatus: "Successful" | "Failed" 
} => {
    const parts = item.split(',');
    var amount = parts[0].trim();
    if(amount == "v2") {
        amount = parts[1].trim()
        const completeStatus = parts[parts.length - 1].trim() as ("Successful" | "Failed");
        const processingDuration = parts[parts.length - 2].trim();
        const timestamp = parts[parts.length - 3].trim();

        // Join the middle parts for description
        const description = parts.slice(2, -3).join(',').trim();

        return { amount, description, timestamp, processingDuration, completeStatus };

    } else {
        const timestamp = parts[parts.length - 1].trim();

        // Join the middle parts for description
        const description = parts.slice(1, -1).join(',').trim();

        return { amount, description, timestamp, processingDuration: "immediately", completeStatus: "Successful" };
    }
}

const getTxStatus = (
    currentTime: number,
    txTime: number,
    processingDuration: "immediately" | string,
    completeStatus: "Successful" | "Failed"
  ): string => {
    //Version 1 transactions don't have pending processing feature. So they always resolve immediately to success
    if(!processingDuration || !completeStatus) return "Successful"
    // If processingDuration is "immediately", return completeStatus
    if (processingDuration === "immediately") {
      return completeStatus;
    }
  
    // Function to convert a processing duration string to milliseconds
    const convertToMilliseconds = (duration: string): number => {
      const regex = /^(\d+)([smhdwMy])$/; // Regex to extract number and unit (s, m, h, d, w, M, y)
      const match = duration.match(regex);
  
      if (!match) {
        throw new Error("Invalid processing duration format");
      }
  
      const value = parseInt(match[1], 10); // Extract the number (e.g. 5, 10)
      const unit = match[2]; // Extract the unit (e.g. s, m, h, etc.)
  
      switch (unit) {
        case "s":
          return value * 1000; // Convert seconds to milliseconds
        case "m":
          return value * 60 * 1000; // Convert minutes to milliseconds
        case "h":
          return value * 60 * 60 * 1000; // Convert hours to milliseconds
        case "d":
          return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        case "w":
          return value * 7 * 24 * 60 * 60 * 1000; // Convert weeks to milliseconds
        case "M":
          return value * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds (approx. 30 days)
        case "y":
          return value * 365 * 24 * 60 * 60 * 1000; // Convert years to milliseconds (approx. 365 days)
        default:
          throw new Error("Unknown time unit");
      }
    };
  
    // Convert the processingDuration to milliseconds
    const processingTimeMs = convertToMilliseconds(processingDuration);
  
    // Calculate when the transaction should complete
    const completeTime = txTime + processingTimeMs;
  
    // Compare currentTime with the completeTime
    return currentTime < completeTime ? "Pending" : completeStatus;
};
  

const Transactions: React.FC<Transactions> = ({ credits, debits, currencySymbol }): JSX.Element => {
    const [transactions, setTransactions] = useState<Tx[]>([])
    const currentTime = useTime(10000)//5 seconds

    useEffect(() => {
        //console.log("transax: ", transactions)
    }, [transactions])

    useEffect(() => {
        // Parse credits
        const parsedCredits: Tx[] = credits.map(item => {
            const { amount, description, timestamp, processingDuration, completeStatus } = parseItem(item)
            return {
                type: "credit",
                amount: parseFloat(amount),
                description,
                timestamp: parseInt(timestamp),
                completeStatus,
                processingDuration
            }
        })

        //console.log("transax:cred ", parsedCredits)

        // Parse debits
        const parsedDebits: Tx[] = debits.map(item => {
            const { amount, description, timestamp, processingDuration, completeStatus } = parseItem(item)
            return {
                type: "debit",
                amount: parseFloat(amount),
                description,
                timestamp: parseInt(timestamp),
                completeStatus,
                processingDuration
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
                <Text as="div" textAlign="center" w="100%">No transaction yet</Text>
            ) : (
                <Table variant="simple" size="sm" w="100%" overflow="auto">
                    <Thead>
                        <Tr>
                            <Th>S/N</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Description</Th>
                            <Th>Time</Th>
                            <Th>Status</Th>
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
                                <Td>{new Date(gmtTimestampToLocal(tx.timestamp)).toISOString().slice(0, 16).replace("T", " ")}</Td>
                                <Td>{getTxStatus(currentTime, tx.timestamp, tx.processingDuration, tx.completeStatus)}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </>
    )
}

export default Transactions