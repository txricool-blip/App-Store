import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, Eye, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppItem, Category } from "../types";

interface FeaturedCarouselProps {
  featuredApps: AppItem[];
  categories: Category[];
  onViewDetails: (id: string) => void;
  onDownload: (app: AppItem, e: React.MouseEvent) => void;
}

export default function FeaturedCarousel({
  featuredApps,
  categories,
  onViewDetails,
  onDownload
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto scroll effect
  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredApps]);

  if (!featuredApps || featuredApps.length === 0) return null;

  const currentApp = featuredApps[currentIndex];
  const categoryObj = categories.find((c) => c.id === currentApp.category);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  };

  return (
    <div id="featured-carousel" className="relative w-full overflow-hidden rounded-3xl bg-gray-900 text-white shadow-xl">
      
      {/* Background Banner with Dark Overlay */}
      <div className="relative h-[340px] md:h-[400px] w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentApp.id}
            src={currentApp.bannerUrl}
            alt={currentApp.name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover select-none"
          />
        </AnimatePresence>
        
        {/* Ambient radial vignette for dramatic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/20 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-4xl z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentApp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Category Badge & Download Count */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-600/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Featured {categoryObj?.name || currentApp.category}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200 backdrop-blur">
                  {currentApp.downloads.toLocaleString()} downloads
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/25 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Verified APK
                </span>
              </div>

              {/* Title and Specs Row */}
              <div className="flex gap-4 md:gap-6 items-start">
                {/* App Icon */}
                <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-gray-900 shadow-md">
                  <img
                    src={currentApp.iconUrl}
                    alt={currentApp.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Name, dev and description */}
                <div className="min-w-0">
                  <h2 className="text-2xl md:text-4xl font-sans font-bold tracking-tight truncate">
                    {currentApp.name}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-300 mt-1 font-medium">
                    By {currentApp.developerName} • v{currentApp.version}
                  </p>
                  <p className="hidden md:block text-sm text-gray-300 max-w-2xl mt-3 line-clamp-2 leading-relaxed">
                    {currentApp.shortDescription}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  id={`carousel-details-btn-${currentApp.id}`}
                  onClick={() => onViewDetails(currentApp.id)}
                  className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur px-6 py-2.5 text-sm font-medium text-white transition-all duration-250 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>

                <button
                  id={`carousel-download-btn-${currentApp.id}`}
                  onClick={(e) => onDownload(currentApp, e)}
                  className="flex items-center gap-2 rounded-lg bg-[#01875f] hover:bg-[#00704e] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#01875f]/20 transition-all duration-250 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Free Download</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Slide Navigation Controls */}
        {featuredApps.length > 1 && (
          <>
            <button
              id="carousel-prev"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 hover:scale-105 active:scale-95 transition-all"
              title="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              id="carousel-next"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 hover:scale-105 active:scale-95 transition-all"
              title="Next Slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Manual Slide Dots */}
      {featuredApps.length > 1 && (
        <div className="absolute bottom-4 right-6 md:right-10 flex gap-2 z-20">
          {featuredApps.map((_, index) => (
            <button
              id={`carousel-dot-${index}`}
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8 bg-blue-500" : "w-2.5 bg-white/40 hover:bg-white/60"
              }`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
