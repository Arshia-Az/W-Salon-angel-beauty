// ============================================================
// Angel Beauty — Booking wizard controller
// ============================================================

(() => {
  const CATEGORIES = [
    { id: 'hair',   icon: '✂️', name: 'مو',    desc: 'رنگ، کوتاهی و استایل' },
    { id: 'skin',   icon: '✨', name: 'پوست',  desc: 'پاکسازی و مراقبت صورت' },
    { id: 'nails',  icon: '💅', name: 'ناخن',  desc: 'مانیکور و پدیکور' },
    { id: 'makeup', icon: '💄', name: 'آرایش', desc: 'میکاپ روز و مجلسی' },
    { id: 'brow',   icon: '🪞', name: 'ابرو',  desc: 'فرم‌دهی و میکروبلیدینگ' },
    { id: 'spa',    icon: '🌿', name: 'اسپا',  desc: 'ماساژ و آرامش کامل' }
  ];

  const SERVICES = {
    hair: [
      { id: 'h1', name: 'کوتاهی و ژورنال', price: 950000, duration: 45 },
      { id: 'h2', name: 'رنگ ریشه', price: 1800000, duration: 75 },
      { id: 'h3', name: 'رنگ کامل و هایلایت', price: 2900000, duration: 120 },
      { id: 'h4', name: 'کراتینه و احیا', price: 3200000, duration: 150 }
    ],
    skin: [
      { id: 's1', name: 'پاکسازی پوست', price: 1200000, duration: 60 },
      { id: 's2', name: 'لایه‌برداری شیمیایی', price: 1650000, duration: 45 },
      { id: 's3', name: 'هیدرافیشیال', price: 2100000, duration: 60 }
    ],
    nails: [
      { id: 'n1', name: 'مانیکور کلاسیک', price: 650000, duration: 40 },
      { id: 'n2', name: 'پدیکور کامل', price: 850000, duration: 45 },
      { id: 'n3', name: 'طراحی ناخن ژلیش', price: 1100000, duration: 60 }
    ],
    makeup: [
      { id: 'm1', name: 'میکاپ روزانه', price: 1400000, duration: 45 },
      { id: 'm2', name: 'میکاپ مجلسی', price: 2300000, duration: 75 },
      { id: 'm3', name: 'میکاپ عروس', price: 3800000, duration: 120 }
    ],
    brow: [
      { id: 'b1', name: 'فرم ابرو با موم', price: 350000, duration: 20 },
      { id: 'b2', name: 'میکروبلیدینگ', price: 1900000, duration: 90 }
    ],
    spa: [
      { id: 'sp1', name: 'ماساژ سوئدی', price: 1600000, duration: 60 },
      { id: 'sp2', name: 'ماساژ سنگ داغ', price: 2000000, duration: 75 }
    ]
  };

  const STEP_LABELS = ['دسته‌بندی', 'خدمت', 'تاریخ و ساعت', 'ورود', 'پرداخت'];

  const state = {
    step: 1,
    category: null,
    service: null,
    calYear: null,
    calMonth: null,
    date: null,   // {jy, jm, jd}
    time: null,
    name: '',
    phone: '',
    note: '',
    payMethod: 'gateway',
    otpVerified: false,
    otpTimerId: null
  };

  const el = (sel) => document.querySelector(sel);
  const money = (n) => n.toLocaleString('fa-IR') + ' تومان';

  // ---------- Stepper ----------
  function renderStepper() {
    const wrap = el('#stepper');
    wrap.innerHTML = '';
    STEP_LABELS.forEach((label, i) => {
      const n = i + 1;
      const node = document.createElement('div');
      node.className = 'step-node' + (n === state.step ? ' active' : '') + (n < state.step ? ' done' : '');
      node.innerHTML = `<div class="circle">${n < state.step ? '' : n}</div><div class="label">${label}</div>`;
      wrap.appendChild(node);
      if (n < STEP_LABELS.length) {
        const line = document.createElement('div');
        line.className = 'step-line' + (n < state.step ? ' done' : '');
        wrap.appendChild(line);
      }
    });
  }

  function showStep(n) {
    document.querySelectorAll('.step-panel').forEach(p => {
      p.classList.toggle('active', Number(p.dataset.step) === n);
    });
    const actions = el('#stepActions');
    const stepper = el('#stepper');
    if (n === 6) {
      actions.style.display = 'none';
      stepper.style.display = 'none';
    } else {
      actions.style.display = 'flex';
      stepper.style.display = 'flex';
      el('#btnBack').classList.toggle('step-btn-hidden', n === 1);
      el('#btnNext').textContent = n === 5 ? 'تکمیل رزرو و پرداخت' : 'مرحله بعد';
    }
    renderStepper();
    window.scrollTo({ top: el('.booking-shell').offsetTop - 90, behavior: 'smooth' });
  }

  // ---------- Step 1: categories ----------
  function renderCategories() {
    const grid = el('#catGrid');
    grid.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'cat-card' + (state.category === cat.id ? ' selected' : '');
      card.innerHTML = `<div class="icon">${cat.icon}</div><h3>${cat.name}</h3><span>${cat.desc}</span>`;
      card.addEventListener('click', () => {
        state.category = cat.id;
        state.service = null;
        renderCategories();
      });
      grid.appendChild(card);
    });
  }

  // ---------- Step 2: services ----------
  function renderServices() {
    const list = el('#svcList');
    list.innerHTML = '';
    if (!state.category) return;
    SERVICES[state.category].forEach(svc => {
      const item = document.createElement('div');
      item.className = 'svc-item' + (state.service && state.service.id === svc.id ? ' selected' : '');
      item.innerHTML = `
        <div class="svc-info">
          <h3>${svc.name}</h3>
          <span>مدت زمان: ${svc.duration} دقیقه</span>
        </div>
        <div style="display:flex; align-items:center; gap:16px;">
          <span class="svc-price">${money(svc.price)}</span>
          <span class="svc-radio"></span>
        </div>`;
      item.addEventListener('click', () => {
        state.service = svc;
        renderServices();
      });
      list.appendChild(item);
    });
  }

  // ---------- Step 3: calendar & time ----------
  function initCalendar() {
    const today = JalaliCalendar.todayJalali();
    state.calYear = today.jy;
    state.calMonth = today.jm;
  }

  function renderCalendar() {
    const today = JalaliCalendar.todayJalali();
    el('#calLabel').textContent = `${JalaliCalendar.monthNames[state.calMonth - 1]} ${JalaliCalendar.toPersianDigits(state.calYear)}`;

    const wd = el('#calWeekdays');
    wd.innerHTML = '';
    JalaliCalendar.weekDaysShort.forEach(d => {
      const s = document.createElement('span');
      s.textContent = d;
      wd.appendChild(s);
    });

    const days = el('#calDays');
    days.innerHTML = '';
    const firstWeekday = JalaliCalendar.jalaliWeekday(state.calYear, state.calMonth, 1);
    const monthLen = JalaliCalendar.jalaliMonthLength(state.calYear, state.calMonth);

    for (let i = 0; i < firstWeekday; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      days.appendChild(empty);
    }

    for (let d = 1; d <= monthLen; d++) {
      const cell = document.createElement('div');
      const isPast = (state.calYear < today.jy) ||
        (state.calYear === today.jy && state.calMonth < today.jm) ||
        (state.calYear === today.jy && state.calMonth === today.jm && d < today.jd);
      const weekday = JalaliCalendar.jalaliWeekday(state.calYear, state.calMonth, d);
      const isFriday = weekday === 6;
      const isToday = state.calYear === today.jy && state.calMonth === today.jm && d === today.jd;
      const isSelected = state.date && state.date.jy === state.calYear && state.date.jm === state.calMonth && state.date.jd === d;

      cell.className = 'cal-day' +
        (isPast || isFriday ? ' disabled' : ' enabled') +
        (isToday ? ' today' : '') +
        (isSelected ? ' selected' : '');
      cell.textContent = JalaliCalendar.toPersianDigits(d);

      if (!isPast && !isFriday) {
        cell.addEventListener('click', () => {
          state.date = { jy: state.calYear, jm: state.calMonth, jd: d };
          state.time = null;
          renderCalendar();
          renderTimeSlots();
        });
      }
      days.appendChild(cell);
    }
  }

  function renderTimeSlots() {
    const container = el('#timeContainer');
    if (!state.date) {
      container.innerHTML = '<p class="time-empty">ابتدا یک روز را از تقویم انتخاب کنید</p>';
      return;
    }
    const weekday = JalaliCalendar.jalaliWeekday(state.date.jy, state.date.jm, state.date.jd);
    if (weekday === 6) {
      container.innerHTML = '<p class="time-empty">سالن روزهای جمعه تعطیل است</p>';
      return;
    }

    const slots = [];
    for (let h = 10; h < 20; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:45`);
    }

    // deterministic pseudo-random "taken" slots based on the date, for demo purposes
    const seed = state.date.jy * 372 + state.date.jm * 31 + state.date.jd;
    const grid = document.createElement('div');
    grid.className = 'time-grid';
    slots.forEach((t, i) => {
      const taken = (seed + i * 7) % 5 === 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot' + (taken ? ' taken' : '') + (state.time === t ? ' selected' : '');
      btn.textContent = JalaliCalendar.toPersianDigits(t);
      if (!taken) {
        btn.addEventListener('click', () => {
          state.time = t;
          renderTimeSlots();
        });
      }
      grid.appendChild(btn);
    });
    container.innerHTML = '';
    container.appendChild(grid);
  }

  // ---------- Step 4: OTP login / register ----------
  let otpSecondsLeft = 0;

  function formatTimer(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return JalaliCalendar.toPersianDigits(`${m}:${sec}`);
  }

  function startOtpTimer() {
    clearInterval(state.otpTimerId);
    otpSecondsLeft = 45;
    el('#btnResendOtp').disabled = true;
    el('#otpTimer').textContent = `ارسال مجدد کد تا ${formatTimer(otpSecondsLeft)}`;
    state.otpTimerId = setInterval(() => {
      otpSecondsLeft -= 1;
      if (otpSecondsLeft <= 0) {
        clearInterval(state.otpTimerId);
        el('#otpTimer').textContent = 'کد را دریافت نکردید؟';
        el('#btnResendOtp').disabled = false;
      } else {
        el('#otpTimer').textContent = `ارسال مجدد کد تا ${formatTimer(otpSecondsLeft)}`;
      }
    }, 1000);
  }

  function sendOtp() {
    const phone = el('#authPhone').value.trim().replace(/\s/g, '');
    if (!/^0?9\d{9}$/.test(phone)) { showToast('شماره موبایل معتبر وارد کنید'); return; }
    state.phone = phone;

    // Backend integration point — request an OTP code from your auth API here.
    // Example: await fetch('/api/auth/send-otp', { method:'POST', body: JSON.stringify({ phone }) });

    el('#authPhoneShown').textContent = JalaliCalendar.toPersianDigits(phone);
    el('#authPhoneStage').classList.add('auth-step-hidden');
    el('#authOtpStage').classList.remove('auth-step-hidden');
    document.querySelectorAll('.otp-digit').forEach(inp => { inp.value = ''; });
    document.querySelector('.otp-digit').focus();
    startOtpTimer();
    showToast('کد تایید ارسال شد (نسخه دمو)');
  }

  function verifyOtp() {
    const digits = Array.from(document.querySelectorAll('.otp-digit')).map(i => i.value.trim());
    if (digits.some(d => d === '')) { showToast('کد تایید را کامل وارد کنید'); return; }

    // Backend integration point — verify the OTP against your auth API here.
    // Example: await fetch('/api/auth/verify-otp', { method:'POST', body: JSON.stringify({ phone: state.phone, code: digits.join('') }) });

    clearInterval(state.otpTimerId);
    state.otpVerified = true;
    el('#authOtpStage').classList.add('auth-step-hidden');
    el('#authDoneStage').classList.remove('auth-step-hidden');
    showToast('شماره موبایل تایید شد');
  }

  function wireOtpInputs() {
    const inputs = Array.from(document.querySelectorAll('.otp-digit'));
    inputs.forEach((input, idx) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) inputs[idx - 1].focus();
      });
    });
  }

  el('#btnSendOtp').addEventListener('click', sendOtp);
  el('#btnVerifyOtp').addEventListener('click', verifyOtp);
  el('#btnResendOtp').addEventListener('click', () => { startOtpTimer(); showToast('کد تایید مجدداً ارسال شد'); });
  el('#btnEditPhone').addEventListener('click', () => {
    clearInterval(state.otpTimerId);
    state.otpVerified = false;
    el('#authOtpStage').classList.add('auth-step-hidden');
    el('#authDoneStage').classList.add('auth-step-hidden');
    el('#authPhoneStage').classList.remove('auth-step-hidden');
  });
  wireOtpInputs();

  // ---------- Step 5: summary & payment ----------
  function renderSummary() {
    const cat = CATEGORIES.find(c => c.id === state.category);
    el('#sumCat').textContent = cat ? cat.name : '—';
    el('#sumSvc').textContent = state.service ? state.service.name : '—';
    el('#sumDur').textContent = state.service ? state.service.duration + ' دقیقه' : '—';
    el('#sumDate').textContent = state.date
      ? `${JalaliCalendar.formatJalali(state.date.jy, state.date.jm, state.date.jd)} — ساعت ${JalaliCalendar.toPersianDigits(state.time)}`
      : '—';
    el('#sumName').textContent = state.name || '—';
    el('#sumTotal').textContent = state.service ? money(state.service.price) : '—';
  }

  document.querySelectorAll('.pay-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.payMethod = opt.dataset.method;
    });
  });

  // Backend integration point — hook your gateway (e.g. Zarinpal) here.
  function startGatewayPayment() {
    // Example (to be implemented by backend dev):
    // const res = await fetch('/api/payments/create', { method: 'POST', body: JSON.stringify(bookingPayload) });
    // const { redirectUrl } = await res.json();
    // window.location.href = redirectUrl;
    return true; // simulated success for this frontend-only demo
  }

  function generateBookingCode() {
    const d = new Date();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AB-${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${rand}`;
  }

  function completeBooking() {
    const ok = startGatewayPayment();
    if (!ok) { showToast('پرداخت ناموفق بود، دوباره تلاش کنید'); return; }

    const code = generateBookingCode();
    el('#bookingCode').textContent = code;

    const booking = {
      code,
      category: state.category,
      service: state.service,
      date: state.date,
      time: state.time,
      name: state.name,
      phone: state.phone,
      note: state.note,
      payMethod: state.payMethod,
      createdAt: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('angelBeautyBookings') || '[]');
      existing.push(booking);
      localStorage.setItem('angelBeautyBookings', JSON.stringify(existing));
    } catch (e) { /* storage unavailable — non-blocking */ }

    state.step = 6;
    showStep(6);
  }

  // ---------- Validation ----------
  function validateStep(n) {
    if (n === 1 && !state.category) { showToast('یک دسته‌بندی را انتخاب کنید'); return false; }
    if (n === 2 && !state.service) { showToast('یک خدمت را انتخاب کنید'); return false; }
    if (n === 3 && (!state.date || !state.time)) { showToast('تاریخ و ساعت را انتخاب کنید'); return false; }
    if (n === 4) {
      if (!state.otpVerified) { showToast('ابتدا شماره موبایل خود را تایید کنید'); return false; }
      state.name = el('#fName').value.trim();
      state.note = el('#fNote').value.trim();
      if (!state.name) { showToast('نام خود را وارد کنید'); return false; }
    }
    return true;
  }

  // ---------- Navigation ----------
  el('#btnNext').addEventListener('click', () => {
    if (!validateStep(state.step)) return;
    if (state.step === 5) { completeBooking(); return; }
    state.step += 1;
    if (state.step === 2) renderServices();
    if (state.step === 5) renderSummary();
    showStep(state.step);
  });

  el('#btnBack').addEventListener('click', () => {
    if (state.step === 1) return;
    state.step -= 1;
    showStep(state.step);
  });

  el('#calNext').addEventListener('click', () => {
    state.calMonth += 1;
    if (state.calMonth > 12) { state.calMonth = 1; state.calYear += 1; }
    renderCalendar();
  });
  el('#calPrev').addEventListener('click', () => {
    const today = JalaliCalendar.todayJalali();
    if (state.calYear === today.jy && state.calMonth === today.jm) return;
    state.calMonth -= 1;
    if (state.calMonth < 1) { state.calMonth = 12; state.calYear -= 1; }
    renderCalendar();
  });

  // ---------- Init ----------
  renderCategories();
  initCalendar();
  renderCalendar();
  showStep(1);
})();
