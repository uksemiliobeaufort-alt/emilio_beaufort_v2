"use client";

import { getPostBySlug } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  const defaultImage = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/the-house/Cosmetics Banner.jpeg`;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 md:pt-36 lg:pt-40 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">{post.title}</h1>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="relative w-full aspect-video rounded-md overflow-hidden mb-10">
              <Image
                src={post.featuredImageUrl || defaultImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="prose prose-lg max-w-none mb-12">
              {post.content}
            </div>

            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-[#B7A16C] transition-colors duration-300 group"
            >
              <span className="mr-2 text-sm font-medium">←</span>
              <span className="text-sm font-medium group-hover:underline">Back to Journal</span>
            </Link>
          </article>
        </div>
      </main>
    </div>
  );
}
