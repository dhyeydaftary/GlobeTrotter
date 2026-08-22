import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get } from '../api/client';
import TripCard from '../components/TripCard';
import ErrorBanner from '../components/ErrorBanner';
import {
  DASH_LISBON,
  DASH_SANTORINI,
  DASH_MARRAKECH,
  REC_PHOTOS,
  TRIP_CARD_FALLBACK,
} from '../constants/images';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [recData, setRecData] = useState({ source: 'ai', recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedTrips = await get('/trips');
      setTrips(fetchedTrips || []);

      const recommendationsResult = fetchedTrips?.length > 0
        ? await get(`/trips/${fetchedTrips[0].id}/recommendations?type=city`)
        : await get('/recommendations?type=city');
      setRecData(recommendationsResult || { source: 'fallback', recommendations: [] });
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

  const handleDeleteTrip = (tripId) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const recentTrips = trips.slice(0, 3);
  const firstName = user?.name?.split(' ')[0] || 'Traveler';

  return (
    <div className="page-enter min-h-screen bg-surface pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Error Banner */}
        {error && (
          <ErrorBanner
            message={error.message}
            code={error.code}
            onRetry={fetchDashboardData}
            onClose={() => setError(null)}
          />
        )}

        {/* 1. Hero Banner with Dark Indigo Gradient */}
        <div className="relative rounded-card p-8 md:p-12 text-white shadow-xl overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F]">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-accent/20 text-accent-light font-semibold text-xs px-3.5 py-1.5 rounded-full border border-accent/40 shadow-sm backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="tracking-wide uppercase text-[11px]">AI-Powered Travel Planner</span>
              </div>

              {/* Headline */}
              <h1 className="text-display-md text-3xl sm:text-4xl font-extrabold text-white">
                Welcome back, {firstName}! 👋
              </h1>

              <p className="text-text-light text-sm sm:text-base leading-relaxed font-body">
                Craft multi-city itineraries, organize daily activities, monitor live budgets, and share your journeys effortlessly.
              </p>

              <div className="pt-2">
                <Link
                  to="/trips/new"
                  className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-bold text-sm px-6 py-3.5 rounded-btn shadow-btn-accent active:scale-[0.97] transition-all duration-150"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Plan New Trip</span>
                </Link>
              </div>
            </div>

            {/* Visual Photography Stack */}
            <div className="hidden lg:block relative w-80 h-64 flex-shrink-0">
              {[
                { src: DASH_LISBON, label: 'Lisbon', style: { right: '60px', top: '0px', transform: 'rotate(-8deg)', zIndex: 1 } },
                { src: DASH_SANTORINI, label: 'Santorini', style: { right: '28px', top: '16px', transform: 'rotate(-1deg)', zIndex: 2 } },
                { src: DASH_MARRAKECH, label: 'Marrakech', style: { right: '0px', top: '36px', transform: 'rotate(6deg)', zIndex: 3 } },
              ].map((card) => (
                <div
                  key={card.label}
                  className="absolute w-40 h-52 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-transform duration-300 hover:scale-105"
                  style={card.style}
                >
                  <img
                    src={card.src}
                    alt={card.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = TRIP_CARD_FALLBACK;
                    }}
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-accent text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Recent Trips Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-display-md font-bold text-xl text-text-main">Recent Trips</h2>
              <p className="text-text-muted text-sm mt-0.5">Manage your upcoming and active travel plans</p>
            </div>

            {trips.length > 0 && (
              <Link
                to="/trips"
                className="text-sm font-bold text-accent hover:text-accent-dark flex items-center gap-1 transition-colors"
              >
                <span>View all ({trips.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Skeleton Loading State */}
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
          ) : recentTrips.length === 0 ? (
            /* Empty state when no trips */
            <div className="gt-card text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-4 text-accent/60 bg-accent-light rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-display-md font-bold text-xl text-text-main mb-2">No trips yet</h3>
              <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
                Start planning your first multi-city adventure.
              </p>
              <button
                onClick={() => navigate('/trips/new')}
                className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-btn shadow-btn-accent active:scale-[0.97] transition-all duration-150 text-sm"
              >
                Plan New Trip
              </button>
            </div>
          ) : (
            /* 3-Column Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} isOwner={true} />
              ))}
            </div>
          )}
        </section>

        {/* 3. Recommended for You Section */}
        <section className="space-y-4 pt-6 border-t border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-display-md font-bold text-lg text-text-main">
                Recommended for You
              </h2>
            </div>

            <span
              className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                recData.source === 'ai'
                  ? 'bg-accent-light text-accent-dark border-accent/20'
                  : 'bg-surface-raised text-text-muted border-border-light'
              }`}
            >
              <span>{recData.source === 'ai' ? '✨ AI Curated' : '🔥 Popular'}</span>
            </span>
          </div>

          {loading ? (
            <div className="flex space-x-4 overflow-hidden py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[200px] gt-card p-3 space-y-3 shrink-0">
                  <div className="skeleton h-[120px] rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1">
              {recData.recommendations?.map((rec, index) => {
                const photo = rec.imageUrl || REC_PHOTOS[index % REC_PHOTOS.length];
                const scorePercent = Math.min(100, Math.max(10, (rec.score || 0.9) * (rec.score > 1 ? 10 : 100)));

                return (
                  <button
                    type="button"
                    key={rec.id || index}
                    onClick={() => navigate('/trips/new', { state: { cityName: rec.name } })}
                    className="w-[210px] gt-card p-3.5 shrink-0 flex flex-col justify-between group text-left cursor-pointer"
                  >
                    <div>
                      <div className="h-[120px] w-full rounded-xl overflow-hidden mb-3 bg-surface-raised relative">
                        <img
                          src={photo}
                          alt={rec.name}
                          className="w-full h-[120px] object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = TRIP_CARD_FALLBACK;
                          }}
                        />
                        <span className="absolute top-2 right-2 bg-black/65 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center space-x-0.5">
                          <Star className="w-2.5 h-2.5 text-warning fill-warning" />
                          <span>{rec.score}</span>
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-text-main text-sm truncate">
                        {rec.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {rec.country || rec.category || 'Destination pick'}
                      </p>

                      {rec.reason && (
                        <p
                          className="text-[11px] text-text-muted italic mt-2 line-clamp-2 leading-relaxed"
                          title={rec.reason}
                        >
                          <span className="not-italic font-semibold text-accent mr-1">Why</span>
                          {rec.reason}
                        </p>
                      )}
                    </div>

                    {/* Thin Indigo Bar Representing Similarity Score */}
                    <div className="mt-3 pt-2.5 border-t border-border-light">
                      <div className="w-full bg-surface-raised h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-500"
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
