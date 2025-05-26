import React from "react";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  const podcasts = [
    {
      title: "Why AI is Eating the World",
      description:
        "Exploring the rise of artificial intelligence and its impact on society",
      date: "May 25, 2025",
      time: "10:00 AM",
      thumbnail: "/images/ai-world.jpg",
    },
    {
      title: "The Future of Work",
      description: "Exploring the rise of artificial intelligence",
      date: "May 20, 2025",
      time: "08:00 AM",
      thumbnail: "/images/future-work.jpg",
    },
    {
      title: "Health and Wellness",
      description: "Tips and insights on wellness",
      date: "May 19, 2025",
      time: "02:50 PM",
      thumbnail: "/images/health.jpg",
    },
    {
      title: "The Entrepreneurial Journey",
      description: "Deep insights from founders",
      date: "May 15, 2025",
      time: "11:00 AM",
      thumbnail: "/images/entrepreneur.jpg",
    },
    {
      title: "Exploring the Cosmos",
      description: "Space, telescopes, and wonder",
      date: "May 10, 2025",
      time: "04:00 PM",
      thumbnail: "/images/cosmos.jpg",
    },
    {
      title: "History’s Greatest Mysteries",
      description: "Time travel through secrets",
      date: "May 5, 2025",
      time: "01:20 PM",
      thumbnail: "/images/mystery.jpg",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔁 Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔳 Overlay Content */}
      <div className="relative z-10 backdrop-blur-md bg-black/40 min-h-screen text-white px-4 md:px-12 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            🎙️ Welcome to the <span className="text-orange-400">Podcast Hub</span>
          </h1>
          <p className="mt-2 text-gray-200">Discover deep conversations and exciting stories</p>
          <button className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-full shadow hover:bg-orange-600 transition">
            Start Listening
          </button>
        </div>

        {/* Featured Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="rounded-xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-md">
            <Image
              src="/images/ai-world.jpg"
              alt="AI Episode"
              width={800}
              height={400}
              className="w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white">Why AI is Eating the World</h2>
              <p className="mt-2 text-gray-200">
                Exploring the rise of artificial intelligence and its impact on society.
              </p>
              <p className="mt-2 text-sm text-gray-300">May 25, 2025 • 10:00 AM</p>
            </div>
          </div>
        </div>

        {/* Grid of Episodes */}
        <h2 className="text-2xl font-bold text-center text-white mb-6">All Podcast Episodes</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto ">
          {podcasts.map((podcast, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Image
                src={podcast.thumbnail}
                alt={podcast.title}
                width={400}
                height={200}
                className="w-full h-48 cursor-pointer object-cover"
              />
              <div className="p-4 text-white">
                <h3 className="font-bold text-lg">{podcast.title}</h3>
                <p className="text-sm text-gray-200 mt-1">{podcast.description}</p>
                <p className="text-xs text-gray-300 mt-2">
                  {podcast.date} • {podcast.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-orange-500 text-white px-6 py-2 rounded-full shadow hover:bg-orange-600 transition">
            Load More Episodes
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
