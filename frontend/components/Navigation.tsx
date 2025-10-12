'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Globe2, 
  Menu, 
  X, 
  LogOut, 
  Settings,
  Home,
  Languages,
  BookOpen,
  MapPin,
  Compass
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import toast from 'react-hot-toast';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'from-saffron-500 to-golden-500' },
  { name: 'Translator', href: '/translator', icon: Languages, color: 'from-royal-500 to-heritage-500' },
  { name: 'Dictionary', href: '/dictionary', icon: BookOpen, color: 'from-heritage-500 to-saffron-500' },
  { name: 'Places', href: '/places', icon: MapPin, color: 'from-golden-500 to-royal-500' },
  { name: 'Guide', href: '/guide', icon: Compass, color: 'from-saffron-500 to-heritage-500' },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-saffron-200 dark:border-saffron-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-saffron-500 to-golden-500 rounded-lg flex items-center justify-center shadow-lg">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              TourismToolKit
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <LanguageSelector variant="compact" />

            {/* Theme Toggle */}
                        {/* Theme Toggle */}
            <ThemeToggle variant="icon" size="md" />

            {isAuthenticated ? (
              <>
                {/* User Menu (Desktop) */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-saffron-500 to-heritage-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.fullName || user?.username}
                    </span>
                  </div>

                  <Link
                    href="/settings"
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Button variant="primary" size="sm">
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-2 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-gradient-to-r from-saffron-500 to-heritage-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              {/* Language Selector for Mobile */}
              <div className="px-3 py-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-base font-medium text-gray-600 dark:text-gray-300">Language</span>
                </div>
                <LanguageSelector variant="dropdown" />
              </div>

              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}