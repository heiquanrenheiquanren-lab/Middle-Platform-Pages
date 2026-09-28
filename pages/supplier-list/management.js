(function () {
  'use strict';
  var storageKey = 'middle-platform-supplier-management-v2';
  var seed = [
    ['苏州赛美体育用品有限公司','GYS15354','合作中','焊接耗材','黄佳旋,陈平','许树娴',1],
    ['深圳市康仕达科技有限公司','GYS15353','合作中','焊接设备','黄佳旋,陈平','许树娴',0],
    ['东莞市华诚包装材料有限公司','GYS15352','待审核','包装辅料','林清秀','伍子倩',0],
    ['常州佳士达焊材有限公司','GYS15351','合作中','焊接耗材','黄佳旋,陈平','许树娴',1],
    ['梧州市友盟焊接防护用品有限公司','GYS15350','草稿','防护用品','黄佳旋,陈平','许树娴',1],
    ['江苏奥信光电科技有限公司','GYS15349','禁用','焊接设备','黄佳旋,陈平','巫诗竹',0],
    ['义乌市优品贸易有限公司','GYS15348','合作中','防护用品','刘秋平','卢美群',3],
    ['深圳市睿达供应链有限公司','GYS15347','合作中','焊接设备','黄佳旋','周晶',3],
    ['宁波锐虎机械有限公司','GYS15346','待审核','焊接设备','黄佳旋,陈平','巫诗竹',0],
    ['上海联益工业设备有限公司','GYS15345','合作中','焊接设备','黄佳旋,陈平','巫诗竹',0],
    ['杭州泽华五金有限公司','GYS15344','草稿','包装辅料','陈平','许树娴',2],
    ['佛山市鼎盛焊材有限公司','GYS15343','禁用','焊接耗材','刘秋平','伍子倩',0]
  ];
  function example(row, index) {
    return {name:row[0],code:row[1],status:row[2],approval:row[2]==='草稿'?'草稿':row[2]==='待审核'?'待审核':'已通过',type:'公司-线上',category:row[3],buyer:row[4],creator:row[5],editor:row[5],skuCount:row[6],amount:0,paymentChannel:'线上支付宝',developer:'许树娴',push:'未推送',createdAt:'2026-09-'+String(28-index).padStart(2,'0'),creditCode:'91320594MAK22J3668',capital:'5',registrationDate:'2025-11-28',returns:'否',returnDays:'7',wangwang:'赛美semill',link:'https://www.1688.com/',core:'否',province:'江苏省',city:'苏州市',district:'工业园区',registeredAddress:row[0],freeShipping:'否',currency:'RMB',invoice:'否',paymentMethod:'款到发货',settlementNote:'',remark:'',contacts:[{name:'陈选集',phone:'17751242848',telephone:'',wechat:'',qq:'',email:'',default:true}],shipping:[{province:'江苏省',city:'苏州市',district:'工业园区',detail:'',default:true}],returnsAddresses:[{province:'江苏省',city:'苏州市',district:'工业园区',detail:'',default:true}],personnel:row[4].split(',').map(function(buyer,i){return {warehouse:['SZ01东莞仓','海外仓中转仓','样品仓','华东仓'][i%4],buyer:buyer};}),logs:[{type:'新增',content:'新增供应商信息',operator:row[5],time:'2026-09-28 09:00:00'}]};
  }
  var suppliers;
  try { suppliers = JSON.parse(localStorage.getItem(storageKey)); } catch (error) { suppliers = null; }
  if (!Array.isArray(suppliers)) suppliers = seed.map(example);
  var selected = new Set();
  var activeTab = '全部';
  var applied = {};
  var page = 1;
  var pageSize = 10;
  var editingCode = null;
  var confirmAction = null;
  var form = document.querySelector('#supplierForm');
  var $ = function (selector) { return document.querySelector(selector); };
  function clean(value) { return String(value == null ? '' : value).replace(/[&<>"']/g,function (char) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]; }); }
  function save() { try { localStorage.setItem(storageKey,JSON.stringify(suppliers)); } catch (error) { /* local file fallback */ } }
  function clock() { return new Date().toLocaleString('zh-CN',{hour12:false}); }
  function toast(message) { var node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(function(){node.classList.remove('show');},2600); }
  function log(supplier,type,content) { supplier.logs=supplier.logs||[];supplier.logs.unshift({type:type,content:content,operator:'Admin',time:clock()});supplier.editor='Admin'; }
  function nextCode() { var max=suppliers.reduce(function(acc,row){var match=String(row.code).match(/\d+$/);return Math.max(acc,match?Number(match[0]):0);},15354);return 'GYS'+String(max+1); }
  function updateSelect(selector,values) { var select=$(selector), current=select.value;var initial=select.options[0].outerHTML;select.innerHTML=initial+Array.from(new Set(values.filter(Boolean))).sort().map(function(value){return '<option>'+clean(value)+'</option>';}).join('');select.value=current; }
  function updateFilterChoices() {
    updateSelect('#filterBuyer',suppliers.flatMap(function(row){return (row.buyer||'').split(',');}));
    updateSelect('#filterDeveloper',suppliers.map(function(row){return row.developer;}));
    updateSelect('#filterCreator',suppliers.map(function(row){return row.creator;}));
  }
  function counts() {
    var count=function(predicate){return suppliers.filter(predicate).length;};
    $('#countAll').textContent='('+suppliers.length+')';
    $('#countDraft').textContent='('+count(function(row){return row.status==='草稿';})+')';
    $('#countPending').textContent='('+count(function(row){return row.status==='待审核';})+')';
    $('#countDisabled').textContent='('+count(function(row){return row.status==='禁用';})+')';
    $('#countActive').textContent='('+count(function(row){return row.status==='合作中';})+')';
    $('#countMine').textContent='('+count(function(row){return row.status==='待审核';})+')';
  }
  function filtersFromPage() {
    return {code:$('#filterCode').value.trim(),name:$('#filterName').value.trim(),buyer:$('#filterBuyer').value,developer:$('#filterDeveloper').value,approval:$('#filterApproval').value,creator:$('#filterCreator').value,payment:$('#filterPayment').value,push:$('#filterPush').value,type:$('#filterType').value};
  }
  function filtered() {
    var codes=applied.code?applied.code.split(/[\s,，;；]+/).filter(Boolean):[];
    return suppliers.filter(function(row){
      if (activeTab==='待我审核' && row.status!=='待审核') return false;
      if (activeTab!=='全部' && activeTab!=='待我审核' && row.status!==activeTab) return false;
      if (codes.length && codes.indexOf(row.code)<0) return false;
      if (applied.name && row.name.indexOf(applied.name)<0) return false;
      if (applied.buyer && (row.buyer||'').indexOf(applied.buyer)<0) return false;
      if (applied.developer && row.developer!==applied.developer) return false;
      if (applied.approval && row.approval!==applied.approval) return false;
      if (applied.creator && row.creator!==applied.creator) return false;
      if (applied.payment && row.paymentChannel!==applied.payment) return false;
      if (applied.push && row.push!==applied.push) return false;
      if (applied.type && row.type!==applied.type) return false;
      return true;
    });
  }
  function render() {
    counts();updateFilterChoices();
    var rows=filtered(), pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages);
    var visible=rows.slice((page-1)*pageSize,page*pageSize);
    $('#tableBody').innerHTML=visible.map(function(row){
      var statusAction=row.status==='禁用'?'启用':'禁用';
      return '<tr><td><input type="checkbox" data-select="'+clean(row.code)+'" '+(selected.has(row.code)?'checked':'')+' aria-label="选择 '+clean(row.name)+'"></td>'+
        '<td><button class="row-link" data-action="edit" data-code="'+clean(row.code)+'">'+clean(row.name)+'</button></td>'+
        '<td>'+clean(row.code)+'</td><td>'+clean(row.paymentChannel)+'</td><td>'+clean(row.category||'—')+'</td><td>'+clean(row.amount||0)+'</td>'+
        '<td>'+clean(row.buyer||'—')+'</td><td>'+clean(row.creator||'—')+'</td><td>'+clean(row.editor||'—')+'</td><td>'+clean(row.skuCount||0)+'</td>'+
        '<td><button class="row-action" data-action="edit" data-code="'+clean(row.code)+'">编辑</button><button class="row-action" data-action="toggle" data-code="'+clean(row.code)+'">'+statusAction+'</button><button class="row-action" data-action="log" data-code="'+clean(row.code)+'">日志</button></td></tr>';
    }).join('');
    $('#emptyState').hidden=rows.length>0;
    $('#resultCount').textContent='共 '+rows.length+' 条';
    $('#selectionHint').textContent='已选 '+selected.size+' 条';
    $('#pageNumber').textContent=String(page)+' / '+String(pages);
    $('#prevPage').disabled=page===1;$('#nextPage').disabled=page===pages;
    $('#selectAll').checked=visible.length>0&&visible.every(function(row){return selected.has(row.code);});
    $('#selectAll').indeterminate=!$('#selectAll').checked&&visible.some(function(row){return selected.has(row.code);});
  }
  function setField(name,value) { var input=form.elements.namedItem(name);if(input)input.value=value==null?'':String(value); }
  function getField(name) { var input=form.elements.namedItem(name);return input?String(input.value).trim():''; }
  function contactRow(data) {
    data=data||{};return '<div class="repeat-row contact" data-repeat="contact"><input data-key="name" placeholder="联系人" value="'+clean(data.name||'')+'"><input data-key="phone" placeholder="手机号码" value="'+clean(data.phone||'')+'"><input data-key="telephone" placeholder="联系电话" value="'+clean(data.telephone||'')+'"><input data-key="wechat" placeholder="微信号" value="'+clean(data.wechat||'')+'"><input data-key="qq" placeholder="QQ号码" value="'+clean(data.qq||'')+'"><input data-key="email" placeholder="电子邮箱" value="'+clean(data.email||'')+'"><span><label><input type="radio" name="defaultContact" '+(data.default?'checked':'')+'> 默认</label><button class="delete-line" type="button" data-remove>删除</button></span></div>';
  }
  function addressRow(data,kind) {
    data=data||{};return '<div class="repeat-row address" data-repeat="'+kind+'"><span>'+ (kind==='shipping'?'发货地址':'退货地址')+'</span><input data-key="province" placeholder="省" value="'+clean(data.province||'')+'"><input data-key="city" placeholder="市" value="'+clean(data.city||'')+'"><input data-key="district" placeholder="区" value="'+clean(data.district||'')+'"><input data-key="detail" placeholder="详细地址" value="'+clean(data.detail||'')+'"><span><label><input type="radio" name="default'+kind+'" '+(data.default?'checked':'')+'> 默认</label><button class="delete-line" type="button" data-remove>删除</button></span></div>';
  }
  function personnelRow(data) {
    data=data||{};var option=function(values,value){return values.map(function(item){return '<option '+(item===value?'selected':'')+'>'+item+'</option>';}).join('');};
    return '<tr data-repeat="personnel"><td><select data-key="warehouse">'+option(['SZ01东莞仓','海外仓中转仓','样品仓','华东仓'],data.warehouse)+'</select></td><td><select data-key="buyer">'+option(['黄佳旋','陈平','刘秋平','林清秀'],data.buyer)+'</select></td><td><button class="delete-line" type="button" data-remove>删除</button></td></tr>';
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
    var data=row||{code:nextCode(),createdAt:new Date().toISOString().slice(0,10),type:'公司-线上',returns:'否',returnDays:'7',freeShipping:'否',currency:'RMB',invoice:'否',paymentMethod:'款到发货',paymentChannel:'线上支付宝',contacts:[{}],shipping:[{}],returnsAddresses:[{}],personnel:[{}]};
    Array.from(form.querySelectorAll('[name]')).forEach(function(input){if(input.type!=='file')setField(input.name,data[input.name]);});
    $('#contacts').innerHTML=(data.contacts||[{}]).map(contactRow).join('');
    $('#shippingAddresses').innerHTML=(data.shipping||[{}]).map(function(address){return addressRow(address,'shipping');}).join('');
    $('#returnAddresses').innerHTML=(data.returnsAddresses||[{}]).map(function(address){return addressRow(address,'return');}).join('');
    $('#personnelRows').innerHTML=(data.personnel||[{}]).map(personnelRow).join('');
    form.querySelectorAll('input[type=file]').forEach(function(input){input.closest('label').classList.remove('has-file');input.closest('label').querySelector('.upload-box').textContent='＋';});
    $('#editMask').hidden=false;$('#editScroll').scrollTop=0;form.elements.namedItem('name').focus();
  }
  function validate() {
    var required=Array.from(form.querySelectorAll('[required]'));
    var missing=required.find(function(input){return !String(input.value).trim();});
    if(missing){$('#formError').textContent='请填写完整的必填信息';missing.focus();missing.scrollIntoView({block:'center',behavior:'smooth'});return false;}
    var name=getField('name');
    if(suppliers.some(function(row){return row.name===name&&row.code!==editingCode;})){$('#formError').textContent='供应商名称已存在';form.elements.namedItem('name').focus();return false;}
    if(!/^https?:\/\//i.test(getField('link'))){$('#formError').textContent='供应商链接请以 http:// 或 https:// 开头';form.elements.namedItem('link').focus();return false;}
    var contacts=rowsFrom($('#contacts')).filter(function(row){return row.name||row.phone;});
    if(!contacts.length||contacts.some(function(row){return !row.name||!row.phone;})){$('#formError').textContent='请填写至少一位联系人的姓名和手机号';$('#contacts').scrollIntoView({block:'center',behavior:'smooth'});return false;}
    $('#formError').textContent='';return true;
  }
  function saveForm() {
    if(!validate())return;
    var row=editingCode?suppliers.find(function(item){return item.code===editingCode;}):null;
    var previous=row?row.status:null;
    if(!row){row={code:nextCode(),status:'草稿',approval:'草稿',creator:'Admin',skuCount:0,amount:0,push:'未推送',logs:[]};suppliers.unshift(row);}
    Array.from(form.querySelectorAll('[name]')).forEach(function(input){if(input.type!=='file'&&input.name!=='code')row[input.name]=String(input.value).trim();});
    row.contacts=rowsFrom($('#contacts'));row.shipping=rowsFrom($('#shippingAddresses'));row.returnsAddresses=rowsFrom($('#returnAddresses'));row.personnel=rowsFrom($('#personnelRows'));
    row.buyer=Array.from(new Set(row.personnel.map(function(item){return item.buyer;}))).join(',');
    log(row,editingCode?'编辑':'新增',editingCode?'编辑供应商信息':'新增供应商信息，状态为草稿');
    if(!previous)row.createdAt=getField('createdAt');
    save();$('#editMask').hidden=true;selected.clear();page=1;render();toast(editingCode?'保存成功':'新增成功');
  }
  function openLog(row) {
    $('#logSupplierName').textContent=row.name+'（'+row.code+'）';
    $('#logBody').innerHTML=(row.logs||[]).map(function(item){return '<tr><td>'+clean(item.type)+'</td><td>'+clean(item.content)+'</td><td>'+clean(item.operator)+'</td><td>'+clean(item.time)+'</td></tr>';}).join('')||'<tr><td colspan="4">暂无操作日志</td></tr>';
    $('#logMask').hidden=false;
  }
  function confirm(title,message,action) { $('#confirmTitle').textContent=title;$('#confirmMessage').textContent=message;confirmAction=action;$('#confirmMask').hidden=false; }
  function batch(action) {
    var rows=suppliers.filter(function(row){return selected.has(row.code);});
    if(!rows.length){toast('请先选择供应商');return;}
    if(action==='人员替换'){if(rows.length!==1){toast('人员替换请只选择一位供应商');return;}openEdit(rows[0]);$('#personnelRows').scrollIntoView({block:'center'});return;}
    var message=action==='批量删除'?'确定删除选中的 '+rows.length+' 位供应商吗？此操作会移除本地原型数据。':'确定对选中的 '+rows.length+' 位供应商执行“'+action+'”吗？';
    confirm(action,message,function(){
      if(action==='批量删除')suppliers=suppliers.filter(function(row){return !selected.has(row.code);});
      else rows.forEach(function(row){
        if(action==='采购审核'){row.approval='待审核';row.status='待审核';}
        if(action==='财务审核'){row.approval='已通过';row.status='合作中';}
        if(action==='推送到易仓')row.push='已推送';
        log(row,action,action+'完成');
      });
      selected.clear();save();render();toast(action+'完成');
    });
  }
  function exportCsv() {
    var rows=filtered(),header=['供应商名称','供应商编码','合作状态','支付方式','合作类目','合作金额','采购员','创建人','最新编辑人','SKU数量'];
    var keys=['name','code','status','paymentChannel','category','amount','buyer','creator','editor','skuCount'];
    var csv='\ufeff'+[header].concat(rows.map(function(row){return keys.map(function(key){return row[key]==null?'':row[key];});})).map(function(cells){return cells.map(function(value){return '"'+String(value).replace(/"/g,'""')+'"';}).join(',');}).join('\r\n');
    var link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='供应商列表.csv';link.click();setTimeout(function(){URL.revokeObjectURL(link.href);},1000);toast('已导出 '+rows.length+' 条供应商');
  }
  document.addEventListener('click',function(event){
    var tab=event.target.closest('[data-tab]');if(tab){activeTab=tab.dataset.tab;document.querySelectorAll('.status-tab').forEach(function(node){node.classList.toggle('active',node===tab);});page=1;render();return;}
    var action=event.target.closest('[data-action]');if(action){var row=suppliers.find(function(item){return item.code===action.dataset.code;});if(!row)return;
      if(action.dataset.action==='edit')openEdit(row);
      if(action.dataset.action==='log')openLog(row);
      if(action.dataset.action==='toggle')confirm(row.status==='禁用'?'启用供应商':'禁用供应商','确定'+(row.status==='禁用'?'启用':'禁用')+'“'+row.name+'”吗？',function(){var old=row.status;row.status=old==='禁用'?'合作中':'禁用';log(row,'状态调整','合作状态由'+old+'调整为'+row.status);save();render();toast('状态已更新');});
      return;
    }
    var add=event.target.closest('[data-add]');if(add){var kind=add.dataset.add;if(kind==='contact')$('#contacts').insertAdjacentHTML('beforeend',contactRow({}));if(kind==='shipping')$('#shippingAddresses').insertAdjacentHTML('beforeend',addressRow({},kind));if(kind==='return')$('#returnAddresses').insertAdjacentHTML('beforeend',addressRow({},kind));if(kind==='personnel')$('#personnelRows').insertAdjacentHTML('beforeend',personnelRow({}));return;}
    var remove=event.target.closest('[data-remove]');if(remove){remove.closest('[data-repeat]').remove();return;}
    var close=event.target.closest('[data-close]');if(close){$('#'+close.dataset.close+'Mask').hidden=true;return;}
    var batchButton=event.target.closest('[data-batch]');if(batchButton){batch(batchButton.dataset.batch);return;}
  });
  $('#tableBody').addEventListener('change',function(event){if(event.target.matches('[data-select]')){if(event.target.checked)selected.add(event.target.dataset.select);else selected.delete(event.target.dataset.select);render();}});
  $('#selectAll').addEventListener('change',function(event){filtered().slice((page-1)*pageSize,page*pageSize).forEach(function(row){if(event.target.checked)selected.add(row.code);else selected.delete(row.code);});render();});
  $('#searchButton').addEventListener('click',function(){applied=filtersFromPage();page=1;render();});
  $('#resetButton').addEventListener('click',function(){document.querySelectorAll('.query-grid input,.query-grid select').forEach(function(input){input.value='';});applied={};page=1;render();});
  $('#filterCode').addEventListener('keydown',function(event){if(event.key==='Enter')$('#searchButton').click();});
  $('#filterName').addEventListener('keydown',function(event){if(event.key==='Enter')$('#searchButton').click();});
  $('#prevPage').addEventListener('click',function(){page--;render();});
  $('#nextPage').addEventListener('click',function(){page++;render();});
  $('#addButton').addEventListener('click',function(){openEdit(null);});
  $('#saveButton').addEventListener('click',saveForm);
  $('#exportButton').addEventListener('click',exportCsv);
  $('#confirmButton').addEventListener('click',function(){var action=confirmAction;$('#confirmMask').hidden=true;confirmAction=null;if(action)action();});
  form.querySelectorAll('input[type=file]').forEach(function(input){input.addEventListener('change',function(){var box=input.closest('label').querySelector('.upload-box');box.textContent=input.files[0]?input.files[0].name:'＋';input.closest('label').classList.toggle('has-file',!!input.files[0]);});});
  document.addEventListener('keydown',function(event){if(event.key==='Escape')document.querySelectorAll('.modal-mask').forEach(function(mask){mask.hidden=true;});});
  render();
})();
