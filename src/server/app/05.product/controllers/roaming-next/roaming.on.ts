import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';
import moment from 'moment';
import RoamingHelper from './roaming.helper';
import MyTHelper from '../../../../utils/myt.helper';

export default class RoamingOnController extends TwViewController {
  CDN = EnvHelper.getEnvironment('CDN');

  static formatTariff(t) {
    if (!t) {
      return t;
    }
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
      // t.data = DATA_PROVIDED[t.prodId];
      t.data = '-';

      if (t.basOfrMbDataQtyCtt && t.romUsePrdInfo === '0') {
        t.data = '매일 ' + t.basOfrMbDataQtyCtt + 'MB';
      } else if (t.prodId === 'NA00006229') {
        // T괌사이판 5천원
        t.data = '매일 500MB';
      } else if (parseInt(t.basOfrGbDataQtyCtt, 10) > 0) {
        const gbData = parseInt(t.basOfrGbDataQtyCtt, 10);
        t.data = gbData + 'GB';
      } else {
        t.data = t.basOfrMbDataQtyCtt;
      }
    } else {
      const gbData = parseInt(t.basOfrDataQtyCtt, 10);
      if (gbData > 0) {
        t.data = gbData + 'GB';
      } else {
        t.data = t.basOfrDataQtyCtt;
      }
    }

    // OnePass VIP 설명 예외처리
    // NA00006486, NA00006487  VIP
    if (['NA00006486', 'NA00006487'].indexOf(t.prodId) >= 0) {
      t.data = '무제한';
      t.phone = '음성 30분 / 문자 30건 / baro통화 무제한';
    }
    // NA00006744, NA00006745  DATA VIP
    if (['NA00006744', 'NA00006745'].indexOf(t.prodId) >= 0) {
      t.data = '무제한';
    }

    if (!t.phone) {
      t.phone = 'baro통화 무제한';
    }

    return t;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    const mcc = req.query.mcc || req.cookies['ROAMING_MCC'];
    if (!mcc) {
      res.redirect('/product/roaming');
      return;
    }
    const debugTid = req.query.tid;
    if (debugTid && process.env['NODE_ENV'] === 'local') {
      if (!isLogin) {
        res.redirect('/product/roaming/on?userId=' + debugTid + '&mcc=' + mcc);
        return;
      }
      this.apiService.request(API_CMD.BFF_03_0001, {}).subscribe(r0 => {
        this.loginService.logoutSession(req, res).subscribe(r1 => {
          res.cookie('ROAMING_DTD', debugTid);
          res.redirect('/common/member/logout/complete?n=/product/roaming/on');
        });
      });
      return;
    }

    const context: any = {
      svcInfo,
      pageInfo,
      isLogin,
      noSubscription: true,
      availableTariffs: [],
      currentTariff: null,
      usage: {},
      isAvailable: function() {
        return context.meta && context.meta.voiceRoamingYn === 'Y' && context.meta.dataRoamingYn === 'Y';
      },
      nations: {},
    };
    const template = 'roaming-next/roaming.on.html';

    Observable.combineLatest(
      this.getCountryInfo(mcc),
      RoamingHelper.nationsByContinents(this.redisService),
    ).subscribe(([info, nations]) => {
      context.nations = nations;
      if (!info) {
        // res.cookie('ROAMING_MCC', '999');
        // res.redirect('/product/roaming');
        // return;
        context.country = {
          mcc: mcc,
          code: null,
          name: null,
          nameEnglish: null,
          timezoneOffsets: 0,
          flagUrl: null,
          backgroundUrl: null,
          meta: null,
        };
        this.getCountryInfo('202').subscribe(common => {
          context.country.backgroundUrl = RoamingHelper.penetrateUri(common.mblRepImg);
          res.render(template, context);
        });
        return;
      }

      context.country = {
        code: info.countryCode,
        name: info.countryNm,
        mcc: mcc,
        nameEnglish: info.countryNmEng,
        timezoneOffset: info.tmdiffTms,
        flagUrl: RoamingHelper.penetrateUri(info.mblNflagImg),
        backgroundUrl: this._useCountryBackground(info.mblRepImg, mcc),
        backgroundMiniUrl: this._useCountryBackground(info.mblBgImg, mcc),
      };
      if (!isLogin) {
        this.getRoamingMeta(context.country.code).subscribe(meta => {
          context.meta = meta;
          res.render(template, context);
        });
      } else {
        this.processAuthenticated(req, res, template, context, mcc, info.countryCode);
      }
    });
  }

  private processAuthenticated(req: Request, res: Response, template: string, context: any, mcc: string, countryCode: string) {
    context.usage = {
      formatBytes: function(value) {
        const n = parseInt(value, 10);
        if (n === 0) {
          return '0GB';
        }
        if (!n) { return value; }
        if (n < 1024) { return n + 'MB'; }
        if (n % 1024 === 0) { return (n / 1024) + 'GB'; }
        return (n / 1024).toFixed(2) + 'GB';
      },
      formatTime: function(date: moment.Moment, time: string) {
        if (!date) {
          return '';
        }
        let s = date.format('YY.MM.DD');
        if (time) {
          s += time;
        }
        return s;
        // return moment(yyyyMMddHH, 'YYYYMMDDHH').format('YY.MM.DD HH:00');
      },
      formatDuration: function(duration: string) {
        let minutes = parseInt(duration, 10);
        if (isNaN(minutes)) {
          return '';
        }
        if (minutes > 60) {
          const hours = Math.floor(minutes / 60);
          minutes = minutes % 60;
          return `${hours}시간${minutes}분`;
        }
        return `${minutes}분`;
      }
    };

    this.getUsingTariffs().subscribe(usingTariffs => {
      const noSubscription = !usingTariffs || usingTariffs.length === 0;
      context.noSubscription = noSubscription;
      if (noSubscription) {
        Observable.combineLatest(
          this.getAvailableTariffs(mcc),
          this.getPhoneUsage({}),
          this.getRateByCountry(countryCode),
          this.getRoamingMeta(countryCode),
        ).subscribe(([allTariffs, phoneUsage, rate, meta]) => {
          if (!allTariffs) {
            allTariffs = [];
          }
          context.availableTariffs = allTariffs.map(t => RoamingOnController.formatTariff(t));
          context.usage.phone = { // FIXME: hardcoded
            voice: 1,
            sms: 1,
          };
          context.rate = rate;
          context.meta = meta;
          res.render(template, context);
        });
      } else {
        const current = usingTariffs[0];
        current.group = RoamingHelper.getTariffGroup(current.prodId);

        this.getTariffDateRange(current.prodId).subscribe(r => {
          if (r.result && r.code === API_CODE.CODE_00) {
            const range = r.result;
            // if (!range.svcStartDt) {
            //   range.svcStartDt = moment().subtract(3, 'days').format('YYYYMMDD');
            // }
            if (range.svcStartDt) {
              current.startDate = moment(range.svcStartDt, 'YYYYMMDD');
            }
            if (range.svcEndDt) {
              current.endDate = moment(range.svcEndDt, 'YYYYMMDD');
            } else {
              current.endDate = null;
            }

            current.startTime = '';
            current.endTime = '';
            if (range.svcStartTm) {
              current.startTime = ` ${range.svcStartTm}:00`;
              current.startDate.hours(parseInt(range.svcStartTm, 10)).minutes(0).seconds(0).milliseconds(0);
            }
            if (range.svcEndTm) {
              current.endTime = ` ${range.svcEndTm}:00`;
              current.endDate.hours(parseInt(range.svcEndTm, 10)).minutes(0).seconds(0).milliseconds(0);
            }
          }

          const now = moment();
          current.status = 1;
          current.statusMessage = '이용중';
          if (current.startDate.isAfter(now)) {
            current.status = 0;
            current.statusMessage = '이용예정';
          } else if (current.endDate && current.endDate.isBefore(now)) {
            current.status = 2;
            current.statusMessage = '이용완료';
          }

          this.processTariff(context, current, res, template, countryCode);
        });
      }
    });
  }

  private processTariff(context: any, current: any, res: Response, template: string, countryCode: string) {
    Observable.combineLatest(
      this.getDataUsage(current),
      this.getPhoneUsage(current),
      this.getBaroPhoneUsage(current, current.startDate, current.endDate),
      this.getRateByCountry(countryCode),
      this.getRoamingMeta(countryCode),
    ).subscribe(([dataUsage, phoneUsage, baroUsage, rate, meta]) => {
      // BFF_05_0201 (getDataUsage)
      //   troaming-data =>
      // BFF_05_0001 (getPhoneUsage)
      //   my-t/balances => BLN0006 => 잔여량 조회에 실패하였습니다
      // BFF_10_0202 (getBaroPhoneUsage)
      //   roaming/mode/baro-traffic-info => BFF0001 => 요청이 실패했습니다.
      context.noSubscription = false;
      context.currentTariff = current;
      context.usage.data = dataUsage;
      context.usage.baro = baroUsage;
      context.usage.phone = phoneUsage;
      context.rate = rate;
      context.meta = meta;

      if (current.group === 4) {
        if (dataUsage.totalRemainUnLimited) {
          context.usage.data = {code: '-', msg: '무제한'};
        } else if (dataUsage.gnrlData) {
          const total = dataUsage.gnrlData.reduce((p, item) => {
            return p + (item.total ? parseInt(item.total, 10) : 0);
          }, 0);
          const used = dataUsage.gnrlData.reduce((p, item) => {
            return p + (item.used ? parseInt(item.used, 10) : 0);
          }, 0);
          context.usage.data = {
            used: '' + Math.floor(used / 1024),
            total: '' + Math.floor(total / 1024),
          };
        } else {
          if (dataUsage.code === 'BLN0004') {
            dataUsage.msg = '국내 잔여량<br />조회 불가';
          }
        }
      }
      if ([5, 6, 12, 13].indexOf(current.group) >= 0) {
        context.usage.data = {code: '-', msg: '무제한'};
      }
      if (current.group === 7) {
        const m = new RegExp('[0-9]+').exec(current.prodNm);
        if (m) {
          context.usage.data = {code: '-', msg: '일일 제공<br />' + m[0] + 'MB'};
        } else {
          context.usage.data = {code: '-', msg: '일일 제공'};
        }
      }
      if (current.group === 8) {
        context.usage.data = {code: '-', msg: '일일 제공<br />500MB'};
      }
      if (current.group === 9) {
        context.usage.data = {code: '-', msg: '일일 제공<br />300MB'};
      }
      if (current.group === 10) {
        context.usage.data = {code: '-', msg: '제한속도<br />데이터 제공'};
      }
      if (current.group === 11) {
        context.usage.data = null;
      }
      if (current.group === 14) {
        context.usage.data = {code: '-', msg: '일일 제공<br />300MB'};
      }

      if ([12, 13, 14].indexOf(current.group) >= 0) {
        context.currentTariff.startDate = null;
      }
      res.render(template, context);
    });
  }

  private _useCountryBackground(uri, mcc: string): string {
    let backgroundUrl = uri;
    if (backgroundUrl) {
      backgroundUrl = RoamingHelper.penetrateUri(backgroundUrl);
    } else {
      backgroundUrl = `${this.CDN}/img/product/roam/background_aus.png`;
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
      // mblNflagImg, alt
      // mblRepImg, alt
      // mblBgImg, alt
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
   * 사용중인 로밍요금제의 기간 조회
   * @param prodId
   * @private
   */
  private getTariffDateRange(prodId: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId]);
  }

  /**
   * 실시간 로밍데이터 잔여량
   * @param isLogin
   * @private
   */
  private getDataUsage(current: any): Observable<any> {
    if (current.status === 0) {
      // 이용예정
      return Observable.of({});
    }
    if (current.group >= 5) {
      return Observable.of({});
    }
    if (current.group === 4) {
      // 괌사이판 국내처럼의 경우, 국내 데이터 잔여량 체크
      return this.apiService.request(API_CMD.BFF_05_0001, {}).map(resp => {
        if (!resp.result) {
          // BLN0004: 잔여량 조회 가능 항목이 없습니다
          if (false) {
            return MyTHelper.parseUsageData({
              gnrlData: [
                {
                  used: '15660',
                  total: '28384',
                  unit: '140',
                },
                {
                  used: '15000',
                  total: '20000',
                  unit: '140',
                },
              ]
            });
          }
          return {code: resp.code, msg: resp.msg};
        }
        return MyTHelper.parseUsageData(resp.result);
      });
    }
    return this.apiService.request(API_CMD.BFF_05_0201, {}).map(resp => {
      // prodId,
      // prodNm,
      // total: '20000', 기본제공량(MB)
      // used: '14551', 사용량(MB)
      // remained: '5449', 잔여량(MB)
      // rgstDtm: '2018112803', // 등록일시 YYYYMMDDHH
      // exprDtm: '2018112823', // 종료일시 YYYYMMDDHH
      if (!resp.result) {
        this.logger.warn('BFF_05_0201 failed', resp);
        // BLN0007: 잔여량 조회 가능 항목이 없습니다
        // BLN0012: 조회 대상이 아닙니다
        return {code: resp.code, msg: resp.msg};
      }
      return resp.result;
    });
  }

  /**
   * 실시간 잔여량 조회 (기본통화 등)
   * @param isLogin
   * @private
   */
  private getPhoneUsage(current: any): Observable<any> {
    if (current.status === 0) {
      return Observable.of({});
    }
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
  private getBaroPhoneUsage(current: any, startDate: moment.Moment, endDate: moment.Moment): Observable<any> {
    if (current.status === 0) {
      return Observable.of({});
    }
    if (!current.endDate) {
      endDate = moment();
    }
    if (current.endDate && current.endDate.isAfter(moment())) {
      endDate = moment();
    }

    return this.apiService.request(API_CMD.BFF_05_0227, {
      usgStartDate: startDate.format('YYYYMMDD'),
      usgEndDate: endDate.format('YYYYMMDD'),
    }).map(resp => {
      // svcMgmtNo: '10003154' // 서비스관리번호
      // extrnid: '01012340000', // 서비스번호
      // transCount: '0', // 명의변경 이력
      // usgStartDate: '20200701', // '개시일'
      // sumTotDur: '10', // 일 사용량 (분)
      const result = resp.result;
      if (!result || result.length === 0) {
        if (result && result.length === 0) {
          return {
            usgStartDate: startDate,
            total: '무제한',
            used: '0'
          };
        }
        // INFO0030 시스템 사정으로 서비스를 일시적으로 이용하실 수 없습니다.
        return {code: resp.code, msg: resp.msg};
      }

      const first = result[0];
      return {
        usgStartDate: first.usgStartDate,
        total: '무제한',
        used: first.sumTotDur,
      };
    });
  }

  /**
   *
   * @param countryCode ISO3166 국가코드 3자리
   * @private
   */
  private getRateByCountry(countryCode: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0058, {
      countryCode: countryCode,
      manageType: 'W',
      showDailyPrice: 'N',
    }).map(resp => {
      // sMoChargeMin/Max: 문자 - SMS 발신, "165",
      // vIntChargeMin/Max: 음성 - 방문국에서 한국으로, "144.8"
      // dMoChargeMin/Max: 데이터 이용료, "0.28"
      return resp.result;
    });
  }

  private getRoamingMeta(countryCode: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0061, {
      countryCode: countryCode,
      command: 'withCountry',
    }).map(resp => {
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
}
