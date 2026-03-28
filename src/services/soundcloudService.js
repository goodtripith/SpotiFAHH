const axios = require('axios');
const { soundcloudClientId } = require('../config');

function toMMSS(ms = 0) {
  const total = Math.floor(ms / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function fetchSoundcloud(query, limit = 12) {
  if (!soundcloudClientId) return [];

  const res = await axios.get('https://api-v2.soundcloud.com/search/tracks', {
    params: {
      q: query,
      client_id: soundcloudClientId,
      limit,
      linked_partitioning: 1
    }
  });

  return (res.data.collection || []).map((track) => ({
    id: String(track.id),
    title: track.title,
    creator: track.user?.username || 'Unknown',
    platform: 'SoundCloud',
    thumbnail_url: track.artwork_url || track.user?.avatar_url || '',
    media_url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(track.permalink_url)}`,
    duration: toMMSS(track.duration)
  }));
}

module.exports = { fetchSoundcloud };
