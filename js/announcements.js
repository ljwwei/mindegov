/**
 * 民德市政府官網 - 最新公告與便民服務互動模組 (Announcements & Services Module)
 * 智慧民德．幸福永續
 *
 * 串接 Cloudflare Worker + D1 同步最新公告、市府活動及真實公告點擊累計次數；
 * 若無法連線後端，則平滑降級顯示本地靜態備援資料。
 */

const ANNOUNCEMENTS_FALLBACK_API = 'https://mindegov-mailbox.gamerwillywilly.workers.dev';

function getAnnouncementsApiBase() {
  if (typeof window !== 'undefined') {
    if (typeof window.getMindeApiBase === 'function') return window.getMindeApiBase();
    if (window.MINDE_MAILBOX_API) return String(window.MINDE_MAILBOX_API).replace(/\/+$/, '');
  }
  return ANNOUNCEMENTS_FALLBACK_API;
}

function escapeAnnHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeSafeUrl(raw) {
  const s = String(raw || '').trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (/^assets\/images\/[a-zA-Z0-9_.-]+$/.test(s)) return s;
  return '';
}

function renderSafeAnnouncementBody(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (!/<[a-zA-Z][\s\S]*>/.test(text)) {
    return text
      .split(/\r?\n\r?\n+/)
      .map(p => `<p>${escapeAnnHtml(p.trim()).replace(/\r?\n/g, '<br>')}</p>`)
      .join('\n');
  }
  return text
    .replace(/<(script|style|iframe|object|embed|svg|form|input|meta|link)\b[\s\S]*?>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|form|input|meta|link)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(?:"\s*(?:javascript|data):[^"]*"|'\s*(?:javascript|data):[^']*')/gi, '$1="#"');
}

document.addEventListener('DOMContentLoaded', () => {
  initAnnouncements();
  initQuickServices();
  initCityEvents();
  initModalListeners();
  syncPublicAnnouncementsAndEvents();
});

/* ========================================================
   1. 最新公告模組 (Announcements Module)
   ======================================================== */
let currentCategory = 'all';
let currentSearchKeyword = '';
let activeModalAnnouncementId = '';
let remoteAnnouncementsLoaded = false;
let remoteEventsLoaded = false;

async function syncPublicAnnouncementsAndEvents() {
  const apiBase = getAnnouncementsApiBase();
  if (!apiBase || !window.MINDE_DATA) return;

  const [annRes, evtRes] = await Promise.allSettled([
    fetch(`${apiBase}/api/announcements`, { cache: 'no-store' }),
    fetch(`${apiBase}/api/events`, { cache: 'no-store' })
  ]);

  if (annRes.status === 'fulfilled' && annRes.value.ok) {
    try {
      const data = await annRes.value.json();
      if (data?.ok && Array.isArray(data.announcements)) {
        window.MINDE_DATA.announcements = data.announcements.map(item => ({
          ...item,
          views: Number(item.clicks ?? item.views ?? 0)
        }));
      }
    } catch {
      // ignore parse error, keep fallback data
    }
  }
  remoteAnnouncementsLoaded = true;
  renderAnnouncementsList();

  if (evtRes.status === 'fulfilled' && evtRes.value.ok) {
    try {
      const data = await evtRes.value.json();
      if (data?.ok && Array.isArray(data.events)) {
        window.MINDE_DATA.cityEvents = data.events;
      }
    } catch {
      // ignore parse error, keep fallback data
    }
  }
  remoteEventsLoaded = true;
  renderCityEventsGrid();
}

function initAnnouncements() {
  const tabs = document.querySelectorAll('.announcement-tab');
  const searchInput = document.getElementById('announcementSearchInput');
  const viewAllBtn = document.getElementById('viewAllAnnouncementsBtn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      renderAnnouncementsList();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchKeyword = e.target.value.trim().toLowerCase();
      renderAnnouncementsList();
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentSearchKeyword = '';
      if (searchInput) searchInput.value = '';
      tabs.forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-category') === 'all');
      });
      renderAnnouncementsList();
      const count = (window.MINDE_DATA?.announcements || []).length;
      if (typeof window.showToast === 'function') {
        window.showToast(`已為您呈現全體 ${count} 筆市政公告`, 'info');
      }
    });
  }

  const listContainer = document.getElementById('announcementsListContainer');
  if (listContainer && !remoteAnnouncementsLoaded) {
    listContainer.innerHTML = `
      <div style="padding: 2.25rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-sm);">
        正在載入最新市政公告...
      </div>
    `;
  }
}

function renderAnnouncementsList() {
  const listContainer = document.getElementById('announcementsListContainer');
  if (!listContainer || !window.MINDE_DATA) return;

  const data = window.MINDE_DATA.announcements || [];

  const filtered = data.filter(item => {
    const matchesCat = currentCategory === 'all' || item.category === currentCategory;
    const matchesKw = !currentSearchKeyword ||
      String(item.title || '').toLowerCase().includes(currentSearchKeyword) ||
      String(item.bureau || '').toLowerCase().includes(currentSearchKeyword) ||
      String(item.summary || '').toLowerCase().includes(currentSearchKeyword);
    return matchesCat && matchesKw;
  });

  // 置頂公告排序最前，其次依發布日期新至舊
  filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div style="padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-sm);">
        <p style="font-weight: 600; font-size: 1.05rem;">目前此分類下暫無符合條件之公告資訊</p>
        <p style="font-size: 0.85rem; margin-top: 0.4rem;">您可以切換至其他標籤頁或清空搜尋字詞。</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const safeId = escapeAnnHtml(item.id);
    const clickCount = Number(item.clicks ?? item.views ?? 0);
    const pinnedHtml = item.isPinned ? `
      <span class="pinned-icon" title="重要置頂公告">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        [置頂]
      </span>
    ` : '';

    html += `
      <div class="announcement-item ${item.isPinned ? 'is-pinned' : ''}" onclick="openAnnouncementModal('${safeId}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openAnnouncementModal('${safeId}');}" role="button" tabindex="0">
        <div class="announcement-main">
          <span class="category-badge ${escapeAnnHtml(item.badgeColor)}">${escapeAnnHtml(item.categoryName)}</span>
          <span class="announcement-title">
            ${pinnedHtml}
            ${escapeAnnHtml(item.title)}
          </span>
        </div>
        <div class="announcement-meta">
          <span class="announcement-bureau">${escapeAnnHtml(item.bureau)}</span>
          <span class="announcement-date">${escapeAnnHtml(item.date)}</span>
          <span class="announcement-views" data-ann-views="${safeId}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            ${clickCount.toLocaleString('zh-TW')}
          </span>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

// 開啟公告詳情對話框並累計真實點擊次數
function openAnnouncementModal(id) {
  const item = (window.MINDE_DATA?.announcements || []).find(a => a.id === id);
  if (!item) return;

  const modal = document.getElementById('announcementDetailModal');
  const titleEl = document.getElementById('modalNoticeTitle');
  const metaEl = document.getElementById('modalNoticeMeta');
  const contentEl = document.getElementById('modalNoticeContent');
  const attachmentsEl = document.getElementById('modalNoticeAttachments');

  if (!modal) return;

  activeModalAnnouncementId = id;
  const optimisticClicks = Number(item.clicks ?? item.views ?? 0) + 1;
  item.views = optimisticClicks;
  item.clicks = optimisticClicks;

  titleEl.textContent = item.title;
  metaEl.innerHTML = `
    <span class="category-badge ${escapeAnnHtml(item.badgeColor)}">${escapeAnnHtml(item.categoryName)}</span>
    <span>發布單位：<strong>${escapeAnnHtml(item.bureau)}</strong></span>
    <span>發布日期：${escapeAnnHtml(item.date)}</span>
    <span id="modalNoticeClicks">點閱人次：${optimisticClicks.toLocaleString('zh-TW')} 次</span>
  `;

  contentEl.innerHTML = `
    <div style="background: var(--bg-surface-raised); padding: 1rem 1.25rem; border-left: 4px solid var(--gov-blue); border-radius: var(--radius-sm); margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--text-sub);">
      <strong>【公告摘要】</strong>${escapeAnnHtml(item.summary)}
    </div>
    ${renderSafeAnnouncementBody(item.content)}
  `;

  if (item.attachments && item.attachments.length > 0) {
    let attHtml = `
      <div style="margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--gov-navy);">相關附件與參考資料：</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    `;
    item.attachments.forEach(att => {
      const safeName = escapeAnnHtml(att.name);
      const safeSize = escapeAnnHtml(att.size || '');
      const safeUrl = sanitizeSafeUrl(att.url);
      const actionControl = safeUrl
        ? `<a href="${escapeAnnHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.3rem 0.75rem; font-size: 0.78rem; text-decoration: none;">開啟連結</a>`
        : `<button type="button" class="btn btn-secondary" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;" onclick="showToast('已開始下載附件：${safeName}', 'success')">下載檔案</button>`;

      attHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.9rem; background: var(--bg-surface-raised); border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.88rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg style="width: 18px; height: 18px; stroke: var(--gov-blue);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>${safeName}${safeSize ? ` (${safeSize})` : ''}</span>
          </div>
          ${actionControl}
        </div>
      `;
    });
    attHtml += `</div></div>`;
    attachmentsEl.innerHTML = attHtml;
  } else {
    attachmentsEl.innerHTML = '';
  }

  renderAnnouncementsList();
  modal.classList.add('active');
  recordAnnouncementClick(id);
}

async function recordAnnouncementClick(id) {
  const apiBase = getAnnouncementsApiBase();
  if (!apiBase) return;

  try {
    const res = await fetch(`${apiBase}/api/announcements/${encodeURIComponent(id)}/click`, {
      method: 'POST',
      keepalive: true,
      cache: 'no-store'
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data?.ok || typeof data.clicks !== 'number') return;

    const item = (window.MINDE_DATA?.announcements || []).find(a => a.id === id);
    if (item) {
      item.clicks = data.clicks;
      item.views = data.clicks;
    }

    if (activeModalAnnouncementId === id) {
      const clickEl = document.getElementById('modalNoticeClicks');
      if (clickEl) {
        clickEl.textContent = `點閱人次：${data.clicks.toLocaleString('zh-TW')} 次`;
      }
    }

    renderAnnouncementsList();
  } catch (err) {
    console.warn('[公告點擊] 累計失敗', err);
  }
}

/* ========================================================
   2. 便民服務快速入口模組 (Quick Services Module)
   ======================================================== */
let currentServiceCategory = 'all';

function initQuickServices() {
  const pills = document.querySelectorAll('.service-filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentServiceCategory = pill.getAttribute('data-service-cat');
      renderQuickServicesGrid();
    });
  });

  renderQuickServicesGrid();
}

function renderQuickServicesGrid() {
  const container = document.getElementById('servicesGridContainer');
  if (!container || !window.MINDE_DATA) return;

  const services = window.MINDE_DATA.quickServices || [];
  const filtered = services.filter(s => {
    return currentServiceCategory === 'all' || s.category === currentServiceCategory;
  });

  // SVG 圖標對照表
  const iconSvgs = {
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    'dollar-sign': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    'tool': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    'book-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    'navigation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    'truck': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  };

  let html = '';
  filtered.forEach(item => {
    const icon = iconSvgs[item.icon] || iconSvgs['tool'];
    html += `
      <div class="service-card" onclick="openServiceModal('${item.id}')" role="button" tabindex="0">
        <div class="service-card-top">
          <div class="service-icon-box">
            ${icon}
          </div>
          <span class="service-tag">${item.tag}</span>
        </div>
        <h3 class="service-title">${item.title}</h3>
        <span class="service-bureau">${item.bureau}</span>
        <p class="service-desc">${item.desc}</p>
        <div class="service-card-action">
          <span>線上即辦與須知</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openServiceModal(id) {
  const service = (window.MINDE_DATA?.quickServices || []).find(s => s.id === id);
  if (!service) return;

  const modal = document.getElementById('serviceDetailModal');
  const titleEl = document.getElementById('modalServiceTitle');
  const bodyEl = document.getElementById('modalServiceBody');

  if (!modal) return;

  titleEl.textContent = service.title;
  bodyEl.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; background: var(--gov-blue-subtle); padding: 0.85rem 1.25rem; border-radius: var(--radius-sm);">
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">主辦機關：</span>
        <strong style="color: var(--gov-navy);">${service.bureau}</strong>
      </div>
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">辦理時效：</span>
        <strong style="color: var(--gov-emerald);">${service.processingTime}</strong>
      </div>
    </div>
    
    <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">申辦說明：</h4>
    <p style="color: var(--text-sub); margin-bottom: 1.5rem; line-height: 1.6;">${service.desc}</p>
    
    <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">應備證件與文件清單：</h4>
    <ul style="padding-left: 1.25rem; color: var(--text-sub); margin-bottom: 2rem; line-height: 1.8;">
      ${service.requirements.map(req => `<li>${req}</li>`).join('')}
    </ul>

    <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; font-size: 0.85rem; color: #92400e;">
      <strong>貼心提醒：</strong>線上申辦系統已全面串接內政部行動自然人憑證與 MyData 數位服務，無需親臨各區公所櫃檯排隊。
    </div>

    <div style="text-align: center;">
      <button class="btn btn-primary" style="width: 100%; padding: 0.85rem;" onclick="showToast('已為您開啟『${service.title}』線上申辦引導！', 'success'); closeAllModals();">
        開始線上申請 (前往數位櫃檯)
      </button>
    </div>
  `;

  modal.classList.add('active');
}

/* ========================================================
   3. 市府活動專區模組 (City Events Module)
   ======================================================== */
function initCityEvents() {
  const container = document.getElementById('cityEventsGridContainer');
  if (container && !remoteEventsLoaded) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2.25rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-sm);">
        正在載入市府重大活動資訊...
      </div>
    `;
  }
}

function renderCityEventsGrid() {
  const container = document.getElementById('cityEventsGridContainer');
  if (!container || !window.MINDE_DATA) return;

  const events = window.MINDE_DATA.cityEvents || [];
  if (events.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-sm);">
        目前暫無已發布之市府重大活動。
      </div>
    `;
    return;
  }

  let html = '';
  events.forEach(item => {
    const safeId = escapeAnnHtml(item.id);
    const safeImg = escapeAnnHtml(sanitizeSafeUrl(item.image) || 'assets/images/minde_city_hall.jpg');
    html += `
      <div class="event-card">
        <div class="event-media">
          <img src="${safeImg}" alt="${escapeAnnHtml(item.title)}" class="event-img" loading="lazy">
          <span class="event-status-pill ${escapeAnnHtml(item.status)}">${escapeAnnHtml(item.statusLabel)}</span>
        </div>
        <div class="event-body">
          <div class="event-date-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${escapeAnnHtml(item.dateRange)}</span>
          </div>
          <h3 class="event-title">${escapeAnnHtml(item.title)}</h3>
          <div class="event-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${escapeAnnHtml(item.location)}</span>
          </div>
          <p class="event-desc">${escapeAnnHtml(item.description)}</p>
          <div class="event-footer">
            <span class="event-participants">${escapeAnnHtml(item.participants)}</span>
            <button class="btn btn-secondary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" onclick="openEventRegisterModal('${safeId}')">
              我要報名 / 詳情
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openEventRegisterModal(id) {
  const event = (window.MINDE_DATA?.cityEvents || []).find(e => e.id === id);
  if (!event) return;

  const modal = document.getElementById('eventRegisterModal');
  const titleEl = document.getElementById('modalEventTitle');
  const bodyEl = document.getElementById('modalEventBody');

  if (!modal) return;

  const safeImg = escapeAnnHtml(sanitizeSafeUrl(event.image) || 'assets/images/minde_city_hall.jpg');
  const highlights = Array.isArray(event.highlights) ? event.highlights : [];
  const highlightsBlock = highlights.length > 0 ? `
      <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">活動焦點亮點：</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1.5rem;">
        ${highlights.map(h => `
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; background: var(--bg-surface-raised); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);">
            <svg style="width: 16px; height: 16px; stroke: var(--gov-emerald);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${escapeAnnHtml(h)}</span>
          </div>
        `).join('')}
      </div>
  ` : '';

  titleEl.textContent = event.title;
  bodyEl.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <img src="${safeImg}" alt="${escapeAnnHtml(event.title)}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <p style="color: var(--text-sub); line-height: 1.7; margin-bottom: 1.25rem;">${escapeAnnHtml(event.description)}</p>
      ${highlightsBlock}
      <div style="border-top: 1px solid var(--border-light); padding-top: 1.25rem;">
        <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.85rem;">市民線上預約報名：</h4>
        <div class="form-grid" style="margin-bottom: 1rem;">
          <div class="form-group">
            <label class="form-label">參加者姓名 <span class="required-star">*</span></label>
            <input type="text" class="form-control" id="evtRegName" placeholder="請輸入全名">
          </div>
          <div class="form-group">
            <label class="form-label">聯絡電話 <span class="required-star">*</span></label>
            <input type="tel" class="form-control" id="evtRegPhone" placeholder="例如：0912-345-678">
          </div>
        </div>
        <button class="btn btn-primary" style="width: 100%;" onclick="submitEventRegistration('${escapeAnnHtml(event.id)}')">送出報名申請</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function submitEventRegistration(eventIdOrTitle) {
  const name = document.getElementById('evtRegName')?.value.trim();
  const phone = document.getElementById('evtRegPhone')?.value.trim();

  if (!name || !phone) {
    showToast('請完整填寫參加者姓名與聯絡電話！', 'error');
    return;
  }

  const matched = (window.MINDE_DATA?.cityEvents || []).find(e => e.id === eventIdOrTitle);
  const eventName = matched ? matched.title : eventIdOrTitle;
  showToast(`恭喜 ${name}！您已成功預約「${eventName}」，電子票券已簡訊發送至 ${phone}`, 'success');
  closeAllModals();
}

/* ========================================================
   4. 通用對話框關閉監聽 (Modal General Listeners)
   ======================================================== */
function initModalListeners() {
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });
}

window.openAnnouncementModal = openAnnouncementModal;
window.openServiceModal = openServiceModal;
window.openEventRegisterModal = openEventRegisterModal;
window.submitEventRegistration = submitEventRegistration;
