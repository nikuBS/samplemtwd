 /**
 * @file 영문 메인 화면에서 앱 버전을 체크하여 기준이 되는 앱버전보다 낮으면 업데이트 페이지(마켓)으로 자동 리다이렉트 한다. 
 * @author 김기남
 * @since 2020.10.26
 */

/**
 * @class
 */
 Tw.MainAppUpdate = function () {
  if (!Tw.BrowserHelper.isApp()) { // 앱이 아니라면 건너 뜀.
    return;
  }

  this._popupService = Tw.Popup;
  this._osType = 'I'; // default iOS,  'A': aos

  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._currentVersion = '';
  this._xRequestedWith = '';

  this._init();
};

Tw.MainAppUpdate.prototype = {
  
  /**
   * @function
   * @desc 
   */
  _init: function () {
    this._apiService.request(Tw.NODE_CMD.GET_ENVIRONMENT, {})
      .done($.proxy(this._onAppUpdateCheck, this));
  },

  /**
   * @function
   * @desc 
   */
  _onAppUpdateCheck: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      var env = result.environment;

      if ( env === 'prd' ) { // 운영 모드 (prd) 일때만 동작 
        var userAgentString = Tw.BrowserHelper.getUserAgent();
        // var userAgentString = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) TWM_APP TWM_DEVICE=osType:ios|appVersion:5.0.18|osVersion:14.2|id:5BA27585-2B6A-4287-8D07-A9CD17DCFB7D|model:iPhone12_3|widget:0';
        var version = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];
        var stdVersion = '';
        var appType = false;
        this._currentVersion = version;

        if (userAgentString.indexOf('osType:aos') !== -1) {
          this._osType = 'A';
          var versionArray = version.split('.')
          if (versionArray[2] % 2 === 0) { // 대문자 
            this._currentVersion = versionArray[0] + '.' + versionArray[1] + '.' + (versionArray[2] * 1 + 1)
          }

          appType = (versionArray[2] % 2 === 0); // true 짝수 앱 랜더, false 홀수 앱 렌더
        } else {
          this._osType = 'I';
        }

        if ( this._osType === 'A' ) { // 안드로이드 기준 버전
          stdVersion = '5.0.20';
        } else { // 아이폰 기준 버전
          stdVersion = '5.0.14';
        }

        var isUpdate = Tw.ValidationHelper.checkVersionValidation(stdVersion, this._currentVersion, 3);
        if( isUpdate ) {
          this._popupService.openConfirmUpdateButton(
            Tw.POPUP_CONTENTS.UPDATE_POPUP_CONTENTS,
            Tw.POPUP_TITLE.UPDATE_POPUP_TITLE, 
            $.proxy(this._onUpdate, this, appType), // 'Update' 버튼을 선택하면 업데이트 화면으로 이동
            $.proxy(this._gotoTworld, this), // 'Go To Tworld KOR' 버튼을 선택하면 국문 메인페이지로 이동
            Tw.BUTTON_LABEL.GO_TO_TWORLD_KOR,
            Tw.BUTTON_LABEL.UPDATE
          );
        }
      }
          
    }
  },

  /**
   * @function
   * @desc 업데이트 버튼 선택시 Android/iOS 각 마켓으로 이동
   */
  _onUpdate: function (appType) {
    //alert(appType)
    var url = '';
    if (Tw.BrowserHelper.isAndroid()) {

      if( appType ) { // true => 짝수 앱 업데이트 페이지로 이동
        url = 'intent://scan/#Intent;package=Com.sktelecom.minit;end';
      } else { // false => 홀수 앱 업데이트 페이지로 이동
        url = 'intent://scan/#Intent;package=com.sktelecom.minit;end';
      }

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
   * @desc 국문 사이트로 이동
   */
  _gotoTworld: function() {
    console.log('[UPDATE POPUP] 국문 사이트로 이동')
    location.href = '/main/home';
  }

};
