/**
 * MCPO API Configuration
 * Handles base URL configuration for MCPO proxy endpoints
 */

/**
 * Get the MCPO base URL from environment variables
 * Falls back to container default if not set
 */
export function getMcpoBaseUrl(): string {
  return process.env.MCPO_BASE_URL || 'http://unloggarr-mcpo:8000/unraid-mcp';
}

/**
 * Build full MCPO endpoint URL
 */
export function getMcpoEndpoint(endpoint: string): string {
  const baseUrl = getMcpoBaseUrl();
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Common headers for MCPO API requests
 */
export const MCPO_HEADERS = {
  'Content-Type': 'application/json',
  'accept': 'application/json'
} as const; 