/**
 * @class
 * @param $container - 컨테이너 레이어
 * @param isTosBanner - TOS 배너 여부
 */
Tw.TrackerService = function(){
    if(this.constructor.caller !== Tw.TrackerService.newInstance){
        throw "Create Instance Error";
    }

    this._apiService = Tw.Api;
    this._nativeService = Tw.Native;
    this._params = null;
    this._isInit = false;

    this._bindEvents();
    if(Tw.Environment.init){
        this._initTrackerApi()
    }else{
        $(window).on(Tw.INIT_COMPLETE, $.proxy(this._initTrackerApi ,this));
    }
};

Tw.TrackerService.newInstance = (function(){
    var instance = null;
    return function(){
        if(!instance){
            instance = new Tw.TrackerService();
        }
        return instance;
    }
})();

Tw.TrackerService.prototype = $.extend(Tw.TrackerService.prototype, {

    _bindEvents: function(){
        $('body').on('click', '[data-tracker="C"]', $.proxy(this.clickTracker, this));
    },
    /**
     * @function
     * @desc
     * @private
     */
    _initTrackerApi: function () {
      if ( !Tw.BrowserHelper.isApp() ) {  // App 환경에서만 동작
        return;
      }
  
      this._nativeService.send(Tw.NTV_CMD.GET_ADID, {}, $.proxy(this._sendTrackerApi, this));
    //   setTimeout($.proxy(this._sendTrackerApi, this, {
    //       resultCode: Tw.NTV_CODE.CODE_00,
    //       params: {
    //           adid: "test1"
    //       }
    //     }), 500);
    },

    /**
     * @function
     * @desc
     * @public
     */
    clickTracker: function(e){
        var $elm = $(e.currentTarget);


        if(this._isInit){
            this._clickTracker(e.currentTarget)
        }else{
            $(this).on('init', $.proxy(this._clickTracker ,this, e.currentTarget));
        }

    },

    _clickTracker: function(elm){
        var $elm = $(elm);

        var url    = Tw.Environment.environment !== 'prd' ? Tw.TRACKER_API.targetUrl.development : Tw.TRACKER_API.targetUrl.production;
        var params = $.extend(this._getTrackerData($elm[0]), {action: 'CLICK'});
        $elm.attr('data-tracked', 'true');
        //console.info('tracker extend click : ' , url + '?' + $.param(params));
        Tw.CommonHelper.sendRequestImg(url + '?' + $.param(params));
    },

    /**
     * @function
     * @desc
     * @public
     */
    scanTracker: function(){
        var $elms = $('[data-tracker="V"]');
        var $elm = null;
        var url    = Tw.Environment.environment !== 'prd' ? Tw.TRACKER_API.targetUrl.development : Tw.TRACKER_API.targetUrl.production;

        for(var i = 0 ; i < $elms.size(); i++){

            if($elms.eq(i).attr("data-tracked") == 'true'){
                continue;
            }
            $elm = $elms.eq(i);
            var params = $.extend(this._getTrackerData($elm[0]), {action: 'VIEW'});
            $elm.attr('data-tracked', 'true');
            //console.info('tracker extend : ' , url + '?' + $.param(params));
            Tw.CommonHelper.sendRequestImg(url + '?' + $.param(params));

        }
    },

    /**
     * @function
     * @desc
     * @param res
     * @private
     */
    _sendTrackerApi: function (res) {
      if ( res.resultCode !== Tw.NTV_CODE.CODE_00 || Tw.FormatHelper.isEmpty(res.params.adid) ) {
        return;
      }
  
      var url    = Tw.Environment.environment !== 'prd' ? Tw.TRACKER_API.targetUrl.development : Tw.TRACKER_API.targetUrl.production,
          params = {
            site: Tw.TRACKER_API.siteId,
            platform: 1,
            ua: navigator.userAgent,
            page: location.href
          };
  
      if ( location.referrer && !Tw.FormatHelper.isEmpty(location.referrer) ) {
        params.referer = location.referrer;
      }
  
      if ( screen && screen.width && screen.height ) {
        params.res = screen.width + 'x' + screen.height;
      }
  
      if ( Tw.BrowserHelper.isAndroid() ) {
        params.adid = res.params.adid;
      }
  
      if ( Tw.BrowserHelper.isIos() ) {
        params.idfa = res.params.idfa;
      }

      this._params = params;
      //console.info('tracker : ' , url + '?' + $.param(params));
  
      Tw.CommonHelper.sendRequestImg(url + '?' + $.param(params));
      this._isInit = true;
      $(this).trigger('init');
      this.scanTracker()
    },
    _getTrackerData: function(elm){
        var $elm = $(elm);
        return $.extend( 
            elm.getAttributeNames().filter(function(nm){
                return nm != 'data-tracker' && nm.indexOf('data-tracker') > -1;
            }).map(function(nm){
                var key = nm.replace('data-tracker_', '');
                return {
                    key: key,
                    value : $elm.attr(nm)
                }
            }).reduce(function(p, n){
                p[n.key.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); })] = n.value;
                return p;
            }, {})
        , this._params);
    },
	newInstance: Tw.TrackerService.newInstance
});