/**
 * 民德市政府官網 - 核心互動邏輯 (Main App Script)
 * 智慧民德．幸福永續
 */

document.addEventListener('DOMContentLoaded', () => {
  initAccessibility();
  initHeader();
  initHeroSlider();
  initQuickSearchModal();
  initBackToTop();
});

/* ========================================================
   1. 無障礙工具列 (Accessibility Tools)
   ======================================================== */
function initAccessibility() {
  // 字體大小縮放
  const fontBtns = document.querySelectorAll('.font-size-btn');
  const savedScale = localStorage.getItem('mindegov_font_scale') || '1';
  
  applyFontScale(savedScale);

  fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = btn.getAttribute('data-scale');
      applyFontScale(scale);
      localStorage.setItem('mindegov_font_scale', scale);
      showToast(`已切換字體大小至 ${btn.textContent}`, 'info');
    });
  });

  function applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', scale);
    fontBtns.forEach(b => {
      if (b.getAttribute('data-scale') === scale) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  // 高對比無障礙模式切換
  const contrastBtn = document.getElementById('contrastToggleBtn');
  const savedTheme = localStorage.getItem('mindegov_theme');

  if (savedTheme === 'contrast') {
    document.documentElement.setAttribute('data-theme', 'contrast');
  }

  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'contrast') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('mindegov_theme', 'default');
        showToast('已切換為標準色彩模式', 'info');
      } else {
        document.documentElement.setAttribute('data-theme', 'contrast');
        localStorage.setItem('mindegov_theme', 'contrast');
        showToast('已啟用高對比無障礙模式', 'info');
      }
    });
  }

  // 緊急跑馬燈關閉按鈕
  const tickerClose = document.getElementById('tickerCloseBtn');
  const emergencyTicker = document.getElementById('emergencyTicker');
  if (tickerClose && emergencyTicker) {
    tickerClose.addEventListener('click', () => {
      emergencyTicker.style.display = 'none';
    });
  }
}

/* ========================================================
   2. 導覽列與行動版選單 (Header & Mobile Navigation)
   ======================================================== */
function initHeader() {
  const header = document.querySelector('.main-header');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  // 滾動時標頭浮動立體陰影
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 行動版選單切換
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      const isOpen = mainNav.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // 點擊導覽連結時自動關閉行動版選單
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');

        // 啟動當前 active 標籤
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
}

/* ========================================================
   3. 首頁英雄輪播控制 (Hero Carousel)
   ======================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  let currentIndex = 0;
  let autoplayTimer = null;
  const slideInterval = 6500;

  if (slides.length === 0) return;

  function showSlide(index) {
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, slideInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoplay();
    });
  });

  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
  }

  startAutoplay();
}

/* ========================================================
   4. 全站快速搜尋對話框 (Global Search Modal)
   ======================================================== */
function initQuickSearchModal() {
  const searchTriggers = document.querySelectorAll('.quick-search-trigger');
  const modal = document.getElementById('globalSearchModal');
  const closeBtn = document.getElementById('closeSearchModalBtn');
  const searchInput = document.getElementById('globalSearchInput');
  const resultsContainer = document.getElementById('globalSearchResults');

  if (!modal || !searchInput) return;

  searchTriggers.forEach(btn => {
    btn.addEventListener('click', openSearch);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSearch);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  // 鍵盤快速鍵監聽 (Ctrl+K 或 / 鍵開啟搜尋，Esc 關閉)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape') {
      closeSearch();
      closeAllModals();
    }
  });

  function openSearch() {
    modal.classList.add('active');
    searchInput.value = '';
    searchInput.focus();
    renderSearchSuggestions();
  }

  function closeSearch() {
    modal.classList.remove('active');
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      renderSearchSuggestions();
      return;
    }
    performSearch(query);
  });

  function renderSearchSuggestions() {
    resultsContainer.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
        <p style="margin-bottom: 0.8rem; font-weight: 600;">熱門便民關鍵字探索：</p>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem;">
          <button class="filter-pill search-chip" data-kw="戶籍">戶籍謄本</button>
          <button class="filter-pill search-chip" data-kw="垃圾車">垃圾車清運</button>
          <button class="filter-pill search-chip" data-kw="租金補貼">青年租金補貼</button>
          <button class="filter-pill search-chip" data-kw="停車">路邊停車費</button>
          <button class="filter-pill search-chip" data-kw="光影藝術季">水岸光影藝術季</button>
          <button class="filter-pill search-chip" data-kw="公托">社區公共托育</button>
        </div>
      </div>
    `;

    resultsContainer.querySelectorAll('.search-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        searchInput.value = chip.getAttribute('data-kw');
        performSearch(chip.getAttribute('data-kw').toLowerCase());
      });
    });
  }

  function performSearch(kw) {
    const annMatches = (window.MINDE_DATA?.announcements || []).filter(a =>
      a.title.toLowerCase().includes(kw) || a.summary.toLowerCase().includes(kw) || a.bureau.toLowerCase().includes(kw)
    );

    const srvMatches = (window.MINDE_DATA?.quickServices || []).filter(s =>
      s.title.toLowerCase().includes(kw) || s.desc.toLowerCase().includes(kw) || s.bureau.toLowerCase().includes(kw)
    );

    const deptMatches = (window.MINDE_DATA?.departments || []).filter(d =>
      d.name.toLowerCase().includes(kw) || d.intro.toLowerCase().includes(kw) || d.duties.some(item => item.toLowerCase().includes(kw))
    );

    const total = annMatches.length + srvMatches.length + deptMatches.length;

    if (total === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
          <svg style="width: 48px; height: 48px; stroke: var(--border-medium); margin-bottom: 0.8rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <p style="font-weight: 600;">抱歉，找不到與「${kw}」相符的市政資訊。</p>
          <p style="font-size: 0.85rem; margin-top: 0.3rem;">請嘗試輸入其他關鍵字，或撥打 1999 市民當家熱線洽詢。</p>
        </div>
      `;
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0;">`;

    if (srvMatches.length > 0) {
      html += `<div style="font-weight: 700; color: var(--gov-blue); font-size: 0.9rem; padding: 0 0.5rem;">便民服務申辦 (${srvMatches.length})</div>`;
      srvMatches.forEach(s => {
        html += `
          <div class="announcement-item" onclick="openServiceModal('${s.id}'); document.getElementById('globalSearchModal').classList.remove('active');">
            <div class="announcement-main">
              <span class="category-badge primary">線上申辦</span>
              <span class="announcement-title">${highlightText(s.title, kw)}</span>
            </div>
            <div class="announcement-meta">
              <span class="announcement-bureau">${s.bureau}</span>
            </div>
          </div>
        `;
      });
    }

    if (annMatches.length > 0) {
      html += `<div style="font-weight: 700; color: var(--gov-navy); font-size: 0.9rem; padding: 0.5rem 0.5rem 0;">最新公告消息 (${annMatches.length})</div>`;
      annMatches.forEach(a => {
        html += `
          <div class="announcement-item" onclick="openAnnouncementModal('${a.id}'); document.getElementById('globalSearchModal').classList.remove('active');">
            <div class="announcement-main">
              <span class="category-badge ${a.badgeColor}">${a.categoryName}</span>
              <span class="announcement-title">${highlightText(a.title, kw)}</span>
            </div>
            <div class="announcement-meta">
              <span>${a.date}</span>
            </div>
          </div>
        `;
      });
    }

    if (deptMatches.length > 0) {
      html += `<div style="font-weight: 700; color: var(--gov-emerald); font-size: 0.9rem; padding: 0.5rem 0.5rem 0;">市府局處組織 (${deptMatches.length})</div>`;
      deptMatches.forEach(d => {
        html += `
          <div class="announcement-item" onclick="openDepartmentModal('${d.id}'); document.getElementById('globalSearchModal').classList.remove('active');">
            <div class="announcement-main">
              <span class="category-badge info">${d.name}</span>
              <span class="announcement-title">${highlightText(d.intro.slice(0, 50) + '...', kw)}</span>
            </div>
            <div class="announcement-meta">
              <span>${d.phone}</span>
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;
    resultsContainer.innerHTML = html;
  }

  function highlightText(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark style="background: #fef08a; padding: 0 2px; border-radius: 2px;">$1</mark>');
  }
}

/* ========================================================
   5. 回到頂端浮動按鈕 (Back To Top)
   ======================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ========================================================
   6. 快訊提示通用函式 (Toast Notification)
   ======================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = `
    <svg style="width: 20px; height: 20px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  if (type === 'success') {
    iconSvg = `
      <svg style="width: 20px; height: 20px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // 動畫展開
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
}

function openEmblemModal() {
  const modal = document.getElementById('emblemDetailModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// 通用對話框關閉綁定
document.addEventListener('click', (e) => {
  if (e.target.matches('.modal-close-btn') || e.target.closest('.modal-close-btn')) {
    closeAllModals();
  }
  if (e.target.classList.contains('modal-backdrop')) {
    closeAllModals();
  }
});

// ESC 鍵快速關閉所有 Modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

window.showToast = showToast;
window.closeAllModals = closeAllModals;
window.openEmblemModal = openEmblemModal;
