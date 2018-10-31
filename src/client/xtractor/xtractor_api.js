function scriptValueGet(O, T)
{
  for (var i = 0; i < O.val.length; i++) {
    var _AR = O.val[i];
    /** if (_AR[3] == T) { */
    return O.val[i];
    /**  } */
  }
}
function apiConnect(errParam) {
  if (typeof (_ConntectInfo) === 'object') {
    var ciValue = scriptValueGet(_ConntectInfo, 'Api');
    var _UD = 'undefined';

    if (typeof (ciValue) !== _UD) {
      var _GUL = ciValue[0];
      var _GPT = ciValue[1];
      var _GVHOST = ciValue[2];
      var _gU = '/userScript/userScript/UserInfoGet?';
      var _rf = document.referrer;
      var _DC = document.cookie;
      function _NIM() {
        return new Image();
      }

      var _AIU = _NIM();

      function _IL(a) {
        return a !== _UD ? a.length : 0;
      }

      function _UL(a) {
        a = _LST(a, '#');
        a = _CST(a, '://');
        if (a.length > 512) {
          a = a.substring(0, 511);
        }

        return a;
      }

      function _PT() {
        return "https://" + _GUL;
        // return location.protocol == "https:" ? "https://" + _GUL : "http://" + _GUL + ":" + _GPT;
      }

      function _PL(a, uid) {
        _rf = _rf.replace("http://", "");
        _rf = _rf.replace("https://", "");

        if (_rf.substring(_rf.length-1, _rf.length) === "/") {
          _rf = _rf.substring(0,_rf.length-1);
        }

        _arg = _PT() + _gU;
        if (typeof _ERR != _UD && _ERR == 'err') {
          _arg = _PT() + _gE;
        }
        ;

        var hs = "200";
        if (typeof errorStatus != "undefined"){
          hs = errorStatus;
        }

        var method = "GET";
        if ( localStorage.getItem("XTPARAM") != null ) {
          a += localStorage.getItem("XTPARAM");
          localStorage.removeItem("XTPARAM");
        }

        if ( localStorage.getItem("XTMETHOD") != null ) {
          method = localStorage.getItem("XTMETHOD");
          localStorage.removeItem("XTMETHOD");
        }

        a = encodeURIComponent(a);

        var srcUrl = _arg + "&url=" + a;

        if (_rf != "") {
          srcUrl += "&ref=" + _rf;
        }

        srcUrl += "&req_type=xml" + "&ua="+encodeURIComponent(navigator.userAgent) + "&dc=" + encodeURIComponent(document.cookie) + "&xtuid=" +uid + "&httpstatus="+hs +"&method="+method;

        srcUrl += "&gvhost="+_GVHOST;
        _AIU.src = srcUrl;
        /** _AIU.src = _arg + "&url=" + escape("script."+a) + "&ref=" + escape(_rf) +
         "&req_type=xml" + "&ua="+navigator.userAgent + "&dc=" + document.cookie +
         "&xtuid=" +uid + "&httpstatus="+hs;
         _AIU.src = _arg + "&url=" + escape("script."+a) + "&ref=" + escape(_rf) +
         "&dc=" + _DC + "&req_type=xml" + "&ua="+navigator.userAgent;
         console.log(_AIU.src);
         for(var i=0; i<_AIU.src.split("&").length; i++) {
console.log(_AIU.src.split("&")[i]);
} */
        setTimeout(function() {}, 300);
      }
      try{
        /**    var fp = new Fingerprint2(getFPOptions()); */
        var url = document.URL.replace("http://", "");
        url = url.replace("https://", "");


        if(typeof errParam != "undefined") {
          if(url.indexOf("?") == -1){
            url+= "?" + errParam;
          }else{
            url+= "&" + errParam;
          }
        }


        _PL(url, "");
        /**    fp.get(function(result) {
     _PL(url, result);
     if(typeof window.console !== "undefined") {
      console.log("finger: " + result);
    }
    }); */
      }catch(e){
        _PL(url, 'FP_ERROR');
        if(typeof window.console !== "undefined") {
          console.log(e);
        }
      }
    }
  }
}

apiConnect();

function getFPOptions() {
  var optionsValue = {
    excludeUserAgent: false,
    excludeLanguage: false,
    excludeColorDepth: true,
    excludePixelRatio: true,
    excludeScreenResolution: true,
    excludeAvailableScreenResolution: true,
    excludeTimezoneOffset: false,
    excludeSessionStorage : true,
    excludeIndexedDB : true,
    excludeAddBehavior : true,
    excludeOpenDatabase : true,
    excludeCpuClass: false,
    excludePlatform: false,
    excludeDoNotTrack: true,
    excludeCanvas : true,
    excludeWebGL: true,
    excludeAdBlock: true,
    excludeHasLiedLanguages: true,
    excludeHasLiedResolution: true,
    excludeHasLiedOs: true,
    excludeHasLiedBrowser: true,
    excludeJsFonts: true,
    excludeFlashFonts: true,
    excludePlugins: true,
    excludeIEPlugins: true,
    excludeTouchSupport: true
  };

  return optionsValue;
}
