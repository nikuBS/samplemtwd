/**
 * @desc 로밍 국가별 이용요금 조회. (M000455)
 *
 * 검색전에 사용하는 컨트롤러로 BFF API를 사용하지 않는다.
 *
 * @author 황장호
 * @version 2020-09-01
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import {RoamingController} from './roaming.abstract';

export default class RoamingRatesByCountryController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);

    // 단말 정보
    const equipment = {
      number: null,
      name: null,
      code: null,
    };
    if (isLogin) {
      // 로그인 되어있는 경우, svcInfo에 저장된 단말정보를 복사
      equipment.number = svcInfo.svcNum;
      equipment.name = svcInfo.eqpMdlNm;
      equipment.code = svcInfo.eqpMdlCd;
    }

    Observable.combineLatest(
      this.getNationsByContinents('AFR'),
      this.getNationsByContinents('ASP'),
      this.getNationsByContinents('AMC'),
      this.getNationsByContinents('EUR'),
      this.getNationsByContinents('MET'),
      this.getNationsByContinents('OCN'),
    ).subscribe(([afr, asp, amc, eur, met, ocn]) => {
      this.renderDeadline(res, 'roaming-next/roaming.rates.html', {
        svcInfo,
        pageInfo,
        equipment,
        // 로밍 지원 여부 (검색전에는 항상 null)
        meta: null,
        // 마지막 조회했던 파라미터 (항상 null)
        lastQuery: {countryNm: ''},
        isLogin: isLogin,
        // 전체 국가보기 다이얼로그 표시용 데이터
        nations: {afr, asp, amc, eur, met, ocn},
      });
    });
  }

  /**
   * 대륙별 로밍 지원 국가 목록 Redis 조회.
   *
   * @param continent 대륙 코드 (AFR, ASP, AMC, EUR, MET, OCN)
   * @private
   */
  private getNationsByContinents(continent: string): Observable<any> {
    return this.redisService.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.result.contnPsbNation;
    });
  }
}
