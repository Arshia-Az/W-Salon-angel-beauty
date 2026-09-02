// ============================================================
// Angel Beauty — Portfolio gallery (filter + detail modal)
// Media is placeholder gradient art; swap `videoSrc` with real
// files when connecting the backend/media library.
// ============================================================

(() => {
  const CATEGORIES = [
    { id: 'all',    name: 'همه' },
    { id: 'hair',   name: 'مو' },
    { id: 'skin',   name: 'پوست' },
    { id: 'nails',  name: 'ناخن' },
    { id: 'makeup', name: 'آرایش' },
    { id: 'brow',   name: 'ابرو' }
  ];

  const ITEMS = [
    {
      id: 1, category: 'hair', catName: 'مو', grad: 'grad-1', type: 'video',
      title: 'بالیاژ طبیعی روی موی بلوند',
      desc: 'اجرای تکنیک بالیاژ برای گذار نرم رنگ از ریشه تا نوک مو، بدون آسیب به ساختار مو.',
      duration: '۱۱۰ دقیقه', specialist: 'نگین صادقی', videoSrc: ''
    },
    {
      id: 2, category: 'skin', catName: 'پوست', grad: 'grad-2', type: 'video',
      title: 'هیدرافیشیال پوست خشک',
      desc: 'ترکیب پاکسازی عمیق و سرم‌های هیدراته‌کننده برای پوستی شاداب در یک جلسه.',
      duration: '۶۰ دقیقه', specialist: 'دکتر آرام رستمی', videoSrc: ''
    },
    {
      id: 3, category: 'makeup', catName: 'آرایش', grad: 'grad-3', type: 'video',
      title: 'میکاپ عروس با ماندگاری بالا',
      desc: 'طراحی چهره‌ی طبیعی و ماندگار برای مراسم عروسی، همراه با تست رنگ پیش از روز کار.',
      duration: '۱۲۰ دقیقه', specialist: 'ترانه یوسفی', videoSrc: ''
    },
    {
      id: 4, category: 'nails', catName: 'ناخن', grad: 'grad-4', type: 'image',
      title: 'طراحی مینیمال ژلیش',
      desc: 'طرح ساده و ظریف با رنگ‌های نیوترال، مناسب استفاده روزمره.',
      duration: '۵۰ دقیقه', specialist: 'الناز کریمی', videoSrc: ''
    },
    {
      id: 5, category: 'brow', catName: 'ابرو', grad: 'grad-1', type: 'video',
      title: 'میکروبلیدینگ ابروی طبیعی',
      desc: 'ترسیم تار به تار متناسب با فرم صورت برای نتیجه‌ای کاملاً طبیعی.',
      duration: '۹۰ دقیقه', specialist: 'نگین صادقی', videoSrc: ''
    },
    {
      id: 6, category: 'hair', catName: 'مو', grad: 'grad-2', type: 'image',
      title: 'کوتاهی لایه‌ای بلند',
      desc: 'حجم‌دهی طبیعی با لایه‌های نرم، هماهنگ با فرم صورت مشتری.',
      duration: '۴۵ دقیقه', specialist: 'مهسا قاسمی', videoSrc: ''
    },
    {
      id: 7, category: 'skin', catName: 'پوست', grad: 'grad-3', type: 'image',
      title: 'لایه‌برداری شیمیایی ملایم',
      desc: 'روشن‌سازی و یکنواخت‌سازی رنگ پوست با اسیدهای درجه یک و دوره نقاهت کوتاه.',
      duration: '۴۰ دقیقه', specialist: 'دکتر آرام رستمی', videoSrc: ''
    },
    {
      id: 8, category: 'makeup', catName: 'آرایش', grad: 'grad-4', type: 'video',
      title: 'میکاپ دودی مجلسی',
      desc: 'طراحی چشم دودی هماهنگ با رنگ لباس و نور محل مراسم.',
      duration: '۷۵ دقیقه', specialist: 'ترانه یوسفی', videoSrc: ''
    },
    {
      id: 9, category: 'nails', catName: 'ناخن', grad: 'grad-1', type: 'video',
      title: 'اکستنشن ناخن فرانسوی مدرن',
      desc: 'بازطراحی کلاسیک فرانسوی با زاویه و رنگ‌بندی امروزی.',
      duration: '۷۰ دقیقه', specialist: 'الناز کریمی', videoSrc: ''
    }
  ];

  let activeFilter = 'all';
  const el = (sel) => document.querySelector(sel);

  function renderFilters() {
    const row = el('#filterRow');
    row.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-btn' + (cat.id === activeFilter ? ' active' : '');
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        activeFilter = cat.id;
        renderFilters();
        renderGrid();
      });
      row.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = el('#galleryGrid');
    grid.innerHTML = '';
    const items = activeFilter === 'all' ? ITEMS : ITEMS.filter(i => i.category === activeFilter);
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'port-card';
      card.innerHTML = `
        <div class="port-media ${item.grad}">
          <span class="cat-tag">${item.catName}</span>
          ${item.type === 'video' ? '<span class="play">▶</span>' : ''}
        </div>
        <div class="port-body">
          <h3>${item.title}</h3>
          <p>${item.desc.length > 70 ? item.desc.slice(0, 70) + '…' : item.desc}</p>
        </div>`;
      card.addEventListener('click', () => openModal(item));
      grid.appendChild(card);
    });
  }

  function openModal(item) {
    el('#modalCat').textContent = item.catName;
    el('#modalTitle').textContent = item.title;
    el('#modalDesc').textContent = item.desc;
    el('#modalDur').textContent = item.duration;
    el('#modalSpecialist').textContent = item.specialist;

    const media = el('#modalMedia');
    media.className = 'modal-media ' + item.grad;
    if (item.type === 'video') {
      // Attach the real clip via item.videoSrc when the media library is connected.
      media.innerHTML = item.videoSrc
        ? `<video src="${item.videoSrc}" controls playsinline></video>`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">پیش‌نمایش ویدیو — به‌زودی</div>`;
    } else {
      media.innerHTML = '';
    }

    el('#modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    el('#modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  el('#modalClose').addEventListener('click', closeModal);
  el('#modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  renderFilters();
  renderGrid();
})();
