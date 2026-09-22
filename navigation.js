(function () {
  'use strict';

  var modules = [
    { label: '工作台', icon: 'dashboard', page: 'workbench', path: '../workbench/index.html' },
    { label: '财务中台', icon: 'finance' },
    { label: '供应链中台', icon: 'supplyChain', page: 'inventoryQuery', path: '../inventory-query/index.html' },
    { label: '运营中台', icon: 'operations' },
    { label: '产品资料', icon: 'product' }
  ];

  var icons = {
    dashboard: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>',
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
    { label: '库存管理', icon: 'inventory' },
    { label: '计划管理', icon: 'plan' },
    { label: '供应链协同', icon: 'collaboration' },
    { label: '账号管理', icon: 'account' },
    { label: '业务组织', icon: 'organization' },
    { label: '公司组织', icon: 'company' },
    { label: '素材管理', icon: 'assets' },
    { label: '系统日志', icon: 'log' },
    { label: '工作台', icon: 'dashboard' }
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

    var selector = '.nav-group-title, .nav-section-title, .supplier-nav-title, .supplier-nav-section, .side-nav > .nav-section, .workbench-nav-title, .nav-item.standalone';
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

  function mountSidebarCollapse() {
    var sidebar = document.querySelector('.sidebar, .workbench-sidebar, .supplier-sidebar, .side-nav');
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

    var collapsed = false;
    try { collapsed = window.localStorage.getItem('middle-platform-nav-collapsed') === '1'; } catch (error) { /* local file fallback */ }
    setCollapsed(collapsed);

    var selector = '.nav-group-title, .nav-section-title, .supplier-nav-title, .supplier-nav-section, .side-nav > .nav-section, .workbench-nav-title';
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

  function navigate(module) {
    if (!module.page) return;
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'prototype:navigate', page: module.page }, '*');
      return;
    }
    window.location.href = module.path;
  }

  function mountTopNavigation() {
    applyTheme(getTheme());
    document.querySelectorAll('.global-left .top-icon').forEach(function (button) {
      if ((button.textContent || '').trim() === '企业工单') button.remove();
    });
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.global-left .top-icon'));
    if (!buttons.length) return;

    mountMenuIcons(buttons);
    mountSidebarCollapse();

    buttons.slice(0, modules.length).forEach(function (button, index) {
      button.type = 'button';
      button.setAttribute('aria-label', modules[index].label);
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

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
