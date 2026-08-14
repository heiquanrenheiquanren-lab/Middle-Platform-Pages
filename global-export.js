(function () {
  'use strict';

  var STORAGE_KEY = 'middle-platform-export-tasks-v1';
  var PAGE_SIZE = 8;
  var state = { open: false, page: 1, filters: { status: '', taskTypes: [], templateName: '' } };
  var statusMeta = {
    processing: { label: '处理中', className: 'processing' },
    success: { label: '成功', className: 'success' },
    failed: { label: '失败', className: 'failed' },
    cancelled: { label: '已取消', className: 'cancelled' }
  };

  function uid() {
    return 'EXP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  function nowText(date) {
    var value = date instanceof Date ? date : new Date(date || Date.now());
    var pad = function (number) { return String(number).padStart(2, '0'); };
    return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate()) + ' ' + pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds());
  }

  function readTasks() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      // localStorage may be unavailable when the prototype is opened as a file.
    }
    var current = new Date();
    var before = function (minutes) { return nowText(new Date(current.getTime() - minutes * 60000)); };
    return [
      { id: uid(), taskType: '海外仓发货计划导出', templateName: '海外仓发货计划导出', sourcePage: '发货计划', status: 'failed', operator: 'Admin', startedAt: before(18), completedAt: before(16), duration: '2秒', failureReason: '导出服务超时' },
      { id: uid(), taskType: '需求预测导出', templateName: '需求预测导出', sourcePage: '需求预测', status: 'success', operator: 'Admin', startedAt: before(42), completedAt: before(41), duration: '1秒', failureReason: '—' },
      { id: uid(), taskType: '供应商库存导出', templateName: '供应商库存导出', sourcePage: '供应商库存', status: 'processing', operator: 'Admin', startedAt: before(1), completedAt: '—', duration: '—', failureReason: '—' }
    ];
  }

  var tasks = readTasks().filter(function (task) { return ['processing', 'success', 'failed', 'cancelled'].indexOf(task.status) >= 0; });

  function saveTasks() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (error) { /* prototype fallback */ }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function getSourcePage() {
    var title = (document.title || '').replace(/[-—|].*$/, '').trim();
    var map = [
      ['需求预测', '需求预测'], ['供应商库存', '供应商库存'], ['平台仓', '平台仓&海外仓库存'],
      ['海外仓库存', '平台仓&海外仓库存'], ['团队库存', '团队库存'], ['备货计划', '备货计划'],
      ['采购单', '采购单'], ['发货单', '发货单'], ['发货计划', '发货计划'], ['头程成本', 'SKU头程成本']
    ];
    for (var i = 0; i < map.length; i += 1) if (title.indexOf(map[i][0]) >= 0) return map[i][1];
    return title || '当前页面';
  }

  function getFilterSnapshot() {
    var values = [];
    document.querySelectorAll('input, select').forEach(function (input) {
      if (!input.value || input.closest('.gx-dialog')) return;
      var label = input.getAttribute('aria-label') || input.getAttribute('placeholder') || input.name || input.id;
      if (label) values.push(label + '=' + input.value);
    });
    return values.length ? values.slice(0, 12).join('; ') : '当前页面筛选条件';
  }

  function showToast(message, kind) {
    var node = document.querySelector('.gx-toast');
    if (!node) { node = document.createElement('div'); node.className = 'gx-toast'; document.body.appendChild(node); }
    node.textContent = message;
    node.className = 'gx-toast ' + (kind || '');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { node.className = 'gx-toast'; }, 2800);
  }

  function updateBadge() {
    var badge = document.querySelector('.gx-entry-badge');
    if (!badge) return;
    var count = tasks.filter(function (task) { return task.status === 'processing'; }).length;
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = count === 0;
  }

  function createTask(options) {
    options = options || {};
    var sourcePage = options.sourcePage || getSourcePage();
    var task = {
      id: uid(), taskType: options.taskType || sourcePage + '导出', templateName: options.templateName || sourcePage + '导出',
      sourcePage: sourcePage, status: 'processing', operator: 'Admin', startedAt: nowText(), completedAt: '—', duration: '—',
      failureReason: '—', filterSnapshot: options.filterSnapshot || getFilterSnapshot()
    };
    tasks.unshift(task); saveTasks(); updateBadge();
    showToast('导出任务已创建，可在右上角导出中心查看');
    window.setTimeout(function () {
      var current = tasks.find(function (item) { return item.id === task.id; });
      if (!current || current.status !== 'processing') return;
      current.status = 'success'; current.completedAt = nowText(); current.duration = '2秒';
      saveTasks(); updateBadge(); if (state.open) renderTable();
    }, 1800);
    return task;
  }

  function statusTag(status) {
    var meta = statusMeta[status] || statusMeta.processing;
    return '<span class="gx-status gx-status-' + meta.className + '">' + meta.label + '</span>';
  }

  function matches(task) {
    var filter = state.filters;
    if (filter.status && task.status !== filter.status) return false;
    if (filter.taskTypes.length && filter.taskTypes.indexOf(task.taskType) < 0) return false;
    if (filter.templateName && task.templateName.toLowerCase().indexOf(filter.templateName.toLowerCase()) < 0) return false;
    return true;
  }

  function actionButtons(task) {
    if (task.status === 'processing') return '<button class="gx-link" data-action="cancel" data-id="' + task.id + '">取消</button>';
    if (task.status === 'success') return '<button class="gx-link" data-action="download" data-id="' + task.id + '">下载</button>';
    if (task.status === 'failed') return '<button class="gx-link" data-action="retry" data-id="' + task.id + '">重试</button><button class="gx-link" data-action="cancel" data-id="' + task.id + '">取消</button>';
    return '<button class="gx-link" data-action="retry" data-id="' + task.id + '">重试</button>';
  }

  function renderTable() {
    var tableBody = document.querySelector('.gx-table-body');
    var countNode = document.querySelector('.gx-result-count');
    if (!tableBody) return;
    var filtered = tasks.filter(matches);
    var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    var rows = filtered.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    countNode.textContent = '共 ' + filtered.length + ' 条记录';
    document.querySelector('.gx-page-current').textContent = state.page;
    document.querySelector('.gx-page-total').textContent = totalPages;
    tableBody.innerHTML = rows.length ? rows.map(function (task) {
      return '<tr><td>' + escapeHtml(task.taskType) + '</td><td>' + escapeHtml(task.templateName) + '</td><td>' + escapeHtml(task.sourcePage) + '</td><td>' + statusTag(task.status) + '</td><td>' + escapeHtml(task.operator) + '</td><td>' + escapeHtml(task.startedAt) + '</td><td>' + escapeHtml(task.completedAt) + '</td><td>' + escapeHtml(task.duration) + '</td><td>' + escapeHtml(task.failureReason) + '</td><td class="gx-actions">' + actionButtons(task) + '</td></tr>';
    }).join('') : '<tr><td colspan="10" class="gx-empty">暂无符合条件的导出记录</td></tr>';
  }

  function renderDialog() {
    if (document.querySelector('.gx-dialog')) return;
    var mask = document.createElement('div');
    mask.className = 'gx-mask';
    var taskTypeOptions = Array.from(new Set(tasks.map(function (task) { return task.taskType; }))).map(function (type) { return '<label class="gx-multi-option"><input type="checkbox" value="' + escapeHtml(type) + '"><span>' + escapeHtml(type) + '</span></label>'; }).join('');
    mask.innerHTML = '<section class="gx-dialog" role="dialog" aria-modal="true" aria-label="导出中心"><div class="gx-dialog-header"><div><h2>导出中心</h2><p>查看和管理当前账号发起的全部导出任务</p></div><button class="gx-close" aria-label="关闭">×</button></div><div class="gx-dialog-body"><div class="gx-filter"><div class="gx-multi-select"><button type="button" class="gx-control gx-multi-select-trigger">全部任务类型⌄</button><div class="gx-multi-select-panel"><input class="gx-control gx-multi-search" placeholder="搜索任务类型"><div class="gx-multi-options">' + taskTypeOptions + '</div></div></div><input class="gx-control gx-filter-template" placeholder="模板名称，支持模糊搜索"><select class="gx-control gx-filter-status"><option value="">全部处理状态</option><option value="processing">处理中</option><option value="success">成功</option><option value="failed">失败</option><option value="cancelled">已取消</option></select><button class="gx-btn gx-btn-primary gx-filter-submit">搜索</button><button class="gx-btn gx-btn-plain gx-filter-reset">重置</button></div><div class="gx-table-wrap"><table class="gx-table"><thead><tr><th>任务类型</th><th>模板名称</th><th>来源页面</th><th>处理状态</th><th>操作人</th><th>发起时间</th><th>完成时间</th><th>处理耗时</th><th>失败原因</th><th>操作</th></tr></thead><tbody class="gx-table-body"></tbody></table></div><div class="gx-dialog-footer"><span class="gx-result-count">共 0 条记录</span><div class="gx-pagination"><button class="gx-page-prev">‹</button><span class="gx-page-current">1</span><span>/</span><span class="gx-page-total">1</span><button class="gx-page-next">›</button></div></div></div></section>';
    document.body.appendChild(mask);
    mask.addEventListener('click', function (event) {
      if (event.target === mask || event.target.closest('.gx-close')) closeWorkbench();
      var actionNode = event.target.closest('[data-action]');
      if (actionNode) handleAction(actionNode.getAttribute('data-action'), actionNode.getAttribute('data-id'));
      if (event.target.closest('.gx-filter-submit')) applyFilters();
      if (event.target.closest('.gx-multi-select-trigger')) { event.stopPropagation(); event.target.closest('.gx-multi-select').classList.toggle('is-open'); return; }
      if (!event.target.closest('.gx-multi-select')) { var openMulti = mask.querySelector('.gx-multi-select.is-open'); if (openMulti) openMulti.classList.remove('is-open'); }
      if (event.target.closest('.gx-filter-reset')) { state.filters = { status: '', taskTypes: [], templateName: '' }; state.page = 1; syncFilterInputs(); renderTable(); }
      if (event.target.closest('.gx-page-prev') && state.page > 1) { state.page -= 1; renderTable(); }
      if (event.target.closest('.gx-page-next')) { var total = Math.max(1, Math.ceil(tasks.filter(matches).length / PAGE_SIZE)); if (state.page < total) { state.page += 1; renderTable(); } }
    });
    mask.querySelector('.gx-filter-template').addEventListener('keydown', function (event) { if (event.key === 'Enter') applyFilters(); });
    mask.querySelector('.gx-multi-search').addEventListener('input', function (event) {
      var keyword = event.target.value.trim().toLowerCase();
      mask.querySelectorAll('.gx-multi-option').forEach(function (option) { option.hidden = option.textContent.toLowerCase().indexOf(keyword) < 0; });
    });
  }

  function syncFilterInputs() {
    var dialog = document.querySelector('.gx-dialog'); if (!dialog) return;
    dialog.querySelector('.gx-filter-status').value = state.filters.status;
    dialog.querySelector('.gx-filter-template').value = state.filters.templateName;
    var selectedTypes = dialog.querySelectorAll('.gx-multi-option input');
    selectedTypes.forEach(function (option) { option.checked = state.filters.taskTypes.indexOf(option.value) >= 0; });
    dialog.querySelector('.gx-multi-select-trigger').textContent = state.filters.taskTypes.length ? '已选 ' + state.filters.taskTypes.length + ' 项⌄' : '全部任务类型⌄';
  }

  function applyFilters() {
    var dialog = document.querySelector('.gx-dialog'); if (!dialog) return;
    state.filters = { status: dialog.querySelector('.gx-filter-status').value, taskTypes: Array.from(dialog.querySelectorAll('.gx-multi-option input:checked')).map(function (option) { return option.value; }), templateName: dialog.querySelector('.gx-filter-template').value.trim() };
    state.page = 1; renderTable();
  }

  function openWorkbench() {
    renderDialog(); state.open = true; document.querySelector('.gx-mask').classList.add('is-visible'); renderTable(); syncFilterInputs();
  }

  function closeWorkbench() {
    var mask = document.querySelector('.gx-mask'); if (mask) mask.classList.remove('is-visible'); state.open = false;
  }

  function refreshProcessing() {
    var changed = false;
    tasks.forEach(function (task) { if (task.status === 'processing') { task.status = 'success'; task.completedAt = nowText(); task.duration = '2秒'; changed = true; } });
    if (changed) { saveTasks(); updateBadge(); renderTable(); showToast('导出任务状态已刷新'); } else showToast('暂无处理中任务');
  }

  function downloadTask(task) {
    if (task.status !== 'success') return;
    saveTasks(); renderTable();
    var content = '\ufeff任务类型,模板名称,来源页面,筛选条件快照\n' + [task.taskType, task.templateName, task.sourcePage, task.filterSnapshot || '当前页面筛选条件'].map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(',') + '\n';
    var link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' })); link.download = (task.templateName || '导出结果') + '.csv'; link.click(); URL.revokeObjectURL(link.href); showToast('文件已开始下载');
  }

  function handleAction(action, id) {
    var task = tasks.find(function (item) { return item.id === id; }); if (!task) return;
    if (action === 'cancel' && (task.status === 'processing' || task.status === 'failed')) { var previousStatus = task.status; task.status = 'cancelled'; task.completedAt = nowText(); task.duration = '—'; task.failureReason = previousStatus === 'failed' ? '失败任务已取消' : '用户取消'; saveTasks(); updateBadge(); renderTable(); showToast('导出任务已取消'); }
    else if (action === 'refresh') refreshProcessing();
    else if (action === 'download') downloadTask(task);
    else if (action === 'retry') { task.status = 'processing'; task.startedAt = nowText(); task.completedAt = '—'; task.duration = '—'; task.failureReason = '—'; saveTasks(); updateBadge(); renderTable(); showToast('已重新创建导出任务'); }
  }

  function isExportTrigger(node) {
    if (!node || node.closest('.gx-dialog') || node.closest('.gx-entry')) return false;
    var target = node.closest('button, a, [role="button"], .el-button, .btn, .tool, [title]');
    if (!target) return false;
    if (target.closest('.warehouse-sku-tool')) return false;
    var text = (target.textContent || '').replace(/\s/g, '').trim();
    var title = target.getAttribute('title') || target.getAttribute('aria-label') || '';
    if (text.indexOf('模板') >= 0 || title.indexOf('模板') >= 0) return false;
    return text === '导出' || text === '下载' || text === '↧' || text === '⇩' || /导出|下载/.test(title);
  }

  function mountEntry() {
    if (document.querySelector('.gx-entry')) return;
    var container = document.querySelector('.global-right') || document.querySelector('.header-user');
    if (!container) return;
    var entry = document.createElement('button'); entry.type = 'button'; entry.className = 'gx-entry'; entry.innerHTML = '<span class="gx-entry-icon">⇩</span><span>导出中心</span><sup class="gx-entry-badge" hidden>0</sup>';
    var admin = container.querySelector('.admin');
    if (!admin) admin = Array.prototype.slice.call(container.children).find(function (child) { return /Admin/.test(child.textContent || ''); });
    if (admin) container.insertBefore(entry, admin); else container.appendChild(entry);
    entry.addEventListener('click', openWorkbench); updateBadge();
  }

  function navigateToWorkbench() {
    var message = { type: 'prototype:navigate', page: 'workbench' };
    if (window.parent !== window) window.parent.postMessage(message, '*');
    else window.location.href = '../../pages/workbench/index.html';
  }

  function navigateToBusinessPages() {
    var message = { type: 'prototype:navigate', page: 'supplierInventory' };
    if (window.parent !== window) window.parent.postMessage(message, '*');
    else window.location.href = '../../pages/supplier-inventory/index.html';
  }

  function mountWorkbenchShortcut() {
    var modules = document.querySelectorAll('.global-left .top-module');
    var icons = document.querySelectorAll('.global-left .top-icon, .global-left .global-icon');
    var firstTarget = modules[0] || icons[0];
    var businessTarget = modules[2] || icons[2];
    if (firstTarget && firstTarget.dataset.workbenchBound !== 'true') {
      firstTarget.dataset.workbenchBound = 'true';
      firstTarget.setAttribute('title', '工作台');
      firstTarget.addEventListener('click', navigateToWorkbench);
    }
    if (businessTarget && businessTarget.dataset.businessBound !== 'true') {
      businessTarget.dataset.businessBound = 'true';
      businessTarget.setAttribute('title', '供应链中台');
      businessTarget.addEventListener('click', navigateToBusinessPages);
    }
  }

  function mountTopModuleLabels() {
    var labels = ['工作台', '财务中台', '供应链中台', '运营中台', '产品资料', '企业工单'];
    document.querySelectorAll('.global-left').forEach(function (container) {
      var icons = Array.prototype.slice.call(container.children).filter(function (child) { return child.classList.contains('top-icon') || child.classList.contains('global-icon'); });
      icons.slice(0, labels.length).forEach(function (icon, index) {
        if (icon.parentElement.classList.contains('top-module')) return;
        if ((icon.textContent || '').trim()) return;
        var module = document.createElement('span');
        module.className = 'top-module';
        module.setAttribute('title', labels[index]);
        icon.parentNode.insertBefore(module, icon);
        module.appendChild(icon);
        var label = document.createElement('span');
        label.className = 'top-module-label';
        label.textContent = labels[index];
        module.appendChild(label);
      });
    });
  }

  document.addEventListener('click', function (event) {
    if (!isExportTrigger(event.target)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    var target = event.target.closest('button, a, [role="button"], .el-button, .btn, .tool, [title]');
    createTask({ taskType: getSourcePage() + '导出', templateName: getSourcePage() + '导出', filterSnapshot: getFilterSnapshot() });
  }, true);

  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && state.open) closeWorkbench(); });
  window.GlobalExportWorkbench = { open: openWorkbench, close: closeWorkbench, createTask: createTask, getTasks: function () { return tasks.slice(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountTopModuleLabels(); mountEntry(); mountWorkbenchShortcut(); }); else { mountTopModuleLabels(); mountEntry(); mountWorkbenchShortcut(); }
})();
