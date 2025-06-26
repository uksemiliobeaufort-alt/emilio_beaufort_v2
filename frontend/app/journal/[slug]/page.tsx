import Link from "next/link";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-heading mb-4">Journal Post</h1>
        <p className="text-muted-foreground mb-8">
          Post: {params.slug}
        </p>
        <Link href="/journal" className="text-accent hover:underline">
          Back to Journal
        </Link>
      </div>
    </div>
  );
} 