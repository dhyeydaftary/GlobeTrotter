import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  DollarSign,
  Search,
  X,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get, post, patch, del } from '../api/client';
import { MOCK_TRIP_DETAIL, MOCK_CITIES, MOCK_ACTIVITIES, withMockFallback } from '../api/mocks';
import ErrorBanner from '../components/ErrorBanner';
import ConfirmDialog from '../components/ConfirmDialog';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toggleChip(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all active:scale-[0.97] ${
      active
        ? 'bg-accent text-white border-accent shadow-sm'
        : 'bg-surface text-text-muted border-border-light hover:border-accent/40 hover:text-text-main'
    }`}
  >
    {children}
  </button>
);

const ItineraryBuilder = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded stops tracker (set of stop IDs)
  const [expandedStops, setExpandedStops] = useState(new Set());

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
  const [cityRegions, setCityRegions] = useState([]);
  const [stopToDelete, setStopToDelete] = useState(null);

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTrip = await withMockFallback(() => get(`/trips/${id}`), MOCK_TRIP_DETAIL);
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
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      if (citySearch.trim()) params.set('search', citySearch.trim());
      const qs = params.toString() ? `?${params}` : '';
      const results = await withMockFallback(
        () => get(`/cities${qs}`),
        () => {
          const q = citySearch.toLowerCase();
          return MOCK_CITIES.filter(
            (c) =>
              !q ||
              c.name.toLowerCase().includes(q) ||
              c.country.toLowerCase().includes(q)
          );
        }
      );
      setCitySearchResults(results || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [citySearch]);

  const toggleExpand = (stopId) => {
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
      } catch (err) {
        if (err?.code !== 'NETWORK_ERROR') throw err;
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
      } catch (err) {
        if (err?.code !== 'NETWORK_ERROR') throw err;
        newSchedAct = {
          id: 'sa_' + Date.now(),
          activityId: selectedActivity.id,
          activity: selectedActivity,
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
      setCostOverride('');
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteStop = async () => {
    const stopId = stopToDelete;
    if (!stopId) return;
    try {
      await del(`/stops/${stopId}`);
    } catch (err) {
      if (err?.code !== 'NETWORK_ERROR') {
        setError({ message: err.message || 'Failed to delete stop.' });
        return;
      }
    }
    setTrip((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== stopId),
    }));
    setStopToDelete(null);
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

  const handleReorderStop = async (index, direction, e) => {
    e.stopPropagation();
    if (!trip?.stops) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= trip.stops.length) return;

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

  if (loading) {
    return (
      <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 space-y-6">
        <div className="skeleton h-28 w-full rounded-card" />
        <div className="skeleton h-48 w-full rounded-card" />
        <div className="skeleton h-48 w-full rounded-card" />
      </div>
    );
  }

  if (!trip) return <ErrorBanner message="Trip not found" onRetry={fetchTrip} />;

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 pb-16 space-y-8">
      {/* Top Banner Header */}
      <div className="gt-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-text-muted mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>
          <h1 className="text-display-md text-2xl sm:text-3xl font-extrabold text-text-main">
            {trip.name}
          </h1>
          {trip.description && (
            <p className="text-text-muted text-sm mt-2 leading-relaxed max-w-2xl">{trip.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={`/trips/${trip.id}/view`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-surface-raised hover:bg-border-light text-text-main px-4 py-2.5 rounded-btn border border-border-light active:scale-[0.97] transition-all"
          >
            <Eye className="w-4 h-4 text-accent" />
            <span>View Itinerary</span>
          </Link>

          <Link
            to={`/trips/${trip.id}/budget`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-btn border border-emerald-200 active:scale-[0.97] transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>Budget Details</span>
          </Link>
        </div>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchTrip} onClose={() => setError(null)} />

      {/* Main Stops Header & Add Stop CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-md text-xl font-bold text-text-main">Trip Stops</h2>
          <p className="text-xs text-text-muted mt-0.5">Organize destinations and schedule daily activities</p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddStopPanel(!showAddStopPanel)}
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white font-bold px-4 py-2.5 rounded-btn text-xs shadow-btn-accent active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddStopPanel ? 'Close Panel' : 'Add Stop'}</span>
          </button>
        )}
      </div>

      {/* Slide-Down Frosted Glass Panel for Add Stop */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          showAddStopPanel ? 'max-h-[760px] opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <form
          onSubmit={handleAddStopSubmit}
          className="gt-glass p-6 sm:p-7 rounded-card space-y-5 border border-accent/30 shadow-glass"
        >
          <div className="flex items-center justify-between border-b border-border-light pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h3 className="font-display font-bold text-text-main text-base">Add New Stop to Trip</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStopPanel(false)}
              className="text-text-muted hover:text-text-main p-1 rounded-lg hover:bg-surface-raised transition-colors"
              aria-label="Close add stop panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                Search City
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="e.g. Paris, Rome..."
                  className="block w-full pl-9 pr-3 py-2 border border-border-light rounded-btn text-xs sm:text-sm bg-white/90 text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>

              {/* Region chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...new Set((citySearchResults.length ? citySearchResults : MOCK_CITIES).map((c) => c.region).filter(Boolean))].map(
                  (region) => (
                    <Chip
                      key={region}
                      active={cityRegions.includes(region)}
                      onClick={() => setCityRegions((prev) => toggleChip(prev, region))}
                    >
                      {region}
                    </Chip>
                  )
                )}
              </div>

              {/* City Selection List with Accent Light Highlight */}
              <div className="mt-2.5 max-h-40 overflow-y-auto border border-border-light rounded-xl bg-white divide-y divide-border-light/60 shadow-sm">
                {citySearchResults
                  .filter((c) => !cityRegions.length || cityRegions.includes(c.region))
                  .map((city) => {
                    const isSelected = selectedCity?.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-accent-light text-accent font-bold'
                            : 'hover:bg-accent-light/50 text-text-main'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-accent' : 'text-text-light'}`} />
                          <span>
                            {city.name}, <span className="text-text-muted">{city.country}</span>
                          </span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-accent" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                Arrival Date
              </label>
              <input
                type="date"
                required
                value={stopArrival}
                onChange={(e) => setStopArrival(e.target.value)}
                className="block w-full px-3 py-2 border border-border-light rounded-btn text-xs sm:text-sm bg-white/90 text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                Departure Date
              </label>
              <input
                type="date"
                required
                value={stopDeparture}
                onChange={(e) => setStopDeparture(e.target.value)}
                className="block w-full px-3 py-2 border border-border-light rounded-btn text-xs sm:text-sm bg-white/90 text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2 border-t border-border-light/60">
            <button
              type="button"
              onClick={() => setShowAddStopPanel(false)}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-main rounded-btn hover:bg-surface-raised transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingStop || !selectedCity}
              className="px-5 py-2.5 text-xs font-bold bg-accent hover:bg-accent-hover text-white rounded-btn shadow-btn-accent active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {isAddingStop ? 'Adding stop...' : 'Confirm Stop'}
            </button>
          </div>
        </form>
      </div>

      {/* Stop Cards */}
      {trip.stops?.length === 0 ? (
        <div className="gt-card p-10 text-center border-dashed text-text-muted space-y-3">
          <p className="text-sm font-medium">No stops added to this trip yet.</p>
          <button
            type="button"
            onClick={() => setShowAddStopPanel(true)}
            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click here to add your first stop</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {trip.stops?.map((stop, index) => {
            const isExpanded = expandedStops.has(stop.id);

            // Group activities by date
            const dayGroupsMap = {};
            (stop.scheduledActivities || []).forEach((act) => {
              const dayKey = act.scheduledDate || 'Unscheduled';
              if (!dayGroupsMap[dayKey]) dayGroupsMap[dayKey] = [];
              dayGroupsMap[dayKey].push(act);
            });

            const dayGroups = Object.entries(dayGroupsMap).map(([date, activities]) => ({
              date,
              activities,
            }));

            return (
              <div key={stop.id} className="gt-card p-0 overflow-hidden shadow-card hover:shadow-card-hover transition-all">
                {/* Stop Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 cursor-pointer hover:bg-surface-raised/60 transition-colors"
                  onClick={() => toggleExpand(stop.id)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-accent-light text-accent border border-accent/20 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-text-main text-base sm:text-lg">
                        {stop.city?.name || stop.cityName}
                      </h3>
                      <p className="text-text-muted text-xs">
                        {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Segmented Reorder & Actions Group */}
                    {isOwner && (
                      <div className="inline-flex items-center bg-surface border border-border-light rounded-btn p-0.5 shadow-sm">
                        <button
                          onClick={(e) => handleReorderStop(index, 'up', e)}
                          disabled={index === 0}
                          className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-raised rounded-md transition-all active:scale-[0.95] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Stop Up"
                          aria-label="Move stop up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleReorderStop(index, 'down', e)}
                          disabled={index === trip.stops.length - 1}
                          className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-raised rounded-md transition-all active:scale-[0.95] disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Stop Down"
                          aria-label="Move stop down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border-light my-auto mx-0.5" />
                        <button
                          onClick={() => setStopToDelete(stop.id)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-all active:scale-[0.95]"
                          title="Delete Stop"
                          aria-label="Delete stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <span className="text-xs font-semibold text-text-muted bg-surface-raised px-2.5 py-1 rounded-full border border-border-light">
                      {stop.scheduledActivities?.length || 0} activities
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(stop.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors active:scale-[0.97]"
                      aria-label={isExpanded ? 'Collapse stop' : 'Expand stop'}
                    >
                      <ChevronRight
                        className={`w-5 h-5 transition-transform duration-250 ${
                          isExpanded ? 'rotate-90 text-accent' : 'text-text-muted'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border-light p-5 sm:p-6 bg-surface-raised/30">
                    {/* Add Activity Frosted Glass Form Panel */}
                    {activeActivityStopId === stop.id && isOwner && (
                      <form
                        onSubmit={(e) => handleAddActivitySubmit(e, stop.id)}
                        className="gt-glass p-5 rounded-card border border-accent/30 space-y-4 mb-6 shadow-glass animate-fadeIn"
                      >
                        <div className="flex items-center justify-between border-b border-border-light pb-2.5">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                              Schedule Activity in {stop.city?.name}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveActivityStopId(null)}
                            className="text-text-muted hover:text-text-main p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                              Select Activity
                            </label>
                            <select
                              required
                              value={selectedActivity?.id || ''}
                              onChange={(e) => {
                                const act = activitySearchResults.find((a) => a.id === e.target.value);
                                setSelectedActivity(act || null);
                              }}
                              className="block w-full px-3 py-2 border border-border-light rounded-btn text-xs sm:text-sm bg-white text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                            >
                              <option value="">-- Choose an Activity --</option>
                              {activitySearchResults.map((act) => (
                                <option key={act.id} value={act.id}>
                                  {act.name} (₹{act.cost})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                              Date
                            </label>
                            <input
                              type="date"
                              required
                              min={stop.arrivalDate}
                              max={stop.departureDate}
                              value={activityDate}
                              onChange={(e) => setActivityDate(e.target.value)}
                              className="block w-full px-3 py-2 border border-border-light rounded-btn text-xs sm:text-sm bg-white text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                              Time (HH:mm)
                            </label>
                            <input
                              type="time"
                              required
                              value={activityTime}
                              onChange={(e) => setActivityTime(e.target.value)}
                              className="block w-full px-3 py-2 border border-border-light rounded-btn text-xs sm:text-sm bg-white text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border-light/60">
                          <div className="w-full sm:w-56">
                            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1">
                              Cost Override (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={`Default ₹${selectedActivity?.cost || 0}`}
                              value={costOverride}
                              onChange={(e) => setCostOverride(e.target.value)}
                              className="block w-full px-3 py-1.5 border border-border-light rounded-btn text-xs bg-white text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                          </div>

                          <div className="flex space-x-2.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setActiveActivityStopId(null)}
                              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-main rounded-btn hover:bg-surface-raised transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isAddingActivity || !selectedActivity}
                              className="px-5 py-2 text-xs font-bold bg-accent hover:bg-accent-hover text-white rounded-btn shadow-btn-accent active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                              {isAddingActivity ? 'Adding...' : 'Save Activity'}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Day groups */}
                    {dayGroups.length === 0 ? (
                      <p className="text-xs text-text-muted italic py-3 text-center">
                        No scheduled activities for this stop yet. Click "+ Add Activity" below to schedule.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {dayGroups.map((day) => (
                          <div key={day.date} className="bg-surface-card rounded-xl p-4 border border-border-light">
                            <div className="text-[11px] font-bold text-accent uppercase tracking-wider pb-2 mb-2 border-b border-border-light/60 flex items-center justify-between">
                              <span>{formatDate(day.date)}</span>
                              <span className="text-text-muted font-normal lowercase">{day.activities.length} planned</span>
                            </div>
                            <div className="divide-y divide-border-light/40">
                              {day.activities.map((act) => (
                                <div
                                  key={act.id}
                                  className="flex items-center justify-between py-2.5 group/act transition-colors hover:bg-surface-raised/40 px-2 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center space-x-1 text-xs font-bold text-text-main w-16 flex-shrink-0">
                                      <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                      <span>{act.scheduledTime || '—'}</span>
                                    </span>
                                    <span className="text-text-main text-xs sm:text-sm font-medium">
                                      {act.activity?.name || act.name}
                                    </span>
                                    <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">
                                      {act.category || 'Sightseeing'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-emerald-700">
                                      ₹{act.costOverride ?? act.activity?.cost ?? act.cost ?? 0}
                                    </span>
                                    {isOwner && (
                                      <button
                                        onClick={() => handleDeleteActivity(stop.id, act.id)}
                                        className="opacity-0 group-hover/act:opacity-100 text-danger hover:bg-danger/10 transition-all p-1 rounded font-bold text-sm"
                                        title="Delete Activity"
                                        aria-label="Delete Activity"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Activity CTA Button */}
                    {isOwner && (
                      <button
                        onClick={() => {
                          setActiveActivityStopId(stop.id);
                          setSelectedActivity(null);
                          setActivityDate(stop.arrivalDate || '');
                          setActivitySearchResults(MOCK_ACTIVITIES);
                        }}
                        className="mt-4 w-full py-3 rounded-btn border-2 border-dashed border-accent/40 text-accent font-bold text-xs sm:text-sm hover:border-accent hover:bg-accent-light/40 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Activity to {stop.city?.name}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toggle Public Switch */}
      {isOwner && (
        <div className="gt-card p-5 sm:p-6 flex items-center justify-between gap-4 mt-6">
          <div>
            <p className="font-bold text-text-main text-sm sm:text-base">Make Trip Public</p>
            <p className="text-text-muted text-xs sm:text-sm mt-0.5">
              Generate a shareable link that anyone can view and copy
            </p>
          </div>
          <button
            type="button"
            disabled={isTogglingPublic}
            onClick={handleTogglePublic}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              trip.isPublic ? 'bg-accent shadow-btn-accent' : 'bg-border-strong'
            }`}
            aria-label="Toggle Public Status"
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                trip.isPublic ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Stop Delete Modal */}
      <ConfirmDialog
        open={Boolean(stopToDelete)}
        title="Remove this stop?"
        message="All scheduled activities for this destination will be removed from your itinerary."
        confirmLabel="Remove stop"
        onCancel={() => setStopToDelete(null)}
        onConfirm={handleDeleteStop}
      />
    </div>
  );
};

export default ItineraryBuilder;
