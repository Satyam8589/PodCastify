"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { trackContentInteraction } from "./AnalyticsTracker";

export default function LatestAdvertisements() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/advertisements?limit=3&sort=latest");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setAdvertisements(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch advertisements");
        }
      } catch (error) {
        console.error("Error fetching advertisements:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  if (loading) {
    return (
      <section className="px-4 md:px-12 lg:px-24 py-12 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
            Latest Advertisements
          </h2>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden shadow-md border border-gray-200 animate-pulse"
            >
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 md:px-12 lg:px-24 py-12 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
            Latest Advertisements
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading advertisements: {error}</p>
        </div>
      </section>
    );
  }

  if (advertisements.length === 0) {
    return (
      <section className="px-4 md:px-12 lg:px-24 py-12 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
            Latest Advertisements
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">
            No advertisements available at the moment.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
          Latest Advertisements
        </h2>
        <Link
          href={"/advertisements"}
          prefetch={false}
          className="text-sm text-[#5E5ADB] font-semibold hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {advertisements.map((ad) => (
          <div
            key={ad._id}
            className="rounded-2xl overflow-hidden shadow-md border border-gray-200"
          >
            <Image
              src={ad.image?.url || "/images/default-ad.jpg"}
              alt={ad.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                {ad.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {ad.shortDescription || ad.description}
              </p>
              <div className="flex items-center justify-between">
                <Link
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackContentInteraction(
                      "advertisement",
                      ad._id.toString(),
                      ad.title,
                      "click"
                    )
                  }
                  className="text-[#5E5ADB] font-semibold text-sm hover:underline"
                >
                  Learn More →
                </Link>
                {ad.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {ad.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
