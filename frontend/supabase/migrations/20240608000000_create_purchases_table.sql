-- Create purchases table for order tracking and analytics
CREATE TABLE purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_order_id text,
    razorpay_payment_id text,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    notes text,
    items jsonb NOT NULL,
    total numeric NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by Razorpay order/payment id
CREATE INDEX idx_purchases_razorpay_order_id ON purchases(razorpay_order_id);
CREATE INDEX idx_purchases_razorpay_payment_id ON purchases(razorpay_payment_id); 