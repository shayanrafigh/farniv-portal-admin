import React from 'react';
import { Lock, User, LogOut, Wrench, Users, Settings } from 'lucide-react';
import { AuthSession, AdminNotification } from '../types';
import { FarnivLogo } from './FarnivLogo';
import { AdminNotificationBell } from './AdminNotificationBell';

interface NavbarProps {
  session: AuthSession;
  activeTab: 'projects' | 'customers' | 'settings' | 'messages';
  setActiveTab: (tab: 'projects' | 'customers' | 'settings' | 'messages') => void;
  onLogout: () => void;
  unreadCount?: number;
  notifications?: AdminNotification[];
  onOpenProjectChat?: (projectId: string) => void;
  onMarkAllAsRead?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activeTab,
  setActiveTab,
  onLogout,
  unreadCount = 0,
  notifications = [],
  onOpenProjectChat = () => {},
  onMarkAllAsRead = () => {},
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand - Farniv Industrial Group */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 shadow-md shadow-red-950/30 shrink-0 flex items-center justify-center">
              <FarnivLogo variant="light" className="h-6 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                  گروه صنعتی فرنیو
                </span>
                <span className="text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full font-mono hidden sm:inline-block">
                  farniv.com
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-normal mt-0.5">
                سامانه رهگیری خط تولید گاوصندوق‌های آسانسوری و نسوز
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Controlled by Permissions / Role) */}
          {(session.role === 'admin' || session.permissions?.canManageProjects) && (
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                id="nav-projects-btn"
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>پروژه‌ها و خط تولید</span>
                {session.role === 'admin' && unreadCount > 0 && (
                  <span className="bg-red-950 text-red-300 border border-red-700/80 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              {(session.role === 'admin' || session.permissions?.canManageCustomers) && (
                <button
                  id="nav-customers-btn"
                  onClick={() => setActiveTab('customers')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'customers'
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>مدیریت خریداران</span>
                </button>
              )}

              {(session.role === 'admin' || session.permissions?.canManageSettings) && (
                <button
                  id="nav-settings-btn"
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>تنظیمات مدیر و خروجی دیتابیس</span>
                </button>
              )}
            </nav>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {session.role === 'admin' && (
              <AdminNotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onOpenProjectChat={onOpenProjectChat}
                onMarkAllAsRead={onMarkAllAsRead}
              />
            )}

            <div className="hidden sm:flex flex-col text-left text-xs">
              <span className="text-slate-200 font-semibold">{session.name}</span>
              <span className="text-slate-400 font-mono text-[11px] flex items-center justify-end gap-1">
                {session.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <Lock className="w-3 h-3 text-red-400" />
                    مدیریت فرنیو (@{session.username})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <User className="w-3 h-3 text-emerald-400" />
                    پنل مشتری (@{session.username})
                  </span>
                )}
              </span>
            </div>

            <button
              id="logout-btn"
              onClick={onLogout}
              title="خروج از سیستم"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-200 border border-slate-700 hover:border-red-700/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {(session.role === 'admin' || session.permissions?.canManageProjects) && (
          <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                activeTab === 'projects' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>پروژه‌ها</span>
            </button>
            {(session.role === 'admin' || session.permissions?.canManageCustomers) && (
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                  activeTab === 'customers' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>خریداران</span>
              </button>
            )}
            {(session.role === 'admin' || session.permissions?.canManageSettings) && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                  activeTab === 'settings' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>تنظیمات</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

