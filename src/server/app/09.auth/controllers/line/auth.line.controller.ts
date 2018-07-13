/**
 * FileName: auth.line.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import LineList from '../../../../mock/server/auth.line';
import FormatHelper from '../../../../utils/format.helper';
import { LINE_NAME, SVC_ATTR } from '../../../../types/bff-common.type';
import DateHelper from '../../../../utils/date.helper';

class AuthLine extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let lineInfo = this.parseLineList(LineList.result);
    this.apiService.request(API_CMD.BFF_03_0004, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const list = resp.result;
        lineInfo = this.parseLineList(list);
      }
      res.render('line/auth.line.html', lineInfo);
    });
  }

  private parseLineList(lineList): any {
    const category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    let totalCount = 0;
    const list: string[] = [];
    category.map((line) => {
      const curLine = lineList[LINE_NAME[line].toLowerCase()];
      if ( !FormatHelper.isEmpty(curLine) ) {
        this.convLineData(curLine);
        list.push(LINE_NAME[line].toLowerCase());
        totalCount += curLine.length;
      }
    });
    const showParam = this.setShowList(list, totalCount);

    return { lineList, showParam };
  }

  private convLineData(lineData) {
    FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR[line.svcAttrCd];
      line.showSvcScrbDtm = DateHelper.getShortDateNoDot(line.svcScrbDtm);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR[line.svcAttrCd] : line.nickNm;
    });
  }

  private setShowList(list, totalCount): any {
    const showParam = {
      m: false,
      s: false,
      o: false
    };

    list.map((category, index) => {
      if ( index === 0 ) {
        showParam[category] = true;
      } else {
        if ( totalCount <= 20 ) {
          showParam[category] = true;
        }
      }
    });
    return showParam;
  }
}

export default AuthLine;
