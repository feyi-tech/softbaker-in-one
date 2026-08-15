import {
    FaAddressBook,
    FaAddressCard,
    FaHandPaper,
    FaPassport,
    FaCertificate,
    FaReceipt,
    FaServer,
    FaMailBulk,
    FaInbox,
    FaFile,
    FaIdCard, 
    FaIdCardAlt,
    FaGlobe,
    FaBitcoin,
    FaCcMastercard,
    FaCcPaypal,
    FaCcStripe,
    FaCcVisa,
    FaChrome,
    FaDocker,
    FaUser,
    FaUsers,
    FaVideoSlash,
    FaVideo,
    FaImage,
    FaLocationArrow,
    FaStamp,
    FaIdBadge,
    FaShippingFast,
    FaPlaneDeparture,
    FaBuilding,
    FaPenAlt,
    FaFemale,
    FaMoneyBillAlt,
    FaCoins
} from "react-icons/fa"
    
export interface Icon {
    element: any | null,
    name: string | null,
    id: string | null,
    [x: string]: any
}
    
const ICONS: {[x: string]: Icon} = {
    AddressBook: {
	    id: "AddressBook", 
	    element: (props: any) => <FaAddressBook {...(props || {})} />, 
	    name: "Address Book"
	},
    AddressCard: {
	    id: "AddressCard", 
	    element: (props: any) => <FaAddressCard {...(props || {})} />, 
	    name: "Address Card"
	},
    HandPaper: {
	    id: "HandPaper", 
	    element: (props: any) => <FaHandPaper {...(props || {})} />, 
	    name: "Hand Paper"
	},
    Passport: {
	    id: "Passport", 
	    element: (props: any) => <FaPassport {...(props || {})} />, 
	    name: "Passport"
	},
    Certificate: {
	    id: "Certificate", 
	    element: (props: any) => <FaCertificate {...(props || {})} />, 
	    name: "Certificate"
	},
    Receipt: {
	    id: "Receipt", 
	    element: (props: any) => <FaReceipt {...(props || {})} />, 
	    name: "Receipt"
	},
    Server: {
	    id: "Server", 
	    element: (props: any) => <FaServer {...(props || {})} />, 
	    name: "Server"
	},
    MailBulk: {
	    id: "MailBulk", 
	    element: (props: any) => <FaMailBulk {...(props || {})} />, 
	    name: "Mail Bulk"
	},
    Bitcoin: {
        id: "Bitcoin", 
        element: (props: any) => <FaBitcoin {...(props || {})} />, 
        name: "Bitcoin"
    },
    CcMastercard: {
        id: "CcMastercard", 
        element: (props: any) => <FaCcMastercard {...(props || {})} />, 
        name: "Cc Mastercard"
    },
    CcPaypal: {
        id: "CcPaypal", 
        element: (props: any) => <FaCcPaypal {...(props || {})} />, 
        name: "Cc Paypal"
    },
    CcStripe: {
        id: "CcStripe", 
        element: (props: any) => <FaCcStripe {...(props || {})} />, 
        name: "Cc Stripe"
    },
    CcVisa: {
        id: "CcVisa", 
        element: (props: any) => <FaCcVisa {...(props || {})} />, 
        name: "Cc Visa"
    },
    Docker: {
        id: "Docker", 
        element: (props: any) => <FaDocker {...(props || {})} />, 
        name: "Docker"
    },
    File: {
        id: "File", 
        element: (props: any) => <FaFile {...(props || {})} />, 
        name: "File"
    },
    Globe: {
        id: "Globe", 
        element: (props: any) => <FaGlobe {...(props || {})} />, 
        name: "Globe"
    },
    IdCardAlt: {
        id: "IdCardAlt", 
        element: (props: any) => <FaIdCardAlt {...(props || {})} />, 
        name: "Id Card Alt"
    },
    IdCard: {
        id: "IdCard", 
        element: (props: any) => <FaIdCard {...(props || {})} />, 
        name: "Id Card"
    },
    Image: {
        id: "Image", 
        element: (props: any) => <FaImage {...(props || {})} />, 
        name: "Image"
    },
    Inbox: {
        id: "Inbox", 
        element: (props: any) => <FaInbox {...(props || {})} />, 
        name: "Inbox"
    },
    LocationArrow: {
        id: "LocationArrow", 
        element: (props: any) => <FaLocationArrow {...(props || {})} />, 
        name: "Location Arrow"
    },
    User: {
        id: "User", 
        element: (props: any) => <FaUser {...(props || {})} />, 
        name: "User"
    },
    Users: {
        id: "Users", 
        element: (props: any) => <FaUsers {...(props || {})} />, 
        name: "Users"
    },
    VideoSlash: {
        id: "VideoSlash", 
        element: (props: any) => <FaVideoSlash {...(props || {})} />, 
        name: "Video Slash"
    },
    Video: {
        id: "Video", 
        element: (props: any) => <FaVideo {...(props || {})} />, 
        name: "Video"
    },
    Stamp: {
        id: "Stamp", 
        element: (props: any) => <FaStamp {...(props || {})} />, 
        name: "Stamp"
    },
    IdBadge: {
        id: "IdBadge", 
        element: (props: any) => <FaIdBadge {...(props || {})} />, 
        name: "Id Badge"
    },
    Chrome: {
        id: "Chrome", 
        element: (props: any) => <FaChrome {...(props || {})} />, 
        name: "Chrome"
    },
    ShippingFast: {
        id: "ShippingFast", 
        element: (props: any) => <FaShippingFast {...(props || {})} />, 
        name: "ShippingFast"
    },
    PlaneDeparture: {
        id: "PlaneDeparture", 
        element: (props: any) => <FaPlaneDeparture {...(props || {})} />, 
        name: "PlaneDeparture"
    },
    Building: {
        id: "Building", 
        element: (props: any) => <FaBuilding {...(props || {})} />, 
        name: "Building"
    },
    PenAlt: {
        id: "PenAlt", 
        element: (props: any) => <FaPenAlt {...(props || {})} />, 
        name: "PenAlt"
    },
    Female: {
        id: "Female", 
        element: (props: any) => <FaFemale {...(props || {})} />, 
        name: "Female"
    },
    MoneyBillAlt: {
        id: "MoneyBillAlt", 
        element: (props: any) => <FaMoneyBillAlt {...(props || {})} />, 
        name: "MoneyBillAlt"
    },
    Coins: {
        id: "Coins", 
        element: (props: any) => <FaCoins {...(props || {})} />, 
        name: "Coins"
    }
}
    
export default ICONS