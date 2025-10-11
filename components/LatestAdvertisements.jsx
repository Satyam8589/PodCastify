"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { trackContentInteraction } from "./AnalyticsTracker";

const advertisementItems = [
  {
    id: 1,
    title: "Premium Headphones - 50% Off",
    description:
      "Experience crystal-clear audio with our professional-grade headphones. Limited time offer!",
    image: "/images/news1.jpg", // ✅ corrected path
    link: "#",
  },
  {
    id: 2,
    title: "Best Podcast Equipment Bundle",
    description:
      "Complete podcasting setup including microphone, audio interface, and accessories.",
    image: "/images/news2.jpg", // ✅
    link: "#",
  },
  {
    id: 3,
    title: "Online Course: Podcast Creation",
    description:
      "Learn how to create, edit, and publish professional podcasts with our comprehensive course.",
    image: "/images/news3.jpg", // ✅
    link: "#",
  },
];

export default function LatestAdvertisements() {
  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
          Latest Advertisements
        </h2>
        <Link
          href={"/news"}
          prefetch={false}
          className="text-sm text-[#5E5ADB] font-semibold hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {advertisementItems.map((item) => (
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
                onClick={() =>
                  trackContentInteraction(
                    "advertisement",
                    item.id.toString(),
                    item.title,
                    "click"
                  )
                }
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
