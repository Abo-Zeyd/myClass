import type { CapacitorConfig } from '@capacitor/cli';

const configuredSiteUrl = process.env.ANDROID_SITE_URL;

if (!configuredSiteUrl) {
  throw new Error(
    'Set ANDROID_SITE_URL to the deployed website URL before syncing the Android app.'
  );
}

const siteUrl = new URL(configuredSiteUrl);

if (siteUrl.protocol !== 'https:') {
  throw new Error('ANDROID_SITE_URL must use HTTPS.');
}

if (siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
  throw new Error('ANDROID_SITE_URL must not contain credentials, a query string, or a fragment.');
}

siteUrl.pathname = siteUrl.pathname.replace(/\/+$/, '') || '/';

const config: CapacitorConfig = {
  appId: 'dz.qismi.app',
  appName: 'قسمي',
  webDir: 'public',
  server: {
    url: siteUrl.toString(),
    allowNavigation: [siteUrl.origin],
    cleartext: false,
  },
};

export default config;
