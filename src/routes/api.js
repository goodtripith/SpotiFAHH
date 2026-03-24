const express = require('express');
const MediaItem = require('../models/MediaItem');
const Favorite = require('../models/Favorite');
const User = require('../models/User');
const cache = require('../services/cache');
const { fetchYoutube } = require('../services/youtubeService');
const { fetchSoundcloud } = require('../services/soundcloudService');

const router = express.Router();

async function normalizeAndStore(results) {
  if (!results.length) return [];

  const ops = results.map((item) => ({
    updateOne: {
      filter: { id: item.id, platform: item.platform },
      update: { $set: item },
      upsert: true
    }
  }));

  await MediaItem.bulkWrite(ops);

  return MediaItem.find({
    $or: results.map((item) => ({ id: item.id, platform: item.platform }))
  });
}

router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const limit = Number(req.query.limit || 12);

  if (!q) return res.status(400).json({ error: 'Missing query parameter q.' });

  const cacheKey = `search:${q}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ source: 'cache', items: cached });

  try {
    const [youtube, soundcloud] = await Promise.all([
      fetchYoutube(q, limit),
      fetchSoundcloud(q, limit)
    ]);

    const merged = [...youtube, ...soundcloud]
      .filter((item) => item.thumbnail_url)
      .slice(0, limit * 2);

    await normalizeAndStore(merged);

    cache.set(cacheKey, merged);
    res.json({ source: 'api', items: merged });
  } catch (error) {
    res.status(502).json({ error: 'Search provider failed.', details: error.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ error: 'username and email are required.' });

  const user = await User.findOneAndUpdate(
    { email },
    { username, email },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(user);
});

router.post('/favorites', async (req, res) => {
  try {
    const { userId, mediaItem } = req.body;
    if (!userId || !mediaItem) return res.status(400).json({ error: 'userId and mediaItem are required.' });

    const savedMedia = await MediaItem.findOneAndUpdate(
      { id: mediaItem.id, platform: mediaItem.platform },
      { $set: mediaItem },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const favorite = await Favorite.findOneAndUpdate(
      { user: userId, mediaItem: savedMedia._id },
      { user: userId, mediaItem: savedMedia._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('mediaItem');

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Could not save favorite.', details: error.message });
  }
});

router.get('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  const favorites = await Favorite.find({ user: userId }).populate('mediaItem').sort({ createdAt: -1 });
  res.json(favorites.map((fav) => fav.mediaItem));
});

router.get('/recommendations/:userId', async (req, res) => {
  const { userId } = req.params;
  const favorites = await Favorite.find({ user: userId }).populate('mediaItem');

  const favoriteCreators = new Set(favorites.map((f) => f.mediaItem.creator));
  const favoritePlatforms = new Set(favorites.map((f) => f.mediaItem.platform));

  const recommendations = await MediaItem.find({
    $or: [
      { creator: { $in: [...favoriteCreators] } },
      { platform: { $in: [...favoritePlatforms] } }
    ]
  })
    .sort({ updatedAt: -1 })
    .limit(24);

  res.json(recommendations);
});

module.exports = router;
