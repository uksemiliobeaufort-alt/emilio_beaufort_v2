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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { 
  createProduct, 
  updateProduct, 
  uploadProductImage, 
  deleteProductImage,
  Product 
} from '@/lib/supabase';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  detailed_description: z.string().optional(),
  price: z.string().transform((val) => val ? parseFloat(val) : undefined),
  original_price: z.string().transform((val) => val ? parseFloat(val) : undefined),
  category: z.enum(['cosmetics', 'hair-extension']),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  in_stock: z.boolean(),
  stock_quantity: z.string().transform((val) => val ? parseInt(val) : 0),
  sku: z.string().optional(),
  weight: z.string().transform((val) => val ? parseFloat(val) : undefined),
  dimensions: z.string().optional(),
  
  // Cosmetics specific fields
  ingredients: z.string().optional(),
  skin_type: z.string().optional(),
  product_benefits: z.string().optional(),
  application_instructions: z.string().optional(),
  spf_level: z.string().optional(),
  fragrance_notes: z.string().optional(),
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
  hair_grade: z.string().optional(),
  hair_origin: z.string().optional(),
  care_instructions: z.string().optional(),
  quantity_in_set: z.string().optional(),
  attachment_type: z.string().optional(),
  
  usage_instructions: z.string().optional(),
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
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      detailed_description: '',
      price: '',
      original_price: '',
      category: 'cosmetics',
      status: 'draft',
      featured: false,
      in_stock: true,
      stock_quantity: '0',
      sku: '',
      weight: '',
      dimensions: '',
      
      // Cosmetics fields
      ingredients: '',
      skin_type: '',
      product_benefits: '',
      application_instructions: '',
      spf_level: '',
      fragrance_notes: '',
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
      hair_grade: '',
      hair_origin: '',
      care_instructions: '',
      quantity_in_set: '',
      attachment_type: '',
      
      usage_instructions: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        detailed_description: product.detailed_description || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        category: product.category as any,
        status: product.status,
        featured: product.featured,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity?.toString() || '0',
        sku: product.sku || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        
        // Cosmetics fields
        ingredients: product.ingredients || '',
        skin_type: product.skin_type || '',
        product_benefits: product.product_benefits || '',
        application_instructions: product.application_instructions || '',
        spf_level: product.spf_level || '',
        fragrance_notes: product.fragrance_notes || '',
        volume_size: product.volume_size || '',
        dermatologist_tested: product.dermatologist_tested || false,
        cruelty_free: product.cruelty_free || false,
        organic_natural: product.organic_natural || false,
        
        // Hair extension fields
        hair_type: product.hair_type || '',
        hair_texture: product.hair_texture || '',
        hair_length: product.hair_length || '',
        hair_weight: product.hair_weight || '',
        hair_color_shade: product.hair_color_shade || '',
        installation_method: product.installation_method || '',
        hair_grade: product.hair_grade || '',
        hair_origin: product.hair_origin || '',
        care_instructions: product.care_instructions || '',
        quantity_in_set: product.quantity_in_set || '',
        attachment_type: product.attachment_type || '',
        
        usage_instructions: product.usage_instructions || '',
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
        seo_keywords: product.seo_keywords?.join(', ') || '',
      });
      
      setMainImagePreview(product.main_image_url || '');
      setExistingGalleryImages(product.gallery_images || []);
      setGalleryPreviews([]);
      setGalleryFiles([]);
      setImagesToDelete([]);
    } else {
      form.reset({
        name: '',
        description: '',
        detailed_description: '',
        price: '',
        original_price: '',
        category: (selectedCategory as 'cosmetics' | 'hair-extension') || 'cosmetics',
        status: 'draft',
        featured: false,
        in_stock: true,
        stock_quantity: '0',
        sku: '',
        weight: '',
        dimensions: '',
        
        // Cosmetics fields
        ingredients: '',
        skin_type: '',
        product_benefits: '',
        application_instructions: '',
        spf_level: '',
        fragrance_notes: '',
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
        hair_grade: '',
        hair_origin: '',
        care_instructions: '',
        quantity_in_set: '',
        attachment_type: '',
        
        usage_instructions: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
      });
      setMainImagePreview('');
      setExistingGalleryImages([]);
      setGalleryPreviews([]);
      setGalleryFiles([]);
      setImagesToDelete([]);
    }
    setMainImageFile(null);
  }, [product, selectedCategory, form]);

  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageUrl = existingGalleryImages[index];
      setImagesToDelete(prev => [...prev, imageUrl]);
      setExistingGalleryImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setGalleryFiles(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      let productData: any = {
        ...data,
        seo_keywords: data.seo_keywords ? data.seo_keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      };

      let savedProduct: Product;

      if (product) {
        // Update existing product
        savedProduct = await updateProduct(product.id, productData);
      } else {
        // Create new product
        savedProduct = await createProduct(productData);
      }

      // Handle main image upload
      if (mainImageFile) {
        const mainImageUrl = await uploadProductImage(mainImageFile, savedProduct.id, 'main');
        await updateProduct(savedProduct.id, { main_image_url: mainImageUrl });
        
        // Delete old main image if it exists and is different
        if (product?.main_image_url && product.main_image_url !== mainImageUrl) {
          try {
            await deleteProductImage(product.main_image_url);
          } catch (error) {
            console.warn('Could not delete old main image:', error);
          }
        }
      }

      // Handle gallery images
      let newGalleryUrls: string[] = [...existingGalleryImages];

      // Upload new gallery images
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => 
          uploadProductImage(file, savedProduct.id, 'gallery')
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        newGalleryUrls = [...newGalleryUrls, ...uploadedUrls];
      }

      // Delete marked images
      if (imagesToDelete.length > 0) {
        const deletePromises = imagesToDelete.map(url => deleteProductImage(url));
        await Promise.all(deletePromises);
      }

      // Update product with new gallery images
      if (galleryFiles.length > 0 || imagesToDelete.length > 0) {
        await updateProduct(savedProduct.id, { gallery_images: newGalleryUrls });
      }

      toast.success(product ? 'Product updated successfully' : 'Product created successfully');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
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
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Product SKU" {...field} />
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
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief product description" 
                        rows={3}
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
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed product description" 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Category & Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all duration-200 ${
                        field.value ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}>
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold cursor-pointer flex items-center gap-2">
                            <Star className={`h-4 w-4 ${field.value ? 'text-yellow-500' : 'text-gray-400'}`} />
                            Featured Product
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Show in featured section
                          </FormDescription>
                        </div>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${field.value ? 'text-yellow-600' : 'text-gray-500'}`}>
                              {field.value ? 'Featured' : 'Regular'}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-yellow-600"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing & Inventory
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="original_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>For sale pricing</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="in_stock"
                  render={({ field }) => (
                    <FormItem className={`flex items-center justify-between rounded-lg border-2 p-4 transition-all duration-200 ${
                      field.value ? 'border-emerald-500 bg-emerald-50' : 'border-red-200 bg-red-50 hover:border-red-300'
                    }`}>
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold cursor-pointer flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${field.value ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          Inventory Status
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Product availability for customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${field.value ? 'text-emerald-600' : 'text-red-600'}`}>
                            {field.value ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={field.value ? "data-[state=checked]:bg-emerald-600" : "data-[state=unchecked]:bg-red-500"}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (oz)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
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
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input placeholder="L × W × H" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                          {/* Category-Specific Fields */}
            {watchedCategory === 'cosmetics' && (
                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-500" />
                      Cosmetics Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="skin_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skin Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select skin type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {skinTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="volume_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume/Size</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 50ml, 1.7 fl oz" {...field} />
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
                            <FormLabel>SPF Level</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., SPF 30, SPF 50+" {...field} />
                            </FormControl>
                            <FormDescription>
                              Sun protection factor (if applicable)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fragrance_notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fragrance Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Floral, Citrus, Unscented" {...field} />
                            </FormControl>
                            <FormDescription>
                              Scent profile or fragrance-free
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="ingredients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingredients (INCI Names)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List ingredients using INCI names, separated by commas"
                                className="min-h-[100px]"
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

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="product_benefits"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Benefits</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="e.g., Anti-aging, Moisturizing, Brightening, Acne-fighting"
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

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="application_instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How to apply the product for best results"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="dermatologist_tested"
                        render={({ field }) => (
                          <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-200 ${
                            field.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold cursor-pointer">
                                Dermatologist Tested
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Tested by dermatologists
                              </FormDescription>
                            </div>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${field.value ? 'text-green-600' : 'text-gray-500'}`}>
                                  {field.value ? 'Yes' : 'No'}
                                </span>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-green-600"
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
                          <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-200 ${
                            field.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold cursor-pointer">
                                Cruelty Free
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Not tested on animals
                              </FormDescription>
                            </div>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${field.value ? 'text-blue-600' : 'text-gray-500'}`}>
                                  {field.value ? 'Yes' : 'No'}
                                </span>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
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
                          <FormItem className={`flex flex-row items-center justify-between rounded-lg border-2 p-4 transition-all duration-200 ${
                            field.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}>
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold cursor-pointer">
                                Organic/Natural
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Made with organic/natural ingredients
                              </FormDescription>
                            </div>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${field.value ? 'text-purple-600' : 'text-gray-500'}`}>
                                  {field.value ? 'Yes' : 'No'}
                                </span>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-600"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {watchedCategory === 'hair-extension' && (
                <div className="space-y-6">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-amber-500" />
                      Hair Extension Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hair_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hair type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hairTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_texture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Texture</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hair texture" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hairTextureOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Length</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 18 inches, 45cm" {...field} />
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
                            <FormLabel>Hair Weight</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 100g, 120g per set" {...field} />
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
                            <FormLabel>Hair Color/Shade</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., #2 Dark Brown, #613 Blonde" {...field} />
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
                            <FormLabel>Installation Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select installation method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {installationMethodOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Grade</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 6A, 8A, Remy Grade" {...field} />
                            </FormControl>
                            <FormDescription>
                              Quality grade or classification
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hair_origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Origin</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Brazilian, Indian, European" {...field} />
                            </FormControl>
                            <FormDescription>
                              Geographic origin of the hair
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity_in_set"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity in Set</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 7 pieces, 20 strands" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of pieces or strands
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attachment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attachment Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Clips, Tape, Micro-rings" {...field} />
                            </FormControl>
                            <FormDescription>
                              How the extensions attach
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="care_instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Care Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Washing, styling, and maintenance instructions"
                                className="min-h-[100px]"
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
                </div>
              )}

            {/* Common Fields - Usage Instructions */}
            <div className="border-t pt-6">
              <FormField
                control={form.control}
                name="usage_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="General usage and safety instructions" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Product Images
              </h3>
              
              {/* Main Image */}
              <div>
                <FormLabel>Main Product Image</FormLabel>
                <div className="mt-2">
                  {mainImagePreview ? (
                    <div className="relative w-32 h-32">
                      <img
                        src={mainImagePreview}
                        alt="Main product"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => {
                          setMainImagePreview('');
                          setMainImageFile(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="main-image" className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-500">
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
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <FormLabel>Gallery Images</FormLabel>
                <div className="mt-2 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    {/* Existing images */}
                    {existingGalleryImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative w-24 h-24">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeGalleryImage(index, true)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* New images */}
                    {galleryPreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative w-24 h-24">
                        <img
                          src={preview}
                          alt={`New gallery ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeGalleryImage(index, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Add new images */}
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <label htmlFor="gallery-images" className="cursor-pointer">
                        <Upload className="h-6 w-6 text-gray-400" />
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

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Options</h3>
              
              <FormField
                control={form.control}
                name="seo_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input placeholder="SEO optimized title" {...field} />
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
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="SEO meta description" 
                        rows={3}
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
                    <FormLabel>SEO Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                    </FormControl>
                    <FormDescription>Separate keywords with commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 