import Link from "next/link";

type Props = {
  tags: string[];
};

export default function PostTags({ tags }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {tags.map((tag, idx) => (
        <Link key={idx} href={`/journal/tag/${encodeURIComponent(tag)}`}>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 transition">
            #{tag}
          </span>
        </Link>
      ))}
    </div>
  );
}
