import React, { useState } from "react";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  Check, 
  Layers, 
  Laptop, 
  Mail, 
  Globe, 
  Cpu, 
  Smartphone, 
  FileText 
} from "lucide-react";
import { AppItem, Category } from "../types";

interface AppDetailsViewProps {
  app: AppItem;
  categories: Category[];
  onBack: () => void;
  onDownload: (app: AppItem, e: React.MouseEvent) => void;
}

export default function AppDetailsView({
  app,
  categories,
  onBack,
  onDownload
}: AppDetailsViewProps) {
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const categoryObj = categories.find((c) => c.id === app.category);

  const formattedDate = new Date(app.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/?app=${app.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch((err) => {
      console.error("Clipboard copy failed:", err);
    });
  };

  return (
    <div id="app-details-view" className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Back Button Navigation */}
      <button
        id="details-back-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Applications</span>
      </button>

      {/* Hero Banner Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-3xl bg-gray-950 shadow-md">
        <img
          src={app.bannerUrl}
          alt={`${app.name} banner`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
      </div>

      {/* Main App Specs Profile Row */}
      <div className="relative -mt-16 sm:-mt-20 px-6 sm:px-10 flex flex-col sm:flex-row gap-6 items-start sm:items-end z-10">
        {/* App Icon */}
        <div className="h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg dark:border-gray-950 dark:bg-gray-900">
          <img
            src={app.iconUrl}
            alt={`${app.name} icon`}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Primary Metadata */}
        <div className="flex-1 min-w-0 pb-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
              {categoryObj ? categoryObj.name : app.category}
            </span>
            {app.featured && (
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Featured
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified APK
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-gray-950 dark:text-white">
            {app.name}
          </h1>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {app.developerName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {app.downloads.toLocaleString()} downloads • {app.fileSize}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto pb-2">
          <button
            id="details-share-btn"
            onClick={handleShareClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 active:scale-95 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-emerald-500 animate-bounce" />
                <span className="text-emerald-500">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Share App</span>
              </>
            )}
          </button>

          <button
            id="details-download-btn"
            onClick={(e) => onDownload(app, e)}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download APK</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        
        {/* Left 2 Columns: Description & Screenshots */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Screenshots Gallery Section */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-gray-400" />
                Screenshots & Media
              </h3>
              
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-none">
                {app.screenshots.map((shot, idx) => (
                  <div
                    id={`screenshot-thumb-${idx}`}
                    key={idx}
                    onClick={() => setActiveScreenshot(shot)}
                    className="flex-shrink-0 w-44 h-80 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-900 snap-start cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                  >
                    <img
                      src={shot}
                      alt={`${app.name} screenshot ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full App Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <FileText className="h-5 w-5 text-gray-400" />
              About This App
            </h3>
            
            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 space-y-4 whitespace-pre-line font-normal">
              {app.fullDescription}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <Cpu className="h-5 w-5 text-gray-400" />
              System Requirements
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 text-sm">
                <Smartphone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">OS Version</p>
                  <p className="text-xs text-gray-500 mt-0.5">{app.androidVersion}</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 text-sm">
                <Layers className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Package Size</p>
                  <p className="text-xs text-gray-500 mt-0.5">{app.fileSize}</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 text-sm">
                <Cpu className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Current Build</p>
                  <p className="text-xs text-gray-500 mt-0.5">Version {app.version}</p>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 text-sm">
                <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Last Released</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Changelog & Developer Info */}
        <div className="space-y-6">
          
          {/* Recent Changelog Box */}
          {app.changelog && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-900/30">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                What's New in v{app.version}
              </h4>
              <p className="text-xs text-gray-400 mb-4">Released {formattedDate}</p>
              
              <div className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line font-mono font-medium p-4 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl">
                {app.changelog}
              </div>
            </div>
          )}

          {/* Developer Information Card */}
          <div className="rounded-2xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950/60 space-y-4">
            <h4 className="text-sm font-sans font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-900">
              Developer Information
            </h4>
            
            <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-850 dark:text-gray-200">{app.developerName}</p>
                  <p className="text-[10px] text-gray-400">Publisher</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a 
                  href={`mailto:${app.developerEmail}`}
                  className="hover:underline text-blue-600 dark:text-blue-400 font-medium truncate"
                >
                  {app.developerEmail}
                </a>
              </div>

              {app.websiteUrl && app.websiteUrl !== "#" && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a 
                    href={app.websiteUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:underline text-blue-600 dark:text-blue-400 font-medium truncate"
                  >
                    {app.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Screenshot Modal */}
      {activeScreenshot && (
        <div 
          id="screenshot-lightbox"
          onClick={() => setActiveScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={activeScreenshot}
              alt="Expanded Screenshot View"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <p className="text-center text-xs text-gray-400 mt-4 font-semibold">
              Click anywhere to close full screen view
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
