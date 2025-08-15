# Google AdSense Setup Guide

This guide explains how to set up Google AdSense ads on your blog pages.

## Overview

Google AdSense has been integrated into the following blog pages:
- `/blogs` - Blog listing page
- `/journal` - Main journal page
- `/journal/[slug]` - Individual blog post pages
- `/journal/gallery` - Blog gallery page
- `/journal/tag/[tag]` - Tag archive pages

## Ad Placement Strategy

The following ad components have been created using the **In-Article Ad Unit**:

1. **BlogHeaderAd** - Placed at the top of blog pages
2. **BlogContentAd** - Placed in the middle of content
3. **BlogFooterAd** - Placed at the bottom of pages
4. **BlogSidebarAd** - For sidebar placement (if needed)

## Current Configuration

### Ad Unit Details
- **Ad Unit Type**: In-Article
- **Ad Format**: Fluid
- **Ad Layout**: In-Article
- **Publisher ID**: `ca-pub-5512739027608050`
- **Ad Slot ID**: `8173362196`

### Ad Code Implementation
The ad code has been implemented using the following configuration:

```html
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5512739027608050"
     data-ad-slot="8173362196"></ins>
```

## Setup Instructions

### 1. Ad Unit Configuration ✅ COMPLETED

Your in-article ad unit is already configured:
- **Ad Unit ID**: 8173362196
- **Publisher ID**: ca-pub-5512739027608050
- **Format**: Fluid (responsive)
- **Layout**: In-article

### 2. Implementation Status ✅ COMPLETED

The ad unit has been implemented across all blog pages:
- Header ads on all blog pages
- Content ads after main content
- Footer ads at page bottom
- Maximum 3 ads per page (Google's recommendation)

### 3. Testing

1. **Deploy your changes** to production
2. **Wait for Google AdSense review** (can take 1-2 weeks)
3. **Check the AdSense dashboard** for ad performance
4. **Monitor for any policy violations**

## Ad Placement Guidelines

### Best Practices
- ✅ In-article ads are optimally placed within content flow
- ✅ Fluid format ensures responsive design across devices
- ✅ Maximum 3 ads per page (Google's recommendation)
- ✅ Ads don't interfere with user experience

### Current Implementation
- **Header ads**: 1 per page, below the title
- **Content ads**: 1 per page, after main content
- **Footer ads**: 1 per page, at the bottom
- **Total**: Maximum 3 ads per page

## In-Article Ad Benefits

The in-article ad format provides several advantages:
- **Better user experience**: Ads flow naturally with content
- **Higher engagement**: Users are more likely to interact
- **Responsive design**: Automatically adapts to different screen sizes
- **Google's recommended format**: Optimized for content websites

## Troubleshooting

### Ads Not Showing
1. Check if your site is approved by Google AdSense
2. Verify the ad slot ID is correct: `8173362196`
3. Check browser console for errors
4. Ensure the AdSense script is loading

### Common Issues
- **Ad blocker interference**: Test in incognito mode
- **Policy violations**: Check AdSense dashboard for warnings
- **Loading delays**: In-article ads may take time to appear after page load

## Performance Monitoring

Monitor these metrics in your AdSense dashboard:
- Page RPM (Revenue Per Mille)
- Click-through rate (CTR)
- Ad viewability
- User engagement
- In-article ad performance specifically

## Support

For Google AdSense support:
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- [In-Article Ad Guidelines](https://support.google.com/adsense/answer/6242051)

## Notes

- ✅ The AdSense script is loaded globally in the layout
- ✅ In-article ads are responsive and mobile-friendly
- ✅ Ad placement follows Google's policies
- ✅ The implementation uses Next.js best practices
- ✅ Using the specific ad unit from your AdSense account
