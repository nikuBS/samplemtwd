/**
 * 5g 시간설정
 * @author 양정규
 * @since 2019-09-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD} from '../../../../types/api-command.type';
import moment = require('moment');

/**
 * @class
 */
class MyTData5gSetting extends TwViewController {
  constructor() {
    super();
  }

  // @TODO api mockdata 확인 후 삭제
  private readonly mock78 = {
    code: '00',
    'msg': 'success',
    'result': [
      {
        'currUseYn': 'N', // 현재 이용중 여부
        'convRgstDtm': '20190301100100', // 등록일시
        'convStaDtm': '20190916152409', // 시작일시
        'convEndDtm': '20190919153409', // 종료일시
        'cnvtdTime': '60',
        'remTime': '60' // 요청 시간중 남은시간 (분단위)
      }
    ]
  };

  private _renderCommonInfo: any;
  private get renderCommonInfo() {
    return this._renderCommonInfo;
  }
  private set renderCommonInfo(_renderCommonInfo) {
    this._renderCommonInfo = _renderCommonInfo;
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
      param : req.query
    };
    const renderCommonInfo = this.renderCommonInfo;

    Observable.combineLatest(
      this.getConversionsInfo(),  // 시간권 사용중 정보
      this.getMuliAddition()
    ).subscribe(([conversionsInfo, multiAddition]) => {
      // @TODO api 확인 후 삭제
      // conversionsInfo = this.mock78;

      const apiError = this.error.apiError([conversionsInfo, multiAddition]);
      // 에러 인 경우
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      // todo : result 값 없을때 고려하기..
      this.parseData(renderCommonInfo, conversionsInfo, multiAddition);
      return res.render('5g-setting/myt-data.5g-setting.main.html', renderCommonInfo); // 기본 시간설정
    });
  }

  /**
   * @param data
   * @param resp
   * @desc 수신한 데이터 파싱
   */
  private parseData(data: any, conversionsInfo: any, multiAddition: any): void {
    data.conversionsInfo = conversionsInfo = conversionsInfo.result[0];

    let pageType = 'NO_USE';  // default 미이용

    // 이용중인 경우
    if (conversionsInfo.currUseYn === 'Y' && +conversionsInfo.remTime > 0) {
      pageType = 'IN_USE';
      // 종료예정시각 설정
      const time = moment(conversionsInfo.convEndDtm, 'YYYYMMDDhhmmss').format('LT').split(' '); // 종료시간 (format: 오후 1:10)
      data.duedate = {
        amPm: time[0],  // 오전/오후
        hour: time[1].split(':')[0],
        min: time[1].split(':')[1]
      };

      // 사용 가능시간 포맷팅
      data.remainTime = FormatHelper.convVoiceFormat(data.param.remainTime) || {
        hours: 0,
        min: 0
      };
    } else { // 미 이용중
      // 이용시간 전부 소진
      if (+data.param.remainTime < 1) {
        pageType = 'END';
      }
      // 부스트 파크 사용자일때
      if (this.isBoostPark(multiAddition)) {
        pageType = 'BOOST_PARK';
      }
    }
    data.pageType = pageType;
    // --> 페이지 설정 끝

  }

  /**
   * @desc 부가서비스 이용 조회
   */
  private getMuliAddition(): Observable<any> {
    const prodIds: Array<string> = [];
    for (let i = 1; i < 7; i++) {
      prodIds.push('NA0000673' + i);
    }
    return this.apiService.request(API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')]);

    // Mock 데이타
    /*return Observable.of({
      code: '00',
      result: {
        NA00006734: 'N'
        // NA00006734: '20190919'
      }
    });*/
  }

  /**
   * @desc 시간권 이용중 정보 조회
   */
  private getConversionsInfo(): Observable<any> {
    if (this.renderCommonInfo.param.conversionsInfo) {
      return Observable.of(JSON.parse(this.renderCommonInfo.param.conversionsInfo));
    }

    return this.apiService.request(API_CMD.BFF_06_0078, {});
  }

  /**
   * @desc 장소권(부스트 파크) 인지 여부
   * @param resp
   */
  private isBoostPark(resp: any): any {
    // 입력한 상품코드 전체가 미사용일경우
    if (resp.code === 'ICAS4003') {
      return false;
    }
    const boostParkProdIds = ['NA00006734', 'NA00006735', 'NA00006736'];  // 부스트파크(장소권)
    let res = false;
    for (const key in resp.result) {
      if (resp.result[key] !== 'N' && boostParkProdIds.indexOf(key) !== -1) {
        res = true;
        break;
      }
    }
    return res;
  }
}

export default MyTData5gSetting;
