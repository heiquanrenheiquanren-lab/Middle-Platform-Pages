(function () {
  const { createApp, ref, reactive, computed, onMounted } = window.Vue;
  const { ElMessage, ElMessageBox } = window.ElementPlus;
  const rows = [
    ['110','34001001110','10410112110','B0D7K91A1C','焊接帽子迷彩 2-白色','BDT20260806-1','LX-20260806-001','CGJH2026080106','TRK-US-001','B端团队',240],
    ['128','34001001128','10410112128','B0D7K91B2D','焊接帽子黑色','BDT20260806-1','LX-20260806-001','CGJH2026080107','TRK-US-001','B端团队',180],
    ['206','34001001206','10410112206','B0D7K92M6Q','焊接帽子蓝色','BDT20260806-1','LX-20260806-001','CGJH2026080108','TRK-US-001','B端团队',120],
    ['316','34001001316','10410112316','B0D7K93N7R','焊接手套加厚款','BDT20260806-2','LX-20260806-002','CGJH2026080112','TRK-US-002','亚马逊北美团队',50],
    ['401','34001001401','10410112401','B0D7K94O8S','焊接护目镜防雾款','BDT20260806-2','LX-20260806-002','CGJH2026080113','TRK-US-002','独立站团队',80],
    ['402','34001001402','10410112402','B0D7K94O9T','焊接护目镜透明款','BDT20260806-2','LX-20260806-002','CGJH2026080114','TRK-US-002','独立站团队',60],
    ['501','34001001501','10410112501','B0D7K95P0U','焊接面罩自动变光','BDT20260806-3','LX-20260806-003','CGJH2026080120','TRK-CA-003','亚马逊北美团队',150],
    ['502','34001001502','10410112502','B0D7K95P1V','焊接面罩手持式','BDT20260806-3','LX-20260806-003','CGJH2026080121','TRK-CA-003','亚马逊北美团队',100],
    ['601','34001001601','10410112601','B0D7K96Q2W','电焊钳 300A','BDT20260806-4','LX-20260806-004','CGJH2026080124','TRK-UK-004','eBay团队',200]
  ].map(x => ({id:'sku-'+x[0],sku:x[1],sellerSku:x[2],asin:x[3],name:x[4],purchaseOrderNo:x[5],purchaseOrderNoLx:x[6],purchasePlanNo:x[7],trackingNo:x[8],team:x[9],purchase:x[10],transit:x[10]}));
  const initialRecords = [
    ['BDT20260806-1','CGJH2026080106','34001001110','焊接帽子迷彩 2-白色','B端团队','亚马逊北美团队',40,'Admin','2026-10-23 10:18:36'],
    ['BDT20260806-2','CGJH2026080113','34001001401','焊接护目镜防雾款','独立站团队','Temu团队',30,'张敏','2026-10-22 16:42:08'],
    ['BDT20260806-3','CGJH2026080120','34001001501','焊接面罩自动变光','亚马逊北美团队','公共库存',50,'李晨','2026-10-22 15:30:20'],
    ['BDT20260806-4','CGJH2026080124','34001001601','电焊钳 300A','eBay团队','独立站团队',80,'王磊','2026-10-21 11:05:44']
  ].map((x,i)=>({id:'record-'+i,purchaseOrderNo:x[0],purchasePlanNo:x[1],sku:x[2],name:x[3],sourceTeam:x[4],targetTeam:x[5],quantity:x[6],operator:x[7],adjustedAt:x[8]}));

  createApp({
    template:`
    <el-dialog v-model="visible" align-center width="1380px" :class="['ownership-adjustment-dialog', {'is-records':tab==='records'}]" :close-on-click-modal="false" :before-close="beforeClose">
      <template #header><div class="oa-dialog-title"><h1>采购单（在途数量）货权调整</h1></div></template>
      <div class="oa-tabs"><button :class="{active:tab==='adjust'}" @click="tab='adjust'">在途货权调整</button><button :class="{active:tab==='records'}" @click="tab='records'">调整记录</button></div>
      <template v-if="tab==='adjust'">
        <section class="oa-section">
          <div class="oa-query-bar"><el-input v-model="orderText" clearable placeholder="中台采购单号"/><el-input v-model="searchText" clearable placeholder="SKU，支持输入多个"/><el-select v-model="searchTeams" multiple collapse-tags collapse-tags-tooltip clearable placeholder="团队"><el-option v-for="x in teams" :key="x" :label="x" :value="x"/></el-select><el-button type="primary" @click="search">查询</el-button><el-button @click="clearSearch">重置</el-button></div>
        </section>
        <section class="oa-section oa-target-section">
          <div class="oa-section-head">
            <div class="oa-section-title"><i class="oa-title-bar"></i>调整明细</div>
            <div class="oa-batch-actions">
              <el-select v-model="batchTeam" filterable clearable placeholder="批量选择团队" style="width:220px"><el-option v-for="x in teams" :key="x" :label="x" :value="x"/></el-select>
              <el-button type="primary" plain @click="applyBatch">应用到勾选 SKU</el-button>
              <el-button @click="fillMax">按可调整数填充勾选行</el-button>
            </div>
          </div>
          <el-table :data="resultRows" row-key="id" max-height="380" empty-text="暂无可调整的在途 SKU，请先输入条件查询" @selection-change="selected=$event">
            <el-table-column type="selection" width="44"/>
            <el-table-column prop="sku" label="SKU" width="98"/>
            <el-table-column label="采购单号" width="116"><template #default="s"><strong>{{s.row.purchaseOrderNo}}</strong><small>领星 {{s.row.purchaseOrderNoLx}}</small></template></el-table-column>
            <el-table-column prop="name" label="品名" min-width="112" show-overflow-tooltip/><el-table-column prop="team" label="来源团队" width="84"/><el-table-column prop="transit" label="在途数量" width="80" align="center"/><el-table-column prop="transit" label="可调整数量" width="88" align="center"/>
            <el-table-column label="调入团队" width="146"><template #default="s"><el-select v-model="form(s.row).team" filterable clearable placeholder="请选择调入团队" style="width:126px"><el-option v-for="x in teams" :key="x" :label="x" :value="x"/></el-select></template></el-table-column>
            <el-table-column label="调入数量" width="96" align="center"><template #default="s"><el-input-number v-model="form(s.row).quantity" :min="1" :max="s.row.transit" controls-position="right" style="width:78px"/></el-table-column><el-table-column label="操作" width="56" align="center"><template #default="s"><el-button link type="danger" @click="remove(s.row)">移除</el-button></template></el-table-column>
          </el-table>
        </section>
      </template>
      <section v-else class="oa-records-section">
        <div class="oa-record-filters"><el-input v-model="recordOrder" clearable placeholder="中台采购单号"/><el-input v-model="recordSku" clearable placeholder="SKU，支持输入多个"/><el-select v-model="recordSourceTeams" multiple collapse-tags collapse-tags-tooltip clearable placeholder="调出团队"><el-option v-for="x in teams" :key="x" :label="x" :value="x"/></el-select><el-select v-model="recordTargetTeams" multiple collapse-tags collapse-tags-tooltip clearable placeholder="调入团队"><el-option v-for="x in teams" :key="x" :label="x" :value="x"/></el-select><el-button type="primary" @click="queryRecords">查询</el-button><el-button @click="resetRecords">重置</el-button></div>
        <div class="oa-record-caption"><div class="oa-section-title"><i class="oa-title-bar"></i>调整记录</div></div>
        <el-table :data="pagedRecords" max-height="500" empty-text="暂无调整记录"><el-table-column prop="purchaseOrderNo" label="采购单号" width="155" fixed="left"/><el-table-column prop="purchasePlanNo" label="采购计划" width="155"/><el-table-column prop="sku" label="SKU" width="130"/><el-table-column prop="name" label="品名" min-width="160" show-overflow-tooltip/><el-table-column prop="sourceTeam" label="来源团队" width="140"/><el-table-column label="调整方向" width="70" align="center"><template #default><span class="oa-direction">→</span></template></el-table-column><el-table-column prop="targetTeam" label="调入团队" width="140"/><el-table-column prop="quantity" label="调整数量" width="95" align="right"/><el-table-column prop="operator" label="操作人" width="90"/><el-table-column prop="adjustedAt" label="调整时间" width="165"/></el-table>
        <div class="oa-record-pagination"><span>共 {{filteredRecords.length}} 条记录</span><el-pagination v-model:current-page="page" :page-size="8" layout="prev, pager, next" :total="filteredRecords.length"/></div>
      </section>
      <template v-if="tab==='adjust'" #footer><div class="oa-dialog-footer"><div class="oa-footer-summary"><span class="oa-stat">已选 <em>{{resultRows.length}}</em> 个 SKU</span><span class="oa-stat">计划调入总数 <em>{{total}}</em> pcs</span></div><div class="oa-footer-actions"><el-button @click="visible=false">取消</el-button><el-button type="primary" :disabled="!resultRows.length" @click="confirm">确认调整</el-button></div></div></template>
    </el-dialog>
    <el-dialog v-model="confirmVisible" align-center width="480px" title="确认提交货权调整？" :close-on-click-modal="false"><div class="oa-confirm-summary"><p>提交后将立即更新采购单在途数量的团队归属。</p><p>调整明细：<strong>{{resultRows.length}} 个 SKU，共 {{total}} pcs</strong></p><p>调入团队：<strong>{{targetSummary}}</strong></p></div><template #footer><el-button @click="confirmVisible=false">返回修改</el-button><el-button type="primary" :loading="submitting" @click="submit">确认提交</el-button></template></el-dialog>`,
    setup(){
      const visible=ref(false),tab=ref('adjust'),confirmVisible=ref(false),submitting=ref(false),orderText=ref(''),searchText=ref(''),searchTeams=ref([]),resultRows=ref([]),unmatched=ref([]),selected=ref([]),batchTeam=ref('');
      const forms=reactive({}),teams=[...new Set(['公共库存','Temu团队',...rows.map(x=>x.team)])],records=ref(initialRecords.slice()),recordOrder=ref(''),recordSku=ref(''),recordSourceTeams=ref([]),recordTargetTeams=ref([]),filters=reactive({order:'',skus:[],sourceTeams:[],targetTeams:[]}),page=ref(1);
      const total=computed(()=>resultRows.value.reduce((n,x)=>n+(Number(form(x).quantity)||0),0)),targetSummary=computed(()=>[...new Set(resultRows.value.map(x=>form(x).team||'未选择'))].join('、'));
      const filteredRecords=computed(()=>records.value.filter(x=>{const matchOrder=!filters.order||x.purchaseOrderNo.toLowerCase().includes(filters.order);const matchSku=!filters.skus.length||filters.skus.some(v=>x.sku.toLowerCase().includes(v));const matchSource=!filters.sourceTeams.length||filters.sourceTeams.includes(x.sourceTeam);const matchTarget=!filters.targetTeams.length||filters.targetTeams.includes(x.targetTeam);return matchOrder&&matchSku&&matchSource&&matchTarget;})),pagedRecords=computed(()=>filteredRecords.value.slice((page.value-1)*8,page.value*8));
      function form(r){return forms[r.id]||(forms[r.id]={team:'',quantity:r.transit});}
      function codes(v){return [...new Set(v.trim().split(/[\s,，;；]+/).filter(Boolean))];}
      function search(){let c=codes(searchText.value),q=orderText.value.trim().toLowerCase(),found=rows.filter(x=>x.transit>0);if(q)found=found.filter(x=>x.purchaseOrderNo.toLowerCase().includes(q));if(c.length)found=found.filter(x=>c.some(y=>x.sku.toLowerCase().includes(y.toLowerCase())));if(searchTeams.value.length)found=found.filter(x=>searchTeams.value.includes(x.team));resultRows.value=found;unmatched.value=[];if(!resultRows.value.length)ElMessage.warning('未找到匹配的在途 SKU');}
      function clearSearch(){searchText.value='';orderText.value='';searchTeams.value=[];resultRows.value=[];unmatched.value=[];}
      function applyBatch(){if(!selected.value.length)return ElMessage.warning('请先勾选需要批量设置的 SKU');if(!batchTeam.value)return ElMessage.warning('请先选择调入团队');selected.value.forEach(x=>form(x).team=batchTeam.value);ElMessage.success('已应用到 '+selected.value.length+' 个 SKU');}
      function fillMax(){if(!selected.value.length)return ElMessage.warning('请先勾选需要填充数量的 SKU');selected.value.forEach(x=>form(x).quantity=x.transit);}
      function remove(r){resultRows.value=resultRows.value.filter(x=>x.id!==r.id);delete forms[r.id];}
      function resetAdjust(){resultRows.value=[];unmatched.value=[];selected.value=[];batchTeam.value='';orderText.value='';searchText.value='';searchTeams.value=[];Object.keys(forms).forEach(k=>delete forms[k]);}
      function confirm(){const errors=[];resultRows.value.forEach(r=>{const f=form(r);if(!f.team)errors.push(r.sku+'：请选择调入团队');else if(f.team===r.team)errors.push(r.sku+'：调入团队不能与来源团队相同');if(!Number.isInteger(Number(f.quantity))||f.quantity<1||f.quantity>r.transit)errors.push(r.sku+'：调整数量不正确');});if(errors.length)return ElMessage.error(errors.slice(0,3).join('；'));confirmVisible.value=true;}
      function now(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());}
      async function submit(){submitting.value=true;await new Promise(r=>setTimeout(r,500));const t=now();records.value=[...resultRows.value.map((r,i)=>({id:t+i,purchaseOrderNo:r.purchaseOrderNo,purchasePlanNo:r.purchasePlanNo,sku:r.sku,name:r.name,sourceTeam:r.team,targetTeam:form(r).team,quantity:form(r).quantity,operator:'Admin',adjustedAt:t})),...records.value];submitting.value=false;confirmVisible.value=false;resetAdjust();tab.value='records';ElMessage.success('货权调整成功，已生成调整记录');}
      function queryRecords(){filters.order=recordOrder.value.trim().toLowerCase();filters.skus=codes(recordSku.value).map(v=>v.toLowerCase());filters.sourceTeams=recordSourceTeams.value.slice();filters.targetTeams=recordTargetTeams.value.slice();page.value=1;}
      function resetRecords(){recordOrder.value='';recordSku.value='';recordSourceTeams.value=[];recordTargetTeams.value=[];filters.order='';filters.skus=[];filters.sourceTeams=[];filters.targetTeams=[];page.value=1;}
      function beforeClose(done){if(tab.value==='records'||(!resultRows.value.length&&!orderText.value&&!batchTeam.value))return done();ElMessageBox.confirm('当前填写内容不会保存，确认关闭吗？','放弃未保存内容？',{type:'warning'}).then(done).catch(()=>{});}
      function open(){resetAdjust();resetRecords();tab.value='adjust';visible.value=true;}
      onMounted(()=>['openOwnershipAdjustment','openOwnershipBottom'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('click',open);}));
      return{visible,tab,confirmVisible,submitting,orderText,searchText,searchTeams,resultRows,unmatched,selected,batchTeam,teams,total,targetSummary,recordOrder,recordSku,recordSourceTeams,recordTargetTeams,filteredRecords,pagedRecords,page,form,search,clearSearch,applyBatch,fillMax,remove,resetAdjust,confirm,submit,queryRecords,resetRecords,beforeClose};
    }
  }).use(window.ElementPlus).mount('#ownership-adjustment-app');
})();
