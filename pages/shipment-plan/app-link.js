/* 发货计划 v3.2.0：一二级列表（对齐采购单）。
   一级 = 表格式发货计划行（计划号/状态/目的地/物流/货量/日期/备注/创建信息/操作），
   二级 = 计划内 SKU 明细，点击行首箭头展开，灰底分组 + 细边框明细表。 */
const shipWarehouses=['深圳发货仓','东莞发货仓','宁波发货仓','洛杉矶海外仓'];
const destinationWarehouses=['ONT8','LAX9','FTW1','ARCCAP 洛杉矶仓','英国海外仓'];
const firstMiles=['递四方','万邑通','云途物流','美森快船','以星快船'];
const channels=['美国海运普船','美国海运快船','空派专线','欧洲铁路','国际快递'];
const platforms=['Amazon','eBay','B2C','线下订单'];
const countries=['美国','英国','德国','日本','中国'];
const stores=['ARCCAP','Lowes_ar','arccaptain','Amazon US 旗舰店','线下订单'];
const teams=['亚马逊团队','Jasic团队','eBay团队','B端团队','公共库存'];
const creators=['Admin','张敏','李晨','王磊','系统管理员'];
const remarks=['旺季发货计划','客户项目急单','常规补货','海外仓安全库存补充','新品首批发货','等待物流商确认','测试计划，请勿操作',''];
const baseSkus=['140US260008','42101000004','XX123456-1','DD123456','EE123456','FF123456','KK123456','fan-test-sku'];
const icons=['🎒','🧰','▧','📦','🧯','🪖','🌺','🐹'];

/* ===== 计划数据：一级 = 发货计划（同仓/同目的地/同物流），二级 = 计划内 SKU 明细 ===== */
const transportByChannel={'美国海运普船':'海运','美国海运快船':'海运','空派专线':'空运','欧洲铁路':'铁路','国际快递':'快递'};
const typeByDestination={'ONT8':'FBA 仓','LAX9':'FBA 仓','FTW1':'FBA 仓','ARCCAP 洛杉矶仓':'海外仓','英国海外仓':'海外仓'};
const plans=Array.from({length:20},(_,i)=>{
  const channel=channels[i%channels.length];
  const date=String(5+(i%20)).padStart(2,'0');
  const lineCount=[1,3,2,4][i%4];
  return {
    id:i+1,
    plan:`SHP202608${String(5+Math.floor(i/6)).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`,
    status:i<5?'待确认':i<13?'待发货':i<17?'已完成':'已作废',
    updated:`2026-08-${date} ${String(9+(i%8)).padStart(2,'0')}:${String(10+(i%47)).padStart(2,'0')}`,
    creator:creators[i%creators.length],
    remark:remarks[i%remarks.length],
    expectedShip:`2026-08-${String(8+(i%18)).padStart(2,'0')}`,
    expectedArrival:`2026-09-${String(2+(i%24)).padStart(2,'0')}`,
    created:`2026-08-${date}`,
    updatedDate:`2026-08-${date}`,
    shipWarehouse:shipWarehouses[i%shipWarehouses.length],
    destinationWarehouse:destinationWarehouses[i%destinationWarehouses.length],
    destinationType:typeByDestination[destinationWarehouses[i%destinationWarehouses.length]],
    firstMile:firstMiles[i%firstMiles.length],
    channel,
    transport:transportByChannel[channel],
    platform:platforms[i%platforms.length],
    country:countries[i%countries.length],
    lines:Array.from({length:lineCount},(_,li)=>{
      const sku=baseSkus[(i+li)%baseSkus.length];
      return {
        sku,icon:icons[(i+li)%icons.length],
        supplierCode:`SUP-${100000+i*10+li}`,lx:`LX${230000+i*10+li}`,seller:`SELLER-${sku}`,fnsku:`X00${800000+i*10+li}`,asin:`B0${900000+i*10+li}`,
        store:stores[(i+li)%stores.length],team:teams[(i+li)%teams.length],
        boxes:String(8+((i*13+li*29)%36)),
        purchaseNo:`PO2026${727000+i*10+li}`,shippingOrderNo:`SO2026${81000+i*10+li}`,shipmentNo:`FBA2026${52000+i*10+li}`,
        linkedShipments:[]
      };
    })
  };
});

const LINK_SHIPMENT_ENABLED=true;  /* 发货计划侧启用「关联货件」（FBA货件已独立成页） */
const PLAN_OP_SHOW_LOG=false;     /* 本版本暂隐藏操作列“日志”按钮。恢复时改为 true */
const statusDefs=[['全部',null],['待确认','待确认'],['待发货','待发货'],['已完成','已完成'],['已作废','已作废']];
const spStatusClass={'待确认':'pending','待发货':'wait','已完成':'done','已作废':'void'};
const state={codes:[],shipWarehouses:[],destinationWarehouses:[],destinationTypes:[],firstMiles:[],channels:[],transports:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,pageSize:10,selected:new Set(),expanded:new Set(),filtered:[...plans]};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function toast(text,type='success'){
  const el=$('#toast');el.textContent=text;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800);
}
function closeMenus(except){$$('.multi').forEach(m=>{if(m!==except){m.querySelector('[data-menu]').classList.remove('show');m.querySelector('[data-trigger]').classList.remove('open');}});}
document.addEventListener('click',()=>{closeMenus();closeRemarkPopover();});
function initMulti(rootId,items,key,placeholder){
  const root=$(rootId),trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
  const sync=()=>{state[key]=[...menu.querySelectorAll('input:checked')].map(x=>x.value);trigger.textContent=state[key].length?`${state[key].slice(0,2).join('、')}${state[key].length>2?` +${state[key].length-2}`:''}`:placeholder;trigger.classList.toggle('has-value',!!state[key].length);};
  menu.innerHTML=items.map(v=>`<label><input type="checkbox" value="${v}" ${state[key].includes(v)?'checked':''}>${v}</label>`).join('');
  trigger.onclick=e=>{e.stopPropagation();closeMenus(root);menu.classList.toggle('show');trigger.classList.toggle('open',menu.classList.contains('show'));};menu.onclick=e=>e.stopPropagation();menu.onchange=sync;sync();
}
function addCode(raw){raw.split(/[\s,，;；]+/).map(v=>v.trim()).filter(Boolean).forEach(v=>{if(!state.codes.includes(v))state.codes.push(v);});renderCodeTags();}
function renderCodeTags(){const wrap=$('#codeTags');wrap.innerHTML=state.codes.slice(0,2).map((v,i)=>`<span class="chip" title="${v}">${v}<span class="x" data-i="${i}">×</span></span>`).join('')+(state.codes.length>2?`<span class="chip">+${state.codes.length-2}</span>`:'');wrap.querySelectorAll('.x').forEach(x=>x.onclick=e=>{e.stopPropagation();state.codes.splice(Number(x.dataset.i),1);renderCodeTags();});}
$('#codeInput').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addCode(e.target.value);e.target.value='';if(e.key==='Enter')$('#searchBtn').click();}});
$('#codeInput').addEventListener('paste',e=>{const value=e.clipboardData.getData('text');if(/[\s,，;；]/.test(value)){e.preventDefault();addCode(value);}});$('#codeBox').onclick=()=>$('#codeInput').focus();

function splitValues(value){return [...new Set(value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}
function includesAny(value,values){return !values.length||values.some(v=>(value||'').toLowerCase().includes(v));}
function equalsAny(value,values){return !values.length||values.includes(value);}
function statusCount(status){return status===null?plans.length:plans.filter(p=>p.status===status).length;}
function renderTabs(){$('#statusTabs').innerHTML=statusDefs.map(([label,key])=>`<button class="status-tab ${state.status===key?'active':''}" type="button" data-key="${key===null?'__all':key}"><span>${label}</span><em>${statusCount(key)}</em></button>`).join('');$$('.status-tab').forEach(tab=>tab.onclick=()=>{state.status=tab.dataset.key==='__all'?null:tab.dataset.key;state.page=1;applyFilters(false);renderTabs();});}
function dateField(row){return $('#timeType').value==='创建时间'?row.created:$('#timeType').value==='更新时间'?row.updatedDate:$('#timeType').value==='预计发货日期'?row.expectedShip:row.expectedArrival;}
function validateDates(){const start=$('#startDate').value,end=$('#endDate').value;if((start&&!end)||(!start&&end)){toast('请选择完整的时间范围','error');return false;}if(start&&end&&start>end){toast('开始日期不能晚于结束日期','error');return false;}return true;}
function applyFilters(showMessage=true){
  if(!validateDates())return;
  const codeType=$('#codeType').value,planNos=splitValues($('#planNo').value),purchaseNos=splitValues($('#purchaseNo').value),shippingOrderNos=splitValues($('#shippingOrderNo').value),shipmentNos=splitValues($('#shipmentNo').value),remark=$('#remark').value.trim().toLowerCase(),start=$('#startDate').value,end=$('#endDate').value;
  state.filtered=plans.filter(plan=>{
    const codeMatch=plan.lines.some(line=>{const codeMap={'SKU':line.sku,'供应商料号':line.supplierCode,'领星 SKU':line.lx,'SellerSKU':line.seller,'FNSKU':line.fnsku,'ASIN':line.asin};return state.codes.some(code=>(codeMap[codeType]||'').toLowerCase().includes(code.toLowerCase()));});
    return (!state.codes.length||codeMatch)&&includesAny(plan.plan,planNos)&&
      equalsAny(plan.shipWarehouse,state.shipWarehouses)&&equalsAny(plan.destinationWarehouse,state.destinationWarehouses)&&equalsAny(plan.destinationType,state.destinationTypes)&&equalsAny(plan.firstMile,state.firstMiles)&&equalsAny(plan.channel,state.channels)&&equalsAny(plan.transport,state.transports)&&
      equalsAny(plan.platform,state.platforms)&&equalsAny(plan.country,state.countries)&&
      (!state.stores.length||plan.lines.some(line=>state.stores.includes(line.store)))&&
      (!state.teams.length||plan.lines.some(line=>state.teams.includes(line.team)))&&
      equalsAny(plan.creator,state.creators)&&
      (!state.status||plan.status===state.status)&&(!start||dateField(plan)>=start)&&(!end||dateField(plan)<=end)&&
      (!remark||plan.remark.toLowerCase().includes(remark))&&
      (!purchaseNos.length||plan.lines.some(line=>includesAny(line.purchaseNo,purchaseNos)))&&
      (!shippingOrderNos.length||plan.lines.some(line=>includesAny(line.shippingOrderNo,shippingOrderNos)))&&
      (!shipmentNos.length||plan.lines.some(line=>includesAny(line.shipmentNo,shipmentNos)));
  });
  state.page=Math.min(state.page,Math.max(1,Math.ceil(state.filtered.length/state.pageSize)));renderTable();if(showMessage)toast(`查询完成，共 ${state.filtered.length} 张发货计划`);
}
function reset(){
  Object.assign(state,{codes:[],shipWarehouses:[],destinationWarehouses:[],destinationTypes:[],firstMiles:[],channels:[],transports:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,filtered:[...plans]});
  ['#planNo','#remark','#purchaseNo','#shippingOrderNo','#shipmentNo','#startDate','#endDate'].forEach(id=>$(id).value='');$('#codeType').value='SKU';$('#timeType').value='创建时间';
  multiConfigs.forEach(([id,,key,placeholder])=>{const root=$(id);root.querySelectorAll('input').forEach(input=>input.checked=state[key].includes(input.value));const trigger=root.querySelector('[data-trigger]');trigger.textContent=state[key].length?state[key].join('、'):placeholder;trigger.classList.toggle('has-value',!!state[key].length);});
  renderCodeTags();renderTabs();renderTable();toast('已重置查询条件');
}

/* ===== 一二级列表渲染（结构对齐采购单：一级表格式计划行 + 可展开二级 SKU 明细） ===== */
const detailTitles=['SKU','店铺','团队','采购单号','发货单号','货件单号','箱数'];
const detailCols=[220,160,140,180,180,185,80];
const detailColgroup=`<colgroup>${detailCols.map(width=>`<col style="width:${width}px">`).join('')}</colgroup>`;
const totalBoxes=plan=>plan.lines.reduce((sum,line)=>sum+Number(line.boxes||0),0);
const isLinked=plan=>plan.lines.some(line=>line.linkedShipments.length>0);
function stripRow(plan){
  const expanded=state.expanded.has(plan.id);
  const linked=isLinked(plan);
  const canLink=plan.status==='待发货'&&!linked;
  const opCell=linked?`<span class="plan-linked-tag" title="当前计划已关联 FBA 货件，不可作废或生成发货单">已关联货件</span>`:(LINK_SHIPMENT_ENABLED&&canLink?`<button class="link-btn" data-link-plan="${plan.id}" type="button">关联货件</button>`:'');
  const logCell=PLAN_OP_SHOW_LOG?`<button class="link-btn muted-link" data-log-plan="${plan.id}" type="button">日志</button>`:'';
  const detailRow=expanded?`<tr class="sp-detail-row" data-parent-id="${plan.id}"><td colspan="10"><div class="detail-panel"><div class="detail-scroll"><table class="detail-table">${detailColgroup}<thead><tr>${detailTitles.map(title=>`<th>${title}</th>`).join('')}</tr></thead><tbody>${plan.lines.map(line=>`<tr><td><div class="detail-product"><span class="thumb">${line.icon}</span><b>${line.sku}</b></div></td><td>${line.store}</td><td>${line.team}</td><td>${line.purchaseNo}</td><td>${line.shippingOrderNo}</td><td>${line.shipmentNo}</td><td>${line.boxes}</td></tr>`).join('')}</tbody></table></div></div></td></tr>`:'';
  return `<tr class="sp-parent-row ${expanded?'is-expanded':''}" data-id="${plan.id}">
    <td class="check-cell"><input class="row-check" type="checkbox" data-id="${plan.id}" ${state.selected.has(plan.id)?'checked':''} aria-label="选择发货计划 ${plan.plan}"></td>
    <td class="expand-cell"><button class="expand-btn ${expanded?'open':''}" type="button" data-caret="${plan.id}" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'} SKU 明细">⌄</button></td>
    <td class="sp-info-cell"><div class="sp-title"><a class="sp-no" data-id="${plan.id}" title="${expanded?'收起':'展开'} SKU 明细">${plan.plan}</a><span class="status-tag status-${spStatusClass[plan.status]||'wait'}">${plan.status}</span></div><div class="sp-subline">发货仓：${plan.shipWarehouse}</div><div class="sp-subline muted">创建时间：${plan.created}</div></td>
    <td><div class="stack-cell"><span>目的地仓：<b>${plan.destinationWarehouse}</b></span><span>仓类型：${plan.destinationType}</span><span>国家：${plan.country}</span></div></td>
    <td><div class="stack-cell"><span>头程物流商：${plan.firstMile}</span><span>物流渠道：<b>${plan.channel}</b></span><span>运输方式：${plan.transport}</span></div></td>
    <td><div class="stack-cell summary-cell"><span>SKU 数：<b>${plan.lines.length}</b></span><span>箱数合计：<b>${totalBoxes(plan)}</b></span></div></td>
    <td><div class="stack-cell"><span>预计发货：<input class="sp-date" type="date" data-id="${plan.id}" data-field="expectedShip" value="${plan.expectedShip}" aria-label="预计发货日期" title="点击修改预计发货日期"></span><span>预计到货：<input class="sp-date" type="date" data-id="${plan.id}" data-field="expectedArrival" value="${plan.expectedArrival}" aria-label="预计到货日期" title="点击修改预计到货日期"></span></div></td>
    <td class="sp-remark-cell"><div class="sp-remark"><span class="strip-remark-text" title="${plan.remark||'暂无备注'}">${plan.remark||'—'}</span><button class="strip-remark-edit" type="button" data-remark-edit="${plan.id}" aria-label="编辑发货计划 ${plan.plan} 的备注"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9 2.1a1.5 1.5 0 0 1 2.1 2.1l-7.7 7.7-2.8.7.7-2.8 7.7-7.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m9.8 3.2 3 3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button></div></td>
    <td><div class="stack-cell"><span>创建人：${plan.creator}</span><span>更新时间：${plan.updated}</span></div></td>
    <td class="action-cell">${opCell}${logCell}</td>
  </tr>${detailRow}`;
}
function renderTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);
  $('#totalCount').textContent=total;$('#jumpPage').value=state.page;$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;
  $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');$$('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderTable();});
  if(!data.length){$('#tableBody').innerHTML='';$('#empty').hidden=false;syncSummary();return;}
  $('#empty').hidden=true;
  $('#tableBody').innerHTML=data.map(stripRow).join('');
  $$('#tableBody .row-check').forEach(check=>check.onchange=()=>{const id=Number(check.dataset.id);check.checked?state.selected.add(id):state.selected.delete(id);syncSelection();});
  const selectAll=$('#selectAll');
  if(selectAll){selectAll.onchange=e=>{state.filtered.forEach(plan=>e.target.checked?state.selected.add(plan.id):state.selected.delete(plan.id));renderTable();};}
  const expandAll=$('#expandAllBtn');
  if(expandAll){
    const allExpanded=state.filtered.length>0&&state.filtered.every(plan=>state.expanded.has(plan.id));
    expandAll.classList.toggle('open',allExpanded);expandAll.setAttribute('aria-expanded',String(allExpanded));
    const label=allExpanded?'收起全部发货计划':'展开全部发货计划';expandAll.setAttribute('aria-label',label);expandAll.title=label;
    expandAll.onclick=()=>{state.filtered.forEach(plan=>allExpanded?state.expanded.delete(plan.id):state.expanded.add(plan.id));renderTable();};
  }
  const toggleExpand=id=>{state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);renderTable();};
  $$('[data-caret]').forEach(btn=>btn.onclick=()=>toggleExpand(Number(btn.dataset.caret)));
  $$('.sp-no').forEach(el=>el.onclick=()=>toggleExpand(Number(el.dataset.id)));
  $$('.sp-date').forEach(input=>{input.onchange=()=>{const plan=plans.find(p=>p.id===Number(input.dataset.id));if(plan){plan[input.dataset.field]=input.value;toast('日期已保存');}};input.onclick=()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}});
  $$('[data-remark-edit]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const plan=plans.find(p=>p.id===Number(btn.dataset.remarkEdit));if(plan)openRemarkEditor(btn,plan);});
  $$('[data-link-plan]').forEach(btn=>btn.onclick=()=>openPlanLinkShipmentPopover([Number(btn.dataset.linkPlan)]));
  $$('[data-log-plan]').forEach(btn=>btn.onclick=()=>openPlanLogDialog(Number(btn.dataset.logPlan)));
  syncSelection();syncSummary();
}
function syncSelection(){const visible=$$('#tableBody .row-check'),checked=visible.filter(x=>x.checked).length;const selectAll=$('#selectAll');if(!selectAll)return;selectAll.checked=visible.length>0&&checked===visible.length;selectAll.indeterminate=checked>0&&checked<visible.length;}
function syncSummary(){
  const rows=state.filtered,skuCount=new Set(rows.flatMap(plan=>plan.lines.map(line=>line.sku))).size;
  const boxes=rows.reduce((sum,plan)=>sum+totalBoxes(plan),0);
  $('#planSummary').innerHTML=`共 <b>${rows.length}</b> 张 · <b>${skuCount}</b> 个 SKU · 箱数合计 <b>${boxes}</b>`;
}
$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};$('#nextPage').onclick=()=>{const pages=Math.ceil(state.filtered.length/state.pageSize);if(state.page<pages){state.page++;renderTable();}};$('#jumpPage').onchange=e=>{const pages=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(pages,Math.max(1,Number(e.target.value)||1));renderTable();};
$('#searchBtn').onclick=()=>{if($('#codeInput').value.trim()){addCode($('#codeInput').value);$('#codeInput').value='';}state.page=1;applyFilters();};$('#resetBtn').onclick=reset;
$$('#planNo,#remark,#purchaseNo,#shippingOrderNo,#shipmentNo').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter')$('#searchBtn').click();}));$$('#startDate,#endDate').forEach(input=>input.addEventListener('click',()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}));

/* ===== 摘要条备注：铅笔弹层编辑（交互对齐采购计划/损益单） ===== */
let remarkPopover=null;
function closeRemarkPopover(){if(remarkPopover){remarkPopover.remove();remarkPopover=null;}}
function openRemarkEditor(trigger,plan){
  closeRemarkPopover();
  const pop=document.createElement('div');pop.className='remark-popover';
  pop.innerHTML=`<div class="remark-popover-title">编辑发货计划备注｜${plan.plan}</div><textarea maxlength="500" rows="4" placeholder="请输入备注">${plan.remark||''}</textarea><div class="remark-popover-actions"><button class="btn" type="button" data-cancel>取消</button><button class="btn primary" type="button" data-save>确定</button></div>`;
  document.body.appendChild(pop);
  pop.onclick=event=>event.stopPropagation();
  const rect=trigger.getBoundingClientRect();
  pop.style.top=`${rect.bottom+6}px`;pop.style.left=`${Math.max(8,Math.min(rect.left,window.innerWidth-360))}px`;
  pop.querySelector('[data-cancel]').onclick=closeRemarkPopover;
  pop.querySelector('[data-save]').onclick=()=>{plan.remark=pop.querySelector('textarea').value.trim();addPlanLog(plan.id,'更新',`修改发货计划备注：${plan.remark||'（清空）'}`);closeRemarkPopover();renderTable();toast('备注已更新');};
  remarkPopover=pop;pop.querySelector('textarea').focus();
}

let queryExpanded=false;
const queryPanel=$('#queryCard'),queryGrid=$('#queryGrid'),queryExpandBtn=$('#queryExpand');
function setQueryExpandUi(){if(!queryPanel||!queryExpandBtn)return;queryExpandBtn.setAttribute('aria-expanded',String(queryExpanded));queryExpandBtn.querySelector('.query-expand-text').textContent=queryExpanded?'收起':'展开';queryPanel.classList.toggle('query-collapsed',!queryExpanded);}
function initQueryExpand(){queryExpandBtn.onclick=()=>{queryExpanded=!queryExpanded;setQueryExpandUi();};}
const planLogs={};
function addPlanLog(planId,type,content){
  if(!planLogs[planId])planLogs[planId]=[];
  const typeMap={'关联FBA货件':'同步','预关联FBA货件':'同步','解除关联':'取消','创建':'新增','更新':'编辑','审核通过':'审核','作废':'作废','取消':'取消'};
  type=typeMap[type]||(['新增','编辑','审核','作废','同步','取消'].includes(type)?type:'编辑');
  const now=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const time=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  planLogs[planId].unshift({type,content,operator:'Admin',time});
}
function openPlanLogDialog(planId){
  const plan=plans.find(p=>p.id===planId);
  if(!plan)return;
  const logs=planLogs[planId]||[];
  $('#planLogTitle').textContent=`操作日志｜${plan.plan}`;
  $('#planLogCount').textContent=`共 ${logs.length} 条`;
  const tbody=$('#planLogBody');
  if(!logs.length){tbody.innerHTML='<tr><td colspan="4" style="padding:24px;text-align:center;color:#909399">暂无操作记录</td></tr>';}
  else{tbody.innerHTML=logs.map(log=>`<tr><td style="width:100px;text-align:center;color:#606266">${log.type}</td><td style="min-width:280px;color:#606266">${log.content}</td><td style="width:120px;text-align:center;color:#606266">${log.operator}</td><td style="width:170px;text-align:center;color:#606266">${log.time}</td></tr>`).join('');}
  $('#planLogDialog').classList.remove('hidden');
}
function closePlanLogDialog(){$('#planLogDialog').classList.add('hidden');}
function layoutQuery(){
  if(!queryPanel||!queryGrid||!queryExpandBtn)return;
  queryPanel.classList.remove('query-collapsed');
  queryGrid.querySelectorAll('.query-overflow-item').forEach(item=>item.classList.remove('query-overflow-item'));
  const items=[...queryGrid.querySelectorAll('.query-item:not(.query-action-item)')];
  const actionItem=queryGrid.querySelector('.query-action-item');
  if(!items.length||!actionItem)return;
  queryExpandBtn.hidden=false; /* 临时显示以测量含展开按钮的按钮组真实宽度 */
  const gridWidth=queryGrid.getBoundingClientRect().width;
  const gap=parseFloat(getComputedStyle(queryGrid).columnGap)||0;
  const btnWidth=actionItem.getBoundingClientRect().width;
  const widthMap=new Map(items.map(item=>[item,item.getBoundingClientRect().width]));
  /* 贪心还原 flex-wrap 的自然行分布 */
  const rows=[];let row=[];let rowWidth=0;
  items.forEach(item=>{
    const w=widthMap.get(item);
    if(row.length&&rowWidth+gap+w>gridWidth+1){rows.push(row);row=[];rowWidth=0;}
    rowWidth+=(row.length?gap:0)+w;row.push(item);
  });
  if(row.length)rows.push(row);
  const actionOwnRow=btnWidth>=gridWidth*0.95; /* 窄屏断点下按钮组独占整行 */
  const overflowSet=new Set();
  if(rows.length>2)rows.slice(2).forEach(group=>group.forEach(item=>overflowSet.add(item)));
  if(rows.length>=2&&!actionOwnRow){
    /* 第二行装箱时为按钮组预留宽度，保证「展开/查询/重置」默认落在第二行内 */
    let used=0;
    rows[1].forEach(item=>{
      const w=widthMap.get(item);const next=used+(used?gap:0)+w;
      if(next+gap+btnWidth<=gridWidth+1)used=next;else overflowSet.add(item);
    });
  }
  overflowSet.forEach(item=>item.classList.add('query-overflow-item'));
  const hasOverflow=overflowSet.size>0;
  if(!hasOverflow)queryExpanded=false;
  queryExpandBtn.hidden=!hasOverflow;
  setQueryExpandUi();
}
const multiConfigs=[
  ['#shipWarehouseMulti',shipWarehouses,'shipWarehouses','发货仓（可多选）'],['#destinationWarehouseMulti',destinationWarehouses,'destinationWarehouses','目的地仓（可多选）'],['#destinationTypeMulti',[...new Set(Object.values(typeByDestination))],'destinationTypes','目的地仓类型（可多选）'],['#firstMileMulti',firstMiles,'firstMiles','头程物流商（可多选）'],['#channelMulti',channels,'channels','物流渠道（可多选）'],['#transportMulti',[...new Set(Object.values(transportByChannel))],'transports','运输方式（可多选）'],['#platformMulti',platforms,'platforms','平台（可多选）'],['#countryMulti',countries,'countries','国家（可多选）'],['#storeMulti',stores,'stores','店铺（可多选）'],['#teamMulti',teams,'teams','团队（可多选）'],['#creatorMulti',creators,'creators','创建人（可多选）']
];
initQueryExpand();multiConfigs.forEach(config=>initMulti(...config));layoutQuery();renderTabs();renderTable();
$('#planLogClose').onclick=closePlanLogDialog;$('#planLogMask').onclick=closePlanLogDialog;
let queryLayoutTimer;window.addEventListener('resize',()=>{clearTimeout(queryLayoutTimer);queryLayoutTimer=setTimeout(layoutQuery,80);});
window.addEventListener('load',layoutQuery);

// ===== 计划侧关联货件（双向关联入口）=====
let planLinkPlanIds=[];
function planLinkRowHtml(plan,line,canDelete){
  return `<tr class="plan-link-row" data-plan-id="${plan.id}" data-sku="${line.sku}"><td class="plan-link-plan-fixed">${plan.plan}</td><td>${line.sku}</td><td>${line.lx}</td><td>${line.fnsku}</td><td>${line.seller}/${line.asin}</td><td>${line.store}</td><td><input class="plan-link-shipment-input control" placeholder="请输入 FBA 货件单号"></td>${canDelete?'<td class="plan-link-del-col"><button class="plan-link-row-del" type="button" title="删除">×</button></td>':'<td class="plan-link-del-col">—</td>'}</tr>`;
}
function planLinkBindDel(){
  $$('.plan-link-row-del').forEach(btn=>btn.onclick=()=>{
    const row=btn.closest('.plan-link-row');row.remove();
  });
}
function openPlanLinkShipmentPopover(planIds){
  planLinkPlanIds=planIds||[];
  const selectedPlans=planLinkPlanIds.map(id=>plans.find(p=>p.id===id)).filter(Boolean);
  if(!selectedPlans.length){toast('未找到可关联的发货计划');return;}
  const isBatch=selectedPlans.length>1;
  $('#planLinkTitle').textContent=isBatch?`关联 FBA 货件（共 ${selectedPlans.length} 个发货计划）`:`关联 FBA 货件｜${selectedPlans[0].plan}`;
  $('#planLinkAddRow').style.display='none';
  const rows=selectedPlans.flatMap(plan=>plan.lines.map(line=>({plan,line})));
  const tbody=$('#planLinkRows');tbody.innerHTML=rows.map(({plan,line})=>planLinkRowHtml(plan,line,isBatch)).join('');planLinkBindDel();
  $('#planLinkMask').classList.remove('hidden');$('#planLinkPopover').classList.remove('hidden');
}
function closePlanLinkShipmentPopover(){$('#planLinkMask').classList.add('hidden');$('#planLinkPopover').classList.add('hidden');planLinkPlanIds=[];}
function confirmPlanLinkShipment(){
  const trs=[...$('#planLinkRows').children];
  if(!trs.length){toast('请先添加关联行');return;}
  const pairs=[];
  for(const tr of trs){
    const planId=Number(tr.dataset.planId),sku=tr.dataset.sku;
    const plan=plans.find(p=>p.id===planId);
    const line=plan&&plan.lines.find(l=>l.sku===sku);
    if(!line){toast('关联行数据异常，请关闭后重试','error');return;}
    const shipment=tr.querySelector('.plan-link-shipment-input').value.trim();
    if(!shipment){toast(`计划 ${plan.plan} 的 SKU ${sku} 未填写 FBA 货件单号`,'error');return;}
    pairs.push({plan,line,shipment});
  }
  const seen={};
  for(const p of pairs){if(seen[p.shipment]){toast(`货件号 ${p.shipment} 重复，不可关联两次`,'error');return;}seen[p.shipment]=true;}
  for(const p of pairs){
    const conflict=plans.some(plan=>plan.lines.some(line=>line!==p.line&&line.linkedShipments.includes(p.shipment)));
    if(conflict){toast(`货件号 ${p.shipment} 已关联其他发货计划，无法重复关联`,'error');return;}
  }
  const touchedPlans=new Set();
  for(const p of pairs){
    if(p.plan.status==='待发货'){p.line.linkedShipments.push(p.shipment);touchedPlans.add(p.plan);}
  }
  touchedPlans.forEach(plan=>{
    plan.status='已完成';
    const linkedCount=plan.lines.filter(line=>line.linkedShipments.length).length;
    addPlanLog(plan.id,'关联FBA货件',`关联 ${linkedCount} 个 SKU 明细至 FBA 货件`);
  });
  closePlanLinkShipmentPopover();renderTable();toast('关联成功，发货计划已流转至「已完成」');
}
function initPlanLinkShipment(){
  if(!LINK_SHIPMENT_ENABLED){$('#linkShipmentBtn').style.display='none';return;}
  $('#linkShipmentBtn').onclick=()=>{
    const selected=[...state.selected];
    if(!selected.length){toast('请先勾选待发货的发货计划');return;}
    const eligible=selected.map(id=>plans.find(p=>p.id===id)).filter(plan=>plan&&plan.status==='待发货'&&!isLinked(plan));
    if(!eligible.length){toast('勾选中没有可关联的「待发货」计划');return;}
    openPlanLinkShipmentPopover(eligible.map(plan=>plan.id));
  };
  $('#planLinkClose').onclick=closePlanLinkShipmentPopover;
  $('#planLinkMask').onclick=closePlanLinkShipmentPopover;
  $('#planLinkCancel').onclick=closePlanLinkShipmentPopover;
  $('#planLinkClear').onclick=()=>{$('#planLinkRows').querySelectorAll('.plan-link-shipment-input').forEach(input=>input.value='');};
  $('#planLinkConfirm').onclick=confirmPlanLinkShipment;
}
initPlanLinkShipment();
