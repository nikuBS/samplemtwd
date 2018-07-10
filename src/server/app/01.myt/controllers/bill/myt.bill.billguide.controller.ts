/**
 * FileName: myt.bill.feeguide.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import { LINE_NAME, SVC_ATTR } from '../../../../types/bff-common.type';
import myTUsageData from '../../../../mock/server/myt.usage';
import DataLimit from '../../../../mock/server/myt.data-limit';
import billguide_BFF_01_0005 from '../../../../mock/server/myt.bill.billguide.BFF_01_0005';
import billguide_BFF_01_00036 from '../../../../mock/server/myt.bill.billguide.BFF_01_00036';

class MyTBillBillguide extends TwViewController {

  private _svcInfo:any = {
    custNm: '',//고객명
    svcCd: '',//서비스구분코드
    svcNum: '',//서비스번
    svcNickNm: '',//회선닉네임
    repSvcYn: '',//대표회선여부
    svcCnt: '',//다회선수
  };
  //회선정보조회
  private _circuitInfo:any = {
    svcMgmtNum:'',//서비스관리번호
    svcGr:'',//서비스등급
    svcAttrCd:'M1',//서비스 속성
    repSvcYn:'',//기준회선여부
    svcNum:'',//서비스번호(마스킹)
    nickNm:'',//닉네임
    addr:''//주소
  };
  //청구요금조회
  private _billpayInfo: any = {};
  private _urlTplInfo:any = {
    combineRepresentPage:  'bill/myt.bill.billguide.combineRepresentPage.html',//통합청구(대표)
    combineCommonPage:     'bill/myt.bill.billguide.combineCommonPage.html',//통합청구(일반)
    individualPage:        'bill/myt.bill.billguide.individualPage.html',//개별청구
    prepaidPage:           'bill/myt.bill.billguide.prepaidPage.html',//PPS(선불폰)
    companyPage:           'bill/myt.bill.billguide.companyPage.html',//기업솔루션(포인트캠)
    skbroadbandPage:       'bill/myt.bill.billguide.skbroadbandPage.html'//sk브로드밴드(인터넷/IPTV/집전화)
  };

  private _resData:any = null;//전달할 데이터

  constructor() {
    super();
  }

  //실행 : 데이터 가져오기
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;

    //mock 데이터 테스트
    Observable.of([billguide_BFF_01_0005, billguide_BFF_01_00036]).subscribe((bffRestDataObj) => {
      this.logger.info(this, '[subscribe_mock_test]', bffRestDataObj);
      this._circuitInfo = bffRestDataObj[0].result;
      this._billpayInfo = bffRestDataObj[1].result;
      this.controllerInit(res);
    });

    //BFF 데이터 사용시
    // Observable.combineLatest(
    //    this.getApiList()
    // ).subscribe((bffRestDataObj) => {
    //    this._bffDataObj = bffRestDataObj;
    //    this.controllerInit(res);
    // });
  }

  //컨트롤러 초기화 : 가져온 데이터를 활용해서 개발진행
  private controllerInit(res) {

    /*
    * 페이지 집입시 특정 조건에 따라 화면을 보여준다.
     */
    this.logger.info(this, '[_circuitInfo.svcAttrCd] : ', this._circuitInfo.svcAttrCd);
    this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] : ', this._billpayInfo.paidAmtMonthSvcCnt);
    this.logger.info(this, '[_billpayInfo.repSvcYn] : ', this._billpayInfo.repSvcYn);
    switch ( this._circuitInfo.svcAttrCd ) {
      case 'S1' :
      case 'S2' :
      case 'S3' :
        this.logger.info(this, '[_circuitInfo.svcAttrCd] sk브로드 밴드(인터넷/IPTV/집전화) : ', this._circuitInfo.svcAttrCd);
        this.skbroadbandCircuit(res);
        break;
      case 'O1' :
        this.logger.info(this, '[_circuitInfo.svcAttrCd] 기업솔루션(포인트캠) : ', this._circuitInfo.svcAttrCd);
        this.companyCircuit(res);
        break;
      case 'M2' :
        this.logger.info(this, '[_circuitInfo.svcAttrCd] PPS(선불폰) : ', this._circuitInfo.svcAttrCd);
        this.prepaidCircuit(res);
        break;
      default :

        if( this._billpayInfo.paidAmtMonthSvcCnt === 1 ) {
          this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 개별청구 : ', this._billpayInfo.paidAmtMonthSvcCnt);
          this.individualCircuit(res);
        }
        else if( this._billpayInfo.paidAmtMonthSvcCnt > 1 ) {
          this.logger.info(this, '[_billpayInfo.paidAmtMonthSvcCnt] 통합청구 : ', this._billpayInfo.paidAmtMonthSvcCnt);

          if( this._billpayInfo.repSvcYn === 'Y' ) {
            this.logger.info(this, '[_billpayInfo.repSvcYn] 통합청구 | 대표 : ', this._billpayInfo.repSvcYn);
            this.combineRepresentCircuit(res);
          }
          else if( this._billpayInfo.repSvcYn === 'N' ) {
            this.logger.info(this, '[_billpayInfo.repSvcYn] 통합청구 | 대표아님 : ', this._billpayInfo.repSvcYn);
            this.combineCommonCircuit(res);
          }
        }
    }

  }
  //-------------------------------------------------------------[서비스]
  //통합청구(대표)
  private combineRepresentCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.combineRepresentPage] : ', this._urlTplInfo.combineRepresentPage);
    this.renderView(res, this._urlTplInfo.combineRepresentPage, {
      userInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo
    } );
  }
  //통합청구(일반)
  private combineCommonCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.combineCommonPage] : ', this._urlTplInfo.combineCommonPage);
    this.renderView(res, this._urlTplInfo.combineCommonPage, {
      userInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo
    } );
  }
  //개별청구
  private individualCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.individualPage] : ', this._urlTplInfo.individualPage);
    this.renderView(res, this._urlTplInfo.individualPage, {
      userInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo
    } );
  }
  //PPS(선불폰)
  private prepaidCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.prepaidPage] : ', this._urlTplInfo.prepaidPage);
    this.renderView(res, this._urlTplInfo.prepaidPage, {
      userInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo
    } );
  }
  //기업솔루션(포인트캠)
  private companyCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.companyPage] : ', this._urlTplInfo.companyPage);
    this.renderView(res, this._urlTplInfo.companyPage, {
      userInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo
    } );
  }
  //sk브로드밴드(인터넷/IPTV/집전화)
  private skbroadbandCircuit(res) {
    this.logger.info(this, '[_urlTplInfo.skbroadbandPage] : ', this._urlTplInfo.skbroadbandPage);
    this.renderView(res, this._urlTplInfo.skbroadbandPage, {
      userInfo: this._circuitInfo,
      billpayInfo : this._billpayInfo
    } );
  }

  //-------------------------------------------------------------[BFF 요청 모음]
  private getApiList(): any {
    return this.apiService.request(API_CMD.BFF_03_0004, {} );
  }

  //-------------------------------------------------------------[필터: 해당 데이터 필터링]


  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }




}

export default MyTBillBillguide;
