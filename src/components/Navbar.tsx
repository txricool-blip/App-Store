import React, { useState } from "react";
import { 
  Search, 
  Smartphone, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Sun, 
  Moon,
  Laptop
} from "lucide-react";
import { User } from "firebase/auth";
import { isUserAdmin } from "../lib/firebase";

interface NavbarProps {
  user: User | null;
  isAdminMode: boolean;
  setAdminMode: (mode: boolean) => void;
  onLogin: () => void;
  onLogout: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  setCurrentPage: (page: "home" | "apps" | "admin" | "details") => void;
  setSelectedAppId: (id: string | null) => void;
}

export default function Navbar({
  user,
  isAdminMode,
  setAdminMode,
  onLogin,
  onLogout,
  searchTerm,
  setSearchTerm,
  theme,
  toggleTheme,
  setCurrentPage,
  setSelectedAppId
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isAdmin = isUserAdmin(user);

  const handleHomeClick = () => {
    setSearchTerm("");
    setSelectedAppId(null);
    setAdminMode(false);
    setCurrentPage("home");
  };

  const handleAppsClick = () => {
    setSearchTerm("");
    setSelectedAppId(null);
    setAdminMode(false);
    setCurrentPage("apps");
  };

  const handleAdminPanelToggle = () => {
    setShowUserDropdown(false);
    setSelectedAppId(null);
    setAdminMode(true);
    setCurrentPage("admin");
  };

  return (
    <header id="app-navbar" className="sticky top-0 z-50 w-full border-b bg-white/95 text-gray-900 dark:bg-gray-950/95 dark:text-gray-100 dark:border-gray-800 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo & Brand */}
        <div className="flex items-center gap-6">
          <button 
            id="brand-logo"
            onClick={handleHomeClick}
            className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-[#00A173] to-[#01875f] rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12l-10.183 10.186a2.285 2.285 0 01-.58-.87L3 11.97V2.735a2.247 2.247 0 01.609-.921zM15.426 10.51l3.528 2.01c.741.423.741 1.115 0 1.538l-3.528 2.011-2.14-2.138 2.14-2.121zM14.654 9.742l-1.802 1.783-9.563-9.564a2.128 2.128 0 011.834-.236l9.531 5.433zm-1.802 4.475l1.802 1.783-9.531 5.433c-.636.363-1.341.442-1.834.236l9.563-9.452z"/></svg>
            </div>
            <span className="font-sans font-medium tracking-tight text-gray-900 dark:text-white">
              App<span className="text-[#01875f] font-bold">Direct</span>
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-home"
              onClick={handleHomeClick}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                !isAdminMode ? "text-[#01875f] bg-[#e8f0fe] dark:bg-emerald-950/40 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Discover
            </button>
            <button
              id="nav-apps"
              onClick={handleAppsClick}
              className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isAdminMode ? "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Apps
            </button>
          </nav>
        </div>

        {/* Middle Section: Live Search Bar */}
        <div className="flex-1 max-w-md mx-6 hidden sm:block">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              id="search-input"
              type="text"
              placeholder="Search apps & games"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#f1f3f4] dark:bg-gray-900 border-none rounded-full focus:bg-white dark:focus:bg-black focus:ring-1 focus:ring-[#01875f] outline-none transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right Section: Theme Toggle, Profile, Admin Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Icon Toggle or display */}
          <button
            id="theme-toggler"
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* User Section / Admin Panel */}
          {user ? (
            <div className="relative">
              <button
                id="user-menu-button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    {user.displayName?.charAt(0) || "U"}
                  </div>
                )}
                {isAdmin && (
                  <ShieldCheck className="h-4 w-4 text-emerald-500 mr-1" />
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950 text-sm animate-in fade-in slide-in-from-top-5 duration-150">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-900 mb-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {user.displayName || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      id="dropdown-admin-panel"
                      onClick={handleAdminPanelToggle}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <button
                    id="dropdown-logout"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                      handleHomeClick();
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="google-login-button"
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-[#01875f] hover:bg-[#00704e] text-white shadow-md shadow-[#01875f]/10 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Admin Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search apps & games"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-[#f1f3f4] dark:bg-gray-900 border-none focus:bg-white dark:focus:bg-black focus:ring-1 focus:ring-[#01875f] rounded-full outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>
    </header>
  );
}
