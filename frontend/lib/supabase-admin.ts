import { createClient } from '@supabase/supabase-js';

// Admin client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin configuration');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin-specific database operations
export const adminOperations = {
  // Create product with admin privileges
  createProduct: async (productData: any) => {
    const { category, ...allData } = productData;
    const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    
    // Filter fields based on table
    let filteredData: any;

    if (category === 'cosmetics') {
      // Only include fields that exist in cosmetics table
      filteredData = {
        name: allData.name,
        description: allData.description,
        detailed_description: allData.detailed_description,
        price: allData.price,
        original_price: allData.original_price,
        status: allData.status,
        featured: allData.featured,
        in_stock: allData.in_stock,
        stock_quantity: allData.stock_quantity,
        sku: allData.sku,
        weight: allData.weight,
        dimensions: allData.dimensions,
        main_image_url: allData.main_image_url,
        gallery_images: allData.gallery_images,
        main_image_base64: allData.main_image_base64,
        gallery_base64: allData.gallery_base64,
        seo_title: allData.seo_title,
        seo_description: allData.seo_description,
        seo_keywords: allData.seo_keywords,
        metadata: allData.metadata,
        created_by: allData.created_by,
        updated_by: allData.updated_by,
        // Cosmetics-specific fields
        ingredients: allData.ingredients,
        skin_type: allData.skin_type,
        product_benefits: allData.product_benefits,
        spf_level: allData.spf_level,
        volume_size: allData.volume_size,
        dermatologist_tested: allData.dermatologist_tested,
        cruelty_free: allData.cruelty_free,
        organic_natural: allData.organic_natural,
      };
    } else {
      // Only include fields that exist in hair_extensions table
      filteredData = {
        name: allData.name,
        description: allData.description,
        detailed_description: allData.detailed_description,
        price: allData.price,
        original_price: allData.original_price,
        status: allData.status,
        featured: allData.featured,
        in_stock: allData.in_stock,
        stock_quantity: allData.stock_quantity,
        sku: allData.sku,
        weight: allData.weight,
        dimensions: allData.dimensions,
        main_image_url: allData.main_image_url,
        gallery_images: allData.gallery_images,
        main_image_base64: allData.main_image_base64,
        gallery_base64: allData.gallery_base64,
        seo_title: allData.seo_title,
        seo_description: allData.seo_description,
        seo_keywords: allData.seo_keywords,
        metadata: allData.metadata,
        created_by: allData.created_by,
        updated_by: allData.updated_by,
        // Hair extension-specific fields
        hair_type: allData.hair_type,
        hair_texture: allData.hair_texture,
        hair_length: allData.hair_length,
        hair_weight: allData.hair_weight,
        hair_color_shade: allData.hair_color_shade,
        installation_method: allData.installation_method,
        care_instructions: allData.care_instructions,
        quantity_in_set: allData.quantity_in_set,
      };
    }

    // Remove undefined values
    Object.keys(filteredData).forEach(key => {
      if (filteredData[key] === undefined) {
        delete filteredData[key];
      }
    });
    
    const { data: result, error } = await supabaseAdmin
      .from(tableName)
      .insert(filteredData)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Update product with admin privileges
  updateProduct: async (id: string, productData: any, category: 'cosmetics' | 'hair-extension') => {
    console.log('Admin: Starting product update:', { id, category });
    console.log('Admin: Original update data:', productData);
    
    const { category: _, ...allData } = productData;
    const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    console.log('Admin: Using table:', tableName);
    
    // Filter fields based on table
    let filteredData: any;

    if (category === 'cosmetics') {
      console.log('Admin: Processing cosmetics product');
      // Only include fields that exist in cosmetics table
      filteredData = {
        name: allData.name,
        description: allData.description,
        detailed_description: allData.detailed_description,
        price: allData.price,
        original_price: allData.original_price,
        status: allData.status,
        featured: allData.featured,
        in_stock: allData.in_stock,
        stock_quantity: allData.stock_quantity,
        sku: allData.sku,
        weight: allData.weight,
        dimensions: allData.dimensions,
        main_image_url: allData.main_image_url,
        gallery_urls: allData.gallery_urls,
        seo_title: allData.seo_title,
        seo_description: allData.seo_description,
        seo_keywords: allData.seo_keywords,
        metadata: allData.metadata,
        created_by: allData.created_by,
        updated_by: allData.updated_by,
        // Cosmetics-specific fields
        ingredients: allData.ingredients,
        skin_type: allData.skin_type,
        product_benefits: allData.product_benefits,
        spf_level: allData.spf_level,
        volume_size: allData.volume_size,
        dermatologist_tested: allData.dermatologist_tested,
        cruelty_free: allData.cruelty_free,
        organic_natural: allData.organic_natural,
      };
    } else {
      console.log('Admin: Processing hair extension product');
      // Only include fields that exist in hair_extensions table
      filteredData = {
        name: allData.name,
        description: allData.description,
        detailed_description: allData.detailed_description,
        price: allData.price,
        original_price: allData.original_price,
        status: allData.status,
        featured: allData.featured,
        in_stock: allData.in_stock,
        stock_quantity: allData.stock_quantity,
        sku: allData.sku,
        weight: allData.weight,
        dimensions: allData.dimensions,
        main_image_url: allData.main_image_url,
        gallery_urls: allData.gallery_urls,
        seo_title: allData.seo_title,
        seo_description: allData.seo_description,
        seo_keywords: allData.seo_keywords,
        metadata: allData.metadata,
        created_by: allData.created_by,
        updated_by: allData.updated_by,
        // Hair extension-specific fields
        hair_type: allData.hair_type,
        hair_texture: allData.hair_texture,
        hair_length: allData.hair_length,
        hair_weight: allData.hair_weight,
        hair_color_shade: allData.hair_color_shade,
        installation_method: allData.installation_method,
        care_instructions: allData.care_instructions,
        quantity_in_set: allData.quantity_in_set,
      };
    }

    // Remove undefined values
    Object.keys(filteredData).forEach(key => {
      if (filteredData[key] === undefined) {
        delete filteredData[key];
      }
    });
    
    console.log('Admin: Filtered data:', filteredData);
    
    try {
      console.log('Admin: Executing Supabase update...');
      const { data: result, error } = await supabaseAdmin
        .from(tableName)
        .update(filteredData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Admin: Supabase update error:', error);
        console.error('Admin: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Admin: Update successful:', result);
      return result;
    } catch (error) {
      console.error('Admin: Error during update:', error);
      throw error;
    }
  },

  // Delete product with admin privileges
  deleteProduct: async (id: string, category: 'cosmetics' | 'hair-extension') => {
    const tableName = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    
    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get all products with admin privileges
  getProducts: async () => {
    console.log('Admin: Starting getProducts...');
    try {
      console.log('Admin: Fetching cosmetics...');
      const [cosmeticsResult, hairExtensionsResult] = await Promise.all([
        supabaseAdmin.from('cosmetics').select('*'),
        supabaseAdmin.from('hair_extensions').select('*')
      ]);

      if (cosmeticsResult.error) {
        console.error('Admin: Error fetching cosmetics:', cosmeticsResult.error);
        throw cosmeticsResult.error;
      }
      if (hairExtensionsResult.error) {
        console.error('Admin: Error fetching hair extensions:', hairExtensionsResult.error);
        throw hairExtensionsResult.error;
      }

      console.log('Admin: Successfully fetched cosmetics:', cosmeticsResult.data.length);
      console.log('Admin: Successfully fetched hair extensions:', hairExtensionsResult.data.length);

      const cosmetics = cosmeticsResult.data.map(item => ({ ...item, category: 'cosmetics' }));
      const hairExtensions = hairExtensionsResult.data.map(item => ({ ...item, category: 'hair-extension' }));

      const allProducts = [...cosmetics, ...hairExtensions];
      console.log('Admin: Total products combined:', allProducts.length);

      return allProducts;
    } catch (error) {
      console.error('Admin: Error in getProducts:', error);
      throw error;
    }
  }
}; 