const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (photos, userId) => {
  const lineItems = photos.map(photo => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: photo.title,
        images: [photo.watermarkedUrl],
      },
      unit_amount: Math.round(photo.price * 100), // Stripe uses cents
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/`,
    metadata: {
      userId: userId,
      photoIds: photos.map(p => p.id).join(','),
    },
  });

  return session;
};

module.exports = {
  stripe,
  createCheckoutSession
};
