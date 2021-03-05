/**
 * @file main.home.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.06
 * @desc 메인 > 홈
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../types/api-command.type';
import {
  HOME_SMART_CARD,
  LOGIN_TYPE,
  MEMBERSHIP_GROUP,
  MYT_FARE_BILL_CO_TYPE,
  PRODUCT_5GX_TICKET_TIME_SET_SKIP_ID,
  PRODUCT_5GX_TICKET_TIME_SKIP_ID,
  SVC_ATTR_E,
  TPLAN_SHARE_LIST,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE
} from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';
import {
  SKIP_NAME,
  TARGET_AGENT_LIST,
  TARGET_LINE_LIST,
  TIME_UNIT,
  UNIT as UNIT_STR,
  UNLIMIT_NAME
} from '../../../types/string.type';
import DateHelper from '../../../utils/date.helper';
import { CHANNEL_CODE, REDIS_KEY, REDIS_TOS_KEY } from '../../../types/redis.type';
import BrowserHelper from '../../../utils/browser.helper';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import BannerHelper from '../../../utils/banner.helper';

export interface Netfunnel {
  "@class": string;
  prtyId:  string;
  prtyDev: string;
  prtyStg: string;
  prtyPrd: string;
  prtyCur: string;
}

/**
 * @desc 메인화면-MY 초기화를 위한 class
 */
class MainHome extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 메인화면-MY 렌더 함수
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @param {object} svcInfo
   * @param {object} allSvc
   * @param {object} childInfo
   * @param {object} pageInfo
   * @return {void}
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // console.log(">>[TEST] main.controller.svcInfo", svcInfo); - 주석 처리
    const homeData = {
      usageData: null,
      membershipData: null,
      billData: null
    };
    const personDataNoLoginMap = {
      personTimeChk: null,
      personAgentTypeChk: null
    };
    const noticeCode = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;

    const flag = BrowserHelper.isApp(req) ? 'app' : 'web';

    let recommendProdsData = {
      hasRecommendProds: false,
      nowDate: DateHelper.getShortDateNoDot(new Date())
    };

    if (svcInfo) {
      if (svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE) {
        // 모바일 - 휴대폰 회선
        Observable.combineLatest(
          this.getUsageData(svcInfo),
          this.getMembershipData(svcInfo),
          this.getRedisData(noticeCode, svcInfo.svcMgmtNum),
          this.getRecommendProds(req, svcInfo.prodId),
          this.getIsAdRcvAgreeBannerShown(svcInfo.loginType),
          this.getProductGroup(),
          this.getPersonData(svcInfo, req)
        ).subscribe(([usageData, membershipData, redisData, recommendProdsResult, isAdRcvAgreeBannerShown, prodList, personData]) => {
          // [OP002-6858]T world T가족모아데이터 가입 프로모션 종료에 따른 영향으로 상품조회 후 처리하기로 변경
          if (usageData.data) {
            usageData.data['isTplanProd'] = prodList && prodList.findIndex(item => item.prodId === svcInfo.prodId) > -1;
          }
          homeData.usageData = usageData;
          homeData.membershipData = membershipData;
          recommendProdsData = recommendProdsResult;
          svcInfo.personTimeChk = personData.personDisableTimeCheck; // 아이콘 비노출 시간 체크
          svcInfo.personLineTypeChk = personData.personDisableLineTypeCheck; // 아이콘 비노출 서비스 타입 체크
          svcInfo.personAgentTypeChk = personData.personDisableAgentTypeCkeck; // 아이콘 비노출 에이전트 타입 체크
          res.render(`main.home-${flag}.html`, {
            svcInfo,
            homeData,
            redisData,
            pageInfo,
            noticeType: svcInfo.noticeType,
            recommendProdsData,
            isAdRcvAgreeBannerShown
          });
        });
      } else if (['S1', 'S2', 'S3'].indexOf(svcInfo.svcAttrCd) !== -1) {
        // IPTV, 인터넷 , 전화 회선
        Observable.combineLatest(
          this.getBillData(svcInfo),
          this.getRedisData(noticeCode, svcInfo.svcMgmtNum),
          this.getIsAdRcvAgreeBannerShown(svcInfo.loginType),
          this.getPersonData(svcInfo, req)
        ).subscribe(([billData, redisData, isAdRcvAgreeBannerShown, personData]) => {
          homeData.billData = billData;
          svcInfo.personTimeChk = personData.personDisableTimeCheck;            // 아이콘 비노출 시간 체크
          svcInfo.personLineTypeChk = personData.personDisableLineTypeCheck;    // 아이콘 비노출 서비스 타입 체크
          svcInfo.personAgentTypeChk = personData.personDisableAgentTypeCkeck;  // 아이콘 비노출 에이전트 타입 체크
          res.render(`main.home-${flag}.html`, {
            svcInfo,
            homeData,
            redisData,
            pageInfo,
            noticeType: svcInfo.noticeType,
            recommendProdsData,
            isAdRcvAgreeBannerShown
          });
        });
      } else {
        // 모바일 및 IPTV, 인터넷, 전화 외 회선
        Observable.combineLatest(
          this.getUsageData(svcInfo),
          this.getRedisData(noticeCode, svcInfo.svcMgmtNum),
          this.getIsAdRcvAgreeBannerShown(svcInfo.loginType),
          this.getProductGroup(),
          this.getPersonData(svcInfo, req)
        ).subscribe(([usageData, redisData, isAdRcvAgreeBannerShown, prodList, personData]) => {
          // [OP002-6858]T world T가족모아데이터 가입 프로모션 종료에 따른 영향으로 상품조회 후 처리하기로 변경
          if (usageData.data) {
            usageData.data['isTplanProd'] = prodList && prodList.findIndex(item => item.prodId === svcInfo.prodId) > -1;
          }
          homeData.usageData = usageData;
          svcInfo.personTimeChk = personData.personDisableTimeCheck;            // 아이콘 비노출 시간 체크
          svcInfo.personLineTypeChk = personData.personDisableLineTypeCheck;    // 아이콘 비노출 서비스 타입 체크
          svcInfo.personAgentTypeChk = personData.personDisableAgentTypeCkeck;  // 아이콘 비노출 에이전트 타입 체크
          res.render(`main.home-${flag}.html`, {
            svcInfo,
            homeData,
            redisData,
            pageInfo,
            noticeType: svcInfo.noticeType,
            recommendProdsData,
            isAdRcvAgreeBannerShown
          });
        });
      }
    } else {
      // 비로그인
      // this.getRedisData(noticeCode, '').subscribe((redisData) => {
      //    const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: '', recommendProdsData };
      //    res.render(`main.home-${flag}.html`, renderData);
      // });
      // [feature/OP002-8022] 미 로그인 시 해더 아이콘 노출/비노출에 필요한 redis 데이터 요청
      Observable.combineLatest(
        this.getRedisData(noticeCode, ''),
        this.getPersonDataNoLogin(req)
      ).subscribe(([redisData, personDataNoLogin]) => {
        personDataNoLoginMap.personTimeChk = personDataNoLogin.personDisableTimeCheck; // 아이콘 비노출 시간 체크
        personDataNoLoginMap.personAgentTypeChk = personDataNoLogin.personDisableAgentTypeCkeck; // 아이콘 비노출 에이전트 타입 체크
        res.render(`main.home-${flag}.html`, {
          svcInfo,
          homeData,
          redisData,
          pageInfo,
          noticeType: '',
          recommendProdsData,
          personDataNoLoginMap
        });
      });
    }
  }

  /**
   * redis에서 스마트 카드 순서를 가져옴
   * @param {string} svcMgmtNum
   * @return {Observable}
   */
  private getSmartCardOrder(svcMgmtNum: string): Observable<any> {
    if (FormatHelper.isEmpty(svcMgmtNum)) {
      return Observable.of([]);
    }
    return this.redisService.getStringTos(REDIS_TOS_KEY.SMART_CARD + svcMgmtNum)  // 1004483007
      .switchMap((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return Observable.of(resp);
        } else {
          return this.redisService.getStringTos(REDIS_TOS_KEY.SMART_CARD_DEFAULT);
        }
      }).map((resp) => {
        this.logger.info(this, '[Smart Card]', resp);
        // let order = ['00001', '00002', '00003', '00004', '00005'];
        let order = [];
        if (resp.code === API_CODE.CODE_00) {
          order = resp.result.split(',');
        }
        return order.map((segment) => {
          return {
            no: segment,
            title: HOME_SMART_CARD[segment]
          };
        });
      });
  }

  /**
   * 홈화면 렌더링에 필요한 redis 데이터 요청
   * @param {string} noticeCode
   * @param {string} svcMgmtNum
   * @return {Observable}
   */
  private getRedisData(noticeCode: string, svcMgmtNum: string): Observable<any> {
    return Observable.combineLatest(
      this.getNoti(),
      this.getHomeNotice(noticeCode),
      this.getHomeHelp(),
      this.getSmartCardOrder(svcMgmtNum)
    ).map(([noti, notice, help, smartCard]) => {
      let mainNotice = null;
      let emrNotice = null;
      if (!FormatHelper.isEmpty(notice)) {
        mainNotice = notice.mainNotice;
        emrNotice = notice.emrNotice;
      }
      return { noti, mainNotice, emrNotice, help, smartCard };
    });
  }

  /**
   * 홈화면 Welcome Message 요청
   * @return {Observable}
   */
  private getNoti(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.HOME_NOTI)
      .map((resp) => {
        // if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        //
        // }
        return resp.result;
      });
  }

  /**
   * 홈화면 공지사항 요청
   * @param {string} noticeCode
   * @return {Observable}
   */
  private getHomeNotice(noticeCode: string): Observable<any> {
    return this.redisService.getData(REDIS_KEY.HOME_NOTICE + noticeCode)
      .map((resp) => {
        // if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        //   return resp.result;
        // }
        return resp.result;
      });
  }

  /**
   * 홈화면 이럴땐 이렇게 하세요 데이터 요청
   * @return {Observable}
   */
  private getHomeHelp(): Observable<any> {
    let result = null;
    return this.redisService.getData(REDIS_KEY.HOME_HELP)
      .map((resp) => {
        if (resp.code === API_CODE.REDIS_SUCCESS) {
          result = this.parseHelpData(resp.result.cicntsList);
        }
        return result;
      });
  }

  /**
   * 홈화면 이럴땐 이렇게 하세요 데이터 파싱
   * @param {object} cicntsList
   * @return {object}
   */
  private parseHelpData(cicntsList: any): any {
    const resultArr = <any>[];
    const scrnTypCd = cicntsList[0].scrnTypCd || 'F';

    cicntsList.sort((prev, next) => {
      if (scrnTypCd === 'R') {
        return Math.floor(Math.random() * 3) - 1;
      } else {
        return prev.mainExpsSeq - next.mainExpsSeq;
      }
    });
    cicntsList[0].rollYn = cicntsList[0].rollYn || 'Y';
    for (let i = 0; i < cicntsList.length; i += 3) {
      resultArr.push(cicntsList.slice(i, i + 3));
    }
    return resultArr;
  }

  /**
   * 홈화면 멤버십 카드 정보 요청
   * @param {object} svcInfo
   * @return {Observable}
   */
  private getMembershipData(svcInfo: any): Observable<any> {
    let membershipData = {
      code: ''
    };
    if (svcInfo.loginType === LOGIN_TYPE.EASY) {
      membershipData.code = 'EASY_LOGIN';
      return Observable.of(membershipData);
    } else {
      return this.apiService.requestStore(SESSION_CMD.BFF_04_0001, {}).map((resp) => {
        membershipData.code = resp.code;
        if (resp.code === API_CODE.CODE_00) {
          membershipData = Object.assign(membershipData, this.parseMembershipData(resp.result));
        }
        return membershipData;
      });
    }
  }

  /**
   * 홈화면 멤버십 카드 데이터 파싱
   * @param {object} membershipData
   * @return {object}
   */
  private parseMembershipData(membershipData: any): any {
    // membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    membershipData.mbrGrStr = MEMBERSHIP_GROUP[membershipData.mbrGrCd];
    membershipData.showCardNum = FormatHelper.addCardSpace(membershipData.mbrCardNum);
    return membershipData;
  }

  /**
   * 홈화면 요금안내서 데이터 요청
   * @param {object} svcInfo
   * @return {Observable}
   */
  private getBillData(svcInfo: any): Observable<any> {
    let billData = {
      showBill: false,
      showSvcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)
    };

    return Observable.combineLatest(
      this.getCharge(),
      this.getUsed(),
      (charge, used) => {
        return { charge, used };
      }).map((resp) => {
      billData = Object.assign(billData, this.parseBillData(resp));
      return billData;
    });
  }

  /**
   * 홈화면 요금안내서-청구요금 데이터 요청
   * @return {object}
   */
  private getCharge(): any {
    return this.apiService.request(API_CMD.BFF_05_0036, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
    });
    return null;
  }

  /**
   * 홈화면 요금안내서-사용요금 데이터 요청
   * @return {object}
   */
  private getUsed(): any {
    return this.apiService.request(API_CMD.BFF_05_0047, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      return null;
    });
  }

  /**
   * 홈화면 요금안내서 데이터 파싱
   * @param {object} billData
   * @return {object}
   */
  private parseBillData(billData: any): any {
    if (!FormatHelper.isEmpty(billData.charge) && !FormatHelper.isEmpty(billData.used)) {
      if (billData.charge.coClCd === MYT_FARE_BILL_CO_TYPE.BROADBAND) {
        return {
          showBill: true,
          isBroadband: true
        };
      }

      const repSvc = billData.charge.repSvcYn === 'Y';
      const totSvc = +billData.charge.paidAmtMonthSvcCnt;
      const billName = repSvc ? 'charge' : 'used';

      const invMonth = +DateHelper.getCurrentMonth(billData[billName].invDt);
      let billMonth = +invMonth + 1;
      if (invMonth === 12) {
        billMonth = 1;
      }

      return {
        showBill: true,
        isBroadband: false,
        type1: repSvc,
        type2: totSvc === 1,
        type3: !repSvc && totSvc !== 1,
        useAmtTot: FormatHelper.addComma(billData[billName].useAmtTot || '0'),
        deduckTot: FormatHelper.addComma(billData[billName].deduckTotInvAmt || '0'),
        invEndDt: DateHelper.getShortDate(billData[billName].invDt),
        invStartDt: DateHelper.getShortFirstDate(billData[billName].invDt),
        invMonth: DateHelper.getCurrentMonth(billData[billName].invDt),
        // billMonth: +DateHelper.getCurrentMonth(billData[billName].invDt) + 1,
        billMonth: billMonth
      };
    }
    return null;
  }

  /**
   * 홈화면 실시간 사용량 요청
   * @param {object} svcInfo
   * @return {Observable}
   */
  private getUsageData(svcInfo: any): Observable<any> {
    let usageData = {
      code: '',
      msg: '',
      showSvcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)
    };
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        usageData = Object.assign(usageData, this.parseUsageData(resp.result, svcInfo));
      } else if (resp.code === API_CODE.BFF_0006) {
        usageData['fromDate'] = DateHelper.getShortDateAnd24Time(resp.result.fromDtm);
        usageData['toDate'] = DateHelper.getShortDateAnd24Time(resp.result.toDtm);
        usageData['fallbackClCd'] = resp.result.fallbackClCd;
        usageData['fallbackUrl'] = resp.result.fallbackUrl;
        usageData['fallbackMsg'] = resp.result.fallbackMsg;
      } else if (resp.code === API_CODE.BFF_0011) {
        usageData['fallbackClCd'] = resp.result.fallbackClCd;
        usageData['fallbackUrl'] = resp.result.fallbackUrl;
        usageData['fallbackMsg'] = resp.result.fallbackMsg;
      }

      usageData.code = resp.code;
      usageData.msg = resp.msg;

      return usageData;
    });
  }

  /**
   * 홈화면 실시간 사용량 파싱
   * @param {object} usageData
   * @param {object} svcInfo
   * @return {object}
   */
  private parseUsageData(usageData: any, svcInfo: any): any {
    const etcKinds = ['voice', 'sms', 'spclData'];
    const result = {
      data: { isShow: false },
      voice: { isShow: false },
      sms: { isShow: false },
      fivegxTicketTime: { isShow: false }
    };

    if (!FormatHelper.isEmpty(usageData.gnrlData)) {
      this.mergeData(usageData.gnrlData, result.data);
      // [OP002-6858]T world T가족모아데이터 가입 프로모션 종료에 따른 영향으로 상품조회 후 처리하기로 변경
      // result.data['isTplanProd'] = TPLAN_PROD_ID.indexOf(svcInfo.prodId) !== -1;
    }

    etcKinds.map((kind, index) => {
      const findData = usageData[kind].find((usage) => {
        return !FormatHelper.isEmpty(usage) && PRODUCT_5GX_TICKET_TIME_SKIP_ID.indexOf(usage.skipId) === -1
          && (UNLIMIT_CODE.indexOf(usage.unlimit) !== -1 || (UNLIMIT_CODE.indexOf(usage.unlimit) === -1 && +usage.remained > 0));
      });
      if (!FormatHelper.isEmpty(findData)) {
        result[kind] = findData;
        this.convShowData(result[kind]);
      } else if (!FormatHelper.isEmpty(usageData[kind][0])) {
        result[kind] = usageData[kind][0];
        this.convShowData(result[kind]);
      }

      // 5GX 데이터 시긴권 설정
      const fivegxTicketTime = usageData[kind].find((usage) => {
        return PRODUCT_5GX_TICKET_TIME_SKIP_ID.indexOf(usage.skipId) !== -1;
      });

      if (!FormatHelper.isEmpty(fivegxTicketTime)) {
        this.convShowData(fivegxTicketTime);
        result.fivegxTicketTime = fivegxTicketTime;
      }
    });
    return result;
  }

  /**
   * 홈화면 사용량 데이터 합산
   * @param {object} list
   * @param {object} data
   * @return {void}
   */
  private mergeData(list: any, data: any) {
    data.isShow = true;
    data.isUnlimit = false;
    data.isTplanUse = false;
    data.shareTotal = 0;
    data.shareRemained = 0;
    data.myRemainedRatio = 100;
    data.shareRemainedRatio = 100;
    let includeFee = false;
    let includeFeeCnt = 0;

    list.map((target) => {
      if (UNLIMIT_CODE.indexOf(target.unlimit) !== -1) {
        data.isUnlimit = true;
        data.showMyRemained = SKIP_NAME.UNLIMIT;
        data.showAddRemained = SKIP_NAME.UNLIMIT;
      }
      if (TPLAN_SHARE_LIST.indexOf(target.skipId) !== -1) {
        data.shareTotal += +target.total;
        data.shareRemained += +target.remained;
        data.isTplanUse = true;
      }

      // 5GX 데이터 시간권 사용중
      if (PRODUCT_5GX_TICKET_TIME_SET_SKIP_ID.indexOf(target.skipId) !== -1) {
        data.showUsingFiveGxTicketTimeRemainedText = DateHelper.getKoreanTime(target.exprDtm);
        // API 5분 cache를 사용하고 있어서, 실시간으로 데이터를 출력할 수 없음.
        // 일단, 해당 기능 노출 안 함.
        // data.usingFivegxTicketTime = true;
      }
    });
    data.showShareRemained = this.convFormat(data.shareRemained, UNIT_E.DATA);
    if (!data.isUnlimit) {
      data.myTotal = 0;
      data.myRemained = 0;
      list.map((target) => {
        if (TPLAN_SHARE_LIST.indexOf(target.skipId) === -1 && target.unit !== UNIT_E.FEE) {
          data.myTotal += +target.total;
          data.myRemained += +target.remained;
        }

        if (target.unit === UNIT_E.FEE) {
          includeFee = true;
          includeFeeCnt++;
        }
      });

      // gnrlData에 원단위만 존재하는 경우, 실시간 데이터 잔여량을 보여주지 않는다.
      if (includeFeeCnt === list.length && includeFee) {
        data.isShow = false;
      }

      data.addRemained = data.myRemained + data.shareRemained;
      data.addTotal = data.myTotal + data.shareTotal;
      data.showAddRemained = this.convFormat(data.addRemained, UNIT_E.DATA);

      data.showMyRemained = this.convFormat(data.myRemained, UNIT_E.DATA);
      data.myRemainedRatio = Math.round(data.myRemained / data.addTotal * 100);
      data.shareRemainedRatio = Math.round(data.addRemained / data.addTotal * 100);
    }

    if (data.usingFivegxTicketTime) {
      data.linkUrl = '/myt-data/5g-setting';
    } else {
      // data.linkUrl = '/myt-data/hotdata';
      data.linkUrl = '/myt-data/submain';
    }
  }

  /**
   * 홈화면 사용량 음성/문자 파싱
   * @param {object} data
   * @return {void}
   */
  private convShowData(data: any) {
    data.isShow = true;
    data.isUnlimit = UNLIMIT_CODE.indexOf(data.unlimit) !== -1;
    data.remainedRatio = 100;
    // data.showUsed = this.convFormat(data.used, data.unit);
    if (!data.isUnlimit) {
      // data.showTotal = this.convFormat(data.total, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.showRemainedText = data.showRemained + ' ' + UNLIMIT_NAME.REMAIN;
      data.remainedRatio = Math.round(data.remained / data.total * 100);
    } else {
      data.showRemained = UNLIMIT_NAME[data.unlimit];
      data.showRemainedText = data.showRemained;
    }
  }

  /**
   * 홈화면 사용량 포맷 변경
   * @param {string} data
   * @param {string} unit
   * @return {object}
   */
  private convFormat(data: string, unit: string): any {
    switch (unit) {
      case UNIT_E.DATA:
        const resultData = FormatHelper.convDataFormat(data, UNIT[unit]);
        return resultData.data + resultData.unit;
      case UNIT_E.VOICE:
        const resultVoice = FormatHelper.convVoiceFormat(data);
        let resp = '';
        if (resultVoice.hours !== 0) {
          resp += resultVoice.hours + TIME_UNIT.HOURS;
        }
        if (resultVoice.min !== 0) {
          if (!FormatHelper.isEmpty(resp)) {
            resp += ' ';
          }
          resp += resultVoice.min + TIME_UNIT.MINUTE;
        }
        if (FormatHelper.isEmpty(resp)) {
          resp = '0' + TIME_UNIT.MINUTE;
        }
        return resp;
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data) + UNIT_STR.SMS;
      default:
    }
    return '';
  }

  /**
   * 내게맞는요금제 추천
   * @param {Request} req
   * @param {any} prodId
   * @return {Observable}
   */
  private getRecommendProds(req: Request, prodId: any): Observable<any> {

    const retVal = {
      hasRecommendProds: false,
      nowDate: DateHelper.getShortDateNoDot(new Date())
    };

    if (BrowserHelper.isApp(req)) {
      // const channelIds = [EXPERIMENT_EXPS_SCRN_ID.RECOMMEND_PRODS];
      // return this.apiService.request(API_CMD.BFF_10_0187, {channelIds: channelIds}).map((resp) => {

      //   if ( resp.code === API_CODE.CODE_00 ) {
      //     if ( !FormatHelper.isEmpty(resp.result) ) {
      //       retVal.hasRecommendProds = true;
      //       const items = resp.result.results[EXPERIMENT_EXPS_SCRN_ID.RECOMMEND_PRODS].items || [];
      //       // 추천 요금이 없거나, 추천 요금제와 현재 요금제가 같은 경우는 노출 안함(요금제 변경)
      //       if (FormatHelper.isEmpty(items)
      //           || (!FormatHelper.isEmpty(items) && items[0].id === prodId)) {
      //             retVal.hasRecommendProds = false;
      //       }
      //     }
      //   }
      //   return retVal;
      // });
      return Observable.of(retVal);
    } else {
      return Observable.of(retVal);
    }
  }

  /**
   * 광고성 정보 수신동의 배너 노출여부
   * @return {boolean}
   */
  private getIsAdRcvAgreeBannerShown(loginType): Observable<any> {

    if (FormatHelper.isEmpty(loginType) || loginType !== 'T') {
      return Observable.of(false);
    }

    return this.apiService.request(API_CMD.BFF_03_0034, null).map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return false;
      }
      return resp.result.twdAdRcvAgreeYn !== 'Y';
    });
  }


  /**
   * 관련상품그룹 조회 - 공유POT그룹 가입가능 요금제
   * @return {Observable}
   */
  private getProductGroup(): Observable<any> {
    // [OP002-6858]T world T가족모아데이터 가입 프로모션 종료에 따른 영향으로 상품조회 후 처리하기로 변경
    return this.apiService.request(API_CMD.BFF_10_0188, {}, {}, ['NA6031_PRC_PLN', 1])
      .map(resp => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result.prodList;
        } else {
          return null;
        }
      });
  }

  /**
   * [feature/OP002-8022] 로그인 시 해더 아이콘 노출/비노출에 필요한 redis 데이터 요청
   * @param {object} svcInfo
   * @param {Request} req
   * @return {Observable}
   */
  private getPersonData(svcInfo: any, req: Request): Observable<any> {
    return Observable.combineLatest(
      this.getPersonDisableTimeCheck()
    ).map(([personDisableTimeCheck]) => {
      const personDisableLineTypeCheck = this.getPersonLineTypeCheck(svcInfo);
      const personDisableAgentTypeCkeck = this.getPersonAgentTypeCheck(req);
      this.logger.info(this, '[Person Login Info]', personDisableTimeCheck, personDisableAgentTypeCkeck, personDisableLineTypeCheck);
      return {
        personDisableTimeCheck,
        personDisableAgentTypeCkeck,
        personDisableLineTypeCheck
      };
    });
  }

  /**
   * [feature/OP002-8022] 미 로그인 시 해더 아이콘 노출/비노출에 필요한 redis 데이터 요청
   * @param {Request} req
   * @return {Observable}
   */
  private getPersonDataNoLogin(req: Request): Observable<any> {
    return Observable.combineLatest(
      this.getPersonDisableTimeCheck()
    ).map(([personDisableTimeCheck]) => {
      const personDisableAgentTypeCkeck = this.getPersonAgentTypeCheck(req);
      this.logger.info(this, '[Person Not Login Info]', personDisableTimeCheck, personDisableAgentTypeCkeck);
      return { personDisableTimeCheck, personDisableAgentTypeCkeck };
    });
  }

  /**
   * redis에서 개인화 진입 아이콘 노출 여부 체크
   * @return {Observable}
   */
  private getPersonDisableTimeCheck(): Observable<any> {
    const DEFAULT_PARAM = {
      property: REDIS_KEY.PERSON_DISABLE_TIME
    };
    return this.apiService.request(API_CMD.BFF_01_0069, DEFAULT_PARAM).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const today = new Date().getTime();
        const resTime = resp.result.split('~');
        const startTime = DateHelper.convDateFormat(resTime[0]).getTime();
        const endTime = DateHelper.convDateFormat(resTime[1]).getTime();
        this.logger.info(this, '[Person startTime // endTime]', startTime, endTime);
        /**
         * 버튼 비노출 시점에 포함되지 않으면 버튼 노출
         * true: 노출, false: 비노출
         */
        return !(today >= startTime && today <= endTime);
      } else {
        return null;
      }
    });
  }

  /**
   * [feature/OP002-8022] 서비스 종류에 따른 개인화 아이콘 노출 대상 여부 체크
   * @param {object} svcInfo
   * @return {object}
   */
  private getPersonLineTypeCheck(svcInfo): any {
    // 설명서비스등급(svcGr)	정책서	        시스템
    // 통화내역조회가능이동전화	 A	            A
    // 일반개인이동전화	       B	            Y
    const svcLineGr = TARGET_LINE_LIST.find((targetLine) =>
      svcInfo.svcGr.toLowerCase().includes(targetLine.toLowerCase()));
    /**
     * 개인회선등급(A, Y)에 포함되어있으면 노출
     * true: 노출 false: 미노출
     */
    return !!svcLineGr;
  }

  /**
   * [feature/OP002-8022] 유저 에이전트에 따른 개인화 아이콘 노출 대상 여부 체크
   * @param {Request} req
   * @return {object}
   */
  // private getPersonAgentTypeCheck(req): any {
  //   const userAgent: string = this.getUserAgent(req);
  //   const agentTypeChk = TARGET_AGENT_LIST.find((targetAgent) =>
  //     userAgent.toLowerCase().includes(targetAgent.toLowerCase()));
  //   /**
  //    * userAgent에 포함된 단말기인 경우 노출
  //    * true: 노출, false: 미노출
  //    */
  //   return !!agentTypeChk;
  // }

  private getPersonAgentTypeCheck(req): any {
    return this.getOsVersionCheck(req);
  }

  /**
   * user agent 조회
   * @param req
   */
  public getUserAgent(req): string {
    const request = req; // || this.request;
    if (!FormatHelper.isEmpty(request)) {
      return request.headers['user-agent'];
    }
    return '';
  }

  public compareVer (a, b): boolean {
    let x=a.split('.').map(e=> parseInt(e));
    let y=b.split('.').map(e=> parseInt(e));
    let z = '';

    for(let i=0;i<x.length;i++) {
        if(x[i] === y[i]) {
            z+='e';
        } else
        if(x[i] > y[i]) {
            z+='m';
        } else {
            z+='l';
        }
    }
    if (!z.match(/[l|m]/g)) {
      return true;
    } else if (z.split('e').join('')[0] == "m") {
      return true;
    } else {
      return false;
    }
  }

  public getOsVersionCheck(req): boolean {
    try {
      let agentString = this.getUserAgent(req);
      // console.log("[10650-DEBUG-UserAgent] ", agentString);
      let os = agentString.indexOf('iPhone') > -1 ? 'ios' : 'aos';
      if (os === 'aos') {
        if (agentString.indexOf('Mac') > -1) {
          os = 'ios';
        } else if (agentString.indexOf('iPad') > -1) {
          os = 'ios';
        } else if (agentString.indexOf('iPod') > -1) {
          os = 'ios';
        }
      }
      if (os === 'ios') {
        const mac_check_version = '12.4.8';
        let reg = new RegExp('OS [0-9]{0,3}_[0-9]{0,3}_[0-9]{0,3}');
        let reg2 = new RegExp('OS [0-9]{0,3}_[0-9]{0,3}');
        let reg3 = new RegExp('OS [0-9]{0,3}');
        var ios_text = '  Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Safari/605.1.15 TWM_APP TWM_DEVICE=osType:ios|appVersion:5.0.10|osVersion:27|model:LM-V409N|id:6ae9a542-fcb6-44ae-9cbd-8cbf45538933|APP_API:app|TWM_CHANNEL=mobile-app|widget:0 x-requested-with: com.sktelecom.minit.qa';
        ios_text = agentString;
        // version output
        let mac_version_temp = reg.exec(ios_text);
        if (mac_version_temp === null) {
          mac_version_temp = reg2.exec(ios_text);
        }
        if (mac_version_temp === null) {
          mac_version_temp = reg3.exec(ios_text);
        }
        let mac_version: string = '';
        if (mac_version_temp) {
          mac_version = mac_version_temp[0].split(' ')[1] 
        }
        // version length check
        let mac_version_len = mac_version.split('_').length;
        if (mac_version_len === 1) {
          mac_version = mac_version + '_0_0';
        } else if (mac_version_len === 2) {
          mac_version = mac_version + '_0';
        }

        mac_version = mac_version.replace(/_/g, '.');

        // true: 노출, false: 비노출 
        return this.compareVer(mac_version, mac_check_version);
        
      } else { // aos
        const mac_check_version = '4.4.4';
        let reg = new RegExp('Android [0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}');
        let reg2 = new RegExp('Android [0-9]{0,3}\.[0-9]{0,3}');
        let reg3 = new RegExp('Android [0-9]{0,3}');
        let aos_text = 'Mozilla/5.0 (Linux; Android 8.1.0; LM-V409N Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/72.0.3626.105 Mobile Safari/537.36 TWM_APP TWM_DEVICE=osType:aos|appVersion:0.1.7|osVersion:27|model:SM-G995N|id:6ae9a542-fcb6-44ae-9cbd-8cbf45538933|APP_API:app|TWM_CHANNEL=mobile-app|widget:0 x-requested-with: com.sktelecom.minit.qa';
        aos_text = agentString;
        // version output
        let mac_version_temp = reg.exec(aos_text);
        if (mac_version_temp === null) {
          mac_version_temp = reg2.exec(aos_text);
        }
        if (mac_version_temp === null) {
          mac_version_temp = reg3.exec(aos_text);
        }
        let mac_version: string = '';
        if (mac_version_temp) {
          mac_version = mac_version_temp[0].split(' ')[1] 
        }
        // version length check
        let mac_version_len = mac_version.split('.').length;
        if (mac_version_len === 1) {
          mac_version = mac_version + '.0.0';
        } else if (mac_version_len === 2) {
          mac_version = mac_version + '.0';
        }

        return this.compareVer(mac_version, mac_check_version);
      }
    
    } catch (e) {
      console.error(e);
    }

    return false;
    
  }

}

export default MainHome;
