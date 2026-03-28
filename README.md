# SpotiFAHH Full-Stack Media Browser

A simplified Spotify/Netflix-style browser using **Express + MongoDB + React**.

## Features
- Search YouTube Data API v3 and SoundCloud API.
- Normalized metadata schema (`MediaItems`):
  - `id`, `title`, `creator`, `platform`, `thumbnail_url`, `media_url`, `duration`
- Save favorites to MongoDB (`Favorites` collection).
- Caching for frequent searches.
- Debounced search input.
- Infinite scroll.
- Lazy-loaded thumbnails.
- Recommendations based on favorite creators/platform.
- Embedded playback only (no downloading/conversion/storage of media files).

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Fill in API keys for YouTube and SoundCloud.
4. Run MongoDB locally.
5. Start the server:
   ```bash
   npm start
   ```
6. Open `http://localhost:3000`.

## API endpoints
- `GET /api/search?q=<query>&limit=18`
- `POST /api/users`
- `POST /api/favorites`
- `GET /api/favorites/:userId`
- `GET /api/recommendations/:userId`

## Notes
- If `YOUTUBE_API_KEY` or `SOUNDCLOUD_CLIENT_ID` are missing, that provider returns zero results.
- The app stores only metadata and user preferences.
