/**
 * @file customer.document.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.16
 * @desc 필요서류 안내 페이지
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {HEAD_TITLE} from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';

/**
 * @class
 * @desc 필요서류 안내
 */
class CustomerDocument extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
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

  /**
   * @function
   * @desc 모바일 서비스 조회
   * @returns {Observable<any>}
   */
  private getMobileService() {
    return this.apiService.request(API_CMD.BFF_08_0054, { sysCd: 'EST_SW' });
  }

  /**
   * @function
   * @desc 인터넷/전화/TV 서비스 조회
   * @returns {Observable<any>}
   */
  private getEtcService() {
    return this.apiService.request(API_CMD.BFF_08_0054, { sysCd: 'EST_W' });
  }

  /**
   * @function
   * @desc parsing data
   * @param list
   * @returns {any}
   */
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
