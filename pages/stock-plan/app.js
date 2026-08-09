const { createApp, ref, reactive, computed } = Vue;

const root = document.querySelector('#stockBusinessApp');
root.innerHTML = `
  <section class="action-strip"><div class="head-actions"><el-button type="primary" @click="openCreate">新建备货计划</el-button><el-button type="primary" plain @click="showImport">备货计划管理清单</el-button><el-button :disabled="selectedDocs.length === 0" @click="batchGeneratePurchase">生成采购计划</el-button><el-button :disabled="selectedDocs.length === 0" @click="openBatchAudit">批量审核</el-button><el-button :disabled="selectedDocs.length === 0" @click="batchVoid">批量作废</el-button><el-button @click="showExport">导出</el-button></div></section>
  <section class="status-bar"><div class="status-tabs"><button v-for="tab in statusTabs" :key="tab.name" class="status-tab" :class="{active: activeStatus === tab.name}" @click="activeStatus = tab.name; page = 1">{{ tab.label }}（{{ statusCount(tab.name) }}）</button></div><div class="status-tools"><span class="tool" title="刷新" @click="refresh">↻</span><span class="tool" title="设置">⚙</span></div></section>
  <section class="stock-business-table">
    <el-table v-if="pagedDocs.length" :data="pagedDocs" row-key="id" border class="document-table" @selection-change="selectedDocs = $event">
      <el-table-column type="selection" width="42"></el-table-column>
      <el-table-column type="expand" width="42"><template #default="scope"><div class="detail-box"><div class="detail-head"><div class="detail-title">SKU 备货明细</div><div class="detail-summary"><span>SKU 数：{{ scope.row.items.length }}</span><span>六个月备货合计：{{ documentTotal(scope.row).toLocaleString() }}</span></div></div><el-table :data="scope.row.items" size="small" border><el-table-column prop="sku" label="SKU" width="130" fixed="left"></el-table-column><el-table-column prop="productName" label="品名" min-width="170" show-overflow-tooltip></el-table-column><el-table-column prop="lingxingSku" label="领星SKU" width="126"></el-table-column><el-table-column prop="sellerSku" label="SellerSKU / ASIN" min-width="160" show-overflow-tooltip></el-table-column><el-table-column v-for="month in months" :key="month.key" :label="month.label" width="92" align="right"><template #default="itemScope">{{ Number(itemScope.row[month.key] || 0).toLocaleString() }}</template></el-table-column><el-table-column prop="expectedDate" label="期望交货时间" width="124"></el-table-column><el-table-column prop="suggestedOrderQty" label="建议下单数量" width="116" align="right"></el-table-column><el-table-column prop="remark" label="明细备注" min-width="150" show-overflow-tooltip></el-table-column></el-table></div></template></el-table-column>
      <el-table-column label="备货计划" min-width="200"><template #default="scope"><div class="document-no" @click="openView(scope.row)">{{ scope.row.docNo }}</div><div class="cell-secondary">批次：{{ scope.row.batch }}</div><div class="document-tag-row"><el-tag size="small" :type="scope.row.sourceType === 'forecast' ? 'primary' : 'info'" effect="plain">{{ scope.row.sourceType === 'forecast' ? '预测生成' : '手工新建' }}</el-tag><el-tag size="small" :type="statusMeta(scope.row.status).type" effect="light">{{ statusMeta(scope.row.status).label }}</el-tag><span v-if="confirmerLabel(scope.row)" class="confirmer-label">{{ confirmerLabel(scope.row) }}</span></div></template></el-table-column>
      <el-table-column label="关联单据" min-width="175"><template #default="scope"><div class="relation-label">需求预测单号</div><div v-if="scope.row.forecastNo" class="relation-value" @click="openRelatedForecast(scope.row.forecastNo)">{{ scope.row.forecastNo }}</div><div v-else class="relation-empty">手工新建，无来源预测单</div><div v-if="scope.row.purchasePlanNo" class="cell-secondary">采购计划：{{ scope.row.purchasePlanNo }}</div><div v-if="scope.row.shipmentPlanNo" class="cell-secondary">发货计划：{{ scope.row.shipmentPlanNo }}</div></template></el-table-column>
      <el-table-column label="业务信息" min-width="180"><template #default="scope"><div class="business-cell"><div class="platform-shop">{{ scope.row.platform }} · {{ scope.row.shop }}</div><div class="business-meta">{{ scope.row.country }}站 · {{ scope.row.team }}</div><div class="business-owner">运营负责人：{{ scope.row.owner }}</div></div></template></el-table-column>
      <el-table-column label="SKU数" width="60" align="center"><template #default="scope">{{ scope.row.items.length }}</template></el-table-column>
      <el-table-column label="创建及更新信息" min-width="155"><template #default="scope"><div class="cell-primary">{{ scope.row.createdBy }}</div><div class="cell-secondary">创建：{{ scope.row.createdAt }}</div><div class="cell-secondary">更新：{{ scope.row.updatedAt }}</div></template></el-table-column>
      <el-table-column label="操作" min-width="160"><template #default="scope"><div class="operation-links"><el-button link type="primary" @click="openView(scope.row)">查看</el-button><template v-if="DRAFT_STATUSES.includes(scope.row.status)"><el-button link type="primary" @click="openEdit(scope.row)">编辑</el-button><el-button link type="success" @click="openAudit(scope.row)">提交审核</el-button><el-button link type="danger" @click="voidDocument(scope.row)">作废</el-button></template><template v-else-if="PENDING_STATUSES.includes(scope.row.status)"><el-button link type="primary" @click="openEdit(scope.row)">编辑</el-button><el-button link type="success" @click="openAudit(scope.row)">审核</el-button><el-button link type="danger" @click="voidDocument(scope.row)">作废</el-button></template><template v-else-if="scope.row.status === 'purchase_pending'"><el-button link type="primary" @click="generatePurchasePlan(scope.row)">生成采购计划</el-button></template><template v-else-if="scope.row.status === 'shipment_pending'"><el-button link type="primary" @click="generateShipmentPlan(scope.row)">生成发货计划</el-button></template><template v-else-if="scope.row.status === 'void'"><el-button link type="primary" @click="openEdit(scope.row)">编辑</el-button></template></div></template></el-table-column>
    </el-table>
    <el-empty v-else description="未找到符合条件的备货计划"></el-empty>
    <div class="pagination-bar"><el-pagination v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[5,10,20]" :total="filteredDocs.length" layout="total, sizes, prev, pager, next, jumper"></el-pagination></div>
  </section>
  <el-dialog v-model="documentDialogVisible" :title="documentDialogTitle" width="90%" top="5vh" class="forecast-dialog" :close-on-click-modal="false" destroy-on-close>
    <div class="document-dialog-body"><div class="section-title">单据公共信息</div><el-form ref="docFormRef" :model="form" :rules="rules" label-position="left" label-width="88px" class="compact-document-form" :disabled="documentDialogMode === 'view'"><div class="form-grid"><el-form-item label="备货计划号"><el-input v-model="form.docNo" disabled></el-input></el-form-item><el-form-item label="备货批次" prop="batch"><el-select v-model="form.batch" style="width:100%"><el-option v-for="item in batches" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="生成来源"><el-input :model-value="form.sourceType === 'forecast' ? '需求预测自动生成' : '手工新建'" disabled></el-input></el-form-item><el-form-item label="预测单号"><el-input :model-value="form.forecastNo || '无来源预测单'" disabled></el-input></el-form-item><el-form-item label="平台" prop="platform"><el-select v-model="form.platform" style="width:100%"><el-option v-for="item in platforms" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="店铺" prop="shop"><el-select v-model="form.shop" style="width:100%"><el-option v-for="item in shops" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="国家" prop="country"><el-select v-model="form.country" style="width:100%"><el-option v-for="item in countries" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="团队" prop="team"><el-select v-model="form.team" style="width:100%"><el-option v-for="item in teams" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="运营负责人" prop="owner"><el-select v-model="form.owner" style="width:100%"><el-option v-for="item in owners" :key="item" :label="item" :value="item"></el-option></el-select></el-form-item><el-form-item label="计划备注"><el-input v-model="form.remark" maxlength="200" show-word-limit></el-input></el-form-item><el-form-item label="创建人"><el-input v-model="form.createdBy" disabled></el-input></el-form-item><el-form-item label="创建时间"><el-input :model-value="form.createdAt || '保存后自动生成'" disabled></el-input></el-form-item></div></el-form><el-divider></el-divider><div class="section-title">SKU 备货明细</div><div class="sku-toolbar"><div class="sku-toolbar-note">同一备货计划下的 SKU 共享上述平台、店铺、国家、团队和运营负责人。</div><el-button v-if="documentDialogMode !== 'view'" type="primary" plain @click="openSkuDialog">新增 SKU</el-button></div><el-table v-if="form.items.length" :data="form.items" border><el-table-column prop="sku" label="SKU" width="130"></el-table-column><el-table-column prop="productName" label="品名" min-width="176"></el-table-column><el-table-column v-for="month in months" :key="month.key" :label="month.label" width="118" align="center"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ Number(scope.row[month.key] || 0).toLocaleString() }}</span><el-input-number v-else v-model="scope.row[month.key]" :min="0" :max="999999" :controls="false" class="month-input"></el-input-number></template></el-table-column><el-table-column label="期望交货时间" width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.expectedDate }}</span><el-date-picker v-else v-model="scope.row.expectedDate" type="date" value-format="YYYY-MM-DD" style="width:132px"></el-date-picker></template></el-table-column><el-table-column label="建议下单数量" width="132"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.suggestedOrderQty }}</span><el-input-number v-else v-model="scope.row.suggestedOrderQty" :min="0" :max="999999" :controls="false" class="month-input"></el-input-number></template></el-table-column><el-table-column label="明细备注" min-width="150"><template #default="scope"><span v-if="documentDialogMode === 'view'">{{ scope.row.remark || '—' }}</span><el-input v-else v-model="scope.row.remark"></el-input></template></el-table-column><el-table-column v-if="documentDialogMode !== 'view'" label="操作" width="78"><template #default="scope"><el-button link type="danger" @click="removeSku(scope.$index)">移除</el-button></template></el-table-column></el-table><el-empty v-else description="尚未添加 SKU，请点击“新增 SKU”"></el-empty></div><template #footer><el-button @click="documentDialogVisible = false">{{ documentDialogMode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="documentDialogMode !== 'view'" type="primary" @click="saveDocument">{{ documentDialogMode === 'create' ? '保存备货计划' : '保存修改' }}</el-button></template></el-dialog>
  <el-dialog v-model="skuDialogVisible" title="批量选择 SKU" width="820px" :close-on-click-modal="false" append-to-body><el-alert title="支持粘贴多个 SKU，使用换行、逗号、空格或分号分隔。" type="info" show-icon :closable="false"></el-alert><div class="sku-batch-query"><el-input v-model="skuBatchInput" type="textarea" :rows="3" resize="none" placeholder="请输入或粘贴多个 SKU"></el-input><div class="sku-query-actions"><el-button @click="clearSkuQuery">清空</el-button><el-button type="primary" @click="querySkus">批量查询</el-button></div></div><el-alert v-if="unmatchedSkuCodes.length" :title="\`以下 SKU 未匹配或已加入明细：\${unmatchedSkuCodes.join('、')}\`" type="warning" show-icon :closable="false"></el-alert><div class="sku-result-head"><div class="sku-result-title">查询结果（{{ skuQueryResults.length }}）</div></div><el-table v-if="skuQueryResults.length" :data="skuQueryResults" border @selection-change="selectedProducts = $event"><el-table-column type="selection" width="48"></el-table-column><el-table-column prop="sku" label="SKU" width="138"></el-table-column><el-table-column prop="productName" label="品名" min-width="190"></el-table-column><el-table-column prop="lingxingSku" label="领星SKU" width="136"></el-table-column><el-table-column prop="sellerSku" label="SellerSKU / ASIN" min-width="180"></el-table-column></el-table><el-empty v-else description="请输入 SKU 后点击"批量查询""></el-empty><template #footer><el-button @click="skuDialogVisible = false">取消</el-button><el-button type="primary" @click="addSelectedSkus">加入明细（{{ selectedProducts.length }}）</el-button></template></el-dialog>
  <el-dialog v-model="auditDialogVisible" :title="auditDialogTitle" width="520px" :close-on-click-modal="false"><el-form ref="auditFormRef" :model="auditForm" :rules="auditRules" label-position="top"><div v-if="auditTargets.length" class="audit-targets"><div class="audit-target-label">审核单据：</div><div v-for="doc in auditTargets" :key="doc.id" class="audit-target-item">{{ doc.docNo }}（{{ confirmerLabel(doc) }}）</div></div><el-form-item label="审核意见" prop="comment"><el-input v-model="auditForm.comment" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="审核通过可留空，驳回时请填写原因"></el-input></el-form-item></el-form><template #footer><el-button @click="auditDialogVisible = false">取消</el-button><el-button type="danger" @click="submitAudit('reject')">驳回</el-button><el-button type="primary" @click="submitAudit('approve')">通过</el-button></template></el-dialog>
`;

createApp({
  setup() {
    const clone = value => JSON.parse(JSON.stringify(value));
    const months = [
      { key: 'm202608', label: '2026/08' }, { key: 'm202609', label: '2026/09' },
      { key: 'm202610', label: '2026/10' }, { key: 'm202611', label: '2026/11' },
      { key: 'm202612', label: '2026/12' }, { key: 'm202701', label: '2027/01' }
    ];
    const batches = ['2026/08-1', '2026/08-2', '2026/09-1'];
    const platforms = ['Amazon', 'eBay', 'Shopify', 'B2B'];
    const shops = ['ARCCAPTAIN_US', 'ARCCAPTAIN_CA', 'arccaptain_industrial', 'B端独立站'];
    const countries = ['美国', '加拿大', '德国', '其他'];
    const teams = ['亚马逊团队', 'eBay团队', 'Jasic团队', 'B端团队'];
    const owners = ['王方圆', '李明', '陈晓', '周杰'];
    const productPool = [
      { sku: '51001010025', productName: '小屏焊帽-基础款', lingxingSku: 'AR-HM-001', sellerSku: 'Helmet-beyond05' },
      { sku: '34301D0002', productName: '焊接围裙36寸棕色', lingxingSku: '10430100114', sellerSku: 'apron-brown-ca' },
      { sku: '5200100001', productName: '大屏焊帽（黑色）', lingxingSku: '10400100101', sellerSku: '140US160006' },
      { sku: '130US160006', productName: 'ARC130 110V 掌上焊机', lingxingSku: '10300200306', sellerSku: 'WELDERARC130' },
      { sku: '130US160012', productName: 'ARC200L 焊机+Lift TIG', lingxingSku: 'AR-ARC200R201', sellerSku: 'ARC200-LIFTTIG' },
      { sku: '42101000004', productName: 'TIG焊丝-不锈钢', lingxingSku: '10250100710', sellerSku: 'ARER308L-516' },
      { sku: '34001001110', productName: '焊接帽子迷彩款', lingxingSku: '10410112110', sellerSku: '10410112110' }
    ];
    const mkItem = (product, values = {}) => ({ ...clone(product), m202608: 0, m202609: 0, m202610: 0, m202611: 0, m202612: 0, m202701: 0, expectedDate: '2026-08-20', suggestedOrderQty: 0, remark: '', ...values });
    const documents = ref([
      { id: 1, docNo: 'BHJH20260804-001', batch: '2026/08-1', sourceType: 'manual', forecastNo: '', platform: 'Amazon', shop: 'ARCCAPTAIN_US', country: '美国', team: '亚马逊团队', owner: '王方圆', status: 'draft', purchasePlanNo: '', shipmentPlanNo: '', createdBy: 'Admin', createdAt: '2026-08-04 15:20', updatedAt: '2026-08-04 15:20', remark: '美国站8月手工备货', items: [mkItem(productPool[0], { m202608: 180, m202609: 200, m202610: 220, expectedDate: '2026-08-20', suggestedOrderQty: 420, remark: '优先补货' }), mkItem(productPool[3], { m202608: 100, m202609: 120, m202610: 130, expectedDate: '2026-08-25', suggestedOrderQty: 260 })] },
      { id: 2, docNo: 'BHJH20260804-002', batch: '2026/08-1', sourceType: 'forecast', forecastNo: 'XQYC20260804-002', platform: 'Amazon', shop: 'ARCCAPTAIN_CA', country: '加拿大', team: '亚马逊团队', owner: '李明', status: 'ops_pending', purchasePlanNo: '', shipmentPlanNo: '', createdBy: '系统', createdAt: '2026-08-04 14:06', updatedAt: '2026-08-04 14:30', remark: '由已确认需求预测自动生成', items: [mkItem(productPool[1], { m202608: 90, m202609: 110, m202610: 130, suggestedOrderQty: 220 }), mkItem(productPool[0], { m202608: 60, m202609: 70, m202610: 80, suggestedOrderQty: 120 })] },
      { id: 3, docNo: 'BHJH20260803-003', batch: '2026/08-1', sourceType: 'forecast', forecastNo: 'XQYC20260803-003', platform: 'eBay', shop: 'arccaptain_industrial', country: '美国', team: 'eBay团队', owner: '陈晓', status: 'owner_pending', purchasePlanNo: '', shipmentPlanNo: '', createdBy: '系统', createdAt: '2026-08-03 18:43', updatedAt: '2026-08-03 19:05', remark: '', items: [mkItem(productPool[2], { m202608: 120, m202609: 120, m202610: 130, suggestedOrderQty: 180 }), mkItem(productPool[5], { m202608: 300, m202609: 320, m202610: 350, suggestedOrderQty: 520 })] },
      { id: 4, docNo: 'BHJH20260803-004', batch: '2026/08-1', sourceType: 'forecast', forecastNo: 'XQYC20260803-004', platform: 'Amazon', shop: 'ARCCAPTAIN_US', country: '美国', team: '亚马逊团队', owner: '王方圆', status: 'purchase_pending', purchasePlanNo: '', shipmentPlanNo: '', createdBy: '系统', createdAt: '2026-08-03 16:20', updatedAt: '2026-08-03 17:40', remark: '等待采购计划', items: [mkItem(productPool[4], { m202608: 80, m202609: 100, m202610: 120, suggestedOrderQty: 300 })] },
      { id: 5, docNo: 'BHJH20260802-005', batch: '2026/08-1', sourceType: 'manual', forecastNo: '', platform: 'B2B', shop: 'B端独立站', country: '美国', team: 'B端团队', owner: '周杰', status: 'shipment_pending', purchasePlanNo: 'CGJH20260802-005', shipmentPlanNo: '', createdBy: '周杰', createdAt: '2026-08-02 15:35', updatedAt: '2026-08-02 17:10', remark: '现有库存可直接发运', items: [mkItem(productPool[3], { m202608: 1000, expectedDate: '2026-08-18', suggestedOrderQty: 0, remark: '无需采购' })] },
      { id: 6, docNo: 'BHJH20260801-006', batch: '2026/08-1', sourceType: 'forecast', forecastNo: 'XQYC20260801-006', platform: 'Shopify', shop: 'B端独立站', country: '德国', team: 'Jasic团队', owner: '陈晓', status: 'executed', purchasePlanNo: 'CGJH20260801-006', shipmentPlanNo: 'FHJH20260801-006', createdBy: '系统', createdAt: '2026-08-01 10:10', updatedAt: '2026-08-01 16:20', remark: '采购与发货计划均已生成', items: [mkItem(productPool[6], { m202608: 100, m202609: 150, m202610: 180, suggestedOrderQty: 260 })] },
      { id: 7, docNo: 'BHJH20260728-007', batch: '2026/08-1', sourceType: 'manual', forecastNo: '', platform: 'eBay', shop: 'arccaptain_industrial', country: '美国', team: 'eBay团队', owner: '陈晓', status: 'void', purchasePlanNo: '', shipmentPlanNo: '', createdBy: '陈晓', createdAt: '2026-07-28 10:12', updatedAt: '2026-07-28 11:30', remark: '作废原因：备货数量填写错误', items: [mkItem(productPool[5], { m202608: 500, expectedDate: '2026-08-31', suggestedOrderQty: 500 })] },
      { id: 8, docNo: 'BHJH20260803-008', batch: '2026/08-1', sourceType: 'forecast', forecastNo: 'XQYC20260803-008', platform: 'Shopify', shop: 'B端独立站', country: '德国', team: 'Jasic团队', owner: '陈晓', status: 'plan_pending', purchasePlanNo: '', shipmentPlanNo: '', createdBy: '系统', createdAt: '2026-08-03 09:00', updatedAt: '2026-08-03 09:15', remark: '新品首次备货，待计划确认', items: [mkItem(productPool[6], { m202608: 50, m202609: 80, m202610: 100, expectedDate: '2026-09-15', suggestedOrderQty: 150 })] }
    ]);

    const filters = reactive({ batch: '', platform: '', shop: '', team: '', country: '', owner: '', sourceType: '', keyword: '', queryTick: 0 });
    const activeStatus = ref('all');
    const page = ref(1);
    const pageSize = ref(10);
    const selectedDocs = ref([]);
    const DRAFT_STATUSES = ['draft'];
    const PENDING_STATUSES = ['plan_pending', 'ops_pending', 'owner_pending'];
    const EXECUTING_STATUSES = ['purchase_pending', 'shipment_pending'];
    const AUDITABLE_STATUSES = ['draft', 'plan_pending', 'ops_pending', 'owner_pending'];
    const VOIDABLE_STATUSES = ['draft', 'plan_pending', 'ops_pending', 'owner_pending'];
    const STATUS_GROUP_MAP = { draft: DRAFT_STATUSES, pending: PENDING_STATUSES, executing: EXECUTING_STATUSES };
    const statusTabs = [
      { name: 'all', label: '全部' },
      { name: 'draft', label: '草稿' },
      { name: 'pending', label: '待审核' },
      { name: 'executing', label: '待执行' },
      { name: 'executed', label: '已执行' },
      { name: 'rejected', label: '已驳回' },
      { name: 'void', label: '已作废' }
    ];
    const statusMeta = (() => {
      const map = {
        draft: { label: '草稿', type: 'info' },
        plan_pending: { label: '待审核', type: 'warning' },
        ops_pending: { label: '待审核', type: 'warning' },
        owner_pending: { label: '待审核', type: 'warning' },
        purchase_pending: { label: '待执行', type: 'primary' },
        shipment_pending: { label: '待执行', type: 'primary' },
        executed: { label: '已执行', type: 'success' },
        rejected: { label: '已驳回', type: 'danger' },
        void: { label: '已作废', type: 'danger' }
      };
      return status => map[status] || { label: status, type: 'info' };
    })();
    const confirmerLabel = doc => {
      const map = {
        draft: '',
        plan_pending: '待计划审核',
        ops_pending: '待运营审核',
        owner_pending: '待负责人审核',
        purchase_pending: '待生成采购计划',
        shipment_pending: '待生成发货计划',
        rejected: '已驳回'
      };
      return map[doc.status] || '';
    };
    const readLegacyQuery = () => {
      filters.batch = '';
      filters.platform = '';
      filters.shop = '';
      filters.team = '';
      filters.country = '';
      filters.owner = '';
      filters.sourceType = '';
      const codes = [...legacy.codes];
      filters.keyword = [codes.join(' '), document.querySelector('#planNo').value, document.querySelector('#productName').value, document.querySelector('#purchaseNo').value, document.querySelector('#planOrderNo').value, document.querySelector('#remark').value].filter(Boolean).join(' ');
      filters.queryTick += 1;
    };
    const legacy = reactive({ codes: [], platforms: [], countries: [], stores: [], teams: [], creators: [] });
    const values = selector => [...document.querySelectorAll(`${selector} input:checked`)].map(input => input.value);
    const initLegacyQuery = () => {
      const configs = [['#platformMulti', platforms, 'platforms', '平台（可多选）'], ['#countryMulti', countries, 'countries', '国家（可多选）'], ['#storeMulti', shops, 'stores', '店铺（可多选）'], ['#teamMulti', teams, 'teams', '团队（可多选）'], ['#creatorMulti', ['Admin', '王方圆', '李明', '陈晓', '周杰', '系统'], 'creators', '创建人（可多选）']];
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
      document.querySelector('#searchBtn').addEventListener('click', () => { if (document.querySelector('#codeInput').value.trim()) { addCodes(document.querySelector('#codeInput').value); document.querySelector('#codeInput').value = ''; } readLegacyQuery(); page.value = 1; ElementPlus.ElMessage.success(`查询完成，共 ${filteredDocs.value.length} 张备货计划`); });
      document.querySelector('#resetBtn').addEventListener('click', () => { legacy.codes = []; ['#planNo', '#productName', '#purchaseNo', '#planOrderNo', '#remark', '#startDate', '#endDate'].forEach(id => document.querySelector(id).value = ''); document.querySelector('#codeType').value = 'SKU'; document.querySelector('#timeType').value = '创建时间'; document.querySelectorAll('.dropdown input').forEach(input => input.checked = false); configs.forEach(([id, , key, placeholder]) => { legacy[key] = []; const trigger = document.querySelector(`${id} [data-trigger]`); trigger.textContent = placeholder; trigger.classList.remove('has-value'); }); renderCodeTags(); readLegacyQuery(); activeStatus.value = 'all'; page.value = 1; ElementPlus.ElMessage.success('已重置查询条件'); });
      const expand = document.querySelector('#queryExpand'); expand.addEventListener('click', () => { const expanded = document.querySelector('.query-panel').classList.toggle('expanded'); expand.querySelector('.query-arrow').textContent = expanded ? '⌃' : '⌄'; expand.querySelector('.query-expand-text').textContent = expanded ? '收起' : '展开'; expand.setAttribute('aria-expanded', String(expanded)); });
      readLegacyQuery();
    };
    const split = value => value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean);
    const filteredDocs = computed(() => {
      filters.queryTick;
      const codeType = document.querySelector('#codeType').value; const codeMap = { SKU: 'sku', '领星 SKU': 'lingxingSku', SellerSKU: 'sellerSku', ASIN: 'sellerSku' };
      const codes = legacy.codes.map(value => value.toLowerCase()); const plans = split(document.querySelector('#planNo').value); const names = document.querySelector('#productName').value.trim().toLowerCase(); const purchaseNos = split(document.querySelector('#purchaseNo').value); const planNos = split(document.querySelector('#planOrderNo').value); const remark = document.querySelector('#remark').value.trim().toLowerCase();
      return documents.value.filter(doc => {
        if (activeStatus.value !== 'all') {
          const group = STATUS_GROUP_MAP[activeStatus.value];
          if (group) {
            if (!group.includes(doc.status)) return false;
          } else if (doc.status !== activeStatus.value) return false;
        }
        if (codes.length && !doc.items.some(item => codes.some(code => String(item[codeMap[codeType]] || '').toLowerCase().includes(code)))) return false; if (plans.length && !plans.some(value => doc.docNo.toLowerCase().includes(value))) return false; if (names && !doc.items.some(item => item.productName.toLowerCase().includes(names))) return false; if (purchaseNos.length && !purchaseNos.some(value => (doc.purchasePlanNo || '').toLowerCase().includes(value))) return false; if (planNos.length && !planNos.some(value => doc.docNo.toLowerCase().includes(value))) return false; if (remark && !(doc.remark || '').toLowerCase().includes(remark)) return false; if (legacy.platforms.length && !legacy.platforms.includes(doc.platform)) return false; if (legacy.countries.length && !legacy.countries.includes(doc.country)) return false; if (legacy.stores.length && !legacy.stores.includes(doc.shop)) return false; if (legacy.teams.length && !legacy.teams.includes(doc.team)) return false; if (legacy.creators.length && !legacy.creators.includes(doc.createdBy)) return false; const dateType = document.querySelector('#timeType').value; const date = dateType === '更新时间' ? doc.updatedAt.slice(0, 10) : doc.createdAt.slice(0, 10); const start = document.querySelector('#startDate').value; const end = document.querySelector('#endDate').value; if (start && date < start) return false; if (end && date > end) return false; return true; });
    });
    const pagedDocs = computed(() => filteredDocs.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
    const statusCount = status => {
      if (status === 'all') return documents.value.length;
      const group = STATUS_GROUP_MAP[status];
      if (group) return documents.value.filter(doc => group.includes(doc.status)).length;
      return documents.value.filter(doc => doc.status === status).length;
    };
    const rowTotal = row => months.reduce((sum, month) => sum + Number(row[month.key] || 0), 0);
    const documentTotal = doc => doc.items.reduce((sum, item) => sum + rowTotal(item), 0);
    const nowText = () => { const now = new Date(); const pad = value => String(value).padStart(2, '0'); return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`; };
    const documentDialogVisible = ref(false); const documentDialogMode = ref('create'); const documentDialogTitle = computed(() => documentDialogMode.value === 'create' ? '新建备货计划' : documentDialogMode.value === 'edit' ? '编辑备货计划' : '查看备货计划'); const docFormRef = ref(); const blankForm = () => ({ id: null, docNo: '', batch: '2026/08-1', sourceType: 'manual', forecastNo: '', platform: '', shop: '', country: '', team: '', owner: '', status: 'draft', purchasePlanNo: '', shipmentPlanNo: '', createdBy: 'Admin', createdAt: '', updatedAt: '', remark: '', items: [] }); const form = reactive(blankForm());
    const rules = { batch: [{ required: true, message: '请选择备货批次', trigger: 'change' }], platform: [{ required: true, message: '请选择平台', trigger: 'change' }], shop: [{ required: true, message: '请选择店铺', trigger: 'change' }], country: [{ required: true, message: '请选择国家', trigger: 'change' }], team: [{ required: true, message: '请选择团队', trigger: 'change' }], owner: [{ required: true, message: '请选择运营负责人', trigger: 'change' }] };
    const assignForm = doc => Object.assign(form, blankForm(), clone(doc)); const openCreate = () => { documentDialogMode.value = 'create'; assignForm(blankForm()); documentDialogVisible.value = true; }; const openEdit = doc => { documentDialogMode.value = 'edit'; assignForm(doc); documentDialogVisible.value = true; }; const openView = doc => { documentDialogMode.value = 'view'; assignForm(doc); documentDialogVisible.value = true; };
    const skuDialogVisible = ref(false); const skuBatchInput = ref(''); const skuSearchExecuted = ref(false); const skuQueryResults = ref([]); const unmatchedSkuCodes = ref([]); const selectedProducts = ref([]); const availableProducts = computed(() => productPool.filter(product => !form.items.some(item => item.sku === product.sku))); const clearSkuQuery = () => { skuBatchInput.value = ''; skuSearchExecuted.value = false; skuQueryResults.value = []; unmatchedSkuCodes.value = []; selectedProducts.value = []; }; const openSkuDialog = () => { clearSkuQuery(); skuDialogVisible.value = true; }; const querySkus = () => { const codes = [...new Set(skuBatchInput.value.split(/[\s,，;；]+/).map(value => value.trim()).filter(Boolean))]; if (!codes.length) return ElementPlus.ElMessage.warning('请先输入至少一个 SKU'); const map = new Map(availableProducts.value.map(product => [product.sku.toUpperCase(), product])); skuQueryResults.value = codes.map(code => map.get(code.toUpperCase())).filter(Boolean); unmatchedSkuCodes.value = codes.filter(code => !map.has(code.toUpperCase())); selectedProducts.value = []; skuSearchExecuted.value = true; ElementPlus.ElMessage[skuQueryResults.value.length ? 'success' : 'warning'](skuQueryResults.value.length ? `匹配到 ${skuQueryResults.value.length} 个可加入的 SKU` : '没有匹配到可加入的 SKU'); }; const addSelectedSkus = () => { if (!selectedProducts.value.length) return ElementPlus.ElMessage.warning('请至少选择一个 SKU'); selectedProducts.value.forEach(product => form.items.push(mkItem(product))); skuDialogVisible.value = false; clearSkuQuery(); }; const removeSku = index => form.items.splice(index, 1);
    const saveDocument = async () => { try { await docFormRef.value.validate(); } catch (error) { return; } if (!form.items.length) return ElementPlus.ElMessage.warning('请至少添加一个 SKU 明细'); const payload = clone(form); payload.updatedAt = nowText(); if (documentDialogMode.value === 'create') { payload.id = Math.max(...documents.value.map(doc => doc.id), 0) + 1; payload.docNo = `BHJH20260809-${String(payload.id).padStart(3, '0')}`; payload.createdAt = payload.updatedAt; documents.value.unshift(payload); } else { const index = documents.value.findIndex(doc => doc.id === payload.id); if (index >= 0) documents.value[index] = payload; } documentDialogVisible.value = false; ElementPlus.ElMessage.success(documentDialogMode.value === 'create' ? '备货计划创建成功，进入草稿' : '备货计划修改成功'); };
    const changeStatus = (doc, status, message) => { doc.status = status; doc.updatedAt = nowText(); ElementPlus.ElMessage.success(message); };
    const auditDialogVisible = ref(false); const auditDialogTitle = ref(''); const auditFormRef = ref(); const auditForm = reactive({ comment: '' }); const auditTargets = ref([]); const auditMode = ref('single');
    const auditRules = { comment: [{ validator: (rule, value, callback) => { if (auditMode.value === 'reject_required' && !value.trim()) callback(new Error('驳回时审核意见为必填')); else callback(); }, trigger: 'blur' }] };
    const openAudit = doc => {
      auditMode.value = 'single'; auditTargets.value = [doc]; auditForm.comment = '';
      auditDialogTitle.value = '审核备货计划 — ' + doc.docNo; auditDialogVisible.value = true;
    };
    const openBatchAudit = () => {
      const targets = selectedDocs.value.filter(doc => AUDITABLE_STATUSES.includes(doc.status));
      if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可审核的备货计划');
      auditMode.value = 'batch'; auditTargets.value = [...targets]; auditForm.comment = '';
      auditDialogTitle.value = '批量审核（' + targets.length + ' 张单据）'; auditDialogVisible.value = true;
    };
    const submitAudit = action => {
      const isReject = action === 'reject';
      if (isReject) {
        auditMode.value = 'reject_required';
        if (!auditForm.comment.trim()) return ElementPlus.ElMessage.warning('驳回时请填写审核意见');
      }
      auditMode.value = 'single';
      const nextMap = {
        draft: 'plan_pending',
        plan_pending: 'ops_pending',
        ops_pending: 'owner_pending',
        owner_pending: 'purchase_pending'
      };
      const labelMap = {
        draft: '提交审核',
        plan_pending: '计划审核',
        ops_pending: '运营审核',
        owner_pending: '负责人审核'
      };
      auditTargets.value.forEach(doc => {
        const next = isReject ? 'rejected' : nextMap[doc.status];
        const label = labelMap[doc.status] || '';
        const comment = auditForm.comment.trim();
        if (comment) doc.remark = (doc.remark ? doc.remark + '；' : '') + (isReject ? '驳回：' : '审核通过：') + comment;
        if (isReject) {
          changeStatus(doc, 'rejected', '备货计划已驳回');
        } else {
          doc.status = next; doc.updatedAt = nowText();
          ElementPlus.ElMessage.success(label + '完成');
        }
      });
      auditDialogVisible.value = false;
    };
    const generatePurchasePlan = doc => ElementPlus.ElMessageBox.confirm('确认为备货计划 ' + doc.docNo + ' 生成采购计划？', '生成采购计划', { type: 'warning' }).then(() => { doc.purchasePlanNo = doc.purchasePlanNo || doc.docNo.replace('BHJH', 'CGJH'); changeStatus(doc, 'executed', '采购计划 ' + doc.purchasePlanNo + ' 已生成，单据流转至已执行'); }).catch(() => {});
    const generateShipmentPlan = doc => ElementPlus.ElMessageBox.confirm('确认为备货计划 ' + doc.docNo + ' 生成发货计划？', '生成发货计划', { type: 'warning' }).then(() => { doc.shipmentPlanNo = doc.shipmentPlanNo || doc.docNo.replace('BHJH', 'FHJH'); changeStatus(doc, 'executed', '发货计划 ' + doc.shipmentPlanNo + ' 已生成，单据流转至已执行'); }).catch(() => {});
    const voidDocument = doc => {
      if (!VOIDABLE_STATUSES.includes(doc.status)) return ElementPlus.ElMessage.warning('当前状态不可作废，仅草稿和待审核可作废');
      ElementPlus.ElMessageBox.prompt('作废后将停止当前备货流程，请输入作废原因：', '二次确认：作废备货计划', { type: 'warning', inputPlaceholder: '请输入作废原因', inputValidator: value => !!value || '请输入作废原因', confirmButtonText: '确认作废', cancelButtonText: '取消' }).then(({ value }) => { doc.remark = '作废原因：' + value; changeStatus(doc, 'void', '备货计划已作废'); }).catch(() => {});
    };
    const batchGeneratePurchase = () => {
      const targets = selectedDocs.value.filter(doc => doc.status === 'purchase_pending');
      if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有待生成采购计划的备货计划');
      ElementPlus.ElMessageBox.confirm('确认为选中的 ' + targets.length + ' 张备货计划生成采购计划？', '批量生成采购计划', { type: 'warning' }).then(() => {
        targets.forEach(doc => { doc.purchasePlanNo = doc.purchasePlanNo || doc.docNo.replace('BHJH', 'CGJH'); changeStatus(doc, 'executed', '采购计划 ' + doc.purchasePlanNo + ' 已生成'); });
      }).catch(() => {});
    };
    const batchVoid = () => {
      const targets = selectedDocs.value.filter(doc => VOIDABLE_STATUSES.includes(doc.status));
      if (!targets.length) return ElementPlus.ElMessage.warning('选中的单据中没有可作废的备货计划（仅草稿和待审核可作废）');
      targets.forEach(doc => { doc.status = 'void'; doc.updatedAt = nowText(); });
      ElementPlus.ElMessage.success('已作废 ' + targets.length + ' 张备货计划');
    }; const refresh = () => { filters.queryTick += 1; ElementPlus.ElMessage.success('数据已刷新'); }; const showImport = () => ElementPlus.ElMessageBox.alert('导入模板包含单据公共字段、SKU 月度备货数量、期望交货时间、建议下单数量和明细备注。当前原型仅演示入口。', '备货计划管理清单', { confirmButtonText: '知道了' }); const showExport = () => ElementPlus.ElMessage.success('已按当前筛选条件生成备货计划导出任务'); const openRelatedForecast = forecastNo => { if (window.parent !== window) window.parent.postMessage({ type: 'prototype:navigate', page: 'forecast', focus: forecastNo }, '*'); else window.location.href = `../demand-forecast/index.html?focus=${encodeURIComponent(forecastNo)}`; };
    initLegacyQuery();
    return { months, batches, platforms, shops, countries, teams, owners, documents, activeStatus, statusTabs, page, pageSize, selectedDocs, filteredDocs, pagedDocs, statusMeta, confirmerLabel, DRAFT_STATUSES, PENDING_STATUSES, EXECUTING_STATUSES, statusCount, rowTotal, documentTotal, documentDialogVisible, documentDialogMode, documentDialogTitle, docFormRef, form, rules, openCreate, openEdit, openView, saveDocument, skuDialogVisible, skuBatchInput, skuSearchExecuted, skuQueryResults, unmatchedSkuCodes, selectedProducts, openSkuDialog, querySkus, clearSkuQuery, addSelectedSkus, removeSku, auditDialogVisible, auditDialogTitle, auditFormRef, auditForm, auditRules, auditTargets, openAudit, openBatchAudit, submitAudit, generatePurchasePlan, generateShipmentPlan, batchGeneratePurchase, voidDocument, batchVoid, refresh, showImport, showExport, openRelatedForecast };
  }
}).use(ElementPlus).mount(root);

document.querySelectorAll('[data-page-nav]').forEach(item => item.addEventListener('click', () => {
  const routes = { forecast: '../demand-forecast/index.html', stock: '../stock-plan/index.html', purchase: '../purchase-plan/index.html', shipment: '../shipment-plan/index.html', purchaseOrder: '../purchase-orders/index.html', shipmentOrder: '../shipment-orders/index.html', supplierInventory: '../supplier-inventory/index.html' };
  const page = item.dataset.pageNav;
  if (window.parent !== window) window.parent.postMessage({ type: 'prototype:navigate', page }, '*');
  else if (routes[page]) window.location.href = routes[page];
}));
