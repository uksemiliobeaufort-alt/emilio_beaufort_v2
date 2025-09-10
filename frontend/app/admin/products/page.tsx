"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth } from '@/lib/auth';
import { firestore, deleteProductImageFromFirebase } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Package, Filter } from 'lucide-react';
import BootstrapDropdown from '@/components/ui/BootstrapDropdown';
import ProductCard from './components/ProductCard';
import ProductFormDialog from './ProductFormDialog';
import CategorySelectionDialog from './CategorySelectionDialog';
import { productSchema, ProductFormData } from './productFormTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import PermissionGuard from '@/components/PermissionGuard';

const categoryLabels = {
  'cosmetics': 'Cosmetics',
  'hair-extension': 'Hair Extensions',
};
const statusLabels = {
  'draft': 'Draft',
  'published': 'Published',
  'archived': 'Archived',
};

function normalizeProduct(raw: any) {
  try {
    const parsed = productSchema.parse(raw);
    return {
      ...parsed,
      price: parsed.price ? Number(parsed.price) : undefined,
      original_price: parsed.original_price ? Number(parsed.original_price) : undefined,
      stock_quantity: parsed.stock_quantity ? Number(parsed.stock_quantity) : undefined,
      weight: parsed.weight ? Number(parsed.weight) : undefined,
      category: parsed.category === 'cosmetics' ? 'cosmetics' : 'hair-extension',
      seo_keywords: Array.isArray(parsed.seo_keywords)
        ? parsed.seo_keywords
        : typeof parsed.seo_keywords === 'string' && parsed.seo_keywords
          ? parsed.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
          : [],
      variants: raw.variants || [],
    };
  } catch (e) {
    // Show even if not perfect
    console.warn('Bypassing schema for product:', raw.id, raw, e);
    return {
      ...raw,
      category: raw.category || 'cosmetics',
      price: raw.price ? Number(raw.price) : undefined,
      original_price: raw.original_price ? Number(raw.original_price) : undefined,
      stock_quantity: raw.stock_quantity ? Number(raw.stock_quantity) : undefined,
      weight: raw.weight ? Number(raw.weight) : undefined,
      seo_keywords: Array.isArray(raw.seo_keywords)
        ? raw.seo_keywords
        : typeof raw.seo_keywords === 'string' && raw.seo_keywords
          ? raw.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
          : [],
      variants: raw.variants || [],
    };
  }
}

function productToFormData(product: any): ProductFormData {
  // Handle variants for hair extensions
  let remyVariants: any[] = [];
  let virginVariants: any[] = [];
  
  if (product.category === 'hair-extension' && product.variants) {
    // Split variants by type
    remyVariants = product.variants.filter((v: any) => v.type === 'remy' || !v.type);
    virginVariants = product.variants.filter((v: any) => v.type === 'virgin');
  }

  return {
    id: product.id || '',
    name: product.name || '',
    description: product.description || '',
    detailed_description: product.detailed_description || '',
    original_price: product.original_price !== undefined && product.original_price !== null ? String(product.original_price) : '',
    price: product.price !== undefined && product.price !== null ? String(product.price) : '',
    category: product.category || 'cosmetics',
    status: product.status || 'draft',
    featured: product.featured ?? false,
    in_stock: product.in_stock ?? false,
    stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null ? String(product.stock_quantity) : '',
    sku: product.sku || '',
    weight: product.weight !== undefined && product.weight !== null ? String(product.weight) : '',
    dimensions: product.dimensions || '',
    ingredients: product.ingredients || '',
    skin_type: product.skin_type || '',
    product_benefits: product.product_benefits || '',
    spf_level: product.spf_level || '',
    volume_size: product.volume_size || '',
    dermatologist_tested: product.dermatologist_tested ?? false,
    cruelty_free: product.cruelty_free ?? false,
    organic_natural: product.organic_natural ?? false,
    hair_type: product.hair_type || '',
    hair_texture: product.hair_texture || '',
    hair_length: product.hair_length || '',
    hair_weight: product.hair_weight || '',
    hair_color: product.hair_color || '',
    hair_color_shade: product.hair_color_shade || '',
    installation_method: product.installation_method || '',
    care_instructions: product.care_instructions || '',
    quantity_in_set: product.quantity_in_set || '',
    seo_title: product.seo_title || '',
    seo_description: product.seo_description || '',
    seo_keywords: Array.isArray(product.seo_keywords)
      ? product.seo_keywords.join(', ')
      : (product.seo_keywords || ''),
    main_image_url: product.main_image_url || '',
    gallery_urls: Array.isArray(product.gallery_urls) ? product.gallery_urls : [],
    // Add the new variant structure
    remyVariants,
    virginVariants,
    ...(product.variants ? { variants: product.variants } : {}),
  };
}

export default function ProductsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: any | null }>({ open: false, product: null });
  const [productFormDialog, setProductFormDialog] = useState<{ open: boolean; product: ProductFormData | null; selectedCategory?: string }>({ open: false, product: null });
  const [categorySelectionDialog, setCategorySelectionDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <PermissionGuard requiredPermission="manage_products">
      <ProductsAdminContent />
    </PermissionGuard>
  );
}

function ProductsAdminContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: any | null }>({ open: false, product: null });
  const [productFormDialog, setProductFormDialog] = useState<{ open: boolean; product: ProductFormData | null; selectedCategory?: string }>({ open: false, product: null });
  const [categorySelectionDialog, setCategorySelectionDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const cosmeticsSnap = await getDocs(collection(firestore, 'cosmetics'));
      const cosmetics = cosmeticsSnap.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: data.id && data.id !== '' ? data.id : doc.id };
      });
      const hairSnap = await getDocs(collection(firestore, 'hair_extensions'));
      const hairExtensions = hairSnap.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: data.id && data.id !== '' ? data.id : doc.id };
      });
      const allProducts = [...cosmetics, ...hairExtensions]
        .map(normalizeProduct)
        .filter((p) => !!p && p.id);
      // Deduplicate by id
      const dedupedProducts = allProducts.filter((product, idx, arr) => arr.findIndex(p => p.id === product.id) === idx);
      // Sort by created_at desc if available
      dedupedProducts.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setProducts(dedupedProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAdmin()) {
      router.replace('/admin/login');
      return;
    }
    fetchProducts();

    // Realtime updates for both collections
    const cosmeticsRef = collection(firestore, 'cosmetics');
    const hairRef = collection(firestore, 'hair_extensions');

    const handleSnapshot = (snap: QuerySnapshot) => {
      try {
        // We'll re-run fetchProducts to keep normalization/dedup logic centralized
        fetchProducts();
      } catch (err) {
        console.warn('Failed processing realtime update:', err);
      }
    };

    const unsubCosmetics = onSnapshot(cosmeticsRef, handleSnapshot);
    const unsubHair = onSnapshot(hairRef, handleSnapshot);

    return () => {
      unsubCosmetics();
      unsubHair();
    };
  }, [router]);

  // Add/Edit/Delete handlers
  const handleProductFormSuccess = async (updated?: any) => {
    setProductFormDialog({ open: false, product: productSchema.parse({}) });
    if (updated) {
      setProducts(prev => {
        const normalized = normalizeProduct(updated);
        if (!normalized || !normalized.id) return prev;
        const idx = prev.findIndex(p => p.id === normalized.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...prev[idx], ...normalized };
          return next;
        }
        return [normalized, ...prev];
      });
    } else {
      await fetchProducts();
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteDialog.product) return;
    setIsProcessing(true);
    try {
      const product = deleteDialog.product;
      
      // Delete images with better error handling
      if (product.main_image_url) {
        try {
          await deleteProductImageFromFirebase(product.main_image_url);
          console.log('Main image deleted successfully');
        } catch (imageError) {
          console.warn('Failed to delete main image:', imageError);
          // Continue with deletion even if image deletion fails
        }
      }
      
      if (product.gallery_urls && product.gallery_urls.length > 0) {
        for (const imageUrl of product.gallery_urls) {
          try {
            await deleteProductImageFromFirebase(imageUrl);
            console.log('Gallery image deleted successfully');
          } catch (imageError) {
            console.warn('Failed to delete gallery image:', imageError);
            // Continue with deletion even if image deletion fails
          }
        }
      }
      
      // Delete from Firestore
      const collectionName = product.category === 'hair-extension' ? 'hair_extensions' : 'cosmetics';
      if (!product.id) {
        toast.error('Product ID is missing. Cannot delete.');
        setIsProcessing(false);
        return;
      }
      
      await deleteDoc(doc(firestore, collectionName, product.id));
      await fetchProducts();
      setDeleteDialog({ open: false, product: null });
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete product error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-gray-200 bg-white p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-gray-200 bg-white p-8">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first product.</p>
            <Button onClick={() => setCategorySelectionDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
          <CategorySelectionDialog
            open={categorySelectionDialog}
            onClose={() => setCategorySelectionDialog(false)}
            onCategorySelect={cat => setProductFormDialog({ open: true, product: null, selectedCategory: cat })}
          />
          <ProductFormDialog
            key={productFormDialog.selectedCategory || 'default'}
            open={productFormDialog.open}
            product={productFormDialog.product}
            selectedCategory={productFormDialog.selectedCategory}
            onClose={() => setProductFormDialog({ open: false, product: productSchema.parse({}) })}
            onSuccess={handleProductFormSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            Products
          </h1>
          <p className="mt-1 text-gray-500">Manage your product catalog</p>
        </div>
        <Button onClick={() => setCategorySelectionDialog(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
          </div>
          <BootstrapDropdown
            trigger={
              categoryFilter === 'all' ? 'All Categories' :
              categoryFilter === 'cosmetics' ? 'Cosmetics' :
              categoryFilter === 'hair-extension' ? 'Hair Extensions' : 'Category'
            }
            items={[
              { label: 'All Categories', onClick: () => setCategoryFilter('all') },
              { label: 'Cosmetics', onClick: () => setCategoryFilter('cosmetics') },
              { label: 'Hair Extensions', onClick: () => setCategoryFilter('hair-extension') }
            ]}
          />
          <BootstrapDropdown
            trigger={
              statusFilter === 'all' ? 'All Status' :
              statusFilter === 'draft' ? 'Draft' :
              statusFilter === 'published' ? 'Published' :
              statusFilter === 'archived' ? 'Archived' : 'Status'
            }
            items={[
              { label: 'All Status', onClick: () => setStatusFilter('all') },
              { label: 'Draft', onClick: () => setStatusFilter('draft') },
              { label: 'Published', onClick: () => setStatusFilter('published') },
              { label: 'Archived', onClick: () => setStatusFilter('archived') }
            ]}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, idx) => (
          <ProductCard
            key={product.id || idx}
            product={product}
            onEdit={() => setProductFormDialog({ open: true, product: productToFormData(product) })}
            onDelete={() => setDeleteDialog({ open: true, product })}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 text-center mt-2">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first product'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={open => !isProcessing && setDeleteDialog({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.product?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, product: null })}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={productFormDialog.open}
        product={productFormDialog.product}
        selectedCategory={productFormDialog.selectedCategory}
        onClose={() => setProductFormDialog({ open: false, product: productSchema.parse({}) })}
        onSuccess={handleProductFormSuccess}
      />

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={categorySelectionDialog}
        onClose={() => setCategorySelectionDialog(false)}
        onCategorySelect={cat => setProductFormDialog({ open: true, product: null, selectedCategory: cat })}
      />
    </div>
  );
} 