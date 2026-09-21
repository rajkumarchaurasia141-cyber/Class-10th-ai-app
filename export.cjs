const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function exportCollections() {
  // Added all collections detected from user context
  const collections = ['courses', 'admin_courses', 'subjects', 'videos', 'pdf_notes', 'banners', 'quiz'];
  const data = {};
  for (const col of collections) {
    try {
      const snapshot = await db.collection(col).get();
      data[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Exported ${col}: ${snapshot.size} docs`);
    } catch (e) {
      console.error(`Error exporting ${col}:`, e);
    }
  }
  
  // Ensure directory exists
  if (!fs.existsSync('./public')) {
      fs.mkdirSync('./public');
  }
  
  fs.writeFileSync('./public/app_data.json', JSON.stringify(data, null, 2));
  console.log("Data exported to public/app_data.json");
}
exportCollections();
