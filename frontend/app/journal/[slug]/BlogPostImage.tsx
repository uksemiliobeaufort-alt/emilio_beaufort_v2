
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  onError?: () => void;
};

export default function PostImage({ src, alt, onError }: Props) {
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden mb-10">
      <Image
        src={src}
        alt={alt}
        loading="lazy"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={onError}
      />
    </div>
  );
}
