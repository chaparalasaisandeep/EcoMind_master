/**
 * EcoMind AI Ultra — Application Constants
 * Centralized configuration for maintainability and security.
 */

// Carbon budget defaults (kg CO2e per month)
export const DEFAULT_MONTHLY_BUDGET_KG = 500;
export const DEFAULT_WARNING_THRESHOLD = 0.8;

// XP & Leveling
export const XP_PER_KG_SAVED = 10;
export const BASE_XP_FOR_LEVEL = 100;

// Eco Classes
export const ECO_CLASSES = [
  { minLevel: 1, name: 'Seedling', icon: '🌱' },
  { minLevel: 10, name: 'Sprout', icon: '🌿' },
  { minLevel: 20, name: 'Sapling', icon: '🌳' },
  { minLevel: 30, name: 'Tree', icon: '🌲' },
  { minLevel: 40, name: 'Forest Guardian', icon: '🛡️' },
  { minLevel: 50, name: 'Earth Protector', icon: '👑' },
] as const;

// Category colors (consistent across UI)
export const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6',
  energy: '#f59e0b',
  food: '#22c55e',
  shopping: '#a855f7',
  travel: '#ef4444',
};

// Heatmap intensity thresholds (kg CO2e)
export const HEATMAP_THRESHOLDS = {
  low: 5,
  medium: 15,
  high: Infinity,
};

// Simulator defaults
export const SIMULATOR_DEFAULTS = {
  driveLess: 0,
  veganMeals: 0,
  reduceShopping: 0,
  renewableEnergy: 0,
  publicTransit: 0,
};

// App metadata
export const APP_NAME = 'EcoMind AI Ultra';
export const APP_TAGLINE = 'Your AI-Powered Sustainability Operating System';
export const APP_VERSION = '1.0.0';

// API endpoints (relative to Supabase functions)
export const API_ENDPOINTS = {
  AI_COACH: '/functions/v1/ai-coach',
  FORECAST: '/functions/v1/forecast',
  DIGITAL_TWIN: '/functions/v1/digital-twin',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_STATE: 'ecomind_auth_state',
  THEME: 'ecomind_theme',
  ONBOARDING_COMPLETE: 'ecomind_onboarding',
} as const;
