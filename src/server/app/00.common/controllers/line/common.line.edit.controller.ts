/**
 * FileName: common.line.edit.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.28
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_CATEGORY, SVC_ATTR_NAME } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class CommonLineEdit extends TwViewController {
  private category = '';
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.category = req.query.category;
    this.apiService.request(API_CMD.BFF_03_0004, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const lineList = this.parseLineList(resp.result);
        res.render('line/common.line.edit.html', Object.assign(lineList, {
          category: this.category,
          lineCategory: SVC_CATEGORY[this.category],
          svcInfo
        }));
      } else {
        res.send('api error' + resp.code + ' ' + resp.msg);
      }

    });
  }

  private parseLineList(lineList): any {
    const curLine = lineList[this.category];
    if ( !FormatHelper.isEmpty(curLine) ) {
      return this.convLineData(curLine);
    }
    return { expsY: null, expsN: null };
  }

  private convLineData(lineData): any {
    const expsY: any[] = [];
    const expsN: any[] = [];
    FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR_NAME[line.svcAttrCd];
      line.showSvcScrbDtm = DateHelper.getShortDateNoDot(line.svcScrbDt);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR_NAME[line.svcAttrCd] : line.nickNm;
      if ( line.expsYn === 'Y' ) {
        expsY.push(line);
      } else {
        expsN.push(line);
      }
    });
    return { expsY, expsN };
  }
}

export default CommonLineEdit;