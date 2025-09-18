document.addEventListener('DOMContentLoaded', () => {
    const skinTypeBtn = document.getElementById('skinTypeBtn');
    const skinCard = document.getElementById('skinCard');
    const closeCard = document.getElementById('closeCard');

    function openCard() {
        skinCard.classList.remove('hidden');
        requestAnimationFrame(() => skinCard.classList.add('visible'));
    }

    function closeCardFn() {
        skinCard.classList.remove('visible');
        setTimeout(() => skinCard.classList.add('hidden'), 300);
    }

    skinTypeBtn.addEventListener('click', () => {
        if (skinCard.classList.contains('hidden')) {
            openCard();
        } else {
            closeCardFn();
        }
    });

    closeCard.addEventListener('click', closeCardFn);

    /* ------- 페이지 관리 ------- */
    let currentPageIdx = 0; // zero-based
    const pagesWrapper = document.getElementById('pagesWrapper');
    const pageIndicators = document.getElementById('pageIndicators');
    const editOverlay = document.getElementById('editOverlay');
    const addPageBtn = document.getElementById('addPageBtn');
    const deletePageBtn = document.getElementById('deletePageBtn');
    const bottomNav = document.querySelector('.bottom-nav');
    const pageView = document.getElementById('pageView');
    const analysisView = document.getElementById('analysisView');
    const app = document.querySelector('.app');
    const recordView = document.getElementById('recordView');
    const menuView = document.getElementById('menuView');
    const shopView = document.getElementById('shopView');

    const loginBtn = document.getElementById('loginBtn');
    const loginView = document.getElementById('loginView');
    const loginClose = document.getElementById('loginClose');
    const loginFrame = document.getElementById('loginFrame');

    // ---- Supabase 세션 유틸 (로컬스토리지 기반) ----
    function readSupabaseSession(){
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k) continue;
                if (/^sb-.*-auth-token$/.test(k)) {
                    const raw = localStorage.getItem(k);
                    if (!raw) continue;
                    const parsed = JSON.parse(raw);
                    const s = parsed && (parsed.currentSession || parsed.session || parsed);
                    if (s && s.user && s.user.email) {
                        return { storageKey: k, session: s };
                    }
                }
            }
        } catch (_) {}
        return null;
    }

    function clearSupabaseSessions(){
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && /^sb-/.test(k)) keys.push(k);
            }
            keys.forEach(k => localStorage.removeItem(k));
        } catch (_) {}
    }

    function openLoginOverlay(path){
        const { base } = resolveNextBase();
        loginFrame.src = base + (path || '/login');
        app.classList.remove('analysis-mode');
        pageView.classList.add('hidden');
        shopView.classList.add('hidden');
        analysisView.classList.add('hidden');
        menuView.classList.add('hidden');
        loginView.classList.remove('hidden');
        loginView.classList.add('visible');
    }

    function bindLoginButton(){
        const btn = document.getElementById('loginBtn');
        if (!btn) return;
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        const entry = readSupabaseSession();
        const isLoggedIn = !!(entry && entry.session && entry.session.user);
        clone.textContent = isLoggedIn ? '로그아웃' : '로그인';
        if (isLoggedIn) {
            clone.addEventListener('click', () => {
                clearSupabaseSessions();
                window.location.href = '/';
            });
        } else {
            clone.addEventListener('click', () => openLoginOverlay('/login'));
        }
    }

    function bindSettingsAuthButtons(){
        const card = document.querySelector('.settings-login-card');
        if (!card) return;
        const btns = card.querySelectorAll('button');
        const loginBtnEl = btns[0];
        const signupBtnEl = btns[1];
        if (!loginBtnEl || !signupBtnEl) return;
        loginBtnEl.replaceWith(loginBtnEl.cloneNode(true));
        signupBtnEl.replaceWith(signupBtnEl.cloneNode(true));
        const entry = readSupabaseSession();
        const isLoggedIn = !!(entry && entry.session && entry.session.user);
        const [loginBtnNew, signupBtnNew] = card.querySelectorAll('button');
        if (isLoggedIn) {
            // 로그인 상태: 두 버튼 모두 숨김 (요구사항)
            signupBtnNew.style.display = 'none';
            loginBtnNew.style.display = 'none';
        } else {
            signupBtnNew.style.display = '';
            loginBtnNew.textContent = '로그인';
            loginBtnNew.addEventListener('click', () => openLoginOverlay('/login'));
            signupBtnNew.addEventListener('click', () => openLoginOverlay('/signup'));
        }
    }

    function updateUserEmailUI(){
        const entry = readSupabaseSession();
        const email = entry && entry.session && entry.session.user && entry.session.user.email ? entry.session.user.email : '';
        const emailSpan = menuView && menuView.querySelector('.menu-bar span');
        if (emailSpan) emailSpan.textContent = email || '';
        const settingsEmail = document.getElementById('settingsEmail');
        if (settingsEmail) settingsEmail.textContent = email || '';
    }

    function updateAuthUI(){
        bindLoginButton();
        bindSettingsAuthButtons();
        updateUserEmailUI();
    }

    function resolveNextBase() {
        const isFile = window.location.protocol === 'file:';
        const metaEl = document.querySelector('meta[name="next-base-url"]');
        const meta = metaEl && typeof metaEl.content === 'string' ? metaEl.content.trim() : '';
        const hinted = (typeof window.NEXT_BASE_URL === 'string' && window.NEXT_BASE_URL.trim()) ? window.NEXT_BASE_URL.trim() : '';
        const stored = (localStorage.getItem('NEXT_BASE_URL') || '').trim();
        const origin = (!isFile && window.location.origin && /^https?:/.test(window.location.origin)) ? window.location.origin : '';
        const base = (meta || hinted || stored || origin || 'https://skin-ai-gpt.vercel.app').replace(/\/$/, '');
        return { base, isFile, hasConfigured: !!(meta || hinted || stored || origin) };
    }

    function navigateToNext(destPath) {
        const { base } = resolveNextBase();
        window.location.href = base + destPath;
    }

    // 로그인 UI 초기화/토글
    updateAuthUI();

    if (loginClose && loginView) {
        loginClose.addEventListener('click', () => {
            loginView.classList.remove('visible');
            loginView.classList.add('hidden');
            loginFrame.src = '';
            pageView.classList.remove('hidden');
            // 오버레이 닫힐 때 세션 상태 반영
            updateAuthUI();
        });
    }

    // 다른 탭/iframe에서 세션 변경 시 UI 동기화
    window.addEventListener('storage', (e)=>{
        if (e && e.key && /^sb-.*-auth-token$/.test(e.key)) {
            updateAuthUI();
        }
    });

    // 설정 화면 로그인/회원가입 버튼 연결
    const settingsLoginCard = document.querySelector('.settings-login-card');
    if (settingsLoginCard) {
        const btns = settingsLoginCard.querySelectorAll('button');
        const settingsLoginBtn = btns[0];
        const settingsSignupBtn = btns[1];
        if (settingsLoginBtn) {
            settingsLoginBtn.addEventListener('click', () => {
                const { base } = resolveNextBase();
                window.location.href = base + '/login';
            });
        }
        if (settingsSignupBtn) {
            settingsSignupBtn.addEventListener('click', () => {
                const { base } = resolveNextBase();
                window.location.href = base + '/signup';
            });
        }
    }

    const PAGES = [];

    function createPage(num) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.textContent = num;
        pagesWrapper.appendChild(pageDiv);
        return pageDiv;
    }

    // 최초 페이지 생성
    PAGES.push(createPage(1));

    // 저장된 페이지 수 복원
    const savedCountRaw = localStorage.getItem('pageCount');
    const savedCount = Math.max(1, parseInt(savedCountRaw || '1', 10));
    for (let i = 2; i <= savedCount; i++) {
        PAGES.push(createPage(i));
    }

    function updateIndicators() {
        pageIndicators.innerHTML = '';
        PAGES.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = 'indicator-dot' + (idx === currentPageIdx ? ' active' : '');
            pageIndicators.appendChild(dot);
        });
    }

    function refreshPage() {
        const offset = -currentPageIdx * pagesWrapper.offsetWidth;
        pagesWrapper.style.transform = `translateX(${offset}px)`;
        PAGES.forEach((pg, idx) => pg.textContent = idx + 1);
        deletePageBtn.disabled = PAGES.length === 1;
        updateIndicators();
        renderPageList();
        saveCount();
    }

    bottomNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-btn');
        if (!btn) return;
        const label = btn.dataset.label;
        if (label === '상점') {
            app.classList.remove('analysis-mode');
            pageView.classList.add('hidden');
            shopView.classList.remove('hidden');
            analysisView.classList.add('hidden');
        } else if (label === '분석') {
            app.classList.add('analysis-mode');
            analysisView.classList.remove('hidden');
            document.querySelectorAll('.analysis-nav-btn').forEach((b, i)=>{
               b.classList.toggle('active', i===0);
            });
            recordView.classList.add('hidden');
        } else if(label==='메뉴'){
           menuView.classList.remove('hidden');
           pageView.classList.add('hidden');
           shopView.classList.add('hidden');
           analysisView.classList.add('hidden');
           app.classList.remove('analysis-mode');
        } else {
            app.classList.remove('analysis-mode');
            analysisView.classList.add('hidden');
            shopView.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e)=>{
        const b = e.target.closest('.analysis-nav-btn');
        if (!b) return;
        document.querySelectorAll('.analysis-nav-btn').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        if (b.textContent === '기록') {
            recordView.classList.remove('hidden');
            document.querySelector('.analysis-buttons').style.display = 'none';
            document.getElementById('routineView').classList.add('hidden');
        } else {
            recordView.classList.add('hidden');
            if (b.textContent === '루틴') {
                document.getElementById('routineView').classList.remove('hidden');
                document.getElementById('productView').classList.add('hidden');
                document.querySelector('.analysis-buttons').style.display = 'none';
            } else {
                document.getElementById('routineView').classList.add('hidden');
                if(b.textContent==='내 제품'){
                  document.getElementById('productView').classList.remove('hidden');
                  document.getElementById('shopView').classList.add('hidden');
                  document.querySelector('.analysis-buttons').style.display='none';
                } else {
                  if(b.textContent==='상점'){
                     document.getElementById('shopView').classList.remove('hidden');
                     document.getElementById('productView').classList.add('hidden');
                     document.getElementById('routineView').classList.add('hidden');
                     recordView.classList.add('hidden');
                     document.querySelector('.analysis-buttons').style.display='none';
                  } else {
                     document.getElementById('shopView').classList.add('hidden');
                  }
                  document.getElementById('productView').classList.add('hidden');
                  document.querySelector('.analysis-buttons').style.display='flex';
                }
            }
        }
    });

    function saveCount() {
        localStorage.setItem('pageCount', PAGES.length);
    }

    /* ---------- Page list in edit panel for reorder ---------- */
    const pageListEl = document.getElementById('pageList');

    function renderPageList() {
        pageListEl.innerHTML = '';
        PAGES.forEach((_, idx) => {
            const li = document.createElement('li');
            li.textContent = `페이지 ${idx + 1}`;
            li.draggable = true;
            li.dataset.idx = idx;
            pageListEl.appendChild(li);
        });
    }

    // ----- 드래그로 순서 변경 -----
    let dragSrcIdx = null;

    pageListEl.addEventListener('dragstart', e => {
        const li = e.target.closest('li');
        if (!li) return;
        dragSrcIdx = Number(li.dataset.idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrcIdx);
    });

    pageListEl.addEventListener('dragover', e => {
        e.preventDefault();
    });

    pageListEl.addEventListener('drop', e => {
        e.preventDefault();
        const li = e.target.closest('li');
        if (!li || dragSrcIdx === null) return;
        const tgtIdx = Number(li.dataset.idx);
        if (dragSrcIdx === tgtIdx) return;

        const [moved] = PAGES.splice(dragSrcIdx, 1);
        PAGES.splice(tgtIdx, 0, moved);
        currentPageIdx = tgtIdx;

        pagesWrapper.innerHTML = '';
        PAGES.forEach(pg => pagesWrapper.appendChild(pg));
        renderPageList();
        refreshPage();
        saveCount();
        dragSrcIdx = null;
    });

    /* Long press detection on main area */
    let pressTimer;
    const mainDisplay = document.querySelector('.main-display');

    function startPressTimer() {
        pressTimer = setTimeout(() => {
            openEditOverlay();
        }, 600); // 600ms long press
    }

    function clearPressTimer() {
        clearTimeout(pressTimer);
    }

    mainDisplay.addEventListener('touchstart', startPressTimer);
    mainDisplay.addEventListener('mousedown', startPressTimer);

    ['touchend', 'touchmove', 'mouseup', 'mouseleave'].forEach(evt => {
        mainDisplay.addEventListener(evt, clearPressTimer);
    });

    function openEditOverlay() {
        editOverlay.classList.remove('hidden');
        requestAnimationFrame(() => editOverlay.classList.add('visible'));
    }

    function closeEditOverlay() {
        editOverlay.classList.remove('visible');
        setTimeout(() => editOverlay.classList.add('hidden'), 300);
    }

    editOverlay.addEventListener('click', e => {
        if (e.target === editOverlay) closeEditOverlay();
    });

    addPageBtn.addEventListener('click', () => {
        const pageDiv = createPage(PAGES.length + 1);
        PAGES.push(pageDiv);
        currentPageIdx = PAGES.length - 1;
        refreshPage();
    });

    deletePageBtn.addEventListener('click', () => {
        if (PAGES.length === 1) return; // safeguard
        PAGES.pop();
        pagesWrapper.removeChild(pagesWrapper.lastChild);
        currentPageIdx = Math.max(0, currentPageIdx - 1);
        refreshPage();
        localStorage.setItem('pageCount', PAGES.length);
    });

    /* -------- Swipe navigation -------- */
    let startX;
    let isMouseDown = false;
    pagesWrapper.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    pagesWrapper.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) < 50) return;
        if (diff < 0 && currentPageIdx < PAGES.length - 1) currentPageIdx++;
        if (diff > 0 && currentPageIdx > 0) currentPageIdx--;
        refreshPage();
    });

    // PC 마우스 스와이프
    pagesWrapper.addEventListener('mousedown', e => {
        isMouseDown = true;
        startX = e.clientX;
    });
    document.addEventListener('mouseup', e => {
        if (!isMouseDown) return;
        isMouseDown = false;
        const diff = e.clientX - startX;
        if (Math.abs(diff) < 50) return;
        if (diff < 0 && currentPageIdx < PAGES.length - 1) currentPageIdx++;
        if (diff > 0 && currentPageIdx > 0) currentPageIdx--;
        refreshPage();
    });

    updateIndicators();
    renderPageList();
    refreshPage();

    /* -------- 기록 화면: 체크박스/색/빈 그래프/스와이프 -------- */
    const metricColors = {
        '수분': '#3ad5e6',
        '유분': '#e6de00',
        '트러블': '#ff6b6b',
        '홍조': '#f0932b',
        '민감성': '#6c5ce7',
        '모공': '#2ecc71',
        '주름': '#8e44ad',
        '피부균일': '#00b894',
        '탄력': '#0984e3',
        '잡티': '#d35400'
    };

    const recordChart = document.getElementById('recordChart');
    const ctx = recordChart.getContext('2d');

    function resizeRecordCanvas(){
        const zone = document.getElementById('recordChartZone');
        if(!zone) return;
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = zone.clientWidth;
        const cssHeight = Math.max(150, Math.round(cssWidth * 0.75));
        recordChart.style.width = cssWidth + 'px';
        recordChart.style.height = cssHeight + 'px';
        recordChart.width = Math.floor(cssWidth * dpr);
        recordChart.height = Math.floor(cssHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawEmptyChart();
    }

    const recordDates = document.getElementById('recordDates');
    const legendContainer = document.querySelector('.record-legend');

    function drawEmptyChart() {
        const w = recordChart.width / (window.devicePixelRatio||1);
        const h = recordChart.height / (window.devicePixelRatio||1);
        ctx.clearRect(0, 0, w, h);
        ctx.clearRect(0, 0, recordChart.width, recordChart.height);
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const paddingL = 24; const paddingB = 20; const paddingT = 10;
        ctx.moveTo(paddingL, paddingT);
        ctx.lineTo(paddingL, h - paddingB);
        ctx.lineTo(w - 10, h - paddingB);
        ctx.moveTo(20, 10);
        ctx.lineTo(20, 150);
        ctx.lineTo(250, 150);
        ctx.stroke();
    }

    function setDatesWindow(offsetDays) {
        const base = new Date();
        base.setDate(base.getDate() + offsetDays);
        const labels = [];
        let prevMonth;
        for (let i = 6; i >= 0; i--) {
            const d = new Date(base);
            d.setDate(base.getDate() - i);
            const m = d.getMonth() + 1;
            const day = d.getDate();
            if (labels.length === 0) {
                labels.push(`${m}/${day}`);
            } else if (prevMonth !== undefined && m !== prevMonth) {
                labels.push(`${m}/${day}`);
            } else {
                labels.push(`${day}`);
            }
            prevMonth = m;
        }
        recordDates.innerHTML = '';
        labels.forEach(text => {
            const s = document.createElement('span');
            s.textContent = text;
            recordDates.appendChild(s);
        });
    }

    let recordStartOffset = 0;
    const chartZone = document.getElementById('recordChartZone');
    let startXRecord;
    chartZone.addEventListener('touchstart', e => { startXRecord = e.touches[0].clientX; });
    chartZone.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startXRecord;
        if (Math.abs(diff) < 40) return;
        recordStartOffset += diff < 0 ? 7 : -7;
        setDatesWindow(recordStartOffset);
        drawEmptyChart();
    });
    chartZone.addEventListener('mousedown', e => { startXRecord = e.clientX; });
    document.addEventListener('mouseup', e => {
        if (startXRecord == null) return;
        const diff = e.clientX - startXRecord;
        startXRecord = null;
        if (Math.abs(diff) < 40) return;
        recordStartOffset += diff < 0 ? 7 : -7;
        setDatesWindow(recordStartOffset);
        drawEmptyChart();
    });

    legendContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const color = metricColors[cb.value] || '#000';
        try { cb.style.accentColor = color; } catch (_) {}
        cb.addEventListener('change', () => {
            drawEmptyChart();
        });
    });

    setDatesWindow(0);
    resizeRecordCanvas();
    window.addEventListener('resize', resizeRecordCanvas);
    drawEmptyChart();

    /* ---------- 루틴: 모드 토글/버튼 노출 ---------- */
    const routineView = document.getElementById('routineView');
    const routineModeBtn = document.getElementById('routineModeBtn');
    const routineModeMenu = document.getElementById('routineModeMenu');

    routineModeBtn.addEventListener('click', () => {
        routineModeMenu.classList.toggle('hidden');
    });

    routineModeMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('.mode-btn');
        if (!btn) return;
        routineModeMenu.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active','remove'));
        btn.classList.add('active');
        routineView.classList.remove('mode-add','mode-remove');
        if (btn.dataset.mode === 'add') {
            routineView.classList.add('mode-add');
        } else if (btn.dataset.mode === 'remove') {
            routineView.classList.add('mode-remove');
            btn.classList.add('remove');
        }
        routineModeMenu.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        const within = e.target.closest('#routineModeMenu') || e.target.closest('#routineModeBtn');
        if (!within) routineModeMenu.classList.add('hidden');
    });

    /* ---------- 내 제품 로직 ---------- */
    const productAddBtn = document.getElementById('productAddBtn');
    const productListEl = document.getElementById('productList');

    function loadProducts() {
        const saved = JSON.parse(localStorage.getItem('productList')||'[]');
        saved.forEach(p=>renderProductCard(p.brand,p.name));
    }

    function saveProducts() {
        const arr=[];
        productListEl.querySelectorAll('.product-card').forEach(card=>{
            arr.push({brand:card.dataset.brand,name:card.dataset.name});
        });
        localStorage.setItem('productList',JSON.stringify(arr));
    }

    function renderProductCard(brand,name,img){
        const card=document.createElement('div');
        card.className='product-card';
        card.dataset.brand=brand;card.dataset.name=name;
        const thumbHtml= img?`<img class="product-thumb" src="${img}">`:`<div class="product-thumb placeholder">＋</div>`;
        card.innerHTML=`${thumbHtml}<h4>${brand}</h4><p>${name}</p><button class="remove">－</button>`;
        card.querySelector('.remove').addEventListener('click',()=>{
            card.remove();
            saveProducts();
        });
        productListEl.appendChild(card);
    }

    function createInputCard(){
        const wrap=document.createElement('div');
        wrap.className='product-input';
        wrap.innerHTML=`<label class="img-btn" title="이미지 추가">＋<input type="file" accept="image/*" style="display:none"></label><div class="fields"><input placeholder="브랜드"/><input placeholder="제품명"/></div><button class="save">저장</button>`;
        const fileInput=wrap.querySelector('input[type="file"]');
        const brandI=wrap.querySelector('.fields input:nth-child(1)');
        const nameI=wrap.querySelector('.fields input:nth-child(2)');
        let imgData='';
        fileInput.addEventListener('change',e=>{
           const f=e.target.files[0];if(!f)return;
           const reader=new FileReader();
           reader.onload=ev=>{imgData=ev.target.result;};
           reader.readAsDataURL(f);
        });
        wrap.querySelector('.save').addEventListener('click',()=>{
            const b=brandI.value.trim(), n=nameI.value.trim();
            if(!b||!n)return;
            renderProductCard(b,n,imgData);
            saveProducts();
            wrap.remove();
        });
        productListEl.prepend(wrap);
        brandI.focus();
    }

    productAddBtn.addEventListener('click',()=>{
        if(productListEl.querySelector('.product-input'))return;
        createInputCard();
    });

    loadProducts();
});

document.addEventListener('DOMContentLoaded', () => {
  const menuViewLocal = document.getElementById('menuView');
  menuViewLocal.addEventListener('click', e => {
    const c = e.target.closest('.circle-btn');
    if (!c || c.classList.contains('disabled')) return;
    const dest = c.dataset.go;
    const appEl = document.querySelector('.app');
    const analysisViewEl = document.getElementById('analysisView');
    const pageViewEl = document.getElementById('pageView');
    const shopViewEl = document.getElementById('shopView');
    menuViewLocal.classList.add('hidden');
    if (dest === 'analysis') {
      appEl.classList.add('analysis-mode');
      analysisViewEl.classList.remove('hidden');
      pageViewEl.classList.add('hidden');
      shopViewEl.classList.add('hidden');
    } else if (dest === 'shop') {
      appEl.classList.remove('analysis-mode');
      shopViewEl.classList.remove('hidden');
      analysisViewEl.classList.add('hidden');
      pageViewEl.classList.add('hidden');
    } else if (dest === 'alarm') {
      appEl.classList.remove('analysis-mode');
      document.getElementById('alarmView').classList.remove('hidden');
      analysisViewEl.classList.add('hidden');
      pageViewEl.classList.add('hidden');
      shopViewEl.classList.add('hidden');
    } else if(dest==='settings'){
      appEl.classList.remove('analysis-mode');
      document.getElementById('settingsView').classList.remove('hidden');
      analysisViewEl.classList.add('hidden');
      pageViewEl.classList.add('hidden');
      shopViewEl.classList.add('hidden');
    }
  });
});

// ------- 알람 리스트 저장/렌더/수정 로직 -------
document.addEventListener('DOMContentLoaded', () => {
  const alarmView = document.getElementById('alarmView');
  const alarmFormView = document.getElementById('alarmFormView');
  const alarmList = document.getElementById('alarmList');
  const addBtn = document.querySelector('.alarm-add');
  const saveBtn = document.getElementById('alarmSaveBtn');
  const cancelBtn = document.getElementById('alarmCancelBtn');

  let editingIndex = null;
  const KEY = 'alarms';

  function pad2(n){ return String(n).padStart(2,'0'); }

  function loadAlarms(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function saveAlarms(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

  function renderAlarms(){
    alarmList.innerHTML='';
    const alarms = loadAlarms();
    alarms.forEach((a, idx) => {
      if(!a || !a.start || !a.end) return;
      const dayNames = ['일','월','화','수','목','금','토'];
      const days = Array.isArray(a.days) ? a.days : [];
      const daysHtml = dayNames.map((d,i)=>`<span class="day ${days.includes(i)?'active':''}">${d}</span>`).join(' ');
      const card = document.createElement('div');
      card.className = 'alarm-card';
      card.dataset.idx = String(idx);
      card.innerHTML = `
        <div class="alarm-days">${daysHtml}</div>
        <div class="alarm-time-center">
          <span class="ampm">${a.start.am?'오전':'오후'}</span>
          <span>${pad2(a.start.h)}:${pad2(a.start.m)}</span>
          <span class="tilde">~</span>
          <span class="ampm">${a.end.am?'오전':'오후'}</span>
          <span>${pad2(a.end.h)}:${pad2(a.end.m)}</span>
        </div>
      `;
      alarmList.appendChild(card);
    });
  }

  function toMinutes(target){
    const grp = alarmFormView.querySelector(`.ampm-group[data-target="${target}"]`);
    const am = grp.querySelector('.ampm-btn.active').dataset.value == 'AM';
    const [hhEl, mmEl] = alarmFormView.querySelectorAll(`.time-inputs[data-target="${target}"] .time-num`);
    const hh = parseInt(hhEl.value || '0', 10);
    const mm = parseInt(mmEl.value || '0', 10);
    let h24 = hh % 12; if(!am) h24 += 12;
    return { am, h: hh%12===0? (am?12:hh) : hh%12, m: mm%60, minutes: h24*60 + (mm%60) };
  }

  function fillForm(a){
    if(!a || !a.start || !a.end){
      a = { start:{am:true,h:6,m:0}, end:{am:true,h:9,m:0}, days:[] };
    }
    ['start','end'].forEach(key=>{
      const grp = alarmFormView.querySelector(`.ampm-group[data-target="${key}"]`);
      grp.querySelectorAll('.ampm-btn').forEach(b=>b.classList.remove('active'));
      grp.querySelector(`.ampm-btn[data-value="${a[key].am?'AM':'PM'}"]`).classList.add('active');
      const [hhEl, mmEl] = alarmFormView.querySelectorAll(`.time-inputs[data-target="${key}"] .time-num`);
      hhEl.value = pad2(a[key].h);
      mmEl.value = pad2(a[key].m);
    });
    alarmFormView.querySelectorAll('.weekday-btn').forEach((b,i)=>{
      b.classList.toggle('active', a.days.includes(i));
    });
    document.getElementById('repeatAll').checked = a.days.length===7;
  }

  function openFormNew(){
    editingIndex = null;
    fillForm({ start:{am:true,h:6,m:0}, end:{am:true,h:9,m:0}, days:[] });
    saveBtn.textContent = '저장';
    alarmView.classList.add('hidden');
    alarmFormView.classList.remove('hidden');
  }

  function openFormForEdit(index){
    const list = loadAlarms();
    const a = list && typeof index==='number' ? list[index] : null;
    if(!a){
      editingIndex = null;
      fillForm(null);
      saveBtn.textContent = '저장';
    } else {
      editingIndex = index;
      fillForm(a);
      saveBtn.textContent = '수정';
    }
    alarmView.classList.add('hidden');
    alarmFormView.classList.remove('hidden');
  }

  if(addBtn){ addBtn.addEventListener('click', openFormNew); }

  cancelBtn.addEventListener('click', () => {
    alarmFormView.classList.add('hidden');
    alarmView.classList.remove('hidden');
  });

  alarmFormView.addEventListener('click', (e) => {
    const btn = e.target.closest('.ampm-btn');
    if (!btn) return;
    const group = btn.parentElement;
    group.querySelectorAll('.ampm-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  alarmFormView.querySelectorAll('.time-num').forEach(inp => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 2);
    });
  });

  const allChk = document.getElementById('repeatAll');
  const dayBtns = alarmFormView.querySelectorAll('.weekday-btn');
  allChk.addEventListener('change', () => {
    dayBtns.forEach(b => b.classList.toggle('active', allChk.checked));
  });
  dayBtns.forEach(b => b.addEventListener('click', () => {
    b.classList.toggle('active');
  }));

  saveBtn.addEventListener('click', () => {
    const s = toMinutes('start');
    const e = toMinutes('end');
    let diff = e.minutes - s.minutes;
    if (diff <= 0) diff += 24*60;
    if (diff > 180) { alert('시간 범위는 최대 3시간까지 지정 가능합니다.'); return; }

    const days=[]; dayBtns.forEach((b,i)=>{ if(b.classList.contains('active')) days.push(i); });

    const data = {
      start: { am:s.am, h:s.h, m:s.m },
      end:   { am:e.am, h:e.h, m:e.m },
      days
    };

    const arr = loadAlarms();
    if(editingIndex===null){ arr.push(data); } else { arr[editingIndex]=data; }
    saveAlarms(arr);

    alarmFormView.classList.add('hidden');
    alarmView.classList.remove('hidden');
    renderAlarms();
  });

  renderAlarms();

  const hamburger = document.querySelector('#alarmView .hamburger');

  let editMode = false;
  let reorderActive = false;
  let pressStarted = false;
  let confirmOpen = null;
  let sortable = null;

  hamburger.addEventListener('click', () => {
    editMode = !editMode;
    if (!editMode) reorderActive = false;
    alarmView.classList.toggle('edit-mode', editMode);
    alarmView.classList.toggle('reorder-mode', false);
    hamburger.textContent = editMode ? '저장' : '≡';
    if (confirmOpen) { const box = confirmOpen.querySelector('.confirm-box'); if (box) box.remove(); confirmOpen = null; }
    if (editMode) {
      enableSortable();
    } else {
      disableSortable();
      persistCurrentOrder();
      renderAlarms();
    }
  });

  function setCardsDraggable(on){
    alarmList.querySelectorAll('.alarm-card').forEach(card => {
      card.draggable = !!on;
    });
  }

  function persistCurrentOrder(){
    const arr=[];
    alarmList.querySelectorAll('.alarm-card').forEach(card=>{
      const idx=Number(card.dataset.idx);
      const all=loadAlarms();
      arr.push(all[idx]);
    });
    saveAlarms(arr);
  }

  const _renderAlarms = renderAlarms;
  renderAlarms = function(){
    alarmList.innerHTML='';
    const alarms=loadAlarms();
    alarms.forEach((a,idx)=>{
      if(!a){ return; }
      const card=document.createElement('div');
      card.className='alarm-card';
      card.dataset.idx=String(idx);
      const dayNames=['일','월','화','수','목','금','토'];
      const days=(Array.isArray(a.days)?a.days:[]);
      const daysHtml=dayNames.map((d,i)=>`<span class=\"day ${days.includes(i)?'active':''}\">${d}</span>`).join(' ');
      card.innerHTML=`
        <div class='alarm-days'>${daysHtml}</div>
        <div class='alarm-time-center'>
          <span class='ampm'>${a.start.am?'오전':'오후'}</span>
          <span>${String(a.start.h).padStart(2,'0')}:${String(a.start.m).padStart(2,'0')}</span>
          <span class='tilde'>~</span>
          <span class='ampm'>${a.end.am?'오전':'오후'}</span>
          <span>${String(a.end.h).padStart(2,'0')}:${String(a.end.m).padStart(2,'0')}</span>
        </div>`;

      let pressTimer;
      const startPress = ()=>{
        if(!editMode) return;
        pressStarted = true;
        card.classList.add('reorder-ready');
        pressTimer = setTimeout(()=>{
          reorderActive = true;
          setCardsDraggable(true);
          card.draggable = true;
          alarmView.classList.add('reorder-mode');
        },150);
      };
      const clearPress = ()=>{ clearTimeout(pressTimer); card.classList.remove('reorder-ready'); pressStarted=false; };
      card.addEventListener('pointerdown', startPress);
      card.addEventListener('pointerup', clearPress);
      card.addEventListener('pointerleave', clearPress);

      card.addEventListener('dragstart', e=>{
        if(!reorderActive){ e.preventDefault(); return; }
        e.dataTransfer.effectAllowed='move';
        e.dataTransfer.setData('text/plain', e.currentTarget.dataset.idx);
        card.classList.add('dragging');
      });
      card.addEventListener('dragover', e=>{ if(reorderActive){ e.preventDefault(); } });
      card.addEventListener('drop', e=>{
        if(!reorderActive) return;
        e.preventDefault();
        const fromIdx=Number(e.dataTransfer.getData('text/plain'));
        const toIdx=Number(e.currentTarget.dataset.idx);
        if(fromIdx===toIdx) return;
        const arr=loadAlarms();
        const [moved]=arr.splice(fromIdx,1);
        arr.splice(toIdx,0,moved);
        saveAlarms(arr);
        renderAlarms();
        editMode=true; reorderActive=true; alarmView.classList.add('edit-mode'); hamburger.textContent='저장';
        setCardsDraggable(true);
      });
      card.addEventListener('dragend', ()=>{ card.classList.remove('dragging'); });

      alarmList.appendChild(card);
    });
    if (editMode) enableSortable(); else disableSortable();
  }

  alarmList.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.confirm-btn.danger');
    if (delBtn) {
      e.stopPropagation();
      const card = delBtn.closest('.alarm-card');
      const idx = Number(card.dataset.idx);
      const arr = loadAlarms();
      arr.splice(idx,1);
      saveAlarms(arr);
      renderAlarms();
      editMode = true; alarmView.classList.add('edit-mode'); hamburger.textContent='저장';
      confirmOpen = null;
      return;
    }
    const cancelBtn = e.target.closest('.confirm-btn.ghost');
    if (cancelBtn) {
      e.stopPropagation();
      const box = cancelBtn.closest('.confirm-box');
      if (box) box.remove();
      confirmOpen = null;
      return;
    }
    const card = e.target.closest('.alarm-card');
    if (!card) return;
    if (pressStarted || reorderActive) return;
    const idx = Number(card.dataset.idx);
    if (!editMode) {
      openFormForEdit(idx);
      return;
    }
    if (confirmOpen && confirmOpen !== card) {
      const boxPrev = confirmOpen.querySelector('.confirm-box');
      if (boxPrev) boxPrev.remove();
      confirmOpen = null;
    }
    showDeleteConfirm(card, idx);
  });

  function showDeleteConfirm(card, idx){
    const exist = card.querySelector('.confirm-box');
    if (exist) { exist.remove(); confirmOpen = null; }
    const box = document.createElement('div');
    box.className = 'confirm-box';
    box.innerHTML = `
      <span>삭제하겠습니까?</span>
      <div class='confirm-actions'>
        <button class='confirm-btn ghost'>취소</button>
        <button class='confirm-btn danger'>삭제</button>
      </div>`;
    const [cancelBtn, delBtn] = box.querySelectorAll('button');
    cancelBtn.addEventListener('click', (e)=>{ e.stopPropagation(); box.remove(); confirmOpen=null; });
    delBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const arr = loadAlarms();
      arr.splice(idx,1);
      saveAlarms(arr);
      renderAlarms();
      editMode = true; alarmView.classList.add('edit-mode'); hamburger.textContent='저장';
      confirmOpen=null;
    });
    card.appendChild(box);
    confirmOpen = card;
  }

  function enableSortable(){
    if (sortable) { sortable.option('disabled', false); return; }
    if (!window.Sortable) return;
    sortable = Sortable.create(alarmList, {
      animation: 150,
      handle: '.alarm-card',
      delay: 500,
      delayOnTouchOnly: true,
      draggable: '.alarm-card',
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      chosenClass: 'alarm-chosen',
      dragClass: 'alarm-drag',
      ghostClass: 'alarm-ghost',
      onStart: () => { reorderActive = true; },
      onEnd: () => {
        reorderActive = false;
        persistByDOMOrder();
        editMode = true; alarmView.classList.add('edit-mode'); hamburger.textContent='저장';
        if (confirmOpen) { const box = confirmOpen.querySelector('.confirm-box'); if (box) box.remove(); confirmOpen = null; }
      }
    });
  }

  function disableSortable(){ if (sortable) sortable.option('disabled', true); }

  function persistByDOMOrder(){
    const newArr=[]; const all=loadAlarms();
    alarmList.querySelectorAll('.alarm-card').forEach(card=>{
      const idx = Number(card.dataset.idx);
      newArr.push(all[idx]);
    });
    saveAlarms(newArr);
    renderAlarms();
  }
});


