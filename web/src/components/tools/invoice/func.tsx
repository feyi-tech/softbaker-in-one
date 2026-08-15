import { TEMP_TOOL_FORM_ID } from "@/root/src/app-config"
import { Data } from "./types"
import { dateToTimestamp } from "@/root/src/utils/time"
import { generateIban } from "@/root/src/utils/f"


export const getHandM = (date: Date): string[] => {
  var h = `${date.getHours()}`
  if(h.length == 1) h = `0${h}`

  var m = `${date.getMinutes()}`
  if(m.length == 1) m = `0${m}`

  return [h, m]
}

export const getDefaultData = () => {
  // Set the new shipment with the generated ID
  
  const invoiceNumber = `#${Math.round(Math.random() * 10000000)}`
  const iban = generateIban('AE', '033', 16, 21);
  const totalCost = 360

  const defaultData = {
    id: TEMP_TOOL_FORM_ID,
    authorId: "uid",
    waterMarkWithLogo: true,
    grayScaleWaterMark: true,
    invoiceNumber: invoiceNumber,
    date: dateToTimestamp(new Date()),
    currency: "US_USD_$",
    vat: 15,
    paymentDetails: `Payment Method: Wire Transfer
Recipient Name: Parkroad International Motors
Bank Name: Emirates National Bank of Dubai
Swift Code: EBILAEADDMB
IBAN: ${iban}
Amount: $${totalCost}.00
Memo: Payment for invoice ${invoiceNumber}`,
    is_freemium: true
  } as Data
  
  return defaultData
}