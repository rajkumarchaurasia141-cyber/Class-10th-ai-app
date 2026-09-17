import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { CLASS_10_DATABASE } from '../data/class10SubjectData.js';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);

async function seed() {
  console.log('Starting seed...');
  for (const [subjectId, subjectData] of Object.entries(CLASS_10_DATABASE)) {
    console.log(`Seeding subject: ${subjectId}`);
    
    // Create subject doc
    const subjectRef = doc(db, 'subjects', subjectId);
    await setDoc(subjectRef, {
      subject_id: subjectData.subject_id,
      subject_name: subjectData.subject_name || subjectData.subject_name_hindi,
      subject_name_hindi: subjectData.subject_name_hindi,
      icon: subjectData.icon || 'BookOpen',
      tagline: subjectData.tagline || '',
      color: subjectData.color || 'bg-gray-500'
    });

    // Create chapters
    for (const chapter of subjectData.chapters) {
      const chapterId = `ch_${chapter.chapter_no}`;
      console.log(`  Seeding chapter: ${chapterId}`);
      const chapterRef = doc(collection(subjectRef, 'chapters'), chapterId);
      await setDoc(chapterRef, chapter);
    }
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
