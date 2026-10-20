(function(){
  const {createApp,ref,reactive,computed}=window.Vue;
  const {ElMessage}=window.ElementPlus;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const pad=value=>String(value).padStart(2,'0');
  const nowText=()=>{const date=new Date();return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`};
  const productThumbnail=sku=>{const visuals={FF123456:{bg:'#eaf2ff',accent:'#3b82f6',label:'焊接面罩',shape:'mask'},U00US160015:{bg:'#eef9f2',accent:'#22a06b',label:'焊机套装',shape:'machine'},U00US260010:{bg:'#fff5e8',accent:'#f59e0b',label:'等离子切割机',shape:'machine'},'130US160003':{bg:'#f4efff',accent:'#7c5ce6',label:'ARC 焊机',shape:'machine'},'140US260008':{bg:'#e9f7f8',accent:'#0f9da4',label:'CUT55',shape:'machine'},'34001001110':{bg:'#fff0f3',accent:'#e05270',label:'焊接帽',shape:'cap'},ZERO00001:{bg:'#f1f3f5',accent:'#98a2b3',label:'商品',shape:'box'}};const visual=visuals[sku]||visuals.ZERO00001;const shape={mask:`<path d="M21 19h38l-3 23H24z" fill="${visual.accent}"/><path d="M28 26h24v8H28z" fill="#fff" opacity=".9"/>`,machine:`<rect x="18" y="22" width="44" height="31" rx="6" fill="${visual.accent}"/><circle cx="31" cy="38" r="6" fill="#fff" opacity=".9"/><path d="M52 29h8v17h-8" stroke="#fff" stroke-width="3" fill="none"/>`,cap:`<path d="M18 43c2-16 12-25 25-25s23 9 25 25H18z" fill="${visual.accent}"/><path d="M26 43h34l8 7H18l8-7z" fill="#fff" opacity=".9"/>`,box:`<path d="m21 29 22-11 22 11v27L43 67 21 56V29z" fill="${visual.accent}"/><path d="m21 29 22 12 22-12M43 41v26" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/>`}[visual.shape];return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 86"><rect width="86" height="86" rx="10" fill="${visual.bg}"/>${shape}<text x="43" y="78" text-anchor="middle" fill="${visual.accent}" font-family="Arial, sans-serif" font-size="8" font-weight="700">${visual.label}</text></svg>`)}`};

  const sourceRows=[
    {warehouse:'耗材仓-东莞2号',warehouseType:'自营仓',sku:'FF123456',name:'自动变光焊接面罩基础款',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-20 10:30',teams:[
      {team:'TikTok',lingxingSku:'LX-FF123456-TK',overseasSku:'-',fnsku:'-',onHand:60,occupied:15,frozen:3,inTransit:0,batches:[{batchNo:'PC2609150001',source:'采购入库',receivedAt:'2026-09-15',qty:60,age:5}]}
    ]},
    {warehouse:'美通物流中转仓',warehouseType:'物流中转仓',sku:'FF123456',name:'自动变光焊接面罩基础款',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-20 10:30',teams:[
      {team:'TikTok',lingxingSku:'LX-FF123456-TK',overseasSku:'OW-FF123456',fnsku:'-',onHand:100,occupied:30,frozen:10,inTransit:50,batches:[{batchNo:'RK20260828016',source:'采购入库',receivedAt:'2026-08-28',qty:60,age:23},{batchNo:'RK20260908009',source:'采购入库',receivedAt:'2026-09-08',qty:40,age:12}]},
      {team:'eBay',lingxingSku:'LX-FF123456-EB',overseasSku:'OW-FF123456',fnsku:'-',onHand:50,occupied:10,frozen:0,inTransit:20,batches:[{batchNo:'RK20260821008',source:'采购入库',receivedAt:'2026-08-21',qty:30,age:30},{batchNo:'JGP20260905002',source:'加工入库',receivedAt:'2026-09-05',qty:20,age:15}]}
    ]},
    {warehouse:'美通物流中转仓',warehouseType:'物流中转仓',sku:'U00US160015',name:'ARC160焊机美规套装',unit:'件',developer:'郑豪阳',buyer:'杨琴',updatedAt:'2026-09-20 10:30',teams:[
      {team:'TikTok',lingxingSku:'LX-U00US160015-TK',overseasSku:'OW-U00US160015',fnsku:'-',onHand:150,occupied:35,frozen:5,inTransit:0,batches:[{batchNo:'RK20260718021',source:'采购入库',receivedAt:'2026-07-18',qty:80,age:64},{batchNo:'RK20260824011',source:'采购入库',receivedAt:'2026-08-24',qty:70,age:27}]}
    ]},
    {warehouse:'元速跨境物流中转仓',warehouseType:'物流中转仓',sku:'U00US260010',name:'CUT55 ProLux等离子切割机',unit:'件',developer:'颜文',buyer:'刘敏',updatedAt:'2026-09-20 09:45',teams:[
      {team:'TikTok',lingxingSku:'LX-U00US260010-TK',overseasSku:'OW-U00US260010',fnsku:'-',onHand:0,occupied:0,frozen:0,inTransit:100,batches:[]},
      {team:'eBay',lingxingSku:'LX-U00US260010-EB',overseasSku:'OW-U00US260010',fnsku:'-',onHand:30,occupied:30,frozen:0,inTransit:0,batches:[{batchNo:'RK20260901007',source:'调拨入库',receivedAt:'2026-09-01',qty:30,age:19}]}
    ]},
    {warehouse:'亚马逊LAS1仓',warehouseType:'平台仓',sku:'130US160003',name:'ARC160（AC-美规）',unit:'件',developer:'郑豪阳',buyer:'刘敏',updatedAt:'2026-09-20 08:56',teams:[
      {team:'亚马逊团队',lingxingSku:'LX-130US160003-AMZ',overseasSku:'-',fnsku:'X003AMZLAS1',onHand:220,occupied:40,frozen:null,inTransit:80,batches:[{batchNo:'FBA20260715003',source:'FBA入仓',receivedAt:'2026-07-15',qty:120,age:67},{batchNo:'FBA20260826011',source:'FBA入仓',receivedAt:'2026-08-26',qty:100,age:25}]}
    ]},
    {warehouse:'跨越美国洛杉矶仓',warehouseType:'海外仓',sku:'FF123456',name:'自动变光焊接面罩基础款',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-20 10:20',teams:[
      {team:'TikTok',lingxingSku:'LX-FF123456-TK',overseasSku:'OW-FF123456',fnsku:'-',onHand:120,occupied:0,frozen:0,inTransit:50,overseasInTransit:52,batches:[]},
      {team:'eBay',lingxingSku:'LX-FF123456-EB',overseasSku:'OW-FF123456',fnsku:'-',onHand:60,occupied:0,frozen:0,inTransit:20,overseasInTransit:52,batches:[]}
    ]},
    {warehouse:'深圳市华英科技有限公司',warehouseType:'供应商仓',sku:'140US260008',name:'CUT55 ProLux',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-20 10:12',teams:[
      {team:'eBay',lingxingSku:'LX-140US260008-EB',overseasSku:'-',fnsku:'-',onHand:33,occupied:3,frozen:0,inTransit:250,batches:[{batchNo:'RK20260812031',source:'采购入库',receivedAt:'2026-08-12',qty:12,age:39},{batchNo:'RK20260822018',source:'采购入库',receivedAt:'2026-08-22',qty:21,age:29}]},
      {team:'B端团队',lingxingSku:'LX-140US260008-B2B',overseasSku:'-',fnsku:'-',onHand:10,occupied:0,frozen:0,inTransit:0,batches:[{batchNo:'RK20260910004',source:'销售退件入库',receivedAt:'2026-09-10',qty:10,age:10}]}
    ]},
    {warehouse:'梧州供应商仓',warehouseType:'供应商仓',sku:'34001001110',name:'焊接帽子迷彩2-6 7/8',unit:'件',developer:'颜文',buyer:'陈丽',updatedAt:'2026-09-20 10:05',teams:[
      {team:'亚马逊团队',lingxingSku:'LX-34001001110-AMZ',overseasSku:'-',fnsku:'-',onHand:56,occupied:12,frozen:2,inTransit:0,batches:[{batchNo:'WZ-RK20260808012',source:'采购入库',receivedAt:'2026-08-08',qty:26,age:43},{batchNo:'WZ-RK20260819007',source:'采购入库',receivedAt:'2026-08-19',qty:30,age:32}]},
      {team:'B端团队',lingxingSku:'LX-34001001110-B2B',overseasSku:'-',fnsku:'-',onHand:0,occupied:0,frozen:0,inTransit:0,batches:[]}
    ]},
    {warehouse:'台州华熙灯饰有限公司',warehouseType:'供应商仓',sku:'U00US160015',name:'ARC160焊机美规套装',unit:'件',developer:'郑豪阳',buyer:'陈丽',updatedAt:'2026-09-20 09:58',teams:[
      {team:'TikTok',lingxingSku:'LX-U00US160015-TK',overseasSku:'-',fnsku:'-',onHand:50,occupied:0,frozen:0,inTransit:0,batches:[{batchNo:'TZ-RK20260903006',source:'采购入库',receivedAt:'2026-09-03',qty:50,age:17}]}
    ]},
    {warehouse:'宁波测试供应商仓',warehouseType:'供应商仓',sku:'ZERO00001',name:'零库存历史测试商品',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-19 18:20',teams:[
      {team:'eBay',lingxingSku:'LX-ZERO00001-EB',overseasSku:'-',fnsku:'-',onHand:0,occupied:0,frozen:0,inTransit:0,batches:[]}
    ]}
  ];

  const warehouseCodes={'耗材仓-东莞2号':'DG-HC02','美通物流中转仓':'MT-US-001','元速跨境物流中转仓':'YS-US-002','亚马逊LAS1仓':'LAS1','深圳市华英科技有限公司':'HY-SZ-001','梧州供应商仓':'WZ-GX-001','台州华熙灯饰有限公司':'TZ-ZJ-001','宁波测试供应商仓':'NB-TEST-001'};
  const isFbaRow=row=>Boolean(row&&(row.warehouseType==='平台仓'||row.warehouseAttribute==='平台仓')&&row.team==='亚马逊团队');
  const pendingPurchaseWarehouseAttributes=new Set(['自营仓','供应商仓','物流中转仓']);
  const batchWarehouseAttributes=new Set(['自营仓','物流中转仓']);
  // 仅供原型展示；正式数量应从采购计划/请购等待采购业务数据汇总。
  const pendingPurchaseSamples={'美通物流中转仓|FF123456|TikTok':45,'元速跨境物流中转仓|U00US260010|TikTok':80,'深圳市华英科技有限公司|140US260008|eBay':120};
  const flowSource=[
    {sku:'FF123456',warehouse:'美通物流中转仓',category:'在库',opType:'采购入库',before:0,after:100,opNo:'RK20260828016',bizNo:'CG20260820001',operator:'系统',operatedAt:'2026-08-28 10:30'},
    {sku:'FF123456',warehouse:'美通物流中转仓',category:'在库',opType:'销售出库',before:100,after:70,opNo:'XS20260901012',bizNo:'XS20260901012',operator:'刘敏',operatedAt:'2026-09-01 09:15'},
    {sku:'FF123456',warehouse:'美通物流中转仓',category:'冻结',opType:'库存冻结',before:0,after:10,opNo:'DJ20260902003',bizNo:'DJ20260902003',operator:'郑豪阳',operatedAt:'2026-09-02 14:20'},
    {sku:'FF123456',warehouse:'美通物流中转仓',category:'在库',opType:'调拨出库',before:70,after:50,opNo:'DB20260903002',bizNo:'DB20260903002',operator:'系统',operatedAt:'2026-09-03 11:05'},
    {sku:'FF123456',warehouse:'美通物流中转仓',category:'在途',opType:'调拨入库',before:0,after:50,opNo:'DB20260903002',bizNo:'DB20260903002',operator:'系统',operatedAt:'2026-09-03 11:05'},
    {sku:'U00US160015',warehouse:'美通物流中转仓',category:'在库',opType:'采购入库',before:0,after:80,opNo:'RK20260718021',bizNo:'CG20260715008',operator:'系统',operatedAt:'2026-07-18 10:00'},
    {sku:'U00US160015',warehouse:'美通物流中转仓',category:'在库',opType:'采购入库',before:80,after:150,opNo:'RK20260824011',bizNo:'CG20260820003',operator:'系统',operatedAt:'2026-08-24 10:00'},
    {sku:'U00US160015',warehouse:'美通物流中转仓',category:'冻结',opType:'库存冻结',before:0,after:5,opNo:'DJ20260825001',bizNo:'DJ20260825001',operator:'颜文',operatedAt:'2026-08-25 16:40'},
    {sku:'U00US260010',warehouse:'元速跨境物流中转仓',category:'在途',opType:'采购在途',before:0,after:100,opNo:'CG20260910004',bizNo:'CG20260910004',operator:'杨琴',operatedAt:'2026-09-10 09:30'},
    {sku:'U00US260010',warehouse:'元速跨境物流中转仓',category:'在库',opType:'采购入库',before:0,after:30,opNo:'RK20260901007',bizNo:'DB20260901007',operator:'系统',operatedAt:'2026-09-01 10:20'},
    {sku:'130US160003',warehouse:'亚马逊LAS1仓',category:'在库',opType:'FBA入仓',before:0,after:120,opNo:'FBA20260715003',bizNo:'FBA20260715003',operator:'系统',operatedAt:'2026-07-15 09:00'},
    {sku:'130US160003',warehouse:'亚马逊LAS1仓',category:'在库',opType:'FBA入仓',before:120,after:220,opNo:'FBA20260826011',bizNo:'FBA20260826011',operator:'系统',operatedAt:'2026-08-26 09:00'},
    {sku:'130US160003',warehouse:'亚马逊LAS1仓',category:'冻结',opType:'库存冻结',before:0,after:8,opNo:'DJ20260827002',bizNo:'DJ20260827002',operator:'郑豪阳',operatedAt:'2026-08-27 15:10'},
    {sku:'130US160003',warehouse:'亚马逊LAS1仓',category:'在途',opType:'FBA在途',before:0,after:80,opNo:'FBA20260905001',bizNo:'FBA20260905001',operator:'系统',operatedAt:'2026-09-05 08:50'},
    {sku:'140US260008',warehouse:'深圳市华英科技有限公司',category:'在库',opType:'采购入库',before:0,after:12,opNo:'RK20260812031',bizNo:'CG20260810005',operator:'系统',operatedAt:'2026-08-12 10:00'},
    {sku:'140US260008',warehouse:'深圳市华英科技有限公司',category:'在库',opType:'采购入库',before:12,after:33,opNo:'RK20260822018',bizNo:'CG20260820006',operator:'系统',operatedAt:'2026-08-22 10:00'},
    {sku:'140US260008',warehouse:'深圳市华英科技有限公司',category:'在途',opType:'采购在途',before:0,after:250,opNo:'CG20260915007',bizNo:'CG20260915007',operator:'杨琴',operatedAt:'2026-09-15 09:40'},
    {sku:'140US260008',warehouse:'深圳市华英科技有限公司',category:'待确认',opType:'待确认入库',before:0,after:30,opNo:'SH20260918002',bizNo:'SH20260918002',operator:'颜文',operatedAt:'2026-09-18 17:05'},
    {sku:'34001001110',warehouse:'梧州供应商仓',category:'在库',opType:'采购入库',before:0,after:26,opNo:'WZ-RK20260808012',bizNo:'CG20260806002',operator:'系统',operatedAt:'2026-08-08 10:00'},
    {sku:'34001001110',warehouse:'梧州供应商仓',category:'在库',opType:'采购入库',before:26,after:56,opNo:'WZ-RK20260819007',bizNo:'CG20260818004',operator:'系统',operatedAt:'2026-08-19 10:00'},
    {sku:'34001001110',warehouse:'梧州供应商仓',category:'冻结',opType:'库存冻结',before:0,after:2,opNo:'DJ20260821003',bizNo:'DJ20260821003',operator:'颜文',operatedAt:'2026-08-21 11:30'},
    {sku:'U00US160015',warehouse:'台州华熙灯饰有限公司',category:'在库',opType:'采购入库',before:0,after:50,opNo:'TZ-RK20260903006',bizNo:'CG20260901003',operator:'系统',operatedAt:'2026-09-03 10:00'}
  ];

  const allocateAvailableBatches=team=>{
    const batches=(team.batches||[]).map(batch=>({...batch}));
    const available=Math.max(0,team.onHand-team.occupied-team.frozen);
    const batchTotal=batches.reduce((sum,batch)=>sum+Number(batch.qty||0),0);
    if(!available||!batchTotal)return batches.map(batch=>({...batch,availableQty:0}));
    let assigned=0;
    return batches.map((batch,index)=>{const availableQty=index===batches.length-1?available-assigned:Math.round(available*Number(batch.qty||0)/batchTotal);assigned+=availableQty;return {...batch,availableQty:Math.max(0,availableQty)}});
  };
  const weightedAge=teams=>{const batches=teams.flatMap(team=>team.availableBatches||allocateAvailableBatches(team));const total=batches.reduce((sum,batch)=>sum+batch.availableQty,0);return total?Math.round(batches.reduce((sum,batch)=>sum+batch.availableQty*batch.age,0)/total):null};
  const normalizeTeam=team=>{const available=Math.max(0,team.onHand-team.occupied-team.frozen);const availableBatches=allocateAvailableBatches(team);return {...team,available,availableBatches,weightedAge:weightedAge([{...team,availableBatches}])}};
  const summarize=(row,teams)=>{const warehouseAttribute=window.WarehouseAttributes.of(row.warehouse);const batchEnabled=batchWarehouseAttributes.has(warehouseAttribute);const normalized=teams.map(team=>({...normalizeTeam(batchEnabled?team:{...team,batches:[]}),pendingPurchase:pendingPurchaseWarehouseAttributes.has(warehouseAttribute)?Number(pendingPurchaseSamples[`${row.warehouse}|${row.sku}|${team.team}`]||0):null}));const team=normalized[0]?.team||'';const sum=key=>normalized.reduce((total,item)=>total+Number(item[key]||0),0);const available=sum('available'),occupied=sum('occupied'),frozen=sum('frozen'),inTransit=sum('inTransit'),fba=(row.warehouseType==='平台仓'||warehouseAttribute==='平台仓')&&team==='亚马逊团队',inStockTotal=(['海外仓','平台仓'].includes(warehouseAttribute)&&!fba)?null:available+occupied+frozen,overseasInTransit=normalized[0]?.overseasInTransit??null;const pendingPurchase=pendingPurchaseWarehouseAttributes.has(warehouseAttribute)?normalized.reduce((total,item)=>total+Number(item.pendingPurchase||0),0):null;return {...row,team,warehouseAttribute,batchEnabled,warehouseCode:warehouseCodes[row.warehouse]||'-',rowKey:`${row.warehouse}|${row.sku}|${team}`,teams:normalized,lingxingSku:normalized[0]?.lingxingSku||'-',overseasSku:normalized[0]?.overseasSku||'-',fnsku:normalized[0]?.fnsku||'-',onHand:sum('onHand'),occupied,frozen,available,inTransit,pendingPurchase,total:inStockTotal==null?null:inStockTotal+inTransit,inStockTotal,overseasInTransit,weightedAge:batchEnabled?weightedAge(normalized):null};};

  createApp({
    setup(){
      const rows=ref(clone(sourceRows));
      const filters=reactive({codeType:'sku',codes:'',productName:'',warehouses:[],teams:[],developers:[],buyers:[]});
      const applied=reactive(clone(filters));
      const page=ref(1),pageSize=ref(20),updatedAt=ref('2026-09-20 10:30'),hideZero=ref(true);
      const sortState=reactive({prop:'',order:''});
      const detailVisible=ref(false),currentRow=ref(null),detailMode=ref('team'),detailTeam=ref(''),copiedRowKey=ref('');
      const selectedRows=ref([]);
      const inventoryTable=ref(null);
      const ownershipVisible=ref(false),ownershipRemark=ref(''),ownershipItems=ref([]);
      const canSelectRow=row=>Number(row.available||0)>0;
      const handleSelectionChange=rows=>{selectedRows.value=rows;};

      const warehouses=[...new Set(sourceRows.map(row=>row.warehouse))];
      const warehouseOptions=warehouses.map(value=>({value,label:`${value}（${warehouseCodes[value]||'-'}）`}));
      const teams=[...new Set(sourceRows.flatMap(row=>row.teams.map(team=>team.team)))];
      const developers=[...new Set(sourceRows.map(row=>row.developer))];
      const buyers=[...new Set(sourceRows.map(row=>row.buyer))];

      // —— 库存流水弹窗（查询项/字段与 inventory-flow 页面一致）——
      const flowRows=ref(clone(flowSource).map(row=>({...row,warehouseAttribute:window.WarehouseAttributes.of(row.warehouse),direction:row.after-row.before>0?'入库':row.after-row.before<0?'出库':'-',lingxingSku:'LX-'+row.sku,overseasSku:'OVS-'+row.sku,fnsku:'X00'+row.sku})));
      const flowFilters=reactive({skuType:'sku',sku:'',warehouses:[],opTypes:[],directions:[],no:'',dateRange:[]});
      const flowApplied=reactive(clone(flowFilters));
      const flowPage=ref(1),flowPageSize=ref(20);
      const flowWarehouses=[...new Set(flowSource.map(row=>row.warehouse))];
      const flowWarehouseOptions=flowWarehouses.map(value=>({value,label:`${value}（${warehouseCodes[value]||'-'}）`}));
      const flowOpTypes=[...new Set(flowSource.map(row=>row.opType))];
      const flowDirections=['出库','入库'];
      const splitValues=value=>String(value||'').split(/[,，、;；\s\n]+/).map(item=>item.trim()).filter(Boolean);
      const flowFilteredRows=computed(()=>{
        if(isFbaRow(currentRow.value))return [];
        return flowRows.value.filter(row=>{
        const skuField={sku:'sku',lingxingSku:'lingxingSku',overseasSku:'overseasSku',fnsku:'fnsku'}[flowApplied.skuType]||'sku';
        const skus=splitValues(flowApplied.sku);
        if(skus.length && !skus.some(k=>String(row[skuField]||'').toUpperCase().includes(k.toUpperCase())))return false;
        if(flowApplied.warehouses.length && !flowApplied.warehouses.includes(row.warehouse))return false;
        if(flowApplied.opTypes.length && !flowApplied.opTypes.includes(row.opType))return false;
        if(flowApplied.directions.length && !flowApplied.directions.includes(row.direction))return false;
        const nos=splitValues(flowApplied.no);
        if(nos.length && !nos.some(k=>String(row.opNo).toUpperCase().includes(k.toUpperCase())||String(row.bizNo).toUpperCase().includes(k.toUpperCase())))return false;
        const start=flowApplied.dateRange?.[0],end=flowApplied.dateRange?.[1];
        if(start||end){const day=row.operatedAt.slice(0,10);if(start&&day<start)return false;if(end&&day>end)return false;}
          return true;
        });
      });
      const flowPagedRows=computed(()=>flowFilteredRows.value.slice((flowPage.value-1)*flowPageSize.value,flowPage.value*flowPageSize.value));
      const flowQuery=()=>{Object.assign(flowApplied,clone(flowFilters));flowPage.value=1;ElMessage.success(`查询完成，共 ${flowFilteredRows.value.length} 条流水记录`)};
      const flowReset=()=>{Object.assign(flowFilters,{opTypes:[],directions:[],no:'',dateRange:[]});Object.assign(flowApplied,clone(flowFilters));flowPage.value=1};
      const signed=value=>{const n=Number(value||0);return n>0?'+'+n.toLocaleString('zh-CN'):n.toLocaleString('zh-CN')};

      const filteredRows=computed(()=>rows.value.flatMap(row=>row.teams
        .filter(team=>!applied.teams.length||applied.teams.includes(team.team))
        .map(team=>summarize(row,[team]))
      ).filter(row=>{
        const codeField={sku:'sku',lingxingSku:'lingxingSku',overseasSku:'overseasSku',fnsku:'fnsku'}[applied.codeType]||'sku';
        const codes=splitValues(applied.codes);
        if(codes.length&&!codes.some(code=>String(row[codeField]||'').toUpperCase().includes(code.toUpperCase())))return false;
        const productName=applied.productName.trim().toLowerCase();
        if(productName&&!row.name.toLowerCase().includes(productName))return false;
        if(applied.warehouses.length&&!applied.warehouses.includes(row.warehouse))return false;
        if(applied.developers.length&&!applied.developers.includes(row.developer))return false;
        if(applied.buyers.length&&!applied.buyers.includes(row.buyer))return false;
        const zeroValues=[row.available,row.occupied,row.inTransit,row.inStockTotal,row.pendingPurchase,row.frozen].filter(value=>value!==null&&value!==undefined);
        const zero=zeroValues.length>0&&zeroValues.every(value=>value===0);
        if(hideZero.value&&zero)return false;
        return true;
      }));
      const sortedRows=computed(()=>{
        if(!sortState.prop||!sortState.order)return filteredRows.value;
        const direction=sortState.order==='ascending'?1:-1;
        return filteredRows.value.map((row,index)=>({row,index})).sort((left,right)=>{
          const a=left.row[sortState.prop],b=right.row[sortState.prop];
          const aEmpty=a===null||a===undefined||a==='',bEmpty=b===null||b===undefined||b==='';
          if(aEmpty||bEmpty){if(aEmpty&&bEmpty)return left.index-right.index;return aEmpty?1:-1;}
          const result=Number(a)-Number(b);
          return result===0?left.index-right.index:result*direction;
        }).map(item=>item.row);
      });
      const pagedRows=computed(()=>sortedRows.value.slice((page.value-1)*pageSize.value,page.value*pageSize.value));
      const handleSortChange=({prop,order})=>{sortState.prop=order?prop:'';sortState.order=order||'';page.value=1;};
      const detailTeams=computed(()=>{if(!currentRow.value)return[];if(detailMode.value==='team'){const sourceRow=rows.value.find(row=>row.warehouse===currentRow.value.warehouse&&row.sku===currentRow.value.sku);const teams=[...(sourceRow?.teams||currentRow.value.teams)];if(detailTeam.value)teams.sort((left,right)=>Number(right.team===detailTeam.value)-Number(left.team===detailTeam.value));return currentRow.value.batchEnabled?teams:teams.map(team=>normalizeTeam({...team,batches:[]}));}const teams=detailTeam.value?currentRow.value.teams.filter(team=>team.team===detailTeam.value):currentRow.value.teams;return currentRow.value.batchEnabled?teams:teams.map(team=>normalizeTeam({...team,batches:[]}))});
      const detailSummary=computed(()=>currentRow.value?summarize(currentRow.value,detailTeams.value):{onHand:0,occupied:0,frozen:0,available:0,inTransit:0,pendingPurchase:null});
      const detailTitle=computed(()=>({team:'库存明细',available:'可用库存构成',age:'库龄分布',batch:'批次与库龄',occupied:'占用库存明细',frozen:'冻结库存明细',inTransit:'头程在途明细',pending:'待采购库存明细',flow:'库存流水'}[detailMode.value]||'库存明细'));
      const detailUnavailableMessage=computed(()=>{
        if(!currentRow.value)return'';
        const attribute=currentRow.value.warehouseAttribute;
        if(detailMode.value==='occupied'&&['海外仓','平台仓'].includes(attribute))return'海外仓、平台仓的仓库类型暂不提供占用库存明细，仅自营仓、物流中转仓、供应商仓可展示';
        if(detailMode.value==='inTransit'&&attribute==='平台仓')return'平台仓暂不提供头程在途明细，仅自营仓、物流中转仓、供应商仓、海外仓可展示';
        return'';
      });
      const ageBucketDefinitions=[{key:'within30',label:'30天以内',min:0,max:30},{key:'day31to60',label:'31–60天',min:31,max:60},{key:'day61to90',label:'61–90天',min:61,max:90},{key:'day91to120',label:'91–120天',min:91,max:120},{key:'day121to180',label:'121–180天',min:121,max:180},{key:'over180',label:'181天以上',min:181,max:Infinity}];
      const ageBuckets=computed(()=>{const batches=detailTeams.value.flatMap(team=>team.availableBatches||allocateAvailableBatches(team));const total=batches.reduce((sum,batch)=>sum+Number(batch.availableQty||0),0);return ageBucketDefinitions.map(bucket=>{const bucketQty=batches.filter(batch=>batch.age>=bucket.min&&batch.age<=bucket.max).reduce((sum,batch)=>sum+Number(batch.availableQty||0),0);return {...bucket,qty:bucketQty,ratio:total?Math.round(bucketQty/total*100):0}})});
      const detailRows=computed(()=>{
        if(!currentRow.value)return[];
        if(detailUnavailableMessage.value)return[];
        if(detailMode.value==='batch')return detailTeams.value.flatMap(team=>(team.batches||[]).map(batch=>({team:team.team,...batch})));
        if(detailMode.value==='flow')return detailTeams.value.flatMap(team=>{let balance=0;const rows=(team.batches||[]).map(batch=>{balance+=batch.qty;return {occurredAt:`${batch.receivedAt} 10:00`,type:batch.source,docNo:batch.batchNo,inQty:batch.qty,outQty:0,occupiedQty:0,balance,note:'入库生成库存批次'}});if(team.occupied>0)rows.push({occurredAt:'2026-09-20 10:30',type:'库存占用',docNo:`ZY202609${String(team.team.length+12).padStart(4,'0')}`,inQty:0,outQty:0,occupiedQty:-team.occupied,balance:team.onHand,note:'业务单据预留库存'});if(team.frozen>0)rows.push({occurredAt:'2026-09-20 10:30',type:'库存冻结',docNo:`DJ202609${String(team.team.length+3).padStart(4,'0')}`,inQty:0,outQty:0,occupiedQty:0,balance:team.onHand,note:'质量或盘点冻结'});return rows;});
        if(detailMode.value==='occupied')return detailTeams.value.filter(team=>team.occupied>0).flatMap(team=>{
          const shipment=Math.ceil(team.occupied*.7),processing=team.occupied-shipment;
          return [{team:team.team,type:'发货占用',docNo:`FH202609${String(team.team.length+12).padStart(4,'0')}`,qty:shipment,creator:'刘敏',note:'待实际发货结算占用'},...(processing?[{team:team.team,type:'加工占用',docNo:`JG202609${String(team.team.length+7).padStart(4,'0')}`,qty:processing,creator:'郑豪阳',note:'加工完成后按实际耗用结算'}]:[])];
        });
        if(detailMode.value==='frozen')return detailTeams.value.filter(team=>team.frozen>0).map(team=>({team:team.team,type:'质量冻结',docNo:`DJ202609${String(team.team.length+3).padStart(4,'0')}`,qty:team.frozen,note:'待质量复核后解冻或报损'}));
        if(detailMode.value==='inTransit')return detailTeams.value.filter(team=>team.inTransit>0).map(team=>({team:team.team,type:'发货在途',docNo:`FH202609${String(team.team.length+12).padStart(4,'0')}`,qty:team.inTransit,creator:'刘敏'}));
        if(detailMode.value==='pending')return detailTeams.value.filter(team=>team.pendingPurchase>0).map(team=>({team:team.team,type:'待采购库存',docNo:'—',qty:team.pendingPurchase,note:'来源单据及统计口径待确认'}));
        return[];
      });

      const qty=value=>Number(value||0).toLocaleString('zh-CN');
      const docTypeLabel=type=>({'发货占用':'发货单','加工占用':'加工单','质量冻结':'冻结单','发货在途':'发货单','待确认入库':'收货单'}[type]||'');
      const ageText=value=>value==null?'—':`${qty(value)}天`;
      const quantityClass=value=>value<0?'qty-danger':'qty-normal';
      const summaryFields=['available','occupied','inTransit','inStockTotal','pendingPurchase','frozen'];
      const occupancyVisible=row=>!row||!['海外仓','平台仓'].includes(row.warehouseAttribute)||isFbaRow(row);
      const inStockVisible=row=>occupancyVisible(row);
      const isOverseasRow=row=>Boolean(row&&row.warehouseAttribute==='海外仓');
      const getSummaries=({columns})=>{const firstDataIndex=columns.findIndex(column=>column.type!=='selection');return columns.map((column,index)=>{if(index===firstDataIndex)return'合计';if(column.property==='overseasInTransit')return'—';if(!summaryFields.includes(column.property))return'';if(column.property==='pendingPurchase'&&!filteredRows.value.some(row=>row.pendingPurchase!==null))return'—';if(column.property==='inStockTotal'&&filteredRows.value.some(row=>row.inStockTotal==null))return'—';return qty(filteredRows.value.reduce((sum,row)=>sum+Number(row[column.property]||0),0));});};
      const query=()=>{Object.assign(applied,clone(filters));page.value=1;ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条库存记录`)};
      const resetFilters=()=>{Object.assign(filters,{codeType:'sku',codes:'',productName:'',warehouses:[],teams:[],developers:[],buyers:[]});Object.assign(applied,clone(filters));hideZero.value=true;page.value=1};
      const openMetric=(row,mode,team=row.team||'')=>{
        if((mode==='batch'||mode==='age')&&!row.batchEnabled){ElMessage.info('该仓库类型暂不记录库存批次');return;}
        currentRow.value=row;detailMode.value=mode;detailTeam.value=team;
        if(mode==='flow'){Object.assign(flowFilters,{skuType:'sku',sku:row.sku,warehouses:[row.warehouse],opTypes:[],directions:[],no:'',dateRange:[]});Object.assign(flowApplied,clone(flowFilters));flowPage.value=1;}
        detailVisible.value=true;
      };
      const ownershipItemOf=row=>({warehouse:row.warehouse||'',sku:row.sku||'',name:row.name||'',team:row.team||'',available:Number(row.available||0),quantity:'',targetTeam:'',remark:''});
      const targetTeamOptions=row=>teams.filter(team=>team!==row.team);
      const removeOwnershipItem=index=>{ownershipItems.value.splice(index,1);if(!ownershipItems.value.length)ownershipVisible.value=false;};
      const openOwnershipTransfer=row=>{ownershipItems.value=[ownershipItemOf(row)];ownershipRemark.value='';ownershipVisible.value=true;};
      const openBatchOwnershipTransfer=()=>{
        if(!selectedRows.value.length){ElMessage.warning('请先勾选需要调拨的库存');return;}
        ownershipItems.value=selectedRows.value.map(ownershipItemOf);
        ownershipRemark.value='';
        ownershipVisible.value=true;
      };
      const submitOwnership=()=>{
        if(!ownershipItems.value.length){ElMessage.warning('请至少添加一条调拨明细');return;}
        for(const item of ownershipItems.value){
          if(item.quantity===''||item.quantity===null||item.quantity===undefined){ElMessage.warning(`请填写 SKU ${item.sku} 的调拨数量`);return;}
          const quantity=Number(item.quantity);
          if(!Number.isInteger(quantity)||quantity<=0||quantity>item.available){ElMessage.warning(`SKU ${item.sku} 的调拨数量须为 1-${item.available} 的整数`);return;}
          if(!item.targetTeam){ElMessage.warning(`请选择 SKU ${item.sku} 的调入团队`);return;}
          if(item.targetTeam===item.team){ElMessage.warning(`SKU ${item.sku} 的调入团队不能与调出团队相同`);return;}
        }
        const date=new Date(),pad=value=>String(value).padStart(2,'0');
        const no=`TF${String(date.getFullYear()).slice(2)}${pad(date.getMonth()+1)}${pad(date.getDate())}${String(Date.now()).slice(-4)}`;
        ElMessage.success(`货权调拨单 ${no} 已提交审核`);
        ownershipVisible.value=false;
        selectedRows.value=[];
        inventoryTable.value?.clearSelection();
      };
      const fallbackCopy=text=>{const input=document.createElement('textarea');input.value=text;input.setAttribute('readonly','');input.style.position='fixed';input.style.left='-9999px';input.style.top='0';input.style.opacity='0';document.body.appendChild(input);input.focus();input.select();input.setSelectionRange(0,text.length);const copied=document.execCommand('copy');document.body.removeChild(input);if(!copied)throw new Error('copy failed')};
      const copySku=async(sku,rowKey)=>{try{let copied=false;if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(sku);copied=true}catch(error){copied=false}}if(!copied)fallbackCopy(sku);copiedRowKey.value=rowKey;window.setTimeout(()=>{if(copiedRowKey.value===rowKey)copiedRowKey.value=''},1500);ElMessage.success(`已复制 SKU：${sku}`)}catch(error){ElMessage.error('复制失败，请手动复制 SKU')}};

      return{filters,warehouses,warehouseOptions,teams,developers,buyers,page,pageSize,updatedAt,hideZero,filteredRows,sortedRows,pagedRows,sortState,handleSortChange,detailVisible,currentRow,detailMode,detailTeam,copiedRowKey,detailTeams,detailSummary,detailTitle,detailUnavailableMessage,detailRows,ageBuckets,productThumbnail,qty,docTypeLabel,ageText,quantityClass,isFbaRow,occupancyVisible,inStockVisible,isOverseasRow,getSummaries,query,resetFilters,openMetric,openOwnershipTransfer,selectedRows,canSelectRow,handleSelectionChange,openBatchOwnershipTransfer,inventoryTable,ownershipVisible,ownershipItems,ownershipRemark,targetTeamOptions,removeOwnershipItem,submitOwnership,copySku,flowFilters,flowApplied,flowPage,flowPageSize,flowWarehouses,flowWarehouseOptions,flowOpTypes,flowDirections,flowFilteredRows,flowPagedRows,flowQuery,flowReset,signed};
    }
  }).use(window.ElementPlus).mount('#app');
})();
