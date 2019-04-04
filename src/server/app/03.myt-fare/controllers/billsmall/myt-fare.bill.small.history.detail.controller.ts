/**
 * @file myt-fare.bill.small.history.detail.controller.ts
 * @author Lee kirim (kirim@sk.com)
 * @since 2018. 11. 29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_HISTORY_MICRO_BLOCK_TYPE, MYT_FARE_HISTORY_MICRO_PAY_TYPE, MYT_FARE_HISTORY_MICRO_TYPE } from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  payMethod: string;
  fromDt: string;
  toDt: string;
}
class MyTFareBillSmallHistoryDetail extends TwViewController {
  
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const {fromDt, toDt, listId } = req.query;
    const query: Query = {
      payMethod: 'ALL',
      fromDt,
      toDt
    };

    // 파라미터 없으면 빈 페이지 반환
    if (!fromDt || !toDt || FormatHelper.isEmpty(listId)) {
      this.renderEmpty(res, svcInfo, pageInfo);
    }

    this.apiService.request(API_CMD.BFF_05_0079, query).subscribe((resp): any => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      if (resp.result && !resp.result.histories && !resp.result) {
        return this.renderEmpty(res, svcInfo, pageInfo);
      }

      const resultData = resp.result.histories.reverse()[listId || 0];

      if (FormatHelper.isEmpty(resultData)) {
        return this.renderEmpty(res, svcInfo, pageInfo);
      }

      // 
      const blockState = MYT_FARE_HISTORY_MICRO_BLOCK_TYPE[resultData.cpState] === undefined ? 
                         null : MYT_FARE_HISTORY_MICRO_BLOCK_TYPE[resultData.cpState];
      const plainTime = resultData.useDt.replace(/-/gi, '').replace(/:/gi, '').replace(/ /gi, ''); // YYYY-MM-DD hh:mm--> YYYYMMDDhhmm
      const data = Object.assign(resultData, {
        FullDate: DateHelper.getFullDateAnd24Time(plainTime),
        useAmt: FormatHelper.addComma(resultData.sumPrice), // 이용금액
        payMethodNm: MYT_FARE_HISTORY_MICRO_TYPE[resultData.payMethod] || '', // 결제구분
        payWay: MYT_FARE_HISTORY_MICRO_PAY_TYPE[resultData.wapYn],
        isShowBlockBtn: (resultData.payMethod === '03' && blockState !== null), // 차단하기/내역 버튼 표기여부
        blockState: blockState || '', // 차단 상테
        // isBlocked: blockState ? true : false, // 차단여부
        isBlocked: (resultData.cpState.indexOf('A') === 0) // 정책변경 : A로 시작되지 않는 상태값은 모두 차단중이 아닌것으로 변경 19.1.3
      });

      res.render('billsmall/myt-fare.bill.small.history.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        data
      });

    });
  }

  // 빈 페이지 렌더
  private renderEmpty = (res, svcInfo, pageInfo) => {
    res.render('billsmall/myt-fare.bill.small.history.detail.html', {
      svcInfo: svcInfo, 
      pageInfo: pageInfo, 
      data: {}
    });
  }
}

export default MyTFareBillSmallHistoryDetail;
