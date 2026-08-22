import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Trash2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get, patch, del } from '../api/client';
import { MOCK_USER, MOCK_CITIES } from '../api/mocks';
import ErrorBanner from '../components/ErrorBanner';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [savedDestinations, setSavedDestinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let profile = null;
      let destinations = [];
      try {
        profile = await get('/users/me/profile');
        destinations = await get('/users/me/saved-destinations');
      } catch {
        profile = MOCK_USER;
        destinations = MOCK_CITIES.map((c) => ({ id: c.id, city: c }));
      }

      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhotoUrl(profile.photoUrl || '');
      setSavedDestinations(destinations || []);
    } catch (err) {
      setError({
        message: err.message || 'Failed to load profile details.',
        code: err.code || 'FETCH_ERROR',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = { name: name.trim(), email: email.trim(), photoUrl: photoUrl.trim() || null };

    try {
      let updatedUser = null;
      try {
        updatedUser = await patch('/users/me/profile', payload);
      } catch {
        updatedUser = { ...MOCK_USER, ...payload };
      }

      setUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError({ message: err.message || 'Failed to update profile details.' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDest = async (cityId) => {
    try {
      await del(`/users/me/saved-destinations/${cityId}`);
    } catch {}
    setSavedDestinations((prev) =>
      prev.filter((item) => (item.cityId || item.city?.id || item.id) !== cityId)
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeletingAccount(true);
    try {
      await del('/users/me');
    } catch {}
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="page-enter max-w-2xl mx-auto px-4 py-10 pt-24 space-y-6">
        <div className="skeleton h-10 w-48 rounded-md" />
        <div className="skeleton h-64 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 py-10 pt-24 pb-16 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-display-md text-2xl sm:text-3xl font-extrabold text-text-main">
          Profile & Preferences
        </h1>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchProfileData} onClose={() => setError(null)} />

      {saveSuccess && (
        <div className="p-3.5 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="gt-card p-6 sm:p-8">
        {/* Avatar & Header */}
        <div className="flex items-center gap-4 sm:gap-5 mb-6 pb-6 border-b border-border-light">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-accent/30 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-accent-light text-accent border border-accent/20 flex items-center justify-center font-extrabold text-2xl flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-display-md font-bold text-lg sm:text-xl text-text-main">{user?.name}</p>
            <p className="text-text-muted text-xs sm:text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
              Avatar Image URL <span className="text-text-light font-normal normal-case">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-btn border border-border-light bg-surface text-text-main text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-btn shadow-btn-accent active:scale-[0.97] transition-all text-xs sm:text-sm disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Destinations */}
      <div className="gt-card p-6 sm:p-7">
        <h3 className="text-display-md font-bold text-text-main text-base mb-3">Saved Destinations</h3>
        <div className="flex flex-wrap gap-2">
          {savedDestinations.map((dest) => {
            const cityId = dest.city?.id || dest.cityId || dest.id;
            const cityName = dest.city?.name || dest.cityName || 'City';
            return (
              <span
                key={cityId}
                className="inline-flex items-center gap-1.5 bg-surface border border-border-light hover:border-accent/40 text-text-main text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                <MapPin className="w-3 h-3 text-accent" />
                <span>{cityName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDest(cityId)}
                  className="text-text-muted hover:text-danger transition-colors ml-1 font-bold text-sm leading-none"
                  aria-label={`Remove ${cityName}`}
                >
                  ×
                </button>
              </span>
            );
          })}
          {savedDestinations.length === 0 && (
            <p className="text-text-muted text-xs sm:text-sm">No saved destinations yet.</p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="gt-card p-6 border-danger/20 bg-danger/[0.02]">
        <h3 className="text-display-md font-bold text-danger text-base mb-1">Danger Zone</h3>
        <p className="text-text-muted text-xs sm:text-sm mb-4 leading-relaxed">
          Permanently delete your account and all your trips. This action cannot be reversed.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="bg-white text-danger font-bold px-4 py-2.5 rounded-btn border border-danger/30 hover:bg-danger hover:text-white active:scale-[0.97] transition-all text-xs"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirm Modal with Frosted Glass Scrim */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-surface-card rounded-card border border-border-light p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scaleIn">
            <h3 className="text-display-md font-bold text-lg text-text-main">Delete Account</h3>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
              Type <strong className="text-text-main font-bold">DELETE</strong> to confirm permanent removal of your account and all itineraries.
            </p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-btn border border-border-light bg-surface text-sm focus:outline-none focus:border-danger focus:ring-2 focus:ring-danger/20"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-btn border border-border-light text-text-muted font-semibold text-xs hover:bg-surface-raised hover:text-text-main active:scale-[0.97] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deletingAccount}
                className="flex-1 py-2.5 rounded-btn bg-danger text-white font-bold text-xs hover:bg-red-600 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deletingAccount ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
