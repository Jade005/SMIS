/**
 * Utility functions for resolving API and media asset URLs.
 * Ensures the app works smoothly in both local development and production hosting (e.g. Hostinger).
 */

/**
 * Returns the base server origin (protocol + host + port), without trailing /api.
 * Reads from VITE_API_BASE_URL (e.g., https://api.yourdomain.com/api -> https://api.yourdomain.com).
 * Defaults to http://localhost:5000 in local dev if not configured.
 */
export const getServerOrigin = () => {
  const apiBase = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api').trim();
  return apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

/**
 * Resolves an uploaded file or relative image path to an absolute URL.
 * Handles full URLs (http/https), data URLs, and relative paths (/uploads/...).
 *
 * @param {string} path - The relative or absolute path of the asset
 * @returns {string|null} - The complete URL or null if empty
 */
export const resolveServerUrl = (path) => {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getServerOrigin()}${cleanPath}`;
};

/**
 * Resolves an avatar URL from a user object or a raw path string.
 *
 * @param {Object|string} userOrPath - User object with profile_picture/profile_image or raw path
 * @returns {string|null} - Absolute image URL
 */
export const resolveAvatarUrl = (userOrPath) => {
  if (!userOrPath) return null;
  const path = typeof userOrPath === 'string'
    ? userOrPath
    : (userOrPath.profile_picture || userOrPath.profile_image);
  return resolveServerUrl(path);
};
