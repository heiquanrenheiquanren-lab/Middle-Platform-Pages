const VER='1.7.38';
const pages={workbench:`./pages/workbench/index.html?v=${VER}`,forecast:`./pages/demand-forecast/index.html?v=${VER}`,stock:`./pages/stock-plan/index.html?v=${VER}`,purchase:`./pages/purchase-plan/index.html?v=${VER}`,shipment:`./pages/shipment-plan/index.html?v=${VER}`,purchaseOrder:`./pages/purchase-orders/index.html?v=${VER}`,shipmentOrder:`./pages/shipment-orders/index.html?v=${VER}`,skuFirstLegCost:`./pages/sku-first-leg-cost/index.html?v=${VER}`,supplierInventory:`./pages/supplier-inventory/index.html?v=${VER}`,processingOrder:`./pages/processing-orders/index.html?v=${VER}`};
const pageNames={workbench:'工作台',forecast:'需求预测',stock:'备货计划',purchase:'采购计划',shipment:'发货计划',purchaseOrder:'采购单',shipmentOrder:'发货单',skuFirstLegCost:'头程费用',supplierInventory:'供应商库存',processingOrder:'加工单'};
const pageMenuKeys={...pages};
const contentArea=document.getElementById('contentArea');
const breadcrumbList=document.getElementById('breadcrumbList');
const breadcrumbScroll=document.getElementById('breadcrumbScroll');
const breadcrumbLeft=document.getElementById('breadcrumbLeft');
const breadcrumbRight=document.getElementById('breadcrumbRight');
const sidebar=document.getElementById('sidebar');

let tabs=[];
let activeKey=location.hash.slice(1)||'stock';

function createFrame(key){
  const iframe=document.createElement('iframe');
  iframe.className='page-frame';
  iframe.dataset.page=key;
  iframe.src=pages[key];
  iframe.title=`${pageNames[key]}｜供应链中台`;
  return iframe;
}

function updateMenuHighlight(key){
  sidebar.querySelectorAll('.nav-item').forEach(item=>{
    item.classList.toggle('active',item.dataset.pageNav===key);
  });
}

function renderBreadcrumb(){
  breadcrumbList.innerHTML='';
  tabs.forEach(key=>{
    const item=document.createElement('div');
    item.className=`breadcrumb-item${key===activeKey?' active':''}`;
    item.dataset.page=key;
    item.innerHTML=`<span class="bc-label">${pageNames[key]}</span><span class="bc-close" data-close="${key}">×</span>`;
    item.querySelector('.bc-label').addEventListener('click',()=>activateTab(key));
    const closeBtn=item.querySelector('.bc-close');
    if(tabs.length>1)closeBtn.addEventListener('click',e=>{e.stopPropagation();closeTab(key);});
    else closeBtn.style.display='none';
    breadcrumbList.appendChild(item);
  });
  scrollToActive();
  updateArrowState();
}

function scrollToActive(){
  const active=breadcrumbList.querySelector(`.breadcrumb-item[data-page="${activeKey}"]`);
  if(!active)return;
  const scrollLeft=active.offsetLeft-(breadcrumbScroll.clientWidth-active.offsetWidth)/2;
  breadcrumbScroll.scrollTo({left:Math.max(0,scrollLeft),behavior:'smooth'});
}

function updateArrowState(){
  const canScrollLeft=breadcrumbScroll.scrollLeft>0;
  const canScrollRight=breadcrumbScroll.scrollLeft+breadcrumbScroll.clientWidth<breadcrumbScroll.scrollWidth-1;
  breadcrumbLeft.disabled=!canScrollLeft;
  breadcrumbRight.disabled=!canScrollRight;
}

function openTab(key,focusParam){
  if(!pages[key])key='stock';
  if(tabs.includes(key)){
    if(focusParam){
      const frame=contentArea.querySelector(`iframe[data-page="${key}"]`);
      if(frame&&frame.contentWindow)frame.contentWindow.postMessage({type:'prototype:focus',value:focusParam},'*');
    }
    return activateTab(key);
  }
  tabs.push(key);
  const frame=createFrame(key);
  contentArea.appendChild(frame);
  activateTab(key);
}

function activateTab(key){
  if(!tabs.includes(key))return;
  activeKey=key;
  contentArea.querySelectorAll('.page-frame').forEach(frame=>{
    frame.style.display=frame.dataset.page===key?'block':'none';
  });
  renderBreadcrumb();
  updateMenuHighlight(key);
  history.replaceState(null,'',`#${key}`);
}

function closeTab(key){
  if(!tabs.includes(key)||tabs.length<=1)return;
  const idx=tabs.indexOf(key);
  const frame=contentArea.querySelector(`iframe[data-page="${key}"]`);
  if(frame)frame.remove();
  tabs=tabs.filter(k=>k!==key);
  if(activeKey===key){
    const nextKey=tabs[Math.max(0,idx-1)]||tabs[0];
    activateTab(nextKey);
  }else{
    renderBreadcrumb();
  }
}

function initBreadcrumbEvents(){
  breadcrumbLeft.addEventListener('click',()=>{breadcrumbScroll.scrollBy({left:-120,behavior:'smooth'});});
  breadcrumbRight.addEventListener('click',()=>{breadcrumbScroll.scrollBy({left:120,behavior:'smooth'});});
  breadcrumbScroll.addEventListener('scroll',updateArrowState);
  window.addEventListener('resize',updateArrowState);
}

function initNavEvents(){
  sidebar.querySelectorAll('.nav-item[data-page-nav]').forEach(item=>{
    item.addEventListener('click',()=>openTab(item.dataset.pageNav));
  });
  document.querySelectorAll('[data-top-nav]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const key=btn.dataset.topNav;
      if(key==='supply'){
        if(!tabs.length)openTab('stock');
        else activateTab(activeKey);
      }else{
        ElementPlus?.ElMessage?.info?.('本期仅实现供应链中台')||alert('本期仅实现供应链中台');
      }
    });
  });
}

window.addEventListener('message',event=>{
  const message=event.data;
  if(message?.type==='prototype:navigate'&&pages[message.page])openTab(message.page,message.focus);
});

window.addEventListener('hashchange',()=>{
  const key=location.hash.slice(1);
  if(pages[key])activateTab(key);
});

initBreadcrumbEvents();
initNavEvents();
openTab(activeKey,false);
