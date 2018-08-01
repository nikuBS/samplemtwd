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
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PostcodeMain.prototype = {
  _initVariables: function () {
    this._cityList = [];
    this._gunList = [];
    this._detailList = [];
    this._cityCode = null;
    this._gunCode = null;
    this._nextPage = 1;
    this._totalPage = 0;
    this._totalElements = 0;
    this._id = null;
    this._defaultElementLength = 20;
    this.$citySelector = this.$container.find('.fe-select-city');
    this.$gunSelector = this.$container.find('.fe-select-gun');
    this.$getPostCodeBtn = this.$container.find('.fe-get-postcode');
    this.$fieldSet = this.$container.find('.fe-field-set');
    this.$loadAddress = this.$container.find('.fe-load-address');
    this.$buildingName = this.$container.find('.fe-building-name');
    this.$standardAddress = this.$container.find('#fe-standard-address-field');
    this.$remainAddressWrap = this.$container.find('.fe-remain-address-wrap');
    this.$remainAddress = this.$container.find('.fe-remain-address');
    this.$selectDetailAddress = this.$container.find('.fe-go-step3');
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-load-name', $.proxy(this._activeButton, this));
    this.$container.on('click', '.fe-select-city', $.proxy(this._getList, this, this._cityList, Tw.API_CMD.BFF_01_0006, {}));
    this.$container.on('click', '.fe-select-gun', $.proxy(this._getSecondList, this));
    this.$container.on('click', '.fe-get-postcode', $.proxy(this._getPostCode, this));
    this.$container.on('click', '.fe-select-detail', $.proxy(this._getDetailList, this));
    this.$container.on('click', '.fe-get-building-name', $.proxy(this._getMoreDetailList, this, 'btn'));
    this.$container.on('click', '.fe-remain-address-wrap', $.proxy(this._getMore, this));
    this.$container.on('click', '.fe-go-step3', $.proxy(this._goStep3, this));
  },
  _activeButton: function (event) {
    var $value = $(event.currentTarget).val();
    if ($value.length > 1) {
      this.$getPostCodeBtn.removeClass('disabled');
    } else {
      this.$getPostCodeBtn.addClass('disabled');
    }
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
  _getPostCode: function () {
    var _selectedTabId = this.$container.find('.tab-linker li[aria-selected="true"]').attr('id');
    var $api = this._getApiName(_selectedTabId);
    if (this._isValid(_selectedTabId)) {
      var requestData = this._makePreRequestData(_selectedTabId);
      this._apiService.request($api, requestData)
        .done($.proxy(this._getPostSuccess, this, _selectedTabId))
        .fail($.proxy(this._getPostFail, this));
    }
  },
  _getApiName: function (_selectedTabId) {
    var $api = Tw.API_CMD.BFF_01_0008;
    if (_selectedTabId === 'tab2') {
      $api = Tw.API_CMD.BFF_01_0010;
    } else if (_selectedTabId === 'tab3') {
      $api = Tw.API_CMD.BFF_01_0009;
    }
    return $api;
  },
  _makePreRequestData: function (_selectedTabId) {
    var _searchValue = this.$container.find('#' + _selectedTabId + '-tab .fe-search-value');
    var reqData = {
      searchValue: encodeURI($.trim(_searchValue.val()))
    };
    if (_selectedTabId === 'tab1' || _selectedTabId === 'tab3') {
      reqData.dongCd = this._gunCode;
    }
    return reqData;
  },
  _getPostSuccess: function (_selectedTabId, res) {
    var $detailSelector = this.$container.find('#' + _selectedTabId + '-tab .fe-select-detail');
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.length > 0) {
        this._detailList = this._setList($detailSelector, this._detailList, res.result);
        this._initAddress($detailSelector);
        this._history.goHash('#step2-load');
      } else {
        this._getPostFail();
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
    } else if ($target.hasClass('fe-select-number-detail')) {
      obj.id = 'stNmCd';
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

    this._setSuperCode($target, $id);
    this._popupService.close();
  },
  _setSuperCode: function ($target, $id) {
    if ($target.hasClass('fe-select-city')) {
      this._cityCode = $id;
    } else if ($target.hasClass('fe-select-gun')) {
      this._gunCode = $id;
    } else {
      this._id = $id;
      this._getMoreDetailList();
    }
  },
  _initDetailAddress: function (type) {
    this._nextPage = 1;
    this.$container.find('.fe-add-address').remove();
    if (!this.$remainAddressWrap.hasClass('none')) {
      this.$remainAddressWrap.addClass('none');
    }
    if (type === undefined) {
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
    var reqData = {
      postType: 'B',
      stNmCd: this._id,
      page: this._nextPage
    };
    if (this.$buildingName.val() !== '') {
      reqData.bldMainNum = $.trim(this.$buildingName.val());
    }
    return reqData;
  },
  _getMoreDetailList: function (type) {
    this._initDetailAddress(type);
    this._requestMoreDetailList();
  },
  _getDetailSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $result = res.result.bldgAddress;
      this._setPage($result);

      var $content = $result.content;
      for (var i = 0; i < $content.length; i++) {
        var $addressField = this.$standardAddress.clone().removeAttr('id').removeClass('none').addClass('fe-add-address');
        $addressField.find('.address1').text($content[i].bldNm);
        $addressField.find('.address2').text(Tw.POSTCODE_TEXT.BUILDING_CODE + ' ' + $content[i].bldTotNum);
        $addressField.find('.address3').text(Tw.POSTCODE_TEXT.ZIP_CODE + ' ' + $content[i].zip);
        $addressField.on('click', $.proxy(this._onSelectDetailAddress, this));
        this.$loadAddress.append($addressField);
      }
    }
  },
  _getDetailFail: function () {

  },
  _setPage: function ($result) {
    this.$fieldSet.removeClass('none');
    if (this._nextPage === 1) {
      this._initPageVariables($result);
    }

    if (this._totalPage > 1) {
      var remainLength = this._totalElements - (this._defaultElementLength * this._nextPage);
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
    if (this._nextPage <= this._totalPage) {
      this._requestMoreDetailList();
    }
  },
  _isValid: function (_selectedTabId) {
    var isValid = false;
    var _searchValue = this.$container.find('#' + _selectedTabId + '-tab .fe-search-value');
    if (_selectedTabId === 'tab2') {
      isValid = this._validation.checkMoreLength(_searchValue.val(), 2, Tw.MSG_POSTCODE.L03);
    } else {
      isValid = (this._validation.checkIsSelected(this.$citySelector, Tw.MSG_POSTCODE.L01) &&
        this._validation.checkIsSelected(this.$gunSelector, Tw.MSG_POSTCODE.L02) &&
        this._validation.checkMoreLength(_searchValue.val(), 2, Tw.MSG_POSTCODE.L03));
    }
    return isValid;
  },
  _goStep3: function () {
    this._history.goHash('#step3');
  }
};