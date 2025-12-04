import { useLocation as useWouterLocation } from "wouter";

// Base path configuration - must match vite.config.ts base option
export const BASE_PATH = "/hall-of-echoes";

/**
 * Strips the base path from a full pathname
 * @param pathname - Full pathname from window.location.pathname
 * @returns Path without base path (e.g., "/hall-of-echoes/" -> "/")
 */
export function stripBasePath(pathname: string): string {
  if (pathname.startsWith(BASE_PATH)) {
    const pathWithoutBase = pathname.slice(BASE_PATH.length);
    return pathWithoutBase || "/";
  }
  return pathname;
}

/**
 * Adds the base path to a route path
 * @param path - Route path (e.g., "/registration")
 * @returns Full path with base path (e.g., "/hall-of-echoes/registration")
 */
export function addBasePath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}

/**
 * Custom useLocation hook that handles base path automatically
 * Use this instead of wouter's useLocation in components
 */
export function useLocation() {
  const [location, setLocation] = useWouterLocation();
  
  // Location is already stripped by the Router hook, but we ensure it's correct
  const pathWithoutBase = stripBasePath(location);
  
  // Wrapped setLocation that adds base path
  const wrappedSetLocation = (path: string) => {
    setLocation(addBasePath(path));
  };
  
  return [pathWithoutBase, wrappedSetLocation] as const;
}

