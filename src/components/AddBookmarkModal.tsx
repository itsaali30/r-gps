import React, { useState, useEffect } from 'react';
import { X, BookmarkPlus, MapPin } from 'lucide-react';
import { GeoCoordinates } from '../types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  coords: GeoCoordinates;
  onSave: (name: string, lat: number, lng: number, alt?: number) => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  coords,
  onSave,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(`Point (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
    }
  }, [isOpen, coords.lat, coords.lng]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), coords.lat, coords.lng, coords.alt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">Save Bookmark</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Location Name / Label
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Favorite Gym, Secret Spot"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              autoFocus
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)} • Alt: {coords.alt}m
            </span>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition shadow"
            >
              Save to Favorites
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
