import FeaturedPodcasts from "@/components/FeaturedPodcasts";
import LatestNews from "@/components/LatestNews";
import Newsletter from "@/components/Newsletter";
import ContactForm from "@/components/ContactForm";
import Button from "@/components/Button";
import About from "@/components/About";
import LatestBlogs from "@/components/LatestBlogs";
import React from "react";
import "./globals.css";

export default function Home() {
  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section with Video Background */}
        <section className="relative overflow-hidden">
          {/* Background Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src="/videos/home_animation.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Optional dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 px-6 py-12 max-w-7xl mx-auto text-white">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Discover, Listen, and Enjoy{" "}
                <span className="text-indigo-300">Top Podcasts</span>
              </h1>
              <p className="text-gray-200">
                Explore trending podcast episodes, insightful interviews, and
                inspiring stories. Stay updated with the latest.
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 transition-colors mt-4">
                <a href="/podcast" className="text-white font-semibold">
                  Explore Podcasts
                </a>
              </Button>
            </div>
            <div className="md:w-1/2">
              <img
                src="/images/FeaturedPodcasts.jpg"
                alt="Podcast Studio"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </section>

        {/* Featured Podcasts */}
        <FeaturedPodcasts />
      </div>

      {/* About Section */}
      <About />

      {/* Latest Blogs */}
      <LatestBlogs />

      {/* Latest News */}
      <LatestNews />

      {/* Newsletter */}
      <Newsletter />

      {/* Contact */}
      <section id="contact" className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>
        <ContactForm />
      </section>
    </>
  );
}
