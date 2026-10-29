const { createApp, ref, reactive, computed } = Vue;

const root = document.querySelector('#purchaseBusinessApp');
root.innerHTML = `
  <section class="action-strip ui-action-row"><div class="head-actions"><button class="btn primary" @click="openCreate">新建采购计划</button><button class="btn" v-if="canSubmitAudit && activeStatus === 'draft'" @click="openBatchSubmitAudit">提交审核</button><button class="btn success" v-if="showAuditAction" :disabled="selectedDocs.length === 0" @click="openBatchAudit">审核</button><button class="btn danger" v-if="showVoidAction" :disabled="selectedDocs.length === 0" @click="batchVoid">作废</button><button class="btn" @click="showExport">导出</button><el-dropdown trigger="click" @command="handleMoreCommand"><button class="btn more-action-btn" type="button">更多 <span aria-hidden="true">⌄</span></button><template #dropdown><el-dropdown-menu><el-dropdown-item command="copy">复制</el-dropdown-item><el-dropdown-item command="urgent" :disabled="moreActionsDisabled">加急</el-dropdown-item><el-dropdown-item command="delete" class="more-action-delete" :disabled="moreActionsDisabled">删除</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div><button class="column-config-trigger" type="button" title="列配置" aria-label="列配置" @click="openColumnConfig"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="3" width="15" height="14" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 3v14m5-14v14" stroke="currentColor" stroke-width="1.3"/></svg></button></section>
  <section class="list-card ui-list-card">
    <section class="status-bar"><div class="status-tabs"><button v-for="tab in statusTabs" :key="tab.name" class="status-tab" :class="{active: activeStatus === tab.name}" @click="selectStatus(tab.name)"><span>{{ tab.label }}</span><em>{{ statusCount(tab.name) }}</em></button></div></section>
    <section class="table-area ui-table-wrap">
      <table class="purchase-plan-table document-list ui-table">
        <colgroup><col class="check-col"><col class="expand-col"><col v-for="column in parentVisibleColumns" :key="column.key" :class="column.tableClass"></colgroup>
        <thead><tr><th><input class="head-check" type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected && !allSelected" @change="toggleSelectAll($event)"></th><th><button class="document-expand expand-all" :class="{expanded: expandAllChecked}" type="button" @click="toggleExpandAll" aria-label="展开/折叠全部"></button></th><th v-for="column in parentVisibleColumns" :key="column.key"><template v-if="column.key === 'number'">{{ column.label }}<button class="copy-icon-btn copy-icon-btn-head" type="button" title="复制本页采购计划号" aria-label="复制本页采购计划号" @click.stop="copyPagePlanNos"><svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.2"/><path d="M8 4V2.6A1.6 1.6 0 0 0 6.4 1H2.6A1.6 1.6 0 0 0 1 2.6v3.8A1.6 1.6 0 0 0 2.6 8H4"/></svg></button></template><template v-else>{{ column.label }}</template></th></tr></thead>
        <tbody v-for="doc in pagedDocs" :key="doc.id">
          <tr class="parent-row" :class="{'is-expanded': isExpanded(doc.id)}">
            <td><input class="row-check" type="checkbox" :checked="isSelected(doc)" :indeterminate.prop="isPartiallySelected(doc)" @change="toggleSelect(doc, $event)"></td>
            <td><button class="document-expand" :class="{expanded: isExpanded(doc.id)}" type="button" @click="toggleExpand(doc.id)" aria-label="展开明细"></button></td>
            <template v-for="column in parentVisibleColumns" :key="column.key">
            <td v-if="column.key === 'number'"><div class="doc-line"><button class="link doc-no" type="button" @click="doc.status === 'draft' ? openEdit(doc) : openView(doc)">{{ doc.planNo }}</button><button v-if="doc.planNo" class="copy-icon-btn" type="button" title="复制采购计划号" aria-label="复制采购计划号" @click.stop="copyCellText(doc.planNo, '采购计划号')"><svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.2"/><path d="M8 4V2.6A1.6 1.6 0 0 0 6.4 1H2.6A1.6 1.6 0 0 0 1 2.6v3.8A1.6 1.6 0 0 0 2.6 8H4"/></svg></button><span class="pp-status" :class="'pp-status--' + doc.status">{{ statusMeta(doc.status).label }}</span></div></td>
            <td v-else-if="column.key === 'owner'">{{ doc.planOwner || '—' }}</td>
            <td v-else-if="column.key === 'remark'"><div class="batch-remark"><span class="batch-remark__text" :title="doc.remark || '暂无备注'">{{ doc.remark || '—' }}</span><el-popover placement="bottom-start" :width="330" :visible="editingRemarkId === doc.id" popper-class="batch-remark-popover"><template #reference><button class="batch-remark__edit" type="button" :aria-label="'编辑采购计划 ' + doc.planNo + ' 的备注'" @click.stop="openRemarkEditor(doc)"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9 2.1a1.5 1.5 0 0 1 2.1 2.1l-7.7 7.7-2.8.7.7-2.8 7.7-7.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m9.8 3.2 3 3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button></template><div class="batch-remark-editor"><textarea v-model="remarkDraft" maxlength="500" rows="4" placeholder="请输入备注" :aria-label="'采购计划 ' + doc.planNo + ' 的备注内容'"></textarea><div class="batch-remark-editor__actions"><el-button size="small" @click="cancelRemarkEditor">取消</el-button><el-button size="small" type="primary" @click="saveBatchRemark(doc)">确定</el-button></div></div></el-popover></div></td>
            <td v-else-if="column.key === 'createdAt'">{{ doc.createdAt }}</td>
            </template>
          </tr>
          ${purchasePlanDetailTemplate(2)}
        </tbody>
      </table>
      <div class="empty" v-if="!pagedDocs.length">暂无符合条件的采购计划</div>
    </section>
    <footer class="bottom-bar"><div class="bottom-summary"><b>{{ filteredDocs.length }}</b> 个计划 · <b>{{ filteredSkuCount }}</b> 个 SKU · 计划采购量 <b>{{ filteredQuantityTotals.purchaseQty.toLocaleString() }}</b> · 实际采购量 <b>{{ filteredQuantityTotals.actualPurchaseQty.toLocaleString() }}</b> · 差异数量 <b>{{ filteredQuantityTotals.differenceQty.toLocaleString() }}</b> · 收货数量 <b>{{ filteredQuantityTotals.receivedQty.toLocaleString() }}</b> · 采购在途 <b>{{ filteredQuantityTotals.inTransit.toLocaleString() }}</b></div><div class="pager"><span>共 <b>{{ filteredDocs.length }}</b> 个采购计划</span><select class="control page-size" :value="pageSize" @change="changePageSize($event)"><option :value="10">10条/页</option><option :value="15">15条/页</option><option :value="30">30条/页</option></select><button class="page-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">‹</button><span><button v-for="p in pageList" :key="p" class="page-number" :class="{active: p === currentPage}" @click="goPage(p)">{{ p }}</button></span><button class="page-btn" :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)">›</button></div></footer>
  </section>
  ${purchasePlanColumnDialogTemplate}
  <el-dialog v-model="documentDialogVisible" :title="documentDialogTitle" align-center class="purchase-plan-dialog" :class="{ 'is-view-mode': documentDialogMode === 'view' }" :close-on-click-modal="false" destroy-on-close>
    <div class="purchase-plan-dialog-body"><div class="purchase-plan-toolbar" v-if="documentDialogMode !== 'view'"><div class="purchase-plan-toolbar__note">各 SKU 可分别选择团队并维护采购信息</div><div class="purchase-plan-toolbar__actions"><el-button @click="fillEmptyItemFields">一键填充</el-button><el-button type="primary" @click="openSkuDialog">新增 SKU</el-button></div></div><div class="purchase-plan-items"><el-table v-if="form.items.length" :data="form.items" class="purchase-plan-items-table" border><el-table-column prop="sku" label="SKU" width="180" fixed="left"><template #default="scope"><span>{{ scope.row.sku }}</span><span v-if="firstOrderOf(scope.row)" class="first-order-tag">首</span></template></el-table-column><el-table-column prop="lingxingSku" label="领星 SKU" width="145" fixed="left"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.lingxingSku || '—' }}</span><el-input v-else v-model="scope.row.lingxingSku" placeholder="请输入领星 SKU"></el-input></template></el-table-column><el-table-column prop="productName" label="品名" width="180" fixed="left" show-overflow-tooltip></el-table-column><el-table-column label="团队" width="160" fixed="left"><template #header><span class="detail-required">*</span>团队</template><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.team || '—' }}</span><el-select v-else v-model="scope.row.team" placeholder="请选择团队"><el-option v-for="team in teams" :key="team" :label="team" :value="team"></el-option></el-select></template></el-table-column><el-table-column label="计划交货日期" width="152"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.deliveryDate || '—' }}</span><el-date-picker v-else v-model="scope.row.deliveryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期"></el-date-picker></template></el-table-column><el-table-column label="平台" width="128"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.platform || '—' }}</span><el-select v-else v-model="scope.row.platform" placeholder="请选择平台"><el-option v-for="item in platforms" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="店铺" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.store || '—' }}</span><el-select v-else v-model="scope.row.store" placeholder="请选择店铺"><el-option v-for="item in stores" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="FNSKU" width="145"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.fnsku || '—' }}</span><el-input v-else v-model="scope.row.fnsku" placeholder="请输入 FNSKU"></el-input></template></el-table-column><el-table-column label="国家" width="112"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.country || '—' }}</span><el-select v-else v-model="scope.row.country" placeholder="请选择国家"><el-option v-for="item in countries" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="采购仓" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.warehouse || '—' }}</span><el-select v-else v-model="scope.row.warehouse" placeholder="请选择采购仓"><el-option v-for="item in warehouses" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="供应商" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.supplier || '—' }}</span><el-select v-else v-model="scope.row.supplier" placeholder="请选择供应商"><el-option v-for="item in suppliers" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="运营负责人" width="145"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.operator || '—' }}</span><el-select v-else v-model="scope.row.operator" placeholder="请选择运营负责人"><el-option v-for="item in creators" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="箱规（数量）" width="118" align="right"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.cartonSpec || '—' }}</span><el-input-number v-else v-model="scope.row.cartonSpec" :min="1" :max="999999" :controls="false"></el-input-number></template></el-table-column><el-table-column label="箱数" width="84" align="right"><template #default="scope">{{ itemCartons(scope.row) }}</template></el-table-column><el-table-column label="计划采购数量" width="130" align="right"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ Number(scope.row.purchaseQty || 0).toLocaleString() }}</span><el-input-number v-else v-model="scope.row.purchaseQty" :min="0" :max="999999" :controls="false"></el-input-number></template></el-table-column><el-table-column label="上次采购价" width="150" align="right"><template #default="scope"><span>{{ Number(scope.row.unitPrice || 0).toFixed(2) }}</span></template></el-table-column><el-table-column label="计划采购金额" width="130" align="right"><template #default="scope">¥ {{ itemAmount(scope.row).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</template></el-table-column><el-table-column label="供应商料号" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.supplierSku || '—' }}</span><el-input v-else v-model="scope.row.supplierSku" placeholder="请输入供应商料号"></el-input></template></el-table-column><el-table-column label="备注" min-width="170"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.remark || '—' }}</span><el-input v-else v-model="scope.row.remark" placeholder="请输入备注"></el-input></template></el-table-column><el-table-column v-if="documentDialogMode !== 'view'" label="操作" width="74"><template #default="scope"><el-button link type="danger" @click="removeSku(scope.$index)">移除</el-button></template></el-table-column></el-table><el-empty v-else description="尚未添加 SKU，请点击“新增 SKU”"></el-empty></div></div><template #footer><div class="purchase-plan-dialog-footer"><div class="purchase-plan-summary"><span class="purchase-plan-stat">已选 <em>{{ form.items.length }}</em> 个 SKU</span><span class="purchase-plan-stat">计划采购总数 <em>{{ formTotalQty.toLocaleString() }}</em> 件</span><span class="purchase-plan-stat">计划采购金额 <em>¥ {{ formTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</em></span></div><div class="purchase-plan-dialog-footer__actions"><el-button @click="documentDialogVisible = false">{{ documentDialogMode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="documentDialogMode === 'create' || (documentDialogMode === 'edit' && form.status === 'draft')" type="success" @click="saveDocument('draft')">保存到草稿</el-button><el-button v-if="documentDialogMode !== 'view'" type="primary" @click="saveDocument('submit')">{{ documentDialogMode === 'create' || form.status === 'draft' ? '提交审核' : '保存修改' }}</el-button></div></div></template>
  </el-dialog>
  <el-dialog v-model="skuDialogVisible" title="批量选择 SKU" width="820px" :close-on-click-modal="false" append-to-body><el-alert title="支持粘贴多个 SKU，使用换行、逗号、空格或分号分隔；采购数量和单价可在保存前调整。" type="info" show-icon :closable="false"></el-alert><div class="sku-batch-query"><el-input v-model="skuBatchInput" type="textarea" :rows="3" resize="none" placeholder="请输入或粘贴多个 SKU"></el-input><div class="sku-query-actions"><el-button @click="clearSkuQuery">清空</el-button><el-button type="primary" @click="querySkus">批量查询</el-button></div></div><el-alert v-if="unmatchedSkuCodes.length" :title="\`以下 SKU 未匹配或已加入明细：\${unmatchedSkuCodes.join('、')}\`" type="warning" show-icon :closable="false"></el-alert><div class="sku-result-head"><div class="sku-result-title">查询结果（{{ skuQueryResults.length }}）</div></div><el-table v-if="skuQueryResults.length" :data="skuQueryResults" border @selection-change="selectedProducts = $event"><el-table-column type="selection" width="48"></el-table-column><el-table-column prop="sku" label="SKU" width="150"></el-table-column><el-table-column prop="productName" label="品名" min-width="200"></el-table-column><el-table-column prop="stockQty" label="备货数量" width="100" align="right"></el-table-column></el-table><el-empty v-else description="请输入 SKU 后点击\"批量查询\""></el-empty><template #footer><el-button @click="skuDialogVisible = false">取消</el-button><el-button type="primary" @click="addSelectedSkus">加入明细（{{ selectedProducts.length }}）</el-button></template></el-dialog>
  <el-dialog v-model="auditDialogVisible" :title="auditDialogTitle" width="520px" :close-on-click-modal="false"><el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-position="top"><div v-if="auditTargets.length" class="audit-targets"><div class="audit-target-label">审核计划：</div><div v-for="doc in auditTargets" :key="doc.id" class="audit-target-item">{{ doc.planNo }}（{{ confirmerLabel(doc) }}）</div></div><el-form-item label="审核意见" prop="comment"><el-input v-model="auditForm.comment" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="审核通过可留空，驳回时请填写原因"></el-input></el-form-item></el-form><template #footer><el-button @click="auditDialogVisible = false">取消</el-button><el-button type="danger" @click="submitAuditAction('reject')">驳回</el-button><el-button type="primary" @click="submitAuditAction('approve')">通过</el-button></template></el-dialog>
`;

/* 团队和采购计划备注属于 SKU 明细；顶部备注属于整张采购计划。 */
const defaultSupplierColumn = root.querySelector('el-table-column[label="供应商"]');
if (defaultSupplierColumn) {
  defaultSupplierColumn.setAttribute('label', '默认供应商');
  defaultSupplierColumn.innerHTML = '<template #default="scope"><span>{{ scope.row.supplier || scope.row.defaultSupplier || "—" }}</span></template>';
}
const lingxingSkuColumn = root.querySelector('el-table-column[label="领星 SKU"]');
if (lingxingSkuColumn) { lingxingSkuColumn.setAttribute('fixed', 'left'); lingxingSkuColumn.innerHTML = '<template #default="scope"><span>{{ scope.row.lingxingSku || "—" }}</span></template>'; }
root.querySelector('el-table-column[prop="productName"]')?.setAttribute('fixed', 'left');
const supplierSkuColumn = root.querySelector('el-table-column[label="供应商料号"]');
if (supplierSkuColumn) supplierSkuColumn.innerHTML = '<template #default="scope"><span>{{ scope.row.supplierSku || "—" }}</span></template>';
const productNameColumn = root.querySelector('el-table-column[prop="productName"]');
if (productNameColumn) {
  productNameColumn.setAttribute('min-width', '230');
  productNameColumn.innerHTML = '<template #default="scope"><div class="purchase-plan-product"><img class="purchase-plan-product__image" :src="scope.row.imageUrl || \'./product-placeholder.svg\'" alt="" /><span class="purchase-plan-product__name">{{ scope.row.productName }}</span></div></template>';
}
const planToolbar = root.querySelector('.purchase-plan-toolbar');
const planItems = root.querySelector('.purchase-plan-items');
const planItemsTable = planItems?.querySelector('el-table');
['采购仓', '计划采购金额'].forEach(label => planItemsTable?.querySelector(`el-table-column[label="${label}"]`)?.remove());
planItemsTable?.querySelector('el-table-column[label="计划采购数量"]')?.setAttribute('label', '计划采购量');
planItemsTable?.querySelector('el-table-column[label="箱规（数量）"]')?.setAttribute('label', '箱规数量');
planItemsTable?.querySelector('el-table-column[label="备注"]')?.setAttribute('label', '采购计划备注');
const fnskuColumn = planItemsTable?.querySelector('el-table-column[label="FNSKU"]');
if (fnskuColumn) fnskuColumn.innerHTML = '<template #default="scope"><span v-if="documentDialogMode === \'view\'">{{ scope.row.fnsku || "—" }}</span><el-select v-else v-model="scope.row.fnsku" clearable placeholder="请选择 FNSKU"><el-option v-for="option in fnskuOptionsFor(scope.row)" :key="option" :label="option" :value="option"></el-option></el-select></template>';
const cartonSpecColumn = planItemsTable?.querySelector('el-table-column[label="箱规数量"]');
if (cartonSpecColumn) cartonSpecColumn.innerHTML = '<template #default="scope"><span class="purchase-plan-auto-value">{{ scope.row.cartonSpec ?? "—" }}</span></template>';
const unitPriceColumn = planItemsTable?.querySelector('el-table-column[label="上次采购价"]');
/* 运营负责人后新增「采购仓库」列：单行下拉编辑 + 支持批量 */
const operatorColumn = planItemsTable?.querySelector('el-table-column[label="运营负责人"]');
if (operatorColumn) operatorColumn.insertAdjacentHTML('afterend', '<el-table-column label="采购仓库" width="150"><template #default="scope"><span v-if="documentDialogMode === \'view\'">{{ scope.row.warehouse || "—" }}</span><el-select v-else v-model="scope.row.warehouse" clearable placeholder="请选择采购仓库"><el-option v-for="item in warehouses" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column>');
/* 「上次采购价」后插入「计划采购金额」列：计划采购量 × 上次采购价，实时计算、只读展示 */
const unitPriceColNode = planItemsTable?.querySelector('el-table-column[label="上次采购价"]');
if (unitPriceColNode) unitPriceColNode.insertAdjacentHTML('afterend', '<el-table-column label="计划采购金额" width="130"><template #default="scope"><span>{{ planAmountText(scope.row) }}</span></template></el-table-column>');
/* 明细表头「批量」按钮：团队、计划采购量、计划交货日期、平台、店铺、国家、运营负责人、采购仓库 8 个字段支持批量赋值 */
const batchFieldControls = {
  '团队': { field: 'team', control: `<el-select v-model="batchFill.team" placeholder="请选择团队"><el-option v-for="item in teams" :key="item" :label="item" :value="item"></el-option></el-select>` },
  '计划采购量': { field: 'purchaseQty', control: `<el-input-number v-model="batchFill.purchaseQty" :min="0" :max="999999" :controls="false" placeholder="请输入计划采购量"></el-input-number>` },
  '计划交货日期': { field: 'deliveryDate', control: `<el-date-picker v-model="batchFill.deliveryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期"></el-date-picker>` },
  '平台': { field: 'platform', control: `<el-select v-model="batchFill.platform" placeholder="请选择平台"><el-option v-for="item in platforms" :key="item" :label="item" :value="item"></el-option></el-select>` },
  '店铺': { field: 'store', control: `<el-select v-model="batchFill.store" placeholder="请选择店铺"><el-option v-for="item in stores" :key="item" :label="item" :value="item"></el-option></el-select>` },
  '国家': { field: 'country', control: `<el-select v-model="batchFill.country" placeholder="请选择国家"><el-option v-for="item in countries" :key="item" :label="item" :value="item"></el-option></el-select>` },
  '运营负责人': { field: 'operator', control: `<el-select v-model="batchFill.operator" placeholder="请选择运营负责人"><el-option v-for="item in creators" :key="item" :label="item" :value="item"></el-option></el-select>` },
  '采购仓库': { field: 'warehouse', control: `<el-select v-model="batchFill.warehouse" placeholder="请选择采购仓库"><el-option v-for="item in warehouses" :key="item" :label="item" :value="item"></el-option></el-select>` }
};
Object.entries(batchFieldControls).forEach(([label, config]) => {
  const column = planItemsTable?.querySelector(`el-table-column[label="${label}"]`);
  if (!column) return;
  const original = column.innerHTML.replace(/<template #header[^>]*>[\s\S]*?<\/template>\s*/g, '');
  const requiredMark = label === '团队' ? '<span class="detail-required">*</span>' : '';
  column.innerHTML = `<template #header>${requiredMark}${label}<el-popover v-if="documentDialogMode !== 'view'" v-model:visible="batchFillVisible.${config.field}" placement="top" :width="232" trigger="click" popper-class="batch-fill-popover"><template #reference><button class="batch-fill-trigger" type="button">批量</button></template><div class="batch-fill">${config.control}<div class="batch-fill__actions"><el-button size="small" @click="cancelBatchFill('${config.field}')">取消</el-button><el-button size="small" type="primary" plain @click="applyBatchFill('${config.field}')">确认</el-button></div></div></el-popover></template>` + original;
});
/* 上次采购价：商品资料带出且只读；含税价格在数值右侧展示「含税」标签，不含税或价格为空时不展示 */
if (unitPriceColumn) unitPriceColumn.innerHTML = '<template #default="scope"><span class="purchase-plan-price-cell"><span class="purchase-plan-auto-value">{{ Number(scope.row.unitPrice || 0).toFixed(2) }}</span><span v-if="Number(scope.row.unitPrice || 0) > 0 && scope.row.lastPurchaseTaxIncluded === \'是\'" class="tax-included-tag">含税</span></span></template>';
const detailColumnOrder = ['SKU', '领星 SKU', '品名', '团队', '计划采购量', '计划交货日期', '平台', '店铺', 'FNSKU', '国家', '运营负责人', '采购仓库', '箱规数量', '箱数', '上次采购价', '计划采购金额', '采购计划备注', '默认供应商', '供应商料号', '操作'];
detailColumnOrder.forEach(label => {
  const column = Array.from(planItemsTable?.children || []).find(node => node.getAttribute('label') === label);
  if (column) planItemsTable.appendChild(column);
});
planItemsTable?.removeAttribute('v-if');
planItemsTable?.removeAttribute('border');
planItemsTable?.setAttribute('height', '100%');
root.querySelector('.purchase-plan-items el-empty')?.remove();
planToolbar?.insertAdjacentHTML('beforebegin', `<section class="purchase-plan-base-section"><div class="purchase-plan-section-title"><i class="purchase-plan-section-bar"></i>基础信息</div><div class="purchase-plan-public-fields"><div class="purchase-plan-public-field purchase-plan-public-field--owner"><span><i>*</i>计划负责人</span><el-input v-model="form.planOwner" disabled></el-input></div><div class="purchase-plan-public-field purchase-plan-public-field--remark"><span>备注</span><span v-if="documentDialogMode === 'view'" class="purchase-plan-public-field__value">{{ form.remark || '—' }}</span><el-input v-else v-model="form.remark" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="请输入备注（选填）"></el-input></div></div></section>`);
planToolbar?.querySelector('.purchase-plan-toolbar__note')?.remove();
planToolbar?.insertAdjacentHTML('afterbegin', `<div class="purchase-plan-toolbar__title"><i class="purchase-plan-section-bar"></i><b>SKU 明细</b></div>`);
const planToolbarActions = planToolbar?.querySelector('.purchase-plan-toolbar__actions');
if (planToolbarActions) planToolbarActions.innerHTML = '<el-button type="primary" @click="openSkuPicker">添加 SKU</el-button><el-button v-if="documentDialogMode === \'create\'" @click="openImportCreateFromDialog">导入新建</el-button>';
const planDialogBody = planToolbar?.parentElement;
if (planToolbar && planItems && planDialogBody) {
  const planDetailSection = document.createElement('section');
  planDetailSection.className = 'purchase-plan-detail-section';
  planDialogBody.insertBefore(planDetailSection, planToolbar);
  planDetailSection.append(planToolbar, planItems);
}
const skuPicker = root.querySelector('el-dialog[v-model="skuDialogVisible"]');
if (skuPicker) {
  skuPicker.className = 'purchase-sku-picker';
  skuPicker.setAttribute('title', '添加 SKU');
  skuPicker.setAttribute('width', '980px');
  skuPicker.setAttribute('destroy-on-close', '');
  skuPicker.innerHTML = `
    <div class="sku-picker-body">
      <div class="sku-picker-search">
        <el-input v-model="skuBatchInput" clearable placeholder="SKU（支持多个，逗号或空格分隔）" @keyup.enter="querySkuPicker"></el-input>
        <el-input v-model="skuNameInput" clearable placeholder="品名" @keyup.enter="querySkuPicker"></el-input>
        <el-button type="primary" @click="querySkuPicker">查询</el-button>
      </div>
      <div v-if="unmatchedSkuCodes.length" class="sku-picker-warning">未找到：{{ unmatchedSkuCodes.join('、') }}</div>
      <div class="sku-picker-table-wrap">
        <el-table :data="skuQueryResults" class="sku-picker-table" height="100%" @selection-change="selectedProducts = $event">
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="sku" label="SKU" min-width="180"></el-table-column>
          <el-table-column prop="productName" label="品名" min-width="340"><template #default="scope"><div class="purchase-plan-product"><img class="purchase-plan-product__image" :src="scope.row.imageUrl || './product-placeholder.svg'" alt="" /><span class="purchase-plan-product__name">{{ scope.row.productName }}</span></div></template></el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer><div class="sku-picker-footer"><span>已选择 {{ selectedProducts.length }} 个 SKU</span><div><el-button @click="skuDialogVisible = false">取消</el-button><el-button type="primary" :disabled="!selectedProducts.length" @click="addSelectedSkus">添加选中 SKU</el-button></div></div></template>`;
}

createApp({
  setup() {
    const columnConfig = createPurchasePlanColumnConfig(2);
    const { parentVisibleColumns, childVisibleColumns } = columnConfig;
    const clone = value => JSON.parse(JSON.stringify(value));
    const suppliers = ['JASIC 供应商', 'ARCCAP 供应商', '华南五金', '东莞焊材', '测试供应商'];
    const warehouses = ['东莞采购仓', '深圳采购仓', '洛杉矶海外仓', '休斯敦海外仓', '供应商直发仓'];
    const platforms = ['Amazon', 'eBay', 'B2C', '线下订单'];
    const countries = ['美国', '英国', '德国', '日本', '中国'];
    const stores = ['ARCCAP', 'Lowes_ar', 'arccaptain', 'Amazon US 旗舰店', '线下订单'];
    const teams = ['亚马逊团队', 'Jasic团队', 'eBay团队', 'B端团队', '公共库存'];
    const creators = ['Admin', '张敏', '李晨', '王磊', '系统管理员'];
    const purchasers = ['陈志远', '刘晓梅', '孙建国', '周文婷', '吴海涛'];
    const productPool = [
      { sku: '140US260008', productName: '电焊机 140A', stockQty: 100 },
      { sku: '153US0000017', productName: '送丝管耗材套装 S1 500W', stockQty: 60 },
      { sku: '153US0000024', productName: '焊枪配件套装', stockQty: 45 },
      { sku: '153US0000031', productName: '不锈钢焊丝', stockQty: 80 },
      { sku: '42101000004', productName: 'TIG 焊丝-不锈钢', stockQty: 50 },
      { sku: 'XX123456-1', productName: '测试产品 XX123456', stockQty: 20 },
      { sku: 'DD123456', productName: '组合产品 DD', stockQty: 200 },
      { sku: 'EE123456', productName: '组合产品子项 EE', stockQty: 100 },
      { sku: 'FF123456', productName: '组合产品子项 FF', stockQty: 300 },
      { sku: 'KK123456', productName: '焊接配件 KK', stockQty: 80 },
      { sku: 'fan-test-sku', productName: '风扇测试产品', stockQty: 15 },
      { sku: '测试sku（勿动）', productName: '测试产品', stockQty: 30 },
      { sku: 'CC123456', productName: 'B 端组合产品', stockQty: 500 },
      { sku: 'AA123456', productName: 'B 端子产品 A', stockQty: 250 },
      { sku: 'BB123456', productName: 'B 端子产品 B', stockQty: 400 },
      { sku: 'MIG-200A', productName: 'MIG 焊机 200A', stockQty: 60 },
      { sku: 'PLASMA-45', productName: '等离子切割机', stockQty: 25 },
      { sku: 'WELD-HELMET', productName: '自动变光焊帽', stockQty: 200 },
      { sku: 'TIG-ROD-316', productName: 'TIG 焊丝 316L', stockQty: 120 },
      { sku: 'ELECTRODE-3.2', productName: '电焊条 3.2mm', stockQty: 500 },
      { sku: 'GAS-REGULATOR', productName: '氩气减压阀', stockQty: 80 },
      { sku: 'CABLE-35MM', productName: '焊接电缆 35mm²', stockQty: 150 },
      { sku: 'CLAMP-500A', productName: '地线夹 500A', stockQty: 100 },
      { sku: 'NOZZLE-TIP', productName: '导电嘴 M6', stockQty: 1000 },
      { sku: 'TORCH-26', productName: 'TIG 焊枪 WP-26', stockQty: 40 },
      { sku: 'FLOWMETER', productName: '氩气流量计', stockQty: 60 },
      { sku: 'WIRE-ER70S', productName: 'ER70S-6 焊丝 1.0', stockQty: 300 },
      { sku: 'GLOVES-WELD', productName: '焊接手套 XL', stockQty: 200 },
      { sku: 'CHIPPING', productName: '敲渣锤', stockQty: 150 },
      { sku: 'BRUSH-WIRE', productName: '钢丝刷', stockQty: 200 },
      { sku: 'MAGNET-GROUND', productName: '磁性接地夹', stockQty: 90 },
      { sku: 'TUNGSTEN-2.4', productName: '钨极 2.4mm', stockQty: 400 },
      { sku: 'CERAMIC-CUP', productName: '瓷嘴 #6', stockQty: 500 },
    ];
    productPool.forEach((product, index) => { product.team = teams[index % teams.length]; product.defaultSupplier = suppliers[index % suppliers.length]; product.cartonSpec = [20, 15, 25, 40][index % 4]; product.unitPrice = [609.29, 84.13, 12, 33, 18.5][index % 5]; product.lastPurchaseTaxIncluded = index % 3 === 0 ? '否' : '是'; product.fnskuOptions = [`FNSKU-${product.sku}-US`, `FNSKU-${product.sku}-UK`]; });
    /* 首单标记：SKU 历史从未生成过任何采购单时标记「首」，历史集合在 documents 初始化后填充 */
    const orderedSkusHistory = new Set();
    const mkItem = (product, values = {}) => ({ ...clone(product), firstOrder: !orderedSkusHistory.has(product.sku), lingxingSku: `LX-${product.sku}`, fnsku: '', platform: '', store: '', country: '', supplier: product.defaultSupplier || '', defaultSupplier: product.defaultSupplier || '', team: product.team || '', operator: '', purchaser: '', cartonSpec: product.cartonSpec ?? null, supplierSku: `SUP-${product.sku}`, purchaseQty: product.stockQty, actualPurchaseQty: null, receivedQty: null, minOrderQty: null, leadTimeDays: null, unitPrice: product.unitPrice ?? 0, amount: 0, warehouse: '东莞采购仓', deliveryDate: '2026-08-30', purchaseNo: '', purchaseStatus: '待提交', shipmentNo: '', remark: '', ...values });
    const fnskuOptionsFor = item => [...new Set([...(item.fnskuOptions || []), item.fnsku].filter(Boolean))];
    const skuPurchaseStatus = (doc, item) => {
      if (doc.status === 'pending_purchase') return '待提交';
      if (doc.status === 'purchasing') return item.purchaseNo ? '待收货' : '待提交';
      if (doc.status === 'partial_received') {
        if (!item.purchaseNo) return '待提交';
        return Number(item.receivedQty || 0) > 0 ? '部分收货' : '待收货';
      }
      if (doc.status === 'completed') return '已完成';
      return item.purchaseStatus === '未生成' ? '待提交' : (item.purchaseStatus || '待提交');
    };
    const syncSkuPurchaseStatuses = doc => {
      doc.items.forEach(item => {
        item.purchaseStatus = skuPurchaseStatus(doc, item);
        item.components?.forEach(component => { component.purchaseStatus = skuPurchaseStatus(doc, component); });
      });
    };
    const documents = ref([
      { id: 1, docNo: 'PP26080500001', stockPlanNo: 'BHJH20260805-001', platform: 'Amazon', store: 'ARCCAP', country: '美国', supplier: 'JASIC 供应商', warehouse: '东莞采购仓', team: '亚马逊团队', status: 'purchasing', creator: 'Admin', createdAt: '2026-08-05 10:30', remark: '旺季前置采购', items: [mkItem(productPool[0], { unitPrice: 609.29, amount: 60929.1, actualPurchaseQty: 100, receivedQty: 60, minOrderQty: 50, leadTimeDays: 20, cartonSpec: 20, deliveryDate: '2026-08-31', purchaseNo: 'PO2026727000', shipmentNo: 'SH202681000', urgent: true }), mkItem(productPool[1], { unitPrice: 84.13, amount: 4206.5, minOrderQty: 30, leadTimeDays: 15, cartonSpec: 15, deliveryDate: '2026-08-25' }), mkItem(productPool[12], { team: '亚马逊团队', purchaseQty: 500, unitPrice: 420, amount: 25200, deliveryDate: '2026-09-05', platform: 'Amazon', store: 'ARCCAP', fnsku: 'FNSKU-CC123456', country: '美国', operator: '王磊', components: [mkItem(productPool[13], { purchaseQty: 250, comboRatio: 1, actualPurchaseQty: 200, receivedQty: 80, purchaseNo: 'PO2026727002', purchaseStatus: '待收货', supplier: '东莞焊材', cartonSpec: 50, deliveryDate: '2026-09-05' }), mkItem(productPool[14], { purchaseQty: 250, comboRatio: 1, actualPurchaseQty: 250, receivedQty: 250, purchaseNo: 'PO2026727003', purchaseStatus: '待收货', supplier: '华南五金', cartonSpec: 25 })] })] },
      { id: 2, docNo: 'PP26080400003', stockPlanNo: 'BHJH20260804-002', platform: 'Amazon', store: 'Lowes_ar', country: '美国', supplier: 'ARCCAP 供应商', warehouse: '深圳采购仓', team: '亚马逊团队', status: 'pending_purchase', creator: '张敏', createdAt: '2026-08-04 14:20', remark: '', items: [mkItem(productPool[2], { unitPrice: 12, amount: 240, deliveryDate: '2026-08-20', remark: '测试计划，请勿操作' }), mkItem(productPool[13], { unitPrice: 880, amount: 22000, deliveryDate: '2026-09-10' }), mkItem(productPool[14], { unitPrice: 15.5, amount: 3100, warehouse: '供应商直发仓', deliveryDate: '2026-08-28', remark: '常规补货' })] },
      { id: 3, docNo: 'PP26080400002', stockPlanNo: 'BHJH20260804-003', platform: 'eBay', store: 'arccaptain', country: '英国', supplier: '华南五金', warehouse: '洛杉矶海外仓', team: 'eBay团队', status: 'pending_review', creator: '李晨', createdAt: '2026-08-04 09:15', remark: '海外仓安全库存补充', items: [mkItem(productPool[3], { unitPrice: 0, amount: 0, warehouse: '洛杉矶海外仓', deliveryDate: '2026-09-30' }), mkItem(productPool[4], { unitPrice: 33, amount: 3300, warehouse: '洛杉矶海外仓', deliveryDate: '2026-09-30' }), mkItem(productPool[5], { unitPrice: 10, amount: 3000, warehouse: '洛杉矶海外仓', deliveryDate: '2026-09-30' }), mkItem(productPool[15], { unitPrice: 28, amount: 3360, deliveryDate: '2026-09-01' })] },
      { id: 4, docNo: 'PP26080400004', stockPlanNo: '', platform: 'B2C', store: 'Amazon US 旗舰店', country: '德国', supplier: '东莞焊材', warehouse: '休斯敦海外仓', team: 'Jasic团队', status: 'pending_review', creator: '王磊', createdAt: '2026-08-04 16:45', remark: '新品首批采购', items: [mkItem(productPool[6], { unitPrice: 0, amount: 0, warehouse: '休斯敦海外仓', deliveryDate: '2026-08-06' }), mkItem(productPool[16], { unitPrice: 3.2, amount: 1600, deliveryDate: '2026-08-22', remark: '常规补货' })] },
      { id: 5, docNo: 'PP26080500002', stockPlanNo: 'BHJH20260805-005', platform: 'Amazon', store: 'ARCCAP', country: '日本', supplier: '测试供应商', warehouse: '供应商直发仓', team: '亚马逊团队', status: 'rejected', creator: '系统管理员', createdAt: '2026-08-05 11:20', remark: '驳回原因：价格不合理', items: [mkItem(productPool[7], { unitPrice: 0, amount: 0, warehouse: '供应商直发仓', deliveryDate: '2026-08-06', remark: '测试计划' }), mkItem(productPool[17], { unitPrice: 45, amount: 3600, warehouse: '深圳采购仓', deliveryDate: '2026-09-08' })] },
      { id: 6, docNo: 'PP26080400001', stockPlanNo: 'BHJH20260804-006', platform: 'eBay', store: 'Lowes_ar', country: '美国', supplier: 'JASIC 供应商', warehouse: '东莞采购仓', team: 'eBay团队', status: 'completed', creator: 'Admin', createdAt: '2026-08-04 08:00', remark: '采购已完成', items: [mkItem(productPool[8], { unitPrice: 0, amount: 0, deliveryDate: '2026-08-20', purchaseNo: 'PO2026727005', shipmentNo: 'SH202681001', remark: '常规补货' }), mkItem(productPool[19], { unitPrice: 6.5, amount: 650, warehouse: '供应商直发仓', deliveryDate: '2026-08-30', purchaseNo: 'PO2026727006' })] },
      { id: 7, docNo: 'PP26080400005', stockPlanNo: '', platform: 'B2C', store: '线下订单', country: '中国', supplier: 'ARCCAP 供应商', warehouse: '东莞采购仓', team: 'B端团队', status: 'voided', creator: '张敏', createdAt: '2026-08-04 17:30', remark: '作废原因：重复创建', items: [mkItem(productPool[9], { unitPrice: 30, amount: 15000, warehouse: '深圳采购仓', deliveryDate: '2026-09-15' }), mkItem(productPool[10], { unitPrice: 62, amount: 15500, warehouse: '深圳采购仓', deliveryDate: '2026-09-15' })] },
      { id: 8, docNo: 'PP26080600001', stockPlanNo: 'BHJH20260806-008', platform: 'Amazon', store: 'ARCCAP', country: '美国', supplier: 'JASIC 供应商', warehouse: '东莞采购仓', team: '亚马逊团队', status: 'partial_received', creator: 'Admin', createdAt: '2026-08-06 09:00', remark: '部分到货', items: [mkItem(productPool[12], { unitPrice: 420, amount: 25200, deliveryDate: '2026-09-05', purchaseNo: 'PO2026727025', actualPurchaseQty: 500, receivedQty: 180, urgent: true }), mkItem(productPool[16], { unitPrice: 3.2, amount: 1600, deliveryDate: '2026-08-22', purchaseNo: 'PO2026727026', shipmentNo: 'SH202681007' }), mkItem(productPool[18], { purchaseQty: 75, unitPrice: 18, deliveryDate: '2026-09-12', purchaseNo: 'PO2026727027', actualPurchaseQty: 0, receivedQty: 0, removed: true, removeMeta: { reason: '客户订单取消，本批暂不采购', operator: '张敏', time: '2026-09-02 10:20', poNo: 'PO2026727027' } })] },
    ]);
    // 采购单移除 SKU 后回写：已移除明细在计划侧展示「已移除」标签与移除记录
    /* 首单标记初始化：以页面加载时是否已有采购单号判定 SKU 历史下单情况；生成采购单后标记保留不清除 */
    documents.value.forEach(doc => (doc.items || []).forEach(item => {
      if (item.purchaseNo || (item.components || []).some(component => component.purchaseNo)) orderedSkusHistory.add(item.sku);
    }));
    documents.value.forEach(doc => (doc.items || []).forEach(item => {
      item.firstOrder = !orderedSkusHistory.has(item.sku);
      (item.components || []).forEach(component => { component.firstOrder = item.firstOrder; });
    }));
    /* 首单判定：已写入的标记优先；缺失时按历史采购单集合兜底计算 */
    const firstOrderOf = item => !item ? false : (typeof item.firstOrder === 'boolean' ? item.firstOrder : !orderedSkusHistory.has(item.sku));
    const planRemovedRecords = (() => { try { return JSON.parse(localStorage.getItem('mpp-plan-removed') || '[]'); } catch { return []; } })();
    const removedMetaOf = (doc, item) => {
      if (!item) return null;
      if (item.removeMeta) return item.removeMeta;
      const record = planRemovedRecords.find(entry => entry.sku === item.sku && ((entry.poNo && entry.poNo === item.purchaseNo) || (entry.planNo && entry.planNo === (doc?.docNo || ''))));
      if (!record) return null;
      return { reason: record.reason, operator: record.operator, time: record.time, poNo: record.poNo };
    };
    const isSkuRemoved = (doc, item) => Boolean(item && (item.removed || removedMetaOf(doc, item)));
    documents.value.forEach(doc => doc.items.forEach(item => {
      const parts = item.components?.length ? item.components : [item];
      parts.forEach(part => { if (removedMetaOf(doc, part)) part.removed = true; });
    }));
    // 采购员随生成的采购单走：同一采购单号对应同一采购员；未生成采购单的明细暂无采购员
    const poPurchaserMap = {};
    const applyPoPurchaser = item => {
      (item.components || []).forEach(applyPoPurchaser);
      if (item.purchaseNo) {
        if (!poPurchaserMap[item.purchaseNo]) poPurchaserMap[item.purchaseNo] = purchasers[Object.keys(poPurchaserMap).length % purchasers.length];
        item.purchaser = poPurchaserMap[item.purchaseNo];
      } else {
        item.purchaser = '';
      }
    };
    documents.value.forEach(doc => doc.items.forEach(applyPoPurchaser));
    const ensurePlanIdentifiers = doc => {
      doc.planNo = doc.planNo || doc.docNo;
      const used = new Set(doc.items.map(item => item.detailId).filter(Boolean));
      doc.items.forEach((item, index) => {
        if (item.detailId) return;
        let sequence = index + 1;
        let detailId = `${doc.planNo}-SKU${String(sequence).padStart(2, '0')}`;
        while (used.has(detailId)) detailId = `${doc.planNo}-SKU${String(++sequence).padStart(2, '0')}`;
        item.detailId = detailId;
        used.add(detailId);
      });
    };
    documents.value.forEach(doc => {
      const no = doc.planNo || doc.docNo || '';
      const match = no.match(/^(PP\d{6})(\d{5})$/);
      if (match) { const next = `${match[1]}${String(Number(match[2])).padStart(4, '0')}`; doc.planNo = next; doc.docNo = next; }
    });
    documents.value.forEach(doc => {
      doc.planOwner = doc.planOwner || doc.creator;
      doc.items.forEach(item => {
        for (const field of ['platform', 'store', 'country', 'supplier']) if (!item[field]) item[field] = doc[field] || '';
        if (!item.team) item.team = doc.team || '';
      });
      delete doc.team;
      ensurePlanIdentifiers(doc);
      syncSkuPurchaseStatuses(doc);
    });

    const filters = reactive({ keyword: '', queryTick: 0 });
    const activeStatus = ref('all');
    const page = ref(1);
    const pageSize = ref(15);
    const selectedDetailNos = reactive(new Set());
    const isDetailSelected = item => selectedDetailNos.has(item.detailId);
    const toggleDetail = (item, event) => { event.target.checked ? selectedDetailNos.add(item.detailId) : selectedDetailNos.delete(item.detailId); };
    const isSelected = doc => doc.items.length > 0 && doc.items.every(isDetailSelected);
    const isPartiallySelected = doc => doc.items.some(isDetailSelected) && !isSelected(doc);
    const selectedDocs = computed(() => documents.value.filter(isSelected));
    const selectedPlanCount = computed(() => selectedDetailNos.size);
    const selectedPlans = computed(() => documents.value.flatMap(doc => doc.items.filter(isDetailSelected).map(item => ({ doc, item }))));
    const PENDING_REVIEW_STATUSES = ['pending_review'];
    const DETAIL_DELETABLE_STATUSES = ['draft', 'pending_review'];
    /* 已完结、已驳回、已作废状态不支持加急与删除 */
    const MORE_ACTION_BLOCKED_STATUSES = ['completed', 'rejected', 'voided'];
    const AUDITABLE_STATUSES = ['pending_review'];
    const VOIDABLE_STATUSES = ['draft', 'pending_review'];
    /* 顶部按钮按当前状态页签展示：审核仅待审核；作废仅草稿、待审核 */
    const showAuditAction = computed(() => activeStatus.value === 'pending_review');
    const showVoidAction = computed(() => VOIDABLE_STATUSES.includes(activeStatus.value));
    const moreActionsDisabled = computed(() => MORE_ACTION_BLOCKED_STATUSES.includes(activeStatus.value));
    const STATUS_GROUP_MAP = { pending_review: PENDING_REVIEW_STATUSES };
    const statusTabs = [
      { name: 'all', label: '全部' },
      { name: 'draft', label: '草稿' },
      { name: 'pending_review', label: '待审核' },
      { name: 'pending_purchase', label: '待采购' },
      { name: 'purchasing', label: '采购中' },
      { name: 'partial_received', label: '部分到货' },
      { name: 'completed', label: '已完结' },
      { name: 'rejected', label: '已驳回' },
      { name: 'voided', label: '已作废' }
    ];
    const statusMeta = (() => {
      const map = {
        draft: { label: '草稿', type: 'info' },
        pending_review: { label: '待审核', type: 'warning' },
        pending_purchase: { label: '待采购', type: 'primary' },
        purchasing: { label: '采购中', type: 'primary' },
        partial_received: { label: '部分到货', type: 'warning' },
        completed: { label: '已完结', type: 'success' },
        rejected: { label: '已驳回', type: 'danger' },
        voided: { label: '已作废', type: 'danger' }
      };
      return status => map[status] || { label: status, type: 'info' };
    })();
    const confirmerLabel = doc => {
      const map = {
        pending_review: '待采购审核',
        pending_purchase: '待生成采购单',
        purchasing: '采购执行中',
        partial_received: '部分到货待收货',
        rejected: '已驳回'
      };
      return map[doc.status] || '';
    };
    const readLegacyQuery = () => {
      filters.keyword = [
        [...legacy.codes].join(' '),
        document.querySelector('#documentNoInput').value,
        document.querySelector('#productName').value,
        document.querySelector('#purchaseStatus').value,
        document.querySelector('#remark').value
      ].filter(Boolean).join(' ');
      filters.queryTick += 1;
    };
    const legacy = reactive({ codes: [], warehouses: [], purchasers: [], suppliers: [], platforms: [], countries: [], stores: [], teams: [], creators: [], urgent: '', removed: '', firstPurchase: '' });
    const values = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => input.value);
    const initLegacyQuery = () => {
      const configs = [
        ['#warehouseMulti', warehouses, 'warehouses', '请选择采购仓'],
        ['#purchaserMulti', purchasers, 'purchasers', '请选择采购员'],
        ['#platformMulti', platforms, 'platforms', '请选择平台'],
        ['#countryMulti', countries, 'countries', '请选择国家'],
        ['#storeMulti', stores, 'stores', '请选择店铺'],
        ['#teamMulti', teams, 'teams', '请选择团队'],
        ['#creatorMulti', creators, 'creators', '请选择计划负责人']
      ];
      const closeMenus = except => document.querySelectorAll('.multi').forEach(rootItem => { if (rootItem !== except) { rootItem.querySelector('[data-menu]').classList.remove('show'); rootItem.querySelector('[data-trigger]').classList.remove('open'); } });
      configs.forEach(([id, items, key, placeholder]) => {
        const rootItem = document.querySelector(id); const trigger = rootItem.querySelector('[data-trigger]'); const menu = rootItem.querySelector('[data-menu]');
        menu.innerHTML = items.map(item => `<label><input type="checkbox" value="${item}">${item}</label>`).join('');
        trigger.addEventListener('click', event => { event.stopPropagation(); closeMenus(rootItem); menu.classList.toggle('show'); trigger.classList.toggle('open', menu.classList.contains('show')); });
        menu.addEventListener('click', event => event.stopPropagation());
        menu.addEventListener('change', () => { legacy[key] = values(id); trigger.textContent = legacy[key].length ? `${legacy[key].slice(0, 2).join('、')}${legacy[key].length > 2 ? ` +${legacy[key].length - 2}` : ''}` : placeholder; trigger.classList.toggle('has-value', !!legacy[key].length); });
      });
      document.addEventListener('click', () => closeMenus());
      const renderCodeTags = () => { const wrap = document.querySelector('#codeTags'); wrap.innerHTML = legacy.codes.slice(0, 2).map((value, index) => `<span class="chip" title="${value}">${value}<span class="x" data-index="${index}">×</span></span>`).join('') + (legacy.codes.length > 2 ? `<span class="chip">+${legacy.codes.length - 2}</span>` : ''); wrap.querySelectorAll('.x').forEach(x => x.addEventListener('click', event => { event.stopPropagation(); legacy.codes.splice(Number(x.dataset.index), 1); renderCodeTags(); })); };
      const addCodes = raw => { raw.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean).forEach(value => { if (!legacy.codes.includes(value)) legacy.codes.push(value); }); renderCodeTags(); };
      document.querySelector('#codeInput').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addCodes(event.target.value); event.target.value = ''; } });
      document.querySelector('#codeInput').addEventListener('paste', event => { const text = event.clipboardData.getData('text'); if (/[\s,，;；]/.test(text)) { event.preventDefault(); addCodes(text); } });
      document.querySelector('#codeBox').addEventListener('click', () => document.querySelector('#codeInput').focus());
      document.querySelector('#documentNoType').addEventListener('change', event => {
        const input = document.querySelector('#documentNoInput');
        input.value = '';
        input.placeholder = event.target.value === 'purchase' ? '请输入采购单号，支持多个' : '请输入采购计划号，支持多个';
      });
      document.querySelector('#urgentFilter').addEventListener('change', event => { legacy.urgent = event.target.value; });
      document.querySelector('#removedFilter').addEventListener('change', event => { legacy.removed = event.target.value; });
      document.querySelector('#firstPurchaseFilter').addEventListener('change', event => { legacy.firstPurchase = event.target.value; });
      ['#quantityMin', '#quantityMax'].forEach(id => { const input = document.querySelector(id); input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); }); input.addEventListener('keydown', event => { if (event.key === 'Enter') document.querySelector('#searchBtn').click(); }); });
      document.querySelector('#searchBtn').addEventListener('click', () => { if (document.querySelector('#codeInput').value.trim()) { addCodes(document.querySelector('#codeInput').value); document.querySelector('#codeInput').value = ''; } const qtyMinValue = document.querySelector('#quantityMin').value.trim(); const qtyMaxValue = document.querySelector('#quantityMax').value.trim(); if (qtyMinValue !== '' && qtyMaxValue !== '' && Number(qtyMinValue) > Number(qtyMaxValue)) { ElementPlus.ElMessage.error('数量范围最小值不能大于最大值'); return; } readLegacyQuery(); page.value = 1; expandedIds.clear(); ElementPlus.ElMessage.success(`查询完成，共 ${filteredDocs.value.length} 张采购计划`); });
document.querySelector('#resetBtn').addEventListener('click', () => { legacy.codes = []; ['#documentNoInput', '#productName', '#remark', '#startDate', '#endDate', '#quantityMin', '#quantityMax'].forEach(id => document.querySelector(id).value = ''); document.querySelector('#quantityType').value = 'purchaseQty'; document.querySelector('#codeType').value = 'SKU'; document.querySelector('#documentNoType').value = 'plan'; document.querySelector('#documentNoInput').placeholder = '请输入采购计划号，支持多个'; document.querySelector('#purchaseStatus').value = ''; document.querySelector('#urgentFilter').value = ''; legacy.urgent = ''; document.querySelector('#removedFilter').value = ''; legacy.removed = ''; document.querySelector('#firstPurchaseFilter').value = ''; legacy.firstPurchase = ''; document.querySelector('#timeType').value = '创建时间'; document.querySelectorAll('.dropdown input').forEach(input => input.checked = false); configs.forEach(([id, , key, placeholder]) => { legacy[key] = []; const trigger = document.querySelector(`${id} [data-trigger]`); trigger.textContent = placeholder; trigger.classList.remove('has-value'); }); renderCodeTags(); readLegacyQuery(); activeStatus.value = 'all'; page.value = 1; expandedIds.clear(); ElementPlus.ElMessage.success('已重置查询条件'); });
      const queryPanel = document.getElementById('queryCard'); const queryGrid = document.getElementById('queryGrid'); const queryExpandBtn = document.getElementById('queryExpand');
      let queryExpanded = false;
      const setQueryExpandUi = () => { queryExpandBtn.setAttribute('aria-expanded', String(queryExpanded)); queryExpandBtn.querySelector('.query-expand-text').textContent = queryExpanded ? '收起' : '展开'; queryPanel.classList.toggle('query-collapsed', !queryExpanded); };
      queryExpandBtn.addEventListener('click', () => { queryExpanded = !queryExpanded; setQueryExpandUi(); });
      const layoutQuery = () => {
        if (!queryPanel || !queryGrid || !queryExpandBtn) return;
        queryPanel.classList.remove('query-collapsed');
        queryGrid.querySelectorAll('.query-overflow-item').forEach(item => item.classList.remove('query-overflow-item'));
        const items = [...queryGrid.querySelectorAll('.query-item:not(.query-action-item)')];
        const actionItem = queryGrid.querySelector('.query-action-item');
        if (!items.length || !actionItem) return;
        queryExpandBtn.hidden = false; // 临时显示以获取含展开按钮的按钮组真实宽度
        const gridWidth = queryGrid.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(queryGrid).columnGap) || 0;
        const btnWidth = actionItem.getBoundingClientRect().width;
        const widthMap = new Map(items.map(item => [item, item.getBoundingClientRect().width]));
        // 贪心还原 flex-wrap 的自然行分布
        const rows = [];
        let row = [];
        let rowWidth = 0;
        items.forEach(item => {
          const w = widthMap.get(item);
          if (row.length && rowWidth + gap + w > gridWidth + 1) { rows.push(row); row = []; rowWidth = 0; }
          rowWidth += (row.length ? gap : 0) + w;
          row.push(item);
        });
        if (row.length) rows.push(row);
        const actionOwnRow = btnWidth >= gridWidth * 0.95; // 窄屏断点（≤900px）下按钮组独占整行
        const overflowSet = new Set();
        if (rows.length > 2) rows.slice(2).forEach(r => r.forEach(item => overflowSet.add(item)));
        if (rows.length >= 2 && !actionOwnRow) {
          // 第二行装箱时为按钮组预留宽度，保证「展开/查询/重置」默认落在第二行内
          let used = 0;
          rows[1].forEach(item => {
            const w = widthMap.get(item);
            const next = used + (used ? gap : 0) + w;
            if (next + gap + btnWidth <= gridWidth + 1) used = next; else overflowSet.add(item);
          });
        }
        overflowSet.forEach(item => item.classList.add('query-overflow-item'));
        const hasOverflow = overflowSet.size > 0;
        if (!hasOverflow) queryExpanded = false;
        queryExpandBtn.hidden = !hasOverflow;
        setQueryExpandUi();
        window.__queryLayoutDebug = { gridWidth: Math.round(gridWidth), btnWidth: Math.round(btnWidth), gap, rowCount: rows.length, actionOwnRow, overflowCount: overflowSet.size, visibleCount: items.length - overflowSet.size };
      };
      let layoutTimer; window.addEventListener('resize', () => { clearTimeout(layoutTimer); layoutTimer = setTimeout(layoutQuery, 80); });
      window.addEventListener('load', layoutQuery);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', layoutQuery); else layoutQuery();
      document.querySelectorAll('.date-group input[type="date"]').forEach(input => { input.addEventListener('click', () => { try { input.showPicker(); } catch (_) {} }); });
      readLegacyQuery();
    };
    const split = value => value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean);
    const quantityFieldOf = (item, type) => {
      if (type === 'purchaseQty') return Number(item.purchaseQty || 0);
      if (item.removed) return 0;
      if (type === 'actualPurchaseQty') return Number(item.actualPurchaseQty || 0);
      if (type === 'differenceQty') return item.actualPurchaseQty == null ? 0 : Math.abs(Number(item.actualPurchaseQty) - Number(item.purchaseQty || 0));
      if (type === 'receivedQty') return Number(item.receivedQty || 0);
      return Number(purchaseInTransit(item) || 0);
    };
    const filteredDocs = computed(() => {
      filters.queryTick;
      const codeType = document.querySelector('#codeType').value; const codeMap = { SKU: 'sku', '供应商料号': 'supplierSku', '领星 SKU': 'lingxingSku', FNSKU: 'fnsku' };
      const codes = legacy.codes.map(value => value.toLowerCase());
      const documentNoType = document.querySelector('#documentNoType').value;
      const documentNos = split(document.querySelector('#documentNoInput').value);
      const purchaseStatus = document.querySelector('#purchaseStatus').value;
      const names = document.querySelector('#productName').value.trim().toLowerCase();
      const qtyType = document.querySelector('#quantityType').value;
      const qtyMin = document.querySelector('#quantityMin').value.trim();
      const qtyMax = document.querySelector('#quantityMax').value.trim();
      const hasQtyRange = qtyMin !== '' || qtyMax !== '';
      const inQtyRange = value => (!qtyMin || value >= Number(qtyMin)) && (!qtyMax || value <= Number(qtyMax));
      const remark = document.querySelector('#remark').value.trim().toLowerCase();
      return documents.value.filter(doc => {
        if (activeStatus.value !== 'all') {
          const group = STATUS_GROUP_MAP[activeStatus.value];
          if (group) {
            if (!group.includes(doc.status)) return false;
          } else if (doc.status !== activeStatus.value) return false;
        }
        if (codes.length && !doc.items.some(item => codes.some(code => String(item[codeMap[codeType]] || '').toLowerCase().includes(code)))) return false;
        if (documentNoType === 'plan' && documentNos.length && !documentNos.some(value => doc.planNo.toLowerCase().includes(value))) return false;
        if (names && !doc.items.some(item => item.productName.toLowerCase().includes(names))) return false;
        if (documentNoType === 'purchase' && documentNos.length && !documentNos.some(value => doc.items.some(item => [item, ...(item.components || [])].some(part => part.purchaseNo?.toLowerCase().includes(value))))) return false;
        if (purchaseStatus && !doc.items.some(item => [item, ...(item.components || [])].some(part => skuPurchaseStatus(doc, part) === purchaseStatus))) return false;
        if (hasQtyRange && !doc.items.some(item => [item, ...(item.components || [])].some(part => inQtyRange(quantityFieldOf(part, qtyType))))) return false;
        if (remark && !(doc.remark || '').toLowerCase().includes(remark)) return false;
        if (legacy.warehouses.length && !legacy.warehouses.includes(doc.warehouse)) return false;
        if (legacy.platforms.length && !legacy.platforms.includes(doc.platform)) return false;
        if (legacy.countries.length && !legacy.countries.includes(doc.country)) return false;
        if (legacy.stores.length && !legacy.stores.includes(doc.store)) return false;
        if (legacy.teams.length && !doc.items.some(item => legacy.teams.includes(item.team))) return false;
        if (legacy.creators.length && !legacy.creators.includes(doc.creator)) return false;
        if (legacy.purchasers.length && !doc.items.some(item => [item, ...(item.components || [])].some(part => legacy.purchasers.includes(part.purchaser)))) return false;
        const hasUrgentDetail = doc.items.some(item => item.urgent || (item.components || []).some(part => part.urgent));
        if (legacy.urgent === '是' && !hasUrgentDetail) return false;
        if (legacy.urgent === '否' && hasUrgentDetail) return false;
        /* 是否移除按明细级过滤：单据下需存在对应明细，明细行过滤见 planDetailRows */
        if (legacy.removed) {
          const wantRemoved = legacy.removed === '是';
          const removedFlags = doc.items.flatMap(item => [item, ...(item.components || [])].map(part => isSkuRemoved(doc, part)));
          if (wantRemoved ? !removedFlags.some(Boolean) : !removedFlags.some(flag => !flag)) return false;
        }
        /* 是否首次采购按明细级过滤：与「首」标记口径一致，单据下需存在对应明细，明细行过滤见 planDetailRows */
        if (legacy.firstPurchase) {
          const wantFirst = legacy.firstPurchase === '是';
          const firstFlags = doc.items.flatMap(item => [item, ...(item.components || [])].map(part => firstOrderOf(part)));
          if (wantFirst ? !firstFlags.some(Boolean) : firstFlags.some(Boolean)) return false;
        }
        const dateType = document.querySelector('#timeType').value;
        const date = dateType === '更新时间' ? doc.createdAt.slice(0, 10) : doc.createdAt.slice(0, 10);
        const start = document.querySelector('#startDate').value; const end = document.querySelector('#endDate').value;
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
      });
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(filteredDocs.value.length / pageSize.value)));
    const currentPage = computed(() => Math.min(page.value, totalPages.value));
    const pageList = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1));
    const pagedDocs = computed(() => filteredDocs.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value));
    const goPage = value => { if (value >= 1 && value <= totalPages.value) page.value = value; };
    const changePageSize = event => { pageSize.value = Number(event.target.value); page.value = 1; expandedIds.clear(); };
    const statusCount = status => {
      if (status === 'all') return documents.value.length;
      const group = STATUS_GROUP_MAP[status];
      if (group) return documents.value.filter(doc => group.includes(doc.status)).length;
      return documents.value.filter(doc => doc.status === status).length;
    };
    const itemAmount = item => Number(item.purchaseQty || 0) * Number(item.unitPrice || 0);
    /* 计划采购金额展示：计划采购量 × 上次采购价，纯数字两位小数、无千位分隔符；任一为空显示空（整数化运算避免浮点误差） */
    const planAmountText = item => {
      const qty = Number(item.purchaseQty);
      const price = Number(item.unitPrice);
      if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price <= 0) return '';
      const qtyCents = Math.round(qty * 100);
      return (Math.round(qtyCents * price) / 100).toFixed(2);
    };
    const itemCartons = item => item.cartonSpec > 0 ? Math.ceil(Number(item.purchaseQty || 0) / Number(item.cartonSpec)) : '—';
    const purchaseInTransit = item => !item.purchaseNo || item.actualPurchaseQty == null ? null : Math.max(0, Number(item.actualPurchaseQty || 0) - Number(item.receivedQty || 0));
    const detailDisplayRows = items => items.flatMap(item => {
      const components = item.components?.length ? item.components : [item];
      const sharedFields = ['team', 'deliveryDate', 'platform', 'store', 'fnsku', 'country', 'operator'];
      return components.map((component, index) => ({
        key: `${item.detailId}-${index}`,
        item,
        component: component === item ? item : { ...component, ...Object.fromEntries(sharedFields.map(field => [field, item[field]])) },
        first: index === 0,
        span: components.length,
      }));
    });
    const detailDifferenceTotal = items => detailDisplayRows(items).reduce((sum, { component }) => (component.removed || component.actualPurchaseQty == null) ? sum : sum + Math.abs(Number(component.actualPurchaseQty) - Number(component.purchaseQty || 0)), 0);
    /* 二级列表实际展示行：查询区「是否移除」选择后只保留对应明细，并重算组合品的首行与合并行数 */
    const planDetailRows = doc => {
      const rows = detailDisplayRows(doc.items);
      let kept = rows;
      if (legacy.removed) {
        const wantRemoved = legacy.removed === '是';
        kept = kept.filter(({ component }) => isSkuRemoved(doc, component) === wantRemoved);
      }
      if (legacy.firstPurchase) {
        const wantFirst = legacy.firstPurchase === '是';
        kept = kept.filter(({ component }) => firstOrderOf(component) === wantFirst);
      }
      if (kept === rows) return rows;
      const grouped = new Map();
      kept.forEach(row => { const list = grouped.get(row.item.detailId) || []; list.push(row); grouped.set(row.item.detailId, list); });
      return [...grouped.values()].flatMap(list => list.map((row, index) => ({ ...row, first: index === 0, span: list.length })));
    };
    const detailQuantityTotal = (items, field) => detailDisplayRows(items).reduce((sum, { component }) => {
      const value = field === 'purchaseInTransit' ? purchaseInTransit(component) : component[field];
      return sum + Number(value || 0);
    }, 0);
    const filteredSkuCount = computed(() => filteredDocs.value.reduce((sum, doc) => sum + planDetailRows(doc).length, 0));
    const filteredQuantityTotals = computed(() => {
      const rows = filteredDocs.value.flatMap(doc => planDetailRows(doc));
      const sum = valueOf => rows.reduce((total, { component }) => total + Number(valueOf(component) || 0), 0);
      return {
        purchaseQty: sum(item => item.purchaseQty),
        actualPurchaseQty: sum(item => item.actualPurchaseQty),
        differenceQty: sum(item => (item.removed || item.actualPurchaseQty == null) ? 0 : Math.abs(Number(item.actualPurchaseQty) - Number(item.purchaseQty || 0))),
        receivedQty: sum(item => item.receivedQty),
        inTransit: sum(item => purchaseInTransit(item))
      };
    });
    const planTotalQty = plan => plan.items.reduce((sum, item) => sum + Number(item.purchaseQty || 0), 0);
    const planTotalAmount = plan => plan.items.reduce((sum, item) => sum + itemAmount(item), 0);
    const nowText = () => { const now = new Date(); const pad = value => String(value).padStart(2, '0'); return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`; };
    const nextPlanNo = () => {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', year: '2-digit', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      const part = type => parts.find(value => value.type === type).value;
      const prefix = `PP${part('year')}${part('month')}${part('day')}`;
      const last = documents.value.reduce((max, doc) => {
        const value = doc.planNo || doc.docNo || '';
        if (!value.startsWith(prefix) || value.length !== prefix.length + 4) return max;
        const sequence = Number(value.slice(prefix.length));
        return Number.isInteger(sequence) ? Math.max(max, sequence) : max;
      }, 0);
      return last < 9999 ? `${prefix}${String(last + 1).padStart(4, '0')}` : null;
    };
    const editingRemarkId = ref(null);
    const remarkDraft = ref('');
    const openRemarkEditor = doc => {
      if (editingRemarkId.value === doc.id) return cancelRemarkEditor();
      editingRemarkId.value = doc.id;
      remarkDraft.value = doc.remark || '';
    };
    const cancelRemarkEditor = () => { editingRemarkId.value = null; remarkDraft.value = ''; };
    const saveBatchRemark = doc => {
      const value = remarkDraft.value.trim();
      if (value !== (doc.remark || '')) {
        doc.remark = value;
        doc.updatedAt = nowText();
        ElementPlus.ElMessage.success('计划备注已保存');
      }
      cancelRemarkEditor();
    };
    const documentDialogVisible = ref(false); const documentDialogMode = ref('create'); const viewedPlanNo = ref(''); const documentDialogTitle = computed(() => documentDialogMode.value === 'create' ? '新建采购计划' : documentDialogMode.value === 'edit' ? '编辑采购计划' : viewedPlanNo.value ? `查看采购计划 ${viewedPlanNo.value}` : '查看采购计划');
    const currentLoginName = () => document.querySelector('.global-right .admin')?.textContent?.replace(/[⌄∨▼]\s*$/, '').trim() || 'Admin';
    /* 操作权限：正式环境由登录账号的角色权限下发；原型按账号模拟，仅授权账号可见「提交审核」按钮 */
    const SUBMIT_AUDIT_ROLE_USERS = ['Admin', '李晨', '张敏'];
    const canSubmitAudit = computed(() => SUBMIT_AUDIT_ROLE_USERS.includes(currentLoginName()));
    const blankForm = () => ({ id: null, docNo: '', planNo: '', stockPlanNo: '', platform: '', store: '', country: '', supplier: '', warehouse: '', status: 'draft', creator: currentLoginName(), planOwner: currentLoginName(), createdAt: '', remark: '', items: [] }); const form = reactive(blankForm());
    const normalizeItem = (item, doc) => ({ ...mkItem(item, { purchaseQty: item.purchaseQty ?? item.stockQty, unitPrice: item.unitPrice ?? 0, deliveryDate: item.deliveryDate || '' }), ...item, platform: item.platform || doc.platform || '', store: item.store || doc.store || '', country: item.country || doc.country || '', supplier: item.supplier || doc.supplier || '', warehouse: item.warehouse || doc.warehouse || '', team: item.team || doc.team || '', operator: item.operator || doc.creator || '' });
    const assignForm = doc => { const source = clone(doc); source.items = (source.items || []).map(item => normalizeItem(item, source)); Object.assign(form, blankForm(), source); };
    const openCreate = () => { viewedPlanNo.value = ''; documentDialogMode.value = 'create'; assignForm(blankForm()); documentDialogVisible.value = true; };
    const openEdit = doc => { viewedPlanNo.value = ''; documentDialogMode.value = 'edit'; assignForm(doc); documentDialogVisible.value = true; };
    const openView = doc => { viewedPlanNo.value = ''; documentDialogMode.value = 'view'; assignForm(doc); documentDialogVisible.value = true; };
    const openPlanDetail = (doc, item) => { viewedPlanNo.value = doc.planNo; documentDialogMode.value = 'view'; assignForm({ ...doc, items: [item] }); documentDialogVisible.value = true; };
    const skuDialogVisible = ref(false); const skuBatchInput = ref(''); const skuQueryResults = ref([]); const unmatchedSkuCodes = ref([]); const selectedProducts = ref([]); const skuFillInput = ref('153US0000017\n153US0000024\n153US0000031'); const skuFillUnmatched = ref([]); const availableProducts = computed(() => productPool.filter(product => !form.items.some(item => item.sku === product.sku))); const fillSkuItems = () => { const codes = [...new Set(skuFillInput.value.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean))]; if (!codes.length) return ElementPlus.ElMessage.warning('请先输入至少一个 SKU'); const map = new Map(productPool.map(product => [product.sku.toUpperCase(), product])); const existing = new Set(form.items.map(item => item.sku.toUpperCase())); const matched = []; const unmatched = []; codes.forEach(code => { const product = map.get(code.toUpperCase()); if (!product || existing.has(code.toUpperCase())) unmatched.push(code); else { matched.push(product); existing.add(code.toUpperCase()); } }); matched.forEach(product => form.items.push(mkItem(product))); skuFillUnmatched.value = unmatched; if (matched.length) ElementPlus.ElMessage.success(`已填充 ${matched.length} 个 SKU 明细`); else ElementPlus.ElMessage.warning('没有可新增的 SKU'); }; const clearSkuQuery = () => { skuBatchInput.value = ''; skuQueryResults.value = []; unmatchedSkuCodes.value = []; selectedProducts.value = []; }; const openSkuDialog = () => { clearSkuQuery(); skuDialogVisible.value = true; }; const querySkus = () => { const codes = [...new Set(skuBatchInput.value.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean))]; if (!codes.length) return ElementPlus.ElMessage.warning('请先输入至少一个 SKU'); const map = new Map(availableProducts.value.map(product => [product.sku.toUpperCase(), product])); skuQueryResults.value = codes.map(code => map.get(code.toUpperCase())).filter(Boolean); unmatchedSkuCodes.value = codes.filter(code => !map.has(code.toUpperCase())); selectedProducts.value = []; ElementPlus.ElMessage[skuQueryResults.value.length ? 'success' : 'warning'](skuQueryResults.value.length ? `匹配到 ${skuQueryResults.value.length} 个可加入的 SKU` : '没有匹配到可加入的 SKU'); }; const addSelectedSkus = () => { if (!selectedProducts.value.length) return ElementPlus.ElMessage.warning('请至少选择一个 SKU'); selectedProducts.value.forEach(product => form.items.push(mkItem(product))); skuDialogVisible.value = false; clearSkuQuery(); }; const removeSku = index => form.items.splice(index, 1); const fillEmptyItemFields = () => { const source = form.items[0]; if (!source) return ElementPlus.ElMessage.warning('请先添加 SKU'); const fields = ['deliveryDate', 'platform', 'store', 'country', 'warehouse', 'supplier', 'operator', 'cartonSpec']; form.items.slice(1).forEach(item => fields.forEach(field => { if (!item[field] && source[field]) item[field] = source[field]; })); ElementPlus.ElMessage.success('已将首行的已填信息补充到其他明细'); };
    const skuNameInput = ref('');
    /* 明细表头「批量」：为团队、计划采购量、计划交货日期、平台、店铺、国家、运营负责人、采购仓库一次性赋值到全部明细行 */
    const batchFill = reactive({ team: '', purchaseQty: null, deliveryDate: '', platform: '', store: '', country: '', operator: '', warehouse: '' });
    const batchFillVisible = reactive({ team: false, purchaseQty: false, deliveryDate: false, platform: false, store: false, country: false, operator: false, warehouse: false });
    const batchFillLabels = { team: '团队', purchaseQty: '计划采购量', deliveryDate: '计划交货日期', platform: '平台', store: '店铺', country: '国家', operator: '运营负责人', warehouse: '采购仓库' };
    const applyBatchFill = field => {
      const value = batchFill[field];
      if (value === null || value === undefined || value === '') return ElementPlus.ElMessage.warning(`请先填写${batchFillLabels[field]}`);
      if (!form.items.length) return ElementPlus.ElMessage.warning('请先添加 SKU 明细');
      form.items.forEach(item => { item[field] = value; });
      batchFill[field] = field === 'purchaseQty' ? null : '';
      batchFillVisible[field] = false;
      ElementPlus.ElMessage.success(`已将${batchFillLabels[field]}批量应用到 ${form.items.length} 个明细`);
    };
    const cancelBatchFill = field => { batchFill[field] = field === 'purchaseQty' ? null : ''; batchFillVisible[field] = false; };
    const resetSkuPicker = () => { skuBatchInput.value = ''; skuNameInput.value = ''; unmatchedSkuCodes.value = []; selectedProducts.value = []; skuQueryResults.value = [...availableProducts.value]; };
    const openSkuPicker = () => { resetSkuPicker(); skuDialogVisible.value = true; };
    const querySkuPicker = () => {
      const terms = skuBatchInput.value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean);
      const name = skuNameInput.value.trim().toLowerCase();
      skuQueryResults.value = availableProducts.value.filter(product =>
        (!terms.length || terms.some(term => product.sku.toLowerCase().includes(term))) &&
        (!name || product.productName.toLowerCase().includes(name))
      );
      unmatchedSkuCodes.value = terms.filter(term => !availableProducts.value.some(product => product.sku.toLowerCase().includes(term)));
      selectedProducts.value = [];
    };
    const saveDocument = async (action = 'submit') => {
      if (action === 'submit') {
        if (!form.items.length) return ElementPlus.ElMessage.warning('请至少添加一个 SKU 明细');
        const invalid = form.items.find(item => !item.team || !item.deliveryDate || !Number(item.purchaseQty));
        if (invalid) return ElementPlus.ElMessage.warning(`SKU ${invalid.sku} 请填写团队、计划交货日期和计划采购数量`);
      }
      form.items.forEach(item => { item.amount = itemAmount(item); });
      const payload = clone(form); payload.updatedAt = nowText();
      if (action === 'draft') payload.status = 'draft';
      else if (payload.status === 'draft') payload.status = 'pending_review';
      delete payload.team;
      const primaryItem = payload.items[0];
      if (primaryItem) Object.assign(payload, { platform: primaryItem.platform, store: primaryItem.store, country: primaryItem.country, supplier: primaryItem.supplier, warehouse: primaryItem.warehouse });
      if (documentDialogMode.value === 'create') {
        payload.id = Math.max(...documents.value.map(doc => doc.id), 0) + 1;
        payload.docNo = nextPlanNo();
        if (!payload.docNo) return ElementPlus.ElMessage.error('当日采购计划流水号已用完，请联系管理员');
        payload.planNo = payload.docNo;
        payload.createdAt = payload.updatedAt = nowText();
        ensurePlanIdentifiers(payload);
        syncSkuPurchaseStatuses(payload);
        documents.value.unshift(payload);
      } else {
        ensurePlanIdentifiers(payload);
        syncSkuPurchaseStatuses(payload);
        const index = documents.value.findIndex(doc => doc.id === payload.id);
        if (index >= 0) documents.value[index] = payload;
      }
      documentDialogVisible.value = false;
      ElementPlus.ElMessage.success(action === 'draft' ? '采购计划已保存到草稿' : documentDialogMode.value === 'create' || form.status === 'draft' ? '采购计划已提交审核' : '采购计划修改成功');
    };
    const changeStatus = (doc, status, message) => { doc.status = status; syncSkuPurchaseStatuses(doc); doc.updatedAt = nowText(); ElementPlus.ElMessage.success(message); };
    const auditDialogVisible = ref(false); const auditDialogTitle = ref(''); const auditFormRef = ref(); const auditForm = reactive({ comment: '' }); const auditTargets = ref([]); const auditMode = ref('single');
    const auditRules = { comment: [{ validator: (rule, value, callback) => { if (auditMode.value === 'reject_required' && !value.trim()) callback(new Error('驳回时审核意见为必填')); else callback(); }, trigger: 'blur' }] };
    const openBatchAudit = () => { const targets = selectedDocs.value.filter(doc => AUDITABLE_STATUSES.includes(doc.status)); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可审核的采购计划'); auditMode.value = 'batch'; auditTargets.value = [...targets]; auditForm.comment = ''; auditDialogTitle.value = '审核（' + targets.length + ' 张单据）'; auditDialogVisible.value = true; };
    const submitAudit = doc => ElementPlus.ElMessageBox.confirm('确认提交采购计划 ' + doc.planNo + ' 进入审核？', '提交审核', { type: 'warning' }).then(() => { changeStatus(doc, 'pending_review', '采购计划已提交审核'); }).catch(() => {});
    const submitAuditAction = action => {
      const isReject = action === 'reject';
      if (isReject) { auditMode.value = 'reject_required'; if (!auditForm.comment.trim()) return ElementPlus.ElMessage.warning('驳回时请填写审核意见'); }
      auditMode.value = 'single';
      auditTargets.value.forEach(doc => {
        const comment = auditForm.comment.trim();
        if (comment) doc.remark = (doc.remark ? doc.remark + '；' : '') + (isReject ? '驳回：' : '审核通过：') + comment;
        if (isReject) { changeStatus(doc, 'rejected', '采购计划已驳回'); }
        else { doc.status = 'pending_purchase'; syncSkuPurchaseStatuses(doc); doc.updatedAt = nowText(); ElementPlus.ElMessage.success('审核完成'); }
      });
      auditDialogVisible.value = false;
    };
    const voidDocument = doc => { if (!VOIDABLE_STATUSES.includes(doc.status)) return ElementPlus.ElMessage.warning('当前状态不可作废，仅草稿、待审核可作废'); ElementPlus.ElMessageBox.prompt('作废后将停止当前采购流程，请输入作废原因：', '二次确认：作废采购计划', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { doc.remark = '作废原因：' + value; changeStatus(doc, 'voided', '采购计划已作废'); }).catch(() => {}); };
    const batchVoid = () => { const targets = selectedDocs.value.filter(doc => VOIDABLE_STATUSES.includes(doc.status)); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可作废的采购计划（仅草稿、待审核可作废）'); ElementPlus.ElMessageBox.prompt('作废后将停止选中采购计划的流程，请输入作废原因：', '作废', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { targets.forEach(doc => { doc.remark = '作废原因：' + value; doc.status = 'voided'; doc.updatedAt = nowText(); }); ElementPlus.ElMessage.success('已作废 ' + targets.length + ' 张采购计划'); }).catch(() => {}); };
    /* 草稿批量提交审核：仅支持整张采购计划勾选，二次确认后统一流转到待审核；未勾选或只勾了明细时给出提示 */
    const openBatchSubmitAudit = () => {
      const targets = selectedDocs.value.filter(doc => doc.status === 'draft');
      if (!targets.length) {
        return ElementPlus.ElMessage.warning(selectedDetailNos.size ? '提交审核仅支持按整张采购计划勾选，请在单据行勾选后再提交' : '请先勾选需要提交审核的采购计划');
      }
      const issue = doc => !doc.items.length ? '未添加 SKU 明细' : (doc.items.some(item => !item.team || !item.deliveryDate || !Number(item.purchaseQty)) ? '存在未填写团队、计划交货日期或计划采购量的 SKU 明细' : '');
      const invalid = targets.find(doc => issue(doc));
      if (invalid) return ElementPlus.ElMessage.warning(`采购计划 ${invalid.planNo}：${issue(invalid)}，请补全后再提交`);
      ElementPlus.ElMessageBox.confirm(`确认将选中的 ${targets.length} 张采购计划提交审核吗？提交后进入审核流程，审核通过前不可编辑。`, '提交审核', { type: 'warning', confirmButtonText: '确认提交', cancelButtonText: '取消' }).then(() => {
        targets.forEach(doc => { doc.status = 'pending_review'; syncSkuPurchaseStatuses(doc); doc.updatedAt = nowText(); });
        selectedDetailNos.clear();
        ElementPlus.ElMessage.success(`已提交 ${targets.length} 张采购计划，等待审核`);
      }).catch(() => {});
    };
    const showExport = () => ElementPlus.ElMessage.success('已按当前筛选条件生成采购计划导出任务');
    const copyDetailsToNewPlan = targets => {
      openCreate();
      /* 复制仅保留团队；其余可编辑字段一律置空，不填充任何默认值（避免用户未察觉默认值而提交错误数据） */
      form.items = targets.map(({ item }) => {
        const copied = normalizeItem(clone(item), {});
        copied.detailId = undefined;
        copied.team = item.team || '';
        ['purchaseQty', 'deliveryDate', 'platform', 'store', 'country', 'warehouse', 'operator', 'remark', 'fnsku'].forEach(field => { copied[field] = field === 'purchaseQty' ? null : ''; });
        copied.actualPurchaseQty = null;
        copied.receivedQty = null;
        copied.purchaseNo = '';
        copied.purchaseStatus = '待提交';
        copied.shipmentNo = '';
        copied.purchaser = '';
        copied.amount = 0;
        copied.urgent = false;
        copied.removed = false;
        (copied.components || []).forEach(component => {
          component.actualPurchaseQty = null;
          component.receivedQty = null;
          component.purchaseNo = '';
          component.purchaseStatus = '待提交';
          component.shipmentNo = '';
          component.amount = 0;
          component.urgent = false;
          component.removed = false;
        });
        return copied;
      });
      ElementPlus.ElMessage.success(`已带入 ${form.items.length} 条 SKU 明细（仅保留团队，其余字段需自行填写）`);
    };
    const handleMoreCommand = command => {
      const targets = selectedPlans.value;
      if (command === 'copy') {
        if (!targets.length) return ElementPlus.ElMessage.warning('请先勾选二级列表中的 SKU 明细');
        return copyDetailsToNewPlan(targets);
      }
      if (!targets.length) return ElementPlus.ElMessage.warning('请先勾选二级列表中的采购计划');
      if (command === 'urgent') {
        const blocked = targets.filter(({ doc }) => MORE_ACTION_BLOCKED_STATUSES.includes(doc.status));
        if (blocked.length) return ElementPlus.ElMessage.warning('已完结、已驳回、已作废的采购计划不支持加急，请取消勾选其他状态的明细');
        targets.forEach(({ doc, item }) => { item.urgent = true; doc.updatedAt = nowText(); });
        ElementPlus.ElMessage.success(`已将 ${targets.length} 条采购计划标记为加急`);
        return;
      }
      if (command === 'delete') {
        const blocked = targets.filter(({ doc }) => !DETAIL_DELETABLE_STATUSES.includes(doc.status));
        if (blocked.length) return ElementPlus.ElMessage.warning('仅「草稿」和「待审核」状态的采购计划支持删除明细，请取消勾选其他状态的明细');
        const detailIds = new Set(targets.map(({ item }) => item.detailId));
        ElementPlus.ElMessageBox.confirm(`确定删除选中的 ${detailIds.size} 条 SKU 明细吗？所属采购计划将保留，此操作不能撤销。`, '确认删除', { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }).then(() => {
          documents.value.forEach(doc => {
            const remaining = doc.items.filter(item => !detailIds.has(item.detailId));
            if (remaining.length !== doc.items.length) { doc.items = remaining; doc.updatedAt = nowText(); }
          });
          detailIds.forEach(detailId => selectedDetailNos.delete(detailId));
          ElementPlus.ElMessage.success(`已删除 ${detailIds.size} 条 SKU 明细，采购计划已保留`);
        }).catch(() => {});
      }
    };
    const expandedIds = reactive(new Set());
    const isExpanded = id => expandedIds.has(id);
    const toggleExpand = id => { expandedIds.has(id) ? expandedIds.delete(id) : expandedIds.add(id); };
    const expandAllChecked = computed(() => pagedDocs.value.length > 0 && pagedDocs.value.every(doc => expandedIds.has(doc.id)));
    const toggleExpandAll = () => { const next = !expandAllChecked.value; pagedDocs.value.forEach(doc => { if (next) expandedIds.add(doc.id); else expandedIds.delete(doc.id); }); };
    /* 编码复制：与采购单页一致的复制 icon 行为，空值不处理 */
    const writeClipboard = (text, message) => {
      const done = () => ElementPlus.ElMessage.success(message);
      const fallback = () => { const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); try { document.execCommand('copy'); done(); } catch { ElementPlus.ElMessage.error('复制失败'); } document.body.removeChild(area); };
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); return; }
      fallback();
    };
    const copyCellText = (value, label) => {
      const text = String(value ?? '').trim();
      if (!text || text === '—') return;
      writeClipboard(text, `已复制：${text}`);
    };
    const copyPagePlanNos = () => {
      const list = [...new Set(pagedDocs.value.map(doc => String(doc.planNo ?? '').trim()).filter(value => value && value !== '—'))];
      if (!list.length) { ElementPlus.ElMessage.warning('本页暂无可复制的采购计划号'); return; }
      writeClipboard(list.join('\n'), `已复制 ${list.length} 个采购计划号`);
    };
    const toggleSelect = (doc, event) => { doc.items.forEach(item => { event.target.checked ? selectedDetailNos.add(item.detailId) : selectedDetailNos.delete(item.detailId); }); };
    const allSelected = computed(() => pagedDocs.value.length > 0 && pagedDocs.value.every(isSelected));
    const someSelected = computed(() => pagedDocs.value.some(doc => doc.items.some(isDetailSelected)));
    const toggleSelectAll = event => { pagedDocs.value.forEach(doc => toggleSelect(doc, event)); };
    const selectStatus = name => { activeStatus.value = name; page.value = 1; };
    const openImportCreate = () => UIKit.openImportDialog({
      title: '导入创建采购计划',
      guideTitle: '第一步：使用采购计划标准模板整理数据',
      guideText: '一张采购计划可包含多个 SKU 和多个团队；团队按 SKU 明细填写。导入字段与校验规则待确认，当前仅演示导入入口。',
      onDownload: () => ElementPlus.ElMessage.info('采购计划导入模板待确定'),
      onConfirm: () => ElementPlus.ElMessage.warning('采购计划导入字段与校验规则尚未确定，暂不能提交导入')
    });
    const openImportCreateFromDialog = () => {
      openImportCreate();
      const masks = document.querySelectorAll('.ui-dialog-mask');
      masks[masks.length - 1]?.classList.add('purchase-plan-import-mask');
    };
    initLegacyQuery();
    const formTotalQty = computed(() => planTotalQty(form)); const formTotalAmount = computed(() => planTotalAmount(form));
    return { ...columnConfig, showAuditAction, showVoidAction, moreActionsDisabled, platforms, stores, countries, suppliers, warehouses, teams, creators, documents, activeStatus, statusTabs, page, pageSize, selectedDocs, selectedPlanCount, isDetailSelected, toggleDetail, isPartiallySelected, someSelected, selectedPlans, filteredDocs, pagedDocs, copyPagePlanNos, statusMeta, confirmerLabel, PENDING_REVIEW_STATUSES, statusCount, planTotalQty, planTotalAmount, itemAmount, planAmountText, itemCartons, purchaseInTransit, skuPurchaseStatus, firstOrderOf, isSkuRemoved, removedMetaOf, detailDisplayRows, planDetailRows, detailQuantityTotal, detailDifferenceTotal, filteredSkuCount, filteredQuantityTotals, formTotalQty, formTotalAmount, editingRemarkId, remarkDraft, openRemarkEditor, cancelRemarkEditor, saveBatchRemark, documentDialogVisible, documentDialogMode, documentDialogTitle, form, openCreate, openImportCreate, openImportCreateFromDialog, openEdit, openView, openPlanDetail, saveDocument, fnskuOptionsFor, skuDialogVisible, skuBatchInput, skuNameInput, skuQueryResults, unmatchedSkuCodes, selectedProducts, skuFillInput, skuFillUnmatched, fillSkuItems, openSkuDialog, openSkuPicker, querySkus, querySkuPicker, clearSkuQuery, resetSkuPicker, addSelectedSkus, removeSku, fillEmptyItemFields, batchFill, batchFillVisible, applyBatchFill, cancelBatchFill, auditDialogVisible, auditDialogTitle, auditFormRef, auditForm, auditRules, auditTargets, openBatchAudit, submitAudit, submitAuditAction, voidDocument, batchVoid, openBatchSubmitAudit, canSubmitAudit, showExport, handleMoreCommand, selectStatus, allSelected, isSelected, toggleSelectAll, toggleSelect, isExpanded, toggleExpand, toggleExpandAll, expandAllChecked, copyCellText, currentPage, totalPages, pageList, goPage, changePageSize };
  }
}).use(ElementPlus).mount(root);

/* 已移除标签：点击弹出移除记录气泡 */
let removedRecordPopover = null;
function closeRemovedRecordPopover() { if (removedRecordPopover) { removedRecordPopover.remove(); removedRecordPopover = null; } }
function openRemovedRecordPopover(anchor, meta) {
  closeRemovedRecordPopover();
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'detail-removed-pop';
  pop.innerHTML = `<div class="detail-removed-pop__head">移除记录</div><dl class="detail-removed-pop__list"><div><dt>移除原因</dt><dd>${meta.reason || '—'}</dd></div></dl>`;
  document.body.appendChild(pop);
  const width = 260;
  pop.style.width = `${width}px`;
  pop.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
  pop.style.top = `${Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 180))}px`;
  removedRecordPopover = pop;
  window.setTimeout(() => { if (removedRecordPopover === pop) document.addEventListener('click', closeRemovedRecordPopover, { once: true }); }, 0);
}
document.addEventListener('click', event => {
  const tag = event.target.closest('.detail-removed-tag');
  if (!tag) return;
  event.stopPropagation();
  let meta = {};
  try { meta = JSON.parse(tag.dataset.meta || '{}'); } catch {}
  openRemovedRecordPopover(tag, meta);
});
