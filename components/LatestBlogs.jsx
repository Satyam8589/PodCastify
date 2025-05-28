"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const LatestBlogs = () => {
    
  const blogItems = [
    {
      id: 1,
      title: "The Art of Storytelling in Podcasts",
      description:
        "Discover the techniques that make podcasts captivating and how storytelling can transform your listening experience.",
      image: "/images/blog1.jpg",
      link: "#",
    },
    {
      id: 2,
      title: "Behind the Scenes: Podcast Production",
      description:
        "Ever wondered how your favorite podcasts are made? Take a peek behind the curtain of podcast production.",
      image: "/images/blog2.jpg",
      link: "#",
    },
    {
      id: 3,
      title: "Top 10 Productivity Podcasts for 2025",
      description:
        "Boost your productivity and personal growth with these carefully curated podcast recommendations.",
      image: "/images/blog3.jpg",
      link: "#",
    },
  ];

  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
          Latest Blogs
        </h2>
        <Link
          href={"/blogs"}
          prefetch={false}
          className="text-sm text-[#5E5ADB] font-semibold hover:underline"
        >
          Read All →
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {blogItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white"
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
};

export default LatestBlogs;