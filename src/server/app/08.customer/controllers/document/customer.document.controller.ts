/**
 * @file customer.document.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.16
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {DEFAULT_LIST_COUNT} from '../../../../types/config.type';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {HEAD_TITLE} from '../../../../types/title.type';
import DateHelper from '../../../../utils/date.helper';
import {PROMOTION_TYPE} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';

class CustomerDocument extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    combineLatest(
      this.getMobileService(),
      this.getEtcService()
    ).subscribe(([mobile, etc]) => {
      if (mobile.code === API_CODE.CODE_00) {
        const isEtc = req.query.type === 'etc';
        res.render('document/customer.document.html', {
          mobileCategoryList: this.parseData(mobile.result.ctgList),
          etcCategoryList: this.parseData(etc.result.ctgList),
          isEtc: isEtc,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          title: HEAD_TITLE.DOCUMENT,
          code: mobile.code,
          msg: mobile.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getMobileService() {
    return this.apiService.request(API_CMD.BFF_08_0054, { sysCd: 'EST_SW' });
  }

  private getEtcService() {
    return this.apiService.request(API_CMD.BFF_08_0054, { sysCd: 'EST_W' });
  }

  private parseData(list: any): any {
    if (!FormatHelper.isEmpty(list)) {
      list.map((data) => {
        if (data.ncssDocGuidClNm.length > 5) {
          if (data.ncssDocGuidClNm.includes('/')) {
            data.isLong = true;
            data.name1 = data.ncssDocGuidClNm.split('/')[0] + '/';
            data.name2 = data.ncssDocGuidClNm.split('/')[1];
          }
        } else {
          data.isLong = false;
        }
      });
    }
    list.code = API_CODE.CODE_00;
    return list;
  }
}

export default CustomerDocument;
