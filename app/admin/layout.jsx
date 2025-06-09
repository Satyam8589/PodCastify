"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/auth";
import AdminAuthGuard from "../../components/AdminAuthGuard";
import { LogOut, User, Shield, Menu, X } from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleNav = () => setNavOpen(!navOpen);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{auth.currentUser?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleNav}
                  aria-label="Toggle navigation menu"
                  title="Toggle navigation menu"
                  className="text-gray-700 hover:text-gray-900"
                >
                  {navOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <nav
          className={`bg-gray-800 text-white md:block ${
            navOpen ? "block" : "hidden"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:space-x-8 py-2 md:h-12 md:items-center">
              <button
                onClick={() => {
                  router.push("/admin/dashboard");
                  setNavOpen(false);
                }}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium text-left md:text-center"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  router.push("/admin/blogLists");
                  setNavOpen(false);
                }}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium text-left md:text-center"
              >
                Blog Lists
              </button>
              <button
                onClick={() => {
                  router.push("/admin/newsLists");
                  setNavOpen(false);
                }}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium text-left md:text-center"
              >
                News Lists
              </button>
              <button
                onClick={() => {
                  router.push("/admin/podcastLists");
                  setNavOpen(false);
                }}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium text-left md:text-center"
              >
                Podcast Lists
              </button>
              <button
                onClick={() => {
                  router.push("/admin/upload");
                  setNavOpen(false);
                }}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium text-left md:text-center"
              >
                Upload
              </button>
              <button
                onClick={() => {
                  router.push("/admin/subscription");
                  setNavOpen(false);
                }}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium text-left md:text-center"
              >
                Subscription
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-grow">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
