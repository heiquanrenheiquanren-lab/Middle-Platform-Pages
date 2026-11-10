(function (global) {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function closeMask(mask, returnFocus) {
    if (!mask) return;
    mask.remove();
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }

  function importConfig(options) {
    return Object.assign({
      title: '导入数据',
      guideTitle: '第一步：使用标准模板整理数据',
      guideText: '请勿修改模板表头。支持 .xlsx、.xls、.csv 文件，单次仅导入一个文件。',
      idleText: '尚未选择文件',
      subtitle: '',
      intro: '',
      accepted: '.xlsx,.xls,.csv',
      downloadLabel: '下载模板',
      parsePreview: null,
      onDownload: function () {},
      onConfirm: function () {}
    }, options || {});
  }

  /** Shared transfer-order import flow. It can mount inside an existing dialog. */
  function createImportFlow(options) {
    var config = importConfig(options);
    var selectedFile = null;
    var previewData = null;
    var previewError = '';
    var parsing = false;
    var parseToken = 0;

    function mount(body, footer, handlers) {
      var actions = Object.assign({ onClose: function () {} }, handlers || {});

      function previewHtml(hasFile) {
        if (!hasFile || !config.parsePreview) return '';
        if (parsing) return '<div class="ui-import__preview"><span class="ui-import__preview-meta">正在校验文件…</span></div>';
        if (previewError) return '<div class="ui-import__preview"><span class="ui-import__preview-errors">' + escapeHtml(previewError) + '</span></div>';
        if (!previewData) return '';
        var cols = previewData.columns || [];
        var rows = (previewData.rows || []).slice(0, 5);
        var errors = previewData.errors || [];
        return '<div class="ui-import__preview">'
          + '<div class="ui-import__preview-head"><div class="ui-import__card-title"><span class="ui-import__bar"></span>数据预览</div><span class="ui-import__preview-meta">共 ' + previewData.total + ' 行' + (errors.length ? '，' + errors.length + ' 行需修正' : '，校验通过') + '</span></div>'
          + '<div class="ui-import__preview-scroll"><table class="ui-import__preview-table"><thead><tr>' + cols.map(function (col) { return '<th>' + escapeHtml(col) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (row) { return '<tr>' + row.map(function (cell) { return '<td>' + escapeHtml(cell) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'
          + (previewData.total > rows.length ? '<div class="ui-import__preview-more">仅预览前 ' + rows.length + ' 行</div>' : '')
          + (errors.length ? '<div class="ui-import__preview-errors">' + errors.slice(0, 3).map(function (item) { return escapeHtml(item); }).join('；') + (errors.length > 3 ? ' 等' : '') + '</div>' : '')
          + '</div>';
      }

      function canConfirm(hasFile) {
        if (!hasFile || parsing) return false;
        if (!config.parsePreview) return true;
        return Boolean(previewData) && !previewError && !(previewData.errors || []).length;
      }

      function render() {
      var hasFile = Boolean(selectedFile);
      body.innerHTML = ''
        + (config.intro ? '<div class="ui-import__intro">' + escapeHtml(config.intro) + '</div>' : '')
        + '<div class="ui-import__steps"><div class="ui-import__step is-active"><span class="ui-import__step-number">1</span><span>下载模板</span></div><i class="ui-import__line"></i><div class="ui-import__step' + (hasFile ? ' is-active' : '') + '"><span class="ui-import__step-number">2</span><span>选择文件</span></div><i class="ui-import__line"></i><div class="ui-import__step' + (canConfirm(hasFile) ? ' is-active' : '') + '"><span class="ui-import__step-number">3</span><span>确认导入</span></div></div>'
        + '<div class="ui-import__guide"><strong>' + escapeHtml(config.guideTitle) + '</strong><p>' + escapeHtml(config.guideText) + '</p><button class="ui-button" data-ui-download type="button">' + escapeHtml(config.downloadLabel) + '</button></div>'
        + '<div class="ui-import__upload" data-ui-drop-zone><input data-ui-file type="file" accept="' + escapeHtml(config.accepted) + '" hidden><span class="ui-import__upload-icon">↥</span><span>将 Excel 文件拖到此处，或 <b class="ui-import__link" data-ui-choose>点击选择文件</b></span></div>'
        + '<p class="ui-import__tip">选择文件后点击「确认导入」，系统将自动校验文件，校验不通过会提示具体原因。</p>'
        + (hasFile && !config.parsePreview ? '<div class="ui-import__preview">已选择文件：' + escapeHtml(selectedFile.name) + '</div>' : '')
        + previewHtml(hasFile);
      var stateText = hasFile ? ('当前文件：' + escapeHtml(selectedFile.name) + (previewData && !parsing ? ' · 共 ' + previewData.total + ' 行' : '')) : escapeHtml(config.idleText);
      footer.innerHTML = '<span class="ui-import__summary">' + stateText + '</span><div><button class="ui-button" type="button" data-ui-close>取消</button><button class="ui-button ui-button--primary" type="button" data-ui-confirm ' + (canConfirm(hasFile) ? '' : 'disabled') + '>确认导入</button></div>';

      var fileInput = body.querySelector('[data-ui-file]');
      var dropZone = body.querySelector('[data-ui-drop-zone]');
      function choose(file) {
        if (!file) return;
        selectedFile = file;
        previewData = null;
        previewError = '';
        parsing = Boolean(config.parsePreview);
        parseToken += 1;
        var token = parseToken;
        render();
        if (!config.parsePreview) return;
        Promise.resolve().then(function () { return config.parsePreview(file); }).then(function (data) {
          if (token !== parseToken) return;
          parsing = false;
          previewData = data || { columns: [], rows: [], total: 0, errors: [] };
          render();
        }).catch(function (error) {
          if (token !== parseToken) return;
          parsing = false;
          previewData = null;
          previewError = (error && error.message) || '文件解析失败';
          render();
        });
      }
      footer.querySelector('[data-ui-close]').addEventListener('click', actions.onClose);
      body.querySelector('[data-ui-download]').addEventListener('click', config.onDownload);
      body.querySelector('[data-ui-choose]').addEventListener('click', function () { fileInput.click(); });
      fileInput.addEventListener('change', function () { choose(fileInput.files && fileInput.files[0]); });
      dropZone.addEventListener('dragover', function (event) { event.preventDefault(); dropZone.classList.add('is-drag-over'); });
      dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('is-drag-over'); });
      dropZone.addEventListener('drop', function (event) { event.preventDefault(); dropZone.classList.remove('is-drag-over'); choose(event.dataTransfer && event.dataTransfer.files[0]); });
      var confirm = footer.querySelector('[data-ui-confirm]');
      if (confirm) confirm.addEventListener('click', function () { if (canConfirm(Boolean(selectedFile))) config.onConfirm(selectedFile, actions.onClose); });
      }
      render();
      return { render: render, getFile: function () { return selectedFile; } };
    }
    return { config: config, mount: mount };
  }

  /** Reusable standalone three-step import dialog. It is the transfer-order import standard. */
  function openImportDialog(options) {
    var flow = createImportFlow(options);
    var config = flow.config;
    var trigger = document.activeElement;
    var mask = document.createElement('div');
    mask.className = 'ui-dialog-mask';
    mask.innerHTML = '<section class="ui-dialog ui-dialog--import' + (config.parsePreview ? ' ui-dialog--import-preview' : '') + '" role="dialog" aria-modal="true" aria-label="' + escapeHtml(config.title) + '"><header class="ui-dialog__header ui-import__header"><div><h2>' + escapeHtml(config.title) + '</h2>' + (config.subtitle ? '<p class="ui-import__subtitle">' + escapeHtml(config.subtitle) + '</p>' : '') + '</div><button class="ui-dialog__close" type="button" data-ui-close aria-label="关闭">×</button></header><div class="ui-dialog__body ui-import__body" data-ui-import-body></div><footer class="ui-dialog__footer ui-import__footer" data-ui-import-footer></footer></section>';
    function close() { closeMask(mask, trigger); }
    mask.addEventListener('click', function (event) { if (event.target === mask) closeMask(mask, trigger); });
    document.body.appendChild(mask);
    mask.querySelector('[data-ui-close]').addEventListener('click', close);
    flow.mount(mask.querySelector('[data-ui-import-body]'), mask.querySelector('[data-ui-import-footer]'), { onClose: close });
    mask.querySelector('[data-ui-close]').focus();
    return { close: function () { closeMask(mask, trigger); } };
  }

  function inspectPage(root) {
    var scope = root || document;
    var issues = [];
    scope.querySelectorAll('.ui-query-card').forEach(function (card) {
      if (!card.querySelector('.ui-query-flow')) issues.push('查询卡片缺少 .ui-query-flow。');
    });
    scope.querySelectorAll('.ui-action-row').forEach(function (row) {
      if (getComputedStyle(row).backgroundColor !== 'rgba(0, 0, 0, 0)') issues.push('操作按钮区不应使用卡片底色。');
    });
    scope.querySelectorAll('.ui-dialog--import').forEach(function (dialog) {
      if (!dialog.querySelector('.ui-import__steps')) issues.push('导入弹窗未使用共享步骤条。');
    });
    return issues;
  }

  global.UIKit = Object.freeze({ createImportFlow: createImportFlow, openImportDialog: openImportDialog, inspectPage: inspectPage, tokens: 'ui-kit.css' });
}(window));
