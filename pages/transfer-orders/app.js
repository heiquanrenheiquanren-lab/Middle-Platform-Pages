(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const now = () => '2026-09-22 16:40';
  const warehouses = ['华东实体仓', 'SZ01东莞仓', 'Temu09-全托管平台仓', '快猫物流中转仓'];
  const logisticsChannels = ['顺丰','京东物流','德邦','中通','圆通'];
  const logisticsChannelStorageKey = 'transfer-logistics-channels-v2';
  function customLogisticsChannels(){
    try{
      const saved = JSON.parse(localStorage.getItem(logisticsChannelStorageKey) || '[]');
      return Array.isArray(saved) ? saved.filter(item => typeof item === 'string' && item.trim()) : [];
    }catch(error){ return []; }
  }
  function logisticsChannelList(){ return [...new Set([...logisticsChannels, ...customLogisticsChannels()])]; }
  function persistLogisticsChannel(name){
    const value = String(name || '').trim();
    if(!value || logisticsChannels.includes(value)) return;
    const saved = customLogisticsChannels();
    if(saved.includes(value)) return;
    saved.push(value);
    try{ localStorage.setItem(logisticsChannelStorageKey, JSON.stringify(saved)); }catch(error){}
  }
  const teams = ['公共库存', 'Temu团队', '亚马逊北美团队', '独立站团队'];
  const warehouseTransferHelp = '仓间调拨仅支持自营仓与物流中转之间的空间调拨，货权调拨支持全部类型仓库';
  const skuPool = [
    {sku:'KBAB0057-009',name:'焊接面罩自动变光款',sourceSku:'KBAB0057-009',targetSku:'KBAB0057-009',available:312,price:6.4881,costBatches:[{quantity:160,unitCost:6.32},{quantity:152,unitCost:6.66}],team:'Temu团队',stockWarehouses:['华东实体仓','SZ01东莞仓']},
    {sku:'34001001110',name:'焊接帽子迷彩 2-白色',sourceSku:'34001001110',targetSku:'34001001110',available:240,price:12.86,costBatches:[{quantity:120,unitCost:12.48},{quantity:120,unitCost:13.24}],team:'公共库存',stockWarehouses:['华东实体仓']},
    {sku:'34001001206',name:'焊接手套加厚款',sourceSku:'34001001206',targetSku:'34001001206',available:186,price:18.5,costBatches:[{quantity:90,unitCost:18.12},{quantity:96,unitCost:18.86}],team:'亚马逊北美团队',stockWarehouses:['华东实体仓','Temu09-全托管平台仓']},
    {sku:'34001001401',name:'焊接护目镜防雾款',sourceSku:'34001001401',targetSku:'34001001401',available:154,price:25.2,costBatches:[{quantity:70,unitCost:24.8},{quantity:84,unitCost:25.53}],team:'独立站团队',stockWarehouses:['SZ01东莞仓']},
    {sku:'34001001501',name:'焊接面罩手持式',sourceSku:'34001001501',targetSku:'34001001501',available:128,price:32.8,costBatches:[{quantity:64,unitCost:32.15},{quantity:64,unitCost:33.45}],team:'亚马逊北美团队',stockWarehouses:['Temu09-全托管平台仓','快猫物流中转仓']}
  ];
  let orders = [
    ownershipOrder('TF2609230001','已完成','华东实体仓','Admin'),
    order('TF2609220001','待审核','华东实体仓','快猫物流中转仓',3,620,0,'快猫物流','—','2026-09-25','采购部','Admin'),
    order('TF2609210001','在途','SZ01东莞仓','Temu09-全托管平台仓',2,180,0,'中通','ZT20260921008','2026-09-23','仓库部','张三'),
    order('TF2609200001','部分入库','华东实体仓','快猫物流中转仓',4,420,360,'快猫物流','KM20260920015','2026-09-22','仓库部','李四'),
    order('TF2609180001','已完成','华东实体仓','SZ01东莞仓',1,100,100,'圆通','YT20260918007','2026-09-20','仓库部','李四'),
    order('TF2609160001','已驳回','华东实体仓','快猫物流中转仓',2,150,0,'—','—','2026-09-21','仓库部','王五'),
    order('TF2609150001','待出库','华东实体仓','快猫物流中转仓',5,560,0,'快猫物流','—','2026-09-24','仓库部','张三'),
    order('TF2609120001','已作废','SZ01东莞仓','华东实体仓',1,80,0,'—','—','2026-09-18','仓库部','王五'),
    order('TF2609100001','异常','华东实体仓','快猫物流中转仓',2,230,200,'顺丰','SF20260910002','2026-09-14','仓库部','李四')
  ];
  function transferDate(no){const match=String(no).match(/^TF(\d{2})(\d{2})(\d{2})/);return match?`20${match[1]}-${match[2]}-${match[3]}`:now().slice(0,10);}
  // 顺序号按单据日期单独计数：每天从 0001 开始，不跨日期累计。
  function nextTransferNo(){
    const dateKey=now().slice(0,10).replaceAll('-','').slice(2);
    const prefix=`TF${dateKey}`;
    const todayMax=orders
      .filter(row=>String(row.no).startsWith(prefix))
      .reduce((max,row)=>Math.max(max,Number(String(row.no).slice(-4))||0),0);
    return `${prefix}${String(todayMax+1).padStart(4,'0')}`;
  }
  function order(no,status,source,target,skuCount,requestQty,inboundQty,channel,waybill,eta,department,creator){
    const hasLogistics=Boolean(channel&&channel!=='—'&&waybill&&waybill!=='—');
    const shipped=!['待审核','待出库','已驳回','已作废'].includes(status);
    const received=Number(inboundQty||0)>0;
    return {id:no,no,status,transferType:'仓间调拨',source,target,skuCount,requestQty,outboundQty:shipped?requestQty:0,inboundQty,voidedQty:0,channel:hasLogistics?channel:'—',waybill:hasLogistics?waybill:'—',eta,department,creator,createdAt:`${transferDate(no)} 10:20`,updatedAt:now(),outboundAt:shipped?`${transferDate(no)} 14:30`:'',inboundAt:received?`${transferDate(no)} 18:10`:'',inheritAge:true,fee:0,otherFee:0,remark:'',items:[]};
  }
  function ownershipOrder(no,status,warehouse,creator){
    const items=[
      {...skuPool[0],sourceWarehouse:warehouse,team:'Temu团队',targetTeam:'亚马逊北美团队',quantity:100,remark:'团队货权调整'},
      {...skuPool[1],sourceWarehouse:warehouse,team:'公共库存',targetTeam:'独立站团队',quantity:40,remark:''}
    ];
    return {...order(no,status,warehouse,warehouse,items.length,140,0,'—','—','—','库存管理',creator),transferType:'货权调拨',ownershipWarehouse:warehouse,items,remark:'同仓团队货权调整',ownershipCompleted:status==='已完成',auditDecision:status==='已完成'?'approve':'',outboundQty:0,inboundQty:0,voidedQty:0};
  }
  const CURRENT_USER = 'Admin';
  const state = {status:'全部',page:1,pageSize:10,selected:new Set(),expanded:new Set(),editing:null,editorType:'仓间调拨',editorDraft:null,pickerRows:[],pickerSelected:new Set(),importFile:null,importRows:[],importErrors:[],sourceWarehouses:[],targetWarehouses:[],sourceTeams:[],targetTeams:[],channels:[],creators:[CURRENT_USER],transferType:'',queryExpanded:false};
  function defaultQueryValues(key){return key==='creators'?[CURRENT_USER]:[];}
  const importColumns = [
    {key:'sku',label:'SKU',required:true,description:'【必填】填写有效 SKU，SKU 必须存在且属于调出仓库库存。'},
    {key:'sourceWarehouse',label:'调出仓库',required:true,description:'【必填】填写调出库存的仓库名称，必须与系统仓库一致。'},
    {key:'targetWarehouse',label:'调入仓库',required:true,description:'【必填】填写接收库存的仓库名称，不能与调出仓库相同。'},
    {key:'sourceTeam',label:'调出团队',required:true,description:'【必填】填写 SKU 对应的调出团队，必须与库存中的团队一致。'},
    {key:'targetTeam',label:'调入团队',required:true,description:'【必填】填写本次调拨的目标团队。'},
    {key:'quantity',label:'调拨数量',required:true,description:'【必填】填写大于 0 的整数，不能超过对应 SKU 的在库量。'},
    {key:'eta',label:'预计到仓',required:false,description:'【选填】填写预计到仓日期，格式为 YYYY-MM-DD。'},
    {key:'inheritAge',label:'是否继承库龄',required:true,description:'【必填】只能填写“是”或“否”。'},
    {key:'channel',label:'物流渠道',required:false,description:'【选填】填写物流渠道名称；填写物流单号时必须同时填写物流渠道。'},
    {key:'waybill',label:'物流单号',required:false,description:'【选填】填写物流单号；填写物流渠道时必须同时填写物流单号。'},
    {key:'fee',label:'运费',required:false,description:'【选填】填写大于等于 0 的数字，最多保留两位小数。'},
    {key:'otherFee',label:'其他费用',required:false,description:'【选填】填写大于等于 0 的数字，最多保留两位小数。'},
    {key:'remark',label:'SKU备注',required:false,description:'【选填】填写该 SKU 的备注，最多 120 个字符。'}
  ];
  const statusList = ['全部','待审核','待出库','在途','部分入库','已完成','已驳回','已作废','异常'];
  function splitValues(value){return [...new Set(String(value||'').trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}
  function equalsAny(value,values){return !values.length||values.includes(value);}
  function includesAny(value,values){return !values.length||values.some(item=>String(value||'').toLowerCase().includes(item));}
  function queryMultiConfigs(){
    return [
      ['#sourceWarehouseMulti',warehouses,'sourceWarehouses','请选择调出仓库（可多选）'],
      ['#targetWarehouseMulti',warehouses,'targetWarehouses','请选择调入仓库（可多选）'],
      ['#sourceTeamMulti',teams,'sourceTeams','请选择调出团队（可多选）'],
      ['#targetTeamMulti',teams,'targetTeams','请选择调入团队（可多选）'],
      ['#channelMulti',logisticsChannelList(),'channels','请选择物流渠道（可多选）'],
      ['#creatorMulti',[...new Set(orders.map(row=>row.creator))],'creators','请选择创建人（默认当前账号，可多选）']
    ];
  }
  function closeQueryMenus(except){$$('.multi').forEach(node=>{if(node===except)return;node.querySelector('[data-menu]')?.classList.remove('show');node.querySelector('[data-trigger]')?.classList.remove('open');});}
  function syncQueryMulti(rootId,key,placeholder){
    const root=$(rootId);
    if(!root)return;
    const trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
    menu.querySelectorAll('input').forEach(input=>{input.checked=state[key].includes(input.value);});
    const picked=state[key];
    trigger.textContent=picked.length?`${picked.slice(0,2).join('、')}${picked.length>2?` +${picked.length-2}`:''}`:placeholder;
    trigger.classList.toggle('has-value',Boolean(picked.length));
  }
  function initQueryMulti(rootId,items,key,placeholder){
    const root=$(rootId);
    if(!root)return;
    const trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
    if(!Array.isArray(state[key]))state[key]=defaultQueryValues(key);
    menu.innerHTML=items.map(item=>`<label><input type="checkbox" value="${escapeHtml(item)}">${escapeHtml(item)}</label>`).join('');
    trigger.onclick=event=>{event.stopPropagation();closeQueryMenus(root);menu.classList.toggle('show');trigger.classList.toggle('open',menu.classList.contains('show'));};
    const sync=()=>{state[key]=[...menu.querySelectorAll('input:checked')].map(input=>input.value);syncQueryMulti(rootId,key,placeholder);};
    menu.onclick=event=>event.stopPropagation();
    menu.onchange=sync;
    syncQueryMulti(rootId,key,placeholder);
  }
  function resetQueryMulti(){
    queryMultiConfigs().forEach(([rootId,,key,placeholder])=>{
      const root=$(rootId);
      if(!root)return;
      state[key]=defaultQueryValues(key);
      syncQueryMulti(rootId,key,placeholder);
      root.querySelector('[data-trigger]').classList.remove('open');
      root.querySelector('[data-menu]').classList.remove('show');
    });
  }
  function validateQueryDates(){
    const start=$('#startDate').value,end=$('#endDate').value;
    if((start&&!end)||(!start&&end)){toast('请选择完整的时间范围','error');return false;}
    if(start&&end&&start>end){toast('开始日期不能晚于结束日期','error');return false;}
    return true;
  }
  function syncComboPlaceholder(){
    const codeType=$('#codeType')?.value||'no',skuType=$('#skuType')?.value||'sku';
    const code=$('#codeText'),sku=$('#skuText');
    if(code)code.placeholder=`请输入${codeType==='waybill'?'物流单号':'调拨单号'}，支持输入多个，用逗号、空格或换行隔开`;
    if(sku)sku.placeholder=`请输入${skuType==='name'?'产品名称':'SKU'}，支持输入多个，用逗号、空格或换行隔开`;
  }
  // 按实际换行位置判定溢出：第三行起的查询项标记为 query-overflow-item，不写死行号。
  function layoutQuery(){
    const card=$('#queryCard');
    if(!card)return;
    card.classList.remove('query-collapsed');
    const items=$$('.query-item',card).filter(item=>!item.classList.contains('query-action-item'));
    const tops=[...new Set(items.map(item=>Math.round(item.getBoundingClientRect().top)))].sort((a,b)=>a-b);
    const overflowTop=tops[2];
    let overflow=false;
    items.forEach(item=>{
      const isOverflow=overflowTop!==undefined&&Math.round(item.getBoundingClientRect().top)>=overflowTop;
      item.classList.toggle('query-overflow-item',isOverflow);
      if(isOverflow)overflow=true;
    });
    const button=$('#queryExpand');
    if(button){
      button.hidden=!overflow;
      button.setAttribute('aria-expanded',String(state.queryExpanded));
      button.querySelector('.query-arrow').textContent=state.queryExpanded?'⌃':'⌄';
      button.querySelector('.query-expand-text').textContent=state.queryExpanded?'收起':'展开';
      button.onclick=()=>{state.queryExpanded=!state.queryExpanded;layoutQuery();};
    }
    card.classList.toggle('query-has-overflow',overflow);
    card.classList.toggle('query-collapsed',overflow&&!state.queryExpanded);
  }
  function statusClass(status){return {待审核:'review',待出库:'out',在途:'transit',部分入库:'partial',已完成:'done',已驳回:'rejected',已作废:'void',异常:'exception'}[status]||'void';}
  function toast(message,type){const node=$('#toast');node.textContent=message;node.classList.toggle('is-error',type==='error');node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2200);}
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function filtered(){
    const codeType=$('#codeType')?.value||'no';
    const codeValues=splitValues($('#codeText')?.value);
    const skuType=$('#skuType')?.value||'sku';
    const skuValues=splitValues($('#skuText')?.value);
    const hasDiff=$('#hasDiff')?.value||'';
    const transferType=$('#transferTypeQuery')?.value||'';
    const timeType=$('#timeType')?.value||'createdAt';
    const start=$('#startDate')?.value||'',end=$('#endDate')?.value||'';
    return orders.filter(row=>{
      const items=buildItems(row);
      const timeValue=String(row[timeType]||'');
      const timeKey=/^\d{4}-\d{2}-\d{2}/.test(timeValue)?timeValue.slice(0,10):'';
      const diff=Number(row.outboundQty||0)-Number(row.inboundQty||0);
      const hitCode=codeType==='waybill'?includesAny(row.waybill,codeValues):includesAny(row.no,codeValues);
      const hitSku=!skuValues.length||items.some(item=>skuValues.some(term=>String(skuType==='name'?item.name:item.sku||'').toLowerCase().includes(term)));
      return (state.status==='全部'||row.status===state.status)&&(!transferType||row.transferType===transferType)&&hitCode&&hitSku&&
        equalsAny(row.source,state.sourceWarehouses)&&equalsAny(row.target,state.targetWarehouses)&&
        (!state.sourceTeams.length||items.some(item=>state.sourceTeams.includes(item.team)))&&
        (!state.targetTeams.length||items.some(item=>state.targetTeams.includes(item.targetTeam)))&&
        equalsAny(row.channel,state.channels)&&equalsAny(row.creator,state.creators)&&
        (!start||(timeKey&&timeKey>=start))&&(!end||(timeKey&&timeKey<=end))&&
        (!hasDiff||(hasDiff==='是')===(diff>0));
    });
  }
  function renderTabs(){
    const counts=Object.fromEntries(statusList.map(status=>[status,status==='全部'?orders.length:orders.filter(row=>row.status===status).length]));
    $('#statusTabs').innerHTML=statusList.map(status=>`<button class="status-tab ${state.status===status?'active':''}" data-status="${status}">${status}<em>${counts[status]}</em></button>`).join('');
  }
  function itemProgress(items,row,index){
    const perItem=items.some(item=>typeof item.outboundQty==='number'||typeof item.inboundQty==='number'||typeof item.voidedQty==='number');
    if(perItem){
      const item=items[index];
      const outbound=typeof item.outboundQty==='number'?Number(item.outboundQty):Number(item.quantity||0);
      const inbound=typeof item.inboundQty==='number'?Number(item.inboundQty):0;
      const voided=typeof item.voidedQty==='number'?Number(item.voidedQty):0;
      return {outbound,inbound,voided,inTransit:Math.max(outbound-inbound-voided,0),diff:outbound-inbound};
    }
    let outboundRemaining=row.outboundQty,inboundRemaining=row.inboundQty,voidedRemaining=Number(row.voidedQty||0);
    return items.slice(0,index+1).reduce((progress,item,currentIndex)=>{
      const outbound=Math.min(item.quantity,Math.max(0,outboundRemaining));outboundRemaining-=outbound;
      const inbound=Math.min(outbound,Math.max(0,inboundRemaining));inboundRemaining-=inbound;
      const voided=Math.min(outbound-inbound,Math.max(0,voidedRemaining));voidedRemaining-=voided;
      return currentIndex===index?{outbound,inbound,voided,inTransit:Math.max(outbound-inbound-voided,0),diff:outbound-inbound}:progress;
    },{outbound:0,inbound:0,voided:0,inTransit:0,diff:0});
  }
  function isOwnershipTransfer(row){return row.transferType==='货权调拨';}
  function directionMarkup(row){
    return `<div class="direction"><span>${escapeHtml(row.source)}</span><span class="arrow">↓</span><span>${escapeHtml(row.target)}</span></div>`;
  }
  function progressMarkup(row){
    const ownership=isOwnershipTransfer(row);
    const outbound=ownership?0:row.outboundQty,inbound=ownership?0:row.inboundQty;
    return `<div class="field-line"><span>出库数量：</span><span>${outbound}</span></div><div class="field-line"><span>入库数量：</span><span>${inbound}</span></div><div class="field-line"><span>在途数量：</span><span>${ownership?0:Math.max(row.outboundQty-row.inboundQty-Number(row.voidedQty||0),0)}</span></div><div class="field-line"><span>差异数量：</span><span>${ownership?0:row.outboundQty-row.inboundQty}</span></div>`;
  }
  function feeMarkup(row){
    const amount=transferAmount(row);
    return `<div class="field-line"><span>运费：</span><span>${formatMoney(row.fee)}</span></div><div class="field-line"><span>其他费用：</span><span>${formatMoney(row.otherFee)}</span></div><div class="field-line"><span>调拨总金额：</span><span>${formatMoney(amount)}</span></div>`;
  }
  function logisticsMarkup(row){
    const ownership=isOwnershipTransfer(row);
    return `<div class="field-line"><span>物流渠道：</span><span>${ownership?'—':escapeHtml(row.channel||'—')}</span></div><div class="field-line"><span>物流单号：</span><span>${ownership?'—':escapeHtml(row.waybill||'—')}</span></div><div class="field-line"><span>预计到仓：</span><span>${ownership?'—':row.eta}</span></div>`;
  }
  function childDetailRow(row){
    const items=buildItems(row);
    const ownership=isOwnershipTransfer(row);
    const header='<th>SKU</th><th>产品名称</th><th>调出团队</th><th>调入团队</th><th>调拨数量</th><th>调拨金额</th><th>已出库数量</th><th>已入库数量</th><th>在途数量</th><th>差异数量</th><th>备注</th>';
    const rows=items.map((item,index)=>{
      const progress=ownership?{outbound:0,inbound:0,inTransit:0,diff:0}:itemProgress(items,row,index);return `<tr><td>${escapeHtml(item.sku)}</td><td class="left">${escapeHtml(item.name)}</td><td>${escapeHtml(item.team||'—')}</td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.quantity}</td><td>${formatMoney(itemTransferAmount(item))}</td><td>${progress.outbound}</td><td>${progress.inbound}</td><td>${progress.inTransit}</td><td>${progress.diff}</td><td class="left">${escapeHtml(item.remark||'—')}</td></tr>`;
    }).join('');
    return `<tr class="detail-row"><td colspan="10"><div class="child-detail-box"><div class="child-table-wrap"><table class="child-detail-table"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div></div></td></tr>`;
  }
  function renderTable(){
    const rows=filtered();const pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages);const pageRows=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);$('#totalCount').textContent=rows.length;$('#empty').hidden=pageRows.length>0;$('#selectAll').checked=pageRows.length>0&&pageRows.every(row=>state.selected.has(row.id));
    $('#tableBody').innerHTML=pageRows.map(row=>{const expanded=state.expanded.has(row.id);return `<tr class="parent-row ${expanded?'is-expanded':''}" data-id="${row.id}"><td><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td><td><span class="expand-row ${expanded?'is-expanded':''}" data-expand="${row.id}" role="button" tabindex="0" aria-label="${expanded?'收起':'展开'}调拨明细"><span class="expand-chevron"></span></span></td><td><div class="doc-line doc-main"><button class="link doc-no" data-action="view">${row.no}</button><span class="status-tag status-${statusClass(row.status)}">${row.status}</span></div><div class="doc-type">${escapeHtml(row.transferType||'仓间调拨')}</div></td><td>${directionMarkup(row)}</td><td>${progressMarkup(row)}</td><td>${feeMarkup(row)}</td><td>${logisticsMarkup(row)}</td><td><input class="list-remark-input" data-list-remark placeholder="请输入备注" value="${escapeHtml(row.remark||'')}"></td><td><div class="field-line"><span>创建人：</span><span>${escapeHtml(row.creator)}</span></div><div class="field-line"><span>创建时间：</span><span>${escapeHtml(row.createdAt)}</span></div></td><td><div class="action-cell">${actionsFor(row)}</div></td></tr>${expanded?childDetailRow(row):''}`;}).join('');
    $('#selectedCount').textContent=state.selected.size;renderPager(pages);
  }
  function actionsFor(row){
    const log='<button class="link log-link" data-action="log">日志</button>';
    const voidBtn='<button class="link danger-link" data-action="void">作废</button>';
    if(row.status==='待审核')return `<button class="link" data-action="edit">编辑</button>${voidBtn}${log}`;
    if(row.status==='待出库')return `<button class="link" data-action="outbound">确认出库</button>${voidBtn}${log}`;
    if(row.status==='在途'||row.status==='部分入库')return `<button class="link" data-action="inbound">入库收货</button><button class="link" data-action="complete">手动完结</button>${log}`;
    if(row.status==='已驳回')return `<button class="link" data-action="edit">编辑</button>${log}`;
    if(row.status==='已作废')return `<button class="link" data-action="edit">编辑</button>${log}`;
    if(row.status==='异常')return `<button class="link" data-action="edit">编辑</button>${log}`;
    return `${log}`;
  }
  function renderPager(pages){$('#pageButtons').innerHTML=Array.from({length:pages},(_,index)=>`<button class="page-number ${state.page===index+1?'active':''}" data-page="${index+1}">${index+1}</button>`).join('');$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;}
  function resetFilters(){
    ['startDate','endDate'].forEach(id=>{const node=$('#'+id);if(node)node.value='';});
    $('#timeType').value='createdAt';
    $('#hasDiff').value='';
    $('#transferTypeQuery').value='';
    $('#codeType').value='no';
    $('#skuType').value='sku';
    $('#codeText').value='';
    $('#skuText').value='';
    syncComboPlaceholder();
    resetQueryMulti();
    state.status='全部';state.page=1;renderTabs();renderTable();layoutQuery();toast('筛选条件已重置');
  }
  function selectedRow(){const id=state.editing;return orders.find(row=>row.id===id);}
  function formatMoney(value){return `¥${Number(value||0).toFixed(2)}`;}
  function normalizeLogistics(channel,waybill){const hasLogistics=Boolean(channel&&channel!=='—'&&waybill&&waybill!=='—');return {channel:hasLogistics?channel:'—',waybill:hasLogistics?waybill:'—'};}
  function itemCostAllocations(item){
    const requested=Math.max(0,Number(item.quantity)||0);
    const confirmed=Array.isArray(item.costAllocations)?item.costAllocations:[];
    const batches=confirmed.length?confirmed:(Array.isArray(item.costBatches)&&item.costBatches.length?item.costBatches:[{quantity:requested,unitCost:Number(item.price)||0}]);
    let remaining=requested;
    return batches.reduce((allocations,batch)=>{
      if(remaining<=0)return allocations;
      const quantity=Math.min(remaining,Math.max(0,Number(batch.quantity)||0));
      if(quantity>0)allocations.push({quantity,unitCost:Number(batch.unitCost??batch.price??item.price)||0});
      remaining-=quantity;
      return allocations;
    },[]);
  }
  function itemTransferAmount(item){return itemCostAllocations(item).reduce((sum,batch)=>sum+batch.quantity*batch.unitCost,0);}
  function transferAmount(row){return buildItems(row).reduce((sum,item)=>sum+itemTransferAmount(item),0)+Number(row.fee||0)+Number(row.otherFee||0);}
  function buildItems(row){
    if(row.items.length)return row.items;
    const count=Math.min(row.skuCount,skuPool.length);
    if(!count)return [];
    const total=Number(row.requestQty||0),base=Math.floor(total/count),remainder=total%count;
    return skuPool.slice(0,count).map((item,index)=>({...item,sourceWarehouse:row.source,team:item.team,quantity:base+(index<remainder?1:0),targetTeam:teams[(index+2)%teams.length],remark:''}));
  }
  function renderDetail(row){
    const items=buildItems(row);
    const ownership=isOwnershipTransfer(row);
    const amount=transferAmount(row);
    const value=(label,content)=>`<div class="transfer-detail-field"><span>${label}：</span><b>${content}</b></div>`;
    const status=`<span class="status-tag status-${statusClass(row.status)}">${escapeHtml(row.status)}</span>`;
    const detailRows=items.map((item,index)=>{const progress=ownership?{outbound:0,inbound:0,inTransit:0,diff:0}:itemProgress(items,row,index);return `<tr><td class="left"><b>${escapeHtml(item.sku)}</b></td><td class="left"><div class="product-cell"><span class="product-thumb">▧</span><span>${escapeHtml(item.name)}</span></div></td><td>${escapeHtml(item.team||'—')}</td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.quantity}</td><td>${formatMoney(itemTransferAmount(item))}</td><td>${progress.outbound}</td><td>${progress.inbound}</td><td>${progress.inTransit}</td><td>${progress.diff}</td><td>${escapeHtml(item.remark||'—')}</td></tr>`;}).join('');
    const fields=ownership?`${value('调拨单号',escapeHtml(row.no))}${value('单据状态',status)}${value('调拨类型','货权调拨')}${value('所在仓库',escapeHtml(row.ownershipWarehouse||row.source))}${value('调拨总金额',formatMoney(amount))}${value('创建人',escapeHtml(row.creator))}${value('创建时间',escapeHtml(row.createdAt))}`:`${value('调拨单号',escapeHtml(row.no))}${value('单据状态',status)}${value('调拨类型','仓间调拨')}${value('调出仓库',escapeHtml(row.source))}${value('调入仓库',escapeHtml(row.target))}${value('预计到仓',escapeHtml(row.eta||'—'))}${value('是否继承库龄',row.inheritAge?'是':'否')}${value('物流渠道',escapeHtml(row.channel||'—'))}${value('物流单号',escapeHtml(row.waybill||'—'))}${value('运费',formatMoney(row.fee))}${value('其他费用',formatMoney(row.otherFee))}${value('调拨总金额',formatMoney(amount))}${value('创建人',escapeHtml(row.creator))}${value('创建时间',escapeHtml(row.createdAt))}`;
    const headers='<th>SKU</th><th>产品名称</th><th>调出团队</th><th>调入团队</th><th>调拨数量</th><th>调拨金额</th><th>已出库数量</th><th>已入库数量</th><th>在途数量</th><th>差异数量</th><th>备注</th>';
    const subtitle=ownership?`${escapeHtml(row.no)} · ${escapeHtml(row.ownershipWarehouse||row.source)}（同仓货权转移）`:`${escapeHtml(row.no)} · ${escapeHtml(row.source)} → ${escapeHtml(row.target)}`;
    return `<div class="dialog detail-dialog"><header class="dialog-header"><div><h2>调拨单详情</h2><p>${subtitle}</p></div><button class="dialog-close" data-close="detail" aria-label="关闭调拨单详情">×</button></header><div class="dialog-body transfer-detail-body"><section class="section transfer-detail-section"><div class="section-title">调拨信息</div><div class="transfer-detail-field-grid">${fields}</div><div class="transfer-detail-remark"><span>备注：</span><p>${escapeHtml(row.remark||'—')}</p></div></section><section class="section transfer-detail-section"><div class="section-title">调拨明细</div><div class="section-body transfer-detail-table-wrap"><table class="detail-table transfer-detail-table"><thead><tr>${headers}</tr></thead><tbody>${detailRows}</tbody></table></div></section></div>`;
  }
  function openDetail(row){const modal=$('#detailModal');modal.innerHTML=renderDetail(row);modal.querySelector('.dialog-footer')?.remove();modal.hidden=false;bindDetail(modal,row);}
  function bindDetail(modal,row){modal.querySelectorAll('[data-close="detail"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};modal.querySelectorAll('[data-detail-action]').forEach(button=>button.onclick=()=>{modal.hidden=true;runAction(button.dataset.detailAction,row);});}
  function transferLogs(row){
    const logs=[{type:'创建调拨单',content:`创建${row.transferType||'仓间调拨'}申请`,operator:row.creator,time:row.createdAt}];
    if(row.abnormalReason)logs.push({type:'库存不足进入异常',content:row.abnormalReason,operator:'Admin',time:row.updatedAt});
    if(row.reflowLog)logs.push({type:'重新流转待出库',content:row.reflowLog,operator:'Admin',time:row.updatedAt});
    if(row.auditDecision)logs.push({type:row.auditDecision==='approve'?'审核通过':'驳回调拨单',content:row.auditReason||(isOwnershipTransfer(row)&&row.status==='已完成'?'审核通过，已完成同仓货权转移':'单据已进入后续处理流程'),operator:'Admin',time:row.updatedAt});
    else logs.push({type:row.status==='已驳回'?'驳回调拨单':'提交审核',content:row.status==='已驳回'?'库存校验未通过，请修改后重新提交':'单据已进入后续处理流程',operator:'Admin',time:row.updatedAt});
    return logs;
  }
  function renderLog(row,page=1){const logs=transferLogs(row),pageSize=10,pages=Math.max(1,Math.ceil(logs.length/pageSize)),current=Math.min(page,pages),rows=logs.slice((current-1)*pageSize,current*pageSize);return `<div class="transfer-log-dialog"><header class="transfer-log-header"><div><h2>操作日志</h2><span>调拨单：${escapeHtml(row.no)}</span></div><button class="transfer-log-close" type="button" aria-label="关闭操作日志">×</button></header><div class="transfer-log-body"><table class="transfer-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>${rows.length?rows.map(log=>`<tr><td>${escapeHtml(log.type)}</td><td class="transfer-log-content">${escapeHtml(log.content)}</td><td>${escapeHtml(log.operator)}</td><td>${escapeHtml(log.time)}</td></tr>`).join(''):'<tr><td colspan="4" class="detail-empty">暂无操作日志</td></tr>'}</tbody></table></div><footer class="transfer-log-footer"><span>共 ${logs.length} 条</span><div><button class="transfer-log-page" data-page="${Math.max(1,current-1)}" ${current<=1?'disabled':''}>‹</button>${Array.from({length:pages},(_,index)=>`<button class="transfer-log-page ${current===index+1?'active':''}" data-page="${index+1}">${index+1}</button>`).join('')}<button class="transfer-log-page" data-page="${Math.min(pages,current+1)}" ${current>=pages?'disabled':''}>›</button></div></footer></div>`;}
  function openLog(row,page=1){const modal=$('#logModal');modal.innerHTML=renderLog(row,page);modal.hidden=false;modal.querySelector('.transfer-log-close').onclick=()=>{modal.hidden=true;};modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};modal.querySelectorAll('.transfer-log-page').forEach(button=>button.onclick=()=>{if(button.disabled)return;openLog(row,Number(button.dataset.page));});}
  function auditRows(){
    const selected=orders.filter(row=>state.selected.has(row.id));
    if(!selected.length){toast('请先选择待审核调拨单','error');return null;}
    if(selected.some(row=>row.status!=='待审核')){toast('仅支持审核待审核状态的调拨单','error');return null;}
    return selected;
  }
  function renderAudit(rows){
    return `<div class="dialog audit-dialog"><header class="dialog-header"><div><h2>审核调拨单</h2><p>已选择 ${rows.length} 张待审核调拨单</p></div><button class="dialog-close" data-close="audit" aria-label="关闭审核弹窗">×</button></header><div class="dialog-body audit-body"><section class="audit-opinion"><label for="auditReason">审核意见</label><textarea id="auditReason" maxlength="500" placeholder="审核通过可留空，驳回时请填写原因"></textarea><div class="audit-opinion-footer"><em id="auditReasonCount">0 / 500</em></div><p class="audit-error" id="auditError" aria-live="polite"></p></section></div><footer class="dialog-footer audit-footer"><button class="btn" data-close="audit">取消</button><button class="btn danger" data-audit-action="reject">驳回</button><button class="btn success" data-audit-action="approve">通过</button></footer></div>`;
  }
  function outboundItemRows(row){
    return buildItems(row).map(item=>{
      const quantity=Number(item.quantity)||0;
      const available=Number(item.available);
      const stock=Number.isFinite(available)&&available>0?available:quantity;
      return {...item,quantity,stock,maxQty:Math.max(Math.min(stock,quantity),1)};
    });
  }
  function renderOutbound(row){
    const items=outboundItemRows(row);
    const channelList=logisticsChannelList();
    const channel=row.channel&&row.channel!=='—'&&channelList.includes(row.channel)?row.channel:'';
    const waybill=row.waybill&&row.waybill!=='—'?escapeHtml(row.waybill):'';
    const channelOptions=channelList.map(item=>`<option value="${escapeHtml(item)}"${item===channel?' selected':''}>${escapeHtml(item)}</option>`).join('');
    const rows=items.map((item,index)=>`<tr><td>${escapeHtml(item.sku)}</td><td class="outbound-product"><div class="outbound-product-content"><span class="product-thumb">▧</span><span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span></div></td><td>${escapeHtml(item.team||'—')}</td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.quantity}</td><td class="outbound-stock">${item.stock}</td><td><input class="outbound-input" type="number" min="1" max="${item.maxQty}" step="1" value="${item.quantity}" required data-index="${index}" aria-label="${escapeHtml(item.sku)} 出库数量"><div class="outbound-row-error"></div></td><td>${escapeHtml(item.remark||'—')}</td></tr>`).join('');
    const totalQuantity=items.reduce((sum,item)=>sum+Number(item.quantity||0),0);
    const totalStock=items.reduce((sum,item)=>sum+Number(item.stock||0),0);
    return `<div class="outbound-dialog"><header class="outbound-header"><div><h2>确认出库</h2><span>调拨单：${escapeHtml(row.no)} · ${escapeHtml(row.source)} → ${escapeHtml(row.target)}</span></div><button class="outbound-close" type="button" aria-label="关闭确认出库">×</button></header><div class="outbound-body"><div class="outbound-toolbar"><b>出库明细</b></div><div class="outbound-table-wrap"><table class="outbound-table"><thead><tr><th>SKU</th><th>品名</th><th>调出团队</th><th>调入团队</th><th>调拨数量</th><th>在库量</th><th class="outbound-required-column">出库数量</th><th>备注</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="outbound-total-row"><td colspan="4">合计</td><td>${totalQuantity}</td><td>${totalStock}</td><td data-outbound-total="outbound">0</td><td></td></tr></tfoot></table></div><div class="outbound-logistics-block"><div class="outbound-logistics-title">物流信息</div><div class="outbound-logistics"><div class="outbound-logistics-item"><label for="outboundChannel">物流渠道</label><div class="outbound-channel-field"><select class="outbound-channel-select" id="outboundChannel" aria-label="物流渠道"><option value="">请选择物流渠道</option>${channelOptions}<option value="__add_channel__">＋ 新增渠道</option></select></div></div><div class="outbound-logistics-item"><label for="outboundWaybill">物流单号</label><input class="control" id="outboundWaybill" value="${waybill}" placeholder="填写物流单号"></div></div><p class="outbound-error" id="outboundError" aria-live="polite"></p></div></div><footer class="outbound-footer"><div class="outbound-result">本次出库 <b data-outbound-summary="total">0</b> 件 · 出库后状态 <span class="status-tag status-transit">在途</span></div><div><button class="btn" data-outbound-action="cancel">取消</button><button class="btn primary" data-outbound-action="submit">确认出库</button></div></footer></div>`;
  }
  function checkOutboundInput(input){
    const value=Number(input.value);
    const max=Number(input.max);
    const error=input.parentElement.querySelector('.outbound-row-error');
    let message='';
    if(input.value===''||!Number.isInteger(value)||value<1)message='请输入大于 0 的整数';
    else if(value>max)message=`不能超过 ${max}`;
    if(error)error.textContent=message;
    input.classList.toggle('is-error',Boolean(message));
    return !message;
  }
  function syncOutboundTotal(modal){
    const total=$$('.outbound-input',modal).reduce((sum,input)=>sum+(input.classList.contains('is-error')?0:(Number(input.value)||0)),0);
    $$('[data-outbound-summary="total"], [data-outbound-total="outbound"]',modal).forEach(node=>{node.textContent=total;});
  }
  function setupOutboundChannelMenu(modal){
    window.enhanceCustomSelects?.();
    const select=$('#outboundChannel',modal);
    const wrapper=select?.closest('.custom-select');
    const menu=wrapper?.querySelector('.custom-select-menu');
    if(!select||!wrapper||!menu)return;
    const addIndex=[...select.options].findIndex(option=>option.value==='__add_channel__');
    const addOption=menu.querySelector(`.custom-select-option[data-index="${addIndex}"]`);
    if(addOption){
      addOption.classList.add('is-add-channel');
      addOption.onclick=event=>{
        event.preventDefault();
        event.stopPropagation();
        toggleNewChannel(modal,true);
      };
    }
    let editor=menu.querySelector('.outbound-channel-editor');
    if(!editor){
      editor=document.createElement('div');
      editor.className='outbound-channel-editor';
      editor.hidden=true;
      editor.innerHTML=`<input class="control" id="outboundNewChannel" maxlength="30" placeholder="请输入内容"><button class="outbound-icon-btn is-confirm" type="button" data-outbound-action="save-channel" aria-label="确认新增渠道">✓</button><button class="outbound-icon-btn is-cancel" type="button" data-outbound-action="cancel-channel" aria-label="取消新增渠道">×</button><p class="outbound-channel-editor-error" aria-live="polite"></p>`;
      menu.append(editor);
    }
    editor.onclick=event=>event.stopPropagation();
    editor.querySelector('[data-outbound-action="save-channel"]').onclick=event=>{event.stopPropagation();saveNewChannel(modal);};
    editor.querySelector('[data-outbound-action="cancel-channel"]').onclick=event=>{event.stopPropagation();toggleNewChannel(modal,false);};
    editor.querySelector('#outboundNewChannel').onkeydown=event=>{
      if(event.key==='Enter'){event.preventDefault();saveNewChannel(modal);}
      if(event.key==='Escape'){event.preventDefault();toggleNewChannel(modal,false);}
    };
  }
  function toggleNewChannel(modal,show){
    const editor=modal.querySelector('.outbound-channel-editor');
    const wrapper=modal.querySelector('.outbound-channel-field .custom-select');
    if(!editor||!wrapper)return;
    editor.hidden=!show;
    wrapper.classList.add('is-open');
    wrapper.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded','true');
    const input=editor.querySelector('#outboundNewChannel');
    const error=editor.querySelector('.outbound-channel-editor-error');
    if(error)error.textContent='';
    if(show){
      requestAnimationFrame(()=>{editor.scrollIntoView({block:'nearest'});input.focus();});
    }else{
      input.value='';
      wrapper.querySelector('.custom-select-trigger')?.focus();
    }
  }
  function rebuildChannelOptions(modal,selected){
    const select=$('#outboundChannel',modal);
    select.innerHTML=`<option value="">请选择物流渠道</option>${logisticsChannelList().map(item=>`<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}<option value="__add_channel__">＋ 新增渠道</option>`;
    select.value=selected||'';
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function saveNewChannel(modal){
    const input=$('#outboundNewChannel',modal);
    const error=modal.querySelector('.outbound-channel-editor-error');
    const value=input.value.trim();
    if(!value){error.textContent='请输入物流渠道名称';input.focus();return;}
    error.textContent='';
    const isNew=!logisticsChannelList().includes(value);
    persistLogisticsChannel(value);
    rebuildChannelOptions(modal,value);
    requestAnimationFrame(()=>{
      setupOutboundChannelMenu(modal);
      const wrapper=modal.querySelector('.outbound-channel-field .custom-select');
      wrapper?.classList.remove('is-open');
      wrapper?.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded','false');
    });
    toast(isNew?`已新增物流渠道「${value}」`:`已选择物流渠道「${value}」`);
  }
  function openOutbound(row){
    const modal=$('#outboundModal');
    modal.innerHTML=renderOutbound(row);
    modal.hidden=false;
    modal.querySelector('.outbound-close').onclick=()=>{modal.hidden=true;};
    modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    modal.querySelector('[data-outbound-action="cancel"]').onclick=()=>{modal.hidden=true;};
    setupOutboundChannelMenu(modal);
    modal.querySelectorAll('.outbound-input').forEach(input=>input.oninput=()=>{checkOutboundInput(input);syncOutboundTotal(modal);$('#outboundError',modal).textContent='';});
    modal.querySelector('[data-outbound-action="submit"]').onclick=()=>submitOutbound(row,modal);
    syncOutboundTotal(modal);
  }
  function submitOutbound(row,modal){
    const error=$('#outboundError',modal);
    error.textContent='';
    const inputs=$$('.outbound-input',modal);
    const invalidInputs=inputs.filter(input=>!checkOutboundInput(input));
    syncOutboundTotal(modal);
    if(invalidInputs.length){
      error.textContent='出库数量填写有误，请修正后再提交';
      invalidInputs[0].scrollIntoView({block:'center'});
      return;
    }
    const channel=$('#outboundChannel',modal).value.trim();
    const waybill=$('#outboundWaybill',modal).value.trim();
    if(Boolean(channel)!==Boolean(waybill)){error.textContent='物流渠道和物流单号需同时填写';return;}
    const values=inputs.map(input=>Number(input.value));
    const logistics=normalizeLogistics(channel,waybill);
    const items=buildItems(row);
    if(!row.items.length)row.items=items;
    items.forEach((item,index)=>{if(Number.isInteger(values[index]))item.outboundQty=values[index];});
    row.channel=logistics.channel;row.waybill=logistics.waybill;
    row.outboundQty=items.reduce((sum,item)=>sum+Number(item.outboundQty||0),0);
    row.status='在途';row.updatedAt=now();row.outboundAt=now();
    modal.hidden=true;renderTabs();renderTable();
    toast(`调拨单 ${row.no} 已确认出库`);
  }
  function inboundItemRows(row){
    const items=buildItems(row);
    return items.map((item,index)=>({...item,...itemProgress(items,row,index)}));
  }
  function checkInboundInput(input){
    const value=Number(input.value);
    const max=Number(input.max);
    const error=input.parentElement.querySelector('.outbound-row-error');
    let message='';
    if(input.value===''||!Number.isInteger(value)||value<0)message='请输入不小于 0 的整数';
    else if(value>max)message=`不能超过 ${max}`;
    if(error)error.textContent=message;
    input.classList.toggle('is-error',Boolean(message));
    return !message;
  }
  function syncInboundTotals(modal){
    let inbound=0;
    $$('.inbound-input',modal).forEach(input=>{
      inbound+=input.classList.contains('is-error')?0:(Number(input.value)||0);
    });
    const baseOutbound=Number(modal.querySelector('[data-inbound-base="outbound"]')?.textContent||0);
    const baseInbound=Number(modal.querySelector('[data-inbound-base="inbound"]')?.textContent||0);
    const nextStatus=baseOutbound>0&&baseInbound+inbound>=baseOutbound?'已完成':'部分入库';
    $$('[data-inbound-total="inbound"]',modal).forEach(node=>{node.textContent=inbound;});
    $$('[data-inbound-total="footer"]',modal).forEach(node=>{node.textContent=inbound;});
    const status=modal.querySelector('[data-inbound-status]');
    if(status){status.textContent=nextStatus;status.className=`status-tag status-${statusClass(nextStatus)}`;}
  }
  function renderInbound(row){
    const items=inboundItemRows(row);
    const totalQuantity=items.reduce((sum,item)=>sum+Number(item.quantity||0),0);
    const totalOutbound=items.reduce((sum,item)=>sum+item.outbound,0);
    const totalInbound=items.reduce((sum,item)=>sum+item.inbound,0);
    const totalTransit=items.reduce((sum,item)=>sum+item.inTransit,0);
    const channel=row.channel&&row.channel!=='—'?escapeHtml(row.channel):'未填写';
    const waybill=row.waybill&&row.waybill!=='—'?escapeHtml(row.waybill):'未填写';
    const rows=items.map((item,index)=>`<tr><td>${escapeHtml(item.sku)}</td><td class="outbound-product"><div class="outbound-product-content"><span class="product-thumb">▧</span><span title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span></div></td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.quantity}</td><td>${item.outbound}</td><td>${item.inbound}</td><td>${item.inTransit}</td><td><input class="outbound-input inbound-input" type="number" min="0" max="${item.inTransit}" step="1" value="${item.inTransit}" required data-index="${index}" aria-label="${escapeHtml(item.sku)} 本次入库数量"><div class="outbound-row-error"></div></td><td>${escapeHtml(item.remark||'—')}</td></tr>`).join('');
    return `<div class="outbound-dialog inbound-dialog"><header class="outbound-header"><div><h2>入库收货</h2><span>调拨单：${escapeHtml(row.no)} · ${escapeHtml(row.source)} → ${escapeHtml(row.target)}</span></div><button class="outbound-close" type="button" aria-label="关闭入库收货">×</button></header><div class="outbound-body"><div class="outbound-toolbar"><b>入库明细</b></div><div class="outbound-table-wrap"><table class="outbound-table inbound-table"><thead><tr><th>SKU</th><th>品名</th><th>调入团队</th><th>调拨数量</th><th>已出库</th><th>已入库</th><th>在途数量</th><th class="outbound-required-column">本次入库数量</th><th>备注</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="outbound-total-row"><td colspan="3">合计</td><td>${totalQuantity}</td><td data-inbound-base="outbound">${totalOutbound}</td><td data-inbound-base="inbound">${totalInbound}</td><td>${totalTransit}</td><td data-inbound-total="inbound">${totalTransit}</td><td></td></tr></tfoot></table></div><div class="outbound-logistics-block"><div class="outbound-logistics-title">物流信息</div><div class="inbound-logistics"><span>物流渠道：<b>${channel}</b></span><span>物流单号：<b>${waybill}</b></span></div></div><p class="outbound-error" id="inboundError" aria-live="polite"></p></div><footer class="outbound-footer"><div class="outbound-result">本次入库 <b data-inbound-total="footer">${totalTransit}</b> 件 · 入库后状态 <span class="status-tag status-partial" data-inbound-status>部分入库</span></div><div><button class="btn" data-inbound-action="cancel">取消</button><button class="btn primary" data-inbound-action="submit">确认收货</button></div></footer></div>`;
  }
  function openInbound(row){
    const modal=$('#inboundModal');
    modal.innerHTML=renderInbound(row);
    const inputs=$$('.inbound-input',modal);
    if(!inputs.some(input=>Number(input.max)>0)){toast('当前无在途数量可收货','error');return;}
    modal.hidden=false;
    modal.querySelector('.outbound-close').onclick=()=>{modal.hidden=true;};
    modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    modal.querySelector('[data-inbound-action="cancel"]').onclick=()=>{modal.hidden=true;};
    inputs.forEach(input=>input.oninput=()=>{checkInboundInput(input);syncInboundTotals(modal);$('#inboundError',modal).textContent='';});
    modal.querySelector('[data-inbound-action="submit"]').onclick=()=>submitInbound(row,modal);
    syncInboundTotals(modal);
  }
  function submitInbound(row,modal){
    const error=$('#inboundError',modal);
    error.textContent='';
    const inputs=$$('.inbound-input',modal);
    const invalidInputs=inputs.filter(input=>!checkInboundInput(input));
    syncInboundTotals(modal);
    if(invalidInputs.length){
      error.textContent='本次入库数量填写有误，请修正后再提交';
      invalidInputs[0].scrollIntoView({block:'center'});
      return;
    }
    const items=buildItems(row);
    if(!row.items.length)row.items=items;
    const progresses=items.map((item,index)=>itemProgress(items,row,index));
    items.forEach((item,index)=>{
      item.outboundQty=progresses[index].outbound;
      item.inboundQty=progresses[index].inbound+Number(inputs[index].value||0);
      item.voidedQty=progresses[index].voided;
    });
    row.outboundQty=items.reduce((sum,item)=>sum+Number(item.outboundQty||0),0);
    row.inboundQty=items.reduce((sum,item)=>sum+Number(item.inboundQty||0),0);
    row.voidedQty=items.reduce((sum,item)=>sum+Number(item.voidedQty||0),0);
    row.status=row.inboundQty>=row.outboundQty?'已完成':'部分入库';
    row.updatedAt=now();row.inboundAt=now();
    modal.hidden=true;renderTabs();renderTable();
    toast(`调拨单 ${row.no} ${row.status==='已完成'?'已完成入库':'已部分入库'}`);
  }
  function renderComplete(row){
    const transit=Math.max(Number(row.outboundQty||0)-Number(row.inboundQty||0)-Number(row.voidedQty||0),0);
    return `<div class="complete-dialog"><header class="complete-header"><div><h2>手动完结</h2><span>调拨单：${escapeHtml(row.no)}</span></div><button class="complete-close" type="button" aria-label="关闭手动完结">×</button></header><div class="complete-body"><p class="complete-alert">手动完结后，剩余在途数量 <b>${transit}</b> 件将作为差异核销，单据状态置为「已完成」，且不再支持入库收货。</p><div class="complete-form"><label for="completeReason">完结原因 <em>*</em></label><select id="completeReason" class="control complete-reason"><option value="">请选择完结原因</option><option>货物丢失</option><option>货物损坏</option><option>运输异常</option><option>其他</option></select><label for="completeRemark">备注（选填）</label><textarea id="completeRemark" class="complete-remark" maxlength="300" placeholder="请输入备注（选填）"></textarea><p class="complete-error" aria-live="polite"></p></div></div><footer class="complete-footer"><button class="btn" data-complete-action="cancel">取消</button><button class="btn primary" data-complete-action="confirm">确认完结</button></footer></div>`;
  }
  function openComplete(row){
    const modal=$('#completeModal');
    modal.innerHTML=renderComplete(row);
    modal.hidden=false;
    modal.querySelector('.complete-close').onclick=()=>{modal.hidden=true;};
    modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    modal.querySelector('[data-complete-action="cancel"]').onclick=()=>{modal.hidden=true;};
    modal.querySelector('[data-complete-action="confirm"]').onclick=()=>submitComplete(row,modal);
  }
  function submitComplete(row,modal){
    const reason=$('#completeReason',modal).value;
    const remark=$('#completeRemark',modal).value.trim();
    const error=modal.querySelector('.complete-error');
    if(!reason){error.textContent='请选择完结原因';return;}
    error.textContent='';
    const items=buildItems(row);
    if(!row.items.length)row.items=items;
    const progresses=items.map((item,index)=>itemProgress(items,row,index));
    items.forEach((item,index)=>{
      item.outboundQty=progresses[index].outbound;
      item.inboundQty=progresses[index].inbound;
      item.voidedQty=progresses[index].voided+progresses[index].inTransit;
    });
    row.outboundQty=items.reduce((sum,item)=>sum+Number(item.outboundQty||0),0);
    row.inboundQty=items.reduce((sum,item)=>sum+Number(item.inboundQty||0),0);
    row.voidedQty=items.reduce((sum,item)=>sum+Number(item.voidedQty||0),0);
    row.status='已完成';row.completeReason=reason;row.completeRemark=remark;row.updatedAt=now();
    modal.hidden=true;renderTabs();renderTable();
    toast(`调拨单 ${row.no} 已手动完结`);
  }
  function exceptionRow(item){return `<tr data-sku="${escapeHtml(item.sku)}"><td class="left"><b>${escapeHtml(item.sku)}</b></td><td class="left">${escapeHtml(item.name)}</td><td>${escapeHtml(item.team||'—')}</td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.available}</td><td><input class="quantity-input required-input exception-qty" type="number" min="1" max="${item.available}" value="${item.quantity}" data-sku="${escapeHtml(item.sku)}"></td><td><button class="sku-remove" type="button" data-remove-sku="${escapeHtml(item.sku)}">删除</button></td></tr>`;}
  function renderExceptionItems(modal,row){
    const body=$('#exceptionItems',modal);
    const items=shortageItems(row);
    body.innerHTML=items.length?items.map(exceptionRow).join(''):'<tr><td colspan="7" class="detail-empty">暂无库存不足的 SKU</td></tr>';
    body.querySelectorAll('[data-remove-sku]').forEach(btn=>btn.onclick=()=>{
      row.items=row.items.filter(item=>item.sku!==btn.dataset.removeSku);
      (row.exceptionDeleted=row.exceptionDeleted||[]).push(btn.dataset.removeSku);
      renderExceptionItems(modal,row);
    });
  }
  function renderExceptionEdit(row){
    return `<div class="dialog"><header class="dialog-header"><div><h2>编辑调拨数量</h2><p>${escapeHtml(row.no)} · 库存不足，请调低数量后重新流转</p></div><button class="dialog-close" data-close="exception">×</button></header><div class="dialog-body"><section class="section"><div class="section-title">库存不足的 SKU</div><div class="section-body detail-table-wrap"><table class="detail-table editor-detail"><thead><tr><th>SKU</th><th>产品名称</th><th>调出团队</th><th>调入团队</th><th>可用库存</th><th class="required-column">调拨数量</th><th>操作</th></tr></thead><tbody id="exceptionItems"></tbody></table></div></section></div><footer class="dialog-footer"><button class="btn" data-close="exception">取消</button><button class="btn primary" data-exception-action="save">保存</button></footer></div>`;
  }
  function openExceptionEdit(row){
    const modal=$('#editorModal');
    modal.innerHTML=renderExceptionEdit(row);
    modal.hidden=false;
    modal.querySelectorAll('[data-close="exception"]').forEach(btn=>btn.onclick=()=>{modal.hidden=true;});
    modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    modal.querySelector('[data-exception-action="save"]').onclick=()=>submitExceptionEdit(row,modal);
    renderExceptionItems(modal,row);
  }
  function submitExceptionEdit(row,modal){
    if(!row.items.length){toast('请至少保留一个 SKU','error');return;}
    const inputs=$$('.exception-qty',modal);
    for(const input of inputs){
      const value=Number(input.value),max=Number(input.max);
      if(input.value===''||!Number.isInteger(value)||value<1||value>max){toast('调拨数量须为 1 - 可用库存 的整数','error');input.focus();return;}
    }
    const changes=[];
    inputs.forEach(input=>{
      const item=row.items.find(it=>it.sku===input.dataset.sku);
      if(item){
        const oldQty=Number(item.quantity),newQty=Number(input.value);
        if(oldQty!==newQty)changes.push(`SKU ${item.sku} ${oldQty} → ${newQty}`);
        item.quantity=newQty;
      }
    });
    const deleted=row.exceptionDeleted||[];
    row.reflowLog=([...deleted.map(sku=>`删除 SKU ${sku}`),...changes].filter(Boolean).join('；')||'编辑调拨数量')+'，重新流转待出库';
    delete row.exceptionDeleted;
    row.requestQty=row.items.reduce((sum,item)=>sum+Number(item.quantity||0),0);
    row.skuCount=row.items.length;
    row.status='待出库';
    row.updatedAt=now();
    modal.hidden=true;renderTabs();renderTable();
    toast(`调拨单 ${row.no} 已重新流转待出库`);
  }
  function openAudit(){
    const rows=auditRows();
    if(!rows)return;
    const modal=$('#auditModal');
    modal.innerHTML=renderAudit(rows);
    modal.hidden=false;
    modal.querySelectorAll('[data-close="audit"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});
    modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    const reason=$('#auditReason',modal),counter=$('#auditReasonCount',modal),error=$('#auditError',modal);
    reason.oninput=()=>{counter.textContent=`${reason.value.length} / 500`;error.textContent='';reason.classList.remove('is-error');};
    modal.querySelector('[data-audit-action="approve"]').onclick=()=>submitAudit(rows,'approve',modal);
    modal.querySelector('[data-audit-action="reject"]').onclick=()=>submitAudit(rows,'reject',modal);
  }
  function shortageItems(row){return (row.items||[]).filter(item=>Number(item.quantity)>Number(item.available));}
  function submitAudit(rows,decision,modal){
    const reason=$('#auditReason',modal).value.trim(),error=$('#auditError',modal);
    if(decision==='reject'&&!reason){error.textContent='驳回时必须填写原因';$('#auditReason',modal).classList.add('is-error');$('#auditReason',modal).focus();return;}
    if(decision==='approve'){
      let abnormal=0,ownershipCompleted=0;
      rows.forEach(row=>{
        if(!row.items.length)row.items=buildItems(row);
        const shortage=shortageItems(row);
        row.auditDecision=decision;row.auditReason=reason;row.updatedAt=now();state.selected.delete(row.id);
        if(shortage.length){
          row.status='异常';
          row.abnormalReason=shortage.map(item=>`SKU ${item.sku} 需 ${item.quantity}，可用 ${item.available}，缺 ${Number(item.quantity)-Number(item.available)}`).join('；');
          abnormal++;
        }else if(isOwnershipTransfer(row)){
          row.items.forEach(item=>{item.ownershipOutQty=Number(item.quantity||0);item.ownershipInQty=Number(item.quantity||0);item.costAllocations=itemCostAllocations(item);});
          row.status='已完成';
          row.ownershipCompleted=true;
          row.ownershipCompletedAt=now();
          row.outboundQty=0;row.inboundQty=0;row.voidedQty=0;
          delete row.abnormalReason;
          ownershipCompleted++;
        }else{
          row.status='待出库';
          delete row.abnormalReason;
        }
      });
      modal.hidden=true;renderTabs();renderTable();
      const physicalReady=rows.length-abnormal-ownershipCompleted;
      toast(abnormal>0?`已通过审核：${physicalReady} 张待出库，${ownershipCompleted} 张货权调拨已完成，${abnormal} 张因库存不足进入异常`:(ownershipCompleted?`已通过审核：${ownershipCompleted} 张货权调拨已完成${physicalReady?`，${physicalReady} 张待出库`:''}`:`已通过 ${rows.length} 张调拨单`));
    }else{
      rows.forEach(row=>{row.status='已驳回';row.auditDecision=decision;row.auditReason=reason;row.updatedAt=now();state.selected.delete(row.id);});
      modal.hidden=true;renderTabs();renderTable();toast(`已驳回 ${rows.length} 张调拨单`);
    }
  }
  function voidRows(){
    const selected=orders.filter(row=>state.selected.has(row.id));
    if(!selected.length){toast('请先选择调拨单','error');return;}
    if(selected.some(row=>!['待审核','待出库'].includes(row.status))){toast('仅支持作废待审核或待出库状态的调拨单','error');return;}
    if(!confirm(`确认作废选中的 ${selected.length} 张调拨单吗？`))return;
    selected.forEach(row=>{row.status='已作废';row.updatedAt=now();state.selected.delete(row.id);});
    renderTabs();renderTable();toast(`已作废 ${selected.length} 张调拨单`);
  }
  function editorForm(row){
    const isEdit=Boolean(row),transferType=state.editorType||row?.transferType||'仓间调拨',ownership=transferType==='货权调拨',source=state.editorDraft?.source??row?.source??'',target=ownership?source:(state.editorDraft?.target??row?.target??''),inheritAge=row?String(row.inheritAge?'是':'否'):'是',items=buildItems(row||{items:[],skuCount:0,requestQty:0});
    const submitText=row?.status==='异常'?'保存并重新流转':'提交审核';
    const disabled=ownership?'disabled aria-disabled="true"':'';
    const inheritOptions=ownership?'<option selected>—</option><option value="是">是</option><option value="否">否</option>':`<option value="">请选择</option><option value="是" ${inheritAge==='是'?'selected':''}>是</option><option value="否" ${inheritAge==='否'?'selected':''}>否</option>`;
    const channelOptions=ownership?'<option selected>—</option>':`<option value="">请选择物流渠道</option>${logisticsChannelList().map(item=>`<option ${item===row?.channel?'selected':''}>${item}</option>`).join('')}<option value="__add_channel__">＋ 新增渠道</option>`;
    const warehouseHelpIcon=`<span class="form-help-icon" tabindex="0" role="img" aria-label="${warehouseTransferHelp}" data-tooltip="${warehouseTransferHelp}">?</span>`;
    return `<div class="dialog editor-dialog"><header class="dialog-header"><div><h2>${isEdit?'编辑调拨单':'新建调拨单'}</h2></div><button class="dialog-close" data-close="editor">×</button></header><div class="dialog-body"><section class="section"><div class="section-title">基础信息</div><div class="section-body"><div class="form-grid"><div class="field"><label>调拨类型</label><select id="editType" ${isEdit?'disabled':''}><option ${transferType==='仓间调拨'?'selected':''}>仓间调拨</option><option ${transferType==='货权调拨'?'selected':''}>货权调拨</option></select></div><div class="field"><label class="required">调出仓库${warehouseHelpIcon}</label><select id="editSource"><option value="">请选择调出仓库</option>${warehouses.map(item=>`<option ${item===source?'selected':''}>${item}</option>`).join('')}</select></div><div class="field"><label class="required">调入仓库${warehouseHelpIcon}</label><select id="editTarget" ${disabled}><option value="">请选择调入仓库</option>${warehouses.map(item=>`<option ${item===target?'selected':''}>${item}</option>`).join('')}</select></div><div class="field"><label>预计到仓日期</label><input id="editEta" type="date" value="${ownership?'':row?.eta||'2026-09-25'}" ${disabled}></div><div class="field"><label class="required">是否继承库龄</label><select id="inheritAge" ${disabled}>${inheritOptions}</select></div><div class="field"><label>物流渠道</label><select id="editChannel" ${disabled}>${channelOptions}</select></div><div class="field"><label>物流单号</label><input id="editWaybill" value="${ownership?'':row?.waybill==='—'?'':row?.waybill||''}" placeholder="${ownership?'不适用':'可后续补录'}" ${disabled}></div><div class="field"><label>运费</label><div class="money-field"><input id="editFee" type="number" min="0" step="0.01" value="${ownership?'':row?.fee||''}" placeholder="${ownership?'不适用':'请输入'}" ${disabled}><span>CNY</span></div></div><div class="field"><label>其他费用</label><div class="money-field"><input id="editOtherFee" type="number" min="0" step="0.01" value="${ownership?'':row?.otherFee||''}" placeholder="${ownership?'不适用':'请输入'}" ${disabled}><span>CNY</span></div></div><div class="field span-2"><label>调拨备注</label><textarea id="editRemark" maxlength="500" placeholder="请输入备注（选填）">${escapeHtml(row?.remark||'')}</textarea></div></div></div></section><section class="section"><div class="section-title"><div class="editor-item-toolbar"><button class="btn primary small" id="addSkuBtn">＋ 添加SKU</button><div class="bulk-target-team"><select id="bulkTargetTeam"><option value="">批量选择调入团队</option>${teams.map(item=>`<option>${item}</option>`).join('')}</select><button class="btn small" id="applyTargetTeam">应用到全部</button></div></div></div><div class="section-body detail-table-wrap"><table class="detail-table editor-detail"><thead><tr><th>SKU</th><th>产品名称</th><th>调出团队</th><th>在库量</th><th class="required-column">调拨数量</th><th>调拨金额</th><th class="required-column">调入团队</th><th>备注</th><th>操作</th></tr></thead><tbody id="editorItems">${items.map((item,index)=>editorItem(item,index)).join('')}</tbody></table><div class="empty editor-empty" ${items.length?'hidden':''}>请先选择调出仓库，再点击“添加SKU”</div></div></section></div><footer class="dialog-footer"><button class="btn" data-close="editor">取消</button><button class="btn primary" data-editor-action="submit">${submitText}</button></footer></div>`;
  }
  function editorItem(item,index){return `<tr data-item-index="${index}"><td class="left"><b>${item.sku}</b></td><td class="left"><div class="product-cell"><span class="product-thumb">▧</span><span>${escapeHtml(item.name)}</span></div></td><td>${escapeHtml(item.team||'—')}</td><td>${item.available}</td><td><input class="quantity-input required-input" type="number" min="1" max="${item.available}" value="${item.quantity??''}" placeholder="请输入" required data-field="quantity"></td><td class="item-transfer-amount" data-item-amount>${formatMoney(itemTransferAmount(item))}</td><td><select class="target-team-select required-input" required data-field="targetTeam"><option value="">请选择调入团队</option>${teams.map(team=>`<option ${team===item.targetTeam?'selected':''}>${team}</option>`).join('')}</select></td><td><textarea class="remark-input" maxlength="120" placeholder="请输入" data-field="remark">${escapeHtml(item.remark||'')}</textarea></td><td><button class="sku-remove" type="button" data-remove-item="${index}">移除</button></td></tr>`;}
  function cloneEditorItems(row){return buildItems(row||{items:[],skuCount:0,requestQty:0}).map(item=>({...item,costBatches:Array.isArray(item.costBatches)?item.costBatches.map(batch=>({...batch})):item.costBatches,costAllocations:Array.isArray(item.costAllocations)?item.costAllocations.map(batch=>({...batch})):item.costAllocations}));}
  function openEditor(row){const modal=$('#editorModal');state.editing=row?.id||null;state.editorType=row?.transferType||'仓间调拨';state.editorDraft={source:row?.source||'',target:row?.target||''};state.editorItems=cloneEditorItems(row);modal.innerHTML=editorForm(row);modal.hidden=false;bindEditor(modal,row);}
  function setEditorFieldError(input,message){
    const field=input?.closest('.field');
    if(!field)return;
    field.classList.add('has-error');
    let hint=field.querySelector('.field-validation');
    if(!hint){hint=document.createElement('p');hint.className='field-validation';field.append(hint);}
    hint.textContent=message;
  }
  function clearEditorFieldError(input){
    const field=input?.closest('.field');
    if(!field)return;
    field.classList.remove('has-error');
    field.querySelector('.field-validation')?.remove();
  }
  function validateEditorForSku(modal){
    const ownership=$('#editType',modal)?.value==='货权调拨';
    const requiredFields=[[$('#editSource',modal),'请选择调出仓库']];
    if(!ownership)requiredFields.push([$('#editTarget',modal),'请选择调入仓库'],[$('#inheritAge',modal),'请选择是否继承库龄']);
    let firstInvalid=null;
    requiredFields.forEach(([input,message])=>{
      if(!input?.value){setEditorFieldError(input,message);firstInvalid||=input;}
      else clearEditorFieldError(input);
    });
    if(firstInvalid){firstInvalid.focus();return false;}
    return true;
  }
  function setupEditorChannelMenu(modal){
    window.enhanceCustomSelects?.();
    const select=$('#editChannel',modal);
    const wrapper=select?.closest('.custom-select');
    const menu=wrapper?.querySelector('.custom-select-menu');
    if(!select||select.disabled||!wrapper||!menu)return;
    const addIndex=[...select.options].findIndex(option=>option.value==='__add_channel__');
    const addOption=menu.querySelector(`.custom-select-option[data-index="${addIndex}"]`);
    if(addOption){
      addOption.classList.add('is-add-channel');
      addOption.onclick=event=>{event.preventDefault();event.stopPropagation();toggleEditorNewChannel(modal,true);};
    }
    let editor=menu.querySelector('.editor-channel-editor');
    if(!editor){
      editor=document.createElement('div');
      editor.className='editor-channel-editor';
      editor.hidden=true;
      editor.innerHTML=`<input class="control" id="editorNewChannel" maxlength="30" placeholder="请输入内容"><button class="outbound-icon-btn is-confirm" type="button" data-editor-channel-action="save" aria-label="确认新增渠道">✓</button><button class="outbound-icon-btn is-cancel" type="button" data-editor-channel-action="cancel" aria-label="取消新增渠道">×</button><p class="editor-channel-editor-error" aria-live="polite"></p>`;
      menu.append(editor);
    }
    editor.onclick=event=>event.stopPropagation();
    editor.querySelector('[data-editor-channel-action="save"]').onclick=event=>{event.stopPropagation();saveEditorNewChannel(modal);};
    editor.querySelector('[data-editor-channel-action="cancel"]').onclick=event=>{event.stopPropagation();toggleEditorNewChannel(modal,false);};
    editor.querySelector('#editorNewChannel').onkeydown=event=>{
      if(event.key==='Enter'){event.preventDefault();saveEditorNewChannel(modal);}
      if(event.key==='Escape'){event.preventDefault();toggleEditorNewChannel(modal,false);}
    };
  }
  function toggleEditorNewChannel(modal,show){
    const editor=modal.querySelector('.editor-channel-editor');
    const wrapper=$('#editChannel',modal)?.closest('.custom-select');
    if(!editor||!wrapper)return;
    editor.hidden=!show;
    wrapper.classList.add('is-open');
    wrapper.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded','true');
    const input=editor.querySelector('#editorNewChannel');
    const error=editor.querySelector('.editor-channel-editor-error');
    error.textContent='';
    if(show)requestAnimationFrame(()=>input.focus());
    else{input.value='';wrapper.querySelector('.custom-select-trigger')?.focus();}
  }
  function saveEditorNewChannel(modal){
    const input=$('#editorNewChannel',modal),error=modal.querySelector('.editor-channel-editor-error');
    const value=input.value.trim();
    if(!value){error.textContent='请输入物流渠道名称';input.focus();return;}
    const isNew=!logisticsChannelList().includes(value);
    persistLogisticsChannel(value);
    const select=$('#editChannel',modal);
    select.innerHTML=`<option value="">请选择物流渠道</option>${logisticsChannelList().map(item=>`<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}<option value="__add_channel__">＋ 新增渠道</option>`;
    select.value=value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    requestAnimationFrame(()=>{
      setupEditorChannelMenu(modal);
      const wrapper=$('#editChannel',modal)?.closest('.custom-select');
      wrapper?.classList.remove('is-open');
      wrapper?.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded','false');
    });
    toast(isNew?`已新增物流渠道「${value}」`:`已选择物流渠道「${value}」`);
  }
  function bindEditor(modal,row){
    modal.querySelectorAll('[data-close="editor"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    const source=$('#editSource',modal),target=$('#editTarget',modal),type=$('#editType',modal),add=$('#addSkuBtn',modal),bulkTargetTeam=$('#bulkTargetTeam',modal);
    type.onchange=()=>{state.editorType=type.value;state.editorItems=[];state.editorDraft={source:source.value,target:type.value==='货权调拨'?source.value:''};modal.innerHTML=editorForm(row);bindEditor(modal,row);};
    source.onchange=()=>{if(state.editorItems.length){if(!confirm('修改调出仓库将清空当前调拨明细，确认继续吗？')){source.value=state.editorDraft?.source||row?.source||'';return;}state.editorItems=[];renderEditorItems(modal);}const targetValue=state.editorType==='货权调拨'?source.value:(target?.value||'');state.editorDraft={...(state.editorDraft||{}),source:source.value,target:targetValue};if(state.editorType==='货权调拨'&&target)target.value=source.value;clearEditorFieldError(source);if(state.editorType==='货权调拨')clearEditorFieldError(target);};add.onclick=()=>{if(validateEditorForSku(modal))openPicker();};
    if(target)target.onchange=()=>{if(source.value&&source.value===target.value){toast('调入仓库不能与调出仓库相同');target.value='';}state.editorDraft={...(state.editorDraft||{}),target:target.value};if(target.value)clearEditorFieldError(target);};
    const inheritAge=$('#inheritAge',modal);if(inheritAge)inheritAge.onchange=()=>{if(inheritAge.value)clearEditorFieldError(inheritAge);};
    $('#applyTargetTeam',modal).onclick=()=>{if(!bulkTargetTeam.value){toast('请选择要批量设置的调入团队');return;}if(!state.editorItems.length){toast('请先添加调拨SKU');return;}state.editorItems.forEach(item=>{item.targetTeam=bulkTargetTeam.value;});renderEditorItems(modal);toast('已应用到全部调拨SKU');};
    modal.querySelectorAll('[data-editor-action]').forEach(button=>button.onclick=()=>saveEditor(modal,row));
    setupEditorChannelMenu(modal);
    renderEditorItems(modal);
  }
  function renderEditorItems(modal){const body=$('#editorItems',modal);body.innerHTML=(state.editorItems||[]).map((item,index)=>editorItem(item,index)).join('');$('.editor-empty',modal).hidden=Boolean(state.editorItems.length);body.querySelectorAll('[data-remove-item]').forEach(button=>button.onclick=()=>{state.editorItems.splice(Number(button.dataset.removeItem),1);renderEditorItems(modal);});body.querySelectorAll('[data-field]').forEach(input=>{const syncField=()=>{const row=state.editorItems[Number(input.closest('tr').dataset.itemIndex)];row[input.dataset.field]=input.value;if(input.dataset.field==='quantity')input.closest('tr').querySelector('[data-item-amount]').textContent=formatMoney(itemTransferAmount(row));};input.oninput=syncField;input.onchange=syncField;});}
  function saveEditor(modal,row){
    const transferType=$('#editType',modal).value,ownership=transferType==='货权调拨',source=$('#editSource',modal).value,target=ownership?source:$('#editTarget',modal).value,inheritAge=ownership?'是':$('#inheritAge',modal).value,isException=row?.status==='异常';
    if(!source||(!ownership&&(!target||!inheritAge))){toast(ownership?'请填写调出仓库':'请填写调出仓库、调入仓库和是否继承库龄','error');return;}
    if(!ownership&&source===target){toast('调入仓库不能与调出仓库相同','error');return;}
    if(!state.editorItems.length){toast('请至少添加一个SKU','error');return;}
    for(const item of state.editorItems){if(item.quantity===''||item.quantity===null||item.quantity===undefined){toast(`请填写 SKU ${item.sku} 的调拨数量`,'error');return;}const quantity=Number(item.quantity);if(!Number.isInteger(quantity)||quantity<=0||quantity>item.available){toast(`SKU ${item.sku} 的调拨数量须为1-${item.available}的整数`,'error');return;}if(!item.targetTeam){toast(`请选择 SKU ${item.sku} 的调入团队`,'error');return;}if(ownership&&item.team===item.targetTeam){toast(`货权调拨中 SKU ${item.sku} 的调入团队不能与调出团队相同`,'error');return;}}
    const logistics=ownership?{channel:'—',waybill:'—'}:normalizeLogistics($('#editChannel',modal).value.trim(),$('#editWaybill',modal).value.trim());
    const payload={transferType,ownershipWarehouse:ownership?source:'',source,target,eta:ownership?'—':$('#editEta',modal).value||'—',...logistics,fee:ownership?0:Number($('#editFee',modal).value||0),otherFee:ownership?0:Number($('#editOtherFee',modal).value||0),remark:$('#editRemark',modal).value.trim(),inheritAge:ownership?true:inheritAge==='是',items:state.editorItems.map(item=>({...item,quantity:Number(item.quantity)})),skuCount:state.editorItems.length,requestQty:state.editorItems.reduce((sum,item)=>sum+Number(item.quantity),0)};
    if(row){Object.assign(row,payload);row.status=isException&&!ownership?'待出库':'待审核';if(isException&&!ownership){row.reflowLog='编辑调拨单后库存校验通过，重新流转待出库';delete row.abnormalReason;}else{delete row.auditDecision;delete row.auditReason;}row.updatedAt=now();toast(isException&&!ownership?'调拨单已重新流转待出库':'调拨单已提交审核');}else{const no=nextTransferNo();orders.unshift({...order(no,'待审核',source,target,payload.skuCount,payload.requestQty,0,payload.channel,payload.waybill,payload.eta,'库存管理','Admin'),...payload});toast('调拨单已提交审核');}
    modal.hidden=true;state.page=1;renderTabs();renderTable();
  }
  function pickerKey(item){return `${item.sku}__${item.team}`;}
  function openPicker(){
    const modal=$('#skuPickerModal');
    const editorModal=$('#editorModal'),source=$('#editSource',editorModal)?.value;
    if(!source){toast('请先选择调出仓库','error');return;}
    state.pickerSelected=new Set();
    state.pickerRows=skuPool.filter(item=>item.stockWarehouses?.includes(source)&&!state.editorItems.some(selected=>pickerKey(selected)===pickerKey(item)));
    modal.innerHTML=`<div class="dialog picker-dialog"><header class="dialog-header"><div><h2>添加调拨SKU</h2></div><button class="dialog-close" data-close="picker">×</button></header><div class="dialog-body"><div class="picker-search"><input id="pickerSku" placeholder="SKU（支持多个，逗号或空格分隔）"><input id="pickerProductName" placeholder="产品名称"><select id="pickerTeam" class="picker-team"><option value="">团队</option>${teams.map(team=>`<option>${team}</option>`).join('')}</select><button class="btn primary" id="pickerSearch">查询</button></div><div class="detail-table-wrap"><table class="picker-table"><thead><tr><th width="46"><input type="checkbox" id="pickerAll"></th><th>SKU</th><th>产品名称</th><th>团队</th><th>在库量</th></tr></thead><tbody id="pickerBody"></tbody></table></div></div><footer class="picker-footer"><button class="btn" data-close="picker">取消</button><button class="btn primary" id="pickerConfirm">添加选中SKU</button></footer></div>`;
    modal.hidden=false;
    window.enhanceCustomSelects?.();
    renderPickerRows();
    bindPicker(modal);
  }
  function pickerFilteredRows(){
    const skuTerms=($('#pickerSku')?.value||'').toLowerCase().split(/[\s,，;；]+/).filter(Boolean),productName=($('#pickerProductName')?.value||'').trim().toLowerCase(),team=$('#pickerTeam')?.value||'';
    return state.pickerRows.filter(item=>{
      const matchesSku=!skuTerms.length||skuTerms.some(sku=>item.sku.toLowerCase().includes(sku));
      const matchesProduct=!productName||item.name.toLowerCase().includes(productName);
      return matchesSku&&matchesProduct&&(!team||item.team===team);
    });
  }
  function renderPickerRows(){
    const rows=pickerFilteredRows(),body=$('#pickerBody');
    body.innerHTML=rows.map(item=>{const key=pickerKey(item);return `<tr><td><input type="checkbox" class="picker-check" data-key="${key}" ${state.pickerSelected.has(key)?'checked':''}></td><td>${item.sku}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.team)}</td><td class="num">${item.available}</td></tr>`;}).join('')||'<tr><td colspan="5" style="text-align:center;color:#909399;padding:32px">暂无可添加的SKU</td></tr>';
    const all=$('#pickerAll');
    all.checked=rows.length>0&&rows.every(item=>state.pickerSelected.has(pickerKey(item)));
  }
  function bindPicker(modal){
    modal.querySelectorAll('[data-close="picker"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});
    modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    $('#pickerSearch',modal).onclick=renderPickerRows;
    ['#pickerSku','#pickerProductName'].forEach(selector=>{$(selector,modal).onkeydown=event=>{if(event.key==='Enter')renderPickerRows();};});
    $('#pickerTeam',modal).onchange=renderPickerRows;
    $('.picker-table',modal).onchange=event=>{if(event.target.id==='pickerAll'){pickerFilteredRows().forEach(item=>event.target.checked?state.pickerSelected.add(pickerKey(item)):state.pickerSelected.delete(pickerKey(item)));renderPickerRows();return;}const check=event.target.closest('.picker-check');if(!check)return;check.checked?state.pickerSelected.add(check.dataset.key):state.pickerSelected.delete(check.dataset.key);const all=$('#pickerAll',modal),rows=pickerFilteredRows();all.checked=rows.length>0&&rows.every(item=>state.pickerSelected.has(pickerKey(item)));};
    $('#pickerConfirm',modal).onclick=()=>{const editorModal=$('#editorModal'),selected=state.pickerRows.filter(item=>state.pickerSelected.has(pickerKey(item))),bulkTargetTeam=$('#bulkTargetTeam',editorModal)?.value||'',transferType=$('#editType',editorModal)?.value||state.editorType,source=$('#editSource',editorModal)?.value||'';if(!selected.length){toast('请至少选择一个SKU');return;}state.editorItems.push(...selected.map(item=>({...item,sourceWarehouse:source,quantity:'',targetTeam:bulkTargetTeam||(transferType==='仓间调拨'?item.team:''),remark:''})));modal.hidden=true;renderEditorItems(editorModal);};
  }
  function importParseCsvLine(line){const out=[];let current='',quoted=false;for(let index=0;index<line.length;index++){const char=line[index];if(quoted){if(char==='"'){if(line[index+1]==='"'){current+='"';index++;}else quoted=false;}else current+=char;}else if(char==='"')quoted=true;else if(char===','){out.push(current.trim());current='';}else current+=char;}out.push(current.trim());return out;}
  function importReadRows(text){
    const source=String(text||'').replace(/^\ufeff/,'');
    if(/<table[\s>]/i.test(source)){const doc=new DOMParser().parseFromString(source,'text/html');const rows=[...doc.querySelectorAll('tr')].map(row=>[...row.querySelectorAll('th,td')].map(cell=>cell.textContent.trim())).filter(row=>row.length);return {header:rows[0]||[],data:rows.slice(2)};}
    const rows=source.split(/\r?\n/).filter(line=>line.trim()).map(importParseCsvLine);return {header:rows[0]||[],data:rows.slice(2)};
  }
  function importCell(row,key,header){const index=header.indexOf(key);return index<0?'':String(row[index]??'').trim();}
  function validateImportRows(parsed){
    const header=parsed.header.map(value=>String(value).trim().replace(/^\*/,''));
    const missing=importColumns.filter(column=>!header.includes(column.label));
    if(missing.length)return {rows:[],errors:[`模板缺少字段：${missing.map(column=>column.label).join('、')}`]};
    if(!parsed.data.length)return {rows:[],errors:['模板中没有可导入的 SKU 明细']};
    const first=parsed.data[0], sharedKeys=['sourceWarehouse','targetWarehouse','eta','inheritAge','channel','waybill','fee','otherFee'];
    const normalized=[];const errors=[];
    parsed.data.forEach((row,index)=>{
      if(!row.some(value=>String(value||'').trim()))return;
      const read=key=>{const value=importCell(row,importColumns.find(column=>column.key===key)?.label||'',header);if(value)return value;return sharedKeys.includes(key)?importCell(first,importColumns.find(column=>column.key===key)?.label||'',header):'';};
      const item={sku:read('sku'),sourceWarehouse:read('sourceWarehouse'),targetWarehouse:read('targetWarehouse'),sourceTeam:read('sourceTeam'),targetTeam:read('targetTeam'),quantity:read('quantity'),eta:read('eta'),inheritAge:read('inheritAge'),channel:read('channel'),waybill:read('waybill'),fee:read('fee'),otherFee:read('otherFee'),remark:read('remark')};
      const missingRequired=importColumns.filter(column=>column.required&&!item[column.key]).map(column=>column.label);
      if(missingRequired.length){errors.push(`第 ${index+3} 行缺少必填字段：${missingRequired.join('、')}`);return;}
      if(item.sourceWarehouse===item.targetWarehouse){errors.push(`第 ${index+3} 行调出仓库和调入仓库不能相同`);return;}
      if(!['是','否'].includes(item.inheritAge)){errors.push(`第 ${index+3} 行“是否继承库龄”只能填写是或否`);return;}
      if(Boolean(item.channel)!==Boolean(item.waybill)){errors.push(`第 ${index+3} 行物流渠道和物流单号需同时填写`);return;}
      const product=skuPool.find(candidate=>candidate.sku===item.sku&&candidate.team===item.sourceTeam);
      if(!product){errors.push(`第 ${index+3} 行 SKU 或调出团队不存在，或不属于对应库存`);return;}
      const quantity=Number(item.quantity);if(!Number.isInteger(quantity)||quantity<=0||quantity>product.available){errors.push(`第 ${index+3} 行调拨数量须为 1-${product.available} 的整数`);return;}
      const fee=Number(item.fee||0),otherFee=Number(item.otherFee||0);if(!Number.isFinite(fee)||fee<0||!Number.isFinite(otherFee)||otherFee<0){errors.push(`第 ${index+3} 行费用必须为大于等于 0 的数字`);return;}
      normalized.push({...item,product,quantity,fee,otherFee});
    });
    return {rows:normalized,errors};
  }
  function importStepMarkup(active){return `<div class="import-steps"><div class="import-step ${active>=1?'active':''} ${active>1?'done':''}"><span class="import-step-num">1</span><span class="import-step-text">下载模板</span></div><div class="import-step-line"></div><div class="import-step ${active>=2?'active':''} ${active>2?'done':''}"><span class="import-step-num">2</span><span class="import-step-text">选择文件</span></div><div class="import-step-line"></div><div class="import-step ${active>=3?'active':''}"><span class="import-step-num">3</span><span class="import-step-text">确认导入</span></div></div>`;}
  function renderImport(){
    const hasFile=Boolean(state.importFile),errorText=state.importErrors.join('；');
    return `<div class="dialog import-dialog"><header class="dialog-header"><div><h2>导入新建调拨单</h2></div><button class="dialog-close" data-close="import" aria-label="关闭导入新建弹窗">×</button></header><div class="dialog-body import-body">${importStepMarkup(hasFile?2:1)}<div class="import-guide"><div class="import-guide-title">第一步：使用标准模板整理数据</div><div class="import-guide-tip">请勿修改模板表头。支持 .xlsx、.xls、.csv 文件，单次仅导入一个文件。</div><button class="btn primary plain" id="downloadImportTemplate" type="button">下载模板</button></div><div class="import-upload" id="importDropArea"><input type="file" id="importFileInput" accept=".xls,.xlsx,.csv" hidden><div class="import-upload-icon">↥</div><div class="import-upload-text">将 Excel 文件拖到此处，或<span class="import-upload-link" id="chooseImportFile">点击选择文件</span></div></div><div class="import-upload-tip">选择文件后点击「确认导入」，系统将自动校验文件，校验不通过会提示具体原因。</div>${hasFile?`<div class="import-preview"><div class="import-preview-title">已选择文件：${escapeHtml(state.importFile.name)}</div><div class="import-preview-meta">识别到 ${state.importRows.length} 条有效明细${errorText?`，${state.importErrors.length} 条校验提示`:''}</div>${errorText?`<div class="import-preview-error">${escapeHtml(errorText)}</div>`:''}</div>`:''}</div><footer class="import-footer"><span class="import-file-info">${hasFile?`当前文件：${escapeHtml(state.importFile.name)}`:'尚未选择文件'}</span><div><button class="btn" data-close="import">取消</button><button class="btn primary" id="confirmImport" type="button" ${hasFile?'':'disabled'}>确认导入</button></div></footer></div>`;
  }
  function downloadImportTemplate(){
    const headers=importColumns.map(column=>`${column.label}${column.required?'*':''}`),descriptions=importColumns.map(column=>column.description);
    const html=`<!doctype html><html><head><meta charset="UTF-8"><style>table{border-collapse:collapse;font-family:Arial,"Microsoft YaHei",sans-serif;font-size:14px}th,td{border:1px solid #c9d6e3;padding:8px 12px;vertical-align:top;white-space:normal}th{background:#075985;color:#fff;font-weight:600;min-width:120px;height:38px}td{background:#fff6df;color:#606266;line-height:20px;width:180px;height:72px}</style></head><body><table><tr>${headers.map(header=>`<th>${header}</th>`).join('')}</tr><tr>${descriptions.map(description=>`<td>${description}</td>`).join('')}</tr></table></body></html>`;
    const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='调拨单导入模板.xls';document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);toast('模板已下载，请按模板填写后导入');
  }
  function loadImportFile(file){
    if(!file)return;const name=(file.name||'').toLowerCase();if(!['.xls','.xlsx','.csv'].some(extension=>name.endsWith(extension))){toast('文件格式不正确，请上传 .xls、.xlsx 或 .csv 文件','error');return;}if(name.endsWith('.xlsx')){toast('当前原型暂支持 .xls 或 .csv 模板，请先另存为 .xls 或 .csv','error');return;}
    const reader=new FileReader();reader.onload=()=>{const parsed=importReadRows(reader.result),validated=validateImportRows(parsed);state.importFile=file;state.importRows=validated.rows;state.importErrors=validated.errors;const modal=$('#importModal');modal.innerHTML=renderImport();modal.hidden=false;bindImport(modal);if(validated.errors.length)toast(validated.errors[0],'error');};reader.onerror=()=>toast('文件读取失败，请重试','error');reader.readAsText(file);
  }
  function submitImport(){
    if(!state.importFile){toast('请先选择需要导入的文件','error');return;}if(state.importErrors.length){toast(state.importErrors[0],'error');return;}if(!state.importRows.length){toast('模板中没有可导入的 SKU 明细','error');return;}
    const first=state.importRows[0],logistics=normalizeLogistics(first.channel,first.waybill),items=state.importRows.map(row=>({...row.product,sourceWarehouse:row.sourceWarehouse,team:row.sourceTeam,quantity:row.quantity,targetTeam:row.targetTeam,remark:row.remark})),no=nextTransferNo();
    orders.unshift({...order(no,'待审核',first.sourceWarehouse,first.targetWarehouse,items.length,items.reduce((sum,item)=>sum+item.quantity,0),0,logistics.channel,logistics.waybill,first.eta||'—','库存管理','Admin'),...first,channel:logistics.channel,waybill:logistics.waybill,items,skuCount:items.length,requestQty:items.reduce((sum,item)=>sum+item.quantity,0),inheritAge:first.inheritAge==='是'});
    $('#importModal').hidden=true;state.importFile=null;state.importRows=[];state.importErrors=[];state.page=1;renderTabs();renderTable();toast(`已导入新建调拨单 ${no}`);
  }
  function openImport(){state.importFile=null;state.importRows=[];state.importErrors=[];const modal=$('#importModal');modal.innerHTML=renderImport();modal.hidden=false;bindImport(modal);}
  function bindImport(modal){
    modal.querySelectorAll('[data-close="import"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    $('#downloadImportTemplate',modal).onclick=downloadImportTemplate;const input=$('#importFileInput',modal),drop=$('#importDropArea',modal);$('#chooseImportFile',modal).onclick=()=>input.click();drop.onclick=event=>{if(event.target!==input)input.click();};input.onchange=()=>loadImportFile(input.files[0]);drop.ondragover=event=>{event.preventDefault();drop.classList.add('drag-over');};drop.ondragleave=()=>drop.classList.remove('drag-over');drop.ondrop=event=>{event.preventDefault();drop.classList.remove('drag-over');loadImportFile(event.dataTransfer.files[0]);};$('#confirmImport',modal).onclick=submitImport;
  }
  function runAction(action,row){
    if(action==='view'){openDetail(row);return;}if(action==='edit'){openEditor(row);return;}if(action==='log'){openLog(row);return;}if(action==='outbound'){openOutbound(row);return;}if(action==='inbound'){openInbound(row);return;}if(action==='complete'){openComplete(row);return;}
    const messages={approve:'审核通过后将进入待出库状态',reject:'驳回后可由创建人修改并重新提交',void:'确认作废该调拨单吗？'};
    if(!confirm(messages[action]||'确认执行该操作吗？'))return;
    if(action==='approve')row.status='待出库';else if(action==='reject')row.status='已驳回';else if(action==='void')row.status='已作废';
    row.updatedAt=now();renderTabs();renderTable();toast(`调拨单 ${row.no} 已${action==='approve'?'审核通过':action==='reject'?'驳回':'作废'}`);
  }
  function init(){
    $('#importBtn').onclick=openImport;
    queryMultiConfigs().forEach(config=>initQueryMulti(...config));
    $('#codeType').onchange=syncComboPlaceholder;
    $('#skuType').onchange=syncComboPlaceholder;
    syncComboPlaceholder();
    document.addEventListener('click',()=>closeQueryMenus());
    window.addEventListener('resize',layoutQuery);
    renderTabs();renderTable();layoutQuery();
    $('#searchBtn').onclick=()=>{if(!validateQueryDates())return;state.page=1;renderTable();toast('查询完成');};['codeText','skuText'].forEach(id=>{$('#'+id).onkeydown=event=>{if(event.key==='Enter')$('#searchBtn').click();};});$('#resetBtn').onclick=resetFilters;$('#refreshBtn').onclick=()=>{renderTabs();renderTable();toast('列表已刷新');};$('#newBtn').onclick=()=>openEditor();$('#exportBtn').onclick=()=>toast('已生成调拨单导出文件');$('#auditBtn').onclick=openAudit;$('#voidBtn').onclick=voidRows;$('#pageSize').onchange=event=>{state.pageSize=Number(event.target.value);state.page=1;renderTable();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};$('#nextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filtered().length/state.pageSize));if(state.page<pages){state.page++;renderTable();}};$('#statusTabs').onclick=event=>{const tab=event.target.closest('[data-status]');if(!tab)return;state.status=tab.dataset.status;state.page=1;renderTabs();renderTable();};$('#selectAll').onchange=event=>{const visible=filtered().slice((state.page-1)*state.pageSize,state.page*state.pageSize);visible.forEach(row=>event.target.checked?state.selected.add(row.id):state.selected.delete(row.id));renderTable();};$('#tableBody').onclick=event=>{const check=event.target.closest('.row-check');if(check){check.checked?state.selected.add(check.dataset.id):state.selected.delete(check.dataset.id);$('#selectedCount').textContent=state.selected.size;return;}const button=event.target.closest('[data-action]');if(!button)return;const row=orders.find(item=>item.id===button.closest('tr').dataset.id);if(row)runAction(button.dataset.action,row);};$('#pageButtons').onclick=event=>{const button=event.target.closest('[data-page]');if(button){state.page=Number(button.dataset.page);renderTable();}};$('#addSkuBtn')?.addEventListener('click',openPicker);
    document.addEventListener('click',event=>{const button=event.target.closest('#tableBody [data-expand]');if(!button)return;const id=button.dataset.expand;state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);renderTable();});
    document.addEventListener('input',event=>{const input=event.target.closest('#tableBody [data-list-remark]');if(!input)return;const row=orders.find(item=>item.id===input.closest('tr')?.dataset.id);if(row)row.remark=input.value;});
  }
  init();
})();
