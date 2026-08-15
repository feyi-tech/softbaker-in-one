const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Reference to Firestore
const db = admin.firestore();

const updateBnbCreateHashSalt = async () => {
    try {
        const snapshot = await db.collection('wallets').get();
        
        if (snapshot.empty) {
            console.log('No matching documents found.');
            return;
        }

        // Prepare a batch to perform multiple writes
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
            const docRef = db.collection('wallets').doc(doc.id);
            // Set bnb_create_hash_salt to an empty string
            batch.update(docRef, { bnb_create_hash_salt: '' });
        });

        // Commit the batch
        await batch.commit();
        console.log('Successfully updated bnb_create_hash_salt for all documents in wallets collection.');

    } catch (error) {
        console.error('Error updating documents:', error);
    }
};

// Run the update function
updateBnbCreateHashSalt();