import { SelectorOptions } from "../../../widgets/ToolsElements/ImageSelector"

export const ACCOUNT_TYPES: { [x: string]: string } = {
  savings: "Savings",
  current: "Current (Checking)", // Adjust as needed
  personal: "Personal",
  corporate: "Corporate (Business)" // Adjust as needed
};

export const GENDER: {[x: string]: string} = {
  male: "Male",
  female: "Female"
}

export const MARITAL_STATUS: {[x: string]: string} = {
  single: "Single",
  married: "Married",
  divorce: "Divorced",
  widowed: "Widowed"
}

export const COMPLETE_STATUS: {[x: string]: string} = {
  Successful: "Successful Transaction",
  Failed: "Failed Transaction"
}

export const PROCESSING_DURATION: { [key: string]: string } = {
  immediately: "Immediately",
  "5s": "5 seconds",
  "10s": "10 seconds",
  "30s": "30 seconds",
  "1m": "1 minute",
  "5m": "5 minutes",
  "10m": "10 minutes",
  "15m": "15 minutes",
  "30m": "30 minutes",
  "45m": "45 minutes",
  "1h": "1 hour",
  "2h": "2 hours",
  "4h": "4 hours",
  "6h": "6 hours",
  "12h": "12 hours",
  "1d": "1 day",
  "2d": "2 days",
  "3d": "3 days",
  "1w": "1 week",
  "2w": "2 weeks",
  "3w": "3 weeks",
  "1M": "1 month",
  "2M": "2 months",
  "3M": "3 months",
  "6M": "6 months",
  "9M": "9 months",
  "1y": "1 year",
  "2y": "2 years",
  "5y": "5 years",
};


export const STAMP_CIRCLE = {
  id: "STAMP_CIRCLE",
  title: "STAMP_CIRCLE", 
  downloadImage: "/res/tools/letter/1024/circle.png?v=1",
  thumbnail: "",
  image: {
    base: "/res/tools/letter/512/circle.png?v=1",
    md: "/res/tools/letter/728/circle.png?v=1",
    lg: "/res/tools/letter/1024/circle.png?v=1"
  }
}
export const APPROVE_STAMP = {
  id: "APPROVE_STAMP",
  title: "APPROVE_STAMP", 
  downloadImage: "/res/tools/letter/1024/approved.png?v=1",
  thumbnail: "",
  image: {
    base: "/res/tools/letter/512/approved.png?v=1",
    md: "/res/tools/letter/728/approved.png?v=1",
    lg: "/res/tools/letter/1024/approved.png?v=1"
  }
}
export const PAPER_TEXTURE = {
  id: "PAPER_TEXTURE",
  title: "PAPER_TEXTURE", 
  downloadImage: "/res/tools/letter/1024/texture.png?v=1",
  thumbnail: "",
  image: {
    base: "/res/tools/letter/512/texture.png?v=1",
    md: "/res/tools/letter/728/texture.png?v=1",
    lg: "/res/tools/letter/1024/texture.png?v=1"
  }
}
export const WATERMARK = {
  id: "WATERMARK",
  title: "WATERMARK", 
  downloadImage: "/res/tools/letter/1024/watermark.png?v=2",
  thumbnail: "",
  image: {
    base: "/res/tools/letter/512/watermark.png?v=2",
    md: "/res/tools/letter/728/watermark.png?v=2",
    lg: "/res/tools/letter/1024/watermark.png?v=2"
  }
}