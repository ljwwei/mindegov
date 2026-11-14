/**
 * 民德市政府官網 - 市長信箱與線上申辦互動模組 (Mayor's Mailbox & Case Inquiry Module)
 * 智慧民德．幸福永續
 *
 * 串接 Cloudflare Worker + D1 雲端資料庫與真實電子郵件通知流程。
 */

// 部署完成您的 Cloudflare Worker 後，請將下方網址替換為實際的 Worker 網址（末尾不加斜線）
const MAILBOX_API_BASE = 'https://mindegov-mailbox.gamerwillywilly.workers.dev';

function getMailboxApiBase() {
  const raw = (typeof window !== 'undefined' && window.MINDE_MAILBOX_API) || MAILBOX_API_BASE;
  return String(raw || '').replace(/\/+$/, '');
}

function isApiConfigured(baseUrl) {
  return Boolean(baseUrl && !baseUrl.includes('REPLACE_WITH_YOUR_SUBDOMAIN'));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function notifyUser(message, type = 'info') {
  if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
    window.showToast(message, type);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMailboxTabs();
  initMailboxForm();
  initCaseInquiry();
});

/* ========================================================
   1. 頁籤切換邏輯 (Mailbox Tabs Switcher)
   ======================================================== */
function switchMailboxTab(targetId) {
  const tabs = document.querySelectorAll('.mailbox-tab-btn');
  const panes = document.querySelectorAll('.mailbox-tab-pane');

  tabs.forEach(t => {
    const isActive = t.getAttribute('data-target') === targetId;
    t.classList.toggle('active', isActive);
    if (t.hasAttribute('aria-selected')) {
      t.setAttribute('aria-selected', String(isActive));
    }
  });

  panes.forEach(p => {
    p.classList.toggle('active', p.id === targetId);
  });
}

function initMailboxTabs() {
  const tabs = document.querySelectorAll('.mailbox-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      if (target) switchMailboxTab(target);
    });
  });
}

function scrollToMailboxSection() {
  const targetEl = document.getElementById('mailbox') || document.querySelector('.mailbox-card-wrapper');
  if (targetEl) {
    window.scrollTo({
      top: Math.max(0, targetEl.offsetTop - 80),
      behavior: 'smooth'
    });
  }
}

/* ========================================================
   2. 市長信箱表單邏輯 (3-Step Form Wizard)
   ======================================================== */
let currentStep = 1;
const totalSteps = 3;

function initMailboxForm() {
  const nextBtns = document.querySelectorAll('.form-next-step-btn');
  const prevBtns = document.querySelectorAll('.form-prev-step-btn');
  const submitBtn = document.getElementById('submitMailboxBtn');
  const gpsBtn = document.getElementById('mailboxGpsBtn');

  // 下一步按鈕
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  // 上一步按鈕
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });

  // 模擬 GPS 定位填入參考地址
  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      const locationInput = document.getElementById('caseLocation');
      if (locationInput) {
        locationInput.value = '民德市中央區市政大道一段 120 號前（市民大道口）';
        notifyUser('已取得參考定位地址，可視實際位置微調', 'success');
      }
    });
  }

  // 送出案件
  if (submitBtn) {
    submitBtn.addEventListener('click', submitMailboxCase);
  }
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;

  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById(`formStep${i}`);
    if (stepEl) {
      stepEl.style.display = i === step ? 'block' : 'none';
    }
  }

  const stepItems = document.querySelectorAll('.stepper-step');
  stepItems.forEach((item, idx) => {
    const stepNum = idx + 1;
    item.classList.remove('active', 'completed');
    if (stepNum === step) {
      item.classList.add('active');
    } else if (stepNum < step) {
      item.classList.add('completed');
    }
  });

  currentStep = step;
  scrollToMailboxSection();
}

function validateCurrentStep(step) {
  if (step === 1) {
    const cat = document.getElementById('caseCategory')?.value.trim();
    const title = document.getElementById('caseTitle')?.value.trim();

    if (!cat) {
      notifyUser('請選擇案件陳情建議分類！', 'error');
      return false;
    }
    if (!title || title.length < 5) {
      notifyUser('請填寫具體的主旨說明（至少 5 個字）！', 'error');
      return false;
    }
    return true;
  }

  if (step === 2) {
    const content = document.getElementById('caseContent')?.value.trim();
    const location = document.getElementById('caseLocation')?.value.trim();

    if (!content || content.length < 15) {
      notifyUser('請詳細描述具體事項與陳情內容（至少 15 個字）！', 'error');
      return false;
    }
    if (!location) {
      notifyUser('請提供發生路段、地址或明確地標！', 'error');
      return false;
    }
    return true;
  }

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(raw) {
  return String(raw || '').replace(/[\s-]/g, '');
}

function isValidPhone(phone) {
  return /^09\d{8}$/.test(phone) || /^0\d{8,9}$/.test(phone);
}

// 提交案件至 Cloudflare Worker + D1 並觸發雙向寄信
async function submitMailboxCase() {
  const name = document.getElementById('citizenName')?.value.trim();
  const rawPhone = document.getElementById('citizenPhone')?.value.trim();
  const phone = normalizePhone(rawPhone);
  const email = document.getElementById('citizenEmail')?.value.trim();
  const agree = document.getElementById('privacyAgreeCheck')?.checked;

  const category = document.getElementById('caseCategory')?.value.trim();
  const title = document.getElementById('caseTitle')?.value.trim();
  const content = document.getElementById('caseContent')?.value.trim();
  const location = document.getElementById('caseLocation')?.value.trim();

  if (!category || !title || title.length < 5) {
    notifyUser('步驟 1 資料未完成，請先填寫分類與主旨！', 'error');
    goToStep(1);
    return;
  }
  if (!content || content.length < 15 || !location) {
    notifyUser('步驟 2 資料未完成，請詳述案情內容與地點！', 'error');
    goToStep(2);
    return;
  }
  if (!name) {
    notifyUser('請填寫陳情人真實姓名！', 'error');
    return;
  }
  if (!phone || !isValidPhone(phone)) {
    notifyUser('請填寫有效的聯絡電話號碼（例如 0912345678）！', 'error');
    return;
  }
  if (!email || !isValidEmail(email)) {
    notifyUser('請填寫正確的電子郵件信箱以便收受受理與結案通知！', 'error');
    return;
  }
  if (!agree) {
    notifyUser('請閱讀並同意個人資料保護宣告與通報須知！', 'error');
    return;
  }

  const apiBase = getMailboxApiBase();
  if (!isApiConfigured(apiBase)) {
    notifyUser('尚未設定 Cloudflare Worker API 網址，請先部署後端並更新 js/mailbox.js！', 'error');
    return;
  }

  const submitBtn = document.getElementById('submitMailboxBtn');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '案件傳送與寄信中，請稍候...';
  }

  try {
    const res = await fetch(`${apiBase}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        title,
        content,
        location,
        name,
        phone,
        email
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.case) {
      throw new Error(data.error || `系統處理失敗 (HTTP ${res.status})`);
    }

    renderCaseSuccessCard(data.case, email);
  } catch (err) {
    notifyUser(err.message || '送出失敗，請檢查網路或稍後再試！', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

function renderCaseSuccessCard(caseObj, submittedEmail) {
  const formWrapper = document.getElementById('mailboxFormWrapper');
  if (!formWrapper) return;

  formWrapper.innerHTML = `
    <div style="text-align: center; padding: 2rem 1rem;">
      <div style="width: 72px; height: 72px; background: var(--gov-emerald-light); color: var(--gov-emerald); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
        <svg style="width: 38px; height: 38px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--gov-navy); margin-bottom: 0.5rem;">案件已正式受理並寄出確認信！</h3>
      <p style="color: var(--text-muted); font-size: 1rem; max-width: 600px; margin: 0 auto 2rem;">
        感謝您的寶貴建言，系統已將您的陳情內容、案號與查詢連結寄送至 <strong>${escapeHtml(submittedEmail)}</strong>，並同步通知市長室收件。
      </p>

      <div class="case-result-card" style="text-align: left; margin-bottom: 2rem; border-top: 4px solid var(--gov-emerald);">
        <div class="case-card-header">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">您的官方案件追蹤案號：</div>
            <div class="case-num">${escapeHtml(caseObj.caseNumber)}</div>
          </div>
          <button type="button" class="btn btn-secondary" id="copySuccessCaseBtn" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;">
            一鍵複製案號
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
          <div><span style="color: var(--text-muted);">案件主旨：</span><strong>${escapeHtml(caseObj.title)}</strong></div>
          <div><span style="color: var(--text-muted);">通報分類：</span><span>${escapeHtml(caseObj.category)}</span></div>
          <div><span style="color: var(--text-muted);">發生地點：</span><span>${escapeHtml(caseObj.location)}</span></div>
          <div><span style="color: var(--text-muted);">通報日期：</span><span>${escapeHtml(caseObj.date)}</span></div>
          <div><span style="color: var(--text-muted);">處理狀態：</span><strong style="color: var(--gov-emerald);">${escapeHtml(caseObj.statusText)}</strong></div>
        </div>

        <div style="background: var(--bg-surface-raised); padding: 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--text-sub);">
          <strong>市民叮嚀：</strong>請妥善保存上方案號。日後查詢進度時，需同時輸入<strong>案件編號</strong>與<strong>原填寫信箱（${escapeHtml(submittedEmail)}）</strong>，以確保您的個人資料安全。
        </div>
      </div>

      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-primary" id="successTrackCaseBtn">
          立即查詢此案件進度
        </button>
        <button type="button" class="btn btn-secondary" onclick="window.print()">
          列印案件受理聯單
        </button>
      </div>
    </div>
  `;

  const copyBtn = document.getElementById('copySuccessCaseBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(caseObj.caseNumber).then(() => {
          notifyUser('已複製案號至剪貼簿！', 'success');
        }).catch(() => {
          notifyUser(`您的案號為：${caseObj.caseNumber}`, 'info');
        });
      }
    });
  }

  const trackBtn = document.getElementById('successTrackCaseBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      querySpecificCase(caseObj.caseNumber, submittedEmail);
    });
  }

  notifyUser('案件已建檔，並已發送確認信至您的信箱！', 'success');
}

/* ========================================================
   3. 案件進度即時查詢模組 (Case Inquiry with Case Number + Email)
   ======================================================== */
function initCaseInquiry() {
  const searchBtn = document.getElementById('inquirySearchBtn');
  const caseInput = document.getElementById('inquiryCaseInput');
  const emailInput = document.getElementById('inquiryEmailInput');

  const triggerSearch = () => {
    const caseVal = caseInput?.value.trim().toUpperCase() || '';
    const emailVal = emailInput?.value.trim() || '';

    if (!caseVal) {
      notifyUser('請輸入案件編號！', 'error');
      caseInput?.focus();
      return;
    }
    if (!emailVal || !isValidEmail(emailVal)) {
      notifyUser('請輸入通報時填寫的電子郵件信箱！', 'error');
      emailInput?.focus();
      return;
    }
    executeCaseQuery(caseVal, emailVal);
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', triggerSearch);
  }

  [caseInput, emailInput].forEach(el => {
    if (!el) return;
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSearch();
      }
    });
  });

  // 支援從確認信／結案通知信的連結 ?case=MD-... 導向查詢分頁（只預填案號，不預填信箱）
  const params = new URLSearchParams(window.location.search);
  const urlCase = params.get('case')?.trim();
  if (urlCase && caseInput) {
    switchMailboxTab('paneInquiry');
    caseInput.value = urlCase.toUpperCase();
    scrollToMailboxSection();
    if (emailInput) {
      emailInput.focus();
    }
    notifyUser('已帶入案件編號，請輸入原填寫之電子郵件信箱後點擊「查詢進度」', 'info');
  }
}

function openCaseInquiryTab(prefillCase = '') {
  switchMailboxTab('paneInquiry');
  scrollToMailboxSection();

  const caseInput = document.getElementById('inquiryCaseInput');
  const emailInput = document.getElementById('inquiryEmailInput');
  if (prefillCase && caseInput) {
    caseInput.value = prefillCase.trim().toUpperCase();
    emailInput?.focus();
  } else {
    caseInput?.focus();
  }
}

function querySpecificCase(caseNumber, email = '') {
  switchMailboxTab('paneInquiry');
  scrollToMailboxSection();

  const caseInput = document.getElementById('inquiryCaseInput');
  const emailInput = document.getElementById('inquiryEmailInput');

  if (caseInput) caseInput.value = String(caseNumber || '').trim().toUpperCase();
  if (emailInput && email) emailInput.value = String(email).trim();

  if (caseNumber && email && isValidEmail(email)) {
    executeCaseQuery(caseNumber.trim().toUpperCase(), email.trim());
  } else {
    emailInput?.focus();
  }
}

async function executeCaseQuery(caseNumber, email) {
  const resultContainer = document.getElementById('caseQueryResult');
  const searchBtn = document.getElementById('inquirySearchBtn');
  if (!resultContainer) return;

  const apiBase = getMailboxApiBase();
  if (!isApiConfigured(apiBase)) {
    notifyUser('尚未設定 Cloudflare Worker API 網址，請先部署後端並更新 js/mailbox.js！', 'error');
    return;
  }

  const originalBtnHtml = searchBtn ? searchBtn.innerHTML : '';
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.textContent = '查詢中...';
  }

  resultContainer.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-md); max-width: 700px; margin: 0 auto;">
      正在連線民德市政府雲端案件系統驗證查詢中，請稍候...
    </div>
  `;

  try {
    const res = await fetch(`${apiBase}/api/cases/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseNumber, email })
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 404 || !res.ok || !data.ok || !data.case) {
      const msg = data.error || '查無相符案件，請確認「案件編號」與「當初填寫的電子郵件信箱」是否一致。';
      resultContainer.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-md); max-width: 700px; margin: 0 auto;">
          <svg style="width: 48px; height: 48px; stroke: var(--border-medium); margin-bottom: 0.8rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">${escapeHtml(msg)}</p>
          <p style="font-size: 0.88rem; margin-top: 0.45rem;">基於個資安全保護機制，必須「案號」與「原填寫信箱」皆吻合方可查閱案件詳情。</p>
        </div>
      `;
      return;
    }

    renderCaseDetailCard(resultContainer, data.case);
  } catch (err) {
    resultContainer.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--gov-crimson); background: var(--gov-crimson-light); border-radius: var(--radius-md); max-width: 700px; margin: 0 auto;">
        <p style="font-weight: 700;">查詢連線發生異常：${escapeHtml(err.message || '請稍後重試')}</p>
      </div>
    `;
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = originalBtnHtml;
    }
  }
}

function renderCaseDetailCard(resultContainer, found) {
  const timelineList = Array.isArray(found.timeline) ? found.timeline : [];
  const timelineHtml = timelineList.map(step => `
    <div class="timeline-step-item">
      <div class="timeline-dot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="timeline-title">${escapeHtml(step.title)}</div>
      <div class="timeline-time">${escapeHtml(step.date)}</div>
      <div class="timeline-desc">${escapeHtml(step.desc)}</div>
    </div>
  `).join('');

  const isCompleted = found.status === 'completed';
  const replyHtml = isCompleted && found.reply ? `
    <div class="case-official-reply completed">
      <div class="reply-title">
        <svg style="width: 18px; height: 18px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>民德市政府市長室【已結案】正式回覆${found.repliedAt ? `（回覆時間：${escapeHtml(found.repliedAt)}）` : ''}：</span>
      </div>
      <div class="reply-content">${escapeHtml(found.reply)}</div>
    </div>
  ` : `
    <div class="case-official-reply pending">
      <div class="reply-title">
        <svg style="width: 18px; height: 18px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>案件審理中（尚未結案）：</span>
      </div>
      <div class="reply-content">本案已送達市長室收文並建檔追蹤，待市長室審核回覆後，系統將立即寄送回覆通知至您的電子郵件信箱，並更新為「已結案回覆」。</div>
    </div>
  `;

  resultContainer.innerHTML = `
    <div class="case-result-card">
      <div class="case-card-header">
        <div>
          <span style="font-size: 0.82rem; color: var(--text-muted);">案件編號</span>
          <div class="case-num">${escapeHtml(found.caseNumber)}</div>
        </div>
        <span class="category-badge ${isCompleted ? 'success' : 'warning'}" style="font-size: 0.88rem; padding: 0.35rem 0.9rem;">
          ${escapeHtml(found.statusText)}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; font-size: 0.9rem; margin-bottom: 1.25rem; background: var(--bg-surface-raised); padding: 1.1rem; border-radius: var(--radius-sm);">
        <div><span style="color: var(--text-muted);">陳情主旨：</span><strong>${escapeHtml(found.title)}</strong></div>
        <div><span style="color: var(--text-muted);">案件分類：</span><strong>${escapeHtml(found.category)}</strong></div>
        <div><span style="color: var(--text-muted);">發生地點：</span><span>${escapeHtml(found.location)}</span></div>
        <div><span style="color: var(--text-muted);">通報市民：</span><span>${escapeHtml(found.name)}${found.phone ? ` (${escapeHtml(found.phone)})` : ''}</span></div>
        <div><span style="color: var(--text-muted);">成立時間：</span><span>${escapeHtml(found.createdAt || found.date)}</span></div>
        ${found.repliedAt ? `<div><span style="color: var(--text-muted);">結案時間：</span><span>${escapeHtml(found.repliedAt)}</span></div>` : ''}
      </div>

      <div class="case-petition-box">
        <div class="case-petition-label">市民通報陳情內容：</div>
        <div class="case-petition-text">${escapeHtml(found.content)}</div>
      </div>

      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--gov-navy); margin-bottom: 1.25rem;">辦理進度歷程時間軸：</h4>
      <div class="timeline-stepper">
        ${timelineHtml}
      </div>

      ${replyHtml}
    </div>
  `;
}

window.openCaseInquiryTab = openCaseInquiryTab;
window.querySpecificCase = querySpecificCase;
