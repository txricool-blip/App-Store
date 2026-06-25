import React from "react";
import { 
  Download, 
  Eye, 
  Smartphone, 
  Calendar, 
  TrendingUp, 
  ArrowRight
} from "lucide-react";
import { AppItem, Category } from "../types";

interface AppCardProps {
  key?: string;
  app: AppItem;
  categories: Category[];
  onViewDetails: (id: string) => void;
  onDownload: (app: AppItem, e: React.MouseEvent) => void;
}

export default function AppCard({
  app,
  categories,
  onViewDetails,
  onDownload
}: AppCardProps) {
  const categoryObj = categories.find((c) => c.id === app.category);
  const formattedDate = new Date(app.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div 
      id={`app-card-${app.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/40 hover:-translate-y-1 transition-all duration-300"
    >
      <div>
        {/* Banner Indicator/Card Head */}
        <div className="relative mb-4 h-32 w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-950">
          <img
            src={app.bannerUrl}
            alt={`${app.name} banner`}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {app.featured && (
            <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-blue-600/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur shadow-sm">
              <TrendingUp className="h-3 w-3" />
              Featured
            </span>
          )}
          <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
            {app.fileSize}
          </span>
        </div>

        {/* Info Row: Icon & Name */}
        <div className="flex gap-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <img
              src={app.iconUrl}
              alt={`${app.name} icon`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              By {app.developerName}
            </p>
            <span className="inline-flex items-center mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {categoryObj ? categoryObj.name : app.category}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {app.shortDescription}
        </p>

        {/* Metadata Details Grid */}
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-y-2 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Smartphone className="h-3 w-3 text-gray-400" />
            <span>Android {app.androidVersion}</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>Updated {formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-700 dark:text-gray-300">v{app.version}</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span className="font-medium text-blue-600 dark:text-blue-400">{app.downloads.toLocaleString()} downloads</span>
          </div>
        </div>
      </div>

      {/* Buttons bar */}
      <div className="mt-5 flex gap-2">
        <button
          id={`view-details-btn-${app.id}`}
          onClick={() => onViewDetails(app.id)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Details</span>
        </button>
        
        <button
          id={`download-btn-${app.id}`}
          onClick={(e) => onDownload(app, e)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
