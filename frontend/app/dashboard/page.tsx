'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { 
  Languages, 
  Camera,
  Mic,
  BookOpen,
  MapPin,
  Compass,
  TrendingUp,
  Clock,
  Plane,
  Star,
  Users
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { GET_USER_DICTIONARY, GET_TRAVEL_HISTORY } from '@/graphql/queries';
import { cn } from '@/utils/helpers';

const quickActions = [
  {
    icon: Languages,
    title: 'Instant Translation',
    description: 'Translate between 10+ Indian languages',
    href: '/translator',
    color: 'from-royal-500 to-heritage-500',
    bgColor: 'bg-gradient-to-br from-royal-50 to-heritage-50 dark:from-royal-900/20 dark:to-heritage-900/20'
  },
  {
    icon: Camera,
    title: 'OCR Scanner',
    description: 'Extract text from images instantly',
    href: '/translator?tab=ocr',
    color: 'from-saffron-500 to-golden-500',
    bgColor: 'bg-gradient-to-br from-saffron-50 to-golden-50 dark:from-saffron-900/20 dark:to-golden-900/20'
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    description: 'Speech-to-text conversations',
    href: '/translator?tab=voice',
    color: 'from-heritage-500 to-royal-500',
    bgColor: 'bg-gradient-to-br from-heritage-50 to-royal-50 dark:from-heritage-900/20 dark:to-royal-900/20'
  },
  {
    icon: BookOpen,
    title: 'My Dictionary',
    description: 'Personal word collections',
    href: '/dictionary',
    color: 'from-golden-500 to-saffron-500',
    bgColor: 'bg-gradient-to-br from-golden-50 to-saffron-50 dark:from-golden-900/20 dark:to-saffron-900/20'
  },
  {
    icon: MapPin,
    title: 'Explore Places',
    description: 'Discover incredible India',
    href: '/places',
    color: 'from-heritage-500 to-golden-500',
    bgColor: 'bg-gradient-to-br from-heritage-50 to-golden-50 dark:from-heritage-900/20 dark:to-golden-900/20'
  },
  {
    icon: Compass,
    title: 'Travel Guide',
    description: 'Cultural tips & insights',
    href: '/guide',
    color: 'from-royal-500 to-saffron-500',
    bgColor: 'bg-gradient-to-br from-royal-50 to-saffron-50 dark:from-royal-900/20 dark:to-saffron-900/20'
  }
];

const featuredPlaces = [
  {
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    rating: 4.8,
    description: 'Symbol of eternal love',
    category: 'Heritage',
    visitors: '8M+',
    color: 'from-golden-400 to-saffron-400'
  },
  {
    name: 'Kerala Backwaters',
    location: 'Alleppey, Kerala',
    rating: 4.7,
    description: 'Serene waterways',
    category: 'Nature',
    visitors: '2M+',
    color: 'from-heritage-400 to-royal-400'
  },
  {
    name: 'Golden Temple',
    location: 'Amritsar, Punjab',
    rating: 4.9,
    description: 'Sacred Sikh shrine',
    category: 'Spiritual',
    visitors: '5M+',
    color: 'from-royal-400 to-golden-400'
  }
];

export default function UnifiedDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [stats, setStats] = useState({
    translations: 0,
    places_visited: 0,
    words_learned: 0,
    days_traveled: 0
  });

  // Redirect if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // GraphQL queries

  const { data: dictionaryData } = useQuery(GET_USER_DICTIONARY, {
    variables: { userId: user?.id },
    skip: !user?.id
  });

  const { data: travelHistoryData } = useQuery(GET_TRAVEL_HISTORY, {
    variables: { userId: user?.id },
    skip: !user?.id
  });

  // Update stats based on data
  useEffect(() => {
    setStats({
      translations: 45 + (dictionaryData?.userDictionary?.length || 0),
      places_visited: 3 + (travelHistoryData?.travelHistory?.length || 0),
      words_learned: dictionaryData?.userDictionary?.length || 127,
      days_traveled: 12 + Math.floor(Math.random() * 20)
    });
  }, [dictionaryData, travelHistoryData]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-heritage-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your travel dashboard...</p>
        </div>
      </div>
    );
  }

  // If not loading and not authenticated, the useEffect will handle redirect
  if (!isAuthenticated) {
    return null;
  }

  const statsConfig = [
    {
      icon: Languages,
      label: 'Translations',
      value: stats.translations,
      color: 'from-royal-500 to-heritage-500',
      bgColor: 'bg-gradient-to-br from-royal-50 to-heritage-50 dark:from-royal-900/20 dark:to-heritage-900/20'
    },
    {
      icon: MapPin,
      label: 'Places Visited',
      value: stats.places_visited,
      color: 'from-heritage-500 to-golden-500',
      bgColor: 'bg-gradient-to-br from-heritage-50 to-golden-50 dark:from-heritage-900/20 dark:to-golden-900/20'
    },
    {
      icon: BookOpen,
      label: 'Words Learned',
      value: stats.words_learned,
      color: 'from-golden-500 to-saffron-500',
      bgColor: 'bg-gradient-to-br from-golden-50 to-saffron-50 dark:from-golden-900/20 dark:to-saffron-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Travel Days',
      value: stats.days_traveled,
      color: 'from-saffron-500 to-royal-500',
      bgColor: 'bg-gradient-to-br from-saffron-50 to-royal-50 dark:from-saffron-900/20 dark:to-royal-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-saffron-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Welcome Header */}
      <Header
        title={`Namaste, ${user?.fullName || user?.username}! 🙏`}
        subtitle="Ready to explore the incredible diversity of India?"
        gradient={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsConfig.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className={cn("border-0", stat.bgColor)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-xl bg-gradient-to-r", stat.color)}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <p className="text-gray-600 dark:text-gray-400">Choose your adventure</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={action.href}>
                  <Card hover className={cn("border-0 h-full cursor-pointer group", action.bgColor)}>
                    <CardContent className="p-6">
                      <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-r", action.color, "flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200")}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Places */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Incredible India Awaits
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Discover the wonders of our motherland</p>
            </div>
            <Button variant="outline" size="sm" className="border-saffron-300 text-saffron-600 hover:bg-saffron-50">
              <Link href="/places" className="flex items-center space-x-2">
                <span>Explore All</span>
                <Plane className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlaces.map((place, index) => (
              <motion.div
                key={place.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card hover className="border-0 overflow-hidden group cursor-pointer">
                  <div className={cn("h-48 bg-gradient-to-br", place.color, "relative flex items-center justify-center")}>
                    <MapPin className="w-20 h-20 text-white opacity-30" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                        {place.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-white fill-current" />
                        <span className="text-white text-sm font-semibold">{place.rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {place.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {place.location}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                      {place.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{place.visitors} visitors</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-saffron-600 hover:text-saffron-700 p-0">
                        Learn More →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Journey</h2>
          
          <Card className="border-0 bg-gradient-to-br from-white to-saffron-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  {
                    icon: Languages,
                    title: 'Translated "स्वागत" to "Welcome"',
                    time: '2 hours ago',
                    color: 'from-royal-500 to-heritage-500'
                  },
                  {
                    icon: BookOpen,
                    title: 'Added 5 new words to dictionary',
                    time: 'Yesterday',
                    color: 'from-golden-500 to-saffron-500'
                  },
                  {
                    icon: MapPin,
                    title: 'Explored cultural tips for Rajasthan',
                    time: '3 days ago',
                    color: 'from-heritage-500 to-royal-500'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-r", activity.color, "flex items-center justify-center")}>
                      <activity.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}