import React from "react";
import Image from "next/image";

const About = () => {
  return (
    <section className="bg-white py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Image */}
        <div className="transform transition duration-300 hover:scale-105 hover:shadow-lg w-full lg:w-1/2">
          <Image
            src="/images/about_prodcast_img.jpg"
            alt="About PodCastify"
            width={600}
            height={400}
            className="rounded-xl shadow-lg w-full h-auto object-cover"
          />
        </div>

        {/* Text */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About PodCastify
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            PodCastify is your go-to hub for discovering the best podcasts from
            around the globe. Our mission is to connect you with stories and
            insights that matter, delivered by inspiring voices from all walks
            of life.
          </p>

          {/* Icons Section */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
            <div className="flex flex-col items-center">
              <Image
                src="/icons/mic.svg"
                alt="Episodes"
                width={32}
                height={32}
              />
              <p className="text-sm font-medium mt-2">1000+ Episodes</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/icons/topics.svg"
                alt="Topics"
                width={32}
                height={32}
              />
              <p className="text-sm font-medium mt-2">Diverse Topics</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/icons/globe.svg"
                alt="Global Hosts"
                width={32}
                height={32}
              />
              <p className="text-sm font-medium mt-2">Global Hosts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
