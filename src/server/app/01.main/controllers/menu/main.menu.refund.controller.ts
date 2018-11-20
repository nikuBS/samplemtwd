/**
 * FileName: main.menu.refund.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

interface RefundItem {
  svcMgmtNum: string;
  acntNum: string;
  custNum: string;
  svcNum: string;
  bamtClCd: string;
  bamtClNm: string;
  svcBamt: string;
  effStaDt: string;
  rfndBankCd: string;
  rfndBankNm: string;
  rfndBankNum: string;
  rfndReqDt: string;
  msg: string;
  donaReqDt: string;
  donaReqYn: string;
  donaObjYn: string;
  setAddr: string;
  svcCdNm: string;
}

interface RefundInfo {
  socialId: string;
  name: string;
  totalAmount: string;
  refundArr: Array<RefundItem>;
}

class MainMenuRefund extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {

    this.getRefundInfo(res, svcInfo).subscribe(
      (resp: RefundInfo) => {
      },
      (err) => {

      }
    );
    res.render('menu/main.menu.refund.html', {
      svcInfo,
      pageInfo
    });
  }

  private getRefundInfo(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_01_0042, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyRefundInfo(resp.result);
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        svcInfo
      });
      return null;
    });
  }

  private purifyRefundInfo(data: any): RefundInfo {
    return {
      socialId: data.ctzCorpNum,
      name: data.custNm,
      totalAmount: '',
      refundArr: []
    };
  }
}

export default MainMenuRefund;
