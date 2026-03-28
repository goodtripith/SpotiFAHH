const NodeCache = require('node-cache');
const { cacheTtlSeconds } = require('../config');

module.exports = new NodeCache({ stdTTL: cacheTtlSeconds, useClones: false });
