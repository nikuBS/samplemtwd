/*
 * FileName: recharge.limit.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.11
 */

import { NextFunction, Request, Response } from "express";
import TwViewController from "../../../../common/controllers/tw.view.controller";
import { API_CMD } from "../../../../types/api-command.type";
import { Observable } from "../../../../../../node_modules/rxjs/Observable";
import FormatHelper from "../../../../utils/format.helper";
import { SSL_OP_TLS_BLOCK_PADDING_BUG } from "constants";

interface IRechargeInfo extends IInfo {
  opDt: string, //"처리일"
  amt: string, //"충전금액"
  opTypCd: string, //"처리유형코드"
  opTypNm: string, //"처리유형명"
  opOrgNm: string, //"처리영업장"
  refundableYn: string, //"환불가능여부"
  type?: {
    icon: string;
    label: string;
  },
}

interface IInfo {
  opDt: string, //"처리일",
  opTypCd: string, //"처리유형코드"
  opTypNm: string, //"처리유형명"
  opOrgNm: string, //"처리영업장"
}

export default class RechargeLimitHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('limit/recharge.limit.history.html', { svcInfo });
  }
}
