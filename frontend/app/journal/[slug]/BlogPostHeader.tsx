
type PostHeaderProps = {
  title: string;
  created_at: string;
};

export default function PostHeader({ title, created_at }: PostHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">{title}</h1>
      <p className="text-sm text-gray-500">
        {new Date(created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
