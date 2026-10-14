(function(){
  const {createApp,ref,reactive,computed}=window.Vue;
  const {ElMessage}=window.ElementPlus;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const sourceRows=[
    {id:'13',batchNo:'PC2609150001',warehouse:'耗材仓-东莞2号',team:'TikTok',sku:'FF123456',name:'自动变光焊接面罩基础款',inboundType:'采购入库',bizNo:'CG20260912001',receivedQty:60,remainingAvailableQty:42,inboundAt:'2026-09-15 10:30',storageAge:5},
    {id:'1',batchNo:'PC2608280001',warehouse:'美通物流中转仓',team:'TikTok',sku:'FF123456',name:'自动变光焊接面罩基础款',inboundType:'采购入库',bizNo:'CG20260820001',receivedQty:100,remainingAvailableQty:30,inboundAt:'2026-08-28 10:30',storageAge:23},
    {id:'2',batchNo:'PC2608210001',warehouse:'美通物流中转仓',team:'eBay',sku:'FF123456',name:'自动变光焊接面罩基础款',inboundType:'采购入库',bizNo:'CG20260818006',receivedQty:50,remainingAvailableQty:40,inboundAt:'2026-08-21 10:10',storageAge:30},
    {id:'3',batchNo:'PC2607180001',warehouse:'美通物流中转仓',team:'TikTok',sku:'U00US160015',name:'ARC160焊机美规套装',inboundType:'采购入库',bizNo:'CG20260715008',receivedQty:80,remainingAvailableQty:75,inboundAt:'2026-07-18 10:00',storageAge:64},
    {id:'4',batchNo:'PC2608240001',warehouse:'美通物流中转仓',team:'TikTok',sku:'U00US160015',name:'ARC160焊机美规套装',inboundType:'采购入库',bizNo:'CG20260820003',receivedQty:70,remainingAvailableQty:35,inboundAt:'2026-08-24 10:00',storageAge:27},
    {id:'5',batchNo:'PC2609010001',warehouse:'元速跨境物流中转仓',team:'TikTok',sku:'U00US260010',name:'CUT55 ProLux等离子切割机',inboundType:'调拨入库',bizNo:'DB20260901007',receivedQty:30,remainingAvailableQty:0,inboundAt:'2026-09-01 10:20',storageAge:19}
  ];
  const batchWarehouseAttributes=new Set(['自营仓','物流中转仓']);
  const batchRows=sourceRows.filter(row=>batchWarehouseAttributes.has(window.WarehouseAttributes.of(row.warehouse)));
  const splitValues=value=>String(value||'').split(/[,，、;；\s\n]+/).map(item=>item.trim()).filter(Boolean);
  const isNumber=value=>value!==''&&value!==null&&value!==undefined&&!Number.isNaN(Number(value));
  const externalCodes=row=>({
    lingxingSku:`LX-${row.sku}`,
    overseasSku:row.warehouse==='亚马逊LAS1仓'?'-':`OVS-${row.sku}`,
    fnsku:row.warehouse==='亚马逊LAS1仓'?'X003AMZLAS1':'-'
  });
  createApp({
    setup(){
      const rows=ref(clone(batchRows).map(row=>({...row,...externalCodes(row),warehouseCode:window.WarehouseAttributes.codeOf(row.warehouse)})));
      const filters=reactive({keywordType:'batchNo',keyword:'',skuType:'sku',skus:'',productName:'',warehouses:[],teams:[],inboundTypes:[],inboundRange:[]});
      const applied=reactive(clone(filters));
      const page=ref(1),pageSize=ref(20),selectedRows=ref([]),detailVisible=ref(false),currentRow=ref(null);
      const sortState=reactive({prop:'',order:''});
      const warehouses=[...new Set(batchRows.map(row=>row.warehouse))];
      const warehouseOptions=warehouses.map(value=>({value,label:`${value}（${window.WarehouseAttributes.codeOf(value)||'-'}）`}));
      const teams=[...new Set(batchRows.map(row=>row.team))];
      const inboundTypes=[...new Set(batchRows.map(row=>row.inboundType))];
      const filteredRows=computed(()=>rows.value.filter(row=>{
        const keywords=splitValues(applied.keyword);
        if(keywords.length&&!keywords.some(value=>String(row[applied.keywordType]||'').toUpperCase().includes(value.toUpperCase())))return false;
        const skuField={sku:'sku',lingxingSku:'lingxingSku',overseasSku:'overseasSku',fnsku:'fnsku'}[applied.skuType]||'sku';
        const skus=splitValues(applied.skus);
        if(skus.length&&!skus.some(value=>String(row[skuField]||'').toUpperCase().includes(value.toUpperCase())))return false;
        const productName=applied.productName.trim().toLowerCase();
        if(productName&&!row.name.toLowerCase().includes(productName))return false;
        if(applied.warehouses.length&&!applied.warehouses.includes(row.warehouse))return false;
        if(applied.teams.length&&!applied.teams.includes(row.team))return false;
        if(applied.inboundTypes.length&&!applied.inboundTypes.includes(row.inboundType))return false;
        const start=applied.inboundRange?.[0],end=applied.inboundRange?.[1];
        if(start&&row.inboundAt<start.slice(0,16))return false;
        if(end&&row.inboundAt>end.slice(0,16))return false;
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
      const fmtQty=value=>Number(value||0).toLocaleString('zh-CN');
      const getSummaries=({columns})=>columns.map((column,index)=>index===1?'合计':column.property==='remainingAvailableQty'?fmtQty(filteredRows.value.reduce((sum,row)=>sum+Number(row.remainingAvailableQty||0),0)):'');
      const query=()=>{Object.assign(applied,clone(filters));page.value=1;selectedRows.value=[];ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条批次库存`);};
      const resetFilters=()=>{Object.assign(filters,{keywordType:'batchNo',keyword:'',skuType:'sku',skus:'',productName:'',warehouses:[],teams:[],inboundTypes:[],inboundRange:[]});Object.assign(applied,clone(filters));page.value=1;selectedRows.value=[];};
      const exportPlaceholder=()=>ElMessage.info(`已按当前筛选条件准备导出 ${filteredRows.value.length} 条批次库存`);
      const openDetail=row=>{currentRow.value=row;detailVisible.value=true;};
      return{filters,warehouses,warehouseOptions,teams,inboundTypes,page,pageSize,selectedRows,filteredRows,sortedRows,pagedRows,sortState,handleSortChange,detailVisible,currentRow,fmtQty,getSummaries,query,resetFilters,exportPlaceholder,openDetail};
    }
  }).use(window.ElementPlus).mount('#app');
})();
