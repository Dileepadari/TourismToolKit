'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client';
import { 
  MapPin, 
  Star, 
  Search,
  Navigation,
  Clock,
  DollarSign,
  Heart,
  Share2,
  Globe,
  Building,
  Church,
  Castle,
  Home,
  Waves,
  Mountain,
  Trees,
  Landmark
} from 'lucide-react';
import Link from 'next/link';
import { GET_PLACES_QUERY } from '@/graphql/queries';

interface Place {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  rating?: number;
  category: string;
  priceRange?: string;
  openingHours?: string;
  phoneNumber?: string;
  website?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  bestTimeToVisit?: string;
  entryFee?: number;
  languagesSpoken?: string[];
}

export default function Places() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'recent'>('rating');

  const { data: placesData, loading } = useQuery(GET_PLACES_QUERY, {
    variables: { 
      country: selectedCountry === 'all' ? null : selectedCountry,
      category: selectedCategory === 'all' ? null : selectedCategory,
      limit: 50 
    }
  });

  const places = placesData?.getPlaces || [];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'monument', label: 'Monuments' },
    { value: 'temple', label: 'Temples' },
    { value: 'palace', label: 'Palaces' },
    { value: 'fort', label: 'Forts' },
    { value: 'beach', label: 'Beaches' },
    { value: 'hill-station', label: 'Hill Stations' },
    { value: 'national-park', label: 'National Parks' },
    { value: 'museum', label: 'Museums' }
  ];

  const countries = [
    { value: 'India', label: 'India' },
    { value: 'all', label: 'All Countries' }
  ];

  const filteredPlaces = places
    .filter((place: Place) => 
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Place, b: Place) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background/95 dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <MapPin className="w-8 h-8 mr-3 text-primary" />
              Explore Places
            </h1>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-lg p-6 mb-8 border border-border"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'recent')}
              className="px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </motion.div>

        {/* Places Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-card rounded-xl shadow-lg overflow-hidden animate-pulse border border-border">
                <div className="h-48 bg-muted"></div>
                <div className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlaces.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPlaces.map((place: Place, index: number) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group border border-border"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="text-white z-10">
                    <MapPin className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm text-center font-medium">{place.category || 'Place'}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Rating badge */}
                  {place.rating && (
                    <div className="absolute bottom-4 left-4 flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white text-sm font-medium">{place.rating}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {place.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {place.city}, {place.state || place.country}
                      </p>
                    </div>
                  </div>

                  <p className="text-foreground text-sm mb-4 line-clamp-3">
                    {place.description || 'A beautiful destination worth visiting.'}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {place.bestTimeToVisit && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        Best time: {place.bestTimeToVisit}
                      </div>
                    )}
                    
                    {place.entryFee !== null && place.entryFee !== undefined && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-2 text-secondary" />
                        Entry fee: ₹{place.entryFee}
                      </div>
                    )}

                    {place.languagesSpoken && place.languagesSpoken.length > 0 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="w-4 h-4 mr-2 text-accent" />
                        Languages: {place.languagesSpoken.slice(0, 2).join(', ')}
                        {place.languagesSpoken.length > 2 && ` +${place.languagesSpoken.length - 2} more`}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/places/${place.id}`}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground py-2 px-4 rounded-lg text-center font-medium hover:opacity-90 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    <button className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                      <Navigation className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/translator?context=visiting-${encodeURIComponent(place.name)}`}
                      className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              No places found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or explore different categories
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedCountry('India');
              }}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Quick Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category, index) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                <div className="text-2xl mb-2 flex items-center justify-center">
                  {index === 0 && <Building className="w-8 h-8 text-muted-foreground" />}
                  {index === 1 && <Church className="w-8 h-8 text-muted-foreground" />}
                  {index === 2 && <Castle className="w-8 h-8 text-muted-foreground" />}
                  {index === 3 && <Home className="w-8 h-8 text-muted-foreground" />}
                  {index === 4 && <Waves className="w-8 h-8 text-muted-foreground" />}
                  {index === 5 && <Mountain className="w-8 h-8 text-muted-foreground" />}
                  {index === 6 && <Trees className="w-8 h-8 text-muted-foreground" />}
                  {index === 7 && <Landmark className="w-8 h-8 text-muted-foreground" />}
                </div>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}