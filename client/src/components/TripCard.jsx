import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Trash2, Edit3, Eye } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { TRIP_CARD_FALLBACK } from '../constants/images';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TripCard({ trip, onDelete, isOwner = true }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(trip.id);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const stopCount = trip.stopCount ?? trip.stops?.length ?? 0;

  return (
    <>
      <div
        className="gt-card overflow-hidden cursor-pointer group flex flex-col justify-between"
        onClick={() => navigate(`/trips/${trip.id}/view`)}
      >
        <div>
          {/* Cover Photo */}
          <div className="relative h-48 overflow-hidden bg-surface-raised">
            <img
              src={trip.coverPhotoUrl || TRIP_CARD_FALLBACK}
              alt={trip.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.src = TRIP_CARD_FALLBACK;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {trip.isPublic && (
              <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
                Public
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-5">
            <h3 className="text-display-md font-bold text-text-main text-lg leading-snug mb-1 line-clamp-1 group-hover:text-accent transition-colors">
              {trip.name}
            </h3>
            <p className="text-text-muted text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
              {trip.description || 'No description provided.'}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-text-muted text-xs sm:text-sm">
                <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                <span>
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span>
                  {stopCount} {stopCount === 1 ? 'Stop' : 'Stops'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-border-light pt-3.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => navigate(`/trips/${trip.id}/view`)}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-main px-3 py-1.5 rounded-btn border border-border-light hover:border-accent hover:text-accent hover:bg-accent-light/50 active:scale-[0.97] transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-muted px-3 py-1.5 rounded-btn border border-border-light hover:border-border-strong hover:text-text-main active:scale-[0.97] transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                  className="ml-auto flex items-center gap-1 text-xs font-semibold text-danger px-2.5 py-1.5 rounded-btn border border-transparent hover:border-danger/20 hover:bg-danger/10 active:scale-[0.97] transition-all disabled:opacity-50"
                  title="Delete Trip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this trip?"
        message={`“${trip.name}” and its entire itinerary will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete trip"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
