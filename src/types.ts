export interface AppItem {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  version: string;
  fileSize: string;
  androidVersion: string;
  developerName: string;
  developerEmail: string;
  websiteUrl?: string;
  iconUrl: string;
  bannerUrl: string;
  screenshots: string[];
  apkUrl: string;
  downloads: number;
  featured: boolean;
  changelog: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
}

export type SortOption = "newest" | "downloads" | "updated";
