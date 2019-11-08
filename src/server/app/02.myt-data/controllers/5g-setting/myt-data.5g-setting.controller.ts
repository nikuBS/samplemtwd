/**
 * 5g 시간설정
 * @author 양정규
 * @since 2019-09-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { delay } from 'rxjs/operators';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD } from '../../../../types/api-command.type';
import moment = require('moment');

/**
 * @class
 */
class MyTData5gSetting extends TwViewController {
  constructor() {
    super();
  }

  private _renderCommonInfo: any;
  private _reqCnt: number = 0;

  private get renderCommonInfo() {
    return this._renderCommonInfo;
  }

  private set renderCommonInfo(_renderCommonInfo) {
    this._renderCommonInfo = _renderCommonInfo;
  }

  private get reqCnt() {
    return this._reqCnt;
  }

  private set reqCnt(_reqCnt) {
    this._reqCnt = _reqCnt;
  }

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.renderCommonInfo = {
      pageInfo,
      svcInfo,
      remainTime: req.query.remainTime,
      pageType: 'UN_USE' // default 미이용
    };
    // 사용시간 조회 -> 시간권정보 및 이용내역 조회 -> 부가서비스 조회 순서대로 처리
    // 5G 관련 API 요청시 딜레이가 발생함 (swing legacy 에서 응답이 늦음)
    this.request5GInfomation(res);
  }

  /**
   * 시간권정보 및 부가서비스 조회
   * @param res
   */
  private request5GInfomation(res: Response): void {
    // 시간권 정보 조회 시 차이가 발생하여 delay 처리
    Observable.combineLatest(
      this.getConversionsInfo(),  // 시간권 사용중 정보
      this.getMuliAddition()
    ).subscribe(([conversionsInfo, multiAddition]) => {
      const apiError = this.error.apiError([conversionsInfo, multiAddition]);
      // 에러 인 경우
      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.error.render(res, Object.assign(this.renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }
      this.parseData(conversionsInfo, multiAddition);
      return res.render('5g-setting/myt-data.5g-setting.main.html', { renderCommonInfo: this.renderCommonInfo }); // 기본 시간설정
    });
  }

  /**
   * 수신한 데이터 파싱
   * @param conversionsInfo
   * @param multiAddition
   */
  private parseData(conversionsInfo: any, multiAddition: any): void {
    this.renderCommonInfo.conversionsInfo = conversionsInfo = conversionsInfo.result[0];
    // 사용시간 여부
    // this.renderCommonInfo.isRemained = (+availableData.result.dataRemQty > 0);
    // this.renderCommonInfo.remainTime = +availableData.result.dataRemQty;
    // 이용중인 경우
    if ( conversionsInfo.currUseYn === 'Y' && +conversionsInfo.remTime > 0 ) {
      this.renderCommonInfo.pageType = 'IN_USE';
      // 종료예정시각 설정
      const time = moment(conversionsInfo.convEndDtm, 'YYYYMMDDhhmmss').format('LT').split(' '); // 종료시간 (format: 오후 1:10)
      this.renderCommonInfo.duedate = {
        amPm: time[0],  // 오전/오후
        hour: time[1].split(':')[0],
        min: time[1].split(':')[1]
      };
    } else { // 미 이용중
      // 이용시간 전부 소진
      // if (+data.param.remainTime < 1) {
      //   this.renderCommonInfo.pageType = 'END';
      // }
      // 부스트 파크 사용자일때
      if ( this.isBoostPark(multiAddition) ) {
        this.renderCommonInfo.pageType = 'BOOST_PARK';
      }
    }
    // --> 페이지 설정 끝
  }

  /**
   * @desc 부가서비스 이용 조회
   */
  private getMuliAddition(): Observable<any> {
    const prodIds: Array<string> = [];
    for ( let i = 1; i < 7; i++ ) {
      prodIds.push('NA0000673' + i);
    }
    return this.apiService.request(API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')]);
  }

  /**
   * @desc 시간권 이용중 정보 조회
   */
  private getConversionsInfo(): Observable<any> {
    // 기존 query로 데이터 전달 받는 부분 제거
    // if (this.renderCommonInfo.param.conversionsInfo) {
    //   return Observable.of(JSON.parse(this.renderCommonInfo.param.conversionsInfo));
    // }
    // swing legacy 와 BE 응답에 딜레이가 있어 delay 추가
    return this.apiService.request(API_CMD.BFF_06_0078, {}).pipe(delay(500));
  }

  /**
   * @desc 장소권(부스트 파크) 인지 여부
   * @param resp
   */
  private isBoostPark(resp: any): any {
    // 입력한 상품코드 전체가 미사용일경우
    if ( resp.code === 'ICAS4003' ) {
      return false;
    }
    const boostParkProdIds = ['NA00006734', 'NA00006735', 'NA00006736'];  // 부스트파크(장소권)
    let res = false;
    for ( const key in resp.result ) {
      if ( resp.result[key] !== 'N' && boostParkProdIds.indexOf(key) !== -1 ) {
        res = true;
        break;
      }
    }
    return res;
  }
}


export default MyTData5gSetting;
