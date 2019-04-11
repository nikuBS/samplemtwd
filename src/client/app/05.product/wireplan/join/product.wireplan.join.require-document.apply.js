/**
 * @file product.wireplan.join.require-document.apply.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.08
 */

Tw.ProductWireplanJoinRequireDocumentApply = function(rootEl, historyList) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn_apply'));

  this._cachedElement();
  this._bindEvent();

  this._fileList = [];
  this._limitFileByteSize = 2097152;
  this._acceptExt = ['jpg', 'jpeg', 'png', 'gif'];
  this._historyList = JSON.parse(window.unescape(historyList));

  this._fileTemplate = Handlebars.compile($('#fe-templ-reserv-file').html());
};

Tw.ProductWireplanJoinRequireDocumentApply.prototype = {

  _cachedElement: function() {
    this.$fileWrap = this.$container.find('.fe-file_wrap');
    this.$fileList = this.$container.find('.fe-file_list');
    this.$explainFile = this.$container.find('.fe-explain_file');
    this.$explainFileView = this.$container.find('.fe-explain_file_view');
    this.$explainFileViewClone = this.$explainFileView.parents('.file-wrap').clone();
    this.$btnExplainFileAdd = this.$container.find('.fe-btn_explain_file_add');
    this.$btnOpenHistoryDetail = this.$container.find('.fe-btn_open_detail');
    this.$btnApply = this.$container.find('.fe-btn_apply');
  },

  _bindEvent: function() {
    this.$container.on('click', 'input[type=file]', $.proxy(this._openCustomFileChooser, this));
    this.$container.on('change', '.fe-explain_file', $.proxy(this._onChangeExplainFile, this));
    this.$container.on('click', '.fe-btn_explain_file_add', $.proxy(this._uploadExplainFile, this));

    this.$btnOpenHistoryDetail.on('click', $.proxy(this._openHistoryDetailPop, this));
    this.$fileList.on('click', '.fe-btn_explain_file_del', $.proxy(this._delExplainFile, this));
    this.$btnApply.on('click', _.debounce($.proxy(this._procApply, this), 500));
  },

  _onChangeExplainFile: function(e) {
    if (this._fileList.length > 4) {
      return this._toggleBtn(this.$btnExplainFileAdd, false);
    }

    this._toggleBtn(this.$btnExplainFileAdd, !Tw.FormatHelper.isEmpty(e.currentTarget.files));
  },

  _openCustomFileChooser: function (e) {
    var $target = $(e.currentTarget);

    if ( Tw.CommonHelper.isLowerVersionAndroid() ) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_FILE_CHOOSER, {
        dest: Tw.UPLOAD_TYPE.RESERVATION,
        acceptExt: this._acceptExt,
        limitSize: this._limitFileByteSize
      }, $.proxy(this._nativeFileChooser, this, $target));
    }
  },

  _nativeFileChooser: function ($target, response) {
    if (response.resultCode === -1) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
    }

    if (response.resultCode === Tw.NTV_CODE.CODE_02) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.TITLE);
    }

    if (response.resultCode === Tw.NTV_CODE.CODE_01) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if (this._fileList.length > 4) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A02);
    }

    var params = response.params;
    var fileInfo = params.fileData.result[0];

    this._fileList.push(fileInfo);
    this.$fileList.append(this._fileTemplate(fileInfo));
    this.$fileWrap.show().attr('aria-hidden', 'false');

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  _uploadExplainFile: function() {
    var fileInfo = this.$container.find('.fe-explain_file').get(0).files[0];

    if (fileInfo.size > this._limitFileByteSize) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if (this._acceptExt.indexOf(fileInfo.name.split('.').pop().toLowerCase()) === -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A33.TITLE);
    }

    if (this._fileList.length > 4) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A02);
    }

    var dFiles = [];
    dFiles.push(fileInfo);
    dFiles.push(fileInfo);

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.CommonHelper.fileUpload(Tw.UPLOAD_TYPE.RESERVATION, dFiles)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._failUploadFile, this));
  },

  _delExplainFile: function(e) {
    var $item = $(e.currentTarget).parents('li');

    this._fileList.splice($item.index(), 1);
    this._toggleBtn(this.$btnExplainFileAdd, this._fileList.length < 5);

    $item.remove();

    if (this._fileList.length < 1) {
      this.$fileWrap.hide().attr('aria-hidden', 'true');
    }

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  _successUploadFile: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
    }

    this._fileList.push(resp.result);
    this.$fileList.append(this._fileTemplate(resp.result[0]));
    this.$fileWrap.show().attr('aria-hidden', 'false');

    this._clearExplainFile();
    this._procEnableApplyBtn();
  },

  _failUploadFile: function() {
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
  },

  _clearExplainFile: function() {
    this.$container.find('.fe-explain_file_view').parents('.file-wrap').html(this.$explainFileViewClone);
    this._toggleBtn(this.$btnExplainFileAdd, false);
    skt_landing.widgets.widget_init('.file-wrap');
  },

  _toggleBtn: function($btn, isEnable) {
    if (isEnable) {
      $btn.removeAttr('disabled').prop('disabled', false);
      $btn.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      $btn.attr('disabled', 'disabled').prop('disabled', true);
      $btn.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  _procEnableApplyBtn: function() {
    if (this._fileList.length < 1) {
      return this._toggleBtn(this.$btnApply, false);
    }

    this._toggleBtn(this.$btnApply, true);
  },

  _procApply: function() {
    var convFileList0 = [],
      convFileList1 = [];

    this._fileList.forEach(function(itemList) {
      convFileList0.push({
        fileSize: itemList[0].size,
        fileName: itemList[0].name,
        filePath: '/' + itemList[0].path
      });
      convFileList1.push({
        fileSize: itemList[1].size,
        fileName: itemList[1].name,
        filePath: '/' + itemList[1].path
      });
    });

    var apiList = [
      {
        command: Tw.API_CMD.BFF_01_0046,
        params: {
          recvFaxNum: 'skt404@sk.com',
          proMemo: Tw.PRODUCT_RESERVATION.combine,
          scanFiles: convFileList0
        }
      },
      {
        command: Tw.API_CMD.BFF_01_0046,
        params: {
          recvFaxNum: 'skt219@sk.com',
          proMemo: Tw.PRODUCT_RESERVATION.combine,
          scanFiles: convFileList1
        }
      }
    ];

    this._apiService.requestArray(apiList)
      .done($.proxy(this._resApply, this));
  },

  _resApply: function(uscan0, uscan1) {
    if (uscan0.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(uscan0.code, uscan0.msg).pop();
    }

    if (uscan1.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(uscan1.code, uscan1.msg).pop();
    }

    this._openSuccessPop();
  },

  _openHistoryDetailPop: function() {
    this._popupService.open({
      'pop_name': 'type_tx_scroll',
      'title': Tw.PRODUCT_REQUIRE_DOCUMENT.HISTORY_DETAIL,
      'title_type': 'sub',
      'cont_align':'tl',
      'contents': (this._historyList.map(function(item) {
        return '- ' + item;
      })).join('<br>'),
      'bt_b': [{
        style_class:'pos-left tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, null);
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_subtexts',
      text: Tw.PRODUCT_REQUIRE_DOCUMENT.SUCCESS_TITLE,
      subtexts: [
        Tw.PRODUCT_REQUIRE_DOCUMENT.FILE_COUNT + this._fileList.length + Tw.PRODUCT_REQUIRE_DOCUMENT.FILE_COUNT_UNIT
      ]
    }, $.proxy(this._bindSuccessPop, this), $.proxy(this._backToParentPage, this), 'require_document_success');
  },

  _bindSuccessPop: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closeSuccessPop, this));
  },

  _closeSuccessPop: function() {
    this._popupService.close();
  },

  _backToParentPage: function() {
    if (this._isCombineInfo) {
      return this._historyService.go(-2);
    }

    this._historyService.goBack();
  }

};
