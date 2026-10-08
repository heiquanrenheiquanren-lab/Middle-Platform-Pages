(function(){
  const {createApp,ref,reactive,computed}=window.Vue;
  const {ElMessage}=window.ElementPlus;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const sourceRows=[
    {id:'1',batchNo:'PC2608280001',warehouse:'美通物流中转仓',team:'TikTok',sku:'FF123456',name:'自动变光焊接面罩基础款',inboundType:'采购入库',bizNo:'CG20260820001',receivedQty:100,remainingAvailableQty:30,purchasePrice:128,unitInventoryCost:132.5,inboundAt:'2026-08-28 10:30',storageAge:23},
    {id:'2',batchNo:'PC2608210001',warehouse:'美通物流中转仓',team:'eBay',sku:'FF123456',name:'自动变光焊接面罩基础款',inboundType:'采购入库',bizNo:'CG20260818006',receivedQty:50,remainingAvailableQty:40,purchasePrice:126,unitInventoryCost:130.8,inboundAt:'2026-08-21 10:10',storageAge:30},
    {id:'3',batchNo:'PC2607180001',warehouse:'美通物流中转仓',team:'TikTok',sku:'U00US160015',name:'ARC160焊机美规套装',inboundType:'采购入库',bizNo:'CG20260715008',receivedQty:80,remainingAvailableQty:75,purchasePrice:210,unitInventoryCost:218.6,inboundAt:'2026-07-18 10:00',storageAge:64},
    {id:'4',batchNo:'PC2608240001',warehouse:'美通物流中转仓',team:'TikTok',sku:'U00US160015',name:'ARC160焊机美规套装',inboundType:'采购入库',bizNo:'CG20260820003',receivedQty:70,remainingAvailableQty:35,purchasePrice:208,unitInventoryCost:215.2,inboundAt:'2026-08-24 10:00',storageAge:27},
    {id:'5',batchNo:'PC2609010001',warehouse:'元速跨境物流中转仓',team:'TikTok',sku:'U00US260010',name:'CUT55 ProLux等离子切割机',inboundType:'调拨入库',bizNo:'DB20260901007',receivedQty:30,remainingAvailableQty:0,purchasePrice:325,unitInventoryCost:331.5,inboundAt:'2026-09-01 10:20',storageAge:19},
    {id:'6',batchNo:'PC2607150001',warehouse:'亚马逊LAS1仓',team:'亚马逊团队',sku:'130US160003',name:'ARC160（AC-美规）',inboundType:'FBA入仓',bizNo:'FBA20260715003',receivedQty:120,remainingAvailableQty:84,purchasePrice:185,unitInventoryCost:194.1,inboundAt:'2026-07-15 09:00',storageAge:67},
    {id:'7',batchNo:'PC2608260001',warehouse:'亚马逊LAS1仓',team:'亚马逊团队',sku:'130US160003',name:'ARC160（AC-美规）',inboundType:'FBA入仓',bizNo:'FBA20260826011',receivedQty:100,remainingAvailableQty:88,purchasePrice:188,unitInventoryCost:196.4,inboundAt:'2026-08-26 09:00',storageAge:25},
    {id:'8',batchNo:'PC2608120001',warehouse:'深圳市华英科技有限公司',team:'eBay',sku:'140US260008',name:'CUT55 ProLux',inboundType:'采购入库',bizNo:'CG20260810005',receivedQty:12,remainingAvailableQty:9,purchasePrice:298,unitInventoryCost:306.2,inboundAt:'2026-08-12 10:00',storageAge:39},
    {id:'9',batchNo:'PC2608220001',warehouse:'深圳市华英科技有限公司',team:'B端团队',sku:'140US260008',name:'CUT55 ProLux',inboundType:'采购入库',bizNo:'CG20260820006',receivedQty:21,remainingAvailableQty:21,purchasePrice:296,unitInventoryCost:304.3,inboundAt:'2026-08-22 10:00',storageAge:29},
    {id:'10',batchNo:'PC2608080001',warehouse:'梧州供应商仓',team:'供应商团队',sku:'34001001110',name:'焊接帽子迷彩2-6 7/8',inboundType:'采购入库',bizNo:'CG20260806002',receivedQty:26,remainingAvailableQty:14,purchasePrice:45,unitInventoryCost:47.6,inboundAt:'2026-08-08 10:00',storageAge:43},
    {id:'11',batchNo:'PC2608190001',warehouse:'梧州供应商仓',team:'供应商团队',sku:'34001001110',name:'焊接帽子迷彩2-6 7/8',inboundType:'采购入库',bizNo:'CG20260818004',receivedQty:30,remainingAvailableQty:28,purchasePrice:46,unitInventoryCost:48.1,inboundAt:'2026-08-19 10:00',storageAge:32},
    {id:'12',batchNo:'PC2609030001',warehouse:'台州华熙灯饰有限公司',team:'采购团队',sku:'U00US160015',name:'ARC160焊机美规套装',inboundType:'采购入库',bizNo:'CG20260901003',receivedQty:50,remainingAvailableQty:50,purchasePrice:212,unitInventoryCost:221.4,inboundAt:'2026-09-03 10:00',storageAge:17}
  ];
  const splitValues=value=>String(value||'').split(/[,，、;；\s\n]+/).map(item=>item.trim()).filter(Boolean);
  const isNumber=value=>value!==''&&value!==null&&value!==undefined&&!Number.isNaN(Number(value));
  createApp({
    setup(){
      const rows=ref(clone(sourceRows));
      const filters=reactive({keywordType:'batchNo',keyword:'',skus:'',warehouses:[],teams:[],inboundTypes:[],inboundRange:[]});
      const applied=reactive(clone(filters));
      const page=ref(1),pageSize=ref(20),selectedRows=ref([]),detailVisible=ref(false),currentRow=ref(null);
      const warehouses=[...new Set(sourceRows.map(row=>row.warehouse))];
      const teams=[...new Set(sourceRows.map(row=>row.team))];
      const inboundTypes=[...new Set(sourceRows.map(row=>row.inboundType))];
      const filteredRows=computed(()=>rows.value.filter(row=>{
        const keywords=splitValues(applied.keyword);
        if(keywords.length&&!keywords.some(value=>String(row[applied.keywordType]||'').toUpperCase().includes(value.toUpperCase())))return false;
        const skus=splitValues(applied.skus);
        if(skus.length&&!skus.some(value=>row.sku.toUpperCase().includes(value.toUpperCase())))return false;
        if(applied.warehouses.length&&!applied.warehouses.includes(row.warehouse))return false;
        if(applied.teams.length&&!applied.teams.includes(row.team))return false;
        if(applied.inboundTypes.length&&!applied.inboundTypes.includes(row.inboundType))return false;
        const start=applied.inboundRange?.[0],end=applied.inboundRange?.[1];
        if(start&&row.inboundAt<start.slice(0,16))return false;
        if(end&&row.inboundAt>end.slice(0,16))return false;
        return true;
      }));
      const pagedRows=computed(()=>filteredRows.value.slice((page.value-1)*pageSize.value,page.value*pageSize.value));
      const fmtQty=value=>Number(value||0).toLocaleString('zh-CN');
      const fmtMoney=value=>Number(value||0).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
      const getSummaries=({columns})=>columns.map((column,index)=>index===1?'合计':column.property==='remainingAvailableQty'?fmtQty(filteredRows.value.reduce((sum,row)=>sum+Number(row.remainingAvailableQty||0),0)):'');
      const query=()=>{Object.assign(applied,clone(filters));page.value=1;selectedRows.value=[];ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条批次库存`);};
      const resetFilters=()=>{Object.assign(filters,{keywordType:'batchNo',keyword:'',skus:'',warehouses:[],teams:[],inboundTypes:[],inboundRange:[]});Object.assign(applied,clone(filters));page.value=1;selectedRows.value=[];};
      const exportPlaceholder=()=>ElMessage.info(`已按当前筛选条件准备导出 ${filteredRows.value.length} 条批次库存`);
      const openDetail=row=>{currentRow.value=row;detailVisible.value=true;};
      return{filters,warehouses,teams,inboundTypes,page,pageSize,selectedRows,filteredRows,pagedRows,detailVisible,currentRow,fmtQty,fmtMoney,getSummaries,query,resetFilters,exportPlaceholder,openDetail};
    }
  }).use(window.ElementPlus).mount('#app');
})();
