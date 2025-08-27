-- Update purchases.order_status to use placed/shipped/delivered/cancelled with default placed
ALTER TABLE purchases
  ALTER COLUMN order_status SET DEFAULT 'placed';

-- Relax check or update it if exists; recreate constraint for allowed values
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'purchases'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%order_status%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE purchases DROP CONSTRAINT %I', constraint_name);
  END IF;

  EXECUTE 'ALTER TABLE purchases
    ADD CONSTRAINT purchases_order_status_check
    CHECK (order_status IN (''placed'', ''shipped'', ''delivered'', ''cancelled''))';
END $$;

COMMENT ON COLUMN purchases.order_status IS 'Order tracking status: placed, shipped, delivered, cancelled';

