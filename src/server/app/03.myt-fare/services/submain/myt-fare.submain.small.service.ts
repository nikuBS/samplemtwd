/**
 * MenuName: 나의 요금 > 서브메인 (소액결제 영역)
 * @file myt-fare.submain.small.controller.ts
 * @author 양정규
 * @since 2020.11.17
 *
 */
import {Observable} from 'rxjs/Observable';
import {API_ADD_SVC_ERROR, API_CMD} from '../../../../types/api-command.type';
import {Request, Response} from 'express';
import DateHelper from '../../../../utils/date.helper';
import MytFareSubmainCommonService from './myt-fare.submain.common.service';
import FormatHelper from '../../../../utils/format.helper';

export class MytFareSubmainSmallService extends MytFareSubmainCommonService {
  constructor(req: Request, res: Response, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    super(req, res, svcInfo, allSvc, childInfo, pageInfo);
  }

  public getHistory(): Observable<any> {
    const {reqQuery, svcInfo} = this.info;
    // skbroadband 는 비노출(조회 못함)
    if (svcInfo.actCoClCd === 'B') {
      return Observable.of(null);
    }

    const params = {
      fromDt: DateHelper.getStartOfMonDate(reqQuery.date, 'YYYYMMDD'),
      toDt: reqQuery.date
    };

    return Observable.combineLatest(
      this.apiService.request( API_CMD.BFF_05_0079 , params), // 소액결제
      this.apiService.request( API_CMD.BFF_05_0064 , params),  // 콘텐츠 이용료
      this.apiService.request( API_CMD.BFF_05_0066 , {})  // 콘텐츠 이용료 한도조회(미성년자 여부 판단하기 위해 사용)
    ).switchMap( ([small, contents, contentsLimit]) => {
      const smallResult = small.result || {},
        contentsResult = contents.result || {},
        result: any = {
          isNotAgree: contents.code === API_ADD_SVC_ERROR.BIL0030, // 휴대폰 결제 이용동의여부
          smallTotal: smallResult.totalSumPrice || '0', // 총 사용금액
          contentsTotal: contentsResult.invDtTotalAmtCharge || '0', // 총 사용금액
          isAdult: (contentsLimit.result || {}).isAdult === 'Y', // 성인여부
          isBubinCD: ['R', 'D'].indexOf(svcInfo.svcGr) > -1 // 법인 C, D (회선등급 C의 경우 정책서 상에는 svcGr 값이 C이고 시스템 상에는 svcGr 값이 R)
        };

      // 휴대폰 결제 이용동의여부 "미동의" 인 경우 성인여부를 확인하기 위해 나이를 조회한다.
      if (result.isNotAgree) {
        return this._getIsAdult().map( resp => {
          result.isAdult = resp;
          return result;
        });
      }
      return Observable.of(result);
    });
  }

  /**
   * @desc BFF 호출하여, 미성년자 여부확인
   * @private
   */
  private _getIsAdult() {
    return this.apiService.request(API_CMD.BFF_08_0080, {}).map((resp) => {
      return (resp.result || {}).age > 19;
    });
  }
}
