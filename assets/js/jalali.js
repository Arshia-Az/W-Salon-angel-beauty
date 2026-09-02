// ============================================================
// Angel Beauty — Jalali (Persian) calendar engine
// Pure JS Gregorian <-> Jalali conversion (no dependencies)
// Based on the standard Jalaali algorithm (Kazimierski / Birashk)
// ============================================================

const JalaliCalendar = (() => {

  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178
  ];

  function div(a, b) { return ~~(a / b); }
  function mod(a, b) { return a - ~~(a / b) * b; }

  function jalCal(jy) {
    const bl = breaks.length;
    const gy = jy + 621;
    let leapJ = -14, jp = breaks[0];
    if (jy < jp || jy >= breaks[bl - 1]) throw new Error('Invalid Jalali year ' + jy);
    let jump = 0;
    for (let i = 1; i < bl; i += 1) {
      const jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    let n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap, gy, march };
  }

  function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
      + div(153 * mod(gm + 9, 12) + 2, 5)
      + gd - 34840408;
    d = d - div(div(gy + div(gm - 8, 6) + 100100, 100) * 3, 4) + 752;
    return d;
  }

  function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    const gd = div(mod(i, 153), 5) + 1;
    const gm = mod(div(i, 153), 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy, gm, gd };
  }

  function toJalali(gy, gm, gd) {
    const jdn = g2d(gy, gm, gd);
    return d2j(jdn);
  }

  function d2j(jdn) {
    let gy = d2g(jdn).gy;
    let jy = gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(r.gy, 3, r.march);
    let k = jdn - jdn1f;
    if (k >= 0) {
      if (k <= 185) {
        return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
      }
      k -= 186;
    } else {
      jy -= 1;
      k += 179;
      if (r.leap === 1) k += 1;
    }
    const jm = 7 + div(k, 30);
    const jd = mod(k, 30) + 1;
    return { jy, jm, jd };
  }

  function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }

  function toGregorian(jy, jm, jd) {
    const jdn = j2d(jy, jm, jd);
    return d2g(jdn);
  }

  function isLeapJalaliYear(jy) {
    return jalCal(jy).leap === 0;
  }

  function jalaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaliYear(jy) ? 30 : 29;
  }

  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const weekDaysShort = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  function todayJalali() {
    const now = new Date();
    return toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  // day-of-week where Saturday = 0 ... Friday = 6 (Iranian week)
  function jalaliWeekday(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd);
    const date = new Date(g.gy, g.gm - 1, g.gd);
    const jsDay = date.getDay(); // 0 = Sunday
    return mod(jsDay + 1, 7); // shift so Saturday = 0
  }

  function formatJalali(jy, jm, jd) {
    return `${jd} ${monthNames[jm - 1]} ${jy}`;
  }

  function toEnglishDigits(str) {
    const fa = '۰۱۲۳۴۵۶۷۸۹';
    return String(str).replace(/[۰-۹]/g, d => fa.indexOf(d));
  }

  function toPersianDigits(num) {
    const fa = '۰۱۲۳۴۵۶۷۸۹';
    return String(num).replace(/[0-9]/g, d => fa[d]);
  }

  return {
    toJalali, toGregorian, monthNames, weekDaysShort,
    todayJalali, jalaliWeekday, jalaliMonthLength,
    formatJalali, toPersianDigits, toEnglishDigits, isLeapJalaliYear
  };
})();
