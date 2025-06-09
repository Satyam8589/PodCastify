import Image from 'next/image';

export default function BlogImage({ src, alt }) {
  return (
    <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-xl shadow-md mb-6">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
        priority
      />
    </div>
  );
}
