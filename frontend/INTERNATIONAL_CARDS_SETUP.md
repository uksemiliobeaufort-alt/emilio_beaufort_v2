# Enabling International Cards in Razorpay

## Overview
To accept international cards on your Razorpay integration, you need to enable this feature both in your Razorpay Dashboard and ensure your integration is configured correctly.

## Step 1: Razorpay Dashboard Configuration

### 1.1 Login to Razorpay Dashboard
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Login with your credentials

### 1.2 Enable International Payments
1. **Navigate to Settings**:
   - Click on "Settings" in the left sidebar
   - Go to "Configuration" → "Payment Methods"

2. **Enable International Cards**:
   - Scroll down to "International Cards"
   - Toggle ON "Accept International Cards"
   - Select currencies you want to accept (USD, EUR, GBP, etc.)

3. **Configure Payment Methods**:
   - Enable "Visa", "Mastercard", "American Express"
   - Enable "International Net Banking" if needed
   - Save the configuration

### 1.3 Account Verification (Important)
- **KYC Requirements**: Ensure your business KYC is complete
- **Website Verification**: Your website must be live and properly configured
- **Business Documents**: All required documents should be submitted
- **Approval**: Wait for Razorpay to approve international payments (usually 2-7 business days)

## Step 2: Technical Configuration

### 2.1 Updated Payment Options
Our integration now includes:

```typescript
config: {
  display: {
    blocks: {
      card: {
        name: "Pay by Card",
        instruments: [
          {
            method: "card",
            issuers: ["VISA", "MASTERCARD", "AMEX", "RUPAY", "DINR"]
          }
        ]
      },
      // ... other payment methods
    }
  }
}
```

### 2.2 Currency Support
```typescript
// You can now accept multiple currencies
currency: 'INR', // Default
// currency: 'USD', // For international customers
// currency: 'EUR', // European customers
// currency: 'GBP', // UK customers
```

## Step 3: Testing International Cards

### 3.1 Test Card Numbers (International)

**Visa (International)**
- **Number**: 4000 0027 6000 0016
- **CVV**: 123
- **Expiry**: Any future date
- **Name**: Any name

**Mastercard (International)**
- **Number**: 5555 5555 5555 4444
- **CVV**: 123
- **Expiry**: Any future date
- **Name**: Any name

**American Express (International)**
- **Number**: 3782 8224 6310 005
- **CVV**: 1234
- **Expiry**: Any future date
- **Name**: Any name

### 3.2 Testing Different Scenarios

**Success Test**:
```bash
Card: 4000 0027 6000 0016
CVV: 123
Expiry: 12/25
Expected: Payment Success
```

**Failure Test**:
```bash
Card: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
Expected: Payment Declined
```

## Step 4: Production Considerations

### 4.1 Compliance Requirements
- **PCI DSS**: Ensure your website is PCI DSS compliant
- **SSL Certificate**: Must have valid SSL certificate
- **Privacy Policy**: Clear privacy policy for international customers
- **Terms of Service**: Include international payment terms

### 4.2 Currency Conversion
```typescript
// Handle currency conversion
const convertToINR = (amount: number, currency: string) => {
  // Implement currency conversion logic
  // Or use Razorpay's multi-currency feature
  return amount;
};

// Usage in payment
amount: convertToINR(total, selectedCurrency),
currency: selectedCurrency || 'INR'
```

### 4.3 Tax and Compliance
- **GST/VAT**: Handle different tax structures
- **Regulatory Compliance**: Follow regulations for each country
- **Settlement**: Configure international settlement preferences

## Step 5: Error Handling

### 5.1 Common Issues and Solutions

**Issue**: "International cards not supported"
```typescript
// Solution: Check dashboard settings and account approval status
if (error?.reason === 'international_transaction_not_allowed') {
  // Guide user to use supported cards or contact support
}
```

**Issue**: "Currency not supported"
```typescript
// Solution: Verify enabled currencies in dashboard
const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
if (!supportedCurrencies.includes(currency)) {
  // Fallback to INR or show error
}
```

### 5.2 Updated Error Messages
```typescript
if (error?.reason === 'international_transaction_not_allowed') {
  if (accountHasInternationalEnabled) {
    errorMessage = 'This international card is not supported. Please try a different card.';
  } else {
    errorMessage = 'International cards are being activated for your account. Please contact support.';
  }
}
```

## Step 6: Monitoring and Analytics

### 6.1 Track International Transactions
```typescript
// Add analytics for international payments
const trackPayment = (paymentData: any) => {
  console.log('Payment Analytics:', {
    currency: paymentData.currency,
    amount: paymentData.amount,
    isInternational: paymentData.currency !== 'INR',
    cardCountry: paymentData.card?.country,
    timestamp: new Date().toISOString()
  });
};
```

### 6.2 Dashboard Monitoring
- Monitor international transaction success rates
- Track currency-wise performance
- Set up alerts for failed international payments

## Step 7: Customer Support

### 7.1 Help Documentation
- Provide clear instructions for international customers
- List supported countries and currencies
- Include customer support contact for payment issues

### 7.2 Common Customer Queries

**"My card is not working"**
- Verify if their country is supported
- Check if card has international transactions enabled
- Suggest contacting their bank

**"Different currency showing"**
- Explain currency conversion
- Show how final amount is calculated
- Provide currency conversion transparency

## Checklist for Going Live

- [ ] Razorpay Dashboard: International payments enabled
- [ ] Account KYC: Complete and approved
- [ ] Website: SSL certificate installed
- [ ] Testing: All international test cards working
- [ ] Compliance: PCI DSS, privacy policy, terms updated
- [ ] Monitoring: Analytics and error tracking setup
- [ ] Support: Customer service team trained on international payments
- [ ] Documentation: Help docs updated for international customers

## Support Contacts

- **Razorpay Support**: support@razorpay.com
- **International Payments**: international@razorpay.com
- **Technical Issues**: developers@razorpay.com
- **Phone Support**: +91-80-61548011

## Additional Resources

- [Razorpay International Payments Docs](https://razorpay.com/docs/international/)
- [Supported Countries List](https://razorpay.com/docs/international/supported-countries/)
- [Currency Conversion Guide](https://razorpay.com/docs/international/currency-conversion/)
- [Compliance Requirements](https://razorpay.com/docs/international/compliance/)

---

**Note**: International card acceptance requires Razorpay business account approval. Contact Razorpay support to enable this feature for your account. 