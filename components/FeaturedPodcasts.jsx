import React from "react";
import PodcastCard from "./PodcastCard";

const FeaturedPodcasts = () => {
  const podcasts = [
    {
      title: "The Creative Minds",
      desc: "Exploring the stories of creative leaders.",
      time: "42 min",
      image: "/images/podcast1.jpg",
    },
    {
      title: "Tech Talks Weekly",
      desc: "Stay ahead with tech and innovation.",
      time: "35 min",
      image: "/images/podcast2.jpg",
    },
    {
      title: "Wellness Waves",
      desc: "Your guide to a mindful lifestyle.",
      time: "28 min",
      image: "/images/podcast3.jpg",
    },
    {
      title: "Entrepreneur Edge",
      desc: "Unveiling secrets from business leaders.",
      time: "50 min",
      image: "/images/podcast4.jpg",
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Featured Podcasts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {podcasts.map((podcast, i) => (
            <PodcastCard key={i} {...podcast} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPodcasts;
