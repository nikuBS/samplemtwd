/**
 * @file myt-fare.bill.point-complete.controller.ts
 * @author Jayoon Kong
 * @since 2018.11.28
 * @desc 포인트 요금납부 완료 page
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_COMPLETE_MSG, MYT_FARE_POINT_MSG} from '../../../../types/string.type';
import {RAINBOW_FARE} from '../../../../types/bff.type';
import ParamsHelper from '../../../../utils/params.helper';

/**
 * @class
 * @desc 포인트 요금납부 완료
 */
class MyTFareBillPointComplete extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    const title = !!queryObject && queryObject['title'];
    const type = !!queryObject && queryObject['type'];
    const point = !!queryObject && queryObject['point'];
    const add = !!queryObject && queryObject['add'];

    res.render('bill/myt-fare.bill.point-complete.html', {
      mainTitle: this._getTitle(title, type), // 메인타이틀 조회
      subTitle: this._getSubTitle(title, type), // 서브타이틀 (포인트 종류)
      description: this._getDescription(title, type, add),
      point: this._getPoint(point), // 납부된 포인트
      isRight: title === 'rainbow' && type === '',
      centerName: MYT_FARE_COMPLETE_MSG.HISTORY, // 포인트 요금납부 내역 조회
      centerUrl: '/myt-fare/info/history', // 포인트 요금납부 내역 조회 화면으로 이동
      confirmUrl: '/myt-fare/submain', // 확인 버튼 클릭 시 서브메인으로 이동
      pageInfo
    });
  }

  /**
   * @function
   * @desc 포인트 종류 (제목) 조회
   * @param {string} title
   * @param {string} type
   * @returns {string}
   * @private
   */
  private _getTitle(title: string, type: string): string {
    let mainTitle = '';

    if (title === 'CPT') {
      mainTitle = MYT_FARE_POINT_MSG.CASHBAG; // CPT인 경우 OK cashbag
    } else if (title === 'TPT') {
      mainTitle = MYT_FARE_POINT_MSG.TPOINT; // TPT인 경우 T포인트
    } else {
      mainTitle = MYT_FARE_POINT_MSG.RAINBOW; // 레인보우포인트
    }

    mainTitle += '<br />';

    if (type === 'auto') {
      mainTitle += MYT_FARE_POINT_MSG.AUTO; // 자동납부
    } else if (type === 'change') {
      mainTitle += MYT_FARE_POINT_MSG.CHANGE; // 변경
    } else if (type === 'cancel') {
      mainTitle += MYT_FARE_POINT_MSG.CANCEL; // 해지
    } else {
      mainTitle += MYT_FARE_POINT_MSG.RESERVATION; // 예약
    }
    return mainTitle;
  }

  /**
   * @function
   * @desc get sub title
   * @param {string} title
   * @param {string} type
   * @returns {string}
   * @private
   */
  private _getSubTitle(title: string, type: string): string {
    let subTitle = '';

    if (FormatHelper.isEmpty(type)) {
      subTitle = MYT_FARE_POINT_MSG.RESERVATION_POINT;
    } else {
      if (title !== 'rainbow' && type !== 'cancel') {
        subTitle = MYT_FARE_POINT_MSG.REGISTER_POINT;
      }
    }
    return subTitle;
  }

  /**
   * @function
   * @desc get description
   * @param {string} title
   * @param {string} type
   * @param {string} add
   * @returns {string}
   * @private
   */
  private _getDescription(title: string, type: string, add: string): string {
    let description = '';
    if (!FormatHelper.isEmpty(add)) {
      description = RAINBOW_FARE[add]; // 레인보우포인트인 경우 납부예약한 대상자 표시
    }

    if (title === 'rainbow' && type === 'auto') {
      description += '<br />' + MYT_FARE_POINT_MSG.RAINBOW_MSG;
    }
    return description;
  }

  /**
   * @function
   * @desc get point
   * @param {string} point
   * @returns {string}
   * @private
   */
  private _getPoint(point: string): string {
    let pointTxt = '';
    if (!FormatHelper.isEmpty(point)) {
      pointTxt = FormatHelper.addComma(point) + 'P';
    }
    return pointTxt;
  }

}

export default MyTFareBillPointComplete;
