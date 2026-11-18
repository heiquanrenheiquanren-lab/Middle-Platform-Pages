const {createApp,ref,reactive,computed}=Vue;

const splitValues=value=>String(value||'').split(/[\s,，、;；]+/).map(item=>item.trim()).filter(Boolean).map(item=>item.toLowerCase());
const textMatch=(value,query)=>{const terms=splitValues(query);if(!terms.length)return true;const source=String(value||'').toLowerCase();return terms.some(term=>source.includes(term));};
const inMulti=(value,selected)=>!selected.length||selected.includes(value);

// 金额统一四舍五入保留 2 位小数；不用直接 toFixed，避免 4.105 → 4.10 这类浮点误差
const round2=value=>{const n=Number(value);if(!Number.isFinite(n))return 0;const sign=n<0?-1:1;return sign*(Math.round((Math.abs(n)+Number.EPSILON)*100)/100);};
const money=value=>{if(value===null||value===undefined||value===''||!Number.isFinite(Number(value)))return '—';return round2(value).toFixed(2);};
const percent=value=>{const n=Number(value);if(!Number.isFinite(n))return '—';return `${round2(n*100)}%`;};

// 目的仓 → 目的国（发货单目的仓带出国家）与 2 位国家代码（列表与筛选统一展示为「国家（代码）」）
const countryByDestination={'美国西部仓':'美国','德国仓':'德国','洛杉矶海外仓':'美国','美国东部仓':'美国','英国仓':'英国','日本仓':'日本'};
const countryCodeByName={'美国':'US','德国':'DE','英国':'GB','日本':'JP'};
const formatCountry=name=>name?(countryCodeByName[name]?`${name}（${countryCodeByName[name]}）`:name):'—';

// 运输方式 → 体积参数（cm³ / kg），用于计算体积重：长 × 宽 × 高 ÷ 体积参数
const volumeFactorByTransport={'海运':8000,'空运':5000,'快递':5000};

// 商品资料「尺寸重量 → 包装规格」：长(cm)、宽(cm)、高(cm)、毛重(kg)
const productPackageSpecs={
  'SPU-1001-BL':{length:35,width:21,height:29,weight:0.98},
  'SPU-1001-WH':{length:35,width:21,height:29,weight:0.92},
  'SPU-2003':{length:40,width:25,height:30,weight:1.15},
  'SPU-3001':{length:30,width:20,height:25,weight:1.40},
  'SPU-4001':{length:32,width:22,height:28,weight:1.75},
  'SPU-6001':{length:28,width:18,height:20,weight:0.85},
  // 缺失包装宽、包装毛重 → 触发同发货单(DN20260808003)物流费用整单不分摊
  'SPU-9001':{length:32,width:null,height:24,weight:null},
  'EB-01016-001':{length:25,width:15,height:18,weight:1.20},
  'EB-01017-001':{length:25,width:15,height:18,weight:1.10},
  'SH-UK-0021':{length:30,width:20,height:22,weight:1.05},
  'SH-UK-0022':{length:32,width:22,height:20,weight:1.12},
  'JP-1008':{length:26,width:18,height:20,weight:1.30}
};

// 发货单级清关税费总额（发货单上录入的总数）
const clearanceTotals={
  DN20260808001:1080.87,DN20260808002:856.97,DN20260808003:373.30,
  DN20260808004:86.70,DN20260808005:180.40,DN20260808006:126.49
};

// 商品资料「物流报关清关 → 清关费用」：按 SKU + 国家维护（国家、清关单价、清关税率整组维护，要么齐全要么全缺失）
const clearanceProfiles={
  '美国':{
    'SPU-1001-BL':{price:2.00,rate:0.05},'SPU-1001-WH':{price:2.00,rate:0.05},'SPU-2003':{price:1.80,rate:0.05},
    'SPU-6001':{price:2.20,rate:0.05},'SPU-9001':{price:2.50,rate:0.05},
    'EB-01016-001':{price:1.20,rate:0.05},'EB-01017-001':{price:1.20,rate:0.05}
  },
  '德国':{'SPU-3001':{price:2.00,rate:0.05},'SPU-4001':{price:1.50,rate:0.10}},
  // SH-UK-0022 未维护英国清关资料（国家/单价/税率整组缺失）→ 触发 DN20260808005 清关费用整单不分摊
  '英国':{'SH-UK-0021':{price:1.60,rate:0.20}},
  // JP-1008 清关税率为 0%，导致清关权重合计为 0（但已录入清关税费 126.49）→ 触发清关权重为 0 异常
  '日本':{'JP-1008':{price:2.00,rate:0}}
};

// 一行只会命中海外仓 SKU 或 FNSKU 其中之一（平台仓用 FNSKU，海外仓用海外仓 SKU）
const rows=[
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 旗舰店',team:'北美一组',sku:'SPU-1001-BL',fnsku:'X00SPU1001',planNo:'FP20260806011',shippedQty:500,receiveQty:499,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 旗舰店',team:'北美一组',sku:'SPU-1001-WH',fnsku:'X00SPU1002',planNo:'FP20260806012',shippedQty:400,receiveQty:400,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'美国西部仓',middleOrder:'DN20260808001',erpOrder:'EC20260808001',platform:'Amazon US',store:'Amazon-US 运动店',team:'北美二组',sku:'SPU-2003',fnsku:'X00SPU2003',planNo:'FP20260806013',shippedQty:300,receiveQty:300,totalCost:1913.25,transport:'海运',channel:'标准海运',createdAt:'2026-08-09'},
  {destination:'德国仓',middleOrder:'DN20260808002',erpOrder:'EC20260808002',platform:'Amazon DE',store:'Amazon-DE 家居店',team:'欧洲组',sku:'SPU-3001',fnsku:'X00SPU3001',planNo:'FP20260805021',shippedQty:380,receiveQty:374,totalCost:3276.98,transport:'空运',channel:'DHL 标准',createdAt:'2026-08-10'},
  {destination:'德国仓',middleOrder:'DN20260808002',erpOrder:'EC20260808002',platform:'Amazon DE',store:'Amazon-DE 家居店',team:'欧洲组',sku:'SPU-4001',fnsku:'X00SPU4001',planNo:'FP20260808041',shippedQty:250,receiveQty:250,totalCost:3276.98,transport:'空运',channel:'DHL 标准',createdAt:'2026-08-10'},
  {destination:'洛杉矶海外仓',middleOrder:'DN20260808003',erpOrder:'EC20260808003',platform:'Walmart',store:'Walmart-US 家居店',team:'北美二组',sku:'SPU-6001',overseasSku:'US-SPU6001',planNo:'FP20260807001',shippedQty:200,receiveQty:200,totalCost:1521.28,transport:'快递',channel:'UPS 专线',createdAt:'2026-08-10'},
  {destination:'洛杉矶海外仓',middleOrder:'DN20260808003',erpOrder:'EC20260808003',platform:'Amazon US',store:'Amazon-US 户外店',team:'北美一组',sku:'SPU-9001',fnsku:'X00SPU9001',planNo:'FP20260808021',shippedQty:200,receiveQty:198,totalCost:1521.28,transport:'海运',channel:'美森快船',createdAt:'2026-08-10'},
  {destination:'美国东部仓',middleOrder:'DN20260808004',erpOrder:'EC20260808004',platform:'eBay',store:'eBay-US 旗舰店',team:'北美二组',sku:'EB-01016-001',overseasSku:'US-EB01016',planNo:'FP20260808051',shippedQty:50,receiveQty:50,totalCost:360.70,transport:'空运',channel:'快递派送',createdAt:'2026-08-11'},
  {destination:'美国东部仓',middleOrder:'DN20260808004',erpOrder:'EC20260808004',platform:'eBay',store:'eBay-US 旗舰店',team:'北美二组',sku:'EB-01017-001',overseasSku:'US-EB01017',planNo:'FP20260808052',shippedQty:0,receiveQty:0,totalCost:360.70,transport:'空运',channel:'快递派送',createdAt:'—'},
  {destination:'英国仓',middleOrder:'DN20260808005',erpOrder:'EC20260808005',platform:'Shopify',store:'Shopify-UK 店',team:'欧洲组',sku:'SH-UK-0021',overseasSku:'UK-SHUK0021',planNo:'FP20260808061',shippedQty:120,receiveQty:120,totalCost:752.80,transport:'海运',channel:'英国专线',createdAt:'2026-08-11'},
  {destination:'英国仓',middleOrder:'DN20260808005',erpOrder:'EC20260808005',platform:'Shopify',store:'Shopify-UK 店',team:'欧洲组',sku:'SH-UK-0022',overseasSku:'UK-SHUK0022',planNo:'FP20260808062',shippedQty:80,receiveQty:78,totalCost:752.80,transport:'海运',channel:'英国专线',createdAt:'2026-08-11'},
  {destination:'日本仓',middleOrder:'DN20260808006',erpOrder:'EC20260808006',platform:'Amazon JP',store:'Amazon-JP 店',team:'亚太组',sku:'JP-1008',fnsku:'X00JP1008',planNo:'FP20260808071',shippedQty:65,receiveQty:65,totalCost:528.19,transport:'空运',channel:'日本专线',createdAt:'2026-08-12'}
];

const unique=key=>[...new Set(rows.map(row=>row[key]).filter(value=>value&&value!=='—'))];

const app=createApp({setup(){
  const query=reactive({sku:'',skuType:'sku',orderType:'middleOrder',orderNo:'',planNo:'',destinations:[],countries:[],platforms:[],stores:[],teams:[],transports:[],channels:[],createdRange:[],hasDiff:'',hasAnomaly:''});
  const applied=reactive(JSON.parse(JSON.stringify(query)));
  const page=ref(1),pageSize=ref(20);
  const destinations=unique('destination'),platforms=unique('platform'),stores=unique('store'),teams=unique('team'),transports=unique('transport'),channels=unique('channel'),countries=[...new Set(Object.values(countryByDestination).map(formatCountry))];

  const skuPlaceholder=computed(()=>`请输入${query.skuType==='overseasSku'?'海外仓 SKU':query.skuType==='fnsku'?'FNSKU':'SKU'}，支持输入多个，用逗号、空格或换行隔开`);
  const orderPlaceholder=computed(()=>`请输入${query.orderType==='erpOrder'?'易仓 ERP 单号':'中台发货单号'}，支持输入多个，用逗号、空格或换行隔开`);

  // 物流费用分摊（按计费重占比）与清关税费分摊（按权重占比）相互独立：
  // 1. 任一参与分摊的 SKU（shippedQty > 0）缺失对应依据，或单据级配置缺失/权重为 0，对应费用项整单不分摊，不能分摊给剩余 SKU；
  // 2. 两条费用线互不影响：一方受阻时，另一方仍正常分摊并计入对应合计，仅「总单位头程成本」因缺项显示「—」。
  const enrichedRows=computed(()=>{
    const docMeta={};
    rows.forEach(row=>{
      const key=row.middleOrder;
      if(!docMeta[key]){
        const clearanceTotal=clearanceTotals[key];
        const logisticsCost=row.totalCost!=null&&clearanceTotal!=null?round2(row.totalCost-clearanceTotal):null;
        docMeta[key]={
          totalCost:row.totalCost,
          clearanceTotal,
          logisticsCost,
          chargeWeight:0,
          clearanceWeight:0,
          logisticsIssues:[],
          logisticsSeen:new Set(),
          clearanceIssues:[],
          clearanceSeen:new Set()
        };
      }
      const meta=docMeta[key];
      const qty=row.shippedQty||0;
      if(qty<=0)return;

      // 校验物流分摊依据（仅在存在待分摊物流费用 > 0 时校验）
      if((meta.logisticsCost||0)>0){
        const factor=volumeFactorByTransport[row.transport]||5000;
        const spec=productPackageSpecs[row.sku];
        const missingSpec=[];
        if(!spec)missingSpec.push('包装长','包装宽','包装高','包装毛重');
        else{
          if(!(Number(spec.length)>0))missingSpec.push('包装长');
          if(!(Number(spec.width)>0))missingSpec.push('包装宽');
          if(!(Number(spec.height)>0))missingSpec.push('包装高');
          if(!(Number(spec.weight)>0))missingSpec.push('包装毛重');
        }
        if(missingSpec.length){
          const msg=`SKU ${row.sku} 缺少${missingSpec.join('、')}`;
          if(!meta.logisticsSeen.has(msg)){meta.logisticsSeen.add(msg);meta.logisticsIssues.push(msg);}
        }else{
          const actualWeight=spec.weight*qty;
          const volumeWeight=(spec.length*spec.width*spec.height/factor)*qty;
          meta.chargeWeight+=Math.max(actualWeight,volumeWeight);
        }
      }

      // 校验清关分摊依据（仅在存在待分摊清关税费 > 0 时校验；国家、单价、税率同组维护，要么齐全要么全缺失）
      if((meta.clearanceTotal||0)>0){
        const country=countryByDestination[row.destination];
        const profile=clearanceProfiles[country]?.[row.sku];
        if(!profile||profile.price==null||profile.rate==null){
          const msg=`SKU ${row.sku}（${country||'—'}）未维护清关资料（国家/清关单价/清关税率）`;
          if(!meta.clearanceSeen.has(msg)){meta.clearanceSeen.add(msg);meta.clearanceIssues.push(msg);}
        }else{
          meta.clearanceWeight+=qty*profile.price*profile.rate;
        }
      }
    });

    Object.values(docMeta).forEach(meta=>{
      if((meta.clearanceTotal||0)>0&&!meta.clearanceIssues.length&&meta.clearanceWeight<=0){
        meta.clearanceZeroWeight=true;
        meta.clearanceIssues.push(`已录入清关税费 ¥${money(meta.clearanceTotal)}，但参与分摊的 SKU 清关单价或清关税率均为 0，无法分摊`);
      }
    });

    const baseRows=rows.map(row=>{
      const key=row.middleOrder;
      const meta=docMeta[key];
      const country=countryByDestination[row.destination];
      const qty=row.shippedQty||0;
      const spec=productPackageSpecs[row.sku];
      const factor=volumeFactorByTransport[row.transport]||5000;
      const profile=clearanceProfiles[country]?.[row.sku];

      // 单行物流缺失判定（仅 shippedQty > 0 且物流费用 > 0）
      let logisticsRowIssue='';
      if(qty>0&&(meta.logisticsCost||0)>0){
        const missingSpec=[];
        if(!spec)missingSpec.push('包装长','包装宽','包装高','包装毛重');
        else{
          if(!(Number(spec.length)>0))missingSpec.push('包装长');
          if(!(Number(spec.width)>0))missingSpec.push('包装宽');
          if(!(Number(spec.height)>0))missingSpec.push('包装高');
          if(!(Number(spec.weight)>0))missingSpec.push('包装毛重');
        }
        if(missingSpec.length)logisticsRowIssue=`缺少${missingSpec.join('、')}`;
      }

      // 单行清关缺失判定（国家、清关单价、清关税率整组维护）
      let clearanceRowIssue='';
      const clearanceProfileMissing=qty>0&&(meta.clearanceTotal||0)>0&&(!profile||profile.price==null||profile.rate==null);
      if(clearanceProfileMissing){
        clearanceRowIssue=`${row.sku}（${country||'—'}）未维护清关资料（国家/清关单价/清关税率）`;
      }else if(qty>0&&meta.clearanceZeroWeight){
        clearanceRowIssue='已录入清关税费，但同单 SKU 的清关单价或清关税率均为 0，无法分摊';
      }

      const logisticsBlocked=meta.logisticsIssues.length>0;
      const clearanceBlocked=meta.clearanceIssues.length>0;
      const hasAnomaly=logisticsBlocked||clearanceBlocked;

      let unitFreightCost=null;
      if(qty>0&&meta.logisticsCost!=null){
        if(meta.logisticsCost===0)unitFreightCost=0;
        else if(!logisticsBlocked&&meta.chargeWeight>0){
          const rowChargeWeight=Math.max(spec.weight*qty,(spec.length*spec.width*spec.height/factor)*qty);
          unitFreightCost=meta.logisticsCost*(rowChargeWeight/meta.chargeWeight)/qty;
        }
      }

      let unitTariffCost=null;
      if(qty>0&&meta.clearanceTotal!=null){
        if(meta.clearanceTotal===0)unitTariffCost=0;
        else if(!clearanceBlocked&&meta.clearanceWeight>0){
          const rowWeight=qty*profile.price*profile.rate;
          unitTariffCost=meta.clearanceTotal*(rowWeight/meta.clearanceWeight)/qty;
        }
      }

      const unitCost=unitFreightCost!=null&&unitTariffCost!=null?unitFreightCost+unitTariffCost:null;
      const orderAnomalyMessages=[
        ...meta.logisticsIssues.map(msg=>`【物流分摊异常】${msg}`),
        ...meta.clearanceIssues.map(msg=>`【清关分摊异常】${msg}`)
      ];

      return {
        ...row,
        country:formatCountry(country),
        packageSpec:spec,
        logisticsCost:meta.logisticsCost,
        clearanceTotal:meta.clearanceTotal,
        clearancePrice:profile?.price??null,
        clearanceRate:profile?.rate??null,
        logisticsRowIssue,
        clearanceRowIssue,
        clearanceZeroWeight:Boolean(meta.clearanceZeroWeight),
        logisticsBlocked,
        clearanceBlocked,
        logisticsBlockReason:logisticsBlocked?`整单物流不分摊：${meta.logisticsIssues.join('；')}`:'',
        clearanceBlockReason:clearanceBlocked?`整单清关不分摊：${meta.clearanceIssues.join('；')}`:'',
        hasAnomaly,
        orderAnomalyMessages,
        unitFreightCost,
        unitTariffCost,
        unitCost
      };
    });

    const docFreightSum={},docTariffSum={};
    baseRows.forEach(row=>{
      const key=row.middleOrder,qty=row.shippedQty||0;
      if(row.unitFreightCost!=null)docFreightSum[key]=(docFreightSum[key]||0)+row.unitFreightCost*qty;
      if(row.unitTariffCost!=null)docTariffSum[key]=(docTariffSum[key]||0)+row.unitTariffCost*qty;
    });

    return baseRows.map(row=>{
      const key=row.middleOrder,qty=row.shippedQty||0;
      const freightValid=qty>0&&row.logisticsCost!=null&&!row.logisticsBlocked;
      const tariffValid=qty>0&&row.clearanceTotal!=null&&!row.clearanceBlocked;
      const freightDiff=freightValid?(docFreightSum[key]||0)-row.logisticsCost:null;
      const tariffDiff=tariffValid?(docTariffSum[key]||0)-row.clearanceTotal:null;
      const diff=(freightDiff!=null||tariffDiff!=null)?(freightDiff||0)+(tariffDiff||0):null;
      return {...row,freightDiff,tariffDiff,diff};
    });
  });

  const filteredRows=computed(()=>enrichedRows.value.filter(row=>{
    const start=applied.createdRange?.[0],end=applied.createdRange?.[1];
    const hasDate=Boolean(row.createdAt&&row.createdAt!=='—');
    const diff=row.diff;
    if(applied.hasDiff==='yes'&&!(diff!=null&&Math.abs(diff)>=0.005))return false;
    if(applied.hasDiff==='no'&&!(row.unitCost!=null&&diff!=null&&Math.abs(diff)<0.005))return false;
    if(applied.hasAnomaly==='yes'&&!row.hasAnomaly)return false;
    if(applied.hasAnomaly==='no'&&row.hasAnomaly)return false;
    const skuValue=applied.skuType==='overseasSku'?row.overseasSku:applied.skuType==='fnsku'?row.fnsku:row.sku;
    return textMatch(skuValue,applied.sku)&&textMatch(row[applied.orderType],applied.orderNo)&&textMatch(row.planNo,applied.planNo)&&inMulti(row.destination,applied.destinations)&&inMulti(row.country,applied.countries)&&inMulti(row.platform,applied.platforms)&&inMulti(row.store,applied.stores)&&inMulti(row.team,applied.teams)&&inMulti(row.transport,applied.transports)&&inMulti(row.channel,applied.channels)&&(!start||(hasDate&&row.createdAt>=start))&&(!end||(hasDate&&row.createdAt<=end));
  }));

  const pageRows=computed(()=>{const start=(page.value-1)*pageSize.value;return filteredRows.value.slice(start,start+pageSize.value)});

  // 合计是基于全部查询结果的（不分页）；仅对「总单位头程成本」「单位物流费用分摊」「单位清关税费分摊」3 列做合计
  // 计算口径：取界面四舍五入后的 2 位小数单位金额 × 对应实际发货数量，再求和
  const totalUnitCostSum=computed(()=>money(filteredRows.value.reduce((s,row)=>s+(row.unitCost!=null?round2(row.unitCost)*(row.shippedQty||0):0),0)));
  const totalFreightSum=computed(()=>money(filteredRows.value.reduce((s,row)=>s+(row.unitFreightCost!=null?round2(row.unitFreightCost)*(row.shippedQty||0):0),0)));
  const totalTariffSum=computed(()=>money(filteredRows.value.reduce((s,row)=>s+(row.unitTariffCost!=null?round2(row.unitTariffCost)*(row.shippedQty||0):0),0)));

  // 表格底部整行合计：基于全部查询结果（不分页）
  const summaryMethod=({columns})=>{
    const sums=new Array(columns.length).fill('');
    sums[0]='合计（CNY）';
    sums[9]=totalUnitCostSum.value;
    sums[10]=totalFreightSum.value;
    sums[11]=totalTariffSum.value;
    return sums;
  };

  const applyQuery=()=>{Object.assign(applied,JSON.parse(JSON.stringify(query)));page.value=1;ElementPlus.ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条明细`)};
  const resetQuery=()=>{Object.assign(query,{sku:'',skuType:'sku',orderType:'middleOrder',orderNo:'',planNo:'',destinations:[],countries:[],platforms:[],stores:[],teams:[],transports:[],channels:[],createdRange:[],hasDiff:'',hasAnomaly:''});applyQuery()};

  const exportData=()=>{const headers=['目的仓','国家','中台发货单号','易仓 ERP 单号','是否异常','异常原因','SKU','海外仓 SKU','FNSKU','实际发货数量','收货数量','发货单总费用','物流费用','清关税费','总单位头程成本','单位物流费用分摊','单位清关税费分摊','清关单价','清关税率','物流费用差异','清关税费差异','运输方式','物流渠道','创建时间'];const sheetRows=[headers,...filteredRows.value.map(row=>[row.destination,row.country||'—',row.middleOrder,row.erpOrder,row.hasAnomaly?'是':'否',row.orderAnomalyMessages.join('；')||'—',row.sku,row.overseasSku||'—',row.fnsku||'—',row.shippedQty,row.receiveQty,money(row.totalCost),money(row.logisticsCost),money(row.clearanceTotal),money(row.unitCost),money(row.unitFreightCost),money(row.unitTariffCost),money(row.clearancePrice),percent(row.clearanceRate),money(row.freightDiff),money(row.tariffDiff),row.transport,row.channel,row.createdAt])];const wb=XLSX.utils.book_new();const ws=XLSX.utils.aoa_to_sheet(sheetRows);XLSX.utils.book_append_sheet(wb,ws,'头程费用明细');XLSX.writeFile(wb,'头程费用明细.xlsx');ElementPlus.ElMessage.success(`已导出 ${filteredRows.value.length} 条明细`)};
  return{query,destinations,countries,platforms,stores,teams,transports,channels,filteredRows,pageRows,page,pageSize,totalUnitCostSum,totalFreightSum,totalTariffSum,summaryMethod,skuPlaceholder,orderPlaceholder,money,percent,applyQuery,resetQuery,exportData};
}}).use(ElementPlus).mount('#app');
