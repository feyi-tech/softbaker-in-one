import { useEffect, useState } from "react";
import { InvoiceItem } from "../../invoice/types";


export const getItemSum = ( items?: InvoiceItem[] | null, vat?: number | null ) => {
    if(!items) return { }
    // Calculate subtotal
    const calculatedSubTotal = items.reduce((acc, item) => {
        const quantity = item.quantity || 0; // Default to 0 if quantity is not provided
        const price = item.price || 0; // Default to 0 if price is not provided
        return acc + (quantity * price);
    }, 0);

    // Calculate VAT value
    const calculatedVatValue = ((vat || 0) / 100) * calculatedSubTotal;

    // Calculate total
    const calculatedTotal = calculatedSubTotal + calculatedVatValue;

    return {
        calculatedSubTotal,
        calculatedVatValue,
        calculatedTotal
    }
}

export const useItemSum = ( items: InvoiceItem[], vat: number ) => {
    const [subTotal, setSubTotal] = useState<number>(0);
    const [vatValue, setVatValue] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        const {
            calculatedSubTotal,
            calculatedVatValue,
            calculatedTotal
        } = getItemSum(items, vat)

        setSubTotal(calculatedSubTotal || 0);
        setVatValue(calculatedVatValue || 0);
        setTotal(calculatedTotal || 0);
    }, [items, vat])

    return {
        subTotal, vatValue, total
    }
}