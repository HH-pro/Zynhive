// ─── src/lib/firebase.ts ─────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, type User,
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, setDoc,
  doc, getDocs, getDoc, query, orderBy, serverTimestamp, Timestamp,
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

// ─── Clients ──────────────────────────────────────────────────────────────────
export type FirestoreClient = {
  id?:               string;
  name:              string;
  company:           string;
  email:             string;
  password:          string;
  projectName:       string;
  whatsappNumber?:   string;
  whatsappApiKey?:   string;
  createdAt?:        Timestamp;
  updatedAt?:        Timestamp;
};

const CLIENTS_COL = "clients";
export async function fetchClients(): Promise<FirestoreClient[]> {
  const snap = await getDocs(collection(db, CLIENTS_COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FirestoreClient))
    .sort((a, b) => {
      const ta = (a.createdAt as Timestamp)?.toMillis?.() ?? 0;
      const tb = (b.createdAt as Timestamp)?.toMillis?.() ?? 0;
      return tb - ta;
    });
}
export async function fetchClientById(id: string): Promise<FirestoreClient | null> {
  const snap = await getDoc(doc(db, CLIENTS_COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreClient;
}
export const createClient = (data: Omit<FirestoreClient, "id" | "createdAt" | "updatedAt">) =>
  addDoc(collection(db, CLIENTS_COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const updateClient = (id: string, data: Partial<FirestoreClient>) =>
  updateDoc(doc(db, CLIENTS_COL, id), { ...data, updatedAt: serverTimestamp() });
export const deleteClient = (id: string) => deleteDoc(doc(db, CLIENTS_COL, id));

// ─── Client Updates ───────────────────────────────────────────────────────────
export type FirestoreClientUpdate = {
  id?:               string;
  clientId:          string;
  title:             string;
  description:       string;
  status:            "planning" | "in-progress" | "review" | "completed" | "on-hold";
  phase:             string;
  completionPercent: number;
  imageUrl?:         string;
  category?:         "seo" | "digital-marketing" | "general";
  createdAt?:        Timestamp;
  updatedAt?:        Timestamp;
};

const CLIENT_UPDATES_COL = "client_updates";
export async function fetchClientUpdates(clientId: string): Promise<FirestoreClientUpdate[]> {
  const snap = await getDocs(collection(db, CLIENT_UPDATES_COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FirestoreClientUpdate))
    .filter((u) => u.clientId === clientId)
    .sort((a, b) => {
      const ta = (a.createdAt as Timestamp)?.toMillis?.() ?? 0;
      const tb = (b.createdAt as Timestamp)?.toMillis?.() ?? 0;
      return tb - ta;
    });
}
export const createClientUpdate = (data: Omit<FirestoreClientUpdate, "id" | "createdAt" | "updatedAt">) =>
  addDoc(collection(db, CLIENT_UPDATES_COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
export const updateClientUpdate = (id: string, data: Partial<FirestoreClientUpdate>) =>
  updateDoc(doc(db, CLIENT_UPDATES_COL, id), { ...data, updatedAt: serverTimestamp() });
export const deleteClientUpdate = (id: string) => deleteDoc(doc(db, CLIENT_UPDATES_COL, id));

// ─── Update Feedback ──────────────────────────────────────────────────────────
export type FirestoreUpdateFeedback = {
  id?:         string;
  updateId:    string;
  clientId:    string;
  message:     string;
  fromClient:  boolean;  // true = client, false = team reply
  senderName?: string;
  createdAt?:  Timestamp;
};

const UPDATE_FEEDBACK_COL = "update_feedback";
export async function fetchUpdateFeedback(updateId: string): Promise<FirestoreUpdateFeedback[]> {
  const snap = await getDocs(collection(db, UPDATE_FEEDBACK_COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FirestoreUpdateFeedback))
    .filter((f) => f.updateId === updateId)
    .sort((a, b) => {
      const ta = (a.createdAt as Timestamp)?.toMillis?.() ?? 0;
      const tb = (b.createdAt as Timestamp)?.toMillis?.() ?? 0;
      return ta - tb;
    });
}
export async function fetchAllFeedbackForClient(clientId: string): Promise<FirestoreUpdateFeedback[]> {
  const snap = await getDocs(collection(db, UPDATE_FEEDBACK_COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FirestoreUpdateFeedback))
    .filter((f) => f.clientId === clientId);
}
export const createUpdateFeedback = (data: Omit<FirestoreUpdateFeedback, "id" | "createdAt">) =>
  addDoc(collection(db, UPDATE_FEEDBACK_COL), { ...data, createdAt: serverTimestamp() });

// ─── Notification Settings ────────────────────────────────────────────────────
export type TeamMemberNotif = {
  name:   string;
  number: string;   // with country code e.g. +923001234567
  apiKey: string;   // CallMeBot API key
};
export type NotificationSettings = {
  teamMembers: TeamMemberNotif[];
};

const SETTINGS_COL = "settings";
export async function fetchNotificationSettings(): Promise<NotificationSettings | null> {
  const snap = await getDoc(doc(db, SETTINGS_COL, "notifications"));
  if (!snap.exists()) return null;
  return snap.data() as NotificationSettings;
}
export const saveNotificationSettings = (data: NotificationSettings) =>
  setDoc(doc(db, SETTINGS_COL, "notifications"), data);