const baseSkus=[
  {sku:'34001001110',lx:'10410112110',supplier:'梧州市友盟焊接防护用品有限公司',name:'焊接帽子迷彩2-6 7/8',priceNoTax:17.52,priceTax:0,seller:'WeldersCap-Camouflage',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🎒'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'Amazon.Found.Best.ARC160',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧰'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'NEW-ARC160',platform:'amazon',store:'ARCCAPTAIN_MX',country:'MX',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧰'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'Amazon.Found.Best.ARC160',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:'🧰'},
  {sku:'130US160003',lx:'AR-ARC160R201201',supplier:'深圳市康仕达科技有限公司',name:'ARC160（AC-美规）',priceNoTax:283.19,priceTax:0,seller:'weldingmacharc160',platform:'amazon',store:'ARCCAPTAIN_US',country:'US',team:'亚马逊团队',teamLead:'刘辉天',opsLead:'刘辉天',whType:'自建仓',provider:'默认供应商',whName:'默认供应商',whCode:'默认供应商',icon:''},
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

const state={page:1,pageSize:25,selected:new Set(),filtered:[...rows]};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1600)}
function fmt(n){return n===0?'0':n.toLocaleString('zh-CN')}
function fmtPcs(n){return n===0?'0 pcs':`${n.toLocaleString('zh-CN')} pcs`}
function fmtPrice(n){return n===0?'¥ 0.00':`¥ ${n.toFixed(2)}`}
function fmtSku(row){return `<span class="thumb">${row.icon||'▤'}</span>${row.sku}`}

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

$('#refreshBtn').onclick=()=>{state.filtered=[...rows];state.page=1;renderTable();toast('数据已刷新')};
$('#pageSize').onchange=e=>{state.pageSize=Number(e.target.value);state.page=1;renderTable()};
$('#prevPage').onclick=()=>{if(state.page>1){state.page--;renderTable()}};
$('#nextPage').onclick=()=>{const p=Math.ceil(state.filtered.length/state.pageSize);if(state.page<p){state.page++;renderTable()}};
$('#jumpPage').onchange=e=>{const p=Math.max(1,Math.ceil(state.filtered.length/state.pageSize));state.page=Math.min(p,Math.max(1,Number(e.target.value)||1));renderTable()};

$$('.tab-btn').forEach(btn=>btn.onclick=()=>{$$('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');toast(btn.textContent.trim()+'模式')});

function initPageNav(){$$('[data-page-nav]').forEach(item=>item.onclick=()=>{const page=item.dataset.pageNav;if(window.parent!==window){window.parent.postMessage({type:'prototype:navigate',page},'*')}else{window.location.href={stock:'../stock-plan/index.html',purchase:'../purchase-plan/index.html',shipment:'../shipment-plan/index.html',purchaseOrder:'../purchase-orders/index.html',shipmentOrder:'../shipment-orders/index.html',supplierInventory:'../supplier-inventory/index.html'}[page]}})}
initPageNav();renderTable();
