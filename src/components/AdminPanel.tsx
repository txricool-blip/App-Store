import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  LayoutDashboard, 
  ListFilter, 
  Settings, 
  Check, 
  ShieldAlert, 
  Download, 
  Sparkles,
  RefreshCcw,
  Tag,
  Gamepad,
  Image as ImageIcon
} from "lucide-react";
import { AppItem, Category } from "../types";
import { uploadMediaFile } from "../lib/firebase";

interface AdminPanelProps {
  apps: AppItem[];
  categories: Category[];
  onSaveApp: (app: AppItem) => Promise<void>;
  onDeleteApp: (id: string) => Promise<void>;
  onSaveCategory: (cat: Category) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

type AdminTab = "overview" | "apps" | "add-edit-app" | "categories";

export default function AdminPanel({
  apps,
  categories,
  onSaveApp,
  onDeleteApp,
  onSaveCategory,
  onDeleteCategory
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category creation state
  const [newCatId, setNewCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Smartphone");

  // App form state
  const [appForm, setAppForm] = useState<Partial<AppItem>>({
    id: "",
    name: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    version: "1.0.0",
    fileSize: "10 MB",
    androidVersion: "8.0+",
    developerName: "",
    developerEmail: "",
    websiteUrl: "",
    iconUrl: "",
    bannerUrl: "",
    screenshots: [],
    apkUrl: "#",
    downloads: 0,
    featured: false,
    changelog: "Initial release"
  });

  // Loading flags for uploads
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  // Calculations for Overview stats
  const totalApps = apps.length;
  const totalDownloads = apps.reduce((acc, a) => acc + (a.downloads || 0), 0);
  const totalCategories = categories.length;
  const featuredAppsCount = apps.filter((a) => a.featured).length;

  // Sync edit app form
  useEffect(() => {
    if (editingApp) {
      setAppForm({ ...editingApp });
    } else {
      setAppForm({
        id: "",
        name: "",
        shortDescription: "",
        fullDescription: "",
        category: categories[0]?.id || "",
        version: "1.0.0",
        fileSize: "10 MB",
        androidVersion: "8.0+",
        developerName: "",
        developerEmail: "",
        websiteUrl: "",
        iconUrl: "",
        bannerUrl: "",
        screenshots: [],
        apkUrl: "#",
        downloads: 0,
        featured: false,
        changelog: "Initial release"
      });
    }
  }, [editingApp, categories]);

  const handleAppEditSelect = (app: AppItem) => {
    setEditingApp(app);
    setActiveTab("add-edit-app");
  };

  const handleAppDeleteSelect = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this app permanently? This cannot be undone.")) {
      try {
        await onDeleteApp(id);
      } catch (error) {
        alert("Failed to delete application.");
      }
    }
  };

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.id || !appForm.name || !appForm.category) {
      alert("Please fill in all mandatory fields (ID, Name, and Category).");
      return;
    }

    // Secure custom slug format verification
    const idRegex = /^[a-zA-Z0-9_\-]+$/;
    if (!idRegex.test(appForm.id)) {
      alert("The App ID must contain only alphanumeric characters, hyphens, or underscores.");
      return;
    }

    setIsSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      const payload: AppItem = {
        id: appForm.id,
        name: appForm.name,
        shortDescription: appForm.shortDescription || "",
        fullDescription: appForm.fullDescription || "",
        category: appForm.category,
        version: appForm.version || "1.0.0",
        fileSize: appForm.fileSize || "10 MB",
        androidVersion: appForm.androidVersion || "8.0+",
        developerName: appForm.developerName || "Unknown Developer",
        developerEmail: appForm.developerEmail || "dev@example.com",
        websiteUrl: appForm.websiteUrl || "#",
        iconUrl: appForm.iconUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
        bannerUrl: appForm.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=400&q=80",
        screenshots: appForm.screenshots || [],
        apkUrl: appForm.apkUrl || "#",
        downloads: appForm.downloads || 0,
        featured: appForm.featured || false,
        changelog: appForm.changelog || "",
        createdAt: editingApp ? editingApp.createdAt : timestamp,
        updatedAt: timestamp
      };

      await onSaveApp(payload);
      setEditingApp(null);
      setActiveTab("apps");
    } catch (err) {
      console.error(err);
      alert("Failed to save application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) {
      alert("Please enter both ID and Name for the category.");
      return;
    }

    const slugRegex = /^[a-zA-Z0-9_\-]+$/;
    if (!slugRegex.test(newCatId)) {
      alert("Category ID must be alphanumeric and contain no spaces.");
      return;
    }

    try {
      await onSaveCategory({
        id: newCatId,
        name: newCatName,
        icon: newCatIcon
      });
      setNewCatId("");
      setNewCatName("");
      setNewCatIcon("Smartphone");
    } catch (err) {
      alert("Failed to save category.");
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm("Deleting this category will not delete the associated apps, but they may lose their category layout grouping. Proceed?")) {
      try {
        await onDeleteCategory(id);
      } catch (err) {
        alert("Failed to delete category.");
      }
    }
  };

  // Helper file upload handler
  const triggerFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "icon" | "banner" | "screenshot" | "apk"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress((p) => ({ ...p, [type]: true }));
    try {
      const url = await uploadMediaFile(file, type === "apk" ? "apks" : "media");
      
      if (type === "icon") {
        setAppForm((f) => ({ ...f, iconUrl: url }));
      } else if (type === "banner") {
        setAppForm((f) => ({ ...f, bannerUrl: url }));
      } else if (type === "apk") {
        setAppForm((f) => ({ ...f, apkUrl: url, fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }));
      } else if (type === "screenshot") {
        setAppForm((f) => ({ 
          ...f, 
          screenshots: [...(f.screenshots || []), url] 
        }));
      }
    } catch (error) {
      alert("File upload failed. Default placeholders are used in code fallbacks.");
    } finally {
      setUploadProgress((p) => ({ ...p, [type]: false }));
    }
  };

  // Preset Auto-filler utility to make populating forms convenient
  const autoFillMockData = () => {
    const randomId = `app-${Math.floor(Math.random() * 1000)}`;
    setAppForm({
      id: randomId,
      name: "Cyber Sandbox Mobile",
      shortDescription: "Interactive 3D space builder and sandbox simulator.",
      fullDescription: "Dive into a vast sandbox world and build stunning spacecraft and orbital modules. Experience realistic physics rendering, custom resource collections, and multiplayer support. Perfect for arcade and casual strategy gamers alike!\n\nFeature list:\n- Beautiful 3D procedural textures\n- Direct physics interaction engines\n- Custom multiplayer servers compatibility",
      category: categories[0]?.id || "games",
      version: "1.2.0",
      fileSize: "32.5 MB",
      androidVersion: "9.0+",
      developerName: "Sandbox Labs Studio",
      developerEmail: "labs@sandbox.com",
      websiteUrl: "https://sandboxlabs.com",
      iconUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&h=150&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&h=400&q=80",
      screenshots: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&h=700&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=700&q=80"
      ],
      apkUrl: "#",
      downloads: 120,
      featured: true,
      changelog: "- Released initial early-access edition\n- Fully offline sandbox controls"
    });
  };

  return (
    <div id="admin-dashboard" className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[500px]">
      
      {/* Sidebar Navigation Tabs */}
      <div className="lg:col-span-1 flex flex-col gap-2 rounded-2xl border border-gray-150 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-900 mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Control Center
          </h2>
        </div>

        <button
          id="admin-tab-overview"
          onClick={() => { setEditingApp(null); setActiveTab("overview"); }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview Stats</span>
        </button>

        <button
          id="admin-tab-apps"
          onClick={() => { setEditingApp(null); setActiveTab("apps"); }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors ${
            activeTab === "apps"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          }`}
        >
          <ListFilter className="h-4 w-4" />
          <span>Manage Apps</span>
        </button>

        <button
          id="admin-tab-add-edit-app"
          onClick={() => { setEditingApp(null); setActiveTab("add-edit-app"); }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors ${
            activeTab === "add-edit-app"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>{editingApp ? "Edit App Form" : "Publish New App"}</span>
        </button>

        <button
          id="admin-tab-categories"
          onClick={() => { setEditingApp(null); setActiveTab("categories"); }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors ${
            activeTab === "categories"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Categories</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="lg:col-span-3">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-sans font-extrabold text-gray-900 dark:text-white">
              System Health Overview
            </h1>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs font-semibold text-gray-400">Total Apps</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalApps}</p>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs font-semibold text-gray-400">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalDownloads.toLocaleString()}</p>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs font-semibold text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCategories}</p>
              </div>

              <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs font-semibold text-gray-400">Featured Apps</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{featuredAppsCount}</p>
              </div>
            </div>

            {/* Popular apps stats list */}
            <div className="rounded-2xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-900 pb-3">
                Top Downloaded Android Apps
              </h3>
              
              <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-900">
                {[...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((app, idx) => (
                  <div key={app.id} className="flex items-center justify-between py-3.5 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                      <img src={app.iconUrl} alt={app.name} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{app.name}</p>
                        <p className="text-xs text-gray-400">{categories.find(c => c.id === app.category)?.name || app.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Download className="h-3.5 w-3.5 text-blue-500" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{app.downloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                ))}

                {apps.length === 0 && (
                  <p className="text-center py-6 text-xs text-gray-400">No applications registered in the storefront catalog.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE APPS LIST */}
        {activeTab === "apps" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-sans font-extrabold text-gray-900 dark:text-white">
                  Applications Directory
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Edit, update, and manage published Android APK files</p>
              </div>

              <button
                id="admin-apps-add-btn"
                onClick={() => setActiveTab("add-edit-app")}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Publish App</span>
              </button>
            </div>

            {/* Apps table grid */}
            <div className="overflow-hidden rounded-2xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-350">
                  <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4">App Info</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Version</th>
                      <th className="px-6 py-4">Downloads</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                    {apps.map((app) => (
                      <tr id={`admin-row-${app.id}`} key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={app.iconUrl} alt={app.name} className="h-10 w-10 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{app.name}</p>
                            <p className="text-xs text-gray-400">ID: {app.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">
                          {categories.find(c => c.id === app.category)?.name || app.category}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold">
                          v{app.version}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {app.downloads.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              id={`admin-edit-btn-${app.id}`}
                              onClick={() => handleAppEditSelect(app)}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
                              title="Edit App Details"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              id={`admin-delete-btn-${app.id}`}
                              onClick={() => handleAppDeleteSelect(app.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Delete App Listing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {apps.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400">No applications registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APP EDIT/ADD FORM */}
        {activeTab === "add-edit-app" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h1 className="text-2xl font-sans font-extrabold text-gray-900 dark:text-white">
                  {editingApp ? `Edit ${editingApp.name}` : "Publish New Android Application"}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Please provide build, screenshots, metadata, and developer profile</p>
              </div>

              {!editingApp && (
                <button
                  id="admin-autofill-btn"
                  type="button"
                  onClick={autoFillMockData}
                  className="flex items-center gap-2 rounded-full border border-dashed border-blue-500 text-blue-500 hover:bg-blue-50/50 px-4 py-2 text-xs font-bold transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Autofill Mock Data</span>
                </button>
              )}
            </div>

            <form onSubmit={handleAppSubmit} className="space-y-6 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* App Unique ID (Slug) */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Unique ID (App ID Slug)*
                  </label>
                  <input
                    id="form-app-id"
                    type="text"
                    required
                    disabled={editingApp !== null}
                    placeholder="e.g. dynamic-task-builder"
                    value={appForm.id}
                    onChange={(e) => setAppForm({ ...appForm, id: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-400 font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Immutable slug format. Cannot be changed later. Use only letters, numbers, and hyphens.</p>
                </div>

                {/* App Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Application Title*
                  </label>
                  <input
                    id="form-app-name"
                    type="text"
                    required
                    placeholder="e.g. Cyber Task Pro"
                    value={appForm.name}
                    onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Categories Select List */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Category Grouping*
                  </label>
                  <select
                    id="form-app-category"
                    required
                    value={appForm.category}
                    onChange={(e) => setAppForm({ ...appForm, category: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Version Indicator */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Software Version*
                  </label>
                  <input
                    id="form-app-version"
                    type="text"
                    required
                    placeholder="e.g. 1.2.4"
                    value={appForm.version}
                    onChange={(e) => setAppForm({ ...appForm, version: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* Android Min Version */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Android compatibility minimum*
                  </label>
                  <input
                    id="form-app-android-version"
                    type="text"
                    required
                    placeholder="e.g. Android 9.0+"
                    value={appForm.androidVersion}
                    onChange={(e) => setAppForm({ ...appForm, androidVersion: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                {/* File size manually or auto on APK upload */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    APK File Size*
                  </label>
                  <input
                    id="form-app-file-size"
                    type="text"
                    required
                    placeholder="e.g. 24.1 MB"
                    value={appForm.fileSize}
                    onChange={(e) => setAppForm({ ...appForm, fileSize: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Short Catchy Tagline*
                  </label>
                  <input
                    id="form-app-short-desc"
                    type="text"
                    required
                    placeholder="Brief description about what the app does in 1 line..."
                    value={appForm.shortDescription}
                    onChange={(e) => setAppForm({ ...appForm, shortDescription: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Full Description*
                  </label>
                  <textarea
                    id="form-app-full-desc"
                    required
                    rows={6}
                    placeholder="Elaborate on features, design choices, system guides, instructions..."
                    value={appForm.fullDescription}
                    onChange={(e) => setAppForm({ ...appForm, fullDescription: e.target.value })}
                    className="w-full p-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-normal leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Changelog (What's New in this Version)
                  </label>
                  <textarea
                    id="form-app-changelog"
                    rows={3}
                    placeholder="- Added notifications fix\n- Visual slider optimizations"
                    value={appForm.changelog}
                    onChange={(e) => setAppForm({ ...appForm, changelog: e.target.value })}
                    className="w-full p-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Media Upload Subsections */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-150 dark:bg-gray-900/40 dark:border-gray-800 space-y-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-gray-400" />
                  Media Assets & Installation Package
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Upload App Icon */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                      Application Logo Icon (Image File)
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 overflow-hidden rounded-xl bg-white border border-gray-150 flex-shrink-0 dark:bg-gray-950 dark:border-gray-800">
                        {appForm.iconUrl ? (
                          <img src={appForm.iconUrl} alt="App Icon preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">No logo</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <label className="relative cursor-pointer flex items-center gap-2 justify-center rounded-xl border border-gray-200 bg-white dark:bg-gray-950 px-4 h-11 text-xs font-bold hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4 text-gray-400" />
                          <span>{uploadProgress["icon"] ? "Uploading..." : "Choose Logo Icon"}</span>
                          <input 
                            id="form-upload-icon"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={uploadProgress["icon"]}
                            onChange={(e) => triggerFileUpload(e, "icon")} 
                          />
                        </label>
                        <input
                          id="form-icon-url"
                          type="text"
                          placeholder="Or paste direct image URL"
                          value={appForm.iconUrl}
                          onChange={(e) => setAppForm({ ...appForm, iconUrl: e.target.value })}
                          className="w-full mt-2 h-9 px-3 text-xs border border-gray-200 dark:border-gray-850 rounded-lg outline-none bg-white dark:bg-gray-950 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload App Banner */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                      Promotional Landscape Banner (Image File)
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-24 overflow-hidden rounded-xl bg-white border border-gray-150 flex-shrink-0 dark:bg-gray-950 dark:border-gray-800">
                        {appForm.bannerUrl ? (
                          <img src={appForm.bannerUrl} alt="App Banner preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300">No banner</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <label className="relative cursor-pointer flex items-center gap-2 justify-center rounded-xl border border-gray-200 bg-white dark:bg-gray-950 px-4 h-11 text-xs font-bold hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4 text-gray-400" />
                          <span>{uploadProgress["banner"] ? "Uploading..." : "Choose Banner"}</span>
                          <input 
                            id="form-upload-banner"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={uploadProgress["banner"]}
                            onChange={(e) => triggerFileUpload(e, "banner")} 
                          />
                        </label>
                        <input
                          id="form-banner-url"
                          type="text"
                          placeholder="Or paste direct image URL"
                          value={appForm.bannerUrl}
                          onChange={(e) => setAppForm({ ...appForm, bannerUrl: e.target.value })}
                          className="w-full mt-2 h-9 px-3 text-xs border border-gray-200 dark:border-gray-850 rounded-lg outline-none bg-white dark:bg-gray-950 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Screenshots multi upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                      Screenshots Array (Multiple Image Uploads)
                    </label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {appForm.screenshots?.map((shot, idx) => (
                          <div key={idx} className="relative h-20 w-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                            <img src={shot} alt={`Screenshot preview ${idx}`} className="h-full w-full object-cover" />
                            <button
                              id={`delete-screenshot-${idx}`}
                              type="button"
                              onClick={() => {
                                setAppForm({
                                  ...appForm,
                                  screenshots: appForm.screenshots?.filter((_, sIdx) => sIdx !== idx)
                                });
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 text-white flex items-center justify-center transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        ))}

                        <label className="h-20 w-12 cursor-pointer flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/20 transition-all dark:border-gray-800">
                          <Plus className="h-5 w-5 text-gray-400" />
                          <span className="text-[9px] text-gray-400 mt-1 font-bold">Add</span>
                          <input
                            id="form-upload-screenshot"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => triggerFileUpload(e, "screenshot")}
                          />
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          id="form-screenshot-input-manual"
                          type="text"
                          placeholder="Paste a direct screenshot URL to append manually..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                setAppForm((f) => ({ ...f, screenshots: [...(f.screenshots || []), val] }));
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                          className="w-full h-10 px-3 border border-gray-200 dark:border-gray-850 rounded-xl outline-none bg-white dark:bg-gray-950 text-xs focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* APK File package installer upload */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                      Android Installation Package (.APK File)*
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white dark:bg-gray-950 px-6 h-11 text-xs font-bold hover:bg-gray-50 dark:border-gray-800 transition-colors">
                        <Upload className="h-4 w-4 text-gray-400" />
                        <span>{uploadProgress["apk"] ? "Uploading binary..." : "Upload APK File Binary"}</span>
                        <input
                          id="form-upload-apk"
                          type="file"
                          accept=".apk"
                          className="hidden"
                          disabled={uploadProgress["apk"]}
                          onChange={(e) => triggerFileUpload(e, "apk")}
                        />
                      </label>

                      <div className="flex-1">
                        <input
                          id="form-apk-url"
                          type="text"
                          required
                          placeholder="Direct download link or storage bucket path (e.g. # for sample download)"
                          value={appForm.apkUrl}
                          onChange={(e) => setAppForm({ ...appForm, apkUrl: e.target.value })}
                          className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">Upload a genuine `.apk` binary directly. The database automatically parses and saves the size.</p>
                  </div>
                </div>
              </div>

              {/* Developer Information details section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Developer Studio Name*
                  </label>
                  <input
                    id="form-dev-name"
                    type="text"
                    required
                    placeholder="e.g. PixelForge Studios"
                    value={appForm.developerName}
                    onChange={(e) => setAppForm({ ...appForm, developerName: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Developer Support Email*
                  </label>
                  <input
                    id="form-dev-email"
                    type="email"
                    required
                    placeholder="e.g. support@pixelforge.dev"
                    value={appForm.developerEmail}
                    onChange={(e) => setAppForm({ ...appForm, developerEmail: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                    Developer Website URL
                  </label>
                  <input
                    id="form-dev-website"
                    type="text"
                    placeholder="e.g. https://pixelforge.dev"
                    value={appForm.websiteUrl}
                    onChange={(e) => setAppForm({ ...appForm, websiteUrl: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Featured Checkbox Toggle */}
              <div className="flex items-center gap-3 rounded-2xl p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800">
                <input
                  id="form-app-featured"
                  type="checkbox"
                  checked={appForm.featured}
                  onChange={(e) => setAppForm({ ...appForm, featured: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="form-app-featured" className="font-bold text-gray-900 dark:text-white cursor-pointer select-none">
                    Feature this app on storefront slider
                  </label>
                  <p className="text-[10px] text-gray-400 mt-0.5">Featured apps rotate in the main Discovery carousel header block.</p>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  id="form-cancel-btn"
                  type="button"
                  onClick={() => { setEditingApp(null); setActiveTab("apps"); }}
                  className="rounded-full border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>

                <button
                  id="form-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      <span>Saving Catalog...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingApp ? "Save Changes" : "Publish Application"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-sans font-extrabold text-gray-900 dark:text-white">
              Categories Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">Define catalog classifications and assign visual icons</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Add category form widget */}
              <div className="rounded-2xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 h-fit space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-900 pb-3">
                  Create New Category
                </h3>

                <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase text-gray-400 mb-1.5">
                      Category slug ID (Unique ID)*
                    </label>
                    <input
                      id="form-cat-id"
                      type="text"
                      required
                      placeholder="e.g. social-apps"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-gray-400 mb-1.5">
                      Display Name*
                    </label>
                    <input
                      id="form-cat-name"
                      type="text"
                      required
                      placeholder="e.g. Social Media"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-gray-400 mb-1.5">
                      Lucide Icon Map Name
                    </label>
                    <select
                      id="form-cat-icon"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 dark:border-gray-850 bg-white dark:bg-gray-950 rounded-xl outline-none focus:border-blue-500 font-semibold text-gray-700 dark:text-gray-300"
                    >
                      <option value="Smartphone">Smartphone</option>
                      <option value="Gamepad">Gamepad (Games)</option>
                      <option value="Briefcase">Briefcase (Productivity)</option>
                      <option value="MessageSquare">MessageSquare (Comm)</option>
                      <option value="Wrench">Wrench (Tools)</option>
                      <option value="Share2">Share2 (Social)</option>
                      <option value="Play">Play (Entertainment)</option>
                    </select>
                  </div>

                  <button
                    id="form-cat-submit"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 h-10 font-bold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Category</span>
                  </button>
                </form>
              </div>

              {/* Categories list directory */}
              <div className="rounded-2xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-900 pb-3">
                  Configured Storefront Categories
                </h3>

                <div className="divide-y divide-gray-100 dark:divide-gray-900">
                  {categories.map((cat) => (
                    <div id={`admin-cat-row-${cat.id}`} key={cat.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {cat.id} | Icon: {cat.icon}</p>
                        </div>
                      </div>

                      <button
                        id={`admin-cat-delete-btn-${cat.id}`}
                        onClick={() => handleCategoryDelete(cat.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
