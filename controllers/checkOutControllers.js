const asyncHandler = require("express-async-handler");

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const checkOut = asyncHandler(async (req, res) => {
  const { items } = req.body;
  console.log(items);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => {
        // const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "lkr",
            product_data: {
              name: item.productTitle,
            },
            unit_amount: item.productPrice
              ? item.productPrice * 100
              : item.price * 100,
          },
          quantity: item.quantity ? item.quantity : item.qty,
        };
      }),
      // success_url: `${process.env.CLIENT_URL}/success.html`,
      // cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      success_url: "http://localhost:3000/order/review",
      cancel_url: "http://localhost:3000/",
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = {
  checkOut,
};
