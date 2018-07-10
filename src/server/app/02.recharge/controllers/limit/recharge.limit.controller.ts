import { NextFunction, Request, Response } from "express";
import TwViewController from "../../../../common/controllers/tw.view.controller";
import { API_CMD, API_CODE } from "../../../../types/api-command.type";
import { Observable } from "rxjs/Observable";
import { resolvePtr } from "dns";

interface ILimitData {
  blockYn: string; //"충전서비스 차단여부"
  currentTopUpLimit: string; //"충전가능금액"
  dataLimitedTmthYn: string; //"당월데이터차단여부"
  dataLimitedYn: string; //"매월데이터차단여부"
  prodNm: string; //"요금제명"
  chargeClCd: string; //"충전처리구분"
}

class RechargeLimit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const mock: ILimitData = {
      blockYn: "N",
      currentTopUpLimit: "20000".replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      dataLimitedTmthYn: "Y",
      dataLimitedYn: "Y",
      chargeClCd: "A",
      prodNm: "band 데이터 6.5G"
    };

    // this.apiService.request(API_CMD.BFF_06_0034).subscribe(() => {
    //param: resp
    res.render("limit/recharge.limit.html", { svcInfo, limitData: mock });
    // });
  }
}

export default RechargeLimit;
