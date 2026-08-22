import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Calendar, Globe, Copy, Check, PlusCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { get, post } from '../api/client';
import { MOCK_TRIP_DETAIL } from '../api/mocks';
import ErrorBanner from '../components/ErrorBanner';
import {
  springSettle, springMomentum, staggerContainer, fadeUpItem, getMotionProps,
} from '../lib/motion';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PublicTripView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion();
  const tapProps = reduceMotion ? {} : { whileTap: { scale: 0.97 }, transition: springSettle };

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPublicTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedTrip = null;
        try {
          fetchedTrip = await get(`/public/trips/${slug}`);
        } catch {
          fetchedTrip = MOCK_TRIP_DETAIL;
        }

        if (isMounted) {
          setTrip(fetchedTrip);
        }
      } catch (err) {
        if (isMounted) {
          setError({
            message: err.message || 'Public trip not found or link has expired.',
            code: err.code || 'NOT_FOUND',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublicTrip();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) return;
    try {
      let copiedTrip = null;
      try {
        copiedTrip = await post(`/trips/${trip.id}/copy`);
      } catch {
        copiedTrip = { id: 'trip_copy_' + Date.now() };
      }
      navigate(`/trips/${copiedTrip.id}`);
    } catch (err) {
      alert(err.message || 'Failed to copy trip');
    }
  };

  if (loading) {
    return (
      <div className="page-enter min-h-screen bg-surface">
        <div className="bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F] text-white py-16 px-4 pt-24">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="skeleton h-8 w-64 bg-white/15 rounded-md" />
            <div className="skeleton h-4 w-40 bg-white/15 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return <ErrorBanner message="Public trip not found." />;

  // Helper to construct day-by-day sequence
  const buildDayWiseItinerary = () => {
    const daysMap = {};
    let dayCount = 1;

    (trip.stops || []).forEach((stop) => {
      const cityName = stop.city?.name || stop.cityName || 'City';
      (stop.scheduledActivities || []).forEach((act) => {
        const dateKey = act.scheduledDate || 'Unscheduled';
        if (!daysMap[dateKey]) {
          daysMap[dateKey] = {
            dayNumber: dayCount++,
            date: dateKey,
            cityName,
            activities: [],
          };
        }
        daysMap[dateKey].activities.push(act);
      });
    });

    return Object.values(daysMap);
  };

  const dayWiseList = buildDayWiseItinerary();

  return (
    <div className="page-enter min-h-screen bg-surface pb-16">
      {/* Hero Header with Dark Indigo Gradient */}
      <div className="bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F] text-white py-14 px-4 sm:px-6 lg:px-8 pt-24 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent-light text-xs font-semibold border border-accent/30">
                <Globe className="w-3.5 h-3.5 text-accent" />
                <span>Shared Public Itinerary</span>
              </div>
              <h1 className="text-display-lg text-2xl sm:text-4xl font-extrabold text-white">
                {trip.name}
              </h1>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-text-light flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </span>
                </span>
                <span>•</span>
                <span>Planned by <strong className="text-white">{trip.ownerName || 'a traveler'}</strong></span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              {/* Copy Link */}
              <motion.button
                onClick={handleCopyLink}
                {...tapProps}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-btn border border-white/30 text-white text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </motion.button>

              {/* Copy Trip */}
              {isAuthenticated ? (
                <motion.button
                  onClick={handleCopyTrip}
                  {...tapProps}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-btn-accent transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Copy to My Trips</span>
                </motion.button>
              ) : (
                <motion.div {...tapProps}>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-btn-accent transition-colors"
                  >
                    <span>Log in to Copy</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onClose={() => setError(null)} />

      {/* Itinerary Content */}
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
        variants={staggerContainer}
        {...getMotionProps(reduceMotion, 'mount')}
      >
        {dayWiseList.length === 0 ? (
          <div className="gt-card p-10 text-center text-text-muted">
            No scheduled activities in this public trip itinerary.
          </div>
        ) : (
          dayWiseList.map((dayItem) => (
            <motion.div key={dayItem.date} className="space-y-4" variants={fadeUpItem}>
              <div className="flex items-center space-x-3 border-b border-border-light pb-2.5">
                <span className="bg-accent text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-sm">
                  Day {dayItem.dayNumber}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-text-main font-display">
                  {formatDate(dayItem.date)} <span className="text-border-strong font-normal">—</span>{' '}
                  <span className="text-accent">{dayItem.cityName}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayItem.activities.map((act) => {
                  const cost =
                    act.costOverride !== null && act.costOverride !== undefined
                      ? act.costOverride
                      : act.cost;

                  return (
                    <motion.div
                      key={act.id}
                      whileHover={reduceMotion ? {} : { y: -3, transition: springMomentum }}
                      className="gt-card p-5 flex items-start space-x-4 hover:border-accent/40"
                    >
                      {act.imageUrl && (
                        <img
                          src={act.imageUrl}
                          alt={act.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-surface-raised border border-border-light"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full uppercase">
                            {act.category || 'Sightseeing'}
                          </span>
                          <span className="text-xs font-bold text-emerald-700">₹{cost}</span>
                        </div>

                        <h4 className="font-bold text-text-main text-sm mt-1.5 truncate">
                          {act.name}
                        </h4>

                        <div className="flex items-center space-x-3 text-xs text-text-muted mt-2">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-accent" />
                            <span>{act.scheduledTime || '—'}</span>
                          </span>
                          {act.durationMinutes && <span>({act.durationMinutes} mins)</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default PublicTripView;
