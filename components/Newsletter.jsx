import React from "react";

const Newsletter = () => {
  return (
    <section className="bg-purple-700 text-white py-12 text-center">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Never Miss an Update!</h2>
        <p className="mb-6 text-sm">
          Subscribe for the latest episodes and news.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-[100px] py-2 rounded-md w-full sm:w-auto text-black"
          />
          <button className="bg-white text-purple-700 px-4 py-2 rounded-md font-semibold">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
