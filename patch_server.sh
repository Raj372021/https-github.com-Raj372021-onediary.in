sed -i 's/const { amount, currency = "INR" } = req.body;/const { amount, currency = "INR", keyId, keySecret } = req.body;/g' server.ts
sed -i 's/let key_id = process.env.RAZORPAY_KEY_ID;/let key_id = keyId || process.env.RAZORPAY_KEY_ID;/g' server.ts
sed -i 's/let key_secret = process.env.RAZORPAY_KEY_SECRET;/let key_secret = keySecret || process.env.RAZORPAY_KEY_SECRET;/g' server.ts
