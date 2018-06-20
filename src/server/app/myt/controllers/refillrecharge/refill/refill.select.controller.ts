import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import MyTUsage from '../../usage/myt.usage.controller';
import {LINE_NAME, REFILL_CLASS_NAME, REFILL_CODE, REFILL_TXT} from '../../../../../types/bff-common.type';
import FormatHelper from '../../../../../utils/format.helper';

class MyTRefillSelect extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getLineList(),
      this.getusageData()
    ).subscribe(([lineList, usageData]) => {
      this.myTUsage.renderView(res, 'refillrecharge/refill/refill.select.html', this.getData(lineList, usageData));
    });
  }

  private getLineList(): any {
    return this.apiService.request(API_CMD.BFF_03_0003, { svcCtg: LINE_NAME.MOBILE });
  }

  private getusageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if (resp.code === API_CODE.CODE_00) {
      usageData = this.parseData(resp.result.option);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseData(usageData: any): any {
    if (!FormatHelper.isEmpty(usageData)) {
      usageData.map((data) => {
        data.text = REFILL_TXT[data.dataVoiceClCd];
        data.className = 'ico ico-' + REFILL_CLASS_NAME[data.dataVoiceClCd];
      });
    }
    return usageData;
  }

  private getData(lineList: any, usageData: any): any {
    return {
      lineList: lineList.result,
      usageData
    };
  }
}

export default MyTRefillSelect;
