"use client";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from 'uuid';
import TextField from '@mui/material/TextField';

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
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  Sparkles,
  Waves
} from 'lucide-react';
import { uploadProductImage, uploadMultipleImages, deleteProductImage, } from '@/lib/supabase';
import { 
  createProduct, 
  updateProduct, 
  // Product, // Removed Product import
  
} from '@/lib/supabase';
import { toast } from 'sonner';
import { Resolver } from 'react-hook-form';

// Define Variant type locally if not imported from supabase
interface Variant {
  id: string;
  product_id: string;
  weight: number;
  length: number;
  price: number;
  discount_price: number | null;
}

// Use ProductFormData for form, defaultValues, and all form logic
// Only use Product type for backend data
type ProductFormData = {
  name: string;
  description?: string;
  detailed_description?: string;
  original_price: string;
  price?: string;
  category: 'cosmetics' | 'hair-extension';
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  in_stock: boolean;
  stock_quantity?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  
  // Cosmetics specific fields
  ingredients?: string;
  skin_type?: string;
  product_benefits?: string;
  spf_level?: string;
  volume_size?: string;
  dermatologist_tested?: boolean;
  cruelty_free?: boolean;
  organic_natural?: boolean;
  
  // Hair extension specific fields
  hair_type?: string;
  hair_texture?: string;
  hair_length?: string;
  hair_weight?: string;
  hair_color?: string;
  hair_color_shade?: string;
  installation_method?: string;
  care_instructions?: string;
  quantity_in_set?: string;
  
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  // Add these for image and id support
  main_image_url?: string;
  gallery_urls?: string[];
  id?: string;
};

function isCosmeticsProduct(product: ProductFormData): product is ProductFormData {
  return product.category === 'cosmetics';
}
function isHairExtensionsProduct(product: ProductFormData): product is ProductFormData {
  return product.category === 'hair-extension';
}

interface ProductFormDialogProps {
  open: boolean;
  product: ProductFormData | null;
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

// Add color options for hair extensions
const hairColorOptions = [
  { value: 'natural_black', label: 'Natural Black' },
  { value: 'dark_brown', label: 'Dark Brown' },
  { value: 'ombre', label: 'Ombre' },
  { value: 'light_brown', label: 'Light Brown' },
  { value: 'highlight_27', label: 'Highlight #27' },
  { value: 'burgundy', label: 'Burgundy' },
];

// Add a color swatch map for hair colors
const hairColorSwatchMap: Record<string, string> = {
  natural_black: '#232323',
  dark_brown: '#4B2E19',
  ombre: 'linear-gradient(90deg, #232323 0%, #FFD700 100%)', // example gradient
  light_brown: '#A0522D',
  highlight_27: '#E2B369',
  burgundy: '#800020',
};

export default function ProductFormDialog({ open, product, selectedCategory, onClose, onSuccess }: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(z.object({
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
      hair_color: z.string().optional(),
      hair_color_shade: z.string().optional(),
      installation_method: z.string().optional(),
      care_instructions: z.string().optional(),
      quantity_in_set: z.string().optional(),
      
      seo_title: z.string().optional(),
      seo_description: z.string().optional(),
      seo_keywords: z.string().optional(),
    })) as Resolver<ProductFormData, any>,
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

  const [variants, setVariants] = useState<Variant[]>([
    {
      id: uuidv4(),
      product_id: '',
      weight: 0,
      length: 0,
      price: 0,
      discount_price: 0,
    },
  ]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value === '' ? 0 : Number(value) };
    setVariants(updated);
  };

  const addNewVariant = () => {
    setVariants([
      ...variants,
      {
        id: uuidv4(),
        weight: 0,
        length: 0,
        price: 0,
        discount_price: 0,
        product_id: '',
      },
    ]);
  };

  const removeVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant.id);
    form.setValue('hair_weight', String(variant.weight));
    form.setValue('hair_length', String(variant.length));
    form.setValue('original_price', String(variant.price));
  };

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      const typedProduct = product as ProductFormData;
      const baseData = {
        name: typedProduct.name,
        description: typedProduct.description || '',
        detailed_description: typedProduct.detailed_description || '',
        original_price: typedProduct.original_price || '',
        price: typedProduct.price || '',
        category: typedProduct.category,
        status: typedProduct.status,
        featured: typedProduct.featured,
        in_stock: typedProduct.in_stock,
        stock_quantity: typedProduct.stock_quantity || '',
        sku: typedProduct.sku || '',
        weight: typedProduct.weight || '',
        dimensions: typedProduct.dimensions || '',
        seo_title: typedProduct.seo_title || '',
        seo_description: typedProduct.seo_description || '',
        seo_keywords: typedProduct.seo_keywords || '',
      };
        
      // Add category-specific fields
      if (isCosmeticsProduct(typedProduct)) {
        form.reset({
          ...baseData,
          // Cosmetics fields
          ingredients: (typedProduct as any).ingredients || '',
          skin_type: (typedProduct as any).skin_type || '',
          product_benefits: (typedProduct as any).product_benefits || '',
          spf_level: (typedProduct as any).spf_level || '',
          volume_size: (typedProduct as any).volume_size || '',
          dermatologist_tested: (typedProduct as any).dermatologist_tested || false,
          cruelty_free: (typedProduct as any).cruelty_free || false,
          organic_natural: (typedProduct as any).organic_natural || false,
          // Hair extension fields (empty)
          hair_type: '',
          hair_texture: '',
          hair_length: '',
          hair_weight: '',
          hair_color_shade: '',
          installation_method: '',
          care_instructions: '',
          quantity_in_set: '',
        } as ProductFormData);
      } else if (isHairExtensionsProduct(typedProduct)) {
        const heProduct = typedProduct as ProductFormData;
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
          hair_type: heProduct.hair_type || '',
          hair_texture: heProduct.hair_texture || '',
          hair_length: heProduct.hair_length || '',
          hair_weight: heProduct.hair_weight || '',
          hair_color_shade: heProduct.hair_color_shade || '',
          installation_method: heProduct.installation_method || '',
          care_instructions: heProduct.care_instructions || '',
          quantity_in_set: heProduct.quantity_in_set || '',
        } as ProductFormData);
      } else {
        // fallback: reset all fields to empty/false to avoid 'never' type
        form.reset({
          ...baseData,
          ingredients: '',
          skin_type: '',
          product_benefits: '',
          spf_level: '',
          volume_size: '',
          dermatologist_tested: false,
          cruelty_free: false,
          organic_natural: false,
          hair_type: '',
          hair_texture: '',
          hair_length: '',
          hair_weight: '',
          hair_color_shade: '',
          installation_method: '',
          care_instructions: '',
          quantity_in_set: '',
        } as ProductFormData);
      }
      setMainImageUrl(product?.main_image_url || '');
      setExistingGalleryUrls(product?.gallery_urls || []);
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

  // Replace handleMainImageSelect with Firebase logic
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

  // Replace handleGallerySelect with Firebase logic
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

  // Replace removeGalleryImage with Firebase logic
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

  // Replace onSubmit with Firestore logic
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const category = data.category as 'cosmetics' | 'hair-extension';
      let productId = product?.id || uuidv4();
      let productData: any = {
        name: data.name,
        description: data.description,
        detailed_description: data.detailed_description,
        original_price: data.original_price ? parseFloat(data.original_price) : undefined,
        price: data.price ? parseFloat(data.price) : undefined,
        category: data.category,
        status: data.status,
        featured: data.featured,
        in_stock: data.in_stock,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity) : undefined,
        sku: data.sku,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        dimensions: data.dimensions,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords ? data.seo_keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      };
      if (category === 'cosmetics') {
        productData = {
          ...productData,
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
        productData = {
          ...productData,
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
      if (mainImageUrl) {
        productData.main_image_url = mainImageUrl;
      }
      const allGalleryUrls = [...existingGalleryUrls, ...galleryUrls];
      const finalGalleryUrls = allGalleryUrls.filter(url => !imagesToDelete.includes(url));
      if (finalGalleryUrls.length > 0) {
        productData.gallery_urls = finalGalleryUrls;
      }
      // Delete images marked for deletion
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          try {
            await deleteProductImage(imageUrl, form.getValues('category'));
          } catch (error) {
            // Continue with other deletions even if one fails
          }
        }
      }
      // Firestore logic
      if (product?.id) {
        // Update existing product
        const { data: existingProduct, error: selectError } = await supabase.from('Products').select('*').eq('id', String(product.id)).single();
        if (selectError) {
          throw selectError;
        }
        const { error: updateError } = await supabase.from('Products').update(productData).eq('id', String(product.id));
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new product
        const { data, error } = await supabase.from('Products').insert([
          {
            ...productData,
            created_at: new Date().toISOString(),
          },
        ]).select().single();

        if (error) {
          throw error;
        }
        productId = data.id;
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedCategory = form.watch('category');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full md:max-w-4xl w-full max-h-[95vh] mx-auto overflow-y-auto flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
        <DialogHeader className="pb-4 md:pb-6 border-b">
          <DialogTitle className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl font-bold">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <div className="relative overflow-visible z-50 bg-white p-2 sm:p-4 md:p-8 rounded-xl md:rounded-2xl w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-10">
              {/* Basic Information Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Package className="h-5 w-5 text-gray-600" />
                  </div>
                  Basic Information
                </h3>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-medium">Product Name *</FormLabel>
                          <FormControl>
                              <Input 
                                placeholder="Enter product name" 
                                className="h-11 w-full"
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
                                className="h-11 w-full"
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
                              className="min-h-[80px] resize-none w-full"
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
                              className="min-h-[120px] resize-none w-full"
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
              <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
                            trigger={
                              categoryOptions.find(opt => opt.value === field.value)?.label || 'Select category'
                            }
                            items={categoryOptions.map(opt => ({
                              label: opt.label,
                              onClick: () => field.onChange(opt.value)
                            }))}
                            className="h-11 w-full"
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
                            trigger={
                              statusOptions.find(opt => opt.value === field.value)?.label || 'Select status'
                            }
                            items={statusOptions.map(opt => ({
                              label: opt.label,
                              onClick: () => field.onChange(opt.value)
                            }))}
                            className="h-11 w-full"
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
                      <FormItem className={`flex flex-col justify-between h-full rounded-xl border-2 p-4 transition-all duration-200 ${
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
                        <div className="flex items-center justify-between w-full mt-4">
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
              <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
                        <FormLabel className="text-base font-medium">Original Price (₹) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="h-11 w-full"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          The regular price of the product in INR (₹)
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
                          <FormLabel className="text-base font-medium">Discounted Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            className="h-11 w-full"
                          {...field} 
                        />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          Sale price in INR (₹) (leave empty if no discount)
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
                            className="h-11 w-full"
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
            <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
                          className="h-11 w-full"
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
                          className="h-11 w-full"
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
              <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
                            trigger={
                              skinTypeOptions.find(opt => opt.value === field.value)?.label || 'Select skin type'
                            }
                            items={skinTypeOptions.map(opt => ({
                              label: opt.label,
                              onClick: () => field.onChange(opt.value)
                            }))}
                            className="h-11 w-full"
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
                          <Input placeholder="e.g., 50ml, 1.7 fl oz" className="h-11 w-full" {...field} />
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
                          <Input placeholder="e.g., SPF 30, SPF 50+" className="h-11 w-full" {...field} />
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
                            className="min-h-[100px] resize-none w-full"
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
                            className="min-h-[100px] resize-none w-full"
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
              <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
                            trigger={
                              hairTypeOptions.find(opt => opt.value === field.value)?.label || 'Select hair type'
                            }
                            items={hairTypeOptions.map(opt => ({
                              label: opt.label,
                              onClick: () => field.onChange(opt.value)
                            }))}
                            className="h-11 w-full"
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
                            trigger={
                              hairTextureOptions.find(opt => opt.value === field.value)?.label || 'Select hair texture'
                            }
                            items={hairTextureOptions.map(opt => ({
                              label: opt.label,
                              onClick: () => field.onChange(opt.value)
                            }))}
                            className="h-11 w-full"
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
                          <Input placeholder="e.g., 18 inches, 45cm" className="h-11 w-full" {...field} />
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
                          <Input placeholder="e.g., 100g, 120g per set" className="h-11 w-full" {...field} />
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
                    name="hair_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Hair Color</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full h-11">
                              <SelectValue placeholder="Choose color" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="natural_black">
                                <span className="inline-block w-5 h-5 rounded-full mr-2 align-middle" style={{ background: hairColorSwatchMap['natural_black'] }} />
                                Natural Black
                              </SelectItem>
                              <SelectItem value="dark_brown">
                                <span className="inline-block w-5 h-5 rounded-full mr-2 align-middle" style={{ background: hairColorSwatchMap['dark_brown'] }} />
                                Dark Brown
                              </SelectItem>
                              <SelectItem value="ombre">
                                <span className="inline-block w-5 h-5 rounded-full mr-2 align-middle" style={{ background: hairColorSwatchMap['ombre'] }} />
                                Ombre
                              </SelectItem>
                              <SelectItem value="light_brown">
                                <span className="inline-block w-5 h-5 rounded-full mr-2 align-middle" style={{ background: hairColorSwatchMap['light_brown'] }} />
                                Light Brown
                              </SelectItem>
                              <SelectItem value="highlight_27">
                                <span className="inline-block w-5 h-5 rounded-full mr-2 align-middle" style={{ background: hairColorSwatchMap['highlight_27'] }} />
                                Highlight #27
                              </SelectItem>
                              <SelectItem value="burgundy">
                                <span className="inline-block w-5 h-5 rounded-full mr-2 align-middle" style={{ background: hairColorSwatchMap['burgundy'] }} />
                                Burgundy
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hair_color_shade"
                    render={({ field }) => {
                      // Try to use the input as a color, fallback to gray if invalid
                      let swatchColor = field.value?.trim() || '#eee';
                      // Optionally, add validation for hex or CSS color names
                      return (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Custom Color / Shade</FormLabel>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-6 h-6 rounded-full border"
                              style={{ background: swatchColor }}
                              title={swatchColor}
                            />
                            <FormControl>
                              <Input
                                placeholder="e.g., #2 Dark Brown, #613 Blonde, custom mix"
                                className="h-11 w-full"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Enter a custom color number, shade, or description. If you enter a valid color code (e.g., #613, #FFD700, red), you'll see a preview.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="installation_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Installation Method</FormLabel>
                        <FormControl>
                          <BootstrapDropdown
                            trigger={
                              installationMethodOptions.find(opt => opt.value === field.value)?.label || 'Select installation method'
                            }
                            items={installationMethodOptions.map(opt => ({
                              label: opt.label,
                              onClick: () => field.onChange(opt.value)
                            }))}
                            className="h-11 w-full"
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
                          <Input placeholder="e.g., 7 pieces, 20 strands" className="h-11 w-full" {...field} />
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
                            className="min-h-[100px] resize-none w-full"
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

            {/* Variant Management Section (replacing hair_length & hair_weight) */}
            {watchedCategory === 'hair-extension' && (
              <div className="col-span-2">
                <Label className="text-base font-medium block mb-3">Hair Variant Options</Label>
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className={`grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 p-4 mb-4 border rounded-lg ${
                      selectedVariant === variant.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="mb-2 md:mb-0">
                      <Label className="block text-sm font-medium mb-1">Weight (gm)</Label>
                      <Input
                        className="w-full"
                        type="number"
                        value={variant.weight === 0 ? '' : String(variant.weight)}
                        onChange={e => handleVariantChange(index, 'weight', e.target.value)}
                        placeholder="Weight (gm)"
                      />
                    </div>
                    <div className="mb-2 md:mb-0">
                      <Label className="block text-sm font-medium mb-1">Length (inches)</Label>
                      <Input
                        className="w-full"
                        type="number"
                        value={variant.length === 0 ? '' : String(variant.length)}
                        onChange={e => handleVariantChange(index, 'length', e.target.value)}
                        placeholder="Length (inches)"
                      />
                    </div>
                    <div className="mb-2 md:mb-0">
                      <Label className="block text-sm font-medium mb-1">Price (₹)</Label>
                      <Input
                        className="w-full"
                        type="number"
                        value={variant.price === 0 ? '' : String(variant.price)}
                        onChange={e => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="Price (₹)"
                      />
                    </div>
                    <div className="mb-2 md:mb-0">
                      <Label className="block text-sm font-medium mb-1">Discount Price</Label>
                      <TextField
                        type="number"
                        value={variant.discount_price === 0 ? '' : String(variant.discount_price)}
                        onChange={e => handleVariantChange(index, 'discount_price', e.target.value)}
                        placeholder="Discount Price"
                        fullWidth
                      />
                    </div>
                    <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row justify-between mt-2 gap-2 md:gap-4">
                      <Button
                        variant={selectedVariant === variant.id ? 'default' : 'outline'}
                        onClick={() => handleVariantSelect(variant)}
                        className="text-sm w-full md:w-auto"
                      >
                        {selectedVariant === variant.id ? 'Selected' : 'Select this Variant'}
                      </Button>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="w-full md:w-auto"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-2">
                  <Button
                    type="button"
                    onClick={addNewVariant}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    + Add New Variant
                  </Button>
                </div>
              </div>
            )}

            {/* Images Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
            <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
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
                        <Input placeholder="SEO optimized title" className="h-11 w-full" {...field} />
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
                        className="min-h-[100px] resize-none w-full"
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
                        <Input placeholder="keyword1, keyword2, keyword3" className="h-11 w-full" {...field} />
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
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
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
      </div>
    </DialogContent>
  </Dialog>
  );
} 