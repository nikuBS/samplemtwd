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
import { MAIN_MENU_REFUND_STATE, MAIN_MENU_REFUND_SVC_TYPE } from '../../../../types/string.type';

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
  svcText?: string;
}

interface RefundItemSubmitted extends RefundItem {
  canChangeAccount: boolean;
}

interface RefundInfo {
  name: string;
  socialId: string;
  canSubmit: boolean; // If there is customer number or not
  canDonate: boolean;
  totalCount: number;
  totalAmount: string; // Amount of the money can be refunded
  refundArr: Array<RefundItem>;
  submittedArr: Array<RefundItemSubmitted>;
}

class MainMenuRefund extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {

    this.getRefundInfo(res, svcInfo, pageInfo).subscribe(
      (data: RefundInfo) => {
        if (FormatHelper.isEmpty(data)) {
          return;
        }

        if (data.totalCount === 0 || data.totalAmount === '0') {
          res.render('menu/main.menu.refund-empty.html', { pageInfo });
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
          svcInfo,
          pageInfo
        });
      }
    );
  }

  private getRefundInfo(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_01_0042, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        if (resp.result.cancelRefund.length === 0) {
          return { totalCount: 0 };
        }
        return this.purifyRefundInfo(resp.result);
      }

      if (resp.code === API_REFUND_ERROR.ZINVE8169) {
        return { totalCount: 0 };
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        svcInfo,
        pageInfo
      });
      return null;
    });
  }

  private purifyRefundInfo(data: any): RefundInfo {
    const purified = {
      name: data.custNm,
      socialId: data.ctzCorpNum,
      canSubmit: !!data.cancelRefund[0].custNum,
      refundArr: data.cancelRefund.filter((item: RefundItem) => {
        return item.donaReqYn !== 'Y' && FormatHelper.isEmpty(item.effStaDt) &&
          FormatHelper.isEmpty(item.rfndReqDt);
      }).map((item: RefundItem) => {
        item.svcBamt = FormatHelper.convNumFormat(parseInt(item.svcBamt, 10));
        item.svcCdNm = item.svcCdNm.includes('이동전화') ? '휴대폰' : item.svcCdNm;
        if (item.svcCdNm.includes('인터넷')) {
          item.svcText = item.setAddr;
        } else {
          item.svcText = item.svcNum;
          if (item.svcCdNm.includes('휴대폰')) {
            item.svcText = FormatHelper.conTelFormatWithDash(item.svcText);
          }
        }
        return item;
      }),
      submittedArr: data.cancelRefund.filter((item: RefundItem) => {
        return item.donaReqYn === 'Y' || !FormatHelper.isEmpty(item.effStaDt) ||
          !FormatHelper.isEmpty(item.rfndReqDt);
      }).map((item: RefundItemSubmitted) => {
        item.donaReqDt = DateHelper.getShortDateNoDot(item.donaReqDt);
        item.effStaDt = FormatHelper.isEmpty(item.effStaDt) ?
          '' : DateHelper.getShortDateNoDot(item.effStaDt);
        item.svcCdNm = item.svcCdNm.includes(MAIN_MENU_REFUND_SVC_TYPE.PHONE_TYPE_0) ?
          MAIN_MENU_REFUND_SVC_TYPE.PHONE_TYPE_1 : item.svcCdNm;
        item.svcNum = FormatHelper.conTelFormatWithDash(item.svcNum);

        item.canChangeAccount = (() => {
          if (item.donaReqYn === 'Y') {
            return false;
          }
          if (item.msg.includes(MAIN_MENU_REFUND_STATE.ORIGIN_MSG_ERROR) ||
              item.msg.includes(MAIN_MENU_REFUND_STATE.ORIGIN_MSG_ING) ||
              FormatHelper.isEmpty(item.msg)) {
            return true;
          }
          return false;
        })();

        item.msg = ((msg) => {
          if (msg.includes(MAIN_MENU_REFUND_STATE.ORIGIN_MSG_COMPLETE)) {
            return MAIN_MENU_REFUND_STATE.COMPLTE;
          } else if (msg.includes(MAIN_MENU_REFUND_STATE.ORIGIN_MSG_BRANCH_COMPLETE)) {
            return MAIN_MENU_REFUND_STATE.COMPLTE_B;
          } else if (msg.includes(MAIN_MENU_REFUND_STATE.ORIGIN_MSG_ERROR)) {
            return MAIN_MENU_REFUND_STATE.ERROR;
          }
          return MAIN_MENU_REFUND_STATE.APPLY;
        })(item.msg);

        item.svcCdNm = item.svcCdNm.includes('이동전화') ? '휴대폰' : item.svcCdNm;
        if (item.svcCdNm.includes('인터넷')) {
          item.svcText = item.setAddr;
        } else {
          item.svcText = item.svcNum;
        }
        return item;
      }),
      totalAmount: '',
      totalCount: data.cancelRefund.length,
      canDonate: false
    };

    purified.totalAmount = FormatHelper.convNumFormat(
      purified.refundArr.reduce((memo: number, item: RefundItem) => {
        return (memo += parseInt(item.svcBamt, 10));
      }, 0)
    );

    // If it is Under 1,000 won, can be donated
    if (parseInt(purified.totalAmount.replace(/,/g, ''), 10) < 1000) {
      purified.canDonate = true;
    }

    // If social id has length 13, then insert '-'
    if (purified.socialId.length === 13) {
      purified.socialId = purified.socialId.slice(0, 6) + '-' + purified.socialId.slice(6);
    }

    return purified;
  }
}

export default MainMenuRefund;
