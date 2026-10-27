(function () {
  'use strict';

  var modules = [
    { label: '工作台', icon: 'dashboard', page: 'workbench', path: '../workbench/index.html' },
    { label: '基础', icon: 'basic', page: 'base', path: '../workbench/index.html#basic' },
    { label: '财务', icon: 'finance' },
    { label: '供应链', icon: 'supplyChain', page: 'inventoryQuery', path: '../inventory-query/index.html' },
    { label: '运营', icon: 'operations' },
    { label: '产品', icon: 'product', page: 'productList', path: '../product-list/index.html' }
  ];

  /* Single source of truth for every sidebar page route. Each prototype page
     lives one directory below /pages, so these paths are shared everywhere. */
  var pageRoutes = Object.freeze({
    workbench: '../workbench/index.html',
    base: '../workbench/index.html#basic',
    roleManagement: '../role-management/index.html',
    workflowManagement: '../workflow-management/index.html',
    forecast: '../demand-forecast/index.html',
    stock: '../stock-plan/index.html',
    purchase: '../purchase-plan-2/index.html',
    shipment: '../shipment-plan/index.html',
    purchaseOrder: '../purchase-orders/index.html',
    shipmentOrder: '../shipment-orders/index.html',
    fbaShipment: '../fba-shipment/index.html',
    skuFirstLegCost: '../sku-first-leg-cost/index.html',
    historicalPurchasePrice: '../historical-purchase-price/index.html',
    inventoryQuery: '../inventory-query/index.html',
    inventoryFlow: '../inventory-flow/index.html',
    batchInventory: '../batch-inventory/index.html',
    processingOrder: '../processing-orders/index.html',
    transferOrder: '../transfer-orders/index.html',
    inventoryAdjustment: '../inventory-adjustments/index.html',
    pickupOrder: '../pickup-orders/index.html',
    supplierList: '../supplier-list/index.html',
    warehouseSku: '../warehouse-sku/index.html',
    productList: '../product-list/index.html',
    overseasSkuMapping: '../overseas-sku-mapping/index.html'
  });

  var icons = {
    dashboard: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',
    basic: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/>',
    finance: '<path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13"/><path d="M16 12h6v4h-6a2 2 0 0 1 0-4z"/>',
    supplyChain: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="m7.7 7 3.1 8.2M16.3 7l-3.1 8.2M8 6h8"/>',
    operations: '<path d="M3 3v18h18"/><path d="m6 15 4-4 3 3 6-7"/><path d="M15 7h4v4"/>',
    product: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21"/>',
    workOrder: '<path d="M9 5V3h6v2M7 5h10a2 2 0 0 1 2 2v14H5V7a2 2 0 0 1 2-2z"/><path d="m8 13 2 2 5-5M8 18h8"/>',
    inventory: '<path d="m12 3 9 5-9 5-9-5zM3 8v8l9 5 9-5V8M12 13v8"/>',
    plan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 15l2 2 5-5"/>',
    collaboration: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/>',
    account: '<circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 11-5.7M18 14v6M15 17h6"/>',
    organization: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v5M5 17v-3h14v3"/>',
    company: '<path d="M4 21V5l8-3v19M12 9h8v12M8 7v1M8 11v1M8 15v1M16 13v1M16 17v1M2 21h20"/>',
    assets: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/>',
    log: '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20.3h-3v-.08A1.7 1.7 0 0 0 10.66 18.66a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.56-1.04H5.3v-3h.14A1.7 1.7 0 0 0 7 9.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V4.6h3v.1a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 9.92a1.7 1.7 0 0 0 1.56 1.04h.14v3h-.14A1.7 1.7 0 0 0 19.4 15z"/>'
  };

  var themes = [
    { id: 'obsidian-red', label: '曜石红', background: '#202023', active: '#373739', accent: '#F53661' },
    { id: 'cloud-blue', label: '云海蓝', background: '#FFFFFF', active: '#EAF3FF', accent: '#1677FF' },
    { id: 'midnight-blue', label: '极夜蓝', background: '#122037', active: '#1C304E', accent: '#86BDF5' },
    { id: 'indigo-slate', label: '靛青灰', background: '#1F2029', active: '#343640', accent: '#B69CFF' },
    { id: 'cloud-pine', label: '云杉绿', background: '#FFFFFF', active: '#EDF8F1', accent: '#2FA66A' },
    { id: 'cloud-mist', label: '云雾紫', background: '#F6F7F9', active: '#EAE6FF', accent: '#7C6EE6' }
  ];

  var sideIcons = [
    { label: '仓储管理', icon: 'inventory' },
    { label: '计划管理', icon: 'plan' },
    { label: '供应链协同', icon: 'collaboration' },
    { label: '供应商管理', icon: 'company' },
    { label: '账号管理', icon: 'account' },
    { label: '业务组织', icon: 'organization' },
    { label: '公司组织', icon: 'company' },
    { label: '系统日志', icon: 'log' },
    { label: '工作台', icon: 'dashboard' },
    { label: '权限管理', icon: 'account' },
    { label: '基础配置', icon: 'settings' },
    { label: '产品管理', icon: 'product' }
  ];

  function createIcon(name) {
    var icon = document.createElement('span');
    icon.className = 'menu-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false">' + icons[name] + '</svg>';
    return icon;
  }

  function mountMenuIcons(buttons) {
    buttons.slice(0, modules.length).forEach(function (button, index) {
      if (!button.querySelector('.menu-icon')) button.insertBefore(createIcon(modules[index].icon), button.firstChild);
    });

    var selector = '.nav-group-title, .nav-section-title, .supplier-nav-title, .supplier-nav-section, .side-nav > .nav-section, .workbench-nav-title, .product-sidebar > .nav-section, .nav-item.standalone';
    document.querySelectorAll(selector).forEach(function (item) {
      if (item.querySelector('.menu-icon')) return;
      var text = (item.textContent || '').replace(/[\s⌓⌄]/g, '');
      var match = sideIcons.find(function (entry) { return text.indexOf(entry.label) >= 0; });
      if (!match) return;
      var reference = item.children[1] || item.firstChild;
      item.insertBefore(createIcon(match.icon), reference);
    });
  }

  function getSubmenuItems(title) {
    if (title.classList.contains('nav-section-title')) {
      return Array.prototype.slice.call(title.parentElement.querySelectorAll(':scope > .nav-item:not(.standalone)'));
    }

    var items = [];
    var current = title.nextElementSibling;
    while (current) {
      if (current.matches('.nav-group-title, .nav-section, .supplier-nav-title, .supplier-nav-section, .collapse, .side-footer, .nav-collapse-button')) break;
      if (current.matches('.nav-item, .supplier-nav-item')) items.push(current);
      current = current.nextElementSibling;
    }
    return items;
  }

  function closeFlyout() {
    var flyout = document.querySelector('.nav-flyout');
    if (flyout) flyout.remove();
    document.querySelectorAll('.nav-flyout-open').forEach(function (item) { item.classList.remove('nav-flyout-open'); });
  }

  function closeThemePopover() {
    var popover = document.querySelector('.nav-theme-popover');
    if (popover) popover.remove();
    document.querySelectorAll('.nav-theme-button').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
  }

  function getTheme() {
    var saved = 'obsidian-red';
    try { saved = window.localStorage.getItem('middle-platform-theme') || saved; } catch (error) { /* local file fallback */ }
    if (saved === 'enterprise-blue-white') saved = 'cloud-blue';
    return themes.some(function (theme) { return theme.id === saved; }) ? saved : 'obsidian-red';
  }

  function applyTheme(themeId) {
    var theme = themes.find(function (item) { return item.id === themeId; }) || themes[0];
    document.documentElement.setAttribute('data-theme', theme.id);
    try { window.localStorage.setItem('middle-platform-theme', theme.id); } catch (error) { /* local file fallback */ }
  }

  function openThemePopover(trigger) {
    closeFlyout();
    closeThemePopover();
    var rect = trigger.getBoundingClientRect();
    var popover = document.createElement('section');
    popover.className = 'nav-theme-popover';
    popover.setAttribute('aria-label', '主题设置');
    popover.style.left = Math.max(8, rect.right + 8) + 'px';
    popover.style.bottom = '12px';
    popover.innerHTML = '<div class="nav-theme-title">主题设置</div><div class="nav-theme-grid"></div>';
    var grid = popover.querySelector('.nav-theme-grid');
    themes.forEach(function (theme) {
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'nav-theme-option' + (getTheme() === theme.id ? ' active' : '');
      option.setAttribute('aria-label', '切换为' + theme.label + '主题');
      option.title = theme.label;
      option.innerHTML = '<span class="nav-theme-swatch" style="--swatch-bg:' + theme.background + ';--swatch-active:' + theme.active + ';--swatch-accent:' + theme.accent + '"><i></i><b></b><em></em></span>';
      option.addEventListener('click', function () {
        applyTheme(theme.id);
        closeThemePopover();
      });
      grid.appendChild(option);
    });
    document.body.appendChild(popover);
    trigger.setAttribute('aria-expanded', 'true');
  }

  function mountThemeSwitcher(sidebar) {
    if (sidebar.querySelector('.nav-theme-button')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-theme-button';
    button.setAttribute('aria-label', '主题设置');
    button.setAttribute('title', '主题设置');
    button.setAttribute('aria-expanded', 'false');
    button.appendChild(createIcon('settings'));
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (document.querySelector('.nav-theme-popover')) closeThemePopover();
      else openThemePopover(button);
    });
    sidebar.appendChild(button);
  }

  function openFlyout(title, items) {
    closeFlyout();
    var rect = title.getBoundingClientRect();
    var flyout = document.createElement('section');
    flyout.className = 'nav-flyout';
    flyout.setAttribute('aria-label', (title.textContent || '').trim() + '二级菜单');
    flyout.style.top = Math.max(48, Math.min(rect.top, window.innerHeight - 260)) + 'px';
    items.forEach(function (source) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'nav-flyout-item' + (source.classList.contains('active') ? ' active' : '');
      var copy = source.cloneNode(true);
      copy.querySelectorAll('.menu-icon, .nav-symbol, .mini, .nav-icon, .item-chevron').forEach(function (node) { node.remove(); });
      item.textContent = copy.textContent.trim();
      item.addEventListener('click', function () {
        source.click();
        closeFlyout();
      });
      flyout.appendChild(item);
    });
    document.body.appendChild(flyout);
    title.classList.add('nav-flyout-open');
  }

  function setCollapsed(collapsed) {
    document.documentElement.classList.toggle('nav-collapsed', collapsed);
    document.querySelectorAll('.nav-collapse-button').forEach(function (button) {
      button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      button.setAttribute('title', collapsed ? '展开导航' : '收起导航');
    });
    try { window.localStorage.setItem('middle-platform-nav-collapsed', collapsed ? '1' : '0'); } catch (error) { /* local file fallback */ }
    if (!collapsed) closeFlyout();
    closeThemePopover();
  }

  /* The inventory menu is shared by every standalone prototype page. Keep the
     transfer-order entry mounted here so opening a child page directly (rather
     than through the root iframe) still exposes the same navigation. */
  function mountTransferNav() {
    var titles = Array.prototype.slice.call(document.querySelectorAll('.nav-group-title, .nav-section-title, .side-nav > .nav-section, .workbench-nav-title'));
    titles.forEach(function (title) {
      if (!/(库存|仓储)管理/.test(title.textContent || '')) return;
      var container = title.parentElement;
      if (!container || container.querySelector('[data-page-nav="transferOrder"]')) return;
      var source = container.querySelector('[data-page-nav="processingOrder"]');
      if (!source) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'transferOrder');
      item.classList.remove('active');
      item.innerHTML = '<span class="mini">⇄</span>调拨单';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function mountInventoryAdjustmentNav() {
    var titles = Array.prototype.slice.call(document.querySelectorAll('.nav-group-title, .nav-section-title, .side-nav > .nav-section, .workbench-nav-title'));
    titles.forEach(function (title) {
      if (!/(库存|仓储)管理/.test(title.textContent || '')) return;
      var container = title.parentElement;
      if (!container || container.querySelector('[data-page-nav="inventoryAdjustment"]')) return;
      var source = container.querySelector('[data-page-nav="transferOrder"]');
      if (!source) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'inventoryAdjustment');
      item.classList.remove('active');
      if (location.pathname.indexOf('/inventory-adjustments/') >= 0) item.classList.add('active');
      item.innerHTML = '<span class="mini">±</span>损益单';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function mountPickupOrderNav() {
    var titles = Array.prototype.slice.call(document.querySelectorAll('.nav-group-title, .nav-section-title, .side-nav > .nav-section, .workbench-nav-title'));
    titles.forEach(function (title) {
      if (!/(库存|仓储)管理/.test(title.textContent || '')) return;
      var container = title.parentElement;
      if (!container || container.querySelector('[data-page-nav="pickupOrder"]')) return;
      var source = container.querySelector('[data-page-nav="inventoryAdjustment"]');
      if (!source) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'pickupOrder');
      item.classList.remove('active');
      if (location.pathname.indexOf('/pickup-orders/') >= 0) item.classList.add('active');
      item.innerHTML = '<span class="mini">↗</span>提货单';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function mountInventoryFlowNav() {
    var titles = Array.prototype.slice.call(document.querySelectorAll('.nav-group-title, .nav-section-title, .side-nav > .nav-section, .workbench-nav-title'));
    titles.forEach(function (title) {
      if (!/(库存|仓储)管理/.test(title.textContent || '')) return;
      var container = title.parentElement;
      if (!container || container.querySelector('[data-page-nav="inventoryFlow"]')) return;
      var source = container.querySelector('[data-page-nav="inventoryQuery"]');
      if (!source) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'inventoryFlow');
      item.classList.remove('active');
      if (location.pathname.indexOf('/inventory-flow/') >= 0) item.classList.add('active');
      item.innerHTML = '<span class="mini">▦</span>库存流水';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function mountBatchInventoryNav() {
    var titles = Array.prototype.slice.call(document.querySelectorAll('.nav-group-title, .nav-section-title, .side-nav > .nav-section, .workbench-nav-title'));
    titles.forEach(function (title) {
      if (!/(库存|仓储)管理/.test(title.textContent || '')) return;
      var container = title.parentElement;
      if (!container || container.querySelector('[data-page-nav="batchInventory"]')) return;
      var source = container.querySelector('[data-page-nav="inventoryFlow"]');
      if (!source) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'batchInventory');
      item.classList.remove('active');
      if (location.pathname.indexOf('/batch-inventory/') >= 0) item.classList.add('active');
      item.innerHTML = '<span class="mini">▤</span>批次库存';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function mountSupplierNav() {
    var titles = Array.prototype.slice.call(document.querySelectorAll('.nav-group-title, .side-nav > .nav-section'));
    titles.forEach(function (title) {
      if ((title.textContent || '').indexOf('供应链协同') < 0) return;
      var container = title.parentElement;
      if (!container || container.querySelector('[data-page-nav="supplierList"]')) return;
      var lastItem = title;
      while (lastItem.nextElementSibling && lastItem.nextElementSibling.matches('.nav-item')) lastItem = lastItem.nextElementSibling;
      var group = document.createElement('div');
      group.className = title.className;
      group.innerHTML = '<span>▤</span><span>供应商管理</span><span class="chev">⌃</span>';
      var item = document.createElement('div');
      item.className = 'nav-item' + (location.pathname.indexOf('/supplier-list/') >= 0 ? ' active' : '');
      item.setAttribute('data-page-nav', 'supplierList');
      item.innerHTML = '<span class="mini">▤</span>供应商列表';
      lastItem.insertAdjacentElement('afterend', group);
      group.insertAdjacentElement('afterend', item);
    });
  }

  function mountHistoricalPurchasePriceNav() {
    document.querySelectorAll('[data-page-nav="skuFirstLegCost"]').forEach(function (source) {
      var container = source.parentElement;
      if (!container || container.querySelector('[data-page-nav="historicalPurchasePrice"]')) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'historicalPurchasePrice');
      item.classList.remove('active');
      if (location.pathname.indexOf('/historical-purchase-price/') >= 0) item.classList.add('active');
      item.innerHTML = '<span class="mini">⌁</span>历史采购价';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function mountFbaShipmentNav() {
    document.querySelectorAll('[data-page-nav="shipmentOrder"]').forEach(function (source) {
      var container = source.parentElement;
      if (!container || container.querySelector('[data-page-nav="fbaShipment"]')) return;
      var item = source.cloneNode(true);
      item.setAttribute('data-page-nav', 'fbaShipment');
      item.classList.remove('active');
      if (location.pathname.indexOf('/fba-shipment/') >= 0) item.classList.add('active');
      item.innerHTML = '<span class="mini">♧</span>FBA货件';
      source.insertAdjacentElement('afterend', item);
    });
  }

  function renameWarehouseNavigation() {
    var selector = '.nav-group-title, .nav-section-title, .side-nav > .nav-section, .workbench-nav-title, .supplier-nav-title, .supplier-nav-section';
    document.querySelectorAll(selector).forEach(function (title) {
      if ((title.textContent || '').indexOf('库存管理') < 0) return;
      var walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) node.nodeValue = node.nodeValue.replace('库存管理', '仓储管理');
    });
  }

  function profileToast(message, error) {
    var toast = document.querySelector('.profile-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'profile-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'profile-toast is-visible' + (error ? ' is-error' : '');
    clearTimeout(profileToast.timer);
    profileToast.timer = setTimeout(function () { toast.className = 'profile-toast'; }, 2200);
  }

  function closeAccountMenu() {
    var menu = document.querySelector('.account-menu');
    var trigger = document.querySelector('.account-trigger');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function openProfileDrawer() {
    closeAccountMenu();
    var old = document.querySelector('.profile-mask');
    if (old) old.remove();
    var savedAvatar = '';
    try { savedAvatar = window.localStorage.getItem('middle-platform-user-avatar') || ''; } catch (error) { /* local file fallback */ }
    var mask = document.createElement('div');
    mask.className = 'profile-mask is-visible';
    mask.innerHTML = '<aside class="profile-drawer" role="dialog" aria-modal="true" aria-label="个人设置"><header class="profile-drawer__header"><div><h2>个人设置</h2><p>管理当前账号的头像与登录密码</p></div><button class="profile-close" type="button" aria-label="关闭">×</button></header><div class="profile-drawer__body"><section class="profile-section"><h3>基本信息</h3><div class="profile-avatar-row"><div class="profile-avatar-preview">' + (savedAvatar ? '<img src="' + savedAvatar + '" alt="当前头像">' : '<span>A</span>') + '</div><div><strong>Admin</strong><p>支持 JPG、PNG 图片，大小不超过 2 MB</p><button class="profile-upload-button" type="button">更换头像</button><input class="profile-file-input" type="file" accept="image/png,image/jpeg" hidden></div></div></section><section class="profile-section"><h3>修改密码</h3><label class="profile-field"><span><em>*</em>当前密码</span><div class="profile-password"><input type="password" data-profile-field="current" placeholder="请输入当前密码"><button type="button" aria-label="显示当前密码">◉</button></div></label><label class="profile-field"><span><em>*</em>新密码</span><div class="profile-password"><input type="password" data-profile-field="next" placeholder="请输入 6–20 位新密码"><button type="button" aria-label="显示新密码">◉</button></div></label><label class="profile-field"><span><em>*</em>确认新密码</span><div class="profile-password"><input type="password" data-profile-field="confirm" placeholder="请再次输入新密码"><button type="button" aria-label="显示确认密码">◉</button></div></label><p class="profile-form-error"></p></section></div><footer class="profile-drawer__footer"><button class="profile-button profile-cancel" type="button">取消</button><button class="profile-button profile-save" type="button">保存修改</button></footer></aside>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    mask.querySelector('.profile-close').addEventListener('click', close);
    mask.querySelector('.profile-cancel').addEventListener('click', close);
    mask.addEventListener('click', function (event) { if (event.target === mask) close(); });
    mask.querySelectorAll('.profile-password button').forEach(function (button) {
      button.addEventListener('click', function () {
        var input = button.previousElementSibling;
        input.type = input.type === 'password' ? 'text' : 'password';
        button.classList.toggle('is-visible', input.type === 'text');
      });
    });
    var fileInput = mask.querySelector('.profile-file-input');
    var pendingAvatar = savedAvatar;
    mask.querySelector('.profile-upload-button').addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
        profileToast('请选择不超过 2 MB 的 JPG 或 PNG 图片', true);
        fileInput.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        pendingAvatar = String(reader.result || '');
        mask.querySelector('.profile-avatar-preview').innerHTML = '<img src="' + pendingAvatar + '" alt="新头像预览">';
      };
      reader.readAsDataURL(file);
    });
    mask.querySelector('.profile-save').addEventListener('click', function () {
      var current = mask.querySelector('[data-profile-field="current"]').value;
      var next = mask.querySelector('[data-profile-field="next"]').value;
      var confirm = mask.querySelector('[data-profile-field="confirm"]').value;
      var error = mask.querySelector('.profile-form-error');
      error.textContent = '';
      mask.querySelectorAll('.profile-password input').forEach(function (input) { input.classList.remove('is-error'); });
      if (current || next || confirm) {
        if (!current) { error.textContent = '请输入当前密码'; mask.querySelector('[data-profile-field="current"]').classList.add('is-error'); return; }
        if (next.length < 6 || next.length > 20) { error.textContent = '新密码长度应为 6–20 位'; mask.querySelector('[data-profile-field="next"]').classList.add('is-error'); return; }
        if (next !== confirm) { error.textContent = '两次输入的新密码不一致'; mask.querySelector('[data-profile-field="confirm"]').classList.add('is-error'); return; }
      }
      try { if (pendingAvatar) window.localStorage.setItem('middle-platform-user-avatar', pendingAvatar); } catch (storageError) { /* local file fallback */ }
      document.querySelectorAll('.account-avatar').forEach(function (avatar) { avatar.innerHTML = pendingAvatar ? '<img src="' + pendingAvatar + '" alt="Admin 头像">' : '<span>A</span>'; });
      close();
      profileToast('个人设置已保存');
    });
  }

  function openLogoutConfirm() {
    closeAccountMenu();
    var mask = document.createElement('div');
    mask.className = 'logout-mask';
    mask.innerHTML = '<section class="logout-dialog" role="alertdialog" aria-modal="true" aria-label="退出登录"><header><h2>退出登录</h2><button type="button" data-logout="cancel" aria-label="关闭">×</button></header><div class="logout-dialog__body"><span class="logout-warning">!</span><div><strong>确定退出当前账号吗？</strong><p>退出后需要重新登录才能继续访问供应链中台。</p></div></div><footer><button class="profile-button" type="button" data-logout="cancel">取消</button><button class="profile-button logout-confirm" type="button" data-logout="confirm">退出登录</button></footer></section>';
    document.body.appendChild(mask);
    mask.querySelectorAll('[data-logout="cancel"]').forEach(function (button) { button.addEventListener('click', function () { mask.remove(); }); });
    mask.addEventListener('click', function (event) { if (event.target === mask) mask.remove(); });
    mask.querySelector('[data-logout="confirm"]').addEventListener('click', function () { mask.remove(); profileToast('已退出登录（原型演示）'); });
  }

  function mountAccountMenu() {
    var container = document.querySelector('.global-right') || document.querySelector('.header-user');
    if (!container || container.querySelector('.account-trigger')) return;
    var admin = container.querySelector('.admin');
    if (!admin) return;
    var savedAvatar = '';
    try { savedAvatar = window.localStorage.getItem('middle-platform-user-avatar') || ''; } catch (error) { /* local file fallback */ }
    var wrap = document.createElement('div');
    wrap.className = 'account-control';
    wrap.innerHTML = '<button class="account-trigger" type="button" aria-label="Admin 账号菜单" aria-haspopup="menu" aria-expanded="false"><span class="account-avatar">' + (savedAvatar ? '<img src="' + savedAvatar + '" alt="Admin 头像">' : '<span>A</span>') + '</span><span class="account-name">Admin</span><span class="account-chevron">⌄</span></button><div class="account-menu" role="menu" hidden><button type="button" role="menuitem" data-account-action="profile">个人设置</button><button type="button" role="menuitem" data-account-action="logout">退出登录</button></div>';
    admin.replaceWith(wrap);
    var trigger = wrap.querySelector('.account-trigger');
    var menu = wrap.querySelector('.account-menu');
    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = menu.hidden;
      closeAccountMenu();
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
    });
    wrap.querySelector('[data-account-action="profile"]').addEventListener('click', openProfileDrawer);
    wrap.querySelector('[data-account-action="logout"]').addEventListener('click', openLogoutConfirm);
    document.addEventListener('click', function (event) { if (!event.target.closest('.account-control')) closeAccountMenu(); });
  }

  var worldClockSites = [
    { region: '美洲', name: '美国东部', zone: 'America/New_York', currency: 'USD' },
    { region: '美洲', name: '美国中部', zone: 'America/Chicago', currency: 'USD' },
    { region: '美洲', name: '美国山地', zone: 'America/Denver', currency: 'USD' },
    { region: '美洲', name: '美国西部', zone: 'America/Los_Angeles', currency: 'USD' },
    { region: '美洲', name: '加拿大东部', zone: 'America/Toronto', currency: 'CAD' },
    { region: '美洲', name: '加拿大西部', zone: 'America/Vancouver', currency: 'CAD' },
    { region: '美洲', name: '墨西哥', zone: 'America/Mexico_City', currency: 'MXN' },
    { region: '美洲', name: '哥伦比亚', zone: 'America/Bogota', currency: 'COP' },
    { region: '美洲', name: '智利', zone: 'America/Santiago', currency: 'CLP' },
    { region: '美洲', name: '巴西', zone: 'America/Sao_Paulo', currency: 'BRL' },
    { region: '欧洲', name: '英国', zone: 'Europe/London', currency: 'GBP' },
    { region: '欧洲', name: '法国', zone: 'Europe/Paris', currency: 'EUR' },
    { region: '欧洲', name: '德国', zone: 'Europe/Berlin', currency: 'EUR' },
    { region: '欧洲', name: '西班牙', zone: 'Europe/Madrid', currency: 'EUR' },
    { region: '欧洲', name: '意大利', zone: 'Europe/Rome', currency: 'EUR' },
    { region: '欧洲', name: '荷兰', zone: 'Europe/Amsterdam', currency: 'EUR' },
    { region: '欧洲', name: '波兰', zone: 'Europe/Warsaw', currency: 'PLN' },
    { region: '欧洲', name: '俄罗斯', zone: 'Europe/Moscow', currency: 'RUB' },
    { region: '亚洲', name: '中国', zone: 'Asia/Shanghai', current: true, currency: 'CNY' },
    { region: '亚洲', name: '日本', zone: 'Asia/Tokyo', currency: 'JPY' },
    { region: '亚洲', name: '韩国', zone: 'Asia/Seoul', currency: 'KRW' },
    { region: '亚洲', name: '新加坡', zone: 'Asia/Singapore', currency: 'SGD' },
    { region: '亚洲', name: '马来西亚', zone: 'Asia/Kuala_Lumpur', currency: 'MYR' },
    { region: '亚洲', name: '泰国', zone: 'Asia/Bangkok', currency: 'THB' },
    { region: '亚洲', name: '越南', zone: 'Asia/Ho_Chi_Minh', currency: 'VND' },
    { region: '亚洲', name: '印度尼西亚', zone: 'Asia/Jakarta', currency: 'IDR' },
    { region: '亚洲', name: '印度', zone: 'Asia/Kolkata', currency: 'INR' },
    { region: '中东', name: '阿联酋', zone: 'Asia/Dubai', currency: 'AED' },
    { region: '大洋洲', name: '澳大利亚东部', zone: 'Australia/Sydney', currency: 'AUD' },
    { region: '大洋洲', name: '新西兰', zone: 'Pacific/Auckland', currency: 'NZD' }
  ];

  function worldClockDateKey(date, zone) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    var values = {};
    parts.forEach(function (part) { if (part.type !== 'literal') values[part.type] = part.value; });
    return values.year + '-' + values.month + '-' + values.day;
  }

  function worldClockDayHint(date, zone) {
    var siteKey = worldClockDateKey(date, 'Asia/Shanghai');
    var localKey = worldClockDateKey(date, zone);
    if (localKey < siteKey) return '昨天';
    if (localKey > siteKey) return '明天';
    return '今天';
  }

  var worldClockRateKey = 'middle-platform-world-clock-rates-v1';
  var worldClockRateApi = 'https://open.er-api.com/v6/latest/CNY';
  // 离线兜底：公开中间价参考值（1 元人民币可兑换的外币数量），仅在接口不可用时使用
  var worldClockFallbackRates = { USD: 0.14919, CAD: 0.211466, MXN: 2.745744, COP: 474.841112, CLP: 146.569294, BRL: 0.761905, GBP: 0.112054, EUR: 0.132828, PLN: 0.579979, RUB: 12.515645, JPY: 23.58408, KRW: 200.280393, SGD: 0.190806, MYR: 0.607903, THB: 4.98785, VND: 3861.003861, IDR: 2680.965147, INR: 14.204949, AED: 0.547896, AUD: 0.215138, NZD: 0.26529 };
  var worldClockRates = { at: '', date: '', live: false, rates: null, status: 'idle' };

  function worldClockTodayKey() { return worldClockDateKey(new Date(), 'Asia/Shanghai'); }

  function readWorldClockRates() {
    try { return JSON.parse(window.localStorage.getItem(worldClockRateKey)) || null; } catch (error) { return null; }
  }

  function saveWorldClockRates(payload) {
    try { window.localStorage.setItem(worldClockRateKey, JSON.stringify(payload)); } catch (error) { /* prototype fallback */ }
  }

  function pickWorldClockRates(source) {
    var picked = {};
    worldClockSites.forEach(function (site) { if (source && source[site.currency] != null) picked[site.currency] = source[site.currency]; });
    return picked;
  }

  function worldClockRateText(code) {
    if (code === 'CNY') return '人民币基准';
    var perCny = worldClockRates.rates && worldClockRates.rates[code];
    if (!perCny || !isFinite(perCny) || perCny <= 0) return '';
    var unit = 1;
    var value = 1 / perCny;
    if (value < 0.001) unit = 1000;
    else if (value < 0.1) unit = 100;
    return (unit === 1 ? code : unit + ' ' + code) + ' ' + (value * unit).toFixed(4);
  }

  function renderWorldClockRates() {
    var wrap = document.querySelector('.world-clock-control');
    if (!wrap) return;
    wrap.querySelectorAll('[data-world-currency]').forEach(function (row) {
      var node = row.querySelector('.world-clock-rate');
      if (!node) return;
      var text = worldClockRateText(row.dataset.worldCurrency);
      var loading = worldClockRates.status === 'loading';
      if (!text) {
        if (loading) text = '汇率加载中…';
        else if (worldClockRates.status === 'error') text = '汇率暂不可用';
      }
      node.textContent = text;
      node.classList.toggle('is-muted', !text || loading);
    });
    var meta = wrap.querySelector('.world-clock-rate-meta');
    if (!meta) return;
    if (worldClockRates.status === 'loading') meta.textContent = '汇率加载中…';
    else if (worldClockRates.status === 'error') meta.textContent = '汇率获取失败，以上为离线参考值 · 点击重试';
    else if (worldClockRates.status === 'ok') meta.textContent = '当日汇率 ' + worldClockRates.at + ' 更新' + (worldClockRates.live ? '' : '（离线参考值）');
    meta.classList.toggle('is-stale', !worldClockRates.live && worldClockRates.status !== 'idle');
  }

  function useWorldClockFallbackRates() {
    worldClockRates = { at: '', date: '', live: false, rates: worldClockFallbackRates, status: 'error' };
    renderWorldClockRates();
  }

  function loadWorldClockRates(force) {
    if (!document.querySelector('.world-clock-control')) return;
    var today = worldClockTodayKey();
    var cached = readWorldClockRates();
    if (!force && cached && cached.date === today && cached.rates) {
      worldClockRates = { at: cached.at || '', date: today, live: cached.live !== false, rates: cached.rates, status: 'ok' };
      renderWorldClockRates();
      return;
    }
    worldClockRates = { at: worldClockRates.at, date: today, live: worldClockRates.live, rates: worldClockRates.rates, status: 'loading' };
    renderWorldClockRates();
    if (typeof window.fetch !== 'function') { useWorldClockFallbackRates(); return; }
    window.fetch(worldClockRateApi).then(function (response) {
      if (!response.ok) throw new Error('http ' + response.status);
      return response.json();
    }).then(function (data) {
      if (!data || !data.rates) throw new Error('empty payload');
      var at = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(data.time_last_update_utc || Date.now())).replace(/\//g, '-');
      worldClockRates = { at: at, date: today, live: true, rates: pickWorldClockRates(data.rates), status: 'ok' };
      saveWorldClockRates({ at: at, date: today, live: true, rates: worldClockRates.rates });
      renderWorldClockRates();
    }).catch(function () { useWorldClockFallbackRates(); });
  }

  function updateWorldClock(wrap) {
    if (!wrap || !document.documentElement.contains(wrap)) return;
    var now = new Date();
    var timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    var current = wrap.querySelector('.world-clock-current-time');
    if (current) {
      var currentDate = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', weekday: 'short'
      }).format(now).replace(/\//g, '-');
      var currentTime = new Intl.DateTimeFormat('zh-CN', Object.assign({ timeZone: 'Asia/Shanghai' }, timeOptions)).format(now);
      current.textContent = currentDate + '  ' + currentTime;
    }
    wrap.querySelectorAll('[data-world-zone]').forEach(function (row) {
      var zone = row.dataset.worldZone;
      row.querySelector('.world-clock-row-time').textContent = new Intl.DateTimeFormat('zh-CN', Object.assign({ timeZone: zone }, timeOptions)).format(now);
      row.querySelector('.world-clock-day').textContent = worldClockDayHint(now, zone);
    });
  }

  function closeWorldClock() {
    var wrap = document.querySelector('.world-clock-control');
    if (!wrap) return;
    var popover = wrap.querySelector('.world-clock-popover');
    var trigger = wrap.querySelector('.world-clock-trigger');
    if (popover) popover.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function mountWorldClock() {
    var container = document.querySelector('.global-right') || document.querySelector('.header-user');
    if (!container || container.querySelector('.world-clock-control')) return;
    var wrap = document.createElement('div');
    wrap.className = 'world-clock-control';
    var rows = '';
    var lastRegion = '';
    worldClockSites.forEach(function (site) {
      if (site.region !== lastRegion) {
        rows += '<div class="world-clock-region">' + site.region + '</div>';
        lastRegion = site.region;
      }
      rows += '<div class="world-clock-row' + (site.current ? ' is-current' : '') + '" data-world-zone="' + site.zone + '" data-world-currency="' + site.currency + '"><span class="world-clock-dot" aria-hidden="true"></span><span class="world-clock-cell"><span class="world-clock-name">' + site.name + '</span><em class="world-clock-rate"></em></span><span class="world-clock-day"></span><strong class="world-clock-row-time">--:--:--</strong></div>';
    });
    wrap.innerHTML = '<button class="world-clock-trigger" type="button" aria-label="世界时间" aria-haspopup="dialog" aria-expanded="false" title="世界时间"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg></button><section class="world-clock-popover" role="dialog" aria-label="世界时间" hidden><header><span>当前站点时间（中国）</span><strong class="world-clock-current-time">--</strong><small>时间自动更新，并根据所在地处理夏令时</small><small class="world-clock-rate-meta" title="点击刷新当日汇率">打开后自动获取当日汇率</small></header><div class="world-clock-list">' + rows + '</div></section>';
    var todo = container.querySelector('.tdc-entry');
    var exportEntry = container.querySelector('.gx-entry');
    var account = container.querySelector('.account-control, .admin');
    container.insertBefore(wrap, todo || exportEntry || account || null);
    var trigger = wrap.querySelector('.world-clock-trigger');
    var popover = wrap.querySelector('.world-clock-popover');
    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      var shouldOpen = popover.hidden;
      closeAccountMenu();
      closeWorldClock();
      popover.hidden = !shouldOpen;
      trigger.setAttribute('aria-expanded', String(shouldOpen));
      if (shouldOpen) { updateWorldClock(wrap); loadWorldClockRates(false); }
    });
    popover.addEventListener('click', function (event) { event.stopPropagation(); });
    var rateMeta = wrap.querySelector('.world-clock-rate-meta');
    if (rateMeta) rateMeta.addEventListener('click', function () { loadWorldClockRates(true); });
    document.addEventListener('click', function (event) { if (!event.target.closest('.world-clock-control')) closeWorldClock(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeWorldClock(); });
    updateWorldClock(wrap);
    window.setInterval(function () { updateWorldClock(wrap); }, 1000);
  }

  function normalizeGlobalActionOrder() {
    var container = document.querySelector('.global-right') || document.querySelector('.header-user');
    if (!container) return;
    var worldClock = container.querySelector('.world-clock-control');
    var todo = container.querySelector('.tdc-entry');
    var exportEntry = container.querySelector('.gx-entry');
    var account = container.querySelector('.account-control, .admin');
    var desired = [worldClock, todo, exportEntry, account].filter(Boolean);
    var current = Array.prototype.slice.call(container.children).filter(function (node) { return desired.indexOf(node) >= 0; });
    if (current.length === desired.length && current.every(function (node, index) { return node === desired[index]; })) return;
    desired.forEach(function (node) { container.appendChild(node); });
  }

  function ensureGlobalExportCenter() {
    if (window.GlobalExportWorkbench || document.querySelector('script[data-global-export-loader]')) {
      normalizeGlobalActionOrder();
      return;
    }
    var script = document.createElement('script');
    script.src = '../../global-export.js?v=1.7.37';
    script.async = false;
    script.dataset.globalExportLoader = 'true';
    script.addEventListener('load', normalizeGlobalActionOrder);
    document.body.appendChild(script);
  }

  function mountSidebarCollapse() {
    var sidebar = document.querySelector('.sidebar, .workbench-sidebar, .supplier-sidebar, .side-nav, .product-sidebar');
    if (!sidebar) return;
    var button = sidebar.querySelector('.collapse, .side-footer, .nav-collapse-button');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      sidebar.appendChild(button);
    }
    button.classList.add('nav-collapse-button');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-label', '收起或展开导航');
    button.innerHTML = '<span aria-hidden="true">≡</span>';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setCollapsed(!document.documentElement.classList.contains('nav-collapsed'));
    });
    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') button.click();
    });

    mountThemeSwitcher(sidebar);
    mountTransferNav();
    mountInventoryAdjustmentNav();
    mountPickupOrderNav();
    mountInventoryFlowNav();
    mountBatchInventoryNav();
    mountSupplierNav();
    mountHistoricalPurchasePriceNav();
    mountFbaShipmentNav();
    renameWarehouseNavigation();

    var collapsed = false;
    try { collapsed = window.localStorage.getItem('middle-platform-nav-collapsed') === '1'; } catch (error) { /* local file fallback */ }
    setCollapsed(collapsed);

    var selector = '.nav-group-title, .nav-section-title, .supplier-nav-title, .supplier-nav-section, .side-nav > .nav-section, .workbench-nav-title, .product-sidebar > .nav-section';
    document.querySelectorAll(selector).forEach(function (title) {
      title.addEventListener('click', function (event) {
        if (!document.documentElement.classList.contains('nav-collapsed')) return;
        var items = getSubmenuItems(title);
        if (!items.length) return;
        event.preventDefault();
        event.stopPropagation();
        if (title.classList.contains('nav-flyout-open')) closeFlyout();
        else openFlyout(title, items);
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.nav-flyout, .nav-flyout-open')) closeFlyout();
      if (!event.target.closest('.nav-theme-popover, .nav-theme-button')) closeThemePopover();
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { closeFlyout(); closeThemePopover(); } });
    window.addEventListener('resize', function () { closeFlyout(); closeThemePopover(); });
  }

  function selectModule(buttons, selectedIndex) {
    buttons.forEach(function (button, index) {
      var selected = index === selectedIndex;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function navigateToPage(page) {
    if (!pageRoutes[page]) return;
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'prototype:navigate', page: page }, '*');
      return;
    }
    window.location.href = pageRoutes[page];
  }

  function mountPageNavigation() {
    if (document.documentElement.dataset.pageNavBound === '1') return;
    document.documentElement.dataset.pageNavBound = '1';
    document.addEventListener('click', function (event) {
      var item = event.target.closest('[data-page-nav]');
      if (!item || !pageRoutes[item.dataset.pageNav]) return;

      var request = new CustomEvent('prototype:page-nav', {
        cancelable: true,
        detail: { page: item.dataset.pageNav, source: item }
      });
      document.dispatchEvent(request);
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!request.defaultPrevented) navigateToPage(item.dataset.pageNav);
    }, true);
  }

  function navigate(module) {
    if (!module.page) return;
    navigateToPage(module.page);
  }

  function mountBasicModuleButton() {
    var workbench = Array.prototype.slice.call(document.querySelectorAll('.global-left .top-icon')).find(function (button) {
      return (button.textContent || '').trim() === '工作台';
    });
    if (!workbench || workbench.parentElement.querySelector('[data-module="basic"]')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'top-icon';
    button.setAttribute('data-module', 'basic');
    button.setAttribute('aria-label', '基础');
    button.textContent = '基础';
    workbench.insertAdjacentElement('afterend', button);
  }

  function mountTopNavigation() {
    applyTheme(getTheme());
    document.querySelectorAll('.global-left .top-icon').forEach(function (button) {
      if ((button.textContent || '').trim() === '企业工单') button.remove();
    });
    mountBasicModuleButton();
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.global-left .top-icon'));
    if (!buttons.length) return;

    mountSidebarCollapse();
    mountMenuIcons(buttons);
    mountPageNavigation();
    mountAccountMenu();
    mountWorldClock();
    ensureGlobalExportCenter();
    normalizeGlobalActionOrder();
    var actionContainer = document.querySelector('.global-right') || document.querySelector('.header-user');
    if (actionContainer && !actionContainer.dataset.globalOrderObserved) {
      actionContainer.dataset.globalOrderObserved = '1';
      new MutationObserver(normalizeGlobalActionOrder).observe(actionContainer, { childList: true });
    }

    buttons.slice(0, modules.length).forEach(function (button, index) {
      button.type = 'button';
      button.setAttribute('aria-label', modules[index].label);
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    if (location.hash === '#basic') selectModule(buttons, 1);

    document.addEventListener('click', function (event) {
      var button = event.target.closest('.global-left .top-icon');
      if (!button) return;
      var index = buttons.indexOf(button);
      if (index < 0 || index >= modules.length) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      selectModule(buttons, index);
      document.dispatchEvent(new CustomEvent('prototype:module-change', {
        detail: { index: index, label: modules[index].label, page: modules[index].page || null }
      }));
      navigate(modules[index]);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountTopNavigation);
  } else {
    mountTopNavigation();
  }
})();

/* Global todo center: shared by every business page through navigation.js. */
(function () {
  'use strict';

  var STORAGE_KEY = 'middle-platform-todo-center-v1';
  var activeTab = 'pending';
  var selectedId = '';
  var filters = { keyword: '', business: '', urgency: '' };

  var seedItems = [
    { id: 'TD20261010001', scope: 'pending', title: '采购单 PO20261010086 待审核', summary: '采购金额 ¥286,420.00，共 18 个 SKU', business: '采购单', taskType: '审核', node: '采购负责人审核', initiator: '林小雨', createdAt: '2026-10-10 09:32', due: '剩余 3 小时', urgency: 'urgent', status: 'pending', feishu: 'pushed', amount: '¥286,420.00', detail: '华东区 10 月备货采购，供应商：苏州锐达电子有限公司。', history: ['林小雨 提交申请  09:32', '系统分配至 Admin  09:32', '已推送飞书卡片  09:33'] },
    { id: 'TD20261010002', scope: 'pending', title: '发货单 SO20261010031 待审核', summary: '海外仓发货，32 箱 / 1,240 件', business: '发货单', taskType: '审核', node: '物流负责人审核', initiator: '周杭', createdAt: '2026-10-10 08:48', due: '剩余 6 小时', urgency: 'normal', status: 'pending', feishu: 'pushed', amount: '32 箱', detail: '由华南中转仓发往波兰华沙仓，计划发货日期 2026-10-12。', history: ['周杭 提交申请  08:48', '系统分配至 Admin  08:48', '已推送飞书卡片  08:49'] },
    { id: 'TD20261009018', scope: 'pending', title: '库存损益单 IA20261009008 待确认', summary: '盘点差异 -126 件，需确认调整', business: '损益单', taskType: '确认', node: '库存负责人确认', initiator: '王倩', createdAt: '2026-10-09 14:16', due: '已超时 2 小时', urgency: 'overdue', status: 'pending', feishu: 'pushed', amount: '-126 件', detail: '深圳龙岗仓月度盘点差异，涉及 6 个 SKU，请核对后确认。', history: ['王倩 提交差异确认  10-09 14:16', '已推送飞书卡片  10-09 14:17', '系统超时提醒  10:00'] },
    { id: 'TD20261010004', scope: 'pending', title: '调拨单 TR20261010012 待审核', summary: '上海仓 → 苏州仓，8 个 SKU', business: '调拨单', taskType: '审核', node: '仓储主管审核', initiator: '陈默', createdAt: '2026-10-10 10:06', due: '剩余 8 小时', urgency: 'normal', status: 'pending', feishu: 'failed', amount: '860 件', detail: '因苏州仓安全库存不足，申请从上海仓调拨。', history: ['陈默 提交申请  10:06', '飞书推送失败，等待重试  10:06'] },
    { id: 'TD20261008011', scope: 'initiated', title: '采购单 PO20261008042', summary: '已进入财务审核节点', business: '采购单', taskType: '审批进度', node: '财务审核', initiator: 'Admin', createdAt: '2026-10-08 16:22', due: '审批中', urgency: 'normal', status: 'processing', feishu: 'pushed', amount: '¥98,600.00', detail: '华南区常规备货采购。', history: ['Admin 提交申请  10-08 16:22', '刘慧 审核通过  10-09 09:18', '等待财务审核'] },
    { id: 'TD20261007009', scope: 'cc', title: '发货单 SO20261007019 已审批通过', summary: '报关资料已齐全，计划 10 月 11 日出库', business: '发货单', taskType: '抄送', node: '审批完成', initiator: '赵雯', createdAt: '2026-10-10 09:14', due: '已通过', urgency: 'normal', status: 'done', feishu: 'pushed', amount: '48 箱', detail: '发货审批已完成，请知悉。', history: ['赵雯 提交申请', '所有审批节点已通过', '抄送给 Admin'] },
    { id: 'MSG20261010007', scope: 'notice', title: '易仓库存同步异常', summary: '3 个 SKU 同步失败，请检查映射关系', business: '库存', taskType: '系统通知', node: '同步异常', initiator: '系统', createdAt: '2026-10-10 10:18', due: '待查看', urgency: 'urgent', status: 'unread', feishu: 'pushed', amount: '3 个 SKU', detail: '易仓返回仓库 SKU 不存在，请检查海外仓 SKU 映射。', history: ['系统检测到同步异常  10:18', '已推送飞书通知  10:18'] },
    { id: 'MSG20261010003', scope: 'notice', title: '导出任务已完成', summary: '库存流水导出文件可下载', business: '系统', taskType: '系统通知', node: '导出完成', initiator: '系统', createdAt: '2026-10-10 09:40', due: '待查看', urgency: 'normal', status: 'unread', feishu: 'none', amount: '12,480 条', detail: '你发起的库存流水导出任务已完成。', history: ['导出任务已完成  09:40'] }
  ];

  function readItems() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedItems; } catch (error) { return seedItems; }
  }
  var items = readItems();
  function saveItems() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (error) { /* prototype fallback */ } }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function isAttention(item) { return (item.scope === 'pending' && item.status === 'pending') || (item.scope === 'notice' && item.status === 'unread' && item.urgency === 'urgent'); }
  function countAttention() { return items.filter(isAttention).length; }
  function visibleItems() { return items.filter(function (item) { return (item.scope === 'pending' && item.status === 'pending') || item.scope === 'notice'; }).filter(function (item) { return !filters.keyword || (item.title + item.summary + item.id + item.initiator).toLowerCase().indexOf(filters.keyword.toLowerCase()) >= 0; }).filter(function (item) { return !filters.business || item.business === filters.business; }).filter(function (item) { return !filters.urgency || item.urgency === filters.urgency; }); }
  function groupedMessages() {
    var groups = [];
    visibleItems().forEach(function (item) {
      var isApproval = item.scope === 'pending';
      var key = isApproval ? 'approval:' + item.business : 'notice:' + item.id;
      var group = groups.find(function (entry) { return entry.key === key; });
      if (!group) { group = { key: key, approval: isApproval, business: item.business, items: [], urgency: item.urgency, unread: item.status === 'unread' }; groups.push(group); }
      group.items.push(item);
      if (item.urgency === 'overdue' || (item.urgency === 'urgent' && group.urgency === 'normal')) group.urgency = item.urgency;
      if (item.status === 'unread') group.unread = true;
    });
    return groups;
  }
  function urgencyText(item) { if (item.urgency === 'overdue') return '<span class="tdc-time is-overdue">' + esc(item.due) + '</span>'; if (item.urgency === 'urgent') return '<span class="tdc-time is-urgent">' + esc(item.due) + '</span>'; return '<span class="tdc-time">' + esc(item.due) + '</span>'; }
  function feishuTag(item) { if (item.feishu === 'pushed') return '<span class="tdc-feishu is-synced"><i>✓</i> 已同步飞书</span>'; if (item.feishu === 'failed') return '<button class="tdc-feishu is-failed" data-todo-action="retry-feishu" data-id="' + item.id + '">推送失败·重试</button>'; return '<span class="tdc-feishu">仅站内</span>'; }

  function mountEntry() {
    if (document.querySelector('.tdc-entry')) return;
    var container = document.querySelector('.global-right') || document.querySelector('.header-user');
    if (!container) return;
    var entry = document.createElement('button');
    entry.type = 'button'; entry.className = 'tdc-entry'; entry.setAttribute('aria-label', '待办中心'); entry.setAttribute('title', '待办中心');
    entry.innerHTML = '<span class="tdc-entry-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5V3h6v2M7 5h10a2 2 0 0 1 2 2v14H5V7a2 2 0 0 1 2-2Z"/><path d="m8 13 2 2 5-5M8 18h8"/></svg></span><sup class="tdc-entry-badge"></sup>';
    var exportEntry = container.querySelector('.gx-entry');
    var account = container.querySelector('.account-control, .admin');
    container.insertBefore(entry, exportEntry || account || null);
    entry.addEventListener('click', openCenter);
    updateBadge();
  }

  function updateBadge() {
    var badge = document.querySelector('.tdc-entry-badge'); if (!badge) return;
    var count = countAttention(); badge.textContent = count > 99 ? '99+' : count; badge.hidden = count === 0;
  }

  function counts() {
    return { pending: items.filter(function (x) { return x.scope === 'pending' && x.status === 'pending'; }).length, initiated: items.filter(function (x) { return x.scope === 'initiated'; }).length, cc: items.filter(function (x) { return x.scope === 'cc'; }).length, notice: items.filter(function (x) { return x.scope === 'notice' && x.status === 'unread'; }).length };
  }

  function renderCenter() {
    var modal = document.querySelector('.tdc-modal'); if (!modal) return;
    var groups = groupedMessages();
    var list = modal.querySelector('.tdc-list');
    list.innerHTML = groups.length ? groups.map(function (group) {
      var first = group.items[0];
      if (group.approval) {
        var orderNumbers = group.items.map(function (item) { var match = item.title.match(/[A-Z]{2,4}\d{8,}/); return match ? match[0] : item.id; });
        return '<article class="tdc-item tdc-message-group"><div class="tdc-item-mark tdc-mark-approval"></div><div class="tdc-item-main"><div class="tdc-item-title"><span class="tdc-message-tag is-approval">审核</span><strong>' + group.items.length + ' 张' + esc(group.business) + '待审核</strong></div><p>' + esc(orderNumbers.slice(0, 3).join('、')) + (orderNumbers.length > 3 ? ' 等' : '') + '</p><div class="tdc-item-meta"><span>共 ' + group.items.length + ' 张单据</span><span>最新：' + esc(first.createdAt) + '</span></div></div><div class="tdc-item-side"><div class="tdc-item-actions"><button class="tdc-btn tdc-btn-primary" data-todo-action="navigate-business" data-business="' + esc(group.business) + '">去审核</button></div></div></article>';
      }
      return '<article class="tdc-item tdc-message-group' + (group.unread ? ' is-unread' : '') + '"><div class="tdc-item-mark tdc-mark-notice"></div><div class="tdc-item-main"><div class="tdc-item-title"><span class="tdc-message-tag is-notice">通知</span><strong>' + esc(first.title) + '</strong>' + (group.unread ? '<i class="tdc-unread-dot"></i>' : '') + '</div><p>' + esc(first.summary) + '</p><div class="tdc-item-meta"><span>' + esc(first.business) + '</span><span>' + esc(first.createdAt) + '</span></div></div><div class="tdc-item-side"><div class="tdc-item-actions"><button class="tdc-btn tdc-btn-link" data-todo-action="read-notice" data-id="' + first.id + '">查看详情</button></div></div></article>';
    }).join('') : '<div class="tdc-empty"><span>✓</span><strong>当前没有符合条件的消息</strong><p>新的审核与业务通知会在这里出现</p></div>';
    modal.querySelector('.tdc-stream-count').textContent = groups.length + ' 条消息';
    modal.querySelector('.tdc-result-count').textContent = '共 ' + groups.length + ' 条消息';
  }

  function mountCenter() {
    if (document.querySelector('.tdc-mask')) return;
    var mask = document.createElement('div'); mask.className = 'tdc-mask';
    mask.innerHTML = '<section class="tdc-modal" role="dialog" aria-modal="true" aria-label="待办中心"><header class="tdc-head"><div><h2>待办中心</h2><p>审核与业务消息按单据类型聚合展示</p></div><div class="tdc-head-tools"><span class="tdc-sync"><i></i>飞书已连接</span><button class="tdc-close" aria-label="关闭">×</button></div></header><main class="tdc-body"><div class="tdc-stream-head"><div><strong>全部消息</strong><span class="tdc-stream-count"></span></div><button class="tdc-mark-all" data-todo-action="read-all">全部标为已读</button></div><section class="tdc-list"></section><footer class="tdc-foot"><span class="tdc-result-count"></span><span>相同单据类型的审核消息已自动合并</span></footer></main></section>';
    document.body.appendChild(mask);
    mask.addEventListener('click', handleClick);
  }

  function openCenter() { mountCenter(); document.querySelector('.tdc-mask').classList.add('is-visible'); renderCenter(); }
  function closeCenter() { var mask = document.querySelector('.tdc-mask'); if (mask) mask.classList.remove('is-visible'); closeDrawer(); }
  function closeDrawer() { var drawer = document.querySelector('.tdc-drawer'); if (drawer) drawer.classList.remove('is-visible'); selectedId = ''; }
  function toast(message, error) { var node = document.querySelector('.tdc-toast'); if (!node) { node = document.createElement('div'); node.className = 'tdc-toast'; document.body.appendChild(node); } node.textContent = message; node.className = 'tdc-toast is-visible' + (error ? ' is-error' : ''); clearTimeout(toast.timer); toast.timer = setTimeout(function () { node.className = 'tdc-toast'; }, 2200); }

  function openDrawer(id, focusAction) {
    var item = items.find(function (x) { return x.id === id; }); if (!item) return;
    selectedId = id;
    if (item.status === 'unread') { item.status = 'read'; saveItems(); updateBadge(); renderCenter(); }
    var drawer = document.querySelector('.tdc-drawer');
    drawer.innerHTML = '<header><div><span class="tdc-business">' + esc(item.business) + '</span><h3>' + esc(item.title) + '</h3><p>' + esc(item.id) + '</p></div><button class="tdc-drawer-close" aria-label="关闭">×</button></header><div class="tdc-drawer-body"><section class="tdc-summary"><div><span>关键数据</span><strong>' + esc(item.amount) + '</strong></div><div><span>当前节点</span><strong>' + esc(item.node) + '</strong></div><div><span>发起人</span><strong>' + esc(item.initiator) + '</strong></div><div><span>发起时间</span><strong>' + esc(item.createdAt) + '</strong></div></section><section class="tdc-detail-section"><h4>申请说明</h4><p>' + esc(item.detail) + '</p></section><section class="tdc-detail-section"><h4>审批进度</h4><div class="tdc-timeline">' + item.history.map(function (h, i) { return '<div class="' + (i === item.history.length - 1 ? 'current' : '') + '"><i></i><span>' + esc(h) + '</span></div>'; }).join('') + '</div></section><section class="tdc-detail-section"><h4>飞书同步</h4><div class="tdc-feishu-card"><span class="tdc-feishu-logo">飞</span><div><strong>' + (item.feishu === 'pushed' ? '已推送待办卡片' : item.feishu === 'failed' ? '飞书推送失败' : '未推送至飞书') + '</strong><p>任一端处理后，状态将自动同步</p></div>' + (item.feishu === 'failed' ? '<button class="tdc-btn" data-todo-action="retry-feishu" data-id="' + item.id + '">重新推送</button>' : '') + '</div></section>' + (item.scope === 'pending' && item.status === 'pending' ? '<section class="tdc-opinion"><label>审批意见</label><textarea placeholder="请输入处理意见（驳回时必填）"></textarea></section>' : '') + '</div><footer>' + (item.scope === 'pending' && item.status === 'pending' ? '<button class="tdc-btn tdc-btn-danger" data-todo-action="reject" data-id="' + item.id + '">驳回</button><button class="tdc-btn" data-todo-action="transfer" data-id="' + item.id + '">转交</button><span></span><button class="tdc-btn" data-todo-action="origin" data-id="' + item.id + '">查看原单据</button><button class="tdc-btn tdc-btn-primary" data-todo-action="approve-confirm" data-id="' + item.id + '">通过</button>' : '<span></span><button class="tdc-btn tdc-btn-primary" data-todo-action="origin" data-id="' + item.id + '">查看原单据</button>') + '</footer>';
    drawer.classList.add('is-visible');
    if (focusAction) setTimeout(function () { var textarea = drawer.querySelector('textarea'); if (textarea) textarea.focus(); }, 120);
  }

  function decide(id, result) {
    var item = items.find(function (x) { return x.id === id; }); if (!item) return;
    var textarea = document.querySelector('.tdc-drawer textarea');
    if (result === 'rejected' && textarea && !textarea.value.trim()) { textarea.classList.add('is-error'); textarea.placeholder = '驳回时请填写原因'; textarea.focus(); return; }
    item.status = result; item.scope = 'cc'; item.due = result === 'approved' ? '已通过' : '已驳回'; item.history.push('Admin ' + (result === 'approved' ? '审核通过' : '驳回申请') + '  刚刚', '处理结果已同步至飞书  刚刚');
    saveItems(); updateBadge(); closeDrawer(); renderCenter(); toast(result === 'approved' ? '审核已通过，飞书状态已同步' : '已驳回并通知发起人');
  }

  function handleClick(event) {
    if (event.target.classList.contains('tdc-mask') || event.target.closest('.tdc-close')) { closeCenter(); return; }
    if (event.target.closest('.tdc-drawer-close')) { closeDrawer(); return; }
    var actionNode = event.target.closest('[data-todo-action]');
    if (actionNode) {
      event.stopPropagation(); var action = actionNode.dataset.todoAction; var id = actionNode.dataset.id;
      if (action === 'read-notice') { var notice = items.find(function (x) { return x.id === id; }); if (notice) { notice.status = 'read'; saveItems(); updateBadge(); renderCenter(); toast('消息已标为已读'); } }
      if (action === 'approve-confirm') decide(id, 'approved');
      if (action === 'reject') decide(id, 'rejected');
      if (action === 'search') { var modal2 = document.querySelector('.tdc-modal'); filters.keyword = modal2.querySelector('.tdc-search input').value.trim(); filters.business = modal2.querySelector('.tdc-business-filter').value; filters.urgency = modal2.querySelector('.tdc-urgency-filter').value; renderCenter(); }
      if (action === 'reset') { filters = { keyword: '', business: '', urgency: '' }; var m = document.querySelector('.tdc-modal'); m.querySelector('.tdc-search input').value = ''; m.querySelector('.tdc-business-filter').value = ''; m.querySelector('.tdc-urgency-filter').value = ''; renderCenter(); }
      if (action === 'read-all') { items.forEach(function (x) { if (x.scope === 'notice') x.status = 'read'; }); saveItems(); updateBadge(); renderCenter(); toast('消息已全部标为已读'); }
      if (action === 'navigate-business') {
        var routeMap = { '采购单': 'purchaseOrder', '发货单': 'shipmentOrder', '调拨单': 'transferOrder', '损益单': 'inventoryAdjustment' };
        var page = routeMap[actionNode.dataset.business];
        if (page) { closeCenter(); if (window.parent !== window) window.parent.postMessage({ type: 'prototype:navigate', page: page }, '*'); else toast('正在进入' + actionNode.dataset.business + '审核页'); }
      }
      if (action === 'retry-feishu') { var item = items.find(function (x) { return x.id === id; }); if (item) { item.feishu = 'pushed'; item.history.push('飞书卡片重试成功  刚刚'); saveItems(); renderCenter(); if (selectedId === id) openDrawer(id); toast('飞书待办卡片已重新推送'); } }
      if (action === 'transfer') toast('已打开转交人选择（原型演示）');
      if (action === 'origin') toast('正在进入原单据审核页');
      return;
    }
  }

  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { if (selectedId) closeDrawer(); else closeCenter(); } });
  window.GlobalTodoCenter = { open: openCenter, getItems: function () { return items.slice(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(mountEntry, 0); }); else setTimeout(mountEntry, 0);
})();
