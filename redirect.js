/* 固定框架适配：业务子页面被直接打开时，自动重定向到根入口并带上当前路由 */
(function(){
  if(window.parent!==window)return;
  const map={
    'demand-forecast/index.html':'forecast',
    'stock-plan/index.html':'stock',
    'purchase-plan/index.html':'purchase',
    'shipment-plan/index.html':'shipment',
    'purchase-orders/index.html':'purchaseOrder',
    'shipment-orders/index.html':'shipmentOrder',
    'sku-first-leg-cost/index.html':'skuFirstLegCost',
    'supplier-inventory/index.html':'supplierInventory',
    'processing-orders/index.html':'processingOrder'
  };
  const path=location.pathname;
  for(const [file,key] of Object.entries(map)){
    if(path.includes(file)){
      const base=path.substring(0,path.lastIndexOf('/pages/'));
      location.replace((base||'')+'/index.html#'+key);
      break;
    }
  }
})();
