# Google Sheets Integration Setup Guide

This guide will help you set up live Google Sheets integration for job applications.

## Prerequisites

1. **Google Cloud Project** with Google Sheets API enabled
2. **Service Account** with proper permissions
3. **Google Sheets** document for storing application data

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Name: "Job Applications Sheets"
   - Description: "Service account for job applications sync"
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

## Step 3: Generate Service Account Key

1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

## Step 4: Create Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Share it with your service account email (from the JSON file)
4. Give it "Editor" permissions
5. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

## Step 5: Environment Variables

Add these to your `.env.local` file:

```env
# Google Sheets Configuration (Required)
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Note**: The `NEXT_PUBLIC_*` variables are not needed for the server-side implementation.

## Step 6: Install Dependencies

```bash
npm install googleapis
```

## Step 7: Features

Once set up, you'll have:

### ✅ **Live Updates**
- New applications automatically sync to Google Sheets
- Status changes (Accept/Reject) update in real-time
- All application data is stored in organized columns

### ✅ **Admin Controls**
- "View Sheets" button opens the live spreadsheet
- Status changes sync instantly
- Export CSV still available as backup

### ✅ **Data Structure**
The spreadsheet will have these columns:
- ID
- Full Name
- Email
- Job Title
- Job ID
- LinkedIn
- GitHub
- Portfolio
- Cover Letter
- How did you hear
- Resume URL
- Status
- Created At
- Updated At

## Step 8: Testing

1. Submit a test application
2. Check if it appears in your Google Sheets
3. Change status in admin panel
4. Verify the change syncs to Google Sheets

## Troubleshooting

### Common Issues:

1. **"Google Sheets ID not configured"**
   - Check your environment variables
   - Ensure spreadsheet ID is correct

2. **"Service account not found"**
   - Verify service account email
   - Check private key format

3. **"Permission denied"**
   - Share spreadsheet with service account
   - Give "Editor" permissions

4. **"API not enabled"**
   - Enable Google Sheets API in Google Cloud Console

## Security Notes

- Keep your service account key secure
- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Consider using Google Cloud Secret Manager for production

## Production Deployment

For production, consider:

1. **Server-side only sync** (more secure)
2. **Google Cloud Secret Manager** for credentials
3. **Rate limiting** to prevent API abuse
4. **Error monitoring** for failed syncs
5. **Backup strategy** for critical data 