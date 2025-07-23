"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  Package,
  Filter
} from 'lucide-react';
import { 
  getProducts, 
  deleteProduct, 
  Product,
  deleteProductImage 
} from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import BootstrapDropdown from '@/components/ui/BootstrapDropdown';
import ProductFormDialog from './ProductFormDialog';
import CategorySelectionDialog from './CategorySelectionDialog';
import ProductCard from './components/ProductCard';
import { productSchema, ProductFormData } from './productFormTypes';

const categoryLabels = {
  'cosmetics': 'Cosmetics',
  'hair-extension': 'Hair Extension'
};

const statusLabels = {
  'draft': 'Draft',
  'published': 'Published',
  'archived': 'Archived'
};

export default function ProductsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null
  });
  // Update the productFormDialog state type to allow product: ProductFormData | null
  const [productFormDialog, setProductFormDialog] = useState<{ open: boolean; product: ProductFormData | null; selectedCategory?: string }>(
    {
      open: false,
      product: null
    }
  );
  const [categorySelectionDialog, setCategorySelectionDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!auth.isAdmin()) {
      router.replace('/admin/login');
      return;
    }

    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    console.log('Fetching products...');
    setLoading(true);
    try {
      const products = await getProducts();
      console.log('Products fetched successfully:', products);
      setProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteDialog({ open: true, product });
  };

  const handleEditClick = (product: Product) => {
    setProductFormDialog({ open: true, product: productSchema.parse(product ?? {}) });
  };

  const handleAddClick = () => {
    setCategorySelectionDialog(true);
  };

  const handleCategorySelect = (category: 'cosmetics' | 'hair-extension') => {
    setCategorySelectionDialog(false);
    setProductFormDialog({ open: true, product: null, selectedCategory: category });
  };

  const handleDeleteProduct = async () => {
    if (!deleteDialog.product) return;
    
    setIsProcessing(true);
    try {
      const product = deleteDialog.product;

      // Delete associated images first
      if (product.main_image_url) {
        try {
          await deleteProductImage(product.main_image_url, product.category);
        } catch (error) {
          console.warn('Could not delete main image:', error);
        }
      }

      if (product.gallery_urls && product.gallery_urls.length > 0) {
        for (const imageUrl of product.gallery_urls) {
          try {
            await deleteProductImage(imageUrl, product.category);
          } catch (error) {
            console.warn('Could not delete gallery image:', error);
          }
        }
      }

      // Delete the product
      await deleteProduct(product.id, product.category);
      
      await fetchProducts();
      setDeleteDialog({ open: false, product: null });
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProductFormSuccess = () => {
    setProductFormDialog({ open: false, product: productSchema.parse({}) });
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Add loading state UI
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

  // Add empty state UI
  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-gray-200 bg-white p-8">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first product.</p>
            <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </div>
          
          {/* Category Selection Dialog */}
          <CategorySelectionDialog
            open={categorySelectionDialog}
            onClose={() => setCategorySelectionDialog(false)}
            onCategorySelect={handleCategorySelect}
          />
          
          {/* Product Form Dialog */}
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
        <Button onClick={handleAddClick} size="lg" className="bg-blue-600 hover:bg-blue-700">
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
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
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !isProcessing && setDeleteDialog({ open, product: null })}>
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
                 onCategorySelect={handleCategorySelect}
      />
    </div>
  );
} 