const {createApp,ref,reactive,computed}=Vue;

const splitValues=value=>String(value||'').split(/[\s,，、;；]+/).map(item=>item.trim()).filter(Boolean).map(item=>item.toLowerCase());
const textMatch=(value,query)=>{const terms=splitValues(query);if(!terms.length)return true;const source=String(value||'').toLowerCase();return terms.some(term=>source.includes(term));};
const inMulti=(value,selected)=>!selected.length||selected.includes(value);
const navRoutes={forecast:'../demand-forecast/index.html',stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',skuFirstLegCost:'../sku-first-leg-cost/index.html',supplierInventory:'../supplier-inventory/index.html'};

const rows=[
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 旗舰店',team:'北美一组',sku:'SPU-1001-BL',planNo:'FP20260806011',shippedQty:500,receiveQty:499,unitCost:3.8265,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 旗舰店',team:'北美一组',sku:'SPU-1001-WH',planNo:'FP20260806012',shippedQty:400,receiveQty:400,unitCost:3.4178,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 运动店',team:'北美二组',sku:'SPU-2003',planNo:'FP20260806013',shippedQty:300,receiveQty:300,unitCost:4.1050,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'德国仓',middleOrder:'DN20260808002',erpOrder:'EC20260808002',platform:'Amazon DE',store:'Amazon-DE 家居店',team:'欧洲组',sku:'SPU-3001',planNo:'FP20260805021',shippedQty:380,receiveQty:374,unitCost:5.2286,totalCost:3276.98,transport:'空运',channel:'DHL 标准',createdAt:'2026-08-10'},
  {destination:'德国仓',middleOrder:'DN20260808002',erpOrder:'EC20260808002',platform:'Amazon DE',store:'Amazon-DE 家居店',team:'欧洲组',sku:'SPU-4001',planNo:'FP20260808041',shippedQty:250,receiveQty:250,unitCost:6.3800,totalCost:3276.98,transport:'空运',channel:'DHL 标准',createdAt:'2026-08-10'},
  {destination:'洛杉矶海外仓',middleOrder:'DN20260808003',erpOrder:'EC20260808003',platform:'Walmart',store:'Walmart-US 家居店',team:'北美二组',sku:'SPU-6001',planNo:'FP20260807001',shippedQty:200,receiveQty:200,unitCost:2.9640,totalCost:1521.28,transport:'快递',channel:'UPS 专线',createdAt:'2026-08-10'},
  {destination:'洛杉矶海外仓',middleOrder:'DN20260808003',erpOrder:'EC20260808003',platform:'Amazon US',store:'Amazon-US 户外店',team:'北美一组',sku:'SPU-9001',planNo:'FP20260808021',shippedQty:200,receiveQty:198,unitCost:4.7825,totalCost:1521.28,transport:'海运',channel:'美森快船',createdAt:'2026-08-10'},
  {destination:'美国东部仓',middleOrder:'DN20260808004',erpOrder:'EC20260808004',platform:'eBay',store:'eBay-US 旗舰店',team:'北美二组',sku:'EB-01016-001',planNo:'FP20260808051',shippedQty:50,receiveQty:50,unitCost:7.2140,totalCost:360.70,transport:'空运',channel:'快递派送',createdAt:'2026-08-11'},
  {destination:'美国东部仓',middleOrder:'DN20260808004',erpOrder:'EC20260808004',platform:'eBay',store:'eBay-US 旗舰店',team:'北美二组',sku:'EB-01017-001',planNo:'FP20260808052',shippedQty:0,receiveQty:0,unitCost:null,totalCost:360.70,transport:'空运',channel:'快递派送',createdAt:'—'},
  {destination:'英国仓',middleOrder:'DN20260808005',erpOrder:'EC20260808005',platform:'Shopify',store:'Shopify-UK 店',team:'欧洲组',sku:'SH-UK-0021',planNo:'FP20260808061',shippedQty:120,receiveQty:120,unitCost:3.6700,totalCost:752.80,transport:'海运',channel:'英国专线',createdAt:'2026-08-11'},
  {destination:'英国仓',middleOrder:'DN20260808005',erpOrder:'EC20260808005',platform:'Shopify',store:'Shopify-UK 店',team:'欧洲组',sku:'SH-UK-0022',planNo:'FP20260808062',shippedQty:80,receiveQty:78,unitCost:3.9050,totalCost:752.80,transport:'海运',channel:'英国专线',createdAt:'2026-08-11'},
  {destination:'日本仓',middleOrder:'DN20260808006',erpOrder:'EC20260808006',platform:'Amazon JP',store:'Amazon-JP 店',team:'亚太组',sku:'JP-1008',planNo:'FP20260808071',shippedQty:65,receiveQty:65,unitCost:8.1260,totalCost:528.19,transport:'空运',channel:'日本专线',createdAt:'2026-08-12'}
];

const unique=key=>[...new Set(rows.map(row=>row[key]).filter(value=>value&&value!=='—'))];

const app=createApp({setup(){
  const query=reactive({sku:'',skuType:'sku',orderType:'middleOrder',orderNo:'',planNo:'',destinations:[],platforms:[],stores:[],teams:[],transports:[],channels:[],creators:[],createdRange:[],hasDiff:''});
  const applied=reactive(JSON.parse(JSON.stringify(query)));
  const page=ref(1),pageSize=ref(10),refreshing=ref(false),queryExpanded=ref(false);
  const destinations=unique('destination'),platforms=unique('platform'),stores=unique('store'),teams=unique('team'),transports=unique('transport'),channels=unique('channel'),creators=['Admin','张敏','李晨','王磊'];
  const hasAdvanced=true;

  // 按发货单号分组计算差异
  const enrichedRows=computed(()=>{
    const docTotalCost={},docSkuSum={};
    rows.forEach(row=>{
      if(!row.totalCost||row.totalCost<=0)return;
      const key=row.middleOrder;
      if(!docTotalCost[key]){
        docTotalCost[key]=row.totalCost;
        docSkuSum[key]=0;
      }
      docSkuSum[key]+=(row.unitCost||0)*(row.shippedQty||0);
    });
    return rows.map(row=>{
      const key=row.middleOrder;
      let diff=null;
      if(docTotalCost[key]&&(row.unitCost||0)>0){
        diff=docTotalCost[key]-docSkuSum[key];
      }
      return {...row,diff};
    });
  });

  const filteredRows=computed(()=>enrichedRows.value.filter(row=>{
    const start=applied.createdRange?.[0],end=applied.createdRange?.[1];
    const hasDate=Boolean(row.createdAt&&row.createdAt!=='—');
    if(applied.hasDiff==='yes'&&(row.diff===null||Math.abs(row.diff)<0.001))return false;
    if(applied.hasDiff==='no'&&row.diff!==null&&Math.abs(row.diff)>=0.001)return false;
    return textMatch(row.sku,applied.sku)&&textMatch(row[applied.orderType],applied.orderNo)&&textMatch(row.planNo,applied.planNo)&&inMulti(row.destination,applied.destinations)&&inMulti(row.platform,applied.platforms)&&inMulti(row.store,applied.stores)&&inMulti(row.team,applied.teams)&&inMulti(row.transport,applied.transports)&&inMulti(row.channel,applied.channels)&&(!start||(hasDate&&row.createdAt>=start))&&(!end||(hasDate&&row.createdAt<=end));
  }));

  const pageRows=computed(()=>{const start=(page.value-1)*pageSize.value;return filteredRows.value.slice(start,start+pageSize.value)});

  // 合计是基于全部查询结果的（不分页）
  const totalCostSum=computed(()=>{
    const seen=new Set();
    let sum=0;
    filteredRows.value.forEach(row=>{
      if(row.totalCost&&!seen.has(row.middleOrder)){seen.add(row.middleOrder);sum+=row.totalCost;}
    });
    return sum.toFixed(2);
  });

  const totalUnitCostSum=computed(()=>{
    return filteredRows.value.reduce((s,row)=>s+(row.unitCost||0)*(row.shippedQty||0),0).toFixed(2);
  });

  const applyQuery=()=>{Object.assign(applied,JSON.parse(JSON.stringify(query)));page.value=1;ElementPlus.ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条明细`)};
  const resetQuery=()=>{Object.assign(query,{sku:'',skuType:'sku',orderType:'middleOrder',orderNo:'',planNo:'',destinations:[],platforms:[],stores:[],teams:[],transports:[],channels:[],creators:[],createdRange:[],hasDiff:''});applyQuery()};
  const refreshData=async()=>{refreshing.value=true;await new Promise(resolve=>setTimeout(resolve,450));refreshing.value=false;ElementPlus.ElMessage.success('数据已刷新')};
  const csvEscape=value=>`"${String(value??'').replaceAll('"','""')}"`;
  const exportData=()=>{const headers=['目的仓','中台发货单号','ERP发货单号','平台','店铺','团队','SKU','发货计划','实际发货数量','收货数量','发货单总费用','SKU单位头程成本（CNY）','差异','运输方式','物流渠道','创建时间'];const lines=[headers,...filteredRows.value.map(row=>[row.destination,row.middleOrder,row.erpOrder,row.platform,row.store,row.team,row.sku,row.planNo,row.shippedQty,row.receiveQty,row.totalCost||'—',row.unitCost!=null?row.unitCost:'—',row.diff!=null?(Math.abs(row.diff)<0.001?'0':row.diff.toFixed(2)):'—',row.transport,row.channel,row.createdAt])].map(line=>line.map(csvEscape).join(','));const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='头程费用明细.csv';link.click();URL.revokeObjectURL(url);ElementPlus.ElMessage.success(`已导出 ${filteredRows.value.length} 条明细`)};
  const navigate=pageKey=>{if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page:pageKey},'*');else if(navRoutes[pageKey])window.location.href=navRoutes[pageKey]};
  return{query,queryExpanded,hasAdvanced,destinations,platforms,stores,teams,transports,channels,creators,filteredRows,pageRows,page,pageSize,refreshing,totalCostSum,totalUnitCostSum,applyQuery,resetQuery,refreshData,exportData,navigate};
}}).use(ElementPlus).mount('#app');

document.querySelectorAll('[data-page-nav]').forEach(item=>item.addEventListener('click',()=>{
  const page=item.dataset.pageNav;
  if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page},'*');
  else if(navRoutes[page])window.location.href=navRoutes[page];
}));
