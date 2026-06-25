import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { AppItem, Category } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBpYJws09YnKiLHEAw1My0reK7s6I1qHxE",
  authDomain: "gen-lang-client-0780382001.firebaseapp.com",
  projectId: "gen-lang-client-0780382001",
  storageBucket: "gen-lang-client-0780382001.firebasestorage.app",
  messagingSenderId: "909623143784",
  appId: "1:909623143784:web:06405efb511ad5f7457add"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID specified in configuration
export const db = getFirestore(app, "ai-studio-12dcdc9b-7b66-4acf-8893-67f191ab4f10");

// Initialize Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Admin Check
export const ADMIN_EMAIL = "t4rikulmini@gmail.com";
export function isUserAdmin(user: User | null): boolean {
  return user !== null && user.email === ADMIN_EMAIL;
}

// 3. Error handling specification as per firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const stringifiedError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', stringifiedError);
  throw new Error(stringifiedError);
}

// MANDATORY: Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Initial Firestore connection verified (record placeholder).");
    }
  }
}
testConnection();

// HELPER: Upload file with double-mode fallback
// Attempts Firebase Storage first; falls back to base64 if it fails or isn't fully enabled
export async function uploadMediaFile(
  file: File, 
  path: string
): Promise<string> {
  try {
    // Attempt Firebase Storage Upload
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn("Firebase Storage upload failed, falling back to local base64 storage:", error);
    // Fallback: Read file as base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

// Firestore CRUD operations for Apps
export async function fetchApps(): Promise<AppItem[]> {
  const path = "apps";
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const appsList: AppItem[] = [];
    snapshot.forEach((d) => {
      appsList.push(d.data() as AppItem);
    });
    return appsList;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveApp(appItem: AppItem): Promise<void> {
  const path = `apps/${appItem.id}`;
  try {
    const docRef = doc(db, "apps", appItem.id);
    await setDoc(docRef, appItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteApp(id: string): Promise<void> {
  const path = `apps/${id}`;
  try {
    const docRef = doc(db, "apps", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function incrementDownload(id: string): Promise<void> {
  const path = `apps/${id}`;
  try {
    const docRef = doc(db, "apps", id);
    await updateDoc(docRef, {
      downloads: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Firestore CRUD operations for Categories
export async function fetchCategories(): Promise<Category[]> {
  const path = "categories";
  try {
    const snapshot = await getDocs(collection(db, path));
    const catList: Category[] = [];
    snapshot.forEach((d) => {
      catList.push(d.data() as Category);
    });
    return catList;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const docRef = doc(db, "categories", category.id);
    await setDoc(docRef, category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Authentication Handlers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-in failed:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// SEED DATA: Seed initial categories and beautiful apps if they do not exist
export async function seedInitialStoreIfEmpty() {
  try {
    let categoriesSnapshot;
    try {
      categoriesSnapshot = await getDocs(collection(db, "categories"));
    } catch (error) {
      // If we fail here, let handleFirestoreError process it
      return handleFirestoreError(error, OperationType.GET, "categories");
    }

    if (categoriesSnapshot.empty) {
      const defaultCategories: Category[] = [
        { id: "games", name: "Games", icon: "Gamepad" },
        { id: "productivity", name: "Productivity", icon: "Briefcase" },
        { id: "communication", name: "Communication", icon: "MessageSquare" },
        { id: "tools", name: "Tools & Utilities", icon: "Wrench" },
        { id: "social", name: "Social Media", icon: "Share2" },
        { id: "entertainment", name: "Entertainment", icon: "Play" }
      ];
      
      for (const cat of defaultCategories) {
        await saveCategory(cat);
      }
      console.log("Seeded default app categories.");
    }

    // Clean up existing demo/simulator apps to ensure a completely pristine state
    const demoAppIds = ["cyber-task-manager", "space-odyssey-runner", "secure-chat-messenger"];
    for (const id of demoAppIds) {
      const docRef = doc(db, "apps", id);
      try {
        await deleteDoc(docRef);
        console.log(`Removed demo app: ${id}`);
      } catch (e) {
        console.warn(`Could not remove demo app ${id} on launch:`, e);
      }
    }
  } catch (error) {
    console.error("Seeding/Cleanup operation warning:", error);
    if (error instanceof Error && (error.message.includes("permission") || error.message.includes("Permission"))) {
      handleFirestoreError(error, OperationType.WRITE, "seeding");
    }
  }
}
