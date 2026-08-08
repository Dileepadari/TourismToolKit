'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import type { TravelHistoryData, TravelHistoryVars, UserDictionaryData, UserDictionaryVars, PlacesData, PlacesVars } from '@/graphql/types';
import { useQuery } from '@apollo/client/react';
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
import { GET_USER_DICTIONARY, GET_TRAVEL_HISTORY , GET_PLACES_QUERY } from '@/graphql/queries';
import { cn } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';

// Cards are tinted by position rather than by a colour stored on the row - the
// palette is a presentation concern, not data.
/** "3 days ago" style formatting, using the browser's own locale rules. */
function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.round((then - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  for (const [unit, secondsPerUnit] of units) {
    if (Math.abs(seconds) >= secondsPerUnit) {
      return formatter.format(Math.round(seconds / secondsPerUnit), unit);
    }
  }
  return formatter.format(Math.round(seconds), 'second');
}

const PLACE_TINTS = [
  'bg-ochre-400/15',
  'bg-verdigris-400/15',
  'bg-indigo-ink-400/15',
] as const;

export default function UnifiedDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  

  const quickActions = [
    {
      icon: Languages,
      title: t('dashboard.quickActions.translate'),
      description: t('translator.subtitle'),
      href: '/translator',
      color: 'bg-indigo-ink-500/15 text-indigo-ink-700 dark:text-indigo-ink-300',
      bgColor: 'bg-indigo-ink-500/8'
    },
    {
      icon: Camera,
      title: t('dashboard.quickActions.ocrScanner'),
      description: t('dashboard.quickActions.ocrDescription'),
      href: '/translator?tab=ocr',
      color: 'bg-clay-500/15 text-clay-700 dark:text-clay-300',
      bgColor: 'bg-clay-500/8'
    },
    {
      icon: Mic,
      title: t('dashboard.quickActions.voiceAssistant'),
      description: t('dashboard.quickActions.voiceDescription'),
      href: '/translator?tab=voice',
      color: 'bg-verdigris-500/15 text-verdigris-700 dark:text-verdigris-300',
      bgColor: 'bg-verdigris-500/8'
    },
    {
      icon: BookOpen,
      title: t('dashboard.quickActions.learnWords'),
      description: t('dictionary.subtitle'),
      href: '/dictionary',
      color: 'bg-ochre-500/15 text-ochre-700 dark:text-ochre-300',
      bgColor: 'bg-ochre-500/8'
    },
    {
      icon: MapPin,
      title: t('dashboard.quickActions.findPlaces'),
      description: t('places.subtitle'),
      href: '/places',
      color: 'bg-verdigris-500/15 text-verdigris-700 dark:text-verdigris-300',
      bgColor: 'bg-verdigris-500/8'
    },
    {
      icon: Compass,
      title: t('dashboard.quickActions.travelGuide'),
      description: t('dashboard.quickActions.guideDescription'),
      href: '/guide',
      color: 'bg-indigo-ink-500/15 text-indigo-ink-700 dark:text-indigo-ink-300',
      bgColor: 'bg-indigo-ink-500/8'
    }
  ];



  // Redirect if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // GraphQL queries

  const { data: dictionaryData } = useQuery<UserDictionaryData, UserDictionaryVars>(GET_USER_DICTIONARY, {
    skip: !user?.id
  });

  const { data: travelHistoryData } = useQuery<TravelHistoryData, TravelHistoryVars>(
    GET_TRAVEL_HISTORY,
    { skip: !user?.id },
  );

  // Real destinations, highest rated first. This section used to be a hardcoded
  // array of three places that existed nowhere in the database.
  const { data: placesData } = useQuery<PlacesData, PlacesVars>(GET_PLACES_QUERY, {
    variables: { country: 'India', limit: 3 },
  });
  const featuredPlaces = placesData?.getPlaces ?? [];


  // Derived from query data during render rather than pushed into state by an
  // effect, which cost an extra render pass on every refetch.
  // Memoised so its identity is stable; a fresh `[]` each render would
  // invalidate every downstream useMemo.
  const entries = useMemo(
    () => dictionaryData?.getUserDictionary ?? [],
    [dictionaryData],
  );
  const savedWords = entries.length;
  const favouriteCount = entries.filter((entry) => entry.isFavorite).length;
  const travelHistory = travelHistoryData?.getTravelHistory;
  const stats = useMemo(
    () => {
      const trips = travelHistory ?? [];
      return {
      // Real counts only. These tiles previously showed invented numbers
      // (`45 + …`, `|| 127`, `12 + Math.random() * 20`) dressed up as metrics,
      // so they told the user nothing and changed on every re-render.
      words_learned: savedWords,
      favourites: favouriteCount,
      places_visited: trips.length,
        countries_visited: new Set(trips.map((trip) => trip.country)).size,
      };
    },
    [savedWords, favouriteCount, travelHistory],
  );

  // Derived from the user's own records. This panel used to be three invented
  // rows with hardcoded "2 hours ago" strings that never changed.
  const recentActivity = useMemo(() => {
    const events = [
      ...entries.map((entry) => ({
        icon: BookOpen,
        title: `Saved "${entry.word}" - ${entry.translation}`,
        at: entry.createdAt,
        color: 'bg-ochre-500/15 text-ochre-700 dark:text-ochre-300',
      })),
      ...(travelHistory ?? []).map((trip) => ({
        icon: MapPin,
        title: `Recorded a trip to ${trip.destination}`,
        at: trip.createdAt,
        color: 'bg-verdigris-500/15 text-verdigris-700 dark:text-verdigris-300',
      })),
    ];

    return events
      .filter((event) => Boolean(event.at))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5)
      .map((event) => ({ ...event, time: formatRelativeTime(event.at) }));
  }, [entries, travelHistory]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
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
      label: t('dashboard.stats.wordsLearned'),
      value: stats.words_learned,
      color: 'bg-indigo-ink-500/15 text-indigo-ink-700 dark:text-indigo-ink-300',
      bgColor: 'bg-indigo-ink-500/8'
    },
    {
      icon: MapPin,
      label: t('dashboard.stats.placesVisited'),
      value: stats.places_visited,
      color: 'bg-verdigris-500/15 text-verdigris-700 dark:text-verdigris-300',
      bgColor: 'bg-verdigris-500/8'
    },
    {
      icon: BookOpen,
      label: t('dashboard.stats.favorites'),
      value: stats.favourites,
      color: 'bg-ochre-500/15 text-ochre-700 dark:text-ochre-300',
      bgColor: 'bg-ochre-500/8'
    },
    {
      icon: TrendingUp,
      label: t('dashboard.stats.countries'),
      value: stats.countries_visited,
      color: 'bg-clay-500/15 text-clay-700 dark:text-clay-300',
      bgColor: 'bg-clay-500/8'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Header */}
      <Header
        title={`${t('dashboard.welcome')}, ${user?.fullName || user?.username}! 🙏`}
        subtitle={t('dashboard.subtitle')}
        tinted={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className={cn(stat.bgColor)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-xl", stat.color)}>
                      <stat.icon className="w-6 h-6" />
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
            <h2 className="text-2xl font-bold text-foreground">{t('dashboard.quickActions.title')}</h2>
            <p className="text-muted-foreground">Choose your adventure</p>
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
                  <Card hover className={cn("h-full cursor-pointer group", action.bgColor)}>
                    <CardContent className="p-6">
                      <div className={cn("w-14 h-14 rounded-xl", action.color, "flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200")}>
                        <action.icon className="w-7 h-7 text-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
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
              <h2 className="text-2xl font-bold text-foreground">
                {t('dashboard.featuredPlaces.title')}
              </h2>
              <p className="text-muted-foreground">Discover the wonders of our motherland</p>
            </div>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/places" className="flex items-center space-x-2">
                <span>Explore All</span>
                <Plane className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card hover className="overflow-hidden group cursor-pointer">
                  <div
                    className={cn(
                      'h-48 relative flex items-center justify-center border-b border-border',
                      PLACE_TINTS[index % PLACE_TINTS.length],
                    )}
                  >
                    <MapPin className="w-20 h-20 opacity-40" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-card/90 text-foreground text-sm rounded-full border border-border">
                        {place.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1 bg-card/90 border border-border px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-ochre-500 fill-current" />
                        <span className="text-foreground text-sm font-semibold">{place.rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {place.name}
                    </h3>
                    <p className="text-muted-foreground mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {[place.city, place.state].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-foreground text-sm mb-4">
                      {place.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {place.languagesSpoken?.length ?? 0}{' '}
                          {t('dashboard.featuredPlaces.languages')}
                        </span>
                      </div>
                      <Link
                        href={`/places/${place.id}`}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Learn More →
                      </Link>
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
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Journey</h2>
          
          <Card tinted className="bg-primary/5">
            <CardContent className="p-6">
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        activity.color,
                      )}
                    >
                      <activity.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 text-muted-foreground text-sm">
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