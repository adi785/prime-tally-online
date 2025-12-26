import { createClient } from '@nhost/nhost-js';

// Replace with your actual Nhost project details
const NHOST_SUBDOMAIN = 'your-project-subdomain';
const NHOST_REGION = 'us-east-1'; // or your region

export const nhost = createClient({
  subdomain: NHOST_SUBDOMAIN,
  region: NHOST_REGION,
  autoLogin: true,
});

// Export individual services for convenience
export const auth = nhost.auth;
export const storage = nhost.storage;
export const graphql = nhost.graphql;
export const backendUrl = nhost.backendUrl;

// Type exports for TypeScript
export type { NhostClient } from '@nhost/nhost-js';