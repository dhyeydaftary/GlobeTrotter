import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Eye, Edit3, Trash2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TripCard = ({ trip, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && (!trip.userId || trip.userId === user.id);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const coverImage =
    trip.coverPhotoUrl ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800';

  const stopCount = trip.stopCount ?? trip.stops?.length ?? 0;

  return (
    <div className="bg-surface-card rounded-card shadow-card border border-borderLight overflow-hidden flex flex-col justify-between group card-hoverable">
      {/* 1. Image Header (200px height) */}
      <div className="h-[200px] w-full overflow-hidden relative bg-slate-100 shrink-0">
        <img
          src={coverImage}
          alt={trip.name}
          className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800';
          }}
        />
        {trip.isPublic && (
          <span className="absolute top-3 right-3 bg-success/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </span>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title */}
          <h3 className="font-semibold text-lg text-[#1A1A2E] font-display truncate">
            {trip.name}
          </h3>

          {/* Description (2-line clamp) */}
          <p className="text-xs text-[#6B7280] mt-1 line-clamp-2 leading-relaxed min-h-[2.25rem]">
            {trip.description || 'Multi-city travel itinerary with scheduled daily activities and budget tracking.'}
          </p>
        </div>

        {/* 3. Metadata Rows (Always Visible) */}
        <div className="space-y-3 pt-3 border-t border-borderLight">
          {/* Date row */}
          <div className="flex items-center space-x-2 text-xs text-[#6B7280]">
            <Calendar className="w-4 h-4 text-accent shrink-0" />
            <span className="font-medium truncate">
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>

          {/* Stop count row */}
          <div className="flex items-center space-x-2 text-xs text-[#6B7280]">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium">{stopCount} Stops</span>
          </div>

          {/* Action buttons row */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Link
                to={`/trips/${trip.id}/view`}
                className="inline-flex items-center space-x-1 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-btn transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>

              {isOwner && (
                <Link
                  to={`/trips/${trip.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-btn transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>
              )}
            </div>

            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(trip.id)}
                className="inline-flex items-center text-xs font-semibold text-rose-600 hover:bg-rose-50 p-1.5 rounded-btn transition-colors"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
