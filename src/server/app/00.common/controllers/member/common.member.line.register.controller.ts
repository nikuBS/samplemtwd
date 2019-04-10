/**
 * @file common.member.line.register.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.20
 * @desc 공통 > 회선등록
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { LINE_NAME, SVC_ATTR_E, SVC_ATTR_NAME } from '../../../../types/bff.type';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';

/**
 * @desc 공통 - 회선등록 초기화를 위한 class
 */
class CommonMemberLineRegister extends TwViewController {
  private pageNo = 1;

  constructor() {
    super();
  }

  /**
   * 회선등록 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const type = req.query.type || '01';
    const landing = req.query.landing || 'none';

    this.getLineInfo().subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        this.pageNo = this.pageNo + 1;
        const lineData = {
          data: this.parseLineInfo(resp.result),
          type: type,
          totalCnt: resp.result.totalCnt
        };
        res.render('member/common.member.line.register.html', { lineData, svcInfo, pageInfo, landing });
      } else {
        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }
    });
  }

  /**
   * 회선 데이터 요청
   */
  getLineInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0029, {
      svcCtg: LINE_NAME.ALL,
      pageSize: DEFAULT_LIST_COUNT,
      pageNo: this.pageNo
    });
  }

  /**
   * 회선 데이터 파싱
   * @param lineList
   */
  parseLineInfo(lineList) {
    const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    let list = [];
    category.map((line) => {
      if ( !FormatHelper.isEmpty(lineList[LINE_NAME[line]]) ) {
        list = list.concat(this.convLineData(lineList[LINE_NAME[line]], LINE_NAME[line]));
      }
    });
    return list;
  }

  /**
   * 회선 데이터 화면에 나타내는 데이터로 변경
   * @param lineData
   * @param type
   */
  convLineData(lineData, type) {
    FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    const result = <any>[];
    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR_NAME[line.svcAttrCd];
      line.showSvcScrbDtm = DateHelper.getShortDateNoDot(line.svcScrbDt);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR_NAME[line.svcAttrCd] : line.nickNm;
      line.showPet = type === LINE_NAME.MOBILE;
      line.showDetail = type === LINE_NAME.MOBILE ? FormatHelper.conTelFormatWithDash(line.svcNum) :
        line.svcAttrCd === SVC_ATTR_E.TELEPHONE ? FormatHelper.conTelFormatWithDash(line.svcNum) : line.addr;
      result.push(line);
    });

    return result;
  }
}

export default CommonMemberLineRegister;
