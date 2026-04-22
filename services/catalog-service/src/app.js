// Capture any uncaught errors and print them clearly
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('Loading catalog routes...');
const catalogRoutes = require('./routes/catalogRoutes');
console.log('Routes loaded OK');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const API_PREFIX = process.env.API_PREFIX || '/api/catalog';
app.use(API_PREFIX, catalogRoutes);
app.use('/', catalogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'catalog-service' });
});

app.listen(PORT, () => {
  console.log(`Catalog Service is running on port ${PORT}`);
});