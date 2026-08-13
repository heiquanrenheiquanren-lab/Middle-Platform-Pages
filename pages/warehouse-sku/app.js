(function () {
  'use strict';

  var rows = [
    { id: 1, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 多伦多仓', sku: 'MIG1309Lif TIG10-25', status: '已配对', pairedAt: '2026-07-16 16:36:03', length: '0.01', width: '0.01', height: '0.01', weight: '0.01', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: 'B10US000015 MIG130(美规)+TIG枪（Lift TIG）' },
    { id: 2, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 德国仓', sku: '10100200306ST', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 3, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: '10300200906', status: '已配对', pairedAt: '2026-07-16 16:36:03', length: '39', width: '16', height: '33', weight: '7.22', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '130US160012 ARC200L 焊机+LIFT TIG枪套装' },
    { id: 4, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: '10400100510ST16', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 5, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: '10400100610ST16', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 6, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: '10400102710ST16', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 7, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: '71Pcs TIGLincoln100L...', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 8, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: 'AR-MIG200ST16', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 9, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: 'BA07010003', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 10, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: 'BA07010004', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 11, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: 'BA07010005', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' },
    { id: 12, group: '自建仓 / 供应商仓', provider: '跨跃猫', related: '跨跃猫美国一件代发仓 美国仓', sku: 'BA07010006', status: '未配对', pairedAt: '', length: '0', width: '0', height: '0', weight: '0', creator: 'Admin', createdAt: '2026-07-16 16:36:03', updatedAt: '2026-07-16 16:36:03', relatedSku: '—' }
  ];
  var suppliers = ['山东八福焊割工具有限公司', '摩锐斯工业科技（上海）有限公司', '宁波市宁海县莹弘电器厂', '深圳市光为焊接技术有限公司', '任丘市昊宇焊割设备有限公司', '深圳市镭屏科技有限公司', '一拓钰包装制品（定州）有限公司', '佛山市明彩包装有限公司', '永康市精进科技有限公司', '无极县尚瑞防护用品有限公司', '台州市安安焊接设备有限公司', '河北申澳焊材有限公司', '东莞焊王焊接技术有限公司', '深圳市宏名轩电子科技有限公司', '震坤行工业超市（上海）有限公司', '临沂市美罗迪劳保用品有限公司', '上海瀚斯拓实业有限公司', '温州讯达电子科技有限公司', '佛山市三矛焊接实业有限公司', '台州瑞凌光电科技有限公司', '东莞焊王技术有限公司'];
  var filteredRows = rows.slice();
  var treeGroupOpen = true;
  var nextId = 13;
  var editingRow = null;
  var warehouseRows = [
    { id: 1, name: '盘古H097-波兰A2仓', code: 'PHG097-PLA2', country: '波兰', type: '海外仓', platform: '—', status: '启用', address: '波兰 Lubuskie Międzyrzecki Przytoczna Nowa Niedrzwica 58', owner: 'Jeremy-H097', phone: '579320685', website: '—', relation: '跨跃猫', logs: [{ type: '新增', content: '创建仓库，仓库类型为海外仓', operator: 'Admin', time: '2026-07-16 16:36:03' }] },
    { id: 2, name: '4PX-法国巴黎2仓', code: '4PX-FR', country: '法国', type: '海外仓', platform: '—', status: '启用', address: '法国 Île-de-France Seine-et-Marne Moussy-le-Neuf', owner: 'FB4-11955060', phone: '06 52 61 32 21', website: '—', relation: '4PX', logs: [] },
    { id: 3, name: 'AE平台仓波兰1仓', code: 'SMT-AEPL-GFC', country: '波兰', type: '平台仓', platform: 'AliExpress', status: '启用', address: '波兰 Lubuskie Międzyrzecki Przytoczna Nowa', owner: 'Polanin Grzegorz', phone: '48510841730', website: '—', relation: 'AliExpress', logs: [] },
    { id: 4, name: 'AE平台仓法国1仓', code: 'SMT-AEFR-GFC', country: '法国', type: '平台仓', platform: 'AliExpress', status: '启用', address: '法国 Île-de-France Seine-et-Marne Moussy-le-Neuf', owner: 'shao yan', phone: '0033698543679', website: '—', relation: 'AliExpress', logs: [] },
    { id: 5, name: 'Temu09-全托管平台仓', code: 'Temu09', country: '中国', type: '平台仓', platform: 'Shopee', status: '启用', address: '中国 Temu09国内平台仓', owner: '苏坚宇', phone: '—', website: '—', relation: 'Temu', logs: [] },
    { id: 6, name: '耗材仓-东莞2号', code: 'DG-HC02', country: '中国', type: '自营仓', platform: '—', status: '启用', address: '中国广东省东莞市清溪镇', owner: '—', phone: '—', website: '—', relation: '', logs: [] },
    { id: 7, name: '供应商仓-深圳焊材仓', code: 'SUP-SZ01', country: '中国', type: '供应商仓', platform: '—', status: '停用', address: '中国广东省深圳市宝安区', owner: '供应商仓管理员', phone: '—', website: '—', relation: '深圳市康仕达科技有限公司', logs: [{ type: '状态调整', content: '仓库状态由启用调整为停用', operator: 'Admin', time: '2026-07-20 10:12:00' }] }
  ];
  var filteredWarehouseRows = warehouseRows.slice();
  var editingWarehouse = null;
  var warehouseNameSelections = [];
  var warehouseFilterValues = { type: '', status: '', country: '', platform: '' };
  var warehouseRelationOptions = {
    '自营仓': [],
    '供应商仓': ['深圳市康仕达科技有限公司', '梧州市友盟焊接防护用品有限公司', '江苏奥信光电科技有限公司'],
    '物流商仓': ['深圳市康仕达科技有限公司', '梧州市友盟焊接防护用品有限公司', '江苏奥信光电科技有限公司'],
    '物流中转仓': ['顺丰头程服务商', '跨跃猫头程服务商', '易仓物流中转服务商'],
    '海外仓': ['跨跃猫', '4PX', '易仓海外仓'],
    '平台仓': ['AliExpress', 'Amazon', 'Shopee', 'Temu']
  };
  var warehouseStationOptions = {
    AliExpress: ['波兰站', '法国站', '西班牙站'],
    Amazon: ['美国站', '加拿大站', '英国站'],
    Shopee: ['波兰站', '法国站', '中国站'],
    Temu: ['美国站', '欧洲站', '中国站']
  };

  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  function nowText() { var date = new Date(); var pad = function (value) { return String(value).padStart(2, '0'); }; return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()); }
  function renderTree() {
    var tree = document.querySelector('#warehouseSkuTree');
    if (!tree) return;
    tree.innerHTML = '<div class="wsku-tree-node"><div class="wsku-tree-row selected" data-tree="group"><span class="wsku-tree-toggle">' + (treeGroupOpen ? '⌄' : '›') + '</span><input class="wsku-tree-checkbox" type="checkbox"><span class="wsku-tree-label">自建仓</span></div><div class="wsku-tree-children" ' + (treeGroupOpen ? '' : 'hidden') + '><div class="wsku-tree-row"><span class="wsku-tree-toggle">' + (treeGroupOpen ? '⌄' : '›') + '</span><input class="wsku-tree-checkbox" type="checkbox"><span class="wsku-tree-label">供应商仓</span></div><div class="wsku-tree-children">' + suppliers.map(function (supplier) { return '<div class="wsku-tree-child"><input class="wsku-tree-checkbox" type="checkbox"><span class="wsku-tree-label">' + escapeHtml(supplier) + '</span></div>'; }).join('') + '</div></div></div>';
  }
  function rowHtml(row) {
    var statusClass = row.status === '已配对' ? 'paired' : 'unpaired';
    var pairAction = row.status === '已配对' ? '<button class="wsku-action-link warning" data-action="unpair" data-id="' + row.id + '">取消配对</button>' : '<button class="wsku-action-link" data-action="pair" data-id="' + row.id + '">添加配对</button>';
    return '<tr><td>' + escapeHtml(row.provider) + '</td><td title="' + escapeHtml(row.related) + '">' + escapeHtml(row.related) + '</td><td>' + escapeHtml(row.sku) + '</td><td><span class="wsku-status ' + statusClass + '">' + row.status + '</span></td><td>' + escapeHtml(row.pairedAt || '') + '</td><td>' + escapeHtml(row.length) + '</td><td>' + escapeHtml(row.width) + '</td><td>' + escapeHtml(row.height) + '</td><td>' + escapeHtml(row.weight) + '</td><td>' + escapeHtml(row.creator) + '</td><td>' + escapeHtml(row.createdAt) + '</td><td>' + escapeHtml(row.updatedAt) + '</td><td title="' + escapeHtml(row.relatedSku) + '">' + escapeHtml(row.relatedSku) + '</td><td class="wsku-action-col">' + pairAction + '<button class="wsku-action-link" data-action="edit" data-id="' + row.id + '">编辑</button><button class="wsku-action-link danger" data-action="delete" data-id="' + row.id + '">删除</button></td></tr>';
  }
  function renderTable() {
    var tableBody = document.querySelector('#warehouseSkuTableBody');
    var empty = document.querySelector('#warehouseSkuEmpty');
    document.querySelector('#warehouseSkuResultCount').textContent = '共 ' + filteredRows.length + ' 条';
    empty.hidden = filteredRows.length > 0;
    tableBody.innerHTML = filteredRows.map(rowHtml).join('');
  }
  function applySearch() {
    var keyword = (document.querySelector('#warehouseSkuKeyword').value || '').trim().toLowerCase();
    var status = document.querySelector('#warehouseSkuStatus').value;
    filteredRows = rows.filter(function (row) { return (!keyword || [row.sku, row.related, row.relatedSku].join(' ').toLowerCase().indexOf(keyword) >= 0) && (!status || row.status === status); });
    renderTable();
  }
  function createModal() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<div id="warehouseSkuModal" class="wsku-modal-mask" hidden><section class="wsku-modal" role="dialog" aria-modal="true" aria-labelledby="warehouseSkuModalTitle"><header class="wsku-modal-header"><span id="warehouseSkuModalTitle">新增仓库SKU</span><button class="wsku-modal-close" type="button" data-wsku-close>×</button></header><div class="wsku-modal-body"><div class="wsku-form-grid"><div class="wsku-form-item"><label><em>*</em> 仓库分组</label><select id="wskuGroup"><option>自建仓 / 供应商仓</option></select></div><div class="wsku-form-item"><label><em>*</em> 仓库服务商</label><input id="wskuProvider" class="wsku-input" value="跨跃猫"></div><div class="wsku-form-item"><label><em>*</em> 关联仓库</label><input id="wskuRelated" class="wsku-input" placeholder="请输入关联仓库"></div><div class="wsku-form-item"><label><em>*</em> 仓库SKU</label><input id="wskuSku" class="wsku-input" placeholder="请输入仓库SKU"></div><div class="wsku-form-item"><label>包装规格（长cm）</label><input id="wskuLength" class="wsku-input" value="0"></div><div class="wsku-form-item"><label>包装规格（宽cm）</label><input id="wskuWidth" class="wsku-input" value="0"></div><div class="wsku-form-item"><label>包装规格（高cm）</label><input id="wskuHeight" class="wsku-input" value="0"></div><div class="wsku-form-item"><label>包装规格（重kg）</label><input id="wskuWeight" class="wsku-input" value="0"></div></div><div id="wskuError" class="wsku-error"></div></div><footer class="wsku-modal-footer"><button class="warehouse-sku-button" type="button" data-wsku-close>取消</button><button id="wskuSave" class="warehouse-sku-button primary" type="button">保存</button></footer></section></div>';
    document.body.appendChild(wrapper.firstElementChild);
  }
  function openModal(row) {
    editingRow = row || null;
    document.querySelector('#warehouseSkuModalTitle').textContent = row ? '编辑仓库SKU' : '新增仓库SKU';
    document.querySelector('#wskuRelated').value = row ? row.related : '';
    document.querySelector('#wskuSku').value = row ? row.sku : '';
    document.querySelector('#wskuProvider').value = row ? row.provider : '跨跃猫';
    document.querySelector('#wskuLength').value = row ? row.length : '0';
    document.querySelector('#wskuWidth').value = row ? row.width : '0';
    document.querySelector('#wskuHeight').value = row ? row.height : '0';
    document.querySelector('#wskuWeight').value = row ? row.weight : '0';
    document.querySelector('#wskuError').textContent = '';
    document.querySelector('#warehouseSkuModal').hidden = false;
    document.querySelector('#wskuSku').focus();
  }
  function closeModal() { document.querySelector('#warehouseSkuModal').hidden = true; }
  function saveRow() {
    var sku = document.querySelector('#wskuSku').value.trim();
    var related = document.querySelector('#wskuRelated').value.trim();
    var error = document.querySelector('#wskuError');
    if (!sku || !related) { error.textContent = '请填写关联仓库和仓库SKU'; return; }
    var timestamp = nowText();
    if (editingRow) { editingRow.provider = document.querySelector('#wskuProvider').value.trim() || '跨跃猫'; editingRow.related = related; editingRow.sku = sku; editingRow.length = document.querySelector('#wskuLength').value || '0'; editingRow.width = document.querySelector('#wskuWidth').value || '0'; editingRow.height = document.querySelector('#wskuHeight').value || '0'; editingRow.weight = document.querySelector('#wskuWeight').value || '0'; editingRow.updatedAt = timestamp; }
    else { rows.unshift({ id: nextId++, group: document.querySelector('#wskuGroup').value, provider: document.querySelector('#wskuProvider').value.trim() || '跨跃猫', related: related, sku: sku, status: '未配对', pairedAt: '', length: document.querySelector('#wskuLength').value || '0', width: document.querySelector('#wskuWidth').value || '0', height: document.querySelector('#wskuHeight').value || '0', weight: document.querySelector('#wskuWeight').value || '0', creator: 'Admin', createdAt: timestamp, updatedAt: timestamp, relatedSku: '—' }); }
    closeModal(); applySearch();
  }
  function handleAction(action, id) {
    var row = rows.find(function (item) { return String(item.id) === String(id); });
    if (!row) return;
    if (action === 'edit') openModal(row);
    if (action === 'pair' || action === 'unpair') { row.status = action === 'pair' ? '已配对' : '未配对'; row.pairedAt = action === 'pair' ? nowText() : ''; row.updatedAt = nowText(); renderTable(); }
    if (action === 'delete' && window.confirm('确定删除该仓库SKU吗？')) { rows = rows.filter(function (item) { return item.id !== row.id; }); applySearch(); }
  }
  function downloadRows() {
    var content = '\ufeff仓库分组,仓库服务商,关联仓库,仓库SKU,配对状态,配对时间\n' + filteredRows.map(function (row) { return [row.group, row.provider, row.related, row.sku, row.status, row.pairedAt].map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' })); link.download = '仓库SKU管理.csv'; link.click(); URL.revokeObjectURL(link.href);
  }
  function showToast(message) { var node = document.querySelector('#warehouseSkuToast'); if (!node) { node = document.createElement('div'); node.id = 'warehouseSkuToast'; node.className = 'gx-toast'; document.body.appendChild(node); } node.textContent = message; node.className = 'gx-toast gx-toast-show'; setTimeout(function () { node.className = 'gx-toast'; }, 2200); }
  function warehouseStatusTag(status) { return '<span class="warehouse-state ' + (status === '启用' ? 'enabled' : 'disabled') + '">' + escapeHtml(status) + '</span>'; }
  function renderWarehouseNameOptions() {
    var keyword = (document.querySelector('#warehouseNameKeyword').value || '').trim().toLowerCase();
    var names = warehouseRows.filter(function (row) { return row.name.toLowerCase().indexOf(keyword) >= 0; });
    document.querySelector('#warehouseNameOptions').innerHTML = names.length ? names.map(function (row) { return '<label class="warehouse-name-option"><input type="checkbox" value="' + escapeHtml(row.name) + '" ' + (warehouseNameSelections.indexOf(row.name) >= 0 ? 'checked' : '') + '><span>' + escapeHtml(row.name) + '</span></label>'; }).join('') : '<div class="warehouse-name-empty">暂无匹配仓库</div>';
    document.querySelectorAll('#warehouseNameOptions input').forEach(function (input) { input.addEventListener('change', function () { if (input.checked && warehouseNameSelections.indexOf(input.value) < 0) warehouseNameSelections.push(input.value); if (!input.checked) warehouseNameSelections = warehouseNameSelections.filter(function (name) { return name !== input.value; }); updateWarehouseNameTrigger(); }); });
  }
  function updateWarehouseNameTrigger() { document.querySelector('#warehouseNameTrigger').textContent = warehouseNameSelections.length ? '已选 ' + warehouseNameSelections.length + ' 个仓库' : '仓库名称（可多选）'; document.querySelector('#warehouseNameTrigger').classList.toggle('has-value', warehouseNameSelections.length > 0); }
  function updateWarehouseFilterTrigger(key, value, label) { warehouseFilterValues[key] = value; var defaults = { type: '仓库类型（全部）', status: '启用状态（全部）', country: '所在国家（全部）', platform: '关联平台（全部）' }; var trigger = document.querySelector('[data-filter-key="' + key + '"]'); if (trigger) { trigger.textContent = value ? label : defaults[key]; trigger.classList.toggle('has-value', Boolean(value)); } }
  function warehouseRowHtml(row, index) {
    return '<tr><td>' + (index + 1) + '</td><td class="warehouse-name-col"><span class="warehouse-name-main">' + escapeHtml(row.name) + '</span><span class="warehouse-code">' + escapeHtml(row.code) + '</span></td><td>' + escapeHtml(row.country) + '</td><td><span class="warehouse-type-tag">' + escapeHtml(row.type) + '</span></td><td>' + escapeHtml(row.platform || '—') + '</td><td>' + warehouseStatusTag(row.status) + '</td><td class="warehouse-address-col" title="' + escapeHtml(row.address) + '">' + escapeHtml(row.address) + '</td><td>' + escapeHtml(row.owner) + '<br><span class="warehouse-code">' + escapeHtml(row.phone) + '</span></td><td class="warehouse-action-col"><button class="wsku-action-link" data-warehouse-action="edit" data-id="' + row.id + '">编辑</button><button class="wsku-action-link danger" data-warehouse-action="delete" data-id="' + row.id + '">删除</button><button class="wsku-action-link" data-warehouse-action="log" data-id="' + row.id + '">日志</button></td></tr>';
  }
  function renderWarehouseTable() {
    var body = document.querySelector('#warehouseManagementTableBody');
    if (!body) return;
    document.querySelector('#warehouseManagementCount').textContent = '共 ' + filteredWarehouseRows.length + ' 条';
    document.querySelector('#warehouseManagementEmpty').hidden = filteredWarehouseRows.length > 0;
    body.innerHTML = filteredWarehouseRows.map(warehouseRowHtml).join('');
  }
  function filterWarehouses() {
    var type = warehouseFilterValues.type;
    var status = warehouseFilterValues.status;
    var country = warehouseFilterValues.country;
    var platform = warehouseFilterValues.platform;
    filteredWarehouseRows = warehouseRows.filter(function (row) {
      var nameMatched = !warehouseNameSelections.length || warehouseNameSelections.indexOf(row.name) >= 0;
      return nameMatched && (!type || row.type === type) && (!status || row.status === status) && (!country || row.country === country) && (!platform || row.platform === platform);
    });
    renderWarehouseTable();
  }
  function updateWarehouseRelationFields(type, selected) {
    var options = warehouseRelationOptions[type] || [];
    var wrap = document.querySelector('#warehouseEditRelatedWrap');
    var label = document.querySelector('#warehouseEditRelatedLabel');
    var select = document.querySelector('#warehouseEditRelation');
    var hint = document.querySelector('#warehouseEditRelationHint');
    if (!options.length) { wrap.hidden = true; label.hidden = true; select.hidden = true; hint.hidden = true; updateWarehouseStationOptions('', ''); return; }
    wrap.hidden = false;
    label.hidden = false; select.hidden = false; hint.hidden = false;
    label.textContent = type === '供应商仓' || type === '物流商仓' ? '关联供应商' : type === '平台仓' ? '关联平台' : type === '物流中转仓' ? '关联头程服务商' : '关联海外仓服务商';
    select.innerHTML = '<option value="">请选择' + label.textContent + '</option>' + options.map(function (item) { return '<option value="' + escapeHtml(item) + '">' + escapeHtml(item) + '</option>'; }).join('');
    select.value = selected || '';
    hint.textContent = '仓库类型变化后，关联对象随之切换';
    updateWarehouseStationOptions(type === '平台仓' ? selected : '', '');
  }
  function updateWarehouseStationOptions(platform, selected) {
    var select = document.querySelector('#warehouseEditStation');
    if (!select) return;
    var options = warehouseStationOptions[platform] || [];
    select.innerHTML = '<option value="">请选择站点</option>' + options.map(function (item) { return '<option value="' + escapeHtml(item) + '">' + escapeHtml(item) + '</option>'; }).join('');
    select.value = selected || '';
    select.disabled = !options.length;
  }
  function createWarehouseModal() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = '<div id="warehouseEditModal" class="wsku-modal-mask" hidden><section class="wsku-modal warehouse-management-modal" role="dialog" aria-modal="true" aria-labelledby="warehouseEditTitle"><header class="wsku-modal-header"><span id="warehouseEditTitle">新增仓库</span><button class="wsku-modal-close" type="button" data-warehouse-close>×</button></header><div class="wsku-modal-body"><div class="wsku-form-grid"><div class="wsku-form-item"><label><em>*</em> 仓库编码</label><input id="warehouseEditCode" class="wsku-input" readonly></div><div class="wsku-form-item"><label><em>*</em> 仓库名称</label><input id="warehouseEditName" class="wsku-input" placeholder="请输入仓库名称"></div><div class="wsku-form-item"><label><em>*</em> 所在国家</label><select id="warehouseEditCountry"><option value="">请选择国家</option><option>波兰</option><option>法国</option><option>中国</option><option>美国</option></select></div><div class="wsku-form-item"><label><em>*</em> 仓库类型</label><select id="warehouseEditType"><option value="">请选择仓库类型</option><option>自营仓</option><option>供应商仓</option><option>物流商仓</option><option>物流中转仓</option><option>海外仓</option><option>平台仓</option></select></div><div class="wsku-form-item warehouse-related-field" id="warehouseEditRelatedWrap"><label id="warehouseEditRelatedLabel">关联对象</label><select id="warehouseEditRelation"></select><div id="warehouseEditRelationHint" class="warehouse-related-hint"></div></div><div class="wsku-form-item"><label>仓库负责人</label><input id="warehouseEditOwner" class="wsku-input" placeholder="请输入负责人"></div><div class="wsku-form-item"><label>站点</label><select id="warehouseEditStation"><option value="">请选择站点</option></select></div><div class="wsku-form-item"><label>海外仓箱尺寸</label><select id="warehouseEditSize"><option>100*100</option><option>100*150</option></select></div><div class="wsku-form-item"><label>条码类型</label><select id="warehouseEditBarcodeType"><option>条形码</option><option>二维码</option></select></div><div class="wsku-form-item"><label>条码尺寸</label><select id="warehouseEditBarcodeSize"><option>70*30</option><option>70*50</option><option>50*30</option></select></div><div class="wsku-form-item"><label>联系电话</label><input id="warehouseEditPhone" class="wsku-input" placeholder="请输入联系电话"></div><div class="wsku-form-item full"><label>仓库地址</label><div class="warehouse-address-grid"><select id="warehouseEditAddressCountry" class="wsku-input"><option value="">请选择</option><option>波兰</option><option>法国</option><option>中国</option><option>美国</option></select><input id="warehouseEditProvince" class="wsku-input" placeholder="省/州"><input id="warehouseEditCity" class="wsku-input" placeholder="城市"><input id="warehouseEditDistrict" class="wsku-input" placeholder="区/县"><input id="warehouseEditAddress" class="wsku-input" placeholder="详细地址"></div></div><div class="wsku-form-item"><label>仓库功能</label><select id="warehouseEditFunction"><option>请选择功能</option><option>存储</option><option>中转</option><option>存储+配送</option></select></div><div class="wsku-form-item"><label>邮编</label><input id="warehouseEditPostal" class="wsku-input" placeholder="请输入邮编"></div><div class="wsku-form-item full"><label>官网链接</label><input id="warehouseEditWebsite" class="wsku-input" placeholder="请输入官网链接"></div><div class="wsku-form-item"><label><em>*</em> 仓库状态</label><select id="warehouseEditStatus"><option>启用</option><option>停用</option></select></div></div><div id="warehouseEditError" class="wsku-error"></div></div><footer class="wsku-modal-footer"><button class="warehouse-sku-button" type="button" data-warehouse-close>取消</button><button id="warehouseEditSave" class="warehouse-sku-button primary" type="button">确定</button></footer></section></div><div id="warehouseLogModal" class="wsku-modal-mask" hidden><section class="wsku-modal warehouse-management-log" role="dialog" aria-modal="true" aria-labelledby="warehouseLogTitle"><header class="wsku-modal-header"><span id="warehouseLogTitle">仓库操作日志</span><button class="wsku-modal-close" type="button" data-warehouse-log-close>×</button></header><div class="wsku-modal-body"><div id="warehouseLogSubtitle" class="warehouse-result-hint"></div><table class="warehouse-management-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody id="warehouseLogBody"></tbody></table><div id="warehouseLogEmpty" class="warehouse-management-log-empty" hidden>暂无操作日志</div></div></section></div>';
    document.body.appendChild(wrapper.firstElementChild);
    document.body.appendChild(wrapper.firstElementChild);
  }
  function openWarehouseModal(row) {
    editingWarehouse = row || null;
    document.querySelector('#warehouseEditTitle').textContent = row ? '编辑仓库' : '新增仓库';
    document.querySelector('#warehouseEditCode').value = row ? row.code : 'WH-' + String(warehouseRows.length + 1).padStart(4, '0');
    document.querySelector('#warehouseEditName').value = row ? row.name : '';
    document.querySelector('#warehouseEditCountry').value = row ? row.country : '';
    document.querySelector('#warehouseEditType').value = row ? row.type : '';
    document.querySelector('#warehouseEditOwner').value = row ? row.owner : '';
    document.querySelector('#warehouseEditPhone').value = row ? row.phone : '';
    document.querySelector('#warehouseEditAddressCountry').value = row ? row.country : '';
    document.querySelector('#warehouseEditProvince').value = row && row.addressParts ? row.addressParts.province : '';
    document.querySelector('#warehouseEditCity').value = row && row.addressParts ? row.addressParts.city : '';
    document.querySelector('#warehouseEditDistrict').value = row && row.addressParts ? row.addressParts.district : '';
    document.querySelector('#warehouseEditAddress').value = row && row.addressParts ? row.addressParts.detail : (row ? row.address : '');
    document.querySelector('#warehouseEditWebsite').value = row ? row.website : '';
    document.querySelector('#warehouseEditStatus').value = row ? row.status : '启用';
    updateWarehouseRelationFields(row ? row.type : '', row ? row.relation : '');
    updateWarehouseStationOptions(row && row.type === '平台仓' ? row.relation : '', row ? row.station : '');
    document.querySelector('#warehouseEditError').textContent = '';
    document.querySelector('#warehouseEditModal').hidden = false;
    document.querySelector('#warehouseEditName').focus();
  }
  function closeWarehouseModal() { document.querySelector('#warehouseEditModal').hidden = true; }
  function saveWarehouse() {
    var name = document.querySelector('#warehouseEditName').value.trim();
    var country = document.querySelector('#warehouseEditCountry').value;
    var type = document.querySelector('#warehouseEditType').value;
    var relation = document.querySelector('#warehouseEditRelation').value;
    var station = document.querySelector('#warehouseEditStation').value;
    var error = document.querySelector('#warehouseEditError');
    if (!name || !country || !type) { error.textContent = '请填写仓库名称、所在国家和仓库类型'; return; }
    if (warehouseRelationOptions[type] && warehouseRelationOptions[type].length && !relation) { error.textContent = '请选择' + document.querySelector('#warehouseEditRelatedLabel').textContent; return; }
    var timestamp = nowText();
    var addressParts = { province: document.querySelector('#warehouseEditProvince').value.trim(), city: document.querySelector('#warehouseEditCity').value.trim(), district: document.querySelector('#warehouseEditDistrict').value.trim(), detail: document.querySelector('#warehouseEditAddress').value.trim() };
    var address = [addressParts.province, addressParts.city, addressParts.district, addressParts.detail].filter(Boolean).join(' ') || '—';
    var form = { name: name, code: document.querySelector('#warehouseEditCode').value, country: country, type: type, platform: type === '平台仓' ? relation : '—', station: station, status: document.querySelector('#warehouseEditStatus').value, address: address, addressParts: addressParts, owner: document.querySelector('#warehouseEditOwner').value.trim() || '—', phone: document.querySelector('#warehouseEditPhone').value.trim() || '—', website: document.querySelector('#warehouseEditWebsite').value.trim() || '—', relation: relation, size: document.querySelector('#warehouseEditSize').value, barcodeType: document.querySelector('#warehouseEditBarcodeType').value, barcodeSize: document.querySelector('#warehouseEditBarcodeSize').value };
    if (editingWarehouse) { var oldType = editingWarehouse.type; editingWarehouse.name = form.name; editingWarehouse.country = form.country; editingWarehouse.type = form.type; editingWarehouse.platform = form.platform; editingWarehouse.station = form.station; editingWarehouse.status = form.status; editingWarehouse.address = form.address; editingWarehouse.addressParts = form.addressParts; editingWarehouse.owner = form.owner; editingWarehouse.phone = form.phone; editingWarehouse.website = form.website; editingWarehouse.relation = form.relation; editingWarehouse.size = form.size; editingWarehouse.barcodeType = form.barcodeType; editingWarehouse.barcodeSize = form.barcodeSize; editingWarehouse.logs.unshift({ type: oldType === form.type ? '编辑' : '类型调整', content: oldType === form.type ? '编辑仓库基础信息' : '仓库类型由' + oldType + '调整为' + form.type, operator: 'Admin', time: timestamp }); }
    else { form.id = warehouseRows.length + 1; form.logs = [{ type: '新增', content: '创建仓库，仓库类型为' + form.type, operator: 'Admin', time: timestamp }]; warehouseRows.push(form); }
    closeWarehouseModal(); filterWarehouses(); showToast('仓库保存成功');
  }
  function openWarehouseLog(row) { document.querySelector('#warehouseLogSubtitle').textContent = row.name + '（' + row.code + '）'; var body = document.querySelector('#warehouseLogBody'); var logs = row.logs || []; body.innerHTML = logs.map(function (log) { return '<tr><td>' + escapeHtml(log.type) + '</td><td>' + escapeHtml(log.content) + '</td><td>' + escapeHtml(log.operator) + '</td><td>' + escapeHtml(log.time) + '</td></tr>'; }).join(''); document.querySelector('#warehouseLogEmpty').hidden = logs.length > 0; document.querySelector('#warehouseLogModal').hidden = false; }
  function closeWarehouseLog() { document.querySelector('#warehouseLogModal').hidden = true; }
  function bind() {
    createModal(); createWarehouseModal(); renderTree(); renderTable(); renderWarehouseTable();
    document.querySelector('#warehouseSkuAddButton').addEventListener('click', function () { openModal(); });
    document.querySelector('#warehouseSkuSearchButton').addEventListener('click', applySearch);
    document.querySelector('#warehouseSkuResetButton').addEventListener('click', function () { document.querySelector('#warehouseSkuKeyword').value = ''; document.querySelector('#warehouseSkuStatus').value = ''; applySearch(); });
    document.querySelector('#warehouseSkuKeyword').addEventListener('keydown', function (event) { if (event.key === 'Enter') applySearch(); });
    document.querySelector('#warehouseSkuTableBody').addEventListener('click', function (event) { var button = event.target.closest('[data-action]'); if (button) handleAction(button.getAttribute('data-action'), button.getAttribute('data-id')); });
    document.querySelector('#warehouseSkuTree').addEventListener('click', function (event) { if (event.target.closest('[data-tree="group"]')) { treeGroupOpen = !treeGroupOpen; renderTree(); } });
    document.querySelector('#warehouseSkuModal').addEventListener('click', function (event) { if (event.target === event.currentTarget || event.target.closest('[data-wsku-close]')) closeModal(); if (event.target.id === 'wskuSave') saveRow(); });
    document.querySelectorAll('[data-warehouse-tab]').forEach(function (tab) { tab.addEventListener('click', function () { document.querySelectorAll('[data-warehouse-tab]').forEach(function (item) { item.classList.toggle('active', item === tab); }); var isSku = tab.getAttribute('data-warehouse-tab') === 'sku'; document.querySelector('#warehouseSkuTablePanel').hidden = !isSku; document.querySelector('#warehouseSkuSearchPanel').hidden = true; document.querySelector('#warehouseSkuWarehousePanel').hidden = isSku; document.querySelector('.warehouse-sku-toolbar').style.display = isSku ? 'flex' : 'none'; document.querySelector('#warehouseSkuAddButton').textContent = isSku ? '新增仓库SKU' : '新增仓库'; }); });
    document.querySelectorAll('[data-tool]').forEach(function (tool) { tool.addEventListener('click', function () { var type = tool.getAttribute('data-tool'); if (type === 'search' || type === 'filter') { var panel = document.querySelector('#warehouseSkuSearchPanel'); panel.hidden = !panel.hidden; } else if (type === 'refresh') { applySearch(); showToast('列表已刷新'); } else if (type === 'download') downloadRows(); else if (type === 'upload') showToast('导入功能待接入文件上传'); else if (type === 'settings') showToast('列设置功能待补充'); }); });
    document.querySelector('#warehouseSkuPrev').addEventListener('click', function () { showToast('已是第 1 页'); });
    document.querySelector('#warehouseSkuNext').addEventListener('click', function () { showToast('当前为原型演示分页'); });
    document.querySelector('#warehouseAddButton').addEventListener('click', function () { openWarehouseModal(); });
    document.querySelector('#warehouseSearchButton').addEventListener('click', filterWarehouses);
    document.querySelector('#warehouseResetButton').addEventListener('click', function () { warehouseNameSelections = []; updateWarehouseNameTrigger(); document.querySelector('#warehouseNameKeyword').value = ''; ['type', 'status', 'country', 'platform'].forEach(function (key) { updateWarehouseFilterTrigger(key, '', ''); }); document.querySelectorAll('[data-filter-select]').forEach(function (item) { item.classList.remove('selected'); }); filterWarehouses(); });
    document.querySelector('#warehouseNameKeyword').addEventListener('keydown', function (event) { if (event.key === 'Enter') filterWarehouses(); });
    document.querySelector('#warehouseNameTrigger').addEventListener('click', function (event) { event.stopPropagation(); var wrapper = this.closest('.warehouse-filter-select'); document.querySelectorAll('.warehouse-filter-select.is-open').forEach(function (item) { if (item !== wrapper) item.classList.remove('is-open'); }); wrapper.classList.toggle('is-open'); renderWarehouseNameOptions(); });
    document.querySelector('#warehouseNameDropdown').addEventListener('click', function (event) { event.stopPropagation(); });
    document.querySelector('#warehouseNameKeyword').addEventListener('input', renderWarehouseNameOptions);
    document.querySelectorAll('.warehouse-filter-trigger[data-filter-key]').forEach(function (trigger) { trigger.addEventListener('click', function (event) { event.stopPropagation(); var wrapper = this.closest('.warehouse-filter-select'); document.querySelectorAll('.warehouse-filter-select.is-open').forEach(function (item) { if (item !== wrapper) item.classList.remove('is-open'); }); wrapper.classList.toggle('is-open'); }); });
    document.querySelectorAll('[data-filter-select]').forEach(function (option) { option.addEventListener('click', function () { var key = this.getAttribute('data-filter-select'); var value = this.getAttribute('data-filter-value') || ''; var label = this.textContent.trim(); updateWarehouseFilterTrigger(key, value, label); this.parentElement.querySelectorAll('[data-filter-select]').forEach(function (item) { item.classList.toggle('selected', item === option); }); this.closest('.warehouse-filter-select').classList.remove('is-open'); }); });
    document.addEventListener('click', function () { document.querySelectorAll('.warehouse-filter-select.is-open').forEach(function (item) { item.classList.remove('is-open'); }); });
    document.querySelector('#warehouseManagementTableBody').addEventListener('click', function (event) { var button = event.target.closest('[data-warehouse-action]'); if (!button) return; var row = warehouseRows.find(function (item) { return String(item.id) === button.getAttribute('data-id'); }); if (!row) return; var action = button.getAttribute('data-warehouse-action'); if (action === 'edit') openWarehouseModal(row); if (action === 'log') openWarehouseLog(row); if (action === 'delete' && window.confirm('确定删除该仓库吗？')) { warehouseRows = warehouseRows.filter(function (item) { return item.id !== row.id; }); filterWarehouses(); showToast('仓库已删除'); } });
    document.querySelector('#warehouseEditType').addEventListener('change', function () { updateWarehouseRelationFields(this.value, ''); });
    document.querySelector('#warehouseEditRelation').addEventListener('change', function () { var type = document.querySelector('#warehouseEditType').value; if (type === '平台仓') updateWarehouseStationOptions(this.value, ''); });
    document.querySelector('#warehouseEditCountry').addEventListener('change', function () { document.querySelector('#warehouseEditAddressCountry').value = this.value; });
    document.querySelector('#warehouseEditAddressCountry').addEventListener('change', function () { document.querySelector('#warehouseEditCountry').value = this.value; });
    document.querySelector('#warehouseEditModal').addEventListener('click', function (event) { if (event.target === event.currentTarget || event.target.closest('[data-warehouse-close]')) closeWarehouseModal(); if (event.target.id === 'warehouseEditSave') saveWarehouse(); });
    document.querySelector('#warehouseLogModal').addEventListener('click', function (event) { if (event.target === event.currentTarget || event.target.closest('[data-warehouse-log-close]')) closeWarehouseLog(); });
    document.querySelector('#warehouseManagementPrev').addEventListener('click', function () { showToast('已是第 1 页'); });
    document.querySelector('#warehouseManagementNext').addEventListener('click', function () { showToast('当前为原型演示分页'); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { closeModal(); closeWarehouseModal(); closeWarehouseLog(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
