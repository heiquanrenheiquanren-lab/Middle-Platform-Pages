const seedRows = [
  ['EBA20260805-1','140US260008','电焊机 140A','已完成','2026-08-05 10:22','2026-07-31','¥ 60929.1','45','🎒'],
  ['JAS20260804-2','42101000004','TIG 焊丝-不锈钢','待采购','2026-08-05 16:18','','¥ 4206.7','11(10.33)','🧰'],
  ['CST20260805-1','XX123456-1','测试产品 XX123456','待确认','2026-08-05 09:36','','¥ 240','12','▧'],
  ['GGK20260804-2','DD123456','组合产品 DD','已作废','2026-08-04 17:42','2026-09-30','¥ 0','100','▧'],
  ['GGK20260804-2-1','EE123456','组合产品子项 EE','待确认','2026-08-04 17:40','2026-09-30','¥ 3300','34(33.33)','▧'],
  ['GGK20260804-2-2','FF123456','组合产品子项 FF','待确认','2026-08-04 17:36','2026-09-30','¥ 1000','100','▧'],
  ['JAS20260804-1','KK123456','焊接配件 KK','待确认','2026-08-04 14:58','2026-08-06','¥ 0','3(2.40)','🌺'],
  ['CST20260804-3','fan-test-sku','风扇测试产品','待确认','2026-08-04 14:46','2026-08-06','¥ 0','1','🐹'],
  ['EBA20260804-2','测试sku（勿动）','测试产品','待确认','2026-08-04 14:30','2026-08-20','¥ 0','12','🐹'],
  ['GGK20260804-1','XX123456','测试组合产品','待确认','2026-08-04 14:16','2026-08-20','¥ 0','10','▧'],
  ['GGK20260804-1-1','XX123456-2','测试组合子项 2','待确认','2026-08-04 14:12','2026-08-20','¥ 200','10','▧'],
  ['GGK20260804-1-2','XX123456-1','测试组合子项 1','待确认','2026-08-04 14:08','2026-08-20','¥ 200','10','▧'],
  ['BDT20260804-1','CC123456','B 端组合产品','待确认','2026-08-04 14:02','','¥ 15000','200','🌺'],
  ['BDT20260804-1-1','AA123456','B 端子产品 A','待确认','2026-08-04 13:58','','¥ 15500','200','🌺'],
  ['BDT20260804-1-2','BB123456','B 端子产品 B','待确认','2026-08-04 13:55','','¥ 30000','400','🌺']
];

const statusPool = [
  ...Array(20).fill('待确认'),
  ...Array(8).fill('待采购'),
  ...Array(32).fill('已完成'),
  ...Array(2).fill('已作废')
];
statusPool[0]='已完成';
statusPool[28]='待确认';
const groupPlans = new Set(['GGK20260804-2','GGK20260804-1','BDT20260804-1']);
const warehouses = ['东莞采购仓','深圳采购仓','洛杉矶海外仓','休斯敦海外仓','供应商直发仓'];
const suppliers = ['JASIC 供应商','ARCCAP 供应商','华南五金','东莞焊材','测试供应商'];
const platforms = ['Amazon','eBay','B2C','线下订单'];
const countries = ['美国','英国','德国','日本','中国'];
const stores = ['ARCCAP','Lowes_ar','arccaptain','Amazon US 旗舰店','线下订单'];
const teams = ['亚马逊团队','Jasic团队','eBay团队','B端团队','公共库存'];
const creators = ['Admin','张敏','李晨','王磊','系统管理员'];
const remarks = ['旺季前置采购','客户项目急单','常规补货','海外仓安全库存补充','新品首批采购','等待供应商确认交期','测试计划，请勿操作',''];

const rows = Array.from({length:62},(_,i)=>{
  const seed = seedRows[i % seedRows.length];
  const groupIndex = Math.floor(i / seedRows.length);
  const plan = groupIndex ? seed[0].replace(/(\d+)(?=-|$)/,m=>String(Number(m)+groupIndex)) : seed[0];
  const createdDate = `2026-0${i < 36 ? 8 : 7}-${String(5-(i%5)).padStart(2,'0')}`;
  return {
    id:i+1, plan, sku:seed[1], productName:seed[2], status:statusPool[i], updated:seed[4], creator:creators[i%creators.length],
    delivery:seed[5], amount:seed[6], boxes:seed[7], icon:seed[8], remark:remarks[i%remarks.length],
    supplierCode:`SUP-${String(100000+i).padStart(6,'0')}`, lx:`LX${String(230000+i)}`, seller:`SELLER-${seed[1]}`,
    fnsku:`X00${String(800000+i)}`, asin:`B0${String(900000+i)}`, warehouse:warehouses[i%warehouses.length],
    supplier:suppliers[i%suppliers.length], platform:platforms[i%platforms.length], country:countries[i%countries.length],
    store:stores[i%stores.length], team:teams[i%teams.length], created:createdDate, updatedDate:seed[4].slice(0,10),
    planDelivery:seed[5] || `2026-08-${String(10+(i%18)).padStart(2,'0')}`, planOrder:`2026-07-${String(10+(i%18)).padStart(2,'0')}`,
    purchaseNo:`PO2026${String(727000+i).padStart(6,'0')}`, shipmentNo:i%3===0?`SH2026${String(81000+i).padStart(5,'0')}`:'待执行',
    isChild:/-\d+-[12]$/.test(seed[0]), isGroup:groupPlans.has(seed[0])
  };
});

const statusDefs = [['全部',null],['待确认','待确认'],['待采购','待采购'],['已完成','已完成'],['已作废','已作废']];
const state = {codes:[],warehouses:[],suppliers:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,pageSize:15,selected:new Set(),filtered:[...rows]};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(text,type='success'){
  const el=$('#toast');
  el.textContent=text;
  el.classList.toggle('error',type==='error');
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>el.classList.remove('show'),1800);
}

function closeMenus(except){
  $$('.multi').forEach(m=>{
    if(m!==except){
      m.querySelector('[data-menu]').classList.remove('show');
      m.querySelector('[data-trigger]').classList.remove('open');
    }
  });
}
document.addEventListener('click',()=>closeMenus());

function initMulti(rootId,items,key,placeholder){
  const root=$(rootId),trigger=root.querySelector('[data-trigger]'),menu=root.querySelector('[data-menu]');
  const sync=()=>{
    state[key]=[...menu.querySelectorAll('input:checked')].map(x=>x.value);
    trigger.textContent=state[key].length?`${state[key].slice(0,2).join('、')}${state[key].length>2?` +${state[key].length-2}`:''}`:placeholder;
    trigger.classList.toggle('has-value',!!state[key].length);
  };
  menu.innerHTML=items.map(v=>`<label><input type="checkbox" value="${v}" ${state[key].includes(v)?'checked':''}>${v}</label>`).join('');
  trigger.onclick=e=>{e.stopPropagation();closeMenus(root);menu.classList.toggle('show');trigger.classList.toggle('open',menu.classList.contains('show'));};
  menu.onclick=e=>e.stopPropagation();
  menu.onchange=sync;
  sync();
}

function addCode(raw){
  raw.split(/[\s,，;；]+/).map(v=>v.trim()).filter(Boolean).forEach(v=>{if(!state.codes.includes(v))state.codes.push(v);});
  renderCodeTags();
}
function renderCodeTags(){
  const wrap=$('#codeTags');
  wrap.innerHTML=state.codes.slice(0,2).map((v,i)=>`<span class="chip" title="${v}">${v}<span class="x" data-i="${i}">×</span></span>`).join('')+(state.codes.length>2?`<span class="chip">+${state.codes.length-2}</span>`:'');
  wrap.querySelectorAll('.x').forEach(x=>x.onclick=e=>{e.stopPropagation();state.codes.splice(Number(x.dataset.i),1);renderCodeTags();});
}
$('#codeInput').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addCode(e.target.value);e.target.value='';if(e.key==='Enter')$('#searchBtn').click();}});
$('#codeInput').addEventListener('paste',e=>{const text=e.clipboardData.getData('text');if(/[\s,，;；]/.test(text)){e.preventDefault();addCode(text);}});
$('#codeBox').onclick=()=>$('#codeInput').focus();

function splitValues(value){return [...new Set(value.trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];}
function statusCount(status){return status===null?rows.length:rows.filter(r=>r.status===status).length;}
function renderTabs(){
  $('#statusTabs').innerHTML=statusDefs.map(([label,key])=>`<div class="status-tab ${state.status===key?'active':''}" data-key="${key===null?'__all':key}">${label}(${statusCount(key)})</div>`).join('');
  $$('.status-tab').forEach(tab=>tab.onclick=()=>{state.status=tab.dataset.key==='__all'?null:tab.dataset.key;state.page=1;applyFilters(false);renderTabs();});
}
function dateField(row){
  return $('#timeType').value==='创建时间'?row.created:
    $('#timeType').value==='更新时间'?row.updatedDate:
    $('#timeType').value==='计划交货日期'?row.planDelivery:row.planOrder;
}
function includesAny(value,values){return !values.length||values.some(v=>(value||'').toLowerCase().includes(v));}
function equalsAny(value,values){return !values.length||values.some(v=>(value||'').toLowerCase()===v.toLowerCase());}

function validateDates(){
  const start=$('#startDate').value,end=$('#endDate').value;
  if((start&&!end)||(!start&&end)){toast('请选择完整的时间范围','error');return false;}
  if(start&&end&&start>end){toast('开始日期不能晚于结束日期','error');return false;}
  return true;
}
function applyFilters(showMessage=true){
  if(!validateDates())return;
  const codeType=$('#codeType').value;
  const plans=splitValues($('#planNo').value),purchaseNos=splitValues($('#purchaseNo').value),shipmentNos=splitValues($('#shipmentNo').value);
  const name=$('#productName').value.trim().toLowerCase(),remark=$('#remark').value.trim().toLowerCase();
  const start=$('#startDate').value,end=$('#endDate').value;
  state.filtered=rows.filter(row=>{
    const codeMap={'SKU':row.sku,'供应商料号':row.supplierCode,'领星 SKU':row.lx,'SellerSKU':row.seller,'FNSKU':row.fnsku,'ASIN':row.asin};
    const codeOk=!state.codes.length||state.codes.some(code=>(codeMap[codeType]||'').toLowerCase().includes(code.toLowerCase()));
    return codeOk&&includesAny(row.plan,plans)&&includesAny(row.purchaseNo,purchaseNos)&&includesAny(row.shipmentNo,shipmentNos)&&
      (!name||row.productName.toLowerCase().includes(name))&&(!remark||row.remark.toLowerCase().includes(remark))&&
      equalsAny(row.warehouse,state.warehouses)&&equalsAny(row.supplier,state.suppliers)&&equalsAny(row.platform,state.platforms)&&
      equalsAny(row.country,state.countries)&&equalsAny(row.store,state.stores)&&equalsAny(row.team,state.teams)&&
      equalsAny(row.creator,state.creators)&&(!state.status||row.status===state.status)&&
      (!start||dateField(row)>=start)&&(!end||dateField(row)<=end);
  });
  state.page=Math.min(state.page,Math.max(1,Math.ceil(state.filtered.length/state.pageSize)));
  renderTable();
  if(showMessage)toast(`查询完成，共 ${state.filtered.length} 条结果`);
}

function reset(){
  Object.assign(state,{codes:[],warehouses:[],suppliers:[],platforms:[],countries:[],stores:[],teams:[],creators:['Admin'],status:null,page:1,filtered:[...rows]});
  ['#planNo','#productName','#purchaseNo','#shipmentNo','#remark','#startDate','#endDate'].forEach(id=>$(id).value='');
  $('#codeType').value='SKU';$('#timeType').value='创建时间';
  const configs=[
    ['#warehouseMulti','warehouses','采购仓（可多选）'],['#supplierMulti','suppliers','供应商（可多选）'],
    ['#platformMulti','platforms','平台（可多选）'],['#countryMulti','countries','国家（可多选）'],
    ['#storeMulti','stores','店铺（可多选）'],['#teamMulti','teams','团队（可多选）'],['#creatorMulti','creators','创建人（可多选）']
  ];
  configs.forEach(([id,key,placeholder])=>{
    const root=$(id),menu=root.querySelector('[data-menu]');
    menu.querySelectorAll('input').forEach(input=>input.checked=state[key].includes(input.value));
    const trigger=root.querySelector('[data-trigger]');
    trigger.textContent=state[key].length?state[key].join('、'):placeholder;
    trigger.classList.toggle('has-value',!!state[key].length);
  });
  renderCodeTags();renderTabs();renderTable();toast('已重置查询条件');
}

function renderTable(){
  const total=state.filtered.length,pages=Math.max(1,Math.ceil(total/state.pageSize)),start=(state.page-1)*state.pageSize,data=state.filtered.slice(start,start+state.pageSize);
  $('#totalCount').textContent=total;$('#jumpPage').value=state.page;$('#prevPage').disabled=state.page<=1;$('#nextPage').disabled=state.page>=pages;
  $('#pageButtons').innerHTML=Array.from({length:pages},(_,i)=>`<button class="page-btn ${state.page===i+1?'current':''}" data-page="${i+1}">${i+1}</button>`).join('');
  $$('[data-page]').forEach(button=>button.onclick=()=>{state.page=Number(button.dataset.page);renderTable();});
  if(!data.length){$('#tableBody').innerHTML='<tr class="empty-row"><td colspan="10"><div class="empty-icon">◇</div>暂无符合条件的数据</td></tr>';syncSelection();return;}
  $('#tableBody').innerHTML=data.map(row=>{
    const statusCell=row.id===1?`<div class="status-detail"><span>采购单号：${row.purchaseNo}</span><span>发货单号：${row.shipmentNo}</span></div>`:row.status;
    const alertBox=row.boxes.includes('(')?'box-alert':'';
    return `<tr class="${row.isChild?'child-row':''}">
      <td><input class="row-check" type="checkbox" data-id="${row.id}" ${state.selected.has(row.id)?'checked':''}></td>
      <td>${row.isGroup?'<span class="expand">⌄</span>':row.isChild?'<span class="expand"></span>':''}${row.plan}</td>
      <td class="left"><span class="thumb">${row.icon}</span>${row.sku}${row.sku.includes('123456')?'<span class="cube">♧</span>':''}</td>
      <td>${statusCell}</td><td>${row.updated}</td><td>${row.creator}</td>
      <td><input class="inline-input row-remark" data-id="${row.id}" value="${row.remark}" placeholder="请输入备注"></td>
      <td><input class="inline-input row-date" data-id="${row.id}" type="date" value="${row.delivery}"></td>
      <td><span class="amount-lock">♙</span>${row.amount}</td><td class="${alertBox}">${row.boxes}</td>
    </tr>`;
  }).join('');
  $$('.row-check').forEach(check=>check.onchange=()=>{const id=Number(check.dataset.id);check.checked?state.selected.add(id):state.selected.delete(id);syncSelection();});
  $$('.row-remark').forEach(input=>input.onchange=()=>{rows.find(row=>row.id===Number(input.dataset.id)).remark=input.value;toast('备注已保存');});
  $$('.row-date').forEach(input=>{input.onclick=()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}};input.onchange=()=>{rows.find(row=>row.id===Number(input.dataset.id)).delivery=input.value;toast('计划交货日期已更新');};});
  syncSelection();
}
function syncSelection(){
  const visible=$$('.row-check'),checked=visible.filter(x=>x.checked).length;
  $('#selectedCount').textContent=state.selected.size;
  $('#selectAll').checked=visible.length>0&&checked===visible.length;
  $('#selectAll').indeterminate=checked>0&&checked<visible.length;
}

$('#selectAll').onchange=e=>{$$('.row-check').forEach(check=>{check.checked=e.target.checked;const id=Number(check.dataset.id);e.target.checked?state.selected.add(id):state.selected.delete(id);});syncSelection();};
$('#searchBtn').onclick=()=>{if($('#codeInput').value.trim()){addCode($('#codeInput').value);$('#codeInput').value='';}state.page=1;applyFilters();};
$('#resetBtn').onclick=reset;
$('#refreshBtn').onclick=()=>{applyFilters(false);toast('数据已刷新');};
$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable();};
$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable();}};
$('#nextPage').onclick=()=>{const pages=Math.ceil(state.filtered.length/state.pageSize);if(state.page<pages){state.page++;renderTable();}};
$('#jumpPage').onchange=e=>{const pages=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(pages,Math.max(1,Number(e.target.value)||1));renderTable();};
$$('#planNo, #productName, #purchaseNo, #shipmentNo, #remark').forEach(input=>input.addEventListener('keydown',e=>{if(e.key==='Enter')$('#searchBtn').click();}));
$$('#startDate, #endDate').forEach(input=>input.addEventListener('click',()=>{if(typeof input.showPicker==='function'){try{input.showPicker();}catch{}}}));

function initQueryExpand(){
  const panel=$('.query-panel'),button=$('#queryExpand'),arrow=button.querySelector('.query-arrow'),label=button.querySelector('.query-expand-text');
  button.onclick=()=>{
    const expanded=panel.classList.toggle('expanded');
    arrow.textContent=expanded?'⌃':'⌄';label.textContent=expanded?'收起':'展开';button.setAttribute('aria-expanded',String(expanded));
  };
}
function initPageNav(){
  $$('[data-page-nav]').forEach(item=>item.onclick=()=>{
    const page=item.dataset.pageNav;
    if(window.parent!==window)window.parent.postMessage({type:'prototype:navigate',page},'*');
    else window.location.href={stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html'}[page];
  });
}

initPageNav();initQueryExpand();
initMulti('#warehouseMulti',warehouses,'warehouses','采购仓（可多选）');
initMulti('#supplierMulti',suppliers,'suppliers','供应商（可多选）');
initMulti('#platformMulti',platforms,'platforms','平台（可多选）');
initMulti('#countryMulti',countries,'countries','国家（可多选）');
initMulti('#storeMulti',stores,'stores','店铺（可多选）');
initMulti('#teamMulti',teams,'teams','团队（可多选）');
initMulti('#creatorMulti',creators,'creators','创建人（可多选）');
renderTabs();renderTable();
