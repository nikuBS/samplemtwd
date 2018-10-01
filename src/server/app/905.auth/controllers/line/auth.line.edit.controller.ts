/**
 * FileName: auth.line.edit.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_ATTR, SVC_CATEGORY } from '../../../../types/bff.old.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class AuthLineEdit extends TwViewController {
  private category = '';

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.category = req.query.category;
    this.apiService.request(API_CMD.BFF_03_0004, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const lineList = this.parseLineList(resp.result);
        res.render('line/auth.line.edit.html', Object.assign(lineList, {
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
      line.showSvcAttrCd = SVC_ATTR[line.svcAttrCd];
      line.showSvcScrbDtm = DateHelper.getShortDateNoDot(line.svcScrbDt);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR[line.svcAttrCd] : line.nickNm;
      if ( line.expsYn === 'Y' ) {
        expsY.push(line);
      } else {
        expsN.push(line);
      }
    });
    return { expsY, expsN };
  }
}

export default AuthLineEdit;
