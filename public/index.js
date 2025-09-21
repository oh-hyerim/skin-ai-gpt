// 요구 HTML:
// <button id="alarmCancelBtn" class="alarm-cancel">취소</button>
// <div id="alarmFormView">…</div>
// <div id="alarmView" class="hidden">…</div>

function onReady(fn){
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
}

// 안전 선택자 & 리스너 (초기화 블록에서 사용)
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const on = (el, type, handler, opts) => { if (el) el.addEventListener(type, handler, opts); };

// 편집 중인 아이템의 인덱스 (없으면 null)
let editingIndex = null;

// 알람 UI 초기화 중복 방지
let alarmInitDone = false;

onReady(() => {
    function openCard() {
        const card = document.getElementById('skinCard');
        if (!card) return;
        card.classList.remove('hidden');
        // give small async tick to allow CSS transition
        requestAnimationFrame(() => card.classList.add('visible'));
    }

    function closeCardFn() {
        const card = document.getElementById('skinCard');
        if (!card) return;
        card.classList.remove('visible');
        // after transition ends, hide element
        setTimeout(() => card.classList.add('hidden'), 300);
    }

    // Delegate clicks to avoid null references before React mounts
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#skinTypeBtn');
        if (toggleBtn) {
            const card = document.getElementById('skinCard');
            if (!card) return;
            if (card.classList.contains('hidden')) {
                openCard();
            } else {
                closeCardFn();
            }
        }
        if (e.target.closest('#closeCard')) {
            closeCardFn();
        }
    });

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
                    // 다양한 포맷 대비
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

	// 인증 정보 보조 저장소 (교차 출처일 때 세션 키 공유 불가 대비)
	function getBackupEmail(){
		try { return localStorage.getItem('authEmail') || ''; } catch(_) { return ''; }
	}
	function setBackupEmail(email){
		try { if (email) localStorage.setItem('authEmail', String(email)); } catch(_) {}
	}
	function clearBackupEmail(){
		try { localStorage.removeItem('authEmail'); } catch(_) {}
	}

    function openLoginOverlay(path){
        // 과거 호환: 직접 특정 경로를 띄우고자 할 때는 iframe 모드로 전환
        openLoginIframe(path || '/login');
    }

    function openLoginOptions(){
        if (app) app.classList.remove('analysis-mode');
        if (pageView) pageView.classList.add('hidden');
        if (shopView) shopView.classList.add('hidden');
        if (analysisView) analysisView.classList.add('hidden');
        if (menuView) menuView.classList.add('hidden');
        if (loginView) {
            const loginOptions = document.getElementById('loginOptions');
            const loginFrame = document.getElementById('loginFrame');
            if (loginFrame) {
                loginFrame.classList.add('hidden');
                loginFrame.src = '';
            }
            if (loginOptions) {
                loginOptions.classList.remove('hidden');
                loginOptions.style.display = 'block';
            }
            loginView.classList.remove('hidden');
            loginView.classList.add('visible');
        }
    }

    function openLoginIframe(path){
        const { base } = resolveNextBase();
        const loginOptions = document.getElementById('loginOptions');
        if (loginOptions) loginOptions.style.display = 'none';
        if (app) app.classList.remove('analysis-mode');
        if (pageView) pageView.classList.add('hidden');
        if (shopView) shopView.classList.add('hidden');
        if (analysisView) analysisView.classList.add('hidden');
        if (menuView) menuView.classList.add('hidden');
        if (loginView) {
            loginView.classList.remove('hidden');
            loginView.classList.add('visible');
        }
        if (loginFrame) {
            loginFrame.classList.remove('hidden');
            loginFrame.src = base + (path || '/login');
            const fix = () => {
                try {
                    const doc = loginFrame.contentDocument || loginFrame.contentWindow.document;
                    if (!doc) return;
                    const email = doc.querySelector('input[type="email"], input[name*="email" i]');
                    const user = doc.querySelector('input[name="username" i]');
                    const pass = doc.querySelector('input[type="password"], input[name*="password" i]');
                    if (email) email.setAttribute('autocomplete','email');
                    if (user) user.setAttribute('autocomplete','username');
                    if (pass) pass.setAttribute('autocomplete','current-password');
                } catch (_) {}
            };
            loginFrame.addEventListener('load', fix, { once: true });
        }
    }

    function bindLoginButton(){
        const btn = document.getElementById('loginBtn');
        if (!btn) {
            console.debug('[bindLoginButton] #loginBtn 요소를 찾을 수 없음');
            return;
        }
        console.log('[bindLoginButton] #loginBtn 바인딩 시작');
        
        // 기존 리스너 제거를 위해 클론 교체
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        const entry = readSupabaseSession();
		const backupEmail = getBackupEmail();
		const isLoggedIn = !!(entry && entry.session && entry.session.user) || !!backupEmail;
        clone.textContent = isLoggedIn ? '로그아웃' : '로그인';
        
        if (isLoggedIn) {
            clone.addEventListener('click', () => {
                console.log('[login] 로그아웃 버튼 클릭됨');
                clearSupabaseSessions();
				clearBackupEmail();
                window.location.href = '/';
            });
        } else {
            clone.addEventListener('click', () => {
                console.log('[login] 로그인 버튼 클릭됨 - 옵션 화면 열기');
                const loginOptions = document.getElementById('loginOptions');
                const loginFrame = document.getElementById('loginFrame');
                const app = document.querySelector('.app');
                const pageView = document.getElementById('pageView');
                const shopView = document.getElementById('shopView');
                const analysisView = document.getElementById('analysisView');
                const menuView = document.getElementById('menuView');
                const loginView = document.getElementById('loginView');

                // iframe 숨기고 옵션 표시
                if (loginFrame) { 
                    loginFrame.classList.add('hidden'); 
                    loginFrame.src=''; 
                }
                if (loginOptions) {
                    loginOptions.classList.remove('hidden');
                    loginOptions.style.display = 'block';
                    console.log('[login] loginOptions 표시됨');
                }
                
                // 다른 뷰들 숨기기
                if (app) app.classList.remove('analysis-mode');
                if (pageView) pageView.classList.add('hidden');
                if (shopView) shopView.classList.add('hidden');
                if (analysisView) analysisView.classList.add('hidden');
                if (menuView) menuView.classList.add('hidden');
                
                // 로그인 뷰 표시
                if (loginView) { 
                    loginView.classList.remove('hidden'); 
                    loginView.classList.add('visible');
                    console.log('[login] loginView 표시됨');
                }
            });
        }
        console.log('[bindLoginButton] 바인딩 완료, 로그인 상태:', isLoggedIn);
    }

	function bindSettingsAuthButtons(){
        const card = document.querySelector('.settings-login-card');
        if (!card) return;
        const btns = card.querySelectorAll('button');
        const loginBtnEl = btns[0];
        const signupBtnEl = btns[1];
		const settingsEmailEl = document.getElementById('settingsEmail');
        if (!loginBtnEl || !signupBtnEl) return;
        // 기존 리스너 제거 (onclick으로 대체)
        loginBtnEl.replaceWith(loginBtnEl.cloneNode(true));
        signupBtnEl.replaceWith(signupBtnEl.cloneNode(true));
        const loginBtnNew = card.querySelectorAll('button')[0];
        const signupBtnNew = card.querySelectorAll('button')[1];
        const entry = readSupabaseSession();
		const backupEmail = getBackupEmail();
		const hasSession = !!(entry && entry.session && entry.session.user);
		const isLoggedIn = hasSession || !!backupEmail;
		const email = hasSession ? (entry.session.user.email || '') : (backupEmail || '');
        if (isLoggedIn) {
			// 로그인 상태: 로그인/회원가입 버튼 숨김, 이메일 표시
			signupBtnNew.style.display = 'none';
			loginBtnNew.style.display = 'none';
			if (settingsEmailEl) {
				settingsEmailEl.textContent = email;
				settingsEmailEl.style.display = '';
			}
        } else {
            // 비로그인: 버튼 정상 표시 및 동작 바인딩
            signupBtnNew.style.display = '';
			loginBtnNew.style.display = '';
			loginBtnNew.textContent = '로그인';
            loginBtnNew.addEventListener('click', () => openLoginOptions());
            signupBtnNew.addEventListener('click', () => openLoginOptions());
			if (settingsEmailEl) {
				settingsEmailEl.textContent = '';
				settingsEmailEl.style.display = 'none';
			}
        }
    }

    function updateUserEmailUI(){
        const entry = readSupabaseSession();
		let email = entry && entry.session && entry.session.user && entry.session.user.email ? entry.session.user.email : '';
		if (!email) { email = getBackupEmail(); }
        const emailSpan = menuView && menuView.querySelector('.menu-bar span');
        if (emailSpan) emailSpan.textContent = email || '';
    }

    function hookSettingsLogoutItem(){
        const settingsViewEl = document.getElementById('settingsView');
        if (!settingsViewEl) return;
        const items = settingsViewEl.querySelectorAll('.settings-item');
        items.forEach((btn)=>{
            if (btn.textContent && btn.textContent.trim() === '로그아웃') {
                // 기존 리스너 방지
                const clone = btn.cloneNode(true);
                btn.parentNode.replaceChild(clone, btn);
                clone.addEventListener('click', () => {
                    clearSupabaseSessions();
					clearBackupEmail();
                    window.location.href = '/';
                });
            }
        });
    }

    function updateAuthUI(){
        bindLoginButton();
        bindSettingsAuthButtons();
        hookSettingsLogoutItem();
        updateUserEmailUI();
		// 설정 하단 로그아웃 항목 표시 토글
		const entry = readSupabaseSession();
		const isLoggedIn = !!(entry && entry.session && entry.session.user);
		const logoutBtn = document.getElementById('logoutBtn');
		if (logoutBtn) {
			logoutBtn.style.display = isLoggedIn ? '' : 'none';
		}
    }

    // Next.js 서버 베이스 URL 결정 및 필요 시 사용자 입력 받는 헬퍼
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

    // 로그인 버튼/세션 기반 UI 초기 바인딩
    updateAuthUI();

    // [로그인 버튼] 바인딩은 bindLoginButton()에서 처리됨

    // iframe(Next.js)에서 로그인 완료 브로드캐스트 수신 → 즉시 UI 동기화
    window.addEventListener('message', (e) => {
		try {
			const msg = e && e.data;
			if (!msg || msg.source !== 'skin-app') return;
			if (msg.type === 'auth:login') {
				if (msg.email) setBackupEmail(msg.email);
                // 오버레이 닫고 배경(pageView)으로 복귀
				if (loginView) {
					loginView.classList.remove('visible');
					loginView.classList.add('hidden');
					if (loginFrame) loginFrame.src = '';
                    if (pageView) pageView.classList.remove('hidden');
                    if (analysisView) analysisView.classList.add('hidden');
                    if (shopView) shopView.classList.add('hidden');
                    if (menuView) menuView.classList.add('hidden');
				}
				updateAuthUI();
			}
			if (msg.type === 'auth:logout') {
				clearBackupEmail();
				updateAuthUI();
			}
		} catch(_) {}
	});

    if (loginClose && loginView) {
        loginClose.addEventListener('click', () => {
            const loginOptions = document.getElementById('loginOptions');
            loginView.classList.remove('visible');
            loginView.classList.add('hidden');
            if (loginFrame) { loginFrame.src = ''; loginFrame.classList.add('hidden'); }
            if (loginOptions) {
                loginOptions.classList.remove('hidden');
                loginOptions.style.display = 'block';
            }
            // 기본 배경 복귀: 메인 페이지 뷰 표시
            if (pageView) pageView.classList.remove('hidden');
            // 오버레이 닫힐 때 세션 상태 반영
            updateAuthUI();
        });
    }

    // 설정 화면 버튼은 세션 상태에 따라 동적으로 바인딩됨
    bindSettingsAuthButtons();

    // 로그인 옵션 버튼 초기화
    function initLoginOptionsUI() {
        const el = document.getElementById('loginOptions');
        if (!el) {
            console.debug('[initLoginOptionsUI] loginOptions 요소 없음 — 스킵');
            return;
        }
        console.log('[initLoginOptionsUI] 로그인 옵션 버튼 초기화 시작');
        
        const btnKakao = document.getElementById('btnKakao');
        const btnNaver = document.getElementById('btnNaver');
        const btnGoogle = document.getElementById('btnGoogle');
        const btnEmailLogin = document.getElementById('btnEmailLogin');
        const btnEmailSignup = document.getElementById('btnEmailSignup');
        const btnGuest = document.getElementById('btnGuest');

        console.log('[initLoginOptionsUI] 버튼 요소들:', {
            btnKakao: !!btnKakao,
            btnNaver: !!btnNaver, 
            btnGoogle: !!btnGoogle,
            btnEmailLogin: !!btnEmailLogin,
            btnEmailSignup: !!btnEmailSignup,
            btnGuest: !!btnGuest
        });

        on(btnEmailLogin, 'click', () => {
            console.log('[login] 이메일 로그인 버튼 클릭됨');
            if (loginOptions) loginOptions.style.display = 'none';
            openLoginIframe('/login');
        });
        on(btnEmailSignup, 'click', () => {
            console.log('[login] 이메일 회원가입 버튼 클릭됨');
            if (loginOptions) loginOptions.style.display = 'none';
            openLoginIframe('/signup');
        });
        on(btnGuest, 'click', () => {
            console.log('[login] 둘러보기 버튼 클릭됨 - 메인으로 복귀');
            // 옵션 닫고 메인으로 복귀
            if (loginView) {
                loginView.classList.remove('visible');
                loginView.classList.add('hidden');
                console.log('[login] loginView 숨김 처리됨');
            }
            if (analysisView) analysisView.classList.add('hidden');
            if (shopView) shopView.classList.add('hidden');
            if (menuView) menuView.classList.add('hidden');
            if (pageView) {
                pageView.classList.remove('hidden');
                console.log('[login] pageView 표시됨 - 메인 화면 복귀');
            }
        });
        
        // 소셜 버튼은 추후 연동
        on(btnKakao, 'click', () => {
            console.log('[login] 카카오 버튼 클릭됨');
            alert('카카오 로그인은 추후 연동됩니다.');
        });
        on(btnNaver, 'click', () => {
            console.log('[login] 네이버 버튼 클릭됨');
            alert('네이버 로그인은 추후 연동됩니다.');
        });
        on(btnGoogle, 'click', () => {
            console.log('[login] 구글 버튼 클릭됨');
            alert('구글 로그인은 추후 연동됩니다.');
        });
        
        console.log('[initLoginOptionsUI] 로그인 옵션 버튼 바인딩 완료');
    }

    // /login 경로일 때만 실행
    if (location.pathname === '/login') {
        try { 
            initLoginOptionsUI(); 
        } catch (e) { 
            console.debug('initLoginOptionsUI 실패', e); 
        }
    }

    // 다른 컨텍스트(iframe 등)에서 세션 변경 시 UI 동기화
    window.addEventListener('storage', (e)=>{
        if (e && e.key && /^sb-.*-auth-token$/.test(e.key)) {
            updateAuthUI();
        }
    });


    const PAGES = [];

    function createPage(num) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.textContent = num;
        const wrapper = document.getElementById('pagesWrapper');
        if (wrapper) wrapper.appendChild(pageDiv);
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
        const el = document.getElementById('pageIndicators');
        if (!el) return;
        el.innerHTML = '';
        PAGES.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = 'indicator-dot' + (idx === currentPageIdx ? ' active' : '');
            el.appendChild(dot);
        });
    }

    function refreshPage() {
        const wrapper = document.getElementById('pagesWrapper');
        if (!wrapper) return;
        const offset = -currentPageIdx * wrapper.offsetWidth;
        wrapper.style.transform = `translateX(${offset}px)`;
        // 페이지 번호 재설정
        PAGES.forEach((pg, idx) => pg.textContent = idx + 1);
        const delBtn = document.getElementById('deletePageBtn');
        if (delBtn) delBtn.disabled = PAGES.length === 1;
        updateIndicators();
        renderPageList();
        saveCount();
    }

    // renderAnalysisView not needed after separate view implemented

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.bottom-nav .nav-btn');
        if (!btn) return;
        const label = btn.dataset.label;
        const app = document.querySelector('.app');
        const pageView = document.getElementById('pageView');
        const shopView = document.getElementById('shopView');
        const analysisView = document.getElementById('analysisView');
        const recordView = document.getElementById('recordView');
        const menuView = document.getElementById('menuView');
        const analysisButtons = document.querySelector('.analysis-buttons');
        if (!app || !pageView || !shopView || !analysisView || !menuView || !recordView) return;
        if (label === '상점') {
            app.classList.remove('analysis-mode');
            pageView.classList.add('hidden');
            shopView.classList.remove('hidden');
            analysisView.classList.add('hidden');
            menuView.classList.add('hidden');
            if (analysisButtons) analysisButtons.style.display = 'none';
        } else if (label === '분석') {
            app.classList.add('analysis-mode');
            analysisView.classList.remove('hidden');
            document.querySelectorAll('.analysis-nav-btn').forEach((b, i)=>{
               b.classList.toggle('active', i===0);
            });
            recordView.classList.add('hidden');
            shopView.classList.add('hidden');
            pageView.classList.add('hidden');
            menuView.classList.add('hidden');
            if (analysisButtons) analysisButtons.style.display = 'flex';
        } else if(label==='메뉴'){
           console.log('[nav] 메뉴 버튼 클릭됨');
           menuView.classList.remove('hidden');
           pageView.classList.add('hidden');
           shopView.classList.add('hidden');
           analysisView.classList.add('hidden');
           app.classList.remove('analysis-mode');
           if (analysisButtons) analysisButtons.style.display = 'none';
           // 메뉴 화면으로 전환되면 로그인 버튼 재바인딩
           setTimeout(() => bindLoginButton(), 100);
        } else {
            app.classList.remove('analysis-mode');
            analysisView.classList.add('hidden');
            shopView.classList.add('hidden');
            pageView.classList.remove('hidden');
            menuView.classList.add('hidden');
            if (analysisButtons) analysisButtons.style.display = 'none';
        }
    });

    // 분석 네비: 널가드 + 캐싱 적용
    function hideAllAnalysis() {
        recordView?.classList.add('hidden');
        document.getElementById('routineView')?.classList.add('hidden');
        document.getElementById('productView')?.classList.add('hidden');
        shopView?.classList.add('hidden');
    }

    document.addEventListener('click', (e) => {
        const b = e.target.closest('.analysis-nav-btn');
        if (!b) return;

        document.querySelectorAll('.analysis-nav-btn').forEach(x => x.classList?.remove('active'));
        b.classList?.add('active');

        const routineViewEl = document.getElementById('routineView');
        const productViewEl = document.getElementById('productView');
        const analysisBtns = document.querySelector('.analysis-buttons');
        if (!recordView && !routineViewEl && !productViewEl && !shopView && !analysisBtns) {
            console.debug('[analysis] 관련 뷰 없음 — 스킵');
            return;
        }

        hideAllAnalysis();
        const label = (b.textContent || '').trim();

        if (label === '기록') {
            recordView?.classList.remove('hidden');
            if (analysisBtns) analysisBtns.style.display = 'none';
            return;
        }
        if (label === '루틴') {
            routineViewEl?.classList.remove('hidden');
            productViewEl?.classList.add('hidden');
            if (analysisBtns) analysisBtns.style.display = 'none';
            return;
        }
        if (label === '내 제품') {
            productViewEl?.classList.remove('hidden');
            shopView?.classList.add('hidden');
            if (analysisBtns) analysisBtns.style.display = 'none';
            return;
        }
        if (label === '상점') {
            shopView?.classList.remove('hidden');
            productViewEl?.classList.add('hidden');
            routineViewEl?.classList.add('hidden');
            recordView?.classList.add('hidden');
            if (analysisBtns) analysisBtns.style.display = 'none';
            return;
        }

        // 그 외: 분석 버튼 패널 노출
        productViewEl?.classList.add('hidden');
        if (analysisBtns) analysisBtns.style.display = 'flex';
    });

    function saveCount() {
        localStorage.setItem('pageCount', PAGES.length);
    }

    /* ---------- Page list in edit panel for reorder ---------- */
    const pageListEl = document.getElementById('pageList');

    function renderPageList() {
        const el = document.getElementById('pageList');
        if (!el) return;
        el.innerHTML = '';
        PAGES.forEach((_, idx) => {
            const li = document.createElement('li');
            li.textContent = `페이지 ${idx + 1}`;
            li.draggable = true;
            li.dataset.idx = idx;
            el.appendChild(li);
        });
    }

    // ----- 드래그로 순서 변경 -----
    let dragSrcIdx = null;

    if (pageListEl) pageListEl.addEventListener('dragstart', e => {
        const li = e.target.closest('li');
        if (!li) return;
        dragSrcIdx = Number(li.dataset.idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrcIdx);
    });

    if (pageListEl) pageListEl.addEventListener('dragover', e => {
        e.preventDefault();
    });

    if (pageListEl) pageListEl.addEventListener('drop', e => {
        e.preventDefault();
        const li = e.target.closest('li');
        if (!li || dragSrcIdx === null) return;
        const tgtIdx = Number(li.dataset.idx);
        if (dragSrcIdx === tgtIdx) return;

        const [moved] = PAGES.splice(dragSrcIdx, 1);
        PAGES.splice(tgtIdx, 0, moved);
        currentPageIdx = tgtIdx;

        // DOM 재배치
        const wrapper = document.getElementById('pagesWrapper');
        if (wrapper) {
            wrapper.innerHTML = '';
            PAGES.forEach(pg => wrapper.appendChild(pg));
        }
        renderPageList(); // li 재생성하여 data-idx 갱신
        refreshPage();
        // 저장
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

    // mainDisplay가 존재할 때만 이벤트 리스너 추가
    if (mainDisplay) {
        mainDisplay.addEventListener('touchstart', startPressTimer);
        mainDisplay.addEventListener('mousedown', startPressTimer);

        ['touchend', 'touchmove', 'mouseup', 'mouseleave'].forEach(evt => {
            mainDisplay.addEventListener(evt, clearPressTimer);
        });
    }

    function openEditOverlay() {
        editOverlay.classList.remove('hidden');
        requestAnimationFrame(() => editOverlay.classList.add('visible'));
    }

    function closeEditOverlay() {
        editOverlay.classList.remove('visible');
        setTimeout(() => editOverlay.classList.add('hidden'), 300);
    }

    if (editOverlay) {
        editOverlay.addEventListener('click', e => {
            if (e.target === editOverlay) closeEditOverlay();
        });
    }

    if (addPageBtn) addPageBtn.addEventListener('click', () => {
        const pageDiv = createPage(PAGES.length + 1);
        PAGES.push(pageDiv);
        currentPageIdx = PAGES.length - 1;
        refreshPage();
        // 편집 창 유지
    });

    if (deletePageBtn) deletePageBtn.addEventListener('click', () => {
        if (PAGES.length === 1) return; // safeguard
        PAGES.pop();
        const wrapper = document.getElementById('pagesWrapper');
        if (wrapper && wrapper.lastChild) wrapper.removeChild(wrapper.lastChild);
        currentPageIdx = Math.max(0, currentPageIdx - 1);
        refreshPage();
        localStorage.setItem('pageCount', PAGES.length);
    });

    /* -------- Swipe navigation -------- */
    let startX;
    let isMouseDown = false;
    if (pagesWrapper) pagesWrapper.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    if (pagesWrapper) pagesWrapper.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) < 50) return;
        if (diff < 0 && currentPageIdx < PAGES.length - 1) currentPageIdx++;
        if (diff > 0 && currentPageIdx > 0) currentPageIdx--;
        refreshPage();
    });

    // PC 마우스 스와이프
    if (pagesWrapper) pagesWrapper.addEventListener('mousedown', e => {
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
    const ctx = recordChart ? recordChart.getContext('2d') : null;

    // 캔버스를 컨테이너 폭에 맞춰 고해상도로 리사이즈
    function resizeRecordCanvas(){
        if (!recordChart || !ctx) return;
        const zone = document.getElementById('recordChartZone');
        if(!zone) return;
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = zone.clientWidth; // 부모(유동) 폭
        const cssHeight = Math.max(150, Math.round(cssWidth * 0.75)); // 4:3 비율
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
        if (!recordChart || !ctx) return;
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

    // HTML에 <div id="recordDates"></div> 가 반드시 있어야 합니다.
    function setDatesWindow(offsetDays) {
        const recordDates = document.getElementById("recordDates");
        if (!recordDates) return;
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
        // 균등 간격 배치를 위해 span으로 구성
        recordDates.innerHTML = '';
        labels.forEach(text => {
            const s = document.createElement('span');
            s.textContent = text;
            recordDates.appendChild(s);
        });
    }

    // 스와이프로 7일 윈도 이동
    let recordStartOffset = 0;
    const chartZone = document.getElementById('recordChartZone');
    let startXRecord;
    if (chartZone) chartZone.addEventListener('touchstart', e => { startXRecord = e.touches[0].clientX; });
    if (chartZone) chartZone.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startXRecord;
        if (Math.abs(diff) < 40) return;
        recordStartOffset += diff < 0 ? 7 : -7;
        setDatesWindow(recordStartOffset);
        drawEmptyChart();
    });
    if (chartZone) chartZone.addEventListener('mousedown', e => { startXRecord = e.clientX; });
    document.addEventListener('mouseup', e => {
        if (startXRecord == null) return;
        const diff = e.clientX - startXRecord;
        startXRecord = null;
        if (Math.abs(diff) < 40) return;
        recordStartOffset += diff < 0 ? 7 : -7;
        setDatesWindow(recordStartOffset);
        drawEmptyChart();
    });

    // 체크박스 색 표시(그래프는 아직 빈 상태 유지)
    if (legendContainer) legendContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const color = metricColors[cb.value] || '#000';
        // 체크박스 자체 색상 지정
        try { cb.style.accentColor = color; } catch (_) {}
        cb.addEventListener('change', () => {
            // 이후 실제 데이터 연동 시 이곳에서 각 색으로 라인 그리기
            drawEmptyChart();
        });
    });

    // 초기화
    setDatesWindow(0);

    resizeRecordCanvas();
    window.addEventListener('resize', resizeRecordCanvas);

    drawEmptyChart();


    /* ---------- 루틴: 모드 토글/버튼 노출 ---------- */
    const routineView = document.getElementById('routineView');
    const routineModeBtn = document.getElementById('routineModeBtn');
    const routineModeMenu = document.getElementById('routineModeMenu');

    if (routineModeBtn && routineModeMenu) {
        routineModeBtn.addEventListener('click', () => {
            routineModeMenu.classList.toggle('hidden');
        });
    }

    if (routineModeMenu && routineModeBtn && routineModeMenu) routineModeMenu.addEventListener('click', (e) => {
        const btn = e.target.closest('.mode-btn');
        if (!btn) return;
        routineModeMenu.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active','remove'));
        btn.classList.add('active');
        // 모드 클래스 전환: add/remove
        routineView.classList.remove('mode-add','mode-remove');
        if (btn.dataset.mode === 'add') {
            routineView.classList.add('mode-add');
        } else if (btn.dataset.mode === 'remove') {
            routineView.classList.add('mode-remove');
            btn.classList.add('remove');
        }
        // 선택 후 메뉴 닫기
        routineModeMenu.classList.add('hidden');
    });

    // 메뉴 바깥 클릭 시 닫기
    if (routineModeMenu) {
        document.addEventListener('click', (e) => {
            const within = e.target.closest('#routineModeMenu') || e.target.closest('#routineModeBtn');
            if (!within) routineModeMenu.classList.add('hidden');
        });
    }

    /* ---------- 내 제품 로직 ---------- */
    // [Product UI] 존재할 때만 바인딩

    function loadProducts() {
        const saved = JSON.parse(localStorage.getItem('productList')||'[]');
        saved.forEach(p=>renderProductCard(p.brand,p.name));
    }

    function saveProducts() {
        const arr=[];
        const productListEl = document.getElementById('productList');
        if (!productListEl) return; // 안전 가드
        productListEl.querySelectorAll('.product-card').forEach(card=>{
            arr.push({brand:card.dataset.brand,name:card.dataset.name});
        });
        localStorage.setItem('productList',JSON.stringify(arr));
    }

    function renderProductCard(brand,name,img){
        const productListEl = document.getElementById('productList');
        if (!productListEl) return; // 안전 가드
        const card=document.createElement('div');
        card.className='product-card';
        card.dataset.brand=brand;card.dataset.name=name;
        const thumbHtml= img?`<img class="product-thumb" src="${img}">`:`<div class="product-thumb placeholder">＋</div>`;
        card.innerHTML=`${thumbHtml}<h4>${brand}</h4><p>${name}</p><button class="remove">－</button>`;
        const removeBtn = card.querySelector('.remove');
        if (removeBtn) removeBtn.addEventListener('click',()=>{
            card.remove();
            saveProducts();
        });
        productListEl.appendChild(card);
    }

    function createInputCard(){
        const productListEl = $('#productList');
        if (!productListEl) return; // 안전 가드
        const wrap=document.createElement('div');
        wrap.className='product-input';
        wrap.innerHTML=`<label class="img-btn" title="이미지 추가">＋<input type="file" accept="image/*" style="display:none"></label><div class="fields"><input placeholder="브랜드" autocomplete="off"/><input placeholder="제품명" autocomplete="off"/></div><button class="save">저장</button>`;
        const fileInput=wrap.querySelector('input[type="file"]');
        const brandI=wrap.querySelector('.fields input:nth-child(1)');
        const nameI=wrap.querySelector('.fields input:nth-child(2)');
        let imgData='';
        if (fileInput) {
            fileInput.addEventListener('change',e=>{
               const f=e.target.files && e.target.files[0];
               if(!f)return;
               const reader=new FileReader();
               reader.onload=ev=>{imgData=(ev && ev.target && ev.target.result)||'';};
               reader.readAsDataURL(f);
            });
        }
        const saveBtn = wrap.querySelector('.save');
        if (saveBtn) saveBtn.addEventListener('click',()=>{
            const b=(brandI && brandI.value ? brandI.value : '').trim();
            const n=(nameI && nameI.value ? nameI.value : '').trim();
            if(!b||!n)return;
            renderProductCard(b,n,imgData);
            (typeof saveProducts === 'function') && saveProducts();
            wrap.remove();
        });
        productListEl.prepend(wrap);
        if (brandI) brandI.focus();
    }
    const productAddBtn = $('#productAddBtn');
    const productListEl = $('#productList');
    if (productAddBtn && productListEl) {
        on(productAddBtn, 'click', () => {
            if (productListEl.querySelector('.product-input')) return;
            createInputCard();
        });
        if (typeof loadProducts === 'function') loadProducts();
    } else {
        console.debug('[product UI] #productAddBtn 또는 #productList 없음 → 이 페이지에서는 스킵');
    }

    // 요구 HTML:
    // <button id="productAddBtn">제품 추가</button>
    // <div id="productList"></div>
});

onReady(() => {
  // 메뉴 버튼 클릭 이벤트 처리
  document.addEventListener('click', e => {
    const c = e.target.closest('.circle-btn');
    if (!c || c.classList.contains('disabled')) return;
    
    const dest = c.dataset.go;
    const appEl = document.querySelector('.app');
    const analysisViewEl = document.getElementById('analysisView');
    const pageViewEl = document.getElementById('pageView');
    const shopViewEl = document.getElementById('shopView');
    const menuViewEl = document.getElementById('menuView');
    const alarmViewEl = document.getElementById('alarmView');
    const settingsViewEl = document.getElementById('settingsView');
    
    // 모든 뷰를 먼저 숨김
    if (analysisViewEl) analysisViewEl.classList.add('hidden');
    if (pageViewEl) pageViewEl.classList.add('hidden');
    if (shopViewEl) shopViewEl.classList.add('hidden');
    if (menuViewEl) menuViewEl.classList.add('hidden');
    if (alarmViewEl) alarmViewEl.classList.add('hidden');
    if (settingsViewEl) settingsViewEl.classList.add('hidden');
    
    // 목적지에 따라 적절한 뷰 표시
    if (dest === 'analysis') {
      if (appEl) appEl.classList.add('analysis-mode');
      if (analysisViewEl) analysisViewEl.classList.remove('hidden');
    } else if (dest === 'shop') {
      if (appEl) appEl.classList.remove('analysis-mode');
      if (shopViewEl) shopViewEl.classList.remove('hidden');
    } else if (dest === 'alarm') {
      if (appEl) appEl.classList.remove('analysis-mode');
      if (alarmViewEl) alarmViewEl.classList.remove('hidden');
    } else if (dest === 'settings') {
      if (appEl) appEl.classList.remove('analysis-mode');
      if (settingsViewEl) settingsViewEl.classList.remove('hidden');
    } else if (dest === 'community') {
      // 커뮤니티 화면은 현재 없으므로 기본 페이지로
      if (appEl) appEl.classList.remove('analysis-mode');
      if (pageViewEl) pageViewEl.classList.remove('hidden');
    } else if (dest === 'camera') {
      // 카메라 화면은 현재 없으므로 기본 페이지로
      if (appEl) appEl.classList.remove('analysis-mode');
      if (pageViewEl) pageViewEl.classList.remove('hidden');
    } else if (dest === 'gallery') {
      // 갤러리 화면은 현재 없으므로 기본 페이지로
      if (appEl) appEl.classList.remove('analysis-mode');
      if (pageViewEl) pageViewEl.classList.remove('hidden');
    } else {
      // 기본값: 메인 페이지로
      if (appEl) appEl.classList.remove('analysis-mode');
      if (pageViewEl) pageViewEl.classList.remove('hidden');
    }
  });
});

// ------- 알람 리스트 저장/렌더/수정 로직 -------
onReady(() => {
  // DOM 참조
  const alarmView = document.getElementById('alarmView');
  const alarmFormView = document.getElementById('alarmFormView');
  const alarmList = document.getElementById('alarmList');
  const addBtn = document.querySelector('.alarm-add');
  const saveBtn = document.getElementById('alarmSaveBtn');
  const cancelBtn = document.getElementById('alarmCancelBtn');

  // [Alarm UI] 요소 존재 확인 후에만 바인딩
  if (!alarmFormView || !alarmView) {
    console.debug('[alarm] alarmFormView/alarmView 없음 → 이 페이지에서는 스킵');
    return;
  }

  // 동일 초기화 중복 방지
  if (alarmInitDone) return; alarmInitDone = true;

  // 로컬스토리지 키
  const KEY = 'alarms';

  // HH:MM 숫자 → 문자열 포맷
  function pad2(n){ return String(n).padStart(2,'0'); }

  // 알람 데이터 구조: { start:{am:true,h:6,m:0}, end:{am:false,h:9,m:0}, days:[0,1,..] }

  // 저장소 읽기
  function loadAlarms(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  // 저장소 쓰기
  function saveAlarms(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

  // 리스트 렌더
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

  // 폼 입력값 읽어 minutes 계산
  function toMinutes(target){
    const grp = alarmFormView.querySelector(`.ampm-group[data-target="${target}"]`);
    const am = grp.querySelector('.ampm-btn.active').dataset.value === 'AM';
    const [hhEl, mmEl] = alarmFormView.querySelectorAll(`.time-inputs[data-target="${target}"] .time-num`);
    const hh = parseInt(hhEl.value || '0', 10);
    const mm = parseInt(mmEl.value || '0', 10);
    let h24 = hh % 12; if(!am) h24 += 12;
    return { am, h: hh%12===0? (am?12:hh) : hh%12, m: mm%60, minutes: h24*60 + (mm%60) };
  }

  // 폼에 값 채우기
  function fillForm(a){
    if(!a || !a.start || !a.end){
      a = { start:{am:true,h:6,m:0}, end:{am:true,h:9,m:0}, days:[] };
    }
    // AM/PM 버튼 상태
    ['start','end'].forEach(key=>{
      const grp = alarmFormView.querySelector(`.ampm-group[data-target="${key}"]`);
      grp.querySelectorAll('.ampm-btn').forEach(b=>b.classList.remove('active'));
      grp.querySelector(`.ampm-btn[data-value="${a[key].am?'AM':'PM'}"]`).classList.add('active');
      const [hhEl, mmEl] = alarmFormView.querySelectorAll(`.time-inputs[data-target="${key}"] .time-num`);
      hhEl.value = pad2(a[key].h);
      mmEl.value = pad2(a[key].m);
    });
    // 요일
    alarmFormView.querySelectorAll('.weekday-btn').forEach((b,i)=>{
      b.classList.toggle('active', a.days.includes(i));
    });
    document.getElementById('repeatAll').checked = a.days.length===7;
  }

  // 신규 추가 폼 열기
  function openFormNew(){
    editingIndex = null;
    // 기본값 초기화
    fillForm({ start:{am:true,h:6,m:0}, end:{am:true,h:9,m:0}, days:[] });
    // 버튼 텍스트 변경 (저장)
    saveBtn.textContent = '저장';
    alarmView.classList.add('hidden');
    alarmFormView.classList.remove('hidden');
  }

  // 수정 폼 열기 (가드 추가)
  function openFormForEdit(index){
    if (typeof index !== 'number' || index < 0) {
      editingIndex = null;
      fillForm(null);
      saveBtn.textContent = '저장';
      alarmView.classList.add('hidden');
      alarmFormView.classList.remove('hidden');
      return;
    }
    const list = loadAlarms();
    const a = list ? list[index] : null;
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

  // 추가 버튼 → 상단 공용 가드 바인딩으로 대체됨

  // 취소 버튼 → 리스트로 복귀 (요소 존재 시에만 바인딩)
  if (cancelBtn && alarmFormView && alarmView) {
    cancelBtn.addEventListener('click', () => {
      // 편집 모드 취소 → 상태 및 폼 초기화
      editingIndex = null;
      const formEl = alarmFormView.querySelector('form');
      try { if (formEl) formEl.reset(); } catch(_) {}
      alarmFormView.classList.add('hidden');
      alarmView.classList.remove('hidden');
    });
  } else {
    console.warn('[alarm] cancelBtn/alarmFormView/alarmView 요소를 찾지 못했습니다.');
  }

  // AM/PM 토글: 폼 래퍼 위임 (존재 시 등록)
  if (alarmFormView) {
    alarmFormView.addEventListener('click', (e) => {
      const btn = e.target.closest('.ampm-btn');
      if (!btn) return;
      const group = btn.parentElement;
      if (!group) return;
      group.querySelectorAll('.ampm-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  }

  // 숫자만 입력
  alarmFormView.querySelectorAll('.time-num').forEach(inp => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 2);
    });
  });

  // 요일 선택 및 매일
  const allChk = document.getElementById('repeatAll');
  const dayBtns = alarmFormView.querySelectorAll('.weekday-btn');
  allChk.addEventListener('change', () => {
    dayBtns.forEach(b => b.classList.toggle('active', allChk.checked));
  });
  dayBtns.forEach(b => b.addEventListener('click', () => {
    b.classList.toggle('active');
  }));

  function saveAlarm(){
    const s = toMinutes('start');
    const e = toMinutes('end');
    let diff = e.minutes - s.minutes;
    if (diff <= 0) diff += 24*60; // 자정 넘김 허용
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

    // 저장 후 상태 초기화 및 전환
    editingIndex = null;
    alarmFormView.classList.add('hidden');
    alarmView.classList.remove('hidden');
    renderAlarms();
  }

  // 저장/수정 공통 처리
  if (saveBtn) saveBtn.addEventListener('click', saveAlarm);

  // [알람 화면 추가 버튼] 존재 시에만 폼 열기 (아이디/클래스 지원)
  const alarmAddBtn = document.getElementById('alarmAddBtn') || document.querySelector('.alarm-add-btn') || document.querySelector('.alarm-add');
  const alarmFormViewEl = document.getElementById('alarmFormView');
  const alarmViewEl = document.getElementById('alarmView');
  if (alarmAddBtn) alarmAddBtn.addEventListener('click', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!alarmFormViewEl || !alarmViewEl) {
      console.debug('[alarm] alarmFormView/alarmView 없음 — 스킵');
      return;
    }
    alarmViewEl.classList.add('hidden');
    alarmFormViewEl.classList.remove('hidden');
    const formEl = alarmFormViewEl.querySelector('form');
    try { if (formEl) formEl.reset(); } catch(_) {}
  });

  // 초기 렌더
  renderAlarms();

  // 편집 모드 토글: 메뉴 버튼 → 저장 버튼 역할
  const hamburger = document.querySelector('#alarmView .hamburger');

  let editMode = false;           // 편집 모드 상태
  let reorderActive = false;      // 순서 편집 활성화 상태(드래그 중)
  let pressStarted = false;       // 길게 클릭 중 여부 (기타 보호)
  let confirmOpen = null;         // 현재 열린 삭제 확인 박스의 카드 요소
  let sortable = null;            // SortableJS 인스턴스

  // 편집 모드 토글: 메뉴 버튼 → 저장 버튼 역할
  hamburger.addEventListener('click', () => {
    editMode = !editMode;
    if (!editMode) reorderActive = false;
    alarmView.classList.toggle('edit-mode', editMode);
    alarmView.classList.toggle('reorder-mode', false);
    hamburger.textContent = editMode ? '저장' : '≡';
    // 모드 전환 시 열린 confirm 닫기
    if (confirmOpen) { const box = confirmOpen.querySelector('.confirm-box'); if (box) box.remove(); confirmOpen = null; }
    if (editMode) {
      enableSortable();
    } else {
      disableSortable();
      // 저장 버튼으로 동작: 현재 순서 저장
      persistCurrentOrder();
      renderAlarms();
    }
  });

  // 카드들의 draggable 속성 일괄 토글
  function setCardsDraggable(on){
    alarmList.querySelectorAll('.alarm-card').forEach(card => {
      card.draggable = !!on;
    });
  }

  // 현재 DOM 순서를 저장소에 반영
  function persistCurrentOrder(){
    const arr=[];
    alarmList.querySelectorAll('.alarm-card').forEach(card=>{
      const idx=Number(card.dataset.idx);
      const all=loadAlarms();
      arr.push(all[idx]);
    });
    saveAlarms(arr);
  }

  // 렌더 함수 수정: 카드에 data-idx 부여, 편집 이벤트 바인딩
  const _renderAlarms = renderAlarms; // 원본 참조
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
      const daysHtml=dayNames.map((d,i)=>`<span class="day ${days.includes(i)?'active':''}">${d}</span>`).join(' ');
      card.innerHTML=`
        <div class="alarm-days">${daysHtml}</div>
        <div class="alarm-time-center">
          <span class="ampm">${a.start.am?'오전':'오후'}</span>
          <span>${String(a.start.h).padStart(2,'0')}:${String(a.start.m).padStart(2,'0')}</span>
          <span class="tilde">~</span>
          <span class="ampm">${a.end.am?'오전':'오후'}</span>
          <span>${String(a.end.h).padStart(2,'0')}:${String(a.end.m).padStart(2,'0')}</span>
        </div>`;

      // 클릭은 컨테이너 위임에서 처리

      // 길게 누르면(0.6s) 순서 편집 활성화 → 데스크톱/모바일 공통 pointer 이벤트 사용
      let pressTimer;
      const startPress = ()=>{
        if(!editMode) return;
        pressStarted = true;
        // 시각 효과: 살짝 떠오름
        card.classList.add('reorder-ready');
        pressTimer = setTimeout(()=>{
          reorderActive = true;
          setCardsDraggable(true);
          card.draggable = true; // 현재 카드도 드래그 가능
          alarmView.classList.add('reorder-mode');
        },150);
      };
      const clearPress = ()=>{ clearTimeout(pressTimer); card.classList.remove('reorder-ready'); pressStarted=false; };
      card.addEventListener('pointerdown', startPress);
      card.addEventListener('pointerup', clearPress);
      card.addEventListener('pointerleave', clearPress);

      // 드래그 앤 드롭
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
        // 편집 상태 유지 및 드래그 활성 유지
        editMode=true; reorderActive=true; alarmView.classList.add('edit-mode'); hamburger.textContent='저장';
        setCardsDraggable(true);
      });
      card.addEventListener('dragend', ()=>{ card.classList.remove('dragging'); });

      alarmList.appendChild(card);
    });
    if (editMode) enableSortable(); else disableSortable();
  }

  // 컨테이너 단위 클릭 위임 처리: 삭제/취소/카드 클릭
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
      // 삭제 후에도 편집 모드 유지
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
    if (pressStarted || reorderActive) return; // 드래그 중 클릭 무시
    const idx = Number(card.dataset.idx);
    if (!editMode) {
      // normal 모드: 수정 화면으로 진입
      openFormForEdit(idx);
      return;
    }
    // edit 모드: 삭제 확인만 표시
    if (confirmOpen && confirmOpen !== card) {
      const boxPrev = confirmOpen.querySelector('.confirm-box');
      if (boxPrev) boxPrev.remove();
      confirmOpen = null;
    }
    showDeleteConfirm(card, idx);
  });

  // 삭제 확인 박스 표시
  function showDeleteConfirm(card, idx){
    // 기존 확인창 제거 후 이 카드에만 표시
    const exist = card.querySelector('.confirm-box');
    if (exist) { exist.remove(); confirmOpen = null; }
    // 확인창 생성
    const box = document.createElement('div');
    box.className = 'confirm-box';
    box.innerHTML = `
      <span>삭제하겠습니까?</span>
      <div class="confirm-actions">
        <button class="confirm-btn ghost">취소</button>
        <button class="confirm-btn danger">삭제</button>
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

  // SortableJS 활성/비활성
  function enableSortable(){
    if (sortable) { sortable.option('disabled', false); return; }
    if (!window.Sortable) return; // CDN 미로딩 보호
    sortable = Sortable.create(alarmList, {
      animation: 150,
      handle: '.alarm-card',      // 카드 전체를 핸들로 사용
      delay: 500,                 // 터치에서 0.5s 길게 눌러야 시작
      delayOnTouchOnly: true,
      draggable: '.alarm-card',
      forceFallback: true,        // 폴백 미러 생성(시각은 CSS로 숨김)
      fallbackClass: 'sortable-fallback',
      chosenClass: 'alarm-chosen',
      dragClass: 'alarm-drag',
      ghostClass: 'alarm-ghost',  // 자리 표시자 또렷하게
      onStart: () => { reorderActive = true; },
      onEnd: () => {
        reorderActive = false;
        // DOM 순서를 저장소에 반영
        persistByDOMOrder();
        // 편집 모드 유지
        editMode = true; alarmView.classList.add('edit-mode'); hamburger.textContent='저장';
        if (confirmOpen) { const box = confirmOpen.querySelector('.confirm-box'); if (box) box.remove(); confirmOpen = null; }
      }
    });
  }

  function disableSortable(){ if (sortable) sortable.option('disabled', true); }

  // DOM 순서 기반으로 저장 반영
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

    // 메뉴 화면 상단 로그인 버튼은 bindLoginButton()에서 처리됨

    if (loginClose && loginView) {
        loginClose.addEventListener('click', () => {
            loginView.classList.remove('visible');
            loginView.classList.add('hidden');
            if (loginFrame) loginFrame.src = '';
            // 로그인 화면을 닫을 때 현재 메뉴 화면 상태로 복귀
            if (menuView) menuView.classList.remove('hidden');
        });
    }

    // 설정 화면 로그인/회원가입 버튼 연결
    const settingsLoginCard = document.querySelector('.settings-login-card');
    if (settingsLoginCard) {
        const btns = settingsLoginCard.querySelectorAll('button');
        const settingsLoginBtn = btns[0];
        const settingsSignupBtn = btns[1];
        if (settingsLoginBtn) {
            settingsLoginBtn.addEventListener('click', () => {
                const loginOptions = document.getElementById('loginOptions');
                if (loginFrame) { loginFrame.classList.add('hidden'); loginFrame.src=''; }
                if (loginOptions) {
                loginOptions.classList.remove('hidden');
                loginOptions.style.display = 'block';
            }
                if (app) app.classList.remove('analysis-mode');
                if (pageView) pageView.classList.add('hidden');
                if (shopView) shopView.classList.add('hidden');
                if (analysisView) analysisView.classList.add('hidden');
                if (menuView) menuView.classList.add('hidden');
                if (loginView) { loginView.classList.remove('hidden'); loginView.classList.add('visible'); }
            });
        }
        if (settingsSignupBtn) {
            settingsSignupBtn.addEventListener('click', () => {
                const loginOptions = document.getElementById('loginOptions');
                if (loginFrame) { loginFrame.classList.add('hidden'); loginFrame.src=''; }
                if (loginOptions) {
                loginOptions.classList.remove('hidden');
                loginOptions.style.display = 'block';
            }
                if (app) app.classList.remove('analysis-mode');
                if (pageView) pageView.classList.add('hidden');
                if (shopView) shopView.classList.add('hidden');
                if (analysisView) analysisView.classList.add('hidden');
                if (menuView) menuView.classList.add('hidden');
                if (loginView) { loginView.classList.remove('hidden'); loginView.classList.add('visible'); }
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
           console.log('[nav] 메뉴 버튼 클릭됨 (하단)');
           menuView.classList.remove('hidden');
           pageView.classList.add('hidden');
           shopView.classList.add('hidden');
           analysisView.classList.add('hidden');
           app.classList.remove('analysis-mode');
           // 메뉴 화면으로 전환되면 로그인 버튼 재바인딩
           setTimeout(() => bindLoginButton(), 100);
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

    if (mainDisplay) {
        mainDisplay.addEventListener('touchstart', startPressTimer);
        mainDisplay.addEventListener('mousedown', startPressTimer);
    }

    if (mainDisplay) {
        ['touchend', 'touchmove', 'mouseup', 'mouseleave'].forEach(evt => {
            mainDisplay.addEventListener(evt, clearPressTimer);
        });
    }

    function openEditOverlay() {
        editOverlay.classList.remove('hidden');
        requestAnimationFrame(() => editOverlay.classList.add('visible'));
    }

    function closeEditOverlay() {
        editOverlay.classList.remove('visible');
        setTimeout(() => editOverlay.classList.add('hidden'), 300);
    }

    if (editOverlay) {
        editOverlay.addEventListener('click', e => {
            if (e.target === editOverlay) closeEditOverlay();
        });
    }

    if (addPageBtn) addPageBtn.addEventListener('click', () => {
        const pageDiv = createPage(PAGES.length + 1);
        PAGES.push(pageDiv);
        currentPageIdx = PAGES.length - 1;
        refreshPage();
    });

    if (deletePageBtn) deletePageBtn.addEventListener('click', () => {
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
    if (pagesWrapper) pagesWrapper.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    if (pagesWrapper) pagesWrapper.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) < 50) return;
        if (diff < 0 && currentPageIdx < PAGES.length - 1) currentPageIdx++;
        if (diff > 0 && currentPageIdx > 0) currentPageIdx--;
        refreshPage();
    });

    // PC 마우스 스와이프
    if (pagesWrapper) pagesWrapper.addEventListener('mousedown', e => {
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

    // HTML에 <div id="recordDates"></div> 가 반드시 있어야 합니다.
    function setDatesWindow(offsetDays) {
        const recordDates = document.getElementById("recordDates");
        if (!recordDates) return;
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
    // [Product UI] 존재할 때만 바인딩

    function loadProducts() {
        const saved = JSON.parse(localStorage.getItem('productList')||'[]');
        saved.forEach(p=>renderProductCard(p.brand,p.name));
    }

    function saveProducts() {
        const arr=[];
        const productListEl = document.getElementById('productList');
        if (!productListEl) return;
        productListEl.querySelectorAll('.product-card').forEach(card=>{
            arr.push({brand:card.dataset.brand,name:card.dataset.name});
        });
        localStorage.setItem('productList',JSON.stringify(arr));
    }

    function renderProductCard(brand,name,img){
        const productListEl = document.getElementById('productList');
        if (!productListEl) return;
        const card=document.createElement('div');
        card.className='product-card';
        card.dataset.brand=brand;card.dataset.name=name;
        const thumbHtml= img?`<img class="product-thumb" src="${img}">`:`<div class="product-thumb placeholder">＋</div>`;
        card.innerHTML=`${thumbHtml}<h4>${brand}</h4><p>${name}</p><button class="remove">－</button>`;
        const removeBtn = card.querySelector('.remove');
        if (removeBtn) removeBtn.addEventListener('click',()=>{
            card.remove();
            saveProducts();
        });
        productListEl.appendChild(card);
    }

    function createInputCard(){
        const productListEl = $('#productList');
        if (!productListEl) return;
        const wrap=document.createElement('div');
        wrap.className='product-input';
        wrap.innerHTML=`<label class="img-btn" title="이미지 추가">＋<input type="file" accept="image/*" style="display:none"></label><div class="fields"><input placeholder="브랜드"/><input placeholder="제품명"/></div><button class="save">저장</button>`;
        const fileInput=wrap.querySelector('input[type="file"]');
        const brandI=wrap.querySelector('.fields input:nth-child(1)');
        const nameI=wrap.querySelector('.fields input:nth-child(2)');
        let imgData='';
        if (fileInput) fileInput.addEventListener('change',e=>{
           const f=e.target.files && e.target.files[0]; if(!f)return;
           const reader=new FileReader();
           reader.onload=ev=>{imgData=(ev && ev.target && ev.target.result)||'';};
           reader.readAsDataURL(f);
        });
        const saveBtn = wrap.querySelector('.save');
        if (saveBtn) saveBtn.addEventListener('click',()=>{
            const b=(brandI && brandI.value ? brandI.value : '').trim();
            const n=(nameI && nameI.value ? nameI.value : '').trim();
            if(!b||!n)return;
            renderProductCard(b,n,imgData);
            saveProducts();
            wrap.remove();
        });
        productListEl.prepend(wrap);
        if (brandI) brandI.focus();
    }
    const productAddBtn = $('#productAddBtn');
    const productListEl = $('#productList');
    if (productAddBtn && productListEl) {
        on(productAddBtn, 'click', ()=>{
            if(productListEl.querySelector('.product-input'))return;
            createInputCard();
        });
        loadProducts();
    } else {
        console.debug('[product UI] #productAddBtn 또는 #productList 없음 → 이 페이지에서는 스킵');
    }
});

// 이 코드는 이미 위에서 처리되므로 제거

// ------- 알람 리스트 저장/렌더/수정 로직 -------
document.addEventListener('DOMContentLoaded', () => {
  const alarmView = document.getElementById('alarmView');
  const alarmFormView = document.getElementById('alarmFormView');
  const alarmList = document.getElementById('alarmList');
  const addBtn = document.querySelector('.alarm-add');
  const saveBtn = document.getElementById('alarmSaveBtn');
  const cancelBtn = document.getElementById('alarmCancelBtn');

  // [Alarm UI] 요소 존재 확인 후에만 바인딩
  if (!alarmFormView || !alarmView) {
    console.debug('[alarm] alarmFormView/alarmView 없음 → 이 페이지에서는 스킵');
    return;
  }

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

  

  if (cancelBtn && alarmFormView && alarmView) {
    cancelBtn.addEventListener('click', () => {
      alarmFormView.classList.add('hidden');
      alarmView.classList.remove('hidden');
    });
  } else {
    console.warn('[alarm] cancelBtn/alarmFormView/alarmView 요소를 찾지 못했습니다.');
  }

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


