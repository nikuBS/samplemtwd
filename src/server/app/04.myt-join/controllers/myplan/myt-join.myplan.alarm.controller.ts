/**
 * MyT > 나의 가입정보 > 나의 요금제 > 요금제 변경 가능일 알림 서비스
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-09-19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

/**
 * @class
 */
class MyTJoinMyplanAlarm extends TwViewController {
  constructor() {
    super();
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
    const renderCommonInfo = {
      title: '요금제 변경 가능일 알람',
      pageInfo: pageInfo,
      svcInfo: svcInfo
    };

    // 휴대폰, 선불폰 아닐때 오류 처리
    if (['M1', 'M2'].indexOf(svcInfo.svcAttrCd) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_05_0125, {}, {})
      .subscribe((alarmInfo) => {
        // API 오류
        if (alarmInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: alarmInfo.code,
            msg: alarmInfo.msg
          }));
        }

        // 렌더링
        res.render('myplan/myt-join.myplan.alarm.html', Object.assign(renderCommonInfo, {
          alarmInfo: alarmInfo.result
        }));
      });
  }
}

export default MyTJoinMyplanAlarm;
