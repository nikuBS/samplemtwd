
import StringHelper from '../utils/string.helper';
import {SVC_ATTR_NAME, LINE_SVC_ATTR_ICO_FILE_NM} from '../types/bff.type';

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
    for (const key in cookies) {
      if (cookies.hasOwnProperty(key) && key.indexOf(preFix) === 0) {
        res.clearCookie(key);
      }
    }
  }

  /**
   * OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
   * 회선선택 영역에 출력될 데이터를 생성한다.
   * @param {Object} svcInfo
   */
  static addCurLineInfo(svcInfo) {
    svcInfo.lineNickNm = ['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1 ? SVC_ATTR_NAME[svcInfo.svcAttrCd] : svcInfo.nickNm;
    svcInfo.add = ['S1', 'S2'].indexOf(svcInfo.svcAttrCd) === -1 ? StringHelper.phoneStringToDash(svcInfo.svcNum) : svcInfo.addr;
    svcInfo.ico = LINE_SVC_ATTR_ICO_FILE_NM[svcInfo.svcAttrCd];
  }
}

export default CommonHelper;
