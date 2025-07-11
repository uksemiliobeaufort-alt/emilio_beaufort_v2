"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getImageUrl, supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "@/components/ui/RichTextEditor";
import EnhancedEditor from "@/components/ui/EnhancedEditor";
import TipTapEditor from "@/app/admin/components/TipTapEditor";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  featured_image_base64?: string;
  gallery_base64?: string[];
  created_at: string;
  createdAt?: string;
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const defaultImageUrl = "/default-image.jpg";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Starting to fetch posts...');
      
      // Check if supabase client is properly initialized
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log("Fetched posts:", data);
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      
      // Check if it's a table not found error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('relation "blog_posts" does not exist')) {
          toast.error("Blog posts table does not exist. Please check your database setup.");
        } else if (errorMessage.includes('permission denied')) {
          toast.error("Permission denied. Please check your database policies.");
        } else {
          toast.error(`Failed to fetch posts: ${errorMessage}`);
        }
      } else {
        toast.error("Failed to fetch posts. Please check your connection.");
      }
      
      // Set empty array to prevent further errors
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const stripHtmlAndTruncate = (html: string, maxLength: number = 100): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content without HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate and add ellipsis
    return textContent.length > maxLength 
      ? textContent.slice(0, maxLength) + '...'
      : textContent;
  };

  const truncateHtmlContent = (html: string, maxLength: number = 200): string => {
    if (!html) return '';
    
    // Create a temporary div to work with the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get the text content length
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // If the text is already short enough, return the original HTML
    if (textContent.length <= maxLength) {
      return html;
    }
    
    // If too long, truncate the text and add ellipsis
    const truncatedText = textContent.slice(0, maxLength) + '...';
    
    // Try to preserve some basic formatting by returning a truncated version
    // This is a simple approach - for more complex HTML truncation, you'd need a more sophisticated library
    return `<p>${truncatedText}</p>`;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setImageFiles(files);

    // Clear previous previews
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    // Convert files to base64 for preview
    const previews = await Promise.all(
      Array.from(files).map(async (file) => {
        return await convertFileToBase64(file);
      })
    );
    setImagePreviews(previews);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageFiles(null);
    setImagePreviews([]);
    setSelectedPost(null);
  };

  const handleCreatePost = async () => {
    if (!title || !content || !imageFiles || imageFiles.length === 0) {
      toast.error("Please fill all fields and upload at least one image.");
      return;
    }

    setIsProcessing(true);
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    try {
      const imageBase64Array: string[] = [];

      // Convert all files to base64
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(`Converting file ${i + 1} to base64: ${file.name}`);
        
        const base64String = await convertFileToBase64(file);
        imageBase64Array.push(base64String);
        
        console.log(`File ${i + 1} converted successfully`);
      }

      // Insert into blog_posts table
      const { error: insertError } = await supabase.from('blog_posts').insert([
        {
          title,
          slug,
          content,
          featured_image_base64: imageBase64Array[0],
          gallery_base64: imageBase64Array,
        }
      ]);
      if (insertError) throw insertError;

      resetForm();
      setDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Post creation failed", error);
      toast.error("Failed to create post");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (post: Post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setContent(post.content || "");
    if (post.gallery_base64) {
      setImagePreviews(post.gallery_base64 || []);
    }
    setDialogOpen(true);
  };

  const handleDeleteClick = (post: Post) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', selectedPost.id);
      if (error) throw error;
      setDeleteDialogOpen(false);
      setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!selectedPost || !title || !content) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsProcessing(true);
    try {
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const updateData: any = {
        title,
        content,
        slug,
      };

      if (imageFiles && imageFiles.length > 0) {
        const imageBase64Array: string[] = [];

        // Convert all files to base64
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          console.log(`Converting file ${i + 1} to base64: ${file.name}`);
          
          const base64String = await convertFileToBase64(file);
          imageBase64Array.push(base64String);
          
          console.log(`File ${i + 1} converted successfully`);
        }

        updateData.featured_image_base64 = imageBase64Array[0];
        updateData.gallery_base64 = imageBase64Array;
      }

      const { error } = await supabase.from('blog_posts').update(updateData).eq('id', selectedPost.id);
      if (error) throw error;
      resetForm();
      setDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setDialogOpen(true);
        }} className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
          <UploadCloud className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {/* Add/Edit Post Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-medium">Content</Label>
              <div className="rounded-lg overflow-hidden">
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your blog content"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Featured Image</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:border-gray-400 bg-gray-50 relative"
                onClick={() => document.getElementById('featured-image-input')?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    const dt = new DataTransfer();
                    Array.from(files).forEach(file => dt.items.add(file));
                    setImageFiles(dt.files);
                    imagePreviews.forEach(url => URL.revokeObjectURL(url));
                    const previews = Array.from(files).map((file) => URL.createObjectURL(file));
                    setImagePreviews(previews);
                  }
                }}
              >
                <Input
                  id="featured-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                <div className="font-medium text-gray-700">Click or drag images to upload</div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB each</div>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-[4/3] rounded-lg overflow-hidden border">
                      <Image
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:text-red-500"
                          onClick={e => {
                            e.stopPropagation();
                            const newPreviews = [...imagePreviews];
                            newPreviews.splice(idx, 1);
                            setImagePreviews(newPreviews);
                            const dt = new DataTransfer();
                            const files = Array.from(imageFiles || []);
                            files.splice(idx, 1);
                            files.forEach(file => dt.items.add(file));
                            setImageFiles(dt.files);
                          }}
                        >
                          <UploadCloud className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              className="w-full h-12 text-base bg-black text-white hover:bg-gray-800 transition-colors" 
              onClick={selectedPost ? handleUpdatePost : handleCreatePost}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {selectedPost ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                selectedPost ? 'Update Post' : 'Publish Post'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this blog post? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden group hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={(() => {
                      console.log("Post image base64:", post.featured_image_base64 ? "Present" : "Not present");
                      console.log("Gallery base64:", post.gallery_base64);
                      
                      // Use base64 image if available
                      if (post.featured_image_base64) {
                        return post.featured_image_base64;
                      }
                      
                      return defaultImageUrl;
                    })()}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error("Image failed to load");
                      e.currentTarget.src = defaultImageUrl;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </div>
                <CardContent className="p-4 lg:p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg lg:text-xl mb-2 group-hover:text-gray-900 transition line-clamp-2 min-h-[3.5rem]">
                    {post.title}
                  </h3>
                  <div 
                    className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: truncateHtmlContent(post.content || "", 120)
                    }}
                    style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                    }}
                  />
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Published
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-black text-white hover:bg-gray-800"
                        onClick={() => handleEditClick(post)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(post)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 lg:py-20">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-500 mb-6">Create your first blog post to get started</p>
          <Button onClick={() => {
            resetForm();
            setDialogOpen(true);
          }} className="bg-black text-white hover:bg-gray-800">
            <UploadCloud className="mr-2 h-4 w-4" />
            Create First Post
          </Button>
        </div>
      )}
    </div>
  );
}