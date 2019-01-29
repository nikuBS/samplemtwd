/*
 * FileName: benefit.dis-pgm.input.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.12.18
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import ProductHelper from '../../../../utils/product.helper';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';

class BenefitSelectContract extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const selType = req.query.sel_type || null, prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };
    this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId])
      .subscribe((basicInfo) => {
        if ( basicInfo.code !== API_CODE.CODE_00 ) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: basicInfo.code,
            msg: basicInfo.msg
          }));
        }
        if ( selType ) {
          this.apiService.request(API_CMD.BFF_10_0062, {}, {})
            .subscribe((seldis) => {
              renderCommonInfo['isContractPlan'] = (seldis.result.isNoContractPlanYn === 'Y');
              this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
                .subscribe((joinTermInfo) => {
                  if ( joinTermInfo.code !== API_CODE.CODE_00 ) {
                    return this.error.render(res, Object.assign(renderCommonInfo, {
                      code: joinTermInfo.code,
                      msg: joinTermInfo.msg,
                      isBackCheck: true
                    }));
                  }

                  res.render('program/benefit.dis-pgm.input.html', Object.assign(renderCommonInfo, {
                    prodId: prodId,
                    joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result),
                    selType: selType
                  }));
                });
            });
        } else {
          this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
            .subscribe((joinTermInfo) => {
              if ( joinTermInfo.code !== API_CODE.CODE_00 ) {
                return this.error.render(res, Object.assign(renderCommonInfo, {
                  code: joinTermInfo.code,
                  msg: joinTermInfo.msg,
                  isBackCheck: true
                }));
              }

              res.render('program/benefit.dis-pgm.input.html', Object.assign(renderCommonInfo, {
                prodId: prodId,
                joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result),
                selType: selType
              }));
            });
        }
      });
  }

}

export default BenefitSelectContract;

