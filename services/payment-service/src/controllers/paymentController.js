const prisma = require('../prismaClient');
const { createCheckoutSession, stripe } = require('../services/stripeService');
const { generatePresignedUrl } = require('../services/s3Service');

const createSession = async (req, res) => {
  try {
    const { photoId } = req.body;
    const userId = "guest-" + Date.now(); // Guest checkout

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const session = await createCheckoutSession(photo, userId);

    await prisma.transaction.create({
      data: {
        stripeSessionId: session.id,
        userId: userId,
        photoId: photo.id,
        amount: photo.price,
        status: 'pending'
      }
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    await prisma.transaction.update({
      where: { stripeSessionId: session.id },
      data: { status: 'completed' }
    });
  }

  res.status(200).json({ received: true });
};

const getDownloadUrl = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { stripeSessionId: sessionId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const photo = await prisma.photo.findUnique({ where: { id: transaction.photoId } });
    
    const url = await generatePresignedUrl(photo.originalKey);

    res.status(200).json({ downloadUrl: url });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createSession,
  webhook,
  getDownloadUrl
};
