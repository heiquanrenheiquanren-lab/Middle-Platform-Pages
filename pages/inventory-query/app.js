(function(){
  const {createApp,ref,reactive,computed}=window.Vue;
  const {ElMessage}=window.ElementPlus;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const pad=value=>String(value).padStart(2,'0');
  const nowText=()=>{const date=new Date();return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`};

  const sourceRows=[
    {warehouse:'美通物流中转仓',warehouseType:'海外仓',sku:'FF123456',name:'自动变光焊接面罩基础款',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-20 10:30',teams:[
      {team:'TikTok',onHand:100,occupied:30,frozen:10,inTransit:50,pending:20,batches:[{batchNo:'RK20260828016',source:'采购入库',receivedAt:'2026-08-28',qty:60,age:23},{batchNo:'RK20260908009',source:'采购入库',receivedAt:'2026-09-08',qty:40,age:12}]},
      {team:'eBay',onHand:50,occupied:10,frozen:0,inTransit:20,pending:0,batches:[{batchNo:'RK20260821008',source:'采购入库',receivedAt:'2026-08-21',qty:30,age:30},{batchNo:'JGP20260905002',source:'加工入库',receivedAt:'2026-09-05',qty:20,age:15}]}
    ]},
    {warehouse:'美通物流中转仓',warehouseType:'海外仓',sku:'U00US160015',name:'ARC160焊机美规套装',unit:'件',developer:'郑豪阳',buyer:'杨琴',updatedAt:'2026-09-20 10:30',teams:[
      {team:'TikTok',onHand:150,occupied:35,frozen:5,inTransit:0,pending:12,batches:[{batchNo:'RK20260718021',source:'采购入库',receivedAt:'2026-07-18',qty:80,age:64},{batchNo:'RK20260824011',source:'采购入库',receivedAt:'2026-08-24',qty:70,age:27}]}
    ]},
    {warehouse:'元速跨境物流中转仓',warehouseType:'海外仓',sku:'U00US260010',name:'CUT55 ProLux等离子切割机',unit:'件',developer:'颜文',buyer:'刘敏',updatedAt:'2026-09-20 09:45',teams:[
      {team:'TikTok',onHand:0,occupied:0,frozen:0,inTransit:100,pending:0,batches:[]},
      {team:'eBay',onHand:30,occupied:30,frozen:0,inTransit:0,pending:0,batches:[{batchNo:'RK20260901007',source:'调拨入库',receivedAt:'2026-09-01',qty:30,age:19}]}
    ]},
    {warehouse:'亚马逊LAS1仓',warehouseType:'FBA平台仓',sku:'130US160003',name:'ARC160（AC-美规）',unit:'件',developer:'郑豪阳',buyer:'刘敏',updatedAt:'2026-09-20 08:56',teams:[
      {team:'亚马逊团队',onHand:220,occupied:40,frozen:8,inTransit:80,pending:0,batches:[{batchNo:'FBA20260715003',source:'FBA入仓',receivedAt:'2026-07-15',qty:120,age:67},{batchNo:'FBA20260826011',source:'FBA入仓',receivedAt:'2026-08-26',qty:100,age:25}]}
    ]},
    {warehouse:'深圳市华英科技有限公司',warehouseType:'供应商仓',sku:'140US260008',name:'CUT55 ProLux',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-20 10:12',teams:[
      {team:'eBay',onHand:33,occupied:3,frozen:0,inTransit:250,pending:30,batches:[{batchNo:'RK20260812031',source:'采购入库',receivedAt:'2026-08-12',qty:12,age:39},{batchNo:'RK20260822018',source:'采购入库',receivedAt:'2026-08-22',qty:21,age:29}]},
      {team:'B端团队',onHand:10,occupied:0,frozen:0,inTransit:0,pending:0,batches:[{batchNo:'RK20260910004',source:'销售退件入库',receivedAt:'2026-09-10',qty:10,age:10}]}
    ]},
    {warehouse:'梧州供应商仓',warehouseType:'供应商仓',sku:'34001001110',name:'焊接帽子迷彩2-6 7/8',unit:'件',developer:'颜文',buyer:'陈丽',updatedAt:'2026-09-20 10:05',teams:[
      {team:'亚马逊团队',onHand:56,occupied:12,frozen:2,inTransit:0,pending:0,batches:[{batchNo:'WZ-RK20260808012',source:'采购入库',receivedAt:'2026-08-08',qty:26,age:43},{batchNo:'WZ-RK20260819007',source:'采购入库',receivedAt:'2026-08-19',qty:30,age:32}]},
      {team:'B端团队',onHand:0,occupied:0,frozen:0,inTransit:0,pending:40,batches:[]}
    ]},
    {warehouse:'台州华熙灯饰有限公司',warehouseType:'供应商仓',sku:'U00US160015',name:'ARC160焊机美规套装',unit:'件',developer:'郑豪阳',buyer:'陈丽',updatedAt:'2026-09-20 09:58',teams:[
      {team:'TikTok',onHand:50,occupied:0,frozen:0,inTransit:0,pending:0,batches:[{batchNo:'TZ-RK20260903006',source:'采购入库',receivedAt:'2026-09-03',qty:50,age:17}]}
    ]},
    {warehouse:'宁波测试供应商仓',warehouseType:'供应商仓',sku:'ZERO00001',name:'零库存历史测试商品',unit:'件',developer:'颜文',buyer:'杨琴',updatedAt:'2026-09-19 18:20',teams:[
      {team:'eBay',onHand:0,occupied:0,frozen:0,inTransit:0,pending:0,batches:[]}
    ]}
  ];

  const weightedAge=teams=>{const batches=teams.flatMap(team=>team.batches||[]);const total=batches.reduce((sum,batch)=>sum+batch.qty,0);return total?Math.round(batches.reduce((sum,batch)=>sum+batch.qty*batch.age,0)/total):null};
  const normalizeTeam=team=>({...team,available:team.onHand-team.occupied-team.frozen,weightedAge:weightedAge([team])});
  const summarize=(row,teams)=>{const normalized=teams.map(normalizeTeam);const sum=key=>normalized.reduce((total,team)=>total+Number(team[key]||0),0);return {...row,rowKey:`${row.warehouse}|${row.sku}`,teams:normalized,onHand:sum('onHand'),occupied:sum('occupied'),frozen:sum('frozen'),available:sum('available'),inTransit:sum('inTransit'),pending:sum('pending'),weightedAge:weightedAge(normalized)};};

  createApp({
    setup(){
      const rows=ref(clone(sourceRows));
      const filters=reactive({keyword:'',warehouse:'',team:'',developer:'',buyer:'',stockState:'',showZero:false});
      const applied=reactive(clone(filters));
      const page=ref(1),pageSize=ref(20),updatedAt=ref('2026-09-20 10:30');
      const detailVisible=ref(false),currentRow=ref(null),detailMode=ref('team'),detailTeam=ref('');

      const warehouses=[...new Set(sourceRows.map(row=>row.warehouse))];
      const teams=[...new Set(sourceRows.flatMap(row=>row.teams.map(team=>team.team)))];
      const developers=[...new Set(sourceRows.map(row=>row.developer))];
      const buyers=[...new Set(sourceRows.map(row=>row.buyer))];
      const stockStates=[{label:'有库用库存',value:'available'},{label:'库用库存为 0',value:'unavailable'},{label:'有占用库存',value:'occupied'},{label:'有冻结库存',value:'frozen'},{label:'有在途库存',value:'inTransit'},{label:'有待确认库存',value:'pending'},{label:'零库存',value:'zero'}];

      const filteredRows=computed(()=>rows.value.map(row=>{
        const selectedTeams=applied.team?row.teams.filter(team=>team.team===applied.team):row.teams;
        return selectedTeams.length?summarize(row,selectedTeams):null;
      }).filter(Boolean).filter(row=>{
        const keyword=applied.keyword.trim().toLowerCase();
        if(keyword&&!`${row.sku} ${row.name}`.toLowerCase().includes(keyword))return false;
        if(applied.warehouse&&row.warehouse!==applied.warehouse)return false;
        if(applied.developer&&row.developer!==applied.developer)return false;
        if(applied.buyer&&row.buyer!==applied.buyer)return false;
        const zero=[row.onHand,row.occupied,row.frozen,row.inTransit,row.pending].every(value=>value===0);
        if(!applied.showZero&&zero)return false;
        if(applied.stockState==='available'&&row.available<=0)return false;
        if(applied.stockState==='unavailable'&&!(row.onHand>0&&row.available===0))return false;
        if(applied.stockState==='occupied'&&row.occupied<=0)return false;
        if(applied.stockState==='frozen'&&row.frozen<=0)return false;
        if(applied.stockState==='inTransit'&&row.inTransit<=0)return false;
        if(applied.stockState==='pending'&&row.pending<=0)return false;
        if(applied.stockState==='zero'&&!zero)return false;
        return true;
      }));
      const pagedRows=computed(()=>filteredRows.value.slice((page.value-1)*pageSize.value,page.value*pageSize.value));
      const detailTeams=computed(()=>{if(!currentRow.value)return[];return detailTeam.value?currentRow.value.teams.filter(team=>team.team===detailTeam.value):currentRow.value.teams});
      const detailSummary=computed(()=>currentRow.value?summarize(currentRow.value,detailTeams.value):{onHand:0,occupied:0,frozen:0,available:0,inTransit:0,pending:0});
      const detailTitle=computed(()=>({team:'库存明细',available:'库用库存构成',batch:'批次与库龄',occupied:'占用库存明细',frozen:'冻结库存明细',inTransit:'在途库存明细',pending:'待确认库存明细'}[detailMode.value]||'库存明细'));
      const detailRows=computed(()=>{
        if(!currentRow.value)return[];
        if(detailMode.value==='batch')return detailTeams.value.flatMap(team=>(team.batches||[]).map(batch=>({team:team.team,...batch})));
        if(detailMode.value==='occupied')return detailTeams.value.filter(team=>team.occupied>0).flatMap(team=>{
          const shipment=Math.ceil(team.occupied*.7),processing=team.occupied-shipment;
          return [{team:team.team,type:'发货占用',docNo:`FH202609${String(team.team.length+12).padStart(4,'0')}`,qty:shipment,note:'待实际发货结算占用'},...(processing?[{team:team.team,type:'加工占用',docNo:`JG202609${String(team.team.length+7).padStart(4,'0')}`,qty:processing,note:'加工完成后按实际耗用结算'}]:[])];
        });
        if(detailMode.value==='frozen')return detailTeams.value.filter(team=>team.frozen>0).map(team=>({team:team.team,type:'质量冻结',docNo:`DJ202609${String(team.team.length+3).padStart(4,'0')}`,qty:team.frozen,note:'待质量复核后解冻或报损'}));
        if(detailMode.value==='inTransit')return detailTeams.value.filter(team=>team.inTransit>0).map(team=>({team:team.team,type:'调拨/采购在途',docNo:`DB202609${String(team.team.length+18).padStart(4,'0')}`,qty:team.inTransit,note:'正在发往当前仓库'}));
        if(detailMode.value==='pending')return detailTeams.value.filter(team=>team.pending>0).map(team=>({team:team.team,type:'待确认入库',docNo:`SH202609${String(team.team.length+25).padStart(4,'0')}`,qty:team.pending,note:'货物已到仓，数量或质检待确认'}));
        return[];
      });

      const qty=value=>Number(value||0).toLocaleString('zh-CN');
      const ageText=value=>value==null?'—':qty(value);
      const quantityClass=value=>value<0?'qty-danger':'qty-normal';
      const rowTags=row=>{const tags=[];if(row.available<0)tags.push({label:'库用异常',type:'danger'});else if(row.onHand>0&&row.available===0)tags.push({label:'完全占用',type:'warning'});if(row.frozen>0)tags.push({label:'有冻结',type:'danger'});if(row.onHand===0&&(row.inTransit>0||row.pending>0))tags.push({label:'待入库',type:'info'});if([row.onHand,row.occupied,row.frozen,row.inTransit,row.pending].every(value=>value===0))tags.push({label:'零库存',type:'info'});return tags;};
      const query=()=>{Object.assign(applied,clone(filters));page.value=1;ElMessage.success(`查询完成，共 ${filteredRows.value.length} 条库存记录`)};
      const resetFilters=()=>{Object.assign(filters,{keyword:'',warehouse:'',team:'',developer:'',buyer:'',stockState:'',showZero:false});Object.assign(applied,clone(filters));page.value=1};
      const refresh=()=>{updatedAt.value=nowText();rows.value=clone(rows.value);ElMessage.success('库存数据已刷新')};
      const openMetric=(row,mode,team='')=>{currentRow.value=row;detailMode.value=mode;detailTeam.value=team;detailVisible.value=true};

      const routes={forecast:'../demand-forecast/index.html',stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',skuFirstLegCost:'../sku-first-leg-cost/index.html',inventoryQuery:'../inventory-query/index.html',processingOrder:'../processing-orders/index.html'};
      window.setTimeout(()=>document.querySelectorAll('[data-page-nav]').forEach(item=>item.addEventListener('click',()=>{const key=item.dataset.pageNav;if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page:key},'*');else if(routes[key])window.location.href=routes[key]})),0);

      return{filters,warehouses,teams,developers,buyers,stockStates,page,pageSize,updatedAt,filteredRows,pagedRows,detailVisible,currentRow,detailMode,detailTeam,detailTeams,detailSummary,detailTitle,detailRows,qty,ageText,quantityClass,rowTags,query,resetFilters,refresh,openMetric};
    }
  }).use(window.ElementPlus).mount('#app');
})();
