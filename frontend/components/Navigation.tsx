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
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import toast from 'react-hot-toast';

export default function Navigation() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: Home, color: 'from-saffron-500 to-golden-500' },
    { name: t('nav.translator'), href: '/translator', icon: Languages, color: 'from-royal-500 to-heritage-500' },
    { name: t('nav.dictionary'), href: '/dictionary', icon: BookOpen, color: 'from-heritage-500 to-saffron-500' },
    { name: t('nav.places'), href: '/places', icon: MapPin, color: 'from-golden-500 to-royal-500' },
    { name: t('nav.guide'), href: '/guide', icon: Compass, color: 'from-saffron-500 to-heritage-500' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
              <Globe2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
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
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user?.fullName || user?.username}
                    </span>
                  </div>

                  <Link
                    href="/settings"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={t('nav.settings')}
                  >
                    <Settings className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
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
          className="md:hidden bg-card border-t border-border"
        >
          <div className="px-4 py-2 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-4 border-b border-border">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-sm text-muted-foreground">
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
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Actions */}
            <div className="border-t border-border pt-2">
              {/* Language Selector for Mobile */}
              <div className="px-3 py-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Languages className="w-5 h-5 text-muted-foreground" />
                  <span className="text-base font-medium text-muted-foreground">Language</span>
                </div>
                <LanguageSelector variant="dropdown" />
              </div>

              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
              >
                <Settings className="w-5 h-5" />
                <span>{t('nav.settings')}</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}