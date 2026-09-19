import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Check, RotateCcw } from 'lucide-react';
import { validatePersianDate, getTodayPersianDate } from '../utils/dateValidator';

interface PersianDateInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  showTodayBtn?: boolean;
}

export const PersianDateInput: React.FC<PersianDateInputProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = '۱۴۰۴/۱۲/۲۵',
  className = '',
  showTodayBtn = true,
}) => {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate on value change if touched or has value
  useEffect(() => {
    if (!value && !required) {
      setError(null);
      return;
    }
    if (value) {
      const result = validatePersianDate(value);
      if (!result.valid) {
        setError(result.error || 'تاریخ نامعتبر است.');
      } else {
        setError(null);
      }
    } else if (required && touched) {
      setError('وارد کردن تاریخ الزامی است.');
    }
  }, [value, required, touched]);

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const result = validatePersianDate(value);
      if (result.valid && result.normalized) {
        onChange(result.normalized);
        setError(null);
      } else {
        setError(result.error || 'تاریخ نامعتبر است.');
      }
    } else if (required) {
      setError('وارد کردن تاریخ الزامی است.');
    }
  };

  const handleSetToday = () => {
    const today = getTodayPersianDate();
    onChange(today);
    setError(null);
    setTouched(true);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {showTodayBtn && (
          <button
            type="button"
            onClick={handleSetToday}
            className="text-[11px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
            title="تنظیم به تاریخ امروز"
          >
            <RotateCcw className="w-3 h-3" />
            <span>امروز</span>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) {
              const res = validatePersianDate(e.target.value);
              if (res.valid) setError(null);
            }
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          dir="ltr"
          className={`w-full bg-slate-950 border rounded-xl pr-9 pl-3 py-2 text-xs font-mono text-center transition-all ${
            error
              ? 'border-rose-500 text-rose-200 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-700 text-slate-100 focus:border-red-500 focus:ring-1 focus:ring-red-500'
          }`}
        />
        {value && !error && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-1 text-[11px] text-rose-400 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
