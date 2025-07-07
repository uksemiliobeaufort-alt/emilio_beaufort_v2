# Emilio Beaufort v2 - Deployment Guide

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env.local` file in the `frontend` directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `frontend`
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔧 Fixed Issues

### ✅ Deployment Fixes Applied:
- **Added missing dependencies**: `autoprefixer`, `postcss`
- **Fixed React version conflicts**: Downgraded to React 18.3.1
- **Fixed sessionStorage SSR issues**: Added client-side checks
- **Added .npmrc**: For handling peer dependency conflicts
- **Removed package-lock.json**: Will regenerate with correct dependencies

### ✅ Admin Panel Access:
- **Route**: `/admin`
- **Login**: `/admin/login` 
- **Dashboard**: `/admin/dashboard`

## 📁 Project Structure

```
frontend/
├── app/
│   ├── admin/           # Admin panel routes
│   │   ├── page.tsx     # Admin landing page
│   │   ├── login/       # Admin login
│   │   └── dashboard/   # Admin dashboard
│   ├── products/        # Products page (merged from Aditi branch)
│   └── ...
├── components/
├── lib/
│   ├── auth.ts         # Authentication logic (fixed)
│   ├── api.ts          # API functions
│   └── supabase.ts     # Supabase client
└── ...
```

## 🔐 Admin Authentication

The admin system uses Supabase with a custom `admin_user` table. Make sure to:

1. Create the `admin_user` table in Supabase
2. Add admin users with email/password
3. Set up proper environment variables

## 🛠️ Development

```bash
cd frontend
npm install
npm run dev
```

## 📝 Features

- ✅ **Admin Panel** - Complete authentication system
- ✅ **Products Route** - E-commerce functionality with search/filtering
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Supabase Integration** - Database and storage
- ✅ **TypeScript** - Type safety
- ✅ **Tailwind CSS** - Styling

## 🚨 Troubleshooting

### Admin Page Not Loading?
1. Check environment variables are set
2. Verify Supabase connection
3. Check browser console for errors

### Build Errors?
1. Clear node_modules and reinstall
2. Check all dependencies are installed
3. Verify TypeScript types

---

**Last Updated**: July 3, 2025  
**Status**: ✅ Ready for Production