/**
 * FileName: myt-fare.bill.contents.history.detail.controller.ts
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  fromDt: string;
  toDt: string;
}
class MyTFareBillContentsHistoryDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const {fromDt, toDt, listId } = req.query;
    const query: Query = {
      fromDt,
      toDt
    };

    // 파라미터 없으면 빈 페이지 반환
    if (!fromDt || !toDt || FormatHelper.isEmpty(listId)) {
      this.renderEmpty(res, svcInfo, pageInfo);
    }

    this.apiService.request(API_CMD.BFF_05_0064, query).subscribe((resp) => {

      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
          //  ,pageInfo: pageInfo
        });
      }

      if (resp.result && !resp.result.useConAmtDetailList && !resp.result) {
        return this.renderEmpty(res, svcInfo, pageInfo);
      }

      const resultData = resp.result.useConAmtDetailList.reverse()[listId || 0];
      
      if (FormatHelper.isEmpty(resultData)) {
        return this.renderEmpty(res, svcInfo, pageInfo);
      }

      resultData.useServiceNm = resultData.useServiceNm || resultData.payFlag; 
      resultData.FullDate = DateHelper.getFullDateAndTime(resultData.payTime);
      resultData.useAmt = FormatHelper.addComma(resultData.useCharge); // 이용금액
      resultData.dedAmt = FormatHelper.addComma(resultData.deductionCharge); // 공제금액

      res.render('billcontents/myt-fare.bill.contents.history.detail.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        data: resultData
      });

      

    });
  }

  // 빈 페이지 렌더
  private renderEmpty = (res, svcInfo, pageInfo) => {
    res.render('billcontents/myt-fare.bill.contents.history.detail.html', {
      svcInfo: svcInfo, 
      pageInfo: pageInfo, 
      data: {}
    });
  }
}

export default MyTFareBillContentsHistoryDetail;
