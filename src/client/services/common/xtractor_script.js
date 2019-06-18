
/** weblog script js path: ex) /resources/js/script */

//function loadjs(){
//	
////	if(typeof JQuery == 'undefined'){
////		var script = document.createElement('script');
////		script.type = 'text/javascript';
////		script.src = 'https://xtr.tos.sktelecom.com/js/jquery-1.11.3.min.js';
////		document.getElementsByTagName('head')[0].appendChild(script);		//
////
////	}
//
//	var script = document.createElement('script');
//	script.type = 'text/javascript';
//	script.src = 'https://xtr.tos.sktelecom.com/js/xtractor_api.js';
//	//script.src = '/js/xtractor_api.js';
//	document.getElementsByTagName('head')[0].appendChild(script);
//	
//}
//
//loadjs();

/*	if(typeof JQuery != 'undefined'){
		 $(document).ready(function() {
				
				$("form").each(function() {
					$(this).submit(function(event) {
						localStorage.setItem("XTMETHOD", $(this).attr("method").toUpperCase());
						localStorage.setItem("XTPARAM", "?"+$(this).serialize());
					});
				});

			});
	}*/

//setTimeout(function(){
//	 
//	 $(document).ready(function() {
//			
//			$("form").each(function() {
//				$(this).submit(function(event) {
//					localStorage.setItem("XTMETHOD", $(this).attr("method").toUpperCase());
//					localStorage.setItem("XTPARAM", "?"+$(this).serialize());
//				});
//			});
//
//		});
//
//	 }, 200);

var xtr = "";

//var xtrScriptPath = "/js";
//var xtrScriptPath = "https://xtr.tos.sktelecom.com/js";

var GVHOST_STR = '';


var vid = 'XTVID';
var sid = 'XTSID';
var lid = 'XTLID';
var rid = 'XTRID';
var loginid = 'XTLOGINID';
//var newLid = 'XTNEWLID';

var xtrChk = "false";

var hostIdx = 0;
var innerHostArray = new Array();
innerHostArray.push('tworld.co.kr');
innerHostArray.push('sktelecom.com');
innerHostArray.push('sktmembership.co.kr');
innerHostArray.push('skt0.co.kr');
innerHostArray.push('younghandong.com');


makeXTVIDCookie();
makeSESSIONIDCookie();
makeRefererCookie();

function makeXTVIDCookie() {
	if (!existCookie(vid)) {
		setXTVIDCookie(vid);
	}
}

function getRefererDomain(referer){
	
	if (typeof referer != "undefined"){
		referer = referer.replace("https://", "");
		referer = referer.replace("http://", "");
		if(referer.indexOf("/") > -1){
			referer = referer.substring(0,referer.indexOf("/"));
		}
		return referer;
	}
}


function makeRefererCookie() {
	try {
		var referer = document.referrer;
		if (typeof referer != "undefined"){
			var isInnerHost = false;
			for ( var int = 0; int < innerHostArray.length; int++) {
				var innerHost = innerHostArray[int];
				if(referer.indexOf(innerHost) > -1){
					isInnerHost = true;
				}
			}
			if(!isInnerHost){
				var refererDomain = getRefererDomain(referer);	
				if (typeof refererDomain != "undefined"){
					document.cookie = rid + "=" + refererDomain + ";" + "path=/;domain=" + getXDomain();
				}
			}
		}		
	} catch (e) {
	}
}




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


function makeXTLIDCookie(value) {
	if (!existCookie(lid)) {
		setXTLIDCookie(lid, value);
	}
}


function existCookie(name) {
	var vid = getXTCookie(name);
	if (vid != null && vid != "") {
		return true;
	}
	return false;
}


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


function setXTVIDCookie(name) {
	var randomid = Math.floor(Math.random() * 1000);

	var xtvid = "A" + makeXTVIDValue() + randomid;
	/** /var xtvid = makeXTVIDValue() + randomid; */
	expireDate = new Date();
	expireDate.setYear(expireDate.getYear() + 10);
	setXTCookie(name, xtvid, 365 * 10, "/", getXDomain());
}

function setXTSIDCookie(name) {
	var randomid = Math.floor(Math.random() * 1000);

	var xtvid = "A" + makeXTVIDValue() + randomid;
	/** var xtvid = makeXTVIDValue() + randomid; */
	expireDate = new Date();
	expireDate.setYear(expireDate.getYear() + 10);

	setXTCookie(name, xtvid, -1, "/", getXDomain());
}

try {
	var pcX = screen.width;
	var pcY = screen.height;
	var xloc = pcX+"X";
	xloc += pcY;
	setXTCookie("xloc", xloc, 365 * 10, "/", getXDomain());
} catch (e) {
}



function setXTLIDCookie(name, value) {
	setXTCookie(name, value, -1, "/", getXDomain());
}

function removeXTCookie(name) {
	setXTCookie(name, "", 0, "/", getXDomain());
}

function setXTCookie(name, value, expires, path, domain) {
	var todayDate = new Date();
	todayDate.setDate(todayDate.getDate() + expires);
	var expiresInfo = (expires < 0) ? '' : todayDate.toGMTString();
	document.cookie = name + "=" + escape(value) + ";" + "path=" + path	+ ";domain=" + domain + ";expires=" + expiresInfo;
}

function getXDomain() {
	var host = document.domain;
	var hostIp = host.replace(/\./g, "");

	if(!isNaN(hostIp) == true) {
		return host;
	} else {
		var tokens = host.split('.');
		var xdomain = tokens[tokens.length - 2] + '.' + tokens[tokens.length - 1];
		var newXdomain = (tokens[tokens.length - 1].length == 2) ? tokens[tokens.length - 3] + '.' + xdomain : xdomain;
		
		newXdomain = newXdomain.replace("undefined.","");
		return newXdomain;
	}
}

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

function paddingNo(val) {
	var st = '';
	if (val <= 9) {
		st += '0' + val;
	} else {
		st = '' + val;
	}
	return st;
}

//makeXTVIDCookie();
/** makeSESSIONIDCookie(); */

var getContextPath = function() {
	var offset=location.href.indexOf(location.host)+location.host.length;
	var ctxPath=location.href.substring(offset,location.href.indexOf('/',offset+1));

	return ctxPath;
};

var _ConntectInfo = (function() {
	
	var info = [ 'xtr.tos.sktelecom.com', '443', GVHOST_STR, 'api', '0','NaPm,Ncisy', 'ALL', '0' ];
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
//var _ApiConnectJSLoad = (function() {
//	var G = _ConntectInfo;
//	if (G.len != 0) {
//		var _A = G.val[G.len - 1];
//		var _G = (_A[0]).substr(0, _A[0].indexOf('.'));
//		var _C = (_A[7] != '0') ? (_A[2]) : _A[3];
//		var _U = (_A[5]).replace(/\,/g, '_');
//		var _S = (([ '<scr', 'ipt', 'type="text/javascr', 'ipt"></scr', 'ipt>' ])
//				.join('')).replace('tt', 't src="' + xtrScriptPath + '/xtractor_' + _C + '.js?gc='
//				+ _A[2] + '&py=' + _A[4] + '&gd=' + _G + '&gp=' + _A[1]
//				+ '&up=' + _U + '&rd=' + (new Date().getTime()) + '" t');
//		document.writeln(_S);
//		return _S;
//	}
//})();

function scriptValueGet(O, T) {
	for (var i = 0; i < O.val.length; i++) {
		var _AR = O.val[i];
/** if (_AR[3] == T) { */
			return O.val[i];
/**		} */
		;
	}
}

function apiConnect(errParam) {

	if (typeof (_ConntectInfo) == 'object') {
		var ciValue = scriptValueGet(_ConntectInfo, 'Api');
		var _UD = 'undefined';
		if (typeof (ciValue) != _UD) {
			var _GUL = ciValue[0];
			var _GPT = ciValue[1];
			var _GVHOST = ciValue[2];
			var _gU = '/xtractor/userScript/UserInfoGet?';
			var _rf = document.referrer;
			var _DC = document.cookie;
			function _NIM() {
				return new Image();
			}
			
			var _AIU = _NIM();
			
			function _IL(a) {
				return a != _UD ? a.length : 0;
			}
			function _UL(a) {
				a = _LST(a, '#');
				a = _CST(a, '://');
				if (a.length > 512) {
					a = a.substring(0, 511);
				}
				;
				return a;
			}
			function _PT() {
				return "https://" + _GUL;
				//return "http://" + _GUL;
				// return location.protocol == "https:" ? "https://" + _GUL : "http://" + _GUL + ":" + _GPT;
			}
			function _PL(a, uid) {
				
				_rf = _rf.replace("http://", "");
				_rf = _rf.replace("https://", "");
				
				if (_rf.substring(_rf.length-1, _rf.length) == "/") {
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
					
					try{
						var lsParam = localStorage.getItem("XTPARAM");
						var lsParamStr = lsParam;
						if(a.indexOf("?") != -1){
							a += "&"+lsParamStr;
						}else{
							a += "?"+lsParamStr;
						}
						
					}catch(e){}
					//a += localStorage.getItem("XTPARAM");
					localStorage.removeItem("XTPARAM");
				}
				if ( localStorage.getItem("XTMETHOD") != null ) {
					method = localStorage.getItem("XTMETHOD");
					localStorage.removeItem("XTMETHOD");
				}
				
				a = encodeURIComponent(a);
				var srcUrl = _arg + "&url=" + a;
				
				if (_rf != "") {
					srcUrl += "&ref=" + encodeURIComponent(encodeURIComponent(_rf));
					//srcUrl += "&ref=" + _rf;
					
//					for ( var int = 0; int < innerHostArray.length; int++) {
//						var innerHost = innerHostArray[int];
//						if(referer.indexOf(innerHost) > -1){
//							srcUrl += "&ref=" + encodeURIComponent(_rf);
//						}else{
//							srcUrl += "&ref=" + _rf;							
//						}
//					}
					
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
				setTimeout("", 300);
			}
			try{
/**				var fp = new Fingerprint2(getFPOptions()); */
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
/**				fp.get(function(result) {
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
	xtrChk = "true";

}

apiConnect();

function ScriptApi(Param) {

	if (typeof (_ConntectInfo) == 'object') {
		var ciValue = scriptValueGet(_ConntectInfo, 'Api');
		var _UD = 'undefined';
		if (typeof (ciValue) != _UD) {
			var _GUL = ciValue[0];
			var _GPT = ciValue[1];
			var _GVHOST = ciValue[2];
			var _gU = '/xtractor/userScript/UserInfoGet?';
			var _rf = document.referrer;
			var _DC = document.cookie;
			function _NIM() {
				return new Image();
			}
			
			var _AIU = _NIM();
			
			function _IL(a) {
				return a != _UD ? a.length : 0;
			}
			function _UL(a) {
				a = _LST(a, '#');
				a = _CST(a, '://');
				if (a.length > 512) {
					a = a.substring(0, 511);
				}
				;
				return a;
			}
			function _PT() {
				return "https://" + _GUL;
				//return "http://" + _GUL;
				// return location.protocol == "https:" ? "https://" + _GUL : "http://" + _GUL + ":" + _GPT;
			}
			function _PL(a, uid) {
				
				_rf = _rf.replace("http://", "");
				_rf = _rf.replace("https://", "");
				
				if (_rf.substring(_rf.length-1, _rf.length) == "/") {
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
					
//					a += localStorage.getItem("XTPARAM");
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
				setTimeout("", 300);
			}
			
			try{
/**				var fp = new Fingerprint2(getFPOptions()); */
				var url = "";
				//var url = document.URL.replace("http://", "");
				//url = url.replace("https://", "");
				
				if(typeof Param != "undefined") {	
					if(url.indexOf("?") == -1){
						//url.replace("?[object Arguments]", "");
						url= Param;
					}
				}
				
				_PL(url, "");
/**				fp.get(function(result) {
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


//$(document).ready(function() {
//	
//	$("form").each(function() {
//		$(this).submit(function(event) {
//			localStorage.setItem("XTMETHOD", $(this).attr("method").toUpperCase());
//			localStorage.setItem("XTPARAM", "?"+xtr(this).serialize());
//		});
//	});
//	
//	/*
//	 * jquery Ajax default setting
//	 */
//
//});

/*
 * XMLHttpRequest Ajax default setting
 */

_sendAjax = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
    if (arguments[0] != null) {
    	//localStorage.setItem("XTPARAM", "?"+arguments);
    	localStorage.setItem("XTPARAM", arguments[0]);
    	
    }
    //apiConnect();
 
    //try{
    _sendAjax.apply(this, arguments);
    //}catch(e){
    	//console.log(e);
    //}
};

_openAjax = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
	
	if (arguments[0] != null) {
    	localStorage.setItem("XTMETHOD", arguments[0]);
    }
	
	_openAjax.apply(this, arguments);
};


function new_callCSScript(E_ID, ACTION) {     
	 
    var URI = location.protocol + "//www.tworld.co.kr/global/xtractor/CSDummy";
    var v_id = GetCookie('XTVID'); 
    var l_id = GetCookie('XTLID'); 
    var u_id = "";                 
    if(l_id != "")					
    {
    	u_id = GetCookie('XTUID');  
    	if(u_id !="")				
    	{
    		l_id = u_id;
    	}     	
    }     
    var PARAMS = "V_ID=" + v_id + "&L_ID=" + l_id + "&E_ID=" + E_ID + "&CS_ID=&P_ID=&ACTION="+ACTION;   
    var ajax = new AJAX();
    URI = URI+"?"+PARAMS+"&_dt="+Math.floor(new Date().getTime()/1000); 
    ajax.sendRequest("GET", URI, false, null, PARAMS);
}

var AJAX = function() {
	var request = null;
	this.sendRequest = sendRequest;
	if (window.XMLHttpRequest) {
		request = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
		request = new ActiveXObject("MSXML2.XMLHTTP");
		if (!request) {
			request = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	function sendRequest(reqType, url, asynch, action, queryString) {
		//request.onreadystatechange = action;  // CallBack
		request.open(reqType, url, asynch);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charaset=UTF-8");
		request.send(queryString);
	}
}

var XtractorError = {
		
};

XtractorError.sendError = function(ex) {
	
	var msg = encodeURIComponent("JavaScript-"+ex.message);
	msg = msg.replace(/ /g, "_");
	
	
	var dd = ex.stack.split("\n");
	var errorLine = "";
	if(dd.length>0){
		var r =dd[1];
		errorLine = encodeURIComponent(r);
	}
	
	var xtrUrl = document.URL;
	
	if(xtrUrl.indexOf("?")>0){
		xtrUrl +="&";
	}else{
		xtrUrl +="?";
	}	
	ScriptApi(xtrUrl+"ErrMsg="+ msg + "&ErrLine="+errorLine);	
	//xtr.getJSON(xtrUrl+"ErrMsg="+ msg);
};

var XtractorEvent = {
		
};

XtractorEvent.xtrEvent = function(Parameter) {
	
//	var param = encodeURIComponent(Parameter);
	var param = Parameter.replace(/ /g, "_");
	
	var domain = window.location.host;
	var xtrUrl = domain+"/eventDummy";
	
	if(xtrUrl.indexOf("?")>0){
		xtrUrl +="&";
	}else{
		xtrUrl +="?";
	}	
	ScriptApi(xtrUrl+param);	
};


var XtractorScript = {
		
};


XtractorScript.xtrLoginDummy = function(Parameter) {

	//var param = encodeURIComponent(Parameter);
	var param = Parameter.replace(/ /g, "_");
	
	var domain = window.location.host;
	var xtrUrl = domain+"/loginDummy";
	
	if(xtrUrl.indexOf("?")>0){
		xtrUrl +="&";
	}else{
		xtrUrl +="?";
	}	
	ScriptApi(xtrUrl+param);
};

XtractorScript.xtrCSDummy = function(E_ID, CS_ID, ACTION) {

	var eid = E_ID.replace(/ /g, "_");

	var csid = CS_ID.replace(/ /g, "_");

	var action = null;
	if(ACTION) {
		action = ACTION.replace(/ /g, "_");
	}

	var domain = window.location.host;

	var xtrUrl = domain+"/csDummy";
	
	if(xtrUrl.indexOf("?")>0){
		xtrUrl +="&";
	}else{
		xtrUrl +="?";
	}
		
	if(action != null){
		ScriptApi(xtrUrl+"E_ID="+ eid + "&CS_ID="+csid + "&ACTION="+action);			
	}else{
		ScriptApi(xtrUrl+"E_ID="+ eid + "&ACTION="+csid);
	}
};


XtractorScript.xtrSns = function(prodID, SNS) {

	//var pid = encodeURIComponent(prodID);
	var pid = prodID.replace(/ /g, "_");

	//var tw = encodeURIComponent(SNS);
	var tw = SNS.replace(/ /g, "_");
	
	var domain = window.location.host;
	var xtrUrl = domain+"/snsDummy";
	
	if(xtrUrl.indexOf("?")>0){
		xtrUrl +="&";
	}else{
		xtrUrl +="?";
	}	
	ScriptApi(xtrUrl+"PROD_ID="+ pid + "&SNS="+tw);	
};

XtractorScript.xtrOrder = function(pid, cnt, type, grade, age, gender) {

	var domain = window.location.host;
	var xtrUrl = domain+"/orderDummy";
	
	if(xtrUrl.indexOf("?")>0){
		xtrUrl +="&";
	}else{
		xtrUrl +="?";
	}	
	ScriptApi(xtrUrl+"P_ID="+ pid +"&CNT="+cnt+"&TYPE="+type+"&GRADE="+grade+"&AGE="+age+"&GENDER="+gender);	
};



function postParam(){ 
	var forms = document.getElementsByTagName("form");
	if(typeof forms !== "undefined") {
		for ( var int = 0; int < forms.length; int++) {
			var getForm = forms[int];
			var oriSubmit = getForm.submit;
			getForm.submit = function(e) {
				localStorage.setItem("XTMETHOD", 'POST');
				var formData = [];
				var elem = this.elements;
				var postParamStr = "";
				for(var i=0; i<elem.length; i++) {
					var name = elem[i].name;
					var value = elem[i].value;
					formData.push(name + '=' + value);
					if(i > 0){
						postParamStr += "&";
					}
					postParamStr += name + "=" + value;
				}
				localStorage.setItem("XTPARAM", postParamStr);
				oriSubmit.apply(this);
			};
		}
	}
	
}

var ready = function(){
	postParam();
};

if(document.readyState == 'complete' ) ready();
else if(document.addEventListener) {
	ready();
}
else document.attachEvent('onreadystatechange', function() { 
	if(document.readyState === 'complete') ready();
});


