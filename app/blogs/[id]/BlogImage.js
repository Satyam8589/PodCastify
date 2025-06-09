'use client';

import Image from 'next/image';

// Client component for handling image errors
export default function BlogImage({ src, alt, className, priority = false }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      className={className}
      priority={priority}
      onError={(e) => {
        console.error('Error loading image:', src);
        e.target.style.display = 'none';
      }}
    />
  );
}