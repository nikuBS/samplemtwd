/**
 * @file myt-fare.bill.pay-complete.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.11.27
 * Description: 요금납부 및 선결제 완료 화면
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_COMPLETE_MSG} from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';

class MyTFareBillPayComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    res.render('bill/myt-fare.bill.pay-complete.html', Object.assign(this._getData(queryObject), { pageInfo }));
  }

  private _getData(queryObject: any): any {
    let data = {
      mainTitle: MYT_FARE_COMPLETE_MSG.PAYMENT, // 메인 타이틀
      subTitle: '',
      description: '',
      centerName: MYT_FARE_COMPLETE_MSG.HISTORY, // 중간 링크 버튼이 있을 경우 버튼명
      centerUrl: '/myt-fare/info/history', // 중간 링크 클릭 시 이동할 대상
      confirmUrl: '/myt-fare/submain' // 하단 확인 버튼 클릭 시 이동할 대상
    };

    if (queryObject !== null) {
      const type = queryObject['type']; // 완료페이지에 쿼리스트링으로 추가된 정보
      if (type === 'sms') { // SMS 전송 완료일 경우
        data = this._getSmsData(queryObject, data); // 화면에 추가로 입력할 정보
      } else if (type === 'small' || type === 'contents') { // 소액결제 및 콘텐츠이용료 선결제일 경우
        const subType = queryObject['sub'];
        if (FormatHelper.isEmpty(subType)) {
          data = this._getPrepayData(data, type); // 선결제
        } else {
          data = this._getAutoPrepayData(data, type, subType); // 자동선결제
        }
      }
    }
    return data;
  }

  /* SMS 전송완료 화면일 경우 추가 정보 */
  private _getSmsData(queryObject: any, data: any): any {
    const svcNum = queryObject['svcNum']; // 전송된 휴대폰 번호
    data.mainTitle = MYT_FARE_COMPLETE_MSG.SMS;
    data.subTitle = FormatHelper.isEmpty(svcNum) ? '' : svcNum + ' ' + MYT_FARE_COMPLETE_MSG.NUMBER;
    data.description = MYT_FARE_COMPLETE_MSG.SMS_DESCRIPTION;
    data.centerName = '';

    return data;
  }

  private _getPrepayData(data: any, type: any): any {
    data.mainTitle = MYT_FARE_COMPLETE_MSG.PREPAY;
    data.centerName = MYT_FARE_COMPLETE_MSG.PREPAY_HISTORY; // 요금납부내역 조회
    if (type === 'small') {
      data.centerUrl += '?sortType=micro-prepay'; // 소액결제일 경우 소액결제내역 조회
    } else {
      data.centerUrl += '?sortType=content-prepay'; // 콘텐츠이용료일 경우 콘텐츠이용료 내역 조회
    }
    data.confirmUrl = '/myt-fare/bill/' + type; // 확인 버튼 클릭 시 소액결제 또는 콘텐츠이용료 메인화면으로 이동

    return data;
  }

  private _getAutoPrepayData(data: any, type: any, subType: any): any {
    if (subType === 'auto') {
      data.mainTitle = MYT_FARE_COMPLETE_MSG.REGISTER; // 자동선결제
      data.centerName = '';
    } else {
      if (subType === 'cancel') {
        data.mainTitle = MYT_FARE_COMPLETE_MSG.CANCEL; // 자동선결제 해지
        data.centerName = MYT_FARE_COMPLETE_MSG.CANCEL_HISTORY; // 해지내역 조회
      } else {
        data.mainTitle = MYT_FARE_COMPLETE_MSG.CHANGE; // 자동선결제 변경
        data.centerName = MYT_FARE_COMPLETE_MSG.CHANGE_HISTORY; // 변경내역 조회
      }
      data.centerUrl = '/myt-fare/bill/' + type + '/auto/info'; // 자동선결제 신청 및 변경 내역 조회
    }
    data.confirmUrl = '/myt-fare/bill/' + type; // 확인 버튼 클릭 시 소액결제 또는 콘텐츠이용료 메인화면으로 이동

    return data;
  }
}

export default MyTFareBillPayComplete;
