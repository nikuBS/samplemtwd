/**
 * FileName: myt.benefit.discount.detail.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MytBenefitDisCntDetailController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data = {
      svcInfo: svcInfo
    };
    if ( req && req.query ) {
      switch ( req.query.type ) {
        case 'prdc':
          this._getBundleProduct(data, res);
          break;
        case 'fee':
          this._getFeeContract(data, res);
          break;
        case 'fund':
          this._getSubFundContract(data, res);
          break;
        case 'dis':
          this._getSelDiscount(data, res);
          break;
        case 'long':
          this._getLongTerm(data, res);
          break;
        case 'welf':
          this._getWelfareCustomer(data, res);
          break;
      }
    }
  }

  _getBundleProduct(data, res) {
    this.apiService.request(API_CMD.BFF_05_0094, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          data = Object.assign({}, data);
        } else {
          data = Object.assign(resp.result, data);
        }
      } else {
        this.logger.warn(this, 'BundleProduct: ', JSON.stringify(resp));
      }
      res.render('benefit/myt.benefit.discount.detail-prdc.html', { data });
    });
  }

  _getFeeContract(data, res) {
    this.apiService.request(API_CMD.BFF_05_0106, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          data = Object.assign({}, data);
        } else {
          data = Object.assign(resp.result, data);
        }
      } else {
        this.logger.warn(this, 'FeeContract: ', JSON.stringify(resp));
      }
      res.render('benefit/myt.benefit.discount.detail-fee.html', { data });
    });
  }

  _getSubFundContract(data, res) {
    this.apiService.request(API_CMD.BFF_05_0107, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          data = Object.assign({}, data);
        } else {
          data = Object.assign(resp.result, data);
        }
      } else {
        this.logger.warn(this, 'FundContract: ', JSON.stringify(resp));
      }
      res.render('benefit/myt.benefit.discount.detail-fund.html', { data });
    });
  }

  _getSelDiscount(data, res) {
    this.apiService.request(API_CMD.BFF_05_0108, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          data = Object.assign({}, data);
        } else {
          data = Object.assign(resp.result, data);
        }
      } else {
        this.logger.warn(this, 'SelDiscount: ', JSON.stringify(resp));
      }
      res.render('benefit/myt.benefit.discount.detail-dis.html', { data });
    });
  }

  _getLongTerm(data, res) {
    this.apiService.request(API_CMD.BFF_05_0110, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          data = Object.assign({}, data);
        } else {
          data = Object.assign(resp.result, data);
        }
      } else {
        this.logger.warn(this, 'LongTerm: ', JSON.stringify(resp));
      }
      res.render('benefit/myt.benefit.discount.detail-long.html', { data });
    });
  }

  _getWelfareCustomer(data, res) {
    this.apiService.request(API_CMD.BFF_05_0111, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          data = Object.assign({}, data);
        } else {
          data = Object.assign(resp.result, data);
        }
      } else {
        this.logger.warn(this, 'WelfareCustomer: ', JSON.stringify(resp));
      }
      res.render('benefit/myt.benefit.discount.detail-welf.html', { data });
    });
  }

}

export default MytBenefitDisCntDetailController;
