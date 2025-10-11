"use client";

import React, { useState, useEffect } from "react";
import PodcastCard from "./PodcastCard";
import Link from "next/link";

const FeaturedPodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured podcasts (first 4)
  useEffect(() => {
    const fetchFeaturedPodcasts = async () => {
      try {
        const response = await fetch("/api/podcasts?limit=4");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setPodcasts(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching featured podcasts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPodcasts();
  }, []);

  const displayPodcasts = podcasts;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Featured Podcasts</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-xl h-64 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayPodcasts.map((podcast) => (
              <div key={podcast.id} className="flex">
                <Link href={`/podcast/${podcast.id}`} className="w-full">
                  <PodcastCard
                    title={podcast.title}
                    desc={podcast.description}
                    time={podcast.time}
                    id={podcast.id}
                    image={
                      podcast.thumbnail?.url ||
                      podcast.thumbnail ||
                      "/images/default-podcast.jpg"
                    }
                  />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPodcasts;
