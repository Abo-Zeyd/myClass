This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Database

The app reads and writes assignments, lessons, supporting activities, announcements, and homepage slides in Supabase. To connect a project:

1. For a new Supabase project, run `supabase/schema.sql` in the SQL Editor. For an existing project, run `supabase/migrations/20260930_homepage_sections.sql` and `supabase/migrations/20261007_visitor_counter.sql` once before deploying the updated app. The migrations create the required tables/functions, copy existing supporting activities, and add the visitor counter shown in the admin dashboard.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for local development and in the Vercel project's Environment Variables for deployment. Keep the service-role key private; never use a `NEXT_PUBLIC_` variable for it.
3. Set `ADMIN_PASSWORD` (at least 12 characters) and `ADMIN_SESSION_SECRET` (at least 32 random characters) in the same environments. The password protects `/myClass/admin`; the session secret signs its HTTP-only login cookie.
4. To copy the current `data/content.sqlite` contents, run `npm run migrate:supabase -- --confirm` only if they have not already been copied. This replaces the target assignments and lessons.

The migration command reads `.env.local` automatically. Vercel deployments use the configured Supabase database as persistent storage.

## Android app

The Android app is a Capacitor shell named **قسمي** that opens the deployed website, so the web project remains the single source for the interface. It requires an internet connection; website updates appear in the app after deployment. The administration page is blocked inside the Android app and remains available on the website.

To prepare the Android project:

1. Install Android Studio and its Android SDK.
2. In PowerShell, set `ANDROID_SITE_URL` to the full HTTPS URL of the deployed website. Include any required path prefix, but do not add a query string or fragment:

   ```powershell
   $env:ANDROID_SITE_URL = "https://my-class-eta.vercel.app/"
   npm run android:sync
   npm run android:open
   ```

3. In Android Studio, build and run the `android` project or generate a signed APK/AAB. Repeat `npm run android:sync` with the same URL after changing the Capacitor configuration.

The Android project is kept in this repository; it does not replace or move the Next.js website. Never put server credentials in `ANDROID_SITE_URL`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
Deploy update

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
