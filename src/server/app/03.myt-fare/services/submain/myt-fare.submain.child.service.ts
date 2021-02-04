/**
 * MenuName: 나의 요금 > 서브메인 (자녀회선 영역)
 * @file myt-fare.submain.child.controller.ts
 * @author 양정규
 * @since 2020.12.23
 *
 */
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE, API_VERSION} from '../../../../types/api-command.type';
import {Request, Response} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import StringHelper from '../../../../utils/string.helper';
import MytFareSubmainCommonService from './myt-fare.submain.common.service';

export class MytFareSubmainChildService extends MytFareSubmainCommonService {

  constructor(req: Request, res: Response, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    super(req, res, svcInfo, allSvc, childInfo, pageInfo);
  }

  private _getChildBillInfo(params: any) {
    return this.apiService.request(API_CMD.BFF_05_0047, params, null, [], API_VERSION.V2).map((resp) => {
      return resp.code !== API_CODE.CODE_00 ? null : resp.result;
    });
  }

  public getChildBillInfo(): Observable<any> {
    const {reqQuery, childInfo} = this.info,
      isEmptyArray = FormatHelper.isEmptyArray;
    if (isEmptyArray(childInfo)) {
      return Observable.of(null);
    }
    const requests: Array<Observable<any>> = childInfo.reduce((acc, cur) => {
      acc.push(this._getChildBillInfo({
        childSvcMgmtNum: cur.svcMgmtNum,
        invDt: reqQuery.date
      }));
      return acc;
    }, []);

    try {
      return Observable.combineLatest(
        requests
      ).map( (responses) => {
        if (isEmptyArray(responses) || responses.length !== childInfo.length) {
          return Observable.of(null);
        }

        return responses.map( (item, idx) => {
          const child = childInfo[idx];
          if (!item || isEmptyArray(item.invAmtList)) {
            return child;
          }
          const invAmtInfo = item.invAmtList.find(invAmt => invAmt.invDt === reqQuery.date) || {};
          child.useAmtTot = FormatHelper.addComma(invAmtInfo.totInvAmt || '0');
          child.svcNum = StringHelper.phoneStringToDash(child.svcNum);
          return child;
        });
      });

    } catch (e) {
      throw new Error(e.message);
    }

  }
}
