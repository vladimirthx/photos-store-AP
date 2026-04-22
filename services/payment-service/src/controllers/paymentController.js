const prisma = require('../prismaClient');
const { createCheckoutSession, stripe } = require('../services/stripeService');
const { generatePresignedUrl } = require('../services/s3Service');

const createSession = async (req, res) => {
  try {
    const { photoIds } = req.body;
    const userId = "guest-" + Date.now(); // Guest checkout

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ error: 'No photos selected' });
    }

    const photos = await prisma.photo.findMany({
      where: { id: { in: photoIds } }
    });

    if (photos.length !== photoIds.length) {
      return res.status(404).json({ error: 'Some photos were not found' });
    }

    const session = await createCheckoutSession(photos, userId);

    // Create a transaction for each photo
    const transactions = photos.map(photo => ({
      stripeSessionId: session.id,
      userId: userId,
      photoId: photo.id,
      amount: photo.price,
      status: 'pending'
    }));

    await prisma.transaction.createMany({
      data: transactions
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

    await prisma.transaction.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'completed' }
    });
  }

  res.status(200).json({ received: true });
};

const getDownloadUrl = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { stripeSessionId: sessionId }
    });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ error: 'Transactions not found' });
    }

    // Verify all are completed
    const pendingTransactions = transactions.filter(t => t.status !== 'completed');
    if (pendingTransactions.length > 0) {
      return res.status(400).json({ error: 'Payment not completed or still processing' });
    }

    const photoIds = transactions.map(t => t.photoId);
    const photos = await prisma.photo.findMany({
      where: { id: { in: photoIds } }
    });

    const downloadLinks = await Promise.all(
      photos.map(async (photo) => {
        const url = await generatePresignedUrl(photo.originalKey);
        return {
          title: photo.title,
          url: url
        };
      })
    );

    res.status(200).json({ downloadLinks });
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
