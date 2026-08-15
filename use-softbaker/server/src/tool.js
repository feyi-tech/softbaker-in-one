const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Replace 'path/to/serviceAccountKey.json' with the path to your service account key file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Array of tools data
const toolsV2Data = [
    {
        id: "cargo",
        name: "Shipping",
        isActive: true,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/cargo-64.png",
        siteUrl: "/cargo",
        desktopVideoUrl: "https://youtube.com/embed/cQmehriCQJA",
        mobileVideoUrl: "https://youtube.com/embed/cQmehriCQJA"
    },
    {
        id: "flight",
        name: "Flight Ticket",
        isActive: true,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/flight-64.png",
        siteUrl: "/flight",
        desktopVideoUrl: "https://youtube.com/embed/CU6ttOppIo4",
        mobileVideoUrl: "https://youtube.com/embed/CU6ttOppIo4"
    },
    {
        id: "invest",
        name: "Investment Platform",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/invest-64.png",
        siteUrl: "/invest",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "invoice",
        name: "Invoice",
        isActive: true,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/invoice-64.png",
        siteUrl: "/invoice",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "check",
        name: "Bank Check",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/check-64.png",
        siteUrl: "/check",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "passport",
        name: "Passport",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/passport-64.png",
        siteUrl: "/passport",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "ssn",
        name: "SSN",
        isActive: true,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/ssn-64.png",
        siteUrl: "/ssn",
        desktopVideoUrl: "https://youtube.com/embed/joGS5xUib4g",
        mobileVideoUrl: "https://youtube.com/embed/joGS5xUib4g"
    },
    {
        id: "id-card",
        name: "ID Card",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/id-card-64.png",
        siteUrl: "/id-card",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "us-military-id",
        name: "US Military ID",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/us-military-id-64.png",
        siteUrl: "/us-military-id",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "hold-paper",
        name: "Hold a Paper",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/hold-paper-64.png",
        siteUrl: "/hold-paper",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "cert",
        name: "Certificate",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/cert-64.png",
        siteUrl: "/cert",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "letter",
        name: "Letter",
        isActive: true,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/letter-64.png",
        siteUrl: "/letter",
        desktopVideoUrl: "https://youtube.com/embed/vVaHpEJYddE",
        mobileVideoUrl: "https://youtube.com/embed/vVaHpEJYddE"
    },
    {
        id: "bank",
        name: "Banking Website",
        isActive: true,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/bank-64.png",
        siteUrl: "/bank",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "spamming",
        name: "Spamming & Phishing",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/spamming-64.png",
        siteUrl: "/spamming",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "escort",
        name: "Escort Order",
        isActive: false,
        isHidden: false,
        siteLogoUrl: "https://softbaker.com/tools-images/escort-64.png",
        siteUrl: "/escort",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    },
    {
        id: "drainer",
        name: "Crypto Drainer",
        isActive: false,
        isHidden: true,
        siteLogoUrl: "https://softbaker.com/tools-images/drainer-64.png",
        siteUrl: "/drainer",
        desktopVideoUrl: null,
        mobileVideoUrl: null
    }
];

// Function to set the toolsV2 attribute in the Firestore document
async function setToolsV2() {
    const db = admin.firestore();
    const docRef = db.doc('cache/sdk_config');

    try {
        // Update the document with toolsV2 data
        await docRef.set({
            toolsV2: toolsV2Data
        }, { merge: true });

        console.log('toolsV2 attribute set successfully');
    } catch (error) {
        console.error('Error setting toolsV2 attribute:', error);
    }
}

// Call the function
setToolsV2();