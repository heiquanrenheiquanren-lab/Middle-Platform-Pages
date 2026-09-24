(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const now = () => '2026-09-22 16:40';
  const warehouses = ['华东实体仓', 'SZ01东莞仓', 'Temu09-全托管平台仓', '快猫物流中转仓'];
  const teams = ['公共库存', 'Temu团队', '亚马逊北美团队', '独立站团队'];
  const skuPool = [
    {sku:'KBAB0057-009',name:'焊接面罩自动变光款',sourceSku:'KBAB0057-009',targetSku:'KBAB0057-009',available:312,price:6.4881,team:'Temu团队'},
    {sku:'34001001110',name:'焊接帽子迷彩 2-白色',sourceSku:'34001001110',targetSku:'34001001110',available:240,price:12.86,team:'公共库存'},
    {sku:'34001001206',name:'焊接手套加厚款',sourceSku:'34001001206',targetSku:'34001001206',available:128,price:18.5,team:'亚马逊北美团队'},
    {sku:'34001001401',name:'焊接护目镜防雾款',sourceSku:'34001001401',targetSku:'34001001401',available:86,price:25.2,team:'独立站团队'},
    {sku:'34001001501',name:'焊接面罩手持式',sourceSku:'34001001501',targetSku:'34001001501',available:64,price:32.8,team:'亚马逊北美团队'}
  ];
  let orders = [
    order('TF2609220001','待审核','华东实体仓','快猫物流中转仓',3,300,0,'快猫物流','—','2026-09-25','采购部','Admin'),
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
    return {id:no,no,status,source,target,skuCount,requestQty,outboundQty:status==='待审核'||status==='待出库'||status==='已驳回'||status==='已作废'?0:requestQty,inboundQty,channel:hasLogistics?channel:'—',waybill:hasLogistics?waybill:'—',eta,department,creator,createdAt:`${transferDate(no)} 10:20`,updatedAt:now(),inheritAge:true,fee:0,otherFee:0,remark:'',items:[]};
  }
  const state = {status:'全部',keyword:'',page:1,pageSize:10,selected:new Set(),expanded:new Set(),editing:null,pickerRows:[],pickerSelected:new Set(),importFile:null,importRows:[],importErrors:[]};
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
  function statusClass(status){return {待审核:'review',待出库:'out',在途:'transit',部分入库:'partial',已完成:'done',已驳回:'rejected',已作废:'void',异常:'exception'}[status]||'void';}
  function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2200);}
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function filtered(){
    const keyword=state.keyword.trim().toLowerCase();
    return orders.filter(row=>{
      const hitStatus=state.status==='全部'||row.status===state.status;
      const hitKeyword=!keyword||[row.no,row.source,row.target].some(value=>String(value).toLowerCase().includes(keyword));
      const source=$('#sourceWarehouse').value,target=$('#targetWarehouse').value,type=$('#transferType').value;
      const hitSource=!source||row.source===source,hitTarget=!target||row.target===target,hitType=!type||type==='仓间调拨';
      return hitStatus&&hitKeyword&&hitSource&&hitTarget&&hitType;
    });
  }
  function renderTabs(){
    const counts=Object.fromEntries(statusList.map(status=>[status,status==='全部'?orders.length:orders.filter(row=>row.status===status).length]));
    $('#statusTabs').innerHTML=statusList.map(status=>`<button class="status-tab ${state.status===status?'active':''}" data-status="${status}">${status}<em>${counts[status]}</em></button>`).join('');
  }
  function itemProgress(items,row,index){
    let outboundRemaining=row.outboundQty,inboundRemaining=row.inboundQty;
    return items.slice(0,index+1).reduce((progress,item,currentIndex)=>{
      const outbound=Math.min(item.quantity,Math.max(0,outboundRemaining));outboundRemaining-=outbound;
      const inbound=Math.min(outbound,Math.max(0,inboundRemaining));inboundRemaining-=inbound;
      return currentIndex===index?{outbound,inbound,inTransit:outbound-inbound,diff:outbound-inbound}:progress;
    },{outbound:0,inbound:0,inTransit:0});
  }
  function childDetailRow(row){
    const items=buildItems(row);
    return `<tr class="detail-row"><td colspan="10"><div class="child-detail-box"><div class="child-table-wrap"><table class="child-detail-table"><thead><tr><th>SKU</th><th>产品名称</th><th>调出团队</th><th>调入团队</th><th>调拨数量</th><th>已出库数量</th><th>已入库数量</th><th>在途数量</th><th>差异数量</th><th>备注</th></tr></thead><tbody>${items.map((item,index)=>{const progress=itemProgress(items,row,index);return `<tr><td>${escapeHtml(item.sku)}</td><td class="left">${escapeHtml(item.name)}</td><td>${escapeHtml(item.team||'—')}</td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.quantity}</td><td>${progress.outbound}</td><td>${progress.inbound}</td><td>${progress.inTransit}</td><td>${progress.diff}</td><td class="left">${escapeHtml(item.remark||'—')}</td></tr>`;}).join('')}</tbody></table></div></div></td></tr>`;
  }
  function renderTable(){
    const rows=filtered();const pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages);const pageRows=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);$('#totalCount').textContent=rows.length;$('#empty').hidden=pageRows.length>0;$('#selectAll').checked=pageRows.length>0&&pageRows.every(row=>state.selected.has(row.id));
    $('#tableBody').innerHTML=pageRows.map(row=>{const expanded=state.expanded.has(row.id),amount=transferAmount(row);return `<tr class="parent-row ${expanded?'is-expanded':''}" data-id="${row.id}"><td><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td><td><span class="expand-row ${expanded?'is-expanded':''}" data-expand="${row.id}" role="button" tabindex="0" aria-label="${expanded?'收起':'展开'}调拨明细"><span class="expand-chevron"></span></span></td><td><div class="doc-line doc-main"><button class="link doc-no" data-action="view">${row.no}</button><span class="status-tag status-${statusClass(row.status)}">${row.status}</span></div><div class="label-line"><span>调拨类型：</span><span>仓间调拨</span></div></td><td><div class="direction"><span>${escapeHtml(row.source)}</span><span class="arrow">→</span><span>${escapeHtml(row.target)}</span></div></td><td><div class="field-line"><span>出库数量：</span><span>${row.outboundQty}</span></div><div class="field-line"><span>入库数量：</span><span>${row.inboundQty}</span></div><div class="field-line"><span>在途数量：</span><span>${Math.max(row.outboundQty-row.inboundQty,0)}</span></div><div class="field-line"><span>差异数量：</span><span>${row.outboundQty-row.inboundQty}</span></div></td><td><div class="field-line"><span>运费：</span><span>${formatMoney(row.fee)}</span></div><div class="field-line"><span>其他费用：</span><span>${formatMoney(row.otherFee)}</span></div><div class="field-line"><span>调拨金额：</span><span>${formatMoney(amount)}</span></div></td><td><div class="field-line"><span>物流渠道：</span><span>${escapeHtml(row.channel||'—')}</span></div><div class="field-line"><span>物流单号：</span><span>${escapeHtml(row.waybill||'—')}</span></div><div class="field-line"><span>预计到仓：</span><span>${row.eta}</span></div></td><td><input class="list-remark-input" data-list-remark placeholder="请输入备注" value="${escapeHtml(row.remark||'')}"></td><td><div class="field-line"><span>创建人：</span><span>${escapeHtml(row.creator)}</span></div><div class="field-line"><span>创建时间：</span><span>${escapeHtml(row.createdAt)}</span></div></td><td><div class="action-cell">${actionsFor(row)}</div></td></tr>${expanded?childDetailRow(row):''}`;}).join('');
    $$('#tableBody .label-line').forEach(node=>node.remove());
    $('#selectedCount').textContent=state.selected.size;renderPager(pages);
  }
  function actionsFor(row){
    const view='<button class="link" data-action="view">查看</button>';
    const log='<button class="link" data-action="log">日志</button>';
    if(row.status==='待审核')return `${view}<button class="link" data-action="edit">修改</button>${log}`;
    if(row.status==='待出库')return `${view}<button class="link" data-action="outbound">确认出库</button><button class="link danger-link" data-action="void">作废</button>${log}`;
    if(row.status==='在途'||row.status==='部分入库')return `${view}<button class="link" data-action="inbound">确认入库</button><button class="link" data-action="edit-logistics">补录物流</button>${log}`;
    if(row.status==='已驳回')return `${view}<button class="link" data-action="edit">修改</button>${log}`;
    return `${view}${log}`;
  }
  function renderPager(pages){$('#pageButtons').innerHTML=Array.from({length:pages},(_,index)=>`<button class="page-number ${state.page===index+1?'active':''}" data-page="${index+1}">${index+1}</button>`).join('');$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;}
  function resetFilters(){['keyword','sourceWarehouse','targetWarehouse','transferType','startDate','endDate'].forEach(id=>{const node=$('#'+id);if(node)node.value='';});state.keyword='';state.status='全部';state.page=1;renderTabs();renderTable();toast('筛选条件已重置');}
  function selectedRow(){const id=state.editing;return orders.find(row=>row.id===id);}
  function formatMoney(value){return `¥${Number(value||0).toFixed(2)}`;}
  function normalizeLogistics(channel,waybill){const hasLogistics=Boolean(channel&&channel!=='—'&&waybill&&waybill!=='—');return {channel:hasLogistics?channel:'—',waybill:hasLogistics?waybill:'—'};}
  function transferAmount(row){return buildItems(row).reduce((sum,item)=>sum+(Number(item.quantity)||0)*(Number(item.price)||0),0)+Number(row.fee||0)+Number(row.otherFee||0);}
  function buildItems(row){
    if(row.items.length)return row.items;
    return skuPool.slice(0,row.skuCount).map((item,index)=>({...item,sourceWarehouse:row.source,team:item.team,quantity:Math.max(1,Math.round(row.requestQty/row.skuCount)-(index*2)),targetTeam:teams[(index+2)%teams.length],remark:''}));
  }
  function renderDetail(row){
    const items=buildItems(row);
    const amount=transferAmount(row);
    const value=(label,content)=>`<div class="transfer-detail-field"><span>${label}：</span><b>${content}</b></div>`;
    const status=`<span class="status-tag status-${statusClass(row.status)}">${escapeHtml(row.status)}</span>`;
    const detailRows=items.map((item,index)=>{const progress=itemProgress(items,row,index);return `<tr><td class="left"><b>${escapeHtml(item.sku)}</b></td><td class="left"><div class="product-cell"><span class="product-thumb">▧</span><span>${escapeHtml(item.name)}</span></div></td><td>${escapeHtml(item.team||'—')}</td><td>${escapeHtml(item.targetTeam||'—')}</td><td>${item.quantity}</td><td>${progress.outbound}</td><td>${progress.inbound}</td><td>${progress.inTransit}</td><td>${progress.diff}</td><td>${escapeHtml(item.remark||'—')}</td></tr>`;}).join('');
    return `<div class="dialog detail-dialog"><header class="dialog-header"><div><h2>调拨单详情</h2><p>${escapeHtml(row.no)} · ${escapeHtml(row.source)} → ${escapeHtml(row.target)}</p></div><button class="dialog-close" data-close="detail" aria-label="关闭调拨单详情">×</button></header><div class="dialog-body transfer-detail-body"><section class="section transfer-detail-section"><div class="section-title">调拨信息</div><div class="transfer-detail-field-grid">${value('调拨单号',escapeHtml(row.no))}${value('单据状态',status)}${value('调拨类型','仓间调拨')}${value('调出仓库',escapeHtml(row.source))}${value('调入仓库',escapeHtml(row.target))}${value('预计到仓',escapeHtml(row.eta||'—'))}${value('是否继承库龄',row.inheritAge?'是':'否')}${value('物流渠道',escapeHtml(row.channel||'—'))}${value('物流单号',escapeHtml(row.waybill||'—'))}${value('运费',formatMoney(row.fee))}${value('其他费用',formatMoney(row.otherFee))}${value('调拨金额',formatMoney(amount))}${value('创建人',escapeHtml(row.creator))}${value('创建时间',escapeHtml(row.createdAt))}</div><div class="transfer-detail-remark"><span>备注：</span><p>${escapeHtml(row.remark||'—')}</p></div></section><section class="section transfer-detail-section"><div class="section-title">调拨明细</div><div class="section-body transfer-detail-table-wrap"><table class="detail-table transfer-detail-table"><thead><tr><th>SKU</th><th>产品名称</th><th>调出团队</th><th>调入团队</th><th>调拨数量</th><th>已出库数量</th><th>已入库数量</th><th>在途数量</th><th>差异数量</th><th>备注</th></tr></thead><tbody>${detailRows}</tbody></table></div></section></div>`;
  }
  function openDetail(row){const modal=$('#detailModal');modal.innerHTML=renderDetail(row);modal.querySelector('.dialog-footer')?.remove();modal.hidden=false;bindDetail(modal,row);}
  function bindDetail(modal,row){modal.querySelectorAll('[data-close="detail"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};modal.querySelectorAll('[data-detail-action]').forEach(button=>button.onclick=()=>{modal.hidden=true;runAction(button.dataset.detailAction,row);});}
  function transferLogs(row){
    const logs=[{type:'创建调拨单',content:'创建仓间调拨申请',operator:row.creator,time:row.createdAt}];
    if(row.auditDecision)logs.push({type:row.auditDecision==='approve'?'审核通过':'驳回调拨单',content:row.auditReason||'单据已进入后续处理流程',operator:'Admin',time:row.updatedAt});
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
  function submitAudit(rows,decision,modal){
    const reason=$('#auditReason',modal).value.trim(),error=$('#auditError',modal);
    if(decision==='reject'&&!reason){error.textContent='驳回时必须填写原因';$('#auditReason',modal).classList.add('is-error');$('#auditReason',modal).focus();return;}
    rows.forEach(row=>{row.status=decision==='approve'?'待出库':'已驳回';row.auditDecision=decision;row.auditReason=reason;row.updatedAt=now();state.selected.delete(row.id);});
    modal.hidden=true;renderTabs();renderTable();toast(decision==='approve'?`已通过 ${rows.length} 张调拨单`:`已驳回 ${rows.length} 张调拨单`);
  }
  function editorForm(row){
    const isEdit=Boolean(row),source=row?.source||'',target=row?.target||'',inheritAge=row?String(row.inheritAge?'是':'否'):'',items=buildItems(row||{items:[],skuCount:0,requestQty:0});
    return `<div class="dialog editor-dialog"><header class="dialog-header"><div><h2>${isEdit?'编辑调拨单':'新建调拨单'}</h2></div><button class="dialog-close" data-close="editor">×</button></header><div class="dialog-body"><section class="section"><div class="section-title">基础信息</div><div class="section-body"><div class="form-grid"><div class="field"><label>调拨类型</label><select id="editType"><option>仓间调拨</option></select></div><div class="field"><label class="required">调出仓库</label><select id="editSource"><option value="">请选择调出仓库</option>${warehouses.map(item=>`<option ${item===source?'selected':''}>${item}</option>`).join('')}</select></div><div class="field"><label class="required">调入仓库</label><select id="editTarget"><option value="">请选择调入仓库</option>${warehouses.map(item=>`<option ${item===target?'selected':''}>${item}</option>`).join('')}</select></div><div class="field"><label>预计到仓日期</label><input id="editEta" type="date" value="${row?.eta||'2026-09-25'}"></div><div class="field"><label class="required">是否继承库龄</label><select id="inheritAge"><option value="">请选择</option><option value="是" ${inheritAge==='是'?'selected':''}>是</option><option value="否" ${inheritAge==='否'?'selected':''}>否</option></select></div><div class="field"><label>物流渠道</label><select id="editChannel"><option value="">请选择物流渠道</option>${['快猫物流','中通','圆通','顺丰'].map(item=>`<option ${item===row?.channel?'selected':''}>${item}</option>`).join('')}</select></div><div class="field"><label>物流单号</label><input id="editWaybill" value="${row?.waybill==='—'?'':row?.waybill||''}" placeholder="可后续补录"></div><div class="field"><label>运费</label><div class="money-field"><input id="editFee" type="number" min="0" step="0.01" value="${row?.fee||''}" placeholder="请输入"><span>CNY</span></div></div><div class="field"><label>其他费用</label><div class="money-field"><input id="editOtherFee" type="number" min="0" step="0.01" value="${row?.otherFee||''}" placeholder="请输入"><span>CNY</span></div></div><div class="field span-2"><label>调拨备注</label><textarea id="editRemark" maxlength="500" placeholder="请输入备注（选填）">${escapeHtml(row?.remark||'')}</textarea></div></div></div></section><section class="section"><div class="section-title"><div class="editor-item-toolbar"><button class="btn primary small" id="addSkuBtn">＋ 添加SKU</button><div class="bulk-target-team"><select id="bulkTargetTeam"><option value="">批量选择调入团队</option>${teams.map(item=>`<option>${item}</option>`).join('')}</select><button class="btn small" id="applyTargetTeam">应用到全部</button></div></div></div><div class="section-body detail-table-wrap"><table class="detail-table editor-detail"><thead><tr><th>SKU</th><th>产品名称</th><th>调出团队</th><th>在库量</th><th class="required-column">调拨数量</th><th class="required-column">调入团队</th><th>备注</th><th>操作</th></tr></thead><tbody id="editorItems">${items.map((item,index)=>editorItem(item,index)).join('')}</tbody></table><div class="empty editor-empty" ${items.length?'hidden':''}>请先选择调出仓库，再点击“添加SKU”</div></div></section></div><footer class="dialog-footer"><button class="btn" data-close="editor">取消</button><button class="btn primary" data-editor-action="submit">提交审核</button></footer></div>`;
  }
  function editorItem(item,index){return `<tr data-item-index="${index}"><td class="left"><b>${item.sku}</b></td><td class="left"><div class="product-cell"><span class="product-thumb">▧</span><span>${escapeHtml(item.name)}</span></div></td><td>${escapeHtml(item.team||'—')}</td><td>${item.available}</td><td><input class="quantity-input required-input" type="number" min="1" max="${item.available}" value="${item.quantity??''}" placeholder="请输入" required data-field="quantity"></td><td><select class="target-team-select required-input" required data-field="targetTeam"><option value="">请选择调入团队</option>${teams.map(team=>`<option ${team===item.targetTeam?'selected':''}>${team}</option>`).join('')}</select></td><td><textarea class="remark-input" maxlength="120" placeholder="请输入" data-field="remark">${escapeHtml(item.remark||'')}</textarea></td><td><button class="sku-remove" type="button" data-remove-item="${index}">移除</button></td></tr>`;}
  function openEditor(row){const modal=$('#editorModal');state.editing=row?.id||null;state.editorItems=buildItems(row||{items:[],skuCount:0,requestQty:0});modal.innerHTML=editorForm(row);modal.hidden=false;bindEditor(modal,row);}
  function bindEditor(modal,row){
    modal.querySelectorAll('[data-close="editor"]').forEach(button=>button.onclick=()=>{modal.hidden=true;});modal.onclick=event=>{if(event.target===modal)modal.hidden=true;};
    const source=$('#editSource',modal),target=$('#editTarget',modal),add=$('#addSkuBtn',modal),bulkTargetTeam=$('#bulkTargetTeam',modal);source.onchange=()=>{if(state.editorItems.length){if(!confirm('修改调出仓库将清空当前调拨明细，确认继续吗？')){source.value=row?.source||'';return;}state.editorItems=[];renderEditorItems(modal);}add.disabled=!source.value;};add.disabled=!source.value;add.onclick=openPicker;
    target.onchange=()=>{if(source.value&&source.value===target.value){toast('调入仓库不能与调出仓库相同');target.value='';}};
    $('#applyTargetTeam',modal).onclick=()=>{if(!bulkTargetTeam.value){toast('请选择要批量设置的调入团队');return;}if(!state.editorItems.length){toast('请先添加调拨SKU');return;}state.editorItems.forEach(item=>{item.targetTeam=bulkTargetTeam.value;});renderEditorItems(modal);toast('已应用到全部调拨SKU');};
    modal.querySelectorAll('[data-editor-action]').forEach(button=>button.onclick=()=>saveEditor(modal,row));
    renderEditorItems(modal);
  }
  function renderEditorItems(modal){const body=$('#editorItems',modal);body.innerHTML=(state.editorItems||[]).map((item,index)=>editorItem(item,index)).join('');$('.editor-empty',modal).hidden=Boolean(state.editorItems.length);body.querySelectorAll('[data-remove-item]').forEach(button=>button.onclick=()=>{state.editorItems.splice(Number(button.dataset.removeItem),1);renderEditorItems(modal);});body.querySelectorAll('[data-field]').forEach(input=>{const syncField=()=>{const row=state.editorItems[Number(input.closest('tr').dataset.itemIndex)];row[input.dataset.field]=input.value;};input.oninput=syncField;input.onchange=syncField;});}
  function saveEditor(modal,row){const source=$('#editSource',modal).value,target=$('#editTarget',modal).value,inheritAge=$('#inheritAge',modal).value;if(!source||!target||!inheritAge){toast('请填写调出仓库、调入仓库和是否继承库龄','error');return;}if(source===target){toast('调入仓库不能与调出仓库相同','error');return;}if(!state.editorItems.length){toast('请至少添加一个SKU','error');return;}for(const item of state.editorItems){if(item.quantity===''||item.quantity===null||item.quantity===undefined){toast(`请填写 SKU ${item.sku} 的调拨数量`,'error');return;}const quantity=Number(item.quantity);if(!Number.isInteger(quantity)||quantity<=0||quantity>item.available){toast(`SKU ${item.sku} 的调拨数量须为1-${item.available}的整数`,'error');return;}if(!item.targetTeam){toast(`请选择 SKU ${item.sku} 的调入团队`,'error');return;}}
    const logistics=normalizeLogistics($('#editChannel',modal).value.trim(),$('#editWaybill',modal).value.trim());
    const payload={source,target,eta:$('#editEta',modal).value||'—',...logistics,fee:Number($('#editFee',modal).value||0),otherFee:Number($('#editOtherFee',modal).value||0),remark:$('#editRemark',modal).value.trim(),inheritAge:inheritAge==='是',items:state.editorItems.map(item=>({...item,quantity:Number(item.quantity)})),skuCount:state.editorItems.length,requestQty:state.editorItems.reduce((sum,item)=>sum+Number(item.quantity),0)};
    if(row){Object.assign(row,payload);row.status='待审核';delete row.auditDecision;delete row.auditReason;row.updatedAt=now();toast('调拨单已提交审核');}else{const no=nextTransferNo();orders.unshift({...order(no,'待审核',source,target,payload.skuCount,payload.requestQty,0,payload.channel,payload.waybill,payload.eta,'库存管理','Admin'),...payload});toast('调拨单已提交审核');}
    modal.hidden=true;state.page=1;renderTabs();renderTable();
  }
  function pickerKey(item){return `${item.sku}__${item.team}`;}
  function openPicker(){
    const modal=$('#skuPickerModal');
    state.pickerSelected=new Set();
    state.pickerRows=skuPool.filter(item=>!state.editorItems.some(selected=>pickerKey(selected)===pickerKey(item)));
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
    $('#pickerConfirm',modal).onclick=()=>{const selected=state.pickerRows.filter(item=>state.pickerSelected.has(pickerKey(item))),bulkTargetTeam=$('#bulkTargetTeam',$('#editorModal'))?.value||'';if(!selected.length){toast('请至少选择一个SKU');return;}state.editorItems.push(...selected.map(item=>({...item,quantity:'',targetTeam:bulkTargetTeam,remark:''})));modal.hidden=true;renderEditorItems($('#editorModal'));};
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
    if(action==='view'){openDetail(row);return;}if(action==='edit'){openEditor(row);return;}if(action==='edit-logistics'){openEditor(row);return;}if(action==='log'){openLog(row);return;}
    const messages={approve:'审核通过后将进入待出库状态',reject:'驳回后可由创建人修改并重新提交',outbound:'确认出库后将扣减调出仓库存并增加在途库存',inbound:'确认入库后将减少在途库存并增加调入仓库存',void:'确认作废该调拨单吗？'};
    if(!confirm(messages[action]||'确认执行该操作吗？'))return;
    if(action==='approve')row.status='待出库';else if(action==='reject')row.status='已驳回';else if(action==='outbound'){row.status='在途';row.outboundQty=row.requestQty;}else if(action==='inbound'){const inbound=Math.max(row.outboundQty,0);row.inboundQty=inbound;row.status=inbound>=row.requestQty?'已完成':'部分入库';}else if(action==='void'){row.status='已作废';}
    row.updatedAt=now();renderTabs();renderTable();toast(`调拨单 ${row.no} 已${action==='approve'?'审核通过':action==='reject'?'驳回':action==='outbound'?'确认出库':action==='inbound'?'确认入库':'作废'}`);
  }
  function init(){
    $('#importBtn').onclick=openImport;
    renderTabs();renderTable();
    $('#searchBtn').onclick=()=>{state.keyword=$('#keyword').value;state.page=1;renderTable();toast('查询完成');};$('#keyword').onkeydown=event=>{if(event.key==='Enter')$('#searchBtn').click();};$('#resetBtn').onclick=resetFilters;$('#refreshBtn').onclick=()=>{renderTabs();renderTable();toast('列表已刷新');};$('#newBtn').onclick=()=>openEditor();$('#exportBtn').onclick=()=>toast('已生成调拨单导出文件');$('#auditBtn').onclick=openAudit;$('#pageSize').onchange=event=>{state.pageSize=Number(event.target.value);state.page=1;renderTable();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};$('#nextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filtered().length/state.pageSize));if(state.page<pages){state.page++;renderTable();}};$('#statusTabs').onclick=event=>{const tab=event.target.closest('[data-status]');if(!tab)return;state.status=tab.dataset.status;state.page=1;renderTabs();renderTable();};$('#selectAll').onchange=event=>{const visible=filtered().slice((state.page-1)*state.pageSize,state.page*state.pageSize);visible.forEach(row=>event.target.checked?state.selected.add(row.id):state.selected.delete(row.id));renderTable();};$('#tableBody').onclick=event=>{const check=event.target.closest('.row-check');if(check){check.checked?state.selected.add(check.dataset.id):state.selected.delete(check.dataset.id);$('#selectedCount').textContent=state.selected.size;return;}const button=event.target.closest('[data-action]');if(!button)return;const row=orders.find(item=>item.id===button.closest('tr').dataset.id);if(row)runAction(button.dataset.action,row);};$('#pageButtons').onclick=event=>{const button=event.target.closest('[data-page]');if(button){state.page=Number(button.dataset.page);renderTable();}};$('#addSkuBtn')?.addEventListener('click',openPicker);
    document.addEventListener('click',event=>{const button=event.target.closest('#tableBody [data-expand]');if(!button)return;const id=button.dataset.expand;state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);renderTable();});
    document.addEventListener('input',event=>{const input=event.target.closest('#tableBody [data-list-remark]');if(!input)return;const row=orders.find(item=>item.id===input.closest('tr')?.dataset.id);if(row)row.remark=input.value;});
    document.addEventListener('click',event=>{if(event.target.matches('[data-page-nav]')){const page=event.target.dataset.pageNav;const map={transferOrder:'../transfer-orders/index.html',inventoryQuery:'../inventory-query/index.html',processingOrder:'../processing-orders/index.html',forecast:'../demand-forecast/index.html',stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',skuFirstLegCost:'../sku-first-leg-cost/index.html'};if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page},'*');else if(map[page])window.location.href=map[page];}});
  }
  init();
})();
