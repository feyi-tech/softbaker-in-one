const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Reference to Firestore
const db = admin.firestore();

async function updateTemplateIds() {
    const collectionRef = db.collection('other_tools_data');
    const snapshot = await collectionRef.where('template_id', '==', '6nuztkxc').get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    // Loop through each document and update the template_id
    const batch = db.batch();
    snapshot.forEach(doc => {
        const docRef = collectionRef.doc(doc.id);
        batch.update(docRef, { template_id: '6dae1fcn' });
    });

    // Commit the batch update
    await batch.commit();
    console.log('Template IDs updated successfully.');
}

updateTemplateIds().catch(error => {
    console.error('Error updating template IDs:', error);
});