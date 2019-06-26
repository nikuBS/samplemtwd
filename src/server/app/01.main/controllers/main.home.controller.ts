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
import { EXPERIMENT_EXPS_SCRN_ID } from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';
import {
  HOME_SMART_CARD,
  LINE_NAME,
  LOGIN_TYPE,
  MEMBERSHIP_GROUP,
  MYT_FARE_BILL_CO_TYPE,
  SVC_ATTR_E,
  TPLAN_PROD_ID,
  TPLAN_SHARE_LIST,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE
} from '../../../types/bff.type';
import { SKIP_NAME, TIME_UNIT, UNIT as UNIT_STR, UNLIMIT_NAME } from '../../../types/string.type';
import DateHelper from '../../../utils/date.helper';
import { CHANNEL_CODE, REDIS_KEY, REDIS_TOS_KEY } from '../../../types/redis.type';
import BrowserHelper from '../../../utils/browser.helper';
import { SvcInfoModel } from '../../../models/svc-info.model';

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
    const svcType = this.getSvcType(svcInfo);
    const homeData = {
      usageData: null,
      membershipData: null,
      billData: null,
    };

    const noticeCode = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;

    const flag = BrowserHelper.isApp(req) ? 'app' : 'web';

    let recommendProdsData = {
      hasRecommendProds: false,
      nowDate: DateHelper.getShortDateNoDot(new Date())
    };

    if ( svcType.login ) {
      if ( svcType.svcCategory === LINE_NAME.MOBILE ) {
        if ( svcType.mobilePhone ) {
          // 모바일 - 휴대폰 회선
          Observable.combineLatest(
            this.getUsageData(svcInfo),
            this.getMembershipData(svcInfo),
            this.getRedisData(noticeCode, svcInfo.svcMgmtNum),
            this.getRecommendProds(req, svcInfo.prodId)
          ).subscribe(([usageData, membershipData, redisData, recommendProdsResult]) => {
            homeData.usageData = usageData;
            homeData.membershipData = membershipData;
            recommendProdsData = recommendProdsResult;

            const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: svcInfo.noticeType, recommendProdsData };
            res.render(`main.home-${flag}.html`, renderData);
          });
        } else {
          // 모바일 - 휴대폰 외 회선
          Observable.combineLatest(
            this.getUsageData(svcInfo),
            this.getRedisData(noticeCode, svcInfo.svcMgmtNum)
          ).subscribe(([usageData, redisData]) => {
            homeData.usageData = usageData;
            const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: svcInfo.noticeType, recommendProdsData };
            res.render(`main.home-${flag}.html`, renderData);
          });
        }
      } else if ( svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ) {
        // 인터넷 회선
        Observable.combineLatest(
          this.getBillData(svcInfo),
          this.getRedisData(noticeCode, svcInfo.svcMgmtNum)
        ).subscribe(([billData, redisData]) => {
          homeData.billData = billData;
          const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: svcInfo.noticeType, recommendProdsData };
          res.render(`main.home-${flag}.html`, renderData);
        });
      }
    } else {
      // 비로그인
      this.getRedisData(noticeCode, '').subscribe((redisData) => {
        const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: '', recommendProdsData };
        res.render(`main.home-${flag}.html`, renderData);
      });
    }
  }

  /**
   * redis에서 스마트 카드 순서를 가져옴
   * @param {string} svcMgmtNum
   * @return {Observable<any>}
   */
  private getSmartCardOrder(svcMgmtNum: string): Observable<any> {
    if ( FormatHelper.isEmpty(svcMgmtNum) ) {
      return Observable.of([]);
    }
    return this.redisService.getStringTos(REDIS_TOS_KEY.SMART_CARD + svcMgmtNum)  // 1004483007
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.of(resp);
        } else {
          return this.redisService.getStringTos(REDIS_TOS_KEY.SMART_CARD_DEFAULT);
        }
      }).map((resp) => {
        this.logger.info(this, '[Smart Card]', resp);
        // let order = ['00001', '00002', '00003', '00004', '00005'];
        let order = [];
        if ( resp.code === API_CODE.CODE_00 ) {
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
   * svcInfo 에서 필요한 정보를 object로 구성
   * @param {object} svcInfo
   * @return {object}
   */
  private getSvcType(svcInfo: any): any {
    const svcType = {
      svcCategory: LINE_NAME.MOBILE,
      mobilePhone: false,
      login: false
    };

    if ( !FormatHelper.isEmpty(svcInfo) ) {
      svcType.login = true;
      if ( svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
        svcType.mobilePhone = true;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.INTERNET || svcInfo.svcAttrCd === SVC_ATTR_E.IPTV || svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE ) {
        svcType.svcCategory = LINE_NAME.INTERNET_PHONE_IPTV;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.POINT_CAM ) {
        svcType.svcCategory = LINE_NAME.SECURITY;
      }
    }

    return svcType;
  }

  /**
   * 홈화면 렌더링에 필요한 redis 데이터 요청
   * @param {string} noticeCode
   * @param {string} svcMgmtNum
   * @return {Observable<any>}
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
      if ( !FormatHelper.isEmpty(notice) ) {
        mainNotice = notice.mainNotice;
        emrNotice = notice.emrNotice;
      }
      return { noti, mainNotice, emrNotice, help, smartCard };
    });
  }

  /**
   * 홈화면 Welcome Message 요청
   * @return {Observable<any>}
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
   * @return {Observable<any>}
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
   * @return {Observable<any>}
   */
  private getHomeHelp(): Observable<any> {
    let result = null;
    return this.redisService.getData(REDIS_KEY.HOME_HELP)
      .map((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
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
    var scrnTypCd = cicntsList[0].scrnTypCd||'F';
    
    cicntsList.sort(function(prev, next){

      if(scrnTypCd === 'R'){
        return Math.floor(Math.random() * 3) -1;
      }else{
        return prev.mainExpsSeq - next.mainExpsSeq;
      }          
    });
    cicntsList[0].rollYn = cicntsList[0].rollYn||'Y';

    for ( let i = 0; i < cicntsList.length; i += 3 ) {
      resultArr.push(cicntsList.slice(i, i + 3));
    }
    return resultArr;
  }

  /**
   * 홈화면 멤버십 카드 정보 요청
   * @param {object} svcInfo
   * @return {Observable<any>}
   */
  private getMembershipData(svcInfo: any): Observable<any> {
    let membershipData = {
      code: ''
    };
    if ( svcInfo.loginType === LOGIN_TYPE.EASY ) {
      membershipData.code = 'EASY_LOGIN';
      return Observable.of(membershipData);
    } else {
      return this.apiService.requestStore(SESSION_CMD.BFF_04_0001, {}).map((resp) => {
        membershipData.code = resp.code;
        if ( resp.code === API_CODE.CODE_00 ) {
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
   * @return {Observable<any>}
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
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;
    });
  }

  /**
   * 홈화면 요금안내서-사용요금 데이터 요청
   * @return {object}
   */
  private getUsed(): any {
    return this.apiService.request(API_CMD.BFF_05_0047, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
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
    if ( !FormatHelper.isEmpty(billData.charge) && !FormatHelper.isEmpty(billData.used) ) {
      if ( billData.charge.coClCd === MYT_FARE_BILL_CO_TYPE.BROADBAND ) {
        return {
          showBill: true,
          isBroadband: true
        };
      }

      const repSvc = billData.charge.repSvcYn === 'Y';
      const totSvc = +billData.charge.paidAmtMonthSvcCnt;
      const billName = repSvc ? 'charge' : 'used';

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
        billMonth: +DateHelper.getCurrentMonth(billData[billName].invDt) + 1,
      };
    }
    return null;
  }

  /**
   * 홈화면 실시간 사용량 요청
   * @param {object} svcInfo
   * @return {Observable<any>}
   */
  private getUsageData(svcInfo: any): Observable<any> {
    let usageData = {
      code: '',
      msg: '',
      showSvcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)
    };
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        usageData = Object.assign(usageData, this.parseUsageData(resp.result, svcInfo));
      } else if ( resp.code === API_CODE.BFF_0006 ) {
        usageData['fromDate'] = DateHelper.getShortDateAnd24Time(resp.result.fromDtm);
        usageData['toDate'] = DateHelper.getShortDateAnd24Time(resp.result.toDtm);
        usageData['fallbackClCd'] = resp.result.fallbackClCd;
        usageData['fallbackUrl'] = resp.result.fallbackUrl;
        usageData['fallbackMsg'] = resp.result.fallbackMsg;
      } else if (resp.code === API_CODE.BFF_0011 ) {
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
    const etcKinds = ['voice', 'sms'];
    const result = {
      data: { isShow: false },
      voice: { isShow: false },
      sms: { isShow: false }
    };

    if ( !FormatHelper.isEmpty(usageData.gnrlData) ) {
      this.mergeData(usageData.gnrlData, result.data);
      result.data['isTplanProd'] = TPLAN_PROD_ID.indexOf(svcInfo.prodId) !== -1;
    }

    etcKinds.map((kind, index) => {
      const findData = usageData[kind].find((usage) => {
        return !FormatHelper.isEmpty(usage) &&
          (UNLIMIT_CODE.indexOf(usage.unlimit) !== -1 || (UNLIMIT_CODE.indexOf(usage.unlimit) === -1 && +usage.remained > 0));
      });
      if ( !FormatHelper.isEmpty(findData) ) {
        result[kind] = findData;
        this.convShowData(result[kind]);
      } else if ( !FormatHelper.isEmpty(usageData[kind][0]) ) {
        result[kind] = usageData[kind][0];
        this.convShowData(result[kind]);
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

    list.map((target) => {
      if ( UNLIMIT_CODE.indexOf(target.unlimit) !== -1 ) {
        data.isUnlimit = true;
        data.showMyRemained = SKIP_NAME.UNLIMIT;
        data.showAddRemained = SKIP_NAME.UNLIMIT;
      }
      if ( TPLAN_SHARE_LIST.indexOf(target.skipId) !== -1 ) {
        data.shareTotal += +target.total;
        data.shareRemained += +target.remained;
        data.isTplanUse = true;
      }
    });
    data.showShareRemained = this.convFormat(data.shareRemained, UNIT_E.DATA);
    if ( !data.isUnlimit ) {
      data.myTotal = 0;
      data.myRemained = 0;
      list.map((target) => {
        if ( TPLAN_SHARE_LIST.indexOf(target.skipId) === -1 ) {
          data.myTotal += +target.total;
          data.myRemained += +target.remained;
        }
      });

      data.addRemained = data.myRemained + data.shareRemained;
      data.addTotal = data.myTotal + data.shareTotal;
      data.showAddRemained = this.convFormat(data.addRemained, UNIT_E.DATA);

      data.showMyRemained = this.convFormat(data.myRemained, UNIT_E.DATA);
      data.myRemainedRatio = Math.round(data.myRemained / data.addTotal * 100);
      data.shareRemainedRatio = Math.round(data.addRemained / data.addTotal * 100);
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
    if ( !data.isUnlimit ) {
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
    switch ( unit ) {
      case UNIT_E.DATA:
        const resultData = FormatHelper.convDataFormat(data, UNIT[unit]);
        return resultData.data + resultData.unit;
      case UNIT_E.VOICE:
        const resultVoice = FormatHelper.convVoiceFormat(data);
        let resp = '';
        if ( resultVoice.hours !== 0 ) {
          resp += resultVoice.hours + TIME_UNIT.HOURS;
        }
        if ( resultVoice.min !== 0 ) {
          if ( !FormatHelper.isEmpty(resp) ) {
            resp += ' ';
          }
          resp += resultVoice.min + TIME_UNIT.MINUTE;
        }
        if ( FormatHelper.isEmpty(resp) ) {
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
   * @return {Observable<any>}
   */
  private getRecommendProds(req: Request, prodId: any): Observable<any>  {

    const defaultRetVal = {
      hasRecommendProds: false,
      nowDate: DateHelper.getShortDateNoDot(new Date())
    };

    if (BrowserHelper.isApp(req)) {
      return this.apiService.request(API_CMD.BFF_10_0178, {
        experimentExpsScrnId: EXPERIMENT_EXPS_SCRN_ID.RECOMMEND_PRODS, 
        prcplnRcTyp: 'GNRL', 
        prcplnChlTyp: BrowserHelper.isApp(req) ? 'MOBILE' : 'WEB'
      }).map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( FormatHelper.isEmpty(resp.result) ) {
            return defaultRetVal;
          } else {
            // 추천 요금제와 현재 요금제가 같은 경우는 노출 안함(요금제 변경)
            const items = resp.result.items;
            if (!FormatHelper.isEmpty(items) && items[0].prodId === prodId) {
              return defaultRetVal;
            } else {
              const list = items[0].props;
              let validPropCnt = 0;

              list.map((target) => {
                if (target.reasonCode !== '#') {
                  validPropCnt++;
                }
              });

              // 모든 건에 reasonCode가 "#"으로 오는 경우는 노출하지 않음
              if (validPropCnt === 0) {
                return defaultRetVal;
              } else {
                return {
                  hasRecommendProds: true,
                  nowDate: DateHelper.getShortDateNoDot(new Date(parseFloat(resp.result.timestamp) * 1000))
                };
              }  
            }
          }
        }
        return defaultRetVal;
      });
    } else {
      return Observable.of(defaultRetVal);
    }
  }
}

export default MainHome;
