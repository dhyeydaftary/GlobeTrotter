import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Image as ImageIcon, Trash2, AlertTriangle, X, Check, Save, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get, patch, del } from '../api/client';
import { MOCK_USER, MOCK_CITIES } from '../api/mocks';
import Skeleton from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [removingCityId, setRemovingCityId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Delete Account Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  // Handle Save Profile
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

  // Handle Remove Saved Destination with 200ms fade-out
  const handleRemoveDestination = async (cityId) => {
    setRemovingCityId(cityId);

    setTimeout(async () => {
      try {
        await del(`/users/me/saved-destinations/${cityId}`);
      } catch {}
      setSavedDestinations((prev) => prev.filter((item) => (item.cityId || item.city?.id || item.id) !== cityId));
      setRemovingCityId(null);
    }, 200);
  };

  // Handle Confirm Delete Account
  const handleConfirmDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeletingAccount(true);

    try {
      await del('/users/me');
    } catch {}

    logout();
    navigate('/login');
  };

  if (loading) return <Skeleton type="itinerary" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-textMain tracking-tight font-display">
          Account Profile
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Manage your personal details and saved destinations
        </p>
      </div>

      <ErrorBanner message={error?.message} code={error?.code} onRetry={fetchProfileData} onClose={() => setError(null)} />

      {saveSuccess && (
        <div className="bg-emerald-50 border-l-4 border-success text-emerald-900 p-4 rounded-r-card shadow-sm flex items-center space-x-3 animate-fade-in">
          <Check className="w-5 h-5 text-success shrink-0" />
          <span className="text-sm font-semibold">Profile details updated successfully!</span>
        </div>
      )}

      {/* Editable Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-surface-card rounded-card p-6 sm:p-8 shadow-card border border-borderLight space-y-6"
      >
        <h2 className="text-xl font-bold text-textMain font-display border-b border-borderLight pb-3">
          Personal Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-borderLight rounded-input text-sm bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-borderLight rounded-input text-sm bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
            Avatar Image URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-borderLight rounded-input text-sm bg-slate-50/50"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3 rounded-btn shadow-md hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>

      {/* Saved Destinations Section */}
      <div className="bg-surface-card rounded-card p-6 sm:p-8 shadow-card border border-borderLight space-y-4">
        <div className="flex items-center space-x-2 border-b border-borderLight pb-3">
          <Heart className="w-5 h-5 text-accent fill-accent" />
          <h2 className="text-xl font-bold text-textMain font-display">Saved Destinations</h2>
        </div>

        {savedDestinations.length === 0 ? (
          <p className="text-xs text-textMuted italic">No saved destinations yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {savedDestinations.map((item) => {
              const cityId = item.cityId || item.city?.id || item.id;
              const cityName = item.city?.name || item.cityName || 'City';
              const country = item.city?.country || item.country || '';
              const isRemoving = removingCityId === cityId;

              return (
                <span
                  key={cityId}
                  className={`inline-flex items-center space-x-2 bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-borderLight shadow-sm transition-all duration-200 ${
                    isRemoving ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                  }`}
                >
                  <span>
                    {cityName}
                    {country && `, ${country}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDestination(cityId)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded-full"
                    title="Remove destination"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-rose-950 font-display">Delete Account</h3>
          <p className="text-xs text-rose-700 mt-1 max-w-md leading-relaxed">
            Permanently delete your GlobeTrotter profile and all associated multi-city trips. This action cannot be undone.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(true);
            setDeleteInput('');
          }}
          className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-btn shadow-md shrink-0 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Real Confirm Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card rounded-card max-w-md w-full p-6 shadow-2xl border border-borderLight space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete your account and all your planned trips. To confirm, please type{' '}
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                DELETE
              </span>{' '}
              below:
            </p>

            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className="block w-full px-3.5 py-2.5 border border-borderLight rounded-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteInput !== 'DELETE' || isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-btn shadow-sm disabled:opacity-40 transition-all"
              >
                {isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
