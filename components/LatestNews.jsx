"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";

const newsItems = [
  {
    id: 1,
    title: 'PodCastify Reaches 1 Million Listeners',
    description:
      'We are thrilled to announce a new milestone as our community grows bigger and stronger.',
    image: '/images/news1.jpg', // ✅ corrected path
    link: '#',
  },
  {
    id: 2,
    title: 'Upcoming Live Event: Meet the Hosts',
    description:
      'Join us for an interactive session with your favorite podcast hosts, live Q&A and more.',
    image: '/images/news2.jpg', // ✅
    link: '#',
  },
  {
    id: 3,
    title: 'New App Update Now Available',
    description:
      'Experience a smoother, faster, and more personalized podcast journey with our latest app update.',
    image: '/images/news3.jpg', // ✅
    link: '#',
  },
];


export default function LatestNews() {
  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
          Latest News
        </h2>
        <Link
          href={"/news"}
          prefetch={false}
          className="text-sm text-[#5E5ADB] font-semibold hover:underline"
        >
          Read All →
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden shadow-md border border-gray-200"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <Link
                href={item.link}
                className="text-[#5E5ADB] font-semibold text-sm hover:underline"
              >
                Read More →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
