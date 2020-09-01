import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import moment from 'moment';
import RoamingOnController from './roaming.on';
import RoamingHelper from './roaming.helper';
import EnvHelper from '../../../../utils/env.helper';

export default class RoamingTariffOfferController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    const countryCode = req.query.code;

    const from = moment(req.query.from, 'YYYYMMDD');
    const to = moment(req.query.to, 'YYYYMMDD');
    const night = to.diff(from) / 86400 / 1000;

    Observable.combineLatest(
      this.getCountryInfo(RoamingHelper.getMCC(countryCode)),
      this.getRecommendedTariff(countryCode, from.format('YYYYMMDD'), to.format('YYYYMMDD')),
      this.getAvailableTariffs(countryCode),
    ).subscribe(([country, recommended, allTariffs]) => {
      res.render('roaming-next/roaming.tariff.offer.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        country: {
          code: country.countryCode,
          name: country.countryNm,
          imageUrl: country.mblRepImg
            // FIXME:
            || EnvHelper.getEnvironment('CDN') + '/img/product/roam/background_aus.png',
        },
        night: night,
        days: night + 1,
        recommended,
        availableTariffs: allTariffs.map(t => RoamingOnController.formatTariff(t)),
      });
    });
  }

  protected get noUrlMeta(): boolean {
    return true;
  }

  /**
   * 해당 국가의 메타정보인 국가명, 한국과의 tzOffset, 국기 이미지 리소스 등
   *
   * @param mcc mobileCountryCode 3자리
   * @private
   */
  private getCountryInfo(mcc: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc}).map(resp => {
      // countryCode, countryNm, countryNmEng, tmdiffTms
      return resp.result;
    });
  }

  /**
   * 해당 국가로의 주어진 일정동안 사용하기 적절한 추천 요금제를 가져온다.
   *
   * @param countryCode 3자리 국가코드
   * @param startDate yyyyMMdd
   * @param endDate yyyyMMdd
   * @private
   */
  private getRecommendedTariff(countryCode: string, startDate: string, endDate: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0196, {
      countryCode,
      svcStartDt: startDate,
      svcEndDt: endDate
    }).map(resp => {
      console.log(resp);
      // prodId
      // prodNm
      // prodSmryDesc
      // basFeeInfo
      // startEndTerm: '7'
      // neiborRomPsblNatInfo
      const item: any = resp.result;
      if (!item.prodId) {
        // FIXME: 추천요금제가 나오지 않으면, 항상 baro 3GB 리턴
        item.prodId = 'NA00006489';
        item.prodNm = 'baro 3GB';
        item.prodSmryDesc = '아시아,미주,유럽,호주에서 7일간 로밍데이터 3GB를 이용하는 요금제입니다.';
        item.basFeeInfo = '상세참조';
        item.startEndTerm = '7';

        item.price = '29,000원/7일';
        item.data = '4GB';
        item.phone = 'baro통화 무제한';
      }
      return item;
    });
  }

  private getAvailableTariffs(countryCode: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0200, {countryCode}).map(resp => {
      // prodGrpId: 'T000000091',
      // prodId: 'NA0000000',
      // prodNm: 'T로밍 아시아패스',
      // romUsePrdInfo: '30', // 로밍사용기간정보
      // basOfrMbDataQtyCtt: '-', // 기본제공 MB데이터량 내용
      // basOfrDataQtyCtt: '-', // 기본제공 데이터량 내용
      // prodBaseBenfCtt: 'baro통화 무료', // 상품 기본혜택 내용
      // basFeeInfo: '40000', // 상품금액
      return resp.result;
    });
  }
}
