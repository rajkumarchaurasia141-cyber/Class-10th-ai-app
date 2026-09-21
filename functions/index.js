const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.syncData = functions.firestore
    .document('{collection}/{docId}')
    .onWrite(async (change, context) => {
        const collections = ['courses', 'admin_courses', 'subjects', 'videos', 'pdf_notes', 'banners', 'quiz'];
        
        console.log(`Exporting docs...`);
        
        const data = {};
        for (const col of collections) {
            const snapshot = await db.collection(col).get();
            data[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`Exporting ${col}: ${snapshot.size} docs`);
        }
        
        // Note: Writing to public/app_data.json via Cloud Function is not possible
        // directly as Cloud Functions don't have access to the hosting deployment
        // filesystem in the same way. This requires a different approach
        // (like writing to Firebase Storage and setting public access).
        console.log("Sync logic triggered. Actual file write needs Storage/Hosting API.");
    });
