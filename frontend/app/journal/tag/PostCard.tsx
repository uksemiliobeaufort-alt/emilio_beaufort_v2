

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    content?: string;
    featured_image_url?: string;
    created_at: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/journal/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg cursor-pointer group transition">
        <div className="relative aspect-[4/3]">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
              <span>No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-bold text-xl mb-1 group-hover:text-gray-900 transition line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
            {post.content?.replace(/<[^>]+>/g, '').slice(0, 150)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
