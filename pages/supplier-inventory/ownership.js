(function () {
  const { createApp, ref, reactive, computed } = window.Vue;
  const { ElMessage, ElMessageBox } = window.ElementPlus;

  const skuRows = [
    { id: 'sku-110', sku: '34001001110', sellerSku: '10410112110', asin: '', name: '焊接帽子迷彩2-6 7/8', supplier: '梧州市友盟焊接防护用品有限公司', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_MX', inStock: 0 },
    { id: 'sku-110b', sku: '130US160003', sellerSku: 'AR-ARC160R201201', asin: '', name: 'ARC160（AC-美规）', supplier: '深圳市康仕达科技有限公司', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_MX', inStock: 0 },
    { id: 'sku-110c', sku: '42101000004', sellerSku: '10250100710', asin: '', name: 'TIG焊丝-不锈钢/ER308L-1.6', supplier: '常州市佳士达焊材有限公司', team: 'Jasic团队', platform: 'b2c', store: 'Lowes_arccaptain', inStock: 9 },
    { id: 'sku-110d', sku: '34001001110', sellerSku: '10410112110', asin: '', name: '焊接帽子迷彩2-6 7/8', supplier: '梧州市友盟焊接防护用品有限公司', team: 'B端团队', platform: 'shopify', store: 'B端独立站', inStock: 10 },
    { id: 'sku-110e', sku: 'EE123456', sellerSku: '', asin: '', name: '测试EE123456', supplier: '默认供应商', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_MX', inStock: 0 },
    { id: 'sku-110f', sku: 'FF123456', sellerSku: '', asin: '', name: '测试FF123456', supplier: '默认供应商', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_MX', inStock: 0 },
    { id: 'sku-110g', sku: '140US260008', sellerSku: '10502020706', asin: '', name: 'CUT55 ProLux 等离子切割机', supplier: '深圳市康仕达科技有限公司', team: 'eBay', platform: 'ebay', store: 'arccaptain_official', inStock: 0 },
    { id: 'sku-110h', sku: '51101000004', sellerSku: '10460100310', asin: '', name: '大屏焊帽放大镜片2.0*2', supplier: '江苏奥信光电科技有限公司', team: 'eBay', platform: 'ebay', store: 'arccaptain_official', inStock: 66 },
    { id: 'sku-110i', sku: '51001010025', sellerSku: 'AR-HM-001', asin: '', name: '小屏焊帽-基础款（黑色）', supplier: '常州市佳士达焊材有限公司', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_US', inStock: 0 },
    { id: 'sku-110j', sku: '34001001128', sellerSku: '10410112128', asin: '', name: '焊接帽子黑色', supplier: '梧州市友盟焊接防护用品有限公司', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_US', inStock: 0 },
    { id: 'sku-110k', sku: '34001001206', sellerSku: '10410112206', asin: '', name: '焊接帽子蓝色', supplier: '梧州市友盟焊接防护用品有限公司', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_US', inStock: 0 },
    { id: 'sku-110l', sku: '51001010025', sellerSku: 'AR-HM-001', asin: '', name: '小屏焊帽-基础款（黑色）', supplier: '常州市佳士达焊材有限公司', team: '亚马逊团队', platform: 'amazon', store: 'ARCCAPTAIN_US', inStock: 11 }
  ];

  const storesByPlatform = { Amazon: ['US旗舰店', 'CA旗舰店', 'UK旗舰店'], Shopify: ['B端独立站', 'D端独立站'], eBay: ['ARCCAP', 'JASIC官方店'] };
  const teamByPlatform = { Amazon: '亚马逊团队', Shopify: 'shopify团队', eBay: 'eBay团队' };
  const suppliers = [...new Set(skuRows.map(r => r.supplier))];
  const platforms = ['Amazon', 'Shopify', 'eBay'];
  const sellerSkuOptions = ['AMZ-US-34001001110', 'AMZ-US-34001001128', 'ASIN-B0D7K92M6Q', 'EBAY-ARCCAP-110', 'AMZ-CA-34001001501', 'SHOP-B-34001001401'];
  const teamOptions = [...new Set(['公共库存', ...skuRows.map(r => r.team), ...Object.values(teamByPlatform)])];

  const app = createApp({
    template: `
      <el-dialog v-model="visible" align-center width="1200px" class="ownership-adjustment-dialog" :close-on-click-modal="false" destroy-on-close>
        <template #header>
          <div class="oa-dialog-title"><div><h1>供应商库存货权调整</h1><p>查询 SKU 后，直接在列表中设置调入信息</p></div></div>
        </template>
        <el-alert v-if="submitError" class="oa-submit-error" type="error" :closable="false" show-icon :title="submitError"></el-alert>
        <section class="oa-section">
          <div class="oa-section-head"><div><span class="oa-step">1</span><strong>批量搜索 SKU</strong></div><span>支持 SKU / SellerSKU / ASIN，最多 100 个</span></div>
          <div class="oa-search-row">
            <div class="oa-search-item"><span>供应商</span>
              <el-select v-model="selectedSupplier" clearable placeholder="全部供应商" style="width:220px"><el-option v-for="s in suppliers" :key="s" :label="s" :value="s"></el-option></el-select>
            </div>
          </div>
          <div class="oa-batch-search">
            <el-input v-model="searchText" type="textarea" :rows="3" resize="none" placeholder="输入或粘贴多个 SKU / SellerSKU / ASIN；支持换行、逗号或空格分隔" @keydown.enter.prevent="runSearch"></el-input>
            <div class="oa-search-actions"><el-button type="primary" @click="runSearch">查询</el-button><el-button @click="clearSearch">清空</el-button></div>
          </div>
          <el-alert v-if="unmatched.length" class="oa-alert" type="warning" :closable="false" show-icon>有 {{ unmatched.length }} 个编码未匹配：{{ unmatched.join('、') }}</el-alert>
        </section>
        <section class="oa-section oa-target-section">
          <div class="oa-section-head"><div><span class="oa-step">2</span><strong>设置调入信息</strong></div><span>公共字段批量应用到勾选行</span></div>
          <div class="oa-batch-toolbar" :class="{ 'is-public-target': isPublicTeam(batchTargetTeam) }">
            <div><span>调入团队</span><el-select v-model="batchTargetTeam" filterable clearable placeholder="请选择调入团队" style="width:180px" @change="onBatchTeamChange"><el-option v-for="team in teamOptions" :key="team" :label="team" :value="team"></el-option></el-select></div>
            <div v-if="!isPublicTeam(batchTargetTeam)"><span>调入平台</span><el-select v-model="batchPlatform" filterable clearable :disabled="!batchTargetTeam" placeholder="请先选择调入团队" style="width:180px" @change="batchStore = ''"><el-option v-for="p in platformsForTeam(batchTargetTeam)" :key="p" :label="p" :value="p"></el-option></el-select></div>
            <div v-if="!isPublicTeam(batchTargetTeam)"><span>调入店铺</span><el-select v-model="batchStore" filterable clearable :disabled="!batchPlatform" placeholder="请先选择平台" style="width:210px"><el-option v-for="s in storesFor(batchPlatform)" :key="s" :label="s" :value="s"></el-option></el-select></div>
            <el-button type="primary" plain @click="applyBatch">应用到勾选 SKU</el-button>
            <el-button @click="fillMaxQuantity">按可调整数填充勾选行</el-button>
            <span v-if="isPublicTeam(batchTargetTeam)" class="oa-public-hint">公共库存不绑定平台、店铺和 SellerSKU / ASIN</span>
          </div>
          <el-table v-if="filteredRows.length" :data="filteredRows" row-key="id" border max-height="360" @selection-change="onSelectionChange">
            <el-table-column type="selection" width="52"></el-table-column>
            <el-table-column label="来源 SKU" width="150" fixed="left"><template #default="s"><strong>{{ s.row.sku }}</strong><small>SellerSKU {{ s.row.sellerSku || '—' }}</small></template></el-table-column>
            <el-table-column prop="name" label="品名" width="150"></el-table-column>
            <el-table-column prop="supplier" label="供应商" width="180"></el-table-column>
            <el-table-column label="来源平台/店铺/团队" min-width="180"><template #default="s">{{ s.row.platform }} / {{ s.row.store }} / {{ s.row.team }}</template></el-table-column>
            <el-table-column label="在库量" width="80"><template #default="s">{{ s.row.inStock }}</template></el-table-column>
            <el-table-column label="可调整数" width="90"><template #default="s">{{ s.row.inStock }}</template></el-table-column>
            <el-table-column label="调入团队" width="150"><template #default="s"><el-select v-model="formFor(s.row).targetTeam" filterable clearable placeholder="请选择调入团队" style="width:132px" @change="onRowTeamChange(s.row)"><el-option v-for="team in teamOptions" :key="team" :label="team" :value="team"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入平台" width="140"><template #default="s"><span v-if="isPublicTeam(formFor(s.row).targetTeam)" class="oa-not-applicable">不适用</span><el-select v-else v-model="formFor(s.row).platform" filterable clearable :disabled="!formFor(s.row).targetTeam" placeholder="请先选团队" style="width:120px" @change="onRowPlatformChange(s.row)"><el-option v-for="p in platformsForTeam(formFor(s.row).targetTeam)" :key="p" :label="p" :value="p"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入店铺" width="160"><template #default="s"><span v-if="isPublicTeam(formFor(s.row).targetTeam)" class="oa-not-applicable">不适用</span><el-select v-else v-model="formFor(s.row).store" filterable clearable :disabled="!formFor(s.row).platform" placeholder="请先选平台" style="width:140px"><el-option v-for="st in storesFor(formFor(s.row).platform)" :key="st" :label="st" :value="st"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入SellerSKU/ASIN" min-width="200"><template #default="s"><span v-if="isPublicTeam(formFor(s.row).targetTeam)" class="oa-not-applicable">不适用</span><el-select v-else v-model="formFor(s.row).targetSku" filterable clearable :disabled="!formFor(s.row).store" placeholder="请先选店铺" style="width:100%"><el-option v-for="o in sellerSkuOptions" :key="o" :label="o" :value="o"></el-option></el-select></template></el-table-column>
            <el-table-column label="调入数量" width="110" fixed="right"><template #default="s"><el-input-number v-model="formFor(s.row).quantity" :min="1" :max="s.row.inStock" controls-position="right" style="width:100px"></el-input-number></template></el-table-column>
            <el-table-column label="操作" width="70" fixed="right"><template #default="s"><el-button link type="danger" @click="removeRow(s.row)">移除</el-button></template></el-table-column>
            <template #empty><el-empty description="未找到匹配的SKU" :image-size="55"></el-empty></template>
          </el-table>
          <el-empty v-else description="请输入查询条件后点击查询" :image-size="60" style="padding:32px 0"></el-empty>
        </section>
        <template #footer>
          <div class="oa-dialog-footer">
            <div class="oa-footer-summary">
              <strong>已选 <b>{{ filteredRows.length }}</b> 个 SKU</strong>
              <span>计划调入总数 <b>{{ totalQuantity }}</b> pcs</span>
            </div>
            <div class="oa-footer-actions">
              <el-button @click="resetDialog">重置</el-button>
              <el-button @click="visible = false">取消</el-button>
              <el-button type="primary" :disabled="!filteredRows.length || submitting" :loading="submitting" @click="openConfirm">确认调整</el-button>
            </div>
          </div>
        </template>
      </el-dialog>
    `,
    setup() {
      const visible = ref(false);
      const searchText = ref('');
      const selectedSupplier = ref('');
      const batchTargetTeam = ref('');
      const batchPlatform = ref('');
      const batchStore = ref('');
      const filteredRows = ref([]);
      const selectedRows = ref([]);
      const submitting = ref(false);
      const submitError = ref('');
      const unmatched = ref([]);
      const forms = reactive({});

      function open() {
        visible.value = true;
        searchText.value = '';
        selectedSupplier.value = '';
        batchTargetTeam.value = '';
        batchPlatform.value = '';
        batchStore.value = '';
        filteredRows.value = [];
        selectedRows.value = [];
        submitError.value = '';
        unmatched.value = [];
        Object.keys(forms).forEach(k => delete forms[k]);
      }

      function splitCodes(v) { return [...new Set(v.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))]; }

      function runSearch() {
        const codes = splitCodes(searchText.value);
        if (!codes.length) { ElMessage.warning('请输入至少一个编码'); return; }
        submitError.value = ''; unmatched.value = [];
        const matched = [], seen = new Set();
        codes.forEach(code => {
          const found = skuRows.find(r => {
            const ok = !selectedSupplier.value || r.supplier === selectedSupplier.value;
            return ok && (r.sku.toLowerCase().includes(code) || (r.sellerSku || '').toLowerCase().includes(code) || (r.asin || '').toLowerCase().includes(code));
          });
          if (found && !seen.has(found.id)) { matched.push(found); seen.add(found.id); }
          else if (!found) unmatched.value.push(code);
        });
        filteredRows.value = matched.map(r => ({ ...r }));
        filteredRows.value.forEach(r => { forms[r.id] = { targetTeam: '', platform: '', store: '', targetSku: '', quantity: r.inStock }; });
        ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条结果`);
      }

      function clearSearch() {
        searchText.value = ''; selectedSupplier.value = ''; filteredRows.value = []; selectedRows.value = []; submitError.value = ''; unmatched.value = [];
      }

      function onSelectionChange(rows) { selectedRows.value = rows; }
      function formFor(row) { return forms[row.id]; }
      function storesFor(p) { return storesByPlatform[p] || []; }
      function isPublicTeam(team) { return team === '公共库存'; }
      function platformsForTeam(team) { return isPublicTeam(team) ? [] : platforms; }
      function onRowTeamChange(row) {
        const form = formFor(row);
        form.platform = '';
        form.store = '';
        form.targetSku = '';
      }
      function onRowPlatformChange(row) {
        const form = formFor(row);
        form.store = '';
        form.targetSku = '';
      }
      function onBatchTeamChange() {
        batchPlatform.value = '';
        batchStore.value = '';
      }

      function applyBatch() {
        if (!batchTargetTeam.value) { ElMessage.warning('请先选择调入团队'); return; }
        if (!isPublicTeam(batchTargetTeam.value) && !batchPlatform.value) { ElMessage.warning('请先选择调入平台'); return; }
        if (!isPublicTeam(batchTargetTeam.value) && !batchStore.value) { ElMessage.warning('请先选择调入店铺'); return; }
        const targets = selectedRows.value.length ? selectedRows.value : filteredRows.value;
        targets.forEach(r => {
          const f = formFor(r);
          const destinationChanged = f.targetTeam !== batchTargetTeam.value || f.platform !== batchPlatform.value || f.store !== batchStore.value;
          f.targetTeam = batchTargetTeam.value;
          f.platform = isPublicTeam(batchTargetTeam.value) ? '' : batchPlatform.value;
          f.store = isPublicTeam(batchTargetTeam.value) ? '' : batchStore.value;
          if (isPublicTeam(batchTargetTeam.value) || destinationChanged) f.targetSku = '';
        });
        ElMessage.success(`已应用到 ${targets.length} 个 SKU`);
      }

      function fillMaxQuantity() {
        const targets = selectedRows.value.length ? selectedRows.value : filteredRows.value;
        targets.forEach(r => { formFor(r).quantity = r.inStock; });
        ElMessage.success(`已填充 ${targets.length} 个 SKU`);
      }

      function removeRow(row) {
        const i = filteredRows.value.findIndex(r => r.id === row.id);
        if (i >= 0) filteredRows.value.splice(i, 1);
        delete forms[row.id];
      }

      const totalQuantity = computed(() => filteredRows.value.reduce((s, r) => s + (formFor(r).quantity || 0), 0));
      const targetSummary = computed(() => [...new Set(filteredRows.value.map(r => {
        const f = formFor(r);
        if (isPublicTeam(f.targetTeam)) return '公共库存';
        return [f.targetTeam || '未选择', f.platform || '未选择', f.store || '未选择', f.targetSku || '未选择'].join(' / ');
      }))].join('、'));

      async function openConfirm() {
        submitError.value = '';
        const errors = [];
        filteredRows.value.forEach(r => {
          const f = formFor(r);
          if (!f.targetTeam) errors.push(`SKU ${r.sku}：请选择调入团队`);
          if (f.targetTeam === r.team) errors.push(`SKU ${r.sku}：调入团队不能与来源团队相同`);
          if (!isPublicTeam(f.targetTeam)) {
            if (!f.platform) errors.push(`SKU ${r.sku}：请选择调入平台`);
            if (!f.store) errors.push(`SKU ${r.sku}：请选择调入店铺`);
            if (!f.targetSku) errors.push(`SKU ${r.sku}：请选择调入SellerSKU/ASIN`);
          }
          if (!f.quantity || f.quantity < 1) errors.push(`SKU ${r.sku}：调入数量必须大于0`);
          if (f.quantity > r.inStock) errors.push(`SKU ${r.sku}：调入数量超过在库量${r.inStock}`);
        });
        if (errors.length) { submitError.value = errors.join('；'); ElMessage.error('校验未通过'); return; }
        try {
          await ElMessageBox.confirm(`确认调整 ${filteredRows.value.length} 个SKU的货权？<br>计划调入总数：<b>${totalQuantity.value}</b> pcs<br>调入货权：<b>${targetSummary.value}</b>`, '确认调整', { type: 'warning', dangerouslyUseHTMLString: true });
          submitting.value = true;
          setTimeout(() => { submitting.value = false; ElMessage.success('货权调整成功！'); visible.value = false; }, 800);
        } catch (e) {}
      }

      function resetDialog() {
        searchText.value = ''; selectedSupplier.value = ''; batchTargetTeam.value = ''; batchPlatform.value = ''; batchStore.value = '';
        filteredRows.value = []; selectedRows.value = []; submitError.value = ''; unmatched.value = [];
        Object.keys(forms).forEach(k => delete forms[k]);
      }

      // Expose open() globally
      window.__openOwnershipAdjustment = open;

      return {
        visible, searchText, selectedSupplier, suppliers, batchTargetTeam, batchPlatform, batchStore,
        filteredRows, submitting, submitError, unmatched, totalQuantity,
        platforms, teamOptions, sellerSkuOptions,
        runSearch, clearSearch, onSelectionChange, formFor, storesFor, platformsForTeam, isPublicTeam,
        onRowTeamChange, onRowPlatformChange, onBatchTeamChange, applyBatch, fillMaxQuantity, removeRow,
        openConfirm, resetDialog
      };
    }
  });

  app.use(window.ElementPlus).mount('#ownership-adjustment-app');

  // Bind the button click
  const bindClick = () => {
    const btn = document.getElementById('openOwnershipAdjustment');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.__openOwnershipAdjustment) window.__openOwnershipAdjustment();
      });
    } else {
      setTimeout(bindClick, 100);
    }
  };
  bindClick();
})();
