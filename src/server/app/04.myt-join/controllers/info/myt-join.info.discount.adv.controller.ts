/**
 * MenuName: 나의 가입정보 > 약정할인/기기상환 정보(MS_09)
 * @file myt-join.info.discount.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.04
 * Summary: 약정정보, 기기상환 정보 조회
 */

import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
import MytJoinInfoDiscount from './myt-join.info.discount.controller';

class MytJoinInfoDiscountAdvController extends MytJoinInfoDiscount {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( pageInfo.advancement ) {
      // local 테스트틀 하기 위해 추가
      if ( (process.env.NODE_ENV === pageInfo.advancement.env && pageInfo.advancement.visible)
        || process.env.NODE_ENV === 'local' ) {
        this._render(req, res, next, svcInfo, allSvc, childInfo, pageInfo);
        return false;
      }
    }
    // 기존 약정할인 화면
    super._render(req, res, next, svcInfo, allSvc, childInfo, pageInfo);
  }

  _render(req, res, next, svcInfo, allSvc, child, pageInfo) {
    this._setDataInfo(req, svcInfo, pageInfo);
    this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2)
      .subscribe((discountResp) => {
        if (discountResp.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            // title: 'title',
            code: discountResp.code,
            msg: discountResp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
        this.resDataInfo = discountResp.result;
        this._dataInit();
        /**
         * TODO: 약정위약금, 할인반환금, 종료된 약정 등 추가 기능 개발 필요
         * AS-IS 기준으로 1차 개발
         */

        this.renderView(res, 'info/myt-join.info.discount.adv.html', {
          reqQuery: this.reqQuery,
          svcInfo: svcInfo,
          pageInfo: this.pageInfo,
          commDataInfo: this.commDataInfo,
          resDataInfo: this.resDataInfo
        });
      });
  }
}

export default MytJoinInfoDiscountAdvController;
