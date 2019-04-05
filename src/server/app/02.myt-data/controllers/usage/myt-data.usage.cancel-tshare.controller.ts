/**
 * MenuName: 나의 데이터/통화 > 실시간 잔여량 > T데이터 셰어링 유심 해지
 * @file myt-data.usage.cancel-tshare.controller.ts
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018.11.12
 * Summary: T데이터 셰어링 유심 해지 정보 출력
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_CANCEL_TSHARE } from '../../../../types/string.type';

class MyTDataUsageCancelTshare extends TwViewController {
  private _VIEW = {
    DEFAULT: 'usage/myt-data.usage.cancel-tshare.html'
  };

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const cSvcMgmtNum = req.query.cSvcMgmtNum;
    Observable.combineLatest(
      this.reqTDataSharings()
    ).subscribe(([tDataSharingsResp]) => {
      const apiError = this.error.apiError([
        tDataSharingsResp
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const tDataSharingsResult = this.getResult(tDataSharingsResp);
      const child = this.getChild(tDataSharingsResult.childList, cSvcMgmtNum)[0];
      const showSvcNum = FormatHelper.conTelFormatWithDash(svcInfo.svcNum);
      const showUsimNum = this.convUsimFormat(child.usimNum);

      const options = {
        child,
        svcInfo,
        pageInfo,
        showSvcNum,
        showUsimNum
      };

      res.render(this._VIEW.DEFAULT, options);

    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  /**
   * T데이터셰어링 정보조회
   * @private
   * return Observable
   */
  private reqTDataSharings(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0005, {});
  }

  /**
   * 서비스관리번호에 해당하는 T데이터셰어링 정보 반환
   * @param children
   * @param cSvcMgmtNum
   * @private
   * return T데이터셰어링 정보{Object}
   */
  private getChild(children: any, cSvcMgmtNum: string): any {
    return children.filter((child) => {
      return child.cSvcMgmtNum === cSvcMgmtNum;
    });
  }

  private getResult(resp: any): any {
    return resp.result;
  }

  /**
   * 유심 포맷으로 반환:  ****-****-****-**
   * @param v
   * @private
   * return ret{String}
   */
  private convUsimFormat(v: any): any {
    if ( !v || v.replace(/-/g).trim().length < 14 ) {
      return v || '';
    }
    let ret = v.replace(/-/g).trim();
    ret = ret.substr(0, 4) + '-' + ret.substr(4, 4) + '-' + ret.substr(8, 4) + '-' + ret.substr(12, 2);
    return ret;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MYT_DATA_USAGE_CANCEL_TSHARE.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }
}

export default MyTDataUsageCancelTshare;
