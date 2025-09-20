"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="app">
      {/* Skin Type Button */}
      <button id="skinTypeBtn" className="skin-type-btn">피부 타입</button>

      {/* Popup Card */}
      <div id="skinCard" className="skin-card hidden">
        <div className="card-header">
          <span id="skinTypeLabel">피부 타입</span>
          <button id="closeCard" className="close-btn">&times;</button>
        </div>
        <div className="card-content">
          <p>카드 영역입니다. 사용자별 피부 타입 정보를 표시합니다.</p>
        </div>
      </div>

      {/* Page (기존) View */}
      <div id="pageView" className="view active">
        <main className="main-display">
          <div id="pagesWrapper" className="pages-wrapper"></div>
        </main>
        {/* Page Indicators */}
        <div id="pageIndicators" className="page-indicators"></div>
      </div>

      {/* Analysis View */}
      <div id="analysisView" className="view hidden">
        <div className="analysis-buttons">
          <button className="big-btn">프로필</button>
          <button className="big-btn">데일리</button>
        </div>
        {/* 기록 서브뷰 */}
        <div id="recordView" className="record-view hidden">
          <div className="record-panel">
            <div className="record-legend">
              <label><input type="checkbox" name="metric-moisture" value="수분"/> 수분</label>
              <label><input type="checkbox" name="metric-oil" value="유분"/> 유분</label>
              <label><input type="checkbox" name="metric-trouble" value="트러블"/> 트러블</label>
              <label><input type="checkbox" name="metric-redness" value="홍조"/> 홍조</label>
              <label><input type="checkbox" name="metric-sensitive" value="민감성"/> 민감성</label>
              <label><input type="checkbox" name="metric-pore" value="모공"/> 모공</label>
              <label><input type="checkbox" name="metric-wrinkle" value="주름"/> 주름</label>
              <label><input type="checkbox" name="metric-uniform" value="피부균일"/> 피부균일</label>
              <label><input type="checkbox" name="metric-elastic" value="탄력"/> 탄력</label>
              <label><input type="checkbox" name="metric-spot" value="잡티"/> 잡티</label>
            </div>
            <div className="record-chart" id="recordChartZone">
              <canvas id="recordChart" width={260} height={200}></canvas>
              <div className="record-dates" id="recordDates"></div>
            </div>
          </div>
          <div className="record-info"></div>
        </div>

        {/* 루틴 서브뷰 */}
        <div id="routineView" className="routine-view hidden">
          <header className="routine-header">
            <div className="routine-datebar">
              <button id="routinePrev" className="arrow left" aria-label="이전"></button>
              <span className="date-text" id="routineDate">9월 1일</span>
              <button id="routineNext" className="arrow right" aria-label="다음"></button>
            </div>
            <div className="routine-header-actions">
              <button id="routineModeBtn" className="more-btn" aria-label="모드">⋯</button>
              <div id="routineModeMenu" className="mode-menu hidden">
                <button className="mode-btn" data-mode="add">추가</button>
                <button className="mode-btn" data-mode="remove">제거</button>
              </div>
            </div>
          </header>
          <section className="routine-cards">
            <article className="routine-card" id="morningCard">
              <h3>아침</h3>
              <ul className="routine-list">
                <li><label><input type="checkbox" name="morning-1"/> 약산성 폼클렌저</label></li>
                <li><label><input type="checkbox" name="morning-2"/> 토너</label></li>
                <li><label><input type="checkbox" name="morning-3"/> 에센스</label></li>
                <li><label><input type="checkbox" name="morning-4"/> 선크림</label></li>
              </ul>
              <button className="card-fab btn-add" title="추가">＋</button>
              <button className="card-fab btn-remove" title="제거">−</button>
            </article>
            <article className="routine-card" id="eveningCard">
              <h3>저녁</h3>
              <ul className="routine-list">
                <li><label><input type="checkbox" name="evening-1"/> 오일 클렌저</label></li>
                <li><label><input type="checkbox" name="evening-2"/> 폼 클렌저</label></li>
                <li><label><input type="checkbox" name="evening-3"/> 토너</label></li>
                <li><label><input type="checkbox" name="evening-4"/> 에센스</label></li>
                <li><label><input type="checkbox" name="evening-5"/> 크림</label></li>
              </ul>
              <button className="card-fab btn-add" title="추가">＋</button>
              <button className="card-fab btn-remove" title="제거">−</button>
            </article>
          </section>
          <div className="routine-footer">
            <button className="primary">루틴 완료</button>
          </div>
        </div>

        {/* 내 제품 서브뷰 */}
        <div id="productView" className="product-view hidden">
          <button id="productAddBtn" className="product-add" aria-label="제품 추가">＋</button>
          <div id="productList" className="product-list"></div>
        </div>
        <nav className="analysis-nav">
          <button className="analysis-nav-btn active">분석</button>
          <button className="analysis-nav-btn">기록</button>
          <button className="analysis-nav-btn">루틴</button>
          <button className="analysis-nav-btn">내 제품</button>
        </nav>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-btn" data-label="분석">분석</button>
        <button className="nav-btn" data-label="커뮤니티">커뮤니티</button>
        <button className="nav-btn" data-label="상점">상점</button>
        <button className="nav-btn" data-label="메뉴">메뉴</button>
      </nav>

      {/* Edit Overlay */}
      <div id="editOverlay" className="edit-overlay hidden">
        <div className="edit-panel">
          <button id="addPageBtn" className="edit-btn">페이지 추가</button>
          <button id="deletePageBtn" className="edit-btn">페이지 삭제</button>
          <ul id="pageList" className="page-list"></ul>
        </div>
      </div>

      {/* 상점 뷰 */}
      <div id="shopView" className="shop-view hidden">
        <div className="shop-container">
          <article className="shop-card">
            <div className="thumb placeholder"></div>
            <div className="shop-info">
              <small>옵션: [토리든 공식몰]</small>
              <h4>토리든</h4>
              <p className="desc">다이브인 저분자 히알루론산 멀티 패드</p>
              <p className="tags">수분 공급  /  진정  /  장벽강화</p>
            </div>
            <div className="rate">적합도<br/><span>90%</span></div>
          </article>
          <article className="shop-card">
            <div className="thumb placeholder"></div>
            <div className="shop-info">
              <small>옵션: [토리든 공식몰]</small>
              <h4>토리든</h4>
              <p className="desc">다이브인 저분자 히알루론산 멀티 패드</p>
              <p className="tags">수분 공급  /  진정  /  장벽강화</p>
              <ul className="details">
                <li>부활초추출물을 배합해 수분장벽을 채워 매우 깊은 촉촉함</li>
                <li>판테놀+세라마이드로 손상된 피부 장벽 강화</li>
                <li>티트리추출물·우엉뿌리 복합가루 등 트러블을 빠르게 진정</li>
              </ul>
            </div>
            <div className="rate">적합도<br/><span>90%</span></div>
          </article>
          <p className="notice">*본 정보는 브랜드 공식 자료 기반으로 제공됩니다.</p>
        </div>
      </div>

      {/* 설정 뷰 */}
      <div id="settingsView" className="settings-view hidden">
        <div className="settings-login-card">
          <button className="btn-outline">로그인</button>
          <button className="btn-outline">회원가입</button>
          <div id="settingsEmail" className="settings-email" style={{display:'none'}}></div>
        </div>
        <div className="settings-sep"></div>
        <button className="settings-item">알림 설정(푸쉬)</button>
        <button className="settings-item">1:1 문의하기</button>
        <button className="settings-item">FAQ / 공지사항</button>

        <div className="settings-sep"></div>
        <button className="settings-item">이용약관</button>
        <button className="settings-item">개인정보 처리방침</button>
        <button className="settings-item">오픈소스 라이선스</button>

        <div className="settings-sep"></div>
        <button className="settings-item">
          <span>버전 정보</span>
          <span className="muted">ver. 1.1</span>
        </button>
        <button className="settings-item">서비스 소개</button>

        <div className="settings-sep"></div>
        <button id="logoutBtn" className="settings-item" style={{display:'none'}}>로그아웃</button>
        <button className="settings-item">닉네임 변경</button>
        <button className="settings-item">비밀번호 변경</button>
        <button className="settings-item">회원탈퇴</button>
      </div>

      {/* 알람 뷰 */}
      <div id="alarmView" className="alarm-view hidden">
        <header className="alarm-header">
          <h3 className="alarm-title">알람</h3>
          <button className="hamburger" aria-label="메뉴">≡</button>
        </header>
        <div className="alarm-body">
          <div id="alarmList" className="alarm-list"></div>
        </div>
        <button className="alarm-add" aria-label="알람 추가">＋</button>
      </div>

      {/* 알람 생성 폼 뷰 */}
      <div id="alarmFormView" className="alarm-form hidden">
        <div className="time-row">
          <div className="ampm-group" data-target="start">
            <button className="ampm-btn active" data-value="AM">오전</button>
            <button className="ampm-btn" data-value="PM">오후</button>
          </div>
          <div className="time-inputs" data-target="start">
            <input className="time-num" name="startHour" maxLength={2} inputMode="numeric" placeholder="00" autoComplete="off"/> :
            <input className="time-num" name="startMinute" maxLength={2} inputMode="numeric" placeholder="00" autoComplete="off"/>
          </div>
        </div>
        <div className="tilde">~</div>
        <div className="time-row">
          <div className="ampm-group" data-target="end">
            <button className="ampm-btn active" data-value="AM">오전</button>
            <button className="ampm-btn" data-value="PM">오후</button>
          </div>
          <div className="time-inputs" data-target="end">
            <input className="time-num" name="endHour" maxLength={2} inputMode="numeric" placeholder="00" autoComplete="off"/> :
            <input className="time-num" name="endMinute" maxLength={2} inputMode="numeric" placeholder="00" autoComplete="off"/>
          </div>
        </div>
        <div className="repeat-row">
          <label className="repeat-label" htmlFor="repeatAll">매일</label>
          <input id="repeatAll" type="checkbox" className="repeat-all"/>
        </div>
        <div className="weekday-row">
          <button className="weekday-btn" data-day="0">일</button>
          <button className="weekday-btn" data-day="1">월</button>
          <button className="weekday-btn" data-day="2">화</button>
          <button className="weekday-btn" data-day="3">수</button>
          <button className="weekday-btn" data-day="4">목</button>
          <button className="weekday-btn" data-day="5">금</button>
          <button className="weekday-btn" data-day="6">토</button>
        </div>
        <div className="save-row">
          <button id="alarmCancelBtn" className="alarm-cancel">취소</button>
          <button id="alarmSaveBtn" className="alarm-save">저장</button>
        </div>
      </div>

      {/* 메뉴 뷰 */}
      <div id="menuView" className="menu-view hidden">
        <header className="menu-header">
          <div className="menu-bar">
            <span></span>
            <button id="loginBtn" className="login-btn">로그인</button>
          </div>
        </header>
        <div className="menu-grid">
          <button className="circle-btn" data-go="analysis">분석</button>
          <button className="circle-btn" data-go="community">커뮤니티</button>
          <button className="circle-btn" data-go="shop">상점</button>
          <button className="circle-btn" data-go="camera">카메라</button>
          <button className="circle-btn" data-go="gallery">갤러리</button>
          <button className="circle-btn" data-go="alarm">알람</button>
          <button className="circle-btn" data-go="settings">설정</button>
          <button className="circle-btn disabled"></button>
          <button className="circle-btn disabled"></button>
          <button className="circle-btn disabled"></button>
          <button className="circle-btn disabled"></button>
          <button className="circle-btn disabled"></button>
        </div>
      {/* 랜딩(홈)에서만 index.js 로드 */}
      <Script src="/index.js" strategy="afterInteractive" />
    </div>
  )
}


