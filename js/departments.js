/**
 * 民德市政府官網 - 各局處介紹模組 (Departments & Bureaus Directory Module)
 * 智慧民德．幸福永續
 */

document.addEventListener('DOMContentLoaded', () => {
  initDepartments();
});

let currentDeptCategory = 'all';
let currentDeptKeyword = '';

function initDepartments() {
  const catButtons = document.querySelectorAll('.dept-cat-btn');
  const searchInput = document.getElementById('deptSearchInput');

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDeptCategory = btn.getAttribute('data-dept-cat');
      renderDepartmentsGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentDeptKeyword = e.target.value.trim().toLowerCase();
      renderDepartmentsGrid();
    });
  }

  renderDepartmentsGrid();
}

function renderDepartmentsGrid() {
  const container = document.getElementById('departmentsGridContainer');
  if (!container || !window.MINDE_DATA) return;

  const depts = window.MINDE_DATA.departments || [];

  const filtered = depts.filter(d => {
    const matchesCat = currentDeptCategory === 'all' || d.category === currentDeptCategory;
    const matchesKw = !currentDeptKeyword ||
      d.name.toLowerCase().includes(currentDeptKeyword) ||
      d.englishName.toLowerCase().includes(currentDeptKeyword) ||
      d.chief.toLowerCase().includes(currentDeptKeyword) ||
      d.intro.toLowerCase().includes(currentDeptKeyword) ||
      d.duties.some(item => item.toLowerCase().includes(currentDeptKeyword)) ||
      d.keyServices.some(item => item.toLowerCase().includes(currentDeptKeyword));
    return matchesCat && matchesKw;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-raised); border-radius: var(--radius-md);">
        <p style="font-weight: 600; font-size: 1.1rem;">查無符合條件之市府局處機關</p>
        <p style="font-size: 0.85rem; margin-top: 0.4rem;">請嘗試使用其他業務關鍵字，或撥打 1999 總機轉接。</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(dept => {
    html += `
      <div class="department-card" style="border-top-color: ${dept.bannerColor};">
        <div class="dept-header">
          <div class="dept-title-group">
            <h3 class="dept-name">${dept.name}</h3>
            <span class="dept-en-name">${dept.englishName}</span>
          </div>
          <span class="dept-badge">${dept.categoryName}</span>
        </div>

        <div class="dept-chief-badge">
          <svg style="width: 15px; height: 15px; stroke: currentColor;" viewBox="0 0 24 24" fill="none" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>首長：<strong>${dept.chief} ${dept.chiefTitle}</strong></span>
        </div>

        <div class="dept-motto">“${dept.motto}”</div>

        <p style="font-size: 0.88rem; color: var(--text-sub); line-height: 1.6; margin-bottom: 1.25rem;">
          ${dept.intro}
        </p>

        <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">核心業務職掌：</h4>
        <ul class="dept-duties-list">
          ${dept.duties.slice(0, 3).map(duty => `
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${duty}</span>
            </li>
          `).join('')}
        </ul>

        <div class="dept-contact-bar">
          <div style="display: flex; flex-direction: column; gap: 0.2rem;">
            <a href="tel:${dept.phone.split(' ')[0]}" class="dept-phone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>${dept.phone}</span>
            </a>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${dept.location}</span>
          </div>
          <button class="btn btn-secondary" style="padding: 0.4rem 0.95rem; font-size: 0.85rem;" onclick="openDepartmentModal('${dept.id}')">
            業務詳情與線上便民
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openDepartmentModal(deptId) {
  const dept = (window.MINDE_DATA?.departments || []).find(d => d.id === deptId);
  if (!dept) return;

  const modal = document.getElementById('departmentDetailModal');
  const titleEl = document.getElementById('modalDeptTitle');
  const bodyEl = document.getElementById('modalDeptBody');

  if (!modal) return;

  titleEl.textContent = `${dept.name} (${dept.englishName})`;
  bodyEl.innerHTML = `
    <div style="border-left: 4px solid ${dept.bannerColor}; padding-left: 1rem; margin-bottom: 1.5rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.2rem;">機關格言與施政願景</div>
      <div style="font-size: 1.05rem; font-weight: 700; color: var(--gov-navy);">“${dept.motto}”</div>
    </div>

    <div class="dept-modal-grid">
      <div>
        <span style="color: var(--text-muted);">局長首長：</span>
        <strong style="color: var(--gov-navy);">${dept.chief}</strong>
      </div>
      <div>
        <span style="color: var(--text-muted);">服務分機：</span>
        <strong>${dept.phone}</strong>
      </div>
      <div>
        <span style="color: var(--text-muted);">辦公位置：</span>
        <span>${dept.location}</span>
      </div>
      <div>
        <span style="color: var(--text-muted);">官方專屬入口：</span>
        <a href="#departments" onclick="showToast('已開啟 ${dept.name} 專屬機關門戶', 'info')" style="color: var(--gov-blue); text-decoration: underline;">瀏覽局處專屬網站</a>
      </div>
    </div>

    <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">局處業務簡介：</h4>
    <p style="color: var(--text-sub); line-height: 1.7; margin-bottom: 1.5rem;">${dept.intro}</p>

    <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">全體業務職掌項目：</h4>
    <ul style="padding-left: 1.25rem; color: var(--text-sub); margin-bottom: 1.5rem; line-height: 1.8;">
      ${dept.duties.map(d => `<li>${d}</li>`).join('')}
    </ul>

    <h4 style="font-weight: 700; color: var(--gov-navy); margin-bottom: 0.6rem;">該局承辦便民申辦項目：</h4>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
      ${dept.keyServices.map(srv => `
        <span style="background: var(--gov-blue-subtle); color: var(--gov-blue); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600;">
          ✓ ${srv}
        </span>
      `).join('')}
    </div>

    <div style="text-align: right; border-top: 1px solid var(--border-light); padding-top: 1rem;">
      <button class="btn btn-primary" onclick="closeAllModals(); showToast('已為您記錄 ${dept.name} 聯絡資訊', 'success');">
        確定關閉
      </button>
    </div>
  `;

  modal.classList.add('active');
}

window.openDepartmentModal = openDepartmentModal;
