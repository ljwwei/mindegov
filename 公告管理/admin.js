/**
 * 民德市政府 - 非公開市政公告與重大活動管理後台 (/公告管理)
 */

const ADMIN_TOKEN_STORAGE_KEY = 'mindegov_ann_admin_token';

const state = {
  token: '',
  visits: 0,
  announcements: [],
  events: [],
  annCategoryFilter: 'all',
  annKeyword: ''
};

function getAdminApiBase() {
  if (typeof window.getMindeApiBase === 'function') return window.getMindeApiBase();
  return String(window.MINDE_MAILBOX_API || 'https://mindegov-mailbox.gamerwillywilly.workers.dev').replace(/\/+$/, '');
}

function escapeAdminHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolvePreviewImageSrc(raw) {
  const s = String(raw || '').trim();
  if (!s) return '../assets/images/minde_city_hall.jpg';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('assets/')) return '../' + s;
  return '../assets/images/minde_city_hall.jpg';
}

function getTodayTaiwanDate() {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function getStoredToken() {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveStoredToken(token) {
  state.token = token;
  try {
    if (token) sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    else sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

async function adminApiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const res = await fetch(`${getAdminApiBase()}${path}`, {
    ...options,
    headers,
    cache: 'no-store'
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/api/admin/login') {
    saveStoredToken('');
    showLoginView(data.error || '登入逾時，請重新輸入管理員密碼');
    throw new Error(data.error || '登入憑證已逾時');
  }
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `操作失敗 (HTTP ${res.status})`);
  }
  return data;
}

function showLoginView(errorMessage = '') {
  document.getElementById('adminLoginSection').style.display = 'flex';
  document.getElementById('adminDashboardSection').style.display = 'none';
  document.getElementById('adminLogoutBtn').style.display = 'none';

  const banner = document.getElementById('loginErrorBanner');
  if (errorMessage) {
    banner.textContent = errorMessage;
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
}

function showDashboardView() {
  document.getElementById('adminLoginSection').style.display = 'none';
  document.getElementById('adminDashboardSection').style.display = 'block';
  document.getElementById('adminLogoutBtn').style.display = 'inline-flex';
}

document.addEventListener('DOMContentLoaded', () => {
  bindLoginHandlers();
  bindDashboardHandlers();
  bindEditorModalHandlers();

  const existingToken = getStoredToken();
  if (existingToken) {
    state.token = existingToken;
    loadAdminOverview()
      .then(() => showDashboardView())
      .catch(err => showLoginView(err.message));
  } else {
    showLoginView();
  }
});

function bindLoginHandlers() {
  const form = document.getElementById('adminLoginForm');
  const pwInput = document.getElementById('adminPasswordInput');
  const submitBtn = document.getElementById('adminLoginSubmitBtn');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = pwInput.value;
    if (!password) return;

    const prevText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '身分驗證中...';

    try {
      const data = await adminApiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      saveStoredToken(data.token);
      pwInput.value = '';
      document.getElementById('loginErrorBanner').style.display = 'none';
      await loadAdminOverview();
      showDashboardView();
      window.showToast?.('管理員身分驗證成功', 'success');
    } catch (err) {
      showLoginView(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText;
    }
  });

  logoutBtn.addEventListener('click', () => {
    saveStoredToken('');
    showLoginView();
    window.showToast?.('已安全登出管理後台', 'info');
  });
}

function bindDashboardHandlers() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-admin-tab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.getElementById('tabPaneAnnouncements').style.display = target === 'announcements' ? 'block' : 'none';
      document.getElementById('tabPaneEvents').style.display = target === 'events' ? 'block' : 'none';
    });
  });

  document.getElementById('adminAnnCategoryFilter').addEventListener('change', (e) => {
    state.annCategoryFilter = e.target.value;
    renderAdminAnnouncements();
  });

  document.getElementById('adminAnnSearchInput').addEventListener('input', (e) => {
    state.annKeyword = e.target.value.trim().toLowerCase();
    renderAdminAnnouncements();
  });

  const refreshFn = async () => {
    try {
      await loadAdminOverview();
      window.showToast?.('已同步最新雲端資料', 'success');
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  };
  document.getElementById('refreshOverviewBtn').addEventListener('click', refreshFn);
  document.getElementById('refreshEventsBtn').addEventListener('click', refreshFn);

  document.getElementById('resetVisitsBtn').addEventListener('click', async () => {
    if (!confirm('確定要將官網「累積瀏覽總人次」歸零嗎？此動作會立即更新首頁統計數字。')) return;
    try {
      const data = await adminApiFetch('/api/admin/stats/reset-visits', { method: 'POST', body: '{}' });
      state.visits = Number(data.visits || 0);
      renderKpis();
      window.showToast?.('累積瀏覽總人次已歸零', 'success');
    } catch (err) {
      window.showToast?.(err.message, 'error');
    }
  });

  document.getElementById('newAnnouncementBtn').addEventListener('click', () => openAnnouncementEditor(null));
  document.getElementById('newEventBtn').addEventListener('click', () => openEventEditor(null));
}

async function loadAdminOverview() {
  const data = await adminApiFetch('/api/admin/overview', { method: 'GET' });
  state.visits = Number(data.visits || 0);
  state.announcements = Array.isArray(data.announcements) ? data.announcements : [];
  state.events = Array.isArray(data.events) ? data.events : [];
  renderKpis();
  renderAdminAnnouncements();
  renderAdminEvents();
}

function renderKpis() {
  const pubAnns = state.announcements.filter(a => a.isPublished).length;
  const totalAnnClicks = state.announcements.reduce((sum, a) => sum + Number(a.clicks ?? a.views ?? 0), 0);
  const pubEvents = state.events.filter(e => e.isPublished).length;

  document.getElementById('kpiTotalVisits').textContent = state.visits.toLocaleString('zh-TW');
  document.getElementById('kpiAnnouncementsCount').textContent = `${pubAnns} / ${state.announcements.length}`;
  document.getElementById('kpiTotalAnnClicks').textContent = totalAnnClicks.toLocaleString('zh-TW');
  document.getElementById('kpiEventsCount').textContent = `${pubEvents} / ${state.events.length}`;
}

function renderAdminAnnouncements() {
  const container = document.getElementById('adminAnnouncementsList');
  const filtered = state.announcements.filter(item => {
    const matchCat = state.annCategoryFilter === 'all' || item.category === state.annCategoryFilter;
    const matchKw = !state.annKeyword ||
      String(item.title || '').toLowerCase().includes(state.annKeyword) ||
      String(item.bureau || '').toLowerCase().includes(state.annKeyword);
    return matchCat && matchKw;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding: 2.5rem; text-align: center; color: #64748b;">目前沒有符合條件的市政公告，請點擊右上角「＋ 新增市政公告」。</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const clicks = Number(item.clicks ?? item.views ?? 0);
    const safeId = escapeAdminHtml(item.id);
    return `
      <div class="admin-item-card ${item.isPublished ? '' : 'is-hidden-draft'}">
        <div class="admin-item-main">
          <div class="admin-item-badges">
            <span class="category-badge ${escapeAdminHtml(item.badgeColor)}">${escapeAdminHtml(item.categoryName)}</span>
            <span class="status-chip ${item.isPublished ? 'published' : 'draft'}">${item.isPublished ? '已發布' : '草稿隱藏'}</span>
            ${item.isPinned ? '<span class="status-chip pinned">置頂</span>' : ''}
          </div>
          <div class="admin-item-title">${escapeAdminHtml(item.title)}</div>
          <div class="admin-item-meta">
            <span>發布單位：${escapeAdminHtml(item.bureau)}</span>
            <span>發布日期：${escapeAdminHtml(item.publishDate || item.date)}</span>
            <span>真實點擊：<strong>${clicks.toLocaleString('zh-TW')}</strong> 次</span>
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn-xs primary" data-ann-action="edit" data-id="${safeId}">編輯</button>
          <button type="button" class="btn-xs" data-ann-action="toggle-pin" data-id="${safeId}">${item.isPinned ? '取消置頂' : '設為置頂'}</button>
          <button type="button" class="btn-xs" data-ann-action="toggle-pub" data-id="${safeId}">${item.isPublished ? '設為隱藏' : '立即發布'}</button>
          <button type="button" class="btn-xs" data-ann-action="reset-clicks" data-id="${safeId}">點擊歸零</button>
          <button type="button" class="btn-xs danger" data-ann-action="delete" data-id="${safeId}">刪除</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-ann-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAnnouncementRowAction(btn.getAttribute('data-ann-action'), btn.getAttribute('data-id')));
  });
}

async function handleAnnouncementRowAction(action, id) {
  const item = state.announcements.find(a => a.id === id);
  if (!item) return;

  if (action === 'edit') {
    openAnnouncementEditor(item);
    return;
  }

  try {
    if (action === 'toggle-pin') {
      await updateAnnouncementPayload(item, { isPinned: !item.isPinned });
      window.showToast?.(item.isPinned ? '已取消置頂' : '已設為置頂公告', 'success');
    } else if (action === 'toggle-pub') {
      await updateAnnouncementPayload(item, { isPublished: !item.isPublished });
      window.showToast?.(item.isPublished ? '已隱藏公告' : '已公開發布公告', 'success');
    } else if (action === 'reset-clicks') {
      if (!confirm(`確定要將「${item.title}」的點擊次數歸零嗎？`)) return;
      await updateAnnouncementPayload(item, { resetClicks: true });
      window.showToast?.('已將公告點擊次數歸零', 'success');
    } else if (action === 'delete') {
      if (!confirm(`確定要永久刪除公告「${item.title}」嗎？此操作無法復原。`)) return;
      await adminApiFetch(`/api/admin/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' });
      window.showToast?.('已刪除公告', 'success');
    }
    await loadAdminOverview();
  } catch (err) {
    window.showToast?.(err.message, 'error');
  }
}

async function updateAnnouncementPayload(item, overrides) {
  return adminApiFetch(`/api/admin/announcements/${encodeURIComponent(item.id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      category: item.category,
      title: item.title,
      bureau: item.bureau,
      publishDate: item.publishDate || item.date,
      summary: item.summary,
      content: item.content,
      attachments: item.attachments || [],
      isPinned: item.isPinned,
      isPublished: item.isPublished,
      ...overrides
    })
  });
}

function renderAdminEvents() {
  const container = document.getElementById('adminEventsList');
  if (state.events.length === 0) {
    container.innerHTML = `<div style="padding: 2.5rem; text-align: center; color: #64748b;">目前沒有市府重大活動，請點擊右上角「＋ 新增重大活動」。</div>`;
    return;
  }

  container.innerHTML = state.events.map(evt => {
    const safeId = escapeAdminHtml(evt.id);
    const imgSrc = escapeAdminHtml(resolvePreviewImageSrc(evt.image));
    return `
      <div class="admin-item-card ${evt.isPublished ? '' : 'is-hidden-draft'}">
        <div class="event-admin-row">
          <img src="${imgSrc}" alt="${escapeAdminHtml(evt.title)}" class="event-admin-thumb">
          <div class="admin-item-main">
            <div class="admin-item-badges">
              <span class="status-chip published">${escapeAdminHtml(evt.statusLabel)}</span>
              <span class="status-chip ${evt.isPublished ? 'published' : 'draft'}">${evt.isPublished ? '已發布' : '草稿隱藏'}</span>
              <span class="status-chip pinned">排序 ${Number(evt.sortOrder || 0)}</span>
            </div>
            <div class="admin-item-title">${escapeAdminHtml(evt.title)}</div>
            <div class="admin-item-meta">
              <span>類別：${escapeAdminHtml(evt.category)}</span>
              <span>時間：${escapeAdminHtml(evt.dateRange)}</span>
              <span>地點：${escapeAdminHtml(evt.location)}</span>
            </div>
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn-xs primary" data-evt-action="edit" data-id="${safeId}">編輯</button>
          <button type="button" class="btn-xs" data-evt-action="toggle-pub" data-id="${safeId}">${evt.isPublished ? '設為隱藏' : '立即發布'}</button>
          <button type="button" class="btn-xs danger" data-evt-action="delete" data-id="${safeId}">刪除</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-evt-action]').forEach(btn => {
    btn.addEventListener('click', () => handleEventRowAction(btn.getAttribute('data-evt-action'), btn.getAttribute('data-id')));
  });
}

async function handleEventRowAction(action, id) {
  const evt = state.events.find(e => e.id === id);
  if (!evt) return;

  if (action === 'edit') {
    openEventEditor(evt);
    return;
  }

  try {
    if (action === 'toggle-pub') {
      await adminApiFetch(`/api/admin/events/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ ...evt, isPublished: !evt.isPublished })
      });
      window.showToast?.(evt.isPublished ? '已隱藏活動' : '已公開發布活動', 'success');
    } else if (action === 'delete') {
      if (!confirm(`確定要永久刪除活動「${evt.title}」嗎？此操作無法復原。`)) return;
      await adminApiFetch(`/api/admin/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
      window.showToast?.('已刪除活動', 'success');
    }
    await loadAdminOverview();
  } catch (err) {
    window.showToast?.(err.message, 'error');
  }
}

/* ========================================================
   公告與活動編輯彈窗處理
   ======================================================== */
function bindEditorModalHandlers() {
  document.getElementById('addAttachmentRowBtn').addEventListener('click', () => appendAttachmentRow());

  document.getElementById('announcementEditorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('annEditId').value;
    const btn = document.getElementById('saveAnnouncementBtn');
    const prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '儲存中...';

    const attachments = [];
    document.querySelectorAll('#attachmentsEditorContainer .attachment-editor-row').forEach(row => {
      const name = row.querySelector('[data-att-name]').value.trim();
      const size = row.querySelector('[data-att-size]').value.trim();
      const url = row.querySelector('[data-att-url]').value.trim();
      if (name) attachments.push({ name, size: size || '線上資料', url });
    });

    const payload = {
      category: document.getElementById('annCategoryInput').value,
      publishDate: document.getElementById('annDateInput').value,
      title: document.getElementById('annTitleInput').value.trim(),
      bureau: document.getElementById('annBureauInput').value.trim(),
      summary: document.getElementById('annSummaryInput').value.trim(),
      content: document.getElementById('annContentInput').value.trim(),
      attachments,
      isPinned: document.getElementById('annPinnedCheck').checked,
      isPublished: document.getElementById('annPublishedCheck').checked,
      resetClicks: Boolean(id && document.getElementById('annResetClicksCheck').checked)
    };

    try {
      if (id) {
        await adminApiFetch(`/api/admin/announcements/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        window.showToast?.('已更新市政公告', 'success');
      } else {
        await adminApiFetch('/api/admin/announcements', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        window.showToast?.('已新增市政公告（點擊次數從 0 起算）', 'success');
      }
      window.closeAllModals?.();
      await loadAdminOverview();
    } catch (err) {
      window.showToast?.(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  });

  const evtImageInput = document.getElementById('evtImageInput');
  const evtImagePreview = document.getElementById('evtImagePreview');
  evtImageInput.addEventListener('input', () => {
    evtImagePreview.src = resolvePreviewImageSrc(evtImageInput.value);
  });
  document.querySelectorAll('[data-img-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const path = btn.getAttribute('data-img-preset');
      evtImageInput.value = path;
      evtImagePreview.src = resolvePreviewImageSrc(path);
    });
  });

  document.getElementById('eventEditorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('evtEditId').value;
    const btn = document.getElementById('saveEventBtn');
    const prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '儲存中...';

    const highlights = document.getElementById('evtHighlightsInput').value
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: document.getElementById('evtTitleInput').value.trim(),
      category: document.getElementById('evtCategoryInput').value.trim(),
      status: document.getElementById('evtStatusInput').value,
      dateRange: document.getElementById('evtDateRangeInput').value.trim(),
      sortOrder: Number(document.getElementById('evtSortOrderInput').value || 10),
      location: document.getElementById('evtLocationInput').value.trim(),
      participants: document.getElementById('evtParticipantsInput').value.trim(),
      image: document.getElementById('evtImageInput').value.trim(),
      description: document.getElementById('evtDescInput').value.trim(),
      highlights,
      isPublished: document.getElementById('evtPublishedCheck').checked
    };

    try {
      if (id) {
        await adminApiFetch(`/api/admin/events/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        window.showToast?.('已更新市府重大活動', 'success');
      } else {
        await adminApiFetch('/api/admin/events', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        window.showToast?.('已新增市府重大活動', 'success');
      }
      window.closeAllModals?.();
      await loadAdminOverview();
    } catch (err) {
      window.showToast?.(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  });
}

function appendAttachmentRow(att = {}) {
  const container = document.getElementById('attachmentsEditorContainer');
  const row = document.createElement('div');
  row.className = 'attachment-editor-row';
  row.innerHTML = `
    <input type="text" class="form-control" data-att-name placeholder="附件名稱（例：簡章.pdf）" value="${escapeAdminHtml(att.name || '')}">
    <input type="text" class="form-control" data-att-size placeholder="大小或說明" value="${escapeAdminHtml(att.size || '')}">
    <input type="url" class="form-control" data-att-url placeholder="連結網址（https://... 選填）" value="${escapeAdminHtml(att.url || '')}">
    <button type="button" class="btn-xs danger">移除</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function openAnnouncementEditor(item) {
  document.getElementById('annEditorTitle').textContent = item ? '編輯市政公告' : '新增市政公告';
  document.getElementById('annEditId').value = item ? item.id : '';
  document.getElementById('annCategoryInput').value = item ? item.category : 'news';
  document.getElementById('annDateInput').value = item ? (item.publishDate || item.date) : getTodayTaiwanDate();
  document.getElementById('annTitleInput').value = item ? item.title : '';
  document.getElementById('annBureauInput').value = item ? item.bureau : '';
  document.getElementById('annSummaryInput').value = item ? item.summary : '';
  document.getElementById('annContentInput').value = item ? item.content : '';
  document.getElementById('annPinnedCheck').checked = Boolean(item?.isPinned);
  document.getElementById('annPublishedCheck').checked = item ? Boolean(item.isPublished) : true;

  const resetWrap = document.getElementById('annResetClicksWrap');
  const resetCheck = document.getElementById('annResetClicksCheck');
  if (item) {
    resetWrap.style.display = 'inline-flex';
    document.getElementById('annCurrentClicksText').textContent = Number(item.clicks ?? item.views ?? 0).toLocaleString('zh-TW');
    resetCheck.checked = false;
  } else {
    resetWrap.style.display = 'none';
    resetCheck.checked = false;
  }

  const attContainer = document.getElementById('attachmentsEditorContainer');
  attContainer.innerHTML = '';
  const atts = Array.isArray(item?.attachments) ? item.attachments : [];
  if (atts.length > 0) {
    atts.forEach(a => appendAttachmentRow(a));
  } else {
    appendAttachmentRow();
  }

  document.getElementById('announcementEditorModal').classList.add('active');
}

function openEventEditor(evt) {
  document.getElementById('evtEditorTitle').textContent = evt ? '編輯市府重大活動' : '新增市府重大活動';
  document.getElementById('evtEditId').value = evt ? evt.id : '';
  document.getElementById('evtTitleInput').value = evt ? evt.title : '';
  document.getElementById('evtCategoryInput').value = evt ? evt.category : '文化藝術';
  document.getElementById('evtStatusInput').value = evt ? evt.status : 'registration';
  document.getElementById('evtDateRangeInput').value = evt ? evt.dateRange : '';
  document.getElementById('evtSortOrderInput').value = evt ? String(evt.sortOrder ?? 10) : '10';
  document.getElementById('evtLocationInput').value = evt ? evt.location : '';
  document.getElementById('evtParticipantsInput').value = evt ? (evt.participants || '') : '';
  const imgPath = evt?.image || 'assets/images/minde_city_hall.jpg';
  document.getElementById('evtImageInput').value = imgPath;
  document.getElementById('evtImagePreview').src = resolvePreviewImageSrc(imgPath);
  document.getElementById('evtDescInput').value = evt ? evt.description : '';
  document.getElementById('evtHighlightsInput').value = Array.isArray(evt?.highlights) ? evt.highlights.join('\n') : '';
  document.getElementById('evtPublishedCheck').checked = evt ? Boolean(evt.isPublished) : true;

  document.getElementById('eventEditorModal').classList.add('active');
}
