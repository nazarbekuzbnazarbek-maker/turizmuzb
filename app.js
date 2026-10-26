const $ = id => document.getElementById(id);
const state = {
  lang: 'uz', screen: 'auth', selectedTour: null, guests: 1, pay: 'click', region: 'all',
  user: { id: 'usr_882193', name: 'Mehmon', email: 'tourist@silkway.uz', role: 'tourist', kyc: 'UNVERIFIED' },
  passport: null, bookings: [], logs: []
};

const i18n = {
  uz: { welcome: "Janubiy O‘zbekiston bo‘ylab sayohat", sub: "Qashqadaryo va Surxondaryoning qadimiy go‘zalliklarini kashf eting.", tours: "Turlar", kyc: "KYC", profile: "Profil", kycTitle: "Shaxsni tasdiqlash (KYC)" },
  en: { welcome: "Travel across Southern Uzbekistan", sub: "Discover the ancient heritage of Qashqadaryo and Surxondaryo.", tours: "Tours", kyc: "KYC", profile: "Profile", kycTitle: "Identity verification (KYC)" },
  ru: { welcome: "Путешествие по Южному Узбекистану", sub: "Откройте древнее наследие Кашкадарьи и Сурхандарьи.", tours: "Туры", kyc: "KYC", profile: "Профиль", kycTitle: "Верификация личности (KYC)" }
};

const toursData = [
  { id: 'tour_q1', region: 'qashqadaryo', title: 'Shahrisabz Oqsaroy va qadimiy obidalar', duration: '2 kun / 1 tun', price: 450000, guide: 'Anvar Aliyev', rating: 4.9, image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=500&q=80', desc: 'Amir Temur tug‘ilgan shahar: Oqsaroy majmuasi va Dorus-Saodat.' },
  { id: 'tour_s1', region: 'surxondaryo', title: 'Termiz buddaviy yodgorliklari va Fayoztepa', duration: '3 kun / 2 tun', price: 680000, guide: 'Sardor Qosimov', rating: 5.0, image: 'https://images.unsplash.com/photo-1528164344705-47542687990d?auto=format&fit=crop&w=500&q=80', desc: 'Termiz, Fayoztepa va Qoratepa buddaviy ibodatxonalari bo‘ylab ekspeditsiya.' },
  { id: 'tour_q2', region: 'qashqadaryo', title: 'Hisor tog‘lari va G‘elon qishlog‘i ekoturi', duration: '1 kunlik', price: 320000, guide: 'Nodira Umarova', rating: 4.8, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80', desc: 'Tog‘ qishloqlariga toza havo va tabiat turi.' },
  { id: 'tour_s2', region: 'surxondaryo', title: 'Boysun manzaralari va Sangardak sharsharasi', duration: '2 kun / 1 tun', price: 520000, guide: 'Erkin Zokirov', rating: 4.9, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80', desc: 'Boysunning madaniy muhiti va sharshara.' }
];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => n.toLocaleString('ru-RU') + ' UZS';
const ON = 'bg-goldWarm text-slate-950 shadow-md font-black', OFF = 'text-slate-300 font-semibold';

function logSql(text) {
  state.logs.unshift('[' + new Date().toLocaleTimeString() + '] ' + text);
  state.logs.length = Math.min(state.logs.length, 20);
  const logEl = $('db-logs');
  if (logEl) logEl.innerHTML = state.logs.map(l => `<div class="text-emerald-400/90 text-[10px] truncate">${esc(l)}</div>`).join('');
}

function changeLanguage(l) {
  state.lang = l; const d = i18n[l];
  if ($('t-welcome')) $('t-welcome').textContent = d.welcome;
  if ($('t-welcomeSub')) $('t-welcomeSub').textContent = d.sub;
  if ($('t-navTours')) $('t-navTours').textContent = d.tours;
  if ($('t-navKyc')) $('t-navKyc').textContent = d.kyc;
  if ($('t-navProfile')) $('t-navProfile').textContent = d.profile;
  if ($('t-kyc')) $('t-kyc').textContent = d.kycTitle;
  logSql('SET app.language = ' + l);
}

function navigate(id) {
  state.screen = id;
  ['auth', 'kyc', 'explorer', 'booking'].forEach(s => {
    const el = $('screen-' + s);
    if (el) el.classList.toggle('hidden', s !== id);
  });
  document.querySelectorAll('[data-nav]').forEach(b => {
    const on = b.dataset.nav === id;
    b.classList.toggle('text-goldWarm', on);
    b.classList.toggle('font-extrabold', on);
    b.classList.toggle('text-slate-400', !on);
  });
  logSql('NAVIGATE /app/' + id);
}

function setAuthMode(mode) {
  const reg = mode === 'register';
  if ($('f-name')) $('f-name').classList.toggle('hidden', !reg);
  if ($('f-role')) $('f-role').classList.toggle('hidden', !reg);
  
  const tabLogin = $('authTab-login');
  const tabReg = $('authTab-register');
  if (tabLogin && tabReg) {
    tabLogin.className = 'flex-1 py-3 rounded-xl transition-all ' + (reg ? 'text-slate-400 font-medium' : 'bg-goldWarm text-slate-950 font-black shadow');
    tabReg.className = 'flex-1 py-3 rounded-xl transition-all ' + (reg ? 'bg-goldWarm text-slate-950 font-black shadow' : 'text-slate-400 font-medium');
  }
  if ($('authSubmit')) $('authSubmit').textContent = reg ? 'Ro‘yxatdan o‘tish' : 'Tizimga kirish';
  if ($('authForm')) $('authForm').dataset.mode = mode;
}

function enter(name) {
  if (name) state.user.name = name;
  if ($('inPass')) $('inPass').value = '';
  if ($('inPass')) $('inPass').type = 'password';
  if ($('eye')) $('eye').textContent = 'Ko‘rsatish';
  updateInspector(); renderDb(); navigate('explorer');
}

const authForm = $('authForm');
if (authForm) {
  authForm.addEventListener('submit', e => {
    e.preventDefault();
    const reg = e.currentTarget.dataset.mode === 'register';
    const emailInput = $('inEmail');
    const email = emailInput ? emailInput.value.trim() : 'tourist@silkway.uz';
    state.user.email = email;
    if (reg) {
      const roleInput = $('inRole');
      state.user.role = roleInput ? roleInput.value : 'tourist';
      logSql(`INSERT INTO users (email, role) VALUES ('${email}', '${state.user.role}')`);
      const nameInput = $('inName');
      enter(nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Yangi foydalanuvchi');
    } else {
      logSql(`SELECT * FROM users WHERE email='${email}'`);
      enter(email.split('@')[0]);
    }
  });
}

const eyeBtn = $('eye');
if (eyeBtn) {
  eyeBtn.onclick = () => {
    const p = $('inPass');
    if (!p) return;
    const h = p.type === 'password';
    p.type = h ? 'text' : 'password';
    eyeBtn.textContent = h ? 'Yashirish' : 'Ko‘rsatish';
  };
}

document.querySelectorAll('[data-mode]').forEach(b => {
  if (b.id) b.onclick = () => setAuthMode(b.dataset.mode);
});

document.querySelectorAll('[data-social]').forEach(b => {
  b.onclick = () => {
    logSql('OAUTH via ' + b.dataset.social);
    enter(b.dataset.social + ' foydalanuvchi');
  };
});

const forgotBtn = $('forgot');
if (forgotBtn) forgotBtn.onclick = () => { const otpEl = $('otp'); if (otpEl) otpEl.classList.remove('hidden'); };

const otpCancelBtn = $('otpCancel');
if (otpCancelBtn) otpCancelBtn.onclick = () => { const otpEl = $('otp'); if (otpEl) otpEl.classList.add('hidden'); };

const otpOkBtn = $('otpOk');
if (otpOkBtn) {
  otpOkBtn.onclick = () => {
    const codeEl = $('otpCode');
    const msgEl = $('otpMsg');
    const otpEl = $('otp');
    if (!codeEl || !msgEl || !otpEl) return;
    if (!/^\d{4}$/.test(codeEl.value)) {
      msgEl.textContent = '4 xonali kod kiriting.';
      return;
    }
    msgEl.textContent = '';
    codeEl.value = '';
    otpEl.classList.add('hidden');
    logSql('OTP_VERIFY: SUCCESS');
  };
}

function enableBtn(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.className = 'w-full py-3.5 bg-gradient-to-r from-goldWarm to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg active:scale-[0.98] transition';
}

const btnScan = $('btnScan');
if (btnScan) {
  btnScan.onclick = () => {
    logSql('KYC_OCR: skanerlanmoqda...');
    setTimeout(() => {
      const ocrBox = $('ocrBox');
      if (ocrBox) ocrBox.classList.remove('hidden');
      state.passport = 'FA7890123';
      enableBtn($('btnFace'));
      logSql(`INSERT INTO kyc (user_id, passport, status) VALUES ('${state.user.id}', 'FA7890123', 'PENDING')`);
      renderDb();
    }, 1000);
  };
}

const btnFace = $('btnFace');
if (btnFace) {
  btnFace.onclick = () => {
    const kyc1 = $('kyc1'), kyc2 = $('kyc2'), dot2 = $('dot2');
    if (kyc1) kyc1.classList.add('hidden');
    if (kyc2) kyc2.classList.remove('hidden');
    if (dot2) dot2.classList.replace('bg-white/10', 'bg-goldWarm');
  };
}

const btnStartFace = $('btnStartFace');
if (btnStartFace) {
  btnStartFace.onclick = () => {
    const radar = $('radar'), faceText = $('faceText'), faceIcon = $('faceIcon'), faceOk = $('faceOk'), kycBadge = $('kycBadge'), kycDot = $('kycDot');
    if (radar) radar.classList.remove('hidden');
    if (faceText) faceText.textContent = 'Harakatlanmang...';
    if (faceIcon) faceIcon.className = 'fa-solid fa-face-smile text-5xl text-goldWarm animate-pulse';
    setTimeout(() => {
      if (radar) radar.classList.add('hidden');
      if (faceIcon) faceIcon.className = 'fa-solid fa-face-laugh-beam text-5xl text-emerald-400';
      if (faceText) faceText.textContent = 'Yuz mos keldi';
      if (faceOk) faceOk.classList.remove('hidden');
      if (kycBadge) {
        kycBadge.textContent = 'APPROVED 🟢';
        kycBadge.className = 'px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-extrabold h-fit';
      }
      state.user.kyc = 'APPROVED';
      if (kycDot) kycDot.classList.replace('bg-amber-400', 'bg-emerald-400');
      enableBtn($('btnFinish'));
      logSql(`UPDATE kyc SET status='APPROVED' WHERE user_id='${state.user.id}'`);
      updateInspector(); renderDb();
    }, 2500);
  };
}

const btnFinish = $('btnFinish');
if (btnFinish) btnFinish.onclick = () => navigate('explorer');

function renderTours() {
  const searchEl = $('search'), toursEl = $('tours');
  if (!toursEl) return;
  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const list = toursData.filter(t => (state.region === 'all' || t.region === state.region) && (!q || (t.title + t.desc).toLowerCase().includes(q)));
  
  toursEl.innerHTML = list.length ? list.map(t => `
    <div class="bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl overflow-hidden transition hover:border-goldWarm/40">
      <div class="h-36 bg-slate-900 relative"><img src="${t.image}" alt="${esc(t.title)}" class="w-full h-full object-cover opacity-90" onerror="this.remove()">
        <span class="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur text-goldWarm font-extrabold text-[10px] rounded-full border border-goldWarm/30">★ ${t.rating}</span>
      </div>
      <div class="p-4">
        <h4 class="font-bold text-xs text-white leading-snug">${esc(t.title)}</h4>
        <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${esc(t.desc)}</p>
        <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div><span class="text-slate-500 block text-[9px] font-medium">Gid: ${esc(t.guide)}</span><strong class="text-goldWarm text-xs font-black">${money(t.price)}</strong></div>
          <button data-book="${t.id}" class="px-4 py-2 bg-gradient-to-r from-goldWarm to-amber-400 text-slate-950 font-black text-[10px] rounded-xl shadow-md active:scale-95 transition">Bron qilish</button>
        </div>
      </div>
    </div>`).join('') : '<p class="text-xs text-slate-400 text-center py-8">Hech narsa topilmadi. Qidiruvni o‘zgartiring.</p>';
}

function setRegion(r) {
  state.region = r;
  document.querySelectorAll('[data-region]').forEach(b => {
    b.className = 'flex-1 py-2.5 rounded-xl text-xs transition-all ' + (b.dataset.region === r ? ON : OFF);
  });
  renderTours();
  logSql(`SELECT * FROM tours WHERE region='${r}'`);
}

const searchInput = $('search');
if (searchInput) searchInput.oninput = renderTours;

document.querySelectorAll('[data-region]').forEach(b => b.onclick = () => setRegion(b.dataset.region));

const toursContainer = $('tours');
if (toursContainer) {
  toursContainer.onclick = e => {
    const b = e.target.closest('[data-book]');
    if (b) openBooking(b.dataset.book);
  };
}

function openBooking(id) {
  const t = state.selectedTour = toursData.find(x => x.id === id);
  if (!t) return;
  state.guests = 1;
  if ($('bTitle')) $('bTitle').textContent = t.title;
  if ($('bDur')) $('bDur').textContent = t.duration;
  if ($('bPrice')) $('bPrice').textContent = money(t.price);
  if ($('bGuide')) $('bGuide').textContent = 'Gid: ' + t.guide;
  if ($('gCount')) $('gCount').textContent = '1 kishi';
  
  const bDate = $('bDate');
  if (bDate) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    bDate.min = new Date().toISOString().split('T')[0];
    bDate.value = d.toISOString().split('T')[0];
  }
  selectPay('click'); recalc(); navigate('booking');
}

function recalc() {
  if (state.selectedTour && $('bTotal')) {
    $('bTotal').textContent = money(state.selectedTour.price * state.guests);
  }
}

function selectPay(m) {
  state.pay = m;
  document.querySelectorAll('[data-pay]').forEach(b => {
    b.className = 'p-3 rounded-2xl text-[11px] font-bold transition ' + (b.dataset.pay === m ? 'border-2 border-goldWarm bg-goldWarm/10 text-goldWarm shadow-sm' : 'border border-white/10 bg-black/40 text-slate-300');
  });
}

const gMinus = $('gMinus'), gPlus = $('gPlus');
if (gMinus) gMinus.onclick = () => { state.guests = Math.max(1, state.guests - 1); if ($('gCount')) $('gCount').textContent = state.guests + ' kishi'; recalc(); };
if (gPlus) gPlus.onclick = () => { state.guests++; if ($('gCount')) $('gCount').textContent = state.guests + ' kishi'; recalc(); };

document.querySelectorAll('[data-pay]').forEach(b => b.onclick = () => selectPay(b.dataset.pay));

const backBtn = $('backBtn');
if (backBtn) backBtn.onclick = () => navigate('explorer');

const btnPay = $('btnPay');
if (btnPay) {
  btnPay.onclick = () => {
    const t = state.selectedTour, total = t.price * state.guests, ref = 'SW-' + Math.floor(10000 + Math.random() * 90000);
    state.bookings.push({ id: ref, title: t.title, amount: total, status: 'ON_HOLD', method: state.pay.toUpperCase() });
    logSql(`ESCROW_CREATE: ${total} UZS, booking=${ref}`);
    if ($('rCode')) $('rCode').textContent = ref;
    if ($('rAmount')) $('rAmount').textContent = money(total);
    if ($('rMethod')) $('rMethod').textContent = state.pay.toUpperCase();
    const receipt = $('receipt');
    if (receipt) receipt.classList.remove('hidden');
    renderDb();
  };
}

const rClose = $('rClose');
if (rClose) {
  rClose.onclick = () => {
    const receipt = $('receipt');
    if (receipt) receipt.classList.add('hidden');
    navigate('explorer');
  };
}

function updateInspector() {
  const inspUser = $('inspUser'), inspKyc = $('inspKyc');
  if (inspUser) inspUser.textContent = `${state.user.name} (${state.user.role})`;
  const ok = state.user.kyc === 'APPROVED';
  if (inspKyc) {
    inspKyc.textContent = ok ? 'APPROVED 🟢' : 'UNVERIFIED 🔴';
    inspKyc.className = 'text-xs font-bold ' + (ok ? 'text-emerald-400' : 'text-amber-400');
  }
}

function renderDb() {
  const row = h => `<div class="bg-sapphireCard p-2 rounded border border-slate-800 space-y-1 mb-1">${h}</div>`, u = state.user;
  const dbUsers = $('db-users'), dbKyc = $('db-kyc'), dbBookings = $('db-bookings');
  if (dbUsers) dbUsers.innerHTML = row(`<div class="text-goldWarm font-bold">id: ${u.id}</div><div>name: "${esc(u.name)}"</div><div>email: "${esc(u.email)}"</div><div>role: "${u.role}"</div>`);
  if (dbKyc) dbKyc.innerHTML = row(`<div>passport: "${state.passport || 'N/A'}"</div><div>status: '${u.kyc}'</div>`);
  if (dbBookings) {
    dbBookings.innerHTML = state.bookings.length ? state.bookings.map(b => row(`<div class="text-goldWarm font-bold">id: ${b.id}</div><div>tour: "${esc(b.title.slice(0, 20))}…"</div><div>amount: ${b.amount} UZS</div><div>escrow: ${b.status}</div>`)).join('') : '<div class="text-slate-500 italic">Hali bronlar yo‘q</div>';
  }
}

const langSelect = $('lang');
if (langSelect) langSelect.onchange = e => changeLanguage(e.target.value);

document.querySelectorAll('[data-nav]').forEach(b => {
  b.onclick = () => navigate(b.dataset.nav);
});

changeLanguage('uz');
setAuthMode('login');
setRegion('all');
renderDb();
navigate('auth');
logSql('INIT elite luxury enterprise session');