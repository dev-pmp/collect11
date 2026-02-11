# Collect11 – Football Shirt Collection App

Collect11 is an Expo React Native mobile app for football kit collectors. It supports guest-mode local storage and an account-upgrade path that migrates all local data to Supabase cloud storage.

## Features
- Guest mode with SQLite persistence
- Cloud mode with Supabase Auth + Postgres + Storage
- Stable UUID IDs across local and cloud
- Repository pattern (`LocalRepository` / `CloudRepository`)
- Shirt management with photos
- Collections management
- Migration flow: guest -> cloud

## Setup
1. Copy env values:
   ```bash
   cp .env.example .env
   ```
2. Fill in:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm run start
   ```

## Supabase
- Apply SQL in `supabase/migrations/202602111930_collect11_schema.sql`.
- Ensure email auth is enabled.
- Storage bucket used: `shirt-photos`
- Object path format: `${ownerId}/${shirtId}/${photoId}.jpg`

## Happy path
1. Launch app in guest mode.
2. Create a shirt and attach 2 photos.
3. Create a collection.
4. Open shirt detail and add shirt to collection.
5. Open profile and create account/sign in.
6. Migration screen runs and data is moved to cloud.

