"use client";

import React from "react";
import { FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";

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
            you’re here for education, entertainment, or connection, we strive
            to bring you content that resonates and empowers.
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
              <h3 className="text-xl font-semibold">Satyam kumar singh</h3>
              <p className="text-gray-600 mt-2">
                Satyam Kumar Singh is a B.Tech student specializing in Computer
                Science. He is a passionate storyteller who weaves narratives
                that connect technology and life. A true tech enthusiast, he
                loves exploring cutting-edge innovations and their real-world
                impact. Satyam is equally fascinated by culture, often blending
                tradition with modern ideas in his work. With a curious mind and
                creative spirit, he bridges the gap between code, culture, and
                creativity.
              </p>
              <div className="flex gap-4 text-purple-600 text-lg mt-4">
                <a
                  href="https://www.linkedin.com/in/satyam-kumar-singh-00570828a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  aria-label="Linkedin"
                >
                  <FaLinkedin />
                </a>
                <a href="https://x.com/Satyamkumar_85" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a
                  href="https://www.instagram.com/_satyam_._16?igsh=emozZGtub2w4cjJt"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </div>
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
