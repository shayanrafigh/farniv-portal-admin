import React, { useState } from 'react';
import { User, KeyRound, AlertCircle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { AuthSession } from '../types';
import { FarnivLogo } from './FarnivLogo';

interface LoginModalProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError('لطفاً شناسه کاربری و کلمه عبور را وارد نمایید.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'اطلاعات ورود نامعتبر است');
      }

      onLoginSuccess({
        role: data.user.role,
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        token: 'session_' + Date.now(),
        permissions: data.user.permissions,
      });
    } catch (err: any) {
      setError(err.message || 'ارتباط با سرور برقرار نشد.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting in Farniv corporate colors */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 backdrop-blur-sm">
        {/* Header Branding - Farniv Official Logo */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3 p-3 bg-white rounded-2xl shadow-xl shadow-red-950/30 border border-slate-200">
            <FarnivLogo variant="light" className="h-11 sm:h-12" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              گروه صنعتی فرنیو
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            سامانه یکپارچه مدیریت خط تولید و رهگیری گاوصندوق‌های آسانسوری
          </p>
        </div>

        {/* Unified Permission-based Access Notice */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-slate-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-200">درگاه ورود یکپارچه: </span>
            <span>
              با ورود به سامانه، سطح دسترسی و امکانات متناسب با نقش شما (مدیریت کارخانه یا خریدار گاوصندوق) به صورت خودکار فعال می‌شود.
            </span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Single Unified Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              شناسه کاربری یا شماره همراه
            </label>
            <div className="relative">
              <input
                id="login-username-input"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="نام کاربری یا شماره موبایل ثبت‌شده"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-600 font-mono transition-colors text-left"
              />
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none text-slate-500 pr-3">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                کلمه عبور
              </label>
            </div>
            <div className="relative">
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-600 font-mono transition-colors text-left"
              />
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none text-slate-500 pr-3">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>ورود به سامانه</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Fast Test / Demo Accounts Helper */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              تست سریع سامانه (تک‌کلیک):
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin')}
              className="px-2.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-medium transition-colors text-right flex flex-col cursor-pointer"
            >
              <span className="text-red-400 font-bold">ورود به عنوان مدیر</span>
              <span className="text-[10px] text-slate-500 font-mono" dir="ltr">admin / admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('kamali', '1405kamali')}
              className="px-2.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-medium transition-colors text-right flex flex-col cursor-pointer"
            >
              <span className="text-emerald-400 font-bold">ورود به عنوان مشتری</span>
              <span className="text-[10px] text-slate-500 font-mono" dir="ltr">kamali / 1405kamali</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <a
            href="https://www.farniv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-red-400 transition-colors inline-flex items-center gap-1"
          >
            <span>وب‌سایت رسمی گروه صنعتی فرنیو:</span>
            <span className="font-mono text-slate-300 underline" dir="ltr">www.farniv.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};
