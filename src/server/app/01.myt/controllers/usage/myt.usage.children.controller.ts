/**
 * FileName: myt.usage.children.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';
import { MYT_VIEW } from '../../../../types/string.type';
import MyTUsage from './myt.usage.controller';

class MyTUsageChildren extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0010, {})
      .subscribe((response) => {
        if ( response.code === API_CODE.CODE_00 ) {
          const children = response.result;
          if (children.length > 0) {
            let selectedChild;
            if (req.query.childSvcMgmtNum) {
              selectedChild = children.find(function(child) {
                return child.svcMgmtNum === req.query.childSvcMgmtNum;
              });
            } else {
              selectedChild = children[0];
            }
            Observable.combineLatest(
              this.apiService.request(API_CMD.BFF_05_0001, {
                childSvcMgmtNum: selectedChild.svcMgmtNum
              })
            ).subscribe(([usageData]) => {
              if ( usageData.code === API_CODE.CODE_00 ) {
                const fomattedData = this.myTUsage.parseUsageData(usageData.result, svcInfo);
                const options = {
                  svcInfo,
                  usageData: fomattedData,
                  remainDate: DateHelper.getRemainDate(),
                  selectedChild,
                  isOnlyChild: children.length === 1
                };
                res.render('usage/myt.usage.children.html', options);
              } else {
                res.render(MYT_VIEW.ERROR, { usageData: usageData, svcInfo: svcInfo });
              }
            });
          }
        }
      });
  }
}

export default MyTUsageChildren;
