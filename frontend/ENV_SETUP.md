# Environment Variables Setup

## Required for Purchase API

Create a `.env.local` file in the `frontend` directory with these variables:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Configuration (REQUIRED for purchase confirmations)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## How to Set Up Email (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASSWORD`
3. **Set EMAIL_USER** to your Gmail address
4. **Set ADMIN_EMAILS** to comma-separated admin email addresses

## Optional Variables

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_ID=your_sheets_id

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## After Setup

1. Save the `.env.local` file
2. Restart your development server: `npm run dev`
3. Try the purchase form again

## Email Features

With email configuration, the system will automatically send:
- **Customer confirmation email** with order details and next steps
- **Admin notification email** with complete order information
- Professional HTML templates with Emilio Beaufort branding

## Troubleshooting

If you still get "fetch failed" errors:
1. Check that all Supabase variables are set correctly
2. Verify your Supabase project is active
3. Check the browser console for detailed error messages
4. Ensure the `purchases` table exists in your Supabase database

If emails are not sending:
1. Verify Gmail app password is correct
2. Check that 2FA is enabled on Gmail
3. Ensure EMAIL_USER and EMAIL_PASSWORD are set
4. Check server logs for email errors
