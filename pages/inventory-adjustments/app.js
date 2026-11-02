(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => Number(value || 0).toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
  const now = () => '2026-10-08 15:30';
  const CURRENT_USER = 'Admin';
  const warehouses = ['华东实体仓','SZ01坪山石井仓','Temu09-全托管平台仓','快猫物流中转仓'];
  const teams = ['公共库存','Temu团队','亚马逊北美团队','独立站团队'];
  // 损益原因字典：按 PRD 6.3 归类分组（样品领用经产品确认本期不启用）；后台可配置不在本期范围
  const reasonMap = {
    '报溢':{
      '账实更正':['盘点盘盈','退货漏入库','历史入库遗漏','收货多收','海外仓库存校准','系统迁移修正'],
      '兜底':['其他盘盈']
    },
    '报损':{
      '账实更正':['盘点盘亏','海外仓库存校准','系统迁移修正'],
      '经营损耗':['商品丢失','商品破损','过期销毁','退货坏品报废','质检报废','错发漏发'],
      '兜底':['其他盘亏']
    }
  };
  const reasonList = type => Object.values(reasonMap[type]||{}).flat();
  const FALLBACK_REASONS = ['其他盘盈','其他盘亏'];
  const reasonOptionsHtml = (type,selected='') => Object.entries(reasonMap[type]||{}).map(([group,options])=>`<optgroup label="${group}">${options.map(reason=>`<option ${reason===selected?'selected':''}>${reason}</option>`).join('')}</optgroup>`).join('');
  const skuPool = [
    {sku:'KBAB0057-009',name:'焊接面罩自动变光款',stock:312,available:284,lastCost:6.49,batch:'PC2609280001'},
    {sku:'34001001110',name:'焊接帽子迷彩 2-白色',stock:240,available:228,lastCost:12.86,batch:'PC2609250003'},
    {sku:'34001001206',name:'焊接手套加厚款',stock:186,available:162,lastCost:18.50,batch:'PC2609230006'},
    {sku:'34001001401',name:'焊接护目镜防雾款',stock:154,available:150,lastCost:25.20,batch:'PC2609200008'},
    {sku:'34001001501',name:'焊接面罩手持式',stock:128,available:106,lastCost:32.80,batch:'PC2609180002'},
    {sku:'34001001602',name:'防火围裙加厚款',stock:96,available:90,lastCost:28.30,batch:'PC2609150004'}
  ];
  const mkItems = (type, rows) => rows.map(([index,qty,cost,detailReason], i) => {
    const product = skuPool[index];
    return {...product,qty,cost:cost ?? product.lastCost,detailReason:detailReason || '',remark:'',batch:type==='报溢'?`SYPC26100800${i+1}`:product.batch};
  });
  let orders = [
    order('SY2610080001','待审核','报损','华东实体仓','亚马逊北美团队','盘点盘亏','手工新建',mkItems('报损',[[0,3],[1,2]]),'Admin','仓库月度盘点差异'),
    order('SY2610070003','已完成','报溢','SZ01坪山石井仓','公共库存','盘点盘盈','盘点生成',mkItems('报溢',[[2,6,18.5],[3,2,25.2]]),'张三','PD2610070002盘点生成','PD2610070002'),
    order('SY2610060005','已驳回','报损','快猫物流中转仓','Temu团队','商品破损','手工新建',mkItems('报损',[[4,4]]),'李四','包装破损待核实'),
    order('SY2610050002','待审核','报损','华东实体仓','独立站团队','商品丢失','导入新建',mkItems('报损',[[3,168]]),'王五','可用库存不足'),
    order('SY2610030008','已作废','报溢','Temu09-全托管平台仓','Temu团队','海外仓库存校准','接口生成',mkItems('报溢',[[5,10,28.3]]),'Admin','重复同步数据已作废'),
    order('SY2610020006','已完成','报损','华东实体仓','公共库存','系统迁移修正','手工新建',mkItems('报损',[[1,5]]),'张三','历史库存数据校正')
  ];
  orders.forEach(row=>{
    row.source=['导入新建','盘点生成'].includes(row.source)?'手工新建':row.source;
    row.items=row.items.map((item,index)=>({...item,team:index&&row.items.length>1?teams[(teams.indexOf(row.team)+1)%teams.length]:row.team,detailReason:item.detailReason||row.reason}));
    delete row.team;delete row.reason;delete row.sourceNo;delete row.attachment;delete row.occurredAt;
  });
  function order(no,status,type,warehouse,team,reason,source,items,creator,remark,sourceNo=''){
    const date=`20${no.slice(2,4)}-${no.slice(4,6)}-${no.slice(6,8)}`;
    return {id:no,no,status,type,warehouse,team,reason,source,items,creator,remark,sourceNo,occurredAt:`${date} 10:00`,createdAt:`${date} 10:20`,completedAt:status==='已完成'?`${date} 14:35`:'',auditor:status==='已完成'?'赵六':'',attachment:reason.includes('破损')||reason.includes('丢失')?'异常现场凭证.jpg':'',logs:[{type:'新增',content:`创建${type}损益单`,operator:creator,time:`${date} 10:20`} ]};
  }
  const state={status:'全部',page:1,pageSize:10,selected:new Set(),warehouses:[],teams:[],reasons:[],creators:[CURRENT_USER],queryExpanded:false,editing:null,editorItems:[]};
  const statuses=['全部','待审核','已完成','已驳回','已作废'];
  const qty = row => row.items.reduce((sum,item)=>sum+Number(item.qty||0),0);
  const amount = row => row.items.reduce((sum,item)=>sum+Number(item.qty||0)*Number(item.cost||0),0);
  const rowReasons = row => [...new Set(row.items.map(item=>item.detailReason).filter(Boolean))];
  const split = value => [...new Set(String(value||'').trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];
  function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2200);}
  function nextNo(){const prefix='SY261008';const max=orders.filter(r=>r.no.startsWith(prefix)).reduce((m,r)=>Math.max(m,Number(r.no.slice(-4))||0),0);return `${prefix}${String(max+1).padStart(4,'0')}`;}

  function queryMulti(rootId,options,key,placeholder){
    const root=$(rootId),menu=$('[data-menu]',root),trigger=$('[data-trigger]',root);menu.innerHTML=options.map(value=>`<label><input type="checkbox" value="${escapeHtml(value)}" ${state[key].includes(value)?'checked':''}> <span>${escapeHtml(value)}</span></label>`).join('');
    const sync=()=>{state[key]=$$('input:checked',menu).map(input=>input.value);trigger.textContent=state[key].length?`${state[key].slice(0,2).join('、')}${state[key].length>2?` +${state[key].length-2}`:''}`:placeholder;root.classList.toggle('has-value',state[key].length>0);};
    trigger.onclick=e=>{e.stopPropagation();$$('.multi .dropdown.show').forEach(n=>{if(n!==menu)n.classList.remove('show')});menu.classList.toggle('show');};menu.onclick=e=>e.stopPropagation();menu.onchange=sync;sync();
    if(!root.dataset.outsideBound){root.dataset.outsideBound='1';document.addEventListener('click',event=>{if(!root.contains(event.target))menu.classList.remove('show');});}
  }
  function setupMultis(){queryMulti('#warehouseMulti',warehouses,'warehouses','请选择仓库（可多选）');queryMulti('#teamMulti',teams,'teams','请选择团队（可多选）');queryMulti('#creatorMulti',[...new Set(orders.map(r=>r.creator))],'creators','请选择创建人（可多选）');}
  function filtered(ignoreStatus=false){
    const queryValues=split($('#skuText').value),skuType=$('#skuType').value,type=$('#typeQuery').value,start=$('#startDate').value,end=$('#endDate').value,timeType=$('#timeType').value;
    return orders.filter(row=>(ignoreStatus||(state.status==='全部'||row.status===state.status))&&(!queryValues.length||(skuType==='no'?queryValues.some(v=>String(row.no||'').toLowerCase().includes(v)):row.items.some(item=>queryValues.some(v=>String(item[skuType]||'').toLowerCase().includes(v)))))&&(!type||row.type===type)&&(!state.warehouses.length||state.warehouses.includes(row.warehouse))&&(!state.teams.length||row.items.some(item=>state.teams.includes(item.team)))&&(!state.creators.length||state.creators.includes(row.creator))&&(!start||String(row[timeType]||'').slice(0,10)>=start)&&(!end||String(row[timeType]||'').slice(0,10)<=end));
  }
  const statusTag=status=>{const map={'待审核':'pending','已完成':'done','已驳回':'rejected','已作废':'void'};return `<span class="status-tag status-${map[status]||'pending'}">${status}</span>`;};
  const stripActions=row=>{const items=[];if(row.status==='待审核')items.push(['edit','编辑']);items.push(['log','日志']);return items;};
  const detailTitles=['SKU','产品名称','团队','损益数量','移动加权价','损益金额','损益原因','备注'];
  const detailCols=['14%','18%','12%','10%','10%','11%','13%','12%'];
  const detailColgroup=`<colgroup>${detailCols.map(width=>`<col style="width:${width}">`).join('')}</colgroup>`;
  const detailHead=()=>`<tr class="po-shared-head"><td colspan="12"><table class="detail-table detail-head-table">${detailColgroup}<thead><tr>${detailTitles.map((label,index)=>`<th>${index===0?'<input class="head-check" id="selectAll" type="checkbox" aria-label="全选当前筛选结果" title="全选">':''}${label}</th>`).join('')}</tr></thead></table></td></tr>`;
  function stripRow(row){return `<tr class="po-strip-row" data-id="${row.id}"><td colspan="12"><div class="po-strip"><span class="po-strip__pin"><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''} aria-label="选择损益单 ${row.no}"><span class="po-strip__no"><a class="strip-no">${row.no}</a>${statusTag(row.status)}<span class="adjustment-tag ${row.type==='报溢'?'gain':'loss'}">${row.type}</span></span></span><span class="po-strip__field" title="${escapeHtml(row.warehouse)}"><em>损益仓库</em><span>${escapeHtml(row.warehouse)}</span></span><span class="po-strip__field po-strip__num"><em>损益数量</em><b>${qty(row)}</b></span><span class="po-strip__field po-strip__num"><em>损益金额</em><b>${num(amount(row))}</b></span><span class="po-strip__field po-strip__remark"><em>备注</em><span class="strip-remark-text" title="${escapeHtml(row.remark||'暂无备注')}">${escapeHtml(row.remark||'—')}</span><button class="strip-remark-edit" type="button" data-remark-edit="${row.id}" aria-label="编辑损益单 ${row.no} 的备注"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9 2.1a1.5 1.5 0 0 1 2.1 2.1l-7.7 7.7-2.8.7.7-2.8 7.7-7.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m9.8 3.2 3 3" fill="none" stroke="currentColor" stroke-width="1.3"/></svg></button></span><span class="po-strip__field"><em>创建人</em><span>${escapeHtml(row.creator)}</span></span><span class="po-strip__field"><em>创建时间</em><span>${escapeHtml(row.createdAt)}</span></span><span class="po-strip__ops"><button class="po-strip__trigger" type="button" data-strip-menu="${row.id}" aria-haspopup="true">操作 ⌄</button></span></div></td></tr><tr class="po-detail-row" data-parent-id="${row.id}"><td colspan="12"><div class="detail-panel"><div class="detail-scroll"><table class="detail-table">${detailColgroup}<tbody>${row.items.map(item=>`<tr><td>${escapeHtml(item.sku)}</td><td><span class="detail-product"><span class="detail-product-thumb" aria-hidden="true"><svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="m4 11 2.6-3.2 2 2.2 1.6-1.6 1.8 2.6"/><circle cx="10.8" cy="5.8" r="1.1"/></svg></span><span class="detail-product-name">${escapeHtml(item.name)}</span></span></td><td>${escapeHtml(item.team)}</td><td class="${row.type==='报溢'?'gain-num':'loss-num'}">${row.type==='报溢'?'+':'-'}${item.qty}</td><td>${num(item.cost)}</td><td>${num(item.qty*item.cost)}</td><td>${escapeHtml(item.detailReason)}</td><td>${escapeHtml(item.remark||'—')}</td></tr>`).join('')}</tbody></table></div></div></td></tr>`;}
  function render(){
    const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages);const pageRows=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
    const baseRows=filtered(true);
    $('#statusTabs').innerHTML=statuses.map(status=>`<div class="status-tab ${state.status===status?'active':''}" data-status="${status}">${status}<em>${status==='全部'?baseRows.length:baseRows.filter(r=>r.status===status).length}</em></div>`).join('');$('#tableBody').innerHTML=(pageRows.length?detailHead()+pageRows.map(stripRow).join(''):'');$('#empty').hidden=Boolean(pageRows.length);$('#totalCount').textContent=rows.length;
    const skuCount=new Set(rows.flatMap(row=>row.items.map(item=>item.sku))).size;
    // 状态联动操作按钮：审核仅待审核页签展示；作废在待审核/已驳回页签展示（与 PRD 状态机一致）
    $('#auditBtn').hidden=state.status!=='待审核';
    $('#voidBtn').hidden=!['待审核','已驳回'].includes(state.status);
    const totals=type=>rows.filter(row=>row.type===type).reduce((result,row)=>({qty:result.qty+qty(row),amount:result.amount+amount(row)}),{qty:0,amount:0});
    const gain=totals('报溢'),loss=totals('报损');
    const signed=(value,text,negative)=>value>0?`${negative?'-':'+'}${text}`:'0';
    $('#adjustmentSummary').innerHTML=`共 <b>${rows.length}</b> 张 · <b>${skuCount}</b> 个 SKU · 报溢数量 <b>${signed(gain.qty,gain.qty)}</b> · 报损数量 <b>${signed(loss.qty,loss.qty,true)}</b> · 报溢金额 <b>${gain.amount>0?num(gain.amount):'0'}</b> · 报损金额 <b>${loss.amount>0?num(loss.amount):'0'}</b>`;
    $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'active':''}" data-page="${i+1}">${i+1}</button>`).join('');$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;
    $$('.status-tab').forEach(tab=>tab.onclick=()=>{state.status=tab.dataset.status;state.page=1;state.selected.clear();render();});$$('[data-page]').forEach(btn=>btn.onclick=()=>{state.page=Number(btn.dataset.page);render();});
    $$('#tableBody .row-check').forEach(check=>check.onchange=e=>{e.target.checked?state.selected.add(check.dataset.id):state.selected.delete(check.dataset.id);render();});
    const selectAll=$('#selectAll');
    if(selectAll){const selectedRows=rows.filter(row=>state.selected.has(row.id));selectAll.checked=rows.length>0&&selectedRows.length===rows.length;selectAll.indeterminate=selectedRows.length>0&&selectedRows.length<rows.length;selectAll.onchange=e=>{rows.forEach(row=>e.target.checked?state.selected.add(row.id):state.selected.delete(row.id));render();};}
    $$('.strip-no').forEach(link=>link.onclick=()=>{const row=orders.find(r=>r.id===link.closest('.po-strip-row').dataset.id);if(row)openDetail(row);});
    $$('[data-strip-menu]').forEach(btn=>btn.onclick=event=>{event.stopPropagation();toggleStripMenu(btn);});
    $$('[data-remark-edit]').forEach(btn=>btn.onclick=event=>{event.stopPropagation();const row=orders.find(r=>r.id===btn.dataset.remarkEdit);if(row)openRemarkEditor(btn,row);});
  }
  let remarkPopover=null;
  function closeRemarkPopover(){if(remarkPopover){remarkPopover.remove();remarkPopover=null;}}
  function openRemarkEditor(trigger,row){
    closeRemarkPopover();
    const pop=document.createElement('div');pop.className='remark-popover';
    pop.innerHTML=`<div class="remark-popover-title">编辑备注</div><textarea maxlength="500" rows="4" placeholder="请输入备注">${escapeHtml(row.remark||'')}</textarea><div class="remark-popover-actions"><button class="btn" type="button" data-cancel>取消</button><button class="btn primary" type="button" data-save>确定</button></div>`;
    document.body.appendChild(pop);
    pop.onclick=event=>event.stopPropagation();
    const rect=trigger.getBoundingClientRect();
    pop.style.top=`${rect.bottom+6}px`;pop.style.left=`${Math.max(8,Math.min(rect.left,window.innerWidth-360))}px`;
    pop.querySelector('[data-cancel]').onclick=closeRemarkPopover;
    pop.querySelector('[data-save]').onclick=()=>{row.remark=pop.querySelector('textarea').value.trim();row.logs.unshift({type:'编辑',content:'修改单据备注',operator:CURRENT_USER,time:now()});closeRemarkPopover();render();toast('备注已更新');};
    remarkPopover=pop;pop.querySelector('textarea').focus();
  }
  let stripMenuLayer=null;
  function closeStripMenu(){if(stripMenuLayer){stripMenuLayer.remove();stripMenuLayer=null;}}
  function toggleStripMenu(trigger){
    if(stripMenuLayer){closeStripMenu();return;}
    const row=orders.find(item=>item.id===trigger.dataset.stripMenu);if(!row)return;
    const menu=document.createElement('div');menu.className='po-strip__menu po-strip__menu--float show';
    menu.innerHTML=stripActions(row).map(([action,label])=>`<button type="button" ${['void'].includes(action)?'class="danger-menu-item"':''} data-action="${action}">${label}</button>`).join('');
    document.body.appendChild(menu);
    const rect=trigger.getBoundingClientRect();
    menu.style.top=`${rect.bottom+4}px`;menu.style.right=`${Math.max(8,window.innerWidth-rect.right)}px`;
    menu.querySelectorAll('[data-action]').forEach(button=>button.onclick=event=>{event.stopPropagation();closeStripMenu();handleAction(button.dataset.action,row);});
    stripMenuLayer=menu;
  }
  function modal(content,className='modal-mask'){const mask=document.createElement('div');mask.className=className;mask.innerHTML=content;document.body.appendChild(mask);mask.addEventListener('click',e=>{if(e.target===mask){mask.remove();closeBatchPopovers();}});$$('[data-close]',mask).forEach(btn=>btn.onclick=()=>{mask.remove();closeBatchPopovers();});return mask;}
  function editorTemplate(row){const draft=row||{type:'',source:'手工新建',remark:''};return `<section class="dialog editor-dialog"><header class="dialog-header"><div><h2>${row?'编辑':'新建'}损益单</h2><p>${row?row.no:'提交后进入待审核'}</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body editor-body"><div class="adjustment-form"><div class="form-row required"><label>损益类型</label><select class="control" id="editType"><option value="" ${draft.type?'':'selected'} disabled hidden>请选择损益类型</option><option ${draft.type==='报溢'?'selected':''}>报溢</option><option ${draft.type==='报损'?'selected':''}>报损</option></select></div><div class="form-row required"><label>损益仓库</label><select class="control" id="editWarehouse"><option value="">请选择仓库</option>${warehouses.map(v=>`<option ${draft.warehouse===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="form-row"><label>单据备注</label><textarea class="control" id="editRemark" maxlength="500" placeholder="请输入备注">${escapeHtml(draft.remark||'')}</textarea></div></div><div class="items-block"><div class="items-toolbar"><strong>SKU 损益明细</strong><button class="btn primary" id="addSkuBtn">添加 SKU</button></div><div class="editor-table-wrap"><table class="editor-table"><colgroup><col style="width:130px"><col style="width:150px"><col style="width:140px"><col style="width:90px"><col style="width:110px"><col style="width:100px"><col style="width:100px"><col style="width:140px"><col style="width:120px"><col style="width:60px"></colgroup><thead><tr><th>SKU</th><th>产品名称</th><th><i class="th-required">*</i>团队<button type="button" class="batch-edit-btn" data-batch="team">批量</button></th><th>当前可用量</th><th><i class="th-required">*</i>损益数量<button type="button" class="batch-edit-btn" data-batch="qty">批量</button></th><th>移动加权价</th><th>损益金额</th><th><i class="th-required">*</i>损益原因<button type="button" class="batch-edit-btn" data-batch="reason">批量</button></th><th>备注<button type="button" class="batch-edit-btn" data-batch="remark">批量</button></th><th>操作</th></tr></thead><tbody id="editorItems"></tbody></table><div class="editor-empty" id="editorEmpty">请点击「添加 SKU」添加损益明细，团队、数量、原因、备注均可在表头批量设置</div></div></div></div><footer class="dialog-footer"><button class="btn" type="button" data-close>取消</button><button class="btn primary" id="submitEditor">${row&&row.status==='待审核'?'保存':'提交审核'}</button></footer></section>`;}
  function renderEditorItems(mask){const type=$('#editType',mask).value;$('#editorItems',mask).innerHTML=state.editorItems.map((item,index)=>`<tr data-index="${index}"><td>${item.sku}</td><td class="product-cell">${item.name}</td><td><select class="control item-team"><option value="">请选择团队</option>${teams.map(team=>`<option ${item.team===team?'selected':''}>${team}</option>`).join('')}</select></td><td>${item.available}</td><td><input class="control item-qty" type="number" min="1" value="${item.qty||''}"></td><td class="item-cost">${num(item.cost||item.lastCost||0)}</td><td class="item-amount">${num(Number(item.qty||0)*Number(item.cost||item.lastCost||0))}</td><td><select class="control item-reason"><option value="">请选择原因</option>${reasonOptionsHtml(type,item.detailReason)}</select></td><td><input class="control item-remark" value="${escapeHtml(item.remark||'')}" maxlength="120"></td><td><button class="link danger-link remove-item">移除</button></td></tr>`).join('');$('#editorEmpty',mask).hidden=state.editorItems.length>0;
    $$('#editorItems tr',mask).forEach(tr=>{const item=state.editorItems[Number(tr.dataset.index)],sync=()=>{item.team=$('.item-team',tr).value;item.qty=Number($('.item-qty',tr).value||0);item.detailReason=$('.item-reason',tr).value;item.remark=$('.item-remark',tr).value;$('.item-amount',tr).textContent=num(Number(item.qty||0)*Number(item.cost||item.lastCost||0));};$$('input,select',tr).forEach(input=>{input.oninput=sync;input.onchange=sync;});$('.remove-item',tr).onclick=()=>{state.editorItems.splice(Number(tr.dataset.index),1);renderEditorItems(mask);};});requestAnimationFrame(()=>syncSticky(mask));}
  function openSkuPicker(editorMask){
    const warehouse=$('#editWarehouse',editorMask).value;
    if(!warehouse){toast('请先在单头选择损益仓库');return;}
    const candidates=skuPool.map((item,index)=>({...item,team:teams[index%teams.length]}));
    const selected=new Set();
    const picker=modal(`<section class="dialog picker-dialog"><header class="dialog-header"><div><h2>添加损益SKU</h2><p>损益仓库：${escapeHtml(warehouse)}</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body"><div class="picker-search"><input class="control" id="pickerSku" placeholder="SKU（支持多个，逗号或空格分隔）"><input class="control" id="pickerName" placeholder="产品名称"><select class="control" id="pickerTeam"><option value="">团队</option>${teams.map(team=>`<option>${team}</option>`).join('')}</select><button class="btn primary" id="pickerSearchBtn">查询</button></div><div class="detail-table-wrap"><table class="picker-table"><thead><tr><th width="46"><input type="checkbox" id="pickerAll"></th><th>SKU</th><th>产品名称</th><th>团队</th><th class="num">可用库存</th></tr></thead><tbody id="pickerBody"></tbody></table></div></div><footer class="picker-footer"><button class="btn" data-close>取消</button><button class="btn primary" id="pickerConfirm">添加选中SKU</button></footer></section>`);
    const key=item=>`${item.sku}@@${item.team}`;
    const exists=item=>state.editorItems.some(current=>current.sku===item.sku&&current.team===item.team);
    const filteredRows=()=>{const skuValues=split($('#pickerSku',picker).value),name=$('#pickerName',picker).value.trim().toLowerCase(),team=$('#pickerTeam',picker).value;return candidates.filter(item=>(!skuValues.length||skuValues.some(value=>item.sku.toLowerCase().includes(value)))&&(!name||item.name.toLowerCase().includes(name))&&(!team||item.team===team));};
    let searched=false;
    const renderRows=()=>{if(!searched){$('#pickerBody',picker).innerHTML='<tr><td colspan="5" class="empty">请输入查询条件后点击「查询」加载 SKU</td></tr>';$('#pickerAll',picker).checked=false;return;}const rows=filteredRows();$('#pickerBody',picker).innerHTML=rows.map(item=>`<tr><td><input class="picker-check" type="checkbox" data-key="${key(item)}" ${selected.has(key(item))?'checked':''} ${exists(item)?'disabled':''}></td><td>${item.sku}</td><td>${item.name}</td><td>${item.team}</td><td class="num">${item.available}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">暂无符合条件的 SKU</td></tr>';$('#pickerAll',picker).checked=rows.length>0&&rows.every(item=>selected.has(key(item)));};
    renderRows();$('#pickerSearchBtn',picker).onclick=()=>{searched=true;renderRows();};[$('#pickerSku',picker),$('#pickerName',picker)].forEach(input=>{input.onkeydown=e=>{if(e.key==='Enter'){searched=true;renderRows();}};});$('#pickerAll',picker).onchange=event=>{if(!searched){event.target.checked=false;return;}filteredRows().forEach(item=>{if(exists(item))return;event.target.checked?selected.add(key(item)):selected.delete(key(item));});renderRows();};$('#pickerBody',picker).onchange=event=>{const input=event.target.closest('.picker-check');if(!input)return;input.checked?selected.add(input.dataset.key):selected.delete(input.dataset.key);};$('#pickerConfirm',picker).onclick=()=>{const rows=candidates.filter(item=>selected.has(key(item)));if(!rows.length){toast('请至少选择一个 SKU');return;}state.editorItems.push(...rows.map(item=>({...item,qty:'',cost:item.lastCost,detailReason:'',remark:''})));picker.remove();renderEditorItems(editorMask);toast(`已添加 ${rows.length} 个 SKU`);};
  }
  function closeBatchPopovers(){$$('.batch-popover').forEach(node=>node.remove());}
  function syncSticky(mask){const table=$('.editor-table',mask);if(!table)return;const cells=$$('thead th',table);let left=0;for(let i=0;i<Math.min(3,cells.length);i++){table.style.setProperty(`--sticky-${i}`,`${left}px`);left+=cells[i].getBoundingClientRect().width;}}
  function openBatchEdit(mask,kind,anchor){
    const existing=$('.batch-popover');
    if(existing){existing.remove();return;}
    if(!state.editorItems.length){toast('请先添加 SKU 明细');return;}
    const type=$('#editType',mask).value;
    const configs={
      team:{title:'批量设置团队',label:'团队',field:`<select class="control" id="batchValue"><option value="">请选择团队</option>${teams.map(v=>`<option>${v}</option>`).join('')}</select>`,apply:(item,value)=>{item.team=value;}},
      qty:{title:'批量设置损益数量',label:'损益数量',field:`<input class="control" id="batchValue" type="number" min="1" placeholder="请输入损益数量">`,apply:(item,value)=>{item.qty=Number(value);}},
      reason:{title:'批量设置损益原因',label:'损益原因',field:`<select class="control" id="batchValue"><option value="">请选择原因</option>${reasonOptionsHtml(type)}</select>`,apply:(item,value)=>{item.detailReason=value;}},
      remark:{title:'批量设置备注',label:'备注',field:`<input class="control" id="batchValue" maxlength="120" placeholder="请输入备注">`,apply:(item,value)=>{item.remark=value;}}
    };
    const config=configs[kind];if(!config)return;
    const rect=anchor.getBoundingClientRect();
    const popover=document.createElement('div');
    popover.className='batch-popover';
    popover.innerHTML=`<div class="batch-popover-title">${config.title}</div>${config.field}<div class="batch-popover-actions"><button type="button" class="btn small" data-batch-cancel>取消</button><button type="button" class="btn primary small" data-batch-confirm>确认</button></div>`;
    document.body.appendChild(popover);
    const top=Math.min(rect.bottom+6,window.innerHeight-popover.offsetHeight-8),left=Math.min(Math.max(8,rect.left+rect.width/2-popover.offsetWidth/2),window.innerWidth-popover.offsetWidth-8);
    popover.style.top=`${top}px`;popover.style.left=`${left}px`;
    const close=()=>{popover.remove();document.removeEventListener('click',onDocClick);document.removeEventListener('keydown',onKey);};
    const onDocClick=event=>{if(!popover.contains(event.target)&&!anchor.contains(event.target))close();};
    const onKey=event=>{if(event.key==='Escape')close();};
    if(kind!=='team'&&kind!=='reason'){const input=$('#batchValue',popover);input.focus();input.onkeydown=event=>{if(event.key==='Enter'){$('[data-batch-confirm]',popover).click();}};}
    $('[data-batch-cancel]',popover).onclick=close;
    $('[data-batch-confirm]',popover).onclick=()=>{const raw=$('#batchValue',popover).value.trim();if(!raw){toast(`请先填写${config.label}`);return;}const value=kind==='qty'?Number(raw):raw;if(kind==='qty'&&(!Number.isInteger(value)||value<=0)){toast('损益数量必须为正整数');return;}state.editorItems.forEach(item=>config.apply(item,value));close();renderEditorItems(mask);toast(`已将${config.label}批量应用到 ${state.editorItems.length} 个明细`);};
    setTimeout(()=>{document.addEventListener('click',onDocClick);document.addEventListener('keydown',onKey);});
  }
  function openEditor(row){state.editing=row?.id||null;state.editorItems=(row?.items||[]).map(item=>({...item}));const mask=modal(editorTemplate(row));renderEditorItems(mask);const protectChange=select=>select.onchange=()=>{if(state.editorItems.length){state.editorItems=[];toast('损益类型已变更，已清空已选 SKU');}renderEditorItems(mask);};protectChange($('#editType',mask));
    $('#addSkuBtn',mask).onclick=()=>openSkuPicker(mask);$$('[data-batch]',mask).forEach(btn=>btn.onclick=event=>{event.stopPropagation();openBatchEdit(mask,btn.dataset.batch,btn);});
    $('#submitEditor',mask).onclick=()=>{const type=$('#editType',mask).value,warehouse=$('#editWarehouse',mask).value;if(!type){toast('请选择损益类型');return;}if(!warehouse){toast('请选择损益仓库');return;}if(!state.editorItems.length){toast('请至少添加一个 SKU');return;}const invalid=state.editorItems.find(item=>!item.team||!item.detailReason||!reasonList(type).includes(item.detailReason)||!Number.isInteger(Number(item.qty))||Number(item.qty)<=0||(type==='报损'&&Number(item.qty)>item.available));if(invalid){toast(`${invalid.sku} 的团队、损益原因或数量不符合要求`);return;}const noRemark=state.editorItems.find(item=>FALLBACK_REASONS.includes(item.detailReason)&&!String(item.remark||'').trim());if(noRemark){toast(`${noRemark.sku} 选择了「${noRemark.detailReason}」，请填写备注说明具体原因`);return;}const items=state.editorItems.map(item=>({...item,cost:Number(item.cost||item.lastCost||0)}));const data={type,warehouse,remark:$('#editRemark',mask).value,items,source:row?.source||'手工新建'};const keepPending=Boolean(row&&row.status==='待审核');if(row){Object.assign(row,data,{status:'待审核'});row.logs.unshift({type:'编辑',content:keepPending?'保存损益单修改':'编辑损益单并重新提交审核',operator:CURRENT_USER,time:now()});}else{const first=data.items[0];const created=order(nextNo(),'待审核',type,warehouse,first.team,first.detailReason,'手工新建',data.items,CURRENT_USER,data.remark);Object.assign(created,data);delete created.team;delete created.reason;delete created.sourceNo;delete created.attachment;delete created.occurredAt;orders.unshift(created);}mask.remove();closeBatchPopovers();state.status='全部';render();setupMultis();toast(row?(keepPending?'损益单已保存':'损益单已重新提交'):'损益单创建成功');};}
  function openAudit(rows){const eligible=rows.filter(row=>row.status==='待审核');if(!eligible.length){toast('请选择待审核的损益单');return;}const mask=modal(`<section class="dialog audit-dialog"><header class="dialog-header"><div><h2>审核损益单</h2><p>已选择 ${eligible.length} 张待审核损益单</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body audit-body"><div class="audit-opinion"><label>审核意见</label><textarea id="auditOpinion" maxlength="300" placeholder="审核通过可留空，驳回时请填写原因"></textarea><div class="audit-opinion-footer"><em id="auditCount">0</em>/300</div><div class="audit-error" id="auditError"></div></div></div><footer class="dialog-footer audit-footer"><button class="btn" data-close>取消</button><button class="btn danger" id="rejectAudit">驳回</button><button class="btn success" id="passAudit">通过</button></footer></section>`);const opinion=$('#auditOpinion',mask);opinion.oninput=()=>$('#auditCount',mask).textContent=opinion.value.length;$('#rejectAudit',mask).onclick=()=>{if(!opinion.value.trim()){$('#auditError',mask).textContent='驳回时请填写原因';opinion.classList.add('is-error');return;}eligible.forEach(row=>{row.status='已驳回';row.logs.unshift({type:'审核',content:`审核驳回：${opinion.value.trim()}`,operator:CURRENT_USER,time:now()});});mask.remove();state.selected.clear();render();toast('已驳回所选损益单');};$('#passAudit',mask).onclick=()=>{eligible.forEach(row=>{row.status='已完成';row.auditor=CURRENT_USER;row.completedAt=now();row.logs.unshift({type:'审核',content:`审核通过并完成${row.type}库存调整${opinion.value.trim()?`：${opinion.value.trim()}`:''}`,operator:CURRENT_USER,time:now()});});mask.remove();state.selected.clear();render();toast('审核通过，库存已更新');};}
  function openDetail(row){const mask=modal(`<section class="dialog detail-dialog"><header class="dialog-header"><div><h2>损益单详情</h2><p>${row.no}</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body editor-body"><div class="detail-grid">${[['损益单号',row.no],['单据状态',row.status],['损益类型',row.type],['损益仓库',row.warehouse],['创建信息',`${row.creator} / ${row.createdAt}`],['单据备注',row.remark||'—']].map(([label,value],i)=>`<div class="detail-field ${i===5?'wide':''}"><label>${label}</label><span>${escapeHtml(value)}</span></div>`).join('')}</div><div class="detail-items"><table class="adjustment-detail-table"><thead><tr>${detailTitles.map(title=>`<th>${title}</th>`).join('')}</tr></thead><tbody>${row.items.map(item=>`<tr><td>${item.sku}</td><td>${item.name}</td><td>${item.team}</td><td>${row.type==='报溢'?'+':'-'}${item.qty}</td><td>${num(item.cost)}</td><td>${num(item.qty*item.cost)}</td><td>${item.detailReason}</td><td>${item.remark||'—'}</td></tr>`).join('')}</tbody></table></div></div><footer class="dialog-footer"><button class="btn" data-close>关闭</button></footer></section>`);return mask;}
  function openLog(row){modal(`<div class="transfer-log-dialog"><header class="transfer-log-header"><div><h2>操作日志</h2><span>损益单：${row.no}</span></div><button class="transfer-log-close" data-close>×</button></header><div class="transfer-log-body"><div class="transfer-log-table-card"><table class="transfer-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>${row.logs.map(log=>`<tr><td>${log.type}</td><td class="transfer-log-content">${escapeHtml(log.content)}</td><td>${log.operator}</td><td>${log.time}</td></tr>`).join('')}</tbody></table></div></div><footer class="transfer-log-footer"><span>共 ${row.logs.length} 条</span><div><button class="transfer-log-page" disabled>‹</button><button class="transfer-log-page active">1</button><button class="transfer-log-page" disabled>›</button></div></footer></div>`,'transfer-log-modal');}
  function confirmAction(title,text,onConfirm){const mask=modal(`<section class="dialog confirm-dialog"><header class="dialog-header"><div><h2>${title}</h2></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body confirm-body">${text}</div><footer class="dialog-footer"><button class="btn" data-close>取消</button><button class="btn danger" id="confirmAction">确认</button></footer></section>`);$('#confirmAction',mask).onclick=()=>{onConfirm();mask.remove();};}
  function voidRows(rows){const eligible=rows.filter(row=>['待审核','已驳回'].includes(row.status));if(!eligible.length){toast('所选单据不可作废');return;}confirmAction('作废损益单',`确定作废已选择的 ${eligible.length} 张损益单吗？`,()=>{eligible.forEach(row=>{row.status='已作废';row.logs.unshift({type:'作废',content:'作废损益单，未产生库存变动',operator:CURRENT_USER,time:now()});});state.selected.clear();render();toast('损益单已作废');});}
  function handleAction(action,row){if(action==='detail')openDetail(row);if(action==='edit')openEditor(row);if(action==='log')openLog(row);}
  function layoutQuery(){const card=$('#queryCard'),items=$$('.query-item:not(.query-action-item)',$('#queryGrid'));items.forEach(item=>item.classList.remove('query-overflow-item'));const tops=[];items.forEach(item=>{const top=Math.round(item.getBoundingClientRect().top);if(!tops.some(v=>Math.abs(v-top)<3))tops.push(top);if(tops.length>2)item.classList.add('query-overflow-item');});const overflow=items.some(item=>item.classList.contains('query-overflow-item'));$('#queryExpand').hidden=!overflow;if(!overflow){state.queryExpanded=false;card.classList.add('query-collapsed');}}
  function init(){setupMultis();render();$('#newBtn').onclick=()=>openEditor();$('#auditBtn').onclick=()=>openAudit(orders.filter(row=>state.selected.has(row.id)));$('#voidBtn').onclick=()=>voidRows(orders.filter(row=>state.selected.has(row.id)));$('#searchBtn').onclick=()=>{if(($('#startDate').value&&!$('#endDate').value)||(!$('#startDate').value&&$('#endDate').value)){toast('开始和结束日期必须同时填写');return;}if($('#startDate').value>$('#endDate').value&&$('#endDate').value){toast('开始日期不能晚于结束日期');return;}state.page=1;render();};$('#resetBtn').onclick=()=>{$$('#queryGrid input').forEach(input=>{if(!['checkbox'].includes(input.type))input.value='';});$('#skuType').value='sku';$('#skuText').placeholder='请输入SKU，支持输入多个，用逗号、空格或换行隔开';$('#typeQuery').value='';$('#timeType').value='createdAt';state.warehouses=[];state.teams=[];state.creators=[CURRENT_USER];setupMultis();render();toast('查询条件已重置');};$('#queryExpand').onclick=()=>{state.queryExpanded=!state.queryExpanded;$('#queryCard').classList.toggle('query-collapsed',!state.queryExpanded);$('.query-expand-text').textContent=state.queryExpanded?'收起':'展开';};$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;render();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;render();}};$('#nextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filtered().length/state.pageSize));if(state.page<pages){state.page++;render();}};$('#exportBtn').onclick=()=>toast(`已创建 ${filtered().length} 张损益单的导出任务`);$('#skuType').onchange=e=>$('#skuText').placeholder=`请输入${e.target.options[e.target.selectedIndex].text}，支持输入多个，用逗号、空格或换行隔开`;document.addEventListener('click',()=>{closeStripMenu();closeRemarkPopover();$$('.multi .dropdown.show').forEach(n=>n.classList.remove('show'));});window.addEventListener('resize',()=>{layoutQuery();$$('.editor-dialog').forEach(node=>syncSticky(node.parentElement));});requestAnimationFrame(()=>requestAnimationFrame(layoutQuery));}
  init();
})();
