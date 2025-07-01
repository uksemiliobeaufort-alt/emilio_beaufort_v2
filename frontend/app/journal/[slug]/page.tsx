import { getPostBySlug } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-background text-foreground">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold font-heading mb-2">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="relative w-full aspect-video rounded-md overflow-hidden mb-8">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
          {post.content}
        </div>

        <Link href="/journal" className="text-accent hover:underline text-sm">
          ← Back to Journal
        </Link>
      </div>
    </div>
  );
}
