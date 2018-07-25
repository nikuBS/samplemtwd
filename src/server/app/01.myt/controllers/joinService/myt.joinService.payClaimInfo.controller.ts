/**
 * FileName: myt.joinService.payClaimInfo.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 * info: 페이지 진입
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';


class MytJoinServicePayClaimInfo extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;//쿼리스트링
  private _svcInfo: any;

  //공통데이터
  private _commDataInfo: any = {};

  private _typeChk:any = null;

  private _redirectUrlInfo: any = {
    A1: '/myt/joinService/payClaimInfo/phone',
    A2: '/myt/joinService/payClaimInfo/tpocketfi',
    A3: '/myt/joinService/payClaimInfo/tlogin',
    A4: '/myt/joinService/payClaimInfo/twibro',
    B1: '/myt/joinService/payClaimInfo/iptv',
    B2: '/myt/joinService/payClaimInfo/iptvSk',
    C1: '/myt/joinService/payClaimInfo/pointcam'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] 사용자 정보 : ', svcInfo);
    this.reqQuery = req.query;
    this._typeChkFun();
    this._goRedirect(res);

  }//render end

  private _typeChkFun() {
    /*
    * A1.휴대폰
    * A2.포켓파이
    * A3.로그인
    * A4.와이브로
    * B1.인터넷/IPTV/집전화
    * B2.인터넷/IPTV/집전화 - SK브로드밴드 가입자
    * C1.보안 솔루션
     */
    switch ( this._svcInfo.svcAttrCd ) {
      case 'M1' :
        this.logger.info(this, '[ 휴대폰 ] : ', this._svcInfo.svcAttrCd);
        this._typeChk = 'A1';
        break;
      case 'M3' :
        this.logger.info(this, '[ T포켓파이 ] : ', this._svcInfo.svcAttrCd);
        this._typeChk = 'A2';
        break;
      case 'M4' :
        this.logger.info(this, '[ T로그인 ] : ', this._svcInfo.svcAttrCd);
        this._typeChk = 'A3';
        break;
      case 'M5' :
        this.logger.info(this, '[ T와이브로 ] : ', this._svcInfo.svcAttrCd);
        this._typeChk = 'A4';
        break;
      case 'S1' :
      case 'S2' :
      case 'S3' :
        if (false) {
          this.logger.info(this, '[ 인터넷 / IPTV / 집전화 ] : ', this._svcInfo.svcAttrCd);
          this._typeChk = 'B1';
        } else {
          this.logger.info(this, '[ 인터넷 / IPTV / 집전화 ] SK브로드밴드 가입자 : ', this._svcInfo.svcAttrCd);
          this._typeChk = 'B2';
        }
        break;
      case 'O1' :
        this.logger.info(this, '[ 보안솔루션 ] : ', this._svcInfo.svcAttrCd);
        this._typeChk = 'C1';
        break;
    }
  }

  private _goRedirect(res) {
    let tempVar;
    switch ( this._typeChk ) {
      case 'A1' :
        tempVar = this._redirectUrlInfo.A1;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
      case 'A2' :
        tempVar = this._redirectUrlInfo.A2;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
      case 'A3' :
        tempVar = this._redirectUrlInfo.A3;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
      case 'A4' :
        tempVar = this._redirectUrlInfo.A4;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
      case 'B1' :
        tempVar = this._redirectUrlInfo.B1;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
      case 'B2' :
        tempVar = this._redirectUrlInfo.B2;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
      case 'O1' :
        tempVar = this._redirectUrlInfo.O1;
        this.logger.info(this, '[ _redirectUrlInfo ] : ', tempVar);
        res.redirect( tempVar );
        break;
    }

  }



}

export default MytJoinServicePayClaimInfo;

