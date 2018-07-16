/**
 * FileName: auth.line.edit.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import LineList from '../../../../mock/server/auth.line';
import { LINE_NAME, SVC_ATTR, SVC_CATEGORY } from '../../../../types/bff-common.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class AuthLineEdit extends TwViewController {
  private category = '';

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.category = req.query.category;
    const lineList = this.parseLineList(LineList.result);
    this.apiService.request(API_CMD.BFF_03_0004, {}).subscribe((resp) => {
      // if ( resp.code === API_CODE.CODE_00 ) {
      //   const list = resp.result;
      // }
      console.log(lineList);
      res.render('line/auth.line.edit.html', {
        lineCategory: SVC_CATEGORY[this.category.toUpperCase()],
        lineList,
        svcInfo
      });
    });
  }

  private parseLineList(lineList): any {
    const curLine = lineList[this.category];
    if ( !FormatHelper.isEmpty(curLine) ) {
      this.convLineData(curLine);
    }
    return curLine;
  }

  private convLineData(lineData) {
    FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR[line.svcAttrCd];
      line.showSvcScrbDtm = DateHelper.getShortDateNoDot(line.svcScrbDtm);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR[line.svcAttrCd] : line.nickNm;
    });
  }
}

export default AuthLineEdit;
