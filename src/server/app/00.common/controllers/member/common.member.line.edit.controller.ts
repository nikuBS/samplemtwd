/**
 * @file common.member.line.edit.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.28
 * @desc 공통 > 회선관리 > 회선편집
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_CATEGORY, SVC_ATTR_NAME, SVC_CD_ICO_CLASS, LINE_NAME, SVC_ATTR_E } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';

/**
 * @desc 공통 - 회선편집 초기화를 위한 class
 */
class CommonMemberLineEdit extends TwViewController {
  private category = '';

  constructor() {
    super();
  }

  /**
   * 회선 편집 렌더 함수
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
      this.apiService.request(API_CMD.BFF_03_0030, { svcCtg: LINE_NAME.MOBILE }),
      this.apiService.request(API_CMD.BFF_03_0030, { svcCtg: LINE_NAME.INTERNET_PHONE_IPTV})
    ]).subscribe(([mobile, internet]) => {
      if ( mobile.code === API_CODE.CODE_00) {
        const lineInfo = this.parseLineList({
          totalCnt: mobile.result.totalCnt,
          mCnt: mobile.result.mCnt,
          sCnt: mobile.result.sCnt,
          m: mobile.result.m,
          s: internet.result.s,
          mTitle: SVC_CATEGORY.m,
          sTitle: SVC_CATEGORY.s
        });
        res.render('member/common.member.line.edit.html', Object.assign(lineInfo, {
          svcInfo, pageInfo
        }));

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

    return { lineList, showParam: this.setShowList(list, lineList.totalCnt) };
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
      // line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR_NAME[line.svcAttrCd] : line.nickNm;
      // 노출 조건 순서 변경  닉네임 > 펜네임(마스킹해제) > 서비스속성(휴대폰, 선불폰, IPTV 등등)
      let showName = line.nickNm || line.oriRmk || SVC_ATTR_NAME[line.svcAttrCd];
      if (showName && showName.length > 7) {
        showName = showName.substring(0, 7) + '...';
      }
      line.showName = showName;
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
  private setShowList(list, totalCount): any {
    const showParam = {
      m: false,
      s: false,
      o: false,
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

export default CommonMemberLineEdit;
