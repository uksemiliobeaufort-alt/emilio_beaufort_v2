import { getPostBySlug } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold font-serif mb-2">{post.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="relative w-full aspect-video rounded-md overflow-hidden mb-8">
          <Image
            src={post.featuredImageUrl || '/images/Cosmetics Banner.jpeg'}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none mb-10">
          {post.content}
        </div>

        <Link 
          href="/journal" 
          className="inline-flex items-center text-gray-600 hover:text-[#B7A16C] transition-colors duration-300 group"
        >
          <span className="mr-2 text-sm font-medium">←</span>
          <span className="text-sm font-medium group-hover:underline">Back to Journal</span>
        </Link>
      </div>
    </div>
  );
}
