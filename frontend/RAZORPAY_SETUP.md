# Razorpay Integration Setup Guide

This project has been integrated with Razorpay for secure payment processing. Follow these steps to complete the setup:

## 1. Get Razorpay Credentials

1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Get your Key ID and Key Secret

## 2. Configure Environment Variables

Create or update your `.env.local` file in the frontend directory:

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_here
RAZORPAY_KEY_SECRET=your_secret_key_here

# For production, replace with live keys:
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_here
# RAZORPAY_KEY_SECRET=your_live_secret_key_here
```

## 3. Test Mode vs Live Mode

### Test Mode (Development)
- Use test API keys (starting with `rzp_test_`)
- No real money is charged
- Use test card numbers provided by Razorpay

### Live Mode (Production)
- Use live API keys (starting with `rzp_live_`)
- Real payments are processed
- Requires KYC verification and business documentation

## 4. Test Cards for Development

Use these test card numbers in development:

| Card Number | CVV | Expiry | Bank |
|-------------|-----|--------|------|
| 4111111111111111 | 123 | Any future date | Visa |
| 5555555555554444 | 123 | Any future date | Mastercard |
| 4000000000000002 | 123 | Any future date | Declined Card |

## 5. Features Implemented

- ✅ Secure payment processing with Razorpay
- ✅ Customer information collection (name, phone, email)
- ✅ Order summary and item details
- ✅ Payment success/failure handling
- ✅ Loading states and user feedback
- ✅ Error handling and retry mechanism
- ✅ Order ID generation
- ✅ Payment verification (basic implementation)

## 6. Next Steps for Production

1. **Backend Integration**: Implement proper order creation and payment verification on your backend
2. **Database**: Store order details in your database
3. **Email Notifications**: Send order confirmations to customers
4. **Webhook Handling**: Implement Razorpay webhooks for payment status updates
5. **Inventory Management**: Update product inventory after successful payments
6. **Order Management**: Create an admin panel to manage orders

## 7. Security Considerations

- Never expose your Razorpay Key Secret in frontend code
- Always verify payments on your backend
- Implement proper order validation
- Use HTTPS in production
- Validate all user inputs

## 8. Webhook Implementation (Recommended)

To ensure payment reliability, implement Razorpay webhooks on your backend:

```javascript
// Example webhook handler (Node.js/Express)
app.post('/webhook/razorpay', (req, res) => {
  const crypto = require('crypto');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');
  
  if (digest === req.headers['x-razorpay-signature']) {
    // Webhook is valid, process the payment
    const event = req.body.event;
    const payment = req.body.payload.payment.entity;
    
    if (event === 'payment.captured') {
      // Update order status in database
    }
  }
  
  res.status(200).send('OK');
});
```

## 9. Support

For any issues with Razorpay integration:
- Check [Razorpay Documentation](https://razorpay.com/docs/)
- Contact Razorpay Support
- Review the implementation in `frontend/lib/razorpay.ts` and `frontend/components/BagModal.tsx` 