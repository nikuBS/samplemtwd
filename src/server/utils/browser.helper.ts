class BrowserHelper {
  static isMobile(req): boolean {
    return req.useragent.isMobile;
  }
}

export default BrowserHelper;
