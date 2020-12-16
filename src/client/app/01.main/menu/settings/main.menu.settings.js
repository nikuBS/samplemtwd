/**
 * @file 설정메뉴 화면 처리
 * @author Hakjoon Sim
 * @since 2018-10-02
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 */
Tw.MainMenuSettings = function (rootEl, xRequestedWith) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this._popupService = Tw.Popup;

  this.$container = rootEl;
  this._osType = 'I'; // default iOS,  'A': aos


  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._historyService = new Tw.HistoryService();

  this._currentVersion = '';
  this._xRequestedWith = xRequestedWith;

  this._cacheElements();
  this._init();
  this._bindEvents();
};

Tw.MainMenuSettings.prototype = {
  _cacheElements: function () {
    this.$versionText = this.$container.find('#fe-version');
    this.$updateBox = this.$container.find('#fe-update-box');
  },

  /**
   * @function
   * @desc 현재 버전 정보 설정 및 단말 지원범위에 따른 인증메뉴 설정
   */
  _init: function () {
    this._setVersionInfo();
    // Set FIDO type
    this._nativeService.send(Tw.NTV_CMD.FIDO_TYPE, {}, $.proxy(function (resp) {
      if (resp.resultCode === Tw.NTV_CODE.CODE_00) {
        this.$container.find('#fe-bio-link').attr('href', '/main/menu/settings/biometrics?target=finger');
      } else if (resp.resultCode === Tw.NTV_CODE.CODE_01) {
        this.$container.find('#fe-bio-link').attr('href', '/main/menu/settings/biometrics?target=face');
      } else {
        this.$container.find('#fe-bio').addClass('none');
      }
    }, this));
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-go-certificates', $.proxy(this._onCertificates, this));
    this.$container.on('click', '#fe-btn-update', $.proxy(this._onUpdate, this));
    this.$container.on('click', '#fe-widget', $.proxy(this._onWidgetSettingClicked, this));
  },

  /**
   * @function
   * @desc 현재 버전 확인하고 최신버전 조회
   */
  _setVersionInfo: function () {
    var userAgentString = Tw.BrowserHelper.getUserAgent();
    var version = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];
    this.$versionText.text(version);
    this._currentVersion = version;

    if (userAgentString.indexOf('osType:aos') !== -1) {
      this._osType = 'A';
      var versionArray = version.split('.');
      if (versionArray[2] % 2 === 0) { // 대문자
        version = versionArray[0] + '.' + versionArray[1] + '.' + (versionArray[2] * 1 + 1);
      }
      this._currentVersion = version;
    }

    this._apiService.request(Tw.NODE_CMD.GET_VERSION, {})
      .done($.proxy(this._onLatestVersion, this));
  },

  /**
   * @function
   * @desc 최신버전 조회 결과와 현재 버전 비교하여 '최신' 노출할지 업데이트 버튼 노출할지 처리
   * @param  {Object} res 최신버전 조회 결과
   */
  _onLatestVersion: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var currentOsType = this._osType;
      var versionInfo = _.filter(res.result.ver, function (item) {
        return item.osType === currentOsType;
      });
      var latestVersion = versionInfo[0].newVer;
      if (Tw.ValidationHelper.checkVersionValidation(latestVersion, this._currentVersion, 3)) {
        // if (latestVersion > this._currentVersion) {
        this.$updateBox.removeClass('none');
        this.$versionText.removeClass('point');
      } else {
        this.$versionText.text(Tw.SETTINGS_MENU.LATEST + ' ' + this.$versionText.text());
      }

      if (this._isWidgetNotSupported(currentOsType)) { // 위젓 설정 지원하지 않는 app버전일 경우 해당 메뉴 숨김
        this.$container.find('#fe-widget').parent().addClass('none');
      }
    }
  },

  /**
   * @function
   * @desc osType에 따라 widget 설정 지원여부 판단하여 return
   * @param  {String} osType - 'A': android, 'I': iOS
   * @returns true - 위젯 설정 지원하지 않음, false - 위젯 설정 지원함
   */
  _isWidgetNotSupported: function (osType) {
    switch (osType) {
      case 'A':
        return Tw.ValidationHelper.checkVersionValidation('5.0.4', this._currentVersion, 3);
      case 'I':
        return Tw.ValidationHelper.checkVersionValidation('5.0.5', this._currentVersion, 3);
      default:
        return true;
    }
  },

  /**
   * @function
   * @desc 업데이트 버튼 선택시 Android/iOS 각 마켓으로 이동
   */
  _onUpdate: function () {
    var url = '';
    if (Tw.BrowserHelper.isAndroid()) {
      url = 'intent://scan/#Intent;package=com.sktelecom.minit;end';

      if (!Tw.FormatHelper.isEmpty(this._xRequestedWith)) {
        url = 'intent://scan/#Intent;package=' + this._xRequestedWith.replace(' ', '').replace('.qa', '') + ';end';
      }
    } else if (Tw.BrowserHelper.isIos()) {
      url = 'https://itunes.apple.com/kr/app/%EB%AA%A8%EB%B0%94%EC%9D%BCtworld/id428872117?mt=8';
    }

    if (!Tw.FormatHelper.isEmpty(url)) {
      this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
        type: Tw.NTV_BROWSER.EXTERNAL,
        href: url
      });
    }
  },

  /**
   * @function
   * @desc 공인인증서 선택시 native 화면 호출
   */
  _onCertificates: function (e) {
    e.preventDefault();
    // 최신버전 체크 
    // 1. 조건 최신버전 == 현재버전 => 네이티브 호출 
    // 2. 최신버전이 아니면 App 업데이트 안내 페이지 호출 

    // 업데이트 안내 페이지 팝업 
    // this._popupService.open({
    //   hbs: 'MA_03_01_02_03_01_01'
    // }, $.proxy(this._onUpdatePopup, this));

    // 공인인증서 메뉴 진입 점검 Alert
    var nowDate = Tw.DateHelper.getDateCustomFormat('YYYYMMDDHHmmss');
    this._apiService
      .request(Tw.API_CMD.BFF_01_0069, {property: 'menu.cert.time'})
          .done($.proxy(function(resTime) {
            var resTime = resTime.result.split('~');
            var start_block_datetime = resTime[0];
            var end_block_datetime = resTime[1];
            if (nowDate >= start_block_datetime && nowDate <= end_block_datetime) {
              this._popupService.openAlert(
                '서비스 점검 중 입니다.</br>점검 작업 중 서비스가 차단되어 이용하실 수 없습니다.<br>▶점검 일시:' + Tw.DateHelper.getFullDateAnd24Time(start_block_datetime) + '~' + Tw.DateHelper.getFullDateAnd24Time(end_block_datetime) + '<br>※ 해당 작업은 상황에 따라서 변경 될 수 있습니다.',
                '',
                Tw.BUTTON_LABEL.CONFIRM,
                null,
                'menu_free_sms_overhaul'
              );
              return;
            } else {
              this._apiService.request(Tw.NODE_CMD.GET_VERSION, {})
                 .done($.proxy(this._lastestVersionPopup, this));
            }
          }, this))
          .fail(function(err) {
              
          });
  },

  _onWidgetSettingClicked: function () {
    this._nativeService.send(Tw.NTV_CMD.WIDGET_SETTING, { type: 0 });
  },

  _lastestVersionPopup: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {

      var userAgentString = Tw.BrowserHelper.getUserAgent();
      var version = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];
      this._currentVersion = version;

      if (userAgentString.indexOf('osType:aos') !== -1) {
        this._osType = 'A';
        var versionArray = version.split('.')
        if (versionArray[2] % 2 === 0) { // 대문자 
          this._currentVersion = versionArray[0] + '.' + versionArray[1] + '.' + (versionArray[2] * 1 + 1)
        }
      } else {
        this._osType = 'I';
      }
      var currentOsType = this._osType;
      var versionInfo = _.filter(res.result.ver, function (item) {
        return item.osType === currentOsType;
      });
      var latestVersion = versionInfo[0].newVer;
      // console.log(latestVersion, this._currentVersion);// 5.0.10 > 5.0.9
      if (Tw.ValidationHelper.checkVersionValidation(latestVersion, this._currentVersion, 3)) { // 이전버전 
        // // 업데이트 안내 페이지 팝업 
        this._popupService.open({
          hbs: 'MA_03_01_02_03_01_01'
        }, $.proxy(this._onUpdatePopup, this));

        return;

      } else { // 최신버전 
        // 네이티브 페이지 이동 
        this._nativeService.send(Tw.NTV_CMD.GO_CERT, {}); // 기존 네이티브 페이지 이동 
      }
    }
  },

  _onUpdatePopup: function ($popupContainer) {
    // 업데이트 화면 이동 
    $popupContainer.on('click', '.btn-style1', $.proxy(function () {
      this._onUpdate(); // 업데이트 안내 페이지 이동
    }, this));
    // 취소 버튼 이전 화면 이동 
    $popupContainer.on('click', '.prev-step', $.proxy(function () {
      this._historyService.goBack();
    }, this));
  }



};
