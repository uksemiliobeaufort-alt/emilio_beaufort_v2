-- Fix RLS policies for cosmetics table
DROP POLICY IF EXISTS "Anyone can read published cosmetics" ON cosmetics;
DROP POLICY IF EXISTS "Authenticated users can insert cosmetics" ON cosmetics;
DROP POLICY IF EXISTS "Authenticated users can update cosmetics" ON cosmetics;
DROP POLICY IF EXISTS "Authenticated users can delete cosmetics" ON cosmetics;

CREATE POLICY "Anyone can read published cosmetics" ON cosmetics FOR SELECT 
USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert cosmetics" ON cosmetics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cosmetics" ON cosmetics FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete cosmetics" ON cosmetics FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Fix RLS policies for hair_extensions table
DROP POLICY IF EXISTS "Anyone can read published hair_extensions" ON hair_extensions;
DROP POLICY IF EXISTS "Authenticated users can insert hair_extensions" ON hair_extensions;
DROP POLICY IF EXISTS "Authenticated users can update hair_extensions" ON hair_extensions;
DROP POLICY IF EXISTS "Authenticated users can delete hair_extensions" ON hair_extensions;

CREATE POLICY "Anyone can read published hair_extensions" ON hair_extensions FOR SELECT 
USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert hair_extensions" ON hair_extensions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update hair_extensions" ON hair_extensions FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete hair_extensions" ON hair_extensions FOR DELETE 
USING (auth.uid() IS NOT NULL); 