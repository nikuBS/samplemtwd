/**
 * FileName: myt.benefit.discount.main.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

class MytBenefitDisCntMainController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      empty: false
    };
    Observable.combineLatest(
      this._getBundleProduct(),
      this._getFeeContract(),
      this._getSubFundContract(),
      this._getSelDiscount(),
      this._getLongTerm(),
      this._getWelfareCustomer()
    ).subscribe(([bundlePrdc, feeCotc, fundCotc, selDisCnt, longterm, welfareCutm]) => {
      if ( !bundlePrdc && !feeCotc && !fundCotc && !selDisCnt && !longterm && !welfareCutm ) {
        data.empty = true;
      }
      data.bundlePrdc = bundlePrdc;
      data.feeCotc = feeCotc;
      data.fundCotc = fundCotc;
      data.selDisCnt = selDisCnt;
      data.longterm = longterm;
      data.welfareCutm = welfareCutm;

      res.render('benefit/myt.benefit.discount.main.html', { data });
    });
  }

  _getBundleProduct(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0094, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        } else {
          if ( !resp.result['comYn'] || resp.result['comYn'] === 'N' ) {
            // SKT 결합 상품은 없는 경우에도 성공, comYn 값 여부로 대상/비대상 설정
            return null;
          } else {
            return resp.result;
          }
        }
      } else {
        return null;
      }
    });
  }

  _getFeeContract(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0106, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        } else {
          return resp.result;
        }
      } else {
        return null;
      }
    });
  }

  _getSubFundContract(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0107, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        } else {
          return resp.result;
        }
      } else {
        return null;
      }
    });
  }

  _getSelDiscount(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0108, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        } else {
          return resp.result;
        }
      } else {
        return null;
      }
    });
  }

  _getLongTerm(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0110, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        } else {
          return resp.result;
        }
      } else {
        return null;
      }
    });
  }

  _getWelfareCustomer(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0111, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        } else {
          if ( !resp.result['useYn'] || resp.result['useYn'] === 'N' ) {
            // useYn 값 여부로 대상/비대상 설정
            return null;
          } else {
            return resp.result;
          }
        }
      } else {
        return null;
      }
    });
  }

}

export default MytBenefitDisCntMainController;
