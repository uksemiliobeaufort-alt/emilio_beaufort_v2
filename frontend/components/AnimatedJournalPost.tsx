"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface AnimatedJournalPostProps {
  post: {
    title: string;
    featuredImageUrl: string;
    createdAt: string;
    content: string;
  };
}

export default function AnimatedJournalPost({ post }: AnimatedJournalPostProps) {
  return (
    <article>
      <motion.h1
        className="text-5xl font-heading mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {post.title}
      </motion.h1>

      <motion.div
        className="relative aspect-[2/1] mb-8 overflow-hidden rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Image
          src={post.featuredImageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
      </motion.div>

      <motion.div
        className="text-sm text-gray-500 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </motion.div>

      <motion.div
        className="prose prose-lg max-w-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </motion.div>
    </article>
  );
} 