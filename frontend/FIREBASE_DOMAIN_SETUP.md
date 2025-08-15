# Firebase Domain Authorization Fix

## Error: auth/unauthorized-domain

This error occurs when trying to authenticate with Firebase from a domain that's not authorized in your Firebase project settings.

## How to Fix

### 1. Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** in the left sidebar
4. Click on the **Settings** tab
5. Scroll down to **Authorized domains**

### 2. Add Your Development Domain
Add these domains to the authorized list:

#### For Local Development:
- `localhost`
- `127.0.0.1`

#### For Production (when deployed):
- `your-domain.com`
- `www.your-domain.com`

### 3. For Vite Development Server
If you're using Vite (port 5173), also add:
- `localhost:5173`
- `127.0.0.1:5173`

### 4. Save Changes
Click **Save** to update the authorized domains list.

### 5. Test Again
After adding the domains, try the Google sign-in again. It should work now.

## Common Development Domains to Add

```
localhost
127.0.0.1
localhost:3000
localhost:5173
127.0.0.1:3000
127.0.0.1:5173
```

## Production Domains

When you deploy your application, make sure to add your production domain to the authorized list as well.

## Troubleshooting

- **Still getting the error?** Clear your browser cache and try again
- **Multiple projects?** Make sure you're editing the correct Firebase project
- **Environment variables?** Verify your Firebase config in `.env.local` matches the project you're editing

## Security Note

Only add domains you trust and control. Never add third-party domains to your authorized list.
