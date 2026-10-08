(function(){
  'use strict';
  var products=[
    {id:1,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',barcode:'6975421300012',name:'MIG-200A 逆变式气体保护焊机',model:'MIG-200A',brand:'焊虎机',fitType:'普货',category1:'焊接设备',category2:'MIG焊机',productType:'单品',salesStatus:'常规',unit:'件',owner:'Admin',creator:'Admin',logistics:'带磁',supplier:'深圳焊虎机电有限公司',supplierCount:2,price:'¥ 1,280.00',createdAt:'2026-09-18 10:32',icon:'⚡'},
    {id:2,sku:'TIG-ROD-316L',lingxingSku:'LX-TIG-316L-002',barcode:'6975421300067',name:'TIG 316L 不锈钢氩弧焊丝 1.6mm',model:'TIG 316L',brand:'焊虎机',fitType:'耗材&辅料',category1:'焊接耗材',category2:'焊接耗材',productType:'单品',salesStatus:'常规',unit:'卷',owner:'张三',creator:'Admin',logistics:'普货',supplier:'东莞市华诚五金有限公司',supplierCount:1,price:'¥ 86.50',createdAt:'2026-09-17 14:20',icon:'〰'},
    {id:3,sku:'PLASMA-45',lingxingSku:'LX-CUT-45-003',barcode:'6975421300135',name:'CUT-45 等离子切割机 45A',model:'CUT-45',brand:'焊虎机',fitType:'配件',category1:'焊接设备',category2:'等离子切割机',productType:'单品',salesStatus:'新品',unit:'台',owner:'李四',creator:'Admin',logistics:'带电',supplier:'宁波锐虎机械有限公司',supplierCount:3,price:'¥ 938.00',createdAt:'2026-09-16 09:15',icon:'✦'},
    {id:4,sku:'WELD-HELMET-01',lingxingSku:'LX-HELMET-004',barcode:'6975421300227',name:'自动变光焊接面罩 Pro',model:'WELD-HELMET-01',brand:'焊虎机',fitType:'配件',category1:'劳保用品',category2:'面罩防护',productType:'单品',salesStatus:'常规',unit:'件',owner:'Admin',creator:'Admin',logistics:'普货',supplier:'深圳焊虎机电有限公司',supplierCount:1,price:'¥ 198.00',createdAt:'2026-09-12 16:40',icon:'◒'},
    {id:5,sku:'CABLE-35MM',lingxingSku:'LX-CABLE-005',barcode:'6975421300289',name:'35mm² 铜芯焊把线 10米',model:'CABLE-35MM',brand:'焊虎机',fitType:'耗材&辅料',category1:'焊接耗材',category2:'焊接线缆',productType:'组合品',comboItems:[{sku:'TIG-ROD-316L',quantity:1},{sku:'GAS-REGULATOR',quantity:2}],salesStatus:'清仓',unit:'卷',owner:'张三',creator:'Admin',logistics:'普货',supplier:'东莞市华诚五金有限公司',supplierCount:2,price:'¥ 152.00',createdAt:'2026-09-10 11:08',icon:'⌇'},
    {id:6,sku:'GAS-REGULATOR',lingxingSku:'LX-AR-25-006',barcode:'6975421300357',name:'氩气减压器带流量计',model:'AR-25',brand:'焊虎机',category1:'焊接耗材',category2:'气体配件',productType:'单品',salesStatus:'常规',unit:'个',owner:'李四',creator:'Admin',logistics:'带磁',supplier:'宁波锐虎机电有限公司',supplierCount:1,price:'¥ 68.00',createdAt:'2026-09-08 15:25',icon:'◉'}
  ];
  products.forEach(function(product,index){if(product.productType==='组合')product.productType='组合品';if(product.salesStatus==='常规销售')product.salesStatus='常规';if(product.salesStatus==='海外仓新品')product.salesStatus='新品';if(product.salesStatus==='清货')product.salesStatus='清仓';if(product.fitType==='耗材'||product.fitType==='辅料')product.fitType='耗材&辅料';if(!product.fitType)product.fitType=['普货','耗材&辅料','配件','配件','耗材&辅料','配件'][index]||'';});
  var filtered=products.slice(),selected=new Set(),editing=null;
  var body=document.querySelector('#productTableBody'),count=document.querySelector('#resultCount'),empty=document.querySelector('#emptyState');
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function salesStatusClass(status){return status==='常规'?'sale':status==='清仓'||status==='停售'?'stop':status==='新品'?'dev':'sale';}
  function isComboProduct(row){return row&&(row.productType==='组合品'||row.productType==='组合');}
  function render(){
    if(count)count.textContent='共 '+filtered.length+' 条'; empty.hidden=filtered.length>0;
    body.innerHTML=filtered.map(function(row){var combo=isComboProduct(row),typeTag=combo?'<button type="button" class="sku-type-tag combo" data-action="combo" data-id="'+row.id+'">组合品</button>':'<span class="sku-type-tag single">单品</span>';return '<tr><td><input class="row-check" data-id="'+row.id+'" type="checkbox" '+(selected.has(row.id)?'checked':'')+'></td><td><div class="product-info"><span class="product-thumb product-placeholder" aria-label="暂无产品图片"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2"></rect><circle cx="8.5" cy="9" r="1.4"></circle><path d="m5.5 17 4.2-4 2.8 2.4 2.1-2 3.9 3.6"></path></svg></span><span class="product-name"><b>'+escapeHtml(row.name)+'</b><small>型号：'+escapeHtml(row.model||'—')+'</small></span></div></td><td><div class="sku-cell"><button type="button" class="link sku-code" data-action="view" data-id="'+row.id+'">'+escapeHtml(row.sku)+'</button>'+typeTag+'</div></td><td><span class="lingxing-sku">'+escapeHtml(row.lingxingSku||'—')+'</span></td><td><span class="category-text" title="'+escapeHtml((row.category1||'—')+' / '+(row.category2||'—'))+'">'+escapeHtml(row.category1||'—')+' / '+escapeHtml(row.category2||'—')+'</span></td><td><span class="status '+salesStatusClass(row.salesStatus||'常规')+'">'+escapeHtml(row.salesStatus||'常规')+'</span></td><td>'+escapeHtml(row.unit||'—')+'</td><td data-column-cell="owner">'+escapeHtml(row.owner||'—')+'</td><td data-column-cell="created"><span class="created-info"><b>'+escapeHtml(row.creator||'Admin')+'</b><small>'+escapeHtml(row.createdAt)+'</small></span></td><td><button class="link" data-action="edit" data-id="'+row.id+'">编辑</button><button class="link log-link" data-action="log" data-id="'+row.id+'">日志</button></td></tr>';}).join('');
    document.querySelector('#selectAll').checked=filtered.length>0&&filtered.every(function(row){return selected.has(row.id);});
    document.querySelector('#selectedCount').textContent='已选 '+selected.size+' 项'; document.querySelector('#batchButton').disabled=!selected.size;
    document.querySelectorAll('[data-column]').forEach(function(input){setColumn(input.dataset.column,input.checked);});
  }
  function setColumn(key,visible){document.querySelectorAll('[data-column-head="'+key+'"],[data-column-cell="'+key+'"]').forEach(function(node){node.hidden=!visible;});}
  function split(v){return v.split(/[\s,，、;；]+/).map(function(x){return x.trim().toLowerCase();}).filter(Boolean);}
  var categoryMap={'焊接设备':['MIG焊机','等离子切割机'],'焊接耗材':['焊接耗材','焊接线缆','气体配件'],'劳保用品':['面罩防护']};
  function syncCategory2(){var category1=document.querySelector('#category1'),category2=document.querySelector('#category2'),selected=category2.value,options=category1.value?(categoryMap[category1.value]||[]):['MIG焊机','焊接耗材','等离子切割机','面罩防护','焊接线缆','气体配件'];category2.innerHTML='<option value="">二级类别（全部）</option>'+options.map(function(item){return '<option'+(item===selected?' selected':'')+'>'+item+'</option>';}).join('');}
  var datePicker=document.querySelector('#productDatePicker'),activeDateTarget='',calendarCursor=new Date();
  function pad(number){return String(number).padStart(2,'0');}
  function formatDate(date){return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());}
  function formatDateLabel(value){if(!value)return '';var parts=value.split('-');return parts[0]+' / '+parts[1]+' / '+parts[2];}
  function updateDateLabel(target){var input=document.querySelector('#'+target),trigger=document.querySelector('#'+target+'Trigger');if(trigger)trigger.querySelector('span').textContent=input&&input.value?formatDateLabel(input.value):(target==='startDate'?'开始日期':'结束日期');}
  function renderDatePicker(){
    var year=calendarCursor.getFullYear(),month=calendarCursor.getMonth(),firstDay=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate(),selectedValue=activeDateTarget&&document.querySelector('#'+activeDateTarget).value;
    var dayButtons='';
    for(var blank=0;blank<firstDay;blank++)dayButtons+='<span class="calendar-blank"></span>';
    for(var day=1;day<=days;day++){var value=year+'-'+pad(month+1)+'-'+pad(day),isToday=value===formatDate(new Date()),isSelected=value===selectedValue;dayButtons+='<button type="button" class="calendar-day'+(isToday?' is-today':'')+(isSelected?' is-selected':'')+'" data-calendar-date="'+value+'">'+day+'</button>';}
    datePicker.innerHTML='<div class="calendar-head"><button type="button" aria-label="上个月" data-calendar-nav="-1">‹</button><strong>'+year+'年'+(month+1)+'月</strong><button type="button" aria-label="下个月" data-calendar-nav="1">›</button></div><div class="calendar-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div><div class="calendar-days">'+dayButtons+'</div><footer><button type="button" data-calendar-clear>清除</button><button type="button" data-calendar-today>今天</button></footer>';
  }
  function openDatePicker(target){activeDateTarget=target;var value=document.querySelector('#'+target).value;if(value){var parts=value.split('-');calendarCursor=new Date(Number(parts[0]),Number(parts[1])-1,1);}else{var now=new Date();calendarCursor=new Date(now.getFullYear(),now.getMonth(),1);}renderDatePicker();datePicker.hidden=false;}
  function closeDatePicker(){datePicker.hidden=true;activeDateTarget='';}
  document.addEventListener('click',function(event){
    var trigger=event.target.closest('[data-date-target]');
    if(trigger){openDatePicker(trigger.dataset.dateTarget);return;}
    if(datePicker.contains(event.target)){
      var nav=event.target.closest('[data-calendar-nav]');
      if(nav){calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+Number(nav.dataset.calendarNav),1);renderDatePicker();return;}
      var day=event.target.closest('[data-calendar-date]');
      if(day&&activeDateTarget){document.querySelector('#'+activeDateTarget).value=day.dataset.calendarDate;updateDateLabel(activeDateTarget);closeDatePicker();return;}
      if(event.target.closest('[data-calendar-clear]')&&activeDateTarget){document.querySelector('#'+activeDateTarget).value='';updateDateLabel(activeDateTarget);closeDatePicker();return;}
      if(event.target.closest('[data-calendar-today]')&&activeDateTarget){document.querySelector('#'+activeDateTarget).value=formatDate(new Date());updateDateLabel(activeDateTarget);closeDatePicker();return;}
      return;
    }
    if(!datePicker.hidden)closeDatePicker();
  });
  function syncSkuQueryPlaceholder(){var type=document.querySelector('#skuSearchType').value;document.querySelector('#keyword').placeholder=type==='lingxingSku'?'请输入领星 SKU，支持多个，用逗号或空格隔开':'请输入 SKU，支持多个，用逗号或空格隔开';}
  function search(){var terms=split(document.querySelector('#keyword').value),skuSearchType=document.querySelector('#skuSearchType').value,category1=document.querySelector('#category1').value,category2=document.querySelector('#category2').value,productType=document.querySelector('#productType').value,salesStatus=document.querySelector('#salesStatus').value,owner=document.querySelector('#owner').value,logistics=document.querySelector('#logisticsType').value,supplier=document.querySelector('#supplier').value,start=document.querySelector('#startDate').value,end=document.querySelector('#endDate').value;filtered=products.filter(function(row){var date=row.createdAt.slice(0,10),searchable=String(skuSearchType==='lingxingSku'?row.lingxingSku:row.sku).toLowerCase();return (!terms.length||terms.some(function(term){return searchable.indexOf(term)>-1;}))&&(!category1||row.category1===category1)&&(!category2||row.category2===category2)&&(!productType||row.productType===productType)&&(!salesStatus||row.salesStatus===salesStatus)&&(!owner||row.owner===owner)&&(!logistics||row.logistics===logistics)&&(!supplier||row.supplier===supplier)&&(!start||date>=start)&&(!end||date<=end);});selected.clear();render();}
  function openModal(row,options){
    var readOnly=Boolean(options&&options.readOnly);
    editing=row||null;
    var product=row||{sku:'',barcode:'',name:'',specification:'',status:'可售',logistics:'普货',supplier:'',price:'—',createdAt:'',icon:'◈',productType:'单品',comboItems:[]};
    var mask=document.createElement('div');
    mask.className='sku-editor-mask';
    var comboRows=Array.isArray(product.comboItems)?product.comboItems.map(function(item){return {sku:item.sku||'',quantity:item.quantity||1};}):[];
    function comboProduct(sku){return products.find(function(item){return item.sku===sku;});}
    function productThumbMarkup(item){return '<span class="combo-picker-thumb product-placeholder" aria-label="暂无产品图片"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2"></rect><circle cx="8.5" cy="9" r="1.4"></circle><path d="m5.5 17 4.2-4 2.8 2.4 2.1-2 3.9 3.6"></path></svg></span>';}
    function productCategory(item){return (item&&item.category1?item.category1:'—')+' / '+(item&&item.category2?item.category2:'—');}
    function productBrand(item){return item&&item.brand?item.brand:'—';}
    function renderComboRows(){
      var tbody=mask.querySelector('[data-combo-rows]'),empty=mask.querySelector('[data-combo-empty]');
      if(!tbody)return;
      tbody.innerHTML=comboRows.map(function(item,index){var child=comboProduct(item.sku);return '<tr data-combo-index="'+index+'"><td>'+(index+1)+'</td><td><div class="combo-child-product">'+(child?productThumbMarkup(child):'<span class="combo-child-empty">请选择子 SKU</span>')+(child?'<div><b>'+escapeHtml(child.sku)+'</b><small>'+escapeHtml(child.name)+'</small></div>':'')+'</div></td><td>'+escapeHtml(child?productCategory(child):'—')+'</td><td>'+escapeHtml(productBrand(child))+'</td><td>'+escapeHtml(child?child.model:'—')+'</td><td><span class="status '+salesStatusClass(child?child.salesStatus:'')+'">'+escapeHtml(child?child.salesStatus:'—')+'</span></td><td>'+escapeHtml(child?child.unit:'—')+'</td><td><input data-combo-field="quantity" type="number" min="1" step="1" value="'+escapeHtml(item.quantity||1)+'" aria-label="子 SKU 数量"></td><td><button type="button" class="link danger-link combo-remove-button" data-combo-remove="'+index+'">移除</button></td></tr>';}).join('');
      if(empty)empty.hidden=comboRows.length>0;
    }
    function openComboPicker(){
      var pickerMask=document.createElement('div'),selectedSku='';
      pickerMask.className='combo-picker-mask';
      pickerMask.innerHTML='<section class="combo-picker-dialog" role="dialog" aria-modal="true" aria-label="选择子 SKU"><header class="combo-picker-header"><div><h3>选择子 SKU</h3><span>请选择要加入组合 SKU 的子 SKU</span></div><button type="button" class="combo-picker-close" data-combo-picker-close aria-label="关闭">×</button></header><div class="combo-picker-body"><div class="combo-picker-search"><label for="comboPickerSearch">SKU</label><input id="comboPickerSearch" data-combo-picker-search placeholder="请输入 SKU 编码查询"><button type="button" class="button primary" data-combo-picker-query>查询</button><button type="button" class="button" data-combo-picker-reset>重置</button></div><div class="combo-picker-table"><div class="combo-picker-table-head"><span>SKU</span><span>产品名称</span><span>产品类目</span><span>品牌</span><span>型号</span><span>销售状态</span><span>单位</span></div><div data-combo-picker-rows></div><div class="combo-picker-empty" data-combo-picker-empty hidden>暂无匹配的 SKU</div></div></div><footer class="combo-picker-footer"><button type="button" class="button" data-combo-picker-cancel>取消</button><button type="button" class="button primary" data-combo-picker-confirm>确定</button></footer></section>';
      mask.appendChild(pickerMask);
      var searchInput=pickerMask.querySelector('[data-combo-picker-search]'),activeQuery='';
      function renderPickerRows(){
        var query=activeQuery,used=comboRows.map(function(item){return item.sku;});
        var available=products.filter(function(item){return (!row||item.id!==row.id)&&used.indexOf(item.sku)===-1&&(!query||item.sku.toLowerCase().indexOf(query)>-1);});
        var rows=available.map(function(item){return '<button type="button" class="combo-picker-row '+(item.sku===selectedSku?'is-selected':'')+'" data-picker-sku="'+escapeHtml(item.sku)+'"><span class="combo-picker-sku">'+escapeHtml(item.sku)+'</span><span class="combo-picker-name">'+productThumbMarkup(item)+'<b>'+escapeHtml(item.name)+'</b></span><span class="combo-picker-cell" title="'+escapeHtml(productCategory(item))+'">'+escapeHtml(productCategory(item))+'</span><span class="combo-picker-cell">'+escapeHtml(productBrand(item))+'</span><span class="combo-picker-cell">'+escapeHtml(item.model||'—')+'</span><span class="combo-picker-cell"><span class="status '+salesStatusClass(item.salesStatus||'')+'">'+escapeHtml(item.salesStatus||'—')+'</span></span><span class="combo-picker-cell">'+escapeHtml(item.unit||'—')+'</span></button>';}).join('');
        pickerMask.querySelector('[data-combo-picker-rows]').innerHTML=rows;
        pickerMask.querySelector('[data-combo-picker-empty]').hidden=available.length>0;
      }
      pickerMask.addEventListener('keydown',function(event){if(event.target===searchInput&&event.key==='Enter'){activeQuery=String(searchInput.value||'').trim().toLowerCase();renderPickerRows();}});
      pickerMask.addEventListener('click',function(event){
        if(event.target===pickerMask||event.target.closest('[data-combo-picker-close]')||event.target.closest('[data-combo-picker-cancel]')){pickerMask.remove();return;}
        var choice=event.target.closest('[data-picker-sku]');
        if(choice){selectedSku=choice.dataset.pickerSku;renderPickerRows();return;}
        if(event.target.closest('[data-combo-picker-query]')){activeQuery=String(searchInput.value||'').trim().toLowerCase();renderPickerRows();return;}
        if(event.target.closest('[data-combo-picker-reset]')){searchInput.value='';activeQuery='';renderPickerRows();return;}
        if(event.target.closest('[data-combo-picker-confirm]')){if(!selectedSku){toast('请选择一个子 SKU');return;}comboRows.push({sku:selectedSku,quantity:1});pickerMask.remove();renderComboRows();}
      });
      renderPickerRows();
      searchInput.focus();
    }
    function setComboVisibility(show){var section=mask.querySelector('[data-combo-section]');if(section)section.hidden=!show;}
    mask.innerHTML='<section class="sku-editor" role="dialog" aria-modal="true" aria-label="SKU 信息">'
      +'<header class="sku-editor-head"><div class="editor-product"><span class="editor-thumb">'+product.icon+'</span><div><h1>SKU信息 <b>'+ (product.sku||'新建 SKU') +'</b></h1><p>'+ (product.name||'请完善产品基础信息') +'</p></div></div><button class="editor-x" type="button" data-editor-close aria-label="关闭">×</button></header>'
      +'<div class="sku-editor-body"><main class="editor-content">'
      +'<section id="basic" class="editor-section"><h2>基本信息</h2><div class="editor-grid"><label><i>*</i>SKU<input data-field="sku" value="'+escapeHtml(product.sku)+'"></label><label>型号<input data-field="model" value="'+escapeHtml(product.model||product.sku)+'"></label><label>一级类别<select data-field="category1"><option '+(product.category1==='焊接设备'||!product.category1?'selected':'')+'>焊接设备</option><option '+(product.category1==='焊接耗材'?'selected':'')+'>焊接耗材</option><option '+(product.category1==='劳保用品'?'selected':'')+'>劳保用品</option></select></label><label>二级类别<select data-field="category2"><option '+(product.category2==='焊接耗材'||!product.category2?'selected':'')+'>焊接耗材</option><option '+(product.category2==='MIG焊机'?'selected':'')+'>MIG焊机</option><option '+(product.category2==='TIG焊材'?'selected':'')+'>TIG焊材</option><option '+(product.category2==='面罩防护'?'selected':'')+'>面罩防护</option></select></label><label class="wide"><i>*</i>品名（中文）<input data-field="name" value="'+escapeHtml(product.name)+'"></label><label>产品类型<select data-field="productType"><option '+(product.productType==='单品'||!product.productType?'selected':'')+'>单品</option><option '+(product.productType==='组合品'?'selected':'')+'>组合品</option></select></label><label>销售状态<select data-field="salesStatus"><option '+(product.salesStatus==='常规'||!product.salesStatus?'selected':'')+'>常规</option><option '+(product.salesStatus==='新品'?'selected':'')+'>新品</option><option '+(product.salesStatus==='清仓'?'selected':'')+'>清仓</option><option '+(product.salesStatus==='停售'?'selected':'')+'>停售</option></select></label><label>单位<select data-field="unit"><option '+(product.unit==='件'||!product.unit?'selected':'')+'>件</option><option '+(product.unit==='套'?'selected':'')+'>套</option><option '+(product.unit==='个'?'selected':'')+'>个</option><option '+(product.unit==='卷'?'selected':'')+'>卷</option><option '+(product.unit==='箱'?'selected':'')+'>箱</option></select></label><label>产品负责人<select data-field="owner"><option '+(product.owner==='Admin'||!product.owner?'selected':'')+'>Admin</option><option '+(product.owner==='张三'?'selected':'')+'>张三</option><option '+(product.owner==='李四'?'selected':'')+'>李四</option></select></label><label>创建人<select data-field="creator" disabled><option>'+escapeHtml(product.creator||'Admin')+'</option></select></label></div></section>'
      +'<section id="combo" class="editor-section combo-section" data-combo-section '+(product.productType==='组合品'?'':'hidden')+'><div class="combo-panel"><div class="combo-panel-head"><h2>组合 SKU 明细</h2><button type="button" class="button primary combo-add-button" data-combo-add>＋ 新增子 SKU</button></div><div class="combo-table-wrap"><table class="combo-table"><thead><tr><th>序号</th><th>子 SKU / 产品名称</th><th>产品类目</th><th>品牌</th><th>型号</th><th>销售状态</th><th>单位</th><th>子 SKU 数量</th><th>操作</th></tr></thead><tbody data-combo-rows></tbody></table><div class="combo-empty" data-combo-empty hidden>暂无子 SKU，请点击“新增子 SKU”</div></div></div></section>'
      +'<section id="size" class="editor-section"><h2>尺寸重量</h2><div class="editor-grid"><label>单品规格（长 cm）<input data-field="singleLength" value="32"></label><label>单品规格（宽 cm）<input data-field="singleWidth" value="18"></label><label>单品规格（高 cm）<input data-field="singleHeight" value="26"></label><label>单品规格（净重 kg）<input data-field="singleWeight" value="0.85"></label><label>包装规格（长 cm）<input data-field="packageLength" value="35"></label><label>包装规格（宽 cm）<input data-field="packageWidth" value="21"></label><label>包装规格（高 cm）<input data-field="packageHeight" value="29"></label><label>包装规格（毛重 kg）<input data-field="packageWeight" value="0.98"></label><label>箱柜（数量 pcs）<input data-field="cartonQuantity" value="1"></label><label>箱柜（长 cm）<input data-field="cartonLength" value="35"></label><label>箱柜（宽 cm）<input data-field="cartonWidth" value="21"></label><label>箱柜（高 cm）<input data-field="cartonHeight" value="29"></label><label>箱柜（体积 cm³）<input data-field="cartonVolume" value="21315"></label><label>箱柜（重 kg）<input data-field="cartonWeight" value="0.98"></label></div></section>'
      +'<section id="logistics" class="editor-section"><h2>报关与物流信息</h2><div class="editor-grid"><label>HS code<input value="8515.3900"></label><label>申报中文名<input value="'+escapeHtml(product.name)+'"></label><label>申报英文名<input value="MIG welding machine"></label><label>物流属性<select data-field="logistics"><option '+(product.logistics==='普货'?'selected':'')+'>普货</option><option '+(product.logistics==='带电'?'selected':'')+'>带电</option><option '+(product.logistics==='带磁'?'selected':'')+'>带磁</option><option '+(product.logistics==='敏感货'?'selected':'')+'>敏感货</option></select></label></div></section>'
      +'<section id="purchase" class="editor-section"><div class="purchase-info-title"><h2>采购信息</h2><button type="button" class="button primary purchase-add-button" data-purchase-add>＋ 新增采购</button></div><div class="purchase-info-table-wrap"><table class="editor-purchase-table"><thead><tr><th>供应商编码</th><th>供应商名称</th><th>供应商料号</th><th>采购单价（未税）</th><th>采购单价（含税）</th><th>采购周期（天数）</th><th>最小起订量</th><th>采购员</th><th>操作</th></tr></thead><tbody data-purchase-rows></tbody></table></div></section>'
      +'<section id="materials" class="editor-section"><h2>关联辅料</h2><div class="material-table-wrap"><table class="editor-material-table"><thead><tr><th>序号</th><th>辅料品名 / 辅料SKU</th><th>单位成本（¥）</th><th>辅料比例 <span class="material-help">i</span></th><th>备注</th><th>操作</th></tr></thead><tbody data-material-rows></tbody><tfoot><tr><td colspan="6"><strong>总计</strong><span>成本（¥）：<b data-material-total>0.0000</b></span></td></tr></tfoot></table></div></section>'
      +'<section id="media" class="editor-section"><h2>图片信息</h2><div data-media-content></div></section>'
      +'</main><aside class="editor-nav" aria-label="信息导航"><button class="active" data-editor-section="basic">基本信息</button><button data-editor-section="size">尺寸重量</button><button data-editor-section="logistics">物流与报关</button><button data-editor-section="purchase">采购信息</button><button data-editor-section="materials">关联辅料</button><button data-editor-section="media">图片信息</button></aside></div>'
      +'<footer class="sku-editor-foot"><div><button class="button" type="button" data-editor-close>关闭</button><button class="button primary" type="button" data-editor-edit '+(readOnly?'':'hidden')+'>编辑</button><button class="button primary" type="button" data-editor-save '+(readOnly?'hidden':'')+'>保存</button></div></footer></section>';
    document.body.appendChild(mask);
    var basicGrid=mask.querySelector('#basic .editor-grid');
    var skuLabel=basicGrid.querySelector('[data-field="sku"]').closest('label');
    var modelLabel=basicGrid.querySelector('[data-field="model"]').closest('label');
    var category1Label=basicGrid.querySelector('[data-field="category1"]').closest('label');
    var productTypeLabel=basicGrid.querySelector('[data-field="productType"]').closest('label');
    var fitLabel=document.createElement('label');
    fitLabel.innerHTML='配货类型<select data-field="fitType"><option value="">请选择配货类型</option><option value="普货">普货</option><option value="配件">配件</option><option value="耗材&辅料">耗材&辅料</option></select>';
    fitLabel.querySelector('select').value=product.fitType||'';
    basicGrid.insertBefore(productTypeLabel,modelLabel);
    basicGrid.insertBefore(fitLabel,category1Label);
    [skuLabel,basicGrid.querySelector('[data-field="name"]').closest('label'),productTypeLabel,fitLabel].forEach(function(label){var oldMark=label.querySelector('i');if(oldMark)oldMark.remove();label.classList.add('required');var mark=document.createElement('i');mark.className='required-mark';mark.textContent='*';label.insertBefore(mark,label.firstChild);});
    if(window.enhanceCustomSelects)window.enhanceCustomSelects();
    renderComboRows();
    var purchaseRows=Array.isArray(product.purchaseSuppliers)&&product.purchaseSuppliers.length?product.purchaseSuppliers.map(function(row){return Object.assign({code:'',name:'',partNo:'',priceExcl:'',priceIncl:'',cycle:'',moq:'',buyer:'Admin'},row);}):[
      {code:'SUP-001',name:product.supplier||'',partNo:'GYS2365',priceExcl:'58',priceIncl:'65.54',cycle:'7',moq:'1',buyer:'Admin'},
      {code:'',name:'',partNo:'',priceExcl:'',priceIncl:'',cycle:'',moq:'',buyer:'Admin'}
    ];
    function renderPurchaseRows(){
      mask.querySelector('[data-purchase-rows]').innerHTML=purchaseRows.map(function(row,index){var isDefault=index===0;return '<tr data-purchase-index="'+index+'"><td><span class="purchase-reference '+(!row.code?'empty':'')+'">'+escapeHtml(row.code||'—')+'</span></td><td><div class="purchase-supplier-cell"><span class="purchase-reference '+(!row.name?'empty':'')+'">'+escapeHtml(row.name||'待关联供应商')+'</span>'+(isDefault?'<span class="purchase-default-tag">默认</span>':'')+'</div></td><td><input data-purchase-field="partNo" value="'+escapeHtml(row.partNo)+'" placeholder="请输入"></td><td><input data-purchase-field="priceExcl" value="'+escapeHtml(row.priceExcl)+'" placeholder="请输入" inputmode="decimal"></td><td><input data-purchase-field="priceIncl" value="'+escapeHtml(row.priceIncl)+'" placeholder="请输入" inputmode="decimal"></td><td><input data-purchase-field="cycle" value="'+escapeHtml(row.cycle)+'" placeholder="请输入" inputmode="numeric"></td><td><input data-purchase-field="moq" value="'+escapeHtml(row.moq)+'" placeholder="请输入" inputmode="numeric"></td><td><select data-purchase-field="buyer"><option '+(row.buyer==='Admin'||!row.buyer?'selected':'')+'>Admin</option><option '+(row.buyer==='张三'?'selected':'')+'>张三</option><option '+(row.buyer==='李四'?'selected':'')+'>李四</option></select></td><td><div class="purchase-row-actions"><button type="button" class="link purchase-action-button" data-purchase-action="default" data-purchase-index="'+index+'" '+(isDefault?'disabled':'')+'>设为默认</button><button type="button" class="link purchase-action-button danger-link" data-purchase-action="delete" data-purchase-index="'+index+'">删除</button></div></td></tr>';}).join('');
    }
    renderPurchaseRows();
    var materialCatalog=[
      {sku:'80001000034',name:'MIG焊丝中性外包装袋',spec:'21.00 × 13.50 × 190.00',cost:'1.3700',remark:''},
      {sku:'80001000032',name:'焊接贴纸标签',spec:'8.00 × 8.00 × 0.00',cost:'0.3600',remark:''},
      {sku:'80001000031',name:'镭射封口袋',spec:'26.00 × 18.00 × 0.00',cost:'0.1720',remark:'产品选择 15 丝'},
      {sku:'HC-BZ-001',name:'碳钢焊条塑胶盒',spec:'0.00 × 0.00 × 0.00',cost:'2.8000',remark:''},
      {sku:'AR-YLK001',name:'引流卡',spec:'0.00 × 0.00 × 0.00',cost:'0.0900',remark:''},
      {sku:'AR-HS08001',name:'药芯焊丝 0.8mm 线轴',spec:'0.00 × 0.00 × 1000.00',cost:'17.6200',remark:''}
    ];
    var materialRows=Array.isArray(product.materials)&&product.materials.length?product.materials.map(function(row){return Object.assign({sku:'',name:'',cost:'',ratio:'100',remark:''},row);}):[{sku:'',name:'',cost:'',ratio:'100',remark:''}];
    var activeMaterialPicker=null;
    function materialTotal(){return materialRows.reduce(function(total,row){var cost=Number(row.cost)||0,ratio=Number(row.ratio)||0;return total+(cost*ratio/100);},0).toFixed(4);}
    function renderMaterialRows(){
      var pickerRows=materialCatalog.map(function(item){return '<button type="button" class="material-catalog-row" data-material-select="'+escapeHtml(item.sku)+'"><span class="material-thumb">无图</span><span><b>'+escapeHtml(item.name)+'</b><small>'+escapeHtml(item.sku)+'</small></span><span>'+escapeHtml(item.spec)+'</span><span>'+escapeHtml(item.cost)+'</span><span>'+escapeHtml(item.remark||'—')+'</span></button>';}).join('');
      var picker='<div class="material-picker-popover" role="dialog" aria-label="选择关联辅料"><div class="material-catalog-head"><span>辅料图片</span><span>辅料品名 / 辅料SKU</span><span>尺寸(cm) / 重量</span><span>单位费用</span><span>备注</span></div><div class="material-catalog-list">'+pickerRows+'</div></div>';
      mask.querySelector('[data-material-rows]').innerHTML=materialRows.map(function(row,index){var selectedName=row.name?(row.name+' / '+row.sku):'';return '<tr data-material-index="'+index+'"><td>'+(index+1)+'</td><td><div class="material-selector"><input class="material-picker-input" data-material-picker="'+index+'" value="'+escapeHtml(selectedName)+'" placeholder="搜索辅料品名 / 辅料SKU" readonly>'+(activeMaterialPicker===index?picker:'')+'</div></td><td><input data-material-field="cost" value="'+escapeHtml(row.cost)+'" placeholder="自动带入" readonly></td><td><input data-material-field="ratio" value="'+escapeHtml(row.ratio)+'" placeholder="请输入比例"></td><td><input data-material-field="remark" value="'+escapeHtml(row.remark)+'" placeholder="请输入备注"></td><td><button type="button" class="link danger-link material-remove-button" data-material-remove="'+index+'">删除</button></td></tr>';}).join('')+'<tr class="material-add-row"><td><button type="button" class="material-add-button" data-material-add aria-label="新增关联辅料">＋</button></td><td colspan="5"><span>新增关联辅料</span></td></tr>';
      mask.querySelector('[data-material-total]').textContent=materialTotal();
    }
    renderMaterialRows();
    var mediaItems=Array.isArray(product.images)&&product.images.length?product.images.map(function(item){return Object.assign({},item);}):[{name:(product.sku||'SKU')+'.png',icon:product.icon||'◈',isMain:true}];
    var imageUrlPanelOpen=false;
    function renderMedia(){
      var gallery=mediaItems.map(function(item,index){return '<figure class="media-preview-card"><div class="media-preview-image">'+(item.src?'<img src="'+escapeHtml(item.src)+'" alt="'+escapeHtml(item.name)+'">':'<span>'+escapeHtml(item.icon||'◈')+'</span>')+(index===0?'<b>主图</b>':'')+'</div><figcaption title="'+escapeHtml(item.name)+'">'+escapeHtml(item.name)+'</figcaption></figure>';}).join('');
      mask.querySelector('[data-media-content]').innerHTML='<div class="image-upload-notice"><ul><li>支持 JPG、PNG、GIF 格式（手动修改文件后缀无效）</li><li>每张图片大小不超过 5M，不能超过 100 张</li><li>分辨率高于 10000 × 10000 的图片不可上传</li></ul></div><div class="image-upload-toolbar"><button type="button" class="button primary" data-image-local>本地选择</button><button type="button" class="button" data-image-url>从URL获取</button><label class="image-drop-area">⌑ 支持拖拽上传 <span>（将图片拖拽到图片区域即可）</span><input type="file" data-image-file accept="image/jpeg,image/png,image/gif" multiple hidden></label><span class="image-count">共 '+mediaItems.length+' 张图片</span></div>'+(imageUrlPanelOpen?'<div class="image-url-panel"><input data-image-url-value placeholder="请输入图片 URL"><button type="button" class="button primary" data-image-url-confirm>添加</button><button type="button" class="button" data-image-url-cancel>取消</button></div>':'')+'<div class="media-preview-gallery">'+gallery+'</div>';
    }
    function addMediaFiles(files){Array.prototype.forEach.call(files||[],function(file){if(!/^image\/(jpeg|png|gif)$/.test(file.type)||file.size>5*1024*1024)return;mediaItems.push({name:file.name,src:URL.createObjectURL(file)});});imageUrlPanelOpen=false;renderMedia();}
    renderMedia();
    function setEditorMode(editable){
      mask.classList.toggle('is-readonly',!editable);
      mask.querySelectorAll('input,select,textarea').forEach(function(control){control.disabled=control.matches('[data-field="creator"]')||!editable;});
      mask.querySelectorAll('.custom-select').forEach(function(wrapper){var source=wrapper.querySelector('select');if(source)wrapper.classList.toggle('is-disabled',source.disabled);});
      mask.querySelectorAll('[data-purchase-add],[data-purchase-action],[data-combo-add],[data-combo-remove],[data-material-add],[data-material-remove],[data-image-local],[data-image-url]').forEach(function(button){button.disabled=!editable;});
      mask.querySelectorAll('.image-drop-area').forEach(function(area){area.classList.toggle('is-disabled',!editable);});
      var editButton=mask.querySelector('[data-editor-edit]'),saveButton=mask.querySelector('[data-editor-save]');
      if(editButton)editButton.hidden=editable;
      if(saveButton)saveButton.hidden=!editable;
    }
    setEditorMode(!readOnly);
    mask.addEventListener('input',function(event){var field=event.target.closest('[data-purchase-field]');if(!field)return;var row=field.closest('[data-purchase-index]');if(row)purchaseRows[Number(row.dataset.purchaseIndex)][field.dataset.purchaseField]=field.value;});
    mask.addEventListener('input',function(event){var field=event.target.closest('[data-material-field]');if(!field)return;var row=field.closest('[data-material-index]');if(row){materialRows[Number(row.dataset.materialIndex)][field.dataset.materialField]=field.value;mask.querySelector('[data-material-total]').textContent=materialTotal();}});
    mask.addEventListener('input',function(event){var field=event.target.closest('[data-combo-field="quantity"]');if(!field)return;var row=field.closest('[data-combo-index]');if(row)comboRows[Number(row.dataset.comboIndex)].quantity=field.value;});
    mask.addEventListener('change',function(event){var field=event.target.closest('[data-purchase-field]');if(!field)return;var row=field.closest('[data-purchase-index]');if(row)purchaseRows[Number(row.dataset.purchaseIndex)][field.dataset.purchaseField]=field.value;});
    mask.addEventListener('change',function(event){if(event.target.matches('[data-field="productType"]')){var nextType=event.target.value;if(nextType==='单品'&&comboRows.some(function(item){return item.sku;})){if(!window.confirm('切换为单品后将清除组合明细，是否继续？')){event.target.value='组合品';if(window.enhanceCustomSelects)window.enhanceCustomSelects();return;}comboRows=[];}setComboVisibility(nextType==='组合品');renderComboRows();}});
    mask.addEventListener('click',function(event){
      var close=event.target.closest('[data-editor-close]');
      if(close||event.target===mask){mask.remove();return;}
      if(event.target.closest('[data-editor-edit]')){setEditorMode(true);return;}
      var nav=event.target.closest('[data-editor-section]');
      if(nav){mask.querySelectorAll('[data-editor-section]').forEach(function(node){node.classList.remove('active');});nav.classList.add('active');mask.querySelector('#'+nav.dataset.editorSection).scrollIntoView({behavior:'smooth',block:'start'});return;}
      if(event.target.closest('[data-purchase-add]')){purchaseRows.push({code:'',name:'',partNo:'',priceExcl:'',priceIncl:'',cycle:'',moq:'',buyer:'Admin'});renderPurchaseRows();return;}
      if(event.target.closest('[data-combo-add]')){openComboPicker();return;}
      var comboRemove=event.target.closest('[data-combo-remove]');
      if(comboRemove){comboRows.splice(Number(comboRemove.dataset.comboRemove),1);renderComboRows();return;}
      var purchaseAction=event.target.closest('[data-purchase-action]');
      if(purchaseAction){var purchaseIndex=Number(purchaseAction.dataset.purchaseIndex),action=purchaseAction.dataset.purchaseAction;if(action==='default'&&purchaseIndex>0){purchaseRows.unshift(purchaseRows.splice(purchaseIndex,1)[0]);}else if(action==='delete'&&purchaseRows.length>1){purchaseRows.splice(purchaseIndex,1);}else if(action==='delete'){purchaseRows[0]={code:'',name:'',partNo:'',priceExcl:'',priceIncl:'',cycle:'',moq:'',buyer:'Admin'};}renderPurchaseRows();return;}
      var materialPicker=event.target.closest('[data-material-picker]');
      if(materialPicker){activeMaterialPicker=Number(materialPicker.dataset.materialPicker);renderMaterialRows();return;}
      var materialSelect=event.target.closest('[data-material-select]');
      if(materialSelect){var selectedMaterial=materialCatalog.find(function(item){return item.sku===materialSelect.dataset.materialSelect;}),selectedIndex=activeMaterialPicker;if(selectedMaterial!==undefined&&selectedIndex!==null){materialRows[selectedIndex]={sku:selectedMaterial.sku,name:selectedMaterial.name,cost:selectedMaterial.cost,ratio:materialRows[selectedIndex].ratio||'100',remark:selectedMaterial.remark||''};}activeMaterialPicker=null;renderMaterialRows();return;}
      if(event.target.closest('[data-material-add]')){materialRows.push({sku:'',name:'',cost:'',ratio:'100',remark:''});activeMaterialPicker=materialRows.length-1;renderMaterialRows();return;}
      var materialRemove=event.target.closest('[data-material-remove]');
      if(materialRemove){var materialIndex=Number(materialRemove.dataset.materialRemove);if(materialRows.length>1)materialRows.splice(materialIndex,1);else materialRows[0]={sku:'',name:'',cost:'',ratio:'100',remark:''};activeMaterialPicker=null;renderMaterialRows();return;}
      if(activeMaterialPicker!==null&&!event.target.closest('.material-selector')){activeMaterialPicker=null;renderMaterialRows();}
      if(event.target.closest('[data-image-local]')){var imageFileInput=mask.querySelector('[data-image-file]');if(imageFileInput)imageFileInput.click();return;}
      if(event.target.closest('[data-image-url]')){imageUrlPanelOpen=true;renderMedia();return;}
      if(event.target.closest('[data-image-url-cancel]')){imageUrlPanelOpen=false;renderMedia();return;}
      if(event.target.closest('[data-image-url-confirm]')){var imageUrlValue=mask.querySelector('[data-image-url-value]').value.trim();if(imageUrlValue){mediaItems.push({name:imageUrlValue.split('/').pop()||'网络图片',src:imageUrlValue});}imageUrlPanelOpen=false;renderMedia();return;}
      if(event.target.closest('[data-editor-save]')){
        var sku=mask.querySelector('[data-field="sku"]').value.trim(),name=mask.querySelector('[data-field="name"]').value.trim();
        if(!sku||!name){toast('请填写 SKU 和产品名称');return;}
        var selectedType=mask.querySelector('[data-field="productType"]').value,fitType=mask.querySelector('[data-field="fitType"]').value;
        if(!selectedType){toast('请选择产品类型');return;}
        if(!fitType){toast('请选择配货类型');return;}
        if(selectedType==='组合品'){
          if(!comboRows.length){toast('组合 SKU 至少需要配置一个子 SKU');return;}
          var comboSkus={},comboInvalid=false,comboDuplicate=false;
          comboRows.forEach(function(item){var childSku=String(item.sku||'').trim(),quantity=Number(item.quantity);if(!childSku||!Number.isInteger(quantity)||quantity<1)comboInvalid=true;if(childSku===sku)comboInvalid=true;if(childSku&&(comboSkus[childSku]))comboDuplicate=true;comboSkus[childSku]=true;});
          if(comboInvalid){toast('请完整填写子 SKU 编码和数量，数量须为大于 0 的整数');return;}
          if(comboDuplicate){toast('子 SKU 不能重复添加');return;}
        }
        var firstPurchase=purchaseRows[0]||{};
        var data={sku:sku,model:mask.querySelector('[data-field="model"]').value.trim()||sku,fitType:fitType,category1:mask.querySelector('[data-field="category1"]').value.trim()||'—',category2:mask.querySelector('[data-field="category2"]').value.trim()||'—',name:name,productType:selectedType,comboItems:selectedType==='组合品'?comboRows.map(function(item){return {sku:item.sku,quantity:Number(item.quantity)};}):[],salesStatus:mask.querySelector('[data-field="salesStatus"]').value,unit:mask.querySelector('[data-field="unit"]').value.trim()||'件',owner:mask.querySelector('[data-field="owner"]').value.trim()||'—',creator:mask.querySelector('[data-field="creator"]').value.trim()||'—',logistics:mask.querySelector('[data-field="logistics"]').value,supplier:firstPurchase.name||'—',supplierCount:purchaseRows.filter(function(row){return row.name;}).length||1,price:firstPurchase.priceExcl||'—',purchaseSuppliers:purchaseRows.map(function(row){return Object.assign({},row);}),materials:materialRows.map(function(row){return Object.assign({},row);}),images:mediaItems.map(function(item){return Object.assign({},item);})};
        if(editing)Object.assign(editing,data);else products.unshift(Object.assign({id:Date.now(),barcode:'—',createdAt:new Date().toISOString().slice(0,16).replace('T',' '),icon:'◈'},data));
        filtered=products.slice();mask.remove();render();toast('SKU 产品信息已保存');
      }
    });
    mask.addEventListener('change',function(event){if(event.target.matches('[data-image-file]'))addMediaFiles(event.target.files);});
    mask.addEventListener('dragover',function(event){if(event.target.closest('.image-drop-area'))event.preventDefault();});
    mask.addEventListener('drop',function(event){if(!event.target.closest('.image-drop-area'))return;event.preventDefault();addMediaFiles(event.dataTransfer.files);});
  }
  document.querySelector('#searchButton').addEventListener('click',search);document.querySelector('#keyword').addEventListener('keydown',function(e){if(e.key==='Enter')search();});document.querySelector('#skuSearchType').addEventListener('change',syncSkuQueryPlaceholder);document.querySelector('#category1').addEventListener('change',syncCategory2);document.querySelector('#resetButton').addEventListener('click',function(){document.querySelector('#keyword').value='';document.querySelector('#skuSearchType').value='sku';syncSkuQueryPlaceholder();document.querySelector('#category1').value='';document.querySelector('#category2').value='';syncCategory2();document.querySelector('#productType').value='';document.querySelector('#salesStatus').value='';document.querySelector('#owner').value='';document.querySelector('#logisticsType').value='';document.querySelector('#supplier').value='';document.querySelector('#startDate').value='';document.querySelector('#endDate').value='';updateDateLabel('startDate');updateDateLabel('endDate');filtered=products.slice();selected.clear();render();});
  function toast(text){var node=document.createElement('div');node.className='toast';node.textContent=text;document.body.appendChild(node);window.setTimeout(function(){node.remove();},2200);}
  function openComboSummary(row){
    var items=Array.isArray(row.comboItems)?row.comboItems:[],mask=document.createElement('div');
    mask.className='combo-summary-mask';
    mask.innerHTML='<section class="combo-summary-dialog" role="dialog" aria-modal="true" aria-label="组合 SKU 明细"><header><div><h2>组合 SKU 明细</h2><span>'+escapeHtml(row.sku)+' 的子 SKU 配置</span></div><button type="button" class="combo-summary-close" aria-label="关闭">×</button></header><div class="combo-summary-body"><table><thead><tr><th>SKU</th><th>产品名称</th><th>产品类目</th><th>品牌</th><th>型号</th><th>销售状态</th><th>单位</th><th>数量</th></tr></thead><tbody>'+items.map(function(item){var child=products.find(function(product){return product.sku===item.sku;});return '<tr><td class="combo-summary-sku">'+escapeHtml(item.sku)+'</td><td>'+escapeHtml(child?child.name:'—')+'</td><td>'+escapeHtml(child?((child.category1||'—')+' / '+(child.category2||'—')):'—')+'</td><td>'+escapeHtml(child&&child.brand||'—')+'</td><td>'+escapeHtml(child&&child.model||'—')+'</td><td><span class="status '+salesStatusClass(child&&child.salesStatus||'')+'">'+escapeHtml(child&&child.salesStatus||'—')+'</span></td><td>'+escapeHtml(child&&child.unit||'—')+'</td><td>'+escapeHtml(item.quantity||1)+'</td></tr>';}).join('')+(items.length?'':'<tr><td colspan="8" class="combo-summary-empty">暂无子 SKU</td></tr>')+'</tbody></table></div></section>';
    document.body.appendChild(mask);
    mask.addEventListener('click',function(event){if(event.target===mask||event.target.closest('.combo-summary-close'))mask.remove();});
  }
  function openLog(row){
    var logs=[
      {type:'编辑',content:'更新了规格、物流属性和供应商信息',operator:'Admin',time:'2026-09-20 10:30'},
      {type:'新增',content:'新增 SKU 产品档案',operator:'Admin',time:row.createdAt}
    ];
    var mask=document.createElement('div');
    mask.className='purchase-log-modal';
    mask.innerHTML='<div class="purchase-log-dialog" role="dialog" aria-modal="true" aria-label="产品操作日志"><header class="purchase-log-header"><div><h2>操作日志</h2><span>产品 SKU：'+escapeHtml(row.sku)+'</span></div><button class="purchase-log-close" type="button" aria-label="关闭操作日志">×</button></header><div class="purchase-log-body"><div class="purchase-log-table-card"><table class="purchase-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>'+logs.map(function(log){return '<tr><td>'+log.type+'</td><td class="purchase-log-content">'+log.content+'</td><td>'+log.operator+'</td><td>'+log.time+'</td></tr>';}).join('')+'</tbody></table></div></div><footer class="purchase-log-footer"><span>共 '+logs.length+' 条</span><div><button class="purchase-log-page" type="button" disabled>‹</button><button class="purchase-log-page active" type="button">1</button><button class="purchase-log-page" type="button" disabled>›</button></div></footer></div>';
    document.body.appendChild(mask);
    mask.addEventListener('click',function(event){if(event.target===mask||event.target.closest('.purchase-log-close'))mask.remove();});
  }
  function pushTargets(mode){return mode==='both'?['易仓','领星']:[mode==='echang'?'易仓':'领星'];}
  function pushTitle(mode){return mode==='both'?'推送产品至易仓和领星':mode==='echang'?'推送产品至易仓':'推送产品至领星';}
  function pushStatusText(status){return {pending:'待推送',running:'推送中',success:'成功',failed:'失败'}[status]||'待推送';}
  function openPushProgress(mode){
    var sourceRows=products.filter(function(row){return selected.has(row.id);});
    if(!sourceRows.length){toast('请先选择需要推送的产品');return;}
    var targets=pushTargets(mode),entries=sourceRows.map(function(product){return {product:product,steps:targets.map(function(target){return {target:target,status:'pending',reason:'',attempts:0};})};}),mask=document.createElement('div'),isRunning=false;
    mask.className='ui-dialog-mask product-push-mask';
    function allSteps(){return entries.reduce(function(list,entry){return list.concat(entry.steps);},[]);}
    function counts(){return allSteps().reduce(function(result,step){result.total+=1;result[step.status]+=1;return result;},{total:0,pending:0,running:0,success:0,failed:0});}
    function resultText(entry){var failed=entry.steps.filter(function(step){return step.status==='failed';}),running=entry.steps.some(function(step){return step.status==='running';}),pending=entry.steps.some(function(step){return step.status==='pending';});if(failed.length)return {text:failed.map(function(step){return step.target+'：'+step.reason;}).join('；'),failed:true};if(running)return {text:'正在推送',failed:false};if(pending)return {text:'—',failed:false};return {text:'推送完成',failed:false};}
    function renderPush(){
      var total=counts(),finished=total.success+total.failed,hasFailed=total.failed>0,allDone=!isRunning&&finished===total.total;
      mask.className='ui-dialog-mask product-push-mask'+(isRunning?' is-running':'');
      mask.innerHTML='<section class="ui-dialog ui-dialog--progress product-push-dialog'+(isRunning?' is-running':'')+'" role="dialog" aria-modal="true" aria-label="'+pushTitle(mode)+'"><header class="ui-dialog__header"><div><h2>'+pushTitle(mode)+'</h2><p>已选择 '+entries.length+' 个产品 · 共 '+total.total+' 项推送任务</p></div><button class="ui-dialog__close" type="button" data-push-close aria-label="关闭">×</button></header><div class="ui-dialog__body"><div class="ui-progress-summary"><span class="ui-progress-summary__item">待推送 <b>'+total.pending+'</b></span><span class="ui-progress-summary__item">推送中 <b>'+total.running+'</b></span><span class="ui-progress-summary__item ui-progress-summary__item--success">成功 <b>'+total.success+'</b></span><span class="ui-progress-summary__item ui-progress-summary__item--failed">失败 <b>'+total.failed+'</b></span></div><div class="ui-progress-card product-push-table-wrap"><table class="ui-table ui-progress-table product-push-table"><thead><tr><th>SKU</th><th>产品信息</th><th>推送目标</th><th>推送状态</th><th>推送结果</th></tr></thead><tbody>'+entries.map(function(entry){var result=resultText(entry);return '<tr><td>'+escapeHtml(entry.product.sku)+'</td><td><div class="ui-progress-product"><span class="ui-progress-product__image" aria-hidden="true">▧</span><span class="ui-progress-product__name" title="'+escapeHtml(entry.product.name)+'">'+escapeHtml(entry.product.name)+'</span></div></td><td><div class="ui-progress-targets">'+entry.steps.map(function(step){return '<span>'+step.target+'</span>';}).join('')+'</div></td><td><div class="ui-progress-statuses">'+entry.steps.map(function(step){return '<span class="ui-progress-status ui-progress-status--'+step.status+'">'+pushStatusText(step.status)+'</span>';}).join('')+'</div></td><td><span class="ui-progress-result'+(result.failed?' is-failed':'')+'" title="'+escapeHtml(result.text)+'">'+escapeHtml(result.text)+'</span></td></tr>';}).join('')+'</tbody></table></div></div><footer class="ui-dialog__footer ui-progress-footer"><span class="ui-progress-footer__text">进度：'+finished+' / '+total.total+' 项任务已完成</span><div class="ui-progress-footer__actions">'+(isRunning?'<button class="ui-button ui-button--primary" type="button" disabled>推送中</button>':allDone?(hasFailed?'<button class="ui-button" type="button" data-push-retry>重试失败项</button>':'')+'<button class="ui-button ui-button--primary" type="button" data-push-close>关闭</button>':'<button class="ui-button" type="button" data-push-close>取消</button><button class="ui-button ui-button--primary" type="button" data-push-start>开始推送</button>')+'</div></footer></section>';
    }
    function runTasks(retryOnly){
      var queue=[];entries.forEach(function(entry){entry.steps.forEach(function(step){if(!retryOnly||step.status==='failed'){if(retryOnly){step.status='pending';step.reason='';}queue.push({entry:entry,step:step});}});});
      if(!queue.length)return;
      isRunning=true;renderPush();
      function next(){
        var current=queue.shift();
        if(!current){isRunning=false;renderPush();return;}
        current.step.status='running';renderPush();
        window.setTimeout(function(){
          current.step.attempts+=1;
          if(current.entry.product.sku==='PLASMA-45'&&current.step.target==='领星'&&current.step.attempts===1){current.step.status='failed';current.step.reason='领星 SKU 已存在';}else{current.step.status='success';current.step.reason='';}
          next();
        },480);
      }
      next();
    }
    function close(){if(!isRunning)mask.remove();}
    document.body.appendChild(mask);renderPush();
    mask.addEventListener('click',function(event){
      if((event.target===mask||event.target.closest('[data-push-close]'))&&!isRunning){close();return;}
      if(event.target.closest('[data-push-start]'))runTasks(false);
      if(event.target.closest('[data-push-retry]'))runTasks(true);
    });
    mask.addEventListener('keydown',function(event){if(event.key==='Escape'&&!isRunning)close();});
    mask.querySelector('[data-push-start], [data-push-close]').focus();
  }
  function openBatch(){var mask=document.createElement('div');mask.className='modal-mask';mask.innerHTML='<section class="modal"><header><h2>批量编辑产品</h2><button class="modal-close" type="button">×</button></header><div class="modal-body"><p class="batch-note">将更新已选择的 '+selected.size+' 个 SKU；留空的字段不修改。</p><div class="form-grid"><label>销售状态<select id="batchSalesStatus"><option value="">不修改</option><option>新品</option><option>常规</option><option>清仓</option><option>停售</option></select></label><label>物流属性<select id="batchLogistics"><option value="">不修改</option><option>普货</option><option>带电</option><option>带磁</option><option>敏感货</option></select></label><label class="span-2">产品负责人<select id="batchOwner"><option value="">不修改</option><option>Admin</option><option>张三</option><option>李四</option></select></label></div></div><footer><button class="button" type="button" data-cancel>取消</button><button class="button primary" type="button" data-save>保存</button></footer></section>';document.body.appendChild(mask);mask.addEventListener('click',function(e){if(e.target===mask||e.target.closest('[data-cancel]')||e.target.closest('.modal-close'))mask.remove();if(e.target.closest('[data-save]')){var salesStatus=mask.querySelector('#batchSalesStatus').value,logistics=mask.querySelector('#batchLogistics').value,owner=mask.querySelector('#batchOwner').value;products.forEach(function(row){if(selected.has(row.id)){if(salesStatus)row.salesStatus=salesStatus;if(logistics)row.logistics=logistics;if(owner)row.owner=owner;}});mask.remove();toast('已批量更新 '+selected.size+' 个 SKU');render();}});}
  document.querySelector('#selectAll').addEventListener('change',function(e){filtered.forEach(function(row){if(e.target.checked)selected.add(row.id);else selected.delete(row.id);});render();});body.addEventListener('change',function(e){if(!e.target.matches('.row-check'))return;var id=Number(e.target.dataset.id);if(e.target.checked)selected.add(id);else selected.delete(id);render();});body.addEventListener('click',function(e){var button=e.target.closest('[data-action]');if(!button)return;var row=products.find(function(item){return item.id===Number(button.dataset.id);});if(!row)return;if(button.dataset.action==='view')openModal(row,{readOnly:true});if(button.dataset.action==='edit')openModal(row,{readOnly:false});if(button.dataset.action==='combo')openComboSummary(row);if(button.dataset.action==='log')openLog(row);});
  document.querySelector('#addButton').addEventListener('click',function(){openModal();});document.querySelector('#batchButton').addEventListener('click',openBatch);document.querySelector('#importButton').addEventListener('click',function(){toast('导入模板已准备，仅包含 SKU 维度字段。');});document.querySelector('#exportButton').addEventListener('click',function(){toast('已按当前条件导出 '+filtered.length+' 条 SKU 产品。');});
  (function(){
    var trigger=document.querySelector('#pushButton'),menu=document.querySelector('#pushMenuPanel'),wrap=trigger.closest('.push-menu');
    function closeMenu(){menu.hidden=true;trigger.setAttribute('aria-expanded','false');wrap.classList.remove('is-open');}
    trigger.addEventListener('click',function(event){event.stopPropagation();var shouldOpen=menu.hidden;menu.hidden=!shouldOpen;trigger.setAttribute('aria-expanded',String(shouldOpen));wrap.classList.toggle('is-open',shouldOpen);});
    menu.addEventListener('click',function(event){var item=event.target.closest('[data-push-target]');if(!item)return;closeMenu();openPushProgress(item.dataset.pushTarget);});
    document.addEventListener('click',function(event){if(!event.target.closest('.push-menu'))closeMenu();});
  }());
  document.querySelector('#columnButton').addEventListener('click',function(){var panel=document.querySelector('#columnPanel'),show=panel.hidden;panel.hidden=!show;this.setAttribute('aria-expanded',String(show));});document.querySelector('#columnPanel').addEventListener('change',function(e){if(e.target.matches('[data-column]'))setColumn(e.target.dataset.column,e.target.checked);});
  syncCategory2();syncSkuQueryPlaceholder();updateDateLabel('startDate');updateDateLabel('endDate');render();
})();
