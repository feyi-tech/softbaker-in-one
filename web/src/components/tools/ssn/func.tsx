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
      scene: "curly-pattern",
      is_freemium: true
  } as Data
  
  return defaultData
}