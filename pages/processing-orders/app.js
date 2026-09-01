(function () {
  const { createApp, ref, reactive, computed } = window.Vue;
  const { ElMessage, ElMessageBox } = window.ElementPlus;

  const clone = value => JSON.parse(JSON.stringify(value));
  const pad = value => String(value).padStart(2, '0');
  const nowText = () => {
    const date = new Date();
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const inventoryBundles = [
    { id: 'EBAY-B20US007109', warehouse: '深圳市华英科技有限公司（SU00001）', team: 'eBay', finishedSku: 'B20US007109', finishedName: 'ProLux + 长手套 + 防护面罩组合', bomVersion: 'V3', components: [
      { sku: '140US260008', name: 'CUT55 ProLux', ratio: 1, occupied: 3, frozen: 0, batches: [{ sourceBatch: 'RK202608120031', receivedAt: '2026-08-12', purchasePlanNo: 'SMT20260805-02-1', qty: 12, unitCost: 1080 }, { sourceBatch: 'RK202608220018', receivedAt: '2026-08-22', purchasePlanNo: 'SMT20260818-01-1', qty: 21, unitCost: 1072 }] },
      { sku: '34101000012', name: '长款手套', ratio: 1, occupied: 2, frozen: 1, batches: [{ sourceBatch: 'RK202608140016', receivedAt: '2026-08-14', purchasePlanNo: 'SMT20260806-07-2', qty: 20, unitCost: 18.5 }, { sourceBatch: 'RK202608250009', receivedAt: '2026-08-25', purchasePlanNo: 'SMT20260821-03-2', qty: 16, unitCost: 18.2 }] },
      { sku: 'B2001000040', name: '手持面罩 + 渣锤 + 塑料套', ratio: 1, occupied: 0, frozen: 0, batches: [{ sourceBatch: 'RK202608100027', receivedAt: '2026-08-10', purchasePlanNo: 'SMT20260802-06-3', qty: 8, unitCost: 22.6 }, { sourceBatch: 'RK202608200041', receivedAt: '2026-08-20', purchasePlanNo: 'SMT20260817-04-3', qty: 22, unitCost: 22.1 }] }
    ]},
    { id: 'AMZ-34001001110', warehouse: '梧州供应商仓', team: '亚马逊团队', finishedSku: '34001001110', finishedName: '焊接帽子迷彩组合套装', bomVersion: 'V2', components: [
      { sku: '34001001110-A', name: '焊接帽子迷彩', ratio: 1, occupied: 4, frozen: 0, batches: [{ sourceBatch: 'WZ-RK20260808012', receivedAt: '2026-08-08', purchasePlanNo: 'AMZ20260801-11', qty: 26, unitCost: 31.5 }, { sourceBatch: 'WZ-RK20260819007', receivedAt: '2026-08-19', purchasePlanNo: 'AMZ20260814-08', qty: 30, unitCost: 31.2 }] },
      { sku: '34101000012', name: '长款手套', ratio: 1, occupied: 0, frozen: 1, batches: [{ sourceBatch: 'WZ-RK20260806008', receivedAt: '2026-08-06', purchasePlanNo: 'AMZ20260729-06', qty: 18, unitCost: 18.4 }, { sourceBatch: 'WZ-RK20260821019', receivedAt: '2026-08-21', purchasePlanNo: 'AMZ20260818-09', qty: 15, unitCost: 18.1 }] }
    ]},
    { id: 'B2B-51001010025', warehouse: '常州供应商仓', team: 'B端团队', finishedSku: '51001010025', finishedName: '小屏焊帽基础组合', bomVersion: 'V1', components: [
      { sku: '51001010025-A', name: '小屏焊帽主体', ratio: 1, occupied: 0, frozen: 0, batches: [{ sourceBatch: 'CZ-RK20260816005', receivedAt: '2026-08-16', purchasePlanNo: 'B2B20260811-05', qty: 10, unitCost: 82 }, { sourceBatch: 'CZ-RK20260823021', receivedAt: '2026-08-23', purchasePlanNo: 'B2B20260819-12', qty: 14, unitCost: 81.5 }] },
      { sku: '51001010025-B', name: '基础面罩配件', ratio: 2, occupied: 2, frozen: 0, batches: [{ sourceBatch: 'CZ-RK20260811016', receivedAt: '2026-08-11', purchasePlanNo: 'B2B20260807-03', qty: 16, unitCost: 6.8 }, { sourceBatch: 'CZ-RK20260824009', receivedAt: '2026-08-24', purchasePlanNo: 'B2B20260820-02', qty: 20, unitCost: 6.6 }] }
    ]}
  ];

  const initialRecords = [
    { orderNo: 'JG202608290003', batchNo: 'JGP202608290003', completedAt: '2026-08-29 09:36:18', warehouse: '深圳市华英科技有限公司（SU00001）', team: 'eBay', finishedSku: 'B20US007109', finishedName: 'ProLux + 长手套 + 防护面罩组合', bomVersion: 'V3', processQty: 8, materialCost: 8968.8, processingFee: 80, operator: 'Admin', status: '已完成', canReverse: true, stockAgeStart: '2026-08-10', remark: '仓库已完成组合装箱', components: [
      { sku: '140US260008', name: 'CUT55 ProLux', consumptions: [{ sourceBatch: 'RK202608120031', receivedAt: '2026-08-12', purchasePlanNo: 'SMT20260805-02-1', qty: 8, unitCost: 1080 }] },
      { sku: '34101000012', name: '长款手套', consumptions: [{ sourceBatch: 'RK202608140016', receivedAt: '2026-08-14', purchasePlanNo: 'SMT20260806-07-2', qty: 8, unitCost: 18.5 }] },
      { sku: 'B2001000040', name: '手持面罩 + 渣锤 + 塑料套', consumptions: [{ sourceBatch: 'RK202608100027', receivedAt: '2026-08-10', purchasePlanNo: 'SMT20260802-06-3', qty: 8, unitCost: 22.6 }] }
    ]},
    { orderNo: 'JG202608280021', batchNo: 'JGP202608280021', completedAt: '2026-08-28 16:12:05', warehouse: '梧州供应商仓', team: '亚马逊团队', finishedSku: '34001001110', finishedName: '焊接帽子迷彩组合套装', bomVersion: 'V2', processQty: 12, materialCost: 598.8, processingFee: 60, operator: '杨琴', status: '已完成', canReverse: false, reverseReason: '该加工批次成品已有下游发货占用，不可直接冲销', stockAgeStart: '2026-08-06', components: [
      { sku: '34001001110-A', name: '焊接帽子迷彩', consumptions: [{ sourceBatch: 'WZ-RK20260808012', receivedAt: '2026-08-08', purchasePlanNo: 'AMZ20260801-11', qty: 12, unitCost: 31.5 }] },
      { sku: '34101000012', name: '长款手套', consumptions: [{ sourceBatch: 'WZ-RK20260806008', receivedAt: '2026-08-06', purchasePlanNo: 'AMZ20260729-06', qty: 12, unitCost: 18.4 }] }
    ]},
    { orderNo: 'JG202608270016', batchNo: 'JGP202608270016', completedAt: '2026-08-27 14:22:41', warehouse: '常州供应商仓', team: 'B端团队', finishedSku: '51001010025', finishedName: '小屏焊帽基础组合', bomVersion: 'V1', processQty: 6, materialCost: 573.6, processingFee: 30, operator: '颜文', status: '已冲销', canReverse: false, stockAgeStart: '2026-08-11', reversedAt: '2026-08-28 10:08:12', reversedBy: '郑豪阳', reverseMemo: '仓库反馈实际只完成 4 套，原单整体冲销后重新补录', components: [
      { sku: '51001010025-A', name: '小屏焊帽主体', consumptions: [{ sourceBatch: 'CZ-RK20260816005', receivedAt: '2026-08-16', purchasePlanNo: 'B2B20260811-05', qty: 6, unitCost: 82 }] },
      { sku: '51001010025-B', name: '基础面罩配件', consumptions: [{ sourceBatch: 'CZ-RK20260811016', receivedAt: '2026-08-11', purchasePlanNo: 'B2B20260807-03', qty: 12, unitCost: 6.8 }] }
    ]}
  ];

  createApp({
    setup() {
      const warehouses = [...new Set(inventoryBundles.map(item => item.warehouse))];
      const teams = [...new Set(inventoryBundles.map(item => item.team))];
      const operators = ['Admin', '杨琴', '颜文', '郑豪阳'];
      const records = ref(clone(initialRecords));
      const filters = reactive({ keyword: '', warehouse: '', team: '', operator: '', status: '', dateRange: [] });
      const appliedFilters = reactive(clone(filters));
      const page = ref(1);
      const pageSize = ref(20);
      const createVisible = ref(false);
      const createStep = ref(0);
      const submitting = ref(false);
      const detailVisible = ref(false);
      const currentRecord = ref(null);
      const reverseVisible = ref(false);
      const reverseTarget = ref(null);
      const reverseMemo = ref('');
      const fifoVisible = ref(false);
      const fifoRows = ref([]);
      const form = reactive({ warehouse: '', team: '', bundleId: '', processQty: 1, completedAt: '', processingFee: 0, remark: '' });

      const availableBundles = computed(() => inventoryBundles.filter(item => item.warehouse === form.warehouse && item.team === form.team));
      const selectedBundle = computed(() => inventoryBundles.find(item => item.id === form.bundleId));
      const componentStock = component => component.batches.reduce((sum, batch) => sum + batch.qty, 0);
      const componentAvailable = component => Math.max(0, componentStock(component) - component.occupied - component.frozen);
      const maxProcessQty = computed(() => selectedBundle.value ? Math.max(0, Math.floor(Math.min(...selectedBundle.value.components.map(component => componentAvailable(component) / component.ratio)))) : 0);
      const fifoPlan = (component, processQty) => {
        let remaining = Math.max(0, processQty * component.ratio);
        const rows = [];
        component.batches.slice().sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)).forEach(batch => {
          if (remaining <= 0) return;
          const qty = Math.min(batch.qty, remaining);
          if (qty > 0) rows.push({ ...batch, stockQty: batch.qty, qty });
          remaining -= qty;
        });
        return rows;
      };
      const estimatedMaterialCost = computed(() => selectedBundle.value ? selectedBundle.value.components.reduce((sum, component) => sum + fifoPlan(component, form.processQty).reduce((subtotal, batch) => subtotal + batch.qty * batch.unitCost, 0), 0) : 0);
      const estimatedUnitCost = computed(() => form.processQty > 0 ? (estimatedMaterialCost.value + Number(form.processingFee || 0)) / form.processQty : 0);

      const filteredRecords = computed(() => records.value.filter(record => {
        const keyword = appliedFilters.keyword.trim().toLowerCase();
        if (keyword && ![record.orderNo, record.batchNo, record.finishedSku, record.finishedName].join(' ').toLowerCase().includes(keyword)) return false;
        if (appliedFilters.warehouse && record.warehouse !== appliedFilters.warehouse) return false;
        if (appliedFilters.team && record.team !== appliedFilters.team) return false;
        if (appliedFilters.operator && record.operator !== appliedFilters.operator) return false;
        if (appliedFilters.status && record.status !== appliedFilters.status) return false;
        if (appliedFilters.dateRange && appliedFilters.dateRange.length === 2) {
          const day = record.completedAt.slice(0, 10);
          if (day < appliedFilters.dateRange[0] || day > appliedFilters.dateRange[1]) return false;
        }
        return true;
      }));
      const pagedRecords = computed(() => filteredRecords.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
      const summary = computed(() => {
        const completed = records.value.filter(item => item.status === '已完成');
        return { completed: completed.length, finishedQty: completed.reduce((sum, item) => sum + item.processQty, 0), componentQty: completed.reduce((sum, item) => sum + totalConsumed(item), 0), totalCost: completed.reduce((sum, item) => sum + item.materialCost + item.processingFee, 0) };
      });

      const money = value => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const unitCost = record => record.processQty ? (record.materialCost + record.processingFee) / record.processQty : 0;
      const totalConsumed = record => (record.components || []).reduce((sum, component) => sum + component.consumptions.reduce((subtotal, row) => subtotal + row.qty, 0), 0);
      const flattenConsumptions = record => (record.components || []).flatMap(component => component.consumptions.map(row => ({ sku: component.sku, name: component.name, ...row })));
      const query = () => { Object.assign(appliedFilters, clone(filters)); page.value = 1; ElMessage.success(`查询完成，共 ${filteredRecords.value.length} 条记录`); };
      const resetFilters = () => { Object.assign(filters, { keyword: '', warehouse: '', team: '', operator: '', status: '', dateRange: [] }); Object.assign(appliedFilters, clone(filters)); page.value = 1; };
      const refresh = () => ElMessage.success('已刷新加工单和最新库存状态');
      const exportRecords = () => ElMessage.success(`已按当前筛选条件生成 ${filteredRecords.value.length} 条加工单导出任务`);
      const resetForm = () => Object.assign(form, { warehouse: '', team: '', bundleId: '', processQty: 1, completedAt: nowText(), processingFee: 0, remark: '' });
      const openCreate = () => { resetForm(); createStep.value = 0; createVisible.value = true; };
      const scopeChanged = () => { form.bundleId = ''; form.processQty = 1; };
      const bundleChanged = () => { form.processQty = Math.min(1, maxProcessQty.value); };
      const nextStep = () => {
        if (createStep.value === 0) {
          if (!form.warehouse || !form.team || !form.bundleId) return ElMessage.warning('请完整选择仓库、团队和组合 SKU');
          if (maxProcessQty.value <= 0) return ElMessage.error('当前同仓同团队范围内子件库存不足，无法加工');
        }
        if (createStep.value === 1) {
          if (!form.processQty || form.processQty < 1) return ElMessage.warning('请输入本次加工数量');
          if (form.processQty > maxProcessQty.value) return ElMessage.error(`库存不足，当前最大可加工 ${maxProcessQty.value} 件`);
          if (!form.completedAt) return ElMessage.warning('请选择实际加工完成时间');
        }
        createStep.value += 1;
      };
      const previewFifo = component => { fifoRows.value = fifoPlan(component, form.processQty); fifoVisible.value = true; };
      const createSerial = prefix => {
        const date = new Date();
        const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
        const maxSerial = records.value.reduce((max, item) => {
          const match = item.orderNo.match(new RegExp(`^JG${day}(\\d{4})$`));
          return match ? Math.max(max, Number(match[1])) : max;
        }, 0);
        return `${prefix}${day}${String(maxSerial + 1).padStart(4, '0')}`;
      };
      const submitProcessing = () => {
        submitting.value = true;
        window.setTimeout(() => {
          const bundle = selectedBundle.value;
          if (!bundle || form.processQty > maxProcessQty.value) {
            submitting.value = false;
            ElMessage.error('提交时库存已发生变化，请返回上一步刷新后重试');
            return;
          }
          const components = bundle.components.map(component => ({ sku: component.sku, name: component.name, consumptions: fifoPlan(component, form.processQty).map(row => ({ sourceBatch: row.sourceBatch, receivedAt: row.receivedAt, purchasePlanNo: row.purchasePlanNo, qty: row.qty, unitCost: row.unitCost })) }));
          const consumedRows = components.flatMap(component => component.consumptions);
          const stockAgeStart = consumedRows.map(item => item.receivedAt).sort()[0];
          const record = { orderNo: createSerial('JG'), batchNo: createSerial('JGP'), completedAt: form.completedAt, warehouse: form.warehouse, team: form.team, finishedSku: bundle.finishedSku, finishedName: bundle.finishedName, bomVersion: bundle.bomVersion, processQty: form.processQty, materialCost: estimatedMaterialCost.value, processingFee: Number(form.processingFee || 0), operator: 'Admin', status: '已完成', canReverse: true, stockAgeStart, remark: form.remark, components };
          bundle.components.forEach(component => {
            let remaining = form.processQty * component.ratio;
            component.batches.slice().sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)).forEach(batch => { const qty = Math.min(batch.qty, remaining); batch.qty -= qty; remaining -= qty; });
          });
          records.value.unshift(record);
          submitting.value = false;
          createVisible.value = false;
          ElMessageBox.alert(`加工单 ${record.orderNo} 已完成：子件库存已按 FIFO 扣减，组合成品库存已增加 ${record.processQty} 件。`, '库存过账成功', { type: 'success', confirmButtonText: '查看加工单' }).then(() => openDetail(record));
        }, 650);
      };
      const openDetail = record => { currentRecord.value = record; detailVisible.value = true; };
      const openReverse = record => { if (!record.canReverse || record.status !== '已完成') return; reverseTarget.value = record; reverseMemo.value = ''; reverseVisible.value = true; };
      const confirmReverse = () => {
        if (!reverseMemo.value.trim()) return ElMessage.warning('请填写冲销原因');
        const target = reverseTarget.value;
        const bundle = inventoryBundles.find(item => item.warehouse === target.warehouse && item.team === target.team && item.finishedSku === target.finishedSku);
        if (bundle) {
          flattenConsumptions(target).forEach(row => {
            const component = bundle.components.find(item => item.sku === row.sku);
            const batch = component && component.batches.find(item => item.sourceBatch === row.sourceBatch);
            if (batch) batch.qty += row.qty;
          });
        }
        target.status = '已冲销'; target.canReverse = false; target.reversedAt = nowText(); target.reversedBy = 'Admin'; target.reverseMemo = reverseMemo.value.trim();
        reverseVisible.value = false;
        ElMessage.success('冲销完成：已生成反向库存流水，原加工单保留用于审计');
      };

      window.setTimeout(() => document.querySelectorAll('[data-page-nav]').forEach(item => item.addEventListener('click', () => { const key = item.dataset.pageNav; if (window.parent !== window) window.parent.postMessage({ type: 'prototype:navigate', page: key }, '*'); })), 0);

      return { warehouses, teams, operators, records, filters, page, pageSize, filteredRecords, pagedRecords, summary, createVisible, createStep, submitting, detailVisible, currentRecord, reverseVisible, reverseTarget, reverseMemo, fifoVisible, fifoRows, form, availableBundles, selectedBundle, maxProcessQty, estimatedMaterialCost, estimatedUnitCost, componentStock, componentAvailable, fifoPlan, money, unitCost, totalConsumed, flattenConsumptions, query, resetFilters, refresh, exportRecords, openCreate, scopeChanged, bundleChanged, nextStep, previewFifo, submitProcessing, openDetail, openReverse, confirmReverse };
    }
  }).use(window.ElementPlus).mount('#app');
})();
