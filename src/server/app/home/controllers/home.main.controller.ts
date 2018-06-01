import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
import myTUsageData from '../../../mock/myt.usage';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { UNIT } from '../../../types/bff-common.type';

class HomeMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // this.apiService.request(API_CMD.FAKE_GET, { postId: 1 })
    //   .subscribe((data) => {
    //     console.log('subscribe', data);
    //   }, (err) => {
    //     console.log('error', err);
    //   }, () => {
    //     console.log('complete');
    //   });

    const remainDate = DateHelper.getRemainDate();
    this.apiService.request(API_CMD.SESSION_CHECK, {})
      .subscribe((resp) => {
        console.log(resp);
      });

    const usageData = this.parseData(myTUsageData.result);
    res.render('home.main.html', {
      usageData,
      svcInfo,
      remainDate
    });
    // this.apiService.request(API_CMD.BFF_05_0001, {})
    //   .subscribe((resp) => {
    //     console.log(resp);
    //     // console.log(myTUsageData);
    //     res.render('home.main.html', myTUsageData);
    //   });
    // res.render(__dirname + '../views/containers/home.html');
  }

  private parseData(usageData: any): any {
    usageData.data.map((data) => {
      data.isUnlimit = !isFinite(data.total);
      data.usedRatio = 100;
      if ( !data.isUnlimit ) {
        data.showTotal = FormatHelper.convDataFormat(data.total, UNIT[data.unit]);
        data.showUsed = FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
        data.showRemained = FormatHelper.convDataFormat(data.remained, UNIT[data.unit]);
        data.usedRatio = data.remained / data.total * 100;
      }
    });

    usageData.voice.map((voice) => {
      voice.isUnlimit = !isFinite(voice.total);
      voice.usedRatio = 100;
      if ( !voice.isUnlimit ) {
        voice.showTotal = FormatHelper.convVoiceFormat(voice.total);
        voice.showUsed = FormatHelper.convVoiceFormat(voice.used);
        voice.showRemained = FormatHelper.convVoiceFormat(voice.remained);
        voice.usedRatio = voice.remained / voice.total * 100;
      }
    });

    return usageData;
  }

}

export default HomeMain;
