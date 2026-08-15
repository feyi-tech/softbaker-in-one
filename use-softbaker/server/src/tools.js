const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Reference to Firestore
const db = admin.firestore();

// Function to update bnb_contract_created using batch write
const run = async () => {
    try {
        const sdkDoc = db.doc("cache/sdk_config"); // Corrected doc reference
        const docSnapshot = await sdkDoc.get(); // Await the getDoc call

        if (docSnapshot.exists) {
            const tools = docSnapshot.data().toolsV2;
            const batch = db.batch(); // Create a batch instance

            // Iterate over each tool to create a batch update
            tools.forEach(tool => {
                const toolRef = db.collection('other_tools').doc();
                batch.set(toolRef, { ...tool, is_static: true }); // Using set instead of update to create new documents
            });

            // Commit the batch
            await batch.commit();
            console.log('Batch update committed successfully');
        } else {
            console.log('No such document!');
        }
    } catch (e) {
        console.error('Error updating documents:', e);
    }
};

// Run the update function
run();
