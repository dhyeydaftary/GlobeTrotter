import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Sparkles, MapPin, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get } from '../api/client';
import { MOCK_TRIPS, MOCK_RECOMMENDATIONS } from '../api/mocks';
import TripCard from '../components/TripCard';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [recData, setRecData] = useState({ source: 'ai', recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
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

      const firstTripId = fetchedTrips.length > 0 ? fetchedTrips[0].id : 'trip_eu_2026';
      let recommendationsResult = null;
      try {
        recommendationsResult = await get(`/trips/${firstTripId}/recommendations?type=city`);
      } catch {
        recommendationsResult = MOCK_RECOMMENDATIONS;
      }

      setRecData(recommendationsResult || MOCK_RECOMMENDATIONS);
    } catch (err) {
      setError({
        message: err.message || 'Failed to load your dashboard data. Please try again.',
        code: err.code || 'FETCH_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const recentTrips = trips.slice(0, 3);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Explorer';

  // Fallback passport thumbnail images
  const passportImages = [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400', // Paris
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400', // Bali
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400', // Tokyo
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error.message}
          code={error.code}
          onRetry={fetchDashboardData}
          onClose={() => setError(null)}
        />
      )}

      {/* 1. Hero Banner with 3-Card Stack at right: 48px */}
      <div className="relative rounded-card px-10 md:px-16 py-10 text-white shadow-xl overflow-hidden bg-gradient-to-br from-primary via-primary-light to-[#142742] mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="max-w-xl space-y-4">
            {/* Shimmer Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-accent/30 via-accent/15 to-accent/30 text-accent font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-accent/40 shadow-sm shimmer-badge">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span className="tracking-wide uppercase">AI-Powered Travel Planner</span>
            </div>

            {/* Inline Welcome Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
              Welcome back, {firstName}! 👋
            </h1>

            <p className="text-slate-200 text-sm leading-relaxed font-body">
              Craft multi-city itineraries, organize daily activities, monitor live budgets, and share your journey with fellow travelers.
            </p>

            <div className="pt-2">
              <Link
                to="/trips/new"
                className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-extrabold text-sm px-6 py-3.5 rounded-btn shadow-accent-glow hover:scale-[1.02] active:scale-[0.97] transition-all duration-160"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Plan New Trip</span>
              </Link>
            </div>
          </div>

          {/* Right Side: 3-Card Stack arranged in staggered perspective at right: 48px */}
          <div className="hidden md:block absolute top-1/2 right-12 transform -translate-y-1/2 w-64 h-64 pointer-events-none z-10">
            <div className="relative w-full h-full">
              {/* Card 3: Backmost (-12deg) */}
              <div className="absolute top-4 right-8 w-36 h-48 rounded-card overflow-hidden shadow-2xl border-2 border-white/20 transform -rotate-12 hover:-rotate-6 transition-transform duration-300 pointer-events-auto bg-slate-900">
                <img
                  src={passportImages[2]}
                  alt="Tokyo"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400';
                  }}
                  className="w-full h-full object-cover opacity-80"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-extrabold bg-black/60 text-white px-2 py-0.5 rounded">
                  Tokyo
                </span>
              </div>

              {/* Card 2: Middle (-6deg) */}
              <div className="absolute top-2 right-4 w-36 h-48 rounded-card overflow-hidden shadow-2xl border-2 border-white/40 transform -rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-auto bg-slate-900">
                <img
                  src={passportImages[1]}
                  alt="Bali"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400';
                  }}
                  className="w-full h-full object-cover opacity-90"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-extrabold bg-black/60 text-white px-2 py-0.5 rounded">
                  Bali
                </span>
              </div>

              {/* Card 1: Frontmost (0deg) */}
              <div className="absolute top-0 right-0 w-36 h-48 rounded-card overflow-hidden shadow-2xl border-2 border-white transform rotate-0 hover:rotate-3 transition-transform duration-300 pointer-events-auto bg-slate-900">
                <img
                  src={passportImages[0]}
                  alt="Paris"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] font-extrabold bg-accent text-white px-2 py-0.5 rounded shadow-sm">
                  Paris
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recent Trips Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-textMain tracking-tight font-display">
              Recent Trips
            </h2>
            <p className="text-xs text-textMuted mt-0.5">Manage your upcoming and active travel plans</p>
          </div>

          {trips.length > 0 && (
            <Link
              to="/trips"
              className="text-xs font-medium text-accent hover:underline inline-flex items-center space-x-1"
            >
              <span>View all ({trips.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <Skeleton type="card" count={3} />
        ) : recentTrips.length === 0 ? (
          <EmptyState
            title="No trips planned yet"
            description="Start building your multi-city itinerary, organize stops, and calculate travel budgets."
            action={
              <Link
                to="/trips/new"
                className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs px-5 py-2.5 rounded-btn shadow-md hover:scale-[1.02] transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Trip</span>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Recommended for You (Curated Row below fold) */}
      <section className="space-y-4 pt-6 border-t border-borderLight">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary font-display">
              Recommended for You
            </h2>
          </div>

          <span
            className={`inline-flex items-center space-x-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              recData.source === 'ai'
                ? 'bg-emerald-50 text-success border-emerald-200'
                : 'bg-slate-100 text-textMuted border-slate-200'
            }`}
          >
            <span>{recData.source === 'ai' ? '✨ AI Curated' : '🔥 Popular'}</span>
          </span>
        </div>

        {loading ? (
          <Skeleton type="recommendation" count={3} />
        ) : (
          <div className="flex space-x-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1">
            {recData.recommendations?.map((rec, index) => {
              const photo = [
                'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&q=80&w=300',
                'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=300',
                'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&q=80&w=300',
              ][index % 3];

              const scorePercent = Math.min(100, Math.max(10, (rec.score || 9.0) * 10));

              return (
                <div
                  key={rec.id || index}
                  className="w-[180px] bg-surface-card rounded-card border border-borderLight p-3 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 shrink-0 scroll-snap-align-start flex flex-col justify-between group"
                >
                  <div>
                    {/* Destination Image (120px height) */}
                    <div className="h-[120px] w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100 relative">
                      <img
                        src={photo}
                        alt={rec.name}
                        className="w-full h-[120px] object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300';
                        }}
                      />
                      <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center space-x-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span>{rec.score}</span>
                      </span>
                    </div>

                    {/* City Name Bold 14px */}
                    <h3 className="font-bold text-textMain text-[14px] truncate group-hover:text-primary transition-colors">
                      {rec.name}
                    </h3>
                    {/* Country Muted 12px */}
                    <p className="text-[12px] text-textMuted mt-0.5 truncate">Destination Pick</p>

                    {/* Reason Text Italic 11px Muted */}
                    <p className="text-[11px] text-textMuted italic mt-2 line-clamp-2 leading-relaxed">
                      "{rec.reason}"
                    </p>
                  </div>

                  {/* Thin Coral Bar Representing Similarity Score */}
                  <div className="mt-3 pt-2 border-t border-borderLight/60">
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
