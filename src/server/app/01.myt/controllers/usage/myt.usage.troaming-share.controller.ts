import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT, USER_CNT } from '../../../../types/string.type';
import MyTUsage from './myt.usage.controller';
import MyTUsageGraphbox from './myt.usage.graphbox.controller';
import { UNIT, UNIT_E } from '../../../../types/bff-common.type';
import DateHelper from '../../../../utils/date.helper';
import moment = require('moment');

class MyTUsageTRoamingShare extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0003, {}).subscribe((resp) => {
      console.log(resp);
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('usage/myt.usage.troaming-share.html', {
          usageData: this.parseData(resp.result),
          svcInfo
        });
      }
    });
    // const result = this.getResult({
    //   code: '00',
    //   msg: '결과메세지',
    //   result: {
    //     dispRemainDay: '200',
    //     roamProdNm: 'T로밍 함께쓰기 3GB1',
    //     dataSharing: {
    //       data: {
    //         total: '3000000',
    //         remained: '1000000',
    //         used: '2000000'
    //       },
    //       childList: [{
    //         role: 'Y',
    //         custNm: '홍*동1',
    //         svcNum: '010-45**-12**',
    //         used: '1000'
    //       }, {
    //         role: 'N',
    //         custNm: '홍*동2',
    //         svcNum: '010-45**-12**',
    //         used: '2000'
    //       }, {
    //         role: 'N',
    //         custNm: '홍*동3',
    //         svcNum: '010-45**-12**',
    //         used: '3000'
    //       }]
    //     }
    //   }
    // });
    // res.render('usage/myt.usage.troaming-share.html', {
    //   usageData: this.parseData(result),
    //   svcInfo
    // });
  }

  private parseData(result: any): any {
    const childList = result.dataSharing.childList;
    result.dataSharing.data.unit = UNIT_E.DATA;
    MyTUsageGraphbox.convShowData(result.dataSharing.data);
    result.korLengStr = (childList.length < 6) ? USER_CNT[childList.length - 1] : childList.length;
    result.showRemainDay = this.getShowRemainDay(result.dispRemainDay);
    result.showChildList = this.getShowChildList(childList);
    result.showTotalUsed = this.getTotalUsed(result.showChildList);
    if ( result.showTotalUsed.unit !== DATA_UNIT.KB ) {
      result.showTotalUsedSub = this.getSubData(result.showTotalUsed);
    }
    return result;
  }

  // private getResult(resp: any): any {
  //   if ( resp.code === API_CODE.CODE_00 ) {
  //     return resp.result;
  //   }
  //   return resp;
  // }

  private getShowRemainDay(min: string): any {
    const endDate = moment().add(min, 'minutes');
    const diffDuration = DateHelper.getDiffDuration(endDate);
    return {
      days: diffDuration.days(),
      hours: diffDuration.hours(),
      minutes: diffDuration.minutes()
    };
  }

  private getShowChildList(childList: any): any {
    // 자회선인데 모회선 포함 전체데이터가 다 내려오는 경우에는 처리가 필요함.
    childList.map((child) => {
      child.role = (child.role === 'Y') ? '대표회선' : '자회선';
      child.showUsed = FormatHelper.convDataFormat(child.used, DATA_UNIT.KB);
    });
    return childList;
  }

  private getTotalUsed(childList: any): string {
    let totalUsed = 0;
    childList.map((child) => {
      totalUsed += parseInt(child.used, 10);
    });
    return FormatHelper.convDataFormat(String(totalUsed), DATA_UNIT.KB);
  }


  private getSubData(data: any): any {
    const subData = {
      data: FormatHelper.convNumFormat(data.data.replace(/,/gi, '') * 1024)
    };
    switch ( data.unit ) {
      case DATA_UNIT.GB:
        subData['unit'] = DATA_UNIT.MB;
        break;
      case DATA_UNIT.MB:
        subData['unit'] = DATA_UNIT.KB;
        break;
    }
    return subData;
  }

}

export default MyTUsageTRoamingShare;
