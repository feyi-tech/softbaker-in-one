import { dateToTimestamp } from "@/root/src/utils/time";

export const getDefaultData = () => {
    const now = new Date();
    const nowFutureDiffInMillis = 1000 * 60 * 60 * 24 * 3 // 3 days
    const future = new Date()
    future.setTime(future.getTime() + nowFutureDiffInMillis)
    const defaultData = {
        shippingStatus: 'processing',
        shipmentDate: dateToTimestamp(now),
        expectedArrivalDate: dateToTimestamp(future),
        costCurrency: "US_USD_$",//`${iso_code}_${currency}_${symbol}`,
        is_freemium: true
    }
    return defaultData
}