import { TEMP_TOOL_FORM_ID } from "@/root/src/app-config"
import { Data, TxDetails } from "./types"
import { ACCOUNT_TYPES, GENDER, MARITAL_STATUS } from "./Form/doc-data"
import { genAccountNumber } from "@/root/src/utils/f"
import { Timestamp } from "firebase/firestore"
import { sha256 } from "js-sha256"


export const getHandM = (date: Date): string[] => {
  var h = `${date.getHours()}`
  if(h.length == 1) h = `0${h}`

  var m = `${date.getMinutes()}`
  if(m.length == 1) m = `0${m}`

  return [h, m]
}

export const genTxList = (currentBalance: number, endingBalance: number, totalTransactions: number, txList: number[]): number[] => {
  if(currentBalance == endingBalance) return txList
  const transactions = [];
  const credit = Math.floor((endingBalance * 3) / totalTransactions)//(3 / totalTransactions) * endingBalance
  const debit = Math.floor((currentBalance * 3) / totalTransactions)
  if(txList.length == 0) {
    txList.push(credit)
  }
  totalTransactions -= 1
  return genTxList(currentBalance, endingBalance, totalTransactions, txList)
}

export const firestoreTimestampToDate = (timestamp?: Timestamp | null) => {
  if(!timestamp) return null
  const date = timestamp.toDate()
  // Format the date to DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`
}

export function hashTexts(texts: (string | number) []) {
  //console.log("hashTexts: ", texts)
  // Join the texts together in lower case and remove punctuations and spaces
  let joinedText = texts.join('').toLowerCase().replace(/[^\w]/g, '').trim();
  //console.log("hashTexts.joinedText: ", texts)

  // Hash the joined text using SHA-256 from crypto-js
  let hashedText = sha256(joinedText).toString();

  // Convert the hash to numbers
  let hashAsInt = parseInt(hashedText, 16);

  // Take the last 6 digits of the hash
  let lastSixDigits = `${hashAsInt % 1000000}`;
  if(lastSixDigits.length < 6) lastSixDigits += '4'.repeat(6 - lastSixDigits.length)

  return lastSixDigits;
}

function getCurrentTimestampAtInterval(minutes: number): Promise<number> {
  return new Promise((resolve, reject) => {
      // Fetch current time from the public API
      fetch(`https://worldtimeapi.org/api/timezone/Etc/UTC?id=${Math.round(Math.random() * 1000000)}`)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          // Parse the current UTC date and time from the API response
          let now = new Date(data.utc_datetime);

          // Calculate the current minute and adjust it to the nearest interval
          let currentMinute = now.getUTCMinutes();
          let nearestInterval = Math.floor(currentMinute / minutes) * minutes;

          // Set the minutes, seconds, and milliseconds to get the start of the current interval
          now.setUTCMinutes(nearestInterval);
          now.setUTCSeconds(0);
          now.setUTCMilliseconds(0);

          //console.log("hashTexts.fetch: ", data, now.getTime())

          // Resolve the promise with the timestamp
          resolve(now.getTime());
      })
      .catch(error => {
          // Reject the promise with the error
          //console.log("getCurrentTimestampAtInterval: ", error)
          reject(new Error(`OTP verification error. Make sure you're connected to the internet.`));
      });
  });
}

export const getOtp = (userAccountNumber: number, txDetails: TxDetails, otpDuration?: number | null): Promise<string> => {
  return new Promise((resolve, reject) => {
    getCurrentTimestampAtInterval(otpDuration || 5)
    .then(timestamp => {
      const otp = hashTexts([
          timestamp,
          userAccountNumber, 
          txDetails.type,
          txDetails.name,
          txDetails.bankName || "",
          txDetails.swiftBIC || "",
          txDetails.accountNumber,
          //txDetails.amount,
          //txDetails.memo || ""
      ])

      resolve(otp)

    })
    .catch(e => {
      reject(e)
    })
  })
  
}


export const getDefaultData = () => {
  // Set the new shipment with the generated ID
  
  const defaultData = {
      id: TEMP_TOOL_FORM_ID,
      authorId: "uid",
      autoRenewSubscription: false,
  } as Data
  
  return defaultData
}