/**
 * MenuName: 나의 요금 > 서브메인(MF2)
 * @file myt-fare.submain.controller.ts
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.09.27
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../utils/format.helper';
import DateHelper from '../../utils/date.helper';
import {API_CMD, API_CODE, API_TAX_REPRINT_ERROR, SESSION_CMD} from '../../types/api-command.type';
import { MYT_FARE_SUBMAIN_TITLE } from '../../types/title.type';
import {SVC_ATTR_E, SVC_ATTR_NAME, SVC_CDGROUP} from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';
// OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
import CommonHelper from '../../utils/common.helper';
import {MytFareInfoMiriService} from './services/info/myt-fare.info.miri.service';
import MyTFareSubmainAdvController from './myt-fare.submain.adv.controller';
import querystring from 'querystring';

class MyTFareSubmainController extends TwViewController {

  private _miriService!: MytFareInfoMiriService;
  private _datas: any = {};
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (pageInfo.advancement) {
      const {env, visible} = pageInfo.advancement,
        {NODE_ENV} = process.env;
      // local 테스트틀 하기 위해 추가
      if ((NODE_ENV === env && visible) || NODE_ENV === 'local') {
        // netfunnel 통해서 진입한 경우
        const isNetFunnel = req.query && req.query.netfunnel === 'Y';
        if (pageInfo.advancement.netFunnelVisible && !isNetFunnel) {
          const query = Object.keys(req.query).map(key => key + '=' + req.query[key]).join('&');
          const qr = querystring.stringify(Object.assign(req.query, {
            netfunnel: 'Y'
          }));
          res.render('../../../common/views/components/netfunnel.start.component.html', {
            referer: '/myt-fare/submain?' + qr
          });
        } else {
          new MyTFareSubmainAdvController().initPage(req, res, next);
        }
        return false;
      }
    }
    // this._miriService = new MytFareInfoMiriService(svcInfo.svcMgmtNum, req, res);
    this._miriService = new MytFareInfoMiriService(req, res, svcInfo);
    this._datas = {
      res,
      svcInfo,
      pageInfo
    };
    const BLOCK_ON_FIRST_DAY = false;
    const data: any = {
      svcInfo: Object.assign({}, svcInfo),
      pageInfo,
      // 소액결제 버튼 노출 여부
      isMicroPayment: false,
      // 납부청구 관련 버튼 노출 여부
      isNotAutoPayment: true,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      // 1일 기준
      isNotFirstDate: (new Date().getDate() > 1) || !BLOCK_ON_FIRST_DAY,
      // 휴대폰, T-PocketFi 인 경우에만 실시간 요금 조회 노출
      isRealTime: (['M1', 'M3'].indexOf(svcInfo.svcAttrCd) > -1),
      // [OP002-3317] 자녀 요금조회
      childLineInfo: childInfo
    };

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    CommonHelper.addCurLineInfo(data.svcInfo);

    // 다른 페이지를 찾고 계신가요 통계코드 추가
    this.getXtEid(data);
    if ( data.svcInfo.svcAttrCd === 'M2' ) {
      data.type = 'UF';
      this._requestPPS(req, res, data);
      return;
    }

    this._miriService.getMiriBalance().subscribe(miriBalance => {
      data.miriBalance = miriBalance; // 미리납부 금액 잔액
      this.requestData({
        svcInfo,
        data,
        req,
        res
      });
    });

  }

  private requestData(args: any): any {
    const {svcInfo, data, req, res} = args;

    // [DV001-15583] Broadband 인 경우에 대한 예외처리 수정
    if ( svcInfo.actCoClCd === 'B' ) {
      data.type = 'UF';
      data.isBroadBand = true;
    }

    // 대표청구 여부
    if ( svcInfo.actRepYn === 'Y' ) {
      this.apiService.request(API_CMD.BFF_05_0203, {}).subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          // OP002-2986. 통합청구에서 해지할경우(개별청구) 청구번호가 바뀐다고함. 그럼 성공이지만 결과를 안준다고 함.
          if (!resp.result || FormatHelper.isEmpty(resp.result.invDt)) {
            return this.errorRender({
              title: MYT_FARE_SUBMAIN_TITLE.MAIN,
              code: API_CODE.CODE_500,
              msg: MYT_FARE_SUBMAIN_TITLE.ERROR.NO_DATA,
            });
          }
          const claim = resp.result;

          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if ( ['M1', 'M2'].indexOf(data.svcInfo.svcAttrCd) === -1 ) {
            data.svcInfo.nickNm = SVC_ATTR_NAME[data.svcInfo.svcAttrCd];
          }

          // 청구요금
          if ( claim && claim.invDt && claim.invDt.length > 0 ) {
            data.claim = claim;
            data.claimFirstDay = DateHelper.getShortFirstDate(claim.invDt);
            data.claimLastDay = DateHelper.getShortLastDate(claim.invDt);
            data.claimUseAmt = FormatHelper.addComma((this._parseInt(claim.totInvAmt) + Math.abs(this._parseInt(claim.dcAmt))).toString() );
            data.claimDisAmt = claim.dcAmt || '0';
            data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(data.claimDisAmt))).toString() );
            // Total
            data.claimPay = claim.totInvAmt || '0';
          } else {
            data.isRealTime = false;
          }
          this._requestClaim(req, res, data);

        } else {

          // SKB(청구대표회선)인 경우 오류code 처리
          if ( resp.code === 'BIL0011' ) {
            data.isBroadBand = true;
            this._requestUsageFee(req, res, data);
            return;
          }
          resp.title = MYT_FARE_SUBMAIN_TITLE.MAIN;
          return this.errorRender(resp);
        }
      });

    } else {
      this._requestUsageFee(req, res, data);
    }
  }

  /**
   * 청구요금
   * @param req :Request
   * @param res :Response
   * @param data :Object
   * @param svcInfo :Object
   * @private
   */
  _requestClaim(req, res, data) {
    Observable.combineLatest(
      this._getNonPayment(),
      this._getPaymentInfo(),
      this._getTotalPayment(),
      this._getAffiliateCard()
      // this._getTaxInvoice(),
      // this._getContribution(),
      // this._getMicroPrepay(),
      // this._getContentPrepay()
      // this.redisService.getData(this.bannerUrl)
    ).subscribe(([ nonpayment,  paymentInfo, totalPayment, affiliateCard
                   /* taxInvoice, contribution, microPay, contentPay, banner*/]) => {
      // 소액결제
      /*if ( microPay ) {
        data.microPay = microPay;
        // 휴대폰이면서 미성년자가 아닌경우
        if ( data.microPay.code !== API_ADD_SVC_ERROR.BIL0031 && data.svcInfo.svcAttrCd === 'M1' ) {
          data.isMicroPrepay = true;
        }
      }*/
      // 콘텐츠 (성능개선항목으로 삭제)
      /*if ( contentPay ) {
        data.contentPay = contentPay;
        // 휴대폰이면서 미성년자가 아닌경우
        if ( data.contentPay.code !== API_ADD_SVC_ERROR.BIL0031 && data.svcInfo.svcAttrCd === 'M1' ) {
          data.isContentPrepay = true;
        }
      }*/
      // 미납내역 (성능개선항목으로 삭제)
      // [OP002-809] 임시로 성능개서 이전으로 원복
      if ( nonpayment ) {
        data.nonpayment = nonpayment;
        data.unPaidTotSum = nonpayment.unPaidTotSum && nonpayment.unPaidTotSum !== '0' ? FormatHelper.addComma(nonpayment.unPaidTotSum) : null;
      }
      // data.unPaidTotSum = data.claim.colBamt && data.claim.colBamt !== '0' ? data.claim.colBamt : null;
      // 납부/청구 정보
      if ( paymentInfo ) {
        data.paymentInfo = paymentInfo;
        // 자동납부인 경우에도 버튼 노출하도록 변경 [DV001-10531]
        // if ( paymentInfo.payMthdCd === '01' || paymentInfo.payMthdCd === '02' || paymentInfo.payMthdCd === 'G1' ) {
        //   // 은행자동납부, 카드자동납부, 은행지로자동납부
        //   data.isNotAutoPayment = false;
        // }
      }
      // 최근납부내역
      if ( totalPayment ) {
        data.totalPayment = totalPayment.paymentRecord.slice(0, 3).map(o => {
          return Object.assign(o, {
            isPoint : (o.payMthdCd === '15' || o.payMthdCd.indexOf('BB') >= 0)
          });
        });
      }

      // 제휴카드 정보
      if (affiliateCard) {
        data.isShowAffiliateCard = affiliateCard.join_card_yn === 'N' && affiliateCard.pay_mthd_cd === '02';
      }
      // 세금계산서
      // if ( taxInvoice ) {
      //   data.taxInvoice = taxInvoice;
      // }
      // // 기부금/후원금
      // if ( contribution ) {
      //   data.contribution = contribution;
      // }
      // 배너 정보 - client에서 호출하는 방식으로 변경 (19/01/22)
      // if ( banner.code === API_CODE.REDIS_SUCCESS ) {
      //   if ( !FormatHelper.isEmpty(banner.result) ) {
      //     data.banner = this.parseBanner(banner.result);
      //   }
      // }

      res.render('myt-fare.submain.html', { data });
    });
  }

  /**
   * 사용요금
   * @param req :Request
   * @param res :Response
   * @param data :Object
   * @param svcInfo :Object
   * @private
   */
  _requestUsageFee(req, res, data) {
    data.type = 'UF';

    Observable.combineLatest(
      this._getUsageFee(),
      this._getPaymentInfo(),
      this._getAffiliateCard()
      // this._getMicroPrepay(),
      // this._getContentPrepay()
      // this.redisService.getData(this.bannerUrl),
    ).subscribe(([usage, paymentInfo, affiliateCard /* microPay, contentPay, banner*/]) => {
      if ( usage && usage.info ) {
        this.error.render(res, {
          title: MYT_FARE_SUBMAIN_TITLE.MAIN,
          code: usage.info.code,
          msg: usage.info.msg,
          pageInfo: data.pageInfo,
          svcInfo: data.svcInfo
        });
      } else {
        // 사용요금
        if ( usage ) {
          data.usage = usage;
          data.usageFirstDay = DateHelper.getShortFirstDate(usage.invDt);
          data.usageLastDay = DateHelper.getShortLastDate(usage.invDt);
          // 사용요금
          // const usedAmt = parseInt(usage.useAmtTot, 10);
          // data.useAmtTot = FormatHelper.addComma(usedAmt.toString() || '0');
          data.useAmtTot = usage.invAmt || '0';
        } else {
          data.isRealTime = false;
        }
        // 납부/청구 정보
        if ( paymentInfo ) {
          data.paymentInfo = paymentInfo;
          // 자동납부인 경우에도 버튼 노출하도록 변경 [DV001-10531]
          // if ( paymentInfo.payMthdCd === '01' || paymentInfo.payMthdCd === '02' || paymentInfo.payMthdCd === 'G1' ) {
          //   // 은행자동납부, 카드자동납부, 은행지로자동납부
          //   data.isNotAutoPayment = false;
          // }
        }
        // 제휴카드 정보
        if (affiliateCard) {
          data.isShowAffiliateCard = affiliateCard.join_card_yn === 'N' && affiliateCard.pay_mthd_cd === '02';
        }
        // 소액결제 (성능개선항목으로 제거)
        /*if ( microPay ) {
          data.microPay = microPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( data.microPay.code !== API_ADD_SVC_ERROR.BIL0031 && data.svcInfo.svcAttrCd === 'M1' ) {
            data.isMicroPrepay = true;
          }
        }*/
        // 콘텐츠 (성능개선항목으로 제거)
        /*if ( contentPay ) {
          data.contentPay = contentPay;
          // 휴대폰이면서 미성년자가 아닌경우
          if ( data.contentPay.code !== API_ADD_SVC_ERROR.BIL0031 && data.svcInfo.svcAttrCd === 'M1' ) {
            data.isContentPrepay = true;
          }
        }*/
        // 배너 정보 - client에서 호출하는 방식으로 변경 (19/01/22)
        // if ( banner.code === API_CODE.REDIS_SUCCESS ) {
        //   if ( !FormatHelper.isEmpty(banner.result) ) {
        //     data.banner = this.parseBanner(banner.result);
        //   }
        // }

        // PocketFi or T Login 인 경우 이용요금자세히버튼 노출
        if ( ['M3', 'M4'].indexOf(data.svcInfo.svcAttrCd) > -1 ) {
          data.isNotAutoPayment = false;
        }

        res.render('myt-fare.submain.html', { data });
      }
    });
  }

  /**
   * 선불폰 조회 및 화면이동
   * @param req
   * @param res
   * @param data
   * @private
   */
  _requestPPS(req, res, data) {
    // Observable.combineLatest(
    //   this.redisService.getData(this.bannerUrl),
    // ).subscribe(([banner]) => {
    // 납부/청구 정보
    // 배너 정보 - client에서 호출하는 방식으로 변경 (19/01/22)
    // if ( banner && (banner.code === API_CODE.REDIS_SUCCESS) ) {
    //   if ( !FormatHelper.isEmpty(banner.result) ) {
    //     data.banner = this.parseBanner(banner.result);
    //   }
    // }
    // });
    data.isNotAutoPayment = false;
    data.isRealTime = false;
    data.isPPS = true;
    res.render('myt-fare.submain.html', { data });
  }

  recompare(a, b) {
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if ( codeA < codeB ) {
      comparison = 1;
    } else if ( codeA > codeB ) {
      comparison = -1;
    }
    return comparison;
  }

  compare(a, b) {
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if ( codeA > codeB ) {
      comparison = 1;
    } else if ( codeA < codeB ) {
      comparison = -1;
    }
    return comparison;
  }

  /**
   * 다른 회선 항목 정리
   * @param target
   * @param items
   */
  convertOtherLines(target, items): any {
    const MOBILE = (items && items['m']) || [];
    const SPC = (items && items['s']) || [];
    const OTHER = (items && items['o']) || [];
    const list: any = [];
    MOBILE.sort(this.compare);
    SPC.sort(this.recompare);
    OTHER.sort(this.recompare);
    if ( MOBILE.length > 0 || OTHER.length > 0 || SPC.length > 0 ) {
      let nOthers: any = [];
      nOthers = nOthers.concat(MOBILE, SPC, OTHER);
      nOthers.filter((item) => {
        if ( target.svcMgmtNum !== item.svcMgmtNum ) {
          // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
          // item.nickNm = item.nickNm || item.eqpMdlNm;
          item.nickNm = item.nickNm || SVC_ATTR_NAME[item.svcAttrCd];
          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          if ( ['M1', 'M2'].indexOf(item.svcAttrCd) === -1 ) {
            item.nickNm = SVC_ATTR_NAME[item.svcAttrCd];
          }
          // IPTV, 인터넷 인 경우 주소표시
          if ( ['S1', 'S2'].indexOf(item.svcAttrCd) > -1 ) {
            item.svcNum = item.addr;
          } else {
            item.svcNum = StringHelper.phoneStringToDash(item.svcNum);
          }
          list.push(item);
        }
      });
    }
    return list;
  }

  // 사용요금 조회
  _getUsageFee() {
    return this.apiService.request(API_CMD.BFF_05_0204, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( !resp.result.invDt || resp.result.invDt.length === 0 ) {
          // no data
          return null;
        }
        return resp.result;
      } else {
        return {
          info: resp
        };
      }
    });
  }

  // 미납요금조회(성능개선항목으로 미조회)
  _getNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.unPaidTotSum === '0' ) {
          // no data
          return null;
        }
        return resp.result;
      } else {
        return null;
      }
    });
  }

  // 납부/청구 정보 조회
  _getPaymentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0058, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  // 납부내역 조회(최근 납부내역)
  _getTotalPayment() {
    return this.apiService.request(API_CMD.BFF_07_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.paymentRecord.length === 0 ) {
          return null;
        }
        return resp.result;
      } else {
        return null;
      }
    });
  }

  // 세금계산서 조회(캐싱처리)
  _getTaxInvoice() {
    return this.apiService.requestStore(SESSION_CMD.BFF_07_0017, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else if ( resp.code === API_TAX_REPRINT_ERROR.BIL0018 ) {
        // 사업자 번호를 조회할 수 없는 상황
        return null;
      } else {
        return null;
      }
    });

  }

  // 기부금 내역 조회(성능개선항목으로 미조회)
  _getContribution() {
    return this.apiService.request(API_CMD.BFF_05_0038, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.donationList && resp.result.donationList.length > 0 ) {
          return resp.result;
        } else {
          return null;
        }
      } else {
        return null;
      }
    });
  }

  // 소액결제 조회(성능개선항목으로 미조회)
  _getMicroPrepay() {
    // 소액결제 확인
    return this.apiService.request(API_CMD.BFF_07_0072, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 || resp.code.indexOf('BIL') > -1 ) {
        return resp;
      } else {
        return null;
      }
    });
  }

  // 콘텐츠이용내역 조회(성능개선항목으로 미조회)
  _getContentPrepay() {
    // 콘텐츠이용 확인
    return this.apiService.request(API_CMD.BFF_07_0080, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 || resp.code.indexOf('BIL') > -1 ) {
        return resp;
      } else {
        return null;
      }
    });
  }

  // 제휴카드 정보조회
  _getAffiliateCard() {
    return this.apiService.request(API_CMD.BFF_07_0102, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _parseInt(str: String) {
    if ( !str ) {
      return 0;
    }

    return parseInt(str.replace(/,/g, ''), 10);
  }

  /**
   * 다른 페이지를 찾고 계신가요 통계코드 생성
   * @param data
   */
  private getXtEid(data: any): any {
    const eid = {
      billHistory   : 'CMMA_A3_B12-12',    // 요금납부내역 조회
      hotdata       : 'CMMA_A3_B12-13',    // 실시간 잔여량
      infodiscount  : 'CMMA_A3_B12-14',    // 약정할인/기기상환 정보
      myBenefit       : 'CMMA_A3_B12-15',    // 나의 혜택/할인
      discount      : 'CMMA_A3_B12-16',    // 요금할인
      join          : 'CMMA_A3_B12-17',    // 나의 가입정보
      mobileplan    : 'CMMA_A3_B12-18'     // 요금제
    };

    if (data.svcInfo.svcAttrCd === SVC_ATTR_E.PPS) {
      Object.assign(eid, {
        myplan      : 'CMMA_A3_B12-19',  // 나의 요금제
        additions   : 'CMMA_A3_B12-20',  // 나의 부가서비스
        discount    : 'CMMA_A3_B12-21',  // 요금할인
        mobileplan  : 'CMMA_A3_B12-22'   // 요금제
      });
    } else if (SVC_CDGROUP.WIRE.indexOf(data.svcInfo.svcAttrCd) > -1) {
      Object.assign(eid, {
        billHistory   : 'CMMA_A3_B12-23',  // 요금납부내역 조회
        myplan        : 'CMMA_A3_B12-24',  // 나의 요금제
        additions     : 'CMMA_A3_B12-25',  // 나의 부가서비스
        combiDiscount : 'CMMA_A3_B12-26',  // 결합할인
        wireplan      : 'CMMA_A3_B12-27'   // 인터넷/전화/IPTV
      });
    }

    data.xtEid = eid;
  }

  private errorRender(resp): any {
    const {title, code, msg} = resp;
    const {res, pageInfo, svcInfo} = this._datas;
    return this.error.render(res, {
      title,
      code,
      msg,
      pageInfo,
      svcInfo
    });
  }
}

export default MyTFareSubmainController;
