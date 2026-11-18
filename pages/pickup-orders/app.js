(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NOW = '2026-11-17 15:20';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sum = (a, k) => a.reduce((n, x) => n + Number(x[k] || 0), 0);
  const split = v => String(v || '').trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean);

  const PLACEHOLDER_IMG = '../purchase-plan-2/product-placeholder.svg';
  const COPY_ICON = '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.2"/><path d="M8 4V2.6A1.6 1.6 0 0 0 6.4 1H2.6A1.6 1.6 0 0 0 1 2.6v3.8A1.6 1.6 0 0 0 2.6 8H4"/></svg>';
  const PENCIL_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9 2.1a1.5 1.5 0 0 1 2.1 2.1l-7.7 7.7-2.8.7.7-2.8 7.7-7.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m9.8 3.2 3 3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';

  const BRIDGE_KEY = 'dmp_fba_plan_v2_bridge';
  const PICKUP_STATE_VER = 7;
  const COL_STORAGE_KEY = 'pickup-order-column-config-v3';
  const readBridge = () => {
    try { return JSON.parse(localStorage.getItem(BRIDGE_KEY) || '{}') || {}; } catch { return {}; }
  };
  const writeBridge = d => {
    try { localStorage.setItem(BRIDGE_KEY, JSON.stringify(d)); } catch {}
  };

  const PICKUP_WAREHOUSES = [
    '常州市佳士精密工业有限公司仓库',
    '深圳市摩仕达焊接设备有限公司仓库',
    '坪山石井本地仓'
  ];
  const LEGACY_PICKUP_MAP = {
    '深圳坂田总仓': '深圳市摩仕达焊接设备有限公司仓库',
    '东莞清溪仓': '常州市佳士精密工业有限公司仓库',
    '义乌集货仓': '坪山石井本地仓',
    '900609': '深圳市摩仕达焊接设备有限公司仓库'
  };
  const normalizeWh = w => LEGACY_PICKUP_MAP[String(w || '').trim()] || String(w || '').trim();
  const TARGET_WAREHOUSES = ['跨跃猫物流仓'];
  const DEFAULT_TARGET = '跨跃猫物流仓';
  const TEAMS = ['亚马逊团队', 'Jasic团队', '欧洲运营组', '北美大件组', '刘绎天'];
  const STATUSES = ['全部', '草稿', '提货中', '部分入库', '已完成', '已作废'];
  const RECEIVE_ANOMALY_OPTIONS = [
    '正常到货',
    '供应商库存不足少发',
    '货不对板 / 错货退回待下批补发',
    '包装破损拒收'
  ];
  const NO_PLAN_SKU_CATALOG = [
    { sku: 'ARC-MIG200-US', lingxingSku: 'ARC-MIG200-US', name: '逆变焊机 MIG200（清库/凑重）', fnsku: 'X004MIG200', supplierSku: 'SUP-MIG-01', defaultWh: '深圳市摩仕达焊接设备有限公司仓库', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US' },
    { sku: 'ARC-TIG200-US', lingxingSku: 'ARC-TIG200-US', name: '氩弧焊机 TIG200（尾货清仓）', fnsku: 'X004TIG200', supplierSku: 'SUP-TIG-02', defaultWh: '常州市佳士精密工业有限公司仓库', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US' },
    { sku: 'DD123456', lingxingSku: 'LXSKU-360011', name: '测试-DD123456', fnsku: 'X00FN103', supplierSku: 'SUP-DD-01', defaultWh: '坪山石井本地仓', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US' },
    { sku: '153US0000024', lingxingSku: '153US0000024', name: '焊枪配件套装', fnsku: '—', supplierSku: 'SUP-153-24', defaultWh: '常州市佳士精密工业有限公司仓库', platform: '沃尔玛', store: 'WEM_Walmart_US', country: 'US' },
    { sku: '140US260008', lingxingSku: 'LXSKU-360008', name: '140US 焊接工具套装', fnsku: 'X00FN100', supplierSku: 'SUP-110700', defaultWh: '深圳市摩仕达焊接设备有限公司仓库', platform: '亚马逊', store: 'ARCCAP', country: 'US' },
    { sku: 'EE123456', lingxingSku: 'EE123456', name: '测试-EE123456', fnsku: '—', supplierSku: 'SUP-EE-04', defaultWh: '坪山石井本地仓', platform: 'Ozon', store: 'Ozon_Direct', country: 'RU' },
    { sku: '42101000004', lingxingSku: 'LXSKU-360009', name: '焊接防护手套', fnsku: '—', supplierSku: '—', defaultWh: '坪山石井本地仓', platform: 'eBay', store: 'Lowes_ar', country: 'US' }
  ];
  const DEFAULT_PO_CATALOG = [
    {
      midNo: 'PO2026727007',
      createdAt: '2026-08-12 10:20',
      status: '待收货',
      supplier: 'ARCCAP 供应商',
      items: [
        { id: 'line-12', sku: 'DD123456', team: 'Jasic团队', purchaseQty: 66, arrivedQty: 0, receiveQty: 0, transitQty: 66 },
        { id: 'line-13', sku: 'EE123456', team: 'eBay团队', purchaseQty: 100, arrivedQty: 0, receiveQty: 0, transitQty: 100 },
        { id: 'line-14', sku: 'FF123456', team: 'B端团队', purchaseQty: 2000, arrivedQty: 0, receiveQty: 0, transitQty: 2000 }
      ]
    },
    {
      midNo: 'PO2026111202',
      createdAt: '2026-11-12 10:30',
      status: '部分收货',
      supplier: 'JASIC 供应商',
      items: [
        { id: 'sync-line-1', sku: 'DD123456', team: '刘绎天', purchaseQty: 24, arrivedQty: 6, receiveQty: 6, transitQty: 18 },
        { id: 'sync-line-2', sku: '153US0000024', team: '北美大件组', purchaseQty: 30, arrivedQty: 0, receiveQty: 0, transitQty: 30 }
      ]
    },
    {
      midNo: 'PO2026111503',
      createdAt: '2026-11-15 14:15',
      status: '待收货',
      supplier: '摩仕达供应链',
      items: [
        { id: 'sync-line-3', sku: 'ARC-TIG200-US', team: '亚马逊团队', purchaseQty: 30, arrivedQty: 0, receiveQty: 0, transitQty: 30 },
        { id: 'sync-line-4', sku: 'ARC-MIG200-US', team: '亚马逊团队', purchaseQty: 40, arrivedQty: 0, receiveQty: 0, transitQty: 40 },
        { id: 'sync-line-5', sku: '140US260008', team: '亚马逊团队', purchaseQty: 50, arrivedQty: 0, receiveQty: 0, transitQty: 50 }
      ]
    }
  ];
  const SEED_ANOMALIES = [
    {
      id: 'ANM-2026111601',
      time: '2026-11-16 18:05',
      pickupNo: 'TH20261115004',
      batchNo: 'TH20261115004-01',
      sku: '153US0000031',
      targetTeam: '欧洲运营组',
      category: 'receive_diff',
      typeLabel: '签收少发异常',
      reason: '仓库签收原因：供应商库存不足少发（常州佳士仓实收 30 件，待补提 10 件）',
      qty: 10,
      isNoPlan: false,
      allocations: [],
      status: '待核对',
      handler: '跨跃猫陈仓管'
    }
  ];

  // 一级列定义（对齐采购计划：仅单据头字段，无固定列）
  const PARENT_DEFS = [
    { key: 'number', label: '提货单号', locked: true, tableClass: 'no-col' },
    { key: 'target', label: '目标入库仓', tableClass: 'target-col' },
    { key: 'planQtyTotal', label: '计划提货总量', tableClass: 'num-col', num: true },
    { key: 'receivedQtyTotal', label: '已入库总量', tableClass: 'num-col', num: true },
    { key: 'expectedDate', label: '预计提货日期', tableClass: 'date-col' },
    { key: 'remark', label: '备注', tableClass: 'remark-col' },
    { key: 'creator', label: '创建人', tableClass: 'creator-col' },
    { key: 'createdAt', label: '创建时间', tableClass: 'created-at-col' }
  ];

  // 二级列定义（前 3 列固定不参与滚动：发货计划号、SKU、领星 SKU；团队后新增运营负责人，计划提货数量后新增 SKU 总提货数量，国家后新增发货计划备注；目的仓来自关联发货单）
  const CHILD_DEFS = [
    { key: 'planNo', label: '发货计划号', locked: true, sticky: true, width: 210, tableClass: 'detail-plan-no', merged: true },
    { key: 'sku', label: 'SKU', locked: true, sticky: true, width: 150, tableClass: 'detail-sku', merged: true },
    { key: 'lingxingSku', label: '领星 SKU', locked: true, sticky: true, width: 150, tableClass: 'detail-lingxing-sku', merged: true },
    { key: 'productName', label: '品名', locked: true, width: 210, tableClass: 'detail-name', merged: true },
    { key: 'fnsku', label: 'FNSKU', width: 130, tableClass: 'detail-attr', merged: true },
    { key: 'supplierSku', label: '供应商料号', width: 135, tableClass: 'detail-attr', merged: true },
    { key: 'team', label: '团队', width: 120, tableClass: 'detail-team', merged: true },
    { key: 'opsOwner', label: '运营负责人', width: 112, tableClass: 'detail-attr', merged: true },
    { key: 'shipmentOrderNo', label: '关联发货单号', width: 155, tableClass: 'detail-dn', merged: true },
    { key: 'planShipQty', label: '计划发货数量', width: 108, tableClass: 'detail-ship-qty', num: true, merged: true },
    { key: 'pickupWarehouse', label: '提货仓', locked: true, width: 248, tableClass: 'detail-wh', merged: false },
    { key: 'planQty', label: '计划提货数量', locked: true, width: 106, tableClass: 'detail-qty', num: true, merged: false },
    { key: 'skuTotalQty', label: 'SKU 总提货数量', width: 124, tableClass: 'detail-qty', num: true, merged: true },
    { key: 'receivedQty', label: '已入库数量', width: 100, tableClass: 'detail-qty', num: true, merged: false },
    { key: 'diffQty', label: '待入库数量', width: 100, tableClass: 'detail-qty', num: true, merged: false },
    { key: 'platform', label: '平台', width: 98, tableClass: 'detail-attr', merged: true },
    { key: 'store', label: '店铺', width: 145, tableClass: 'detail-attr', merged: true },
    { key: 'country', label: '国家', width: 80, tableClass: 'detail-attr', merged: true },
    { key: 'planRemark', label: '发货计划备注', width: 190, tableClass: 'detail-attr', merged: true },
    { key: 'destWarehouse', label: '目的仓', width: 195, tableClass: 'detail-dest', merged: true }
  ];

  const colConfig = (() => {
    const defaults = { parent: PARENT_DEFS.map(c => c.key), child: CHILD_DEFS.map(c => c.key) };
    const normalize = (tab, keys) => {
      const defs = tab === 'parent' ? PARENT_DEFS : CHILD_DEFS;
      const available = defs.map(c => c.key);
      const valid = Array.isArray(keys) ? keys.filter((k, i) => available.includes(k) && keys.indexOf(k) === i) : [...available];
      const stickyLocked = defs.filter(c => c.sticky && c.locked).map(c => c.key);
      defs.filter(c => c.locked && !c.sticky && !valid.includes(c.key)).forEach(c => valid.push(c.key));
      return [...stickyLocked, ...valid.filter(k => !stickyLocked.includes(k))];
    };
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(COL_STORAGE_KEY) || '{}') || {}; } catch {}
    return {
      defaults,
      applied: { parent: normalize('parent', saved.parent), child: normalize('child', saved.child) },
      normalize,
      save() {
        try { localStorage.setItem(COL_STORAGE_KEY, JSON.stringify(this.applied)); } catch {}
      },
      visibleParent() { return this.applied.parent.map(k => PARENT_DEFS.find(c => c.key === k)).filter(Boolean); },
      visibleChild() { return this.applied.child.map(k => CHILD_DEFS.find(c => c.key === k)).filter(Boolean); }
    };
  })();

  const itemKey = (planNo, warehouse, sku) => `${planNo || 'NOPLAN'}::${normalizeWh(warehouse)}::${sku}`;
  const makeItem = ({
    planNo = '', isNoPlan = false, shipmentOrderNo = '', team, opsOwner = '—', pickupWarehouse = '深圳市摩仕达焊接设备有限公司仓库',
    sku, lingxingSku = sku, name, fnsku = '—', supplierSku = '—', planShipQty, planQty = 0, receivedQty = 0,
    platform = '亚马逊', store = 'ARCCAPTAIN_US', country = 'US', planRemark = '',
    destWarehouse = '', imageUrl = PLACEHOLDER_IMG, note = ''
  }) => {
    const cleanPlan = isNoPlan ? '' : String(planNo || '').trim();
    const noPlan = Boolean(isNoPlan || !cleanPlan);
    const cleanWh = normalizeWh(pickupWarehouse);
    const cleanTeam = noPlan ? String(team || '').trim() : (String(team || '').trim() || '亚马逊团队');
    return {
      key: itemKey(cleanPlan, cleanWh, sku),
      planNo: cleanPlan,
      isNoPlan: noPlan,
      shipmentOrderNo,
      team: cleanTeam,
      opsOwner: opsOwner || '—',
      pickupWarehouse: cleanWh,
      targetWarehouse: DEFAULT_TARGET,
      sku,
      lingxingSku: lingxingSku || sku,
      name,
      imageUrl: imageUrl || PLACEHOLDER_IMG,
      fnsku: fnsku || '—',
      supplierSku: supplierSku || '—',
      planShipQty: Number(planShipQty ?? planQty ?? 0),
      planQty: Number(planQty || 0),
      receivedQty: Number(receivedQty || 0),
      platform,
      store,
      country,
      planRemark: planRemark || (noPlan ? '无发货计划补提（清库/凑重）' : ''),
      destWarehouse: shipmentOrderNo ? (destWarehouse || '—') : '—',
      note
    };
  };

  const makeOrder = o => Object.assign({
    status: '草稿',
    target: DEFAULT_TARGET,
    carrier: '跨越猫头程车队',
    remark: '',
    expectedDate: '',
    completedAt: '—',
    creator: '系统自动',
    createdAt: NOW,
    items: [],
    batches: [],
    logs: []
  }, o);

  // 初始示范数据（全部使用 3 个规范提货仓，目标入库仓唯一为跨跃猫物流仓）
  const SEED_ORDERS = [
    makeOrder({
      id: 101,
      no: 'TH20261117001',
      status: '草稿',
      target: DEFAULT_TARGET,
      carrier: '摩仕达专车配送',
      expectedDate: '2026-11-18',
      creator: '系统自动',
      createdAt: '2026-11-17 09:30',
      remark: '多提货仓合提草稿示例（含 1 个计划 3 仓合提、2 仓合提与同 SKU 跨计划汇总）',
      items: [
        makeItem({ planNo: 'YMX20261117-18', shipmentOrderNo: 'DN20261117901', team: '亚马逊团队', opsOwner: '王方圆', pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', sku: 'ARC-TIG200-US', lingxingSku: 'ARC-TIG200-US', name: '氩弧焊机 TIG200', fnsku: 'X004TIG200', supplierSku: 'SUP-TIG-02', planShipQty: 30, planQty: 12, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '同一计划分 3 个前置仓合提至跨跃猫', destWarehouse: 'ONT8-美西FBA仓' }),
        makeItem({ planNo: 'YMX20261117-18', shipmentOrderNo: 'DN20261117901', team: '亚马逊团队', opsOwner: '王方圆', pickupWarehouse: '坪山石井本地仓', sku: 'ARC-TIG200-US', lingxingSku: 'ARC-TIG200-US', name: '氩弧焊机 TIG200', fnsku: 'X004TIG200', supplierSku: 'SUP-TIG-02', planShipQty: 30, planQty: 8, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '同一计划分 3 个前置仓合提至跨跃猫', destWarehouse: 'ONT8-美西FBA仓' }),
        makeItem({ planNo: 'YMX20261117-18', shipmentOrderNo: 'DN20261117901', team: '亚马逊团队', opsOwner: '王方圆', pickupWarehouse: '常州市佳士精密工业有限公司仓库', sku: 'ARC-TIG200-US', lingxingSku: 'ARC-TIG200-US', name: '氩弧焊机 TIG200', fnsku: 'X004TIG200', supplierSku: 'SUP-TIG-02', planShipQty: 30, planQty: 10, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '同一计划分 3 个前置仓合提至跨跃猫', destWarehouse: 'ONT8-美西FBA仓' }),
        makeItem({ planNo: 'YMX20261117-12', shipmentOrderNo: '', team: '亚马逊团队', opsOwner: '王方圆', pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', sku: 'ARC-MIG200-US', lingxingSku: 'ARC-MIG200-US', name: '逆变焊机 MIG200', fnsku: 'X004MIG200', supplierSku: 'SUP-MIG-01', planShipQty: 20, planQty: 12, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '2 仓分提备货批次', destWarehouse: '' }),
        makeItem({ planNo: 'YMX20261117-12', shipmentOrderNo: '', team: '亚马逊团队', opsOwner: '王方圆', pickupWarehouse: '坪山石井本地仓', sku: 'ARC-MIG200-US', lingxingSku: 'ARC-MIG200-US', name: '逆变焊机 MIG200', fnsku: 'X004MIG200', supplierSku: 'SUP-MIG-01', planShipQty: 20, planQty: 8, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '2 仓分提备货批次', destWarehouse: '' }),
        makeItem({ planNo: 'YMX20261105-10', shipmentOrderNo: '', team: '亚马逊团队', opsOwner: '王方圆', pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', sku: 'ARC-MIG200-US', lingxingSku: 'ARC-MIG200-US', name: '逆变焊机 MIG200', fnsku: 'X004MIG200', supplierSku: 'SUP-MIG-01', planShipQty: 20, planQty: 20, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: 'FBA按整箱建单少了2件，待复核确认', destWarehouse: '' })
      ],
      logs: [
        { type: '自动生成', content: '来源计划 YMX20261117-18（摩仕达12 + 坪山石井8 + 常州佳士10，共30件）自动创建草稿', operator: '系统自动', time: '2026-11-17 09:30' },
        { type: '自动合并', content: '来源计划 YMX20261117-12（摩仕达12 + 坪山石井8）及 YMX20261105-10（摩仕达20）自动并入当前草稿', operator: '系统自动', time: '2026-11-17 09:50' }
      ]
    }),
    makeOrder({
      id: 102,
      no: 'TH20261117002',
      status: '草稿',
      target: DEFAULT_TARGET,
      carrier: '佳士华东物流车',
      expectedDate: '2026-11-18',
      creator: '系统自动',
      createdAt: '2026-11-17 10:40',
      remark: '常州市佳士精密仓库待提草稿',
      items: [
        makeItem({ planNo: 'WEM20261105-11', shipmentOrderNo: '', team: '北美大件组', opsOwner: '陈晓', pickupWarehouse: '常州市佳士精密工业有限公司仓库', sku: '153US0000024', lingxingSku: '153US0000024', name: '焊枪配件套装', fnsku: '—', supplierSku: 'SUP-153-24', planShipQty: 30, planQty: 30, platform: '沃尔玛', store: 'WEM_Walmart_US', country: 'US', planRemark: '已确认待物流生成发货单', destWarehouse: '' })
      ],
      logs: [
        { type: '自动生成', content: '来源计划 WEM20261105-11（常州市佳士精密工业有限公司仓库 · 30件）自动创建草稿', operator: '系统自动', time: '2026-11-17 10:40' }
      ]
    }),
    makeOrder({
      id: 103,
      no: 'TH20261116003',
      status: '提货中',
      target: DEFAULT_TARGET,
      carrier: '宏达物流专车 · 粤B·8H2K9',
      expectedDate: '2026-11-17',
      creator: 'Admin',
      createdAt: '2026-11-16 14:20',
      remark: '一车跨坪山石井本地仓 + 摩仕达仓库多点提货',
      items: [
        makeItem({ planNo: 'YMX20261106-1', shipmentOrderNo: 'DN20260808001', team: '刘绎天', opsOwner: '毛粤风', pickupWarehouse: '坪山石井本地仓', sku: 'DD123456', lingxingSku: 'DD123456', name: '测试-DD123456', fnsku: '—', supplierSku: 'SUP-DD-01', planShipQty: 26, planQty: 16, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '旺季海外仓补货', destWarehouse: '跨跃猫美西一件代发仓 纽约仓' }),
        makeItem({ planNo: 'YMX20261106-1', shipmentOrderNo: 'DN20260808001', team: '刘绎天', opsOwner: '毛粤风', pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', sku: 'DD123456', lingxingSku: 'DD123456', name: '测试-DD123456', fnsku: '—', supplierSku: 'SUP-DD-01', planShipQty: 26, planQty: 10, platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', planRemark: '旺季海外仓补货', destWarehouse: '跨跃猫美西一件代发仓 纽约仓' })
      ],
      logs: [
        { type: '自动生成', content: '由发货计划 YMX20261106-1 两个提货仓合并创建草稿', operator: '系统自动', time: '2026-11-16 14:15' },
        { type: '提交', content: '提交提货单，进入「提货中」，已指派粤B·8H2K9前往 2 个提货仓揽货', operator: 'Admin', time: '2026-11-16 14:20' }
      ]
    }),
    makeOrder({
      id: 104,
      no: 'TH20261115004',
      status: '部分入库',
      target: DEFAULT_TARGET,
      carrier: '自有厢式货车 · 粤B·3D7L2',
      expectedDate: '2026-11-16',
      creator: '张敏',
      createdAt: '2026-11-15 11:00',
      remark: '多提货仓分批入库：坪山先到 12/14 件，常州仓 10 件在途待入',
      items: [
        makeItem({ planNo: 'WEM20261105-9', shipmentOrderNo: 'DN20260808004', team: '北美大件组', opsOwner: '毛粤风', pickupWarehouse: '坪山石井本地仓', sku: '153US0000031', lingxingSku: '153US0000031', name: '不锈钢焊丝', fnsku: '—', supplierSku: 'SUP-153-31', planShipQty: 24, planQty: 14, receivedQty: 12, platform: '沃尔玛', store: 'WEM_Walmart_US', country: 'US', planRemark: '发货单已发出，部分入库中', destWarehouse: '跨跃猫美西一件代发仓 纽约仓' }),
        makeItem({ planNo: 'WEM20261105-9', shipmentOrderNo: 'DN20260808004', team: '北美大件组', opsOwner: '毛粤风', pickupWarehouse: '常州市佳士精密工业有限公司仓库', sku: '153US0000031', lingxingSku: '153US0000031', name: '不锈钢焊丝', fnsku: '—', supplierSku: 'SUP-153-31', planShipQty: 24, planQty: 10, receivedQty: 0, platform: '沃尔玛', store: 'WEM_Walmart_US', country: 'US', planRemark: '发货单已发出，部分入库中', destWarehouse: '跨跃猫美西一件代发仓 纽约仓' })
      ],
      batches: [
        { no: 'TH20261115004-01', date: '2026-11-16 16:40', receiver: '跨跃猫陈仓管', qty: 12, remark: '第一批到仓签收', details: [{ planNo: 'WEM20261105-9', pickupWarehouse: '坪山石井本地仓', sku: '153US0000031', qty: 12 }] }
      ],
      logs: [
        { type: '提交', content: '提交进入「提货中」', operator: '张敏', time: '2026-11-15 11:05' },
        { type: '入库签收', content: '批次 TH20261115004-01 入库跨跃猫物流仓 12 件，单据进入「部分入库」', operator: '跨跃猫陈仓管', time: '2026-11-16 16:40' }
      ]
    }),
    makeOrder({
      id: 105,
      no: 'TH20261112005',
      status: '已完成',
      target: DEFAULT_TARGET,
      carrier: '顺丰零担专车',
      expectedDate: '2026-11-13',
      completedAt: '2026-11-13 17:10',
      creator: '李晨',
      createdAt: '2026-11-12 09:20',
      remark: '德国补货前置提货已完成入库',
      items: [
        makeItem({ planNo: 'WEM20261104-3', shipmentOrderNo: 'DN20260808002', team: '欧洲运营组', pickupWarehouse: '常州市佳士精密工业有限公司仓库', sku: 'FF123456', lingxingSku: 'FF123456', name: '测试-FF123456', fnsku: 'X003FF1234', supplierSku: 'SUP-FF-03', planShipQty: 60, planQty: 60, receivedQty: 60, platform: '亚马逊', store: 'ARCCAPTAIN_DE', country: 'DE', destWarehouse: 'DE-法兰克福海外仓' })
      ],
      batches: [
        { no: 'TH20261112005-01', date: '2026-11-13 17:10', receiver: '跨跃猫周主管', qty: 60, remark: '全额签收入库', details: [{ planNo: 'WEM20261104-3', pickupWarehouse: '常州市佳士精密工业有限公司仓库', sku: 'FF123456', qty: 60 }] }
      ],
      logs: [
        { type: '提交', content: '提交进入「提货中」', operator: '李晨', time: '2026-11-12 09:25' },
        { type: '入库签收', content: '全部签收入库跨跃猫物流仓 60 件，单据完成', operator: '跨跃猫周主管', time: '2026-11-13 17:10' }
      ]
    }),
    makeOrder({
      id: 106,
      no: 'TH20261110006',
      status: '已作废',
      target: DEFAULT_TARGET,
      carrier: '—',
      expectedDate: '2026-11-11',
      creator: 'Admin',
      createdAt: '2026-11-10 15:40',
      remark: '上游计划取消作废',
      items: [
        makeItem({ planNo: 'WEM20261104-2', shipmentOrderNo: '', team: 'Jasic团队', pickupWarehouse: '坪山石井本地仓', sku: 'EE123456', lingxingSku: 'EE123456', name: '测试-EE123456', fnsku: '—', supplierSku: 'SUP-EE-04', planShipQty: 24, planQty: 24, platform: 'Ozon', store: 'Ozon_Direct', country: 'RU', destWarehouse: 'UK-曼彻斯特海外仓' })
      ],
      logs: [
        { type: '创建', content: '创建提货单草稿', operator: 'Admin', time: '2026-11-10 15:40' },
        { type: '作废', content: '对应发货计划已取消，提货单作废', operator: 'Admin', time: '2026-11-10 16:00' }
      ]
    })
  ];

  let orders = [];
  let seq = 10;
  let totalAllocsByPlan = new Map();
  let pickupAnomalies = [];
  const state = { status: '全部', page: 1, pageSize: 10, expanded: new Set([101, 103]), selected: new Set(), queryExpanded: false, editingId: null, editingItems: [] };
  const statusClass = s => s === '草稿' ? 'draft' : s === '提货中' ? 'pending' : s === '部分入库' ? 'partial' : s === '已完成' ? 'done' : 'voided';

  const getAnomalies = () => pickupAnomalies;
  function updateAnomalyBadge() {
    const badge = $('#anomalyCountBadge');
    if (!badge) return;
    const pendingCount = pickupAnomalies.filter(a => a.status !== '已核对').length;
    badge.textContent = String(pendingCount);
    badge.hidden = pendingCount <= 0;
  }

  function ensurePoCatalog(bridge) {
    const existing = Array.isArray(bridge.purchaseOrderCatalog) && bridge.purchaseOrderCatalog.length
      ? JSON.parse(JSON.stringify(bridge.purchaseOrderCatalog))
      : [];
    const byNo = new Map(existing.map(po => [po.midNo, po]));
    DEFAULT_PO_CATALOG.forEach(seedPo => {
      if (!byNo.has(seedPo.midNo)) existing.push(JSON.parse(JSON.stringify(seedPo)));
    });
    return existing;
  }

  function runFifoPurchaseAutoInbound({ order, batchNo, date, receiver, picks, anomalyType, anomalyNote, bridge }) {
    const catalog = ensurePoCatalog(bridge);
    bridge.purchaseAutoInbound = Array.isArray(bridge.purchaseAutoInbound) ? bridge.purchaseAutoInbound : [];
    const activeStatuses = new Set(['待收货', '部分收货']);
    const timeStr = `${date} ${NOW.slice(11)}`;
    const summaryAllocs = [];
    let totalDeducted = 0;
    let totalCrossQty = 0;
    let totalUnmatchedQty = 0;

    picks.forEach(({ item, qty }) => {
      let remain = Number(qty || 0);
      const candidates = [];
      catalog.forEach(po => {
        if (!activeStatuses.has(po.status)) return;
        (po.items || []).forEach(line => {
          if (line.sku === item.sku && Number(line.transitQty || 0) > 0) {
            candidates.push({ po, line });
          }
        });
      });
      candidates.sort((a, b) => String(a.po.createdAt || '').localeCompare(String(b.po.createdAt || '')));

      const allocs = [];
      const deductFrom = (pool, crossTeam) => {
        pool.forEach(({ po, line }) => {
          if (remain <= 0) return;
          const avail = Number(line.transitQty || 0);
          if (avail <= 0) return;
          const take = Math.min(remain, avail);
          line.transitQty = avail - take;
          line.receiveQty = Number(line.receiveQty || 0) + take;
          line.arrivedQty = Math.max(Number(line.arrivedQty || 0), line.receiveQty);
          remain -= take;
          totalDeducted += take;
          if (crossTeam) totalCrossQty += take;
          const allReceived = (po.items || []).every(l => Number(l.transitQty || 0) <= 0);
          po.status = allReceived ? '已完成' : '部分收货';
          allocs.push({ poNo: po.midNo, poTeam: line.team || '未指定', createdAt: po.createdAt, qty: take, crossTeam });
          summaryAllocs.push({ sku: item.sku, poNo: po.midNo, poTeam: line.team || '未指定', qty: take, crossTeam });
        });
      };

      // 第一优先级：同团队 + 同 SKU 按最早创建时间 FIFO 依次入完
      deductFrom(candidates.filter(c => c.line.team === item.team), false);
      const sameTeamQty = allocs.reduce((n, a) => n + a.qty, 0);

      // 第二优先级（已确认方案A）：同团队找不到或不足时，去掉团队条件按全平台最早创建时间 FIFO 依次入完
      if (remain > 0) {
        deductFrom(candidates.filter(c => c.line.team !== item.team), true);
      }

      const crossTeamQty = allocs.filter(a => a.crossTeam).reduce((n, a) => n + a.qty, 0);
      const unmatchedQty = remain;
      totalUnmatchedQty += unmatchedQty;

      if (allocs.length) {
        bridge.purchaseAutoInbound.push({
          id: `PA-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          appliedToPo: false,
          pickupNo: order.no,
          batchNo,
          time: timeStr,
          receiver,
          sku: item.sku,
          targetTeam: item.team || '未指定',
          isNoPlan: Boolean(item.isNoPlan || !item.planNo),
          allocations: allocs
        });
      }

      if (crossTeamQty > 0) {
        const noSameTeam = sameTeamQty === 0;
        pickupAnomalies.unshift({
          id: `ANM-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          time: timeStr,
          pickupNo: order.no,
          batchNo,
          sku: item.sku,
          targetTeam: item.team || '未指定',
          category: 'auto_po_cross',
          typeLabel: noSameTeam ? '跨团队入库（无本团队单）' : '跨团队入库（本团队在途不足）',
          reason: noSameTeam
            ? `采购系统未找到「${item.team}」SKU ${item.sku} 的在途采购单，已按全平台最早在途采购单跨团队入库 ${crossTeamQty} 件`
            : `「${item.team}」在途仅够冲减 ${sameTeamQty} 件，剩余 ${crossTeamQty} 件已按全平台最早在途采购单跨团队借单入库`,
          qty: crossTeamQty,
          isNoPlan: Boolean(item.isNoPlan || !item.planNo),
          allocations: allocs,
          status: '待核对',
          handler: receiver
        });
      }

      if (unmatchedQty > 0) {
        pickupAnomalies.unshift({
          id: `ANM-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          time: timeStr,
          pickupNo: order.no,
          batchNo,
          sku: item.sku,
          targetTeam: item.team || '未指定',
          category: 'auto_po_lack',
          typeLabel: '全平台在途采购不足',
          reason: `SKU ${item.sku} 本次入库 ${qty} 件，全平台在途采购单冲减后仍盈余/未匹配 ${unmatchedQty} 件，请采购核对是否漏建采购单`,
          qty: unmatchedQty,
          isNoPlan: Boolean(item.isNoPlan || !item.planNo),
          allocations: allocs,
          status: '待核对',
          handler: receiver
        });
      }

      const itemShortage = Math.max(0, Number(item.planQty || 0) - Number(item.receivedQty || 0));
      if (anomalyType && anomalyType !== '正常到货') {
        pickupAnomalies.unshift({
          id: `ANM-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          time: timeStr,
          pickupNo: order.no,
          batchNo,
          sku: item.sku,
          targetTeam: item.team || '未指定',
          category: 'receive_diff',
          typeLabel: `签收异常｜${anomalyType}`,
          reason: `${anomalyNote ? `${anomalyNote}；` : ''}仓库签收标注「${anomalyType}」，本行累计入库 ${item.receivedQty}/${item.planQty}${itemShortage > 0 ? `（差 ${itemShortage} 件待补发或完结）` : ''}`,
          qty: itemShortage || qty,
          isNoPlan: Boolean(item.isNoPlan || !item.planNo),
          allocations: allocs,
          status: '待核对',
          handler: receiver
        });
      }
    });

    bridge.purchaseOrderCatalog = catalog;
    bridge.pickupAnomalies = JSON.parse(JSON.stringify(pickupAnomalies));
    return { totalDeducted, totalCrossQty, totalUnmatchedQty, summaryAllocs };
  }

  const orderWarehouses = o => [...new Set((o.items || []).map(i => i.pickupWarehouse).filter(Boolean))];
  const orderPlans = o => [...new Set((o.items || []).map(i => i.planNo).filter(Boolean))];
  const orderTeams = o => [...new Set((o.items || []).map(i => i.team).filter(Boolean))];
  const orderShipNos = o => [...new Set((o.items || []).map(i => i.shipmentOrderNo).filter(Boolean))];
  const nextNo = () => `TH20261117${String(++seq).padStart(3, '0')}`;

  function saveOrdersToBridge(handledKeysOverride) {
    const bridge = readBridge();
    const handled = new Set(Array.isArray(handledKeysOverride) ? handledKeysOverride : (bridge.pickupHandledKeys || []));
    orders.filter(o => o.status !== '已作废').forEach(o => (o.items || []).forEach(it => {
      if (it.planNo && it.pickupWarehouse && it.sku) handled.add(itemKey(it.planNo, it.pickupWarehouse, it.sku));
    }));
    bridge.pickupStateVer = PICKUP_STATE_VER;
    bridge.pickupOrdersState = JSON.parse(JSON.stringify(orders));
    bridge.pickupHandledKeys = [...handled];
    bridge.pickupOrderSeq = seq;
    bridge.pickupAnomalies = JSON.parse(JSON.stringify(pickupAnomalies));
    if (!Array.isArray(bridge.purchaseOrderCatalog) || !bridge.purchaseOrderCatalog.length) {
      bridge.purchaseOrderCatalog = ensurePoCatalog(bridge);
    }
    writeBridge(bridge);
    updateAnomalyBadge();
  }

  function syncWithV2Bridge() {
    const bridge = readBridge();
    if (bridge.pickupStateVer === PICKUP_STATE_VER && Array.isArray(bridge.pickupOrdersState) && bridge.pickupOrdersState.length) {
      orders = JSON.parse(JSON.stringify(bridge.pickupOrdersState));
      seq = Math.max(seq, Number(bridge.pickupOrderSeq || 10));
      pickupAnomalies = Array.isArray(bridge.pickupAnomalies) ? JSON.parse(JSON.stringify(bridge.pickupAnomalies)) : [];
    } else if (!orders.length) {
      orders = JSON.parse(JSON.stringify(SEED_ORDERS));
      pickupAnomalies = JSON.parse(JSON.stringify(SEED_ANOMALIES));
      seq = 10;
    }

    const handled = new Set();
    orders.filter(o => o.status !== '已作废').forEach(o => (o.items || []).forEach(it => {
      it.pickupWarehouse = normalizeWh(it.pickupWarehouse);
      it.isNoPlan = Boolean(it.isNoPlan || !it.planNo);
      it.key = itemKey(it.planNo, it.pickupWarehouse, it.sku);
      if (it.planNo && it.pickupWarehouse && it.sku) handled.add(it.key);
    }));

    const demands = Array.isArray(bridge.v2PickupDemands) ? bridge.v2PickupDemands : [];
    const shipLinks = bridge.shippingOrderLinks || {};
    const shipDestMap = bridge.shippingOrderDestMap || {};
    const demandByPlan = new Map(demands.map(d => [d.planNo, d]));
    totalAllocsByPlan = new Map(demands.map(d => [d.planNo, Array.isArray(d.allocs) ? d.allocs.length : 1]));

    let changed = false;
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        if (it.isNoPlan || !it.planNo) return;
        const d = demandByPlan.get(it.planNo);
        const latestDn = shipLinks[it.planNo] || d?.shippingOrderNo || '';
        if (latestDn && it.shipmentOrderNo !== latestDn) { it.shipmentOrderNo = latestDn; changed = true; }
        // 目的仓由关联发货单带过来（未生成发货单则为 '—'）
        const nextDest = it.shipmentOrderNo ? (shipDestMap[it.shipmentOrderNo] || (it.destWarehouse && it.destWarehouse !== '—' ? it.destWarehouse : '—')) : '—';
        if (it.destWarehouse !== nextDest) { it.destWarehouse = nextDest; changed = true; }
        if (d) {
          ['team', 'opsOwner', 'lingxingSku', 'platform', 'store', 'fnsku', 'country'].forEach(k => {
            if (d[k] && it[k] !== d[k]) { it[k] = d[k]; changed = true; }
          });
          if (d.planRemark !== undefined && it.planRemark !== d.planRemark) { it.planRemark = d.planRemark; changed = true; }
          if (d.supplierCode && it.supplierSku !== d.supplierCode) { it.supplierSku = d.supplierCode; changed = true; }
          if (d.planShipQty && it.planShipQty !== Number(d.planShipQty)) { it.planShipQty = Number(d.planShipQty); changed = true; }
        }
      });
    });

    const activeStatuses = new Set(['pending_fba_create', 'pending_review', 'pending_shipping_order', 'pending_ship']);
    demands.filter(d => !d.statusKey || activeStatuses.has(d.statusKey)).forEach(d => {
      const allocs = Array.isArray(d.allocs) && d.allocs.length ? d.allocs : [];
      allocs.forEach(a => {
        const wh = normalizeWh(a.warehouse), qty = Number(a.qty || 0);
        if (!wh || !PICKUP_WAREHOUSES.includes(wh) || qty <= 0) return;
        const k = itemKey(d.planNo, wh, d.sku);
        if (handled.has(k)) return;

        const draftsWithWh = orders.filter(o => o.status === '草稿' && (o.items || []).some(i => i.pickupWarehouse === wh));
        const pureDraft = draftsWithWh.find(o => orderWarehouses(o).length === 1);
        const targetDraft = pureDraft || draftsWithWh[0];

        const dn = shipLinks[d.planNo] || d.shippingOrderNo || '';
        const newItem = makeItem({
          planNo: d.planNo,
          shipmentOrderNo: dn,
          team: d.team || '亚马逊团队',
          opsOwner: d.opsOwner || '—',
          pickupWarehouse: wh,
          sku: d.sku,
          lingxingSku: d.lingxingSku || d.sku,
          name: d.productName || d.sku,
          fnsku: d.fnsku || '—',
          supplierSku: d.supplierCode || '—',
          planShipQty: d.planShipQty || qty,
          planQty: qty,
          platform: d.platform || '亚马逊',
          store: d.store || '—',
          country: d.country || 'US',
          planRemark: d.planRemark || '',
          destWarehouse: dn ? (shipDestMap[dn] || '—') : ''
        });

        if (targetDraft) {
          targetDraft.items.push(newItem);
          targetDraft.logs.unshift({
            type: '自动合并',
            content: `同提货仓计划 ${d.planNo}（${wh} · ${qty}件）自动并入当前草稿`,
            operator: '系统自动',
            time: NOW
          });
        } else {
          orders.unshift(makeOrder({
            id: Date.now() + Math.floor(Math.random() * 1000),
            no: nextNo(),
            status: '草稿',
            target: DEFAULT_TARGET,
            carrier: '待分配车队',
            creator: '系统自动',
            createdAt: NOW,
            remark: `由发货计划自动生成（${wh}）`,
            items: [newItem],
            logs: [{
              type: '自动生成',
              content: `来源计划 ${d.planNo}（${wh} · ${qty}件）自动创建提货单草稿，目标入库仓：${DEFAULT_TARGET}`,
              operator: '系统自动',
              time: NOW
            }]
          }));
        }
        handled.add(k);
        changed = true;
      });
    });

    if (changed || bridge.pickupStateVer !== PICKUP_STATE_VER) {
      saveOrdersToBridge([...handled]);
    }
  }

  function toast(msg) {
    const n = $('#toast');
    n.textContent = msg;
    n.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => n.classList.remove('show'), 2400);
  }
  function copyText(text, label) {
    try { navigator.clipboard?.writeText(String(text)); } catch {}
    toast(`已复制${label}：${text}`);
  }
  function modal(html, klass = 'modal-mask') {
    const mask = document.createElement('div');
    mask.className = klass + ' ui-dialog-mask';
    mask.innerHTML = html;
    document.body.append(mask);
    $$('[data-close]', mask).forEach(b => b.onclick = () => mask.remove());
    return mask;
  }

  function filtered() {
    const type = $('#codeType').value, keys = split($('#codeText').value), skuKeys = split($('#skuText').value);
    const source = $('#sourceWarehouseQuery').value, target = $('#targetWarehouseQuery').value;
    const creator = $('#creatorQuery').value, team = $('#teamQuery').value;
    const timeType = $('#timeType').value, start = $('#startDate').value, end = $('#endDate').value;
    return orders
      .filter(o => state.status === '全部' || o.status === state.status)
      .filter(o => !keys.length || keys.some(k => {
        const hay = type === 'no' ? o.no : type === 'planNo' ? orderPlans(o).join(' ') : type === 'shipNo' ? orderShipNos(o).join(' ') : (o.batches || []).map(b => b.no).join(' ');
        return String(hay).toLowerCase().includes(k);
      }))
      .filter(o => !skuKeys.length || o.items.some(i => skuKeys.some(k => `${i.sku} ${i.lingxingSku} ${i.name}`.toLowerCase().includes(k))))
      .filter(o => !source || o.items.some(i => i.pickupWarehouse === source))
      .filter(o => !target || o.target === target)
      .filter(o => !team || o.items.some(i => i.team === team))
      .filter(o => !creator || o.creator === creator)
      .filter(o => !start || String(o[timeType] || '').slice(0, 10) >= start)
      .filter(o => !end || String(o[timeType] || '').slice(0, 10) <= end);
  }

  function renderTabs() {
    const box = $('#statusTabs');
    box.innerHTML = STATUSES.map(s => `<button class="status-tab ${state.status === s ? 'active' : ''}" data-status="${s}">${s}<em>${s === '全部' ? orders.length : orders.filter(o => o.status === s).length}</em></button>`).join('');
    $$('[data-status]', box).forEach(b => b.onclick = () => { state.status = b.dataset.status; state.page = 1; render(); });
  }

  function buildPlanDetailRows(doc) {
    const groupsMap = new Map();
    (doc.items || []).forEach(it => {
      const key = it.planNo || it.key;
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key).push(it);
    });
    const out = [];
    groupsMap.forEach((itemsInPlan) => {
      const span = itemsInPlan.length;
      const planTotalAllocs = Math.max(span, Number(totalAllocsByPlan.get(itemsInPlan[0].planNo) || span));
      itemsInPlan.forEach((item, idx) => {
        out.push({ key: item.key, first: idx === 0, span, planTotalAllocs, item });
      });
    });
    return out;
  }

  function detailRowTemplate(doc, parentColCount) {
    const childCols = colConfig.visibleChild();
    const detailRows = buildPlanDetailRows(doc);
    // 统计本提货单内相同 SKU 的总提货数量（跨不同发货计划/提货仓）
    const skuTotals = new Map();
    (doc.items || []).forEach(it => {
      skuTotals.set(it.sku, (skuTotals.get(it.sku) || 0) + Number(it.planQty || 0));
    });
    // 二级仅前 3 列固定（发货计划号、SKU、领星 SKU）
    let leftOffset = 0;
    const stickyStyleByKey = {};
    let lastStickyKey = '';
    childCols.forEach(c => {
      if (c.sticky) {
        stickyStyleByKey[c.key] = leftOffset;
        leftOffset += c.width;
        lastStickyKey = c.key;
      }
    });

    const thHtml = childCols.map(c => {
      const cls = [c.tableClass || '', c.num ? 'num' : '', c.sticky ? 'is-sticky-col' : '', c.key === lastStickyKey ? 'is-sticky-last' : ''].filter(Boolean).join(' ');
      const st = c.sticky ? `style="left:${stickyStyleByKey[c.key]}px;width:${c.width}px"` : `style="width:${c.width}px"`;
      return `<th class="${cls}" ${st}>${esc(c.label)}</th>`;
    }).join('');

    const bodyHtml = detailRows.length ? detailRows.map(d => {
      const it = d.item;
      const diff = Math.max(0, Number(it.planQty || 0) - Number(it.receivedQty || 0));
      const cells = childCols.map(c => {
        if (c.merged && !d.first) return '';
        const spanAttr = c.merged ? ` rowspan="${d.span}"` : '';
        const cls = [c.tableClass || '', c.num ? 'num' : '', c.sticky ? 'is-sticky-col' : '', c.key === lastStickyKey ? 'is-sticky-last' : ''].filter(Boolean).join(' ');
        const st = c.sticky ? `style="left:${stickyStyleByKey[c.key]}px"` : '';
        let content = '';
        switch (c.key) {
          case 'planNo': {
            if (it.isNoPlan || !it.planNo) {
              content = '<span class="no-plan-tag" title="清库/凑重无计划追加提货">无计划补提</span>';
              break;
            }
            const badge = d.span > 1
              ? `<span class="multi-wh-tag">${d.span} 仓合提</span>`
              : d.planTotalAllocs > 1
                ? `<span class="split-wh-tag" title="该发货计划共分配 ${d.planTotalAllocs} 个提货仓，本单承担其中 1 仓">本单 1/${d.planTotalAllocs} 仓</span>`
                : '';
            content = `<b>${esc(it.planNo)}</b><button class="copy-icon-btn" type="button" data-copy="${esc(it.planNo)}" data-copy-label="发货计划号" title="复制发货计划号">${COPY_ICON}</button>${badge}`;
            break;
          }
          case 'sku':
            content = `${esc(it.sku)}<button class="copy-icon-btn" type="button" data-copy="${esc(it.sku)}" data-copy-label="SKU" title="复制 SKU">${COPY_ICON}</button>`;
            break;
          case 'lingxingSku':
            content = `${esc(it.lingxingSku || '—')}${it.lingxingSku ? `<button class="copy-icon-btn" type="button" data-copy="${esc(it.lingxingSku)}" data-copy-label="领星 SKU" title="复制领星 SKU">${COPY_ICON}</button>` : ''}`;
            break;
          case 'productName':
            content = `<div class="detail-product" title="${esc(it.name)}"><img class="detail-product__img" src="${esc(it.imageUrl || PLACEHOLDER_IMG)}" alt=""><span class="detail-product__name">${esc(it.name)}</span></div>`;
            break;
          case 'team':
            content = `<span class="team-tag">${esc(it.team || '待补全')}</span>`;
            break;
          case 'shipmentOrderNo':
            content = it.shipmentOrderNo ? `<span class="dn-tag">${esc(it.shipmentOrderNo)}</span>` : '<span class="dn-tag is-empty">待生成</span>';
            break;
          case 'planShipQty':
            content = Number(it.planShipQty || 0).toLocaleString();
            break;
          case 'pickupWarehouse':
            content = `<span class="wh-pill" title="${esc(it.pickupWarehouse)}">${esc(it.pickupWarehouse)}</span>`;
            break;
          case 'planQty':
            content = Number(it.planQty || 0).toLocaleString();
            break;
          case 'skuTotalQty':
            content = Number(skuTotals.get(it.sku) || it.planQty || 0).toLocaleString();
            break;
          case 'receivedQty':
            content = `<span class="${it.receivedQty > 0 ? 'qty-positive' : ''}">${Number(it.receivedQty || 0).toLocaleString()}</span>`;
            break;
          case 'diffQty':
            content = `<span class="${diff > 0 && doc.status !== '已完成' ? 'qty-diff' : ''}">${diff.toLocaleString()}</span>`;
            break;
          case 'planRemark':
            content = `<span title="${esc(it.planRemark || '—')}">${esc(it.planRemark || '—')}</span>`;
            break;
          case 'destWarehouse':
            content = esc(it.shipmentOrderNo ? (it.destWarehouse || '—') : '—');
            break;
          default:
            content = esc(it[c.key] || '—');
        }
        return `<td class="${cls}" ${st}${spanAttr}>${content}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('') : `<tr><td colspan="${childCols.length}" style="text-align:center;color:#909399;height:52px">暂无发货计划明细</td></tr>`;

    const totalPlanQty = sum(doc.items, 'planQty');
    const totalRecvQty = sum(doc.items, 'receivedQty');
    const totalDiffQty = Math.max(0, totalPlanQty - totalRecvQty);
    const planCount = orderPlans(doc).length;
    const noPlanCount = doc.items.filter(i => i.isNoPlan || !i.planNo).length;
    const tfootHtml = childCols.map((c, idx) => {
      const cls = [c.tableClass || '', c.num ? 'num' : '', c.sticky ? 'is-sticky-col' : '', c.key === lastStickyKey ? 'is-sticky-last' : ''].filter(Boolean).join(' ');
      const st = c.sticky ? `style="left:${stickyStyleByKey[c.key]}px"` : '';
      let val = '';
      if (idx === 0) val = `合计（${planCount} 计划${noPlanCount ? ` + ${noPlanCount} 无计划` : ''} / ${doc.items.length} 分仓）`;
      else if (c.key === 'planQty') val = totalPlanQty.toLocaleString();
      else if (c.key === 'receivedQty') val = totalRecvQty.toLocaleString();
      else if (c.key === 'diffQty') val = totalDiffQty.toLocaleString();
      return `<td class="${cls}" ${st}>${val}</td>`;
    }).join('');

    return `<tr class="detail-row"><td colspan="${parentColCount}"><div class="detail-wrap"><table class="pickup-detail-table"><thead><tr>${thHtml}</tr></thead><tbody>${bodyHtml}</tbody><tfoot><tr>${tfootHtml}</tr></tfoot></table></div></td></tr>`;
  }

  // 操作列：已去掉「查看」「提交」「作废」，保留编辑、入库签收、继续入库、手动完结、灰色日志
  function actions(o) {
    if (o.status === '草稿') {
      return '<button class="link" data-action="edit">编辑</button><button class="link log-link" data-action="log">日志</button>';
    }
    if (o.status === '提货中') {
      return '<button class="link" data-action="receive">入库签收</button><button class="link log-link" data-action="log">日志</button>';
    }
    if (o.status === '部分入库') {
      return '<button class="link" data-action="receive">继续入库</button><button class="link" data-action="complete">手动完结</button><button class="link log-link" data-action="log">日志</button>';
    }
    return '<button class="link log-link" data-action="log">日志</button>';
  }

  function updateBatchBtns() {
    const selectedOrders = [...state.selected].map(id => orders.find(o => o.id === id)).filter(Boolean);
    const submitBtn = $('#batchSubmitBtn');
    const voidBtn = $('#batchVoidBtn');

    if (submitBtn) {
      const canSubmit = selectedOrders.some(o => o.status === '草稿' && (o.items || []).length > 0);
      submitBtn.disabled = !canSubmit;
      submitBtn.title = canSubmit ? '将所选草稿提货单提交至「提货中」' : '请勾选至少 1 张「草稿」提货单';
    }
    if (voidBtn) {
      const canVoid = selectedOrders.some(o => o.status === '草稿' || (o.status === '提货中' && sum(o.items, 'receivedQty') === 0));
      voidBtn.disabled = !canVoid;
      voidBtn.title = canVoid ? '作废所选未入库提货单' : '请勾选「草稿」或未入库的「提货中」提货单';
    }
  }

  function render() {
    renderTabs();
    updateAnomalyBadge();
    const pCols = colConfig.visibleParent();
    const parentColCount = pCols.length + 3;

    $('#tableColgroup').innerHTML = `<col class="check-col"><col class="expand-col">${pCols.map(c => `<col class="${c.tableClass || ''}">`).join('')}<col class="action-col">`;
    $('#tableHead').innerHTML = `<tr><th><input id="selectAll" type="checkbox" aria-label="全选"></th><th><button class="document-expand expand-all" id="expandAllBtn" type="button" aria-label="展开/折叠全部"></button></th>${pCols.map(c => `<th class="${c.num ? 'num-col' : ''}">${esc(c.label)}</th>`).join('')}<th>操作</th></tr>`;

    const rows = filtered(), pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page, pages);
    const shown = rows.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);

    $('#tableBody').innerHTML = shown.map(o => {
      const planTotal = sum(o.items, 'planQty'), recvTotal = sum(o.items, 'receivedQty');
      const cells = pCols.map(c => {
        if (c.key === 'number') {
          return `<td><div class="doc-line"><button class="link doc-no" type="button" data-action="${o.status === '草稿' ? 'edit' : 'detail'}">${esc(o.no)}</button><button class="copy-icon-btn" type="button" data-copy="${esc(o.no)}" data-copy-label="提货单号" title="复制提货单号">${COPY_ICON}</button><span class="pp-status pp-status--${statusClass(o.status)}">${o.status}</span></div></td>`;
        }
        if (c.key === 'target') return `<td>${esc(o.target || DEFAULT_TARGET)}</td>`;
        if (c.key === 'planQtyTotal') return `<td class="num-col">${planTotal.toLocaleString()}</td>`;
        if (c.key === 'receivedQtyTotal') return `<td class="num-col">${recvTotal.toLocaleString()}</td>`;
        if (c.key === 'expectedDate') return `<td>${esc(o.expectedDate || '—')}</td>`;
        if (c.key === 'remark') {
          return `<td><div class="batch-remark"><span class="batch-remark__text" title="${esc(o.remark || '暂无备注')}">${esc(o.remark || '—')}</span><button class="batch-remark__edit" type="button" data-remark-id="${o.id}" title="编辑备注" aria-label="编辑备注">${PENCIL_ICON}</button></div></td>`;
        }
        if (c.key === 'creator') return `<td>${esc(o.creator || '—')}</td>`;
        if (c.key === 'createdAt') return `<td>${esc(o.createdAt || '—')}</td>`;
        return '<td>—</td>';
      }).join('');

      return `<tr class="parent-row ${state.expanded.has(o.id) ? 'is-expanded' : ''}" data-id="${o.id}">
        <td><input class="row-check" type="checkbox" ${state.selected.has(o.id) ? 'checked' : ''}></td>
        <td><button class="document-expand ${state.expanded.has(o.id) ? 'is-expanded' : ''}" data-action="expand" aria-label="展开明细"></button></td>
        ${cells}
        <td><div class="action-links">${actions(o)}</div></td>
      </tr>${state.expanded.has(o.id) ? detailRowTemplate(o, parentColCount) : ''}`;
    }).join('');

    const allPlanTotal = rows.reduce((n, o) => n + sum(o.items, 'planQty'), 0);
    const allRecvTotal = rows.reduce((n, o) => n + sum(o.items, 'receivedQty'), 0);
    const allDiffTotal = Math.max(0, allPlanTotal - allRecvTotal);
    const allDetailCount = rows.reduce((n, o) => n + (o.items || []).length, 0);
    $('#bottomSummary').innerHTML = `已选 <b>${state.selected.size}</b> 张 · 筛选 <b>${rows.length}</b> 张提货单 · <b>${allDetailCount}</b> 条分仓明细 · 计划提货 <b>${allPlanTotal.toLocaleString()}</b> · 已入库 <b>${allRecvTotal.toLocaleString()}</b> · 待入库 <b>${allDiffTotal.toLocaleString()}</b>`;

    $('#empty').hidden = rows.length > 0;
    $('#totalCount').textContent = rows.length;
    $('#pageButtons').innerHTML = `<button class="page-btn active">${state.page}</button>`;

    const expandAll = $('#expandAllBtn');
    if (expandAll) {
      const allExpanded = shown.length > 0 && shown.every(o => state.expanded.has(o.id));
      expandAll.disabled = !shown.length;
      expandAll.classList.toggle('is-expanded', allExpanded);
      expandAll.onclick = () => {
        if (!shown.length) return;
        shown.forEach(o => allExpanded ? state.expanded.delete(o.id) : state.expanded.add(o.id));
        render();
      };
    }
    const selectAll = $('#selectAll');
    if (selectAll) {
      const checkedCount = shown.filter(o => state.selected.has(o.id)).length;
      selectAll.checked = shown.length > 0 && checkedCount === shown.length;
      selectAll.indeterminate = checkedCount > 0 && checkedCount < shown.length;
      selectAll.onchange = e => {
        shown.forEach(o => e.target.checked ? state.selected.add(o.id) : state.selected.delete(o.id));
        render();
      };
    }
    updateBatchBtns();
    bindTableEvents();
  }

  function openRemarkPopover(orderId, anchorBtn) {
    $$('.remark-popover').forEach(el => el.remove());
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const pop = document.createElement('div');
    pop.className = 'remark-popover';
    pop.innerHTML = `<textarea maxlength="500" placeholder="请输入备注">${esc(o.remark || '')}</textarea><div class="remark-popover__actions"><button class="btn" type="button" data-pop-cancel>取消</button><button class="btn primary" type="button" data-pop-save>确定</button></div>`;
    document.body.append(pop);
    const rect = anchorBtn.getBoundingClientRect();
    pop.style.left = `${Math.max(12, Math.min(window.innerWidth - 332, rect.left))}px`;
    pop.style.top = `${Math.min(window.innerHeight - 150, rect.bottom + 6)}px`;
    $('[data-pop-cancel]', pop).onclick = () => pop.remove();
    $('[data-pop-save]', pop).onclick = () => {
      o.remark = $('textarea', pop).value.trim();
      saveOrdersToBridge();
      pop.remove();
      render();
      toast('备注已更新');
    };
  }

  function bindTableEvents() {
    $$('#tableBody > tr.parent-row[data-id]').forEach(tr => {
      const o = orders.find(x => x.id === Number(tr.dataset.id));
      const c = $('.row-check', tr);
      if (c) c.onchange = e => { e.target.checked ? state.selected.add(o.id) : state.selected.delete(o.id); render(); };
      $$('[data-action]', tr).forEach(b => b.onclick = () => handle(b.dataset.action, o));
    });
    $$('[data-copy]', $('#tableBody')).forEach(btn => {
      btn.onclick = e => { e.stopPropagation(); copyText(btn.dataset.copy, btn.dataset.copyLabel || ''); };
    });
    $$('[data-remark-id]', $('#tableBody')).forEach(btn => {
      btn.onclick = e => { e.stopPropagation(); openRemarkPopover(Number(btn.dataset.remarkId), btn); };
    });
  }

  function openColumnConfigDrawer() {
    let tab = 'parent';
    let search = '';
    const draft = { parent: [...colConfig.applied.parent], child: [...colConfig.applied.child] };
    let draggedKey = '';

    const mask = document.createElement('div');
    mask.className = 'col-drawer-mask';
    mask.innerHTML = `<section class="col-drawer"><header class="purchase-column-header"><div class="purchase-column-title">列配置</div><button class="purchase-column-close" type="button" data-close>×</button><div class="purchase-column-tabs"><button type="button" data-tab="parent" class="active">一级列表</button><button type="button" data-tab="child">二级列表</button></div></header><div class="purchase-column-content"><div class="purchase-column-options"><input class="purchase-column-search" id="colSearch" placeholder="搜索字段"><div class="purchase-column-checks" id="colChecks"></div></div><div class="purchase-column-selected"><div class="purchase-column-selected-title">已选 <span id="colSelCount"></span></div><p>拖动可调整非固定列顺序</p><div class="purchase-column-selected-list" id="colSelList"></div></div></div><footer class="purchase-column-footer"><button class="btn" type="button" id="colRestore">恢复默认</button><div><button class="btn" type="button" data-close>取消</button><button class="btn primary" type="button" id="colApply">保存并应用</button></div></footer></section>`;
    document.body.append(mask);

    const renderDrawer = () => {
      const defs = tab === 'parent' ? PARENT_DEFS : CHILD_DEFS;
      const list = draft[tab];
      const filteredDefs = defs.filter(d => d.label.toLowerCase().includes(search.toLowerCase()));
      $('#colChecks', mask).innerHTML = filteredDefs.length ? filteredDefs.map(d => `<label class="${d.locked ? 'locked' : ''}"><input type="checkbox" data-col-key="${d.key}" ${list.includes(d.key) ? 'checked' : ''} ${d.locked ? 'disabled' : ''}><span>${esc(d.label)}</span></label>`).join('') : '<div class="purchase-column-none">没有匹配的字段</div>';
      const selected = list.map(k => defs.find(d => d.key === k)).filter(Boolean);
      $('#colSelCount', mask).textContent = `(${selected.length})`;
      $('#colSelList', mask).innerHTML = selected.map((d, i) => `<div class="purchase-column-selected-item ${d.sticky && d.locked ? 'locked' : ''}" draggable="${!(d.sticky && d.locked)}" data-drag-key="${d.key}"><span class="purchase-column-grip">${d.sticky && d.locked ? '·' : '⋮⋮'}</span><span class="purchase-column-order">${i + 1}</span><span>${esc(d.label)}</span></div>`).join('');

      $$('[data-col-key]', mask).forEach(cb => cb.onchange = e => {
        const k = cb.dataset.colKey;
        if (e.target.checked && !draft[tab].includes(k)) draft[tab].push(k);
        if (!e.target.checked) draft[tab] = draft[tab].filter(x => x !== k);
        renderDrawer();
      });
      $$('[data-drag-key]', mask).forEach(el => {
        el.ondragstart = () => { draggedKey = el.dataset.dragKey; };
        el.ondragover = e => e.preventDefault();
        el.ondrop = e => {
          e.preventDefault();
          const targetKey = el.dataset.dragKey;
          const targetDef = defs.find(d => d.key === targetKey);
          if (!draggedKey || draggedKey === targetKey || (targetDef?.sticky && targetDef?.locked)) return;
          const arr = draft[tab].filter(x => x !== draggedKey);
          arr.splice(arr.indexOf(targetKey), 0, draggedKey);
          draft[tab] = arr;
          draggedKey = '';
          renderDrawer();
        };
      });
    };

    renderDrawer();
    $$('[data-close]', mask).forEach(b => b.onclick = () => mask.remove());
    $$('[data-tab]', mask).forEach(b => b.onclick = () => {
      $$('[data-tab]', mask).forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      tab = b.dataset.tab;
      search = '';
      $('#colSearch', mask).value = '';
      renderDrawer();
    });
    $('#colSearch', mask).oninput = e => { search = e.target.value.trim(); renderDrawer(); };
    $('#colRestore', mask).onclick = () => {
      draft.parent = [...colConfig.defaults.parent];
      draft.child = [...colConfig.defaults.child];
      renderDrawer();
    };
    $('#colApply', mask).onclick = () => {
      colConfig.applied.parent = colConfig.normalize('parent', draft.parent);
      colConfig.applied.child = colConfig.normalize('child', draft.child);
      colConfig.save();
      mask.remove();
      render();
      toast('列配置已应用');
    };
  }

  function itemsTable(items) {
    if (!items.length) {
      return '<div class="empty" style="padding:40px 0;color:#909399;text-align:center">暂未添加提货明细，可点击「引入发货计划」或「+ 追加无计划提货（清库/凑重）」添加明细</div>';
    }
    return `<table class="pickup-editor-table"><thead><tr><th>SKU</th><th style="width:200px">产品名称</th><th>发货计划号</th><th>关联发货单</th><th style="width:155px"><span style="color:#f56c6c">*</span> 团队（无计划必填）</th><th style="width:240px">提货仓</th><th>计划提货量</th><th>操作</th></tr></thead><tbody>${
      items.map((i, idx) => {
        const noPlan = Boolean(i.isNoPlan || !i.planNo);
        return `<tr data-idx="${idx}">
        <td>${esc(i.sku)}</td>
        <td class="product"><div class="detail-product"><img class="detail-product__img" src="${esc(i.imageUrl || PLACEHOLDER_IMG)}" alt=""><span class="detail-product__name">${esc(i.name)}</span></div></td>
        <td>${noPlan ? '<span class="no-plan-tag">无计划补提</span>' : `<b>${esc(i.planNo)}</b>`}</td>
        <td>${i.shipmentOrderNo ? `<span class="dn-tag">${esc(i.shipmentOrderNo)}</span>` : '—'}</td>
        <td><div class="editor-team-wrap">${noPlan ? '<span class="editor-team-req" title="无计划提货必须选择团队">*</span>' : ''}<select class="control editor-team ${!i.team ? 'is-missing' : ''}" data-idx="${idx}"><option value="" ${!i.team ? 'selected' : ''}>请选择团队（必填）</option>${TEAMS.map(t => `<option value="${t}" ${i.team === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div></td>
        <td><select class="control editor-wh" data-idx="${idx}">${PICKUP_WAREHOUSES.map(w => `<option ${i.pickupWarehouse === w ? 'selected' : ''}>${w}</option>`).join('')}</select></td>
        <td><div class="qty-cell"><input class="control editor-qty" type="number" min="1" value="${i.planQty}"></div></td>
        <td><button class="link remove" type="button">移除</button></td>
      </tr>`;
      }).join('')
    }</tbody></table>`;
  }

  function refreshEditorSummary(mask) {
    const items = state.editingItems;
    const plan = sum(items, 'planQty');
    const whs = [...new Set(items.map(i => i.pickupWarehouse))];
    const noPlanCount = items.filter(i => i.isNoPlan || !i.planNo).length;
    const el = $('.footer-summary', mask);
    if (el) el.innerHTML = `已选 <b>${items.length}</b> 条明细${noPlanCount ? `（含无计划补提 <b>${noPlanCount}</b> 条）` : ''} · 涉及提货仓 <b>${whs.length}</b> 个（${esc(whs.join('、') || '—')}） · 计划提货合计 <b>${plan}</b> 件`;
    const clearBtn = $('#clearItems', mask);
    if (clearBtn) clearBtn.disabled = !items.length;
    const wrap = $('.pickup-items-wrap', mask);
    if (wrap) {
      wrap.innerHTML = itemsTable(items);
      $$('.editor-qty', wrap).forEach((inp, n) => inp.oninput = e => {
        const v = Math.max(1, Math.round(Number(e.target.value) || 1));
        items[n].planQty = v;
        const plan2 = sum(items, 'planQty');
        const whs2 = [...new Set(items.map(i => i.pickupWarehouse))];
        if (el) el.innerHTML = `已选 <b>${items.length}</b> 条明细${noPlanCount ? `（含无计划补提 <b>${noPlanCount}</b> 条）` : ''} · 涉及提货仓 <b>${whs2.length}</b> 个（${esc(whs2.join('、') || '—')}） · 计划提货合计 <b>${plan2}</b> 件`;
      });
      $$('.editor-team', wrap).forEach(sel => sel.onchange = e => {
        const val = e.target.value;
        items[Number(sel.dataset.idx)].team = val;
        sel.classList.toggle('is-missing', !val);
      });
      $$('.editor-wh', wrap).forEach(sel => sel.onchange = e => {
        const idx = Number(sel.dataset.idx);
        items[idx].pickupWarehouse = e.target.value;
        items[idx].key = itemKey(items[idx].planNo, items[idx].pickupWarehouse, items[idx].sku);
        refreshEditorSummary(mask);
      });
      $$('.remove', wrap).forEach((b, n) => b.onclick = () => { items.splice(n, 1); refreshEditorSummary(mask); });
    }
  }

  function collectPlanCandidates() {
    const bridge = readBridge();
    const shipLinks = bridge.shippingOrderLinks || {};
    const shipDestMap = bridge.shippingOrderDestMap || {};
    const demands = Array.isArray(bridge.v2PickupDemands) && bridge.v2PickupDemands.length ? bridge.v2PickupDemands : [];
    const list = [];
    demands.forEach(d => {
      const allocs = Array.isArray(d.allocs) && d.allocs.length ? d.allocs : [];
      allocs.forEach(a => {
        const wh = normalizeWh(a.warehouse);
        if (!wh || !PICKUP_WAREHOUSES.includes(wh) || Number(a.qty || 0) <= 0) return;
        const dn = shipLinks[d.planNo] || d.shippingOrderNo || '';
        list.push({
          key: itemKey(d.planNo, wh, d.sku),
          planNo: d.planNo,
          shipmentOrderNo: dn,
          team: d.team || '亚马逊团队',
          opsOwner: d.opsOwner || '—',
          statusLabel: d.statusLabel || '待创建货件',
          pickupWarehouse: wh,
          sku: d.sku,
          lingxingSku: d.lingxingSku || d.sku,
          name: d.productName || d.sku,
          fnsku: d.fnsku || '—',
          supplierSku: d.supplierCode || '—',
          planShipQty: Number(d.planShipQty || a.qty),
          planQty: Number(a.qty),
          platform: d.platform || '亚马逊',
          store: d.store || '—',
          country: d.country || 'US',
          planRemark: d.planRemark || '',
          destWarehouse: dn ? (shipDestMap[dn] || '—') : ''
        });
      });
    });
    return list;
  }

  function openPlanPicker(parentMask) {
    const candidates = collectPlanCandidates();
    const chosen = new Set(state.editingItems.map(i => i.key));
    const mask = modal(`<section class="ui-dialog picker-dialog"><header class="ui-dialog__header"><div><h2>引入发货计划明细（支持多提货仓）</h2><p>按「发货计划 + 提货仓」勾选并加入当前提货单，实现多仓一车提货至「跨跃猫物流仓」</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<div class="picker-toolbar">
  <input class="control picker-search-input" id="pkSearch" placeholder="搜索计划号 / 发货单号 / SKU / 品名">
  <select class="control picker-team-select" id="pkWh"><option value="">全部提货仓</option>${PICKUP_WAREHOUSES.map(w => `<option>${w}</option>`).join('')}</select>
  <select class="control picker-team-select" id="pkTeam"><option value="">全部团队</option>${TEAMS.map(t => `<option>${t}</option>`).join('')}</select>
  <span class="picker-meta">目标入库仓：<b>${DEFAULT_TARGET}</b></span>
</div>
<div class="picker-table-wrap"><table class="picker-table"><thead><tr><th style="width:44px"><input type="checkbox" id="pkAll"></th><th>发货计划号</th><th>计划状态</th><th>关联发货单</th><th>团队</th><th>提货仓</th><th>SKU</th><th>产品名称</th><th>计划提货量</th></tr></thead><tbody id="pkBody"></tbody></table></div>
</div><footer class="ui-dialog__footer"><div class="footer-summary">已选 <b id="pkCount">0</b> 条明细</div><div class="footer-actions"><button class="btn" data-close>取消</button><button class="btn primary" id="pkConfirm">加入提货单</button></div></footer></section>`);

    const renderList = () => {
      const q = $('#pkSearch', mask).value.trim().toLowerCase();
      const wh = $('#pkWh', mask).value;
      const tm = $('#pkTeam', mask).value;
      const rows = candidates.filter(c =>
        (!wh || c.pickupWarehouse === wh) &&
        (!tm || c.team === tm) &&
        (!q || `${c.planNo} ${c.shipmentOrderNo} ${c.sku} ${c.name}`.toLowerCase().includes(q))
      );
      $('#pkBody', mask).innerHTML = rows.length ? rows.map(c => `<tr>
        <td><input type="checkbox" data-pk="${esc(c.key)}" ${chosen.has(c.key) ? 'checked' : ''}></td>
        <td><b>${esc(c.planNo)}</b></td>
        <td>${esc(c.statusLabel)}</td>
        <td>${c.shipmentOrderNo ? `<span class="dn-tag">${esc(c.shipmentOrderNo)}</span>` : '<span class="dn-tag is-empty">待生成</span>'}</td>
        <td><span class="team-tag">${esc(c.team)}</span></td>
        <td><span class="wh-pill">${esc(c.pickupWarehouse)}</span></td>
        <td>${esc(c.sku)}</td>
        <td class="product"><div class="detail-product"><img class="detail-product__img" src="${PLACEHOLDER_IMG}" alt=""><span class="detail-product__name">${esc(c.name)}</span></div></td>
        <td>${c.planQty}</td>
      </tr>`).join('') : '<tr><td colspan="9" style="text-align:center;color:#909399;padding:30px">暂无可引入的发货计划提货明细</td></tr>';
      $('#pkCount', mask).textContent = chosen.size;
      $$('[data-pk]', mask).forEach(cb => cb.onchange = e => {
        if (e.target.checked) chosen.add(cb.dataset.pk);
        else chosen.delete(cb.dataset.pk);
        $('#pkCount', mask).textContent = chosen.size;
      });
    };
    renderList();
    $('#pkSearch', mask).oninput = renderList;
    $('#pkWh', mask).onchange = renderList;
    $('#pkTeam', mask).onchange = renderList;
    $('#pkAll', mask).onchange = e => {
      $$('[data-pk]', mask).forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) chosen.add(cb.dataset.pk);
        else chosen.delete(cb.dataset.pk);
      });
      $('#pkCount', mask).textContent = chosen.size;
    };
    $('#pkConfirm', mask).onclick = () => {
      if (!chosen.size) return toast('请至少勾选一条发货计划提货明细');
      let added = 0;
      chosen.forEach(k => {
        if (state.editingItems.some(i => i.key === k)) return;
        const c = candidates.find(x => x.key === k);
        if (c) {
          state.editingItems.push(makeItem(c));
          added++;
        }
      });
      mask.remove();
      refreshEditorSummary(parentMask);
      toast(added ? `已引入 ${added} 条跨仓提货明细` : '所选明细已在当前提货单中');
    };
  }

  function openNoPlanPicker(parentMask) {
    const chosen = new Set();
    const mask = modal(`<section class="ui-dialog picker-dialog"><header class="ui-dialog__header"><div><h2>追加无计划提货（清库 / 凑重 / 呆滞尾货）</h2><p>允许整单无发货计划直接创建提货单；加入后【团队】字段为必填，用于入库签收时按团队优先 FIFO 自动冲减在途采购单</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<div class="picker-toolbar">
  <input class="control picker-search-input" id="npSearch" placeholder="搜索 SKU / 领星 SKU / 产品名称">
  <select class="control picker-team-select" id="npTeam"><option value="">团队：明细行逐行必填</option>${TEAMS.map(t => `<option value="${t}">${t}</option>`).join('')}</select>
  <select class="control picker-team-select" id="npWh" style="width:230px">${PICKUP_WAREHOUSES.map(w => `<option value="${w}">${w}</option>`).join('')}</select>
  <input class="control" id="npQty" type="number" min="1" value="10" style="width:92px" title="默认提货数量" placeholder="数量">
</div>
<div class="picker-table-wrap"><table class="picker-table"><thead><tr><th style="width:44px"><input type="checkbox" id="npAll"></th><th>SKU</th><th>领星 SKU</th><th>产品名称</th><th>FNSKU</th><th>供应商料号</th><th>默认平台/店铺</th></tr></thead><tbody id="npBody"></tbody></table></div>
</div><footer class="ui-dialog__footer"><div class="footer-summary">已选 <b id="npCount">0</b> 个无计划 SKU（加入后可微调提货仓、数量与必填团队）</div><div class="footer-actions"><button class="btn" data-close>取消</button><button class="btn primary" id="npConfirm">加入提货单</button></div></footer></section>`);

    const renderSkus = () => {
      const q = $('#npSearch', mask).value.trim().toLowerCase();
      const rows = NO_PLAN_SKU_CATALOG.filter(c => !q || `${c.sku} ${c.lingxingSku} ${c.name}`.toLowerCase().includes(q));
      $('#npBody', mask).innerHTML = rows.length ? rows.map(c => `<tr>
        <td><input type="checkbox" data-np="${esc(c.sku)}" ${chosen.has(c.sku) ? 'checked' : ''}></td>
        <td><b>${esc(c.sku)}</b></td>
        <td>${esc(c.lingxingSku)}</td>
        <td class="product"><div class="detail-product"><img class="detail-product__img" src="${PLACEHOLDER_IMG}" alt=""><span class="detail-product__name">${esc(c.name)}</span></div></td>
        <td>${esc(c.fnsku)}</td>
        <td>${esc(c.supplierSku)}</td>
        <td>${esc(c.platform)} / ${esc(c.store)}</td>
      </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:#909399;padding:30px">未找到匹配 SKU</td></tr>';
      $('#npCount', mask).textContent = chosen.size;
      $$('[data-np]', mask).forEach(cb => cb.onchange = e => {
        if (e.target.checked) chosen.add(cb.dataset.np);
        else chosen.delete(cb.dataset.np);
        $('#npCount', mask).textContent = chosen.size;
      });
    };
    renderSkus();
    $('#npSearch', mask).oninput = renderSkus;
    $('#npAll', mask).onchange = e => {
      $$('[data-np]', mask).forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) chosen.add(cb.dataset.np);
        else chosen.delete(cb.dataset.np);
      });
      $('#npCount', mask).textContent = chosen.size;
    };
    $('#npConfirm', mask).onclick = () => {
      if (!chosen.size) return toast('请至少勾选 1 个 SKU');
      const team = $('#npTeam', mask).value;
      const wh = $('#npWh', mask).value || PICKUP_WAREHOUSES[0];
      const qty = Math.max(1, Math.round(Number($('#npQty', mask).value) || 10));
      let added = 0;
      chosen.forEach(sku => {
        const meta = NO_PLAN_SKU_CATALOG.find(x => x.sku === sku);
        if (!meta) return;
        const k = itemKey('', wh, sku);
        if (state.editingItems.some(i => i.key === k)) return;
        state.editingItems.push(makeItem({
          planNo: '',
          isNoPlan: true,
          team,
          opsOwner: '—',
          pickupWarehouse: wh,
          sku: meta.sku,
          lingxingSku: meta.lingxingSku,
          name: meta.name,
          fnsku: meta.fnsku,
          supplierSku: meta.supplierSku,
          planShipQty: 0,
          planQty: qty,
          platform: meta.platform,
          store: meta.store,
          country: meta.country,
          planRemark: '无发货计划补提（清库/凑重）'
        }));
        added++;
      });
      mask.remove();
      refreshEditorSummary(parentMask);
      toast(added ? `已追加 ${added} 条无计划补提明细${team ? '' : '，请在列表中选择必填【团队】'}` : '所选 SKU+提货仓 已在当前明细中');
    };
  }

  function openEditor(row) {
    state.editingId = row ? row.id : null;
    state.editingItems = row ? row.items.map(i => ({ ...i })) : [];
    const mask = modal(`<section class="ui-dialog pickup-dialog"><header class="ui-dialog__header"><div><h2>${row ? '编辑' : '新建'}提货单</h2><p>支持同一提货单从多个提货仓揽货，也支持整单无发货计划纯清库/凑重提货</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<section class="ui-form-card pickup-form-card"><div class="ui-form-grid pickup-form-grid">
<label class="ui-field"><span class="ui-field__label"><em class="ui-field__required">*</em>目标入库仓</span><select class="control" id="fTarget">${TARGET_WAREHOUSES.map(w => `<option value="${w}" selected>${w}</option>`).join('')}</select></label>
<label class="ui-field"><span class="ui-field__label"><em class="ui-field__required">*</em>预计提货日期</span><input class="control" id="fExpected" type="date" value="${row ? (row.expectedDate || '2026-11-18') : '2026-11-18'}"></label>
<label class="ui-field"><span class="ui-field__label">承运车队 / 司机信息</span><input class="control" id="fCarrier" value="${esc(row ? row.carrier : '')}" placeholder="如：跨越猫专车 / 车牌"></label>
<label class="ui-field ui-field--wide" style="grid-column:span 3"><span class="ui-field__label">备注</span><input class="control" id="fRemark" maxlength="200" value="${esc(row ? row.remark : '')}" placeholder="最多 200 字"></label>
</div></section>
<section class="pickup-items-card"><div class="pickup-items-toolbar"><strong>提货明细（多提货仓 / 无计划补提）</strong><button class="btn primary" id="pickPlans" type="button">引入发货计划（支持多提货仓）</button><button class="btn" id="pickNoPlanBtn" type="button">+ 追加无计划提货（清库/凑重）</button><button class="btn" id="clearItems" type="button">清空</button></div><div class="pickup-hint">说明：允许整张提货单完全不含发货计划（纯清库/凑重）；「无计划补提」明细的【团队】字段为必填项，用于入库签收后按团队优先 FIFO 自动冲减采购单在途。</div><div class="pickup-items-wrap">${itemsTable(state.editingItems)}</div></section>
</div><footer class="ui-dialog__footer"><div class="footer-summary"></div><div class="footer-actions"><button class="btn" data-close>取消</button><button class="btn" id="saveDraft">保存草稿</button><button class="btn primary" id="submitOrder">提交（进入提货中）</button></div></footer></section>`);

    $('#pickPlans', mask).onclick = () => openPlanPicker(mask);
    $('#pickNoPlanBtn', mask).onclick = () => openNoPlanPicker(mask);
    $('#clearItems', mask).onclick = () => { state.editingItems = []; refreshEditorSummary(mask); toast('已清空明细'); };
    refreshEditorSummary(mask);

    const validateForm = () => {
      const target = $('#fTarget', mask).value || DEFAULT_TARGET;
      const expected = $('#fExpected', mask).value;
      const carrier = $('#fCarrier', mask).value.trim() || '待分配车队';
      const remark = $('#fRemark', mask).value.trim();
      if (!expected) { toast('请选择预计提货日期'); return null; }
      if (!state.editingItems.length) { toast('请至少添加 1 条发货计划明细或无计划补提明细'); return null; }
      const badIdx = state.editingItems.findIndex(i => !String(i.team || '').trim());
      if (badIdx !== -1) {
        const badSel = $(`.editor-team[data-idx="${badIdx}"]`, mask);
        if (badSel) {
          badSel.classList.add('is-missing');
          badSel.focus();
        }
        toast('无计划补提明细必须选择【团队】后才能保存或提交');
        return null;
      }
      if (state.editingItems.some(i => Number(i.planQty || 0) <= 0)) { toast('计划提货量必须大于 0'); return null; }
      return { target, expected, carrier, remark };
    };
    const save = (status, validated) => {
      const form = validated || validateForm();
      if (!form) return;
      const { target, expected, carrier, remark } = form;

      const items = state.editingItems.map(i => makeItem(i));
      if (state.editingId) {
        const o = orders.find(x => x.id === state.editingId);
        Object.assign(o, { target, expectedDate: expected, carrier, remark, items });
        if (status === '提货中') o.status = '提货中';
        o.logs.unshift({ type: status === '提货中' ? '提交' : '编辑', content: `更新提货明细 ${items.length} 条（${orderWarehouses(o).join('、')}），共 ${sum(items, 'planQty')} 件${status === '提货中' ? '，进入「提货中」' : ''}`, operator: 'Admin', time: NOW });
        toast(status === '提货中' ? '提货单已提交，进入「提货中」' : '草稿已保存');
      } else {
        const newOrder = makeOrder({
          id: Date.now(),
          no: nextNo(),
          status,
          target,
          expectedDate: expected,
          carrier,
          remark,
          creator: 'Admin',
          createdAt: NOW,
          items,
          logs: [{ type: status === '提货中' ? '提交' : '创建', content: `${status === '提货中' ? '创建并提交进入「提货中」' : '创建草稿'}，涉及 ${orderWarehouses({ items }).join('、')} 共 ${sum(items, 'planQty')} 件`, operator: 'Admin', time: NOW }]
        });
        orders.unshift(newOrder);
        toast(status === '提货中' ? '提货单已提交，进入「提货中」' : '草稿已保存');
      }
      saveOrdersToBridge();
      mask.remove();
      state.page = 1;
      render();
    };
    $('#saveDraft', mask).onclick = () => save('草稿');
    $('#submitOrder', mask).onclick = () => {
      const form = validateForm();
      if (!form) return;
      const items = state.editingItems.map(i => makeItem(i));
      const whText = orderWarehouses({ items }).join('、') || '—';
      confirmAction({
        title: '提交提货单确认',
        message: '确认提交当前提货单并进入「提货中」吗？',
        subMessage: `涉及提货仓：${whText}，共 ${items.length} 条明细、${sum(items, 'planQty')} 件货物。提交后将不可按草稿编辑。`,
        type: 'warning',
        confirmText: '确认提交',
        confirmType: 'primary',
        onConfirm: () => save('提货中', form)
      });
    };
  }

  function openReceive(o) {
    const planTotal = sum(o.items, 'planQty');
    const receivedTotal = sum(o.items, 'receivedQty');
    const remainTotal = Math.max(0, planTotal - receivedTotal);
    const selectableItems = o.items.filter(i => Number(i.receivedQty || 0) < Number(i.planQty || 0));
    if (!selectableItems.length) return toast('该提货单已全部入库完成');

    const mask = modal(`<section class="ui-dialog receive-dialog">
<header class="ui-dialog__header"><div><h2>入库签收｜${esc(o.no)}</h2><p>确认到货入库「${esc(o.target || DEFAULT_TARGET)}」实收数量，支持跨多提货仓分批或一次性签收完成</p></div><button class="ui-dialog__close" data-close>×</button></header>
<div class="ui-dialog__body">
  <div class="pickup-summary receive-summary">
    <div class="pickup-summary-item"><span class="label">单据状态</span><span class="pp-status pp-status--${statusClass(o.status)}">${esc(o.status)}</span></div>
    <div class="pickup-summary-item"><span class="label">目标入库仓</span><b>${esc(o.target || DEFAULT_TARGET)}</b></div>
    <div class="pickup-summary-item"><span class="label">明细数</span><b>${o.items.length}</b></div>
    <div class="pickup-summary-item"><span class="label">计划提货</span><b>${planTotal}</b></div>
    <div class="pickup-summary-item"><span class="label">累计入库</span><b>${receivedTotal}</b></div>
    <div class="pickup-summary-item"><span class="label">剩余可入</span><b>${remainTotal}</b></div>
  </div>
  <div class="receive-toolbar">
    <div><b>提货入库明细</b><span class="muted">　仅勾选并填写本次入库数量</span></div>
    <button class="btn" id="fillRemainBtn" type="button">按剩余可入数量填充</button>
  </div>
  <div class="receive-table-card">
    <table class="receive-table">
      <thead><tr>
        <th style="width:44px"><input type="checkbox" id="receiveSelectAll" checked></th>
        <th style="width:140px">SKU</th>
        <th style="width:220px;text-align:left">产品名称</th>
        <th style="width:135px">发货计划号</th>
        <th style="width:170px">提货仓</th>
        <th style="width:80px">计划提货</th>
        <th style="width:80px">累计入库</th>
        <th style="width:80px">剩余可入</th>
        <th style="width:90px">入库差异</th>
        <th style="width:140px"><span style="color:#f56c6c">*</span> 本次入库数量</th>
      </tr></thead>
      <tbody>${
        o.items.map(i => {
          const planQty = Number(i.planQty || 0);
          const recQty = Number(i.receivedQty || 0);
          const rem = Math.max(0, planQty - recQty);
          const disabled = rem <= 0;
          const initDiff = (recQty + rem) - planQty;
          return `<tr data-key="${esc(i.key)}" data-rem="${rem}" data-plan="${planQty}" data-rec="${recQty}">
            <td><input type="checkbox" class="receive-row-check" ${disabled ? 'disabled' : 'checked'}></td>
            <td><b>${esc(i.sku)}</b></td>
            <td class="product"><div class="detail-product"><img class="detail-product__img" src="${esc(i.imageUrl || PLACEHOLDER_IMG)}" alt=""><span class="detail-product__name" title="${esc(i.name)}">${esc(i.name)}</span></div></td>
            <td>${i.isNoPlan || !i.planNo ? '<span class="no-plan-tag">无计划补提</span>' : esc(i.planNo)}</td>
            <td><span class="wh-pill">${esc(i.pickupWarehouse)}</span></td>
            <td>${planQty}</td>
            <td>${recQty}</td>
            <td><span class="${rem === 0 ? 'muted' : ''}">${rem}</span></td>
            <td><span class="receive-diff-cell ${initDiff < 0 ? 'qty-diff' : ''}">${initDiff}</span></td>
            <td><input class="receive-qty-input" type="number" min="1" max="${rem}" value="${rem}" ${disabled ? 'disabled' : ''}></td>
          </tr>`;
        }).join('')
      }</tbody>
    </table>
  </div>
  <div class="receive-meta-card">
    <div class="receive-meta-grid">
      <label class="ui-field"><span class="ui-field__label">签收日期</span><input class="control" id="rDate" type="date" value="2026-11-17"></label>
      <label class="ui-field"><span class="ui-field__label">仓管签收人</span><input class="control" id="rReceiver" value="跨跃猫仓管"></label>
      <label class="ui-field"><span class="ui-field__label">入库备注</span><input class="control" id="rRemark" placeholder="选填"></label>
    </div>
    <div class="receive-anomaly-grid">
      <label class="ui-field"><span class="ui-field__label">签收异常原因</span><select class="control" id="rAnomalyType">${RECEIVE_ANOMALY_OPTIONS.map(t => `<option value="${t}">${t}</option>`).join('')}</select></label>
      <label class="ui-field"><span class="ui-field__label">异常 / 到货差异说明</span><input class="control" id="rAnomalyNote" placeholder="如：供应商少发 / 错货退回待下批补发等（正常到货可留空）"></label>
    </div>
    <label class="receive-close-check"><input type="checkbox" id="rCloseDirectly"> <span>若本次未收满，仍确认尾差不再补提，本次签收后直接流转至「已完成」</span></label>
  </div>
</div>
<footer class="ui-dialog__footer">
  <div class="pickup-footer">
    <div class="pickup-result" id="receiveFooterStats"></div>
    <div class="pickup-footer-actions"><button class="btn" data-close>取消</button><button class="btn primary" id="confirmReceive">确认入库签收</button></div>
  </div>
</footer></section>`);

    const syncRowState = tr => {
      const cb = $('.receive-row-check', tr);
      const input = $('.receive-qty-input', tr);
      const rem = Number(tr.dataset.rem || 0);
      const checked = cb && cb.checked && !cb.disabled;
      input.disabled = !checked;
      if (!checked) input.value = '';
      else if (input.value === '' || Number(input.value) <= 0) input.value = rem;
    };

    const refreshReceiveSummary = () => {
      let selectedCount = 0;
      let batchQty = 0;
      const rows = $$('tbody tr', mask);
      const enabledRows = rows.filter(tr => !$('.receive-row-check', tr).disabled);
      enabledRows.forEach(tr => {
        const cb = $('.receive-row-check', tr);
        const input = $('.receive-qty-input', tr);
        const plan = Number(tr.dataset.plan || 0);
        const rec = Number(tr.dataset.rec || 0);
        const val = cb.checked ? (Number(input.value) || 0) : 0;
        if (cb.checked) {
          selectedCount += 1;
          batchQty += Math.max(0, val);
        }
        const diff = (rec + val) - plan;
        const diffEl = $('.receive-diff-cell', tr);
        if (diffEl) {
          diffEl.textContent = String(diff);
          diffEl.className = `receive-diff-cell ${diff < 0 ? 'qty-diff' : ''}`;
        }
      });
      const selectAll = $('#receiveSelectAll', mask);
      if (selectAll) {
        selectAll.checked = enabledRows.length > 0 && enabledRows.every(tr => $('.receive-row-check', tr).checked);
        selectAll.indeterminate = enabledRows.some(tr => $('.receive-row-check', tr).checked) && !selectAll.checked;
      }
      const afterRemain = Math.max(0, remainTotal - batchQty);
      const forceComplete = $('#rCloseDirectly', mask).checked;
      let nextStatus = o.status;
      let tagCls = 'is-idle';
      if (batchQty > 0) {
        if (forceComplete || afterRemain === 0) { nextStatus = '已完成'; tagCls = 'is-done'; }
        else { nextStatus = '部分入库'; tagCls = 'is-partial'; }
      }
      const statsEl = $('#receiveFooterStats', mask);
      if (statsEl) {
        statsEl.innerHTML = `已选 <b>${selectedCount}</b> 条　·　本次入库 <b>${batchQty}</b>　·　入库后剩余 <b>${afterRemain}</b>　·　提交后状态 <span class="pickup-next-tag ${tagCls}">${esc(nextStatus)}</span>`;
      }
    };

    $('#receiveSelectAll', mask).onchange = e => {
      $$('.receive-row-check', mask).forEach(cb => {
        if (!cb.disabled) {
          cb.checked = e.target.checked;
          syncRowState(cb.closest('tr'));
        }
      });
      refreshReceiveSummary();
    };
    $$('.receive-row-check', mask).forEach(cb => cb.onchange = () => {
      syncRowState(cb.closest('tr'));
      refreshReceiveSummary();
    });
    $$('.receive-qty-input', mask).forEach(input => input.oninput = refreshReceiveSummary);
    $('#rCloseDirectly', mask).onchange = refreshReceiveSummary;
    $('#fillRemainBtn', mask).onclick = () => {
      $$('tbody tr', mask).forEach(tr => {
        const cb = $('.receive-row-check', tr);
        const input = $('.receive-qty-input', tr);
        if (!cb.disabled) {
          cb.checked = true;
          input.disabled = false;
          input.value = tr.dataset.rem;
        }
      });
      refreshReceiveSummary();
      toast('已按剩余可入数量填充');
    };
    refreshReceiveSummary();

    $('#confirmReceive', mask).onclick = () => {
      const picks = [];
      for (const tr of $$('tbody tr', mask)) {
        const cb = $('.receive-row-check', tr);
        if (!cb.checked) continue;
        const item = o.items.find(x => x.key === tr.dataset.key);
        const rem = Math.max(0, item.planQty - item.receivedQty);
        const v = Number($('.receive-qty-input', tr).value);
        if (!Number.isInteger(v) || v <= 0 || v > rem) return toast(`${item.sku}（${item.pickupWarehouse}）本次入库数量需为 1~${rem} 的整数`);
        picks.push({ item, qty: v });
      }
      if (!picks.length) return toast('请至少勾选 1 条明细并填写本次入库数量');
      const date = $('#rDate', mask).value || '2026-11-17';
      const receiver = $('#rReceiver', mask).value.trim() || '仓管员';
      const remark = $('#rRemark', mask).value.trim() || '到仓签收';
      const anomalyType = $('#rAnomalyType', mask).value || '正常到货';
      const anomalyNote = $('#rAnomalyNote', mask).value.trim();
      const forceComplete = $('#rCloseDirectly', mask).checked;
      const totalQty = picks.reduce((n, p) => n + p.qty, 0);
      const nextStatus = (forceComplete || (remainTotal - totalQty) <= 0) ? '已完成' : '部分入库';

      confirmAction({
        title: '入库签收确认',
        message: `确认将提货单 ${o.no} 本次入库 ${totalQty} 件收入「${o.target || DEFAULT_TARGET}」吗？`,
        subMessage: `本次签收涉及 ${picks.length} 条明细，确认后将按「同团队优先 FIFO → 全平台最早采购单兜底」自动冲减采购单在途并流转为「${nextStatus}」。`,
        type: 'warning',
        confirmText: '确认入库',
        confirmType: 'primary',
        onConfirm: () => {
          const batchNo = `${o.no}-${String((o.batches || []).length + 1).padStart(2, '0')}`;
          const bridge = readBridge();
          bridge.warehouseStockAdds = bridge.warehouseStockAdds || {};
          const details = [];
          picks.forEach(({ item, qty }) => {
            item.receivedQty = Number(item.receivedQty || 0) + qty;
            const sk = `${o.target || DEFAULT_TARGET}::${item.sku}`;
            bridge.warehouseStockAdds[sk] = Number(bridge.warehouseStockAdds[sk] || 0) + qty;
            details.push({ planNo: item.planNo || '无计划补提', pickupWarehouse: item.pickupWarehouse, sku: item.sku, qty });
          });

          const autoRes = runFifoPurchaseAutoInbound({ order: o, batchNo, date, receiver, picks, anomalyType, anomalyNote, bridge });
          writeBridge(bridge);

          const poAllocText = autoRes.summaryAllocs.length
            ? autoRes.summaryAllocs.map(a => `${a.poNo}(${a.poTeam}${a.crossTeam ? '·跨团队' : ''} ${a.qty}件)`).join('、')
            : '无在途采购单可冲减';

          o.batches.unshift({ no: batchNo, date: `${date} ${NOW.slice(11)}`, receiver, qty: totalQty, remark: anomalyType !== '正常到货' ? `${remark}｜${anomalyType}` : remark, details, poAllocations: autoRes.summaryAllocs });
          const allDone = forceComplete || o.items.every(i => i.receivedQty >= i.planQty);
          o.status = allDone ? '已完成' : '部分入库';
          if (allDone) o.completedAt = `${date} ${NOW.slice(11)}`;
          o.logs.unshift({
            type: '入库签收',
            content: `批次 ${batchNo} 入库「${o.target || DEFAULT_TARGET}」${totalQty} 件，自动冲减采购单：${poAllocText}${autoRes.totalUnmatchedQty > 0 ? `，未匹配在途 ${autoRes.totalUnmatchedQty} 件` : ''}${anomalyType !== '正常到货' ? `；签收异常：${anomalyType}` : ''}，状态转为「${o.status}」`,
            operator: receiver,
            time: `${date} ${NOW.slice(11)}`
          });
          saveOrdersToBridge();
          mask.remove();
          render();
          toast(
            autoRes.totalCrossQty > 0 || autoRes.totalUnmatchedQty > 0 || anomalyType !== '正常到货'
              ? `已入库 ${totalQty} 件并自动冲减采购 ${autoRes.totalDeducted} 件（已生成异常记录）`
              : `已签收入库 ${totalQty} 件并自动冲减采购单在途 ${autoRes.totalDeducted} 件`
          );
        }
      });
    };
  }

  function openDetail(o) {
    const plan = sum(o.items, 'planQty'), received = sum(o.items, 'receivedQty');
    const batchRows = o.batches.length
      ? o.batches.map(b => `<tr><td>${esc(b.no)}</td><td>${esc(b.date)}</td><td>${esc(b.receiver)}</td><td>${b.qty}</td><td>${esc(b.remark || '—')}</td></tr>`).join('')
      : '<tr><td colspan="5" style="text-align:center;color:#909399">暂无入库签收记录</td></tr>';
    modal(`<section class="ui-dialog detail-dialog"><header class="ui-dialog__header"><div><h2>提货单详情</h2><p>${esc(o.no)}</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<div class="detail-grid">${[
      ['提货单号', o.no],
      ['单据状态', o.status],
      ['提货仓（多选汇总）', orderWarehouses(o).join('、') || '—'],
      ['目标入库仓', o.target || DEFAULT_TARGET],
      ['关联团队', orderTeams(o).join('、') || '—'],
      ['关联发货计划', orderPlans(o).join('、') || '—'],
      ['关联发货单号', orderShipNos(o).join('、') || '待生成'],
      ['计划 / 已入库', `${plan} / ${received} 件（差异 ${Math.max(0, plan - received)}）`],
      ['承运信息', o.carrier || '—'],
      ['预计提货日期', o.expectedDate || '—'],
      ['创建信息', `${o.creator} / ${o.createdAt}`],
      ['完成时间', o.completedAt || '—']
    ].map(([l, v]) => `<div class="detail-field"><label>${l}</label><span>${esc(v)}</span></div>`).join('')}
<div class="detail-field wide"><label>备注</label><span>${esc(o.remark || '—')}</span></div></div>
<section class="detail-section"><div class="detail-section-title">提货明细（发货计划明细）</div><div class="ui-table-wrap">${detailRowTemplate(o, 1).replace(/^<tr class="detail-row"><td colspan="1"><div class="detail-wrap">/, '').replace(/<\/div><\/td><\/tr>$/, '')}</div></section>
<section class="detail-section"><div class="detail-section-title">入库签收批次（${o.batches.length}）</div><div class="ui-table-wrap"><table class="pickup-detail-table" style="min-width:680px"><thead><tr><th>批次号</th><th>入库时间</th><th>签收人</th><th>入库数量</th><th>备注</th></tr></thead><tbody>${batchRows}</tbody></table></div></section>
</div><footer class="ui-dialog__footer"><div class="footer-summary">共 ${orderPlans(o).length} 条发货计划，${o.items.length} 条分仓提货明细</div><div class="footer-actions"><button class="btn" data-close>关闭</button></div></footer></section>`);
  }

  function openLog(o) {
    modal(`<div class="transfer-log-dialog"><header class="transfer-log-header"><div><h2>操作日志</h2><span>提货单：${esc(o.no)}</span></div><button class="transfer-log-close" data-close>×</button></header><div class="transfer-log-body"><div class="transfer-log-table-card"><table class="transfer-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>${o.logs.map(l => `<tr><td>${esc(l.type)}</td><td class="transfer-log-content">${esc(l.content)}</td><td>${esc(l.operator)}</td><td>${esc(l.time)}</td></tr>`).join('')}</tbody></table></div></div><footer class="transfer-log-footer"><span>共 ${o.logs.length} 条</span><div><button class="transfer-log-page" disabled>‹</button><button class="transfer-log-page active">1</button><button class="transfer-log-page" disabled>›</button></div></footer></div>`, 'transfer-log-modal');
  }

  function openAnomalyModal() {
    let tabStatus = '全部';
    let catFilter = '';
    let keyword = '';
    const mask = modal(`<section class="ui-dialog anomaly-dialog">
<header class="ui-dialog__header"><div><h2>提货入库异常记录</h2><p>汇总入库签收触发的「跨团队自动借单冲减」「全平台在途不足」「仓库少发/错货/破损签收差异」，供采购与供应链集中核对</p></div><button class="ui-dialog__close" data-close>×</button></header>
<div class="ui-dialog__body">
  <div class="pickup-summary anomaly-summary" id="anmSummary"></div>
  <div class="anomaly-toolbar">
    <div class="anomaly-tabs" id="anmTabs">
      <button type="button" class="anomaly-tab active" data-anm-status="全部">全部</button>
      <button type="button" class="anomaly-tab" data-anm-status="待核对">待核对</button>
      <button type="button" class="anomaly-tab" data-anm-status="已核对">已核对</button>
    </div>
    <div class="anomaly-filters">
      <select class="control" id="anmCat">
        <option value="">全部异常类型</option>
        <option value="auto_po_cross">跨团队借单入库</option>
        <option value="auto_po_lack">全平台在途不足</option>
        <option value="receive_diff">仓库签收差异</option>
      </select>
      <input class="control" id="anmSearch" style="width:240px" placeholder="搜索提货单号 / SKU / 采购单号 / 团队">
    </div>
  </div>
  <div class="anomaly-table-card">
    <table class="anomaly-table">
      <thead><tr>
        <th style="width:155px">异常时间 / 提货单</th>
        <th style="width:150px">SKU / 目标团队</th>
        <th style="width:165px">异常类型</th>
        <th>异常说明与自动冲减采购单明细</th>
        <th style="width:90px">核对状态</th>
        <th style="width:128px">操作</th>
      </tr></thead>
      <tbody id="anmBody"></tbody>
    </table>
  </div>
</div>
<footer class="ui-dialog__footer"><div class="footer-summary" id="anmFooterNote"></div><div class="footer-actions"><button class="btn" id="anmMarkAllBtn" type="button">当前待核对全部标为已核对</button><button class="btn primary" data-close>关闭</button></div></footer>
</section>`);

    const renderBody = () => {
      const list = getAnomalies();
      const pending = list.filter(a => a.status !== '已核对').length;
      const cross = list.filter(a => a.category === 'auto_po_cross').length;
      const lackOrDiff = list.filter(a => a.category !== 'auto_po_cross').length;
      $('#anmSummary', mask).innerHTML = [
        ['异常记录总数', list.length],
        ['待核对异常', `<span style="color:#f56c6c">${pending}</span>`],
        ['跨团队借单入库', cross],
        ['在途不足 / 签收差异', lackOrDiff]
      ].map(([l, v]) => `<div class="pickup-summary-item"><span class="label">${l}</span><b>${v}</b></div>`).join('');

      const rows = list.filter(a => {
        if (tabStatus !== '全部' && (a.status || '待核对') !== tabStatus) return false;
        if (catFilter && a.category !== catFilter) return false;
        if (keyword) {
          const hay = `${a.pickupNo} ${a.batchNo} ${a.sku} ${a.targetTeam} ${a.reason} ${(a.allocations || []).map(x => x.poNo).join(' ')}`.toLowerCase();
          if (!hay.includes(keyword)) return false;
        }
        return true;
      });

      $('#anmBody', mask).innerHTML = rows.length ? rows.map(a => {
        const typeCls = a.category === 'auto_po_cross' ? 'is-cross' : a.category === 'auto_po_lack' ? 'is-lack' : 'is-diff';
        const isDone = a.status === '已核对';
        const allocHtml = (a.allocations || []).length
          ? `<div class="po-alloc-list">${a.allocations.map(al => `<span class="po-alloc-chip ${al.crossTeam ? 'is-cross' : ''}">${esc(al.poNo)} · ${esc(al.poTeam)}${al.crossTeam ? '（跨团队）' : ''}：-${al.qty} 在途</span>`).join('')}</div>`
          : '';
        return `<tr>
          <td><div><b>${esc(a.pickupNo)}</b>${a.isNoPlan ? ' <span class="no-plan-tag">无计划</span>' : ''}</div><div style="color:#909399;font-size:11px;margin-top:2px">${esc(a.batchNo || '—')} · ${esc(a.time)}</div></td>
          <td><div><b>${esc(a.sku)}</b></div><div style="margin-top:3px"><span class="team-tag">${esc(a.targetTeam)}</span></div></td>
          <td><span class="anomaly-type-tag ${typeCls}">${esc(a.typeLabel)}</span></td>
          <td><div>${esc(a.reason)}</div>${allocHtml}</td>
          <td><span class="anomaly-status-pill ${isDone ? 'is-resolved' : 'is-pending'}">${isDone ? '已核对' : '待核对'}</span></td>
          <td><button class="link" type="button" data-toggle-anm="${esc(a.id)}">${isDone ? '恢复待核对' : '标记已核对'}</button> <button class="link" type="button" data-view-pickup="${esc(a.pickupNo)}">查看提货单</button></td>
        </tr>`;
      }).join('') : '<tr><td colspan="6" style="text-align:center;color:#909399;padding:40px">暂无符合筛选条件的异常记录</td></tr>';

      $('#anmFooterNote', mask).innerHTML = `共展示 <b>${rows.length}</b> 条异常记录 · 待核对 <b>${pending}</b> 条`;
      $('#anmMarkAllBtn', mask).disabled = pending === 0;

      $$('[data-toggle-anm]', mask).forEach(btn => btn.onclick = () => {
        const rec = pickupAnomalies.find(x => x.id === btn.dataset.toggleAnm);
        if (!rec) return;
        rec.status = rec.status === '已核对' ? '待核对' : '已核对';
        saveOrdersToBridge();
        renderBody();
        toast(rec.status === '已核对' ? '已标记为「已核对」' : '已恢复为「待核对」');
      });
      $$('[data-view-pickup]', mask).forEach(btn => btn.onclick = () => {
        const ord = orders.find(o => o.no === btn.dataset.viewPickup);
        if (!ord) return toast('未找到对应提货单');
        mask.remove();
        openDetail(ord);
      });
    };

    $$('[data-anm-status]', mask).forEach(tab => tab.onclick = () => {
      tabStatus = tab.dataset.anmStatus;
      $$('[data-anm-status]', mask).forEach(t => t.classList.toggle('active', t === tab));
      renderBody();
    });
    $('#anmCat', mask).onchange = e => { catFilter = e.target.value; renderBody(); };
    $('#anmSearch', mask).oninput = e => { keyword = e.target.value.trim().toLowerCase(); renderBody(); };
    $('#anmMarkAllBtn', mask).onclick = () => {
      pickupAnomalies.forEach(a => { a.status = '已核对'; });
      saveOrdersToBridge();
      renderBody();
      toast('已将当前全部异常标为「已核对」');
    };
    renderBody();
  }

  function confirmAction(arg1, text, fn, onCancel) {
    const opts = typeof arg1 === 'object' && arg1 !== null
      ? arg1
      : { title: arg1, message: text, onConfirm: fn, onCancel };
    const title = opts.title || '确认操作';
    const message = opts.message || '';
    const subMessage = opts.subMessage || '';
    const type = opts.type || 'warning';
    const confirmText = opts.confirmText || '确认';
    const cancelText = opts.cancelText || '取消';
    const confirmType = opts.confirmType || (type === 'danger' ? 'danger' : 'primary');
    const iconChar = type === 'info' ? 'i' : '!';
    const mask = modal(`<section class="ui-dialog ui-confirm-dialog">
<header class="ui-dialog__header"><h2>${esc(title)}</h2><button class="ui-dialog__close" data-close>×</button></header>
<div class="ui-dialog__body"><div class="ui-confirm-content"><span class="ui-confirm-badge is-${esc(type)}">${iconChar}</span><div><div class="ui-confirm-msg">${esc(message)}</div>${subMessage ? `<div class="ui-confirm-sub">${esc(subMessage)}</div>` : ''}</div></div></div>
<footer class="ui-dialog__footer"><button class="btn" data-close>${esc(cancelText)}</button><button class="btn ${esc(confirmType)}" id="confirmAction">${esc(confirmText)}</button></footer></section>`);
    if (opts.onCancel) $$('[data-close]', mask).forEach(b => b.onclick = () => { opts.onCancel(); mask.remove(); });
    $('#confirmAction', mask).onclick = () => { if (opts.onConfirm) opts.onConfirm(); mask.remove(); };
  }

  function openComplete(o) {
    const planTotal = sum(o.items, 'planQty');
    const receivedTotal = sum(o.items, 'receivedQty');
    const unreceivedTotal = Math.max(0, planTotal - receivedTotal);
    const reasons = ['供应商少发 / 尾差不补', '实物短装 / 损耗确认', '计划取消 / 无需继续提货', '其他原因'];
    const mask = modal(`<section class="ui-dialog complete-dialog">
<header class="ui-dialog__header"><div><h2>手动完结｜${esc(o.no)}</h2></div><button class="ui-dialog__close" data-close>×</button></header>
<div class="ui-dialog__body">
  <div class="pickup-summary">
    <div class="pickup-summary-item"><span class="label">单据状态</span><span class="pp-status pp-status--${statusClass(o.status)}">${esc(o.status)}</span></div>
    <div class="pickup-summary-item"><span class="label">计划提货</span><b>${planTotal}</b></div>
    <div class="pickup-summary-item"><span class="label">已入库</span><b>${receivedTotal}</b></div>
    <div class="pickup-summary-item"><span class="label">未入数量</span><b>${unreceivedTotal}</b></div>
  </div>
  <div class="complete-form-card">
    <div class="form-block">
      <label class="form-block-label" for="completeReason"><span class="req">*</span><span>完结原因</span></label>
      <select class="control" id="completeReason"><option value="">请选择完结原因</option>${reasons.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select>
    </div>
    <div class="form-block">
      <label class="form-block-label" for="completeRemark"><span>备注</span></label>
      <div class="textarea-wrap">
        <textarea class="complete-textarea" id="completeRemark" rows="3" maxlength="300" placeholder="请输入备注（选填）"></textarea>
        <span class="textarea-count" id="completeCount">0 / 300</span>
      </div>
    </div>
  </div>
</div>
<footer class="ui-dialog__footer"><button class="btn" data-close>取消</button><button class="btn primary" id="confirmComplete">确认完结</button></footer></section>`);

    const remarkEl = $('#completeRemark', mask);
    remarkEl.oninput = () => { $('#completeCount', mask).textContent = `${remarkEl.value.length} / 300`; };
    $('#confirmComplete', mask).onclick = () => {
      const reason = $('#completeReason', mask).value;
      if (!reason) return toast('请选择完结原因');
      const remark = remarkEl.value.trim();
      confirmAction({
        title: '手动完结确认',
        message: `确认手动完结提货单 ${o.no} 吗？`,
        subMessage: `未入库的 ${unreceivedTotal} 件将不再补提入库，完结原因：${reason}${remark ? `（${remark}）` : ''}。`,
        type: 'warning',
        confirmText: '确认完结',
        confirmType: 'primary',
        onConfirm: () => {
          o.status = '已完成';
          o.completedAt = NOW;
          o.logs.unshift({
            type: '手动完结',
            content: `确认尾差不再补提（原因：${reason}${remark ? `，备注：${remark}` : ''}），累计入库 ${receivedTotal} 件，单据完结`,
            operator: 'Admin',
            time: NOW
          });
          saveOrdersToBridge();
          mask.remove();
          render();
          toast('提货单已完结');
        }
      });
    };
  }

  function openVoidDialog(targets) {
    const nos = targets.map(o => o.no).join('、');
    const title = targets.length > 1 ? `批量作废提货单确认（${targets.length} 张）` : '作废提货单确认';
    const alertText = targets.length > 1
      ? `确认作废选中的 ${targets.length} 张提货单（${nos}）吗？作废后单据将流转为「已作废」，不可恢复。`
      : `确认作废提货单 ${nos} 吗？作废后单据将流转为「已作废」，不可恢复。`;
    const mask = modal(`<section class="ui-dialog cancel-dialog">
<header class="ui-dialog__header"><div><h2>${esc(title)}</h2></div><button class="ui-dialog__close" data-close>×</button></header>
<div class="ui-dialog__body">
  <div class="ui-alert-warning"><span class="ui-alert-warning__icon">!</span><div class="ui-alert-warning__text">${esc(alertText)}</div></div>
  <div class="complete-form-card" style="margin-top:14px">
    <div class="form-block">
      <label class="form-block-label" for="voidRemark"><span>作废原因（选填）</span></label>
      <div class="textarea-wrap">
        <textarea class="complete-textarea" id="voidRemark" rows="2" maxlength="200" style="min-height:64px" placeholder="请输入作废原因"></textarea>
        <span class="textarea-count" id="voidCount">0 / 200</span>
      </div>
    </div>
  </div>
</div>
<footer class="ui-dialog__footer"><button class="btn" data-close>再想想</button><button class="btn primary" id="confirmVoid">确认作废</button></footer></section>`);

    const remarkEl = $('#voidRemark', mask);
    remarkEl.oninput = () => { $('#voidCount', mask).textContent = `${remarkEl.value.length} / 200`; };
    $('#confirmVoid', mask).onclick = () => {
      const reason = remarkEl.value.trim();
      targets.forEach(o => {
        o.status = '已作废';
        o.logs.unshift({
          type: '作废',
          content: reason ? `作废提货单（原因：${reason}）` : '作废提货单',
          operator: 'Admin',
          time: NOW
        });
        state.selected.delete(o.id);
      });
      saveOrdersToBridge();
      mask.remove();
      render();
      toast(`已作废 ${targets.length} 张提货单`);
    };
  }

  function handle(action, o) {
    if (action === 'expand') { state.expanded.has(o.id) ? state.expanded.delete(o.id) : state.expanded.add(o.id); render(); }
    if (action === 'detail') openDetail(o);
    if (action === 'edit') openEditor(o);
    if (action === 'receive') openReceive(o);
    if (action === 'log') openLog(o);
    if (action === 'complete') openComplete(o);
  }

  function batchSubmitOrders() {
    const targets = [...state.selected].map(id => orders.find(o => o.id === id)).filter(o => o && o.status === '草稿' && (o.items || []).length > 0);
    if (!targets.length) return toast('请勾选至少 1 张含明细的「草稿」提货单');
    const nos = targets.map(o => o.no).join('、');
    const totalLines = targets.reduce((n, o) => n + (o.items || []).length, 0);
    const totalQty = targets.reduce((n, o) => n + sum(o.items, 'planQty'), 0);
    confirmAction({
      title: '提交提货单确认',
      message: `确认提交选中的 ${targets.length} 张提货单并进入「提货中」吗？`,
      subMessage: `涉及单号：${nos}（共 ${totalLines} 条明细、${totalQty} 件货物），提交后不可再按草稿合并。`,
      type: 'warning',
      confirmText: '确认提交',
      confirmType: 'primary',
      onConfirm: () => {
        targets.forEach(o => {
          o.status = '提货中';
          o.logs.unshift({ type: '提交', content: `批量提交进入「提货中」（涉及提货仓：${orderWarehouses(o).join('、')}，共 ${sum(o.items, 'planQty')} 件）`, operator: 'Admin', time: NOW });
          state.selected.delete(o.id);
        });
        saveOrdersToBridge();
        render();
        toast(`已提交 ${targets.length} 张提货单，进入「提货中」`);
      }
    });
  }

  function batchVoidOrders() {
    const targets = [...state.selected].map(id => orders.find(o => o.id === id)).filter(o => o && (o.status === '草稿' || (o.status === '提货中' && sum(o.items, 'receivedQty') === 0)));
    if (!targets.length) return toast('仅「草稿」或 0 入库的「提货中」提货单允许作废');
    openVoidDialog(targets);
  }

  function layoutQuery() {
    const card = $('#queryCard'), items = $$('.query-item:not(.query-action-item)', $('#queryGrid'));
    items.forEach(i => i.classList.remove('query-overflow-item'));
    const tops = [];
    items.forEach(i => { const top = Math.round(i.getBoundingClientRect().top); if (!tops.some(v => Math.abs(v - top) < 3)) tops.push(top); if (tops.length > 2) i.classList.add('query-overflow-item'); });
    const overflow = items.some(i => i.classList.contains('query-overflow-item'));
    $('#queryExpand').hidden = !overflow;
    if (!overflow) { state.queryExpanded = false; card.classList.add('query-collapsed'); }
  }

  $('#newBtn').onclick = () => openEditor();
  if ($('#batchSubmitBtn')) $('#batchSubmitBtn').onclick = batchSubmitOrders;
  if ($('#batchVoidBtn')) $('#batchVoidBtn').onclick = batchVoidOrders;
  if ($('#colConfigBtn')) $('#colConfigBtn').onclick = openColumnConfigDrawer;
  if ($('#anomalyLogBtn')) $('#anomalyLogBtn').onclick = openAnomalyModal;
  $('#searchBtn').onclick = () => {
    if (($('#startDate').value && !$('#endDate').value) || (!$('#startDate').value && $('#endDate').value)) return toast('请选择完整的时间范围');
    if ($('#startDate').value && $('#endDate').value && $('#startDate').value > $('#endDate').value) return toast('开始日期不能晚于结束日期');
    state.page = 1;
    render();
    toast('查询完成');
  };
  $('#resetBtn').onclick = () => {
    $$('#queryGrid input').forEach(i => i.value = '');
    $$('#queryGrid select').forEach(s => s.selectedIndex = 0);
    state.status = '全部';
    render();
    toast('查询条件已重置');
  };
  $('#queryExpand').onclick = () => {
    state.queryExpanded = !state.queryExpanded;
    $('#queryCard').classList.toggle('query-collapsed', !state.queryExpanded);
    $('.query-expand-text').textContent = state.queryExpanded ? '收起' : '展开';
  };
  $('#pageSize').onchange = e => { state.pageSize = Number(e.target.value); state.page = 1; render(); };
  $('#prevPage').onclick = () => { if (state.page > 1) { state.page--; render(); } };
  $('#nextPage').onclick = () => { const pages = Math.max(1, Math.ceil(filtered().length / state.pageSize)); if (state.page < pages) { state.page++; render(); } };
  $('#exportBtn').onclick = () => toast(`已创建 ${filtered().length} 张提货单的导出任务`);

  window.addEventListener('storage', e => {
    if (e.key === BRIDGE_KEY) {
      syncWithV2Bridge();
      render();
    }
  });

  syncWithV2Bridge();
  render();
  layoutQuery();
  window.addEventListener('resize', layoutQuery);
})();
