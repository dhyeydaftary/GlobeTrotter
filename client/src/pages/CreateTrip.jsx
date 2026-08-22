import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Image, Sparkles } from 'lucide-react';
import { post } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';
import { TRIP_CARD_FALLBACK, HERO_PARIS, HERO_BALI, HERO_TOKYO, DASH_SANTORINI } from '../constants/images';

const PRESET_COVERS = [
  { label: 'Santorini', url: DASH_SANTORINI },
  { label: 'Paris', url: HERO_PARIS },
  { label: 'Bali', url: HERO_BALI },
  { label: 'Tokyo', url: HERO_TOKYO },
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillCityName = location.state?.cityName || '';

  const [name, setName] = useState(prefillCityName ? `Trip to ${prefillCityName}` : '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState(
    prefillCityName ? `Exploring ${prefillCityName}.` : ''
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end && new Date(end) < new Date(start)) {
      setDateError('End date must be after start date');
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
      setDateError('End date must be after start date');
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      description: description.trim() || null,
      coverPhotoUrl: coverPhotoUrl.trim() || null,
    };

    try {
      const newTrip = await post('/trips', payload);
      navigate(`/trips/${newTrip.id}`);
    } catch (err) {
      setError({ message: err.message || 'Failed to create trip.', code: err.code });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <Link
            to="/trips"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Trips</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Journey</span>
          </div>
          <h1 className="text-display-md text-2xl sm:text-3xl font-extrabold text-text-main">
            Plan a New Trip
          </h1>
          <p className="text-text-muted text-sm">
            Set your dates, give it a name, and start assembling your multi-city adventure.
          </p>
        </div>

        {prefillCityName && (
          <div className="bg-accent-light/70 border border-accent/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-accent-dark font-medium">
            Pre-filled from your <span className="font-bold">{prefillCityName}</span> recommendation — add it as a stop once the trip is created.
          </div>
        )}

        <ErrorBanner message={error?.message} code={error?.code} onClose={() => setError(null)} />

        {/* Main Form Card */}
        <div className="gt-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Trip Name */}
            <div>
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2">
                Trip Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Euro Expedition 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main placeholder:text-text-light text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2">
                  Start Date <span className="text-accent">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => handleDateChange(e.target.value, endDate)}
                  className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2">
                  End Date <span className="text-accent">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => handleDateChange(startDate, e.target.value)}
                  className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
                />
                {dateError && (
                  <p className="text-danger text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <span>⚠</span> {dateError}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-2">
                Description <span className="text-text-light font-normal normal-case">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="What is the goal of this journey? High-level overview or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main placeholder:text-text-light text-sm resize-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
              />
            </div>

            {/* Cover Photo with Live Preview & Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-text-main uppercase tracking-wider">
                Cover Photo <span className="text-text-light font-normal normal-case">(optional)</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-surface-raised border border-border-light flex-shrink-0 flex items-center justify-center">
                  {coverPhotoUrl ? (
                    <img
                      src={coverPhotoUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = TRIP_CARD_FALLBACK;
                      }}
                    />
                  ) : (
                    <div className="text-center p-3 text-text-light space-y-1">
                      <Image className="w-6 h-6 mx-auto text-text-light/60" />
                      <span className="text-[11px] block">No image selected</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={coverPhotoUrl}
                    onChange={(e) => setCoverPhotoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-btn border border-border-light bg-surface text-text-main placeholder:text-text-light text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150"
                  />
                  
                  {/* Preset photo pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-text-muted font-medium mr-1">Presets:</span>
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setCoverPhotoUrl(preset.url)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                          coverPhotoUrl === preset.url
                            ? 'bg-accent text-white border-accent'
                            : 'bg-surface border-border-light text-text-muted hover:border-accent/40 hover:text-text-main'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-border-light">
              <button
                type="submit"
                disabled={saving || Boolean(dateError)}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-btn shadow-btn-accent active:scale-[0.97] transition-all duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating trip...' : 'Create Trip →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
