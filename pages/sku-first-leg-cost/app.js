const {createApp,ref,reactive,computed,nextTick,onMounted}=Vue;

const splitValues=value=>String(value||'').split(/[\s,，、;；]+/).map(item=>item.trim()).filter(Boolean).map(item=>item.toLowerCase());
const textMatch=(value,query)=>{const terms=splitValues(query);if(!terms.length)return true;const source=String(value||'').toLowerCase();return terms.some(term=>source.includes(term));};
const inMulti=(value,selected)=>!selected.length||selected.includes(value);

// 金额统一四舍五入保留 2 位小数；不用直接 toFixed，避免 4.105 → 4.10 这类浮点误差
const round2=value=>{const n=Number(value);if(!Number.isFinite(n))return 0;const sign=n<0?-1:1;return sign*(Math.round((Math.abs(n)+Number.EPSILON)*100)/100);};
const money=value=>{if(value===null||value===undefined||value===''||!Number.isFinite(Number(value)))return '—';return round2(value).toFixed(2);};
const percent=value=>{const n=Number(value);if(!Number.isFinite(n))return '—';return `${round2(n*100)}%`;};

// 目的仓 → 目的国（发货单目的仓带出国家）
const countryByDestination={'美国西部仓':'美国','德国仓':'德国','洛杉矶海外仓':'美国','美国东部仓':'美国','英国仓':'英国','日本仓':'日本'};

// 发货单级清关税费总额（发货单上录入的总数）
const clearanceTotals={
  DN20260808001:1080.87,DN20260808002:856.97,DN20260808003:373.30,
  DN20260808004:86.70,DN20260808005:180.40,DN20260808006:126.49
};

// 商品资料「物流报关清关 → 清关费用」：按 SKU + 国家维护的清关单价、清关税率（原型按人民币处理，不做币种折算）
const clearanceProfiles={
  '美国':{
    'SPU-1001-BL':{price:2.00,rate:0.05},'SPU-1001-WH':{price:2.00,rate:0.05},'SPU-2003':{price:1.80,rate:0.05},
    'SPU-6001':{price:2.20,rate:0.05},'SPU-9001':{price:2.50,rate:0.05},
    'EB-01016-001':{price:1.20,rate:0.05},'EB-01017-001':{price:1.20,rate:0.05}
  },
  '德国':{'SPU-3001':{price:2.00,rate:0.05},'SPU-4001':{price:1.50,rate:0.10}},
  '英国':{'SH-UK-0021':{price:1.60,rate:0.20},'SH-UK-0022':{price:1.60,rate:0.20}},
  '日本':{'JP-1008':{price:2.00,rate:0.10}}
};

// 一行只会命中海外仓 SKU 或 FNSKU 其中之一（平台仓用 FNSKU，海外仓用海外仓 SKU）
const rows=[
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 旗舰店',team:'北美一组',sku:'SPU-1001-BL',fnsku:'X00SPU1001',planNo:'FP20260806011',shippedQty:500,receiveQty:499,unitFreightCost:2.9100,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 旗舰店',team:'北美一组',sku:'SPU-1001-WH',fnsku:'X00SPU1002',planNo:'FP20260806012',shippedQty:400,receiveQty:400,unitFreightCost:2.6000,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 运动店',team:'北美二组',sku:'SPU-2003',fnsku:'X00SPU2003',planNo:'FP20260806013',shippedQty:300,receiveQty:300,unitFreightCost:3.1200,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'德国仓',middleOrder:'DN20260808002',erpOrder:'EC20260808002',platform:'Amazon DE',store:'Amazon-DE 家居店',team:'欧洲组',sku:'SPU-3001',fnsku:'X00SPU3001',planNo:'FP20260805021',shippedQty:380,receiveQty:374,unitFreightCost:3.9800,totalCost:3276.98,transport:'空运',channel:'DHL 标准',createdAt:'2026-08-10'},
  {destination:'德国仓',middleOrder:'DN20260808002',erpOrder:'EC20260808002',platform:'Amazon DE',store:'Amazon-DE 家居店',team:'欧洲组',sku:'SPU-4001',fnsku:'X00SPU4001',planNo:'FP20260808041',shippedQty:250,receiveQty:250,unitFreightCost:4.8500,totalCost:3276.98,transport:'空运',channel:'DHL 标准',createdAt:'2026-08-10'},
  {destination:'洛杉矶海外仓',middleOrder:'DN20260808003',erpOrder:'EC20260808003',platform:'Walmart',store:'Walmart-US 家居店',team:'北美二组',sku:'SPU-6001',overseasSku:'US-SPU6001',planNo:'FP20260807001',shippedQty:200,receiveQty:200,unitFreightCost:2.2500,totalCost:1521.28,transport:'快递',channel:'UPS 专线',createdAt:'2026-08-10'},
  {destination:'洛杉矶海外仓',middleOrder:'DN20260808003',erpOrder:'EC20260808003',platform:'Amazon US',store:'Amazon-US 户外店',team:'北美一组',sku:'SPU-9001',fnsku:'X00SPU9001',planNo:'FP20260808021',shippedQty:200,receiveQty:198,unitFreightCost:3.6300,totalCost:1521.28,transport:'海运',channel:'美森快船',createdAt:'2026-08-10'},
  {destination:'美国东部仓',middleOrder:'DN20260808004',erpOrder:'EC20260808004',platform:'eBay',store:'eBay-US 旗舰店',team:'北美二组',sku:'EB-01016-001',overseasSku:'US-EB01016',planNo:'FP20260808051',shippedQty:50,receiveQty:50,unitFreightCost:5.4800,totalCost:360.70,transport:'空运',channel:'快递派送',createdAt:'2026-08-11'},
  {destination:'美国东部仓',middleOrder:'DN20260808004',erpOrder:'EC20260808004',platform:'eBay',store:'eBay-US 旗舰店',team:'北美二组',sku:'EB-01017-001',overseasSku:'US-EB01017',planNo:'FP20260808052',shippedQty:0,receiveQty:0,unitFreightCost:null,totalCost:360.70,transport:'空运',channel:'快递派送',createdAt:'—'},
  {destination:'英国仓',middleOrder:'DN20260808005',erpOrder:'EC20260808005',platform:'Shopify',store:'Shopify-UK 店',team:'欧洲组',sku:'SH-UK-0021',overseasSku:'UK-SHUK0021',planNo:'FP20260808061',shippedQty:120,receiveQty:120,unitFreightCost:2.7900,totalCost:752.80,transport:'海运',channel:'英国专线',createdAt:'2026-08-11'},
  {destination:'英国仓',middleOrder:'DN20260808005',erpOrder:'EC20260808005',platform:'Shopify',store:'Shopify-UK 店',team:'欧洲组',sku:'SH-UK-0022',overseasSku:'UK-SHUK0022',planNo:'FP20260808062',shippedQty:80,receiveQty:78,unitFreightCost:2.9700,totalCost:752.80,transport:'海运',channel:'英国专线',createdAt:'2026-08-11'},
  {destination:'日本仓',middleOrder:'DN20260808006',erpOrder:'EC20260808006',platform:'Amazon JP',store:'Amazon-JP 店',team:'亚太组',sku:'JP-1008',fnsku:'X00JP1008',planNo:'FP20260808071',shippedQty:65,receiveQty:65,unitFreightCost:6.1800,totalCost:528.19,transport:'空运',channel:'日本专线',createdAt:'2026-08-12'}
];

const unique=key=>[...new Set(rows.map(row=>row[key]).filter(value=>value&&value!=='—'))];

const app=createApp({setup(){
  const query=reactive({sku:'',skuType:'sku',orderType:'middleOrder',orderNo:'',planNo:'',destinations:[],countries:[],platforms:[],stores:[],teams:[],transports:[],channels:[],createdRange:[],hasDiff:''});
  const applied=reactive(JSON.parse(JSON.stringify(query)));
  const page=ref(1),pageSize=ref(20),queryExpanded=ref(false),queryOverflow=ref(false),queryGridRef=ref(null);
  const destinations=unique('destination'),platforms=unique('platform'),stores=unique('store'),teams=unique('team'),transports=unique('transport'),channels=unique('channel'),countries=[...new Set(Object.values(countryByDestination))];

  const skuPlaceholder=computed(()=>`请输入${query.skuType==='overseasSku'?'海外仓 SKU':query.skuType==='fnsku'?'FNSKU':'SKU'}，支持输入多个，用逗号、空格或换行隔开`);
  const orderPlaceholder=computed(()=>`请输入${query.orderType==='erpOrder'?'易仓 ERP 单号':'中台发货单号'}，支持输入多个，用逗号、空格或换行隔开`);

  // 清关税费分摊：权重 = 实际发货数量 × 目的国清关单价 × 清关税率，按权重占比分摊发货单清关税费总额
  // 总单位头程成本 = 单位物流费用分摊 + 单位清关税费分摊
  // 任一参与分摊的 SKU 缺少清关单价/税率时，该发货单整体不做清关分摊并提示具体缺失项，避免把总额错误摊到其他 SKU
  const enrichedRows=computed(()=>{
    const docTotalCost={},docWeight={},docIssues={};
    rows.forEach(row=>{
      if(row.totalCost&&row.totalCost>0)docTotalCost[row.middleOrder]=row.totalCost;
      if((row.shippedQty||0)<=0)return;
      const country=countryByDestination[row.destination];
      const profile=clearanceProfiles[country]?.[row.sku];
      const missing=[];
      if(!profile)missing.push('清关单价','清关税率');
      else{
        if(profile.price==null)missing.push('清关单价');
        if(profile.rate==null)missing.push('清关税率');
      }
      if(missing.length){
        (docIssues[row.middleOrder]=docIssues[row.middleOrder]||[]).push({sku:row.sku,country,fields:missing});
        return;
      }
      docWeight[row.middleOrder]=(docWeight[row.middleOrder]||0)+(row.shippedQty||0)*profile.price*profile.rate;
    });
    const baseRows=rows.map(row=>{
      const country=countryByDestination[row.destination];
      const profile=clearanceProfiles[country]?.[row.sku];
      const missing=[];
      if((row.shippedQty||0)>0){
        if(!profile)missing.push('清关单价','清关税率');
        else{
          if(profile.price==null)missing.push('清关单价');
          if(profile.rate==null)missing.push('清关税率');
        }
      }
      const blocked=Boolean(docIssues[row.middleOrder]);
      const weight=(row.shippedQty||0)>0&&profile&&!missing.length?(row.shippedQty||0)*profile.price*profile.rate:0;
      const totalWeight=docWeight[row.middleOrder]||0;
      let unitTariffCost=null;
      if(!blocked&&weight>0&&totalWeight>0){
        unitTariffCost=(clearanceTotals[row.middleOrder]||0)*weight/totalWeight/row.shippedQty;
      }
      const unitCost=unitTariffCost!=null?(row.unitFreightCost||0)+unitTariffCost:null;
      const clearanceTotal=clearanceTotals[row.middleOrder];
      const logisticsCost=row.totalCost!=null&&clearanceTotal!=null?row.totalCost-clearanceTotal:null;
      return {...row,country,logisticsCost,clearanceTotal,clearancePrice:profile?.price,clearanceRate:profile?.rate,clearanceMissing:missing,clearanceBlocked:blocked,unitTariffCost,unitCost};
    });
    const docSkuSum={},docFreightSum={},docTariffSum={};
    baseRows.forEach(row=>{
      if(!docTotalCost[row.middleOrder])return;
      const qty=row.shippedQty||0;
      docSkuSum[row.middleOrder]=(docSkuSum[row.middleOrder]||0)+(row.unitCost||0)*qty;
      docFreightSum[row.middleOrder]=(docFreightSum[row.middleOrder]||0)+(row.unitFreightCost||0)*qty;
      docTariffSum[row.middleOrder]=(docTariffSum[row.middleOrder]||0)+(row.unitTariffCost||0)*qty;
    });
    return baseRows.map(row=>{
      const key=row.middleOrder;
      const valid=docTotalCost[key]&&!docIssues[key]&&(row.unitCost||0)>0;
      const diff=valid?docSkuSum[key]-docTotalCost[key]:null;
      const freightDiff=valid&&row.logisticsCost!=null?docFreightSum[key]-row.logisticsCost:null;
      const tariffDiff=valid&&row.clearanceTotal!=null?docTariffSum[key]-row.clearanceTotal:null;
      return {...row,freightDiff,tariffDiff,diff};
    });
  });

  const filteredRows=computed(()=>enrichedRows.value.filter(row=>{
    const start=applied.createdRange?.[0],end=applied.createdRange?.[1];
    const hasDate=Boolean(row.createdAt&&row.createdAt!=='—');
    const diff=row.diff;
    if(applied.hasDiff==='yes'&&!(diff!=null&&Math.abs(diff)>=0.001))return false;
    if(applied.hasDiff==='no'&&!(diff!=null&&Math.abs(diff)<0.001))return false;
    if(applied.hasDiff==='missing'&&!(row.clearanceMissing&&row.clearanceMissing.length))return false;
    const skuValue=applied.skuType==='overseasSku'?row.overseasSku:applied.skuType==='fnsku'?row.fnsku:row.sku;
    return textMatch(skuValue,applied.sku)&&textMatch(row[applied.orderType],applied.orderNo)&&textMatch(row.planNo,applied.planNo)&&inMulti(row.destination,applied.destinations)&&inMulti(row.country,applied.countries)&&inMulti(row.platform,applied.platforms)&&inMulti(row.store,applied.stores)&&inMulti(row.team,applied.teams)&&inMulti(row.transport,applied.transports)&&inMulti(row.channel,applied.channels)&&(!start||(hasDate&&row.createdAt>=start))&&(!end||(hasDate&&row.createdAt<=end));
  }));

  const pageRows=computed(()=>{const start=(page.value-1)*pageSize.value;return filteredRows.value.slice(start,start+pageSize.value)});

  // 当前查询结果中的清关数据缺失项（发货单 + SKU + 国家 + 具体缺失字段）
  const clearanceIssues=computed(()=>{
    const seen=new Set(),list=[];
    filteredRows.value.forEach(row=>{
      if(!row.clearanceMissing?.length)return;
      const key=`${row.middleOrder}|${row.sku}|${row.country}|${row.clearanceMissing.join(',')}`;
      if(seen.has(key))return;
      seen.add(key);
      list.push({order:row.middleOrder,sku:row.sku,country:row.country,fields:row.clearanceMissing});
    });
    return list;
  });
  const clearanceIssuesText=computed(()=>clearanceIssues.value.map(item=>`发货单 ${item.order} 的 ${item.sku}（${item.country}）缺少${item.fields.join('、')}`).join('；'));

  // 合计是基于全部查询结果的（不分页）
  const totalCostSum=computed(()=>{
    const seen=new Set();
    let sum=0;
    filteredRows.value.forEach(row=>{
      if(row.totalCost&&!seen.has(row.middleOrder)){seen.add(row.middleOrder);sum+=row.totalCost;}
    });
    return money(sum);
  });

  const totalLogisticsSum=computed(()=>{
    const seen=new Set();
    let sum=0;
    filteredRows.value.forEach(row=>{
      if(row.logisticsCost!=null&&!seen.has(row.middleOrder)){seen.add(row.middleOrder);sum+=row.logisticsCost;}
    });
    return money(sum);
  });

  const totalClearanceSum=computed(()=>{
    const seen=new Set();
    let sum=0;
    filteredRows.value.forEach(row=>{
      if(row.clearanceTotal!=null&&!seen.has(row.middleOrder)){seen.add(row.middleOrder);sum+=row.clearanceTotal;}
    });
    return money(sum);
  });

  const totalUnitCostSum=computed(()=>money(filteredRows.value.reduce((s,row)=>s+(row.unitCost||0)*(row.shippedQty||0),0)));
  const totalFreightSum=computed(()=>money(filteredRows.value.reduce((s,row)=>s+(row.unitFreightCost||0)*(row.shippedQty||0),0)));
  const totalTariffSum=computed(()=>money(filteredRows.value.reduce((s,row)=>s+(row.unitTariffCost||0)*(row.shippedQty||0),0)));

  // 差异合计：按发货单去重（同单多行差异相同），基于全部查询结果而非当前页
  const diffTotalSum=computed(()=>{
    const seen=new Set();
    let sum=0;
    filteredRows.value.forEach(row=>{
      if(row.diff!=null&&!seen.has(row.middleOrder)){seen.add(row.middleOrder);sum+=row.diff;}
    });
    return money(sum);
  });

  // 发货单查看弹窗：按中台发货单号汇总该单全部 SKU 明细
  const detailVisible=ref(false),detailOrder=ref('');
  const detailRows=computed(()=>detailOrder.value?enrichedRows.value.filter(row=>row.middleOrder===detailOrder.value):[]);
  const detailDoc=computed(()=>{
    const list=detailRows.value;
    if(!list.length)return null;
    const first=list[0];
    const dateRow=list.find(row=>row.createdAt&&row.createdAt!=='—');
    return {...first,createdAt:dateRow?dateRow.createdAt:first.createdAt,skuCount:list.length,
      country:countryByDestination[first.destination]||'—',
      clearanceTotal:clearanceTotals[first.middleOrder]||0,
      shippedTotal:list.reduce((s,row)=>s+(row.shippedQty||0),0),
      receiveTotal:list.reduce((s,row)=>s+(row.receiveQty||0),0)};
  });
  const openShipmentDetail=order=>{detailOrder.value=order;detailVisible.value=true;};
  const detailIssuesText=computed(()=>{
    const seen=new Set(),list=[];
    detailRows.value.forEach(row=>{
      if(!row.clearanceMissing?.length)return;
      const key=`${row.sku}|${row.country}|${row.clearanceMissing.join(',')}`;
      if(seen.has(key))return;
      seen.add(key);
      list.push({sku:row.sku,country:row.country,fields:row.clearanceMissing});
    });
    return list.map(item=>`${item.sku}（${item.country}）缺少${item.fields.join('、')}`).join('；');
  });

  const diffTotalZero=computed(()=>Math.abs(Number(diffTotalSum.value))<0.005);
  // 表格底部整行合计：基于全部查询结果（不分页）
  const summaryMethod=({columns})=>{
    const sums=new Array(columns.length).fill('');
    sums[0]='合计（CNY）';
    sums[6]=totalCostSum.value;
    sums[7]=totalLogisticsSum.value;
    sums[8]=totalClearanceSum.value;
    sums[9]=totalUnitCostSum.value;
    sums[10]=totalFreightSum.value;
    sums[11]=totalTariffSum.value;
    sums[14]=diffTotalSum.value;
    return sums;
  };

  const applyQuery=()=>{Object.assign(applied,JSON.parse(JSON.stringify(query)));page.value=1;ElementPlus.ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条明细`)};
  const resetQuery=()=>{Object.assign(query,{sku:'',skuType:'sku',orderType:'middleOrder',orderNo:'',planNo:'',destinations:[],countries:[],platforms:[],stores:[],teams:[],transports:[],channels:[],createdRange:[],hasDiff:''});applyQuery()};

  // 溢出检测（与发货单一致）：按查询项实际位置计算行数，给第三行起的项打 overflow 标记
  const layoutQuery=()=>{
    const grid=queryGridRef.value;if(!grid)return;
    const items=[...grid.querySelectorAll('.query-item:not(.query-action-item)')];
    items.forEach(item=>item.classList.remove('query-overflow-item'));
    const tops=[...new Set(items.map(item=>Math.round(item.getBoundingClientRect().top)))].sort((a,b)=>a-b);
    const overflowTop=tops[2];
    const overflowItems=overflowTop===undefined?[]:items.filter(item=>Math.round(item.getBoundingClientRect().top)>=overflowTop);
    overflowItems.forEach(item=>item.classList.add('query-overflow-item'));
    queryOverflow.value=overflowItems.length>0;
    if(!queryOverflow.value)queryExpanded.value=false;
  };
  onMounted(()=>{nextTick(()=>{layoutQuery();let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(layoutQuery,80)})})});
  const csvEscape=value=>`"${String(value??'').replaceAll('"','""')}"`;
  const exportData=()=>{const headers=['目的仓','国家','中台发货单号','易仓 ERP 单号','SKU','海外仓 SKU','FNSKU','实际发货数量','收货数量','发货单总费用','物流费用','清关税费','总单位头程成本','单位物流费用分摊','单位清关税费分摊','清关单价','清关税率','物流费用差异','清关税费差异','运输方式','物流渠道','创建时间'];const lines=[headers,...filteredRows.value.map(row=>[row.destination,row.country||'—',row.middleOrder,row.erpOrder,row.sku,row.overseasSku||'—',row.fnsku||'—',row.shippedQty,row.receiveQty,money(row.totalCost),money(row.logisticsCost),money(row.clearanceTotal),money(row.unitCost),money(row.unitFreightCost),money(row.unitTariffCost),money(row.clearancePrice),percent(row.clearanceRate),money(row.freightDiff),money(row.tariffDiff),row.transport,row.channel,row.createdAt])].map(line=>line.map(csvEscape).join(','));const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='头程费用明细.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),0);ElementPlus.ElMessage.success(`已导出 ${filteredRows.value.length} 条明细`)};
  return{query,queryExpanded,queryOverflow,queryGridRef,destinations,countries,platforms,stores,teams,transports,channels,filteredRows,pageRows,page,pageSize,totalCostSum,totalLogisticsSum,totalClearanceSum,totalUnitCostSum,totalFreightSum,totalTariffSum,diffTotalSum,diffTotalZero,summaryMethod,skuPlaceholder,orderPlaceholder,money,percent,applyQuery,resetQuery,exportData,detailVisible,detailDoc,detailRows,openShipmentDetail,clearanceIssues,clearanceIssuesText,detailIssuesText};
}}).use(ElementPlus).mount('#app');
