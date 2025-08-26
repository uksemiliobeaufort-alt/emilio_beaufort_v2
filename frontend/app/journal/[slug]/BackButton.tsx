
'use client';
import { useRouter } from "next/navigation";

type Props = {
  label?: string;
};

export default function BackButton({ label = "Back to Journal" }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-gray-600 hover:text-[#B7A16C] transition-colors duration-300 group mt-8"
    >
      <span className="mr-2 text-sm font-medium">←</span>
      <span className="text-sm font-medium group-hover:underline">{label}</span>
    </button>
  );
}
