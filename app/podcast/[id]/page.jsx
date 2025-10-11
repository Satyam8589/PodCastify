"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import {
  extractYouTubeVideoId,
  generateYouTubeEmbedUrl,
} from "../../../lib/youtube";
import MobileLandscapePlayer from "../../../components/MobileLandscapePlayer";

// YouTube Player Component
const YouTubePlayer = ({ videoId, title }) => {
  if (!videoId) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Invalid YouTube URL</p>
      </div>
    );
  }

  const embedUrl = generateYouTubeEmbedUrl(videoId, {
    autoplay: "0",
    rel: "0",
    modestbranding: "1",
    controls: "1",
    showinfo: "0",
  });

  return (
    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const PodcastDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const podcastId = params.id;
  const videoId = podcast ? extractYouTubeVideoId(podcast.podcastLink) : null;

  // Fetch individual podcast
  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/podcasts/${podcastId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch podcast: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          setPodcast(result.data);
        } else {
          throw new Error(result.error || "Failed to load podcast");
        }
      } catch (err) {
        console.error("Error fetching podcast:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (podcastId) {
      fetchPodcast();
    }
  }, [podcastId]);

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  // Share function
  const shareContent = async () => {
    if (navigator.share && podcast) {
      try {
        await navigator.share({
          title: podcast.title,
          text: podcast.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading podcast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-300">Podcast not found</p>
          <button
            onClick={() => router.push("/podcast")}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Back to Podcasts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/podcast")}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              Back to Podcasts
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={shareContent}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition"
              >
                <Share2 size={16} />
                Share
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-lg transition"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <MobileLandscapePlayer videoId={videoId} title={podcast.title} />
            </div>

            {/* Podcast Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4 text-white">
                {podcast.title}
              </h1>

              <div className="flex items-center gap-6 text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(podcast.date).toLocaleDateString()}</span>
                </div>

                {podcast.time && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{podcast.time}</span>
                  </div>
                )}

                {podcast.podcastLink && (
                  <a
                    href={podcast.podcastLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition"
                  >
                    <ExternalLink size={16} />
                    Watch on YouTube
                  </a>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-3 text-orange-400">
                  About this episode
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {podcast.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Thumbnail */}
            <div className="mb-6">
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={
                    podcast.thumbnail?.url ||
                    podcast.thumbnail ||
                    "/images/default-podcast.jpg"
                  }
                  alt={podcast.title}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/images/default-podcast.jpg";
                  }}
                />
              </div>
            </div>

            {/* Episode Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Episode Details
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Published:</span>
                  <span className="ml-2 text-white">
                    {new Date(podcast.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {podcast.time && (
                  <div>
                    <span className="text-gray-400">Time:</span>
                    <span className="ml-2 text-white">{podcast.time}</span>
                  </div>
                )}

                <div>
                  <span className="text-gray-400">Episode ID:</span>
                  <span className="ml-2 text-white font-mono text-xs">
                    {podcast.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {podcast.podcastLink && (
                <a
                  href={podcast.podcastLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 px-4 rounded-lg transition font-medium"
                >
                  <ExternalLink size={16} className="inline mr-2" />
                  Open in YouTube
                </a>
              )}

              <button
                onClick={shareContent}
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 px-4 rounded-lg transition font-medium"
              >
                <Share2 size={16} className="inline mr-2" />
                Share Episode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetailPage;
