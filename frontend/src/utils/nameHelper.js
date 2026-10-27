/**
 * Shared Name Helper for SMIS
 * Consistently generates middle initials, sanitizes middle names,
 * and formats customer display names across customer & admin portals.
 */

/**
 * Auto-generate middle initial from middle name:
 * - Take the first letter, uppercase it, and add a period (e.g. "Santos" -> "S.").
 * - Trim spaces and ignore leading special characters.
 * - If the middle name is empty, return empty string (no stray "." or double spaces).
 */
export const getMiddleInitial = (middleName) => {
  if (!middleName) return '';
  const trimmed = String(middleName).trim();
  const match = trimmed.match(/[a-zA-Z]/);
  if (!match) return '';
  return `${match[0].toUpperCase()}.`;
};

/**
 * Validation & formatting for middle name input:
 * - Allows letters, spaces, hyphens, and periods only
 * - Max 50 characters
 * - Capitalizes the first letter of each name part automatically
 */
export const formatMiddleNameInput = (value) => {
  if (!value) return '';
  // Allow letters, spaces, hyphens, and periods only, max 50 characters
  const sanitized = String(value).replace(/[^a-zA-Z\s\-\.]/g, '').slice(0, 50);

  // Capitalize first letter of each word part while preserving spaces/hyphens
  return sanitized.replace(/\b([a-z])/g, (char) => char.toUpperCase());
};

/**
 * Display customer name in the consistent format: "First M. Last" (e.g. "Kevin E. Esto")
 * Used in:
 * - Top-right profile badge (customer and admin portals)
 * - Pending Accounts / User Accounts list in the admin portal
 * - Order History, receipts, and order details
 * - Cart & Pre-Order page
 */
export const getDisplayName = (userOrName, maybeLastName, maybeMiddleInitial) => {
  if (!userOrName) return '';

  // Case 1: An object was passed (user, customer, pending item, order, sale)
  if (typeof userOrName === 'object') {
    const obj = userOrName;
    const first = (obj.first_name || '').trim();
    const last = (obj.last_name || '').trim();

    let mi = (obj.middle_initial || '').trim();
    if (!mi && obj.middle_name) {
      mi = getMiddleInitial(obj.middle_name);
    } else if (mi) {
      const match = mi.match(/[a-zA-Z]/);
      mi = match ? `${match[0].toUpperCase()}.` : '';
    }

    if (first && last) {
      return mi ? `${first} ${mi} ${last}` : `${first} ${last}`;
    }
    if (first) {
      return mi ? `${first} ${mi}` : first;
    }
    if (last) {
      return last;
    }

    // Fallbacks if object has customer_name, full_name, name, or username
    return (obj.customer_name || obj.full_name || obj.display_name || obj.name || obj.username || '').trim();
  }

  // Case 2: Primitive arguments passed (first_name, last_name, middle_name/initial)
  const first = String(userOrName || '').trim();
  const last = String(maybeLastName || '').trim();
  let mi = String(maybeMiddleInitial || '').trim();
  if (mi && !mi.endsWith('.')) {
    mi = getMiddleInitial(mi);
  }

  if (first && last) {
    return mi ? `${first} ${mi} ${last}` : `${first} ${last}`;
  }
  return first || last || '';
};

/**
 * Standard auto-generated system email (first.last@smis.local).
 * Never includes middle name/initial.
 */
export const generateSystemEmail = (firstName, lastName) => {
  const cleanFirst = String(firstName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = String(lastName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanFirst && !cleanLast) return '';
  if (cleanFirst && cleanLast) {
    return `${cleanFirst}.${cleanLast}@smis.local`;
  }
  return `${cleanFirst || cleanLast}@smis.local`;
};
