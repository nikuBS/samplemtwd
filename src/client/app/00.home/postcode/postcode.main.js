/**
 * FileName: postcode.main.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.30
 */

Tw.PostcodeMain = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._inputHelper = Tw.InputHelper;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
  this._initVariables();
  this._bindEvent();
};

Tw.PostcodeMain.prototype = {
  _init: function () {
    this.$container.find('input[type="text"]').val('');
    Tw.UIService.setLocalStorage('post', '');
  },
  _initVariables: function () {
    this._cityList = [];
    this._gunList = [];
    this._detailList = [];
    this._cityCode = null;
    this._gunCode = null;
    this._nextPage = 0;
    this._totalPage = 0;
    this._totalElements = 0;
    this._id = null;
    this._postType = 'B';
    this._selectedTabId = 'tab1';
    this._selectedTabName = 'load';
    this._defaultElementLength = 20;
    this.$tabSelector = this.$container.find('#tab1-tab');
    this.$citySelector = this.$container.find('.fe-select-city:first');
    this.$gunSelector = this.$container.find('.fe-select-gun:first');
    this.$getPostCodeBtn = this.$container.find('.fe-get-postcode');
    this.$fieldSet = this.$container.find('.fe-field-set:first');
    this.$loadAddress = this.$container.find('.fe-load-address:first');
    this.$buildingName = this.$container.find('.fe-building-name');
    this.$standardAddress = this.$container.find('.fe-standard:first');
    this.$remainAddressWrap = this.$container.find('.fe-remain-address-wrap:first');
    this.$remainAddress = this.$container.find('.fe-remain-address:first');
    this.$selectDetailAddress = this.$container.find('.fe-go-step3');
    this.$aptLastField = this.$container.find('.fe-apt-last-field');
    this.$etcLastField = this.$container.find('.fe-etc-last-field');
    this.$numberOrNameSelector = this.$container.find('.fe-select-number-name');
    this.$numberWrap = this.$container.find('.fe-number');
    this.$nameWrap = this.$container.find('.fe-name');
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-load-name', $.proxy(this._activeButton, this));
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.fe-prevent li', $.proxy(this._preventDefault, this));
    this.$container.on('click', '.fe-tab-menu li', $.proxy(this._onChangeTab, this));
    this.$container.on('click', '.fe-select-city', $.proxy(this._getList, this, this._cityList, Tw.API_CMD.BFF_01_0006, {}));
    this.$container.on('click', '.fe-select-gun', $.proxy(this._getSecondList, this));
    this.$container.on('click', '.fe-get-postcode', $.proxy(this._getPostCode, this));
    this.$container.on('click', '.fe-select-detail', $.proxy(this._getDetailList, this));
    this.$container.on('click', '.fe-get-building-name', $.proxy(this._getMoreDetailList, this, 'btn'));
    this.$container.on('click', '.fe-remain-address-wrap', $.proxy(this._getMore, this));
    this.$container.on('click', '.fe-go-step3', $.proxy(this._goStep3, this));
    this.$container.on('click', '.fe-select-number-name', $.proxy(this._selectNumberOrName, this));
    this.$container.on('click', '.fe-get-number-name', $.proxy(this._getMoreDetailList, this, 'btn-number'));
    this.$container.on('click', '.fe-cancel-process', $.proxy(this._cancelProcess, this));
    this.$container.on('click', '.fe-complete', $.proxy(this._postComplete, this));
  },
  _onlyNumber: function (event) {
    this._inputHelper.inputNumberOnly(event.currentTarget);
  },
  _activeButton: function (event) {
    var $value = $(event.currentTarget).val();
    if ($value.length > 1) {
      this.$getPostCodeBtn.removeClass('disabled');
    } else {
      this.$getPostCodeBtn.addClass('disabled');
    }
  },
  _preventDefault: function (event) {
    event.preventDefault();
  },
  _onChangeTab: function (event) {
    this._selectedTabId = $(event.currentTarget).attr('id');
    this._selectedTabName = $(event.currentTarget).attr('name');
    this._postType = $(event.currentTarget).attr('type');

    this.$tabSelector = this.$container.find('#' + this._selectedTabId + '-tab');
    this.$citySelector = this.$tabSelector.find('.fe-select-city');
    this.$gunSelector = this.$tabSelector.find('.fe-select-gun');

    this.$step2TabContainer = this.$container.find('#' + this._selectedTabId + '-tab.fe-step2');
    this.$loadAddress = this.$step2TabContainer.find('.fe-load-address');
    this.$fieldSet = this.$step2TabContainer.find('.fe-field-set');
    this.$standardAddress = this.$step2TabContainer.find('.fe-standard');
    this.$remainAddressWrap = this.$step2TabContainer.find('.fe-remain-address-wrap');
    this.$remainAddress = this.$step2TabContainer.find('.fe-remain-address');

    this.$step3TabContainer = this.$container.find('#' + this._selectedTabId + '-tab.fe-step3');
    this.$aptLastField = this.$step3TabContainer.find('.fe-apt-last-field');
    this.$etcLastField = this.$step3TabContainer.find('.fe-etc-last-field');
  },
  _getSecondList: function (event) {
    if (this._cityCode === null) {
      this._popupService.openAlert(Tw.MSG_POSTCODE.L01);
    } else {
      this._getList(this._gunList, Tw.API_CMD.BFF_01_0007, { 'supLdongCd': this._cityCode }, event);
    }
  },
  _getDetailList: function (event) {
    var $target = $(event.currentTarget);
    if (!Tw.FormatHelper.isEmpty(this._detailList)) {
      this._openSelector($target, this._detailList);
    }
  },
  _getList: function ($list, $api, $reqData, event) {
    var $target = $(event.currentTarget);
    this._apiService.request($api, $reqData)
      .done($.proxy(this._getListSuccess, this, $target, $list))
      .fail($.proxy(this._getListFail, this));
  },
  _getListSuccess: function ($target, $list, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._initNext($target);
      var $result = res.result;
      $list = this._setList($target, $list, $result);
      this._openSelector($target, $list);
    } else {
      this._getListFail(res);
    }
  },
  _getListFail: function (err) {
    this._popupService.openAlert('code : ' + err.error.code + '\n' + 'msg : ' + err.error.msg);
  },
  _initNext: function ($target) {
    if ($target.hasClass('fe-select-city')) {
      this.$gunSelector.removeAttr('id').text(Tw.POSTCODE_TEXT.CITY_GUN_GU);
    }
    this.$container.find('.fe-search-value').val('');
  },
  _getPostCode: function () {
    var $api = this._getApiName();
    if (this._isValid()) {
      var requestData = this._makePreRequestData();
      this._apiService.request($api, requestData)
        .done($.proxy(this._getPostSuccess, this))
        .fail($.proxy(this._getPostFail, this));
    }
  },
  _getApiName: function () {
    var $api = Tw.API_CMD.BFF_01_0008;
    if (this._selectedTabId === 'tab2') {
      $api = Tw.API_CMD.BFF_01_0010;
    } else if (this._selectedTabId === 'tab3') {
      $api = Tw.API_CMD.BFF_01_0009;
    }
    return $api;
  },
  _isValid: function () {
    var isValid = false;
    var _searchValue = this.$container.find('#' + this._selectedTabId + '-tab .fe-search-value');
    if (this._selectedTabId === 'tab2') {
      isValid = this._validation.checkMoreLength(_searchValue.val(), 2, Tw.MSG_POSTCODE.L03);
    } else {
      isValid = (this._validation.checkIsSelected(this.$citySelector, Tw.MSG_POSTCODE.L01) &&
        this._validation.checkIsSelected(this.$gunSelector, Tw.MSG_POSTCODE.L02) &&
        this._validation.checkMoreLength(_searchValue.val(), 2, Tw.MSG_POSTCODE.L03));
    }
    return isValid;
  },
  _makePreRequestData: function () {
    var _searchValue = this.$container.find('#' + this._selectedTabId + '-tab .fe-search-value');
    var reqData = {
      searchValue: encodeURI($.trim(_searchValue.val()))
    };
    if (this._selectedTabId === 'tab1' || this._selectedTabId === 'tab3') {
      reqData.dongCd = this._gunCode;
    }
    return reqData;
  },
  _getPostSuccess: function (res) {
    var $detailSelector = this.$container.find('#' + this._selectedTabId + '-tab .fe-select-detail');
    if (res.code === Tw.API_CODE.CODE_00) {
      var $result = res.result;
      if (this._selectedTabId === 'tab3') {
        if ($result.content.length > 0) {
          this._initDetailAddress();
          this._setAddressList($result);
          this._history.goHash('#step2-' + this._selectedTabName);
        } else {
          this._popupService.openAlert(Tw.MSG_POSTCODE.L05);
        }
      } else {
        if ($result.length > 0) {
          this._detailList = this._setList($detailSelector, this._detailList, res.result);
          this._initAddress($detailSelector);

          this._history.goHash('#step2-' + this._selectedTabName);
        } else {
          this._getPostFail();
        }
      }
    } else {
      this._getPostFail();
    }
  },
  _getPostFail: function () {
    this._popupService.openAlert(Tw.MSG_POSTCODE.L04);
  },
  _initAddress: function ($detailSelector) {
    $detailSelector.removeAttr('id');
    $detailSelector.text(Tw.POSTCODE_TEXT.SELECT_ADDRESS);
    if (!this.$fieldSet.hasClass('none')) {
      this.$fieldSet.addClass('none');
    }
    this._initDetailAddress();
  },
  _getChoiceColumnName: function ($target) {
    var obj = {};
    if ($target.hasClass('fe-select-city')) {
      obj.id = 'ldongCd';
      obj.text = 'ctPvcNm';
    } else if ($target.hasClass('fe-select-gun')) {
      obj.id = 'ldongCd';
      obj.text = 'ctGunGuNm';
    } else if ($target.hasClass('fe-select-load-detail')) {
      obj.id = 'stNmCd';
      obj.text = 'jusoMain';
      obj.text2 = 'upMyunDongNm';
    } else {
      obj.id = 'dongCd';
      obj.text = 'jusoMain';
      obj.text2 = 'rdongNm';
    }
    return obj;
  },
  _setList: function ($target, $list, $result) {
    $list = [];

    var attrObj = this._getChoiceColumnName($target);
    for (var i = 0; i < $result.length; i++) {
      var obj = {
        'attr': 'id="' + $result[i][attrObj.id] + '"',
        'text': $result[i][attrObj.text]
      };
      if (attrObj.text2 !== undefined) {
        if ($result[i][attrObj.text2] !== undefined) {
          obj.text = obj.text + ' (' + $result[i][attrObj.text2] + ')';
        }
      }
      $list.push(obj);
    }
    return $list;
  },
  _openSelector: function ($target, $list) {
    this._popupService.openChoice(Tw.BUTTON_LABEL.SELECT, $list, 'type1', $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    var $id = $selectedValue.find('button').attr('id');
    $target.attr('id', $id);
    $target.text($selectedValue.text());

    if ($target.hasClass('fe-select-number-name')) {
      this._setNumberOrName($target, $selectedValue);
    } else {
      this._setSuperCode($target, $id);
    }
    this._popupService.close();
  },
  _setNumberOrName: function ($target, $selectedValue) {
    var $key = $selectedValue.find('button').attr('key');
    $target.attr('key', $key);

    this._initNumberName($target);
  },
  _initNumberName: function ($target) {
    if ($target.attr('id') === 'bldCd') {
      this.$numberWrap.show();
      this.$nameWrap.hide();
    } else {
      this.$numberWrap.hide();
      this.$nameWrap.show();
    }
  },
  _setSuperCode: function ($target, $id) {
    if ($target.hasClass('fe-select-city')) {
      this._cityCode = $id;
    } else if ($target.hasClass('fe-select-gun')) {
      this._gunCode = $id;
    } else {
      this._id = $id;

      var type = '';
      if ($target.hasClass('fe-select-number-detail')) {
        type = 'number';
      }
      this._getMoreDetailList(type);
    }
  },
  _initDetailAddress: function (type) {
    this._nextPage = 0;

    this.$container.find('.fe-add-address').remove();
    if (!this.$remainAddressWrap.hasClass('none')) {
      this.$remainAddressWrap.addClass('none');
    }
    if (type === '') {
      this.$buildingName.val('');
    }
    this.$selectDetailAddress.attr('disabled', 'disabled');
  },
  _requestMoreDetailList: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_01_0011, reqData)
      .done($.proxy(this._getDetailSuccess, this))
      .fail($.proxy(this._getDetailFail, this));
  },
  _makeRequestData: function () {
    var reqData = {};
    if (this._selectedTabId === 'tab1') {
      reqData = this._makeLoadRequestData();
    } else if (this._selectedTabId === 'tab2') {
      reqData = this._makeNumberRequestData();
    } else {
      reqData = this._makeOfficeRequestData();
    }
    return reqData;
  },
  _makeLoadRequestData: function () {
    var reqData = {
      postType: this._postType,
      stNmCd: this._id,
      page: this._nextPage
    };
    if (this.$buildingName.val() !== '') {
      reqData.bldMainNum = $.trim(this.$buildingName.val());
    }
    return reqData;
  },
  _makeNumberRequestData: function () {
    var reqData = {
      postType: this._postType,
      ldongCd: this._id,
      page: this._nextPage
    };
    if (this.$numberOrNameSelector.attr('id') === 'bldCd') {
      reqData.mainHouseNumCtt = this.$numberWrap.find('.fe-main-house').val();
      reqData.subHouseNumCtt = this.$numberWrap.find('.fe-sub-house').val();
      reqData.searchKey = 'KEY';
    } else {
      reqData.bldNm = encodeURI(this.$nameWrap.find('.fe-bld-nm').val());
      reqData.searchKey = 'BiLDING';
    }
    return reqData;
  },
  _makeOfficeRequestData: function () {

  },
  _getMoreDetailList: function (type) {
    this._initDetailAddress(type);

    if (type === 'number') {
      this._initDetailSelector();
    } else if (type === 'btn-number') {
      this._requestMoreDetailList();
    } else {
      this._initDetailAddress(type);
      this._requestMoreDetailList();
    }
  },
  _initDetailSelector: function () {
    this.$fieldSet.removeClass('none');
    this.$fieldSet.find('input').val('');

    this._initNumberName(this.$numberOrNameSelector);
  },
  _selectNumberOrName: function () {
    this._openSelector(this.$numberOrNameSelector, this._getNumberOrNameList());
  },
  _getDetailSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $result = res.result.bldgAddress;
      this._setAddressList($result);
    }
  },
  _getDetailFail: function () {

  },
  _setAddressList: function ($result) {
    var _address = this._getAddress();
    this._setPage($result);

    var $content = $result.content;
    for (var i = 0; i < $content.length; i++) {
      var $addressField = this.$standardAddress.clone().removeClass('fe-standard').removeClass('none').addClass('fe-add-address');
      $addressField.attr({'id': $content[i][_address.id], 'postcode': $content[i].zip, 'ho': $content[i].staMainHouseNumCtt, 'dong': $content[i].ldongNm });
      $addressField.find('.address1').text($content[i][_address.name]);
      $addressField.find('.address2').text(_address.text + ' ' + $content[i][_address.value]);
      $addressField.find('.address3').text(Tw.POSTCODE_TEXT.ZIP_CODE + ' ' + $content[i].zip);
      $addressField.on('click', $.proxy(this._onSelectDetailAddress, this));
      this.$loadAddress.append($addressField);
    }
  },
  _getAddress: function () {
    var address = {
      id: 'bldClCd',
      name: 'bldNm',
      text: Tw.POSTCODE_TEXT.BUILDING_CODE,
      value: 'bldTotNum'
    };
    if (this._selectedTabId === 'tab2') {
      address.text = Tw.POSTCODE_TEXT.BUILDING_NUMBER;
      address.value = 'totHouse_numCtt';
    } else if (this._selectedTabId === 'tab3') {
      address.text = Tw.POSTCODE_TEXT.BUILDING_HO;
      address.value = 'staMainHouseNumCtt';
      address.id = 'serNum';
      address.name = 'largDlvPlcNm';
    }
    return address;
  },
  _getNumberOrNameList: function () {
    return [
      { 'attr': 'id="bldCd",key="KEY"', 'text': Tw.POSTCODE_TEXT.NUMBER },
      { 'attr': 'id="bldNm",key="BiLDING"', 'text': Tw.POSTCODE_TEXT.NAME }
    ];
  },
  _setPage: function ($result) {
    this.$fieldSet.removeClass('none');
    if (this._nextPage === 0) {
      this._initPageVariables($result);
    }

    if (this._totalPage > 1) {
      var remainLength = this._totalElements - (this._defaultElementLength * (this._nextPage + 1));
      if (remainLength > 0) {
        this.$remainAddress.text('(' + remainLength + ')');
        this.$remainAddressWrap.removeClass('none');
        this._nextPage++;
      } else {
        this.$remainAddressWrap.addClass('none');
      }
    }
  },
  _initPageVariables: function ($result) {
    this._totalPage = $result.totalPages;
    this._totalElements = $result.totalElements;
  },
  _onSelectDetailAddress: function (event) {
    var $target = $(event.currentTarget);
    if (!$target.hasClass('checked')) {
      $target.addClass('checked').attr('aria-checked', 'true').find('input').attr('checked', 'checked');
      $target.siblings().removeClass('checked').attr('aria-checked', 'false').find('input').removeAttr('checked');
    }
    this.$selectDetailAddress.removeAttr('disabled');
  },
  _getMore: function () {
    if (this._nextPage < this._totalPage) {
      this._requestMoreDetailList();
    }
  },
  _goStep3: function () {
    this._setLastAddress();
    this._history.goHash('#step3-' + this._selectedTabName);
  },
  _setLastAddress: function () {
    var $checkedAddress = this.$loadAddress.find('.checked');
    var $baseForm = this.$container.find('.fe-base-form');
    var _baseText = this.$container.find('#' + this._selectedTabId + '-tab .fe-select-detail').text();

    if (_baseText.includes('(')) {
      _baseText = _baseText.replace(_baseText.split('(')[1], '');
      _baseText = _baseText.replace('(', '');
    }

    $baseForm.find('.fe-post-code').text($checkedAddress.attr('postcode'));
    $baseForm.find('.fe-ho').text($checkedAddress.attr('ho'));

    if ($checkedAddress.attr('dong') !== null && $checkedAddress.attr('dong') !== undefined && $checkedAddress.attr('dong') !== '') {
      _baseText = _baseText + '(' + $checkedAddress.attr('dong') + ')';
    }
    $baseForm.find('.fe-address').text(_baseText + ' ' + $checkedAddress.find('.address1').text());

    if ($checkedAddress.attr('id') === 'A2' || $checkedAddress.attr('id') === 'A3') {
      this.$aptLastField.show();
      this.$etcLastField.hide();
    } else {
      this.$aptLastField.hide();
      this.$etcLastField.show();
    }
  },
  _cancelProcess: function () {
    this._history.cancelProcess();
  },
  _postComplete: function (event) {
    var $target = $(event.target);
    var $form = $target.parents('.tab-contents').find('.fe-last-form');
    var _postCode = $form.find('.fe-post-code').text();
    var _address = $form.find('.fe-address').text();
    var _detailAddress = '';

    var isValid = false;
    if (this.$aptLastField.is(':visible')) {
      isValid = this._checkEmpty(this.$aptLastField);
      _detailAddress = this.$aptLastField.find('input:first').val() + Tw.POSTCODE_TEXT.DONG + ' ' +
        this.$aptLastField.find('input:last').val() + Tw.POSTCODE_TEXT.HO;
    } else {
      isValid  = true;
      _detailAddress = this.$etcLastField.find('input').val();
    }

    if (isValid) {
      Tw.UIService.setLocalStorage('post', [_postCode, _address, _detailAddress]);

      this._history.setHistory();

      var url = '/customer/email/quality/wibro';
      this._history.pushUrl(url);
      this._history.goLoad(url + '?post=success');
    }
  },
  _checkEmpty: function ($target) {
    return (this._validation.checkEmpty($target.find('input:first').val(), Tw.MSG_POSTCODE.L06) &&
      this._validation.checkEmpty($target.find('input:last').val(), Tw.MSG_POSTCODE.L06));
  }
};