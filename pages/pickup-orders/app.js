(()=>{
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const NOW='2026-10-31 10:30';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sum=(a,k)=>a.reduce((n,x)=>n+Number(x[k]||0),0);
  const split=v=>String(v||'').trim().toLowerCase().split(/[\s,，]+/).filter(Boolean);
  const money=v=>'¥'+Number(v||0).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});

  const SUPPLIER_WAREHOUSES={'JASIC 精密':['JASIC 精密一厂','JASIC 精密二厂'],'摩仕达':['摩仕达东莞仓']};
  const TARGET_WAREHOUSES=[{name:'华南物流中转仓',type:'物流商仓'},{name:'马士基深圳仓',type:'物流商仓'},{name:'平山自营仓',type:'自有仓'}];
  const TEAMS=['跨境A组','跨境B组','跨境C组','公共库存'];

  // pickedBefore 即采购单「已收货量」——本方案提货即收货，两者必然同值，不设冗余字段
  const purchasePool=[
    {key:'PO20260926018#1',po:'PO20260926018',sku:'HJ-WD-001',name:'数显焊机主机',team:'跨境A组',purchaseQty:600,pickedBefore:180,avail:420,price:1280,supplier:'JASIC 精密',wh:'JASIC 精密一厂'},
    {key:'PO20260928031#1',po:'PO20260928031',sku:'HJ-QG-032',name:'等离子割枪 5m',team:'跨境A组',purchaseQty:300,pickedBefore:60,avail:240,price:286,supplier:'JASIC 精密',wh:'JASIC 精密一厂'},
    {key:'PO20261002007#1',po:'PO20261002007',sku:'HJ-HM-108',name:'防风焊帽',team:'跨境B组',purchaseQty:240,pickedBefore:240,avail:0,price:42.5,supplier:'JASIC 精密',wh:'JASIC 精密二厂'},
    {key:'PO20261005012#1',po:'PO20261005012',sku:'HJ-WD-002',name:'逆变焊机 200A',team:'公共库存',purchaseQty:200,pickedBefore:0,avail:150,price:1680,supplier:'JASIC 精密',wh:'JASIC 精密一厂'},
    {key:'PO20260925009#1',po:'PO20260925009',sku:'HJ-DL-206',name:'焊接电缆 25mm²',team:'跨境B组',purchaseQty:420,pickedBefore:270,avail:150,price:18.8,supplier:'摩仕达',wh:'摩仕达东莞仓'},
    {key:'PO20261003019#1',po:'PO20261003019',sku:'HJ-QG-041',name:'等离子割嘴 1.5mm',team:'跨境A组',purchaseQty:500,pickedBefore:320,avail:180,price:26,supplier:'摩仕达',wh:'摩仕达东莞仓'}
  ];
  const poolFind=k=>purchasePool.find(x=>x.key===k);
  const poRemain=p=>p.purchaseQty-p.pickedBefore;
  const poReceiveState=p=>{const r=poRemain(p);return r<=0?{k:'done',t:'已收完'}:p.pickedBefore>0?{k:'partial',t:'部分收货'}:{k:'none',t:'未收货'}};
  const row=(key,planQty,picked=0,reconciled=0,before)=>{const s=poolFind(key);return {...s,planQty,picked,reconciled,...(before!=null?{pickedBefore:before}:{})}};
  const whType=name=>{const t=TARGET_WAREHOUSES.find(x=>x.name===name);return t?t.type:(/厂|东莞仓/.test(name)?'供应商仓':'自有仓')};

  let seq=6;
  const make=o=>Object.assign({status:'草稿',reconcile:'未对账',remark:'',expectedDate:'',completedAt:'—',batches:[],writebacks:[],logs:[]},o);
  const orders=[
    make({id:1,no:'TH20261010001',status:'待提货',supplier:'JASIC 精密',source:'JASIC 精密一厂',target:'华南物流中转仓',expectedDate:'2026-10-12',creator:'Admin',createdAt:'2026-10-10 09:32',remark:'美国西部仓本周补货',
      items:[row('PO20260926018#1',420),row('PO20260928031#1',240)],
      logs:[{type:'创建',content:'创建提货单，关联 2 张采购单',operator:'Admin',time:'2026-10-10 09:32'},{type:'提交',content:'提交提货单，锁定可提量 660 件',operator:'Admin',time:'2026-10-10 09:35'}]}),
    make({id:2,no:'TH20261009008',status:'部分提货',supplier:'摩仕达',source:'摩仕达东莞仓',target:'马士基深圳仓',expectedDate:'2026-10-10',creator:'张敏',createdAt:'2026-10-09 11:18',remark:'分两车提货',
      items:[row('PO20260925009#1',270,120,0,150)],
      batches:[{no:'TH20261009008-01',date:'2026-10-09 14:20',picker:'李晨',driver:'王师傅',phone:'138****6621',plate:'粤B·8H2K9',method:'自提',qty:120,receiver:'陈仓管',signedAt:'2026-10-09 16:40',skuCount:1}],
      writebacks:[{po:'PO20260925009',sku:'HJ-DL-206',name:'焊接电缆 25mm²',qty:120,before:150,after:270,total:420,batchNo:'TH20261009008-01',time:'2026-10-09 14:20'}],
      logs:[{type:'创建',content:'创建提货单',operator:'张敏',time:'2026-10-09 11:18'},{type:'提货',content:'第 1 批提货 120 件，提货仓：摩仕达东莞仓',operator:'李晨',time:'2026-10-09 14:20'},{type:'回写',content:'同步采购单 PO20260925009 收货量 +120，已收 270/420',operator:'系统',time:'2026-10-09 14:20'}]}),
    make({id:3,no:'TH20261008006',status:'已完成',supplier:'摩仕达',source:'摩仕达东莞仓',target:'平山自营仓',expectedDate:'2026-10-08',creator:'李晨',createdAt:'2026-10-08 09:05',completedAt:'2026-10-08 17:26',reconcile:'部分对账',remark:'入自有仓，后续调拨至物流仓',
      items:[row('PO20261003019#1',200,200,120,120)],
      batches:[{no:'TH20261008006-01',date:'2026-10-08 10:40',picker:'李晨',driver:'刘师傅',phone:'139****3087',plate:'粤S·3D7L2',method:'自提',qty:200,receiver:'平山仓 赵主管',signedAt:'2026-10-08 17:26',skuCount:1}],
      writebacks:[{po:'PO20261003019',sku:'HJ-QG-041',name:'等离子割嘴 1.5mm',qty:200,before:120,after:320,total:500,batchNo:'TH20261008006-01',time:'2026-10-08 17:26'}],
      logs:[{type:'创建',content:'创建提货单',operator:'李晨',time:'2026-10-08 09:05'},{type:'提货',content:'第 1 批提货 200 件',operator:'李晨',time:'2026-10-08 10:40'},{type:'回写',content:'同步采购单 PO20261003019 收货量 +200，已收 320/500',operator:'系统',time:'2026-10-08 10:40'},{type:'完成',content:'累计已提 200 件，达到计划数量，单据完成',operator:'系统',time:'2026-10-08 17:26'}]}),
    make({id:4,no:'TH20261007003',status:'已完成',supplier:'JASIC 精密',source:'JASIC 精密二厂',target:'华南物流中转仓',expectedDate:'2026-10-07',creator:'Admin',createdAt:'2026-10-07 08:40',completedAt:'2026-10-07 15:10',reconcile:'已对账',remark:'',
      items:[row('PO20261002007#1',240,240,240,0)],
      batches:[{no:'TH20261007003-01',date:'2026-10-07 09:30',picker:'张敏',driver:'黄师傅',phone:'137****9915',plate:'粤B·6K1M3',method:'供应商送仓',qty:240,receiver:'中转仓 周主管',signedAt:'2026-10-07 15:10',skuCount:1}],
      writebacks:[{po:'PO20261002007',sku:'HJ-HM-108',name:'防风焊帽',qty:240,before:0,after:240,total:240,batchNo:'TH20261007003-01',time:'2026-10-07 15:10'}],
      logs:[{type:'创建',content:'创建提货单',operator:'Admin',time:'2026-10-07 08:40'},{type:'提货',content:'第 1 批提货 240 件',operator:'张敏',time:'2026-10-07 09:30'},{type:'回写',content:'同步采购单 PO20261002007 收货量 +240，已收 240/240',operator:'系统',time:'2026-10-07 09:30'},{type:'完成',content:'累计已提 240 件，单据完成',operator:'系统',time:'2026-10-07 15:10'},{type:'对账',content:'纳入 10 月第 1 期对账，供应商出货单一致',operator:'财务 王会计',time:'2026-10-09 10:00'}]}),
    make({id:5,no:'TH20261010005',supplier:'JASIC 精密',source:'JASIC 精密一厂',target:'华南物流中转仓',creator:'Admin',createdAt:'2026-10-10 10:08',remark:'待补充预计提货日期',
      items:[row('PO20261005012#1',150)],
      logs:[{type:'创建',content:'创建提货单草稿',operator:'Admin',time:'2026-10-10 10:08'}]}),
    make({id:6,no:'TH20261006002',status:'已取消',supplier:'摩仕达',source:'摩仕达东莞仓',target:'马士基深圳仓',expectedDate:'2026-10-06',creator:'张敏',createdAt:'2026-10-06 15:40',remark:'供应商排产延期，取消提货',
      items:[row('PO20260925009#1',80,0,0,150)],
      logs:[{type:'创建',content:'创建提货单',operator:'张敏',time:'2026-10-06 15:40'},{type:'取消',content:'取消提货单，释放锁定可提量 80 件',operator:'张敏',time:'2026-10-07 09:12'}]})
  ];

  const STATUSES=['全部','草稿','待提货','部分提货','已完成','已取消'];
  const state={status:'全部',page:1,pageSize:10,expanded:new Set(),selected:new Set(),queryExpanded:false,editingId:null,editingItems:[]};
  const statusClass=s=>s==='草稿'?'draft':s==='待提货'?'pending':s==='部分提货'?'partial':s==='已完成'?'done':'cancelled';
  const reconcileClass=s=>s==='已对账'?'done':s==='部分对账'?'partial':'';

  function toast(msg){const n=$('#toast');n.textContent=msg;n.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove('show'),2200)}
  function modal(html,klass='modal-mask'){const mask=document.createElement('div');mask.className=klass+' ui-dialog-mask';mask.innerHTML=html;document.body.append(mask);$$('[data-close]',mask).forEach(b=>b.onclick=()=>mask.remove());return mask}

  function filtered(){
    const type=$('#codeType').value,keys=split($('#codeText').value),skuKeys=split($('#skuText').value);
    const supplier=$('#supplierQuery').value,source=$('#sourceWarehouseQuery').value,target=$('#targetWarehouseQuery').value;
    const ttype=$('#targetTypeQuery').value,reconcile=$('#reconcileQuery').value,creator=$('#creatorQuery').value,team=$('#teamQuery').value;
    const timeType=$('#timeType').value,start=$('#startDate').value,end=$('#endDate').value;
    return orders
      .filter(o=>state.status==='全部'||o.status===state.status)
      .filter(o=>!keys.length||keys.some(k=>{
        const hay=type==='no'?o.no:type==='batchNo'?o.batches.map(b=>b.no).join(' '):o.items.map(i=>i.po).join(' ');
        return String(hay).toLowerCase().includes(k)
      }))
      .filter(o=>!skuKeys.length||o.items.some(i=>skuKeys.some(k=>`${i.sku} ${i.name}`.toLowerCase().includes(k))))
      .filter(o=>!supplier||o.supplier===supplier)
      .filter(o=>!source||o.source===source)
      .filter(o=>!target||o.target===target)
      .filter(o=>!ttype||whType(o.target)===ttype)
      .filter(o=>!reconcile||o.reconcile===reconcile)
      .filter(o=>!team||o.items.some(i=>i.team===team))
      .filter(o=>!creator||o.creator===creator)
      .filter(o=>!start||String(o[timeType]||'').slice(0,10)>=start)
      .filter(o=>!end||String(o[timeType]||'').slice(0,10)<=end);
  }

  function renderTabs(){
    const box=$('#statusTabs');
    box.innerHTML=STATUSES.map(s=>`<button class="status-tab ${state.status===s?'active':''}" data-status="${s}">${s}<em>${s==='全部'?orders.length:orders.filter(o=>o.status===s).length}</em></button>`).join('');
    $$('[data-status]',box).forEach(b=>b.onclick=()=>{state.status=b.dataset.status;state.page=1;render()});
  }

  function detailRows(o){
    return `<tr class="detail-row"><td colspan="11"><div class="detail-wrap"><table class="pickup-detail-table"><thead><tr><th>SKU</th><th>产品名称</th><th>采购单号</th><th>入库团队</th><th>采购数量</th><th>提货前已收</th><th>本单计划</th><th>本单已提</th><th>回写后已收</th><th>差异</th><th>提货仓</th></tr></thead><tbody>${
      o.items.map(i=>{const diff=i.planQty-i.picked,after=i.pickedBefore+i.picked;return `<tr><td>${esc(i.sku)}</td><td>${esc(i.name)}</td><td>${esc(i.po)}</td><td><span class="team-tag">${esc(i.team||'待指定')}</span></td><td>${i.purchaseQty}</td><td>${i.pickedBefore}</td><td>${i.planQty}</td><td class="qty-positive">${i.picked}</td><td class="${i.picked>0?'qty-writeback':''}">${after} / ${i.purchaseQty}</td><td class="${diff>0&&o.status==='已完成'?'shortage':''}">${diff}</td><td>${esc(i.wh)}</td></tr>`}).join('')
    }</tbody></table></div></td></tr>`;
  }

  function actions(o){
    if(o.status==='草稿')return `<button class="link" data-action="detail">查看</button><button class="link" data-action="edit">编辑</button><button class="link" data-action="submit">提交</button><button class="link danger-link" data-action="cancel">作废</button><button class="link log-link" data-action="log">日志</button>`;
    if(o.status==='待提货')return `<button class="link" data-action="detail">查看</button><button class="link" data-action="execute">确认提货</button><button class="link danger-link" data-action="cancel">取消</button><button class="link log-link" data-action="log">日志</button>`;
    if(o.status==='部分提货')return `<button class="link" data-action="detail">查看</button><button class="link" data-action="execute">继续提货</button><button class="link log-link" data-action="log">日志</button>`;
    return `<button class="link" data-action="detail">查看</button><button class="link log-link" data-action="log">日志</button>`;
  }

  function render(){
    renderTabs();
    const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/state.pageSize));
    state.page=Math.min(state.page,pages);
    const shown=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
    $('#tableBody').innerHTML=shown.map(o=>{
      const plan=sum(o.items,'planQty'),picked=sum(o.items,'picked'),reconciled=sum(o.items,'reconciled');
      const diff=plan-picked,pos=[...new Set(o.items.map(i=>i.po))],ttype=whType(o.target);
      const teams=[...new Set(o.items.map(i=>i.team||'待指定'))];
      const teamText=teams.length===1?teams[0]:`${teams[0]} 等 ${teams.length} 个团队`;
      return `<tr data-id="${o.id}"><td><input class="row-check" type="checkbox" ${state.selected.has(o.id)?'checked':''}></td><td><button class="document-expand ${state.expanded.has(o.id)?'expanded':''}" data-action="expand" aria-label="展开明细"></button></td>
<td><div class="doc-line"><span class="doc-no">${esc(o.no)}</span><span class="pickup-status status-${statusClass(o.status)}">${o.status}</span></div><div class="field-line"><span class="field-label">预计提货：</span><span class="field-value">${o.expectedDate||'—'}</span></div></td>
<td><div class="field-line"><span class="field-label">供应商：</span><span class="field-value">${esc(o.supplier)}</span><span class="reconcile-tag">${ttype==='物流商仓'?'物流仓':ttype}</span></div><div class="field-line" title="${esc(o.source)} → ${esc(o.target)}"><span class="field-value">${esc(o.source)}<span class="route-arrow">→</span>${esc(o.target)}</span></div></td>
<td><div class="field-line"><span class="field-label">采购单：</span><span class="field-value" title="${pos.join('、')}">${pos[0]}${pos.length>1?` 等 ${pos.length} 张`:''}</span></div><div class="field-line" title="入库团队：${esc(teams.join('、'))}"><span class="field-label">团队：</span><span class="field-value">${esc(teamText)}</span><span class="sku-count">${o.items.length} SKU</span></div></td>
<td><div class="field-line"><span class="field-label">计划/已提：</span><span>${plan}/${picked}</span></div><div class="field-line"><span class="field-label">差异：</span><span class="${diff>0&&o.status==='已完成'?'shortage':''}">${diff}</span></div></td>
<td><div class="field-line"><span class="reconcile-tag ${reconcileClass(o.reconcile)}">${o.reconcile}</span></div><div class="field-line"><span class="field-label">已对账：</span><span>${reconciled}/${picked}</span></div></td>
<td><span class="field-value" title="${esc(o.remark)}">${esc(o.remark||'—')}</span></td>
<td><div class="field-line"><span class="field-label">创建人：</span><span>${esc(o.creator)}</span></div><div class="field-line"><span class="field-value">${esc(o.createdAt)}</span></div></td>
<td><div class="action-links">${actions(o)}</div></td></tr>${state.expanded.has(o.id)?detailRows(o):''}`;
    }).join('');
    $('#empty').hidden=rows.length>0;
    $('#totalCount').textContent=rows.length;
    $('#selectedCount').textContent=state.selected.size;
    $('#pageButtons').innerHTML=`<button class="page-btn active">${state.page}</button>`;
    bindRows();
  }

  function bindRows(){
    $$('#tableBody>tr[data-id]').forEach(tr=>{
      const o=orders.find(x=>x.id===Number(tr.dataset.id));
      const c=$('.row-check',tr);
      if(c)c.onchange=e=>{e.target.checked?state.selected.add(o.id):state.selected.delete(o.id);render()};
      $$('[data-action]',tr).forEach(b=>b.onclick=()=>handle(b.dataset.action,o));
    });
  }

  const nextNo=()=>`TH20261010${String(++seq).padStart(3,'0')}`;

  function editorRow(i,idx,editable){
    const remain=i.purchaseQty-i.pickedBefore;
    const teamCell=editable
      ? `<select class="control editor-team" data-team-idx="${idx}">${TEAMS.map(t=>`<option ${i.team===t?'selected':''}>${t}</option>`).join('')}</select>`
      : `<span class="team-tag">${esc(i.team||'待指定')}</span>`;
    return `<tr data-idx="${idx}"><td>${esc(i.sku)}</td><td class="product">${esc(i.name)}</td><td>${esc(i.po)}</td><td>${teamCell}</td><td>${i.purchaseQty}</td><td>${i.pickedBefore}</td><td>${remain}</td><td>${i.avail}</td><td><input class="control editor-qty" type="number" min="1" max="${Math.min(remain,i.avail)}" value="${i.planQty}"></td><td>${editable?'<button class="link remove">移除</button>':''}</td></tr>`;
  }

  function itemsTable(items,editable){
    if(!items.length)return '<div class="empty" style="padding:40px 0;color:#909399;text-align:center">尚未选择采购单，请点击「选择采购单」添加提货明细</div>';
    return `<table class="pickup-editor-table"><thead><tr><th>SKU</th><th>产品名称</th><th>采购单号</th><th>入库团队</th><th>采购数量</th><th>已收货</th><th>剩余可提</th><th>仓内可用</th><th>本次提货</th><th>操作</th></tr></thead><tbody>${items.map((i,n)=>editorRow(i,n,editable)).join('')}</tbody></table>`;
  }

  function refreshEditorSummary(mask){
    const items=state.editingItems;
    const plan=sum(items,'planQty'),amount=items.reduce((n,i)=>n+i.planQty*i.price,0);
    const el=$('.footer-summary',mask);
    if(el)el.innerHTML=`已选 <b>${items.length}</b> 个 SKU，计划提货 <b>${plan}</b> 件，货值 <b>${money(amount)}</b>`;
    const wrap=$('.pickup-items-wrap',mask);
    if(wrap){
      wrap.innerHTML=itemsTable(items,true);
      $$('.editor-qty',wrap).forEach((inp,n)=>inp.oninput=e=>{
        const i=items[n],max=Math.min(i.purchaseQty-i.pickedBefore,i.avail);
        let v=Math.round(Number(e.target.value)||0);
        if(v<0)v=0;if(v>max){v=max;e.target.value=max;toast(`${i.sku} 本次提货不得超过 ${max} 件`)}
        i.planQty=v;refreshEditorSummary(mask);
      });
      $$('.remove',wrap).forEach((b,n)=>b.onclick=()=>{items.splice(n,1);refreshEditorSummary(mask)});
      wrap.onchange=e=>{const sel=e.target;if(sel&&sel.matches&&sel.matches('select.editor-team'))items[Number(sel.dataset.teamIdx)].team=sel.value;};
    }
  }

  function openEditor(row){
    state.editingId=row?row.id:null;
    state.editingItems=row?row.items.map(i=>({...i})):[];
    const supplier=row?row.supplier:'',source=row?row.source:'',target=row?row.target:'';
    const ttype=target?whType(target):'';
    const supOpts=['JASIC 精密','摩仕达'].map(s=>`<option ${supplier===s?'selected':''}>${s}</option>`).join('');
    const srcOpts=(SUPPLIER_WAREHOUSES[supplier]||[]).map(w=>`<option ${source===w?'selected':''}>${w}</option>`).join('');
    const tgtOpts=TARGET_WAREHOUSES.map(t=>`<option ${target===t.name?'selected':''}>${t.name}</option>`).join('');
    const mask=modal(`<section class="ui-dialog pickup-dialog"><header class="ui-dialog__header"><div><h2>${row?'编辑':'新建'}提货单</h2><p>从供应商仓提货至我方自有仓或物流商仓</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<section class="ui-form-card pickup-form-card"><div class="ui-form-grid pickup-form-grid">
<label class="ui-field"><span class="ui-field__label"><em class="ui-field__required">*</em>供应商</span><select class="control" id="fSupplier"><option value="">请选择</option>${supOpts}</select></label>
<label class="ui-field"><span class="ui-field__label"><em class="ui-field__required">*</em>提货仓</span><select class="control" id="fSource"><option value="">请先选择供应商</option>${srcOpts}</select></label>
<label class="ui-field"><span class="ui-field__label"><em class="ui-field__required">*</em>目标仓</span><select class="control" id="fTarget"><option value="">请选择</option>${tgtOpts}</select></label>
<label class="ui-field"><span class="ui-field__label">目标仓类型</span><input class="control" id="fTargetType" value="${ttype}" placeholder="随目标仓自动带出" readonly></label>
<label class="ui-field"><span class="ui-field__label"><em class="ui-field__required">*</em>预计提货日期</span><input class="control" id="fExpected" type="date" value="${row?row.expectedDate||'':''}"></label>
<label class="ui-field"><span class="ui-field__label">备注</span><input class="control" id="fRemark" maxlength="200" value="${esc(row?row.remark:'')}" placeholder="最多 200 字"></label>
</div></section>
<section class="pickup-items-card"><div class="pickup-items-toolbar"><strong>提货明细</strong><button class="btn" id="pickPurchase">选择采购单</button><button class="btn" id="fillMax">按上限填充</button></div><div class="pickup-hint">入库团队默认继承采购单行，决定货入仓后的货权归属；确认提货时按本单数量同步回写采购单收货量。</div><div class="pickup-items-wrap">${itemsTable(state.editingItems,true)}</div></section>
</div><footer class="ui-dialog__footer"><div class="footer-summary"></div><div class="footer-actions"><button class="btn" data-close>取消</button><button class="btn" id="saveDraft">保存草稿</button><button class="btn primary" id="submitOrder">提交</button></div></footer></section>`);

    $('#fSupplier',mask).onchange=e=>{
      const s=e.target.value,list=SUPPLIER_WAREHOUSES[s]||[];
      $('#fSource',mask).innerHTML=`<option value="">${list.length?'请选择':'请先选择供应商'}</option>`+list.map(w=>`<option>${w}</option>`).join('');
    };
    $('#fTarget',mask).onchange=e=>{$('#fTargetType',mask).value=whType(e.target.value)};
    $('#fillMax',mask).onclick=()=>{
      state.editingItems.forEach(i=>{i.planQty=Math.min(i.purchaseQty-i.pickedBefore,i.avail)});
      refreshEditorSummary(mask);toast('已按可提上限填充');
    };
    $('#pickPurchase',mask).onclick=()=>openPicker(mask);
    refreshEditorSummary(mask);
    $$('.editor-qty',mask).forEach((inp,n)=>inp.oninput=e=>{
      const i=state.editingItems[n],max=Math.min(i.purchaseQty-i.pickedBefore,i.avail);
      let v=Math.round(Number(e.target.value)||0);
      if(v<0)v=0;if(v>max){v=max;e.target.value=max;toast(`${i.sku} 本次提货不得超过 ${max} 件`)}
      i.planQty=v;refreshEditorSummary(mask);
    });
    $$('.remove',mask).forEach((b,n)=>b.onclick=()=>{state.editingItems.splice(n,1);refreshEditorSummary(mask)});

    const collect=()=>{
      const supplier=$('#fSupplier',mask).value,source=$('#fSource',mask).value,target=$('#fTarget',mask).value,expected=$('#fExpected',mask).value;
      if(!supplier)return toast('请选择供应商'),null;
      if(!source)return toast('请选择提货仓'),null;
      if(!target)return toast('请选择目标仓'),null;
      if(!expected)return toast('请选择预计提货日期'),null;
      if(!state.editingItems.length)return toast('请选择采购单添加提货明细'),null;
      if(state.editingItems.some(i=>i.planQty<=0))return toast('提货数量必须大于 0'),null;
      const bad=state.editingItems.find(i=>i.planQty>Math.min(i.purchaseQty-i.pickedBefore,i.avail));
      if(bad)return toast(`${bad.sku} 提货数量超出可提上限`),null;
      return {supplier,source,target,expected,remark:$('#fRemark',mask).value};
    };
    const save=(status)=>{
      const d=collect();if(!d)return;
      const items=state.editingItems.map(i=>({...i,planQty:i.planQty}));
      if(state.editingId){
        const o=orders.find(x=>x.id===state.editingId);
        Object.assign(o,{supplier:d.supplier,source:d.source,target:d.target,expectedDate:d.expected,remark:d.remark,items});
        if(status==='待提货'&&(o.status==='草稿'||o.status==='已作废'))o.status='待提货';
        o.logs.unshift({type:'编辑',content:`编辑提货单，计划提货 ${sum(items,'planQty')} 件${status==='待提货'?'并提交':''}`,operator:'Admin',time:NOW});
        toast(status==='待提货'?'提货单已提交':'提货单已更新');
      }else{
        orders.unshift(make({id:Date.now(),no:nextNo(),supplier:d.supplier,source:d.source,target:d.target,expectedDate:d.expected,remark:d.remark,creator:'Admin',createdAt:NOW,status,items,
          logs:[{type:'创建',content:status==='待提货'?`创建并提交提货单，计划提货 ${sum(items,'planQty')} 件`:'创建提货单草稿',operator:'Admin',time:NOW}]}));
        toast(status==='待提货'?'提货单已提交':'提货单草稿已创建');
      }
      mask.remove();state.page=1;render();
    };
    $('#saveDraft',mask).onclick=()=>save('草稿');
    $('#submitOrder',mask).onclick=()=>save('待提货');
  }

  function openPicker(parent){
    const supplier=$('#fSupplier',parent).value;
    const mask=modal(`<section class="ui-dialog execute-dialog"><header class="ui-dialog__header"><div><h2>选择采购单</h2><p>${supplier?'当前供应商：'+esc(supplier):'仅展示提货型供应商的待收货采购明细'}</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<div class="pickup-items-wrap" style="flex:1"><table class="execute-table"><thead><tr><th><input type="checkbox" id="pickAll"></th><th>SKU</th><th>产品名称</th><th>采购单号</th><th>入库团队</th><th>采购数量</th><th>已收货</th><th>剩余可提</th><th>收货状态</th><th>提货仓</th><th>提货仓可用</th></tr></thead><tbody>${
      purchasePool.filter(p=>!supplier||p.supplier===supplier).map(p=>{
        const added=state.editingItems.some(i=>i.key===p.key),remain=poRemain(p),rs=poReceiveState(p),dead=remain<=0;
        return `<tr data-key="${p.key}" class="${dead?'row-done':''}"><td><input type="checkbox" class="pick-check" ${added?'checked disabled':''} ${dead?'disabled':''}></td><td>${esc(p.sku)}</td><td class="product">${esc(p.name)}</td><td>${esc(p.po)}</td><td><span class="team-tag">${esc(p.team)}</span></td><td>${p.purchaseQty}</td><td>${p.pickedBefore}</td><td>${remain}</td><td><span class="po-state po-${rs.k}">${rs.t}</span></td><td>${esc(p.wh)}</td><td>${p.avail}</td></tr>`}).join('')
    }</tbody></table></div></div><footer class="ui-dialog__footer"><div class="footer-summary">仅展示提货型供应商的待收货采购明细；已收完的采购行不可再提</div><div class="footer-actions"><button class="btn" data-close>取消</button><button class="btn primary" id="pickConfirm">确定</button></div></footer></section>`);
    $('#pickAll',mask).onchange=e=>$$('.pick-check:not(:disabled)',mask).forEach(c=>c.checked=e.target.checked);
    $('#pickConfirm',mask).onclick=()=>{
      const picked=$$('tbody tr',mask).filter(tr=>{const c=$('.pick-check',tr);return c&&c.checked&&!c.disabled});
      if(!picked.length)return toast('请勾选需要提货的采购明细');
      picked.forEach(tr=>{
        const p=poolFind(tr.dataset.key);
        state.editingItems.push({...p,planQty:Math.max(0,Math.min(poRemain(p),p.avail)),picked:0,reconciled:0});
      });
      mask.remove();refreshEditorSummary(parent);toast(`已加入 ${picked.length} 条采购明细`);
    };
  }

  function openExecute(o){
    const remain=o.items.filter(i=>i.picked<i.planQty);
    if(!remain.length)return toast('该提货单已无可提数量');
    const mask=modal(`<section class="ui-dialog execute-dialog"><header class="ui-dialog__header"><div><h2>确认提货｜${esc(o.no)}</h2><p>录入本批次实际提货数量与交接信息</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<div class="execute-summary"><div><span>供应商</span><b>${esc(o.supplier)}</b></div><div><span>提货仓</span><b>${esc(o.source)}</b></div><div><span>目标仓</span><b>${esc(o.target)}（${whType(o.target)}）</b></div><div><span>剩余待提</span><b>${sum(o.items,'planQty')-sum(o.items,'picked')} 件</b></div></div>
<div class="execute-table-wrap" style="max-height:300px"><table class="execute-table"><thead><tr><th>SKU</th><th>产品名称</th><th>采购单号</th><th>入库团队</th><th>剩余可提</th><th>提货仓可用</th><th>本批次提货</th></tr></thead><tbody>${
      remain.map(i=>`<tr data-sku="${esc(i.sku)}" data-key="${esc(i.key)}"><td>${esc(i.sku)}</td><td class="product">${esc(i.name)}</td><td>${esc(i.po)}</td><td><span class="team-tag">${esc(i.team||'待指定')}</span></td><td>${i.planQty-i.picked}</td><td>${i.avail}</td><td><input class="execute-qty" type="number" min="0" max="${Math.min(i.planQty-i.picked,i.avail)}" value="${Math.min(i.planQty-i.picked,i.avail)}"></td></tr>`).join('')
    }</tbody></table></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px">
<label class="ui-field"><span class="ui-field__label">提货日期</span><input class="control" id="bDate" type="date" value="2026-10-31"></label>
<label class="ui-field"><span class="ui-field__label">提货人</span><input class="control" id="bPicker" value="Admin"></label>
<label class="ui-field"><span class="ui-field__label">司机姓名</span><input class="control" id="bDriver" placeholder="选填"></label>
<label class="ui-field"><span class="ui-field__label">联系电话</span><input class="control" id="bPhone" placeholder="选填"></label>
<label class="ui-field"><span class="ui-field__label">车牌号</span><input class="control" id="bPlate" placeholder="选填"></label>
<label class="ui-field"><span class="ui-field__label">运输方式</span><select class="control" id="bMethod"><option>自提</option><option>供应商送仓</option><option>第三方物流</option></select></label>
<label class="ui-field"><span class="ui-field__label">签收人</span><input class="control" id="bReceiver" placeholder="选填"></label>
<label class="ui-field"><span class="ui-field__label">备注</span><input class="control" id="bRemark" placeholder="选填"></label>
</div>
<div class="execute-tip"><b>库存与单据动作：</b>提货仓「${esc(o.source)}」对应 SKU 在库量减少，目标仓「${esc(o.target)}」按明细的入库团队增加；同时按本批次数量<b>回写采购单收货量</b>，采购单收货状态自动更新，无需人工再收货。${o.status==='部分提货'?'本单已存在提货批次，本次为追加批次。':'提交后单据流转为「部分提货」，提满后自动完成。'}</div>
<div class="writeback-preview" id="wbPreview"></div>
</div><footer class="ui-dialog__footer"><div class="footer-summary">本次提货 <b class="live-total">0</b> 件 · 回写采购单 <b class="live-po">0</b> 张</div><div class="footer-actions"><button class="btn" data-close>取消</button><button class="btn primary" id="confirmExecute">确认提货</button></div></footer></section>`);

    const total=()=>$$('.execute-qty',mask).reduce((n,i)=>n+(Number(i.value)||0),0);
    const preview=()=>{
      const live=$('.live-total',mask);if(live)live.textContent=total();
      const pos=new Set(),rows=[];
      $$('.execute-qty',mask).forEach(inp=>{
        const tr=inp.closest('tr'),key=tr.dataset.key,qty=Number(inp.value)||0;
        if(qty<=0)return;
        const p=poolFind(key);if(!p)return;
        pos.add(p.po);
        const after=Math.min(p.purchaseQty,p.pickedBefore+qty);
        rows.push(`<span class="wb-chip">${esc(p.po)} <em>+${qty}</em> → 已收 ${after}/${p.purchaseQty}${p.pickedBefore+qty>=p.purchaseQty?' · 收完':''}</span>`);
      });
      const poEl=$('.live-po',mask);if(poEl)poEl.textContent=pos.size;
      const box=$('#wbPreview',mask);
      if(box)box.innerHTML=rows.length?`<div class="wb-title">采购单回写预览</div>${rows.join('')}`:'';
    };
    $$('.execute-qty',mask).forEach(i=>i.oninput=preview);
    preview();

    $('#confirmExecute',mask).onclick=()=>{
      const rows=$$('tbody tr',mask),picks=[];
      for(const tr of rows){
        const i=o.items.find(x=>x.key===tr.dataset.key);
        const v=Number($('.execute-qty',tr).value),max=Math.min(i.planQty-i.picked,i.avail);
        if(!Number.isInteger(v)||v<0||v>max)return toast(`${i.sku} 的提货数量需为 0~${max} 的整数`);
        if(v>0)picks.push({item:i,qty:v});
      }
      if(!picks.length)return toast('本批次提货数量不能全部为 0');
      const date=$('#bDate',mask).value;
      if(!date)return toast('请选择提货日期');
      const totalQty=picks.reduce((n,p)=>n+p.qty,0);
      const batchNo=`${o.no}-${String(o.batches.length+1).padStart(2,'0')}`;
      picks.forEach(p=>{p.item.picked+=p.qty;p.item.avail-=p.qty});
      // 关键：回写采购单收货量（提货即收货），并同步扣减供应商仓可用
      const affected=[];
      picks.forEach(({item,qty})=>{
        const pool=poolFind(item.key);
        if(!pool)return;
        const before=pool.pickedBefore;
        pool.pickedBefore=Math.min(pool.purchaseQty,before+qty);
        pool.avail=Math.max(0,pool.avail-qty);
        affected.push({po:pool.po,sku:pool.sku,name:pool.name,qty,before,after:pool.pickedBefore,total:pool.purchaseQty,batchNo,time:`${date} ${NOW.slice(11)}`});
      });
      o.batches.push({no:batchNo,date:`${date} ${NOW.slice(11)}`,picker:$('#bPicker',mask).value||'—',driver:$('#bDriver',mask).value||'—',phone:$('#bPhone',mask).value||'—',plate:$('#bPlate',mask).value||'—',method:$('#bMethod',mask).value,qty:totalQty,receiver:$('#bReceiver',mask).value||'—',signedAt:'—',skuCount:picks.length});
      o.writebacks.push(...affected);
      const allDone=o.items.every(i=>i.picked>=i.planQty);
      o.status=allDone?'已完成':'部分提货';
      if(allDone){o.completedAt=NOW;o.logs.unshift({type:'完成',content:`累计已提 ${sum(o.items,'picked')} 件，达到计划数量，单据完成`,operator:'系统',time:NOW})}
      if(affected.length)o.logs.unshift({type:'回写',content:`同步采购单收货量：${affected.map(a=>`${a.po} +${a.qty}（已收 ${a.after}/${a.total}）`).join('；')}`,operator:'系统',time:`${date} ${NOW.slice(11)}`});
      const donePOs=affected.filter(a=>a.after>=a.total);
      o.logs.unshift({type:'提货',content:`第 ${o.batches.length} 批提货 ${totalQty} 件，提货仓：${o.source}，入 ${o.target}`,operator:$('#bPicker',mask).value||'Admin',time:`${date} ${NOW.slice(11)}`});
      mask.remove();render();
      toast(donePOs.length?`提货成功 ${totalQty} 件，${donePOs.map(a=>a.po).join('、')} 已收完`: `提货成功 ${totalQty} 件，已回写 ${affected.length} 行采购收货量`);
    };
  }

  function openDetail(o){
    const plan=sum(o.items,'planQty'),picked=sum(o.items,'picked'),reconciled=sum(o.items,'reconciled');
    const teams=[...new Set(o.items.map(i=>i.team||'待指定'))];
    const batchRows=o.batches.length?o.batches.map(b=>`<tr><td>${esc(b.no)}</td><td>${esc(b.date)}</td><td>${esc(b.picker)}</td><td>${esc(b.driver)} / ${esc(b.plate)}</td><td>${esc(b.method)}</td><td>${b.qty}</td><td>${esc(b.receiver)}</td></tr>`).join(''):'<tr><td colspan="7" style="text-align:center;color:#909399">暂无提货批次</td></tr>';
    const wbRows=o.writebacks.length?o.writebacks.map(w=>{
      const done=w.after>=w.total;
      return `<tr><td>${esc(w.po)}</td><td><span class="team-tag">${esc(w.sku)}</span></td><td class="qty-writeback">+${w.qty}</td><td>${w.before}</td><td>${w.after} / ${w.total}</td><td><span class="po-state po-${done?'done':'partial'}">${done?'已收完':'部分收货'}</span></td><td>${esc(w.batchNo)}</td><td>${esc(w.time)}</td></tr>`
    }).join(''):'<tr><td colspan="8" style="text-align:center;color:#909399">尚未提货，采购单收货量不会变化</td></tr>';
    modal(`<section class="ui-dialog detail-dialog"><header class="ui-dialog__header"><div><h2>提货单详情</h2><p>${esc(o.no)}</p></div><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body">
<div class="detail-grid">${[
      ['提货单号',o.no],['单据状态',o.status],['供应商',o.supplier],['提货仓',o.source],['目标仓',`${o.target}（${whType(o.target)}）`],
      ['入库团队',teams.length===1?teams[0]:`${teams.length} 个团队：${teams.join('、')}`],
      ['计划提货',plan+' 件'],['实际已提',picked+' 件'],['差异数量',(plan-picked)+' 件'],['对账状态',o.reconcile],
      ['预计提货日期',o.expectedDate||'—'],['创建信息',`${o.creator} / ${o.createdAt}`],['完成时间',o.completedAt]
    ].map(([l,v])=>`<div class="detail-field"><label>${l}</label><span>${esc(v)}</span></div>`).join('')}
<div class="detail-field wide"><label>备注</label><span>${esc(o.remark||'—')}</span></div></div>
<section class="detail-section"><div class="detail-section-title">提货明细</div><div class="ui-table-wrap"><table class="pickup-detail-table"><thead><tr><th>SKU</th><th>产品名称</th><th>采购单号</th><th>入库团队</th><th>采购数量</th><th>提货前已收</th><th>本单计划</th><th>本单已提</th><th>回写后已收</th><th>差异</th><th>提货仓</th></tr></thead><tbody>${
      o.items.map(i=>{const d=i.planQty-i.picked,after=i.pickedBefore+i.picked;return `<tr><td>${esc(i.sku)}</td><td>${esc(i.name)}</td><td>${esc(i.po)}</td><td><span class="team-tag">${esc(i.team||'待指定')}</span></td><td>${i.purchaseQty}</td><td>${i.pickedBefore}</td><td>${i.planQty}</td><td>${i.picked}</td><td class="${i.picked>0?'qty-writeback':''}">${after} / ${i.purchaseQty}</td><td class="${d>0&&o.status==='已完成'?'shortage':''}">${d}</td><td>${esc(i.wh)}</td></tr>`}).join('')
    }</tbody></table></div></section>
<section class="detail-section"><div class="detail-section-title">采购单回写（${o.writebacks.length}）</div><div class="ui-table-wrap"><table class="pickup-detail-table"><thead><tr><th>采购单号</th><th>SKU</th><th>本批回写</th><th>回写前已收</th><th>回写后已收</th><th>收货状态</th><th>提货批次</th><th>回写时间</th></tr></thead><tbody>${wbRows}</tbody></table></div></section>
<section class="detail-section"><div class="detail-section-title">提货批次（${o.batches.length}）</div><div class="ui-table-wrap"><table class="pickup-detail-table"><thead><tr><th>批次号</th><th>提货日期</th><th>提货人</th><th>司机 / 车牌</th><th>运输方式</th><th>件数</th><th>签收人</th></tr></thead><tbody>${batchRows}</tbody></table></div></section>
<section class="detail-section"><div class="detail-section-title">对账信息</div><div class="ui-table-wrap"><table class="pickup-detail-table"><thead><tr><th>对账状态</th><th>已对账数量</th><th>未对账数量</th><th>货值（按采购单价）</th></tr></thead><tbody><tr><td>${o.reconcile}</td><td>${reconciled}</td><td>${picked-reconciled}</td><td>${money(o.items.reduce((n,i)=>n+i.picked*i.price,0))}</td></tr></tbody></table></div></section>
</div><footer class="ui-dialog__footer"><div class="footer-summary">共 ${o.items.length} 个 SKU，${o.batches.length} 个提货批次</div><div class="footer-actions"><button class="btn" data-close>关闭</button></div></footer></section>`);
  }

  function openLog(o){
    modal(`<div class="transfer-log-dialog"><header class="transfer-log-header"><div><h2>操作日志</h2><span>提货单：${esc(o.no)}</span></div><button class="transfer-log-close" data-close>×</button></header><div class="transfer-log-body"><div class="transfer-log-table-card"><table class="transfer-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>${o.logs.map(l=>`<tr><td>${esc(l.type)}</td><td class="transfer-log-content">${esc(l.content)}</td><td>${esc(l.operator)}</td><td>${esc(l.time)}</td></tr>`).join('')}</tbody></table></div></div><footer class="transfer-log-footer"><span>共 ${o.logs.length} 条</span><div><button class="transfer-log-page" disabled>‹</button><button class="transfer-log-page active">1</button><button class="transfer-log-page" disabled>›</button></div></footer></div>`,'transfer-log-modal');
  }

  function confirmAction(title,text,fn){
    const mask=modal(`<section class="ui-dialog confirm-dialog"><header class="ui-dialog__header"><h2>${title}</h2><button class="ui-dialog__close" data-close>×</button></header><div class="ui-dialog__body confirm-body">${text}</div><footer class="ui-dialog__footer"><button class="btn" data-close>取消</button><button class="btn danger" id="confirmAction">确认</button></footer></section>`);
    $('#confirmAction',mask).onclick=()=>{fn();mask.remove()};
  }

  function handle(action,o){
    if(action==='expand'){state.expanded.has(o.id)?state.expanded.delete(o.id):state.expanded.add(o.id);render()}
    if(action==='detail')openDetail(o);
    if(action==='edit')openEditor(o);
    if(action==='execute')openExecute(o);
    if(action==='log')openLog(o);
    if(action==='submit'){
      if(!o.items.length)return toast('提货明细为空，无法提交');
      o.status='待提货';
      o.logs.unshift({type:'提交',content:`提交提货单，锁定可提量 ${sum(o.items,'planQty')} 件`,operator:'Admin',time:NOW});
      render();toast('提货单已提交');
    }
    if(action==='cancel'){
      if(o.status==='草稿'){
        confirmAction('作废提货单',`确定作废 ${o.no} 吗？作废后不可恢复。`,()=>{
          o.status='已作废';o.logs.unshift({type:'作废',content:'作废提货单草稿',operator:'Admin',time:NOW});render();toast('提货单已作废');
        });
      }else if(o.status==='待提货'){
        confirmAction('取消提货单',`确定取消 ${o.no} 吗？将释放锁定可提量 ${sum(o.items,'planQty')} 件，未发生库存变动。`,()=>{
          o.status='已取消';o.logs.unshift({type:'取消',content:`取消提货单，释放锁定可提量 ${sum(o.items,'planQty')} 件`,operator:'Admin',time:NOW});render();toast('提货单已取消');
        });
      }else{
        toast('已发生提货的提货单不允许取消，请通过提货数量调整处理');
      }
    }
  }

  function layoutQuery(){
    const card=$('#queryCard'),items=$$('.query-item:not(.query-action-item)',$('#queryGrid'));
    items.forEach(i=>i.classList.remove('query-overflow-item'));
    const tops=[];
    items.forEach(i=>{const top=Math.round(i.getBoundingClientRect().top);if(!tops.some(v=>Math.abs(v-top)<3))tops.push(top);if(tops.length>2)i.classList.add('query-overflow-item')});
    const overflow=items.some(i=>i.classList.contains('query-overflow-item'));
    $('#queryExpand').hidden=!overflow;
    if(!overflow){state.queryExpanded=false;card.classList.add('query-collapsed')}
  }

  $('#newBtn').onclick=()=>openEditor();
  $('#searchBtn').onclick=()=>{
    if(($('#startDate').value&&!$('#endDate').value)||(!$('#startDate').value&&$('#endDate').value))return toast('请选择完整的时间范围');
    if($('#startDate').value&&$('#endDate').value&&$('#startDate').value>$('#endDate').value)return toast('开始日期不能晚于结束日期');
    state.page=1;render();toast('查询完成');
  };
  $('#resetBtn').onclick=()=>{$$('#queryGrid input').forEach(i=>i.value='');$$('#queryGrid select').forEach(s=>s.selectedIndex=0);state.status='全部';render();toast('查询条件已重置')};
  $('#queryExpand').onclick=()=>{state.queryExpanded=!state.queryExpanded;$('#queryCard').classList.toggle('query-collapsed',!state.queryExpanded);$('.query-expand-text').textContent=state.queryExpanded?'收起':'展开'};
  $('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;render()};
  $('#prevPage').onclick=()=>{if(state.page>1){state.page--;render()}};
  $('#nextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(filtered().length/state.pageSize));if(state.page<pages){state.page++;render()}};
  $('#selectAll').onchange=e=>{filtered().slice((state.page-1)*state.pageSize,state.page*state.pageSize).forEach(o=>e.target.checked?state.selected.add(o.id):state.selected.delete(o.id));render()};
  $('#exportBtn').onclick=()=>toast(`已创建 ${filtered().length} 张提货单的导出任务`);
  $('#importBtn').onclick=()=>UIKit.openImportDialog({
    title:'导入新建提货单',
    guideTitle:'第一步：使用提货单标准模板整理数据',
    guideText:'同一张提货单的供应商、提货仓和目标仓必须一致。系统将校验采购单剩余可提量与提货仓可用库存，超出部分不予导入。',
    onDownload:()=>toast('提货单导入模板已下载')
  });

  render();
  layoutQuery();
  window.addEventListener('resize',layoutQuery);
})();
