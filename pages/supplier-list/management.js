(function () {
  'use strict';
  var storageKey = 'middle-platform-supplier-management-v12';
  var seed = [
    ['苏州赛美体育用品有限公司','GYS15354','焊接耗材','采购员A,采购员B','创建人A',1],
    ['深圳市康仕达科技有限公司','GYS15353','焊接设备','采购员A,采购员B','创建人A',0],
    ['东莞市华诚包装材料有限公司','GYS15352','包装辅料','采购员D','创建人B',0],
    ['常州佳士达焊材有限公司','GYS15351','焊接耗材','采购员A,采购员B','创建人A',1],
    ['梧州市友盟焊接防护用品有限公司','GYS15350','防护用品','采购员A,采购员B','创建人A',1],
    ['江苏奥信光电科技有限公司','GYS15349','焊接设备','采购员A,采购员B','创建人D',0],
    ['义乌市优品贸易有限公司','GYS15348','防护用品','采购员C','创建人C',3],
    ['深圳市睿达供应链有限公司','GYS15347','焊接设备','采购员A','创建人E',3],
    ['宁波锐虎机械有限公司','GYS15346','焊接设备','采购员A,采购员B','创建人D',0],
    ['上海联益工业设备有限公司','GYS15345','焊接设备','采购员A,采购员B','创建人D',0],
    ['杭州泽华五金有限公司','GYS15344','包装辅料','采购员B','创建人A',2],
    ['佛山市鼎盛焊材有限公司','GYS15343','焊接耗材','采购员C','创建人B',0]
  ];
  function example(row, index) {
    var createdAt='2026-09-'+String(28-index).padStart(2,'0')+' 09:00:00';
    return {name:row[0],shortName:row[0].replace(/(有限责任公司|有限公司)$/,''),code:row[1],category:row[2],buyer:row[3].split(',')[0],status:'合作中',supplierLevel:'',creator:row[4],editor:row[4],skuCount:row[5],amount:0,paymentChannel:'线上支付宝',developer:'开发员A',createdAt:createdAt,updatedAt:createdAt,creditCode:'91320594MAK22J3668',capital:'5',registrationDate:'2025-11-28',returns:'否',returnDays:'7',province:'江苏省',city:'苏州市',district:'工业园区',registeredAddress:row[0],freeShipping:'否',currency:'人民币（CNY）',invoice:'否',invoiceTaxRate:'',receivedTaxRate:'',paymentMethod:'款到发货',settlementNote:'',remark:'',contacts:[{name:'联系人A',phone:'17751242848',telephone:'',wechat:'',email:'',default:true}],shipping:[{province:'江苏省',city:'苏州市',district:'工业园区',detail:'',default:true}],returnsAddresses:[{province:'江苏省',city:'苏州市',district:'工业园区',detail:'',default:true}],logs:[{type:'新增',content:'新增供应商信息',operator:row[4],time:createdAt}]};
  }
  var suppliers;
  try { suppliers = JSON.parse(localStorage.getItem(storageKey)); } catch (error) { suppliers = null; }
  if (!Array.isArray(suppliers)) suppliers = seed.map(example);
  var applied = {};
  var page = 1;
  var pageSize = 10;
  var editingCode = null;
  var logState = {row:null,page:1,pageSize:10};
  var form = document.querySelector('#supplierForm');
  var $ = function (selector) { return document.querySelector(selector); };
  function clean(value) { return String(value == null ? '' : value).replace(/[&<>"']/g,function (char) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]; }); }
  function save() { try { localStorage.setItem(storageKey,JSON.stringify(suppliers)); } catch (error) { /* local file fallback */ } }
  function clock() { var date=new Date(), pad=function(value){return String(value).padStart(2,'0');};return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+' '+pad(date.getHours())+':'+pad(date.getMinutes())+':'+pad(date.getSeconds()); }
  function toast(message) { var node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.classList.remove('show');},2600); }
  function log(supplier,type,content) { var time=clock();supplier.logs=supplier.logs||[];supplier.logs.unshift({type:type,content:content,operator:'系统用户',time:time});supplier.editor='系统用户';supplier.updatedAt=time; }
  function nextCode() { var max=suppliers.reduce(function(acc,row){var match=String(row.code).match(/\d+$/);return Math.max(acc,match?Number(match[0]):0);},15354);return 'GYS'+String(max+1); }
  function updateSelect(selector,values) { var select=$(selector), current=select.value;var initial=select.options[0].outerHTML;select.innerHTML=initial+Array.from(new Set(values.filter(Boolean))).sort().map(function(value){return '<option>'+clean(value)+'</option>';}).join('');select.value=current; }
  function updateFilterChoices() {
    updateSelect('#filterBuyer',suppliers.flatMap(function(row){return (row.buyer||'').split(',');}));
  }
  function filtersFromPage() {
    return {code:$('#filterCode').value.trim(),name:$('#filterName').value.trim(),buyer:$('#filterBuyer').value,levels:selectedLevels(),settlement:$('#filterSettlement').value,payment:$('#filterPayment').value};
  }
  function selectedLevels() { return Array.from(document.querySelectorAll('#filterLevelMenu input:checked')).map(function(input){return input.value;}); }
  function syncLevelFilter() { var levels=selectedLevels(), button=$('#filterLevelButton');button.firstChild.textContent=levels.length?'供应商等级（'+levels.join('、')+'）':'供应商等级（全部）'; }
  function filtered() {
    var codes=applied.code?applied.code.split(/[\s,，;；]+/).filter(Boolean):[];
    return suppliers.filter(function(row){
      if (codes.length && codes.indexOf(row.code)<0) return false;
      if (applied.name && row.name.indexOf(applied.name)<0 && (row.shortName||'').indexOf(applied.name)<0) return false;
      if (applied.buyer && (row.buyer||'').indexOf(applied.buyer)<0) return false;
      if (applied.levels && applied.levels.length && applied.levels.indexOf(row.supplierLevel)<0) return false;
      if (applied.settlement && row.paymentMethod!==applied.settlement) return false;
      if (applied.payment && row.paymentChannel!==applied.payment) return false;
      return true;
    });
  }
  function render() {
    updateFilterChoices();
    var rows=filtered(), pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages);
    var visible=rows.slice((page-1)*pageSize,page*pageSize);
    $('#tableBody').innerHTML=visible.map(function(row){
      return '<tr><td><span class="cell-copy"><button class="row-link" data-action="edit" data-code="'+clean(row.code)+'">'+clean(row.name)+'</button><button class="copy-icon" type="button" data-copy="'+clean(row.name)+'" aria-label="复制供应商名称" title="复制供应商名称"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="2.5" width="7.5" height="9" rx="1"/><path d="M10.5 11.5v1.1a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1h2"/></svg></button></span></td>'+
        '<td><span class="cell-copy"><span>'+clean(row.code)+'</span><button class="copy-icon" type="button" data-copy="'+clean(row.code)+'" aria-label="复制供应商编码" title="复制供应商编码"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="2.5" width="7.5" height="9" rx="1"/><path d="M10.5 11.5v1.1a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1h2"/></svg></button></span></td>'+
        '<td>'+clean(row.shortName||'')+'</td><td>'+clean(row.supplierLevel||'')+'</td><td>'+clean(row.status||'合作中')+'</td><td>'+clean(row.buyer||'')+'</td><td>'+clean(row.paymentMethod||'—')+'</td><td>'+clean(row.paymentChannel||'—')+'</td><td>'+clean(row.invoice||'—')+'</td><td>'+clean(row.creator||'—')+'</td><td>'+clean(row.createdAt||'—')+'</td>'+
        '<td><button class="row-action" data-action="edit" data-code="'+clean(row.code)+'">编辑</button><button class="row-action" data-action="log" data-code="'+clean(row.code)+'">日志</button></td></tr>';
    }).join('');
    $('#emptyState').hidden=rows.length>0;
    $('#resultCount').textContent='共 '+rows.length+' 条';
    $('#pageNumber').textContent=String(page)+' / '+String(pages);
    $('#prevPage').disabled=page===1;$('#nextPage').disabled=page===pages;
  }
  function setField(name,value) { var input=form.elements.namedItem(name);if(input)input.value=value==null?'':String(value); }
  function getField(name) { var input=form.elements.namedItem(name);return input?String(input.value).trim():''; }
  function updateInvoiceFields() {
    var invoice=getField('invoice');
    $('#invoiceTaxField').hidden=invoice!=='增值税普通发票'&&invoice!=='增值税专用发票';
    $('#receivedTaxField').hidden=invoice!=='增值税专用发票';
    var invoiceTax=form.elements.namedItem('invoiceTaxRate'),receivedTax=form.elements.namedItem('receivedTaxRate');
    var syncOptions=function(select,values){var current=select.value;select.innerHTML='<option value="">请选择</option>'+values.map(function(value){return '<option>'+value+'</option>';}).join('');select.value=values.indexOf(current)>=0?current:'';};
    if(invoice==='增值税普通发票')syncOptions(invoiceTax,['免税','1%','3%','6%','9%','13%']);
    if(invoice==='增值税专用发票')syncOptions(invoiceTax,['1%','3%','6%','9%','13%']);
    syncOptions(receivedTax,['1%','3%','6%','9%','13%']);
    if(invoice==='否'){invoiceTax.value='';receivedTax.value='';}
    if(invoice!=='增值税专用发票')receivedTax.value='';
  }
  function contactRow(data) {
    data=data||{};return '<div class="repeat-row contact" data-repeat="contact"><input data-key="name" placeholder="联系人" value="'+clean(data.name||'')+'"><input data-key="phone" placeholder="手机号码" value="'+clean(data.phone||'')+'"><input data-key="telephone" placeholder="联系电话" value="'+clean(data.telephone||'')+'"><input data-key="wechat" placeholder="微信号" value="'+clean(data.wechat||'')+'"><input data-key="email" placeholder="电子邮箱" value="'+clean(data.email||'')+'"><span class="repeat-actions"><label class="default-radio"><input type="radio" name="defaultContact" '+(data.default?'checked':'')+'><i></i>设为默认</label><button class="delete-line" type="button" data-remove aria-label="删除联系人" title="删除"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 4.5h9M6 2.5h4m-5 2v8.5h6V4.5M6.8 7v3.5m2.4-3.5v3.5"/></svg></button></span></div>';
  }
  function addressRow(data,kind) {
    data=data||{};return '<div class="repeat-row address" data-repeat="'+kind+'"><input data-key="province" placeholder="省" value="'+clean(data.province||'')+'"><input data-key="city" placeholder="市" value="'+clean(data.city||'')+'"><input data-key="district" placeholder="区" value="'+clean(data.district||'')+'"><input data-key="detail" placeholder="详细地址" value="'+clean(data.detail||'')+'"><span class="repeat-actions"><label class="default-radio"><input type="radio" name="default'+kind+'" '+(data.default?'checked':'')+'><i></i>设为默认</label><button class="delete-line" type="button" data-remove aria-label="删除地址" title="删除"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 4.5h9M6 2.5h4m-5 2v8.5h6V4.5M6.8 7v3.5m2.4-3.5v3.5"/></svg></button></span></div>';
  }
  function rowsFrom(container) {
    return Array.from(container.querySelectorAll('[data-repeat]')).map(function(node){
      var result={};node.querySelectorAll('[data-key]').forEach(function(input){result[input.dataset.key]=input.value.trim();});
      var radio=node.querySelector('input[type=radio]');if(radio)result.default=radio.checked;return result;
    });
  }
  function openEdit(row) {
    editingCode=row?row.code:null;form.reset();$('#formError').textContent='';
    $('#editTitle').textContent=row?'编辑供应商信息':'新增供应商信息';
    var data=row||{code:nextCode(),createdAt:clock(),returns:'否',returnDays:'',buyer:'',status:'合作中',supplierLevel:'',freeShipping:'否',currency:'人民币（CNY）',invoice:'否',invoiceTaxRate:'',receivedTaxRate:'',paymentMethod:'款到发货',paymentChannel:'线上支付宝',contacts:[{}],shipping:[{}],returnsAddresses:[{}]};
    Array.from(form.querySelectorAll('[name]')).forEach(function(input){if(input.type!=='file')setField(input.name,data[input.name]);});
    $('#contacts').innerHTML=(data.contacts||[{}]).map(contactRow).join('');
    $('#shippingAddresses').innerHTML=(data.shipping||[{}]).map(function(address){return addressRow(address,'shipping');}).join('');
    $('#returnAddresses').innerHTML=(data.returnsAddresses||[{}]).map(function(address){return addressRow(address,'return');}).join('');
    updateInvoiceFields();
    form.querySelectorAll('input[type=file]').forEach(function(input){input.closest('label').classList.remove('has-file');input.closest('label').querySelector('.upload-box').textContent='＋';});
    $('#editMask').hidden=false;$('#editScroll').scrollTop=0;setActiveModalAnchor('companyInfo');form.elements.namedItem('name').focus();
  }
  function validate() {
    var required=Array.from(form.querySelectorAll('[required]'));
    var missing=required.find(function(input){return !String(input.value).trim();});
    if(missing){$('#formError').textContent='请填写完整的必填信息';missing.focus();missing.scrollIntoView({block:'center',behavior:'smooth'});return false;}
    var name=getField('name');
    if(suppliers.some(function(row){return row.name===name&&row.code!==editingCode;})){$('#formError').textContent='供应商名称已存在';form.elements.namedItem('name').focus();return false;}
    $('#formError').textContent='';return true;
  }
  function saveForm() {
    if(!validate())return;
    var row=editingCode?suppliers.find(function(item){return item.code===editingCode;}):null;
    var previous=row;
    if(!row){row={code:nextCode(),creator:'系统用户',skuCount:0,amount:0,logs:[]};suppliers.unshift(row);}
    Array.from(form.querySelectorAll('[name]')).forEach(function(input){if(input.type!=='file'&&input.name!=='code')row[input.name]=String(input.value).trim();});
    row.contacts=rowsFrom($('#contacts'));row.shipping=rowsFrom($('#shippingAddresses'));row.returnsAddresses=rowsFrom($('#returnAddresses'));
    log(row,editingCode?'编辑':'新增',editingCode?'编辑供应商信息':'新增供应商信息');
    if(!previous)row.createdAt=getField('createdAt');
    save();$('#editMask').hidden=true;page=1;render();toast(editingCode?'保存成功':'新增成功');
  }
  function renderLog() {
    var logs=(logState.row&&logState.row.logs)||[],pages=Math.max(1,Math.ceil(logs.length/logState.pageSize));
    logState.page=Math.min(logState.page,pages);
    var rows=logs.slice((logState.page-1)*logState.pageSize,logState.page*logState.pageSize);
    $('#logSupplierName').textContent='供应商：'+logState.row.name+'（'+logState.row.code+'）';
    $('#logBody').innerHTML=rows.map(function(item){return '<tr><td>'+clean(item.type)+'</td><td>'+clean(item.content)+'</td><td>'+clean(item.operator)+'</td><td>'+clean(item.time)+'</td></tr>';}).join('')||'<tr><td colspan="4">暂无操作日志</td></tr>';
    $('#logCount').textContent='共 '+logs.length+' 条';
    $('#logPager').innerHTML='<button class="supplier-log-page" type="button" data-log-page="'+Math.max(1,logState.page-1)+'" '+(logState.page===1?'disabled':'')+'>‹</button>'+Array.from({length:pages},function(_,index){var target=index+1;return '<button class="supplier-log-page '+(target===logState.page?'active':'')+'" type="button" data-log-page="'+target+'">'+target+'</button>';}).join('')+'<button class="supplier-log-page" type="button" data-log-page="'+Math.min(pages,logState.page+1)+'" '+(logState.page===pages?'disabled':'')+'>›</button>';
  }
  function openLog(row) { logState={row:row,page:1,pageSize:10};renderLog();$('#logMask').hidden=false; }
  function copyText(value) {
    var fallback=function(){var input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);input.select();try{document.execCommand('copy');toast('已复制');}catch(error){toast('复制失败');}input.remove();};
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(value).then(function(){toast('已复制');}).catch(fallback);return;}
    fallback();
  }
  var modalScroll=$('#editScroll');
  var modalAnchorButtons=Array.from(document.querySelectorAll('[data-modal-anchor]'));
  function setActiveModalAnchor(id) {
    modalAnchorButtons.forEach(function(button){button.classList.toggle('active',button.dataset.modalAnchor===id);});
  }
  function updateModalAnchor() {
    if ($('#editMask').hidden) return;
    var current='companyInfo';
    var threshold=modalScroll.getBoundingClientRect().top+76;
    modalAnchorButtons.forEach(function(button){
      var section=$('#'+button.dataset.modalAnchor);
      if(section&&section.getBoundingClientRect().top<=threshold)current=button.dataset.modalAnchor;
    });
    setActiveModalAnchor(current);
  }
  modalAnchorButtons.forEach(function(button){button.addEventListener('click',function(){
    var section=$('#'+button.dataset.modalAnchor);
    if(!section)return;
    var offset=section.getBoundingClientRect().top-modalScroll.getBoundingClientRect().top;
    modalScroll.scrollTo({top:modalScroll.scrollTop+offset-8,behavior:'smooth'});
    setActiveModalAnchor(button.dataset.modalAnchor);
  });});
  modalScroll.addEventListener('scroll',updateModalAnchor,{passive:true});
  document.addEventListener('click',function(event){
    var copy=event.target.closest('[data-copy]');if(copy){copyText(copy.dataset.copy);return;}
    var action=event.target.closest('[data-action]');if(action){var row=suppliers.find(function(item){return item.code===action.dataset.code;});if(!row)return;
      if(action.dataset.action==='edit')openEdit(row);
      if(action.dataset.action==='log')openLog(row);
      return;
    }
    var add=event.target.closest('[data-add]');if(add){var kind=add.dataset.add;if(kind==='contact')$('#contacts').insertAdjacentHTML('beforeend',contactRow({}));if(kind==='shipping')$('#shippingAddresses').insertAdjacentHTML('beforeend',addressRow({},kind));if(kind==='return')$('#returnAddresses').insertAdjacentHTML('beforeend',addressRow({},kind));return;}
    var logPage=event.target.closest('[data-log-page]');if(logPage&&!logPage.disabled){logState.page=Number(logPage.dataset.logPage);renderLog();return;}
    var remove=event.target.closest('[data-remove]');if(remove){remove.closest('[data-repeat]').remove();return;}
    var close=event.target.closest('[data-close]');if(close){$('#'+close.dataset.close+'Mask').hidden=true;return;}
  });
  $('#searchButton').addEventListener('click',function(){applied=filtersFromPage();page=1;render();});
  $('#filterLevelButton').addEventListener('click',function(event){event.stopPropagation();var menu=$('#filterLevelMenu'), opening=menu.hidden;menu.hidden=!opening;this.setAttribute('aria-expanded',String(opening));});
  document.querySelectorAll('#filterLevelMenu input').forEach(function(input){input.addEventListener('change',syncLevelFilter);});
  document.addEventListener('click',function(event){var wrap=$('#filterLevelWrap');if(!wrap.contains(event.target)){$('#filterLevelMenu').hidden=true;$('#filterLevelButton').setAttribute('aria-expanded','false');}});
  $('#resetButton').addEventListener('click',function(){document.querySelectorAll('.query-grid input,.query-grid select').forEach(function(input){if(input.type==='checkbox')input.checked=false;else input.value='';});syncLevelFilter();applied={};page=1;render();});
  $('#filterCode').addEventListener('keydown',function(event){if(event.key==='Enter')$('#searchButton').click();});
  $('#filterName').addEventListener('keydown',function(event){if(event.key==='Enter')$('#searchButton').click();});
  $('#prevPage').addEventListener('click',function(){page--;render();});
  $('#nextPage').addEventListener('click',function(){page++;render();});
  $('#addButton').addEventListener('click',function(){openEdit(null);});
  $('#saveButton').addEventListener('click',saveForm);
  form.elements.namedItem('invoice').addEventListener('change',function(){setField('invoiceTaxRate','');setField('receivedTaxRate','');updateInvoiceFields();});
  form.querySelectorAll('input[type=file]').forEach(function(input){input.addEventListener('change',function(){var file=input.files[0], box=input.closest('label').querySelector('.upload-box'), valid=/\.(pdf|jpe?g|png)$/i.test(file&&file.name||'');if(file&&(!valid||file.size>10*1024*1024)){input.value='';box.textContent='＋';input.closest('label').classList.remove('has-file');toast(!valid?'仅支持 PDF、JPG、PNG 文件':'单个文件不能超过 10MB');return;}box.textContent=file?file.name:'＋';input.closest('label').classList.toggle('has-file',!!file);});});
  document.addEventListener('keydown',function(event){if(event.key==='Escape')document.querySelectorAll('.modal-mask').forEach(function(mask){mask.hidden=true;});});
  render();
})();
