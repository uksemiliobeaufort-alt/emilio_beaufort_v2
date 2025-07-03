"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "../components/RichTextEditor";
import { Loader2, Pencil, Trash2, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setPosts(data);
      })
      .catch(error => {
        console.error("Failed to fetch posts:", error);
        toast.error("Failed to fetch posts");
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingPost(null);
  };

  const handleCreatePost = () => {
    if (!title || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const postData = {
      title,
      content,
      slug,
      excerpt: content.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
    };

    setLoading(true);

    const url = editingPost ? '/api/blog' : '/api/blog';
    const method = editingPost ? 'PUT' : 'POST';
    const successMessage = editingPost ? "Post updated successfully" : "Post created successfully";
    const errorMessage = editingPost ? "Failed to update post" : "Failed to create post";

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingPost ? { ...postData, id: editingPost.id } : postData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        toast.success(successMessage);
        resetForm();
        setDialogOpen(false);
        fetchPosts();
      })
      .catch(error => {
        console.error("Post operation failed:", error);
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setDialogOpen(true);
  };

  const handleDeletePost = (post: Post) => {
    setLoading(true);
    fetch(`/api/blog?id=${post.id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        toast.success("Post deleted successfully");
        setPostToDelete(null);
        fetchPosts();
      })
      .catch(error => {
        console.error("Failed to delete post:", error);
        toast.error("Failed to delete post");
      })
      .finally(() => setLoading(false));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setDialogOpen(true)}>
          Create New Post
        </Button>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-4">
                    <span className="font-serif">{post.title}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Link
                    href={`/journal/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                  >
                    <Eye className="w-4 h-4" />
                    View Post
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingPost ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingPost ? 'Update Post' : 'Create Post'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              "{postToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => postToDelete && handleDeletePost(postToDelete)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 