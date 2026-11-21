/* FBA货件 独立页面脚本 v2.2.0
 * 列表样式（状态栏 + 一级列表 .purchase-plan-table + 二级明细列表 .purchase-detail-table + 底部汇总）完全对齐采购计划页面（pages/purchase-plan-2）。
 * 字段调整：移除 ASIN 与 国家，国家改为「国家编码」（对应接口 ship_to_address>>country_code）。
 */
const remarks=['旺季补货计划','常规安全库存补货','新品首批入仓','促销备货计划',''];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const copyIconSvg='<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.6" height="6.6" rx="1.2"/><path d="M8 4V2.6A1.6 1.6 0 0 0 6.4 1H2.6A1.6 1.6 0 0 0 1 2.6v3.8A1.6 1.6 0 0 0 2.6 8H4"/></svg>';

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
    shipmentOrderStatus:'待发货',
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
    shipmentOrderStatus:'待收货',
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
    shipmentOrderStatus:'部分收货',
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
    shipmentOrderStatus:'已完成',
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
const extraOrderStatusByShipStatus={UNCONFIRMED:'草稿',WORKING:'待发货',READY_TO_SHIP:'待发货',IN_TRANSIT:'待收货',DELIVERED:'待收货',CHECKED_IN:'待收货',RECEIVING:'部分收货',CLOSED:'已完成',CANCELLED:'已取消'};
const fbaGroups=[
  ...rawShipmentGroups,
  ...Array.from({length:9},(_,idx)=>{
    const base=rawShipmentGroups[idx%7];
    const n=idx+12;
    const st=extraStatuses[idx%extraStatuses.length];
    const isClosed=st==='CLOSED'?1:0;
    const center=extraCenters[idx%extraCenters.length];
    const hasOrder=idx%2!==0;
    return {
      ...base,
      id:`fba-group-${n}`,
      shipmentNo:`FBA19WXD${String(100+n)}`,
      shipmentName:`${base.countryCode}-STA-Batch${n}-${center}`,
      staInboundPlanId:`wf${(10000000+n*1379).toString(16)}-a600-4436-bce2-8821c039a${100+n}`,
      transportMode:idx%2===0?'':extraTransports[idx%extraTransports.length],
      shipmentOrderNo:hasOrder?`DN2026110${idx+1}0${10+n}`:'',
      shipmentOrderStatus:hasOrder?(extraOrderStatusByShipStatus[st]||'待发货'):'',
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
      manualShippingOrders:Array.isArray(raw&&raw.manualShippingOrders)?raw.manualShippingOrders:[],
      warehouseStockAdds:raw&&typeof raw.warehouseStockAdds==='object'&&raw.warehouseStockAdds?raw.warehouseStockAdds:{},
      v2PickupDemands:Array.isArray(raw&&raw.v2PickupDemands)?raw.v2PickupDemands:[],
      prelinkedShipments:Array.isArray(raw&&raw.prelinkedShipments)?raw.prelinkedShipments:[]
    };
  }catch{
    return {links:{},shippingOrderLinks:{},unlinkedPlans:[],v2PendingPlans:[],v2CustomPlans:[],v2Overrides:{},v2StatusFromUpstream:{},fbaShipmentsMeta:{},fbaShipmentOrderLinks:{},autoShippingOrders:[],manualShippingOrders:[],warehouseStockAdds:{},v2PickupDemands:[],prelinkedShipments:[]};
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
  const allBridgeOrders=[...(bridge.autoShippingOrders||[]),...(bridge.manualShippingOrders||[])];
  fbaGroups.forEach(g=>{
    if(bridge.fbaShipmentOrderLinks&&bridge.fbaShipmentOrderLinks[g.shipmentNo]!==undefined){
      g.shipmentOrderNo=bridge.fbaShipmentOrderLinks[g.shipmentNo];
    }
    if(g.shipmentOrderNo){
      const matchedOrder=allBridgeOrders.find(o=>o&&(o.id===g.shipmentOrderNo||o.fbaShipmentNo===g.shipmentNo));
      if(matchedOrder&&matchedOrder.status){
        g.shipmentOrderStatus=matchedOrder.status;
      }
    }else{
      g.shipmentOrderStatus='';
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

const fbaLingxingStatusOptions=[
  '未确认','待发货-已创建','待发货-已装箱','运输中-已取件','运输中-已通知',
  '已到达-待登记','已到达-待入库','已到达-入库中','已完成','已删除','已取消','已放弃'
];
const fbaDiffOptions=['有申发差异','有收发差异','有申收差异'];

/* 默认展开前几条货件，保持采购计划一二级折叠体验 */
const fbaState={
  statuses:[],
  orderFilter:'',
  diffFilters:[],
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
let fbaStoreSelect=null,fbaCountrySelect=null,fbaStatusSelect=null,fbaDiffSelect=null,fbaQueryExpanded=false;

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
    const statusLabel=(fbaStatusMeta[group.status]&&fbaStatusMeta[group.status].label)||group.status;
    const orderStatus=resolveShipmentOrderStatus(group);
    const orderMatch=!fbaState.orderFilter||(
      fbaState.orderFilter==='none'
        ?!group.shipmentOrderNo
        :(fbaState.orderFilter==='generated'
          ?Boolean(group.shipmentOrderNo)
          :(Boolean(group.shipmentOrderNo)&&orderStatus===fbaState.orderFilter))
    );
    return (ignoreStatus||!fbaState.statuses.length||fbaState.statuses.includes(statusLabel))&&
      orderMatch&&
      (!fbaState.stores.length||fbaState.stores.includes(group.seller))&&
      (!fbaState.countries.length||fbaState.countries.includes(group.countryCode))&&
      (!fbaState.startDate||dateVal>=fbaState.startDate)&&
      (!fbaState.endDate||dateVal<=fbaState.endDate);
  }).map(group=>({
    ...group,
    children:group.children.filter(child=>{
      const associationMatch=!fbaState.association||(fbaState.association==='linked'?fbaLinked(child):!fbaLinked(child));
      const shipDiff=Number(child.declared||0)-Number(child.sent||0);
      const receiveDiff=Number(child.received||0)-Number(child.sent||0);
      const declareReceiveDiff=Number(child.declared||0)-Number(child.received||0);
      const diffMatch=!fbaState.diffFilters.length||fbaState.diffFilters.some(opt=>{
        if(opt==='有申发差异')return shipDiff!==0;
        if(opt==='有收发差异')return receiveDiff!==0;
        if(opt==='有申收差异')return declareReceiveDiff!==0;
        return false;
      });
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
  fbaStatusSelect=window.createUiMultiSelect({root:'#fbaStatusMulti',options:fbaLingxingStatusOptions,values:fbaState.statuses,placeholder:'领星货件状态',onChange:values=>{fbaState.statuses=values;}});
  fbaDiffSelect=window.createUiMultiSelect({root:'#fbaDiffMulti',options:fbaDiffOptions,values:fbaState.diffFilters,placeholder:'差异状态',onChange:values=>{fbaState.diffFilters=values;}});
}
function syncFbaPlaceholders(){
  $('#fbaNoInput').placeholder=fbaNoPlaceholders[$('#fbaNoType').value]||fbaNoPlaceholders.shipmentNo;
  $('#fbaCodeInput').placeholder=fbaCodePlaceholders[$('#fbaCodeType').value]||fbaCodePlaceholders.sku;
}
function readFbaQuery(){
  if(fbaStatusSelect)fbaState.statuses=fbaStatusSelect.getValues();
  if(fbaCountrySelect)fbaState.countries=fbaCountrySelect.getValues();
  if(fbaStoreSelect)fbaState.stores=fbaStoreSelect.getValues();
  if(fbaDiffSelect)fbaState.diffFilters=fbaDiffSelect.getValues();
  fbaState.orderFilter=$('#fbaOrderFilter').value;
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
  fbaState.statuses=[];
  fbaState.orderFilter='';
  fbaState.diffFilters=[];
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
  $('#fbaOrderFilter').value='';
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
  fbaStatusSelect?.setValues([]);
  fbaDiffSelect?.setValues([]);
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

/* ===================== 一级列表（展开列 + 7 列合并） + 二级明细列表 ===================== */
function resolveShipmentOrderStatus(group){
  if(!group||!group.shipmentOrderNo)return '';
  if(group.shipmentOrderStatus)return group.shipmentOrderStatus;
  if(group.status==='CLOSED')return '已完成';
  if(group.status==='RECEIVING')return '部分收货';
  if(['SHIPPED','IN_TRANSIT','DELIVERED','CHECKED_IN','CHECK_IN'].includes(group.status))return '待收货';
  if(['DELETED','CANCELLED','ABANDONED'].includes(group.status))return '已取消';
  if(group.status==='UNCONFIRMED')return '草稿';
  return '待发货';
}
function fbaOrderStatusBadge(status){
  if(!status)return '';
  let cls='is-draft';
  if(['已完成','已签收'].includes(status))cls='is-done';
  else if(status==='待发货')cls='is-ready';
  else if(['待收货','部分收货'].includes(status))cls='is-transit';
  else if(['已作废','已取消'].includes(status))cls='is-void';
  return `<span class="fba-order-status-badge ${cls}">${status}</span>`;
}

/* ===================== 列配置（参照采购计划一二级列表列配置，无固定列） ===================== */
const FBA_COL_CONFIG_KEY='fba-shipment-column-config-v1';
const FBA_COL_DEFS={
  parent:[
    {key:'shipmentNo',label:'货件单号 / 货件名称',tableClass:'no-col',width:175},
    {key:'status',label:'领星货件状态',tableClass:'fba-status-col',width:126},
    {key:'staRef',label:'STA任务 / Reference ID',tableClass:'sta-col',width:195},
    {key:'storeCenter',label:'店铺 / 国家编码 / 物流中心',tableClass:'store-col',width:170},
    {key:'orderNos',label:'中台发货单号 / 领星发货单号',tableClass:'order-col',width:245},
    {key:'declaredQty',label:'总申报量',tableClass:'qty-col',width:135},
    {key:'createdAt',label:'创建时间',tableClass:'time-col',width:170}
  ],
  child:[
    {key:'sku',label:'SKU',tableClass:'detail-sku',width:150},
    {key:'msku',label:'领星 SKU',tableClass:'detail-msku',width:175},
    {key:'fnsku',label:'FNSKU',tableClass:'detail-fnsku',width:135},
    {key:'product',label:'品名',tableClass:'detail-name',width:230},
    {key:'declared',label:'申报量',tableClass:'detail-qty',width:95},
    {key:'sent',label:'实际发货',tableClass:'detail-qty detail-sent',width:105,tooltip:'关联中台发货单实际出库发货的商品数量（未生成发货单或未发货时显示—）'},
    {key:'received',label:'签收量',tableClass:'detail-qty',width:95},
    {key:'shipDiff',label:'申发差异',tableClass:'detail-diff',width:110,tooltip:'申发差异=申报量-已发货量'},
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
  const {orderNo,orderStatus,lingxingOrderNo,totalDeclared,totalSkuCount,linkedSkuCount,progressCls}=ctx;
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
              ?`<button class="link fba-doc-jump" data-nav-order="${orderNo}" type="button" title="前往发货单查看 ${orderNo}">${orderNo}</button><button class="copy-icon-btn" data-copy-text="${orderNo}" data-copy-label="中台发货单号" type="button" title="复制中台发货单号">${copyIconSvg}</button>${fbaOrderStatusBadge(orderStatus)}`
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
    return `<th class="${col.tableClass}">${col.label}<span class="col-help-icon" data-help-tip="${col.tooltip}" tabindex="0" role="img" aria-label="${col.tooltip}">?</span></th>`;
  }
  return `<th class="${col.tableClass}">${col.label}</th>`;
}

const fbaHelpTooltipEl=(()=>{
  let el=document.getElementById('fbaHelpTooltip');
  if(!el){
    el=document.createElement('div');
    el.id='fbaHelpTooltip';
    el.className='fba-help-tooltip';
    el.setAttribute('role','tooltip');
    document.body.appendChild(el);
  }
  return el;
})();
function showHelpTooltip(target){
  const text=target?.getAttribute('data-help-tip');
  if(!text)return;
  fbaHelpTooltipEl.textContent=text;
  const rect=target.getBoundingClientRect();
  const placeBelow=rect.top<44;
  fbaHelpTooltipEl.classList.toggle('is-below',placeBelow);
  fbaHelpTooltipEl.classList.add('show');
  const halfW=(fbaHelpTooltipEl.offsetWidth||160)/2;
  const centerX=Math.min(window.innerWidth-halfW-8,Math.max(halfW+8,rect.left+rect.width/2));
  fbaHelpTooltipEl.style.left=`${centerX}px`;
  fbaHelpTooltipEl.style.top=`${placeBelow?rect.bottom:rect.top}px`;
}
function hideHelpTooltip(){
  fbaHelpTooltipEl.classList.remove('show');
}
function bindHelpTooltipEvents(){
  if(document.body.dataset.fbaHelpBound)return;
  document.body.dataset.fbaHelpBound='1';
  document.addEventListener('mouseover',e=>{
    const icon=e.target.closest?.('.col-help-icon[data-help-tip]');
    if(icon)showHelpTooltip(icon);
  });
  document.addEventListener('mouseout',e=>{
    const icon=e.target.closest?.('.col-help-icon[data-help-tip]');
    if(icon&&(!e.relatedTarget||!icon.contains(e.relatedTarget)))hideHelpTooltip();
  });
  document.addEventListener('focusin',e=>{
    const icon=e.target.closest?.('.col-help-icon[data-help-tip]');
    if(icon)showHelpTooltip(icon);
  });
  document.addEventListener('focusout',e=>{
    const icon=e.target.closest?.('.col-help-icon[data-help-tip]');
    if(icon)hideHelpTooltip();
  });
  window.addEventListener('scroll',hideHelpTooltip,true);
}
bindHelpTooltipEvents();

function isShipmentOrderShipped(group){
  if(!group||!group.shipmentOrderNo)return false;
  const orderStatus=resolveShipmentOrderStatus(group);
  return !['草稿','待发货','已作废','已取消'].includes(orderStatus);
}
function renderChildCellHtml(child,colKey,ctx){
  const {shipDiff,receiveDiff,declareReceiveDiff,linked,orderShipped}=ctx;
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
      return `<td class="detail-qty detail-sent">${orderShipped?Number(child.sent||0).toLocaleString():'—'}</td>`;
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
  const totalDeclared=group.children.reduce((sum,child)=>sum+Number(child.declared||0),0);
  const totalSkuCount=group.children.length;
  const linkedSkuCount=group.children.filter(child=>child.linkedPlans&&child.linkedPlans.length>0).length;
  const progressCls=linkedSkuCount===totalSkuCount?'is-all':(linkedSkuCount>0?'is-partial':'is-none');

  const ctx={
    orderNo:group.shipmentOrderNo||'',
    orderStatus:resolveShipmentOrderStatus(group),
    lingxingOrderNo:group.lingxingOrderNo||'',
    totalDeclared,
    totalSkuCount,
    linkedSkuCount,
    progressCls
  };

  const parentRow=`<tr class="parent-row ${expanded?'is-expanded':''}" data-id="${group.id}">
    <td><button class="document-expand ${expanded?'is-expanded':''}" data-fba-toggle="${group.id}" type="button" aria-expanded="${expanded}" aria-label="${expanded?'收起':'展开'}明细"></button></td>
    ${visibleParentCols.map(col=>renderParentCellHtml(group,col.key,ctx)).join('')}
  </tr>`;

  if(!expanded)return parentRow;

  const detailMinWidth=visibleChildCols.reduce((sum,c)=>sum+c.width,0);
  const orderShipped=isShipmentOrderShipped(group);
  const detailRow=`<tr class="detail-row" data-parent-id="${group.id}">
    <td colspan="${visibleParentCols.length+1}">
      <div class="detail-wrap">
        <table class="purchase-detail-table" style="min-width:${detailMinWidth}px">
          <thead>
            <tr>
              ${visibleChildCols.map(renderChildHeaderHtml).join('')}
            </tr>
          </thead>
          <tbody>
            ${group.children.map(child=>{
              const shipDiff=Number(child.declared||0)-Number(child.sent||0);
              const receiveDiff=Number(child.received||0)-Number(child.sent||0);
              const declareReceiveDiff=Number(child.declared||0)-Number(child.received||0);
              const linked=child.linkedPlans&&child.linkedPlans.length>0;
              const childCtx={shipDiff,receiveDiff,declareReceiveDiff,linked,orderShipped};
              return `<tr data-child-id="${child.id}">
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
    const minW=38+visibleParentCols.reduce((sum,c)=>sum+c.width,0);
    mainTable.style.minWidth=`${minW}px`;
  }
  const colGroup=$('#fbaColGroup');
  if(colGroup){
    colGroup.innerHTML=`<col class="expand-col">${visibleParentCols.map(c=>`<col class="${c.tableClass}">`).join('')}`;
  }
  const headRow=$('#fbaTableHeadRow');
  if(headRow){
    headRow.innerHTML=`
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
    $('#fbaTableBody').innerHTML=`<tr class="fba-empty-row"><td colspan="${visibleParentCols.length+1}">暂无符合条件的 FBA 货件</td></tr>`;
    return;
  }
  $('#fbaTableBody').innerHTML=data.map(g=>renderShipmentRows(g,visibleParentCols,visibleChildCols)).join('');

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

function buildFbaExportPayload(groups){
  const parentFieldsByCol={
    shipmentNo:[
      {label:'货件单号',get:g=>g.shipmentNo||''},
      {label:'货件名称',get:g=>g.shipmentName||''}
    ],
    status:[
      {label:'领星货件状态',get:g=>(fbaStatusMeta[g.status]&&fbaStatusMeta[g.status].label)||g.status||''},
      {label:'完结状态',get:g=>g.isClosed===1?'已完结':'进行中'}
    ],
    staRef:[
      {label:'STA任务号',get:g=>g.staInboundPlanId||''},
      {label:'Reference ID',get:g=>g.reference||''}
    ],
    storeCenter:[
      {label:'店铺',get:g=>g.seller||''},
      {label:'国家编码',get:g=>g.countryCode||''},
      {label:'物流中心',get:g=>g.center||''}
    ],
    orderNos:[
      {label:'中台发货单号',get:g=>g.shipmentOrderNo||''},
      {label:'发货单状态',get:g=>resolveShipmentOrderStatus(g)||''},
      {label:'领星发货单号',get:g=>g.lingxingOrderNo||''}
    ],
    declaredQty:[
      {label:'货件总申报量',get:(g,ctx)=>ctx.totalDeclared}
    ],
    createdAt:[
      {label:'创建时间',get:g=>g.created||''},
      {label:'创建人',get:g=>g.creator||''}
    ]
  };
  const childFieldsByCol={
    sku:[{label:'SKU',get:c=>c.sku||''}],
    msku:[{label:'领星 SKU',get:c=>c.msku||''}],
    fnsku:[{label:'FNSKU',get:c=>c.fnsku||''}],
    product:[{label:'品名',get:c=>c.product||''}],
    declared:[{label:'申报量',get:c=>Number(c.declared||0)}],
    sent:[{label:'实际发货',get:(c,g,ctx)=>ctx.orderShipped?Number(c.sent||0):'—'}],
    received:[{label:'签收量',get:c=>Number(c.received||0)}],
    shipDiff:[{label:'申发差异',get:c=>Number(c.declared||0)-Number(c.sent||0)}],
    receiveDiff:[{label:'收发差异',get:c=>Number(c.received||0)-Number(c.sent||0)}],
    declareReceiveDiff:[{label:'申收差异',get:c=>Number(c.declared||0)-Number(c.received||0)}],
    plan:[{label:'关联发货计划',get:c=>(c.linkedPlans&&c.linkedPlans.length)?c.linkedPlans.join('、'):'未关联'}]
  };
  const activeParentFields=getVisibleColumns('parent').flatMap(col=>parentFieldsByCol[col.key]||[]);
  const activeChildFields=getVisibleColumns('child').flatMap(col=>childFieldsByCol[col.key]||[]);
  const exportHeaders=[...activeParentFields.map(f=>f.label),...activeChildFields.map(f=>f.label)];
  const exportRows=[];
  groups.forEach(group=>{
    const totalDeclared=(group.children||[]).reduce((s,c)=>s+Number(c.declared||0),0);
    const orderShipped=isShipmentOrderShipped(group);
    const gCtx={totalDeclared,orderShipped};
    (group.children||[]).forEach(child=>{
      exportRows.push([
        ...activeParentFields.map(f=>f.get(group,gCtx)),
        ...activeChildFields.map(f=>f.get(child,group,gCtx))
      ]);
    });
  });
  return {exportHeaders,exportRows};
}

  $('#fbaExportBtn').onclick=()=>{
    const groups=getFbaVisibleGroups();
    if(!groups.length){toast('当前筛选条件下暂无可导出的数据','error');return;}
    const {exportHeaders,exportRows}=buildFbaExportPayload(groups);
    if(window.GlobalExportWorkbench){
      window.GlobalExportWorkbench.createTask({
        taskType:'FBA货件导出',
        templateName:'FBA货件导出',
        fileType:'xlsx',
        exportHeaders,
        exportRows
      });
    }else{
      toast(`已生成 ${groups.length} 个 FBA 货件（共 ${exportRows.length} 条明细，${exportHeaders.length} 列）的导出任务`);
    }
  };
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
initColumnConfigDrawer();
