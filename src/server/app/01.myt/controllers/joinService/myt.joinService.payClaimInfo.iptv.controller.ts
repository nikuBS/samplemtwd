/**
 * FileName: myt.joinService.payClaimInfo.iptv.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';


class MytJoinServicePayClaimInfoIptv extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;//쿼리스트링
  private _svcInfo: any;

  //공통데이터
  private _commDataInfo: any = {};

  //노출조건
  private _showConditionInfo: any = {};

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] 사용자 정보 : ', svcInfo);
    this.reqQuery = req.query;


  }//render end

}

export default MytJoinServicePayClaimInfoIptv;

