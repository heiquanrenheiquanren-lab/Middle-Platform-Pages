/* 采购单列配置：只维护列的显示状态与顺序，不涉及业务数据。 */
window.PurchaseOrderColumnConfig = (function () {
  const defs = {
    parent: [
      { key: 'po', label: '采购单号', group: '基础信息', locked: true, width: 270, className: 'col-po' },
      { key: 'supplier', label: '供应商信息', group: '基础信息', width: 210, className: 'col-supplier' },
      { key: 'amount', label: '采购单金额', group: '金额信息', width: 190, className: 'col-amount' },
      { key: 'composition', label: '金额构成', group: '金额信息', width: 190, className: 'col-composition' },
      { key: 'inbound', label: '入库信息', group: '履约信息', width: 235, className: 'col-inbound' },
      { key: 'logistics', label: '物流信息', group: '履约信息', width: 210, className: 'col-logistics' },
      { key: 'remark', label: '备注信息', group: '其他信息', width: 190, className: 'col-remark' },
      { key: 'creator', label: '创建信息', group: '其他信息', width: 170, className: 'col-creator' },
      { key: 'action', label: '操作', group: '其他信息', locked: true, width: 150, className: 'col-action' }
    ],
    child: [
      { key: 'sku', label: 'SKU', group: '基础信息', locked: true, width: 230, className: 'detail-sku' },
      { key: 'planNo', label: '采购计划', group: '基础信息', width: 145, className: 'detail-plan' },
      { key: 'name', label: '品名', group: '基础信息', width: 200, className: 'detail-name' },
      { key: 'purchaseQty', label: '采购数', group: '采购数量', width: 100 },
      { key: 'receiveQty', label: '收货数量', group: '采购数量', width: 100 },
      { key: 'transitQty', label: '在途数', group: '采购数量', width: 100 },
      { key: 'unitPrice', label: '采购单价', group: '采购金额', width: 100 },
      { key: 'lastPurchasePrice', label: '上次采购价', group: '采购金额', width: 110 },
      { key: 'skuAmount', label: 'SKU金额', group: '采购金额', width: 100 },
      { key: 'team', label: '团队', group: '销售属性', width: 110 },
      { key: 'platform', label: '平台', group: '销售属性', width: 120 },
      { key: 'store', label: '店铺', group: '销售属性', width: 120 },
      { key: 'lingxingSku', label: '领星SKU', group: '编码信息', width: 120 },
      { key: 'sellerSku', label: 'Seller SKU', group: '编码信息', width: 120 },
      { key: 'fnsku', label: 'FNSKU', group: '编码信息', width: 100 },
      { key: 'supplierItemNo', label: '供应商料号', group: '供应信息', width: 145 },
      { key: 'minOrderQty', label: '最小起订量', group: '供应信息', width: 90 },
      { key: 'grossWeight', label: '包装规格（kg）毛重', group: '供应信息', width: 90 },
      { key: 'boxes', label: '箱数', group: '供应信息', width: 145 },
      { key: 'leadTime', label: '交期(天)', group: '供应信息', width: 90 },
      { key: 'remark', label: '备注', group: '其他信息', width: 160 }
    ]
  };
  const defaults = { parent: defs.parent.map(item => item.key), child: defs.child.map(item => item.key) };
  const storageKey = 'purchase-order-column-config-v2';
  /* 列结构版本：新增「上次采购价」后，历史缓存需要按默认位置补入一次该列 */
  const schemaVersion = 2;

  const normalize = (tab, keys) => {
    const available = defs[tab].map(item => item.key);
    let valid = Array.isArray(keys) ? keys.filter((key, index) => available.includes(key) && keys.indexOf(key) === index) : [...available];
    defs[tab].forEach(item => { if (item.locked && !valid.includes(item.key)) valid.push(item.key); });
    if (tab === 'parent') {
      valid = ['po', ...valid.filter(key => key !== 'po' && key !== 'action'), 'action'];
    }
    if (tab === 'child') {
      // SKU 是二级表唯一固定列，必须始终位于第一列；兼容历史缓存中采购计划排在首位的顺序。
      valid = ['sku', ...valid.filter(key => key !== 'sku')];
    }
    return valid;
  };

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch {}
  /* 历史缓存不含「上次采购价」时，仅迁移一次：插到「采购单价」之后，保持既有列顺序不变 */
  const migrateSaved = (tab, keys) => {
    if (!Array.isArray(keys) || (saved.schema || 1) >= schemaVersion) return keys;
    if (tab !== 'child' || keys.includes('lastPurchasePrice')) return keys;
    const index = keys.indexOf('unitPrice');
    return index >= 0 ? [...keys.slice(0, index + 1), 'lastPurchasePrice', ...keys.slice(index + 1)] : [...keys, 'lastPurchasePrice'];
  };
  const applied = { parent: normalize('parent', migrateSaved('parent', saved.parent)), child: normalize('child', migrateSaved('child', saved.child)) };
  const draft = { parent: [], child: [] };
  let activeTab = 'parent';
  let searchKeyword = '';
  let dialog = null;
  let draggedKey = '';
  let changeHandler = () => {};

  const columnDef = (tab, key) => defs[tab].find(item => item.key === key);
  const columnsOf = tab => applied[tab].map(key => columnDef(tab, key)).filter(Boolean);
  const draftDefs = () => draft[activeTab].map(key => columnDef(activeTab, key)).filter(Boolean);
  const filteredColumns = () => {
    const query = searchKeyword.trim().toLowerCase();
    return defs[activeTab].filter(item => item.label.toLowerCase().includes(query));
  };

  const render = () => {
    if (!dialog) return;
    dialog.querySelectorAll('[data-column-tab]').forEach(button => {
      button.classList.toggle('active', button.dataset.columnTab === activeTab);
    });
    dialog.querySelector('[data-column-search]').value = searchKeyword;
    const columns = filteredColumns();
    dialog.querySelector('[data-column-groups]').innerHTML = columns.length
      ? `<div class="purchase-column-checks purchase-column-flat">${columns.map(item => `<label class="${item.locked ? 'locked' : ''}"><input type="checkbox" data-column-key="${item.key}" ${draft[activeTab].includes(item.key) ? 'checked' : ''} ${item.locked ? 'disabled' : ''}><span>${item.label}</span></label>`).join('')}</div>`
      : '<div class="purchase-column-none">没有匹配的字段</div>';
    const selected = draftDefs();
    dialog.querySelector('[data-column-count]').textContent = `(${selected.length})`;
    dialog.querySelector('[data-column-selected]').innerHTML = selected.map((item, index) => `<div class="purchase-column-selected-item ${item.locked ? 'locked' : ''}" draggable="${item.locked ? 'false' : 'true'}" data-column-item="${item.key}"><span class="purchase-column-grip">${item.locked ? '·' : '⋮⋮'}</span><span class="purchase-column-order">${index + 1}</span><span>${item.label}</span></div>`).join('');
  };

  const open = () => {
    draft.parent = [...applied.parent];
    draft.child = [...applied.child];
    activeTab = 'parent';
    searchKeyword = '';
    if (!dialog) create();
    render();
    dialog.hidden = false;
  };
  const close = () => { if (dialog) dialog.hidden = true; };

  const toggleColumn = (key, checked) => {
    const item = columnDef(activeTab, key);
    if (!item || item.locked) return;
    const list = draft[activeTab];
    if (checked && !list.includes(key)) list.push(key);
    if (!checked) draft[activeTab] = list.filter(value => value !== key);
    render();
  };
  const restoreDefaults = () => {
    draft.parent = [...defaults.parent];
    draft.child = [...defaults.child];
    render();
  };
  const apply = () => {
    applied.parent = normalize('parent', draft.parent);
    applied.child = normalize('child', draft.child);
    try { localStorage.setItem(storageKey, JSON.stringify({ parent: applied.parent, child: applied.child, schema: schemaVersion })); } catch {}
    close();
    changeHandler();
    if (typeof window.toast === 'function') window.toast('列配置已应用');
  };

  const create = () => {
    dialog = document.createElement('div');
    dialog.className = 'purchase-column-mask';
    dialog.hidden = true;
    dialog.innerHTML = `<aside class="purchase-column-drawer" role="dialog" aria-label="列配置"><div class="purchase-column-config"><header class="purchase-column-header"><div class="purchase-column-title">列配置</div><div class="purchase-column-tabs"><button type="button" data-column-tab="parent">一级列表</button><button type="button" data-column-tab="child">二级列表</button></div></header><div class="purchase-column-content"><div class="purchase-column-options"><input class="purchase-column-search" data-column-search placeholder="搜索字段" aria-label="搜索字段"><div data-column-groups></div></div><div class="purchase-column-selected"><div class="purchase-column-selected-title">已选 <span data-column-count>(0)</span></div><p>拖动可调整非固定列顺序</p><div class="purchase-column-selected-list" data-column-selected></div></div></div><footer class="purchase-column-footer"><button class="btn" type="button" data-column-action="restore">恢复默认</button><div><button class="btn" type="button" data-column-action="cancel">取消</button><button class="btn primary" type="button" data-column-action="apply">保存并应用</button></div></footer></div></aside>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click', event => {
      if (event.target === dialog) close();
      const tabButton = event.target.closest('[data-column-tab]');
      if (tabButton) { activeTab = tabButton.dataset.columnTab; searchKeyword = ''; render(); return; }
      const actionButton = event.target.closest('[data-column-action]');
      if (actionButton) {
        const action = actionButton.dataset.columnAction;
        if (action === 'restore') restoreDefaults();
        else if (action === 'cancel') close();
        else if (action === 'apply') apply();
      }
    });
    dialog.addEventListener('change', event => {
      const input = event.target.closest('[data-column-key]');
      if (input) toggleColumn(input.dataset.columnKey, input.checked);
    });
    dialog.querySelector('[data-column-search]').addEventListener('input', event => { searchKeyword = event.target.value; render(); });
    const list = dialog.querySelector('[data-column-selected]');
    list.addEventListener('dragstart', event => {
      const item = event.target.closest('[data-column-item]');
      if (!item || item.classList.contains('locked')) { event.preventDefault(); return; }
      draggedKey = item.dataset.columnItem;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedKey);
    });
    list.addEventListener('dragover', event => event.preventDefault());
    list.addEventListener('drop', event => {
      event.preventDefault();
      const target = event.target.closest('[data-column-item]');
      const source = draggedKey || event.dataTransfer.getData('text/plain');
      draggedKey = '';
      if (!target || !source || source === target.dataset.columnItem) return;
      if (columnDef(activeTab, target.dataset.columnItem)?.locked) return;
      const order = draft[activeTab];
      if (!order.includes(source) || !order.includes(target.dataset.columnItem)) return;
      const next = order.filter(key => key !== source);
      next.splice(next.indexOf(target.dataset.columnItem), 0, source);
      draft[activeTab] = next;
      render();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.hidden) close(); });
  };

  return {
    open,
    columns: columnsOf,
    width: tab => columnsOf(tab).reduce((sum, item) => sum + item.width, 0),
    onChange: handler => { changeHandler = handler; }
  };
})();
