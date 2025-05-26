import Link from "next/link";
import React from "react";

function Sidebar({ isOpen }) {
  return (
    <div
      className={`
        bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300
        h-screen border-r border-black fixed md:static top-0 left-0 z-30 transition-transform duration-300
        w-64 px-6 py-10

        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="space-y-4">
        <SidebarLink href="/admin/dashboard" label="Dashboard" />
        <SidebarLink href="/admin/upload" label="Upload" />
        <SidebarLink href="/admin/podcastLists" label="Podcasts" />
        <SidebarLink href="/admin/newsLists" label="News" />
        <SidebarLink href="/admin/blogLists" label="Blogs" />
        <SidebarLink href="/admin/subscription" label="Subscription" />
      </div>
    </div>
  );
}

const SidebarLink = ({ href, label }) => (
  <Link
    href={href}
    className="block border border-black rounded-xl px-4 py-2 bg-white font-medium shadow-[-5px_5px_0px_#000000]"
  >
    {label}
  </Link>
);

export default Sidebar;
