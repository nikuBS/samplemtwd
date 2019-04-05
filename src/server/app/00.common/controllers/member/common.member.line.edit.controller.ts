/**
 * @file common.member.line.edit.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.28
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_CATEGORY, SVC_ATTR_NAME, LINE_NAME, SVC_ATTR_E } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';

class CommonMemberLineEdit extends TwViewController {
  private category = '';

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.category = req.query.category;
    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_03_0029, { svcCtg: LINE_NAME.ALL }),
      this.apiService.request(API_CMD.BFF_03_0030, { svcCtg: this.category, pageSize: DEFAULT_LIST_COUNT })
    ]).subscribe(([exposable, exposed]) => {
      if ( exposable.code === API_CODE.CODE_00 && exposed.code === API_CODE.CODE_00 ) {
        const lineList = this.parseLineList(exposable.result, exposed.result);
        res.render('member/common.member.line.edit.html', Object.assign(lineList, {
          category: this.category,
          lineCategory: SVC_CATEGORY[this.category],
          otherCnt: exposed.result.totalCnt - exposed.result[this.category + 'Cnt'],
          svcInfo,
          pageInfo
        }));
      } else {
        if ( exposable.code === API_CODE.CODE_00 ) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            code: exposed.code,
            msg: exposed.msg
          });
        } else {
          return this.error.render(res, {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            code: exposable.code,
            msg: exposable.msg
          });
        }
      }
    });
  }

  private parseLineList(exposable, exposed): any {
    let exposableList = [];
    let exposedList = [];
    if ( !FormatHelper.isEmpty(exposable[this.category]) ) {
      exposableList = this.convLineData(this.category, exposable[this.category]);
    }
    if ( !FormatHelper.isEmpty(exposed[this.category]) ) {
      exposedList = this.convLineData(this.category, exposed[this.category]);
    }

    return {
      expsY: {
        cnt: exposed[this.category + 'Cnt'],
        list: exposedList
      },
      expsN: {
        cnt: exposable[this.category + 'Cnt'],
        list: exposableList
      }
    };
  }

  private convLineData(category, lineData): any {
    FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    lineData.map((line) => {
      line.showSvcAttrCd = SVC_ATTR_NAME[line.svcAttrCd];
      line.showSvcScrbDtm = DateHelper.getShortDateNoDot(line.svcScrbDt);
      line.showName = FormatHelper.isEmpty(line.nickNm) ? SVC_ATTR_NAME[line.svcAttrCd] : line.nickNm;
      line.showDetail = category === LINE_NAME.MOBILE ? FormatHelper.conTelFormatWithDash(line.svcNum) :
        line.svcAttrCd === SVC_ATTR_E.TELEPHONE ? FormatHelper.conTelFormatWithDash(line.svcNum) : line.addr;
    });
    return lineData;
  }

}

export default CommonMemberLineEdit;
