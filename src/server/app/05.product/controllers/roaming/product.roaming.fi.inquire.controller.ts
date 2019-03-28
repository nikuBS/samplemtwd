/**
 * FileName: product.roaming.fi.inquire.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

export default class ProductRoamingFiInquire extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_10_0060, {keyword : ''}).subscribe((resp) => {
      let countryCode = {};
      if ( resp.code === API_CODE.CODE_00 ) {
        countryCode = resp.result;
      } else {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }
      svcInfo.showSvcNum =  FormatHelper.conTelFormatWithDash(svcInfo.svcNum); //마스킹된 번호에 '-' 처리

      res.render('roaming/product.roaming.fi.inquire.html', {
        countryCode: countryCode,
        svcInfo: svcInfo,
        pageInfo: pageInfo
      });
    });
  }
}
