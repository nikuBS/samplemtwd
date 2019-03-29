/**
 * FileName: membership.my.update.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

export default class MembershipMyUpdate extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_11_0007, {}).subscribe((resp) => {
      let myInfoData = {};

      if ( resp.code === API_CODE.CODE_00 ) {
        myInfoData = this.parseMyInfoData(resp.result);
      } else {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      res.render('my/membership.my.update.html', {
        myInfoData: myInfoData,
        svcInfo: svcInfo,
        pageInfo: pageInfo
      });
    });
  }

  private parseMyInfoData(myInfoData): any {
    myInfoData.smsAgreeChecked = myInfoData.smsAgreeYn === 'Y' ? 'checked' : '' ;
    myInfoData.sktNewsChecked = myInfoData.sktNewsYn === 'Y' ? 'checked' : '' ;
    myInfoData.sktTmChecked = myInfoData.sktTmYn === 'Y' ? 'checked' : '' ;
    myInfoData.mktgAgreeChecked = myInfoData.mktgAgreeYn === 'Y' ? 'checked' : '' ;
    myInfoData.ocbAccumAgreeChecked = myInfoData.ocbAccumAgreeYn === 'Y' ? 'checked' : '' ;
    delete myInfoData.mbr_rcv_agree_ymd;
    //this.logger.info(this, '[★★★★★★] => ', JSON.stringify(myInfoData));
    //this.logger.info(this, '[★★★★★★] => ', myInfoData.mbr_rcv_agree_ymd);
    myInfoData.showMbrAgreeDate = DateHelper.getFullKoreanDate(''); // 개인정보 수집/이용 동의 날짜


    return myInfoData;
  }
}
