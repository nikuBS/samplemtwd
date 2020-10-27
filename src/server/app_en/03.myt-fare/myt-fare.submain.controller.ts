/**
 * MenuName: MY Bills > Bills 
 * @file myt-fare.submain.controller.ts
 * @author P165332
 * @since 2020.09
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common_en/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../utils_en/format.helper';
import DateHelper from '../../utils_en/date.helper';
import {API_ADD_SVC_ERROR, API_CMD, API_CODE, API_TAX_REPRINT_ERROR, SESSION_CMD} from '../../types_en/api-command.type';
import { MYT_FARE_SUBMAIN_TITLE } from '../../types_en/title.type';
import {SVC_ATTR_E, SVC_ATTR_NAME, SVC_CDGROUP} from '../../types_en/bff.type';
import StringHelper from '../../utils_en/string.helper';
// OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
import CommonHelper from '../../utils_en/common.helper';
import moment from 'moment';
import BrowserHelper from '../../utils/browser.helper';
import {MytFareInfoMiriService} from './services/info/myt-fare.info.miri.service';
class MyTFareSubmainController extends TwViewController {
  

  constructor() {
    super();
  }

  private _miriService!: MytFareInfoMiriService;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._miriService = new MytFareInfoMiriService(req, res, svcInfo);
    const thisMain = this;
    const BLOCK_ON_FIRST_DAY = false;
    const data: any = {
      reqQuery: req.query,
      svcInfo: Object.assign({}, svcInfo),
      pageInfo: pageInfo,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      // 1일 기준
      isNotFirstDate: (new Date().getDate() > 1) || !BLOCK_ON_FIRST_DAY,
      // 휴대폰, T-PocketFi 인 경우에만 실시간 요금 조회 노출
      isRealTime: (['M1', 'M3'].indexOf(svcInfo.svcAttrCd) > -1),
      miriAmt: null
    };
    const defaultData = {
      reqQuery: data.reqQuery,
      svcMgmtNum: svcInfo.svcMgmtNum,
      svcAttrCd: svcInfo.svcAttrCd,
      allSvc: allSvc,
      errorMsg: ''
     };
    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    CommonHelper.addCurLineInfo(data.svcInfo);

    // 다른 페이지를 찾고 계신가요 통계코드 추가
    BrowserHelper.isApp(req)?this.getAppXtEid(data):this.getMWebXtEid(data);
    BrowserHelper.isApp(req)?this.getAppXtEid(defaultData):this.getMWebXtEid(defaultData);

    let test = data.reqQuery.test;

    if( test === '6month') return res.render('submain/en.myt-fare.submain.nopay6month.html', { data });
    if( test === '500' ) return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: 500 });

    //영문화 유선회선인경우 회선변경 안내페이지로 이동
    if(['M1'].indexOf(svcInfo.svcAttrCd) === -1 || test === 'notPhone'  ) {
      res.render( 'submain/en.myt-fare.submain.not.phone.html',{ data:defaultData,svcInfo : svcInfo, pageInfo : pageInfo });
      return;
    }
    //무선회선이 없는경우
    if( svcInfo.caseType === '02' || test === 'notLine' ) {
      defaultData.errorMsg = 'LINE_NOT_EXIST';
      res.render('submain/en.myt-fare.submain.not.line.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : pageInfo });
      return;
    }
    //무선 회선은 있지만 등록된 회선이 없는경우
    if( svcInfo.caseType === '03' || svcInfo.nonSvcCnt === 0 || test === 'notRegi') {
      defaultData.errorMsg = 'LINE_NOT_REGIST';
      res.render('submain/en.myt-fare.submain.not.line.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : pageInfo });
      return;
    }
   
    this.logger.info("## 대표회선 여부 [svcInfo.actRepYn] =>"+svcInfo.actRepYn);
    // 대표청구 여부
    if ( svcInfo.actRepYn === 'Y' ) {

      // 페이지url 통합으로 삭제 DV001-16372
      /*if ( data.type === 'UF' ) {
        // 사용요금화면에서 대표청구회선인 경우에는 청구화면으로 조회
        res.redirect('/myt-fare/submain');
      }*/
      this.apiService.request(API_CMD.BFF_05_0229, {}).subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          // OP002-2986. 통합청구에서 해지할경우(개별청구) 청구번호가 바뀐다고함. 그럼 성공이지만 결과를 안준다고 함.
          if (!resp.result || FormatHelper.isEmpty(resp.result.invDt)) {
             return res.render('submain/en.myt-fare.submain.nopay6month.html', { data });
          }
          const claim = resp.result;

          // PPS, 휴대폰이 아닌 경우는 서비스명 노출
          // if ( ['M1', 'M2'].indexOf(data.svcInfo.svcAttrCd) === -1 ) {
          //   data.svcInfo.nickNm = SVC_ATTR_NAME[data.svcInfo.svcAttrCd];
          // }

          // 청구요금
          if ( claim && claim.invDt && claim.invDt.length > 0 ) {
            data.claim = claim;

            data.claimFirstDay = DateHelper.getShortFirstDate(claim.invDt);
            data.claimLastDay = DateHelper.getShortLastDate(claim.invDt);

            data.selClaimDtM = (claim) ?  DateHelper.getShortDateWithFormatAddByUnit(claim.invDt, 1, 'days', 'MMM' ) : null;

            // 사용요금
            // const usedAmt = parseInt(claim.useAmtTot, 10);
            // data.claimUseAmt = FormatHelper.addComma(usedAmt.toString() || '0');
            data.claimUseAmt = FormatHelper.addComma((this._parseInt(claim.totInvAmt) + Math.abs(this._parseInt(claim.dcAmt))).toString() );
            let _totSumPay =  this._parseInt(claim.totInvAmt)+this._parseInt(claim.colBamt);

            if( claim.colBamt !== '0' ){
              data.colBamtText = '₩'+FormatHelper.addComma( (claim.colBamt).toString() );
            }

            data.totSumPayText = '₩'+FormatHelper.addComma( (_totSumPay).toString() );

            // 할인요금
            // const disAmt = Math.abs(claim.deduckTotInvAmt);
            // data.claimDisAmt = FormatHelper.addComma((disAmt.toString() || '0'));
            data.claimDisAmt = claim.dcAmt || '0';
            data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(data.claimDisAmt))).toString() );
            data.billInvAmtList = claim.billInvAmtList;

            data.billInvAmtList.forEach(function(info){
              info.invAmt     = (Math.abs(thisMain._parseInt(info.invAmt))).toString();
              info.dcAmt      = (Math.abs(thisMain._parseInt(info.dcAmt))).toString();
              info.invDtText  = thisMain._getChartMonth(info.invDt);
              info.invDt      = info.invDt;
            });
            // 미납요금
            // data.claimColBamt = claim.colBamt || '0';
            // Total
            data.claimPay = claim.totInvAmt || '0';
          } else {
            data.isRealTime = false;
          }
          //  for(var i=0;data.billInvAmtList.length;i++){
          //     var dcAmt = data.billInvAmtList[i].dcAmt;
          //  //   dcAmt = Math.abs(this._parseInt(dcAmt));
          //     console.log("########## dcAMt=>"+dcAmt);
          //   }
          Observable.combineLatest([
            this._miriService.getMiriBalance()
          ]).subscribe((miri) => {
            data.miriAmt =  miri[0];
            res.render('en.myt-fare.submain.html', { data });
          })

        } else {
          //최근 6개월 내 청구된 내역이 없습니다.
          res.render('submain/en.myt-fare.submain.nopay6month.html', { data });
        }

      });

    //
    } else {
      // 페이지url 통합으로 삭제 DV001-16372
      /*if ( data.type !== 'UF' ) {
        // res.redirect('/myt-fare/submain/usagefee?count=' + claim.paidAmtMonthSvcCnt);
        res.redirect('/myt-fare/submain/usagefee?count=0');
      }*/
      this._requestUsageFee(req, res, data);
    }

  }
  //차트 청구월 변경
  _getChartMonth(dt){
    let rs;
    let nowDt = new Date();

    let _yyyy1 = this._convDateCustomFormat(nowDt ,'YYYY');

    let _yyyy2 = this._convDateCustomFormat(dt    ,'YYYY');

    if(_yyyy1 == _yyyy2){
      rs = this._convDateCustomFormat(dt,'MMM.');
    }else{
      rs = this._convDateCustomFormat(dt,'MMM. YYYY');
    }
    return rs;
  }
  _convDateCustomFormat(date: any, format: string): string {
    return moment(date).add(1, "days").locale("en").format(format);
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
    Observable.combineLatest([
      this._getUsageFee(),
      this._miriService.getMiriBalance()
    ]).subscribe(([ usage,miri]) => {
      if ( usage && usage.info ) {
        return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: 500 });
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

          data.selClaimDtM = (usage) ?  DateHelper.getShortDateWithFormatAddByUnit(usage.invDt, 1, 'days', 'MMM' ) : null;

          this.logger.debug("#### [ BFF_05_204 ] >> ",usage);
          this.logger.debug("#######################################################################################");
          this.logger.debug("### data.usage         ==>"+ data.usage);
          this.logger.debug("### data.usageFirstDay ==>"+ data.usageFirstDay);
          this.logger.debug("### data.usageLastDay  ==>"+ data.usageLastDay);
          this.logger.debug("### usage.invAmt  ==>"+ usage.invAmt);
          this.logger.debug("### data.useAmtTot  ==>"+ data.useAmtTot);
          this.logger.debug("### data.usedAmtList.length  ==>"+ usage.usedAmtList.length);
          this.logger.debug("#######################################################################################");

          const test = this;
          usage.usedAmtList.forEach(function(info){
            info.invAmt = (Math.abs(test._parseInt(info.invAmt))).toString();
            info.dcAmt = (Math.abs(test._parseInt(info.dcAmt))).toString();
            info.invDt = info.invDt;
            info.invDtText = test._getChartMonth(info.invDt);
           });

          data.claimFirstDay = DateHelper.getShortFirstDate(data.usageFirstDay);
          data.claimLastDay = DateHelper.getShortLastDate(data.usageLastDay);

          // 사용요금
          // const usedAmt = parseInt(claim.useAmtTot, 10);
          // data.claimUseAmt = FormatHelper.addComma(usedAmt.toString() || '0');
          data.claimUseAmt = FormatHelper.addComma((this._parseInt(data.useAmtTot) + Math.abs(this._parseInt(usage.dcAmt))).toString() );
          data.claimPay = data.useAmtTot || '0';
          // 할인요금
          // const disAmt = Math.abs(claim.deduckTotInvAmt);
          // data.claimDisAmt = FormatHelper.addComma((disAmt.toString() || '0'));
          data.claimDisAmt = usage.dcAmt || '0';
          data.claimDisAmtAbs = FormatHelper.addComma((Math.abs(this._parseInt(usage.avgDcAmt))).toString() );
          data.billInvAmtList = usage.usedAmtList;

        } else {
          data.isRealTime = false;
          //최근 6개월 내 청구된 내역이 없습니다.
          return res.render('submain/en.myt-fare.submain.nopay6month.html', { data });
        }
        data.miriAmt = miri[0];
        this.logger.debug("### ============================================================" ,data);
        return res.render('en.myt-fare.submain.html', { data });
      }
    });
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
  private getAppXtEid(data: any): any {
    const eid = {
      line      : 'CMMA_A10_B81_C1201-10',    // 회선번호
      guide     : 'CMMA_A10_B81_C1201-11',    // 요금안내서
      hotbill   : 'CMMA_A10_B81_C1201-12',    // 실시간요금
      miri      : 'CMMA_A10_B81_C1201-24',    // 미리납부한요금
      0         : 'CMMA_A10_B81_C1201-13',    // chart0
      1         : 'CMMA_A10_B81_C1201-14',    // chart1
      2         : 'CMMA_A10_B81_C1201-15',    // chart2
      3         : 'CMMA_A10_B81_C1201-16',    // chart3
      4         : 'CMMA_A10_B81_C1201-17',    // chart4
      5         : 'CMMA_A10_B81_C1201-18',     // chart5
      notPhone  : 'CMMA_A10_B81_C1201-21',   // notPhone
      gotoKor   : 'CMMA_A10_B81_C1201-22'     // goKor
    };
    data.xtEid = eid;
  }
  
  private getMWebXtEid(data: any): any {
    const eid = {
      line      : 'MWMA_A10_B81_C1201-1',    // 회선번호
      guide     : 'MWMA_A10_B81_C1201-2',    // 요금안내서
      hotbill   : 'MWMA_A10_B81_C1201-3',    // 실시간요금
      miri      : 'MWMA_A10_B81_C1201-23',    // 미리납부한요금
      0         : 'MWMA_A10_B81_C1201-4',    // chart0
      1         : 'MWMA_A10_B81_C1201-5',    // chart1
      2         : 'MWMA_A10_B81_C1201-6',    // chart2
      3         : 'MWMA_A10_B81_C1201-7',    // chart3
      4         : 'MWMA_A10_B81_C1201-8',    // chart4
      5         : 'MWMA_A10_B81_C1201-9',     // chart5
      notPhone  : 'MWMA_A10_B81_C1201-19',   // notPhone
      gotoKor   : 'MWMA_A10_B81_C1201-20'     // goKor
    };
    data.xtEid = eid;
  }
}

export default MyTFareSubmainController;
