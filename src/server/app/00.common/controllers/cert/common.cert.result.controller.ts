/**
 * FileName: common.cert.result.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

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
    enum TYPE {
      NICE = 'nice',
      IPIN = 'ipin'
    }

    enum KIND {
      SECOND = 'second',
      REFUND = 'refund'
    }

    if ( certType === TYPE.IPIN ) {
      // IPIN
      if ( certKind === KIND.SECOND ) {
        this.sendResult(req, res, API_CMD.BFF_01_0023, { enc_data: req.body.enc_data });
      } else if ( certKind === KIND.REFUND ) {
        this.sendResult(req, res, API_CMD.BFF_01_0048, { enc_data: req.body.enc_data });
      } else {
        // error
      }
    } else if ( certType === TYPE.NICE ) {
      // NICE
      if ( certKind === KIND.SECOND ) {
        this.sendResult(req, res, API_CMD.BFF_01_0023, { encodeData: req.body.encodeData });
      } else if ( certKind === KIND.REFUND ) {
        this.sendResult(req, res, API_CMD.BFF_01_0050, { encodeData: req.body.encodeData });
      } else {

      }
    } else {
      // error
    }
  }

  private sendResult(req, res, command, params) {
    this.apiService.request(command, params).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.redirect('/common/cert/complete');
      } else {
        // error
      }
    });
  }
}

export default CommonCertResult;
