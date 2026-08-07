const shipWarehouses=['深圳发货仓','东莞发货仓','宁波发货仓','洛杉矶海外仓'];
const destinationWarehouses=['ONT8','LAX9','FTW1','ARCCAP 洛杉矶仓','英国海外仓'];
const destinationTypes=['FBA 仓','海外仓','平台仓','客户仓'];
const firstMiles=['递四方','万邑通','云途物流','美森快船','以星快船'];
const channels=['美国海运普船','美国海运快船','空派专线','欧洲铁路','国际快递'];
const transports=['海运','空运','铁路','卡航','快递'];
const platforms=['Amazon','eBay','B2C','线下订单'];
const countries=['美国','英国','德国','日本','中国'];
const stores=['ARCCAP','Lowes_ar','arccaptain','Amazon US 旗舰店','线下订单'];
const teams=['亚马逊团队','Jasic团队','eBay团队','B端团队','公共库存'];
const creators=['Admin','张敏','李晨','王磊','系统管理员'];
const remarks=['旺季发货计划','客户项目急单','常规补货','海外仓安全库存补充','新品首批发货','等待物流商确认','测试计划，请勿操作',''];
const statuses=['待确认','待发货','运输中','已完成','已作废'];
const baseSkus=['140US260008','42101000004','XX123456-1','DD123456','EE123456','FF123456','KK123456','fan-test-sku'];
const icons=['🎒','🧰','▧','📦','🧯','🪖','🌺','🐹'];

const rows=Array.from({length:62},(_,i)=>{
  const date=String(5-(i%5)).padStart(2,'0');
  return {
    id:i+1,plan:`SHP202608${String(5-Math.floor(i/15)).padStart(2,'0')}-${i+1}`,sku:baseSkus[i%baseSkus.length],icon:icons[i%icons.length],
    status:statuses[i%statuses.length],updated:`2026-08-${date} ${String(9+(i%8)).padStart(2,'0')}:${String(10+(i%47)).padStart(2,'0')}`,creator:creators[i%creators.length],remark:remarks[i%remarks.length],
    expectedShip:`2026-08-${String(8+(i%18)).padStart(2,'0')}`,expectedArrival:`2026-09-${String(2+(i%24)).padStart(2,'0')}`,boxes:String(8+(i%36)),created:`2026-08-${date}`,updatedDate:`2026-08-${date}`,
    supplierCode:`SUP-${100000+i}`,lx:`LX${230000+i}`,seller:`SELLER-${baseSkus[i%baseSkus.length]}`,fnsku:`X00${800000+i}`,asin:`B0${900000+i}`,
    shipWarehouse:shipWarehouses[i%shipWarehouses.length],destinationWarehouse:destinationWarehouses[i%destinationWarehouses.length],destinationType:destinationTypes[i%destinationTypes.length],
    firstMile:firstMiles[i%firstMiles.length],channel:channels[i%channels.length],transport:transports[i%transports.length],platform:platforms[i%platforms.length],country:countries[i%countries.length],store:stores[i%stores.length],team:teams[i%teams.length],
    purchaseNo:`PO2026${727000+i}`,shippingOrderNo:`SO2026${81000+i}`,shipmentNo:`FBA2026${52000+i}`
  };
});

const statusDefs=[['全部',null],['待确认','待确认'],['待发货','待发货'],['运输中','运输中'],['已完成','已完成'],['已作废','已作废']];
const state={codes:[],shipWarehouses:[],destinationWarehouses:[],destinationTypes:[],firstMiles:[],channels:[],transports:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,pageSize:15,selected:new Set(),filtered:[...rows]};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function toast(text,type='success'){
  const el=$('#toast');el.textContent=text;el.classList.toggle('error',type==='error');el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),1800);
}
function closeMenus(except){$$('.multi').forEach(m=>{if(m!==except){m.querySelector('[data-menu]').classList.remove('show');m.querySelector('[data-trigger]').classList.remove('open');}});}
document.addEventListener('click',()=>closeMenus());
function initMulti(rootId,items,key,placeholder){
  const root=$(rootId),trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
  const sync=()=>{state[key]=[...menu.querySelectorAll('input:checked')].map(x=>x.value);trigger.textContent=state[key].length?`${state[key].slice(0,2).join('、')}${state[key].length>2?` +${state[key].length-2}`:''}`:placeholder;trigger.classList.toggle('has-value',!!state[key].length);};
  menu.innerHTML=items.map(v=>`<label><input type="checkbox" value="${v}" ${state[key].includes(v)?'checked':''}>${v}</label>`).join('');
  trigger.onclick=e=>{e.stopPropagation();closeMenus(root);menu.classList.toggle('show');trigger.classList.toggle('open',menu.classList.contains('show'));};menu.onclick=e=>e.stopPropagation();menu.onchange=sync;sync();
}
function addCode(raw){raw.split(/[\s,，;；]+/).map(v=>v.trim()).filter(Boolean).forEach(v=>{if(!state.codes.includes(v))state.codes.push(v);});renderCodeTags();}
function renderCodeTags(){const wrap=$('#codeTags');wrap.innerHTML=state.codes.slice(0,2).map((v,i)=>`<span class="chip" title="${v}">${v}<span class="x" data-i="${i}">×</span></span>`).join('')+(state.codes.length>2?`<span class="chip">+${state.codes.length-2}</span>`:'');wrap.querySelectorAll('.x').forEach(x=>x.onclick=e=>{e.stopPropagation();state.codes.splice(Number(x.dataset.i),1);renderCodeTags();});}
$('#codeInput').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addCode(e.target.value);e.target.value='';if(e.key==='Enter')$('#searchBtn').click();}});
$('#codeInput').addEventListener('paste',e=>{const value=e.clipboardData.getData('text');if(/[\s,，;；]/.test(value)){e.preventDefault();addCode(value);}});$('#codeBox').onclick=()=>$('#codeInput').focus();

function splitValues(value){return [...new Set(value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}
function includesAny(value,values){return !values.length||values.some(v=>(value||'').toLowerCase().includes(v));}
function equalsAny(value,values){return !values.length||values.includes(value);}
function statusCount(status){return status===null?rows.length:rows.filter(r=>r.status===status).length;}
function renderTabs(){$('#statusTabs').innerHTML=statusDefs.map(([label,key])=>`<div class="status-tab ${state.status===key?'active':''}" data-key="${key===null?'__all':key}">${label}(${statusCount(key)})</div>`).join('');$$('.status-tab').forEach(tab=>tab.onclick=()=>{state.status=tab.dataset.key==='__all'?null:tab.dataset.key;state.page=1;applyFilters(false);renderTabs();});}
function dateField(row){return $('#timeType').value==='创建时间'?row.created:$('#timeType').value==='更新时间'?row.updatedDate:$('#timeType').value==='预计发货日期'?row.expectedShip:row.expectedArrival;}
function validateDates(){const start=$('#startDate').value,end=$('#endDate').value;if((start&&!end)||(!start&&end)){toast('请选择完整的时间范围','error');return false;}if(start&&end&&start>end){toast('开始日期不能晚于结束日期','error');return false;}return true;}
function applyFilters(showMessage=true){
  if(!validateDates())return;
  const codeType=$('#codeType').value,plans=splitValues($('#planNo').value),purchaseNos=splitValues($('#purchaseNo').value),shippingOrderNos=splitValues($('#shippingOrderNo').value),shipmentNos=splitValues($('#shipmentNo').value),remark=$('#remark').value.trim().toLowerCase(),start=$('#startDate').value,end=$('#endDate').value;
  state.filtered=rows.filter(row=>{
    const codeMap={'SKU':row.sku,'供应商料号':row.supplierCode,'领星 SKU':row.lx,'SellerSKU':row.seller,'FNSKU':row.fnsku,'ASIN':row.asin};
    return (!state.codes.length||state.codes.some(code=>(codeMap[codeType]||'').toLowerCase().includes(code.toLowerCase())))&&includesAny(row.plan,plans)&&
      equalsAny(row.shipWarehouse,state.shipWarehouses)&&equalsAny(row.destinationWarehouse,state.destinationWarehouses)&&equalsAny(row.destinationType,state.destinationTypes)&&equalsAny(row.firstMile,state.firstMiles)&&equalsAny(row.channel,state.channels)&&equalsAny(row.transport,state.transports)&&
      equalsAny(row.platform,state.platforms)&&equalsAny(row.country,state.countries)&&equalsAny(row.store,state.stores)&&equalsAny(row.team,state.teams)&&equalsAny(row.creator,state.creators)&&
      (!state.status||row.status===state.status)&&(!start||dateField(row)>=start)&&(!end||dateField(row)<=end)&&(!remark||row.remark.toLowerCase().includes(remark))&&includesAny(row.purchaseNo,purchaseNos)&&includesAny(row.shippingOrderNo,shippingOrderNos)&&includesAny(row.shipmentNo,shipmentNos);
  });
  state.page=Math.min(state.page,Math.max(1,Math.ceil(state.filtered.length/state.pageSize)));renderTable();if(showMessage)toast(`查询完成，共 ${state.filtered.length} 条结果`);
}
function reset(){
  Object.assign(state,{codes:[],shipWarehouses:[],destinationWarehouses:[],destinationTypes:[],firstMiles:[],channels:[],transports:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,filtered:[...rows]});
  ['#planNo','#remark','#purchaseNo','#shippingOrderNo','#shipmentNo','#startDate','#endDate'].forEach(id=>$(id).value='');$('#codeType').value='SKU';$('#timeType').value='创建时间';
  multiConfigs.forEach(([id,,key,placeholder])=>{const root=$(id);root.querySelectorAll('input').forEach(input=>input.checked=state[key].includes(input.value));const trigger=root.querySelector('[data-trigger]');trigger.textContent=state[key].length?state[key].join('、'):placeholder;trigger.classList.toggle('has-value',!!state[key].length);});
  renderCodeTags();renderTabs();renderTable();toast('已重置查询条件');
}
function renderTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);$('#totalCount').textContent=total;$('#jumpPage').value=state.page;$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;
  $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');$$('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderTable();});
  if(!data.length){$('#tableBody').innerHTML='<tr class="empty-row"><td colspan="10"><div class="empty-icon">◇</div>暂无符合条件的数据</td></tr>';syncSelection();return;}
  $('#tableBody').innerHTML=data.map(row=>`<tr><td><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td><td>${row.plan}</td><td class="left"><span class="thumb">${row.icon}</span>${row.sku}</td><td>${row.status}</td><td>${row.updated}</td><td>${row.creator}</td><td><input class="inline-input row-remark" data-id="${row.id}" value="${row.remark}" placeholder="请输入备注"></td><td><input class="inline-input row-ship-date" data-id="${row.id}" type="date" value="${row.expectedShip}"></td><td><input class="inline-input row-arrival-date" data-id="${row.id}" type="date" value="${row.expectedArrival}"></td><td>${row.boxes}</td></tr>`).join('');
  $$('.row-check').forEach(check=>check.onchange=()=>{const id=Number(check.dataset.id);check.checked?state.selected.add(id):state.selected.delete(id);syncSelection();});$$('.row-remark').forEach(input=>input.onchange=()=>{rows.find(r=>r.id===Number(input.dataset.id)).remark=input.value;toast('备注已保存');});
  $$('.row-ship-date,.row-arrival-date').forEach(input=>input.onclick=()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}});syncSelection();
}
function syncSelection(){const visible=$$('.row-check'),checked=visible.filter(x=>x.checked).length;$('#selectedCount').textContent=state.selected.size;$('#selectAll').checked=visible.length>0&&checked===visible.length;$('#selectAll').indeterminate=checked>0&&checked<visible.length;}
$('#selectAll').onchange=e=>{$$('.row-check').forEach(check=>{check.checked=e.target.checked;const id=Number(check.dataset.id);e.target.checked?state.selected.add(id):state.selected.delete(id);});syncSelection();};
$('#searchBtn').onclick=()=>{if($('#codeInput').value.trim()){addCode($('#codeInput').value);$('#codeInput').value='';}state.page=1;applyFilters();};$('#resetBtn').onclick=reset;$('#refreshBtn').onclick=()=>{applyFilters(false);toast('数据已刷新');};
$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable();};$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};$('#nextPage').onclick=()=>{const pages=Math.ceil(state.filtered.length/state.pageSize);if(state.page<pages){state.page++;renderTable();}};$('#jumpPage').onchange=e=>{const pages=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(pages,Math.max(1,Number(e.target.value)||1));renderTable();};
$$('#planNo,#remark,#purchaseNo,#shippingOrderNo,#shipmentNo').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter')$('#searchBtn').click();}));$$('#startDate,#endDate').forEach(input=>input.addEventListener('click',()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}));
function initQueryExpand(){const panel=$('.query-panel'),button=$('#queryExpand'),arrow=button.querySelector('.query-arrow'),label=button.querySelector('.query-expand-text');button.onclick=()=>{const expanded=panel.classList.toggle('expanded');arrow.textContent=expanded?'⌃':'⌄';label.textContent=expanded?'收起':'展开';button.setAttribute('aria-expanded',String(expanded));};}
function initPageNav(){$$('[data-page-nav]').forEach(item=>item.onclick=()=>{const page=item.dataset.pageNav;if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page},'*');else window.location.href={stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html'}[page];});}
function initResponsiveQueryLayout(){
  const panel=$('.query-panel'),rowOne=$('#queryRowOne'),rowTwo=$('#queryRowTwo'),advanced=$('.advanced-query-row'),actions=$('.query-actions');
  const items=$$('.query-item[data-query-order]').sort((a,b)=>Number(a.dataset.queryOrder)-Number(b.dataset.queryOrder));
  const itemWidth=item=>{
    if(item.classList.contains('code-query')||item.classList.contains('time-query'))return [...item.children].reduce((sum,child)=>sum+(child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0),0)+10;
    const child=item.firstElementChild;return child.getBoundingClientRect().width||parseFloat(getComputedStyle(child).width)||0;
  };
  const layout=()=>{
    const expanded=panel.classList.contains('expanded');
    items.forEach(item=>rowOne.appendChild(item));rowTwo.appendChild(actions);
    const available=panel.clientWidth-28,gap=10,actionWidth=actions.getBoundingClientRect().width+gap;
    let row=1,usedOne=0,usedTwo=actionWidth;
    items.forEach(item=>{
      const width=itemWidth(item),needed=width+(row===1&&usedOne||row===2&&usedTwo>actionWidth?gap:0);
      if(row===1&&usedOne+needed<=available){rowOne.appendChild(item);usedOne+=needed;return;}
      row=2;
      const secondNeeded=width+(usedTwo>actionWidth?gap:0);
      if(usedTwo+secondNeeded<=available){rowTwo.insertBefore(item,actions);usedTwo+=secondNeeded;return;}
      advanced.appendChild(item);
    });
    const hasAdvanced=advanced.querySelector('.query-item');$('#queryExpand').hidden=!hasAdvanced;
    if(!hasAdvanced&&expanded){panel.classList.remove('expanded');$('#queryExpand .query-arrow').textContent='⌄';$('#queryExpand .query-expand-text').textContent='展开';}
  };
  layout();let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(layout,80);});
}
const multiConfigs=[
  ['#shipWarehouseMulti',shipWarehouses,'shipWarehouses','发货仓（可多选）'],['#destinationWarehouseMulti',destinationWarehouses,'destinationWarehouses','目的地仓（可多选）'],['#destinationTypeMulti',destinationTypes,'destinationTypes','目的地仓类型（可多选）'],['#firstMileMulti',firstMiles,'firstMiles','头程物流商（可多选）'],['#channelMulti',channels,'channels','物流渠道（可多选）'],['#transportMulti',transports,'transports','运输方式（可多选）'],['#platformMulti',platforms,'platforms','平台（可多选）'],['#countryMulti',countries,'countries','国家（可多选）'],['#storeMulti',stores,'stores','店铺（可多选）'],['#teamMulti',teams,'teams','团队（可多选）'],['#creatorMulti',creators,'creators','创建人（可多选）']
];
initPageNav();initQueryExpand();multiConfigs.forEach(config=>initMulti(...config));initResponsiveQueryLayout();renderTabs();renderTable();
