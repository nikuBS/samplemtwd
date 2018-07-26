import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import MyTUsageTDataShareData from '../../../../mock/server/myt.usage.tdata-share';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { UNIT } from '../../../../types/bff-common.type';

class MyTUsageTDataShare extends TwViewController {
  constructor() {
    super();
  }

  private parseData(req: any): any {
    if ( !FormatHelper.isEmpty(req.freePlan) ) {
      req.freePlan.map((free) => {
        free.isUnlimit = !isFinite(free.total);
        free.usedRatio = 100;
        free.showUsed = FormatHelper.convDataFormat(free.used, UNIT[free.unit]);
        if ( !free.isUnlimit ) {
          free.showTotal = FormatHelper.convDataFormat(free.total, UNIT[free.unit]);
          free.showRemained = FormatHelper.convDataFormat(free.remained, UNIT[free.unit]);
          free.remainRatio = free.remained / free.total * 100;
        }
      });
      // 기획쪽 기본 제공 데이터 멀티 노출 여부 확인 중으로 기본 데이터 첫번째만 노출
      req.freePlan = [req.freePlan[0]];
      if ( req.dataSharingSvc ) {
        req.childUSimCount = req.dataSharingSvc.childList.length;
      }
    }

    return req;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let result = this.parseData(MyTUsageTDataShareData.result);
    this.apiService.request(API_CMD.BFF_05_0005, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        result = this.parseData(resp.result);
      }
      const data = {
        result,       // mock data
        svcInfo: svcInfo,
        remainDate: DateHelper.getRemainDate(),
        url: {
          tDataShareClose: '/myt/usage/tdatashare/close',
          realTimeFeeCheck: '#',
          myUsagePattern: '#'
        }
      };

      res.render('usage/myt.usage.tdata-share_0725.html', data);
    });
  }
}

export default MyTUsageTDataShare;
