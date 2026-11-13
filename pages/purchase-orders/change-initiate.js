/* 采购单·待到齐页签【发起变更】：左侧已勾选待到齐采购单导航（支持移除） + 右侧变更表单。
   提交后生成待审核变更单，toast 展示变更单号并可点击跳转采购变更页。 */
(function(){
'use strict';
const $id=id=>document.getElementById(id);
const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>Number(value||0).toFixed(2);
const taxOptions=[0,1,3,6,9,13];
const modalState={ids:[],activeId:'',drafts:{}};

function isEligible(row){return Boolean(row)&&['待到齐','待收货','部分收货'].includes(row.status);}
function selectedRows(){return [...state.selected].map(id=>purchaseOrders.find(row=>row.id===id)).filter(Boolean);}
function eligibleSelectedRows(){return selectedRows().filter(isEligible);}
function currentDraft(){return modalState.drafts[modalState.activeId]||null;}
function syncEntry(){
  const btn=$id('openPurchaseChangeList');if(!btn)return;
  const rows=selectedRows(),eligible=rows.filter(isEligible);
  btn.disabled=false;
  btn.title=state.status!=='待到齐'?'请切换到待到齐页签':!rows.length?'请先勾选待到齐采购单':!eligible.length?'请勾选待到齐状态的采购单':'发起所选采购单的信息变更';
}
function snapshot(row){
  const pad=value=>String(value).padStart(2,'0'),date=new Date();
  const todayIso=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  date.setDate(date.getDate()+7);
  const fallback=`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const planned=/^\d{4}-\d{2}-\d{2}$/.test(row.receiveDate||'')?row.receiveDate:'';
  const erpNo=row.erpSource==='易仓'?row.ecNo:row.lxNo;
  return {orderId:row.midNo,erpDisplay:`${erpNo||'—'}（${row.erpSource||'—'}）`,status:row.status||'待到齐',
    supplier:row.supplier,supplierCode:row.supplierCode||'—',purchaseSubject:row.purchaseSubject||'—',
    creator:row.creator||'—',createdAt:row.createdAt||'—',
    warehouse:row.warehouse,buyer:row.purchaseOwner,
    deliveryDate:planned&&planned>=todayIso?planned:fallback,settlement:row.settlement,prepayRate:Number(row.prepayRate)||0,
    taxIncluded:row.taxIncluded||'否',tax:Number(row.tax)||0,freight:Number(row.freight)||0,otherFee:Number(row.otherFee)||0,
    discount:Number(row.discount)||0,remark:row.remark||'',
    items:(row.items||[]).map(item=>({
      sku:item.sku,lingxingSku:item.lingxingSku||'—',supplierItemNo:item.supplierItemNo||'—',icon:item.icon||'📦',firstOrder:Boolean(item.firstOrder),urgent:Boolean(item.urgent),
      planNo:item.planNo||'—',team:item.team||'—',
      lastPurchasePrice:Number(item.lastPurchasePrice)||0,lastPurchaseTaxIncluded:item.lastPurchaseTaxIncluded||'否',
      name:item.name,quantity:Number(item.purchaseQty)||0,received:Number(item.receiveQty)||0,price:Number(item.unitPrice)||0,remark:item.remark||''
    }))};
}
function total(order){return order.items.reduce((sum,item)=>sum+item.quantity*item.price,0)+Number(order.freight||0)+Number(order.otherFee||0)-Number(order.discount||0);}

function navHtml(){
  const rows=modalState.ids.map(id=>purchaseOrders.find(item=>item.id===id)).filter(Boolean);
  if(!rows.length)return '<div class="ci-nav-empty">暂无待到齐采购单</div>';
  return rows.map(row=>`<div class="ci-nav-item ${modalState.activeId===row.id?'active':''}" data-ci-order="${row.id}"><div class="ci-nav-item-head"><b>${esc(row.midNo)}</b><button type="button" class="ci-nav-remove" data-ci-remove="${row.id}">移除</button></div><span title="${esc(row.supplier)}">${esc(row.supplier)}</span><small>${esc(row.warehouse)} · ${row.items.length} 个 SKU</small></div>`).join('');
}
function optionsWith(list,value){const values=[...new Set([...list,String(value==null?'':value)])].filter(v=>v!=='');return values.map(v=>`<option ${v===String(value==null?'':value)?'selected':''}>${esc(v)}</option>`).join('');}
function detailField(label,content){return `<div class="purchase-detail-field"><span>${label}</span>${content}</div>`;}
/* 原值展示：值与原值不同时，在输入框下方显示橙黄色删除线原值 */
const numericBaseKeys=['prepayRate','tax','freight','otherFee','discount'];
function sameValue(key,value,original){
  if(numericBaseKeys.includes(key)||key==='quantity'||key==='price'){
    if(String(value).trim()==='')return String(original).trim()==='';
    return Number(value)===Number(original);
  }
  return String(value==null?'':value)===String(original==null?'':original);
}
function origText(key,original){
  if(key==='tax')return `${Number(original)||0}%`;
  const text=String(original==null?'':original);
  return text===''?'—':text;
}
function baseOrigLine(current,key){
  const changed=!sameValue(key,current.after[key],current.before[key]);
  return `<div class="ci-orig${key==='remark'?' is-multiline':''}" data-ci-orig="${key}" ${changed?'':'hidden'}>${esc(origText(key,current.before[key]))}</div>`;
}
function itemOrigLine(current,index,key){
  const after=current.after.items[index],before=current.before.items[index];
  const changed=!sameValue(key,after[key],before[key]);
  return `<div class="ci-orig" data-ci-orig-item="${index}-${key}" ${changed?'':'hidden'}>${esc(origText(key,before[key]))}</div>`;
}
function editField(label,key,control,current){
  return `<div class="purchase-detail-field is-editable"><span>${label}</span><div class="ci-field-control">${control}${baseOrigLine(current,key)}</div></div>`;
}
function refreshOrig(target){
  const current=currentDraft();if(!current)return;
  if(target.matches('[data-ci-base]')){
    const key=target.dataset.ciBase;
    current.after[key]=target.value;
    const line=$id('ciForm').querySelector(`[data-ci-orig="${key}"]`);
    if(line)line.hidden=sameValue(key,target.value,current.before[key]);
    return;
  }
  if(target.matches('[data-ci-item]')){
    const index=Number(target.dataset.ciItem),key=target.dataset.key;
    const before=current.before.items[index];
    if(!before||(key!=='quantity'&&key!=='price'))return;
    const line=$id('ciForm').querySelector(`[data-ci-orig-item="${index}-${key}"]`);
    if(line)line.hidden=sameValue(key,target.value,before[key]);
  }
}
function formHtml(){
  const current=currentDraft();if(!current)return '';
  const a=current.after;
  const statusCls=a.status==='已完成'?'done':a.status==='已作废'?'void':a.status==='已驳回'?'rejected':'pending';
  const hasReceived=a.items.some(item=>Number(item.received||0)>0);
  const warehouseControl=hasReceived
    ? `<select class="ci-control" data-ci-base="warehouse" disabled title="采购单内已有 SKU 发生收货入库，采购仓库锁定不可变更">${optionsWith(warehouses,a.warehouse)}</select>`
    : `<select class="ci-control" data-ci-base="warehouse">${optionsWith(warehouses,a.warehouse)}</select>`;
  const infoFields=[
    detailField('中台跟踪号',`<b>${esc(a.orderId)}</b>`),
    detailField('ERP采购单号',`<b>${esc(a.erpDisplay)}</b>`),
    detailField('采购单状态',`<b><span class="status-tag status-${statusCls}">${esc(a.status)}</span></b>`),
    detailField('供应商名称',`<b>${esc(a.supplier)}</b>`),
    detailField('供应商代码',`<b>${esc(a.supplierCode)}</b>`),
    editField('采购仓库','warehouse',warehouseControl,current),
    editField('采购负责人','buyer',`<select class="ci-control" data-ci-base="buyer">${optionsWith(receivers.filter(v=>v!=='仓库管理员'),a.buyer)}</select>`,current),
    detailField('采购主体',`<b title="${esc(a.purchaseSubject)}">${esc(a.purchaseSubject)}</b>`),
    editField('结算方式','settlement',`<select class="ci-control" data-ci-base="settlement">${optionsWith(settlementOptions,a.settlement)}</select>`,current),
    editField('预付比例（%）','prepayRate',`<input type="number" class="ci-control" data-ci-base="prepayRate" min="0" max="100" step="1" value="${a.prepayRate}">`,current),
    editField('是否含税','taxIncluded',`<select class="ci-control" data-ci-base="taxIncluded"><option ${a.taxIncluded==='是'?'selected':''}>是</option><option ${a.taxIncluded==='否'?'selected':''}>否</option></select>`,current),
    editField('税率（%）','tax',`<select class="ci-control" data-ci-base="tax">${[...new Set([...taxOptions,Number(a.tax)||0])].sort((x,y)=>x-y).map(v=>`<option value="${v}" ${Number(a.tax)===v?'selected':''}>${v}%</option>`).join('')}</select>`,current),
    editField('运费','freight',`<input type="number" class="ci-control" data-ci-base="freight" min="0" step="0.01" value="${a.freight}">`,current),
    editField('其他费用','otherFee',`<input type="number" class="ci-control" data-ci-base="otherFee" min="0" step="0.01" value="${a.otherFee}">`,current),
    editField('优惠金额','discount',`<input type="number" class="ci-control" data-ci-base="discount" min="0" step="0.01" value="${a.discount}">`,current),
    detailField('创建人',`<b>${esc(a.creator)}</b>`),
    detailField('创建时间',`<b>${esc(a.createdAt)}</b>`)
  ].join('');
  const receivedSkus=new Set(a.items.filter(it=>Number(it.received||0)>0).map(it=>it.sku));
  const skuRows=a.items.map((item,index)=>{
    const skuReceived=Number(item.received||0)>0||receivedSkus.has(item.sku);
    const lockTip=skuReceived?' title="该 SKU 已产生收货数量，不可修改采购数量和采购单价"':'';
    const lastPriceText=`¥ ${Number(item.lastPurchasePrice||0).toFixed(2)}${Number(item.lastPurchasePrice||0)>0&&item.lastPurchaseTaxIncluded==='是'?'<span class="po-tax-included-tag">含税</span>':''}`;
    return `<tr>
      <td><div class="ci-sku-cell"><span class="sku-thumb">${item.icon||'📦'}</span><b>${esc(item.sku)}</b>${item.firstOrder?'<span class="po-first-order-tag">首</span>':''}${item.urgent?'<span class="po-urgent-tag">加急</span>':''}</div></td>
      <td>${esc(item.planNo)}</td>
      <td><input type="number" class="ci-control ci-num" data-ci-item="${index}" data-key="quantity" min="1" step="1" value="${item.quantity}" ${skuReceived?'disabled':''}${lockTip}>${itemOrigLine(current,index,'quantity')}</td>
      <td><input type="number" class="ci-control ci-num" data-ci-item="${index}" data-key="price" min="0" step="0.01" value="${item.price}" ${skuReceived?'disabled':''}${lockTip}>${itemOrigLine(current,index,'price')}</td>
      <td>${lastPriceText}</td>
      <td>${esc(item.team)}</td>
      <td title="${esc(item.name)}">${esc(item.name)}</td>
      <td>${item.received}</td>
      <td class="ci-amount" data-ci-amount="${index}">¥ ${money(item.quantity*item.price)}</td>
    </tr>`;
  }).join('');
  return `<div class="purchase-detail-layout">
    <main class="purchase-detail-content" id="ciDetailContent">
      <section id="ci-detail-info" class="purchase-detail-section">
        <div class="purchase-detail-section-head">采购单信息</div>
        <div class="purchase-detail-field-grid">${infoFields}</div>
        <div class="ci-remark-box is-reason"><span>变更原因<em>*</em></span><textarea class="ci-control ci-reason" id="ciReason" rows="2" maxlength="300" placeholder="请说明本次变更的原因（必填）">${esc(current.reason)}</textarea></div>
      </section>
      <section id="ci-detail-sku" class="purchase-detail-section">
        <div class="purchase-detail-section-head">采购明细</div>
        <div class="ci-detail-table-wrap">
          <table class="ci-sku-table">
            <thead><tr><th>SKU</th><th>采购计划</th><th>采购数</th><th>采购单价</th><th>上次采购价</th><th>团队</th><th>品名</th><th>累计入库</th><th>货款</th></tr></thead>
            <tbody>${skuRows}</tbody>
          </table>
        </div>
      </section>
    </main>
  </div>`;
}
function renderForm(){
  const current=currentDraft();
  const sub=$id('ciHeaderSub');
  if(sub)sub.textContent=current?`中台跟踪号：${current.after.orderId}`:'可切换左侧采购单分别编辑变更内容';
  const box=$id('ciForm');if(!box)return;
  box.innerHTML=formHtml();
}
function renderNav(){
  const title=$id('ciNavTitle');if(title)title.textContent=`待到齐采购单（${modalState.ids.length}）`;
  const list=$id('ciNavList');if(list)list.innerHTML=navHtml();
}

function openInitiate(rows){
  const list=(Array.isArray(rows)?rows:[rows]).filter(Boolean);
  if(!list.length)return;
  modalState.ids=list.map(row=>row.id);
  modalState.drafts={};
  list.forEach(row=>{modalState.drafts[row.id]={id:row.id,before:snapshot(row),after:snapshot(row),reason:''};});
  modalState.activeId=list[0].id;
  const modal=$id('changeInitiateModal');modal.hidden=false;
  renderNav();renderForm();
}
function closeInitiate(){
  const modal=$id('changeInitiateModal');if(modal)modal.hidden=true;
  modalState.ids=[];modalState.activeId='';modalState.drafts={};
}
function removeOrderFromModal(orderId){
  readForm();
  modalState.ids=modalState.ids.filter(id=>id!==orderId);
  delete modalState.drafts[orderId];
  if(state&&state.selected&&state.selected.has(orderId)){
    state.selected.delete(orderId);
    if(typeof renderTable==='function')renderTable();
    else if(typeof syncSelection==='function')syncSelection();
  }
  if(!modalState.ids.length){
    closeInitiate();
    toast('已移除全部采购单，本次发起变更已取消');
    return;
  }
  if(modalState.activeId===orderId)modalState.activeId=modalState.ids[0];
  renderNav();renderForm();
}

function readForm(){
  const current=currentDraft();if(!current)return;
  const a=current.after;
  const hasReceived=a.items.some(item=>Number(item.received||0)>0);
  document.querySelectorAll('#ciForm [data-ci-base]').forEach(el=>{
    const key=el.dataset.ciBase;
    if(key==='warehouse'&&hasReceived){
      a.warehouse=current.before.warehouse;
      return;
    }
    a[key]=el.value;
  });
  document.querySelectorAll('#ciForm [data-ci-item]').forEach(el=>{const item=a.items[Number(el.dataset.ciItem)];if(item)item[el.dataset.key]=el.value;});
  const reasonEl=$id('ciReason');
  if(reasonEl)current.reason=reasonEl.value.trim();
}
function isDraftChanged(draft){
  const a=draft.after,b=draft.before;
  const baseKeys=['warehouse','buyer','settlement','prepayRate','taxIncluded','tax','freight','otherFee','discount'];
  const baseChanged=baseKeys.some(key=>String(b[key]||'')!==String(a[key]||''));
  const itemChanged=a.items.some((item,i)=>Number(item.quantity)!==Number(b.items[i].quantity)||Number(item.price)!==Number(b.items[i].price));
  return baseChanged||itemChanged;
}
function validateDraft(draft){
  const a=draft.after;
  if(!draft.reason)return '请填写变更原因';
  if(!Number.isInteger(Number(a.prepayRate))||Number(a.prepayRate)<0||Number(a.prepayRate)>100)return '预付比例须为 0-100 的整数';
  for(const key of ['freight','otherFee','discount']){const v=a[key];if(v===''||Number(v)<0||!/^\d+(\.\d{1,2})?$/.test(String(v)))return '运费/其他费用/优惠金额须为非负数，最多 2 位小数';}
  for(const item of a.items){
    if(!Number.isInteger(Number(item.quantity))||Number(item.quantity)<1)return `SKU ${item.sku} 的采购数量须为正整数`;
    if(Number(item.quantity)<Number(item.received))return `SKU ${item.sku} 的采购数量不能小于累计入库数量`;
    if(item.price===''||Number(item.price)<0||!/^\d+(\.\d{1,2})?$/.test(String(item.price)))return `SKU ${item.sku} 的采购单价须为非负数，最多 2 位小数`;
  }
  ['prepayRate','tax','freight','otherFee','discount'].forEach(key=>a[key]=Number(a[key]));
  a.items.forEach(item=>{item.quantity=Number(item.quantity);item.price=Number(item.price);});
  if(total(a)<0)return '变更后金额不能小于 0，请检查优惠金额及费用';
  return '';
}
function makeChangeId(){
  const d=new Date(),p=v=>String(v).padStart(2,'0');
  const compact=`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}`;
  let seq=1;try{seq=Number(sessionStorage.getItem('pcChangeSeq')||'0')+1;sessionStorage.setItem('pcChangeSeq',String(seq));}catch(e){}
  return 'PC'+compact+String(seq).padStart(4,'0');
}
function nowStamp(){const d=new Date(),p=v=>String(v).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function successToast(changeIds){
  document.querySelectorAll('.ci-success-toast').forEach(el=>el.remove());
  const el=document.createElement('div');
  el.className='ci-success-toast';
  const links=changeIds.map(id=>`<a href="javascript:void(0)" class="ci-toast-link" data-change-id="${esc(id)}">${esc(id)}</a>`).join('、');
  const countText=changeIds.length>1?`（共 ${changeIds.length} 张）`:'';
  el.innerHTML=`发起变更成功 ${countText}，变更单号 ${links}<span class="ci-toast-close">×</span>`;
  const jumpUrl='../purchase-changes/index.html?status=pending';
  el.querySelectorAll('.ci-toast-link').forEach(link=>{
    link.onclick=()=>{
      if(window.parent!==window){
        try{window.parent.location.href=jumpUrl;return;}catch(e){}
      }
      window.location.href=jumpUrl;
    };
  });
  el.querySelector('.ci-toast-close').onclick=()=>el.remove();
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),10000);
}
function submit(){
  readForm();
  const drafts=modalState.ids.map(id=>modalState.drafts[id]).filter(Boolean);
  if(!drafts.length)return;
  const targets=drafts.length===1?drafts:drafts.filter(d=>isDraftChanged(d)||Boolean(d.reason));
  if(!targets.length||!targets.some(isDraftChanged)){
    toast('未修改任何内容，无需发起变更','error');
    return;
  }
  for(const draft of targets){
    if(!isDraftChanged(draft)){
      modalState.activeId=draft.id;renderNav();renderForm();
      toast(`${draft.after.orderId} 未修改任何字段，请修改或从左侧移除`,'error');
      return;
    }
    const error=validateDraft(draft);
    if(error){
      modalState.activeId=draft.id;renderNav();renderForm();
      toast(targets.length>1?`${draft.after.orderId}：${error}`:error,'error');
      return;
    }
  }
  const now=nowStamp();
  const created=targets.map(draft=>({
    id:makeChangeId(),orderId:draft.after.orderId,supplier:draft.after.supplier,status:'pending',applicant:'Admin',createdAt:now,
    before:draft.before,after:draft.after,reason:draft.reason,oldAmount:total(draft.before),newAmount:total(draft.after),
    auditor:'',auditedAt:'',effectiveAt:'',opinion:'',logs:[{time:now,user:'Admin',text:'提交采购变更申请'}]
  }));
  try{
    sessionStorage.setItem('pcNewChange',JSON.stringify(created[0]));
    sessionStorage.setItem('pcNewChanges',JSON.stringify(created));
  }catch(e){}
  closeInitiate();syncEntry();successToast(created.map(item=>item.id));
}

function mount(){
  const modal=document.createElement('div');
  modal.className='ci-modal';modal.id='changeInitiateModal';modal.hidden=true;
  modal.innerHTML=`<div class="ci-dialog" role="dialog" aria-label="发起采购变更">
    <header class="ci-header"><div class="ci-header-titles"><h2>发起采购变更</h2><span id="ciHeaderSub">中台跟踪号：—</span></div><button type="button" class="ci-close" id="ciClose" aria-label="关闭">×</button></header>
    <div class="ci-body">
      <aside class="ci-nav"><div class="ci-nav-title" id="ciNavTitle">待到齐采购单</div><div class="ci-nav-list" id="ciNavList"></div></aside>
      <div class="ci-detail-wrap" id="ciForm"></div>
    </div>
    <footer class="ci-footer"><div class="ci-footer-tips"><span>1. 采购单内任一 SKU 发生收货入库后，采购仓库锁定不可变更。</span><span>2. 同一采购单内相同 SKU（不同采购计划）的采购单价自动保持同步联动。</span><span>3. 采购单该 SKU 产生收货数量之后，该 SKU 的采购单价和采购数量不可修改。</span></div><button type="button" class="btn" id="ciCancel">取消</button><button type="button" class="btn primary" id="ciSubmit">提交变更</button></footer>
  </div>`;
  document.body.appendChild(modal);
  $id('ciClose').onclick=closeInitiate;$id('ciCancel').onclick=closeInitiate;
  modal.addEventListener('click',event=>{if(event.target===modal)closeInitiate();});
  $id('ciSubmit').onclick=submit;
  $id('ciNavList').addEventListener('click',event=>{
    const removeBtn=event.target.closest('[data-ci-remove]');
    if(removeBtn){
      event.stopPropagation();
      removeOrderFromModal(removeBtn.dataset.ciRemove);
      return;
    }
    const item=event.target.closest('[data-ci-order]');if(!item)return;
    const nextId=item.dataset.ciOrder;
    if(!nextId||nextId===modalState.activeId)return;
    readForm();
    modalState.activeId=nextId;
    renderNav();renderForm();
  });
  const handleFormEdit=event=>{
    const target=event.target;
    refreshOrig(target);
    if(target.matches('[data-ci-item]')){
      const index=Number(target.dataset.ciItem);
      const current=currentDraft();
      if(!current||!current.after.items[index])return;
      const key=target.dataset.key;
      const val=target.value;

      if(key==='price'){
        const targetSku=current.after.items[index].sku;
        // 同一采购单内相同 SKU（不同采购计划）采购单价自动保持同步联动
        current.after.items.forEach((item,idx)=>{
          if(item.sku===targetSku){
            item.price=val;
            const priceInput=$id('ciForm').querySelector(`input[data-ci-item="${idx}"][data-key="price"]`);
            if(priceInput&&priceInput!==target){
              priceInput.value=val;
            }
            const amountCell=$id('ciForm').querySelector(`[data-ci-amount="${idx}"]`);
            if(amountCell){
              amountCell.textContent=`¥ ${money((Number(item.quantity)||0)*(Number(val)||0))}`;
            }
            const line=$id('ciForm').querySelector(`[data-ci-orig-item="${idx}-price"]`);
            const before=current.before.items[idx];
            if(line&&before){
              line.hidden=sameValue('price',val,before.price);
            }
          }
        });
      }else if(key==='quantity'){
        current.after.items[index].quantity=val;
        const amountCell=$id('ciForm').querySelector(`[data-ci-amount="${index}"]`);
        if(amountCell){
          const item=current.after.items[index];
          amountCell.textContent=`¥ ${money((Number(val)||0)*(Number(item.price)||0))}`;
        }
      }
    }
  };
  $id('ciForm').addEventListener('input',handleFormEdit);
  $id('ciForm').addEventListener('change',handleFormEdit);
  const btn=$id('openPurchaseChangeList');
  btn.onclick=()=>{
    if(state.status!=='待到齐'){toast('请切换到待到齐页签后发起变更','error');return;}
    const rows=selectedRows();
    if(!rows.length){toast('请先勾选待到齐采购单','error');return;}
    const eligible=rows.filter(isEligible);
    if(!eligible.length){toast('请勾选待到齐状态的采购单','error');return;}
    openInitiate(eligible);
  };
  if(typeof openPurchaseChange==='function'){
    window.openPurchaseChange=function(row){
      if(!isEligible(row)){toast('仅审核通过且处于待到齐的采购单可以发起变更','error');return;}
      openInitiate([row]);
    };
  }
  const original=syncActionVisibility;
  syncActionVisibility=function(){original();syncEntry();};
  syncEntry();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
