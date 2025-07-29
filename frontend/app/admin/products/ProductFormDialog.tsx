"use client";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from 'uuid';
import TextField from '@mui/material/TextField';
import { Button } from "@/components/ui/button";
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


import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  Waves,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Resolver } from 'react-hook-form';

// 1. Import Firestore and Storage helpers from lib/firebase.ts
import { firestore, storage, deleteProductImageFromFirebase} from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';

import { productSchema, ProductFormData } from './productFormTypes';

// Define Variant type locally if not imported from supabase
interface Variant {
  id: string;
  product_id: string;
  weight: number;
  length: number | string;
  price: number | string;
  discount_price: number | string | null;
  colors?: string[]; // <-- add this
  topper_size?: string; // <-- added
  type?: 'remy' | 'virgin';
}

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
  {
    name: 'Natural Black',
    value: 'natural-black',
    image: 'https://m.media-amazon.com/images/I/616-QJ5oHML._UF1000,1000_QL80_.jpg',
  },
  {
    name: 'Dark Brown',
    value: 'dark-brown',
    image: 'https://www.shutterstock.com/image-photo/brown-hair-closeup-background-womens-600nw-2220526961.jpg',
  },
  {
    name: 'Medium Brown',
    value: 'medium-brown',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUQpHBJjuNF7ggbA-UKOQXcZuhm7s1EGuFdw&s',
  },
  {
    name: 'Light Brown',
    value: 'light-brown',
    image: 'https://www.shutterstock.com/image-photo/blond-hair-closeup-background-womens-260nw-2282714539.jpg',
  },
  {
    name: 'Auburn',
    value: 'auburn',
    image: 'https://lh3.googleusercontent.com/VT4q6dvB-Bt8jnXQXd1NhZ9i4tpIHmBWKE4g7NUi69vdFmfuSjfJ5cWadyr5pFbOR-IYxYP_IwYN5CsWbOXnwA_VCCOCxEFf3JS_9MCl=w360-rw',
  },
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

// 1. Define a simple hair texture SVG as a React component at the top of the file:
const HairTextureSVG = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
    <path d="M3 20c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
    <path d="M3 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
  </svg>
);

// Helper to upload a file and return its download URL
async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Helper to delete an image by URL
async function deleteImageByUrl(url: string): Promise<void> {
  const path = new URL(url).pathname.replace(/^\/v0\/b\/[^/]+\/o\//, '').replace(/%2F/g, '/');
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
} 

export default function ProductFormDialog({ open, product, selectedCategory, onClose, onSuccess }: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [variantsRemy, setVariantsRemy] = useState<Variant[]>([]);
  const [variantsVirgin, setVariantsVirgin] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Correct useForm usage
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData, any>,
    defaultValues: productSchema.parse({}),
  });
  const { reset } = form;

  const [variants, setVariants] = useState<Variant[]>([
    {
      id: uuidv4(),
      product_id: '',
      weight: 0,
      length: 0,
      price: 0,
      discount_price: 0,
      colors: [], // <-- initialize
    },
  ]);
  

  // Update handleVariantChange to always store string values
 const handleVariantChange = (
  index: number,
  field: keyof Variant,
  value: string,
  type: 'remy' | 'virgin'
  ) => {
  if (type === 'remy') {
    const updated = [...variantsRemy];
    updated[index] = { ...updated[index], [field]: value };
    setVariantsRemy(updated);
  } else {
    const updated = [...variantsVirgin];
    updated[index] = { ...updated[index], [field]: value };
    setVariantsVirgin(updated);
  }
};


  const addNewVariant = (type: 'remy' | 'virgin') => {
  const newVariant: Variant = {
    id: uuidv4(),
    weight: 0,
    length: 0,
    price: 0,
    discount_price: 0,
    product_id: '',
    colors: [],
    type, // add the type to differentiate remy/virgin
  };

  if (type === 'remy') {
    setVariantsRemy((prev) => [...prev, newVariant]);
  } else {
    setVariantsVirgin((prev) => [...prev, newVariant]);
  }
};

  const removeVariant = (index: number, type: 'remy' | 'virgin') => {
  if (type === 'remy') {
    const updated = [...variantsRemy];
    updated.splice(index, 1);
    setVariantsRemy(updated);
  } else {
    const updated = [...variantsVirgin];
    updated.splice(index, 1);
    setVariantsVirgin(updated);
  }
};


  const handleVariantSelect = (variantId: string, type: 'remy' | 'virgin') => {
  setSelectedVariant(variantId);

  const variant =
    type === 'remy'
      ? variantsRemy.find(v => v.id === variantId)
      : variantsVirgin.find(v => v.id === variantId);

  if (variant) {
    form.setValue('hair_weight', String(variant.weight));
    form.setValue('hair_length', String(variant.length));
    form.setValue('original_price', String(variant.price));
  }
};


  // Add a handler for color selection for a variant:
  const handleVariantColorsChange = (index: number, selectedColors: string[]) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], colors: selectedColors };
    setVariants(updated);
  };

  // Remove all useEffect hooks that reset form or set image state, and replace with the following:

useEffect(() => {
  if (open) {
    if (product) {
      // Editing: prefill all fields from product
      form.reset({
        ...product,
        main_image_url: product.main_image_url || '',
        gallery_urls: product.gallery_urls || [],
      });

      setMainImageUrl(product.main_image_url || '');
      setExistingGalleryUrls(product.gallery_urls || []);
      setGalleryUrls([]);
      setImagesToDelete([]);

      if (
        product.category === 'hair-extension' &&
        typeof product === 'object' &&
        'remyVariants' in product &&
        'virginVariants' in product
      ) {
        // Hair extension with both remy and virgin variants
        const remy = (product as any).remyVariants || [];
        const virgin = (product as any).virginVariants || [];

        setVariantsRemy(
          remy.map((v: any) => ({
            ...v,
            length: v.length !== undefined && v.length !== null ? String(v.length) : '',
            price: v.price !== undefined && v.price !== null ? String(v.price) : '',
            discount_price: v.discount_price !== undefined && v.discount_price !== null ? String(v.discount_price) : '',
            topper_size: v.topper_size || '',
            product_id: v.product_id || '',
            colors: Array.isArray(v.colors) ? v.colors : [],
            id: v.id || uuidv4(),
          }))
        );

        setVariantsVirgin(
          virgin.map((v: any) => ({
            ...v,
            length: v.length !== undefined && v.length !== null ? String(v.length) : '',
            price: v.price !== undefined && v.price !== null ? String(v.price) : '',
            discount_price: v.discount_price !== undefined && v.discount_price !== null ? String(v.discount_price) : '',
            topper_size: v.topper_size || '',
            product_id: v.product_id || '',
            colors: Array.isArray(v.colors) ? v.colors : [],
            id: v.id || uuidv4(),
          }))
        );
      } else {
        // New fallback for both sections
        setVariantsRemy([
        {
          id: uuidv4(),
          product_id: '',
          weight: 0,
          length: '',
          price: '',
          discount_price: '',
          topper_size: '',
          colors: [],
        },
        ]);
        setVariantsVirgin([
        {
          id: uuidv4(),
          product_id: '',
          weight: 0,
          length: '',
          price: '',
          discount_price: '',
          topper_size: '',
          colors: [],
        },
        ]);

      }
    } else if (selectedCategory) {
      // New product: use selectedCategory as initial value
      form.reset({
        ...productSchema.parse({}),
        category: selectedCategory as 'cosmetics' | 'hair-extension',
      });

      setVariantsRemy([
        {
          id: uuidv4(),
          product_id: '',
          weight: 0,
          length: '',
          price: '',
          discount_price: '',
          topper_size: '',
          colors: [],
        },
      ]);
      setVariantsRemy([
        {
          id: uuidv4(),
          product_id: '',
          weight: 0,
          length: '',
          price: '',
          discount_price: '',
          topper_size: '',
          colors: [],
        },
      ]);

      setMainImageUrl('');
      setExistingGalleryUrls([]);
      setGalleryUrls([]);
      setImagesToDelete([]);
    }
  }
  // eslint-disable-next-line
}, [open, product, selectedCategory]);


  // On edit: initialize all image states from product prop
  useEffect(() => {
    if (product) {
      setMainImageUrl(product.main_image_url || '');
      setExistingGalleryUrls(product.gallery_urls || []);
      setGalleryUrls([]);
    }
  }, [product]);

  // Add a useEffect to always reset the form to the selectedCategory when the dialog opens for a new product
  useEffect(() => {
    if (open && !product && selectedCategory) {
      form.reset({
        ...productSchema.parse({}),
        category: selectedCategory as 'cosmetics' | 'hair-extension',
      });
      setMainImageUrl('');
      setExistingGalleryUrls([]);
      setGalleryUrls([]);
      setImagesToDelete([]);
    }
  }, [open, selectedCategory, product, form]);

  // Main image upload handler
  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const productId = product?.id || uuidv4();
    const path = `products/${productId}/main.jpg`;
    const url = await uploadImage(file, path);
    setMainImageUrl(url);
  };

  // Gallery images upload handler
  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const productId = product?.id || uuidv4();
    const urls = await Promise.all(
      files.map((file: File) => uploadImage(file, `products/${productId}/gallery/${uuidv4()}.jpg`))
    );
    setGalleryUrls(prev => [...prev, ...urls]);
  };

  // Remove gallery image handler
  const removeGalleryImage = async (index: number, isExisting: boolean) => {
    const url = isExisting ? existingGalleryUrls[index] : galleryUrls[index];
    await deleteImageByUrl(url);
    if (isExisting) {
      setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setGalleryUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 2. Update onSubmit to use Firestore and Firebase Storage
  const onSubmit: import('react-hook-form').SubmitHandler<ProductFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const productId = product?.id || uuidv4();
      // Use mainImageUrl and galleryUrls state
      if (!mainImageUrl) {
        toast.error('Please upload a main product image.');
        setIsSubmitting(false);
        return;
      }
      const now = new Date().toISOString();
      // Only include variants for hair-extension
      const productData = {
        ...data,
        main_image_url: mainImageUrl,
        gallery_urls: [...existingGalleryUrls, ...galleryUrls],
        updated_at: now,
        created_at: (product as any)?.created_at || now,
        ...(data.category === 'hair-extension'
          ? {
          variants: [
           ...variantsRemy.map((v) => ({ ...v, type: 'remy' })),
           ...variantsVirgin.map((v) => ({ ...v, type: 'virgin' })),
          ],  
            }
        : {}),
      };
      const category = data.category as 'cosmetics' | 'hair-extension';
      const collectionName = data.category === 'hair-extension' ? 'hair_extensions' : 'cosmetics';

      if (product?.id) {
        // Update existing product
        await updateDoc(doc(firestore, collectionName, product.id), productData);
      } else {
        // Create new product
        const docRef = await addDoc(collection(firestore, collectionName), productData);
        const newId = docRef.id;

      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
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

              {/* Variants Section */}
              {watchedCategory === 'hair-extension' && (
                <div className="col-span-2 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel className="text-base font-medium">Product Variants</FormLabel>
                    <Button
                      type="button"
                      onClick={() => addNewVariant('remy')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Remy Variant
                    </Button>
                    <Button
                      type="button"
                      onClick={() => addNewVariant('virgin')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Virgin Variant
                    </Button>
                  </div>
                  {/* Remy Hair Section */}
<div className="mb-8">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Remy Hair Variants</h3>
  {variantsRemy.length > 0 ? (
    <div className="space-y-4">
      {variantsRemy.map((variant, index) => (
        <div 
          key={variant.id} 
          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedVariant === variant.id 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
          onClick={() => handleVariantSelect(variant.id, 'remy')}

        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <input
                type="radio"
                name="selectedVariant"
                checked={selectedVariant === variant.id}
                onChange={() => setSelectedVariant(variant.id)}
                className="text-amber-600"
              />
              Variant {index + 1}
            </h4>
            <Button
              type="button"
              onClick={(e) => {
               e.stopPropagation();
               removeVariant(index, 'remy');
              }}
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
            >
            <X className="h-4 w-4" />
          </Button>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Length *</label>
              <Input
               placeholder="e.g., 18 inches"
               value={variant.length}
               onChange={(e) =>
               handleVariantChange(index, 'length', e.target.value, 'remy')
              }
              className="h-10"
             />

            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Topper Size</label>
             <Input
              placeholder="e.g., 6x6, 5x5"
              value={variant.topper_size || ''}
              onChange={(e) =>
              handleVariantChange(index, 'topper_size', e.target.value, 'remy')
              }
              className="h-10"
             />

            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Price (₹) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={variant.price}
                onChange={(e) =>
                handleVariantChange(index, 'price', e.target.value, 'remy')
                }
                className="h-10"
              />

            </div>
          </div>
          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <FormLabel className="text-base font-medium">Colors:</FormLabel>
              <span className="text-sm text-gray-600">
                {(variant.colors ?? []).length === 0
                  ? 'Select colors'
                  : (variant.colors ?? [])
                      .map(value => {
                        const matched = hairColorOptions.find(option => option.value === value);
                        return matched ? matched.name : value;
                      })
                      .join(', ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {hairColorOptions.map((color) => {
                const isSelected = (variant.colors ?? []).includes(color.value);
                return (
                  <div key={color.value} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...variantsRemy];
                        const colorArray = variant.colors ?? [];
                        updated[index].colors = isSelected
                          ? colorArray.filter(c => c !== color.value)
                          : [...colorArray, color.value];
                        setVariantsRemy(updated);
                      }}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                        isSelected ? 'border-amber-500 scale-110 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{
                        backgroundImage: `url(${color.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...variantsRemy];
                          updated[index].colors = (variant.colors ?? []).filter(c => c !== color.value);
                          setVariantsRemy(updated);
                        }}
                        className="absolute -top-2 -right-2 bg-white text-red-600 border border-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 mb-2">No Remy variants added yet</p>
      <p className="text-sm text-gray-400">Click "Add Remy Variant" to create product variations</p>
    </div>
  )}
</div>

{/* Virgin Hair Section */}
<div className="mb-8">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Virgin Hair Variants</h3>
  {variantsVirgin.length > 0 ? (
    <div className="space-y-4">
      {variantsVirgin.map((variant, index) => (
        <div 
          key={variant.id} 
          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedVariant === variant.id 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
          onClick={() => handleVariantSelect(variant.id, 'virgin')}

        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <input
                type="radio"
                name="selectedVariant"
                checked={selectedVariant === variant.id}
                onChange={() => setSelectedVariant(variant.id)}
                className="text-amber-600"
              />
              Variant {index + 1}
            </h4>
            <Button
              type="button"
              onClick={(e) => {
              e.stopPropagation();
              removeVariant(index, 'virgin');
              }}
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
          </Button>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Length *</label>
              <Input
               placeholder="e.g., 18 inches"
               value={variant.length}
               onChange={(e) =>
               handleVariantChange(index, 'length', e.target.value, 'virgin')
               }
               className="h-10"
              />

            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Topper Size</label>
              <Input
              placeholder="e.g., 6x6, 5x5"
              value={variant.topper_size || ''}
              onChange={(e) =>
                handleVariantChange(index, 'topper_size', e.target.value, 'virgin')
              }
              className="h-10"
            />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Price (₹) *</label>
              <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={variant.price}
              onChange={(e) =>
                handleVariantChange(index, 'price', e.target.value, 'virgin')
              }
              className="h-10"
            />
            </div>
          </div>
          <div className="mb-8 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <FormLabel className="text-base font-medium">Colors:</FormLabel>
              <span className="text-sm text-gray-600">
                {(variant.colors ?? []).length === 0
                  ? 'Select colors'
                  : (variant.colors ?? [])
                      .map(value => {
                        const matched = hairColorOptions.find(option => option.value === value);
                        return matched ? matched.name : value;
                      })
                      .join(', ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {hairColorOptions.map((color) => {
                const isSelected = (variant.colors ?? []).includes(color.value);
                return (
                  <div key={color.value} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...variantsVirgin];
                        const colorArray = variant.colors ?? [];
                        updated[index].colors = isSelected
                          ? colorArray.filter(c => c !== color.value)
                          : [...colorArray, color.value];
                        setVariantsVirgin(updated);
                      }}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                        isSelected ? 'border-amber-500 scale-110 shadow-lg' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{
                        backgroundImage: `url(${color.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...variantsVirgin];
                          updated[index].colors = (variant.colors ?? []).filter(c => c !== color.value);
                          setVariantsVirgin(updated);
                        }}
                        className="absolute -top-2 -right-2 bg-white text-red-600 border border-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 mb-2">No Virgin variants added yet</p>
      <p className="text-sm text-gray-400">Click "Add Virgin Variant" to create product variations</p>
    </div>
  )}
</div>


                </div>
              )};  

                  

              {/* Pricing & Inventory Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  Pricing & Inventory
                </h3>
                
                <div className="space-y-6">
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
                        {/* Add an invisible FormDescription for alignment */}
                        <FormDescription className="invisible select-none">placeholder</FormDescription>
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
                              await deleteProductImageFromFirebase(mainImageUrl);
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