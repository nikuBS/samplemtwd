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

class MyTBillBillguideSubChildBill extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery:any;//쿼리스트링
  private _svcInfo:any;
  private _circuitChildInfo: any = []; //자녀회선조회 BFF_05_00024

  //공통데이터
  private _commDataInfo:any = {
    invDt : null,
    selNum : null
  };

  //노출조건
  private _showConditionInfo:any = {};

  private _urlTplInfo:any = {
    pageRenderView:  'bill/myt.bill.billguide.subChildBill.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.reqQuery = req.query;

    ( this.reqQuery.invDt ) ? this._commDataInfo.invDt = this.reqQuery.invDt : this._commDataInfo.invDt = null;
    ( this.reqQuery.selNum ) ? this._commDataInfo.selNum = this.reqQuery.selNum : this._commDataInfo.selNum = 0;

    const childrenLineReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {});//자녀회선

    var thisMain = this;

    Observable.combineLatest(
      childrenLineReq,
    ).subscribe(
      {
        next( [
                childrenLineReq,
              ] ) {
          thisMain.logger.info(this, '[ 1. next > childrenLineReq ] 자녀회선 : ', childrenLineReq);
          thisMain._circuitChildInfo = childrenLineReq.result;//자녀회선
        },
        error(error) {
          thisMain.logger.info(this, '[ error ] : ', error.stack || error);
        },
        complete() {
          thisMain.logger.info(this, '[ complete ] : ');
          thisMain.getCircuitChildInfoMask( thisMain._circuitChildInfo );
          thisMain.controllerInit(res);
        } }
    );

  }//render end

  private controllerInit(res) {
    this.pageRenderView(res);
  }
  //-------------------------------------------------------------[서비스 필터: 해당 데이터 필터링]
  public getSelStaDt(date: string):any {//월 시작일 구하기
    return this._commDataInfo.selStaDt = moment(date).format('YYYY.MM') + '.01';
  }
  public getSelClaimDtBtn(date: string):any {//청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('YYYY년 MM월');
  }
  public getSelClaimDtNum(date: string):any {//청구 년월 구하기
    return this._commDataInfo.selClaimDt = moment(date).add(1, 'days').format('M');
  }

  public getCircuitChildInfoMask(obj: any):any { //휴대폰 마스킹 처리
    this._commDataInfo.subChildBillInfo = obj.map( item => {

      let phoneNum_0 = item.svcNum.substr(0, 3) ;
      let phoneNum_1 = item.svcNum.substr(3, 4) ;
      let phoneNum_2 = item.svcNum.substr(7, 4) ;

      phoneNum_0 = StringHelper.masking(phoneNum_0, '*', 0);
      phoneNum_1 = StringHelper.masking(phoneNum_1, '*', 2);
      phoneNum_2 = StringHelper.masking(phoneNum_2, '*', 2);

      return item.svcNum = phoneNum_0 + '-' + phoneNum_1 + '-' + phoneNum_2;

    });

  }

  //-------------------------------------------------------------[서비스]
  private pageRenderView(res) {
    this.logger.info(this, '[_urlTplInfo.pageRenderView] : ', this._urlTplInfo.pageRenderView);
    this.renderView(res, this._urlTplInfo.pageRenderView, {
      svcInfo: this._svcInfo,
      circuitChildInfo: this._circuitChildInfo,
      commDataInfo:this._commDataInfo
    } );
  }

  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }


}

export default MyTBillBillguideSubChildBill;

