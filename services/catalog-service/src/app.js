const express = require('express');
const cors = require('cors');
require('dotenv').config();

const catalogRoutes = require('./routes/catalogRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/catalog', catalogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'catalog-service' });
});

app.listen(PORT, () => {
  console.log(`Catalog Service is running on port ${PORT}`);
});