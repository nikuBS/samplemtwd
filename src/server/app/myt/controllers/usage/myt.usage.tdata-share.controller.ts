import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import MyTUsageTDataShareData from '../../../../mock/server/myt.usage.tdata-share';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT } from '../../../../types/bff-common.type';

import { API_CMD } from '../../../../types/api-command.type';
import { SVC_CD } from '../../../../types/bff-common.type';
import { DAY_BTN_STANDARD_SKIP_ID } from '../../../../types/bff-common.type';

import url from 'url';

class MyTUsageTDataShare extends TwViewController {

  constructor() {
    super();
  }

  private parseData(req: any): any {
      req.childUSimCount = req.dataSharingSvc.childList.length;
      // 기획쪽 기본 제공 데이터 멀티 노출 여부 확인 중으로 기본 데이터 첫번째만 노출
      req.parentPlan = req.freePlan[0];

    return req;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const result = this.parseData(MyTUsageTDataShareData.result);

    const data = {
      result,       // mock data
      svcInfo: svcInfo,
      remainDate: DateHelper.getRemainDate(),
      url: {
        tDataShareClose: `/myt/usage/tdatashare/close${url.parse(req.url).search}`,
        realTimeFeeCheck: '#',
        myUsagePattern: '#'
      }
    };

    res.render('usage/myt.usage.tdata-share.html', data);
  }
}

export default MyTUsageTDataShare;
