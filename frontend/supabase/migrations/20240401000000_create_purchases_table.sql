-- Create purchases table to store order and payment data
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_pincode TEXT,
    notes TEXT,
    items JSONB, -- Store cart items as JSON
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchases_razorpay_order_id ON purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_razorpay_payment_id ON purchases(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_order_status ON purchases(order_status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow admins to read all purchases
CREATE POLICY "Admins can read all purchases" ON purchases
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to insert purchases (for API calls)
CREATE POLICY "Admins can insert purchases" ON purchases
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update purchases
CREATE POLICY "Admins can update purchases" ON purchases
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow service role to manage purchases (for API calls)
CREATE POLICY "Service role can manage purchases" ON purchases
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_purchases_updated_at 
    BEFORE UPDATE ON purchases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE purchases IS 'Stores customer purchase orders and payment information';
COMMENT ON COLUMN purchases.razorpay_order_id IS 'Razorpay order ID from payment gateway';
COMMENT ON COLUMN purchases.razorpay_payment_id IS 'Razorpay payment ID from payment gateway';
COMMENT ON COLUMN purchases.items IS 'JSON array of purchased items with quantities and prices';
COMMENT ON COLUMN purchases.payment_status IS 'Current status of the payment (pending/completed/failed/refunded)';
COMMENT ON COLUMN purchases.order_status IS 'Current status of the order (pending/confirmed/shipped/delivered/cancelled)'; 