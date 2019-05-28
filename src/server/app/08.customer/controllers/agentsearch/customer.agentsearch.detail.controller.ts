/**
 * @file 지점/대리점 상세정보 페이지 처리
 * @author Hakjoon sim
 * @since 2018-10-29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

interface BranchDetail {
  locCode: string;
  locName: string;
  storeName: string;
  itrstShop: string;
  searchAddr: string;
  jibunAddr: string;
  tel: string;
  geoX: string;
  geoY: string;
  custRateAvg: string;
  custRateCnt: string;
  weekdayOpenTime: string;
  weekdayCloseTime: string;
  satOpenTime: string;
  satCloseTime: string;
  holidayOpenTime: string;
  holidayCloseTime: string;
  talkMap: string;
  premium: string;
  direct: string;
  rent: string;
  skb: string;
  apple: string;
  agnYn: string;
  authAgnYn: string;
  talkMapArr?: Array<string>;
  star?: string;
}

class CustomerAgentsearchDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    const branchCode = req.query.code;
    const isExpZone = req.query.isExpZone || false; /* 5gx 및 VR zone 관련 플래그 추가 */
    
    this.getBranchDetailInfo(res, svcInfo, pageInfo, branchCode).subscribe(
      (detail) => {
        if (!FormatHelper.isEmpty(detail)) {
          res.render('agentsearch/customer.agentsearch.detail.html', { detail, svcInfo, pageInfo, isExpZone });
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo
        });
      }
    );
  }

  /**
   * @function
   * @desc 해당 지점의 상세 정보를 BFF로 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} code - 조회하고자 하는 지점의 code
   * @returns Observable
   */
  private getBranchDetailInfo(res: Response, svcInfo: any, pageInfo: any, code: string): Observable<BranchDetail | undefined> {
    return this.apiService.request(API_CMD.BFF_08_0007, { locCode: code }).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyDetailInfo(resp.result);
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });

      return undefined;
    });
  }

  /**
   * @function
   * @desc BFF로부터 조회된 data를 ejs바인딩 위해 정제처리
   * @param  {BranchDetail} detail - BFF로 부터 받은 response
   * @returns BranchDetail - 정제된 data 정보
   */
  private purifyDetailInfo(detail: BranchDetail): BranchDetail {
    const purified: BranchDetail = { ...detail };

    purified.weekdayOpenTime = FormatHelper.insertColonForTime(purified.weekdayOpenTime);
    purified.weekdayCloseTime = FormatHelper.insertColonForTime(purified.weekdayCloseTime);
    purified.satOpenTime = FormatHelper.insertColonForTime(purified.satOpenTime);
    purified.satCloseTime = FormatHelper.insertColonForTime(purified.satCloseTime);
    purified.holidayOpenTime = FormatHelper.insertColonForTime(purified.holidayOpenTime);
    purified.holidayCloseTime = FormatHelper.insertColonForTime(purified.holidayCloseTime);

    const star = Math.round(parseFloat(purified.custRateAvg));
    purified.star = 'star' + star;

    if (purified.custRateAvg.match(/\d/)) {
      purified.custRateAvg += '.0';
    }

    // 별점이 0점이거나 평가된 이력이 없으면 별점정보 노출하지 않음
    if (purified.agnYn === 'Y' || purified.star.includes('NaN') || purified.custRateAvg === '0.0') {
      purified.custRateCnt = '0';
    }

    // API 가 스펙대로 동작안하는데 쓰는 쪽에서 예외처리 하라함....... talkMap field 없으면 예외 처리
    if (!FormatHelper.isEmpty(purified.talkMap)) {
      purified.talkMapArr = purified.talkMap.split(/#\^|<br.*?>/gi);
    } else {
      purified.talkMapArr = [];
    }

    return purified;
  }
}

export default CustomerAgentsearchDetail;
