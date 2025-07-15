# Google Analytics 4 Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for your Emilio Beaufort website to track user engagement and activities.

## Prerequisites

1. A Google Analytics account
2. Access to Google Analytics Admin panel
3. Your website domain

## Step 1: Create Google Analytics Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or create a new property
3. Enter your property name (e.g., "Emilio Beaufort Website")
4. Select your reporting time zone and currency
5. Click "Next"

## Step 2: Set Up Data Stream

1. In your new property, go to **Admin** > **Data Streams**
2. Click **"Add stream"** > **"Web"**
3. Enter your website URL (e.g., `https://emiliobeaufort.com`)
4. Enter a stream name (e.g., "Emilio Beaufort Website")
5. Click **"Create stream"**

## Step 3: Get Your Measurement ID

1. After creating the stream, you'll see a **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy this ID - you'll need it for the next step

## Step 4: Configure Environment Variables

Create a `.env.local` file in your `frontend` directory with the following:

```env
# Google Analytics 4 Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Replace G-XXXXXXXXXX with your actual Measurement ID
```

## Step 5: Verify Installation

1. Start your development server: `npm run dev`
2. Open your website in a browser
3. Open Developer Tools (F12)
4. Go to the **Network** tab
5. Look for requests to `googletagmanager.com` - this confirms GA is loading
6. Check the **Console** for any analytics-related logs

## Step 6: Test Tracking Events

The following events are automatically tracked:

### Page Views
- All page navigation is tracked automatically
- Respects cookie consent settings

### Button Clicks
- "Discover Our Philosophy" button
- "Fill Partnership Form" button
- All team member social media links

### Section Views
- Philosophy section
- House section
- Team section
- Partnership section

### User Behavior
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page (tracks after 5+ seconds)
- Form submissions (when implemented)

### Ecommerce Events
- Product views
- Add to cart
- Purchases

## Step 7: View Analytics Data

1. Go to your Google Analytics dashboard
2. Navigate to **Reports** > **Realtime** to see live data
3. Check **Reports** > **Engagement** > **Events** to see tracked events
4. View **Reports** > **Acquisition** > **Traffic acquisition** for traffic sources

## Privacy Compliance

The analytics implementation includes:

- **Cookie Consent Integration**: Analytics only track when users accept cookies
- **GDPR Compliance**: Respects user privacy preferences
- **Data Minimization**: Only tracks essential user interactions
- **Transparent Tracking**: Clear about what data is collected

## Custom Events

You can add custom event tracking using the analytics hook:

```typescript
import { useAnalytics } from '@/lib/useAnalytics';

const analytics = useAnalytics();

// Track custom events
analytics.trackCustomEvent('custom_action', 'category', 'label', value);
```

## Troubleshooting

### Analytics Not Loading
- Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
- Verify the Measurement ID format (should start with "G-")
- Check browser console for errors

### Events Not Tracking
- Ensure cookie consent is accepted
- Check that the user hasn't blocked analytics
- Verify the event names match your GA4 configuration

### No Data in GA4
- Wait 24-48 hours for data to appear in reports
- Check realtime reports for immediate feedback
- Verify your GA4 property is set up correctly

## Advanced Configuration

### Custom Dimensions
You can add custom dimensions in GA4 and track them:

```typescript
analytics.trackCustomEvent('event_name', 'category', 'label', undefined, {
  custom_dimension: 'value'
});
```

### Enhanced Ecommerce
For detailed ecommerce tracking, use the provided ecommerce functions:

```typescript
// Track product views
analytics.trackViewItem('product-id', 'Product Name', 'Category', 1000);

// Track add to cart
analytics.trackAddToCart('product-id', 'Product Name', 1000, 1);

// Track purchases
analytics.trackPurchase('transaction-id', 1000, [{
  id: 'product-id',
  name: 'Product Name',
  category: 'Category',
  price: 1000,
  quantity: 1
}]);
```

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your GA4 property configuration
3. Test with the realtime reports
4. Ensure cookie consent is working properly

## Next Steps

After setup, consider:

1. Setting up conversion goals in GA4
2. Creating custom audiences
3. Setting up Google Ads integration
4. Configuring enhanced ecommerce tracking
5. Setting up custom reports for specific business metrics 