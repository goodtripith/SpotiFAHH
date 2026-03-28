const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spotifahh',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  soundcloudClientId: process.env.SOUNDCLOUD_CLIENT_ID || '',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 300)
};
