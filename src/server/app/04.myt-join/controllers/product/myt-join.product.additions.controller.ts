/**
 * FileName: myt-join.product.additions.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_JOIN_ADDITONS } from '../../../../mock/server/myt.join.product.additions.mock';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinProductAdditions extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    if (svcInfo.svcAttrCd.includes('M')) {
      this.apiService.request(API_CMD.BFF_05_0137, {}).subscribe(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            title: '나의 부가상품'
          });
        }

        const additions = this.convertMobileAdditions(FormatHelper.isEmpty(resp.result) ? [] : resp.result.addProdList);
        res.render('product/myt-join.product.additions.mobile.html', { svcInfo, additions });
      });
    } else {
      this.apiService.request(API_CMD.BFF_05_0129, {}).subscribe(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            title: '나의 부가상품'
          });
        }

        res.render('product/myt-join.product.additions.others.html', { svcInfo });
      });
    }
  }

  private convertMobileAdditions = (additions: any[]) => {
    return additions.map(addition => {
      return {
        ...addition,
        basFeeTxt: FormatHelper.getFeeContents(addition.basFeeTxt),
        scrbDt: DateHelper.getShortDateNoDot(addition.scrbDt)
      };
    });
  }
}

export default MyTJoinProductAdditions;
