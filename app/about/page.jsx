"use client";

import React from "react";

const page = () => {
  return (
    <div className="bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 min-h-screen flex flex-col">
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">About Our Podcast</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Dive deep into stories, insights, and conversations that matter. We
          bring you the voices behind the ideas.
        </p>
      </section>

      {/* Mission Statement */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          Our podcast aims to inspire and inform by sharing authentic stories
          and expert knowledge from diverse voices around the world. Whether
          you’re here for education, entertainment, or connection, we strive to
          bring you content that resonates and empowers.
        </p>
      </section>

      {/* Meet the Hosts */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Meet the Hosts
        </h2>
        <div className="flex flex-col md:flex-row md:justify-center gap-10">
          {/* Host 1 */}
          <div className="flex flex-col items-center text-center max-w-xs mx-auto">
            <img
              src="/images/host1.jpg"
              alt="Host 1"
              className="w-32 h-32 rounded-full border border-black object-cover mb-4"
            />
            <h3 className="text-xl font-semibold">Alex Johnson</h3>
            <p className="text-gray-600 mt-2">
              Alex is a storyteller and tech enthusiast who loves diving into
              culture and innovation.
            </p>
          </div>

          {/* Host 2 */}
          <div className="flex flex-col items-center text-center max-w-xs mx-auto">
            <img
              src="/images/host2.jpg"
              alt="Host 2"
              className="w-32 h-32 rounded-full border border-black object-cover mb-4"
            />
            <h3 className="text-xl font-semibold">Maya Lee</h3>
            <p className="text-gray-600 mt-2">
              Maya brings a background in journalism and a passion for
              uncovering untold stories.
            </p>
          </div>
        </div>
      </section>

      {/* Why Listen to Us */}
      <section className="mb-16 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-6">Why Listen to Us?</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg">
          <li>Insightful interviews with industry leaders</li>
          <li>Authentic stories that spark curiosity</li>
          <li>High-quality production with engaging content</li>
          <li>Community-driven topics based on listener feedback</li>
        </ul>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <p className="text-lg mb-6">
          Enjoyed what you heard? Join our community!
        </p>
        <a
          href="/subscribe"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Subscribe Now
        </a>
      </section>
    </main>
    </div>
  );
};

export default page;
