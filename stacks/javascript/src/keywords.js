// Keywords that make a repair request an emergency (respond within 4 hours).
// Tenants write in Dutch or English.
export const EMERGENCY_KEYWORDS = [
  'gas smell',
  'gas leak',
  'fire',
  'flooding',
  'no heating',
];

// Categories that are urgent (respond within 24 hours) when there is no emergency.
export const URGENT_CATEGORIES = ['heating', 'electricity', 'lock'];
