/**
 * MenuName: 나의 가입정보 > 약정할인/기기 할부 정보(MS_09)
 * @file myt-join.info.discount.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.04
 * Summary: 약정정보, 기기상환 정보 조회
 */

import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_VERSION } from '../../../../types/api-command.type';
import MytJoinInfoDiscount from './myt-join.info.discount.controller';
import { Observable } from 'rxjs';
import FormatHelper from '../../../../utils/format.helper';

class MytJoinInfoDiscountAdvController extends MytJoinInfoDiscount {
  private finishInfoList: any = [];

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
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2),
      // this.apiService.request(API_CMD.BFF_05_0238, {}),
      this._getFaqRequest()
    ).subscribe(([discountResp, faqList]) => {
      if ( discountResp.code !== API_CODE.CODE_00 ) {
        return this.error.render(res, {
          // title: 'title',
          code: discountResp.code,
          msg: discountResp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
      // TODO: result 결과 전달 시 parsing 해서 finishInfoList 로 추가 필요
      // TODO: BE 개발 완료 후 재확인 필요
      // if ( agrmtInfosResp.code === API_CODE.CODE_00 ) {
      //   if ( agrmtInfosResp.result.agrmtInfoList.length ) {
      //   }
      // }

      this.resDataInfo = discountResp.result;
      this._dataInit();

      // 3/11 배포 이후 BE 개발 완료 후 진행 - 납부회차 팝업
      // this._getFeeInfoDetailCount({ res, svcInfo, faqList });
      this.renderView(res, 'info/myt-join.info.discount.adv.html', {
        reqQuery: this.reqQuery,
        svcInfo: svcInfo,
        pageInfo: this.pageInfo,
        commDataInfo: this.commDataInfo,
        resDataInfo: this.resDataInfo,
        faqList,
        finishInfoList: this.finishInfoList
      });
    });
  }

  /**
   * 카테고리: 약정할인 총 납부 횟수 조회 (가장마지막에 조회)
   */
  _getFeeInfoDetailCount(params) {
    const { faqList, svcInfo, res } = params;
    const requestIds: any = [];
    const requests = this.commDataInfo.feeInfo.map(item => {
      if (item.svcAgrmtDcObj) {
        requestIds.push(item.svcAgrmtDcObj.svcAgrmtDcId);
        return this.apiService.request(API_CMD.BFF_05_0076, {
          svcAgrmtCdId: item.svcAgrmtDcObj.svcAgrmtDcId,
          svcAgrmtDcCd: item.svcAgrmtDcObj.svcAgrmtDcCd
        });
      }
    });
    if (requests.length) {
      Observable.combineLatest(requests)
        .subscribe(responses => {
          responses.forEach((resp: any, index: number) => {
            if (resp.code === API_CODE.CODE_00) {
              if (!FormatHelper.isEmpty(resp.result)) {
                this.commDataInfo.feeInfo.forEach(feeItem => {
                  if (feeItem.svcAgrmtDcObj) {
                    if (requestIds[index] === feeItem.svcAgrmtDcObj.svcAgrmtDcId) {
                      feeItem.paymentCount = resp.result.agrmt.length;
                    }
                  }
                })
              }
            }
          });
          this.renderView(res, 'info/myt-join.info.discount.adv.html', {
            reqQuery: this.reqQuery,
            svcInfo: svcInfo,
            pageInfo: this.pageInfo,
            commDataInfo: this.commDataInfo,
            resDataInfo: this.resDataInfo,
            faqList,
            finishInfoList: this.finishInfoList
          });
        });
    } else {
      this.renderView(res, 'info/myt-join.info.discount.adv.html', {
        reqQuery: this.reqQuery,
        svcInfo: svcInfo,
        pageInfo: this.pageInfo,
        commDataInfo: this.commDataInfo,
        resDataInfo: this.resDataInfo,
        faqList,
        finishInfoList: this.finishInfoList
      });
    }
  }

  /**
   * 자주하는질문 API 요청
   */
  _getFaqRequest() {
    return Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_08_0073, { ifaqId: '1606010556' }),
      this.apiService.request(API_CMD.BFF_08_0073, { ifaqId: '1606010557' }),
      this.apiService.request(API_CMD.BFF_08_0073, { ifaqId: '1606010558' })
    ).map(([item, item1, item2]) => {
      const faqList: any = [];
      if ( item.code === API_CODE.CODE_00 && !FormatHelper.isEmpty(item.result) ) {
        faqList.push({
          title: item.result.inqCtt,
          answer: item.result.answCtt
        });
      }
      if ( item1.code === API_CODE.CODE_00 && !FormatHelper.isEmpty(item1.result) ) {
        faqList.push({
          title: item1.result.inqCtt,
          answer: item1.result.answCtt
        });
      }
      if ( item2.code === API_CODE.CODE_00 && !FormatHelper.isEmpty(item2.result) ) {
        faqList.push({
          title: item2.result.inqCtt,
          answer: item2.result.answCtt
        });
      }
      return faqList;
    });
  }
}

export default MytJoinInfoDiscountAdvController;
