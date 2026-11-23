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

  // Tenants who need extra care get a fast response.
  if (vulnerableTenant) {
    return 'urgent';
  }

  if (EMERGENCY_KEYWORDS.some((keyword) => description.includes(keyword))) {
    return 'emergency';
  }

  if (URGENT_CATEGORIES.includes(category)) {
    return 'urgent';
  }

  return 'normal';
}
