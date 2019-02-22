class BrowserHelper {
  static isAndroid(req): boolean {
    return req.useragent.isAndroid;
  }

  static isIos(req): boolean {
    return req.useragent.isiPhone || req.useragent.isiPad || req.useragent.isiPod;
  }

  static isMobile(req): boolean {
    return req.useragent.isMobile;
  }

  static isApp(req): boolean {
    return /TWM_APP/i.test(req.useragent.source);
  }

  static isOnline(req): boolean {
    return true;
  }

  static getUserAgent(req): boolean {
    return req.useragent.source;
  }
}

export default BrowserHelper;
