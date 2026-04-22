const express = require('express');
const cors = require('cors');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());

// Webhook route needs raw body, so we mount it BEFORE express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').webhook);

app.use(express.json());

app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-service' });
});

app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
});
