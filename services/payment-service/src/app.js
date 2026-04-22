const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());

// Webhook route needs raw body
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/api/payment/webhook';
app.use(WEBHOOK_PATH, express.raw({ type: 'application/json' }), require('./controllers/paymentController').webhook);
app.use('/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').webhook);

app.use(express.json());

const API_PREFIX = process.env.API_PREFIX || '/api/payment';
app.use(API_PREFIX, paymentRoutes);
app.use('/', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-service' });
});

app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
});
