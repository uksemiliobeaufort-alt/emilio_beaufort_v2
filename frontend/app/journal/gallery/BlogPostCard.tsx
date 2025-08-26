
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShareButtons from "./ShareButtons";
import { BlogPost } from "@/types/BlogPost";




/*interface BlogPost {-----> it was created in under types/BlogPost.ts
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url?: string;
  created_at: string;
}*/

interface BlogPostCardProps {
  post: BlogPost;
  onCopy: (post: BlogPost) => void;
  copied: boolean;
}

export default function BlogPostCard({ post, onCopy, copied }: BlogPostCardProps) {
  return (
    <Link href={`/journal/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer group h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-gray-100">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-xl mb-1 group-hover:text-gray-900 transition line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-2 flex-1">
            {post.content?.replace(/<[^>]+>/g, "").slice(0, 150)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <ShareButtons post={post} onCopy={onCopy} copied={copied} />
          <Button className="w-full bg-black text-white hover:bg-gray-800 mt-4">Read Article</Button>
        </CardContent>
      </Card>
    </Link>
  );
}
