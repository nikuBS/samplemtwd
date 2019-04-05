/**
 * FileName: common.cert.public-export.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.11
 */

Tw.CommonCertPublicExport = function (rootEl, signgateHost, signgatePort) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;

  this._init(signgateHost, signgatePort);
  this._bindEvent();
};

Tw.CommonCertPublicExport.prototype = {
  _init: function (signgateHost, signgatePort) {
    // Bridge server info
    // For test: 61.250.20.204:9014
    // For product: relay.signgate.com:443

    this.g_SMPServerIP = signgateHost;
    this.g_SMPServerPort = parseInt(signgatePort, 10);
    this.g_SMPNewApp = 1;

    // 해쉬 알고리즘
    this.g_HashAlg = 'SHA1';
  },
  _bindEvent: function () {
    this.$container.on('click', 'button', $.proxy(this._onStart, this));
  },
  _onStart: function () {
    var dn = '';

    this._setCommonInfoFromVal();

    // Bridge server setting
    	var ret = document.KicaAX.SetCommonInfoFromServerInfo(this.g_SMPServerIP, this.g_SMPServerPort);
    	if( ret !== 0 ) {
        return;
      }

    	ret = document.KicaAX.SetCommonInfoFromNewApp(this.g_SMPNewApp);
    	if( ret !== 0 ) {
        return;
      }

    	// 번호 8 세팅 (인증서 내보내기 세팅)
    	// (실패시 내부적으로 오류메시지 출력)
    	dn = document.KicaAX.SG_init_user(9, '');

    	if (dn === '' || dn == null )  {
        return;
      }

      this._popupService.openAlert(Tw.POPUP_CONTENTS.CERTIFICATE_SUCCESS);
  },
  _setCommonInfoFromVal: function () {
  	var CA_IP1	= 'ca.signgate.com';
  	var CA_IP2	= 'ldap.signgate.com';
  	var SG_CN	= 'CN=ROOT-RSA-CRL,OU=ROOTCA,O=KISA,C=KR';

  	// 해당 OID 세팅(사이트 별 인증서 정책에 따라 허용하는 인증서 세팅)
  	var POLICIES= '1.2.410.200004.5.2.1.2|1.2.410.200004.5.2.1.1|1.2.410.200004.5.1.1.5|1.2.410.200004.5.1.1.7|' +
      '1.2.410.200005.1.1.1|1.2.410.200005.1.1.5|1.2.410.200004.5.3.1.9|1.2.410.200004.5.3.1.2|1.2.410.200004.5.3.1.1|' +
      '1.2.410.200004.5.4.1.1|1.2.410.200004.5.4.1.2|1.2.410.200012.1.1.1|1.2.410.200012.1.1.3';

  	// 해당 OID만 허용하고 싶다면 아래 파라미터 "yes" -> "no" 로 설정
  	document.KicaAX.SetCommonInfoFromVal(CA_IP1, 4502, CA_IP2, 389, CA_IP2, 389, SG_CN, 'yes', POLICIES );
  }
};