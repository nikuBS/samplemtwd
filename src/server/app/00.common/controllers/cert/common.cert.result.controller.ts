/**
 * FileName: common.cert.result.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { AUTH_CERTIFICATION_KIND, NICE_TYPE, AUTH_CERTIFICATION_METHOD } from '../../../../types/bff.type';
import { NODE_API_ERROR } from '../../../../types/string.type';

class CommonCertResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const certType = req.query.type;
    const certKind = req.query.kind;

    this.checkCertKind(req, res, certType, certKind, pageInfo);
  }

  private checkCertKind(req, res, certType, certKind, pageInfo) {
    if ( certType === NICE_TYPE.IPIN ) {
      if ( certKind === AUTH_CERTIFICATION_KIND.F ) {
        this.sendResult(req, res, API_CMD.BFF_01_0048, { enc_data: req.body.enc_data }, pageInfo);
      } else {
        this.sendResult(req, res, API_CMD.BFF_01_0023, { enc_data: req.body.enc_data }, pageInfo);
      }
    } else if ( certType === NICE_TYPE.NICE ) {
      if ( certKind === AUTH_CERTIFICATION_KIND.F ) {
        this.sendResult(req, res, API_CMD.BFF_01_0050, { EncodeData: req.body.EncodeData }, pageInfo);
      } else {
        this.sendResult(req, res, API_CMD.BFF_01_0025, { EncodeData: req.body.EncodeData }, pageInfo);
      }
    } else {
      res.render('cert/common.cert.result.html', {
        target: AUTH_CERTIFICATION_METHOD.IPIN,
        code: API_CODE.NODE_1002,
        msg: NODE_API_ERROR[API_CODE.NODE_1002] + `(type: ${certType})`
      });
    }
  }

  private sendResult(req, res, command, params, pageInfo) {
    this.apiService.request(command, params).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.result.html', {
          pageInfo,
          target: AUTH_CERTIFICATION_METHOD.IPIN,
          code: resp.code,
          msg: resp.msg
        });
      } else {
        res.render('cert/common.cert.result.html', {
          pageInfo,
          target: AUTH_CERTIFICATION_METHOD.IPIN,
          code: resp.code,
          msg: resp.msg
        });
      }
    });
  }
}

export default CommonCertResult;
