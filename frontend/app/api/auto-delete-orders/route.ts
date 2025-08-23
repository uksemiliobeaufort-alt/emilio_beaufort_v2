import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('Auto-delete orders API called');
    
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
      return NextResponse.json({ 
        error: 'Service role key not configured. Please check environment variables.',
      }, { status: 500 });
    }

    const { action } = await request.json();
    console.log('Action received:', action);

    if (action === 'cleanup_old_orders') {
      // Calculate date 60 days ago
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      console.log('Looking for orders older than:', sixtyDaysAgo.toISOString());

      // Query for orders that are older than 60 days
      const { data: oldOrders, error: queryError } = await supabase
        .from('purchases')
        .select('id, created_at, customer_name, customer_email')
        .lt('created_at', sixtyDaysAgo.toISOString());

      if (queryError) {
        console.error('Error querying old orders:', queryError);
        return NextResponse.json({ 
          error: 'Failed to query old orders',
          details: queryError.message
        }, { status: 500 });
      }

      if (!oldOrders || oldOrders.length === 0) {
        return NextResponse.json({ 
          message: 'No orders older than 60 days found',
          deletedCount: 0 
        });
      }

      console.log(`Found ${oldOrders.length} orders to delete`);

      // Delete old orders
      const { error: deleteError } = await supabase
        .from('purchases')
        .delete()
        .lt('created_at', sixtyDaysAgo.toISOString());

      if (deleteError) {
        console.error('Error deleting old orders:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete old orders',
          details: deleteError.message
        }, { status: 500 });
      }

      console.log(`Successfully deleted ${oldOrders.length} old orders`);

      return NextResponse.json({ 
        message: `Successfully deleted ${oldOrders.length} orders older than 60 days`,
        deletedCount: oldOrders.length,
        deletedOrders: oldOrders
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in auto-delete orders:', error);
    return NextResponse.json({ 
      error: 'Failed to process auto-deletion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check how many orders would be deleted
export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Service role key not configured',
      }, { status: 500 });
    }

    // Calculate date 60 days ago
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Query for orders that are older than 60 days (read-only)
    const { data: oldOrders, error: queryError } = await supabase
      .from('purchases')
      .select('id, created_at, customer_name, customer_email, total_amount')
      .lt('created_at', sixtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (queryError) {
      return NextResponse.json({ 
        error: 'Failed to query old orders',
        details: queryError.message
      }, { status: 500 });
    }

    const totalValue = oldOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    return NextResponse.json({
      oldOrdersCount: oldOrders?.length || 0,
      cutoffDate: sixtyDaysAgo.toISOString(),
      totalValue: totalValue,
      orders: oldOrders || []
    });
  } catch (error) {
    console.error('Error checking old orders:', error);
    return NextResponse.json({ 
      error: 'Failed to check old orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
