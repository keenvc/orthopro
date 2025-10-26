/**
 * GoHighLevel Client Configuration
 * Central configuration and client initialization for GHL SDK
 */

import HighLevel from '@gohighlevel/api-client';

// Singleton GHL client instance
let ghlClient: HighLevel | null = null;

/**
 * Get or create GHL client instance
 * Uses Private Integration Token (PIT) for authentication
 */
export function getGHLClient(): HighLevel {
  if (!ghlClient) {
    const token = process.env.GHL_API_TOKEN;
    
    if (!token) {
      throw new Error('GHL_API_TOKEN environment variable is not configured');
    }

    ghlClient = new HighLevel({
      privateIntegrationToken: token
    });
  }

  return ghlClient;
}

/**
 * GHL Configuration constants
 */
export const GHL_CONFIG = {
  locationId: process.env.GHL_LOCATION_ID || 'GOQ8q3ZfbnrudWOHRNNL',
  companyId: process.env.GHL_COMPANY_ID || 'AwtiFE1444eC4T7pFpiT',
  apiVersion: process.env.GHL_API_VERSION || '2021-07-28',
  apiBase: process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com'
};

/**
 * Get location ID by name
 * @param locationName - Name of the location (e.g., 'ADVANCEDCARE', 'CLINICRPM')
 * @returns Location ID
 */
export function getLocationId(locationName: string): string {
  const envKey = `GHL_LOCATION_${locationName.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  return process.env[envKey] || GHL_CONFIG.locationId;
}

/**
 * All available locations
 */
export const LOCATIONS = {
  ADVANCEDCARE: 'GOQ8q3ZfbnrudWOHRNNL',
  CLINICRPM: 'uA3KGD6K4Xv6uecSi2rW',
  FRONTDESK: 'HcdcH7u4X5M4VwfNxU00',
  KII: 'Z0oVZHCg24xDD8JZK7TX',
  TURBOVOB: 'ybQ9AuWyQqgNgwvno5sN',
  WAKEWELL: 'BHA71ePXQjMqrBiWS8fP'
} as const;
