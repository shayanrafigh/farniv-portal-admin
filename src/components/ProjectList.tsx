import React, { useState } from 'react';
import {
  Wrench,
  Shield,
  Layers,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Sparkles,
  AlertCircle,
  Lock,
  Bell,
} from 'lucide-react';
import { Project, AuthSession } from '../types';

interface ProjectListProps {
  projects: Project[];
  session: AuthSession;
  onOpenProject: (projectId: string, initialTab?: 'stages' | 'chat') => void;
  onOpenNewProject: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  session,
  onOpenProject,
  onOpenNewProject,
  onDeleteProject,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'unread'>('all');

  const totalUnreadProjects = projects.filter((p) => (p.unreadMessagesCount || 0) > 0).length;

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.customerName && p.customerName.toLowerCase().includes(search.toLowerCase())) ||
      p.safeType.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'unread') {
      matchesStatus = (p.unreadMessagesCount || 0) > 0;
    } else {
      matchesStatus = p.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
  const totalStages = projects.reduce((acc, p) => acc + (p.stagesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      {session.role === 'customer' ? (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-800/70">
                <Sparkles className="w-3.5 h-3.5" />
                <span>سامانه پیگیری مشتریان فرنیو (farniv.com)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                سلام {session.name} گرامی، وضعیت ساخت گاوصندوق شما
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                در این بخش می‌توانید کلیه مراحل ساخت، تصاویر اختصاصی کارگاه (برش لیزری، مونتاژ مکانیزم بال اسکرو، جوشکاری دوجداره، تزریق بتن ضد حریق و نصب قفل) را ملاحظه فرمایید و با مهندسین خط تولید مستقیماً در ارتباط باشید.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
              <span className="text-[11px] text-slate-400 block mb-0.5">سفارشات فعال شما</span>
              <span className="text-2xl font-extrabold text-red-500 font-mono">
                {projects.length}
              </span>
              <span className="text-[10px] text-slate-500 block">گاوصندوق در خط تولید</span>
            </div>
          </div>
        </div>
      ) : (
        /* Admin Stats Banner */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">کل پروژه‌های فرنیو</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {projects.length}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">در حال تولید و مونتاژ</span>
              <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
                {activeProjectsCount}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">تکمیل شده و تحویلی</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {completedProjectsCount}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">مراحل و عکس‌های ثبت شده</span>
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
                {totalStages}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در مدل گاوصندوق یا نام خریدار..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl pr-9 pl-3.5 py-2 text-xs focus:border-red-500 focus:outline-none placeholder-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({projects.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'in_progress'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              در حال ساخت
            </button>
            {session.role === 'admin' && totalUnreadProjects > 0 && (
              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'unread'
                    ? 'bg-red-600 text-white font-bold shadow-sm shadow-red-950/40'
                    : 'text-red-400 hover:text-red-300 hover:bg-red-950/40'
                }`}
              >
                <Bell className="w-3.5 h-3.5 animate-pulse" />
                <span>پیام‌های جدید ({totalUnreadProjects})</span>
              </button>
            )}
          </div>
        </div>

        {(session.role === 'admin' || session.permissions?.canCreateProject) && (
          <button
            id="open-new-project-btn"
            onClick={onOpenNewProject}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف پروژه گاوصندوق جدید</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <Shield className="w-12 h-12 stroke-[1.2] text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">هیچ پروژه‌ای یافت نشد</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {session.role === 'admin'
              ? 'روی دکمه "تعریف پروژه گاوصندوق جدید" کلیک کنید تا سفارش ساخت به خریدار متصل شود.'
              : 'در حال حاضر سفارش فعالی برای حساب شما ثبت نشده است.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((project) => {
            const stagesCount = project.stagesCount || 0;
            const completedStages = (project as any).completedStagesCount || 0;
            const progress = stagesCount > 0 ? Math.round((completedStages / stagesCount) * 100) : 0;

            return (
              <div
                key={project.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all shadow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Card top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-950/70 text-red-400 border border-red-800/70">
                        {project.safeType}
                      </span>

                      {session.role === 'admin' && (project.unreadMessagesCount || 0) > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject(project.id, 'chat');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/50 animate-pulse border border-red-400 transition-all cursor-pointer"
                          title="مشاهده پیام‌های جدید خریدار"
                        >
                          <Bell className="w-3 h-3" />
                          <span>{project.unreadMessagesCount} پیام جدید</span>
                        </button>
                      )}
                    </div>

                    <span className="text-xs text-slate-400 font-mono" dir="ltr">
                      تحویل: {project.estimatedDelivery}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onOpenProject(project.id)}
                    className="text-base sm:text-lg font-bold text-slate-100 hover:text-red-400 transition-colors cursor-pointer leading-snug mb-3"
                  >
                    {project.title}
                  </h3>

                  {/* Customer Info (For Admin) */}
                  {session.role === 'admin' && (
                    <div className="mb-3 text-xs text-slate-400 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500">خریدار:</span>
                      <span className="font-semibold text-slate-200">{project.customerName}</span>
                      {(project as any).customerPhone && (
                        <span className="font-mono text-slate-400 mr-auto" dir="ltr">
                          {(project as any).customerPhone}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Specs Pill List */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">ابعاد:</span>
                      <span className="font-semibold">{project.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">وزن:</span>
                      <span className="font-semibold">{project.weight}</span>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-slate-800">
                      <span className="text-slate-500 block text-[10px]">مکانیزم قفل:</span>
                      <span className="font-semibold text-red-400 truncate block">
                        {project.lockType}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Stage Status */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-red-500" />
                        <span>مراحل تولید گاوصندوق</span>
                      </span>
                      <span className="font-mono font-bold text-red-400">
                        {progress}٪ ({completedStages} از {stagesCount} مرحله)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-red-950/40 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده مراحل و تصاویر مستند</span>
                  </button>

                  <button
                    onClick={() => onOpenProject(project.id, 'chat')}
                    className={`py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                      session.role === 'admin' && (project.unreadMessagesCount || 0) > 0
                        ? 'bg-red-950/90 border-red-600 text-red-200 hover:bg-red-900 shadow-sm shadow-red-950/60'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="گفت‌وگو و پیام‌ها"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                    <span>پیام‌ها ({(project as any).messagesCount || 0})</span>
                    {session.role === 'admin' && (project.unreadMessagesCount || 0) > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                        {project.unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  {session.role === 'admin' && onDeleteProject && (
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف کامل پروژه "${project.title}" و عکس‌های آن اطمینان دارید؟`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="حذف پروژه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
