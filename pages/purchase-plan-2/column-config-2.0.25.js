// 采购计划列表的列配置状态；只保存字段顺序，不保存业务数据。
window.createPurchasePlanColumnConfig = function (variant) {
  const { ref, reactive, computed } = Vue;
  const parentDefs = [
    { key: 'number', label: variant === 1 ? '采购计划批次' : '采购计划号', group: '基础信息', locked: true, tableClass: 'no-col' },
    { key: 'owner', label: '计划负责人', group: '基础信息', tableClass: 'owner-col' },
    { key: 'remark', label: '备注', group: '基础信息', tableClass: 'remark-col' },
    { key: 'createdAt', label: '创建时间', group: '基础信息', tableClass: 'created-at-col' }
  ];
  const childDefs = [
    ...(variant === 1 ? [{ key: 'planNo', label: '采购计划', group: '基础信息', locked: true, tableClass: 'detail-plan-no' }] : []),
    { key: 'sku', label: 'SKU', group: '基础信息', locked: true, tableClass: 'detail-sku' },
    { key: 'lingxingSku', label: '领星 SKU', group: '基础信息', locked: true, tableClass: 'detail-lingxing-sku' },
    { key: 'productName', label: '品名', group: '基础信息', locked: variant === 2, tableClass: 'detail-name' },
    { key: 'team', label: '团队', group: '基础信息', locked: variant === 2, tableClass: 'detail-team' },
    { key: 'purchaseQty', label: '计划采购量', group: '采购数量' },
    { key: 'actualPurchaseQty', label: '实际采购量', group: '采购数量' },
    { key: 'differenceQty', label: '差异数量', group: '采购数量' },
    { key: 'receivedQty', label: '收货数量', group: '采购数量' },
    { key: 'inTransit', label: '采购在途', group: '采购数量' },
    { key: 'purchaseNo', label: '采购单', group: '采购信息' },
    { key: 'purchaseStatus', label: '采购状态', group: '采购信息' },
    { key: 'skuRemark', label: 'SKU 备注', group: '采购信息' },
    { key: 'deliveryDate', label: '期望到货日期', group: '采购信息' },
    { key: 'platform', label: '平台', group: '销售属性' },
    { key: 'store', label: '店铺', group: '销售属性' },
    { key: 'fnsku', label: 'FNSKU', group: '销售属性' },
    { key: 'country', label: '国家', group: '销售属性' },
    { key: 'operator', label: '运营负责人', group: '销售属性' },
    { key: 'warehouse', label: '采购仓库', group: '供应信息' },
    { key: 'purchaser', label: '采购员', group: '供应信息' },
    { key: 'supplier', label: '供应商', group: '供应信息' },
    { key: 'supplierSku', label: '供应商料号', group: '供应信息' },
    { key: 'minOrderQty', label: '最小起订量', group: '供应信息' },
    { key: 'leadTimeDays', label: '交期', group: '供应信息' },
    { key: 'cartons', label: '箱数', group: '供应信息' }
  ];
  const defs = { parent: parentDefs, child: childDefs };
  const defaults = { parent: parentDefs.map(item => item.key), child: childDefs.map(item => item.key) };
  const storageKey = 'purchase-plan-column-config-' + variant;
  const normalize = (tab, keys, mergeMissing) => {
    const available = defs[tab].map(item => item.key);
    let valid = Array.isArray(keys) ? keys.filter((key, index) => available.includes(key) && keys.indexOf(key) === index) : [...available];
    if (Array.isArray(keys) && mergeMissing) {
      // 仅当存储版本落后（存在用户未见过的新列）时，按默认顺序自动补入缺失列（插到默认位置前最后一个已存列之后）
      defaults[tab].forEach(key => {
        if (valid.includes(key)) return;
        const prev = [...defaults[tab].slice(0, defaults[tab].indexOf(key))].reverse().find(item => valid.includes(item));
        if (prev) valid.splice(valid.indexOf(prev) + 1, 0, key);
        else valid.unshift(key);
      });
    }
    const locked = defs[tab].filter(item => item.locked).map(item => item.key);
    return [...locked, ...valid.filter(key => !locked.includes(key))];
  };
  // 列定义有新增时递增此版本号：老配置会自动补入新列一次，之后用户手动隐藏不再被覆盖
  const CONFIG_VERSION = 2;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch {}
  const savedVersion = Number(saved.version) || 0;
  const mergeMissing = savedVersion < CONFIG_VERSION;
  const applied = reactive({ parent: normalize('parent', saved.parent, mergeMissing), child: normalize('child', saved.child, mergeMissing) });
  const draft = reactive({ parent: [], child: [] });
  const columnDialogVisible = ref(false);
  const columnTab = ref('parent');
  const columnSearch = ref('');
  const parentVisibleColumns = computed(() => applied.parent.map(key => parentDefs.find(item => item.key === key)).filter(Boolean));
  const childVisibleColumns = computed(() => applied.child.map(key => childDefs.find(item => item.key === key)).filter(Boolean));
  const currentDefs = computed(() => defs[columnTab.value]);
  const currentSelected = computed(() => draft[columnTab.value].map(key => currentDefs.value.find(item => item.key === key)).filter(Boolean));
  const filteredColumns = computed(() => {
    const query = columnSearch.value.trim().toLowerCase();
    return currentDefs.value.filter(item => item.label.toLowerCase().includes(query));
  });
  const openColumnConfig = () => {
    draft.parent = [...applied.parent];
    draft.child = [...applied.child];
    columnTab.value = 'parent';
    columnSearch.value = '';
    columnDialogVisible.value = true;
  };
  const toggleColumn = (key, checked) => {
    const item = currentDefs.value.find(entry => entry.key === key);
    if (!item || item.locked) return;
    const list = draft[columnTab.value];
    if (checked && !list.includes(key)) list.push(key);
    if (!checked) draft[columnTab.value] = list.filter(value => value !== key);
  };
  let draggedKey = '';
  const dragColumn = (event, key) => {
    if (currentDefs.value.find(item => item.key === key)?.locked) { event.preventDefault(); return; }
    draggedKey = key;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', key);
  };
  const dropColumn = (event, targetKey) => {
    const source = draggedKey || event.dataTransfer.getData('text/plain');
    draggedKey = '';
    const list = draft[columnTab.value];
    if (!source || source === targetKey || !list.includes(source) || !list.includes(targetKey)) return;
    if (currentDefs.value.find(item => item.key === targetKey)?.locked) return;
    const next = list.filter(key => key !== source);
    next.splice(next.indexOf(targetKey), 0, source);
    draft[columnTab.value] = next;
  };
  const restoreColumnDefaults = () => {
    draft.parent = [...defaults.parent];
    draft.child = [...defaults.child];
  };
  const applyColumnConfig = () => {
    applied.parent = normalize('parent', draft.parent);
    applied.child = normalize('child', draft.child);
    try { localStorage.setItem(storageKey, JSON.stringify({ version: CONFIG_VERSION, parent: applied.parent, child: applied.child })); } catch {}
    columnDialogVisible.value = false;
    ElementPlus.ElMessage.success('列配置已应用');
  };
  return { columnDialogVisible, columnTab, columnSearch, parentVisibleColumns, childVisibleColumns, currentSelected, filteredColumns, draft, openColumnConfig, toggleColumn, dragColumn, dropColumn, restoreColumnDefaults, applyColumnConfig };
};

window.purchasePlanDetailTemplate = function (variant) {
  const copyIconSvg = '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.2"/><path d="M8 4V2.6A1.6 1.6 0 0 0 6.4 1H2.6A1.6 1.6 0 0 0 1 2.6v3.8A1.6 1.6 0 0 0 2.6 8H4"/></svg>';
  const numberCell = variant === 1 ? '<td v-if="column.key === \'planNo\' && detail.first" class="detail-plan-no" :rowspan="detail.span">{{ detail.item.planNo }}<span v-if="detail.item.urgent" class="detail-urgent">加急</span></td>' : '';
  return `
    <tr v-if="isExpanded(doc.id)" class="detail-row"><td :colspan="parentVisibleColumns.length + 2"><div class="detail-wrap">
    <table class="purchase-detail-table"><thead><tr><th class="detail-check-col"></th><th v-for="column in childVisibleColumns" :key="column.key" :class="column.tableClass || ''">{{ column.label }}</th></tr></thead>
    <tbody><tr v-for="detail in detailDisplayRows(doc.items)" :key="detail.key">
      <td v-if="detail.first" class="detail-check-col" :rowspan="detail.span"><input type="checkbox" :checked="isDetailSelected(detail.item)" @change="toggleDetail(detail.item, $event)" :aria-label="'选择 SKU ' + detail.item.sku"></td>
      <template v-for="column in childVisibleColumns" :key="column.key">
        ${numberCell}
        <td v-if="column.key === 'sku' && detail.first" class="detail-sku" :rowspan="detail.span">{{ detail.item.sku }}<button class="copy-icon-btn" type="button" title="复制 SKU" aria-label="复制 SKU" @click.stop="copyCellText(detail.item.sku, 'SKU')">${copyIconSvg}</button><span v-if="detail.item.urgent && ${variant} === 2" class="detail-urgent">加急</span><span v-if="detail.span > 1" class="combo-tag">组合品</span><button v-if="isSkuRemoved(doc, detail.component)" class="detail-removed-tag" type="button" :data-meta="JSON.stringify(removedMetaOf(doc, detail.component) || {})" :aria-label="'查看 SKU ' + detail.item.sku + ' 的移除信息'">已移除</button></td>
        <td v-else-if="column.key === 'lingxingSku' && detail.first" class="detail-lingxing-sku" :rowspan="detail.span">{{ detail.item.lingxingSku || '—' }}<button v-if="detail.item.lingxingSku" class="copy-icon-btn" type="button" title="复制领星 SKU" aria-label="复制领星 SKU" @click.stop="copyCellText(detail.item.lingxingSku, '领星 SKU')">${copyIconSvg}</button></td>
        <td v-else-if="column.key === 'productName'" :class="column.tableClass">{{ detail.component.productName }}</td>
        <td v-else-if="column.key === 'team'" :class="column.tableClass">{{ detail.component.team || '—' }}</td>
        <td v-else-if="column.key === 'purchaseQty'">{{ Number(detail.component.purchaseQty || 0).toLocaleString() }}</td>
        <td v-else-if="column.key === 'actualPurchaseQty'">{{ isSkuRemoved(doc, detail.component) ? 0 : (detail.component.actualPurchaseQty == null ? '—' : Number(detail.component.actualPurchaseQty).toLocaleString()) }}</td>
        <td v-else-if="column.key === 'differenceQty'" class="detail-difference">{{ (detail.component.removed || detail.component.actualPurchaseQty == null) ? '—' : (Number(detail.component.actualPurchaseQty) - Number(detail.component.purchaseQty || 0)).toLocaleString() }}</td>
        <td v-else-if="column.key === 'receivedQty'">{{ isSkuRemoved(doc, detail.component) ? 0 : (detail.component.receivedQty == null ? '—' : Number(detail.component.receivedQty).toLocaleString()) }}</td>
        <td v-else-if="column.key === 'inTransit'">{{ purchaseInTransit(detail.component) == null ? '—' : purchaseInTransit(detail.component).toLocaleString() }}</td>
        <td v-else-if="column.key === 'purchaseNo'">{{ isSkuRemoved(doc, detail.component) ? '—' : (detail.component.purchaseNo || '—') }}</td>
        <td v-else-if="column.key === 'purchaseStatus'"><template v-if="isSkuRemoved(doc, detail.component)">—</template><span v-else class="purchase-status" :class="{ 'purchase-status--pending': skuPurchaseStatus(doc, detail.component) === '待提交', 'purchase-status--partial': skuPurchaseStatus(doc, detail.component) === '部分收货' }">{{ skuPurchaseStatus(doc, detail.component) }}</span></td>
        <td v-else-if="column.key === 'purchaser'">{{ detail.component.purchaser || '—' }}</td>
        <td v-else-if="column.key === 'skuRemark'">{{ detail.component.remark || detail.item.remark || '—' }}</td>
        <td v-else-if="column.key === 'deliveryDate'">{{ detail.component.deliveryDate || '—' }}</td>
        <td v-else-if="column.key === 'platform'">{{ detail.component.platform || '—' }}</td>
        <td v-else-if="column.key === 'store'">{{ detail.component.store || '—' }}</td>
        <td v-else-if="column.key === 'fnsku'">{{ detail.component.fnsku || '—' }}</td>
        <td v-else-if="column.key === 'country'">{{ detail.component.country || '—' }}</td>
        <td v-else-if="column.key === 'operator'">{{ detail.component.operator || '—' }}</td>
        <td v-else-if="column.key === 'warehouse'">{{ detail.component.warehouse || '—' }}</td>
        <td v-else-if="column.key === 'supplier'">{{ detail.component.supplier || '—' }}</td>
        <td v-else-if="column.key === 'supplierSku'">{{ detail.component.supplierSku || '—' }}</td>
        <td v-else-if="column.key === 'minOrderQty'">{{ detail.component.minOrderQty == null ? '—' : Number(detail.component.minOrderQty).toLocaleString() }}</td>
        <td v-else-if="column.key === 'leadTimeDays'">{{ detail.component.leadTimeDays == null ? '—' : detail.component.leadTimeDays + ' 天' }}</td>
        <td v-else-if="column.key === 'cartons'">{{ itemCartons(detail.component) }}</td>
      </template>
    </tr><tr v-if="!doc.items.length" class="detail-empty-row"><td :colspan="childVisibleColumns.length + 1">暂无明细</td></tr></tbody>
    </table></div></td></tr>`;
};

window.purchasePlanColumnDialogTemplate = `
  <el-drawer v-model="columnDialogVisible" direction="rtl" size="680px" append-to-body :with-header="false" class="purchase-column-drawer">
    <div class="purchase-column-config">
      <header class="purchase-column-header">
        <div class="purchase-column-title">列配置</div>
        <div class="purchase-column-tabs"><button type="button" :class="{ active: columnTab === 'parent' }" @click="columnTab = 'parent'; columnSearch = ''">一级列表</button><button type="button" :class="{ active: columnTab === 'child' }" @click="columnTab = 'child'; columnSearch = ''">二级列表</button></div>
      </header>
      <div class="purchase-column-content">
        <div class="purchase-column-options">
          <input class="purchase-column-search" v-model="columnSearch" placeholder="搜索字段" aria-label="搜索字段">
          <div class="purchase-column-checks purchase-column-flat"><label v-for="column in filteredColumns" :key="column.key" :class="{ locked: column.locked }"><input type="checkbox" :checked="draft[columnTab].includes(column.key)" :disabled="column.locked" @change="toggleColumn(column.key, $event.target.checked)"><span>{{ column.label }}</span></label></div>
          <div v-if="!filteredColumns.length" class="purchase-column-none">没有匹配的字段</div>
        </div>
        <div class="purchase-column-selected">
          <div class="purchase-column-selected-title">已选 <span>({{ currentSelected.length }})</span></div>
          <p>拖动可调整非固定列顺序</p>
          <div class="purchase-column-selected-list"><div v-for="(column,index) in currentSelected" :key="column.key" class="purchase-column-selected-item" :class="{ locked: column.locked }" :draggable="!column.locked" @dragstart="dragColumn($event,column.key)" @dragover.prevent @drop.prevent="dropColumn($event,column.key)"><span class="purchase-column-grip">{{ column.locked ? '·' : '⋮⋮' }}</span><span class="purchase-column-order">{{ index + 1 }}</span><span>{{ column.label }}</span></div></div>
        </div>
      </div>
      <footer class="purchase-column-footer"><button class="btn" type="button" @click="restoreColumnDefaults">恢复默认</button><div><button class="btn" type="button" @click="columnDialogVisible = false">取消</button><button class="btn primary" type="button" @click="applyColumnConfig">保存并应用</button></div></footer>
    </div>
  </el-drawer>`;
