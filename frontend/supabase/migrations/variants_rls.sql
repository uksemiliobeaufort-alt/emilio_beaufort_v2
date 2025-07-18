-- 1. INSERT Policy
CREATE POLICY "Allow insert for authenticated users"
  ON public.variants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. SELECT Policy
CREATE POLICY "Allow select for authenticated users"
  ON public.variants
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 3. UPDATE Policy
CREATE POLICY "Allow update for authenticated users"
  ON public.variants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. DELETE Policy
CREATE POLICY "Allow delete for authenticated users"
  ON public.variants
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
