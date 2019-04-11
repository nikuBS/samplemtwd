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
import { API_ADD_SVC_ERROR, API_CMD, API_CODE, API_TAX_REPRINT_ERROR, SESSION_CMD } from '../../types/api-command.type';
import { MYT_FARE_SUBMAIN_TITLE } from '../../types/title.type';
import { SVC_ATTR_NAME } from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';

class MyTFareSubmainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const BLOCK_ON_FIRST_DAY = false;
    const data: any = {
      svcInfo: Object.assign({}, svcInfo),
      pageInfo: pageInfo,
      // 소액결제 버튼 노출 여부
      isMicroPayment: false,
      // 납부청구 관련 버튼 노출 여부
      isNotAutoPayment: true,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      // 1일 기준
      isNotFirstDate: (new Date().getDate() > 1) || !BLOCK_ON_FIRST_DAY,
      // 휴대폰, T-PocketFi 인 경우에만 실시간 요금 조회 노출
      isRealTime: (['M1', 'M3'].indexOf(svcInfo.svcAttrCd) > -1)
    };

    // 페이지url 통합으로 삭제 DV001-16372
    /*if ( req.params && req.params[0] === '/usagefee' ) {
      data.type = 'UF';
      if ( req.query && req.query.count ) {
        data.svcCount = parseInt(req.query.count, 10);
      }
    }*/
    // this.bannerUrl = REDIS_KEY.BANNER_ADMIN + pageInfo.menuId;
    if ( data.svcInfo.svcAttrCd === 'M2' ) {
      data.type = 'UF';
      this._requestPPS(req, res, data);
    } else {

      // [DV001-15583] Broadband 인 경우에 대한 예외처리 수정
      if ( svcInfo.actCoClCd === 'B' ) {
        data.type = 'UF';
        data.isBroadBand = true;
      }

      // 대표청구 여부
      if ( svcInfo.actRepYn === 'Y' ) {

        // 페이지url 통합으로 삭제 DV001-16372
        /*if ( data.type === 'UF' ) {
          // 사용요금화면에서 대표청구회선인 경우에는 청구화면으로 조회
          res.redirect('/myt-fare/submain');
        }*/


        this.apiService.request(API_CMD.BFF_05_0203, {}).subscribe((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
            const claim = resp.result;

            // PPS, 휴대폰이 아닌 경우는 서비스명 노출
            if ( ['M1', 'M2'].indexOf(data.svcInfo.svcAttrCd) === -1 ) {
              data.svcInfo.nickNm = SVC_ATTR_NAME[data.svcInfo.svcAttrCd];
            }

            // 청구요금
            if ( claim && claim.invDt.length > 0 ) {
              data.claim = claim;
              data.claimFirstDay = DateHelper.getShortFirstDate(claim.invDt);
              data.claimLastDay = DateHelper.getShortLastDate(claim.invDt);
              // 사용요금
              // const usedAmt = parseInt(claim.useAmtTot, 10);
              // data.claimUseAmt = FormatHelper.addComma(usedAmt.toString() || '0');
              data.claimUseAmt = FormatHelper.addComma((this._parseInt(claim.totInvAmt) + Math.abs(this._parseInt(claim.dcAmt))).toString() );
              // 할인요금
              // const disAmt = Math.abs(claim.deduckTotInvAmt);
              // data.claimDisAmt = FormatHelper.addComma((disAmt.toString() || '0'));
              data.claimDisAmt = claim.dcAmt || '0';
              data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(data.claimDisAmt))).toString() );

              // 미납요금
              // data.claimColBamt = claim.colBamt || '0';

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

            this.error.render(res, {
              title: MYT_FARE_SUBMAIN_TITLE.MAIN,
              code: resp.code,
              msg: resp.msg,
              pageInfo: data.pageInfo,
              svcInfo: data.svcInfo
            });
          }
        });

      } else {
        // 페이지url 통합으로 삭제 DV001-16372
        /*if ( data.type !== 'UF' ) {
          // res.redirect('/myt-fare/submain/usagefee?count=' + claim.paidAmtMonthSvcCnt);
          res.redirect('/myt-fare/submain/usagefee?count=0');
        }*/
        this._requestUsageFee(req, res, data);
      }

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
      // this._getNonPayment(),
      this._getPaymentInfo(),
      this._getTotalPayment(),
      this._getTaxInvoice(),
      // this._getContribution(),
      // this._getMicroPrepay(),
      // this._getContentPrepay()
      // this.redisService.getData(this.bannerUrl)
    ).subscribe(([/* nonpayment, */ paymentInfo, totalPayment,
                   taxInvoice, /* contribution,*/ /* microPay, contentPay/*, banner*/]) => {
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
      /*if ( nonpayment ) {
        data.nonpayment = nonpayment;
        data.unPaidTotSum = FormatHelper.addComma(nonpayment.unPaidTotSum);
      }*/
      data.unPaidTotSum = data.claim.colBamt && data.claim.colBamt !== '0' ? data.claim.colBamt : null;
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
      // this._getMicroPrepay(),
      // this._getContentPrepay()
      // this.redisService.getData(this.bannerUrl),
    ).subscribe(([usage, paymentInfo, /* microPay, contentPay, banner*/]) => {
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
        if ( resp.result.invDt.length === 0 ) {
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

  _parseInt(str: String) {
    if ( !str ) {
      return 0;
    }

    return parseInt(str.replace(/,/g, ''), 10);
  }
}

export default MyTFareSubmainController;
