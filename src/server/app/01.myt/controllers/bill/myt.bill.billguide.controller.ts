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

class MyTBillBillguide extends TwViewController {

  private _svcInfo:any = null;
  private _userInfo:any = {
    svcCtg:null,//카테고리
    svcCd:'C',//서비스 구분
    svcAttrCd:'M1',//서비스 속성
    svcViewName:SVC_ATTR.M1,//노출명칭
    repSvcYn:null, //대표회선 여부
    svcCnt:null //다회선수
  };
  private _bffDataObj:any = null;//bff통해 전달받은 데이터
  private _resData:any = null;//전달할 데이터

  constructor() {
    super();
  }

  //실행 : 데이터 가져오기
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;

    //mock 데이터 테스트
    Observable.of([myTUsageData, DataLimit]).subscribe((bffRestDataObj) => {
      this.logger.info(this, '[subscribe_mock_test]', bffRestDataObj);
      this._bffDataObj = bffRestDataObj;
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
    //_userInfo 설정 : api 완성됐을때 진행
    this.userInfoSetSvc();

    /*
    * 페이지 집입시 특정 조건에 따라 화면을 보여준다.
     */
    switch ( this._userInfo.svcAttrCd ) {
      case 'S1' :
      case 'S2' :
      case 'S3' :
        this.logger.info(this, '[_userInfo.svcAttrCd] sk브로드 밴드(인터넷/IPTV/집전화) : ', this._userInfo.svcAttrCd);
        this.renderView(res, 'bill/myt.bill.billguide.html', {
          userInfo: this._userInfo
        } );
        break;
      case 'O1' :
        this.logger.info(this, '[_userInfo.svcAttrCd] 기업솔루션(포인트캠) : ', this._userInfo.svcAttrCd);
        this.renderView(res, 'bill/myt.bill.billguide.html', {
          userInfo: this._userInfo
        } );
        break;
      case 'M2' :
        this.logger.info(this, '[_userInfo.svcAttrCd] PPS(선불폰) : ', this._userInfo.svcAttrCd);
        this.renderView(res, 'bill/myt.bill.billguide.html', {
          userInfo: this._userInfo
        } );
        break;
      default :
        if (this._userInfo.svcCnt === 0) {//개별 회선
          this.logger.info(this, '[_userInfo.svcCnt] 회선수 0 : ', this._userInfo.svcCnt);
          this.renderView(res, 'bill/myt.bill.billguide.html', {
            userInfo: this._userInfo
          } );
        }
        else if (this._userInfo.svcCnt > 0 && this._userInfo.repSvcYn === 'Y') {//통합회선 : 대표
          this.logger.info(this, '[_userInfo.svcCnt] 회선수 1 이상 | 통합회선 | 대표 : ', this._userInfo.svcCnt);
          this.renderView(res, 'bill/myt.bill.billguide.html', {
            userInfo: this._userInfo
          } );
        }
        else if (this._userInfo.svcCnt > 0 && this._userInfo.repSvcYn === 'N') {//통합회선 : 일반
          this.logger.info(this, '[_userInfo.svcCnt] 회선수 1 이상 | 통합회선 | 일반 : ', this._userInfo.svcCnt);
          this.renderView(res, 'bill/myt.bill.billguide.html', {
            userInfo: this._userInfo
          } );
        }
    }

  }
  //-------------------------------------------------------------[서비스]
  private userInfoSetSvc() {//_userInfo 설정
    this._userInfo.svcCtg = null;
    this._userInfo.svcCd = this._svcInfo.svcCd;
    this._userInfo.svcAttrCd = 'S2';//BFF_01_0005 완료되면 사용함. 현재 bff 작업중
    this._userInfo.repSvcYn = this._svcInfo.repSvcYn;
    this._userInfo.svcCnt = this._svcInfo.svcCnt;
  }
  //통합청구(대표)
  private combineRepresentCircuit() {

  }
  //통합청구(일반)
  private combineCommonCircuit() {

  }
  //개별청구
  private individualCircuit() {

  }
  //PPS(선불폰)
  private prepaidCircuit() {

  }
  //기업솔루션(포인트캠)
  private companyCircuit() {

  }
  //sk브로드밴드(인터넷/IPTV/집전화)
  private skbroadbandCircuit() {

  }


  //-------------------------------------------------------------[BFF 요청 모음]
  private getApiList(): any {
    return this.apiService.request(API_CMD.BFF_03_0004, {} );
  }

  //-------------------------------------------------------------[필터: 해당 데이터 필터링]


  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    // res.render(view, {
    //   userInfo: this._userInfo,
    // });
    res.render(view, data);
  }




}

export default MyTBillBillguide;
