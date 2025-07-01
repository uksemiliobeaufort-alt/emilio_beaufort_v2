"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getPosts, Post } from "@/lib/api";
import LoginPopup from "../auth/LoginPopup";

import { Card, CardContent } from "@/components/ui/card";
import SectionWrapper from "@/components/SectionWrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function JournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Post:", { title, description, image });
    // You can integrate actual API here
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <SectionWrapper className="flex justify-center">
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 border-b shadow-sm">
        <h1 className="text-2xl font-bold">The Journal</h1>
        <button
          onClick={() => setLoginOpen(true)}
          className="text-sm bg-black text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </header>

      <LoginPopup open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Hero */}
      <section className="py-16 text-center bg-accent/10">
        <h2 className="text-4xl font-bold mb-2">Latest Insights</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore our latest grooming tips, lifestyle stories, and brand updates.
        </p>
      </section>

      {/* Posts */}
      <SectionWrapper className="py-12">
        {posts.length > 0 ? (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link href={`/journal/${post.slug}`} key={post.id}>
                <Card className="overflow-hidden hover:shadow-md transition cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={post.featuredImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="/placeholder.jpg"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-xl mb-1">{post.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {post.excerpt || post.content.slice(0, 100)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground mt-10">
            No blog posts yet.
          </div>
        )}
      </SectionWrapper>

      {/* Create New Post Section */}
      <SectionWrapper className="py-12 border-t">
        <div className="max-w-xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">Create New Post</h3>
          <form onSubmit={handleNewPost} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something insightful..."
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Upload Image</label>
              <Input
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit">Publish</Button>
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}
