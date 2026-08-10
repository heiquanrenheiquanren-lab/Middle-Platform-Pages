const { createApp, ref, reactive, computed } = Vue;

const root = document.querySelector('#purchaseBusinessApp');
root.innerHTML = `
  <section class="action-strip"><div class="head-actions"><el-button type="primary" @click="openCreate">新建采购计划</el-button><el-button type="primary" plain>采购计划管理清单</el-button><el-button :disabled="selectedDocs.length === 0" @click="batchGeneratePO">生成采购单</el-button><el-button :disabled="selectedDocs.length === 0" @click="openBatchAudit">批量审核</el-button><el-button :disabled="selectedDocs.length === 0" @click="batchVoid">批量作废</el-button><el-button @click="showExport">导出</el-button></div></section>
  <section class="status-bar"><div class="status-tabs"><button v-for="tab in statusTabs" :key="tab.name" class="status-tab" :class="{active: activeStatus === tab.name}" @click="activeStatus = tab.name; page = 1">{{ tab.label }}（{{ statusCount(tab.name) }}）</button></div><div class="status-tools"><span class="tool" title="刷新" @click="refresh">↻</span><span class="tool" title="设置">⚙</span></div></section>
  <section class="stock-business-table">
    <el-table v-if="pagedDocs.length" :data="pagedDocs" row-key="id" border class="document-table" @selection-change="selectedDocs = $event">
      <el-table-column type="selection" width="42"></el-table-column>
      <el-table-column type="expand" width="42"><template #default="scope"><div class="detail-box"><div class="detail-head"><div class="detail-title">SKU 采购明细</div><div class="detail-summary"><span>SKU 数：{{ scope.row.items.length }}</span><span>采购总数量：{{ planTotalQty(scope.row).toLocaleString() }}</span><span>采购总金额：¥ {{ planTotalAmount(scope.row).toLocaleString() }}</span></div></div><el-table :data="scope.row.items" size="small" border><el-table-column prop="sku" label="SKU" width="160" fixed="left"></el-table-column><el-table-column prop="productName" label="品名" min-width="180" show-overflow-tooltip></el-table-column><el-table-column prop="stockQty" label="备货数量" width="90" align="right"></el-table-column><el-table-column prop="purchaseQty" label="采购数量" width="100" align="right"></el-table-column><el-table-column prop="unitPrice" label="采购单价" width="100" align="right"><template #default="itemScope">¥ {{ Number(itemScope.row.unitPrice || 0).toFixed(2) }}</template></el-table-column><el-table-column label="采购金额" width="110" align="right"><template #default="itemScope" class="amount-cell">¥ {{ Number(itemScope.row.amount || 0).toLocaleString() }}</template></el-table-column><el-table-column prop="warehouse" label="采购仓" width="120"></el-table-column><el-table-column prop="deliveryDate" label="期望交货日期" width="130"></el-table-column><el-table-column prop="purchaseNo" label="关联采购单号" min-width="140"><template #default="itemScope"><span v-if="itemScope.row.purchaseNo" class="relation-value">{{ itemScope.row.purchaseNo }}</span><span v-else class="relation-empty">未生成</span></template></el-table-column><el-table-column prop="shipmentNo" label="关联发货单号" min-width="140"><template #default="itemScope"><span v-if="itemScope.row.shipmentNo" class="relation-value">{{ itemScope.row.shipmentNo }}</span><span v-else class="relation-empty">—</span></template></el-table-column><el-table-column prop="remark" label="明细备注" min-width="150" show-overflow-tooltip></el-table-column></el-table></div></template></el-table-column>
      <el-table-column label="采购计划" min-width="200"><template #default="scope"><div class="document-no" @click="openView(scope.row)">{{ scope.row.docNo }}</div><div class="cell-secondary">{{ scope.row.createdAt }}</div><div class="document-tag-row"><el-tag size="small" :type="statusMeta(scope.row.status).type" effect="light">{{ statusMeta(scope.row.status).label }}</el-tag><span v-if="confirmerLabel(scope.row)" class="confirmer-label">{{ confirmerLabel(scope.row) }}</span></div></template></el-table-column>
      <el-table-column label="来源备货计划" min-width="175"><template #default="scope"><div class="relation-label">来源备货计划号</div><div v-if="scope.row.stockPlanNo" class="relation-value" @click="openRelatedStock(scope.row.stockPlanNo)">{{ scope.row.stockPlanNo }}</div><div v-else class="relation-empty">手工新建，无来源备货单</div></div></template></el-table-column>
      <el-table-column label="业务信息" min-width="200"><template #default="scope"><div class="business-cell"><div class="platform-supplier">{{ scope.row.platform }} · {{ scope.row.supplier }}</div><div class="business-meta">{{ scope.row.country }}站 · {{ scope.row.store }} · {{ scope.row.warehouse }}</div><div class="business-owner">团队：{{ scope.row.team }} · 创建人：{{ scope.row.creator }}</div></div></template></el-table-column>
      <el-table-column label="SKU数" width="60" align="center"><template #default="scope">{{ scope.row.items.length }}</template></el-table-column>
      <el-table-column label="采购合计" min-width="160" align="right"><template #default="scope"><div class="cell-primary">共 {{ planTotalQty(scope.row).toLocaleString() }} 件</div><div class="cell-secondary amount-cell">¥ {{ planTotalAmount(scope.row).toLocaleString() }}</div></template></el-table-column>
      <el-table-column label="操作" min-width="180"><template #default="scope"><div class="operation-links"><el-button link type="primary" @click="openView(scope.row)">查看</el-button><template v-if="DRAFT_STATUSES.includes(scope.row.status)"><el-button link type="primary" @click="openEdit(scope.row)">编辑</el-button><el-button link type="success" @click="submitAudit(scope.row)">提交审核</el-button><el-button link type="danger" @click="voidDocument(scope.row)">作废</el-button></template><template v-else-if="PENDING_REVIEW_STATUSES.includes(scope.row.status)"><el-button link type="success" @click="openAudit(scope.row)">审核</el-button><el-button link type="danger" @click="voidDocument(scope.row)">作废</el-button></template><template v-else-if="scope.row.status === 'pending_purchase'"><el-button link type="primary" @click="generatePO(scope.row)">生成采购单</el-button></template><template v-else-if="scope.row.status === 'purchasing' || scope.row.status === 'partial_received'"><el-button link type="primary" @click="viewPO(scope.row)">查看采购单</el-button></template></div></template></el-table-column>
    </el-table>
    <el-empty v-else description="未找到符合条件的采购计划"></el-empty>
    <div class="pagination-bar"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10,15,30]" :total="filteredDocs.length" layout="total, sizes, prev, pager, next, jumper"></el-pagination></div>
  </section>
  <el-dialog v-model="documentDialogVisible" :title="documentDialogTitle" width="90%" top="5vh" class="forecast-dialog" :class="{ 'is-view-mode': documentDialogMode === 'view' }" :close-on-click-modal="false" destroy-on-close>
    <div class="document-dialog-body"><div class="section-title">单据公共信息</div><el-form ref="docFormRef" :model="form" :rules="rules" label-position="left" label-width="100px" class="compact-document-form" :disabled="documentDialogMode === 'view'"><div class="form-grid"><el-form-item label="采购计划号"><el-input v-model="form.docNo" disabled></el-input></el-form-item><el-form-item label="来源备货计划"><el-input :model-value="form.stockPlanNo || '手工新建'" disabled></el-input></el-form-item><el-form-item label="平台" prop="platform"><el-select v-model="form.platform" style="width:100%"><el-option v-for="item in platforms" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="店铺" prop="store"><el-select v-model="form.store" style="width:100%"><el-option v-for="item in stores" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="国家" prop="country"><el-select v-model="form.country" style="width:100%"><el-option v-for="item in countries" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="供应商" prop="supplier"><el-select v-model="form.supplier" style="width:100%"><el-option v-for="item in suppliers" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="采购仓" prop="warehouse"><el-select v-model="form.warehouse" style="width:100%"><el-option v-for="item in warehouses" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="团队" prop="team"><el-select v-model="form.team" style="width:100%"><el-option v-for="item in teams" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="创建人"><el-input v-model="form.creator" disabled></el-input></el-form-item><el-form-item label="创建时间"><el-input :model-value="form.createdAt || '保存后自动生成'" disabled></el-input></el-form-item><el-form-item label="计划备注"><el-input v-model="form.remark" maxlength="200" show-word-limit></el-input></el-form-item></div></el-form><el-divider></el-divider><div class="section-title">SKU 采购明细</div><div class="sku-toolbar"><div class="sku-toolbar-note">同一采购计划下的 SKU 共享上述平台、店铺、国家、供应商和采购仓。</div><el-button v-if="documentDialogMode !== 'view'" type="primary" plain @click="openSkuDialog">新增 SKU</el-button></div><el-table v-if="form.items.length" :data="form.items" border><el-table-column prop="sku" label="SKU" width="150"></el-table-column><el-table-column prop="productName" label="品名" min-width="180"></el-table-column><el-table-column prop="stockQty" label="备货数量" width="100" align="center"></el-table-column><el-table-column label="采购数量" width="120" align="center"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ Number(scope.row.purchaseQty || 0).toLocaleString() }}</span><el-input-number v-else v-model="scope.row.purchaseQty" :min="0" :max="999999" :controls="false" style="width:100px"></el-input-number></template></el-table-column><el-table-column label="采购单价" width="120" align="center"><template #default="scope"><span v-if="documentDialogMode === 'view'">¥ {{ Number(scope.row.unitPrice || 0).toFixed(2) }}</span><el-input-number v-else v-model="scope.row.unitPrice" :min="0" :precision="2" :controls="false" style="width:100px"></el-input-number></template></el-table-column><el-table-column label="期望交货日期" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.deliveryDate }}</span><el-date-picker v-else v-model="scope.row.deliveryDate" type="date" value-format="YYYY-MM-DD" style="width:132px"></el-date-picker></template></el-table-column><el-table-column label="明细备注" min-width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.remark || '—' }}</span><el-input v-else v-model="scope.row.remark"></el-input></template></el-table-column><el-table-column v-if="documentDialogMode !== 'view'" label="操作" width="78"><template #default="scope"><el-button link type="danger" @click="removeSku(scope.$index)">移除</el-button></template></el-table-column></el-table><el-empty v-else description="尚未添加 SKU，请点击“新增 SKU”"></el-empty></div><template #footer><el-button @click="documentDialogVisible = false">{{ documentDialogMode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="documentDialogMode !== 'view'" type="primary" @click="saveDocument">{{ documentDialogMode === 'create' ? '保存采购计划' : '保存修改' }}</el-button></template>
  </el-dialog>
  <el-dialog v-model="skuDialogVisible" title="批量选择 SKU" width="820px" :close-on-click-modal="false" append-to-body><el-alert title="支持粘贴多个 SKU，使用换行、逗号、空格或分号分隔；采购数量和单价可在保存前调整。" type="info" show-icon :closable="false"></el-alert><div class="sku-batch-query"><el-input v-model="skuBatchInput" type="textarea" :rows="3" resize="none" placeholder="请输入或粘贴多个 SKU"></el-input><div class="sku-query-actions"><el-button @click="clearSkuQuery">清空</el-button><el-button type="primary" @click="querySkus">批量查询</el-button></div></div><el-alert v-if="unmatchedSkuCodes.length" :title="\`以下 SKU 未匹配或已加入明细：\${unmatchedSkuCodes.join('、')}\`" type="warning" show-icon :closable="false"></el-alert><div class="sku-result-head"><div class="sku-result-title">查询结果（{{ skuQueryResults.length }}）</div></div><el-table v-if="skuQueryResults.length" :data="skuQueryResults" border @selection-change="selectedProducts = $event"><el-table-column type="selection" width="48"></el-table-column><el-table-column prop="sku" label="SKU" width="150"></el-table-column><el-table-column prop="productName" label="品名" min-width="200"></el-table-column><el-table-column prop="stockQty" label="备货数量" width="100" align="right"></el-table-column></el-table><el-empty v-else description="请输入 SKU 后点击\"批量查询\""></el-empty><template #footer><el-button @click="skuDialogVisible = false">取消</el-button><el-button type="primary" @click="addSelectedSkus">加入明细（{{ selectedProducts.length }}）</el-button></template></el-dialog>
  <el-dialog v-model="auditDialogVisible" :title="auditDialogTitle" width="520px" :close-on-click-modal="false"><el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-position="top"><div v-if="auditTargets.length" class="audit-targets"><div class="audit-target-label">审核单据：</div><div v-for="doc in auditTargets" :key="doc.id" class="audit-target-item">{{ doc.docNo }}（{{ confirmerLabel(doc) }}）</div></div><el-form-item label="审核意见" prop="comment"><el-input v-model="auditForm.comment" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="审核通过可留空，驳回时请填写原因"></el-input></el-form-item></el-form><template #footer><el-button @click="auditDialogVisible = false">取消</el-button><el-button type="danger" @click="submitAuditAction('reject')">驳回</el-button><el-button type="primary" @click="submitAuditAction('approve')">通过</el-button></template></el-dialog>
`;

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
    const mkItem = (product, values = {}) => ({ ...clone(product), purchaseQty: product.stockQty, unitPrice: 0, amount: 0, warehouse: '东莞采购仓', deliveryDate: '2026-08-30', purchaseNo: '', shipmentNo: '', remark: '', ...values });
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
    const selectedDocs = ref([]);
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
        ['#warehouseMulti', warehouses, 'warehouses', '采购仓（可多选）'],
        ['#supplierMulti', suppliers, 'suppliers', '供应商（可多选）'],
        ['#platformMulti', platforms, 'platforms', '平台（可多选）'],
        ['#countryMulti', countries, 'countries', '国家（可多选）'],
        ['#storeMulti', stores, 'stores', '店铺（可多选）'],
        ['#teamMulti', teams, 'teams', '团队（可多选）'],
        ['#creatorMulti', creators, 'creators', '创建人（可多选）']
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
      document.querySelector('#searchBtn').addEventListener('click', () => { if (document.querySelector('#codeInput').value.trim()) { addCodes(document.querySelector('#codeInput').value); document.querySelector('#codeInput').value = ''; } readLegacyQuery(); page.value = 1; ElementPlus.ElMessage.success(`查询完成，共 ${filteredDocs.value.length} 张采购计划`); });
      document.querySelector('#resetBtn').addEventListener('click', () => { legacy.codes = []; ['#planNo', '#productName', '#purchaseNo', '#shipmentNo', '#remark', '#startDate', '#endDate'].forEach(id => document.querySelector(id).value = ''); document.querySelector('#codeType').value = 'SKU'; document.querySelector('#timeType').value = '创建时间'; document.querySelectorAll('.dropdown input').forEach(input => input.checked = false); configs.forEach(([id, , key, placeholder]) => { legacy[key] = []; const trigger = document.querySelector(`${id} [data-trigger]`); trigger.textContent = placeholder; trigger.classList.remove('has-value'); }); renderCodeTags(); readLegacyQuery(); activeStatus.value = 'all'; page.value = 1; ElementPlus.ElMessage.success('已重置查询条件'); });
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
    const pagedDocs = computed(() => filteredDocs.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
    const statusCount = status => {
      if (status === 'all') return documents.value.length;
      const group = STATUS_GROUP_MAP[status];
      if (group) return documents.value.filter(doc => group.includes(doc.status)).length;
      return documents.value.filter(doc => doc.status === status).length;
    };
    const planTotalQty = plan => plan.items.reduce((sum, item) => sum + Number(item.purchaseQty || 0), 0);
    const planTotalAmount = plan => plan.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const nowText = () => { const now = new Date(); const pad = value => String(value).padStart(2, '0'); return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`; };
    const documentDialogVisible = ref(false); const documentDialogMode = ref('create'); const documentDialogTitle = computed(() => documentDialogMode.value === 'create' ? '新建采购计划' : documentDialogMode.value === 'edit' ? '编辑采购计划' : '查看采购计划'); const docFormRef = ref(); const blankForm = () => ({ id: null, docNo: '', stockPlanNo: '', platform: '', store: '', country: '', supplier: '', warehouse: '', team: '', status: 'draft', creator: 'Admin', createdAt: '', remark: '', items: [] }); const form = reactive(blankForm());
    const rules = { platform: [{ required: true, message: '请选择平台', trigger: 'change' }], store: [{ required: true, message: '请选择店铺', trigger: 'change' }], country: [{ required: true, message: '请选择国家', trigger: 'change' }], supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }], warehouse: [{ required: true, message: '请选择采购仓', trigger: 'change' }], team: [{ required: true, message: '请选择团队', trigger: 'change' }] };
    const assignForm = doc => Object.assign(form, blankForm(), clone(doc));
    const openCreate = () => { documentDialogMode.value = 'create'; assignForm(blankForm()); documentDialogVisible.value = true; };
    const openEdit = doc => { documentDialogMode.value = 'edit'; assignForm(doc); documentDialogVisible.value = true; };
    const openView = doc => { documentDialogMode.value = 'view'; assignForm(doc); documentDialogVisible.value = true; };
    const skuDialogVisible = ref(false); const skuBatchInput = ref(''); const skuQueryResults = ref([]); const unmatchedSkuCodes = ref([]); const selectedProducts = ref([]); const availableProducts = computed(() => productPool.filter(product => !form.items.some(item => item.sku === product.sku))); const clearSkuQuery = () => { skuBatchInput.value = ''; skuQueryResults.value = []; unmatchedSkuCodes.value = []; selectedProducts.value = []; }; const openSkuDialog = () => { clearSkuQuery(); skuDialogVisible.value = true; }; const querySkus = () => { const codes = [...new Set(skuBatchInput.value.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean))]; if (!codes.length) return ElementPlus.ElMessage.warning('请先输入至少一个 SKU'); const map = new Map(availableProducts.value.map(product => [product.sku.toUpperCase(), product])); skuQueryResults.value = codes.map(code => map.get(code.toUpperCase())).filter(Boolean); unmatchedSkuCodes.value = codes.filter(code => !map.has(code.toUpperCase())); selectedProducts.value = []; ElementPlus.ElMessage[skuQueryResults.value.length ? 'success' : 'warning'](skuQueryResults.value.length ? `匹配到 ${skuQueryResults.value.length} 个可加入的 SKU` : '没有匹配到可加入的 SKU'); }; const addSelectedSkus = () => { if (!selectedProducts.value.length) return ElementPlus.ElMessage.warning('请至少选择一个 SKU'); selectedProducts.value.forEach(product => form.items.push(mkItem(product))); skuDialogVisible.value = false; clearSkuQuery(); }; const removeSku = index => form.items.splice(index, 1);
    const saveDocument = async () => {
      try { await docFormRef.value.validate(); } catch (error) { return; }
      if (!form.items.length) return ElementPlus.ElMessage.warning('请至少添加一个 SKU 明细');
      form.items.forEach(item => { item.amount = Number(item.purchaseQty || 0) * Number(item.unitPrice || 0); });
      const payload = clone(form); payload.updatedAt = nowText();
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
    const openRelatedStock = stockPlanNo => { if (window.parent !== window) window.parent.postMessage({ type: 'prototype:navigate', page: 'stock', focus: stockPlanNo }, '*'); else window.location.href = `../stock-plan/index.html?focus=${encodeURIComponent(stockPlanNo)}`; };
    const voidDocument = doc => { if (!VOIDABLE_STATUSES.includes(doc.status)) return ElementPlus.ElMessage.warning('当前状态不可作废，仅草稿和待审核可作废'); ElementPlus.ElMessageBox.prompt('作废后将停止当前采购流程，请输入作废原因：', '二次确认：作废采购计划', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { doc.remark = '作废原因：' + value; changeStatus(doc, 'voided', '采购计划已作废'); }).catch(() => {}); };
    const batchGeneratePO = () => { const targets = selectedDocs.value.filter(doc => doc.status === 'pending_purchase'); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有待生成采购单的采购计划'); ElementPlus.ElMessageBox.confirm('确认为选中的 ' + targets.length + ' 张采购计划生成采购单？', '批量生成采购单', { type: 'warning' }).then(() => { const prefix = 'PO' + new Date().toISOString().slice(2, 10).replace(/-/g, ''); let counter = 2000; targets.forEach(doc => { doc.items.forEach(c => { if (!c.purchaseNo) c.purchaseNo = prefix + String(counter++).padStart(4, '0'); }); changeStatus(doc, 'purchasing', '采购单已生成'); }); }).catch(() => {}); };
    const batchVoid = () => { const targets = selectedDocs.value.filter(doc => VOIDABLE_STATUSES.includes(doc.status)); if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可作废的采购计划（仅草稿和待审核可作废）'); ElementPlus.ElMessageBox.prompt('作废后将停止选中采购计划的流程，请输入作废原因：', '批量作废', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { targets.forEach(doc => { doc.remark = '作废原因：' + value; doc.status = 'voided'; doc.updatedAt = nowText(); }); ElementPlus.ElMessage.success('已作废 ' + targets.length + ' 张采购计划'); }).catch(() => {}); };
    const refresh = () => { filters.queryTick += 1; ElementPlus.ElMessage.success('数据已刷新'); };
    const showExport = () => ElementPlus.ElMessage.success('已按当前筛选条件生成采购计划导出任务');
    initLegacyQuery();
    return { platforms, stores, countries, suppliers, warehouses, teams, creators, documents, activeStatus, statusTabs, page, pageSize, selectedDocs, filteredDocs, pagedDocs, statusMeta, confirmerLabel, DRAFT_STATUSES, PENDING_REVIEW_STATUSES, statusCount, planTotalQty, planTotalAmount, documentDialogVisible, documentDialogMode, documentDialogTitle, docFormRef, form, rules, openCreate, openEdit, openView, saveDocument, skuDialogVisible, skuBatchInput, skuQueryResults, unmatchedSkuCodes, selectedProducts, openSkuDialog, querySkus, clearSkuQuery, addSelectedSkus, removeSku, auditDialogVisible, auditDialogTitle, auditFormRef, auditForm, auditRules, auditTargets, openAudit, openBatchAudit, submitAudit, submitAuditAction, generatePO, viewPO, openRelatedStock, voidDocument, batchGeneratePO, batchVoid, refresh, showExport };
  }
}).use(ElementPlus).mount(root);

document.querySelectorAll('[data-page-nav]').forEach(item => item.addEventListener('click', () => {
  const routes = { forecast: '../demand-forecast/index.html', stock: '../stock-plan/index.html', purchase: '../purchase-plan/index.html', shipment: '../shipment-plan/index.html', purchaseOrder: '../purchase-orders/index.html', shipmentOrder: '../shipment-orders/index.html', supplierInventory: '../supplier-inventory/index.html' };
  const page = item.dataset.pageNav;
  if (window.parent !== window) window.parent.postMessage({ type: 'prototype:navigate', page }, '*');
  else if (routes[page]) window.location.href = routes[page];
}));
