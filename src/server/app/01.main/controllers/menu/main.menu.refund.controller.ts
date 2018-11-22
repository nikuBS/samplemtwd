/**
 * FileName: main.menu.refund.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE, API_REFUND_ERROR } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MAIN_MENU_REFUND_STATE } from '../../../../types/string.type';

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

interface RefundItemSubmitted extends RefundItem {
  isError: boolean;
}

interface RefundInfo {
  name: string;
  socialId: string;
  totalCount: number;
  totalAmount: number;
  refundArr: Array<RefundItem>;
  submittedArr: Array<RefundItemSubmitted>;
}

class MainMenuRefund extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {

    this.getRefundInfo(res, svcInfo).subscribe(
      (data: RefundInfo) => {
        if (FormatHelper.isEmpty(data)) {
          return;
        }

        if (data.totalCount === 0) {
          res.render('menu/main.menu.refund-empty.html');
          return;
        }

        res.render('menu/main.menu.refund.html', {
          svcInfo,
          pageInfo,
          data
        });
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          svcInfo
        });
      }
    );
  }

  private getRefundInfo(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_01_0042, {}).map((resp) => {
      console.log(resp.result);
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyRefundInfo(resp.result);
      }

      if (resp.code === API_REFUND_ERROR.ZINVE8169) {
        return { totalCount: 0 };
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
    const purified = {
      name: data.custNm,
      socialId: data.ctzCorpNum,
      refundArr: data.cancelRefund.filter((item: RefundItem) => {
        return item.donaReqYn !== 'Y' && FormatHelper.isEmpty(item.effStaDt);
      }).map((item: RefundItem) => {
        item.svcBamt = FormatHelper.convNumFormat(parseInt(item.svcBamt, 10));
        return item;
      }),
      submittedArr: data.cancelRefund.filter((item: RefundItem) => {
        return item.donaReqYn === 'Y' || !FormatHelper.isEmpty(item.effStaDt);
      }).map((item: RefundItemSubmitted) => {
        item.donaReqDt = DateHelper.getShortDateNoDot(item.donaReqDt);
        item.effStaDt = DateHelper.getShortDateNoDot(item.effStaDt);
        if (FormatHelper.isEmpty(item.msg)) {
          item.msg = MAIN_MENU_REFUND_STATE.APPLY;
        }
        item.svcNum = FormatHelper.conTelFormatWithDash(item.svcNum);
        item.isError = true; // TODO: Joon Figure out...... please.... you stupid jerk...
        return item;
      }),
      totalAmount: 0,
      totalCount: data.cancelRefund.length
    };

    purified.totalAmount = purified.refundArr.reduce((memo: number, item: RefundItem) => {
      return (memo += parseInt(item.svcBamt, 10));
    }, 0);

    return purified;
  }
}

export default MainMenuRefund;
