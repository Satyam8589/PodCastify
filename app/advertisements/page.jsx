"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackContentInteraction } from "../../components/AnalyticsTracker";

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "product", label: "Products" },
    { value: "service", label: "Services" },
    { value: "event", label: "Events" },
    { value: "promotion", label: "Promotions" },
    { value: "brand", label: "Brand" },
    { value: "other", label: "Other" },
  ];

  const fetchAdvertisements = async (
    pageNum = 1,
    categoryFilter = "all",
    reset = false
  ) => {
    try {
      setLoading(pageNum === 1);

      let url = `/api/advertisements?page=${pageNum}&limit=9&sort=latest`;
      if (categoryFilter !== "all") {
        url += `&category=${categoryFilter}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        if (reset || pageNum === 1) {
          setAdvertisements(data.data);
        } else {
          setAdvertisements((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
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

  useEffect(() => {
    fetchAdvertisements(1, category, true);
    setPage(1);
  }, [category]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAdvertisements(nextPage, category, false);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  if (loading && advertisements.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 md:px-12 lg:px-24 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1C24] mb-8">
            Advertisements
          </h1>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-4 md:px-12 lg:px-24 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1C24] mb-8">
            Advertisements
          </h1>
          <div className="text-center py-8">
            <p className="text-red-600">
              Error loading advertisements: {error}
            </p>
            <button
              onClick={() => fetchAdvertisements(1, category, true)}
              className="mt-4 bg-[#5E5ADB] text-white px-6 py-2 rounded-lg hover:bg-[#4A46B8] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 md:px-12 lg:px-24 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1C24] mb-4 md:mb-0">
            Advertisements
          </h1>
          <p className="text-gray-600">
            {total > 0
              ? `${total} advertisement${total !== 1 ? "s" : ""} found`
              : "No advertisements found"}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat.value
                    ? "bg-[#5E5ADB] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {advertisements.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No advertisements found
            </h3>
            <p className="text-gray-500">
              {category === "all"
                ? "There are no advertisements available at the moment."
                : `No advertisements found in the "${
                    categories.find((c) => c.value === category)?.label
                  }" category.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {advertisements.map((ad) => (
                <div
                  key={ad._id}
                  className="rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <Image
                      src={ad.image?.url || "/images/default-ad.jpg"}
                      alt={ad.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    {ad.priority === "featured" && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    {ad.category && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {ad.category}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
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
                        className="bg-[#5E5ADB] text-white px-4 py-2 rounded-lg hover:bg-[#4A46B8] transition-colors text-sm font-medium"
                      >
                        Learn More
                      </Link>
                      <div className="text-xs text-gray-500">
                        {new Date(
                          ad.createdAt || ad.startDate
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="bg-[#5E5ADB] text-white px-8 py-3 rounded-lg hover:bg-[#4A46B8] transition-colors font-medium"
                >
                  Load More Advertisements
                </button>
              </div>
            )}

            {loading && advertisements.length > 0 && (
              <div className="text-center mt-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5E5ADB]"></div>
                  <span className="text-gray-600">Loading more...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
