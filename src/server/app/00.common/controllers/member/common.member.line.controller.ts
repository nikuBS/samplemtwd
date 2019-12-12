/**
 * @file common.member.line.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.27
 * @desc 공통 > 화선관리
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { LINE_NAME, SVC_ATTR_E, SVC_ATTR_NAME, SVC_CD_ICO_CLASS, SVC_CATEGORY } from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';

/**
 * @desc 공통 - 회선관리 초기화를 위한 class
 */
class CommonMemberLine extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 회선관리 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_03_0004, { svcCtg: LINE_NAME.MOBILE, pageSize: DEFAULT_LIST_COUNT }),
      this.apiService.request(API_CMD.BFF_03_0004, { svcCtg: LINE_NAME.INTERNET_PHONE_IPTV, pageSize: DEFAULT_LIST_COUNT}),
      this.apiService.request(API_CMD.BFF_03_0030, { svcCtg: LINE_NAME.MOBILE })
    ]).subscribe(([mobile, internet, exposed]) => {
      if ( mobile.code === API_CODE.CODE_00 ) {
        if ( mobile.result.totalCnt === '0' ) {
          res.render('member/common.member.line.empty.html', { svcInfo, pageInfo });
        } else {
          const lineInfo = this.parseLineList({
            totalCnt: mobile.result.totalCnt,
            totalExposedCnt : exposed.result.totalCnt,
            mCnt: mobile.result.mCnt,
            sCnt: mobile.result.sCnt,
            m: mobile.result.m,
            s: internet.result.s,
            mTitle: SVC_CATEGORY.m,
            sTitle: SVC_CATEGORY.s
          });
          res.render('member/common.member.line.html', Object.assign(lineInfo, {
            svcInfo, pageInfo
          }));
        }

      } else {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          code: mobile.code,
          msg: mobile.msg
        });
      }

    });
  }

  /**
   * 회선 데이터 파싱
   * @param lineList
   */
  private parseLineList(lineList): any {
    const category = ['MOBILE', 'INTERNET_PHONE_IPTV'];
    const list: string[] = [];

    category.map((line) => {
      const curLine = lineList[LINE_NAME[line]];
      if ( !FormatHelper.isEmpty(curLine) ) {
        this.convLineData(LINE_NAME[line], curLine);
        list.push(LINE_NAME[line]);
      }
    });

    return { lineList, showParam: this.setShowList(list, lineList.totalCnt, lineList.totalExposedCnt) };
  }

  /**
   * 회선 데이터 화면에 나타내는 데이터로 변경
   * @param category
   * @param lineData
   */
  private convLineData(category, lineData) {
    const seqData = lineData.filter((line) => !FormatHelper.isEmpty(line.expsSeq));
    const nonSeqData = lineData.filter((line) => FormatHelper.isEmpty(line.expsSeq));
    if ( seqData.length > 0 ) {
      FormatHelper.sortObjArrAsc(seqData, 'expsSeq');
    }
    lineData = seqData.concat(nonSeqData);

    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR_NAME[line.svcAttrCd];
      line.showSvcScrbDtm = FormatHelper.isNumber(line.svcScrbDt) ?
        DateHelper.getShortDateNoDot(line.svcScrbDt) : FormatHelper.conDateFormatWithDash(line.svcScrbDt);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR_NAME[line.svcAttrCd] : line.nickNm;
      line.showDetail = category === LINE_NAME.MOBILE ? FormatHelper.conTelFormatWithDash(line.svcNum) :
        line.svcAttrCd === SVC_ATTR_E.TELEPHONE ? FormatHelper.conTelFormatWithDash(line.svcNum) : line.addr;
        line.ico = SVC_CD_ICO_CLASS[line.svcAttrCd];
    });
  }

  /**
   * 최초 리스트 개수 및 펼침 여부 결정
   * @param list
   * @param totalCount
   */
  private setShowList(list, totalCount, totalExposedCnt): any {
    const showParam = {
      m: false,
      s: false,
      o: false,
      totalCount: totalCount,
      totalExposedCnt: totalExposedCnt,
      defaultCnt: DEFAULT_LIST_COUNT
    };

    list.map((category, index) => {
      if ( index === 0 ) {
        showParam[category] = true;
      } else {
        showParam.defaultCnt = 10;
        if ( totalCount <= DEFAULT_LIST_COUNT ) {
          showParam[category] = true;
        }
      }
    });
    return showParam;
  }
}

export default CommonMemberLine;
