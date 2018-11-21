/**
 * FileName: product.wireplan.join.require-document.apply.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

Tw.ProductWireplanJoinRequireDocumentApply = function(rootEl) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();

  this._fileList = [];
  this._limitFileByteSize = 2097152;
  this._acceptExt = ['jpg', 'jpeg', 'png', 'tif', 'bmp'];

  this._fileTemplate = Handlebars.compile($('#fe-templ-reserv-file').html());
};

Tw.ProductWireplanJoinRequireDocumentApply.prototype = {

  _cachedElement: function() {
    this.$fileWrap = this.$container.find('.fe-file_wrap');
    this.$fileList = this.$container.find('.fe-file_list');
    this.$explainFile = this.$container.find('.fe-explain_file');
    this.$explainFileView = this.$container.find('.fe-explain_file_view');
    this.$btnExplainFileAdd = this.$container.find('.fe-btn_explain_file_add');
    this.$btnApply = this.$container.find('.fe-btn_apply');
  },

  _bindEvent: function() {
    this.$btnExplainFileAdd.on('click', $.proxy(this._uploadExplainFile, this));
    this.$explainFile.on('change', $.proxy(this._onChangeExplainFile, this));
    this.$fileList.on('click', '.fe-btn_explain_file_del', $.proxy(this._delExplainFile, this));
    this.$btnApply.on('click', $.proxy(this._procApply, this));
  },

  _onChangeExplainFile: function(e) {
    if (this._fileList.length > 4) {
      return this._toggleBtn(this.$btnExplainFileAdd, false);
    }

    this._toggleBtn(this.$btnExplainFileAdd, !Tw.FormatHelper.isEmpty(e.currentTarget.files));
  },

  _uploadExplainFile: function() {
    var fileInfo = this.$explainFile.get(0).files[0],
      formData = new FormData();

    if (fileInfo.size > this._limitFileByteSize) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if (this._acceptExt.indexOf(fileInfo.name.split('.').pop()) === -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.TITLE);
    }

    if (this._fileList.length > 4) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A02);
    }

    formData.append('file', this.$explainFile.get(0).files[0]);
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this));
  },

  _delExplainFile: function(e) {
    var $item = $(e.currentTarget).parents('li');

    this._fileList.splice($item.index(), 1);
    this._toggleBtn(this.$btnExplainFileAdd, this._fileList.length < 5);

    $item.remove();

    if (this._fileList.length < 1) {
      this.$fileWrap.hide();
    }

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  _successUploadFile: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
    }

    this._fileList.push(resp.result[0]);
    this.$fileList.append(this._fileTemplate(resp.result[0]));
    this.$fileWrap.show();

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  _clearExplainFile: function() {
    this.$explainFileView.val('');
    this._toggleBtn(this.$btnExplainFileAdd, false);
  },

  _toggleBtn: function($btn, isEnable) {
    if (isEnable) {
      $btn.removeAttr('disabled').prop('disabled', false);
    } else {
      $btn.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _procEnableApplyBtn: function() {
    if (this._fileList.length < 1) {
      return this._toggleBtn(this.$btnApply, false);
    }

    this._toggleBtn(this.$btnApply, true);
  },

  _procApply: function() {
    // do Appply
  }

};
