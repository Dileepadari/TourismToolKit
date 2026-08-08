'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Clock,
  DollarSign,
  Globe,
  Heart,
  MapPin,
  Navigation,
  Share2,
  Star,
} from 'lucide-react';
import {
  GET_FAVORITE_PLACE_IDS,
  GET_PLACE_BY_ID_QUERY,
  TOGGLE_FAVORITE_PLACE_MUTATION,
} from '@/graphql/queries';
import type { FavoritePlaceData, FavoritePlaceIdsData, PlaceByIdData } from '@/graphql/types';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/utils/cn';
import { placeLocation, placeMapUrl, placeUrl } from '@/utils/place';

export default function PlaceDetail() {
  const params = useParams<{ id: string }>();
  const placeId = Number(params.id);
  const { isAuthenticated } = useAuth();

  const { data, loading } = useQuery<PlaceByIdData>(GET_PLACE_BY_ID_QUERY, {
    variables: { placeId },
    // A non-numeric path segment would otherwise be sent as `null` against Int!.
    skip: !Number.isInteger(placeId),
  });
  const place = data?.getPlaceById ?? null;

  const { data: favoriteData, refetch: refetchFavorites } = useQuery<FavoritePlaceIdsData>(
    GET_FAVORITE_PLACE_IDS,
    { skip: !isAuthenticated, fetchPolicy: 'cache-and-network' }
  );
  const isSaved = (favoriteData?.getFavoritePlaceIds ?? []).includes(placeId);

  const [toggleFavoritePlace] = useMutation<FavoritePlaceData>(TOGGLE_FAVORITE_PLACE_MUTATION);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to save places');
      return;
    }
    try {
      const { data: result } = await toggleFavoritePlace({ variables: { placeId } });
      const response = result?.toggleFavoritePlace;
      if (response?.success) {
        toast.success(response.message);
        await refetchFavorites();
      } else {
        toast.error(response?.message ?? 'Could not save that place');
      }
    } catch {
      toast.error('Could not save that place');
    }
  };

  const handleShare = async () => {
    if (!place) return;
    const url = `${window.location.origin}${placeUrl(place.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: place.name, text: placeLocation(place), url });
        return;
      } catch (error) {
        // Dismissing the share sheet throws AbortError; that is not a failure.
        if ((error as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not share that place');
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/places" className="text-muted-foreground hover:text-foreground">
            ← Back to Places
          </Link>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-56 bg-card border border-border rounded-xl animate-pulse" />
            <div className="h-40 bg-card border border-border rounded-xl animate-pulse" />
          </div>
        ) : !place ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <MapPin className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold text-foreground mb-2">Place not found</h1>
            <p className="text-muted-foreground mb-6">
              This place may have been removed, or the link is incorrect.
            </p>
            <Link
              href="/places"
              className="inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              Browse places
            </Link>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="h-48 bg-primary flex items-center justify-center">
                <MapPin className="w-14 h-14 text-primary-foreground" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-foreground">{place.name}</h1>
                    <p className="text-muted-foreground mt-1">{placeLocation(place)}</p>
                  </div>
                  {typeof place.rating === 'number' && (
                    <span className="flex items-center text-foreground font-medium shrink-0">
                      <Star className="w-4 h-4 mr-1 text-ochre-500 fill-ochre-500" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {place.category && (
                  <span className="inline-flex mt-4 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm capitalize">
                    {place.category.replace(/-/g, ' ')}
                  </span>
                )}

                {place.description && (
                  <p className="text-foreground/80 mt-4 leading-relaxed">{place.description}</p>
                )}

                <div className="flex flex-wrap gap-3 mt-6">
                  <a
                    href={placeMapUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </a>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={cn(
                      'inline-flex items-center px-4 py-2.5 rounded-lg border border-border text-sm font-medium transition-colors',
                      isSaved
                        ? 'bg-destructive/10 text-destructive'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Heart className={cn('w-4 h-4 mr-2', isSaved && 'fill-current')} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-sm font-medium transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <Link
                    href="/translator"
                    className="inline-flex items-center px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted text-sm font-medium transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Translate
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {place.bestTimeToVisit && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-sm text-muted-foreground flex items-center mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Best time to visit
                  </p>
                  <p className="text-foreground font-medium">{place.bestTimeToVisit}</p>
                </div>
              )}
              {typeof place.entryFee === 'number' && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-sm text-muted-foreground flex items-center mb-1">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Entry fee
                  </p>
                  <p className="text-foreground font-medium">
                    {place.entryFee === 0 ? 'Free' : `₹${place.entryFee}`}
                  </p>
                </div>
              )}
              {place.languagesSpoken && place.languagesSpoken.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5 md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Languages spoken</p>
                  <div className="flex flex-wrap gap-2">
                    {place.languagesSpoken.map((language) => (
                      <span
                        key={language}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm uppercase"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.article>
        )}
      </main>
    </div>
  );
}
