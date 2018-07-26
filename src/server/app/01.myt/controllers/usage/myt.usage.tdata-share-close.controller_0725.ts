import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import MyTUsageTDataShareData from '../../../../mock/server/myt.usage.tdata-share';
import DateHelper from '../../../../utils/date.helper';

class MyTUsageTDataShareClose extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const childNum = req.query.child;

    let result = MyTUsageTDataShareData.result.dataSharingSvc.childList[childNum];
    this.apiService.request(API_CMD.BFF_05_0005, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        result = resp.result.result.dataSharingSvc.childList[childNum];
      }
      const data = {
        result,       // mock data
        date: DateHelper.getShortDateNoDot(new Date()),
        svcInfo: svcInfo,
        url : {
          onLineQnA : '#',
          customerCenter : '#'
        }
      };

      res.render('usage/myt.usage.tdata-share-close.html', data);
    });
  }
}

export default MyTUsageTDataShareClose;
