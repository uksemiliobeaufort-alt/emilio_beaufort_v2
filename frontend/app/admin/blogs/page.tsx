"use client";

import { useEffect, useState } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { getImageUrl, supabase } from "@/lib/supabase";
import {
  firestore,
  uploadBlogImagesToFirebase /* getFirebaseStorageUrl, checkFirebaseStorageAccess */,
} from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query /* orderBy */,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Pencil,
  Trash2,
  // UploadCloud,
  // Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
// import RichTextEditor from "@/components/ui/RichTextEditor";
// import EnhancedEditor from "@/components/ui/EnhancedEditor";
import TipTapEditor from "@/app/admin/components/TipTapEditor";
import AIBlogGenerationDialog from "@/app/admin/components/AIBlogGenerationDialog";
import PermissionGuard from "@/components/PermissionGuard";
import { getSafeImageUrl } from "@/lib/utils";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  created_at: string;
  updated_at?: string | null;
  keywords?: string[];
  tags?: string[];
}

export default function AdminBlogsPage() {
  return (
    <PermissionGuard requiredPermission="manage_blog">
      <AdminBlogsPageContent />
    </PermissionGuard>
  );
}

function AdminBlogsPageContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const defaultImageUrl = "/default-image.jpg";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(firestore, "blog_posts"));
      const querySnapshot = await getDocs(q);
      const firebasePosts: Post[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || "",
          slug: d.slug || "",
          content: d.content || "",
          featured_image_url: d.featured_image_url || "",
          gallery_urls: d.gallery_urls || [],
          created_at:
            d.created_at && d.created_at.toDate
              ? d.created_at.toDate().toISOString()
              : d.created_at || new Date().toISOString(),
          updated_at:
            d.updated_at && d.updated_at.toDate
              ? d.updated_at.toDate().toISOString()
              : d.updated_at || null,
          keywords: d.keywords || [],
          tags: d.tags || [],
        };
      });
      firebasePosts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPosts(firebasePosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to fetch posts. Please check your connection.");
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
      reader.onerror = (error) => reject(error);
    });
  };

  // const stripHtmlAndTruncate = (html: string, maxLength: number = 100): string => {
  //   const tempDiv = document.createElement("div");
  //   tempDiv.innerHTML = html;
  //   const textContent = tempDiv.textContent || tempDiv.innerText || "";
  //   return textContent.length > maxLength
  //     ? textContent.slice(0, maxLength) + "..."
  //     : textContent;
  // };

  const truncateHtmlContent = (
    html: string,
    maxLength: number = 200
  ): string => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    if (textContent.length <= maxLength) {
      return html;
    }
    const truncatedText = textContent.slice(0, maxLength) + "...";
    return `<p>${truncatedText}</p>`;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setImageFiles(files);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
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
    setKeywords([]);
    setTags([]);
    setKeywordInput("");
    setTagInput("");
  };

  const handleCreatePost = async () => {
    if (!title || !content || !imageFiles || imageFiles.length === 0) {
      toast.error("Please fill all fields and upload at least one image.");
      return;
    }
    setIsProcessing(true);
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    try {
      const filesArray = Array.from(imageFiles);
      const imageUrls = await uploadBlogImagesToFirebase(filesArray, slug);
      await addDoc(collection(firestore, "blog_posts"), {
        title,
        slug,
        content,
        featured_image_url: imageUrls[0],
        gallery_urls: imageUrls,
        keywords,
        tags,
        created_at: serverTimestamp(),
      });
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
    setKeywords(post.keywords || []);
    setTags(post.tags || []);
    setKeywordInput("");
    setTagInput("");
    if (post.featured_image_url) {
      const safe = getSafeImageUrl(post.featured_image_url, defaultImageUrl);
      setImagePreviews([safe]);
    } else {
      setImagePreviews([]);
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
      await deleteDoc(doc(firestore, "blog_posts", selectedPost.id));
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
      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const updateData: Partial<Post> = {
        title,
        content,
        slug,
        keywords,
        tags,
      };
      if (imageFiles && imageFiles.length > 0) {
        const filesArray = Array.from(imageFiles);
        const imageUrls = await uploadBlogImagesToFirebase(filesArray, slug);
        updateData.featured_image_url = imageUrls[0];
        updateData.gallery_urls = imageUrls;
      }
      await updateDoc(doc(firestore, "blog_posts", selectedPost.id), updateData);
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

  const handleAIBlogGenerated = async (blogData: {
    title: string;
    content: string;
    keywords: string[];
    tags: string[];
    images?: string[];
  }) => {
    setTitle(blogData.title);
    setContent(blogData.content);
    setKeywords(blogData.keywords);
    setTags(blogData.tags);
    if (blogData.images && blogData.images.length > 0) {
      try {
        const files = await Promise.all(
          blogData.images.map(async (src, idx) => {
            const res = await fetch(src);
            const blob = await res.blob();
            const ext = blob.type.split("/")[1] || "png";
            return new File([blob], `ai-image-${idx + 1}.${ext}`, {
              type: blob.type || "image/png",
            });
          })
        );
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        setImageFiles(dt.files);
        setImagePreviews(blogData.images);
      } catch (e) {
        console.error("Failed to prepare AI images for upload", e);
        setImagePreviews(blogData.images);
        setImageFiles(null);
      }
    }
    setDialogOpen(true);
    toast.success("AI-generated content loaded! Images included.");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setAiDialogOpen(true)}>AI Generate Blog</Button>
          <Button onClick={() => setDialogOpen(true)}>+ New Post</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No blog posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              {post.featured_image_url && (
                <Image
                  src={getSafeImageUrl(
                    post.featured_image_url,
                    defaultImageUrl
                  )}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-4">
                <h2 className="font-bold text-lg">{post.title}</h2>
                <div
                  className="text-sm text-gray-600 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: truncateHtmlContent(post.content, 150),
                  }}
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(post)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>
            <div>
              <Label>Content</Label>
              <TipTapEditor content={content} setContent={setContent} />
            </div>
            <div>
              <Label>Upload Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <div className="flex flex-wrap mt-2 gap-2">
                {imagePreviews.map((src, idx) => (
                  <Image
                    key={idx}
                    src={getSafeImageUrl(src, defaultImageUrl)}
                    alt={`Preview ${idx + 1}`}
                    width={100}
                    height={100}
                    className="w-24 h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Keywords</Label>
              <div className="flex space-x-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add keyword"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && keywordInput.trim()) {
                      e.preventDefault();
                      setKeywords([...keywords, keywordInput.trim()]);
                      setKeywordInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (keywordInput.trim()) {
                      setKeywords([...keywords, keywordInput.trim()]);
                      setKeywordInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap mt-2 gap-2">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      e.preventDefault();
                      setTags([...tags, tagInput.trim()]);
                      setTagInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim()) {
                      setTags([...tags, tagInput.trim()]);
                      setTagInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap mt-2 gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={selectedPost ? handleUpdatePost : handleCreatePost}
                disabled={isProcessing}
              >
                {isProcessing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this post?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Blog Generation Dialog */}
      <AIBlogGenerationDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onBlogGenerated={handleAIBlogGenerated}
      />
    </div>
  );
}
