import React, { useState, useRef } from 'react';
import { X, Upload, Check, Edit3, Trash2, AlertCircle } from 'lucide-react';
import { ProjectStage } from '../types';
import { PersianDateInput } from './PersianDateInput';
import { validatePersianDate } from '../utils/dateValidator';

interface EditStageModalProps {
  stage: ProjectStage;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const EditStageModal: React.FC<EditStageModalProps> = ({
  stage,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(stage.title || '');
  const [description, setDescription] = useState(stage.description || '');
  const [date, setDate] = useState(stage.date || '');
  const [completed, setCompleted] = useState(Boolean(stage.completed));
  const [order, setOrder] = useState<number | string>(stage.order || 1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(stage.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('عنوان مرحله الزامی است.');
      return;
    }

    // Validate date
    if (date.trim()) {
      const dateValidation = validatePersianDate(date.trim());
      if (!dateValidation.valid) {
        setDateError(dateValidation.error || 'تاریخ نامعتبر است.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('date', date.trim());
      formData.append('completed', String(completed));
      formData.append('order', String(order));

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'خطا در ویرایش مرحله');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`آیا از حذف کامل «${stage.title}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
      setIsDeleting(true);
      try {
        await onDelete();
        onClose();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'خطا در حذف مرحله');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                ویرایش و مدیریت مرحله ساخت
              </h3>
              <p className="text-[11px] text-slate-400">
                تغییر مشخصات، تاریخ، تصویر و وضعیت تکمیل مرحله
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Title and Order */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                عنوان مرحله ساخت <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: جوشکاری CO2 دوجداره و شاسی‌کشی ضد دیلم"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                شماره مرحله
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-center focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              توضیحات فرآیند ساخت برای خریدار
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیح دهید در این مرحله چه فرآیندی انجام شده است..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Validated Persian Date & Completed Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <PersianDateInput
                id="edit-stage-date-input"
                label="تاریخ ثبت مرحله"
                value={date}
                onChange={(newVal) => {
                  setDate(newVal);
                  setDateError(null);
                }}
                required
                placeholder="۱۴۰۴/۱۲/۲۵"
                showTodayBtn={true}
              />
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 w-full">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 accent-red-600"
                />
                <span>این مرحله تکمیل شده است</span>
              </label>
            </div>
          </div>

          {dateError && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{dateError}</span>
            </div>
          )}

          {/* Photo Preview & Replace */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              عکس این مرحله (برای تغییر کلیک کنید)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-red-500/80 rounded-xl p-3 text-center cursor-pointer bg-slate-950/60 transition-colors"
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
                    alt="پیش‌نمایش مرحله"
                    className="h-28 mx-auto rounded-lg object-contain border border-slate-800"
                  />
                  <p className="text-[11px] text-red-400 font-medium">
                    {selectedFile ? 'عکس جدید انتخاب شد (برای تغییر دوباره کلیک کنید)' : 'برای تعویض عکس کلیک کنید'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 py-3">
                  <Upload className="w-7 h-7 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">
                    برای انتخاب تصویر کلیک کنید
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Buttons: Delete + Cancel + Save */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>حذف این مرحله</span>
                </>
              )}
            </button>

            <div className="flex-1 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSaving || isDeleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ذخیره تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
