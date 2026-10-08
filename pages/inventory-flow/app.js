(function(){
  const {createApp,ref,reactive,computed}=window.Vue;
  const {ElMessage}=window.ElementPlus;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const fmt=value=>Number(value||0).toLocaleString('zh-CN');
  const signed=value=>{const n=Number(value||0);return n>0?'+'+fmt(n):fmt(n)};

  // 库存流水示例数据：仅记录可用库存的增减，不记录在途、冻结和待确认状态变化
  const sourceFlows=[
    {sku:'FF123456',warehouse:'美通物流中转仓',team:'TikTok',opType:'采购入库',before:0,after:100,opNo:'RK20260828016',bizNo:'CG20260820001',batchNos:['PC2608280001'],operator:'系统',operatedAt:'2026-08-28 10:30'},
    {sku:'FF123456',warehouse:'美通物流中转仓',team:'TikTok',opType:'销售出库',before:100,after:70,opNo:'XS20260901012',bizNo:'XS20260901012',batchNos:['PC2608280001'],operator:'刘敏',operatedAt:'2026-09-01 09:15'},
    {sku:'FF123456',warehouse:'美通物流中转仓',team:'TikTok',opType:'调拨出库',before:70,after:50,opNo:'DB20260903002',bizNo:'DB20260903002',batchNos:['PC2608280001','PC2608210001'],operator:'系统',operatedAt:'2026-09-03 11:05'},
    {sku:'U00US160015',warehouse:'美通物流中转仓',team:'TikTok',opType:'采购入库',before:0,after:80,opNo:'RK20260718021',bizNo:'CG20260715008',batchNos:['PC2607180001'],operator:'系统',operatedAt:'2026-07-18 10:00'},
    {sku:'U00US160015',warehouse:'美通物流中转仓',team:'TikTok',opType:'采购入库',before:80,after:150,opNo:'RK20260824011',bizNo:'CG20260820003',batchNos:['PC2608240001'],operator:'系统',operatedAt:'2026-08-24 10:00'},
    {sku:'U00US260010',warehouse:'元速跨境物流中转仓',team:'TikTok',opType:'采购入库',before:0,after:30,opNo:'RK20260901007',bizNo:'DB20260901007',batchNos:['PC2609010001'],operator:'系统',operatedAt:'2026-09-01 10:20'},
    {sku:'130US160003',warehouse:'亚马逊LAS1仓',team:'亚马逊团队',opType:'FBA入仓',before:0,after:120,opNo:'FBA20260715003',bizNo:'FBA20260715003',batchNos:['PC2607150001'],operator:'系统',operatedAt:'2026-07-15 09:00'},
    {sku:'130US160003',warehouse:'亚马逊LAS1仓',team:'亚马逊团队',opType:'FBA入仓',before:120,after:220,opNo:'FBA20260826011',bizNo:'FBA20260826011',batchNos:['PC2608260001'],operator:'系统',operatedAt:'2026-08-26 09:00'},
    {sku:'140US260008',warehouse:'深圳市华英科技有限公司',team:'eBay',opType:'采购入库',before:0,after:12,opNo:'RK20260812031',bizNo:'CG20260810005',batchNos:['PC2608120001'],operator:'系统',operatedAt:'2026-08-12 10:00'},
    {sku:'140US260008',warehouse:'深圳市华英科技有限公司',team:'B端团队',opType:'采购入库',before:12,after:33,opNo:'RK20260822018',bizNo:'CG20260820006',batchNos:['PC2608220001'],operator:'系统',operatedAt:'2026-08-22 10:00'},
    {sku:'34001001110',warehouse:'梧州供应商仓',team:'供应商团队',opType:'采购入库',before:0,after:26,opNo:'WZ-RK20260808012',bizNo:'CG20260806002',batchNos:['PC2608080001'],operator:'系统',operatedAt:'2026-08-08 10:00'},
    {sku:'34001001110',warehouse:'梧州供应商仓',team:'供应商团队',opType:'采购入库',before:26,after:56,opNo:'WZ-RK20260819007',bizNo:'CG20260818004',batchNos:['PC2608190001'],operator:'系统',operatedAt:'2026-08-19 10:00'},
    {sku:'U00US160015',warehouse:'台州华熙灯饰有限公司',team:'采购团队',opType:'采购入库',before:0,after:50,opNo:'TZ-RK20260903006',bizNo:'CG20260901003',batchNos:['PC2609030001'],operator:'系统',operatedAt:'2026-09-03 10:00'}
  ];

  createApp({
    setup(){
      const flows=ref(clone(sourceFlows).map(row=>({...row,direction:row.after-row.before>0?'入库':row.after-row.before<0?'出库':'-',lingxingSku:'LX-'+row.sku,overseasSku:'OVS-'+row.sku,fnsku:'X00'+row.sku})));
      const filters=reactive({skuType:'sku',sku:'',warehouses:[],teams:[],opTypes:[],direction:'',no:'',dateRange:[]});
      const applied=reactive(clone(filters));
      const page=ref(1),pageSize=ref(20);

      const warehouses=[...new Set(sourceFlows.map(row=>row.warehouse))];
      const teams=[...new Set(sourceFlows.map(row=>row.team))];
      const opTypes=[...new Set(sourceFlows.map(row=>row.opType))];
      const directions=['出库','入库'];

      const splitValues=value=>String(value||'').split(/[,，、;；\s\n]+/).map(item=>item.trim()).filter(Boolean);

      const filteredRows=computed(()=>flows.value.filter(row=>{
        const skuField={sku:'sku',lingxingSku:'lingxingSku',overseasSku:'overseasSku',fnsku:'fnsku'}[applied.skuType]||'sku';
        const skus=splitValues(applied.sku);
        if(skus.length && !skus.some(k=>String(row[skuField]||'').toUpperCase().includes(k.toUpperCase())))return false;
        if(applied.warehouses.length && !applied.warehouses.includes(row.warehouse))return false;
        if(applied.teams.length && !applied.teams.includes(row.team))return false;
        if(applied.opTypes.length && !applied.opTypes.includes(row.opType))return false;
        if(applied.direction && row.direction!==applied.direction)return false;
        const nos=splitValues(applied.no);
        if(nos.length && !nos.some(k=>String(row.opNo).toUpperCase().includes(k.toUpperCase())||String(row.bizNo).toUpperCase().includes(k.toUpperCase())))return false;
        const start=applied.dateRange?.[0],end=applied.dateRange?.[1];
        if(start||end){
          const day=row.operatedAt.slice(0,10);
          if(start&&day<start)return false;
          if(end&&day>end)return false;
        }
        return true;
      }));
      const pagedRows=computed(()=>filteredRows.value.slice((page.value-1)*pageSize.value,page.value*pageSize.value));

      const query=()=>{Object.assign(applied,clone(filters));page.value=1;ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条流水记录`)};
      const resetFilters=()=>{Object.assign(filters,{skuType:'sku',sku:'',warehouses:[],teams:[],opTypes:[],direction:'',no:'',dateRange:[]});Object.assign(applied,clone(filters));page.value=1};
      const exportPlaceholder=()=>ElMessage.info('导出功能开发中，敬请期待');

      return{filters,warehouses,teams,opTypes,directions,page,pageSize,filteredRows,pagedRows,fmt,signed,query,resetFilters,exportPlaceholder};
    }
  }).use(window.ElementPlus).mount('#app');
})();
