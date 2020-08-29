import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';
import moment from 'moment';

const ISO3166 = {
  '412': ['AFG', 'AF'], '276': ['ALB', 'AL'], '722': ['ARG', 'AR'], '505': ['AUS', 'AU'], '232': ['AUT', 'AT'],
  '206': ['BEL', 'BE'], '470': ['BGD', 'BD'], '302': ['CAN', 'CA'], '228': ['CHE', 'CH'], '730': ['CHL', 'CL'],
  '460': ['CHN', 'CN'], '244': ['FIN', 'FI'], '208': ['FRA', 'FR'], '234': ['GBR', 'GB'], '310': ['USA', 'US'],
  '202': ['GRC', 'GR'], '454': ['HKG', 'HK'], '372': ['HTI', 'HT'], '216': ['HUN', 'HU'], '510': ['IDN', 'ID'],
  '404': ['IND', 'IN'], '425': ['ISR', 'IL'], '222': ['ITA', 'IT'], '440': ['JPN', 'JP'], '270': ['LUX', 'LU'],
  '455': ['MAC', 'MO'], '515': ['PHL', 'PH'], '530': ['NZL', 'NZ'], '250': ['RUS', 'RU'], '240': ['SWE', 'SW'],
  '520': ['THA', 'TH'], '452': ['VNM', 'VN'], '549': ['WSM', 'WS'], '214': ['ESP', 'ES'], '262': ['DEU', 'DE'],
};
const TMP_BACKGROUND = {
  '412': 'https://s-media-cache-ak0.pinimg.com/736x/9a/89/0c/9a890cf6cbb42fdb2762b616c38c888d.jpg',
  '440': 'https://i.pinimg.com/originals/01/14/fd/0114fd9f04d7e313f9a3266c2885adca.jpg',
  '505': EnvHelper.getEnvironment('CDN') + '/img/product/roam/background_aus.png',
  '262': 'https://i.pinimg.com/originals/2d/af/b1/2dafb17f4df7f128bce1c29e2e469ff4.jpg',
  '222': 'https://leger2.imgix.net/Includes/images/overview/italy/rome.jpg?auto=compress,enhance,format&q=30',
  '250': 'https://lirp-cdn.multiscreensite.com/1edbeafc/dms3rep/multi/opt/Moscow+-+IFDAS+Home+Page+Round-640w.jpg',
  '515': 'https://i.pinimg.com/originals/15/d2/0e/15d20ef6051733f19bcd99b8f2931db0.jpg',
  '234': 'https://media.cntraveller.in/wp-content/uploads/2014/02/London-background-image---123rf-resized-credited5-768x768.jpg',
  '310': 'https://cdn.pratico-pratiques.com/app/uploads/sites/7/2018/09/19151650/new-york-en-famille-c-est-possible.jpeg',
  '452': 'http://2.bp.blogspot.com/-uC82665_9iM/Tnd1FMx6aMI/AAAAAAAAAKo/4ZBg3kO6c_M/s1600/hanoi_vietnam_01.jpg',
};
const DATA_PROVIDED = {
  'NA00006489': '3GB',
  'NA00006493': '4GB',
  'NA00006497': '7GB',
  'NA00006491': '4GB',
  'NA00006499': '8GB',
  'NA00004088': '매일 300MB',
  'NA00005047': '매일 500MB',
  'NA00006745': '데이터 무제한',
  'NA00006487': '데이터 무제한',
  'NA00005300': '2GB',
  'NA00005505': '3GB',
  'NA00005252': '5GB',
};

export default class RoamingOnController extends TwViewController {
  CDN = EnvHelper.getEnvironment('CDN');

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    let mcc = req.query.mcc;
    if (!mcc) {
      // throw new Error('MCC is required');
      // FIXME: Testing
      mcc = '262';
    }

    const context: any = {
      svcInfo,
      pageInfo,
      isLogin,
      noSubscription: true,
      availableTariffs: [],
      usage: {},
    };
    const template = 'roaming-next/roaming.on.html';

    this.getCountryInfo(mcc).subscribe(info => {
      context.country = {
        code: info.countryCode,
        name: info.countryNm,
        nameEnglish: info.countryNmEng,
        timezoneOffset: info.tmdiffTms,
        flagUrl: `${this.CDN}${info.mblNflagImg}`,
        flagCode: ISO3166[mcc][1].toLowerCase(),
        backgroundUrl: this._useCountryBackground(info, mcc),
      };
      if (!isLogin) {
        res.render(template, context);
      } else {
        this.getUsingTariffs().subscribe(usingTariffs => {
          const noSubscription = !usingTariffs || usingTariffs.length === 0;
          context.noSubscription = noSubscription;
          if (noSubscription && false) {
            Observable.combineLatest(
              this.getAvailableTariffs(mcc),
              this.getPhoneUsage(),
            ).subscribe(([allTariffs, phoneUsage]) => {
              context.availableTariffs = allTariffs.map(t => this._fixTariffInstance(t));
              context.usage.phone = {
                voice: 92,
                sms: 37
              };
              res.render(template, context);
            });
          } else {
            let startDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
            if (usingTariffs != null) {
              startDate = usingTariffs[0].scrbDt;
            }
            const endDate = moment().format('YYYY-MM-DD');
            Observable.combineLatest(
              this.getDataUsage(),
              this.getPhoneUsage(),
              this.getBaroPhoneUsage(startDate, endDate)
            ).subscribe(([dataUsage, phoneUsage, baroUsage]) => {
              context.noSubscription = false;
              context.usage = {
                data: dataUsage,
                phone: phoneUsage,
                baro: baroUsage,
                formatBytes: function(value) {
                  const n = parseInt(value, 10);
                  if (!n) { return value; }
                  if (n < 1000) { return n + 'MB'; }
                  if (n % 1000 === 0) { return (n / 1000) + 'GB'; }
                  return (n / 1000).toFixed(2) + 'GB';
                },
                formatTime: function(yyyyMMddHH) {
                  return moment(yyyyMMddHH, 'YYYYMMDDHH').format('YY.MM.DD HH:00');
                }
              };

              // FIXME: Testing
              context.usage.data = {
                prodId: '-',
                prodNm: 'baro 3GB',
                total: '3000',
                used: '1730',
                remained: '1270',
                rgstDtm: moment().subtract(2, 'days').format('YYYYMMDD') + '10',
                exprDtm: moment().subtract(-3, 'days').format('YYYYMMDD') + '22',
              };
              context.usage.phone = {
                voice: 146,
                sms: 200,
              };
              context.usage.baro = {
                total: '무제한',
                used: '7'
              };
              res.render(template, context);
            });
          }
        });
      }
    });
  }

  private _fixTariffInstance(t) {
    if (t.basFeeInfo) {
      let iFee: any = parseInt(t.basFeeInfo, 10);
      if (iFee) {
        if (iFee >= 1000) {
          iFee = iFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        t.price = iFee + '원';
      } else {
        t.price = t.basFeeInfo;
      }
    }
    if (t.romUsePrdInfo) {
      const value = parseInt(t.romUsePrdInfo, 10);
      t.duration = value <= 1 ? 1 : value;
    } else {
      t.duration = 1;
    }
    if (!t.basOfrDataQtyCtt || t.basOfrDataQtyCtt === '-') {
      t.data = DATA_PROVIDED[t.prodId];
    } else {
      t.data = t.basOfrDataQtyCtt;
    }
    return t;
  }


  private _useCountryBackground(info, mcc: string): string {
    let backgroundUrl = info.mblRepImg;
    if (backgroundUrl) {
      backgroundUrl = `${this.CDN}${backgroundUrl}`;
      if (process.env.LOGNAME === 'rath') {
        backgroundUrl = `${this.CDN}/img/product/roam/background_aus.png`;
      }
    } else {
      backgroundUrl = TMP_BACKGROUND[mcc] || `${this.CDN}/img/product/roam/background_aus.png`;
    }
    return backgroundUrl;
  }

  protected get noUrlMeta(): boolean {
    return true;
  }

  /**
   * 해당 국가의 메타정보인 국가명, 한국과의 tzOffset, 국기 이미지 리소스 등
   *
   * @param mcc mobileCountryCode
   * @private
   */
  private getCountryInfo(mcc): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: mcc}).map(resp => {
      // countryCode, countryNm, countryNmEng, tmdiffTms
      return resp.result;
    });
  }

  /**
   * 해당 국가에서 이용 가능한 모든 요금제 목록
   *
   * @param mcc mobileCountryCode
   * @private
   */
  private getAvailableTariffs(mcc): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0200, {mcc: mcc}).map(resp => {
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

  /**
   * 현재 사용중인 로밍요금제 목록
   * @private
   */
  private getUsingTariffs(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0056, {}).map(resp => {
      // prodId: 'NA0000000',
      // prodNm: 'T로밍 아시아패스',
      // basFeeTxt: '25000'
      // scrbDt: '20170915',
      // prodSetYn: 'Y'
      // prodTermYn: 'Y'
      return resp.result.roamingProdList;
    });
  }

  /**
   * 실시간 로밍데이터 잔여량
   * @param isLogin
   * @private
   */
  private getDataUsage(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0201, {}).map(resp => {
      // prodId,
      // prodNm,
      // total: '20000', 기본제공량(MB)
      // used: '14551', 사용량(MB)
      // remained: '5449', 잔여량(MB)
      // rgstDtm: '2018112803', // 등록일시 YYYYMMDDHH
      // exprDtm: '2018112823', // 종료일시 YYYYMMDDHH
      return resp.result;
    });
  }

  /**
   * 실시간 잔여량 조회 (기본통화 등)
   * @param isLogin
   * @private
   */
  private getPhoneUsage(): Observable<any> {
    // 타회선 조회시 T-SvcMgmtNum 넘겨야함
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map(resp => {
      // dataTopUp
      // ting
      // dataDiscount
      // gnrlData, voice, sms, etc, spclData,
      // - prodId
      // - prodNm
      // - skipId
      // - skipNm
      // - unlimit: '0'
      // - total: '9437184'
      // - used
      // - remained
      // - unit: '140', // 단위코드
      // - rgstDtm
      // - exprDtm
      return resp.result;
    });
  }

  /**
   * baro 통화 사용량 조회
   * @param startDate 개시일 YYYY-MM-DD
   * @param endDate 종료일 YYYY-MM-DD
   * @private
   */
  private getBaroPhoneUsage(startDate: string, endDate: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0202, {
      usgStartDate: startDate,
      usgEndDate: endDate,
    }).map(resp => {
      // svcMgmtNo: '10003154' // 서비스관리번호
      // extrnid: '01012340000', // 서비스번호
      // transCount: '0', // 명의변경 이력
      // usgStartDate: '20200701', // '개시일'
      // sumTotDur: '10', // 일 사용량 (분)
      return resp.result;
    });
  }
}
