import { EMERGENCY_KEYWORDS, URGENT_CATEGORIES } from './keywords.js';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole words only: "brand" matches "brand in de meterkast", not "brandweer".
const wholeWord = (keyword) => new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegExp(keyword)}($|[^\\p{L}\\p{N}_])`, 'u');
const EMERGENCY_PATTERNS = EMERGENCY_KEYWORDS.map(wholeWord);

const normalise = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Classify a tenant repair request.
 *
 * @param {object} request
 * @param {string} request.description  Free text written by the tenant.
 * @param {string} [request.category]   Category picked in the tenant portal.
 * @param {boolean} [request.vulnerableTenant]  Tenant needs extra care (e.g. elderly, medical).
 * @returns {'emergency' | 'urgent' | 'normal'}
 */
export function classifyRepairRequest({ description, category, vulnerableTenant = false } = {}) {
  if (typeof description !== 'string' || description.trim() === '') {
    throw new TypeError('description is required');
  }

  const text = normalise(description);
  if (EMERGENCY_PATTERNS.some((pattern) => pattern.test(text))) {
    return 'emergency';
  }

  if (URGENT_CATEGORIES.includes(category) || vulnerableTenant) {
    return 'urgent';
  }

  return 'normal';
}
