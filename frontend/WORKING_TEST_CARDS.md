# Working Test Cards for Razorpay

## 🚨 Quick Fix - Use These Cards Right Now

If you're getting "card not supported" errors, use these **guaranteed working** Indian test cards:

### ✅ **Visa (Domestic Indian)**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25 (any future date)
Name: Test User
```

### ✅ **Mastercard (Domestic Indian)**
```
Card Number: 5555 5555 5555 4444
CVV: 123
Expiry: 12/25 (any future date)
Name: Test User
```

### ✅ **Rupay (Indian)**
```
Card Number: 6076 6956 7890 1234
CVV: 123
Expiry: 12/25 (any future date)
Name: Test User
```

## 🔄 **Test Different Scenarios**

### **Successful Payment**
- Use any card above
- Enter any valid email
- Should process successfully

### **Failed Payment Test**
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
Expected: Payment will fail (for testing failure scenarios)
```

### **Insufficient Funds Test**
```
Card Number: 4000 0000 0000 9995
CVV: 123
Expiry: 12/25
Expected: Insufficient funds error
```

## 🌍 **International Cards Status**

**Current Status**: ❌ Not enabled
**Reason**: Requires Razorpay dashboard activation and business account approval

To enable international cards:
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → Payment Methods
3. Enable "International Cards"
4. Complete business KYC if not done
5. Wait for approval (2-7 business days)

## 🎯 **Quick Test Instructions**

1. **Add items to bag**
2. **Click "Buy Now"**
3. **Use this card**: `4111 1111 1111 1111`
4. **CVV**: `123`
5. **Expiry**: `12/25`
6. **Email**: Any valid email
7. **Should work perfectly!**

## 📞 **If Still Not Working**

### Check These:
- [ ] Using exact card numbers above (no spaces in actual input)
- [ ] Valid email format
- [ ] Internet connection stable
- [ ] Try different browser/clear cache

### Common Issues:
- **"Invalid card"**: Double-check card number
- **"CVV invalid"**: Use exactly `123`
- **"Expired card"**: Use `12/25` or any future date
- **"Payment failed"**: Try `4111111111111111` (no spaces)

## 🚀 **Production Cards**

When you go live, these test cards won't work. You'll need:
- Real customer cards
- Live Razorpay keys (not test keys)
- International cards enabled in dashboard

---

**💡 Pro Tip**: Bookmark this page for quick reference during development! 