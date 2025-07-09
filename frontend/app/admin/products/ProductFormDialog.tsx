"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import BootstrapDropdown from '@/components/ui/BootstrapDropdown';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  ImageIcon, 
  Loader2,
  Star,
  Package,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { uploadProductImage, uploadMultipleImages, deleteProductImage } from '@/lib/supabase';
import { 
  createProduct, 
  updateProduct, 
  Product,
  isCosmeticsProduct,
  isHairExtensionsProduct
} from '@/lib/supabase';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  detailed_description: z.string().optional(),
  original_price: z.string().min(1, 'Original price is required'),
  price: z.string().optional(),
  category: z.enum(['cosmetics', 'hair-extension']),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  in_stock: z.boolean(),
  stock_quantity: z.string().optional(),
  sku: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  
  // Cosmetics specific fields
  ingredients: z.string().optional(),
  skin_type: z.string().optional(),
  product_benefits: z.string().optional(),
  spf_level: z.string().optional(),
  volume_size: z.string().optional(),
  dermatologist_tested: z.boolean().optional(),
  cruelty_free: z.boolean().optional(),
  organic_natural: z.boolean().optional(),
  
  // Hair extension specific fields
  hair_type: z.string().optional(),
  hair_texture: z.string().optional(),
  hair_length: z.string().optional(),
  hair_weight: z.string().optional(),
  hair_color_shade: z.string().optional(),
  installation_method: z.string().optional(),
  care_instructions: z.string().optional(),
  quantity_in_set: z.string().optional(),
  
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  selectedCategory?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryOptions = [
  { value: 'cosmetics', label: 'Cosmetics' },
  { value: 'hair-extension', label: 'Hair Extension' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const skinTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' },
  { value: 'all-types', label: 'All Skin Types' },
];

const hairTypeOptions = [
  { value: 'remy-human', label: 'Remy Human Hair' },
  { value: 'virgin-human', label: 'Virgin Human Hair' },
  { value: 'human-hair', label: 'Human Hair' },
  { value: 'synthetic', label: 'Synthetic Hair' },
  { value: 'heat-friendly-synthetic', label: 'Heat-Friendly Synthetic' },
];

const hairTextureOptions = [
  { value: 'straight', label: 'Straight' },
  { value: 'body-wave', label: 'Body Wave' },
  { value: 'loose-wave', label: 'Loose Wave' },
  { value: 'deep-wave', label: 'Deep Wave' },
  { value: 'curly', label: 'Curly' },
  { value: 'kinky-curly', label: 'Kinky Curly' },
];

const installationMethodOptions = [
  { value: 'clip-in', label: 'Clip-In' },
  { value: 'tape-in', label: 'Tape-In' },
  { value: 'sew-in', label: 'Sew-In' },
  { value: 'micro-ring', label: 'Micro Ring' },
  { value: 'fusion', label: 'Fusion/Keratin' },
  { value: 'halo', label: 'Halo' },
];

export default function ProductFormDialog({ open, product, selectedCategory, onClose, onSuccess }: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      detailed_description: '',
      original_price: '',
      price: '',
      category: 'cosmetics',
      status: 'draft',
      featured: false,
      in_stock: true,
      stock_quantity: '',
      sku: '',
      weight: '',
      dimensions: '',
      
      // Cosmetics fields
      ingredients: '',
      skin_type: '',
      product_benefits: '',
      spf_level: '',
      volume_size: '',
      dermatologist_tested: false,
      cruelty_free: false,
      organic_natural: false,
      
      // Hair extension fields
      hair_type: '',
      hair_texture: '',
      hair_length: '',
      hair_weight: '',
      hair_color_shade: '',
      installation_method: '',
      care_instructions: '',
      quantity_in_set: '',
      
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      const baseData = {
        name: product.name,
        description: product.description || '',
        detailed_description: product.detailed_description || '',
        original_price: product.original_price?.toString() || '',
        price: product.price?.toString() || '',
        category: product.category,
        status: product.status,
        featured: product.featured,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity?.toString() || '',
        sku: product.sku || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
        seo_keywords: product.seo_keywords?.join(', ') || '',
      };
        
      // Add category-specific fields
      if (isCosmeticsProduct(product)) {
        form.reset({
          ...baseData,
        // Cosmetics fields
        ingredients: product.ingredients || '',
        skin_type: product.skin_type || '',
        product_benefits: product.product_benefits || '',
        spf_level: product.spf_level || '',
        volume_size: product.volume_size || '',
        dermatologist_tested: product.dermatologist_tested || false,
        cruelty_free: product.cruelty_free || false,
        organic_natural: product.organic_natural || false,
          // Hair extension fields (empty)
          hair_type: '',
          hair_texture: '',
          hair_length: '',
          hair_weight: '',
          hair_color_shade: '',
          installation_method: '',
          care_instructions: '',
          quantity_in_set: '',
        });
      } else if (isHairExtensionsProduct(product)) {
        form.reset({
          ...baseData,
          // Cosmetics fields (empty)
          ingredients: '',
          skin_type: '',
          product_benefits: '',
          spf_level: '',
          volume_size: '',
          dermatologist_tested: false,
          cruelty_free: false,
          organic_natural: false,
        // Hair extension fields
        hair_type: product.hair_type || '',
        hair_texture: product.hair_texture || '',
        hair_length: product.hair_length || '',
        hair_weight: product.hair_weight || '',
        hair_color_shade: product.hair_color_shade || '',
        installation_method: product.installation_method || '',
        care_instructions: product.care_instructions || '',
        quantity_in_set: product.quantity_in_set || '',
        });
      }
      
      setMainImageUrl(product.main_image_url || '');
      setExistingGalleryUrls(product.gallery_urls || []);
      setGalleryUrls([]);
      setImagesToDelete([]);
    } else {
      form.reset({
        name: '',
        description: '',
        detailed_description: '',
        original_price: '',
        price: '',
        category: (selectedCategory as 'cosmetics' | 'hair-extension') || 'cosmetics',
        status: 'draft',
        featured: false,
        in_stock: true,
        stock_quantity: '',
        sku: '',
        weight: '',
        dimensions: '',
        
        // Cosmetics fields
        ingredients: '',
        skin_type: '',
        product_benefits: '',
        spf_level: '',
        volume_size: '',
        dermatologist_tested: false,
        cruelty_free: false,
        organic_natural: false,
        
        // Hair extension fields
        hair_type: '',
        hair_texture: '',
        hair_length: '',
        hair_weight: '',
        hair_color_shade: '',
        installation_method: '',
        care_instructions: '',
        quantity_in_set: '',
        
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
      });
      setMainImageUrl('');
      setExistingGalleryUrls([]);
      setGalleryUrls([]);
      setImagesToDelete([]);
    }
  }, [product, selectedCategory, form]);

  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadProductImage(file, form.getValues('category'));
        setMainImageUrl(url);
      } catch (error) {
        console.error('Error uploading main image:', error);
        toast.error('Failed to upload main image');
      }
    }
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      try {
        const urls = await uploadMultipleImages(files, form.getValues('category'));
        setGalleryUrls(prev => [...prev, ...urls]);
      } catch (error) {
        console.error('Error uploading gallery images:', error);
        toast.error('Failed to upload gallery images');
      }
    }
  };

  const removeGalleryImage = async (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageUrl = existingGalleryUrls[index];
      setImagesToDelete(prev => [...prev, imageUrl]);
      setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const imageUrl = galleryUrls[index];
      try {
        await deleteProductImage(imageUrl, form.getValues('category'));
        setGalleryUrls(prev => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting gallery image:', error);
        toast.error('Failed to delete gallery image');
      }
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    console.log('Starting form submission:', data);
    setIsSubmitting(true);
    try {
      const category = data.category as 'cosmetics' | 'hair-extension';
      console.log('Processing category:', category);
      
      // Base product data (common to both categories)
      let productData: any = {
        name: data.name,
        description: data.description,
        detailed_description: data.detailed_description,
        original_price: data.original_price ? parseFloat(data.original_price) : undefined, // Original price is now the main price
        price: data.price ? parseFloat(data.price) : null, // Discounted price (optional)
        category: data.category,
        status: data.status,
        featured: data.featured,
        in_stock: data.in_stock,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity) : null,
        sku: data.sku,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        dimensions: data.dimensions,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords ? data.seo_keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      };

      console.log('Base product data:', productData);

      // Add category-specific fields
      if (category === 'cosmetics') {
        console.log('Adding cosmetics-specific fields');
        productData = {
          ...productData,
          // Cosmetics-specific fields
          ingredients: data.ingredients,
          skin_type: data.skin_type,
          product_benefits: data.product_benefits,
          spf_level: data.spf_level,
          volume_size: data.volume_size,
          dermatologist_tested: data.dermatologist_tested,
          cruelty_free: data.cruelty_free,
          organic_natural: data.organic_natural,
        };
      } else if (category === 'hair-extension') {
        console.log('Adding hair extension-specific fields');
        productData = {
          ...productData,
          // Hair extension-specific fields
          hair_type: data.hair_type,
          hair_texture: data.hair_texture,
          hair_length: data.hair_length,
          hair_weight: data.hair_weight,
          hair_color_shade: data.hair_color_shade,
          installation_method: data.installation_method,
          care_instructions: data.care_instructions,
          quantity_in_set: data.quantity_in_set,
        };
      }

      // Include image URLs in product data
      if (mainImageUrl) {
        console.log('Adding main image URL:', mainImageUrl);
        productData.main_image_url = mainImageUrl;
      }

      // Combine existing and new gallery URLs
      const allGalleryUrls = [...existingGalleryUrls, ...galleryUrls];
      console.log('All gallery URLs:', allGalleryUrls);
      
      // Remove deleted images
      const finalGalleryUrls = allGalleryUrls.filter(url => !imagesToDelete.includes(url));
      console.log('Final gallery URLs:', finalGalleryUrls);
      
      if (finalGalleryUrls.length > 0) {
        productData.gallery_urls = finalGalleryUrls;
      }

      // Delete images marked for deletion
      if (imagesToDelete.length > 0) {
        console.log('Deleting images:', imagesToDelete);
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteProductImage(imageUrl, category);
            console.log('Successfully deleted image:', imageUrl);
          } catch (error) {
            console.error('Error deleting image:', imageUrl, error);
            // Continue with other deletions even if one fails
          }
        }
      }

      let savedProduct: Product;

      if (product) {
        console.log('Updating existing product:', product.id);
        // Update existing product
        savedProduct = await updateProduct(product.id, productData, category);
        console.log('Product updated successfully:', savedProduct);
      } else {
        console.log('Creating new product');
        // Create new product
        savedProduct = await createProduct(productData);
        console.log('Product created successfully:', savedProduct);
      }

      // toast.success(product ? 'Product updated successfully' : 'Product created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedCategory = form.watch('category');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Basic Information Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
                Basic Information
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium">Product Name *</FormLabel>
                      <FormControl>
                          <Input 
                            placeholder="Enter product name" 
                            className="h-11"
                            {...field} 
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium">SKU</FormLabel>
                      <FormControl>
                          <Input 
                            placeholder="Product SKU" 
                            className="h-11"
                            {...field} 
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-base font-medium">Short Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief product description" 
                          className="min-h-[80px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailed_description"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-base font-medium">Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed product description" 
                          className="min-h-[120px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>

            {/* Category and Status Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                Category & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Category *</FormLabel>
                      <FormControl>
                        <BootstrapDropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={categoryOptions}
                          placeholder="Select category"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Status *</FormLabel>
                      <FormControl>
                        <BootstrapDropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={statusOptions}
                          placeholder="Select status"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                    <FormItem className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                      field.value ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}>
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold cursor-pointer flex items-center gap-2">
                          <Star className={`h-5 w-5 ${field.value ? 'text-yellow-500' : 'text-gray-400'}`} />
                            Featured Product
                          </FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                            Show in featured section
                          </FormDescription>
                        </div>
                        <FormControl>
                        <div className="flex items-center space-x-3">
                            <span className={`text-sm font-medium ${field.value ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {field.value ? 'Featured' : 'Regular'}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-yellow-500"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                Pricing & Inventory
              </h3>
              
              <div className="space-y-6">
                {/* Original Price - Full Width */}
                <FormField
                  control={form.control}
                  name="original_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Original Price ($) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        The regular price of the product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discounted Price and Stock Quantity - Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                    name="price"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium">Discounted Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                            className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Sale price (leave empty if no discount)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-medium">Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                            className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                <FormField
                  control={form.control}
                  name="in_stock"
                  render={({ field }) => (
                    <FormItem className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                      field.value ? 'border-emerald-400 bg-emerald-50' : 'border-red-200 bg-red-50 hover:border-red-300'
                    }`}>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold cursor-pointer flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full ${field.value ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          Inventory Status
                        </FormLabel>
                        <FormDescription className="text-sm text-gray-500">
                          Product availability for customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-medium ${field.value ? 'text-emerald-600' : 'text-red-600'}`}>
                            {field.value ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={field.value ? "data-[state=checked]:bg-emerald-500" : "data-[state=unchecked]:bg-red-500"}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Product Details Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                Product Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Weight (oz)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Dimensions</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="L × W × H" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </div>

                          {/* Category-Specific Fields */}
            {watchedCategory === 'cosmetics' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-pink-600" />
                  </div>
                      Cosmetics Information
                    </h3>
                    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="skin_type"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Skin Type</FormLabel>
                                                  <FormControl>
                        <BootstrapDropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={skinTypeOptions}
                          placeholder="Select skin type"
                          className="h-11"
                        />
                      </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="volume_size"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Volume/Size</FormLabel>
                            <FormControl>
                          <Input placeholder="e.g., 50ml, 1.7 fl oz" className="h-11" {...field} />
                            </FormControl>
                            <FormDescription>
                              Product volume or size
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="spf_level"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">SPF Level</FormLabel>
                            <FormControl>
                          <Input placeholder="e.g., SPF 30, SPF 50+" className="h-11" {...field} />
                            </FormControl>
                            <FormDescription>
                              Sun protection factor (if applicable)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="ingredients"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Ingredients (INCI Names)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List ingredients using INCI names, separated by commas"
                            className="min-h-[100px] resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Use International Nomenclature of Cosmetic Ingredients (INCI) names
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="product_benefits"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Product Benefits</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="e.g., Anti-aging, Moisturizing, Brightening, Acne-fighting"
                            className="min-h-[100px] resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Key benefits and claims
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="dermatologist_tested"
                        render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                        field.value ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold cursor-pointer">
                                Dermatologist Tested
                              </FormLabel>
                          <FormDescription className="text-sm text-gray-500">
                                Tested by dermatologists
                              </FormDescription>
                            </div>
                            <FormControl>
                          <div className="flex items-center space-x-3">
                                <span className={`text-sm font-medium ${field.value ? 'text-green-600' : 'text-gray-500'}`}>
                                  {field.value ? 'Yes' : 'No'}
                                </span>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-green-500"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cruelty_free"
                        render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                        field.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold cursor-pointer">
                                Cruelty Free
                              </FormLabel>
                          <FormDescription className="text-sm text-gray-500">
                                Not tested on animals
                              </FormDescription>
                            </div>
                            <FormControl>
                          <div className="flex items-center space-x-3">
                                <span className={`text-sm font-medium ${field.value ? 'text-blue-600' : 'text-gray-500'}`}>
                                  {field.value ? 'Yes' : 'No'}
                                </span>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-500"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organic_natural"
                        render={({ field }) => (
                      <FormItem className={`flex flex-row items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 ${
                        field.value ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold cursor-pointer">
                                Organic/Natural
                              </FormLabel>
                          <FormDescription className="text-sm text-gray-500">
                                Made with organic/natural ingredients
                              </FormDescription>
                            </div>
                            <FormControl>
                          <div className="flex items-center space-x-3">
                                <span className={`text-sm font-medium ${field.value ? 'text-purple-600' : 'text-gray-500'}`}>
                                  {field.value ? 'Yes' : 'No'}
                                </span>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-purple-500"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                  </div>
                </div>
              )}

              {watchedCategory === 'hair-extension' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                      Hair Extension Information
                    </h3>
                    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="hair_type"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Hair Type</FormLabel>
                                                  <FormControl>
                        <BootstrapDropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={hairTypeOptions}
                          placeholder="Select hair type"
                          className="h-11"
                        />
                      </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_texture"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Hair Texture</FormLabel>
                                                  <FormControl>
                        <BootstrapDropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={hairTextureOptions}
                          placeholder="Select hair texture"
                          className="h-11"
                        />
                      </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_length"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Hair Length</FormLabel>
                            <FormControl>
                          <Input placeholder="e.g., 18 inches, 45cm" className="h-11" {...field} />
                            </FormControl>
                            <FormDescription>
                              Length in inches or centimeters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_weight"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Hair Weight</FormLabel>
                            <FormControl>
                          <Input placeholder="e.g., 100g, 120g per set" className="h-11" {...field} />
                            </FormControl>
                            <FormDescription>
                              Weight in grams
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_color_shade"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Hair Color/Shade</FormLabel>
                            <FormControl>
                          <Input placeholder="e.g., #2 Dark Brown, #613 Blonde" className="h-11" {...field} />
                            </FormControl>
                            <FormDescription>
                              Color number or shade name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="installation_method"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Installation Method</FormLabel>
                                                  <FormControl>
                        <BootstrapDropdown
                          value={field.value}
                          onChange={field.onChange}
                          options={installationMethodOptions}
                          placeholder="Select installation method"
                          className="h-11"
                        />
                      </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity_in_set"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Quantity in Set</FormLabel>
                            <FormControl>
                          <Input placeholder="e.g., 7 pieces, 20 strands" className="h-11" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of pieces or strands
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="care_instructions"
                        render={({ field }) => (
                          <FormItem>
                        <FormLabel className="text-base font-medium">Care Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Washing, styling, and maintenance instructions"
                            className="min-h-[100px] resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              How to care for and maintain the extensions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </div>
              )}

            {/* Images Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-indigo-600" />
            </div>
                Product Images
              </h3>
              
              <div className="space-y-8">
              {/* Main Image */}
              <div>
                  <FormLabel className="text-base font-medium">Main Product Image</FormLabel>
                  <div className="mt-4">
                                        {mainImageUrl ? (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={mainImageUrl}
                          alt="Main product"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                          onClick={async () => {
                            try {
                              await deleteProductImage(mainImageUrl, form.getValues('category'));
                              setMainImageUrl('');
                            } catch (error) {
                              console.error('Error deleting main image:', error);
                              toast.error('Failed to delete main image');
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 transition-colors">
                        <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <div className="space-y-2">
                        <label htmlFor="main-image" className="cursor-pointer">
                            <span className="text-base font-medium text-blue-600 hover:text-blue-500">
                            Upload main image
                          </span>
                          <input
                            id="main-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleMainImageSelect}
                          />
                        </label>
                          <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                  <FormLabel className="text-base font-medium">Gallery Images</FormLabel>
                  <div className="mt-4">
                  <div className="flex flex-wrap gap-4">
                    {/* Existing images */}
                                          {existingGalleryUrls.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
                          onClick={() => removeGalleryImage(index, true)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* New images */}
                    {galleryUrls.map((imageUrl, index) => (
                      <div key={`new-${index}`} className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={imageUrl}
                          alt={`New gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
                          onClick={() => removeGalleryImage(index, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Add new images */}
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                        <label htmlFor="gallery-images" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Add More</span>
                        <input
                          id="gallery-images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGallerySelect}
                        />
                      </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-6 text-gray-800">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                </div>
                SEO Options
              </h3>
              
              <div className="space-y-6">
              <FormField
                control={form.control}
                name="seo_title"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-base font-medium">SEO Title</FormLabel>
                    <FormControl>
                        <Input placeholder="SEO optimized title" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seo_description"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-base font-medium">SEO Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="SEO meta description" 
                          className="min-h-[100px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seo_keywords"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-base font-medium">SEO Keywords</FormLabel>
                    <FormControl>
                        <Input placeholder="keyword1, keyword2, keyword3" className="h-11" {...field} />
                    </FormControl>
                      <FormDescription className="text-sm text-gray-500">
                        Separate keywords with commas
                      </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Ready to {product ? 'update' : 'create'} this product?</p>
                  <p className="text-xs">Make sure all information is accurate before saving.</p>
                </div>
                <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                    className="min-w-[100px]"
              >
                Cancel
              </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
                  >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        {product ? 'Update Product' : 'Create Product'}
                      </>
                )}
              </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 