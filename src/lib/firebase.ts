// ─── src/lib/firebase.ts ─────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, type User,
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, orderBy, serverTimestamp, Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const adminLogin   = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p);
export const adminLogout  = () => signOut(auth);
export const onAuthChange = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

// ─── Projects ─────────────────────────────────────────────────────────────────
export type FirestoreProject = {
  id?:           string;
  title:         string;
  category:      string;
  tags:          string[];
  description:   string;
  result:        string;
  emoji:         string;
  color:         string;
  featured:      boolean;
  imageUrl:      string;
  imagePublicId: string;
  liveUrl:       string;
  githubUrl:     string;
  createdAt?:    Timestamp;
  updatedAt?:    Timestamp;
};

const PROJ_COL = "projects";
export async function fetchProjects(): Promise<FirestoreProject[]> {
  const snap = await getDocs(query(collection(db, PROJ_COL), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreProject));
}
export const createProject = (data: Omit<FirestoreProject,"id"|"createdAt"|"updatedAt">) =>
  addDoc(collection(db, PROJ_COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const updateProject = (id: string, data: Partial<FirestoreProject>) =>
  updateDoc(doc(db, PROJ_COL, id), { ...data, updatedAt: serverTimestamp() });
export const deleteProject = (id: string) => deleteDoc(doc(db, PROJ_COL, id));

// ─── Team Members ─────────────────────────────────────────────────────────────
export type FirestoreMember = {
  id?:           string;
  name:          string;
  role:          string;
  bio:           string;
  initials:      string;
  color:         string;
  imageUrl:      string;
  imagePublicId: string;
  order:         number;
  socials: {
    linkedin:  string;
    twitter:   string;
    github:    string;
    instagram: string;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const TEAM_COL = "team";
export async function fetchMembers(): Promise<FirestoreMember[]> {
  // No orderBy — avoids requiring a Firestore composite index.
  // Sort client-side by order field instead.
  const snap = await getDocs(collection(db, TEAM_COL));
  const members = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreMember));
  return members.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
export const createMember = (data: Omit<FirestoreMember,"id"|"createdAt"|"updatedAt">) =>
  addDoc(collection(db, TEAM_COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const updateMember = (id: string, data: Partial<FirestoreMember>) =>
  updateDoc(doc(db, TEAM_COL, id), { ...data, updatedAt: serverTimestamp() });
export const deleteMember = (id: string) => deleteDoc(doc(db, TEAM_COL, id));

// ─── Leads ────────────────────────────────────────────────────────────────────
export type FirestoreLead = {
  id?:            string;
  companyName:    string;
  email:          string;
  phone:          string;
  whatsapp:       string;
  hasWhatsapp:    boolean;
  website:        string;
  socialLinks:    string;
  proposal:       string;
  imageUrl:       string;
  imagePublicId:  string;
  status:         "new" | "contacted" | "qualified" | "proposal" | "closed" | "lost";
  priority:       "high" | "medium" | "low";
  employeeName:   string;
  employeeId:     string;
  leadSource:     string;
  leadScore:      number;
  country:        string;
  city:           string;
  tags:           string[];
  notes:          { text: string; employeeName: string; date: string }[];
  followUpDate:   string | null;
  followUpCount:  number;
  lastContacted:  string | null;
  createdAt?:     Timestamp;
  updatedAt?:     Timestamp;
};

const LEADS_COL = "leads";
export async function fetchLeads(): Promise<FirestoreLead[]> {
  const snap = await getDocs(collection(db, LEADS_COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FirestoreLead))
    .sort((a, b) => {
      const ta = (a.createdAt as Timestamp)?.toMillis?.() ?? 0;
      const tb = (b.createdAt as Timestamp)?.toMillis?.() ?? 0;
      return tb - ta;
    });
}
export const createLead = (data: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">) =>
  addDoc(collection(db, LEADS_COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const updateLead = (id: string, data: Partial<FirestoreLead>) =>
  updateDoc(doc(db, LEADS_COL, id), { ...data, updatedAt: serverTimestamp() });
export const deleteLead = (id: string) => deleteDoc(doc(db, LEADS_COL, id));