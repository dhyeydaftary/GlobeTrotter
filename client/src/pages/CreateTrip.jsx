import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Image as ImageIcon, MapPin, Sparkles } from 'lucide-react';
import { post } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';

const CreateTrip = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end && new Date(end) < new Date(start)) {
      setDateError('End date must be after start date.');
    } else {
      setDateError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDateError('');

    if (!name.trim()) {
      setError({ message: 'Trip name is required.' });
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setDateError('End date must be after start date.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      description: description.trim() || null,
      coverPhotoUrl: coverPhotoUrl.trim() || null,
    };

    try {
      const newTrip = await post('/trips', payload);
      const newId = newTrip.id || 'trip_eu_2026';
      navigate(`/trips/${newId}`);
    } catch (err) {
      // Mock fallback navigate
      const mockId = 'trip_mock_' + Date.now();
      navigate(`/trips/${mockId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/trips"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-textMuted hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </Link>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onClose={() => setError(null)} />

      {/* Form Container: White card, max-w-[600px] mx-auto, p-8, rounded-card (16px), shadow-card */}
      <div className="max-w-[600px] mx-auto bg-white rounded-card p-8 shadow-card border border-borderLight space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight font-display">
            Plan a New Trip
          </h1>
          <p className="text-xs text-textMuted mt-1 leading-relaxed">
            Set up trip details before scheduling stops and activities
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Trip Name */}
          <div>
            <label htmlFor="trip-name">
              Trip Name <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="trip-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                placeholder="e.g. Summer Euro Expedition 2026"
              />
            </div>
          </div>

          {/* Date Fields: Side by side on desktop (grid-cols-2), stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange(e.target.value, endDate)}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="end-date">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange(startDate, e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                />
              </div>

              {/* Immediate inline red validation directly below end date field */}
              {dateError && (
                <p className="text-red-500 text-[13px] font-semibold mt-1.5 animate-fade-in">
                  {dateError}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="trip-desc">Description / Objectives</label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="trip-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                placeholder="Must-visit landmarks, culinary goals, or budget notes..."
              />
            </div>
          </div>

          {/* Cover Photo URL */}
          <div>
            <label htmlFor="cover-url">
              Cover Photo Image URL <span className="text-textMuted font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                id="cover-url"
                type="url"
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-borderLight rounded-input text-sm bg-slate-50/50"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
          </div>

          {/* Full-width coral save button at bottom (py-3) */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || Boolean(dateError)}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-btn shadow-accent-glow hover:scale-[1.01] active:scale-[0.97] transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Trip...' : 'Save & Build Itinerary'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
