/* 发货计划 V2：严格对齐测试环境（68 列表格、18 项查询、状态 Tab、操作按钮、行内编辑与新建弹窗） */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const STATUS_META = {
    pending_confirm: { label: '待确认' },
    pending_ship: { label: '待发货' },
    completed: { label: '已完成' },
    void: { label: '已作废' }
  };

  const OPTIONS = {
    pickupWarehouses: ['深圳坂田总仓', '东莞清溪仓', '义乌集货仓', '坪山石井本地仓', '跨跃猫物流仓'],
    shipWarehouses: ['跨跃猫物流仓', '深圳坂田总仓', '东莞清溪仓', '义乌集货仓', '坪山石井本地仓'],
    destWarehouses: ['跨跃猫美西一件代发仓 纽约仓', 'ONT8-美西FBA仓', 'LGB8-美西FBA仓', 'DE-法兰克福海外仓', 'UK-曼彻斯特海外仓', '坪山石井本地仓'],
    providers: ['跨越猫头程', '森鸿物流', '美森快船专送', 'UPS官方物流', 'DHL国际快递', '中远海运头程'],
    planOwners: ['Admin', '毛粤风', '王方圆', '陈晓', '林思雨', '李明'],
    shipMethods: ['海外仓备货', 'FBA直发', '本地仓直发', '海外仓转运'],
    transportModes: ['海运', '空运', '快递', '卡航', '铁路'],
    platforms: ['亚马逊', '沃尔玛', 'Ozon', 'Shopify', 'TikTok'],
    countries: ['US', 'DE', 'UK', 'CA', 'JP', 'RU'],
    stores: ['ARCCAPTAIN_US', 'ARCCAPTAIN_DE', 'ARCCAPTAIN_UK', 'WEM_Walmart_US', 'Ozon_Direct', 'B端独立站'],
    teams: ['刘绎天', '亚马逊团队', 'Jasic团队', '欧洲运营组', '北美大件组'],
    creators: ['Admin', '毛粤风', '王方圆', '陈晓', '系统']
  };

  /* 列表列定义（支持列配置显隐与非固定列拖拽排序） */
  const COLUMNS = [
    { key: '_check', label: '', fixed: 'left-0', system: true },
    { key: 'sku', label: 'SKU', fixed: 'left-1', locked: true },
    { key: 'lingxingSku', label: '领星SKU', fixed: 'left-2', locked: true },
    { key: 'planNo', label: '计划号', fixed: 'left-3', locked: true },
    { key: 'productName', label: '品名' },
    { key: 'fnsku', label: 'FNSKU' },
    { key: 'team', label: '团队' },
    { key: 'platform', label: '平台' },
    { key: 'store', label: '店铺' },
    { key: 'country', label: '国家' },
    { key: 'planShipQty', label: '计划发货数量', editable: 'number' },
    { key: 'teamOwner', label: '团队负责人' },
    { key: 'opsOwner', label: '运营负责人' },
    { key: 'fbaShipmentNo', label: 'FBA 货件号' },
    { key: 'fbaRefId', label: 'FBA 货件名称' },
    { key: 'remark', label: '备注', editable: 'text' },
    { key: 'pickupWarehouse', label: '提货仓' },
    { key: 'shippingOrderNo', label: '发货单号' },
    { key: 'shipWarehouse', label: '发货仓', editable: 'select', options: 'shipWarehouses' },
    { key: 'destWarehouse', label: '目的地仓', editable: 'select', options: 'destWarehouses' },
    { key: 'shipMethod', label: '发货方式', editable: 'select', options: 'shipMethods' },
    { key: 'provider', label: '头程服务商' },
    { key: 'transportMode', label: '运输方式' },
    { key: 'channel', label: '物流渠道' },
    { key: 'cartons', label: '箱数' },
    { key: 'volume', label: '体积(m³)' },
    { key: 'volWeight', label: '体积重(kg)' },
    { key: 'estDays', label: '预计物流时效(天)', editable: 'number' },
    { key: 'estShipDate', label: '预计发货日期', editable: 'date' },
    { key: 'estArrivalDate', label: '预计到货日期', editable: 'date' },
    { key: 'totalGrossWeight', label: '总毛重(kg)' },
    { key: 'totalVolume', label: '总体积(m³)' },
    { key: 'totalVolWeight', label: '总体积重(kg)' },
    { key: 'planDiff', label: '计划差额' },
    { key: 'createdAt', label: '创建时间' },
    { key: 'updatedAt', label: '修改时间' },
    { key: 'creator', label: '创建人' },
    { key: 'boxSpec', label: '箱规' },
    { key: 'boxWeight', label: '箱规重量(kg)' },
    { key: 'boxQty', label: '箱规数量' },
    { key: 'planDeliveryDate', label: '计划交货日期' },
    { key: 'expectedDeliveryDate', label: '期望交货日期' },
    { key: 'planOwner', label: '计划负责人' },
    { key: '_action', label: '操作', fixed: 'right', system: true }
  ];

  const COL_DEFS = COLUMNS.filter(c => !c.system);
  const DEFAULT_COL_KEYS = COL_DEFS.map(c => c.key);
  const COL_STORAGE_KEY = 'shipment-plan-v2-column-config';
  const COL_CONFIG_VERSION = 4;

  function normalizeColKeys(keys, mergeMissing) {
    const available = DEFAULT_COL_KEYS;
    const valid = Array.isArray(keys)
      ? keys.filter((key, idx) => available.includes(key) && keys.indexOf(key) === idx)
      : [...available];
    if (Array.isArray(keys) && mergeMissing) {
      DEFAULT_COL_KEYS.forEach(key => {
        if (valid.includes(key)) return;
        const prev = [...DEFAULT_COL_KEYS.slice(0, DEFAULT_COL_KEYS.indexOf(key))].reverse().find(k => valid.includes(k));
        if (prev) valid.splice(valid.indexOf(prev) + 1, 0, key);
        else valid.unshift(key);
      });
    }
    const locked = COL_DEFS.filter(c => c.locked).map(c => c.key);
    return [...locked, ...valid.filter(k => !locked.includes(k))];
  }

  function loadSavedColKeys() {
    try {
      const saved = JSON.parse(localStorage.getItem(COL_STORAGE_KEY) || '{}');
      if ((Number(saved.version) || 0) < COL_CONFIG_VERSION) {
        return [...DEFAULT_COL_KEYS];
      }
      return normalizeColKeys(saved.keys, false);
    } catch {
      return [...DEFAULT_COL_KEYS];
    }
  }

  const rows = [
    {
      id: 1, sku: 'DD123456', thumbColor: '#2563eb', thumbText: 'DD', linked: true,
      planNo: 'YMX20261106-1', lingxingSku: 'DD123456', productName: '测试-DD123456', model: '型号-DD123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: '-', sellerSku: 'SL-DD123456', asin: 'B0DD123456',
      store: 'ARCCAPTAIN_US', platform: '亚马逊', country: 'US', team: '刘绎天', teamOwner: '刘绎天', opsOwner: '毛粤风',
      planOwner: '毛粤风', pickupWarehouse: [{ warehouse: '坪山石井本地仓', qty: 16 }, { warehouse: '深圳坂田总仓', qty: 10 }], shipWarehouse: '跨跃猫物流仓',
      destWarehouse: '跨跃猫美西一件代发仓 纽约仓', destType: '海外仓', shipMethod: '海外仓备货',
      provider: '跨越猫头程', providerSub: 'KYM-US', channel: '美森限时达', boxNo: 'BOX-001',
      transportMode: '海运', estDays: 18, estShipDate: '2026-11-08', estArrivalDate: '2026-11-26',
      planShipQty: 26, remark: '旺季海外仓补货', estUnitPrice: 12.5,
      boxSpec: '1716.00*1716.00*1716.00', boxWeight: 18.5, boxQty: 13, supplierCode: 'SUP-DD-01',
      planPurchaseQty: 30, planDeliveryDate: '2026-11-05', demandGap: 26, suggestedOrderQty: 30, expectedDeliveryDate: '2026-11-25',
      platformInStock: 120, platformInTransit: 40, overseasInStock: 85, overseasPendingShip: 10, overseasInTransit: 20,
      localInStock: 60, localPendingShip: 5, poTotal: 30, poInTransit: 10, supplierInStock: 15, supplierInProd: 20,
      purchaseNo: 'PO2226110630006', shippingOrderNo: 'DN20260808001', fbaShipmentNo: 'FBA18XYZ001', fbaRefId: 'REF-88210',
      status: 'pending_ship', createdAt: '2026-11-06 15:56:18', updatedAt: '2026-11-06 16:12:05', creator: 'Admin'
    },
    {
      id: 2, sku: 'KK123456', thumbColor: '#7c3aed', thumbText: 'KK', linked: false,
      planNo: 'QTT20261106-1', lingxingSku: 'KK123456', productName: '测试-KK123456', model: '型号-KK123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: 'X003KK1234', sellerSku: 'SL-KK123456', asin: 'B0KK123456',
      store: 'WEM_Walmart_US', platform: '沃尔玛', country: 'US', team: '亚马逊团队', teamOwner: '王方圆', opsOwner: '王方圆',
      planOwner: 'Admin', pickupWarehouse: '深圳坂田总仓', shipWarehouse: '深圳坂田总仓',
      destWarehouse: 'ONT8-美西FBA仓', destType: '平台仓', shipMethod: 'FBA直发',
      provider: '美森快船专送', providerSub: 'MATSON-01', channel: '美森正班船', boxNo: 'BOX-002',
      transportMode: '海运', estDays: 16, estShipDate: '2026-11-10', estArrivalDate: '2026-11-26',
      planShipQty: 40, remark: '沃尔玛常规补货', estUnitPrice: 11.0,
      boxSpec: '60.00*45.00*40.00', boxWeight: 14.2, boxQty: 10, supplierCode: 'SUP-KK-02',
      planPurchaseQty: 40, planDeliveryDate: '2026-11-07', demandGap: 40, suggestedOrderQty: 40, expectedDeliveryDate: '2026-11-26',
      platformInStock: 90, platformInTransit: 20, overseasInStock: 30, overseasPendingShip: 0, overseasInTransit: 15,
      localInStock: 100, localPendingShip: 12, poTotal: 40, poInTransit: 0, supplierInStock: 30, supplierInProd: 0,
      purchaseNo: 'PO2226110630009', shippingOrderNo: '', fbaShipmentNo: 'FBA18XYZ002', fbaRefId: 'REF-88211',
      status: 'pending_confirm', createdAt: '2026-11-06 14:20:00', updatedAt: '2026-11-06 14:20:00', creator: '王方圆'
    },
    {
      id: 3, sku: 'FF123456', thumbColor: '#ea580c', thumbText: 'FF', linked: false,
      planNo: 'WEM20261104-3', lingxingSku: 'FF123456', productName: '测试-FF123456', model: '型号-FF123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: 'X003FF1234', sellerSku: 'SL-FF123456', asin: 'B0FF123456',
      store: 'ARCCAPTAIN_DE', platform: '亚马逊', country: 'DE', team: '欧洲运营组', teamOwner: '陈晓', opsOwner: '林思雨',
      planOwner: '陈晓', pickupWarehouse: '东莞清溪仓', shipWarehouse: '东莞清溪仓',
      destWarehouse: 'DE-法兰克福海外仓', destType: '海外仓', shipMethod: '海外仓备货',
      provider: '森鸿物流', providerSub: 'SH-EU', channel: '欧洲空派专线', boxNo: 'BOX-003',
      transportMode: '空运', estDays: 9, estShipDate: '2026-11-05', estArrivalDate: '2026-11-14',
      planShipQty: 60, remark: '德国仓急单补货', estUnitPrice: 28.5,
      boxSpec: '55.00*42.00*38.00', boxWeight: 16.0, boxQty: 12, supplierCode: 'SUP-FF-03',
      planPurchaseQty: 60, planDeliveryDate: '2026-11-04', demandGap: 55, suggestedOrderQty: 60, expectedDeliveryDate: '2026-11-15',
      platformInStock: 45, platformInTransit: 10, overseasInStock: 22, overseasPendingShip: 4, overseasInTransit: 30,
      localInStock: 80, localPendingShip: 10, poTotal: 60, poInTransit: 20, supplierInStock: 10, supplierInProd: 25,
      purchaseNo: 'PO2226110430012', shippingOrderNo: 'DN20260808002', fbaShipmentNo: 'FBA18XYZ003', fbaRefId: 'REF-88219',
      status: 'completed', createdAt: '2026-11-04 11:12:30', updatedAt: '2026-11-05 18:45:10', creator: '陈晓'
    },
    {
      id: 4, sku: 'EE123456', thumbColor: '#16a34a', thumbText: 'EE', linked: false,
      planNo: 'WEM20261104-2', lingxingSku: 'EE123456', productName: '测试-EE123456', model: '型号-EE123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: '-', sellerSku: 'SL-EE123456', asin: 'B0EE123456',
      store: 'Ozon_Direct', platform: 'Ozon', country: 'RU', team: 'Jasic团队', teamOwner: '李明', opsOwner: '李明',
      planOwner: '李明', pickupWarehouse: '义乌集货仓', shipWarehouse: '义乌集货仓',
      destWarehouse: 'UK-曼彻斯特海外仓', destType: '海外仓', shipMethod: '海外仓转运',
      provider: 'UPS官方物流', providerSub: 'UPS-EXP', channel: 'UPS红单快递', boxNo: 'BOX-004',
      transportMode: '快递', estDays: 7, estShipDate: '2026-11-05', estArrivalDate: '2026-11-12',
      planShipQty: 24, remark: '测试计划，已作废', estUnitPrice: 36.0,
      boxSpec: '50.00*40.00*35.00', boxWeight: 12.0, boxQty: 8, supplierCode: 'SUP-EE-04',
      planPurchaseQty: 24, planDeliveryDate: '2026-11-03', demandGap: 24, suggestedOrderQty: 24, expectedDeliveryDate: '2026-11-12',
      platformInStock: 18, platformInTransit: 0, overseasInStock: 12, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 40, localPendingShip: 0, poTotal: 24, poInTransit: 0, supplierInStock: 8, supplierInProd: 0,
      purchaseNo: 'PO2226110430015', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '',
      status: 'void', createdAt: '2026-11-04 09:30:15', updatedAt: '2026-11-04 10:05:22', creator: 'Admin'
    },
    {
      id: 5, sku: 'TEST-LINK-INV-BATCH-OK', thumbColor: '', thumbText: '无图', linked: false,
      planNo: 'YMX20261104-8', lingxingSku: 'TEST-BATCH-OK', productName: '-', model: '-',
      cat1: '通用', cat2: '通用', saleType: '0', fnsku: '-', sellerSku: '-', asin: '-',
      store: 'ARCCAPTAIN_US', platform: '亚马逊', country: 'US', team: '亚马逊团队', teamOwner: '王方圆', opsOwner: 'Admin',
      planOwner: 'Admin', pickupWarehouse: '900609', shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'LGB8-美西FBA仓', destType: '平台仓', shipMethod: 'FBA直发',
      provider: '跨越猫头程', providerSub: 'KYM-US', channel: '海运卡派', boxNo: '',
      transportMode: '卡航', estDays: 20, estShipDate: '2026-11-12', estArrivalDate: '2026-12-02',
      planShipQty: 2, remark: '', estUnitPrice: 10.0,
      boxSpec: '40.00*30.00*30.00', boxWeight: 8.0, boxQty: 2, supplierCode: 'SUP-TEST-05',
      planPurchaseQty: 0, planDeliveryDate: '2026-11-10', demandGap: 2, suggestedOrderQty: 2, expectedDeliveryDate: '2026-12-02',
      platformInStock: 0, platformInTransit: 0, overseasInStock: 0, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 10, localPendingShip: 0, poTotal: 0, poInTransit: 0, supplierInStock: 0, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: 'DN20260808003', fbaShipmentNo: '', fbaRefId: '',
      status: 'pending_ship', createdAt: '2026-11-04 08:15:00', updatedAt: '2026-11-04 08:15:00', creator: 'Admin'
    }
  ];

  const logsByPlan = new Map();
  rows.forEach(r => {
    logsByPlan.set(r.id, [
      { type: '创建', content: `创建发货计划 ${r.planNo}（SKU：${r.sku}，数量：${r.planShipQty}）`, operator: r.creator, time: r.createdAt }
    ]);
  });

  const state = {
    statusTab: 'all',
    filtered: [...rows],
    selected: new Set(),
    colKeys: loadSavedColKeys(),
    colDraftKeys: [],
    colSearch: '',
    page: 1,
    pageSize: 25,
    createSkus: []
  };

  function deriveLogisticsInfo(shipWarehouse, destWarehouse, shipMethod) {
    if (String(destWarehouse || '').includes('DE-') || String(shipWarehouse || '').includes('东莞')) {
      return { provider: '森鸿物流', providerSub: 'SH-EU', channel: '欧洲空派专线', transportMode: '空运' };
    }
    if (String(destWarehouse || '').includes('UK-') || String(shipWarehouse || '').includes('义乌')) {
      return { provider: 'UPS官方物流', providerSub: 'UPS-EXP', channel: 'UPS红单快递', transportMode: '快递' };
    }
    if (shipMethod === 'FBA直发' || String(destWarehouse || '').includes('FBA')) {
      return { provider: '美森快船专送', providerSub: 'MATSON-01', channel: '美森正班船', transportMode: '海运' };
    }
    if (shipMethod === '本地仓直发') {
      return { provider: '跨越猫头程', providerSub: 'KYM-LOCAL', channel: '本地卡派专线', transportMode: '卡航' };
    }
    return { provider: '跨越猫头程', providerSub: 'KYM-US', channel: '美森限时达', transportMode: '海运' };
  }

  function calcDerived(r) {
    const qty = Number(r.planShipQty) || 0;
    const boxQty = Number(r.boxQty) || 1;
    const cartons = Math.ceil(qty / boxQty);
    const parts = String(r.boxSpec || '50*40*30').split('*').map(n => parseFloat(n) || 0);
    const singleVol = parts.length === 3 ? (parts[0] * parts[1] * parts[2]) / 1000000 : 0.06;
    const totalVolume = Number((cartons * singleVol).toFixed(3));
    const singleVolWeight = Number(((singleVol * 1000000) / 6000).toFixed(2));
    const totalVolWeight = Number((cartons * singleVolWeight).toFixed(2));
    const totalGrossWeight = Number((cartons * (Number(r.boxWeight) || 0)).toFixed(2));
    const planDiff = qty - (Number(r.planPurchaseQty) || 0);
    return { cartons, volume: Number(singleVol.toFixed(3)), volWeight: singleVolWeight, totalVolume, totalVolWeight, totalGrossWeight, planDiff };
  }

  function addDays(dateStr, days) {
    if (!dateStr || !days) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return '-';
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().slice(0, 10);
  }

  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function addLog(rowId, type, content) {
    const list = logsByPlan.get(rowId) || [];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    list.unshift({ type, content, operator: 'Admin', time: now });
    logsByPlan.set(rowId, list.slice(0, 200));
  }

  /* 多选组件初始化 */
  const multiMap = {};
  function initMulti(id, placeholder, list) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const trigger = wrap.querySelector('[data-trigger]');
    const menu = wrap.querySelector('[data-menu]');
    const selected = new Set();
    multiMap[id] = {
      selected,
      clear() {
        selected.clear();
        menu.querySelectorAll('input').forEach(i => { i.checked = false; });
        updateTrigger();
      }
    };
    function updateTrigger() {
      trigger.textContent = selected.size ? `${placeholder.replace('（可多选）', '')}（${selected.size}）` : placeholder;
    }
    menu.innerHTML = list.map(v => `<label class="multi-opt"><input type="checkbox" value="${esc(v)}"><span>${esc(v)}</span></label>`).join('');
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const wasOpen = wrap.classList.contains('open');
      $$('.multi.open').forEach(m => m.classList.remove('open'));
      if (!wasOpen) wrap.classList.add('open');
    });
    menu.addEventListener('change', e => {
      const cb = e.target;
      if (!cb || cb.type !== 'checkbox') return;
      if (cb.checked) selected.add(cb.value);
      else selected.delete(cb.value);
      updateTrigger();
    });
  }

  document.addEventListener('click', () => $$('.multi.open').forEach(m => m.classList.remove('open')));

  function fillSelect(sel, list, placeholder) {
    if (!sel) return;
    sel.innerHTML = `<option value="">${esc(placeholder)}</option>` + list.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  }

  /* 查询区两行自动溢出折叠（UI_SPEC 3.9.5 / 3.9.6）：按实际渲染行高测量，默认最多展示两行 */
  let queryExpanded = false;
  function layoutQueryItems() {
    const grid = $('#queryGrid');
    const actionItem = grid ? grid.querySelector('.query-action-item') : null;
    const expandBtn = $('#queryExpand');
    const items = $$('#queryGrid .query-item:not(.query-action-item)');
    if (!grid || !items.length || !actionItem) return;

    items.forEach(el => el.classList.remove('is-collapsed-hidden'));
    if (expandBtn) expandBtn.hidden = false;

    const getRowTops = () => {
      const tops = [];
      items.forEach(el => {
        if (el.classList.contains('is-collapsed-hidden')) return;
        const t = el.offsetTop;
        if (!tops.some(x => Math.abs(x - t) <= 4)) tops.push(t);
      });
      return tops.sort((a, b) => a - b);
    };

    const allTops = getRowTops();
    const actionTop = actionItem.offsetTop;
    const hasOverflow = allTops.length > 2 || (allTops.length === 2 && actionTop > allTops[1] + 4);

    if (expandBtn) expandBtn.hidden = !hasOverflow;

    if (hasOverflow && !queryExpanded) {
      const secondRowTop = allTops[1] !== undefined ? allTops[1] : allTops[0];
      items.forEach(el => {
        if (el.offsetTop > secondRowTop + 4) el.classList.add('is-collapsed-hidden');
      });
      // 确保「展开 / 查询 / 重置」按钮组留在第 2 行末尾，不被挤到第 3 行
      for (let i = items.length - 1; i >= 0; i--) {
        if (actionItem.offsetTop <= secondRowTop + 4) break;
        if (!items[i].classList.contains('is-collapsed-hidden')) {
          items[i].classList.add('is-collapsed-hidden');
        }
      }
    }

    if (expandBtn) {
      expandBtn.setAttribute('aria-expanded', String(queryExpanded));
      expandBtn.querySelector('.query-expand-text').textContent = queryExpanded ? '收起' : '展开';
    }
  }
  window.addEventListener('resize', () => {
    clearTimeout(layoutQueryItems._t);
    layoutQueryItems._t = setTimeout(layoutQueryItems, 80);
  });

  function splitTokens(val) {
    return String(val || '').split(/[,，\s]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
  }

  function normalizePickupAllocs(val, fallbackQty = 0) {
    const map = new Map();
    const pushItem = (w, q) => {
      const name = String(w || '').trim();
      if (!name) return;
      const num = Number(q);
      const cleanQty = Number.isFinite(num) && num > 0 ? Math.floor(num) : null;
      if (map.has(name)) {
        const prev = map.get(name);
        map.set(name, { warehouse: name, qty: cleanQty !== null ? (Number(prev.qty || 0) + cleanQty) : prev.qty });
      } else {
        map.set(name, { warehouse: name, qty: cleanQty });
      }
    };
    if (Array.isArray(val)) {
      val.forEach(item => {
        if (item && typeof item === 'object') pushItem(item.warehouse || item.name, item.qty);
        else pushItem(item, null);
      });
    } else if (typeof val === 'string') {
      val.split(/[、,，;；]+/).forEach(w => pushItem(w, null));
    }
    const list = Array.from(map.values());
    if (list.length === 1 && list[0].qty === null && Number(fallbackQty) > 0) {
      list[0].qty = Math.floor(Number(fallbackQty));
    } else if (list.length > 1 && list.every(a => a.qty === null) && Number(fallbackQty) > 0) {
      const total = Math.floor(Number(fallbackQty));
      const base = Math.max(1, Math.floor(total / list.length));
      let remain = total;
      list.forEach((a, idx) => {
        const take = idx === list.length - 1 ? Math.max(1, remain) : Math.min(remain, base);
        a.qty = take;
        remain = Math.max(0, remain - take);
      });
    }
    return list;
  }

  function getPickupList(val) {
    return normalizePickupAllocs(val).map(a => a.warehouse);
  }

  function getPickupTotalQty(val) {
    return normalizePickupAllocs(val).reduce((acc, a) => acc + (Number(a.qty) > 0 ? Number(a.qty) : 0), 0);
  }

  function formatPickupSummary(val) {
    return normalizePickupAllocs(val).map(a => a.qty > 0 ? `${a.warehouse}(${a.qty})` : `${a.warehouse}(待填)`).join('、');
  }

  function renderPickupCellHtml(allocs, opts) {
    const { planQty = 0, readonly = false, delAttr = '', delIdx = '', openAttr = '', openIdx = '', emptyText = '请选择提货仓', btnText = '+ 追加' } = opts;
    const total = getPickupTotalQty(allocs);
    const overLimit = planQty > 0 && total > planQty;
    const missingQty = allocs.some(a => !(Number(a.qty) > 0));
    const visible = allocs.slice(0, 2);
    const extra = allocs.length - visible.length;
    const detailText = allocs.length ? allocs.map(a => `${a.warehouse} × ${a.qty > 0 ? a.qty : '待填'}`).join('、') : '暂未设置提货仓';
    const warnSuffix = overLimit ? `（提货合计 ${total} 大于计划发货数量 ${planQty}）` : (missingQty ? '（存在未填写提货数量的仓库）' : '');
    const fullTitle = `提货分配（合计 ${total} / 计划 ${planQty}）：${detailText}${warnSuffix}`;
    const makeTag = a => {
      const warn = !(Number(a.qty) > 0);
      const qtyHtml = `<span class="spv2-pw-tag-qty">· ${a.qty > 0 ? a.qty : '待填'}</span>`;
      const delHtml = readonly ? '' : `<button class="spv2-pw-tag-del" type="button" ${delAttr}="${delIdx}" data-pw-val="${esc(a.warehouse)}" title="移除 ${esc(a.warehouse)}" aria-label="移除 ${esc(a.warehouse)}">×</button>`;
      return `<span class="spv2-pw-tag ${warn ? 'is-warn' : ''}"><span class="spv2-pw-tag-text">${esc(a.warehouse)}</span>${qtyHtml}${delHtml}</span>`;
    };
    if (readonly) {
      if (!allocs.length) return '-';
      const tags = visible.map(makeTag).join('');
      const more = extra > 0 ? `<span class="spv2-pw-more" title="${esc(fullTitle)}">+${extra}</span>` : '';
      return `<div class="spv2-pw-cell is-readonly" title="${esc(fullTitle)}">${tags}${more}</div>`;
    }
    const tags = visible.map(makeTag).join('');
    const more = extra > 0 ? `<span class="spv2-pw-more" title="${esc(fullTitle)}">+${extra}</span>` : '';
    const emptyHint = !allocs.length ? `<span class="spv2-pw-placeholder">${esc(emptyText)}</span>` : '';
    const statusCls = !allocs.length ? 'is-empty' : (overLimit || missingQty ? 'is-overlimit' : '');
    return `<div class="spv2-pw-cell ${statusCls}" ${openAttr}="${openIdx}" title="${esc(fullTitle + '（点击编辑仓库与提货数量）')}">${emptyHint}${tags}${more}<button class="spv2-pw-add-btn" type="button" ${openAttr}="${openIdx}">${esc(btnText)}</button></div>`;
  }

  function applyFilter(showMsg = false) {
    const codeType = $('#codeType').value;
    const codeTokens = splitTokens($('#codeInput').value);
    const planTokens = splitTokens($('#planNo').value);
    const pickupWhs = multiMap.pickupWarehouseMulti ? multiMap.pickupWarehouseMulti.selected : new Set();
    const shipWhs = multiMap.shipWarehouseMulti.selected;
    const destWhs = multiMap.destinationWarehouseMulti.selected;
    const destType = $('#destinationType').value;
    const provider = $('#firstMileProvider').value;
    const channel = $('#logisticsChannel').value.trim().toLowerCase();
    const transport = $('#transportMode').value;
    const platforms = multiMap.platformMulti.selected;
    const countries = multiMap.countryMulti.selected;
    const stores = multiMap.storeMulti.selected;
    const teams = multiMap.teamMulti.selected;
    const timeType = $('#timeType').value;
    const startDate = $('#startDate').value;
    const endDate = $('#endDate').value;
    const creator = $('#creatorSelect').value;
    const remark = $('#remarkQuery').value.trim().toLowerCase();
    const poTokens = splitTokens($('#purchaseNoQuery').value);
    const soTokens = splitTokens($('#shippingOrderNoQuery').value);
    const fbaTokens = splitTokens($('#fbaShipmentNoQuery').value);
    const fbaLinkStatus = $('#fbaLinkStatusQuery').value;

    const baseFiltered = rows.filter(r => {
      if (codeTokens.length && !codeTokens.some(t => String(r[codeType] || '').toLowerCase().includes(t))) return false;
      if (planTokens.length && !planTokens.some(t => r.planNo.toLowerCase().includes(t))) return false;
      if (pickupWhs.size && !getPickupList(r.pickupWarehouse).some(w => pickupWhs.has(w))) return false;
      if (shipWhs.size && !shipWhs.has(r.shipWarehouse)) return false;
      if (destWhs.size && !destWhs.has(r.destWarehouse)) return false;
      if (destType && r.destType !== destType) return false;
      if (provider && r.provider !== provider) return false;
      if (channel && !r.channel.toLowerCase().includes(channel)) return false;
      if (transport && r.transportMode !== transport) return false;
      if (platforms.size && !platforms.has(r.platform)) return false;
      if (countries.size && !countries.has(r.country)) return false;
      if (stores.size && !stores.has(r.store)) return false;
      if (teams.size && !teams.has(r.team)) return false;
      if (creator && r.creator !== creator) return false;
      if (remark && !r.remark.toLowerCase().includes(remark)) return false;
      if (poTokens.length && !poTokens.some(t => r.purchaseNo.toLowerCase().includes(t))) return false;
      if (soTokens.length && !soTokens.some(t => r.shippingOrderNo.toLowerCase().includes(t))) return false;
      if (fbaTokens.length && !fbaTokens.some(t => r.fbaShipmentNo.toLowerCase().includes(t))) return false;
      if (fbaLinkStatus === 'unlinked' && !(r.team === '亚马逊团队' && !r.fbaShipmentNo)) return false;
      if (fbaLinkStatus === 'linked' && !r.fbaShipmentNo) return false;
      if (startDate || endDate) {
        const dVal = String(r[timeType] || '').slice(0, 10);
        if (startDate && (!dVal || dVal < startDate)) return false;
        if (endDate && (!dVal || dVal > endDate)) return false;
      }
      return true;
    });

    renderStatusTabs(baseFiltered);
    state.filtered = state.statusTab === 'all' ? baseFiltered : baseFiltered.filter(r => r.status === state.statusTab);
    state.page = Math.min(state.page, Math.max(1, Math.ceil(state.filtered.length / state.pageSize)));
    renderTable();
    if (showMsg) toast(`查询完成，共 ${state.filtered.length} 条发货计划`);
  }

  function renderStatusTabs(baseRows) {
    const counts = {
      all: baseRows.length,
      pending_confirm: baseRows.filter(r => r.status === 'pending_confirm').length,
      pending_ship: baseRows.filter(r => r.status === 'pending_ship').length,
      completed: baseRows.filter(r => r.status === 'completed').length,
      void: baseRows.filter(r => r.status === 'void').length
    };
    const tabs = [
      ['all', '全部'],
      ['pending_confirm', '待确认'],
      ['pending_ship', '待发货'],
      ['completed', '已完成'],
      ['void', '已作废']
    ];
    $('#statusTabs').innerHTML = tabs.map(([key, label]) => `
      <button class="spv2-status-tab ${state.statusTab === key ? 'is-active' : ''}" type="button" data-status-tab="${key}">
        <span>${label}</span>
        <span class="count-pill">${counts[key]}</span>
      </button>
    `).join('');
  }

  function getVisibleColumns() {
    const colMap = new Map(COLUMNS.map(c => [c.key, c]));
    const checkCol = colMap.get('_check');
    const actionCol = colMap.get('_action');
    const bodyCols = state.colKeys.map(k => colMap.get(k)).filter(Boolean);
    return [checkCol, ...bodyCols, actionCol].filter(Boolean);
  }

  function renderTable() {
    const visibleCols = getVisibleColumns();
    $('#tableHead').innerHTML = `<tr>${visibleCols.map(c => {
      const cls = c.fixed ? `sticky-${c.fixed}` : '';
      if (c.key === '_check') return `<th class="${cls}"><input type="checkbox" id="headSelectAll" aria-label="全选当前页"></th>`;
      return `<th class="${cls}">${esc(c.label)}</th>`;
    }).join('')}</tr>`;

    const start = (state.page - 1) * state.pageSize;
    const pageRows = state.filtered.slice(start, start + state.pageSize);
    $('#empty').hidden = pageRows.length > 0;

    $('#tableBody').innerHTML = pageRows.map(r => {
      const d = calcDerived(r);
      const readonly = r.status === 'completed' || r.status === 'void';
      const cells = visibleCols.map(c => {
        const cls = c.fixed ? `sticky-${c.fixed}` : '';
        if (c.key === '_check') {
          return `<td class="${cls}"><input class="row-check" type="checkbox" data-row-id="${r.id}" ${state.selected.has(r.id) ? 'checked' : ''} aria-label="选择 ${esc(r.planNo)}"></td>`;
        }
        if (c.key === 'sku') {
          const thumb = r.thumbColor
            ? `<span class="spv2-thumb" style="background:${r.thumbColor}">${esc(r.thumbText)}</span>`
            : `<span class="spv2-thumb is-empty">无图</span>`;
          const link = r.linked ? `<span class="spv2-link-icon" title="已关联产品主数据">⛓</span>` : '';
          return `<td class="${cls}"><div class="spv2-sku-cell">${thumb}<span class="spv2-sku-code">${esc(r.sku)}</span>${link}</div></td>`;
        }
        if (c.key === 'planNo') {
          return `<td class="${cls}"><div class="spv2-plan-cell"><span class="spv2-plan-code">${esc(r.planNo)}</span><span class="spv2-status-tag ${r.status}">${STATUS_META[r.status].label}</span></div></td>`;
        }
        if (c.key === '_action') {
          return `<td class="${cls}"><div class="spv2-op-links"><button class="spv2-op-btn is-gray" type="button" data-row-log="${r.id}">日志</button></div></td>`;
        }
        if (c.key === 'fbaShipmentNo') {
          const val = r.fbaShipmentNo;
          if (val) {
            const nos = String(val).split(/[、,，]+/).filter(Boolean);
            const count = r.fbaLinkCount || nos.length;
            const qty = Number(r.fbaLinkDeclaredQty || 0);
            const badgeText = qty > 0
              ? `已关联 ${count} 货件 / ${qty} 件`
              : (count > 1 ? `已关联 ${count} 货件` : '');
            const title = badgeText ? `${val}（${badgeText}）` : val;
            return `<td class="${cls}" title="${esc(title)}"><div class="spv2-fba-cell"><span class="spv2-fba-nos">${esc(val)}</span>${badgeText ? `<span class="spv2-fba-link-summary">${esc(badgeText)}</span>` : ''}</div></td>`;
          }
          if (r.team === '亚马逊团队') {
            return `<td class="${cls}"><span class="spv2-unlinked-tag">未关联</span></td>`;
          }
          return `<td class="${cls}">-</td>`;
        }
        if (c.key === 'fbaRefId') {
          const val = r[c.key];
          if (val) return `<td class="${cls}" title="${esc(val)}">${esc(val)}</td>`;
          if (r.team === '亚马逊团队' && !r.fbaShipmentNo) {
            return `<td class="${cls}"><span class="spv2-unlinked-tag">未关联</span></td>`;
          }
          return `<td class="${cls}">-</td>`;
        }
        if (c.key === 'pickupWarehouse') {
          const allocs = normalizePickupAllocs(r.pickupWarehouse, r.planShipQty);
          const html = renderPickupCellHtml(allocs, {
            planQty: Number(r.planShipQty) || 0,
            readonly,
            delAttr: 'data-pw-del-row',
            delIdx: r.id,
            openAttr: 'data-pw-open-row',
            openIdx: r.id,
            emptyText: '请选择提货仓',
            btnText: '+ 追加'
          });
          return `<td class="${cls}">${html}</td>`;
        }
        if (c.editable) {
          const dis = readonly ? 'disabled' : '';
          if (c.editable === 'select') {
            const baseList = OPTIONS[c.options] || [];
            const list = r[c.key] && !baseList.includes(r[c.key]) ? [r[c.key], ...baseList] : baseList;
            const opts = list.map(opt => `<option value="${esc(opt)}" ${r[c.key] === opt ? 'selected' : ''}>${esc(opt)}</option>`).join('');
            return `<td class="${cls}"><select class="spv2-inline-control" data-edit-id="${r.id}" data-edit-key="${c.key}" ${dis}>${opts}</select></td>`;
          }
          if (c.editable === 'number') {
            return `<td class="${cls}"><input class="spv2-inline-control spv2-inline-num" type="number" step="any" value="${esc(r[c.key])}" data-edit-id="${r.id}" data-edit-key="${c.key}" ${dis}></td>`;
          }
          if (c.editable === 'date') {
            return `<td class="${cls}"><input class="spv2-inline-control spv2-inline-date" type="date" value="${esc(r[c.key])}" data-edit-id="${r.id}" data-edit-key="${c.key}" ${dis}></td>`;
          }
          return `<td class="${cls}"><input class="spv2-inline-control" type="text" value="${esc(r[c.key])}" data-edit-id="${r.id}" data-edit-key="${c.key}" ${dis}></td>`;
        }
        const val = d[c.key] !== undefined ? d[c.key] : (r[c.key] !== undefined && r[c.key] !== '' ? r[c.key] : '-');
        return `<td class="${cls}">${esc(val)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const allChecked = pageRows.length > 0 && pageRows.every(r => state.selected.has(r.id));
    const headCb = $('#headSelectAll');
    if (headCb) headCb.checked = allChecked;
    $('#bottomSelectAll').checked = allChecked;
    $('#selectedCount').textContent = state.selected.size;
    $('#totalCount').textContent = state.filtered.length;
    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    const btns = [];
    for (let i = 1; i <= totalPages; i++) {
      btns.push(`<button class="page-btn ${i === state.page ? 'active' : ''}" type="button" data-page="${i}">${i}</button>`);
    }
    $('#pageButtons').innerHTML = btns.join('');
    $('#prevPage').disabled = state.page <= 1;
    $('#nextPage').disabled = state.page >= totalPages;
    $('#jumpPage').value = state.page;
  }

  /* 行内编辑事件 */
  $('#spv2Table').addEventListener('change', e => {
    const target = e.target;
    if (target.id === 'headSelectAll') {
      const start = (state.page - 1) * state.pageSize;
      state.filtered.slice(start, start + state.pageSize).forEach(r => {
        if (target.checked) state.selected.add(r.id);
        else state.selected.delete(r.id);
      });
      renderTable();
      return;
    }
    if (target.classList.contains('row-check')) {
      const id = Number(target.dataset.rowId);
      if (target.checked) state.selected.add(id);
      else state.selected.delete(id);
      renderTable();
      return;
    }
    const editId = Number(target.dataset.editId);
    const key = target.dataset.editKey;
    if (!editId || !key) return;
    const row = rows.find(r => r.id === editId);
    if (!row) return;
    const oldVal = row[key];
    const nextVal = target.type === 'number' ? Number(target.value) || 0 : target.value;
    if (key === 'planShipQty') {
      const pickupTotal = getPickupTotalQty(row.pickupWarehouse);
      if (nextVal < pickupTotal) {
        target.value = oldVal;
        return toast(`计划发货数量(${nextVal})不能小于各提货仓提货数量合计(${pickupTotal})`);
      }
    }
    row[key] = nextVal;
    if (key === 'estShipDate' || key === 'estDays') {
      row.estArrivalDate = addDays(row.estShipDate, row.estDays);
    }
    if (key === 'shipWarehouse' || key === 'destWarehouse' || key === 'shipMethod') {
      Object.assign(row, deriveLogisticsInfo(row.shipWarehouse, row.destWarehouse, row.shipMethod));
    }
    row.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    addLog(row.id, '编辑', `修改「${COLUMNS.find(c => c.key === key)?.label || key}」：${oldVal || '空'} → ${row[key]}`);
    publishV2PlansToBridge();
    applyFilter(false);
    toast('已保存修改');
  });

  $('#bottomSelectAll').addEventListener('change', e => {
    const start = (state.page - 1) * state.pageSize;
    state.filtered.slice(start, start + state.pageSize).forEach(r => {
      if (e.target.checked) state.selected.add(r.id);
      else state.selected.delete(r.id);
    });
    renderTable();
  });

  /* 行内日志、提货仓多选操作 */
  $('#tableBody').addEventListener('click', e => {
    const pwDelBtn = e.target.closest('[data-pw-del-row]');
    if (pwDelBtn) {
      e.stopPropagation();
      const id = Number(pwDelBtn.dataset.pwDelRow);
      const val = pwDelBtn.dataset.pwVal;
      const row = rows.find(r => r.id === id);
      if (!row) return;
      const curList = normalizePickupAllocs(row.pickupWarehouse, row.planShipQty);
      if (curList.length <= 1) {
        toast('请至少保留 1 个提货仓，可在浮层中勾选替换');
        const cell = pwDelBtn.closest('.spv2-pw-cell') || pwDelBtn;
        openPickupMgrPopover({ mode: 'list-row', rowId: id }, cell);
        return;
      }
      const nextList = curList.filter(a => a.warehouse !== val);
      row.pickupWarehouse = nextList;
      row.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      addLog(row.id, '修改提货仓', `移除提货仓「${val}」（当前：${formatPickupSummary(nextList)}）`);
      publishV2PlansToBridge();
      applyFilter(false);
      toast(`已移除提货仓「${val}」`);
      return;
    }
    const pwOpenEl = e.target.closest('[data-pw-open-row]');
    if (pwOpenEl) {
      e.stopPropagation();
      const id = Number(pwOpenEl.dataset.pwOpenRow);
      const cell = pwOpenEl.closest('.spv2-pw-cell') || pwOpenEl;
      openPickupMgrPopover({ mode: 'list-row', rowId: id }, cell);
      return;
    }
    const logBtn = e.target.closest('[data-row-log]');
    if (logBtn) {
      openPlanLogModal(Number(logBtn.dataset.rowLog));
    }
  });

  const planLogState = { rowId: 0, page: 1, pageSize: 10 };

  function renderPlanLogModal() {
    const row = rows.find(r => r.id === planLogState.rowId);
    if (!row) return;
    const logs = logsByPlan.get(row.id) || [];
    const totalPages = Math.max(1, Math.ceil(logs.length / planLogState.pageSize));
    const current = Math.min(planLogState.page, totalPages);
    planLogState.page = current;
    const pageLogs = logs.slice((current - 1) * planLogState.pageSize, current * planLogState.pageSize);
    $('#planLogTitle').textContent = '操作日志';
    $('#planLogSub').textContent = `发货计划：${row.planNo}`;
    $('#planLogBody').innerHTML = pageLogs.length
      ? pageLogs.map(l => `<tr><td>${esc(l.type)}</td><td class="purchase-log-content">${esc(l.content)}</td><td>${esc(l.operator)}</td><td>${esc(l.time)}</td></tr>`).join('')
      : `<tr><td colspan="4" class="purchase-log-empty">暂无操作日志</td></tr>`;
    $('#planLogCount').textContent = `共 ${logs.length} 条`;
    const pagesHtml = Array.from({ length: totalPages }, (_, idx) => {
      const p = idx + 1;
      return `<button class="purchase-log-page ${p === current ? 'active' : ''}" type="button" data-log-page="${p}">${p}</button>`;
    }).join('');
    $('#planLogPager').innerHTML = `
      <button class="purchase-log-page" type="button" data-log-page="${Math.max(1, current - 1)}" ${current <= 1 ? 'disabled' : ''}>‹</button>
      ${pagesHtml}
      <button class="purchase-log-page" type="button" data-log-page="${Math.min(totalPages, current + 1)}" ${current >= totalPages ? 'disabled' : ''}>›</button>
    `;
  }

  function openPlanLogModal(id) {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    planLogState.rowId = id;
    planLogState.page = 1;
    renderPlanLogModal();
    $('#planLogMask').classList.remove('hidden');
  }

  function closePlanLogModal() {
    $('#planLogMask').classList.add('hidden');
  }

  $('#planLogClose').addEventListener('click', closePlanLogModal);
  $('#planLogMask').addEventListener('click', e => {
    if (e.target === $('#planLogMask')) closePlanLogModal();
  });
  $('#planLogPager').addEventListener('click', e => {
    const btn = e.target.closest('[data-log-page]');
    if (!btn || btn.disabled) return;
    planLogState.page = Number(btn.dataset.logPage) || 1;
    renderPlanLogModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#planLogMask').classList.contains('hidden')) {
      closePlanLogModal();
    }
  });

  /* 状态 Tab 切换 */
  $('#statusTabs').addEventListener('click', e => {
    const tab = e.target.closest('[data-status-tab]');
    if (!tab) return;
    state.statusTab = tab.dataset.statusTab;
    state.page = 1;
    applyFilter(false);
  });

  /* 查询与重置 */
  $('#queryExpand').addEventListener('click', () => {
    queryExpanded = !queryExpanded;
    layoutQueryItems();
  });
  $('#searchBtn').addEventListener('click', () => { state.page = 1; applyFilter(true); });
  $('#resetBtn').addEventListener('click', () => {
    $('#codeType').value = 'sku';
    $('#codeInput').value = '';
    $('#planNo').value = '';
    $('#destinationType').value = '';
    $('#firstMileProvider').value = '';
    $('#logisticsChannel').value = '';
    $('#transportMode').value = '';
    $('#timeType').value = 'createdAt';
    $('#startDate').value = '';
    $('#endDate').value = '';
    $('#creatorSelect').value = '';
    $('#remarkQuery').value = '';
    $('#purchaseNoQuery').value = '';
    $('#shippingOrderNoQuery').value = '';
    $('#fbaShipmentNoQuery').value = '';
    $('#fbaLinkStatusQuery').value = '';
    Object.values(multiMap).forEach(m => m.clear());
    state.statusTab = 'all';
    state.page = 1;
    applyFilter(false);
    toast('已重置查询条件');
  });

  /* 主操作按钮：确认 / 作废 */
  $('#confirmBtn').addEventListener('click', () => {
    const targets = rows.filter(r => state.selected.has(r.id) && r.status === 'pending_confirm');
    if (!targets.length) return toast('请先勾选「待确认」状态的发货计划');
    targets.forEach(r => {
      r.status = 'pending_ship';
      r.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      addLog(r.id, '确认', `确认发货计划 ${r.planNo}，流转至待发货`);
    });
    publishV2PlansToBridge();
    applyFilter(false);
    toast(`已确认 ${targets.length} 条发货计划`);
  });

  $('#batchVoidBtn').addEventListener('click', () => {
    const targets = rows.filter(r => state.selected.has(r.id) && r.status !== 'void');
    if (!targets.length) return toast('请先勾选未作废的发货计划');
    targets.forEach(r => {
      r.status = 'void';
      r.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      addLog(r.id, '批量作废', `批量作废发货计划 ${r.planNo}`);
    });
    publishV2PlansToBridge();
    applyFilter(false);
    toast(`已作废 ${targets.length} 条发货计划`);
  });

  /* 可添加的 SKU 商品池（用于「添加 SKU」小弹窗） */
  const SKU_POOL = [
    { sku: '10230100501', lingxingSku: '10230100501', productName: '焊机脚踏开关（TIG通用）', fnsku: 'X004Q36S81', team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'TIG-PEDAL-US', opsOwner: '王方圆', packSpec: '28*20*14', boxSpec: '46*36*32', boxQty: 10, pickupWarehouse: '深圳坂田总仓', planShipQty: 8, remark: '', supplierCode: 'SUP-1023-01' },
    { sku: '140US260008', lingxingSku: '140US260008', productName: '电焊机 140A', team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-140US / B09140US', opsOwner: '王方圆', packSpec: '42*24*28', boxSpec: '58*44*38', boxQty: 8, pickupWarehouse: '深圳坂田总仓', planShipQty: 16, remark: '', supplierCode: 'SUP-140-01' },
    { sku: '153US0000017', lingxingSku: '153US0000017', productName: '送丝管耗材套装 S1 500W', team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-153S1 / B09153S1', opsOwner: '王方圆', packSpec: '22*18*10', boxSpec: '48*38*32', boxQty: 20, pickupWarehouse: '深圳坂田总仓', planShipQty: 40, remark: '', supplierCode: 'SUP-153-17' },
    { sku: '153US0000024', lingxingSku: '153US0000024', productName: '焊枪配件套装', team: 'Jasic团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-15324 / B0915324', opsOwner: '陈晓', packSpec: '25*18*12', boxSpec: '50*40*34', boxQty: 15, pickupWarehouse: '东莞清溪仓', planShipQty: 30, remark: '', supplierCode: 'SUP-153-24' },
    { sku: '153US0000031', lingxingSku: '153US0000031', productName: '不锈钢焊丝', team: '北美大件组', platform: '沃尔玛', store: 'WEM_Walmart_US', country: 'US', sellerSku: 'SL-15331 / B0915331', opsOwner: '毛粤风', packSpec: '20*20*15', boxSpec: '44*44*32', boxQty: 12, pickupWarehouse: '坪山石井本地仓', planShipQty: 24, remark: '', supplierCode: 'SUP-153-31' },
    { sku: '42101000004', lingxingSku: '42101000004', productName: 'TIG 焊丝-不锈钢', team: '欧洲运营组', platform: '亚马逊', store: 'ARCCAPTAIN_DE', country: 'DE', sellerSku: 'SL-42104 / B0942104', opsOwner: '林思雨', packSpec: '18*18*12', boxSpec: '40*40*30', boxQty: 10, pickupWarehouse: '东莞清溪仓', planShipQty: 20, remark: '', supplierCode: 'SUP-421-04' },
    { sku: 'ARC-MIG200-US', lingxingSku: 'ARC-MIG200-US', productName: '逆变焊机 MIG200', team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-MIG200 / B09MIG200', opsOwner: '王方圆', packSpec: '42*25*30', boxSpec: '60*45*40', boxQty: 10, pickupWarehouse: '深圳坂田总仓', planShipQty: 20, remark: '', supplierCode: 'SUP-MIG-01' },
    { sku: 'ARC-TIG200-US', lingxingSku: 'ARC-TIG200-US', productName: '氩弧焊机 TIG200', team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-TIG200 / B09TIG200', opsOwner: '王方圆', packSpec: '45*28*32', boxSpec: '55*42*38', boxQty: 8, pickupWarehouse: '深圳坂田总仓', planShipQty: 16, remark: '', supplierCode: 'SUP-TIG-02' },
    { sku: 'DD123456', lingxingSku: 'DD123456', productName: '组合产品 DD', team: '刘绎天', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-DD123 / B0DD123456', opsOwner: '毛粤风', packSpec: '40*30*28', boxSpec: '60*45*40', boxQty: 13, pickupWarehouse: '坪山石井本地仓', planShipQty: 26, remark: '', supplierCode: 'SUP-DD-01' },
    { sku: 'EE123456', lingxingSku: 'EE123456', productName: '组合产品子项 EE', team: 'Jasic团队', platform: 'Ozon', store: 'Ozon_Direct', country: 'RU', sellerSku: 'SL-EE123 / B0EE123456', opsOwner: '李明', packSpec: '35*25*22', boxSpec: '50*40*35', boxQty: 8, pickupWarehouse: '义乌集货仓', planShipQty: 24, remark: '', supplierCode: 'SUP-EE-04' },
    { sku: 'FF123456', lingxingSku: 'FF123456', productName: '组合产品子项 FF', team: '欧洲运营组', platform: '亚马逊', store: 'ARCCAPTAIN_DE', country: 'DE', sellerSku: 'SL-FF123 / B0FF123456', opsOwner: '林思雨', packSpec: '38*26*24', boxSpec: '55*42*38', boxQty: 12, pickupWarehouse: '东莞清溪仓', planShipQty: 24, remark: '', supplierCode: 'SUP-FF-03' }
  ];

  /* 新建发货计划弹窗（UI_SPEC 1.8：底部汇总 + 取消/提交，前4列固定，添加SKU独立小弹窗） */
  function updateCreateStats() {
    const skuCount = state.createSkus.length;
    const totalCartons = state.createSkus.reduce((acc, s) => acc + Math.ceil((Number(s.planShipQty) || 0) / (Number(s.boxQty) || 1)), 0);
    const totalQty = state.createSkus.reduce((acc, s) => acc + (Number(s.planShipQty) || 0), 0);
    $('#statSkuCount').textContent = skuCount;
    $('#statTotalCartons').textContent = totalCartons;
    $('#statTotalQty').textContent = totalQty;
  }

  function renderCreateSkus() {
    const selHtml = (idx, key, list, val, placeholder = '') => `
      <select class="spv2-inline-control" data-csku-idx="${idx}" data-csku-key="${key}">
        ${placeholder ? `<option value="" ${!val ? 'selected' : ''}>${esc(placeholder)}</option>` : ''}
        ${list.map(opt => `<option value="${esc(opt)}" ${val === opt ? 'selected' : ''}>${esc(opt)}</option>`).join('')}
      </select>`;
    const renderCreatePwCell = (s, idx) => renderPickupCellHtml(normalizePickupAllocs(s.pickupWarehouse, s.planShipQty), {
      planQty: Number(s.planShipQty) || 0,
      readonly: false,
      delAttr: 'data-csku-pw-del',
      delIdx: idx,
      openAttr: 'data-csku-pw-idx',
      openIdx: idx,
      emptyText: '请选择提货仓（可多选）',
      btnText: '+ 选仓'
    });
    $('#createSkuBody').innerHTML = state.createSkus.length ? state.createSkus.map((s, idx) => `
      <tr>
        <td class="spv2-c-fix-1">${esc(s.sku)}</td>
        <td class="spv2-c-fix-2"><input class="spv2-inline-control" data-csku-idx="${idx}" data-csku-key="lingxingSku" value="${esc(s.lingxingSku)}"></td>
        <td class="spv2-c-fix-3" title="${esc(s.productName)}">${esc(s.productName)}</td>
        <td class="spv2-c-fix-4">${selHtml(idx, 'team', OPTIONS.teams, s.team)}</td>
        <td>${selHtml(idx, 'platform', OPTIONS.platforms, s.platform)}</td>
        <td>${selHtml(idx, 'store', OPTIONS.stores, s.store)}</td>
        <td>${esc(s.country)}</td>
        <td>${selHtml(idx, 'opsOwner', OPTIONS.planOwners, s.opsOwner)}</td>
        <td>${esc(s.packSpec)}</td>
        <td>${esc(s.boxSpec)}</td>
        <td>${esc(s.boxQty)}</td>
        <td data-csku-cartons="${idx}">${Math.ceil((Number(s.planShipQty) || 0) / (Number(s.boxQty) || 1))}</td>
        <td>${renderCreatePwCell(s, idx)}</td>
        <td><input class="spv2-inline-control spv2-inline-num" type="number" min="1" data-csku-idx="${idx}" data-csku-key="planShipQty" value="${esc(s.planShipQty)}"></td>
        <td><input class="spv2-inline-control" data-csku-idx="${idx}" data-csku-key="remark" value="${esc(s.remark)}" placeholder="请输入备注"></td>
        <td>${esc(s.supplierCode)}</td>
        <td class="spv2-c-fix-right"><button class="spv2-op-btn is-danger" type="button" data-csku-del="${idx}">移除</button></td>
      </tr>
    `).join('') : `<tr><td colspan="17" class="spv2-create-empty"><div class="spv2-create-empty-inner"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="14" width="34" height="26" rx="4" stroke="currentColor" stroke-width="2"/><path d="M16 14v-3a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" stroke="currentColor" stroke-width="2"/><path d="M17 24h14M17 30h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><p>暂未添加发货 SKU</p><span>点击右上角「添加 SKU」，选择需要发货的商品</span></div></td></tr>`;
    updateCreateStats();
  }

  /* 明细表头「批量」编辑浮层（对齐采购计划交互，提货仓支持多选「追加 / 覆盖」） */
  const BATCH_FIELDS = {
    team: { label: '团队', type: 'select', options: 'teams', placeholder: '请选择团队' },
    platform: { label: '平台', type: 'select', options: 'platforms', placeholder: '请选择平台' },
    store: { label: '店铺', type: 'select', options: 'stores', placeholder: '请选择店铺' },
    opsOwner: { label: '运营负责人', type: 'select', options: 'planOwners', placeholder: '请选择运营负责人' },
    pickupWarehouse: { label: '提货仓', type: 'multi-pickup', options: 'pickupWarehouses', placeholder: '请勾选提货仓（可多选）' },
    planShipQty: { label: '计划发货数量', type: 'number', placeholder: '请输入计划发货数量' },
    remark: { label: '备注', type: 'text', placeholder: '请输入备注' }
  };
  let activeBatchField = '';

  function closeBatchFillPopover() {
    activeBatchField = '';
    const pop = $('#batchFillPopover');
    if (pop) pop.classList.add('hidden');
  }

  function openBatchFillPopover(field, trigger) {
    const cfg = BATCH_FIELDS[field];
    if (!cfg) return;
    closePickupMgrPopover();
    if (activeBatchField === field) {
      closeBatchFillPopover();
      return;
    }
    activeBatchField = field;
    const body = $('#batchFillBody');
    const appendBtn = $('#batchFillAppendBtn');
    const confirmBtn = $('#batchFillConfirmBtn');
    if (cfg.type === 'multi-pickup') {
      const list = OPTIONS[cfg.options] || [];
      body.innerHTML = `
        <div class="spv2-batch-multi-head">勾选提货仓并填写提货数量</div>
        <div class="spv2-batch-multi-list">
          ${list.map(v => `
            <div class="spv2-batch-multi-item">
              <label class="spv2-batch-multi-check"><input type="checkbox" value="${esc(v)}" data-batch-pw-check><span>${esc(v)}</span></label>
              <input class="control spv2-batch-qty-input" type="number" min="1" placeholder="提货数" data-batch-pw-qty="${esc(v)}" disabled>
            </div>`).join('')}
        </div>`;
      if (appendBtn) appendBtn.classList.remove('hidden');
      if (confirmBtn) confirmBtn.textContent = '覆盖';
    } else {
      if (appendBtn) appendBtn.classList.add('hidden');
      if (confirmBtn) confirmBtn.textContent = '确认';
      if (cfg.type === 'select') {
        const list = OPTIONS[cfg.options] || [];
        body.innerHTML = `<select class="control" id="batchFillInput"><option value="">${esc(cfg.placeholder)}</option>${list.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select>`;
      } else if (cfg.type === 'number') {
        body.innerHTML = `<input class="control" id="batchFillInput" type="number" min="1" placeholder="${esc(cfg.placeholder)}">`;
      } else {
        body.innerHTML = `<input class="control" id="batchFillInput" type="text" placeholder="${esc(cfg.placeholder)}">`;
      }
    }
    const pop = $('#batchFillPopover');
    pop.classList.remove('hidden');
    const rect = trigger.getBoundingClientRect();
    const popW = pop.offsetWidth || 236;
    const popH = pop.offsetHeight || 110;
    const left = Math.max(12, Math.min(window.innerWidth - popW - 12, rect.left + rect.width / 2 - popW / 2));
    const top = Math.max(12, rect.top - popH - 10);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    const input = $('#batchFillInput');
    if (input) input.focus();
  }

  $('#batchFillBody').addEventListener('change', e => {
    const cb = e.target.closest('[data-batch-pw-check]');
    if (!cb) return;
    const val = cb.value;
    const qtyInput = $$('[data-batch-pw-qty]').find(el => el.dataset.batchPwQty === val);
    if (!qtyInput) return;
    qtyInput.disabled = !cb.checked;
    if (!cb.checked) qtyInput.value = '';
    else qtyInput.focus();
  });

  function applyBatchPickupWarehouses(mode) {
    const checkedBoxes = $$('[data-batch-pw-check]:checked');
    if (!checkedBoxes.length) return toast('请至少勾选 1 个提货仓');
    if (!state.createSkus.length) return toast('请先添加 SKU 明细');
    const qtyInputs = $$('[data-batch-pw-qty]');
    const picked = [];
    for (const cb of checkedBoxes) {
      const w = cb.value;
      const input = qtyInputs.find(el => el.dataset.batchPwQty === w);
      const qty = Math.floor(Number(input ? input.value : 0));
      if (!(qty > 0)) return toast(`请为「${w}」填写大于 0 的提货数量`);
      picked.push({ warehouse: w, qty });
    }
    const nextByIdx = [];
    for (let i = 0; i < state.createSkus.length; i++) {
      const item = state.createSkus[i];
      const cur = normalizePickupAllocs(item.pickupWarehouse, item.planShipQty);
      let next;
      if (mode === 'append') {
        const map = new Map(cur.map(a => [a.warehouse, { ...a }]));
        picked.forEach(p => { map.set(p.warehouse, { ...p }); });
        next = Array.from(map.values());
      } else {
        next = picked.map(p => ({ ...p }));
      }
      const total = getPickupTotalQty(next);
      const planQty = Number(item.planShipQty) || 0;
      if (planQty > 0 && total > planQty) {
        return toast(`SKU ${item.sku} 提货数量合计(${total})不能大于计划发货数量(${planQty})`);
      }
      nextByIdx.push(next);
    }
    state.createSkus.forEach((item, i) => { item.pickupWarehouse = nextByIdx[i]; });
    const count = state.createSkus.length;
    const desc = formatPickupSummary(picked);
    closeBatchFillPopover();
    renderCreateSkus();
    toast(mode === 'append' ? `已为 ${count} 个明细追加提货仓：${desc}` : `已将提货仓配置覆盖应用到 ${count} 个明细`);
  }

  $('#createModal').addEventListener('click', e => {
    const trigger = e.target.closest('[data-batch-field]');
    if (trigger) {
      e.stopPropagation();
      openBatchFillPopover(trigger.dataset.batchField, trigger);
      return;
    }
    if (!e.target.closest('#batchFillPopover')) closeBatchFillPopover();
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#batchFillPopover') && !e.target.closest('[data-batch-field]')) {
      closeBatchFillPopover();
    }
    if (!e.target.closest('#pickupMgrPopover') && !e.target.closest('[data-pw-open-row]') && !e.target.closest('[data-csku-pw-idx]')) {
      closePickupMgrPopover();
    }
  });

  $('#batchFillCancelBtn').addEventListener('click', closeBatchFillPopover);
  $('#batchFillAppendBtn').addEventListener('click', () => {
    if (activeBatchField === 'pickupWarehouse') applyBatchPickupWarehouses('append');
  });
  $('#batchFillConfirmBtn').addEventListener('click', () => {
    const cfg = BATCH_FIELDS[activeBatchField];
    if (!cfg) return;
    if (cfg.type === 'multi-pickup') {
      applyBatchPickupWarehouses('replace');
      return;
    }
    const input = $('#batchFillInput');
    if (!input) return;
    const raw = input.value;
    if (raw === null || raw === undefined || raw === '') {
      return toast(`请先填写${cfg.label}`);
    }
    if (!state.createSkus.length) return toast('请先添加 SKU 明细');
    const val = cfg.type === 'number' ? Math.max(1, Number(raw) || 0) : raw;
    state.createSkus.forEach(item => { item[activeBatchField] = val; });
    const count = state.createSkus.length;
    const label = cfg.label;
    closeBatchFillPopover();
    renderCreateSkus();
    toast(`已将${label}批量应用到 ${count} 个明细`);
  });

  /* 提货仓多选与提货数量管理浮层（支持列表行与新建明细行的新增/修改/追加） */
  const pwMgrState = {
    open: false,
    mode: '',
    rowId: 0,
    cskuIdx: -1,
    planQty: 0,
    draft: [],
    search: ''
  };

  function closePickupMgrPopover() {
    pwMgrState.open = false;
    const pop = $('#pickupMgrPopover');
    if (pop) pop.classList.add('hidden');
  }

  function renderPickupMgrSummary() {
    const draft = pwMgrState.draft;
    const total = getPickupTotalQty(draft);
    const planQty = Number(pwMgrState.planQty) || 0;
    const remain = planQty - total;
    const over = planQty > 0 && remain < 0;
    $('#pickupMgrCount').textContent = `已选 ${draft.length} 个`;
    const quotaEl = $('#pickupMgrQuota');
    quotaEl.classList.toggle('is-over', over);
    quotaEl.innerHTML = `
      <span>计划发货：<b>${planQty}</b> 件</span>
      <span>已填提货：<b>${total}</b> 件</span>
      <span>${over ? `超出：<b>${Math.abs(remain)}</b> 件` : `剩余可配：<b>${remain}</b> 件`}</span>
    `;
    const selEl = $('#pickupMgrSelected');
    if (draft.length) {
      selEl.innerHTML = draft.map(a => `
        <span class="spv2-pw-tag ${!(Number(a.qty) > 0) ? 'is-warn' : ''}">
          <span class="spv2-pw-tag-text">${esc(a.warehouse)}</span>
          <span class="spv2-pw-tag-qty">· ${a.qty > 0 ? a.qty : '待填'}</span>
          <button class="spv2-pw-tag-del" type="button" data-pwmgr-del="${esc(a.warehouse)}" title="移除 ${esc(a.warehouse)}" aria-label="移除 ${esc(a.warehouse)}">×</button>
        </span>`).join('');
    } else {
      selEl.innerHTML = `<span class="spv2-pw-popover__empty-sel">暂未选择提货仓，请在下方勾选并填写提货数量</span>`;
    }
  }

  function renderPickupMgrPopover() {
    renderPickupMgrSummary();
    const draftMap = new Map(pwMgrState.draft.map(a => [a.warehouse, a]));
    const allOptions = [...new Set([...OPTIONS.pickupWarehouses, ...pwMgrState.draft.map(a => a.warehouse)])];
    const q = pwMgrState.search.trim().toLowerCase();
    const filtered = allOptions.filter(w => w.toLowerCase().includes(q));
    const listEl = $('#pickupMgrList');
    if (filtered.length) {
      listEl.innerHTML = filtered.map(w => {
        const entry = draftMap.get(w);
        const checked = Boolean(entry);
        const qtyVal = checked && entry.qty > 0 ? entry.qty : '';
        return `
          <div class="spv2-pw-option ${checked ? 'is-checked' : ''}">
            <label class="spv2-pw-opt-check">
              <input type="checkbox" value="${esc(w)}" data-pwmgr-check ${checked ? 'checked' : ''}>
              <span title="${esc(w)}">${esc(w)}</span>
            </label>
            <div class="spv2-pw-opt-qty">
              <input class="spv2-pw-qty-input" type="number" min="1" placeholder="数量" data-pwmgr-qty="${esc(w)}" value="${esc(qtyVal)}" ${checked ? '' : 'disabled'}>
              <span>件</span>
            </div>
          </div>`;
      }).join('');
    } else {
      listEl.innerHTML = `<div class="spv2-pw-popover__empty-sel" style="padding:8px 10px;">无匹配提货仓</div>`;
    }
  }

  function openPickupMgrPopover(target, anchorEl) {
    closeBatchFillPopover();
    pwMgrState.open = true;
    pwMgrState.mode = target.mode;
    pwMgrState.rowId = target.rowId || 0;
    pwMgrState.cskuIdx = target.cskuIdx !== undefined ? target.cskuIdx : -1;
    pwMgrState.search = '';
    const searchInput = $('#pickupMgrSearch');
    if (searchInput) searchInput.value = '';
    if (target.mode === 'list-row') {
      const row = rows.find(r => r.id === target.rowId);
      if (!row) return;
      pwMgrState.planQty = Number(row.planShipQty) || 0;
      pwMgrState.draft = normalizePickupAllocs(row.pickupWarehouse, row.planShipQty).map(a => ({ ...a }));
      $('#pickupMgrTitle').textContent = `提货仓管理｜${row.planNo}`;
    } else {
      const s = state.createSkus[target.cskuIdx];
      if (!s) return;
      pwMgrState.planQty = Number(s.planShipQty) || 0;
      pwMgrState.draft = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty).map(a => ({ ...a }));
      $('#pickupMgrTitle').textContent = `选择提货仓｜${s.sku}`;
    }
    renderPickupMgrPopover();
    const pop = $('#pickupMgrPopover');
    pop.classList.remove('hidden');
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const popW = pop.offsetWidth || 368;
      const popH = pop.offsetHeight || 340;
      const left = Math.max(12, Math.min(window.innerWidth - popW - 12, rect.left));
      const top = rect.bottom + popH + 12 <= window.innerHeight
        ? rect.bottom + 6
        : Math.max(12, rect.top - popH - 6);
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
    }
  }

  $('#pickupMgrSearch').addEventListener('input', e => {
    pwMgrState.search = e.target.value;
    renderPickupMgrPopover();
  });
  $('#pickupMgrSelected').addEventListener('click', e => {
    const delBtn = e.target.closest('[data-pwmgr-del]');
    if (!delBtn) return;
    const val = delBtn.dataset.pwmgrDel;
    pwMgrState.draft = pwMgrState.draft.filter(a => a.warehouse !== val);
    renderPickupMgrPopover();
  });
  $('#pickupMgrList').addEventListener('change', e => {
    const cb = e.target.closest('[data-pwmgr-check]');
    if (!cb) return;
    const val = cb.value;
    if (cb.checked) {
      if (!pwMgrState.draft.some(a => a.warehouse === val)) {
        const remain = Math.max(0, (Number(pwMgrState.planQty) || 0) - getPickupTotalQty(pwMgrState.draft));
        pwMgrState.draft.push({ warehouse: val, qty: remain > 0 ? remain : null });
      }
      renderPickupMgrPopover();
      const qtyEl = $$('[data-pwmgr-qty]').find(el => el.dataset.pwmgrQty === val);
      if (qtyEl) qtyEl.focus();
    } else {
      pwMgrState.draft = pwMgrState.draft.filter(a => a.warehouse !== val);
      renderPickupMgrPopover();
    }
  });
  $('#pickupMgrList').addEventListener('input', e => {
    const qtyInput = e.target.closest('[data-pwmgr-qty]');
    if (!qtyInput) return;
    const val = qtyInput.dataset.pwmgrQty;
    const entry = pwMgrState.draft.find(a => a.warehouse === val);
    if (!entry) return;
    const num = Math.floor(Number(qtyInput.value));
    entry.qty = Number.isFinite(num) && num > 0 ? num : null;
    renderPickupMgrSummary();
  });
  $('#pickupMgrCancelBtn').addEventListener('click', closePickupMgrPopover);
  $('#pickupMgrConfirmBtn').addEventListener('click', () => {
    const nextList = pwMgrState.draft.map(a => ({ warehouse: a.warehouse, qty: a.qty }));
    if (pwMgrState.mode === 'list-row' && !nextList.length) {
      return toast('请至少保留 1 个提货仓');
    }
    if (nextList.some(a => !(Number(a.qty) > 0))) {
      return toast('请为所有已选提货仓填写大于 0 的提货数量');
    }
    const total = getPickupTotalQty(nextList);
    if (pwMgrState.planQty > 0 && total > pwMgrState.planQty) {
      return toast(`各提货仓提货数量合计(${total})不能大于计划发货数量(${pwMgrState.planQty})`);
    }
    if (pwMgrState.mode === 'list-row') {
      const row = rows.find(r => r.id === pwMgrState.rowId);
      if (!row) return;
      const oldList = normalizePickupAllocs(row.pickupWarehouse, row.planShipQty);
      const oldNames = new Set(oldList.map(a => a.warehouse));
      const added = nextList.filter(a => !oldNames.has(a.warehouse));
      row.pickupWarehouse = nextList;
      row.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const oldSummary = formatPickupSummary(oldList);
      const newSummary = formatPickupSummary(nextList);
      if (oldSummary !== newSummary) {
        if (added.length && added.length === nextList.length - oldList.length) {
          addLog(row.id, '追加提货仓', `追加提货仓：${formatPickupSummary(added)}（当前：${newSummary}）`);
        } else {
          addLog(row.id, '修改提货仓', `修改「提货仓及提货数量」：${oldSummary || '空'} → ${newSummary}`);
        }
      }
      closePickupMgrPopover();
      publishV2PlansToBridge();
      applyFilter(false);
      toast(`已更新提货仓与数量（共 ${nextList.length} 仓，合计 ${total} 件）`);
      return;
    }
    if (pwMgrState.mode === 'create-row') {
      const s = state.createSkus[pwMgrState.cskuIdx];
      if (!s) return;
      s.pickupWarehouse = nextList;
      closePickupMgrPopover();
      renderCreateSkus();
      toast(nextList.length ? `已设置 ${nextList.length} 个提货仓（合计 ${total} 件）` : '已清空提货仓');
    }
  });

  const createTableWrap = document.querySelector('.spv2-create-table-wrap');
  if (createTableWrap) createTableWrap.addEventListener('scroll', closeBatchFillPopover);

  function closeCreateModal() {
    closeBatchFillPopover();
    $('#createModalMask').classList.add('hidden');
    $('#createModal').classList.add('hidden');
  }

  function resetCreateForm() {
    $('#cShipMethod').value = '海外仓备货';
    $('#cShipWarehouse').value = '跨跃猫物流仓';
    $('#cPlanOwner').textContent = 'Admin';
    $('#cDestWarehouse').value = '';
    const today = new Date().toISOString().slice(0, 10);
    $('#cEstShipDate').value = today;
    $('#cEstDays').value = '18';
    $('#cEstArrivalDate').value = addDays(today, 18);
    state.createSkus = [];
    renderCreateSkus();
  }

  $('#createPlanBtn').addEventListener('click', () => {
    resetCreateForm();
    $('#createModalMask').classList.remove('hidden');
    $('#createModal').classList.remove('hidden');
  });
  $('#createCloseBtn').addEventListener('click', closeCreateModal);
  $('#createCancelBtn').addEventListener('click', closeCreateModal);
  $('#cEstShipDate').addEventListener('change', () => {
    const calc = addDays($('#cEstShipDate').value, $('#cEstDays').value);
    if (calc !== '-') $('#cEstArrivalDate').value = calc;
  });
  $('#cEstDays').addEventListener('input', () => {
    const calc = addDays($('#cEstShipDate').value, $('#cEstDays').value);
    if (calc !== '-') $('#cEstArrivalDate').value = calc;
  });

  /* 添加 SKU 小弹窗逻辑 */
  const pickerState = { list: [...SKU_POOL], selected: new Set() };

  function renderSkuPickerRows() {
    const existingSet = new Set(state.createSkus.map(s => s.sku));
    $('#skuPickerBody').innerHTML = pickerState.list.length ? pickerState.list.map(p => {
      const added = existingSet.has(p.sku);
      const checked = pickerState.selected.has(p.sku);
      return `
        <tr>
          <td class="spv2-picker-check-col">
            <input type="checkbox" class="spv2-picker-cb" data-pick-sku="${esc(p.sku)}" ${checked ? 'checked' : ''} ${added ? 'disabled title="已添加"' : ''}>
          </td>
          <td>${esc(p.sku)}${added ? ' <span style="color:#909399;font-size:11px;">(已添加)</span>' : ''}</td>
          <td>
            <div class="spv2-picker-prod">
              <span class="spv2-picker-icon">📦</span>
              <span>${esc(p.productName)}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('') : `<tr><td colspan="3" style="text-align:center;color:#909399;padding:28px;">暂无匹配的 SKU</td></tr>`;

    const selectable = pickerState.list.filter(p => !existingSet.has(p.sku));
    $('#skuPickerSelectAll').checked = selectable.length > 0 && selectable.every(p => pickerState.selected.has(p.sku));
    $('#skuPickerSelectedCount').textContent = pickerState.selected.size;
  }

  function filterSkuPicker() {
    const codes = splitTokens($('#skuPickerCodeInput').value);
    const nameKey = $('#skuPickerNameInput').value.trim().toLowerCase();
    pickerState.list = SKU_POOL.filter(p => {
      if (codes.length && !codes.some(c => p.sku.toLowerCase().includes(c))) return false;
      if (nameKey && !p.productName.toLowerCase().includes(nameKey)) return false;
      return true;
    });
    renderSkuPickerRows();
  }

  function closeSkuPicker() {
    $('#skuPickerMask').classList.add('hidden');
    $('#skuPickerModal').classList.add('hidden');
  }

  $('#createAddSkuBtn').addEventListener('click', () => {
    $('#skuPickerCodeInput').value = '';
    $('#skuPickerNameInput').value = '';
    pickerState.selected.clear();
    pickerState.list = [...SKU_POOL];
    renderSkuPickerRows();
    $('#skuPickerMask').classList.remove('hidden');
    $('#skuPickerModal').classList.remove('hidden');
  });
  $('#skuPickerCloseBtn').addEventListener('click', closeSkuPicker);
  $('#skuPickerCancelBtn').addEventListener('click', closeSkuPicker);
  $('#skuPickerSearchBtn').addEventListener('click', filterSkuPicker);
  $('#skuPickerSelectAll').addEventListener('change', e => {
    const existingSet = new Set(state.createSkus.map(s => s.sku));
    pickerState.list.forEach(p => {
      if (existingSet.has(p.sku)) return;
      if (e.target.checked) pickerState.selected.add(p.sku);
      else pickerState.selected.delete(p.sku);
    });
    renderSkuPickerRows();
  });
  $('#skuPickerBody').addEventListener('change', e => {
    const cb = e.target;
    if (!cb.classList.contains('spv2-picker-cb')) return;
    const sku = cb.dataset.pickSku;
    if (cb.checked) pickerState.selected.add(sku);
    else pickerState.selected.delete(sku);
    renderSkuPickerRows();
  });
  $('#skuPickerConfirmBtn').addEventListener('click', () => {
    if (!pickerState.selected.size) return toast('请先勾选需要添加的 SKU');
    const existingSet = new Set(state.createSkus.map(s => s.sku));
    let addedCount = 0;
    pickerState.selected.forEach(sku => {
      if (existingSet.has(sku)) return;
      const item = SKU_POOL.find(p => p.sku === sku);
      if (item) {
        state.createSkus.push({ ...item, pickupWarehouse: normalizePickupAllocs(item.pickupWarehouse, item.planShipQty) });
        addedCount += 1;
      }
    });
    closeSkuPicker();
    renderCreateSkus();
    toast(`已添加 ${addedCount} 个 SKU`);
  });

  $('#createSkuBody').addEventListener('input', e => {
    const idx = Number(e.target.dataset.cskuIdx);
    const key = e.target.dataset.cskuKey;
    if (!Number.isNaN(idx) && key && state.createSkus[idx]) {
      const s = state.createSkus[idx];
      s[key] = key === 'planShipQty' ? Number(e.target.value) || 0 : e.target.value;
      if (key === 'planShipQty') {
        const cartonCell = document.querySelector(`[data-csku-cartons="${idx}"]`);
        if (cartonCell) cartonCell.textContent = Math.ceil((Number(s.planShipQty) || 0) / (Number(s.boxQty) || 1));
        const pwCell = document.querySelector(`[data-csku-pw-idx="${idx}"]`);
        if (pwCell) {
          const allocs = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty);
          const total = getPickupTotalQty(allocs);
          const planQty = Number(s.planShipQty) || 0;
          pwCell.classList.toggle('is-overlimit', allocs.length > 0 && ((planQty > 0 && total > planQty) || allocs.some(a => !(Number(a.qty) > 0))));
        }
        updateCreateStats();
      }
    }
  });
  $('#createSkuBody').addEventListener('change', e => {
    const idx = Number(e.target.dataset.cskuIdx);
    const key = e.target.dataset.cskuKey;
    if (!Number.isNaN(idx) && key && state.createSkus[idx]) {
      state.createSkus[idx][key] = e.target.value;
    }
  });
  $('#createSkuBody').addEventListener('click', e => {
    const pwDel = e.target.closest('[data-csku-pw-del]');
    if (pwDel) {
      e.stopPropagation();
      const idx = Number(pwDel.dataset.cskuPwDel);
      const val = pwDel.dataset.pwVal;
      const s = state.createSkus[idx];
      if (!s) return;
      s.pickupWarehouse = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty).filter(a => a.warehouse !== val);
      renderCreateSkus();
      return;
    }
    const pwOpen = e.target.closest('[data-csku-pw-idx]');
    if (pwOpen) {
      e.stopPropagation();
      const idx = Number(pwOpen.dataset.cskuPwIdx);
      const cell = pwOpen.closest('.spv2-pw-cell') || pwOpen;
      openPickupMgrPopover({ mode: 'create-row', cskuIdx: idx }, cell);
      return;
    }
    const del = e.target.closest('[data-csku-del]');
    if (!del) return;
    state.createSkus.splice(Number(del.dataset.cskuDel), 1);
    renderCreateSkus();
  });
  $('#createSubmitBtn').addEventListener('click', () => {
    if (!$('#cShipMethod').value || !$('#cShipWarehouse').value || !$('#cEstShipDate').value || !$('#cEstDays').value) {
      return toast('请填写所有带 * 的必填项');
    }
    if (!state.createSkus.length) return toast('请至少添加一条 SKU 明细');
    for (const s of state.createSkus) {
      const allocs = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty);
      if (!allocs.length) return toast(`请为 SKU ${s.sku} 选择提货仓`);
      if (allocs.some(a => !(Number(a.qty) > 0))) return toast(`请为 SKU ${s.sku} 的所有提货仓填写大于 0 的提货数量`);
      const total = getPickupTotalQty(allocs);
      const planQty = Number(s.planShipQty) || 0;
      if (total > planQty) {
        return toast(`SKU ${s.sku} 各提货仓提货数量合计(${total})不能大于计划发货数量(${planQty})`);
      }
    }
    const planOwner = ($('#cPlanOwner').textContent || 'Admin').trim();
    const shipWarehouse = $('#cShipWarehouse').value;
    const destWarehouse = $('#cDestWarehouse').value || 'ONT8-美西FBA仓';
    const shipMethod = $('#cShipMethod').value;
    const logistics = deriveLogisticsInfo(shipWarehouse, destWarehouse, shipMethod);
    const estArrivalDate = $('#cEstArrivalDate').value || addDays($('#cEstShipDate').value, $('#cEstDays').value);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    state.createSkus.forEach((s, idx) => {
      const newId = Math.max(0, ...rows.map(r => r.id)) + 1;
      const planNo = `YMX${now.slice(0, 10).replace(/-/g, '')}-${newId}`;
      const allocs = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty);
      const newRow = {
        id: newId, sku: s.sku, thumbColor: '#2563eb', thumbText: s.sku.slice(0, 2).toUpperCase(), linked: true,
        planNo, lingxingSku: s.lingxingSku, productName: s.productName, model: s.sku,
        cat1: '焊机', cat2: '常规', saleType: '常规', fnsku: s.fnsku || '-', sellerSku: s.sellerSku, asin: '-',
        store: s.store, platform: s.platform, country: s.country, team: s.team, teamOwner: '王方圆', opsOwner: s.opsOwner,
        planOwner, pickupWarehouse: allocs, shipWarehouse,
        destWarehouse, destType: '海外仓', shipMethod,
        provider: logistics.provider, providerSub: logistics.providerSub, channel: logistics.channel, boxNo: '',
        transportMode: logistics.transportMode, estDays: Number($('#cEstDays').value),
        estShipDate: $('#cEstShipDate').value, estArrivalDate,
        planShipQty: Number(s.planShipQty) || 1, remark: s.remark, estUnitPrice: 12.0,
        boxSpec: s.boxSpec, boxWeight: 15.0, boxQty: s.boxQty, supplierCode: s.supplierCode,
        planPurchaseQty: Number(s.planShipQty) || 1, planDeliveryDate: $('#cEstShipDate').value, demandGap: 0,
        suggestedOrderQty: Number(s.planShipQty) || 1, expectedDeliveryDate: estArrivalDate,
        platformInStock: 0, platformInTransit: 0, overseasInStock: 0, overseasPendingShip: 0, overseasInTransit: 0,
        localInStock: 50, localPendingShip: 0, poTotal: 0, poInTransit: 0, supplierInStock: 0, supplierInProd: 0,
        purchaseNo: '', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '',
        status: 'pending_confirm', createdAt: now, updatedAt: now, creator: 'Admin', _custom: true
      };
      rows.unshift(newRow);
      addLog(newId, '新建', `新建发货计划 ${planNo}（明细 #${idx + 1}）`);
    });
    closeCreateModal();
    publishV2PlansToBridge();
    applyFilter(false);
    toast(`成功新建 ${state.createSkus.length} 条发货计划`);
  });

  /* 列配置抽屉（对齐采购计划交互：单级平铺、搜索、锁定固定列、拖拽排序、恢复默认、持久化） */
  let draggedColKey = '';

  function renderColConfigDrawer() {
    const q = state.colSearch.trim().toLowerCase();
    const filteredDefs = COL_DEFS.filter(c => c.label.toLowerCase().includes(q));
    const draftSet = new Set(state.colDraftKeys);
    const checksEl = $('#colConfigChecks');
    const noneEl = $('#colConfigNone');

    checksEl.innerHTML = filteredDefs.map(c => `
      <label class="${c.locked ? 'locked' : ''}" title="${esc(c.label)}">
        <input type="checkbox" data-col-key="${esc(c.key)}" ${draftSet.has(c.key) ? 'checked' : ''} ${c.locked ? 'disabled' : ''}>
        <span>${esc(c.label)}</span>
      </label>
    `).join('');
    noneEl.classList.toggle('hidden', filteredDefs.length > 0);

    const defMap = new Map(COL_DEFS.map(c => [c.key, c]));
    const selectedDefs = state.colDraftKeys.map(k => defMap.get(k)).filter(Boolean);
    $('#colConfigSelectedCount').textContent = `(${selectedDefs.length})`;
    $('#colConfigSelectedList').innerHTML = selectedDefs.map((c, idx) => `
      <div class="spv2-col-selected-item ${c.locked ? 'locked' : ''}" data-drag-key="${esc(c.key)}" draggable="${c.locked ? 'false' : 'true'}" title="${esc(c.label)}">
        <span class="spv2-col-grip">${c.locked ? '·' : '⋮⋮'}</span>
        <span class="spv2-col-order">${idx + 1}</span>
        <span>${esc(c.label)}</span>
      </div>
    `).join('');
  }

  function openColConfigDrawer() {
    state.colDraftKeys = [...state.colKeys];
    state.colSearch = '';
    $('#colConfigSearch').value = '';
    renderColConfigDrawer();
    $('#colConfigMask').classList.remove('hidden');
    $('#colConfigDrawer').classList.remove('hidden');
  }

  function closeColConfigDrawer() {
    draggedColKey = '';
    $('#colConfigMask').classList.add('hidden');
    $('#colConfigDrawer').classList.add('hidden');
  }

  $('#colConfigBtn').addEventListener('click', openColConfigDrawer);
  $('#colConfigMask').addEventListener('click', closeColConfigDrawer);
  $('#colConfigCancelBtn').addEventListener('click', closeColConfigDrawer);
  $('#colConfigSearch').addEventListener('input', e => {
    state.colSearch = e.target.value;
    renderColConfigDrawer();
  });
  $('#colConfigChecks').addEventListener('change', e => {
    const cb = e.target;
    if (!cb || cb.type !== 'checkbox') return;
    const key = cb.dataset.colKey;
    const def = COL_DEFS.find(c => c.key === key);
    if (!def || def.locked) return;
    if (cb.checked && !state.colDraftKeys.includes(key)) {
      state.colDraftKeys.push(key);
    } else if (!cb.checked) {
      state.colDraftKeys = state.colDraftKeys.filter(k => k !== key);
    }
    renderColConfigDrawer();
  });

  const colSelectedList = $('#colConfigSelectedList');
  colSelectedList.addEventListener('dragstart', e => {
    const item = e.target.closest('.spv2-col-selected-item');
    if (!item || item.classList.contains('locked')) {
      e.preventDefault();
      return;
    }
    draggedColKey = item.dataset.dragKey || '';
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedColKey);
    }
  });
  colSelectedList.addEventListener('dragover', e => {
    e.preventDefault();
  });
  colSelectedList.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.spv2-col-selected-item');
    if (!target || target.classList.contains('locked')) return;
    const targetKey = target.dataset.dragKey || '';
    const sourceKey = draggedColKey || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : '');
    draggedColKey = '';
    if (!sourceKey || sourceKey === targetKey) return;
    if (!state.colDraftKeys.includes(sourceKey) || !state.colDraftKeys.includes(targetKey)) return;
    const next = state.colDraftKeys.filter(k => k !== sourceKey);
    next.splice(next.indexOf(targetKey), 0, sourceKey);
    state.colDraftKeys = next;
    renderColConfigDrawer();
  });

  $('#colConfigResetBtn').addEventListener('click', () => {
    state.colDraftKeys = [...DEFAULT_COL_KEYS];
    renderColConfigDrawer();
  });

  $('#colConfigSaveBtn').addEventListener('click', () => {
    state.colKeys = normalizeColKeys(state.colDraftKeys, false);
    try {
      localStorage.setItem(COL_STORAGE_KEY, JSON.stringify({ version: COL_CONFIG_VERSION, keys: state.colKeys }));
    } catch {}
    closeColConfigDrawer();
    renderTable();
    toast('列配置已应用');
  });

  /* 导入发货计划弹窗（复用提货单 UIKit 三步导入弹窗） */
  $('#importPlanBtn').addEventListener('click', () => {
    window.UIKit.openImportDialog({
      title: '导入发货计划',
      guideTitle: '第一步：使用发货计划标准模板整理数据',
      guideText: '请勿修改模板表头。支持 .xlsx、.xls、.csv 文件，单次仅导入一个文件，系统将自动校验 SKU、仓库与计划发货数量。',
      onDownload: () => toast('发货计划导入模板已下载'),
      onConfirm: (file, close) => {
        if (typeof close === 'function') close();
        toast(`已提交导入文件：${file.name}`);
      }
    });
  });

  /* 分页 */
  $('#pageSize').addEventListener('change', e => { state.pageSize = Number(e.target.value) || 25; state.page = 1; renderTable(); });
  $('#prevPage').addEventListener('click', () => { if (state.page > 1) { state.page -= 1; renderTable(); } });
  $('#nextPage').addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    if (state.page < totalPages) { state.page += 1; renderTable(); }
  });
  $('#pageButtons').addEventListener('click', e => {
    const btn = e.target.closest('[data-page]');
    if (!btn) return;
    state.page = Number(btn.dataset.page);
    renderTable();
  });
  $('#jumpPage').addEventListener('change', e => {
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    state.page = Math.min(totalPages, Math.max(1, Number(e.target.value) || 1));
    renderTable();
  });

  /* 初始化控件选项与首次渲染 */
  initMulti('pickupWarehouseMulti', '提货仓（可多选）', OPTIONS.pickupWarehouses);
  initMulti('shipWarehouseMulti', '发货仓（可多选）', OPTIONS.shipWarehouses);
  initMulti('destinationWarehouseMulti', '目的地仓（可多选）', OPTIONS.destWarehouses);
  initMulti('platformMulti', '平台（可多选）', OPTIONS.platforms);
  initMulti('countryMulti', '国家（可多选）', OPTIONS.countries);
  initMulti('storeMulti', '店铺（可多选）', OPTIONS.stores);
  initMulti('teamMulti', '团队（可多选）', OPTIONS.teams);

  /* FBA 货件跨页联动桥（localStorage） */
  const FBA_BRIDGE_KEY = 'dmp_fba_plan_v2_bridge';

  function readFbaBridge() {
    try {
      const raw = JSON.parse(localStorage.getItem(FBA_BRIDGE_KEY) || '{}');
      return {
        links: raw && typeof raw.links === 'object' && raw.links ? raw.links : {},
        shippingOrderLinks: raw && typeof raw.shippingOrderLinks === 'object' && raw.shippingOrderLinks ? raw.shippingOrderLinks : {},
        unlinkedPlans: Array.isArray(raw && raw.unlinkedPlans) ? raw.unlinkedPlans : [],
        v2PendingPlans: Array.isArray(raw && raw.v2PendingPlans) ? raw.v2PendingPlans : [],
        v2CustomPlans: Array.isArray(raw && raw.v2CustomPlans) ? raw.v2CustomPlans : [],
        v2Overrides: raw && typeof raw.v2Overrides === 'object' && raw.v2Overrides ? raw.v2Overrides : {}
      };
    } catch {
      return { links: {}, shippingOrderLinks: {}, unlinkedPlans: [], v2PendingPlans: [], v2CustomPlans: [], v2Overrides: {} };
    }
  }

  function applyFbaBridgeToV2Rows() {
    const bridge = readFbaBridge();
    bridge.v2CustomPlans.forEach(cp => {
      if (!rows.some(r => r.planNo === cp.planNo)) {
        rows.unshift({ ...cp, _custom: true });
        if (!logsByPlan.has(cp.id)) addLog(cp.id, '新建', `新建发货计划 ${cp.planNo}`);
      }
    });
    const unlinkedSet = new Set(bridge.unlinkedPlans);
    rows.forEach(r => {
      const ov = bridge.v2Overrides[r.planNo];
      if (ov && typeof ov === 'object') {
        if (ov.status) r.status = ov.status;
        if (ov.pickupWarehouse !== undefined) r.pickupWarehouse = normalizePickupAllocs(ov.pickupWarehouse, r.planShipQty);
        if (ov.updatedAt) r.updatedAt = ov.updatedAt;
      }
      r.pickupWarehouse = normalizePickupAllocs(r.pickupWarehouse, r.planShipQty);
      if (bridge.shippingOrderLinks && bridge.shippingOrderLinks[r.planNo] !== undefined) {
        r.shippingOrderNo = bridge.shippingOrderLinks[r.planNo];
      }
      if (unlinkedSet.has(r.planNo)) {
        r.fbaShipmentNo = '';
        r.fbaRefId = '';
        r.fbaLinkCount = 0;
        r.fbaLinkDeclaredQty = 0;
      }
      const link = bridge.links[r.planNo];
      if (link && link.shipmentNo) {
        r.fbaShipmentNo = link.shipmentNo;
        r.fbaRefId = link.shipmentName || '';
        r.fbaLinkCount = Number(link.shipmentCount || String(link.shipmentNo).split(/[、,，]+/).filter(Boolean).length || 1);
        r.fbaLinkDeclaredQty = Number(link.declaredTotal || 0);
      }
    });
  }

  function publishV2PlansToBridge() {
    const bridge = readFbaBridge();
    bridge.v2CustomPlans = rows.filter(r => r._custom);
    bridge.v2Overrides = {};
    rows.forEach(r => {
      bridge.v2Overrides[r.planNo] = {
        status: r.status,
        pickupWarehouse: r.pickupWarehouse,
        updatedAt: r.updatedAt
      };
    });
    bridge.v2PendingPlans = rows
      .filter(r => r.team === '亚马逊团队' && r.status === 'pending_ship' && !r.fbaShipmentNo)
      .map(r => ({
        id: `v2-plan-${r.id}`,
        plan: r.planNo,
        platform: 'Amazon',
        sku: r.sku,
        msku: r.sellerSku || r.sku,
        fnsku: r.fnsku || '-',
        product: r.productName,
        store: r.store,
        center: r.destWarehouse,
        status: '待发货',
        quantity: r.planShipQty,
        shipDate: r.estShipDate,
        arrivalDate: r.estArrivalDate,
        remark: r.remark || '',
        fromV2: true
      }));
    try {
      localStorage.setItem(FBA_BRIDGE_KEY, JSON.stringify(bridge));
    } catch {}
  }

  window.addEventListener('storage', e => {
    if (e.key === FBA_BRIDGE_KEY) {
      applyFbaBridgeToV2Rows();
      applyFilter(false);
    }
  });

  fillSelect($('#firstMileProvider'), OPTIONS.providers, '头程物流商');
  fillSelect($('#creatorSelect'), OPTIONS.creators, '创建人');
  fillSelect($('#cShipWarehouse'), OPTIONS.shipWarehouses, '请选择发货仓');
  fillSelect($('#cDestWarehouse'), OPTIONS.destWarehouses, '请选择目的地仓');

  applyFbaBridgeToV2Rows();
  publishV2PlansToBridge();
  layoutQueryItems();
  applyFilter(false);
})();
