/** WebLog 통계용 스크립트 START **/

/** weblog script js path: ex) /resources/js/script */
var xtrScriptPath = "/js";
var GVHOST_STR = 'Tworld-App';

/** XTVID 쿠키 존재여부를 확인하여 없을 경우 쿠키를 생성한다. */
var vid = 'XTVID';
var sid = 'XTSID';
var lid = 'XTLID';
var newLid = 'XTNEWLID';


/** XTVID쿠키 확인 */
function makeXTVIDCookie() {
  if (!existCookie(vid)) {
    setXTVIDCookie(vid);
  }

  if (existCookie(lid)) {
    var loginId = getXTCookie(lid);
    /** var url = '<scr'+'ipt src=\"/xtractor/loginDummy.do?V_ID=' + getXTCookie(vid) + '&L_ID=' + loginId + '&ct=' + Math.round(new Date().getTime() / (1000*60)) + '\"><\/script>';
     console.log(url);
     document.write(url); */
    $.get('/xtractor/loginDummy.do?V_ID=' + getXTCookie(vid) + '&LOGIN_ID=' + loginId + '&ct=' + Math.round(new Date().getTime() / (1000*60)));
    removeXTCookie(lid);
    setXTLIDCookie(newLid, loginId);
  }
}

/** XTSID쿠키 확인 */
function makeSESSIONIDCookie() {
  var xtsidExpire = 30;
  var xtrTodayDate = new Date();
  xtrTodayDate.setMinutes(xtrTodayDate.getMinutes() + xtsidExpire);
  var expiresInfo = xtrTodayDate.toUTCString();
  if (!existCookie(sid)) {
    var randomid = Math.floor(Math.random() * 1000);
    var xtsid = "A" + makeXTVIDValue() + randomid;
    document.cookie = sid + "=" + xtsid + ";" + "path=/;domain=" + getXDomain() + ";expires=" + expiresInfo;
  } else {
    document.cookie = sid + "=" + getXTCookie(sid) + ";" + "path=/;domain=" + getXDomain() + ";expires=" + expiresInfo;
  }

}

/** XTSID쿠키 확인 */
function makeXTLIDCookie(value) {
  if (!existCookie(lid)) {
    setXTLIDCookie(lid, value);
  }
}

/** 쿠키가 존재하는지 확인한다. */
function existCookie(name) {
  var vid = getXTCookie(name);
  if (vid != null && vid != "") {
    return true;
  }
  return false;
}

/** 주어진 이름의 쿠키값을 얻는다. */
function getXTCookie(name) {
  var cookies = document.cookie.split("; ");
  for ( var i = 0; i < cookies.length; i++) {
    var cPos = cookies[i].indexOf("=");
    var cName = cookies[i].substring(0, cPos);
    if (cName == name) {
      return unescape(cookies[i].substring(cPos + 1));
    }
  }
// a cookie with the requested name does not exist
  return "";
}

/** XTVID 쿠키를 생성한다. */
function setXTVIDCookie(name) {
  /** 3자리 난수 발생 */
  var randomid = Math.floor(Math.random() * 1000);

  /** XTVID =  웹서버 식별문자 (A...Z ) 한자리  + yymmdd (쿠키생성일자)  + hhmmss (쿠키생성시각)  +  MMM (쿠키 생성시각 1/1000 초) + RRR (난수) */
  var xtvid = "A" + makeXTVIDValue() + randomid;
  /** /var xtvid = makeXTVIDValue() + randomid; */
  expireDate = new Date();
  expireDate.setYear(expireDate.getYear() + 10);

  setXTCookie(name, xtvid, 365 * 10, "/", getXDomain());
}

/** XTSID 쿠키를 생성한다. */
function setXTSIDCookie(name) {
  /** 3자리 난수 발생 */
  var randomid = Math.floor(Math.random() * 1000);

  /** XTVID =  웹서버 식별문자 (A...Z ) 한자리  + yymmdd (쿠키생성일자)  + hhmmss (쿠키생성시각) +  MMM (쿠키 생성시각 1/1000 초) + RRR (난수) */
  var xtvid = "A" + makeXTVIDValue() + randomid;
  /** var xtvid = makeXTVIDValue() + randomid; */
  expireDate = new Date();
  expireDate.setYear(expireDate.getYear() + 10);

  setXTCookie(name, xtvid, -1, "/", getXDomain());
}

/* 해상도 분석 시작 */
try {
  var pcX = screen.width;
  var pcY = screen.height;
  var xloc = pcX+"X";
  xloc += pcY;
  setXTCookie("xloc", xloc, 365 * 10, "/", getXDomain());
} catch (e) {
}
/* 해상도 분석 끝 */


/** XTLID 쿠키를 생성한다. */
function setXTLIDCookie(name, value) {
  setXTCookie(name, value, -1, "/", getXDomain());
}

/** XTLID 쿠키를 삭제한다. */
function removeXTCookie(name) {
  setXTCookie(name, "", 0, "/", getXDomain());
}

/** 주어진 조건으로 쿠키를 생성한다. */
function setXTCookie(name, value, expires, path, domain) {
  var todayDate = new Date();
  todayDate.setDate(todayDate.getDate() + expires);
  var expiresInfo = (expires < 0) ? '' : todayDate.toGMTString();
  document.cookie = name + "=" + escape(value) + ";" + "path=" + path + ";domain=" + domain + ";expires=" + expiresInfo;
}

/** 쿠키생성을 위한 도메인을 얻는다. */
function getXDomain() {
  var host = document.domain;
  var hostIp = host.replace(/./g, "");

  if(!isNaN(hostIp) == true) {
    return host;
  } else {
    var tokens = host.split('.');
    var xdomain = tokens[tokens.length - 2] + '.' + tokens[tokens.length - 1];
    var newXdomain = (tokens[tokens.length - 1].length == 2) ? tokens[tokens.length - 3] + '.' + xdomain : xdomain;

    return 'A' + newXdomain;
  }
}

/** XTVID 값을 생성한다. */
function makeXTVIDValue() {
  var str = '';
  nowdate = new Date();
  digit = nowdate.getFullYear();
  if (digit < 2000) {
    digit = digit - 1900;
  } else {
    digit = digit - 2000;
  }
  str += paddingNo(digit);

  digit = nowdate.getMonth() + 1;
  str += paddingNo(digit);

  digit = nowdate.getDate();
  str += paddingNo(digit);

  digit = nowdate.getHours();
  str += paddingNo(digit);

  digit = nowdate.getMinutes();
  str += paddingNo(digit);

  digit = nowdate.getSeconds();
  str += paddingNo(digit);

  digit = nowdate.getMilliseconds();
  if ((digit <= 99) && (digit > 9)) {
    str += '0' + digit;
  } else if (digit <= 9) {
    str += '00' + digit;
  } else {
    str += '' + digit;
  }
  return str;
}

/** 10보다 작은 숫자에 '0'을 채워 리턴한다. */
function paddingNo(val) {
  var st = '';
  if (val <= 9) {
    st += '0' + val;
  } else {
    st = '' + val;
  }
  return st;
}

/** XTVID 쿠키생성 호출 */
makeXTVIDCookie();
/** makeSESSIONIDCookie(); */

/** WebLog 통계용 스크립트 END **/
var getContextPath = function() {
  var offset=location.href.indexOf(location.host)+location.host.length;
  var ctxPath=location.href.substring(offset,location.href.indexOf('/',offset+1));

  return ctxPath;
};

var _ConntectInfo = (function() {
  /** apiServer의 ip, port, site구분값(?), script버전, ?, ?, ?, ? */
  var info = [ 'xtr.tos.sktelecom.com', '80', GVHOST_STR, 'api', '0','NaPm,Ncisy', 'ALL', '0' ];
//var info = [ '150.19.43.204:8080', '8080', GVHOST_STR, 'api', '0','NaPm,Ncisy', 'ALL', '0' ];
  var _CI = (!_ConntectInfo) ? [] : _ConntectInfo.val;
  var _N = 0;
  var _T = new Image(0, 0);
  if (_CI.join('.').indexOf(info[3]) < 0) {
    _CI.push(info);
    _N = _CI.length;
  }

  return {
    len : _N,
    val : _CI
  };
})();

// var _ApiConnectJSLoad = (function() {
//   var G = _ConntectInfo;
//   if (G.len !== 0) {
//     var _A = G.val[G.len - 1];
//     var _G = (_A[0]).substr(0, _A[0].indexOf('.'));
//     var _C = (_A[7] != '0') ? (_A[2]) : _A[3];
//     var _U = (_A[5]).replace(/\,/g, '_');
//     var _S = (([ '<scr', 'ipt', 'type="text/javascr', 'ipt"></scr', 'ipt>' ])
//       .join('')).replace('tt', 't src="' + xtrScriptPath + '/xtractor_' + _C + '.js?gc='
//       + _A[2] + '&py=' + _A[4] + '&gd=' + _G + '&gp=' + _A[1]
//       + '&up=' + _U + '&rd=' + (new Date().getTime()) + '" t');
//     document.writeln(_S);
//     return _S;
//   }
// })();

window.onload = function() {
  $("form").each(function() {
    $(this).submit(function(event) {
      localStorage.setItem("XTMETHOD", $(this).attr("method").toUpperCase());
      localStorage.setItem("XTPARAM", "?"+$(this).serialize());
    });
  });
};

// /*
// * form submit 파라미터 셋팅 관련
// */
//
// $(document).ready(function() {
//   $("form").each(function() {
//     $(this).submit(function(event) {
//       localStorage.setItem("XTMETHOD", $(this).attr("method").toUpperCase());
//       localStorage.setItem("XTPARAM", "?"+$(this).serialize());
//     });
//   });
//   /*
//   * jquery Ajax default setting
//   */
// });



/*
* XMLHttpRequest Ajax default setting
*/

_sendAjax = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function() {
  if (arguments[0] != null) {
    localStorage.setItem("XTPARAM", "?"+arguments);
  }
  //apiConnect(); // 20180919 kwakrhk blocked
  _sendAjax.apply(this, arguments);
};

_openAjax = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function() {
  if (arguments[0] != null) {
    localStorage.setItem("XTMETHOD", arguments[0]);
  }
  _openAjax.apply(this, arguments);
};

var XtractorError = {
};

XtractorError.sendError = function(ex) {

  var msg = encodeURIComponent("JavaScript-"+ex);
  msg = msg.replace(/ /g, "_");

  var xtrUrl = document.URL;

  if(xtrUrl.indexOf("?")>0){
    xtrUrl +="&";
  }else{
    xtrUrl +="?";
  }
  apiConnect("ErrMsg="+ msg);
  //$.getJSON(xtrUrl+"ErrMsg="+ msg);
}