const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const { mongoUri, port } = require('./config');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });
