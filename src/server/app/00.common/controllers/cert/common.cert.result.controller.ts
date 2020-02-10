/**
 * @file common.cert.result.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.29
 * @desc Common > 인증 > IPIN/NICE 결과 처리
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { AUTH_CERTIFICATION_KIND, NICE_TYPE, AUTH_CERTIFICATION_METHOD } from '../../../../types/bff.type';
import { NODE_API_ERROR } from '../../../../types/string.type';

/**
 * @desc IPIN/NICE 결과 처리를 위한 class
 */
class CommonCertResult extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > 인증 > IPIN/NICE 인증 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const certType = req.query.type;
    const certKind = req.query.kind;

    this.checkCertKind(req, res, certType, certKind, pageInfo);
  }

  /**
   * IPIN / NICE 인증 분기 처리
   * @param req
   * @param res
   * @param certType
   * @param certKind
   * @param pageInfo
   */
  private checkCertKind(req, res, certType, certKind, pageInfo) {

    this.logger.debug(this, 'req.method ====>', req.method);
    this.logger.debug(this, 'req.query ====>', req.query);
    this.logger.debug(this, 'req.body ====>', req.body);
    
    if ( certType === NICE_TYPE.IPIN ) {
      const encData = req.method === 'POST' ? req.body.enc_data : req.query.enc_data;
      this.logger.debug(this, 'encData ====>', encData);
      if ( certKind === AUTH_CERTIFICATION_KIND.F ) {
        this.sendResult(req, res, API_CMD.BFF_01_0048, { enc_data: encData }, pageInfo);
      } else {
        this.sendResult(req, res, API_CMD.BFF_01_0023, { enc_data: encData }, pageInfo);
      }
    } else if ( certType === NICE_TYPE.NICE ) {
      const encodeData = req.method === 'POST' ? req.body.EncodeData : req.query.EncodeData;
      this.logger.debug(this, 'encodeData ====>', encodeData);
      if ( certKind === AUTH_CERTIFICATION_KIND.F ) {
        this.sendResult(req, res, API_CMD.BFF_01_0050, { EncodeData: encodeData }, pageInfo);
      } else {
        this.sendResult(req, res, API_CMD.BFF_01_0025, { EncodeData: encodeData }, pageInfo);
      }
    } else {
      res.render('cert/common.cert.result.html', {
        target: AUTH_CERTIFICATION_METHOD.IPIN,
        code: API_CODE.NODE_1002,
        msg: NODE_API_ERROR[API_CODE.NODE_1002] + `(type: ${certType})`
      });
    }
  }

  /**
   * IPIN / NICE 인증 API 요청 및 응답 처리
   * @param req
   * @param res
   * @param command
   * @param params
   * @param pageInfo
   */
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
