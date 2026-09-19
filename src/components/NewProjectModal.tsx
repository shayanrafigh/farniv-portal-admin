import React, { useState } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { Customer } from '../types';

interface NewProjectModalProps {
  customers: Customer[];
  onClose: () => void;
  onCreateProject: (projectData: any) => Promise<void>;
  onOpenNewCustomer: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  customers,
  onClose,
  onCreateProject,
  onOpenNewCustomer,
}) => {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [safeType, setSafeType] = useState('گاوصندوق آسانسوری زیرویترینی');
  const [dimensions, setDimensions] = useState('ارتفاع ۱۶۰ × عرض ۸۰ × عمق ۷۰ سانتی‌متر');
  const [weight, setWeight] = useState('۸۵۰ کیلوگرم');
  const [lockType, setLockType] = useState('سیستم رمزی دیجیتال + کنترل هوشمند بال اسکرو');
  const [startDate, setStartDate] = useState(
    new Intl.DateTimeFormat('fa-IR').format(new Date())
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState('۱۴۰۵/۰۲/۱۵');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !title.trim()) {
      alert('لطفاً مشتری و عنوان پروژه را مشخص کنید.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateProject({
        customerId,
        title: title.trim(),
        safeType: safeType.trim(),
        dimensions: dimensions.trim(),
        weight: weight.trim(),
        lockType: lockType.trim(),
        startDate: startDate.trim(),
        estimatedDelivery: estimatedDelivery.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'خطا در ایجاد پروژه');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/60 text-red-400 border border-red-800/60">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                تعریف پروژه جدید گاوصندوق فرنیو
              </h3>
              <p className="text-xs text-slate-400">
                اختصاص سفارش ساخت به مشتری و ایجاد پرونده رهگیری خط تولید
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                انتخاب خریدار / مشتری <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="text-[11px] text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
              >
                + تعریف مشتری جدید در سیستم
              </button>
            </div>

            {customers.length === 0 ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                هنوز هیچ مشتری در سیستم ثبت نشده است. ابتدا روی "تعریف مشتری جدید" کلیک کنید.
              </div>
            ) : (
              <select
                id="select-customer-dropdown"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="">-- انتخاب مشتری --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (نام کاربری: {c.username} | تماس: {c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              عنوان سفارش یا مدل گاوصندوق <span className="text-rose-400">*</span>
            </label>
            <input
              id="project-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: گاوصندوق آسانسوری زیرویترینی طلافروشی - مدل فرنیو ۲۰۰۰"
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                کاربری / مدل گاوصندوق
              </label>
              <input
                type="text"
                value={safeType}
                onChange={(e) => setSafeType(e.target.value)}
                placeholder="آسانسوری زیرویترینی، طلافروشی، نسوز..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                وزن تقریبی محصول
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="مثلاً: ۸۵۰ کیلوگرم"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ابعاد بدنه (ارتفاع × عرض × عمق)
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="مثلاً: ۱۶۰ × ۸۰ × ۷۰ سانتی‌متر"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نوع قفل و سیستم رمزنگاری
              </label>
              <input
                type="text"
                value={lockType}
                onChange={(e) => setLockType(e.target.value)}
                placeholder="رمز دیجیتال، اثرانگشتی، مکانیکی چرخشی..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تاریخ شروع تولید
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs font-mono text-center focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تاریخ تخمینی تحویل
              </label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs font-mono text-center focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              یادداشت‌های فنی و شرایط اختصاصی سفارش
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: سیستم بال اسکرو هیدرولیک، طبقات متحرک، کمدچه مخفی داخلی..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-red-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              انصراف
            </button>

            <button
              id="create-project-submit-btn"
              type="submit"
              disabled={submitting || customers.length === 0}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ثبت و ایجاد پرونده پروژه</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
