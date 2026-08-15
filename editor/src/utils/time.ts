import { Timestamp } from "firebase/firestore";

interface Format {[x: string]: string}

export const timestampToDate = (timestamp: Timestamp | Date | null | undefined): Date => {
    try {
        return (timestamp as Timestamp).toDate()

    } catch(e) {
        return timestamp as Date
    }
}
export const dateToTimestamp = (date: Date | Timestamp | null | undefined): Timestamp => {
    try {
      return Timestamp.fromDate(date as Date);
  
    } catch (e) {
      return date as Timestamp;
    }
};
export function joinTimeSegments(date: Date, formats: (Format | number | string)[], separator: string) {
    function format(m: Format | number | string) {
        //console.log("joinTimeSegments:2", typeof m, m)
        if(typeof m === "string" || typeof m === "number") return m
        let f = new Intl.DateTimeFormat('en', m);
        return f.format(date);
    }
    return formats.map(format).join(separator);
}
 
/**
 * 
 * @param {The number of seconds to parse into time segments} seconds 
 * @param {The number of seconds to parse into time segments} seconds
 * @returns A string that represents the time segments in days, months, weeks, days, hours, minutes, and seconds
 */
export const secondsToTimeSegments = (
    seconds: number, 
    onSegmentsFrame?: (timeFrame: string, timeFrameUnit: "Y" | "M" | "D" | "H" | "Min" | "S", timeFrameIndex: number) => string
) => {
    const d = new Date(seconds * 1000).toISOString()
    let segments
    //If seconds is less than an hour returns the format MM:SS
    if(seconds < 3600) {
        segments = d.substring(14, 19)

    } //If seconds is less than a day(but greater or equal to an hour) returns the format HH:MM:SS
    else if(seconds < 86400) {
        segments = d.substring(11, 19)

    } 
    //If seconds is less than a month(using 31 days in January)(but greater or equal to a day) 
    // returns the format DD:HH:MM:SS 
    else if(seconds < 2678400) {
        segments = d.replace('T', ':').substring(8, 19)
        var days = `${parseInt(segments.substring(0, 2)) - 1}`
        if(days.length == 1) days = `0${days}`
        segments = `${days}:${segments.substring(3)}`


    } 
    //If seconds is less than a year(but greater or equal to a month) 
    // returns the format MM:DD:HH:mm:SS 
    else if(seconds < 31536000) {
        segments = d.replace('-', ':').replace('T', ':').substring(5, 19)
        //get the months
        var months = `${parseInt(segments.substring(0, 2)) - 1}`
        if(months.length == 1) months = `0${months}`

        //get the days
        var days = `${parseInt(segments.substring(3, 5)) - 1}`
        if(days.length == 1) days = `0${days}`


        segments = `${months}:${days}:${segments.substring(6)}`

    } //If seconds is greater or equal to a year
    // returns the format YY:MM:DD:HH:mm:SS 
    else {
        segments = d.replace('-', ':').replace('T', ':').substring(0, 19)
        //get the year
        var years = `${parseInt(segments.substring(0, 4)) - 1970}`
        if(years.length == 1) years = `0${years}`

        //get the months
        var months = `${parseInt(segments.substring(5, 7)) - 1}`
        if(months.length == 1) months = `0${months}`

        //get the days
        var days = `${parseInt(segments.substring(8, 10)) - 1}`
        if(days.length == 1) days = `0${days}`


        segments = `${years}:${months}:${days}:${segments.substring(11)}`
    }
    if(onSegmentsFrame) {
        const timeFrameUnits: ("Y" | "M" | "D" | "H" | "Min" | "S")[] = ["Y", "M", "D", "H", "Min", "S"]
        const frames = segments.split(":")
        var unitIndex = timeFrameUnits.length - frames.length 
        var segs = ""
        for (const frame of frames) {
            segs += onSegmentsFrame(frame, timeFrameUnits[unitIndex], unitIndex)
            unitIndex++
        }
        segments = segs
    }
    return segments
}

export const parsePaymentWindow = (seconds: number): {time: string, time_unit: string} => {
    let tm: string | null = null
    let timeUnit: string = ""
    const timeParser = (time: string, unit: string) => {
        if(parseInt(time) > 0 && !tm) {
            tm = `${parseInt(time)}`
            timeUnit = unit
        } 
        return `${parseInt(time)} ${unit} `
    }
    secondsToTimeSegments(seconds, timeParser)
    return {
        time: `${tm || ""}`,
        time_unit: timeUnit
    }
}

export const timestampToGmt = (localTimestamp: number): number => {
    // Create a Date object with the local timestamp
    const localDate = new Date(localTimestamp);
    
    // Get the UTC (GMT) equivalent of the timestamp
    const gmtTimestamp = localDate.getTime() + ((new Date()).getTimezoneOffset() * 60000); // 60000 = 60 * 1000 to convert minutes to milliseconds
  
    return gmtTimestamp;
};

export const gmtTimestampToLocal = (gmtTimestamp: number): number => {
    // Create a Date object with the GMT timestamp
    const gmtDate = new Date(gmtTimestamp);
    
    // Get the local equivalent of the GMT timestamp by adding the timezone offset
    const localTimestamp = gmtDate.getTime() - ((new Date()).getTimezoneOffset() * 60000);
  
    return localTimestamp;
};
  
  