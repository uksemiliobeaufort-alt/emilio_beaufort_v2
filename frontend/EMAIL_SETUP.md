# Email Setup Guide for Job Applications

This guide will help you set up automatic email notifications for job applications.

## Prerequisites

1. **Gmail Account** (or other email service)
2. **Regular Email Password** (no 2FA required)

## Step 1: Gmail Setup (Simple Method)

### For Gmail Users (No 2FA Required):

1. **Use Regular Password**:
   - No need to enable 2-Factor Authentication
   - Use your regular Gmail password
   - Make sure "Less secure app access" is enabled (if prompted)

2. **Add Environment Variables**:
   Add these to your `.env.local` file:
   ```env
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-regular-gmail-password
   ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ```

## Step 2: Alternative Email Services

### For Outlook/Hotmail:
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password-or-app-password
```

### For Yahoo:
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

## Step 3: Install Dependencies

```bash
npm install nodemailer @types/nodemailer
```

## Step 4: Features

Once set up, you'll have:

### ✅ **Automatic Email Notifications**
- **Applicant Confirmation**: Professional email sent to job applicants
- **Admin Notification**: Detailed email sent to admin team
- **Error Handling**: Application still saves even if email fails

### ✅ **Email Templates**
- **Branded Design**: Emilio Beaufort styling
- **Professional Content**: Clear next steps and expectations
- **Responsive**: Works on all email clients

### ✅ **Admin Features**
- **Multiple Recipients**: Send to multiple admin emails
- **Application Details**: Complete applicant information
- **Direct Links**: GitHub, LinkedIn, Portfolio, Resume links

## Step 5: Testing

1. **Submit a test application** through the careers form
2. **Check applicant email** for confirmation
3. **Check admin email** for notification
4. **Verify all links** work correctly

## Troubleshooting

### Email Not Sending?
- ✅ Check environment variables are set
- ✅ Verify regular password is correct
- ✅ Enable "Less secure app access" in Gmail settings
- ✅ Check spam folder

### Gmail Security Issues?
- ✅ Use regular password (no 2FA required)
- ✅ Enable "Less secure app access" in Gmail settings
- ✅ Make sure your Gmail account allows less secure apps

### Multiple Admin Emails?
```env
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

## Security Notes

- **Never commit** `.env.local` to version control
- **Use App Passwords** instead of regular passwords
- **Rotate passwords** regularly
- **Monitor email logs** for unusual activity

## Production Deployment

For production deployment:

1. **Set environment variables** in your hosting platform
2. **Use production email service** (SendGrid, AWS SES, etc.)
3. **Monitor email delivery** rates
4. **Set up email analytics** if needed

## Email Templates

The system includes two email templates:

1. **Applicant Confirmation**: Professional confirmation with next steps
2. **Admin Notification**: Detailed application summary with links

Both templates are customizable in `lib/email.ts`. 