import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { get, del } from '../api/client';
import { MOCK_TRIPS } from '../api/mocks';
import TripCard from '../components/TripCard';
import ErrorBanner from '../components/ErrorBanner';
import {
  springSettle, staggerContainer, fadeUpItem, getMotionProps,
} from '../lib/motion';

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
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
    try {
      await del(`/trips/${tripId}`);
    } catch {}
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const reduceMotion = useReducedMotion();
  const mountProps = getMotionProps(reduceMotion, 'mount');
  const tapProps = reduceMotion ? {} : { whileTap: { scale: 0.97 }, transition: springSettle };

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 pb-16 space-y-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trips Overview</span>
          </div>
          <h1 className="text-display-lg text-2xl sm:text-3xl font-extrabold text-text-main">
            My Trips
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {trips.length} {trips.length === 1 ? 'adventure' : 'adventures'} planned
          </p>
        </div>

        <motion.button
          onClick={() => navigate('/trips/new')}
          {...tapProps}
          className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-bold px-5 py-3 rounded-btn shadow-btn-accent transition-colors text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </motion.button>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchTrips} onClose={() => setError(null)} />

      {/* Grid — reuse TripCard */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="gt-card overflow-hidden">
              <div className="skeleton h-48 rounded-none" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-4 w-1/2 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="gt-card text-center py-16 px-6">
          <div className="w-16 h-16 mx-auto mb-4 text-accent/60 bg-accent-light rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-display-md font-bold text-xl text-text-main mb-2">No trips yet</h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Start planning your first multi-city adventure.
          </p>
          <motion.button
            onClick={() => navigate('/trips/new')}
            {...tapProps}
            className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-btn shadow-btn-accent transition-colors text-sm"
          >
            Plan New Trip
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          {...mountProps}
        >
          {trips.map((trip) => (
            <motion.div key={trip.id} variants={fadeUpItem}>
              <TripCard trip={trip} onDelete={handleDelete} isOwner={true} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MyTrips;
