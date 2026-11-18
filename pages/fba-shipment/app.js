/* FBA货件 独立页面脚本 v2.2.0
 * 列表样式（状态栏 + 一级列表 .purchase-plan-table + 二级明细列表 .purchase-detail-table + 底部汇总）完全对齐采购计划页面（pages/purchase-plan-2）。
 * 字段调整：移除 ASIN 与 国家，国家改为「国家编码」（对应接口 ship_to_address>>country_code）。
 */
const remarks=['旺季补货计划','常规安全库存补货','新品首批入仓','促销备货计划',''];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const copyIconSvg='<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.2"/><path d="M8 4V2.6A1.6 1.6 0 0 0 6.4 1H2.6A1.6 1.6 0 0 0 1 2.6v3.8A1.6 1.6 0 0 0 2.6 8H4"/></svg>';

/* 操作日志（内存记录，供导入/关联落记录） */
const planLogs={};
function addPlanLog(planId,type,content){
  if(!planLogs[planId])planLogs[planId]=[];
  const typeMap={'关联FBA货件':'同步','预关联FBA货件':'同步','解除关联':'取消','创建':'新增','更新':'编辑','审核通过':'审核','作废':'作废','取消':'取消'};
  type=typeMap[type]||(['新增','编辑','审核','作废','同步','取消'].includes(type)?type:'编辑');
  const now=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const time=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  planLogs[planId].unshift({type,content,operator:'Admin',time});
}
function toast(text,type='success'){
  const el=$('#toast');el.textContent=text;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800);
}
function splitValues(value){return [...new Set(value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}

/* ===================== FBA 货件列表数据（移除 ASIN、国家改为国家编码 countryCode） ===================== */
const rawShipmentGroups=[
  {
    id:'fba-group-1',
    shipmentNo:'FBA19WXDF5WZ',
    shipmentName:'US-TIG205 Pro-OLM1',
    isSta:1,
    staInboundPlanId:'wf9bae12d8-f590-46c8-aff6-8821c039a101',
    staDeliveryStartDate:'2026-11-22',
    staDeliveryEndDate:'2026-11-29',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'',
    center:'OLM1',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'6VIXMRWB',
    creator:'张敏',
    created:'2026-11-12 16:51',
    modified:'2026-11-13 14:36',
    status:'READY_TO_SHIP',
    isClosed:0,
    children:[
      {
        id:'fba-1-1',
        icon:'🧰',
        sku:'10200200106',
        msku:'TIG205 Pro-US',
        fnsku:'X005E5M3X1',
        product:'TIG205 Pro（美规）',
        declared:20,
        initDeclared:20,
        sent:0,
        received:0,
        linkedPlans:['SHP20261112-01']
      }
    ]
  },
  {
    id:'fba-group-2',
    shipmentNo:'FBA19WXCS06R',
    shipmentName:'US-TIG205P Pro-OLM1',
    isSta:1,
    staInboundPlanId:'wf94905a5c-a600-4436-bce2-77219044d902',
    staDeliveryStartDate:'2026-11-22',
    staDeliveryEndDate:'2026-11-29',
    transportMode:'美森快船',
    shipmentOrderNo:'DN20261112028',
    lingxingOrderNo:'LX261112028',
    center:'OLM1',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'2J9YFIEO',
    creator:'张敏',
    created:'2026-11-12 16:51',
    modified:'2026-11-13 14:36',
    status:'READY_TO_SHIP',
    isClosed:0,
    children:[
      {
        id:'fba-2-1',
        icon:'🧰',
        sku:'10200200306',
        msku:'TIG205P Pro-US',
        fnsku:'X005E5LZY9',
        product:'TIG205P Pro美规',
        declared:40,
        initDeclared:40,
        sent:0,
        received:0,
        linkedPlans:['SHP20261112-02']
      }
    ]
  },
  {
    id:'fba-group-3',
    shipmentNo:'FBA19W5V3L7J',
    shipmentName:'CA-Foot Pedal-YYZ7',
    isSta:1,
    staInboundPlanId:'wf63e80d9b-d7ff-4029-a3c8-991028374611',
    staDeliveryStartDate:'2027-01-04',
    staDeliveryEndDate:'2027-01-17',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'LX261111009',
    center:'YYZ7',
    seller:'ARCCAPTAIN主账号-CA',
    countryCode:'CA',
    reference:'84MQKRVU',
    creator:'李晨',
    created:'2026-11-11 20:51',
    modified:'2026-11-13 13:47',
    status:'SHIPPED',
    isClosed:0,
    children:[
      {
        id:'fba-3-1',
        icon:'🎛️',
        sku:'10230100501',
        msku:'Foot Pedal-ALL TIG-CA',
        fnsku:'X004TXODRL',
        product:'焊机脚踏开关（TIG通用）',
        declared:20,
        initDeclared:20,
        sent:0,
        received:0,
        linkedPlans:[]
      },
      {
        id:'fba-3-2',
        icon:'🎛️',
        sku:'10230100401',
        msku:'MIG 5Pin Welding Foot Pedal-MIG205MP',
        fnsku:'X00588G76B',
        product:'脚踏开关（MIG205MP专用）',
        declared:36,
        initDeclared:36,
        sent:0,
        received:0,
        linkedPlans:['SHP20261111-05']
      }
    ]
  },
  {
    id:'fba-group-4',
    shipmentNo:'FBA19WT8FJ4Z',
    shipmentName:'US-Welding Accessories-LGB8',
    isSta:1,
    staInboundPlanId:'wf46211a0d-61b4-4bc3-941a-552910384712',
    staDeliveryStartDate:'2027-01-03',
    staDeliveryEndDate:'2027-01-10',
    transportMode:'海运卡派',
    shipmentOrderNo:'DN20261111015',
    lingxingOrderNo:'LX261111015',
    center:'LGB8',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'4HISYFZU',
    creator:'李晨',
    created:'2026-11-11 20:50',
    modified:'2026-11-13 10:52',
    status:'SHIPPED',
    isClosed:0,
    children:[
      {
        id:'fba-4-1',
        icon:'🎛️',
        sku:'10230100501',
        msku:'TIG Welding Foot Pedal-ALL TIG',
        fnsku:'X004Q36S81',
        product:'焊机脚踏开关（TIG通用）',
        declared:8,
        initDeclared:8,
        sent:0,
        received:0,
        linkedPlans:[]
      },
      {
        id:'fba-4-2',
        icon:'🔌',
        sku:'10430100301',
        msku:'WA002-12FT-XT',
        fnsku:'X004DWM09H',
        product:'焊机枪线套12英尺黑色',
        declared:54,
        initDeclared:54,
        sent:0,
        received:0,
        linkedPlans:['SHP20261110-08']
      },
      {
        id:'fba-4-3',
        icon:'🔌',
        sku:'10430100401',
        msku:'WA003-25FT-XT',
        fnsku:'X004DWU1AB',
        product:'焊机枪线套25英尺黑色',
        declared:48,
        initDeclared:48,
        sent:0,
        received:0,
        linkedPlans:[]
      },
      {
        id:'fba-4-4',
        icon:'🧱',
        sku:'10470100410',
        msku:'WBLANKET1010FT',
        fnsku:'X004IHKT67',
        product:'焊接防火毯10*10ft',
        declared:8,
        initDeclared:8,
        sent:0,
        received:0,
        linkedPlans:[]
      },
      {
        id:'fba-4-5',
        icon:'🧱',
        sku:'10470100210',
        msku:'WBLANKET46FT-2PC',
        fnsku:'X004CWY2KJ',
        product:'焊接防火毯4*6ft*2',
        declared:12,
        initDeclared:12,
        sent:0,
        received:0,
        linkedPlans:[]
      }
    ]
  },
  {
    id:'fba-group-5',
    shipmentNo:'FBA19WST165C',
    shipmentName:'US-ARCROD-MIT2',
    isSta:1,
    staInboundPlanId:'wf4f62f8bc-19aa-4397-821c-663819201105',
    staDeliveryStartDate:'2027-01-03',
    staDeliveryEndDate:'2027-01-10',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'',
    center:'MIT2',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'6GD8LBNE',
    creator:'王磊',
    created:'2026-11-11 20:50',
    modified:'2026-11-13 10:52',
    status:'SHIPPED',
    isClosed:0,
    children:[
      {
        id:'fba-5-1',
        icon:'🧯',
        sku:'10340101210',
        msku:'ARCROD-10lb-E7018-2.4',
        fnsku:'X004L3LSOS',
        product:'ARC焊条-碱性碳钢/E7018/10LB/2.4mm',
        declared:60,
        initDeclared:60,
        sent:0,
        received:0,
        linkedPlans:[]
      },
      {
        id:'fba-5-2',
        icon:'🧯',
        sku:'10340101110',
        msku:'ARCROD-10lb-E7018-3.2',
        fnsku:'X004L3REHZ',
        product:'ARC焊条-碱性碳钢/E7018/10LB/3.2mm',
        declared:268,
        initDeclared:268,
        sent:0,
        received:0,
        linkedPlans:['SHP20261110-12']
      },
      {
        id:'fba-5-3',
        icon:'🧯',
        sku:'43201000008',
        msku:'ARCROD-2lb-E7018-2.4',
        fnsku:'X0050P0BRV',
        product:'ARC焊条-碱性碳钢/E7018/2LB/2.4mm',
        declared:20,
        initDeclared:20,
        sent:0,
        received:0,
        linkedPlans:[]
      },
      {
        id:'fba-5-4',
        icon:'🧯',
        sku:'10340100310',
        msku:'ARCROD-5lb-E6013-2.4',
        fnsku:'X004BRFCZH',
        product:'ARC焊条-酸性碳钢/E6013/5LB/2.4mm',
        declared:36,
        initDeclared:36,
        sent:0,
        received:0,
        linkedPlans:[]
      }
    ]
  },
  {
    id:'fba-group-6',
    shipmentNo:'FBA19JV2DS11',
    shipmentName:'US-MIG140-ONT8',
    isSta:1,
    staInboundPlanId:'wf19283746-55aa-41b2-9c8d-771239812300',
    staDeliveryStartDate:'2026-11-18',
    staDeliveryEndDate:'2026-11-24',
    transportMode:'美森快船',
    shipmentOrderNo:'DN20261108005',
    lingxingOrderNo:'LX261108005',
    center:'ONT8',
    seller:'ARCCAP',
    countryCode:'US',
    reference:'8W2JA3LC',
    creator:'张敏',
    created:'2026-11-08 14:20',
    modified:'2026-11-12 18:15',
    status:'RECEIVING',
    isClosed:0,
    children:[
      {
        id:'fba-6-1',
        icon:'🎒',
        sku:'140US260008',
        msku:'MIG140-US-STD',
        fnsku:'X00800001',
        product:'MIG140 便携式气体保护焊机（美规）',
        declared:100,
        initDeclared:100,
        sent:100,
        received:82,
        linkedPlans:[]
      },
      {
        id:'fba-6-2',
        icon:'🪖',
        sku:'43201000001',
        msku:'HELMET-PRO-BLK',
        fnsku:'X004LQ7279',
        product:'自动变光焊接面罩 Pro 黑金款',
        declared:60,
        initDeclared:60,
        sent:60,
        received:60,
        linkedPlans:['SHP20261106-03']
      }
    ]
  },
  {
    id:'fba-group-7',
    shipmentNo:'FBA19JUG7MSX',
    shipmentName:'US-CUT50-FTW1',
    isSta:1,
    staInboundPlanId:'wf88273645-12cc-48a1-8b7e-001928374655',
    staDeliveryStartDate:'2026-11-10',
    staDeliveryEndDate:'2026-11-15',
    transportMode:'快递直发',
    shipmentOrderNo:'DN20261102003',
    lingxingOrderNo:'LX261102003',
    center:'FTW1',
    seller:'Amazon US 旗舰店',
    countryCode:'US',
    reference:'9MNC720A',
    creator:'Admin',
    created:'2026-11-02 09:40',
    modified:'2026-11-11 16:05',
    status:'CLOSED',
    isClosed:1,
    children:[
      {
        id:'fba-7-1',
        icon:'📦',
        sku:'43201000002',
        msku:'CUT50-PLASMA-US',
        fnsku:'X004NZMUQ1',
        product:'CUT50 等离子切割机双电压版',
        declared:80,
        initDeclared:80,
        sent:80,
        received:80,
        linkedPlans:['SHP20261101-01']
      }
    ]
  },
  {
    id:'fba-group-8',
    shipmentNo:'FBA18ARC201',
    shipmentName:'US-MIG200-ONT8-A',
    isSta:1,
    staInboundPlanId:'wf88110201-arc-ont8',
    staDeliveryStartDate:'2026-11-24',
    staDeliveryEndDate:'2026-11-30',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'',
    center:'ONT8',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'201ONT8A',
    creator:'王方圆',
    created:'2026-11-17 10:15',
    modified:'2026-11-17 10:15',
    status:'WORKING',
    isClosed:0,
    children:[
      {
        id:'fba-8-1',
        icon:'🧰',
        sku:'ARC-MIG200-US',
        msku:'SL-MIG200',
        fnsku:'X004MIG200',
        product:'逆变焊机 MIG200',
        declared:12,
        initDeclared:12,
        sent:0,
        received:0,
        linkedPlans:[]
      }
    ]
  },
  {
    id:'fba-group-9',
    shipmentNo:'FBA18ARC202',
    shipmentName:'US-MIG200-FTW1-B',
    isSta:1,
    staInboundPlanId:'wf88110202-arc-ftw1',
    staDeliveryStartDate:'2026-11-24',
    staDeliveryEndDate:'2026-11-30',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'',
    center:'FTW1',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'202FTW1B',
    creator:'王方圆',
    created:'2026-11-17 10:18',
    modified:'2026-11-17 10:18',
    status:'WORKING',
    isClosed:0,
    children:[
      {
        id:'fba-9-1',
        icon:'🧰',
        sku:'ARC-MIG200-US',
        msku:'SL-MIG200',
        fnsku:'X004MIG200',
        product:'逆变焊机 MIG200',
        declared:8,
        initDeclared:8,
        sent:0,
        received:0,
        linkedPlans:[]
      }
    ]
  },
  {
    id:'fba-group-10',
    shipmentNo:'FBA18ARC203',
    shipmentName:'US-MIG200-LGB8-C',
    isSta:1,
    staInboundPlanId:'wf88110203-arc-lgb8',
    staDeliveryStartDate:'2026-11-25',
    staDeliveryEndDate:'2026-12-01',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'',
    center:'LGB8',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'203LGB8C',
    creator:'王方圆',
    created:'2026-11-17 10:25',
    modified:'2026-11-17 10:25',
    status:'WORKING',
    isClosed:0,
    children:[
      {
        id:'fba-10-1',
        icon:'🧰',
        sku:'ARC-MIG200-US',
        msku:'SL-MIG200',
        fnsku:'X004MIG200',
        product:'逆变焊机 MIG200',
        declared:15,
        initDeclared:15,
        sent:0,
        received:0,
        linkedPlans:[]
      }
    ]
  },
  {
    id:'fba-group-11',
    shipmentNo:'FBA18TEST001',
    shipmentName:'US-BATCH-LGB8',
    isSta:1,
    staInboundPlanId:'wf88110204-test-lgb8',
    staDeliveryStartDate:'2026-11-24',
    staDeliveryEndDate:'2026-11-30',
    transportMode:'',
    shipmentOrderNo:'',
    lingxingOrderNo:'',
    center:'LGB8',
    seller:'ARCCAPTAIN主账号-US',
    countryCode:'US',
    reference:'204TEST1',
    creator:'Admin',
    created:'2026-11-17 10:30',
    modified:'2026-11-17 10:30',
    status:'WORKING',
    isClosed:0,
    children:[
      {
        id:'fba-11-1',
        icon:'📦',
        sku:'TEST-LINK-INV-BATCH-OK',
        msku:'TEST-BATCH-OK',
        fnsku:'-',
        product:'TEST-LINK-INV-BATCH-OK',
        declared:2,
        initDeclared:2,
        sent:0,
        received:0,
        linkedPlans:[]
      }
    ]
  }
];

/* 扩充货件列表，便于验证状态、分页与筛选 */
const extraCenters=['SMF6','SAT4','CMH3','MCO2','GYR2','MDW2','LAX9','ONT8','OLM1'];
const extraRefs=['8XLEXZVR','61V8Z69K','8KCBLGFN','74ZCLRCP','4YCIKOEI','4A91HRQP','7KLP902W','3BNM881X','5RTY441Z'];
const extraStatuses=['UNCONFIRMED','WORKING','READY_TO_SHIP','IN_TRANSIT','DELIVERED','CHECKED_IN','RECEIVING','CLOSED','CANCELLED'];
const extraTransports=['海运卡派','美森快船','空派','快递直发'];
const fbaGroups=[
  ...rawShipmentGroups,
  ...Array.from({length:9},(_,idx)=>{
    const base=rawShipmentGroups[idx%7];
    const n=idx+12;
    const st=extraStatuses[idx%extraStatuses.length];
    const isClosed=st==='CLOSED'?1:0;
    const center=extraCenters[idx%extraCenters.length];
    return {
      ...base,
      id:`fba-group-${n}`,
      shipmentNo:`FBA19WXD${String(100+n)}`,
      shipmentName:`${base.countryCode}-STA-Batch${n}-${center}`,
      staInboundPlanId:`wf${(10000000+n*1379).toString(16)}-a600-4436-bce2-8821c039a${100+n}`,
      transportMode:idx%2===0?'':extraTransports[idx%extraTransports.length],
      shipmentOrderNo:idx%2===0?'':`DN2026110${idx+1}0${10+n}`,
      lingxingOrderNo:idx%2===0?(idx%4===0?`LX26110${idx+1}0${10+n}`:''):`LX26110${idx+1}0${10+n}`,
      center,
      reference:extraRefs[idx%extraRefs.length],
      status:st,
      isClosed,
      created:`2026-11-${String(10-(idx%9)).padStart(2,'0')} 15:${String(10+idx*4).padStart(2,'0')}`,
      modified:`2026-11-12 09:${String(12+idx*5).padStart(2,'0')}`,
      children:base.children.map((ch,cIdx)=>{
        const sent=['UNCONFIRMED','WORKING','READY_TO_SHIP','CANCELLED','DELETED','ABANDONED'].includes(st)?0:ch.declared;
        const received=st==='CLOSED'?ch.declared:(st==='RECEIVING'?Math.max(0,ch.declared-4):0);
        return {
          ...ch,
          id:`fba-${n}-${cIdx+1}`,
          sent,
          received,
          linkedPlans:cIdx===0&&idx%2===1?[`SHP2026110${idx+1}-0${cIdx+1}`]:[]
        };
      })
    };
  })
];

/* 构建候选「待发货」发货计划 */
const rows=[
  {
    id:1,
    plan:'SHP20260801-1',
    sku:'140US260008',
    msku:'MIG140-US-STD',
    fnsku:'X00800001',
    product:'MIG140 便携式气体保护焊机（美规）',
    store:'ARCCAP',
    countryCode:'US',
    destinationWarehouse:'ONT8',
    status:'待发货',
    quantity:100,
    expectedShip:'2026-11-15',
    expectedArrival:'2026-11-24',
    remark:'旺季备货计划',
    linkedShipments:[]
  }
];
fbaGroups.forEach((group,gIdx)=>{
  group.children.forEach((child,cIdx)=>{
    const planCount=cIdx%2===0?1:2;
    for(let k=1;k<=planCount;k++){
      const id=rows.length+1;
      rows.push({
        id,
        plan:`SHP202611${String(12-(gIdx%9)).padStart(2,'0')}-${id}`,
        sku:child.sku,
        msku:child.msku,
        fnsku:child.fnsku,
        product:child.product,
        store:group.seller,
        countryCode:group.countryCode,
        destinationWarehouse:group.center,
        status:'待发货',
        quantity:child.declared,
        expectedShip:'2026-11-16',
        expectedArrival:group.staDeliveryEndDate||'2026-11-29',
        remark:remarks[id%remarks.length],
        linkedShipments:[]
      });
    }
  });
});

const fbaPlanOptions=rows.map(r=>({
  id:`fba-plan-${r.id}`,
  plan:r.plan,
  platform:'Amazon',
  sku:r.sku,
  msku:r.msku,
  fnsku:r.fnsku,
  product:r.product,
  store:r.store,
  center:r.destinationWarehouse,
  status:r.status,
  quantity:r.quantity,
  shipDate:r.expectedShip,
  arrivalDate:r.expectedArrival,
  remark:r.remark
}));

const FBA_PLAN_V2_BRIDGE_KEY='dmp_fba_plan_v2_bridge';
if(typeof window!=='undefined'&&window.location&&window.location.search.includes('reset=1')){try{localStorage.removeItem(FBA_PLAN_V2_BRIDGE_KEY);}catch{}}
function readV2Bridge(){
  try{
    const raw=JSON.parse(localStorage.getItem(FBA_PLAN_V2_BRIDGE_KEY)||'{}');
    return {
      links:raw&&typeof raw.links==='object'&&raw.links?raw.links:{},
      shippingOrderLinks:raw&&typeof raw.shippingOrderLinks==='object'&&raw.shippingOrderLinks?raw.shippingOrderLinks:{},
      unlinkedPlans:Array.isArray(raw&&raw.unlinkedPlans)?raw.unlinkedPlans:[],
      v2PendingPlans:Array.isArray(raw&&raw.v2PendingPlans)?raw.v2PendingPlans:[],
      v2CustomPlans:Array.isArray(raw&&raw.v2CustomPlans)?raw.v2CustomPlans:[],
      v2Overrides:raw&&typeof raw.v2Overrides==='object'&&raw.v2Overrides?raw.v2Overrides:{},
      v2StatusFromUpstream:raw&&typeof raw.v2StatusFromUpstream==='object'&&raw.v2StatusFromUpstream?raw.v2StatusFromUpstream:{},
      fbaShipmentsMeta:raw&&typeof raw.fbaShipmentsMeta==='object'&&raw.fbaShipmentsMeta?raw.fbaShipmentsMeta:{},
      fbaShipmentOrderLinks:raw&&typeof raw.fbaShipmentOrderLinks==='object'&&raw.fbaShipmentOrderLinks?raw.fbaShipmentOrderLinks:{},
      autoShippingOrders:Array.isArray(raw&&raw.autoShippingOrders)?raw.autoShippingOrders:[],
      warehouseStockAdds:raw&&typeof raw.warehouseStockAdds==='object'&&raw.warehouseStockAdds?raw.warehouseStockAdds:{},
      v2PickupDemands:Array.isArray(raw&&raw.v2PickupDemands)?raw.v2PickupDemands:[],
      prelinkedShipments:Array.isArray(raw&&raw.prelinkedShipments)?raw.prelinkedShipments:[]
    };
  }catch{
    return {links:{},shippingOrderLinks:{},unlinkedPlans:[],v2PendingPlans:[],v2CustomPlans:[],v2Overrides:{},v2StatusFromUpstream:{},fbaShipmentsMeta:{},fbaShipmentOrderLinks:{},autoShippingOrders:[],warehouseStockAdds:{},v2PickupDemands:[],prelinkedShipments:[]};
  }
}
function writeV2Bridge(bridge){
  try{localStorage.setItem(FBA_PLAN_V2_BRIDGE_KEY,JSON.stringify(bridge));}catch{}
}
function snapshotFbaShipmentsToBridge(){
  const bridge=readV2Bridge();
  bridge.fbaShipmentsMeta={};
  fbaGroups.forEach(g=>{
    bridge.fbaShipmentsMeta[g.shipmentNo]={
      id:g.id,
      shipmentNo:g.shipmentNo,
      shipmentName:g.shipmentName||'',
      reference:g.reference||'',
      center:g.center||'',
      seller:g.seller||'',
      countryCode:g.countryCode||'US',
      status:g.status||'',
      shipmentOrderNo:g.shipmentOrderNo||'',
      children:(g.children||[]).map(c=>({
        id:c.id,
        sku:c.sku,
        product:c.product||'',
        declared:Number(c.declared||0),
        linkedPlans:[...(c.linkedPlans||[])]
      }))
    };
  });
  writeV2Bridge(bridge);
}
function findGroupByChildId(childId){
  return fbaGroups.find(g=>g.children.some(c=>c.id===childId));
}
function persistV2BridgeLink(planNo,shipmentNo,shipmentName,shipmentCount,declaredTotal){
  if(!planNo)return;
  const bridge=readV2Bridge();
  bridge.links[planNo]={
    shipmentNo:shipmentNo||'',
    shipmentName:shipmentName||'',
    shipmentCount:Number(shipmentCount||0),
    declaredTotal:Number(declaredTotal||0)
  };
  bridge.unlinkedPlans=bridge.unlinkedPlans.filter(p=>p!==planNo);
  writeV2Bridge(bridge);
}
function persistV2BridgeUnlink(planNo){
  if(!planNo)return;
  const bridge=readV2Bridge();
  delete bridge.links[planNo];
  delete bridge.v2StatusFromUpstream[planNo];
  if(!bridge.unlinkedPlans.includes(planNo))bridge.unlinkedPlans.push(planNo);
  writeV2Bridge(bridge);
}
function syncV2BridgeIntoFba(){
  const bridge=readV2Bridge();
  const skuByPlan=new Map();
  bridge.v2CustomPlans.forEach(cp=>{if(cp&&cp.planNo)skuByPlan.set(cp.planNo,cp.sku);});
  bridge.v2PendingPlans.forEach(vp=>{
    if(!vp||!vp.plan)return;
    skuByPlan.set(vp.plan,vp.sku);
    const existing=fbaPlanOptions.find(p=>p.plan===vp.plan);
    if(!existing){
      fbaPlanOptions.unshift({...vp});
    }else{
      Object.assign(existing,vp);
    }
    if(!rows.some(r=>r.plan===vp.plan)){
      rows.unshift({
        id:rows.length+1000,
        plan:vp.plan,
        sku:vp.sku,
        msku:vp.msku,
        fnsku:vp.fnsku,
        product:vp.product,
        store:vp.store,
        countryCode:'US',
        destinationWarehouse:vp.center,
        status:vp.status||'待创建货件',
        statusKey:vp.statusKey||'pending_fba_create',
        quantity:vp.quantity,
        expectedShip:vp.shipDate,
        expectedArrival:vp.arrivalDate,
        remark:vp.remark||'',
        pickupWarehouse:vp.pickupWarehouse||[],
        linkedShipments:[],
        fromV2:true
      });
    }else{
      const r=rows.find(x=>x.plan===vp.plan);
      if(r){
        r.status=vp.status||r.status;
        r.statusKey=vp.statusKey||r.statusKey;
        r.quantity=vp.quantity;
        r.pickupWarehouse=vp.pickupWarehouse||r.pickupWarehouse;
      }
    }
  });
  const unlinkedSet=new Set(bridge.unlinkedPlans);
  fbaGroups.forEach(g=>{
    if(bridge.fbaShipmentOrderLinks&&bridge.fbaShipmentOrderLinks[g.shipmentNo]!==undefined){
      g.shipmentOrderNo=bridge.fbaShipmentOrderLinks[g.shipmentNo];
    }
    g.children.forEach(c=>{
      if(c.linkedPlans&&c.linkedPlans.length){
        c.linkedPlans=c.linkedPlans.filter(p=>!unlinkedSet.has(p));
      }
    });
  });
  fbaPlanOptions.forEach(p=>{
    if(unlinkedSet.has(p.plan)){
      p.status='待创建货件';
      p.statusKey='pending_fba_create';
    }
  });
  Object.entries(bridge.links).forEach(([planNo,info])=>{
    if(!info||!info.shipmentNo)return;
    const opt=fbaPlanOptions.find(p=>p.plan===planNo);
    const planSku=(opt&&opt.sku)||skuByPlan.get(planNo)||'';
    const up=bridge.v2StatusFromUpstream[planNo];
    if(opt&&up){
      opt.statusKey=up.status;
      opt.status=up.status==='pending_review'?'待复核':up.status==='pending_shipping_order'?'待生成发货单':up.status==='pending_ship'?'待发货':opt.status;
    }
    const shipNos=String(info.shipmentNo).split(/[、,，]+/).map(s=>s.trim()).filter(Boolean);
    const shipSet=new Set(shipNos);
    fbaGroups.forEach(g=>{
      if(!shipSet.has(g.shipmentNo)){
        (g.children||[]).forEach(c=>{
          if(Array.isArray(c.linkedPlans)&&c.linkedPlans.includes(planNo)){
            c.linkedPlans=c.linkedPlans.filter(p=>p!==planNo);
          }
        });
      }
    });
    shipNos.forEach(sNo=>{
      const grp=fbaGroups.find(g=>g.shipmentNo===sNo);
      if(!grp)return;
      const already=grp.children.find(c=>(c.linkedPlans||[]).includes(planNo));
      if(already)return;
      const target=grp.children.find(c=>(!c.linkedPlans||!c.linkedPlans.length)&&(!planSku||String(c.sku).toLowerCase()===String(planSku).toLowerCase()))
        ||grp.children.find(c=>!planSku||String(c.sku).toLowerCase()===String(planSku).toLowerCase());
      if(target)target.linkedPlans=[planNo];
    });
  });
  snapshotFbaShipmentsToBridge();
}

const fbaStoreOptions=['ARCCAPTAIN主账号-US','ARCCAPTAIN主账号-CA','Amazon US 旗舰店','ARCCAP'];
const fbaCountryCodeOptions=['US','CA','UK','DE','JP'];

const statusTabs=[
  {name:'',label:'全部'},
  {name:'UNCONFIRMED',label:'未确认'},
  {name:'WORKING',label:'待发货-已创建'},
  {name:'READY_TO_SHIP',label:'待发货-已装箱'},
  {name:'SHIPPED',label:'运输中-已取件'},
  {name:'IN_TRANSIT',label:'运输中-已通知'},
  {name:'DELIVERED',label:'已到达-待登记'},
  {name:'CHECKED_IN',label:'已到达-待入库'},
  {name:'RECEIVING',label:'已到达-入库中'},
  {name:'CLOSED',label:'已完成'},
  {name:'DELETED',label:'已删除'},
  {name:'CANCELLED',label:'已取消'},
  {name:'ABANDONED',label:'已放弃'}
];

/* 默认展开前几条货件，保持采购计划一二级折叠体验 */
const fbaState={
  status:'',
  orderFilter:'',
  diffFilter:'',
  noType:'shipmentNo',
  noQuery:'',
  codeType:'sku',
  codeQuery:'',
  productName:'',
  stores:[],
  countries:[],
  association:'',
  dateType:'created',
  startDate:'',
  endDate:'',
  page:1,
  pageSize:10,
  planPage:1,
  planPageSize:7,
  planSearch:'',
  planSku:'',
  planFnsku:'',
  planStore:'',
  activeChildIds:[],
  pendingUnlinkIds:[],
  selectedChildIds:new Set(),
  expanded:new Set(fbaGroups.map(g=>g.id))
};

const fbaStatusMeta={
  UNCONFIRMED:{cls:'draft',label:'未确认'},
  WORKING:{cls:'draft',label:'待发货-已创建'},
  READY_TO_SHIP:{cls:'pending_purchase',label:'待发货-已装箱'},
  SHIPPED:{cls:'purchasing',label:'运输中-已取件'},
  IN_TRANSIT:{cls:'purchasing',label:'运输中-已通知'},
  DELIVERED:{cls:'pending_review',label:'已到达-待登记'},
  CHECKED_IN:{cls:'pending_review',label:'已到达-待入库'},
  CHECK_IN:{cls:'pending_review',label:'已到达-待入库'},
  RECEIVING:{cls:'partial_received',label:'已到达-入库中'},
  CLOSED:{cls:'completed',label:'已完成'},
  DELETED:{cls:'voided',label:'已删除'},
  CANCELLED:{cls:'voided',label:'已取消'},
  ABANDONED:{cls:'voided',label:'已放弃'}
};
const fbaNoPlaceholders={
  shipmentNo:'请输入货件单号，支持多个',
  shipmentName:'请输入货件名称，支持模糊查询',
  staPlanId:'请输入 STA 任务号，支持多个',
  shipmentOrderNo:'请输入中台发货单号，支持多个',
  lingxingOrderNo:'请输入领星发货单号，支持多个',
  planNo:'请输入发货计划号，支持多个',
  center:'请输入物流中心编码，支持多个',
  reference:'请输入 Reference ID，支持多个'
};
const fbaCodePlaceholders={
  sku:'请输入 SKU，支持多个',
  msku:'请输入领星 SKU，支持多个',
  fnsku:'请输入 FNSKU，支持多个'
};
let fbaStoreSelect=null,fbaCountrySelect=null,fbaQueryExpanded=false;

/* ===================== 查询过滤 ===================== */
function fbaMatchQuery(value,query){
  const terms=splitValues(query||'');
  if(!terms.length)return true;
  const target=String(value||'').toLowerCase();
  return terms.some(t=>target===t||target.includes(t));
}
function fbaLinked(child){return Boolean(child.linkedPlans&&child.linkedPlans.length);}
function fbaNoFieldValue(group,child){
  return {
    shipmentNo:group.shipmentNo,
    shipmentName:group.shipmentName,
    staPlanId:group.staInboundPlanId,
    shipmentOrderNo:group.shipmentOrderNo,
    lingxingOrderNo:group.lingxingOrderNo,
    planNo:[...(child.linkedPlans||[])].join(' '),
    center:group.center,
    reference:group.reference
  }[fbaState.noType]||'';
}
function fbaCodeFieldValue(child){
  return {
    sku:child.sku,
    msku:child.msku,
    fnsku:child.fnsku
  }[fbaState.codeType]||'';
}
function getBaseFilteredGroups(ignoreStatus=false){
  const productKeyword=String(fbaState.productName||'').trim().toLowerCase();
  return fbaGroups.filter(group=>{
    const dateVal=String(group.created||'').slice(0,10);
    return (ignoreStatus||!fbaState.status||group.status===fbaState.status)&&
      (!fbaState.orderFilter||(fbaState.orderFilter==='generated'?Boolean(group.shipmentOrderNo):!group.shipmentOrderNo))&&
      (!fbaState.stores.length||fbaState.stores.includes(group.seller))&&
      (!fbaState.countries.length||fbaState.countries.includes(group.countryCode))&&
      (!fbaState.startDate||dateVal>=fbaState.startDate)&&
      (!fbaState.endDate||dateVal<=fbaState.endDate);
  }).map(group=>({
    ...group,
    children:group.children.filter(child=>{
      const associationMatch=!fbaState.association||(fbaState.association==='linked'?fbaLinked(child):!fbaLinked(child));
      const declareReceiveDiff=Number(child.declared||0)-Number(child.received||0);
      const diffMatch=!fbaState.diffFilter||(fbaState.diffFilter==='diff'?declareReceiveDiff!==0:declareReceiveDiff===0);
      const productMatch=!productKeyword||String(child.product||'').toLowerCase().includes(productKeyword);
      return fbaMatchQuery(fbaNoFieldValue(group,child),fbaState.noQuery)&&
        fbaMatchQuery(fbaCodeFieldValue(child),fbaState.codeQuery)&&
        productMatch&&
        associationMatch&&
        diffMatch;
    })
  })).filter(group=>group.children.length);
}
function getFbaVisibleGroups(){
  return getBaseFilteredGroups(false);
}

function initFbaMultis(){
  fbaCountrySelect=window.createUiMultiSelect({root:'#fbaCountryMulti',options:fbaCountryCodeOptions,values:fbaState.countries,placeholder:'请选择国家编码',onChange:values=>{fbaState.countries=values;}});
  fbaStoreSelect=window.createUiMultiSelect({root:'#fbaStoreMulti',options:fbaStoreOptions,values:fbaState.stores,placeholder:'请选择店铺',onChange:values=>{fbaState.stores=values;}});
}
function syncFbaPlaceholders(){
  $('#fbaNoInput').placeholder=fbaNoPlaceholders[$('#fbaNoType').value]||fbaNoPlaceholders.shipmentNo;
  $('#fbaCodeInput').placeholder=fbaCodePlaceholders[$('#fbaCodeType').value]||fbaCodePlaceholders.sku;
}
function readFbaQuery(){
  const statusEl=$('#fbaStatus');
  if(statusEl)fbaState.status=statusEl.value;
  fbaState.orderFilter=$('#fbaOrderFilter').value;
  fbaState.diffFilter=$('#fbaDiffFilter').value;
  fbaState.noType=$('#fbaNoType').value;
  fbaState.noQuery=$('#fbaNoInput').value;
  fbaState.codeType=$('#fbaCodeType').value;
  fbaState.codeQuery=$('#fbaCodeInput').value;
  fbaState.productName=$('#fbaProductName').value;
  fbaState.association=$('#fbaAssociation').value;
  fbaState.dateType=$('#fbaDateType').value;
  fbaState.startDate=$('#fbaStartDate').value;
  fbaState.endDate=$('#fbaEndDate').value;
}
function resetFbaQuery(){
  fbaState.status='';
  fbaState.orderFilter='';
  fbaState.diffFilter='';
  fbaState.noType='shipmentNo';
  fbaState.noQuery='';
  fbaState.codeType='sku';
  fbaState.codeQuery='';
  fbaState.productName='';
  fbaState.stores=[];
  fbaState.countries=[];
  fbaState.association='';
  fbaState.dateType='created';
  fbaState.startDate='';
  fbaState.endDate='';
  fbaState.page=1;
  if($('#fbaStatus'))$('#fbaStatus').value='';
  $('#fbaOrderFilter').value='';
  $('#fbaDiffFilter').value='';
  $('#fbaNoType').value='shipmentNo';
  $('#fbaNoInput').value='';
  $('#fbaCodeType').value='sku';
  $('#fbaCodeInput').value='';
  $('#fbaProductName').value='';
  $('#fbaAssociation').value='';
  $('#fbaDateType').value='created';
  $('#fbaStartDate').value='';
  $('#fbaEndDate').value='';
  fbaStoreSelect?.setValues([]);
  fbaCountrySelect?.setValues([]);
  syncFbaPlaceholders();
}

function fbaStatusTag(status){
  const meta=fbaStatusMeta[status]||{cls:'draft',label:status};
  return `<span class="pp-status pp-status--${meta.cls}">${meta.label}</span>`;
}
function fbaClosedTag(isClosed){
  return isClosed===1
    ?`<span class="fba-closed-badge is-closed">已完结</span>`
    :`<span class="fba-closed-badge is-open">进行中</span>`;
}

/* ===================== 一级列表（勾选列 + 展开列 + 7 列合并） + 二级明细列表（含勾选列与父子联动） ===================== */
const BLOCKED_GEN_STATUSES=['DELETED','CANCELLED','ABANDONED'];
function canGenerateOrderForGroup(group){
  if(!group)return false;
  if(group.shipmentOrderNo)return false;
  if(BLOCKED_GEN_STATUSES.includes(group.status))return false;
  return true;
}
function canSelectChild(group,child){
  return Boolean(group&&child);
}
function canSelectGroup(group){
  if(!group)return false;
  return group.children.some(child=>canSelectChild(group,child));
}
function disabledReasonForGroup(group){
  if(!canSelectGroup(group))return '当前货件无可勾选明细';
  if(!canGenerateOrderForGroup(group))return '该货件不可再生成发货单，勾选将用于取消关联发货计划';
  return '勾选此货件（联动勾选全部明细）';
}
function childCheckTitle(group,child){
  if(fbaLinked(child))return '该明细已关联发货计划，勾选可取消关联或参与生成所属货件的发货单';
  return '勾选此明细以参与生成所属货件的发货单（关联发货计划请前往「发货计划」操作）';
}

/* ===================== 列配置（参照采购计划一二级列表列配置，无固定列） ===================== */
const FBA_COL_CONFIG_KEY='fba-shipment-column-config-v1';
const FBA_COL_DEFS={
  parent:[
    {key:'shipmentNo',label:'货件单号 / 货件名称',tableClass:'no-col',width:175},
    {key:'status',label:'领星货件状态',tableClass:'fba-status-col',width:126},
    {key:'staRef',label:'STA任务 / Reference ID',tableClass:'sta-col',width:195},
    {key:'storeCenter',label:'店铺 / 国家编码 / 物流中心',tableClass:'store-col',width:170},
    {key:'orderNos',label:'中台发货单号 / 领星发货单号',tableClass:'order-col',width:180},
    {key:'declaredQty',label:'总申报量',tableClass:'qty-col',width:135},
    {key:'createdAt',label:'创建时间',tableClass:'time-col',width:170}
  ],
  child:[
    {key:'sku',label:'SKU',tableClass:'detail-sku',width:150},
    {key:'msku',label:'领星 SKU',tableClass:'detail-msku',width:175},
    {key:'fnsku',label:'FNSKU',tableClass:'detail-fnsku',width:135},
    {key:'product',label:'品名',tableClass:'detail-name',width:230},
    {key:'declared',label:'申报量',tableClass:'detail-qty',width:95},
    {key:'sent',label:'实际发货',tableClass:'detail-qty',width:95},
    {key:'received',label:'签收量',tableClass:'detail-qty',width:95},
    {key:'shipDiff',label:'申发差异',tableClass:'detail-diff',width:110,tooltip:'申发差异=申报量-实际发货量'},
    {key:'receiveDiff',label:'收发差异',tableClass:'detail-diff',width:110,tooltip:'收发差异=签收量-实际发货量'},
    {key:'declareReceiveDiff',label:'申收差异',tableClass:'detail-diff',width:110,tooltip:'申收差异=申报量-签收量'},
    {key:'plan',label:'发货计划',tableClass:'detail-plan',width:175}
  ]
};
const FBA_COL_DEFAULTS={
  parent:FBA_COL_DEFS.parent.map(c=>c.key),
  child:FBA_COL_DEFS.child.map(c=>c.key)
};
function normalizeFbaColKeys(tab,keys){
  const available=FBA_COL_DEFAULTS[tab]||[];
  const valid=Array.isArray(keys)?keys.filter((k,idx)=>available.includes(k)&&keys.indexOf(k)===idx):[];
  return valid.length?valid:[...available];
}
const fbaColConfig=(()=>{
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(FBA_COL_CONFIG_KEY)||'{}');}catch{}
  return {
    tab:'parent',
    search:'',
    draggedKey:'',
    applied:{
      parent:normalizeFbaColKeys('parent',saved.parent),
      child:normalizeFbaColKeys('child',saved.child)
    },
    draft:{parent:[],child:[]}
  };
})();
function getVisibleColumns(tab){
  return fbaColConfig.applied[tab].map(k=>FBA_COL_DEFS[tab].find(c=>c.key===k)).filter(Boolean);
}

function renderParentCellHtml(group,key,ctx){
  const {orderNo,lingxingOrderNo,totalDeclared,totalSkuCount,linkedSkuCount,progressCls}=ctx;
  switch(key){
    case 'shipmentNo':
      return `<td>
        <div class="fba-cell-stack">
          <div class="doc-line">
            <button class="link doc-no" data-fba-toggle="${group.id}" type="button">${group.shipmentNo}</button>
            <button class="copy-icon-btn" data-copy-text="${group.shipmentNo}" data-copy-label="货件单号" type="button" title="复制货件单号" aria-label="复制货件单号">${copyIconSvg}</button>
          </div>
          <div class="fba-cell-sub" title="${group.shipmentName||'—'}">
            <span class="fba-cell-truncate">名称：<b>${group.shipmentName||'—'}</b></span>
          </div>
        </div>
      </td>`;
    case 'status':
      return `<td>
        <div class="fba-cell-stack">
          <div class="fba-cell-main">${fbaStatusTag(group.status)}</div>
          <div class="fba-cell-sub">${fbaClosedTag(group.isClosed)}</div>
        </div>
      </td>`;
    case 'staRef':
      return `<td>
        <div class="fba-cell-stack">
          <div class="fba-cell-main" title="${group.staInboundPlanId||'—'}">
            <span>STA：</span><span class="fba-cell-truncate">${group.staInboundPlanId||'—'}</span>
            ${group.staInboundPlanId?`<button class="copy-icon-btn" data-copy-text="${group.staInboundPlanId}" data-copy-label="STA任务号" type="button" title="复制STA任务号">${copyIconSvg}</button>`:''}
          </div>
          <div class="fba-cell-sub">
            <span>Ref ID：<b>${group.reference||'—'}</b></span>
            ${group.reference?`<button class="copy-icon-btn" data-copy-text="${group.reference}" data-copy-label="Reference ID" type="button" title="复制 Reference ID">${copyIconSvg}</button>`:''}
          </div>
        </div>
      </td>`;
    case 'storeCenter':
      return `<td>
        <div class="fba-cell-stack">
          <div class="fba-cell-main is-primary" title="${group.seller||'—'}">
            <span class="fba-cell-truncate">${group.seller||'—'}</span>
          </div>
          <div class="fba-cell-sub">
            <span>国家：<b>${group.countryCode||'—'}</b></span>
            <span>·</span>
            <span>中心：<b>${group.center||'—'}</b></span>
          </div>
        </div>
      </td>`;
    case 'orderNos':
      return `<td>
        <div class="fba-cell-stack">
          <div class="fba-cell-main">
            <span>中台：</span>
            ${orderNo
              ?`<button class="link fba-doc-jump" data-nav-order="${orderNo}" type="button" title="前往发货单查看 ${orderNo}">${orderNo}</button><button class="copy-icon-btn" data-copy-text="${orderNo}" data-copy-label="中台发货单号" type="button" title="复制中台发货单号">${copyIconSvg}</button>`
              :'<span>—</span>'}
          </div>
          <div class="fba-cell-sub">
            <span>领星：</span>
            ${lingxingOrderNo
              ?`<b>${lingxingOrderNo}</b><button class="copy-icon-btn" data-copy-text="${lingxingOrderNo}" data-copy-label="领星发货单号" type="button" title="复制领星发货单号">${copyIconSvg}</button>`
              :'<span>—</span>'}
          </div>
        </div>
      </td>`;
    case 'declaredQty':
      return `<td>
        <div class="fba-cell-stack">
          <div class="fba-cell-main is-primary"><span class="fba-qty-val">${totalDeclared.toLocaleString()}</span></div>
          <div class="fba-cell-sub">
            <span>${totalSkuCount} 款 领星 SKU</span>
            <span>·</span>
            <span class="fba-link-progress ${progressCls}">已关联 ${linkedSkuCount}/${totalSkuCount}</span>
          </div>
        </div>
      </td>`;
    case 'createdAt':
      return `<td>
        <div class="fba-cell-stack">
          <div class="fba-cell-main is-primary" title="${group.created||'—'}"><span class="fba-cell-truncate">${group.created||'—'}</span></div>
          <div class="fba-cell-sub"><span>创建人：<b>${group.creator||'—'}</b></span></div>
        </div>
      </td>`;
    default:
      return '<td>—</td>';
  }
}

function renderChildHeaderHtml(col){
  if(col.tooltip){
    return `<th class="${col.tableClass}" title="${col.tooltip}">${col.label}<span class="col-help-icon" title="${col.tooltip}" aria-label="${col.tooltip}">?</span></th>`;
  }
  return `<th class="${col.tableClass}">${col.label}</th>`;
}

function renderChildCellHtml(child,colKey,ctx){
  const {shipDiff,receiveDiff,declareReceiveDiff,linked}=ctx;
  switch(colKey){
    case 'sku':
      return `<td class="detail-sku">${child.sku}<button class="copy-icon-btn" data-copy-text="${child.sku}" data-copy-label="SKU" type="button" title="复制 SKU">${copyIconSvg}</button></td>`;
    case 'msku':
      return `<td class="detail-msku" title="${child.msku}">${child.msku}<button class="copy-icon-btn" data-copy-text="${child.msku}" data-copy-label="领星 SKU" type="button" title="复制领星 SKU">${copyIconSvg}</button></td>`;
    case 'fnsku':
      return `<td class="detail-fnsku">${child.fnsku}<button class="copy-icon-btn" data-copy-text="${child.fnsku}" data-copy-label="FNSKU" type="button" title="复制 FNSKU">${copyIconSvg}</button></td>`;
    case 'product':
      return `<td class="detail-name" title="${child.product}"><div class="fba-detail-product"><span class="fba-thumb">${child.icon||'📦'}</span><span>${child.product}</span></div></td>`;
    case 'declared':
      return `<td class="detail-qty">${Number(child.declared||0).toLocaleString()}</td>`;
    case 'sent':
      return `<td class="detail-qty">${Number(child.sent||0).toLocaleString()}</td>`;
    case 'received':
      return `<td class="detail-qty">${Number(child.received||0).toLocaleString()}</td>`;
    case 'shipDiff':
      return `<td class="detail-diff ${shipDiff!==0?'detail-difference':''}">${shipDiff.toLocaleString()}</td>`;
    case 'receiveDiff':
      return `<td class="detail-diff ${receiveDiff!==0?'detail-difference':''}">${receiveDiff.toLocaleString()}</td>`;
    case 'declareReceiveDiff':
      return `<td class="detail-diff ${declareReceiveDiff!==0?'detail-difference':''}">${declareReceiveDiff.toLocaleString()}</td>`;
    case 'plan':
      return `<td class="detail-plan">${linked
        ?`<button class="link fba-doc-jump" data-nav-plan="${child.linkedPlans[0]}" type="button" title="前往发货计划查看 ${child.linkedPlans[0]}">${child.linkedPlans[0]}</button><button class="copy-icon-btn" data-copy-text="${child.linkedPlans[0]}" data-copy-label="发货计划号" type="button" title="复制发货计划号">${copyIconSvg}</button>`
        :'<span class="fba-unlinked-tag">未关联</span>'}</td>`;
    default:
      return '<td>—</td>';
  }
}

function renderShipmentRows(group,visibleParentCols,visibleChildCols){
  const expanded=fbaState.expanded.has(group.id);
  const selectableChildren=group.children.filter(c=>canSelectChild(group,c));
  const canCheck=selectableChildren.length>0;
  const isChecked=canCheck&&selectableChildren.every(c=>fbaState.selectedChildIds.has(c.id));
  const checkTitle=disabledReasonForGroup(group);
  const totalDeclared=group.children.reduce((sum,child)=>sum+Number(child.declared||0),0);
  const totalSkuCount=group.children.length;
  const linkedSkuCount=group.children.filter(child=>child.linkedPlans&&child.linkedPlans.length>0).length;
  const progressCls=linkedSkuCount===totalSkuCount?'is-all':(linkedSkuCount>0?'is-partial':'is-none');

  const ctx={
    orderNo:group.shipmentOrderNo||'',
    lingxingOrderNo:group.lingxingOrderNo||'',
    totalDeclared,
    totalSkuCount,
    linkedSkuCount,
    progressCls
  };

  const parentRow=`<tr class="parent-row ${expanded?'is-expanded':''}" data-id="${group.id}">
    <td>
      <input class="checkbox" data-fba-check="${group.id}" type="checkbox" ${isChecked?'checked':''} ${canCheck?'':'disabled'} title="${checkTitle}" aria-label="${checkTitle}">
    </td>
    <td><button class="document-expand ${expanded?'is-expanded':''}" data-fba-toggle="${group.id}" type="button" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'}明细"></button></td>
    ${visibleParentCols.map(col=>renderParentCellHtml(group,col.key,ctx)).join('')}
  </tr>`;

  if(!expanded)return parentRow;

  const detailMinWidth=38+visibleChildCols.reduce((sum,c)=>sum+c.width,0);
  const detailRow=`<tr class="detail-row" data-parent-id="${group.id}">
    <td colspan="${visibleParentCols.length+2}">
      <div class="detail-wrap">
        <table class="purchase-detail-table" style="min-width:${detailMinWidth}px">
          <thead>
            <tr>
              <th class="detail-check">
                <input class="checkbox" data-fba-group-check-all="${group.id}" type="checkbox" ${isChecked?'checked':''} ${canCheck?'':'disabled'} title="全选当前货件明细">
              </th>
              ${visibleChildCols.map(renderChildHeaderHtml).join('')}
            </tr>
          </thead>
          <tbody>
            ${group.children.map(child=>{
              const shipDiff=Number(child.declared||0)-Number(child.sent||0);
              const receiveDiff=Number(child.received||0)-Number(child.sent||0);
              const declareReceiveDiff=Number(child.declared||0)-Number(child.received||0);
              const linked=child.linkedPlans&&child.linkedPlans.length>0;
              const childEnabled=canSelectChild(group,child);
              const childChecked=childEnabled&&fbaState.selectedChildIds.has(child.id);
              const tip=childCheckTitle(group,child);
              const childCtx={shipDiff,receiveDiff,declareReceiveDiff,linked};
              return `<tr data-child-id="${child.id}">
                <td class="detail-check">
                  <input class="checkbox" data-fba-child-check="${child.id}" data-group-id="${group.id}" type="checkbox" ${childChecked?'checked':''} ${childEnabled?'':'disabled'} title="${tip}" aria-label="${tip}">
                </td>
                ${visibleChildCols.map(col=>renderChildCellHtml(child,col.key,childCtx)).join('')}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </td>
  </tr>`;

  return parentRow+detailRow;
}

function renderParentTableHeader(visibleParentCols){
  const mainTable=$('#fbaMainTable');
  if(mainTable){
    const minW=36+32+visibleParentCols.reduce((sum,c)=>sum+c.width,0);
    mainTable.style.minWidth=`${minW}px`;
  }
  const colGroup=$('#fbaColGroup');
  if(colGroup){
    colGroup.innerHTML=`<col class="check-col"><col class="expand-col">${visibleParentCols.map(c=>`<col class="${c.tableClass}">`).join('')}`;
  }
  const headRow=$('#fbaTableHeadRow');
  if(headRow){
    headRow.innerHTML=`
      <th><input class="checkbox" id="fbaSelectAll" type="checkbox" aria-label="全选本页货件" title="全选本页货件"></th>
      <th><button class="document-expand expand-all" id="fbaExpandAllBtn" type="button" aria-label="展开/折叠全部" title="展开/折叠全部"></button></th>
      ${visibleParentCols.map(col=>{
        if(col.key==='shipmentNo'){
          return `<th>${col.label}<button class="copy-icon-btn copy-icon-btn-head" id="copyPageShipmentNosBtn" type="button" title="复制本页货件单号" aria-label="复制本页货件单号">${copyIconSvg}</button></th>`;
        }
        return `<th>${col.label}</th>`;
      }).join('')}
    `;
  }
}

function renderFbaTable(){
  const visibleParentCols=getVisibleColumns('parent');
  const visibleChildCols=getVisibleColumns('child');
  renderParentTableHeader(visibleParentCols);

  const groups=getFbaVisibleGroups();
  const allChildren=groups.flatMap(g=>g.children);
  const totalSkus=allChildren.length;
  const totalDeclared=allChildren.reduce((s,c)=>s+Number(c.declared||0),0);
  const totalSent=allChildren.reduce((s,c)=>s+Number(c.sent||0),0);
  const totalReceived=allChildren.reduce((s,c)=>s+Number(c.received||0),0);
  const totalShipDiff=totalDeclared-totalSent;
  const totalDeclareReceiveDiff=totalDeclared-totalReceived;

  const pages=Math.max(1,Math.ceil(groups.length/fbaState.pageSize));
  fbaState.page=Math.min(fbaState.page,pages);
  const data=groups.slice((fbaState.page-1)*fbaState.pageSize,fbaState.page*fbaState.pageSize);

  $('#fbaTotalCount').textContent=groups.length;
  $('#fbaSummary').innerHTML=`<b>${groups.length}</b> 个货件 · <b>${totalSkus}</b> 个 SKU · 申报量 <b>${totalDeclared.toLocaleString()}</b> · 实际发货 <b>${totalSent.toLocaleString()}</b> · 签收量 <b>${totalReceived.toLocaleString()}</b> · 申发差异 <b>${totalShipDiff.toLocaleString()}</b> · 申收差异 <b>${totalDeclareReceiveDiff.toLocaleString()}</b>`;
  $('#fbaPrevPage').disabled=fbaState.page===1;
  $('#fbaNextPage').disabled=fbaState.page===pages;

  $('#fbaPageButtons').innerHTML=Array.from({length:pages},(_,index)=>`<button class="page-number ${fbaState.page===index+1?'active':''}" data-fba-page="${index+1}" type="button">${index+1}</button>`).join('');
  $$('[data-fba-page]').forEach(button=>button.onclick=()=>{fbaState.page=Number(button.dataset.fbaPage);renderFbaTable();});

  const expandAll=$('#fbaExpandAllBtn');
  if(expandAll){
    const allExpanded=data.length>0&&data.every(group=>fbaState.expanded.has(group.id));
    expandAll.classList.toggle('is-expanded',allExpanded);
    expandAll.setAttribute('aria-expanded',String(allExpanded));
    expandAll.title=allExpanded?'收起全部货件':'展开全部货件';
    expandAll.setAttribute('aria-label',expandAll.title);
    expandAll.onclick=()=>{
      data.forEach(group=>allExpanded?fbaState.expanded.delete(group.id):fbaState.expanded.add(group.id));
      renderFbaTable();
    };
  }

  const copyHeadBtn=$('#copyPageShipmentNosBtn');
  if(copyHeadBtn){
    copyHeadBtn.onclick=e=>{
      e.stopPropagation();
      if(!data.length){toast('当前页没有可复制的货件单号','error');return;}
      const text=data.map(g=>g.shipmentNo).join('\n');
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).catch(()=>{});
      toast(`已复制本页 ${data.length} 个货件单号`);
    };
  }

  if(!data.length){
    $('#fbaTableBody').innerHTML=`<tr class="fba-empty-row"><td colspan="${visibleParentCols.length+2}">暂无符合条件的 FBA 货件</td></tr>`;
    syncSelectionUi(data);
    return;
  }
  $('#fbaTableBody').innerHTML=data.map(g=>renderShipmentRows(g,visibleParentCols,visibleChildCols)).join('');
  syncSelectionUi(data);

  $$('[data-fba-check]').forEach(cb=>cb.onchange=()=>{
    const id=cb.dataset.fbaCheck;
    const grp=fbaGroups.find(g=>g.id===id);
    if(!grp)return;
    const selectable=grp.children.filter(c=>canSelectChild(grp,c));
    selectable.forEach(c=>{
      if(cb.checked)fbaState.selectedChildIds.add(c.id);
      else fbaState.selectedChildIds.delete(c.id);
    });
    renderFbaTable();
  });
  $$('[data-fba-group-check-all]').forEach(cb=>cb.onchange=()=>{
    const id=cb.dataset.fbaGroupCheckAll;
    const grp=fbaGroups.find(g=>g.id===id);
    if(!grp)return;
    const selectable=grp.children.filter(c=>canSelectChild(grp,c));
    selectable.forEach(c=>{
      if(cb.checked)fbaState.selectedChildIds.add(c.id);
      else fbaState.selectedChildIds.delete(c.id);
    });
    renderFbaTable();
  });
  $$('[data-fba-child-check]').forEach(cb=>cb.onchange=()=>{
    const childId=cb.dataset.fbaChildCheck;
    const grpId=cb.dataset.groupId;
    const grp=fbaGroups.find(g=>g.id===grpId);
    const child=grp?.children.find(c=>c.id===childId);
    if(!canSelectChild(grp,child)){cb.checked=false;return;}
    cb.checked?fbaState.selectedChildIds.add(childId):fbaState.selectedChildIds.delete(childId);
    syncSelectionUi(data);
  });
  $$('[data-fba-toggle]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.fbaToggle;
    fbaState.expanded.has(id)?fbaState.expanded.delete(id):fbaState.expanded.add(id);
    renderFbaTable();
  });
  $$('[data-copy-text]').forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const text=btn.dataset.copyText||'';
    const label=btn.dataset.copyLabel||'内容';
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).catch(()=>{});
    toast(`已复制${label}：${text}`);
  });
  $$('[data-nav-order]').forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const orderNo=btn.dataset.navOrder||'';
    navigatePrototypePage('shipmentOrder',orderNo,`../shipment-orders/index.html?focus=${encodeURIComponent(orderNo)}`);
  });
  $$('[data-nav-plan]').forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const planNo=btn.dataset.navPlan||'';
    navigatePrototypePage('shipmentV2',planNo,`../shipment-plan-v2/index.html?focus=${encodeURIComponent(planNo)}`);
  });
}

function navigatePrototypePage(pageKey,focusNo,fallbackUrl){
  if(window.parent!==window){
    window.parent.postMessage({type:'prototype:navigate',page:pageKey,focus:focusNo},'*');
  }else{
    window.location.href=fallbackUrl;
  }
}

/* ===================== 关联发货计划（左侧 FBA货件+SKU 导航 + 右侧过滤明细单选） ===================== */
const fbaLinkModalState={
  items:[],
  activeChildId:'',
  activeTab:'manual'
};
function normalizeFbaPlanStore(s){
  return String(s||'').replace('主账号-','_').replace(/-/g,'_').toLowerCase();
}
function getCandidatePlansForItem(item,planSearch=''){
  if(!item)return [];
  return fbaPlanOptions.filter(plan=>{
    if(plan.status==='已作废'||plan.status==='已取消')return false;
    if(plan.fromV2){
      const allowed=['pending_fba_create','pending_review','pending_shipping_order'];
      if(plan.statusKey&&!allowed.includes(plan.statusKey))return false;
    }
    if(item.sku&&String(plan.sku).toLowerCase()!==item.sku.toLowerCase())return false;
    if(item.fnsku&&plan.fnsku&&plan.fnsku!=='-'&&String(plan.fnsku).toLowerCase()!==item.fnsku.toLowerCase())return false;
    if(item.seller){
      const matchExact=plan.store===item.seller;
      const matchNorm=plan.fromV2&&normalizeFbaPlanStore(plan.store)===normalizeFbaPlanStore(item.seller);
      if(!matchExact&&!matchNorm)return false;
    }
    return fbaMatchQuery(plan.plan,planSearch);
  });
}
function filteredFbaPlans(){
  const activeItem=fbaLinkModalState.items.find(x=>x.childId===fbaLinkModalState.activeChildId);
  return getCandidatePlansForItem(activeItem,fbaState.planSearch);
}
function renderFbaLinkNav(){
  const items=fbaLinkModalState.items;
  const pickedCount=items.filter(x=>Boolean(x.selectedPlan)).length;
  $('#fbaLinkNavProgress').textContent=`${pickedCount} / ${items.length} 已选`;
  $('#fbaLinkNavList').innerHTML=items.map((item,idx)=>{
    const active=item.childId===fbaLinkModalState.activeChildId?'active':'';
    const picked=item.selectedPlan;
    const statusHtml=picked
      ?`<span class="fba-link-nav-picked-pill" title="已选：${picked.plan}（计划发货 ${picked.quantity}）">
          <span>${picked.plan}</span>
          <button class="fba-link-nav-clear" data-link-clear="${item.childId}" type="button" title="清除已选计划" aria-label="清除已选计划">×</button>
        </span>`
      :`<span class="fba-gen-nav-badge is-pending">待选择</span>`;
    return `<div class="fba-link-nav-item ${active}" data-link-nav="${item.childId}" role="button" tabindex="0">
      <div class="fba-link-nav-top">
        <div class="fba-link-nav-ship" title="${item.shipmentNo} · ${item.shipmentName||'—'}">
          <span class="fba-link-nav-title">${idx+1}. ${item.shipmentNo}</span>
          <span class="fba-link-nav-shipname">· ${item.shipmentName||'—'}</span>
        </div>
        ${statusHtml}
      </div>
      <div class="fba-link-nav-body">
        <span class="fba-link-nav-thumb">${item.icon||'📦'}</span>
        <div class="fba-link-nav-info">
          <div class="fba-link-nav-product" title="${item.product}">${item.product}</div>
          <div class="fba-link-nav-codes" title="领星SKU：${item.msku||'—'} · FNSKU：${item.fnsku||'—'}">
            <span>领星SKU: ${item.msku||'—'}</span>
            <span>FNSKU: ${item.fnsku||'—'}</span>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  $$('[data-link-nav]').forEach(el=>el.onclick=()=>{
    const nextId=el.dataset.linkNav;
    if(nextId===fbaLinkModalState.activeChildId)return;
    fbaLinkModalState.activeChildId=nextId;
    resetFbaPlanQuery();
    renderFbaLinkModal();
  });
  $$('[data-link-clear]').forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const target=fbaLinkModalState.items.find(x=>x.childId===btn.dataset.linkClear);
    if(!target)return;
    target.selectedPlan=null;
    target.autoMatched=false;
    fbaLinkModalState.activeChildId=target.childId;
    resetFbaPlanQuery();
    renderFbaLinkModal();
  });
}
function renderFbaLinkFooter(){
  const items=fbaLinkModalState.items;
  if(!items.length){
    $('#fbaLinkFooterStats').innerHTML='<span class="minimal-pill">尚未勾选待关联明细</span>';
    const confirmBtn=$('#fbaLinkConfirmBtn');
    if(confirmBtn){
      confirmBtn.disabled=true;
      confirmBtn.textContent='确认关联';
    }
    return;
  }
  const pickedCount=items.filter(x=>Boolean(x.selectedPlan)).length;
  const declaredSum=items.reduce((s,x)=>s+Number(x.declared||0),0);
  const pickedPlanQtySum=items.filter(x=>x.selectedPlan).reduce((s,x)=>s+Number(x.selectedPlan.quantity||0),0);
  $('#fbaLinkFooterStats').innerHTML=`
    <span class="minimal-pill">待关联明细 <em>${items.length}</em> 条</span>
    <span class="minimal-pill">已选发货计划 <em>${pickedCount}/${items.length}</em></span>
    <span class="minimal-pill">勾选货件申报量 <em>${declaredSum.toLocaleString()}</em></span>
    <span class="minimal-pill">已选计划发货量 <em>${pickedPlanQtySum.toLocaleString()}</em></span>
  `;
  const confirmBtn=$('#fbaLinkConfirmBtn');
  if(confirmBtn){
    confirmBtn.disabled=pickedCount===0;
    confirmBtn.textContent=pickedCount>0?`确认关联（${pickedCount}/${items.length}）`:'确认关联';
  }
}
function renderFbaPlanList(){
  const activeItem=fbaLinkModalState.items.find(x=>x.childId===fbaLinkModalState.activeChildId);
  const plans=filteredFbaPlans(),pages=Math.max(1,Math.ceil(plans.length/fbaState.planPageSize));
  fbaState.planPage=Math.min(fbaState.planPage,pages);
  const data=plans.slice((fbaState.planPage-1)*fbaState.planPageSize,fbaState.planPage*fbaState.planPageSize);
  $('#fbaPlanListInfo').textContent=`共 ${plans.length} 条候选发货计划`;
  $('#fbaPlanJumpPage').value=fbaState.planPage;
  $('#fbaPlanPageTotal').textContent=pages;
  $('#fbaPlanPrevPage').disabled=fbaState.planPage===1;
  $('#fbaPlanNextPage').disabled=fbaState.planPage===pages;
  if(!data.length){
    $('#fbaPlanListBody').innerHTML='<tr class="fba-plan-empty"><td colspan="11">暂无符合条件的待发货计划</td></tr>';
    return;
  }
  const activePickedId=activeItem&&activeItem.selectedPlan?activeItem.selectedPlan.id:'';
  $('#fbaPlanListBody').innerHTML=data.map(plan=>{
    const isSel=plan.id===activePickedId;
    return `<tr class="${isSel?'selected':''}" data-fba-plan-row="${plan.id}">
      <td class="fba-plan-radio"><input type="radio" name="fbaPlanChoice" value="${plan.id}" ${isSel?'checked':''}></td>
      <td><b style="color:#1677ff;font-weight:500">${plan.plan}</b></td>
      <td>${plan.sku}</td>
      <td>${plan.msku}</td>
      <td>${plan.fnsku}</td>
      <td title="${plan.product}">${plan.product}</td>
      <td>${plan.store}</td>
      <td><b>${plan.quantity}</b></td>
      <td>${plan.shipDate}</td>
      <td>${plan.arrivalDate}</td>
      <td>${plan.remark||'—'}</td>
    </tr>`;
  }).join('');
  $$('[data-fba-plan-row]').forEach(row=>row.onclick=()=>{
    const plan=fbaPlanOptions.find(item=>item.id===row.dataset.fbaPlanRow);
    if(!activeItem||!plan)return;
    activeItem.selectedPlan=plan;
    activeItem.autoMatched=false;
    /* 自动跳到左侧下一条「待选择」的项 */
    const items=fbaLinkModalState.items;
    const curIdx=items.findIndex(x=>x.childId===activeItem.childId);
    const nextPending=items.slice(curIdx+1).find(x=>!x.selectedPlan)||items.slice(0,curIdx).find(x=>!x.selectedPlan);
    if(nextPending){
      fbaLinkModalState.activeChildId=nextPending.childId;
      resetFbaPlanQuery();
    }
    renderFbaLinkModal();
  });
}
function renderFbaLinkModal(){
  const items=fbaLinkModalState.items;
  const hasItems=items.length>0;
  $('#fbaLinkManualBody').classList.toggle('hidden',!hasItems);
  $('#fbaLinkManualEmpty').classList.toggle('hidden',hasItems);
  if(hasItems){
    const activeItem=items.find(x=>x.childId===fbaLinkModalState.activeChildId);
    if(activeItem){
      const shipEl=$('#fbaPlanDefaultShipment');
      if(shipEl)shipEl.textContent=activeItem.shipmentNo||'—';
      $('#fbaPlanDefaultStore').textContent=activeItem.seller||'—';
      $('#fbaPlanDefaultSku').textContent=activeItem.sku||'—';
      $('#fbaPlanDefaultFnsku').textContent=activeItem.fnsku||'—';
      const declaredEl=$('#fbaPlanDefaultDeclared');
      if(declaredEl)declaredEl.textContent=activeItem.declared?Number(activeItem.declared).toLocaleString():'—';
    }
    renderFbaLinkNav();
    renderFbaPlanList();
  }
  renderFbaLinkFooter();
}
function switchFbaLinkTab(tab){
  const nextTab=tab==='import'?'import':'manual';
  fbaLinkModalState.activeTab=nextTab;
  const isManual=nextTab==='manual';
  $('#fbaLinkTabManual').classList.toggle('is-active',isManual);
  $('#fbaLinkTabManual').setAttribute('aria-selected',String(isManual));
  $('#fbaLinkTabImport').classList.toggle('is-active',!isManual);
  $('#fbaLinkTabImport').setAttribute('aria-selected',String(!isManual));

  $('#fbaLinkManualPane').classList.toggle('hidden',!isManual);
  $('#fbaLinkImportPane').classList.toggle('hidden',isManual);

  $('#fbaLinkFooterStats').classList.toggle('hidden',!isManual);
  $('#fbaLinkManualFooterActions').classList.toggle('hidden',!isManual);
  $('#importLinkFileInfo').classList.toggle('hidden',isManual);
  $('#fbaLinkImportFooterActions').classList.toggle('hidden',isManual);

  const items=fbaLinkModalState.items;
  if(isManual){
    $('#fbaLinkSubtitle').textContent=items.length
      ?`共 ${items.length} 条待关联明细（已自动预选唯一匹配计划）；左侧切换「FBA货件 + 领星 SKU」，右侧点选 1 条发货计划后自动跳至下一待选项`
      :'「勾选关联」需要先在列表勾选未关联发货计划的明细，或直接切换至「导入关联」上传 .xlsx 模板';
    renderFbaLinkModal();
  }else{
    $('#fbaLinkSubtitle').textContent='下载标准 .xlsx 模板填写关联信息并上传导入；支持切换至「勾选关联」核对已勾选明细';
  }
}
function getLinkedShipmentsForPlan(planNo){
  if(!planNo)return [];
  const res=[];
  const map=new Map();
  fbaGroups.forEach(group=>{
    group.children.forEach(child=>{
      if(!(child.linkedPlans||[]).includes(planNo))return;
      const qty=Number(child.declared||0);
      if(!map.has(group.shipmentNo)){
        const entry={shipmentNo:group.shipmentNo,shipmentName:group.shipmentName||'',declaredQty:qty};
        map.set(group.shipmentNo,entry);
        res.push(entry);
      }else{
        map.get(group.shipmentNo).declaredQty+=qty;
      }
    });
  });
  return res;
}
function mapDestWarehouseForAutoOrder(grp){
  const seller=String(grp.seller||'').toUpperCase();
  if(seller.includes('CA'))return '跨跃猫美西一件代发仓 多伦多3仓';
  if(seller.includes('UK'))return 'UK-曼彻斯特海外仓';
  if(seller.includes('DE'))return 'DE-法兰克福海外仓';
  return '跨跃猫美西一件代发仓 美西仓';
}
function isPlanReadyForShippingOrder(planNo){
  const bridge=readV2Bridge();
  const up=bridge.v2StatusFromUpstream[planNo];
  if(up)return up.status==='pending_shipping_order';
  const opt=fbaPlanOptions.find(p=>p.plan===planNo);
  if(opt&&opt.fromV2)return opt.statusKey==='pending_shipping_order';
  return opt?opt.status==='待生成发货单'||opt.status==='待发货'||opt.status==='已完成':false;
}
function applyOrderGeneratedToPlans(bridge,planNos,fallbackOrderNo){
  (planNos||[]).forEach(pNo=>{
    if(!pNo)return;
    const linkedForPlan=getLinkedShipmentsForPlan(pNo);
    const allShipmentNos=linkedForPlan.map(x=>x.shipmentNo);
    const hasPendingPrelink=(bridge.prelinkedShipments||[]).some(pr=>pr&&pr.planNo===pNo);
    const allOrderNos=[...new Set(allShipmentNos.map(no=>{
      if(bridge.fbaShipmentOrderLinks[no])return bridge.fbaShipmentOrderLinks[no];
      const g=fbaGroups.find(x=>x.shipmentNo===no);
      return (g&&g.shipmentOrderNo)||'';
    }).filter(Boolean))];
    const mergedOrderNos=allOrderNos.join('、')||fallbackOrderNo;
    const allShipmentsGenerated=!hasPendingPrelink&&allShipmentNos.length>0&&allShipmentNos.every(no=>{
      if(bridge.fbaShipmentOrderLinks[no])return true;
      const g=fbaGroups.find(x=>x.shipmentNo===no);
      return Boolean(g&&g.shipmentOrderNo);
    });
    bridge.shippingOrderLinks[pNo]=mergedOrderNos;
    const curUp=bridge.v2StatusFromUpstream[pNo]||{};
    const opt=fbaPlanOptions.find(p=>p.plan===pNo);
    if(allShipmentsGenerated){
      bridge.v2StatusFromUpstream[pNo]={...curUp,status:'pending_ship',arrivalSubStatus:'',shippingOrderNo:mergedOrderNos};
      if(opt){opt.status='待发货';opt.statusKey='pending_ship';}
    }else{
      bridge.v2StatusFromUpstream[pNo]={...curUp,status:'pending_shipping_order',arrivalSubStatus:'',shippingOrderNo:mergedOrderNos};
      if(opt){opt.status='待生成发货单';opt.statusKey='pending_shipping_order';}
    }
  });
}
function tryAutoGenerateDraftShippingOrders(shipmentNos){
  const bridge=readV2Bridge();
  const created=[];
  const now=new Date().toISOString().replace('T',' ').slice(0,19);
  (shipmentNos||[]).forEach(sNo=>{
    const grp=fbaGroups.find(g=>g.shipmentNo===sNo);
    if(!grp)return;
    if(grp.shipmentOrderNo||bridge.fbaShipmentOrderLinks[grp.shipmentNo])return;
    if(['DELETED','CANCELLED','ABANDONED'].includes(grp.status))return;
    const children=grp.children||[];
    if(!children.length||children.some(c=>!c.linkedPlans||!c.linkedPlans.length))return;
    const planNos=[...new Set(children.flatMap(c=>c.linkedPlans||[]))];
    if(!planNos.every(isPlanReadyForShippingOrder))return;

    const orderNo=`DN${now.slice(0,10).replace(/-/g,'')}${String(Math.floor(100+Math.random()*899))}`;
    const items=children.map(c=>{
      const pNo=(c.linkedPlans||[])[0]||'';
      const opt=fbaPlanOptions.find(p=>p.plan===pNo);
      const decl=Number(c.declared||0);
      return {
        sku:c.sku,
        name:c.product||opt?.product||c.sku,
        plan:pNo,
        remark:opt?.remark||'',
        declare:decl,
        planQty:Number(opt?.quantity||decl),
        pick:0,
        ship:0,
        shipped:0,
        receive:0,
        status:'草稿'
      };
    });
    const declTotal=items.reduce((s,it)=>s+Number(it.declare||0),0);
    bridge.autoShippingOrders=bridge.autoShippingOrders.filter(o=>o.fbaShipmentNo!==grp.shipmentNo);
    bridge.autoShippingOrders.unshift({
      id:orderNo,
      creator:'系统自动生成',
      created:now.slice(0,10),
      status:'草稿',
      logistics:'未提交',
      from:'跨跃猫物流仓',
      to:mapDestWarehouseForAutoOrder(grp),
      shipMode:'FBA直发',
      channel:'—',
      transport:'海卡（6000）',
      provider:'—',
      country:grp.countryCode==='US'?'美国 - US':(grp.countryCode||'美国 - US'),
      warehouseType:'平台仓',
      shipmentNo:grp.shipmentNo,
      fbaShipmentNo:grp.shipmentNo,
      referenceId:grp.reference||grp.shipmentName||'—',
      remark:`由 FBA 货件 ${grp.shipmentNo} 关联全部计划均达「待生成发货单」后自动生成`,
      plans:planNos.length,
      skus:items.length,
      planQty:items.reduce((s,it)=>s+Number(it.planQty||0),0),
      declare:declTotal,
      pick:0,
      ship:0,
      receive:0,
      pendingReceive:0,
      items
    });
    grp.shipmentOrderNo=orderNo;
    bridge.fbaShipmentOrderLinks[grp.shipmentNo]=orderNo;
    bridge.shippingOrderDestMap=bridge.shippingOrderDestMap||{};
    bridge.shippingOrderDestMap[orderNo]=mapDestWarehouseForAutoOrder(grp);
    applyOrderGeneratedToPlans(bridge,planNos,orderNo);
    created.push(orderNo);
  });
  if(created.length){
    writeV2Bridge(bridge);
    snapshotFbaShipmentsToBridge();
  }
  return created;
}
function syncPlanLinkState(planNo){
  if(!planNo)return [];
  const linkedShipments=getLinkedShipmentsForPlan(planNo);
  const declaredTotal=linkedShipments.reduce((sum,x)=>sum+Number(x.declaredQty||0),0);
  const opt=fbaPlanOptions.find(p=>p.plan===planNo);
  const rawPlan=rows.find(r=>r.plan===planNo);
  const planQty=Number((opt&&opt.quantity)||(rawPlan&&rawPlan.quantity)||0);
  const bridge=readV2Bridge();

  if(linkedShipments.length>0){
    const diff=planQty>0?declaredTotal-planQty:0;
    const nextStatusKey=diff!==0?'pending_review':'pending_shipping_order';
    const nextStatusLabel=diff!==0?'待复核':'待生成发货单';
    if(opt){opt.status=nextStatusLabel;opt.statusKey=nextStatusKey;}
    if(rawPlan){
      rawPlan.status=nextStatusLabel;
      rawPlan.statusKey=nextStatusKey;
      rawPlan.linkedShipments=linkedShipments.map(x=>x.shipmentNo);
    }
    const shipNos=linkedShipments.map(x=>x.shipmentNo).join('、');
    const shipNames=linkedShipments.map(x=>x.shipmentName).filter(Boolean).join('、');
    bridge.links[planNo]={
      shipmentNo:shipNos,
      shipmentName:shipNames,
      shipmentCount:linkedShipments.length,
      declaredTotal
    };
    bridge.unlinkedPlans=bridge.unlinkedPlans.filter(p=>p!==planNo);
    bridge.v2StatusFromUpstream[planNo]={
      status:nextStatusKey,
      arrivalSubStatus:'',
      planDiff:diff,
      fbaShipmentNo:shipNos,
      fbaRefId:shipNames
    };
    writeV2Bridge(bridge);
  }else{
    if(opt){opt.status='待创建货件';opt.statusKey='pending_fba_create';}
    if(rawPlan){
      rawPlan.status='待创建货件';
      rawPlan.statusKey='pending_fba_create';
      rawPlan.linkedShipments=[];
    }
    persistV2BridgeUnlink(planNo);
  }
  return linkedShipments;
}
function executeBatchLinkPlans(pickedItems){
  const affectedPlans=[];
  const affectedShipments=new Set();
  pickedItems.forEach(item=>{
    const child=findFbaChild(item.childId);
    if(child){
      child.linkedPlans=[item.selectedPlan.plan];
      if(!affectedPlans.includes(item.selectedPlan.plan))affectedPlans.push(item.selectedPlan.plan);
      affectedShipments.add(item.shipmentNo);
      fbaState.selectedChildIds.delete(child.id);
      addPlanLog(item.selectedPlan.id,'关联FBA货件',`货件 ${item.shipmentNo}（SKU ${item.sku}）关联发货计划 ${item.selectedPlan.plan}`);
    }
  });
  affectedPlans.forEach(planNo=>syncPlanLinkState(planNo));
  snapshotFbaShipmentsToBridge();
  const autoOrders=tryAutoGenerateDraftShippingOrders([...affectedShipments]);
  closeFbaPlanPopover();
  renderFbaTable();
  const reviewCount=affectedPlans.filter(p=>{
    const opt=fbaPlanOptions.find(x=>x.plan===p);
    return opt&&opt.statusKey==='pending_review';
  }).length;
  if(autoOrders.length){
    toast(`关联成功！货件已自动生成草稿发货单 ${autoOrders.join('、')}`);
  }else if(reviewCount){
    toast(`已关联 ${pickedItems.length} 条明细，其中 ${reviewCount} 条存在数量差异已提交计划「待复核」`);
  }else{
    toast(`已成功关联 ${pickedItems.length} 条明细，对应计划进入「待生成发货单」`);
  }
}
function closeFbaDiffConfirm(){
  $('#fbaDiffConfirmMask')?.classList.add('hidden');
}
function confirmBatchLinkPlans(){
  const pickedItems=fbaLinkModalState.items.filter(x=>Boolean(x.selectedPlan));
  if(!pickedItems.length){toast('请至少为 1 条明细选择发货计划','error');return;}

  /* 预计算每个受影响计划关联后的累计 FBA 申报数量，检验是否存在差异 */
  const pickedByPlan=new Map();
  pickedItems.forEach(item=>{
    const pNo=item.selectedPlan.plan;
    if(!pickedByPlan.has(pNo))pickedByPlan.set(pNo,[]);
    pickedByPlan.get(pNo).push(item);
  });
  const discrepancies=[];
  pickedByPlan.forEach((items,planNo)=>{
    const planObj=items[0].selectedPlan;
    const planQty=Number(planObj.quantity||0);
    if(planQty<=0)return;
    const pickedChildIds=new Set(items.map(i=>i.childId));
    let existingDeclared=0;
    fbaGroups.forEach(g=>{
      g.children.forEach(c=>{
        if(!pickedChildIds.has(c.id)&&(c.linkedPlans||[]).includes(planNo)){
          existingDeclared+=Number(c.declared||0);
        }
      });
    });
    const addedDeclared=items.reduce((s,i)=>s+Number(i.declared||0),0);
    const totalDeclared=existingDeclared+addedDeclared;
    if(totalDeclared!==planQty){
      discrepancies.push({
        planNo,
        sku:planObj.sku,
        planQty,
        totalDeclared,
        diff:totalDeclared-planQty
      });
    }
  });

  if(discrepancies.length){
    $('#fbaDiffConfirmBody').innerHTML=discrepancies.map(d=>`
      <tr>
        <td><b>${d.planNo}</b></td>
        <td>${d.sku}</td>
        <td>${d.planQty}</td>
        <td>${d.totalDeclared}</td>
        <td><span style="color:#f56c6c;font-weight:600;">${d.diff>0?`+${d.diff}`:d.diff}</span></td>
      </tr>`).join('');
    $('#fbaDiffConfirmMask').classList.remove('hidden');
    $('#fbaDiffProceedBtn').onclick=()=>{
      closeFbaDiffConfirm();
      executeBatchLinkPlans(pickedItems);
    };
    $('#fbaDiffCancelBtn').onclick=closeFbaDiffConfirm;
    $('#fbaDiffConfirmClose').onclick=closeFbaDiffConfirm;
    return;
  }

  executeBatchLinkPlans(pickedItems);
}
function findFbaChild(childId){return fbaGroups.flatMap(group=>group.children).find(child=>child.id===childId);}
function openFbaUnlinkConfirm(childIds){
  const ids=(Array.isArray(childIds)?childIds:[childIds]).filter(Boolean);
  const targets=ids.map(id=>findFbaChild(id)).filter(ch=>ch&&ch.linkedPlans&&ch.linkedPlans.length);
  if(!targets.length){
    toast('当前勾选中没有已关联发货计划的明细','error');
    return;
  }
  fbaState.pendingUnlinkIds=targets.map(t=>t.id);
  if(targets.length===1){
    const child=targets[0];
    const linkedPlan=child.linkedPlans[0];
    const linkedCount=fbaGroups.flatMap(g=>g.children).filter(c=>(c.linkedPlans||[]).includes(linkedPlan)).length;
    const tailNote=linkedCount>1
      ?`该发货计划当前还关联着其他 ${linkedCount-1} 条货件明细，取消后仅解除本条关联。`
      :'取消后该明细恢复为未关联状态，对应发货计划将回退至「待创建货件」。';
    $('#fbaUnlinkConfirmText').textContent=`确定要取消当前商品「${child.msku}（SKU: ${child.sku}）」与发货计划「${linkedPlan}」的关联吗？${tailNote}`;
  }else{
    const plans=[...new Set(targets.map(t=>t.linkedPlans[0]).filter(Boolean))];
    $('#fbaUnlinkConfirmText').textContent=`确定要取消所选 ${targets.length} 条商品明细与发货计划（${plans.join('、')}）的关联吗？取消后明细恢复为未关联状态。`;
  }
  $('#fbaUnlinkConfirmMask').classList.remove('hidden');
}
function closeFbaUnlinkConfirm(){fbaState.pendingUnlinkIds=[];$('#fbaUnlinkConfirmMask').classList.add('hidden');}
function confirmFbaUnlink(){
  const ids=fbaState.pendingUnlinkIds||[];
  const affectedPlans=[];
  let unlinkedCount=0;
  ids.forEach(id=>{
    const child=findFbaChild(id);
    if(!child||!child.linkedPlans.length)return;
    const linkedPlan=child.linkedPlans[0]||'';
    child.linkedPlans=[];
    fbaState.selectedChildIds.delete(child.id);
    unlinkedCount++;
    if(linkedPlan&&!affectedPlans.includes(linkedPlan))affectedPlans.push(linkedPlan);
  });
  let revertedPlans=0;
  affectedPlans.forEach(planNo=>{
    const remaining=syncPlanLinkState(planNo);
    if(!remaining.length)revertedPlans++;
  });
  snapshotFbaShipmentsToBridge();
  closeFbaUnlinkConfirm();
  renderFbaTable();
  if(!unlinkedCount)return;
  if(unlinkedCount===1&&affectedPlans.length===1){
    toast(revertedPlans>0
      ?`已取消关联发货计划 ${affectedPlans[0]}，计划已回退至「待创建货件」`
      :`已取消关联发货计划 ${affectedPlans[0]}`
    );
  }else{
    toast(`已取消关联 ${unlinkedCount} 条货件明细的发货计划`);
  }
}
function readFbaPlanQuery(){
  fbaState.planSearch=$('#fbaPlanSearch').value;
}
function resetFbaPlanQuery(){
  fbaState.planSearch='';fbaState.planPage=1;
  $('#fbaPlanSearch').value='';
}
function openFbaPlanPopover(childIds){
  const items=[];
  (childIds||[]).forEach(id=>{
    for(const group of fbaGroups){
      const child=group.children.find(c=>c.id===id);
      if(child&&!fbaLinked(child)){
        const item={
          groupId:group.id,
          shipmentNo:group.shipmentNo,
          shipmentName:group.shipmentName||'',
          seller:group.seller,
          center:group.center,
          childId:child.id,
          icon:child.icon||'📦',
          sku:child.sku,
          msku:child.msku,
          fnsku:child.fnsku,
          product:child.product,
          declared:child.declared,
          selectedPlan:null,
          autoMatched:false
        };
        /* 若仅命中唯一 1 条待发货计划，自动默认预选中 */
        const candidates=getCandidatePlansForItem(item);
        if(candidates.length===1){
          item.selectedPlan=candidates[0];
          item.autoMatched=true;
        }
        items.push(item);
        break;
      }
    }
  });
  fbaLinkModalState.items=items;
  const firstPending=items.find(x=>!x.selectedPlan)||items[0];
  fbaLinkModalState.activeChildId=firstPending?firstPending.childId:'';
  resetFbaPlanQuery();
  resetImportLinkPanel();
  switchFbaLinkTab(items.length>0?'manual':'import');
  $('#fbaLinkModalMask').classList.remove('hidden');
  $('#fbaLinkPopover').classList.remove('hidden');
}
function closeFbaPlanPopover(){
  $('#fbaLinkModalMask').classList.add('hidden');
  $('#fbaLinkPopover').classList.add('hidden');
  fbaLinkModalState.items=[];
  fbaLinkModalState.activeChildId='';
  resetImportLinkPanel();
}

/* ===================== 导入关联 FBA 货件（嵌入 Tab 2） ===================== */
const IMPORT_LINK_FIELDS=['发货计划号','SKU','店铺','FNSKU','FBA货件单号'];
let importLinkState={file:null,templateDownloaded:false,parsedRows:[],resultItems:[]};
function resetImportLinkPanel(){
  importLinkState={file:null,templateDownloaded:importLinkState.templateDownloaded,parsedRows:[],resultItems:[]};
  renderImportStep(1);
  if($('#importLinkFileInput'))$('#importLinkFileInput').value='';
  if($('#importLinkFileInfo'))$('#importLinkFileInfo').innerHTML='尚未选择文件';
  if($('#importLinkConfirm'))$('#importLinkConfirm').disabled=true;
  if($('#importLinkResult'))$('#importLinkResult').classList.add('hidden');
}
function renderImportStep(active){
  const steps=$$('#importLinkBody .import-step');
  steps.forEach((step,index)=>{
    const n=index+1;
    step.classList.toggle('active',n<=active);
    step.classList.toggle('done',n<active);
  });
}
function downloadImportLinkTemplate(){
  const escXml=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const sample=['SHP20260801-1','140US260008','ARCCAP','X00800001','FBA19JV2DS11'];
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table><tr>${IMPORT_LINK_FIELDS.map(f=>`<th>${escXml(f)}</th>`).join('')}</tr><tr>${sample.map(v=>`<td>${escXml(v)}</td>`).join('')}</tr></table></body></html>`;
  const blob=new Blob(['\ufeff'+html],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='导入关联FBA货件模板.xlsx';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  importLinkState.templateDownloaded=true;
  renderImportStep(1);
  toast('已下载 .xlsx 标准模板');
}
function importParseCsvLine(line){
  const out=[];let cur='',q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(q){
      if(c==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=c;
    }else{
      if(c==='"')q=true;
      else if(c===','){out.push(cur);cur='';}
      else cur+=c;
    }
  }
  out.push(cur);return out;
}
async function parseImportLinkRows(file){
  const buf=await new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(new Error('文件读取失败'));
    r.readAsArrayBuffer(file);
  });
  const bytes=new Uint8Array(buf);
  const isZip=bytes.length>=2&&bytes[0]===0x50&&bytes[1]===0x4b;
  if(isZip){
    /* 原型环境对原生 ZIP 格式 .xlsx 提供标准模板演示数据解析 */
    return [IMPORT_LINK_FIELDS.slice(),['SHP20260801-1','140US260008','ARCCAP','X00800001','FBA19JV2DS11']];
  }
  const text=new TextDecoder('utf-8').decode(bytes).replace(/^\ufeff/,'');
  if(/<table[\s>]/i.test(text)){
    const doc=new DOMParser().parseFromString(text,'text/html');
    return [...doc.querySelectorAll('table tr')].map(tr=>[...tr.children].map(cell=>(cell.textContent||'').trim())).filter(row=>row.some(Boolean));
  }
  return text.split(/\r?\n/).filter(l=>l.trim()).map(importParseCsvLine);
}
function onImportLinkFileChange(file){
  if(!file)return;
  const name=(file.name||'').toLowerCase();
  if(!['.xlsx','.xls','.csv'].some(ext=>name.endsWith(ext))){toast('文件格式不正确，请上传 .xlsx、.xls 或 .csv 文件','error');return;}
  importLinkState.file=file;
  $('#importLinkFileInfo').innerHTML=`<span class="file-name">当前文件：${file.name}</span><span class="file-remove" id="importLinkFileRemove">移除</span>`;
  $('#importLinkConfirm').disabled=false;
  renderImportStep(2);
  $('#importLinkFileRemove')?.addEventListener('click',e=>{e.stopPropagation();importLinkState.file=null;$('#importLinkFileInput').value='';$('#importLinkFileInfo').textContent='尚未选择文件';$('#importLinkConfirm').disabled=true;renderImportStep(1);});
}
function validateImportLinkHeaders(headerRow){
  const header=headerRow.map(h=>h.trim().replace(/^\*/,''));
  const missing=IMPORT_LINK_FIELDS.filter(f=>!header.includes(f));
  return {header,missing};
}
function findFbaShipmentChild(shipmentNo,sku,fnsku){
  for(const g of fbaGroups){
    if(g.shipmentNo.toLowerCase()!==String(shipmentNo).toLowerCase())continue;
    const child=g.children.find(c=>String(c.sku).toLowerCase()===String(sku).toLowerCase()&&String(c.fnsku).toLowerCase()===String(fnsku).toLowerCase());
    if(child)return {group:g,child};
  }
  const groupOnly=fbaGroups.find(g=>g.shipmentNo.toLowerCase()===String(shipmentNo).toLowerCase());
  if(groupOnly)return {group:groupOnly,child:null};
  return null;
}
function matchDestination(row,group){
  const planDest=(row.destinationWarehouse||'').toLowerCase().trim();
  const fbaCenter=(group&&group.center?group.center:'').toLowerCase().trim();
  if(!planDest||!fbaCenter)return true;
  return planDest===fbaCenter;
}
async function submitImportLink(){
  const file=importLinkState.file;
  if(!file){toast('请先选择需要导入的文件','error');return;}
  renderImportStep(2);
  const parsedRows=await parseImportLinkRows(file);
  if(parsedRows.length<2){toast('文件内容为空或缺少数据行，导入失败','error');return;}
  const headerInfo=validateImportLinkHeaders(parsedRows[0]);
  if(headerInfo.missing.length){toast(`导入失败：模板表头缺少字段 ${headerInfo.missing.join('、')}`,'error');return;}
  const header=headerInfo.header;
  const idx=name=>header.indexOf(name);
  const firstDataCells=parsedRows[1]||[];
  const looksLikeHintRow=firstDataCells.some(cell=>/^必填[，,]/.test(String(cell||'').trim()));
  const startRow=looksLikeHintRow?2:1;
  const dataLines=parsedRows.slice(startRow);
  const items=[];
  const childSeen=new Set();
  for(let i=0;i<dataLines.length;i++){
    const lineNo=i+startRow+1;
    const cells=dataLines[i];
    const planNo=(cells[idx('发货计划号')]||'').trim();
    const sku=(cells[idx('SKU')]||'').trim();
    const store=(cells[idx('店铺')]||'').trim();
    const fnsku=(cells[idx('FNSKU')]||'').trim();
    const shipmentNo=(cells[idx('FBA货件单号')]||'').trim();
    const item={lineNo,planNo,sku,store,fnsku,shipmentNo,status:'',msg:''};
    const empty=[];
    if(!planNo)empty.push('发货计划号');if(!sku)empty.push('SKU');if(!store)empty.push('店铺');if(!fnsku)empty.push('FNSKU');if(!shipmentNo)empty.push('FBA货件单号');
    if(empty.length){item.status='fail';item.msg=`字段缺失：${empty.join('、')}`;items.push(item);continue;}
    const plan=rows.find(r=>r.plan===planNo);
    if(!plan){item.status='fail';item.msg='发货计划不存在';items.push(item);continue;}
    if(plan.status==='已作废'||plan.status==='已取消'){item.status='fail';item.msg=`发货计划状态为「${plan.status}」，不可关联`;items.push(item);continue;}
    if(plan.sku.toLowerCase()!==sku.toLowerCase()){item.status='fail';item.msg=`SKU 与发货计划不一致（计划 SKU=${plan.sku}）`;items.push(item);continue;}
    if(plan.store!==store){item.status='fail';item.msg=`店铺与发货计划不一致（计划店铺=${plan.store}）`;items.push(item);continue;}
    const match=findFbaShipmentChild(shipmentNo,sku,fnsku);
    if(!match){
      item.status='prelink';item.msg='FBA 货件尚未同步至中台，已记录预关联，待下次同步后自动完成关联';
      if(!plan.prelinkShipments)plan.prelinkShipments=[];
      plan.prelinkShipments.push(shipmentNo);
      if(!plan.linkedShipments.includes(shipmentNo))plan.linkedShipments.push(shipmentNo);
      addPlanLog(plan.id,'预关联FBA货件',`SKU ${plan.sku} 预关联货件 ${shipmentNo}（货件待同步）`);
      items.push(item);continue;
    }
    if(!match.child){
      item.status='fail';item.msg=`FBA 货件已存在，但未找到 SKU=${sku} 且 FNSKU=${fnsku} 的明细`;items.push(item);continue;
    }
    if(match.child.linkedPlans&&match.child.linkedPlans.length>0){
      item.status='fail';item.msg=`该货件 SKU 已被计划 ${match.child.linkedPlans.join('、')} 关联，不可重复关联`;items.push(item);continue;
    }
    const childKey=`${shipmentNo}|${sku}|${fnsku}`;
    if(childSeen.has(childKey)){item.status='fail';item.msg='同一文件内货件+SKU+FNSKU 重复，不可重复关联';items.push(item);continue;}
    childSeen.add(childKey);
    if(!matchDestination(plan,match.group)){
      item.status='fail';item.msg=`目的地仓不匹配（发货计划目的地仓=${plan.destinationWarehouse}，货件物流中心=${match.group.center}）`;items.push(item);continue;
    }
    match.child.linkedPlans=[plan.plan];
    syncPlanLinkState(plan.plan);
    snapshotFbaShipmentsToBridge();
    tryAutoGenerateDraftShippingOrders([match.group.shipmentNo]);
    addPlanLog(plan.id,'关联FBA货件',`SKU ${plan.sku} 关联货件 ${shipmentNo}（FNSKU=${fnsku}，店铺=${store}）`);
    const opt=fbaPlanOptions.find(p=>p.plan===plan.plan);
    item.status='success';
    item.msg=opt&&opt.statusKey==='pending_review'
      ?'关联成功，因数量存在差异已进入「待复核」'
      :'关联成功，已进入「待生成发货单」/「待发货」';
    items.push(item);
  }
  importLinkState.resultItems=items;
  renderImportLinkResult(items);
  renderImportStep(3);
  renderFbaTable();
}
function renderImportLinkResult(items){
  const success=items.filter(x=>x.status==='success').length;
  const fail=items.filter(x=>x.status==='fail').length;
  const prelink=items.filter(x=>x.status==='prelink').length;
  $('#importLinkSuccessCount').textContent=success;
  $('#importLinkFailCount').textContent=fail;
  $('#importLinkPrelinkCount').textContent=prelink;
  $('#importLinkPrelinkWrap').style.display=prelink>0?'':'none';
  const label={success:'成功',fail:'失败',prelink:'预关联'};
  $('#importLinkResultBody').innerHTML=items.map(it=>`<tr class="${it.status}"><td>${label[it.status]||it.status}</td><td>${it.lineNo}</td><td>${it.planNo||'—'}</td><td>${it.sku||'—'}</td><td>${it.shipmentNo||'—'}</td><td>${it.msg||'—'}</td></tr>`).join('');
  $('#importLinkResult').classList.remove('hidden');
  toast(`导入完成：成功 ${success} 条 / 失败 ${fail} 条${prelink?' / 预关联 '+prelink+' 条':''}`);
}
function exportImportLinkFail(){
  const fails=importLinkState.resultItems.filter(x=>x.status==='fail');
  if(!fails.length){toast('没有失败行可导出');return;}
  const header=[...IMPORT_LINK_FIELDS,'失败原因'];
  const csv='\ufeff'+header.map(h=>`"${h}"`).join(',')+'\n'+fails.map(it=>[it.planNo,it.sku,it.store,it.fnsku,it.shipmentNo,it.msg].map(v=>`"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='导入关联FBA货件-失败行.csv';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
function initImportLink(){
  $('#importLinkCancel').onclick=closeFbaPlanPopover;
  $('#importLinkDownloadTpl').onclick=downloadImportLinkTemplate;
  $('#importLinkChooseFile').onclick=()=>$('#importLinkFileInput').click();
  $('#importLinkDropArea').onclick=()=>$('#importLinkFileInput').click();
  $('#importLinkFileInput').addEventListener('change',e=>onImportLinkFileChange(e.target.files[0]));
  ['dragenter','dragover'].forEach(ev=>$('#importLinkDropArea').addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();$('#importLinkDropArea').classList.add('drag-over');}));
  ['dragleave','drop'].forEach(ev=>$('#importLinkDropArea').addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();$('#importLinkDropArea').classList.remove('drag-over');}));
  $('#importLinkDropArea').addEventListener('drop',e=>{const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];onImportLinkFileChange(f);if(f)$('#importLinkFileInput').files=e.dataTransfer.files;});
  $('#importLinkConfirm').onclick=submitImportLink;
  $('#importLinkExportFail').onclick=exportImportLinkFail;
}

/* ===================== 批量勾选（一二级父子联动）与顶部操作按钮 ===================== */
function getSelectedUnlinkedChildIds(){
  const ids=[];
  fbaGroups.forEach(group=>{
    group.children.forEach(child=>{
      if(fbaState.selectedChildIds.has(child.id)&&!fbaLinked(child))ids.push(child.id);
    });
  });
  return ids;
}
function getSelectedLinkedChildIds(){
  const ids=[];
  fbaGroups.forEach(group=>{
    group.children.forEach(child=>{
      if(fbaState.selectedChildIds.has(child.id)&&fbaLinked(child))ids.push(child.id);
    });
  });
  return ids;
}
function getSelectedGenOrderGroups(){
  return fbaGroups.filter(group=>canGenerateOrderForGroup(group)&&group.children.some(child=>fbaState.selectedChildIds.has(child.id)));
}

function syncSelectionUi(pageData){
  /* 清理已不可勾选的明细选中项 */
  for(const cid of [...fbaState.selectedChildIds]){
    let keep=false;
    for(const group of fbaGroups){
      const ch=group.children.find(c=>c.id===cid);
      if(ch&&canSelectChild(group,ch)){keep=true;break;}
    }
    if(!keep)fbaState.selectedChildIds.delete(cid);
  }

  /* 更新每一行一级货件复选框 & 展开子表表头复选框的 checked/indeterminate */
  (pageData||[]).forEach(group=>{
    const selectable=group.children.filter(c=>canSelectChild(group,c));
    const allChecked=selectable.length>0&&selectable.every(c=>fbaState.selectedChildIds.has(c.id));
    const someChecked=selectable.some(c=>fbaState.selectedChildIds.has(c.id));
    const parentCb=$(`[data-fba-check="${group.id}"]`);
    if(parentCb){
      parentCb.checked=allChecked;
      parentCb.indeterminate=!allChecked&&someChecked;
      parentCb.disabled=selectable.length===0;
    }
    const groupAllCb=$(`[data-fba-group-check-all="${group.id}"]`);
    if(groupAllCb){
      groupAllCb.checked=allChecked;
      groupAllCb.indeterminate=!allChecked&&someChecked;
      groupAllCb.disabled=selectable.length===0;
    }
  });

  /* 同步本页全选按钮 */
  const pageSelectableChildren=(pageData||[]).flatMap(g=>g.children.filter(c=>canSelectChild(g,c)));
  const selectAllEl=$('#fbaSelectAll');
  if(selectAllEl){
    const allChecked=pageSelectableChildren.length>0&&pageSelectableChildren.every(c=>fbaState.selectedChildIds.has(c.id));
    const someChecked=pageSelectableChildren.some(c=>fbaState.selectedChildIds.has(c.id));
    selectAllEl.checked=allChecked;
    selectAllEl.indeterminate=!allChecked&&someChecked;
    selectAllEl.disabled=pageSelectableChildren.length===0;
    selectAllEl.onchange=()=>{
      pageSelectableChildren.forEach(c=>{
        if(selectAllEl.checked)fbaState.selectedChildIds.add(c.id);
        else fbaState.selectedChildIds.delete(c.id);
      });
      renderFbaTable();
    };
  }

  /* 同步【生成发货单】、【同步领星货件】与【取消关联】按钮状态与数量 */
  const genGroups=getSelectedGenOrderGroups();
  const genBtn=$('#createShipmentOrderBtn');
  if(genBtn){
    genBtn.disabled=genGroups.length===0;
    genBtn.textContent=genGroups.length>0?`生成发货单（${genGroups.length}）`:'生成发货单';
  }
  const syncBtn=$('#syncFbaPrelinksBtn');
  if(syncBtn){
    const preCount=(readV2Bridge().prelinkedShipments||[]).length;
    syncBtn.textContent=preCount>0?`同步领星货件（${preCount} 待同步）`:'同步领星货件';
  }
  const unlinkChildIds=getSelectedLinkedChildIds();
  const unlinkBtn=$('#batchUnlinkPlanBtn');
  if(unlinkBtn){
    unlinkBtn.disabled=unlinkChildIds.length===0;
    unlinkBtn.textContent=unlinkChildIds.length>0?`取消关联（${unlinkChildIds.length}）`:'取消关联';
  }
}

function syncPrelinkedShipmentsFromLingxing(){
  const bridge=readV2Bridge();
  const pending=Array.isArray(bridge.prelinkedShipments)?bridge.prelinkedShipments:[];
  if(!pending.length){
    toast('当前暂无待同步的预关联 FBA 货件（所有已同步货件均为最新）');
    return;
  }
  const now=new Date().toISOString().replace('T',' ').slice(0,19);
  const byShip=new Map();
  pending.forEach(item=>{
    if(!item||!item.shipmentNo)return;
    const sNo=String(item.shipmentNo).trim().toUpperCase();
    if(!byShip.has(sNo))byShip.set(sNo,[]);
    byShip.get(sNo).push(item);
  });
  const affectedPlans=new Set();
  const syncedNos=[];
  byShip.forEach((items,shipmentNo)=>{
    let grp=fbaGroups.find(g=>g.shipmentNo===shipmentNo);
    const first=items[0];
    if(!grp){
      grp={
        id:`fba-group-sync-${Date.now()}-${Math.floor(Math.random()*999)}`,
        shipmentNo,
        shipmentName:`${first.country||'US'}-${first.sku}-SYNC`,
        isSta:1,
        staInboundPlanId:`wf-sync-${shipmentNo.toLowerCase()}`,
        staDeliveryStartDate:now.slice(0,10),
        staDeliveryEndDate:now.slice(0,10),
        transportMode:'',
        shipmentOrderNo:'',
        lingxingOrderNo:'',
        center:'ONT8',
        seller:first.store==='ARCCAPTAIN_US'?'ARCCAPTAIN主账号-US':(first.store||'ARCCAPTAIN主账号-US'),
        countryCode:first.country||'US',
        reference:`SYNC-${shipmentNo.slice(-4)}`,
        creator:'领星同步',
        created:now.slice(0,16),
        modified:now.slice(0,16),
        status:'WORKING',
        isClosed:0,
        children:[]
      };
      fbaGroups.unshift(grp);
    }
    items.forEach((item,idx)=>{
      const decl=Number(item.declaredHint>0?item.declaredHint:(item.planShipQty||0));
      let child=grp.children.find(c=>String(c.sku).toLowerCase()===String(item.sku).toLowerCase()&&((!c.linkedPlans||!c.linkedPlans.length)||(c.linkedPlans||[]).includes(item.planNo)));
      if(!child){
        child={
          id:`fba-sync-${shipmentNo}-${Date.now()}-${idx}`,
          icon:'📦',
          sku:item.sku,
          msku:item.sku,
          fnsku:item.fnsku||'-',
          product:item.productName||item.sku,
          declared:decl,
          initDeclared:decl,
          sent:0,
          received:0,
          linkedPlans:item.planNo?[item.planNo]:[]
        };
        grp.children.push(child);
      }else if(item.planNo&&!(child.linkedPlans||[]).includes(item.planNo)){
        child.linkedPlans=[...(child.linkedPlans||[]),item.planNo];
      }
      if(item.planNo)affectedPlans.add(item.planNo);
    });
    syncedNos.push(shipmentNo);
  });
  bridge.prelinkedShipments=[];
  writeV2Bridge(bridge);
  affectedPlans.forEach(pNo=>syncPlanLinkState(pNo));
  snapshotFbaShipmentsToBridge();
  const autoOrders=tryAutoGenerateDraftShippingOrders(syncedNos);
  renderFbaTable();
  if(autoOrders.length){
    toast(`已同步预关联货件 ${syncedNos.join('、')}，数量无差异并自动生成草稿发货单 ${autoOrders.join('、')}`);
  }else{
    toast(`已从领星同步 ${syncedNos.length} 个预关联货件，并完成发货计划关联校验`);
  }
}

/* 复用发货单页面的基础选项与地址主数据 */
const GEN_WAREHOUSES=['深圳仓','东莞工厂','义乌仓'];
const GEN_SHIP_MODES=['仓库发货','工厂直发','供应商直发'];
const GEN_PROVIDERS=['马士基','DHL','顺丰国际','美森轮船','中远海运'];
const GEN_TRANSPORTS=['海运卡派','美森快船','空派','快递直发'];
const GEN_CHANNELS=['标准海运','美森正班船','空派专线','国际快递'];
const GEN_COUNTRIES=['美国 - US','加拿大 - CA','英国 - UK','德国 - DE','日本 - JP','中国 - CN'];
const COUNTRY_CODE_TO_LABEL={
  US:'美国 - US',
  CA:'加拿大 - CA',
  UK:'英国 - UK',
  DE:'德国 - DE',
  JP:'日本 - JP'
};

/* 目的仓取货件里的「店铺」字段对应匹配的目的仓（非物流中心编码） */
const STORE_TO_DEST_WAREHOUSE={
  'ARCCAPTAIN主账号-US':'美国西部仓（ARCCAPTAIN-US）',
  'ARCCAPTAIN主账号-CA':'加拿大东部仓（ARCCAPTAIN-CA）',
  'Amazon US 旗舰店':'美国东部仓（Amazon-US旗舰）',
  'ARCCAP':'美国西部仓（ARCCAP）'
};
const GEN_DEST_WAREHOUSES=Object.values(STORE_TO_DEST_WAREHOUSE);

const FROM_WAREHOUSE_ADDRESS={
  '深圳仓':{contact:'陈志强',phone:'13823568890',country:'中国 - CN',province:'广东省',city:'深圳市',district:'宝安区',detail:'福永街道现代国际物流园 B 栋 102',zip:'518103'},
  '东莞工厂':{contact:'刘建华',phone:'13922907712',country:'中国 - CN',province:'广东省',city:'东莞市',district:'塘厦镇',detail:'科苑城高新产业园焊捷智造中心 3 号仓',zip:'523710'},
  '义乌仓':{contact:'周敏',phone:'13757913305',country:'中国 - CN',province:'浙江省',city:'金华市',district:'义乌市',detail:'北苑街道跨境电商集货工业园 A 区 8 号',zip:'322000'}
};
const TO_WAREHOUSE_ADDRESS={
  '美国西部仓（ARCCAPTAIN-US）':{contact:'Amazon FBA Inbound (ARCCAPTAIN-US)',phone:'+1-909-555-0148',country:'美国 - US',province:'CA',city:'Ontario',district:'San Bernardino',detail:'1910 E Central Ave, Ontario, CA',zip:'91761'},
  '加拿大东部仓（ARCCAPTAIN-CA）':{contact:'Amazon FBA Inbound (ARCCAPTAIN-CA)',phone:'+1-905-555-0192',country:'加拿大 - CA',province:'ON',city:'Bolton',district:'Peel Region',detail:'12724 Coleraine Dr, Bolton, ON',zip:'L7E 4L8'},
  '美国东部仓（Amazon-US旗舰）':{contact:'Amazon FBA Inbound (US Flagship)',phone:'+1-972-555-0166',country:'美国 - US',province:'TX',city:'Dallas',district:'Dallas County',detail:'33333 LBJ Fwy, Dallas, TX',zip:'75241'},
  '美国西部仓（ARCCAP）':{contact:'Amazon FBA Inbound (ARCCAP)',phone:'+1-951-555-0133',country:'美国 - US',province:'CA',city:'Moreno Valley',district:'Riverside',detail:'24208 San Michele Rd, Moreno Valley, CA',zip:'92551'}
};
function emptyAddr(){return {contact:'',phone:'',country:'',province:'',city:'',district:'',detail:'',zip:''};}

let genOrderSeq=30;
const genOrderState={
  groupIds:[],
  activeGroupId:'',
  drafts:{}
};

function createDraftForGroup(group){
  const destWarehouse=STORE_TO_DEST_WAREHOUSE[group.seller]||`目的仓（${group.seller}）`;
  const countryLabel=COUNTRY_CODE_TO_LABEL[group.countryCode]||`${group.countryCode}`;
  const toAddr=TO_WAREHOUSE_ADDRESS[destWarehouse]||{
    contact:`Amazon Inbound (${group.seller})`,
    phone:'+1-800-555-0199',
    country:countryLabel,
    province:group.countryCode==='CA'?'ON':'CA',
    city:group.countryCode==='CA'?'Toronto':'Los Angeles',
    district:'Fulfillment District',
    detail:`${group.seller} Dedicated FBA Warehouse`,
    zip:group.countryCode==='CA'?'M1R 0E9':'90001'
  };
  return {
    groupId:group.id,
    shipmentNo:group.shipmentNo,
    shipmentName:group.shipmentName,
    seller:group.seller,
    center:group.center,
    countryCode:group.countryCode,
    from:'',
    to:destWarehouse,
    shipMode:'仓库发货',
    provider:'',
    transport:group.transportMode||'',
    channel:'',
    country:countryLabel,
    warehouseType:'海外仓',
    logisticsNo:'',
    remark:'',
    fromAddress:emptyAddr(),
    toAddress:{...toAddr},
    hasError:false,
    skus:group.children.map((child,idx)=>{
      const boxes=Math.max(1,Math.ceil(Number(child.declared||0)/4));
      return {
        childId:child.id,
        sku:child.sku,
        icon:child.icon||'📦',
        title:child.product,
        planNo:(child.linkedPlans&&child.linkedPlans[0])||'—',
        overseasSku:child.msku,
        easSku:`ES-${child.sku.slice(-6)}`,
        platform:`Amazon ${group.countryCode}`,
        team:group.countryCode==='CA'?'北美二组':'北美一组',
        store:group.seller,
        boxes,
        planQty:Number(child.declared||0),
        declareQty:Number(child.declared||0),
        weight:(4.5+(idx%3)*1.2).toFixed(1),
        length:'0.45',
        width:'0.32',
        height:'0.28',
        volume:'0.0403',
        skuRemark:''
      };
    })
  };
}

function isDraftComplete(draft){
  if(!draft)return false;
  const reqFields=['from','to','shipMode','provider','transport','channel'];
  if(!reqFields.every(k=>Boolean(draft[k]&&String(draft[k]).trim())))return false;
  if(!draft.skus.length)return false;
  if(draft.skus.some(s=>!(Number(s.declareQty)>0)))return false;
  return true;
}

function populateGenSelectOptions(){
  const fill=(sel,opts,placeholder)=>{
    const el=$(sel);
    if(!el)return;
    el.innerHTML=`<option value="">${placeholder}</option>`+opts.map(x=>`<option value="${x}">${x}</option>`).join('');
  };
  fill('#genFromWarehouse',GEN_WAREHOUSES,'请选择发货仓');
  fill('#genToWarehouse',GEN_DEST_WAREHOUSES,'请选择目的仓');
  fill('#genShipMode',GEN_SHIP_MODES,'请选择发货方式');
  fill('#genProvider',GEN_PROVIDERS,'请选择头程服务商');
  fill('#genTransport',GEN_TRANSPORTS,'请选择运输方式');
  fill('#genChannel',GEN_CHANNELS,'请选择物流渠道');
  fill('#genCountry',GEN_COUNTRIES,'请选择国家');
}

function openGenOrderDialog(){
  const selectedGroups=getSelectedGenOrderGroups();
  if(!selectedGroups.length){
    toast('请先勾选未生成发货单的 FBA 货件','error');
    return;
  }
  populateGenSelectOptions();
  genOrderState.groupIds=selectedGroups.map(g=>g.id);
  genOrderState.activeGroupId=selectedGroups[0].id;
  genOrderState.drafts={};
  selectedGroups.forEach(group=>{
    genOrderState.drafts[group.id]=createDraftForGroup(group);
  });
  $('#fbaGenOrderSubtitle').textContent=`已勾选 ${selectedGroups.length} 个 FBA 货件，每个货件对应生成 1 张中台发货单，请左侧切换并完善各货件发货单资料与明细`;
  renderGenOrderModal();
  $('#fbaGenOrderMask').classList.remove('hidden');
  $('#fbaGenOrderDialog').classList.remove('hidden');
}

function closeGenOrderDialog(){
  $('#fbaGenOrderDialog').classList.add('hidden');
  $('#fbaGenOrderMask').classList.add('hidden');
}

function renderGenOrderNav(){
  const total=genOrderState.groupIds.length;
  const completedCount=genOrderState.groupIds.filter(id=>isDraftComplete(genOrderState.drafts[id])).length;
  $('#fbaGenNavProgress').textContent=`${completedCount} / ${total} 已完善`;
  $('#fbaGenNavList').innerHTML=genOrderState.groupIds.map((id,idx)=>{
    const draft=genOrderState.drafts[id];
    const active=id===genOrderState.activeGroupId?'active':'';
    const ready=isDraftComplete(draft);
    const errCls=!ready&&draft.hasError?'has-error':'';
    const badgeCls=ready?'is-ready':(draft.hasError?'is-error':'is-pending');
    const badgeText=ready?'已完善':(draft.hasError?'待补全':'待完善');
    const qtySum=draft.skus.reduce((s,x)=>s+Number(x.declareQty||0),0);
    return `<button class="fba-gen-nav-item ${active} ${errCls}" data-gen-nav="${id}" type="button">
      <div class="fba-gen-nav-top">
        <span class="fba-gen-nav-no">${idx+1}. ${draft.shipmentNo}</span>
        <span class="fba-gen-nav-badge ${badgeCls}">${badgeText}</span>
      </div>
      <div class="fba-gen-nav-meta" title="${draft.seller}">
        <span>${draft.seller}</span>
      </div>
      <div class="fba-gen-nav-sub" title="目的仓：${draft.to}">
        目的仓：${draft.to} · ${draft.skus.length} 款 / 发货量 ${qtySum}
      </div>
    </button>`;
  }).join('');

  $$('[data-gen-nav]').forEach(btn=>btn.onclick=()=>{
    const nextId=btn.dataset.genNav;
    if(nextId===genOrderState.activeGroupId)return;
    genOrderState.activeGroupId=nextId;
    renderGenOrderModal();
  });
}

function renderGenAddressFields(prefix,addr){
  const a=addr||emptyAddr();
  $(`#${prefix}Contact`).value=a.contact||'';
  $(`#${prefix}Phone`).value=a.phone||'';
  $(`#${prefix}Country`).value=a.country||'';
  $(`#${prefix}Province`).value=a.province||'';
  $(`#${prefix}City`).value=a.city||'';
  $(`#${prefix}District`).value=a.district||'';
  $(`#${prefix}Detail`).value=a.detail||'';
  $(`#${prefix}Zip`).value=a.zip||'';
}

function renderGenOrderFooter(){
  const total=genOrderState.groupIds.length;
  const completedCount=genOrderState.groupIds.filter(id=>isDraftComplete(genOrderState.drafts[id])).length;
  const activeDraft=genOrderState.drafts[genOrderState.activeGroupId];
  const curSkuCount=activeDraft?activeDraft.skus.length:0;
  const curQtyTotal=activeDraft?activeDraft.skus.reduce((s,x)=>s+Number(x.declareQty||0),0):0;
  $('#fbaGenFooterStats').innerHTML=`
    <span class="minimal-pill">本次生成 <em>${total}</em> 张发货单</span>
    <span class="minimal-pill">已完善 <em>${completedCount}/${total}</em></span>
    <span class="minimal-pill">当前货件已选 <em>${curSkuCount}</em> 个 SKU</span>
    <span class="minimal-pill">当前货件发货量 <em>${curQtyTotal.toLocaleString()}</em></span>
  `;
}

function renderGenOrderModal(){
  renderGenOrderNav();
  const draft=genOrderState.drafts[genOrderState.activeGroupId];
  if(!draft)return;

  $('#fbaGenCurrentBadge').textContent=`当前货件：${draft.shipmentNo}（店铺：${draft.seller}）`;

  /* 确保目的仓下拉包含当前店铺映射出的目的仓 */
  const toSelect=$('#genToWarehouse');
  if(toSelect&&![...toSelect.options].some(o=>o.value===draft.to)){
    const opt=document.createElement('option');
    opt.value=draft.to;opt.textContent=draft.to;
    toSelect.appendChild(opt);
  }

  $('#genFromWarehouse').value=draft.from||'';
  $('#genToWarehouse').value=draft.to||'';
  $('#genShipMode').value=draft.shipMode||'';
  $('#genProvider').value=draft.provider||'';
  $('#genTransport').value=draft.transport||'';
  $('#genChannel').value=draft.channel||'';
  $('#genCountry').value=draft.country||'';
  $('#genWarehouseType').value=draft.warehouseType||'';
  $('#genLogisticsNo').value=draft.logisticsNo||'';
  $('#genRemark').value=draft.remark||'';

  renderGenAddressFields('genFrom',draft.fromAddress);
  renderGenAddressFields('genTo',draft.toAddress);

  /* 渲染当前货件的发货明细表格（允许修改发货量与备注） */
  $('#genSkuTableBody').innerHTML=draft.skus.map((item,idx)=>{
    const planDiff=Number(item.planQty||0)-Number(item.declareQty||0);
    return `<tr data-gen-sku-idx="${idx}">
      <td>${item.sku}</td>
      <td title="${item.title}">
        <div class="fba-detail-product"><span class="fba-thumb">${item.icon}</span><span>${item.title}</span></div>
      </td>
      <td>${item.planNo}</td>
      <td title="${item.overseasSku}">${item.overseasSku}</td>
      <td>${item.easSku}</td>
      <td>${item.platform}</td>
      <td>${item.team}</td>
      <td title="${item.store}">${item.store}</td>
      <td>${item.boxes}</td>
      <td>
        <input class="control gen-qty-input" data-gen-qty="${idx}" type="number" min="1" step="1" value="${item.declareQty}" aria-label="发货量">
      </td>
      <td>
        <div class="measure-cell">
          <div>${item.weight} KG</div>
          <div>${item.length} × ${item.width} × ${item.height}</div>
          <div>${item.volume} m³</div>
        </div>
      </td>
      <td data-gen-diff="${idx}">${planDiff}</td>
      <td>
        <input class="control gen-remark-input" data-gen-sku-remark="${idx}" type="text" value="${item.skuRemark||''}" placeholder="请输入备注">
      </td>
    </tr>`;
  }).join('');

  $$('[data-gen-qty]').forEach(input=>input.oninput=()=>{
    const idx=Number(input.dataset.genQty);
    const val=Math.max(0,parseInt(input.value,10)||0);
    draft.skus[idx].declareQty=val;
    if(isDraftComplete(draft))draft.hasError=false;
    const diffCell=$(`[data-gen-diff="${idx}"]`);
    if(diffCell)diffCell.textContent=String(Number(draft.skus[idx].planQty||0)-val);
    renderGenOrderNav();
    renderGenOrderFooter();
  });
  $$('[data-gen-sku-remark]').forEach(input=>input.oninput=()=>{
    const idx=Number(input.dataset.genSkuRemark);
    draft.skus[idx].skuRemark=input.value;
  });

  renderGenOrderFooter();
}

function submitGenOrders(asDraft){
  /* 逐一校验所有勾选货件的必填项 */
  let firstInvalidId='';
  let firstInvalidReason='';
  genOrderState.groupIds.forEach(id=>{
    const d=genOrderState.drafts[id];
    const missing=[];
    if(!d.from)missing.push('发货仓');
    if(!d.to)missing.push('目的仓');
    if(!d.shipMode)missing.push('发货方式');
    if(!d.provider)missing.push('头程服务商');
    if(!d.transport)missing.push('运输方式');
    if(!d.channel)missing.push('物流渠道');
    if(d.skus.some(s=>!(Number(s.declareQty)>0)))missing.push('SKU 发货量');
    if(missing.length){
      d.hasError=true;
      if(!firstInvalidId){
        firstInvalidId=id;
        firstInvalidReason=`货件 ${d.shipmentNo} 尚有必填项未完善：${missing.join('、')}`;
      }
    }else{
      d.hasError=false;
    }
  });

  if(firstInvalidId){
    genOrderState.activeGroupId=firstInvalidId;
    renderGenOrderModal();
    toast(firstInvalidReason,'error');
    return;
  }

  /* 全部校验通过：一个货件生成一张发货单，回写发货单号与运输方式 */
  const generatedNos=[];
  const bridge=readV2Bridge();
  const nextOrderStatus=asDraft?'草稿':'待发货';
  const nowStr=new Date().toISOString().replace('T',' ').slice(0,19);
  genOrderState.groupIds.forEach(id=>{
    const d=genOrderState.drafts[id];
    const grp=fbaGroups.find(g=>g.id===id);
    if(!grp)return;
    genOrderSeq++;
    const orderNo=`DN20261114${String(genOrderSeq).padStart(3,'0')}`;
    grp.shipmentOrderNo=orderNo;
    grp.transportMode=d.transport;
    if(!asDraft){
      d.skus.forEach(skuItem=>{
        const ch=grp.children.find(c=>c.id===skuItem.childId);
        if(ch)ch.sent=Number(skuItem.declareQty||0);
      });
    }
    const items=d.skus.map(s=>({
      sku:s.sku,
      name:s.product||s.sku,
      plan:s.planNo||'',
      remark:s.skuRemark||'',
      declare:Number(s.declareQty||0),
      planQty:Number(s.planQty||s.declareQty||0),
      pick:0,
      ship:0,
      shipped:0,
      receive:0,
      status:nextOrderStatus
    }));
    bridge.autoShippingOrders=bridge.autoShippingOrders.filter(o=>o.fbaShipmentNo!==grp.shipmentNo);
    bridge.autoShippingOrders.unshift({
      id:orderNo,
      creator:'Admin',
      created:nowStr.slice(0,10),
      status:nextOrderStatus,
      logistics:'未提交',
      from:d.from||'跨跃猫物流仓',
      to:d.to||mapDestWarehouseForAutoOrder(grp),
      shipMode:d.shipMode||'FBA直发',
      channel:d.channel||'—',
      transport:d.transport||'海卡（6000）',
      provider:d.provider||'—',
      country:d.country||'美国 - US',
      warehouseType:d.warehouseType||'平台仓',
      shipmentNo:grp.shipmentNo,
      fbaShipmentNo:grp.shipmentNo,
      referenceId:grp.reference||grp.shipmentName||'—',
      remark:d.remark||`由 FBA 货件 ${grp.shipmentNo} 生成`,
      plans:new Set(items.map(i=>i.plan).filter(Boolean)).size,
      skus:items.length,
      planQty:items.reduce((s,i)=>s+Number(i.planQty||0),0),
      declare:items.reduce((s,i)=>s+Number(i.declare||0),0),
      pick:0,
      ship:0,
      receive:0,
      pendingReceive:0,
      items
    });
    bridge.fbaShipmentOrderLinks[grp.shipmentNo]=orderNo;
    bridge.shippingOrderDestMap=bridge.shippingOrderDestMap||{};
    bridge.shippingOrderDestMap[orderNo]=d.to||'美西FBA仓';
    applyOrderGeneratedToPlans(bridge,[...new Set(items.map(it=>it.plan).filter(Boolean))],orderNo);
    generatedNos.push(orderNo);
    grp.children.forEach(c=>fbaState.selectedChildIds.delete(c.id));
  });
  writeV2Bridge(bridge);
  snapshotFbaShipmentsToBridge();

  closeGenOrderDialog();
  renderFbaTable();
  toast(asDraft
    ?`已为 ${generatedNos.length} 个货件保存发货单草稿（${generatedNos.join('、')}）`
    :`已成功生成 ${generatedNos.length} 张发货单（${generatedNos.join('、')}），已进入「待发货」`
  );
}

function initGenOrderDialog(){
  $('#createShipmentOrderBtn').onclick=openGenOrderDialog;
  $('#fbaGenOrderClose').onclick=closeGenOrderDialog;
  $('#fbaGenCancelBtn').onclick=closeGenOrderDialog;
  $('#fbaGenOrderMask').onclick=e=>{if(e.target.id==='fbaGenOrderMask')closeGenOrderDialog();};

  const bindField=(sel,key,onAfterChange)=>{
    const el=$(sel);
    if(!el)return;
    const handler=()=>{
      const draft=genOrderState.drafts[genOrderState.activeGroupId];
      if(!draft)return;
      draft[key]=el.value;
      if(onAfterChange)onAfterChange(draft,el.value);
      if(isDraftComplete(draft))draft.hasError=false;
      renderGenOrderNav();
      renderGenOrderFooter();
    };
    el.addEventListener('change',handler);
    el.addEventListener('input',handler);
  };

  bindField('#genFromWarehouse','from',(draft,val)=>{
    draft.fromAddress=FROM_WAREHOUSE_ADDRESS[val]?{...FROM_WAREHOUSE_ADDRESS[val]}:emptyAddr();
    renderGenAddressFields('genFrom',draft.fromAddress);
  });
  bindField('#genShipMode','shipMode');
  bindField('#genProvider','provider');
  bindField('#genTransport','transport');
  bindField('#genChannel','channel');
  bindField('#genCountry','country');
  bindField('#genWarehouseType','warehouseType');
  bindField('#genLogisticsNo','logisticsNo');
  bindField('#genRemark','remark');

  $('#fbaGenDraftBtn').onclick=()=>submitGenOrders(true);
  $('#fbaGenSubmitBtn').onclick=()=>submitGenOrders(false);
}

/* ===================== 查询区：两行自动折叠 ===================== */
function setFbaQueryExpandUi(){
  const button=$('#queryExpand');
  button.querySelector('.query-expand-text').textContent=fbaQueryExpanded?'收起':'展开';
  button.setAttribute('aria-expanded',String(fbaQueryExpanded));
  $('#queryCard').classList.toggle('query-collapsed',!fbaQueryExpanded);
}
function layoutFbaQuery(){
  const panel=$('#queryCard'),grid=$('#queryGrid'),button=$('#queryExpand');
  if(!panel||!grid||!button)return;
  panel.classList.remove('query-collapsed');
  grid.querySelectorAll('.query-overflow-item').forEach(item=>item.classList.remove('query-overflow-item'));
  const items=[...grid.querySelectorAll('.query-item:not(.query-action-item)')],actionItem=grid.querySelector('.query-action-item');
  if(!items.length||!actionItem)return;
  button.hidden=false;
  const gridWidth=grid.getBoundingClientRect().width,gap=parseFloat(getComputedStyle(grid).columnGap)||0,btnWidth=actionItem.getBoundingClientRect().width;
  const widthMap=new Map(items.map(item=>[item,item.getBoundingClientRect().width]));
  const rowsList=[];let row=[],rowWidth=0;
  items.forEach(item=>{
    const width=widthMap.get(item);
    if(row.length&&rowWidth+gap+width>gridWidth+1){rowsList.push(row);row=[];rowWidth=0;}
    rowWidth+=(row.length?gap:0)+width;
    row.push(item);
  });
  if(row.length)rowsList.push(row);
  const actionOwnRow=btnWidth>=gridWidth*0.95,overflowSet=new Set();
  if(rowsList.length>2)rowsList.slice(2).forEach(group=>group.forEach(item=>overflowSet.add(item)));
  if(rowsList.length>=2&&!actionOwnRow){
    let used=0;
    rowsList[1].forEach(item=>{
      const width=widthMap.get(item),next=used+(used?gap:0)+width;
      if(next+gap+btnWidth<=gridWidth+1)used=next;
      else overflowSet.add(item);
    });
  }
  overflowSet.forEach(item=>item.classList.add('query-overflow-item'));
  if(!overflowSet.size)fbaQueryExpanded=false;
  button.hidden=!overflowSet.size;
  setFbaQueryExpandUi();
}

/* ===================== 初始化 ===================== */
function initFbaView(){
  syncV2BridgeIntoFba();
  initFbaMultis();
  syncFbaPlaceholders();
  layoutFbaQuery();
  renderFbaTable();
  window.addEventListener('storage',e=>{
    if(e.key===FBA_PLAN_V2_BRIDGE_KEY){
      syncV2BridgeIntoFba();
      renderFbaTable();
    }
  });

  $('#queryExpand').onclick=()=>{fbaQueryExpanded=!fbaQueryExpanded;setFbaQueryExpandUi();};
  $('#fbaNoType').onchange=syncFbaPlaceholders;
  $('#fbaCodeType').onchange=syncFbaPlaceholders;
  $('#fbaSearchBtn').onclick=()=>{
    readFbaQuery();
    if(fbaState.startDate&&fbaState.endDate&&fbaState.startDate>fbaState.endDate){
      toast('开始日期不能晚于结束日期','error');
      return;
    }
    fbaState.page=1;
    renderFbaTable();
    toast('查询完成');
  };
  $('#fbaResetBtn').onclick=()=>{resetFbaQuery();renderFbaTable();toast('已重置查询条件');};
  ['#fbaNoInput','#fbaCodeInput','#fbaProductName'].forEach(selector=>$(selector).addEventListener('keydown',event=>{if(event.key==='Enter')$('#fbaSearchBtn').click();}));
  $('#fbaPageSize').onchange=event=>{fbaState.pageSize=Number(event.target.value)||10;fbaState.page=1;renderFbaTable();};
  $('#fbaPrevPage').onclick=()=>{if(fbaState.page>1){fbaState.page--;renderFbaTable();}};
  $('#fbaNextPage').onclick=()=>{const pages=Math.max(1,Math.ceil(getFbaVisibleGroups().length/fbaState.pageSize));if(fbaState.page<pages){fbaState.page++;renderFbaTable();}};

  $('#batchUnlinkPlanBtn').onclick=()=>openFbaUnlinkConfirm(getSelectedLinkedChildIds());
  $('#syncFbaPrelinksBtn').onclick=syncPrelinkedShipmentsFromLingxing;
  $('#fbaExportBtn').onclick=()=>{
    const groups=getFbaVisibleGroups();
    if(!groups.length){toast('当前筛选条件下暂无可导出的数据','error');return;}
    if(window.GlobalExportWorkbench){
      window.GlobalExportWorkbench.createTask({taskType:'FBA货件导出',templateName:'FBA货件导出'});
    }else{
      toast(`已生成 ${groups.length} 个 FBA 货件的导出任务`);
    }
  };
  $('#fbaUnlinkConfirmClose').onclick=closeFbaUnlinkConfirm;
  $('#fbaUnlinkCancel').onclick=closeFbaUnlinkConfirm;
  $('#fbaUnlinkConfirm').onclick=confirmFbaUnlink;
  $('#fbaUnlinkConfirmMask').onclick=event=>{if(event.target.id==='fbaUnlinkConfirmMask')closeFbaUnlinkConfirm();};
  window.addEventListener('resize',()=>{layoutFbaQuery();});
}

function openColumnConfig(){
  fbaColConfig.draft.parent=[...fbaColConfig.applied.parent];
  fbaColConfig.draft.child=[...fbaColConfig.applied.child];
  fbaColConfig.tab='parent';
  fbaColConfig.search='';
  $('#fbaColumnSearch').value='';
  renderColumnConfigDrawer();
  $('#fbaColumnDrawerMask').classList.remove('hidden');
  $('#fbaColumnDrawer').classList.remove('hidden');
}
function closeColumnConfig(){
  $('#fbaColumnDrawerMask').classList.add('hidden');
  $('#fbaColumnDrawer').classList.add('hidden');
}
function renderColumnConfigDrawer(){
  const tab=fbaColConfig.tab;
  const defs=FBA_COL_DEFS[tab]||[];
  const selectedKeys=fbaColConfig.draft[tab]||[];
  const query=fbaColConfig.search.trim().toLowerCase();
  const filtered=defs.filter(c=>c.label.toLowerCase().includes(query));

  $$('[data-col-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.colTab===tab));

  const checksEl=$('#fbaColumnChecks');
  checksEl.innerHTML=filtered.map(col=>{
    const checked=selectedKeys.includes(col.key);
    return `<label><input type="checkbox" data-col-check="${col.key}" ${checked?'checked':''}><span title="${col.label}">${col.label}</span></label>`;
  }).join('');
  $('#fbaColumnNone').classList.toggle('hidden',filtered.length>0);

  $$('[data-col-check]').forEach(cb=>cb.onchange=()=>{
    const key=cb.dataset.colCheck;
    const list=fbaColConfig.draft[tab];
    if(cb.checked){
      if(!list.includes(key))list.push(key);
    }else{
      if(list.length<=1){
        cb.checked=true;
        toast('至少保留 1 个展示列','error');
        return;
      }
      fbaColConfig.draft[tab]=list.filter(k=>k!==key);
    }
    renderColumnConfigDrawer();
  });

  const selectedCols=selectedKeys.map(k=>defs.find(c=>c.key===k)).filter(Boolean);
  $('#fbaColumnSelectedCount').textContent=`(${selectedCols.length})`;
  const selectedListEl=$('#fbaColumnSelectedList');
  selectedListEl.innerHTML=selectedCols.map((col,idx)=>`<div class="purchase-column-selected-item" data-col-drag="${col.key}" draggable="true"><span class="purchase-column-grip">⋮⋮</span><span class="purchase-column-order">${idx+1}</span><span>${col.label}</span></div>`).join('');

  $$('[data-col-drag]').forEach(item=>{
    item.ondragstart=e=>{
      fbaColConfig.draggedKey=item.dataset.colDrag;
      item.classList.add('dragging');
      if(e.dataTransfer){
        e.dataTransfer.effectAllowed='move';
        e.dataTransfer.setData('text/plain',fbaColConfig.draggedKey);
      }
    };
    item.ondragend=()=>item.classList.remove('dragging');
    item.ondragover=e=>e.preventDefault();
    item.ondrop=e=>{
      e.preventDefault();
      const source=fbaColConfig.draggedKey||(e.dataTransfer&&e.dataTransfer.getData('text/plain'));
      const targetKey=item.dataset.colDrag;
      fbaColConfig.draggedKey='';
      const list=fbaColConfig.draft[tab];
      if(!source||source===targetKey||!list.includes(source)||!list.includes(targetKey))return;
      const next=list.filter(k=>k!==source);
      next.splice(next.indexOf(targetKey),0,source);
      fbaColConfig.draft[tab]=next;
      renderColumnConfigDrawer();
    };
  });
}
function initColumnConfigDrawer(){
  $('#fbaColConfigBtn').onclick=openColumnConfig;
  $('#fbaColumnDrawerMask').onclick=closeColumnConfig;
  $('#fbaColumnCancelBtn').onclick=closeColumnConfig;
  $$('[data-col-tab]').forEach(btn=>btn.onclick=()=>{
    fbaColConfig.tab=btn.dataset.colTab==='child'?'child':'parent';
    fbaColConfig.search='';
    $('#fbaColumnSearch').value='';
    renderColumnConfigDrawer();
  });
  $('#fbaColumnSearch').addEventListener('input',e=>{
    fbaColConfig.search=e.target.value||'';
    renderColumnConfigDrawer();
  });
  $('#fbaColumnRestoreBtn').onclick=()=>{
    fbaColConfig.draft.parent=[...FBA_COL_DEFAULTS.parent];
    fbaColConfig.draft.child=[...FBA_COL_DEFAULTS.child];
    renderColumnConfigDrawer();
  };
  $('#fbaColumnApplyBtn').onclick=()=>{
    fbaColConfig.applied.parent=normalizeFbaColKeys('parent',fbaColConfig.draft.parent);
    fbaColConfig.applied.child=normalizeFbaColKeys('child',fbaColConfig.draft.child);
    try{
      localStorage.setItem(FBA_COL_CONFIG_KEY,JSON.stringify({
        version:1,
        parent:fbaColConfig.applied.parent,
        child:fbaColConfig.applied.child
      }));
    }catch{}
    closeColumnConfig();
    renderFbaTable();
    toast('列配置已应用');
  };
}

initFbaView();
initGenOrderDialog();
initColumnConfigDrawer();
