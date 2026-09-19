import React, { useState } from 'react';
import { User, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { AuthSession } from '../types';
import { FarnivLogo } from './FarnivLogo';

interface LoginModalProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError('لطفاً شناسه کاربری و کلمه عبور را وارد نمایید.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanId, password: cleanPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'شناسه کاربری یا کلمه عبور وارد شده صحیح نمی‌باشد.');
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
      setError(err.message || 'خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setLoading(false);
    }
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
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="نام کاربری یا شماره موبایل"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-600 font-mono transition-colors text-left"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-500 pr-3.5">
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
                type={showPassword ? 'text' : 'password'}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-600 font-mono transition-colors text-left"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-500 pr-3.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title={showPassword ? 'مخفی‌سازی رمز' : 'نمایش رمز عبور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
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
