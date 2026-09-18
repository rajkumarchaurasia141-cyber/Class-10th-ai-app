import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import fbConfig from '../../firebase-applet-config.json';

export const app = initializeApp(fbConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (fbConfig as any).firestoreDatabaseId || "(default)");
