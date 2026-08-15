
const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './.env') })

const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");
const { splitFunds } = require('./split-funds');
const initAdminFinal = () => {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  const initAdmin = () => {
    try {
      if(!admin.app()) {
        initAdminFinal()
      }
  
    } catch(e) {
      initAdminFinal()
    }
  }
  const closeAdmin = () => {
    try {
      if(admin.app()) {
        admin.app().delete()
        .then(() => {
          //console.log('Firebase Admin SDK instance has been deleted.');
        })
        .catch((error) => {
          //console.error('Error deleting Firebase Admin SDK instance:', error);
        });
      }
  
    } catch(e) {
      
    }
  }

const interval = 60 * 1000
const run = () => {
    initAdmin(); // Ensure initAdmin completes if it's async
    splitFunds(admin, "bnb")
    .then((r) => {
        console.log("splitFunds completed successfully.", r);
    })
    .catch((error) => {
        console.error("splitFunds failed:", error.message);
    })
    .finally(() => {
        closeAdmin(); // Ensure cleanup happens regardless of success/failure
        crontab(interval)
    })
}


const crontab = () => {
  setTimeout(() => {
    run();
  }, interval);
}

crontab(interval);