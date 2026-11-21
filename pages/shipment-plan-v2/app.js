/* 发货计划 V2：严格对齐测试环境（68 列表格、18 项查询、状态 Tab、操作按钮、行内编辑与新建弹窗） */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const STATUS_META = {
    pending_confirm: { label: '待确认' },
    pending_fba_create: { label: '待创建货件' },
    pending_review: { label: '待复核' },
    pending_shipping_order: { label: '待生成发货单' },
    pending_ship: { label: '待发货' },
    pending_arrival: { label: '待到齐' },
    completed: { label: '已完成' },
    void: { label: '已作废' }
  };

  const OPTIONS = {
    pickupWarehouses: ['常州市佳士精密工业有限公司仓库', '深圳市摩仕达焊接设备有限公司仓库', '坪山石井本地仓'],
    shipWarehouses: ['跨跃猫物流仓'],
    destWarehouses: ['跨跃猫美西一件代发仓 纽约仓', 'ONT8-美西FBA仓', 'LGB8-美西FBA仓', 'DE-法兰克福海外仓', 'UK-曼彻斯特海外仓', '坪山石井本地仓'],
    providers: ['跨越猫头程', '森鸿物流', '美森快船专送', 'UPS官方物流', 'DHL国际快递', '中远海运头程'],
    planOwners: ['Admin', '毛粤风', '王方圆', '陈晓', '林思雨', '李明'],
    shipMethods: ['本地仓发货', '工厂直发'],
    transportModes: ['海派（6000）', '海卡（6000）', '空派（5000）', '快递（8000）', '铁运（5000）', '卡航（5000）', '一件代发（8000）'],
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
    { key: 'planNo', label: '发货计划', fixed: 'left-3', locked: true },
    { key: 'productName', label: '品名' },
    { key: 'asin', label: 'ASIN' },
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
    { key: 'remark', label: '备注' },
    { key: 'pickupWarehouse', label: '提货仓' },
    { key: 'shippingOrderNo', label: '发货单号' },
    { key: 'shipWarehouse', label: '发货仓', editable: 'select', options: 'shipWarehouses' },
    { key: 'destWarehouse', label: '目的地仓', editable: 'select', options: 'destWarehouses' },
    { key: 'shipMethod', label: '发货方式', editable: 'select', options: 'shipMethods' },
    { key: 'provider', label: '头程服务商' },
    { key: 'transportMode', label: '运输方式', editable: 'select', options: 'transportModes', allowEmpty: true },
    { key: 'channel', label: '物流渠道' },
    { key: 'cartons', label: '箱数' },
    { key: 'volume', label: '体积(m³)' },
    { key: 'volWeight', label: '体积重(kg)' },
    { key: 'estDays', label: '预计物流时效(天)', editable: 'number' },
    { key: 'estShipDate', label: '预计发货日期', editable: 'date' },
    { key: 'estArrivalDate', label: '期望到货日期', editable: 'date' },
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
    { key: '_action', label: '操作', fixed: 'right', system: true }
  ];

  const COL_DEFS = COLUMNS.filter(c => !c.system);
  const DEFAULT_COL_KEYS = COL_DEFS.map(c => c.key);
  const COL_STORAGE_KEY = 'shipment-plan-v2-column-config';
  const COL_CONFIG_VERSION = 7;

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
      planNo: 'SP2611060001', lingxingSku: 'DD123456', productName: '测试-DD123456', model: '型号-DD123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: '-', sellerSku: 'SL-DD123456', asin: 'B0DD123456',
      store: 'ARCCAPTAIN_US', platform: '亚马逊', country: 'US', team: '刘绎天', teamOwner: '刘绎天', opsOwner: '毛粤风',
      pickupWarehouse: [{ warehouse: '坪山石井本地仓', qty: 16 }, { warehouse: '深圳市摩仕达焊接设备有限公司仓库', qty: 10 }], shipWarehouse: '跨跃猫物流仓',
      destWarehouse: '跨跃猫美西一件代发仓 纽约仓', destType: '海外仓', shipMethod: '本地仓发货',
      provider: '跨越猫头程', providerSub: 'KYM-US', channel: '美森限时达', boxNo: 'BOX-001',
      transportMode: '海派（6000）', estDays: 18, estShipDate: '2026-11-08', estArrivalDate: '2026-11-26',
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
      planNo: 'SP2611060002', lingxingSku: 'KK123456', productName: '测试-KK123456', model: '型号-KK123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: 'X003KK1234', sellerSku: 'SL-KK123456', asin: 'B0KK123456',
      store: 'WEM_Walmart_US', platform: '沃尔玛', country: 'US', team: '亚马逊团队', teamOwner: '王方圆', opsOwner: '王方圆',
      pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'ONT8-美西FBA仓', destType: '平台仓', shipMethod: '本地仓发货',
      provider: '美森快船专送', providerSub: 'MATSON-01', channel: '美森正班船', boxNo: 'BOX-002',
      transportMode: '海卡（6000）', estDays: 16, estShipDate: '2026-11-10', estArrivalDate: '2026-11-26',
      planShipQty: 40, remark: '沃尔玛常规补货', estUnitPrice: 11.0,
      boxSpec: '60.00*45.00*40.00', boxWeight: 14.2, boxQty: 10, supplierCode: 'SUP-KK-02',
      planPurchaseQty: 40, planDeliveryDate: '2026-11-07', demandGap: 40, suggestedOrderQty: 40, expectedDeliveryDate: '2026-11-26',
      platformInStock: 90, platformInTransit: 20, overseasInStock: 30, overseasPendingShip: 0, overseasInTransit: 15,
      localInStock: 100, localPendingShip: 12, poTotal: 40, poInTransit: 0, supplierInStock: 30, supplierInProd: 0,
      purchaseNo: 'PO2226110630009', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '',
      status: 'pending_confirm', createdAt: '2026-11-06 14:20:00', updatedAt: '2026-11-06 14:20:00', creator: '王方圆'
    },
    {
      id: 3, sku: 'FF123456', thumbColor: '#ea580c', thumbText: 'FF', linked: false,
      planNo: 'SP2611040001', lingxingSku: 'FF123456', productName: '测试-FF123456', model: '型号-FF123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: 'X003FF1234', sellerSku: 'SL-FF123456', asin: 'B0FF123456',
      store: 'ARCCAPTAIN_DE', platform: '亚马逊', country: 'DE', team: '欧洲运营组', teamOwner: '陈晓', opsOwner: '林思雨',
      pickupWarehouse: '常州市佳士精密工业有限公司仓库', shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'DE-法兰克福海外仓', destType: '海外仓', shipMethod: '工厂直发',
      provider: '森鸿物流', providerSub: 'SH-EU', channel: '欧洲空派专线', boxNo: 'BOX-003',
      transportMode: '空派（5000）', estDays: 9, estShipDate: '2026-11-05', estArrivalDate: '2026-11-14',
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
      planNo: 'SP2611040002', lingxingSku: 'EE123456', productName: '测试-EE123456', model: '型号-EE123456',
      cat1: '通用', cat2: '通用', saleType: '常规', fnsku: '-', sellerSku: 'SL-EE123456', asin: 'B0EE123456',
      store: 'Ozon_Direct', platform: 'Ozon', country: 'RU', team: 'Jasic团队', teamOwner: '李明', opsOwner: '李明',
      pickupWarehouse: '坪山石井本地仓', shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'UK-曼彻斯特海外仓', destType: '海外仓', shipMethod: '本地仓发货',
      provider: 'UPS官方物流', providerSub: 'UPS-EXP', channel: 'UPS红单快递', boxNo: 'BOX-004',
      transportMode: '快递（8000）', estDays: 7, estShipDate: '2026-11-05', estArrivalDate: '2026-11-12',
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
      planNo: 'SP2611040003', lingxingSku: 'TEST-BATCH-OK', productName: '-', model: '-',
      cat1: '通用', cat2: '通用', saleType: '0', fnsku: '-', sellerSku: '-', asin: '-',
      store: 'ARCCAPTAIN_US', platform: '亚马逊', country: 'US', team: '亚马逊团队', teamOwner: '王方圆', opsOwner: 'Admin',
      pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'LGB8-美西FBA仓', destType: '平台仓', shipMethod: '本地仓发货',
      provider: '跨越猫头程', providerSub: 'KYM-US', channel: '海运卡派', boxNo: '',
      transportMode: '卡航（5000）', estDays: 20, estShipDate: '2026-11-12', estArrivalDate: '2026-12-02',
      planShipQty: 2, remark: '', estUnitPrice: 10.0,
      boxSpec: '40.00*30.00*30.00', boxWeight: 8.0, boxQty: 2, supplierCode: 'SUP-TEST-05',
      planPurchaseQty: 0, planDeliveryDate: '2026-11-10', demandGap: 2, suggestedOrderQty: 2, expectedDeliveryDate: '2026-12-02',
      platformInStock: 0, platformInTransit: 0, overseasInStock: 0, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 10, localPendingShip: 0, poTotal: 0, poInTransit: 0, supplierInStock: 0, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '',
      status: 'pending_fba_create', createdAt: '2026-11-04 08:15:00', updatedAt: '2026-11-04 08:15:00', creator: 'Admin'
    },
    {
      id: 6, sku: 'ARC-MIG200-US', thumbColor: '#0284c7', thumbText: 'MI', linked: true,
      planNo: 'SP2611050001', lingxingSku: 'ARC-MIG200-US', productName: '逆变焊机 MIG200', model: 'MIG200',
      cat1: '焊机', cat2: '常规', saleType: '常规', fnsku: 'X004MIG200', sellerSku: 'SL-MIG200 / B09MIG200', asin: 'B09MIG200',
      store: 'ARCCAPTAIN_US', platform: '亚马逊', country: 'US', team: '亚马逊团队', teamOwner: '王方圆', opsOwner: '王方圆',
      pickupWarehouse: [{ warehouse: '深圳市摩仕达焊接设备有限公司仓库', qty: 20 }], shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'ONT8-美西FBA仓', destType: '平台仓', shipMethod: '工厂直发',
      provider: '美森快船专送', providerSub: 'MATSON-01', channel: '美森正班船', boxNo: '',
      transportMode: '海派（6000）', estDays: 16, estShipDate: '2026-11-12', estArrivalDate: '2026-11-28',
      planShipQty: 20, remark: 'FBA按整箱建单少了2件，待复核确认', estUnitPrice: 45.0,
      boxSpec: '60.00*45.00*40.00', boxWeight: 18.0, boxQty: 10, supplierCode: 'SUP-MIG-01',
      planPurchaseQty: 20, planDeliveryDate: '2026-11-09', demandGap: 20, suggestedOrderQty: 20, expectedDeliveryDate: '2026-11-28',
      platformInStock: 30, platformInTransit: 20, overseasInStock: 10, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 60, localPendingShip: 0, poTotal: 20, poInTransit: 0, supplierInStock: 10, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: '', fbaShipmentNo: 'FBA18XYZ009', fbaRefId: 'US-MIG200-ONT8',
      fbaLinkCount: 1, fbaLinkDeclaredQty: 18, planDiffOverride: -2,
      status: 'pending_review', createdAt: '2026-11-05 10:15:00', updatedAt: '2026-11-05 11:20:00', creator: '王方圆'
    },
    {
      id: 7, sku: '153US0000031', thumbColor: '#059669', thumbText: '焊丝', linked: true,
      planNo: 'SP2611050002', lingxingSku: '153US0000031', productName: '不锈钢焊丝', model: 'ER308L',
      cat1: '焊材', cat2: '耗材', saleType: '常规', fnsku: '-', sellerSku: 'SL-15331', asin: '-',
      store: 'WEM_Walmart_US', platform: '沃尔玛', country: 'US', team: '北美大件组', teamOwner: '毛粤风', opsOwner: '毛粤风',
      pickupWarehouse: [{ warehouse: '坪山石井本地仓', qty: 24 }], shipWarehouse: '跨跃猫物流仓',
      destWarehouse: '跨跃猫美西一件代发仓 纽约仓', destType: '海外仓', shipMethod: '本地仓发货',
      provider: '跨越猫头程', providerSub: 'KYM-US', channel: '美森限时达', boxNo: 'BOX-009',
      transportMode: '海派（6000）', estDays: 18, estShipDate: '2026-11-07', estArrivalDate: '2026-11-25',
      planShipQty: 24, remark: '发货单已发出，部分入库中', estUnitPrice: 14.0,
      boxSpec: '44.00*44.00*32.00', boxWeight: 12.0, boxQty: 12, supplierCode: 'SUP-153-31',
      planPurchaseQty: 24, planDeliveryDate: '2026-11-05', demandGap: 24, suggestedOrderQty: 24, expectedDeliveryDate: '2026-11-25',
      platformInStock: 20, platformInTransit: 24, overseasInStock: 12, overseasPendingShip: 0, overseasInTransit: 12,
      localInStock: 50, localPendingShip: 0, poTotal: 24, poInTransit: 0, supplierInStock: 0, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: 'DN20260808004', fbaShipmentNo: '', fbaRefId: '',
      status: 'pending_arrival', arrivalSubStatus: 'partial_received', createdAt: '2026-11-05 09:20:00', updatedAt: '2026-11-07 14:10:00', creator: '毛粤风'
    },
    {
      id: 8, sku: '153US0000024', thumbColor: '#d97706', thumbText: '配件', linked: true,
      planNo: 'SP2611050003', lingxingSku: '153US0000024', productName: '焊枪配件套装', model: 'WP-17',
      cat1: '配件', cat2: '常规', saleType: '常规', fnsku: '-', sellerSku: 'SL-15324', asin: '-',
      store: 'WEM_Walmart_US', platform: '沃尔玛', country: 'US', team: '北美大件组', teamOwner: '陈晓', opsOwner: '陈晓',
      pickupWarehouse: [{ warehouse: '常州市佳士精密工业有限公司仓库', qty: 30 }], shipWarehouse: '跨跃猫物流仓',
      destWarehouse: '跨跃猫美西一件代发仓 纽约仓', destType: '海外仓', shipMethod: '工厂直发',
      provider: '跨越猫头程', providerSub: 'KYM-US', channel: '美森限时达', boxNo: '',
      transportMode: '海卡（6000）', estDays: 18, estShipDate: '2026-11-15', estArrivalDate: '2026-12-03',
      planShipQty: 30, remark: '已确认待物流生成发货单', estUnitPrice: 9.5,
      boxSpec: '50.00*40.00*34.00', boxWeight: 10.5, boxQty: 15, supplierCode: 'SUP-153-24',
      planPurchaseQty: 30, planDeliveryDate: '2026-11-12', demandGap: 30, suggestedOrderQty: 30, expectedDeliveryDate: '2026-12-03',
      platformInStock: 10, platformInTransit: 0, overseasInStock: 8, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 45, localPendingShip: 0, poTotal: 30, poInTransit: 0, supplierInStock: 0, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '',
      status: 'pending_shipping_order', createdAt: '2026-11-05 16:00:00', updatedAt: '2026-11-05 16:30:00', creator: '陈晓'
    },
    {
      id: 9, sku: 'ARC-MIG200-US', thumbColor: '#0284c7', thumbText: 'MI', linked: true,
      planNo: 'SP2611170001', lingxingSku: 'ARC-MIG200-US', productName: '逆变焊机 MIG200', model: 'MIG200',
      cat1: '焊机', cat2: '常规', saleType: '常规', fnsku: 'X004MIG200', sellerSku: 'SL-MIG200', asin: 'B09MIG200',
      store: 'ARCCAPTAIN_US', platform: '亚马逊', country: 'US', team: '亚马逊团队', teamOwner: '王方圆', opsOwner: '王方圆',
      pickupWarehouse: [{ warehouse: '深圳市摩仕达焊接设备有限公司仓库', qty: 12 }, { warehouse: '坪山石井本地仓', qty: 8 }], shipWarehouse: '跨跃猫物流仓',
      destWarehouse: 'ONT8-美西FBA仓', destType: '平台仓', shipMethod: '本地仓发货',
      provider: '美森快船专送', providerSub: 'MATSON-01', channel: '美森正班船', boxNo: '',
      transportMode: '海派（6000）', estDays: 16, estShipDate: '2026-11-20', estArrivalDate: '2026-12-06',
      planShipQty: 20, remark: '待运营分仓创建 2 个 FBA 货件并关联', estUnitPrice: 45.0,
      boxSpec: '60.00*45.00*40.00', boxWeight: 18.0, boxQty: 10, supplierCode: 'SUP-MIG-01',
      planPurchaseQty: 20, planDeliveryDate: '2026-11-18', demandGap: 20, suggestedOrderQty: 20, expectedDeliveryDate: '2026-12-06',
      platformInStock: 30, platformInTransit: 20, overseasInStock: 10, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 60, localPendingShip: 0, poTotal: 20, poInTransit: 0, supplierInStock: 10, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '', fbaLinks: [],
      status: 'pending_fba_create', createdAt: '2026-11-17 09:30:00', updatedAt: '2026-11-17 09:30:00', creator: '王方圆'
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
      return { provider: '森鸿物流', providerSub: 'SH-EU', channel: '欧洲空派专线' };
    }
    if (String(destWarehouse || '').includes('UK-') || String(shipWarehouse || '').includes('义乌')) {
      return { provider: 'UPS官方物流', providerSub: 'UPS-EXP', channel: 'UPS红单快递' };
    }
    if (String(destWarehouse || '').includes('FBA')) {
      return { provider: '美森快船专送', providerSub: 'MATSON-01', channel: '美森正班船' };
    }
    if (shipMethod === '工厂直发') {
      return { provider: '跨越猫头程', providerSub: 'KYM-FACTORY', channel: '工厂直发专线' };
    }
    return { provider: '跨越猫头程', providerSub: 'KYM-US', channel: '美森限时达' };
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
    const planDiff = r.planDiffOverride !== undefined && r.planDiffOverride !== null
      ? Number(r.planDiffOverride)
      : (r.team === '亚马逊团队' && r.fbaShipmentNo && Number(r.fbaLinkDeclaredQty) > 0
        ? Number(r.fbaLinkDeclaredQty) - qty
        : qty - (Number(r.planPurchaseQty) || 0));
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
      const label = placeholder.replace(/^请选择/, '').replace('（可多选）', '');
      trigger.textContent = selected.size ? `${label}（${selected.size}）` : placeholder;
      trigger.classList.toggle('has-value', selected.size > 0);
      wrap.classList.toggle('has-value', selected.size > 0);
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
    const head = placeholder ? `<option value="">${esc(placeholder)}</option>` : '';
    sel.innerHTML = head + list.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
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

  const LEGACY_PICKUP_MAP = {
    '深圳坂田总仓': '深圳市摩仕达焊接设备有限公司仓库',
    '东莞清溪仓': '常州市佳士精密工业有限公司仓库',
    '义乌集货仓': '坪山石井本地仓',
    '900609': '深圳市摩仕达焊接设备有限公司仓库',
    '跨跃猫物流仓': '深圳市摩仕达焊接设备有限公司仓库'
  };
  function normalizePickupAllocs(val, fallbackQty = 0) {
    const map = new Map();
    const pushItem = (w, q) => {
      const rawName = String(w || '').trim();
      const name = LEGACY_PICKUP_MAP[rawName] || rawName;
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

  const REMARK_EDIT_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9 2.1a1.5 1.5 0 0 1 2.1 2.1l-7.7 7.7-2.8.7.7-2.8 7.7-7.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m9.8 3.2 3 3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  const ACTION_VISIBILITY = {
    all: ['createPlanBtn', 'batchEditBtn', 'confirmBtn', 'linkFbaBtn', 'unlinkFbaBtn', 'reviewApproveBtn', 'reviewRejectBtn', 'importPlanBtn', 'batchVoidBtn'],
    pending_confirm: ['createPlanBtn', 'batchEditBtn', 'confirmBtn', 'importPlanBtn', 'batchVoidBtn'],
    pending_fba_create: ['createPlanBtn', 'batchEditBtn', 'linkFbaBtn', 'importPlanBtn', 'batchVoidBtn'],
    pending_review: ['createPlanBtn', 'batchEditBtn', 'linkFbaBtn', 'unlinkFbaBtn', 'reviewApproveBtn', 'reviewRejectBtn', 'importPlanBtn', 'batchVoidBtn'],
    pending_shipping_order: ['createPlanBtn', 'batchEditBtn', 'linkFbaBtn', 'unlinkFbaBtn', 'importPlanBtn', 'batchVoidBtn'],
    pending_ship: ['createPlanBtn', 'importPlanBtn', 'batchVoidBtn'],
    pending_arrival: ['createPlanBtn', 'importPlanBtn'],
    completed: ['createPlanBtn', 'importPlanBtn'],
    void: ['createPlanBtn', 'importPlanBtn']
  };
  const EDITABLE_STATUSES = ['pending_confirm', 'pending_fba_create', 'pending_review', 'pending_shipping_order'];
  function canEditPlanRow(row) {
    return Boolean(row && EDITABLE_STATUSES.includes(row.status) && !row.shippingOrderNo);
  }

  function syncActionVisibility() {
    const allowed = ACTION_VISIBILITY[state.statusTab] || ACTION_VISIBILITY.all;
    $$('.head-actions > button').forEach(btn => {
      btn.hidden = !allowed.includes(btn.id);
    });
  }

  function closeRemarkPopover() {
    document.querySelectorAll('.remark-popover').forEach(el => el.remove());
  }

  function openRemarkPopover(trigger, row) {
    closeRemarkPopover();
    const pop = document.createElement('div');
    pop.className = 'remark-popover';
    pop.innerHTML = `<textarea class="remark-popover__input" maxlength="500" rows="4" placeholder="请输入备注"></textarea><div class="remark-popover__actions"><button class="btn" type="button" data-remark-action="cancel">取消</button><button class="btn primary" type="button" data-remark-action="confirm">确定</button></div>`;
    document.body.appendChild(pop);
    const textarea = pop.querySelector('.remark-popover__input');
    textarea.value = row.remark || '';

    const rect = trigger.getBoundingClientRect();
    const popW = pop.offsetWidth || 330;
    const popH = pop.offsetHeight || 160;
    let left = Math.max(12, Math.min(window.innerWidth - popW - 12, rect.right - popW));
    let top = rect.bottom + 6;
    if (top + popH > window.innerHeight - 12) {
      top = Math.max(12, rect.top - popH - 6);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    pop.querySelector('[data-remark-action="cancel"]').onclick = closeRemarkPopover;
    pop.querySelector('[data-remark-action="confirm"]').onclick = () => {
      const oldVal = (row.remark || '').trim();
      const nextVal = textarea.value.trim();
      closeRemarkPopover();
      if (nextVal === oldVal) return;
      row.remark = nextVal;
      row.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      addLog(row.id, '编辑', nextVal ? `修改备注：${oldVal || '空'} → ${nextVal}` : '清空备注');
      publishV2PlansToBridge();
      applyFilter(false);
      toast('备注已保存');
    };
  }

  function renderStatusTabs(baseRows) {
    const tabs = [['all', '全部'], ...Object.entries(STATUS_META).map(([k, v]) => [k, v.label])];
    $('#statusTabs').innerHTML = tabs.map(([key, label]) => {
      const count = key === 'all' ? baseRows.length : baseRows.filter(r => r.status === key).length;
      return `
        <button class="spv2-status-tab ${state.statusTab === key ? 'is-active' : ''}" type="button" data-status-tab="${key}">
          <span>${label}</span>
          <span class="count-pill">${count}</span>
        </button>`;
    }).join('');
    syncActionVisibility();
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
      const fullReadonly = r.status === 'completed' || r.status === 'void';
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
          const meta = STATUS_META[r.status] || { label: r.status };
          let subHtml = '';
          if (r.status === 'pending_arrival') {
            const subCls = r.arrivalSubStatus === 'partial_received' ? 'partial_received' : 'pending_receive';
            const subText = r.arrivalSubStatus === 'partial_received' ? '部分收货' : '待收货';
            subHtml = `<span class="spv2-sub-tag ${subCls}">${subText}</span>`;
          }
          return `<td class="${cls}"><div class="spv2-plan-cell"><span class="spv2-plan-code">${esc(r.planNo)}</span><span class="spv2-status-tag ${r.status}">${meta.label}</span>${subHtml}</div></td>`;
        }
        if (c.key === '_action') {
          const canLinkFba = r.team === '亚马逊团队' && ['pending_fba_create', 'pending_review', 'pending_shipping_order'].includes(r.status);
          const linkBtnHtml = canLinkFba
            ? `<button class="spv2-op-btn is-primary" type="button" data-open-fba-link="${r.id}">${r.fbaShipmentNo ? '调整货件' : '关联货件'}</button>`
            : '';
          const editBtnHtml = canEditPlanRow(r)
            ? `<button class="spv2-op-btn is-primary" type="button" data-edit-row="${r.id}">编辑</button>`
            : '';
          return `<td class="${cls}"><div class="spv2-op-links">${linkBtnHtml}${editBtnHtml}<button class="spv2-op-btn is-gray" type="button" data-row-log="${r.id}">日志</button></div></td>`;
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
            return `<td class="${cls}"><div class="spv2-fba-cell"><span class="spv2-unlinked-tag">未关联</span></div></td>`;
          }
          return `<td class="${cls}">-</td>`;
        }
        if (c.key === 'remark') {
          const canEditRemark = !fullReadonly;
          const text = r.remark ? r.remark : '—';
          const editBtn = canEditRemark
            ? `<button class="batch-remark__edit" type="button" data-remark-row="${r.id}" title="编辑备注" aria-label="编辑计划 ${esc(r.planNo)} 的备注">${REMARK_EDIT_ICON}</button>`
            : '';
          return `<td class="${cls} remark-cell"><div class="batch-remark"><span class="batch-remark__text" title="${esc(r.remark || '暂无备注')}">${esc(text)}</span>${editBtn}</div></td>`;
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
            readonly: true
          });
          return `<td class="${cls}">${html}</td>`;
        }
        const val = d[c.key] !== undefined ? d[c.key] : (r[c.key] !== undefined && r[c.key] !== '' ? r[c.key] : '-');
        if (c.key === 'planDiff' && Number(val) !== 0) {
          const prefix = Number(val) > 0 ? `+${val}` : `${val}`;
          return `<td class="${cls}"><span class="spv2-diff-warn">${esc(prefix)}</span></td>`;
        }
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
    const nextVal = target.type === 'number' ? (target.value === '' ? '' : (Number(target.value) || 0)) : target.value;
    if (key === 'planShipQty') {
      const pickupTotal = getPickupTotalQty(row.pickupWarehouse);
      if (nextVal < pickupTotal) {
        target.value = oldVal;
        return toast(`计划发货数量(${nextVal})不能小于各提货仓提货数量合计(${pickupTotal})`);
      }
    }
    row[key] = nextVal;
    if (key === 'estShipDate' || key === 'estDays') {
      const calc = addDays(row.estShipDate, row.estDays);
      if (calc !== '-') row.estArrivalDate = calc;
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

  /* 行内日志、关联货件、取消关联、提货仓多选操作 */
  function unlinkFbaPlans(targets) {
    if (!targets.length) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    targets.forEach(r => {
      const prevFba = r.fbaShipmentNo || '—';
      r.fbaShipmentNo = '';
      r.fbaRefId = '';
      r.fbaLinkCount = 0;
      r.fbaLinkDeclaredQty = 0;
      r.fbaLinks = [];
      r.planDiffOverride = null;
      r.status = 'pending_fba_create';
      r.updatedAt = now;
      delete bridge.links[r.planNo];
      delete bridge.v2StatusFromUpstream[r.planNo];
      bridge.prelinkedShipments = (bridge.prelinkedShipments || []).filter(p => p && p.planNo !== r.planNo);
      if (!bridge.unlinkedPlans.includes(r.planNo)) bridge.unlinkedPlans.push(r.planNo);
      Object.values(metaMap).forEach(grp => {
        (grp.children || []).forEach(c => {
          if (Array.isArray(c.linkedPlans)) c.linkedPlans = c.linkedPlans.filter(p => p !== r.planNo);
        });
      });
      addLog(r.id, '取消', `取消发货计划 ${r.planNo} 的 FBA 货件关联（原货件：${prevFba}），退回「待创建货件」`);
    });
    bridge.fbaShipmentsMeta = metaMap;
    writeFbaBridge(bridge);
    publishV2PlansToBridge();
    applyFilter(false);
    toast(`已取消 ${targets.length} 条发货计划的 FBA 货件关联，已退回「待创建货件」`);
  }

  $('#tableBody').addEventListener('click', e => {
    const fbaLinkBtn = e.target.closest('[data-open-fba-link]');
    if (fbaLinkBtn) {
      e.stopPropagation();
      const row = rows.find(r => r.id === Number(fbaLinkBtn.dataset.openFbaLink));
      if (row) openV2FbaLinkModal([row]);
      return;
    }
    const fbaUnlinkBtn = e.target.closest('[data-unlink-fba]');
    if (fbaUnlinkBtn) {
      e.stopPropagation();
      const row = rows.find(r => r.id === Number(fbaUnlinkBtn.dataset.unlinkFba));
      if (row) unlinkFbaPlans([row]);
      return;
    }
    const remarkBtn = e.target.closest('[data-remark-row]');
    if (remarkBtn) {
      e.stopPropagation();
      const row = rows.find(r => r.id === Number(remarkBtn.dataset.remarkRow));
      if (row) openRemarkPopover(remarkBtn, row);
      return;
    }
    const editBtn = e.target.closest('[data-edit-row]');
    if (editBtn) {
      openSingleEditModal(Number(editBtn.dataset.editRow));
      return;
    }
    const logBtn = e.target.closest('[data-row-log]');
    if (logBtn) {
      openPlanLogModal(Number(logBtn.dataset.rowLog));
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.remark-popover') && !e.target.closest('[data-remark-row]')) {
      closeRemarkPopover();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeRemarkPopover();
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

  /* 主操作按钮：确认 / 复核通过 / 驳回 / 作废 */
  $('#confirmBtn').addEventListener('click', () => {
    const targets = rows.filter(r => state.selected.has(r.id) && r.status === 'pending_confirm');
    if (!targets.length) return toast('请先勾选「待确认」状态的发货计划');
    let amazonCnt = 0;
    let nonAmazonCnt = 0;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    targets.forEach(r => {
      if (r.team === '亚马逊团队') {
        r.status = 'pending_fba_create';
        amazonCnt += 1;
        addLog(r.id, '确认', `确认发货计划 ${r.planNo}，流转至「待创建货件」（待运营创建并关联 FBA 货件）`);
      } else {
        r.status = 'pending_shipping_order';
        nonAmazonCnt += 1;
        addLog(r.id, '确认', `确认发货计划 ${r.planNo}（非亚马逊团队），跳过货件步骤，流转至「待生成发货单」`);
      }
      r.updatedAt = now;
    });
    publishV2PlansToBridge();
    applyFilter(false);
    const parts = [];
    if (amazonCnt) parts.push(`${amazonCnt} 条亚马逊计划进入「待创建货件」`);
    if (nonAmazonCnt) parts.push(`${nonAmazonCnt} 条非亚马逊计划进入「待生成发货单」`);
    toast(`已确认 ${targets.length} 条（${parts.join('，')}）`);
  });

  $('#reviewApproveBtn').addEventListener('click', () => {
    const targets = rows.filter(r => state.selected.has(r.id) && r.status === 'pending_review');
    if (!targets.length) return toast('请先勾选「待复核」状态的发货计划');
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    targets.forEach(r => {
      r.status = 'pending_shipping_order';
      r.updatedAt = now;
      addLog(r.id, '复核通过', `计划差异复核通过，发货计划 ${r.planNo} 流转至「待生成发货单」`);
    });
    publishV2PlansToBridge();
    const autoCount = tryAutoGenerateDraftOrdersFromV2();
    applyFilter(false);
    toast(autoCount > 0
      ? `已复核通过 ${targets.length} 条，并自动生成 ${autoCount} 张草稿发货单（流转至「待发货」）`
      : `已复核通过 ${targets.length} 条，流转至「待生成发货单」`
    );
  });

  let pendingRejectIds = [];
  function openRejectModal(targets) {
    pendingRejectIds = targets.map(r => r.id);
    $('#rejectReasonInput').value = '';
    $('#rejectSummaryDesc').textContent = `确认驳回所选 ${targets.length} 条计划（${targets.map(t => t.planNo).join('、')}）的 FBA 差异吗？驳回后将退回「待创建货件」，保留原已关联 FBA 货件，运营可通过「调整货件」进行追加、减少或更换货件。`;
    $('#rejectModalMask').classList.remove('hidden');
    setTimeout(() => $('#rejectReasonInput').focus(), 20);
  }
  function closeRejectModal() {
    pendingRejectIds = [];
    $('#rejectModalMask').classList.add('hidden');
  }
  $('#reviewRejectBtn').addEventListener('click', () => {
    const targets = rows.filter(r => state.selected.has(r.id) && r.status === 'pending_review');
    if (!targets.length) return toast('请先勾选「待复核」状态的发货计划');
    openRejectModal(targets);
  });
  $('#rejectCloseBtn').addEventListener('click', closeRejectModal);
  $('#rejectCancelBtn').addEventListener('click', closeRejectModal);
  $('#rejectModalMask').addEventListener('click', e => {
    if (e.target === $('#rejectModalMask')) closeRejectModal();
  });
  $('#rejectConfirmBtn').addEventListener('click', () => {
    const targets = rows.filter(r => pendingRejectIds.includes(r.id) && r.status === 'pending_review');
    if (!targets.length) return closeRejectModal();
    const reason = $('#rejectReasonInput').value.trim();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const bridge = readFbaBridge();
    targets.forEach(r => {
      const prevFba = r.fbaShipmentNo || '—';
      r.status = 'pending_fba_create';
      r.updatedAt = now;
      if (bridge.v2StatusFromUpstream[r.planNo]) {
        bridge.v2StatusFromUpstream[r.planNo].status = 'pending_fba_create';
      }
      addLog(r.id, '驳回', `驳回 FBA 差异，退回「待创建货件」（保留原关联货件 ${prevFba}，可通过「调整货件」追加/减少/更换）${reason ? `。原因：${reason}` : ''}`);
    });
    writeFbaBridge(bridge);
    publishV2PlansToBridge();
    closeRejectModal();
    applyFilter(false);
    toast(`已驳回 ${targets.length} 条计划，已退回「待创建货件」（保留原 FBA 货件关联）`);
  });

  $('#batchVoidBtn').addEventListener('click', () => {
    const allowVoid = new Set(['pending_confirm', 'pending_fba_create', 'pending_review', 'pending_shipping_order', 'pending_ship']);
    const targets = rows.filter(r => state.selected.has(r.id) && allowVoid.has(r.status));
    if (!targets.length) return toast('请先勾选未进入「待到齐/已完成/已作废」状态的发货计划');
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const bridge = readFbaBridge();
    targets.forEach(r => {
      r.status = 'void';
      r.arrivalSubStatus = '';
      r.updatedAt = now;
      delete bridge.links[r.planNo];
      if (!bridge.unlinkedPlans.includes(r.planNo)) bridge.unlinkedPlans.push(r.planNo);
      addLog(r.id, '批量作废', `批量作废发货计划 ${r.planNo}`);
    });
    writeFbaBridge(bridge);
    publishV2PlansToBridge();
    applyFilter(false);
    toast(`已作废 ${targets.length} 条发货计划`);
  });

  /* 可添加的 SKU 商品池（用于「添加 SKU」小弹窗；fnskuList 含多个时不默认选中，仅唯一 1 个时自动选中） */
  const SKU_POOL = [
    { sku: '10230100501', lingxingSku: '10230100501', productName: '焊机脚踏开关（TIG通用）', fnskuList: ['X004Q36S81', 'X004Q36S82'], team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'TIG-PEDAL-US', opsOwner: '王方圆', packSpec: '28*20*14', boxSpec: '46*36*32', boxQty: 10, pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', planShipQty: 8, remark: '', supplierCode: 'SUP-1023-01' },
    { sku: '140US260008', lingxingSku: '140US260008', productName: '电焊机 140A', fnskuList: ['X004140US1', 'X004140US2', 'X004140US3'], team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-140US / B09140US', opsOwner: '王方圆', packSpec: '42*24*28', boxSpec: '58*44*38', boxQty: 8, pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', planShipQty: 16, remark: '', supplierCode: 'SUP-140-01' },
    { sku: '153US0000017', lingxingSku: '153US0000017', productName: '送丝管耗材套装 S1 500W', fnskuList: ['X004153S1A', 'X004153S1B'], team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-153S1 / B09153S1', opsOwner: '王方圆', packSpec: '22*18*10', boxSpec: '48*38*32', boxQty: 20, pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', planShipQty: 40, remark: '', supplierCode: 'SUP-153-17' },
    { sku: '153US0000024', lingxingSku: '153US0000024', productName: '焊枪配件套装', fnskuList: ['X00415324A'], team: 'Jasic团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-15324 / B0915324', opsOwner: '陈晓', packSpec: '25*18*12', boxSpec: '50*40*34', boxQty: 15, pickupWarehouse: '常州市佳士精密工业有限公司仓库', planShipQty: 30, remark: '', supplierCode: 'SUP-153-24' },
    { sku: '153US0000031', lingxingSku: '153US0000031', productName: '不锈钢焊丝', fnskuList: ['X00415331A'], team: '北美大件组', platform: '沃尔玛', store: 'WEM_Walmart_US', country: 'US', sellerSku: 'SL-15331 / B0915331', opsOwner: '毛粤风', packSpec: '20*20*15', boxSpec: '44*44*32', boxQty: 12, pickupWarehouse: '坪山石井本地仓', planShipQty: 24, remark: '', supplierCode: 'SUP-153-31' },
    { sku: '42101000004', lingxingSku: '42101000004', productName: 'TIG 焊丝-不锈钢', fnskuList: ['X0042104DE'], team: '欧洲运营组', platform: '亚马逊', store: 'ARCCAPTAIN_DE', country: 'DE', sellerSku: 'SL-42104 / B0942104', opsOwner: '林思雨', packSpec: '18*18*12', boxSpec: '40*40*30', boxQty: 10, pickupWarehouse: '常州市佳士精密工业有限公司仓库', planShipQty: 20, remark: '', supplierCode: 'SUP-421-04' },
    { sku: 'ARC-MIG200-US', lingxingSku: 'ARC-MIG200-US', productName: '逆变焊机 MIG200', fnskuList: ['X004MIG200', 'X004MIG200B'], team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-MIG200 / B09MIG200', opsOwner: '王方圆', packSpec: '42*25*30', boxSpec: '60*45*40', boxQty: 10, pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', planShipQty: 20, remark: '', supplierCode: 'SUP-MIG-01' },
    { sku: 'ARC-TIG200-US', lingxingSku: 'ARC-TIG200-US', productName: '氩弧焊机 TIG200', fnskuList: ['X004TIG200', 'X004TIG200B'], team: '亚马逊团队', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-TIG200 / B09TIG200', opsOwner: '王方圆', packSpec: '45*28*32', boxSpec: '55*42*38', boxQty: 8, pickupWarehouse: '深圳市摩仕达焊接设备有限公司仓库', planShipQty: 16, remark: '', supplierCode: 'SUP-TIG-02' },
    { sku: 'DD123456', lingxingSku: 'DD123456', productName: '组合产品 DD', fnskuList: ['X004DD123A', 'X004DD123B'], team: '刘绎天', platform: '亚马逊', store: 'ARCCAPTAIN_US', country: 'US', sellerSku: 'SL-DD123 / B0DD123456', opsOwner: '毛粤风', packSpec: '40*30*28', boxSpec: '60*45*40', boxQty: 13, pickupWarehouse: '坪山石井本地仓', planShipQty: 26, remark: '', supplierCode: 'SUP-DD-01' },
    { sku: 'EE123456', lingxingSku: 'EE123456', productName: '组合产品子项 EE', fnskuList: ['X004EE1234'], team: 'Jasic团队', platform: 'Ozon', store: 'Ozon_Direct', country: 'RU', sellerSku: 'SL-EE123 / B0EE123456', opsOwner: '李明', packSpec: '35*25*22', boxSpec: '50*40*35', boxQty: 8, pickupWarehouse: '坪山石井本地仓', planShipQty: 24, remark: '', supplierCode: 'SUP-EE-04' },
    { sku: 'FF123456', lingxingSku: 'FF123456', productName: '组合产品子项 FF', fnskuList: ['X003FF1234'], team: '欧洲运营组', platform: '亚马逊', store: 'ARCCAPTAIN_DE', country: 'DE', sellerSku: 'SL-FF123 / B0FF123456', opsOwner: '林思雨', packSpec: '38*26*24', boxSpec: '55*42*38', boxQty: 12, pickupWarehouse: '常州市佳士精密工业有限公司仓库', planShipQty: 24, remark: '', supplierCode: 'SUP-FF-03' }
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
        <td class="spv2-c-fix-2" title="${esc(s.lingxingSku)}">${esc(s.lingxingSku)}</td>
        <td class="spv2-c-fix-3" title="${esc(s.productName)}">${esc(s.productName)}</td>
        <td class="spv2-c-fix-4">${selHtml(idx, 'team', OPTIONS.teams, s.team, '请选择')}</td>
        <td>${selHtml(idx, 'platform', OPTIONS.platforms, s.platform, '请选择')}</td>
        <td>${selHtml(idx, 'store', OPTIONS.stores, s.store, '请选择')}</td>
        <td>${esc(s.country)}</td>
        <td><input class="spv2-inline-control" data-csku-idx="${idx}" data-csku-key="asin" value="${esc(s.asin)}" placeholder="请输入 ASIN"></td>
        <td>${selHtml(idx, 'fnsku', Array.isArray(s.fnskuList) ? s.fnskuList : [], s.fnsku, '请选择')}</td>
        <td>${selHtml(idx, 'opsOwner', OPTIONS.planOwners, s.opsOwner, '请选择')}</td>
        <td>${esc(s.packSpec)}</td>
        <td>${esc(s.boxSpec)}</td>
        <td>${esc(s.boxQty)}</td>
        <td data-csku-cartons="${idx}">${Math.ceil((Number(s.planShipQty) || 0) / (Number(s.boxQty) || 1))}</td>
        <td>${renderCreatePwCell(s, idx)}</td>
        <td><input class="spv2-inline-control spv2-inline-num" type="number" min="1" data-csku-idx="${idx}" data-csku-key="planShipQty" value="${s.planShipQty === '' || s.planShipQty == null ? '' : esc(s.planShipQty)}" placeholder="请输入"></td>
        <td><input class="spv2-inline-control" data-csku-idx="${idx}" data-csku-key="remark" value="${esc(s.remark)}" placeholder="请输入备注"></td>
        <td>${esc(s.supplierCode)}</td>
        <td class="spv2-c-fix-right"><button class="spv2-op-btn is-danger" type="button" data-csku-del="${idx}">移除</button></td>
      </tr>
    `).join('') : `<tr><td colspan="19" class="spv2-create-empty"><div class="spv2-create-empty-inner"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="14" width="34" height="26" rx="4" stroke="currentColor" stroke-width="2"/><path d="M16 14v-3a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" stroke="currentColor" stroke-width="2"/><path d="M17 24h14M17 30h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><p>暂未添加发货 SKU</p><span>点击右上角「添加 SKU」，选择需要发货的商品</span></div></td></tr>`;
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

  const modalEditorState = {
    mode: 'create',
    editRowId: 0,
    batchIds: [],
    activeBatchId: 0,
    drafts: {}
  };

  function closeCreateModal() {
    closeBatchFillPopover();
    $('#createModalMask').classList.add('hidden');
    $('#createModal').classList.add('hidden');
  }

  function snapshotRowToDraft(row) {
    const poolItem = SKU_POOL.find(p => p.sku === row.sku);
    const fnskuSet = new Set(
      (poolItem && Array.isArray(poolItem.fnskuList) ? poolItem.fnskuList : [])
        .concat(row.fnsku && row.fnsku !== '-' ? [row.fnsku] : [])
    );
    return {
      shipMethod: row.shipMethod || '本地仓发货',
      shipWarehouse: row.shipWarehouse || '跨跃猫物流仓',
      transportMode: row.transportMode || '',
      destWarehouse: row.destWarehouse || '',
      estShipDate: row.estShipDate || '',
      estDays: row.estDays != null && row.estDays !== '' ? String(row.estDays) : '',
      estArrivalDate: row.estArrivalDate || '',
      skus: [{
        sku: row.sku,
        lingxingSku: row.lingxingSku || '',
        productName: row.productName || '',
        boxSpec: row.boxSpec || '',
        boxQty: Number(row.boxQty) || 1,
        supplierCode: row.supplierCode || '',
        sellerSku: row.sellerSku || '',
        fnskuList: Array.from(fnskuSet),
        asin: row.asin && row.asin !== '-' ? row.asin : '',
        fnsku: row.fnsku && row.fnsku !== '-' ? row.fnsku : '',
        team: row.team || '',
        platform: row.platform || '',
        store: row.store || '',
        country: row.country || '',
        opsOwner: row.opsOwner || '',
        pickupWarehouse: normalizePickupAllocs(row.pickupWarehouse, row.planShipQty),
        planShipQty: Number(row.planShipQty) || '',
        remark: row.remark || ''
      }]
    };
  }

  function loadDraftIntoForm(draft) {
    $('#cShipMethod').value = draft.shipMethod || '本地仓发货';
    $('#cShipWarehouse').value = draft.shipWarehouse || '跨跃猫物流仓';
    $('#cTransportMode').value = draft.transportMode || '';
    $('#cDestWarehouse').value = draft.destWarehouse || '';
    $('#cEstShipDate').value = draft.estShipDate || '';
    $('#cEstDays').value = draft.estDays || '';
    $('#cEstArrivalDate').value = draft.estArrivalDate || '';
    state.createSkus = (draft.skus || []).map(item => ({
      ...item,
      fnskuList: Array.isArray(item.fnskuList) ? [...item.fnskuList] : [],
      pickupWarehouse: normalizePickupAllocs(item.pickupWarehouse, item.planShipQty)
    }));
    renderCreateSkus();
  }

  function saveFormToActiveDraft() {
    if (modalEditorState.mode !== 'batch-edit' || !modalEditorState.activeBatchId) return;
    const draft = modalEditorState.drafts[modalEditorState.activeBatchId];
    if (!draft) return;
    draft.shipMethod = $('#cShipMethod').value;
    draft.shipWarehouse = $('#cShipWarehouse').value;
    draft.transportMode = $('#cTransportMode').value || '';
    draft.destWarehouse = $('#cDestWarehouse').value || '';
    draft.estShipDate = $('#cEstShipDate').value || '';
    draft.estDays = $('#cEstDays').value || '';
    draft.estArrivalDate = $('#cEstArrivalDate').value || '';
    draft.skus = state.createSkus.map(item => ({
      ...item,
      fnskuList: Array.isArray(item.fnskuList) ? [...item.fnskuList] : [],
      pickupWarehouse: normalizePickupAllocs(item.pickupWarehouse, item.planShipQty)
    }));
  }

  function renderBatchEditNav() {
    const isBatch = modalEditorState.mode === 'batch-edit';
    $('#batchEditNav').classList.toggle('hidden', !isBatch);
    $('#statBatchPlansWrap').classList.toggle('hidden', !isBatch);
    if (!isBatch) return;
    const count = modalEditorState.batchIds.length;
    $('#batchEditNavCount').textContent = count;
    $('#statBatchPlans').textContent = count;
    $('#batchEditNavList').innerHTML = modalEditorState.batchIds.map(id => {
      const row = rows.find(r => r.id === id);
      const draft = modalEditorState.drafts[id];
      if (!row || !draft) return '';
      const statusLabel = (STATUS_META[row.status] && STATUS_META[row.status].label) || row.status;
      const destLabel = draft.destWarehouse || row.destWarehouse || '未选目的地仓';
      const skuCount = (draft.skus || []).length;
      const activeCls = id === modalEditorState.activeBatchId ? 'is-active' : '';
      return `
        <div class="spv2-batch-nav-item ${activeCls}" data-batch-nav-id="${id}">
          <div class="spv2-batch-nav-main">
            <b>${esc(row.planNo)}</b>
            <span>${esc(statusLabel)} · ${skuCount} 个 SKU · ${esc(destLabel)}</span>
          </div>
          <button class="spv2-batch-nav-remove" type="button" data-batch-nav-remove="${id}" aria-label="移除 ${esc(row.planNo)}">✕</button>
        </div>`;
    }).join('');
  }

  function configureModalChrome(title, subtitle, submitText) {
    $('#createModalTitle').textContent = title;
    $('#createModalSubtitle').textContent = subtitle;
    $('#createSubmitBtn').textContent = submitText;
    renderBatchEditNav();
    $('#createModalMask').classList.remove('hidden');
    $('#createModal').classList.remove('hidden');
  }

  function resetCreateForm() {
    $('#cShipMethod').value = '本地仓发货';
    $('#cShipWarehouse').value = '跨跃猫物流仓';
    $('#cTransportMode').value = '';
    $('#cDestWarehouse').value = '';
    $('#cEstShipDate').value = '';
    $('#cEstDays').value = '';
    $('#cEstArrivalDate').value = '';
    state.createSkus = [];
    renderCreateSkus();
  }

  $('#createPlanBtn').addEventListener('click', () => {
    modalEditorState.mode = 'create';
    modalEditorState.editRowId = 0;
    modalEditorState.batchIds = [];
    modalEditorState.activeBatchId = 0;
    modalEditorState.drafts = {};
    resetCreateForm();
    configureModalChrome('新建发货计划', '填写发货计划与物流轨迹，并添加发货 SKU 明细', '提交');
  });

  function openSingleEditModal(id) {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    if (!canEditPlanRow(row)) {
      toast(row.shippingOrderNo ? `计划 ${row.planNo} 已生成发货单，不支持编辑` : `计划 ${row.planNo} 当前状态不支持编辑`);
      return;
    }
    modalEditorState.mode = 'edit';
    modalEditorState.editRowId = id;
    modalEditorState.batchIds = [];
    modalEditorState.activeBatchId = 0;
    modalEditorState.drafts = {};
    loadDraftIntoForm(snapshotRowToDraft(row));
    configureModalChrome('编辑发货计划', `发货计划：${row.planNo} · 修改后点击保存生效`, '保存');
  }

  function openBatchEditModal(selectedRows) {
    if (!selectedRows.length) return;
    modalEditorState.mode = 'batch-edit';
    modalEditorState.editRowId = 0;
    modalEditorState.batchIds = selectedRows.map(r => r.id);
    modalEditorState.drafts = {};
    selectedRows.forEach(r => {
      modalEditorState.drafts[r.id] = snapshotRowToDraft(r);
    });
    modalEditorState.activeBatchId = selectedRows[0].id;
    loadDraftIntoForm(modalEditorState.drafts[modalEditorState.activeBatchId]);
    configureModalChrome(
      '批量编辑发货计划',
      `已选 ${selectedRows.length} 个发货计划 · 修改自动暂存，底部按钮统一生效`,
      '保存全部'
    );
  }

  $('#batchEditBtn').addEventListener('click', () => {
    const selectedRows = rows.filter(r => state.selected.has(r.id));
    if (!selectedRows.length) {
      toast('请先勾选需要编辑的发货计划');
      return;
    }
    const invalidShipOrder = selectedRows.filter(r => Boolean(r.shippingOrderNo));
    if (invalidShipOrder.length) {
      toast(`已生成发货单的计划不支持编辑：${invalidShipOrder.map(r => r.planNo).join('、')}`);
      return;
    }
    const invalidStatus = selectedRows.filter(r => !canEditPlanRow(r));
    if (invalidStatus.length) {
      toast(`当前状态不支持编辑（仅待确认/待创建货件/待复核/待生成发货单可编辑）：${invalidStatus.map(r => r.planNo).join('、')}`);
      return;
    }
    openBatchEditModal(selectedRows);
  });

  $('#batchEditNavList').addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-batch-nav-remove]');
    if (removeBtn) {
      e.stopPropagation();
      const removeId = Number(removeBtn.dataset.batchNavRemove);
      saveFormToActiveDraft();
      modalEditorState.batchIds = modalEditorState.batchIds.filter(id => id !== removeId);
      delete modalEditorState.drafts[removeId];
      if (!modalEditorState.batchIds.length) {
        closeCreateModal();
        toast('已移除全部发货计划，本次批量编辑取消');
        return;
      }
      if (modalEditorState.activeBatchId === removeId) {
        modalEditorState.activeBatchId = modalEditorState.batchIds[0];
        loadDraftIntoForm(modalEditorState.drafts[modalEditorState.activeBatchId]);
      }
      $('#createModalSubtitle').textContent = `已选 ${modalEditorState.batchIds.length} 个发货计划 · 修改自动暂存，底部按钮统一生效`;
      renderBatchEditNav();
      return;
    }
    const navItem = e.target.closest('[data-batch-nav-id]');
    if (!navItem) return;
    const nextId = Number(navItem.dataset.batchNavId);
    if (nextId === modalEditorState.activeBatchId) return;
    saveFormToActiveDraft();
    modalEditorState.activeBatchId = nextId;
    loadDraftIntoForm(modalEditorState.drafts[nextId]);
    renderBatchEditNav();
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
        const fnskuOptions = Array.isArray(item.fnskuList) && item.fnskuList.length
          ? item.fnskuList
          : (item.fnsku && item.fnsku !== '-' ? [item.fnsku] : []);
        state.createSkus.push({
          ...item,
          fnskuList: fnskuOptions,
          asin: '',
          fnsku: fnskuOptions.length === 1 ? fnskuOptions[0] : '',
          team: '',
          platform: '',
          store: '',
          opsOwner: '',
          pickupWarehouse: [],
          planShipQty: '',
          remark: ''
        });
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
      s[key] = key === 'planShipQty' ? (e.target.value === '' ? '' : (Number(e.target.value) || 0)) : e.target.value;
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
    if (modalEditorState.mode === 'batch-edit') {
      saveFormToActiveDraft();
      renderBatchEditNav();
    }
  });
  $('#cDestWarehouse').addEventListener('change', () => {
    if (modalEditorState.mode === 'batch-edit') {
      saveFormToActiveDraft();
      renderBatchEditNav();
    }
  });

  function readCurrentFormDraft() {
    return {
      shipMethod: $('#cShipMethod').value,
      shipWarehouse: $('#cShipWarehouse').value,
      transportMode: $('#cTransportMode').value || '',
      destWarehouse: $('#cDestWarehouse').value || '',
      estShipDate: $('#cEstShipDate').value || '',
      estDays: $('#cEstDays').value || '',
      estArrivalDate: $('#cEstArrivalDate').value || '',
      skus: state.createSkus
    };
  }

  function validatePlanDraft(draft) {
    if (!draft.shipMethod || !draft.shipWarehouse) return '请填写所有带 * 的必填项';
    if (!draft.skus || !draft.skus.length) return '请至少添加一条 SKU 明细';
    for (const s of draft.skus) {
      if (!s.team) return `请为 SKU ${s.sku} 选择团队`;
      if (!(Number(s.planShipQty) > 0)) return `请为 SKU ${s.sku} 填写大于 0 的计划发货数量`;
      const allocs = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty);
      if (!allocs.length) return `请为 SKU ${s.sku} 选择提货仓`;
      if (allocs.some(a => !(Number(a.qty) > 0))) return `请为 SKU ${s.sku} 的所有提货仓填写大于 0 的提货数量`;
      const total = getPickupTotalQty(allocs);
      const planQty = Number(s.planShipQty) || 0;
      if (total > planQty) {
        return `SKU ${s.sku} 各提货仓提货数量合计(${total})不能大于计划发货数量(${planQty})`;
      }
    }
    return '';
  }

  function resolveDraftMeta(draft, fallbackDest) {
    const shipWarehouse = draft.shipWarehouse;
    const destWarehouse = draft.destWarehouse !== undefined ? draft.destWarehouse : (fallbackDest || '');
    const shipMethod = draft.shipMethod;
    const logistics = deriveLogisticsInfo(shipWarehouse, destWarehouse, shipMethod);
    const estShipDate = draft.estShipDate || '';
    const estDays = draft.estDays ? Number(draft.estDays) : '';
    const calcArrival = estShipDate && estDays ? addDays(estShipDate, estDays) : '';
    const estArrivalDate = draft.estArrivalDate || (calcArrival !== '-' ? calcArrival : '');
    return { shipWarehouse, transportMode: draft.transportMode || '', destWarehouse, shipMethod, logistics, estShipDate, estDays, estArrivalDate };
  }

  function generateShipmentPlanNo(now) {
    const datePart = String(now || '').slice(2, 10).replace(/-/g, '');
    const prefix = `SP${datePart}`;
    let maxSeq = 0;
    rows.forEach(r => {
      const no = String(r && r.planNo || '');
      if (no.startsWith(prefix)) {
        const tail = Number(no.slice(prefix.length));
        if (Number.isFinite(tail) && tail > maxSeq) maxSeq = tail;
      }
    });
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }

  function buildPlanRowFromSku(s, meta, now, status) {
    const newId = Math.max(0, ...rows.map(r => r.id)) + 1;
    const planNo = generateShipmentPlanNo(now);
    const allocs = normalizePickupAllocs(s.pickupWarehouse, s.planShipQty);
    return {
      id: newId, sku: s.sku, thumbColor: '#2563eb', thumbText: s.sku.slice(0, 2).toUpperCase(), linked: true,
      planNo, lingxingSku: s.lingxingSku, productName: s.productName, model: s.sku,
      cat1: '焊机', cat2: '常规', saleType: '常规', fnsku: (s.fnsku || '').trim() || '-', sellerSku: s.sellerSku, asin: (s.asin || '').trim() || '-',
      store: s.store, platform: s.platform, country: s.country, team: s.team, teamOwner: '王方圆', opsOwner: s.opsOwner,
      pickupWarehouse: allocs, shipWarehouse: meta.shipWarehouse,
      destWarehouse: meta.destWarehouse, destType: '海外仓', shipMethod: meta.shipMethod,
      provider: meta.logistics.provider, providerSub: meta.logistics.providerSub, channel: meta.logistics.channel, boxNo: '',
      transportMode: meta.transportMode, estDays: meta.estDays,
      estShipDate: meta.estShipDate, estArrivalDate: meta.estArrivalDate,
      planShipQty: Number(s.planShipQty) || 1, remark: s.remark, estUnitPrice: 12.0,
      boxSpec: s.boxSpec, boxWeight: 15.0, boxQty: s.boxQty, supplierCode: s.supplierCode,
      planPurchaseQty: Number(s.planShipQty) || 1, planDeliveryDate: meta.estShipDate, demandGap: 0,
      suggestedOrderQty: Number(s.planShipQty) || 1, expectedDeliveryDate: meta.estArrivalDate,
      platformInStock: 0, platformInTransit: 0, overseasInStock: 0, overseasPendingShip: 0, overseasInTransit: 0,
      localInStock: 50, localPendingShip: 0, poTotal: 0, poInTransit: 0, supplierInStock: 0, supplierInProd: 0,
      purchaseNo: '', shippingOrderNo: '', fbaShipmentNo: '', fbaRefId: '',
      status: status || 'pending_confirm', createdAt: now, updatedAt: now, creator: 'Admin', _custom: true
    };
  }

  function applyDraftToExistingRow(row, draft, now) {
    const meta = resolveDraftMeta(draft, row.destWarehouse);
    const primary = draft.skus[0];
    const allocs = normalizePickupAllocs(primary.pickupWarehouse, primary.planShipQty);
    Object.assign(row, {
      sku: primary.sku,
      lingxingSku: primary.lingxingSku || row.lingxingSku,
      productName: primary.productName || row.productName,
      model: primary.sku,
      fnsku: (primary.fnsku || '').trim() || '-',
      sellerSku: primary.sellerSku || row.sellerSku,
      asin: (primary.asin || '').trim() || '-',
      store: primary.store,
      platform: primary.platform,
      country: primary.country || row.country,
      team: primary.team,
      opsOwner: primary.opsOwner,
      pickupWarehouse: allocs,
      shipWarehouse: meta.shipWarehouse,
      destWarehouse: meta.destWarehouse,
      shipMethod: meta.shipMethod,
      provider: meta.logistics.provider,
      providerSub: meta.logistics.providerSub,
      channel: meta.logistics.channel,
      transportMode: meta.transportMode,
      estDays: meta.estDays,
      estShipDate: meta.estShipDate,
      estArrivalDate: meta.estArrivalDate,
      planShipQty: Number(primary.planShipQty) || 1,
      remark: primary.remark || '',
      boxSpec: primary.boxSpec || row.boxSpec,
      boxQty: Number(primary.boxQty) || row.boxQty,
      supplierCode: primary.supplierCode || row.supplierCode,
      planDeliveryDate: meta.estShipDate,
      expectedDeliveryDate: meta.estArrivalDate,
      updatedAt: now
    });
    addLog(row.id, '编辑', `编辑发货计划 ${row.planNo}（SKU：${row.sku}，计划发货数量：${row.planShipQty}）`);
    draft.skus.slice(1).forEach((extraSku, idx) => {
      const extraRow = buildPlanRowFromSku(extraSku, meta, now, row.status);
      rows.unshift(extraRow);
      addLog(extraRow.id, '新建', `编辑 ${row.planNo} 时新增发货计划 ${extraRow.planNo}（明细 #${idx + 2}）`);
    });
  }

  $('#createSubmitBtn').addEventListener('click', () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (modalEditorState.mode === 'create') {
      const draft = readCurrentFormDraft();
      const err = validatePlanDraft(draft);
      if (err) return toast(err);
      const meta = resolveDraftMeta(draft);
      draft.skus.forEach((s, idx) => {
        const newRow = buildPlanRowFromSku(s, meta, now, 'pending_confirm');
        rows.unshift(newRow);
        addLog(newRow.id, '新建', `新建发货计划 ${newRow.planNo}（明细 #${idx + 1}）`);
      });
      closeCreateModal();
      publishV2PlansToBridge();
      applyFilter(false);
      toast(`成功新建 ${draft.skus.length} 条发货计划`);
      return;
    }

    if (modalEditorState.mode === 'edit') {
      const targetRow = rows.find(r => r.id === modalEditorState.editRowId);
      if (!targetRow) return closeCreateModal();
      const draft = readCurrentFormDraft();
      const err = validatePlanDraft(draft);
      if (err) return toast(err);
      applyDraftToExistingRow(targetRow, draft, now);
      closeCreateModal();
      publishV2PlansToBridge();
      applyFilter(false);
      toast(`已保存发货计划 ${targetRow.planNo}`);
      return;
    }

    if (modalEditorState.mode === 'batch-edit') {
      saveFormToActiveDraft();
      for (const id of modalEditorState.batchIds) {
        const row = rows.find(r => r.id === id);
        const draft = modalEditorState.drafts[id];
        if (!row || !draft) continue;
        const err = validatePlanDraft(draft);
        if (err) {
          modalEditorState.activeBatchId = id;
          loadDraftIntoForm(draft);
          renderBatchEditNav();
          toast(`${row.planNo}：${err}`);
          return;
        }
      }
      let updatedCount = 0;
      modalEditorState.batchIds.forEach(id => {
        const row = rows.find(r => r.id === id);
        const draft = modalEditorState.drafts[id];
        if (!row || !draft) return;
        applyDraftToExistingRow(row, draft, now);
        updatedCount += 1;
      });
      closeCreateModal();
      publishV2PlansToBridge();
      applyFilter(false);
      toast(`已保存 ${updatedCount} 个发货计划的修改`);
    }
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
      guideText: '请勿修改模板表头。支持 .xlsx 文件，单次仅导入一个文件，系统将自动校验 SKU、仓库与计划发货数量。',
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
  initMulti('pickupWarehouseMulti', '请选择提货仓', OPTIONS.pickupWarehouses);
  initMulti('shipWarehouseMulti', '请选择发货仓', OPTIONS.shipWarehouses);
  initMulti('destinationWarehouseMulti', '请选择目的地仓', OPTIONS.destWarehouses);
  initMulti('platformMulti', '请选择平台', OPTIONS.platforms);
  initMulti('countryMulti', '请选择国家', OPTIONS.countries);
  initMulti('storeMulti', '请选择店铺', OPTIONS.stores);
  initMulti('teamMulti', '请选择团队', OPTIONS.teams);

  /* FBA 货件 / 发货单 / 提货单 跨页联动桥（localStorage） */
  const FBA_BRIDGE_KEY = 'dmp_fba_plan_v2_bridge';
  if (typeof window !== 'undefined' && window.location && window.location.search.includes('reset=1')) {
    try { localStorage.removeItem(FBA_BRIDGE_KEY); } catch {}
  }

  function readFbaBridge() {
    try {
      const raw = JSON.parse(localStorage.getItem(FBA_BRIDGE_KEY) || '{}');
      return {
        links: raw && typeof raw.links === 'object' && raw.links ? raw.links : {},
        shippingOrderLinks: raw && typeof raw.shippingOrderLinks === 'object' && raw.shippingOrderLinks ? raw.shippingOrderLinks : {},
        unlinkedPlans: Array.isArray(raw && raw.unlinkedPlans) ? raw.unlinkedPlans : [],
        v2PendingPlans: Array.isArray(raw && raw.v2PendingPlans) ? raw.v2PendingPlans : [],
        v2CustomPlans: Array.isArray(raw && raw.v2CustomPlans) ? raw.v2CustomPlans : [],
        v2Overrides: raw && typeof raw.v2Overrides === 'object' && raw.v2Overrides ? raw.v2Overrides : {},
        v2StatusFromUpstream: raw && typeof raw.v2StatusFromUpstream === 'object' && raw.v2StatusFromUpstream ? raw.v2StatusFromUpstream : {},
        fbaShipmentsMeta: raw && typeof raw.fbaShipmentsMeta === 'object' && raw.fbaShipmentsMeta ? raw.fbaShipmentsMeta : {},
        fbaShipmentOrderLinks: raw && typeof raw.fbaShipmentOrderLinks === 'object' && raw.fbaShipmentOrderLinks ? raw.fbaShipmentOrderLinks : {},
        autoShippingOrders: Array.isArray(raw && raw.autoShippingOrders) ? raw.autoShippingOrders : [],
        warehouseStockAdds: raw && typeof raw.warehouseStockAdds === 'object' && raw.warehouseStockAdds ? raw.warehouseStockAdds : {},
        v2PickupDemands: Array.isArray(raw && raw.v2PickupDemands) ? raw.v2PickupDemands : [],
        prelinkedShipments: Array.isArray(raw && raw.prelinkedShipments) ? raw.prelinkedShipments : []
      };
    } catch {
      return {
        links: {}, shippingOrderLinks: {}, unlinkedPlans: [], v2PendingPlans: [],
        v2CustomPlans: [], v2Overrides: {}, v2StatusFromUpstream: {}, fbaShipmentsMeta: {},
        fbaShipmentOrderLinks: {}, autoShippingOrders: [], warehouseStockAdds: {}, v2PickupDemands: [],
        prelinkedShipments: []
      };
    }
  }

  /* 当尚未访问过 FBA 货件页时，内置一份与 FBA 货件页一致的已同步货件快照种子，确保 V2 直接关联可用 */
  const DEFAULT_FBA_META_SEED = {
    FBA18ARC201: {
      id: 'fba-group-8', shipmentNo: 'FBA18ARC201', shipmentName: 'US-MIG200-ONT8-A', reference: '201ONT8A',
      center: 'ONT8', seller: 'ARCCAPTAIN主账号-US', countryCode: 'US', status: 'WORKING', shipmentOrderNo: '',
      children: [{ id: 'fba-8-1', sku: 'ARC-MIG200-US', product: '逆变焊机 MIG200', fnsku: 'X004MIG200', declared: 12, linkedPlans: [] }]
    },
    FBA18XYZ009: {
      id: 'fba-group-12', shipmentNo: 'FBA18XYZ009', shipmentName: 'US-MIG200-ONT8', reference: '209ONT8X',
      center: 'ONT8', seller: 'ARCCAPTAIN主账号-US', countryCode: 'US', status: 'WORKING', shipmentOrderNo: '',
      children: [{ id: 'fba-12-1', sku: 'ARC-MIG200-US', product: '逆变焊机 MIG200', fnsku: 'X004MIG200', declared: 18, linkedPlans: ['SP2611050001'] }]
    },
    FBA18ARC202: {
      id: 'fba-group-9', shipmentNo: 'FBA18ARC202', shipmentName: 'US-MIG200-FTW1-B', reference: '202FTW1B',
      center: 'FTW1', seller: 'ARCCAPTAIN主账号-US', countryCode: 'US', status: 'WORKING', shipmentOrderNo: '',
      children: [{ id: 'fba-9-1', sku: 'ARC-MIG200-US', product: '逆变焊机 MIG200', fnsku: 'X004MIG200', declared: 8, linkedPlans: [] }]
    },
    FBA18ARC203: {
      id: 'fba-group-10', shipmentNo: 'FBA18ARC203', shipmentName: 'US-MIG200-LGB8-C', reference: '203LGB8C',
      center: 'LGB8', seller: 'ARCCAPTAIN主账号-US', countryCode: 'US', status: 'WORKING', shipmentOrderNo: '',
      children: [{ id: 'fba-10-1', sku: 'ARC-MIG200-US', product: '逆变焊机 MIG200', fnsku: 'X004MIG200', declared: 15, linkedPlans: [] }]
    },
    FBA18TEST001: {
      id: 'fba-group-11', shipmentNo: 'FBA18TEST001', shipmentName: 'US-BATCH-LGB8', reference: '204TEST1',
      center: 'LGB8', seller: 'ARCCAPTAIN主账号-US', countryCode: 'US', status: 'WORKING', shipmentOrderNo: '',
      children: [{ id: 'fba-11-1', sku: 'TEST-BATCH-OK', product: 'TEST-LINK-INV-BATCH-OK', fnsku: '-', declared: 2, linkedPlans: [] }]
    },
    FBA19W5V3L7J: {
      id: 'fba-group-3', shipmentNo: 'FBA19W5V3L7J', shipmentName: 'CA-Foot Pedal-YYZ7', reference: '84MQKRVU',
      center: 'YYZ7', seller: 'ARCCAPTAIN主账号-CA', countryCode: 'CA', status: 'SHIPPED', shipmentOrderNo: '',
      children: [
        { id: 'fba-3-1', sku: '10230100501', product: '焊机脚踏开关（TIG通用）', fnsku: 'X004TXODRL', declared: 20, linkedPlans: [] },
        { id: 'fba-3-2', sku: '10230100401', product: '脚踏开关（MIG205MP专用）', fnsku: 'X00588G76B', declared: 36, linkedPlans: ['SHP20261111-05'] }
      ]
    },
    FBA19JV2DS11: {
      id: 'fba-group-6', shipmentNo: 'FBA19JV2DS11', shipmentName: 'US-MIG140-ONT8', reference: '8W2JA3LC',
      center: 'ONT8', seller: 'ARCCAP', countryCode: 'US', status: 'RECEIVING', shipmentOrderNo: 'DN20261108005',
      children: [
        { id: 'fba-6-1', sku: '140US260008', product: 'MIG140 便携式气体保护焊机（美规）', fnsku: 'X00800001', declared: 100, linkedPlans: [] },
        { id: 'fba-6-2', sku: '43201000001', product: '自动变光焊接面罩 Pro 黑金款', fnsku: 'X004LQ7279', declared: 60, linkedPlans: ['SHP20261106-03'] }
      ]
    }
  };

  function getSyncedFbaMetaMap(bridge) {
    const b = bridge || readFbaBridge();
    const meta = { ...(b.fbaShipmentsMeta || {}) };
    if (!Object.keys(meta).length) {
      Object.entries(DEFAULT_FBA_META_SEED).forEach(([k, v]) => {
        meta[k] = JSON.parse(JSON.stringify(v));
      });
    } else {
      Object.entries(DEFAULT_FBA_META_SEED).forEach(([k, v]) => {
        if (!meta[k]) meta[k] = JSON.parse(JSON.stringify(v));
      });
    }
    return meta;
  }

  function isStoreMatchForFba(planStore, seller) {
    const a = String(planStore || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const b = String(seller || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!a || !b) return true;
    if (a === b || b.includes(a) || a.includes(b)) return true;
    if (a.includes('ARCCAPTAIN') && b.includes('ARCCAP')) {
      const ca = a.endsWith('CA'), cb = b.endsWith('CA');
      const us = a.endsWith('US'), ub = b.endsWith('US') || b === 'ARCCAP';
      return (ca && cb) || (us && ub);
    }
    return false;
  }

  function writeFbaBridge(bridge) {
    try {
      localStorage.setItem(FBA_BRIDGE_KEY, JSON.stringify(bridge));
    } catch {}
  }

  function mapDestWarehouseFromFba(grp) {
    const seller = String(grp.seller || '').toUpperCase();
    if (seller.includes('CA')) return '跨跃猫美西一件代发仓 多伦多3仓';
    if (seller.includes('UK')) return 'UK-曼彻斯特海外仓';
    if (seller.includes('DE')) return 'DE-法兰克福海外仓';
    if (String(grp.center || '').toUpperCase() === 'LGB8') return 'LGB8-美西FBA仓';
    if (String(grp.center || '').toUpperCase() === 'ONT8') return 'ONT8-美西FBA仓';
    return '跨跃猫美西一件代发仓 美西仓';
  }

  function tryAutoGenerateDraftOrdersFromV2() {
    const bridge = readFbaBridge();
    const shipments = Object.values(bridge.fbaShipmentsMeta || {});
    if (!shipments.length) return 0;
    const planMap = new Map(rows.map(r => [r.planNo, r]));
    let createdCount = 0;
    const touchedPlanMap = new Map();
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    shipments.forEach(grp => {
      if (!grp || !grp.shipmentNo) return;
      if (bridge.fbaShipmentOrderLinks[grp.shipmentNo] || grp.shipmentOrderNo) return;
      if (['DELETED', 'CANCELLED', 'ABANDONED'].includes(grp.status)) return;
      const children = grp.children || [];
      if (!children.length) return;
      if (children.some(c => !c.linkedPlans || !c.linkedPlans.length)) return;
      const linkedPlanNos = [...new Set(children.flatMap(c => c.linkedPlans || []))];
      const linkedPlans = linkedPlanNos.map(no => planMap.get(no)).filter(Boolean);
      if (linkedPlans.length !== linkedPlanNos.length) return;
      if (!linkedPlans.every(p => p.status === 'pending_shipping_order')) return;

      const orderNo = `DN${nowStr.slice(0, 10).replace(/-/g, '')}${String(Math.floor(100 + Math.random() * 899))}`;
      const items = children.map(c => {
        const pNo = (c.linkedPlans || [])[0] || '';
        const planObj = planMap.get(pNo);
        const qty = Number(c.declared || planObj?.planShipQty || 0);
        return {
          sku: c.sku,
          name: c.product || planObj?.productName || c.sku,
          plan: pNo,
          remark: planObj?.remark || '',
          declare: qty,
          planQty: Number(planObj?.planShipQty || qty),
          pick: 0,
          ship: 0,
          shipped: 0,
          receive: 0,
          status: '草稿'
        };
      });
      const totalDecl = items.reduce((s, it) => s + Number(it.declare || 0), 0);
      bridge.autoShippingOrders = bridge.autoShippingOrders.filter(o => o.fbaShipmentNo !== grp.shipmentNo);
      bridge.autoShippingOrders.unshift({
        id: orderNo,
        creator: '系统自动生成',
        created: nowStr.slice(0, 10),
        status: '草稿',
        logistics: '未提交',
        from: '跨跃猫物流仓',
        to: mapDestWarehouseFromFba(grp),
        shipMode: 'FBA直发',
        channel: '—',
        transport: '海卡（6000）',
        provider: '—',
        country: grp.countryCode === 'US' ? '美国 - US' : (grp.countryCode || '美国 - US'),
        warehouseType: '平台仓',
        shipmentNo: grp.shipmentNo,
        fbaShipmentNo: grp.shipmentNo,
        referenceId: grp.reference || grp.shipmentName || '—',
        remark: `由 FBA 货件 ${grp.shipmentNo} 全量复核通过自动生成`,
        plans: linkedPlanNos.length,
        skus: items.length,
        planQty: items.reduce((s, it) => s + Number(it.planQty || 0), 0),
        declare: totalDecl,
        pick: 0,
        ship: 0,
        receive: 0,
        pendingReceive: 0,
        items
      });
      bridge.fbaShipmentOrderLinks[grp.shipmentNo] = orderNo;
      bridge.shippingOrderDestMap = bridge.shippingOrderDestMap || {};
      bridge.shippingOrderDestMap[orderNo] = mapDestWarehouseFromFba(grp);
      grp.shipmentOrderNo = orderNo;
      linkedPlans.forEach(p => touchedPlanMap.set(p.planNo, p));
      createdCount += 1;
    });

    touchedPlanMap.forEach(p => {
      const syncedShipNos = (p.fbaLinks || [])
        .filter(x => x && x.syncState !== 'prelinked')
        .map(x => x.shipmentNo)
        .filter(Boolean);
      const rawNos = syncedShipNos.length
        ? syncedShipNos
        : String(p.fbaShipmentNo || '').split(/[、,，]+/).map(s => s.trim()).filter(Boolean);
      const linkedFromMeta = shipments
        .filter(g => (g.children || []).some(c => (c.linkedPlans || []).includes(p.planNo)))
        .map(g => g.shipmentNo);
      const shipNos = [...new Set([...rawNos, ...linkedFromMeta])];
      const hasPendingPrelink = (bridge.prelinkedShipments || []).some(pr => pr && pr.planNo === p.planNo)
        || (p.fbaLinks || []).some(x => x && x.syncState === 'prelinked');
      const allOrderNos = [...new Set(shipNos.map(no => {
        if (bridge.fbaShipmentOrderLinks[no]) return bridge.fbaShipmentOrderLinks[no];
        const metaGrp = bridge.fbaShipmentsMeta && bridge.fbaShipmentsMeta[no];
        return (metaGrp && metaGrp.shipmentOrderNo) || '';
      }).filter(Boolean))];
      const mergedOrderNos = allOrderNos.join('、');
      const allShipmentsGenerated = !hasPendingPrelink && shipNos.length > 0 && shipNos.every(no => {
        if (bridge.fbaShipmentOrderLinks[no]) return true;
        const metaGrp = bridge.fbaShipmentsMeta && bridge.fbaShipmentsMeta[no];
        return Boolean(metaGrp && metaGrp.shipmentOrderNo);
      });
      p.shippingOrderNo = mergedOrderNos;
      p.updatedAt = nowStr;
      bridge.shippingOrderLinks[p.planNo] = mergedOrderNos;
      if (allShipmentsGenerated) {
        p.status = 'pending_ship';
        bridge.v2Overrides[p.planNo] = {
          ...(bridge.v2Overrides[p.planNo] || {}),
          status: 'pending_ship',
          bridgeVer: 2,
          updatedAt: nowStr
        };
        bridge.v2StatusFromUpstream[p.planNo] = {
          ...(bridge.v2StatusFromUpstream[p.planNo] || {}),
          status: 'pending_ship',
          arrivalSubStatus: '',
          shippingOrderNo: mergedOrderNos
        };
        addLog(p.id, '自动生成发货单', `关联的全部 FBA 货件（${shipNos.join('、')}）均已生成草稿发货单（${mergedOrderNos}），计划进入「待发货」`);
      } else {
        bridge.v2StatusFromUpstream[p.planNo] = {
          ...(bridge.v2StatusFromUpstream[p.planNo] || {}),
          status: 'pending_shipping_order',
          arrivalSubStatus: '',
          shippingOrderNo: mergedOrderNos
        };
        addLog(p.id, '部分货件生成发货单', `已生成草稿发货单（${mergedOrderNos}），其余关联货件尚未全部生单，计划暂保持「待生成发货单」`);
      }
    });

    if (createdCount > 0) writeFbaBridge(bridge);
    return createdCount;
  }

  function applyFbaBridgeToV2Rows() {
    const bridge = readFbaBridge();
    bridge.v2CustomPlans.forEach(cp => {
      if (!rows.some(r => r.planNo === cp.planNo)) {
        const migrated = { ...cp, _custom: true };
        if (migrated.status === 'pending_ship' && !migrated.shippingOrderNo) {
          migrated.status = migrated.team === '亚马逊团队'
            ? (migrated.fbaShipmentNo ? 'pending_shipping_order' : 'pending_fba_create')
            : 'pending_shipping_order';
        }
        rows.unshift(migrated);
        if (!logsByPlan.has(cp.id)) addLog(cp.id, '新建', `新建发货计划 ${cp.planNo}`);
      }
    });
    const unlinkedSet = new Set(bridge.unlinkedPlans);
    const metaMap = getSyncedFbaMetaMap(bridge);
    rows.forEach(r => {
      const ov = bridge.v2Overrides[r.planNo];
      if (ov && typeof ov === 'object') {
        if (ov.bridgeVer === 2 && ov.status && STATUS_META[ov.status]) {
          r.status = ov.status;
          if (ov.arrivalSubStatus !== undefined) r.arrivalSubStatus = ov.arrivalSubStatus;
        }
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
        r.fbaLinks = [];
        r.planDiffOverride = null;
      }
      const link = bridge.links[r.planNo];
      if (link && link.shipmentNo) {
        r.fbaShipmentNo = link.shipmentNo;
        r.fbaRefId = link.shipmentName || '';
        r.fbaLinkCount = Number(link.shipmentCount || String(link.shipmentNo).split(/[、,，]+/).filter(Boolean).length || 1);
        r.fbaLinkDeclaredQty = Number(link.declaredTotal || 0);
        if (Array.isArray(link.items)) {
          r.fbaLinks = link.items.map(it => ({ ...it }));
        } else {
          const nos = String(link.shipmentNo).split(/[、,，]+/).map(s => s.trim()).filter(Boolean);
          r.fbaLinks = nos.map(no => {
            const grp = metaMap[no];
            const ch = grp && (grp.children || []).find(c => (c.linkedPlans || []).includes(r.planNo) || String(c.sku).toLowerCase() === String(r.sku).toLowerCase());
            return {
              shipmentNo: no,
              shipmentName: (grp && grp.shipmentName) || '',
              sku: r.sku,
              declaredQty: ch ? Number(ch.declared || 0) : 0,
              syncState: grp ? 'synced' : 'prelinked',
              shippingOrderNo: (grp && grp.shipmentOrderNo) || (bridge.fbaShipmentOrderLinks && bridge.fbaShipmentOrderLinks[no]) || ''
            };
          });
        }
      } else if (!Array.isArray(r.fbaLinks)) {
        r.fbaLinks = r.fbaShipmentNo
          ? String(r.fbaShipmentNo).split(/[、,，]+/).map(s => s.trim()).filter(Boolean).map(no => ({
              shipmentNo: no,
              shipmentName: r.fbaRefId || '',
              sku: r.sku,
              declaredQty: Number(r.fbaLinkDeclaredQty || r.planShipQty || 0),
              syncState: 'synced',
              shippingOrderNo: r.shippingOrderNo || ''
            }))
          : [];
      }
      const up = bridge.v2StatusFromUpstream[r.planNo];
      if (up && typeof up === 'object' && STATUS_META[up.status]) {
        r.status = up.status;
        r.arrivalSubStatus = up.arrivalSubStatus || '';
        if (up.planDiff !== undefined) r.planDiffOverride = up.planDiff;
        if (up.shippingOrderNo !== undefined) r.shippingOrderNo = up.shippingOrderNo;
        if (up.fbaShipmentNo !== undefined) r.fbaShipmentNo = up.fbaShipmentNo;
        if (up.fbaRefId !== undefined) r.fbaRefId = up.fbaRefId;
      }
    });
  }

  function publishV2PlansToBridge() {
    const bridge = readFbaBridge();
    bridge.v2CustomPlans = rows.filter(r => r._custom);
    bridge.v2Overrides = {};
    rows.forEach(r => {
      bridge.v2Overrides[r.planNo] = {
        bridgeVer: 2,
        status: r.status,
        arrivalSubStatus: r.arrivalSubStatus || '',
        pickupWarehouse: r.pickupWarehouse,
        updatedAt: r.updatedAt
      };
    });
    const toCandidateObj = r => ({
      id: `v2-plan-${r.id}`,
      plan: r.planNo,
      team: r.team,
      platform: r.platform === '亚马逊' ? 'Amazon' : r.platform,
      sku: r.sku,
      msku: r.sellerSku || r.sku,
      fnsku: r.fnsku || '-',
      product: r.productName,
      store: r.store,
      center: r.destWarehouse,
      status: (STATUS_META[r.status] || {}).label || r.status,
      statusKey: r.status,
      quantity: r.planShipQty,
      shipDate: r.estShipDate,
      arrivalDate: r.estArrivalDate,
      remark: r.remark || '',
      pickupSummary: formatPickupSummary(r.pickupWarehouse),
      pickupWarehouse: normalizePickupAllocs(r.pickupWarehouse, r.planShipQty),
      fromV2: true
    });
    bridge.v2PendingPlans = rows
      .filter(r => r.team === '亚马逊团队' && ['pending_fba_create', 'pending_review', 'pending_shipping_order'].includes(r.status))
      .map(toCandidateObj);
    bridge.v2ShipOrderCandidates = rows
      .filter(r => r.status === 'pending_shipping_order' && !r.shippingOrderNo)
      .map(toCandidateObj);
    bridge.v2PickupDemands = rows
      .filter(r => ['pending_fba_create', 'pending_review', 'pending_shipping_order', 'pending_ship', 'pending_arrival', 'completed'].includes(r.status))
      .map(r => ({
        planNo: r.planNo,
        sku: r.sku,
        lingxingSku: r.lingxingSku || r.sku,
        productName: r.productName,
        team: r.team,
        opsOwner: r.opsOwner || '—',
        platform: r.platform || '—',
        store: r.store || '—',
        country: r.country || '—',
        planRemark: r.remark || '',
        fnsku: r.fnsku || '—',
        supplierCode: r.supplierCode || '—',
        destWarehouse: r.destWarehouse || '—',
        shipMethod: r.shipMethod || '—',
        expectedDeliveryDate: r.expectedDeliveryDate || r.estArrivalDate || '—',
        statusKey: r.status,
        statusLabel: (STATUS_META[r.status] || {}).label || r.status,
        shippingOrderNo: r.shippingOrderNo || '',
        shipWarehouse: r.shipWarehouse,
        planShipQty: r.planShipQty,
        updatedAt: r.updatedAt || '',
        allocs: normalizePickupAllocs(r.pickupWarehouse, r.planShipQty).filter(a => OPTIONS.pickupWarehouses.includes(a.warehouse))
      }));
    writeFbaBridge(bridge);
  }

  /* ===================== 发货计划 V2：关联 FBA 货件（1对多 + 预关联 + 一次性关联完成） ===================== */
  const FBA_SHIPMENT_STATUS_LABEL = {
    UNCONFIRMED: '未确认',
    WORKING: '待发货-已创建',
    READY_TO_SHIP: '待发货-已装箱',
    SHIPPED: '运输中-已取件',
    IN_TRANSIT: '运输中-已通知',
    DELIVERED: '已到达-待登记',
    CHECKED_IN: '已到达-待入库',
    RECEIVING: '已到达-入库中',
    CLOSED: '已完成'
  };

  let v2FbaLinkState = { items: [], activeIdx: 0, search: '' };

  function getActiveV2FbaItem() {
    return v2FbaLinkState.items[v2FbaLinkState.activeIdx] || null;
  }

  function findMatchedChildInGroup(grp, plan) {
    if (!grp || !Array.isArray(grp.children)) return null;
    const pLxSku = String(plan.lingxingSku || '').trim().toLowerCase();
    if (!pLxSku || pLxSku === '-') return null;
    const sameLxSku = grp.children.filter(c => {
      const cSku = String(c.sku || '').trim().toLowerCase();
      const cLx = String(c.lingxingSku || '').trim().toLowerCase();
      return cSku === pLxSku || cLx === pLxSku;
    });
    return sameLxSku.length ? sameLxSku[0] : null;
  }

  function getCandidateFbaShipmentsForPlan(plan, metaMap, searchVal, pickedSet) {
    const tokens = splitTokens(searchVal || '');
    const picked = pickedSet || new Set();
    const list = [];
    Object.values(metaMap || {}).forEach(grp => {
      if (!grp || !grp.shipmentNo) return;
      if (['DELETED', 'CANCELLED', 'ABANDONED'].includes(grp.status)) return;
      const isPicked = picked.has(grp.shipmentNo);
      if (!isPicked) {
        if (!tokens.length) return;
        const hay = `${grp.shipmentNo} ${grp.shipmentName || ''} ${grp.reference || ''} ${grp.center || ''} ${grp.seller || ''}`.toLowerCase();
        if (!tokens.some(t => hay.includes(t))) return;
      }
      const matchedChild = findMatchedChildInGroup(grp, plan);
      const storeOk = isStoreMatchForFba(plan.store, grp.seller);
      const targetChild = matchedChild || (grp.children && grp.children[0]) || null;
      const skuMismatch = !matchedChild;
      const occupiedBy = ((targetChild && targetChild.linkedPlans) || []).filter(p => p !== plan.planNo);
      const childSku = targetChild ? (targetChild.sku || '—') : '—';
      const lingxingSku = targetChild ? (targetChild.lingxingSku || targetChild.sku || '—') : '—';
      const childFnsku = targetChild ? (targetChild.fnsku || '—') : '—';
      const childProduct = targetChild ? (targetChild.product || targetChild.name || targetChild.productName || childSku) : '—';
      list.push({
        shipmentNo: grp.shipmentNo,
        shipmentName: grp.shipmentName || '—',
        reference: grp.reference || '',
        status: grp.status || 'WORKING',
        seller: grp.seller || '',
        center: grp.center || '',
        shipmentOrderNo: grp.shipmentOrderNo || '',
        declaredQty: matchedChild ? Number(matchedChild.declared || 0) : (targetChild ? Number(targetChild.declared || 0) : 0),
        childSku,
        lingxingSku,
        childFnsku,
        childProduct,
        occupiedBy,
        skuMismatch,
        isMatch: Boolean(matchedChild && storeOk),
        isPicked
      });
    });
    list.sort((a, b) => {
      if (a.isPicked !== b.isPicked) return a.isPicked ? -1 : 1;
      if (a.occupiedBy.length !== b.occupiedBy.length) return a.occupiedBy.length - b.occupiedBy.length;
      if (a.isMatch !== b.isMatch) return a.isMatch ? -1 : 1;
      return a.shipmentNo.localeCompare(b.shipmentNo);
    });
    return list;
  }

  function calcItemLinkStats(item, metaMap) {
    const plan = item.plan;
    let syncedQty = 0;
    const syncedList = [];
    item.pickedSyncedNos.forEach(sNo => {
      const grp = metaMap[sNo];
      const ch = grp ? (findMatchedChildInGroup(grp, plan) || (grp.children && grp.children[0])) : null;
      const q = ch ? Number(ch.declared || 0) : Number(item.knownQtyMap[sNo] || 0);
      syncedQty += q;
      syncedList.push({
        shipmentNo: sNo,
        shipmentName: (grp && grp.shipmentName) || '',
        declaredQty: q,
        shippingOrderNo: (grp && grp.shipmentOrderNo) || ''
      });
    });
    const totalCount = syncedList.length;
    const planQty = Number(plan.planShipQty || 0);
    const diff = syncedQty - planQty;
    return { syncedQty, syncedList, totalCount, planQty, hasPrelink: false, diff };
  }

  function renderV2FbaModal() {
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    const activeItem = getActiveV2FbaItem();
    if (!activeItem) return;

    const sidebar = $('#v2FbaSidebar');
    sidebar.classList.remove('hidden');
    const doneCnt = v2FbaLinkState.items.filter(it => it.pickedSyncedNos.size > 0).length;
    $('#v2FbaSidebarProgress').textContent = `${doneCnt} / ${v2FbaLinkState.items.length}`;
    $('#v2FbaSidebarList').innerHTML = v2FbaLinkState.items.map((it, idx) => {
      const st = calcItemLinkStats(it, metaMap);
      const cls = idx === v2FbaLinkState.activeIdx ? 'active' : '';
      const statusTag = st.totalCount === 0
        ? '<span style="color:#909399">未选货件</span>'
        : st.diff === 0
          ? `<span style="color:#52a31b">${st.totalCount} 货件 · 无差异</span>`
          : `<span style="color:#f56c6c">${st.totalCount} 货件 · 差 ${st.diff > 0 ? `+${st.diff}` : st.diff}</span>`;
      return `<button class="spv2-fba-nav-item ${cls}" type="button" data-v2fba-nav="${idx}">
        <div class="spv2-fba-nav-top"><span>${esc(it.plan.planNo)}</span>${statusTag}</div>
        <div class="spv2-fba-nav-sub">${esc(it.plan.sku)} · 计划 ${it.plan.planShipQty} 件</div>
      </button>`;
    }).join('');

    const stats = calcItemLinkStats(activeItem, metaMap);
    const plan = activeItem.plan;
    let diffText = '—';
    let diffCls = '';
    if (stats.totalCount > 0) {
      if (stats.diff === 0) {
        diffText = '0（完全匹配）';
        diffCls = 'is-ok';
      } else {
        diffText = `${stats.diff > 0 ? `+${stats.diff}` : stats.diff}（提交待复核）`;
        diffCls = 'is-err';
      }
    }
    const skuAsinFnsku = `${plan.sku || '-'} / ${plan.asin || '-'} / ${plan.fnsku || '-'}`;
    $('#v2FbaPlanCtx').innerHTML = `
      <div class="spv2-fba-ctx-item"><span>发货计划号</span><b title="${esc(plan.planNo)}">${esc(plan.planNo)}</b></div>
      <div class="spv2-fba-ctx-item"><span>SKU / ASIN / FNSKU</span><b title="${esc(skuAsinFnsku)}">${esc(skuAsinFnsku)}</b></div>
      <div class="spv2-fba-ctx-item"><span>计划发货数量</span><b>${stats.planQty} 件</b></div>
      <div class="spv2-fba-ctx-item"><span>已选申报合计</span><b>${stats.syncedQty} 件</b></div>
      <div class="spv2-fba-ctx-item"><span>计划差额</span><b class="${diffCls}">${esc(diffText)}</b></div>
    `;

    const hasQueried = splitTokens(v2FbaLinkState.search || '').length > 0;
    const cands = getCandidateFbaShipmentsForPlan(plan, metaMap, v2FbaLinkState.search, activeItem.pickedSyncedNos);
    const tbody = $('#v2FbaTableBody');
    if (!cands.length) {
      const emptyMsg = hasQueried
        ? '未查询到匹配的 FBA 货件，请核对输入的 FBA 货件单号'
        : '请输入 FBA 货件单号并点击「查询」获取货件明细';
      tbody.innerHTML = `<tr><td colspan="8" style="padding:44px 12px;color:#909399">${emptyMsg}</td></tr>`;
    } else {
      tbody.innerHTML = cands.map(c => {
        const picked = activeItem.pickedSyncedNos.has(c.shipmentNo);
        const lockedDn = Boolean(picked && c.shipmentOrderNo && !String(c.shipmentOrderNo).startsWith('DN草稿'));
        const occupiedLock = Boolean(!picked && c.occupiedBy.length);
        const mismatchLock = Boolean(!picked && c.skuMismatch);
        const disabledLock = lockedDn || occupiedLock || mismatchLock;
        const lockTitle = lockedDn
          ? '已生成发货单，不可取消勾选'
          : (mismatchLock
            ? `该货件不含计划领星SKU（${plan.lingxingSku || '-'}），不可关联`
            : (occupiedLock ? `已被 ${c.occupiedBy.join('、')} 占用` : ''));
        const subNote = c.occupiedBy.length
          ? `<div style="font-size:11px;color:#e6a23c">已关联 ${esc(c.occupiedBy.join('、'))}</div>`
          : (mismatchLock
            ? `<div style="font-size:11px;color:#f56c6c">不含计划领星SKU，不可关联</div>`
            : (c.shipmentOrderNo ? `<div style="font-size:11px;color:#1677ff">发货单 ${esc(c.shipmentOrderNo)}</div>` : ''));
        const trCls = [picked ? 'is-picked' : '', disabledLock ? 'is-locked' : ''].filter(Boolean).join(' ');
        const skuText = c.lingxingSku && c.lingxingSku !== c.childSku ? `${c.childSku} / ${c.lingxingSku}` : c.childSku;
        const storeCenter = `${c.seller || '—'} · ${c.center || '—'}`;
        return `<tr class="${trCls}">
          <td><input type="checkbox" class="spv2-check-lg" data-v2fba-pick="${esc(c.shipmentNo)}" ${picked ? 'checked' : ''} ${disabledLock ? `disabled title="${esc(lockTitle)}"` : ''}></td>
          <td title="${esc(c.shipmentNo)}"><b>${esc(c.shipmentNo)}</b>${subNote}</td>
          <td title="${esc(c.shipmentName)}">${esc(c.shipmentName)}</td>
          <td title="${esc(skuText)}">${esc(skuText)}</td>
          <td title="${esc(c.childFnsku)}">${esc(c.childFnsku)}</td>
          <td title="${esc(c.childProduct)}">${esc(c.childProduct)}</td>
          <td title="${esc(storeCenter)}">${esc(storeCenter)}</td>
          <td><b>${c.declaredQty}</b></td>
        </tr>`;
      }).join('');
    }
    const selectableCands = cands.filter(c => !(activeItem.pickedSyncedNos.has(c.shipmentNo) && c.shipmentOrderNo && !String(c.shipmentOrderNo).startsWith('DN草稿')) && !(!activeItem.pickedSyncedNos.has(c.shipmentNo) && (c.occupiedBy.length || c.skuMismatch)));
    $('#v2FbaSelectAllVisible').checked = selectableCands.length > 0 && selectableCands.every(c => activeItem.pickedSyncedNos.has(c.shipmentNo));
    $('#v2FbaSelectAllVisible').disabled = selectableCands.length === 0;
    const clearBtn = $('#v2FbaClearPlanLinksBtn');
    if (clearBtn) {
      clearBtn.hidden = activeItem.pickedSyncedNos.size === 0;
    }

    const allPlansSummary = v2FbaLinkState.items.map(it => {
      const s = calcItemLinkStats(it, metaMap);
      return `${it.plan.planNo}：已选 ${s.totalCount} 货件（申报合计 ${s.syncedQty} 件）`;
    }).join(' ｜ ');
    $('#v2FbaFooterSummary').innerHTML = allPlansSummary || '请查询并勾选要关联的 FBA 货件';
  }

  const v2FbaImportState = { file: null, rowCount: 0, error: '' };

  function switchV2FbaTab(tab) {
    const modal = $('#v2FbaLinkModal');
    if (!modal) return;
    modal.querySelectorAll('[data-fba-tab]').forEach(btn => {
      const active = btn.dataset.fbaTab === tab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    modal.querySelectorAll('[data-fba-panel]').forEach(p => {
      p.hidden = p.dataset.fbaPanel !== tab;
    });
    modal.querySelectorAll('[data-fba-footer]').forEach(f => {
      f.hidden = f.dataset.fbaFooter !== tab;
    });
  }

  function refreshV2FbaImportUI() {
    const hasFile = Boolean(v2FbaImportState.file);
    const canConfirm = hasFile && !v2FbaImportState.error;
    const step2 = $('#v2FbaImportStep2');
    if (step2) step2.classList.toggle('is-active', hasFile);
    const step3 = $('#v2FbaImportStep3');
    if (step3) step3.classList.toggle('is-active', canConfirm);
    const preview = $('#v2FbaImportPreview');
    if (preview) {
      preview.hidden = !hasFile;
      if (hasFile) {
        preview.textContent = `已选择文件：${v2FbaImportState.file.name}（识别到 ${v2FbaImportState.rowCount} 条关联记录）`;
      }
    }
    const errEl = $('#v2FbaImportError');
    if (errEl) {
      errEl.hidden = !v2FbaImportState.error;
      errEl.textContent = v2FbaImportState.error || '';
    }
    const label = $('#v2FbaImportFileLabel');
    if (label) label.textContent = hasFile ? v2FbaImportState.file.name : '尚未选择文件';
    const confirmBtn = $('#v2FbaImportConfirmBtn');
    if (confirmBtn) confirmBtn.disabled = !canConfirm;
  }

  function loadV2FbaImportFile(file) {
    if (!file) return;
    const name = String(file.name || '').toLowerCase();
    const valid = name.endsWith('.xlsx');
    v2FbaImportState.file = valid ? file : null;
    v2FbaImportState.rowCount = valid ? Math.max(2, Math.min(99, Math.round(Number(file.size || 320) / 160))) : 0;
    v2FbaImportState.error = valid ? '' : '文件格式不正确，请上传 .xlsx 文件';
    refreshV2FbaImportUI();
    if (!valid) toast(v2FbaImportState.error);
  }

  function openV2FbaLinkModal(targetPlans, initialTab = 'query') {
    let eligible = (targetPlans || []).filter(r => r && r.team === '亚马逊团队' && ['pending_fba_create', 'pending_review', 'pending_shipping_order'].includes(r.status));
    if (!eligible.length) {
      eligible = rows.filter(r => r && r.team === '亚马逊团队' && ['pending_fba_create', 'pending_review', 'pending_shipping_order'].includes(r.status));
    }
    if (!eligible.length && initialTab === 'query') {
      return toast('当前暂无可关联 FBA 货件的亚马逊团队发货计划');
    }
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    v2FbaLinkState = {
      activeIdx: 0,
      search: '',
      items: eligible.map(r => {
        const pickedSyncedNos = new Set();
        const knownQtyMap = {};
        (r.fbaLinks || []).forEach(lk => {
          if (!lk || !lk.shipmentNo) return;
          if (metaMap[lk.shipmentNo] || lk.syncState !== 'prelinked') {
            pickedSyncedNos.add(lk.shipmentNo);
            knownQtyMap[lk.shipmentNo] = Number(lk.declaredQty || 0);
          }
        });
        if (!pickedSyncedNos.size && r.fbaShipmentNo) {
          String(r.fbaShipmentNo).split(/[、,，]+/).map(s => s.trim()).filter(Boolean).forEach(no => {
            pickedSyncedNos.add(no);
          });
        }
        return { plan: r, pickedSyncedNos, prelinks: [], knownQtyMap };
      })
    };
    v2FbaImportState.file = null;
    v2FbaImportState.rowCount = 0;
    v2FbaImportState.error = '';
    if ($('#v2FbaImportFile')) $('#v2FbaImportFile').value = '';
    refreshV2FbaImportUI();
    if ($('#v2FbaSearchInput')) $('#v2FbaSearchInput').value = '';
    $('#v2FbaLinkMask').classList.remove('hidden');
    $('#v2FbaLinkModal').classList.remove('hidden');
    switchV2FbaTab(initialTab);
    renderV2FbaModal();
  }

  function closeV2FbaLinkModal() {
    $('#v2FbaLinkMask').classList.add('hidden');
    $('#v2FbaLinkModal').classList.add('hidden');
    v2FbaLinkState.items = [];
  }

  function commitV2FbaLinks() {
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let readyCnt = 0;
    let reviewCnt = 0;
    let prelinkCnt = 0;
    let unlinkedCnt = 0;

    v2FbaLinkState.items.forEach(item => {
      const r = item.plan;
      const stats = calcItemLinkStats(item, metaMap);
      const selectedSyncedSet = new Set(stats.syncedList.map(x => x.shipmentNo));

      /* 同步写回 fbaShipmentsMeta，保持「FBA 货件」页面明细状态实时一致 */
      Object.values(metaMap).forEach(grp => {
        if (!grp || !Array.isArray(grp.children)) return;
        const shouldLink = selectedSyncedSet.has(grp.shipmentNo);
        const matchCh = findMatchedChildInGroup(grp, r) || grp.children[0];
        grp.children.forEach(ch => {
          const cur = Array.isArray(ch.linkedPlans) ? ch.linkedPlans : [];
          if (shouldLink && ch === matchCh) {
            if (!cur.includes(r.planNo)) ch.linkedPlans = [...cur, r.planNo];
          } else if (cur.includes(r.planNo)) {
            ch.linkedPlans = cur.filter(p => p !== r.planNo);
          }
        });
      });

      bridge.prelinkedShipments = (bridge.prelinkedShipments || []).filter(p => p && p.planNo !== r.planNo);

      if (stats.totalCount === 0) {
        r.fbaShipmentNo = '';
        r.fbaRefId = '';
        r.fbaLinkCount = 0;
        r.fbaLinkDeclaredQty = 0;
        r.fbaLinks = [];
        r.planDiffOverride = null;
        r.status = 'pending_fba_create';
        r.updatedAt = nowStr;
        delete bridge.links[r.planNo];
        delete bridge.v2StatusFromUpstream[r.planNo];
        if (!bridge.unlinkedPlans.includes(r.planNo)) bridge.unlinkedPlans.push(r.planNo);
        addLog(r.id, '解除关联', `清空发货计划 ${r.planNo} 的 FBA 货件关联，恢复「待创建货件」`);
        unlinkedCnt += 1;
        return;
      }

      const newLinks = [
        ...stats.syncedList.map(s => ({
          shipmentNo: s.shipmentNo,
          shipmentName: s.shipmentName,
          sku: r.sku,
          declaredQty: s.declaredQty,
          syncState: 'synced',
          shippingOrderNo: s.shippingOrderNo || ''
        })),
        ...item.prelinks.map(p => ({
          shipmentNo: p.shipmentNo,
          shipmentName: '',
          sku: r.sku,
          declaredQty: 0,
          declaredHint: Number(p.declaredHint || 0),
          syncState: 'prelinked',
          shippingOrderNo: ''
        }))
      ];
      item.prelinks.forEach(p => {
        bridge.prelinkedShipments.push({
          shipmentNo: p.shipmentNo,
          planNo: r.planNo,
          sku: r.sku,
          fnsku: r.fnsku || '-',
          productName: r.productName || r.sku,
          store: r.store,
          country: r.country || 'US',
          planShipQty: Number(r.planShipQty || 0),
          declaredHint: Number(p.declaredHint || 0),
          createdAt: nowStr
        });
      });

      const allNos = newLinks.map(x => x.shipmentNo).join('、');
      const allNames = newLinks.map(x => x.shipmentName).filter(Boolean).join('、');
      r.fbaLinks = newLinks;
      r.fbaShipmentNo = allNos;
      r.fbaRefId = allNames;
      r.fbaLinkCount = newLinks.length;
      r.fbaLinkDeclaredQty = stats.syncedQty;
      r.updatedAt = nowStr;
      bridge.unlinkedPlans = bridge.unlinkedPlans.filter(p => p !== r.planNo);

      if (stats.hasPrelink) {
        r.status = 'pending_fba_create';
        r.planDiffOverride = null;
        prelinkCnt += 1;
        addLog(r.id, '预关联FBA货件', `计划 ${r.planNo} 已一次性完成关联（含 ${item.prelinks.length} 个待同步预关联单号：${item.prelinks.map(p => p.shipmentNo).join('、')}），待领星同步后自动校验数量差异`);
      } else if (stats.diff === 0) {
        r.status = 'pending_shipping_order';
        r.planDiffOverride = 0;
        readyCnt += 1;
        addLog(r.id, '关联FBA货件', `计划 ${r.planNo} 一次性关联 FBA 货件 ${allNos}（合计 ${stats.syncedQty} 件，与计划一致），流转至「待生成发货单」`);
      } else {
        r.status = 'pending_review';
        r.planDiffOverride = stats.diff;
        reviewCnt += 1;
        addLog(r.id, '关联FBA货件（待复核）', `计划 ${r.planNo} 关联 FBA 货件 ${allNos}（合计 ${stats.syncedQty} 件，计划 ${stats.planQty} 件，差额 ${stats.diff > 0 ? `+${stats.diff}` : stats.diff}），流转至「待复核」`);
      }

      bridge.links[r.planNo] = {
        shipmentNo: allNos,
        shipmentName: allNames,
        shipmentCount: newLinks.length,
        declaredTotal: stats.syncedQty,
        items: newLinks
      };
      bridge.v2StatusFromUpstream[r.planNo] = {
        status: r.status,
        arrivalSubStatus: '',
        planDiff: r.planDiffOverride === null ? undefined : r.planDiffOverride,
        fbaShipmentNo: allNos,
        fbaRefId: allNames
      };
    });

    bridge.fbaShipmentsMeta = metaMap;
    writeFbaBridge(bridge);
    publishV2PlansToBridge();
    const autoCount = tryAutoGenerateDraftOrdersFromV2();
    publishV2PlansToBridge();
    closeV2FbaLinkModal();
    applyFilter(false);

    const msgs = [];
    if (autoCount > 0) msgs.push(`已触发自动生成 ${autoCount} 张草稿发货单`);
    if (readyCnt > 0 && autoCount === 0) msgs.push(`${readyCnt} 条无差异进入「待生成发货单」`);
    if (reviewCnt > 0) msgs.push(`${reviewCnt} 条存在差异已提交「待复核」`);
    if (prelinkCnt > 0) msgs.push(`${prelinkCnt} 条已记录预关联（待领星同步）`);
    if (unlinkedCnt > 0) msgs.push(`${unlinkedCnt} 条已清空关联`);
    toast(`关联完成：${msgs.join('；') || '已更新'}`);
  }

  $('#linkFbaBtn').addEventListener('click', () => {
    const selectedRows = rows.filter(r => state.selected.has(r.id));
    openV2FbaLinkModal(selectedRows, 'query');
  });
  $('#unlinkFbaBtn').addEventListener('click', () => {
    const targets = rows.filter(r => state.selected.has(r.id) && r.team === '亚马逊团队' && Boolean(r.fbaShipmentNo) && ['pending_fba_create', 'pending_review', 'pending_shipping_order'].includes(r.status) && !r.shippingOrderNo);
    if (!targets.length) {
      return toast('请先勾选已关联 FBA 货件且尚未生成正式发货单的亚马逊发货计划');
    }
    unlinkFbaPlans(targets);
  });
  $('#v2FbaClearPlanLinksBtn').addEventListener('click', () => {
    const activeItem = getActiveV2FbaItem();
    if (!activeItem || !activeItem.pickedSyncedNos.size) return;
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    let lockedCnt = 0;
    Array.from(activeItem.pickedSyncedNos).forEach(sNo => {
      const grp = metaMap[sNo];
      const lockedDn = Boolean(grp && grp.shipmentOrderNo && !String(grp.shipmentOrderNo).startsWith('DN草稿'));
      if (lockedDn) lockedCnt += 1;
      else activeItem.pickedSyncedNos.delete(sNo);
    });
    renderV2FbaModal();
    if (lockedCnt > 0) {
      toast(`已清空可解绑货件（${lockedCnt} 个货件已生成发货单不可解绑）`);
    } else {
      toast(`已清空 ${activeItem.plan.planNo} 已选的 FBA 货件，点击「关联完成」即可退回待创建货件`);
    }
  });
  $('#v2FbaLinkModal').querySelectorAll('[data-fba-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchV2FbaTab(btn.dataset.fbaTab));
  });
  $('#v2FbaDownloadTplBtn').addEventListener('click', () => {
    toast('已开始下载《发货计划关联FBA货件导入模板.xlsx》');
  });
  $('#v2FbaImportChooseBtn').addEventListener('click', e => {
    e.stopPropagation();
    $('#v2FbaImportFile').click();
  });
  $('#v2FbaImportDrop').addEventListener('click', e => {
    if (!e.target.closest('button')) $('#v2FbaImportFile').click();
  });
  $('#v2FbaImportFile').addEventListener('change', e => {
    loadV2FbaImportFile(e.target.files[0]);
  });
  $('#v2FbaImportDrop').addEventListener('dragover', e => {
    e.preventDefault();
    $('#v2FbaImportDrop').classList.add('is-drag-over');
  });
  $('#v2FbaImportDrop').addEventListener('dragleave', () => {
    $('#v2FbaImportDrop').classList.remove('is-drag-over');
  });
  $('#v2FbaImportDrop').addEventListener('drop', e => {
    e.preventDefault();
    $('#v2FbaImportDrop').classList.remove('is-drag-over');
    loadV2FbaImportFile(e.dataTransfer.files[0]);
  });
  $('#v2FbaImportCancelBtn').addEventListener('click', closeV2FbaLinkModal);
  $('#v2FbaImportConfirmBtn').addEventListener('click', () => {
    if (!v2FbaImportState.file || v2FbaImportState.error) {
      return toast('请先选择正确的导入文件');
    }
    const cnt = v2FbaImportState.rowCount;
    closeV2FbaLinkModal();
    toast(`按单导入关联成功，共处理 ${cnt} 条关联明细`);
  });
  $('#v2FbaCloseBtn').addEventListener('click', closeV2FbaLinkModal);
  $('#v2FbaCancelBtn').addEventListener('click', closeV2FbaLinkModal);
  $('#v2FbaLinkMask').addEventListener('click', closeV2FbaLinkModal);
  $('#v2FbaSidebarList').addEventListener('click', e => {
    const navBtn = e.target.closest('[data-v2fba-nav]');
    if (!navBtn) return;
    v2FbaLinkState.activeIdx = Number(navBtn.dataset.v2fbaNav) || 0;
    v2FbaLinkState.search = '';
    if ($('#v2FbaSearchInput')) $('#v2FbaSearchInput').value = '';
    renderV2FbaModal();
  });
  const triggerV2FbaSearch = () => {
    const val = ($('#v2FbaSearchInput')?.value || '').trim();
    if (!val) {
      toast('请先输入要查询的 FBA 货件单号');
      return;
    }
    v2FbaLinkState.search = val;
    renderV2FbaModal();
  };
  $('#v2FbaSearchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerV2FbaSearch();
    }
  });
  $('#v2FbaSearchBtn').addEventListener('click', triggerV2FbaSearch);
  $('#v2FbaSearchResetBtn').addEventListener('click', () => {
    v2FbaLinkState.search = '';
    if ($('#v2FbaSearchInput')) $('#v2FbaSearchInput').value = '';
    renderV2FbaModal();
  });
  $('#v2FbaSelectAllVisible').addEventListener('change', e => {
    const activeItem = getActiveV2FbaItem();
    if (!activeItem) return;
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    const cands = getCandidateFbaShipmentsForPlan(activeItem.plan, metaMap, v2FbaLinkState.search, activeItem.pickedSyncedNos);
    cands.forEach(c => {
      const lockedDn = Boolean(c.shipmentOrderNo && !String(c.shipmentOrderNo).startsWith('DN草稿'));
      const occupiedLock = Boolean(!activeItem.pickedSyncedNos.has(c.shipmentNo) && c.occupiedBy.length);
      if (e.target.checked && !occupiedLock) activeItem.pickedSyncedNos.add(c.shipmentNo);
      else if (!e.target.checked && !lockedDn) activeItem.pickedSyncedNos.delete(c.shipmentNo);
    });
    renderV2FbaModal();
  });
  $('#v2FbaTableBody').addEventListener('change', e => {
    const cb = e.target.closest('[data-v2fba-pick]');
    const activeItem = getActiveV2FbaItem();
    if (!cb || !activeItem) return;
    const sNo = cb.dataset.v2fbaPick;
    if (cb.checked) activeItem.pickedSyncedNos.add(sNo);
    else activeItem.pickedSyncedNos.delete(sNo);
    renderV2FbaModal();
  });

  function closeV2FbaDiffModal() {
    $('#v2FbaDiffMask').classList.add('hidden');
  }
  $('#v2FbaDiffCloseBtn').addEventListener('click', closeV2FbaDiffModal);
  $('#v2FbaDiffCancelBtn').addEventListener('click', closeV2FbaDiffModal);
  $('#v2FbaDiffConfirmBtn').addEventListener('click', () => {
    closeV2FbaDiffModal();
    commitV2FbaLinks();
  });
  $('#v2FbaSubmitBtn').addEventListener('click', () => {
    const bridge = readFbaBridge();
    const metaMap = getSyncedFbaMetaMap(bridge);
    const discrepancies = [];
    v2FbaLinkState.items.forEach(item => {
      const s = calcItemLinkStats(item, metaMap);
      if (s.totalCount > 0 && s.diff !== 0) {
        discrepancies.push({
          planNo: item.plan.planNo,
          sku: item.plan.sku,
          planQty: s.planQty,
          declaredQty: s.syncedQty,
          diff: s.diff
        });
      }
    });
    if (discrepancies.length) {
      $('#v2FbaDiffBody').innerHTML = discrepancies.map(d => `
        <tr>
          <td><b>${esc(d.planNo)}</b></td>
          <td>${esc(d.sku)}</td>
          <td>${d.planQty}</td>
          <td>${d.declaredQty}</td>
          <td><span style="color:#f56c6c;font-weight:600">${d.diff > 0 ? `+${d.diff}` : d.diff}</span></td>
        </tr>`).join('');
      $('#v2FbaDiffMask').classList.remove('hidden');
      return;
    }
    commitV2FbaLinks();
  });

  window.addEventListener('storage', e => {
    if (e.key === FBA_BRIDGE_KEY) {
      applyFbaBridgeToV2Rows();
      applyFilter(false);
    }
  });

  fillSelect($('#firstMileProvider'), OPTIONS.providers, '头程物流商');
  fillSelect($('#creatorSelect'), OPTIONS.creators, '创建人');
  fillSelect($('#cShipWarehouse'), OPTIONS.shipWarehouses);
  fillSelect($('#cTransportMode'), OPTIONS.transportModes, '请选择运输方式');
  fillSelect($('#cDestWarehouse'), OPTIONS.destWarehouses, '请选择目的地仓');

  applyFbaBridgeToV2Rows();
  publishV2PlansToBridge();
  layoutQueryItems();
  applyFilter(false);
})();
