import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Clock, ArrowLeft } from 'lucide-react';
import { get } from '../api/client';
import { MOCK_TRIP_DETAIL } from '../api/mocks';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';

const ItineraryView = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'calendar'

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedTrip = null;
      try {
        fetchedTrip = await get(`/trips/${id}`);
      } catch {
        fetchedTrip = MOCK_TRIP_DETAIL;
      }

      setTrip(fetchedTrip);
    } catch (err) {
      setError({
        message: err.message || 'Failed to load trip view.',
        code: err.code || 'FETCH_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  if (loading) return <Skeleton type="itinerary" />;
  if (!trip) return <ErrorBanner message="Trip not found." onRetry={fetchTrip} />;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to={`/trips/${trip.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-textMuted hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itinerary Builder</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-textMain tracking-tight font-display">{trip.name}</h1>
            <p className="text-sm text-textMuted mt-1 flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-accent" />
              <span>
                {trip.startDate} – {trip.endDate}
              </span>
            </p>
          </div>

          {/* List / Calendar Toggle */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center space-x-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
        </div>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchTrip} onClose={() => setError(null)} />

      {/* View Content */}
      {activeTab === 'calendar' ? (
        <div className="bg-surface-card border-2 border-dashed border-borderLight rounded-card p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-textMain">Calendar View Coming Soon</h3>
          <p className="text-xs text-textMuted max-w-sm mx-auto">
            Interactive drag-and-drop calendar matrix is currently in development for a future release.
          </p>
          <button
            onClick={() => setActiveTab('list')}
            className="mt-2 text-xs font-bold text-primary hover:underline"
          >
            Switch back to List View &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {dayWiseList.length === 0 ? (
            <div className="bg-surface-card border border-borderLight rounded-card p-8 text-center text-textMuted">
              No scheduled activities to display in this itinerary yet.
            </div>
          ) : (
            dayWiseList.map((dayItem) => {
              const dateFormatted = new Date(dayItem.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              });

              return (
                <div key={dayItem.date} className="space-y-4">
                  {/* Day Header: "Day 1 — June 1 — Paris" */}
                  <div className="flex items-center space-x-3 border-b border-borderLight pb-2">
                    <span className="bg-primary text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-sm">
                      Day {dayItem.dayNumber}
                    </span>
                    <h3 className="text-xl font-bold text-textMain font-display">
                      {dateFormatted} <span className="text-slate-300 font-normal">—</span>{' '}
                      <span className="text-accent">{dayItem.cityName}</span>
                    </h3>
                  </div>

                  {/* Activity blocks */}
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
      )}
    </div>
  );
};

export default ItineraryView;
