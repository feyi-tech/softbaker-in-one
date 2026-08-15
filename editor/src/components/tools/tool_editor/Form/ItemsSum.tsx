import { VStack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useItemSum } from "./useItemSum";
import { InvoiceItem } from "../../invoice/types";

interface ItemsSumProps {
    items: InvoiceItem[];
    col: { key: string; title: string }; // Assuming `col` has these fields based on context.
    vat: number; // VAT percentage as a number (e.g., 20 for 20%)
    currency?: string | null;
}

const getCurrencySymbol = (currency?: string | null) => {
    return currency? currency.split("_")[2] : "$"
}

const ItemsSum: React.FC<ItemsSumProps> = ({ items, vat, currency }) => {
    const { subTotal, vatValue, total } = useItemSum(items, vat)

    return (
        <VStack spacing={4} align="stretch">
            <Text as="div" fontWeight="bold">Subtotal: {getCurrencySymbol(currency)}{subTotal.toFixed(2)}</Text>
            <Text as="div" fontWeight="bold">VAT ({vat}%): {getCurrencySymbol(currency)}{vatValue.toFixed(2)}</Text>
            <Text as="div" fontWeight="bold">Total: {getCurrencySymbol(currency)}{total.toFixed(2)}</Text>
        </VStack>
    );
};

export default ItemsSum;
