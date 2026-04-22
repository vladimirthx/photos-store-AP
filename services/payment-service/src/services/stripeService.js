const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (photo, userId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: photo.title,
            images: [photo.watermarkedUrl],
          },
          unit_amount: Math.round(photo.price * 100), // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:3000/cancel`,
    metadata: {
      userId: userId,
      photoId: photo.id,
    },
  });

  return session;
};

module.exports = {
  stripe,
  createCheckoutSession
};
