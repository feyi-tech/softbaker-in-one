import { TEMP_TOOL_FORM_ID } from "@/root/src/app-config"
import { Data } from "./types"


export const getHandM = (date: Date): string[] => {
  var h = `${date.getHours()}`
  if(h.length == 1) h = `0${h}`

  var m = `${date.getMinutes()}`
  if(m.length == 1) m = `0${m}`

  return [h, m]
}

export const getDefaultData = () => {
  // Set the new shipment with the generated ID
  
  
  const defaultData = {
      id: TEMP_TOOL_FORM_ID,
      authorId: "uid",
      hasPaperTexture: false,
      waterMarkWithLogo: true,
      grayScaleWaterMark: true,
      stampLogo: true,
      stampApprove: true,
      signatoryNames: [],
      signatoryTitles: [],
      signatures: [],
      companyName: "Amazon Inc",
      title: "Letter for Loan Repayment",
      senderInfo: "123 Main Street, Cityville, State, 12345, USA\nceo@mycompany.com\n+1 (555) 123-4567",
      recipientInfo: "Full Name: John Doe\nAddress: 456 Oak Avenue, Townsville, State, 54321, USA\nEmail: john.doe@email.com\nPhone Number: +1 (555) 987-6543",
      body: `Dear Mrs Jessica,\n\nWe are writing to you regarding your outstanding loan payment of $200 to Miss McDonald's\nRebecca. As per your previous agreement, this payment was due on September 1st, 2023.\nHowever, we have not received any payment as of today, November 11, 2023.\n\nIn accordance with the terms of your loan agreement, a late payment fee of $150 has been\nadded to your outstanding balance. This brings your total outstanding balance to $350.\n\nWe kindly request that you make full payment of $350 by December 1st, 2023. Failure to do\nso will result in further legal action, including the possibility of arrest.\n\nSincerely,\nAmanda, Sales representative.`,
      is_freemium: true
  } as Data
  
  return defaultData
}