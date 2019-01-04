/**
 * FileName: common.cert.result.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { AUTH_CERTIFICATION_KIND, NICE_TYPE, AUTH_CERTIFICATION_METHOD } from '../../../../types/bff.type';

class CommonCertResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const certType = req.query.type;
    const certKind = req.query.kind;

    this.checkCertKind(req, res, certType, certKind);
  }

  private checkCertKind(req, res, certType, certKind) {

    if ( certType === NICE_TYPE.IPIN ) {
      if ( certKind === AUTH_CERTIFICATION_KIND.F ) {
        this.sendResult(req, res, API_CMD.BFF_01_0048, { enc_data: req.body.enc_data });
      } else {
        this.sendResult(req, res, API_CMD.BFF_01_0023, { enc_data: req.body.enc_data });
      }
    } else if ( certType === NICE_TYPE.NICE ) {
      if ( certKind === AUTH_CERTIFICATION_KIND.F ) {
        this.sendResult(req, res, API_CMD.BFF_01_0050, { EncodeData: req.body.encodeData });
      } else {
        this.sendResult(req, res, API_CMD.BFF_01_0025, { encodeData: req.body.encodeData });
      }
    } else {
      // error
    }
  }

  private sendResult(req, res, command, params) {
    this.apiService.request(command, params).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.redirect('/common/cert/complete?target=' + AUTH_CERTIFICATION_METHOD.IPIN);
      } else {
        // error
      }
    });
  }
}

export default CommonCertResult;
