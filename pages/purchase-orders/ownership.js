(function () {
  const { createApp, ref, reactive, computed, onMounted } = window.Vue;
  const { ElMessage, ElMessageBox } = window.ElementPlus;

  // 演示数据：12 个 SKU，覆盖多个采购单号、多平台店铺/团队、匹配 / 未匹配等场景
  const skuRows = [
    { id: 'sku-110', sku: '34001001110', sellerSku: '10410112110', asin: 'B0D7K91A1C', name: '焊接帽子迷彩 2-…', purchaseOrderNo: 'BDT20260806-1', purchaseOrderNoLx: 'LX-20260806-001', trackingNo: 'TRK-US-001', team: 'B端团队', purchase: 240, transit: 240, targetPlatform: 'Amazon', targetStore: 'US旗舰店', targetSku: 'AMZ-US-34001001110' },
    { id: 'sku-128', sku: '34001001128', sellerSku: '10410112128', asin: 'B0D7K91B2D', name: '焊接帽子黑色', purchaseOrderNo: 'BDT20260806-1', purchaseOrderNoLx: 'LX-20260806-001', trackingNo: 'TRK-US-001', team: 'B端团队', purchase: 180, transit: 180, targetPlatform: 'Amazon', targetStore: 'US旗舰店', targetSku: '' },
    { id: 'sku-206', sku: '34001001206', sellerSku: '10410112206', asin: 'B0D7K92M6Q', name: '焊接帽子蓝色', purchaseOrderNo: 'BDT20260806-1', purchaseOrderNoLx: 'LX-20260806-001', trackingNo: 'TRK-US-001', team: 'B端团队', purchase: 120, transit: 120, targetPlatform: 'Amazon', targetStore: 'US旗舰店', targetSku: 'ASIN-B0D7K92M6Q' },
    { id: 'sku-316', sku: '34001001316', sellerSku: '10410112316', asin: 'B0D7K93N7R', name: '焊接手套加厚款', purchaseOrderNo: 'BDT20260806-2', purchaseOrderNoLx: 'LX-20260806-002', trackingNo: 'TRK-US-002', team: '亚马逊北美团队', purchase: 50, transit: 50, targetPlatform: '', targetStore: '', targetSku: '' },
    { id: 'sku-401', sku: '34001001401', sellerSku: '10410112401', asin: 'B0D7K94O8S', name: '焊接护目镜防雾款', purchaseOrderNo: 'BDT20260806-2', purchaseOrderNoLx: 'LX-20260806-002', trackingNo: 'TRK-US-002', team: '独立站团队', purchase: 80, transit: 80, targetPlatform: 'Shopify', targetStore: 'B端独立站', targetSku: 'SHOP-B-34001001401' },
    { id: 'sku-402', sku: '34001001402', sellerSku: '10410112402', asin: 'B0D7K94O9T', name: '焊接护目镜透明款', purchaseOrderNo: 'BDT20260806-2', purchaseOrderNoLx: 'LX-20260806-002', trackingNo: 'TRK-US-002', team: '独立站团队', purchase: 60, transit: 60, targetPlatform: 'Shopify', targetStore: 'B端独立站', targetSku: '' },
    { id: 'sku-501', sku: '34001001501', sellerSku: '10410112501', asin: 'B0D7K95P0U', name: '焊接面罩自动变光', purchaseOrderNo: 'BDT20260806-3', purchaseOrderNoLx: 'LX-20260806-003', trackingNo: 'TRK-CA-003', team: '亚马逊北美团队', purchase: 150, transit: 150, targetPlatform: 'Amazon', targetStore: 'CA旗舰店', targetSku: 'AMZ-CA-34001001501' },
    { id: 'sku-502', sku: '34001001502', sellerSku: '10410112502', asin: 'B0D7K95P1V', name: '焊接面罩手持式', purchaseOrderNo: 'BDT20260806-3', purchaseOrderNoLx: 'LX-20260806-003', trackingNo: 'TRK-CA-003', team: '亚马逊北美团队', purchase: 100, transit: 100, targetPlatform: 'Amazon', targetStore: 'CA旗舰店', targetSku: '' },
    { id: 'sku-601', sku: '34001001601', sellerSku: '10410112601', asin: 'B0D7K96Q2W', name: '电焊钳 300A', purchaseOrderNo: 'BDT20260806-4', purchaseOrderNoLx: 'LX-20260806-004', trackingNo: 'TRK-UK-004', team: 'eBay团队', purchase: 200, transit: 200, targetPlatform: 'eBay', targetStore: 'JASIC官方店', targetSku: 'EBAY-JASIC-601' },
    { id: 'sku-602', sku: '34001001602', sellerSku: '10410112602', asin: 'B0D7K96Q3X', name: '电焊钳 500A', purchaseOrderNo: 'BDT20260806-4', purchaseOrderNoLx: 'LX-20260806-004', trackingNo: 'TRK-UK-004', team: 'eBay团队', purchase: 120, transit: 120, targetPlatform: 'eBay', targetStore: 'JASIC官方店', targetSku: '' },
    { id: 'sku-701', sku: '34001001701', sellerSku: '10410112701', asin: 'B0D7K97R4Y', name: '焊接电缆 10m', purchaseOrderNo: 'BDT20260806-5', purchaseOrderNoLx: 'LX-20260806-005', trackingNo: 'TRK-DE-005', team: '亚马逊欧洲团队', purchase: 90, transit: 90, targetPlatform: 'Amazon', targetStore: 'UK旗舰店', targetSku: 'AMZ-UK-34001001701' },
    { id: 'sku-999', sku: '34001001999', sellerSku: '10410119999', asin: '', name: '焊接手套基础款', purchaseOrderNo: 'BDT20260806-5', purchaseOrderNoLx: 'LX-20260806-005', trackingNo: 'TRK-DE-005', team: '亚马逊欧洲团队', purchase: 30, transit: 0, targetPlatform: '', targetStore: '', targetSku: '' }
  ];

  const storesByPlatform = {
    Amazon: ['US旗舰店', 'CA旗舰店', 'UK旗舰店'],
    Shopify: ['B端独立站', 'D端独立站'],
    eBay: ['ARCCAP', 'JASIC官方店']
  };

  const orderSearchTypes = [
    { key: 'ec', label: '采购单号（易仓）' },
    { key: 'lx', label: '采购单号（领星）' },
    { key: 'track', label: '采购跟踪号' }
  ];

  const defaultSearchText = '34001001110\n34001001128\nB0D7K92M6Q';

  createApp({
    template: `
      <el-dialog v-model="visible" align-center width="1250px" class="ownership-adjustment-dialog" :close-on-click-modal="false" :before-close="onBeforeClose" destroy-on-close>
        <template #header>
          <div class="oa-dialog-title"><div><h1>采购单（在途数量）货权调整</h1><p>查询 SKU 后，直接在列表中设置调入信息</p></div></div>
        </template>

        <el-alert v-if="submitError" class="oa-submit-error" type="error" :closable="false" show-icon :title="submitError"></el-alert>

        <section class="oa-section">
          <div class="oa-section-head"><div><span class="oa-step">1</span><strong>批量搜索 SKU</strong></div><span>支持采购单号 / SKU / SellerSKU / ASIN，最多 100 个</span></div>
          <div class="oa-order-search">
            <div><span>采购单号类型</span><el-select v-model="orderSearchType" style="width:180px"><el-option v-for="t in orderSearchTypes" :key="t.key" :label="t.label" :value="t.key"></el-option></el-select></div>
            <div class="oa-order-input"><span>{{ orderSearchLabel }}</span><el-input v-model="orderSearchText" clearable placeholder="请输入采购单号"></el-input></div>
          </div>
          <div class="oa-batch-search">
            <el-input v-model="searchText" type="textarea" :rows="3" resize="none" placeholder="输入或粘贴多个 SKU / SellerSKU / ASIN；支持换行、逗号或空格分隔" @keydown.enter.prevent="runSearch"></el-input>
            <div class="oa-search-actions"><el-button type="primary" @click="runSearch">查询</el-button><el-button @click="clearSearch">清空</el-button></div>
          </div>
          <el-alert v-if="unmatched.length" class="oa-alert" type="warning" :closable="false" show-icon>有 {{ unmatched.length }} 个编码未匹配：{{ unmatched.join('、') }}。未匹配项不会进入调整。</el-alert>
        </section>

        <section class="oa-section oa-target-section">
          <div class="oa-section-head"><div><span class="oa-step">2</span><strong>设置调入信息</strong></div><span>公共字段批量应用到勾选行，特殊 SKU 可逐行修改</span></div>
          <div class="oa-batch-toolbar">
            <div><span>调入平台</span><el-select v-model="batchPlatform" placeholder="请选择平台" style="width:180px" @change="batchStore = ''"><el-option v-for="platform in platforms" :key="platform" :label="platform" :value="platform"></el-option></el-select></div>
            <div><span>调入店铺</span><el-select v-model="batchStore" :disabled="!batchPlatform" placeholder="请先选择平台" style="width:210px"><el-option v-for="store in storesFor(batchPlatform)" :key="store" :label="store" :value="store"></el-option></el-select></div>
            <el-button type="primary" plain @click="applyBatch">应用到勾选 SKU</el-button>
            <el-button @click="fillMaxQuantity">按可调整数填充勾选行</el-button>
          </div>

          <el-table v-if="filteredRows.length" ref="resultTable" :data="filteredRows" row-key="id" border max-height="380" @selection-change="onSelectionChange">
            <el-table-column type="selection" width="52"></el-table-column>
            <el-table-column label="来源 SKU" width="150" fixed="left"><template #default="scope"><strong>{{ scope.row.sku }}</strong><small>SellerSKU {{ scope.row.sellerSku }}</small></template></el-table-column>
            <el-table-column label="采购单号" width="175"><template #default="scope"><div><strong>{{ purchaseOrderText(scope.row).main }}</strong><small>{{ purchaseOrderText(scope.row).sub }}</small></div></template></el-table-column>
            <el-table-column prop="name" label="品名" width="150"></el-table-column>
            <el-table-column label="来源平台 / 店铺 / 团队" min-width="200"><template #default="scope"><div>{{ sourceTeamText(scope.row) }}</div></template></el-table-column>
            <el-table-column label="采购数" width="80"><template #default="scope">{{ scope.row.purchase }}</template></el-table-column>
            <el-table-column label="在途数" width="80"><template #default="scope">{{ scope.row.transit }}</template></el-table-column>
            <el-table-column label="可调整数" width="90"><template #default="scope">{{ scope.row.transit }}</template></el-table-column>
            <el-table-column label="调入平台" width="150"><template #default="scope"><el-select v-model="formFor(scope.row).platform" placeholder="请选择平台" style="width:130px" @change="onRowPlatformChange(scope.row)"><el-option v-for="platform in platforms" :key="platform" :label="platform" :value="platform"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入店铺" width="175"><template #default="scope"><el-select v-model="formFor(scope.row).store" :disabled="!formFor(scope.row).platform" placeholder="请选择店铺" style="width:155px"><el-option v-for="store in storesFor(formFor(scope.row).platform)" :key="store" :label="store" :value="store"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入 SellerSKU / ASIN" min-width="210"><template #default="scope"><el-select v-model="formFor(scope.row).targetSku" filterable allow-create default-first-option placeholder="搜索或输入 SellerSKU / ASIN" style="width:100%"><el-option v-for="option in sellerSkuOptions" :key="option" :label="option" :value="option"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入团队" width="130"><template #default="scope"><span :class="{ 'oa-muted': !formFor(scope.row).platform }">{{ teamFor(formFor(scope.row).platform) }}</span></template></el-table-column>
            <el-table-column label="调入数量" width="125" fixed="right"><template #default="scope"><el-input-number v-model="formFor(scope.row).quantity" :min="1" :max="scope.row.transit" controls-position="right" style="width:105px"></el-input-number></template></el-table-column>
            <el-table-column label="操作" width="70" fixed="right"><template #default="scope"><el-button link type="danger" @click="removeRow(scope.row)">移除</el-button></template></el-table-column>
            <template #empty><el-empty description="未找到匹配的在途 SKU" :image-size="55"></el-empty></template>
          </el-table>
          <el-empty v-else description="请输入查询条件后点击查询" :image-size="60" style="padding:32px 0"></el-empty>
        </section>

        <template #footer>
          <div class="oa-dialog-footer">
            <div class="oa-footer-summary">
              <strong>已选 <b>{{ filteredRows.length }}</b> 个 SKU</strong>
              <span>计划调入总数 <b>{{ totalQuantity }}</b></span>
            </div>
            <div class="oa-footer-actions">
              <el-button @click="resetDialog">重置</el-button>
              <el-button @click="visible = false">取消</el-button>
              <el-button type="primary" :disabled="!filteredRows.length || submitting" :loading="submitting" @click="openConfirm">确认调整</el-button>
            </div>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="confirmVisible" align-center width="480px" title="确认提交货权调整？" :close-on-click-modal="false" :show-close="!submitting">
        <div class="oa-confirm-summary">
          <p>提交后将立即更新采购单在途数量的货权归属。</p>
          <p>调整明细：<strong>{{ filteredRows.length }} 个 SKU，共 {{ totalQuantity }} pcs</strong></p>
          <p>调入货权：<strong>{{ targetSummary }}</strong></p>
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
      const orderSearchType = ref('ec');
      const orderSearchText = ref('');
      const searchText = ref(defaultSearchText);
      const filteredRows = ref([]);
      const unmatched = ref([]);
      const selected = ref([]);
      const batchPlatform = ref('');
      const batchStore = ref('');
      const resultTable = ref(null);
      const formMap = reactive({});
      const platforms = ['Amazon', 'Shopify', 'eBay'];
      // 平台 → 团队映射（系统维护的团队枚举，选平台后自动带出，不可手动编辑）
      const teamByPlatform = {
        Amazon: '亚马逊团队',
        Shopify: 'shopify团队',
        eBay: 'eBay团队'
      };
      const sellerSkuOptions = ['AMZ-US-34001001110', 'AMZ-US-34001001128', 'ASIN-B0D7K92M6Q', 'EBAY-ARCCAP-110', 'AMZ-CA-34001001501', 'AMZ-UK-34001001701', 'SHOP-B-34001001401', 'EBAY-JASIC-601'];

      const orderSearchLabel = computed(() => orderSearchTypes.find((t) => t.key === orderSearchType.value)?.label || '');
      const selectedRows = computed(() => filteredRows.value.filter((row) => selected.value.some((item) => item.id === row.id)));
      const totalQuantity = computed(() => filteredRows.value.reduce((sum, row) => sum + (Number(formFor(row).quantity) || 0), 0));
      const targetSummary = computed(() => [...new Set(filteredRows.value.map((row) => (formFor(row).platform || '未选择') + ' / ' + (formFor(row).store || '未选择') + ' / ' + teamFor(formFor(row).platform)))].join('、'));

      function storesFor(platform) { return storesByPlatform[platform] || []; }
      function teamFor(platform) { return platform ? (teamByPlatform[platform] || '—') : '—'; }
      function parseCodes(value) { return [...new Set(value.trim().split(/[\s,，;；]+/).filter(Boolean))]; }
      function sourceTeamText(row) {
        const parts = [row.targetPlatform || '—', row.targetStore || '—', row.team || '—'];
        return parts.join(' / ');
      }
      function purchaseOrderText(row) {
        if (row.purchaseOrderNoLx) {
          return { main: '领星 ' + row.purchaseOrderNoLx, sub: '采购跟踪 ' + (row.trackingNo || '—') };
        }
        return { main: '易仓 ' + (row.purchaseOrderNo || '—'), sub: '采购跟踪 ' + (row.trackingNo || '—') };
      }
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
      function hasContent() {
        return !!(searchText.value.trim() || orderSearchText.value.trim() || filteredRows.value.length || batchPlatform.value || batchStore.value);
      }

      function onSelectionChange(visibleSelection) { selected.value = visibleSelection; }
      function runSearch() {
        const codes = parseCodes(searchText.value);
        const orderQuery = orderSearchText.value.trim();
        if (!codes.length && !orderQuery) {
          ElMessage.warning('请输入采购单号或 SKU 查询');
          return;
        }
        let rows = skuRows.filter((row) => row.transit > 0);
        if (orderQuery) {
          const lowerOrder = orderQuery.toLowerCase();
          rows = rows.filter((row) => {
            if (orderSearchType.value === 'ec') return (row.purchaseOrderNo || '').toLowerCase().includes(lowerOrder);
            if (orderSearchType.value === 'lx') return (row.purchaseOrderNoLx || '').toLowerCase().includes(lowerOrder);
            return (row.trackingNo || '').toLowerCase().includes(lowerOrder);
          });
        }
        if (codes.length) {
          const normalized = codes.map((code) => code.toLowerCase());
          rows = rows.filter((row) => normalized.some((code) => [row.sku, row.sellerSku, row.asin].some((value) => (value || '').toLowerCase().includes(code))));
        }
        // 保留已存在的行（避免重复添加），新搜索出的行追加到末尾
        const existingIds = new Set(filteredRows.value.map((row) => row.id));
        const newRows = rows.filter((row) => !existingIds.has(row.id));
        filteredRows.value = [...filteredRows.value, ...newRows];
        if (codes.length) {
          const matchedValues = rows.flatMap((row) => [row.sku, row.sellerSku, row.asin].map((value) => (value || '').toLowerCase()));
          unmatched.value = codes.filter((code) => !matchedValues.some((value) => value.includes(code.toLowerCase())));
        } else {
          unmatched.value = [];
        }
        if (!filteredRows.value.length) ElMessage.warning('未找到匹配的在途 SKU');
        else if (newRows.length) ElMessage.success('新增 ' + newRows.length + ' 条 SKU 到调整列表');
      }
      function clearSearch() {
        searchText.value = '';
        orderSearchText.value = '';
        unmatched.value = [];
        ElMessage.info('已清空搜索条件，调整明细保留');
      }
      function applyBatch() {
        const targets = selectedRows.value;
        if (!targets.length) { ElMessage.warning('请先勾选需要批量设置的 SKU'); return; }
        if (!batchPlatform.value || !batchStore.value) { ElMessage.error('请先选择调入平台和调入店铺'); return; }
        targets.forEach((row) => { formFor(row).platform = batchPlatform.value; formFor(row).store = batchStore.value; });
        ElMessage.success('已应用到 ' + targets.length + ' 个 SKU');
      }
      function fillMaxQuantity() {
        const targets = selectedRows.value;
        if (!targets.length) { ElMessage.warning('请先勾选需要填充数量的 SKU'); return; }
        targets.forEach((row) => { formFor(row).quantity = row.transit; });
        ElMessage.success('已按可调整数填充 ' + targets.length + ' 个 SKU');
      }
      function removeRow(row) {
        filteredRows.value = filteredRows.value.filter((item) => item.id !== row.id);
        selected.value = selected.value.filter((item) => item.id !== row.id);
        delete formMap[row.id];
      }
      function resetDialog() {
        filteredRows.value = [];
        unmatched.value = [];
        selected.value = [];
        searchText.value = defaultSearchText;
        orderSearchText.value = '';
        orderSearchType.value = 'ec';
        batchPlatform.value = '';
        batchStore.value = '';
        submitError.value = '';
        Object.keys(formMap).forEach((key) => delete formMap[key]);
        ElMessage.success('已重置本次调整内容');
      }
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
        if (!filteredRows.value.length || submitting.value) return;
        const errors = [];
        filteredRows.value.forEach((row) => {
          const rowErrors = validateRow(row);
          if (rowErrors.length) errors.push(row.sku + '：' + rowErrors.join('、'));
        });
        if (errors.length) {
          ElMessage.error('请补充以下 SKU 信息：' + errors.slice(0, 3).join('；') + (errors.length > 3 ? ' 等' : ''));
          return;
        }
        submitError.value = '';
        confirmVisible.value = true;
      }
      async function submitConfirmed() {
        if (submitting.value) return;
        submitting.value = true;
        submitError.value = '';
        await new Promise((resolve) => setTimeout(resolve, 900));
        submitting.value = false;
        confirmVisible.value = false;
        visible.value = false;
        ElMessage.success('货权调整提交成功，已生成调整记录');
        resetDialogSilent();
      }
      function resetDialogSilent() {
        filteredRows.value = [];
        unmatched.value = [];
        selected.value = [];
        searchText.value = defaultSearchText;
        orderSearchText.value = '';
        orderSearchType.value = 'ec';
        batchPlatform.value = '';
        batchStore.value = '';
        submitError.value = '';
        Object.keys(formMap).forEach((key) => delete formMap[key]);
      }
      function openDialog() {
        resetDialogSilent();
        visible.value = true;
      }

      onMounted(() => {
        ['openOwnershipAdjustment', 'openOwnershipBottom'].forEach((id) => {
          const trigger = document.getElementById(id);
          if (trigger) trigger.addEventListener('click', openDialog);
        });
      });

      return {
        visible, confirmVisible, submitting, submitError,
        orderSearchType, orderSearchText, orderSearchTypes, orderSearchLabel,
        searchText, filteredRows, unmatched, selectedRows, batchPlatform, batchStore,
        platforms, sellerSkuOptions, resultTable, totalQuantity, targetSummary,
        storesFor, teamFor, sourceTeamText, purchaseOrderText, formFor, validateRow, onRowPlatformChange,
        onSelectionChange, runSearch, clearSearch,
        applyBatch, fillMaxQuantity, removeRow, resetDialog, onBeforeClose, openConfirm, submitConfirmed
      };
    }
  }).use(window.ElementPlus).mount('#ownership-adjustment-app');
})();
