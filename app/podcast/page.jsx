"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ExternalLink, Calendar, Clock, Loader2 } from "lucide-react";
import { trackContentInteraction } from "@/components/AnalyticsTracker";

const PodcastPage = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [featuredPodcast, setFeaturedPodcast] = useState(null);

  const ITEMS_PER_PAGE = 6;

  // Fetch podcasts from API with better error handling
  const fetchPodcasts = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null); // Clear previous errors
      }

      const currentOffset = isLoadMore ? offset : 0;
      const url = `/api/podcasts?limit=${ITEMS_PER_PAGE}&offset=${currentOffset}`;

      console.log("Fetching podcasts from:", url); // Debug log

      // Test if the API route exists first
      let response;
      try {
        response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (fetchError) {
        console.error("Fetch failed:", fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      }

      console.log("Response status:", response.status); // Debug log
      console.log("Response ok:", response.ok); // Debug log
      console.log("Response statusText:", response.statusText); // Debug log

      // Check for specific error codes
      if (response.status === 404) {
        throw new Error(
          "API route not found. Make sure /api/podcasts/route.js exists."
        );
      }

      if (response.status === 500) {
        let errorDetails = "Internal server error";
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || errorDetails;
        } catch (e) {
          try {
            errorDetails = await response.text();
          } catch (e2) {
            // Keep default
          }
        }
        throw new Error(`Server error: ${errorDetails}`);
      }

      if (!response.ok) {
        // Get more detailed error information
        let errorMessage = `HTTP ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.log("Error response data:", errorData);
        } catch (e) {
          // If response isn't JSON, get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
            console.log("Error response text:", errorText);
          } catch (e2) {
            // Keep default error message
            console.log("Could not parse error response");
          }
        }
        throw new Error(`Failed to fetch podcasts: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("API Response:", result); // Debug log

      if (result.success) {
        if (isLoadMore) {
          setPodcasts((prev) => [...prev, ...result.data]);
        } else {
          setPodcasts(result.data || []);
          // Set the first podcast as featured
          if (result.data && result.data.length > 0) {
            setFeaturedPodcast(result.data[0]);
          }
        }

        setHasMore(result.hasMore || false);
        setOffset(currentOffset + (result.data?.length || 0));
      } else {
        throw new Error(result.error || "API returned success: false");
      }
    } catch (err) {
      console.error("Error fetching podcasts:", err);
      setError(err.message);

      // If this is the initial load and we get an error, set some fallback data
      if (!isLoadMore && podcasts.length === 0) {
        console.log("Setting fallback data due to API error");
        const fallbackPodcasts = [
          {
            id: "fallback-1",
            title: "Sample Podcast Episode",
            description:
              "This is a sample podcast episode displayed while we resolve API issues.",
            date: "June 8, 2025",
            time: "10:00 AM",
            thumbnail: "/images/default-podcast.jpg",
            podcastLink: "#",
            createdAt: new Date().toISOString(),
          },
        ];
        setPodcasts(fallbackPodcasts);
        setFeaturedPodcast(fallbackPodcasts[0]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load podcasts on component mount
  useEffect(() => {
    fetchPodcasts();
  }, []);

  // Handle podcast link click
  const handlePodcastClick = (podcastId, title) => {
    console.log("handlePodcastClick called with:", { podcastId, title });

    // Track the podcast click
    trackContentInteraction("podcast", podcastId || "unknown", title, "click");

    if (podcastId && podcastId !== "#" && podcastId !== "") {
      // Navigate to individual podcast page
      window.location.href = `/podcast/${podcastId}`;

      // Optional: Track analytics
      console.log(`Podcast clicked: ${title}`);
    } else {
      console.warn(
        "No podcast ID available for:",
        title,
        "ID received:",
        podcastId
      );
      alert("This podcast is not available yet.");
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPodcasts(true);
    }
  };

  // Format date for display
  const formatDate = (date, time) => {
    try {
      const dateObj = new Date(`${date} ${time}`);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date");
      }
      return {
        date: dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch {
      return {
        date: date || "Unknown Date",
        time: time || "Unknown Time",
      };
    }
  };

  // Error state (only show if no podcasts are loaded)
  if (error && !podcasts.length && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">
            ⚠️ Error Loading Podcasts
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <p>Possible causes:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>API route not set up correctly</li>
              <li>Data directory doesn't exist</li>
              <li>Permission issues with file system</li>
              <li>Next.js server not running properly</li>
            </ul>
          </div>
          <button
            onClick={() => fetchPodcasts()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="relative z-10 backdrop-blur-md bg-black/40 min-h-screen text-white px-4 md:px-12 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            🎙️ Welcome to the{" "}
            <span className="text-orange-400">Podcast Hub</span>
          </h1>
          <p className="mt-2 text-gray-200">
            Discover deep conversations and exciting stories
          </p>
          {featuredPodcast && (
            <button
              onClick={() =>
                handlePodcastClick(featuredPodcast.id, featuredPodcast.title)
              }
              className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-full shadow hover:bg-orange-600 transition flex items-center gap-2 mx-auto"
            >
              <Play size={20} />
              Start Listening
            </button>
          )}
        </div>

        {/* Featured Card */}
        {featuredPodcast && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="rounded-xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-md">
              <div
                className="relative group cursor-pointer"
                onClick={() =>
                  handlePodcastClick(featuredPodcast.id, featuredPodcast.title)
                }
              >
                <Image
                  src={
                    featuredPodcast.thumbnail?.url ||
                    featuredPodcast.thumbnail ||
                    "/images/default-podcast.jpg"
                  }
                  alt={featuredPodcast.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = "/images/default-podcast.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-orange-500 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="text-white" size={32} fill="white" />
                  </div>
                </div>
                {featuredPodcast.podcastLink &&
                  featuredPodcast.podcastLink !== "#" && (
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <ExternalLink className="text-white" size={20} />
                    </div>
                  )}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {featuredPodcast.title}
                </h2>
                <p className="text-gray-200 mb-3">
                  {featuredPodcast.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {
                      formatDate(featuredPodcast.date, featuredPodcast.time)
                        .date
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {
                      formatDate(featuredPodcast.date, featuredPodcast.time)
                        .time
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-white" size={32} />
            <span className="ml-2 text-white">Loading podcasts...</span>
          </div>
        )}

        {/* Grid of Episodes */}
        {!loading && podcasts.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              All Podcast Episodes
            </h2>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {podcasts.map((podcast, idx) => {
                const formattedDate = formatDate(podcast.date, podcast.time);
                return (
                  <div
                    key={podcast.id || idx}
                    className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                    onClick={() =>
                      handlePodcastClick(podcast.id, podcast.title)
                    }
                  >
                    <div className="relative">
                      <Image
                        src={
                          podcast.thumbnail?.url ||
                          podcast.thumbnail ||
                          "/images/default-podcast.jpg"
                        }
                        alt={podcast.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "/images/default-podcast.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="bg-orange-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                          <Play className="text-white" size={20} fill="white" />
                        </div>
                      </div>
                      {podcast.podcastLink && podcast.podcastLink !== "#" && (
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ExternalLink className="text-white" size={16} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors">
                        {podcast.title}
                      </h3>
                      <p className="text-sm text-gray-200 mb-3 line-clamp-2">
                        {podcast.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formattedDate.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formattedDate.time}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* No Podcasts Message */}
        {!loading && podcasts.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Podcasts Yet
            </h3>
            <p className="text-gray-300">
              Podcasts will appear here once they are uploaded.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && podcasts.length > 0 && hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-orange-500 text-white px-6 py-2 rounded-full shadow hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Loading...
                </>
              ) : (
                <>Load More Episodes</>
              )}
            </button>
          </div>
        )}

        {/* Error Message for Load More */}
        {error && podcasts.length > 0 && (
          <div className="text-center mt-8 p-4 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-500/30">
            <p className="text-red-200">Error loading more podcasts: {error}</p>
            <button
              onClick={() => fetchPodcasts(true)}
              className="mt-2 text-red-300 hover:text-red-100 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="fixed bottom-4 right-4 bg-red-900/80 text-white p-4 rounded-lg max-w-md text-xs">
            <div className="font-bold mb-2">Debug Info:</div>
            <div>Error: {error}</div>
            <div>Podcasts loaded: {podcasts.length}</div>
            <div>Loading: {loading.toString()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastPage;
