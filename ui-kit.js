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

  /** Reusable three-step import dialog. It is the transfer-order import standard. */
  function openImportDialog(options) {
    var config = Object.assign({
      title: '导入数据',
      guideTitle: '第一步：使用标准模板整理数据',
      guideText: '请勿修改模板表头。支持 .xlsx、.xls、.csv 文件，单次仅导入一个文件。',
      idleText: '尚未选择文件',
      accepted: '.xlsx,.xls,.csv',
      downloadLabel: '下载模板',
      onDownload: function () {},
      onConfirm: function () {}
    }, options || {});
    var trigger = document.activeElement;
    var selectedFile = null;
    var mask = document.createElement('div');
    mask.className = 'ui-dialog-mask';

    function render() {
      var hasFile = Boolean(selectedFile);
      mask.innerHTML = '<section class="ui-dialog ui-dialog--import" role="dialog" aria-modal="true" aria-label="' + escapeHtml(config.title) + '">'
        + '<header class="ui-dialog__header ui-import__header"><h2>' + escapeHtml(config.title) + '</h2><button class="ui-dialog__close" type="button" data-ui-close aria-label="关闭">×</button></header>'
        + '<div class="ui-dialog__body ui-import__body">'
        + '<div class="ui-import__steps"><div class="ui-import__step is-active"><span class="ui-import__step-number">1</span><span>下载模板</span></div><i class="ui-import__line"></i><div class="ui-import__step' + (hasFile ? ' is-active' : '') + '"><span class="ui-import__step-number">2</span><span>选择文件</span></div><i class="ui-import__line"></i><div class="ui-import__step"><span class="ui-import__step-number">3</span><span>确认导入</span></div></div>'
        + '<div class="ui-import__guide"><strong>' + escapeHtml(config.guideTitle) + '</strong><p>' + escapeHtml(config.guideText) + '</p><button class="ui-button" data-ui-download type="button">' + escapeHtml(config.downloadLabel) + '</button></div>'
        + '<div class="ui-import__upload" data-ui-drop-zone><input data-ui-file type="file" accept="' + escapeHtml(config.accepted) + '" hidden><span class="ui-import__upload-icon">↥</span><span>将 Excel 文件拖到此处，或 <b class="ui-import__link" data-ui-choose>点击选择文件</b></span></div>'
        + '<p class="ui-import__tip">选择文件后点击「确认导入」，系统将自动校验文件，校验不通过会提示具体原因。</p>'
        + (hasFile ? '<div class="ui-import__preview">已选择文件：' + escapeHtml(selectedFile.name) + '</div>' : '')
        + '</div><footer class="ui-dialog__footer ui-import__footer"><span>' + (hasFile ? '当前文件：' + escapeHtml(selectedFile.name) : escapeHtml(config.idleText)) + '</span><div><button class="ui-button" type="button" data-ui-close>取消</button><button class="ui-button ui-button--primary" type="button" data-ui-confirm ' + (hasFile ? '' : 'disabled') + '>确认导入</button></div></footer></section>';

      var fileInput = mask.querySelector('[data-ui-file]');
      var dropZone = mask.querySelector('[data-ui-drop-zone]');
      function choose(file) {
        if (!file) return;
        selectedFile = file;
        render();
      }
      mask.querySelectorAll('[data-ui-close]').forEach(function (node) { node.addEventListener('click', function () { closeMask(mask, trigger); }); });
      mask.querySelector('[data-ui-download]').addEventListener('click', config.onDownload);
      mask.querySelector('[data-ui-choose]').addEventListener('click', function () { fileInput.click(); });
      fileInput.addEventListener('change', function () { choose(fileInput.files && fileInput.files[0]); });
      dropZone.addEventListener('dragover', function (event) { event.preventDefault(); dropZone.classList.add('is-drag-over'); });
      dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('is-drag-over'); });
      dropZone.addEventListener('drop', function (event) { event.preventDefault(); dropZone.classList.remove('is-drag-over'); choose(event.dataTransfer && event.dataTransfer.files[0]); });
      var confirm = mask.querySelector('[data-ui-confirm]');
      if (confirm) confirm.addEventListener('click', function () { if (selectedFile) config.onConfirm(selectedFile, function () { closeMask(mask, trigger); }); });
    }
    mask.addEventListener('click', function (event) { if (event.target === mask) closeMask(mask, trigger); });
    document.body.appendChild(mask);
    render();
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

  global.UIKit = Object.freeze({ openImportDialog: openImportDialog, inspectPage: inspectPage, tokens: 'ui-kit.css' });
}(window));
