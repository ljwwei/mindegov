/**
 * 民德市政府官網 - 市長信箱與線上申辦互動模組 (Mayor's Mailbox & Case Inquiry Module)
 * 智慧民德．幸福永續
 */

document.addEventListener('DOMContentLoaded', () => {
  initMailboxTabs();
  initMailboxForm();
  initCaseInquiry();
});

/* ========================================================
   1. 頁籤切換邏輯 (Mailbox Tabs Switcher)
   ======================================================== */
function initMailboxTabs() {
  const tabs = document.querySelectorAll('.mailbox-tab-btn');
  const panes = document.querySelectorAll('.mailbox-tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePane = document.getElementById(target);
      if (activePane) activePane.classList.add('active');
    });
  });
}

/* ========================================================
   2. 市長信箱表單邏輯 (Multi-Step Form Wizard)
   ======================================================== */
let currentStep = 1;
const totalSteps = 4;
let uploadedFiles = [];
let countdownTimer = null;

function initMailboxForm() {
  const nextBtns = document.querySelectorAll('.form-next-step-btn');
  const prevBtns = document.querySelectorAll('.form-prev-step-btn');
  const submitBtn = document.getElementById('submitMailboxBtn');
  const fileDropzone = document.getElementById('mailboxFileDropzone');
  const fileInput = document.getElementById('mailboxFileInput');
  const sendCodeBtn = document.getElementById('sendVerificationCodeBtn');
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

  // 模擬 GPS 定位
  if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
      const locationInput = document.getElementById('caseLocation');
      if (locationInput) {
        locationInput.value = '民德市中央區市政大道一段 120 號前（市民大道口）';
        showToast('已取得當前 GPS 概略定位地址', 'success');
      }
    });
  }

  // 附件拖放上傳
  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener('click', () => fileInput.click());

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('dragover');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('dragover');
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    });
  }

  // 發送驗證碼
  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', () => {
      const phoneInput = document.getElementById('citizenPhone');
      const phoneVal = phoneInput?.value.trim();

      if (!phoneVal || !/^09\d{8}$/.test(phoneVal.replace(/-/g, ''))) {
        showToast('請先輸入正確的 10 碼行動電話號碼！', 'error');
        phoneInput?.focus();
        return;
      }

      sendCodeBtn.disabled = true;
      let seconds = 60;
      sendCodeBtn.textContent = `重新發送 (${seconds}s)`;

      countdownTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(countdownTimer);
          sendCodeBtn.disabled = false;
          sendCodeBtn.textContent = '重新發送驗證碼';
        } else {
          sendCodeBtn.textContent = `重新發送 (${seconds}s)`;
        }
      }, 1000);

      // 模擬收到驗證碼
      showToast(`【民德便民通】簡訊驗證碼已發送至 ${phoneVal}，測試代碼：8866`, 'success');
      const codeInput = document.getElementById('verificationCode');
      if (codeInput) {
        setTimeout(() => {
          codeInput.value = '8866';
        }, 1200);
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

  // 切換表單區塊
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById(`formStep${i}`);
    if (stepEl) {
      stepEl.style.display = i === step ? 'block' : 'none';
    }
  }

  // 更新 Stepper 視覺狀態
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
  window.scrollTo({
    top: document.getElementById('mailbox').offsetTop - 80,
    behavior: 'smooth'
  });
}

function validateCurrentStep(step) {
  if (step === 1) {
    const cat = document.getElementById('caseCategory')?.value;
    const title = document.getElementById('caseTitle')?.value.trim();

    if (!cat) {
      showToast('請選擇案件陳情建議分類！', 'error');
      return false;
    }
    if (!title || title.length < 5) {
      showToast('請填寫具體的主旨說明（至少 5 個字）！', 'error');
      return false;
    }
    return true;
  }

  if (step === 2) {
    const content = document.getElementById('caseContent')?.value.trim();
    const location = document.getElementById('caseLocation')?.value.trim();

    if (!content || content.length < 15) {
      showToast('請詳細描述具體事項與陳情內容（至少 15 個字）！', 'error');
      return false;
    }
    if (!location) {
      showToast('請提供發生路段、地址或明確地標！', 'error');
      return false;
    }
    return true;
  }

  if (step === 3) {
    // 附件為選填
    return true;
  }

  return true;
}

function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 10 * 1024 * 1024) {
      showToast(`檔案「${file.name}」超過 10MB 限制！`, 'error');
      continue;
    }
    uploadedFiles.push({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    });
  }
  renderFileList();
  showToast(`已成功選取 ${files.length} 個附件`, 'info');
}

function renderFileList() {
  const preview = document.getElementById('fileListPreview');
  if (!preview) return;

  if (uploadedFiles.length === 0) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = uploadedFiles.map((file, idx) => `
    <div class="file-chip">
      <svg style="width: 14px; height: 14px; stroke: var(--gov-blue);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      </svg>
      <span>${file.name} (${file.size})</span>
      <span class="file-chip-remove" onclick="removeFile(${idx})" title="移除檔案">✕</span>
    </div>
  `).join('');
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  renderFileList();
}

// 提交案件
function submitMailboxCase() {
  const name = document.getElementById('citizenName')?.value.trim();
  const phone = document.getElementById('citizenPhone')?.value.trim();
  const email = document.getElementById('citizenEmail')?.value.trim();
  const code = document.getElementById('verificationCode')?.value.trim();
  const agree = document.getElementById('privacyAgreeCheck')?.checked;

  if (!name) {
    showToast('請填寫陳情人真實姓名！', 'error');
    return;
  }
  if (!phone) {
    showToast('請填寫有效的手機聯絡號碼！', 'error');
    return;
  }
  if (!email || !email.includes('@')) {
    showToast('請填寫正確的電子信箱以便收受結案通知信函！', 'error');
    return;
  }
  if (!code || code !== '8866') {
    showToast('簡訊驗證碼不正確或未輸入（測試驗證碼：8866）！', 'error');
    return;
  }
  if (!agree) {
    showToast('請閱讀並同意個人資料保護宣告與通報須知！', 'error');
    return;
  }

  // 產生隨機案號
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const caseNumber = `MD-${y}${m}${d}-${rand}`;

  const category = document.getElementById('caseCategory')?.value || '綜合政務';
  const title = document.getElementById('caseTitle')?.value || '';
  const content = document.getElementById('caseContent')?.value || '';
  const location = document.getElementById('caseLocation')?.value || '';

  // 封裝案件資料
  const newCase = {
    caseNumber,
    name: name.slice(0, 1) + '*' + (name.length > 2 ? name.slice(2) : ''),
    phone: phone.slice(0, 4) + '***' + phone.slice(-3),
    category,
    title,
    content,
    location,
    date: `${y}-${m}-${d}`,
    status: 'received',
    statusText: '已收案登記',
    timeline: [
      {
        date: `${y}-${m}-${d} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        title: "案件成立登記",
        desc: `市民透過民德市智慧官網完成通報，指派案號 ${caseNumber}。`
      },
      {
        date: `${y}-${m}-${d} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        title: "分案審查中",
        desc: "系統已自動傳送至市長室收文中心，將於 24 小時內指派對應權責局處專人研辦。"
      }
    ],
    reply: "案件已正式立案收件！市府承辦同仁將於 3 個工作天內主動與您聯繫勘驗或回覆處理情形。"
  };

  // 儲存至本地快取
  const localCases = JSON.parse(localStorage.getItem('mindegov_cases') || '[]');
  localCases.unshift(newCase);
  localStorage.setItem('mindegov_cases', JSON.stringify(localCases));

  // 呈現受理成功畫面
  renderCaseSuccessCard(newCase);
}

function renderCaseSuccessCard(caseObj) {
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

      <h3 style="font-size: 1.8rem; font-weight: 800; color: var(--gov-navy); margin-bottom: 0.5rem;">案件已成功受理解析！</h3>
      <p style="color: var(--text-muted); font-size: 1rem; max-width: 560px; margin: 0 auto 2rem;">
        感謝您的寶貴建言，民德市政府已將您的案件分派至專責局處，進度將透過簡訊及電子郵件同步發送。
      </p>

      <div class="case-result-card" style="text-align: left; margin-bottom: 2rem; border-top: 4px solid var(--gov-emerald);">
        <div class="case-card-header">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">您的官方案件追蹤案號：</div>
            <div class="case-num">${caseObj.caseNumber}</div>
          </div>
          <button class="btn btn-secondary" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;" onclick="navigator.clipboard.writeText('${caseObj.caseNumber}'); showToast('已複製案號至剪貼簿！', 'success');">
            一鍵複製案號
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem; margin-bottom: 1.5rem;">
          <div><span style="color: var(--text-muted);">案件主旨：</span><strong>${caseObj.title}</strong></div>
          <div><span style="color: var(--text-muted);">通報分類：</span><span>${caseObj.category}</span></div>
          <div><span style="color: var(--text-muted);">通報日期：</span><span>${caseObj.date}</span></div>
          <div><span style="color: var(--text-muted);">處理狀態：</span><strong style="color: var(--gov-emerald);">${caseObj.statusText}</strong></div>
        </div>

        <div style="background: var(--bg-surface-raised); padding: 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; color: var(--text-sub);">
          <strong>市民叮嚀：</strong>請妥善保存上方案號。您隨時可至本頁面「案件進度即時查詢」分頁，掌握各階段現地查處照片與局處公文回覆。
        </div>
      </div>

      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="querySpecificCase('${caseObj.caseNumber}')">
          立即查詢此案件進度
        </button>
        <button class="btn btn-secondary" onclick="window.print()">
          列印案件受理聯單
        </button>
      </div>
    </div>
  `;

  showToast('案件已建檔並產出正式案號！', 'success');
}

/* ========================================================
   3. 案件進度即時查詢模組 (Case Inquiry)
   ======================================================== */
function initCaseInquiry() {
  const searchBtn = document.getElementById('inquirySearchBtn');
  const input = document.getElementById('inquiryCaseInput');
  const sampleChips = document.querySelectorAll('.sample-chip');

  if (searchBtn && input) {
    searchBtn.addEventListener('click', () => {
      const q = input.value.trim();
      if (!q) {
        showToast('請輸入追蹤案號或通報人手機號碼！', 'error');
        return;
      }
      executeCaseQuery(q);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }

  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const code = chip.getAttribute('data-case');
      if (input) input.value = code;
      executeCaseQuery(code);
    });
  });

  // 預設載入範例案號 1
  executeCaseQuery('MD-20261020-0042');
}

function querySpecificCase(caseNumber) {
  // 切換至查詢分頁
  const queryTab = document.querySelector('.mailbox-tab-btn[data-target="paneInquiry"]');
  if (queryTab) queryTab.click();

  const input = document.getElementById('inquiryCaseInput');
  if (input) input.value = caseNumber;

  executeCaseQuery(caseNumber);
}

function executeCaseQuery(term) {
  const resultContainer = document.getElementById('caseQueryResult');
  if (!resultContainer) return;

  const mockCases = window.MINDE_DATA?.mockCases || [];
  const localCases = JSON.parse(localStorage.getItem('mindegov_cases') || '[]');
  const allCases = [...localCases, ...mockCases];

  const found = allCases.find(c => 
    c.caseNumber.toLowerCase() === term.toLowerCase() ||
    (c.phone && c.phone.replace(/-/g, '').includes(term.replace(/-/g, '')))
  );

  if (!found) {
    resultContainer.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-md); max-width: 700px; margin: 0 auto;">
        <svg style="width: 48px; height: 48px; stroke: var(--border-medium); margin-bottom: 0.8rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">查無對應之案件編號「${term}」</p>
        <p style="font-size: 0.88rem; margin-top: 0.4rem;">請確認案號格式是否正確（例：MD-20261020-0042）或撥打 1999 專線由專人為您查詢。</p>
      </div>
    `;
    return;
  }

  // 繪製時間軸
  let timelineHtml = '';
  found.timeline.forEach((step, idx) => {
    timelineHtml += `
      <div class="timeline-step-item">
        <div class="timeline-dot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="timeline-title">${step.title}</div>
        <div class="timeline-time">${step.date}</div>
        <div class="timeline-desc">${step.desc}</div>
      </div>
    `;
  });

  const replyHtml = found.reply ? `
    <div class="case-official-reply">
      <div class="reply-title">
        <svg style="width: 18px; height: 18px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>權責機關【${found.category}】正式回覆：</span>
      </div>
      <div class="reply-content">${found.reply}</div>
    </div>
  ` : '';

  resultContainer.innerHTML = `
    <div class="case-result-card">
      <div class="case-card-header">
        <div>
          <span style="font-size: 0.82rem; color: var(--text-muted);">案件編號</span>
          <div class="case-num">${found.caseNumber}</div>
        </div>
        <span class="category-badge ${found.status === 'completed' ? 'primary' : 'warning'}" style="font-size: 0.85rem; padding: 0.35rem 0.85rem;">
          ${found.statusText}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; font-size: 0.9rem; margin-bottom: 1.5rem; background: var(--bg-surface-raised); padding: 1.1rem; border-radius: var(--radius-sm);">
        <div><span style="color: var(--text-muted);">陳情主旨：</span><strong>${found.title}</strong></div>
        <div><span style="color: var(--text-muted);">承辦局處：</span><strong>${found.category}</strong></div>
        <div><span style="color: var(--text-muted);">通報市民：</span><span>${found.name} (${found.phone})</span></div>
        <div><span style="color: var(--text-muted);">成立日期：</span><span>${found.date}</span></div>
      </div>

      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--gov-navy); margin-bottom: 1.25rem;">辦理進度歷程時間軸：</h4>
      <div class="timeline-stepper">
        ${timelineHtml}
      </div>

      ${replyHtml}
    </div>
  `;
}

window.querySpecificCase = querySpecificCase;
window.removeFile = removeFile;
