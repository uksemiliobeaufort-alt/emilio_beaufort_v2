"use client";

import { useEffect, useState, useRef } from "react";
// import Image from "next/image"; // Commented out to avoid Vercel billing
import Link from "next/link";
import { motion } from "framer-motion";
import { api, Post } from "@/lib/api";
import { getImageUrl, supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
 

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const defaultImageUrl = getImageUrl("the-house", "Cosmetics Banner.webp");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setImageFiles(files);

    const previews = Array.from(files).map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleCreatePost = async () => {
    if (!title || !content || !imageFiles || imageFiles.length === 0) {
      alert("Please fill all fields and upload at least one image.");
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    try {
      const imageUrls: string[] = [];

      for (const file of Array.from(imageFiles)) {
        const filePath = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("the-house")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        imageUrls.push(getImageUrl("the-house", filePath));
      }

      await api.createPost({
        title,
        content,
        slug,
        featuredImageUrl: imageUrls[0],
        gallery: imageUrls,
      });

      alert("Post created!");
      setTitle("");
      setContent("");
      setImageFiles(null);
      setImagePreviews([]);
      setDialogOpen(false);
      location.reload();
    } catch (error) {
      console.error("Post creation failed", error);
      alert("Failed to create post");
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">All Blog Posts</h1>
          <Button onClick={() => setDialogOpen(true)} className="bg-black text-white">
            + Add New Post
          </Button>
        </div>

        

        {/* Add Post Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog content"
                />
              </div>
              <div>
                <Label>Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-full aspect-[4/3] rounded-md overflow-hidden">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button className="w-full bg-black text-white" onClick={handleCreatePost}>
                Publish Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Post Grid */}
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href={`/journal/${post.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg cursor-pointer group transition">
                      <div className="relative aspect-[4/3]">
                        <img
                          src={post.featuredImageUrl || defaultImageUrl}
                          alt={post.title}
                          loading="lazy"
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold text-xl mb-1 group-hover:text-gray-900 transition">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {post.content?.slice(0, 100)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-4">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="mt-4 pt-4 border-t">
                          <Button className="w-full bg-black text-white hover:bg-gray-800">
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            

            
          </>
        ) : (
          <p className="text-center text-gray-500">No blog posts found.</p>
        )}
      </div>
    </div>
  );
}
