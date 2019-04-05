/**
 * @file common.member.line.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.27
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { LINE_NAME, SVC_ATTR_E, SVC_ATTR_NAME } from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';

class CommonMemberLine extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_03_0004, { svcCtg: LINE_NAME.MOBILE, pageSize: DEFAULT_LIST_COUNT }),
      this.apiService.request(API_CMD.BFF_03_0004, {
        svcCtg: LINE_NAME.INTERNET_PHONE_IPTV,
        pageSize: DEFAULT_LIST_COUNT
      })
    ]).subscribe(([mobile, internet]) => {
      if ( mobile.code === API_CODE.CODE_00 ) {
        if ( mobile.result.totalCnt === '0' ) {
          res.render('member/common.member.line.empty.html', { svcInfo, pageInfo });
        } else {
          const lineInfo = this.parseLineList({
            totalCnt: mobile.result.totalCnt,
            mCnt: mobile.result.mCnt,
            sCnt: mobile.result.sCnt,
            m: mobile.result.m,
            s: internet.result.s
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

  private parseLineList(lineList): any {
    const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
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
    });
  }

  private setShowList(list, totalCount): any {
    const showParam = {
      m: '',
      s: '',
      o: '',
      defaultCnt: DEFAULT_LIST_COUNT
    };

    list.map((category, index) => {
      if ( index === 0 ) {
        showParam[category] = 'on';
      } else {
        showParam.defaultCnt = 10;
        if ( totalCount <= DEFAULT_LIST_COUNT ) {
          showParam[category] = 'on';
        }
      }
    });
    return showParam;
  }
}

export default CommonMemberLine;
