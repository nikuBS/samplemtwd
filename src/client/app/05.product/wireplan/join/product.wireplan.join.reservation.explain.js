/**
 * FileName: product.wireplan.join.reservation.explain.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.05
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

    if (this._familyList.length > 0) {
      this.$familyWrap.show();
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

    this.$btnFamilyType = this.$container.find('.fe-btn_family_type');
    this.$btnFamilyAdd = this.$container.find('.fe-btn_family_add');
    this.$btnExplainFileAdd = this.$container.find('.fe-btn_explain_file_add');
    this.$btnExplainApply = this.$container.find('.fe-btn_explain_apply');
  },

  _bindEvent: function() {
    this.$btnFamilyType.on('click', $.proxy(this._openFamilyTypePop, this));
    this.$btnExplainApply.on('click', $.proxy(this._doCallback, this));
    this.$btnFamilyAdd.on('click', $.proxy(this._addFamily, this));
    this.$btnExplainFileAdd.on('click', $.proxy(this._uploadExplainFile, this));

    this.$familyAddWrap.on('keyup input', 'input[type=text]', $.proxy(this._procEnableAddFamilyBtn, this));
    this.$familyList.on('change', 'input[type=checkbox]', $.proxy(this._procEnableApplyBtn, this));
    this.$familyList.on('click', '.fe-btn_family_del', $.proxy(this._delFamily, this));

    this.$explainFile.on('change', $.proxy(this._onChangeExplainFile, this));
    this.$fileList.on('click', '.fe-btn_explain_file_del', $.proxy(this._delExplainFile, this));
  },

  _openFamilyTypePop: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_FAMILY_TYPE,
      data: [{
        'list': [
          { value: Tw.FAMILY_TYPE.SPOUSE, option: (this._familyType === 'spouse') ? 'checked' : '', attr: 'data-family_type="spouse"' },
          { value: Tw.FAMILY_TYPE.CHILDREN, option: (this._familyType === 'children') ? 'checked' : '', attr: 'data-family_type="children"' },
          { value: Tw.FAMILY_TYPE.PARENTS, option: (this._familyType === 'parents') ? 'checked' : '', attr: 'data-family_type="parents"' },
          { value: Tw.FAMILY_TYPE.BROTHER, option: (this._familyType === 'brother') ? 'checked' : '', attr: 'data-family_type="brother"' },
          { value: Tw.FAMILY_TYPE.GRANDPARENTS, option: (this._familyType === 'grandparents') ? 'checked' : '',
            attr: 'data-family_type="grandparents"' },
          { value: Tw.FAMILY_TYPE.GRANDCHILDREN, option: (this._familyType === 'grandchildren') ? 'checked' : '',
            attr: 'data-family_type="grandchildren"' },
          { value: Tw.FAMILY_TYPE.ME, option: (this._familyType === 'me') ? 'checked' : '', attr: 'data-family_type="me"' }
        ]
      }]
    }, $.proxy(this._bindFamilyTypePop, this), null, 'select_family_type');
  },

  _procEnableAddFamilyBtn: function() {
    if (Tw.FormatHelper.isEmpty(this._familyType) || this.$familyAddWrap.find('.fe-input_name').val().length < 1 ||
      this.$familyAddWrap.find('.fe-input_phone_number').val().length < 1 || this._familyList.length > 4) {
      return this._toggleBtn(this.$btnFamilyAdd, false);
    }

    this._toggleBtn(this.$btnFamilyAdd, true);
  },

  _addFamily: function() {
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
    this._toggleBtn(this.$btnFamilyAdd, this._familyList.length < 5);
    this._clearFamilyAddWrap();

    this.$familyList.append(this._familyTemplate(familyAddData));
    this.$familyWrap.show();

    this.$familyWrap.find('.checkbox').off();
    skt_landing.widgets.widget_init('.fe-family_wrap');
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
      this.$familyWrap.hide();
    }

    this._procEnableApplyBtn();
  },

  _bindFamilyTypePop: function($popupContainer) {
    $popupContainer.on('click', '[data-family_type]', $.proxy(this._setFamilyType, this));
  },

  _setFamilyType: function(e) {
    this._familyType = $(e.currentTarget).data('family_type');
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
    this.$familyAddWrap.find('input[type=text]').val('').blur();
    this.$familyAddWrap.find('.fe-btn_cancel').removeClass('block');
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

  _uploadExplainFile: function() {
    var fileInfo = this.$explainFile.get(0).files[0];

    if (fileInfo.size > this._limitFileByteSize) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A32.TITLE);
    }

    if (this._acceptExt.indexOf(fileInfo.name.split('.').pop()) === -1) {
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
      .done($.proxy(this._successUploadFile, this));
  },

  _successUploadFile: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._popupService.openAlert(Tw.UPLOAD_FILE.WARNING_A00);
    }

    this._fileList.push(resp.result);
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

  _doCallback: function() {
    this._callback({
      combGrpNewYn: (this._familyListOriginalLength === 0 && this._familyList.length > 0) ? 'Y' : 'N',
      familyList: this._setFamilyTypeText(this._familyList),
      fileList: this._fileList
    });
  }
};

