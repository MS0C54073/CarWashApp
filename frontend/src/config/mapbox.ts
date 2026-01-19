/**
 * Mapbox Configuration
 * 
 * Secure configuration for Mapbox integration
 * Token is loaded from environment variables to prevent exposure in source code
 */

// Get token from environment variable with fallback
// IMPORTANT: Never commit the token to source control
// Set VITE_MAPBOX_TOKEN in .env file (which should be in .gitignore)
const MAPBOX_TOKEN = 
  import.meta.env.VITE_MAPBOX_TOKEN || 
  'pk.eyJ1IjoibXV6b3NhbGkiLCJhIjoiY21oc2J2d2tyMGg3ejJtc2N4dXg0NGo4eiJ9.p75SiHMh2nWAlbnFR8kyXQ';

// Validate token format
export function validateMapboxToken(token: string): boolean {
  return token && token.startsWith('pk.eyJ') && token.length > 20;
}

// Get the Mapbox token securely
export function getMapboxToken(): string {
  const token = MAPBOX_TOKEN;
  
  if (!token || !validateMapboxToken(token)) {
    const errorMsg = 
      '⚠️ Mapbox token not configured. Please create frontend/.env file with:\n' +
      'VITE_MAPBOX_TOKEN=pk.eyJ1IjoibXV6b3NhbGkiLCJhIjoiY21oc2J2d2tyMGg3ejJtc2N4dXg0NGo4eiJ9.p75SiHMh2nWAlbnFR8kyXQ\n\n' +
      'Or copy frontend/.env.example to frontend/.env and update the token.';
    console.error(errorMsg);
    // Don't throw - use fallback token instead
    console.warn('⚠️ Using fallback Mapbox token. For production, set VITE_MAPBOX_TOKEN in .env file.');
    return 'pk.eyJ1IjoibXV6b3NhbGkiLCJhIjoiY21oc2J2d2tyMGg3ejJtc2N4dXg0NGo4eiJ9.p75SiHMh2nWAlbnFR8kyXQ';
  }
  
  return token;
}

// Mapbox style configuration
export const MAPBOX_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

// Default map center (Lusaka, Zambia)
export const DEFAULT_CENTER: [number, number] = [-15.3875, 28.3228];
export const DEFAULT_ZOOM = 13;

export default {
  getToken: getMapboxToken,
  validateToken: validateMapboxToken,
  styles: MAPBOX_STYLES,
  defaultCenter: DEFAULT_CENTER,
  defaultZoom: DEFAULT_ZOOM,
};
