const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
instance.orders.create({ amount: 100, currency: "INR", receipt: "receipt#1" })
  .then(console.log)
  .catch(e => console.error("Error:", e));
