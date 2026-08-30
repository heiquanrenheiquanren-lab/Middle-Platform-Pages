const shipWarehouses=['深圳发货仓','东莞发货仓','宁波发货仓','洛杉矶海外仓'];
const destinationWarehouses=['ONT8','LAX9','FTW1','ARCCAP 洛杉矶仓','英国海外仓'];
const destinationTypes=['FBA 仓','海外仓','平台仓','客户仓'];
const firstMiles=['递四方','万邑通','云途物流','美森快船','以星快船'];
const channels=['美国海运普船','美国海运快船','空派专线','欧洲铁路','国际快递'];
const transports=['海运','空运','铁路','卡航','快递'];
const platforms=['Amazon','eBay','B2C','线下订单'];
const countries=['美国','英国','德国','日本','中国'];
const stores=['ARCCAP','Lowes_ar','arccaptain','Amazon US 旗舰店','线下订单'];
const teams=['亚马逊团队','Jasic团队','eBay团队','B端团队','公共库存'];
const creators=['Admin','张敏','李晨','王磊','系统管理员'];
const remarks=['旺季发货计划','客户项目急单','常规补货','海外仓安全库存补充','新品首批发货','等待物流商确认','测试计划，请勿操作',''];
const statuses=['待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待发货','待确认','待确认','待确认','待确认','待确认','待确认','待确认','待确认','待确认','待确认','待确认','待确认','待确认','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已完成','已作废','已作废','已作废','已作废','已作废','已作废','已作废','已作废','已作废','已作废','已作废','已作废'];
const baseSkus=['140US260008','42101000004','XX123456-1','DD123456','EE123456','FF123456','KK123456','fan-test-sku'];
const icons=['🎒','🧰','▧','📦','🧯','🪖','🌺','🐹'];

const rows=Array.from({length:62},(_,i)=>{
  const date=String(5-(i%5)).padStart(2,'0');
  return {
    id:i+1,plan:`SHP202608${String(5-Math.floor(i/15)).padStart(2,'0')}-${i+1}`,sku:baseSkus[i%baseSkus.length],icon:icons[i%icons.length],
    status:statuses[i%statuses.length],updated:`2026-08-${date} ${String(9+(i%8)).padStart(2,'0')}:${String(10+(i%47)).padStart(2,'0')}`,creator:creators[i%creators.length],remark:remarks[i%remarks.length],
    expectedShip:`2026-08-${String(8+(i%18)).padStart(2,'0')}`,expectedArrival:`2026-09-${String(2+(i%24)).padStart(2,'0')}`,boxes:String(8+(i%36)),created:`2026-08-${date}`,updatedDate:`2026-08-${date}`,
    supplierCode:`SUP-${100000+i}`,lx:`LX${230000+i}`,seller:`SELLER-${baseSkus[i%baseSkus.length]}`,fnsku:`X00${800000+i}`,asin:`B0${900000+i}`,
    shipWarehouse:shipWarehouses[i%shipWarehouses.length],destinationWarehouse:destinationWarehouses[i%destinationWarehouses.length],destinationType:destinationTypes[i%destinationTypes.length],
    firstMile:firstMiles[i%firstMiles.length],channel:channels[i%channels.length],transport:transports[i%transports.length],platform:platforms[i%platforms.length],country:countries[i%countries.length],store:stores[i%stores.length],team:teams[i%teams.length],
    purchaseNo:`PO2026${727000+i}`,shippingOrderNo:`SO2026${81000+i}`,shipmentNo:`FBA2026${52000+i}`,linkedShipments:[]
  };
});

const LINK_SHIPMENT_ENABLED=false; /* 本版本暂隐藏发货计划 tab 关联 FBA 货件入口。恢复时改为 true */
const IMPORT_LINK_ENABLED=false;   /* 本版本暂隐藏发货计划 tab 导入关联 FBA 货件入口。恢复时改为 true */
const PLAN_OP_SHOW_LOG=false;     /* 本版本暂隐藏操作列“日志”按钮。恢复时改为 true */
const statusDefs=[['全部',null],['待确认','待确认'],['待发货','待发货'],['已完成','已完成'],['已作废','已作废']];
const state={codes:[],shipWarehouses:[],destinationWarehouses:[],destinationTypes:[],firstMiles:[],channels:[],transports:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,pageSize:15,selected:new Set(),filtered:[...rows]};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function toast(text,type='success'){
  const el=$('#toast');el.textContent=text;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800);
}
function closeMenus(except){$$('.multi').forEach(m=>{if(m!==except){m.querySelector('[data-menu]').classList.remove('show');m.querySelector('[data-trigger]').classList.remove('open');}});}
document.addEventListener('click',()=>closeMenus());
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
function statusCount(status){return status===null?rows.length:rows.filter(r=>r.status===status).length;}
function renderTabs(){$('#statusTabs').innerHTML=statusDefs.map(([label,key])=>`<div class="status-tab ${state.status===key?'active':''}" data-key="${key===null?'__all':key}">${label}(${statusCount(key)})</div>`).join('');$$('.status-tab').forEach(tab=>tab.onclick=()=>{state.status=tab.dataset.key==='__all'?null:tab.dataset.key;state.page=1;applyFilters(false);renderTabs();});}
function dateField(row){return $('#timeType').value==='创建时间'?row.created:$('#timeType').value==='更新时间'?row.updatedDate:$('#timeType').value==='预计发货日期'?row.expectedShip:row.expectedArrival;}
function validateDates(){const start=$('#startDate').value,end=$('#endDate').value;if((start&&!end)||(!start&&end)){toast('请选择完整的时间范围','error');return false;}if(start&&end&&start>end){toast('开始日期不能晚于结束日期','error');return false;}return true;}
function applyFilters(showMessage=true){
  if(!validateDates())return;
  const codeType=$('#codeType').value,plans=splitValues($('#planNo').value),purchaseNos=splitValues($('#purchaseNo').value),shippingOrderNos=splitValues($('#shippingOrderNo').value),shipmentNos=splitValues($('#shipmentNo').value),remark=$('#remark').value.trim().toLowerCase(),start=$('#startDate').value,end=$('#endDate').value;
  state.filtered=rows.filter(row=>{
    const codeMap={'SKU':row.sku,'供应商料号':row.supplierCode,'领星 SKU':row.lx,'SellerSKU':row.seller,'FNSKU':row.fnsku,'ASIN':row.asin};
    return (!state.codes.length||state.codes.some(code=>(codeMap[codeType]||'').toLowerCase().includes(code.toLowerCase())))&&includesAny(row.plan,plans)&&
      equalsAny(row.shipWarehouse,state.shipWarehouses)&&equalsAny(row.destinationWarehouse,state.destinationWarehouses)&&equalsAny(row.destinationType,state.destinationTypes)&&equalsAny(row.firstMile,state.firstMiles)&&equalsAny(row.channel,state.channels)&&equalsAny(row.transport,state.transports)&&
      equalsAny(row.platform,state.platforms)&&equalsAny(row.country,state.countries)&&equalsAny(row.store,state.stores)&&equalsAny(row.team,state.teams)&&equalsAny(row.creator,state.creators)&&
      (!state.status||row.status===state.status)&&(!start||dateField(row)>=start)&&(!end||dateField(row)<=end)&&(!remark||row.remark.toLowerCase().includes(remark))&&includesAny(row.purchaseNo,purchaseNos)&&includesAny(row.shippingOrderNo,shippingOrderNos)&&includesAny(row.shipmentNo,shipmentNos);
  });
  state.page=Math.min(state.page,Math.max(1,Math.ceil(state.filtered.length/state.pageSize)));renderTable();if(showMessage)toast(`查询完成，共 ${state.filtered.length} 条结果`);
}
function reset(){
  Object.assign(state,{codes:[],shipWarehouses:[],destinationWarehouses:[],destinationTypes:[],firstMiles:[],channels:[],transports:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,filtered:[...rows]});
  ['#planNo','#remark','#purchaseNo','#shippingOrderNo','#shipmentNo','#startDate','#endDate'].forEach(id=>$(id).value='');$('#codeType').value='SKU';$('#timeType').value='创建时间';
  multiConfigs.forEach(([id,,key,placeholder])=>{const root=$(id);root.querySelectorAll('input').forEach(input=>input.checked=state[key].includes(input.value));const trigger=root.querySelector('[data-trigger]');trigger.textContent=state[key].length?state[key].join('、'):placeholder;trigger.classList.toggle('has-value',!!state[key].length);});
  renderCodeTags();renderTabs();renderTable();toast('已重置查询条件');
}
function renderTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);$('#totalCount').textContent=total;$('#jumpPage').value=state.page;$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;
  $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');$$('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderTable();});
  if(!data.length){$('#tableBody').innerHTML='<tr class="empty-row"><td colspan="12"><div class="empty-icon">◇</div>暂无符合条件的数据</td></tr>';syncSelection();return;}
  $('#tableBody').innerHTML=data.map(row=>{
    const linked=row.linkedShipments.length>0;
    const canLink=row.status==='待发货'&&!linked;
    const opCell=linked?`<span class="plan-linked-tag" title="当前计划已关联 FBA 货件，不可作废或生成发货单">已关联货件</span>`:(LINK_SHIPMENT_ENABLED&&canLink?`<button class="plan-link-action" data-link-plan="${row.id}" type="button">关联货件</button>`:'');
    const logCell=PLAN_OP_SHOW_LOG?`<button class="plan-log-action" data-log-plan="${row.id}" type="button">日志</button>`:'';
    return `<tr><td><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td><td>${row.plan}</td><td class="left"><span class="thumb">${row.icon}</span>${row.sku}</td><td>${row.status}</td><td>${row.updated}</td><td>${row.creator}</td><td><input class="inline-input row-remark" data-id="${row.id}" value="${row.remark}" placeholder="请输入备注"></td><td><input class="inline-input row-ship-date" data-id="${row.id}" type="date" value="${row.expectedShip}"></td><td><input class="inline-input row-arrival-date" data-id="${row.id}" type="date" value="${row.expectedArrival}"></td><td>${row.boxes}</td><td class="plan-op-cell">${opCell}${logCell}</td></tr>`;
  }).join('');
  $$('.row-check').forEach(check=>check.onchange=()=>{const id=Number(check.dataset.id);check.checked?state.selected.add(id):state.selected.delete(id);syncSelection();});$$('.row-remark').forEach(input=>input.onchange=()=>{rows.find(r=>r.id===Number(input.dataset.id)).remark=input.value;toast('备注已保存');});
  $$('.row-ship-date,.row-arrival-date').forEach(input=>input.onclick=()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}});syncSelection();$$('[data-link-plan]').forEach(btn=>btn.onclick=()=>openPlanLinkShipmentPopover([Number(btn.dataset.linkPlan)]));$$('[data-log-plan]').forEach(btn=>btn.onclick=()=>openPlanLogDialog(Number(btn.dataset.logPlan)));
}
function syncSelection(){const visible=$$('.row-check'),checked=visible.filter(x=>x.checked).length;$('#selectedCount').textContent=state.selected.size;$('#selectAll').checked=visible.length>0&&checked===visible.length;$('#selectAll').indeterminate=checked>0&&checked<visible.length;
  const selectedPlans=[...state.selected].map(id=>rows.find(r=>r.id===id)).filter(Boolean);
  const hasLinked=selectedPlans.some(r=>r.linkedShipments.length>0);
  const hasNonLinkable=selectedPlans.some(r=>r.status!=='待发货'||r.linkedShipments.length>0);
  $('#voidBtn').disabled=selectedPlans.length===0||hasLinked;
  $('#voidBtn').title=hasLinked?'已关联 FBA 货件的计划不可作废':'';
  $('#genShipBtn').disabled=selectedPlans.length===0||hasNonLinkable;
  $('#genShipBtn').title=hasNonLinkable?'已关联 FBA 货件或非待发货状态的计划不可生成发货单':'';
}
$('#selectAll').onchange=e=>{$$('.row-check').forEach(check=>{check.checked=e.target.checked;const id=Number(check.dataset.id);e.target.checked?state.selected.add(id):state.selected.delete(id);});syncSelection();};
$('#searchBtn').onclick=()=>{if($('#codeInput').value.trim()){addCode($('#codeInput').value);$('#codeInput').value='';}state.page=1;applyFilters();};$('#resetBtn').onclick=reset;$('#refreshBtn').onclick=()=>{applyFilters(false);toast('数据已刷新');};
$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};$('#nextPage').onclick=()=>{const pages=Math.ceil(state.filtered.length/state.pageSize);if(state.page<pages){state.page++;renderTable();}};$('#jumpPage').onchange=e=>{const pages=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(pages,Math.max(1,Number(e.target.value)||1));renderTable();};
$$('#planNo,#remark,#purchaseNo,#shippingOrderNo,#shipmentNo').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter')$('#searchBtn').click();}));$$('#startDate,#endDate').forEach(input=>input.addEventListener('click',()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}));
function initQueryExpand(){const panel=$('.query-panel'),button=$('#queryExpand'),arrow=button.querySelector('.query-arrow'),label=button.querySelector('.query-expand-text');button.onclick=()=>{const expanded=panel.classList.toggle('expanded');arrow.textContent=expanded?'⌃':'⌄';label.textContent=expanded?'收起':'展开';button.setAttribute('aria-expanded',String(expanded));};}
const planLogs={};
function addPlanLog(planId,type,content){
  if(!planLogs[planId])planLogs[planId]=[];
  const now=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const time=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  planLogs[planId].unshift({type,content,operator:'Admin',time});
}
function openPlanLogDialog(planId){
  const plan=rows.find(r=>r.id===planId);
  if(!plan)return;
  const logs=planLogs[planId]||[];
  $('#planLogTitle').textContent=`操作日志｜${plan.plan}`;
  const tbody=$('#planLogBody');
  if(!logs.length){tbody.innerHTML='<tr><td colspan="4" style="padding:24px;text-align:center;color:#909399">暂无操作记录</td></tr>';}
  else{tbody.innerHTML=logs.map(log=>`<tr><td style="width:100px;text-align:center;color:#606266">${log.type}</td><td style="min-width:280px;color:#606266">${log.content}</td><td style="width:120px;text-align:center;color:#606266">${log.operator}</td><td style="width:170px;text-align:center;color:#606266">${log.time}</td></tr>`).join('');}
  $('#planLogDialog').classList.remove('hidden');
}
function closePlanLogDialog(){$('#planLogDialog').classList.add('hidden');}
function initPageNav(){$$('[data-page-nav]').forEach(item=>item.onclick=()=>{const page=item.dataset.pageNav;if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page},'*');else window.location.href={forecast:'../demand-forecast/index.html',stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',skuFirstLegCost:'../sku-first-leg-cost/index.html',supplierInventory:'../supplier-inventory/index.html',processingOrder:'../processing-orders/index.html'}[page];});}
function initResponsiveQueryLayout(){
  const panel=$('.query-panel'),rowOne=$('#queryRowOne'),rowTwo=$('#queryRowTwo'),advanced=$('.advanced-query-row'),actions=$('.query-actions');
  const items=$$('.query-item[data-query-order]').sort((a,b)=>Number(a.dataset.queryOrder)-Number(b.dataset.queryOrder));
  const itemWidth=item=>{
    if(item.classList.contains('code-query')||item.classList.contains('time-query'))return [...item.children].reduce((sum,child)=>sum+(child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0),0)+10;
    const child=item.firstElementChild;return child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0;
  };
  const layout=()=>{
    const expanded=panel.classList.contains('expanded');
    items.forEach(item=>rowOne.appendChild(item));rowTwo.appendChild(actions);
    const available=panel.clientWidth-28,gap=10,actionWidth=actions.getBoundingClientRect().width+gap;
    let row=1,usedOne=0,usedTwo=actionWidth;
    items.forEach(item=>{
      const width=itemWidth(item),needed=width+(row===1&&usedOne||row===2&&usedTwo>actionWidth?gap:0);
      if(row===1&&usedOne+needed<=available){rowOne.appendChild(item);usedOne+=needed;return;}
      row=2;
      const secondNeeded=width+(usedTwo>actionWidth?gap:0);
      if(usedTwo+secondNeeded<=available){rowTwo.insertBefore(item,actions);usedTwo+=secondNeeded;return;}
      advanced.appendChild(item);
    });
    const hasAdvanced=advanced.querySelector('.query-item');$('#queryExpand').hidden=!hasAdvanced;
    if(!hasAdvanced&&expanded){panel.classList.remove('expanded');$('#queryExpand .query-arrow').textContent='⌄';$('#queryExpand .query-expand-text').textContent='展开';}
  };
  layout();let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(layout,80);});
}
const multiConfigs=[
  ['#shipWarehouseMulti',shipWarehouses,'shipWarehouses','发货仓（可多选）'],['#destinationWarehouseMulti',destinationWarehouses,'destinationWarehouses','目的地仓（可多选）'],['#destinationTypeMulti',destinationTypes,'destinationTypes','目的地仓类型（可多选）'],['#firstMileMulti',firstMiles,'firstMiles','头程物流商（可多选）'],['#channelMulti',channels,'channels','物流渠道（可多选）'],['#transportMulti',transports,'transports','运输方式（可多选）'],['#platformMulti',platforms,'platforms','平台（可多选）'],['#countryMulti',countries,'countries','国家（可多选）'],['#storeMulti',stores,'stores','店铺（可多选）'],['#teamMulti',teams,'teams','团队（可多选）'],['#creatorMulti',creators,'creators','创建人（可多选）']
];
initPageNav();initQueryExpand();multiConfigs.forEach(config=>initMulti(...config));initResponsiveQueryLayout();renderTabs();renderTable();

/* FBA 货件：按测试环境页面结构复刻的本地交互数据 */
const fbaStatusOptions=['已取消','已登记','已关闭','已删除','已送达','运输中','接收中','已发货'];
const fbaGroupSeeds=[
  ['FBA19JV2DSSK','GSO1','8W2JA3LC','已登记','X004LQ7279','42','43201000001','10340100110','ARC焊条--碱性碳钢/E7018'],
  ['FBA19JV1KBPZ','SMF6','8XLEXZVR','已发货','X0052YFT9R','12','120US160006','10200200206','TIG200P 美规'],
  ['FBA19JV0J968','SAT4','61V8Z69K','已发货','X0052YFT9R','12','120US160006','10200200206','TIG200P 美规'],
  ['FBA19JTZRGQC','CMH3','8KCBLGFN','已发货','X0052YFT9R','12','120US160006','10200200206','TIG200P 美规'],
  ['FBA19JTY736H','MCO2','74ZCL RCP','已发货','X0052YFT9R','12','120US160006','10200200206','TIG200P 美规'],
  ['FBA19JTYZV5Z','GYR2','4YCIKOEI','运输中','X004IHKT67','44','35201000003','10470100410','焊接防火毯10*10ft'],
  ['FBA19JV29314','MDW2','4A91HRQP','接收中','X004LQ7279','42','43201000001','10340100110','ARC焊条--碱性碳钢/E7018'],
  ['FBA19JUG7MSX','YYZ7','9MNC720A','已送达','X004NZMUQ1','18','43201000002','10340100210','ARC焊条--碱性碳钢/E7018']
];
const fbaGroups=Array.from({length:24},(_,index)=>{
  const seed=fbaGroupSeeds[index%fbaGroupSeeds.length];
  const [shipmentNo,center,reference,status,fnsku,declared,sku,lxSku,product]=seed;
  const nextSeed=fbaGroupSeeds[(index+1)%fbaGroupSeeds.length];
  const [, , , , nextFnsku,nextDeclared,nextSku,nextLxSku,nextProduct]=nextSeed;
  const qty=Number(declared),nextQty=Number(nextDeclared),rowId=`fba-${index+1}`;
  const buildChild=(id,childPlan,childFnsku,childQty,childSku,childLxSku,childProduct,linkedPlans=[])=>({id,plan:childPlan,asin:index%3===0?'E7018–2.4–CA':'',fnsku:childFnsku,declared:childQty,sent:index%6===5?childQty:0,received:index%9===8?Math.max(0,childQty-2):0,shippingNo:'',remark:'',sku:childSku,lxSku:childLxSku,product:childProduct,sellerSku:'AA123456–SellerSKU',mappedSku:'AA123456',mappedLxSku:'12345623456',icon:index%5===0?'🧱':index%5===1?'🧰':index%5===2?'🎒':'📦',linkedPlans});
  return {id:`fba-group-${index+1}`,shipmentNo:`${shipmentNo.slice(0,-2)}${String(index+11).padStart(2,'0')}`,center,reference,status,
    seller:index%3===0?'ARCCAPTAIN主账号-US':'ARCCAPTAIN…',country:'美国',shipWarehouse:index%2?'深圳发货仓':'',destination:'',deliveryTime:'',transport:'',created:`2026-07-${String(23+(index%3)).padStart(2,'0')} ${index%2?'11:18':'04:03'}`,
    children:[buildChild(`${rowId}-1`,index%4===0?`EBA202608${String(8+index).padStart(2,'0')}-1`:'',fnsku,qty,sku,lxSku,product,index%2===0?[`BDT202608${String(13+index).padStart(2,'0')}–${(index%3)+1}`]:[]),buildChild(`${rowId}-2`,'',nextFnsku,nextQty,nextSku,nextLxSku,nextProduct,[])]
  };
});
const fbaPlanOptions=Array.from({length:20},(_,index)=>{
  const sku='AA123456';
  const fnsku='X00'+(800000+index);
  return {id:`fba-plan-${index+1}`,plan:['BDT20260814–2','BDT20260813–6','BDT20260813–5','BDT20260813–4','BDT20260813–2','GGK20260813–2','GGK20260813–1'][index%7],platform:'亚马逊',sku,fnsku,lxSku:'12345623456',product:index%5===0?'测试组合产品DD':`测试${sku}`,sellerSku:'AA123456–SellerSKU',store:index%2?'ARCCAPTAIN…':'ARCCAPTAIN主账号-US',status:index%8===7?'已完成':'待发货',quantity:[88,90,10,11,100,100,100][index%7],shipDate:['2026–08–20','2026–08–31','2026–08–31','2026–08–30','2026–08–30','2026–08–30','2026–08–30'][index%7],arrivalDate:['2026–08–26','2026–09–10','2026–09–10','2026–09–09','2026–09–09','2026–09–09','2026–09–09'][index%7],remark:''};
});
const fbaStoreOptions=['ARCCAPTAIN主账号-US','ARCCAPTAIN…','Amazon US 旗舰店'];
const fbaCountryOptions=['美国','加拿大','英国'];
const fbaState={status:null,shipmentNo:'',planNo:'',sku:'',lxSku:'',fnsku:'',asin:'',stores:[],countries:[],logisticsCenter:'',referenceId:'',association:'unlinked',startDate:'',endDate:'',page:1,pageSize:25,planPage:1,planPageSize:7,planSearch:'',planSku:'',planFnsku:'',planStore:'',activeChildIds:[],pendingUnlink:null};

function fbaExactMatch(value,query){const terms=splitValues(query||'');return !terms.length||terms.includes(String(value||'').toLowerCase());}
function fbaLinked(child){return Boolean(child.linkedPlans.length);}
function getFbaVisibleGroups(){
  return fbaGroups.filter(group=>{
    const created=group.created.slice(0,10);
    return (!fbaState.status||group.status===fbaState.status)&&fbaExactMatch(group.shipmentNo,fbaState.shipmentNo)&&(!fbaState.stores.length||fbaState.stores.includes(group.seller))&&(!fbaState.countries.length||fbaState.countries.includes(group.country))&&fbaExactMatch(group.center,fbaState.logisticsCenter)&&fbaExactMatch(group.reference,fbaState.referenceId)&&(!fbaState.startDate||created>=fbaState.startDate)&&(!fbaState.endDate||created<=fbaState.endDate);
  }).map(group=>({...group,children:group.children.filter(child=>{
    const planNo=[child.plan,...child.linkedPlans].join(' ');
    const associationMatch=!fbaState.association||(fbaState.association==='linked'?fbaLinked(child):!fbaLinked(child));
    return fbaExactMatch(planNo,fbaState.planNo)&&fbaExactMatch(child.sku,fbaState.sku)&&fbaExactMatch(child.lxSku,fbaState.lxSku)&&fbaExactMatch(child.fnsku,fbaState.fnsku)&&fbaExactMatch(child.asin,fbaState.asin)&&associationMatch;
  })})).filter(group=>group.children.length);
}
function getFbaChildren(){return getFbaVisibleGroups().flatMap(group=>group.children.map(child=>({group,child})));}
function renderFbaMulti(rootId,options,key,placeholder,keyword=''){
  const root=$(rootId),trigger=root.querySelector('.fba-multi-trigger'),menu=root.querySelector('.fba-multi-menu'),optionWrap=root.querySelector('.fba-multi-options');
  const values=options.filter(option=>option.toLowerCase().includes(keyword.toLowerCase()));
  optionWrap.innerHTML=values.length?values.map(option=>`<label><input type="checkbox" value="${option}" ${fbaState[key].includes(option)?'checked':''}>${option}</label>`).join(''):'<span class="fba-multi-empty">暂无匹配项</span>';
  trigger.querySelector('span').textContent=fbaState[key].length?`${fbaState[key].slice(0,2).join('、')}${fbaState[key].length>2?` +${fbaState[key].length-2}`:''}`:placeholder;
  trigger.classList.toggle('has-value',Boolean(fbaState[key].length));
}
function initFbaMulti(rootId,options,key,placeholder){
  const root=$(rootId),trigger=root.querySelector('.fba-multi-trigger'),menu=root.querySelector('.fba-multi-menu'),search=root.querySelector('.fba-multi-search');
  const render=()=>renderFbaMulti(rootId,options,key,placeholder,search.value);
  render();
  trigger.onclick=event=>{event.stopPropagation();$$('.fba-multi-menu').forEach(item=>{if(item!==menu)item.classList.remove('show');});$$('.fba-multi-trigger').forEach(item=>{if(item!==trigger)item.classList.remove('open');});const open=menu.classList.toggle('show');trigger.classList.toggle('open',open);if(open)search.focus();};
  menu.onclick=event=>event.stopPropagation();search.oninput=render;menu.onchange=()=>{fbaState[key]=[...menu.querySelectorAll('input:checked')].map(input=>input.value);renderFbaMulti(rootId,options,key,placeholder,search.value);};
}
function closeFbaMultiMenus(){ $$('.fba-multi-menu').forEach(menu=>menu.classList.remove('show'));$$('.fba-multi-trigger').forEach(trigger=>trigger.classList.remove('open')); }
function readFbaQuery(){
  fbaState.shipmentNo=$('#fbaShipmentNo').value;fbaState.planNo=$('#fbaPlanNo').value;fbaState.sku=$('#fbaSku').value;fbaState.lxSku=$('#fbaLxSku').value;fbaState.fnsku=$('#fbaFnsku').value;fbaState.asin=$('#fbaAsin').value;fbaState.logisticsCenter=$('#fbaLogisticsCenter').value;fbaState.referenceId=$('#fbaReferenceId').value;fbaState.association=$('#fbaAssociation').value;fbaState.startDate=$('#fbaStartDate').value;fbaState.endDate=$('#fbaEndDate').value;
}
function resetFbaQuery(){
  fbaState.status=null;fbaState.shipmentNo='';fbaState.planNo='';fbaState.sku='';fbaState.lxSku='';fbaState.fnsku='';fbaState.asin='';fbaState.stores=[];fbaState.countries=[];fbaState.logisticsCenter='';fbaState.referenceId='';fbaState.association='unlinked';fbaState.startDate='';fbaState.endDate='';fbaState.page=1;
  ['#fbaShipmentNo','#fbaPlanNo','#fbaSku','#fbaLxSku','#fbaFnsku','#fbaAsin','#fbaLogisticsCenter','#fbaReferenceId','#fbaStartDate','#fbaEndDate'].forEach(selector=>$(selector).value='');$('#fbaAssociation').value='unlinked';$('#fbaStatusText').textContent='货件状态（全部）';$('#fbaStatusTrigger').classList.remove('has-value');['#fbaStoreMulti','#fbaCountryMulti'].forEach((selector,index)=>{const root=$(selector);root.querySelector('.fba-multi-search').value='';renderFbaMulti(selector,index?fbaCountryOptions:fbaStoreOptions,index?'countries':'stores',index?'国家（可多选）':'店铺（可多选）');});
}
function fbaStatusMenu(){
  $('#fbaStatusMenu').innerHTML=fbaStatusOptions.map(status=>`<div class="fba-status-option ${fbaState.status===status?'active':''}" data-fba-status="${status}">${status}</div>`).join('');
  $$('.fba-status-option').forEach(option=>option.onclick=e=>{e.stopPropagation();fbaState.status=option.dataset.fbaStatus;fbaState.page=1;$('#fbaStatusText').textContent=fbaState.status;$('#fbaStatusTrigger').classList.add('has-value');closeFbaStatusMenu();renderFbaTable();fbaStatusMenu();});
}
function closeFbaStatusMenu(){$('#fbaStatusMenu').classList.remove('show');$('#fbaStatusTrigger').classList.remove('open');}
function renderFbaTable(){
  const groups=getFbaVisibleGroups(),total=groups.reduce((sum,group)=>sum+group.children.length,0),pages=Math.max(1,Math.ceil(groups.length/5));
  fbaState.page=Math.min(fbaState.page,pages);const data=groups.slice((fbaState.page-1)*5,fbaState.page*5);$('#fbaTotalCount').textContent=total;$('#fbaJumpPage').value=fbaState.page;$('#fbaPrevPage').disabled=fbaState.page===1;$('#fbaNextPage').disabled=fbaState.page===pages;
  $('#fbaPageButtons').innerHTML=Array.from({length:Math.min(pages,4)},(_,index)=>`<button class="page-btn ${fbaState.page===index+1?'current':''}" data-fba-page="${index+1}">${index+1}</button>`).join('')+(pages>4?'<span>…</span>':'');
  $$('[data-fba-page]').forEach(button=>button.onclick=()=>{fbaState.page=Number(button.dataset.fbaPage);renderFbaTable();});
  if(!data.length){$('#fbaTableBody').innerHTML='<tr class="fba-empty"><td colspan="15">暂无符合条件的货件</td></tr>';return;}
  $('#fbaTableBody').innerHTML=data.map(group=>{
    const groupInfo=`<tr class="fba-group-row"><td colspan="15"><div class="fba-group-info"><div class="fba-group-key"><span class="fba-expand">⌄</span>货件单号：<b>${group.shipmentNo}</b></div><div>物流中心编码：<b>${group.center}</b><br>Reference ID：<b>${group.reference}</b></div><div>店铺：<b>${group.seller}</b><br>国家：<b>${group.country}</b></div><div>发货仓：<b>${group.shipWarehouse||'—'}</b><br>目的地仓：<b>${group.destination||'—'}</b></div><div>送达时间：<b>${group.deliveryTime||'—'}</b><br>运输方式：<b>${group.transport||'—'}</b></div><div>创建时间：<b>${group.created}</b><br>货件状态：<b>${group.status}</b></div></div></td></tr>`;
    const childRows=group.children.map(child=>{const shipDiff=child.declared-child.sent,receiveDiff=child.sent-child.received,declareReceiveDiff=child.declared-child.received,linked=child.linkedPlans.length;return `<tr class="fba-child-row"><td>${child.plan||'—'}</td><td>${child.asin||'—'}</td><td>${child.fnsku}</td><td>${child.declared}</td><td>${child.sent}</td><td>${child.received}</td><td>${shipDiff}</td><td>${receiveDiff}</td><td>${declareReceiveDiff}</td><td>${child.shippingNo||'—'}</td><td><input class="fba-remark" data-fba-remark="${child.id}" placeholder="请输入备注" value="${child.remark}"></td><td class="fba-sku-cell"><span class="fba-thumb">${child.icon}</span>${child.sku}</td><td>${child.lxSku}</td><td><div class="fba-product">${child.product}</div></td><td>${linked?`<button class="fba-link-action unlink" data-fba-unlink="${child.id}" type="button">取消关联</button>`:`<button class="fba-link-action" data-fba-link="${child.id}" type="button">关联发货计划</button>`}</td></tr>`;}).join('');return groupInfo+childRows;
  }).join('');
  $$('[data-fba-link]').forEach(button=>button.onclick=()=>openFbaPlanPopover([button.dataset.fbaLink]));
  $$('[data-fba-unlink]').forEach(button=>button.onclick=()=>openFbaUnlinkConfirm(button.dataset.fbaUnlink));
  $$('[data-fba-remark]').forEach(input=>input.onchange=()=>{const found=fbaGroups.flatMap(group=>group.children).find(child=>child.id===input.dataset.fbaRemark);found.remark=input.value;toast('备注已保存');});
}
function fbaPlanDate(value){return value.replaceAll('–','-');}
/* 关联发货计划弹窗：打开后默认按货件的 SKU/店铺/FNSKU 精确过滤候选计划，后续缩小范围使用 */
const fbaPopupDefaults={sku:'',fnsku:'',store:''};
function filteredFbaPlans(){
  /* 强制候选范围：只有 SKU=FBA SKU && FNSKU=FBA FNSKU && 店铺=FBA 店铺 的计划，才允许作为候选 */
  return fbaPlanOptions.filter(plan=>{
    if(plan.status!=='待发货')return false;
    if(fbaPopupDefaults.sku&&String(plan.sku).toLowerCase()!==fbaPopupDefaults.sku.toLowerCase())return false;
    if(fbaPopupDefaults.fnsku&&String(plan.fnsku).toLowerCase()!==fbaPopupDefaults.fnsku.toLowerCase())return false;
    if(fbaPopupDefaults.store&&plan.store!==fbaPopupDefaults.store)return false;
    return fbaExactMatch(plan.plan,fbaState.planSearch)&&
      fbaExactMatch(plan.sku,fbaState.planSku)&&
      fbaExactMatch(plan.fnsku,fbaState.planFnsku);
  });
}
function renderFbaPlanList(){const plans=filteredFbaPlans(),pages=Math.max(1,Math.ceil(plans.length/fbaState.planPageSize));fbaState.planPage=Math.min(fbaState.planPage,pages);const data=plans.slice((fbaState.planPage-1)*fbaState.planPageSize,fbaState.planPage*fbaState.planPageSize);$('#fbaPlanListInfo').textContent=`共 ${plans.length} 条`;
  $('#fbaPlanJumpPage').value=fbaState.planPage;$('#fbaPlanPageTotal').textContent=pages;$('#fbaPlanPrevPage').disabled=fbaState.planPage===1;$('#fbaPlanNextPage').disabled=fbaState.planPage===pages;
  $('#fbaPlanListBody').innerHTML=data.map(plan=>`<tr data-fba-plan-row="${plan.id}"><td><input type="radio" name="fbaPlanChoice" value="${plan.id}"></td><td>${plan.plan}</td><td>${plan.sku}</td><td>${plan.fnsku}</td><td>${plan.product}</td><td>${plan.sellerSku}</td><td>${plan.store}</td><td>${plan.quantity}</td><td>${plan.shipDate}</td><td>${plan.arrivalDate}</td><td>${plan.remark||'—'}</td></tr>`).join('');
  $$('[data-fba-plan-row]').forEach(row=>row.onclick=event=>{const plan=fbaPlanOptions.find(item=>item.id===row.dataset.fbaPlanRow);const group=fbaGroups.find(g=>g.children.find(c=>fbaState.activeChildIds.includes(c.id)));fbaState.activeChildIds.forEach(id=>{const child=fbaGroups.flatMap(group=>group.children).find(item=>item.id===id);if(child)child.linkedPlans=[plan.plan];});closeFbaPlanPopover();
    const planRow=rows.find(r=>r.plan===plan.plan);if(planRow){planRow.status='已完成';const shipmentNo=group?group.shipmentNo:'';if(shipmentNo&&!planRow.linkedShipments.includes(shipmentNo))planRow.linkedShipments.push(shipmentNo);addPlanLog(planRow.id,'关联FBA货件',`SKU ${planRow.sku} 关联货件 ${shipmentNo}`);}
  renderFbaTable();renderTable();toast(`已关联发货计划 ${plan.plan}`);});
}
function findFbaChild(childId){return fbaGroups.flatMap(group=>group.children).find(child=>child.id===childId);}
function openFbaUnlinkConfirm(childId){const child=findFbaChild(childId);if(!child||!child.linkedPlans.length)return;fbaState.pendingUnlink=childId;const linkedPlan=child.linkedPlans[0];$('#fbaUnlinkConfirmText').textContent=`确定要取消当前 SKU「${child.sku}」与发货计划「${linkedPlan}」的关联吗？取消后，该 SKU 将恢复为未关联状态，可重新关联发货计划。`;$('#fbaUnlinkConfirmMask').classList.remove('hidden');}
function closeFbaUnlinkConfirm(){fbaState.pendingUnlink=null;$('#fbaUnlinkConfirmMask').classList.add('hidden');}
function confirmFbaUnlink(){const child=findFbaChild(fbaState.pendingUnlink);if(child){const linkedPlan=child.linkedPlans[0]||'';child.linkedPlans=[];closeFbaUnlinkConfirm();
  const group=fbaGroups.find(g=>g.children.includes(child));
  const planRow=rows.find(r=>r.plan===linkedPlan);
  if(planRow){planRow.status='待发货';
    if(group){planRow.linkedShipments=planRow.linkedShipments.filter(s=>s!==group.shipmentNo);}
    addPlanLog(planRow.id,'解除关联',`SKU ${planRow.sku} 解除货件 ${group?group.shipmentNo:child.id} 的关联`);}
  renderFbaTable();renderTable();toast(`已取消关联发货计划 ${linkedPlan}`);}}
function readFbaPlanQuery(){fbaState.planSearch=$('#fbaPlanSearch').value;fbaState.planSku=$('#fbaPlanSku').value;fbaState.planFnsku=$('#fbaPlanFnsku').value;}
function resetFbaPlanQuery(){
  /* 重置：清空用户查询条件（计划号/扩展SKU/扩展FNSKU），但保留当前 FBA 货件的默认 SKU / FNSKU / 店铺映射作为候选范围，以便继续缩小范围 */
  fbaState.planSearch='';fbaState.planSku='';fbaState.planFnsku='';fbaState.planPage=1;
  $('#fbaPlanSearch').value='';$('#fbaPlanSku').value='';$('#fbaPlanFnsku').value='';
  $('#fbaPlanDefaultStore').textContent=fbaPopupDefaults.store||'—';
  $('#fbaPlanDefaultSku').textContent=fbaPopupDefaults.sku||'—';
  $('#fbaPlanDefaultFnsku').textContent=fbaPopupDefaults.fnsku||'—';
}
function openFbaPlanPopover(childIds){
  fbaState.activeChildIds=childIds;
  const contexts=childIds.map(id=>{for(const group of fbaGroups){const child=group.children.find(item=>item.id===id);if(child)return {group,child};}return null;}).filter(Boolean);
  /* 写入默认映射：SKU、FNSKU、店铺 — 以后续筛选（缩小范围）发货计划候选，不需要改弹窗字段 */
  fbaPopupDefaults.sku=contexts.length?contexts[0].child.sku:'';
  fbaPopupDefaults.fnsku=contexts.length?contexts[0].child.fnsku:'';
  fbaPopupDefaults.store=contexts.length&&contexts.every(x=>x.group.seller===contexts[0].group.seller)?contexts[0].group.seller:'';
  resetFbaPlanQuery();renderFbaPlanList();
  $('#fbaLinkModalMask').classList.remove('hidden');$('#fbaLinkPopover').classList.remove('hidden');
}
function closeFbaPlanPopover(){$('#fbaLinkModalMask').classList.add('hidden');$('#fbaLinkPopover').classList.add('hidden');fbaState.activeChildIds=[];fbaPopupDefaults.sku='';fbaPopupDefaults.fnsku='';fbaPopupDefaults.store='';}
// ===== 计划侧关联货件（双向关联入口·新增）=====
let planLinkPlanIds=[];
function planLinkRowHtml(plan,canDelete){
  return `<tr class="plan-link-row" data-plan-id="${plan.id}"><td class="plan-link-plan-fixed">${plan.plan}</td><td>${plan.sku}</td><td>${plan.lx}</td><td>${plan.fnsku}</td><td>${plan.seller}/${plan.asin}</td><td>${plan.store}</td><td><input class="plan-link-shipment-input control" placeholder="请输入 FBA 货件单号"></td>${canDelete?'<td class="plan-link-del-col"><button class="plan-link-row-del" type="button" title="删除">×</button></td>':'<td class="plan-link-del-col">—</td>'}</tr>`;
}
function planLinkBindDel(){
  $$('.plan-link-row-del').forEach(btn=>btn.onclick=()=>{
    const row=btn.closest('.plan-link-row');row.remove();
  });
}
function openPlanLinkShipmentPopover(planIds){
  planLinkPlanIds=planIds||[];
  const plans=planLinkPlanIds.map(id=>rows.find(r=>r.id===id)).filter(Boolean);
  if(!plans.length){toast('未找到可关联的发货计划');return;}
  const isBatch=plans.length>1;
  $('#planLinkTitle').textContent=isBatch?`关联 FBA 货件（共 ${plans.length} 个发货计划）`:`关联 FBA 货件｜${plans[0].plan}`;
  $('#planLinkAddRow').style.display='none';
  const tbody=$('#planLinkRows');tbody.innerHTML=plans.map(plan=>planLinkRowHtml(plan,isBatch)).join('');planLinkBindDel();
  $('#planLinkMask').classList.remove('hidden');$('#planLinkPopover').classList.remove('hidden');
}
function closePlanLinkShipmentPopover(){$('#planLinkMask').classList.add('hidden');$('#planLinkPopover').classList.add('hidden');planLinkPlanIds=[];}
function confirmPlanLinkShipment(){
  const trs=[...$('#planLinkRows').children];
  if(!trs.length){toast('请先添加关联行');return;}
  const pairs=[];
  for(const tr of trs){
    const planId=Number(tr.dataset.planId);
    const shipment=tr.querySelector('.plan-link-shipment-input').value.trim();
    if(!shipment){toast(`计划 ${rows.find(r=>r.id===planId).plan} 未填写 FBA 货件单号`);return;}
    pairs.push({planId,shipment});
  }
  const seen={};
  for(const p of pairs){if(seen[p.shipment]){toast(`货件号 ${p.shipment} 重复，不可关联两次`);return;}seen[p.shipment]=true;}
  for(const p of pairs){
    const conflict=rows.find(r=>r.id!==p.planId&&r.linkedShipments.includes(p.shipment));
    if(conflict){toast(`货件号 ${p.shipment} 已关联计划 ${conflict.plan}，无法重复关联`);return;}
  }
  for(const p of pairs){
    const row=rows.find(r=>r.id===p.planId);
    if(row&&row.status==='待发货'){row.linkedShipments.push(p.shipment);row.status='已完成';
      addPlanLog(row.id,'关联FBA货件',`SKU ${row.sku} 关联货件 ${p.shipment}`);}
  }
  closePlanLinkShipmentPopover();renderTable();toast('关联成功，发货计划已流转至「已完成」');
}
function initPlanLinkShipment(){
  if(!LINK_SHIPMENT_ENABLED){$('#linkShipmentBtn').style.display='none';return;}
  $('#linkShipmentBtn').onclick=()=>{
    const selected=[...state.selected];
    if(!selected.length){toast('请先勾选待发货的发货计划');return;}
    const plans=selected.map(id=>rows.find(r=>r.id===id)).filter(r=>r&&r.status==='待发货'&&!r.linkedShipments.length);
    if(!plans.length){toast('勾选中没有可关联的「待发货」计划');return;}
    openPlanLinkShipmentPopover(plans.map(r=>r.id));
  };
  $('#planLinkClose').onclick=closePlanLinkShipmentPopover;
  $('#planLinkMask').onclick=closePlanLinkShipmentPopover;
  $('#planLinkCancel').onclick=closePlanLinkShipmentPopover;
  $('#planLinkClear').onclick=()=>{$('#planLinkRows').querySelectorAll('.plan-link-shipment-input').forEach(input=>input.value='');};
  $('#planLinkConfirm').onclick=confirmPlanLinkShipment;
}
function initFbaView(){
  initFbaMulti('#fbaStoreMulti',fbaStoreOptions,'stores','店铺（可多选）');initFbaMulti('#fbaCountryMulti',fbaCountryOptions,'countries','国家（可多选）');fbaStatusMenu();renderFbaTable();
  $('#shipmentPlanTab').onclick=()=>switchShipmentModule('plan');$('#fbaShipmentTab').onclick=()=>switchShipmentModule('fba');
  $('#fbaStatusTrigger').onclick=event=>{event.stopPropagation();const isOpen=$('#fbaStatusMenu').classList.toggle('show');$('#fbaStatusTrigger').classList.toggle('open',isOpen);};$('#fbaStatusMenu').onclick=event=>event.stopPropagation();
  $('#fbaSearchBtn').onclick=()=>{readFbaQuery();fbaState.page=1;renderFbaTable();toast('查询完成');};$('#fbaResetBtn').onclick=()=>{resetFbaQuery();fbaStatusMenu();renderFbaTable();toast('已重置查询条件');};
  ['#fbaShipmentNo','#fbaPlanNo','#fbaSku','#fbaLxSku','#fbaFnsku','#fbaAsin','#fbaLogisticsCenter','#fbaReferenceId'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaSearchBtn').click();}));
  $('#fbaRefreshBtn').onclick=()=>{renderFbaTable();toast('FBA货件数据已刷新');};$('#fbaPrevPage').onclick=()=>{if(fbaState.page>1){fbaState.page--;renderFbaTable();}};$('#fbaNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/5));if(fbaState.page<pages){fbaState.page++;renderFbaTable();}};$('#fbaJumpPage').onchange=event=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/5));fbaState.page=Math.max(1,Math.min(pages,Number(event.target.value)||1));renderFbaTable();};
  $('#fbaPlanSearchBtn').onclick=()=>{readFbaPlanQuery();fbaState.planPage=1;renderFbaPlanList();};$('#fbaPlanResetBtn').onclick=()=>{resetFbaPlanQuery();renderFbaPlanList();};['#fbaPlanSearch','#fbaPlanSku','#fbaPlanFnsku'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaPlanSearchBtn').click();}));$('#fbaPopoverClose').onclick=closeFbaPlanPopover;$('#fbaLinkModalMask').onclick=closeFbaPlanPopover;$('#fbaUnlinkConfirmClose').onclick=closeFbaUnlinkConfirm;$('#fbaUnlinkCancel').onclick=closeFbaUnlinkConfirm;$('#fbaUnlinkConfirm').onclick=confirmFbaUnlink;$('#fbaUnlinkConfirmMask').onclick=event=>{if(event.target.id==='fbaUnlinkConfirmMask')closeFbaUnlinkConfirm();};$('#fbaPlanPrevPage').onclick=()=>{if(fbaState.planPage>1){fbaState.planPage--;renderFbaPlanList();}};$('#fbaPlanNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filteredFbaPlans().length/fbaState.planPageSize));if(fbaState.planPage<pages){fbaState.planPage++;renderFbaPlanList();}};
  document.addEventListener('click',event=>{if(!$('#fbaStatusFilter').contains(event.target))closeFbaStatusMenu();if(!event.target.closest('.fba-multi'))closeFbaMultiMenus();});
}
function switchShipmentModule(module){const isFba=module==='fba';$('#shipmentPlanView').classList.toggle('hidden',isFba);$('#fbaShipmentView').classList.toggle('hidden',!isFba);$('#shipmentPlanTab').classList.toggle('active',!isFba);$('#fbaShipmentTab').classList.toggle('active',isFba);if(!isFba)closeFbaPlanPopover();}
initFbaView();initPlanLinkShipment();

/* ===========================================================
 * 导入关联 FBA 货件（原型实现，仅支持 CSV 以便前端直接解析）
 * =========================================================== */
const IMPORT_LINK_FIELDS=['发货计划号','SKU','店铺','FNSKU','FBA货件单号'];
const IMPORT_LINK_HINTS=['必填，中台发货计划号','必填，发货计划中的 SKU','必填，店铺名称，需与发货计划一致','必填，亚马逊 FNSKU','必填，领星/亚马逊 FBA 货件单号'];
let importLinkState={file:null,templateDownloaded:false,parsedRows:[],resultItems:[]};
function openImportLinkDialog(){
  if(!IMPORT_LINK_ENABLED){toast('导入关联功能暂未开放','error');return;}
  importLinkState={file:null,templateDownloaded:importLinkState.templateDownloaded,parsedRows:[],resultItems:[]};
  renderImportStep(1);
  $('#importLinkFileInput').value='';
  $('#importLinkFileInfo').innerHTML='尚未选择文件';
  $('#importLinkConfirm').disabled=true;
  $('#importLinkResult').classList.add('hidden');
  $('#importLinkMask').classList.remove('hidden');
  $('#importLinkDialog').classList.remove('hidden');
}
function closeImportLinkDialog(){
  $('#importLinkDialog').classList.add('hidden');
  $('#importLinkMask').classList.add('hidden');
}
function renderImportStep(active){
  const steps=$$('#importLinkBody .import-step');
  steps.forEach((step,index)=>{
    const n=index+1;
    step.classList.toggle('active',n<=active);
    step.classList.toggle('done',n<active);
  });
}
function downloadImportLinkTemplate(){
  const headers=IMPORT_LINK_FIELDS.map(f=>`*${f}`);
  const csv='\ufeff'+headers.map(h=>`"${h}"`).join(',')+'\n'+
    IMPORT_LINK_HINTS.map(h=>`"${h}"`).join(',')+'\n'+
    ['SHP20260801-1','140US260008','ARCCAP','X00800001','FBA19JV2DS11'].map(v=>`"${v}"`).join(',')+'\n';
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='导入关联FBA货件模板.csv';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  importLinkState.templateDownloaded=true;
  renderImportStep(1);
  toast('模板已下载，请按模板填写后导入');
}
function importParseCsvLine(line){
  const out=[];let cur='',q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(q){
      if(c==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;
    }else{
      if(c==='"')q=true;
      else if(c===','){out.push(cur);cur='';}
      else cur+=c;
    }
  }
  out.push(cur);return out;
}
function onImportLinkFileChange(file){
  if(!file)return;
  const name=(file.name||'').toLowerCase();
  if(!['.xlsx','.xls','.csv'].some(ext=>name.endsWith(ext))){toast('文件格式不正确，请上传 .xlsx、.xls 或 .csv 文件','error');return;}
  if(!name.endsWith('.csv')){toast('原型版本仅支持 CSV 模板，正式版将支持 xls/xlsx','error');return;}
  importLinkState.file=file;
  $('#importLinkFileInfo').innerHTML=`<span class="file-name">当前文件：${file.name}</span><span class="file-remove" id="importLinkFileRemove">移除</span>`;
  $('#importLinkConfirm').disabled=false;
  renderImportStep(2);
  $('#importLinkFileRemove')?.addEventListener('click',e=>{e.stopPropagation();importLinkState.file=null;$('#importLinkFileInput').value='';$('#importLinkFileInfo').textContent='尚未选择文件';$('#importLinkConfirm').disabled=true;renderImportStep(importLinkState.templateDownloaded?1:1);});
}
function validateImportLinkHeaders(headerRow){
  const header=headerRow.map(h=>h.trim().replace(/^\*/,''));
  const missing=IMPORT_LINK_FIELDS.filter(f=>!header.includes(f));
  return {header,missing};
}
/* 在 fbaGroups 里查找：按 shipmentNo + SKU + FNSKU 找到对应 SKU 明细 */
function findFbaShipmentChild(shipmentNo,sku,fnsku){
  for(const g of fbaGroups){
    if(g.shipmentNo.toLowerCase()!==String(shipmentNo).toLowerCase())continue;
    const child=g.children.find(c=>String(c.sku).toLowerCase()===String(sku).toLowerCase()&&String(c.fnsku).toLowerCase()===String(fnsku).toLowerCase());
    if(child)return {group:g,child};
  }
  const groupOnly=fbaGroups.find(g=>g.shipmentNo.toLowerCase()===String(shipmentNo).toLowerCase());
  if(groupOnly)return {group:groupOnly,child:null};
  return null;
}
/* 目的仓匹配：计划的目的地仓 vs FBA货件的物流中心编码 */
function matchDestination(row,group){
  const planDest=(row.destinationWarehouse||'').toLowerCase().trim();
  const fbaCenter=(group&&group.center?group.center:'').toLowerCase().trim();
  if(!planDest||!fbaCenter)return true; /* 原型：任一为空则放行，避免影响演示 */
  return planDest===fbaCenter;
}
async function submitImportLink(){
  const file=importLinkState.file;
  if(!file){toast('请先选择需要导入的文件','error');return;}
  renderImportStep(2);
  const text=await new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result||'').replace(/^\ufeff/,''));
    r.onerror=()=>reject(new Error('文件读取失败'));
    r.readAsText(file);
  });
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2){toast('文件内容为空，导入失败','error');return;}
  const headerInfo=validateImportLinkHeaders(importParseCsvLine(lines[0]));
  if(headerInfo.missing.length){toast(`导入失败：模板表头缺少必填字段 ${headerInfo.missing.join('、')}`,'error');return;}
  const header=headerInfo.header;
  const idx=name=>header.indexOf(name);
  const dataLines=lines.slice(2);/* 首行表头、第二行示例/说明 */
  const items=[];
  const planSeen=new Set();/* 同一文件内禁止同一计划重复关联 */
  const childSeen=new Set();/* 同一文件内禁止同一货件SKU明细重复关联 */
  for(let i=0;i<dataLines.length;i++){
    const lineNo=i+3;
    const cells=importParseCsvLine(dataLines[i]);
    const planNo=(cells[idx('发货计划号')]||'').trim();
    const sku=(cells[idx('SKU')]||'').trim();
    const store=(cells[idx('店铺')]||'').trim();
    const fnsku=(cells[idx('FNSKU')]||'').trim();
    const shipmentNo=(cells[idx('FBA货件单号')]||'').trim();
    const item={lineNo,planNo,sku,store,fnsku,shipmentNo,status:'',msg:''};
    /* 1. 必填校验 */
    const empty=[];
    if(!planNo)empty.push('发货计划号');if(!sku)empty.push('SKU');if(!store)empty.push('店铺');if(!fnsku)empty.push('FNSKU');if(!shipmentNo)empty.push('FBA货件单号');
    if(empty.length){item.status='fail';item.msg=`必填字段缺失：${empty.join('、')}`;items.push(item);continue;}
    /* 2. 计划存在性 */
    const plan=rows.find(r=>r.plan===planNo);
    if(!plan){item.status='fail';item.msg='发货计划不存在';items.push(item);continue;}
    /* 3. 状态必须为待发货 */
    if(plan.status!=='待发货'){item.status='fail';item.msg=`发货计划状态为「${plan.status}」，仅待发货可关联`;items.push(item);continue;}
    /* 4. 同一计划已有关联 */
    if(plan.linkedShipments.length>0){item.status='fail';item.msg=`该计划已关联 FBA 货件 ${plan.linkedShipments.join('、')}`;items.push(item);continue;}
    /* 5. 文件内同一计划重复 */
    if(planSeen.has(planNo)){item.status='fail';item.msg='同一文件内计划号重复';items.push(item);continue;}
    planSeen.add(planNo);
    /* 6. SKU 匹配 */
    if(plan.sku.toLowerCase()!==sku.toLowerCase()){item.status='fail';item.msg=`SKU 与发货计划不一致（计划 SKU=${plan.sku}）`;items.push(item);continue;}
    /* 7. 店铺匹配 */
    if(plan.store!==store){item.status='fail';item.msg=`店铺与发货计划不一致（计划店铺=${plan.store}）`;items.push(item);continue;}
    /* 8. 货件是否已同步到中台 */
    const match=findFbaShipmentChild(shipmentNo,sku,fnsku);
    if(!match){
      /* 预关联：货件尚未同步，先记录关联，等同步后自动落地 */
      item.status='prelink';item.msg='FBA 货件尚未同步至中台，已记录预关联，待下次同步后自动完成关联';
      /* 原型里预关联直接写计划 linkedShipments 并保持待发货，加一个 tag 区分预关联状态 */
      if(!plan.prelinkShipments)plan.prelinkShipments=[];
      plan.prelinkShipments.push(shipmentNo);
      if(!plan.linkedShipments.includes(shipmentNo))plan.linkedShipments.push(shipmentNo);
      addPlanLog(plan.id,'预关联FBA货件',`SKU ${plan.sku} 预关联货件 ${shipmentNo}（货件待同步）`);
      items.push(item);continue;
    }
    /* 9. 货件 SKU 明细存在性 + FNSKU 匹配 */
    if(!match.child){
      item.status='fail';item.msg=`FBA 货件已存在，但未找到 SKU=${sku} 且 FNSKU=${fnsku} 的明细`;items.push(item);continue;
    }
    /* 10. 同一货件SKU明细已被其他计划关联 */
    if(match.child.linkedPlans&&match.child.linkedPlans.length>0){
      item.status='fail';item.msg=`该货件 SKU 已被计划 ${match.child.linkedPlans.join('、')} 关联，不可重复关联`;items.push(item);continue;
    }
    const childKey=`${shipmentNo}|${sku}|${fnsku}`;
    if(childSeen.has(childKey)){item.status='fail';item.msg='同一文件内货件+SKU+FNSKU 重复，不可重复关联';items.push(item);continue;}
    childSeen.add(childKey);
    /* 11. 目的仓匹配（计划目的地仓 vs 货件物流中心编码） */
    if(!matchDestination(plan,match.group)){
      item.status='fail';item.msg=`目的地仓不匹配（发货计划目的地仓=${plan.destinationWarehouse}，货件物流中心=${match.group.center}）`;items.push(item);continue;
    }
    /* 校验通过，执行关联 */
    plan.linkedShipments.push(shipmentNo);
    plan.status='已完成';
    match.child.linkedPlans=[plan.plan];
    addPlanLog(plan.id,'关联FBA货件',`SKU ${plan.sku} 关联货件 ${shipmentNo}（FNSKU=${fnsku}，店铺=${store}）`);
    item.status='success';item.msg=`关联成功，发货计划已流转至「已完成」`;
    items.push(item);
  }
  importLinkState.resultItems=items;
  renderImportLinkResult(items);
  renderImportStep(3);
  renderTable();
}
function renderImportLinkResult(items){
  const success=items.filter(x=>x.status==='success').length;
  const fail=items.filter(x=>x.status==='fail').length;
  const prelink=items.filter(x=>x.status==='prelink').length;
  $('#importLinkSuccessCount').textContent=success;
  $('#importLinkFailCount').textContent=fail;
  $('#importLinkPrelinkCount').textContent=prelink;
  $('#importLinkPrelinkWrap').style.display=prelink>0?'':'none';
  const label={success:'成功',fail:'失败',prelink:'预关联'};
  $('#importLinkResultBody').innerHTML=items.map(it=>`<tr class="${it.status}"><td>${label[it.status]||it.status}</td><td>${it.lineNo}</td><td>${it.planNo||'—'}</td><td>${it.sku||'—'}</td><td>${it.shipmentNo||'—'}</td><td>${it.msg||'—'}</td></tr>`).join('');
  $('#importLinkResult').classList.remove('hidden');
  toast(`导入完成：成功 ${success} 条 / 失败 ${fail} 条${prelink?' / 预关联 '+prelink+' 条':''}`);
}
function exportImportLinkFail(){
  const fails=importLinkState.resultItems.filter(x=>x.status==='fail');
  if(!fails.length){toast('没有失败行可导出');return;}
  const header=[...IMPORT_LINK_FIELDS,'失败原因'];
  const csv='\ufeff'+header.map(h=>`"${h}"`).join(',')+'\n'+fails.map(it=>[it.planNo,it.sku,it.store,it.fnsku,it.shipmentNo,it.msg].map(v=>`"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='导入关联FBA货件-失败行.csv';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
function initImportLink(){
  if(!IMPORT_LINK_ENABLED){
    const btn=$('#importLinkShipmentBtn');if(btn)btn.style.display='none';
    return;
  }
  $('#importLinkShipmentBtn').onclick=openImportLinkDialog;
  $('#importLinkClose').onclick=closeImportLinkDialog;
  $('#importLinkCancel').onclick=closeImportLinkDialog;
  $('#importLinkMask').onclick=e=>{if(e.target.id==='importLinkMask')closeImportLinkDialog();};
  $('#importLinkDownloadTpl').onclick=downloadImportLinkTemplate;
  $('#importLinkChooseFile').onclick=()=>$('#importLinkFileInput').click();
  $('#importLinkDropArea').onclick=()=>$('#importLinkFileInput').click();
  $('#importLinkFileInput').addEventListener('change',e=>onImportLinkFileChange(e.target.files[0]));
  ['dragenter','dragover'].forEach(ev=>$('#importLinkDropArea').addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();$('#importLinkDropArea').classList.add('drag-over');}));
  ['dragleave','drop'].forEach(ev=>$('#importLinkDropArea').addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();$('#importLinkDropArea').classList.remove('drag-over');}));
  $('#importLinkDropArea').addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];onImportLinkFileChange(f);if(f)$('#importLinkFileInput').files=e.dataTransfer.files;});
  $('#importLinkConfirm').onclick=submitImportLink;
  $('#importLinkExportFail').onclick=exportImportLinkFail;
}
initImportLink();
