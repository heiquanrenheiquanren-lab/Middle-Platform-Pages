(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const warehouses=['东莞采购仓','深圳采购仓','宁波采购仓','义乌采购仓','洛杉矶海外仓'];
const buyers=['张敏','李晨','王磊','赵倩'];
const statusDefs=[['all','全部'],['pending','待审核'],['effective','已生效'],['rejected','已驳回'],['void','已作废']];
const statusText={pending:'待审核',effective:'已生效',rejected:'已驳回',void:'已作废'};
const fieldNames={
  warehouse:'采购仓库',
  buyer:'采购负责人',
  settlement:'结算方式',
  prepayRate:'预付比例',
  taxIncluded:'是否含税',
  tax:'税率',
  freight:'运费',
  otherFee:'其他费用',
  discount:'优惠金额',
  quantity:'采购数',
  price:'采购单价'
};
const settlementOptions=['月结30天','月结90天','月结150天','月结180天','款到发货','预款20%，余款80%款到发货','预款30%，余款70%款到发货'];
const baseFieldKeys=['warehouse','buyer','settlement','prepayRate','taxIncluded','tax','freight','otherFee','discount'];

const purchaseOrders=[
 {id:'PO202610280016',status:'待到齐',erpSource:'领星',erpNo:'LXPO2026610016',supplier:'东莞市精工焊接设备有限公司',supplierCode:'DG-004',purchaseSubject:'焊捷供应链（深圳）有限公司',creator:'王磊',createdAt:'2026-08-09 10:20',warehouse:'东莞采购仓',buyer:'张敏',settlement:'月结30天',prepayRate:20,taxIncluded:'是',tax:13,paid:false,invoiced:false,remark:'请按分批交期送货，入库前提前一天预约。',freight:300,otherFee:80,discount:100,items:[
  {sku:'140US260008',lingxingSku:'LXSKU-360008',supplierItemNo:'SUP-110700',name:'140US 焊接工具套装',planNo:'CGJH2026081006',team:'亚马逊团队',lastPurchasePrice:14.2,lastPurchaseTaxIncluded:'是',quantity:100,received:0,price:128},
  {sku:'42101000004',lingxingSku:'LXSKU-360009',supplierItemNo:'SUP-110701',name:'焊接防护手套（加长耐磨款）',planNo:'CGJH2026081007',team:'Jasic团队',lastPurchasePrice:16.5,lastPurchaseTaxIncluded:'是',quantity:300,received:0,price:15.8},
  {sku:'DD123456',lingxingSku:'LXSKU-360010',supplierItemNo:'—',name:'自动变光焊接面罩',planNo:'CGJH2026081008',team:'eBay团队',lastPurchasePrice:19.9,lastPurchaseTaxIncluded:'否',quantity:80,received:0,price:186}
 ]},
 {id:'PO202610290008',status:'待到齐',erpSource:'易仓',erpNo:'ECPO20260008',supplier:'深圳市锐焊科技有限公司',supplierCode:'SZ-012',purchaseSubject:'焊捷供应链（深圳）有限公司',creator:'李晨',createdAt:'2026-08-10 11:30',warehouse:'深圳采购仓',buyer:'李晨',settlement:'款到发货',prepayRate:100,taxIncluded:'否',tax:0,paid:true,invoiced:false,remark:'',freight:0,otherFee:50,discount:0,items:[
  {sku:'EE123456',lingxingSku:'LXSKU-360011',supplierItemNo:'SUP-110703',name:'电焊钳 300A 纯铜锻造',planNo:'CGJH2026081011',team:'独立站团队',lastPurchasePrice:30.0,lastPurchaseTaxIncluded:'否',quantity:200,received:0,price:32.5},
  {sku:'FF123456',lingxingSku:'LXSKU-360012',supplierItemNo:'—',name:'焊机快速接头套装',planNo:'CGJH2026081012',team:'亚马逊团队',lastPurchasePrice:8.0,lastPurchaseTaxIncluded:'否',quantity:500,received:0,price:8.6}
 ]},
 {id:'PO202610300021',status:'待到齐',erpSource:'领星',erpNo:'LXPO2026610021',supplier:'宁波恒泰五金制造有限公司',supplierCode:'NB-008',purchaseSubject:'焊捷供应链（深圳）有限公司',creator:'王磊',createdAt:'2026-08-11 14:15',warehouse:'宁波采购仓',buyer:'王磊',settlement:'月结90天',prepayRate:0,taxIncluded:'是',tax:13,paid:false,invoiced:true,remark:'供应商大件货物需专车配送。',freight:450,otherFee:0,discount:200,items:[
  {sku:'KK123456',lingxingSku:'LXSKU-360021',supplierItemNo:'SUP-110706',name:'工业级焊接电缆 35 平方',planNo:'CGJH2026081021',team:'Jasic团队',lastPurchasePrice:250,lastPurchaseTaxIncluded:'是',quantity:120,received:0,price:265},
  {sku:'XX123456-1',lingxingSku:'LXSKU-360022',supplierItemNo:'SUP-110707',name:'气保焊枪配件组合包',planNo:'CGJH2026081022',team:'eBay团队',lastPurchasePrice:380,lastPurchaseTaxIncluded:'否',quantity:60,received:0,price:398},
  {sku:'fan-test-sku',lingxingSku:'LXSKU-360023',supplierItemNo:'—',name:'焊机散热风扇',planNo:'CGJH2026081023',team:'沃尔玛团队',lastPurchasePrice:21.5,lastPurchaseTaxIncluded:'是',quantity:240,received:0,price:22.8}
 ]},
 {id:'PO202610270006',status:'待到齐',erpSource:'领星',erpNo:'LXPO2026610006',supplier:'华南五金制品有限公司',supplierCode:'HN-003',purchaseSubject:'焊捷供应链（深圳）有限公司',creator:'赵倩',createdAt:'2026-08-08 09:00',warehouse:'东莞采购仓',buyer:'赵倩',settlement:'月结30天',prepayRate:0,taxIncluded:'是',tax:13,paid:false,invoiced:false,remark:'已有部分 SKU 到货。',freight:80,otherFee:0,discount:0,items:[
  {sku:'A-7701',lingxingSku:'LXSKU-360031',supplierItemNo:'SUP-110709',name:'焊枪保护套',planNo:'CGJH2026081031',team:'亚马逊团队',lastPurchasePrice:12.0,lastPurchaseTaxIncluded:'否',quantity:200,received:80,price:12.5},
  {sku:'B-6602',lingxingSku:'LXSKU-360032',supplierItemNo:'—',name:'导电嘴 1.2mm',planNo:'CGJH2026081032',team:'eBay团队',lastPurchasePrice:3.0,lastPurchaseTaxIncluded:'否',quantity:500,received:0,price:3.2}
 ]}
];

function clone(value){return JSON.parse(JSON.stringify(value));}
function total(order){
  const itemsSum=(order.items||[]).reduce((sum,item)=>sum+Number(item.quantity||0)*Number(item.price||0),0);
  return itemsSum+Number(order.freight||0)+Number(order.otherFee||0)-Number(order.discount||0);
}
function money(value){return Number(value||0).toFixed(2);}
function number(value){return Number(value||0).toLocaleString('zh-CN',{maximumFractionDigits:2});}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function snapshot(order){
  return {
    orderId:order.id,
    erpDisplay:order.erpNo?`${order.erpNo}（${order.erpSource||'—'}）`:'—',
    supplier:order.supplier,
    supplierCode:order.supplierCode||'—',
    purchaseSubject:order.purchaseSubject||'焊捷供应链（深圳）有限公司',
    creator:order.creator||order.applicant||'—',
    createdAt:order.createdAt||'—',
    warehouse:order.warehouse,
    buyer:order.buyer,
    settlement:order.settlement,
    prepayRate:Number(order.prepayRate)||0,
    taxIncluded:order.taxIncluded||'否',
    tax:Number(order.tax)||0,
    freight:Number(order.freight)||0,
    otherFee:Number(order.otherFee)||0,
    discount:Number(order.discount)||0,
    remark:order.remark||'',
    items:(order.items||[]).map(item=>({
      sku:item.sku,
      lingxingSku:item.lingxingSku||'—',
      supplierItemNo:item.supplierItemNo||'—',
      name:item.name,
      planNo:item.planNo||'—',
      team:item.team||'—',
      lastPurchasePrice:Number(item.lastPurchasePrice||0),
      lastPurchaseTaxIncluded:item.lastPurchaseTaxIncluded||'否',
      quantity:Number(item.quantity||0),
      received:Number(item.received||0),
      price:Number(item.price||0)
    }))
  };
}

function nowStamp(){
  const d=new Date(),p=v=>String(v).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function makeChangeId(){
  const compact=nowStamp().slice(0,10).replaceAll('-','');
  const prefix='PC'+compact;
  const max=changes.filter(item=>item.id.startsWith(prefix)).reduce((val,item)=>Math.max(val,Number(item.id.slice(prefix.length))||0),0);
  return prefix+String(max+1).padStart(4,'0');
}
function hasInbound(order){return Boolean(order)&&(order.items||[]).some(item=>Number(item.received||0)>0);}
function eligibleOrders(){return purchaseOrders.filter(order=>order.status==='待到齐'&&!hasInbound(order));}
function eligibilityMessage(order){
  if(!order)return '采购单不存在';
  if(order.status!=='待到齐')return '仅审核通过且处于待到齐的采购单可以变更';
  if(hasInbound(order))return '该采购单已有入库记录，不能发起采购变更';
  return '';
}
function availableChangeOrders(exceptId){
  return eligibleOrders().filter(order=>!changes.some(change=>change.id!==exceptId&&change.orderId===order.id&&change.status==='pending'));
}
function fromOrder(order){
  const snap=snapshot(order);
  return Object.assign(snap,{orderId:order.id,supplier:order.supplier});
}
function makeChange(id,orderId,status,applicant,createdAt,after,reason,extra){
  const order=purchaseOrders.find(item=>item.id===orderId)||{id:orderId,supplier:'未知供应商',items:[]};
  const before=fromOrder(order);
  return Object.assign({
    id,
    orderId,
    supplier:order.supplier,
    status,
    applicant,
    createdAt,
    before,
    after,
    reason,
    oldAmount:total(before),
    newAmount:total(after),
    auditor:'',
    auditedAt:'',
    effectiveAt:'',
    opinion:'',
    logs:[{time:createdAt,user:applicant,text:'提交采购变更申请'}]
  },extra||{});
}

// 模拟预设变更数据
const after1=fromOrder(purchaseOrders[0]);after1.warehouse='深圳采购仓';after1.items[0].price=135;after1.items[1].quantity=360;
const after2=fromOrder(purchaseOrders[1]);after2.buyer='赵倩';after2.items[1].price=9.2;
const after3=fromOrder(purchaseOrders[2]);after3.freight=520;after3.otherFee=100;
const after4=fromOrder(purchaseOrders[0]);after4.items[2].quantity=100;
const after5=fromOrder(purchaseOrders[2]);after5.freight=600;

const changes=[
 makeChange('PC202611020006','PO202610280016','pending','张敏','2026-11-02 16:28',after1,'供应商确认价格调整，同时要求改送深圳采购仓；手套追加备货数量。'),
 makeChange('PC202611020005','PO202610290008','pending','李晨','2026-11-02 14:06',after2,'原采购负责人工作交接，并更新接头套装最新协议价。'),
 makeChange('PC202611010012','PO202610300021','effective','王磊','2026-11-01 10:32',after3,'供应商大件货物专车配送，补充运输及装卸费用。',{auditor:'Admin',auditedAt:'2026-11-01 11:08',effectiveAt:'2026-11-01 11:08',opinion:'费用凭证已核对，同意变更。'}),
 makeChange('PC202610310009','PO202610280016','effective','张敏','2026-10-31 09:45',after4,'面罩追加安全库存备货数量。',{auditor:'Admin',auditedAt:'2026-10-31 10:12',effectiveAt:'2026-10-31 10:12',opinion:'同意。'}),
 makeChange('PC202610300018','PO202610300021','rejected','王磊','2026-10-30 17:20',after5,'物流临时加急专车配送，申请调整运费金额。',{auditor:'Admin',auditedAt:'2026-10-30 18:02',opinion:'请补充物流加急报价单后再提交。'}),
 makeChange('PC202610290011','PO202610300021','void','王磊','2026-10-29 13:18',after3,'重复提交，作废本单。',{auditor:'王磊',auditedAt:'2026-10-29 13:25',opinion:'申请人主动作废'})
];

changes.forEach(change=>{
  if(change.auditedAt&&!change.logs.some(log=>log.time===change.auditedAt&&log.user===change.auditor)){
    change.logs.push({
      time:change.auditedAt,
      user:change.auditor,
      text:change.status==='effective'?'审核通过，变更已生效'+(change.opinion?'（'+change.opinion+'）':''):change.status==='rejected'?'驳回申请：'+change.opinion:'作废变更单'
    });
  }
});

const state={status:'all',page:1,pageSize:10,filtered:changes.slice(),baseFiltered:changes.slice(),editor:null,checkedIds:[],dialogId:'',dialogIds:[]};
const statusActions={all:['audit','void','export'],pending:['audit','void','export'],rejected:['export'],effective:['export'],void:['export']};
const actionDefs={
  audit:{label:'审核',cls:'success',allow:['pending'],tip:'仅待审核的变更单可以审核'},
  void:{label:'作废',cls:'danger',allow:['pending'],tip:'仅待审核的变更单可以作废'},
  export:{label:'导出',cls:'',always:true}
};

function checkedChanges(){return changes.filter(item=>state.checkedIds.includes(item.id));}

function renderActions(){
  const keys=statusActions[state.status]||[],box=$('#changeActions');if(!box)return;
  const strip=box.closest('.action-strip');
  if(!keys.length){box.innerHTML='';if(strip)strip.classList.add('is-empty');return;}
  if(strip)strip.classList.remove('is-empty');
  box.innerHTML=keys.map(key=>{
    const def=actionDefs[key];
    return '<button class="btn '+(def.cls||'')+'" data-head-action="'+key+'" title="'+(def.always?'导出当前查询结果':def.tip)+'">'+def.label+'</button>';
  }).join('');
}

const numericBaseKeys=['prepayRate','tax','freight','otherFee','discount'];
function sameVal(key,a,b){
  if(numericBaseKeys.includes(key)||key==='quantity'||key==='price'){
    if(String(a==null?'':a).trim()===''&&String(b==null?'':b).trim()==='')return true;
    return Number(a)===Number(b);
  }
  return String(a==null?'':a)===String(b==null?'':b);
}

function formatFieldVal(key,val){
  if(['prepayRate','tax'].includes(key))return (val==null||val===''?0:val)+'%';
  if(['freight','otherFee','discount'].includes(key))return '¥'+money(val);
  return val==null||val===''?'—':String(val);
}

function changedContentList(change){
  const list=[];
  if(!change||!change.before||!change.after)return list;
  baseFieldKeys.forEach(key=>{
    if(!sameVal(key,change.before[key],change.after[key])){
      const oldTxt=formatFieldVal(key,change.before[key]);
      const newTxt=formatFieldVal(key,change.after[key]);
      list.push(`${fieldNames[key]||key}：${oldTxt} → ${newTxt}`);
    }
  });
  const afterItems=change.after.items||[];
  const beforeItems=change.before.items||[];
  afterItems.forEach((item,idx)=>{
    const old=beforeItems[idx]||{};
    if(!sameVal('quantity',item.quantity,old.quantity)){
      list.push(`${item.sku} 采购数：${number(old.quantity)} → ${number(item.quantity)}`);
    }
    if(!sameVal('price',item.price,old.price)){
      list.push(`${item.sku} 采购单价：¥${number(old.price)} → ¥${number(item.price)}`);
    }
  });
  return list;
}

function changedFields(change){
  const fields=[];
  baseFieldKeys.forEach(key=>{
    if(!sameVal(key,change.before[key],change.after[key]))fields.push(fieldNames[key]);
  });
  let quantity=false,price=false;
  (change.after.items||[]).forEach((item,index)=>{
    const old=(change.before.items||[])[index]||{};
    if(!sameVal('quantity',item.quantity,old.quantity))quantity=true;
    if(!sameVal('price',item.price,old.price))price=true;
  });
  if(quantity)fields.push('采购数');
  if(price)fields.push('采购单价');
  return fields;
}

function skuMatches(change,codes,skuType){
  if(!codes||!codes.length)return true;
  const field=skuType||'sku';
  return (change.after.items||[]).some(item=>{
    const val=String(item[field]||'').toLowerCase();
    return val&&val!=='—'&&codes.some(code=>val.includes(code));
  });
}
function invalidDateRange(){
  const start=$('#startDate').value,end=$('#endDate').value;
  if(start&&end&&start>end){toast('开始日期不能晚于结束日期',true);return true;}
  return false;
}
function readQuery(){
  return{
    noValues:$('#noKeyword').value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean),
    skuType:$('#skuType')?$('#skuType').value:'sku',
    skuValues:$('#skuKeyword').value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean),
    supplier:$('#supplierFilter').value,
    warehouse:$('#warehouseFilter').value,
    applicant:$('#applicantFilter').value,
    start:$('#startDate').value,
    end:$('#endDate').value,
    timeType:$('#timeType').value,
    noType:$('#noType').value
  };
}
function matchQuery(change,q){
  const target=(q.noType==='change'?change.id:change.orderId).toLowerCase();
  const date=(change[q.timeType]||'').slice(0,10);
  return(!q.noValues.length||q.noValues.some(val=>target.includes(val)))&&skuMatches(change,q.skuValues,q.skuType)&&(!q.supplier||change.supplier===q.supplier)&&(!q.warehouse||(change.after&&change.after.warehouse)===q.warehouse)&&(!q.applicant||change.applicant===q.applicant)&&(!q.start||date>=q.start)&&(!q.end||date<=q.end);
}
function applyFilters(){
  if(invalidDateRange())return;
  const q=readQuery();
  state.baseFiltered=changes.filter(change=>matchQuery(change,q));
  state.filtered=state.baseFiltered.filter(change=>state.status==='all'||change.status===state.status);
  state.page=1;
  render();
}
function resetFilters(){
  ['noKeyword','skuKeyword','startDate','endDate'].forEach(id=>$('#'+id).value='');
  ['supplierFilter','warehouseFilter','applicantFilter'].forEach(id=>$('#'+id).value='');
  $('#noType').value='change';
  if($('#skuType'))$('#skuType').value='sku';
  $('#skuKeyword').placeholder='请输入 SKU，支持多个';
  $('#timeType').value='createdAt';
  state.status='all';
  state.page=1;
  state.baseFiltered=changes.slice();
  state.filtered=changes.slice();
  render();
}
function initOptions(){
  [...new Set(changes.map(item=>item.supplier))].forEach(value=>$('#supplierFilter').insertAdjacentHTML('beforeend','<option>'+esc(value)+'</option>'));
  [...new Set([...warehouses,...changes.map(item=>item.after&&item.after.warehouse).filter(Boolean)])].forEach(value=>$('#warehouseFilter').insertAdjacentHTML('beforeend','<option>'+esc(value)+'</option>'));
  [...new Set(changes.map(item=>item.applicant))].forEach(value=>$('#applicantFilter').insertAdjacentHTML('beforeend','<option>'+esc(value)+'</option>'));
}
function renderTabs(){
  const base=state.baseFiltered;
  $('#statusTabs').innerHTML=statusDefs.map(([key,label])=>{
    const count=key==='all'?base.length:base.filter(item=>item.status===key).length;
    return '<button class="status-tab '+(state.status===key?'active':'')+'" data-status="'+key+'">'+label+'<em>'+count+'</em></button>';
  }).join('');
}
function auditPerson(change){return(change.status==='rejected'||change.status==='effective')&&change.auditor?esc(change.auditor):'<span class="op-empty">—</span>';}
function effectiveTime(change){return change.status==='effective'&&change.effectiveAt?esc(change.effectiveAt):'<span class="op-empty">—</span>';}
function logType(text){
  if(text.indexOf('重新编辑')===0)return '重新提交';
  if(text.indexOf('提交')===0)return '提交';
  if(text.indexOf('审核通过')===0)return '审核通过';
  if(text.indexOf('驳回')===0)return '审核驳回';
  if(text.indexOf('作废')===0)return '作废';
  return '操作';
}
function fullLogs(change){return (change.logs||[]).slice().sort((a,b)=>a.time<b.time?1:-1);}

function renderRows(){
  const start=(state.page-1)*state.pageSize;
  const rows=state.filtered.slice(start,start+state.pageSize);
  const rowIds=rows.map(item=>item.id);
  state.checkedIds=state.checkedIds.filter(id=>rowIds.includes(id));
  $('#changeTableBody').innerHTML=rows.map(change=>{
    const checked=state.checkedIds.includes(change.id);
    const contents=changedContentList(change);
    const summaryText=contents.length?contents.join('；'):'无变更';
    const hoverTitle=contents.length?contents.join('\n'):'';
    return '<tr class="'+(checked?'is-checked':'')+'">'+
      '<td class="check-col"><input class="row-check" type="checkbox" data-check="'+change.id+'" '+(checked?'checked':'')+' aria-label="选择变更单 '+change.id+'"></td>'+
      '<td><div class="no-title"><button class="cell-main-link" data-action="detail" data-id="'+change.id+'">'+change.id+'</button><span class="status-tag status-'+change.status+'">'+statusText[change.status]+'</span></div></td>'+
      '<td><button class="cell-main-link" data-action="order" data-id="'+change.id+'">'+change.orderId+'</button></td>'+
      '<td class="supplier-cell" data-full-tip="'+esc(change.supplier)+'">'+esc(change.supplier)+'</td>'+
      '<td>'+esc(change.after.warehouse||'—')+'</td>'+
      '<td class="change-content-cell" data-full-tip="'+esc(hoverTitle)+'">'+esc(summaryText)+'</td>'+
      '<td class="reason-cell" data-full-tip="'+esc(change.reason||'')+'">'+esc(change.reason||'—')+'</td>'+
      '<td>'+esc(change.applicant)+'</td>'+
      '<td class="time-cell">'+esc(change.createdAt)+'</td>'+
      '<td class="time-cell">'+effectiveTime(change)+'</td>'+
      '<td class="op-cell"><div class="action-links">'+
        '<button class="link-btn muted-link" data-action="log" data-id="'+change.id+'">日志</button>'+
      '</div></td>'+
    '</tr>';
  }).join('');
  const selectAll=$('#selectAllChanges');
  if(selectAll){
    const allChecked=rows.length>0&&rows.every(item=>state.checkedIds.includes(item.id));
    const someChecked=rows.some(item=>state.checkedIds.includes(item.id));
    selectAll.checked=allChecked;
    selectAll.indeterminate=someChecked&&!allChecked;
    selectAll.disabled=!rows.length;
  }
  $('#changeEmpty').hidden=rows.length>0;
  $('#changeTableBody').closest('table').hidden=!rows.length;
}

function renderPager(){
  const count=state.filtered.length,pages=Math.max(1,Math.ceil(count/state.pageSize));
  if(state.page>pages)state.page=pages;
  $('#totalCount').textContent=count;
  $('#prevPage').disabled=state.page===1;
  $('#nextPage').disabled=state.page===pages;
  $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>'<button class="page-number '+(state.page===i+1?'active':'')+'" data-page="'+(i+1)+'">'+(i+1)+'</button>').join('');
}

function render(){renderTabs();renderPager();renderRows();renderActions();}
function toast(message,error){
  const el=$('#toast');
  el.textContent=message;
  el.className='toast show'+(error?' is-error':'');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>el.className='toast',2300);
}
function closeModal(){
  $('#changeModal').hidden=true;
  $('#changeModal').innerHTML='';
  state.editor=null;
}
function modalShell(title,subtitle,body,footer,type,headerExtra){
  $('#changeModal').innerHTML='<section class="change-dialog '+(type||'')+'" role="dialog" aria-modal="true">'+
    '<header class="change-dialog-header"><div><h2>'+title+'</h2><p>'+subtitle+'</p></div>'+
    '<div class="pc-header-actions">'+(headerExtra||'')+'<button class="change-dialog-close" data-close aria-label="关闭">×</button></div></header>'+
    '<div class="change-dialog-body">'+body+'</div>'+
    (footer?'<footer class="change-dialog-footer">'+footer+'</footer>':'')+'</section>';
  $('#changeModal').hidden=false;
}

/* ================== 复用发起变更弹窗布局（双锚点：采购单信息、采购明细） ================== */
function origLineHtml(origText,changed,multiline){
  return '<div class="ci-orig'+(multiline?' is-multiline':'')+'" '+(changed?'':'hidden')+'>'+esc(origText)+'</div>';
}
function displayFieldVal(key,val){
  if(['prepayRate','tax'].includes(key))return (val==null||val===''?0:val)+'%';
  if(['freight','otherFee','discount'].includes(key))return String(val==null||val===''?0:val);
  return val==null||val===''?'—':String(val);
}

function openDetail(change,audit){
  if(!change)return;
  state.dialogId=change.id;
  const a=change.after,b=change.before;
  const fields=changedFields(change);
  const statusCls=change.status==='effective'?'done':change.status==='rejected'?'rejected':change.status==='void'?'void':'pending';

  function fieldItem(label,key,val,oldVal){
    const changed=!sameVal(key,val,oldVal);
    const orig=origLineHtml(displayFieldVal(key,oldVal),changed);
    return '<div class="pc-detail-field"><span>'+label+'</span><div><b>'+esc(displayFieldVal(key,val))+'</b>'+orig+'</div></div>';
  }

  const baseInfoGrid='<div class="pc-detail-field-grid">'+
    '<div class="pc-detail-field"><span>中台跟踪号</span><b>'+esc(change.orderId)+'</b></div>'+
    '<div class="pc-detail-field"><span>ERP采购单号</span><b>'+esc(a.erpDisplay||b.erpDisplay||'—')+'</b></div>'+
    '<div class="pc-detail-field"><span>变更单状态</span><b><span class="status-tag status-'+change.status+'">'+statusText[change.status]+'</span></b></div>'+
    '<div class="pc-detail-field"><span>供应商名称</span><b>'+esc(change.supplier)+'</b></div>'+
    fieldItem('采购仓库','warehouse',a.warehouse,b.warehouse)+
    fieldItem('采购负责人','buyer',a.buyer,b.buyer)+
    '<div class="pc-detail-field"><span>采购主体</span><b>'+esc(a.purchaseSubject||b.purchaseSubject||'焊捷供应链（深圳）有限公司')+'</b></div>'+
    fieldItem('结算方式','settlement',a.settlement,b.settlement)+
    fieldItem('预付比例 (%)','prepayRate',a.prepayRate,b.prepayRate)+
    fieldItem('是否含税','taxIncluded',a.taxIncluded,b.taxIncluded)+
    fieldItem('税率 (%)','tax',a.tax,b.tax)+
    fieldItem('运费 (元)','freight',a.freight,b.freight)+
    fieldItem('其他费用 (元)','otherFee',a.otherFee,b.otherFee)+
    fieldItem('优惠金额 (元)','discount',a.discount,b.discount)+
    '<div class="pc-detail-field"><span>申请人</span><b>'+esc(change.applicant)+'</b></div>'+
    '<div class="pc-detail-field"><span>申请时间</span><b>'+esc(change.createdAt)+'</b></div>'+
    '<div class="pc-detail-field"><span>审核人</span><b>'+(change.auditor?esc(change.auditor):'—')+'</b></div>'+
    '<div class="pc-detail-field"><span>生效时间</span><b>'+(change.effectiveAt?esc(change.effectiveAt):'—')+'</b></div>'+
  '</div>';

  const reasonBlock='<div class="ci-remark-box is-reason"><span>变更原因</span><p style="margin:0;color:#303133;line-height:1.5">'+esc(change.reason||'—')+'</p></div>';
  const opinionBlock=change.opinion?'<div class="ci-remark-box is-opinion"><span>审核意见</span><p style="margin:0;color:#e6a23c;line-height:1.5">'+esc(change.opinion)+'</p></div>':'';

  const skuRows=(a.items||[]).map((item,idx)=>{
    const old=(b.items||[])[idx]||{};
    const qtyChanged=!sameVal('quantity',item.quantity,old.quantity);
    const priceChanged=!sameVal('price',item.price,old.price);
    const itemAmt=Number(item.quantity||0)*Number(item.price||0);
    return '<tr>'+
      '<td><div class="pc-sku-cell"><span class="sku-thumb">📦</span><b>'+esc(item.sku)+'</b></div></td>'+
      '<td>'+esc(item.lingxingSku||'—')+'</td>'+
      '<td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="'+esc(item.name)+'">'+esc(item.name)+'</td>'+
      '<td>'+esc(item.supplierItemNo||'—')+'</td>'+
      '<td>'+esc(item.planNo||'—')+'</td>'+
      '<td><b>'+number(item.quantity)+'</b>'+origLineHtml(number(old.quantity),qtyChanged)+'</td>'+
      '<td><b>¥'+money(item.price)+'</b>'+origLineHtml('¥'+money(old.price),priceChanged)+'</td>'+
      '<td>¥'+money(item.lastPurchasePrice||0)+(item.lastPurchaseTaxIncluded==='是'?' <span class="status-tag" style="background:#fdf6ec;color:#e6a23c;font-size:10px;padding:0 3px">含税</span>':'')+'</td>'+
      '<td>'+esc(item.team||'—')+'</td>'+
      '<td>'+number(item.received||0)+'</td>'+
      '<td class="pc-amount">¥'+money(itemAmt)+'</td>'+
    '</tr>';
  }).join('');

  const skuTableBlock='<div class="pc-detail-table-wrap"><table class="pc-sku-table"><thead><tr>'+
    '<th>SKU</th><th>领星 SKU</th><th>品名</th><th>供应商料号</th><th>采购计划</th><th>采购数</th><th>采购单价</th><th>上次采购价</th><th>团队</th><th>累计入库</th><th>货款</th>'+
    '</tr></thead><tbody>'+skuRows+'</tbody></table></div>';

  const auditBlock=audit?'<section class="audit-opinion"><label>审核意见</label><textarea id="auditOpinion" maxlength="300" placeholder="通过时选填，驳回时必填"></textarea><small id="auditError">审核通过后将直接生效，写回采购单。</small></section>':'';

  const body='<div class="pc-detail-layout"><div class="pc-detail-content">'+
    '<section id="pcChangeInfo" class="pc-detail-section"><div class="pc-detail-section-head">采购单信息<span class="pc-detail-head-tip">共 '+fields.length+' 项变更</span></div>'+baseInfoGrid+reasonBlock+opinionBlock+'</section>'+
    '<section id="pcChangeSku" class="pc-detail-section"><div class="pc-detail-section-head">采购明细<span class="pc-detail-head-tip">共 '+(a.items||[]).length+' 个 SKU</span></div>'+skuTableBlock+'</section>'+
    auditBlock+
  '</div></div>';

  const headerExtra=audit?'<button type="button" class="pc-header-log-btn" data-action="view-log">查看操作日志</button>':'';
  const footer=audit?
    '<div class="pc-footer-tips"><span>审核通过后将直接写回采购单并生效</span></div><button class="btn danger" id="rejectChange">驳回</button><button class="btn success" id="approveChange">审核通过并生效</button>':
    '';

  modalShell(audit?'采购变更审核':'采购变更详情','变更单号：'+change.id+' ｜ 采购单号：'+change.orderId,body,footer,'pc-detail-dialog',headerExtra);
}

/* ================== 已驳回单据的【编辑】复用发起变更弹窗架构 ================== */
function openEditor(change){
  if(!change)return;
  const order=purchaseOrders.find(item=>item.id===change.orderId);
  state.dialogId=change.id;
  state.editor={
    id:change.id,
    source:order||change.before,
    before:clone(change.before),
    after:clone(change.after),
    reason:change.reason||''
  };
  renderEditorForm();
}

function renderEditorForm(){
  if(!state.editor)return;
  const ed=state.editor,a=ed.after,b=ed.before;
  const hasReceived=(a.items||[]).some(item=>Number(item.received||0)>0);

  function editSelectField(label,key,options,disabled){
    const changed=!sameVal(key,a[key],b[key]);
    const opts=options.map(opt=>'<option value="'+esc(opt)+'" '+(String(opt)===String(a[key])?'selected':'')+'>'+esc(opt)+'</option>').join('');
    const orig=origLineHtml(displayFieldVal(key,b[key]),changed);
    return '<div class="pc-detail-field is-editable"><span>'+label+'</span><div class="ci-field-control"><select class="ci-control" data-pc-base="'+key+'" '+(disabled?'disabled':'')+'>'+opts+'</select>'+orig+'</div></div>';
  }
  function editInputField(label,key,type,disabled){
    const changed=!sameVal(key,a[key],b[key]);
    const orig=origLineHtml(displayFieldVal(key,b[key]),changed);
    return '<div class="pc-detail-field is-editable"><span>'+label+'</span><div class="ci-field-control"><input class="ci-control" type="'+type+'" '+(type==='number'?'min="0" step="0.01"':'')+' data-pc-base="'+key+'" value="'+esc(a[key]==null?'':a[key])+'" '+(disabled?'disabled':'')+'>'+orig+'</div></div>';
  }

  const baseInfoGrid='<div class="pc-detail-field-grid">'+
    '<div class="pc-detail-field"><span>中台跟踪号</span><b>'+esc(ed.id)+' · '+esc(a.orderId||b.orderId)+'</b></div>'+
    '<div class="pc-detail-field"><span>ERP采购单号</span><b>'+esc(a.erpDisplay||b.erpDisplay||'—')+'</b></div>'+
    '<div class="pc-detail-field"><span>变更单状态</span><b><span class="status-tag status-rejected">已驳回</span></b></div>'+
    '<div class="pc-detail-field"><span>供应商名称</span><b>'+esc(a.supplier||b.supplier)+'</b></div>'+
    editSelectField('采购仓库','warehouse',warehouses,hasReceived)+
    editSelectField('采购负责人','buyer',buyers,false)+
    '<div class="pc-detail-field"><span>采购主体</span><b>'+esc(a.purchaseSubject||b.purchaseSubject||'焊捷供应链（深圳）有限公司')+'</b></div>'+
    editSelectField('结算方式','settlement',settlementOptions,false)+
    editInputField('预付比例 (%)','prepayRate','number',false)+
    editSelectField('是否含税','taxIncluded',['否','是'],false)+
    editInputField('税率 (%)','tax','number',false)+
    editInputField('运费 (元)','freight','number',false)+
    editInputField('其他费用 (元)','otherFee','number',false)+
    editInputField('优惠金额 (元)','discount','number',false)+
    '<div class="pc-detail-field"><span>申请人</span><b>'+esc(b.applicant||'Admin')+'</b></div>'+
    '<div class="pc-detail-field"><span>原申请时间</span><b>'+esc(b.createdAt||'—')+'</b></div>'+
    '<div class="pc-detail-field"><span>前次审核人</span><b>'+(ed.source.auditor?esc(ed.source.auditor):'—')+'</b></div>'+
    '<div class="pc-detail-field"><span>前次驳回意见</span><b style="color:#f56c6c">'+(ed.source.opinion?esc(ed.source.opinion):'—')+'</b></div>'+
  '</div>';

  const reasonBlock='<div class="ci-remark-box is-reason"><span>变更原因<em>*</em></span><div style="width:100%"><textarea class="ci-control" id="editorReason" maxlength="300" placeholder="请说明本次修改原因（必填）">'+esc(ed.reason||'')+'</textarea><div style="display:flex;justify-content:space-between;margin-top:4px;color:#909399;font-size:12px"><span id="editorReasonErr" style="color:#f56c6c"></span><span><b id="editorReasonCount">'+(ed.reason||'').length+'</b>/300</span></div></div></div>';

  const skuRows=(a.items||[]).map((item,idx)=>{
    const old=(b.items||[])[idx]||{};
    const qtyChanged=!sameVal('quantity',item.quantity,old.quantity);
    const priceChanged=!sameVal('price',item.price,old.price);
    const itemAmt=Number(item.quantity||0)*Number(item.price||0);
    return '<tr>'+
      '<td><div class="pc-sku-cell"><span class="sku-thumb">📦</span><b>'+esc(item.sku)+'</b></div></td>'+
      '<td>'+esc(item.lingxingSku||'—')+'</td>'+
      '<td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="'+esc(item.name)+'">'+esc(item.name)+'</td>'+
      '<td>'+esc(item.supplierItemNo||'—')+'</td>'+
      '<td>'+esc(item.planNo||'—')+'</td>'+
      '<td><input class="ci-control pc-num" type="number" min="1" step="1" data-pc-item="'+idx+'" data-key="quantity" value="'+esc(item.quantity)+'">'+origLineHtml(number(old.quantity),qtyChanged)+'</td>'+
      '<td><input class="ci-control pc-num" type="number" min="0" step="0.01" data-pc-item="'+idx+'" data-key="price" value="'+esc(item.price)+'">'+origLineHtml(money(old.price),priceChanged)+'</td>'+
      '<td>¥'+money(item.lastPurchasePrice||0)+(item.lastPurchaseTaxIncluded==='是'?' <span class="status-tag" style="background:#fdf6ec;color:#e6a23c;font-size:10px;padding:0 3px">含税</span>':'')+'</td>'+
      '<td>'+esc(item.team||'—')+'</td>'+
      '<td>'+number(item.received||0)+'</td>'+
      '<td class="pc-amount" data-sku-amount="'+idx+'">¥'+money(itemAmt)+'</td>'+
    '</tr>';
  }).join('');

  const skuTableBlock='<div class="pc-detail-table-wrap"><table class="pc-sku-table"><thead><tr>'+
    '<th>SKU</th><th>领星 SKU</th><th>品名</th><th>供应商料号</th><th>采购计划</th><th>采购数</th><th>采购单价</th><th>上次采购价</th><th>团队</th><th>累计入库</th><th>货款</th>'+
    '</tr></thead><tbody>'+skuRows+'</tbody></table></div>';

  const body='<div class="pc-detail-layout"><div class="pc-detail-content">'+
    '<section id="pcChangeInfo" class="pc-detail-section"><div class="pc-detail-section-head">采购单信息<span class="pc-detail-head-tip">重新编辑并提交</span></div>'+baseInfoGrid+reasonBlock+'</section>'+
    '<section id="pcChangeSku" class="pc-detail-section"><div class="pc-detail-section-head">采购明细<span class="pc-detail-head-tip">共 '+(a.items||[]).length+' 个 SKU</span></div>'+skuTableBlock+'</section>'+
  '</div></div>';

  const headerExtra='<button type="button" class="pc-header-log-btn" data-action="view-log">查看操作日志</button>';
  const footer='<div class="pc-footer-tips">'+
    '<span>• 采购单内任一 SKU 发生收货入库后，采购仓库锁定不可变更。</span>'+
    '<span>• 同一采购单内相同 SKU（不同采购计划）的采购单价自动保持同步联动。</span>'+
  '</div><button class="btn" data-close>取消</button><button class="btn primary" id="resubmitChange">提交变更申请</button>';

  modalShell('重新编辑采购变更','变更单号：'+ed.id+' ｜ 驳回后修改将重新进入待审核',body,footer,'pc-detail-dialog',headerExtra);
}

function syncEditorFromInputs(target){
  if(!state.editor)return;
  const ed=state.editor,a=ed.after,b=ed.before;
  if(target.matches('[data-pc-base]')){
    const key=target.dataset.pcBase;
    a[key]=['prepayRate','tax','freight','otherFee','discount'].includes(key)?Number(target.value):target.value;
    const parent=target.closest('.ci-field-control')||target.closest('div');
    if(parent){
      const orig=parent.querySelector('.ci-orig');
      if(orig)orig.hidden=sameVal(key,target.value,b[key]);
    }
    return;
  }
  if(target.matches('[data-pc-item]')){
    const idx=Number(target.dataset.pcItem),key=target.dataset.key;
    const item=a.items[idx];if(!item)return;
    const val=Number(target.value);
    item[key]=val;
    const parent=target.parentElement;
    if(parent){
      const orig=parent.querySelector('.ci-orig');
      if(orig)orig.hidden=sameVal(key,val,b.items[idx][key]);
    }
    // 相同 SKU 单价联动
    if(key==='price'){
      const sku=item.sku;
      a.items.forEach((other,oidx)=>{
        if(other.sku===sku&&oidx!==idx){
          other.price=val;
          const otherInput=$$('[data-pc-item="'+oidx+'"][data-key="price"]')[0];
          if(otherInput){
            otherInput.value=target.value;
            const otherParent=otherInput.parentElement;
            if(otherParent){
              const otherOrig=otherParent.querySelector('.ci-orig');
              if(otherOrig)otherOrig.hidden=sameVal('price',val,b.items[oidx].price);
            }
          }
          const otherAmtCell=$('[data-sku-amount="'+oidx+'"]');
          if(otherAmtCell)otherAmtCell.textContent='¥'+money(Number(other.quantity||0)*val);
        }
      });
    }
    const amtCell=$('[data-sku-amount="'+idx+'"]');
    if(amtCell)amtCell.textContent='¥'+money(Number(item.quantity||0)*Number(item.price||0));
  }
}

function submitResubmit(){
  if(!state.editor)return;
  const ed=state.editor;
  const reasonInput=$('#editorReason');
  const reasonVal=reasonInput?reasonInput.value.trim():'';
  if(!reasonVal){
    $('#editorReasonErr').textContent='请填写变更原因';
    if(reasonInput)reasonInput.focus();
    return;
  }
  // 校验数量和单价
  let valid=true;
  $$('[data-pc-item]').forEach(input=>{
    const key=input.dataset.key,val=Number(input.value);
    let bad=false;
    if(key==='quantity')bad=!Number.isInteger(val)||val<=0;
    if(key==='price')bad=!Number.isFinite(val)||val<0;
    input.classList.toggle('is-error',bad);
    if(bad)valid=false;
  });
  if(!valid){toast('采购数量必须为正整数，单价必须大于等于 0',true);return;}

  const diffCount=changedContentList({before:ed.before,after:ed.after}).length;
  if(!diffCount){toast('尚未修改任何内容，无需提交变更',true);return;}

  const now=nowStamp();
  const change=changes.find(item=>item.id===ed.id);
  if(change){
    change.after=clone(ed.after);
    change.reason=reasonVal;
    change.status='pending';
    change.newAmount=total(ed.after);
    change.createdAt=now;
    change.auditor='';
    change.auditedAt='';
    change.effectiveAt='';
    change.opinion='';
    change.logs.push({time:now,user:change.applicant||'Admin',text:'重新编辑并提交变更申请'});
  }
  closeModal();
  state.checked='';
  state.status='pending';
  applyFilters();
  toast('采购变更已重新提交，等待审核');
}

function decide(change,approved){
  const opinion=($('#auditOpinion')?$('#auditOpinion').value:'').trim();
  if(!approved&&!opinion){
    const err=$('#auditError');
    if(err){err.textContent='驳回时请填写审核意见';err.className='error';}
    $('#auditOpinion').focus();
    return;
  }
  if(approved){
    const order=purchaseOrders.find(item=>item.id===change.orderId);
    const blocked=eligibilityMessage(order);
    if(blocked){
      const err=$('#auditError');
      if(err){err.textContent=blocked+'，本次变更不能生效';err.className='error';}
      toast(blocked,true);
      return;
    }
  }
  const now=nowStamp();
  change.status=approved?'effective':'rejected';
  change.auditor='Admin';
  change.auditedAt=now;
  change.effectiveAt=approved?now:'';
  change.opinion=opinion;
  change.logs.push({
    time:now,
    user:'Admin',
    text:approved?'审核通过，变更已生效'+(opinion?'（'+opinion+'）':''):'驳回申请：'+opinion
  });
  if(approved)applyChangeToOrder(change);
  state.checkedIds=[];
  closeModal();
  applyFilters();
  toast(approved?'审核通过，采购变更已生效':'已驳回采购变更申请');
}

function decideBatch(list,approved){
  if(!list.length)return;
  const opinion=$('#auditOpinion').value.trim();
  if(!approved&&!opinion){
    $('#auditError').textContent='驳回时请填写审核意见';
    $('#auditError').style.color='#f56c6c';
    return;
  }
  const now=nowStamp();
  list.forEach(change=>{
    change.status=approved?'effective':'rejected';
    change.auditor='Admin';
    change.auditedAt=now;
    change.effectiveAt=approved?now:'';
    change.opinion=opinion;
    change.logs.push({
      time:now,
      user:'Admin',
      text:approved?'批量审核通过，变更已生效'+(opinion?'（'+opinion+'）':''):'批量驳回申请：'+opinion
    });
    if(approved)applyChangeToOrder(change);
  });
  state.checkedIds=[];
  closeModal();
  applyFilters();
  toast(approved?`已批量审核通过 ${list.length} 张采购变更单`:`已批量驳回 ${list.length} 张采购变更申请`);
}

function openBatchAudit(list){
  state.dialogIds=list.map(item=>item.id);
  const itemsHtml=list.map(item=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #f0f2f5;font-size:13px"><span><b style="color:#303133">${esc(item.id)}</b> · ${esc(item.orderId)} · ${esc(item.supplier)}</span><span style="color:#909399">${esc(changedFields(item).join('、')||'无变更')}</span></div>`).join('');
  const body='<div class="editor-section"><div class="editor-section-title"><span class="section-bar"></span>待审核变更单（共 '+list.length+' 张）</div><div>'+itemsHtml+'</div></div>'+
    '<section class="audit-opinion"><label>批量审核意见</label><textarea id="auditOpinion" maxlength="300" placeholder="通过时选填，驳回时必填"></textarea><small id="auditError">审核通过后所选变更单将批量写回对应采购单并生效。</small></section>';
  const footer='<div class="pc-footer-tips"><span>共选中 '+list.length+' 张待审核变更单</span></div><button class="btn danger" id="batchRejectChange">批量驳回</button><button class="btn success" id="batchApproveChange">批量通过并生效</button>';
  modalShell('批量审核采购变更','已选 '+list.length+' 张变更单',body,footer,'audit-dialog');
}

function applyChangeToOrder(change){
  const order=purchaseOrders.find(item=>item.id===change.orderId);
  if(!order)return;
  baseFieldKeys.forEach(key=>{order[key]=change.after[key];});
  (change.after.items||[]).forEach(afterItem=>{
    const item=(order.items||[]).find(row=>row.sku===afterItem.sku);
    if(item){
      item.quantity=afterItem.quantity;
      item.price=afterItem.price;
    }
  });
}

function openVoid(list){
  const targets=Array.isArray(list)?list:[list];
  state.dialogIds=targets.map(item=>item.id);
  const label=targets.length>1?`选中的 <strong>${targets.length} 张</strong>变更单（${esc(targets.map(i=>i.id).join('、'))}）`:`变更单 <strong>${esc(targets[0].id)}</strong>`;
  modalShell('作废采购变更',targets.length>1?`共 ${targets.length} 张`:targets[0].id,
    '<div class="void-body">确定作废'+label+'吗？<p>作废后原采购单保持当前生效内容，该操作不可撤销。</p></div>',
    '<button class="btn" data-close>取消</button><button class="btn danger" id="confirmVoid">确认作废</button>',
    'void-dialog'
  );
}

function openLog(change){
  if(!change)return;
  state.dialogId=change.id;
  const logs=fullLogs(change);
  const rows=logs.map(log=>'<tr><td>'+logType(log.text)+'</td><td class="log-content">'+esc(log.text)+'</td><td>'+esc(log.user)+'</td><td>'+esc(log.time)+'</td></tr>').join('');
  modalShell('操作日志',change.id+' · 原采购单 '+change.orderId,
    '<div class="log-table-wrap"><table class="log-table"><thead><tr><th>操作类型</th><th>操作内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>'+rows+'</tbody></table></div>',
    '<span class="footer-tip">日志按时间倒序，完整保留提交、重新提交、审核、作废记录</span><button class="btn primary" data-close>关闭</button>',
    'log-dialog'
  );
}

function bindStatic(){
  initOptions();
  render();
  $('#searchBtn').addEventListener('click',applyFilters);
  $('#resetBtn').addEventListener('click',resetFilters);
  $('#pageSize').addEventListener('change',event=>{
    state.pageSize=Number(event.target.value);
    state.page=1;
    render();
  });
  $('#prevPage').addEventListener('click',()=>{
    if(state.page>1){state.page--;render();}
  });
  $('#nextPage').addEventListener('click',()=>{
    if(state.page<Math.ceil(state.filtered.length/state.pageSize)){state.page++;render();}
  });
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-status]');
    if(tab){
      if(invalidDateRange())return;
      state.status=tab.dataset.status;
      state.page=1;
      applyFilters();
      return;
    }
    const page=event.target.closest('[data-page]');
    if(page){
      state.page=Number(page.dataset.page);
      render();
      return;
    }
    if(event.target.closest('[data-close]')||event.target.id==='changeModal'){
      closeModal();
      return;
    }
    const check=event.target.closest('[data-check]');
    if(check){
      event.stopPropagation();
      const id=check.dataset.check;
      if(state.checkedIds.includes(id))state.checkedIds=state.checkedIds.filter(item=>item!==id);
      else state.checkedIds.push(id);
      renderRows();
      renderActions();
      return;
    }
    const headAction=event.target.closest('[data-head-action]');
    if(headAction){
      const key=headAction.dataset.headAction;
      if(key==='export')return;
      const selected=checkedChanges();
      if(!selected.length){
        toast('请先勾选待审核变更单',true);
        return;
      }
      if(selected.some(item=>!actionDefs[key].allow.includes(item.status))){
        toast(actionDefs[key].tip,true);
        return;
      }
      if(key==='audit'){
        if(selected.length===1)openDetail(selected[0],true);
        else openBatchAudit(selected);
      }
      if(key==='void')openVoid(selected);
      return;
    }
    const action=event.target.closest('[data-action]');
    if(action){
      const act=action.dataset.action;
      if(act==='view-log'){
        const change=changes.find(item=>item.id===state.dialogId);
        if(change)openLog(change);
        return;
      }
      const change=changes.find(item=>item.id===action.dataset.id);
      if(!change)return;
      if(act==='detail')openDetail(change,false);
      if(act==='log')openLog(change);
      if(act==='order')toast('原采购单：'+change.orderId+'（原型页签演示）');
      return;
    }
    if(event.target.id==='approveChange')decide(changes.find(item=>item.id===state.dialogId),true);
    if(event.target.id==='rejectChange')decide(changes.find(item=>item.id===state.dialogId),false);
    if(event.target.id==='batchApproveChange'){
      const list=changes.filter(item=>state.dialogIds.includes(item.id));
      decideBatch(list,true);
    }
    if(event.target.id==='batchRejectChange'){
      const list=changes.filter(item=>state.dialogIds.includes(item.id));
      decideBatch(list,false);
    }
    if(event.target.id==='resubmitChange')submitResubmit();
    if(event.target.id==='confirmVoid'){
      const targets=changes.filter(item=>state.dialogIds.includes(item.id));
      const now=nowStamp();
      targets.forEach(change=>{
        change.status='void';
        change.auditor=change.applicant;
        change.auditedAt=now;
        change.logs.push({time:now,user:change.applicant,text:'作废变更单'});
      });
      state.checkedIds=[];
      closeModal();
      applyFilters();
      toast(targets.length>1?`已批量作废 ${targets.length} 张采购变更单`:'采购变更已作废');
    }
  });

  document.addEventListener('change',event=>{
    if(event.target.id==='skuType'){
      const map={sku:'请输入 SKU，支持多个',lingxingSku:'请输入领星 SKU，支持多个',supplierItemNo:'请输入供应商料号，支持多个'};
      $('#skuKeyword').placeholder=map[event.target.value]||'请输入编码，支持多个';
      return;
    }
    if(event.target.id==='selectAllChanges'){
      const start=(state.page-1)*state.pageSize;
      const rows=state.filtered.slice(start,start+state.pageSize);
      state.checkedIds=event.target.checked?rows.map(item=>item.id):[];
      renderRows();
      renderActions();
      return;
    }
    if(event.target.matches('[data-pc-base],[data-pc-item]')){
      syncEditorFromInputs(event.target);
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='editorReason'){
      $('#editorReasonCount').textContent=event.target.value.length;
      $('#editorReasonErr').textContent='';
      if(state.editor)state.editor.reason=event.target.value;
    }
    if(event.target.matches('[data-pc-base],[data-pc-item]')){
      syncEditorFromInputs(event.target);
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!$('#changeModal').hidden)closeModal();
    if(event.key==='Enter'&&event.target.closest('.query-panel'))applyFilters();
  });

  const hoverTip=document.createElement('div');
  hoverTip.className='pc-hover-tip';
  hoverTip.hidden=true;
  document.body.appendChild(hoverTip);
  function positionHoverTip(e){
    const pad=12,w=hoverTip.offsetWidth,h=hoverTip.offsetHeight;
    let left=e.clientX+14,top=e.clientY+16;
    if(left+w+pad>window.innerWidth)left=Math.max(pad,e.clientX-w-12);
    if(top+h+pad>window.innerHeight)top=Math.max(pad,e.clientY-h-12);
    hoverTip.style.left=left+'px';
    hoverTip.style.top=top+'px';
  }
  document.addEventListener('mouseover',e=>{
    const cell=e.target.closest('[data-full-tip]');
    const text=cell?cell.getAttribute('data-full-tip'):'';
    if(!text){hoverTip.hidden=true;return;}
    hoverTip.textContent=text;
    hoverTip.hidden=false;
    positionHoverTip(e);
  });
  document.addEventListener('mousemove',e=>{
    if(!hoverTip.hidden)positionHoverTip(e);
  });
  document.addEventListener('mouseout',e=>{
    const cell=e.target.closest('[data-full-tip]');
    if(cell&&(!e.relatedTarget||!cell.contains(e.relatedTarget)))hoverTip.hidden=true;
  });

  const params=new URLSearchParams(window.location.search);
  const presetChangeId=(params.get('changeId')||'').trim();
  const presetStatus=(params.get('status')||'').trim();
  if(presetStatus&&statusDefs.some(([key])=>key===presetStatus)){
    state.status=presetStatus;
  }
  let newChanges=[];
  try{
    const rawList=sessionStorage.getItem('pcNewChanges');
    const rawSingle=sessionStorage.getItem('pcNewChange');
    if(rawList){newChanges=JSON.parse(rawList)||[];sessionStorage.removeItem('pcNewChanges');sessionStorage.removeItem('pcNewChange');}
    else if(rawSingle){newChanges=[JSON.parse(rawSingle)];sessionStorage.removeItem('pcNewChange');}
  }catch(error){newChanges=[];}
  if(Array.isArray(newChanges)&&newChanges.length){
    newChanges.slice().reverse().forEach(newChange=>{
      if(!newChange||!newChange.id)return;
      if(!changes.some(item=>item.id===newChange.id))changes.unshift(newChange);
      if(!purchaseOrders.some(order=>order.id===newChange.orderId)){
        purchaseOrders.unshift(Object.assign({},newChange.before,{id:newChange.orderId,status:'待到齐'}));
      }
    });
  }
  if(presetStatus||(Array.isArray(newChanges)&&newChanges.length)){
    applyFilters();
  }
  if(presetChangeId){
    setTimeout(()=>{
      const change=changes.find(item=>item.id===presetChangeId);
      if(change)openDetail(change,false);
      if(window.history&&history.replaceState)history.replaceState(null,'',window.location.pathname);
    },80);
  }
}
bindStatic();
})();