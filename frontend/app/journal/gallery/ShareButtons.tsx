
"use client";

import { MessageCircle, Linkedin, Twitter, Facebook, Copy, Check } from "lucide-react";
import { BlogPost } from "@/types/BlogPost";

/*interface BlogPost {-----> it was created in under types/BlogPost.ts
  id: string;
  title: string;
  slug: string;
  content: string;
}*/

interface Props {
  post: BlogPost;
  onCopy: (post: BlogPost) => void;
  copied: boolean;
}

export default function ShareButtons({ post, onCopy, copied }: Props) {
  const getPostUrl = () => `https://emiliobeaufort.com/journal/${post.slug}`;

  const openInNewTab = (url: string) => window.open(url, "_blank");

  return (
    <div className="flex items-center justify-between mb-3 mt-2">
      <span className="text-sm text-gray-600 font-medium">Share it:</span>
      <div className="flex items-center gap-2">
        <button
          title="WhatsApp"
          onClick={(e) => {
            e.preventDefault();
            openInNewTab(`https://wa.me/?text=${encodeURIComponent(`Check out this blog post: ${post.title}\n${getPostUrl()}`)}`);
          }}
          className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600"
        >
          <MessageCircle className="w-4 h-4 text-white mx-auto" />
        </button>
        <button
          title="LinkedIn"
          onClick={(e) => {
            e.preventDefault();
            const summary = post.content.replace(/<[^>]+>/g, "").slice(0, 200);
            openInNewTab(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPostUrl())}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(summary)}`);
          }}
          className="w-7 h-7 rounded-full bg-blue-700 hover:bg-blue-800"
        >
          <Linkedin className="w-4 h-4 text-white mx-auto" />
        </button>
        <button
          title="Twitter"
          onClick={(e) => {
            e.preventDefault();
            openInNewTab(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out: ${post.title}`)}&url=${encodeURIComponent(getPostUrl())}`);
          }}
          className="w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-600"
        >
          <Twitter className="w-4 h-4 text-white mx-auto" />
        </button>
        <button
          title="Facebook"
          onClick={(e) => {
            e.preventDefault();
            openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl())}`);
          }}
          className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700"
        >
          <Facebook className="w-4 h-4 text-white mx-auto" />
        </button>
        <button
          title="Copy"
          onClick={(e) => {
            e.preventDefault();
            onCopy(post);
          }}
          className="w-7 h-7 rounded-full bg-gray-300 hover:bg-gray-400"
        >
          {copied ? <Check className="w-4 h-4 text-green-700 mx-auto" /> : <Copy className="w-4 h-4 text-gray-700 mx-auto" />}
        </button>
      </div>
    </div>
  );
}
