/**
 * FileName: common.member.line.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.27
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { LINE_NAME, SVC_ATTR_NAME } from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';

class CommonMemberLine extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_03_0004, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const list = resp.result;
        const lineInfo = this.parseLineList(list);
        res.render('member/common.member.line.html', Object.assign(lineInfo, {
          svcInfo, pageInfo
        }));
      } else {
        // ICAS3101
        res.render('member/common.member.line.empty.html', { svcInfo, pageInfo });
      }
    });
  }

  private parseLineList(lineList): any {
    const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    let totalCount = 0;
    const list: string[] = [];
    category.map((line) => {
      const curLine = lineList[LINE_NAME[line]];
      if ( !FormatHelper.isEmpty(curLine) ) {
        this.convLineData(curLine);
        list.push(LINE_NAME[line]);
        totalCount += curLine.length;
      }
    });
    const showParam = this.setShowList(list, totalCount);

    return { lineList, showParam };
  }

  private convLineData(lineData) {
    FormatHelper.sortObjArrAsc(lineData, 'expsSeq');

    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR_NAME[line.svcAttrCd];
      line.showSvcScrbDtm = FormatHelper.isNumber(line.svcScrbDt) ? DateHelper.getShortDateNoDot(line.svcScrbDt) : FormatHelper.conDateFormatWIthDash(line.svcScrbDt);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR_NAME[line.svcAttrCd] : line.nickNm;
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
