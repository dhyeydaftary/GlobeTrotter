import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Copy, Check, Lock, Globe, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get, post } from '../api/client';
import { MOCK_TRIP_DETAIL } from '../api/mocks';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';

const PublicTripView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isCopyingTrip, setIsCopyingTrip] = useState(false);

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
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) return;
    setIsCopyingTrip(true);
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
    } finally {
      setIsCopyingTrip(false);
    }
  };

  if (loading) return <Skeleton type="itinerary" />;
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
  const ownerDisplayName = trip.ownerName || 'Explorer';
  const avatarInitial = ownerDisplayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ErrorBanner message={error?.message} code={error?.code} onClose={() => setError(null)} />

      {/* Shared Public Header */}
      <div className="bg-surface-card rounded-card p-6 sm:p-8 shadow-card border border-borderLight flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-success text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              <Globe className="w-3.5 h-3.5" />
              <span>Public Shared Itinerary</span>
            </span>

            <div className="flex items-center space-x-2 text-xs font-semibold text-textMuted">
              <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[10px]">
                {avatarInitial}
              </div>
              <span>Shared by {ownerDisplayName}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-textMain tracking-tight font-display">
            {trip.name}
          </h1>

          <p className="text-xs sm:text-sm text-textMuted mt-1.5 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>
              {trip.startDate} – {trip.endDate}
            </span>
          </p>
        </div>

        {/* Action Buttons: Copy Link (Morphs icon) + Copy Trip (Tooltip if not logged in) */}
        <div className="flex items-center space-x-3 flex-wrap">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-btn shadow-sm transition-all"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4 text-success animate-fade-in" />
                <span className="text-success">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Copy Trip Button */}
          {isAuthenticated ? (
            <button
              onClick={handleCopyTrip}
              disabled={isCopyingTrip}
              className="inline-flex items-center space-x-2 text-xs font-bold bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-btn shadow-accent-glow hover:scale-[1.03] transition-all disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              <span>{isCopyingTrip ? 'Copying...' : 'Copy Trip to My Account'}</span>
            </button>
          ) : (
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center space-x-2 text-xs font-bold bg-slate-100 text-slate-400 border border-borderLight px-4 py-2.5 rounded-btn cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>Copy Trip</span>
              </button>

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-44 bg-slate-900 text-white text-[11px] font-semibold text-center py-1.5 px-2.5 rounded-lg shadow-lg z-20">
                Log in to copy this trip
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Read-Only Day-Wise Itinerary List */}
      <div className="space-y-8">
        {dayWiseList.length === 0 ? (
          <div className="bg-surface-card border border-borderLight rounded-card p-8 text-center text-textMuted">
            No scheduled activities in this public trip itinerary.
          </div>
        ) : (
          dayWiseList.map((dayItem) => {
            const dateFormatted = new Date(dayItem.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            });

            return (
              <div key={dayItem.date} className="space-y-4">
                <div className="flex items-center space-x-3 border-b border-borderLight pb-2">
                  <span className="bg-primary text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-sm">
                    Day {dayItem.dayNumber}
                  </span>
                  <h3 className="text-xl font-bold text-textMain font-display">
                    {dateFormatted} <span className="text-slate-300">—</span>{' '}
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
                      <div
                        key={act.id}
                        className="bg-surface-card border border-borderLight rounded-card p-5 shadow-card hover:shadow-card-hover transition-all flex items-start space-x-4"
                      >
                        {act.imageUrl && (
                          <img
                            src={act.imageUrl}
                            alt={act.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded uppercase">
                              {act.category || 'Sightseeing'}
                            </span>
                            <span className="text-xs font-bold text-emerald-700">₹{cost}</span>
                          </div>

                          <h4 className="font-bold text-textMain text-sm mt-1 truncate">
                            {act.name}
                          </h4>

                          <div className="flex items-center space-x-3 text-xs text-textMuted mt-2">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{act.scheduledTime}</span>
                            </span>
                            {act.durationMinutes && (
                              <span>({act.durationMinutes} mins)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PublicTripView;
