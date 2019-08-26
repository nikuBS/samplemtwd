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

  this.$container = rootEl;
  this._osType = 'I'; // default iOS,  'A': aos


  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

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
      if(Tw.ValidationHelper.checkVersionValidation(latestVersion, this._currentVersion, 3)) {
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
          url = 'intent://scan/#Intent;package='+ this._xRequestedWith.replace(' ', '').replace('.qa', '') +';end';
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
    this._nativeService.send(Tw.NTV_CMD.GO_CERT, {});
    return false;
  },
  _onWidgetSettingClicked: function () {
    this._nativeService.send(Tw.NTV_CMD.WIDGET_SETTING, { type: 0 });
  }
};
