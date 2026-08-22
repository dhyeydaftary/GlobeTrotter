import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { get, del } from '../api/client';
import { MOCK_TRIPS } from '../api/mocks';
import TripCard from '../components/TripCard';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedTrips = [];
      try {
        fetchedTrips = await get('/trips');
      } catch {
        fetchedTrips = MOCK_TRIPS;
      }

      setTrips(fetchedTrips || []);
    } catch (err) {
      setError({
        message: err.message || 'Failed to fetch your trips.',
        code: err.code || 'FETCH_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (tripId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this trip? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      await del(`/trips/${tripId}`);
    } catch {}
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const filteredTrips = trips.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textMain tracking-tight font-display">
            My Trips
          </h1>
          <p className="text-xs text-textMuted mt-1">
            Manage your past and upcoming multi-city travel itineraries
          </p>
        </div>

        <Link
          to="/trips/new"
          className="inline-flex items-center justify-center space-x-2 bg-accent hover:bg-accent-hover text-white font-bold px-5 py-3 rounded-btn shadow-accent-glow hover:scale-[1.02] active:scale-[0.97] transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchTrips} onClose={() => setError(null)} />

      {/* Search Filter */}
      {trips.length > 0 && (
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by name..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-borderLight rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
          />
        </div>
      )}

      {/* Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 */}
      {loading ? (
        <Skeleton type="card" count={3} />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching trips found' : 'No trips created yet'}
          description={
            searchQuery
              ? `No travel plans matched your search for "${searchQuery}".`
              : 'Create your first multi-city trip itinerary to get started.'
          }
          action={
            !searchQuery && (
              <Link
                to="/trips/new"
                className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs px-5 py-2.5 rounded-btn shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Trip</span>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
