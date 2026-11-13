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
const fbaState={status:'',noType:'shipmentNo',noQuery:'',codeType:'sku',codeQuery:'',stores:[],countries:[],association:'unlinked',startDate:'',endDate:'',page:1,pageSize:10,planPage:1,planPageSize:7,planSearch:'',planSku:'',planFnsku:'',planStore:'',activeChildIds:[],pendingUnlink:null,expanded:new Set()};
const fbaStatusClass={'已登记':'info','已发货':'info','运输中':'transit','接收中':'partial','已送达':'done','已关闭':'muted','已删除':'muted','已取消':'void'};
const fbaNoPlaceholders={shipmentNo:'请输入货件单号，支持多个',planNo:'请输入发货计划号，支持多个',center:'请输入物流中心编码，支持多个',reference:'请输入 Reference ID，支持多个'};
const fbaCodePlaceholders={sku:'请输入 SKU，支持多个',lxSku:'请输入领星 SKU，支持多个',fnsku:'请输入 FNSKU，支持多个',asin:'请输入 ASIN，支持多个'};
let fbaStoreSelect=null,fbaCountrySelect=null,fbaQueryExpanded=false;

/* ===================== FBA 查询与列表 ===================== */
function fbaExactMatch(value,query){const terms=splitValues(query||'');return !terms.length||terms.includes(String(value||'').toLowerCase());}
function fbaLinked(child){return Boolean(child.linkedPlans.length);}
function fbaNoFieldValue(group,child){
  return {shipmentNo:group.shipmentNo,planNo:[child.plan,...child.linkedPlans].join(' '),center:group.center,reference:group.reference}[fbaState.noType]||'';
}
function fbaCodeFieldValue(child){
  return {sku:child.sku,lxSku:child.lxSku,fnsku:child.fnsku,asin:child.asin}[fbaState.codeType]||'';
}
function getFbaVisibleGroups(){
  return fbaGroups.filter(group=>{
    const created=group.created.slice(0,10);
    return (!fbaState.status||group.status===fbaState.status)&&(!fbaState.stores.length||fbaState.stores.includes(group.seller))&&(!fbaState.countries.length||fbaState.countries.includes(group.country))&&(!fbaState.startDate||created>=fbaState.startDate)&&(!fbaState.endDate||created<=fbaState.endDate);
  }).map(group=>({...group,children:group.children.filter(child=>{
    const associationMatch=!fbaState.association||(fbaState.association==='linked'?fbaLinked(child):!fbaLinked(child));
    return fbaExactMatch(fbaNoFieldValue(group,child),fbaState.noQuery)&&fbaExactMatch(fbaCodeFieldValue(child),fbaState.codeQuery)&&associationMatch;
  })})).filter(group=>group.children.length);
}
function initFbaMultis(){
  fbaStoreSelect=window.createUiMultiSelect({root:'#fbaStoreMulti',options:fbaStoreOptions,values:fbaState.stores,placeholder:'请选择店铺',onChange:values=>{fbaState.stores=values;}});
  fbaCountrySelect=window.createUiMultiSelect({root:'#fbaCountryMulti',options:fbaCountryOptions,values:fbaState.countries,placeholder:'请选择国家',onChange:values=>{fbaState.countries=values;}});
}
function syncFbaPlaceholders(){
  $('#fbaNoInput').placeholder=fbaNoPlaceholders[$('#fbaNoType').value]||fbaNoPlaceholders.shipmentNo;
  $('#fbaCodeInput').placeholder=fbaCodePlaceholders[$('#fbaCodeType').value]||fbaCodePlaceholders.sku;
}
function readFbaQuery(){
  fbaState.status=$('#fbaStatus').value;fbaState.noType=$('#fbaNoType').value;fbaState.noQuery=$('#fbaNoInput').value;fbaState.codeType=$('#fbaCodeType').value;fbaState.codeQuery=$('#fbaCodeInput').value;fbaState.association=$('#fbaAssociation').value;fbaState.startDate=$('#fbaStartDate').value;fbaState.endDate=$('#fbaEndDate').value;
}
function resetFbaQuery(){
  fbaState.status='';fbaState.noType='shipmentNo';fbaState.noQuery='';fbaState.codeType='sku';fbaState.codeQuery='';fbaState.stores=[];fbaState.countries=[];fbaState.association='unlinked';fbaState.startDate='';fbaState.endDate='';fbaState.page=1;
  $('#fbaStatus').value='';$('#fbaNoType').value='shipmentNo';$('#fbaNoInput').value='';$('#fbaCodeType').value='sku';$('#fbaCodeInput').value='';$('#fbaAssociation').value='unlinked';$('#fbaStartDate').value='';$('#fbaEndDate').value='';
  fbaStoreSelect?.setValues([]);fbaCountrySelect?.setValues([]);syncFbaPlaceholders();
}
function fbaStatusTag(status){return `<span class="status-tag fba-status-${fbaStatusClass[status]||'muted'}">${status}</span>`;}
function fbaStripRow(group){
  const expanded=fbaState.expanded.has(group.id);
  const totalDeclared=group.children.reduce((sum,child)=>sum+Number(child.declared||0),0);
  const totalSent=group.children.reduce((sum,child)=>sum+Number(child.sent||0),0);
  const detailRow=expanded?`<tr class="fba-detail-row" data-parent-id="${group.id}"><td colspan="8"><div class="fba-detail-wrap"><table class="fba-detail-table"><colgroup><col style="width:160px"><col style="width:120px"><col style="width:170px"><col style="width:145px"><col style="width:105px"><col style="width:120px"><col style="width:75px"><col style="width:85px"><col style="width:75px"><col style="width:85px"><col style="width:85px"><col style="width:85px"><col style="width:150px"><col style="width:150px"><col style="width:110px"></colgroup><thead><tr><th>SKU</th><th>领星SKU</th><th>品名</th><th>计划号</th><th>Asin</th><th>FNSKU</th><th>申报量</th><th>已发货量</th><th>签收量</th><th>申发差异</th><th>收发差异</th><th>申收差异</th><th>发货单号</th><th>备注</th><th>操作</th></tr></thead><tbody>${group.children.map(child=>{
    const shipDiff=child.declared-child.sent,receiveDiff=child.sent-child.received,declareReceiveDiff=child.declared-child.received,linked=child.linkedPlans.length;
    return `<tr><td class="fba-sku-cell"><div class="fba-product"><span class="fba-thumb">${child.icon}</span><b>${child.sku}</b></div></td><td>${child.lxSku}</td><td class="fba-product-name" title="${child.product}">${child.product}</td><td>${child.plan||'—'}</td><td>${child.asin||'—'}</td><td>${child.fnsku}</td><td>${child.declared}</td><td>${child.sent}</td><td>${child.received}</td><td>${shipDiff}</td><td>${receiveDiff}</td><td>${declareReceiveDiff}</td><td>${child.shippingNo||'—'}</td><td><input class="fba-remark" data-fba-remark="${child.id}" placeholder="请输入备注" value="${child.remark}"></td><td>${linked?`<button class="fba-link-action unlink" data-fba-unlink="${child.id}" type="button">取消关联</button>`:`<button class="fba-link-action" data-fba-link="${child.id}" type="button">关联发货计划</button>`}</td></tr>`;}).join('')}</tbody></table></div></td></tr>`:'';
  return `<tr class="fba-parent-row ${expanded?'is-expanded':''}" data-id="${group.id}">
    <td class="fba-expand-cell"><button class="document-expand ${expanded?'is-expanded':''}" data-fba-toggle="${group.id}" type="button" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'} SKU 明细"></button></td>
    <td><div class="doc-line"><a class="fba-no" data-fba-toggle="${group.id}" title="${expanded?'收起':'展开'} SKU 明细">${group.shipmentNo}</a>${fbaStatusTag(group.status)}</div></td>
    <td><div class="stack-cell"><b>${group.center}</b><span>${group.reference}</span></div></td>
    <td><div class="stack-cell"><b>${group.seller}</b><span>${group.country}</span></div></td>
    <td><div class="stack-cell"><b>${group.shipWarehouse||'—'}</b><span>${group.destination||'—'}</span></div></td>
    <td>${group.created}</td>
    <td><div class="stack-cell"><b>${group.deliveryTime||'—'}</b><span>${group.transport||'—'}</span></div></td>
    <td><div class="stack-cell"><b>${group.children.length} 个 SKU</b><span>申报量 ${totalDeclared} · 已发货量 ${totalSent}</span></div></td>
  </tr>${detailRow}`;
}
function renderFbaTable(){
  const groups=getFbaVisibleGroups(),totalSkus=groups.reduce((sum,group)=>sum+group.children.length,0),pages=Math.max(1,Math.ceil(groups.length/fbaState.pageSize));
  fbaState.page=Math.min(fbaState.page,pages);const data=groups.slice((fbaState.page-1)*fbaState.pageSize,fbaState.page*fbaState.pageSize);
  $('#fbaTotalCount').textContent=groups.length;$('#fbaSummary').innerHTML=`共 <b>${groups.length}</b> 个货件 · <b>${totalSkus}</b> 个 SKU`;$('#fbaJumpPage').value=fbaState.page;$('#fbaPrevPage').disabled=fbaState.page===1;$('#fbaNextPage').disabled=fbaState.page===pages;
  $('#fbaPageButtons').innerHTML=Array.from({length:Math.min(pages,4)},(_,index)=>`<button class="page-btn ${fbaState.page===index+1?'current':''}" data-fba-page="${index+1}">${index+1}</button>`).join('')+(pages>4?'<span>…</span>':'');
  $$('[data-fba-page]').forEach(button=>button.onclick=()=>{fbaState.page=Number(button.dataset.fbaPage);renderFbaTable();});
  const expandAll=$('#fbaExpandAllBtn'),allExpanded=data.length>0&&data.every(group=>fbaState.expanded.has(group.id));
  expandAll.classList.toggle('open',allExpanded);expandAll.setAttribute('aria-expanded',String(allExpanded));expandAll.title=allExpanded?'收起全部货件':'展开全部货件';expandAll.setAttribute('aria-label',expandAll.title);
  expandAll.onclick=()=>{data.forEach(group=>allExpanded?fbaState.expanded.delete(group.id):fbaState.expanded.add(group.id));renderFbaTable();};
  if(!data.length){$('#fbaTableBody').innerHTML='<tr class="fba-empty-row"><td colspan="8">暂无符合条件的货件</td></tr>';return;}
  $('#fbaTableBody').innerHTML=data.map(fbaStripRow).join('');
  $$('[data-fba-toggle]').forEach(button=>button.onclick=()=>{const id=button.dataset.fbaToggle;fbaState.expanded.has(id)?fbaState.expanded.delete(id):fbaState.expanded.add(id);renderFbaTable();});
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
  if(!data.length){$('#fbaPlanListBody').innerHTML='<tr class="fba-plan-empty"><td colspan="11">暂无符合条件的发货计划</td></tr>';return;}
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

/* ===================== 查询区：两行折叠 ===================== */
function setFbaQueryExpandUi(){
  const button=$('#queryExpand');button.querySelector('.query-expand-text').textContent=fbaQueryExpanded?'收起':'展开';button.setAttribute('aria-expanded',String(fbaQueryExpanded));
  $('#queryCard').classList.toggle('query-collapsed',!fbaQueryExpanded);
}
function layoutFbaQuery(){
  const panel=$('#queryCard'),grid=$('#queryGrid'),button=$('#queryExpand');if(!panel||!grid||!button)return;
  panel.classList.remove('query-collapsed');
  grid.querySelectorAll('.query-overflow-item').forEach(item=>item.classList.remove('query-overflow-item'));
  const items=[...grid.querySelectorAll('.query-item:not(.query-action-item)')],actionItem=grid.querySelector('.query-action-item');
  if(!items.length||!actionItem)return;
  button.hidden=false;
  const gridWidth=grid.getBoundingClientRect().width,gap=parseFloat(getComputedStyle(grid).columnGap)||0,btnWidth=actionItem.getBoundingClientRect().width;
  const widthMap=new Map(items.map(item=>[item,item.getBoundingClientRect().width]));
  const rows=[];let row=[],rowWidth=0;
  items.forEach(item=>{const width=widthMap.get(item);if(row.length&&rowWidth+gap+width>gridWidth+1){rows.push(row);row=[];rowWidth=0;}rowWidth+=(row.length?gap:0)+width;row.push(item);});
  if(row.length)rows.push(row);
  const actionOwnRow=btnWidth>=gridWidth*0.95,overflowSet=new Set();
  if(rows.length>2)rows.slice(2).forEach(group=>group.forEach(item=>overflowSet.add(item)));
  if(rows.length>=2&&!actionOwnRow){let used=0;rows[1].forEach(item=>{const width=widthMap.get(item),next=used+(used?gap:0)+width;if(next+gap+btnWidth<=gridWidth+1)used=next;else overflowSet.add(item);});}
  overflowSet.forEach(item=>item.classList.add('query-overflow-item'));
  if(!overflowSet.size)fbaQueryExpanded=false;
  button.hidden=!overflowSet.size;
  setFbaQueryExpandUi();
}

/* ===================== 初始化（无 tab 切换） ===================== */
function initFbaView(){
  initFbaMultis();syncFbaPlaceholders();layoutFbaQuery();renderFbaTable();
  $('#queryExpand').onclick=()=>{fbaQueryExpanded=!fbaQueryExpanded;setFbaQueryExpandUi();};
  $('#fbaNoType').onchange=syncFbaPlaceholders;$('#fbaCodeType').onchange=syncFbaPlaceholders;
  $('#fbaSearchBtn').onclick=()=>{readFbaQuery();fbaState.page=1;renderFbaTable();toast('查询完成');};
  $('#fbaResetBtn').onclick=()=>{resetFbaQuery();renderFbaTable();toast('已重置查询条件');};
  ['#fbaNoInput','#fbaCodeInput'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaSearchBtn').click();}));
  $('#fbaRefreshBtn').onclick=()=>{renderFbaTable();toast('FBA货件数据已刷新');};
  $('#fbaPageSize').onchange=event=>{fbaState.pageSize=Number(event.target.value)||10;fbaState.page=1;renderFbaTable();};
  $('#fbaPrevPage').onclick=()=>{if(fbaState.page>1){fbaState.page--;renderFbaTable();}};
  $('#fbaNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/fbaState.pageSize));if(fbaState.page<pages){fbaState.page++;renderFbaTable();}};
  $('#fbaJumpPage').onchange=event=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/fbaState.pageSize));fbaState.page=Math.max(1,Math.min(pages,Number(event.target.value)||1));renderFbaTable();};
  $('#fbaPlanSearchBtn').onclick=()=>{readFbaPlanQuery();fbaState.planPage=1;renderFbaPlanList();};$('#fbaPlanResetBtn').onclick=()=>{resetFbaPlanQuery();renderFbaPlanList();};['#fbaPlanSearch','#fbaPlanSku','#fbaPlanFnsku'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaPlanSearchBtn').click();}));$('#fbaPopoverClose').onclick=closeFbaPlanPopover;$('#fbaLinkModalMask').onclick=closeFbaPlanPopover;$('#fbaUnlinkConfirmClose').onclick=closeFbaUnlinkConfirm;$('#fbaUnlinkCancel').onclick=closeFbaUnlinkConfirm;$('#fbaUnlinkConfirm').onclick=confirmFbaUnlink;$('#fbaUnlinkConfirmMask').onclick=event=>{if(event.target.id==='fbaUnlinkConfirmMask')closeFbaUnlinkConfirm();};$('#fbaPlanPrevPage').onclick=()=>{if(fbaState.planPage>1){fbaState.planPage--;renderFbaPlanList();}};$('#fbaPlanNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filteredFbaPlans().length/fbaState.planPageSize));if(fbaState.planPage<pages){fbaState.planPage++;renderFbaPlanList();}};
  window.addEventListener('resize',()=>{layoutFbaQuery();});
}
initFbaView();initImportLink();