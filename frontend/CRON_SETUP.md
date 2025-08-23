# Automatic Order Deletion Setup Guide

This guide explains how to set up automatic deletion of orders older than 60 days.

## Overview

The system automatically deletes orders from the `purchases` table after 60 days to maintain database performance and comply with data retention policies.

## Components

### 1. Database Function
- **File**: `supabase/migrations/20250101000008_create_auto_delete_orders_function.sql`
- **Function**: `auto_delete_old_orders()`
- **Purpose**: Deletes orders older than 60 days from the database

### 2. API Endpoint
- **File**: `app/api/auto-delete-orders/route.ts`
- **Purpose**: Provides programmatic access to trigger order cleanup

### 3. Admin Interface
- **File**: `app/admin/products/vieworders/page.tsx`
- **Features**: 
  - Shows countdown for each order until deletion
  - Displays total orders scheduled for deletion
  - Manual cleanup button for immediate deletion

## Setup Options

### Option 1: Cron Job (Recommended for Linux/Unix servers)

Add this to your crontab (`crontab -e`):

```bash
# Run every day at 2:00 AM
0 2 * * * curl -X POST https://yourdomain.com/api/auto-delete-orders \
  -H "Content-Type: application/json" \
  -d '{"action":"cleanup_old_orders"}' \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

### Option 2: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger to Daily at 2:00 AM
4. Set action to start a program
5. Program: `curl.exe`
6. Arguments: `-X POST https://yourdomain.com/api/auto-delete-orders -H "Content-Type: application/json" -d "{\"action\":\"cleanup_old_orders\"}" -H "Authorization: Bearer YOUR_SECRET_TOKEN"`

### Option 3: Vercel Cron Jobs (if using Vercel)

Add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/auto-delete-orders",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Option 4: GitHub Actions (if using GitHub)

Create `.github/workflows/auto-delete-orders.yml`:

```yaml
name: Auto Delete Old Orders
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cleanup
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/auto-delete-orders \
            -H "Content-Type: application/json" \
            -d '{"action":"cleanup_old_orders"}' \
            -H "Authorization: Bearer ${{ secrets.API_SECRET }}"
```

## Environment Variables

Ensure these are set in your environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Security Considerations

1. **Service Role Key**: The API uses Supabase service role key for admin operations
2. **Authorization**: Consider adding additional authentication for the cleanup endpoint
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Logging**: All deletion operations are logged for audit purposes

## Monitoring

### Check Deletion Status
```bash
# GET request to check how many orders would be deleted
curl https://yourdomain.com/api/auto-delete-orders
```

### Manual Cleanup
```bash
# POST request to trigger immediate cleanup
curl -X POST https://yourdomain.com/api/auto-delete-orders \
  -H "Content-Type: application/json" \
  -d '{"action":"cleanup_old_orders"}'
```

## Database Impact

- **Performance**: The deletion query uses an index on `created_at` for efficiency
- **Storage**: Automatically frees up database storage
- **Backup**: Ensure your backup strategy accounts for this automatic deletion

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. **No Orders Deleted**: Verify the cutoff date calculation (60 days)
3. **API Errors**: Check server logs for detailed error messages

### Testing

1. Create a test order with a past date
2. Verify it appears in the old orders count
3. Test the manual cleanup button
4. Verify the order is deleted

## Customization

### Change Retention Period

To change from 60 days to another period:

1. Update the database function in the migration file
2. Update the frontend calculation in `getDaysUntilDeletion()`
3. Update the API endpoint calculation
4. Update this documentation

### Add Notifications

Consider adding email/Slack notifications when orders are automatically deleted:

1. Modify the API endpoint to send notifications
2. Include order count and total value in notifications
3. Add admin email addresses to environment variables
