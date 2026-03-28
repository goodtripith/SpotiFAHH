const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    creator: { type: String, required: true },
    platform: { type: String, enum: ['YouTube', 'SoundCloud'], required: true },
    thumbnail_url: { type: String, required: true },
    media_url: { type: String, required: true },
    duration: { type: String, required: true }
  },
  { timestamps: true }
);

mediaItemSchema.index({ id: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('MediaItem', mediaItemSchema);
