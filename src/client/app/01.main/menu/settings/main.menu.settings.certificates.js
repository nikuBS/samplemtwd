/**
 * @file 공인인증센터 화면 처리
 * @author Tonyspark
 * @since 2018-10-02
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 */
Tw.MainMenuSettingsCertificates = function (rootEl) {
  if (!Tw.BrowserHelper.isApp()) {
    return;
  }

  this._popupService = Tw.Popup;

  this.$container = rootEl;
  this._osType = 'I'; // default iOS,  'A': aos


  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._currentVersion = '';
  this._xRequestedWith = '';

  this._init();
  this._bindEvents();
};

Tw.MainMenuSettingsCertificates.prototype = {

  /**
   * @function
   * @desc 현재 버전 정보 설정 및 단말 지원범위에 따른 인증메뉴 설정
   */
  _init: function () {
    this._onCertificates();
  },
  _bindEvents: function () {

    this.$container.on('click', '.prev-step', $.proxy(function () {
      window.location.replace('/main/menu/settings');
    }, this));

    this.$container.on('click', '.btn-style1', $.proxy(function () {
      this._onUpdate(); // 업데이트 안내 페이지 이동
    }, this));
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
  _onCertificates: function () {
    // 최신버전 체크 
    // 1. 조건 최신버전 == 현재버전 => 네이티브 호출 
    // 2. 최신버전이 아니면 App 업데이트 안내 페이지 호출 

    // 업데이트 안내 페이지 팝업 
    // this._popupService.open({
    //   hbs: 'MA_03_01_02_03_01_01'
    // }, $.proxy(this._onUpdatePopup, this));

    this._apiService.request(Tw.NODE_CMD.GET_VERSION, {})
      .done($.proxy(this._lastestVersionPopup, this));
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
        return;

      } else { // 최신버전 
        // 네이티브 페이지 이동 
        window.location.replace('/main/menu/settings');
        this._nativeService.send(Tw.NTV_CMD.GO_CERT, {}); // 기존 네이티브 페이지 이동 
      }
    }
  },

};
