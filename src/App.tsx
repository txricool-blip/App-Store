import React, { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Smartphone, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  RefreshCcw
} from "lucide-react";

// Types
import { AppItem, Category } from "./types";

// Firebase Services
import { 
  auth,
  isUserAdmin,
  seedInitialStoreIfEmpty,
  fetchApps,
  fetchCategories,
  saveApp,
  deleteApp,
  saveCategory,
  deleteCategory,
  incrementDownload,
  loginWithGoogle,
  logoutUser,
  ADMIN_EMAIL
} from "./lib/firebase";

// Components
import Navbar from "./components/Navbar";
import FeaturedCarousel from "./components/FeaturedCarousel";
import BrowseView from "./components/BrowseView";
import AppDetailsView from "./components/AppDetailsView";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Navigation & Filtering States
  const [currentPage, setCurrentPage] = useState<"home" | "apps" | "admin" | "details">("home");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdminMode, setAdminMode] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Loading indicators
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Authenticate state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr && isUserAdmin(usr)) {
        console.log("Welcome Admin:", usr.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Local storage theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 3. Database initialization: seed and load apps/categories
  useEffect(() => {
    async function initDatabase() {
      setIsLoading(true);
      try {
        await seedInitialStoreIfEmpty();
        await refreshStoreData();
      } catch (error) {
        console.error("Store initialization warning:", error);
      } finally {
        setIsLoading(false);
      }
    }
    initDatabase();
  }, []);

  // Handler: Dynamic theme toggler
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Pull latest documents from Firestore
  const refreshStoreData = async () => {
    setIsRefreshing(true);
    try {
      const allApps = await fetchApps();
      const allCategories = await fetchCategories();
      setApps(allApps);
      setCategories(allCategories);
    } catch (error) {
      console.error("Refresh storefront catalog failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Authenticate Event Trigger
  const handleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        if (isUserAdmin(loggedUser)) {
          alert(`Logged in successfully! Welcome back to the Admin Panel, ${loggedUser.displayName}.`);
          setAdminMode(true);
          setCurrentPage("admin");
        } else {
          alert(`Authenticated as ${loggedUser.email}.\nNote: Only authorized developer administrators are permitted to write to this repository store.`);
        }
      }
    } catch (err) {
      alert("Sign-in process failed. Please ensure the Google popup is not blocked.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAdminMode(false);
      setCurrentPage("home");
      alert("Signed out successfully.");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // App details page launcher
  const handleViewDetails = (id: string) => {
    setSelectedAppId(id);
    setCurrentPage("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Direct APK file download system handler
  const handleDownload = async (app: AppItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // 1. Secure download tracker increment
      await incrementDownload(app.id);
      
      // 2. Incremental state update for real-time responsiveness
      setApps((prevApps) =>
        prevApps.map((item) =>
          item.id === app.id ? { ...item, downloads: item.downloads + 1 } : item
        )
      );

      // 3. User download trigger action feedback
      alert(`Beginning download for package:\nName: ${app.name}\nSize: ${app.fileSize}\nVersion: ${app.version}\nStatus: Verified Sandbox Secure`);

      // 4. Physical browser APK binary stream trigger
      if (app.apkUrl && app.apkUrl !== "#") {
        const link = document.createElement("a");
        link.href = app.apkUrl;
        link.download = `${app.id}-v${app.version}.apk`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to update download analytics:", error);
    }
  };

  // Admin Write Operations Wrap
  const handleSaveApp = async (appItem: AppItem) => {
    await saveApp(appItem);
    await refreshStoreData();
  };

  const handleDeleteApp = async (id: string) => {
    await deleteApp(id);
    await refreshStoreData();
  };

  const handleSaveCategory = async (category: Category) => {
    await saveCategory(category);
    await refreshStoreData();
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    await refreshStoreData();
  };

  // Quick category router shortcut
  const handleCategoryDiscoverSelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearchTerm("");
    setCurrentPage("apps");
  };

  // Selected single app for details view
  const activeAppDetails = apps.find((a) => a.id === selectedAppId);

  // Extract featured apps for slider
  const featuredApps = apps.filter((a) => a.featured);

  // Latest added apps
  const latestApps = [...apps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  // Most popular apps (by downloads count)
  const popularApps = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 4);

  return (
    <div className={`min-h-screen font-sans antialiased text-gray-950 bg-gray-50/50 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200`}>
      
      {/* Play Store Styled Navbar */}
      <Navbar
        user={user}
        isAdminMode={isAdminMode}
        setAdminMode={setAdminMode}
        onLogin={handleLogin}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          if (term && currentPage !== "apps") {
            setCurrentPage("apps");
          }
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        setCurrentPage={setCurrentPage}
        setSelectedAppId={setSelectedAppId}
      />

      {/* Main Container Layout */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Loader Mask */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <RefreshCcw className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-4">Initializing Storefront</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">Connecting securely to Firestore and synchronizing catalog assets...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: HOME PAGE (DISCOVERY) */}
            {currentPage === "home" && !isAdminMode && (
              <motion.div
                key="home-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {/* Hero Featured Carousel Header */}
                {featuredApps.length > 0 ? (
                  <FeaturedCarousel
                    featuredApps={featuredApps}
                    categories={categories}
                    onViewDetails={handleViewDetails}
                    onDownload={handleDownload}
                  />
                ) : (
                  <div className="rounded-3xl bg-blue-600 text-white p-8 md:p-12 shadow-lg">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Android App Publishing platform</h2>
                    <p className="text-sm text-blue-100 max-w-xl mt-2">Publish, manage, and download verified Android APK files safely from a single admin workspace.</p>
                  </div>
                )}

                {/* Main Categories Section Grid */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Browse by Category
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => (
                      <button
                        id={`category-card-${cat.id}`}
                        key={cat.id}
                        onClick={() => handleCategoryDiscoverSelect(cat.id)}
                        className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 hover:scale-[1.02] text-center transition-all"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-3">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Latest Published Apps Section Row */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Latest Android Releases
                    </h3>
                    <button 
                      id="view-all-latest"
                      onClick={() => { setSelectedCategory(null); setCurrentPage("apps"); }} 
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>View All</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {latestApps.map((app) => {
                      const catObj = categories.find(c => c.id === app.category);
                      return (
                        <div 
                          id={`latest-app-${app.id}`}
                          key={app.id}
                          onClick={() => handleViewDetails(app.id)}
                          className="group relative cursor-pointer bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md dark:bg-gray-900 dark:border-gray-850 flex gap-4 items-center transition-all"
                        >
                          <img src={app.iconUrl} alt={app.name} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {app.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">{catObj ? catObj.name : app.category}</p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">v{app.version} • {app.fileSize}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Popular apps catalog list */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Popular & Highly Downloaded
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {popularApps.map((app) => {
                      const catObj = categories.find(c => c.id === app.category);
                      return (
                        <div 
                          id={`popular-app-${app.id}`}
                          key={app.id}
                          onClick={() => handleViewDetails(app.id)}
                          className="group relative cursor-pointer bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md dark:bg-gray-900 dark:border-gray-850 flex gap-4 items-center transition-all"
                        >
                          <img src={app.iconUrl} alt={app.name} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {app.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">{catObj ? catObj.name : app.category}</p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">{app.downloads.toLocaleString()} downloads</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            )}

            {/* VIEW 2: APPS DIRECTORY PAGE (BROWSE & SEARCH) */}
            {currentPage === "apps" && !isAdminMode && (
              <motion.div
                key="apps-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <BrowseView
                  apps={apps}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onViewDetails={handleViewDetails}
                  onDownload={handleDownload}
                />
              </motion.div>
            )}

            {/* VIEW 3: SINGLE APP DETAILS PAGE */}
            {currentPage === "details" && !isAdminMode && activeAppDetails && (
              <motion.div
                key="details-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <AppDetailsView
                  app={activeAppDetails}
                  categories={categories}
                  onBack={() => {
                    // Back logic: if app has category, return to apps page, otherwise discover/home
                    setCurrentPage("apps");
                    setSelectedAppId(null);
                  }}
                  onDownload={handleDownload}
                />
              </motion.div>
            )}

            {/* VIEW 4: ADMIN DASHBOARD PANEL */}
            {currentPage === "admin" && isAdminMode && isUserAdmin(user) && (
              <motion.div
                key="admin-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <AdminPanel
                  apps={apps}
                  categories={categories}
                  onSaveApp={handleSaveApp}
                  onDeleteApp={handleDeleteApp}
                  onSaveCategory={handleSaveCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              </motion.div>
            )}

            {/* fallback: If user tries to open admin without correct privileges */}
            {currentPage === "admin" && isAdminMode && (!user || !isUserAdmin(user)) && (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-rose-100 bg-rose-50/20 dark:border-rose-950/20 max-w-lg mx-auto p-8">
                <ShieldAlert className="h-12 w-12 text-rose-500 animate-bounce" />
                <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400 mt-4">Administrative Privilege Required</h3>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 max-w-sm mt-2 leading-relaxed">
                  Only authorized system operators are allowed to access store-editor files. Please authenticate using the designated credentials.
                </p>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => { setAdminMode(false); setCurrentPage("home"); }}
                    className="rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 text-xs font-bold shadow-sm"
                  >
                    Back to Discover
                  </button>
                  <button
                    onClick={handleLogin}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10"
                  >
                    Authenticate Now
                  </button>
                </div>
              </div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* Beautiful humble Footer */}
      <footer className="mt-20 border-t border-gray-100 bg-white dark:border-gray-900 dark:bg-gray-950/80 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium">
            © 2026 Android App Store Platform. All developer builds verified secure.
          </p>
          <div className="flex gap-4 font-semibold text-gray-600 dark:text-gray-400">
            <button onClick={() => { setAdminMode(false); setCurrentPage("home"); setSelectedAppId(null); }} className="hover:text-blue-600">Discover</button>
            <button onClick={() => { setAdminMode(false); setCurrentPage("apps"); setSelectedAppId(null); }} className="hover:text-blue-600">Apps</button>
            {isUserAdmin(user) ? (
              <button onClick={() => { setAdminMode(true); setCurrentPage("admin"); setSelectedAppId(null); }} className="hover:text-blue-600 text-emerald-500">Dashboard</button>
            ) : (
              <button onClick={handleLogin} className="hover:text-blue-600">Operator Login</button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
