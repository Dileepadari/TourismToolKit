'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@apollo/client/react';
import { CalendarDays, Globe, MapPin, Plus, Trash2 } from 'lucide-react';
import {
  ADD_TRAVEL_HISTORY_MUTATION,
  DELETE_TRAVEL_HISTORY_MUTATION,
  GET_TRAVEL_HISTORY,
} from '@/graphql/queries';
import type {
  AddTravelHistoryData,
  DeleteTravelHistoryData,
  TravelHistory,
  TravelHistoryData,
} from '@/graphql/types';
import { useAuth } from '@/providers/AuthProvider';

function formatVisitDate(value?: string | null): string {
  if (!value) return 'Date not recorded';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Date not recorded';
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const EMPTY_FORM = { destination: '', country: '', visitDate: '', notes: '' };

export default function Trips() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useQuery<TravelHistoryData>(GET_TRAVEL_HISTORY, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });
  const trips = data?.getTravelHistory ?? [];

  const [addTravelHistory] = useMutation<AddTravelHistoryData>(ADD_TRAVEL_HISTORY_MUTATION);
  const [deleteTravelHistory] = useMutation<DeleteTravelHistoryData>(
    DELETE_TRAVEL_HISTORY_MUTATION
  );

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.destination.trim() || !form.country.trim()) {
      toast.error('Destination and country are required');
      return;
    }

    setSaving(true);
    try {
      const { data: result } = await addTravelHistory({
        variables: {
          input: {
            destination: form.destination.trim(),
            country: form.country.trim(),
            // Sent as a full timestamp: the column is TIMESTAMPTZ, and a bare
            // date string is not a valid GraphQL DateTime.
            visitDate: form.visitDate ? new Date(`${form.visitDate}T00:00:00Z`).toISOString() : null,
            notes: form.notes.trim() || null,
          },
        },
      });

      // The resolver returns null rather than raising when the caller is not
      // signed in, so a null result is a real outcome to report.
      if (!result?.addTravelHistory) {
        toast.error('Sign in to record a trip');
        return;
      }
      toast.success(`Added ${result.addTravelHistory.destination}`);
      setForm(EMPTY_FORM);
      await refetch();
    } catch {
      toast.error('Could not save that trip');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (trip: TravelHistory) => {
    try {
      const { data: result } = await deleteTravelHistory({ variables: { entryId: trip.id } });
      const response = result?.deleteTravelHistory;
      if (response?.success) {
        toast.success(response.message);
        await refetch();
      } else {
        toast.error(response?.message ?? 'Could not remove that trip');
      }
    } catch {
      toast.error('Could not remove that trip');
    }
  };

  const countries = new Set(trips.map((trip) => trip.country)).size;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <CalendarDays className="w-7 h-7 mr-3 text-primary" />
              My Trips
            </h1>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!authLoading && !isAuthenticated ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-foreground font-medium mb-2">Sign in to keep a travel journal</p>
            <p className="text-muted-foreground mb-6">
              Your trips are saved to your account so they follow you across devices.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary" />
                Record a trip
              </h2>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="trip-destination"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Destination
                  </label>
                  <input
                    id="trip-destination"
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                    placeholder="Jaipur"
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="trip-country"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Country
                  </label>
                  <input
                    id="trip-country"
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="India"
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="trip-date"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Visit date
                  </label>
                  <input
                    id="trip-date"
                    type="date"
                    value={form.visitDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, visitDate: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="trip-notes"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Notes
                  </label>
                  <input
                    id="trip-notes"
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="What made it memorable?"
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Add trip'}
                  </button>
                </div>
              </form>
            </motion.section>

            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Travel journal</h2>
                <p className="text-sm text-muted-foreground">
                  {trips.length} {trips.length === 1 ? 'trip' : 'trips'} · {countries}{' '}
                  {countries === 1 ? 'country' : 'countries'}
                </p>
              </div>

              {loading && trips.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="h-24 bg-card border border-border rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : trips.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
                  No trips recorded yet. Add the last place you visited above.
                </div>
              ) : (
                <ul className="space-y-3">
                  {trips.map((trip, index) => (
                    <motion.li
                      key={trip.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 8) * 0.04 }}
                      className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                          {trip.destination}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {trip.country}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatVisitDate(trip.visitDate)}
                        </p>
                        {trip.notes ? (
                          <p className="text-sm text-foreground/80 mt-2 break-words">
                            {trip.notes}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(trip)}
                        aria-label={`Delete trip to ${trip.destination}`}
                        title={`Delete trip to ${trip.destination}`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
