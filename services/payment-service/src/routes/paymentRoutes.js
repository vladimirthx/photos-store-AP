const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout-session', paymentController.createSession);
router.get('/download/:sessionId', paymentController.getDownloadUrl);

// Stripe webhook must use raw body
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.webhook);

module.exports = router;
