import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Firestore,
  DocumentReference,
  DocumentData,
  SetOptions
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export { firebaseConfig };
export const firebaseOptions = firebaseConfig;

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth explicitly using initializeAuth to avoid "Component auth has not been registered yet"
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch (e1) {
  try {
    authInstance = getAuth(app);
  } catch (e2) {
    try {
      authInstance = getAuth();
    } catch (e3) {
      console.warn("Auth initialization fallback:", e3);
      authInstance = {} as Auth;
    }
  }
}

export const auth: Auth = authInstance;

// Initialize Firestore
let dbInstance: Firestore;
try {
  const customDbId = firebaseConfig.firestoreDatabaseId;
  if (customDbId && customDbId !== '(default)') {
    try {
      dbInstance = getFirestore(app, customDbId);
    } catch (e1) {
      try {
        dbInstance = initializeFirestore(app, {}, customDbId);
      } catch (e2) {
        dbInstance = getFirestore(app);
      }
    }
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  try {
    dbInstance = getFirestore(app);
  } catch (err) {
    try {
      dbInstance = getFirestore();
    } catch (err2) {
      console.warn("Firestore initialization fallback:", err2);
      dbInstance = {} as Firestore;
    }
  }
}

export const db: Firestore = dbInstance;
export const firestore: Firestore = dbInstance;

export const googleProvider = new GoogleAuthProvider();
try {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (e) {}

// Safe Firestore wrappers to prevent any unhandled crash
export const safeDoc = (dbTarget: Firestore | null, path: string, ...pathSegments: string[]): DocumentReference<DocumentData> | null => {
  if (!dbTarget) return null;
  try {
    return doc(dbTarget, path, ...pathSegments);
  } catch (e) {
    return null;
  }
};

export const safeSetDoc = async (docRef: DocumentReference<DocumentData> | null, data: any, options?: SetOptions) => {
  if (!docRef) return;
  try {
    if (options) {
      await setDoc(docRef, data, options);
    } else {
      await setDoc(docRef, data);
    }
  } catch (e) {
    console.warn("Firestore safeSetDoc warning:", e);
  }
};

export { doc, setDoc, getDoc, onSnapshot };
