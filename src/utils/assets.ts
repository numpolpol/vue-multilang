/**
 * Helper functions for asset paths
 */

/**
 * Get the correct URL for an asset based on environment
 * Ensures assets work correctly in both development and GitHub Pages environments
 * 
 * @param path The relative path to the asset
 * @returns The correct URL for the asset
 */
export function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${base}${cleanPath}`;
}
