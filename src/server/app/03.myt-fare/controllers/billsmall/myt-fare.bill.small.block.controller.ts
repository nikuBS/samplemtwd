/**
 * FileName: myt-fare.bill.small.block.controller.ts
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 12. 2
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import bill_guide_BFF_05_0093 from '../../../../mock/server/bill.guide.BFF_05_0093.mock';
import DateHelper from '../../../../utils/date.helper';
import { MYT_FARE_HISTORY_MICRO_BLOCK_TYPE } from '../../../../types/bff.type';

interface Info {
  [key: string]: string;
}

interface Result {
  [key: string]: string;
}

class MyTFareBillSmallHistoryDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0093, {}).subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
      // const mockData = bill_guide_BFF_05_0093;
      const data: Result | any = resp.result; // || mockData.result;

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
          noticeInfo: this.getNoticeInfo()
        })
      });
    });
    
  }

  // 꼭 확인해 주세요 팁 메뉴 정리
  private getNoticeInfo(): Info[] {
    return [
      {link: 'MF_06_01_02_tip_01', view: 'M000271', title: '차단내역 안내'},
      {link: 'MF_06_01_02_tip_02', view: 'M000271', title: '차단/해제 적용 기준'},
      {link: 'MF_06_01_02_tip_03', view: 'M000271', title: '특정 콘텐츠 차단/해제 안내'}
    ];
  }
}

export default MyTFareBillSmallHistoryDetail;
