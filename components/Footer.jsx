import Link from "next/link";
import React from "react";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-300 py-4 mt-5">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/prod_logo.png"
            alt="PodCastify Logo"
            width={50}
            height={50}
          />
          <h1 className="text-xl font-bold text-purple-700">PodCastify</h1>
        </Link>

        {/* Center: Copyright Text */}
        <p className="text-center text-sm sm:text-base">
          &copy; 2024 PodCastify. All rights reserved.
        </p>

        {/* Right: Social Icons */}
        <div className="flex gap-4 text-purple-600 text-lg">
          <a href="#" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="#" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="#" aria-label="YouTube">
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
