(function () {
  'use strict';

  var suppliers = [
    { name: '深圳市康仕达科技有限公司', code: 'SUP-0001', status: '合作中', logs: [{ type: '新增', content: '新增供应商，合作状态为合作中', operator: 'Admin', time: '2026-08-01 09:30:00' }] },
    { name: '梧州市友盟焊接防护用品有限公司', code: 'SUP-0002', status: '合作中', logs: [] },
    { name: '深圳市睿达供应链有限公司', code: 'SUP-0003', status: '禁用', logs: [{ type: '状态调整', content: '合作状态由合作中调整为禁用', operator: 'Admin', time: '2026-08-05 15:20:00' }] },
    { name: '江苏奥信光电科技有限公司', code: 'SUP-0004', status: '合作中', logs: [] },
    { name: '常州佳士达焊材有限公司', code: 'SUP-0005', status: '合作中', logs: [] },
    { name: '义乌市优品贸易有限公司', code: 'SUP-0006', status: '禁用', logs: [] },
    { name: '东莞市华诚包装材料有限公司', code: 'SUP-0007', status: '合作中', logs: [] }
  ];
  var selectedNames = [];
  var filteredRows = suppliers.slice();
  var modalMode = 'add';
  var editingSupplier = null;
  var logSupplier = null;

  var nameTrigger = document.querySelector('#supplierNameTrigger');
  var nameDropdown = document.querySelector('#supplierNameDropdown');
  var nameKeyword = document.querySelector('#supplierNameKeyword');
  var nameOptions = document.querySelector('#supplierNameOptions');
  var codeInput = document.querySelector('#supplierCodeInput');
  var statusInput = document.querySelector('#supplierStatusInput');
  var tableBody = document.querySelector('#supplierTableBody');
  var resultCount = document.querySelector('#supplierResultCount');
  var empty = document.querySelector('#supplierEmpty');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function now() {
    var date = new Date();
    function pad(number) { return String(number).padStart(2, '0'); }
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function nextSupplierCode() {
    var max = suppliers.reduce(function (current, supplier) {
      var matched = String(supplier.code).match(/(\d+)$/);
      return Math.max(current, matched ? Number(matched[1]) : 0);
    }, 0);
    return 'SUP-' + String(max + 1).padStart(4, '0');
  }

  function renderNameOptions() {
    var keyword = (nameKeyword.value || '').trim().toLowerCase();
    var names = Array.from(new Set(suppliers.map(function (supplier) { return supplier.name; }))).filter(function (name) { return name.toLowerCase().indexOf(keyword) >= 0; });
    nameOptions.innerHTML = names.length ? names.map(function (name) {
      return '<label class="supplier-name-option"><input type="checkbox" value="' + escapeHtml(name) + '" ' + (selectedNames.indexOf(name) >= 0 ? 'checked' : '') + '><span>' + escapeHtml(name) + '</span></label>';
    }).join('') : '<div class="supplier-empty-option">暂无匹配供应商</div>';
    nameOptions.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('change', function () {
        if (input.checked && selectedNames.indexOf(input.value) < 0) selectedNames.push(input.value);
        else if (!input.checked) selectedNames = selectedNames.filter(function (name) { return name !== input.value; });
        updateNameTrigger();
      });
    });
  }

  function updateNameTrigger() {
    nameTrigger.textContent = selectedNames.length ? '已选 ' + selectedNames.length + ' 个供应商' : '供应商名称（可多选）';
    nameTrigger.classList.toggle('has-value', selectedNames.length > 0);
  }

  function renderTable() {
    resultCount.textContent = '共 ' + filteredRows.length + ' 条';
    empty.hidden = filteredRows.length > 0;
    tableBody.innerHTML = filteredRows.map(function (supplier) {
      var statusClass = supplier.status === '合作中' ? 'cooperating' : 'disabled';
      return '<tr><td>' + escapeHtml(supplier.name) + '</td><td>' + escapeHtml(supplier.code) + '</td><td><span class="supplier-status ' + statusClass + '">' + escapeHtml(supplier.status) + '</span></td><td><span class="supplier-operation"><button class="supplier-link" type="button" data-action="edit" data-code="' + escapeHtml(supplier.code) + '">编辑</button><button class="supplier-link" type="button" data-action="log" data-code="' + escapeHtml(supplier.code) + '">日志</button></span></td></tr>';
    }).join('');
  }

  function splitCodes(value) {
    return value.split(/[\s,，、;；]+/).map(function (code) { return code.trim(); }).filter(Boolean);
  }

  function search() {
    var codes = splitCodes(codeInput.value);
    var status = statusInput.value;
    filteredRows = suppliers.filter(function (supplier) {
      var nameMatched = !selectedNames.length || selectedNames.indexOf(supplier.name) >= 0;
      var codeMatched = !codes.length || codes.indexOf(supplier.code) >= 0;
      var statusMatched = !status || supplier.status === status;
      return nameMatched && codeMatched && statusMatched;
    });
    renderTable();
  }

  function reset() {
    selectedNames = [];
    codeInput.value = '';
    statusInput.value = '';
    nameKeyword.value = '';
    renderNameOptions();
    updateNameTrigger();
    filteredRows = suppliers.slice();
    renderTable();
  }

  function createModalMarkup() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<div id="supplierEditModal" class="supplier-modal-mask" hidden><section class="supplier-modal" role="dialog" aria-modal="true" aria-labelledby="supplierEditTitle"><header class="supplier-modal-header"><span id="supplierEditTitle">新增供应商</span><button class="supplier-modal-close" type="button" data-modal-close="edit" aria-label="关闭">×</button></header><div class="supplier-modal-body"><div class="supplier-form-item"><label class="supplier-form-label" for="supplierEditName"><em>*</em> 供应商名称</label><input id="supplierEditName" class="supplier-modal-input" placeholder="请输入供应商名称"><div id="supplierEditError" class="supplier-modal-error"></div></div><div class="supplier-form-item"><label class="supplier-form-label" for="supplierEditCode">供应商代码</label><input id="supplierEditCode" class="supplier-modal-input" readonly></div><div class="supplier-form-item"><label class="supplier-form-label" for="supplierEditStatus">合作状态</label><select id="supplierEditStatus" class="supplier-modal-input"><option value="合作中">合作中</option><option value="禁用">禁用</option></select></div></div><footer class="supplier-modal-footer"><button class="supplier-button" type="button" data-modal-close="edit">取消</button><button id="supplierEditSave" class="supplier-button primary" type="button">保存</button></footer></section></div><div id="supplierLogModal" class="supplier-modal-mask" hidden><section class="supplier-modal log-modal" role="dialog" aria-modal="true" aria-labelledby="supplierLogTitle"><header class="supplier-modal-header"><span id="supplierLogTitle">操作日志</span><button class="supplier-modal-close" type="button" data-modal-close="log" aria-label="关闭">×</button></header><div class="supplier-modal-body"><div id="supplierLogSubtitle" class="supplier-log-title"></div><table class="supplier-log-table"><thead><tr><th style="width:100px">操作类型</th><th>日志内容</th><th style="width:120px">操作人</th><th style="width:170px">操作时间</th></tr></thead><tbody id="supplierLogBody"></tbody></table><div id="supplierLogEmpty" class="supplier-empty" hidden>暂无操作日志</div><div class="supplier-log-pagination" id="supplierLogPagination"></div></div></section></div>';
    document.body.appendChild(wrapper.firstElementChild);
    document.body.appendChild(wrapper.firstElementChild);
  }

  function closeModal(type) {
    document.querySelector(type === 'log' ? '#supplierLogModal' : '#supplierEditModal').hidden = true;
  }

  function openAdd() {
    modalMode = 'add';
    editingSupplier = null;
    document.querySelector('#supplierEditTitle').textContent = '新增供应商';
    document.querySelector('#supplierEditName').readOnly = false;
    document.querySelector('#supplierEditName').value = '';
    document.querySelector('#supplierEditCode').value = nextSupplierCode();
    document.querySelector('#supplierEditStatus').value = '合作中';
    document.querySelector('#supplierEditStatus').disabled = false;
    document.querySelector('#supplierEditError').textContent = '';
    document.querySelector('#supplierEditModal').hidden = false;
    document.querySelector('#supplierEditName').focus();
  }

  function openEdit(supplier) {
    modalMode = 'edit';
    editingSupplier = supplier;
    document.querySelector('#supplierEditTitle').textContent = '编辑供应商';
    document.querySelector('#supplierEditName').readOnly = true;
    document.querySelector('#supplierEditName').value = supplier.name;
    document.querySelector('#supplierEditCode').value = supplier.code;
    document.querySelector('#supplierEditStatus').value = supplier.status;
    document.querySelector('#supplierEditStatus').disabled = false;
    document.querySelector('#supplierEditError').textContent = '';
    document.querySelector('#supplierEditModal').hidden = false;
  }

  function saveSupplier() {
    var name = document.querySelector('#supplierEditName').value.trim();
    var status = document.querySelector('#supplierEditStatus').value;
    var error = document.querySelector('#supplierEditError');
    if (!name) { error.textContent = '请输入供应商名称'; return; }
    if (modalMode === 'add') {
      if (suppliers.some(function (supplier) { return supplier.name === name; })) { error.textContent = '供应商名称已存在'; return; }
      var created = { name: name, code: nextSupplierCode(), status: status, logs: [{ type: '新增', content: '新增供应商，合作状态为' + status, operator: 'Admin', time: now() }] };
      suppliers.push(created);
    } else {
      var oldStatus = editingSupplier.status;
      editingSupplier.name = name;
      editingSupplier.status = status;
      if (oldStatus !== status) editingSupplier.logs.unshift({ type: '状态调整', content: '合作状态由' + oldStatus + '调整为' + status, operator: 'Admin', time: now() });
      else editingSupplier.logs.unshift({ type: '编辑', content: '编辑供应商信息', operator: 'Admin', time: now() });
    }
    closeModal('edit');
    renderNameOptions();
    search();
  }

  function openLog(supplier) {
    logSupplier = supplier;
    var logs = supplier.logs || [];
    document.querySelector('#supplierLogTitle').textContent = '操作日志';
    document.querySelector('#supplierLogSubtitle').textContent = supplier.name + '（' + supplier.code + '）';
    document.querySelector('#supplierLogBody').innerHTML = logs.map(function (log) { return '<tr><td>' + escapeHtml(log.type) + '</td><td>' + escapeHtml(log.content) + '</td><td>' + escapeHtml(log.operator) + '</td><td>' + escapeHtml(log.time) + '</td></tr>'; }).join('');
    document.querySelector('#supplierLogEmpty').hidden = logs.length > 0;
    document.querySelector('#supplierLogPagination').textContent = logs.length ? '共 ' + logs.length + ' 条' : '';
    document.querySelector('#supplierLogModal').hidden = false;
  }

  createModalMarkup();
  nameTrigger.addEventListener('click', function (event) { event.stopPropagation(); nameDropdown.classList.toggle('show'); nameTrigger.classList.toggle('open'); renderNameOptions(); });
  nameDropdown.addEventListener('click', function (event) { event.stopPropagation(); });
  nameKeyword.addEventListener('input', renderNameOptions);
  document.addEventListener('click', function () { nameDropdown.classList.remove('show'); nameTrigger.classList.remove('open'); });
  document.querySelector('#supplierSearchButton').addEventListener('click', search);
  document.querySelector('#supplierResetButton').addEventListener('click', reset);
  document.querySelector('#supplierAddButton').addEventListener('click', openAdd);
  codeInput.addEventListener('keydown', function (event) { if (event.key === 'Enter') search(); });
  tableBody.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var supplier = suppliers.find(function (item) { return item.code === button.getAttribute('data-code'); });
    if (!supplier) return;
    if (button.getAttribute('data-action') === 'edit') openEdit(supplier);
    if (button.getAttribute('data-action') === 'log') openLog(supplier);
  });
  document.body.addEventListener('click', function (event) {
    var closeButton = event.target.closest('[data-modal-close]');
    if (closeButton) closeModal(closeButton.getAttribute('data-modal-close'));
    if (event.target.id === 'supplierEditSave') saveSupplier();
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { closeModal('edit'); closeModal('log'); } });

  renderNameOptions();
  renderTable();
})();
