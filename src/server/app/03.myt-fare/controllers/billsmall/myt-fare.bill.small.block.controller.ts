/**
 * @file [소액결제-차단내역-리스트]
 * @author Lee kirim
 * @since 2018-12-02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { MYT_FARE_HISTORY_MICRO_BLOCK_TYPE } from '../../../../types/bff.type';

/**
 * @interface
 * @desc 팁정보 형태 정의
 */
interface TipInfo {
  [key: string]: string;
}

/**
 * @interface
 * @desc API 결과값 형태 정의
 */
interface Result {
  [key: string]: string;
}

/**
 * 소액결제 월별내역 구현
 */
class MyTFareBillSmallHistoryDetail extends TwViewController {
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0093, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
      const data: Result | any = resp.result;

      // 사용처 / 결제대행업체 / 신청일
      if (data.cpHistories && data.cpHistories.length) {
        data.cpHistories.map((o, index) => {
          const plainTime = o.useDt.replace(/-/gi, '').replace(/:/gi, '').replace(/ /gi, ''); // YYYY-MM-DD hh:mm--> YYYYMMDDhhmm
          const plainApply = o.applyMonth.replace(/-/gi, ''); // YYYY-MM-DD hh:mm--> YYYYMMDDhhmm
          o.listId = index;
          o.FullDate = DateHelper.getShortDate(plainTime);
          o.applyDate = DateHelper.getShortDate(plainApply);
          // API 에서 cpState를 받아올 수 없음 기준일로 판단
          o.cpState = (parseFloat(DateHelper.getCurrentShortDate(DateHelper.getNextMonth())) > parseFloat(plainApply)) ? 'A0' : 'A1';
          o.blockState = MYT_FARE_HISTORY_MICRO_BLOCK_TYPE[o.cpState];
          // o.isBlock = (o.cpState === 'A0' || o.cpState === 'A1'); 
        });
      } else {
        data.cpHistories = [];
      }
      
      res.render('billsmall/myt-fare.bill.small.block.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo,
        totalCnt: data.payHistoryCnt,
        data: Object.assign(data, {
          noticeInfo: this.getTipInfo()
        })
      });
    });
    
  }

  /**
   * @desc 꼭 확인해주세요 TIP 정리
   * @prop {string} link 팁 클래스
   * @prop {string} view 팁 아이디
   * @prop {srting} title 문구
   * @returns {TipInfo[]}
   */
  private getTipInfo(): TipInfo[] {
    return [
      {link: 'MF_06_01_02_tip_01', view: 'M000271', title: '차단내역 안내'},
      {link: 'MF_06_01_02_tip_02', view: 'M000271', title: '차단/해제 적용 기준'},
      {link: 'MF_06_01_02_tip_03', view: 'M000271', title: '특정 콘텐츠 차단/해제 안내'}
    ];
  }
}

export default MyTFareBillSmallHistoryDetail;
