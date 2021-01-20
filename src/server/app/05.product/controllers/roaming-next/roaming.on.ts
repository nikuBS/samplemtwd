/**
 * @desc 로밍모드.
 * @author 황장호
 * @since 2020-09-01
 *
 * BFF_10_0056: 현재 사용중인 요금제 목록
 * BFF_10_0058: 국가별 로밍 이용요금 조회
 * BFF_10_0061: 국가별 로밍 가능여부 조회
 * BFF_10_0091: 사용중인 요금제의 이용 기간 조회
 * BFF_10_0199: 국가정보 조회
 * BFF_10_0200: 해당 국가에서 이용 가능한 모든 요금제 조회
 * BFF_05_0001: 실시간 잔여량
 * BFF_05_0201: 실시간 잔여량 (로밍)
 * BFF_05_0227: baro 통화 사용량
 */
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import MyTHelper from '../../../../utils/myt.helper';
import { RoamingController } from './roaming.abstract';
import RoamingHelper from './roaming.helper';

export default class RoamingOnController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    const mcc = req.query.mcc || req.cookies['ROAMING_MCC'];
    if (!mcc) {
      res.redirect('/product/roaming');
      return;
    }
    this.setDeadline(res);

    const context: any = {
      svcInfo,
      pageInfo,
      isLogin,
      /**
       * 요금제 가입여부
       */
      noSubscription: true,
      /**
       * 이 국가(MCC 기반)에서 이용 가능한 모든 요금제 목록
       */
      availableTariffs: [],
      /**
       * 현재 사용중인 요금제 Object
       */
      currentTariff: null,
      /**
       * 최상단 실시간 이용량 카드에서 사용할 1) 데이터 잔여량 2) baro 통화 사용량
       */
      usage: {},
      /**
       * 이 국가(MCC 기반)에서 로밍 이용가능 여부 (BFF_10_0061 결과값)
       */
      meta: null,
      /**
       * 현재 국가(MCC 기반)가 로밍이 가능한 국가인지 확인하는 함수.
       * 로밍 미지원국가(MCC 637)
       */
      isAvailable: function() {
        const avail = context.meta && context.meta.voiceRoamingYn === 'Y' && context.meta.dataRoamingYn === 'Y';
        return avail ? true : false;
      },
      /**
       * Redis 대륙별 모든 국가 목록
       */
      nations: {},
    };
    const template = 'roaming-next/roaming.on.html';

    Observable.combineLatest(
      this.getCountryInfo(mcc),
      RoamingHelper.nationsByContinents(this.redisService),
    ).subscribe(([info, nations]) => {
      context.nations = nations;
      if (!info) { // 로밍 미지원 국가 케이스
        context.country = {
          mcc: mcc,
          code: null,
          name: null,
          nameEnglish: null, // 미사용
          timezoneOffsets: 0,
          flagUrl: null,
          backgroundUrl: null,
          meta: null,
        };
        // 국가정보가 없을 때, 공통배경이미지를 가져오기 위해 그리스 mcc=202를 사용
        this.getCountryInfo('202').subscribe(common => {
          context.country.backgroundUrl = RoamingHelper.penetrateUri(common.mblRepImg);
          this.renderDeadline(res, template, context);
        });
        return;
      }

      // 로밍 지원 국가 케이스
      context.country = {
        code: info.countryCode,
        name: info.countryNm,
        mcc: mcc,
        nameEnglish: info.countryNmEng, // 미사용
        timezoneOffset: info.tmdiffTms,
        flagUrl: RoamingHelper.penetrateUri(info.mblNflagImg),
        backgroundUrl: RoamingHelper.penetrateUri(info.mblRepImg),
        backgroundMiniUrl: RoamingHelper.penetrateUri(info.mblBgImg),
      };
      if (!isLogin) {
        this.getRoamingMeta(context.country.code).subscribe(meta => {
          if (RoamingHelper.renderErrorIfAny(this.error, res, svcInfo, pageInfo, [meta])) {
            this.releaseDeadline(res);
            return;
          }
          context.meta = meta;
          this.renderDeadline(res, template, context);
        });
      } else {
        this.processAuthenticated(req, res, template, context, mcc, info.countryCode);
      }
    });
  }

  /**
   * @desc 로밍 지원 국가이고 로그인 상태일 때의 entry 함수
   *
   * @param req Express Request
   * @param res Express Response
   * @param template EJS 파일 경로
   * @param context Context instance
   * @param mcc mobileCountryCode
   * @param countryCode 국가코드 3자리
   * @private
   */
  private processAuthenticated(req: Request, res: Response, template: string, context: any, mcc: string, countryCode: string) {
    // 이 EJS 페이지 내에서 반복적으로 사용될 가능성이 있는 함수들인
    // formatBytes, formatTime, formatDuration 을 context에 함께 묶어 보낸다.
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
        let s = date.format('YYYY. M. D.');
        if (time) {
          s += time;
        }
        return s;
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
      // BFF_10_0056(나의로밍이용연황)의 리턴값이 없거나 길이가 0인경우 noSubscription은 false가 입력됨, true이면 요금제 가입된 상태
      const noSubscription = !usingTariffs || usingTariffs.length === 0;
      context.noSubscription = noSubscription;

      // 요금제 미사용 케이스
      if (noSubscription) {
        Observable.combineLatest(
          this.getAvailableTariffs(mcc),
          this.getPhoneUsage({}),
          this.getRateByCountry(countryCode),
          this.getRoamingMeta(countryCode),
        ).subscribe(([allTariffs, phoneUsage, rate, meta]) => {
          if (RoamingHelper.renderErrorIfAny(this.error, res, null, null,
            [allTariffs, rate, meta])) {
            this.releaseDeadline(res);
            return;
          }

          if (!allTariffs) {
            allTariffs = [];
          }
          context.availableTariffs = allTariffs.map(t => RoamingHelper.formatTariff(t));
          // Phone 이용률 카드는 2020. 9. 24 스펙에서 제외 되었으므로 빈 값으로 채움 - 기존 1차 이지만 이후 변경됨 (오병소)
          // context.usage.phone = {
          //   voice: 0,
          //   sms: 0,
          // };
          context.usage.phone = phoneUsage;
          context.rate = rate;
          context.meta = meta;
          this.renderDeadline(res, template, context);
        });
      } else {
        // 사용중인 요금제가 있는 경우
        const current = usingTariffs[0]; // FIXME: 정말 첫번째를 보여줘도 되는가?
        current.group = RoamingHelper.getTariffGroup(current.prodId);

        this.getTariffDateRange(current.prodId).subscribe(r => {
          if (RoamingHelper.renderErrorIfAny(this.error, res, null, null, [r])) {
            this.releaseDeadline(res);
            return;
          }
          // svcStartDt - 시작일
          // svcEndDt - 종료일
          // svcStartTm - 시작시간
          // svcEndTm - 종료시간
          if (r.result && r.code === API_CODE.CODE_00) {
            const range = r.result;
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
          current.statusMessage = '이용 중';
          if (current.startDate && current.startDate.isAfter(now)) {
            current.status = 0;
            current.statusMessage = '이용 예정';
          } else if (current.endDate && current.endDate.isBefore(now)) {
            current.status = 2;
            current.statusMessage = '이용 완료';
          }

          this.processTariff(context, current, res, template, countryCode);
        });
      }
    });
  }

  /**
   * @desc 로밍 국가이고, 로그인 되어있고, 이용 중인 요금제가 있고,
   *       이용 중인 요금제의 기간 정보도 조합된 상태의 entrypoint
   *
   * @param context Context
   * @param current 최상단 카드에 표시할 요금제
   * @param res 응답
   * @param template EJS 파일 경로
   * @param countryCode 국가코드 3자리 (ISO3166)
   * @private
   */
  private processTariff(context: any, current: any, res: Response, template: string, countryCode: string) {
    Observable.combineLatest(
      this.getDataUsage(current),
      this.getPhoneUsage(current),
      this.getBaroPhoneUsage(current, current.startDate, current.endDate),
      this.getRateByCountry(countryCode),
      this.getRoamingMeta(countryCode),
    ).subscribe(([dataUsage, phoneUsage, baroUsage, rate, meta]) => {
      if (RoamingHelper.renderErrorIfAny(this.error, res, null, null, [rate, meta])) {
        this.releaseDeadline(res);
        return;
      }

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

      // 실시간 통화와 데이터 잔여량 조회 BFF의 경우, 한 달에 1번정도 점검을 하므로
      // 이 경우 일반적인 공통 차단 화면이 노출되기보다, 잔여량 UI Card만 차단 메시지가 나오는 것이
      // 더 좋은 사용자 경험이므로, 아래와 같이 차단(BFF0006)의 경우 특수 처리를 한다.

      // 차단 대응. 차단 관련은 BE 이지민 수석이 요청하여 추가하였다.
      if (baroUsage && baroUsage.code === 'BFF0006') {
        context.currentTariff = null;
        context.usage.baro.startTime = moment(baroUsage.result.fromDtm, 'YYYYMMDDHHmmss');
        context.usage.baro.endTime = moment(baroUsage.result.toDtm, 'YYYYMMDDHHmmss');
        this.renderDeadline(res, template, context);
        return;
      }

      if (current.group === 4) {
        // 요금제 그룹 4번은 괌사이판 *국내처럼* 이므로, 국내 실시간 잔여량 API 결과값을 활용한다.
        if (dataUsage.totalRemainUnLimited) {
          // 합산된 total 계산이 불가한 무제한일 경우
          context.usage.data = {code: '-', msg: '무제한'};
        } else if (dataUsage.gnrlData) {
          // gnrlData 에서 주는 used, total 값은 KB 단위이다.
          const total = dataUsage.gnrlData.reduce((p, item) => {
            return p + (item.total ? parseInt(item.total, 10) : 0);
          }, 0);
          const used = dataUsage.gnrlData.reduce((p, item) => {
            return p + (item.used ? parseInt(item.used, 10) : 0);
          }, 0);
          // 기존 context.usage.formatBytes 함수는 MB 단위에 string 을 기대한다.
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

      // OP002-12365 로밍모드 오류개선건의 개시일/종료일 모두 변경 가능해야 되는 요금제 대응
      context.currentTariff.changeDate = '/product/roaming/setting/roaming-auto'
      if ([5, 6, 7, 9, 10, 11].indexOf(current.group) >= 0) {
        context.currentTariff.changeDate = '/product/roaming/setting/roaming-setup';
      }

      if (current.group === 7) {
        // baro OnePass 300 기간형
        // baro OnePass 300 기간형2
        // baro OnePass 500 기간형
        // baro OnePass 500 기간형2
        // 'NA00004088' 'NA00004883 'NA00005047' 'NA00005048'

        // 상품명 제목에서 일일 제공 데이터량을 추출
        const m = new RegExp('[0-9]{2,3}').exec(current.prodNm);
        if (m) {
          context.usage.data = {code: '-', msg: '일일 제공<br />' + m[0] + 'MB'};
        } else {
          // 상품명에 숫자가 없을 가능성 희박하나 방어코드
          context.usage.data = {code: '-', msg: '일일 제공'};
        }
      }
      if (current.group === 8) {
        // 괌사이판
        context.usage.data = {code: '-', msg: '일일 제공<br />500MB'};
      }
      if (current.group === 9) {
        // T로밍 중국 플러스
        context.usage.data = {code: '-', msg: '일일 제공<br />300MB'};
      }
      if (current.group === 10) {
        // 팅/실버 무한톡
        context.usage.data = {code: '-', msg: '제한 속도<br />데이터 제공'};
      }
      if (current.group === 11) {
        // T로밍 중국.
        // 요금제 그룹 11번은 PieChart 표시하지 않는 것이 스펙이라 null 대입
        context.usage.data = null;
      }
      if (current.group === 14) {
        // baro OnePass 300 기본형
        // baro OnePass 500 기본형

        // 상품명 제목에서 일일 제공 데이터량을 추출
        const m = new RegExp('[0-9]{2,3}').exec(current.prodNm);
        if (m) {
          context.usage.data = {code: '-', msg: '일일 제공<br />' + m[0] + 'MB'};
        } else {
          // 상품명에 숫자가 없을 가능성 희박하나 방어코드
          context.usage.data = {code: '-', msg: '일일 제공'};
        }
        // 그룹 14에는 300, 500 2개인데 기존에는 300MB 하드코딩 되어있었어서 그룹 7처럼 정규식 사용하는 코드로 변경
        // context.usage.data = {code: '-', msg: '일일 제공<br />300MB'};
      }

      if ([12, 13, 14].indexOf(current.group) >= 0) {
        context.currentTariff.startDate = null;
      }
      this.renderDeadline(res, template, context);
    });
  }

  /**
   * @desc 해당 국가의 메타정보인 국가명, 한국과의 tzOffset, 국기 이미지 리소스 등
   *       BFF_10_0199
   *
   * @param mcc mobileCountryCode
   * @private
   */
  private getCountryInfo(mcc): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: mcc}).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      // countryCode, countryNm, countryNmEng, tmdiffTms(시차)
      // mblNflagImg(국기이미지), alt
      // mblRepImg(대표이미지), alt
      // mblBgImg(배경이미지), alt
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
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
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
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
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
    // svcStartDt - 시작일
    // svcEndDt - 종료일
    // svcStartTm - 시작시간
    // svcEndTm - 종료시간
    return this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId]);
  }

  /**
   * 실시간 데이터 잔여량 조회.
   * 요금제 그룹4(괌사이판 국내처럼)의 경우 국내 데이터를 조회한다.
   *
   * @param current 현재 선택된 요금제 Object
   * @private
   */
  private getDataUsage(current: any): Observable<any> {
    if (current.status === 0) {
      // 이용예정
      return Observable.of({});
    }
    if (current.group >= 5) {
      // 요금제 그룹 5~14는 사용량 조회 N이라 BFF 조회 불필요
      return Observable.of({});
    }
    if (current.group === 4) {
      // 괌사이판 국내처럼의 경우, 국내 데이터 잔여량 체크
      return this.apiService.request(API_CMD.BFF_05_0001, {}).map(resp => {
        const error = RoamingHelper.checkBffError(resp);
        if (error) { return error; }

        // 추후 MyTHelper.parseUsageData가 가공한 .used, .total 필드를 사용하기 위함
        return MyTHelper.parseUsageData(resp.result);
      });
    }
    // 요금제 그룹 1, 2, 3은 여기로 온다.
    return this.apiService.request(API_CMD.BFF_05_0201, {}).map(resp => {
      // prodId,
      // prodNm,
      // total: '20000', 기본제공량(MB)
      // used: '14551', 사용량(MB)
      // remained: '5449', 잔여량(MB)
      // rgstDtm: '2018112803', // 등록일시 YYYYMMDDHH
      // exprDtm: '2018112823', // 종료일시 YYYYMMDDHH
      if (!resp.result) {
        // BLN0007: 잔여량 조회 가능 항목이 없습니다
        // BLN0012: 조회 대상이 아닙니다

        // this.logger.warn(this, 'BFF_05_0201 failed', resp);
        // [NOTE]
        // 인증된 TID와 요금제 이용기간이 API 호출 시점과 계속 달라지기 때문에
        // 테스트가 매우 어려운 부분이 있다.
        return {code: resp.code, msg: resp.msg};
      }
      return resp.result;
    });
  }

  /**
   * 실시간 잔여량 조회 (기본통화 등)
   * @param current 사용중인 요금제
   * @private
   */
  private getPhoneUsage(current: any): Observable<any> {
    // if (current.status === 0) {
    //   return Observable.of({});
    // }
 
    // 현재 가입한 로밍 요금제가 있을 경우 해당 월일 셋팅 및 BFF API 조회를 위하여 날짜를 넘겨줌
    let roStartDate: any;  // 가입한 로밍 요금제가 있을 경우 BFF API에 YYMMDD로 보내 줘야 함
    // let splitRoStartDate: any;  // 분할한 로밍 요금제 시작 날짜
    // let splitRoStartTime: any;  // 분할한 로밍 요금제 시작 시간

    // let curStartDate: any;
    if(current && current.startDate && current.statusMessage === '이용 중') {  // current.currentTariff에 current를 넣지 않은 상태임
      roStartDate = current.startDate.format('YYYYMMDD');
      // splitRoStartDate = roStartDate.match(/.{1,2}/g); /* ["20", "20", "10", "30", "15"] */;
      // splitRoStartTime = (current.startTime).trim().split(':');
    }

    // 타회선 조회시 T-SvcMgmtNum 넘겨야함
    // BFF_05_0228(new) NRTRDE 사용량 조회-샘플 - 로밍 총 통화시간
    return this.apiService.request(API_CMD.BFF_05_0228, !FormatHelper.isEmpty(roStartDate) ? {startDate: roStartDate} : {}).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }

      resp.result.map((phone: { totalDuration: string; korCurTime: string; oneMonthBeforeDate: string; totalHours: any; totalMinutes: any; totalSeconds: any; baseKoCurMonth: any; 
        baseKoCurDay: any; baseKoCurTime: any; baseOneMonthBeforeMonth: any;  baseOneMonthBeforeDay: any; roStartDate: any; roUseTariffNow: any; }) => {

        let splitTotalDuration: any = phone.totalDuration.split(':'); // 총 음성 통화 시간 분할
        let splitBaseKoCurTime: any = phone.korCurTime.match(/.{1,2}/g); // ["20", "20", "10", "30", "15"], 한국현재시간
        let splitOneMonthBeforeDate: any = phone.oneMonthBeforeDate.match(/.{1,2}/g); // ["20", "20", "10", "30", "15"], 현재기준1개월전날짜 - 요금제 미가입 또는 시작시간 없는 요금제에만 사용
        /* console.log(splitBaseKoTime) */
        phone.totalHours = splitTotalDuration[0];
        phone.totalMinutes = splitTotalDuration[1];
        phone.totalSeconds = splitTotalDuration[2];
        phone.baseKoCurMonth = splitBaseKoCurTime[2];
        phone.baseKoCurDay = splitBaseKoCurTime[3];
        phone.baseKoCurTime = splitBaseKoCurTime[4];
        phone.baseOneMonthBeforeMonth = splitOneMonthBeforeDate[2];
        phone.baseOneMonthBeforeDay = splitOneMonthBeforeDate[3];
        if (!FormatHelper.isEmpty(roStartDate)) {
          phone.roStartDate = roStartDate;
        }
        phone.roUseTariffNow = (current && current.statusMessage === '이용 중') ? true : false;
        // if (!FormatHelper.isEmpty(splitRoStartDate && splitRoStartTime)) {  // 로밍 요금제 가입 및 시작날짜와 시간이 있는 경우
        //   phone.roStartMonth = splitRoStartDate[2];
        //   phone.roStartDay = splitRoStartDate[3];
        //   phone.roStartTime = splitRoStartTime[0];

        // }
      })

      
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
      return resp.result[0];
    });
  }

  /**
   * @desc baro 통화 사용량 조회
   *
   * @param startDate 개시일 YYYY-MM-DD
   * @param endDate 종료일 YYYY-MM-DD
   * @private
   */
  private getBaroPhoneUsage(current: any, startDate: moment.Moment, endDate: moment.Moment): Observable<any> {
    if (current.status === 0) {
      // 이용 예정인 경우 조회 불가
      return Observable.of({});
    }
    if (!startDate) {
      // 시작일이 없는 경우, 오늘 사용량이 나오게 해달라고 함 (by 석연실 매니저)
      startDate = moment();

      // 시작일이 없는 경우, 요금제 가입일(scrbDt) 하루 전을 대체해서 사용했었다.
      // if (current.scrbDt) {
      //   startDate = moment(current.scrbDt, 'YYYYMMDD').add(-1, 'days');
      // } else {
      //   return Observable.of({used: 0, total: '무제한'});
      // }
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

      // [{
      //   extrnid: '01012340000', // 서비스번호
      //   transCount: '0', // 명의변경 이력
      //   usgStartDate: '20200701', // '개시일'
      //   sumTotDur: '10', // 일 사용량 (분)
      // }, {}, ]
      const result = resp.result;

      // code 는 00 이나 실제 통화량 데이터가 empty array 인 케이스 처리.
      if (!result || result.length === 0) {
        if (result && result.length === 0) {
          // 빈 배열인 경우, 통화를 아예 사용하지 않았다고 가정
          return {
            usgStartDate: startDate,
            total: '무제한',
            used: '0'
          };
        }
        // 아래 코드는 dead code 이다. 최상단에서 resp.code !== 00 했기 때문이다.
        // INFO0030 시스템 사정으로 서비스를 일시적으로 이용하실 수 없습니다.
        return {code: resp.code, msg: resp.msg};
      }

      // baro 통화 결과값의 최상단 것을 취하고 있다. 정말 이래도 괜찮은지는 미지수.
      // 그러나 스테이징으로 내린 실고객 테스트 TID 그룹군에서는 데이터가 모두 일치하였다.
      const first = result[0];
      return {
        usgStartDate: first.usgStartDate,
        total: '무제한',
        used: first.sumTotDur,
      };
    });
  }

  /**
   * 국가별 문자/음성/데이터 요율 조회
   *
   * @param countryCode ISO3166 국가코드 3자리
   * @private
   */
  private getRateByCountry(countryCode: string): Observable<any> {
    // [NOTE] 석연실 매니저에 의하면, 고객 VOC 이슈가 생기지 않게 항상 가장 비싼 요율정보를 BE가 리턴하기로 했다고 한다.
    // BFF_10_0058의 manageType 인풋값은 로밍 요율만 필요한 경우 입력 안함(요율정보가 모두 같기 때문에 - 석여실 매니저님, 이지민 수석님)
    return this.apiService.request(API_CMD.BFF_10_0058, {
      countryCode: countryCode,
      showDailyPrice: 'N', // BFF_10_0061 응답의 'rent' 값이 0 보다 클 때는 'Y' 아니면 'N', rent가 아니기 때문에 N로 설정
    }).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      // sMoChargeMin/Max: 문자 - SMS 발신, "165",
      // vIntChargeMin/Max: 음성 - 방문국에서 한국으로, "144.8"
      // dMoChargeMin/Max: 데이터 이용료, "0.28"
      return resp.result;
    });
  }

  /**
   * 국가별 로밍지원 서비스 목록 조회
   *
   * @param countryCode ISO3166 국가코드 3자리
   * @private
   */
  private getRoamingMeta(countryCode: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0061, {
      countryCode: countryCode,
      command: 'withCountry',
    }).map(resp => {
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
}
