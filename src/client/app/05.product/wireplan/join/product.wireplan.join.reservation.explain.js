/**
 * @file product.wireplan.join.reservation.explain.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.05
 */

Tw.ProductWireplanJoinReservationExplain = function(familyList, callback) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._callback = callback;

  this._familyList = familyList || [];
  this._familyListOriginalLength = this._familyList.length;
  this._fileList = [];

  this._fileTemplate = Handlebars.compile($('#fe-templ-reserv-file').html());
  this._familyTemplate = Handlebars.compile($('#fe-tmpl-reserv-family').html());

  this._limitFileByteSize = 2097152;
  this._acceptExt = ['jpg', 'jpeg', 'png', 'gif'];

  this._popupService.open({
    hbs: 'BS_05_01_01_01',
    layer: true,
    list: familyList || []
  }, $.proxy(this._init, this), null, 'combine_explain');
};

Tw.ProductWireplanJoinReservationExplain.prototype = {

  _init: function($popupContainer) {
    this.$container = $popupContainer;
    this._cachedElement();
    this._bindEvent();
    this._familyType = null;
    this._focusService = new Tw.InputFocusService($popupContainer, $popupContainer.find('.fe-btn_family_add'));

    if (this._familyList.length > 0) {
      this.$familyWrap.show().attr('aria-hidden', 'false');
    }
  },

  _cachedElement: function() {
    this.$familyWrap = this.$container.find('.fe-family_wrap');
    this.$familyAddWrap = this.$container.find('.fe-family_add_wrap');
    this.$familyAddWrapNumber = this.$container.find('.fe-input_phone_number');
    this.$familyList = this.$container.find('.fe-family_list');
    this.$fileWrap = this.$container.find('.fe-file_wrap');
    this.$fileList = this.$container.find('.fe-file_list');
    this.$explainFile = this.$container.find('.fe-explain_file');
    this.$explainFileView = this.$container.find('.fe-explain_file_view');
    this.$explainFileViewClone = this.$explainFileView.parents('.file-wrap').html();

    this.$btnFamilyType = this.$container.find('.fe-btn_family_type');
    this.$btnFamilyAdd = this.$container.find('.fe-btn_family_add');
    this.$btnExplainFileAdd = this.$container.find('.fe-btn_explain_file_add');
    this.$btnExplainApply = this.$container.find('.fe-btn_explain_apply');
  },

  _bindEvent: function() {
    this.$btnFamilyType.on('click', $.proxy(this._openFamilyTypePop, this));
    this.$btnExplainApply.on('click', _.debounce($.proxy(this._doCallback, this), 500));
    this.$btnFamilyAdd.on('click', _.debounce($.proxy(this._addFamily, this), 500));

    this.$familyAddWrap.on('keyup input', 'input[type=text],input[type=tel]', $.proxy(this._procEnableAddFamilyBtn, this));
    this.$familyAddWrap.on('click', '.fe-btn_cancel', $.proxy(this._procEnableAddFamilyBtn, this));
    this.$familyList.on('change', 'input[type=checkbox]', $.proxy(this._procEnableApplyBtn, this));
    this.$familyList.on('click', '.fe-btn_family_del', $.proxy(this._delFamily, this));

    this.$container.on('click', 'input[type=file]', $.proxy(this._openCustomFileChooser, this));
    this.$container.on('click', '.fe-btn_explain_file_add', $.proxy(this._uploadExplainFile, this));
    this.$container.on('change', '.fe-explain_file', $.proxy(this._onChangeExplainFile, this));

    this.$fileList.on('click', '.fe-btn_explain_file_del', $.proxy(this._delExplainFile, this));
  },

  _openFamilyTypePop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.FAMILY_TYPE.ME,
              'radio-attr':'id="ra1" data-family_type="me" ' + (this._familyType === 'me' ? 'checked' : '') },
            { 'label-attr': 'id="ra2"', 'txt': Tw.FAMILY_TYPE.SPOUSE,
              'radio-attr':'id="ra2" data-family_type="spouse" ' + (this._familyType === 'spouse' ? 'checked' : '') },
            { 'label-attr': 'id="ra3"', 'txt': Tw.FAMILY_TYPE.CHILDREN,
              'radio-attr':'id="ra3" data-family_type="children" ' + (this._familyType === 'children' ? 'checked' : '') },
            { 'label-attr': 'id="ra4"', 'txt': Tw.FAMILY_TYPE.PARENTS,
              'radio-attr':'id="ra4" data-family_type="parents" ' + (this._familyType === 'parents' ? 'checked' : '') },
            { 'label-attr': 'id="ra5"', 'txt': Tw.FAMILY_TYPE.BROTHER,
              'radio-attr':'id="ra5" data-family_type="brother" ' + (this._familyType === 'brother' ? 'checked' : '') },
            { 'label-attr': 'id="ra6"', 'txt': Tw.FAMILY_TYPE.GRANDPARENTS,
              'radio-attr':'id="ra6" data-family_type="grandparents" ' + (this._familyType === 'grandparents' ? 'checked' : '') },
            { 'label-attr': 'id="ra7"', 'txt': Tw.FAMILY_TYPE.GRANDCHILDREN,
              'radio-attr':'id="ra7" data-family_type="grandchildren" ' + (this._familyType === 'grandchildren' ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindFamilyTypePop, this), null, 'select_family_type');
  },

  _procEnableAddFamilyBtn: function() {
    if (Tw.FormatHelper.isEmpty(this._familyType) || $.trim(this.$familyAddWrap.find('.fe-input_name').val()).length < 1 ||
      $.trim(this.$familyAddWrap.find('.fe-input_phone_number').val()).length < 1 || this._familyList.length > 4) {
      return this._toggleBtn(this.$btnFamilyAdd, false);
    }

    this._toggleBtn(this.$btnFamilyAdd, true);
  },

  _addFamily: function() {
    if (this.$btnFamilyAdd.attr('disabled') === 'disabled') {
      return;
    }

    if (!Tw.ValidationHelper.isCellPhone(this.$familyAddWrapNumber.val()) && !Tw.ValidationHelper.isTelephone(this.$familyAddWrapNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    if (this._familyList.length > 4) {
      return;
    }

    var familyAddData = {
      name: this.$familyAddWrap.find('.fe-input_name').val(),
      number: this.$familyAddWrap.find('.fe-input_phone_number').val(),
      no: this._familyList.length,
      fam: {}
    };

    familyAddData.fam[this._familyType] = true;

    this._familyList.push(familyAddData);
    this._toggleBtn(this.$btnFamilyAdd, false);
    this._clearFamilyAddWrap();

    this.$familyList.append(this._familyTemplate(familyAddData));
    this.$familyWrap.show().attr('aria-hidden', 'false');

    this.$familyWrap.find('.check').off();
    skt_landing.widgets.widget_init('.fe-family_wrap');
    this.$familyWrap.find('h3').focus();
  },

  _delFamily: function(e) {
    var $item = $(e.currentTarget).parents('li'),
      delNo = $item.data('no'),
      delNoIdx = null;

    $.each(this._familyList, function(item, index) {
      if (item.no === delNo) {
        delNoIdx = index;
        return false;
      }
    });

    this._familyList.splice(delNoIdx, 1);
    this._toggleBtn(this.$btnFamilyAdd, this._familyList.length < 5);
    this._procEnableAddFamilyBtn();

    $item.remove();

    if (this._familyList.length < 1) {
      this.$familyWrap.hide().attr('aria-hidden', 'true');
      this.$container.find('#fe-add-family').focus();
    }

    this._procEnableApplyBtn();
  },

  _bindFamilyTypePop: function($popupContainer) {
    $popupContainer.on('click', '[data-family_type]', $.proxy(this._setFamilyType, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($popupContainer);
  },

  _setFamilyType: function(e) {
    this._familyType = $(e.currentTarget).data('family_type');
    this._procEnableAddFamilyBtn();

    this.$btnFamilyType.html(Tw.FAMILY_TYPE[this._familyType.toUpperCase()] + $('<div\>').append(this.$btnFamilyType.find('.ico')).html());
    this._popupService.close();
  },

  _setFamilyTypeText: function(familyList) {
    return familyList.map(function(item) {
      var familyTypeText = [];

      if (item.parents) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.parents); }
      if (item.grandparents) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.grandparents); }
      if (item.grandchildren) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.grandchildren); }
      if (item.spouse) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.spouse); }
      if (item.children) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.children); }
      if (item.brother) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.brother); }
      if (item.me) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.me); }
      if (item.leader) { familyTypeText.push(Tw.PRODUCT_COMBINE_FAMILY_TYPE.leader); }

      return $.extend(item, {
        familyTypeText: familyTypeText.join('')
      });
    });
  },

  _clearFamilyAddWrap: function() {
    this._familyType = null;
    this.$btnFamilyType.html(Tw.FAMILY_TYPE.DEFAULT + $('<div\>').append(this.$btnFamilyType.find('.ico')).html());
    this.$familyAddWrap.find('input').val('');
    this.$familyAddWrap.find('.fe-btn_cancel').removeClass('block');
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

  _onChangeExplainFile: function(e) {
    if (this._fileList.length > 4) {
      return this._toggleBtn(this.$btnExplainFileAdd, false);
    }

    this._toggleBtn(this.$btnExplainFileAdd, !Tw.FormatHelper.isEmpty(e.currentTarget.files));
  },

  _procEnableApplyBtn: function() {
    if (this.$familyList.find('input[type=checkbox]:checked').length < 1 || this._fileList.length < 1) {
      return this._toggleBtn(this.$btnExplainApply, false);
    }

    this._toggleBtn(this.$btnExplainApply, true);
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
    var toggleClass = $btn.hasClass('fe-btn_explain_apply') ? 'bt-red1' : 'bt-blue1';
    if (isEnable) {
      $btn.removeAttr('disabled').prop('disabled', false);
      $btn.parent().removeClass('bt-gray1').addClass(toggleClass);
    } else {
      $btn.attr('disabled', 'disabled').prop('disabled', true);
      $btn.parent().removeClass(toggleClass).addClass('bt-gray1');
    }
  },

  _doCallback: function() {
    this._callback({
      combGrpNewYn: (this._familyListOriginalLength === 0 && this._familyList.length > 0) ? 'Y' : 'N',
      familyList: this._setFamilyTypeText(this._familyList),
      fileList: this._fileList
    });
  }

};

