class CommonHelper {

  static getPaging (uri: string, itemLengthPerPage: number, pagesetLength: number, curPage: number, total: number): any {
    const startNum = (Math.floor((curPage - 1) / pagesetLength) * pagesetLength) + 1;
    const totalPage = Math.ceil((total / itemLengthPerPage));
    const totalPageset = Math.ceil(totalPage / pagesetLength);
    const currentPageset = Math.floor((curPage - 1) / pagesetLength) + 1;

    const endNum = currentPageset < totalPageset ? startNum + pagesetLength - 1 : totalPage;
    const prevPageIdx = currentPageset > 0 ? ((currentPageset - 1) * pagesetLength) : null;
    const nextPageIdx = totalPageset > currentPageset ? (currentPageset * pagesetLength) + 1 : null;
    const needPaging = total > itemLengthPerPage;

    return {
      needPaging,
      uri,
      startNum,
      endNum,
      curPage,
      total,
      prevPageIdx,
      nextPageIdx,
      totalPage
    };
  }

  /**
   * 특정 문자열이 포함된 cookie를 삭제한다.
   * @param req 
   * @param res 
   * @param preFix 
   */
  static clearCookieWithPreFix(req, res, preFix) {
    const cookies = req.cookies;
    let key;

    for (key in cookies) {
      if (key.indexOf(preFix) === 0) {
        res.clearCookie(key);
      }
    }
  }
}

export default CommonHelper;
