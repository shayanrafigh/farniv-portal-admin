import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Server,
  Database,
  FileCode,
  Download,
  Copy,
  Check,
  CheckCircle2,
  HardDrive,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AuthSession } from '../types';

interface AdminSettingsProps {
  session: AuthSession;
  onUpdateSession: (newUsername: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ session, onUpdateSession }) => {
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(session.username || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [changingPass, setChangingPass] = useState(false);

  // PHP Deployment viewer state
  const [activeCodeTab, setActiveCodeTab] = useState<'sql' | 'config' | 'api' | 'guide'>('guide');
  const [pkgData, setPkgData] = useState<{ sql: string; configPhp: string; apiPhp: string; instructions: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch('/api/php-deployment-package')
      .then((res) => res.json())
      .then((data) => setPkgData(data))
      .catch((err) => console.error('Failed to load deployment package:', err));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('تکرار کلمه عبور جدید مطابقت ندارد.');
      return;
    }

    setChangingPass(true);
    try {
      const response = await fetch('/api/auth/change-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'خطا در تغییر مشخصات');
      }

      setPassSuccess(data.message || 'مشخصات ورود ادمین با موفقیت تغییر یافت.');
      onUpdateSession(newUsername);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setChangingPass(false);
    }
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadZipFiles = () => {
    if (!pkgData) return;

    // Trigger individual file downloads or package blob
    const element = document.createElement('a');
    const file = new Blob([pkgData.sql], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'safebox_db_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('فایل دیتابیس MySQL دانلود شد. می‌توانید سایر اسکریپت‌های PHP را از تب‌های زیر نیز کپی یا دریافت کنید.');
  };

  return (
    <div className="space-y-8">
      {/* 1. Admin Credentials Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
          <div className="p-2.5 rounded-xl bg-red-950/60 text-red-400 border border-red-800/60">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              تغییر مشخصات ورود مدیر فرنیو (Admin Credentials)
            </h2>
            <p className="text-xs text-slate-400">
              در حالت پیش‌فرض نام کاربری و رمز عبور مدیر <span className="font-mono text-red-400">admin / admin</span> است که می‌توانید در این فرم تغییر دهید.
            </p>
          </div>
        </div>

        {passError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              رمز عبور فعلی ادمین <span className="text-rose-400">*</span>
            </label>
            <input
              id="current-admin-pass"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="کلمه عبور فعلی"
              dir="ltr"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-left focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                نام کاربری جدید ادمین <span className="text-rose-400">*</span>
              </label>
              <input
                id="new-admin-user"
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-left focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رمز عبور جدید <span className="text-rose-400">*</span>
              </label>
              <input
                id="new-admin-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="حداقل ۴ کاراکتر"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-left focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              تکرار رمز عبور جدید <span className="text-rose-400">*</span>
            </label>
            <input
              id="confirm-admin-pass"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-left focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              id="change-admin-pass-btn"
              type="submit"
              disabled={changingPass}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-red-950/40 cursor-pointer disabled:opacity-50"
            >
              {changingPass ? 'در حال ثبت...' : 'ذخیره مشخصات جدید مدیر'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. PHP & MySQL Easy Deployment Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/60 text-red-400 border border-red-800/60">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  اسکریپت‌های دیتابیس MySQL و بک‌اند PHP
                </h2>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
                  سازگار با هر هاست PHP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                استفاده مستقیم از دیسک سیستم‌عامل لینوکس برای ذخیره تصاویر مراحل گاوصندوق بدون وابستگی به ابزارهای خارجی
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZipFiles}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-red-400" />
            <span>دانلود اسکریپت MySQL (.sql)</span>
          </button>
        </div>

        {/* Highlight Banner: Local OS Storage */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-slate-200">
              ذخیره‌سازی تصاویر در استوریج لینوکس (Linux Local Storage)
            </h4>
            <p className="text-slate-400 leading-relaxed">
              تمام تصاویر مراحل ساخت گاوصندوق‌ها مستقیماً داخل پوشه <code className="text-red-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">uploads/</code> روی همان سرور ذخیره می‌شوند.
            </p>
          </div>
        </div>

        {/* Code tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-4 gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveCodeTab('guide')}
            className={`px-3.5 py-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
              activeCodeTab === 'guide'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📘 راهنمای راه‌اندازی هاست
          </button>

          <button
            onClick={() => setActiveCodeTab('sql')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCodeTab === 'sql'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>دیتابیس (schema.sql)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('api')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCodeTab === 'api'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>بک‌اند PHP (api.php)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('config')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCodeTab === 'config'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>تنظیمات اتصال (config.php)</span>
          </button>
        </div>

        {/* Tab content viewer */}
        <div className="relative">
          {activeCodeTab === 'guide' ? (
            <div className="bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4">
              <h3 className="text-base font-bold text-red-400">
                مراحل راه‌اندازی روی هاست (cPanel / DirectAdmin / لینوکس):
              </h3>
              <ol className="list-decimal list-inside space-y-2.5 text-slate-300 pr-2">
                <li>
                  <strong className="text-slate-100">ایجاد دیتابیس MySQL:</strong> در پنل هاست وارد بخش MySQL Database شوید و یک دیتابیس جدید بسازید.
                </li>
                <li>
                  <strong className="text-slate-100">ایمپورت فایل schema.sql:</strong> وارد phpMyAdmin شده و فایل <code className="text-red-400 font-mono">schema.sql</code> را ایمپورت کنید. تمام جداول (ادمین، مشتریان، پروژه‌ها، مراحل با عکس، پیام‌ها) خودکار ایجاد می‌شوند.
                </li>
                <li>
                  <strong className="text-slate-100">تنظیم اطلاعات اتصال:</strong> فایل <code className="text-red-400 font-mono">config.php</code> را باز کرده و یوزر و پسورد دیتابیس هاست را وارد کنید.
                </li>
                <li>
                  <strong className="text-slate-100">ساخت پوشه عکس‌ها (uploads):</strong> یک پوشه با نام <code className="text-emerald-400 font-mono">uploads</code> در هاست بسازید تا تصاویر مراحل ساخت مستقیماً ذخیره شوند.
                </li>
              </ol>
            </div>
          ) : (
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">
                  {activeCodeTab === 'sql'
                    ? 'safebox_schema.sql'
                    : activeCodeTab === 'api'
                    ? 'api.php'
                    : 'config.php'}
                </span>

                <button
                  onClick={() => {
                    const txt =
                      activeCodeTab === 'sql'
                        ? pkgData?.sql
                        : activeCodeTab === 'api'
                        ? pkgData?.apiPhp
                        : pkgData?.configPhp;
                    if (txt) handleCopyCode(txt);
                  }}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-red-300 bg-slate-800 px-3 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی کد اسکریپت</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed text-left"
                dir="ltr"
              >
                {activeCodeTab === 'sql' && (pkgData?.sql || '-- در حال بارگذاری SQL...')}
                {activeCodeTab === 'api' && (pkgData?.apiPhp || '// در حال بارگذاری PHP API...')}
                {activeCodeTab === 'config' && (pkgData?.configPhp || '// در حال بارگذاری config.php...')}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
