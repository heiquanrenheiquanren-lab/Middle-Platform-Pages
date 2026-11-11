(function(){
  'use strict';

  /* 产品主数据：行内输入 SKU 后自动带出领星 SKU 与产品名称。 */
  var products={
    'MIG-200A':{lingxingSku:'LX-MIG-200A-001',name:'MIG-200A 逆变式气体保护焊机'},
    'TIG-ROD-316L':{lingxingSku:'LX-TIG-316L-002',name:'TIG 316L 不锈钢氩弧焊丝 1.6mm'},
    'PLASMA-45':{lingxingSku:'LX-CUT-45-003',name:'CUT-45 等离子切割机 45A'},
    'WELD-HELMET-01':{lingxingSku:'LX-HELMET-004',name:'自动变光焊接面罩 Pro'},
    'CABLE-35MM':{lingxingSku:'LX-CABLE-005',name:'35mm² 铜芯焊把线 10米'},
    'GAS-REGULATOR':{lingxingSku:'LX-AR-25-006',name:'氩气减压器带流量计'}
  };

  var warehousesOverseas=['美通物流中转仓（MT01）','亚马逊欧洲仓（EU01）','深圳海外仓（SZ01）','东莞海外仓（DG01）'];
  var warehousesFba=['亚马逊欧洲仓（EU01）','亚马逊美国仓（US01）'];
  /* FBA 店铺枚举：仅 Amazon 店铺（FNSKU 是亚马逊体系编码）。 */
  var fbaStores=['AMZ-US01','AMZ-DE02','AMZ-JP03'];

  var escapeHtml=function(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});};
  function getValue(id){var node=document.querySelector('#'+id);return node?(node.value||'').trim():'';}
  function includesAny(value,keyword){return keyword.split(/[\s,，]+/).filter(Boolean).some(function(item){return value.toLowerCase().indexOf(item.toLowerCase())>=0;});}
  function toast(message){var node=document.createElement('div');node.className='mapping-toast';node.textContent=message;document.body.appendChild(node);setTimeout(function(){node.remove();},2200);}

  /* 品名列占位图：24px 缩略图，行高保持 38px 不变。 */
  var placeholderSvg='<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="19" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="m8 22 5-5 4 4 3-3 4 4"></path></svg>';

  /* ---------- 单行单元格渲染 ---------- */
  function skuCell(row){return '<td><span class="mapping-code-text" title="'+escapeHtml(row.sku)+'">'+escapeHtml(row.sku)+'</span></td>';}
  function productCell(row){return '<td><span class="mapping-product"><span class="mapping-product-thumb" aria-hidden="true">'+placeholderSvg+'</span><span class="mapping-product-name" title="'+escapeHtml(row.name)+'">'+escapeHtml(row.name)+'</span></span></td>';}
  function warehouseCell(row){return '<td><span class="mapping-plain-text" title="'+escapeHtml(row.warehouse)+'">'+escapeHtml(row.warehouse)+'</span></td>';}
  function codeCell(value){return '<td><span class="mapping-code-text" title="'+escapeHtml(value)+'">'+escapeHtml(value)+'</span></td>';}
  function creatorCell(row){return '<td><span class="mapping-plain-text">'+escapeHtml(row.creator)+'</span></td>';}
  function timeCell(row){return '<td><span class="mapping-time-text">'+escapeHtml(row.createdAt)+'</span></td>';}
  function plainCell(value){return '<td><span class="mapping-plain-text" title="'+escapeHtml(value)+'">'+escapeHtml(value)+'</span></td>';}
  function platformCell(value){return '<td><span class="mapping-platform-text" title="'+escapeHtml(value)+'">'+escapeHtml(value)+'</span></td>';}
  function editorCell(row){return '<td><span class="mapping-plain-text">'+escapeHtml(row.editor)+'</span></td>';}
  function timeTextCell(value){return '<td><span class="mapping-time-text">'+escapeHtml(value)+'</span></td>';}
  function actionButtons(row){return '<button class="mapping-link" type="button" data-action="edit" data-id="'+row.id+'">编辑</button><button class="mapping-link mapping-delete-link" type="button" data-action="delete" data-id="'+row.id+'">删除</button><button class="mapping-link log-link" type="button" data-action="log" data-id="'+row.id+'">日志</button>';}
  function actionCell(row){return '<td>'+actionButtons(row)+'</td>';}

  /* ---------- 通用查询条件（产品名称 / 创建人 / 创建时间） ---------- */
  function baseMatch(row,prefix){
    var name=getValue(prefix+'ProductNameKeyword');
    if(name&&row.name.toLowerCase().indexOf(name.toLowerCase())<0)return false;
    var creator=getValue(prefix+'CreatorFilter');
    if(creator&&row.creator!==creator)return false;
    var start=getValue(prefix+'StartDate'),end=getValue(prefix+'EndDate');
    if(start&&String(row.createdAt).slice(0,10)<start)return false;
    if(end&&String(row.createdAt).slice(0,10)>end)return false;
    return true;
  }

  function downloadTemplate(filename,header,sample){
    var content=header+'\n'+sample+'\n',blob=new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  }

  /* ---------- 导出当前筛选结果（CSV，带 BOM），列由各 tab 的 exportColumns 定义 ---------- */
  function csvEscape(value){value=String(value==null?'':value);return /[",\n]/.test(value)?'"'+value.replace(/"/g,'""')+'"':value;}
  function exportRows(tab){
    if(!tab.filtered||!tab.filtered.length){toast('当前筛选结果为空，无可导出数据');return;}
    var header=tab.exportColumns.map(function(column){return column[0];});
    var lines=tab.filtered.map(function(row){return tab.exportColumns.map(function(column){return csvEscape(column[1](row));}).join(',');});
    var content=header.join(',')+'\n'+lines.join('\n'),blob=new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=tab.exportName||tab.codeLabel+'映射导出.csv';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    toast('已导出 '+tab.filtered.length+' 条筛选结果');
  }

  /* ---------- 三个 tab 的独立配置 ---------- */
  var tabs=[
    {
      key:'lingxing',prefix:'lx',codeLabel:'领星 SKU',codeKey:'lingxingSku',warehouses:null,
      rows:[
        {id:1,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',name:products['MIG-200A'].name,creator:'Admin',createdAt:'2026-09-18 10:32'},
        {id:2,sku:'TIG-ROD-316L',lingxingSku:'LX-TIG-316L-002',name:products['TIG-ROD-316L'].name,creator:'张三',createdAt:'2026-09-17 14:20'},
        {id:3,sku:'PLASMA-45',lingxingSku:'LX-CUT-45-003',name:products['PLASMA-45'].name,creator:'李四',createdAt:'2026-09-16 09:15'},
        {id:4,sku:'WELD-HELMET-01',lingxingSku:'LX-HELMET-004',name:products['WELD-HELMET-01'].name,creator:'Admin',createdAt:'2026-09-12 16:40'},
        {id:5,sku:'CABLE-35MM',lingxingSku:'LX-CABLE-005',name:products['CABLE-35MM'].name,creator:'张三',createdAt:'2026-09-10 11:08'},
        {id:6,sku:'GAS-REGULATOR',lingxingSku:'LX-AR-25-006',name:products['GAS-REGULATOR'].name,creator:'李四',createdAt:'2026-09-08 15:25'}
      ],
      rowHtml:function(row){return '<tr>'+skuCell(row)+productCell(row)+codeCell(row.lingxingSku)+creatorCell(row)+timeCell(row)+actionCell(row)+'</tr>';},
      match:function(row){
        var keyword=getValue('lxSkuKeyword');
        if(keyword&&!includesAny(getValue('lxSkuSearchType')==='code'?row.lingxingSku:row.sku,keyword))return false;
        return baseMatch(row,'lx');
      },
      confirmDetails:function(row){return [['SKU',row.sku],['领星 SKU',row.lingxingSku]];},
      exportColumns:[['SKU',function(row){return row.sku;}],['品名',function(row){return row.name;}],['领星 SKU',function(row){return row.lingxingSku;}],['创建人',function(row){return row.creator;}],['创建时间',function(row){return row.createdAt;}]],
      template:{name:'领星SKU映射导入模板.csv',header:'SKU*,领星 SKU*',sample:'示例 SKU,LX-示例-001'}
    },
    {
      key:'overseas',prefix:'os',codeLabel:'海外仓 SKU',codeKey:'overseasSku',warehouses:warehousesOverseas,
      rows:[
        {id:11,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',name:products['MIG-200A'].name,warehouse:'美通物流中转仓（MT01）',overseasSku:'MIG-200A-EU',creator:'Admin',createdAt:'2026-09-18 10:32'},
        {id:12,sku:'TIG-ROD-316L',lingxingSku:'LX-TIG-316L-002',name:products['TIG-ROD-316L'].name,warehouse:'亚马逊欧洲仓（EU01）',overseasSku:'TIG-316L-EU',creator:'张三',createdAt:'2026-09-17 14:20'},
        {id:13,sku:'PLASMA-45',lingxingSku:'LX-CUT-45-003',name:products['PLASMA-45'].name,warehouse:'深圳海外仓（SZ01）',overseasSku:'CUT-45-US',creator:'李四',createdAt:'2026-09-16 09:15'},
        {id:14,sku:'WELD-HELMET-01',lingxingSku:'LX-HELMET-004',name:products['WELD-HELMET-01'].name,warehouse:'美通物流中转仓（MT01）',overseasSku:'HELMET-01-EU',creator:'Admin',createdAt:'2026-09-12 16:40'},
        {id:15,sku:'CABLE-35MM',lingxingSku:'LX-CABLE-005',name:products['CABLE-35MM'].name,warehouse:'东莞海外仓（DG01）',overseasSku:'CABLE-35-US',creator:'张三',createdAt:'2026-09-10 11:08'},
        {id:16,sku:'GAS-REGULATOR',lingxingSku:'LX-AR-25-006',name:products['GAS-REGULATOR'].name,warehouse:'亚马逊欧洲仓（EU01）',overseasSku:'GAS-REG-EU',creator:'李四',createdAt:'2026-09-08 15:25'}
      ],
      rowHtml:function(row){return '<tr>'+skuCell(row)+productCell(row)+warehouseCell(row)+codeCell(row.overseasSku)+creatorCell(row)+timeCell(row)+actionCell(row)+'</tr>';},
      match:function(row){
        var keyword=getValue('osSkuKeyword');
        if(keyword&&!includesAny(getValue('osSkuSearchType')==='code'?row.overseasSku:row.sku,keyword))return false;
        var warehouse=getValue('osWarehouseFilter');
        if(warehouse&&row.warehouse!==warehouse)return false;
        return baseMatch(row,'os');
      },
      confirmDetails:function(row){return [['SKU',row.sku],['仓库名称',row.warehouse],['海外仓 SKU',row.overseasSku]];},
      exportColumns:[['SKU',function(row){return row.sku;}],['品名',function(row){return row.name;}],['仓库名称',function(row){return row.warehouse;}],['海外仓 SKU',function(row){return row.overseasSku;}],['创建人',function(row){return row.creator;}],['创建时间',function(row){return row.createdAt;}]],
      template:{name:'海外仓SKU映射导入模板.csv',header:'SKU*,仓库名称*,海外仓 SKU*',sample:'示例 SKU,示例仓库,示例海外仓 SKU'}
    },
    {
      key:'fba',prefix:'fba',codeLabel:'FNSKU',codeKey:'fnsku',warehouses:warehousesFba,
      /* 层级：SKU → 店铺 → SellerSKU → FNSKU；id27/28 演示同一 SKU 在同一店铺下多个 SellerSKU 对应不同 FNSKU。 */
      rows:[
        {id:21,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',name:products['MIG-200A'].name,store:'AMZ-DE02',sellerSku:'AMZ-DE02-MIG-200A-001-02',warehouse:'亚马逊欧洲仓（EU01）',fnsku:'X001MIG200A',creator:'Admin',createdAt:'2026-09-18 10:32'},
        {id:27,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',name:products['MIG-200A'].name,store:'AMZ-US01',sellerSku:'AMZ-US01-MIG-200A-001-02',warehouse:'亚马逊美国仓（US01）',fnsku:'X003MIG200A',creator:'Admin',createdAt:'2026-09-15 09:02'},
        {id:28,sku:'MIG-200A',lingxingSku:'LX-MIG-200A-001',name:products['MIG-200A'].name,store:'AMZ-US01',sellerSku:'AMZ-US01-MIG-200A-BDL-02',warehouse:'亚马逊美国仓（US01）',fnsku:'X004MIG200B',creator:'张三',createdAt:'2026-09-14 15:36'},
        {id:22,sku:'TIG-ROD-316L',lingxingSku:'LX-TIG-316L-002',name:products['TIG-ROD-316L'].name,store:'AMZ-US01',sellerSku:'AMZ-US01-TIG-316L-002-02',warehouse:'亚马逊美国仓（US01）',fnsku:'X002TIG316L',creator:'张三',createdAt:'2026-09-17 14:20'},
        {id:23,sku:'PLASMA-45',lingxingSku:'LX-CUT-45-003',name:products['PLASMA-45'].name,store:'AMZ-US01',sellerSku:'AMZ-US01-PLASMA-45-003-02',warehouse:'亚马逊美国仓（US01）',fnsku:'X001PLASMA45',creator:'李四',createdAt:'2026-09-16 09:15'},
        {id:24,sku:'WELD-HELMET-01',lingxingSku:'LX-HELMET-004',name:products['WELD-HELMET-01'].name,store:'AMZ-DE02',sellerSku:'AMZ-DE02-HELMET-01-004-02',warehouse:'亚马逊欧洲仓（EU01）',fnsku:'X001HELMET01',creator:'Admin',createdAt:'2026-09-12 16:40'},
        {id:25,sku:'CABLE-35MM',lingxingSku:'LX-CABLE-005',name:products['CABLE-35MM'].name,store:'AMZ-US01',sellerSku:'AMZ-US01-CABLE-35-005-02',warehouse:'亚马逊美国仓（US01）',fnsku:'X001CABLE35',creator:'张三',createdAt:'2026-09-10 11:08'},
        {id:26,sku:'GAS-REGULATOR',lingxingSku:'LX-AR-25-006',name:products['GAS-REGULATOR'].name,store:'AMZ-DE02',sellerSku:'AMZ-DE02-GAS-REG-006-02',warehouse:'亚马逊欧洲仓（EU01）',fnsku:'X001GASREG',creator:'李四',createdAt:'2026-09-08 15:25'}
      ],
      rowHtml:function(row){return '<tr>'+skuCell(row)+productCell(row)+plainCell(row.store)+codeCell(row.sellerSku)+codeCell(row.fnsku)+warehouseCell(row)+creatorCell(row)+timeCell(row)+actionCell(row)+'</tr>';},
      match:function(row){
        var type=getValue('fbaSkuSearchType'),keyword=getValue('fbaSkuKeyword');
        var field=type==='code'?row.fnsku:(type==='seller'?row.sellerSku:row.sku);
        if(keyword&&!includesAny(field,keyword))return false;
        var store=getValue('fbaStoreFilter');
        if(store&&row.store!==store)return false;
        var warehouse=getValue('fbaWarehouseFilter');
        if(warehouse&&row.warehouse!==warehouse)return false;
        return baseMatch(row,'fba');
      },
      confirmDetails:function(row){return [['SKU',row.sku],['店铺',row.store],['SellerSKU',row.sellerSku],['仓库名称',row.warehouse],['FNSKU',row.fnsku]];},
      exportColumns:[['SKU',function(row){return row.sku;}],['品名',function(row){return row.name;}],['店铺',function(row){return row.store;}],['SellerSKU',function(row){return row.sellerSku;}],['FNSKU',function(row){return row.fnsku;}],['仓库名称',function(row){return row.warehouse;}],['创建人',function(row){return row.creator;}],['创建时间',function(row){return row.createdAt;}]],
      template:{name:'FBA-FNSKU映射导入模板.csv',header:'SKU*,店铺*,SellerSKU*,仓库名称*,FNSKU*',sample:'示例 SKU,AMZ-US01,示例 SellerSKU,亚马逊美国仓（US01）,X001EXAMPLE'}
    },
    {
      key:'seller',prefix:'seller',codeLabel:'SellerSKU',codeKey:'sellerSku',warehouses:null,useDialog:true,exportName:'SellerSKU映射导出.csv',
      rows:[
        {id:31,sellerSku:'SMT001-MIG-200A-001-02',sku:'MIG-200A',qty:1,name:products['MIG-200A'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT001'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:45:33',updatedAt:'2026-11-04 19:45:33'},
        {id:39,sellerSku:'SMT001-MIG-200A-001-02',sku:'PLASMA-45',qty:2,name:products['PLASMA-45'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT001'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:45:33',updatedAt:'2026-11-04 19:45:33'},
        {id:32,sellerSku:'SMT001-TIG-316L-002-02',sku:'TIG-ROD-316L',qty:1,name:products['TIG-ROD-316L'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT001'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:45:33',updatedAt:'2026-11-04 19:45:33'},
        {id:33,sellerSku:'SMT004-MIG-200A-001-02',sku:'MIG-200A',qty:1,name:products['MIG-200A'].name,scope:'指定账号',platforms:['AliExpress','Amazon','eBay'],site:'全球',stores:['SMT001','SMT004','SMT006','SMT037','AMZ-US01','AMZ-DE02','AMZ-JP03','EBAY-HK01','EBAY-US02'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:40:12',updatedAt:'2026-11-04 19:40:12'},
        {id:40,sellerSku:'SMT004-MIG-200A-001-02',sku:'TIG-ROD-316L',qty:2,name:products['TIG-ROD-316L'].name,scope:'指定账号',platforms:['AliExpress','Amazon','eBay'],site:'全球',stores:['SMT001','SMT004','SMT006','SMT037','AMZ-US01','AMZ-DE02','AMZ-JP03','EBAY-HK01','EBAY-US02'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:40:12',updatedAt:'2026-11-04 19:40:12'},
        {id:41,sellerSku:'SMT004-MIG-200A-001-02',sku:'CABLE-35MM',qty:1,name:products['CABLE-35MM'].name,scope:'指定账号',platforms:['AliExpress','Amazon','eBay'],site:'全球',stores:['SMT001','SMT004','SMT006','SMT037','AMZ-US01','AMZ-DE02','AMZ-JP03','EBAY-HK01','EBAY-US02'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:40:12',updatedAt:'2026-11-04 19:40:12'},
        {id:34,sellerSku:'SMT006-PLASMA-45-003-02',sku:'PLASMA-45',qty:1,name:products['PLASMA-45'].name,scope:'指定账号',platforms:['AliExpress','Amazon'],site:'全球',stores:['SMT006','AMZ-US01'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:38:05',updatedAt:'2026-11-04 19:38:05'},
        {id:42,sellerSku:'SMT006-PLASMA-45-003-02',sku:'WELD-HELMET-01',qty:1,name:products['WELD-HELMET-01'].name,scope:'指定账号',platforms:['AliExpress','Amazon'],site:'全球',stores:['SMT006','AMZ-US01'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:38:05',updatedAt:'2026-11-04 19:38:05'},
        {id:35,sellerSku:'SMT037-HELMET-01-004-02',sku:'WELD-HELMET-01',qty:1,name:products['WELD-HELMET-01'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT037'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:32:47',updatedAt:'2026-11-04 19:32:47'},
        {id:36,sellerSku:'SMT006-CABLE-35-005-02',sku:'CABLE-35MM',qty:1,name:products['CABLE-35MM'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT006'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:28:21',updatedAt:'2026-11-04 19:28:21'},
        {id:37,sellerSku:'SMT004-GAS-REG-006-02',sku:'GAS-REGULATOR',qty:1,name:products['GAS-REGULATOR'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT004'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:21:56',updatedAt:'2026-11-04 19:21:56'},
        {id:38,sellerSku:'SMT037-TIG-316L-002-02',sku:'TIG-ROD-316L',qty:1,name:products['TIG-ROD-316L'].name,scope:'指定账号',platforms:['AliExpress'],site:'全球',stores:['SMT037'],source:'刊登系统同步',creator:'system',editor:'system',createdAt:'2026-11-04 19:15:09',updatedAt:'2026-11-04 19:15:09'}
      ],
      rowHtml:function(row){return '<tr>'+codeCell(row.sellerSku)+skuCell(row)+productCell(row)+platformCell(sellerPlatformText(row))+plainCell(sellerStoreText(row))+creatorCell(row)+timeTextCell(row.createdAt)+actionCell(row)+'</tr>';},
      /* 一对多分组合并行：同一 SellerSKU 的多条 SKU 映射合并为一组，公共列跨行只显示一次。 */
      rowsHtml:function(rows){
        var groups=[],order={};
        rows.forEach(function(row){
          var key=row.sellerSku;
          if(order[key]===undefined){order[key]=groups.length;groups.push([]);}
          groups[order[key]].push(row);
        });
        return groups.map(function(group){
          return group.map(function(row,i){
            var span=i===0?' rowspan="'+group.length+'"':'';
            var html='<tr data-group="'+escapeHtml(row.sellerSku)+'">';
            if(i===0)html+='<td'+span+'><span class="mapping-code-line"><span class="mapping-code-text" title="'+escapeHtml(row.sellerSku)+'">'+escapeHtml(row.sellerSku)+'</span>'+(group.length>1?'<span class="mapping-one-to-many-tag">一对多</span>':'')+'</span></td>';
            html+='<td><span class="mapping-code-text" title="'+escapeHtml(row.sku)+'">'+escapeHtml(row.sku)+'</span></td>';
            html+='<td><span class="mapping-plain-text">'+escapeHtml(row.qty||1)+'</span></td>';
            if(i===0){
              html+='<td'+span+'><span class="mapping-product"><span class="mapping-product-thumb" aria-hidden="true">'+placeholderSvg+'</span><span class="mapping-product-name" title="'+escapeHtml(row.name)+'">'+escapeHtml(row.name)+'</span></span></td>';
              html+='<td'+span+'><span class="mapping-platform-text" title="'+escapeHtml(sellerPlatformText(row))+'">'+escapeHtml(sellerPlatformText(row))+'</span></td>';
              html+='<td'+span+'><span class="mapping-plain-text" title="'+escapeHtml(sellerStoreText(row))+'">'+escapeHtml(sellerStoreText(row))+'</span></td>';
              html+='<td'+span+'><span class="mapping-plain-text">'+escapeHtml(row.creator)+'</span></td>';
              html+='<td'+span+'><span class="mapping-time-text">'+escapeHtml(row.createdAt)+'</span></td>';
              html+='<td'+span+'>'+actionButtons(row)+'</td>';
            }
            return html+'</tr>';
          }).join('');
        }).join('');
      },
      count:function(rows){
        var keys=[];rows.forEach(function(row){if(keys.indexOf(row.sellerSku)<0)keys.push(row.sellerSku);});
        return keys.length;
      },
      match:function(row){
        var keyword=getValue('sellerSkuKeyword');
        if(keyword&&!includesAny(getValue('sellerSkuSearchType')==='code'?row.sellerSku:row.sku,keyword))return false;
        var platform=getValue('sellerPlatformFilter');if(platform&&row.platforms.indexOf(platform)<0)return false;
        var store=getValue('sellerStoreFilter');if(store&&row.stores.indexOf(store)<0)return false;
        return baseMatch(row,'seller');
      },
      confirmDetails:function(row,group){return [['SellerSKU',row.sellerSku],['SKU',(group&&group.length?group:[row]).map(function(item){return item.sku;}).join('、')],['店铺名',sellerStoreText(row)]];},
      /* SellerSKU 页签不提供导入，导出列与列表列保持一致（含数量）。 */
      exportColumns:[['SellerSKU',function(row){return row.sellerSku;}],['SKU',function(row){return row.sku;}],['数量',function(row){return row.qty||1;}],['品名',function(row){return row.name;}],['平台',function(row){return sellerPlatformText(row);}],['店铺名',function(row){return sellerStoreText(row);}],['创建人',function(row){return row.creator;}],['创建时间',function(row){return row.createdAt;}]]
    }
  ];

  /* ---------- 日志 / 删除确认 / 导入 ---------- */
  function openLog(tab,row){
    var logs=[{type:'编辑',content:'更新了'+tab.codeLabel+'映射信息',operator:'Admin',time:'2026-09-20 10:30'},{type:'新增',content:'新增'+tab.codeLabel+'映射关系',operator:row.creator,time:row.createdAt}],mask=document.createElement('div');mask.className='purchase-log-modal ui-dialog-mask';
    var scope=tab.key==='seller'?'SellerSKU：'+escapeHtml(row.sellerSku):'SKU：'+escapeHtml(row.sku)+(row.warehouse?' · 仓库：'+escapeHtml(row.warehouse):'');
    mask.innerHTML='<div class="purchase-log-dialog" role="dialog" aria-modal="true" aria-label="映射关系操作日志"><header class="purchase-log-header"><div><h2>操作日志</h2><span>'+scope+'</span></div><button class="purchase-log-close" type="button" aria-label="关闭操作日志">×</button></header><div class="purchase-log-body"><div class="purchase-log-table-card"><table class="purchase-log-table"><thead><tr><th>操作类型</th><th>日志内容</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>'+logs.map(function(log){return '<tr><td>'+log.type+'</td><td class="purchase-log-content">'+escapeHtml(log.content)+'</td><td>'+escapeHtml(log.operator)+'</td><td>'+escapeHtml(log.time)+'</td></tr>';}).join('')+'</tbody></table></div></div><footer class="purchase-log-footer"><span>共 '+logs.length+' 条</span><div><button class="purchase-log-page" type="button" disabled>‹</button><button class="purchase-log-page active" type="button">1</button><button class="purchase-log-page" type="button" disabled>›</button></div></footer></div>';
    document.body.appendChild(mask);mask.addEventListener('click',function(event){if(event.target===mask||event.target.closest('.purchase-log-close'))mask.remove();});
  }

  function confirmDelete(tab,row){
    /* SellerSKU tab 按组删除：同一 SellerSKU 的全部 SKU 映射一起删除。 */
    var removeItems=tab.key==='seller'?tab.rows.filter(function(item){return item.sellerSku===row.sellerSku;}):[row];
    var details=tab.confirmDetails(row,removeItems).map(function(item){return '<div><dt>'+escapeHtml(item[0])+'</dt><dd>'+escapeHtml(item[1])+'</dd></div>';}).join('');
    var mask=document.createElement('div');mask.className='mapping-confirm-mask ui-dialog-mask';
    mask.innerHTML='<section class="mapping-confirm-dialog" role="dialog" aria-modal="true" aria-label="删除映射关系确认"><header class="mapping-confirm-header"><div><h2>删除映射关系</h2><p>删除后不可恢复，请确认操作。</p></div><button class="mapping-confirm-close" type="button" data-cancel aria-label="关闭">×</button></header><div class="mapping-confirm-body"><p>确认删除以下映射关系吗？</p><dl class="mapping-confirm-details">'+details+'</dl></div><footer class="mapping-confirm-footer"><button class="mapping-button" type="button" data-cancel>取消</button><button class="mapping-button danger" type="button" data-confirm>确认删除</button></footer></section>';
    document.body.appendChild(mask);
    var close=function(){mask.remove();};
    mask.addEventListener('click',function(event){
      if(event.target===mask||event.target.closest('[data-cancel]')){close();return;}
      if(!event.target.closest('[data-confirm]'))return;
      removeItems.forEach(function(item){var index=tab.rows.indexOf(item);if(index>=0)tab.rows.splice(index,1);});
      tab.filtered=tab.filtered.filter(function(item){return removeItems.indexOf(item)<0;});
      if(tab.editing&&removeItems.indexOf(tab.editing.row)>=0)tab.editing=null;
      close();render(tab);toast('映射关系已删除');
    });
    mask.addEventListener('keydown',function(event){if(event.key==='Escape')close();});
    mask.querySelector('.mapping-confirm-footer [data-cancel]').focus();
  }

  function openImport(tab){
    UIKit.openImportDialog({
      title:'导入'+tab.codeLabel+'映射关系',
      onDownload:function(){downloadTemplate(tab.template.name,tab.template.header,tab.template.sample);},
      onConfirm:function(file,close){
        if(!/\.(xlsx|xls|csv)$/i.test(file.name)){toast('请选择 .xlsx、.xls 或 .csv 文件');return;}
        close();toast(tab.codeLabel+'映射关系导入已提交校验');
      }
    });
  }

  /* ---------- SellerSKU 新增/编辑弹窗：SellerSKU + 多组 SKU/数量 + 平台/店铺级联选择 ---------- */
  var sellerRealPlatforms=['AliExpress','Amazon','eBay'];
  var sellerStoreMap={'AliExpress':['SMT001','SMT004','SMT006','SMT037'],'Amazon':['AMZ-US01','AMZ-DE02','AMZ-JP03'],'eBay':['EBAY-HK01','EBAY-US02']};
  function sellerStoresForPlatforms(platforms){
    var stores=[];
    (platforms||[]).forEach(function(platform){(sellerStoreMap[platform]||[]).forEach(function(store){if(stores.indexOf(store)<0)stores.push(store);});});
    return stores;
  }
  function sellerPlatformText(row){return row.platforms.length===sellerRealPlatforms.length?'全部':row.platforms.join('、');}
  function sellerStoreText(row){
    var expected=sellerStoresForPlatforms(row.platforms);
    if(expected.length&&expected.length===row.stores.length&&expected.every(function(store){return row.stores.indexOf(store)>=0;}))return '全部';
    return row.stores.join('、');
  }

  /* 平台/店铺级联选择器：单触发框，面板左栏平台、右栏店铺；勾选平台自动带出其全部店铺，每栏首项「全选」。 */
  function createSellerCascade(config){
    var state={platforms:(config.value&&config.value.platforms||[]).slice(),stores:(config.value&&config.value.stores||[]).slice(),open:false,panel:null,onDocClick:null,onDocScroll:null};
    var anchor=config.anchor;
    anchor.innerHTML='<span class="seller-cascade-text"></span>';
    function unionStores(){return sellerStoresForPlatforms(state.platforms);}
    function isAllPlatforms(){return config.platforms.length>0&&state.platforms.length===config.platforms.length;}
    function isAllStores(){var union=unionStores();return union.length>0&&union.every(function(store){return state.stores.indexOf(store)>=0;});}
    function platformLabel(){return isAllPlatforms()?'全部':state.platforms.join('、');}
    function storeLabel(){if(!state.platforms.length)return '';return isAllStores()?'全部':state.stores.join('、');}
    function triggerLabel(){return !state.platforms.length?config.placeholder:platformLabel()+' / '+storeLabel();}
    function renderTrigger(){
      anchor.querySelector('.seller-cascade-text').textContent=triggerLabel();
      anchor.classList.toggle('is-placeholder',!state.platforms.length);
      anchor.setAttribute('aria-expanded',state.open?'true':'false');
    }
    function optionHtml(value,label,checked){
      return '<button type="button" class="seller-cascade-option'+(checked?' is-checked':'')+'" data-value="'+escapeHtml(value)+'"><span class="seller-cascade-box">✓</span><span>'+escapeHtml(label)+'</span></button>';
    }
    function renderPanel(){
      if(!state.panel)return;
      var left=optionHtml('__allp__','全选',isAllPlatforms());
      config.platforms.forEach(function(platform){left+=optionHtml(platform,platform,state.platforms.indexOf(platform)>=0);});
      var right;
      if(!state.platforms.length){right='<p class="seller-cascade-empty">请先选择平台</p>';}
      else{
        right=optionHtml('__alls__','全选',isAllStores());
        unionStores().forEach(function(store){right+=optionHtml(store,store,state.stores.indexOf(store)>=0);});
      }
      state.panel.querySelector('[data-col="left"]').innerHTML=left;
      state.panel.querySelector('[data-col="right"]').innerHTML=right;
    }
    function closePanel(){
      if(state.onDocClick){document.removeEventListener('click',state.onDocClick);state.onDocClick=null;}
      if(state.onDocScroll){document.removeEventListener('scroll',state.onDocScroll,true);state.onDocScroll=null;}
      if(state.panel){state.panel.remove();state.panel=null;}
      state.open=false;renderTrigger();
    }
    function openPanel(){
      if(state.open)return;
      state.open=true;
      var panel=document.createElement('div');panel.className='seller-cascade-panel';
      panel.innerHTML='<div class="seller-cascade-col" data-col="left"><p class="seller-cascade-col-title">平台</p></div><div class="seller-cascade-col" data-col="right"><p class="seller-cascade-col-title">店铺</p></div>';
      document.body.appendChild(panel);
      var rect=anchor.getBoundingClientRect();
      panel.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-408))+'px';
      panel.style.top=Math.max(8,Math.min(rect.bottom+4,window.innerHeight-300))+'px';
      state.panel=panel;renderPanel();renderTrigger();
      state.onDocClick=function(event){if(panel.contains(event.target)||anchor.contains(event.target))return;closePanel();};
      state.onDocScroll=function(){closePanel();};
      document.addEventListener('click',state.onDocClick);
      document.addEventListener('scroll',state.onDocScroll,true);
      panel.addEventListener('click',function(event){
        var button=event.target.closest('.seller-cascade-option');if(!button)return;
        var value=button.getAttribute('data-value');
        if(value==='__allp__'){
          if(isAllPlatforms()){state.platforms=[];state.stores=[];}
          else{state.platforms=config.platforms.slice();state.stores=unionStores();}
        }else if(value==='__alls__'){
          if(isAllStores())state.stores=[];
          else state.stores=unionStores();
        }else if(config.platforms.indexOf(value)>=0){
          var platformIndex=state.platforms.indexOf(value);
          if(platformIndex>=0){
            state.platforms.splice(platformIndex,1);
            (sellerStoreMap[value]||[]).forEach(function(store){var index=state.stores.indexOf(store);if(index>=0)state.stores.splice(index,1);});
          }else{
            state.platforms.push(value);
            (sellerStoreMap[value]||[]).forEach(function(store){if(state.stores.indexOf(store)<0)state.stores.push(store);});
          }
        }else{
          var index=state.stores.indexOf(value);
          if(index>=0)state.stores.splice(index,1);else state.stores.push(value);
        }
        renderPanel();renderTrigger();
      });
    }
    anchor.addEventListener('click',function(){if(state.open)closePanel();else openPanel();});
    renderTrigger();
    return {
      getValue:function(){return {platforms:state.platforms.slice(),stores:state.stores.slice()};},
      destroy:closePanel
    };
  }

  function sellerPairHtml(pair,removable){
    return '<div class="seller-pair"><input class="seller-pair-sku" value="'+escapeHtml(pair.sku)+'" placeholder="请输入SKU"><input class="seller-pair-qty" type="number" min="1" value="'+(pair.qty||1)+'" aria-label="数量">'+(removable?'<button type="button" class="seller-pair-remove" aria-label="移除该组 SKU">×</button>':'')+'</div>';
  }

  function openSellerDialog(tab,row){
    var isEdit=!!row;
    /* 编辑时回填整组：同一 SellerSKU 的全部 SKU 映射都进弹窗。 */
    var pairs=row?tab.rows.filter(function(item){return item.sellerSku===row.sellerSku;}).map(function(item){return {sku:item.sku,qty:item.qty||1};}):[{sku:'',qty:1}];
    var platformValues=row?row.platforms.slice():[];
    var storeValues=row?row.stores.slice():[];
    var mask=document.createElement('div');mask.className='seller-dialog-mask ui-dialog-mask';
    mask.innerHTML='<section class="seller-dialog" role="dialog" aria-modal="true" aria-label="'+(isEdit?'编辑':'新增')+'映射关系"><header class="seller-dialog-header"><div><h2>'+(isEdit?'编辑映射关系':'新增映射关系')+'</h2><p>建立 SellerSKU 与 SKU、平台、店铺名的映射关系</p></div><button class="seller-dialog-close" type="button" aria-label="关闭">×</button></header><div class="seller-dialog-body"><div class="seller-section"><p class="seller-section-title">基本信息</p><div class="seller-field"><label class="seller-field-label" for="sellerDialogSku"><em>*</em>SellerSKU</label><input id="sellerDialogSku" value="'+escapeHtml(row?row.sellerSku:'')+'" placeholder="请输入SellerSKU"></div><div class="seller-field"><label class="seller-field-label" id="sellerDialogCascadeLabel"><em>*</em>平台/店铺</label><button type="button" class="seller-cascade-trigger" id="sellerDialogCascadeTrigger" aria-labelledby="sellerDialogCascadeLabel"></button></div></div><div class="seller-section"><p class="seller-section-title">SKU 明细</p><div id="sellerDialogPairs"></div></div></div><footer class="seller-dialog-footer"><button class="mapping-button" type="button" data-cancel>取消</button><button class="mapping-button primary" type="button" data-confirm>确定</button></footer></section>';
    document.body.appendChild(mask);

    /* 平台/店铺级联选择：勾选平台自动带出店铺，右栏可单独增减店铺。 */
    var cascade=createSellerCascade({anchor:mask.querySelector('#sellerDialogCascadeTrigger'),placeholder:'请选择平台/店铺',platforms:sellerRealPlatforms.slice(),value:{platforms:platformValues,stores:storeValues}});
    var skuInput=mask.querySelector('#sellerDialogSku');
    if(skuInput){
      skuInput.focus();
      skuInput.addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();var first=pairsBox.querySelector('.seller-pair-sku');if(first)first.focus();}});
    }

    var pairsBox=mask.querySelector('#sellerDialogPairs');
    function syncPairs(){
      pairsBox.querySelectorAll('.seller-pair').forEach(function(node,index){
        if(!pairs[index])return;
        pairs[index].sku=node.querySelector('.seller-pair-sku').value;
        pairs[index].qty=node.querySelector('.seller-pair-qty').value;
      });
    }
    function renderPairs(){
      syncPairs();
      pairsBox.innerHTML=pairs.map(function(pair){return sellerPairHtml(pair,pairs.length>1);}).join('')+'<button type="button" class="seller-pair-add" aria-label="添加一组 SKU">+</button>';
      pairsBox.querySelector('.seller-pair-add').addEventListener('click',function(){
        syncPairs();pairs.push({sku:'',qty:1});renderPairs();
        var inputs=pairsBox.querySelectorAll('.seller-pair .seller-pair-sku');inputs[inputs.length-1].focus();
      });
      pairsBox.querySelectorAll('.seller-pair-remove').forEach(function(button){
        button.addEventListener('click',function(){
          syncPairs();
          var nodes=pairsBox.querySelectorAll('.seller-pair'),index=Array.prototype.indexOf.call(nodes,button.parentNode);
          if(index>=0)pairs.splice(index,1);
          renderPairs();
        });
      });
    }
    renderPairs();

    function close(){cascade.destroy();mask.remove();}
    mask.addEventListener('click',function(event){
      if(event.target===mask||event.target.closest('.seller-dialog-close')||event.target.closest('[data-cancel]')){close();return;}
      if(!event.target.closest('[data-confirm]'))return;
      syncPairs();
      var sellerSku=mask.querySelector('#sellerDialogSku').value.trim();
      var selected=cascade.getValue(),platforms=selected.platforms,stores=selected.stores;
      if(!sellerSku){toast('请输入SellerSKU');return;}
      if(!platforms.length){toast('请选择平台');return;}
      if(!stores.length){toast('请选择店铺名');return;}
      var validPairs=[];
      for(var i=0;i<pairs.length;i++){
        var sku=pairs[i].sku.trim().toUpperCase(),qty=parseInt(pairs[i].qty,10);
        if(!sku){toast('请填写完整SKU');return;}
        if(!products[sku]){toast('SKU '+sku+' 无效，请检查');return;}
        if(!qty||qty<1){toast('数量必须为不小于 1 的整数');return;}
        validPairs.push({sku:sku,qty:qty});
      }
      var duplicate=validPairs.some(function(pair){return tab.rows.some(function(item){if(isEdit&&item.sellerSku===row.sellerSku)return false;return item.sellerSku===sellerSku&&item.sku===pair.sku;});});
      if(duplicate){toast('同一SellerSKU 与 SKU 的映射已存在');return;}
      var now=new Date().toISOString().slice(0,19).replace('T',' ');
      /* 编辑保存：整组替换（先移除原 SellerSKU 的全部行，再写入新的多组 SKU）。 */
      if(isEdit)tab.rows=tab.rows.filter(function(item){return item.sellerSku!==row.sellerSku;});
      validPairs.forEach(function(pair,index){
        var data={sellerSku:sellerSku,sku:pair.sku,qty:pair.qty,name:products[pair.sku].name,platforms:platforms.slice(),stores:stores.slice(),source:isEdit?row.source:'手动新增',creator:(isEdit&&index===0)?row.creator:'Admin',editor:'Admin',createdAt:(isEdit&&index===0)?row.createdAt:now,updatedAt:now};
        data.id=(isEdit&&index===0)?row.id:Date.now()+index;
        tab.rows.unshift(data);
      });
      close();
      tab.filtered=tab.rows.filter(tab.match);
      render(tab);
      toast(isEdit?'SellerSKU 映射已更新':'SellerSKU 映射已新增');
    });
  }

  /* ---------- FBA 新增/编辑弹窗：SKU → 店铺 → SellerSKU → FNSKU（前三项填写完成后才可录入）→ 仓库 ---------- */
  function openFbaDialog(tab,row){
    var isEdit=!!row;
    var mask=document.createElement('div');mask.className='seller-dialog-mask ui-dialog-mask';
    mask.innerHTML='<section class="seller-dialog" role="dialog" aria-modal="true" aria-label="'+(isEdit?'编辑':'新增')+'映射关系"><header class="seller-dialog-header"><div><h2>'+(isEdit?'编辑映射关系':'新增映射关系')+'</h2><p>建立 SKU 与店铺、SellerSKU、FNSKU 的映射关系</p></div><button class="seller-dialog-close" type="button" aria-label="关闭">×</button></header><div class="seller-dialog-body"><div class="seller-section"><p class="seller-section-title">基础信息</p><div class="seller-field"><label class="seller-field-label" for="fbaDialogSku"><em>*</em>SKU</label><input id="fbaDialogSku" value="'+escapeHtml(row?row.sku:'')+'" placeholder="请输入SKU"></div><div class="seller-field"><span class="seller-field-label">品名</span><div class="fba-name-view" id="fbaDialogName">'+(row?escapeHtml(row.name):'输入有效 SKU 后自动带出')+'</div></div></div><div class="seller-section"><p class="seller-section-title">映射信息</p><div class="fba-grid-2"><div class="seller-field"><label class="seller-field-label" for="fbaDialogStore"><em>*</em>店铺</label><select id="fbaDialogStore"><option value="">请选择店铺</option>'+fbaStores.map(function(option){return '<option '+(row&&row.store===option?'selected':'')+'>'+escapeHtml(option)+'</option>';}).join('')+'</select></div><div class="seller-field"><label class="seller-field-label" for="fbaDialogSeller"><em>*</em>SellerSKU</label><input id="fbaDialogSeller" value="'+escapeHtml(row?row.sellerSku:'')+'" placeholder="请输入SellerSKU"></div><div class="seller-field"><label class="seller-field-label" for="fbaDialogFnsku"><em>*</em>FNSKU</label><input id="fbaDialogFnsku" value="'+escapeHtml(row?row.fnsku:'')+'" placeholder="请输入FNSKU"></div><div class="seller-field"><label class="seller-field-label" for="fbaDialogWarehouse"><em>*</em>仓库名称</label><select id="fbaDialogWarehouse"><option value="">请选择仓库</option>'+warehousesFba.map(function(option){return '<option '+(row&&row.warehouse===option?'selected':'')+'>'+escapeHtml(option)+'</option>';}).join('')+'</select></div></div></div></div><footer class="seller-dialog-footer"><button class="mapping-button" type="button" data-cancel>取消</button><button class="mapping-button primary" type="button" data-confirm>确定</button></footer></section>';
    document.body.appendChild(mask);
    var skuInput=mask.querySelector('#fbaDialogSku'),nameView=mask.querySelector('#fbaDialogName'),storeSelect=mask.querySelector('select#fbaDialogStore'),sellerInput=mask.querySelector('#fbaDialogSeller'),fnskuInput=mask.querySelector('#fbaDialogFnsku'),warehouseSelect=mask.querySelector('select#fbaDialogWarehouse');
    /* 品名带出 + FNSKU 联动（弹窗内的 select 会被 custom-select 包裹，读取需限定 select 标签）。 */
    function syncForm(){
      var product=products[skuInput.value.trim().toUpperCase()];
      nameView.textContent=product?product.name:(skuInput.value.trim()?'SKU 无效，请检查':'输入有效 SKU 后自动带出');
      nameView.classList.toggle('is-invalid',!!skuInput.value.trim()&&!product);
      var ready=product&&storeSelect.value&&sellerInput.value.trim();
      if(ready){fnskuInput.disabled=false;}
      else{fnskuInput.disabled=true;fnskuInput.value='';}
      fnskuInput.placeholder=ready?'请输入FNSKU':'先填写 SKU、店铺和 SellerSKU';
    }
    skuInput.addEventListener('input',syncForm);
    ['change','input'].forEach(function(evt){storeSelect.addEventListener(evt,syncForm);});
    sellerInput.addEventListener('input',syncForm);
    syncForm();
    skuInput.focus();
    skuInput.addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();sellerInput.focus();}});
    sellerInput.addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();if(!fnskuInput.disabled)fnskuInput.focus();}});
    fnskuInput.addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();mask.querySelector('[data-confirm]').click();}});
    function close(){mask.remove();}
    mask.addEventListener('click',function(event){
      if(event.target===mask||event.target.closest('.seller-dialog-close')||event.target.closest('[data-cancel]')){close();return;}
      if(!event.target.closest('[data-confirm]'))return;
      var sku=skuInput.value.trim().toUpperCase();
      var store=storeSelect.value,sellerSku=sellerInput.value.trim(),fnsku=fnskuInput.value.trim(),warehouse=warehouseSelect.value;
      var product=products[sku];
      if(!sku){toast('请输入SKU');return;}
      if(!product){toast('SKU '+sku+' 无效，请检查');return;}
      if(!store){toast('请选择店铺');return;}
      if(!sellerSku){toast('请输入SellerSKU');return;}
      if(!fnsku){toast('请输入FNSKU');return;}
      if(!warehouse){toast('请选择仓库');return;}
      /* 唯一性：同一店铺 + 同一 SellerSKU + 同一 FBA 仓库只能对应一个 FNSKU。 */
      var duplicate=tab.rows.some(function(item){
        if(isEdit&&item.id===row.id)return false;
        return item.store===store&&item.sellerSku===sellerSku&&item.warehouse===warehouse;
      });
      if(duplicate){toast('同一店铺 + SellerSKU + FBA 仓库只能对应一个 FNSKU');return;}
      var data={sku:sku,lingxingSku:product.lingxingSku,name:product.name,store:store,sellerSku:sellerSku,fnsku:fnsku,warehouse:warehouse,creator:isEdit?row.creator:'Admin',createdAt:isEdit?row.createdAt:new Date().toISOString().slice(0,16).replace('T',' ')};
      if(isEdit){Object.assign(row,data);}
      else{data.id=Date.now();tab.rows.unshift(data);}
      close();
      tab.filtered=tab.rows.filter(tab.match);
      render(tab);
      toast(isEdit?'FNSKU 映射已更新':'FNSKU 映射已新增');
    });
  }

  /* ---------- 行内新增 / 行内编辑 ---------- */
  function inputRowHtml(tab,row){
    var sku=row?row.sku:'',code=row?row[tab.codeKey]:'',warehouse=row?row.warehouse:'';
    var creator=row?row.creator:'Admin',createdAt=row?row.createdAt:'保存后生成';
    var html='<tr class="mapping-edit-row'+(row?'':' is-new')+'">';
    html+='<td><input class="mapping-row-input mapping-row-sku" value="'+escapeHtml(sku)+'" placeholder="请输入 SKU"></td>';
    html+='<td><span class="mapping-product"><span class="mapping-product-thumb" aria-hidden="true">'+placeholderSvg+'</span><span class="mapping-row-name">'+(row?escapeHtml(row.name):'输入有效 SKU 后自动带出')+'</span></span></td>';
    if(tab.warehouses){
      html+='<td><select class="mapping-row-input mapping-row-warehouse"><option value="">请选择仓库</option>'+tab.warehouses.map(function(option){return '<option '+(warehouse===option?'selected':'')+'>'+escapeHtml(option)+'</option>';}).join('')+'</select></td>';
    }
    html+='<td><input class="mapping-row-input mapping-row-code" value="'+escapeHtml(code)+'" placeholder="请输入'+tab.codeLabel+'"></td>';
    html+='<td><span class="mapping-plain-text">'+escapeHtml(creator)+'</span></td>';
    html+='<td><span class="mapping-time-text">'+escapeHtml(createdAt)+'</span></td>';
    html+='<td><button class="mapping-link" type="button" data-action="save">保存</button><button class="mapping-link log-link" type="button" data-action="cancel">取消</button></td>';
    return html+'</tr>';
  }

  function startEdit(tab,row){tab.editing={row:row||null};render(tab);}

  function saveEdit(tab){
    var editRow=document.querySelector('#'+tab.prefix+'TableBody .mapping-edit-row');
    if(!editRow){tab.editing=null;render(tab);return;}
    var sku=editRow.querySelector('.mapping-row-sku').value.trim().toUpperCase();
    var code=editRow.querySelector('.mapping-row-code').value.trim();
    /* custom-select 会把动态插入的 select 包一层同名 class 的 div，这里必须限定 select 标签。 */
    var warehouseNode=editRow.querySelector('select.mapping-row-warehouse');
    var warehouse=warehouseNode?warehouseNode.value:'';
    var editing=tab.editing&&tab.editing.row;
    var product=products[sku];
    if(!sku||!code||(tab.warehouses&&!warehouse)){toast('请填写完整必填字段');return;}
    if(!product){toast('请输入有效的 SKU');return;}
    var duplicate=tab.rows.some(function(row){
      if(row.id===(editing&&editing.id))return false;
      if(row.sku!==sku)return false;
      return tab.warehouses?row.warehouse===warehouse:true;
    });
    if(duplicate){toast(tab.warehouses?'同一个 SKU 在同一仓库只能配置一条映射关系':'同一个 SKU 只能配置一条'+tab.codeLabel+'映射关系');return;}
    var data={sku:sku,lingxingSku:product.lingxingSku,name:product.name,creator:editing?editing.creator:'Admin',createdAt:editing?editing.createdAt:new Date().toISOString().slice(0,16).replace('T',' ')};
    data[tab.codeKey]=code;
    if(tab.warehouses)data.warehouse=warehouse;
    if(editing)Object.assign(editing,data);
    else{data.id=Date.now();tab.rows.unshift(data);}
    tab.editing=null;tab.filtered=tab.rows.slice();render(tab);
    toast(editing?tab.codeLabel+'映射已更新':tab.codeLabel+'映射已新增');
  }

  /* ---------- 列表渲染与事件绑定 ---------- */
  function render(tab){
    var body=document.querySelector('#'+tab.prefix+'TableBody'),adding=tab.editing&&!tab.editing.row,html='';
    if(adding)html+=inputRowHtml(tab,null);
    if(tab.rowsHtml)html+=tab.rowsHtml(tab.filtered);
    else tab.filtered.forEach(function(row){html+=(tab.editing&&tab.editing.row===row)?inputRowHtml(tab,row):tab.rowHtml(row);});
    body.innerHTML=html;
    document.querySelector('#'+tab.prefix+'EmptyState').hidden=tab.filtered.length!==0||adding;
    document.querySelector('#'+tab.prefix+'Count').textContent='共 '+(tab.count?tab.count(tab.filtered):tab.filtered.length)+' 条';
    /* 分组行整组 hover 高亮 */
    body.querySelectorAll('tr[data-group]').forEach(function(tr){
      tr.addEventListener('mouseenter',function(){body.querySelectorAll('tr[data-group="'+CSS.escape(tr.dataset.group)+'"]').forEach(function(node){node.classList.add('is-group-hover');});});
      tr.addEventListener('mouseleave',function(){body.querySelectorAll('tr.is-group-hover').forEach(function(node){node.classList.remove('is-group-hover');});});
    });
    body.querySelectorAll('[data-action]').forEach(function(button){
      button.addEventListener('click',function(){
        var action=button.dataset.action;
        if(action==='save'){saveEdit(tab);return;}
        if(action==='cancel'){tab.editing=null;render(tab);return;}
        var row=tab.rows.find(function(item){return String(item.id)===button.dataset.id;});
        if(!row)return;
        if(action==='edit'){if(tab.key==='fba')openFbaDialog(tab,row);else if(tab.useDialog)openSellerDialog(tab,row);else startEdit(tab,row);}
        else if(action==='delete')confirmDelete(tab,row);
        else if(action==='log')openLog(tab,row);
      });
    });
    var skuInput=body.querySelector('.mapping-edit-row .mapping-row-sku');
    if(skuInput){
      skuInput.addEventListener('input',function(){
        var product=products[skuInput.value.trim().toUpperCase()];
        var nameNode=body.querySelector('.mapping-edit-row .mapping-row-name');
        if(nameNode)nameNode.textContent=product?product.name:'输入有效 SKU 后自动带出';
      });
      body.querySelectorAll('.mapping-edit-row .mapping-row-input').forEach(function(input){
        input.addEventListener('keydown',function(event){if(event.key==='Enter')saveEdit(tab);});
      });
      skuInput.focus();
    }
  }

  function initTab(tab){
    tab.filtered=tab.rows.slice();
    tab.editing=null;
    function search(){tab.filtered=tab.rows.filter(tab.match);render(tab);}
    function reset(){
      ['SkuKeyword','ProductNameKeyword','StartDate','EndDate'].forEach(function(suffix){var node=document.querySelector('#'+tab.prefix+suffix);if(node)node.value='';});
      ['SkuSearchType','CreatorFilter','WarehouseFilter','EditorFilter','PlatformFilter','SiteFilter','StoreFilter'].forEach(function(suffix){var node=document.querySelector('#'+tab.prefix+suffix);if(node)node.selectedIndex=0;});
      if(keywordInput)keywordInput.placeholder='请输入 SKU，支持多个，用逗号或空格隔开';
      tab.filtered=tab.rows.slice();
      if(window.enhanceCustomSelects)window.enhanceCustomSelects();
      render(tab);
    }
    document.querySelector('#'+tab.prefix+'SearchButton').addEventListener('click',search);
    document.querySelector('#'+tab.prefix+'ResetButton').addEventListener('click',reset);
    ['SkuKeyword','ProductNameKeyword'].forEach(function(suffix){
      var node=document.querySelector('#'+tab.prefix+suffix);
      if(node)node.addEventListener('keydown',function(event){if(event.key==='Enter')search();});
    });
    var typeSelect=document.querySelector('#'+tab.prefix+'SkuSearchType'),keywordInput=document.querySelector('#'+tab.prefix+'SkuKeyword');
    if(typeSelect&&keywordInput){
      typeSelect.addEventListener('change',function(){
        var label=typeSelect.value==='code'?tab.codeLabel:(typeSelect.value==='seller'?'SellerSKU':'SKU');
        keywordInput.placeholder='请输入'+label+'，支持多个，用逗号或空格隔开';
      });
    }
    document.querySelector('#'+tab.prefix+'AddButton').addEventListener('click',function(){if(tab.key==='fba')openFbaDialog(tab,null);else if(tab.useDialog)openSellerDialog(tab,null);else startEdit(tab,null);});
    /* SellerSKU 页签不提供导入（无导入按钮），绑定前需判空。 */
    var importButton=document.querySelector('#'+tab.prefix+'ImportButton');
    if(importButton)importButton.addEventListener('click',function(){openImport(tab);});
    document.querySelector('#'+tab.prefix+'ExportButton').addEventListener('click',function(){exportRows(tab);});
    render(tab);
  }

  /* ---------- tab 切换 ---------- */
  var tabButtons=document.querySelectorAll('.mapping-tabs [data-tab]');
  var panels=document.querySelectorAll('[data-tab-panel]');
  tabButtons.forEach(function(button){
    button.addEventListener('click',function(){
      tabButtons.forEach(function(item){item.classList.toggle('is-active',item===button);});
      var key=button.dataset.tab;
      panels.forEach(function(panel){panel.hidden=panel.dataset.tabPanel!==key;});
    });
  });

  tabs.forEach(initTab);
})();
