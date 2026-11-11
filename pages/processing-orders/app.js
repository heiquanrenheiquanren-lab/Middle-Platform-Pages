(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = value => Number(value || 0).toFixed(2);
  const money = value => '¥' + num(value);
  const now = () => '2026-10-08 15:30';
  const CURRENT_USER = 'Admin';
  const split = value => [...new Set(String(value || '').trim().toLowerCase().split(/[\s,，;；]+/).filter(Boolean))];

  // 子件库存按「仓库 → 团队 → SKU」维护，切换团队后可用库存随之变化。
  const stock = {
    '深圳市华英科技有限公司（SU00001）': {
      'eBay': {
        '140US260008': {name:'CUT55 ProLux',available:30,unitCost:1080},
        '34101000012': {name:'长款手套',available:20,unitCost:18.5},
        'B2001000040': {name:'手持面罩 + 渣锤 + 塑料套',available:30,unitCost:22.6},
        '34001001110-A': {name:'焊接帽子迷彩',available:10,unitCost:31.5}
      },
      '亚马逊团队': {
        '140US260008': {name:'CUT55 ProLux',available:12,unitCost:1080},
        '34101000012': {name:'长款手套',available:33,unitCost:18.5},
        'B2001000040': {name:'手持面罩 + 渣锤 + 塑料套',available:8,unitCost:22.6},
        '34001001110-A': {name:'焊接帽子迷彩',available:52,unitCost:31.5}
      },
      'B端团队': {
        '140US260008': {name:'CUT55 ProLux',available:5,unitCost:1080},
        '34101000012': {name:'长款手套',available:15,unitCost:18.5},
        'B2001000040': {name:'手持面罩 + 渣锤 + 塑料套',available:6,unitCost:22.6},
        '34001001110-A': {name:'焊接帽子迷彩',available:8,unitCost:31.5}
      }
    },
    '梧州供应商仓': {
      '亚马逊团队': {
        '34001001110-A': {name:'焊接帽子迷彩',available:52,unitCost:31.5},
        '34101000012': {name:'长款手套',available:31,unitCost:18.4}
      },
      'eBay': {
        '34001001110-A': {name:'焊接帽子迷彩',available:18,unitCost:31.5},
        '34101000012': {name:'长款手套',available:12,unitCost:18.4}
      }
    },
    '常州供应商仓': {
      'B端团队': {
        '51001010025-A': {name:'小屏焊帽主体',available:22,unitCost:82},
        '51001010025-B': {name:'基础面罩配件',available:31,unitCost:6.8}
      },
      '公共库存': {
        '51001010025-A': {name:'小屏焊帽主体',available:8,unitCost:82},
        '51001010025-B': {name:'基础面罩配件',available:10,unitCost:6.8}
      }
    }
  };

  // 组合 SKU 只维护 BOM 子件与配比；团队和库存由加工单行内选择。
  const bundles = [
    {id:'EBAY-B20US007109',warehouse:'深圳市华英科技有限公司（SU00001）',finishedSku:'B20US007109',finishedName:'ProLux + 长手套 + 防护面罩组合',components:[
      {sku:'140US260008',ratio:1},
      {sku:'34101000012',ratio:1},
      {sku:'B2001000040',ratio:1}
    ]},
    {id:'SZ-34001001110',warehouse:'深圳市华英科技有限公司（SU00001）',finishedSku:'34001001110',finishedName:'焊接帽子迷彩组合套装',components:[
      {sku:'34001001110-A',ratio:1},
      {sku:'34101000012',ratio:1}
    ]},
    {id:'AMZ-34001001110',warehouse:'梧州供应商仓',finishedSku:'34001001110',finishedName:'焊接帽子迷彩组合套装',components:[
      {sku:'34001001110-A',ratio:1},
      {sku:'34101000012',ratio:1}
    ]},
    {id:'B2B-51001010025',warehouse:'常州供应商仓',finishedSku:'51001010025',finishedName:'小屏焊帽基础组合',components:[
      {sku:'51001010025-A',ratio:1},
      {sku:'51001010025-B',ratio:2}
    ]}
  ];

  // 一张加工单可包含多个组合 SKU（可跨团队），每个组合单独维护团队、加工数量与加工费。
  const records = [
    {orderNo:'PT2608290003',createdAt:'2026-08-29 09:32:01',warehouse:'深圳市华英科技有限公司（SU00001）',operator:'Admin',remark:'仓库已完成组合装箱',items:[
      {bundleId:'EBAY-B20US007109',team:'eBay',finishedSku:'B20US007109',finishedName:'ProLux + 长手套 + 防护面罩组合',processQty:5,processingFee:50,components:[
        {sku:'140US260008',name:'CUT55 ProLux',ratio:1,qty:5,unitCost:1080},
        {sku:'34101000012',name:'长款手套',ratio:1,qty:5,unitCost:18.5},
        {sku:'B2001000040',name:'手持面罩 + 渣锤 + 塑料套',ratio:1,qty:5,unitCost:22.6}
      ]},
      {bundleId:'SZ-34001001110',team:'亚马逊团队',finishedSku:'34001001110',finishedName:'焊接帽子迷彩组合套装',processQty:3,processingFee:30,components:[
        {sku:'34001001110-A',name:'焊接帽子迷彩',ratio:1,qty:3,unitCost:31.5},
        {sku:'34101000012',name:'长款手套',ratio:1,qty:3,unitCost:18.5}
      ]}
    ]},
    {orderNo:'PT2608280021',createdAt:'2026-08-28 16:08:12',warehouse:'梧州供应商仓',operator:'林晓',remark:'',items:[
      {bundleId:'AMZ-34001001110',team:'亚马逊团队',finishedSku:'34001001110',finishedName:'焊接帽子迷彩组合套装',processQty:12,processingFee:60,components:[
        {sku:'34001001110-A',name:'焊接帽子迷彩',ratio:1,qty:12,unitCost:31.5},
        {sku:'34101000012',name:'长款手套',ratio:1,qty:12,unitCost:18.4}
      ]}
    ]},
    {orderNo:'PT2608270016',createdAt:'2026-08-27 14:19:04',warehouse:'常州供应商仓',operator:'周宁',reversedAt:'2026-08-28 10:08:12',reversedBy:'郑豪阳',reverseMemo:'仓库反馈实际只完成 4 套，原单冲销后重新补录',items:[
      {bundleId:'B2B-51001010025',team:'B端团队',finishedSku:'51001010025',finishedName:'小屏焊帽基础组合',processQty:6,processingFee:30,components:[
        {sku:'51001010025-A',name:'小屏焊帽主体',ratio:1,qty:6,unitCost:82},
        {sku:'51001010025-B',name:'基础面罩配件',ratio:2,qty:12,unitCost:6.8}
      ]}
    ]}
  ];

  records.forEach(row => {
    row.items.forEach(item => { item.reversedQty = Number(item.reversedQty || 0); });
    if(row.reversedAt) row.items.forEach(item => { item.reversedQty = Number(item.processQty || 0); item.reversedAt = row.reversedAt; item.reversedBy = row.reversedBy; item.reverseMemo = row.reverseMemo; });
    row.logs = [{type:'新增',content:`创建加工单 ${row.orderNo}`,operator:row.operator,time:row.createdAt}];
    if(row.reversedAt) row.logs.unshift({type:'取消',content:`冲销组合 SKU：${row.items.map(item => `${item.finishedSku} × ${item.processQty} 件`).join('、')}；原因：${row.reverseMemo || '—'}`,operator:row.reversedBy || row.operator,time:row.reversedAt});
  });

  const warehouses = Object.keys(stock);
  const teams = [...new Set(records.flatMap(row => (row.items || []).map(item => item.team)))];
  const operators = [...new Set(records.map(row => row.operator))];
  const state = {page:1,pageSize:10,warehouses:[],teams:[],operators:[],reverseStatus:'',queryExpanded:false,draft:null};

  const stockOf = (warehouse,team,sku) => ((stock[warehouse] || {})[team] || {})[sku];
  const availableOf = (warehouse,team,sku) => Number(stockOf(warehouse,team,sku)?.available || 0);
  const costOf = (warehouse,team,sku) => Number(stockOf(warehouse,team,sku)?.unitCost || 0);
  const nameOf = (warehouse,team,sku) => stockOf(warehouse,team,sku)?.name || sku;
  const teamsFor = warehouse => Object.keys(stock[warehouse] || {});
  const bundleById = id => bundles.find(bundle => bundle.id === id);

  const finishedStock = {};
  function addFinishedStock(warehouse,team,sku,qty){
    if(!warehouse || !team || !sku) return;
    finishedStock[warehouse] = finishedStock[warehouse] || {};
    finishedStock[warehouse][team] = finishedStock[warehouse][team] || {};
    finishedStock[warehouse][team][sku] = Math.max(0,Number(finishedStock[warehouse][team][sku] || 0) + Number(qty || 0));
  }
  const finishedStockOf = (warehouse,team,sku) => Number((finishedStock[warehouse] || {})[team]?.[sku] || 0);
  records.forEach(row => row.items.forEach(item => {
    const remaining = Number(item.processQty || 0) - Number(item.reversedQty || 0);
    if(remaining > 0) addFinishedStock(row.warehouse,item.team,item.finishedSku,remaining);
  }));

  const itemMaterial = item => (item.components || []).reduce((sum,component) => sum + Number(component.qty || 0) * Number(component.unitCost || 0),0);
  const itemTotal = item => itemMaterial(item) + Number(item.processingFee || 0);
  const rowQty = row => (row.items || []).reduce((sum,item) => sum + Number(item.processQty || 0),0);
  const rowMaterial = row => (row.items || []).reduce((sum,item) => sum + itemMaterial(item),0);
  const rowFee = row => (row.items || []).reduce((sum,item) => sum + Number(item.processingFee || 0),0);
  const rowTotal = row => rowMaterial(row) + rowFee(row);
  const rowUnitCost = row => rowQty(row) ? rowTotal(row) / rowQty(row) : 0;
  const rowTeams = row => [...new Set((row.items || []).map(item => item.team))];
  const rowSkus = row => (row.items || []).map(item => item.finishedSku);

  function bundleMax(bundle,team,draft){
    const others = (draft.items || []).filter(item => item.bundleId !== bundle.id && item.team === team);
    const max = Math.min(...bundle.components.map(component => {
      const used = others.reduce((sum,item) => {
        const otherBundle = bundleById(item.bundleId);
        const otherComponent = otherBundle && otherBundle.components.find(entry => entry.sku === component.sku);
        return sum + (otherComponent ? Number(item.processQty || 0) * otherComponent.ratio : 0);
      },0);
      return Math.floor((availableOf(bundle.warehouse,team,component.sku) - used) / component.ratio);
    }));
    return Math.max(0,max);
  }

  function toast(message){
    const node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('show'),2200);
  }

  function nextNo(){
    const day = now().slice(0,10).replaceAll('-','').slice(2);
    const max = records.filter(row => row.orderNo.startsWith('PT' + day)).reduce((value,row) => Math.max(value,Number(row.orderNo.slice(-4)) || 0),0);
    return 'PT' + day + String(max + 1).padStart(4,'0');
  }

  function queryMulti(rootId,options,key,placeholder){
    const root = $(rootId),menu = $('[data-menu]',root),trigger = $('[data-trigger]',root);
    menu.innerHTML = options.map(value => `<label><input type="checkbox" value="${escapeHtml(value)}" ${state[key].includes(value) ? 'checked' : ''}> <span>${escapeHtml(value)}</span></label>`).join('');
    const sync = () => {
      state[key] = $$('input:checked',menu).map(input => input.value);
      trigger.textContent = state[key].length ? `${state[key].slice(0,2).join('、')}${state[key].length > 2 ? ` +${state[key].length - 2}` : ''}` : placeholder;
      root.classList.toggle('has-value',state[key].length > 0);
    };
    trigger.onclick = event => { event.stopPropagation(); $$('.multi .dropdown.show').forEach(node => { if(node !== menu) node.classList.remove('show'); }); menu.classList.toggle('show'); };
    menu.onclick = event => event.stopPropagation();
    menu.onchange = () => { sync(); menu.classList.remove('show'); };
    sync();
    if(!root.dataset.outsideBound){ root.dataset.outsideBound = '1'; document.addEventListener('click',event => { if(!root.contains(event.target)) menu.classList.remove('show'); }); }
  }

  function setupMultis(){
    queryMulti('#warehouseMulti',warehouses,'warehouses','请选择仓库');
    queryMulti('#teamMulti',teams,'teams','请选择团队');
    queryMulti('#operatorMulti',operators,'operators','请选择创建人');
  }

  function filtered(){
    const orderNos = split($('#orderNoInput').value);
    const skus = split($('#skuInput').value);
    const names = split($('#finishedNameInput').value);
    const start = $('#startDate').value,end = $('#endDate').value;
    const matchesOrderNo = row => !orderNos.length || orderNos.some(value => String(row.orderNo || '').toLowerCase().includes(value));
    const matchesSku = row => !skus.length || skus.some(value => (row.items || []).some(item => String(item.finishedSku || '').toLowerCase().includes(value) || (item.components || []).some(component => String(component.sku || '').toLowerCase().includes(value))));
    const matchesName = row => !names.length || names.some(value => (row.items || []).some(item => String(item.finishedName || '').toLowerCase().includes(value)));
    const hasReversed = row => (row.items || []).some(item => Number(item.reversedQty || 0) > 0);
    const isFullyReversed = row => (row.items || []).length > 0 && (row.items || []).every(item => Number(item.reversedQty || 0) >= Number(item.processQty || 0));
    const matchesReverseStatus = row => {
      if(!state.reverseStatus) return true;
      if(state.reverseStatus === 'none') return !hasReversed(row);
      if(state.reverseStatus === 'full') return isFullyReversed(row);
      return hasReversed(row) && !isFullyReversed(row);
    };
    return records.filter(row => matchesOrderNo(row)
      && matchesSku(row)
      && matchesName(row)
      && matchesReverseStatus(row)
      && (!state.warehouses.length || state.warehouses.includes(row.warehouse))
      && (!state.teams.length || rowTeams(row).some(team => state.teams.includes(team)))
      && (!state.operators.length || state.operators.includes(row.operator))
      && (!start || String(row.createdAt || '').slice(0,10) >= start)
      && (!end || String(row.createdAt || '').slice(0,10) <= end));
  }

  const stripActions = row => {
    const items = [['log','日志']];
    if((row.items || []).some(item => Number(item.processQty || 0) - Number(item.reversedQty || 0) > 0)) items.push(['reverse','冲销']);
    return items;
  };

  const detailComboTitles = ['组合 SKU','品名','团队','加工数量','加工费'];
  const detailChildTitles = ['子件 SKU','子件名称','单位配比','本单耗用','单位成本'];
  const detailTitles = [...detailComboTitles,...detailChildTitles];
  const detailCols = ['13%','16%','8%','7%','8%','11%','18%','6%','7%','6%'];
  const detailColgroup = `<colgroup>${detailCols.map(width => `<col style="width:${width}">`).join('')}</colgroup>`;
  const modalDetailTitles = [...detailTitles,'操作'];
  const modalDetailCols = ['12%','14%','8%','7%','7%','10%','15%','6%','7%','7%','7%'];
  const modalDetailColgroup = `<colgroup>${modalDetailCols.map(width => `<col style="width:${width}">`).join('')}</colgroup>`;
  const detailHead = () => `<tr class="po-shared-head"><td colspan="11"><table class="detail-table detail-head-table">${detailColgroup}<thead><tr><th class="combo-head">${detailComboTitles[0]}</th>${detailComboTitles.slice(1).map(title => `<th>${title}</th>`).join('')}${detailChildTitles.map(title => `<th>${title}</th>`).join('')}</tr></thead></table></td></tr>`;

  function detailItemRows(row,item,{showAction = false} = {}){
    const components = item.components || [];
    const rowspan = Math.max(1,components.length);
    const total = Number(item.processQty || 0);
    const reversedQty = Number(item.reversedQty || 0);
    const remaining = Math.max(0,total - reversedQty);
    const reversedTag = total > 0 && reversedQty >= total
      ? '<span class="combo-reversed">已冲销</span>'
      : reversedQty > 0 ? `<span class="combo-partial" title="已冲销 ${reversedQty}/${total}">部分冲销</span>` : '';
    const combo = `<td class="combo-cell combo-sku" rowspan="${rowspan}"><label class="combo-sku-label"><span class="combo-sku-code">${escapeHtml(item.finishedSku)}</span>${reversedTag}</label></td><td class="combo-cell" rowspan="${rowspan}" title="${escapeHtml(item.finishedName)}">${escapeHtml(item.finishedName)}</td><td class="combo-cell" rowspan="${rowspan}">${escapeHtml(item.team)}</td><td class="combo-cell" rowspan="${rowspan}">${item.processQty} 件</td><td class="combo-cell" rowspan="${rowspan}">${money(item.processingFee)}</td>`;
    const actionCell = showAction ? `<td class="combo-cell combo-action" rowspan="${rowspan}">${remaining > 0 ? `<button class="reverse-link" type="button" data-reverse-item="${item.bundleId}">冲销</button>` : '—'}</td>` : '';
    if(!components.length) return `<tr class="detail-item-start">${combo}<td colspan="5"></td>${showAction ? actionCell : ''}</tr>`;
    return components.map((component,index) => `<tr${index === 0 ? ' class="detail-item-start"' : ''}>${index === 0 ? combo : ''}<td>${escapeHtml(component.sku)}</td><td class="left">${escapeHtml(component.name)}</td><td>${component.ratio}</td><td>${component.qty}</td><td>${num(component.unitCost)}</td>${index === 0 ? actionCell : ''}</tr>`).join('');
  }

  function detailRows(row){
    return row.items.map(item => detailItemRows(row,item)).join('');
  }

  function stripRow(row){
    return `<tr class="po-strip-row" data-id="${row.orderNo}"><td colspan="11"><div class="po-strip"><span class="po-strip__pin"><span class="po-strip__no"><a class="strip-no">${row.orderNo}</a><span class="po-tag po-tag-done">已加工</span></span></span><span class="po-strip__field po-strip__warehouse" title="${escapeHtml(row.warehouse)}"><em>仓库</em><span>${escapeHtml(row.warehouse)}</span></span><span class="po-strip__field po-strip__num"><em>加工数量</em><b>${rowQty(row)} 件</b></span><span class="po-strip__field po-strip__remark"><em>备注</em><span class="po-strip__remark-text" title="${escapeHtml(row.remark || '暂无备注')}">${escapeHtml(row.remark || '—')}</span><button class="po-strip__remark-edit" type="button" data-remark-edit="${row.orderNo}" aria-label="编辑加工单 ${row.orderNo} 的备注"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.9 2.1a1.5 1.5 0 0 1 2.1 2.1l-7.7 7.7-2.8.7.7-2.8 7.7-7.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path><path d="m9.8 3.2 3 3" fill="none" stroke="currentColor" stroke-width="1.3"></path></svg></button></span><span class="po-strip__field"><em>创建人</em><span>${escapeHtml(row.operator)}</span></span><span class="po-strip__field"><em>创建时间</em><span>${escapeHtml(row.createdAt)}</span></span><span class="po-strip__ops"><button class="po-strip__trigger" type="button" data-strip-menu="${row.orderNo}" aria-haspopup="true">操作 ⌄</button></span></div></td></tr><tr class="po-detail-row" data-parent-id="${row.orderNo}"><td colspan="11"><div class="detail-panel"><div class="detail-scroll"><table class="detail-table">${detailColgroup}<tbody>${detailRows(row)}</tbody></table></div></div></td></tr>`;
  }

  function render(){
    const rows = filtered();
    const pages = Math.max(1,Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page,pages);
    const pageRows = rows.slice((state.page - 1) * state.pageSize,state.page * state.pageSize);
    $('#tableBody').innerHTML = pageRows.length ? detailHead() + pageRows.map(stripRow).join('') : '';
    $('#empty').hidden = Boolean(pageRows.length);
    $('#totalCount').textContent = rows.length;
    const skuCount = new Set(rows.flatMap(row => rowSkus(row))).size;
    const totalQty = rows.reduce((sum,row) => sum + rowQty(row),0);
    $('#processingSummary').innerHTML = `共 <b>${rows.length}</b> 张 · <b>${skuCount}</b> 个成品 SKU · 加工 <b>${totalQty}</b> 件`;
    $('#pageButtons').innerHTML = Array.from({length:pages},(_,i) => `<button class="page-btn ${state.page === i + 1 ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`).join('');
    $('#prevPage').disabled = state.page <= 1;
    $('#nextPage').disabled = state.page >= pages;
    $$('[data-page]').forEach(button => button.onclick = () => { state.page = Number(button.dataset.page); render(); });
    $$('.strip-no').forEach(link => link.onclick = () => { const row = records.find(item => item.orderNo === link.closest('.po-strip-row').dataset.id); if(row) openDetail(row); });
    $$('[data-strip-menu]').forEach(button => button.onclick = event => { event.stopPropagation(); toggleStripMenu(button); });
    $$('[data-remark-edit]').forEach(button => button.onclick = event => {
      event.stopPropagation();
      const row = records.find(item => item.orderNo === button.dataset.remarkEdit);
      if(row) openRemarkEditor(button,row);
    });
  }

  let stripMenuLayer = null;
  function closeStripMenu(){ if(stripMenuLayer){ stripMenuLayer.remove(); stripMenuLayer = null; } }
  function toggleStripMenu(trigger){
    if(stripMenuLayer){ closeStripMenu(); return; }
    const row = records.find(item => item.orderNo === trigger.dataset.stripMenu);
    if(!row) return;
    const menu = document.createElement('div');
    menu.className = 'po-strip__menu po-strip__menu--float show';
    menu.innerHTML = stripActions(row).map(([action,label]) => `<button type="button" ${action === 'reverse' ? 'class="danger-menu-item"' : ''} data-action="${action}">${label}</button>`).join('');
    document.body.appendChild(menu);
    const rect = trigger.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.right = `${Math.max(8,window.innerWidth - rect.right)}px`;
    menu.querySelectorAll('[data-action]').forEach(button => button.onclick = event => { event.stopPropagation(); closeStripMenu(); handleAction(button.dataset.action,row); });
    stripMenuLayer = menu;
  }

  let remarkEditorLayer = null;
  function closeRemarkEditor(){ if(remarkEditorLayer){ remarkEditorLayer.remove(); remarkEditorLayer = null; } }
  function openRemarkEditor(trigger,row){
    closeRemarkEditor();
    const layer = document.createElement('div');
    layer.className = 'remark-editor-layer';
    layer.innerHTML = `<div class="remark-editor-popover"><textarea rows="4" maxlength="200" placeholder="请输入备注" aria-label="加工单 ${escapeHtml(row.orderNo)} 的备注">${escapeHtml(row.remark || '')}</textarea><div class="remark-editor-actions"><button class="btn" type="button" data-remark-cancel>取消</button><button class="btn primary" type="button" data-remark-save>确定</button></div></div>`;
    document.body.appendChild(layer);
    remarkEditorLayer = layer;
    const popover = $('.remark-editor-popover',layer),textarea = $('textarea',layer);
    const rect = trigger.getBoundingClientRect(),width = 330;
    popover.style.left = Math.max(16,Math.min(rect.left,window.innerWidth - width - 16)) + 'px';
    const height = popover.offsetHeight;
    let top = rect.bottom + 6;
    if(top + height > window.innerHeight - 16) top = Math.max(16,rect.top - height - 6);
    popover.style.top = top + 'px';
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length,textarea.value.length);
    layer.addEventListener('mousedown',event => { if(event.target === layer) closeRemarkEditor(); });
    $('[data-remark-cancel]',layer).onclick = () => closeRemarkEditor();
    $('[data-remark-save]',layer).onclick = () => saveRemark(row,textarea.value);
    textarea.addEventListener('keydown',event => {
      if(event.key === 'Escape'){ event.preventDefault(); closeRemarkEditor(); }
      if(event.key === 'Enter' && (event.ctrlKey || event.metaKey)){ event.preventDefault(); saveRemark(row,textarea.value); }
    });
  }
  function saveRemark(row,value){
    const next = String(value || '').trim();
    closeRemarkEditor();
    if(next === (row.remark || '')) return;
    row.remark = next;
    row.logs = row.logs || [];
    row.logs.unshift({type:'编辑',content:`修改备注：${next || '清空备注'}`,operator:CURRENT_USER,time:now()});
    render();
    toast('备注已保存');
  }

  function handleAction(action,row){
    if(action === 'log') openLog(row);
    if(action === 'reverse') openDetail(row);
  }

  function modal(content,className){
    const mask = document.createElement('div');
    mask.className = className ? `modal-mask ${className}` : 'modal-mask';
    mask.innerHTML = content;
    document.body.appendChild(mask);
    mask.addEventListener('click',event => { if(event.target === mask) mask.remove(); });
    $$('[data-close]',mask).forEach(button => button.onclick = () => mask.remove());
    return mask;
  }

  function openCreate(){
    state.draft = {warehouse:'',remark:'',items:[]};
    renderEditor();
  }

  function renderEditor(){
    const draft = state.draft;
    const warehouseOptions = warehouses.map(value => `<option value="${escapeHtml(value)}" ${value === draft.warehouse ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('');
    const batchTeamOptions = draft.warehouse ? teamsFor(draft.warehouse).map(team => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join('') : '';
    const itemHtml = draft.items.map(item => {
      const bundle = bundleById(item.bundleId);
      if(!bundle) return '';
      const qty = Number(item.processQty || 0);
      const max = bundleMax(bundle,item.team,draft);
      const teamOptions = teamsFor(bundle.warehouse).map(team => `<option value="${escapeHtml(team)}" ${team === item.team ? 'selected' : ''}>${escapeHtml(team)}</option>`).join('');
      const children = bundle.components.map(component => {
        const available = availableOf(bundle.warehouse,item.team,component.sku);
        const unit = costOf(bundle.warehouse,item.team,component.sku);
        const need = qty * component.ratio;
        return `<tr><td>${escapeHtml(component.sku)}</td><td class="left">${escapeHtml(nameOf(bundle.warehouse,item.team,component.sku))}</td><td>${component.ratio}</td><td data-available="${bundle.id}::${component.sku}">${available}</td><td data-consume="${bundle.id}::${component.sku}" class="${need > available ? 'danger' : ''}">${need}</td><td>${num(unit)}</td></tr>`;
      }).join('');
      return `<div class="bundle-block" data-bundle="${bundle.id}"><div class="bundle-head"><div class="bundle-head-title"><span class="bundle-badge">组合</span><b class="bundle-sku">${escapeHtml(bundle.finishedSku)}</b><span class="bundle-name" title="${escapeHtml(bundle.finishedName)}">${escapeHtml(bundle.finishedName)}</span><button type="button" class="link danger-link bundle-remove" data-remove="${bundle.id}">移除</button></div><div class="bundle-head-fields"><label class="bundle-field bundle-field-team"><em>团队</em><select class="control" data-team="${bundle.id}">${teamOptions}</select></label><label class="bundle-field"><em>加工数量</em><input class="bundle-input" type="number" min="1" max="${Math.max(1,max)}" value="${item.processQty === '' || item.processQty == null ? '' : item.processQty}" placeholder="请输入" data-qty="${bundle.id}"><span class="bundle-max">最多可加工 <b data-max="${bundle.id}">${max} 件</b></span></label><label class="bundle-field"><em>加工费（元）</em><input class="bundle-input" type="number" min="0" step="0.01" value="${item.processingFee || 0}" data-fee-input="${bundle.id}"></label></div></div><div class="bundle-children"><div class="bundle-children-title">子件明细</div><table class="editor-table bundle-components"><colgroup><col style="width:18%"><col style="width:34%"><col style="width:11%"><col style="width:14%"><col style="width:11%"><col style="width:12%"></colgroup><thead><tr><th>子件 SKU</th><th class="left">子件名称</th><th>单位配比</th><th>子件可用库存</th><th>本次耗用</th><th>单位成本</th></tr></thead><tbody>${children}</tbody></table></div></div>`;
    }).join('');
    const empty = '<div class="bundle-empty">请点击「添加组合SKU」选择需要加工的组合，添加后自动带出子件配比与可用库存</div>';
    const mask = modal(`<section class="dialog editor-dialog"><header class="dialog-header"><div><h2>新建加工单</h2><p>提交后立即扣减子件库存并增加成品库存</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body editor-body"><div class="processing-form-card"><div class="card-title">加工信息</div><div class="processing-form-inline"><label class="processing-field"><span><i>*</i>仓库</span><select class="control" id="editWarehouse"><option value="">请选择仓库</option>${warehouseOptions}</select></label><label class="processing-field"><span>备注</span><input id="editRemark" maxlength="200" value="${escapeHtml(draft.remark)}" placeholder="可填写现场加工说明"></label></div></div><div class="items-block"><div class="items-toolbar"><strong>组合 SKU 明细</strong><div class="items-batch"><select class="control" id="batchTeam" ${!draft.warehouse || !draft.items.length ? 'disabled' : ''}><option value="">批量选择团队</option>${batchTeamOptions}</select><button class="btn" id="fillMaxBtn" type="button" ${!draft.warehouse || !draft.items.length ? 'disabled' : ''}>按最高可加工数填充</button></div><button class="btn primary" data-add type="button">添加组合SKU</button></div><div class="bundle-list">${itemHtml || empty}</div></div></div><footer class="dialog-footer"><span class="dialog-summary">已选 <b data-sku-count>${draft.items.length}</b> 个组合 SKU · 加工数量 <b data-total-qty>0</b> 件 · 加工费 <b data-total-fee>¥0.00</b></span><button class="btn" data-close>取消</button><button class="btn primary" data-submit>确认加工</button></footer></section>`);
    const warehouseSelect = $('#editWarehouse',mask);
    if(warehouseSelect) warehouseSelect.onchange = event => {
      if(draft.items.length) toast('仓库已变更，已清空组合 SKU');
      draft.warehouse = event.target.value;
      draft.items = [];
      mask.remove();
      renderEditor();
    };
    const remarkInput = $('#editRemark',mask);
    if(remarkInput) remarkInput.oninput = event => { draft.remark = event.target.value; };
    $$('[data-team]',mask).forEach(select => select.onchange = event => {
      const item = draft.items.find(entry => entry.bundleId === select.dataset.team);
      if(!item) return;
      item.team = event.target.value;
      refreshEditor(mask);
    });
    $$('[data-qty]',mask).forEach(input => input.oninput = event => {
      const item = draft.items.find(entry => entry.bundleId === input.dataset.qty);
      if(!item) return;
      item.processQty = event.target.value === '' ? '' : Number(event.target.value);
      refreshEditor(mask);
    });
    $$('[data-fee-input]',mask).forEach(input => input.oninput = event => {
      const item = draft.items.find(entry => entry.bundleId === input.dataset.feeInput);
      if(!item) return;
      item.processingFee = Math.max(0,Number(event.target.value || 0));
      refreshEditor(mask);
    });
    $$('[data-remove]',mask).forEach(button => button.onclick = () => {
      draft.items = draft.items.filter(item => item.bundleId !== button.dataset.remove);
      mask.remove();
      renderEditor();
    });
    $('[data-add]',mask).onclick = () => openBundlePicker(mask);
    const batchTeam = $('#batchTeam',mask);
    if(batchTeam) batchTeam.onchange = event => {
      const team = event.target.value;
      if(!team) return;
      draft.items.forEach(item => {
        item.team = team;
        const select = $(`[data-team="${item.bundleId}"]`,mask);
        if(select) select.value = team;
      });
      refreshEditor(mask);
      event.target.value = '';
    };
    const fillMax = $('#fillMaxBtn',mask);
    if(fillMax) fillMax.onclick = () => {
      if(!draft.items.length) return toast('请先添加组合 SKU');
      draft.items.forEach(item => {
        const bundle = bundleById(item.bundleId);
        if(!bundle) return;
        const max = bundleMax(bundle,item.team,draft);
        item.processQty = max > 0 ? max : '';
        const input = $(`[data-qty="${item.bundleId}"]`,mask);
        if(input) input.value = item.processQty;
      });
      refreshEditor(mask);
      toast('已按最高可加工数填充');
    };
    $('[data-submit]',mask).onclick = () => submitEditor(mask);
    refreshEditor(mask);
  }

  function refreshEditor(mask){
    const draft = state.draft;
    let totalQty = 0,fee = 0;
    draft.items.forEach(item => {
      const bundle = bundleById(item.bundleId);
      if(!bundle) return;
      const qty = Number(item.processQty || 0);
      totalQty += qty;
      fee += Number(item.processingFee || 0);
      const max = bundleMax(bundle,item.team,draft);
      const maxNode = $(`[data-max="${bundle.id}"]`,mask);
      if(maxNode) maxNode.textContent = max + ' 件';
      const qtyInput = $(`[data-qty="${bundle.id}"]`,mask);
      if(qtyInput){ qtyInput.max = Math.max(1,max); qtyInput.classList.toggle('is-over',qty > max); }
      bundle.components.forEach(component => {
        const available = availableOf(bundle.warehouse,item.team,component.sku);
        const need = qty * component.ratio;
        const availableCell = $(`[data-available="${bundle.id}::${component.sku}"]`,mask);
        if(availableCell) availableCell.textContent = available;
        const cell = $(`[data-consume="${bundle.id}::${component.sku}"]`,mask);
        if(cell){ cell.textContent = need; cell.classList.toggle('danger',need > available); }
      });
    });
    const skuCount = $('[data-sku-count]',mask);
    if(skuCount) skuCount.textContent = draft.items.length;
    const qtyNode = $('[data-total-qty]',mask);
    if(qtyNode) qtyNode.textContent = totalQty;
    const feeNode = $('[data-total-fee]',mask);
    if(feeNode) feeNode.textContent = money(fee);
  }

  function markWarehouseError(mask){
    const field = $('#editWarehouse',mask)?.closest('.processing-field');
    if(field) field.classList.add('is-error');
  }

  function openBundlePicker(editorMask){
    const draft = state.draft;
    if(!draft.warehouse){ markWarehouseError(editorMask); return toast('请先选择仓库'); }
    const candidates = bundles.filter(bundle => bundle.warehouse === draft.warehouse);
    const added = new Set(draft.items.map(item => item.bundleId));
    const selected = new Set();
    const mask = modal(`<section class="dialog picker-dialog"><header class="dialog-header"><div><h2>添加组合 SKU</h2><p>${escapeHtml(draft.warehouse)}</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body picker-body"><div class="picker-search"><input class="control" id="pickerSku" placeholder="组合 SKU（支持多个）"><input class="control" id="pickerName" placeholder="品名"></div><div class="picker-table-wrap"><table class="picker-table"><colgroup><col style="width:6%"><col style="width:34%"><col style="width:60%"></colgroup><thead><tr><th><input type="checkbox" id="pickerAll"></th><th class="left">组合 SKU</th><th class="left">品名</th></tr></thead><tbody id="pickerBody"></tbody></table></div></div><footer class="dialog-footer"><span class="dialog-summary">已选 <b id="pickerCount">0</b> 个组合 SKU</span><button class="btn" data-close>取消</button><button class="btn primary" data-confirm>添加</button></footer></section>`);
    const currentRows = () => {
      const values = split($('#pickerSku',mask).value);
      const name = $('#pickerName',mask).value.trim().toLowerCase();
      return candidates.filter(bundle => (!values.length || values.some(value => bundle.finishedSku.toLowerCase().includes(value))) && (!name || bundle.finishedName.toLowerCase().includes(name)));
    };
    const renderRows = () => {
      const rows = currentRows();
      $('#pickerBody',mask).innerHTML = rows.length ? rows.map(bundle => {
        const disabled = added.has(bundle.id);
        return `<tr><td><input class="picker-check" type="checkbox" value="${bundle.id}" ${selected.has(bundle.id) ? 'checked' : ''} ${disabled ? 'disabled' : ''}></td><td class="left">${escapeHtml(bundle.finishedSku)}</td><td class="left">${escapeHtml(bundle.finishedName)}</td></tr>`;
      }).join('') : '<tr><td colspan="3" class="picker-empty">暂无符合条件的组合 SKU</td></tr>';
      const selectable = rows.filter(bundle => !added.has(bundle.id));
      $('#pickerAll',mask).checked = selectable.length > 0 && selectable.every(bundle => selected.has(bundle.id));
      $('#pickerCount',mask).textContent = selected.size;
    };
    ['#pickerSku','#pickerName'].forEach(selector => { const control = $(selector,mask); control.oninput = renderRows; });
    $('#pickerAll',mask).onchange = event => {
      currentRows().filter(bundle => !added.has(bundle.id)).forEach(bundle => event.target.checked ? selected.add(bundle.id) : selected.delete(bundle.id));
      renderRows();
    };
    $('#pickerBody',mask).onchange = event => {
      const input = event.target.closest('.picker-check');
      if(!input) return;
      input.checked ? selected.add(input.value) : selected.delete(input.value);
      renderRows();
    };
    $('[data-confirm]',mask).onclick = () => {
      if(!selected.size) return toast('请至少选择一个组合 SKU');
      const defaultTeam = teamsFor(draft.warehouse)[0] || '';
      selected.forEach(id => { if(!added.has(id)) draft.items.push({bundleId:id,team:defaultTeam,processQty:'',processingFee:0}); });
      mask.remove();
      editorMask.remove();
      renderEditor();
      toast(`已添加 ${selected.size} 个组合 SKU`);
    };
    renderRows();
    requestAnimationFrame(() => $('#pickerSku',mask).focus());
  }

  function submitEditor(mask){
    const draft = state.draft;
    if(!draft.warehouse) return toast('请选择仓库');
    if(!draft.items.length) return toast('请至少添加一个组合 SKU');
    for(const item of draft.items){
      const bundle = bundleById(item.bundleId);
      if(!bundle) continue;
      if(!item.team) return toast(bundle.finishedSku + ' 请选择团队');
      if(!Number.isInteger(Number(item.processQty)) || Number(item.processQty) < 1) return toast(bundle.finishedSku + ' 请输入大于 0 的整数加工数量');
      if(Number(item.processQty) > bundleMax(bundle,item.team,draft)) return toast(bundle.finishedSku + ' 超出当前团队可加工数量');
    }
    const needs = {};
    draft.items.forEach(item => {
      const bundle = bundleById(item.bundleId);
      bundle.components.forEach(component => {
        const key = item.team + '::' + component.sku;
        needs[key] = (needs[key] || 0) + Number(item.processQty) * component.ratio;
      });
    });
    const insufficient = Object.keys(needs).find(key => {
      const [team,sku] = key.split('::');
      return needs[key] > availableOf(draft.warehouse,team,sku);
    });
    if(insufficient) return toast('子件 ' + insufficient.split('::')[1] + ' 库存不足');
    Object.keys(needs).forEach(key => {
      const [team,sku] = key.split('::');
      const target = stockOf(draft.warehouse,team,sku);
      if(target) target.available -= needs[key];
    });
    const items = draft.items.map(item => {
      const bundle = bundleById(item.bundleId);
      return {bundleId:bundle.id,team:item.team,finishedSku:bundle.finishedSku,finishedName:bundle.finishedName,processQty:Number(item.processQty),processingFee:Number(item.processingFee || 0),reversedQty:0,components:bundle.components.map(component => ({sku:component.sku,name:nameOf(draft.warehouse,item.team,component.sku),ratio:component.ratio,qty:Number(item.processQty) * component.ratio,unitCost:costOf(draft.warehouse,item.team,component.sku)}))};
    });
    items.forEach(item => addFinishedStock(draft.warehouse,item.team,item.finishedSku,item.processQty));
    const stamp = now(),orderNo = nextNo();
    const row = {orderNo,createdAt:stamp,warehouse:draft.warehouse,operator:CURRENT_USER,remark:draft.remark,items,logs:[{type:'新增',content:`创建加工单 ${orderNo}`,operator:CURRENT_USER,time:stamp}]};
    records.unshift(row);
    mask.remove();
    state.page = 1;
    render();
    toast('加工单 ' + row.orderNo + ' 已完成，库存已过账');
    setTimeout(() => openDetail(row),300);
  }

  function detailHtml(row){
    const fee = rowFee(row),unit = rowUnitCost(row);
    const detailBodyRows = row.items.map(item => detailItemRows(row,item,{showAction:true})).join('');
    const baseFields = [
      ['加工单号',escapeHtml(row.orderNo)],
      ['仓库',escapeHtml(row.warehouse)],
      ['创建人',escapeHtml(row.operator)],
      ['创建时间',escapeHtml(row.createdAt)],
      ['组合 SKU 数',`${row.items.length} 个`],
      ['加工数量',`${rowQty(row)} 件`],
      ['加工费',money(fee)],
      ['成品单位成本',money(unit)]
    ];
    const fieldsHtml = baseFields.map(([label,value]) => `<div class="simple-field"><span>${label}</span><b>${value}</b></div>`).join('');
    const remarkHtml = `<div class="simple-remark"><span>备注</span><p>${escapeHtml(row.remark || '—')}</p></div>`;
    return `<section class="dialog detail-dialog"><header class="dialog-header"><div><h2>加工单详情</h2><p>${escapeHtml(row.orderNo)} <span class="po-tag po-tag-done">已加工</span></p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body detail-body"><section class="simple-section"><div class="simple-section-title">基础信息</div><div class="simple-fields">${fieldsHtml}</div>${remarkHtml}</section><section class="simple-section"><div class="simple-section-title">组合明细</div><div class="simple-detail-wrap"><table class="simple-detail-table">${modalDetailColgroup}<thead><tr>${modalDetailTitles.map(title => `<th>${title}</th>`).join('')}</tr></thead><tbody>${detailBodyRows}</tbody></table></div></section></div></section>`;
  }

  function bindDetail(mask,row){
    $$('[data-close]',mask).forEach(button => button.onclick = () => mask.remove());
    $$('[data-reverse-item]',mask).forEach(button => button.onclick = () => {
      const item = row.items.find(candidate => candidate.bundleId === button.dataset.reverseItem);
      if(!item) return;
      openReverse([{row,item}],() => {
        mask.innerHTML = detailHtml(row);
        bindDetail(mask,row);
      });
    });
  }

  function openDetail(row){
    const mask = modal(detailHtml(row));
    bindDetail(mask,row);
  }

  function openLog(row){
    const logs = row.logs || [];
    modal(`<section class="dialog log-dialog"><header class="dialog-header"><div><h2>操作日志</h2><p>加工单：${escapeHtml(row.orderNo)}</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body log-body"><div class="log-table-wrap"><table class="log-table"><thead><tr><th>操作类型</th><th class="left">日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>${logs.length ? logs.map(log => `<tr><td>${escapeHtml(log.type)}</td><td class="left">${escapeHtml(log.content)}</td><td>${escapeHtml(log.operator)}</td><td>${escapeHtml(log.time)}</td></tr>`).join('') : '<tr><td colspan="4" class="log-empty">暂无操作日志</td></tr>'}</tbody></table></div></div><footer class="dialog-footer"><span class="log-count">共 ${logs.length} 条</span><div class="log-pager"><button class="page-btn" disabled>‹</button><button class="page-btn active">1</button><button class="page-btn" disabled>›</button></div></footer></section>`,'log-mask');
  }

  function openReverse(selections,onDone){
    const selection = selections[0];
    if(!selection) return;
    const {row,item} = selection;
    const total = Number(item.processQty || 0);
    const reversedQty = Number(item.reversedQty || 0);
    const remaining = Math.max(0,total - reversedQty);
    if(remaining <= 0) return toast('该组合 SKU 已全部冲销');
    const comboStock = finishedStockOf(row.warehouse,item.team,item.finishedSku);
    const maxQty = Math.min(remaining,comboStock);
    const components = item.components || [];
    const componentRows = qty => components.length
      ? components.map(component => {
        const delta = qty * Number(component.ratio || 0);
        return `<tr><td class="left">${escapeHtml(component.sku)}</td><td class="left" title="${escapeHtml(component.name)}">${escapeHtml(component.name)}</td><td>${component.ratio}</td><td class="reverse-delta">${delta ? '+' + delta : 0}</td></tr>`;
      }).join('')
      : '<tr><td colspan="4" class="reverse-empty">该组合 SKU 未维护子件</td></tr>';
    const stockHint = maxQty <= 0
      ? '组合 SKU 当前可用库存为 0 件，暂不可冲销'
      : comboStock < remaining
        ? `组合 SKU 当前可用 ${comboStock} 件，少于剩余可冲销 ${remaining} 件，本次最多冲销 ${comboStock} 件`
        : '';
    const mask = modal(`<section class="dialog reverse-dialog"><header class="dialog-header"><div><h2>冲销组合 SKU</h2><p>冲销时校验组合 SKU 库存，成功后扣减组合 SKU、按配比返还子件 SKU 库存</p></div><button class="dialog-close" data-close>×</button></header><div class="dialog-body reverse-body"><section class="reverse-card"><div class="reverse-card-title">冲销数量</div><div class="reverse-meta"><div><span>组合 SKU</span><b class="blue">${escapeHtml(item.finishedSku)}</b></div><div><span>团队</span><b>${escapeHtml(item.team)}</b></div><div><span>原加工数量</span><b>${total} 件</b></div><div><span>已冲销 / 剩余</span><b>${reversedQty} / ${remaining} 件</b></div></div><div class="reverse-qty-line"><label class="reverse-qty-label" for="reverseQty"><i>*</i>本次冲销数量</label><div class="reverse-qty-input" id="reverseQtyBox"><input id="reverseQty" type="number" min="1" step="1" placeholder="请输入" ${maxQty <= 0 ? 'disabled' : ''}><em>件</em></div><span class="reverse-max-note">最多可冲销 <b>${maxQty}</b> 件</span></div><p class="reverse-error" id="reverseQtyError" ${stockHint ? '' : 'hidden'}>${escapeHtml(stockHint)}</p><div class="reverse-stock-line"><span>组合 SKU 当前可用 <b>${comboStock}</b> 件</span><span class="reverse-arrow">→</span><span>冲销后可用 <b id="reverseComboAfter">${comboStock}</b> 件</span></div><div class="reverse-table-wrap"><table class="reverse-table"><colgroup><col style="width:30%"><col style="width:34%"><col style="width:16%"><col style="width:20%"></colgroup><thead><tr><th>子件 SKU</th><th>子件名称</th><th>单位配比</th><th>本次增加</th></tr></thead><tbody id="reverseComponents">${componentRows(0)}</tbody></table></div></section><section class="reverse-card"><div class="reverse-card-title"><i class="reverse-required">*</i>冲销原因</div><textarea class="reverse-memo" id="reverseMemo" maxlength="120" placeholder="请填写冲销原因"></textarea></section></div><footer class="dialog-footer"><button class="btn" data-close>取消</button><button class="btn danger" data-confirm disabled>确认冲销</button></footer></section>`);
    const baseDialog = $('.detail-dialog');
    if(baseDialog){
      const baseRect = baseDialog.getBoundingClientRect(),dialogEl = $('.reverse-dialog',mask);
      dialogEl.style.width = Math.max(320,Math.min(820,Math.round(baseRect.width - 80),window.innerWidth - 32)) + 'px';
      dialogEl.style.maxHeight = Math.max(200,Math.min(Math.round(baseRect.height - 48),window.innerHeight - 32)) + 'px';
    }
    const qtyInput = $('#reverseQty',mask),qtyBox = $('#reverseQtyBox',mask),errorEl = $('#reverseQtyError',mask),comboAfter = $('#reverseComboAfter',mask),componentBody = $('#reverseComponents',mask),memoInput = $('#reverseMemo',mask),confirmBtn = $('[data-confirm]',mask);
    const currentQty = () => {
      const raw = qtyInput.value.trim();
      if(!/^\d+$/.test(raw)) return {qty:0,valid:false,empty:!raw};
      const qty = Number(raw);
      return {qty,valid:qty > 0 && qty <= maxQty,empty:false};
    };
    const sync = () => {
      const {qty,valid,empty} = currentQty();
      const activeQty = valid ? qty : 0;
      let message = stockHint;
      if(!empty && !valid){
        if(qty <= 0) message = '请输入大于 0 的整数';
        else if(qty > remaining) message = `最多可冲销 ${remaining} 件`;
        else if(qty > comboStock) message = `组合 SKU 可用库存仅 ${comboStock} 件`;
        else message = `最多可冲销 ${maxQty} 件`;
      }
      errorEl.hidden = !message;
      errorEl.textContent = message;
      errorEl.classList.toggle('is-hint',message === stockHint && Boolean(stockHint));
      qtyBox.classList.toggle('is-error',!empty && !valid);
      comboAfter.textContent = Math.max(0,comboStock - activeQty);
      componentBody.innerHTML = componentRows(activeQty);
      confirmBtn.disabled = !valid;
    };
    qtyInput.addEventListener('input',sync);
    memoInput.addEventListener('input',() => {
      memoInput.classList.remove('is-error');
      sync();
    });
    confirmBtn.onclick = () => {
      const {qty,valid} = currentQty();
      const memo = memoInput.value.trim();
      if(!valid) return toast(maxQty <= 0 ? '组合 SKU 库存不足，暂不可冲销' : '请填写正确的冲销数量');
      if(!memo){
        memoInput.classList.add('is-error');
        memoInput.scrollIntoView({block:'center',behavior:'smooth'});
        memoInput.focus();
        return toast('请填写冲销原因');
      }
      confirmBtn.disabled = true;
      addFinishedStock(row.warehouse,item.team,item.finishedSku,-qty);
      components.forEach(component => {
        const target = stockOf(row.warehouse,item.team,component.sku);
        if(target) target.available += qty * Number(component.ratio || 0);
      });
      item.reversedQty = reversedQty + qty;
      item.reversedAt = now();
      item.reversedBy = CURRENT_USER;
      item.reverseMemo = memo;
      row.logs = row.logs || [];
      row.logs.unshift({type:'取消',content:`冲销组合 SKU：${item.finishedSku} × ${qty} 件（累计 ${item.reversedQty}/${total}）；原因：${memo}`,operator:CURRENT_USER,time:item.reversedAt});
      mask.remove();
      render();
      toast(item.reversedQty >= total ? `${qty} 件已冲销，${item.finishedSku} 已全部冲销` : `${qty} 件已冲销，子件库存已按配比返还`);
      if(onDone) onDone();
      else openDetail(row);
    };
  }

  function exportCsv(){
    const rows = filtered();
    const headers = ['加工单号','创建时间','仓库','团队','组合SKU','品名','加工数量','子件成本','加工费','加工成本','创建人','是否冲销'];
    const body = rows.flatMap(row => row.items.map(item => [row.orderNo,row.createdAt,row.warehouse,item.team,item.finishedSku,item.finishedName,item.processQty,itemMaterial(item),item.processingFee,itemTotal(item),row.operator,row.items.some(i => Number(i.reversedQty || 0) > 0) ? '是' : '否']));
    const csv = '\ufeff' + [headers].concat(body).map(line => line.map(value => '"' + String(value == null ? '' : value).replaceAll('"','""') + '"').join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    link.download = '加工单_' + now().slice(0,10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast('已导出 ' + rows.length + ' 张加工单');
  }

  function layoutQuery(){
    const card = $('#queryCard'),items = $$('.query-item:not(.query-action-item)',$('#queryGrid'));
    items.forEach(item => item.classList.remove('query-overflow-item'));
    const tops = [];
    items.forEach(item => {
      const top = Math.round(item.getBoundingClientRect().top);
      if(!tops.some(value => Math.abs(value - top) < 3)) tops.push(top);
      if(tops.length > 2) item.classList.add('query-overflow-item');
    });
    const overflow = items.some(item => item.classList.contains('query-overflow-item'));
    $('#queryExpand').hidden = !overflow;
    if(!overflow){ state.queryExpanded = false; card.classList.add('query-collapsed'); }
  }

  function init(){
    setupMultis();
    render();
    $('#newBtn').onclick = openCreate;
    $('#exportBtn').onclick = exportCsv;
    $('#searchBtn').onclick = () => {
      const start = $('#startDate').value,end = $('#endDate').value;
      if((start && !end) || (!start && end)) return toast('开始和结束日期必须同时填写');
      if(start && end && start > end) return toast('开始日期不能晚于结束日期');
      state.reverseStatus = $('#reverseStatusFilter').value;
      state.page = 1;
      render();
      toast('查询完成，共 ' + filtered().length + ' 条记录');
    };
    $('#resetBtn').onclick = () => {
      $('#orderNoInput').value = '';
      $('#skuInput').value = '';
      $('#finishedNameInput').value = '';
      $('#startDate').value = '';
      $('#endDate').value = '';
      $('#timeType').value = 'createdAt';
      $('#reverseStatusFilter').value = '';
      state.warehouses = [];
      state.teams = [];
      state.operators = [];
      state.reverseStatus = '';
      state.page = 1;
      setupMultis();
      render();
      toast('查询条件已重置');
    };
    $('#queryExpand').onclick = () => {
      state.queryExpanded = !state.queryExpanded;
      $('#queryCard').classList.toggle('query-collapsed',!state.queryExpanded);
      $('.query-expand-text').textContent = state.queryExpanded ? '收起' : '展开';
    };
    $('#pageSize').onchange = event => { state.pageSize = Number(event.target.value); state.page = 1; render(); };
    $('#prevPage').onclick = () => { if(state.page > 1){ state.page--; render(); } };
    $('#nextPage').onclick = () => { const pages = Math.max(1,Math.ceil(filtered().length / state.pageSize)); if(state.page < pages){ state.page++; render(); } };
    document.addEventListener('click',() => { closeStripMenu(); $$('.multi .dropdown.show').forEach(node => node.classList.remove('show')); });
    window.addEventListener('resize',layoutQuery);
    requestAnimationFrame(() => requestAnimationFrame(layoutQuery));
  }

  init();
})();
