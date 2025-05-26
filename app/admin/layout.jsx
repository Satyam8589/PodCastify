"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { HiMenu } from "react-icons/hi";
import Sidebar from "@/components/AdminComponents/Slidebar";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const pathname = usePathname();

  // Listen to window resize and update isLargeScreen
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleMediaChange = (e) => setIsLargeScreen(e.matches);

    setIsLargeScreen(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  // Close sidebar when pathname changes (navigation)
  useEffect(() => {
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
  }, [pathname, isLargeScreen]);

  const isSidebarVisible = isLargeScreen || sidebarOpen;

  const handleOverlayClick = () => {
    if (!isLargeScreen) setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    if (!isLargeScreen) setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarVisible} />

      {isSidebarVisible && !isLargeScreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      <div className="flex flex-col w-full">
        <div className="bg-gradient-to-r from-yellow-100 via-pink-200 to-blue-200 flex items-center justify-between py-3 px-4 md:px-12 border-b border-black">
          {!isLargeScreen && (
            <button
              onClick={toggleSidebar}
              className="text-2xl text-purple-700 md:hidden z-40"
            >
              <HiMenu />
            </button>
          )}

          <h3 className="font-medium">Admin Panel</h3>

          <div className="flex items-center gap-2">
            <Image
              src="/images/prod_logo.png"
              alt="PodCastify Logo"
              width={40}
              height={40}
            />
            <h1 className="text-xl font-bold text-purple-700 hidden sm:block">
              PodCastify
            </h1>
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
