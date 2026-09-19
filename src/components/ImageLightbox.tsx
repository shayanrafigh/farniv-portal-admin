import React from 'react';
import { X, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { ProjectStage } from '../types';

interface ImageLightboxProps {
  stage: ProjectStage | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ stage, onClose }) => {
  if (!stage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
              {stage.order}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
              {stage.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Image Viewer */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[70vh] overflow-hidden">
          <img
            src={stage.imageUrl}
            alt={stage.title}
            className="max-h-[70vh] w-auto object-contain mx-auto transition-transform"
            onError={(e) => {
              // fallback image if local upload failed
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1000&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Stage details footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              <span>تاریخ ثبت مرحله: {stage.date}</span>
            </div>

            <div>
              {stage.completed ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  مرحله به اتمام رسیده
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  در حال کار و فرآوری
                </span>
              )}
            </div>
          </div>

          {stage.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {stage.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
