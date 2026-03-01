import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize image URL by adding domain prefix to relative paths
 * @param url - The image URL (can be relative or absolute)
 * @returns Normalized full URL
 */
export function normalizeImageUrl(url: string | undefined): string {
  if (!url) return '/placeholder.svg';
  
  // If URL already starts with http or https, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL starts with /uploads, add domain prefix
  if (url.startsWith('/uploads')) {
    return `https://www.extrachic.cloud/api${url}`;
  }
  
  // Otherwise return as is (for local paths like /placeholder.svg)
  return url;
}
