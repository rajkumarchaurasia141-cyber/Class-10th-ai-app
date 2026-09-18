import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sanskritChapter1Data } from '../data/sanskritChapter1Data';
import { hindiChapter1Data } from '../data/hindiChapter1Data';

/**
 * Ensures Sanskrit Chapter 1 and Hindi Chapter 1 are stored in Firestore
 * under /subjects/{subjectId}/chapters/ch_1 and /subjects/{subjectId}
 */
export async function syncInitialCurriculumToFirestore() {
  try {
    // Avoid hammering Firestore on every page reload if already synced on this client
    if (localStorage.getItem('bseb_curriculum_synced_v1') === 'true') {
      return;
    }

    // 1. Sync Sanskrit Subject & Chapter 1
    const sanskritSubRef = doc(db, 'subjects', 'sanskrit');
    await setDoc(sanskritSubRef, {
      id: 'sanskrit',
      subject_name: 'Sanskrit',
      subject_name_hindi: 'संस्कृत (पीयूषम् भाग-2)',
      updated_at: new Date().toISOString()
    }, { merge: true });

    const sanskritCh1Ref = doc(db, 'subjects', 'sanskrit', 'chapters', 'ch_1');
    await setDoc(sanskritCh1Ref, {
      ...sanskritChapter1Data,
      updated_at: new Date().toISOString()
    }, { merge: true });

    // Also support 'ch1' in case queried without underscore
    const sanskritCh1AltRef = doc(db, 'subjects', 'sanskrit', 'chapters', 'ch1');
    await setDoc(sanskritCh1AltRef, {
      ...sanskritChapter1Data,
      updated_at: new Date().toISOString()
    }, { merge: true });

    // 2. Sync Hindi Subject & Chapter 1
    const hindiSubRef = doc(db, 'subjects', 'hindi');
    await setDoc(hindiSubRef, {
      id: 'hindi',
      subject_name: 'Hindi',
      subject_name_hindi: 'हिन्दी (गोधूलि भाग-2)',
      updated_at: new Date().toISOString()
    }, { merge: true });

    const hindiCh1Ref = doc(db, 'subjects', 'hindi', 'chapters', 'ch_1');
    await setDoc(hindiCh1Ref, {
      ...hindiChapter1Data,
      updated_at: new Date().toISOString()
    }, { merge: true });

    localStorage.setItem('bseb_curriculum_synced_v1', 'true');
    console.log("Firestore Curriculum Sync: Sanskrit Ch1 & Hindi Ch1 successfully synced.");
  } catch (err: any) {
    // Silent catch so it never degrades user experience if offline
    console.warn("Firestore Curriculum Sync notice:", err?.message || String(err));
  }
}
