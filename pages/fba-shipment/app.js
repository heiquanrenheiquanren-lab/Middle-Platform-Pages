/* FBA货件 独立页面脚本
 * 从发货计划（shipment-plan）拆分而来，保留：货件列表+查询、关联发货计划、取消关联、导入关联FBA货件。
 * 移除：发货计划自身的查询/列表、日志弹窗、tab 切换。
 */
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

/* 发货计划 mock 数据：仅供「关联发货计划 / 导入关联」做存在性、SKU/店铺/状态校验使用 */
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

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

/* 操作日志（内存记录，供导入/关联落记录；FBA 页面不展示日志弹窗） */
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
function toast(text,type='success'){
  const el=$('#toast');el.textContent=text;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800);
}
function splitValues(value){return [...new Set(value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}

/* ===================== FBA 货件数据 ===================== */
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

/* ===================== FBA 查询与列表 ===================== */
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

/* ===================== 关联发货计划 ===================== */
const fbaPopupDefaults={sku:'',fnsku:'',store:''};
function filteredFbaPlans(){
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
  $$('[data-fba-plan-row]').forEach(row=>row.onclick=event=>{const plan=fbaPlanOptions.find(item=>item.id===row.dataset.fbaPlanRow);fbaState.activeChildIds.forEach(id=>{const child=fbaGroups.flatMap(group=>group.children).find(item=>item.id===id);if(child)child.linkedPlans=[plan.plan];});closeFbaPlanPopover();renderFbaTable();toast(`已关联发货计划 ${plan.plan}`);});
}
function findFbaChild(childId){return fbaGroups.flatMap(group=>group.children).find(child=>child.id===childId);}
function openFbaUnlinkConfirm(childId){const child=findFbaChild(childId);if(!child||!child.linkedPlans.length)return;fbaState.pendingUnlink=childId;const linkedPlan=child.linkedPlans[0];$('#fbaUnlinkConfirmText').textContent=`确定要取消当前 SKU「${child.sku}」与发货计划「${linkedPlan}」的关联吗？取消后，该 SKU 将恢复为未关联状态，可重新关联发货计划。`;$('#fbaUnlinkConfirmMask').classList.remove('hidden');}
function closeFbaUnlinkConfirm(){fbaState.pendingUnlink=null;$('#fbaUnlinkConfirmMask').classList.add('hidden');}
function confirmFbaUnlink(){const child=findFbaChild(fbaState.pendingUnlink);if(child){const linkedPlan=child.linkedPlans[0]||'';child.linkedPlans=[];closeFbaUnlinkConfirm();renderFbaTable();toast(`已取消关联发货计划 ${linkedPlan}`);}}
function readFbaPlanQuery(){fbaState.planSearch=$('#fbaPlanSearch').value;fbaState.planSku=$('#fbaPlanSku').value;fbaState.planFnsku=$('#fbaPlanFnsku').value;}
function resetFbaPlanQuery(){
  fbaState.planSearch='';fbaState.planSku='';fbaState.planFnsku='';fbaState.planPage=1;
  $('#fbaPlanSearch').value='';$('#fbaPlanSku').value='';$('#fbaPlanFnsku').value='';
  $('#fbaPlanDefaultStore').textContent=fbaPopupDefaults.store||'—';
  $('#fbaPlanDefaultSku').textContent=fbaPopupDefaults.sku||'—';
  $('#fbaPlanDefaultFnsku').textContent=fbaPopupDefaults.fnsku||'—';
}
function openFbaPlanPopover(childIds){
  fbaState.activeChildIds=childIds;
  const contexts=childIds.map(id=>{for(const group of fbaGroups){const child=group.children.find(item=>item.id===id);if(child)return {group,child};}return null;}).filter(Boolean);
  fbaPopupDefaults.sku=contexts.length?contexts[0].child.sku:'';
  fbaPopupDefaults.fnsku=contexts.length?contexts[0].child.fnsku:'';
  fbaPopupDefaults.store=contexts.length&&contexts.every(x=>x.group.seller===contexts[0].group.seller)?contexts[0].group.seller:'';
  resetFbaPlanQuery();renderFbaPlanList();
  $('#fbaLinkModalMask').classList.remove('hidden');$('#fbaLinkPopover').classList.remove('hidden');
}
function closeFbaPlanPopover(){$('#fbaLinkModalMask').classList.add('hidden');$('#fbaLinkPopover').classList.add('hidden');fbaState.activeChildIds=[];fbaPopupDefaults.sku='';fbaPopupDefaults.fnsku='';fbaPopupDefaults.store='';}

/* ===================== 导入关联 FBA 货件 ===================== */
const IMPORT_LINK_FIELDS=['发货计划号','SKU','店铺','FNSKU','FBA货件单号'];
const IMPORT_LINK_HINTS=['必填，中台发货计划号','必填，发货计划中的 SKU','必填，店铺名称，需与发货计划一致','必填，亚马逊 FNSKU','必填，领星/亚马逊 FBA 货件单号'];
let importLinkState={file:null,templateDownloaded:false,parsedRows:[],resultItems:[]};
function openImportLinkDialog(){
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
  $('#importLinkFileRemove')?.addEventListener('click',e=>{e.stopPropagation();importLinkState.file=null;$('#importLinkFileInput').value='';$('#importLinkFileInfo').textContent='尚未选择文件';$('#importLinkConfirm').disabled=true;renderImportStep(1);});
}
function validateImportLinkHeaders(headerRow){
  const header=headerRow.map(h=>h.trim().replace(/^\*/,''));
  const missing=IMPORT_LINK_FIELDS.filter(f=>!header.includes(f));
  return {header,missing};
}
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
function matchDestination(row,group){
  const planDest=(row.destinationWarehouse||'').toLowerCase().trim();
  const fbaCenter=(group&&group.center?group.center:'').toLowerCase().trim();
  if(!planDest||!fbaCenter)return true;
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
  const dataLines=lines.slice(2);
  const items=[];
  const planSeen=new Set();
  const childSeen=new Set();
  for(let i=0;i<dataLines.length;i++){
    const lineNo=i+3;
    const cells=importParseCsvLine(dataLines[i]);
    const planNo=(cells[idx('发货计划号')]||'').trim();
    const sku=(cells[idx('SKU')]||'').trim();
    const store=(cells[idx('店铺')]||'').trim();
    const fnsku=(cells[idx('FNSKU')]||'').trim();
    const shipmentNo=(cells[idx('FBA货件单号')]||'').trim();
    const item={lineNo,planNo,sku,store,fnsku,shipmentNo,status:'',msg:''};
    const empty=[];
    if(!planNo)empty.push('发货计划号');if(!sku)empty.push('SKU');if(!store)empty.push('店铺');if(!fnsku)empty.push('FNSKU');if(!shipmentNo)empty.push('FBA货件单号');
    if(empty.length){item.status='fail';item.msg=`必填字段缺失：${empty.join('、')}`;items.push(item);continue;}
    const plan=rows.find(r=>r.plan===planNo);
    if(!plan){item.status='fail';item.msg='发货计划不存在';items.push(item);continue;}
    if(plan.status!=='待发货'){item.status='fail';item.msg=`发货计划状态为「${plan.status}」，仅待发货可关联`;items.push(item);continue;}
    if(plan.linkedShipments.length>0){item.status='fail';item.msg=`该计划已关联 FBA 货件 ${plan.linkedShipments.join('、')}`;items.push(item);continue;}
    if(planSeen.has(planNo)){item.status='fail';item.msg='同一文件内计划号重复';items.push(item);continue;}
    planSeen.add(planNo);
    if(plan.sku.toLowerCase()!==sku.toLowerCase()){item.status='fail';item.msg=`SKU 与发货计划不一致（计划 SKU=${plan.sku}）`;items.push(item);continue;}
    if(plan.store!==store){item.status='fail';item.msg=`店铺与发货计划不一致（计划店铺=${plan.store}）`;items.push(item);continue;}
    const match=findFbaShipmentChild(shipmentNo,sku,fnsku);
    if(!match){
      item.status='prelink';item.msg='FBA 货件尚未同步至中台，已记录预关联，待下次同步后自动完成关联';
      if(!plan.prelinkShipments)plan.prelinkShipments=[];
      plan.prelinkShipments.push(shipmentNo);
      if(!plan.linkedShipments.includes(shipmentNo))plan.linkedShipments.push(shipmentNo);
      addPlanLog(plan.id,'预关联FBA货件',`SKU ${plan.sku} 预关联货件 ${shipmentNo}（货件待同步）`);
      items.push(item);continue;
    }
    if(!match.child){
      item.status='fail';item.msg=`FBA 货件已存在，但未找到 SKU=${sku} 且 FNSKU=${fnsku} 的明细`;items.push(item);continue;
    }
    if(match.child.linkedPlans&&match.child.linkedPlans.length>0){
      item.status='fail';item.msg=`该货件 SKU 已被计划 ${match.child.linkedPlans.join('、')} 关联，不可重复关联`;items.push(item);continue;
    }
    const childKey=`${shipmentNo}|${sku}|${fnsku}`;
    if(childSeen.has(childKey)){item.status='fail';item.msg='同一文件内货件+SKU+FNSKU 重复，不可重复关联';items.push(item);continue;}
    childSeen.add(childKey);
    if(!matchDestination(plan,match.group)){
      item.status='fail';item.msg=`目的地仓不匹配（发货计划目的地仓=${plan.destinationWarehouse}，货件物流中心=${match.group.center}）`;items.push(item);continue;
    }
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

/* ===================== 初始化（无 tab 切换） ===================== */
function initFbaView(){
  initFbaMulti('#fbaStoreMulti',fbaStoreOptions,'stores','店铺（可多选）');initFbaMulti('#fbaCountryMulti',fbaCountryOptions,'countries','国家（可多选）');fbaStatusMenu();renderFbaTable();
  $('#fbaStatusTrigger').onclick=event=>{event.stopPropagation();const isOpen=$('#fbaStatusMenu').classList.toggle('show');$('#fbaStatusTrigger').classList.toggle('open',isOpen);};$('#fbaStatusMenu').onclick=event=>event.stopPropagation();
  $('#fbaSearchBtn').onclick=()=>{readFbaQuery();fbaState.page=1;renderFbaTable();toast('查询完成');};$('#fbaResetBtn').onclick=()=>{resetFbaQuery();fbaStatusMenu();renderFbaTable();toast('已重置查询条件');};
  ['#fbaShipmentNo','#fbaPlanNo','#fbaSku','#fbaLxSku','#fbaFnsku','#fbaAsin','#fbaLogisticsCenter','#fbaReferenceId'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaSearchBtn').click();}));
  $('#fbaRefreshBtn').onclick=()=>{renderFbaTable();toast('FBA货件数据已刷新');};$('#fbaPrevPage').onclick=()=>{if(fbaState.page>1){fbaState.page--;renderFbaTable();}};$('#fbaNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/5));if(fbaState.page<pages){fbaState.page++;renderFbaTable();}};$('#fbaJumpPage').onchange=event=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/5));fbaState.page=Math.max(1,Math.min(pages,Number(event.target.value)||1));renderFbaTable();};
  $('#fbaPlanSearchBtn').onclick=()=>{readFbaPlanQuery();fbaState.planPage=1;renderFbaPlanList();};$('#fbaPlanResetBtn').onclick=()=>{resetFbaPlanQuery();renderFbaPlanList();};['#fbaPlanSearch','#fbaPlanSku','#fbaPlanFnsku'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaPlanSearchBtn').click();}));$('#fbaPopoverClose').onclick=closeFbaPlanPopover;$('#fbaLinkModalMask').onclick=closeFbaPlanPopover;$('#fbaUnlinkConfirmClose').onclick=closeFbaUnlinkConfirm;$('#fbaUnlinkCancel').onclick=closeFbaUnlinkConfirm;$('#fbaUnlinkConfirm').onclick=confirmFbaUnlink;$('#fbaUnlinkConfirmMask').onclick=event=>{if(event.target.id==='fbaUnlinkConfirmMask')closeFbaUnlinkConfirm();};$('#fbaPlanPrevPage').onclick=()=>{if(fbaState.planPage>1){fbaState.planPage--;renderFbaPlanList();}};$('#fbaPlanNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filteredFbaPlans().length/fbaState.planPageSize));if(fbaState.planPage<pages){fbaState.planPage++;renderFbaPlanList();}};
  document.addEventListener('click',event=>{if(!$('#fbaStatusFilter').contains(event.target))closeFbaStatusMenu();if(!event.target.closest('.fba-multi'))closeFbaMultiMenus();});
}
initFbaView();initImportLink();