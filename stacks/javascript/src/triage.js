import { EMERGENCY_KEYWORDS, URGENT_CATEGORIES } from './keywords.js';

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

  if (EMERGENCY_KEYWORDS.some((keyword) => description.includes(keyword))) {
    return 'emergency';
  }

  if (URGENT_CATEGORIES.includes(category) || vulnerableTenant) {
    return 'urgent';
  }

  return 'normal';
}
