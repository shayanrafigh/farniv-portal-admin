/**
 * Persian / Jalali Date Utilities & Validator
 * Supports validating Persian/Solar Hijri dates (e.g. 1404/12/25 or ۱۴۰۴/۱۲/۲۵)
 * and converting/formatting.
 */

// Convert Persian and Arabic digits to English digits
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
    .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
}

// Convert English digits to Persian digits
export function toPersianDigits(str: string | number): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
}

/**
 * Check if a Persian year is leap (کبیسه)
 * Algorithms for 33-year solar hijri cycles
 */
export function isPersianLeapYear(year: number): boolean {
  // Approximate standard 33-year cycle algorithm
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097];
  let jp = breaks[0];
  let jump = 0;
  for (let i = 1; i < breaks.length; i++) {
    const jm = breaks[i];
    jump = jm - jp;
    if (year < jm) break;
    jp = jm;
  }
  let n = year - jp;
  if (jump - n < 6) n = n - jump + ((jump + 4) >> 5) * 33;
  let leap = ((n + 1) % 33) - 1;
  if (leap === -1) leap = 4;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(leap % 33);
}

/**
 * Validates a Persian date string.
 * Accepted formats: YYYY/MM/DD, YYYY-MM-DD (both Persian digits and English digits)
 * Returns { valid: boolean, error?: string, normalized?: string }
 */
export function validatePersianDate(dateStr: string): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  if (!dateStr || !dateStr.trim()) {
    return { valid: false, error: 'لطفاً تاریخ را وارد کنید.' };
  }

  const cleaned = toEnglishDigits(dateStr.trim()).replace(/-/g, '/');
  const parts = cleaned.split('/');

  if (parts.length !== 3) {
    return {
      valid: false,
      error: 'فرمت تاریخ باید به صورت سال/ماه/روز باشد (مثال: ۱۴۰۴/۱۲/۲۵)',
    };
  }

  const [yStr, mStr, dStr] = parts;
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { valid: false, error: 'تاریخ شامل ارقام معتبر نیست.' };
  }

  // Realistic year check: usually 1350 to 1450 for projects
  if (year < 1300 || year > 1500) {
    return {
      valid: false,
      error: `سال وارد شده (${year}) نامعتبر است. سال باید بین ۱۳۰۰ تا ۱۵۰۰ باشد.`,
    };
  }

  if (month < 1 || month > 12) {
    return {
      valid: false,
      error: `ماه وارد شده (${month}) نامعتبر است. ماه باید بین ۱ تا ۱۲ باشد.`,
    };
  }

  // Days count per month in Persian calendar:
  // Months 1-6: 31 days
  // Months 7-11: 30 days
  // Month 12 (Esfand): 29 days (30 in leap year)
  let maxDays = 30;
  if (month >= 1 && month <= 6) {
    maxDays = 31;
  } else if (month >= 7 && month <= 11) {
    maxDays = 30;
  } else {
    maxDays = isPersianLeapYear(year) ? 30 : 29;
  }

  if (day < 1 || day > maxDays) {
    const leapNote = month === 12 && !isPersianLeapYear(year) ? ' (اسفند در سال غیرکبیسه ۲۹ روز است)' : '';
    return {
      valid: false,
      error: `روز وارد شده (${day}) برای این ماه نامعتبر است. باید بین ۱ تا ${maxDays} باشد${leapNote}.`,
    };
  }

  const paddedMonth = month < 10 ? `0${month}` : `${month}`;
  const paddedDay = day < 10 ? `0${day}` : `${day}`;
  const normalizedEn = `${year}/${paddedMonth}/${paddedDay}`;
  const normalizedFa = toPersianDigits(normalizedEn);

  return {
    valid: true,
    normalized: normalizedFa,
  };
}

/**
 * Returns today's Persian date formatted (e.g. ۱۴۰۴/۱۲/۲۵)
 */
export function getTodayPersianDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Intl.DateTimeFormat('fa-IR').format(new Date());
  }
}
