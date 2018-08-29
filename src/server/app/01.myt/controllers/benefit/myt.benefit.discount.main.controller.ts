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

class MyTBenefitDisCntMain extends TwViewController {

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
          if ( resp.result['combYn'] && resp.result['combYn'] === 'Y' ) {
            // SKT 결합 상품은 없는 경우에도 성공, comYn 값 여부로 대상/비대상 설정
            return resp.result;
          } else {
            return null;
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
          if ( resp.result['tfeeAgrmtYn'] && resp.result['tfeeAgrmtYn'] === 'Y' ) {
            // tfeeAgrmtYn(휴대폰요금약정여부) 값 여부로 대상/비대상 설정
            return resp.result;
          } else {
            return null;
          }
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
          if ( resp.result['tsuprtAgrmtYn'] && resp.result['tsuprtAgrmtYn'] === 'Y' ) {
            // tsuprtAgrmtYn(T 지원금 약정 여부) 값 여부로 대상/비대상 설정
            return resp.result;
          } else {
            return null;
          }
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
          if ( resp.result['selAgrmtDc25Yn'] === 'Y' || resp.result['selAgrmtDc20Yn'] === 'Y' ) {
            return resp.result;
          } else {
            // 선택약정 25%, 20% 둘다 없는 경우 비대상
            return null;
          }
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
          if ( resp.result['useYn'] && resp.result['useYn'] === 'Y' ) {
            // longInfoSt 값은 보지 않고 useYn으로 비교
            return resp.result;
          } else {
            // useYn(장기가입여부판단) 값 여부로 대상/비대상 설정
            return null;
          }
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
          if ( resp.result['useYn'] && resp.result['useYn'] === 'Y' ) {
            return resp.result;
          } else {
            // useYn(복지고객할인대상자판단) 값 여부로 대상/비대상 설정
            return null;
          }
        }
      } else {
        return null;
      }
    });
  }

}

export default MyTBenefitDisCntMain;
