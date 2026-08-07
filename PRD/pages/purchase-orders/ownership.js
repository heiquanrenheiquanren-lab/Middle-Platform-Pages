(function () {
  const { createApp, ref, reactive, computed, nextTick, onMounted } = window.Vue;
  const { ElMessage, ElMessageBox } = window.ElementPlus;

  // 演示数据：5 个可搜索 SKU，覆盖匹配 / 未匹配 / 无在途数量等场景
  const skuRows = [
    { id: 'sku-110', sku: '34001001110', sellerSku: '10410112110', asin: 'B0D7K91A1C', name: '焊接帽子迷彩 2-…', purchase: 240, transit: 240, targetPlatform: 'Amazon', targetStore: 'US旗舰店', targetSku: 'AMZ-US-34001001110' },
    { id: 'sku-128', sku: '34001001128', sellerSku: '10410112128', asin: 'B0D7K91B2D', name: '焊接帽子黑色', purchase: 180, transit: 180, targetPlatform: 'Amazon', targetStore: 'US旗舰店', targetSku: '' },
    { id: 'sku-206', sku: '34001001206', sellerSku: '10410112206', asin: 'B0D7K92M6Q', name: '焊接帽子蓝色', purchase: 120, transit: 120, targetPlatform: 'Amazon', targetStore: 'US旗舰店', targetSku: 'ASIN-B0D7K92M6Q' },
    { id: 'sku-316', sku: '34001001316', sellerSku: '10410112316', asin: 'B0D7K93N7R', name: '焊接手套加厚款', purchase: 50, transit: 50, targetPlatform: '', targetStore: '', targetSku: '' },
    { id: 'sku-999', sku: '34001001999', sellerSku: '10410119999', asin: '', name: '焊接手套基础款', purchase: 30, transit: 0, targetPlatform: '', targetStore: '', targetSku: '' }
  ];

  const storesByPlatform = {
    Amazon: ['US旗舰店', 'CA旗舰店', 'UK旗舰店'],
    Shopify: ['B端独立站', 'D端独立站'],
    eBay: ['ARCCAP', 'JASIC官方店']
  };

  const defaultSearchText = '34001001110\n34001001128\nB0D7K92M6Q';

  createApp({
    template: `
      <el-dialog v-model="visible" align-center width="1200px" class="ownership-adjustment-dialog" :close-on-click-modal="false" :before-close="onBeforeClose" destroy-on-close>
        <template #header>
          <div class="oa-dialog-title"><div><h1>采购单（在途数量）货权调整</h1><p>批量选择 SKU 后，统一或逐条设置调入信息</p></div></div>
        </template>

        <section class="oa-source-summary">
          <div><span>来源采购单</span><strong>BDT20260806-1</strong></div>
          <div><span>来源货权</span><strong>Shopify · B端独立站</strong></div>
          <div><span>来源团队</span><strong>B端团队</strong></div>
          <div><span>可调整在途数</span><strong class="oa-blue">590 pcs</strong></div>
        </section>

        <el-alert v-if="submitError" class="oa-submit-error" type="error" :closable="false" show-icon :title="submitError"></el-alert>

        <section class="oa-section">
          <div class="oa-section-head"><div><span class="oa-step">1</span><strong>批量搜索并选择 SKU</strong></div><span>支持 SKU / SellerSKU / ASIN，最多 100 个</span></div>
          <div class="oa-batch-search">
            <el-input v-model="searchText" type="textarea" :rows="3" resize="none" placeholder="输入或粘贴多个 SKU / SellerSKU / ASIN；支持换行、逗号或空格分隔" @keydown.enter.prevent="runSearch"></el-input>
            <div class="oa-search-actions"><el-button type="primary" @click="runSearch">查询</el-button><el-button @click="clearSearch">清空</el-button></div>
          </div>
          <div class="oa-search-meta"><div><strong>查询结果 {{ filteredRows.length }} 条</strong><span class="oa-muted">· 已勾选 <b>{{ selectedRows.length }}</b> 条</span></div><div><el-button link type="primary" @click="selectAllResults">全选可调整项</el-button><el-button link type="primary" @click="clearSelected">清空已选</el-button></div></div>
          <el-alert v-if="unmatched.length" class="oa-alert" type="warning" :closable="false" show-icon>有 {{ unmatched.length }} 个编码未匹配：{{ unmatched.join('、') }}。未匹配项不会进入调整。</el-alert>
          <el-table ref="resultTable" :data="filteredRows" row-key="id" border max-height="250" @selection-change="onResultSelectionChange">
            <el-table-column type="selection" width="52" :selectable="isSelectable"></el-table-column>
            <el-table-column label="来源 SKU" min-width="180"><template #default="scope"><strong>{{ scope.row.sku }}</strong><small>SellerSKU {{ scope.row.sellerSku }}</small></template></el-table-column>
            <el-table-column prop="name" label="品名" min-width="180"></el-table-column>
            <el-table-column label="来源平台 / 店铺" min-width="200"><template #default>Shopify / B端独立站</template></el-table-column>
            <el-table-column label="采购数" width="100"><template #default="scope">{{ scope.row.purchase }} pcs</template></el-table-column>
            <el-table-column label="在途数" width="100"><template #default="scope">{{ scope.row.transit }} pcs</template></el-table-column>
            <el-table-column label="可调整数" width="110"><template #default="scope">{{ scope.row.transit }} pcs</template></el-table-column>
            <el-table-column label="匹配状态" width="120"><template #default="scope"><el-tag :type="statusFor(scope.row).type" size="small">{{ statusFor(scope.row).label }}</el-tag></template></el-table-column>
            <template #empty><el-empty description="未找到匹配的 SKU" :image-size="55"></el-empty></template>
          </el-table>
        </section>

        <section class="oa-section oa-target-section">
          <div class="oa-section-head"><div><span class="oa-step">2</span><strong>设置调入信息</strong></div><span>公共字段批量应用，特殊 SKU 可逐行修改</span></div>
          <div class="oa-batch-toolbar">
            <div><span>调入平台</span><el-select v-model="batchPlatform" placeholder="请选择平台" style="width:180px" @change="batchStore = ''"><el-option v-for="platform in platforms" :key="platform" :label="platform" :value="platform"></el-option></el-select></div>
            <div><span>调入店铺</span><el-select v-model="batchStore" :disabled="!batchPlatform" placeholder="请先选择平台" style="width:210px"><el-option v-for="store in storesFor(batchPlatform)" :key="store" :label="store" :value="store"></el-option></el-select></div>
            <el-button type="primary" plain @click="applyBatch">应用到已选 SKU</el-button>
            <el-button @click="fillMaxQuantity">按可调整数填充</el-button>
          </div>

          <el-table v-if="selectedRows.length" :data="selectedRows" row-key="id" border max-height="260">
            <el-table-column label="来源 SKU" width="160"><template #default="scope"><strong>{{ scope.row.sku }}</strong><small>来源在途 {{ scope.row.transit }} pcs</small></template></el-table-column>
            <el-table-column label="调入平台" width="160"><template #default="scope"><el-select v-model="formFor(scope.row).platform" placeholder="请选择平台" style="width:140px" @change="onRowPlatformChange(scope.row)"><el-option v-for="platform in platforms" :key="platform" :label="platform" :value="platform"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入店铺" width="190"><template #default="scope"><el-select v-model="formFor(scope.row).store" :disabled="!formFor(scope.row).platform" placeholder="请选择店铺" style="width:170px"><el-option v-for="store in storesFor(formFor(scope.row).platform)" :key="store" :label="store" :value="store"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入 SellerSKU / ASIN" min-width="250"><template #default="scope"><el-select v-model="formFor(scope.row).targetSku" filterable allow-create default-first-option placeholder="搜索或输入 SellerSKU / ASIN" style="width:100%"><el-option v-for="option in sellerSkuOptions" :key="option" :label="option" :value="option"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入数量" width="140"><template #default="scope"><el-input-number v-model="formFor(scope.row).quantity" :min="1" :max="scope.row.transit" controls-position="right" style="width:120px"></el-input-number></template></el-table-column>
            <el-table-column label="校验" width="150"><template #default="scope"><el-tag :type="validateRow(scope.row).length ? 'warning' : 'success'" size="small">{{ validateRow(scope.row).length ? '待补充' : '通过' }}</el-tag><span v-if="validateRow(scope.row).length" class="oa-field-error">{{ validateRow(scope.row)[0] }}</span></template></el-table-column>
            <el-table-column label="操作" width="70"><template #default="scope"><el-button link type="danger" @click="removeRow(scope.row)">移除</el-button></template></el-table-column>
          </el-table>
          <el-empty v-else description="暂未选择 SKU" :image-size="60"></el-empty>
        </section>

        <template #footer>
          <div class="oa-dialog-footer">
            <div class="oa-footer-summary">
              <strong>已选 <b>{{ selectedRows.length }}</b> 个 SKU</strong>
              <span>计划调入总数 <b>{{ totalQuantity }}</b> pcs</span>
              <span :class="hasErrors ? 'oa-error-summary' : 'oa-success-summary'">{{ selectedRows.length ? (hasErrors ? invalidRowCount + ' 个 SKU 待补充或校验' : '校验通过，可提交') : '请选择需要调整的 SKU' }}</span>
            </div>
            <div class="oa-footer-actions">
              <el-checkbox v-model="simulateFailure" class="oa-sim-fail" title="开启后本次提交将模拟失败，用于验收失败保留内容">模拟提交失败</el-checkbox>
              <el-button @click="resetDialog">重置</el-button>
              <el-button @click="visible = false">取消</el-button>
              <el-button type="primary" :disabled="!selectedRows.length || hasErrors || submitting" :loading="submitting" @click="openConfirm">确认调整</el-button>
            </div>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="confirmVisible" align-center width="480px" title="确认提交货权调整？" :close-on-click-modal="false" :show-close="!submitting">
        <div class="oa-confirm-summary">
          <p>提交后将立即更新采购单在途数量的货权归属。</p>
          <p>来源采购单：<strong>BDT20260806-1</strong></p>
          <p>调整明细：<strong>{{ selectedRows.length }} 个 SKU，共 {{ totalQuantity }} pcs</strong></p>
          <p>调入货权：<strong>{{ targetSummary }}</strong></p>
          <p v-if="simulateFailure" class="oa-confirm-warn">已开启“模拟提交失败”，本次提交将返回失败用于验收。</p>
        </div>
        <template #footer>
          <el-button :disabled="submitting" @click="confirmVisible = false">返回修改</el-button>
          <el-button type="primary" :loading="submitting" @click="submitConfirmed">确认提交</el-button>
        </template>
      </el-dialog>
    `,
    setup() {
      const visible = ref(false);
      const confirmVisible = ref(false);
      const submitting = ref(false);
      const submitError = ref('');
      const simulateFailure = ref(false);
      const searchText = ref(defaultSearchText);
      const filteredRows = ref(skuRows.slice(0, 4));
      const unmatched = ref([]);
      const selected = ref([]);
      const batchPlatform = ref('');
      const batchStore = ref('');
      const resultTable = ref(null);
      const formMap = reactive({});
      const platforms = ['Amazon', 'Shopify', 'eBay'];
      const sellerSkuOptions = ['AMZ-US-34001001110', 'AMZ-US-34001001128', 'ASIN-B0D7K92M6Q', 'EBAY-ARCCAP-110'];
      let syncingSelection = false;

      const selectedRows = computed(() => skuRows.filter((row) => selected.value.some((item) => item.id === row.id)));
      const totalQuantity = computed(() => selectedRows.value.reduce((sum, row) => sum + (Number(formFor(row).quantity) || 0), 0));
      const invalidRowCount = computed(() => selectedRows.value.filter((row) => validateRow(row).length).length);
      const hasErrors = computed(() => invalidRowCount.value > 0);
      const targetSummary = computed(() => [...new Set(selectedRows.value.map((row) => (formFor(row).platform || '未选择') + ' / ' + (formFor(row).store || '未选择')))].join('、'));

      function storesFor(platform) { return storesByPlatform[platform] || []; }
      function isSelectable(row) { return row.transit > 0; }
      function statusFor(row) { return row.transit ? { label: '可调整', type: 'success' } : { label: '无在途数量', type: 'info' }; }
      function parseCodes(value) { return [...new Set(value.trim().split(/[\s,，;；]+/).filter(Boolean))]; }
      function formFor(row) {
        if (!formMap[row.id]) formMap[row.id] = { platform: row.targetPlatform, store: row.targetStore, targetSku: row.targetSku, quantity: row.transit };
        return formMap[row.id];
      }
      function validateRow(row) {
        const form = formFor(row);
        const errors = [];
        if (!form.platform) errors.push('请选择平台');
        if (!form.store) errors.push('请选择店铺');
        if (!form.targetSku) errors.push('请补充 SellerSKU / ASIN');
        const qty = Number(form.quantity);
        if (!Number.isInteger(qty) || qty <= 0 || qty > row.transit) errors.push('数量需为 1-' + row.transit + ' 的整数');
        return errors;
      }
      function onRowPlatformChange(row) { formFor(row).store = ''; }
      // 是否存在未提交内容：用于关闭时的二次确认
      function hasContent() {
        return !!(searchText.value.trim() || selected.value.length || batchPlatform.value || batchStore.value);
      }

      async function syncTableSelection() {
        await nextTick();
        if (!resultTable.value) return;
        syncingSelection = true;
        resultTable.value.clearSelection();
        filteredRows.value.forEach((row) => {
          if (selected.value.some((item) => item.id === row.id)) resultTable.value.toggleRowSelection(row, true);
        });
        await nextTick();
        syncingSelection = false;
      }
      function onResultSelectionChange(visibleSelection) {
        if (syncingSelection) return;
        const visibleIds = new Set(filteredRows.value.map((row) => row.id));
        selected.value = [...selected.value.filter((row) => !visibleIds.has(row.id)), ...visibleSelection];
      }
      async function runSearch() {
        const codes = parseCodes(searchText.value);
        // 空输入：不发起搜索，提示用户
        if (!codes.length) {
          filteredRows.value = [];
          unmatched.value = [];
          ElMessage.warning('请输入 SKU、SellerSKU 或 ASIN');
          return;
        }
        const normalized = codes.map((code) => code.toLowerCase());
        filteredRows.value = skuRows.filter((row) => normalized.some((code) => [row.sku, row.sellerSku, row.asin].some((value) => (value || '').toLowerCase().includes(code))));
        const matchedValues = filteredRows.value.flatMap((row) => [row.sku, row.sellerSku, row.asin].map((value) => (value || '').toLowerCase()));
        unmatched.value = codes.filter((code) => !matchedValues.some((value) => value.includes(code.toLowerCase())));
        await syncTableSelection();
        // 空结果：错误提示；部分未匹配：在表格上方 warning 中展示
        if (!filteredRows.value.length) ElMessage.error('未找到匹配的 SKU，请检查关键词');
        else ElMessage.success('已匹配 ' + filteredRows.value.length + ' 条 SKU');
      }
      function clearSearch() { searchText.value = ''; filteredRows.value = []; unmatched.value = []; syncTableSelection(); ElMessage.info('已清空搜索关键词，调整明细保留'); }
      function selectAllResults() { selected.value = [...selected.value.filter((item) => !filteredRows.value.some((row) => row.id === item.id)), ...filteredRows.value.filter(isSelectable)]; syncTableSelection(); }
      function clearSelected() { selected.value = []; syncTableSelection(); }
      function applyBatch() {
        if (!selectedRows.value.length) { ElMessage.warning('请先在搜索结果中勾选 SKU'); return; }
        if (!batchPlatform.value || !batchStore.value) { ElMessage.error('请先选择调入平台和调入店铺'); return; }
        selectedRows.value.forEach((row) => { formFor(row).platform = batchPlatform.value; formFor(row).store = batchStore.value; });
        ElMessage.success('已应用到 ' + selectedRows.value.length + ' 个 SKU');
      }
      function fillMaxQuantity() {
        if (!selectedRows.value.length) { ElMessage.warning('请先勾选 SKU'); return; }
        selectedRows.value.forEach((row) => { formFor(row).quantity = row.transit; });
        ElMessage.success('已按可调整数填充数量');
      }
      function removeRow(row) { selected.value = selected.value.filter((item) => item.id !== row.id); syncTableSelection(); }
      function resetDialog() {
        selected.value = [];
        filteredRows.value = skuRows.slice(0, 4);
        unmatched.value = [];
        searchText.value = defaultSearchText;
        batchPlatform.value = '';
        batchStore.value = '';
        submitError.value = '';
        Object.keys(formMap).forEach((key) => delete formMap[key]);
        syncTableSelection();
        ElMessage.success('已重置本次调整内容');
      }
      // 关闭弹窗前的未保存确认：满足 PRD“关闭未保存二次确认”
      function onBeforeClose(done) {
        if (submitting.value) { ElMessage.warning('正在提交，请勿关闭'); return; }
        if (!hasContent()) { done(); return; }
        ElMessageBox.confirm('当前填写内容不会保存，确认关闭吗？', '放弃未保存内容？', {
          confirmButtonText: '确认关闭',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => done()).catch(() => {});
      }
      function openConfirm() {
        if (!selectedRows.value.length || hasErrors.value || submitting.value) return;
        submitError.value = '';
        confirmVisible.value = true;
      }
      async function submitConfirmed() {
        if (submitting.value) return; // 防重复提交
        submitting.value = true;
        submitError.value = '';
        // 模拟后端异步处理
        await new Promise((resolve) => setTimeout(resolve, 900));
        if (simulateFailure.value) {
          // 失败：保留弹窗和已填写内容，展示原因，允许重试
          submitting.value = false;
          confirmVisible.value = false;
          submitError.value = '提交失败：服务异常，请稍后修改后重试';
          ElMessage.error(submitError.value);
          return;
        }
        // 成功：关闭弹窗、提示、刷新采购单（此处 toast 复用页面级 toast）
        submitting.value = false;
        confirmVisible.value = false;
        visible.value = false;
        ElMessage.success('货权调整提交成功，已生成调整记录');
        resetDialogSilent();
      }
      function resetDialogSilent() {
        selected.value = [];
        filteredRows.value = skuRows.slice(0, 4);
        unmatched.value = [];
        searchText.value = defaultSearchText;
        batchPlatform.value = '';
        batchStore.value = '';
        submitError.value = '';
        Object.keys(formMap).forEach((key) => delete formMap[key]);
      }
      function openDialog() {
        // 每次打开都重新初始化，不残留上一次未提交数据
        resetDialogSilent();
        visible.value = true;
        nextTick(runSearch);
      }

      onMounted(() => {
        ['openOwnershipAdjustment', 'openOwnershipBottom'].forEach((id) => {
          const trigger = document.getElementById(id);
          if (trigger) trigger.addEventListener('click', openDialog);
        });
      });

      return {
        visible, confirmVisible, submitting, submitError, simulateFailure,
        searchText, filteredRows, unmatched, selectedRows, batchPlatform, batchStore,
        platforms, sellerSkuOptions, resultTable, totalQuantity, invalidRowCount, hasErrors, targetSummary,
        storesFor, isSelectable, statusFor, formFor, validateRow, onRowPlatformChange,
        onResultSelectionChange, runSearch, clearSearch, selectAllResults, clearSelected,
        applyBatch, fillMaxQuantity, removeRow, resetDialog, onBeforeClose, openConfirm, submitConfirmed
      };
    }
  }).use(window.ElementPlus).mount('#ownership-adjustment-app');
})();
