import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Upload,
  Image as ImageIcon,
  Shield,
  Trash2,
  MessageSquare,
  Layers,
  Maximize2,
  Check,
} from 'lucide-react';
import { Project, ProjectStage, ProjectMessage, AuthSession } from '../types';
import { ProjectChat } from './ProjectChat';
import { ImageLightbox } from './ImageLightbox';
import { FarnivLogo } from './FarnivLogo';

interface ProjectDetailModalProps {
  project: Project;
  stages: ProjectStage[];
  messages: ProjectMessage[];
  session: AuthSession;
  initialTab?: 'stages' | 'chat';
  onClose: () => void;
  onAddStage: (formData: FormData) => Promise<void>;
  onToggleStageComplete: (stageId: string, currentStatus: boolean) => Promise<void>;
  onDeleteStage: (stageId: string) => Promise<void>;
  onSendMessage: (content: string, replyToId: string | null) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  stages,
  messages,
  session,
  initialTab = 'stages',
  onClose,
  onAddStage,
  onToggleStageComplete,
  onDeleteStage,
  onSendMessage,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'chat'>(initialTab);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [selectedLightboxStage, setSelectedLightboxStage] = useState<ProjectStage | null>(null);

  // Automatically mark messages as read for admin when viewing chat
  useEffect(() => {
    if (activeTab === 'chat' && session.role === 'admin') {
      const hasUnread = messages.some((m) => !m.isRead && m.sender === 'customer');
      if (hasUnread) {
        fetch(`/api/projects/${project.id}/messages/mark-read`, { method: 'POST' })
          .then(() => onRefresh())
          .catch((err) => console.error('Failed to mark messages as read:', err));
      }
    }
  }, [activeTab, project.id, messages, session.role, onRefresh]);

  // New Stage form state
  const [stageTitle, setStageTitle] = useState('');
  const [stageDesc, setStageDesc] = useState('');
  const [stageDate, setStageDate] = useState(
    new Intl.DateTimeFormat('fa-IR').format(new Date())
  );
  const [stageCompleted, setStageCompleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = stages.filter((s) => s.completed).length;
  const progressPercent = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitNewStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageTitle.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', stageTitle.trim());
      formData.append('description', stageDesc.trim());
      formData.append('date', stageDate.trim());
      formData.append('completed', String(stageCompleted));

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await onAddStage(formData);
      setShowAddStageModal(false);
      setStageTitle('');
      setStageDesc('');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      alert('خطا در بارگذاری مرحله و تصویر.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-red-950/80 text-red-400 border border-red-800/60">
                {project.safeType}
              </span>
              <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                مشتری: {project.customerName}
              </span>
              <span className="text-xs font-mono text-slate-400" dir="ltr">
                تحویل: {project.estimatedDelivery}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              {project.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block bg-white px-2.5 py-1 rounded-xl border border-slate-700 shadow-sm">
              <FarnivLogo variant="light" className="h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Specifications Strip */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-slate-400 block text-[10px]">ابعاد خارجی:</span>
              <span className="font-semibold text-slate-200">{project.dimensions}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">وزن تقریبی:</span>
              <span className="font-semibold text-slate-200">{project.weight}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">مکانیزم قفل و ضد سرقت:</span>
              <span className="font-semibold text-red-400">{project.lockType}</span>
            </div>
          </div>

          {/* Progress gauge */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block">پیشرفت ساخت فرنیو:</span>
              <span className="font-bold text-red-400 font-mono text-sm">
                {progressPercent}٪ ({completedCount} از {stages.length} مرحله)
              </span>
            </div>
            <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab switcher: Stages vs Chat */}
        <div className="px-4 sm:px-6 pt-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              id="tab-stages-btn"
              onClick={() => setActiveTab('stages')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'stages'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>مراحل ساخت و تصاویر مستند ({stages.length})</span>
            </button>

            <button
              id="tab-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>گفت‌وگو و استعلام ({messages.length})</span>
              {messages.some((m) => !m.isRead && m.sender !== session.role) && (
                <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse font-mono">
                  {messages.filter((m) => !m.isRead && m.sender !== session.role).length} جدید
                </span>
              )}
            </button>
          </div>

          {session.role === 'admin' && activeTab === 'stages' && (
            <button
              id="add-stage-open-btn"
              onClick={() => setShowAddStageModal(true)}
              className="mb-2 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-red-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت مرحله جدید با عکس</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900">
          {activeTab === 'stages' ? (
            <div>
              {stages.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <ImageIcon className="w-12 h-12 stroke-[1.2] text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-300">هنوز مرحله‌ای ثبت نشده است</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {session.role === 'admin'
                      ? 'روی دکمه "ثبت مرحله جدید با عکس" کلیک کنید تا تصاویر جوشکاری، بتن‌ریزی و مکانیزم را آپلود نمایید.'
                      : 'مدیریت کارخانه فرنیو به زودی مراحل ساخت و عکس‌های فرآیند تولید گاوصندوق شما را بارگذاری خواهد کرد.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {stages.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row gap-5"
                    >
                      {/* Stage photo thumbnail */}
                      <div className="w-full md:w-64 h-48 md:h-44 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative group border border-slate-800">
                        <img
                          src={stage.imageUrl}
                          alt={stage.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1000&auto=format&fit=crop&q=80';
                          }}
                        />

                        {/* Overlay zoom button */}
                        <div
                          onClick={() => setSelectedLightboxStage(stage)}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
                        >
                          <div className="flex items-center gap-1 bg-slate-900/90 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-800/60">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>بزرگ‌نمایی عکس</span>
                          </div>
                        </div>

                        {/* Order pill */}
                        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-red-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-800">
                          مرحله {stage.order || idx + 1}
                        </div>
                      </div>

                      {/* Stage info and description */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <h3 className="text-base font-bold text-slate-100 leading-snug">
                              {stage.title}
                            </h3>

                            {/* Status badge */}
                            <div>
                              {stage.completed ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  تکمیل شده
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                                  <Clock className="w-3.5 h-3.5" />
                                  در حال اجرا
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                            <span>تاریخ ثبت: {stage.date}</span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                            {stage.description || 'توضیحات تکمیلی توسط سرپرست خط تولید ثبت نشده است.'}
                          </p>
                        </div>

                        {/* Admin Action bar for this stage */}
                        {session.role === 'admin' && (
                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <button
                              onClick={() => onToggleStageComplete(stage.id, stage.completed)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                stage.completed
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  : 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/50'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {stage.completed ? 'تغییر به در حال اجرا' : 'علامت‌گذاری به عنوان تکمیل شده'}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('آیا از حذف این مرحله و تصویر آن اطمینان دارید؟')) {
                                  onDeleteStage(stage.id);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف مرحله</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ProjectChat
              projectId={project.id}
              projectTitle={project.title}
              messages={messages}
              session={session}
              onSendMessage={onSendMessage}
            />
          )}
        </div>
      </div>

      {/* Add Stage Sub-Modal */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-800/60">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  ثبت مرحله جدید و آپلود عکس
                </h3>
              </div>
              <button
                onClick={() => setShowAddStageModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewStage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  عنوان مرحله ساخت <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={stageTitle}
                  onChange={(e) => setStageTitle(e.target.value)}
                  placeholder="مثال: جوشکاری CO2 دوجداره و شاسی‌کشی ضد دیلم"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  توضیحات فرآیند ساخت برای خریدار
                </label>
                <textarea
                  rows={2}
                  value={stageDesc}
                  onChange={(e) => setStageDesc(e.target.value)}
                  placeholder="توضیح دهید در این مرحله چه فرآیندی انجام شده است..."
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تاریخ ثبت مرحله
                  </label>
                  <input
                    type="text"
                    value={stageDate}
                    onChange={(e) => setStageDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-center focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={stageCompleted}
                      onChange={(e) => setStageCompleted(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 focus:ring-0 accent-red-600"
                    />
                    <span>این مرحله تکمیل شده است</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  انتخاب یا آپلود عکس این مرحله
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-red-500/80 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="پیش‌نمایش"
                        className="h-32 mx-auto rounded-lg object-contain border border-slate-800"
                      />
                      <p className="text-[11px] text-red-400 font-medium">
                        عکس انتخاب شد (برای تغییر کلیک کنید)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-medium">
                        برای انتخاب عکس از رایانه یا موبایل کلیک کنید
                      </p>
                      <p className="text-[10px] text-slate-500">
                        فایل تصویری در حافظه سرور ذخیره می‌شود
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStageModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>ذخیره مرحله و عکس</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for large photo preview */}
      <ImageLightbox
        stage={selectedLightboxStage}
        onClose={() => setSelectedLightboxStage(null)}
      />
    </div>
  );
};
