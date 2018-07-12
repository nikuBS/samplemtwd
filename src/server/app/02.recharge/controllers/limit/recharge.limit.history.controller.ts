/*
 * FileName: recharge.limit.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.11
 */

import { NextFunction, Request, Response } from "express";
import TwViewController from "../../../../common/controllers/tw.view.controller";
import { API_CMD } from "../../../../types/api-command.type";
import { Observable } from "../../../../../../node_modules/rxjs/Observable";

interface IRechargeInfo extends IInfo {
  opDt: string, //"처리일"
  amt: string, //"충전금액"
  opTypCd: string, //"처리유형코드"
  opTypNm: string, //"처리유형명"
  opOrgNm: string, //"처리영업장"
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
    var mock: IRechargeInfo[] = [
      {
        opDt: "20180627",
        amt: "10000",
        opTypCd: "",
        opTypNm: "후불충전",
        opOrgNm: "모바일 Tworld"
      },
      {
        opDt: "20180628",
        amt: "10000",
        opTypCd: "",
        opTypNm: "후불충전",
        opOrgNm: "모바일 Tworld"
      },
      {
        opDt: "20180629",
        amt: "10000",
        opTypCd: "",
        opTypNm: "후불충전",
        opOrgNm: "모바일 Tworld"
      }
    ]

    Observable.combineLatest(
      this.getRechargeList(),
      this.getBlockList(),
    ).subscribe(([rechargeList, blockList]) => {
      res.render('limit/recharge.limit.history.html', { svcInfo, rechargeList, blockList: [] });
    });
  }

  private getRechargeList(): Observable<IRechargeInfo[]> {
    return this.apiService.request(API_CMD.BFF_06_0042).map((resp) => {
      return resp.result;
    });
  }

  private getBlockList(): Observable<IInfo[]> {
    return this.apiService.request(API_CMD.BFF_06_0043).map((resp) => {
      return resp.result;
    });
  }
}
