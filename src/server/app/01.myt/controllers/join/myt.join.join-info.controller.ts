/**
 * FileName: myt.join.join-info.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {DATE_FORMAT} from '../../../../types/string.type';
import {Info, History} from '../../../..//mock/server/join.info.mock';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';

class MytJoinJoinInfoController extends TwViewController {
  constructor() {
    super();
  }

  // 휴대폰 / T Login / T Pocket-FI 정보 세팅
  private getMobileResult(data: any): any {

    const history = History.result[History.result.length - 1];
    let _chgDt = history.chgDt;
    _chgDt = _chgDt.replace(/\*/g, '1');
    _chgDt = DateHelper.getShortDateWithFormat(_chgDt, DATE_FORMAT.YYYYMMDD_TYPE_0);
    _chgDt = _chgDt.replace(/1/g, '*');
    data = Object.assign(data, {
      chgDt : _chgDt,
      chgCd : history.chgCd
    });
    data.apprAmt = FormatHelper.addComma(data.apprAmt); // 휴대폰 일때 세팅

    return data;
  }

  private getData(svcInfo: any, data: any): any {
    // 약정 할인 및 단말.. 버튼 노출 여부
    data.isContract = (svcInfo.svcAttrCd === 'M1' && data.isRsvYn === 'N') || svcInfo.svcGr === 'S' || svcInfo.svcGr === 'O' ?  true : false;
    return {
      svcInfo,
      data : data
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data = this.getMobileResult( Info.mobile.result );
    res.render( 'join/myt.join.join-info.html', this.getData(svcInfo, data) );
  }

  private getResult(data: any, svcInfo: any): any {
    return data;
  }
}

export default MytJoinJoinInfoController;
