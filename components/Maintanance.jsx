import React from "react";

const Maintanance = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Glowing Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-600 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-blue-600 opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      </div>

      {/* Main Message */}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
          🚧 Site Under Maintenance
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          We're currently working on something awesome. <br /> Please check back
          later!
        </p>
        <div className="mt-8">
          <span className="text-sm text-gray-400">
            Need help?{" "}
            <a href="mailto:support@example.com" className="underline">
              Contact Support
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Maintanance;
