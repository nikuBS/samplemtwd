/**
 * FileName: myt.bill.feeguide.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.05
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import * as _ from 'lodash';
import { fromPromise } from 'rxjs/observable/fromPromise';

class MyTBillBillguideSubChildBill extends TwViewController {
  constructor() {
    super();
  }

  public NO_BILL_FIELDS = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];
  public fieldInfo = {
    lcl: 'billItmLclNm',
    scl: 'billItmSclNm',
    name: 'billItmNm',
    value: 'invAmt'
  };

  public reqQuery: any;
  private _svcInfo: any;

  private _circuitChildInfo: any = []; // 자녀회선조회 BFF_05_00024
  private _usedAmountChildInfo: any; // 자녀회선 사용요금 조회 BFF_05_00047
  private _defaultInfo: any; // 미납내역 | BFF_05_0030

  // 공통데이터
  private _commDataInfo: any = {
    selClaimDtBtn: '', // 선택 청구 월 | 2017년 10월
    selClaimDtNum: '', // 선택 청구 월 | number
    selStaDt: '', // 선택시작
    selEndDt: '', // 선택끝
    discount: '', // 할인액
    joinSvcList: '', // 가입 서비스 리스트
    unPaidTotSum: '', // 미납금액
    unPaidDetails: '', // 미납금액 상세내역
    prodNm: '', // pps 요금제
    prodAmt: '', // pps 잔액
    useEndDt: '', // pps 발신/사용기간
    dataKeepTrmDt: '', // pps 수신/데이터유지기간
    numKeepTrmDt: '', // pps 번유지기간
    curDt: '', // 현재날짜
    remained: '', // 잔여데이터 KB | 공백일 경우 표시안
    dataYn: '', // 음성+데이터 'Y'
    dataProdYn: '', // MB 'Y' | 원 'N'
    phone: null
  };

  // 노출조건
  private _showConditionInfo: any = {};

  private _urlTplInfo: any = {
    pageRenderView: 'bill/myt.bill.billguide.subChildBill.html'
  };


  public _childrenLineApi(): any {

    return new Promise((resolve, reject) => {
      const childrenLineReqApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {}); // 자녀회선 : 자녀가 몇명인지 구분

      const thisMain = this;
      let tempData: any;

      Observable.combineLatest(
        childrenLineReqApi
      ).subscribe({
        next(childrenLineReq) {
          thisMain.logger.info(thisMain, '[ 1. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
          tempData = childrenLineReq; // 자녀회선
        },
        error(error) {
          thisMain.logger.info(thisMain, '[ error ] : ', error.stack || error);
        },
        complete() {
          thisMain.logger.info(thisMain, '[ complete 1] : ', tempData);
          resolve(tempData);
        }
      });

    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.reqQuery = req.query;

    const thisMain = this;
    let billItems = {};
    let selectSvcMgmtNum;

    const dataInit = function () {
      thisMain._commDataInfo.selClaimDtNum =
        (thisMain._usedAmountChildInfo) ? thisMain.getSelClaimDtNum(String(thisMain._usedAmountChildInfo.invDt)) : null;

      thisMain._commDataInfo.selClaimDtBtn =
        (thisMain._usedAmountChildInfo) ? thisMain.getSelClaimDtBtn(String(thisMain._usedAmountChildInfo.invDt)) : null;

      thisMain._commDataInfo.selStaDt = (thisMain._usedAmountChildInfo) ? thisMain.getSelStaDt(String(thisMain._usedAmountChildInfo.invDt)) : null;

      thisMain._commDataInfo.selEndDt =
        (thisMain._usedAmountChildInfo) ? DateHelper.getShortDateNoDot(String(thisMain._usedAmountChildInfo.invDt)) : null;

      thisMain._commDataInfo.discount =
        (thisMain._usedAmountChildInfo) ? FormatHelper.addComma(String(Math.abs(Number(thisMain._usedAmountChildInfo.deduckTotInvAmt)))) : 0;

      thisMain._commDataInfo.joinSvcList = (thisMain._usedAmountChildInfo) ? (thisMain._usedAmountChildInfo.paidAmtSvcCdList) : null;
    };

    fromPromise(this._childrenLineApi()).subscribe({
      next(item: any) {
        console.dir(item);
        thisMain.logger.info(thisMain, '[ fromPromise > next > item[0].result ] : ', item[0].result);

        thisMain._circuitChildInfo = item[0].result;

        let usedAmountChildReqApi: Observable<any>;
        /*
        * 쿼리스트링 값이 있으면 쿼리스트링 값으로 셋팅한다.
         */
        thisMain.logger.info(thisMain, '[ 쿼리스트링 ] : ', thisMain.reqQuery);

        const tempSelNum = (thisMain.reqQuery.selNum) ? thisMain.reqQuery.selNum : 0;
        selectSvcMgmtNum = thisMain._circuitChildInfo[tempSelNum].svcMgmtNum;

        if ( thisMain.reqQuery.childSvcMgmtNum || thisMain.reqQuery.invDt ) {
          usedAmountChildReqApi = thisMain.apiService.request(API_CMD.BFF_05_0047, {
            childSvcMgmtNum: thisMain.reqQuery.childSvcMgmtNum,
            invDt: thisMain.reqQuery.invDt
          });
        } else {
          usedAmountChildReqApi = thisMain.apiService.request(API_CMD.BFF_05_0047, {
            childSvcMgmtNum: selectSvcMgmtNum
          });
        }

        // 자녀회선 사용요금 조회
        Observable.combineLatest(
          usedAmountChildReqApi
        ).subscribe(
          {
            next([
                   usedAmountChildReq
                 ]) {
              thisMain.logger.info(thisMain, '[ 1. next > usedAmountChildReq ] 자녀회선 사용요금 조회 : ', usedAmountChildReq);
              thisMain._usedAmountChildInfo = usedAmountChildReq.result;
              billItems = thisMain.arrayToObject(thisMain._usedAmountChildInfo.useAmtDetailInfo, thisMain.fieldInfo);
            },
            error(error) {
              thisMain.logger.info(thisMain, '[ error ] : ', error.stack || error);
            },
            complete() {
              thisMain.logger.info(thisMain, '[ complete ] : ');

              thisMain._commDataInfo.phone = thisMain.getPhoneMask(thisMain._circuitChildInfo);

              thisMain.logger.info(thisMain, '[ 1.reqQuery  ]  : ', thisMain.reqQuery);
              thisMain.logger.info(thisMain, '[ 2.svcInfo  ]  : ', thisMain._svcInfo);
              thisMain.logger.info(thisMain, '[ 3.selectSvcMgmtNum  ]  : ', selectSvcMgmtNum);
              thisMain.logger.info(thisMain, '[ 4.circuitChildInfo  ]  : ', thisMain._circuitChildInfo);
              thisMain.logger.info(thisMain, '[ 5.usedAmountChildInfo  ]  : ', thisMain._usedAmountChildInfo);
              thisMain.logger.info(thisMain, '[ 6.commDataInfo  ]  : ', thisMain._commDataInfo);
              thisMain.logger.info(thisMain, '[ 7.billItems  ]  : ', billItems);

              dataInit();
              thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);
              thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
                reqQuery: thisMain.reqQuery,
                svcInfo: thisMain._svcInfo,
                selectSvcMgmtNum: selectSvcMgmtNum,
                circuitChildInfo: thisMain._circuitChildInfo,
                usedAmountChildInfo: thisMain._usedAmountChildInfo,
                commDataInfo: thisMain._commDataInfo,
                billItems: billItems
              });

            }
          }
        );

      },
      error(error) {
        thisMain.logger.info(thisMain, '[ error ] : ', error.stack || error);
      },
      complete() {
        thisMain.logger.info(thisMain, '[ complete ] : ');
      },
    });

    // Observable.combineLatest(
    //   childrenLineReq,
    //   usedAmountChildReq
    // ).subscribe(
    //   {
    //     next( [
    //             childrenLineReq,
    //             usedAmountChildReq,
    //
    //           ] ) {
    //       thisMain.logger.info(thisMain, '[ 1. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
    //       thisMain.logger.info(thisMain, '[ 2. next > usedAmountChildReq ] 자녀회선 사용요금 조회 : ', usedAmountChildReq);
    //
    //       thisMain._circuitChildInfo = childrenLineReq.result;//자녀회선
    //       thisMain._usedAmountChildInfo = usedAmountChildReq.result;//자녀회선 사용요금 조회
    //       billItems = thisMain.arrayToObject(thisMain._usedAmountChildInfo.useAmtDetailInfo, thisMain.fieldInfo);
    //     },
    //     error(error) {
    //       thisMain.logger.info(thisMain, '[ error ] : ', error.stack || error);
    //     },
    //     complete() {
    //       thisMain.logger.info(thisMain, '[ complete ] : ');
    //       thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);
    //       thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
    //         reqQuery: thisMain.reqQuery,
    //         svcInfo: thisMain._svcInfo,
    //         circuitChildInfo: thisMain._circuitChildInfo,
    //         commDataInfo: thisMain._commDataInfo,
    //         billItems: billItems
    //       } );
    //
    //     } }
    // );

  } // render end

  // -------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public getSelStaDt(date: string): any { // 월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).format('YYYY.MM') + '.01';
  }

  public getSelClaimDtBtn(date: string): any { // 청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('YYYY년 MM월');
  }

  public getSelClaimDtNum(date: string): any { // 청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('M');
  }

  public getPhoneMask(obj: any): any { // 휴대폰 마스킹 처리
    return obj.map(item => {

      let phoneNum_0 = item.svcNum.substr(0, 3);
      let phoneNum_1 = item.svcNum.substr(3, 4);
      let phoneNum_2 = item.svcNum.substr(7, 4);

      phoneNum_0 = StringHelper.masking(phoneNum_0, '*', 0);
      phoneNum_1 = StringHelper.masking(phoneNum_1, '*', 2);
      phoneNum_2 = StringHelper.masking(phoneNum_2, '*', 2);

      return item.svcNum = phoneNum_0 + '-' + phoneNum_1 + '-' + phoneNum_2;

    });

  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }

  public arrayToObject(data: any, fieldInfo: any) {
    let amount;
    let noVAT;
    let is3rdParty;
    const group = {};
    const DEFAULT_DESC_VISIBILITY = true;
    const groupInfoFields = ['total', 'noVAT', 'is3rdParty', 'showDesc', 'discount'];

    // data.forEach(function (item) {
    for ( const item of data ) {
      noVAT = false;
      is3rdParty = false;
      const groupL = item[fieldInfo.lcl];
      let groupS = item[fieldInfo.scl];

      if ( !group[groupL] ) {
        group[groupL] = { total: 0, showDesc: DEFAULT_DESC_VISIBILITY };
        if ( groupL === '미납요금' ) {
          group[groupL].showDesc = false;
        }
      }

      if ( !group[groupL][groupS] ) {
        if ( groupS.indexOf('*') > -1 ) {
          groupS = groupS.replace(/\*/g, '');
          noVAT = true;
        } else if ( groupS.indexOf('#') > -1 ) {
          groupS = groupS.replace(/#/g, '');
          is3rdParty = true;
        }
        group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
      }

      amount = parseInt(item[fieldInfo.value].replace(/,/, ''), 10);
      group[groupL].total += amount;
      group[groupL][groupS].total += amount;

      const bill_item = {
        name: item[fieldInfo.name].replace(/[*#]/g, ''),
        amount: item[fieldInfo.value],
        noVAT: item[fieldInfo.name].indexOf('*') > -1 ? true : false,
        is3rdParty: item[fieldInfo.name].indexOf('#') > -1 ? true : false,
        discount: amount < 0 ? true : false
      };
      group[groupL][groupS].items.push({ ...bill_item });
      bill_item.amount = item[fieldInfo.value];
    }


    // 아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
    // $.each(group, function (key1, itemL) {
    Object.keys(group).forEach(key1 => {
      const itemL = group[key1];
      // $.each(itemL, function (key2, itemS) {
      Object.keys(itemL).forEach(key2 => {
        const itemS = itemL[key2];
        // if ( self.NO_BILL_FIELDS.indexOf(key2) < 0 ) {
        if ( groupInfoFields.indexOf(key2) < 0 ) {
          if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
            delete itemS.items[0];
          }
          itemS.discount = itemS.total < 0 ? true : false;
          itemS.total = itemS.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        itemL.discount = itemL.total < 0 ? true : false;
        itemL.total = itemL.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      });
    });
    console.log(group);
    return group;
  }

  // public arrayToObject(data: any, fieldInfo: any) {
  //   let amount = 0;
  //   var noVAT = false;
  //   var is3rdParty = false;
  //   var group = {};
  //   var DEFAULT_DESC_VISIBILITY = true;
  //   var groupInfoFields = this.NO_BILL_FIELDS;
  //
  //   // data.forEach(function (item) {
  //   for ( let item of data ) {
  //     noVAT = false;
  //     is3rdParty = false;
  //     var groupL = item[fieldInfo.lcl];
  //     var groupS = item[fieldInfo.scl];
  //
  //     if ( !group[groupL] ) {
  //       group[groupL] = { total: 0, showDesc: DEFAULT_DESC_VISIBILITY };
  //       if ( groupL === '미납요금' ) {
  //         group[groupL].showDesc = false;
  //       }
  //     }
  //
  //     if ( !group[groupL][groupS] ) {
  //       if ( groupS.indexOf('*') > -1 ) {
  //         groupS = groupS.replace(/\*/g, '');
  //         noVAT = true;
  //       } else if ( groupS.indexOf('#') > -1 ) {
  //         groupS = groupS.replace(/#/g, '');
  //         is3rdParty = true;
  //       }
  //       group[groupL][groupS] = { items: [], total: 0, noVAT: noVAT, is3rdParty: is3rdParty };
  //     }
  //
  //     amount = parseInt(item[fieldInfo.value].replace(/,/, ''));
  //     group[groupL].total += amount;
  //     group[groupL][groupS].total += amount;
  //
  //     var bill_item = {
  //       name: item[fieldInfo.name].replace(/[*#]/g, ''),
  //       amount: item[fieldInfo.value],
  //       noVAT: item[fieldInfo.name].indexOf('*') > -1 ? true : false,
  //       is3rdParty: item[fieldInfo.name].indexOf('#') > -1 ? true : false,
  //       discount: amount < 0 ? true : false
  //     };
  //     group[groupL][groupS].items.push({ ...bill_item });
  //     bill_item.amount = item[fieldInfo.value];
  //   }
  //   ;
  //
  //   //아이템 이름과 소분류가 같은 경우 2depth 보여주지 않음
  //   // $.each(group, function (key1, itemL) {
  //   Object.keys(group).forEach(key1 => {
  //     var itemL = group[key1];
  //     // $.each(itemL, function (key2, itemS) {
  //     Object.keys(itemL).forEach(key2 => {
  //       var itemS = itemL[key2];
  //       // if ( self.NO_BILL_FIELDS.indexOf(key2) < 0 ) {
  //       if ( groupInfoFields.indexOf(key2) < 0 ) {
  //         if ( itemS.items.length === 1 && itemS.items[0].name === key2 ) {
  //           delete itemS.items[0];
  //         }
  //         itemS.discount = itemS.total < 0 ? true : false;
  //         itemS.total = itemS.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  //       }
  //       itemL.discount = itemL.total < 0 ? true : false;
  //       itemL.total = itemL.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  //     });
  //   });
  //   console.log(group);
  //   return group;
  // }


}

export default MyTBillBillguideSubChildBill;

