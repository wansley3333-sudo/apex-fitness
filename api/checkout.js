const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  Starter: 'price_1THy87Eiu9siKoy19p0rKdEf',
  Pro:     'price_1THyCtEiu9siKoy1Bv4DYkSS',
  Elite:   'price_1THyEmEiu9siKoy1PNxeIKO8',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { plan } = req.body;
  const priceId = PRICE_IDS[plan];
  if (!priceId) return res.status(400).json({ error: 'Invalid plan' });
  const origin = req.headers.origin || 'https://apexfitness-pro.netlify.app';
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${origin}/success.html`,
      cancel_url:  `${origin}/#pricing`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
