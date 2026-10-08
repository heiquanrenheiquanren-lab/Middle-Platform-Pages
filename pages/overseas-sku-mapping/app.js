(function(){
  'use strict';
  var rows=[
    {id:1,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',name:'MIG-200A 逆变式气体保护焊机',warehouse:'美通物流中转仓',overseasSku:'MIG-200A-EU',fnsku:'X001MIG200A',creator:'Admin',createdAt:'2026-09-18 10:32'},
    {id:2,sku:'TIG-ROD-316L',lingxingSku:'LX-TIG-316L-002',name:'TIG 316L 不锈钢氩弧焊丝 1.6mm',warehouse:'亚马逊欧洲仓',overseasSku:'TIG-316L-EU',fnsku:'X001TIG316L',creator:'张三',createdAt:'2026-09-17 14:20'},
    {id:3,sku:'PLASMA-45',lingxingSku:'LX-CUT-45-003',name:'CUT-45 等离子切割机 45A',warehouse:'深圳海外仓',overseasSku:'CUT-45-US',fnsku:'X001PLASMA45',creator:'李四',createdAt:'2026-09-16 09:15'},
    {id:4,sku:'WELD-HELMET-01',lingxingSku:'LX-HELMET-004',name:'自动变光焊接面罩 Pro',warehouse:'美通物流中转仓',overseasSku:'HELMET-01-EU',fnsku:'X001HELMET01',creator:'Admin',createdAt:'2026-09-12 16:40'},
    {id:5,sku:'CABLE-35MM',lingxingSku:'LX-CABLE-005',name:'35mm² 铜芯焊把线 10米',warehouse:'东莞海外仓',overseasSku:'CABLE-35-US',fnsku:'X001CABLE35',creator:'张三',createdAt:'2026-09-10 11:08'},
    {id:6,sku:'GAS-REGULATOR',lingxingSku:'LX-AR-25-006',name:'氩气减压器带流量计',warehouse:'亚马逊欧洲仓',overseasSku:'GAS-REG-EU',fnsku:'X001GASREG',creator:'李四',createdAt:'2026-09-08 15:25'}
  ];
  var products={};rows.forEach(function(row){products[row.sku]=row;});
  var filtered=rows.slice(),tableBody=document.querySelector('#mappingTableBody');
  var escapeHtml=function(value){return String(value==null?'':value).replace(/[&<>\"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char];});};
  var placeholder='<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect x=\"5\" y=\"6\" width=\"22\" height=\"19\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"m8 22 5-5 4 4 3-3 4 4\"></path></svg>';
  function render(){
    tableBody.innerHTML=filtered.map(function(row){return '<tr><td><div class=\"mapping-two-line\"><strong>'+escapeHtml(row.sku)+'</strong><span>领星 SKU：'+escapeHtml(row.lingxingSku)+'</span></div></td><td><div class=\"mapping-product\"><div class=\"mapping-product-thumb\" role=\"img\" aria-label=\"产品图片占位符\">'+placeholder+'</div><span class=\"mapping-product-name\" title=\"'+escapeHtml(row.name)+'\">'+escapeHtml(row.name)+'</span></div></td><td><span class=\"mapping-warehouse\" title=\"'+escapeHtml(row.warehouse)+'\">'+escapeHtml(row.warehouse)+'</span></td><td><div class=\"mapping-two-line\"><strong>'+escapeHtml(row.overseasSku)+'</strong><span>FNSKU：'+escapeHtml(row.fnsku)+'</span></div></td><td><div class=\"mapping-created\"><b>'+escapeHtml(row.creator)+'</b><small>'+escapeHtml(row.createdAt)+'</small></div></td><td><button class=\"mapping-link\" type=\"button\" data-action=\"edit\" data-id=\"'+row.id+'\">编辑</button><button class=\"mapping-link mapping-delete-link\" type=\"button\" data-action=\"delete\" data-id=\"'+row.id+'\">删除</button><button class=\"mapping-link log-link\" type=\"button\" data-action=\"log\" data-id=\"'+row.id+'\">日志</button></td></tr>';}).join('');
    document.querySelector('#emptyState').hidden=filtered.length!==0;
    document.querySelector('#mappingCount').textContent='共 '+filtered.length+' 条';
    tableBody.querySelectorAll('[data-action]').forEach(function(button){
      button.addEventListener('click',function(){
        var row=rows.find(function(item){return item.id===Number(button.dataset.id);});
        if(!row)return;
        if(button.dataset.action==='edit')openMappingModal(row);
        if(button.dataset.action==='delete')deleteMapping(row);
        if(button.dataset.action==='log')openLog(row);
      });
    });
  }
  function getValue(id){return (document.querySelector('#'+id).value||'').trim();}
  function includesAny(value,keyword){return keyword.split(/[\s,，]+/).filter(Boolean).some(function(item){return value.toLowerCase().indexOf(item.toLowerCase())>=0;});}
  function search(){
    var skuType=getValue('skuSearchType'),skuKeyword=getValue('skuKeyword'),warehouse=getValue('warehouseFilter'),name=getValue('productNameKeyword'),creator=getValue('creatorFilter'),start=getValue('startDate'),end=getValue('endDate');
    filtered=rows.filter(function(row){
      if(skuKeyword&&!includesAny(String(row[skuType]||''),skuKeyword))return false;
      if(warehouse&&row.warehouse!==warehouse)return false;
      if(name&&row.name.toLowerCase().indexOf(name.toLowerCase())<0)return false;
      if(creator&&row.creator!==creator)return false;
      if(start&&row.createdAt.slice(0,10)<start)return false;
      if(end&&row.createdAt.slice(0,10)>end)return false;
      return true;
    });
    render();
  }
  function reset(){
    ['skuKeyword','productNameKeyword','startDate','endDate'].forEach(function(id){document.querySelector('#'+id).value='';});
    ['skuSearchType','warehouseFilter','creatorFilter'].forEach(function(id){document.querySelector('#'+id).selectedIndex=0;});
    filtered=rows.slice();if(window.enhanceCustomSelects)window.enhanceCustomSelects();render();
  }
  function toast(message){var node=document.createElement('div');node.className='mapping-toast';node.textContent=message;document.body.appendChild(node);setTimeout(function(){node.remove();},2200);}
  function openMappingModal(editing){
    var current=editing||{sku:'',lingxingSku:'',name:'',warehouse:'',overseasSku:'',fnsku:''},mask=document.createElement('div');mask.className='mapping-modal-mask ui-dialog-mask';
    mask.innerHTML='<section class=\"mapping-modal\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+(editing?'编辑映射关系':'新增映射关系')+'\"><header class=\"mapping-modal-header\"><div><h2>'+(editing?'编辑映射关系':'新增映射关系')+'</h2><p>维护 SKU 与海外仓编码的对应关系</p></div><button class=\"mapping-modal-close\" type=\"button\" data-close aria-label=\"关闭\">×</button></header><div class=\"mapping-modal-body\"><div class=\"mapping-form-card\"><div class=\"mapping-form-grid\"><label class=\"mapping-field\"><span><i class=\"required-mark\">*</i>SKU</span><input id=\"mappingSkuField\" value=\"'+escapeHtml(current.sku)+'\" placeholder=\"请输入 SKU\"></label><label class=\"mapping-field\"><span>领星 SKU</span><input class=\"readonly-field\" id=\"mappingLingxingField\" value=\"'+escapeHtml(current.lingxingSku)+'\" readonly></label><label class=\"mapping-field wide\"><span>产品名称</span><span class=\"mapping-product-preview\"><span class=\"mapping-product-thumb\">'+placeholder+'</span><span id=\"mappingNameField\">'+escapeHtml(current.name||'输入有效 SKU 后自动带出')+'</span></span></label><label class=\"mapping-field\"><span><i class=\"required-mark\">*</i>仓库名称</span><select id=\"mappingWarehouseField\"><option value=\"\">请选择仓库</option><option '+(current.warehouse==='美通物流中转仓'?'selected':'')+'>美通物流中转仓</option><option '+(current.warehouse==='亚马逊欧洲仓'?'selected':'')+'>亚马逊欧洲仓</option><option '+(current.warehouse==='深圳海外仓'?'selected':'')+'>深圳海外仓</option><option '+(current.warehouse==='东莞海外仓'?'selected':'')+'>东莞海外仓</option></select></label><label class=\"mapping-field\"><span><i class=\"required-mark\">*</i>海外仓 SKU</span><input id=\"mappingOverseasField\" value=\"'+escapeHtml(current.overseasSku)+'\" placeholder=\"请输入海外仓 SKU\"></label><label class=\"mapping-field\"><span>FNSKU</span><input id=\"mappingFnskuField\" value=\"'+escapeHtml(current.fnsku)+'\" placeholder=\"请输入 FNSKU\"></label><p class=\"mapping-modal-error\" id=\"mappingModalError\"></p></div></div></div><footer class=\"mapping-modal-footer\"><button class=\"mapping-button\" type=\"button\" data-close>取消</button><button class=\"mapping-button primary\" type=\"button\" data-save>保存</button></footer></section>';
    document.body.appendChild(mask);if(window.enhanceCustomSelects)window.enhanceCustomSelects();
    var skuField=mask.querySelector('#mappingSkuField');
    function syncProduct(){var row=products[skuField.value.trim().toUpperCase()];mask.querySelector('#mappingLingxingField').value=row?row.lingxingSku:'';mask.querySelector('#mappingNameField').textContent=row?row.name:'输入有效 SKU 后自动带出';}
    skuField.addEventListener('input',syncProduct);syncProduct();
    mask.addEventListener('click',function(event){
      if(event.target===mask||event.target.closest('[data-close]')){mask.remove();return;}
      if(!event.target.closest('[data-save]'))return;
      var sku=skuField.value.trim().toUpperCase(),warehouse=mask.querySelector('#mappingWarehouseField').value,overseas=mask.querySelector('#mappingOverseasField').value.trim(),fnsku=mask.querySelector('#mappingFnskuField').value.trim(),error=mask.querySelector('#mappingModalError'),product=products[sku];
      if(!sku||!warehouse||!overseas){error.textContent='请填写 SKU、仓库名称和海外仓 SKU';return;}
      if(!product){error.textContent='请输入有效的 SKU';return;}
      var duplicate=rows.some(function(row){return row.id!==(editing&&editing.id)&&row.sku===sku&&row.warehouse===warehouse;});if(duplicate){error.textContent='同一个 SKU 在同一仓库只能配置一条映射关系';return;}
      var data={sku:sku,lingxingSku:product.lingxingSku,name:product.name,warehouse:warehouse,overseasSku:overseas,fnsku:fnsku,creator:editing?editing.creator:'Admin',createdAt:editing?editing.createdAt:new Date().toISOString().slice(0,16).replace('T',' ')};if(editing)Object.assign(editing,data);else{data.id=Date.now();rows.unshift(data);}filtered=rows.slice();mask.remove();render();toast(editing?'映射关系已更新':'映射关系已新增');
    });
  }
  function openLog(row){
    var logs=[{type:'编辑',content:'更新了海外仓 SKU 与 FNSKU 映射信息',operator:'Admin',time:'2026-09-20 10:30'},{type:'新增',content:'新增海外仓 SKU 映射关系',operator:row.creator,time:row.createdAt}],mask=document.createElement('div');mask.className='purchase-log-modal ui-dialog-mask';
    mask.innerHTML='<div class=\"purchase-log-dialog\" role=\"dialog\" aria-modal=\"true\" aria-label=\"映射关系操作日志\"><header class=\"purchase-log-header\"><div><h2>操作日志</h2><span>SKU：'+escapeHtml(row.sku)+' · 仓库：'+escapeHtml(row.warehouse)+'</span></div><button class=\"purchase-log-close\" type=\"button\" aria-label=\"关闭操作日志\">×</button></header><div class=\"purchase-log-body\"><div class=\"purchase-log-table-card\"><table class=\"purchase-log-table\"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>'+logs.map(function(log){return '<tr><td>'+log.type+'</td><td class=\"purchase-log-content\">'+escapeHtml(log.content)+'</td><td>'+escapeHtml(log.operator)+'</td><td>'+escapeHtml(log.time)+'</td></tr>';}).join('')+'</tbody></table></div></div><footer class=\"purchase-log-footer\"><span>共 '+logs.length+' 条</span><div><button class=\"purchase-log-page\" type=\"button\" disabled>‹</button><button class=\"purchase-log-page active\" type=\"button\">1</button><button class=\"purchase-log-page\" type=\"button\" disabled>›</button></div></footer></div>';
    document.body.appendChild(mask);mask.addEventListener('click',function(event){if(event.target===mask||event.target.closest('.purchase-log-close'))mask.remove();});
  }
  function deleteMapping(row){
    var mask=document.createElement('div');mask.className='mapping-confirm-mask ui-dialog-mask';
    mask.innerHTML='<section class="mapping-confirm-dialog" role="dialog" aria-modal="true" aria-label="删除映射关系确认"><header class="mapping-confirm-header"><div><h2>删除映射关系</h2><p>删除后不可恢复，请确认操作。</p></div><button class="mapping-confirm-close" type="button" data-cancel aria-label="关闭">×</button></header><div class="mapping-confirm-body"><p>确认删除以下映射关系吗？</p><dl class="mapping-confirm-details"><div><dt>SKU</dt><dd>'+escapeHtml(row.sku)+'</dd></div><div><dt>仓库名称</dt><dd>'+escapeHtml(row.warehouse)+'</dd></div><div><dt>海外仓 SKU</dt><dd>'+escapeHtml(row.overseasSku)+'</dd></div></dl></div><footer class="mapping-confirm-footer"><button class="mapping-button" type="button" data-cancel>取消</button><button class="mapping-button danger" type="button" data-confirm>确认删除</button></footer></section>';
    document.body.appendChild(mask);
    var close=function(){mask.remove();};
    mask.addEventListener('click',function(event){
      if(event.target===mask||event.target.closest('[data-cancel]')){close();return;}
      if(!event.target.closest('[data-confirm]'))return;
      var index=rows.indexOf(row);if(index>=0)rows.splice(index,1);
      filtered=filtered.filter(function(item){return item!==row;});close();render();toast('映射关系已删除');
    });
    mask.addEventListener('keydown',function(event){if(event.key==='Escape')close();});
    mask.querySelector('.mapping-confirm-footer [data-cancel]').focus();
  }
  function downloadMappingTemplate(){
    var content='SKU*,仓库名称*,海外仓 SKU*,FNSKU\n示例 SKU,示例仓库,示例海外仓 SKU,示例 FNSKU\n',blob=new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='海外仓SKU映射导入模板.csv';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  }
  function openMappingImport(){
    UIKit.openImportDialog({
      title:'导入映射关系',
      onDownload:downloadMappingTemplate,
      onConfirm:function(file,close){
        if(!/\.(xlsx|xls|csv)$/i.test(file.name)){toast('请选择 .xlsx、.xls 或 .csv 文件');return;}
        close();toast('映射关系导入已提交校验');
      }
    });
  }
  document.querySelector('#searchButton').addEventListener('click',search);document.querySelector('#resetButton').addEventListener('click',reset);document.querySelectorAll('#skuKeyword,#productNameKeyword').forEach(function(input){input.addEventListener('keydown',function(event){if(event.key==='Enter')search();});});document.querySelector('#addMappingButton').addEventListener('click',function(){openMappingModal();});document.querySelector('#importMappingButton').addEventListener('click',openMappingImport);render();
})();
