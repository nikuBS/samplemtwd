class BrowserHelper {
  /**
   * @desc 사용자 디바이스가 안드로이드 인지 여부
   * @returns {boolean}
   * @public
   */
  static isAndroid(req): boolean {
    return req.useragent.isAndroid;
  }

  /**
   * @desc 사용자 디바이스가 ios 인지 여부
   * @returns {boolean}
   * @public
   */
  static isIos(req): boolean {
    return req.useragent.isiPhone || req.useragent.isiPad || req.useragent.isiPod;
  }

  /**
   * @desc 사용자 디바이스가 모바일인지 여부
   * @returns {boolean}
   * @public
   */
  static isMobile(req): boolean {
    return req.useragent.isMobile;
  }

  /**
   * @desc 앱인지 여부
   * @returns {boolean}
   * @public
   */
  static isApp(req): boolean {
    return /TWM_APP/i.test(req.useragent.source);
  }

  /**
   * @desc 온라인 여부
   * @returns {boolean}
   * @public
   */
  static isOnline(req): boolean {
    return true;
  }

  /**
   * @desc getter 
   * @returns {string}
   * @public
   */
  static getUserAgent(req): boolean {
    return req.useragent.source;
  }
}

export default BrowserHelper;
