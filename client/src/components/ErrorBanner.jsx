import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

const ErrorBanner = ({ message, code, onRetry, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-rose-50 border-l-4 border-accent text-rose-900 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4 transition-all animate-fade-in">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-rose-950">Unable to load data</h4>
            {code && (
              <span className="text-[10px] font-mono uppercase bg-rose-200/60 text-rose-800 px-1.5 py-0.5 rounded font-semibold">
                {code}
              </span>
            )}
          </div>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
