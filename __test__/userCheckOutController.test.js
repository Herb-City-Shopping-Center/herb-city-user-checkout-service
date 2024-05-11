const request = require('supertest');
const { app, server } = require('../server'); // Assuming your Express app is exported from app.js
const { checkOut } = require('../controllers/checkOutControllers');
const connectDB = require('../DB/db'); // Import the function to connect to the database
const { default: mongoose } = require('mongoose');

// const { app } = require('../server'); // Ensure your Express app is exported from this file
const stripe = require('stripe')(); // Normally you would mock this

// Mocking stripe.checkout.sessions.create to not call the actual Stripe API
jest.mock('stripe', () => () => ({
  checkout: {
    sessions: {
      create: jest.fn()
    }
  }
}));

describe('POST /create-checkout-session', () => {
  beforeAll(async () => {
    await connectDB();
  }, 30000);

  test('should create a checkout session and return session URL on success', async () => {
    const items = [{ productTitle: 'Test Product', productPrice: 10, quantity: 1 }];
    stripe.checkout.sessions.create.mockResolvedValueOnce({
      url: 'http://localhost:3000/order/review'
    });

    const response = await request(app)
      .post('/api/create-checkout-session')
      .send({ items });

    expect(response.status).toBe(200);
    expect(response.body.url).toBe('http://localhost:3000/order/review');
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: expect.any(Array)
    }));
  });

  test('should handle errors when Stripe throws an exception', async () => {
    const items = [{ productTitle: 'Test Product', productPrice: 10, quantity: 1 }];
    stripe.checkout.sessions.create.mockRejectedValueOnce(new Error('Stripe error'));

    const response = await request(app)
      .post('/api/create-checkout-session')
      .send({ items });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Stripe error' });
  });

  afterAll(async () => {
    server.close();

    await mongoose.disconnect()
  });
});

