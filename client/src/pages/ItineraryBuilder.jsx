import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Globe,
  Lock,
  Eye,
  Clock,
  DollarSign,
  Search,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get, post, patch, del } from '../api/client';
import { MOCK_TRIP_DETAIL, MOCK_CITIES, MOCK_ACTIVITIES } from '../api/mocks';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';

const ItineraryBuilder = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded stops tracker (set of stop IDs)
  const [expandedStops, setExpandedStops] = useState(new Set());
  const [animatingStopId, setAnimatingStopId] = useState(null);

  // Toggle Public state
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);

  // Add Stop Inline Slide-Down Panel state
  const [showAddStopPanel, setShowAddStopPanel] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stopArrival, setStopArrival] = useState('');
  const [stopDeparture, setStopDeparture] = useState('');
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Add Activity Inline Panel state
  const [activeActivityStopId, setActiveActivityStopId] = useState(null);
  const [activitySearchResults, setActivitySearchResults] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('10:00');
  const [costOverride, setCostOverride] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

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

      if (fetchedTrip?.stops) {
        setExpandedStops(new Set(fetchedTrip.stops.map((s) => s.id)));
      }
    } catch (err) {
      setError({
        message: err.message || 'Failed to load trip itinerary.',
        code: err.code || 'FETCH_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Debounced City Search
  useEffect(() => {
    if (!citySearch.trim()) {
      setCitySearchResults(MOCK_CITIES);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await get(`/cities?search=${encodeURIComponent(citySearch)}`);
        setCitySearchResults(results);
      } catch {
        setCitySearchResults(
          MOCK_CITIES.filter(
            (c) =>
              c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
              c.country.toLowerCase().includes(citySearch.toLowerCase())
          )
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [citySearch]);

  const toggleStopExpand = (stopId) => {
    setExpandedStops((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
      } else {
        next.add(stopId);
      }
      return next;
    });
  };

  // Toggle Public status
  const handleTogglePublic = async () => {
    if (!trip) return;
    setIsTogglingPublic(true);
    const newPublicState = !trip.isPublic;

    try {
      const updated = await patch(`/trips/${trip.id}`, { isPublic: newPublicState });
      setTrip((prev) => ({ ...prev, isPublic: updated.isPublic }));
    } catch {
      setTrip((prev) => ({ ...prev, isPublic: newPublicState }));
    } finally {
      setIsTogglingPublic(false);
    }
  };

  // Add Stop Submit
  const handleAddStopSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCity) {
      alert('Please select a city.');
      return;
    }

    setIsAddingStop(true);
    const payload = {
      cityId: selectedCity.id,
      arrivalDate: stopArrival,
      departureDate: stopDeparture,
    };

    try {
      let newStop = null;
      try {
        newStop = await post(`/trips/${trip.id}/stops`, payload);
      } catch {
        newStop = {
          id: 'stop_' + Date.now(),
          cityId: selectedCity.id,
          city: selectedCity,
          arrivalDate: stopArrival,
          departureDate: stopDeparture,
          scheduledActivities: [],
        };
      }

      setTrip((prev) => ({
        ...prev,
        stops: [...(prev.stops || []), newStop],
      }));

      setExpandedStops((prev) => new Set([...prev, newStop.id]));

      setShowAddStopPanel(false);
      setSelectedCity(null);
      setCitySearch('');
      setStopArrival('');
      setStopDeparture('');
    } catch (err) {
      alert(err.message || 'Failed to add stop');
    } finally {
      setIsAddingStop(false);
    }
  };

  // Add Activity Submit
  const handleAddActivitySubmit = async (e, stopId) => {
    e.preventDefault();
    if (!selectedActivity) {
      alert('Please select an activity.');
      return;
    }

    setIsAddingActivity(true);
    const payload = {
      activityId: selectedActivity.id,
      scheduledDate: activityDate,
      scheduledTime: activityTime,
      costOverride: costOverride ? parseFloat(costOverride) : null,
    };

    try {
      let newSchedAct = null;
      try {
        newSchedAct = await post(`/stops/${stopId}/activities`, payload);
      } catch {
        newSchedAct = {
          id: 'sa_' + Date.now(),
          activityId: selectedActivity.id,
          name: selectedActivity.name,
          category: selectedActivity.category,
          cost: selectedActivity.cost,
          costOverride: costOverride ? parseFloat(costOverride) : null,
          durationMinutes: selectedActivity.durationMinutes,
          scheduledDate: activityDate,
          scheduledTime: activityTime,
          imageUrl: selectedActivity.imageUrl,
        };
      }

      setTrip((prev) => ({
        ...prev,
        stops: prev.stops.map((s) => {
          if (s.id === stopId) {
            return {
              ...s,
              scheduledActivities: [...(s.scheduledActivities || []), newSchedAct],
            };
          }
          return s;
        }),
      }));

      setActiveActivityStopId(null);
      setSelectedActivity(null);
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Delete this stop and all its scheduled activities?')) return;
    try {
      await del(`/stops/${stopId}`);
    } catch {}
    setTrip((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== stopId),
    }));
  };

  const handleDeleteActivity = async (stopId, scheduledActivityId) => {
    try {
      await del(`/scheduled-activities/${scheduledActivityId}`);
    } catch {}
    setTrip((prev) => ({
      ...prev,
      stops: prev.stops.map((s) => {
        if (s.id === stopId) {
          return {
            ...s,
            scheduledActivities: s.scheduledActivities.filter((a) => a.id !== scheduledActivityId),
          };
        }
        return s;
      }),
    }));
  };

  const handleReorderStop = async (index, direction) => {
    if (!trip?.stops) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= trip.stops.length) return;

    const stopToAnimate = trip.stops[index].id;
    setAnimatingStopId(stopToAnimate);

    setTimeout(() => {
      setAnimatingStopId(null);
    }, 150);

    const newStops = [...trip.stops];
    const [moved] = newStops.splice(index, 1);
    newStops.splice(targetIndex, 0, moved);

    setTrip((prev) => ({ ...prev, stops: newStops }));

    try {
      await patch(`/trips/${trip.id}/stops/reorder`, {
        orderedStopIds: newStops.map((s) => s.id),
      });
    } catch {}
  };

  const isOwner = user && (!trip?.userId || trip.userId === user.id);

  if (loading) return <Skeleton type="itinerary" />;
  if (!trip) return <ErrorBanner message="Trip not found" onRetry={fetchTrip} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-surface-card rounded-card p-6 sm:p-8 shadow-card border border-borderLight flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-textMuted mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>
              {trip.startDate} – {trip.endDate}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-textMain tracking-tight font-display">
            {trip.name}
          </h1>
          {trip.description && <p className="text-slate-600 text-sm mt-2">{trip.description}</p>}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={`/trips/${trip.id}/view`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-btn transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>View Itinerary</span>
          </Link>

          <Link
            to={`/trips/${trip.id}/budget`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-btn transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>Budget Details</span>
          </Link>

          {/* Toggle Switch Component */}
          {isOwner && (
            <div className="flex items-center space-x-2.5 bg-slate-50 px-3.5 py-2 rounded-btn border border-borderLight">
              <span className="text-xs font-bold text-slate-700">Public:</span>
              <button
                type="button"
                onClick={handleTogglePublic}
                disabled={isTogglingPublic}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                  trip.isPublic ? 'bg-accent' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={trip.isPublic}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                    trip.isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchTrip} onClose={() => setError(null)} />

      {/* Main Stops Header & Add Stop Coral Outline CTA Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-textMain tracking-tight font-display">
            Trip Stops
          </h2>
          <p className="text-xs text-textMuted">Organize destinations and schedule daily activities</p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddStopPanel(!showAddStopPanel)}
            className="inline-flex items-center space-x-1.5 border-2 border-accent text-accent hover:bg-accent hover:text-white font-extrabold text-xs px-4 py-2.5 rounded-btn shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stop</span>
          </button>
        )}
      </div>

      {/* Slide-Down Panel for Add Stop */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          showAddStopPanel ? 'max-h-[450px] opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <form
          onSubmit={handleAddStopSubmit}
          className="bg-surface-card border-2 border-accent/30 rounded-card p-6 shadow-card space-y-4"
        >
          <div className="flex items-center justify-between border-b border-borderLight pb-3">
            <h3 className="font-bold text-textMain text-base">Add New Stop to Trip</h3>
            <button
              type="button"
              onClick={() => setShowAddStopPanel(false)}
              className="text-textMuted hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                Search City
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="e.g. Paris, Rome..."
                  className="block w-full pl-9 pr-3 py-2 border border-borderLight rounded-input text-sm bg-slate-50"
                />
              </div>
              <div className="mt-2 max-h-36 overflow-y-auto border border-borderLight rounded-input bg-white divide-y">
                {citySearchResults.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      selectedCity?.id === city.id ? 'bg-primary/10 font-bold text-primary' : ''
                    }`}
                  >
                    <span>
                      {city.name}, {city.country}
                    </span>
                    {selectedCity?.id === city.id && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                required
                value={stopArrival}
                onChange={(e) => setStopArrival(e.target.value)}
                className="block w-full px-3 py-2 border border-borderLight rounded-input text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                Departure Date
              </label>
              <input
                type="date"
                required
                value={stopDeparture}
                onChange={(e) => setStopDeparture(e.target.value)}
                className="block w-full px-3 py-2 border border-borderLight rounded-input text-sm bg-slate-50"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddStopPanel(false)}
              className="px-4 py-2 text-xs font-semibold text-textMuted hover:bg-slate-100 rounded-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingStop || !selectedCity}
              className="px-5 py-2 text-xs font-bold bg-accent hover:bg-accent-hover text-white rounded-btn shadow-sm disabled:opacity-50"
            >
              {isAddingStop ? 'Adding...' : 'Confirm Stop'}
            </button>
          </div>
        </form>
      </div>

      {/* Stops List (Visible Border border: 1px solid #E5E7EB, rounded-xl, p-5) */}
      {trip.stops?.length === 0 ? (
        <div className="bg-surface-card rounded-xl p-8 text-center border border-borderLight text-textMuted">
          No stops added to this trip yet. Click "+ Add Stop" above to begin.
        </div>
      ) : (
        <div className="space-y-6">
          {trip.stops?.map((stop, index) => {
            const isExpanded = expandedStops.has(stop.id);
            const isAnimating = animatingStopId === stop.id;

            const stopCostTotal = (stop.scheduledActivities || []).reduce((acc, act) => {
              const cost = act.costOverride !== null && act.costOverride !== undefined ? act.costOverride : act.cost;
              return acc + (cost || 0);
            }, 0);

            const groupedActivities = {};
            (stop.scheduledActivities || []).forEach((act) => {
              const dayKey = act.scheduledDate || 'Unscheduled';
              if (!groupedActivities[dayKey]) groupedActivities[dayKey] = [];
              groupedActivities[dayKey].push(act);
            });

            return (
              <div
                key={stop.id}
                className={`bg-surface-card rounded-xl shadow-card border border-borderLight overflow-hidden transition-all duration-200 ${
                  isAnimating ? 'animate-reorder-snap' : ''
                }`}
              >
                {/* Collapsible Header */}
                <div className="bg-primary text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div
                    onClick={() => toggleStopExpand(stop.id)}
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>
                          {stop.city?.name || stop.cityName}, {stop.city?.country}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {stop.arrivalDate} – {stop.departureDate} • Total: ₹{stopCostTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isOwner && (
                      <>
                        <button
                          onClick={() => handleReorderStop(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"
                          title="Move Stop Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorderStop(index, 'down')}
                          disabled={index === trip.stops.length - 1}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"
                          title="Move Stop Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Add Activity Coral Outline Button */}
                        <button
                          onClick={() => {
                            setExpandedStops((prev) => new Set([...prev, stop.id]));
                            setActiveActivityStopId(stop.id);
                            setSelectedActivity(null);
                            setActivityDate(stop.arrivalDate || '');
                            setActivitySearchResults(MOCK_ACTIVITIES);
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-bold border-2 border-accent text-accent hover:bg-accent hover:text-white bg-transparent px-3 py-1.5 rounded-btn shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Activity</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStop(stop.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg"
                          title="Delete Stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Expand/Collapse Chevron rotating 0deg -> 180deg (250ms ease-out) */}
                    <button
                      onClick={() => toggleStopExpand(stop.id)}
                      className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-transform duration-250 ease-out"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-250 ease-out ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Collapsible Body (p-5 = 20px padding) */}
                {isExpanded && (
                  <div className="p-5 space-y-6 animate-fade-in">
                    {/* Add Activity Inline Panel */}
                    {activeActivityStopId === stop.id && isOwner && (
                      <form
                        onSubmit={(e) => handleAddActivitySubmit(e, stop.id)}
                        className="p-4 bg-accent/5 rounded-card border border-accent/20 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-textMain uppercase tracking-wider">
                            Schedule Activity in {stop.city?.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActiveActivityStopId(null)}
                            className="text-textMuted hover:text-slate-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                              Activity
                            </label>
                            <select
                              required
                              value={selectedActivity?.id || ''}
                              onChange={(e) => {
                                const act = activitySearchResults.find((a) => a.id === e.target.value);
                                setSelectedActivity(act || null);
                              }}
                              className="block w-full px-3 py-2 border border-borderLight rounded-input text-xs bg-white"
                            >
                              <option value="">-- Select Activity --</option>
                              {activitySearchResults.map((act) => (
                                <option key={act.id} value={act.id}>
                                  {act.name} (₹{act.cost})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              required
                              min={stop.arrivalDate}
                              max={stop.departureDate}
                              value={activityDate}
                              onChange={(e) => setActivityDate(e.target.value)}
                              className="block w-full px-3 py-2 border border-borderLight rounded-input text-xs bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                              Time (HH:mm)
                            </label>
                            <input
                              type="time"
                              required
                              value={activityTime}
                              onChange={(e) => setActivityTime(e.target.value)}
                              className="block w-full px-3 py-2 border border-borderLight rounded-input text-xs bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="w-48">
                            <label className="block text-xs font-semibold text-textMain uppercase mb-1">
                              Cost Override
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={`Default ₹${selectedActivity?.cost || 0}`}
                              value={costOverride}
                              onChange={(e) => setCostOverride(e.target.value)}
                              className="block w-full px-3 py-1.5 border border-borderLight rounded-input text-xs bg-white"
                            />
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setActiveActivityStopId(null)}
                              className="px-3 py-1.5 text-xs text-textMuted hover:bg-slate-200 rounded-btn"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isAddingActivity || !selectedActivity}
                              className="px-4 py-1.5 text-xs font-bold bg-accent text-white rounded-btn disabled:opacity-50"
                            >
                              {isAddingActivity ? 'Adding...' : 'Save Activity'}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Activity Rows Grouped by Day */}
                    {Object.keys(groupedActivities).length === 0 ? (
                      <div className="text-xs text-textMuted italic py-2">
                        No scheduled activities for this stop yet. Click "+ Add Activity" to schedule one.
                      </div>
                    ) : (
                      Object.entries(groupedActivities).map(([date, acts]) => (
                        <div key={date} className="space-y-2">
                          {/* Day Subheader: 13px, font-semibold, #6B7280, UPPERCASE, letter-spacing 0.05em, border-bottom #E5E7EB, pb-2, mb-3 */}
                          <div className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-[0.05em] border-b border-borderLight pb-2 mb-3">
                            📅 {date}
                          </div>

                          {/* Activity rows: flex, space-between, align-center, py-2.5 (10px), border-bottom #F3F4F6 */}
                          <div className="divide-y divide-[#F3F4F6]">
                            {acts.map((act) => {
                              const actCost =
                                act.costOverride !== null && act.costOverride !== undefined
                                  ? act.costOverride
                                  : act.cost;

                              return (
                                <div
                                  key={act.id}
                                  className="flex items-center justify-between py-[10px] hover:bg-slate-50 transition-colors group px-2 rounded-lg"
                                >
                                  {/* Left: Time in bold navy */}
                                  <span className="font-bold text-xs text-primary shrink-0 w-16">
                                    {act.scheduledTime}
                                  </span>

                                  {/* Center: Activity name */}
                                  <span className="font-semibold text-textMain text-xs sm:text-sm flex-1 truncate px-3">
                                    {act.name}
                                  </span>

                                  {/* Right: Cost in muted gray + delete icon */}
                                  <div className="flex items-center space-x-3 shrink-0">
                                    <span className="text-xs font-semibold text-[#6B7280]">
                                      ₹{actCost}
                                    </span>
                                    {isOwner && (
                                      <button
                                        onClick={() => handleDeleteActivity(stop.id, act.id)}
                                        className="text-slate-300 group-hover:text-rose-600 p-1 transition-colors"
                                        title="Delete Activity"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;
