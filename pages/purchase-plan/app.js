const { createApp, ref, reactive, computed } = Vue;

const root = document.querySelector('#purchaseBusinessApp');
root.innerHTML = `
  <section class="action-strip ui-action-row"><div class="head-actions"><button class="btn primary" @click="openCreate">新建采购计划</button><button class="btn" @click="showPlanList">采购计划管理清单</button><button class="btn" :disabled="selectedDocs.length === 0" @click="batchGeneratePO">生成采购单</button><button class="btn success" :disabled="selectedDocs.length === 0" @click="openBatchAudit">批量审核</button><button class="btn danger" :disabled="selectedDocs.length === 0" @click="batchVoid">批量作废</button><button class="btn" @click="showExport">导出</button></div></section>
  <section class="list-card ui-list-card">
    <section class="status-bar"><div class="status-tabs"><button v-for="tab in statusTabs" :key="tab.name" class="status-tab" :class="{active: activeStatus === tab.name}" @click="selectStatus(tab.name)"><span>{{ tab.label }}</span><em>{{ statusCount(tab.name) }}</em></button></div></section>
    <section class="table-area ui-table-wrap">
      <table class="purchase-plan-table document-list ui-table">
        <colgroup><col class="check-col"><col class="expand-col"><col class="no-col"><col class="info-col"><col class="sku-col"><col class="total-col"><col class="action-col"></colgroup>
        <thead><tr><th><input class="head-check" type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)"></th><th><button class="document-expand expand-all" :class="{expanded: expandAllChecked}" type="button" @click="toggleExpandAll" aria-label="展开/折叠全部"></button></th><th>采购计划</th><th>业务信息</th><th>SKU数</th><th>采购合计</th><th>操作</th></tr></thead>
        <tbody v-for="doc in pagedDocs" :key="doc.id">
          <tr class="parent-row" :class="{'is-expanded': isExpanded(doc.id)}">
            <td><input class="row-check" type="checkbox" :checked="isSelected(doc.id)" @change="toggleSelect(doc.id, $event)"></td>
            <td><button class="document-expand" :class="{expanded: isExpanded(doc.id)}" type="button" @click="toggleExpand(doc.id)" aria-label="展开明细"></button></td>
            <td><div class="doc-line"><button class="link doc-no" type="button" @click="openView(doc)">{{ doc.docNo }}</button><span class="pp-status" :class="'pp-status--' + doc.status">{{ statusMeta(doc.status).label }}</span></div><div class="field-line"><span class="field-label">创建时间：</span><span class="field-value">{{ doc.createdAt }}</span></div><div class="field-line"><span class="field-label">流转状态：</span><span class="field-value">{{ confirmerLabel(doc) || '—' }}</span></div></td>
            <td><div class="field-line"><span class="field-label">平台：</span><span class="field-value">{{ doc.platform }}</span></div><div class="field-line"><span class="field-label">站点：</span><span class="field-value">{{ doc.country }} · {{ doc.store }} · {{ doc.warehouse }}</span></div><div class="field-line"><span class="field-label">团队：</span><span class="field-value">{{ doc.team }} · {{ doc.creator }}</span></div></td>
            <td><div class="field-line"><span class="field-label">SKU 数：</span><span class="field-value">{{ doc.items.length }}</span></div></td>
            <td><div class="field-line"><span class="field-label">数量：</span><span class="field-value">共 {{ planTotalQty(doc).toLocaleString() }} 件</span></div><div class="field-line"><span class="field-label">金额：</span><span class="field-value amount-value">¥ {{ planTotalAmount(doc).toLocaleString() }}</span></div></td>
            <td><div class="action-links"><button v-for="action in rowActions(doc)" :key="action.action" class="link" :class="{ 'danger-link': action.danger }" type="button" @click="handleRowAction(doc, action.action)">{{ action.label }}</button></div></td>
          </tr>
          <tr v-if="isExpanded(doc.id)" class="detail-row"><td colspan="7"><div class="detail-wrap"><table class="purchase-detail-table"><thead><tr><th>SKU</th><th>品名</th><th>备货数量</th><th>采购数量</th><th>采购单价</th><th>采购金额</th><th>采购仓</th><th>期望交货日期</th><th>关联采购单号</th><th>关联发货单号</th><th>明细备注</th></tr></thead><tbody><tr v-for="item in doc.items" :key="item.sku"><td>{{ item.sku }}</td><td>{{ item.productName }}</td><td>{{ item.stockQty }}</td><td>{{ item.purchaseQty }}</td><td>¥ {{ Number(item.unitPrice || 0).toFixed(2) }}</td><td>¥ {{ Number(item.amount || 0).toLocaleString() }}</td><td>{{ item.warehouse }}</td><td>{{ item.deliveryDate }}</td><td>{{ item.purchaseNo || '未生成' }}</td><td>{{ item.shipmentNo || '—' }}</td><td>{{ item.remark || '—' }}</td></tr></tbody></table></div></td></tr>
        </tbody>
      </table>
      <div class="empty" v-if="!pagedDocs.length">暂无符合条件的采购计划</div>
    </section>
    <footer class="bottom-bar"><div>已选 <b>{{ selectedDocs.length }}</b> 条结果</div><div class="pager"><span>共 <b>{{ filteredDocs.length }}</b> 张</span><select class="control page-size" :value="pageSize" @change="changePageSize($event)"><option :value="10">10张/页</option><option :value="15">15张/页</option><option :value="30">30张/页</option></select><button class="page-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">‹</button><span><button v-for="p in pageList" :key="p" class="page-number" :class="{active: p === currentPage}" @click="goPage(p)">{{ p }}</button></span><button class="page-btn" :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)">›</button></div></footer>
  </section>
  <el-dialog v-model="documentDialogVisible" :title="documentDialogTitle" top="5vh" class="purchase-plan-dialog" :class="{ 'is-view-mode': documentDialogMode === 'view' }" :close-on-click-modal="false" destroy-on-close>
    <div class="purchase-plan-dialog-body"><div class="purchase-plan-toolbar" v-if="documentDialogMode !== 'view'"><div class="purchase-plan-toolbar__note">每个 SKU 独立维护计划属性与采购信息</div><div class="purchase-plan-toolbar__actions"><el-button @click="fillEmptyItemFields">一键填充</el-button><el-button type="primary" @click="openSkuDialog">新增 SKU</el-button></div></div><div class="purchase-plan-items"><el-table v-if="form.items.length" :data="form.items" class="purchase-plan-items-table" border><el-table-column prop="sku" label="SKU" width="150" fixed="left"></el-table-column><el-table-column prop="lingxingSku" label="领星 SKU" width="145"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.lingxingSku || '—' }}</span><el-input v-else v-model="scope.row.lingxingSku" placeholder="请输入领星 SKU"></el-input></template></el-table-column><el-table-column prop="productName" label="品名" min-width="180" show-overflow-tooltip></el-table-column><el-table-column label="计划交货日期" width="152"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.deliveryDate || '—' }}</span><el-date-picker v-else v-model="scope.row.deliveryDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期"></el-date-picker></template></el-table-column><el-table-column label="团队" width="142"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.team || '—' }}</span><el-select v-else v-model="scope.row.team" placeholder="请选择团队"><el-option v-for="item in teams" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="平台" width="128"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.platform || '—' }}</span><el-select v-else v-model="scope.row.platform" placeholder="请选择平台"><el-option v-for="item in platforms" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="店铺" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.store || '—' }}</span><el-select v-else v-model="scope.row.store" placeholder="请选择店铺"><el-option v-for="item in stores" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="FNSKU" width="145"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.fnsku || '—' }}</span><el-input v-else v-model="scope.row.fnsku" placeholder="请输入 FNSKU"></el-input></template></el-table-column><el-table-column label="国家" width="112"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.country || '—' }}</span><el-select v-else v-model="scope.row.country" placeholder="请选择国家"><el-option v-for="item in countries" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="采购仓" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.warehouse || '—' }}</span><el-select v-else v-model="scope.row.warehouse" placeholder="请选择采购仓"><el-option v-for="item in warehouses" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="供应商" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.supplier || '—' }}</span><el-select v-else v-model="scope.row.supplier" placeholder="请选择供应商"><el-option v-for="item in suppliers" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="运营负责人" width="145"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.operator || '—' }}</span><el-select v-else v-model="scope.row.operator" placeholder="请选择运营负责人"><el-option v-for="item in creators" :key="item" :label="item" :value="item"></el-option></el-select></template></el-table-column><el-table-column label="箱规（数量）" width="118" align="right"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.cartonSpec || '—' }}</span><el-input-number v-else v-model="scope.row.cartonSpec" :min="1" :max="999999" :controls="false"></el-input-number></template></el-table-column><el-table-column label="箱数" width="84" align="right"><template #default="scope">{{ itemCartons(scope.row) }}</template></el-table-column><el-table-column label="计划采购数量" width="130" align="right"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ Number(scope.row.purchaseQty || 0).toLocaleString() }}</span><el-input-number v-else v-model="scope.row.purchaseQty" :min="0" :max="999999" :controls="false"></el-input-number></template></el-table-column><el-table-column label="采购单价" width="120" align="right"><template #default="scope"><span v-if="documentDialogMode === 'view'">¥ {{ Number(scope.row.unitPrice || 0).toFixed(2) }}</span><el-input-number v-else v-model="scope.row.unitPrice" :min="0" :precision="2" :controls="false"></el-input-number></template></el-table-column><el-table-column label="计划采购金额" width="130" align="right"><template #default="scope">¥ {{ itemAmount(scope.row).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</template></el-table-column><el-table-column label="供应商料号" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.supplierSku || '—' }}</span><el-input v-else v-model="scope.row.supplierSku" placeholder="请输入供应商料号"></el-input></template></el-table-column><el-table-column label="备注" min-width="170"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.remark || '—' }}</span><el-input v-else v-model="scope.row.remark" placeholder="请输入备注"></el-input></template></el-table-column><el-table-column v-if="documentDialogMode !== 'view'" label="操作" width="74" fixed="right"><template #default="scope"><el-button link type="danger" @click="removeSku(scope.$index)">移除</el-button></template></el-table-column></el-table><el-empty v-else description="尚未添加 SKU，请点击“新增 SKU”"></el-empty></div></div><template #footer><div class="purchase-plan-dialog-footer"><div v-if="form.items.length" class="purchase-plan-summary">已选 {{ form.items.length }} 个 SKU ｜ 计划采购总数 {{ formTotalQty.toLocaleString() }} 件 ｜ 计划采购金额 ¥ {{ formTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div><div class="purchase-plan-dialog-footer__actions"><el-button @click="documentDialogVisible = false">{{ documentDialogMode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="documentDialogMode !== 'view'" type="primary" @click="saveDocument">{{ documentDialogMode === 'create' ? '保存采购计划' : '保存修改' }}</el-button></div></div></template>
  </el-dialog>
  <el-dialog v-model="skuDialogVisible" title="批量选择 SKU" width="820px" :close-on-click-modal="false" append-to-body><el-alert title="支持粘贴多个 SKU，使用换行、逗号、空格或分号分隔；采购数量和单价可在保存前调整。" type="info" show-icon :closable="false"></el-alert><div class="sku-batch-query"><el-input v-model="skuBatchInput" type="textarea" :rows="3" resize="none" placeholder="请输入或粘贴多个 SKU"></el-input><div class="sku-query-actions"><el-button @click="clearSkuQuery">清空</el-button><el-button type="primary" @click="querySkus">批量查询</el-button></div></div><el-alert v-if="unmatchedSkuCodes.length" :title="\`以下 SKU 未匹配或已加入明细：\${unmatchedSkuCodes.join('、')}\`" type="warning" show-icon :closable="false"></el-alert><div class="sku-result-head"><div class="sku-result-title">查询结果（{{ skuQueryResults.length }}）</div></div><el-table v-if="skuQueryResults.length" :data="skuQueryResults" border @selection-change="selectedProducts = $event"><el-table-column type="selection" width="48"></el-table-column><el-table-column prop="sku" label="SKU" width="150"></el-table-column><el-table-column prop="productName" label="品名" min-width="200"></el-table-column><el-table-column prop="stockQty" label="备货数量" width="100" align="right"></el-table-column></el-table><el-empty v-else description="请输入 SKU 后点击\"批量查询\""></el-empty><template #footer><el-button @click="skuDialogVisible = false">取消</el-button><el-button type="primary" @click="addSelectedSkus">加入明细（{{ selectedProducts.length }}）</el-button></template></el-dialog>
  <el-dialog v-model="auditDialogVisible" :title="auditDialogTitle" width="520px" :close-on-click-modal="false"><el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-position="top"><div v-if="auditTargets.length" class="audit-targets"><div class="audit-target-label">审核单据：</div><div v-for="doc in auditTargets" :key="doc.id" class="audit-target-item">{{ doc.docNo }}（{{ confirmerLabel(doc) }}）</div></div><el-form-item label="审核意见" prop="comment"><el-input v-model="auditForm.comment" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="审核通过可留空，驳回时请填写原因"></el-input></el-form-item></el-form><template #footer><el-button @click="auditDialogVisible = false">取消</el-button><el-button type="danger" @click="submitAuditAction('reject')">驳回</el-button><el-button type="primary" @click="submitAuditAction('approve')">通过</el-button></template></el-dialog>
`;

/* 团队和计划负责人属于采购计划公共字段；其余字段按 SKU 明细维护。 */
root.querySelector('el-table-column[label="团队"]')?.remove();
root.querySelector('el-table-column[label="供应商"]')?.remove();
const lingxingSkuColumn = root.querySelector('el-table-column[label="领星 SKU"]');
if (lingxingSkuColumn) { lingxingSkuColumn.setAttribute('fixed', 'left'); lingxingSkuColumn.innerHTML = '<template #default="scope"><span>{{ scope.row.lingxingSku || "—" }}</span></template>'; }
root.querySelector('el-table-column[prop="productName"]')?.setAttribute('fixed', 'left');
const supplierSkuColumn = root.querySelector('el-table-column[label="供应商料号"]');
if (supplierSkuColumn) supplierSkuColumn.innerHTML = '<template #default="scope"><span>{{ scope.row.supplierSku || "—" }}</span></template>';
root.querySelector('el-table-column[label="操作"]')?.setAttribute('fixed', 'right');
root.querySelector('el-table-column[label="箱数"]')?.insertAdjacentHTML('afterend', '<el-table-column prop="stockQty" label="备货数量" width="110" align="right"></el-table-column>');
const planToolbar = root.querySelector('.purchase-plan-toolbar');
const planItems = root.querySelector('.purchase-plan-items');
const planItemsTable = planItems?.querySelector('el-table');
planItemsTable?.removeAttribute('v-if');
planItemsTable?.setAttribute('height', '100%');
planItemsTable?.setAttribute('show-summary', '');
planItemsTable?.setAttribute(':summary-method', 'purchasePlanSummary');
root.querySelector('.purchase-plan-items el-empty')?.remove();
planToolbar?.insertAdjacentHTML('afterend', `<div class="purchase-plan-inline-sku"><div class="purchase-plan-inline-sku__input"><el-input v-model="skuFillInput" type="textarea" :rows="3" resize="none" placeholder="请输入或粘贴 SKU，支持换行、逗号、空格分隔"></el-input><div v-if="skuFillUnmatched.length" class="purchase-plan-inline-sku__warning">未匹配或已存在：{{ skuFillUnmatched.join('、') }}</div></div><div class="purchase-plan-inline-sku__actions"><el-button type="primary" @click="fillSkuItems">填充明细</el-button><el-button @click="skuFillInput = ''; skuFillUnmatched = []">清空</el-button></div></div>`);
planToolbar?.insertAdjacentHTML('beforebegin', `<section class="purchase-plan-base-section"><div class="purchase-plan-public-fields"><div class="purchase-plan-public-field"><span><i>*</i>团队</span><span v-if="documentDialogMode === 'view'" class="purchase-plan-public-field__value">{{ form.team || '—' }}</span><el-select v-else v-model="form.team" placeholder="请选择团队"><el-option v-for="item in teams" :key="item" :label="item" :value="item"></el-option></el-select></div><div class="purchase-plan-public-field"><span><i>*</i>计划负责人</span><el-select v-model="form.creator" disabled><el-option v-for="item in creators" :key="item" :label="item" :value="item"></el-option></el-select></div></div></section>`);
planToolbar?.remove();
const skuPicker = root.querySelector('el-dialog[v-model="skuDialogVisible"]');
skuPicker?.remove();

createApp({
  setup() {
    const clone = value => JSON.parse(JSON.stringify(value));
    const suppliers = ['JASIC 供应商', 'ARCCAP 供应商', '华南五金', '东莞焊材', '测试供应商'];
    const warehouses = ['东莞采购仓', '深圳采购仓', '洛杉矶海外仓', '休斯敦海外仓', '供应商直发仓'];
    const platforms = ['Amazon', 'eBay', 'B2C', '线下订单'];
    const countries = ['美国', '英国', '德国', '日本', '中国'];
    const stores = ['ARCCAP', 'Lowes_ar', 'arccaptain', 'Amazon US 旗舰店', '线下订单'];
    const teams = ['亚马逊团队', 'Jasic团队', 'eBay团队', 'B端团队', '公共库存'];
    const creators = ['Admin', '张敏', '李晨', '王磊', '系统管理员'];
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
    const mkItem = (product, values = {}) => ({ ...clone(product), lingxingSku: `LX-${product.sku}`, fnsku: '', platform: '', store: '', country: '', supplier: '', team: '', operator: '', cartonSpec: null, supplierSku: `SUP-${product.sku}`, purchaseQty: product.stockQty, unitPrice: 0, amount: 0, warehouse: '东莞采购仓', deliveryDate: '2026-08-30', purchaseNo: '', shipmentNo: '', remark: '', ...values });
    const documents = ref([
      { id: 1, docNo: 'CGJH20260805-001', stockPlanNo: 'BHJH20260805-001', platform: 'Amazon', store: 'ARCCAP', country: '美国', supplier: 'JASIC 供应商', warehouse: '东莞采购仓', team: '亚马逊团队', status: 'purchasing', creator: 'Admin', createdAt: '2026-08-05 10:30', remark: '旺季前置采购', items: [mkItem(productPool[0], { unitPrice: 609.29, amount: 60929.1, deliveryDate: '2026-08-31', purchaseNo: 'PO2026727000', shipmentNo: 'SH202681000' }), mkItem(productPool[1], { unitPrice: 84.13, amount: 4206.5, deliveryDate: '2026-08-25', purchaseNo: 'PO2026727001' }), mkItem(productPool[12], { unitPrice: 420, amount: 25200, deliveryDate: '2026-09-05', purchaseNo: 'PO2026727002' })] },
      { id: 2, docNo: 'CGJH20260804-002', stockPlanNo: 'BHJH20260804-002', platform: 'Amazon', store: 'Lowes_ar', country: '美国', supplier: 'ARCCAP 供应商', warehouse: '深圳采购仓', team: '亚马逊团队', status: 'pending_purchase', creator: '张敏', createdAt: '2026-08-04 14:20', remark: '', items: [mkItem(productPool[2], { unitPrice: 12, amount: 240, deliveryDate: '2026-08-20', remark: '测试计划，请勿操作' }), mkItem(productPool[13], { unitPrice: 880, amount: 22000, deliveryDate: '2026-09-10' }), mkItem(productPool[14], { unitPrice: 15.5, amount: 3100, warehouse: '供应商直发仓', deliveryDate: '2026-08-28', remark: '常规补货' })] },
      { id: 3, docNo: 'CGJH20260804-003', stockPlanNo: 'BHJH20260804-003', platform: 'eBay', store: 'arccaptain', country: '英国', supplier: '华南五金', warehouse: '洛杉矶海外仓', team: 'eBay团队', status: 'pending_review', creator: '李晨', createdAt: '2026-08-04 09:15', remark: '海外仓安全库存补充', items: [mkItem(productPool[3], { unitPrice: 0, amount: 0, warehouse: '洛杉矶海外仓', deliveryDate: '2026-09-30' }), mkItem(productPool[4], { unitPrice: 33, amount: 3300, warehouse: '洛杉矶海外仓', deliveryDate: '2026-09-30' }), mkItem(productPool[5], { unitPrice: 10, amount: 3000, warehouse: '洛杉矶海外仓', deliveryDate: '2026-09-30' }), mkItem(productPool[15], { unitPrice: 28, amount: 3360, deliveryDate: '2026-09-01' })] },
      { id: 4, docNo: 'CGJH20260804-004', stockPlanNo: '', platform: 'B2C', store: 'Amazon US 旗舰店', country: '德国', supplier: '东莞焊材', warehouse: '休斯敦海外仓', team: 'Jasic团队', status: 'draft', creator: '王磊', createdAt: '2026-08-04 16:45', remark: '新品首批采购', items: [mkItem(productPool[6], { unitPrice: 0, amount: 0, warehouse: '休斯敦海外仓', deliveryDate: '2026-08-06' }), mkItem(productPool[16], { unitPrice: 3.2, amount: 1600, deliveryDate: '2026-08-22', remark: '常规补货' })] },
      { id: 5, docNo: 'CGJH20260805-005', stockPlanNo: 'BHJH20260805-005', platform: 'Amazon', store: 'ARCCAP', country: '日本', supplier: '测试供应商', warehouse: '供应商直发仓', team: '亚马逊团队', status: 'rejected', creator: '系统管理员', createdAt: '2026-08-05 11:20', remark: '驳回原因：价格不合理', items: [mkItem(productPool[7], { unitPrice: 0, amount: 0, warehouse: '供应商直发仓', deliveryDate: '2026-08-06', remark: '测试计划' }), mkItem(productPool[17], { unitPrice: 45, amount: 3600, warehouse: '深圳采购仓', deliveryDate: '2026-09-08' })] },
      { id: 6, docNo: 'CGJH20260804-006', stockPlanNo: 'BHJH20260804-006', platform: 'eBay', store: 'Lowes_ar', country: '美国', supplier: 'JASIC 供应商', warehouse: '东莞采购仓', team: 'eBay团队', status: 'completed', creator: 'Admin', createdAt: '2026-08-04 08:00', remark: '采购已完成', items: [mkItem(productPool[8], { unitPrice: 0, amount: 0, deliveryDate: '2026-08-20', purchaseNo: 'PO2026727005', shipmentNo: 'SH202681001', remark: '常规补货' }), mkItem(productPool[19], { unitPrice: 6.5, amount: 650, warehouse: '供应商直发仓', deliveryDate: '2026-08-30', purchaseNo: 'PO2026727006' })] },
      { id: 7, docNo: 'CGJH20260804-007', stockPlanNo: '', platform: 'B2C', store: '线下订单', country: '中国', supplier: 'ARCCAP 供应商', warehouse: '东莞采购仓', team: 'B端团队', status: 'voided', creator: '张敏', createdAt: '2026-08-04 17:30', remark: '作废原因：重复创建', items: [mkItem(productPool[9], { unitPrice: 30, amount: 15000, warehouse: '深圳采购仓', deliveryDate: '2026-09-15' }), mkItem(productPool[10], { unitPrice: 62, amount: 15500, warehouse: '深圳采购仓', deliveryDate: '2026-09-15' })] },
      { id: 8, docNo: 'CGJH20260806-008', stockPlanNo: 'BHJH20260806-008', platform: 'Amazon', store: 'ARCCAP', country: '美国', supplier: 'JASIC 供应商', warehouse: '东莞采购仓', team: '亚马逊团队', status: 'partial_received', creator: 'Admin', createdAt: '2026-08-06 09:00', remark: '部分到货', items: [mkItem(productPool[12], { unitPrice: 420, amount: 25200, deliveryDate: '2026-09-05', purchaseNo: 'PO2026727025' }), mkItem(productPool[16], { unitPrice: 3.2, amount: 1600, deliveryDate: '2026-08-22', purchaseNo: 'PO2026727026', shipmentNo: 'SH202681007' })] },
    ]);

    const filters = reactive({ keyword: '', queryTick: 0 });
    const activeStatus = ref('all');
    const page = ref(1);
    const pageSize = ref(15);
    const selectedIds = reactive(new Set());
    const selectedDocs = computed(() => documents.value.filter(doc => selectedIds.has(doc.id)));
    const DRAFT_STATUSES = ['draft'];
    const PENDING_REVIEW_STATUSES = ['pending_review'];
    const AUDITABLE_STATUSES = ['draft', 'pending_review'];
    const VOIDABLE_STATUSES = ['draft', 'pending_review'];
    const STATUS_GROUP_MAP = { draft: DRAFT_STATUSES, pending_review: PENDING_REVIEW_STATUSES };
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
        draft: '',
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
        document.querySelector('#planNo').value,
        document.querySelector('#productName').value,
        document.querySelector('#purchaseNo').value,
        document.querySelector('#shipmentNo').value,
        document.querySelector('#remark').value
      ].filter(Boolean).join(' ');
      filters.queryTick += 1;
    };
    const legacy = reactive({ codes: [], warehouses: [], suppliers: [], platforms: [], countries: [], stores: [], teams: [], creators: [] });
    const values = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => input.value);
    const initLegacyQuery = () => {
      const configs = [
        ['#warehouseMulti', warehouses, 'warehouses', '请选择采购仓'],
        ['#supplierMulti', suppliers, 'suppliers', '请选择供应商'],
        ['#platformMulti', platforms, 'platforms', '请选择平台'],
        ['#countryMulti', countries, 'countries', '请选择国家'],
        ['#storeMulti', stores, 'stores', '请选择店铺'],
        ['#teamMulti', teams, 'teams', '请选择团队'],
        ['#creatorMulti', creators, 'creators', '请选择创建人']
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
      document.querySelector('#searchBtn').addEventListener('click', () => { if (document.querySelector('#codeInput').value.trim()) { addCodes(document.querySelector('#codeInput').value); document.querySelector('#codeInput').value = ''; } readLegacyQuery(); page.value = 1; expandedIds.clear(); ElementPlus.ElMessage.success(`查询完成，共 ${filteredDocs.value.length} 张采购计划`); });
      document.querySelector('#resetBtn').addEventListener('click', () => { legacy.codes = []; ['#planNo', '#productName', '#purchaseNo', '#shipmentNo', '#remark', '#startDate', '#endDate'].forEach(id => document.querySelector(id).value = ''); document.querySelector('#codeType').value = 'SKU'; document.querySelector('#timeType').value = '创建时间'; document.querySelectorAll('.dropdown input').forEach(input => input.checked = false); configs.forEach(([id, , key, placeholder]) => { legacy[key] = []; const trigger = document.querySelector(`${id} [data-trigger]`); trigger.textContent = placeholder; trigger.classList.remove('has-value'); }); renderCodeTags(); readLegacyQuery(); activeStatus.value = 'all'; page.value = 1; expandedIds.clear(); ElementPlus.ElMessage.success('已重置查询条件'); });
      const expand = document.querySelector('#queryExpand'); expand.addEventListener('click', () => { const expanded = document.querySelector('.query-panel').classList.toggle('expanded'); expand.querySelector('.query-arrow').textContent = expanded ? '⌃' : '⌄'; expand.querySelector('.query-expand-text').textContent = expanded ? '收起' : '展开'; expand.setAttribute('aria-expanded', String(expanded)); });
      readLegacyQuery();
    };
    const split = value => value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean);
    const filteredDocs = computed(() => {
      filters.queryTick;
      const codeType = document.querySelector('#codeType').value; const codeMap = { SKU: 'sku', '供应商料号': 'sku', '领星 SKU': 'sku', SellerSKU: 'sku', FNSKU: 'sku', ASIN: 'sku' };
      const codes = legacy.codes.map(value => value.toLowerCase()); const plans = split(document.querySelector('#planNo').value); const names = document.querySelector('#productName').value.trim().toLowerCase(); const purchaseNos = split(document.querySelector('#purchaseNo').value); const shipmentNos = split(document.querySelector('#shipmentNo').value); const remark = document.querySelector('#remark').value.trim().toLowerCase();
      return documents.value.filter(doc => {
        if (activeStatus.value !== 'all') {
          const group = STATUS_GROUP_MAP[activeStatus.value];
          if (group) {
            if (!group.includes(doc.status)) return false;
          } else if (doc.status !== activeStatus.value) return false;
        }
        if (codes.length && !doc.items.some(item => codes.some(code => String(item[codeMap[codeType]] || '').toLowerCase().includes(code)))) return false;
        if (plans.length && !plans.some(value => doc.docNo.toLowerCase().includes(value))) return false;
        if (names && !doc.items.some(item => item.productName.toLowerCase().includes(names))) return false;
        if (purchaseNos.length && !purchaseNos.some(value => doc.items.some(c => c.purchaseNo && c.purchaseNo.toLowerCase().includes(value)))) return false;
        if (shipmentNos.length && !shipmentNos.some(value => doc.items.some(c => c.shipmentNo && c.shipmentNo.toLowerCase().includes(value)))) return false;
        if (remark && !(doc.remark || '').toLowerCase().includes(remark)) return false;
        if (legacy.warehouses.length && !legacy.warehouses.includes(doc.warehouse)) return false;
        if (legacy.suppliers.length && !legacy.suppliers.includes(doc.supplier)) return false;
        if (legacy.platforms.length && !legacy.platforms.includes(doc.platform)) return false;
        if (legacy.countries.length && !legacy.countries.includes(doc.country)) return false;
        if (legacy.stores.length && !legacy.stores.includes(doc.store)) return false;
        if (legacy.teams.length && !legacy.teams.includes(doc.team)) return false;
        if (legacy.creators.length && !legacy.creators.includes(doc.creator)) return false;
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
    const itemCartons = item => item.cartonSpec > 0 ? Math.ceil(Number(item.purchaseQty || 0) / Number(item.cartonSpec)) : '—';
    const purchasePlanSummary = ({ columns, data }) => columns.map((column, index) => {
      if (index === 0) return '合计';
      if (column.label === '箱数') return data.reduce((sum, item) => sum + (item.cartonSpec > 0 ? Math.ceil(Number(item.purchaseQty || 0) / Number(item.cartonSpec)) : 0), 0);
      if (column.label === '备货数量') return data.reduce((sum, item) => sum + Number(item.stockQty || 0), 0);
      return '';
    });
    const planTotalQty = plan => plan.items.reduce((sum, item) => sum + Number(item.purchaseQty || 0), 0);
    const planTotalAmount = plan => plan.items.reduce((sum, item) => sum + itemAmount(item), 0);
    const nowText = () => { const now = new Date(); const pad = value => String(value).padStart(2, '0'); return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`; };
    const documentDialogVisible = ref(false); const documentDialogMode = ref('create'); const documentDialogTitle = computed(() => documentDialogMode.value === 'create' ? '新建采购计划' : documentDialogMode.value === 'edit' ? '编辑采购计划' : '查看采购计划'); const blankForm = () => ({ id: null, docNo: '', stockPlanNo: '', platform: '', store: '', country: '', supplier: '', warehouse: '', team: '', status: 'draft', creator: 'Admin', createdAt: '', remark: '', items: [] }); const form = reactive(blankForm());
    const normalizeItem = (item, doc) => ({ ...mkItem(item, { purchaseQty: item.purchaseQty ?? item.stockQty, unitPrice: item.unitPrice ?? 0, deliveryDate: item.deliveryDate || '' }), platform: item.platform || doc.platform || '', store: item.store || doc.store || '', country: item.country || doc.country || '', supplier: item.supplier || doc.supplier || '', warehouse: item.warehouse || doc.warehouse || '', team: item.team || doc.team || '', operator: item.operator || doc.creator || '' });
    const assignForm = doc => { const source = clone(doc); source.items = (source.items || []).map(item => normalizeItem(item, source)); Object.assign(form, blankForm(), source); };
    const openCreate = () => { documentDialogMode.value = 'create'; assignForm(blankForm()); documentDialogVisible.value = true; };
    const openEdit = doc => { documentDialogMode.value = 'edit'; assignForm(doc); documentDialogVisible.value = true; };
    const openView = doc => { documentDialogMode.value = 'view'; assignForm(doc); documentDialogVisible.value = true; };
    const skuDialogVisible = ref(false); const skuBatchInput = ref(''); const skuQueryResults = ref([]); const unmatchedSkuCodes = ref([]); const selectedProducts = ref([]); const skuFillInput = ref('153US0000017\n153US0000024\n153US0000031'); const skuFillUnmatched = ref([]); const availableProducts = computed(() => productPool.filter(product => !form.items.some(item => item.sku === product.sku))); const fillSkuItems = () => { const codes = [...new Set(skuFillInput.value.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean))]; if (!codes.length) return ElementPlus.ElMessage.warning('请先输入至少一个 SKU'); const map = new Map(productPool.map(product => [product.sku.toUpperCase(), product])); const existing = new Set(form.items.map(item => item.sku.toUpperCase())); const matched = []; const unmatched = []; codes.forEach(code => { const product = map.get(code.toUpperCase()); if (!product || existing.has(code.toUpperCase())) unmatched.push(code); else { matched.push(product); existing.add(code.toUpperCase()); } }); matched.forEach(product => form.items.push(mkItem(product))); skuFillUnmatched.value = unmatched; if (matched.length) ElementPlus.ElMessage.success(`已填充 ${matched.length} 个 SKU 明细`); else ElementPlus.ElMessage.warning('没有可新增的 SKU'); }; const clearSkuQuery = () => { skuBatchInput.value = ''; skuQueryResults.value = []; unmatchedSkuCodes.value = []; selectedProducts.value = []; }; const openSkuDialog = () => { clearSkuQuery(); skuDialogVisible.value = true; }; const querySkus = () => { const codes = [...new Set(skuBatchInput.value.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean))]; if (!codes.length) return ElementPlus.ElMessage.warning('请先输入至少一个 SKU'); const map = new Map(availableProducts.value.map(product => [product.sku.toUpperCase(), product])); skuQueryResults.value = codes.map(code => map.get(code.toUpperCase())).filter(Boolean); unmatchedSkuCodes.value = codes.filter(code => !map.has(code.toUpperCase())); selectedProducts.value = []; ElementPlus.ElMessage[skuQueryResults.value.length ? 'success' : 'warning'](skuQueryResults.value.length ? `匹配到 ${skuQueryResults.value.length} 个可加入的 SKU` : '没有匹配到可加入的 SKU'); }; const addSelectedSkus = () => { if (!selectedProducts.value.length) return ElementPlus.ElMessage.warning('请至少选择一个 SKU'); selectedProducts.value.forEach(product => form.items.push(mkItem(product))); skuDialogVisible.value = false; clearSkuQuery(); }; const removeSku = index => form.items.splice(index, 1); const fillEmptyItemFields = () => { const source = form.items[0]; if (!source) return ElementPlus.ElMessage.warning('请先添加 SKU'); const fields = ['deliveryDate', 'team', 'platform', 'store', 'country', 'warehouse', 'supplier', 'operator', 'cartonSpec']; form.items.slice(1).forEach(item => fields.forEach(field => { if (!item[field] && source[field]) item[field] = source[field]; })); ElementPlus.ElMessage.success('已将首行的已填信息补充到其他明细'); };
    const resetSkuPicker = () => { skuBatchInput.value = ''; unmatchedSkuCodes.value = []; selectedProducts.value = []; skuQueryResults.value = [...availableProducts.value]; };
    const openSkuPicker = () => { resetSkuPicker(); skuDialogVisible.value = true; };
    const querySkuPicker = () => { const keyword = skuBatchInput.value.trim().toLowerCase(); const terms = keyword.split(/[\s,，;；]+/).filter(Boolean); skuQueryResults.value = !terms.length ? [...availableProducts.value] : availableProducts.value.filter(product => terms.some(term => product.sku.toLowerCase().includes(term) || product.productName.toLowerCase().includes(term))); unmatchedSkuCodes.value = terms.filter(term => !availableProducts.value.some(product => product.sku.toLowerCase().includes(term) || product.productName.toLowerCase().includes(term))); selectedProducts.value = []; };
    const saveDocument = async () => {
      if (!form.items.length) return ElementPlus.ElMessage.warning('请至少添加一个 SKU 明细');
      if (!form.team) return ElementPlus.ElMessage.warning('请选择采购计划所属团队');
      const invalid = form.items.find(item => !item.deliveryDate || !Number(item.purchaseQty));
      if (invalid) return ElementPlus.ElMessage.warning(`SKU ${invalid.sku} 请填写计划交货日期和计划采购数量`);
      form.items.forEach(item => { item.team = form.team; item.amount = itemAmount(item); });
      const payload = clone(form); payload.updatedAt = nowText();
      const primaryItem = payload.items[0];
      Object.assign(payload, { platform: primaryItem.platform, store: primaryItem.store, country: primaryItem.country, supplier: primaryItem.supplier, warehouse: primaryItem.warehouse, team: primaryItem.team });
      if (documentDialogMode.value === 'create') {
        payload.id = Math.max(...documents.value.map(doc => doc.id), 0) + 1;
        payload.docNo = `CGJH20260809-${String(payload.id).padStart(3, '0')}`;
        payload.createdAt = payload.updatedAt = nowText();
        documents.value.unshift(payload);
      } else {
        const index = documents.value.findIndex(doc => doc.id === payload.id);
        if (index >= 0) documents.value[index] = payload;
      }
      documentDialogVisible.value = false;
      ElementPlus.ElMessage.success(documentDialogMode.value === 'create' ? '采购计划创建成功，进入草稿' : '采购计划修改成功');
    };
    const changeStatus = (doc, status, message) => { doc.status = status; doc.updatedAt = nowText(); ElementPlus.ElMessage.success(message); };
    const auditDialogVisible = ref(false); const auditDialogTitle = ref(''); const auditFormRef = ref(); const auditForm = reactive({ comment: '' }); const auditTargets = ref([]); const auditMode = ref('single');
    const auditRules = { comment: [{ validator: (rule, value, callback) => { if (auditMode.value === 'reject_required' && !value.trim()) callback(new Error('驳回时审核意见为必填')); else callback(); }, trigger: 'blur' }] };
    const openAudit = doc => { auditMode.value = 'single'; auditTargets.value = [doc]; auditForm.comment = ''; auditDialogTitle.value = '审核采购计划 — ' + doc.docNo; auditDialogVisible.value = true; };
    const openBatchAudit = () => { const targets = selectedDocs.value.filter(doc => AUDITABLE_STATUSES.includes(doc.status)); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可审核的采购计划'); auditMode.value = 'batch'; auditTargets.value = [...targets]; auditForm.comment = ''; auditDialogTitle.value = '批量审核（' + targets.length + ' 张单据）'; auditDialogVisible.value = true; };
    const submitAudit = doc => ElementPlus.ElMessageBox.confirm('确认提交采购计划 ' + doc.docNo + ' 进入审核？', '提交审核', { type: 'warning' }).then(() => { changeStatus(doc, 'pending_review', '采购计划已提交审核'); }).catch(() => {});
    const submitAuditAction = action => {
      const isReject = action === 'reject';
      if (isReject) { auditMode.value = 'reject_required'; if (!auditForm.comment.trim()) return ElementPlus.ElMessage.warning('驳回时请填写审核意见'); }
      auditMode.value = 'single';
      auditTargets.value.forEach(doc => {
        const comment = auditForm.comment.trim();
        if (comment) doc.remark = (doc.remark ? doc.remark + '；' : '') + (isReject ? '驳回：' : '审核通过：') + comment;
        if (isReject) { changeStatus(doc, 'rejected', '采购计划已驳回'); }
        else { doc.status = doc.status === 'draft' ? 'pending_review' : 'pending_purchase'; doc.updatedAt = nowText(); ElementPlus.ElMessage.success('审核完成'); }
      });
      auditDialogVisible.value = false;
    };
    const generatePO = doc => ElementPlus.ElMessageBox.confirm('确认为采购计划 ' + doc.docNo + ' 生成采购单？', '生成采购单', { type: 'warning' }).then(() => { const prefix = 'PO' + new Date().toISOString().slice(2, 10).replace(/-/g, ''); doc.items.forEach((c, i) => { if (!c.purchaseNo) c.purchaseNo = prefix + String(1000 + i).padStart(4, '0'); }); changeStatus(doc, 'purchasing', '采购单已生成，单据流转至采购中'); }).catch(() => {});
    const viewPO = doc => ElementPlus.ElMessage.info('查看采购单功能开发中');
    const voidDocument = doc => { if (!VOIDABLE_STATUSES.includes(doc.status)) return ElementPlus.ElMessage.warning('当前状态不可作废，仅草稿和待审核可作废'); ElementPlus.ElMessageBox.prompt('作废后将停止当前采购流程，请输入作废原因：', '二次确认：作废采购计划', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { doc.remark = '作废原因：' + value; changeStatus(doc, 'voided', '采购计划已作废'); }).catch(() => {}); };
    const batchGeneratePO = () => { const targets = selectedDocs.value.filter(doc => doc.status === 'pending_purchase'); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有待生成采购单的采购计划'); ElementPlus.ElMessageBox.confirm('确认为选中的 ' + targets.length + ' 张采购计划生成采购单？', '批量生成采购单', { type: 'warning' }).then(() => { const prefix = 'PO' + new Date().toISOString().slice(2, 10).replace(/-/g, ''); let counter = 2000; targets.forEach(doc => { doc.items.forEach(c => { if (!c.purchaseNo) c.purchaseNo = prefix + String(counter++).padStart(4, '0'); }); changeStatus(doc, 'purchasing', '采购单已生成'); }); }).catch(() => {}); };
    const batchVoid = () => { const targets = selectedDocs.value.filter(doc => VOIDABLE_STATUSES.includes(doc.status)); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可作废的采购计划（仅草稿和待审核可作废）'); ElementPlus.ElMessageBox.prompt('作废后将停止选中采购计划的流程，请输入作废原因：', '批量作废', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { targets.forEach(doc => { doc.remark = '作废原因：' + value; doc.status = 'voided'; doc.updatedAt = nowText(); }); ElementPlus.ElMessage.success('已作废 ' + targets.length + ' 张采购计划'); }).catch(() => {}); };
    const showExport = () => ElementPlus.ElMessage.success('已按当前筛选条件生成采购计划导出任务');
    const expandedIds = reactive(new Set());
    const isExpanded = id => expandedIds.has(id);
    const toggleExpand = id => { expandedIds.has(id) ? expandedIds.delete(id) : expandedIds.add(id); };
    const expandAllChecked = computed(() => pagedDocs.value.length > 0 && pagedDocs.value.every(doc => expandedIds.has(doc.id)));
    const toggleExpandAll = () => { const next = !expandAllChecked.value; pagedDocs.value.forEach(doc => { if (next) expandedIds.add(doc.id); else expandedIds.delete(doc.id); }); };
    const isSelected = id => selectedIds.has(id);
    const toggleSelect = (id, event) => { event.target.checked ? selectedIds.add(id) : selectedIds.delete(id); };
    const allSelected = computed(() => pagedDocs.value.length > 0 && pagedDocs.value.every(doc => selectedIds.has(doc.id)));
    const toggleSelectAll = event => { pagedDocs.value.forEach(doc => { if (event.target.checked) selectedIds.add(doc.id); else selectedIds.delete(doc.id); }); };
    const selectStatus = name => { activeStatus.value = name; page.value = 1; };
    const rowActions = doc => {
      const list = [{ action: 'view', label: '查看' }];
      if (DRAFT_STATUSES.includes(doc.status)) list.push({ action: 'edit', label: '编辑' }, { action: 'submit', label: '提交审核' }, { action: 'void', label: '作废', danger: true });
      else if (PENDING_REVIEW_STATUSES.includes(doc.status)) list.push({ action: 'audit', label: '审核' }, { action: 'void', label: '作废', danger: true });
      else if (doc.status === 'pending_purchase') list.push({ action: 'generate', label: '生成采购单' });
      else if (doc.status === 'purchasing' || doc.status === 'partial_received') list.push({ action: 'viewPO', label: '查看采购单' });
      return list;
    };
    const handleRowAction = (doc, action) => {
      if (action === 'view') openView(doc);
      else if (action === 'edit') openEdit(doc);
      else if (action === 'submit') submitAudit(doc);
      else if (action === 'void') voidDocument(doc);
      else if (action === 'audit') openAudit(doc);
      else if (action === 'generate') generatePO(doc);
      else if (action === 'viewPO') viewPO(doc);
    };
    const showPlanList = () => ElementPlus.ElMessage.info('采购计划管理清单功能开发中');
    initLegacyQuery();
    const formTotalQty = computed(() => planTotalQty(form)); const formTotalAmount = computed(() => planTotalAmount(form));
    return { platforms, stores, countries, suppliers, warehouses, teams, creators, documents, activeStatus, statusTabs, page, pageSize, selectedDocs, filteredDocs, pagedDocs, statusMeta, confirmerLabel, DRAFT_STATUSES, PENDING_REVIEW_STATUSES, statusCount, planTotalQty, planTotalAmount, itemAmount, itemCartons, purchasePlanSummary, formTotalQty, formTotalAmount, documentDialogVisible, documentDialogMode, documentDialogTitle, form, openCreate, openEdit, openView, saveDocument, skuDialogVisible, skuBatchInput, skuQueryResults, unmatchedSkuCodes, selectedProducts, skuFillInput, skuFillUnmatched, fillSkuItems, openSkuDialog, openSkuPicker, querySkus, querySkuPicker, clearSkuQuery, resetSkuPicker, addSelectedSkus, removeSku, fillEmptyItemFields, auditDialogVisible, auditDialogTitle, auditFormRef, auditForm, auditRules, auditTargets, openAudit, openBatchAudit, submitAudit, submitAuditAction, generatePO, viewPO, voidDocument, batchGeneratePO, batchVoid, showExport, selectStatus, allSelected, toggleSelectAll, isSelected, toggleSelect, isExpanded, toggleExpand, toggleExpandAll, expandAllChecked, rowActions, handleRowAction, showPlanList, currentPage, totalPages, pageList, goPage, changePageSize };
  }
}).use(ElementPlus).mount(root);
