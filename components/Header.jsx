"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HiMenu, HiX } from "react-icons/hi";

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/podcast", label: "Podcast" },
    { href: "/about", label: "About" },
    { href: "/news", label: "News" },
    { href: "/blogs", label: "Blogs" },
  ];

  return (
    <header className="bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image
              src="/images/prod_logo.png"
              alt="PodCastify Logo"
              width={40}
              height={40}
            />
            <h1 className="text-xl font-bold text-purple-700">PodCastify</h1>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-4 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`cursor-pointer pb-1 ${
                  isActive(link.href)
                    ? "border-b-2 border-purple-700 text-purple-900 font-semibold"
                    : "text-gray-700 hover:text-purple-700"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm">
            Subscribe
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-purple-800 text-2xl focus:outline-none"
          >
            {isOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 bg-gradient-to-r from-purple-200 via-pink-100 to-blue-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
              >
                <span
                  className={`block py-1 ${
                    isActive(link.href)
                      ? "text-purple-900 font-semibold"
                      : "text-gray-700 hover:text-purple-700"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <button className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-md text-sm">
              Subscribe
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
