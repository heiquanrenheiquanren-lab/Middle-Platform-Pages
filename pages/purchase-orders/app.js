const suppliers=['JASIC 供应商','ARCCAP 供应商','华南五金','东莞焊材','测试供应商'];
const warehouses=['东莞采购仓','深圳采购仓','宁波采购仓','洛杉矶海外仓','供应商直发仓'];
const platforms=['Amazon','eBay','B2C','线下订单'];
const stores=['ARCCAP','Lowes_ar','arccaptain','Amazon US 旗舰店','线下订单'];
const teams=['亚马逊团队','Jasic团队','eBay团队','B端团队','公共库存'];
const receivers=['张敏','李晨','王磊','赵倩','仓库管理员'];
const creators=['Admin','张敏','李晨','王磊','系统管理员'];
const skuPool=['140US260008','42101000004','XX123456-1','DD123456','EE123456','FF123456','KK123456','fan-test-sku'];
const icons=['🎒','🧰','▧','📦','🧯','🪖','🌺','🐹'];
const statusPool=['待提交','待提交','待审批','待收货','待收货','已完成','待收货','已完成','待提交','待收货','已完成','待收货','已完成'];
const docItemCounts=[2,2,1,3,1,2,3,2,2,1,3,2,3];

function money(value){return `¥ ${Number(value).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}

const lineRows=Array.from({length:27},(_,i)=>({
  id:`line-${i+1}`,index:i,sku:skuPool[i%skuPool.length],icon:icons[i%icons.length],
  planNo:`CGJH202608${String(1001+i)}`,batchNo:`PC2026${String(8001+i)}`,
  platform:platforms[i%platforms.length],store:stores[i%stores.length],team:teams[i%teams.length],
  receiver:receivers[i%receivers.length],receiveDate:`2026-08-${String(6+(i%22)).padStart(2,'0')}`,
  purchaseQty:[9,66,100,2000,110][i%5],unitPrice:[12,15,18,20][i%4],transitQty:[0,66,100,2000,110][i%5],
  arrivedQty:i%4===0?9:i%4===1?0:i%4===2?0:210,pendingQty:i%3===0?0:i%3===1?2000:11,
  receiveQty:i%4===0?8:0,materialFee:i%5===0?100:0,freight:i%5===0?10:0,otherFee:0,
  name:['140US 焊接工具套装','焊接防护手套','测试商品 XX123456','焊接面罩自动变光','电焊钳 300A'][i%5],
  lingxingSku:`LXSKU-${String(360008+i).padStart(6,'0')}`,sellerSku:`SELLER-${String(260008+i).padStart(8,'0')}`,fnsku:i%3===0?`X00FN${String(100+i)}`:'—',
  supplierItemNo:i%3===0?`SUP-${String(110700+i)}`:'—',demandGap:[0,20,100,300][i%4],suggestedQty:[0,20,100,300][i%4],
  expectedDeliveryDate:`2026-09-${String(8+(i%18)).padStart(2,'0')}`,plannedShipmentQty:[0,100,1000,20][i%4],
  expectedShipDate:`2026-09-${String(12+(i%12)).padStart(2,'0')}`,expectedArrivalDate:`2026-10-${String(2+(i%20)).padStart(2,'0')}`,
  platformStock:i%5===0?0:2,platformTransit:i%4===0?0:20,overseasStock:i%3===0?300:0,overseasPending:i%4===0?20:0,
  overseasTransit:i%3===1?20:0,localStock:i%5===0?7:0,localPending:i%4===1?10:0,supplierStock:i%3===0?600:0,
  otherInboundFee:i%6===0?30:0,receiveRemark:i%4===0?'已核对入库':'—'
}));

let lineCursor=0;
const purchaseOrders=docItemCounts.map((itemCount,docIndex)=>{
  const source=lineRows.slice(lineCursor,lineCursor+itemCount);lineCursor+=itemCount;
  const first=source[0];
  const isLingxing=docIndex%2===1;
  const doc={
    id:`po-${docIndex+1}`,ecNo:isLingxing?'—':`ECPO2026${String(805001+docIndex)}`,lxNo:isLingxing?`LXPO2026${String(610001+docIndex)}`:'—',erpSource:isLingxing?'领星':'易仓',
    midNo:`PO2026${String(727001+docIndex)}`,trackingNo:`PO2026${String(805001+docIndex)}`,
    supplier:suppliers[docIndex%suppliers.length],warehouse:warehouses[docIndex%warehouses.length],
    purchaseOwner:['张敏','李晨','王磊','赵倩'][docIndex%4],settlement:['账期 30 天','款到发货','账期 45 天'][docIndex%3],
    purchaseSubject:['焊捷科技有限公司','焊捷供应链（深圳）有限公司'][docIndex%2],currency:docIndex%3===0?'USD':'CNY',
    taxIncluded:docIndex%3===0?'否':'是',prepayRate:[0,20,30,50][docIndex%4],creator:creators[docIndex%creators.length],
    status:statusPool[docIndex],tax:[0,5,13,0][docIndex%4],receiveDate:first.receiveDate,
    logistics:docIndex%3===0?[{no:`SF${String(20260831001+docIndex)}`,company:'顺丰速运'},{no:`YTO${String(20260831001+docIndex)}`,company:'圆通速递'}]:[{no:`UPS${String(20260831001+docIndex)}`,company:'UPS'}],logisticsIndex:0,
    remark:docIndex%3===0?'部分到货，待供应商补发':'',attachments:docIndex%3===0?['采购合同.pdf','装箱单.xlsx']:[],updatedBy:['Admin','张敏','李晨'][docIndex%3],
    createdAt:`2026-08-${String(6+docIndex).padStart(2,'0')} 10:20`,updatedAt:`2026-08-${String(7+docIndex).padStart(2,'0')} 16:40`,items:source
  };
  doc.purchaseQty=source.reduce((sum,row)=>sum+row.purchaseQty,0);
  doc.transitQty=source.reduce((sum,row)=>sum+row.transitQty,0);
  doc.arrivedQty=source.reduce((sum,row)=>sum+row.arrivedQty,0);
  doc.pendingQty=source.reduce((sum,row)=>sum+row.pendingQty,0);
  doc.receiveQty=source.reduce((sum,row)=>sum+row.receiveQty,0);
  doc.amount=source.reduce((sum,row)=>sum+90+(docIndex*1376),0);
  doc.totalFees=source.reduce((sum,row)=>sum+row.materialFee+row.freight+row.otherFee,0);
  return doc;
});

const statusDefs=[['全部',null],['待提交','待提交'],['待审批','待审批'],['待收货','待收货'],['已完成','已完成']];
const state={suppliers:[],warehouses:[],platforms:[],stores:[],teams:[],receivers:[],creators:[],status:null,page:1,pageSize:10,selected:new Set(),expanded:new Set(),filtered:[...purchaseOrders]};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function toast(text,type='success'){const el=$('#toast');el.textContent=text;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800);}
function closeMenus(except){$$('.multi').forEach(m=>{if(m!==except){m.querySelector('[data-menu]').classList.remove('show');m.querySelector('[data-trigger]').classList.remove('open');}});}
document.addEventListener('click',()=>closeMenus());
function initMulti(rootId,items,key,placeholder){
  const root=$(rootId),trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
  const sync=()=>{state[key]=[...menu.querySelectorAll('input:checked')].map(x=>x.value);trigger.textContent=state[key].length?`${state[key].slice(0,2).join('、')}${state[key].length>2?` +${state[key].length-2}`:''}`:placeholder;trigger.classList.toggle('has-value',!!state[key].length);};
  menu.innerHTML=items.map(v=>`<label><input type="checkbox" value="${v}" ${state[key].includes(v)?'checked':''}>${v}</label>`).join('');
  trigger.onclick=e=>{e.stopPropagation();closeMenus(root);menu.classList.toggle('show');trigger.classList.toggle('open',menu.classList.contains('show'));};menu.onclick=e=>e.stopPropagation();menu.onchange=sync;sync();
}
function splitValues(value){return [...new Set(value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}
function includesAny(value,values){return !values.length||values.some(v=>(value||'').toLowerCase().includes(v));}
function equalsAny(value,values){return !values.length||values.includes(value);}
function docMatches(row,{orderNos,skus,plans,batches,start,end}){
  const matchesLine=line=>includesAny(line.sku,skus)&&includesAny(line.planNo,plans)&&includesAny(line.batchNo,batches);
  return (!orderNos.length||orderNos.some(v=>[row.ecNo,row.lxNo,row.midNo,row.trackingNo].some(no=>no.toLowerCase().includes(v))))&&
    (!skus.length&&!plans.length&&!batches.length||row.items.some(matchesLine))&&
    equalsAny(row.supplier,state.suppliers)&&equalsAny(row.warehouse,state.warehouses)&&
    (!state.platforms.length||row.items.some(item=>state.platforms.includes(item.platform)))&&
    (!state.stores.length||row.items.some(item=>state.stores.includes(item.store)))&&
    (!state.teams.length||row.items.some(item=>state.teams.includes(item.team)))&&
    (!state.receivers.length||row.items.some(item=>state.receivers.includes(item.receiver)))&&
    equalsAny(row.creator,state.creators)&&(!state.status||row.status===state.status)&&
    (!start||row.receiveDate>=start)&&(!end||row.receiveDate<=end);
}
function validateDates(){const start=$('#startDate').value,end=$('#endDate').value;if((start&&!end)||(!start&&end)){toast('请选择完整的收货时间范围','error');return false;}if(start&&end&&start>end){toast('开始日期不能晚于结束日期','error');return false;}return true;}
function renderTabs(){$('#statusTabs').innerHTML='<span class="tab-check">☑</span>'+statusDefs.map(([label,key])=>{const count=key===null?purchaseOrders.length:purchaseOrders.filter(row=>row.status===key).length;return `<div class="status-tab ${state.status===key?'active':''}" data-key="${key===null?'__all':key}">${label}<span class="tab-count">(${count})</span></div>`;}).join('');$$('.status-tab').forEach(tab=>tab.onclick=()=>{state.status=tab.dataset.key==='__all'?null:tab.dataset.key;state.page=1;applyFilters(false);renderTabs();});}
function applyFilters(showMessage=true){
  if(!validateDates())return;
  const criteria={orderNos:splitValues($('#purchaseOrderNo').value),skus:splitValues($('#skuInput').value),plans:splitValues($('#planNo').value),batches:splitValues($('#batchNo').value),start:$('#startDate').value,end:$('#endDate').value};
  state.filtered=purchaseOrders.filter(row=>docMatches(row,criteria));state.page=Math.min(state.page,Math.max(1,Math.ceil(state.filtered.length/state.pageSize)));renderTable();if(showMessage)toast(`查询完成，共 ${state.filtered.length} 张采购单`);
}
const multiConfigs=[['#supplierMulti',suppliers,'suppliers','供应商（可多选）'],['#warehouseMulti',warehouses,'warehouses','采购仓库（可多选）'],['#platformMulti',platforms,'platforms','平台（可多选）'],['#storeMulti',stores,'stores','店铺（可多选）'],['#teamMulti',teams,'teams','团队（可多选）'],['#receiverMulti',receivers,'receivers','收货人（可多选）'],['#creatorMulti',creators,'creators','创建人（可多选）']];
function reset(){
  Object.assign(state,{suppliers:[],warehouses:[],platforms:[],stores:[],teams:[],receivers:[],creators:[],status:null,page:1,expanded:new Set(),filtered:[...purchaseOrders]});
  ['#purchaseOrderNo','#skuInput','#planNo','#batchNo','#startDate','#endDate'].forEach(id=>$(id).value='');
  multiConfigs.forEach(([id,,key,placeholder])=>{const root=$(id);root.querySelectorAll('input').forEach(input=>input.checked=state[key].includes(input.value));const trigger=root.querySelector('[data-trigger]');trigger.textContent=state[key].length?state[key].join('、'):placeholder;trigger.classList.toggle('has-value',!!state[key].length);});renderTabs();renderTable();toast('已重置查询条件');
}
function copyButton(value){return value&&value!=='—'?`<button class="copy-btn" data-action="copy" data-copy="${value}" title="复制 ${value}" aria-label="复制 ${value}">⧉</button>`:'';}
function copyValue(value){const done=()=>toast(`已复制：${value}`);if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(value).then(done).catch(()=>toast('复制失败','error'));return;}const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{document.execCommand('copy');done();}catch{toast('复制失败','error');}document.body.removeChild(area);}
function itemNameCell(item){return `<div class="detail-product"><span class="thumb">${item.icon}</span><span><b>${item.name}</b></span></div>`;}
function renderDetail(row){return `<div class="detail-panel"><div class="detail-panel-head"><div><span>采购明细</span><span class="detail-field-group">计划与采购信息</span></div><span>共 ${row.items.length} 个 SKU · 展示采购计划明细字段</span></div><div class="detail-scroll"><table class="detail-table"><thead><tr><th class="detail-check"></th><th class="detail-plan">计划号</th><th class="detail-batch">批次号</th><th class="detail-sku">SKU</th><th class="detail-name">品名</th><th>采购数</th><th>采购单价</th><th>SKU金额</th><th>到货数</th><th>收货数量</th><th>在途数</th><th>收货时间</th><th>团队</th><th>平台</th><th>店铺</th><th>领星SKU</th><th>Seller SKU</th><th>FNSKU</th><th>期望交货日期</th><th>预计到货日期</th></tr></thead><tbody>${row.items.map(item=>`<tr><td></td><td>${item.planNo}${copyButton(item.planNo)}</td><td>${item.batchNo}${copyButton(item.batchNo)}</td><td>${item.sku}${copyButton(item.sku)}</td><td class="detail-left">${itemNameCell(item)}</td><td>${item.purchaseQty}</td><td>${money(item.unitPrice)}</td><td>${money(item.purchaseQty*item.unitPrice)}</td><td>${item.arrivedQty}</td><td class="receive-number">${item.receiveQty}</td><td>${item.transitQty}</td><td>${item.receiveDate}</td><td>${item.team}</td><td>${item.platform}</td><td>${item.store}</td><td>${item.lingxingSku}${copyButton(item.lingxingSku)}</td><td>${item.sellerSku}${copyButton(item.sellerSku)}</td><td>${item.fnsku}${copyButton(item.fnsku)}</td><td>${item.expectedDeliveryDate}</td><td>${item.expectedArrivalDate}</td></tr>`).join('')}</tbody></table></div></div>`;}
function renderLogistics(row){const current=row.logistics[row.logisticsIndex]||row.logistics[0];return `<div class="logistics-cell"><div class="logistics-no">物流单号：${current.no}${copyButton(current.no)}</div><div class="logistics-company">物流公司：${current.company}</div><div class="logistics-dots">${row.logistics.map((item,index)=>`<button class="logistics-dot ${index===row.logisticsIndex?'active':''}" data-action="logistics" data-id="${row.id}" data-index="${index}" aria-label="切换物流 ${index+1}"></button>`).join('')}</div></div>`;}
function closeErpPopup(){$('#erpPopup').hidden=true;}
function showErpPopup(row,anchor){const popup=$('#erpPopup'),fields=[['计划数量',row.purchaseQty],['SKU数量',row.items.length],['采购仓',row.warehouse],['采购主体',row.purchaseSubject],['采购负责人',row.purchaseOwner],['联系人','—'],['联系方式','—'],['结算方式',row.settlement],['结算币种',row.currency],['预付比例',`${row.prepayRate}%`],['是否含税',row.taxIncluded],['创建人',row.creator],['创建时间',row.createdAt],['更新时间',row.updatedAt],['备注',row.remark||'—']];popup.innerHTML=`<div class="erp-popup-header"><div><b>ERP采购单详情</b><span>${row.erpSource} · ${row.erpSource==='易仓'?row.ecNo:row.lxNo}</span></div><button class="erp-popup-close" type="button" aria-label="关闭弹窗">×</button></div><div class="erp-popup-grid">${fields.map(([label,value])=>`<div class="erp-popup-field"><span>${label}</span><b>${value}</b></div>`).join('')}</div>`;popup.hidden=false;const rect=anchor.getBoundingClientRect(),gap=8,width=Math.min(760,window.innerWidth-24);popup.style.width=`${width}px`;let left=Math.min(Math.max(12,rect.left),window.innerWidth-width-12),top=rect.bottom+gap;const height=popup.offsetHeight;if(top+height>window.innerHeight-12)top=Math.max(12,rect.top-height-gap);popup.style.left=`${left}px`;popup.style.top=`${top}px`;popup.querySelector('.erp-popup-close').onclick=closeErpPopup;}
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeErpPopup();});
function renderLegacyTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);
  $('#totalCount').textContent=total;$('#jumpPage').value=state.page;$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;$('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');$$('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderTable();});
  if(!data.length){$('#tableBody').innerHTML='<tr class="empty-row"><td colspan="9"><div class="empty-icon">◇</div>暂无符合条件的数据</td></tr>';syncSelection();return;}
  $('#tableBody').innerHTML=data.map(row=>{const expanded=state.expanded.has(row.id),progress=row.purchaseQty?Math.min(100,Math.round(row.receiveQty/row.purchaseQty*100)):0,statusClass=row.status==='已完成'?'done':'pending';return `<tr class="po-parent-row ${expanded?'is-expanded':''}" data-id="${row.id}"><td class="check-cell"><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td><td class="expand-cell"><button class="expand-btn ${expanded?'open':''}" data-action="toggle" data-id="${row.id}" aria-label="${expanded?'收起':'展开'}采购明细">⌄</button></td><td class="po-info-cell"><div class="po-title"><span class="po-label">中台</span><a>${row.midNo}</a><span class="status-tag status-${statusClass}">${row.status}</span></div><div class="po-subline">易仓 ${row.ecNo} · 领星 ${row.lxNo}</div><div class="po-subline muted">跟踪号 ${row.trackingNo}</div></td><td><div class="stack-cell"><b>${row.supplier}</b><span>${row.warehouse}</span></div></td><td><div class="summary-cell"><b>${row.items.length} 个 SKU</b><span>采购 ${row.purchaseQty} · 到货 ${row.arrivedQty}</span><span>在途 ${row.transitQty} · 待收 ${row.pendingQty}</span></div></td><td><div class="summary-cell"><b>${money(row.amount)}</b><span>税率 ${row.tax}%</span><span>费用 ${money(row.totalFees)}</span></div></td><td><div class="progress-cell"><div><b>${row.receiveQty}</b> / ${row.purchaseQty}</div><div class="progress-track"><i style="width:${progress}%"></i></div><span>${progress}% 已收货</span></div></td><td><div class="stack-cell"><b>${row.creator}</b><span>${row.receiveDate}</span></div></td><td class="action-cell"><button class="link-btn" data-action="view" data-id="${row.id}">查看</button><button class="link-btn" data-action="receive-list" data-id="${row.id}">收货</button><button class="more-btn" data-action="more" data-id="${row.id}">更多⌄</button></td></tr>${expanded?`<tr class="po-detail-row" data-parent-id="${row.id}"><td colspan="9">${renderDetail(row)}</td></tr>`:''}`;}).join('');
  $$('.row-check').forEach(check=>check.onchange=()=>{const id=check.dataset.id;check.checked?state.selected.add(id):state.selected.delete(id);syncSelection();});
  $$('.expand-btn').forEach(button=>button.onclick=()=>{const id=button.dataset.id;state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);renderTable();});
  $$('[data-action]').forEach(button=>{const action=button.dataset.action;if(action==='toggle'||action==='more')return;button.onclick=()=>{const row=purchaseOrders.find(item=>item.id===button.dataset.id);if(action==='view')toast(`已打开 ${row.midNo}`);if(action==='receive'||action==='receive-list')toast(`已进入 ${row.midNo} 的收货处理`);};});
  syncSelection();
}
/* 重新定义一级采购单表格：勾选框、序号、展开箭头后接八个业务列。 */
function renderTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);
  $('#totalCount').textContent=total;$('#jumpPage').value=state.page;$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;$('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');$$('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderTable();});
  if(!data.length){$('#tableBody').innerHTML='<tr class="empty-row"><td colspan="11"><div class="empty-icon">◇</div>暂无符合条件的数据</td></tr>';syncSelection();return;}
  $('#tableBody').innerHTML=data.map((row,index)=>{const expanded=state.expanded.has(row.id),statusClass=row.status==='已完成'?'done':'pending',erpNo=row.erpSource==='易仓'?row.ecNo:row.lxNo;return `<tr class="po-parent-row ${expanded?'is-expanded':''}" data-id="${row.id}"><td class="check-cell"><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td><td class="sequence-cell">${start+index+1}</td><td class="expand-cell"><button class="expand-btn ${expanded?'open':''}" data-action="toggle" data-id="${row.id}" aria-label="${expanded?'收起':'展开'}采购明细">⌄</button></td><td class="po-info-cell"><div class="po-title"><span class="field-inline">中台跟踪号：</span><a>${row.midNo}</a>${copyButton(row.midNo)}</div><div class="po-subline po-erp-line"><span>ERP采购单号：</span><button class="erp-link" type="button" data-action="erp-detail" data-id="${row.id}">${erpNo}</button>${copyButton(erpNo)}<span class="erp-tag">${row.erpSource}</span></div><div class="po-subline">采购仓库：${row.warehouse}</div><div class="po-status-line"><span class="field-inline">采购单状态：</span><span class="status-tag status-${statusClass}">${row.status}</span></div></td><td><div class="stack-cell labeled-cell"><span>供应商名称：<b>${row.supplier}</b></span><span>采购负责人：${row.purchaseOwner}</span><span>结算方式：${row.settlement}</span><span>采购主体：${row.purchaseSubject}</span></div></td><td><div class="summary-cell labeled-cell"><span>采购金额：<b>${money(row.amount)}</b></span><span>预付比例：${row.prepayRate}%</span><span>结算币种：${row.currency}</span><span>是否含税：${row.taxIncluded}</span><span>税率：${row.tax}%</span></div></td><td><div class="summary-cell labeled-cell"><span>下单总数量：<b>${row.purchaseQty}</b></span><span>收货总数量：<b class="receive-number">${row.receiveQty}</b></span><span>在途总数量：<b>${row.transitQty}</b></span><span>收货总金额：${money(row.receiveQty*12)}</span><span>在途总金额：${money(row.transitQty*12)}</span></div></td><td>${renderLogistics(row)}</td><td class="remark-cell"><label>备注：</label><input class="parent-remark-input" data-action="remark" data-id="${row.id}" value="${row.remark}" placeholder="请输入备注"><button class="attachment-btn" data-action="attachments" data-id="${row.id}">附件${row.attachments.length?` (${row.attachments.length})`:''}</button></td><td><div class="stack-cell labeled-cell"><span>创建人：${row.creator}</span><span>创建时间：${row.createdAt}</span><span>更新人：${row.updatedBy}</span><span>更新时间：${row.updatedAt}</span></div></td><td class="action-cell"><button class="link-btn" data-action="receive" data-id="${row.id}">修改收货数量</button><button class="link-btn" data-action="price" data-id="${row.id}">修改价格</button><button class="link-btn" data-action="logistics-edit" data-id="${row.id}">编辑物流单</button><button class="link-btn" data-action="log" data-id="${row.id}">日志</button></td></tr>${expanded?`<tr class="po-detail-row" data-parent-id="${row.id}"><td colspan="11">${renderDetail(row)}</td></tr>`:''}`;}).join('');
  $$('.row-check').forEach(check=>check.onchange=()=>{const id=check.dataset.id;check.checked?state.selected.add(id):state.selected.delete(id);syncSelection();});
  $$('.expand-btn').forEach(button=>button.onclick=()=>{const id=button.dataset.id;state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);renderTable();});
  $$('.logistics-dot').forEach(button=>button.onclick=()=>{const row=purchaseOrders.find(item=>item.id===button.dataset.id);row.logisticsIndex=Number(button.dataset.index);renderTable();});
  $$('.parent-remark-input').forEach(input=>input.onchange=()=>{const row=purchaseOrders.find(item=>item.id===input.dataset.id);row.remark=input.value;});
  $$('.copy-btn').forEach(button=>button.onclick=event=>{event.stopPropagation();copyValue(button.dataset.copy);});
  $$('.erp-link').forEach(button=>button.onclick=event=>{event.stopPropagation();const row=purchaseOrders.find(item=>item.id===button.dataset.id);showErpPopup(row,button);});
  $$('[data-action]').forEach(button=>{const action=button.dataset.action;if(['toggle','logistics','remark','copy','erp-detail'].includes(action))return;button.onclick=()=>{const row=purchaseOrders.find(item=>item.id===button.dataset.id);if(action==='attachments')toast(row.attachments.length?`已打开附件：${row.attachments.join('、')}`:'该采购单暂无附件');else if(action==='receive')toast(`已进入 ${row.midNo} 的收货处理`);else if(action==='price')toast(`已打开 ${row.midNo} 的价格修改`);else if(action==='logistics-edit')toast(`已打开 ${row.midNo} 的物流单编辑`);else if(action==='log')toast(`已打开 ${row.midNo} 的操作日志`);};});
  syncSelection();
}
function syncSelection(){const visible=$$('.row-check'),checked=visible.filter(x=>x.checked).length;$('#selectedCount').textContent=state.selected.size;$('#selectAll').checked=visible.length>0&&checked===visible.length;$('#selectAll').indeterminate=checked>0&&checked<visible.length;}
$('#selectAll').onchange=e=>{$$('.row-check').forEach(check=>{check.checked=e.target.checked;e.target.checked?state.selected.add(check.dataset.id):state.selected.delete(check.dataset.id);});syncSelection();};
$('#searchBtn').onclick=()=>{state.page=1;applyFilters();};$('#resetBtn').onclick=reset;$('#refreshBtn').onclick=()=>{applyFilters(false);toast('数据已刷新');};$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};$('#nextPage').onclick=()=>{const pages=Math.ceil(state.filtered.length/state.pageSize);if(state.page<pages){state.page++;renderTable();}};$('#jumpPage').onchange=e=>{const pages=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(pages,Math.max(1,Number(e.target.value)||1));renderTable();};
$$('#purchaseOrderNo,#skuInput,#planNo,#batchNo').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter')$('#searchBtn').click();}));$$('#startDate,#endDate').forEach(input=>input.addEventListener('click',()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}));
function initQueryExpand(){const panel=$('.query-panel'),button=$('#queryExpand'),arrow=button.querySelector('.query-arrow'),label=button.querySelector('.query-expand-text');button.onclick=()=>{const expanded=panel.classList.toggle('expanded');arrow.textContent=expanded?'⌃':'⌄';label.textContent=expanded?'收起':'展开';button.setAttribute('aria-expanded',String(expanded));};}
function initPageNav(){$$('[data-page-nav]').forEach(item=>item.onclick=()=>{const page=item.dataset.pageNav;if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page},'*');else window.location.href={forecast:'../demand-forecast/index.html',stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',skuFirstLegCost:'../sku-first-leg-cost/index.html',supplierInventory:'../supplier-inventory/index.html',processingOrder:'../processing-orders/index.html'}[page];});}
function initResponsiveQueryLayout(){const panel=$('.query-panel'),rowOne=$('#queryRowOne'),rowTwo=$('#queryRowTwo'),advanced=$('.advanced-query-row'),actions=$('.query-actions'),items=$$('.query-item[data-query-order]').sort((a,b)=>Number(a.dataset.queryOrder)-Number(b.dataset.queryOrder));const itemWidth=item=>{if(item.classList.contains('time-query'))return [...item.children].reduce((sum,child)=>sum+(child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0),0)+10;const child=item.firstElementChild;return child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0;};const layout=()=>{const expanded=panel.classList.contains('expanded');items.forEach(item=>rowOne.appendChild(item));rowTwo.appendChild(actions);const available=panel.clientWidth-28,gap=10,actionWidth=actions.getBoundingClientRect().width+gap;let row=1,usedOne=0,usedTwo=actionWidth;items.forEach(item=>{const width=itemWidth(item),needed=width+((row===1&&usedOne)||(row===2&&usedTwo>actionWidth)?gap:0);if(row===1&&usedOne+needed<=available){rowOne.appendChild(item);usedOne+=needed;return;}row=2;const secondNeeded=width+(usedTwo>actionWidth?gap:0);if(usedTwo+secondNeeded<=available){rowTwo.insertBefore(item,actions);usedTwo+=secondNeeded;return;}advanced.appendChild(item);});const hasAdvanced=advanced.querySelector('.query-item');$('#queryExpand').hidden=!hasAdvanced;if(!hasAdvanced&&expanded){panel.classList.remove('expanded');$('#queryExpand .query-arrow').textContent='⌄';$('#queryExpand .query-expand-text').textContent='展开';}};layout();let timer;window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(layout,80);});}
initPageNav();initQueryExpand();multiConfigs.forEach(config=>initMulti(...config));initResponsiveQueryLayout();renderTabs();renderTable();
