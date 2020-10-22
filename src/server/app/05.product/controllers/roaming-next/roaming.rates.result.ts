/**
 * @desc 로밍 국가별 이용요금 조회. (M000455)
 *
 * BFF_10_0061: 국가별 로밍 가능여부 조회
 *
 * @author 황장호
 * @since 2020-09-01
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import {RoamingController} from './roaming.abstract';
import RoamingHelper from './roaming.helper';

export default class RoamingRatesByCountryResultController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);

    const query = {
      // 조회하고자 하는 국가 코드
      countryCd: req.query.code,
      // 조회하고자 하는 국가 명
      countryNm: decodeURIComponent(req.query.nm),
      // 단말 이름
      eqpMdlNm: decodeURIComponent(req.query.eqpNm),
      // 단말 코드
      eqpMdlCd: decodeURIComponent(req.query.eqpCd)
    };
    const apiParams = {
      countryCode: query.countryCd,
      command: 'onlyCountry',
      eqpMdlCd: query.eqpMdlCd,
    };
    // 로그인 여부, 단말 정보 여부에 따라 BFF_10_0061 파라미터를 조합한다.
    // product.roaming.search-result.controller.ts 에서 복사됨
    if (svcInfo) {
      if (!svcInfo.eqpMdlNm) {
        apiParams.command = 'onlyCountry';
      } else {
        apiParams.command = 'withCountry';
      }
    } else {
      // 로밍개선 이전에는 비로그인 시에도 단말 정보를 수동으로 입력할 수 있었기 때문에 아래 코드가 유효했으나,
      // 현재는 단말 정보 수동 지정이 불가능하므로 실행될 기회가 없다.
      if (!query.eqpMdlNm) {
        apiParams.command = 'onlyCountry';
      } else {
        apiParams.command = 'withCountry';
      }
    }

    // 단말 정보. 기존 코드에서 옮겨왔으나 현재는 이용하지 않는다.
    const equipment = {
      number: null,
      name: null,
      code: null,
    };
    if (isLogin) {
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
      this.getRoamingMeta(apiParams),
    ).subscribe(([afr, asp, amc, eur, met, ocn, meta]) => {
      if (RoamingHelper.renderErrorIfAny(this.error, res, svcInfo, pageInfo, [meta])) {
        this.releaseDeadline(res);
        return;
      }
      for (const continent of [afr, asp, amc, eur, met, ocn]) {
        const list = continent;
        // 어떤 이유에서든 '국가명' 누락시, 국가코드로 부터 이를 복원하는 방어코드
        for (const c of list) {
          if (c['countryCode'] === query.countryCd) {
            query.countryNm = c['countryNameKor'];
            break;
          }
        }
      }

      this.renderDeadline(res, 'roaming-next/roaming.rates.html', {
        svcInfo,
        pageInfo,
        // 단말 정보
        equipment,
        // 로밍 지원 여부 (BFF_10_0061)
        meta,
        // 마지막 조회했던 파라미터
        lastQuery: query,
        // 로그인 여부
        isLogin: isLogin,
        // 전체 국가보기 다이얼로그 표시용 데이터
        nations: {afr, asp, amc, eur, met, ocn},
      });
    });
  }

  /**
   * 국가별 로밍 서비스 지원 여부 조회. (BFF_10_0061)
   *
   * @param param command (onlyCountry/withCountry), countryCode (국가코드), eqpMdlCd(단말기 모델 코드)
   * @private
   */
  private getRoamingMeta(param: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0061, param).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      // voiceRoamingYn: 'Y'
      // dataRoamingYn: 'Y'
      // gsm: '3'
      // wcdma: '0'
      // cdma: '0'
      // rent: '0'
      // lte: '0'
      return resp.result;
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
