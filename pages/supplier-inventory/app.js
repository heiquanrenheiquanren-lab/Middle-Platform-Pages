const baseSkus=[
  {sku:'34001001110',lx:'10410112110',supplier:'梧州市友盟焊接防护用品有限公司',name:'焊接帽子迷彩2-6 7/8',priceNoTax:17.52,priceTax:0,seller:'WeldersCap-Camouflage',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🎒'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'Amazon.Found.Best.ARC160',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧰'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'NEW-ARC160',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧰'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'weldingmacharc160',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧰'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'Amazon.Found.Best.ARC160',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:''},
  {sku:'42101000004',lx:'10250100710',supplier:'常州市佳士达焊材有限公司',name:'TIG焊丝-不锈钢/ER308L-1.6',priceNoTax:67.85,priceTax:0,seller:'ARER308L-516',platform:'b2c',store:'Lowes_arccaptain',country:'US',team:'Jasic团队',teamLead:'黄家伟',opsLead:'游蔡薇',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:''},
  {sku:'34001001110',lx:'10410112110',supplier:'梧州市友盟焊接防护用品有限公司',name:'焊接帽子迷彩2-6 7/8',priceNoTax:17.52,priceTax:0,seller:'10410112110',platform:'shopify',store:'B端独立站',country:'US',team:'B端团队',teamLead:'魏信怡',opsLead:'魏信怡',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🎒'},
  {sku:'EE123456',lx:'',supplier:'默认供应商',name:'测试EE123456',priceNoTax:22,priceTax:33,seller:'',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧯'},
  {sku:'FF123456',lx:'',supplier:'默认供应商',name:'测试FF123456',priceNoTax:10,priceTax:10,seller:'',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🪖'},
  {sku:'140US260008',lx:'10502020706',supplier:'深圳市康仕达科技有限公司',name:'CUT55 ProLux 等离子切割机',priceNoTax:678.99,priceTax:0,seller:'10502020706',platform:'ebay',store:'arccaptain_official',country:'US',team:'eBay',teamLead:'陈冰玲',opsLead:'严彩娜',whType:'自建仓',provider:'深圳市华英科技有限...',whName:'深圳市华英科技有限公司',whCode:'SU00001',icon:'🌺'},
  {sku:'51101000004',lx:'10460100310',supplier:'江苏奥信光电科技有限公司',name:'大屏焊帽放大镜片2.0*2',priceNoTax:11.68,priceTax:0,seller:'10460100310',platform:'ebay',store:'arccaptain_official',country:'US',team:'eBay',teamLead:'陈冰玲',opsLead:'王加中',whType:'自建仓',provider:'深圳原子智造科技...',whName:'深圳原子智造科技有限公司',whCode:'SU00010',icon:'🐹'},
  {sku:'EE123456',lx:'',supplier:'默认供应商',name:'测试EE123456',priceNoTax:22,priceTax:33,seller:'EE123456-SellerSku',platform:'b2c',store:'线下订单',country:'US',team:'B端团队',teamLead:'魏信怡',opsLead:'魏信怡',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧯'},
  {sku:'51001010025',lx:'AR-HM-001',supplier:'常州市佳士达焊材有限公司',name:'小屏焊帽-基础款（黑色）',priceNoTax:99,priceTax:0,seller:'Helmet-beiyong05',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'深圳市华英科技有限...',whName:'深圳市华英科技有限公司',whCode:'SU00001',icon:'🪖'},
  {sku:'34001001128',lx:'10410112128',supplier:'梧州市友盟焊接防护用品有限公司',name:'焊接帽子黑色',priceNoTax:15.88,priceTax:0,seller:'WeldersCap-Black',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🎒'},
  {sku:'34001001206',lx:'10410112206',supplier:'梧州市友盟焊接防护用品有限公司',name:'焊接帽子蓝色',priceNoTax:15.88,priceTax:0,seller:'WeldersCap-Blue',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🎒'}
];

const qtyConfigs=[
  {inStock:0,pending:0,inTransit:90,total:90,a0:0,a30:0,a60:0,a90:0,a180:0,pp:0,ps:0},
  {inStock:0,pending:0,inTransit:9,total:9,a0:0,a30:0,a60:0,a90:0,a180:0,pp:0,ps:40},
  {inStock:0,pending:0,inTransit:1,total:1,a0:0,a30:0,a60:0,a90:0,a180:0,pp:0,ps:40},
  {inStock:0,pending:0,inTransit:500,total:500,a0:0,a30:0,a60:0,a90:0,a180:0,pp:0,ps:40},
  {inStock:9,pending:9,inTransit:590,total:599,a0:9,a30:0,a60:0,a90:0,a180:0,pp:62,ps:0},
  {inStock:10,pending:0,inTransit:500,total:510,a0:10,a30:0,a60:0,a90:0,a180:0,pp:0,ps:0},
  {inStock:0,pending:0,inTransit:0,total:0,a0:0,a30:0,a60:0,a90:0,a180:0,pp:0,ps:0},
  {inStock:0,pending:11,inTransit:100,total:100,a0:0,a30:0,a60:0,a90:0,a180:0,pp:864,ps:100},
  {inStock:66,pending:0,inTransit:66,total:66,a0:0,a30:0,a60:0,a90:0,a180:0,pp:1834,ps:1000},
  {inStock:200,pending:50,inTransit:300,total:500,a0:150,a30:50,a60:0,a90:0,a180:0,pp:0,ps:200}
];

const rows=Array.from({length:66},(_,i)=>{
  const base=baseSkus[i%baseSkus.length];
  const q=qtyConfigs[i%qtyConfigs.length];
  return {id:i+1,...base,...q};
});

// 提取下拉选项
const allSuppliers=[...new Set(rows.map(r=>r.supplier))];
const allPlatforms=[...new Set(rows.map(r=>r.platform))];
const allStores=[...new Set(rows.map(r=>r.store))];
const allTeams=[...new Set(rows.map(r=>r.team))];
const allWarehouses=[...new Set(rows.map(r=>r.whName+'|'+r.whCode))];
const allCountries=[...new Set(rows.map(r=>r.country))];
const allWhTypes=[...new Set(rows.map(r=>r.whType))];
const allTeamLeads=[...new Set(rows.map(r=>r.teamLead))];
const allOpsLeads=[...new Set(rows.map(r=>r.opsLead))];
const stockStatusOptions=['有在库','零库存'];

const state={
  page:1,pageSize:25,selected:new Set(),filtered:[...rows],
  suppliers:[],platforms:[],stores:[],teams:[],warehouses:[],
  countries:[],whTypes:[],teamLeads:[],opsLeads:[],stockStatus:[],
  platformStoreMap:{}
};

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1600)}
function fmt(n){return n===0?'0':n.toLocaleString('zh-CN')}
function fmtPcs(n){return n===0?'0 pcs':`${n.toLocaleString('zh-CN')} pcs`}
function fmtPrice(n){return n===0?'¥ 0.00':`¥ ${n.toFixed(2)}`}
function fmtSku(row){return `<span class="thumb">${row.icon||'▤'}</span>${row.sku}`}

// 多选下拉初始化
function closeMenus(except){$$('.multi').forEach(m=>{if(m!==except){m.querySelector('[data-menu]').classList.remove('show');m.querySelector('[data-trigger]').classList.remove('open');}});}
document.addEventListener('click',()=>closeMenus());

function initMulti(rootId,items,key,placeholder){
  const root=$(rootId),trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
  const sync=()=>{
    state[key]=[...menu.querySelectorAll('input:checked')].map(x=>x.value);
    if(key==='platforms'){
      state.platformStoreMap={};
      state[key].forEach(p=>{
        const relatedStores=[...new Set(rows.filter(r=>r.platform===p).map(r=>r.store))];
        state.platformStoreMap[p]=relatedStores;
      });
    }
    trigger.textContent=state[key].length?`${state[key].slice(0,2).join('、')}${state[key].length>2?` +${state[key].length-2}`:''}`:placeholder;
    trigger.classList.toggle('has-value',!!state[key].length);
  };
  menu.innerHTML=items.map(v=>`<label><input type="checkbox" value="${v}" ${state[key].includes(v)?'checked':''}>${v}</label>`).join('');
  trigger.onclick=e=>{e.stopPropagation();closeMenus(root);menu.classList.toggle('show');trigger.classList.toggle('open',menu.classList.contains('show'));};
  menu.onclick=e=>e.stopPropagation();
  menu.onchange=sync;
  sync();
}

function splitValues(v){return [...new Set(v.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}
function includesAny(v,arr){return !arr.length||arr.some(a=>(v||'').toLowerCase().includes(a));}
function equalsAny(v,arr){return !arr.length||arr.includes(v);}

function applyFilters(showMsg=true){
  const skus=splitValues($('#skuSearch').value);
  const nameKw=($('#nameSearch').value||'').toLowerCase();
  state.filtered=rows.filter(r=>{
    if(skus.length){
      const matched=skus.some(v=>
        (r.sku||'').toLowerCase().includes(v)||
        (r.lx||'').toLowerCase().includes(v)||
        (r.seller||'').toLowerCase().includes(v)
      );
      if(!matched) return false;
    }
    if(nameKw && !(r.name||'').toLowerCase().includes(nameKw)) return false;
    if(!equalsAny(r.supplier,state.suppliers)) return false;
    if(!equalsAny(r.platform,state.platforms)) return false;
    // 店铺：如果选了平台，只在该平台的店铺中筛选；否则在全店铺列表中筛选
    if(state.platforms.length){
      const allowedStores=new Set();
      state.platforms.forEach(p=>(state.platformStoreMap[p]||[]).forEach(s=>allowedStores.add(s)));
      if(state.stores.length){
        if(!state.stores.some(s=>allowedStores.has(s))) return false;
      }
    }else{
      if(!equalsAny(r.store,state.stores)) return false;
    }
    if(!equalsAny(r.team,state.teams)) return false;
    const whKey=(r.whName||'')+'|'+(r.whCode||'');
    if(!equalsAny(whKey,state.warehouses)) return false;
    if(!equalsAny(r.country,state.countries)) return false;
    if(!equalsAny(r.whType,state.whTypes)) return false;
    if(!equalsAny(r.teamLead,state.teamLeads)) return false;
    if(!equalsAny(r.opsLead,state.opsLeads)) return false;
    if(state.stockStatus.length){
      const hasStock=state.stockStatus.includes('有在库')&&r.inStock>0;
      const zeroStock=state.stockStatus.includes('零库存')&&r.inStock===0;
      if(!hasStock&&!zeroStock) return false;
    }
    return true;
  });
  state.page=Math.min(state.page,Math.max(1,Math.ceil(state.filtered.length/state.pageSize)));
  renderTable();
  if(showMsg) toast(`查询完成，共 ${state.filtered.length} 条结果`);
}

function resetQuery(){
  Object.assign(state,{suppliers:[],platforms:[],stores:[],teams:[],warehouses:[],countries:[],whTypes:[],teamLeads:[],opsLeads:[],stockStatus:[],platformStoreMap:{},page:1,filtered:[...rows]});
  $('#skuSearch').value='';$('#nameSearch').value='';
  const multiConfigs=[
    ['#supplierMulti',allSuppliers,'suppliers','供应商（可多选）'],
    ['#platformMulti',allPlatforms,'platforms','平台（可多选）'],
    ['#storeMulti',allStores,'stores','店铺（可多选）'],
    ['#teamMulti',allTeams,'teams','团队（可多选）'],
    ['#warehouseMulti',allWarehouses,'warehouses','仓库（可多选）'],
    ['#countryMulti',allCountries,'countries','国家（可多选）'],
    ['#whTypeMulti',allWhTypes,'whTypes','仓库属性（可多选）'],
    ['#teamLeadMulti',allTeamLeads,'teamLeads','团队负责人（可多选）'],
    ['#opsLeadMulti',allOpsLeads,'opsLeads','运营负责人（可多选）'],
    ['#stockStatusMulti',stockStatusOptions,'stockStatus','在库状态']
  ];
  multiConfigs.forEach(([id,,key,placeholder])=>{
    const root=$(id);
    root.querySelectorAll('input').forEach(input=>input.checked=false);
    const trigger=root.querySelector('[data-trigger]');
    trigger.textContent=placeholder;
    trigger.classList.remove('has-value');
  });
  renderTable();
  toast('已重置查询条件');
}

function renderTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);
  $('#totalCount').textContent=total;$('#jumpPage').value=state.page;
  $('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;
  $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');
  $$('[data-page]').forEach(b=>b.onclick=()=>{state.page=Number(b.dataset.page);renderTable()});
  if(!data.length){$('#tableBody').innerHTML='<tr class="empty-row"><td colspan="28"><div class="empty-icon">◇</div>暂无符合条件的数据</td></tr>';syncSelection();return}
  $('#tableBody').innerHTML=data.map(r=>`<tr>
    <td class="col-sku sticky-col left">${fmtSku(r)}</td>
    <td>${r.lx||'—'}</td>
    <td class="left">${r.supplier}</td>
    <td class="left">${r.name}</td>
    <td>${fmtPrice(r.priceNoTax)}</td>
    <td>${fmtPrice(r.priceTax)}</td>
    <td>${r.seller||'—'}</td>
    <td>${r.platform}</td>
    <td class="left">${r.store}</td>
    <td>${r.country}</td>
    <td>${r.team}</td>
    <td>${r.teamLead}</td>
    <td>${r.opsLead}</td>
    <td>${r.whType}</td>
    <td class="left">${r.provider}</td>
    <td class="left">${r.whName}</td>
    <td>${r.whCode}</td>
    <td>${fmtPcs(r.inStock)}</td>
    <td>${fmtPcs(r.pending)}</td>
    <td>${fmtPcs(r.inTransit)}</td>
    <td>${fmtPcs(r.total)}</td>
    <td>${fmtPcs(r.a0)}</td>
    <td>${fmtPcs(r.a30)}</td>
    <td>${fmtPcs(r.a60)}</td>
    <td>${fmtPcs(r.a90)}</td>
    <td>${fmtPcs(r.a180)}</td>
    <td>${fmtPcs(r.pp)}</td>
    <td>${fmtPcs(r.ps)}</td>
  </tr>`).join('');
  syncSelection();
}

function syncSelection(){$('#selectedCount').textContent=state.selected.size}

// 查询面板交互
function initQueryExpand(){
  const panel=$('.query-panel'),button=$('#queryExpand'),arrow=button.querySelector('.query-arrow'),label=button.querySelector('.query-expand-text');
  button.onclick=()=>{
    const expanded=panel.classList.toggle('expanded');
    arrow.textContent=expanded?'⌃':'⌄';
    label.textContent=expanded?'收起':'展开';
    button.setAttribute('aria-expanded',String(expanded));
  };
}

function initResponsiveQueryLayout(){
  const panel=$('.query-panel'),rowOne=$('#queryRowOne'),rowTwo=$('#queryRowTwo'),
        advanced=$('.advanced-query-row'),actions=$('.query-actions'),
        items=$$('.query-item[data-query-order]').sort((a,b)=>Number(a.dataset.queryOrder)-Number(b.dataset.queryOrder));
  const itemWidth=item=>{
    const child=item.firstElementChild;
    return child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0;
  };
  const layout=()=>{
    const expanded=panel.classList.contains('expanded');
    items.forEach(item=>rowOne.appendChild(item));
    rowTwo.appendChild(actions);
    const available=panel.clientWidth-28,gap=10,actionWidth=actions.getBoundingClientRect().width+gap;
    let row=1,usedOne=0,usedTwo=actionWidth;
    items.forEach(item=>{
      const width=itemWidth(item),needed=width+((row===1&&usedOne)||(row===2&&usedTwo>actionWidth)?gap:0);
      if(row===1&&usedOne+needed<=available){rowOne.appendChild(item);usedOne+=needed;return;}
      row=2;
      const secondNeeded=width+(usedTwo>actionWidth?gap:0);
      if(usedTwo+secondNeeded<=available){rowTwo.insertBefore(item,actions);usedTwo+=secondNeeded;return;}
      advanced.appendChild(item);
    });
    const hasAdvanced=!!advanced.querySelector('.query-item');
    $('#queryExpand').hidden=!hasAdvanced;
    if(!hasAdvanced&&expanded){panel.classList.remove('expanded');$('#queryExpand .query-arrow').textContent='⌄';$('#queryExpand .query-expand-text').textContent='展开';}
  };
  layout();
  let timer;
  window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(layout,80)});
}

// 绑定事件
$('#searchBtn').onclick=()=>{state.page=1;applyFilters();};
$('#resetBtn').onclick=resetQuery;
$('#refreshBtn').onclick=()=>{state.filtered=[...rows];state.page=1;renderTable();toast('数据已刷新')};
$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable()};
$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable()}};
$('#nextPage').onclick=()=>{const p=Math.ceil(state.filtered.length/state.pageSize);if(state.page<p){state.page++;renderTable()}};
$('#jumpPage').onchange=e=>{const p=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(p,Math.max(1,Number(e.target.value)||1));renderTable()};

$$('#skuSearch,#nameSearch').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter'){$('#searchBtn').click()};}));
$$('.tab-btn').forEach(btn=>btn.onclick=()=>{$$('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');toast(btn.textContent.trim()+'模式')});

// 初始化
const multiConfigs=[
  ['#supplierMulti',allSuppliers,'suppliers','供应商（可多选）'],
  ['#platformMulti',allPlatforms,'platforms','平台（可多选）'],
  ['#storeMulti',allStores,'stores','店铺（可多选）'],
  ['#teamMulti',allTeams,'teams','团队（可多选）'],
  ['#warehouseMulti',allWarehouses,'warehouses','仓库（可多选）'],
  ['#countryMulti',allCountries,'countries','国家（可多选）'],
  ['#whTypeMulti',allWhTypes,'whTypes','仓库属性（可多选）'],
  ['#teamLeadMulti',allTeamLeads,'teamLeads','团队负责人（可多选）'],
  ['#opsLeadMulti',allOpsLeads,'opsLeads','运营负责人（可多选）'],
  ['#stockStatusMulti',stockStatusOptions,'stockStatus','在库状态']
];

function initPageNav(){
  $$('[data-page-nav]').forEach(item=>item.onclick=()=>{
    const page=item.dataset.pageNav;
    if(window.parent!==window){window.parent.postMessage({type:'prototype:navigate',page},'*')}
    else{window.location.href={forecast:'../demand-forecast/index.html',stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',supplierInventory:'../supplier-inventory/index.html'}[page]}
  });
}

multiConfigs.forEach(config=>initMulti(...config));
initQueryExpand();
initResponsiveQueryLayout();
initPageNav();
renderTable();
