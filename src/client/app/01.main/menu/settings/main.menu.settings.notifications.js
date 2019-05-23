/**
 * @file T 알림 설정 화면 관련 처리
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.10.08
 */

/**
 * @class
 * @param  {Object} rootEl - 최상위 element
 */
Tw.MainMenuSettingsNotifications = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._termsAgreed = {
    twdAdRcvAgreeYn: false,
    twdInfoRcvAgreeYn: false,
    twdLocUseAgreeYn: false
  };

  this._init();
  this._bindEvents();
};

Tw.MainMenuSettingsNotifications.prototype = {

  /**
   * @function
   * @desc device의 notification on/off 여부 확인하여 안내 영역 노출 결정
   */
  _init: function () {
    // check which terms is agreed
    var $agreedTerms = this.$container.find('.fe-term.checked');
    for (var i = 0; i < $agreedTerms.length; i++) {
      this._termsAgreed[$agreedTerms[i].dataset.key] = true;
    }

    // check if it is from device and notification settings is on
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_PERMISSION, {
        type: 'notification'
      }, $.proxy(function (res) {
        if (res.resultCode === Tw.NTV_CODE.CODE_00 && res.params.permission !== 1) {
          // Show notification guide when device notification settings is off
          this.$container.find('.fe-device-noti').removeClass('none');
        }
      }, this));
    }
  },
  _bindEvents: function () {
    this.$container.on(
      'change', '#fe-chk-service, #fe-chk-recommend, #fe-chk-tplace', $.proxy(this._onNotiChanged, this));
    this.$container.on(
      'click', '#fe-service-terms, #fe-recommend-terms, #fe-tplace-terms', $.proxy(this._onTermsClicked, this));
    this.$container.on('click', '#fe-go-device-noti', $.proxy(this._onDeviceNotiClicked, this));
    this.$container.on('click', '#fe-kidding', $.proxy(this._onKidding, this));
    this.$container.on('click', '#fe-tplace-list', $.proxy(this._onOpenTplaceListClick, this));
  },

  /**
   * @function
   * @desc 각각의 notification 설정이 바뀌는 경우 BFF로 변경된 설정 요청
   * @param  {Object} e click event
   */
  _onNotiChanged: function (e) {
    var id = e.currentTarget.id;
    var checked = !!$(e.currentTarget).attr('checked');
    var data = {};
    if (id.indexOf('service') !== -1) {
      data.tNotiInfoRcvAgreeYn = checked ? 'Y' : 'N';
    } else if (id.indexOf('recommend') !== -1) {
      data.tNotiMrktRcvAgreeYn = checked ? 'Y' : 'N';
    } else if (id.indexOf('tplace') !== -1) {
      data.tplaceUseAgreeYn = checked ? 'Y' : 'N';
    }

    this._apiService.request(Tw.API_CMD.BFF_03_0024, data)
      .done($.proxy(function (res) {
        if (res.code !== Tw.API_CODE.CODE_00) {
          this._onFailChangingNoti(id, res);
        } else {
          this._onNotiChangedSucceed(id, checked);
        }
      }, this))
      .fail($.proxy(this._onFailChangingNoti, this, id)
    );
  },

  /**
   * @function
   * @desc notification 설정 변경이 성공했을 경우 하위 약관 중 미동의 항목 있을 경우 action sheet로 약관 노출
   * @param  {String} id - 선택한 notification id
   * @param  {Boolean} checked - 선택한 약관의 on/off 여부
   */
  _onNotiChangedSucceed: function (id, checked) {
    // check and show layer popup for terms
    if (checked) { // When switch changes to on from off, show layer popup for detail settings
      if (id.indexOf('service') !== -1) {
        if (!this._termsAgreed.twdAdRcvAgreeYn || !this._termsAgreed.twdInfoRcvAgreeYn) {
          this.$container.find('#fe-service-terms').trigger('click'); // show terms layer popup
        }
      } else if (id.indexOf('recommend') !== -1) {
        if (!this._termsAgreed.twdAdRcvAgreeYn || !this._termsAgreed.twdInfoRcvAgreeYn ||
            !this._termsAgreed.twdLocUseAgreeYn) {
          this.$container.find('#fe-recommend-terms').trigger('click');
        }
      } else if (id.indexOf('tplace') !== -1) {
        if (!this._termsAgreed.twdInfoRcvAgreeYn || !this._termsAgreed.twdLocUseAgreeYn) {
          this._isTplaceSwitchedToOn = true;
          this.$container.find('#fe-tplace-terms').trigger('click');
        } else {
          this._sendTplaceTermsToNative(checked, checked);
        }
      }
    } else if (id.indexOf('tplace') !== -1) {
      this._sendTplaceTermsToNative(checked, checked);
    }
  },

  /**
   * @function
   * @desc BFF 요청 실패시 라디오버튼 다시 복구
   * @param  {String} id - notification 항목 id
   * @param  {Object} err - BFF 로 부터 잔달받은 error object
   */
  _onFailChangingNoti: function (id, err) {
    var $switch = $('#' + id).closest('.btn-switch');
    if ($switch.hasClass('on')) {
      $switch.removeClass('on');
    } else {
      $switch.addClass('on');
    }

    Tw.Error(err.code, err.msg).pop();
  },

  /**
   * @function
   * @desc 약관 클릭시 레이어 팝업으로 약관 노출
   * @param  {Object} e click event
   */
  _onTermsClicked: function (e) {
    var id = e.target.id;
    this._popupService.open({
      hbs: 'HO_04_01_02_01',
      layer: true
    },
    $.proxy(this._onTermsOpened, this, id),
    $.proxy(function () { //close callback
      if (!this._isTermsClosedByConfirmed) { // X 버튼으로 팝업 닫힌 경우 확인하여 tplace 관련 내용 native로 전송
        if (!!this._isTplaceSwitchedToOn) {
          this._sendTplaceTermsToNative(true, true);
        }
        delete this._isTermsClosedByConfirmed;
        delete this._isTplaceSwitchedToOn;
      }
    }, this));
  },

  /**
   * @function
   * @desc 약관 layouer popup 관련 처리
   * @param  {String} id - 약관 ID
   * @param  {Object} $root - 레이어팝업의 최상위 elem
   */
  _onTermsOpened: function (id, $root) {
    //init
    $root.find('input[type=checkbox]').map($.proxy(function (i, elem) {
      if (this._termsAgreed[elem.value]) {
        $(elem).attr('checked', 'checked');
      }
    }, this));

    if (id.indexOf('service') !== -1) {
      $root.find('.fe-location').addClass('none');
    } else if (id.indexOf('tplace') !== -1) {
      $root.find('.fe-ad').addClass('none');
    }

    //event
    var changedTerms = {};
    $root.on('change', 'input[type=checkbox]', $.proxy(function (e) {
      if (this._termsAgreed[e.target.value] !== e.target.checked) {
        changedTerms[e.target.value] = e.target.checked;
      } else {
        delete changedTerms[e.target.value];
      }
    }, this));
    $root.on('click', '#fe-confirm', $.proxy(this._onTermsConfirmed, this, changedTerms));
    $root.on('click', '.fe-view', $.proxy(function (e) {
      var code = e.currentTarget.value;
      Tw.CommonHelper.openTermLayer2(code);
    }, this));
  },

  /**
   * @function
   * @desc 선택한(동의한) 약관을 BFF로 갱신 요청
   * @param  {Array} terms - 선택된 약관의 array
   */
  _onTermsConfirmed: function (terms) {
    this._isTermsClosedByConfirmed = true;
    this._popupService.close();

    if (Tw.FormatHelper.isEmpty(terms)) {
      if (!!this._isTplaceSwitchedToOn) {
        this._sendTplaceTermsToNative(true, true);
      }
      delete this._isTplaceSwitchedToOn;
      delete this._isTermsClosedByConfirmed;
      return;
    }

    var data = _.mapObject(terms, function (val) {
      return val ? 'Y' : 'N';
    });

    this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
      .done($.proxy(this._onSuccessTerms, this, terms))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },

  /**
   * @function
   * @desc BFF에 변경 요청한 약관이 성공일 경우 화면 갱신
   * @param  {Array} terms - 선택(변경)한 약관 array
   */
  _onSuccessTerms: function (terms) {
    this.$container.find('.fe-term').each(function (i, elem) {
      if (terms.hasOwnProperty(elem.dataset.key)) {
        if (terms[elem.dataset.key]) {
          $(elem).addClass('checked');
          $(elem).find('.agree').text(Tw.COMMON_STRING.AGREE);
        } else {
          $(elem).removeClass('checked');
          $(elem).find('.agree').text(Tw.COMMON_STRING.DISAGREE);
        }
      }
    });
    for (var key in terms) {
      this._termsAgreed[key] = terms[key];
    }

    if (terms.twdInfoRcvAgreeYn !== undefined || terms.twdLocUseAgreeYn !== undefined) {
      var tplaceOn = !!this.$container.find('#fe-chk-tplace').attr('checked');
      var tplaceSwitchedToOn = !!this._isTplaceSwitchedToOn;
      this._sendTplaceTermsToNative(tplaceOn, tplaceSwitchedToOn);
    }
    delete this._isTplaceSwitchedToOn;
    delete this._isTermsClosedByConfirmed;
  },

  /**
   * @function
   * @desc 기기 notification 알림영역 선택시 native 설정으로 이동시킴
   */
  _onDeviceNotiClicked: function () {
    this._nativeService.send(Tw.NTV_CMD.OPEN_SETTINGS, {
      type: 'notification'
    });
  },

  /**
   * @function
   * @desc tplace 관련 약관 동의 여부를 native 로 전송
   * @param  {Boolean} isTplaceOn - tplace 동의 여부
   * @param  {Boolean} isTplaceSwitchedToOn - tplace 동의 여부
   */
  _sendTplaceTermsToNative: function (isTplaceOn, isTplaceSwitchedToOn) {
    this._nativeService.send(Tw.NTV_CMD.TPLACE_TERMS, {
      tplace: isTplaceOn,
      location: this._termsAgreed.twdLocUseAgreeYn,
      private: this._termsAgreed.twdInfoRcvAgreeYn,
      isTplaceOn: isTplaceSwitchedToOn
    });
  },

   // To remove
   _onKidding: function () {
    if (!this._kiddingCount || this._kiddingCount === 0) {
      this._kiddingCount = 1;
    }

    if (this._timer) {
      clearTimeout(this._timer);
    }

    this._kiddingCount += 1;
    if (this._kiddingCount === 10) {
      this.$container.find('#fe-tplace-div').removeClass('none');
      return;
    }

    this._timer = setTimeout($.proxy(function () {
      this._kiddingCount = 0;
    }, this), 500);
  },

  /**
   * @function
   * @desc 대상 매장 보기 버튼 클릭시 - tplace 매장 리스트 팝업을 출력함.
   */
  _onOpenTplaceListClick: function(){
    this._historyService.goLoad('/main/menu/settings/tplaces');
  }
};
