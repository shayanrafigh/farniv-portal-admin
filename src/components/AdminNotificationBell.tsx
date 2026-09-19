import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, MessageSquare, ChevronLeft, CheckCircle2, User } from 'lucide-react';
import { AdminNotification } from '../types';

interface AdminNotificationBellProps {
  notifications: AdminNotification[];
  unreadCount: number;
  onOpenProjectChat: (projectId: string) => void;
  onMarkAllAsRead: () => void;
}

export const AdminNotificationBell: React.FC<AdminNotificationBellProps> = ({
  notifications,
  unreadCount,
  onOpenProjectChat,
  onMarkAllAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (projectId: string) => {
    setIsOpen(false);
    onOpenProjectChat(projectId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="admin-notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="اعلان‌های پیام‌های جدید"
        className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          unreadCount > 0
            ? 'bg-red-950/70 border-red-700/80 text-red-300 hover:bg-red-900/80 hover:text-white shadow-md shadow-red-950/50'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title={unreadCount > 0 ? `${unreadCount} پیام جدید از خریداران` : 'اعلان‌های سیستم'}
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-wiggle text-red-400' : ''}`} />

        {/* Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -left-1.5 bg-red-600 text-white font-black text-[10px] min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950 font-mono animate-pulse">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-slate-100">پیام‌های جدید خریداران</span>
              {unreadCount > 0 && (
                <span className="bg-red-950 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800/80 font-mono">
                  {unreadCount} مورد
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={() => {
                  onMarkAllAsRead();
                }}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="علامت‌گذاری همه به عنوان خوانده‌شده"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>خوانده شدن همه</span>
              </button>
            )}
          </div>

          {/* List of unread messages */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/70">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500/80 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-300">همه پیام‌ها خوانده شده‌اند</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  پیام جدیدی از طرف خریداران گاوصندوق ثبت نشده است.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.projectId)}
                  className="p-3.5 hover:bg-slate-800/70 transition-colors cursor-pointer group flex items-start justify-between gap-3 text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition-colors truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {item.customerName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {item.createdAt}
                      </span>
                    </div>

                    <div className="inline-block bg-slate-950 px-2 py-0.5 rounded text-[10px] font-semibold text-red-400 border border-slate-800 mb-1.5 truncate max-w-full">
                      {item.projectTitle}
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                      {item.content}
                    </p>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0 mt-2" />
                </div>
              ))
            )}
          </div>

          {/* Footer of Dropdown */}
          {notifications.length > 0 && (
            <div className="p-2 bg-slate-950 border-t border-slate-800 text-center">
              <span className="text-[10px] text-slate-500">
                با کلیک روی هر پیام، پنجره پروژه باز شده و می‌توانید مستقیماً پاسخ دهید.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
