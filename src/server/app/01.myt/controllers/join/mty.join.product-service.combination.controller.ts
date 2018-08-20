/*
* FileName: mty.join.product-service.combination.controller.ts
* Author: Jiyoung Jo (jiyoungjo@sk.com)
* Date: 2018.08.20
*/

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Request, Response, NextFunction } from 'express';
import { COMBINATION_PRODUCT_TYPE } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface ICombination {
  joinDate: string;
  totalYears: number;
  totalDiscount: string;
  count: number;
  status: string;
}

export default class MytJoinProductServiceCombinationController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any): void {
    const prodId = req.query.prodId || '';

    this.apiService.request({
      ...API_CMD.BFF_05_0134,
      path: API_CMD.BFF_05_0134.path + '/' + prodId
    }, {}).subscribe(resp => {
      if (resp.code === API_CODE.CODE_00) {
        const pageId = COMBINATION_PRODUCT_TYPE[prodId || ''];

        if (pageId) {
          res.render('join/myt.join.product-service.combination.html', {
            svcInfo: svcInfo,
            pageId,
            combination: this.getProperCombinationData(resp.result)
          });
        } else {
          res.render('error.server-error.html', {
            title: '사용중인 상품',
            code: resp.code,
            msg: resp.msg,
            svcInfo
          });
        }
      } else {
        res.render('error.server-error.html', {
          title: '사용중인 상품',
          code: resp.code,
          msg: resp.msg,
          svcInfo
        });
      }
    });
  }

  private getProperCombinationData = (combination: any): ICombination => {
    const group = combination.combinationGroup;
    return {
      joinDate: DateHelper.getShortDateNoDot(group.combStaDt),
      totalYears: group.totUseYy,
      totalDiscount: FormatHelper.convNumFormat(group.totBasFeeDcTx),
      count: group.mblSvcCnt,
      status: group.combSt
    }
  }
}
