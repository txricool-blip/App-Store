import React, { useState } from "react";
import * as Lucide from "lucide-react";
import { AppItem, Category, SortOption } from "../types";
import AppCard from "./AppCard";

// Safe static mapping for Lucide icons
export function renderCategoryIcon(iconName: string, className: string = "h-5 w-5") {
  const name = iconName.toLowerCase();
  switch (name) {
    case "gamepad":
    case "games":
      return <Lucide.Gamepad className={className} />;
    case "briefcase":
    case "productivity":
      return <Lucide.Briefcase className={className} />;
    case "messagesquare":
    case "communication":
      return <Lucide.MessageSquare className={className} />;
    case "wrench":
    case "tools":
    case "tools & utilities":
      return <Lucide.Wrench className={className} />;
    case "share2":
    case "social":
    case "social media":
      return <Lucide.Share2 className={className} />;
    case "play":
    case "entertainment":
      return <Lucide.Play className={className} />;
    default:
      return <Lucide.Smartphone className={className} />;
  }
}

interface BrowseViewProps {
  apps: AppItem[];
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onViewDetails: (id: string) => void;
  onDownload: (app: AppItem, e: React.MouseEvent) => void;
}

export default function BrowseView({
  apps,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  onViewDetails,
  onDownload
}: BrowseViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Filtering Logic
  const filteredApps = apps.filter((app) => {
    const matchesCategory = selectedCategory ? app.category === selectedCategory : true;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.developerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === "downloads") {
      return b.downloads - a.downloads;
    } else if (sortBy === "updated") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else {
      // Default: "newest"
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm("");
  };

  return (
    <div id="browse-view" className="space-y-8">
      {/* Category Horizontal Filter Row */}
      <div className="space-y-3">
        <h2 className="text-xl font-sans font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lucide.LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Browse by Category
        </h2>
        
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
          <button
            id="category-pill-all"
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === null
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                : "bg-gray-100 hover:bg-gray-200/70 text-gray-700 border-transparent dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <Lucide.AppWindow className="h-4 w-4" />
            <span>All Applications</span>
          </button>

          {categories.map((cat) => (
            <button
              id={`category-pill-${cat.id}`}
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                  : "bg-gray-100 hover:bg-gray-200/70 text-gray-700 border-transparent dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {renderCategoryIcon(cat.icon, "h-4 w-4")}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Directory Section Header & Sorting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-sans font-bold text-gray-900 dark:text-white">
            {selectedCategory ? `${categories.find((c) => c.id === selectedCategory)?.name} Apps` : "All Applications"}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Found {sortedApps.length} {sortedApps.length === 1 ? "application" : "applications"}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Lucide.SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Sort By:</span>
          
          <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
            <button
              id="sort-btn-newest"
              onClick={() => setSortBy("newest")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                sortBy === "newest"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Newest
            </button>
            <button
              id="sort-btn-downloads"
              onClick={() => setSortBy("downloads")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                sortBy === "downloads"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Popular
            </button>
            <button
              id="sort-btn-updated"
              onClick={() => setSortBy("updated")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                sortBy === "updated"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Updated
            </button>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {sortedApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              categories={categories}
              onViewDetails={onViewDetails}
              onDownload={onDownload}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Lucide.AppWindow className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
            No Applications Found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            We couldn't find any apps matching your current search parameters or category selection.
          </p>
          <button
            id="clear-filters-btn"
            onClick={clearFilters}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-colors"
          >
            <Lucide.RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
