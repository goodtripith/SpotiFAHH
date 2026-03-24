const axios = require('axios');
const { youtubeApiKey } = require('../config');

function parseIsoDuration(isoDuration = 'PT0S') {
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '00:00';
  const h = Number(matches[1] || 0);
  const m = Number(matches[2] || 0);
  const s = Number(matches[3] || 0);
  const total = h * 3600 + m * 60 + s;
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function fetchYoutube(query, limit = 12) {
  if (!youtubeApiKey) return [];

  const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      key: youtubeApiKey,
      q: query,
      part: 'snippet',
      type: 'video',
      maxResults: limit
    }
  });

  const ids = searchRes.data.items.map((item) => item.id.videoId).join(',');
  if (!ids) return [];

  const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: youtubeApiKey,
      id: ids,
      part: 'contentDetails'
    }
  });

  const durationMap = new Map(
    detailsRes.data.items.map((video) => [video.id, parseIsoDuration(video.contentDetails.duration)])
  );

  return searchRes.data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    creator: item.snippet.channelTitle,
    platform: 'YouTube',
    thumbnail_url:
      item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    media_url: `https://www.youtube.com/embed/${item.id.videoId}`,
    duration: durationMap.get(item.id.videoId) || '00:00'
  }));
}

module.exports = { fetchYoutube };
