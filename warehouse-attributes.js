(function(){
  const values=Object.freeze(['自营仓','平台仓','海外仓','供应商仓','物流中转仓']);
  const byName=Object.freeze({
    '耗材仓-东莞2号':'自营仓',
    '美通物流中转仓':'物流中转仓',
    '元速跨境物流中转仓':'物流中转仓',
    '亚马逊LAS1仓':'平台仓',
    '深圳市华英科技有限公司':'供应商仓',
    '梧州供应商仓':'供应商仓',
    '台州华熙灯饰有限公司':'供应商仓',
    '宁波测试供应商仓':'供应商仓'
  });
  const codes=Object.freeze({
    '耗材仓-东莞2号':'DG-HC02',
    '美通物流中转仓':'MT-US-001',
    '元速跨境物流中转仓':'YS-US-002',
    '亚马逊LAS1仓':'LAS1',
    '深圳市华英科技有限公司':'HY-SZ-001',
    '梧州供应商仓':'WZ-GX-001',
    '台州华熙灯饰有限公司':'TZ-ZJ-001',
    '宁波测试供应商仓':'NB-TEST-001'
  });
  window.WarehouseAttributes=Object.freeze({values,byName,codes,of:name=>byName[name]||'',codeOf:name=>codes[name]||''});
})();
