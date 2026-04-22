const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Use prefix from env or default for local development
const API_PREFIX = process.env.API_PREFIX || '/api/auth';
app.use(API_PREFIX, authRoutes);

// Also accept requests without prefix (for DO path routing)
app.use('/', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth Service is running on port ${PORT} and listening on 0.0.0.0`);
});