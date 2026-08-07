const pages={stock:'./pages/stock-plan/index.html?v=1.4.0',purchase:'./pages/purchase-plan/index.html?v=1.4.0',shipment:'./pages/shipment-plan/index.html?v=1.4.0',purchaseOrder:'./pages/purchase-orders/index.html?v=1.4.0'};
const pageNames={stock:'备货计划',purchase:'采购计划',shipment:'发货计划',purchaseOrder:'采购单'};
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
