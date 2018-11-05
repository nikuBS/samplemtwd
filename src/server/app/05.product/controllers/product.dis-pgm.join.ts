/*
 * FileName: product.dis-pgm.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';

class ProductDisPgmJoin extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.params.prodId || '';
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId
    };

    if ( prodId === 'NA00004430' ) {
      // 무선 선택약정 할인제도 상품 설정 조회
      this.apiService.request(API_CMD.BFF_10_0062, {}, {}, prodId)
        .subscribe((response) => {
          if ( response.code === API_CODE.CODE_00 ) {
            data.isContractPlan = (response.result.isNoContractPlanYn === 'Y');
            data.contractPlanPoint = FormatHelper.addComma(response.result.noContractPlanPoint);
            res.render('product.sel-contract.input.html', { data });
          } else {
            return this.error.render(res, {
              code: response.code,
              msg: response.msg,
              svcInfo: svcInfo,
              title: '가입'
            });
          }
        });
    } else {
      // NA00002079, NA00002082, NA00002080, NA00002081
      switch ( prodId ) {
        case 'NA00002079':
          // 2년이상
          data.percent = '65';
          break;
        case 'NA00002082':
          // 3년이상
          data.percent = '70';
          break;
        case 'NA00002080':
          // 5년이상
          data.percent = '75';
          break;
        case 'NA00002081':
          // 10년이상
          data.percent = '80';
          break;
        default:
          // 2년 미만
          data.percent = '50';
          break;
      }
      res.render('product.t-plus.input.html', { data });
    }
  }
}

export default ProductDisPgmJoin;
