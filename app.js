const VER='1.7.22';
const pages={forecast:`./pages/demand-forecast/index.html?v=${VER}`,stock:`./pages/stock-plan/index.html?v=${VER}`,purchase:`./pages/purchase-plan/index.html?v=${VER}`,shipment:`./pages/shipment-plan/index.html?v=${VER}`,purchaseOrder:`./pages/purchase-orders/index.html?v=${VER}`,shipmentOrder:`./pages/shipment-orders/index.html?v=${VER}`,skuFirstLegCost:`./pages/sku-first-leg-cost/index.html?v=${VER}`,supplierInventory:`./pages/supplier-inventory/index.html?v=${VER}`};
const pageNames={forecast:'需求预测',stock:'备货计划',purchase:'采购计划',shipment:'发货计划',purchaseOrder:'采购单',shipmentOrder:'发货单',skuFirstLegCost:'头程费用',supplierInventory:'供应商库存'};
const frame=document.querySelector('#prototypeFrame');

function openPage(key,updateHash=true){
  const page=pages[key]?key:'stock';
  frame.src=pages[page];
  frame.title=`${pageNames[page]}查询原型`;
  if(updateHash)history.replaceState(null,'',`#${page}`);
}

window.addEventListener('message',event=>{
  const message=event.data;
  if(message?.type==='prototype:navigate'&&pages[message.page])openPage(message.page);
});
window.addEventListener('hashchange',()=>openPage(location.hash.slice(1),false));
openPage(location.hash.slice(1)||'stock',false);
