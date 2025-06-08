'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/auth';
import AdminAuthGuard from '../../components/AdminAuthGuard';
import { LogOut, User, Shield } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Cookie will be cleared by AdminAuthGuard
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
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
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <nav className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 h-12 items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/blogLists')}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Blog Lists
              </button>
              <button
                onClick={() => router.push('/admin/newsLists')}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                News Lists
              </button>
              <button
                onClick={() => router.push('/admin/podcastLists')}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Podcast Lists
              </button>
              <button
                onClick={() => router.push('/admin/upload')}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Upload
              </button>
              <button
                onClick={() => router.push('/admin/subscription')}
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
              >
                Subscription
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}