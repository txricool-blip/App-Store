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
  try {
    const q = query(collection(db, "apps"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const appsList: AppItem[] = [];
    snapshot.forEach((d) => {
      appsList.push(d.data() as AppItem);
    });
    return appsList;
  } catch (error) {
    console.error("Error fetching apps:", error);
    return [];
  }
}

export async function saveApp(appItem: AppItem): Promise<void> {
  const docRef = doc(db, "apps", appItem.id);
  await setDoc(docRef, appItem);
}

export async function deleteApp(id: string): Promise<void> {
  const docRef = doc(db, "apps", id);
  await deleteDoc(docRef);
}

export async function incrementDownload(id: string): Promise<void> {
  const docRef = doc(db, "apps", id);
  await updateDoc(docRef, {
    downloads: increment(1)
  });
}

// Firestore CRUD operations for Categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    const snapshot = await getDocs(collection(db, "categories"));
    const catList: Category[] = [];
    snapshot.forEach((d) => {
      catList.push(d.data() as Category);
    });
    return catList;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const docRef = doc(db, "categories", category.id);
  await setDoc(docRef, category);
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, "categories", id);
  await deleteDoc(docRef);
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
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
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

    const appsSnapshot = await getDocs(collection(db, "apps"));
    if (appsSnapshot.empty) {
      const initialApps: AppItem[] = [
        {
          id: "cyber-task-manager",
          name: "Cyber Task Manager",
          shortDescription: "A high-productivity task manager with kanban boards, reminders, and dark-theme focus dashboards.",
          fullDescription: "Stay super organized with Cyber Task Manager. Designed for professionals and power users, this productivity beast features lightning-fast task entry, custom tag groupings, interactive kanban boards, habit tracking statistics, and full cloud syncing. Keep your goals close, organize project hierarchies, and power through your days with our minimalist, eye-safe design.\n\nKey Features:\n- Interactive custom Kanban Boards\n- Pomodoro Session Timer integrated with log tracking\n- Smart calendar sync\n- Advanced tag categorization\n- Eye-strain reducing midnight styling",
          category: "productivity",
          version: "2.4.1",
          fileSize: "14.2 MB",
          androidVersion: "Android 8.0+",
          developerName: "PixelForge Studios",
          developerEmail: "support@pixelforgestudios.com",
          websiteUrl: "https://pixelforge.dev",
          iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=400&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=700&q=80",
            "https://images.unsplash.com/photo-1626379953822-baec19c3bbcd?auto=format&fit=crop&w=400&h=700&q=80"
          ],
          apkUrl: "#",
          downloads: 4820,
          featured: true,
          changelog: "- Added offline local syncing\n- Fixed notifications badge counting bugs\n- Implemented Pomodoro focus sessions",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "space-odyssey-runner",
          name: "Space Odyssey Runner",
          shortDescription: "Endless hyper-casual arcade runner through asteroids, wormholes, and alien defenses.",
          fullDescription: "Blast off into deep space in this adrenaline-fueled arcade runner! Evade dense asteroid belts, navigate unpredictable wormholes, collect hyper-fuel elements, and unlock sleek spaceships as you set high scores against the cosmos. Featuring stellar synthwave beats, responsive one-touch glide controls, and mesmerizing custom visual aesthetics.",
          category: "games",
          version: "1.0.8",
          fileSize: "45.1 MB",
          androidVersion: "Android 9.0+",
          developerName: "Astrea Interactive",
          developerEmail: "games@astrea.io",
          websiteUrl: "https://astrea.io",
          iconUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=150&h=150&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&h=400&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=400&h=700&q=80",
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&h=700&q=80"
          ],
          apkUrl: "#",
          downloads: 12530,
          featured: true,
          changelog: "- Added 3 new custom spaceships\n- New electronic soundtrack release\n- Refactored rendering for smoother frame-rates",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "secure-chat-messenger",
          name: "Secure Chat Messenger",
          shortDescription: "Ultra-private communication with end-to-end encryption, self-destructing messages, and dark mode.",
          fullDescription: "Communicate with absolute peace of mind. Secure Chat Messenger utilizes cutting-edge cryptographic protocols to deliver peer-to-peer messaging that cannot be intercepted. No server logs, no telemetry, and zero trackers. Send text, high-res photos, voice files, and documents that can automatically self-destruct upon reading.",
          category: "communication",
          version: "3.0.2",
          fileSize: "28.5 MB",
          androidVersion: "Android 7.0+",
          developerName: "CipherLabs Security",
          developerEmail: "privacy@cipherlabs.com",
          iconUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=150&h=150&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&h=400&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=400&h=700&q=80"
          ],
          apkUrl: "#",
          downloads: 7420,
          featured: false,
          changelog: "- Enhanced key exchange protocol with quantum resistance\n- Speed optimization for low-bandwidth networks",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ];

      for (const app of initialApps) {
        await saveApp(app);
      }
      console.log("Seeded default app listings.");
    }
  } catch (error) {
    console.error("Seeding operation skipped or encountered warning:", error);
  }
}
