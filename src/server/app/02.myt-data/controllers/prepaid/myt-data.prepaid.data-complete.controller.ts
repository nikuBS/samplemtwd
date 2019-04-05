/**
 * FileName: myt-data.prepaid.data-complete.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.28
 * Description: 선불폰 데이터 충전 완료 페이지
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {DATA_UNIT, MYT_DATA_COMPLETE_MSG} from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';
import {RECHARGE_DATA_CODE} from '../../../../types/bff.type';

class MyTDataPrepaidDataComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    res.render('prepaid/myt-data.prepaid.data-complete.html', Object.assign(this._getData(queryObject), { pageInfo }));
  }

  private _getData(queryObject: any): any {
    const type = queryObject.type;
    return {
      type: type,
      mainTitle: this._getMainTitle(type), // 메인 타이틀
      description: MYT_DATA_COMPLETE_MSG.DESCRIPTION, // description
      data: this._getDataInfo(queryObject, type), // 1회충전/자동충전 여부
      centerName: MYT_DATA_COMPLETE_MSG.HISTORY, // 중간 링크 내역조회
      centerUrl: '/myt-data/recharge/prepaid/history', // 내역조회 화면으로 이동
      confirmUrl: '/myt-data/submain' // 하단 확인 클릭 시 서브메인으로 이동
    };
  }

  private _getMainTitle(type: string): string {
    let mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE; // 1회 충전
    if (type === 'auto') {
      mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE_AUTO; // 자동 충전 신청
    } else if (type === 'change') {
      mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE_CHANGE; // 자동 충전 변경
    } else if (type === 'cancel') {
      mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE_CANCEL; // 자동 충전 해지
    }
    return mainTitle;
  }

  private _getDataInfo(queryObject: any, type: string): string {
    let data = queryObject.data;
    if (data !== undefined) {
      if (type === undefined) {
        data = data + DATA_UNIT.GB; // 데이터를 GB로 표시
      } else {
        data = RECHARGE_DATA_CODE[data];
      }
    }
    return data;
  }
}

export default MyTDataPrepaidDataComplete;
