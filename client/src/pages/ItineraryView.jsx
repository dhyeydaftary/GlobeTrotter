import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, List, Clock, ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { get } from '../api/client';
import { MOCK_TRIP_DETAIL, MOCK_BUDGET, withMockFallback } from '../api/mocks';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';
import ItineraryCalendar from '../components/ItineraryCalendar';
import {
  springSettle, springMomentum, staggerContainer, fadeUpItem, getMotionProps,
} from '../lib/motion';

function activityCost(act) {
  if (act.costOverride !== null && act.costOverride !== undefined) return Number(act.costOverride);
  return Number(act.cost) || 0;
}

const ItineraryView = () => {
  const { id } = useParams();
  const reduceMotion = useReducedMotion();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedTrip, fetchedBudget] = await Promise.all([
        withMockFallback(() => get(`/trips/${id}`), MOCK_TRIP_DETAIL),
        withMockFallback(() => get(`/trips/${id}/budget`), MOCK_BUDGET),
      ]);
      setTrip(fetchedTrip);
      setBudget(fetchedBudget);
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

  const dayWiseList = useMemo(() => {
    if (!trip) return [];
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
            spend: 0,
          };
        }
        daysMap[dateKey].activities.push(act);
        daysMap[dateKey].spend += activityCost(act);
      });
    });

    return Object.values(daysMap);
  }, [trip]);

  const overBudgetDates = useMemo(() => {
    const set = new Set(budget?.overBudgetDays || []);
    const threshold = trip?.dailyBudgetThreshold;
    if (threshold) {
      dayWiseList.forEach((day) => {
        if (day.date !== 'Unscheduled' && day.spend > threshold) set.add(day.date);
      });
    }
    return set;
  }, [budget, trip, dayWiseList]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Skeleton type="itinerary" />
      </div>
    );
  }
  if (!trip) return <ErrorBanner message="Trip not found." onRetry={fetchTrip} />;

  const mountProps = getMotionProps(reduceMotion, 'mount');

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 pb-16 space-y-8">
      <div>
        <Link
          to={`/trips/${trip.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Itinerary Builder</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Itinerary Timeline</span>
            </div>
            <h1 className="text-display-lg text-2xl sm:text-3xl font-extrabold text-text-main">
              {trip.name}
            </h1>
            <p className="text-sm text-text-muted mt-1 flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-accent" />
              <span>
                {trip.startDate} – {trip.endDate}
              </span>
            </p>
          </div>

          {/* List vs Calendar Toggle — sliding pill indicator anchored to the active tab */}
          <div className="relative bg-surface-raised border border-border-light p-1 rounded-btn flex items-center space-x-1 self-start md:self-auto shadow-sm">
            {['list', 'calendar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors ${
                  activeTab === tab ? 'text-accent' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="itinerary-tab-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                    transition={reduceMotion ? { duration: 0.15 } : springSettle}
                  />
                )}
                {tab === 'list' ? <List className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
                <span>{tab === 'list' ? 'List View' : 'Calendar'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchTrip} onClose={() => setError(null)} />

      {overBudgetDates.size > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-card border border-warning/30 bg-warning/10 text-text-main">
          <span className="text-warning text-lg font-bold">⚠</span>
          <div>
            <p className="font-bold text-text-main text-sm">
              Over the daily budget{trip.dailyBudgetThreshold ? ` (₹${trip.dailyBudgetThreshold})` : ''}
            </p>
            <p className="text-text-muted text-xs sm:text-sm mt-0.5">
              {Array.from(overBudgetDates).join(', ')}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'calendar' ? (
        <ItineraryCalendar days={dayWiseList} overBudgetDates={overBudgetDates} />
      ) : (
        <motion.div className="space-y-8" variants={staggerContainer} {...mountProps}>
          {dayWiseList.length === 0 ? (
            <div className="gt-card p-10 text-center text-text-muted">
              No scheduled activities to display in this itinerary yet.
            </div>
          ) : (
            dayWiseList.map((dayItem) => {
              const dateFormatted =
                dayItem.date === 'Unscheduled'
                  ? 'Unscheduled'
                  : new Date(dayItem.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    });
              const over = overBudgetDates.has(dayItem.date);

              return (
                <motion.div key={dayItem.date} className="space-y-4" variants={fadeUpItem}>
                  <div className="flex flex-wrap items-center gap-3 border-b border-border-light pb-3">
                    <span className="bg-accent text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-sm">
                      Day {dayItem.dayNumber}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-text-main font-display">
                      {dateFormatted} <span className="text-border-strong font-normal">—</span>{' '}
                      <span className="text-accent">{dayItem.cityName}</span>
                    </h3>
                    {over && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-warning bg-warning/10 border border-warning/30 px-2.5 py-0.5 rounded-full">
                        Over budget · ₹{dayItem.spend}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayItem.activities.map((act) => {
                      const cost = activityCost(act);
                      return (
                        <motion.div
                          key={act.id}
                          className="gt-card p-5 flex items-start space-x-4 hover:border-accent/40"
                          whileHover={reduceMotion ? {} : { y: -3, transition: springMomentum }}
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
                            <h4 className="font-bold text-text-main text-sm mt-1.5 truncate">{act.name}</h4>
                            <div className="flex items-center space-x-3 text-xs text-text-muted mt-2">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                <span>{act.scheduledTime}</span>
                              </span>
                              {act.durationMinutes && <span>({act.durationMinutes} mins)</span>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ItineraryView;
